/* =========================================================================
   multipage · shell.js   (vanilla, no build)

   The SHARED CHROME for every page: app bar, cross-page nav, footer title
   block and the detail <dialog>. It also owns global state (language + theme)
   and exposes a tiny toolkit on window.LDW that each page's app.js reuses.

   Loaded on EVERY page BEFORE app.js. It:
     1. reads the language from <html lang> and the theme from localStorage
        (falling back to the system's prefers-color-scheme),
     2. injects app bar + nav + footer + dialog around <main id="page">,
     3. wires the theme toggle and points the language link at this page's
        counterpart in the other language,
     4. highlights the current page (from <body data-page="...">).

   Language belongs to the URL, not to the visitor: the Chinese pages live at
   the root and the English ones under /en/, so switching language is a
   navigation rather than an in-place repaint. Theme persists in localStorage
   only once the visitor has actually chosen one with the toggle.
   ========================================================================= */
(function () {
  "use strict";

  var META = window.SITE_META || { title: {}, subtitle: {}, footer: {} };
  var PAGES = Array.isArray(window.SITE_PAGES) ? window.SITE_PAGES : [];

  /* ---------- chrome i18n (page content strings live in the data) ---------- */
  var I18N = {
    en: { close: "Close", menu: "Pages", skip: "Skip to content", legend: "Notation",
          sheet: "Sheet", of: "of", theme: "Switch light / dark", star: "Star on GitHub",
          home: "Back to peteraim.com", toTwin: "切換到中文版" },
    zh: { close: "關閉", menu: "頁面", skip: "跳到內容", legend: "圖例",
          sheet: "圖號", of: "／", theme: "切換淺色／深色", star: "在 GitHub 給星星",
          home: "返回 peteraim.com", toTwin: "View in English" }
  };

  /* ---------- tiny inline icons (no icon font) ---------- */
  var ICON = {
    sun:  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 11 12 4l8 7v9h-5.5v-5.5h-5V20H4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>',
    /* brand mark: the site's node grammar in one line — LLM call, wire, gate */
    mark: '<svg class="brand__mark" viewBox="0 0 40 24" width="40" height="24" aria-hidden="true"><path class="dg-wire" d="M4 12H36"/><rect class="dg-llm" x="5" y="6" width="16" height="12" rx="6"/><path class="dg-gate" d="M30 5 37 12 30 19 23 12Z"/></svg>'
  };

  /* ---------- sandbox-safe storage ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ---------- global state ----------
     The URL decides the language, so <html lang> is what we read. localStorage
     must not seed it: a crawler has no localStorage and would always be handed
     the fallback, which is how one half of the site ended up with no address of
     its own — and why a first-time reader of the Chinese pages was served
     English. Writing the choice back is gone too; the address carries it now. */
  function langFromDocument() {
    var declared = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return declared.indexOf("zh") === 0 ? "zh" : "en";
  }

  /* the same page in the other language — mirror the path, never guess */
  var TWIN_DIR = "/en";
  function altLangHref() {
    var path = location.pathname || "/";
    if (path === TWIN_DIR || path.indexOf(TWIN_DIR + "/") === 0) {
      return path.slice(TWIN_DIR.length) || "/";
    }
    return TWIN_DIR + path;
  }

  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function systemTheme() { return darkQuery && darkQuery.matches ? "dark" : "light"; }
  var saved = lsGet("theme");

  var state = {
    lang:  langFromDocument(),
    theme: saved === "dark" || saved === "light" ? saved : systemTheme()
  };

  /* ---------- helpers shared with app.js ---------- */
  function t(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj.en || obj.zh || "";
  }
  function ui(key) { return (I18N[state.lang] || I18N.en)[key]; }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function r(n) { return Math.round(n * 100) / 100; }

  function pageHref(p) { return p.slug === "home" ? "index.html" : p.slug + ".html"; }
  function currentSlug() { return document.body.getAttribute("data-page") || "home"; }
  function currentPage() {
    var slug = currentSlug();
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].slug === slug) return PAGES[i];
    return PAGES[0] || null;
  }
  function pageIndex(slug) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].slug === slug) return i;
    return 0;
  }
  /* pattern pages carry a diagram; their number is their place on the spectrum */
  function patternNo(p) {
    var n = 0;
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].diagram) n++;
      if (PAGES[i] === p) return p.diagram ? n : 0;
    }
    return 0;
  }

  /* =======================================================================
     CHROME INJECTION — app bar, nav, footer, dialog around <main id="page">
     ===================================================================== */
  function injectChrome() {
    var main = document.getElementById("page");
    if (!main) return;

    /* skip link */
    var skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#page";
    skip.id = "skipLink";
    document.body.insertBefore(skip, document.body.firstChild);

    /* app bar */
    var appbar = document.createElement("header");
    appbar.className = "appbar";
    appbar.innerHTML =
      '<div class="appbar__inner">' +
        '<a class="brand" href="index.html">' + ICON.mark +
          '<span class="brand__name" id="brandName"></span>' +
        '</a>' +
        '<div class="appbar__actions">' +
          (META.repo ?
            '<a class="gh-star" id="ghStar" href="https://github.com/' + META.repo + '" target="_blank" rel="noopener" ' +
              'data-repo="' + META.repo + '" title="' + escapeHtml(ui("star")) + '" aria-label="' + escapeHtml(ui("star")) + '">' +
              ICON.star + '<span class="gh-star__count" id="ghStarCount" hidden></span>' +
            '</a>' : "") +
          '<a class="icon-btn icon-btn--lang" id="langToggle" href="' + escapeHtml(altLangHref()) + '" ' +
             'hreflang="' + (state.lang === "en" ? "zh-Hant" : "en") + '" rel="alternate" ' +
             'lang="' + (state.lang === "en" ? "zh-Hant" : "en") + '" ' +
             'title="' + escapeHtml(ui("toTwin")) + '" aria-label="' + escapeHtml(ui("toTwin")) + '">' +
            '<span id="langLabel"></span>' +
          '</a>' +
          '<button class="icon-btn" id="themeToggle" type="button" title="' + escapeHtml(ui("theme")) + '" aria-label="' + escapeHtml(ui("theme")) + '">' +
            '<span id="themeIcon"></span>' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.insertBefore(appbar, main);

    /* cross-page nav */
    var nav = document.createElement("nav");
    nav.className = "pagenav";
    nav.id = "pageNav";
    nav.innerHTML = '<div class="pagenav__inner" id="pageNavInner"></div>';
    document.body.insertBefore(nav, main);

    /* footer: an engineering-drawing title block */
    var footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML =
      '<div class="titleblock">' +
        '<div class="tb-cell tb-cell--title"><b id="footerTitle"></b><span id="footerText"></span></div>' +
        '<div class="tb-cell tb-cell--legend"><span class="tb-key" id="footerLegendKey"></span><div id="footerLegend"></div></div>' +
        '<div class="tb-cell tb-cell--sheet"><span class="tb-key" id="footerSheetKey"></span><b class="tb-sheet" id="footerSheet"></b></div>' +
        '<div class="tb-cell tb-cell--links">' +
          '<span id="footerLang"></span>' +
          '<span class="profile-links">' +
            '<a class="icon-btn" href="https://www.peteraim.com" target="_blank" rel="noopener" title="Home" aria-label="' + escapeHtml(ui("home")) + '">' + ICON.home + '</a>' +
            '<a class="icon-btn" href="https://www.linkedin.com/in/ai-med/" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn (opens in new tab)">' + ICON.linkedin + '</a>' +
          '</span>' +
        '</div>' +
      '</div>';
    main.parentNode.insertBefore(footer, main.nextSibling);

    /* The static pages carry a plain "English version / 中文版" link after the
       scripts so crawlers and no-JS readers can reach the twin page. With JS on,
       it moves into the title block instead of floating under the footer. */
    var alt = document.querySelector(".lang-alt-link");
    var altSlot = document.getElementById("footerLang");
    if (alt && altSlot) {
      var a = alt.querySelector("a");
      if (a) { a.className = "tb-lang"; altSlot.appendChild(a); }
      alt.parentNode.removeChild(alt);
    }

    /* shared detail dialog (used by card layouts) */
    var dialog = document.createElement("dialog");
    dialog.className = "dialog";
    dialog.id = "dialog";
    dialog.setAttribute("aria-labelledby", "dialogTitle");
    dialog.innerHTML =
      '<div class="dialog__bar">' +
        '<span class="dialog__spacer"></span>' +
        '<button class="icon-btn" id="dialogClose" type="button" aria-label="Close / 關閉">' + ICON.close + '</button>' +
      '</div>' +
      '<div class="dialog__body" id="dialogBody"></div>';
    document.body.appendChild(dialog);

    document.getElementById("dialogClose").addEventListener("click", function () {
      if (dialog.open) dialog.close();
    });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* nav: short text labels, patterns numbered by their place on the spectrum.
     On narrow screens it scrolls sideways; edge fades show there is more. */
  function paintNav() {
    var inner = document.getElementById("pageNavInner");
    if (!inner) return;
    inner.innerHTML = "";
    var here = currentSlug();
    var group = null;
    PAGES.forEach(function (p) {
      var g = p.diagram ? "patterns" : (p.slug === "home" || p.slug === "concept" ? "intro" : "study");
      if (group && g !== group) {
        var sep = document.createElement("span");
        sep.className = "navsep";
        sep.setAttribute("aria-hidden", "true");
        inner.appendChild(sep);
      }
      group = g;
      var a = document.createElement("a");
      a.className = "navlink" + (p.slug === here ? " navlink--active" : "");
      a.href = pageHref(p);
      if (p.slug === here) a.setAttribute("aria-current", "page");
      var no = patternNo(p);
      a.innerHTML = (no ? '<span class="navlink__no">' + no + "</span>" : "") +
        "<span>" + escapeHtml(t(p.nav || p.title)) + "</span>";
      a.title = t(p.title);
      inner.appendChild(a);
    });
    var nav = document.getElementById("pageNav");
    function edges() {
      var max = inner.scrollWidth - inner.clientWidth;
      nav.classList.toggle("pagenav--more-left", inner.scrollLeft > 4);
      nav.classList.toggle("pagenav--more-right", inner.scrollLeft < max - 4);
    }
    var active = inner.querySelector(".navlink--active");
    if (active && inner.scrollWidth > inner.clientWidth) {
      inner.scrollLeft = Math.max(0, active.offsetLeft - (inner.clientWidth - active.offsetWidth) / 2);
    }
    inner.addEventListener("scroll", edges, { passive: true });
    window.addEventListener("resize", edges);
    edges();
  }

  /* ---------- chrome text in the active language ---------- */
  function refreshChrome() {
    var page = currentPage();
    var siteTitle = t(META.title);
    var pageTitle = page ? t(page.title) : "";
    if (page && page.slug !== "home") document.title = pageTitle + " · " + siteTitle;

    var brand = document.getElementById("brandName");
    if (brand) brand.textContent = siteTitle;
    var ft = document.getElementById("footerTitle");
    if (ft) ft.textContent = siteTitle;
    var foot = document.getElementById("footerText");
    if (foot) foot.textContent = t(META.footer);
    var lk = document.getElementById("footerLegendKey");
    if (lk) lk.textContent = ui("legend");
    var lg = document.getElementById("footerLegend");
    if (lg && window.AWD) lg.innerHTML = window.AWD.legend(state.lang);
    var sk = document.getElementById("footerSheetKey");
    if (sk) sk.textContent = ui("sheet");
    var sh = document.getElementById("footerSheet");
    if (sh && page) {
      var n = pageIndex(page.slug) + 1, total = PAGES.length;
      sh.textContent = state.lang === "zh" ? n + "／" + total : n + " of " + total;
    }
    var skip = document.getElementById("skipLink");
    if (skip) skip.textContent = ui("skip");
    var nav = document.getElementById("pageNav");
    if (nav) nav.setAttribute("aria-label", ui("menu"));
    var dc = document.getElementById("dialogClose");
    if (dc) dc.setAttribute("aria-label", ui("close"));
    paintNav();
  }

  /* =======================================================================
     THEME + LANGUAGE
     ===================================================================== */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    var icon = document.getElementById("themeIcon");
    if (icon) icon.innerHTML = state.theme === "dark" ? ICON.sun : ICON.moon;
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", state.theme === "dark" ? "#0F1722" : "#EDF1F4");
  }
  /* The toggle is a link, so it is labelled with the language it leads TO. */
  function applyLangChrome() {
    var label = document.getElementById("langLabel");
    if (label) label.textContent = state.lang === "en" ? "中文" : "EN";
  }

  function wire() {
    document.getElementById("themeToggle").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      lsSet("theme", state.theme);          // only an explicit choice is remembered
      applyTheme();
    });
    /* no saved choice: keep following the system setting live */
    if (darkQuery && !lsGet("theme")) {
      var follow = function () {
        if (lsGet("theme")) return;
        state.theme = systemTheme();
        applyTheme();
      };
      if (darkQuery.addEventListener) darkQuery.addEventListener("change", follow);
      else if (darkQuery.addListener) darkQuery.addListener(follow);
    }
  }

  /* =======================================================================
     PUBLIC TOOLKIT (app.js uses this)
     ===================================================================== */
  window.LDW = {
    ready: false,          // flipped true once the chrome (incl. #dialog) is injected
    state: state,
    t: t, ui: ui, escapeHtml: escapeHtml, r: r,
    lsGet: lsGet, lsSet: lsSet,
    pages: PAGES, meta: META,
    currentPage: currentPage, currentSlug: currentSlug, pageHref: pageHref, patternNo: patternNo,
    refreshChrome: refreshChrome,
    dialog: function () { return document.getElementById("dialog"); }
  };

  /* =======================================================================
     GitHub star count — public API, no auth. Cached for the session so we
     ask GitHub at most once per visit; on any failure (offline, 403 rate
     limit) or a zero count the number stays hidden and the link still works.
     ===================================================================== */
  function fmtStars(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }
  function showStars(el, n) {
    if (n > 0) { el.textContent = fmtStars(n); el.hidden = false; }
    else { el.textContent = ""; el.hidden = true; }
  }
  function loadStars() {
    var a = document.getElementById("ghStar");
    var el = document.getElementById("ghStarCount");
    if (!a || !el) return;
    var repo = a.getAttribute("data-repo");
    if (!repo) return;
    var key = "gh-stars:" + repo;
    var cached = ssGet(key);
    if (cached !== null) { showStars(el, parseInt(cached, 10) || 0); return; }
    if (typeof fetch !== "function") return;
    var api = "https://api.github.com/";
    try {
      /* /rate_limit is free (it doesn't spend quota). Asking it first means a
         rate-limited visitor never fires the 403 that browsers log as an error. */
      fetch(api + "rate_limit")
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (rl) {
          var left = rl && rl.resources && rl.resources.core ? rl.resources.core.remaining : 0;
          return left > 0 ? fetch(api + "repos/" + repo) : null;
        })
        .then(function (res) { return res && res.ok ? res.json() : null; })
        .then(function (j) {
          var n = j && typeof j.stargazers_count === "number" ? j.stargazers_count : 0;
          ssSet(key, String(n));          // a failure is cached as 0 too: don't retry every page
          showStars(el, n);
        })
        .catch(function () { ssSet(key, "0"); showStars(el, 0); });
    } catch (e) { /* ignore */ }
  }

  function init() {
    injectChrome();
    applyTheme();
    applyLangChrome();
    refreshChrome();
    wire();
    loadStars();
    window.LDW.ready = true;
    document.dispatchEvent(new CustomEvent("ldw:shell-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
