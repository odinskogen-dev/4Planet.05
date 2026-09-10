import { norm } from "./normalize.ts";

export type StoreFamily = {id:string; label:string; aliases:string[]; codePrefixes:string[]};

export const STORE_FAMILIES:StoreFamily[] = [
  {id:"KIWI",label:"KIWI",aliases:["kiwi"],codePrefixes:["KIWI"]},
  {id:"REMA_1000",label:"REMA 1000",aliases:["rema","rema 1000","rema1000"],codePrefixes:["REMA_1000"]},
  {id:"MENY_NO",label:"MENY",aliases:["meny"],codePrefixes:["MENY_NO"]},
  {id:"COOP",label:"COOP",aliases:["coop","extra","obs","mega","prix","marked"],codePrefixes:["COOP_"]},
  {id:"ODA_NO",label:"ODA",aliases:["oda","oda no"],codePrefixes:["ODA_NO"]},
  {id:"BUNNPRIS",label:"Bunnpris",aliases:["bunnpris"],codePrefixes:["BUNNPRIS"]},
];

export function resolveStoreFamily(value:unknown){
  const v=norm(value);
  if(!v)return null;
  return STORE_FAMILIES.find(f => f.aliases.some(a=>norm(a)===v) || norm(f.label)===v || norm(f.id)===v) || null;
}

export function storeCodeMatches(selected:unknown, code:unknown, name?:unknown){
  const family=resolveStoreFamily(selected);
  if(!family)return false;
  const c=String(code||"").toUpperCase();
  if(family.codePrefixes.some(p=>c===p||c.startsWith(p)))return true;
  const n=norm(name);
  return !!n && family.aliases.some(a=>n.includes(norm(a)));
}

export function priceObservationForStore(product:any, selected:unknown){
  const prices=Array.isArray(product?.embla_prices)?product.embla_prices:[];
  const match=prices.find((p:any)=>storeCodeMatches(selected,p?.code,p?.store));
  if(match)return match;
  if(storeCodeMatches(selected,product?.embla_store_code,product?.embla_store))return {store:product.embla_store,code:product.embla_store_code,price:product.embla_price,date:product.embla_price_date};
  return null;
}
