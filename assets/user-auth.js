/**
 * DEPTHGATE — Conta do jogador (Supabase Auth)
 * Conta anônima automática (joga sem cadastro), Google e e-mail/senha; o convidado vira conta permanente sem perder
 * o id (progresso e amigos continuam). Perfil público em dg_profiles (nome único, código de amigo, avatar).
 * As senhas ficam só no Supabase Auth — nada de senha no navegador nem em tabela.
 * Expõe window.DepthGateUser (API usada pelo jogo: getProfile, getAvatarUrl, getRankingAvatar, openModal) e
 * window.DGCloud (o mesmo objeto: .sb = cliente Supabase, .user, .cloud) para saves na nuvem e amigos.
 * Requer assets/vendor/supabase-2.119.0.js (supabase-js, licença MIT) carregado antes.
 */
(function (window) {
  'use strict';
  // chave pública do projeto (feita para ficar no navegador; o acesso é controlado pelo RLS do banco)
  const SUPA_URL = "https://drkypjvlclvjzfuakjeo.supabase.co";
  const SUPA_KEY = "sb_publishable_UGpQ4AxUnOWrD5qQm4nuiA_tb7mq1eR";
  const STORAGE_PROFILE_KEY = "depthgate:user_profile";
  // convidado criando conta por e-mail: o Supabase só aceita a senha DEPOIS que o e-mail é confirmado.
  // Guarda só o e-mail (nunca a senha) até a confirmação; aí a janela pede a senha.
  const PENDING_KEY = "depthgate:acc:pending";

  const HERO_AVATARS = {
    warrior: {
      id: "warrior",
      name: "Guerreiro",
      color: "#c94a29",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2d120a" stroke="#c9a24a" stroke-width="2.5"/><path d="M22 46 L32 18 L42 46 Z" fill="#c94a29" stroke="#ffd24a" stroke-width="1.5"/><rect x="29" y="16" width="6" height="28" fill="#e8d8b8"/><circle cx="32" cy="24" r="5" fill="#ffd24a"/><path d="M18 42 H46 L32 50 Z" fill="#8a2010"/></svg>'
    },
    berserker: {
      id: "berserker",
      name: "Samurai",
      color: "#d91e36",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#250910" stroke="#c9a24a" stroke-width="2.5"/><path d="M20 22 C32 14 44 22 44 32 C44 42 32 46 20 42 Z" fill="#d91e36"/><path d="M16 48 L48 16" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="7" fill="#ffd24a"/></svg>'
    },
    archer: {
      id: "archer",
      name: "Arqueira",
      color: "#2a9d8f",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0c221c" stroke="#c9a24a" stroke-width="2.5"/><path d="M24 16 C38 24 38 40 24 48" fill="none" stroke="#2a9d8f" stroke-width="3"/><line x1="24" y1="16" x2="24" y2="48" stroke="#c9a24a" stroke-width="1.5"/><line x1="18" y1="32" x2="46" y2="32" stroke="#e8d8b8" stroke-width="2.5"/><polygon points="46,32 40,28 40,36" fill="#ffd24a"/></svg>'
    },
    mage: {
      id: "mage",
      name: "Mago",
      color: "#8338ec",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#180b2c" stroke="#c9a24a" stroke-width="2.5"/><polygon points="32,14 42,24 32,34 22,24" fill="#8338ec"/><circle cx="32" cy="24" r="5" fill="#c77dff"/><path d="M26 38 L38 38 L32 50 Z" fill="#ffd24a"/><circle cx="32" cy="46" r="3" fill="#ffffff"/></svg>'
    },
    rogue: {
      id: "rogue",
      name: "Ladino",
      color: "#3a86ff",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0d1b2a" stroke="#c9a24a" stroke-width="2.5"/><path d="M20 20 L44 44 M44 20 L20 44" stroke="#3a86ff" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="#ffd24a"/><path d="M26 16 L32 24 L38 16" fill="#e8d8b8"/></svg>'
    },
    druid: {
      id: "druid",
      name: "Druida",
      color: "#86e080",
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0f2210" stroke="#c9a24a" stroke-width="2.5"/><path d="M32 14 C44 22 46 36 32 50 C18 36 20 22 32 14 Z" fill="#4f9a3c" stroke="#86e080" stroke-width="1.5"/><path d="M32 18 V48 M32 28 L38 23 M32 35 L26 30 M32 41 L38 37" stroke="#1d3a17" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
    }
  };

  function svgToDataUrl(svgStr) { return "data:image/svg+xml;utf8," + encodeURIComponent(svgStr); }
  function getHeroAvatarDataUrl(heroId) { return svgToDataUrl((HERO_AVATARS[heroId] || HERO_AVATARS.warrior).svg); }
  const L3 = (pt, en, es) => { try { return typeof window.__L3 === "function" ? window.__L3(pt, en, es) : pt; } catch (e) { return pt; } };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NAME_RE = /^[A-Za-zÀ-ÿ0-9_. -]{3,16}$/;
  const cleanName = n => String(n || "").replace(/[^A-Za-zÀ-ÿ0-9_. -]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);

  class DepthGateAccount {
    constructor() {
      this.profile = this.loadProfile();
      this.sb = null;            // cliente Supabase
      this.user = null;          // usuário do Supabase Auth (anônimo ou permanente)
      this.cloud = null;         // linha de dg_profiles
      this.providers = { google: false, email: true, anonymous: false };
      this.online = false;
      this.modalEl = null;
      this.badgeEl = null;
      this._avatarCache = new Map();
      this._paused = [];
      this.ready = this.init().catch(e => { console.warn("[conta]", e); });
      window.addEventListener("depthgate:cloud_sync", () => this.refreshViews());
      const ui = () => { this.injectStyles(); };
      document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ui) : ui();
    }

    /* ── perfil local (vale offline e antes da nuvem responder) ── */
    loadProfile() {
      try { const raw = localStorage.getItem(STORAGE_PROFILE_KEY); if (raw) { const p = JSON.parse(raw); delete p.password_hash; return { avatarType: "hero", avatarHero: "warrior", ...p }; } } catch (e) {}
      return { username: "Aventureiro", avatarType: "hero", avatarHero: "warrior", avatarCustom: null, email: null, isRegistered: false };
    }
    saveProfile(data) {
      this.profile = { ...this.profile, ...data };
      try { localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(this.profile)); } catch (e) {}
      window.dispatchEvent(new CustomEvent("depthgate:user_updated", { detail: this.profile }));
    }
    emitAuth() {
      window.dispatchEvent(new CustomEvent("depthgate:auth", { detail: { user: this.user, anonymous: this.isAnonymous(), profile: this.cloud } }));
    }
    isAnonymous() { return !this.user || !!this.user.is_anonymous; }
    pending() { try { const p = JSON.parse(localStorage.getItem(PENDING_KEY) || "null"); return p && p.email && Date.now() - (p.t || 0) < 14 * 864e5 ? p : null; } catch (e) { return null; } }
    setPending(email) { try { email ? localStorage.setItem(PENDING_KEY, JSON.stringify({ email, t: Date.now() })) : localStorage.removeItem(PENDING_KEY); } catch (e) {} }
    /* o e-mail do convidado já foi confirmado (a conta virou permanente), mas ainda falta a senha */
    needsPassword() {
      const p = this.pending();
      return !!(p && this.user && !this.isAnonymous() && String(this.user.email || "").toLowerCase() === p.email.toLowerCase());
    }
    /* busca o estado novo do usuário no servidor (o link pode ter sido aberto em outro aparelho/navegador) */
    async recheck() {
      if (!this.sb || !this.user) return;
      try { await this.sb.auth.refreshSession(); } catch (e) {}
      try { const { data } = await this.sb.auth.getUser(); if (data?.user) this.user = data.user; } catch (e) {}
      if (this.needsPassword() && this._pendPass) {
        try { await this.setPassword(this._pendPass); this._pendDone = 1; } catch (e) { console.warn("[conta] senha", e?.message); }
        this._pendPass = null;
      }
      if (this.needsPassword() && !this.modalEl?.classList.contains("open")) this.openModal();
      this.refreshViews(); this.emitAuth();
    }
    provider() {
      const ids = (this.user?.identities || []).map(i => i.provider);
      return ids.includes("google") ? "google" : ids.includes("email") ? "email" : this.user ? "anonymous" : null;
    }

    /* ── inicialização: sessão salva → conta anônima se não houver → perfil na nuvem ── */
    async init() {
      // limpa restos do login antigo (senhas locais)
      try { localStorage.removeItem("depthgate:user_accounts"); localStorage.removeItem("depthgate:auth_session"); } catch (e) {}
      if (!window.supabase?.createClient) { this.online = false; return; }
      this.sb = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "depthgate:sb-auth" }
      });
      window.DGCloud = this;
      this.sb.auth.onAuthStateChange((ev, session) => {
        const prev = this.user?.id;
        this.user = session?.user || null;
        if (this.user && this.user.id !== prev) this.ensureProfile().catch(() => {});
        // (nada de chamada ao Supabase dentro deste callback: trava o cliente — vai para o próximo ciclo)
        if (ev === "USER_UPDATED" && this.needsPassword() && this._pendPass) setTimeout(() => this.recheck(), 0);
        else if (ev === "USER_UPDATED" && this.needsPassword() && !this.modalEl?.classList.contains("open")) setTimeout(() => this.openModal(), 300);
        this.refreshViews(); this.emitAuth();
      });
      try {
        const r = await fetch(`${SUPA_URL}/auth/v1/settings`, { headers: { apikey: SUPA_KEY } });
        if (r.ok) {
          const s = await r.json(), ex = s.external || {};
          this.providers = { google: !!ex.google, email: ex.email !== false, anonymous: !!(ex.anonymous_users ?? s.anonymous_users ?? false) };
          this.online = true;
        }
      } catch (e) { this.online = false; }
      const { data } = await this.sb.auth.getSession();
      this.user = data?.session?.user || null;
      if (!this.user && this.online && this.providers.anonymous) {
        const { data: d2, error } = await this.sb.auth.signInAnonymously();
        if (!error) this.user = d2?.user || null;
      }
      if (this.user) await this.ensureProfile();
      this.refreshViews(); this.emitAuth();
      // voltou do link de confirmação (ou confirmou em outro aparelho): pede a senha
      if (this.pending()) {
        if (!this.needsPassword()) await this.recheck();
        else setTimeout(() => this.openModal(), 1200);
        document.addEventListener("visibilitychange", () => { if (!document.hidden && this.pending()) this.recheck(); });
      }
    }

    /* cria/carrega a linha em dg_profiles; o nome vem do perfil local (único — ganha número se repetir) */
    async ensureProfile() {
      if (!this.sb || !this.user) return null;
      const { data: rows, error } = await this.sb.from("dg_profiles").select("id,username,friend_code,avatar_hero").eq("id", this.user.id).limit(1);
      if (error) { console.warn("[conta] perfil", error.message); return null; }
      if (rows && rows[0]) { this.cloud = rows[0]; }
      else {
        let base = cleanName(this.profile.username); if (!NAME_RE.test(base) || /^aventureiro$/i.test(base)) base = "Heroi";
        for (let i = 0; i < 6; i++) {
          const name = i === 0 && base !== "Heroi" ? base : (base.slice(0, 11) + Math.floor(1000 + Math.random() * 9000));
          const ins = await this.sb.from("dg_profiles").insert({ id: this.user.id, username: name, avatar_hero: this.profile.avatarHero || "warrior" }).select("id,username,friend_code,avatar_hero").single();
          if (!ins.error) { this.cloud = ins.data; break; }
          if (ins.error.code !== "23505") { console.warn("[conta] criar perfil", ins.error.message); break; }
        }
      }
      if (this.cloud) this.saveProfile({ username: this.cloud.username, avatarHero: this.cloud.avatar_hero, avatarType: "hero", friendCode: this.cloud.friend_code, email: this.user.email || null, isRegistered: !this.isAnonymous() });
      this.refreshViews();
      if (this.cloud) this.emitAuth();
      return this.cloud;
    }

    /* ── ações de conta ── */
    redirectUrl() { return location.origin + location.pathname; }
    async signInGoogle() {
      if (!this.sb) throw new Error(L3("Sem conexão com o servidor.", "No connection to the server.", "Sin conexión con el servidor."));
      // convidado: tenta vincular o Google à mesma conta (mantém progresso e amigos)
      if (this.user && this.isAnonymous() && this.sb.auth.linkIdentity) {
        const { error } = await this.sb.auth.linkIdentity({ provider: "google", options: { redirectTo: this.redirectUrl() } });
        if (!error) return;
      }
      const { error } = await this.sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: this.redirectUrl() } });
      if (error) throw error;
    }
    async signUpEmail(email, password) {
      if (!this.sb) throw new Error(L3("Sem conexão com o servidor.", "No connection to the server.", "Sin conexión con el servidor."));
      if (this.user && this.isAnonymous()) {          // convidado vira conta permanente (mesmo id)
        // 1º o e-mail (o Supabase manda o link); a senha só depois da confirmação — veja needsPassword()
        const { error } = await this.sb.auth.updateUser({ email }, { emailRedirectTo: this.redirectUrl() });
        if (error) throw error;
        this.setPending(email);
        if (password) this._pendPass = password;     // só na memória desta aba: se ela continuar aberta, a senha entra sozinha
        return "confirm";
      }
      const { data, error } = await this.sb.auth.signUp({ email, password, options: { emailRedirectTo: this.redirectUrl() } });
      if (error) throw error;
      return data?.session ? "ok" : "confirm";
    }
    async setPassword(password) {
      const { error } = await this.sb.auth.updateUser({ password });
      if (error) throw error;
      this.setPending(null);
    }
    async signInEmail(email, password) {
      if (!this.sb) throw new Error(L3("Sem conexão com o servidor.", "No connection to the server.", "Sin conexión con el servidor."));
      const { error } = await this.sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.setPending(null);
    }
    async resetPassword(email) {
      if (!this.sb) throw new Error(L3("Sem conexão com o servidor.", "No connection to the server.", "Sin conexión con el servidor."));
      const { error } = await this.sb.auth.resetPasswordForEmail(email, { redirectTo: this.redirectUrl() });
      if (error) throw error;
    }
    async signOut() {
      if (!this.sb) return;
      await this.sb.auth.signOut();
      this.setPending(null); this._pendPass = null;
      this.cloud = null; this.user = null;
      this.saveProfile({ username: "Aventureiro", isRegistered: false, email: null, friendCode: null });
      if (this.online && this.providers.anonymous) { const { data } = await this.sb.auth.signInAnonymously(); this.user = data?.user || null; if (this.user) await this.ensureProfile(); }
      this.refreshViews(); this.emitAuth();
    }
    async updateCloudProfile(username, avatarHero) {
      const name = cleanName(username);
      if (!NAME_RE.test(name)) throw new Error(L3("O nome precisa ter de 3 a 16 letras ou números.", "The name needs 3 to 16 letters or numbers.", "El nombre necesita de 3 a 16 letras o números."));
      this.saveProfile({ username: name, avatarHero, avatarType: "hero" });
      if (!this.sb || !this.user || !this.cloud) return "local";
      const { data, error } = await this.sb.from("dg_profiles").update({ username: name, avatar_hero: avatarHero }).eq("id", this.user.id).select("id,username,friend_code,avatar_hero").single();
      if (error) {
        if (error.code === "23505") throw new Error(L3("Esse nome já está em uso. Tente outro.", "That name is taken. Try another.", "Ese nombre ya está en uso. Prueba otro."));
        throw error;
      }
      this.cloud = data; this.saveProfile({ username: data.username, avatarHero: data.avatar_hero, friendCode: data.friend_code });
      return "cloud";
    }

    /* ── API usada pelo jogo (mantida do módulo antigo) ── */
    getProfile() { return this.profile; }
    getAvatarUrl(profile = this.profile) {
      if (profile && profile.avatarType === "custom" && profile.avatarCustom) return profile.avatarCustom;
      return getHeroAvatarDataUrl((profile && profile.avatarHero) || "warrior");
    }
    getRankingAvatar(playerRow) {
      if (!playerRow) return getHeroAvatarDataUrl("warrior");
      if (playerRow.avatar) {
        if (playerRow.avatar.startsWith("data:") || playerRow.avatar.startsWith("http")) return playerRow.avatar;
        if (HERO_AVATARS[playerRow.avatar]) return getHeroAvatarDataUrl(playerRow.avatar);
      }
      const pName = String(playerRow.player_name || playerRow.name || "").trim();
      if (this.profile?.username && pName.toLowerCase() === this.profile.username.toLowerCase()) return this.getAvatarUrl();
      const cls = String(playerRow.class_id || playerRow.classId || "").toLowerCase();
      for (const k of Object.keys(HERO_AVATARS)) if (cls.includes(k)) return getHeroAvatarDataUrl(k);
      return getHeroAvatarDataUrl("warrior");
    }
    hideBadge() {}
    showBadge() {}
    friendCodeLabel() { return this.cloud?.friend_code ? "DG-" + this.cloud.friend_code : null; }

    /* ── janela de conta ── */
    injectStyles() {
      if (document.getElementById("dg-acc-css")) return;
      const st = document.createElement("style"); st.id = "dg-acc-css";
      st.textContent = `
#dg-acc{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(6,4,10,.78);font-family:Georgia,'Times New Roman',serif;color:#efe4c8}
#dg-acc.open{display:flex}
#dg-acc .box{position:relative;width:min(560px,94vw);max-height:92vh;overflow:auto;background:linear-gradient(#1c140e,#120c08);border:2px solid #8a6a2a;border-radius:10px;box-shadow:0 0 0 1px #3a2a14,0 12px 40px #000;padding:18px 20px 16px}
#dg-acc h2{margin:0 0 12px;text-align:center;font-size:20px;letter-spacing:2px;color:#ffd24a}
#dg-acc .x{position:absolute;top:8px;right:10px;background:none;border:0;color:#c9a24a;font-size:26px;cursor:pointer}
#dg-acc .head{display:flex;gap:12px;align-items:center;background:rgba(255,210,74,.06);border:1px solid #3a2a14;border-radius:8px;padding:10px}
#dg-acc .head img{width:58px;height:58px;border-radius:50%}
#dg-acc .nm{font-size:17px;font-weight:bold}
#dg-acc .tag{display:inline-block;margin-top:3px;font:bold 10px system-ui,sans-serif;letter-spacing:1px;padding:2px 7px;border-radius:9px;background:#3a2a14;color:#e8c872}
#dg-acc .tag.on{background:#1f3a24;color:#8ae0b0}
#dg-acc .code{margin-left:auto;text-align:right;font:11px system-ui,sans-serif;color:#a89878}
#dg-acc .code b{display:block;font:bold 16px ui-monospace,monospace;color:#c9b8ff;letter-spacing:1px}
#dg-acc .sec{margin-top:14px;border-top:1px solid #3a2a14;padding-top:12px}
#dg-acc .lbl{font:bold 10px system-ui,sans-serif;letter-spacing:1px;color:#a89878;margin-bottom:6px}
#dg-acc input{width:100%;box-sizing:border-box;background:#0d0906;border:1px solid #5a4422;border-radius:6px;color:#efe4c8;padding:9px 10px;font:15px system-ui,sans-serif;margin-bottom:8px}
#dg-acc input:focus{outline:2px solid #ffd24a}
#dg-acc .heroes{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
#dg-acc .heroes button{width:44px;height:44px;padding:0;border-radius:50%;border:2px solid transparent;background:none;cursor:pointer}
#dg-acc .heroes button.sel{border-color:#ffd24a}
#dg-acc .heroes img{width:100%;height:100%}
#dg-acc .btn{display:block;width:100%;box-sizing:border-box;margin:6px 0;padding:10px;border-radius:6px;border:1px solid #8a6a2a;background:#2a1f12;color:#ffe9a8;font:bold 13px system-ui,sans-serif;letter-spacing:1px;cursor:pointer}
#dg-acc .btn.pri{background:#6a1e1a;border-color:#c9a24a}
#dg-acc .btn.google{background:#fff;color:#1f1f1f;border-color:#ddd}
#dg-acc .btn:focus,#dg-acc .heroes button:focus,#dg-acc .x:focus{outline:2px solid #ffd24a;outline-offset:2px}
#dg-acc .row{display:flex;gap:8px}#dg-acc .row .btn{flex:1}
#dg-acc .link{background:none;border:0;color:#c9a24a;text-decoration:underline;cursor:pointer;font:12px system-ui,sans-serif;padding:4px 0}
#dg-acc .msg{min-height:16px;font:12px system-ui,sans-serif;margin-top:6px}
#dg-acc .msg.err{color:#ff8a6a}#dg-acc .msg.ok{color:#8ae0b0}
#dg-acc .hint{font:11px system-ui,sans-serif;color:#8a7f66;line-height:1.45;margin-top:6px}
#dg-acc .off{background:#3a1a14;border:1px solid #7a3a2a;border-radius:6px;padding:8px;font:12px system-ui,sans-serif;color:#ffb89a;margin-top:10px}`;
      document.head.appendChild(st);
    }
    createModal() {
      if (this.modalEl) return;
      const m = document.createElement("div"); m.id = "dg-acc"; m.setAttribute("role", "dialog");
      m.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Escape") this.closeModal(); }, !0);
      m.addEventListener("keyup", e => e.stopPropagation(), !0);
      m.addEventListener("click", e => { if (e.target === m) this.closeModal(); });
      document.body.appendChild(m); this.modalEl = m;
    }
    render() {
      const m = this.modalEl; if (!m) return;
      const p = this.profile, anon = this.isAnonymous(), prov = this.provider(), code = this.friendCodeLabel();
      const status = !this.user ? L3("SÓ NESTE APARELHO", "THIS DEVICE ONLY", "SOLO EN ESTE DISPOSITIVO")
        : anon ? L3("CONVIDADO", "GUEST", "INVITADO") : prov === "google" ? "GOOGLE" : L3("CONTA CONECTADA", "ACCOUNT CONNECTED", "CUENTA CONECTADA");
      m.innerHTML = `<div class="box">
  <button class="x" data-a="close" aria-label="Fechar">&times;</button>
  <h2>${L3("CONTA", "ACCOUNT", "CUENTA")}</h2>
  <div class="head"><img src="${this.getAvatarUrl()}" alt=""><div><div class="nm">${esc(p.username || "Aventureiro")}</div><span class="tag ${anon ? "" : "on"}">${status}</span>
    ${!anon && this.user?.email ? `<div class="hint" style="margin:3px 0 0">${esc(this.user.email)}</div>` : ""}
    ${window.DGSave?.lastSync ? `<div class="hint" style="margin:3px 0 0;color:#8ae0b0">☁ ${L3("Progresso salvo na nuvem às", "Progress saved to the cloud at", "Progreso guardado en la nube a las")} ${new Date(window.DGSave.lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>` : ""}</div>
    ${code ? `<div class="code">${L3("Seu código de amigo", "Your friend code", "Tu código de amigo")}<b>${esc(code)}</b><button class="link" data-a="copy">${L3("copiar", "copy", "copiar")}</button></div>` : ""}</div>
  <div class="sec"><div class="lbl">${L3("NOME NO JOGO", "IN-GAME NAME", "NOMBRE EN EL JUEGO")}</div>
    <input id="dg-acc-name" maxlength="16" value="${esc(p.username || "")}" autocomplete="nickname">
    <div class="lbl">${L3("AVATAR", "AVATAR", "AVATAR")}</div>
    <div class="heroes">${Object.keys(HERO_AVATARS).map(k => `<button data-hero="${k}" class="${p.avatarHero === k ? "sel" : ""}" title="${HERO_AVATARS[k].name}"><img src="${getHeroAvatarDataUrl(k)}" alt=""></button>`).join("")}</div>
    <button class="btn pri" data-a="save">${L3("SALVAR PERFIL", "SAVE PROFILE", "GUARDAR PERFIL")}</button>
    <div class="msg" id="dg-acc-pmsg"></div></div>
  <div class="sec">${this.needsPassword() ? `
    <div class="lbl">${L3("CRIE SUA SENHA", "CREATE YOUR PASSWORD", "CREA TU CONTRASEÑA")}</div>
    <div class="hint" style="margin:0 0 8px">${L3("E-mail confirmado! Falta só a senha para entrar com", "E-mail confirmed! Just set a password to sign in with", "¡Correo confirmado! Solo falta la contraseña para entrar con")} <b>${esc(this.user.email)}</b>.</div>
    <input id="dg-acc-pass" type="password" placeholder="${L3("senha (mín. 6)", "password (min. 6)", "contraseña (mín. 6)")}" autocomplete="new-password">
    <button class="btn pri" data-a="setpass">${L3("SALVAR SENHA", "SAVE PASSWORD", "GUARDAR CONTRASEÑA")}</button>`
    : anon && this.pending() ? `
    <div class="lbl">${L3("CONFIRME SEU E-MAIL", "CONFIRM YOUR E-MAIL", "CONFIRMA TU CORREO")}</div>
    <div class="hint" style="margin:0 0 8px">${L3("Mandamos um link para", "We sent a link to", "Enviamos un enlace a")} <b>${esc(this.pending().email)}</b>. ${L3("Abra o link (pode ser no celular) e depois toque em JÁ CONFIRMEI. Em seguida você cria a senha.", "Open the link (on any device), then tap I CONFIRMED. Then you create your password.", "Abre el enlace (en cualquier dispositivo) y luego toca YA CONFIRMÉ. Después creas la contraseña.")}</div>
    <button class="btn pri" data-a="recheck">${L3("JÁ CONFIRMEI", "I CONFIRMED", "YA CONFIRMÉ")}</button>
    <div class="row"><button class="btn" data-a="resend">${L3("REENVIAR LINK", "RESEND LINK", "REENVIAR ENLACE")}</button><button class="btn" data-a="cancelpend">${L3("USAR OUTRO E-MAIL", "USE ANOTHER E-MAIL", "USAR OTRO CORREO")}</button></div>`
    : anon ? `
    <div class="lbl">${L3("ENTRAR / CRIAR CONTA", "SIGN IN / CREATE ACCOUNT", "ENTRAR / CREAR CUENTA")}</div>
    <div class="hint" style="margin:0 0 8px">${L3("Com conta, seu progresso da campanha e do Modo Infinito fica salvo na nuvem e seus amigos te encontram em qualquer aparelho.", "With an account, your campaign and Endless progress is saved in the cloud and friends can find you on any device.", "Con cuenta, tu progreso de campaña y del Modo Infinito se guarda en la nube y tus amigos te encuentran en cualquier dispositivo.")}</div>
    ${this.providers.google ? `<button class="btn google" data-a="google">G&nbsp;&nbsp;${L3("ENTRAR COM GOOGLE", "SIGN IN WITH GOOGLE", "ENTRAR CON GOOGLE")}</button>` : ""}
    ${this.providers.email ? `<input id="dg-acc-mail" type="email" placeholder="email@exemplo.com" autocomplete="email">
    <input id="dg-acc-pass" type="password" placeholder="${L3("senha (mín. 6)", "password (min. 6)", "contraseña (mín. 6)")}" autocomplete="current-password">
    <div class="row"><button class="btn" data-a="login">${L3("ENTRAR", "SIGN IN", "ENTRAR")}</button><button class="btn" data-a="signup">${L3("CRIAR CONTA", "CREATE ACCOUNT", "CREAR CUENTA")}</button></div>
    <button class="link" data-a="reset">${L3("esqueci a senha", "forgot password", "olvidé la contraseña")}</button>` : ""}`
        : `<div class="lbl">${L3("CONTA", "ACCOUNT", "CUENTA")}</div><div class="hint" style="margin:0 0 8px">${L3("Seu progresso e seus amigos acompanham esta conta em qualquer aparelho.", "Your progress and friends follow this account on any device.", "Tu progreso y tus amigos siguen esta cuenta en cualquier dispositivo.")}</div>
    <button class="btn" data-a="logout">${L3("SAIR DA CONTA", "SIGN OUT", "CERRAR SESIÓN")}</button>`}
    <div class="msg" id="dg-acc-amsg"></div>
    ${!this.online ? `<div class="off">${L3("Sem conexão com o servidor agora. O jogo continua salvando neste aparelho; a conta conecta quando a internet voltar.", "No connection to the server right now. The game keeps saving on this device; the account connects when you're back online.", "Sin conexión con el servidor ahora. El juego sigue guardando en este dispositivo; la cuenta conecta cuando vuelva internet.")}</div>` : ""}
  </div></div>`;
      m.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => this.onAction(b.dataset.a)));
      m.querySelectorAll("[data-hero]").forEach(b => b.addEventListener("click", () => { m.querySelectorAll("[data-hero]").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); this._pickHero = b.dataset.hero; }));
      this._pickHero = p.avatarHero || "warrior";
    }
    msg(id, text, ok) { const el = this.modalEl?.querySelector("#" + id); if (el) { el.textContent = text || ""; el.className = "msg " + (ok ? "ok" : "err"); } }
    errText(e) {
      const t = String(e?.message || e || "");
      if (/Invalid login credentials/i.test(t)) return L3("E-mail ou senha incorretos.", "Wrong e-mail or password.", "Correo o contraseña incorrectos.");
      if (/Email not confirmed/i.test(t)) return L3("Confirme o e-mail pelo link que enviamos antes de entrar.", "Confirm your e-mail with the link we sent before signing in.", "Confirma el correo con el enlace que enviamos antes de entrar.");
      if (/already (registered|been registered)|already exists/i.test(t)) return L3("Esse e-mail já tem conta. Use ENTRAR.", "That e-mail already has an account. Use SIGN IN.", "Ese correo ya tiene cuenta. Usa ENTRAR.");
      if (/Password should be at least/i.test(t)) return L3("A senha precisa ter pelo menos 6 caracteres.", "The password needs at least 6 characters.", "La contraseña necesita al menos 6 caracteres.");
      if (/reauthenticat/i.test(t)) return L3("Por segurança, entre de novo com o e-mail e crie a senha em \"esqueci a senha\".", "For security, use \"forgot password\" to set the password.", "Por seguridad, usa \"olvidé la contraseña\" para crear la contraseña.");
      if (/same.*password|different from the old/i.test(t)) return L3("Escolha uma senha diferente da anterior.", "Choose a different password.", "Elige una contraseña diferente.");
      if (/rate limit|too many|security purposes/i.test(t)) return L3("Muitas tentativas. Espere um pouco e tente de novo.", "Too many attempts. Wait a bit and try again.", "Demasiados intentos. Espera un poco e inténtalo de nuevo.");
      if (/fetch|network/i.test(t)) return L3("Sem conexão com o servidor.", "No connection to the server.", "Sin conexión con el servidor.");
      return t || L3("Algo deu errado. Tente de novo.", "Something went wrong. Try again.", "Algo salió mal. Inténtalo de nuevo.");
    }
    async onAction(a) {
      const m = this.modalEl, mail = () => (m.querySelector("#dg-acc-mail")?.value || "").trim(), pass = () => m.querySelector("#dg-acc-pass")?.value || "";
      const okMail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      try {
        if (a === "close") return this.closeModal();
        if (a === "copy") { const c = this.friendCodeLabel(); try { await navigator.clipboard.writeText(c); } catch (e) {} return this.msg("dg-acc-pmsg", L3(`Código ${c} copiado.`, `Code ${c} copied.`, `Código ${c} copiado.`), !0); }
        if (a === "save") { const r = await this.updateCloudProfile(m.querySelector("#dg-acc-name").value, this._pickHero); this.render(); return this.msg("dg-acc-pmsg", r === "cloud" ? L3("Perfil salvo.", "Profile saved.", "Perfil guardado.") : L3("Perfil salvo neste aparelho.", "Profile saved on this device.", "Perfil guardado en este dispositivo."), !0); }
        if (a === "google") { this.msg("dg-acc-amsg", L3("Abrindo o Google…", "Opening Google…", "Abriendo Google…"), !0); return await this.signInGoogle(); }
        if (a === "login" || a === "signup" || a === "reset") {
          if (!okMail(mail())) return this.msg("dg-acc-amsg", L3("Digite um e-mail válido.", "Type a valid e-mail.", "Escribe un correo válido."));
          if (a === "reset") { await this.resetPassword(mail()); return this.msg("dg-acc-amsg", L3("Enviamos um link para criar uma senha nova.", "We sent a link to set a new password.", "Enviamos un enlace para crear una contraseña nueva."), !0); }
          if (pass().length < 6) return this.msg("dg-acc-amsg", L3("A senha precisa ter pelo menos 6 caracteres.", "The password needs at least 6 characters.", "La contraseña necesita al menos 6 caracteres."));
          if (a === "login") { await this.signInEmail(mail(), pass()); this.render(); return this.msg("dg-acc-amsg", L3("Pronto, conta conectada.", "Done, account connected.", "Listo, cuenta conectada."), !0); }
          const r = await this.signUpEmail(mail(), pass()); this.render();
          return this.msg("dg-acc-amsg", r === "confirm" ? L3("Quase lá: abra o link que mandamos para o seu e-mail.", "Almost there: open the link we sent to your e-mail.", "Casi listo: abre el enlace que enviamos a tu correo.") : L3("Conta criada!", "Account created!", "¡Cuenta creada!"), !0);
        }
        if (a === "setpass") {
          if (pass().length < 6) return this.msg("dg-acc-amsg", L3("A senha precisa ter pelo menos 6 caracteres.", "The password needs at least 6 characters.", "La contraseña necesita al menos 6 caracteres."));
          await this.setPassword(pass()); this.render();
          return this.msg("dg-acc-amsg", L3("Conta criada! Use este e-mail e senha para entrar em qualquer aparelho.", "Account created! Use this e-mail and password on any device.", "¡Cuenta creada! Usa este correo y contraseña en cualquier dispositivo."), !0);
        }
        if (a === "recheck") {
          this._pendDone = 0; await this.recheck(); this.render();
          if (this._pendDone) return this.msg("dg-acc-amsg", L3("Conta criada! Use este e-mail e senha para entrar em qualquer aparelho.", "Account created! Use this e-mail and password on any device.", "¡Cuenta creada! Usa este correo y contraseña en cualquier dispositivo."), !0);
          return this.needsPassword() ? this.msg("dg-acc-amsg", L3("E-mail confirmado. Agora crie a senha.", "E-mail confirmed. Now create the password.", "Correo confirmado. Ahora crea la contraseña."), !0)
            : this.msg("dg-acc-amsg", L3("Ainda não chegou a confirmação. Abra o link do e-mail (veja também o spam).", "Not confirmed yet. Open the link in the e-mail (check spam too).", "Aún no se confirmó. Abre el enlace del correo (revisa también el spam)."));
        }
        if (a === "resend") { const p = this.pending(); await this.signUpEmail(p.email); return this.msg("dg-acc-amsg", L3("Link reenviado.", "Link sent again.", "Enlace reenviado."), !0); }
        if (a === "cancelpend") { this.setPending(null); this.render(); return; }
        if (a === "logout") { await this.signOut(); this.render(); return this.msg("dg-acc-amsg", L3("Você saiu da conta.", "You signed out.", "Cerraste sesión."), !0); }
      } catch (e) { this.msg(a === "save" || a === "copy" ? "dg-acc-pmsg" : "dg-acc-amsg", this.errText(e)); }
    }
    refreshViews() { if (this.modalEl?.classList.contains("open")) { const f = document.activeElement?.id; this.render(); f && this.modalEl.querySelector("#" + f)?.focus(); } }
    openModal() {
      this.createModal(); this.render(); this.modalEl.classList.add("open");
      // pausa as cenas do jogo enquanto a janela está aberta (teclado/controle não vazam para o jogo)
      try { const g = window.__DED_GAME; this._paused = g.scene.getScenes(!0).filter(s => !s.sys.isPaused()); this._paused.forEach(s => s.scene.pause()); } catch (e) { this._paused = []; }
      setTimeout(() => this.modalEl.querySelector("[data-a=close]")?.focus(), 30);
      if (!this._escH) { this._escH = e => { if (this.modalEl?.classList.contains("open")) { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); this.closeModal(); } } }; }
      document.addEventListener("keydown", this._escH, !0);
      this._padLoop();
    }
    closeModal() {
      if (!this.modalEl?.classList.contains("open")) return;
      this.modalEl.classList.remove("open");
      try { this._paused.forEach(s => s.scene.isPaused() && s.scene.resume()); } catch (e) {}
      this._paused = []; cancelAnimationFrame(this._padRaf);
      this._escH && document.removeEventListener("keydown", this._escH, !0);
    }
    /* controle: direcional anda pelos botões, A confirma, B fecha */
    _padLoop() {
      const prev = this._padPrev || {};
      const tick = () => {
        if (!this.modalEl?.classList.contains("open")) return;
        let g = null; try { g = Array.from(navigator.getGamepads?.() || []).find(p => p && p.connected); } catch (e) {}
        if (g) {
          const b = i => !!g.buttons[i]?.pressed, ax = g.axes || [];
          const st = { a: b(0), b: b(1), up: b(12) || ax[1] < -.6, dn: b(13) || ax[1] > .6, lf: b(14) || ax[0] < -.6, rt: b(15) || ax[0] > .6 };
          const items = [...this.modalEl.querySelectorAll("button,input")].filter(x => x.offsetParent);
          const i = items.indexOf(document.activeElement);
          const mv = d => { const n = items[(Math.max(0, i) + d + items.length) % items.length]; n?.focus(); };
          if (st.dn && !prev.dn || st.rt && !prev.rt) mv(1);
          if (st.up && !prev.up || st.lf && !prev.lf) mv(-1);
          if (st.a && !prev.a) document.activeElement?.click?.();
          if (st.b && !prev.b) this.closeModal();
          Object.assign(prev, st);
        }
        this._padPrev = prev; this._padRaf = requestAnimationFrame(tick);
      };
      // ignora o botão que abriu a janela
      try { const g = Array.from(navigator.getGamepads?.() || []).find(p => p && p.connected); if (g) Object.assign(prev, { a: !!g.buttons[0]?.pressed, b: !!g.buttons[1]?.pressed }); } catch (e) {}
      this._padRaf = requestAnimationFrame(tick);
    }
  }

  window.DepthGateUser = new DepthGateAccount();
})(window);
