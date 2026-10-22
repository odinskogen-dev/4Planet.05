/* CUB Core 02 consumer proof in two isolated playable browser builds.
 * Does not monkeypatch existing game classes; diagnostic only. */
import {findRoute,makeTerrain,findTacticalPath,cityToSiegeContext,validateBattleContext,encodeSave,decodeSave} from '../src/index.js';
const gameId=document.documentElement.dataset.cubGame;
const configs={
  roma: {title:'ROMA · Cannae 216 BCE',roads:[{from:'canusium',to:'cannae',cost:1},{from:'canusium',to:'venusia',cost:2}],from:'venusia',to:'cannae',
    location:{id:'cannae',lon:16.15,lat:41.30},parties:[{armyId:'roman-I',factionId:'rome',soldiers:3000},{armyId:'punic-I',factionId:'carthage',soldiers:4200}]},
  medieval: {title:'MEDIEVAL · Hattin 1187',roads:[{from:'sepphoris',to:'hattin',cost:4},{from:'tiberias',to:'hattin',cost:2}],from:'sepphoris',to:'hattin',
    location:{id:'hattin',lon:35.448,lat:32.81},parties:[{armyId:'jerusalem-I',factionId:'jerusalem',soldiers:3000},{armyId:'ayyubid-I',factionId:'ayyubid',soldiers:4200}]}
};
const source=configs[gameId];if(!source)throw Error('Unknown CUB integration proof game');
function runProof(){
  const route=findRoute(source.roads,source.from,source.to);
  const terrain=makeTerrain({width:8,height:6,structures:[{id:'wall1',type:'wall',x:3,y:2,hp:100}]});
  const tactical=findTacticalPath(terrain,{x:1,y:2},{x:6,y:2});
  const settlement=cityToSiegeContext({settlementId:source.location.id,cityPlan:{version:1,structures:[{id:'wall1',type:'fort',x:3,y:2,completed:true}]}});
  const battle={schema:'cub.battle.context.v1',battleId:gameId+'-proof',location:source.location,participants:source.parties,settlement};
  const valid=validateBattleContext(battle);
  const state={route:route.path,battleId:battle.battleId};
  const saved=encodeSave({gameId,version:1,state});
  const restored=decodeSave(saved,{gameId,currentVersion:1});
  if(valid.length || route.cost<=0 || !tactical.path.length || restored.state.battleId!==battle.battleId)throw Error('Shared core diagnostic failed');
  return {gameId,route:route.path,travelCost:route.cost,cityObjects:settlement.structures.length,pathNodes:tactical.path.length,
    contextValid:true,saveRoundTrip:true,scope:'SANDBOX_DIAGNOSTIC_ONLY_NO_NATIVE_GAME_STATE_MODIFIED'};
}
const result=runProof();
window.__CUB_SHARED_PROOF=result;
const card=document.createElement('div');card.id='cub-core-diagnostic';
Object.assign(card.style,{position:'fixed',bottom:'10px',left:'10px',zIndex:'250',maxWidth:'280px',padding:'8px 12px',borderRadius:'9px',background:'#101919ee',color:'#f2efde',font:'12px/1.5 system-ui,sans-serif',boxShadow:'0 2px 20px #0008',pointerEvents:'auto'});
const summary=document.createElement('div');summary.textContent='CUB CORE 02 ✓ · '+source.title;
const details=document.createElement('div');details.id='cub-core-detail';details.style.display='none';details.textContent='Route: '+result.route.join(' → ')+' · Save: OK · BattleContext: OK · original tactical code preserved';
const btn=document.createElement('button');btn.textContent='INSPECT SHARED CORE';btn.style.cssText='margin-top:3px;background:#e9d8a7;color:#222;border:0;padding:5px 9px;border-radius:5px;cursor:pointer;font:600 10px system-ui';
btn.addEventListener('click',()=>details.style.display=details.style.display==='none'?'block':'none');
card.append(summary,btn,details);document.body.append(card);