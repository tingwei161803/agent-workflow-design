/* =========================================================================
   Agent Workflow Patterns · data.js

   ONE shared data file, loaded by every page. The whole site is config-driven
   from two globals:
     window.SITE_META  = { title:{en,zh}, subtitle:{en,zh}, footer:{en,zh} }
     window.SITE_PAGES = [ { slug, layout, icon, title:{en,zh}, ...layoutData } ]

   Content is grounded in primary sources (Anthropic, OpenAI, Google, LangGraph,
   Lilian Weng, and the ReAct / Reflexion / CoT / ToT papers). Every page cites
   where its claims come from; the full list lives on the Sources page.

   Every human-visible string is {en,zh} so the language toggle repaints the
   whole site with nothing left stuck in the other language.
   ========================================================================= */

window.SITE_META = {
  title:    { en: "Agent Workflow Patterns", zh: "Agent 工作流模式" },
  subtitle: { en: "Six patterns for building effective LLM systems — grounded in primary sources, not hand-waving.",
              zh: "建構有效 LLM 系統的六種模式 — 每個論點都附一手權威佐證，不空談。" },
  footer:   { en: "Static, no build step.",
              zh: "純靜態，無建置流程。" }
};

/* Shared source references, reused by the Sources page and cited inline. */
var SRC = {
  anthropic: "https://www.anthropic.com/engineering/building-effective-agents",
  cookbook:  "https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents",
  openai:    "https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf",
  google:    "https://www.kaggle.com/whitepaper-agents",
  langgraph: "https://langchain-ai.github.io/langgraph/tutorials/workflows/",
  weng:      "https://lilianweng.github.io/posts/2023-06-23-agent/",
  react:     "https://arxiv.org/abs/2210.03629",
  reflexion: "https://arxiv.org/abs/2303.11366",
  cot:       "https://arxiv.org/abs/2201.11903",
  tot:       "https://arxiv.org/abs/2305.10601",
  gigaai:    "https://gigaai.studio/articles/agent-workflow-six-patterns"
};

window.SITE_PAGES = [

  /* ===================================================================== */
  /* HOME / HUB                                                            */
  /* ===================================================================== */
  {
    slug: "home", layout: "hub", icon: "hub",
    title:    { en: "Agent Workflow Patterns", zh: "Agent 工作流模式" },
    subtitle: { en: "Five workflow patterns + the autonomous agent — the building blocks of effective LLM systems, with a citation behind every claim. Start with the concept, then dive into each pattern.",
                zh: "五種工作流模式 ＋ 一種自主代理 — 有效 LLM 系統的基本構件，每個論點都有出處。先看核心概念，再深入每個模式。" },
    stats: [
      { value: 6,  label: { en: "Core patterns", zh: "核心模式" } },
      { value: 5,  label: { en: "Workflow patterns", zh: "工作流模式" } },
      { value: 3,  label: { en: "Authoritative labs", zh: "權威實驗室來源" } },
      { value: 11, label: { en: "Cited references", zh: "參考文獻" } }
    ]
  },

  /* ===================================================================== */
  /* CONCEPT — Workflow vs Agent                                           */
  /* ===================================================================== */
  {
    slug: "concept", layout: "article", icon: "menu_book",
    title:    { en: "Core Concept: Workflow vs Agent", zh: "核心概念：Workflow 與 Agent" },
    subtitle: { en: "Before the six patterns: what an 'agentic system' is, the building block they all share, when to use which — and why the 'how many patterns' count differs between sources.",
                zh: "進入六種模式之前：什麼是「agentic system」、它們共用的基礎元件、何時該用哪種，以及為什麼不同來源對「有幾種模式」說法不一。" },
    sections: [
      { id: "building-block", heading: { en: "The shared building block: the augmented LLM", zh: "共用基礎：被增強的 LLM（augmented LLM）" }, blocks: [
        { type: "p", text: {
          en: "Every pattern on this site is built from one block: a large language model augmented with retrieval, tools, and memory. Anthropic describes a model that can generate its own search queries, select the right tools, and decide what to remember.",
          zh: "本站每個模式都建立在同一個構件上：一顆被「檢索（retrieval）、工具（tools）、記憶（memory）」增強過的 LLM。Anthropic 形容它能自己產生搜尋查詢、挑選合適的工具、決定要記住什麼。" } },
        { type: "p", text: {
          en: "Google's whitepaper frames the same idea as three layers — the model, an orchestration layer that reasons (via ReAct / Chain-of-Thought / Tree-of-Thoughts), and a tools layer that reaches the outside world. Different words, same anatomy.",
          zh: "Google 的白皮書用三層來描述同一件事 — 模型層、負責推理的協調層（用 ReAct／Chain-of-Thought／Tree-of-Thoughts），以及對外互動的工具層。用詞不同，骨架相同。" } },
        { type: "quote", text: {
          en: "Workflows are systems where LLMs and tools are orchestrated through predefined code paths. Agents are systems where LLMs dynamically direct their own processes and tool usage. — Anthropic",
          zh: "工作流是『LLM 與工具透過預先定義的程式路徑被編排』的系統；代理則是『LLM 動態主導自己的流程與工具使用』的系統。— Anthropic" } }
      ] },
      { id: "distinction", heading: { en: "Workflow vs Agent: the real dividing line", zh: "Workflow 與 Agent：真正的分界" }, blocks: [
        { type: "p", text: {
          en: "The dividing line is who controls the flow. In a workflow, the control flow is fixed in code you wrote; the LLM fills in the steps. In an agent, the LLM itself decides what to do next and keeps control over how the task gets done.",
          zh: "分界在於「誰掌控流程」。工作流裡，控制流程是你寫死在程式中的，LLM 只負責填內容；代理裡，是 LLM 自己決定下一步要做什麼，並持續掌控任務如何完成。" } },
        { type: "p", text: {
          en: "OpenAI puts it bluntly: agents are systems that independently accomplish tasks on your behalf. Apps that embed an LLM but don't let it control execution — simple chatbots, single-turn calls, sentiment classifiers — are not agents.",
          zh: "OpenAI 講得很直接：代理是「能代表你獨立完成任務」的系統。那些嵌了 LLM 卻不讓它掌控執行流程的應用 —— 單純聊天機器人、單輪呼叫、情感分類器 —— 都不算代理。" } },
        { type: "h3", text: { en: "What changes when you cross the line", zh: "跨過這條線會改變什麼" } },
        { type: "ul", items: {
          en: ["Control flow: hand-written code paths → the model's own decisions.",
               "Predictability: high and testable → lower, emergent at run time.",
               "Cost & latency: roughly fixed → variable, usually higher.",
               "Best when: steps are knowable up front → steps are open-ended."],
          zh: ["控制流程：人工寫好的路徑 → 由模型自己決定。",
               "可預測性：高、可測試 → 較低、執行時才浮現。",
               "成本與延遲：大致固定 → 浮動，通常更高。",
               "適用時機：步驟事先可知 → 步驟開放、無法預先窮舉。"] } }
      ] },
      { id: "when", heading: { en: "When to use which — start simple", zh: "何時用哪種 — 先求最簡單" }, blocks: [
        { type: "p", text: {
          en: "Anthropic's overarching advice: find the simplest solution possible, and only increase complexity when it demonstrably improves outcomes. Agentic systems trade latency and cost for better task performance — so spend that budget deliberately.",
          zh: "Anthropic 的總體建議：先找最簡單的解法，只有在「明顯改善結果」時才增加複雜度。代理系統是用延遲與成本換取更好的任務表現 —— 所以這筆預算要花得有理由。" } },
        { type: "p", text: {
          en: "Use a workflow when the task decomposes into predictable steps. Reach for an agent on open-ended problems where you can't predict how many steps are needed or hardcode a fixed path.",
          zh: "當任務能拆成可預測的步驟，就用工作流；面對「無法預測要幾步、也無法寫死路徑」的開放性問題，才動用代理。" } },
        { type: "h3", text: { en: "OpenAI's three triggers for building an agent", zh: "OpenAI 判斷「該建代理」的三個訊號" } },
        { type: "ul", items: {
          en: ["Complex decision-making — nuanced judgment, exceptions, context-sensitive calls (e.g. refund approval).",
               "Difficult-to-maintain rules — rule sets that have grown unwieldy and error-prone (e.g. vendor security reviews).",
               "Heavy reliance on unstructured data — interpreting documents or conversing naturally (e.g. an insurance claim).",
               "Otherwise: a deterministic solution may suffice."],
          zh: ["複雜決策 —— 需要細緻判斷、處理例外、看情境決定（例如退款核准）。",
               "難以維護的規則 —— 規則龐雜、改一條就容易出錯（例如供應商資安審查）。",
               "高度依賴非結構化資料 —— 要理解文件或自然對話（例如處理保險理賠）。",
               "否則：用確定性（deterministic）的解法就夠了。"] } }
      ] },
      { id: "counting", heading: { en: "Six? Five? On the 'how many patterns' question", zh: "六種？五種？關於「到底有幾種模式」" }, blocks: [
        { type: "p", text: {
          en: "The article that prompted this site talks about 'six patterns'. That count is a presentation choice, not a substantive disagreement — so it's worth pinning down.",
          zh: "促成這個網站的那篇文章談「六種模式」。這個數字其實是「怎麼陳列」的選擇，而非實質分歧 —— 所以值得釐清。" } },
        { type: "p", text: {
          en: "Anthropic's authoritative taxonomy is: one building block (the augmented LLM) + five workflow patterns (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) + the autonomous agent. Popular write-ups land on 'six' either by counting the five workflows plus the agent, or by promoting tool-use / context-augmentation / reflection to a standalone pattern.",
          zh: "Anthropic 的權威分類是：一個基礎構件（augmented LLM）＋ 五種工作流模式（提示鏈、路由、平行化、協調者—工作者、評估者—優化者）＋ 自主代理。坊間文章湊出「六種」，要嘛是「五種工作流＋代理」，要嘛是把「工具使用／脈絡增強／反思」升格成獨立模式。" } },
        { type: "note", text: {
          en: "This site uses Anthropic's set as the spine: 5 workflow patterns + the autonomous-agent pattern (six in total), with the augmented LLM as the shared foundation. Where a popular source diverges from the primary one, we say so rather than picking a side silently.",
          zh: "本站以 Anthropic 的分類為主軸：五種工作流模式 ＋ 自主代理（合計六種），並把 augmented LLM 當作共用基礎。當坊間說法與一手來源有出入時，我們會明講，而不是默默選邊站。" } },
        { type: "links", items: [
          { label: { en: "Anthropic — Building Effective Agents", zh: "Anthropic — Building Effective Agents" }, url: SRC.anthropic },
          { label: { en: "OpenAI — A Practical Guide to Building Agents", zh: "OpenAI — A Practical Guide to Building Agents" }, url: SRC.openai },
          { label: { en: "Reference article (GigaAI) — the starting point", zh: "起點參考文章（GigaAI）" }, url: SRC.gigaai }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* PATTERN 1 — PROMPT CHAINING                                           */
  /* ===================================================================== */
  {
    slug: "chaining", layout: "article", icon: "link",
    title:    { en: "1 · Prompt Chaining", zh: "1 · 提示鏈 Prompt Chaining" },
    subtitle: { en: "Workflow · Decompose a task into a fixed sequence of steps; each LLM call processes the previous output, with optional checks between.",
                zh: "工作流 · 把任務拆成固定的循序步驟，每步 LLM 呼叫處理上一步的輸出，中間可加檢查。" },
    sections: [
      { id: "what", heading: { en: "What it is", zh: "是什麼" }, blocks: [
        { type: "p", text: {
          en: "Prompt chaining decomposes a task into a fixed sequence of steps, where each LLM call processes the output of the previous one. You can add a programmatic 'gate' between steps — a check that the intermediate result is good enough before continuing.",
          zh: "提示鏈把任務拆解成固定的步驟序列，每一次 LLM 呼叫都處理前一步的輸出。你可以在步驟之間加上程式化的「關卡（gate）」—— 在繼續之前，先檢查中間結果是否合格。" } }
      ] },
      { id: "how", heading: { en: "How it works", zh: "運作方式" }, blocks: [
        { type: "code", text: {
          en: "Input\n  └─▶ [ LLM call 1 ] ──▶ (Gate: pass?) ──no──▶ stop / fix / branch\n                              │ yes\n                              ▼\n                        [ LLM call 2 ] ──▶ ... ──▶ Output",
          zh: "輸入\n  └─▶ [ LLM 呼叫 1 ] ──▶ （關卡：通過？）──否──▶ 中止／修正／分支\n                                │ 是\n                                ▼\n                          [ LLM 呼叫 2 ] ──▶ … ──▶ 輸出" } },
        { type: "p", text: {
          en: "The whole path is written in code. The LLM only fills each step; it never decides the order. That is exactly what makes this a workflow, not an agent.",
          zh: "整條路徑都寫在程式裡。LLM 只負責填每一步的內容，從不決定順序 —— 這正是它屬於「工作流」而非「代理」的原因。" } }
      ] },
      { id: "when", heading: { en: "When to use it", zh: "何時用" }, blocks: [
        { type: "quote", text: {
          en: "Ideal for situations where the task can be easily and cleanly decomposed into fixed subtasks. — Anthropic",
          zh: "「最適合任務能被乾淨俐落地拆成固定子任務的情境。」— Anthropic" } },
        { type: "ul", items: {
          en: ["The subtasks are known up front and always run in the same order.",
               "You're willing to trade extra latency for higher accuracy on each step.",
               "A later step depends on a clean, validated result from an earlier one."],
          zh: ["子任務事先已知，且總是以相同順序執行。",
               "你願意用多一點延遲，換取每一步更高的準確度。",
               "後面的步驟仰賴前面步驟產出的乾淨、已驗證結果。"] } }
      ] },
      { id: "tradeoffs", heading: { en: "Trade-offs", zh: "取捨" }, blocks: [
        { type: "ul", items: {
          en: ["More calls = more latency and cost than a single prompt.",
               "Rigid: the path is fixed, so it can't adapt to inputs it wasn't designed for.",
               "Errors propagate — a bad early step poisons the rest, which is why gates matter."],
          zh: ["呼叫變多 ＝ 比單一提示更高的延遲與成本。",
               "僵硬：路徑固定，無法應付設計外的輸入。",
               "錯誤會累積 —— 早期一步出錯會污染後面全部，所以才需要關卡。"] } }
      ] },
      { id: "example", heading: { en: "Concrete examples", zh: "實例" }, blocks: [
        { type: "ul", items: {
          en: ["Generate marketing copy, then translate it into another language.",
               "Write a document outline, validate it against criteria, then write the full document.",
               "Anthropic's appendix: drafting then editing follows the same shape."],
          zh: ["先產生行銷文案，再把它翻譯成另一種語言。",
               "先寫文件大綱，依標準驗證後，再寫出完整文件。",
               "Anthropic 附錄：先草擬再編修，也是同一種形狀。"] } },
        { type: "links", items: [
          { label: { en: "Anthropic — Prompt chaining", zh: "Anthropic — Prompt chaining" }, url: SRC.anthropic },
          { label: { en: "LangGraph — Workflows (prompt chaining)", zh: "LangGraph — Workflows（prompt chaining）" }, url: SRC.langgraph }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* PATTERN 2 — ROUTING                                                   */
  /* ===================================================================== */
  {
    slug: "routing", layout: "article", icon: "alt_route",
    title:    { en: "2 · Routing", zh: "2 · 路由 Routing" },
    subtitle: { en: "Workflow · Classify the input first, then send it to a specialized follow-up — a different prompt, tool chain, or model.",
                zh: "工作流 · 先把輸入分類，再分派給專門的後續處理 —— 不同的提示、工具鏈或模型。" },
    sections: [
      { id: "what", heading: { en: "What it is", zh: "是什麼" }, blocks: [
        { type: "p", text: {
          en: "Routing classifies an input and directs it to a specialized follow-up task. This is separation of concerns: each handler can be tuned for its category without bloating one giant do-everything prompt.",
          zh: "路由會先對輸入分類，再把它導向專門的後續任務。這是一種「關注點分離」：每個處理器都能針對自己的類別調校，不必把所有狀況塞進一個包山包海的巨型提示。" } }
      ] },
      { id: "how", heading: { en: "How it works", zh: "運作方式" }, blocks: [
        { type: "code", text: {
          en: "Input ──▶ [ Classifier LLM ]\n                   ├──▶ \"refund\"    ──▶ refund handler\n                   ├──▶ \"technical\" ──▶ tech-support chain\n                   └──▶ \"general\"   ──▶ general FAQ model",
          zh: "輸入 ──▶ [ 分類 LLM ]\n                 ├──▶「退款」 ──▶ 退款處理流程\n                 ├──▶「技術」 ──▶ 技術支援鏈\n                 └──▶「一般」 ──▶ 一般 FAQ 模型" } }
      ] },
      { id: "when", heading: { en: "When to use it", zh: "何時用" }, blocks: [
        { type: "quote", text: {
          en: "Works well for complex tasks where there are distinct categories that are better handled separately. — Anthropic",
          zh: "「適合那種有明確不同類別、分開處理會更好的複雜任務。」— Anthropic" } },
        { type: "ul", items: {
          en: ["Inputs fall into distinct categories that each deserve their own treatment.",
               "You want to send easy queries to a cheap/fast model and hard ones to a stronger model.",
               "Optimizing one prompt for everything hurts the cases it wasn't tuned for."],
          zh: ["輸入會落入彼此分明、各自值得專門處理的類別。",
               "你想把簡單問題送給便宜快速的模型，難題送給更強的模型。",
               "用一個提示通吃所有情況，反而會傷到沒調校到的那些。"] } }
      ] },
      { id: "tradeoffs", heading: { en: "Trade-offs", zh: "取捨" }, blocks: [
        { type: "ul", items: {
          en: ["Routing accuracy is the bottleneck — a misroute sends the input to the wrong handler.",
               "Adds a classification step (latency / cost) before any real work.",
               "Categories must be designed; fuzzy or overlapping ones cause flapping."],
          zh: ["路由準確度是瓶頸 —— 分錯類就會把輸入送到錯的處理器。",
               "在真正工作之前，多了一個分類步驟（延遲／成本）。",
               "類別要事先設計好；模糊或重疊的類別會造成搖擺。"] } }
      ] },
      { id: "example", heading: { en: "Concrete examples", zh: "實例" }, blocks: [
        { type: "ul", items: {
          en: ["Customer-service triage: route general / refund / technical queries to different processes.",
               "Cost routing: simple questions to Claude Haiku, complex ones to Claude Sonnet.",
               "OpenAI agrees on model choice: not every task requires the smartest model."],
          zh: ["客服分流：把一般／退款／技術問題導向不同流程。",
               "成本路由：簡單問題給 Claude Haiku，複雜問題給 Claude Sonnet。",
               "OpenAI 對選模型的看法一致：不是每個任務都需要最聰明的模型。"] } },
        { type: "links", items: [
          { label: { en: "Anthropic — Routing", zh: "Anthropic — Routing" }, url: SRC.anthropic },
          { label: { en: "OpenAI — Selecting your models", zh: "OpenAI — Selecting your models" }, url: SRC.openai }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* PATTERN 3 — PARALLELIZATION                                           */
  /* ===================================================================== */
  {
    slug: "parallelization", layout: "article", icon: "account_tree",
    title:    { en: "3 · Parallelization", zh: "3 · 平行化 Parallelization" },
    subtitle: { en: "Workflow · Run multiple LLM calls at once and aggregate the results. Two variants: sectioning and voting.",
                zh: "工作流 · 同時跑多個 LLM 呼叫再彙整結果。兩種變體：分節（sectioning）與投票（voting）。" },
    sections: [
      { id: "what", heading: { en: "What it is", zh: "是什麼" }, blocks: [
        { type: "p", text: {
          en: "Parallelization has LLMs work simultaneously on a task, with their outputs aggregated programmatically. Anthropic names two variations:",
          zh: "平行化讓多個 LLM 同時處理任務，輸出再用程式彙整。Anthropic 點出兩種變體：" } },
        { type: "ul", items: {
          en: ["Sectioning — break a task into independent subtasks that run in parallel.",
               "Voting — run the same task multiple times to get diverse outputs (then take consensus / any-flag)."],
          zh: ["分節（Sectioning）—— 把任務切成彼此獨立的子任務並行跑。",
               "投票（Voting）—— 同一個任務跑很多次取得多樣輸出（再取共識／任一示警）。"] } }
      ] },
      { id: "how", heading: { en: "How it works", zh: "運作方式" }, blocks: [
        { type: "code", text: {
          en: "            ┌─▶ [ LLM A ] ─┐\n  Input  ───┼─▶ [ LLM B ] ─┼─▶ [ Aggregator ] ─▶ Output\n            └─▶ [ LLM C ] ─┘\n\n  sectioning: A,B,C = different subtasks\n  voting:     A,B,C = the same task, repeated",
          zh: "            ┌─▶ [ LLM A ] ─┐\n  輸入  ────┼─▶ [ LLM B ] ─┼─▶ [ 彙整器 ] ─▶ 輸出\n            └─▶ [ LLM C ] ─┘\n\n  分節：A、B、C ＝ 不同的子任務\n  投票：A、B、C ＝ 同一個任務，重複跑" } }
      ] },
      { id: "when", heading: { en: "When to use it", zh: "何時用" }, blocks: [
        { type: "quote", text: {
          en: "Effective when the divided subtasks can be parallelized for speed, or when multiple perspectives or attempts are needed. — Anthropic",
          zh: "「當切分的子任務能平行以加速，或需要多個視角／多次嘗試時很有效。」— Anthropic" } },
        { type: "ul", items: {
          en: ["Subtasks are genuinely independent (no step waits on another).",
               "Speed matters and the work fans out cleanly.",
               "Multiple attempts raise confidence (voting) or guardrails run alongside the main task."],
          zh: ["子任務真的彼此獨立（沒有一步要等另一步）。",
               "在意速度，而且工作能乾淨地展開（fan-out）。",
               "多次嘗試能提高信心（投票），或讓護欄與主任務並行。"] } }
      ] },
      { id: "tradeoffs", heading: { en: "Trade-offs", zh: "取捨" }, blocks: [
        { type: "ul", items: {
          en: ["Cost multiplies with the number of parallel calls.",
               "You need a sound aggregation rule (majority vote, max, concatenation, any-flag).",
               "Voting can hide a systematic error if every call shares the same blind spot."],
          zh: ["成本會隨平行呼叫數倍增。",
               "你需要一套合理的彙整規則（多數決、取最大、串接、任一示警）。",
               "若每個呼叫都有相同盲點，投票反而會掩蓋系統性錯誤。"] } }
      ] },
      { id: "example", heading: { en: "Concrete examples", zh: "實例" }, blocks: [
        { type: "ul", items: {
          en: ["Sectioning: one model screens a query for inappropriate content while another generates the response.",
               "Voting: several prompts review code for vulnerabilities — flag the code if any of them finds a problem.",
               "Both examples are from Anthropic's guide."],
          zh: ["分節：一個模型負責篩查輸入是否含不當內容，另一個同時生成回應。",
               "投票：多個提示同時審查程式碼漏洞 —— 只要任一個發現問題就示警。",
               "兩個例子都出自 Anthropic 的指南。"] } },
        { type: "links", items: [
          { label: { en: "Anthropic — Parallelization", zh: "Anthropic — Parallelization" }, url: SRC.anthropic },
          { label: { en: "Anthropic cookbook — agent patterns", zh: "Anthropic cookbook — agent patterns" }, url: SRC.cookbook }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* PATTERN 4 — ORCHESTRATOR-WORKERS                                      */
  /* ===================================================================== */
  {
    slug: "orchestrator", layout: "article", icon: "hub",
    title:    { en: "4 · Orchestrator–Workers", zh: "4 · 協調者—工作者 Orchestrator–Workers" },
    subtitle: { en: "Workflow · A central LLM dynamically breaks down the task, delegates to worker LLMs, and synthesizes their results.",
                zh: "工作流 · 由中央 LLM 動態拆解任務、分派給工作者 LLM，再彙整它們的結果。" },
    sections: [
      { id: "what", heading: { en: "What it is", zh: "是什麼" }, blocks: [
        { type: "p", text: {
          en: "In the orchestrator-workers workflow, a central LLM dynamically breaks down a task, delegates the pieces to worker LLMs, and synthesizes their results. The key difference from parallelization: the subtasks are NOT predefined — the orchestrator decides them at run time.",
          zh: "在協調者—工作者工作流中，一個中央 LLM 會動態拆解任務、把各部分分派給工作者 LLM，再彙整結果。它和平行化最大的差別：子任務不是預先寫死的 —— 而是由協調者在「執行當下」決定。" } }
      ] },
      { id: "how", heading: { en: "How it works", zh: "運作方式" }, blocks: [
        { type: "code", text: {
          en: "Input ─▶ [ Orchestrator LLM ]\n              │  decides subtasks at run time\n              ├─▶ [ Worker 1 ] ─┐\n              ├─▶ [ Worker 2 ] ─┼─▶ [ Orchestrator synthesizes ] ─▶ Output\n              └─▶ [ Worker N ] ─┘",
          zh: "輸入 ─▶ [ 協調者 LLM ]\n              │  在執行當下決定子任務\n              ├─▶ [ 工作者 1 ] ─┐\n              ├─▶ [ 工作者 2 ] ─┼─▶ [ 協調者彙整 ] ─▶ 輸出\n              └─▶ [ 工作者 N ] ─┘" } },
        { type: "note", text: {
          en: "This maps closely to OpenAI's 'manager pattern' (agents as tools): a manager agent coordinates specialized agents via tool calls, then synthesizes the results into one coherent answer.",
          zh: "這與 OpenAI 的「manager pattern（代理即工具）」高度對應：一個管理者代理透過工具呼叫協調多個專門代理，再把結果彙整成一致的回答。" } }
      ] },
      { id: "when", heading: { en: "When to use it", zh: "何時用" }, blocks: [
        { type: "quote", text: {
          en: "Well-suited for complex tasks where you can't predict the subtasks needed. — Anthropic",
          zh: "「適合那種你無法預先預測需要哪些子任務的複雜任務。」— Anthropic" } },
        { type: "ul", items: {
          en: ["The number and shape of subtasks depend on the input and only emerge at run time.",
               "A central 'mind' is needed to plan, dispatch, and stitch results back together.",
               "Parallelization isn't enough because you can't pre-list the subtasks."],
          zh: ["子任務的數量與樣貌取決於輸入，要到執行時才浮現。",
               "需要一個中央「大腦」來規劃、分派、再把結果縫合起來。",
               "平行化不夠用，因為你無法事先列出子任務。"] } }
      ] },
      { id: "tradeoffs", heading: { en: "Trade-offs", zh: "取捨" }, blocks: [
        { type: "ul", items: {
          en: ["More moving parts than the earlier workflows — harder to debug and evaluate.",
               "Everything hinges on the orchestrator's planning quality.",
               "OpenAI's caution: maximize a single agent first; add agents only when prompts/tools overload."],
          zh: ["比前面的工作流多很多活動部件 —— 更難除錯與評估。",
               "成敗都繫於協調者的規劃品質。",
               "OpenAI 的提醒：先把單一代理發揮到極限，等提示／工具超載了才增加代理。"] } }
      ] },
      { id: "example", heading: { en: "Concrete examples", zh: "實例" }, blocks: [
        { type: "ul", items: {
          en: ["Coding products that make complex changes across multiple files at once.",
               "Search tasks that gather and analyze information from many sources, then synthesize.",
               "Examples from Anthropic; the manager-pattern framing is from OpenAI."],
          zh: ["要一次跨多個檔案做複雜修改的程式開發產品。",
               "需要從多個來源蒐集、分析資訊再彙整的搜尋任務。",
               "例子出自 Anthropic；manager pattern 的框架出自 OpenAI。"] } },
        { type: "links", items: [
          { label: { en: "Anthropic — Orchestrator-workers", zh: "Anthropic — Orchestrator-workers" }, url: SRC.anthropic },
          { label: { en: "OpenAI — Manager pattern (multi-agent)", zh: "OpenAI — Manager pattern（多代理）" }, url: SRC.openai }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* PATTERN 5 — EVALUATOR-OPTIMIZER                                       */
  /* ===================================================================== */
  {
    slug: "evaluator", layout: "article", icon: "rate_review",
    title:    { en: "5 · Evaluator–Optimizer", zh: "5 · 評估者—優化者 Evaluator–Optimizer" },
    subtitle: { en: "Workflow · One LLM generates a response while another evaluates and gives feedback, in a loop — iterative refinement.",
                zh: "工作流 · 一個 LLM 產生回應，另一個評估並回饋，形成迴圈 —— 反覆迭代精修。" },
    sections: [
      { id: "what", heading: { en: "What it is", zh: "是什麼" }, blocks: [
        { type: "p", text: {
          en: "In the evaluator-optimizer workflow, one LLM call generates a response while another provides evaluation and feedback in a loop. Think writer + editor: draft, critique, revise, repeat — until the evaluation passes.",
          zh: "在評估者—優化者工作流中，一個 LLM 呼叫產生回應，另一個在迴圈中給出評估與回饋。可以想成「作者＋編輯」：草擬、批評、修改、再來一次 —— 直到評估通過為止。" } }
      ] },
      { id: "how", heading: { en: "How it works", zh: "運作方式" }, blocks: [
        { type: "code", text: {
          en: "Input ─▶ [ Generator LLM ] ─▶ draft\n                                  │\n                                  ▼\n                          [ Evaluator LLM ]\n                          pass? ──no──▶ feedback ─┐\n                            │ yes                  │ (loop back\n                            ▼                      │  to generator)\n                          Output  ◀────────────────┘",
          zh: "輸入 ─▶ [ 生成 LLM ] ─▶ 草稿\n                              │\n                              ▼\n                       [ 評估 LLM ]\n                       通過？ ──否──▶ 回饋 ─┐\n                          │ 是               │ （帶著回饋\n                          ▼                  │   回到生成）\n                        輸出  ◀──────────────┘" } }
      ] },
      { id: "when", heading: { en: "When to use it", zh: "何時用" }, blocks: [
        { type: "quote", text: {
          en: "Particularly effective when we have clear evaluation criteria, and when iterative refinement provides measurable value. — Anthropic",
          zh: "「在我們有明確評估標準、且迭代精修能帶來可衡量價值時，特別有效。」— Anthropic" } },
        { type: "ul", items: {
          en: ["You can articulate what 'good' looks like as feedback the generator can act on.",
               "Each round of refinement measurably improves the output.",
               "A first-pass answer is rarely good enough on its own."],
          zh: ["你能把「好」說清楚，化為生成器可採取行動的回饋。",
               "每一輪精修都能可衡量地改善輸出。",
               "一次成形的答案往往不夠好。"] } }
      ] },
      { id: "tradeoffs", heading: { en: "Trade-offs", zh: "取捨" }, blocks: [
        { type: "ul", items: {
          en: ["The loop costs latency and tokens; you need a stopping criterion (max rounds / good-enough threshold).",
               "Only as good as the evaluator — a weak judge yields weak refinement.",
               "Academic grounding: Reflexion (Shinn et al., 2023) shows verbal self-reflection improves an agent across iterations."],
          zh: ["迴圈會耗延遲與 token；你需要停止條件（最多幾輪／足夠好的門檻）。",
               "上限取決於評估者 —— 評審不夠強，精修就不會強。",
               "學術佐證：Reflexion（Shinn 等，2023）顯示「口語自我反思」能讓代理在多次迭代中變好。"] } }
      ] },
      { id: "example", heading: { en: "Concrete examples", zh: "實例" }, blocks: [
        { type: "ul", items: {
          en: ["Literary translation, where an evaluator captures nuances the first pass missed.",
               "Complex search that needs multiple rounds of analysis and refinement.",
               "Examples from Anthropic; the self-refinement idea is formalized by Reflexion."],
          zh: ["文學翻譯：評估者能捕捉初稿漏掉的細微語感。",
               "需要多輪分析與精修的複雜搜尋任務。",
               "例子出自 Anthropic；自我精修的概念由 Reflexion 形式化。"] } },
        { type: "links", items: [
          { label: { en: "Anthropic — Evaluator-optimizer", zh: "Anthropic — Evaluator-optimizer" }, url: SRC.anthropic },
          { label: { en: "Reflexion (Shinn et al., 2023)", zh: "Reflexion（Shinn 等，2023）" }, url: SRC.reflexion }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* PATTERN 6 — AUTONOMOUS AGENTS                                         */
  /* ===================================================================== */
  {
    slug: "agent", layout: "article", icon: "smart_toy",
    title:    { en: "6 · Autonomous Agents", zh: "6 · 自主代理 Autonomous Agents" },
    subtitle: { en: "Agent · No fixed path. The LLM plans and acts in a loop, using tools and environmental feedback to direct itself toward a goal.",
                zh: "代理 · 沒有固定路徑。LLM 在迴圈中規劃並行動，靠工具與環境回饋自我導向達成目標。" },
    sections: [
      { id: "what", heading: { en: "What it is", zh: "是什麼" }, blocks: [
        { type: "p", text: {
          en: "An agent isn't a predefined path. It plans and operates independently, gaining ground truth from the environment at each step (tool results, code execution), and can pause for human feedback at checkpoints or when blocked. Anthropic's reassurance: implementation is often straightforward.",
          zh: "代理不是預先定好的路徑。它會自主規劃與運作，每一步都從環境取得「事實依據」（工具結果、程式執行），並能在檢查點或卡關時暫停、向人類求助。Anthropic 的一句安慰：實作其實常常很單純。" } },
        { type: "quote", text: {
          en: "They are typically just LLMs using tools based on environmental feedback in a loop. — Anthropic",
          zh: "「它們通常就只是『LLM 在迴圈中依環境回饋使用工具』而已。」— Anthropic" } }
      ] },
      { id: "loop", heading: { en: "The agent loop (and ReAct)", zh: "代理迴圈（以及 ReAct）" }, blocks: [
        { type: "code", text: {
          en: "goal ─▶ ┌──────────────────────────────────────────┐\n        │  plan ─▶ act (tool) ─▶ observe ─▶ reflect  │ repeat\n        └──────────────────────────────────────────┘\n          exit when: final-output tool · no tool call ·\n                     error · max turns reached\n\n  ReAct (Yao et al.):  Thought ─▶ Action ─▶ Observation ─▶ ...",
          zh: "目標 ─▶ ┌────────────────────────────────────────────┐\n        │  規劃 ─▶ 行動(工具) ─▶ 觀察 ─▶ 反思  │ 反覆\n        └────────────────────────────────────────────┘\n          結束條件：最終輸出工具・沒有工具呼叫・\n                    出錯・達到最大回合數\n\n  ReAct（Yao 等）：思考 ─▶ 行動 ─▶ 觀察 ─▶ …" } },
        { type: "p", text: {
          en: "OpenAI describes this 'run' as a while-loop that runs the LLM until an exit condition (a final-output tool, a response with no tool calls, an error, or a max-turns cap).",
          zh: "OpenAI 把這個「run」描述成一個 while 迴圈：持續跑 LLM，直到滿足結束條件（最終輸出工具、沒有工具呼叫的回應、出錯、或達到最大回合上限）。" } }
      ] },
      { id: "internals", heading: { en: "What's inside an agent", zh: "代理內部有什麼" }, blocks: [
        { type: "p", text: {
          en: "Lilian Weng's anatomy: an LLM 'brain' plus three faculties.",
          zh: "Lilian Weng 的解剖：一顆 LLM「大腦」，外加三項能力。" } },
        { type: "ul", items: {
          en: ["Planning — task decomposition (Chain-of-Thought, Tree-of-Thoughts) and self-reflection (ReAct, Reflexion).",
               "Memory — short-term (the context window) and long-term (external vector stores for fast retrieval).",
               "Tool use — calling external APIs/functions to act beyond the model's frozen weights."],
          zh: ["規劃 —— 任務拆解（Chain-of-Thought、Tree-of-Thoughts）與自我反思（ReAct、Reflexion）。",
               "記憶 —— 短期（脈絡視窗）與長期（外部向量庫，供快速檢索）。",
               "工具使用 —— 呼叫外部 API／函式，行動範圍超出模型凍結的權重。"] } }
      ] },
      { id: "orchestration", heading: { en: "Single-agent vs multi-agent", zh: "單一代理 vs 多代理" }, blocks: [
        { type: "p", text: {
          en: "OpenAI's advice: maximize a single agent (one model + tools in a loop) first; it keeps complexity and evaluation manageable. Split into multiple agents only when prompts get full of conditionals or tools overlap and confuse the model.",
          zh: "OpenAI 的建議：先把單一代理（一個模型＋工具在迴圈中）發揮到極限，這樣複雜度與評估都好掌控。只有當提示塞滿條件分支、或工具彼此重疊讓模型搞混時，才拆成多代理。" } },
        { type: "ul", items: {
          en: ["Manager (agents as tools) — a central manager calls specialized agents via tool calls and keeps control.",
               "Decentralized (handoffs) — peer agents transfer control to one another based on specialization.",
               "OpenAI: in the manager pattern edges are tool calls; in the decentralized pattern edges are handoffs."],
          zh: ["Manager（代理即工具）—— 中央管理者透過工具呼叫各專門代理，並保有控制權。",
               "Decentralized（交接 handoff）—— 平級代理依專長把控制權交接給彼此。",
               "OpenAI：manager 模式的「邊」是工具呼叫；decentralized 模式的「邊」是交接。"] } }
      ] },
      { id: "when", heading: { en: "When to use it (and the costs)", zh: "何時用（以及代價）" }, blocks: [
        { type: "quote", text: {
          en: "For open-ended problems where it's difficult or impossible to predict the required number of steps, and where you can't hardcode a fixed path. — Anthropic",
          zh: "「用於開放性問題：難以、甚至不可能預測需要幾步，也無法寫死固定路徑。」— Anthropic" } },
        { type: "ul", items: {
          en: ["Highest autonomy = highest latency, cost, and least predictability — use deliberately.",
               "Needs guardrails, transparency (show the planning steps), and a well-designed agent-computer interface (ACI).",
               "Weng's limits: finite context, hard long-horizon planning, and unreliable natural-language tool interfaces."],
          zh: ["自主性最高 ＝ 延遲、成本最高，可預測性最低 —— 要審慎使用。",
               "需要護欄、透明度（把規劃步驟攤開來看）、以及設計良好的「代理—電腦介面（ACI）」。",
               "Weng 點出的限制：脈絡有限、長程規劃困難、自然語言工具介面不夠可靠。"] } }
      ] },
      { id: "example", heading: { en: "Concrete examples", zh: "實例" }, blocks: [
        { type: "ul", items: {
          en: ["Coding agents resolving real GitHub issues in SWE-bench Verified from a pull-request description alone.",
               "Anthropic's 'computer use' reference implementation, where Claude operates a computer autonomously.",
               "Verifiable domains (code with tests) suit agents because results feed back as ground truth."],
          zh: ["程式代理只憑 PR 描述，就解決 SWE-bench Verified 上真實的 GitHub issue。",
               "Anthropic 的「computer use」參考實作：Claude 自主操作一台電腦。",
               "可驗證的領域（有測試的程式）適合代理，因為結果能回饋成事實依據。"] } },
        { type: "links", items: [
          { label: { en: "Anthropic — Agents", zh: "Anthropic — Agents" }, url: SRC.anthropic },
          { label: { en: "OpenAI — Orchestration (single vs multi-agent)", zh: "OpenAI — Orchestration（單一 vs 多代理）" }, url: SRC.openai },
          { label: { en: "Lilian Weng — LLM Powered Autonomous Agents", zh: "Lilian Weng — LLM Powered Autonomous Agents" }, url: SRC.weng },
          { label: { en: "ReAct (Yao et al., 2023)", zh: "ReAct（Yao 等，2023）" }, url: SRC.react }
        ] }
      ] }
    ]
  },

  /* ===================================================================== */
  /* COMPARE — table of all six patterns                                   */
  /* ===================================================================== */
  {
    slug: "compare", layout: "table", icon: "table_rows",
    title:    { en: "Compare the Six Patterns", zh: "六種模式比較" },
    subtitle: { en: "Side by side on control flow, cost/latency, best fit and a representative example. Filter by kind, sort any column.",
                zh: "在控制流程、成本／延遲、最適情境與代表範例上並列比較。可依類型篩選、任意欄位排序。" },
    columns: [
      { key: "pattern", label: { en: "Pattern", zh: "模式" }, type: "text" },
      { key: "kind",    label: { en: "Kind", zh: "類型" }, type: "tag", filter: true },
      { key: "control", label: { en: "Control flow", zh: "控制流程" }, type: "text" },
      { key: "cost",    label: { en: "Cost / latency", zh: "成本／延遲" }, type: "text" },
      { key: "bestfor", label: { en: "Best for", zh: "最適情境" }, type: "text" },
      { key: "example", label: { en: "Example", zh: "代表範例" }, type: "text" }
    ],
    rows: [
      { pattern: { en: "Prompt chaining", zh: "提示鏈" }, kind: { en: "Workflow", zh: "工作流" },
        control: { en: "Fixed sequence, gates between steps", zh: "固定序列，步驟間設關卡" },
        cost: { en: "Low–medium", zh: "低～中" },
        bestfor: { en: "Cleanly decomposable fixed subtasks", zh: "能乾淨拆成固定子任務" },
        example: { en: "Write copy → translate it", zh: "寫文案 → 翻譯" } },
      { pattern: { en: "Routing", zh: "路由" }, kind: { en: "Workflow", zh: "工作流" },
        control: { en: "Classify, then branch to a handler", zh: "先分類，再分支到處理器" },
        cost: { en: "Low (+1 classify)", zh: "低（多一次分類）" },
        bestfor: { en: "Distinct categories handled separately", zh: "明確類別、分開處理更好" },
        example: { en: "Triage support tickets", zh: "客服工單分流" } },
      { pattern: { en: "Parallelization", zh: "平行化" }, kind: { en: "Workflow", zh: "工作流" },
        control: { en: "Fan out, then aggregate (sectioning / voting)", zh: "展開後彙整（分節／投票）" },
        cost: { en: "Higher (×N calls)", zh: "較高（×N 次呼叫）" },
        bestfor: { en: "Independent subtasks; multiple attempts", zh: "獨立子任務；多次嘗試" },
        example: { en: "Many prompts vote on code safety", zh: "多提示投票判程式安全" } },
      { pattern: { en: "Orchestrator–workers", zh: "協調者—工作者" }, kind: { en: "Workflow", zh: "工作流" },
        control: { en: "Central LLM splits subtasks at run time", zh: "中央 LLM 執行時動態拆子任務" },
        cost: { en: "High", zh: "高" },
        bestfor: { en: "Subtasks can't be predicted up front", zh: "子任務無法事先預測" },
        example: { en: "Edit code across many files", zh: "跨多檔修改程式" } },
      { pattern: { en: "Evaluator–optimizer", zh: "評估者—優化者" }, kind: { en: "Workflow", zh: "工作流" },
        control: { en: "Generate → evaluate → refine, looped", zh: "生成 → 評估 → 精修，迴圈" },
        cost: { en: "Medium–high (loop)", zh: "中～高（迴圈）" },
        bestfor: { en: "Clear criteria; refinement adds value", zh: "標準明確；精修有價值" },
        example: { en: "Literary translation with feedback", zh: "帶回饋的文學翻譯" } },
      { pattern: { en: "Autonomous agent", zh: "自主代理" }, kind: { en: "Agent", zh: "代理" },
        control: { en: "LLM directs itself in a tool loop", zh: "LLM 在工具迴圈中自我導向" },
        cost: { en: "Highest, variable", zh: "最高、浮動" },
        bestfor: { en: "Open-ended; steps can't be hardcoded", zh: "開放性；步驟無法寫死" },
        example: { en: "Coding agent solving SWE-bench", zh: "解 SWE-bench 的程式代理" } }
    ]
  },

  /* ===================================================================== */
  /* PRACTICE — glossary + flashcards + quiz (custom layout)               */
  /* ===================================================================== */
  {
    slug: "practice", layout: "practice", icon: "school",
    title:    { en: "Practice", zh: "練習" },
    subtitle: { en: "Make it stick: look up the jargon, flip the cards, then test yourself. Everything lives in this session only.",
                zh: "讓它記得住：查術語、翻卡片、再考自己。所有作答只活在這次瀏覽，重整即歸零。" },

    glossary: [
      { term: { en: "Agentic system", zh: "agentic system（代理式系統）" },
        def: { en: "Umbrella term for both workflows and agents — any system where an LLM helps drive a multi-step task.",
               zh: "工作流與代理的統稱 —— 任何由 LLM 協助推動多步任務的系統。" } },
      { term: { en: "Workflow", zh: "Workflow（工作流）" },
        def: { en: "LLMs and tools orchestrated through predefined code paths you wrote.",
               zh: "LLM 與工具透過「你寫好的、預先定義的程式路徑」被編排。" } },
      { term: { en: "Agent", zh: "Agent（代理）" },
        def: { en: "An LLM that dynamically directs its own process and tool use to accomplish a task.",
               zh: "由 LLM 動態主導自己的流程與工具使用，以完成任務。" } },
      { term: { en: "Augmented LLM", zh: "Augmented LLM（被增強的 LLM）" },
        def: { en: "The shared building block: a model augmented with retrieval, tools, and memory.",
               zh: "共用的基礎構件：被檢索、工具、記憶增強過的模型。" } },
      { term: { en: "Gate", zh: "Gate（關卡）" },
        def: { en: "A programmatic check between chained steps that validates the intermediate result.",
               zh: "提示鏈步驟之間的程式化檢查，用來驗證中間結果是否合格。" } },
      { term: { en: "Sectioning", zh: "Sectioning（分節）" },
        def: { en: "A parallelization variant: split a task into independent subtasks run at once.",
               zh: "平行化的變體：把任務切成獨立子任務同時跑。" } },
      { term: { en: "Voting", zh: "Voting（投票）" },
        def: { en: "A parallelization variant: run the same task several times and take consensus.",
               zh: "平行化的變體：同一任務跑多次，取共識。" } },
      { term: { en: "Orchestrator", zh: "Orchestrator（協調者）" },
        def: { en: "The central LLM that splits a task into subtasks at run time and synthesizes results.",
               zh: "中央 LLM，在執行時把任務拆成子任務並彙整結果。" } },
      { term: { en: "ReAct", zh: "ReAct" },
        def: { en: "Reasoning + acting: a Thought → Action → Observation loop (Yao et al., 2023).",
               zh: "推理＋行動：思考 → 行動 → 觀察的迴圈（Yao 等，2023）。" } },
      { term: { en: "Reflexion", zh: "Reflexion" },
        def: { en: "Verbal self-reflection that improves an agent across iterations (Shinn et al., 2023).",
               zh: "口語自我反思，讓代理在多次迭代中改善（Shinn 等，2023）。" } },
      { term: { en: "Handoff", zh: "Handoff（交接）" },
        def: { en: "In a decentralized multi-agent system, one agent transfers control to another.",
               zh: "在去中心化的多代理系統中，一個代理把控制權交給另一個。" } },
      { term: { en: "Manager pattern", zh: "Manager pattern" },
        def: { en: "A central manager agent coordinates specialized agents via tool calls (agents as tools).",
               zh: "中央管理者代理透過工具呼叫協調各專門代理（代理即工具）。" } },
      { term: { en: "Guardrails", zh: "Guardrails（護欄）" },
        def: { en: "Explicit limits and checks that keep an agent operating safely within bounds.",
               zh: "明確的限制與檢查，讓代理在安全範圍內運作。" } },
      { term: { en: "ACI", zh: "ACI（代理—電腦介面）" },
        def: { en: "Agent-computer interface: the tool docs/signatures an agent uses — design it carefully.",
               zh: "Agent-Computer Interface：代理使用的工具文件／簽名 —— 要仔細設計。" } }
    ],

    flashcards: [
      { front: { en: "Prompt chaining", zh: "提示鏈 Prompt Chaining" },
        back: { en: "Fixed sequence of steps; each LLM call processes the previous output, with optional gates.",
                zh: "固定的步驟序列；每步處理上一步輸出，中間可加關卡。" } },
      { front: { en: "Routing", zh: "路由 Routing" },
        back: { en: "Classify the input first, then direct it to a specialized handler or model.",
                zh: "先把輸入分類，再導向專門的處理器或模型。" } },
      { front: { en: "Parallelization", zh: "平行化 Parallelization" },
        back: { en: "Run LLM calls at once and aggregate — sectioning (independent subtasks) or voting (same task ×N).",
                zh: "同時跑多個呼叫再彙整 —— 分節（獨立子任務）或投票（同任務多次）。" } },
      { front: { en: "Orchestrator–workers", zh: "協調者—工作者" },
        back: { en: "A central LLM splits subtasks at run time, delegates to workers, then synthesizes.",
                zh: "中央 LLM 在執行時拆子任務、分派給工作者，再彙整。" } },
      { front: { en: "Evaluator–optimizer", zh: "評估者—優化者" },
        back: { en: "One LLM generates, another evaluates and gives feedback, in a loop until good enough.",
                zh: "一個 LLM 生成、另一個評估回饋，迴圈到夠好為止。" } },
      { front: { en: "Autonomous agent", zh: "自主代理" },
        back: { en: "No fixed path: the LLM plans and acts in a tool loop using environmental feedback.",
                zh: "沒有固定路徑：LLM 在工具迴圈中依環境回饋規劃並行動。" } },
      { front: { en: "Workflow vs Agent", zh: "工作流 vs 代理" },
        back: { en: "Workflow = predefined code paths. Agent = the LLM dynamically controls its own process.",
                zh: "工作流 ＝ 預定的程式路徑；代理 ＝ LLM 動態掌控自己的流程。" } },
      { front: { en: "The golden rule", zh: "黃金守則" },
        back: { en: "Find the simplest solution; add complexity only when it demonstrably improves outcomes (Anthropic).",
                zh: "先找最簡單的解法；只有在明顯改善結果時才增加複雜度（Anthropic）。" } }
    ],

    quiz: [
      { q: { en: "What is the key difference between a workflow and an agent?",
             zh: "工作流與代理最關鍵的差別是？" },
        options: [
          { en: "Whether tools are used", zh: "用不用工具" },
          { en: "Control flow is predefined in code vs dynamically directed by the LLM", zh: "控制流程是程式預先定義，還是由 LLM 動態主導" },
          { en: "The size of the model", zh: "模型的大小" },
          { en: "Whether it is bilingual", zh: "是否雙語" }
        ], answer: 1,
        explain: { en: "Anthropic: workflows orchestrate via predefined code paths; agents dynamically direct their own process and tool use.",
                   zh: "Anthropic：工作流以預定程式路徑編排；代理則動態主導自己的流程與工具使用。" } },

      { q: { en: "You want to send general / refund / technical messages to different processes. Which pattern fits best?",
             zh: "你想把「一般／退款／技術」訊息分流到不同流程，最貼切的模式是？" },
        options: [
          { en: "Prompt chaining", zh: "提示鏈" },
          { en: "Routing", zh: "路由" },
          { en: "Evaluator–optimizer", zh: "評估者—優化者" },
          { en: "Parallelization", zh: "平行化" }
        ], answer: 1,
        explain: { en: "Routing classifies the input, then directs it to a specialized follow-up — separation of concerns.",
                   zh: "路由先分類輸入，再分派給專門的後續處理 —— 關注點分離。" } },

      { q: { en: "Running the same task multiple times and taking a consensus is which variant of parallelization?",
             zh: "「同一任務跑很多次再取共識」是平行化的哪個變體？" },
        options: [
          { en: "Sectioning", zh: "分節（Sectioning）" },
          { en: "Voting", zh: "投票（Voting）" },
          { en: "Gating", zh: "關卡（Gating）" },
          { en: "Handoff", zh: "交接（Handoff）" }
        ], answer: 1,
        explain: { en: "Voting = same task repeated for diverse outputs; sectioning = splitting into independent subtasks.",
                   zh: "投票＝同任務重複取多樣輸出；分節＝切成獨立子任務。" } },

      { q: { en: "What most distinguishes orchestrator–workers from parallelization?",
             zh: "協調者—工作者與平行化最大的不同是？" },
        options: [
          { en: "Subtasks are decided dynamically at run time, not predefined", zh: "子任務在執行時動態決定，而非預先寫死" },
          { en: "It is always cheaper", zh: "它總是比較便宜" },
          { en: "Workers can't use tools", zh: "工作者不能用工具" },
          { en: "There is no difference", zh: "沒有差別" }
        ], answer: 0,
        explain: { en: "In parallelization subtasks are pre-listed; the orchestrator decides them on the fly.",
                   zh: "平行化的子任務是預先列好的；協調者則是當場決定。" } },

      { q: { en: "Per Anthropic's overarching advice, what should you do facing a new task?",
             zh: "依 Anthropic 的整體建議，面對新任務應該？" },
        options: [
          { en: "Always start with a multi-agent system", zh: "一律先上多代理系統" },
          { en: "Find the simplest solution; add complexity only when it demonstrably helps", zh: "先找最簡單的解法；只有明顯有幫助時才加複雜度" },
          { en: "Always use evaluator–optimizer", zh: "永遠用評估者—優化者" },
          { en: "Maximize the number of LLM calls", zh: "讓 LLM 呼叫越多越好" }
        ], answer: 1,
        explain: { en: "Agentic systems trade latency and cost for performance — so add complexity only when it pays off.",
                   zh: "代理系統是以延遲與成本換表現 —— 所以只有划算時才增加複雜度。" } },

      { q: { en: "What is the core loop of ReAct?",
             zh: "ReAct 的核心迴圈是？" },
        options: [
          { en: "Thought → Action → Observation", zh: "思考 → 行動 → 觀察" },
          { en: "Map → Reduce", zh: "Map → Reduce" },
          { en: "Generate → Vote", zh: "生成 → 投票" },
          { en: "Encode → Decode", zh: "編碼 → 解碼" }
        ], answer: 0,
        explain: { en: "ReAct (Yao et al.) interleaves reasoning and acting: Thought → Action → Observation, repeated.",
                   zh: "ReAct（Yao 等）交錯推理與行動：思考 → 行動 → 觀察，反覆進行。" } },

      { q: { en: "'One LLM generates, another evaluates and gives feedback, looping to refine' — which pattern?",
             zh: "「一個 LLM 生成、另一個評估回饋、迴圈精修」是哪個模式？" },
        options: [
          { en: "Routing", zh: "路由" },
          { en: "Evaluator–optimizer", zh: "評估者—優化者" },
          { en: "Prompt chaining", zh: "提示鏈" },
          { en: "Manager pattern", zh: "Manager pattern" }
        ], answer: 1,
        explain: { en: "Evaluator–optimizer; academically it echoes Reflexion's verbal self-reflection loop.",
                   zh: "評估者—優化者；學術上呼應 Reflexion 的口語自我反思迴圈。" } }
    ]
  },

  /* ===================================================================== */
  /* SOURCES — table of references                                         */
  /* ===================================================================== */
  {
    slug: "sources", layout: "table", icon: "menu_book",
    title:    { en: "Sources & References", zh: "參考來源" },
    subtitle: { en: "Every claim on this site traces back to a primary or authoritative source. Filter by origin, open any link.",
                zh: "本站每個論點都能追溯到一手或權威來源。可依出處篩選，點任一連結開啟。" },
    columns: [
      { key: "title", label: { en: "Source", zh: "來源" }, type: "text" },
      { key: "org",   label: { en: "Origin", zh: "出處" }, type: "tag", filter: true },
      { key: "kind",  label: { en: "Type", zh: "類型" }, type: "text" },
      { key: "url",   label: { en: "Link", zh: "連結" }, type: "link" }
    ],
    rows: [
      { title: { en: "Building Effective Agents (Dec 2024)", zh: "Building Effective Agents（2024 年 12 月）" },
        org: { en: "Anthropic", zh: "Anthropic" }, kind: { en: "Engineering blog (primary)", zh: "工程部落格（一手）" }, url: SRC.anthropic },
      { title: { en: "Anthropic Cookbook — agent patterns (code)", zh: "Anthropic Cookbook — agent patterns（程式碼）" },
        org: { en: "Anthropic", zh: "Anthropic" }, kind: { en: "Code examples", zh: "程式碼範例" }, url: SRC.cookbook },
      { title: { en: "A Practical Guide to Building Agents", zh: "A Practical Guide to Building Agents" },
        org: { en: "OpenAI", zh: "OpenAI" }, kind: { en: "Whitepaper (primary)", zh: "白皮書（一手）" }, url: SRC.openai },
      { title: { en: "Agents (Wiesinger, Marlow, Vuskovic, 2024)", zh: "Agents（Wiesinger、Marlow、Vuskovic，2024）" },
        org: { en: "Google", zh: "Google" }, kind: { en: "Whitepaper (primary)", zh: "白皮書（一手）" }, url: SRC.google },
      { title: { en: "Workflows and Agents", zh: "Workflows and Agents" },
        org: { en: "LangGraph", zh: "LangGraph" }, kind: { en: "Framework docs", zh: "框架文件" }, url: SRC.langgraph },
      { title: { en: "LLM Powered Autonomous Agents (2023)", zh: "LLM Powered Autonomous Agents（2023）" },
        org: { en: "Lilian Weng", zh: "Lilian Weng" }, kind: { en: "Research survey", zh: "研究綜述" }, url: SRC.weng },
      { title: { en: "ReAct: Synergizing Reasoning and Acting (2023)", zh: "ReAct：推理與行動的協同（2023）" },
        org: { en: "arXiv", zh: "arXiv" }, kind: { en: "Paper · Yao et al.", zh: "論文 · Yao 等" }, url: SRC.react },
      { title: { en: "Reflexion: Verbal Reinforcement Learning (2023)", zh: "Reflexion：口語強化學習（2023）" },
        org: { en: "arXiv", zh: "arXiv" }, kind: { en: "Paper · Shinn et al.", zh: "論文 · Shinn 等" }, url: SRC.reflexion },
      { title: { en: "Chain-of-Thought Prompting (2022)", zh: "Chain-of-Thought Prompting（2022）" },
        org: { en: "arXiv", zh: "arXiv" }, kind: { en: "Paper · Wei et al.", zh: "論文 · Wei 等" }, url: SRC.cot },
      { title: { en: "Tree of Thoughts (2023)", zh: "Tree of Thoughts（2023）" },
        org: { en: "arXiv", zh: "arXiv" }, kind: { en: "Paper · Yao et al.", zh: "論文 · Yao 等" }, url: SRC.tot },
      { title: { en: "Agent Workflow: Six Patterns (starting reference)", zh: "Agent Workflow：六種模式（起點參考）" },
        org: { en: "GigaAI", zh: "GigaAI" }, kind: { en: "Secondary synthesis", zh: "二手綜整" }, url: SRC.gigaai }
    ]
  }
];
