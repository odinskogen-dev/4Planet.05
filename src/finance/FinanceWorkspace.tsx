import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { trackMeaningfulUse } from "@/analytics/ProductAnalytics";
import {
  calculateHoldingMetrics,
  FINANCE_DEVICE_STATE_KEY,
  formatMoney,
  listFinanceCurrencies,
  normaliseCurrency,
  parseDecimal,
  parseFinanceDeviceState,
  summariseCurrency,
} from "./core";
import type { AccountKind, FinanceDeviceState, ManualFinanceAccount, ManualHolding } from "./core";
import { BANK_CONNECTION_CONTRACT } from "./provider";
import "./finance-core.css";

type AccountDraft = {
  name: string;
  kind: AccountKind;
  balance: string;
  currency: string;
};

type HoldingDraft = {
  symbol: string;
  name: string;
  quantity: string;
  averageCost: string;
  currentPrice: string;
  currency: string;
};

const INITIAL_ACCOUNT: AccountDraft = { name: "", kind: "bank", balance: "", currency: "NOK" };
const INITIAL_HOLDING: HoldingDraft = { symbol: "", name: "", quantity: "", averageCost: "", currentPrice: "", currency: "NOK" };

const kindLabels: Record<AccountKind, string> = {
  bank: "Bankkonto",
  cash: "Kontanter",
  debt: "Gjeld",
  asset: "Annen eiendel",
};

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return nowIso().slice(0, 10);
}

function createId(prefix: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function loadState(): FinanceDeviceState {
  if (typeof window === "undefined") return parseFinanceDeviceState(null);
  return parseFinanceDeviceState(window.localStorage.getItem(FINANCE_DEVICE_STATE_KEY));
}

function displayAsOf(value: string | null) {
  if (!value) return "Pris mangler";
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium" }).format(parsed);
}

function genericFinanceReceipt(kind: "account" | "holding" | "quote") {
  trackEvent("activation", { product_area: "4sapien", activation_kind: `finance_${kind}_saved` });
  trackMeaningfulUse("4sapien", "journey_progress", `finance_${kind}_saved`);
}

export function FinanceWorkspace() {
  const [state, setState] = useState<FinanceDeviceState>(loadState);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>(INITIAL_ACCOUNT);
  const [holdingDraft, setHoldingDraft] = useState<HoldingDraft>(INITIAL_HOLDING);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [holdingError, setHoldingError] = useState<string | null>(null);
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(FINANCE_DEVICE_STATE_KEY, JSON.stringify(state));
  }, [state]);

  const currencies = useMemo(
    () => listFinanceCurrencies(state.accounts, state.holdings),
    [state.accounts, state.holdings],
  );
  const summaries = useMemo(
    () => currencies.map((currency) => summariseCurrency(state.accounts, state.holdings, currency)),
    [currencies, state.accounts, state.holdings],
  );

  const saveAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const balance = parseDecimal(accountDraft.balance);
    if (!accountDraft.name.trim()) {
      setAccountError("Gi kontoen et navn.");
      return;
    }
    if (balance === null || balance < 0) {
      setAccountError("Beløpet må være 0 eller høyere. Velg Gjeld for lån og kreditt.");
      return;
    }

    const account: ManualFinanceAccount = {
      id: createId("account"),
      name: accountDraft.name.trim(),
      kind: accountDraft.kind,
      balance: String(balance),
      currency: normaliseCurrency(accountDraft.currency),
      asOf: todayIso(),
      source: "manual",
    };
    setState((current) => ({ ...current, accounts: [...current.accounts, account], updatedAt: nowIso() }));
    setAccountDraft(INITIAL_ACCOUNT);
    setAccountError(null);
    setSavedMessage("Konto lagret lokalt på denne enheten.");
    genericFinanceReceipt("account");
  };

  const saveHolding = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = parseDecimal(holdingDraft.quantity);
    const averageCost = parseDecimal(holdingDraft.averageCost);
    const currentPrice = parseDecimal(holdingDraft.currentPrice);
    if (!holdingDraft.symbol.trim()) {
      setHoldingError("Ticker/symbol er påkrevd.");
      return;
    }
    if (quantity === null || quantity <= 0 || averageCost === null || averageCost < 0) {
      setHoldingError("Antall må være over 0 og kjøpspris må være 0 eller høyere.");
      return;
    }
    if (holdingDraft.currentPrice.trim() !== "" && (currentPrice === null || currentPrice < 0)) {
      setHoldingError("Dagens pris må være 0 eller høyere, eller stå tom.");
      return;
    }

    const holding: ManualHolding = {
      id: createId("holding"),
      symbol: holdingDraft.symbol.trim().toUpperCase(),
      name: holdingDraft.name.trim(),
      quantity: String(quantity),
      averageCost: String(averageCost),
      currentPrice: currentPrice === null ? null : String(currentPrice),
      currency: normaliseCurrency(holdingDraft.currency),
      asOf: currentPrice === null ? null : nowIso(),
      source: "manual",
    };
    setState((current) => ({ ...current, holdings: [...current.holdings, holding], updatedAt: nowIso() }));
    setHoldingDraft(INITIAL_HOLDING);
    setHoldingError(null);
    setSavedMessage("Beholdning lagret. Dagens pris er merket som manuell.");
    genericFinanceReceipt("holding");
  };

  const updateQuote = (holding: ManualHolding) => {
    const value = parseDecimal(quoteDrafts[holding.id] ?? "");
    if (value === null || value < 0) {
      setHoldingError("Skriv inn en gyldig pris før du oppdaterer.");
      return;
    }
    setState((current) => ({
      ...current,
      holdings: current.holdings.map((row) => row.id === holding.id
        ? { ...row, currentPrice: String(value), asOf: nowIso(), source: "manual" }
        : row),
      updatedAt: nowIso(),
    }));
    setQuoteDrafts((current) => ({ ...current, [holding.id]: "" }));
    setHoldingError(null);
    setSavedMessage(`${holding.symbol} er oppdatert med manuell pris.`);
    genericFinanceReceipt("quote");
  };

  const removeAccount = (id: string) => {
    setState((current) => ({ ...current, accounts: current.accounts.filter((row) => row.id !== id), updatedAt: nowIso() }));
  };

  const removeHolding = (id: string) => {
    setState((current) => ({ ...current, holdings: current.holdings.filter((row) => row.id !== id), updatedAt: nowIso() }));
  };

  const clearDeviceData = () => {
    if (!window.confirm("Slette alle lokale TEST-data for kontoer og beholdninger på denne enheten?")) return;
    const empty = parseFinanceDeviceState(null);
    setState({ ...empty, updatedAt: nowIso() });
    setSavedMessage("Lokale TEST-data er slettet fra denne enheten.");
  };

  return (
    <main className="finance-core">
      <header className="finance-core__header">
        <Link to="/4sapien">← EMBLA</Link>
        <span>4FINANCE / CORE 01 / HEIR TEST</span>
      </header>

      <section className="finance-core__hero">
        <p className="finance-core__eyebrow">PERSONLIG ØKONOMI / FAKTA FØRST</p>
        <h1>Din økonomi.<br />Nå.</h1>
        <p className="finance-core__lede">Registrer det du faktisk har, skylder og eier. 4SAPIEN regner — du bestemmer.</p>
        <div className="finance-core__truth-row" aria-label="Datastatus">
          <span>MANUELL DATA</span>
          <span>LOKALT PÅ ENHETEN</span>
          <span>INGEN RÅD / INGEN HANDEL</span>
        </div>
      </section>

      <section className="finance-core__section" aria-labelledby="finance-picture-title">
        <div className="finance-core__section-head">
          <div><p>01 / OVERSIKT</p><h2 id="finance-picture-title">Økonomibilde</h2></div>
          <span>Valutaer summeres aldri på tvers uten valutakurs.</span>
        </div>
        <div className="finance-core__currency-groups">
          {summaries.map((summary) => (
            <article className="finance-core__currency" key={summary.currency}>
              <div className="finance-core__currency-head">
                <strong>{summary.currency}</strong>
                <span>{summary.holdingCount} beholdning{summary.holdingCount === 1 ? "" : "er"}</span>
              </div>
              <dl className="finance-core__metrics">
                <div><dt>Likviditet</dt><dd>{formatMoney(summary.liquidity, summary.currency)}</dd><small>Bank + kontanter</small></div>
                <div><dt>Gjeld</dt><dd>{formatMoney(summary.debt, summary.currency)}</dd><small>Registrert saldo</small></div>
                <div><dt>Porteføljeverdi</dt><dd>{formatMoney(summary.portfolioValue, summary.currency)}</dd><small>{summary.missingQuoteCount > 0 ? `${summary.missingQuoteCount} pris mangler` : "Manuelle priser"}</small></div>
                <div><dt>Urealisert endring</dt><dd className={(summary.unrealisedChange ?? 0) < 0 ? "is-negative" : ""}>{formatMoney(summary.unrealisedChange, summary.currency)}</dd><small>Verdi − kostpris</small></div>
                <div className="finance-core__metric-primary"><dt>Registrert netto</dt><dd>{formatMoney(summary.recordedNetWorth, summary.currency)}</dd><small>Ikke komplett formue med mindre alle verdier er registrert</small></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="finance-core__section finance-core__bank" aria-labelledby="bank-status-title">
        <div className="finance-core__section-head">
          <div><p>02 / BANK</p><h2 id="bank-status-title">Bankstatus</h2></div>
          <span className="finance-core__status" data-state="off">IKKE KOBLET</span>
        </div>
        <div className="finance-core__bank-grid">
          <div>
            <strong>Lesetilgang via autorisert leverandør</strong>
            <p>Arkitekturen er klar for PSD2-kontosyn, men ingen leverandøravtale, bankfullmakt eller nøkkel er aktivert. Derfor vises ingen konto som bankverifisert.</p>
          </div>
          <dl>
            <div><dt>Mål</dt><dd>{BANK_CONNECTION_CONTRACT.targetSuccessfulSyncsPerDay} vellykkede synk/døgn</dd></div>
            <div><dt>Faktisk nå</dt><dd>0 / ingen tilkobling</dd></div>
            <div><dt>Siste synk</dt><dd>—</dd></div>
            <div><dt>Neste synk</dt><dd>Krever samtykke</dd></div>
          </dl>
        </div>
        <p className="finance-core__notice">Fire per døgn er et adaptivt mål, ikke et løfte. Banken eller leverandøren kan tillate færre kall. 4SAPIEN skal vise siste vellykkede tidspunkt, neste tillatte forsøk og eventuelle hull.</p>
        <button type="button" disabled className="finance-core__disabled-action">Koble bank · krever aktivert leverandør</button>
      </section>

      <div className="finance-core__work-grid">
        <section className="finance-core__section" aria-labelledby="accounts-title">
          <div className="finance-core__section-head"><div><p>03 / KONTOER</p><h2 id="accounts-title">Registrer saldo</h2></div><span>Manuell kilde</span></div>
          <form className="finance-core__form" onSubmit={saveAccount}>
            <label>Navn<input aria-label="Kontonavn" value={accountDraft.name} onChange={(event) => setAccountDraft({ ...accountDraft, name: event.target.value })} placeholder="Brukskonto" /></label>
            <div className="finance-core__form-row">
              <label>Type<select aria-label="Kontotype" value={accountDraft.kind} onChange={(event) => setAccountDraft({ ...accountDraft, kind: event.target.value as AccountKind })}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Valuta<select aria-label="Kontovaluta" value={accountDraft.currency} onChange={(event) => setAccountDraft({ ...accountDraft, currency: event.target.value })}><option>NOK</option><option>USD</option><option>EUR</option><option>SEK</option><option>DKK</option><option>GBP</option></select></label>
            </div>
            <label>Saldo<input aria-label="Kontosaldo" inputMode="decimal" value={accountDraft.balance} onChange={(event) => setAccountDraft({ ...accountDraft, balance: event.target.value })} placeholder="25000" /></label>
            {accountError ? <p className="finance-core__error" role="alert">{accountError}</p> : null}
            <button type="submit" className="finance-core__primary">Lagre konto</button>
          </form>
          <div className="finance-core__records">
            {state.accounts.length === 0 ? <p className="finance-core__empty">Ingen konto registrert. Likviditet forblir ukjent.</p> : state.accounts.map((account) => (
              <article key={account.id}>
                <div><span>{kindLabels[account.kind]} · MANUELL</span><strong>{account.name}</strong><small>Per {displayAsOf(account.asOf)}</small></div>
                <div className="finance-core__record-value"><strong>{formatMoney(parseDecimal(account.balance), account.currency)}</strong><button type="button" onClick={() => removeAccount(account.id)} aria-label={`Fjern ${account.name}`}>Fjern</button></div>
              </article>
            ))}
          </div>
        </section>

        <section className="finance-core__section" aria-labelledby="holdings-title">
          <div className="finance-core__section-head"><div><p>04 / INVEST</p><h2 id="holdings-title">Portefølje</h2></div><span>Overvåking, ikke råd</span></div>
          <form className="finance-core__form" onSubmit={saveHolding}>
            <div className="finance-core__form-row">
              <label>Ticker<input aria-label="Ticker" value={holdingDraft.symbol} onChange={(event) => setHoldingDraft({ ...holdingDraft, symbol: event.target.value.toUpperCase() })} placeholder="EQNR.OL" /></label>
              <label>Navn<input aria-label="Aksjenavn" value={holdingDraft.name} onChange={(event) => setHoldingDraft({ ...holdingDraft, name: event.target.value })} placeholder="Valgfritt" /></label>
            </div>
            <div className="finance-core__form-row finance-core__form-row--three">
              <label>Antall<input aria-label="Antall aksjer" inputMode="decimal" value={holdingDraft.quantity} onChange={(event) => setHoldingDraft({ ...holdingDraft, quantity: event.target.value })} placeholder="100" /></label>
              <label>Kjøpspris<input aria-label="Gjennomsnittlig kjøpspris" inputMode="decimal" value={holdingDraft.averageCost} onChange={(event) => setHoldingDraft({ ...holdingDraft, averageCost: event.target.value })} placeholder="250" /></label>
              <label>Valuta<select aria-label="Aksjevaluta" value={holdingDraft.currency} onChange={(event) => setHoldingDraft({ ...holdingDraft, currency: event.target.value })}><option>NOK</option><option>USD</option><option>EUR</option><option>SEK</option><option>DKK</option><option>GBP</option></select></label>
            </div>
            <label>Dagens pris · valgfri<input aria-label="Dagens aksjepris" inputMode="decimal" value={holdingDraft.currentPrice} onChange={(event) => setHoldingDraft({ ...holdingDraft, currentPrice: event.target.value })} placeholder="La stå tom hvis ukjent" /></label>
            {holdingError ? <p className="finance-core__error" role="alert">{holdingError}</p> : null}
            <button type="submit" className="finance-core__primary">Legg til beholdning</button>
          </form>
          <div className="finance-core__records finance-core__holdings">
            {state.holdings.length === 0 ? <p className="finance-core__empty">Ingen beholdning registrert. Markedsverdi forblir ukjent.</p> : state.holdings.map((holding) => {
              const metrics = calculateHoldingMetrics(holding);
              return (
                <article key={holding.id}>
                  <div className="finance-core__holding-main">
                    <span>{holding.symbol} · {holding.currency} · MANUELL PRIS</span>
                    <strong>{holding.name || holding.symbol}</strong>
                    <small>{holding.quantity} × {formatMoney(parseDecimal(holding.averageCost), holding.currency)} · kost {formatMoney(metrics.costBasis, holding.currency)}</small>
                  </div>
                  <div className="finance-core__holding-value">
                    <strong>{formatMoney(metrics.marketValue, holding.currency)}</strong>
                    <small className={(metrics.unrealisedChange ?? 0) < 0 ? "is-negative" : ""}>{metrics.unrealisedChange === null ? "Pris mangler" : `${formatMoney(metrics.unrealisedChange, holding.currency)} · ${metrics.unrealisedChangePercent ?? "—"}%`}</small>
                    <span>Per {displayAsOf(holding.asOf)}</span>
                  </div>
                  <div className="finance-core__quote-update">
                    <input aria-label={`Ny pris for ${holding.symbol}`} inputMode="decimal" value={quoteDrafts[holding.id] ?? ""} onChange={(event) => setQuoteDrafts({ ...quoteDrafts, [holding.id]: event.target.value })} placeholder="Ny pris" />
                    <button type="button" onClick={() => updateQuote(holding)}>Oppdater</button>
                    <button type="button" onClick={() => removeHolding(holding.id)} aria-label={`Fjern ${holding.symbol}`}>Fjern</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="finance-core__truth" aria-labelledby="finance-truth-title">
        <div><p>05 / SANNHET</p><h2 id="finance-truth-title">Det 4SAPIEN vet — og ikke vet.</h2></div>
        <ul>
          <li><strong>MANUELL</strong><span>Du har skrevet inn verdien. Den er ikke bank- eller børsverifisert.</span></li>
          <li><strong>UKJENT</strong><span>Manglende konto eller pris blir aldri gjort om til null.</span></li>
          <li><strong>VALUTA</strong><span>NOK, USD og andre valutaer holdes adskilt til en datert FX-kilde finnes.</span></li>
          <li><strong>INVEST</strong><span>Verdi og urealisert endring er matematikk, ikke kjøps- eller salgsråd.</span></li>
        </ul>
      </section>

      <footer className="finance-core__footer">
        <div>
          <strong>HEIR TEST · IKKE KANONISK FINANSLAGRING</strong>
          <span>Data ligger i nettleseren på denne enheten. Innlogging og RLS-beskyttet Supabase blir kanonisk først ved separat aktivering.</span>
        </div>
        <button type="button" onClick={clearDeviceData}>Slett lokale TEST-data</button>
      </footer>
      {savedMessage ? <p className="finance-core__saved" role="status">{savedMessage}</p> : null}
    </main>
  );
}
