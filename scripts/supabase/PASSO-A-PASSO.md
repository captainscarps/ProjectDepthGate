# DEPTHGATE · Configurar contas no Supabase (etapa 2)

Projeto: `drkypjvlclvjzfuakjeo` (o mesmo que o jogo já usa). Nenhuma chave secreta vai para o código nem para o chat.

## 1. Rodar o SQL (2 min)
1. Supabase → seu projeto → **SQL Editor** → **New query**.
2. Cole o conteúdo inteiro de `001_contas_saves_amigos.sql` e clique **Run**.
3. Deve terminar com "Success. No rows returned". Pode rodar de novo sem problema.

> Isso apaga a coluna `password_hash` da tabela antiga `profiles` (os resumos de senha que estavam expostos).
> Os nomes e avatares antigos continuam lá; o login antigo deixa de funcionar e o novo assume.

## 2. Ligar os tipos de login (3 min)
Supabase → **Authentication** → **Sign In / Providers** (ou **Providers**):
1. **Anonymous Sign-Ins** → ligar (jogar sem cadastro e vincular depois).
2. **Email** → ligado. Em "Confirm email" pode deixar ligado (o jogador confirma pelo link).
3. **Google** → ligar depois do passo 4 (precisa do Client ID e Secret).
4. **Allow manual linking** (Authentication → Sign In / Providers, seção "User Signups" ou "Advanced") → ligar.
   É o que deixa o convidado vincular o Google à MESMA conta (progresso e amigos continuam). Sem isso, entrar com o
   Google cria outra conta e o jogo pergunta qual progresso manter.

Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://captainscarps.github.io/ProjectDepthGate/`
- **Redirect URLs** (adicionar):
  - `https://captainscarps.github.io/ProjectDepthGate/**`
  - `http://localhost:5300/**` (testes)

## 3. Proteção contra abuso (1 min)
Authentication → **Rate Limits**: os padrões servem. Em **Attack Protection**, ligar o CAPTCHA só se aparecer spam de contas.

## 4. Credencial do Google (≈10 min)
1. Acesse **console.cloud.google.com** → crie um projeto "DEPTHGATE".
2. **APIs e serviços → Tela de consentimento OAuth** (ou "Google Auth Platform → Branding"):
   - Tipo: **Externo** · Nome do app: **DEPTHGATE** · e-mail de suporte: o seu.
   - Domínios autorizados: `supabase.co` e `github.io`.
   - Escopos: só os básicos (`email`, `profile`, `openid`).
   - Publique o app ("Publicar app"/"In production") para qualquer pessoa conseguir entrar.
3. **Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**.
   - Origens JavaScript autorizadas: `https://captainscarps.github.io`
   - URIs de redirecionamento autorizados: `https://drkypjvlclvjzfuakjeo.supabase.co/auth/v1/callback`
4. Copie o **Client ID** e o **Client Secret** e cole em Supabase → Authentication → Providers → **Google** → Save.
   O Secret fica só no painel do Supabase.

## 5. Me avisar
Quando os passos 1 e 2 estiverem feitos, me diga "SQL aplicado". O Google pode vir depois — o jogo mostra o botão do
Google só quando ele estiver ativo.
