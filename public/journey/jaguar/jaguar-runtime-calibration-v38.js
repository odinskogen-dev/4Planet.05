(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!Array.isArray(d.min)||!Array.isArray(d.span))throw new Error('[JAGUAR V38] indexed surface metadata missing');
if(d.topology!=='CONTROLLED_DONOR_INDEX_BUFFER')throw new Error('[JAGUAR V38] refuses non-indexed / synthetic topology');
const sourceMin=d.min.slice();
const sourceSpan=d.span.slice();
if(sourceMin.length!==3||sourceSpan.length!==3||sourceSpan.some(v=>!Number.isFinite(v)||v<=0))throw new Error('[JAGUAR V38] invalid source bounds');
const sourceMaxSpan=Math.max(...sourceSpan);
if(!Number.isFinite(sourceMaxSpan)||sourceMaxSpan<=0)throw new Error('[JAGUAR V38] invalid source extent');

// Camera-space fit, not source-geometry mutation. The QPOS16 payload and donor index
// buffer remain immutable; only the decode bounds are remapped so every verified Ear
// derivative occupies a predictable, visible volume in the encounter room.
const targetLongestSpan=3.45;
const fitScale=targetLongestSpan/sourceMaxSpan;
const targetCentre=[0,1.58,0];
const calibratedSpan=sourceSpan.map(v=>v*fitScale);
const calibratedMin=calibratedSpan.map((v,i)=>targetCentre[i]-v/2);

d.min=calibratedMin;
d.span=calibratedSpan;
d.runtimeCalibration={
 version:'room-fit-v38',
 method:'DYNAMIC_BOUNDS_NORMALISATION',
 fitScale,
 targetLongestSpan,
 targetCentre,
 sourceMin,
 sourceSpan,
 calibratedMin:d.min.slice(),
 calibratedSpan:d.span.slice(),
 sourceTopology:d.topology,
 purpose:'FIT_RECOGNISABLE_INDEXED_EAR_JAGUAR_TO_ENCOUNTER_CAMERA_WITHOUT_MUTATING_SOURCE_TOPOLOGY_OR_PAYLOAD'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;
})();
