export type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type RowKind = "invoice" | "payment_in" | "cost" | "payment_out" | "usage" | "software" | "renewal";

export type EconomicRow = {
  id: string;
  date: string;
  kind: RowKind;
  amount: number;
  currency: string;
  status: string;
  customer: string;
  product: string;
  channel: string;
  vendor: string;
  category: string;
  invoiceId: string;
  paymentId: string;
  dueDate: string;
  quantity: number;
  unitPrice: number;
  directCost: number;
  discountPct: number;
  billed: boolean;
  seatsPurchased: number;
  seatsUsed: number;
  renewalDate: string;
  description: string;
  source: string;
};

export type DriverNode = { label: string; value: number; unit: "currency" | "pp"; detail: string };
export type CashWeek = { week: number; label: string; inflow: number; outflow: number; endingCash: number; truthClass: TruthClass };
export type ProfitLine = { key: string; revenue: number; directCost: number; contribution: number; contributionMargin: number; rows: number };
export type Opportunity = {
  id: string;
  detector: string;
  title: string;
  eyebrow: string;
  why: string;
  valueLow: number;
  valueHigh: number;
  currency: string;
  exactData: string[];
  calculation: string;
  assumptions: string[];
  evidence: string[];
  confidence: Confidence;
  truthClass: TruthClass;
  falsifier: string;
  intervention: string;
  timeToValue: string;
  rowIds: string[];
};

export type EconomicTwin = {
  currency: string;
  sourceNames: string[];
  rowCount: number;
  revenue: number;
  cash: number;
  cashIsConfirmed: boolean;
  costs: number;
  grossProfit: number;
  grossMargin: number;
  ar: number;
  overdueAr: number;
  ap: number;
  overdueAp: number;
  customers: number;
  products: number;
  channels: number;
  currentPeriod: { revenue: number; directCost: number; grossMargin: number; invoices: number; avgInvoice: number; discountPct: number };
  previousPeriod: { revenue: number; directCost: number; grossMargin: number; invoices: number; avgInvoice: number; discountPct: number };
  revenueDelta: number;
  grossMarginDeltaPp: number;
  revenueDrivers: DriverNode[];
  marginDrivers: DriverNode[];
  cash13Week: CashWeek[];
  profitByCustomer: ProfitLine[];
  profitByProduct: ProfitLine[];
  profitByChannel: ProfitLine[];
  opportunities: Opportunity[];
};

const DAY = 86_400_000;
const clean = (value: unknown) => String(value ?? "").trim();
const number = (value: unknown) => {
  const text = clean(value).replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.\-]/g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};
const bool = (value: unknown, fallback = false) => {
  const text = clean(value).toLowerCase();
  if (["true", "1", "yes", "y", "ja", "paid", "billed"].includes(text)) return true;
  if (["false", "0", "no", "n", "nei", "unbilled"].includes(text)) return false;
  return fallback;
};
const dateValue = (value: string) => {
  const stamp = Date.parse(value);
  return Number.isFinite(stamp) ? stamp : 0;
};
const iso = (date: Date) => date.toISOString().slice(0, 10);
const offsetDate = (days: number) => iso(new Date(Date.now() + days * DAY));
const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);
const round = (value: number, precision = 2) => Number(value.toFixed(precision));
const safePct = (numerator: number, denominator: number) => denominator ? (numerator / denominator) * 100 : 0;
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') { current += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { result.push(current.trim()); current = ""; continue; }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function normaliseKind(value: string): RowKind {
  const text = value.toLowerCase().replace(/[\s-]+/g, "_");
  if (["invoice", "sale", "revenue"].includes(text)) return "invoice";
  if (["payment", "payment_in", "cash_in", "receipt"].includes(text)) return "payment_in";
  if (["expense", "cost", "bill", "payable"].includes(text)) return "cost";
  if (["payment_out", "cash_out", "vendor_payment"].includes(text)) return "payment_out";
  if (["usage", "billable_usage"].includes(text)) return "usage";
  if (["software", "software_seat", "saas"].includes(text)) return "software";
  if (["renewal", "auto_renewal", "contract_renewal"].includes(text)) return "renewal";
  return "invoice";
}

export function parseEconomicCsv(text: string, sourceName = "CSV import"): EconomicRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(value => value.toLowerCase().trim().replace(/[\s-]+/g, "_"));
  const pick = (record: Record<string, string>, ...keys: string[]) => keys.map(key => record[key]).find(value => value !== undefined && value !== "") ?? "";
  return lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, cellIndex) => { record[header] = cells[cellIndex] ?? ""; });
    const kind = normaliseKind(pick(record, "kind", "type", "event", "transaction_type"));
    const amount = Math.abs(number(pick(record, "amount", "value", "total", "revenue", "cost")));
    const quantity = number(pick(record, "quantity", "qty", "units")) || 1;
    const unitPrice = number(pick(record, "unit_price", "price")) || (kind === "invoice" && quantity ? amount / quantity : 0);
    return {
      id: pick(record, "id", "row_id") || `${sourceName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${index + 1}`,
      date: pick(record, "date", "transaction_date", "invoice_date") || iso(new Date()),
      kind,
      amount,
      currency: (pick(record, "currency") || "EUR").toUpperCase(),
      status: (pick(record, "status", "payment_status") || "recorded").toLowerCase(),
      customer: pick(record, "customer", "customer_name", "account"),
      product: pick(record, "product", "sku", "plan"),
      channel: pick(record, "channel", "sales_channel"),
      vendor: pick(record, "vendor", "supplier"),
      category: pick(record, "category", "cost_category"),
      invoiceId: pick(record, "invoice_id", "invoice", "invoice_number"),
      paymentId: pick(record, "payment_id", "payment", "payment_reference"),
      dueDate: pick(record, "due_date", "due"),
      quantity,
      unitPrice,
      directCost: Math.abs(number(pick(record, "direct_cost", "cogs", "cost_of_goods"))),
      discountPct: Math.max(0, number(pick(record, "discount_pct", "discount_percent", "discount"))),
      billed: bool(pick(record, "billed", "is_billed"), kind !== "usage"),
      seatsPurchased: Math.max(0, number(pick(record, "seats_purchased", "seats", "licenses"))),
      seatsUsed: Math.max(0, number(pick(record, "seats_used", "active_seats", "active_licenses"))),
      renewalDate: pick(record, "renewal_date", "renews_at", "contract_renewal"),
      description: pick(record, "description", "memo", "note"),
      source: sourceName,
    };
  }).filter(row => row.amount > 0 || row.kind === "usage" || row.kind === "software");
}

function paymentTotals(rows: EconomicRow[]) {
  const totals = new Map<string, number>();
  rows.filter(row => row.kind === "payment_in" && !["failed", "cancelled", "void"].includes(row.status)).forEach(row => {
    if (!row.invoiceId) return;
    totals.set(row.invoiceId, (totals.get(row.invoiceId) || 0) + row.amount);
  });
  return totals;
}

function periodStats(rows: EconomicRow[], startDaysAgo: number, endDaysAgo: number) {
  const end = Date.now() - endDaysAgo * DAY;
  const start = Date.now() - startDaysAgo * DAY;
  const invoices = rows.filter(row => row.kind === "invoice" && dateValue(row.date) >= start && dateValue(row.date) < end);
  const revenue = sum(invoices.map(row => row.amount));
  const directCost = sum(invoices.map(row => row.directCost));
  const avgInvoice = invoices.length ? revenue / invoices.length : 0;
  const discountPct = invoices.length ? sum(invoices.map(row => row.discountPct)) / invoices.length : 0;
  return { revenue, directCost, grossMargin: safePct(revenue - directCost, revenue), invoices: invoices.length, avgInvoice, discountPct };
}

function profitLines(rows: EconomicRow[], field: "customer" | "product" | "channel"): ProfitLine[] {
  const groups = new Map<string, { revenue: number; directCost: number; rows: number }>();
  rows.filter(row => row.kind === "invoice").forEach(row => {
    const key = row[field] || "Unassigned";
    const current = groups.get(key) || { revenue: 0, directCost: 0, rows: 0 };
    current.revenue += row.amount;
    current.directCost += row.directCost;
    current.rows += 1;
    groups.set(key, current);
  });
  return [...groups.entries()].map(([key, value]) => ({
    key,
    revenue: round(value.revenue),
    directCost: round(value.directCost),
    contribution: round(value.revenue - value.directCost),
    contributionMargin: round(safePct(value.revenue - value.directCost, value.revenue), 1),
    rows: value.rows,
  })).sort((a, b) => b.contribution - a.contribution);
}

function cashProjection(rows: EconomicRow[], currentCash: number) {
  const payments = paymentTotals(rows);
  const weeks: CashWeek[] = [];
  let running = currentCash;
  for (let week = 0; week < 13; week += 1) {
    const start = Date.now() + week * 7 * DAY;
    const end = start + 7 * DAY;
    let inflow = 0;
    let outflow = 0;
    rows.forEach(row => {
      const due = dateValue(row.renewalDate || row.dueDate || row.date);
      if (due < start || due >= end) return;
      if (row.kind === "invoice") inflow += Math.max(0, row.amount - (payments.get(row.invoiceId) || 0));
      if (row.kind === "cost" && !["paid", "settled"].includes(row.status)) outflow += row.amount;
      if (row.kind === "renewal") outflow += row.amount;
    });
    running += inflow - outflow;
    weeks.push({ week: week + 1, label: `W${week + 1}`, inflow: round(inflow), outflow: round(outflow), endingCash: round(running), truthClass: "ESTIMATE" });
  }
  return weeks;
}

function opportunity(input: Omit<Opportunity, "currency"> & { currency?: string }): Opportunity {
  return { currency: input.currency || "EUR", ...input };
}

function detectOpportunities(rows: EconomicRow[], twinBase: Omit<EconomicTwin, "opportunities">): Opportunity[] {
  const currency = twinBase.currency;
  const opportunities: Opportunity[] = [];
  const payments = paymentTotals(rows);
  const today = Date.now();

  const failed = rows.filter(row => row.kind === "payment_in" && row.status === "failed");
  const failedValue = sum(failed.map(row => row.amount));
  if (failedValue > 0) opportunities.push(opportunity({
    id:"failed-payments",detector:"FAILED PAYMENTS",title:"Recover failed customer payments",eyebrow:"VALUE AT RISK",why:`${failed.length} failed payment${failed.length === 1 ? "" : "s"} are recorded in the imported data.`,valueLow:round(failedValue*.55),valueHigh:round(failedValue),currency,
    exactData:[`${failed.length} failed payment rows`,`${currency} ${round(failedValue)} attempted value`],calculation:`Failed payment value × 55–100% recoverability = ${currency} ${round(failedValue*.55)}–${round(failedValue)}.`,assumptions:["Recovery rate is not known; range is intentionally broad."],evidence:failed.map(row=>`${row.id}: ${row.customer || "unknown customer"} · ${currency} ${row.amount}`),confidence:"HIGH",truthClass:"ESTIMATE",falsifier:"Payments were already recovered outside this dataset or are intentionally non-recoverable.",intervention:"Review failed payment causes, retry eligible payments and contact high-value affected customers.",timeToValue:"1–14 days",rowIds:failed.map(row=>row.id)
  }));

  const overdueInvoices = rows.filter(row => row.kind === "invoice" && row.dueDate && dateValue(row.dueDate) < today && Math.max(0,row.amount-(payments.get(row.invoiceId)||0)) > 0);
  const overdueAr = sum(overdueInvoices.map(row => Math.max(0,row.amount-(payments.get(row.invoiceId)||0))));
  if (overdueAr > 0) opportunities.push(opportunity({
    id:"overdue-ar",detector:"OVERDUE AR",title:"Collect overdue receivables",eyebrow:"CASH OPPORTUNITY",why:`${overdueInvoices.length} overdue invoice${overdueInvoices.length===1?"":"s"} still have an unpaid balance.`,valueLow:round(overdueAr*.65),valueHigh:round(overdueAr),currency,
    exactData:[`${overdueInvoices.length} overdue invoices`,`${currency} ${round(overdueAr)} outstanding`],calculation:`Outstanding invoice amount = invoice value − reconciled successful payments. Recovery range uses 65–100% pending collection evidence.`,assumptions:["No credit notes or external settlements are missing from the import."],evidence:overdueInvoices.map(row=>`${row.invoiceId||row.id} · due ${row.dueDate} · ${currency} ${round(Math.max(0,row.amount-(payments.get(row.invoiceId)||0)))}`),confidence:"HIGH",truthClass:"ESTIMATE",falsifier:"Invoices were settled, disputed or written off outside the imported data.",intervention:"Reconcile balances, prioritise largest overdue accounts and run a bounded collection sequence.",timeToValue:"1–30 days",rowIds:overdueInvoices.map(row=>row.id)
  }));

  const invoiceGroups = new Map<string,EconomicRow[]>();
  rows.filter(row=>row.kind==="payment_in" && !["failed","cancelled","void"].includes(row.status) && row.invoiceId).forEach(row=>invoiceGroups.set(row.invoiceId,[...(invoiceGroups.get(row.invoiceId)||[]),row]));
  const duplicates = [...invoiceGroups.entries()].flatMap(([invoiceId, group]) => {
    const invoice = rows.find(row=>row.kind==="invoice" && row.invoiceId===invoiceId);
    if (!invoice) return [];
    const paid = sum(group.map(row=>row.amount));
    return paid > invoice.amount + 1 ? [{invoice,group,excess:paid-invoice.amount}] : [];
  });
  const duplicateValue=sum(duplicates.map(item=>item.excess));
  if(duplicateValue>0) opportunities.push(opportunity({
    id:"duplicate-payments",detector:"DUPLICATE / EXCESS PAYMENTS",title:"Reconcile excess customer payments",eyebrow:"RECONCILIATION",why:"Successful payments exceed their linked invoice value for one or more invoices.",valueLow:round(duplicateValue),valueHigh:round(duplicateValue),currency,exactData:[`${duplicates.length} invoice mismatch${duplicates.length===1?"":"es"}`,`${currency} ${round(duplicateValue)} excess recorded`],calculation:"Successful linked payments − invoice amount, only where the result is positive.",assumptions:["Invoice/payment links are correct."],evidence:duplicates.map(item=>`${item.invoice.invoiceId}: excess ${currency} ${round(item.excess)}`),confidence:"HIGH",truthClass:"CALCULATION",falsifier:"The excess is a valid prepayment, multi-invoice allocation or intentionally unallocated cash.",intervention:"Reconcile the affected payments before treating excess cash as realised company value.",timeToValue:"Same day",rowIds:duplicates.flatMap(item=>[item.invoice.id,...item.group.map(row=>row.id)])
  }));

  const unbilled=rows.filter(row=>row.kind==="usage" && !row.billed && row.amount>0);
  const unbilledValue=sum(unbilled.map(row=>row.amount));
  if(unbilledValue>0) opportunities.push(opportunity({
    id:"unbilled-usage",detector:"USAGE NOT BILLED",title:"Bill recorded usage that has not been invoiced",eyebrow:"REVENUE LEAKAGE",why:`${unbilled.length} billable usage row${unbilled.length===1?"":"s"} are marked unbilled.`,valueLow:round(unbilledValue*.8),valueHigh:round(unbilledValue),currency,exactData:[`${unbilled.length} unbilled usage rows`,`${currency} ${round(unbilledValue)} expected billable value`],calculation:"Sum of imported usage rows where billed = false.",assumptions:["Imported usage amount reflects contractually billable value."],evidence:unbilled.map(row=>`${row.id}: ${row.customer||"unknown"} · ${row.product||"usage"} · ${currency} ${row.amount}`),confidence:"HIGH",truthClass:"ESTIMATE",falsifier:"Usage is free-tier, disputed, bundled or already included in another invoice.",intervention:"Validate entitlement and create invoices only for contractually billable usage.",timeToValue:"1–7 days",rowIds:unbilled.map(row=>row.id)
  }));

  const software=rows.filter(row=>row.kind==="software" && row.seatsPurchased>0 && row.seatsUsed>=0 && row.seatsUsed<row.seatsPurchased);
  const unusedAnnual=sum(software.map(row=>row.amount*((row.seatsPurchased-row.seatsUsed)/row.seatsPurchased)*12));
  if(unusedAnnual>0) opportunities.push(opportunity({
    id:"unused-seats",detector:"UNUSED SOFTWARE SEATS",title:"Remove unused software capacity",eyebrow:"COST LEAKAGE",why:"Imported software records show paid seats that are not actively used.",valueLow:round(unusedAnnual*.5),valueHigh:round(unusedAnnual),currency,exactData:software.map(row=>`${row.vendor||row.description||row.id}: ${row.seatsUsed}/${row.seatsPurchased} seats used`),calculation:"Monthly software cost × unused-seat share × 12 months; lower bound assumes only 50% can be removed.",assumptions:["Amount is monthly recurring spend.","Unused seats can be reduced without contractual minimums."],evidence:software.map(row=>`${row.id}: ${currency} ${row.amount}/month`),confidence:"MEDIUM",truthClass:"ESTIMATE",falsifier:"Unused seats are required buffer, contracted minimums or temporarily inactive users.",intervention:"Confirm seat ownership, remove stale users and right-size at the next billing point.",timeToValue:"1–45 days",rowIds:software.map(row=>row.id)
  }));

  const vendorRows=rows.filter(row=>row.kind==="cost" && row.vendor);
  const vendors=unique(vendorRows.map(row=>row.vendor));
  vendors.forEach(vendor=>{
    const group=vendorRows.filter(row=>row.vendor===vendor).sort((a,b)=>dateValue(a.date)-dateValue(b.date));
    if(group.length<2)return;
    const prior=group.slice(0,Math.ceil(group.length/2));
    const recent=group.slice(Math.ceil(group.length/2));
    const priorAvg=sum(prior.map(row=>row.amount))/prior.length;
    const recentAvg=sum(recent.map(row=>row.amount))/recent.length;
    if(priorAvg<=0||recentAvg<=priorAvg*1.1)return;
    const monthlyDelta=recentAvg-priorAvg;
    opportunities.push(opportunity({id:`vendor-creep-${vendor.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,detector:"VENDOR PRICE CREEP",title:`Review ${vendor} price increase`,eyebrow:"COST LEAKAGE",why:`Recent recorded ${vendor} cost is ${round(((recentAvg/priorAvg)-1)*100,1)}% above the earlier average.`,valueLow:round(monthlyDelta*6),valueHigh:round(monthlyDelta*12),currency,exactData:[`Earlier average ${currency} ${round(priorAvg)}`,`Recent average ${currency} ${round(recentAvg)}`],calculation:"Recent average vendor cost − prior average, annualised for 6–12 periods.",assumptions:["Rows represent comparable recurring periods."],evidence:group.map(row=>`${row.date}: ${currency} ${row.amount}`),confidence:"MEDIUM",truthClass:"ESTIMATE",falsifier:"The increase reflects higher volume, scope or one-time work rather than unit-price creep.",intervention:"Validate scope and unit pricing, then renegotiate or re-source only if the increase is like-for-like.",timeToValue:"7–60 days",rowIds:group.map(row=>row.id)}));
  });

  const renewals=rows.filter(row=>row.kind==="renewal" && row.renewalDate && dateValue(row.renewalDate)>=today && dateValue(row.renewalDate)<=today+60*DAY);
  const renewalValue=sum(renewals.map(row=>row.amount));
  if(renewalValue>0) opportunities.push(opportunity({id:"upcoming-renewals",detector:"UPCOMING AUTO-RENEWALS",title:"Review contracts before they auto-renew",eyebrow:"COMMITTED COST",why:`${renewals.length} renewal${renewals.length===1?"":"s"} fall inside the next 60 days.`,valueLow:round(renewalValue*.1),valueHigh:round(renewalValue),currency,exactData:[`${renewals.length} upcoming renewals`,`${currency} ${round(renewalValue)} contracted value`],calculation:"10–100% of upcoming renewal value shown as a review range, not assumed savings.",assumptions:["Renewal records are current.","Some contracts may be necessary and non-cancellable."],evidence:renewals.map(row=>`${row.vendor||row.description||row.id} · ${row.renewalDate} · ${currency} ${row.amount}`),confidence:"HIGH",truthClass:"ESTIMATE",falsifier:"Contracts are essential, already cancelled, or terms prevent any price/scope change.",intervention:"Assign an owner and make an explicit renew / renegotiate / cancel decision before notice deadlines.",timeToValue:"Before renewal date",rowIds:renewals.map(row=>row.id)}));

  if(twinBase.grossMarginDeltaPp < -1) {
    const recoverable=twinBase.currentPeriod.revenue*Math.abs(twinBase.grossMarginDeltaPp)/100;
    opportunities.push(opportunity({id:"margin-deterioration",detector:"MARGIN DETERIORATION",title:"Investigate gross-margin deterioration",eyebrow:"MARGIN LEAKAGE",why:`Gross margin is ${round(Math.abs(twinBase.grossMarginDeltaPp),1)}pp lower than the previous 30-day period.`,valueLow:round(recoverable*.4),valueHigh:round(recoverable),currency,exactData:[`Current gross margin ${round(twinBase.currentPeriod.grossMargin,1)}%`,`Previous gross margin ${round(twinBase.previousPeriod.grossMargin,1)}%`],calculation:"Current-period revenue × absolute gross-margin decline. Range assumes 40–100% of the decline is potentially recoverable.",assumptions:["The two 30-day periods are directionally comparable."],evidence:twinBase.marginDrivers.map(driver=>`${driver.label}: ${round(driver.value,2)}pp`),confidence:"MEDIUM",truthClass:"ESTIMATE",falsifier:"The margin shift is intentional, seasonal or driven by a strategic mix change with higher lifetime value.",intervention:"Inspect direct-cost intensity, price, mix and discount movement before choosing a corrective action.",timeToValue:"7–45 days",rowIds:rows.filter(row=>row.kind==="invoice" && dateValue(row.date)>=today-60*DAY).map(row=>row.id)}));
  }

  const negativeProducts=twinBase.profitByProduct.filter(line=>line.contribution<0);
  const negativeValue=sum(negativeProducts.map(line=>Math.abs(line.contribution)));
  if(negativeValue>0) opportunities.push(opportunity({id:"negative-product-economics",detector:"NEGATIVE SKU / PLAN ECONOMICS",title:"Fix negative product contribution",eyebrow:"PROFIT LEAKAGE",why:`${negativeProducts.length} product/plan group${negativeProducts.length===1?"":"s"} show negative direct contribution.`,valueLow:round(negativeValue*.5),valueHigh:round(negativeValue),currency,exactData:negativeProducts.map(line=>`${line.key}: contribution ${currency} ${round(line.contribution)}`),calculation:"Absolute negative direct contribution by product. Allocated overhead is intentionally excluded.",assumptions:["direct_cost / COGS fields are correctly attributed."],evidence:negativeProducts.map(line=>`${line.key}: revenue ${currency} ${line.revenue}; direct cost ${currency} ${line.directCost}`),confidence:"HIGH",truthClass:"CALCULATION",falsifier:"Negative direct economics are an intentional acquisition investment with evidenced downstream lifetime value.",intervention:"Review price, scope and direct delivery cost for affected products before scaling them.",timeToValue:"7–60 days",rowIds:rows.filter(row=>row.kind==="invoice" && negativeProducts.some(item=>item.key===(row.product||"Unassigned"))).map(row=>row.id)}));

  const currentDiscount=twinBase.currentPeriod.discountPct;
  const previousDiscount=twinBase.previousPeriod.discountPct;
  if(currentDiscount>previousDiscount+2 && twinBase.currentPeriod.revenue>0){
    const gap=(currentDiscount-previousDiscount)/100;
    const value=twinBase.currentPeriod.revenue*gap;
    opportunities.push(opportunity({id:"discount-leakage",detector:"PRICING / DISCOUNT LEAKAGE",title:"Review rising discount intensity",eyebrow:"PRICING",why:`Average recorded discount is ${round(currentDiscount-previousDiscount,1)}pp above the previous period.`,valueLow:round(value*.4),valueHigh:round(value),currency,exactData:[`Current avg discount ${round(currentDiscount,1)}%`,`Previous avg discount ${round(previousDiscount,1)}%`],calculation:"Current-period revenue × increase in recorded average discount rate; range assumes 40–100% may be avoidable.",assumptions:["Discount fields are populated consistently across periods."],evidence:rows.filter(row=>row.kind==="invoice"&&dateValue(row.date)>=today-30*DAY).map(row=>`${row.invoiceId||row.id}: discount ${row.discountPct}%`),confidence:"MEDIUM",truthClass:"ESTIMATE",falsifier:"Higher discounts are contractually required or produce an evidenced gain in volume, retention or lifetime value.",intervention:"Segment discounts by customer/product/channel and require evidence for exceptions above policy.",timeToValue:"7–30 days",rowIds:rows.filter(row=>row.kind==="invoice"&&dateValue(row.date)>=today-30*DAY).map(row=>row.id)}));
  }

  const currentInvoices=rows.filter(row=>row.kind==="invoice"&&dateValue(row.date)>=today-30*DAY);
  const customerRevenue=new Map<string,number>();
  currentInvoices.forEach(row=>customerRevenue.set(row.customer||"Unassigned",(customerRevenue.get(row.customer||"Unassigned")||0)+row.amount));
  const sortedCustomers=[...customerRevenue.entries()].sort((a,b)=>b[1]-a[1]);
  const top=sortedCustomers[0];
  const currentRevenue=sum(currentInvoices.map(row=>row.amount));
  if(top&&currentRevenue>0&&top[1]/currentRevenue>.35){
    const share=top[1]/currentRevenue;
    opportunities.push(opportunity({id:"customer-concentration",detector:"CUSTOMER CONCENTRATION",title:`Reduce dependency on ${top[0]}`,eyebrow:"REVENUE RISK",why:`${top[0]} represents ${round(share*100,1)}% of current-period recorded revenue.`,valueLow:0,valueHigh:round(top[1]),currency,exactData:[`${top[0]} revenue ${currency} ${round(top[1])}`,`Share ${round(share*100,1)}%`],calculation:"Largest customer revenue ÷ total current-period revenue. Upper range is exposure, not expected loss.",assumptions:["Customer attribution is complete for the current period."],evidence:currentInvoices.filter(row=>(row.customer||"Unassigned")===top[0]).map(row=>row.invoiceId||row.id),confidence:"HIGH",truthClass:"CALCULATION",falsifier:"The customer is contractually secured and concentration is an intentional strategic choice with acceptable downside.",intervention:"Quantify contract durability, gross contribution and replacement pipeline before changing commercial focus.",timeToValue:"30–180 days",rowIds:currentInvoices.filter(row=>(row.customer||"Unassigned")===top[0]).map(row=>row.id)}));
  }

  const overdueCosts=rows.filter(row=>row.kind==="cost"&&row.dueDate&&dateValue(row.dueDate)<today&&!["paid","settled"].includes(row.status));
  const overdueAp=sum(overdueCosts.map(row=>row.amount));
  if(overdueAp>0) opportunities.push(opportunity({id:"overdue-ap",detector:"OVERDUE AP",title:"Resolve overdue supplier obligations",eyebrow:"CASH / SUPPLIER RISK",why:`${overdueCosts.length} supplier obligation${overdueCosts.length===1?"":"s"} are past due.`,valueLow:round(overdueAp*.01),valueHigh:round(overdueAp*.05),currency,exactData:[`${currency} ${round(overdueAp)} overdue AP`],calculation:"1–5% of overdue AP shown as a bounded avoidable-fee / disruption risk range, not as certain savings.",assumptions:["Supplier status and due dates are current."],evidence:overdueCosts.map(row=>`${row.vendor||row.id} · due ${row.dueDate} · ${currency} ${row.amount}`),confidence:"HIGH",truthClass:"ESTIMATE",falsifier:"Suppliers explicitly agreed revised terms or balances are disputed/incorrect.",intervention:"Reconcile status, agree terms where needed and prioritise operationally critical suppliers.",timeToValue:"Same day–14 days",rowIds:overdueCosts.map(row=>row.id)}));

  const minCash=Math.min(...twinBase.cash13Week.map(week=>week.endingCash));
  if(minCash<0) opportunities.push(opportunity({id:"cash-risk-13w",detector:"13-WEEK CASH RISK",title:"Close the projected 13-week cash gap",eyebrow:"CASH RISK",why:`Scheduled imported obligations drive projected cash below zero within 13 weeks.`,valueLow:round(Math.abs(minCash)),valueHigh:round(Math.abs(minCash)*1.15),currency,exactData:[`Lowest projected cash ${currency} ${round(minCash)}`,`${twinBase.cash13Week.find(week=>week.endingCash===minCash)?.label||"13-week window"}`],calculation:"Confirmed current cash + dated outstanding AR − dated AP/renewals, accumulated weekly. Buffer range adds 15% uncertainty.",assumptions:["Open invoices collect on due date.","Open costs and renewals pay on due date.","No unrecorded financing or obligations."],evidence:twinBase.cash13Week.map(week=>`${week.label}: ending cash ${currency} ${week.endingCash}`),confidence:twinBase.cashIsConfirmed?"MEDIUM":"LOW",truthClass:"ESTIMATE",falsifier:"Timing, opening cash, financing or obligations materially differ from imported records.",intervention:"Validate the cash schedule, accelerate collectible AR, defer non-critical spend and secure a buffer before the first negative week.",timeToValue:"Before first negative week",rowIds:rows.filter(row=>row.dueDate||row.renewalDate).map(row=>row.id)}));

  return opportunities.sort((a,b)=>b.valueHigh-a.valueHigh).slice(0,15);
}

export function buildEconomicTwin(rows: EconomicRow[], confirmedCash?: number): EconomicTwin {
  const currency = rows.find(row=>row.currency)?.currency || "EUR";
  const invoices = rows.filter(row=>row.kind==="invoice");
  const revenue = sum(invoices.map(row=>row.amount));
  const directCost = sum(invoices.map(row=>row.directCost));
  const otherCosts = sum(rows.filter(row=>row.kind==="cost").map(row=>row.amount));
  const payments = paymentTotals(rows);
  const ar = sum(invoices.map(row=>Math.max(0,row.amount-(payments.get(row.invoiceId)||0))));
  const overdueAr = sum(invoices.filter(row=>row.dueDate&&dateValue(row.dueDate)<Date.now()).map(row=>Math.max(0,row.amount-(payments.get(row.invoiceId)||0))));
  const openCosts=rows.filter(row=>row.kind==="cost"&&!["paid","settled"].includes(row.status));
  const ap=sum(openCosts.map(row=>row.amount));
  const overdueAp=sum(openCosts.filter(row=>row.dueDate&&dateValue(row.dueDate)<Date.now()).map(row=>row.amount));
  const cashMovement = sum(rows.filter(row=>row.kind==="payment_in"&&!["failed","cancelled","void"].includes(row.status)).map(row=>row.amount))-sum(rows.filter(row=>row.kind==="payment_out").map(row=>row.amount));
  const cashIsConfirmed = typeof confirmedCash === "number" && Number.isFinite(confirmedCash);
  const cash = cashIsConfirmed ? Number(confirmedCash) : cashMovement;
  const currentPeriod=periodStats(rows,30,0);
  const previousPeriod=periodStats(rows,60,30);
  const revenueDelta=currentPeriod.revenue-previousPeriod.revenue;
  const priceEffect=(currentPeriod.avgInvoice-previousPeriod.avgInvoice)*previousPeriod.invoices;
  const volumeEffect=(currentPeriod.invoices-previousPeriod.invoices)*previousPeriod.avgInvoice;
  const mixResidual=revenueDelta-priceEffect-volumeEffect;
  const grossMarginDeltaPp=currentPeriod.grossMargin-previousPeriod.grossMargin;
  const directCostIntensityDelta=-(safePct(currentPeriod.directCost,currentPeriod.revenue)-safePct(previousPeriod.directCost,previousPeriod.revenue));
  const marginResidual=grossMarginDeltaPp-directCostIntensityDelta;
  const revenueDrivers:DriverNode[]=[
    {label:"Price / average invoice",value:round(priceEffect),unit:"currency",detail:"Change in average invoice value × previous invoice count."},
    {label:"Volume",value:round(volumeEffect),unit:"currency",detail:"Change in invoice count × previous average invoice value."},
    {label:"Mix / unexplained",value:round(mixResidual),unit:"currency",detail:"Residual required to reconcile exactly to revenue change; inspect product/customer mix before attributing causality."},
  ];
  const marginDrivers:DriverNode[]=[
    {label:"Direct-cost intensity",value:round(directCostIntensityDelta,2),unit:"pp",detail:"Change in direct cost as a share of revenue."},
    {label:"Commercial mix / unexplained",value:round(marginResidual,2),unit:"pp",detail:"Residual not explained by recorded direct cost intensity. Requires deeper price/mix/discount evidence."},
  ];
  const base:Omit<EconomicTwin,"opportunities">={
    currency,sourceNames:unique(rows.map(row=>row.source)),rowCount:rows.length,revenue:round(revenue),cash:round(cash),cashIsConfirmed,costs:round(directCost+otherCosts),grossProfit:round(revenue-directCost),grossMargin:round(safePct(revenue-directCost,revenue),1),ar:round(ar),overdueAr:round(overdueAr),ap:round(ap),overdueAp:round(overdueAp),customers:unique(invoices.map(row=>row.customer)).length,products:unique(invoices.map(row=>row.product)).length,channels:unique(invoices.map(row=>row.channel)).length,currentPeriod,previousPeriod,revenueDelta:round(revenueDelta),grossMarginDeltaPp:round(grossMarginDeltaPp,1),revenueDrivers,marginDrivers,cash13Week:cashProjection(rows,cash),profitByCustomer:profitLines(rows,"customer"),profitByProduct:profitLines(rows,"product"),profitByChannel:profitLines(rows,"channel")
  };
  return {...base,opportunities:detectOpportunities(rows,base)};
}

export function demoEconomicRows(): { rows: EconomicRow[]; confirmedCash: number } {
  const rows: EconomicRow[]=[];
  const invoice=(id:string,days:number,customer:string,product:string,channel:string,amount:number,directCost:number,discountPct:number,dueOffset:number)=>rows.push({id:`row-${id}`,date:offsetDate(days),kind:"invoice",amount,currency:"EUR",status:"issued",customer,product,channel,vendor:"",category:"revenue",invoiceId:id,paymentId:"",dueDate:offsetDate(dueOffset),quantity:1,unitPrice:amount,directCost,discountPct,billed:true,seatsPurchased:0,seatsUsed:0,renewalDate:"",description:`${product} invoice`,source:"Synthetic demo finance data"});
  const payment=(id:string,days:number,invoiceId:string,customer:string,amount:number,status="succeeded")=>rows.push({id:`row-${id}`,date:offsetDate(days),kind:"payment_in",amount,currency:"EUR",status,customer,product:"",channel:"",vendor:"",category:"cash",invoiceId,paymentId:id,dueDate:"",quantity:1,unitPrice:0,directCost:0,discountPct:0,billed:true,seatsPurchased:0,seatsUsed:0,renewalDate:"",description:"Customer payment",source:"Synthetic demo finance data"});
  const cost=(id:string,days:number,vendor:string,amount:number,status:string,dueOffset:number,category="operating")=>rows.push({id:`row-${id}`,date:offsetDate(days),kind:"cost",amount,currency:"EUR",status,customer:"",product:"",channel:"",vendor,category,invoiceId:"",paymentId:"",dueDate:offsetDate(dueOffset),quantity:1,unitPrice:0,directCost:0,discountPct:0,billed:true,seatsPurchased:0,seatsUsed:0,renewalDate:"",description:`${vendor} cost`,source:"Synthetic demo finance data"});

  invoice("P-1001",-56,"Northstar","Core","Direct",24000,12000,2,-40); invoice("P-1002",-52,"Bluebird","Core","Direct",18000,9000,1,-36); invoice("P-1003",-48,"Evergreen","Pro","Partner",30000,13500,2,-32); invoice("P-1004",-44,"Harbour","Pro","Direct",22000,10000,2,-28); invoice("P-1005",-39,"Juniper","Core","Partner",16000,7800,3,-23); invoice("P-1006",-34,"Northstar","Pro","Direct",28000,12500,2,-18);
  ["P-1001","P-1002","P-1003","P-1004","P-1005","P-1006"].forEach((id,index)=>{const source=rows.find(row=>row.invoiceId===id)!;payment(`PAY-${index+1}`,-50+index*4,id,source.customer,source.amount)});

  invoice("C-2001",-24,"Northstar","Core","Direct",22000,12500,8,-8); invoice("C-2002",-20,"Bluebird","Core","Direct",15000,9000,10,-5); invoice("C-2003",-16,"Evergreen","Pro","Partner",26000,15000,6,5); invoice("C-2004",-13,"Harbour","Pro","Direct",19000,11500,7,-2); invoice("C-2005",-9,"Northstar","Pro","Direct",25000,14500,8,11); invoice("C-2006",-5,"Frontier","Pilot","Partner",12000,15000,12,18);
  payment("PAY-C1",-18,"C-2001","Northstar",22000); payment("PAY-C2",-17,"C-2002","Bluebird",15000,"failed"); payment("PAY-C3",-8,"C-2003","Evergreen",13000); payment("PAY-C5A",-4,"C-2005","Northstar",25000); payment("PAY-C5B",-3,"C-2005","Northstar",25000);

  cost("V-OLD",-50,"CloudSuite",1200,"paid",-35,"software"); cost("V-NEW",-8,"CloudSuite",1600,"open",12,"software"); cost("AP-1",-12,"FulfilCo",7200,"open",-6,"fulfilment"); cost("AP-2",-2,"Inventory Partner",65000,"open",14,"inventory");
  rows.push({id:"row-software",date:offsetDate(-2),kind:"software",amount:2400,currency:"EUR",status:"active",customer:"",product:"",channel:"",vendor:"WorkOS",category:"software",invoiceId:"",paymentId:"",dueDate:"",quantity:1,unitPrice:0,directCost:0,discountPct:0,billed:true,seatsPurchased:40,seatsUsed:21,renewalDate:"",description:"Monthly software seats",source:"Synthetic demo finance data"});
  rows.push({id:"row-renewal",date:offsetDate(-20),kind:"renewal",amount:30000,currency:"EUR",status:"scheduled",customer:"",product:"",channel:"",vendor:"DataCloud",category:"software",invoiceId:"",paymentId:"",dueDate:"",quantity:1,unitPrice:0,directCost:0,discountPct:0,billed:true,seatsPurchased:0,seatsUsed:0,renewalDate:offsetDate(25),description:"Annual platform renewal",source:"Synthetic demo finance data"});
  rows.push({id:"row-usage",date:offsetDate(-3),kind:"usage",amount:4800,currency:"EUR",status:"recorded",customer:"Evergreen",product:"Pro",channel:"Direct",vendor:"",category:"usage",invoiceId:"",paymentId:"",dueDate:"",quantity:120,unitPrice:40,directCost:0,discountPct:0,billed:false,seatsPurchased:0,seatsUsed:0,renewalDate:"",description:"Billable usage not yet invoiced",source:"Synthetic demo finance data"});
  rows.push({id:"row-out-1",date:offsetDate(-7),kind:"payment_out",amount:18000,currency:"EUR",status:"settled",customer:"",product:"",channel:"",vendor:"Payroll",category:"cash",invoiceId:"",paymentId:"OUT-1",dueDate:"",quantity:1,unitPrice:0,directCost:0,discountPct:0,billed:true,seatsPurchased:0,seatsUsed:0,renewalDate:"",description:"Recorded cash outflow",source:"Synthetic demo finance data"});
  return {rows,confirmedCash:45000};
}

export const CSV_TEMPLATE = `date,kind,amount,currency,status,customer,product,channel,vendor,category,invoice_id,payment_id,due_date,quantity,unit_price,direct_cost,discount_pct,billed,seats_purchased,seats_used,renewal_date,description\n2026-09-01,invoice,12000,EUR,issued,Acme,Pro,Direct,,revenue,INV-1001,,2026-09-15,1,12000,5500,5,true,0,0,,September invoice\n2026-09-10,payment_in,12000,EUR,succeeded,Acme,,,,cash,INV-1001,PAY-1001,,1,0,0,0,true,0,0,,Payment received`;
