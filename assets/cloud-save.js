/**
 * DEPTHGATE — Saves na nuvem (etapa 4)
 * Todo o progresso do jogo vive no localStorage com os prefixos "dungeon-crawler:" e "depthgate:" (campanha c1..c3,
 * Modo Infinito e1..e3, Refúgio/meta, portais, forja, pets, pesca, coleção…). Este módulo guarda uma "foto" de tudo
 * isso em dg_saves (key = "snapshot") da conta logada e mantém aparelhos em sincronia:
 *   · ao entrar/abrir: nuvem mais nova e aparelho sem mudanças → baixa; aparelho mudou e nuvem não → envia;
 *     os dois mudaram → pergunta qual manter (mostra resumo dos dois lados).
 *   · jogando: cada save local marca "sujo" e envia em até ~10 s (e na hora ao sair/minimizar).
 *   · baixar só acontece no menu principal (a partida em andamento nunca é trocada no meio).
 *   · offline: nada quebra; envia quando a conexão voltar.
 * Concorrência: cada envio exige a revisão que este aparelho viu por último (rev); se outro aparelho enviou antes,
 * o envio não passa e a sincronia recomeça (e pergunta, se for o caso).
 * Ficam de fora (são do aparelho): sessão de login, perfil local, configurações, flags de teste.
 */
(function (window) {
  'use strict';
  const PFX = ["dungeon-crawler:", "depthgate:"];
  const SKIP = [/^depthgate:sb-auth/, /^depthgate:user_profile$/, /^depthgate:user_accounts$/, /^depthgate:auth_session$/,
    /^depthgate:eco(Test|Cache)$/, /^depthgate:cloud:/, /^dungeon-crawler:settings$/, /^depthgate_voice/];
  const ROW = "snapshot", STATE_KEY = "depthgate:cloud:state", DEBOUNCE = 10000;
  const L3 = (pt, en, es) => { try { return typeof window.__L3 === "function" ? window.__L3(pt, en, es) : pt; } catch (e) { return pt; } };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const synced = k => typeof k === "string" && PFX.some(p => k.startsWith(p)) && !SKIP.some(r => r.test(k));

  // marca "sujo" sempre que o jogo grava/apaga uma chave de progresso
  const SP = Storage.prototype, oSet = SP.setItem, oDel = SP.removeItem;
  let applying = !1;
  SP.setItem = function (k, v) { const r = oSet.apply(this, arguments); if (this === window.localStorage && !applying && synced(k)) CS.dirty(); return r; };
  SP.removeItem = function (k) { const r = oDel.apply(this, arguments); if (this === window.localStorage && !applying && synced(k)) CS.dirty(); return r; };

  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); }
  function snapshot() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (synced(k)) o[k] = localStorage.getItem(k); } return o; }
  function hashOf(o) { return fnv(Object.keys(o).sort().map(k => k + "\u0001" + o[k]).join("\u0002")); }
  const J = s => { try { return JSON.parse(s); } catch (e) { return null; } };
  function device() {
    const u = navigator.userAgent || "";
    const os = /Android/i.test(u) ? "Android" : /iPhone|iPad|iPod/i.test(u) ? "iPhone/iPad" : /Windows/i.test(u) ? "Windows" : /Mac/i.test(u) ? "Mac" : /Linux/i.test(u) ? "Linux" : "?";
    const br = /Edg\//.test(u) ? "Edge" : /Chrome\//.test(u) ? "Chrome" : /Firefox\//.test(u) ? "Firefox" : /Safari\//.test(u) ? "Safari" : "";
    return (os + (br ? " · " + br : "")).slice(0, 40);
  }
  /* resumo legível de uma foto (para a tela de conflito) */
  function summary(o) {
    const cls = id => { try { return window.__className ? window.__className(id) : (id || "?"); } catch (e) { return id || "?"; } };
    const camp = [], endl = []; let frag = 0;
    for (const [k, v] of Object.entries(o)) {
      let m = k.match(/^dungeon-crawler:save:c(\d)$/);
      if (m) { const d = J(v); if (d?.player) camp.push({ slot: +m[1], cls: cls(d.player.classId), lvl: d.player.level || 1, done: !!d.campaign?.completed }); continue; }
      m = k.match(/^dungeon-crawler:save:e(\d)$/);
      if (m) { const d = J(v); if (d?.player) endl.push({ slot: +m[1], cls: cls(d.player.classId), lvl: d.player.level || 1, deaths: d.player.deaths || 0 }); continue; }
      if (/^dungeon-crawler:meta/.test(k)) { const d = J(v); if (d && typeof d.fragments === "number") frag = Math.max(frag, d.fragments); }
    }
    camp.sort((a, b) => a.slot - b.slot); endl.sort((a, b) => a.slot - b.slot);
    return { camp, endl, frag, keys: Object.keys(o).length };
  }
  const hasProgress = o => Object.keys(o).some(k => /^dungeon-crawler:(save|meta)/.test(k));
  const state = () => J(localStorage.getItem(STATE_KEY)) || {};
  function setState(uid, s) { const all = state(); all[uid] = { ...(all[uid] || {}), ...s }; applying = !0; try { oSet.call(localStorage, STATE_KEY, JSON.stringify(all)); } finally { applying = !1; } }
  function safeToApply() {
    try { const g = window.__DED_GAME; const keys = g.scene.getScenes(!0).map(s => s.sys.settings.key); return keys.includes("MainMenu") && !keys.some(k => ["Game", "Hub", "Cutscene", "Traversal", "ValdrakAntiga", "ReturnJourney"].includes(k)); } catch (e) { return !1; }
  }
  function toast(msg) {
    try {
      const t = document.createElement("div");
      t.textContent = msg;
      t.style.cssText = "position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:100001;background:#1c140e;border:1px solid #8a6a2a;color:#ffe9a8;padding:8px 14px;border-radius:8px;font:13px system-ui,sans-serif;box-shadow:0 6px 20px #000;transition:opacity .4s";
      document.body.appendChild(t); setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 500); }, 2600);
    } catch (e) {}
  }

  const CS = {
    lastSync: null, busy: !1, pending: null, _t: null, conflictOpen: !1,
    acc() { const a = window.DGCloud; return a && a.sb && a.user && a.cloud ? a : null; },
    dirty() { clearTimeout(this._t); this._t = setTimeout(() => this.sync("dirty"), DEBOUNCE); },
    async fetchRow(a) {
      const { data, error } = await a.sb.from("dg_saves").select("rev,data,updated_at,device").eq("user_id", a.user.id).eq("key", ROW).limit(1);
      if (error) throw error;
      return data && data[0] || null;
    },
    async push(a, local, rev) {
      const payload = { v: 1, keys: local, summary: summary(local), at: new Date().toISOString() };
      let res;
      if (!rev) res = await a.sb.from("dg_saves").insert({ user_id: a.user.id, key: ROW, data: payload, rev: 1, device: device() }).select("rev");
      else res = await a.sb.from("dg_saves").update({ data: payload, rev: rev + 1, device: device() }).eq("user_id", a.user.id).eq("key", ROW).eq("rev", rev).select("rev");
      if (res.error) { if (res.error.code === "23505") return !1; throw res.error; }
      if (!res.data || !res.data.length) return !1;          // outro aparelho enviou antes
      setState(a.user.id, { rev: res.data[0].rev, hash: hashOf(local), at: Date.now() });
      this.lastSync = Date.now(); this.emit();
      return !0;
    },
    apply(a, row) {
      const keys = row?.data?.keys; if (!keys || typeof keys !== "object") return;
      applying = !0;
      try {
        for (const k of Object.keys(snapshot())) if (!(k in keys)) oDel.call(localStorage, k);
        for (const [k, v] of Object.entries(keys)) if (synced(k) && typeof v === "string") oSet.call(localStorage, k, v);
      } finally { applying = !1; }
      setState(a.user.id, { rev: row.rev, hash: hashOf(snapshot()), at: Date.now() });
      this.lastSync = Date.now(); this.pending = null; this.emit();
      try { const mm = window.__DED_GAME.scene.getScene("MainMenu"); mm?.sys?.isActive?.() && mm.scene.restart(); } catch (e) {}
      toast(L3("☁ Progresso da nuvem carregado", "☁ Cloud progress loaded", "☁ Progreso de la nube cargado"));
    },
    /* sincronia completa (abrir, entrar, voltar do segundo plano, salvar) */
    async sync(reason) {
      const a = this.acc(); if (!a || this.busy || this.conflictOpen) return;
      if (!navigator.onLine) return;
      this.busy = !0;
      try {
        for (let tries = 0; tries < 3; tries++) {
          const st = state()[a.user.id] || { rev: 0, hash: null };
          const row = await this.fetchRow(a), local = snapshot(), lh = hashOf(local), localChanged = st.hash !== lh;
          if (!row) { if (hasProgress(local) && await this.push(a, local, 0)) return; if (!hasProgress(local)) return; continue; }
          if (row.rev === st.rev) { if (!localChanged || await this.push(a, local, row.rev)) return; continue; }
          // a nuvem tem algo que este aparelho ainda não viu
          const ch = hashOf(row.data?.keys || {});
          if (ch === lh) { setState(a.user.id, { rev: row.rev, hash: lh, at: Date.now() }); this.lastSync = Date.now(); this.emit(); return; }
          if (!localChanged || !hasProgress(local)) {
            if (safeToApply()) this.apply(a, row); else this.pending = row;
            return;
          }
          // os dois lados mudaram: só pergunta no menu principal (nunca no meio de uma partida)
          if (safeToApply()) await this.askConflict(a, local, row); else this.pending = row;
          return;
        }
      } catch (e) { console.warn("[nuvem]", e?.message || e); }
      finally { this.busy = !1; }
    },
    /* tela: qual progresso manter */
    askConflict(a, local, row) {
      this.conflictOpen = !0;
      return new Promise(resolve => {
        const S1 = summary(local), S2 = row.data?.summary || summary(row.data?.keys || {});
        const when = (() => { try { return new Date(row.updated_at).toLocaleString(); } catch (e) { return ""; } })();
        const card = (title, sub, S, act, pri) => `<div class="cc"><div class="t">${title}</div><div class="s">${esc(sub)}</div>
          <div class="l"><b>${L3("Campanha", "Campaign", "Campaña")}:</b> ${S.camp.length ? S.camp.map(c => `${esc(c.cls)} nv ${c.lvl}${c.done ? " ★" : ""}`).join(" · ") : "—"}</div>
          <div class="l"><b>${L3("Modo Infinito", "Endless", "Modo Infinito")}:</b> ${S.endl.length ? S.endl.map(c => `${esc(c.cls)} nv ${c.lvl}`).join(" · ") : "—"}</div>
          <div class="l"><b>${L3("Fragmentos", "Fragments", "Fragmentos")}:</b> ${S.frag}</div>
          <button class="btn ${pri ? "pri" : ""}" data-k="${act}">${L3("MANTER ESTE", "KEEP THIS ONE", "MANTENER ESTE")}</button></div>`;
        const m = document.createElement("div"); m.id = "dg-sync";
        m.innerHTML = `<style>#dg-sync{position:fixed;inset:0;z-index:100002;display:flex;align-items:center;justify-content:center;background:rgba(6,4,10,.85);font-family:Georgia,serif;color:#efe4c8}
#dg-sync .box{width:min(640px,94vw);max-height:92vh;overflow:auto;background:linear-gradient(#1c140e,#120c08);border:2px solid #8a6a2a;border-radius:10px;padding:18px}
#dg-sync h2{margin:0 0 6px;text-align:center;color:#ffd24a;font-size:19px}#dg-sync p{font:13px system-ui,sans-serif;color:#c9b89a;text-align:center;margin:0 0 12px}
#dg-sync .row{display:flex;gap:10px;flex-wrap:wrap}#dg-sync .cc{flex:1;min-width:230px;border:1px solid #3a2a14;border-radius:8px;padding:10px;background:rgba(255,210,74,.05)}
#dg-sync .t{font-weight:bold;color:#ffe9a8}#dg-sync .s{font:11px system-ui,sans-serif;color:#8a7f66;margin-bottom:6px}#dg-sync .l{font:12px system-ui,sans-serif;margin:3px 0}
#dg-sync .btn{display:block;width:100%;margin-top:10px;padding:10px;border-radius:6px;border:1px solid #8a6a2a;background:#2a1f12;color:#ffe9a8;font:bold 13px system-ui,sans-serif;cursor:pointer}
#dg-sync .btn.pri{background:#6a1e1a;border-color:#c9a24a}#dg-sync .btn:focus{outline:2px solid #ffd24a;outline-offset:2px}
#dg-sync .warn{font:11px system-ui,sans-serif;color:#ffb89a;text-align:center;margin-top:10px}</style>
<div class="box"><h2>${L3("QUAL PROGRESSO MANTER?", "WHICH PROGRESS TO KEEP?", "¿QUÉ PROGRESO MANTENER?")}</h2>
<p>${L3("Este aparelho e a nuvem têm progressos diferentes desta conta.", "This device and the cloud have different progress for this account.", "Este dispositivo y la nube tienen progresos distintos de esta cuenta.")}</p>
<div class="row">${card(L3("ESTE APARELHO", "THIS DEVICE", "ESTE DISPOSITIVO"), device(), S1, "local", !1)}${card(L3("NA NUVEM", "IN THE CLOUD", "EN LA NUBE"), `${row.device || ""}${when ? " · " + when : ""}`, S2, "cloud", !0)}</div>
<div class="warn">${L3("O progresso que você não escolher será substituído.", "The progress you don't pick will be replaced.", "El progreso que no elijas será reemplazado.")}</div></div>`;
        document.body.appendChild(m);
        let paused = [];
        try { paused = window.__DED_GAME.scene.getScenes(!0).filter(s => !s.sys.isPaused()); paused.forEach(s => s.scene.pause()); } catch (e) {}
        const stop = e => e.stopPropagation(); m.addEventListener("keydown", stop, !0);
        const btns = [...m.querySelectorAll("[data-k]")]; setTimeout(() => btns[1]?.focus(), 30);
        // controle: esquerda/direita escolhe, A confirma
        let prev = { a: !0 }, raf;
        const pad = () => { let g = null; try { g = Array.from(navigator.getGamepads?.() || []).find(p => p && p.connected); } catch (e) {} if (g) { const b = i => !!g.buttons[i]?.pressed, ax = g.axes || [], lf = b(14) || ax[0] < -.6, rt = b(15) || ax[0] > .6; if (lf && !prev.lf) btns[0].focus(); if (rt && !prev.rt) btns[1].focus(); if (b(0) && !prev.a) document.activeElement?.click?.(); prev = { a: b(0), lf, rt }; } raf = requestAnimationFrame(pad); };
        raf = requestAnimationFrame(pad);
        const done = async k => {
          cancelAnimationFrame(raf); m.remove(); this.conflictOpen = !1;
          try { paused.forEach(s => s.scene.isPaused() && s.scene.resume()); } catch (e) {}
          try {
            if (k === "cloud") this.apply(a, row);
            else if (await this.push(a, local, row.rev)) toast(L3("☁ Progresso deste aparelho salvo na nuvem", "☁ This device's progress saved to the cloud", "☁ Progreso de este dispositivo guardado en la nube"));
          } catch (e) { console.warn("[nuvem]", e); }
          resolve(k);
        };
        btns.forEach(b => b.addEventListener("click", () => done(b.dataset.k)));
      });
    },
    status() { return { online: !!this.acc(), lastSync: this.lastSync, pending: !!this.pending }; },
    emit() { window.dispatchEvent(new CustomEvent("depthgate:cloud_sync", { detail: this.status() })); },
    flush() { if (this._t) { clearTimeout(this._t); this._t = null; this.sync("flush"); } }
  };
  window.DGSave = CS;

  // gatilhos: conta pronta/trocada, voltar ao app, internet voltou, minimizar/fechar, menu principal com download pendente
  window.addEventListener("depthgate:auth", () => setTimeout(() => CS.sync("auth"), 300));
  document.addEventListener("visibilitychange", () => { document.hidden ? CS.flush() : CS.sync("visible"); });
  window.addEventListener("pagehide", () => CS.flush());
  window.addEventListener("online", () => CS.sync("online"));
  setInterval(() => {
    if (CS.pending && safeToApply() && !CS.busy && !CS.conflictOpen) CS.sync("pending");
  }, 3000);
  setInterval(() => CS.sync("tick"), 5 * 60 * 1000);   // de vez em quando confere se outro aparelho avançou
})(window);
