import type { EconomicRow, EconomicTwin } from "./economicEngine";

export type MoneyAccountType = "operating" | "savings" | "tax" | "cash" | "other";
export type MoneyEntryKind = "income" | "expense" | "tax" | "debt_service" | "investment" | "other_in" | "other_out";
export type MoneyEntryStatus = "actual" | "planned";
export type MoneyRecurrence = "none" | "monthly" | "quarterly" | "annual";

export type MoneyAccount = {
  id: string;
  name: string;
  type: MoneyAccountType;
  balance: number;
  currency: string;
  updatedAt: string;
  source: string;
};

export type BalanceItem = {
  id: string;
  kind: "asset" | "debt";
  name: string;
  category: string;
  amount: number;
  currency: string;
  updatedAt: string;
  source: string;
};

export type MoneyEntry = {
  id: string;
  kind: MoneyEntryKind;
  status: MoneyEntryStatus;
  date: string;
  amount: number;
  currency: string;
  description: string;
  counterparty: string;
  recurrence: MoneyRecurrence;
  source: string;
};

export type CalendarEvent = {
  id: string;
  date: string;
  amount: number;
  direction: "in" | "out";
  label: string;
  category: string;
  status: MoneyEntryStatus;
  publicCharge: boolean;
  source: string;
};

export type MonthSummary = {
  month: string;
  monthIndex: number;
  actualIn: number;
  actualOut: number;
  plannedIn: number;
  plannedOut: number;
  publicCharges: number;
  net: number;
  projectedClosingCash: number | null;
  events: CalendarEvent[];
};

export type CompanyMoneySnapshot = {
  year: number;
  currency: string;
  totalCash: number;
  totalAssets: number;
  totalDebt: number;
  netAssets: number;
  annualInflow: number;
  annualOutflow: number;
  annualNet: number;
  annualPublicCharges: number;
  next30Inflow: number;
  next30Outflow: number;
  next30PublicCharges: number;
  months: MonthSummary[];
  events: CalendarEvent[];
};

const DAY = 86_400_000;
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const iso = (date: Date) => date.toISOString().slice(0, 10);
const dateValue = (value: string) => {
  const stamp = Date.parse(value);
  return Number.isFinite(stamp) ? stamp : 0;
};
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const isPaid = (status: string) => ["paid","settled","succeeded","complete","completed"].includes(status.toLowerCase());
const isFailed = (status: string) => ["failed","cancelled","void"].includes(status.toLowerCase());
const isPublicCharge = (value: string) => /(tax|vat|mva|payroll tax|employer|public|government|avgift|skatt)/i.test(value);

function paymentTotals(rows: EconomicRow[]) {
  const totals = new Map<string, number>();
  rows.filter(row => row.kind === "payment_in" && row.invoiceId && !isFailed(row.status)).forEach(row => {
    totals.set(row.invoiceId, (totals.get(row.invoiceId) || 0) + row.amount);
  });
  return totals;
}

function expandManualEntry(entry: MoneyEntry, year: number): CalendarEvent[] {
  const base = new Date(`${entry.date}T12:00:00`);
  if (Number.isNaN(base.getTime())) return [];
  const event = (date: Date, suffix: string): CalendarEvent => ({
    id: `${entry.id}-${suffix}`,
    date: iso(date),
    amount: Math.abs(entry.amount),
    direction: ["income","other_in"].includes(entry.kind) ? "in" : "out",
    label: entry.description || entry.kind.replaceAll("_"," "),
    category: entry.kind,
    status: entry.status,
    publicCharge: entry.kind === "tax",
    source: entry.source,
  });
  if (entry.recurrence === "none") return base.getFullYear() === year ? [event(base,"0")] : [];
  const dates: Date[] = [];
  if (entry.recurrence === "monthly") {
    for (let month = 0; month < 12; month += 1) dates.push(new Date(year, month, Math.min(base.getDate(), 28), 12));
  } else if (entry.recurrence === "quarterly") {
    const startMonth = base.getMonth() % 3;
    for (let month = startMonth; month < 12; month += 3) dates.push(new Date(year, month, Math.min(base.getDate(), 28), 12));
  } else {
    dates.push(new Date(year, base.getMonth(), Math.min(base.getDate(), 28), 12));
  }
  return dates.filter(date => date.getFullYear() === year && date.getTime() >= base.getTime() - DAY).map((date,index) => event(date,String(index)));
}

function rowEvents(rows: EconomicRow[], year: number): CalendarEvent[] {
  const payments = paymentTotals(rows);
  const events: CalendarEvent[] = [];
  rows.forEach(row => {
    const push = (date: string, amount: number, direction: "in" | "out", label: string, status: MoneyEntryStatus, category: string, publicCharge = false) => {
      if (!date || new Date(`${date}T12:00:00`).getFullYear() !== year || amount <= 0) return;
      events.push({ id:`row-${row.id}-${direction}-${date}`, date, amount:round(amount), direction, label, category, status, publicCharge, source:row.source });
    };
    if (row.kind === "payment_in" && !isFailed(row.status)) push(row.date,row.amount,"in",row.customer || row.description || "Customer payment","actual","payment");
    if (row.kind === "payment_out") push(row.date,row.amount,"out",row.vendor || row.description || "Payment out","actual",row.category || "payment",isPublicCharge(`${row.category} ${row.vendor} ${row.description}`));
    if (row.kind === "invoice") {
      const outstanding = Math.max(0,row.amount - (payments.get(row.invoiceId) || 0));
      if (outstanding > 0) push(row.dueDate || row.date,outstanding,"in",row.customer || row.invoiceId || "Receivable","planned","receivable");
    }
    if (row.kind === "cost" && !isPaid(row.status)) push(row.dueDate || row.date,row.amount,"out",row.vendor || row.description || "Payable","planned",row.category || "payable",isPublicCharge(`${row.category} ${row.vendor} ${row.description}`));
    if (row.kind === "renewal") push(row.renewalDate || row.date,row.amount,"out",row.vendor || row.description || "Renewal","planned",row.category || "renewal",isPublicCharge(`${row.category} ${row.vendor} ${row.description}`));
  });
  return events;
}

export function buildCompanyMoneySnapshot(input: {
  rows: EconomicRow[];
  twin: EconomicTwin;
  accounts: MoneyAccount[];
  balanceItems: BalanceItem[];
  manualEntries: MoneyEntry[];
  year: number;
}): CompanyMoneySnapshot {
  const { rows, twin, accounts, balanceItems, manualEntries, year } = input;
  const currency = accounts[0]?.currency || rows[0]?.currency || twin.currency || "EUR";
  const totalCash = accounts.length ? accounts.reduce((sum,item)=>sum+item.balance,0) : twin.cash;
  const totalAssets = balanceItems.filter(item=>item.kind==="asset").reduce((sum,item)=>sum+item.amount,0);
  const totalDebt = balanceItems.filter(item=>item.kind==="debt").reduce((sum,item)=>sum+item.amount,0);
  const events = [...rowEvents(rows,year), ...manualEntries.flatMap(entry=>expandManualEntry(entry,year))].sort((a,b)=>dateValue(a.date)-dateValue(b.date));
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = currentYear === year ? now.getMonth() : -1;
  let projected = totalCash;
  const months: MonthSummary[] = MONTHS.map((month,monthIndex) => {
    const monthEvents = events.filter(event=>new Date(`${event.date}T12:00:00`).getMonth()===monthIndex);
    const actualIn = monthEvents.filter(event=>event.status==="actual"&&event.direction==="in").reduce((sum,event)=>sum+event.amount,0);
    const actualOut = monthEvents.filter(event=>event.status==="actual"&&event.direction==="out").reduce((sum,event)=>sum+event.amount,0);
    const plannedIn = monthEvents.filter(event=>event.status==="planned"&&event.direction==="in").reduce((sum,event)=>sum+event.amount,0);
    const plannedOut = monthEvents.filter(event=>event.status==="planned"&&event.direction==="out").reduce((sum,event)=>sum+event.amount,0);
    const publicCharges = monthEvents.filter(event=>event.publicCharge).reduce((sum,event)=>sum+event.amount,0);
    const net = actualIn + plannedIn - actualOut - plannedOut;
    let projectedClosingCash: number | null = null;
    if (year > currentYear || monthIndex >= currentMonth) {
      const futureEvents = monthEvents.filter(event => year !== currentYear || monthIndex > currentMonth || dateValue(event.date) >= Date.now() - DAY);
      projected += futureEvents.reduce((sum,event)=>sum+(event.direction==="in"?event.amount:-event.amount),0);
      projectedClosingCash = round(projected);
    }
    return {month,monthIndex,actualIn:round(actualIn),actualOut:round(actualOut),plannedIn:round(plannedIn),plannedOut:round(plannedOut),publicCharges:round(publicCharges),net:round(net),projectedClosingCash,events:monthEvents};
  });
  const next30End = Date.now() + 30 * DAY;
  const next30 = events.filter(event=>dateValue(event.date)>=Date.now()-DAY && dateValue(event.date)<=next30End);
  const annualInflow = events.filter(event=>event.direction==="in").reduce((sum,event)=>sum+event.amount,0);
  const annualOutflow = events.filter(event=>event.direction==="out").reduce((sum,event)=>sum+event.amount,0);
  return {
    year,currency,totalCash:round(totalCash),totalAssets:round(totalAssets),totalDebt:round(totalDebt),netAssets:round(totalCash+totalAssets-totalDebt),annualInflow:round(annualInflow),annualOutflow:round(annualOutflow),annualNet:round(annualInflow-annualOutflow),annualPublicCharges:round(events.filter(event=>event.publicCharge).reduce((sum,event)=>sum+event.amount,0)),next30Inflow:round(next30.filter(event=>event.direction==="in").reduce((sum,event)=>sum+event.amount,0)),next30Outflow:round(next30.filter(event=>event.direction==="out").reduce((sum,event)=>sum+event.amount,0)),next30PublicCharges:round(next30.filter(event=>event.publicCharge).reduce((sum,event)=>sum+event.amount,0)),months,events
  };
}

export function moneyEntryToEconomicRows(entry: MoneyEntry): EconomicRow[] {
  if (!["income","expense","tax"].includes(entry.kind)) return [];
  const base: EconomicRow = {
    id:`manual-${entry.id}`,date:entry.date,kind:entry.kind==="income"?"invoice":"cost",amount:Math.abs(entry.amount),currency:entry.currency,status:entry.status==="actual"?(entry.kind==="income"?"issued":"paid"):"open",customer:entry.kind==="income"?entry.counterparty:"",product:"",channel:"",vendor:entry.kind==="income"?"":entry.counterparty,category:entry.kind==="tax"?"public tax / charge":entry.kind,invoiceId:entry.kind==="income"?`MAN-${entry.id}`:"",paymentId:"",dueDate:entry.date,quantity:1,unitPrice:entry.kind==="income"?Math.abs(entry.amount):0,directCost:0,discountPct:0,billed:true,seatsPurchased:0,seatsUsed:0,renewalDate:"",description:entry.description,source:entry.source
  };
  if (entry.status !== "actual") return [base];
  const cash: EconomicRow = {...base,id:`manual-cash-${entry.id}`,kind:entry.kind==="income"?"payment_in":"payment_out",status:"settled",invoiceId:entry.kind==="income"?base.invoiceId:"",paymentId:`MANPAY-${entry.id}`,category:entry.kind==="tax"?"public tax / charge":"cash",directCost:0};
  return [base,cash];
}

export function demoCompanyMoney(currency = "EUR") {
  const today = new Date();
  const year = today.getFullYear();
  const d = (month: number, day: number) => iso(new Date(year,month,day,12));
  const accounts: MoneyAccount[] = [
    {id:"acc-operating",name:"Operating account",type:"operating",balance:31500,currency,updatedAt:iso(today),source:"Synthetic demo finance data"},
    {id:"acc-tax",name:"Tax reserve",type:"tax",balance:9500,currency,updatedAt:iso(today),source:"Synthetic demo finance data"},
    {id:"acc-buffer",name:"Liquidity buffer",type:"savings",balance:4000,currency,updatedAt:iso(today),source:"Synthetic demo finance data"},
  ];
  const balanceItems: BalanceItem[] = [
    {id:"asset-equipment",kind:"asset",name:"Equipment",category:"Operating assets",amount:42000,currency,updatedAt:iso(today),source:"Synthetic demo finance data"},
    {id:"asset-software",kind:"asset",name:"Capitalised software",category:"Intangible assets",amount:18000,currency,updatedAt:iso(today),source:"Synthetic demo finance data"},
    {id:"debt-loan",kind:"debt",name:"Business loan",category:"Interest-bearing debt",amount:68000,currency,updatedAt:iso(today),source:"Synthetic demo finance data"},
  ];
  const manualEntries: MoneyEntry[] = [
    {id:"salary",kind:"expense",status:"planned",date:d(0,25),amount:22000,currency,description:"Payroll",counterparty:"Team",recurrence:"monthly",source:"Synthetic demo finance data"},
    {id:"rent",kind:"expense",status:"planned",date:d(0,1),amount:5500,currency,description:"Office / workspace",counterparty:"Landlord",recurrence:"monthly",source:"Synthetic demo finance data"},
    {id:"vat",kind:"tax",status:"planned",date:d(1,10),amount:9000,currency,description:"VAT / public charge",counterparty:"Tax authority",recurrence:"quarterly",source:"Synthetic demo finance data"},
    {id:"loan",kind:"debt_service",status:"planned",date:d(0,15),amount:3500,currency,description:"Loan payment",counterparty:"Bank",recurrence:"monthly",source:"Synthetic demo finance data"},
  ];
  return {accounts,balanceItems,manualEntries};
}
