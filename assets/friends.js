/**
 * DEPTHGATE — Amigos e vitrine do herói (etapa 5)
 *  · Amigos: adicionar por código (DG-XXXXXX) ou nome, aceitar/recusar pedidos, remover. Tudo pelas funções seguras
 *    do banco (dg_find_player, dg_request_friend, dg_my_friends) — RLS garante que cada um só mexe no que é seu.
 *  · Vitrine: o "melhor momento" de cada herói do Modo Infinito (o equipamento mais forte que ele já vestiu, o maior
 *    nível e a maior profundidade). No Infinito a morte zera a run, então a vitrine guarda o auge — é isso que os
 *    amigos veem no eco. Publicada em dg_showcases (slot = slot do Infinito).
 *  · Ecos: window.__ecoSource devolve os amigos aceitos com vitrine (cache local: aparece mesmo offline).
 *  · Saudações: o eco envia (dg_greetings); quem recebe resgata ao entrar no Refúgio (+5 fragmentos cada).
 *  · A seção AMIGOS aparece dentro da janela CONTA.
 * Requer user-auth.js (window.DGCloud).
 */
(function (window) {
  'use strict';
  const L3 = (pt, en, es) => { try { return typeof window.__L3 === "function" ? window.__L3(pt, en, es) : pt; } catch (e) { return pt; } };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const J = s => { try { return JSON.parse(s); } catch (e) { return null; } };
  const CACHE = "depthgate:friendsCache", ECO_CACHE = "depthgate:ecoCache", BEST = "depthgate:showcase:";
  const RANK = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, RELIC: 6, UNIQUE: 7 };
  const isForge = id => /^(unique_forge_|armor_forge_)/.test(String(id || ""));
  const gearScore = eq => Object.values(eq || {}).reduce((s, it) => s + (it ? (isForge(it.id) ? 7 : (RANK[it.rarity] || 1)) : 0), 0);
  const clsName = id => { try { return window.__className ? window.__className(id) : id; } catch (e) { return id; } };
  const heroName = id => window.__heroNames?.[id] || clsName(id);

  const F = {
    list: J(localStorage.getItem(CACHE)) || [],
    acc() { const a = window.DGCloud; return a && a.sb && a.user && a.cloud ? a : null; },

    /* ── amigos ── */
    async refresh() {
      const a = this.acc(); if (!a) return this.list;
      const { data, error } = await a.sb.rpc("dg_my_friends");
      if (error) { console.warn("[amigos]", error.message); return this.list; }
      this.list = data || [];
      try { localStorage.setItem(CACHE, JSON.stringify(this.list)); } catch (e) {}
      this.cacheEcos();
      window.dispatchEvent(new CustomEvent("depthgate:friends", { detail: this.list }));
      return this.list;
    },
    accepted() { return this.list.filter(f => f.status === "accepted"); },
    incoming() { return this.list.filter(f => f.status === "pending" && f.incoming); },
    outgoing() { return this.list.filter(f => f.status === "pending" && !f.incoming); },
    toEco(f) { return { uid: f.friend_id, name: f.username, classId: f.class_id, level: f.level || 1, maxDepth: f.max_depth || 0, score: f.score || 0, equipment: f.equipment || {} }; },
    ecos() { return this.accepted().filter(f => f.class_id).map(f => this.toEco(f)); },
    cacheEcos() { try { localStorage.setItem(ECO_CACHE, JSON.stringify(this.ecos())); } catch (e) {} },
    async add(q) {
      const a = this.acc(); if (!a) throw new Error(L3("Entre na conta para adicionar amigos.", "Sign in to add friends.", "Entra en la cuenta para añadir amigos."));
      q = String(q || "").trim(); if (q.length < 3) throw new Error(L3("Digite o código (DG-XXXXXX) ou o nome do amigo.", "Type your friend's code (DG-XXXXXX) or name.", "Escribe el código (DG-XXXXXX) o el nombre del amigo."));
      const { data: found, error } = await a.sb.rpc("dg_find_player", { q });
      if (error) throw error;
      const p = found && found[0]; if (!p) throw new Error(L3("Nenhum jogador com esse código ou nome.", "No player with that code or name.", "Ningún jugador con ese código o nombre."));
      const { data: r, error: e2 } = await a.sb.rpc("dg_request_friend", { target: p.id });
      if (e2) throw e2;
      await this.refresh();
      return { name: p.username, result: r };
    },
    async accept(id) { const a = this.acc(); if (!a) return; const { error } = await a.sb.rpc("dg_request_friend", { target: id }); if (error) throw error; await this.refresh(); },
    async remove(id) {
      const a = this.acc(); if (!a) return;
      const me = a.user.id;
      const { error } = await a.sb.from("dg_friendships").delete().or(`and(requester.eq.${me},addressee.eq.${id}),and(requester.eq.${id},addressee.eq.${me})`);
      if (error) throw error; await this.refresh();
    },

    /* ── vitrine: guarda o auge de cada herói do Infinito e publica ── */
    trackBest() {
      let changed = [];
      for (let s = 1; s <= 3; s++) {
        const d = J(localStorage.getItem("dungeon-crawler:save:e" + s)); if (!d?.player?.classId) continue;
        const pl = d.player, b = J(localStorage.getItem(BEST + s)) || null, eq = {};
        for (const [k, v] of Object.entries(pl.equipment || {})) if (v && v.id) eq[k] = { id: v.id, rarity: v.rarity || "COMMON", seed: v.seed ?? 0 };
        const depth = Math.max(d.run?.depth || 0, d.run?.maxDepth || 0);
        let best = b && b.classId === pl.classId ? b : { classId: pl.classId, equipment: {}, gear: -1, level: 0, maxDepth: 0, score: 0 };
        let ch = !b || b.classId !== pl.classId;
        const g = gearScore(eq);
        if (g > best.gear) { best.equipment = eq; best.gear = g; ch = !0; }
        if ((pl.level || 1) > best.level) { best.level = pl.level || 1; ch = !0; }
        if (depth > best.maxDepth) { best.maxDepth = depth; ch = !0; }
        try { for (const r of J(localStorage.getItem("dungeon-crawler:endless-ranking")) || []) if (r && r.classId === pl.classId) { if ((r.score || 0) > best.score) { best.score = r.score; ch = !0; } if ((r.maxDepth ?? r.depth ?? 0) > best.maxDepth) { best.maxDepth = r.maxDepth ?? r.depth; ch = !0; } if ((r.maxLevel || 0) > best.level) { best.level = r.maxLevel; ch = !0; } } } catch (e) {}
        if (ch) { best.dirty = !0; best.at = Date.now(); try { localStorage.setItem(BEST + s, JSON.stringify(best)); } catch (e) {} changed.push(s); }
      }
      if (changed.length) { clearTimeout(this._pt); this._pt = setTimeout(() => this.publish(), 4000); }
      return changed;
    },
    async publish() {
      const a = this.acc(); if (!a) return;
      for (let s = 1; s <= 3; s++) {
        const b = J(localStorage.getItem(BEST + s)); if (!b || !b.dirty) continue;
        const row = { user_id: a.user.id, slot: s, class_id: b.classId, level: b.level || 1, max_depth: b.maxDepth || 0, score: b.score || 0, equipment: b.equipment || {} };
        const { error } = await a.sb.from("dg_showcases").upsert(row, { onConflict: "user_id,slot" });
        if (error) { console.warn("[vitrine]", error.message); continue; }
        b.dirty = !1; try { localStorage.setItem(BEST + s, JSON.stringify(b)); } catch (e) {}
      }
    },
    myBest() {
      let best = null;
      for (let s = 1; s <= 3; s++) { const b = J(localStorage.getItem(BEST + s)); if (b && (!best || (b.score || 0) > (best.score || 0))) best = b; }
      return best;
    },

    /* ── saudações ── */
    async greet(friendId) {
      const a = this.acc(); if (!a || !friendId || String(friendId).startsWith("teste-")) return;
      const { error } = await a.sb.from("dg_greetings").insert({ to_user: friendId });
      if (error && error.code !== "23505") console.warn("[saudação]", error.message);
    },
    async claimGreetings() {
      const a = this.acc(); if (!a) return [];
      const { data, error } = await a.sb.rpc("dg_claim_greetings");
      if (error) { console.warn("[saudação]", error.message); return []; }
      return data || [];
    },

    /* ── seção AMIGOS na janela CONTA ── */
    section(acc) {
      const logged = !!this.acc();
      const inc = this.incoming(), acc2 = this.accepted(), out = this.outgoing();
      const star = f => Object.values(f.equipment || {}).some(it => it && (isForge(it.id) || it.rarity === "LEGENDARY" || it.rarity === "RELIC")) ? " ★" : "";
      const row = (f, btns) => `<div class="fr"><img src="${acc.getAvatarUrl({ avatarHero: f.avatar_hero })}" alt=""><div class="fi"><b>${esc(f.username)}</b><span>${f.class_id ? `${esc(heroName(f.class_id))} · ${L3("nv", "lv", "nv")} ${f.level || 1} · ${L3("prof.", "depth", "prof.")} ${f.max_depth || 0}${star(f)}` : esc(f.status === "pending" ? L3("aguardando resposta", "waiting for reply", "esperando respuesta") : L3("ainda sem herói no Infinito", "no Endless hero yet", "aún sin héroe en el Infinito"))}</span></div>${btns}</div>`;
      return `<div class="sec" id="dg-fr"><div class="lbl">${L3("AMIGOS", "FRIENDS", "AMIGOS")} ${acc2.length ? `(${acc2.length})` : ""}</div>
        ${logged ? `<div class="hint" style="margin:0 0 8px">${L3("Os heróis dos seus amigos aparecem como ecos no Refúgio do Modo Infinito.", "Your friends' heroes appear as echoes in the Endless Refuge.", "Los héroes de tus amigos aparecen como ecos en el Refugio del Modo Infinito.")}</div>
        <div class="row"><input id="dg-fr-q" placeholder="${L3("código DG-XXXXXX ou nome", "code DG-XXXXXX or name", "código DG-XXXXXX o nombre")}" style="flex:2;margin:0"><button class="btn" data-fa="add" style="flex:1;margin:0">${L3("ADICIONAR", "ADD", "AÑADIR")}</button></div>
        <div class="msg" id="dg-fr-msg"></div>
        ${inc.length ? `<div class="lbl" style="margin-top:8px">${L3("PEDIDOS RECEBIDOS", "REQUESTS", "SOLICITUDES")}</div>` + inc.map(f => row(f, `<button class="mini ok" data-fa="accept" data-id="${f.friend_id}">${L3("ACEITAR", "ACCEPT", "ACEPTAR")}</button><button class="mini" data-fa="remove" data-id="${f.friend_id}">✕</button>`)).join("") : ""}
        ${acc2.map(f => row(f, `<button class="mini" data-fa="remove" data-id="${f.friend_id}" title="${L3("remover", "remove", "quitar")}">✕</button>`)).join("")}
        ${out.map(f => row(f, `<button class="mini" data-fa="remove" data-id="${f.friend_id}" title="${L3("cancelar", "cancel", "cancelar")}">✕</button>`)).join("")}
        ${!inc.length && !acc2.length && !out.length ? `<div class="hint">${L3("Passe o seu código para os amigos ou adicione o deles aqui.", "Share your code with friends or add theirs here.", "Comparte tu código con tus amigos o añade el suyo aquí.")}</div>` : ""}`
        : `<div class="hint">${L3("Conecte-se à internet para ver e adicionar amigos.", "Connect to the internet to see and add friends.", "Conéctate a internet para ver y añadir amigos.")}</div>`}</div>`;
    },
    bind(m, acc) {
      const msg = (t, ok) => { const el = m.querySelector("#dg-fr-msg"); if (el) { el.textContent = t || ""; el.className = "msg " + (ok ? "ok" : "err"); } };
      const R = { enviado: L3("Pedido enviado para", "Request sent to", "Solicitud enviada a"), aceito: L3("Agora vocês são amigos:", "You are now friends:", "Ahora son amigos:"), pendente: L3("Já existe um pedido com", "There's already a request with", "Ya hay una solicitud con"), ja_amigos: L3("Vocês já são amigos:", "You're already friends:", "Ya son amigos:"), bloqueado: L3("Não foi possível adicionar", "Couldn't add", "No se pudo añadir"), limite: L3("Limite de 100 amigos atingido.", "100 friends limit reached.", "Límite de 100 amigos alcanzado."), nao_encontrado: L3("Jogador não encontrado.", "Player not found.", "Jugador no encontrado.") };
      m.querySelectorAll("[data-fa]").forEach(b => b.addEventListener("click", async () => {
        const act = b.dataset.fa, id = b.dataset.id;
        try {
          if (act === "add") { const r = await this.add(m.querySelector("#dg-fr-q").value); acc.render(); const t = R[r.result] || r.result; return setTimeout(() => { const el = acc.modalEl.querySelector("#dg-fr-msg"); if (el) { el.textContent = /limite|nao_encontrado/.test(r.result) ? t : `${t} ${r.name}`; el.className = "msg " + (/enviado|aceito/.test(r.result) ? "ok" : "err"); } }, 0); }
          if (act === "accept") { await this.accept(id); acc.render(); return; }
          if (act === "remove") { if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = L3("REMOVER?", "REMOVE?", "¿QUITAR?"); return; } await this.remove(id); acc.render(); return; }
        } catch (e) { msg(acc.errText ? acc.errText(e) : String(e.message || e)); }
      }));
      m.querySelector("#dg-fr-q")?.addEventListener("keydown", e => { if (e.key === "Enter") m.querySelector("[data-fa=add]")?.click(); });
    }
  };
  window.DGFriends = F;

  // ecos no Refúgio: amigos aceitos com vitrine (cache local primeiro; atualiza em segundo plano)
  window.__ecoSource = () => F.ecos();
  window.__ecoOnGreet = D => F.greet(D?.uid);

  // a seção AMIGOS entra na janela CONTA
  const hook = () => {
    const A = window.DepthGateUser; if (!A || A.__frHooked) return !!A;
    A.__frHooked = !0;
    const R0 = A.render.bind(A);
    A.render = function () {
      R0();
      const m = this.modalEl, box = m?.querySelector(".box"); if (!box) return;
      const sec = document.createElement("div"); sec.innerHTML = F.section(this); box.appendChild(sec.firstElementChild);
      if (!box.querySelector("#dg-fr-css")) { const st = document.createElement("style"); st.id = "dg-fr-css"; st.textContent = `#dg-acc .fr{display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid #2a1f12}#dg-acc .fr img{width:34px;height:34px;border-radius:50%}#dg-acc .fi{flex:1;display:flex;flex-direction:column}#dg-acc .fi span{font:11px system-ui,sans-serif;color:#a89878}#dg-acc .mini{background:#2a1f12;border:1px solid #5a4422;color:#ffe9a8;border-radius:5px;padding:5px 8px;font:bold 11px system-ui,sans-serif;cursor:pointer;margin-left:4px}#dg-acc .mini.ok{background:#1f3a24;border-color:#4a9e6b;color:#8ae0b0}#dg-acc .mini:focus{outline:2px solid #ffd24a}`; box.appendChild(st); }
      F.bind(m, this);
    };
    const O0 = A.openModal.bind(A);
    A.openModal = function () { O0(); F.refresh().then(() => this.refreshViews()).catch(() => {}); };
    return !0;
  };
  if (!hook()) { const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 200); }

  // quando a conta fica pronta: atualiza amigos, acompanha o auge dos heróis e publica
  window.addEventListener("depthgate:auth", () => { if (F.acc()) { F.refresh().catch(() => {}); F.trackBest(); F.publish().catch(() => {}); } });
  setInterval(() => F.trackBest(), 15000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && F.acc()) F.refresh().catch(() => {}); });
})(window);
