(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!Array.isArray(d.min)||!Array.isArray(d.span))throw new Error('[JAGUAR V38] indexed surface metadata missing');
if(d.topology!=='CONTROLLED_DONOR_INDEX_BUFFER')throw new Error('[JAGUAR V38] refuses non-indexed / synthetic topology');
const sourceMin=d.min.slice();
const sourceSpan=d.span.slice();
if(sourceMin.length!==3||sourceSpan.length!==3||sourceSpan.some(v=>!Number.isFinite(v)||v<=0))throw new Error('[JAGUAR V38] invalid source bounds');
const centre=sourceMin.map((v,i)=>v+sourceSpan[i]/2);
const magnification=18;
const targetCentre=[0,1.65,0];
d.min=sourceMin.map((v,i)=>(v-centre[i])*magnification+targetCentre[i]);
d.span=sourceSpan.map(v=>v*magnification);
d.runtimeCalibration={
 version:'room-fit-v38',
 magnification,
 targetCentre,
 sourceMin,
 sourceSpan,
 calibratedMin:d.min.slice(),
 calibratedSpan:d.span.slice(),
 purpose:'FIT_RECOGNISABLE_INDEXED_EAR_JAGUAR_TO_ENCOUNTER_CAMERA_WITHOUT_MUTATING_SOURCE_TOPOLOGY'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;
})();
