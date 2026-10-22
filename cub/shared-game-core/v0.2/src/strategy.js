/** Strategy-domain calculations. Only the game integrating these decides political rules and balance. */
import { applyTransaction,priceToTransaction } from './ledger.js';
import { findRoute } from './navigation.js';
export function validateFaction(f){
 const errors=[];
 if(!f?.id||!f.name)errors.push('Faction needs stable id/name');
 if(!['sovereign','alliance','tribal_confederation','city_state'].includes(f?.form))errors.push('Invalid historic polity form');
 return errors;
}
export function planProvinceConstruction(world,{provinceId,buildingId,cost}){
 const province=world.provinces?.[provinceId],owner=province?.owner;
 if(!province||!world.factions?.[owner])return {ok:false,reason:'unknown province/owner'};
 const wallet=world.factions[owner].wallet;
 const result=applyTransaction(wallet,priceToTransaction(cost));if(!result.ok)return {ok:false,reason:result.reason};
 const state=structuredClone(world);state.factions[owner].wallet=result.wallet;
 state.provinces[provinceId].buildings[buildingId]=(state.provinces[provinceId].buildings[buildingId]??0)+1;
 return {ok:true,state};
}
export function marchArmy(world,{armyId,target,roads,weather='normal'}){
 const army=world.armies?.find(a=>a.id===armyId);if(!army||army.march)return {ok:false,reason:'army missing or busy'};
 const route=findRoute(roads,army.province,target,{blocked:world.blockedRoads||[]});if(!route)return {ok:false,reason:'no route'};
 const factor=weather==='winter'?1.5:weather==='storm'?1.3:1;
 const days=Math.max(1,Math.ceil(route.cost*factor));
 const supplyCost=Math.ceil(days*Math.max(1,army.soldiers)/500);
 if(army.supplies<supplyCost)return {ok:false,reason:'insufficient supplies',required:supplyCost};
 const next=structuredClone(world),unit=next.armies.find(a=>a.id===armyId);
 unit.supplies-=supplyCost;unit.march={from:unit.province,to:target,path:route.path,departTurn:next.turn,arriveTurn:next.turn+days,weather};
 return {ok:true,state:next,days,supplyCost,route:route.path};
}
export function advanceStrategyTurn(world){const next=structuredClone(world);next.turn=(next.turn??0)+1;
 for(const army of next.armies??[]){if(army.march && next.turn>=army.march.arriveTurn){army.province=army.march.to;army.march=null;}}
 return next;
}
export function transferResources(world,{from,to,resources,roads}){
 const origin=world.provinces?.[from],dest=world.provinces?.[to];if(!origin||!dest)return {ok:false,reason:'unknown province'};
 if(origin.owner!==dest.owner)return {ok:false,reason:'different owners'};
 const path=findRoute(roads,from,to,{blocked:world.blockedRoads||[]});if(!path)return {ok:false,reason:'route blocked'};
 const debit=applyTransaction(origin.stockpile,priceToTransaction(resources));if(!debit.ok)return {ok:false,reason:debit.reason};
 const credit=applyTransaction(dest.stockpile,resources);if(!credit.ok)return {ok:false,reason:credit.reason};
 const state=structuredClone(world);state.provinces[from].stockpile=debit.wallet;state.provinces[to].stockpile=credit.wallet;
 return {ok:true,state,route:path.path};
}