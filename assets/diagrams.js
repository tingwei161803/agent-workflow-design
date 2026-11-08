/* =========================================================================
   Agent Workflow Patterns · diagrams.js   (vanilla, no build)

   The site's drawing set. Every pattern is a small wiring diagram drawn in
   one consistent node grammar, so a shape means the same thing everywhere:

     capsule (signal red)  — an LLM call
     square  (ink)         — your code, a tool, or the environment
     diamond (gate green)  — a gate / decision checked by code
     hollow dot            — input or output terminal
     solid wire            — fixed data flow written in code
     dashed wire           — dynamic or looping flow (decided at run time)

   Exposes window.AWD:
     AWD.diagram(key, lang) — full labelled schematic (pattern pages)
     AWD.glyph(key)         — tiny unlabelled schematic (spectrum, ladder)
     AWD.legend(lang)       — the legend as inline HTML
   Loaded before app.js. Output is plain SVG markup, so the prerendered HTML
   carries the same drawings for no-JS readers and crawlers.
   ========================================================================= */
(function () {
  "use strict";

  var FS = 15;          // node label size (viewBox units)
  var NODE_H = 34;
  var uid = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function r(n) { return Math.round(n * 10) / 10; }
  /* rough advance width: CJK is a full em, Latin mono is .6em */
  function tw(s, fs) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += /[⺀-￿]/.test(s.charAt(i)) ? fs : fs * 0.6;
    return w;
  }
  function pick(o, lang) { return typeof o === "string" ? o : (o[lang] || o.en); }

  /* ---------- node primitives: return geometry + markup ---------- */
  function geo(x, y, w, h) {
    return { x: x, y: y, w: w, h: h, l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2 };
  }
  function label(x, y, s, cls) {
    return '<text class="' + (cls || "dg-label") + '" x="' + r(x) + '" y="' + r(y) +
      '" text-anchor="middle" dominant-baseline="central">' + esc(s) + "</text>";
  }
  function llm(x, y, s, opt) {
    var w = Math.max(64, tw(s, FS) + 30), g = geo(x, y, w, NODE_H);
    g.svg = '<rect class="dg-llm' + (opt && opt.ghost ? " dg-ghost" : "") + '" x="' + r(g.l) + '" y="' + r(g.t) +
      '" width="' + r(w) + '" height="' + NODE_H + '" rx="' + NODE_H / 2 + '"/>' + label(x, y, s);
    return g;
  }
  function box(x, y, s) {
    var w = Math.max(60, tw(s, FS) + 28), g = geo(x, y, w, NODE_H);
    g.svg = '<rect class="dg-box" x="' + r(g.l) + '" y="' + r(g.t) + '" width="' + r(w) +
      '" height="' + NODE_H + '" rx="2"/>' + label(x, y, s);
    return g;
  }
  function gate(x, y, s, where) {
    var h = 22, g = geo(x, y, h * 2, h * 2);
    var ly = where === "below" ? y + h + 14 : y - h - 12;
    g.svg = '<path class="dg-gate" d="M' + r(x) + " " + r(y - h) + " L" + r(x + h) + " " + r(y) + " L" + r(x) + " " +
      r(y + h) + " L" + r(x - h) + " " + r(y) + ' Z"/>' + (s ? label(x, ly, s, "dg-note") : "");
    return g;
  }
  function term(x, y, s, where) {
    var g = geo(x, y, 12, 12);
    var ly = where === "above" ? y - 20 : y + 22;
    g.svg = '<circle class="dg-term" cx="' + r(x) + '" cy="' + r(y) + '" r="6"/>' + (s ? label(x, ly, s, "dg-note") : "");
    return g;
  }
  function junction(x, y) {
    return { x: x, y: y, l: x, r: x, t: y, b: y, svg: '<circle class="dg-dot" cx="' + r(x) + '" cy="' + r(y) + '" r="3.5"/>' };
  }
  function note(x, y, s, anchor) {
    return '<text class="dg-note" x="' + r(x) + '" y="' + r(y) + '" text-anchor="' + (anchor || "middle") +
      '" dominant-baseline="central">' + esc(s) + "</text>";
  }

  /* orthogonal wire through points, with softened corners */
  function path(pts, rad) {
    rad = rad == null ? 8 : rad;
    var d = "M" + r(pts[0][0]) + " " + r(pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i], prev = pts[i - 1], next = pts[i + 1];
      if (!next || !rad) { d += " L" + r(p[0]) + " " + r(p[1]); continue; }
      var inLen = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      var outLen = Math.hypot(next[0] - p[0], next[1] - p[1]);
      var k = Math.min(rad, inLen / 2, outLen / 2);
      var ax = p[0] - (p[0] - prev[0]) / inLen * k, ay = p[1] - (p[1] - prev[1]) / inLen * k;
      var bx = p[0] + (next[0] - p[0]) / outLen * k, by = p[1] + (next[1] - p[1]) / outLen * k;
      d += " L" + r(ax) + " " + r(ay) + " Q" + r(p[0]) + " " + r(p[1]) + " " + r(bx) + " " + r(by);
    }
    return d;
  }

  /* one SVG drawing: collects wires (under) and nodes (over) */
  function Sheet(w, h, title) {
    var id = "ah" + (++uid);
    var wires = [], nodes = [], notes = [];
    return {
      id: id,
      node: function (g) { nodes.push(g.svg); return g; },
      note: function (s) { notes.push(s); },
      wire: function (pts, opt) {
        opt = opt || {};
        var d = path(pts, opt.rad);
        var cls = "dg-wire" + (opt.dyn ? " dg-wire--dyn" : "");
        wires.push('<path class="' + cls + '" d="' + d + '"' +
          (opt.end === false ? "" : ' marker-end="url(#' + id + ')"') +
          (opt.both ? ' marker-start="url(#' + id + 's)"' : "") + "/>" +
          (opt.flow === false ? "" : '<path class="dg-flow" d="' + d + '"/>'));
      },
      svg: function () {
        return '<svg class="dg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(title) + '">' +
          "<title>" + esc(title) + "</title>" +
          '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
            '<path class="dg-head" d="M0 1 L10 5 L0 9 Z"/></marker>' +
          '<marker id="' + id + 's" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
            '<path class="dg-head" d="M10 1 L0 5 L10 9 Z"/></marker></defs>' +
          '<g class="dg-wires">' + wires.join("") + "</g>" +
          '<g class="dg-nodes">' + nodes.join("") + notes.join("") + "</g></svg>";
      }
    };
  }

  /* =======================================================================
     FULL DIAGRAMS — one per pattern, plus the shared building block
     ===================================================================== */
  var T = {
    input:  { en: "Input", zh: "輸入" },
    output: { en: "Output", zh: "輸出" }
  };

  var DIAGRAMS = {
    chaining: function (lg) {
      var S = Sheet(480, 200, pick({ en: "Prompt chaining: LLM calls in a fixed sequence with a gate between steps", zh: "提示鏈：固定順序的 LLM 呼叫，步驟之間設關卡" }, lg));
      var y = 72;
      var a = S.node(term(18, y, pick(T.input, lg)));
      var n1 = S.node(llm(98, y, "LLM 1"));
      var g = S.node(gate(192, y, pick({ en: "gate", zh: "關卡" }, lg)));
      var n2 = S.node(llm(288, y, "LLM 2"));
      var n3 = S.node(llm(384, y, "LLM 3"));
      var z = S.node(term(462, y, pick(T.output, lg)));
      var stop = S.node(box(192, 160, pick({ en: "stop / fix", zh: "中止／修正" }, lg)));
      S.wire([[a.r, y], [n1.l, y]]);
      S.wire([[n1.r, y], [g.l, y]]);
      S.wire([[g.r, y], [n2.l, y]]);
      S.wire([[n2.r, y], [n3.l, y]]);
      S.wire([[n3.r, y], [z.l, y]]);
      S.wire([[g.x, g.b], [g.x, stop.t]], { dyn: true });
      S.note(note(g.x + (g.r - g.x) / 2 + 22, y - 12, pick({ en: "pass", zh: "通過" }, lg)));
      S.note(note(g.x + 10, 116, pick({ en: "fail", zh: "不通過" }, lg), "start"));
      return S.svg();
    },

    routing: function (lg) {
      var S = Sheet(480, 250, pick({ en: "Routing: a classifier LLM sends each input down one specialised branch", zh: "路由：分類 LLM 把每個輸入送進一條專門的分支" }, lg));
      var y = 125;
      var a = S.node(term(18, y, pick(T.input, lg)));
      var c = S.node(llm(104, y, pick({ en: "Router", zh: "分類 LLM" }, lg)));
      var xs = 332;
      var h1 = S.node(llm(xs, 42, pick({ en: "Refund flow", zh: "退款流程" }, lg)));
      var h2 = S.node(llm(xs, y, pick({ en: "Tech support", zh: "技術支援鏈" }, lg)));
      var h3 = S.node(llm(xs, 208, pick({ en: "General FAQ", zh: "一般 FAQ" }, lg)));
      var z = S.node(term(462, y, pick(T.output, lg)));
      var jx = 184;
      S.node(junction(jx, y));
      S.wire([[a.r, y], [c.l, y]]);
      S.wire([[c.r, y], [jx, y]], { end: false });
      S.wire([[jx, y], [jx, h1.y], [h1.l, h1.y]]);
      S.wire([[jx, y], [h2.l, y]]);
      S.wire([[jx, y], [jx, h3.y], [h3.l, h3.y]]);
      var mx = 430;
      S.wire([[h1.r, h1.y], [mx, h1.y], [mx, y], [z.l, y]]);
      S.wire([[h2.r, y], [z.l, y]]);
      S.wire([[h3.r, h3.y], [mx, h3.y], [mx, y], [z.l, y]]);
      S.note(note(jx + 8, h1.y - 14, pick({ en: "refund", zh: "退款" }, lg), "start"));
      S.note(note(jx + 8, y - 14, pick({ en: "technical", zh: "技術" }, lg), "start"));
      S.note(note(jx + 8, h3.y - 14, pick({ en: "general", zh: "一般" }, lg), "start"));
      S.note(note(c.x, y + 34, pick({ en: "picks one path", zh: "只走一條" }, lg)));
      return S.svg();
    },

    parallelization: function (lg) {
      var S = Sheet(480, 262, pick({ en: "Parallelization: several LLM calls run at once, then code aggregates them", zh: "平行化：多個 LLM 呼叫同時跑，再由程式彙整" }, lg));
      var y = 106;
      var a = S.node(term(18, y, pick(T.input, lg)));
      var sx = 66;
      S.node(junction(sx, y));
      var A = S.node(llm(166, 34, "LLM A"));
      var B = S.node(llm(166, y, "LLM B"));
      var C = S.node(llm(166, 178, "LLM C"));
      var agg = S.node(box(326, y, pick({ en: "Aggregator", zh: "彙整器" }, lg)));
      var z = S.node(term(462, y, pick(T.output, lg)));
      var mx = 246;
      S.wire([[a.r, y], [sx, y]], { end: false });
      S.wire([[sx, y], [sx, A.y], [A.l, A.y]]);
      S.wire([[sx, y], [B.l, y]]);
      S.wire([[sx, y], [sx, C.y], [C.l, C.y]]);
      S.wire([[A.r, A.y], [mx, A.y], [mx, y], [agg.l, y]]);
      S.wire([[B.r, y], [agg.l, y]]);
      S.wire([[C.r, C.y], [mx, C.y], [mx, y], [agg.l, y]]);
      S.wire([[agg.r, y], [z.l, y]]);
      S.note(note(18, 226, pick({ en: "sectioning: A, B, C are different subtasks", zh: "分節：A、B、C 是不同的子任務" }, lg), "start"));
      S.note(note(18, 248, pick({ en: "voting: A, B, C are the same task, run three times", zh: "投票：A、B、C 是同一個任務，跑三次" }, lg), "start"));
      return S.svg();
    },

    orchestrator: function (lg) {
      var S = Sheet(520, 262, pick({ en: "Orchestrator–workers: a central LLM decides the subtasks at run time and synthesizes the results", zh: "協調者—工作者：中央 LLM 在執行時決定子任務，再彙整結果" }, lg));
      var y = 128;
      var a = S.node(term(18, y, pick(T.input, lg)));
      var o = S.node(llm(118, y, pick({ en: "Orchestrator", zh: "協調者" }, lg)));
      var wx = 262;
      var w1 = S.node(llm(wx, 48, pick({ en: "Worker 1", zh: "工作者 1" }, lg)));
      var w2 = S.node(llm(wx, 118, pick({ en: "Worker 2", zh: "工作者 2" }, lg)));
      var wn = S.node(llm(wx, 214, pick({ en: "Worker N", zh: "工作者 N" }, lg), { ghost: true }));
      S.note(note(wx, 168, "⋮"));
      var sy = S.node(llm(432, y, pick({ en: "Synthesize", zh: "協調者彙整" }, lg)));
      var z = S.node(term(508, y, ""));
      var jx = 198, mx = 334;
      S.wire([[a.r, y], [o.l, y]]);
      S.wire([[o.r, y], [jx, y]], { dyn: true, end: false });
      S.wire([[jx, y], [jx, w1.y], [w1.l, w1.y]], { dyn: true });
      S.wire([[jx, y], [jx, w2.y], [w2.l, w2.y]], { dyn: true });
      S.wire([[jx, y], [jx, wn.y], [wn.l, wn.y]], { dyn: true });
      S.wire([[w1.r, w1.y], [mx, w1.y], [mx, y], [sy.l, y]]);
      S.wire([[w2.r, w2.y], [mx, w2.y], [mx, y], [sy.l, y]]);
      S.wire([[wn.r, wn.y], [mx, wn.y], [mx, y], [sy.l, y]], { dyn: true });
      S.wire([[sy.r, y], [z.l, y]]);
      S.note(note(jx - 8, 18, pick({ en: "subtasks decided at run time", zh: "子任務在執行時才決定" }, lg), "start"));
      S.note(note(508, y + 22, pick(T.output, lg), "end"));
      return S.svg();
    },

    evaluator: function (lg) {
      var S = Sheet(480, 214, pick({ en: "Evaluator–optimizer: a generator drafts, an evaluator judges, and feedback loops back until it passes", zh: "評估者—優化者：生成器草擬、評估者判斷，不通過就帶著回饋回到生成" }, lg));
      var y = 82;
      var a = S.node(term(18, y, pick(T.input, lg)));
      var gen = S.node(llm(108, y, pick({ en: "Generator", zh: "生成 LLM" }, lg)));
      var ev = S.node(llm(266, y, pick({ en: "Evaluator", zh: "評估 LLM" }, lg)));
      var g = S.node(gate(380, y, pick({ en: "pass?", zh: "通過？" }, lg)));
      var z = S.node(term(462, y, pick(T.output, lg)));
      S.wire([[a.r, y], [gen.l, y]]);
      S.wire([[gen.r, y], [ev.l, y]]);
      S.wire([[ev.r, y], [g.l, y]]);
      S.wire([[g.r, y], [z.l, y]]);
      S.wire([[g.x, g.b], [g.x, 168], [gen.x, 168], [gen.x, gen.b]], { dyn: true });
      S.note(note((gen.r + ev.l) / 2, y - 14, pick({ en: "draft", zh: "草稿" }, lg)));
      S.note(note((g.r + z.l) / 2, y - 14, pick({ en: "yes", zh: "是" }, lg)));
      S.note(note((gen.x + g.x) / 2, 186, pick({ en: "no: feedback goes back to the generator", zh: "否：帶著回饋回到生成" }, lg)));
      return S.svg();
    },

    agent: function (lg) {
      var S = Sheet(480, 262, pick({ en: "Autonomous agent: the LLM acts through tools, observes the environment, and loops until it decides it is done", zh: "自主代理：LLM 透過工具行動、觀察環境，反覆迴圈直到它判斷完成" }, lg));
      var y = 70;
      var a = S.node(term(36, y, pick({ en: "Goal", zh: "目標" }, lg), "above"));
      var m = S.node(llm(128, y, pick({ en: "LLM thinks", zh: "LLM 思考" }, lg)));
      var tool = S.node(box(326, 34, pick({ en: "Tools", zh: "工具" }, lg)));
      var env = S.node(box(326, 150, pick({ en: "Environment", zh: "環境" }, lg)));
      var g = S.node(gate(110, 176, ""));
      var z = S.node(term(36, 176, pick(T.output, lg)));
      S.wire([[a.r, y], [m.l, y]]);
      S.wire([[m.r, y - 8], [222, y - 8], [222, tool.y], [tool.l, tool.y]]);
      S.wire([[tool.r, tool.y], [436, tool.y], [436, env.y], [env.r, env.y]]);
      S.wire([[env.l, env.y], [150, env.y], [150, m.b]], { dyn: true });
      S.wire([[110, m.b], [110, g.t]]);
      S.wire([[g.l, g.y], [z.r, g.y]]);
      S.note(note(232, 16, pick({ en: "action", zh: "行動" }, lg), "start"));
      S.note(note(446, 92, pick({ en: "result", zh: "結果" }, lg), "start"));
      S.note(note(206, env.y + 16, pick({ en: "observation", zh: "觀察" }, lg)));
      S.note(note(110, 214, pick({ en: "done?", zh: "完成？" }, lg)));
      S.note(note(18, 246, pick({ en: "exits: final answer, no tool call, an error, or max turns", zh: "結束條件：最終輸出、不再呼叫工具、出錯、達到回合上限" }, lg), "start"));
      return S.svg();
    },

    augmented: function (lg) {
      var S = Sheet(480, 196, pick({ en: "The augmented LLM: one model connected to retrieval, tools and memory", zh: "被增強的 LLM：一顆模型接上檢索、工具與記憶" }, lg));
      var y = 150;
      var a = S.node(term(18, y, pick(T.input, lg)));
      var m = S.node(llm(240, y, "LLM"));
      var z = S.node(term(462, y, pick(T.output, lg)));
      var re = S.node(box(96, 42, pick({ en: "Retrieval", zh: "檢索" }, lg)));
      var to = S.node(box(240, 42, pick({ en: "Tools", zh: "工具" }, lg)));
      var me = S.node(box(384, 42, pick({ en: "Memory", zh: "記憶" }, lg)));
      S.wire([[a.r, y], [m.l, y]]);
      S.wire([[m.r, y], [z.l, y]]);
      S.wire([[222, m.t], [222, 96], [re.x, 96], [re.x, re.b]], { both: true });
      S.wire([[240, m.t], [240, to.b]], { both: true });
      S.wire([[258, m.t], [258, 96], [me.x, 96], [me.x, me.b]], { both: true });
      return S.svg();
    }
  };

  /* =======================================================================
     GLYPHS — 120×72, no labels; same grammar at thumbnail size
     ===================================================================== */
  function gCap(x, y, ghost) { return '<rect class="dg-llm' + (ghost ? " dg-ghost" : "") + '" x="' + (x - 10) + '" y="' + (y - 6) + '" width="20" height="12" rx="6"/>'; }
  function gBox(x, y) { return '<rect class="dg-box" x="' + (x - 7) + '" y="' + (y - 7) + '" width="14" height="14" rx="1"/>'; }
  function gDia(x, y) { return '<path class="dg-gate" d="M' + x + " " + (y - 8) + " L" + (x + 8) + " " + y + " L" + x + " " + (y + 8) + " L" + (x - 8) + " " + y + ' Z"/>'; }
  function gTerm(x, y) { return '<circle class="dg-term" cx="' + x + '" cy="' + y + '" r="3.5"/>'; }
  function gW(pts, dyn) { return '<path class="dg-wire' + (dyn ? " dg-wire--dyn" : "") + '" d="' + path(pts, 5) + '"/>'; }

  var GLYPHS = {
    chaining: function () {
      return gW([[6, 36], [114, 36]]) + gTerm(6, 36) + gCap(30, 36) + gDia(58, 36) + gCap(86, 36) + gTerm(114, 36);
    },
    routing: function () {
      return gW([[6, 36], [52, 36]]) + gW([[52, 36], [52, 12], [96, 12]]) + gW([[52, 36], [96, 36]]) +
        gW([[52, 36], [52, 60], [96, 60]]) + gTerm(6, 36) + gCap(28, 36) + gCap(96, 12) + gCap(96, 36) + gCap(96, 60) +
        '<circle class="dg-dot" cx="52" cy="36" r="2.5"/>';
    },
    parallelization: function () {
      return gW([[6, 36], [20, 36]]) + gW([[20, 36], [20, 12], [72, 12], [72, 36]]) + gW([[20, 36], [114, 36]]) +
        gW([[20, 36], [20, 60], [72, 60], [72, 36]]) + gTerm(6, 36) + gCap(46, 12) + gCap(46, 36) + gCap(46, 60) + gBox(92, 36) + gTerm(114, 36);
    },
    orchestrator: function () {
      return gW([[26, 36], [40, 36]], true) + gW([[40, 36], [40, 12], [52, 12]], true) + gW([[40, 36], [52, 36]], true) +
        gW([[40, 36], [40, 60], [52, 60]], true) +
        gW([[72, 12], [82, 12], [82, 36], [90, 36]]) + gW([[72, 36], [90, 36]]) + gW([[72, 60], [82, 60], [82, 36]], true) +
        gCap(18, 36) + gCap(62, 12) + gCap(62, 36) + gCap(62, 60, true) + gCap(102, 36);
    },
    evaluator: function () {
      return gW([[6, 28], [114, 28]]) + gW([[88, 28], [88, 56], [30, 56], [30, 28]], true) +
        gTerm(6, 28) + gCap(30, 28) + gCap(60, 28) + gDia(88, 28) + gTerm(114, 28);
    },
    agent: function () {
      return gW([[6, 36], [26, 36]]) + gW([[40, 36], [58, 36], [58, 14], [80, 14]]) + gW([[80, 14], [106, 14], [106, 58], [80, 58]]) +
        gW([[80, 58], [34, 58], [34, 42]], true) +
        gTerm(6, 36) + gCap(34, 36) + gBox(82, 14) + gBox(82, 58);
    }
  };

  function glyph(key) {
    var f = GLYPHS[key];
    return f ? '<svg class="dg dg--glyph" viewBox="0 0 120 72" aria-hidden="true" focusable="false">' + f() + "</svg>" : "";
  }

  function diagram(key, lang) {
    var f = DIAGRAMS[key];
    return f ? f(lang === "zh" ? "zh" : "en") : "";
  }

  function legend(lang) {
    var zh = lang === "zh";
    var items = [
      ['<rect class="dg-llm" x="2" y="5" width="24" height="12" rx="6"/>', zh ? "LLM 呼叫" : "LLM call"],
      ['<rect class="dg-box" x="7" y="4" width="14" height="14" rx="1"/>', zh ? "程式／工具" : "code / tool"],
      ['<path class="dg-gate" d="M14 2 L23 11 L14 20 L5 11 Z"/>', zh ? "關卡" : "gate"],
      ['<circle class="dg-term" cx="14" cy="11" r="4"/>', zh ? "輸入／輸出" : "input / output"],
      ['<path class="dg-wire dg-wire--dyn" d="M1 11 H27"/>', zh ? "執行時才決定" : "decided at run time"]
    ];
    return '<ul class="legend">' + items.map(function (it) {
      return '<li><svg class="dg dg--key" viewBox="0 0 28 22" aria-hidden="true" focusable="false">' + it[0] + "</svg>" + esc(it[1]) + "</li>";
    }).join("") + "</ul>";
  }

  window.AWD = { diagram: diagram, glyph: glyph, legend: legend };
})();
