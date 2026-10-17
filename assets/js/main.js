/* ==========================================================
   CONCEPT — comportamento del sito (vanilla JS, nessuna dipendenza)
   Core: header, menu, titoli, reveal, FAQ, form a passi, tracker.
   Il movimento avanzato sta in motion.js.
   ========================================================== */
(() => {
  "use strict";

  const CFG = window.CONCEPT_SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- fascia demo ---------- */
  const ribbon = $("[data-demo]");
  if (ribbon) ribbon.hidden = !CFG.demoRibbon;

  /* ---------- header: ombra, offset fascia demo, menu mobile ---------- */
  const header = $(".site-header");
  const burger = $(".burger");
  const menu = $("#menu");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  matchMedia("(min-width: 900px)").addEventListener("change", () => setMenu(false));

  /* ---------- titoli a parole ---------- */
  $$("[data-split]").forEach((el) => {
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) return frag.appendChild(document.createTextNode(" "));
          const w = document.createElement("span");
          w.className = "w";
          w.setAttribute("aria-hidden", "true");
          const s = document.createElement("span");
          s.style.setProperty("--i", i++);
          s.textContent = tok;
          w.appendChild(s);
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el);
  });

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
  $$(".hero .reveal").forEach((el, i) => el.style.setProperty("--rd", `${600 + i * 110}ms`));
  $$("[data-stagger]").forEach((g) => $$(".reveal", g).forEach((el, i) => el.style.setProperty("--rd", `${i * 110}ms`)));
  $$(".reveal, [data-split]").forEach((el) => io.observe(el));
  const vizIO = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)), { threshold: 0.3 });
  $$(".tcard, .ems-viz").forEach((el) => vizIO.observe(el));

  /* ---------- scroll: header e parallax dell'hero ---------- */
  const heroStage = $(".hero-stage");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const rbOn = ribbon && !ribbon.hidden;
      header.style.setProperty("--rb", `${rbOn ? Math.max(0, ribbon.offsetHeight - y) : 0}px`);
      header.classList.toggle("scrolled", y > 30 + (rbOn ? ribbon.offsetHeight : 0));
      if (!reduce && heroStage && y < innerHeight * 1.4) heroStage.style.setProperty("--py", (y * 0.18).toFixed(1));
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- link interni: scroll fluido con offset ---------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + scrollY - 70;
    scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", id);
    if (t.id === "iscriviti") setTimeout(() => $("#iscriviti .fs:not([hidden]) input")?.focus({ preventScroll: true }), reduce ? 0 : 800);
  }));

  /* ---------- bottoni magnetici ---------- */
  if (finePointer && !reduce) {
    $$(".btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.26}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  /* ---------- FAQ ---------- */
  const qs = $$(".acc-q");
  const setOpen = (btn, open) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.closest(".acc-item").classList.toggle("is-open", open);
  };
  qs.forEach((btn) => btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    qs.forEach((b) => setOpen(b, false));
    setOpen(btn, !open);
  }));
  qs[0] && setOpen(qs[0], true);

  /* ============================================================
     FORM (campi e testi dei form originali) — anche a passi
     ============================================================ */
  const MSG = {
    required: "Il campo è obbligatorio.",
    email: "Il formato dell’indirizzo e-mail inserito non è valido.",
    tel: "Il formato del numero di telefono inserito non è valido.",
    accept: "Devi accettare i termini e le condizioni prima di inviare il tuo messaggio.",
    invalid: "Uno o più campi contengono un errore. Controlla e riprova.",
    sent: "Grazie per il tuo messaggio. È stato inviato.",
    fail: "Si è verificato un errore nel tentativo di inviare il tuo messaggio. Riprova più tardi."
  };
  const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => /^(utm_|fbclid|gclid)/.test(k)));

  function validate(input) {
    const v = (input.value || "").trim();
    let err = "";
    if (input.type === "checkbox") { if (input.required && !input.checked) err = MSG.accept; }
    else if (input.required && !v) err = MSG.required;
    else if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = MSG.email;
    else if (v && input.type === "tel" && !/^(\+|00)?\d{8,14}$/.test(v.replace(/[\s.\-()]/g, ""))) err = MSG.tel;
    input.setAttribute("aria-invalid", String(!!err));
    const slot = input.closest(".field, .check")?.querySelector(".err") || input.closest(".check")?.nextElementSibling;
    if (slot && slot.classList.contains("err")) slot.textContent = err;
    return !err;
  }

  async function send(payload) {
    if (CFG.forms.endpoint) {
      const r = await fetch(CFG.forms.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return;
    }
    console.info("[demo] invio simulato:", payload);
    await new Promise((res) => setTimeout(res, 900));
  }

  function burst(card) {
    if (reduce) return;
    for (let i = 0; i < 24; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 130;
      c.style.setProperty("--x", `${Math.cos(a) * d}px`);
      c.style.setProperty("--y", `${Math.sin(a) * d - 40}px`);
      c.style.setProperty("--r", `${Math.random() * 540 - 270}deg`);
      c.style.animationDelay = `${Math.random() * 120}ms`;
      card.appendChild(c);
      setTimeout(() => c.remove(), 1400);
    }
  }

  const forms = $$("form.lead-form");
  forms.forEach((form) => {
    const status = $(".form-msg", form);
    const card = form.closest(".card");
    const inputs = $$("input:not([type=hidden]):not([type=radio]):not([name=website]), select", form);

    /* --- passi --- */
    const steps = $$(".fs", form);
    const stepped = form.hasAttribute("data-steps") && steps.length > 1;
    let step = 1;
    let started = false;
    const bar = $(".prog i", form), prog = $(".prog", form), cur = $("[data-cur]", form), backBtn = $("[data-back]", form);

    function go(n, back = false) {
      if (!stepped) return;
      step = Math.max(1, Math.min(steps.length, n));
      steps.forEach((fs) => {
        const on = +fs.dataset.step === step;
        fs.hidden = !on;
        fs.classList.toggle("back-in", on && back);
        if (on) { fs.style.animation = "none"; void fs.offsetWidth; fs.style.animation = ""; }
      });
      bar.style.width = `${(step / steps.length) * 100}%`;
      prog.setAttribute("aria-valuenow", step);
      cur.textContent = step;
      backBtn.hidden = step === 1;
      if (started) $("fieldset:not([hidden]) input", form)?.focus({ preventScroll: true });
    }
    form._go = go;

    if (stepped) {
      const markStarted = () => { started = true; };
      form.addEventListener("click", (e) => {
        if (e.target.closest("[data-next], [data-skip]")) { markStarted(); go(step + 1); }
        if (e.target.closest("[data-back]")) go(step - 1, true);
        // avanzamento automatico solo con tocco/mouse (un click su <label> genera anche un click sull'<input>)
        if (e.target.matches(".chip input") && e.detail > 0 && step < steps.length) {
          markStarted();
          const from = step;
          setTimeout(() => step === from && go(from + 1), reduce ? 0 : 280);
        }
      });
      form.addEventListener("input", markStarted, { once: true });
    }

    /* --- validazione --- */
    inputs.forEach((i) => {
      i.addEventListener("blur", () => i.value !== "" && validate(i));
      i.addEventListener("input", () => i.getAttribute("aria-invalid") === "true" && validate(i));
      i.addEventListener("change", () => i.type === "checkbox" && validate(i));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = ""; status.dataset.state = "";
      if ($("[name=website]", form).value) return; // honeypot
      const bad = inputs.filter((i) => !validate(i));
      if (bad.length) {
        status.textContent = MSG.invalid; status.dataset.state = "err";
        bad[0].focus();
        return;
      }
      form.classList.add("is-loading");
      const fd = new FormData(form);
      const payload = { form: form.dataset.form, page: location.pathname, utm, ts: new Date().toISOString() };
      inputs.filter((i) => i.type === "checkbox").forEach((i) => (payload[i.name] = i.checked));
      fd.forEach((v, k) => { if (k !== "website" && !(k in payload)) payload[k] = v; });
      try {
        await send(payload);
        form.classList.remove("is-loading");
        const ok = card && $(".success", card);
        if (ok) {
          form.hidden = true;
          $(".form-head", card)?.setAttribute("hidden", "");
          ok.hidden = false;
          const note = $("[data-demo-note]", ok);
          if (note) note.hidden = !!CFG.forms.endpoint;
          ok.focus({ preventScroll: true });
          burst(card);
        } else {
          status.textContent = MSG.sent; status.dataset.state = "ok";
        }
        form.reset();
        window.dispatchEvent(new CustomEvent("concept:lead", { detail: payload }));
        if (window.fbq && ConceptConsent.get()?.advertisement) window.fbq("track", "Lead");
        if (window.gtag && ConceptConsent.get()?.analytics) window.gtag("event", "generate_lead", { form: form.dataset.form });
      } catch (ex) {
        form.classList.remove("is-loading");
        status.textContent = MSG.fail; status.dataset.state = "err";
      }
    });
  });

  // API per altri componenti (es. simulatore): precompila un campo e avanza
  window.ConceptForms = {
    prefill(name, value) {
      forms.filter((f) => f._go).forEach((f) => {
        const r = $(`input[name="${name}"][value="${CSS.escape(value)}"]`, f);
        if (r) { r.checked = true; f._go(2); }
      });
    }
  };

  /* ---------- tracker: solo dopo il consenso ---------- */
  const loaded = {};
  const addScript = (src) => { const s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); };
  function applyConsent(c) {
    const T = CFG.tracking;
    if (c.analytics && T.ga4Id && !loaded.ga) {
      loaded.ga = 1;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", T.ga4Id, { anonymize_ip: true });
      addScript(`https://www.googletagmanager.com/gtag/js?id=${T.ga4Id}`);
    }
    if (c.advertisement && T.googleAdsId && !loaded.ads) {
      loaded.ads = 1;
      if (!window.gtag) { window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); }; addScript(`https://www.googletagmanager.com/gtag/js?id=${T.googleAdsId}`); }
      window.gtag("config", T.googleAdsId);
    }
    if (c.advertisement && T.metaPixelId && !loaded.meta) {
      loaded.meta = 1;
      /* eslint-disable */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      window.fbq("init", T.metaPixelId);
      window.fbq("track", "PageView");
    }
  }
  window.ConceptConsent && window.ConceptConsent.onChange(applyConsent);

  /* ---------- anno nel footer ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
