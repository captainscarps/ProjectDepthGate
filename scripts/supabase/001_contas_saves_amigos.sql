-- ════════════════════════════════════════════════════════════════════════════════════════════════
-- DEPTHGATE · 001 — contas, saves na nuvem, amigos, vitrine dos heróis (ecos) e saudações
-- Colar inteiro no Supabase → SQL Editor → Run. Pode rodar de novo sem estragar nada (idempotente).
--
-- O que faz:
--   1. Fecha a falha do login antigo: a tabela "profiles" deixa de ser lida/escrita pela chave pública
--      e a coluna com o resumo das senhas (password_hash) é APAGADA.
--   2. Cria as tabelas novas (prefixo dg_), todas com RLS (cada jogador só mexe no que é dele):
--        dg_profiles     nome único, código de amigo, avatar
--        dg_saves        cada save do jogo (campanha, infinito, refúgio, configurações) por jogador
--        dg_friendships  pedidos de amizade (pendente → aceito / bloqueado)
--        dg_showcases    vitrine do herói (classe, nível, equipamento, recorde) — só amigos leem
--        dg_greetings    saudação diária entre amigos (vale fragmentos para quem recebe)
--   3. Funções seguras (RPC) para buscar jogador por código/nome, pedir amizade e listar amigos.
--   4. Liga a pontuação do ranking à conta (coluna user_id em "scores"), sem mudar o que já existe.
-- ════════════════════════════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── 1. login antigo: trancar e apagar os resumos de senha ────────────────────────────────────────
do $$
declare r record;
begin
  if to_regclass('public.profiles') is not null then
    execute 'alter table public.profiles enable row level security';
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles' loop
      execute format('drop policy %I on public.profiles', r.policyname);
    end loop;
    execute 'revoke all on public.profiles from anon, authenticated';
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'profiles' and column_name = 'password_hash') then
      execute 'alter table public.profiles drop column password_hash';
    end if;
  end if;
end $$;

-- ── utilitário: updated_at automático ───────────────────────────────────────────────────────────
create or replace function public.dg_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

-- ── 2a. perfis ──────────────────────────────────────────────────────────────────────────────────
create table if not exists public.dg_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null,
  username_lc  text generated always as (lower(username)) stored,
  friend_code  text not null default upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6)),
  avatar_hero  text not null default 'warrior',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint dg_profiles_username_len   check (char_length(username) between 3 and 16),
  constraint dg_profiles_username_chars check (username ~ '^[A-Za-zÀ-ÿ0-9_. -]+$'),
  constraint dg_profiles_avatar_len     check (char_length(avatar_hero) <= 24)
);
create unique index if not exists dg_profiles_username_uq on public.dg_profiles (username_lc);
create unique index if not exists dg_profiles_code_uq     on public.dg_profiles (friend_code);
drop trigger if exists dg_profiles_touch on public.dg_profiles;
create trigger dg_profiles_touch before update on public.dg_profiles for each row execute function public.dg_touch();

-- ── 2b. saves ───────────────────────────────────────────────────────────────────────────────────
create table if not exists public.dg_saves (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key        text not null,                       -- a mesma chave do localStorage (ex.: dungeon-crawler:save:e2)
  data       jsonb not null,
  rev        bigint not null default 1,           -- sobe a cada envio; serve para detectar conflito
  device     text,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  constraint dg_saves_key_len  check (char_length(key) <= 96),
  constraint dg_saves_data_len check (pg_column_size(data) < 2000000)
);
drop trigger if exists dg_saves_touch on public.dg_saves;
create trigger dg_saves_touch before update on public.dg_saves for each row execute function public.dg_touch();

-- ── 2c. amizades ────────────────────────────────────────────────────────────────────────────────
create table if not exists public.dg_friendships (
  requester  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  addressee  uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (requester, addressee),
  constraint dg_friend_not_self check (requester <> addressee),
  constraint dg_friend_status   check (status in ('pending', 'accepted', 'blocked'))
);
-- um par só (A→B e B→A não convivem)
create unique index if not exists dg_friend_pair_uq on public.dg_friendships (least(requester, addressee), greatest(requester, addressee));
drop trigger if exists dg_friend_touch on public.dg_friendships;
create trigger dg_friend_touch before update on public.dg_friendships for each row execute function public.dg_touch();

create or replace function public.dg_is_friend(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from dg_friendships f
    where f.status = 'accepted'
      and ((f.requester = auth.uid() and f.addressee = other) or (f.addressee = auth.uid() and f.requester = other)));
$$;

-- ── 2d. vitrine do herói (o que vira "eco" no Refúgio dos amigos) ───────────────────────────────
create table if not exists public.dg_showcases (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  slot       int  not null default 1,
  class_id   text not null,
  level      int  not null default 1,
  max_depth  int  not null default 0,
  score      bigint not null default 0,
  equipment  jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot),
  constraint dg_show_class_len check (char_length(class_id) <= 24),
  constraint dg_show_eq_len    check (pg_column_size(equipment) < 20000),
  constraint dg_show_slot      check (slot between 1 and 9)
);
drop trigger if exists dg_show_touch on public.dg_showcases;
create trigger dg_show_touch before update on public.dg_showcases for each row execute function public.dg_touch();

-- ── 2e. saudações ───────────────────────────────────────────────────────────────────────────────
create table if not exists public.dg_greetings (
  id         bigserial primary key,
  from_user  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  day        date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  claimed    boolean not null default false,
  created_at timestamptz not null default now(),
  constraint dg_greet_not_self check (from_user <> to_user),
  constraint dg_greet_once     unique (from_user, to_user, day)
);

-- ── RLS ─────────────────────────────────────────────────────────────────────────────────────────
alter table public.dg_profiles    enable row level security;
alter table public.dg_saves       enable row level security;
alter table public.dg_friendships enable row level security;
alter table public.dg_showcases   enable row level security;
alter table public.dg_greetings   enable row level security;

do $$
declare t text; r record;
begin
  foreach t in array array['dg_profiles','dg_saves','dg_friendships','dg_showcases','dg_greetings'] loop
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', r.policyname, t);
    end loop;
  end loop;
end $$;

-- perfis: cada um lê o próprio e o dos amigos/pedidos; busca de estranhos só pela função dg_find_player
create policy dg_profiles_sel on public.dg_profiles for select to authenticated
  using (id = auth.uid() or exists (select 1 from public.dg_friendships f
         where (f.requester = auth.uid() and f.addressee = dg_profiles.id) or (f.addressee = auth.uid() and f.requester = dg_profiles.id)));
create policy dg_profiles_ins on public.dg_profiles for insert to authenticated with check (id = auth.uid());
create policy dg_profiles_upd on public.dg_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- saves: só o dono
create policy dg_saves_all on public.dg_saves for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- amizades: os dois lados veem; só quem pede cria (pendente); só quem recebe aceita/bloqueia; qualquer lado desfaz
create policy dg_friend_sel on public.dg_friendships for select to authenticated using (auth.uid() in (requester, addressee));
create policy dg_friend_ins on public.dg_friendships for insert to authenticated with check (requester = auth.uid() and status = 'pending');
create policy dg_friend_upd on public.dg_friendships for update to authenticated using (addressee = auth.uid()) with check (addressee = auth.uid() and status in ('accepted', 'blocked'));
create policy dg_friend_del on public.dg_friendships for delete to authenticated using (auth.uid() in (requester, addressee));

-- vitrine: o dono escreve; o dono e os amigos aceitos leem
create policy dg_show_sel on public.dg_showcases for select to authenticated using (user_id = auth.uid() or public.dg_is_friend(user_id));
create policy dg_show_ins on public.dg_showcases for insert to authenticated with check (user_id = auth.uid());
create policy dg_show_upd on public.dg_showcases for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy dg_show_del on public.dg_showcases for delete to authenticated using (user_id = auth.uid());

-- saudações: só entre amigos; quem recebe marca como resgatada
create policy dg_greet_sel on public.dg_greetings for select to authenticated using (auth.uid() in (from_user, to_user));
create policy dg_greet_ins on public.dg_greetings for insert to authenticated with check (from_user = auth.uid() and public.dg_is_friend(to_user));
create policy dg_greet_upd on public.dg_greetings for update to authenticated using (to_user = auth.uid()) with check (to_user = auth.uid());

grant select, insert, update          on public.dg_profiles    to authenticated;
grant select, insert, update, delete  on public.dg_saves       to authenticated;
grant select, insert, update, delete  on public.dg_friendships to authenticated;
grant select, insert, update, delete  on public.dg_showcases   to authenticated;
grant select, insert, update          on public.dg_greetings   to authenticated;
grant usage, select on sequence public.dg_greetings_id_seq to authenticated;
revoke all on public.dg_profiles, public.dg_saves, public.dg_friendships, public.dg_showcases, public.dg_greetings from anon;

-- ── 3. funções (RPC) ────────────────────────────────────────────────────────────────────────────
-- busca um jogador pelo código de amigo (com ou sem "DG-") ou pelo nome exato; devolve só o público
create or replace function public.dg_find_player(q text)
returns table (id uuid, username text, friend_code text, avatar_hero text)
language sql stable security definer set search_path = public as $$
  select p.id, p.username, p.friend_code, p.avatar_hero from dg_profiles p
  where p.id <> auth.uid()
    and (p.friend_code = upper(regexp_replace(coalesce(q, ''), '^\s*(DG-)?', '', 'i'))
         or p.username_lc = lower(trim(coalesce(q, ''))))
  limit 1;
$$;

-- pede amizade (se o outro já tinha pedido, aceita direto); limite de 100 amigos
create or replace function public.dg_request_friend(target uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); cur dg_friendships;
begin
  if me is null or target is null or target = me then return 'invalido'; end if;
  if not exists (select 1 from dg_profiles where id = target) then return 'nao_encontrado'; end if;
  select * into cur from dg_friendships
   where (requester = me and addressee = target) or (requester = target and addressee = me);
  if found then
    if cur.status = 'blocked' then return 'bloqueado'; end if;
    if cur.status = 'accepted' then return 'ja_amigos'; end if;
    if cur.requester = target then update dg_friendships set status = 'accepted' where requester = target and addressee = me; return 'aceito'; end if;
    return 'pendente';
  end if;
  if (select count(*) from dg_friendships where status = 'accepted' and me in (requester, addressee)) >= 100 then return 'limite'; end if;
  insert into dg_friendships (requester, addressee) values (me, target);
  return 'enviado';
end $$;

-- lista amigos e pedidos com nome, código, avatar e a vitrine mais recente de cada um
create or replace function public.dg_my_friends()
returns table (friend_id uuid, username text, friend_code text, avatar_hero text, status text, incoming boolean,
               class_id text, level int, max_depth int, score bigint, equipment jsonb, show_updated timestamptz)
language sql stable security definer set search_path = public as $$
  select o.id, p.username, p.friend_code, p.avatar_hero, f.status, (f.addressee = auth.uid()) as incoming,
         s.class_id, s.level, s.max_depth, s.score, case when f.status = 'accepted' then s.equipment end, s.updated_at
  from dg_friendships f
  cross join lateral (select case when f.requester = auth.uid() then f.addressee else f.requester end as id) o
  join dg_profiles p on p.id = o.id
  left join lateral (select * from dg_showcases x where x.user_id = o.id and f.status = 'accepted'
                     order by x.updated_at desc limit 1) s on true
  where auth.uid() in (f.requester, f.addressee) and f.status <> 'blocked'
  order by (f.status = 'accepted') desc, s.updated_at desc nulls last;
$$;

-- resgata as saudações recebidas ainda não resgatadas; devolve quantas e de quem
create or replace function public.dg_claim_greetings()
returns table (from_name text, n int)
language sql volatile security definer set search_path = public as $$
  with c as (update dg_greetings g set claimed = true where g.to_user = auth.uid() and not g.claimed returning g.from_user)
  select p.username, count(*)::int from c join dg_profiles p on p.id = c.from_user group by p.username;
$$;

revoke all on function public.dg_find_player(text), public.dg_request_friend(uuid), public.dg_my_friends(),
                       public.dg_claim_greetings(), public.dg_is_friend(uuid) from public, anon;
grant execute on function public.dg_find_player(text), public.dg_request_friend(uuid), public.dg_my_friends(),
                          public.dg_claim_greetings(), public.dg_is_friend(uuid) to authenticated;

-- ── 4. ranking ligado à conta (o que já existe continua funcionando) ────────────────────────────
do $$
begin
  if to_regclass('public.scores') is not null then
    execute 'alter table public.scores add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete set null';
    execute 'create index if not exists scores_user_idx on public.scores (user_id)';
  end if;
end $$;
