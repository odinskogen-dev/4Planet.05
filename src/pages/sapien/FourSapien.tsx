import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { parseEmblaShoppingList, summariseEmblaShoppingList } from "../../choice/embla";
import {
  confirmEmblaMemory,
  deleteEmblaMemory,
  getStoredSession,
  listEmblaMemories,
  readFoodFinancePermission,
  runEmblaTurn,
  setFoodFinancePermission,
  signInEmbla,
  signOutEmbla,
  supersedeEmblaMemory,
  type EmblaMemory,
  type EmblaSession,
} from "./emblaRuntime";
import "./embla-02.css";

type EmblaMode = "LIST" | "ASK";
type ChatMessage = { role: "user" | "assistant"; content: string; tools?: string[] };
type RuntimeState = "idle" | "thinking" | "complete" | "error";

const financeModules = [
  { title: "MONEY MAP", text: "One honest picture of income, fixed costs, debt, assets, goals and recurring commitments. Manual-first; connected accounts later." },
  { title: "CHOICE COST", text: "Turn everyday decisions into 1, 5 and 10-year consequences: cash, total cost, risk and opportunity cost." },
  { title: "INVESTMENT INTELLIGENCE", text: "Fundamentals, valuation ranges, scenarios, company evidence and uncertainty. Analysis and comparison — not BUY / SELL instructions." },
];

export function FourSapienHome() {
  const [mode, setMode] = useState<EmblaMode>("LIST");
  const [shoppingList, setShoppingList] = useState("Kaffe\nMelk\nSmør");
  const [store, setStore] = useState("KIWI");
  const [budget, setBudget] = useState("150");
  const [analysed, setAnalysed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [session, setSession] = useState<EmblaSession | null>(() => getStoredSession());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("idle");
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<EmblaMemory[]>([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [foodFinanceAllowed, setFoodFinanceAllowed] = useState(false);
  const [controlBusy, setControlBusy] = useState(false);

  const items = useMemo(() => parseEmblaShoppingList(shoppingList), [shoppingList]);
  const summary = useMemo(() => summariseEmblaShoppingList(items), [items]);

  const refreshControls = async (activeSession: EmblaSession) => {
    try {
      const [memoryResult, permissionResult] = await Promise.all([
        listEmblaMemories(activeSession),
        readFoodFinancePermission(activeSession),
      ]);
      setSession(memoryResult.session);
      setMemories(memoryResult.memories);
      setFoodFinanceAllowed(permissionResult.allowed);
    } catch {
      // The chat remains usable even if a secondary control surface is temporarily unavailable.
    }
  };

  useEffect(() => {
    if (session) void refreshControls(session);
  }, []);

  const analyseList = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnalysed(true);
    setSaved(false);
  };

  const authenticate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    try {
      const next = await signInEmbla(email.trim(), password);
      setSession(next);
      setPassword("");
      await refreshControls(next);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "SIGN_IN_FAILED");
    }
  };

  const runEmbla = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text || !session || runtimeState === "thinking") return;
    setPrompt("");
    setRuntimeError(null);
    setRuntimeState("thinking");
    setMessages((current) => [...current, { role: "user", content: text }]);
    try {
      const result = await runEmblaTurn(session, text, conversationId);
      setSession(result.session);
      setConversationId(result.turn.conversation_id || conversationId);
      setMessages((current) => [...current, {
        role: "assistant",
        content: result.turn.answer || "Embla returned no answer.",
        tools: result.turn.tools_used || [],
      }]);
      setRuntimeState("complete");
      await refreshControls(result.session);
    } catch (error) {
      setRuntimeState("error");
      setRuntimeError(error instanceof Error ? error.message : "EMBLA_RUNTIME_FAILED");
    }
  };

  const saveList = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("4planet.embla.shopping-list.v1", JSON.stringify({ shoppingList, store, budget, savedAt: new Date().toISOString() }));
    }
    setSaved(true);
  };

  const logout = () => {
    signOutEmbla();
    setSession(null);
    setConversationId(null);
    setMessages([]);
    setMemories([]);
    setFoodFinanceAllowed(false);
    setRuntimeState("idle");
    setRuntimeError(null);
  };

  const changePermission = async () => {
    if (!session || controlBusy) return;
    setControlBusy(true);
    try {
      const result = await setFoodFinancePermission(session, !foodFinanceAllowed);
      setSession(result.session);
      setFoodFinanceAllowed(!foodFinanceAllowed);
    } finally {
      setControlBusy(false);
    }
  };

  const confirmMemory = async (memory: EmblaMemory) => {
    if (!session || controlBusy) return;
    setControlBusy(true);
    try {
      const result = await confirmEmblaMemory(session, memory.id);
      setSession(result.session);
      await refreshControls(result.session);
    } finally {
      setControlBusy(false);
    }
  };

  const removeMemory = async (memory: EmblaMemory) => {
    if (!session || controlBusy) return;
    setControlBusy(true);
    try {
      const result = await deleteEmblaMemory(session, memory.id);
      setSession(result.session);
      await refreshControls(result.session);
    } finally {
      setControlBusy(false);
    }
  };

  const changeMemory = async (memory: EmblaMemory) => {
    if (!session || controlBusy || typeof window === "undefined") return;
    const content = window.prompt("Change what Embla should remember", memory.content)?.trim();
    if (!content || content === memory.content) return;
    setControlBusy(true);
    try {
      const result = await supersedeEmblaMemory(session, memory, content);
      setSession(result.session);
      await refreshControls(result.session);
    } finally {
      setControlBusy(false);
    }
  };

  return (
    <main className="embla02">
      <header className="embla02__header">
        <Link to="/" className="embla02__brand">4PLANET_</Link>
        <span className="embla02__byline">4SAPIEN / EMBLA HUMAN GOLD</span>
      </header>

      <section className="embla02__hero">
        <p className="embla02__eyebrow">PERSONAL CHOICE INTELLIGENCE</p>
        <h1>Embla.</h1>
        <p className="embla02__lede">Better choices for your life — without making you do the research first.</p>

        <nav className="embla02__quick" aria-label="Embla quick actions">
          <button type="button" className={mode === "LIST" ? "is-active" : ""} onClick={() => { setMode("LIST"); setAnalysed(false); }}>Shopping list</button>
          <button type="button" onClick={() => { setMode("LIST"); setShoppingList("Kaffe"); setAnalysed(false); }}>Find best</button>
          <Link to="/4sapien/food">Scan</Link>
          <button type="button" className={mode === "ASK" ? "is-active" : ""} onClick={() => setMode("ASK")}>Ask Embla</button>
        </nav>
      </section>

      {mode === "LIST" ? (
        <section className="embla02__workspace" aria-labelledby="embla-list-title">
          <div className="embla02__workspace-head">
            <div>
              <p className="embla02__eyebrow">FIRST REAL JOB</p>
              <h2 id="embla-list-title">Give me your list.</h2>
            </div>
            <span className="embla02__truth-chip">NO EVIDENCE → NO RECOMMENDATION</span>
          </div>

          <form onSubmit={analyseList} className="embla02__list-form">
            <label htmlFor="embla-shopping-list">What do you need?</label>
            <textarea id="embla-shopping-list" value={shoppingList} onChange={(event) => { setShoppingList(event.target.value); setAnalysed(false); }} placeholder="Coffee\nMilk\nButter" />

            <div className="embla02__context-grid">
              <label>Store
                <select value={store} onChange={(event) => setStore(event.target.value)}>
                  <option>KIWI</option>
                  <option>REMA 1000</option>
                  <option>MENY</option>
                  <option>ODA</option>
                  <option>OTHER / UNKNOWN</option>
                </select>
              </label>
              <label>Budget · NOK
                <input inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^0-9.,]/g, ""))} placeholder="Optional" />
              </label>
            </div>

            <p className="embla02__boundary">Store is your shopping context only. Embla does not claim live shelf availability unless matching store evidence exists.</p>
            <button type="submit" className="embla02__primary">Analyse my list</button>
          </form>

          {analysed ? (
            <section className="embla02__results" aria-live="polite">
              <div className="embla02__result-summary">
                <div><strong>{summary.supported}</strong><span>evidence-ready</span></div>
                <div><strong>{summary.unsupported}</strong><span>not covered yet</span></div>
                <div><strong>{budget || "—"}</strong><span>NOK target</span></div>
              </div>

              <div className="embla02__items">
                {items.map((item, index) => (
                  <article key={`${item.raw}-${index}`} className="embla02__item" data-supported={item.supported ? "yes" : "no"}>
                    <div>
                      <span className="embla02__item-status">{item.status.replaceAll("_", " ")}</span>
                      <h3>{item.raw}</h3>
                      {item.supported ? (
                        <p>{item.label} is one of the first three controlled FOOD categories. Embla can use the existing product truth path, but category-wide ranking is withheld until product-level evidence and availability are sufficient.</p>
                      ) : (
                        <p>This item stays on your list, but Embla will not pretend the category is ready yet.</p>
                      )}
                    </div>
                    {item.supported ? <Link to="/4sapien/food">Open food evidence →</Link> : <span className="embla02__muted-action">Keep as-is</span>}
                  </article>
                ))}
              </div>

              <div className="embla02__action-bar">
                <div><strong>{store}</strong><span>Context saved only when you choose to save this list.</span></div>
                <button type="button" onClick={saveList}>Use this list</button>
              </div>
              {saved ? <p className="embla02__saved">Saved on this device. This is the first bounded LEARN receipt — not a claim that products were purchased.</p> : null}
            </section>
          ) : null}
        </section>
      ) : (
        <section className="embla02__workspace embla02__workspace--ask" aria-labelledby="embla-ask-title">
          <div className="embla02__workspace-head">
            <div><p className="embla02__eyebrow">ASK EMBLA / REAL LIFE MODEL</p><h2 id="embla-ask-title">What are you trying to decide?</h2></div>
            {session ? <span className="embla02__truth-chip">PRIVATE SESSION / {session.user.email || "SIGNED IN"}</span> : <span className="embla02__truth-chip">SIGN IN REQUIRED</span>}
          </div>

          {!session ? (
            <form onSubmit={authenticate} className="embla02__auth" aria-label="Sign in to 4SAPIEN">
              <div>
                <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
              </div>
              <p>Your password is sent directly to the existing 4SAPIEN Supabase Auth service and is never stored by this interface.</p>
              {authError ? <p className="embla02__error" role="alert">{authError}</p> : null}
              <button type="submit" className="embla02__primary">Enter 4SAPIEN</button>
            </form>
          ) : (
            <>
              <div className="embla02__sessionbar">
                <div><span>EMBLA CORE</span><strong>{conversationId ? "Conversation active" : "Ready"}</strong></div>
                <div className="embla02__session-actions">
                  <button type="button" onClick={() => setMemoryOpen((open) => !open)}>Memory · {memories.length}</button>
                  <button type="button" onClick={changePermission} disabled={controlBusy}>{foodFinanceAllowed ? "Food budget sharing: ON" : "Food budget sharing: OFF"}</button>
                  <button type="button" onClick={logout}>Sign out</button>
                </div>
              </div>

              {memoryOpen ? (
                <section className="embla02__memory" aria-label="Embla memory">
                  <div><p className="embla02__eyebrow">YOUR MEMORY</p><h3>You control what persists.</h3></div>
                  {memories.length ? memories.map((memory) => (
                    <article key={memory.id}>
                      <div><span>{memory.memory_type.replaceAll("_", " ")} · {memory.state}</span><p>{memory.content}</p></div>
                      <div>
                        {memory.state === "proposed" ? <button type="button" onClick={() => void confirmMemory(memory)} disabled={controlBusy}>Remember</button> : null}
                        <button type="button" onClick={() => void changeMemory(memory)} disabled={controlBusy}>Change</button>
                        <button type="button" onClick={() => void removeMemory(memory)} disabled={controlBusy}>Delete</button>
                      </div>
                    </article>
                  )) : <p className="embla02__boundary">Nothing durable is stored yet. Normal conversation is not automatically memory.</p>}
                </section>
              ) : null}

              <div className="embla02__chat" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="embla02__chat-empty">
                    <strong>One Embla. Your private Life Model.</strong>
                    <span>Try: “How much money do I actually have available now?” or “Remember that I’m saving 50,000 NOK for Japan.”</span>
                  </div>
                ) : messages.map((message, index) => (
                  <article key={`${message.role}-${index}`} data-role={message.role}>
                    <span>{message.role === "assistant" ? "EMBLA" : "YOU"}</span>
                    <p>{message.content}</p>
                    {message.tools?.length ? <small>Used verified tools: {Array.from(new Set(message.tools)).join(" · ")}</small> : null}
                  </article>
                ))}
                {runtimeState === "thinking" ? <div className="embla02__thinking"><span /> Embla is checking your Life Model and the tools needed for this answer.</div> : null}
              </div>

              <form onSubmit={runEmbla} className="embla02__ask-form">
                <textarea aria-label="Ask Embla" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Can I afford this without making the rest of my life tighter?" disabled={runtimeState === "thinking"} />
                <div className="embla02__ask-actions">
                  <p>Facts, calculations and unknowns stay distinct. You decide.</p>
                  <button type="submit" className="embla02__primary" disabled={!prompt.trim() || runtimeState === "thinking"}>{runtimeState === "thinking" ? "Checking…" : "Ask Embla"}</button>
                </div>
              </form>
              {runtimeError ? <p className="embla02__error" role="alert">Embla could not complete that turn: {runtimeError}. Your message is not presented as answered.</p> : null}
              <p className="embla02__boundary">Food can access only the bounded Finance food-budget context when you explicitly switch sharing on above. It cannot read salary, debt, investments or unrestricted Finance data through that seam.</p>
            </>
          )}
        </section>
      )}

      <section className="embla02__principle">
        <div><p className="embla02__eyebrow">ONE SAPIEN / MANY CHOICES</p><h2>Understand me. Understand the world. Help me choose. Help me act.</h2></div>
        <div className="embla02__principle-links">
          <Link to="/4sapien/food">FOOD / LIVE PROOF</Link>
          <Link to="/4sapien/finance">4FINANCE / MONEY CONTEXT</Link>
        </div>
      </section>
    </main>
  );
}

export function FourFinanceHome() {
  return (
    <main className="embla-finance">
      <header className="embla-finance__header"><Link to="/4sapien">← EMBLA</Link><span>4FINANCE / PROOF 00</span></header>
      <section className="embla-finance__hero"><p>EMBLA / MONEY INTELLIGENCE</p><h1>Understand money.<br />Choose with it.</h1><span>4FINANCE is the financial lens inside 4SAPIEN. The same Choice Engine links money to the rest of your life.</span></section>
      <section className="embla-finance__modules">{financeModules.map((module, index) => <article key={module.title}><span>0{index + 1}</span><h2>{module.title}</h2><p>{module.text}</p></article>)}</section>
      <section className="embla-finance__boundary"><p>TRUTH BY DESIGN</p><h2>Evidence and scenarios. Not a magic BUY button.</h2><span>Connected accounts and evidence-complete investment comparison are not active in this proof. Missing financial context remains UNKNOWN.</span></section>
    </main>
  );
}
