/* ==========================================================
   CONCEPT — movimento e interazioni avanzate
   Hero che misura · percorso a scroll · numeri · citazione ·
   simulatore · EMS · galleria · mappa · barra mobile · cursore ·
   transizioni tra pagine.
   Nessuna dipendenza. Rispetta prefers-reduced-motion.
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const onView = (els, fn, opts = { threshold: 0.25 }) => {
    const o = new IntersectionObserver((es) => es.forEach((e) => fn(e.isIntersecting, e.target)), opts);
    els.forEach((el) => o.observe(el));
  };

  /* ============================================================
     Transizione tra pagine (sipario lime)
     ============================================================ */
  const wipe = $(".wipe");
  if (wipe && !reduce) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      if (!/\.html?$|\/$/.test(u.pathname)) return;
      e.preventDefault();
      wipe.classList.add("out");
      setTimeout(() => (location.href = a.href), 520);
    });
    addEventListener("pageshow", (e) => e.persisted && wipe.classList.remove("out"));
  }

  /* ============================================================
     Hero: scansione + pannello dati
     ============================================================ */
  const hero = $(".hero-site");
  const hud = $(".hero-hud");
  if (hero && hud && !reduce) {
    const num = $("[data-hud-num]", hud);
    const rows = $$(".hud-row i", hud);
    const T = 5500;
    let run = false, t0 = 0;
    const tick = (t) => {
      if (!run) return;
      const ph = ((t - t0) % T) / T;
      num.textContent = String(Math.round(ph * 100)).padStart(2, "0");
      rows.forEach((r, i) => (r.style.transform = `scaleX(${clamp(ph * 3.3 - i * 0.75)})`));
      requestAnimationFrame(tick);
    };
    onView([hero], (vis) => {
      if (vis && !run) { run = true; t0 = performance.now(); requestAnimationFrame(tick); }
      else if (!vis) run = false;
    }, { threshold: 0.05 });
  } else if (hud) {
    $$(".hud-row i", hud).forEach((r) => (r.style.transform = "scaleX(1)"));
    $("[data-hud-num]", hud).textContent = "100";
  }

  /* ============================================================
     Contatori
     ============================================================ */
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    el.textContent = "0";
    onView([el.closest(".num") || el], (vis, host) => {
      if (!vis || host._done) return;
      host._done = true;
      const t0 = performance.now(), D = 1600;
      const step = (t) => {
        const p = clamp((t - t0) / D);
        el.textContent = Math.round(easeOut(p) * to);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
  });

  /* ============================================================
     Scroll: percorso a tappe, citazione, numeri di sezione, parallasse
     ============================================================ */
  const proc = $("[data-process]");
  const procSteps = proc ? $$(".pstep", proc) : [];
  const procBg = proc ? $$(".pbg", proc) : [];
  const procNums = proc ? $$(".process-num span", proc) : [];
  const procRail = proc ? $$(".process-rail span", proc) : [];
  let procCur = -1;
  const setProc = (i) => {
    procCur = i;
    [procSteps, procBg, procNums, procRail].forEach((list) => list.forEach((el, k) => el.classList.toggle("is-active", k === i)));
  };

  const scrubs = $$("[data-scrub]").map((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", words.join(" "));
    el.innerHTML = words.map((w) => `<span class="sw" aria-hidden="true">${w}</span>`).join(" ");
    return { el, sw: $$(".sw", el) };
  });
  const nums = $$("[data-num]");
  const stBg = $$(".statement-bg img");
  const para = $$("[data-parallax] img");

  let tick2 = false;
  function onScroll() {
    if (tick2) return;
    tick2 = true;
    requestAnimationFrame(() => {
      const vh = innerHeight;
      if (proc && !reduce) {
        const r = proc.getBoundingClientRect();
        const total = r.height - vh;
        const p = clamp(-r.top / total);
        proc.style.setProperty("--p", p.toFixed(3));
        const i = Math.min(procSteps.length - 1, Math.floor(p * procSteps.length));
        if (i !== procCur) setProc(i);
      }
      scrubs.forEach(({ el, sw }) => {
        const r = el.getBoundingClientRect();
        const p = reduce ? 1 : clamp((vh * 0.88 - r.top) / (vh * 0.55));
        const lit = Math.round(p * sw.length);
        sw.forEach((w, k) => {
          w.classList.toggle("on", k < lit);
          w.classList.toggle("hot", k >= sw.length - 3);
        });
      });
      if (!reduce) {
        nums.forEach((s) => {
          const r = s.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          s.style.setProperty("--ny", `${((r.top + r.height / 2 - vh / 2) * -0.12).toFixed(1)}px`);
        });
        stBg.forEach((img) => {
          const r = img.parentElement.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          img.style.setProperty("--ty", `${((r.top + r.height / 2 - vh / 2) * -0.1).toFixed(1)}px`);
        });
        para.forEach((img) => {
          const r = img.parentElement.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          img.style.setProperty("--ty", `${((r.top + r.height / 2 - vh / 2) * -0.06).toFixed(1)}px`);
        });
      }
      tick2 = false;
    });
  }
  if (proc && reduce) procSteps.forEach((el) => el.classList.add("is-active"));
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ============================================================
     Anello EMS: progresso + contatore
     ============================================================ */
  const ems = $(".ems-viz");
  if (ems) {
    const ring = $(".ems-prog", ems);
    const out = $("[data-ems-num]", ems);
    const L = 540;
    if (reduce) { ring.style.strokeDashoffset = 0; out.textContent = "20"; }
    else {
      const CYC = 8200;
      let run = false, t0 = 0;
      const f = (t) => {
        if (!run) return;
        const ph = ((t - t0) % CYC) / CYC;
        const p = ph < 0.68 ? easeInOut(ph / 0.68) : ph < 0.9 ? 1 : 1 - clamp((ph - 0.9) / 0.1);
        ring.style.strokeDashoffset = (L * (1 - p)).toFixed(1);
        out.textContent = Math.round(p * 20);
        requestAnimationFrame(f);
      };
      ring.style.strokeDashoffset = L;
      onView([ems], (vis) => {
        if (vis && !run) { run = true; t0 = performance.now(); requestAnimationFrame(f); }
        else if (!vis) run = false;
      }, { threshold: 0.2 });
    }
  }

  /* ============================================================
     Simulatore del check-up (esempio illustrativo)
     Le etichette degli obiettivi coincidono con quelle del modulo.
     ============================================================ */
  const SIM = {
    "Tonificazione (ripristino della silhouette)": {
      nodes: ["bia", "ems"],
      out: [["BIA", "analizziamo la composizione corporea: massa magra, massa grassa e idratazione."], ["EMS", "lavoro muscolare total-body in 20 minuti, dopo aver valutato l’idoneità."], ["Il tuo piano", "una strategia cucita sulle tue esigenze."]]
    },
    "Dimagrimento e Body Recomp": {
      nodes: ["bia", "spiro"],
      out: [["BIA", "oltre il peso: la tua reale composizione corporea."], ["Spirometria", "valutiamo la capacità respiratoria per sostenere le tue energie durante lo sforzo."], ["Il tuo piano", "costruito sui tuoi dati reali, non su una scheda uguale per tutti."]]
    },
    "Eliminare i dolori cronici": {
      nodes: ["stab"],
      out: [["Stabilometria e mobilità", "mappiamo postura e movimenti per individuare squilibri invisibili."], ["Onestà", "se dal check-up emerge un limite, te lo diciamo apertamente e ti consigliamo la strada migliore."], ["Il tuo piano", "pensato attorno alle tue esigenze."]]
    },
    "Benessere Psicofisico": {
      nodes: ["spiro", "stab"],
      out: [["Spirometria", "valutiamo la tua capacità respiratoria."], ["Stabilometria e mobilità", "mappiamo la tua postura e i tuoi movimenti."], ["Il tuo piano", "un percorso su misura, passo dopo passo."]]
    },
    "Far parte di una Community esclusiva": {
      nodes: ["bia"],
      out: [["Lo studio", "intimo, moderno e accogliente, pensato per non essere affollato."], ["Il team", "un gruppo di professionisti che si dedica a te, giorno dopo giorno."], ["Per iniziare", "check-up iniziale e analisi BIA gratuiti per chi si iscrive."]]
    }
  };
  const sim = $("[data-sim]");
  if (sim) {
    const chips = $("[data-sim-chips]", sim);
    const outEl = $("[data-sim-out]", sim);
    const cta = $("[data-prefill]", sim);
    const nodes = $$("[data-node]", sim);
    const links = $$("[data-link]", sim);
    chips.innerHTML = Object.keys(SIM).map((g) => {
      const m = g.match(/^(.*?)(\s*\(.*\))?$/);
      return `<label class="chip"><input type="radio" name="sim-goal" value="${g}"><span>${m[1]}${m[2] ? ` <small>${m[2].trim()}</small>` : ""}</span></label>`;
    }).join("");
    let goal = "";
    chips.addEventListener("change", (e) => {
      goal = e.target.value;
      const d = SIM[goal];
      nodes.forEach((n) => n.classList.toggle("on", d.nodes.includes(n.dataset.node)));
      links.forEach((l) => l.classList.toggle("on", d.nodes.includes(l.dataset.link)));
      outEl.innerHTML = d.out.map(([t, s], i) => `<li style="--i:${i}"><span><b>${t}</b>: ${s}</span></li>`).join("")
        + `<li style="--i:${d.out.length}"><span><b>Poi</b> sceglierai se allenarti con noi.</span></li>`;
      cta.hidden = false;
    });
    cta.addEventListener("click", () => window.ConceptForms && window.ConceptForms.prefill("your-obiettivo", goal));
  }

  /* ============================================================
     Galleria: frecce, indicatore, trascinamento col mouse
     ============================================================ */
  const track = $(".gallery .track");
  if (track) {
    const figs = $$("figure", track);
    const cur = $("[data-gcur]"), tot = $("[data-gtot]");
    const gal = track.closest(".gallery");
    const prev = $(".gal-btn.prev", gal), next = $(".gal-btn.next", gal);
    const pad = (n) => String(n).padStart(2, "0");
    tot.textContent = pad(figs.length);
    // le schede si allineano a inizio (con il margine laterale della galleria)
    const target = (i) => clamp(figs[i].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), 0, track.scrollWidth - track.clientWidth);
    const nearest = () => figs.reduce((best, _, i) => (Math.abs(target(i) - track.scrollLeft) < Math.abs(target(best) - track.scrollLeft) ? i : best), 0);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      gal.style.setProperty("--gp", (0.1 + p * 0.9).toFixed(3));
      cur.textContent = pad(max > 0 && track.scrollLeft > max - 4 ? figs.length : nearest() + 1);
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
    };
    const go = (i) => track.scrollTo({ left: target(clamp(i, 0, figs.length - 1)), behavior: reduce ? "auto" : "smooth" });
    track.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    prev.addEventListener("click", () => go(nearest() - 1));
    next.addEventListener("click", () => go(nearest() + 1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(nearest() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(nearest() - 1); }
    });

    let down = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add("dragging");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    const end = () => {
      if (!down) return;
      down = false;
      track.classList.remove("dragging");
      go(nearest());
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    update();
  }

  /* ============================================================
     Mappa: si carica solo su richiesta (o con consenso "Funzionali")
     ============================================================ */
  $$("[data-map]").forEach((m) => {
    const load = () => {
      if (m.classList.contains("loaded")) return;
      const f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=Piazza+Castello+3,+Casale+Monferrato&output=embed";
      f.title = "Mappa: Piazza Castello 3, Casale Monferrato";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      m.prepend(f);
      m.classList.add("loaded");
    };
    $("[data-map-load]", m).addEventListener("click", load);
    window.ConceptConsent && window.ConceptConsent.onChange((c) => c.functional && load());
  });

  /* ============================================================
     Barra mobile (Chiama / Prenota): compare quando non c'è un modulo in vista
     ============================================================ */
  const mbar = $("[data-mbar]");
  if (mbar) {
    const forms = $$("#iscriviti, #newsletter");
    const vis = new Set();
    let y = 0;
    const apply = () => {
      const show = y > 500 && vis.size === 0 && !document.body.classList.contains("menu-open");
      mbar.classList.toggle("show", show);
      document.body.classList.toggle("has-mbar", show);
    };
    onView(forms, (v, el) => { v ? vis.add(el) : vis.delete(el); apply(); }, { threshold: 0.12 });
    addEventListener("scroll", () => { y = scrollY; apply(); }, { passive: true });
    new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  /* ============================================================
     Menu: voce attiva in base alla sezione
     ============================================================ */
  const links = $$('.menu a[href^="#"]:not(.btn)');
  if (links.length) {
    const map = new Map(links.map((a) => [$(a.getAttribute("href")), a]).filter(([s]) => s));
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { links.forEach((l) => l.classList.remove("active")); map.get(e.target)?.classList.add("active"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, s) => spy.observe(s));
  }

  /* ============================================================
     Cursore personalizzato (solo mouse)
     ============================================================ */
  if (finePointer && !reduce) {
    const cur = document.createElement("div");
    cur.className = "cur hide";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<div class="cur-ring"><span></span></div><div class="cur-dot"></div>';
    document.body.appendChild(cur);
    document.documentElement.classList.add("has-cursor");
    const ring = $(".cur-ring", cur), dot = $(".cur-dot", cur), label = $("span", ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    /* --- luminosità di ciò che sta sotto il cursore (giallo su scuro, nero su chiaro) --- */
    const luma = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    function imgLuma(img, x, y) {
      try {
        if (!img.complete || !img.naturalWidth) return null;
        const r = img.getBoundingClientRect();
        const pos = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
        const sc = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
        const ox = (r.width - img.naturalWidth * sc) * (isNaN(pos[0]) ? 0.5 : pos[0]);
        const oy = (r.height - img.naturalHeight * sc) * (isNaN(pos[1]) ? 0.5 : pos[1]);
        const sx = clamp((x - r.left - ox) / sc, 0, img.naturalWidth - 1);
        const sy = clamp((y - r.top - oy) / sc, 0, img.naturalHeight - 1);
        cx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
        const d = cx.getImageData(0, 0, 1, 1).data;
        return luma(d[0], d[1], d[2]);
      } catch (e) { return null; } // es. file:// (canvas "tainted"): si assume scuro
    }
    function isLightUnder(t, x, y) {
      if (!t || !t.closest) return false;
      // foto "libere" (galleria e foto di sezione): si campiona il pixel; le fasce con ombra in basso contano come scure
      const fig = t.closest("figure");
      const img = fig && $("img", fig);
      if (img) {
        const fr = fig.getBoundingClientRect();
        if (fig.closest(".track") && y > fr.top + fr.height * 0.62) return false;
        const l = imgLuma(img, x, y);
        return l !== null && l > 0.5;
      }
      // sfondi scuri con foto sotto (hero, percorso, citazione, newsletter): sempre scuri
      if (t.closest(".hero-media, .process-bg, .statement, .news")) return false;
      for (let el = t; el && el !== document.documentElement; el = el.parentElement) {
        const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
        if (!m) continue;
        const [r, g, b, a = 1] = m[1].split(",").map(parseFloat);
        if (a > 0.6) return luma(r, g, b) > 0.5;
      }
      return false;
    }

    function refresh() {
      const t = document.elementFromPoint(mx, my);
      if (!t) return;
      const lab = t.closest("[data-cursor]");
      cur.classList.toggle("has-label", !!lab);
      if (lab) label.textContent = lab.dataset.cursor;
      cur.classList.toggle("is-link", !lab && !!t.closest("a, button, .chip, label.check, .acc-q, summary"));
      cur.classList.toggle("is-text", !!t.closest("input:not([type=checkbox]):not([type=radio]):not([type=submit]), textarea, select"));
      cur.classList.toggle("on-light", isLightUnder(t, mx, my));
    }

    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      cur.classList.remove("hide");
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }, { passive: true });
    document.addEventListener("mouseleave", () => cur.classList.add("hide"));
    // dentro la mappa (iframe) il mouse non arriva alla pagina: si nasconde il cursore personalizzato
    $$("[data-map]").forEach((m) => {
      m.addEventListener("mouseenter", () => m.classList.contains("loaded") && cur.classList.add("hide"));
      m.addEventListener("mouseleave", () => cur.classList.remove("hide"));
    });

    let last = 0;
    (function loop(now) {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      if (now - last > 70) { last = now; refresh(); } // anche mentre la pagina scorre sotto il mouse
      requestAnimationFrame(loop);
    })(0);
  }
})();
