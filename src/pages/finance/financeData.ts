/* CAP-PLATFORM-01 — illustrative public catalogue. NEVER use as real funding intelligence. */
export type Theme = "Climate" | "Ocean" | "Plastic" | "Energy" | "Biodiversity" | "Social" | "Research" | "Culture";
export type Funder = { id:string; name:string; slug:string; region:string; themes:Theme[]; kind:string; summary:string };
export type Programme = { id:string; funderId:string; name:string; overview:string };
export type Call = { id:string; programmeId:string; title:string; year:number; region:string; themes:Theme[]; instrument:string; applicant:string; amount:number; currency:string; amountKind:"Typical award"|"Programme envelope"|"Indicative award"; deadline:string; confidence:"DEMO EXPECTED"|"DEMO CONFIRMED"; description:string };
export const THEMES: Theme[]=["Climate","Ocean","Plastic","Energy","Biodiversity","Social","Research","Culture"];
export const REGIONS=["Worldwide","Europe","Norway","Nordics","Africa","Asia","Americas"];
export const FUNDERS:Funder[]=[
{id:"f01",name:"Verdant Horizons Foundation",slug:"verdant-horizons",region:"Worldwide",themes:["Climate","Biodiversity"],kind:"Foundation",summary:"Illustrative philanthropic actor supporting restoration and climate research."},
{id:"f02",name:"Blue Current Initiative",slug:"blue-current",region:"Europe",themes:["Ocean","Plastic"],kind:"Non-profit fund",summary:"Illustrative ocean protection and circular coastal systems fund."},
{id:"f03",name:"Northern Energy Innovation Fund",slug:"northern-energy",region:"Nordics",themes:["Energy","Climate"],kind:"Innovation fund",summary:"Illustrative support for energy technologies and community transitions."},
{id:"f04",name:"Planet Commons Trust",slug:"planet-commons",region:"Worldwide",themes:["Biodiversity","Research"],kind:"Foundation",summary:"Illustrative funding for biodiversity monitoring and open data."},
{id:"f05",name:"New Society Catalyst",slug:"new-society",region:"Europe",themes:["Social","Climate"],kind:"Social innovation fund",summary:"Illustrative grants for early social entrepreneurs."},
{id:"f06",name:"Fjord Futures Programme",slug:"fjord-futures",region:"Norway",themes:["Ocean","Biodiversity"],kind:"Programme",summary:"Illustrative fund for fjord and catchment restoration."},
{id:"f07",name:"Circular Tomorrow Fund",slug:"circular-tomorrow",region:"Americas",themes:["Plastic","Energy"],kind:"Corporate foundation",summary:"Illustrative materials recovery and low-carbon infrastructure awards."},
{id:"f08",name:"Open Culture Exchange",slug:"open-culture",region:"Worldwide",themes:["Culture","Social"],kind:"Arts fund",summary:"Illustrative support for journalism, culture and civic dialogue."}
];
export const PROGRAMMES:Programme[] = [
{id:"p01",funderId:"f01",name:"Living Landscapes",overview:"Landscape-level ecological research and action."},
{id:"p02",funderId:"f01",name:"Community Climate Fellows",overview:"Founders working on practical climate transitions."},
{id:"p03",funderId:"f02",name:"Blue Coast",overview:"Coastal restoration demonstration funding."},
{id:"p04",funderId:"f02",name:"Plastic Systems Challenge",overview:"Plastic pollution and upstream prevention."},
{id:"p05",funderId:"f03",name:"Clean Energy Trials",overview:"Distributed clean-energy innovation."},
{id:"p06",funderId:"f04",name:"Nature Data Commons",overview:"Open science and biodiversity observation."},
{id:"p07",funderId:"f05",name:"Social Impact Seed",overview:"Early-stage social entrepreneurship."},
{id:"p08",funderId:"f06",name:"Fjord Recovery",overview:"Coastal ecosystems and watershed action."},
{id:"p09",funderId:"f07",name:"Circular Materials Prize",overview:"Prevention, recycling and reuse innovation."},
{id:"p10",funderId:"f08",name:"Culture for Change",overview:"Creative ecological communication and public culture."}
];
const seed:[string,string,number,string,Theme[],string,string,number,string,string,string][]=[
["p01","Living Landscapes 2026",2026,"Worldwide",["Climate","Biodiversity"],"Grant","NGO / Research",70000,"USD","2026-10-26","Typical award"],
["p02","Community Climate Fellows 2026",2026,"Europe",["Social","Climate"],"Fellowship","Individual",25000,"EUR","2026-11-12","Indicative award"],
["p03","Blue Coast 2026",2026,"Europe",["Ocean","Biodiversity"],"Grant","NGO",90000,"EUR","2026-11-28","Typical award"],
["p04","Plastic Systems Challenge 2026",2026,"Worldwide",["Plastic","Ocean"],"Prize","Founder / NGO",45000,"USD","2026-12-06","Indicative award"],
["p05","Clean Energy Trials 2026",2026,"Nordics",["Energy","Climate"],"Grant","Company / Research",300000,"NOK","2026-10-31","Indicative award"],
["p06","Nature Data Commons 2026",2026,"Worldwide",["Research","Biodiversity"],"Grant","NGO / Research",120000,"USD","2026-12-18","Typical award"],
["p07","Social Impact Seed 2026",2026,"Europe",["Social"],"Grant","Founder / NGO",20000,"EUR","2026-11-19","Typical award"],
["p08","Fjord Recovery 2026",2026,"Norway",["Ocean","Biodiversity"],"Grant","NGO / Public",250000,"NOK","2026-10-22","Typical award"],
["p09","Circular Materials Prize 2026",2026,"Americas",["Plastic","Energy"],"Prize","Company / Founder",50000,"USD","2026-12-16","Indicative award"],
["p10","Culture for Change 2026",2026,"Worldwide",["Culture","Social"],"Grant","Individual / NGO",15000,"USD","2026-11-02","Typical award"],
["p01","Living Landscapes 2027",2027,"Worldwide",["Climate","Biodiversity"],"Grant","NGO / Research",70000,"USD","2027-10-25","Typical award"],
["p02","Community Climate Fellows 2027",2027,"Europe",["Social","Climate"],"Fellowship","Individual",25000,"EUR","2027-04-12","Indicative award"],
["p03","Blue Coast 2027",2027,"Europe",["Ocean","Biodiversity"],"Grant","NGO",90000,"EUR","2027-03-28","Typical award"],
["p04","Plastic Systems Challenge 2027",2027,"Worldwide",["Plastic","Ocean"],"Prize","Founder / NGO",45000,"USD","2027-05-06","Indicative award"],
["p05","Clean Energy Trials 2027",2027,"Nordics",["Energy","Climate"],"Grant","Company / Research",300000,"NOK","2027-06-30","Indicative award"],
["p06","Nature Data Commons 2027",2027,"Worldwide",["Research","Biodiversity"],"Grant","NGO / Research",120000,"USD","2027-09-18","Typical award"],
["p07","Social Impact Seed 2027",2027,"Europe",["Social"],"Grant","Founder / NGO",20000,"EUR","2027-02-19","Typical award"],
["p08","Fjord Recovery 2027",2027,"Norway",["Ocean","Biodiversity"],"Grant","NGO / Public",250000,"NOK","2027-04-22","Typical award"],
["p09","Circular Materials Prize 2027",2027,"Americas",["Plastic","Energy"],"Prize","Company / Founder",50000,"USD","2027-07-16","Indicative award"],
["p10","Culture for Change 2027",2027,"Worldwide",["Culture","Social"],"Grant","Individual / NGO",15000,"USD","2027-08-02","Typical award"]
];
export const CALLS:Call[]=seed.map((entry,i)=>({id:"demo-call-"+String(i+1).padStart(3,"0"),programmeId:entry[0],title:entry[1],year:entry[2],region:entry[3],themes:entry[4],instrument:entry[5],applicant:entry[6],amount:entry[7],currency:entry[8],deadline:entry[9],amountKind:entry[10] as Call["amountKind"],confidence:"DEMO EXPECTED",description:"Illustrative funding round for user-experience testing. This is NOT a real grant, current deadline or confirmed funding opportunity."}));
export function programmeFor(call:Call){return PROGRAMMES.find(p=>p.id===call.programmeId)!}
export function funderFor(call:Call){return FUNDERS.find(f=>f.id===programmeFor(call).funderId)!}
export function amount(call:Call){return new Intl.NumberFormat("en-GB",{maximumFractionDigits:0}).format(call.amount)+" "+call.currency}
export function prettyDate(date:string){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z"))}
export const STATUS=["Saved","Qualified","Preparing","Quality review","Ready for release","Submitted","Awaiting decision","Awarded","Rejected","Closed"] as const;
export type Status=typeof STATUS[number];
export type Project={id:string;name:string;theme:Theme;description:string;region:string;fundingNeed:string};
export type PipelineItem={id:string;callId:string;projectId:string;status:Status;createdAt:string;updatedAt:string;notes:string;receipt:string};
export type Workspace={projects:Project[];pipeline:PipelineItem[]};
export type FinanceState={active:"4planet"|"personal";workspaces:Record<"4planet"|"personal",Workspace>};
export const STORAGE_KEY="4planet-finance-DEMO-v1";
export function emptyState():FinanceState{return {active:"4planet",workspaces:{ "4planet":{projects:[],pipeline:[]},"personal":{projects:[],pipeline:[]}} }}
export function readState():FinanceState {
 try {const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return emptyState();const parsed=JSON.parse(raw); if(parsed&&parsed.active&&parsed.workspaces?.["4planet"]?.pipeline&&parsed.workspaces?.personal?.pipeline)return parsed as FinanceState;}catch{/* invalid demo store */}
 return emptyState();
}
export function saveState(s:FinanceState){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
export function validTransition(next:Status,_receipt:string){return ["Saved","Qualified","Preparing","Quality review","Ready for release"].includes(next)}
