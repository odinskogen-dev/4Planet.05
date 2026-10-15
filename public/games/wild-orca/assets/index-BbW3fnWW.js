var jd=Object.defineProperty;var qd=(s,e,t)=>e in s?jd(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var Y=(s,e,t)=>qd(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const tl="170",Yd=0,Wl=1,Kd=2,Nu=1,$d=2,ni=3,li=0,Qt=1,Zt=2,Ui=0,Ls=1,Us=2,Xl=3,jl=4,Jd=5,Zi=100,Zd=101,Qd=102,ef=103,tf=104,nf=200,sf=201,rf=202,af=203,rc=204,ac=205,of=206,cf=207,lf=208,hf=209,uf=210,df=211,ff=212,pf=213,mf=214,oc=0,cc=1,lc=2,Fs=3,hc=4,uc=5,dc=6,fc=7,nl=0,gf=1,bf=2,Fi=0,vf=1,xf=2,_f=3,Uu=4,yf=5,Mf=6,Sf=7,ql="attached",wf="detached",Fu=300,Os=301,ks=302,pc=303,mc=304,ka=306,ts=1e3,Li=1001,Ia=1002,an=1003,Ou=1004,dr=1005,gn=1006,wa=1007,ai=1008,hi=1009,ku=1010,Bu=1011,Mr=1012,il=1013,ns=1014,Nn=1015,Cr=1016,sl=1017,rl=1018,Bs=1020,zu=35902,Gu=1021,Hu=1022,Sn=1023,Vu=1024,Wu=1025,Is=1026,zs=1027,al=1028,ol=1029,Xu=1030,cl=1031,ll=1033,Ea=33776,Ta=33777,Aa=33778,Ra=33779,gc=35840,bc=35841,vc=35842,xc=35843,_c=36196,yc=37492,Mc=37496,Sc=37808,wc=37809,Ec=37810,Tc=37811,Ac=37812,Rc=37813,Cc=37814,Pc=37815,Lc=37816,Ic=37817,Dc=37818,Nc=37819,Uc=37820,Fc=37821,Ca=36492,Oc=36494,kc=36495,ju=36283,Bc=36284,zc=36285,Gc=36286,Sr=2300,wr=2301,lo=2302,Yl=2400,Kl=2401,$l=2402,Ef=2500,Tf=0,qu=1,Hc=2,Af=3200,Rf=3201,hl=0,Cf=1,Pi="",zt="srgb",on="srgb-linear",Ba="linear",St="srgb",us=7680,Jl=519,Pf=512,Lf=513,If=514,Yu=515,Df=516,Nf=517,Uf=518,Ff=519,Vc=35044,ho=35048,Zl="300 es",oi=2e3,Da=2001;class js{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}}const $t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Ql=1234567;const mr=Math.PI/180,Gs=180/Math.PI;function wn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return($t[s&255]+$t[s>>8&255]+$t[s>>16&255]+$t[s>>24&255]+"-"+$t[e&255]+$t[e>>8&255]+"-"+$t[e>>16&15|64]+$t[e>>24&255]+"-"+$t[t&63|128]+$t[t>>8&255]+"-"+$t[t>>16&255]+$t[t>>24&255]+$t[n&255]+$t[n>>8&255]+$t[n>>16&255]+$t[n>>24&255]).toLowerCase()}function Gt(s,e,t){return Math.max(e,Math.min(t,s))}function ul(s,e){return(s%e+e)%e}function Of(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function kf(s,e,t){return s!==e?(t-s)/(e-s):0}function gr(s,e,t){return(1-t)*s+t*e}function Bf(s,e,t,n){return gr(s,e,1-Math.exp(-t*n))}function zf(s,e=1){return e-Math.abs(ul(s,e*2)-e)}function Gf(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Hf(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Vf(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Wf(s,e){return s+Math.random()*(e-s)}function Xf(s){return s*(.5-Math.random())}function jf(s){s!==void 0&&(Ql=s);let e=Ql+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function qf(s){return s*mr}function Yf(s){return s*Gs}function Kf(s){return(s&s-1)===0&&s!==0}function $f(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Jf(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Zf(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),b=a((n-e)/2);switch(i){case"XYX":s.set(o*h,c*u,c*d,o*l);break;case"YZY":s.set(c*d,o*h,c*u,o*l);break;case"ZXZ":s.set(c*u,c*d,o*h,o*l);break;case"XZX":s.set(o*h,c*b,c*f,o*l);break;case"YXY":s.set(c*f,o*h,c*b,o*l);break;case"ZYZ":s.set(c*b,c*f,o*h,o*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function In(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function xt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Ne={DEG2RAD:mr,RAD2DEG:Gs,generateUUID:wn,clamp:Gt,euclideanModulo:ul,mapLinear:Of,inverseLerp:kf,lerp:gr,damp:Bf,pingpong:zf,smoothstep:Gf,smootherstep:Hf,randInt:Vf,randFloat:Wf,randFloatSpread:Xf,seededRandom:jf,degToRad:qf,radToDeg:Yf,isPowerOfTwo:Kf,ceilPowerOfTwo:$f,floorPowerOfTwo:Jf,setQuaternionFromProperEuler:Zf,normalize:xt,denormalize:In};class fe{constructor(e=0,t=0){fe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Gt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class st{constructor(e,t,n,i,r,a,o,c,l){st.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l)}set(e,t,n,i,r,a,o,c,l){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],b=n[8],v=i[0],g=i[3],p=i[6],x=i[1],_=i[4],m=i[7],L=i[2],T=i[5],A=i[8];return r[0]=a*v+o*x+c*L,r[3]=a*g+o*_+c*T,r[6]=a*p+o*m+c*A,r[1]=l*v+h*x+u*L,r[4]=l*g+h*_+u*T,r[7]=l*p+h*m+u*A,r[2]=d*v+f*x+b*L,r[5]=d*g+f*_+b*T,r[8]=d*p+f*m+b*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+i*r*l-i*a*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=h*a-o*l,d=o*c-h*r,f=l*r-a*c,b=t*u+n*d+i*f;if(b===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/b;return e[0]=u*v,e[1]=(i*l-h*n)*v,e[2]=(o*n-i*a)*v,e[3]=d*v,e[4]=(h*t-i*c)*v,e[5]=(i*r-o*t)*v,e[6]=f*v,e[7]=(n*c-l*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-i*l,i*c,-i*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(uo.makeScale(e,t)),this}rotate(e){return this.premultiply(uo.makeRotation(-e)),this}translate(e,t){return this.premultiply(uo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const uo=new st;function Ku(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Er(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Qf(){const s=Er("canvas");return s.style.display="block",s}const eh={};function fr(s){s in eh||(eh[s]=!0,console.warn(s))}function ep(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function tp(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function np(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const ct={enabled:!0,workingColorSpace:on,spaces:{},convert:function(s,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===St&&(s.r=ci(s.r),s.g=ci(s.g),s.b=ci(s.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(s.applyMatrix3(this.spaces[e].toXYZ),s.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===St&&(s.r=Ds(s.r),s.g=Ds(s.g),s.b=Ds(s.b))),s},fromWorkingColorSpace:function(s,e){return this.convert(s,this.workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Pi?Ba:this.spaces[s].transfer},getLuminanceCoefficients:function(s,e=this.workingColorSpace){return s.fromArray(this.spaces[e].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,e,t){return s.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function ci(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Ds(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const th=[.64,.33,.3,.6,.15,.06],nh=[.2126,.7152,.0722],ih=[.3127,.329],sh=new st().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),rh=new st().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ct.define({[on]:{primaries:th,whitePoint:ih,transfer:Ba,toXYZ:sh,fromXYZ:rh,luminanceCoefficients:nh,workingColorSpaceConfig:{unpackColorSpace:zt},outputColorSpaceConfig:{drawingBufferColorSpace:zt}},[zt]:{primaries:th,whitePoint:ih,transfer:St,toXYZ:sh,fromXYZ:rh,luminanceCoefficients:nh,outputColorSpaceConfig:{drawingBufferColorSpace:zt}}});let ds;class ip{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ds===void 0&&(ds=Er("canvas")),ds.width=e.width,ds.height=e.height;const n=ds.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=ds}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Er("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=ci(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ci(t[n]/255)*255):t[n]=ci(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let sp=0;class $u{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:sp++}),this.uuid=wn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(fo(i[a].image)):r.push(fo(i[a]))}else r=fo(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function fo(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?ip.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let rp=0;class jt extends js{constructor(e=jt.DEFAULT_IMAGE,t=jt.DEFAULT_MAPPING,n=Li,i=Li,r=gn,a=ai,o=Sn,c=hi,l=jt.DEFAULT_ANISOTROPY,h=Pi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rp++}),this.uuid=wn(),this.name="",this.source=new $u(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new fe(0,0),this.repeat=new fe(1,1),this.center=new fe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new st,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Fu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ts:e.x=e.x-Math.floor(e.x);break;case Li:e.x=e.x<0?0:1;break;case Ia:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ts:e.y=e.y-Math.floor(e.y);break;case Li:e.y=e.y<0?0:1;break;case Ia:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}jt.DEFAULT_IMAGE=null;jt.DEFAULT_MAPPING=Fu;jt.DEFAULT_ANISOTROPY=1;class mt{constructor(e=0,t=0,n=0,i=1){mt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],b=c[9],v=c[2],g=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(b-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(b+g)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(l+1)/2,m=(f+1)/2,L=(p+1)/2,T=(h+d)/4,A=(u+v)/4,D=(b+g)/4;return _>m&&_>L?_<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(_),i=T/n,r=A/n):m>L?m<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(m),n=T/i,r=D/i):L<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(L),n=A/r,i=D/r),this.set(n,i,r,t),this}let x=Math.sqrt((g-b)*(g-b)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(g-b)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ap extends js{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new jt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new $u(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class is extends ap{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Ju extends jt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=an,this.minFilter=an,this.wrapR=Li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class op extends jt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=an,this.minFilter=an,this.wrapR=Li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Fn{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let c=n[i+0],l=n[i+1],h=n[i+2],u=n[i+3];const d=r[a+0],f=r[a+1],b=r[a+2],v=r[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=b,e[t+3]=v;return}if(u!==v||c!==d||l!==f||h!==b){let g=1-o;const p=c*d+l*f+h*b+u*v,x=p>=0?1:-1,_=1-p*p;if(_>Number.EPSILON){const L=Math.sqrt(_),T=Math.atan2(L,p*x);g=Math.sin(g*T)/L,o=Math.sin(o*T)/L}const m=o*x;if(c=c*g+d*m,l=l*g+f*m,h=h*g+b*m,u=u*g+v*m,g===1-o){const L=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=L,l*=L,h*=L,u*=L}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],c=n[i+1],l=n[i+2],h=n[i+3],u=r[a],d=r[a+1],f=r[a+2],b=r[a+3];return e[t]=o*b+h*u+c*f-l*d,e[t+1]=c*b+h*d+l*u-o*f,e[t+2]=l*b+h*f+o*d-c*u,e[t+3]=h*b-o*u-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(i/2),u=o(r/2),d=c(n/2),f=c(i/2),b=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*f*b,this._y=l*f*u-d*h*b,this._z=l*h*b+d*f*u,this._w=l*h*u-d*f*b;break;case"YXZ":this._x=d*h*u+l*f*b,this._y=l*f*u-d*h*b,this._z=l*h*b-d*f*u,this._w=l*h*u+d*f*b;break;case"ZXY":this._x=d*h*u-l*f*b,this._y=l*f*u+d*h*b,this._z=l*h*b+d*f*u,this._w=l*h*u-d*f*b;break;case"ZYX":this._x=d*h*u-l*f*b,this._y=l*f*u+d*h*b,this._z=l*h*b-d*f*u,this._w=l*h*u+d*f*b;break;case"YZX":this._x=d*h*u+l*f*b,this._y=l*f*u+d*h*b,this._z=l*h*b-d*f*u,this._w=l*h*u-d*f*b;break;case"XZY":this._x=d*h*u-l*f*b,this._y=l*f*u-d*h*b,this._z=l*h*b+d*f*u,this._w=l*h*u+d*f*b;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(a-i)*f}else if(n>o&&n>u){const f=2*Math.sqrt(1+n-o-u);this._w=(h-c)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(r+l)/f}else if(o>u){const f=2*Math.sqrt(1+o-n-u);this._w=(r-l)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(c+h)/f}else{const f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Gt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+i*l-r*c,this._y=i*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-i*o,this._w=a*h-n*o-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const c=1-o*o;if(c<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,o),u=Math.sin((1-t)*h)/l,d=Math.sin(t*h)/l;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(e=0,t=0,n=0){C.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ah.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ah.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*i-o*n),h=2*(o*t-r*i),u=2*(r*n-a*t);return this.x=t+c*l+a*u-o*h,this.y=n+c*h+o*l-r*u,this.z=i+c*u+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-r*o,this.y=r*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return po.copy(this).projectOnVector(e),this.sub(po)}reflect(e){return this.sub(po.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Gt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const po=new C,ah=new Fn;class Hn{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(An.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(An.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=An.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,An):An.fromBufferAttribute(r,a),An.applyMatrix4(e.matrixWorld),this.expandByPoint(An);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),jr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),jr.copy(n.boundingBox)),jr.applyMatrix4(e.matrixWorld),this.union(jr)}const i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,An),An.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(tr),qr.subVectors(this.max,tr),fs.subVectors(e.a,tr),ps.subVectors(e.b,tr),ms.subVectors(e.c,tr),yi.subVectors(ps,fs),Mi.subVectors(ms,ps),zi.subVectors(fs,ms);let t=[0,-yi.z,yi.y,0,-Mi.z,Mi.y,0,-zi.z,zi.y,yi.z,0,-yi.x,Mi.z,0,-Mi.x,zi.z,0,-zi.x,-yi.y,yi.x,0,-Mi.y,Mi.x,0,-zi.y,zi.x,0];return!mo(t,fs,ps,ms,qr)||(t=[1,0,0,0,1,0,0,0,1],!mo(t,fs,ps,ms,qr))?!1:(Yr.crossVectors(yi,Mi),t=[Yr.x,Yr.y,Yr.z],mo(t,fs,ps,ms,qr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,An).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(An).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Kn=[new C,new C,new C,new C,new C,new C,new C,new C],An=new C,jr=new Hn,fs=new C,ps=new C,ms=new C,yi=new C,Mi=new C,zi=new C,tr=new C,qr=new C,Yr=new C,Gi=new C;function mo(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){Gi.fromArray(s,r);const o=i.x*Math.abs(Gi.x)+i.y*Math.abs(Gi.y)+i.z*Math.abs(Gi.z),c=e.dot(Gi),l=t.dot(Gi),h=n.dot(Gi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const cp=new Hn,nr=new C,go=new C;class Vn{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):cp.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;nr.subVectors(e,this.center);const t=nr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(nr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(go.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(nr.copy(e.center).add(go)),this.expandByPoint(nr.copy(e.center).sub(go))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const $n=new C,bo=new C,Kr=new C,Si=new C,vo=new C,$r=new C,xo=new C;class Pr{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,$n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=$n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):($n.copy(this.origin).addScaledVector(this.direction,t),$n.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){bo.copy(e).add(t).multiplyScalar(.5),Kr.copy(t).sub(e).normalize(),Si.copy(this.origin).sub(bo);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Kr),o=Si.dot(this.direction),c=-Si.dot(Kr),l=Si.lengthSq(),h=Math.abs(1-a*a);let u,d,f,b;if(h>0)if(u=a*c-o,d=a*o-c,b=r*h,u>=0)if(d>=-b)if(d<=b){const v=1/h;u*=v,d*=v,f=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d<=-b?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=b?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(bo).addScaledVector(Kr,d),f}intersectSphere(e,t){$n.subVectors(e.center,this.origin);const n=$n.dot(this.direction),i=$n.dot($n)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,$n)!==null}intersectTriangle(e,t,n,i,r){vo.subVectors(t,e),$r.subVectors(n,e),xo.crossVectors(vo,$r);let a=this.direction.dot(xo),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Si.subVectors(this.origin,e);const c=o*this.direction.dot($r.crossVectors(Si,$r));if(c<0)return null;const l=o*this.direction.dot(vo.cross(Si));if(l<0||c+l>a)return null;const h=-o*Si.dot(xo);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Je{constructor(e,t,n,i,r,a,o,c,l,h,u,d,f,b,v,g){Je.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l,h,u,d,f,b,v,g)}set(e,t,n,i,r,a,o,c,l,h,u,d,f,b,v,g){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=b,p[11]=v,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Je().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/gs.setFromMatrixColumn(e,0).length(),r=1/gs.setFromMatrixColumn(e,1).length(),a=1/gs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=a*h,f=a*u,b=o*h,v=o*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=f+b*l,t[5]=d-v*l,t[9]=-o*c,t[2]=v-d*l,t[6]=b+f*l,t[10]=a*c}else if(e.order==="YXZ"){const d=c*h,f=c*u,b=l*h,v=l*u;t[0]=d+v*o,t[4]=b*o-f,t[8]=a*l,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-b,t[6]=v+d*o,t[10]=a*c}else if(e.order==="ZXY"){const d=c*h,f=c*u,b=l*h,v=l*u;t[0]=d-v*o,t[4]=-a*u,t[8]=b+f*o,t[1]=f+b*o,t[5]=a*h,t[9]=v-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const d=a*h,f=a*u,b=o*h,v=o*u;t[0]=c*h,t[4]=b*l-f,t[8]=d*l+v,t[1]=c*u,t[5]=v*l+d,t[9]=f*l-b,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const d=a*c,f=a*l,b=o*c,v=o*l;t[0]=c*h,t[4]=v-d*u,t[8]=b*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=f*u+b,t[10]=d-v*u}else if(e.order==="XZY"){const d=a*c,f=a*l,b=o*c,v=o*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+v,t[5]=a*h,t[9]=f*u-b,t[2]=b*u-f,t[6]=o*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(lp,e,hp)}lookAt(e,t,n){const i=this.elements;return pn.subVectors(e,t),pn.lengthSq()===0&&(pn.z=1),pn.normalize(),wi.crossVectors(n,pn),wi.lengthSq()===0&&(Math.abs(n.z)===1?pn.x+=1e-4:pn.z+=1e-4,pn.normalize(),wi.crossVectors(n,pn)),wi.normalize(),Jr.crossVectors(pn,wi),i[0]=wi.x,i[4]=Jr.x,i[8]=pn.x,i[1]=wi.y,i[5]=Jr.y,i[9]=pn.y,i[2]=wi.z,i[6]=Jr.z,i[10]=pn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],b=n[2],v=n[6],g=n[10],p=n[14],x=n[3],_=n[7],m=n[11],L=n[15],T=i[0],A=i[4],D=i[8],S=i[12],y=i[1],P=i[5],U=i[9],k=i[13],V=i[2],$=i[6],H=i[10],Z=i[14],W=i[3],he=i[7],ie=i[11],ue=i[15];return r[0]=a*T+o*y+c*V+l*W,r[4]=a*A+o*P+c*$+l*he,r[8]=a*D+o*U+c*H+l*ie,r[12]=a*S+o*k+c*Z+l*ue,r[1]=h*T+u*y+d*V+f*W,r[5]=h*A+u*P+d*$+f*he,r[9]=h*D+u*U+d*H+f*ie,r[13]=h*S+u*k+d*Z+f*ue,r[2]=b*T+v*y+g*V+p*W,r[6]=b*A+v*P+g*$+p*he,r[10]=b*D+v*U+g*H+p*ie,r[14]=b*S+v*k+g*Z+p*ue,r[3]=x*T+_*y+m*V+L*W,r[7]=x*A+_*P+m*$+L*he,r[11]=x*D+_*U+m*H+L*ie,r[15]=x*S+_*k+m*Z+L*ue,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],f=e[14],b=e[3],v=e[7],g=e[11],p=e[15];return b*(+r*c*u-i*l*u-r*o*d+n*l*d+i*o*f-n*c*f)+v*(+t*c*f-t*l*d+r*a*d-i*a*f+i*l*h-r*c*h)+g*(+t*l*u-t*o*f-r*a*u+n*a*f+r*o*h-n*l*h)+p*(-i*o*h-t*c*u+t*o*d+i*a*u-n*a*d+n*c*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],f=e[11],b=e[12],v=e[13],g=e[14],p=e[15],x=u*g*l-v*d*l+v*c*f-o*g*f-u*c*p+o*d*p,_=b*d*l-h*g*l-b*c*f+a*g*f+h*c*p-a*d*p,m=h*v*l-b*u*l+b*o*f-a*v*f-h*o*p+a*u*p,L=b*u*c-h*v*c-b*o*d+a*v*d+h*o*g-a*u*g,T=t*x+n*_+i*m+r*L;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/T;return e[0]=x*A,e[1]=(v*d*r-u*g*r-v*i*f+n*g*f+u*i*p-n*d*p)*A,e[2]=(o*g*r-v*c*r+v*i*l-n*g*l-o*i*p+n*c*p)*A,e[3]=(u*c*r-o*d*r-u*i*l+n*d*l+o*i*f-n*c*f)*A,e[4]=_*A,e[5]=(h*g*r-b*d*r+b*i*f-t*g*f-h*i*p+t*d*p)*A,e[6]=(b*c*r-a*g*r-b*i*l+t*g*l+a*i*p-t*c*p)*A,e[7]=(a*d*r-h*c*r+h*i*l-t*d*l-a*i*f+t*c*f)*A,e[8]=m*A,e[9]=(b*u*r-h*v*r-b*n*f+t*v*f+h*n*p-t*u*p)*A,e[10]=(a*v*r-b*o*r+b*n*l-t*v*l-a*n*p+t*o*p)*A,e[11]=(h*o*r-a*u*r-h*n*l+t*u*l+a*n*f-t*o*f)*A,e[12]=L*A,e[13]=(h*v*i-b*u*i+b*n*d-t*v*d-h*n*g+t*u*g)*A,e[14]=(b*o*i-a*v*i-b*n*c+t*v*c+a*n*g-t*o*g)*A,e[15]=(a*u*i-h*o*i+h*n*c-t*u*c-a*n*d+t*o*d)*A,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-i*c,l*c+i*o,0,l*o+i*c,h*o+n,h*c-i*a,0,l*c-i*o,h*c+i*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,u=o+o,d=r*l,f=r*h,b=r*u,v=a*h,g=a*u,p=o*u,x=c*l,_=c*h,m=c*u,L=n.x,T=n.y,A=n.z;return i[0]=(1-(v+p))*L,i[1]=(f+m)*L,i[2]=(b-_)*L,i[3]=0,i[4]=(f-m)*T,i[5]=(1-(d+p))*T,i[6]=(g+x)*T,i[7]=0,i[8]=(b+_)*A,i[9]=(g-x)*A,i[10]=(1-(d+v))*A,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=gs.set(i[0],i[1],i[2]).length();const a=gs.set(i[4],i[5],i[6]).length(),o=gs.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],Rn.copy(this);const l=1/r,h=1/a,u=1/o;return Rn.elements[0]*=l,Rn.elements[1]*=l,Rn.elements[2]*=l,Rn.elements[4]*=h,Rn.elements[5]*=h,Rn.elements[6]*=h,Rn.elements[8]*=u,Rn.elements[9]*=u,Rn.elements[10]*=u,t.setFromRotationMatrix(Rn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,i,r,a,o=oi){const c=this.elements,l=2*r/(t-e),h=2*r/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i);let f,b;if(o===oi)f=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===Da)f=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=oi){const c=this.elements,l=1/(t-e),h=1/(n-i),u=1/(a-r),d=(t+e)*l,f=(n+i)*h;let b,v;if(o===oi)b=(a+r)*u,v=-2*u;else if(o===Da)b=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=v,c[14]=-b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const gs=new C,Rn=new Je,lp=new C(0,0,0),hp=new C(1,1,1),wi=new C,Jr=new C,pn=new C,oh=new Je,ch=new Fn;class bn{constructor(e=0,t=0,n=0,i=bn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],c=i[1],l=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Gt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Gt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Gt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Gt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Gt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Gt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return oh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(oh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ch.setFromEuler(this),this.setFromQuaternion(ch,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}bn.DEFAULT_ORDER="XYZ";class dl{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let up=0;const lh=new C,bs=new Fn,Jn=new Je,Zr=new C,ir=new C,dp=new C,fp=new Fn,hh=new C(1,0,0),uh=new C(0,1,0),dh=new C(0,0,1),fh={type:"added"},pp={type:"removed"},vs={type:"childadded",child:null},_o={type:"childremoved",child:null};class Et extends js{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:up++}),this.uuid=wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Et.DEFAULT_UP.clone();const e=new C,t=new bn,n=new Fn,i=new C(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Je},normalMatrix:{value:new st}}),this.matrix=new Je,this.matrixWorld=new Je,this.matrixAutoUpdate=Et.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new dl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return bs.setFromAxisAngle(e,t),this.quaternion.multiply(bs),this}rotateOnWorldAxis(e,t){return bs.setFromAxisAngle(e,t),this.quaternion.premultiply(bs),this}rotateX(e){return this.rotateOnAxis(hh,e)}rotateY(e){return this.rotateOnAxis(uh,e)}rotateZ(e){return this.rotateOnAxis(dh,e)}translateOnAxis(e,t){return lh.copy(e).applyQuaternion(this.quaternion),this.position.add(lh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(hh,e)}translateY(e){return this.translateOnAxis(uh,e)}translateZ(e){return this.translateOnAxis(dh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zr.copy(e):Zr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ir.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(ir,Zr,this.up):Jn.lookAt(Zr,ir,this.up),this.quaternion.setFromRotationMatrix(Jn),i&&(Jn.extractRotation(i.matrixWorld),bs.setFromRotationMatrix(Jn),this.quaternion.premultiply(bs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(fh),vs.child=e,this.dispatchEvent(vs),vs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(pp),_o.child=e,this.dispatchEvent(_o),_o.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(fh),vs.child=e,this.dispatchEvent(vs),vs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ir,e,dp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ir,fp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];i.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),b=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),b.length>0&&(n.nodes=b)}return n.object=i,n;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Et.DEFAULT_UP=new C(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Cn=new C,Zn=new C,yo=new C,Qn=new C,xs=new C,_s=new C,ph=new C,Mo=new C,So=new C,wo=new C,Eo=new mt,To=new mt,Ao=new mt;class Dn{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Cn.subVectors(e,t),i.cross(Cn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Cn.subVectors(i,t),Zn.subVectors(n,t),yo.subVectors(e,t);const a=Cn.dot(Cn),o=Cn.dot(Zn),c=Cn.dot(yo),l=Zn.dot(Zn),h=Zn.dot(yo),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(l*c-o*h)*d,b=(a*h-o*c)*d;return r.set(1-f-b,b,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(e,t,n,i,r,a,o,c){return this.getBarycoord(e,t,n,i,Qn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Qn.x),c.addScaledVector(a,Qn.y),c.addScaledVector(o,Qn.z),c)}static getInterpolatedAttribute(e,t,n,i,r,a){return Eo.setScalar(0),To.setScalar(0),Ao.setScalar(0),Eo.fromBufferAttribute(e,t),To.fromBufferAttribute(e,n),Ao.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Eo,r.x),a.addScaledVector(To,r.y),a.addScaledVector(Ao,r.z),a}static isFrontFacing(e,t,n,i){return Cn.subVectors(n,t),Zn.subVectors(e,t),Cn.cross(Zn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Cn.subVectors(this.c,this.b),Zn.subVectors(this.a,this.b),Cn.cross(Zn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Dn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Dn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return Dn.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return Dn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Dn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;xs.subVectors(i,n),_s.subVectors(r,n),Mo.subVectors(e,n);const c=xs.dot(Mo),l=_s.dot(Mo);if(c<=0&&l<=0)return t.copy(n);So.subVectors(e,i);const h=xs.dot(So),u=_s.dot(So);if(h>=0&&u<=h)return t.copy(i);const d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(n).addScaledVector(xs,a);wo.subVectors(e,r);const f=xs.dot(wo),b=_s.dot(wo);if(b>=0&&f<=b)return t.copy(r);const v=f*l-c*b;if(v<=0&&l>=0&&b<=0)return o=l/(l-b),t.copy(n).addScaledVector(_s,o);const g=h*b-f*u;if(g<=0&&u-h>=0&&f-b>=0)return ph.subVectors(r,i),o=(u-h)/(u-h+(f-b)),t.copy(i).addScaledVector(ph,o);const p=1/(g+v+d);return a=v*p,o=d*p,t.copy(n).addScaledVector(xs,a).addScaledVector(_s,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Zu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},Qr={h:0,s:0,l:0};function Ro(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Le{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=ct.workingColorSpace){if(e=ul(e,1),t=Gt(t,0,1),n=Gt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Ro(a,r,e+1/3),this.g=Ro(a,r,e),this.b=Ro(a,r,e-1/3)}return ct.toWorkingColorSpace(this,i),this}setStyle(e,t=zt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zt){const n=Zu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ci(e.r),this.g=ci(e.g),this.b=ci(e.b),this}copyLinearToSRGB(e){return this.r=Ds(e.r),this.g=Ds(e.g),this.b=Ds(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zt){return ct.fromWorkingColorSpace(Jt.copy(this),e),Math.round(Gt(Jt.r*255,0,255))*65536+Math.round(Gt(Jt.g*255,0,255))*256+Math.round(Gt(Jt.b*255,0,255))}getHexString(e=zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.fromWorkingColorSpace(Jt.copy(this),t);const n=Jt.r,i=Jt.g,r=Jt.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case n:c=(i-r)/u+(i<r?6:0);break;case i:c=(r-n)/u+2;break;case r:c=(n-i)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=ct.workingColorSpace){return ct.fromWorkingColorSpace(Jt.copy(this),t),e.r=Jt.r,e.g=Jt.g,e.b=Jt.b,e}getStyle(e=zt){ct.fromWorkingColorSpace(Jt.copy(this),e);const t=Jt.r,n=Jt.g,i=Jt.b;return e!==zt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Ei),this.setHSL(Ei.h+e,Ei.s+t,Ei.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ei),e.getHSL(Qr);const n=gr(Ei.h,Qr.h,t),i=gr(Ei.s,Qr.s,t),r=gr(Ei.l,Qr.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Jt=new Le;Le.NAMES=Zu;let mp=0;class Un extends js{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mp++}),this.uuid=wn(),this.name="",this.blending=Ls,this.side=li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rc,this.blendDst=ac,this.blendEquation=Zi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Le(0,0,0),this.blendAlpha=0,this.depthFunc=Fs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Jl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=us,this.stencilZFail=us,this.stencilZPass=us,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ls&&(n.blending=this.blending),this.side!==li&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==rc&&(n.blendSrc=this.blendSrc),this.blendDst!==ac&&(n.blendDst=this.blendDst),this.blendEquation!==Zi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Fs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Jl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==us&&(n.stencilFail=this.stencilFail),this.stencilZFail!==us&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==us&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Ii extends Un{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=nl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Dt=new C,ea=new fe;class gt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Vc,this.updateRanges=[],this.gpuType=Nn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ea.fromBufferAttribute(this,t),ea.applyMatrix3(e),this.setXY(t,ea.x,ea.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyMatrix3(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyMatrix4(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyNormalMatrix(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.transformDirection(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=In(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=xt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=In(t,this.array)),t}setX(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=In(t,this.array)),t}setY(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=In(t,this.array)),t}setZ(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=In(t,this.array)),t}setW(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),i=xt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),i=xt(i,this.array),r=xt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Vc&&(e.usage=this.usage),e}}class Qu extends gt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class ed extends gt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class yt extends gt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let gp=0;const _n=new Je,Co=new Et,ys=new C,mn=new Hn,sr=new Hn,Wt=new C;class Lt extends js{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gp++}),this.uuid=wn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ku(e)?ed:Qu)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new st().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return _n.makeRotationFromQuaternion(e),this.applyMatrix4(_n),this}rotateX(e){return _n.makeRotationX(e),this.applyMatrix4(_n),this}rotateY(e){return _n.makeRotationY(e),this.applyMatrix4(_n),this}rotateZ(e){return _n.makeRotationZ(e),this.applyMatrix4(_n),this}translate(e,t,n){return _n.makeTranslation(e,t,n),this.applyMatrix4(_n),this}scale(e,t,n){return _n.makeScale(e,t,n),this.applyMatrix4(_n),this}lookAt(e){return Co.lookAt(e),Co.updateMatrix(),this.applyMatrix4(Co.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ys).negate(),this.translate(ys.x,ys.y,ys.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new yt(n,3))}else{for(let n=0,i=t.count;n<i;n++){const r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Hn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Wt.addVectors(this.boundingBox.min,mn.min),this.boundingBox.expandByPoint(Wt),Wt.addVectors(this.boundingBox.max,mn.max),this.boundingBox.expandByPoint(Wt)):(this.boundingBox.expandByPoint(mn.min),this.boundingBox.expandByPoint(mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){const n=this.boundingSphere.center;if(mn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];sr.setFromBufferAttribute(o),this.morphTargetsRelative?(Wt.addVectors(mn.min,sr.min),mn.expandByPoint(Wt),Wt.addVectors(mn.max,sr.max),mn.expandByPoint(Wt)):(mn.expandByPoint(sr.min),mn.expandByPoint(sr.max))}mn.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)Wt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Wt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)Wt.fromBufferAttribute(o,l),c&&(ys.fromBufferAttribute(e,l),Wt.add(ys)),i=Math.max(i,n.distanceToSquared(Wt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new gt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let D=0;D<n.count;D++)o[D]=new C,c[D]=new C;const l=new C,h=new C,u=new C,d=new fe,f=new fe,b=new fe,v=new C,g=new C;function p(D,S,y){l.fromBufferAttribute(n,D),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,y),d.fromBufferAttribute(r,D),f.fromBufferAttribute(r,S),b.fromBufferAttribute(r,y),h.sub(l),u.sub(l),f.sub(d),b.sub(d);const P=1/(f.x*b.y-b.x*f.y);isFinite(P)&&(v.copy(h).multiplyScalar(b.y).addScaledVector(u,-f.y).multiplyScalar(P),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-b.x).multiplyScalar(P),o[D].add(v),o[S].add(v),o[y].add(v),c[D].add(g),c[S].add(g),c[y].add(g))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let D=0,S=x.length;D<S;++D){const y=x[D],P=y.start,U=y.count;for(let k=P,V=P+U;k<V;k+=3)p(e.getX(k+0),e.getX(k+1),e.getX(k+2))}const _=new C,m=new C,L=new C,T=new C;function A(D){L.fromBufferAttribute(i,D),T.copy(L);const S=o[D];_.copy(S),_.sub(L.multiplyScalar(L.dot(S))).normalize(),m.crossVectors(T,S);const P=m.dot(c[D])<0?-1:1;a.setXYZW(D,_.x,_.y,_.z,P)}for(let D=0,S=x.length;D<S;++D){const y=x[D],P=y.start,U=y.count;for(let k=P,V=P+U;k<V;k+=3)A(e.getX(k+0)),A(e.getX(k+1)),A(e.getX(k+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new gt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new C,r=new C,a=new C,o=new C,c=new C,l=new C,h=new C,u=new C;if(e)for(let d=0,f=e.count;d<f;d+=3){const b=e.getX(d+0),v=e.getX(d+1),g=e.getX(d+2);i.fromBufferAttribute(t,b),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,g),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,b),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,g),o.add(h),c.add(h),l.add(h),n.setXYZ(b,o.x,o.y,o.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Wt.fromBufferAttribute(e,t),Wt.normalize(),e.setXYZ(t,Wt.x,Wt.y,Wt.z)}toNonIndexed(){function e(o,c){const l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h);let f=0,b=0;for(let v=0,g=c.length;v<g;v++){o.isInterleavedBufferAttribute?f=c[v]*o.data.stride+o.offset:f=c[v]*h;for(let p=0;p<h;p++)d[b++]=l[f++]}return new gt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Lt,n=this.index.array,i=this.attributes;for(const o in i){const c=i[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){const d=l[h],f=e(d,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){const f=l[u];h.push(f.toJSON(e.data))}h.length>0&&(i[c]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const l in i){const h=i[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,h=a.length;l<h;l++){const u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const mh=new Je,Hi=new Pr,ta=new Vn,gh=new C,na=new C,ia=new C,sa=new C,Po=new C,ra=new C,bh=new C,aa=new C;class ut extends Et{constructor(e=new Lt,t=new Ii){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(r&&o){ra.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=o[c],u=r[c];h!==0&&(Po.fromBufferAttribute(u,e),a?ra.addScaledVector(Po,h):ra.addScaledVector(Po.sub(t),h))}t.add(ra)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ta.copy(n.boundingSphere),ta.applyMatrix4(r),Hi.copy(e.ray).recast(e.near),!(ta.containsPoint(Hi.origin)===!1&&(Hi.intersectSphere(ta,gh)===null||Hi.origin.distanceToSquared(gh)>(e.far-e.near)**2))&&(mh.copy(r).invert(),Hi.copy(e.ray).applyMatrix4(mh),!(n.boundingBox!==null&&Hi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Hi)))}_computeIntersections(e,t,n){let i;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let b=0,v=d.length;b<v;b++){const g=d[b],p=a[g.materialIndex],x=Math.max(g.start,f.start),_=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let m=x,L=_;m<L;m+=3){const T=o.getX(m),A=o.getX(m+1),D=o.getX(m+2);i=oa(this,p,e,n,l,h,u,T,A,D),i&&(i.faceIndex=Math.floor(m/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const b=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let g=b,p=v;g<p;g+=3){const x=o.getX(g),_=o.getX(g+1),m=o.getX(g+2);i=oa(this,a,e,n,l,h,u,x,_,m),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(a))for(let b=0,v=d.length;b<v;b++){const g=d[b],p=a[g.materialIndex],x=Math.max(g.start,f.start),_=Math.min(c.count,Math.min(g.start+g.count,f.start+f.count));for(let m=x,L=_;m<L;m+=3){const T=m,A=m+1,D=m+2;i=oa(this,p,e,n,l,h,u,T,A,D),i&&(i.faceIndex=Math.floor(m/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const b=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let g=b,p=v;g<p;g+=3){const x=g,_=g+1,m=g+2;i=oa(this,a,e,n,l,h,u,x,_,m),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function bp(s,e,t,n,i,r,a,o){let c;if(e.side===Qt?c=n.intersectTriangle(a,r,i,!0,o):c=n.intersectTriangle(i,r,a,e.side===li,o),c===null)return null;aa.copy(o),aa.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(aa);return l<t.near||l>t.far?null:{distance:l,point:aa.clone(),object:s}}function oa(s,e,t,n,i,r,a,o,c,l){s.getVertexPosition(o,na),s.getVertexPosition(c,ia),s.getVertexPosition(l,sa);const h=bp(s,e,t,n,na,ia,sa,bh);if(h){const u=new C;Dn.getBarycoord(bh,na,ia,sa,u),i&&(h.uv=Dn.getInterpolatedAttribute(i,o,c,l,u,new fe)),r&&(h.uv1=Dn.getInterpolatedAttribute(r,o,c,l,u,new fe)),a&&(h.normal=Dn.getInterpolatedAttribute(a,o,c,l,u,new C),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:c,c:l,normal:new C,materialIndex:0};Dn.getNormal(na,ia,sa,d.normal),h.face=d,h.barycoord=u}return h}class ss extends Lt{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],h=[],u=[];let d=0,f=0;b("z","y","x",-1,-1,n,t,e,a,r,0),b("z","y","x",1,-1,n,t,-e,a,r,1),b("x","z","y",1,1,e,n,t,i,a,2),b("x","z","y",1,-1,e,n,-t,i,a,3),b("x","y","z",1,-1,e,t,n,i,r,4),b("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new yt(l,3)),this.setAttribute("normal",new yt(h,3)),this.setAttribute("uv",new yt(u,2));function b(v,g,p,x,_,m,L,T,A,D,S){const y=m/A,P=L/D,U=m/2,k=L/2,V=T/2,$=A+1,H=D+1;let Z=0,W=0;const he=new C;for(let ie=0;ie<H;ie++){const ue=ie*P-k;for(let ve=0;ve<$;ve++){const xe=ve*y-U;he[v]=xe*x,he[g]=ue*_,he[p]=V,l.push(he.x,he.y,he.z),he[v]=0,he[g]=0,he[p]=T>0?1:-1,h.push(he.x,he.y,he.z),u.push(ve/A),u.push(1-ie/D),Z+=1}}for(let ie=0;ie<D;ie++)for(let ue=0;ue<A;ue++){const ve=d+ue+$*ie,xe=d+ue+$*(ie+1),J=d+(ue+1)+$*(ie+1),G=d+(ue+1)+$*ie;c.push(ve,xe,G),c.push(xe,J,G),W+=6}o.addGroup(f,W,S),f+=W,d+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ss(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Hs(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function sn(s){const e={};for(let t=0;t<s.length;t++){const n=Hs(s[t]);for(const i in n)e[i]=n[i]}return e}function vp(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function td(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}const xp={clone:Hs,merge:sn};var _p=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class dn extends Un{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_p,this.fragmentShader=yp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hs(e.uniforms),this.uniformsGroups=vp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class nd extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Je,this.projectionMatrix=new Je,this.projectionMatrixInverse=new Je,this.coordinateSystem=oi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ti=new C,vh=new fe,xh=new fe;class rn extends nd{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Gs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(mr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Gs*2*Math.atan(Math.tan(mr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ti.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z),Ti.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z)}getViewSize(e,t){return this.getViewBounds(e,vh,xh),t.subVectors(xh,vh)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(mr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*i/c,t-=a.offsetY*n/l,i*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ms=-90,Ss=1;class Mp extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new rn(Ms,Ss,e,t);i.layers=this.layers,this.add(i);const r=new rn(Ms,Ss,e,t);r.layers=this.layers,this.add(r);const a=new rn(Ms,Ss,e,t);a.layers=this.layers,this.add(a);const o=new rn(Ms,Ss,e,t);o.layers=this.layers,this.add(o);const c=new rn(Ms,Ss,e,t);c.layers=this.layers,this.add(c);const l=new rn(Ms,Ss,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===oi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Da)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),b=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=b,n.texture.needsPMREMUpdate=!0}}class id extends jt{constructor(e,t,n,i,r,a,o,c,l,h){e=e!==void 0?e:[],t=t!==void 0?t:Os,super(e,t,n,i,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Sp extends is{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new id(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:gn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new ss(5,5,5),r=new dn({name:"CubemapFromEquirect",uniforms:Hs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qt,blending:Ui});r.uniforms.tEquirect.value=t;const a=new ut(i,r),o=t.minFilter;return t.minFilter===ai&&(t.minFilter=gn),new Mp(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}const Lo=new C,wp=new C,Ep=new st;class $i{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Lo.subVectors(n,t).cross(wp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Lo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Ep.getNormalMatrix(e),i=this.coplanarPoint(Lo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Vi=new Vn,ca=new C;class fl{constructor(e=new $i,t=new $i,n=new $i,i=new $i,r=new $i,a=new $i){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=oi){const n=this.planes,i=e.elements,r=i[0],a=i[1],o=i[2],c=i[3],l=i[4],h=i[5],u=i[6],d=i[7],f=i[8],b=i[9],v=i[10],g=i[11],p=i[12],x=i[13],_=i[14],m=i[15];if(n[0].setComponents(c-r,d-l,g-f,m-p).normalize(),n[1].setComponents(c+r,d+l,g+f,m+p).normalize(),n[2].setComponents(c+a,d+h,g+b,m+x).normalize(),n[3].setComponents(c-a,d-h,g-b,m-x).normalize(),n[4].setComponents(c-o,d-u,g-v,m-_).normalize(),t===oi)n[5].setComponents(c+o,d+u,g+v,m+_).normalize();else if(t===Da)n[5].setComponents(o,u,v,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Vi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Vi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Vi)}intersectsSprite(e){return Vi.center.set(0,0,0),Vi.radius=.7071067811865476,Vi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Vi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(ca.x=i.normal.x>0?e.max.x:e.min.x,ca.y=i.normal.y>0?e.max.y:e.min.y,ca.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(ca)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function sd(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Tp(s){const e=new WeakMap;function t(o,c){const l=o.array,h=o.usage,u=l.byteLength,d=s.createBuffer();s.bindBuffer(c,d),s.bufferData(c,l,h),o.onUploadCallback();let f;if(l instanceof Float32Array)f=s.FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=s.SHORT;else if(l instanceof Uint32Array)f=s.UNSIGNED_INT;else if(l instanceof Int32Array)f=s.INT;else if(l instanceof Int8Array)f=s.BYTE;else if(l instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,c,l){const h=c.array,u=c.updateRanges;if(s.bindBuffer(l,o),u.length===0)s.bufferSubData(l,0,h);else{u.sort((f,b)=>f.start-b.start);let d=0;for(let f=1;f<u.length;f++){const b=u[d],v=u[f];v.start<=b.start+b.count+1?b.count=Math.max(b.count,v.start+v.count-b.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,b=u.length;f<b;f++){const v=u[f];s.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(s.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:i,remove:r,update:a}}class ri extends Lt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),l=o+1,h=c+1,u=e/o,d=t/c,f=[],b=[],v=[],g=[];for(let p=0;p<h;p++){const x=p*d-a;for(let _=0;_<l;_++){const m=_*u-r;b.push(m,-x,0),v.push(0,0,1),g.push(_/o),g.push(1-p/c)}}for(let p=0;p<c;p++)for(let x=0;x<o;x++){const _=x+l*p,m=x+l*(p+1),L=x+1+l*(p+1),T=x+1+l*p;f.push(_,m,T),f.push(m,L,T)}this.setIndex(f),this.setAttribute("position",new yt(b,3)),this.setAttribute("normal",new yt(v,3)),this.setAttribute("uv",new yt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ri(e.width,e.height,e.widthSegments,e.heightSegments)}}var Ap=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Rp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Cp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Pp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ip=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Dp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Np=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Up=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Fp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Op=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,kp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Bp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,zp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Gp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Hp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Vp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Wp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Xp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,qp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Yp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Kp=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,$p=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Jp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Zp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Qp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,em=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,tm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,nm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,im="gl_FragColor = linearToOutputTexel( gl_FragColor );",sm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,rm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,am=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,om=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,cm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,hm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,um=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,dm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,pm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,mm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,gm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,bm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,vm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,xm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,_m=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ym=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Mm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Sm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,wm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Em=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Tm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Am=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Rm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Cm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Pm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Im=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Dm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Nm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Um=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Fm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Om=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,km=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Bm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,zm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Gm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Vm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Xm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ym=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Km=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,$m=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Jm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Qm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,eg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,ng=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ig=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,sg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,rg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ag=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,og=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,cg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,lg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,hg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ug=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,dg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,fg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,pg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,mg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,gg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,bg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,vg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,xg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_g=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,yg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Mg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Sg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,wg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Eg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Tg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ag=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Lg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ig=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Dg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ng=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ug=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Fg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Og=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Bg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Gg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Xg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,qg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Yg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$g=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Jg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,t0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,n0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,i0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,s0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,r0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,et={alphahash_fragment:Ap,alphahash_pars_fragment:Rp,alphamap_fragment:Cp,alphamap_pars_fragment:Pp,alphatest_fragment:Lp,alphatest_pars_fragment:Ip,aomap_fragment:Dp,aomap_pars_fragment:Np,batching_pars_vertex:Up,batching_vertex:Fp,begin_vertex:Op,beginnormal_vertex:kp,bsdfs:Bp,iridescence_fragment:zp,bumpmap_pars_fragment:Gp,clipping_planes_fragment:Hp,clipping_planes_pars_fragment:Vp,clipping_planes_pars_vertex:Wp,clipping_planes_vertex:Xp,color_fragment:jp,color_pars_fragment:qp,color_pars_vertex:Yp,color_vertex:Kp,common:$p,cube_uv_reflection_fragment:Jp,defaultnormal_vertex:Zp,displacementmap_pars_vertex:Qp,displacementmap_vertex:em,emissivemap_fragment:tm,emissivemap_pars_fragment:nm,colorspace_fragment:im,colorspace_pars_fragment:sm,envmap_fragment:rm,envmap_common_pars_fragment:am,envmap_pars_fragment:om,envmap_pars_vertex:cm,envmap_physical_pars_fragment:xm,envmap_vertex:lm,fog_vertex:hm,fog_pars_vertex:um,fog_fragment:dm,fog_pars_fragment:fm,gradientmap_pars_fragment:pm,lightmap_pars_fragment:mm,lights_lambert_fragment:gm,lights_lambert_pars_fragment:bm,lights_pars_begin:vm,lights_toon_fragment:_m,lights_toon_pars_fragment:ym,lights_phong_fragment:Mm,lights_phong_pars_fragment:Sm,lights_physical_fragment:wm,lights_physical_pars_fragment:Em,lights_fragment_begin:Tm,lights_fragment_maps:Am,lights_fragment_end:Rm,logdepthbuf_fragment:Cm,logdepthbuf_pars_fragment:Pm,logdepthbuf_pars_vertex:Lm,logdepthbuf_vertex:Im,map_fragment:Dm,map_pars_fragment:Nm,map_particle_fragment:Um,map_particle_pars_fragment:Fm,metalnessmap_fragment:Om,metalnessmap_pars_fragment:km,morphinstance_vertex:Bm,morphcolor_vertex:zm,morphnormal_vertex:Gm,morphtarget_pars_vertex:Hm,morphtarget_vertex:Vm,normal_fragment_begin:Wm,normal_fragment_maps:Xm,normal_pars_fragment:jm,normal_pars_vertex:qm,normal_vertex:Ym,normalmap_pars_fragment:Km,clearcoat_normal_fragment_begin:$m,clearcoat_normal_fragment_maps:Jm,clearcoat_pars_fragment:Zm,iridescence_pars_fragment:Qm,opaque_fragment:eg,packing:tg,premultiplied_alpha_fragment:ng,project_vertex:ig,dithering_fragment:sg,dithering_pars_fragment:rg,roughnessmap_fragment:ag,roughnessmap_pars_fragment:og,shadowmap_pars_fragment:cg,shadowmap_pars_vertex:lg,shadowmap_vertex:hg,shadowmask_pars_fragment:ug,skinbase_vertex:dg,skinning_pars_vertex:fg,skinning_vertex:pg,skinnormal_vertex:mg,specularmap_fragment:gg,specularmap_pars_fragment:bg,tonemapping_fragment:vg,tonemapping_pars_fragment:xg,transmission_fragment:_g,transmission_pars_fragment:yg,uv_pars_fragment:Mg,uv_pars_vertex:Sg,uv_vertex:wg,worldpos_vertex:Eg,background_vert:Tg,background_frag:Ag,backgroundCube_vert:Rg,backgroundCube_frag:Cg,cube_vert:Pg,cube_frag:Lg,depth_vert:Ig,depth_frag:Dg,distanceRGBA_vert:Ng,distanceRGBA_frag:Ug,equirect_vert:Fg,equirect_frag:Og,linedashed_vert:kg,linedashed_frag:Bg,meshbasic_vert:zg,meshbasic_frag:Gg,meshlambert_vert:Hg,meshlambert_frag:Vg,meshmatcap_vert:Wg,meshmatcap_frag:Xg,meshnormal_vert:jg,meshnormal_frag:qg,meshphong_vert:Yg,meshphong_frag:Kg,meshphysical_vert:$g,meshphysical_frag:Jg,meshtoon_vert:Zg,meshtoon_frag:Qg,points_vert:e0,points_frag:t0,shadow_vert:n0,shadow_frag:i0,sprite_vert:s0,sprite_frag:r0},we={common:{diffuse:{value:new Le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new st},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new st}},envmap:{envMap:{value:null},envMapRotation:{value:new st},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new st}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new st}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new st},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new st},normalScale:{value:new fe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new st},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new st}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new st}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new st}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0},uvTransform:{value:new st}},sprite:{diffuse:{value:new Le(16777215)},opacity:{value:1},center:{value:new fe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new st},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0}}},Gn={basic:{uniforms:sn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:sn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Le(0)}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:sn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Le(0)},specular:{value:new Le(1118481)},shininess:{value:30}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:sn([we.common,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.roughnessmap,we.metalnessmap,we.fog,we.lights,{emissive:{value:new Le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:sn([we.common,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.gradientmap,we.fog,we.lights,{emissive:{value:new Le(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:sn([we.common,we.bumpmap,we.normalmap,we.displacementmap,we.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:sn([we.points,we.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:sn([we.common,we.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:sn([we.common,we.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:sn([we.common,we.bumpmap,we.normalmap,we.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:sn([we.sprite,we.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new st},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new st}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distanceRGBA:{uniforms:sn([we.common,we.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distanceRGBA_vert,fragmentShader:et.distanceRGBA_frag},shadow:{uniforms:sn([we.lights,we.fog,{color:{value:new Le(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};Gn.physical={uniforms:sn([Gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new st},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new st},clearcoatNormalScale:{value:new fe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new st},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new st},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new st},sheen:{value:0},sheenColor:{value:new Le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new st},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new st},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new st},transmissionSamplerSize:{value:new fe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new st},attenuationDistance:{value:0},attenuationColor:{value:new Le(0)},specularColor:{value:new Le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new st},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new st},anisotropyVector:{value:new fe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new st}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};const la={r:0,b:0,g:0},Wi=new bn,a0=new Je;function o0(s,e,t,n,i,r,a){const o=new Le(0);let c=r===!0?0:1,l,h,u=null,d=0,f=null;function b(x){let _=x.isScene===!0?x.background:null;return _&&_.isTexture&&(_=(x.backgroundBlurriness>0?t:e).get(_)),_}function v(x){let _=!1;const m=b(x);m===null?p(o,c):m&&m.isColor&&(p(m,1),_=!0);const L=s.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,a):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||_)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(x,_){const m=b(_);m&&(m.isCubeTexture||m.mapping===ka)?(h===void 0&&(h=new ut(new ss(1,1,1),new dn({name:"BackgroundCubeMaterial",uniforms:Hs(Gn.backgroundCube.uniforms),vertexShader:Gn.backgroundCube.vertexShader,fragmentShader:Gn.backgroundCube.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,T,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Wi.copy(_.backgroundRotation),Wi.x*=-1,Wi.y*=-1,Wi.z*=-1,m.isCubeTexture&&m.isRenderTargetTexture===!1&&(Wi.y*=-1,Wi.z*=-1),h.material.uniforms.envMap.value=m,h.material.uniforms.flipEnvMap.value=m.isCubeTexture&&m.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(a0.makeRotationFromEuler(Wi)),h.material.toneMapped=ct.getTransfer(m.colorSpace)!==St,(u!==m||d!==m.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=m,d=m.version,f=s.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):m&&m.isTexture&&(l===void 0&&(l=new ut(new ri(2,2),new dn({name:"BackgroundMaterial",uniforms:Hs(Gn.background.uniforms),vertexShader:Gn.background.vertexShader,fragmentShader:Gn.background.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=m,l.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,l.material.toneMapped=ct.getTransfer(m.colorSpace)!==St,m.matrixAutoUpdate===!0&&m.updateMatrix(),l.material.uniforms.uvTransform.value.copy(m.matrix),(u!==m||d!==m.version||f!==s.toneMapping)&&(l.material.needsUpdate=!0,u=m,d=m.version,f=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,_){x.getRGB(la,td(s)),n.buffers.color.setClear(la.r,la.g,la.b,_,a)}return{getClearColor:function(){return o},setClearColor:function(x,_=1){o.set(x),c=_,p(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(x){c=x,p(o,c)},render:v,addToRenderList:g}}function c0(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,a=!1;function o(y,P,U,k,V){let $=!1;const H=u(k,U,P);r!==H&&(r=H,l(r.object)),$=f(y,k,U,V),$&&b(y,k,U,V),V!==null&&e.update(V,s.ELEMENT_ARRAY_BUFFER),($||a)&&(a=!1,m(y,P,U,k),V!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function c(){return s.createVertexArray()}function l(y){return s.bindVertexArray(y)}function h(y){return s.deleteVertexArray(y)}function u(y,P,U){const k=U.wireframe===!0;let V=n[y.id];V===void 0&&(V={},n[y.id]=V);let $=V[P.id];$===void 0&&($={},V[P.id]=$);let H=$[k];return H===void 0&&(H=d(c()),$[k]=H),H}function d(y){const P=[],U=[],k=[];for(let V=0;V<t;V++)P[V]=0,U[V]=0,k[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:U,attributeDivisors:k,object:y,attributes:{},index:null}}function f(y,P,U,k){const V=r.attributes,$=P.attributes;let H=0;const Z=U.getAttributes();for(const W in Z)if(Z[W].location>=0){const ie=V[W];let ue=$[W];if(ue===void 0&&(W==="instanceMatrix"&&y.instanceMatrix&&(ue=y.instanceMatrix),W==="instanceColor"&&y.instanceColor&&(ue=y.instanceColor)),ie===void 0||ie.attribute!==ue||ue&&ie.data!==ue.data)return!0;H++}return r.attributesNum!==H||r.index!==k}function b(y,P,U,k){const V={},$=P.attributes;let H=0;const Z=U.getAttributes();for(const W in Z)if(Z[W].location>=0){let ie=$[W];ie===void 0&&(W==="instanceMatrix"&&y.instanceMatrix&&(ie=y.instanceMatrix),W==="instanceColor"&&y.instanceColor&&(ie=y.instanceColor));const ue={};ue.attribute=ie,ie&&ie.data&&(ue.data=ie.data),V[W]=ue,H++}r.attributes=V,r.attributesNum=H,r.index=k}function v(){const y=r.newAttributes;for(let P=0,U=y.length;P<U;P++)y[P]=0}function g(y){p(y,0)}function p(y,P){const U=r.newAttributes,k=r.enabledAttributes,V=r.attributeDivisors;U[y]=1,k[y]===0&&(s.enableVertexAttribArray(y),k[y]=1),V[y]!==P&&(s.vertexAttribDivisor(y,P),V[y]=P)}function x(){const y=r.newAttributes,P=r.enabledAttributes;for(let U=0,k=P.length;U<k;U++)P[U]!==y[U]&&(s.disableVertexAttribArray(U),P[U]=0)}function _(y,P,U,k,V,$,H){H===!0?s.vertexAttribIPointer(y,P,U,V,$):s.vertexAttribPointer(y,P,U,k,V,$)}function m(y,P,U,k){v();const V=k.attributes,$=U.getAttributes(),H=P.defaultAttributeValues;for(const Z in $){const W=$[Z];if(W.location>=0){let he=V[Z];if(he===void 0&&(Z==="instanceMatrix"&&y.instanceMatrix&&(he=y.instanceMatrix),Z==="instanceColor"&&y.instanceColor&&(he=y.instanceColor)),he!==void 0){const ie=he.normalized,ue=he.itemSize,ve=e.get(he);if(ve===void 0)continue;const xe=ve.buffer,J=ve.type,G=ve.bytesPerElement,z=J===s.INT||J===s.UNSIGNED_INT||he.gpuType===il;if(he.isInterleavedBufferAttribute){const re=he.data,pe=re.stride,Ie=he.offset;if(re.isInstancedInterleavedBuffer){for(let Re=0;Re<W.locationSize;Re++)p(W.location+Re,re.meshPerAttribute);y.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Re=0;Re<W.locationSize;Re++)g(W.location+Re);s.bindBuffer(s.ARRAY_BUFFER,xe);for(let Re=0;Re<W.locationSize;Re++)_(W.location+Re,ue/W.locationSize,J,ie,pe*G,(Ie+ue/W.locationSize*Re)*G,z)}else{if(he.isInstancedBufferAttribute){for(let re=0;re<W.locationSize;re++)p(W.location+re,he.meshPerAttribute);y.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let re=0;re<W.locationSize;re++)g(W.location+re);s.bindBuffer(s.ARRAY_BUFFER,xe);for(let re=0;re<W.locationSize;re++)_(W.location+re,ue/W.locationSize,J,ie,ue*G,ue/W.locationSize*re*G,z)}}else if(H!==void 0){const ie=H[Z];if(ie!==void 0)switch(ie.length){case 2:s.vertexAttrib2fv(W.location,ie);break;case 3:s.vertexAttrib3fv(W.location,ie);break;case 4:s.vertexAttrib4fv(W.location,ie);break;default:s.vertexAttrib1fv(W.location,ie)}}}}x()}function L(){D();for(const y in n){const P=n[y];for(const U in P){const k=P[U];for(const V in k)h(k[V].object),delete k[V];delete P[U]}delete n[y]}}function T(y){if(n[y.id]===void 0)return;const P=n[y.id];for(const U in P){const k=P[U];for(const V in k)h(k[V].object),delete k[V];delete P[U]}delete n[y.id]}function A(y){for(const P in n){const U=n[P];if(U[y.id]===void 0)continue;const k=U[y.id];for(const V in k)h(k[V].object),delete k[V];delete U[y.id]}}function D(){S(),a=!0,r!==i&&(r=i,l(r.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:D,resetDefaultState:S,dispose:L,releaseStatesOfGeometry:T,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:g,disableUnusedAttributes:x}}function l0(s,e,t){let n;function i(l){n=l}function r(l,h){s.drawArrays(n,l,h),t.update(h,n,1)}function a(l,h,u){u!==0&&(s.drawArraysInstanced(n,l,h,u),t.update(h,n,u))}function o(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let f=0;for(let b=0;b<u;b++)f+=h[b];t.update(f,n,1)}function c(l,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let b=0;b<l.length;b++)a(l[b],h[b],d[b]);else{f.multiDrawArraysInstancedWEBGL(n,l,0,h,0,d,0,u);let b=0;for(let v=0;v<u;v++)b+=h[v]*d[v];t.update(b,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function h0(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(A){return!(A!==Sn&&n.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const D=A===Cr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==hi&&n.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Nn&&!D)}function c(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),b=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),_=s.getParameter(s.MAX_VARYING_VECTORS),m=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),L=b>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:b,maxTextureSize:v,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:x,maxVaryings:_,maxFragmentUniforms:m,vertexTextures:L,maxSamples:T}}function u0(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new $i,o=new st,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const b=u.clippingPlanes,v=u.clipIntersection,g=u.clipShadows,p=s.get(u);if(!i||b===null||b.length===0||r&&!g)r?h(null):l();else{const x=r?0:n,_=x*4;let m=p.clippingState||null;c.value=m,m=h(b,d,_,f);for(let L=0;L!==_;++L)m[L]=t[L];p.clippingState=m,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,b){const v=u!==null?u.length:0;let g=null;if(v!==0){if(g=c.value,b!==!0||g===null){const p=f+v*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(g===null||g.length<p)&&(g=new Float32Array(p));for(let _=0,m=f;_!==v;++_,m+=4)a.copy(u[_]).applyMatrix4(x,o),a.normal.toArray(g,m),g[m+3]=a.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,g}}function d0(s){let e=new WeakMap;function t(a,o){return o===pc?a.mapping=Os:o===mc&&(a.mapping=ks),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===pc||o===mc)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new Sp(c.height);return l.fromEquirectangularTexture(s,a),e.set(a,l),a.addEventListener("dispose",i),t(l.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class pl extends nd{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Rs=4,_h=[.125,.215,.35,.446,.526,.582],Qi=20,Io=new pl,yh=new Le;let Do=null,No=0,Uo=0,Fo=!1;const Ji=(1+Math.sqrt(5))/2,ws=1/Ji,Mh=[new C(-Ji,ws,0),new C(Ji,ws,0),new C(-ws,0,Ji),new C(ws,0,Ji),new C(0,Ji,-ws),new C(0,Ji,ws),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class Sh{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){Do=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,i,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Th(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Eh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Do,No,Uo),this._renderer.xr.enabled=Fo,e.scissorTest=!1,ha(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Os||e.mapping===ks?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Do=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:gn,minFilter:gn,generateMipmaps:!1,type:Cr,format:Sn,colorSpace:on,depthBuffer:!1},i=wh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wh(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=f0(r)),this._blurMaterial=p0(r,e,t)}return i}_compileMaterial(e){const t=new ut(this._lodPlanes[0],e);this._renderer.compile(t,Io)}_sceneToCubeUV(e,t,n,i){const o=new rn(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(yh),h.toneMapping=Fi,h.autoClear=!1;const f=new Ii({name:"PMREM.Background",side:Qt,depthWrite:!1,depthTest:!1}),b=new ut(new ss,f);let v=!1;const g=e.background;g?g.isColor&&(f.color.copy(g),e.background=null,v=!0):(f.color.copy(yh),v=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(o.up.set(0,c[p],0),o.lookAt(l[p],0,0)):x===1?(o.up.set(0,0,c[p]),o.lookAt(0,l[p],0)):(o.up.set(0,c[p],0),o.lookAt(0,0,l[p]));const _=this._cubeSize;ha(i,x*_,p>2?_:0,_,_),h.setRenderTarget(i),v&&h.render(b,o),h.render(e,o)}b.geometry.dispose(),b.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=g}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Os||e.mapping===ks;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Th()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Eh());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new ut(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;ha(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Io)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Mh[(i-r-1)%Mh.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ut(this._lodPlanes[i],l),d=l.uniforms,f=this._sizeLods[n]-1,b=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Qi-1),v=r/b,g=isFinite(r)?1+Math.floor(h*v):Qi;g>Qi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Qi}`);const p=[];let x=0;for(let A=0;A<Qi;++A){const D=A/v,S=Math.exp(-D*D/2);p.push(S),A===0?x+=S:A<g&&(x+=2*S)}for(let A=0;A<p.length;A++)p[A]=p[A]/x;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:_}=this;d.dTheta.value=b,d.mipInt.value=_-n;const m=this._sizeLods[i],L=3*m*(i>_-Rs?i-_+Rs:0),T=4*(this._cubeSize-m);ha(t,L,T,3*m,2*m),c.setRenderTarget(t),c.render(u,Io)}}function f0(s){const e=[],t=[],n=[];let i=s;const r=s-Rs+1+_h.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);t.push(o);let c=1/o;a>s-Rs?c=_h[a-s+Rs-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),h=-l,u=1+l,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,b=6,v=3,g=2,p=1,x=new Float32Array(v*b*f),_=new Float32Array(g*b*f),m=new Float32Array(p*b*f);for(let T=0;T<f;T++){const A=T%3*2/3-1,D=T>2?0:-1,S=[A,D,0,A+2/3,D,0,A+2/3,D+1,0,A,D,0,A+2/3,D+1,0,A,D+1,0];x.set(S,v*b*T),_.set(d,g*b*T);const y=[T,T,T,T,T,T];m.set(y,p*b*T)}const L=new Lt;L.setAttribute("position",new gt(x,v)),L.setAttribute("uv",new gt(_,g)),L.setAttribute("faceIndex",new gt(m,p)),e.push(L),i>Rs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function wh(s,e,t){const n=new is(s,e,t);return n.texture.mapping=ka,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ha(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function p0(s,e,t){const n=new Float32Array(Qi),i=new C(0,1,0);return new dn({name:"SphericalGaussianBlur",defines:{n:Qi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ml(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function Eh(){return new dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ml(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function Th(){return new dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ml(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function ml(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function m0(s){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,l=c===pc||c===mc,h=c===Os||c===ks;if(l||h){let u=e.get(o);const d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Sh(s)),u=l?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const f=o.image;return l&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new Sh(s)),u=l?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let c=0;const l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){const c=o.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function g0(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&fr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function b0(s,e,t,n){const i={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const b in d.attributes)e.remove(d.attributes[b]);for(const b in d.morphAttributes){const v=d.morphAttributes[b];for(let g=0,p=v.length;g<p;g++)e.remove(v[g])}d.removeEventListener("dispose",a),delete i[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function c(u){const d=u.attributes;for(const b in d)e.update(d[b],s.ARRAY_BUFFER);const f=u.morphAttributes;for(const b in f){const v=f[b];for(let g=0,p=v.length;g<p;g++)e.update(v[g],s.ARRAY_BUFFER)}}function l(u){const d=[],f=u.index,b=u.attributes.position;let v=0;if(f!==null){const x=f.array;v=f.version;for(let _=0,m=x.length;_<m;_+=3){const L=x[_+0],T=x[_+1],A=x[_+2];d.push(L,T,T,A,A,L)}}else if(b!==void 0){const x=b.array;v=b.version;for(let _=0,m=x.length/3-1;_<m;_+=3){const L=_+0,T=_+1,A=_+2;d.push(L,T,T,A,A,L)}}else return;const g=new(Ku(d)?ed:Qu)(d,1);g.version=v;const p=r.get(u);p&&e.remove(p),r.set(u,g)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function v0(s,e,t){let n;function i(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function c(d,f){s.drawElements(n,f,r,d*a),t.update(f,n,1)}function l(d,f,b){b!==0&&(s.drawElementsInstanced(n,f,r,d*a,b),t.update(f,n,b))}function h(d,f,b){if(b===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,b);let g=0;for(let p=0;p<b;p++)g+=f[p];t.update(g,n,1)}function u(d,f,b,v){if(b===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<d.length;p++)l(d[p]/a,f[p],v[p]);else{g.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,v,0,b);let p=0;for(let x=0;x<b;x++)p+=f[x]*v[x];t.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function x0(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function _0(s,e,t){const n=new WeakMap,i=new mt;function r(a,o,c){const l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let y=function(){D.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var f=y;d!==void 0&&d.texture.dispose();const b=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],x=o.morphAttributes.normal||[],_=o.morphAttributes.color||[];let m=0;b===!0&&(m=1),v===!0&&(m=2),g===!0&&(m=3);let L=o.attributes.position.count*m,T=1;L>e.maxTextureSize&&(T=Math.ceil(L/e.maxTextureSize),L=e.maxTextureSize);const A=new Float32Array(L*T*4*u),D=new Ju(A,L,T,u);D.type=Nn,D.needsUpdate=!0;const S=m*4;for(let P=0;P<u;P++){const U=p[P],k=x[P],V=_[P],$=L*T*4*P;for(let H=0;H<U.count;H++){const Z=H*S;b===!0&&(i.fromBufferAttribute(U,H),A[$+Z+0]=i.x,A[$+Z+1]=i.y,A[$+Z+2]=i.z,A[$+Z+3]=0),v===!0&&(i.fromBufferAttribute(k,H),A[$+Z+4]=i.x,A[$+Z+5]=i.y,A[$+Z+6]=i.z,A[$+Z+7]=0),g===!0&&(i.fromBufferAttribute(V,H),A[$+Z+8]=i.x,A[$+Z+9]=i.y,A[$+Z+10]=i.z,A[$+Z+11]=V.itemSize===4?i.w:1)}}d={count:u,texture:D,size:new fe(L,T)},n.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let b=0;for(let g=0;g<l.length;g++)b+=l[g];const v=o.morphTargetsRelative?1:1-b;c.getUniforms().setValue(s,"morphTargetBaseInfluence",v),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function y0(s,e,t,n){let i=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,u=e.get(c,h);if(i.get(u)!==l&&(e.update(u),i.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),i.get(c)!==l&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return u}function a(){i=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:a}}class rd extends jt{constructor(e,t,n,i,r,a,o,c,l,h=Is){if(h!==Is&&h!==zs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Is&&(n=ns),n===void 0&&h===zs&&(n=Bs),super(null,i,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:an,this.minFilter=c!==void 0?c:an,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const ad=new jt,Ah=new rd(1,1),od=new Ju,cd=new op,ld=new id,Rh=[],Ch=[],Ph=new Float32Array(16),Lh=new Float32Array(9),Ih=new Float32Array(4);function qs(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Rh[i];if(r===void 0&&(r=new Float32Array(i),Rh[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Ht(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Vt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function za(s,e){let t=Ch[e];t===void 0&&(t=new Int32Array(e),Ch[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function M0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function S0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;s.uniform2fv(this.addr,e),Vt(t,e)}}function w0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ht(t,e))return;s.uniform3fv(this.addr,e),Vt(t,e)}}function E0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;s.uniform4fv(this.addr,e),Vt(t,e)}}function T0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ht(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Vt(t,e)}else{if(Ht(t,n))return;Ih.set(n),s.uniformMatrix2fv(this.addr,!1,Ih),Vt(t,n)}}function A0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ht(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Vt(t,e)}else{if(Ht(t,n))return;Lh.set(n),s.uniformMatrix3fv(this.addr,!1,Lh),Vt(t,n)}}function R0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ht(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Vt(t,e)}else{if(Ht(t,n))return;Ph.set(n),s.uniformMatrix4fv(this.addr,!1,Ph),Vt(t,n)}}function C0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function P0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;s.uniform2iv(this.addr,e),Vt(t,e)}}function L0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ht(t,e))return;s.uniform3iv(this.addr,e),Vt(t,e)}}function I0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;s.uniform4iv(this.addr,e),Vt(t,e)}}function D0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function N0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;s.uniform2uiv(this.addr,e),Vt(t,e)}}function U0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ht(t,e))return;s.uniform3uiv(this.addr,e),Vt(t,e)}}function F0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;s.uniform4uiv(this.addr,e),Vt(t,e)}}function O0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Ah.compareFunction=Yu,r=Ah):r=ad,t.setTexture2D(e||r,i)}function k0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||cd,i)}function B0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||ld,i)}function z0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||od,i)}function G0(s){switch(s){case 5126:return M0;case 35664:return S0;case 35665:return w0;case 35666:return E0;case 35674:return T0;case 35675:return A0;case 35676:return R0;case 5124:case 35670:return C0;case 35667:case 35671:return P0;case 35668:case 35672:return L0;case 35669:case 35673:return I0;case 5125:return D0;case 36294:return N0;case 36295:return U0;case 36296:return F0;case 35678:case 36198:case 36298:case 36306:case 35682:return O0;case 35679:case 36299:case 36307:return k0;case 35680:case 36300:case 36308:case 36293:return B0;case 36289:case 36303:case 36311:case 36292:return z0}}function H0(s,e){s.uniform1fv(this.addr,e)}function V0(s,e){const t=qs(e,this.size,2);s.uniform2fv(this.addr,t)}function W0(s,e){const t=qs(e,this.size,3);s.uniform3fv(this.addr,t)}function X0(s,e){const t=qs(e,this.size,4);s.uniform4fv(this.addr,t)}function j0(s,e){const t=qs(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function q0(s,e){const t=qs(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Y0(s,e){const t=qs(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function K0(s,e){s.uniform1iv(this.addr,e)}function $0(s,e){s.uniform2iv(this.addr,e)}function J0(s,e){s.uniform3iv(this.addr,e)}function Z0(s,e){s.uniform4iv(this.addr,e)}function Q0(s,e){s.uniform1uiv(this.addr,e)}function eb(s,e){s.uniform2uiv(this.addr,e)}function tb(s,e){s.uniform3uiv(this.addr,e)}function nb(s,e){s.uniform4uiv(this.addr,e)}function ib(s,e,t){const n=this.cache,i=e.length,r=za(t,i);Ht(n,r)||(s.uniform1iv(this.addr,r),Vt(n,r));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||ad,r[a])}function sb(s,e,t){const n=this.cache,i=e.length,r=za(t,i);Ht(n,r)||(s.uniform1iv(this.addr,r),Vt(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||cd,r[a])}function rb(s,e,t){const n=this.cache,i=e.length,r=za(t,i);Ht(n,r)||(s.uniform1iv(this.addr,r),Vt(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||ld,r[a])}function ab(s,e,t){const n=this.cache,i=e.length,r=za(t,i);Ht(n,r)||(s.uniform1iv(this.addr,r),Vt(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||od,r[a])}function ob(s){switch(s){case 5126:return H0;case 35664:return V0;case 35665:return W0;case 35666:return X0;case 35674:return j0;case 35675:return q0;case 35676:return Y0;case 5124:case 35670:return K0;case 35667:case 35671:return $0;case 35668:case 35672:return J0;case 35669:case 35673:return Z0;case 5125:return Q0;case 36294:return eb;case 36295:return tb;case 36296:return nb;case 35678:case 36198:case 36298:case 36306:case 35682:return ib;case 35679:case 36299:case 36307:return sb;case 35680:case 36300:case 36308:case 36293:return rb;case 36289:case 36303:case 36311:case 36292:return ab}}class cb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=G0(t.type)}}class lb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ob(t.type)}}class hb{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(e,t[o.id],n)}}}const Oo=/(\w+)(\])?(\[|\.)?/g;function Dh(s,e){s.seq.push(e),s.map[e.id]=e}function ub(s,e,t){const n=s.name,i=n.length;for(Oo.lastIndex=0;;){const r=Oo.exec(n),a=Oo.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===i){Dh(t,l===void 0?new cb(o,s,e):new lb(o,s,e));break}else{let u=t.map[o];u===void 0&&(u=new hb(o),Dh(t,u)),t=u}}}class Pa{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),a=e.getUniformLocation(t,r.name);ub(r,a,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function Nh(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const db=37297;let fb=0;function pb(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Uh=new st;function mb(s){ct._getMatrix(Uh,ct.workingColorSpace,s);const e=`mat3( ${Uh.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(s)){case Ba:return[e,"LinearTransferOETF"];case St:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Fh(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),i=s.getShaderInfoLog(e).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+i+`

`+pb(s.getShaderSource(e),a)}else return i}function gb(s,e){const t=mb(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function bb(s,e){let t;switch(e){case vf:t="Linear";break;case xf:t="Reinhard";break;case _f:t="Cineon";break;case Uu:t="ACESFilmic";break;case Mf:t="AgX";break;case Sf:t="Neutral";break;case yf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ua=new C;function vb(){ct.getLuminanceCoefficients(ua);const s=ua.x.toFixed(4),e=ua.y.toFixed(4),t=ua.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function xb(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(pr).join(`
`)}function _b(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function yb(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function pr(s){return s!==""}function Oh(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function kh(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Mb=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wc(s){return s.replace(Mb,wb)}const Sb=new Map;function wb(s,e){let t=et[e];if(t===void 0){const n=Sb.get(e);if(n!==void 0)t=et[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Wc(t)}const Eb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Bh(s){return s.replace(Eb,Tb)}function Tb(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function zh(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Ab(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Nu?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===$d?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===ni&&(e="SHADOWMAP_TYPE_VSM"),e}function Rb(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Os:case ks:e="ENVMAP_TYPE_CUBE";break;case ka:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Cb(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case ks:e="ENVMAP_MODE_REFRACTION";break}return e}function Pb(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case nl:e="ENVMAP_BLENDING_MULTIPLY";break;case gf:e="ENVMAP_BLENDING_MIX";break;case bf:e="ENVMAP_BLENDING_ADD";break}return e}function Lb(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Ib(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=Ab(t),l=Rb(t),h=Cb(t),u=Pb(t),d=Lb(t),f=xb(t),b=_b(r),v=i.createProgram();let g,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b].filter(pr).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b].filter(pr).join(`
`),p.length>0&&(p+=`
`)):(g=[zh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pr).join(`
`),p=[zh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,b,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Fi?"#define TONE_MAPPING":"",t.toneMapping!==Fi?et.tonemapping_pars_fragment:"",t.toneMapping!==Fi?bb("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,gb("linearToOutputTexel",t.outputColorSpace),vb(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(pr).join(`
`)),a=Wc(a),a=Oh(a,t),a=kh(a,t),o=Wc(o),o=Oh(o,t),o=kh(o,t),a=Bh(a),o=Bh(o),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Zl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Zl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const _=x+g+a,m=x+p+o,L=Nh(i,i.VERTEX_SHADER,_),T=Nh(i,i.FRAGMENT_SHADER,m);i.attachShader(v,L),i.attachShader(v,T),t.index0AttributeName!==void 0?i.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function A(P){if(s.debug.checkShaderErrors){const U=i.getProgramInfoLog(v).trim(),k=i.getShaderInfoLog(L).trim(),V=i.getShaderInfoLog(T).trim();let $=!0,H=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if($=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,L,T);else{const Z=Fh(i,L,"vertex"),W=Fh(i,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+U+`
`+Z+`
`+W)}else U!==""?console.warn("THREE.WebGLProgram: Program Info Log:",U):(k===""||V==="")&&(H=!1);H&&(P.diagnostics={runnable:$,programLog:U,vertexShader:{log:k,prefix:g},fragmentShader:{log:V,prefix:p}})}i.deleteShader(L),i.deleteShader(T),D=new Pa(i,v),S=yb(i,v)}let D;this.getUniforms=function(){return D===void 0&&A(this),D};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(v,db)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=fb++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=L,this.fragmentShader=T,this}let Db=0;class Nb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Ub(e),t.set(e,n)),n}}class Ub{constructor(e){this.id=Db++,this.code=e,this.usedTimes=0}}function Fb(s,e,t,n,i,r,a){const o=new dl,c=new Nb,l=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const b={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(S){return l.add(S),S===0?"uv":`uv${S}`}function g(S,y,P,U,k){const V=U.fog,$=k.geometry,H=S.isMeshStandardMaterial?U.environment:null,Z=(S.isMeshStandardMaterial?t:e).get(S.envMap||H),W=Z&&Z.mapping===ka?Z.image.height:null,he=b[S.type];S.precision!==null&&(f=i.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const ie=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,ue=ie!==void 0?ie.length:0;let ve=0;$.morphAttributes.position!==void 0&&(ve=1),$.morphAttributes.normal!==void 0&&(ve=2),$.morphAttributes.color!==void 0&&(ve=3);let xe,J,G,z;if(he){const at=Gn[he];xe=at.vertexShader,J=at.fragmentShader}else xe=S.vertexShader,J=S.fragmentShader,c.update(S),G=c.getVertexShaderID(S),z=c.getFragmentShaderID(S);const re=s.getRenderTarget(),pe=s.state.buffers.depth.getReversed(),Ie=k.isInstancedMesh===!0,Re=k.isBatchedMesh===!0,Ke=!!S.map,Q=!!S.matcap,oe=!!Z,I=!!S.aoMap,Fe=!!S.lightMap,ae=!!S.bumpMap,Ee=!!S.normalMap,ge=!!S.displacementMap,De=!!S.emissiveMap,Pe=!!S.metalnessMap,R=!!S.roughnessMap,M=S.anisotropy>0,B=S.clearcoat>0,ee=S.dispersion>0,se=S.iridescence>0,te=S.sheen>0,Ue=S.transmission>0,be=M&&!!S.anisotropyMap,Ce=B&&!!S.clearcoatMap,it=B&&!!S.clearcoatNormalMap,ce=B&&!!S.clearcoatRoughnessMap,Me=se&&!!S.iridescenceMap,Xe=se&&!!S.iridescenceThicknessMap,je=te&&!!S.sheenColorMap,Te=te&&!!S.sheenRoughnessMap,tt=!!S.specularMap,Ze=!!S.specularColorMap,ft=!!S.specularIntensityMap,N=Ue&&!!S.transmissionMap,_e=Ue&&!!S.thicknessMap,K=!!S.gradientMap,ne=!!S.alphaMap,Se=S.alphaTest>0,ye=!!S.alphaHash,He=!!S.extensions;let bt=Fi;S.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(bt=s.toneMapping);const Nt={shaderID:he,shaderType:S.type,shaderName:S.name,vertexShader:xe,fragmentShader:J,defines:S.defines,customVertexShaderID:G,customFragmentShaderID:z,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:Re,batchingColor:Re&&k._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&k.instanceColor!==null,instancingMorph:Ie&&k.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:re===null?s.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:on,alphaToCoverage:!!S.alphaToCoverage,map:Ke,matcap:Q,envMap:oe,envMapMode:oe&&Z.mapping,envMapCubeUVHeight:W,aoMap:I,lightMap:Fe,bumpMap:ae,normalMap:Ee,displacementMap:d&&ge,emissiveMap:De,normalMapObjectSpace:Ee&&S.normalMapType===Cf,normalMapTangentSpace:Ee&&S.normalMapType===hl,metalnessMap:Pe,roughnessMap:R,anisotropy:M,anisotropyMap:be,clearcoat:B,clearcoatMap:Ce,clearcoatNormalMap:it,clearcoatRoughnessMap:ce,dispersion:ee,iridescence:se,iridescenceMap:Me,iridescenceThicknessMap:Xe,sheen:te,sheenColorMap:je,sheenRoughnessMap:Te,specularMap:tt,specularColorMap:Ze,specularIntensityMap:ft,transmission:Ue,transmissionMap:N,thicknessMap:_e,gradientMap:K,opaque:S.transparent===!1&&S.blending===Ls&&S.alphaToCoverage===!1,alphaMap:ne,alphaTest:Se,alphaHash:ye,combine:S.combine,mapUv:Ke&&v(S.map.channel),aoMapUv:I&&v(S.aoMap.channel),lightMapUv:Fe&&v(S.lightMap.channel),bumpMapUv:ae&&v(S.bumpMap.channel),normalMapUv:Ee&&v(S.normalMap.channel),displacementMapUv:ge&&v(S.displacementMap.channel),emissiveMapUv:De&&v(S.emissiveMap.channel),metalnessMapUv:Pe&&v(S.metalnessMap.channel),roughnessMapUv:R&&v(S.roughnessMap.channel),anisotropyMapUv:be&&v(S.anisotropyMap.channel),clearcoatMapUv:Ce&&v(S.clearcoatMap.channel),clearcoatNormalMapUv:it&&v(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ce&&v(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Me&&v(S.iridescenceMap.channel),iridescenceThicknessMapUv:Xe&&v(S.iridescenceThicknessMap.channel),sheenColorMapUv:je&&v(S.sheenColorMap.channel),sheenRoughnessMapUv:Te&&v(S.sheenRoughnessMap.channel),specularMapUv:tt&&v(S.specularMap.channel),specularColorMapUv:Ze&&v(S.specularColorMap.channel),specularIntensityMapUv:ft&&v(S.specularIntensityMap.channel),transmissionMapUv:N&&v(S.transmissionMap.channel),thicknessMapUv:_e&&v(S.thicknessMap.channel),alphaMapUv:ne&&v(S.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(Ee||M),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!$.attributes.uv&&(Ke||ne),fog:!!V,useFog:S.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:pe,skinning:k.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:ue,morphTextureStride:ve,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:S.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:bt,decodeVideoTexture:Ke&&S.map.isVideoTexture===!0&&ct.getTransfer(S.map.colorSpace)===St,decodeVideoTextureEmissive:De&&S.emissiveMap.isVideoTexture===!0&&ct.getTransfer(S.emissiveMap.colorSpace)===St,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Zt,flipSided:S.side===Qt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:He&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(He&&S.extensions.multiDraw===!0||Re)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Nt.vertexUv1s=l.has(1),Nt.vertexUv2s=l.has(2),Nt.vertexUv3s=l.has(3),l.clear(),Nt}function p(S){const y=[];if(S.shaderID?y.push(S.shaderID):(y.push(S.customVertexShaderID),y.push(S.customFragmentShaderID)),S.defines!==void 0)for(const P in S.defines)y.push(P),y.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(x(y,S),_(y,S),y.push(s.outputColorSpace)),y.push(S.customProgramCacheKey),y.join()}function x(S,y){S.push(y.precision),S.push(y.outputColorSpace),S.push(y.envMapMode),S.push(y.envMapCubeUVHeight),S.push(y.mapUv),S.push(y.alphaMapUv),S.push(y.lightMapUv),S.push(y.aoMapUv),S.push(y.bumpMapUv),S.push(y.normalMapUv),S.push(y.displacementMapUv),S.push(y.emissiveMapUv),S.push(y.metalnessMapUv),S.push(y.roughnessMapUv),S.push(y.anisotropyMapUv),S.push(y.clearcoatMapUv),S.push(y.clearcoatNormalMapUv),S.push(y.clearcoatRoughnessMapUv),S.push(y.iridescenceMapUv),S.push(y.iridescenceThicknessMapUv),S.push(y.sheenColorMapUv),S.push(y.sheenRoughnessMapUv),S.push(y.specularMapUv),S.push(y.specularColorMapUv),S.push(y.specularIntensityMapUv),S.push(y.transmissionMapUv),S.push(y.thicknessMapUv),S.push(y.combine),S.push(y.fogExp2),S.push(y.sizeAttenuation),S.push(y.morphTargetsCount),S.push(y.morphAttributeCount),S.push(y.numDirLights),S.push(y.numPointLights),S.push(y.numSpotLights),S.push(y.numSpotLightMaps),S.push(y.numHemiLights),S.push(y.numRectAreaLights),S.push(y.numDirLightShadows),S.push(y.numPointLightShadows),S.push(y.numSpotLightShadows),S.push(y.numSpotLightShadowsWithMaps),S.push(y.numLightProbes),S.push(y.shadowMapType),S.push(y.toneMapping),S.push(y.numClippingPlanes),S.push(y.numClipIntersection),S.push(y.depthPacking)}function _(S,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),S.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reverseDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),S.push(o.mask)}function m(S){const y=b[S.type];let P;if(y){const U=Gn[y];P=xp.clone(U.uniforms)}else P=S.uniforms;return P}function L(S,y){let P;for(let U=0,k=h.length;U<k;U++){const V=h[U];if(V.cacheKey===y){P=V,++P.usedTimes;break}}return P===void 0&&(P=new Ib(s,y,S,r),h.push(P)),P}function T(S){if(--S.usedTimes===0){const y=h.indexOf(S);h[y]=h[h.length-1],h.pop(),S.destroy()}}function A(S){c.remove(S)}function D(){c.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:m,acquireProgram:L,releaseProgram:T,releaseShaderCache:A,programs:h,dispose:D}}function Ob(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,c){s.get(a)[o]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function kb(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Gh(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Hh(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(u,d,f,b,v,g){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:b,renderOrder:u.renderOrder,z:v,group:g},s[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=b,p.renderOrder=u.renderOrder,p.z=v,p.group=g),e++,p}function o(u,d,f,b,v,g){const p=a(u,d,f,b,v,g);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function c(u,d,f,b,v,g){const p=a(u,d,f,b,v,g);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function l(u,d){t.length>1&&t.sort(u||kb),n.length>1&&n.sort(d||Gh),i.length>1&&i.sort(d||Gh)}function h(){for(let u=e,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:o,unshift:c,finish:h,sort:l}}function Bb(){let s=new WeakMap;function e(n,i){const r=s.get(n);let a;return r===void 0?(a=new Hh,s.set(n,[a])):i>=r.length?(a=new Hh,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function zb(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new Le};break;case"SpotLight":t={position:new C,direction:new C,color:new Le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Le,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Le,groundColor:new Le};break;case"RectAreaLight":t={color:new Le,position:new C,halfWidth:new C,halfHeight:new C};break}return s[e.id]=t,t}}}function Gb(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let Hb=0;function Vb(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function Wb(s){const e=new zb,t=Gb(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new C);const i=new C,r=new Je,a=new Je;function o(l){let h=0,u=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let f=0,b=0,v=0,g=0,p=0,x=0,_=0,m=0,L=0,T=0,A=0;l.sort(Vb);for(let S=0,y=l.length;S<y;S++){const P=l[S],U=P.color,k=P.intensity,V=P.distance,$=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=U.r*k,u+=U.g*k,d+=U.b*k;else if(P.isLightProbe){for(let H=0;H<9;H++)n.probe[H].addScaledVector(P.sh.coefficients[H],k);A++}else if(P.isDirectionalLight){const H=e.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const Z=P.shadow,W=t.get(P);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.directionalShadow[f]=W,n.directionalShadowMap[f]=$,n.directionalShadowMatrix[f]=P.shadow.matrix,x++}n.directional[f]=H,f++}else if(P.isSpotLight){const H=e.get(P);H.position.setFromMatrixPosition(P.matrixWorld),H.color.copy(U).multiplyScalar(k),H.distance=V,H.coneCos=Math.cos(P.angle),H.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),H.decay=P.decay,n.spot[v]=H;const Z=P.shadow;if(P.map&&(n.spotLightMap[L]=P.map,L++,Z.updateMatrices(P),P.castShadow&&T++),n.spotLightMatrix[v]=Z.matrix,P.castShadow){const W=t.get(P);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.spotShadow[v]=W,n.spotShadowMap[v]=$,m++}v++}else if(P.isRectAreaLight){const H=e.get(P);H.color.copy(U).multiplyScalar(k),H.halfWidth.set(P.width*.5,0,0),H.halfHeight.set(0,P.height*.5,0),n.rectArea[g]=H,g++}else if(P.isPointLight){const H=e.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),H.distance=P.distance,H.decay=P.decay,P.castShadow){const Z=P.shadow,W=t.get(P);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,W.shadowCameraNear=Z.camera.near,W.shadowCameraFar=Z.camera.far,n.pointShadow[b]=W,n.pointShadowMap[b]=$,n.pointShadowMatrix[b]=P.shadow.matrix,_++}n.point[b]=H,b++}else if(P.isHemisphereLight){const H=e.get(P);H.skyColor.copy(P.color).multiplyScalar(k),H.groundColor.copy(P.groundColor).multiplyScalar(k),n.hemi[p]=H,p++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=we.LTC_FLOAT_1,n.rectAreaLTC2=we.LTC_FLOAT_2):(n.rectAreaLTC1=we.LTC_HALF_1,n.rectAreaLTC2=we.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const D=n.hash;(D.directionalLength!==f||D.pointLength!==b||D.spotLength!==v||D.rectAreaLength!==g||D.hemiLength!==p||D.numDirectionalShadows!==x||D.numPointShadows!==_||D.numSpotShadows!==m||D.numSpotMaps!==L||D.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=g,n.point.length=b,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=_,n.pointShadowMap.length=_,n.spotShadow.length=m,n.spotShadowMap.length=m,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=_,n.spotLightMatrix.length=m+L-T,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=A,D.directionalLength=f,D.pointLength=b,D.spotLength=v,D.rectAreaLength=g,D.hemiLength=p,D.numDirectionalShadows=x,D.numPointShadows=_,D.numSpotShadows=m,D.numSpotMaps=L,D.numLightProbes=A,n.version=Hb++)}function c(l,h){let u=0,d=0,f=0,b=0,v=0;const g=h.matrixWorldInverse;for(let p=0,x=l.length;p<x;p++){const _=l[p];if(_.isDirectionalLight){const m=n.directional[u];m.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),m.direction.sub(i),m.direction.transformDirection(g),u++}else if(_.isSpotLight){const m=n.spot[f];m.position.setFromMatrixPosition(_.matrixWorld),m.position.applyMatrix4(g),m.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),m.direction.sub(i),m.direction.transformDirection(g),f++}else if(_.isRectAreaLight){const m=n.rectArea[b];m.position.setFromMatrixPosition(_.matrixWorld),m.position.applyMatrix4(g),a.identity(),r.copy(_.matrixWorld),r.premultiply(g),a.extractRotation(r),m.halfWidth.set(_.width*.5,0,0),m.halfHeight.set(0,_.height*.5,0),m.halfWidth.applyMatrix4(a),m.halfHeight.applyMatrix4(a),b++}else if(_.isPointLight){const m=n.point[d];m.position.setFromMatrixPosition(_.matrixWorld),m.position.applyMatrix4(g),d++}else if(_.isHemisphereLight){const m=n.hemi[v];m.direction.setFromMatrixPosition(_.matrixWorld),m.direction.transformDirection(g),v++}}}return{setup:o,setupView:c,state:n}}function Vh(s){const e=new Wb(s),t=[],n=[];function i(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function c(h){e.setupView(t,h)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function Xb(s){let e=new WeakMap;function t(i,r=0){const a=e.get(i);let o;return a===void 0?(o=new Vh(s),e.set(i,[o])):r>=a.length?(o=new Vh(s),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}class jb extends Un{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Af,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class qb extends Un{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Yb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Kb=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function $b(s,e,t){let n=new fl;const i=new fe,r=new fe,a=new mt,o=new jb({depthPacking:Rf}),c=new qb,l={},h=t.maxTextureSize,u={[li]:Qt,[Qt]:li,[Zt]:Zt},d=new dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new fe},radius:{value:4}},vertexShader:Yb,fragmentShader:Kb}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const b=new Lt;b.setAttribute("position",new gt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new ut(b,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nu;let p=this.type;this.render=function(T,A,D){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;const S=s.getRenderTarget(),y=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),U=s.state;U.setBlending(Ui),U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const k=p!==ni&&this.type===ni,V=p===ni&&this.type!==ni;for(let $=0,H=T.length;$<H;$++){const Z=T[$],W=Z.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;i.copy(W.mapSize);const he=W.getFrameExtents();if(i.multiply(he),r.copy(W.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/he.x),i.x=r.x*he.x,W.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/he.y),i.y=r.y*he.y,W.mapSize.y=r.y)),W.map===null||k===!0||V===!0){const ue=this.type!==ni?{minFilter:an,magFilter:an}:{};W.map!==null&&W.map.dispose(),W.map=new is(i.x,i.y,ue),W.map.texture.name=Z.name+".shadowMap",W.camera.updateProjectionMatrix()}s.setRenderTarget(W.map),s.clear();const ie=W.getViewportCount();for(let ue=0;ue<ie;ue++){const ve=W.getViewport(ue);a.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),U.viewport(a),W.updateMatrices(Z,ue),n=W.getFrustum(),m(A,D,W.camera,Z,this.type)}W.isPointLightShadow!==!0&&this.type===ni&&x(W,D),W.needsUpdate=!1}p=this.type,g.needsUpdate=!1,s.setRenderTarget(S,y,P)};function x(T,A){const D=e.update(v);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new is(i.x,i.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(A,null,D,d,v,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(A,null,D,f,v,null)}function _(T,A,D,S){let y=null;const P=D.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(P!==void 0)y=P;else if(y=D.isPointLight===!0?c:o,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const U=y.uuid,k=A.uuid;let V=l[U];V===void 0&&(V={},l[U]=V);let $=V[k];$===void 0&&($=y.clone(),V[k]=$,A.addEventListener("dispose",L)),y=$}if(y.visible=A.visible,y.wireframe=A.wireframe,S===ni?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:u[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,D.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const U=s.properties.get(y);U.light=D}return y}function m(T,A,D,S,y){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&y===ni)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,T.matrixWorld);const k=e.update(T),V=T.material;if(Array.isArray(V)){const $=k.groups;for(let H=0,Z=$.length;H<Z;H++){const W=$[H],he=V[W.materialIndex];if(he&&he.visible){const ie=_(T,he,S,y);T.onBeforeShadow(s,T,A,D,k,ie,W),s.renderBufferDirect(D,null,k,ie,T,W),T.onAfterShadow(s,T,A,D,k,ie,W)}}}else if(V.visible){const $=_(T,V,S,y);T.onBeforeShadow(s,T,A,D,k,$,null),s.renderBufferDirect(D,null,k,$,T,null),T.onAfterShadow(s,T,A,D,k,$,null)}}const U=T.children;for(let k=0,V=U.length;k<V;k++)m(U[k],A,D,S,y)}function L(T){T.target.removeEventListener("dispose",L);for(const D in l){const S=l[D],y=T.target.uuid;y in S&&(S[y].dispose(),delete S[y])}}}const Jb={[oc]:cc,[lc]:dc,[hc]:fc,[Fs]:uc,[cc]:oc,[dc]:lc,[fc]:hc,[uc]:Fs};function Zb(s,e){function t(){let N=!1;const _e=new mt;let K=null;const ne=new mt(0,0,0,0);return{setMask:function(Se){K!==Se&&!N&&(s.colorMask(Se,Se,Se,Se),K=Se)},setLocked:function(Se){N=Se},setClear:function(Se,ye,He,bt,Nt){Nt===!0&&(Se*=bt,ye*=bt,He*=bt),_e.set(Se,ye,He,bt),ne.equals(_e)===!1&&(s.clearColor(Se,ye,He,bt),ne.copy(_e))},reset:function(){N=!1,K=null,ne.set(-1,0,0,0)}}}function n(){let N=!1,_e=!1,K=null,ne=null,Se=null;return{setReversed:function(ye){if(_e!==ye){const He=e.get("EXT_clip_control");_e?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT);const bt=Se;Se=null,this.setClear(bt)}_e=ye},getReversed:function(){return _e},setTest:function(ye){ye?re(s.DEPTH_TEST):pe(s.DEPTH_TEST)},setMask:function(ye){K!==ye&&!N&&(s.depthMask(ye),K=ye)},setFunc:function(ye){if(_e&&(ye=Jb[ye]),ne!==ye){switch(ye){case oc:s.depthFunc(s.NEVER);break;case cc:s.depthFunc(s.ALWAYS);break;case lc:s.depthFunc(s.LESS);break;case Fs:s.depthFunc(s.LEQUAL);break;case hc:s.depthFunc(s.EQUAL);break;case uc:s.depthFunc(s.GEQUAL);break;case dc:s.depthFunc(s.GREATER);break;case fc:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ne=ye}},setLocked:function(ye){N=ye},setClear:function(ye){Se!==ye&&(_e&&(ye=1-ye),s.clearDepth(ye),Se=ye)},reset:function(){N=!1,K=null,ne=null,Se=null,_e=!1}}}function i(){let N=!1,_e=null,K=null,ne=null,Se=null,ye=null,He=null,bt=null,Nt=null;return{setTest:function(at){N||(at?re(s.STENCIL_TEST):pe(s.STENCIL_TEST))},setMask:function(at){_e!==at&&!N&&(s.stencilMask(at),_e=at)},setFunc:function(at,en,Ct){(K!==at||ne!==en||Se!==Ct)&&(s.stencilFunc(at,en,Ct),K=at,ne=en,Se=Ct)},setOp:function(at,en,Ct){(ye!==at||He!==en||bt!==Ct)&&(s.stencilOp(at,en,Ct),ye=at,He=en,bt=Ct)},setLocked:function(at){N=at},setClear:function(at){Nt!==at&&(s.clearStencil(at),Nt=at)},reset:function(){N=!1,_e=null,K=null,ne=null,Se=null,ye=null,He=null,bt=null,Nt=null}}}const r=new t,a=new n,o=new i,c=new WeakMap,l=new WeakMap;let h={},u={},d=new WeakMap,f=[],b=null,v=!1,g=null,p=null,x=null,_=null,m=null,L=null,T=null,A=new Le(0,0,0),D=0,S=!1,y=null,P=null,U=null,k=null,V=null;const $=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,Z=0;const W=s.getParameter(s.VERSION);W.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(W)[1]),H=Z>=1):W.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),H=Z>=2);let he=null,ie={};const ue=s.getParameter(s.SCISSOR_BOX),ve=s.getParameter(s.VIEWPORT),xe=new mt().fromArray(ue),J=new mt().fromArray(ve);function G(N,_e,K,ne){const Se=new Uint8Array(4),ye=s.createTexture();s.bindTexture(N,ye),s.texParameteri(N,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(N,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let He=0;He<K;He++)N===s.TEXTURE_3D||N===s.TEXTURE_2D_ARRAY?s.texImage3D(_e,0,s.RGBA,1,1,ne,0,s.RGBA,s.UNSIGNED_BYTE,Se):s.texImage2D(_e+He,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Se);return ye}const z={};z[s.TEXTURE_2D]=G(s.TEXTURE_2D,s.TEXTURE_2D,1),z[s.TEXTURE_CUBE_MAP]=G(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),z[s.TEXTURE_2D_ARRAY]=G(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),z[s.TEXTURE_3D]=G(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),re(s.DEPTH_TEST),a.setFunc(Fs),ae(!1),Ee(Wl),re(s.CULL_FACE),I(Ui);function re(N){h[N]!==!0&&(s.enable(N),h[N]=!0)}function pe(N){h[N]!==!1&&(s.disable(N),h[N]=!1)}function Ie(N,_e){return u[N]!==_e?(s.bindFramebuffer(N,_e),u[N]=_e,N===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=_e),N===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=_e),!0):!1}function Re(N,_e){let K=f,ne=!1;if(N){K=d.get(_e),K===void 0&&(K=[],d.set(_e,K));const Se=N.textures;if(K.length!==Se.length||K[0]!==s.COLOR_ATTACHMENT0){for(let ye=0,He=Se.length;ye<He;ye++)K[ye]=s.COLOR_ATTACHMENT0+ye;K.length=Se.length,ne=!0}}else K[0]!==s.BACK&&(K[0]=s.BACK,ne=!0);ne&&s.drawBuffers(K)}function Ke(N){return b!==N?(s.useProgram(N),b=N,!0):!1}const Q={[Zi]:s.FUNC_ADD,[Zd]:s.FUNC_SUBTRACT,[Qd]:s.FUNC_REVERSE_SUBTRACT};Q[ef]=s.MIN,Q[tf]=s.MAX;const oe={[nf]:s.ZERO,[sf]:s.ONE,[rf]:s.SRC_COLOR,[rc]:s.SRC_ALPHA,[uf]:s.SRC_ALPHA_SATURATE,[lf]:s.DST_COLOR,[of]:s.DST_ALPHA,[af]:s.ONE_MINUS_SRC_COLOR,[ac]:s.ONE_MINUS_SRC_ALPHA,[hf]:s.ONE_MINUS_DST_COLOR,[cf]:s.ONE_MINUS_DST_ALPHA,[df]:s.CONSTANT_COLOR,[ff]:s.ONE_MINUS_CONSTANT_COLOR,[pf]:s.CONSTANT_ALPHA,[mf]:s.ONE_MINUS_CONSTANT_ALPHA};function I(N,_e,K,ne,Se,ye,He,bt,Nt,at){if(N===Ui){v===!0&&(pe(s.BLEND),v=!1);return}if(v===!1&&(re(s.BLEND),v=!0),N!==Jd){if(N!==g||at!==S){if((p!==Zi||m!==Zi)&&(s.blendEquation(s.FUNC_ADD),p=Zi,m=Zi),at)switch(N){case Ls:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Us:s.blendFunc(s.ONE,s.ONE);break;case Xl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case jl:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case Ls:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Us:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Xl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case jl:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}x=null,_=null,L=null,T=null,A.set(0,0,0),D=0,g=N,S=at}return}Se=Se||_e,ye=ye||K,He=He||ne,(_e!==p||Se!==m)&&(s.blendEquationSeparate(Q[_e],Q[Se]),p=_e,m=Se),(K!==x||ne!==_||ye!==L||He!==T)&&(s.blendFuncSeparate(oe[K],oe[ne],oe[ye],oe[He]),x=K,_=ne,L=ye,T=He),(bt.equals(A)===!1||Nt!==D)&&(s.blendColor(bt.r,bt.g,bt.b,Nt),A.copy(bt),D=Nt),g=N,S=!1}function Fe(N,_e){N.side===Zt?pe(s.CULL_FACE):re(s.CULL_FACE);let K=N.side===Qt;_e&&(K=!K),ae(K),N.blending===Ls&&N.transparent===!1?I(Ui):I(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const ne=N.stencilWrite;o.setTest(ne),ne&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),De(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?re(s.SAMPLE_ALPHA_TO_COVERAGE):pe(s.SAMPLE_ALPHA_TO_COVERAGE)}function ae(N){y!==N&&(N?s.frontFace(s.CW):s.frontFace(s.CCW),y=N)}function Ee(N){N!==Yd?(re(s.CULL_FACE),N!==P&&(N===Wl?s.cullFace(s.BACK):N===Kd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):pe(s.CULL_FACE),P=N}function ge(N){N!==U&&(H&&s.lineWidth(N),U=N)}function De(N,_e,K){N?(re(s.POLYGON_OFFSET_FILL),(k!==_e||V!==K)&&(s.polygonOffset(_e,K),k=_e,V=K)):pe(s.POLYGON_OFFSET_FILL)}function Pe(N){N?re(s.SCISSOR_TEST):pe(s.SCISSOR_TEST)}function R(N){N===void 0&&(N=s.TEXTURE0+$-1),he!==N&&(s.activeTexture(N),he=N)}function M(N,_e,K){K===void 0&&(he===null?K=s.TEXTURE0+$-1:K=he);let ne=ie[K];ne===void 0&&(ne={type:void 0,texture:void 0},ie[K]=ne),(ne.type!==N||ne.texture!==_e)&&(he!==K&&(s.activeTexture(K),he=K),s.bindTexture(N,_e||z[N]),ne.type=N,ne.texture=_e)}function B(){const N=ie[he];N!==void 0&&N.type!==void 0&&(s.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function ee(){try{s.compressedTexImage2D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function se(){try{s.compressedTexImage3D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function te(){try{s.texSubImage2D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ue(){try{s.texSubImage3D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function be(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ce(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function it(){try{s.texStorage2D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ce(){try{s.texStorage3D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Me(){try{s.texImage2D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Xe(){try{s.texImage3D.apply(s,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function je(N){xe.equals(N)===!1&&(s.scissor(N.x,N.y,N.z,N.w),xe.copy(N))}function Te(N){J.equals(N)===!1&&(s.viewport(N.x,N.y,N.z,N.w),J.copy(N))}function tt(N,_e){let K=l.get(_e);K===void 0&&(K=new WeakMap,l.set(_e,K));let ne=K.get(N);ne===void 0&&(ne=s.getUniformBlockIndex(_e,N.name),K.set(N,ne))}function Ze(N,_e){const ne=l.get(_e).get(N);c.get(_e)!==ne&&(s.uniformBlockBinding(_e,ne,N.__bindingPointIndex),c.set(_e,ne))}function ft(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},he=null,ie={},u={},d=new WeakMap,f=[],b=null,v=!1,g=null,p=null,x=null,_=null,m=null,L=null,T=null,A=new Le(0,0,0),D=0,S=!1,y=null,P=null,U=null,k=null,V=null,xe.set(0,0,s.canvas.width,s.canvas.height),J.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:re,disable:pe,bindFramebuffer:Ie,drawBuffers:Re,useProgram:Ke,setBlending:I,setMaterial:Fe,setFlipSided:ae,setCullFace:Ee,setLineWidth:ge,setPolygonOffset:De,setScissorTest:Pe,activeTexture:R,bindTexture:M,unbindTexture:B,compressedTexImage2D:ee,compressedTexImage3D:se,texImage2D:Me,texImage3D:Xe,updateUBOMapping:tt,uniformBlockBinding:Ze,texStorage2D:it,texStorage3D:ce,texSubImage2D:te,texSubImage3D:Ue,compressedTexSubImage2D:be,compressedTexSubImage3D:Ce,scissor:je,viewport:Te,reset:ft}}function Wh(s,e,t,n){const i=Qb(n);switch(t){case Gu:return s*e;case Vu:return s*e;case Wu:return s*e*2;case al:return s*e/i.components*i.byteLength;case ol:return s*e/i.components*i.byteLength;case Xu:return s*e*2/i.components*i.byteLength;case cl:return s*e*2/i.components*i.byteLength;case Hu:return s*e*3/i.components*i.byteLength;case Sn:return s*e*4/i.components*i.byteLength;case ll:return s*e*4/i.components*i.byteLength;case Ea:case Ta:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Aa:case Ra:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case bc:case xc:return Math.max(s,16)*Math.max(e,8)/4;case gc:case vc:return Math.max(s,8)*Math.max(e,8)/2;case _c:case yc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Mc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Sc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case wc:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Ec:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Tc:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Ac:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Rc:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Cc:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Pc:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Lc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Ic:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Dc:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Nc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Uc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Fc:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Ca:case Oc:case kc:return Math.ceil(s/4)*Math.ceil(e/4)*16;case ju:case Bc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case zc:case Gc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Qb(s){switch(s){case hi:case ku:return{byteLength:1,components:1};case Mr:case Bu:case Cr:return{byteLength:2,components:1};case sl:case rl:return{byteLength:2,components:4};case ns:case il:case Nn:return{byteLength:4,components:1};case zu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function ev(s,e,t,n,i,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new fe,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(R,M){return f?new OffscreenCanvas(R,M):Er("canvas")}function v(R,M,B){let ee=1;const se=Pe(R);if((se.width>B||se.height>B)&&(ee=B/Math.max(se.width,se.height)),ee<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const te=Math.floor(ee*se.width),Ue=Math.floor(ee*se.height);u===void 0&&(u=b(te,Ue));const be=M?b(te,Ue):u;return be.width=te,be.height=Ue,be.getContext("2d").drawImage(R,0,0,te,Ue),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+se.width+"x"+se.height+") to ("+te+"x"+Ue+")."),be}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+se.width+"x"+se.height+")."),R;return R}function g(R){return R.generateMipmaps}function p(R){s.generateMipmap(R)}function x(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function _(R,M,B,ee,se=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let te=M;if(M===s.RED&&(B===s.FLOAT&&(te=s.R32F),B===s.HALF_FLOAT&&(te=s.R16F),B===s.UNSIGNED_BYTE&&(te=s.R8)),M===s.RED_INTEGER&&(B===s.UNSIGNED_BYTE&&(te=s.R8UI),B===s.UNSIGNED_SHORT&&(te=s.R16UI),B===s.UNSIGNED_INT&&(te=s.R32UI),B===s.BYTE&&(te=s.R8I),B===s.SHORT&&(te=s.R16I),B===s.INT&&(te=s.R32I)),M===s.RG&&(B===s.FLOAT&&(te=s.RG32F),B===s.HALF_FLOAT&&(te=s.RG16F),B===s.UNSIGNED_BYTE&&(te=s.RG8)),M===s.RG_INTEGER&&(B===s.UNSIGNED_BYTE&&(te=s.RG8UI),B===s.UNSIGNED_SHORT&&(te=s.RG16UI),B===s.UNSIGNED_INT&&(te=s.RG32UI),B===s.BYTE&&(te=s.RG8I),B===s.SHORT&&(te=s.RG16I),B===s.INT&&(te=s.RG32I)),M===s.RGB_INTEGER&&(B===s.UNSIGNED_BYTE&&(te=s.RGB8UI),B===s.UNSIGNED_SHORT&&(te=s.RGB16UI),B===s.UNSIGNED_INT&&(te=s.RGB32UI),B===s.BYTE&&(te=s.RGB8I),B===s.SHORT&&(te=s.RGB16I),B===s.INT&&(te=s.RGB32I)),M===s.RGBA_INTEGER&&(B===s.UNSIGNED_BYTE&&(te=s.RGBA8UI),B===s.UNSIGNED_SHORT&&(te=s.RGBA16UI),B===s.UNSIGNED_INT&&(te=s.RGBA32UI),B===s.BYTE&&(te=s.RGBA8I),B===s.SHORT&&(te=s.RGBA16I),B===s.INT&&(te=s.RGBA32I)),M===s.RGB&&B===s.UNSIGNED_INT_5_9_9_9_REV&&(te=s.RGB9_E5),M===s.RGBA){const Ue=se?Ba:ct.getTransfer(ee);B===s.FLOAT&&(te=s.RGBA32F),B===s.HALF_FLOAT&&(te=s.RGBA16F),B===s.UNSIGNED_BYTE&&(te=Ue===St?s.SRGB8_ALPHA8:s.RGBA8),B===s.UNSIGNED_SHORT_4_4_4_4&&(te=s.RGBA4),B===s.UNSIGNED_SHORT_5_5_5_1&&(te=s.RGB5_A1)}return(te===s.R16F||te===s.R32F||te===s.RG16F||te===s.RG32F||te===s.RGBA16F||te===s.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function m(R,M){let B;return R?M===null||M===ns||M===Bs?B=s.DEPTH24_STENCIL8:M===Nn?B=s.DEPTH32F_STENCIL8:M===Mr&&(B=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===ns||M===Bs?B=s.DEPTH_COMPONENT24:M===Nn?B=s.DEPTH_COMPONENT32F:M===Mr&&(B=s.DEPTH_COMPONENT16),B}function L(R,M){return g(R)===!0||R.isFramebufferTexture&&R.minFilter!==an&&R.minFilter!==gn?Math.log2(Math.max(M.width,M.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?M.mipmaps.length:1}function T(R){const M=R.target;M.removeEventListener("dispose",T),D(M),M.isVideoTexture&&h.delete(M)}function A(R){const M=R.target;M.removeEventListener("dispose",A),y(M)}function D(R){const M=n.get(R);if(M.__webglInit===void 0)return;const B=R.source,ee=d.get(B);if(ee){const se=ee[M.__cacheKey];se.usedTimes--,se.usedTimes===0&&S(R),Object.keys(ee).length===0&&d.delete(B)}n.remove(R)}function S(R){const M=n.get(R);s.deleteTexture(M.__webglTexture);const B=R.source,ee=d.get(B);delete ee[M.__cacheKey],a.memory.textures--}function y(R){const M=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(M.__webglFramebuffer[ee]))for(let se=0;se<M.__webglFramebuffer[ee].length;se++)s.deleteFramebuffer(M.__webglFramebuffer[ee][se]);else s.deleteFramebuffer(M.__webglFramebuffer[ee]);M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer[ee])}else{if(Array.isArray(M.__webglFramebuffer))for(let ee=0;ee<M.__webglFramebuffer.length;ee++)s.deleteFramebuffer(M.__webglFramebuffer[ee]);else s.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&s.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let ee=0;ee<M.__webglColorRenderbuffer.length;ee++)M.__webglColorRenderbuffer[ee]&&s.deleteRenderbuffer(M.__webglColorRenderbuffer[ee]);M.__webglDepthRenderbuffer&&s.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const B=R.textures;for(let ee=0,se=B.length;ee<se;ee++){const te=n.get(B[ee]);te.__webglTexture&&(s.deleteTexture(te.__webglTexture),a.memory.textures--),n.remove(B[ee])}n.remove(R)}let P=0;function U(){P=0}function k(){const R=P;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),P+=1,R}function V(R){const M=[];return M.push(R.wrapS),M.push(R.wrapT),M.push(R.wrapR||0),M.push(R.magFilter),M.push(R.minFilter),M.push(R.anisotropy),M.push(R.internalFormat),M.push(R.format),M.push(R.type),M.push(R.generateMipmaps),M.push(R.premultiplyAlpha),M.push(R.flipY),M.push(R.unpackAlignment),M.push(R.colorSpace),M.join()}function $(R,M){const B=n.get(R);if(R.isVideoTexture&&ge(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){const ee=R.image;if(ee===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ee.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(B,R,M);return}}t.bindTexture(s.TEXTURE_2D,B.__webglTexture,s.TEXTURE0+M)}function H(R,M){const B=n.get(R);if(R.version>0&&B.__version!==R.version){J(B,R,M);return}t.bindTexture(s.TEXTURE_2D_ARRAY,B.__webglTexture,s.TEXTURE0+M)}function Z(R,M){const B=n.get(R);if(R.version>0&&B.__version!==R.version){J(B,R,M);return}t.bindTexture(s.TEXTURE_3D,B.__webglTexture,s.TEXTURE0+M)}function W(R,M){const B=n.get(R);if(R.version>0&&B.__version!==R.version){G(B,R,M);return}t.bindTexture(s.TEXTURE_CUBE_MAP,B.__webglTexture,s.TEXTURE0+M)}const he={[ts]:s.REPEAT,[Li]:s.CLAMP_TO_EDGE,[Ia]:s.MIRRORED_REPEAT},ie={[an]:s.NEAREST,[Ou]:s.NEAREST_MIPMAP_NEAREST,[dr]:s.NEAREST_MIPMAP_LINEAR,[gn]:s.LINEAR,[wa]:s.LINEAR_MIPMAP_NEAREST,[ai]:s.LINEAR_MIPMAP_LINEAR},ue={[Pf]:s.NEVER,[Ff]:s.ALWAYS,[Lf]:s.LESS,[Yu]:s.LEQUAL,[If]:s.EQUAL,[Uf]:s.GEQUAL,[Df]:s.GREATER,[Nf]:s.NOTEQUAL};function ve(R,M){if(M.type===Nn&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===gn||M.magFilter===wa||M.magFilter===dr||M.magFilter===ai||M.minFilter===gn||M.minFilter===wa||M.minFilter===dr||M.minFilter===ai)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,he[M.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,he[M.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,he[M.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,ie[M.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,ie[M.minFilter]),M.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,ue[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===an||M.minFilter!==dr&&M.minFilter!==ai||M.type===Nn&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,i.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function xe(R,M){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,M.addEventListener("dispose",T));const ee=M.source;let se=d.get(ee);se===void 0&&(se={},d.set(ee,se));const te=V(M);if(te!==R.__cacheKey){se[te]===void 0&&(se[te]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,B=!0),se[te].usedTimes++;const Ue=se[R.__cacheKey];Ue!==void 0&&(se[R.__cacheKey].usedTimes--,Ue.usedTimes===0&&S(M)),R.__cacheKey=te,R.__webglTexture=se[te].texture}return B}function J(R,M,B){let ee=s.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(ee=s.TEXTURE_2D_ARRAY),M.isData3DTexture&&(ee=s.TEXTURE_3D);const se=xe(R,M),te=M.source;t.bindTexture(ee,R.__webglTexture,s.TEXTURE0+B);const Ue=n.get(te);if(te.version!==Ue.__version||se===!0){t.activeTexture(s.TEXTURE0+B);const be=ct.getPrimaries(ct.workingColorSpace),Ce=M.colorSpace===Pi?null:ct.getPrimaries(M.colorSpace),it=M.colorSpace===Pi||be===Ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,it);let ce=v(M.image,!1,i.maxTextureSize);ce=De(M,ce);const Me=r.convert(M.format,M.colorSpace),Xe=r.convert(M.type);let je=_(M.internalFormat,Me,Xe,M.colorSpace,M.isVideoTexture);ve(ee,M);let Te;const tt=M.mipmaps,Ze=M.isVideoTexture!==!0,ft=Ue.__version===void 0||se===!0,N=te.dataReady,_e=L(M,ce);if(M.isDepthTexture)je=m(M.format===zs,M.type),ft&&(Ze?t.texStorage2D(s.TEXTURE_2D,1,je,ce.width,ce.height):t.texImage2D(s.TEXTURE_2D,0,je,ce.width,ce.height,0,Me,Xe,null));else if(M.isDataTexture)if(tt.length>0){Ze&&ft&&t.texStorage2D(s.TEXTURE_2D,_e,je,tt[0].width,tt[0].height);for(let K=0,ne=tt.length;K<ne;K++)Te=tt[K],Ze?N&&t.texSubImage2D(s.TEXTURE_2D,K,0,0,Te.width,Te.height,Me,Xe,Te.data):t.texImage2D(s.TEXTURE_2D,K,je,Te.width,Te.height,0,Me,Xe,Te.data);M.generateMipmaps=!1}else Ze?(ft&&t.texStorage2D(s.TEXTURE_2D,_e,je,ce.width,ce.height),N&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ce.width,ce.height,Me,Xe,ce.data)):t.texImage2D(s.TEXTURE_2D,0,je,ce.width,ce.height,0,Me,Xe,ce.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ze&&ft&&t.texStorage3D(s.TEXTURE_2D_ARRAY,_e,je,tt[0].width,tt[0].height,ce.depth);for(let K=0,ne=tt.length;K<ne;K++)if(Te=tt[K],M.format!==Sn)if(Me!==null)if(Ze){if(N)if(M.layerUpdates.size>0){const Se=Wh(Te.width,Te.height,M.format,M.type);for(const ye of M.layerUpdates){const He=Te.data.subarray(ye*Se/Te.data.BYTES_PER_ELEMENT,(ye+1)*Se/Te.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,K,0,0,ye,Te.width,Te.height,1,Me,He)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,K,0,0,0,Te.width,Te.height,ce.depth,Me,Te.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,K,je,Te.width,Te.height,ce.depth,0,Te.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ze?N&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,K,0,0,0,Te.width,Te.height,ce.depth,Me,Xe,Te.data):t.texImage3D(s.TEXTURE_2D_ARRAY,K,je,Te.width,Te.height,ce.depth,0,Me,Xe,Te.data)}else{Ze&&ft&&t.texStorage2D(s.TEXTURE_2D,_e,je,tt[0].width,tt[0].height);for(let K=0,ne=tt.length;K<ne;K++)Te=tt[K],M.format!==Sn?Me!==null?Ze?N&&t.compressedTexSubImage2D(s.TEXTURE_2D,K,0,0,Te.width,Te.height,Me,Te.data):t.compressedTexImage2D(s.TEXTURE_2D,K,je,Te.width,Te.height,0,Te.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ze?N&&t.texSubImage2D(s.TEXTURE_2D,K,0,0,Te.width,Te.height,Me,Xe,Te.data):t.texImage2D(s.TEXTURE_2D,K,je,Te.width,Te.height,0,Me,Xe,Te.data)}else if(M.isDataArrayTexture)if(Ze){if(ft&&t.texStorage3D(s.TEXTURE_2D_ARRAY,_e,je,ce.width,ce.height,ce.depth),N)if(M.layerUpdates.size>0){const K=Wh(ce.width,ce.height,M.format,M.type);for(const ne of M.layerUpdates){const Se=ce.data.subarray(ne*K/ce.data.BYTES_PER_ELEMENT,(ne+1)*K/ce.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,ne,ce.width,ce.height,1,Me,Xe,Se)}M.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ce.width,ce.height,ce.depth,Me,Xe,ce.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,je,ce.width,ce.height,ce.depth,0,Me,Xe,ce.data);else if(M.isData3DTexture)Ze?(ft&&t.texStorage3D(s.TEXTURE_3D,_e,je,ce.width,ce.height,ce.depth),N&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ce.width,ce.height,ce.depth,Me,Xe,ce.data)):t.texImage3D(s.TEXTURE_3D,0,je,ce.width,ce.height,ce.depth,0,Me,Xe,ce.data);else if(M.isFramebufferTexture){if(ft)if(Ze)t.texStorage2D(s.TEXTURE_2D,_e,je,ce.width,ce.height);else{let K=ce.width,ne=ce.height;for(let Se=0;Se<_e;Se++)t.texImage2D(s.TEXTURE_2D,Se,je,K,ne,0,Me,Xe,null),K>>=1,ne>>=1}}else if(tt.length>0){if(Ze&&ft){const K=Pe(tt[0]);t.texStorage2D(s.TEXTURE_2D,_e,je,K.width,K.height)}for(let K=0,ne=tt.length;K<ne;K++)Te=tt[K],Ze?N&&t.texSubImage2D(s.TEXTURE_2D,K,0,0,Me,Xe,Te):t.texImage2D(s.TEXTURE_2D,K,je,Me,Xe,Te);M.generateMipmaps=!1}else if(Ze){if(ft){const K=Pe(ce);t.texStorage2D(s.TEXTURE_2D,_e,je,K.width,K.height)}N&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Me,Xe,ce)}else t.texImage2D(s.TEXTURE_2D,0,je,Me,Xe,ce);g(M)&&p(ee),Ue.__version=te.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function G(R,M,B){if(M.image.length!==6)return;const ee=xe(R,M),se=M.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+B);const te=n.get(se);if(se.version!==te.__version||ee===!0){t.activeTexture(s.TEXTURE0+B);const Ue=ct.getPrimaries(ct.workingColorSpace),be=M.colorSpace===Pi?null:ct.getPrimaries(M.colorSpace),Ce=M.colorSpace===Pi||Ue===be?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);const it=M.isCompressedTexture||M.image[0].isCompressedTexture,ce=M.image[0]&&M.image[0].isDataTexture,Me=[];for(let ne=0;ne<6;ne++)!it&&!ce?Me[ne]=v(M.image[ne],!0,i.maxCubemapSize):Me[ne]=ce?M.image[ne].image:M.image[ne],Me[ne]=De(M,Me[ne]);const Xe=Me[0],je=r.convert(M.format,M.colorSpace),Te=r.convert(M.type),tt=_(M.internalFormat,je,Te,M.colorSpace),Ze=M.isVideoTexture!==!0,ft=te.__version===void 0||ee===!0,N=se.dataReady;let _e=L(M,Xe);ve(s.TEXTURE_CUBE_MAP,M);let K;if(it){Ze&&ft&&t.texStorage2D(s.TEXTURE_CUBE_MAP,_e,tt,Xe.width,Xe.height);for(let ne=0;ne<6;ne++){K=Me[ne].mipmaps;for(let Se=0;Se<K.length;Se++){const ye=K[Se];M.format!==Sn?je!==null?Ze?N&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se,0,0,ye.width,ye.height,je,ye.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se,tt,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ze?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se,0,0,ye.width,ye.height,je,Te,ye.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se,tt,ye.width,ye.height,0,je,Te,ye.data)}}}else{if(K=M.mipmaps,Ze&&ft){K.length>0&&_e++;const ne=Pe(Me[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,_e,tt,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(ce){Ze?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Me[ne].width,Me[ne].height,je,Te,Me[ne].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,tt,Me[ne].width,Me[ne].height,0,je,Te,Me[ne].data);for(let Se=0;Se<K.length;Se++){const He=K[Se].image[ne].image;Ze?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se+1,0,0,He.width,He.height,je,Te,He.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se+1,tt,He.width,He.height,0,je,Te,He.data)}}else{Ze?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,je,Te,Me[ne]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,tt,je,Te,Me[ne]);for(let Se=0;Se<K.length;Se++){const ye=K[Se];Ze?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se+1,0,0,je,Te,ye.image[ne]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Se+1,tt,je,Te,ye.image[ne])}}}g(M)&&p(s.TEXTURE_CUBE_MAP),te.__version=se.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function z(R,M,B,ee,se,te){const Ue=r.convert(B.format,B.colorSpace),be=r.convert(B.type),Ce=_(B.internalFormat,Ue,be,B.colorSpace),it=n.get(M),ce=n.get(B);if(ce.__renderTarget=M,!it.__hasExternalTextures){const Me=Math.max(1,M.width>>te),Xe=Math.max(1,M.height>>te);se===s.TEXTURE_3D||se===s.TEXTURE_2D_ARRAY?t.texImage3D(se,te,Ce,Me,Xe,M.depth,0,Ue,be,null):t.texImage2D(se,te,Ce,Me,Xe,0,Ue,be,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),Ee(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ee,se,ce.__webglTexture,0,ae(M)):(se===s.TEXTURE_2D||se>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&se<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,ee,se,ce.__webglTexture,te),t.bindFramebuffer(s.FRAMEBUFFER,null)}function re(R,M,B){if(s.bindRenderbuffer(s.RENDERBUFFER,R),M.depthBuffer){const ee=M.depthTexture,se=ee&&ee.isDepthTexture?ee.type:null,te=m(M.stencilBuffer,se),Ue=M.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,be=ae(M);Ee(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,be,te,M.width,M.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,be,te,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,te,M.width,M.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ue,s.RENDERBUFFER,R)}else{const ee=M.textures;for(let se=0;se<ee.length;se++){const te=ee[se],Ue=r.convert(te.format,te.colorSpace),be=r.convert(te.type),Ce=_(te.internalFormat,Ue,be,te.colorSpace),it=ae(M);B&&Ee(M)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,it,Ce,M.width,M.height):Ee(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,it,Ce,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,Ce,M.width,M.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function pe(R,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ee=n.get(M.depthTexture);ee.__renderTarget=M,(!ee.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),$(M.depthTexture,0);const se=ee.__webglTexture,te=ae(M);if(M.depthTexture.format===Is)Ee(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,se,0,te):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,se,0);else if(M.depthTexture.format===zs)Ee(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,se,0,te):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,se,0);else throw new Error("Unknown depthTexture format")}function Ie(R){const M=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==R.depthTexture){const ee=R.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),ee){const se=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,ee.removeEventListener("dispose",se)};ee.addEventListener("dispose",se),M.__depthDisposeCallback=se}M.__boundDepthTexture=ee}if(R.depthTexture&&!M.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");pe(M.__webglFramebuffer,R)}else if(B){M.__webglDepthbuffer=[];for(let ee=0;ee<6;ee++)if(t.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[ee]),M.__webglDepthbuffer[ee]===void 0)M.__webglDepthbuffer[ee]=s.createRenderbuffer(),re(M.__webglDepthbuffer[ee],R,!1);else{const se=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,te=M.__webglDepthbuffer[ee];s.bindRenderbuffer(s.RENDERBUFFER,te),s.framebufferRenderbuffer(s.FRAMEBUFFER,se,s.RENDERBUFFER,te)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=s.createRenderbuffer(),re(M.__webglDepthbuffer,R,!1);else{const ee=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,se=M.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,se),s.framebufferRenderbuffer(s.FRAMEBUFFER,ee,s.RENDERBUFFER,se)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Re(R,M,B){const ee=n.get(R);M!==void 0&&z(ee.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),B!==void 0&&Ie(R)}function Ke(R){const M=R.texture,B=n.get(R),ee=n.get(M);R.addEventListener("dispose",A);const se=R.textures,te=R.isWebGLCubeRenderTarget===!0,Ue=se.length>1;if(Ue||(ee.__webglTexture===void 0&&(ee.__webglTexture=s.createTexture()),ee.__version=M.version,a.memory.textures++),te){B.__webglFramebuffer=[];for(let be=0;be<6;be++)if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer[be]=[];for(let Ce=0;Ce<M.mipmaps.length;Ce++)B.__webglFramebuffer[be][Ce]=s.createFramebuffer()}else B.__webglFramebuffer[be]=s.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer=[];for(let be=0;be<M.mipmaps.length;be++)B.__webglFramebuffer[be]=s.createFramebuffer()}else B.__webglFramebuffer=s.createFramebuffer();if(Ue)for(let be=0,Ce=se.length;be<Ce;be++){const it=n.get(se[be]);it.__webglTexture===void 0&&(it.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&Ee(R)===!1){B.__webglMultisampledFramebuffer=s.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let be=0;be<se.length;be++){const Ce=se[be];B.__webglColorRenderbuffer[be]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,B.__webglColorRenderbuffer[be]);const it=r.convert(Ce.format,Ce.colorSpace),ce=r.convert(Ce.type),Me=_(Ce.internalFormat,it,ce,Ce.colorSpace,R.isXRRenderTarget===!0),Xe=ae(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Xe,Me,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+be,s.RENDERBUFFER,B.__webglColorRenderbuffer[be])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=s.createRenderbuffer(),re(B.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(te){t.bindTexture(s.TEXTURE_CUBE_MAP,ee.__webglTexture),ve(s.TEXTURE_CUBE_MAP,M);for(let be=0;be<6;be++)if(M.mipmaps&&M.mipmaps.length>0)for(let Ce=0;Ce<M.mipmaps.length;Ce++)z(B.__webglFramebuffer[be][Ce],R,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+be,Ce);else z(B.__webglFramebuffer[be],R,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+be,0);g(M)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ue){for(let be=0,Ce=se.length;be<Ce;be++){const it=se[be],ce=n.get(it);t.bindTexture(s.TEXTURE_2D,ce.__webglTexture),ve(s.TEXTURE_2D,it),z(B.__webglFramebuffer,R,it,s.COLOR_ATTACHMENT0+be,s.TEXTURE_2D,0),g(it)&&p(s.TEXTURE_2D)}t.unbindTexture()}else{let be=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(be=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(be,ee.__webglTexture),ve(be,M),M.mipmaps&&M.mipmaps.length>0)for(let Ce=0;Ce<M.mipmaps.length;Ce++)z(B.__webglFramebuffer[Ce],R,M,s.COLOR_ATTACHMENT0,be,Ce);else z(B.__webglFramebuffer,R,M,s.COLOR_ATTACHMENT0,be,0);g(M)&&p(be),t.unbindTexture()}R.depthBuffer&&Ie(R)}function Q(R){const M=R.textures;for(let B=0,ee=M.length;B<ee;B++){const se=M[B];if(g(se)){const te=x(R),Ue=n.get(se).__webglTexture;t.bindTexture(te,Ue),p(te),t.unbindTexture()}}}const oe=[],I=[];function Fe(R){if(R.samples>0){if(Ee(R)===!1){const M=R.textures,B=R.width,ee=R.height;let se=s.COLOR_BUFFER_BIT;const te=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ue=n.get(R),be=M.length>1;if(be)for(let Ce=0;Ce<M.length;Ce++)t.bindFramebuffer(s.FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ue.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ue.__webglFramebuffer);for(let Ce=0;Ce<M.length;Ce++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(se|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(se|=s.STENCIL_BUFFER_BIT)),be){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ue.__webglColorRenderbuffer[Ce]);const it=n.get(M[Ce]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,it,0)}s.blitFramebuffer(0,0,B,ee,0,0,B,ee,se,s.NEAREST),c===!0&&(oe.length=0,I.length=0,oe.push(s.COLOR_ATTACHMENT0+Ce),R.depthBuffer&&R.resolveDepthBuffer===!1&&(oe.push(te),I.push(te),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,I)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,oe))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),be)for(let Ce=0;Ce<M.length;Ce++){t.bindFramebuffer(s.FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,Ue.__webglColorRenderbuffer[Ce]);const it=n.get(M[Ce]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ue.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,it,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ue.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){const M=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[M])}}}function ae(R){return Math.min(i.maxSamples,R.samples)}function Ee(R){const M=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function ge(R){const M=a.render.frame;h.get(R)!==M&&(h.set(R,M),R.update())}function De(R,M){const B=R.colorSpace,ee=R.format,se=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==on&&B!==Pi&&(ct.getTransfer(B)===St?(ee!==Sn||se!==hi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),M}function Pe(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=U,this.setTexture2D=$,this.setTexture2DArray=H,this.setTexture3D=Z,this.setTextureCube=W,this.rebindTextures=Re,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=Q,this.updateMultisampleRenderTarget=Fe,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=z,this.useMultisampledRTT=Ee}function tv(s,e){function t(n,i=Pi){let r;const a=ct.getTransfer(i);if(n===hi)return s.UNSIGNED_BYTE;if(n===sl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===rl)return s.UNSIGNED_SHORT_5_5_5_1;if(n===zu)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===ku)return s.BYTE;if(n===Bu)return s.SHORT;if(n===Mr)return s.UNSIGNED_SHORT;if(n===il)return s.INT;if(n===ns)return s.UNSIGNED_INT;if(n===Nn)return s.FLOAT;if(n===Cr)return s.HALF_FLOAT;if(n===Gu)return s.ALPHA;if(n===Hu)return s.RGB;if(n===Sn)return s.RGBA;if(n===Vu)return s.LUMINANCE;if(n===Wu)return s.LUMINANCE_ALPHA;if(n===Is)return s.DEPTH_COMPONENT;if(n===zs)return s.DEPTH_STENCIL;if(n===al)return s.RED;if(n===ol)return s.RED_INTEGER;if(n===Xu)return s.RG;if(n===cl)return s.RG_INTEGER;if(n===ll)return s.RGBA_INTEGER;if(n===Ea||n===Ta||n===Aa||n===Ra)if(a===St)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ea)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ta)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ea)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ta)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ra)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===gc||n===bc||n===vc||n===xc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===gc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===bc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===vc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===xc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===_c||n===yc||n===Mc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===_c||n===yc)return a===St?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Mc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Sc||n===wc||n===Ec||n===Tc||n===Ac||n===Rc||n===Cc||n===Pc||n===Lc||n===Ic||n===Dc||n===Nc||n===Uc||n===Fc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Sc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===wc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ec)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Tc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ac)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Rc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Cc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Pc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Lc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ic)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Dc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Nc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Uc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Fc)return a===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ca||n===Oc||n===kc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ca)return a===St?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===kc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ju||n===Bc||n===zc||n===Gc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ca)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Bc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===zc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Gc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Bs?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}class nv extends rn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class wt extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}}const iv={type:"move"};class ko{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const v of e.hand.values()){const g=t.getJointPose(v,n),p=this._getHandJoint(l,v);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,b=.005;l.inputState.pinching&&d>f+b?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-b&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(iv)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new wt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const sv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class av{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new jt,r=e.properties.get(i);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new dn({vertexShader:sv,fragmentShader:rv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ov extends js{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,b=null;const v=new av,g=t.getContextAttributes();let p=null,x=null;const _=[],m=[],L=new fe;let T=null;const A=new rn;A.viewport=new mt;const D=new rn;D.viewport=new mt;const S=[A,D],y=new nv;let P=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let G=_[J];return G===void 0&&(G=new ko,_[J]=G),G.getTargetRaySpace()},this.getControllerGrip=function(J){let G=_[J];return G===void 0&&(G=new ko,_[J]=G),G.getGripSpace()},this.getHand=function(J){let G=_[J];return G===void 0&&(G=new ko,_[J]=G),G.getHandSpace()};function k(J){const G=m.indexOf(J.inputSource);if(G===-1)return;const z=_[G];z!==void 0&&(z.update(J.inputSource,J.frame,l||a),z.dispatchEvent({type:J.type,data:J.inputSource}))}function V(){i.removeEventListener("select",k),i.removeEventListener("selectstart",k),i.removeEventListener("selectend",k),i.removeEventListener("squeeze",k),i.removeEventListener("squeezestart",k),i.removeEventListener("squeezeend",k),i.removeEventListener("end",V),i.removeEventListener("inputsourceschange",$);for(let J=0;J<_.length;J++){const G=m[J];G!==null&&(m[J]=null,_[J].disconnect(G))}P=null,U=null,v.reset(),e.setRenderTarget(p),f=null,d=null,u=null,i=null,x=null,xe.stop(),n.isPresenting=!1,e.setPixelRatio(T),e.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(J){l=J},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return b},this.getSession=function(){return i},this.setSession=async function(J){if(i=J,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",k),i.addEventListener("selectstart",k),i.addEventListener("selectend",k),i.addEventListener("squeeze",k),i.addEventListener("squeezestart",k),i.addEventListener("squeezeend",k),i.addEventListener("end",V),i.addEventListener("inputsourceschange",$),g.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(L),i.renderState.layers===void 0){const G={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,G),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new is(f.framebufferWidth,f.framebufferHeight,{format:Sn,type:hi,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let G=null,z=null,re=null;g.depth&&(re=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,G=g.stencil?zs:Is,z=g.stencil?Bs:ns);const pe={colorFormat:t.RGBA8,depthFormat:re,scaleFactor:r};u=new XRWebGLBinding(i,t),d=u.createProjectionLayer(pe),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new is(d.textureWidth,d.textureHeight,{format:Sn,type:hi,depthTexture:new rd(d.textureWidth,d.textureHeight,z,void 0,void 0,void 0,void 0,void 0,void 0,G),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await i.requestReferenceSpace(o),xe.setContext(i),xe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function $(J){for(let G=0;G<J.removed.length;G++){const z=J.removed[G],re=m.indexOf(z);re>=0&&(m[re]=null,_[re].disconnect(z))}for(let G=0;G<J.added.length;G++){const z=J.added[G];let re=m.indexOf(z);if(re===-1){for(let Ie=0;Ie<_.length;Ie++)if(Ie>=m.length){m.push(z),re=Ie;break}else if(m[Ie]===null){m[Ie]=z,re=Ie;break}if(re===-1)break}const pe=_[re];pe&&pe.connect(z)}}const H=new C,Z=new C;function W(J,G,z){H.setFromMatrixPosition(G.matrixWorld),Z.setFromMatrixPosition(z.matrixWorld);const re=H.distanceTo(Z),pe=G.projectionMatrix.elements,Ie=z.projectionMatrix.elements,Re=pe[14]/(pe[10]-1),Ke=pe[14]/(pe[10]+1),Q=(pe[9]+1)/pe[5],oe=(pe[9]-1)/pe[5],I=(pe[8]-1)/pe[0],Fe=(Ie[8]+1)/Ie[0],ae=Re*I,Ee=Re*Fe,ge=re/(-I+Fe),De=ge*-I;if(G.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(De),J.translateZ(ge),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),pe[10]===-1)J.projectionMatrix.copy(G.projectionMatrix),J.projectionMatrixInverse.copy(G.projectionMatrixInverse);else{const Pe=Re+ge,R=Ke+ge,M=ae-De,B=Ee+(re-De),ee=Q*Ke/R*Pe,se=oe*Ke/R*Pe;J.projectionMatrix.makePerspective(M,B,ee,se,Pe,R),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function he(J,G){G===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(G.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(i===null)return;let G=J.near,z=J.far;v.texture!==null&&(v.depthNear>0&&(G=v.depthNear),v.depthFar>0&&(z=v.depthFar)),y.near=D.near=A.near=G,y.far=D.far=A.far=z,(P!==y.near||U!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),P=y.near,U=y.far),A.layers.mask=J.layers.mask|2,D.layers.mask=J.layers.mask|4,y.layers.mask=A.layers.mask|D.layers.mask;const re=J.parent,pe=y.cameras;he(y,re);for(let Ie=0;Ie<pe.length;Ie++)he(pe[Ie],re);pe.length===2?W(y,A,D):y.projectionMatrix.copy(A.projectionMatrix),ie(J,y,re)};function ie(J,G,z){z===null?J.matrix.copy(G.matrixWorld):(J.matrix.copy(z.matrixWorld),J.matrix.invert(),J.matrix.multiply(G.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(G.projectionMatrix),J.projectionMatrixInverse.copy(G.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Gs*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(J){c=J,d!==null&&(d.fixedFoveation=J),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=J)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(y)};let ue=null;function ve(J,G){if(h=G.getViewerPose(l||a),b=G,h!==null){const z=h.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let re=!1;z.length!==y.cameras.length&&(y.cameras.length=0,re=!0);for(let Ie=0;Ie<z.length;Ie++){const Re=z[Ie];let Ke=null;if(f!==null)Ke=f.getViewport(Re);else{const oe=u.getViewSubImage(d,Re);Ke=oe.viewport,Ie===0&&(e.setRenderTargetTextures(x,oe.colorTexture,d.ignoreDepthValues?void 0:oe.depthStencilTexture),e.setRenderTarget(x))}let Q=S[Ie];Q===void 0&&(Q=new rn,Q.layers.enable(Ie),Q.viewport=new mt,S[Ie]=Q),Q.matrix.fromArray(Re.transform.matrix),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.projectionMatrix.fromArray(Re.projectionMatrix),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert(),Q.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),Ie===0&&(y.matrix.copy(Q.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),re===!0&&y.cameras.push(Q)}const pe=i.enabledFeatures;if(pe&&pe.includes("depth-sensing")){const Ie=u.getDepthInformation(z[0]);Ie&&Ie.isValid&&Ie.texture&&v.init(e,Ie,i.renderState)}}for(let z=0;z<_.length;z++){const re=m[z],pe=_[z];re!==null&&pe!==void 0&&pe.update(re,G,l||a)}ue&&ue(J,G),G.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:G}),b=null}const xe=new sd;xe.setAnimationLoop(ve),this.setAnimationLoop=function(J){ue=J},this.dispose=function(){}}}const Xi=new bn,cv=new Je;function lv(s,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,td(s)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function i(g,p,x,_,m){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),u(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p)):p.isMeshStandardMaterial?(r(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,m)):p.isMeshMatcapMaterial?(r(g,p),b(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),v(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?c(g,p,x,_):p.isSpriteMaterial?l(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Qt&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Qt&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const x=e.get(p),_=x.envMap,m=x.envMapRotation;_&&(g.envMap.value=_,Xi.copy(m),Xi.x*=-1,Xi.y*=-1,Xi.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Xi.y*=-1,Xi.z*=-1),g.envMapRotation.value.setFromMatrix4(cv.makeRotationFromEuler(Xi)),g.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function c(g,p,x,_){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*x,g.scale.value=_*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function l(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,x){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Qt&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function b(g,p){p.matcap&&(g.matcap.value=p.matcap)}function v(g,p){const x=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function hv(s,e,t,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,_){const m=_.program;n.uniformBlockBinding(x,m)}function l(x,_){let m=i[x.id];m===void 0&&(b(x),m=h(x),i[x.id]=m,x.addEventListener("dispose",g));const L=_.program;n.updateUBOMapping(x,L);const T=e.render.frame;r[x.id]!==T&&(d(x),r[x.id]=T)}function h(x){const _=u();x.__bindingPointIndex=_;const m=s.createBuffer(),L=x.__size,T=x.usage;return s.bindBuffer(s.UNIFORM_BUFFER,m),s.bufferData(s.UNIFORM_BUFFER,L,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,_,m),m}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const _=i[x.id],m=x.uniforms,L=x.__cache;s.bindBuffer(s.UNIFORM_BUFFER,_);for(let T=0,A=m.length;T<A;T++){const D=Array.isArray(m[T])?m[T]:[m[T]];for(let S=0,y=D.length;S<y;S++){const P=D[S];if(f(P,T,S,L)===!0){const U=P.__offset,k=Array.isArray(P.value)?P.value:[P.value];let V=0;for(let $=0;$<k.length;$++){const H=k[$],Z=v(H);typeof H=="number"||typeof H=="boolean"?(P.__data[0]=H,s.bufferSubData(s.UNIFORM_BUFFER,U+V,P.__data)):H.isMatrix3?(P.__data[0]=H.elements[0],P.__data[1]=H.elements[1],P.__data[2]=H.elements[2],P.__data[3]=0,P.__data[4]=H.elements[3],P.__data[5]=H.elements[4],P.__data[6]=H.elements[5],P.__data[7]=0,P.__data[8]=H.elements[6],P.__data[9]=H.elements[7],P.__data[10]=H.elements[8],P.__data[11]=0):(H.toArray(P.__data,V),V+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,U,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(x,_,m,L){const T=x.value,A=_+"_"+m;if(L[A]===void 0)return typeof T=="number"||typeof T=="boolean"?L[A]=T:L[A]=T.clone(),!0;{const D=L[A];if(typeof T=="number"||typeof T=="boolean"){if(D!==T)return L[A]=T,!0}else if(D.equals(T)===!1)return D.copy(T),!0}return!1}function b(x){const _=x.uniforms;let m=0;const L=16;for(let A=0,D=_.length;A<D;A++){const S=Array.isArray(_[A])?_[A]:[_[A]];for(let y=0,P=S.length;y<P;y++){const U=S[y],k=Array.isArray(U.value)?U.value:[U.value];for(let V=0,$=k.length;V<$;V++){const H=k[V],Z=v(H),W=m%L,he=W%Z.boundary,ie=W+he;m+=he,ie!==0&&L-ie<Z.storage&&(m+=L-ie),U.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=m,m+=Z.storage}}}const T=m%L;return T>0&&(m+=L-T),x.__size=m,x.__cache={},this}function v(x){const _={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(_.boundary=4,_.storage=4):x.isVector2?(_.boundary=8,_.storage=8):x.isVector3||x.isColor?(_.boundary=16,_.storage=12):x.isVector4?(_.boundary=16,_.storage=16):x.isMatrix3?(_.boundary=48,_.storage=48):x.isMatrix4?(_.boundary=64,_.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),_}function g(x){const _=x.target;_.removeEventListener("dispose",g);const m=a.indexOf(_.__bindingPointIndex);a.splice(m,1),s.deleteBuffer(i[_.id]),delete i[_.id],delete r[_.id]}function p(){for(const x in i)s.deleteBuffer(i[x]);a=[],i={},r={}}return{bind:c,update:l,dispose:p}}class uv{constructor(e={}){const{canvas:t=Qf(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const b=new Uint32Array(4),v=new Int32Array(4);let g=null,p=null;const x=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=zt,this.toneMapping=Fi,this.toneMappingExposure=1;const m=this;let L=!1,T=0,A=0,D=null,S=-1,y=null;const P=new mt,U=new mt;let k=null;const V=new Le(0);let $=0,H=t.width,Z=t.height,W=1,he=null,ie=null;const ue=new mt(0,0,H,Z),ve=new mt(0,0,H,Z);let xe=!1;const J=new fl;let G=!1,z=!1;const re=new Je,pe=new Je,Ie=new C,Re=new mt,Ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Q=!1;function oe(){return D===null?W:1}let I=n;function Fe(w,F){return t.getContext(w,F)}try{const w={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${tl}`),t.addEventListener("webglcontextlost",ne,!1),t.addEventListener("webglcontextrestored",Se,!1),t.addEventListener("webglcontextcreationerror",ye,!1),I===null){const F="webgl2";if(I=Fe(F,w),I===null)throw Fe(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let ae,Ee,ge,De,Pe,R,M,B,ee,se,te,Ue,be,Ce,it,ce,Me,Xe,je,Te,tt,Ze,ft,N;function _e(){ae=new g0(I),ae.init(),Ze=new tv(I,ae),Ee=new h0(I,ae,e,Ze),ge=new Zb(I,ae),Ee.reverseDepthBuffer&&d&&ge.buffers.depth.setReversed(!0),De=new x0(I),Pe=new Ob,R=new ev(I,ae,ge,Pe,Ee,Ze,De),M=new d0(m),B=new m0(m),ee=new Tp(I),ft=new c0(I,ee),se=new b0(I,ee,De,ft),te=new y0(I,se,ee,De),je=new _0(I,Ee,R),ce=new u0(Pe),Ue=new Fb(m,M,B,ae,Ee,ft,ce),be=new lv(m,Pe),Ce=new Bb,it=new Xb(ae),Xe=new o0(m,M,B,ge,te,f,c),Me=new $b(m,te,Ee),N=new hv(I,De,Ee,ge),Te=new l0(I,ae,De),tt=new v0(I,ae,De),De.programs=Ue.programs,m.capabilities=Ee,m.extensions=ae,m.properties=Pe,m.renderLists=Ce,m.shadowMap=Me,m.state=ge,m.info=De}_e();const K=new ov(m,I);this.xr=K,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const w=ae.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=ae.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(w){w!==void 0&&(W=w,this.setSize(H,Z,!1))},this.getSize=function(w){return w.set(H,Z)},this.setSize=function(w,F,X=!0){if(K.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=w,Z=F,t.width=Math.floor(w*W),t.height=Math.floor(F*W),X===!0&&(t.style.width=w+"px",t.style.height=F+"px"),this.setViewport(0,0,w,F)},this.getDrawingBufferSize=function(w){return w.set(H*W,Z*W).floor()},this.setDrawingBufferSize=function(w,F,X){H=w,Z=F,W=X,t.width=Math.floor(w*X),t.height=Math.floor(F*X),this.setViewport(0,0,w,F)},this.getCurrentViewport=function(w){return w.copy(P)},this.getViewport=function(w){return w.copy(ue)},this.setViewport=function(w,F,X,j){w.isVector4?ue.set(w.x,w.y,w.z,w.w):ue.set(w,F,X,j),ge.viewport(P.copy(ue).multiplyScalar(W).round())},this.getScissor=function(w){return w.copy(ve)},this.setScissor=function(w,F,X,j){w.isVector4?ve.set(w.x,w.y,w.z,w.w):ve.set(w,F,X,j),ge.scissor(U.copy(ve).multiplyScalar(W).round())},this.getScissorTest=function(){return xe},this.setScissorTest=function(w){ge.setScissorTest(xe=w)},this.setOpaqueSort=function(w){he=w},this.setTransparentSort=function(w){ie=w},this.getClearColor=function(w){return w.copy(Xe.getClearColor())},this.setClearColor=function(){Xe.setClearColor.apply(Xe,arguments)},this.getClearAlpha=function(){return Xe.getClearAlpha()},this.setClearAlpha=function(){Xe.setClearAlpha.apply(Xe,arguments)},this.clear=function(w=!0,F=!0,X=!0){let j=0;if(w){let O=!1;if(D!==null){const de=D.texture.format;O=de===ll||de===cl||de===ol}if(O){const de=D.texture.type,Ae=de===hi||de===ns||de===Mr||de===Bs||de===sl||de===rl,ke=Xe.getClearColor(),Be=Xe.getClearAlpha(),Ye=ke.r,Qe=ke.g,ze=ke.b;Ae?(b[0]=Ye,b[1]=Qe,b[2]=ze,b[3]=Be,I.clearBufferuiv(I.COLOR,0,b)):(v[0]=Ye,v[1]=Qe,v[2]=ze,v[3]=Be,I.clearBufferiv(I.COLOR,0,v))}else j|=I.COLOR_BUFFER_BIT}F&&(j|=I.DEPTH_BUFFER_BIT),X&&(j|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ne,!1),t.removeEventListener("webglcontextrestored",Se,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),Ce.dispose(),it.dispose(),Pe.dispose(),M.dispose(),B.dispose(),te.dispose(),ft.dispose(),N.dispose(),Ue.dispose(),K.dispose(),K.removeEventListener("sessionstart",ui),K.removeEventListener("sessionend",On),vn.stop()};function ne(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),L=!0}function Se(){console.log("THREE.WebGLRenderer: Context Restored."),L=!1;const w=De.autoReset,F=Me.enabled,X=Me.autoUpdate,j=Me.needsUpdate,O=Me.type;_e(),De.autoReset=w,Me.enabled=F,Me.autoUpdate=X,Me.needsUpdate=j,Me.type=O}function ye(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function He(w){const F=w.target;F.removeEventListener("dispose",He),bt(F)}function bt(w){Nt(w),Pe.remove(w)}function Nt(w){const F=Pe.get(w).programs;F!==void 0&&(F.forEach(function(X){Ue.releaseProgram(X)}),w.isShaderMaterial&&Ue.releaseShaderCache(w))}this.renderBufferDirect=function(w,F,X,j,O,de){F===null&&(F=Ke);const Ae=O.isMesh&&O.matrixWorld.determinant()<0,ke=Fr(w,F,X,j,O);ge.setMaterial(j,Ae);let Be=X.index,Ye=1;if(j.wireframe===!0){if(Be=se.getWireframeAttribute(X),Be===void 0)return;Ye=2}const Qe=X.drawRange,ze=X.attributes.position;let lt=Qe.start*Ye,vt=(Qe.start+Qe.count)*Ye;de!==null&&(lt=Math.max(lt,de.start*Ye),vt=Math.min(vt,(de.start+de.count)*Ye)),Be!==null?(lt=Math.max(lt,0),vt=Math.min(vt,Be.count)):ze!=null&&(lt=Math.max(lt,0),vt=Math.min(vt,ze.count));const rt=vt-lt;if(rt<0||rt===1/0)return;ft.setup(O,j,ke,X,Be);let pt,ht=Te;if(Be!==null&&(pt=ee.get(Be),ht=tt,ht.setIndex(pt)),O.isMesh)j.wireframe===!0?(ge.setLineWidth(j.wireframeLinewidth*oe()),ht.setMode(I.LINES)):ht.setMode(I.TRIANGLES);else if(O.isLine){let Ve=j.linewidth;Ve===void 0&&(Ve=1),ge.setLineWidth(Ve*oe()),O.isLineSegments?ht.setMode(I.LINES):O.isLineLoop?ht.setMode(I.LINE_LOOP):ht.setMode(I.LINE_STRIP)}else O.isPoints?ht.setMode(I.POINTS):O.isSprite&&ht.setMode(I.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)ht.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(ae.get("WEBGL_multi_draw"))ht.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Ve=O._multiDrawStarts,xn=O._multiDrawCounts,dt=O._multiDrawCount,Ut=Be?ee.get(Be).bytesPerElement:1,cn=Pe.get(j).currentProgram.getUniforms();for(let tn=0;tn<dt;tn++)cn.setValue(I,"_gl_DrawID",tn),ht.render(Ve[tn]/Ut,xn[tn])}else if(O.isInstancedMesh)ht.renderInstances(lt,rt,O.count);else if(X.isInstancedBufferGeometry){const Ve=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,xn=Math.min(X.instanceCount,Ve);ht.renderInstances(lt,rt,xn)}else ht.render(lt,rt)};function at(w,F,X){w.transparent===!0&&w.side===Zt&&w.forceSinglePass===!1?(w.side=Qt,w.needsUpdate=!0,ls(w,F,X),w.side=li,w.needsUpdate=!0,ls(w,F,X),w.side=Zt):ls(w,F,X)}this.compile=function(w,F,X=null){X===null&&(X=w),p=it.get(X),p.init(F),_.push(p),X.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),w!==X&&w.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const j=new Set;return w.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const de=O.material;if(de)if(Array.isArray(de))for(let Ae=0;Ae<de.length;Ae++){const ke=de[Ae];at(ke,X,O),j.add(ke)}else at(de,X,O),j.add(de)}),_.pop(),p=null,j},this.compileAsync=function(w,F,X=null){const j=this.compile(w,F,X);return new Promise(O=>{function de(){if(j.forEach(function(Ae){Pe.get(Ae).currentProgram.isReady()&&j.delete(Ae)}),j.size===0){O(w);return}setTimeout(de,10)}ae.get("KHR_parallel_shader_compile")!==null?de():setTimeout(de,10)})};let en=null;function Ct(w){en&&en(w)}function ui(){vn.stop()}function On(){vn.start()}const vn=new sd;vn.setAnimationLoop(Ct),typeof self<"u"&&vn.setContext(self),this.setAnimationLoop=function(w){en=w,K.setAnimationLoop(w),w===null?vn.stop():vn.start()},K.addEventListener("sessionstart",ui),K.addEventListener("sessionend",On),this.render=function(w,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),K.enabled===!0&&K.isPresenting===!0&&(K.cameraAutoUpdate===!0&&K.updateCamera(F),F=K.getCamera()),w.isScene===!0&&w.onBeforeRender(m,w,F,D),p=it.get(w,_.length),p.init(F),_.push(p),pe.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),J.setFromProjectionMatrix(pe),z=this.localClippingEnabled,G=ce.init(this.clippingPlanes,z),g=Ce.get(w,x.length),g.init(),x.push(g),K.enabled===!0&&K.isPresenting===!0){const de=m.xr.getDepthSensingMesh();de!==null&&Oi(de,F,-1/0,m.sortObjects)}Oi(w,F,0,m.sortObjects),g.finish(),m.sortObjects===!0&&g.sort(he,ie),Q=K.enabled===!1||K.isPresenting===!1||K.hasDepthSensing()===!1,Q&&Xe.addToRenderList(g,w),this.info.render.frame++,G===!0&&ce.beginShadows();const X=p.state.shadowsArray;Me.render(X,w,F),G===!0&&ce.endShadows(),this.info.autoReset===!0&&this.info.reset();const j=g.opaque,O=g.transmissive;if(p.setupLights(),F.isArrayCamera){const de=F.cameras;if(O.length>0)for(let Ae=0,ke=de.length;Ae<ke;Ae++){const Be=de[Ae];fi(j,O,w,Be)}Q&&Xe.render(w);for(let Ae=0,ke=de.length;Ae<ke;Ae++){const Be=de[Ae];di(g,w,Be,Be.viewport)}}else O.length>0&&fi(j,O,w,F),Q&&Xe.render(w),di(g,w,F);D!==null&&(R.updateMultisampleRenderTarget(D),R.updateRenderTargetMipmap(D)),w.isScene===!0&&w.onAfterRender(m,w,F),ft.resetDefaultState(),S=-1,y=null,_.pop(),_.length>0?(p=_[_.length-1],G===!0&&ce.setGlobalState(m.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?g=x[x.length-1]:g=null};function Oi(w,F,X,j){if(w.visible===!1)return;if(w.layers.test(F.layers)){if(w.isGroup)X=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(F);else if(w.isLight)p.pushLight(w),w.castShadow&&p.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||J.intersectsSprite(w)){j&&Re.setFromMatrixPosition(w.matrixWorld).applyMatrix4(pe);const Ae=te.update(w),ke=w.material;ke.visible&&g.push(w,Ae,ke,X,Re.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||J.intersectsObject(w))){const Ae=te.update(w),ke=w.material;if(j&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Re.copy(w.boundingSphere.center)):(Ae.boundingSphere===null&&Ae.computeBoundingSphere(),Re.copy(Ae.boundingSphere.center)),Re.applyMatrix4(w.matrixWorld).applyMatrix4(pe)),Array.isArray(ke)){const Be=Ae.groups;for(let Ye=0,Qe=Be.length;Ye<Qe;Ye++){const ze=Be[Ye],lt=ke[ze.materialIndex];lt&&lt.visible&&g.push(w,Ae,lt,X,Re.z,ze)}}else ke.visible&&g.push(w,Ae,ke,X,Re.z,null)}}const de=w.children;for(let Ae=0,ke=de.length;Ae<ke;Ae++)Oi(de[Ae],F,X,j)}function di(w,F,X,j){const O=w.opaque,de=w.transmissive,Ae=w.transparent;p.setupLightsView(X),G===!0&&ce.setGlobalState(m.clippingPlanes,X),j&&ge.viewport(P.copy(j)),O.length>0&&cs(O,F,X),de.length>0&&cs(de,F,X),Ae.length>0&&cs(Ae,F,X),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function fi(w,F,X,j){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[j.id]===void 0&&(p.state.transmissionRenderTarget[j.id]=new is(1,1,{generateMipmaps:!0,type:ae.has("EXT_color_buffer_half_float")||ae.has("EXT_color_buffer_float")?Cr:hi,minFilter:ai,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ct.workingColorSpace}));const de=p.state.transmissionRenderTarget[j.id],Ae=j.viewport||P;de.setSize(Ae.z,Ae.w);const ke=m.getRenderTarget();m.setRenderTarget(de),m.getClearColor(V),$=m.getClearAlpha(),$<1&&m.setClearColor(16777215,.5),m.clear(),Q&&Xe.render(X);const Be=m.toneMapping;m.toneMapping=Fi;const Ye=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),p.setupLightsView(j),G===!0&&ce.setGlobalState(m.clippingPlanes,j),cs(w,X,j),R.updateMultisampleRenderTarget(de),R.updateRenderTargetMipmap(de),ae.has("WEBGL_multisampled_render_to_texture")===!1){let Qe=!1;for(let ze=0,lt=F.length;ze<lt;ze++){const vt=F[ze],rt=vt.object,pt=vt.geometry,ht=vt.material,Ve=vt.group;if(ht.side===Zt&&rt.layers.test(j.layers)){const xn=ht.side;ht.side=Qt,ht.needsUpdate=!0,Ur(rt,X,j,pt,ht,Ve),ht.side=xn,ht.needsUpdate=!0,Qe=!0}}Qe===!0&&(R.updateMultisampleRenderTarget(de),R.updateRenderTargetMipmap(de))}m.setRenderTarget(ke),m.setClearColor(V,$),Ye!==void 0&&(j.viewport=Ye),m.toneMapping=Be}function cs(w,F,X){const j=F.isScene===!0?F.overrideMaterial:null;for(let O=0,de=w.length;O<de;O++){const Ae=w[O],ke=Ae.object,Be=Ae.geometry,Ye=j===null?Ae.material:j,Qe=Ae.group;ke.layers.test(X.layers)&&Ur(ke,F,X,Be,Ye,Qe)}}function Ur(w,F,X,j,O,de){w.onBeforeRender(m,F,X,j,O,de),w.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),O.onBeforeRender(m,F,X,j,w,de),O.transparent===!0&&O.side===Zt&&O.forceSinglePass===!1?(O.side=Qt,O.needsUpdate=!0,m.renderBufferDirect(X,F,j,O,w,de),O.side=li,O.needsUpdate=!0,m.renderBufferDirect(X,F,j,O,w,de),O.side=Zt):m.renderBufferDirect(X,F,j,O,w,de),w.onAfterRender(m,F,X,j,O,de)}function ls(w,F,X){F.isScene!==!0&&(F=Ke);const j=Pe.get(w),O=p.state.lights,de=p.state.shadowsArray,Ae=O.state.version,ke=Ue.getParameters(w,O.state,de,F,X),Be=Ue.getProgramCacheKey(ke);let Ye=j.programs;j.environment=w.isMeshStandardMaterial?F.environment:null,j.fog=F.fog,j.envMap=(w.isMeshStandardMaterial?B:M).get(w.envMap||j.environment),j.envMapRotation=j.environment!==null&&w.envMap===null?F.environmentRotation:w.envMapRotation,Ye===void 0&&(w.addEventListener("dispose",He),Ye=new Map,j.programs=Ye);let Qe=Ye.get(Be);if(Qe!==void 0){if(j.currentProgram===Qe&&j.lightsStateVersion===Ae)return Bi(w,ke),Qe}else ke.uniforms=Ue.getUniforms(w),w.onBeforeCompile(ke,m),Qe=Ue.acquireProgram(ke,Be),Ye.set(Be,Qe),j.uniforms=ke.uniforms;const ze=j.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(ze.clippingPlanes=ce.uniform),Bi(w,ke),j.needsLights=Or(w),j.lightsStateVersion=Ae,j.needsLights&&(ze.ambientLightColor.value=O.state.ambient,ze.lightProbe.value=O.state.probe,ze.directionalLights.value=O.state.directional,ze.directionalLightShadows.value=O.state.directionalShadow,ze.spotLights.value=O.state.spot,ze.spotLightShadows.value=O.state.spotShadow,ze.rectAreaLights.value=O.state.rectArea,ze.ltc_1.value=O.state.rectAreaLTC1,ze.ltc_2.value=O.state.rectAreaLTC2,ze.pointLights.value=O.state.point,ze.pointLightShadows.value=O.state.pointShadow,ze.hemisphereLights.value=O.state.hemi,ze.directionalShadowMap.value=O.state.directionalShadowMap,ze.directionalShadowMatrix.value=O.state.directionalShadowMatrix,ze.spotShadowMap.value=O.state.spotShadowMap,ze.spotLightMatrix.value=O.state.spotLightMatrix,ze.spotLightMap.value=O.state.spotLightMap,ze.pointShadowMap.value=O.state.pointShadowMap,ze.pointShadowMatrix.value=O.state.pointShadowMatrix),j.currentProgram=Qe,j.uniformsList=null,Qe}function ki(w){if(w.uniformsList===null){const F=w.currentProgram.getUniforms();w.uniformsList=Pa.seqWithValue(F.seq,w.uniforms)}return w.uniformsList}function Bi(w,F){const X=Pe.get(w);X.outputColorSpace=F.outputColorSpace,X.batching=F.batching,X.batchingColor=F.batchingColor,X.instancing=F.instancing,X.instancingColor=F.instancingColor,X.instancingMorph=F.instancingMorph,X.skinning=F.skinning,X.morphTargets=F.morphTargets,X.morphNormals=F.morphNormals,X.morphColors=F.morphColors,X.morphTargetsCount=F.morphTargetsCount,X.numClippingPlanes=F.numClippingPlanes,X.numIntersection=F.numClipIntersection,X.vertexAlphas=F.vertexAlphas,X.vertexTangents=F.vertexTangents,X.toneMapping=F.toneMapping}function Fr(w,F,X,j,O){F.isScene!==!0&&(F=Ke),R.resetTextureUnits();const de=F.fog,Ae=j.isMeshStandardMaterial?F.environment:null,ke=D===null?m.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:on,Be=(j.isMeshStandardMaterial?B:M).get(j.envMap||Ae),Ye=j.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Qe=!!X.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),ze=!!X.morphAttributes.position,lt=!!X.morphAttributes.normal,vt=!!X.morphAttributes.color;let rt=Fi;j.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(rt=m.toneMapping);const pt=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ht=pt!==void 0?pt.length:0,Ve=Pe.get(j),xn=p.state.lights;if(G===!0&&(z===!0||w!==y)){const ln=w===y&&j.id===S;ce.setState(j,w,ln)}let dt=!1;j.version===Ve.__version?(Ve.needsLights&&Ve.lightsStateVersion!==xn.state.version||Ve.outputColorSpace!==ke||O.isBatchedMesh&&Ve.batching===!1||!O.isBatchedMesh&&Ve.batching===!0||O.isBatchedMesh&&Ve.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Ve.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Ve.instancing===!1||!O.isInstancedMesh&&Ve.instancing===!0||O.isSkinnedMesh&&Ve.skinning===!1||!O.isSkinnedMesh&&Ve.skinning===!0||O.isInstancedMesh&&Ve.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ve.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ve.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ve.instancingMorph===!1&&O.morphTexture!==null||Ve.envMap!==Be||j.fog===!0&&Ve.fog!==de||Ve.numClippingPlanes!==void 0&&(Ve.numClippingPlanes!==ce.numPlanes||Ve.numIntersection!==ce.numIntersection)||Ve.vertexAlphas!==Ye||Ve.vertexTangents!==Qe||Ve.morphTargets!==ze||Ve.morphNormals!==lt||Ve.morphColors!==vt||Ve.toneMapping!==rt||Ve.morphTargetsCount!==ht)&&(dt=!0):(dt=!0,Ve.__version=j.version);let Ut=Ve.currentProgram;dt===!0&&(Ut=ls(j,F,O));let cn=!1,tn=!1,Ft=!1;const $e=Ut.getUniforms(),fn=Ve.uniforms;if(ge.useProgram(Ut.program)&&(cn=!0,tn=!0,Ft=!0),j.id!==S&&(S=j.id,tn=!0),cn||y!==w){ge.buffers.depth.getReversed()?(re.copy(w.projectionMatrix),tp(re),np(re),$e.setValue(I,"projectionMatrix",re)):$e.setValue(I,"projectionMatrix",w.projectionMatrix),$e.setValue(I,"viewMatrix",w.matrixWorldInverse);const En=$e.map.cameraPosition;En!==void 0&&En.setValue(I,Ie.setFromMatrixPosition(w.matrixWorld)),Ee.logarithmicDepthBuffer&&$e.setValue(I,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&$e.setValue(I,"isOrthographic",w.isOrthographicCamera===!0),y!==w&&(y=w,tn=!0,Ft=!0)}if(O.isSkinnedMesh){$e.setOptional(I,O,"bindMatrix"),$e.setOptional(I,O,"bindMatrixInverse");const ln=O.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),$e.setValue(I,"boneTexture",ln.boneTexture,R))}O.isBatchedMesh&&($e.setOptional(I,O,"batchingTexture"),$e.setValue(I,"batchingTexture",O._matricesTexture,R),$e.setOptional(I,O,"batchingIdTexture"),$e.setValue(I,"batchingIdTexture",O._indirectTexture,R),$e.setOptional(I,O,"batchingColorTexture"),O._colorsTexture!==null&&$e.setValue(I,"batchingColorTexture",O._colorsTexture,R));const qn=X.morphAttributes;if((qn.position!==void 0||qn.normal!==void 0||qn.color!==void 0)&&je.update(O,X,Ut),(tn||Ve.receiveShadow!==O.receiveShadow)&&(Ve.receiveShadow=O.receiveShadow,$e.setValue(I,"receiveShadow",O.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(fn.envMap.value=Be,fn.flipEnvMap.value=Be.isCubeTexture&&Be.isRenderTargetTexture===!1?-1:1),j.isMeshStandardMaterial&&j.envMap===null&&F.environment!==null&&(fn.envMapIntensity.value=F.environmentIntensity),tn&&($e.setValue(I,"toneMappingExposure",m.toneMappingExposure),Ve.needsLights&&$a(fn,Ft),de&&j.fog===!0&&be.refreshFogUniforms(fn,de),be.refreshMaterialUniforms(fn,j,W,Z,p.state.transmissionRenderTarget[w.id]),Pa.upload(I,ki(Ve),fn,R)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Pa.upload(I,ki(Ve),fn,R),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&$e.setValue(I,"center",O.center),$e.setValue(I,"modelViewMatrix",O.modelViewMatrix),$e.setValue(I,"normalMatrix",O.normalMatrix),$e.setValue(I,"modelMatrix",O.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){const ln=j.uniformsGroups;for(let En=0,kn=ln.length;En<kn;En++){const pi=ln[En];N.update(pi,Ut),N.bind(pi,Ut)}}return Ut}function $a(w,F){w.ambientLightColor.needsUpdate=F,w.lightProbe.needsUpdate=F,w.directionalLights.needsUpdate=F,w.directionalLightShadows.needsUpdate=F,w.pointLights.needsUpdate=F,w.pointLightShadows.needsUpdate=F,w.spotLights.needsUpdate=F,w.spotLightShadows.needsUpdate=F,w.rectAreaLights.needsUpdate=F,w.hemisphereLights.needsUpdate=F}function Or(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(w,F,X){Pe.get(w.texture).__webglTexture=F,Pe.get(w.depthTexture).__webglTexture=X;const j=Pe.get(w);j.__hasExternalTextures=!0,j.__autoAllocateDepthBuffer=X===void 0,j.__autoAllocateDepthBuffer||ae.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,F){const X=Pe.get(w);X.__webglFramebuffer=F,X.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(w,F=0,X=0){D=w,T=F,A=X;let j=!0,O=null,de=!1,Ae=!1;if(w){const Be=Pe.get(w);if(Be.__useDefaultFramebuffer!==void 0)ge.bindFramebuffer(I.FRAMEBUFFER,null),j=!1;else if(Be.__webglFramebuffer===void 0)R.setupRenderTarget(w);else if(Be.__hasExternalTextures)R.rebindTextures(w,Pe.get(w.texture).__webglTexture,Pe.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const ze=w.depthTexture;if(Be.__boundDepthTexture!==ze){if(ze!==null&&Pe.has(ze)&&(w.width!==ze.image.width||w.height!==ze.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(w)}}const Ye=w.texture;(Ye.isData3DTexture||Ye.isDataArrayTexture||Ye.isCompressedArrayTexture)&&(Ae=!0);const Qe=Pe.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Qe[F])?O=Qe[F][X]:O=Qe[F],de=!0):w.samples>0&&R.useMultisampledRTT(w)===!1?O=Pe.get(w).__webglMultisampledFramebuffer:Array.isArray(Qe)?O=Qe[X]:O=Qe,P.copy(w.viewport),U.copy(w.scissor),k=w.scissorTest}else P.copy(ue).multiplyScalar(W).floor(),U.copy(ve).multiplyScalar(W).floor(),k=xe;if(ge.bindFramebuffer(I.FRAMEBUFFER,O)&&j&&ge.drawBuffers(w,O),ge.viewport(P),ge.scissor(U),ge.setScissorTest(k),de){const Be=Pe.get(w.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+F,Be.__webglTexture,X)}else if(Ae){const Be=Pe.get(w.texture),Ye=F||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Be.__webglTexture,X||0,Ye)}S=-1},this.readRenderTargetPixels=function(w,F,X,j,O,de,Ae){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ke=Pe.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ae!==void 0&&(ke=ke[Ae]),ke){ge.bindFramebuffer(I.FRAMEBUFFER,ke);try{const Be=w.texture,Ye=Be.format,Qe=Be.type;if(!Ee.textureFormatReadable(Ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ee.textureTypeReadable(Qe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=w.width-j&&X>=0&&X<=w.height-O&&I.readPixels(F,X,j,O,Ze.convert(Ye),Ze.convert(Qe),de)}finally{const Be=D!==null?Pe.get(D).__webglFramebuffer:null;ge.bindFramebuffer(I.FRAMEBUFFER,Be)}}},this.readRenderTargetPixelsAsync=async function(w,F,X,j,O,de,Ae){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ke=Pe.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ae!==void 0&&(ke=ke[Ae]),ke){const Be=w.texture,Ye=Be.format,Qe=Be.type;if(!Ee.textureFormatReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ee.textureTypeReadable(Qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(F>=0&&F<=w.width-j&&X>=0&&X<=w.height-O){ge.bindFramebuffer(I.FRAMEBUFFER,ke);const ze=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,ze),I.bufferData(I.PIXEL_PACK_BUFFER,de.byteLength,I.STREAM_READ),I.readPixels(F,X,j,O,Ze.convert(Ye),Ze.convert(Qe),0);const lt=D!==null?Pe.get(D).__webglFramebuffer:null;ge.bindFramebuffer(I.FRAMEBUFFER,lt);const vt=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await ep(I,vt,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,ze),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,de),I.deleteBuffer(ze),I.deleteSync(vt),de}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,F=null,X=0){w.isTexture!==!0&&(fr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),F=arguments[0]||null,w=arguments[1]);const j=Math.pow(2,-X),O=Math.floor(w.image.width*j),de=Math.floor(w.image.height*j),Ae=F!==null?F.x:0,ke=F!==null?F.y:0;R.setTexture2D(w,0),I.copyTexSubImage2D(I.TEXTURE_2D,X,0,0,Ae,ke,O,de),ge.unbindTexture()},this.copyTextureToTexture=function(w,F,X=null,j=null,O=0){w.isTexture!==!0&&(fr("WebGLRenderer: copyTextureToTexture function signature has changed."),j=arguments[0]||null,w=arguments[1],F=arguments[2],O=arguments[3]||0,X=null);let de,Ae,ke,Be,Ye,Qe,ze,lt,vt;const rt=w.isCompressedTexture?w.mipmaps[O]:w.image;X!==null?(de=X.max.x-X.min.x,Ae=X.max.y-X.min.y,ke=X.isBox3?X.max.z-X.min.z:1,Be=X.min.x,Ye=X.min.y,Qe=X.isBox3?X.min.z:0):(de=rt.width,Ae=rt.height,ke=rt.depth||1,Be=0,Ye=0,Qe=0),j!==null?(ze=j.x,lt=j.y,vt=j.z):(ze=0,lt=0,vt=0);const pt=Ze.convert(F.format),ht=Ze.convert(F.type);let Ve;F.isData3DTexture?(R.setTexture3D(F,0),Ve=I.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(R.setTexture2DArray(F,0),Ve=I.TEXTURE_2D_ARRAY):(R.setTexture2D(F,0),Ve=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,F.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,F.unpackAlignment);const xn=I.getParameter(I.UNPACK_ROW_LENGTH),dt=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Ut=I.getParameter(I.UNPACK_SKIP_PIXELS),cn=I.getParameter(I.UNPACK_SKIP_ROWS),tn=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,rt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,rt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Be),I.pixelStorei(I.UNPACK_SKIP_ROWS,Ye),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Qe);const Ft=w.isDataArrayTexture||w.isData3DTexture,$e=F.isDataArrayTexture||F.isData3DTexture;if(w.isRenderTargetTexture||w.isDepthTexture){const fn=Pe.get(w),qn=Pe.get(F),ln=Pe.get(fn.__renderTarget),En=Pe.get(qn.__renderTarget);ge.bindFramebuffer(I.READ_FRAMEBUFFER,ln.__webglFramebuffer),ge.bindFramebuffer(I.DRAW_FRAMEBUFFER,En.__webglFramebuffer);for(let kn=0;kn<ke;kn++)Ft&&I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Pe.get(w).__webglTexture,O,Qe+kn),w.isDepthTexture?($e&&I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Pe.get(F).__webglTexture,O,vt+kn),I.blitFramebuffer(Be,Ye,de,Ae,ze,lt,de,Ae,I.DEPTH_BUFFER_BIT,I.NEAREST)):$e?I.copyTexSubImage3D(Ve,O,ze,lt,vt+kn,Be,Ye,de,Ae):I.copyTexSubImage2D(Ve,O,ze,lt,vt+kn,Be,Ye,de,Ae);ge.bindFramebuffer(I.READ_FRAMEBUFFER,null),ge.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else $e?w.isDataTexture||w.isData3DTexture?I.texSubImage3D(Ve,O,ze,lt,vt,de,Ae,ke,pt,ht,rt.data):F.isCompressedArrayTexture?I.compressedTexSubImage3D(Ve,O,ze,lt,vt,de,Ae,ke,pt,rt.data):I.texSubImage3D(Ve,O,ze,lt,vt,de,Ae,ke,pt,ht,rt):w.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,O,ze,lt,de,Ae,pt,ht,rt.data):w.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,O,ze,lt,rt.width,rt.height,pt,rt.data):I.texSubImage2D(I.TEXTURE_2D,O,ze,lt,de,Ae,pt,ht,rt);I.pixelStorei(I.UNPACK_ROW_LENGTH,xn),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,dt),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ut),I.pixelStorei(I.UNPACK_SKIP_ROWS,cn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,tn),O===0&&F.generateMipmaps&&I.generateMipmap(Ve),ge.unbindTexture()},this.copyTextureToTexture3D=function(w,F,X=null,j=null,O=0){return w.isTexture!==!0&&(fr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),X=arguments[0]||null,j=arguments[1]||null,w=arguments[2],F=arguments[3],O=arguments[4]||0),fr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(w,F,X,j,O)},this.initRenderTarget=function(w){Pe.get(w).__webglFramebuffer===void 0&&R.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?R.setTextureCube(w,0):w.isData3DTexture?R.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?R.setTexture2DArray(w,0):R.setTexture2D(w,0),ge.unbindTexture()},this.resetState=function(){T=0,A=0,D=null,ge.reset(),ft.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return oi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}}class gl{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Le(e),this.density=t}clone(){return new gl(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class dv extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bn,this.environmentIntensity=1,this.environmentRotation=new bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class fv{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Vc,this.updateRanges=[],this.version=0,this.uuid=wn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const nn=new C;class bl{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix4(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.applyNormalMatrix(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)nn.fromBufferAttribute(this,t),nn.transformDirection(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=In(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=xt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=In(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=In(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=In(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=In(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),i=xt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),i=xt(i,this.array),r=xt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new gt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new bl(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Xh=new C,jh=new mt,qh=new mt,pv=new C,Yh=new Je,da=new C,Bo=new Vn,Kh=new Je,zo=new Pr;class hd extends ut{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ql,this.bindMatrix=new Je,this.bindMatrixInverse=new Je,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Hn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,da),this.boundingBox.expandByPoint(da)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Vn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,da),this.boundingSphere.expandByPoint(da)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bo.copy(this.boundingSphere),Bo.applyMatrix4(i),e.ray.intersectsSphere(Bo)!==!1&&(Kh.copy(i).invert(),zo.copy(e.ray).applyMatrix4(Kh),!(this.boundingBox!==null&&zo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,zo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new mt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ql?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===wf?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;jh.fromBufferAttribute(i.attributes.skinIndex,e),qh.fromBufferAttribute(i.attributes.skinWeight,e),Xh.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const a=qh.getComponent(r);if(a!==0){const o=jh.getComponent(r);Yh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(pv.copy(Xh).applyMatrix4(Yh),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class vl extends Et{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ud extends jt{constructor(e=null,t=1,n=1,i,r,a,o,c,l=an,h=an,u,d){super(null,a,o,c,l,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const $h=new Je,mv=new Je;class Ga{constructor(e=[],t=[]){this.uuid=wn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Je)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Je;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:mv;$h.multiplyMatrices(o,t[r]),$h.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Ga(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ud(t,e,e,Sn,Nn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new vl),this.bones.push(a),this.boneInverses.push(new Je().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Na extends gt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Es=new Je,Jh=new Je,fa=[],Zh=new Hn,gv=new Je,rr=new ut,ar=new Vn;class Cs extends ut{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Na(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,gv)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Hn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Es),Zh.copy(e.boundingBox).applyMatrix4(Es),this.boundingBox.union(Zh)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Es),ar.copy(e.boundingSphere).applyMatrix4(Es),this.boundingSphere.union(ar)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(rr.geometry=this.geometry,rr.material=this.material,rr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ar.copy(this.boundingSphere),ar.applyMatrix4(n),e.ray.intersectsSphere(ar)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Es),Jh.multiplyMatrices(n,Es),rr.matrixWorld=Jh,rr.raycast(e,fa);for(let a=0,o=fa.length;a<o;a++){const c=fa[a];c.instanceId=r,c.object=this,t.push(c)}fa.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Na(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ud(new Float32Array(i*this.count),i,this.count,al,Nn));const r=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=i*e;r[c]=o,r.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class dd extends Un{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Le(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ua=new C,Fa=new C,Qh=new Je,or=new Pr,pa=new Vn,Go=new C,eu=new C;class xl extends Et{constructor(e=new Lt,t=new dd){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Ua.fromBufferAttribute(t,i-1),Fa.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ua.distanceTo(Fa);e.setAttribute("lineDistance",new yt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pa.copy(n.boundingSphere),pa.applyMatrix4(i),pa.radius+=r,e.ray.intersectsSphere(pa)===!1)return;Qh.copy(i).invert(),or.copy(e.ray).applyMatrix4(Qh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,a.start),b=Math.min(h.count,a.start+a.count);for(let v=f,g=b-1;v<g;v+=l){const p=h.getX(v),x=h.getX(v+1),_=ma(this,e,or,c,p,x);_&&t.push(_)}if(this.isLineLoop){const v=h.getX(b-1),g=h.getX(f),p=ma(this,e,or,c,v,g);p&&t.push(p)}}else{const f=Math.max(0,a.start),b=Math.min(d.count,a.start+a.count);for(let v=f,g=b-1;v<g;v+=l){const p=ma(this,e,or,c,v,v+1);p&&t.push(p)}if(this.isLineLoop){const v=ma(this,e,or,c,b-1,f);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function ma(s,e,t,n,i,r){const a=s.geometry.attributes.position;if(Ua.fromBufferAttribute(a,i),Fa.fromBufferAttribute(a,r),t.distanceSqToSegment(Ua,Fa,Go,eu)>n)return;Go.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Go);if(!(c<e.near||c>e.far))return{distance:c,point:eu.clone().applyMatrix4(s.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:s}}const tu=new C,nu=new C;class bv extends xl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)tu.fromBufferAttribute(t,i),nu.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+tu.distanceTo(nu);e.setAttribute("lineDistance",new yt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class vv extends xl{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class fd extends Un{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Le(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const iu=new Je,Xc=new Pr,ga=new Vn,ba=new C;class _l extends Et{constructor(e=new Lt,t=new fd){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ga.copy(n.boundingSphere),ga.applyMatrix4(i),ga.radius+=r,e.ray.intersectsSphere(ga)===!1)return;iu.copy(i).invert(),Xc.copy(e.ray).applyMatrix4(iu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,u=n.attributes.position;if(l!==null){const d=Math.max(0,a.start),f=Math.min(l.count,a.start+a.count);for(let b=d,v=f;b<v;b++){const g=l.getX(b);ba.fromBufferAttribute(u,g),su(ba,g,c,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let b=d,v=f;b<v;b++)ba.fromBufferAttribute(u,b),su(ba,b,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function su(s,e,t,n,i,r,a){const o=Xc.distanceSqToPoint(s);if(o<t){const c=new C;Xc.closestPointToPoint(s,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class Wn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(i=Math.floor(o+(c-o)/2),l=n[i]-a,l<0)o=i+1;else if(l>0)c=i-1;else{c=i;break}if(i=c,n[i]===a)return i/(r-1);const h=n[i],d=n[i+1]-h,f=(a-h)/d;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),c=t||(a.isVector2?new fe:new C);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new C,i=[],r=[],a=[],o=new C,c=new Je;for(let f=0;f<=e;f++){const b=f/e;i[f]=this.getTangentAt(b,new C)}r[0]=new C,a[0]=new C;let l=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();const b=Math.acos(Gt(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(o,b))}a[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(Gt(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let b=1;b<=e;b++)r[b].applyMatrix4(c.makeRotationAxis(i[b],f*b)),a[b].crossVectors(i[b],r[b])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class yl extends Wn{constructor(e=0,t=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new fe){const n=t,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*h-f*u+this.aX,l=d*u+f*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class xv extends yl{constructor(e,t,n,i,r,a){super(e,t,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Ml(){let s=0,e=0,t=0,n=0;function i(r,a,o,c){s=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){i(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,h,u){let d=(a-r)/l-(o-r)/(l+h)+(o-a)/h,f=(o-a)/h-(c-a)/(h+u)+(c-o)/u;d*=h,f*=h,i(a,o,d,f)},calc:function(r){const a=r*r,o=a*r;return s+e*r+t*a+n*o}}}const va=new C,Ho=new Ml,Vo=new Ml,Wo=new Ml;class _v extends Wn{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new C){const n=t,i=this.points,r=i.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,h;this.closed||o>0?l=i[(o-1)%r]:(va.subVectors(i[0],i[1]).add(i[0]),l=va);const u=i[o%r],d=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(va.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=va),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let b=Math.pow(l.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),b<1e-4&&(b=v),g<1e-4&&(g=v),Ho.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,b,v,g),Vo.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,b,v,g),Wo.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,b,v,g)}else this.curveType==="catmullrom"&&(Ho.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),Vo.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),Wo.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return n.set(Ho.calc(c),Vo.calc(c),Wo.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new C().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function ru(s,e,t,n,i){const r=(n-e)*.5,a=(i-t)*.5,o=s*s,c=s*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*s+t}function yv(s,e){const t=1-s;return t*t*e}function Mv(s,e){return 2*(1-s)*s*e}function Sv(s,e){return s*s*e}function br(s,e,t,n){return yv(s,e)+Mv(s,t)+Sv(s,n)}function wv(s,e){const t=1-s;return t*t*t*e}function Ev(s,e){const t=1-s;return 3*t*t*s*e}function Tv(s,e){return 3*(1-s)*s*s*e}function Av(s,e){return s*s*s*e}function vr(s,e,t,n,i){return wv(s,e)+Ev(s,t)+Tv(s,n)+Av(s,i)}class pd extends Wn{constructor(e=new fe,t=new fe,n=new fe,i=new fe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new fe){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(vr(e,i.x,r.x,a.x,o.x),vr(e,i.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Rv extends Wn{constructor(e=new C,t=new C,n=new C,i=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new C){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(vr(e,i.x,r.x,a.x,o.x),vr(e,i.y,r.y,a.y,o.y),vr(e,i.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class md extends Wn{constructor(e=new fe,t=new fe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new fe){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new fe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Cv extends Wn{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class gd extends Wn{constructor(e=new fe,t=new fe,n=new fe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new fe){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(br(e,i.x,r.x,a.x),br(e,i.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Pv extends Wn{constructor(e=new C,t=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new C){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(br(e,i.x,r.x,a.x),br(e,i.y,r.y,a.y),br(e,i.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class bd extends Wn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new fe){const n=t,i=this.points,r=(i.length-1)*e,a=Math.floor(r),o=r-a,c=i[a===0?a:a-1],l=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(ru(o,c.x,l.x,h.x,u.x),ru(o,c.y,l.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new fe().fromArray(i))}return this}}var jc=Object.freeze({__proto__:null,ArcCurve:xv,CatmullRomCurve3:_v,CubicBezierCurve:pd,CubicBezierCurve3:Rv,EllipseCurve:yl,LineCurve:md,LineCurve3:Cv,QuadraticBezierCurve:gd,QuadraticBezierCurve3:Pv,SplineCurve:bd});class Lv extends Wn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new jc[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){const h=c[l];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new jc[i.type]().fromJSON(i))}return this}}class au extends Lv{constructor(e){super(),this.type="Path",this.currentPoint=new fe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new md(this.currentPoint.clone(),new fe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const r=new gd(this.currentPoint.clone(),new fe(e,t),new fe(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,a){const o=new pd(this.currentPoint.clone(),new fe(e,t),new fe(n,i),new fe(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new bd(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,a){const o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,n,i,r,a),this}absarc(e,t,n,i,r,a){return this.absellipse(e,t,n,n,i,r,a),this}ellipse(e,t,n,i,r,a,o,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,n,i,r,a,o,c),this}absellipse(e,t,n,i,r,a,o,c){const l=new yl(e,t,n,i,r,a,o,c);if(this.curves.length>0){const u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Sl extends Lt{constructor(e=[new fe(0,-.5),new fe(.5,0),new fe(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=Gt(i,0,Math.PI*2);const r=[],a=[],o=[],c=[],l=[],h=1/t,u=new C,d=new fe,f=new C,b=new C,v=new C;let g=0,p=0;for(let x=0;x<=e.length-1;x++)switch(x){case 0:g=e[x+1].x-e[x].x,p=e[x+1].y-e[x].y,f.x=p*1,f.y=-g,f.z=p*0,v.copy(f),f.normalize(),c.push(f.x,f.y,f.z);break;case e.length-1:c.push(v.x,v.y,v.z);break;default:g=e[x+1].x-e[x].x,p=e[x+1].y-e[x].y,f.x=p*1,f.y=-g,f.z=p*0,b.copy(f),f.x+=v.x,f.y+=v.y,f.z+=v.z,f.normalize(),c.push(f.x,f.y,f.z),v.copy(b)}for(let x=0;x<=t;x++){const _=n+x*h*i,m=Math.sin(_),L=Math.cos(_);for(let T=0;T<=e.length-1;T++){u.x=e[T].x*m,u.y=e[T].y,u.z=e[T].x*L,a.push(u.x,u.y,u.z),d.x=x/t,d.y=T/(e.length-1),o.push(d.x,d.y);const A=c[3*T+0]*m,D=c[3*T+1],S=c[3*T+0]*L;l.push(A,D,S)}}for(let x=0;x<t;x++)for(let _=0;_<e.length-1;_++){const m=_+x*e.length,L=m,T=m+e.length,A=m+e.length+1,D=m+1;r.push(L,T,D),r.push(A,D,T)}this.setIndex(r),this.setAttribute("position",new yt(a,3)),this.setAttribute("uv",new yt(o,2)),this.setAttribute("normal",new yt(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Sl(e.points,e.segments,e.phiStart,e.phiLength)}}class Lr extends Lt{constructor(e=1,t=1,n=1,i=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};const l=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let b=0;const v=[],g=n/2;let p=0;x(),a===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new yt(u,3)),this.setAttribute("normal",new yt(d,3)),this.setAttribute("uv",new yt(f,2));function x(){const m=new C,L=new C;let T=0;const A=(t-e)/n;for(let D=0;D<=r;D++){const S=[],y=D/r,P=y*(t-e)+e;for(let U=0;U<=i;U++){const k=U/i,V=k*c+o,$=Math.sin(V),H=Math.cos(V);L.x=P*$,L.y=-y*n+g,L.z=P*H,u.push(L.x,L.y,L.z),m.set($,A,H).normalize(),d.push(m.x,m.y,m.z),f.push(k,1-y),S.push(b++)}v.push(S)}for(let D=0;D<i;D++)for(let S=0;S<r;S++){const y=v[S][D],P=v[S+1][D],U=v[S+1][D+1],k=v[S][D+1];(e>0||S!==0)&&(h.push(y,P,k),T+=3),(t>0||S!==r-1)&&(h.push(P,U,k),T+=3)}l.addGroup(p,T,0),p+=T}function _(m){const L=b,T=new fe,A=new C;let D=0;const S=m===!0?e:t,y=m===!0?1:-1;for(let U=1;U<=i;U++)u.push(0,g*y,0),d.push(0,y,0),f.push(.5,.5),b++;const P=b;for(let U=0;U<=i;U++){const V=U/i*c+o,$=Math.cos(V),H=Math.sin(V);A.x=S*H,A.y=g*y,A.z=S*$,u.push(A.x,A.y,A.z),d.push(0,y,0),T.x=$*.5+.5,T.y=H*.5*y+.5,f.push(T.x,T.y),b++}for(let U=0;U<i;U++){const k=L+U,V=P+U;m===!0?h.push(V,V+1,k):h.push(V+1,V,k),D+=3}l.addGroup(p,D,m===!0?1:2),p+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Lr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ha extends Lr{constructor(e=1,t=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Ha(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class wl extends Lt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const r=[],a=[];o(i),l(n),h(),this.setAttribute("position",new yt(r,3)),this.setAttribute("normal",new yt(r.slice(),3)),this.setAttribute("uv",new yt(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(x){const _=new C,m=new C,L=new C;for(let T=0;T<t.length;T+=3)f(t[T+0],_),f(t[T+1],m),f(t[T+2],L),c(_,m,L,x)}function c(x,_,m,L){const T=L+1,A=[];for(let D=0;D<=T;D++){A[D]=[];const S=x.clone().lerp(m,D/T),y=_.clone().lerp(m,D/T),P=T-D;for(let U=0;U<=P;U++)U===0&&D===T?A[D][U]=S:A[D][U]=S.clone().lerp(y,U/P)}for(let D=0;D<T;D++)for(let S=0;S<2*(T-D)-1;S++){const y=Math.floor(S/2);S%2===0?(d(A[D][y+1]),d(A[D+1][y]),d(A[D][y])):(d(A[D][y+1]),d(A[D+1][y+1]),d(A[D+1][y]))}}function l(x){const _=new C;for(let m=0;m<r.length;m+=3)_.x=r[m+0],_.y=r[m+1],_.z=r[m+2],_.normalize().multiplyScalar(x),r[m+0]=_.x,r[m+1]=_.y,r[m+2]=_.z}function h(){const x=new C;for(let _=0;_<r.length;_+=3){x.x=r[_+0],x.y=r[_+1],x.z=r[_+2];const m=g(x)/2/Math.PI+.5,L=p(x)/Math.PI+.5;a.push(m,1-L)}b(),u()}function u(){for(let x=0;x<a.length;x+=6){const _=a[x+0],m=a[x+2],L=a[x+4],T=Math.max(_,m,L),A=Math.min(_,m,L);T>.9&&A<.1&&(_<.2&&(a[x+0]+=1),m<.2&&(a[x+2]+=1),L<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function f(x,_){const m=x*3;_.x=e[m+0],_.y=e[m+1],_.z=e[m+2]}function b(){const x=new C,_=new C,m=new C,L=new C,T=new fe,A=new fe,D=new fe;for(let S=0,y=0;S<r.length;S+=9,y+=6){x.set(r[S+0],r[S+1],r[S+2]),_.set(r[S+3],r[S+4],r[S+5]),m.set(r[S+6],r[S+7],r[S+8]),T.set(a[y+0],a[y+1]),A.set(a[y+2],a[y+3]),D.set(a[y+4],a[y+5]),L.copy(x).add(_).add(m).divideScalar(3);const P=g(L);v(T,y+0,x,P),v(A,y+2,_,P),v(D,y+4,m,P)}}function v(x,_,m,L){L<0&&x.x===1&&(a[_]=x.x-1),m.x===0&&m.z===0&&(a[_]=L/2/Math.PI+.5)}function g(x){return Math.atan2(x.z,-x.x)}function p(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wl(e.vertices,e.indices,e.radius,e.details)}}class Va extends au{constructor(e){super(e),this.uuid=wn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(new au().fromJSON(i))}return this}}const Iv={triangulate:function(s,e,t=2){const n=e&&e.length,i=n?e[0]*t:s.length;let r=vd(s,0,i,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,c,l,h,u,d,f;if(n&&(r=Ov(s,e,r,t)),s.length>80*t){o=l=s[0],c=h=s[1];for(let b=t;b<i;b+=t)u=s[b],d=s[b+1],u<o&&(o=u),d<c&&(c=d),u>l&&(l=u),d>h&&(h=d);f=Math.max(l-o,h-c),f=f!==0?32767/f:0}return Tr(r,a,t,o,c,f,0),a}};function vd(s,e,t,n,i){let r,a;if(i===Yv(s,e,t,n)>0)for(r=e;r<t;r+=n)a=ou(r,s[r],s[r+1],a);else for(r=t-n;r>=e;r-=n)a=ou(r,s[r],s[r+1],a);return a&&Wa(a,a.next)&&(Rr(a),a=a.next),a}function rs(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(Wa(t,t.next)||Rt(t.prev,t,t.next)===0)){if(Rr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Tr(s,e,t,n,i,r,a){if(!s)return;!a&&r&&Hv(s,n,i,r);let o=s,c,l;for(;s.prev!==s.next;){if(c=s.prev,l=s.next,r?Nv(s,n,i,r):Dv(s)){e.push(c.i/t|0),e.push(s.i/t|0),e.push(l.i/t|0),Rr(s),s=l.next,o=l.next;continue}if(s=l,s===o){a?a===1?(s=Uv(rs(s),e,t),Tr(s,e,t,n,i,r,2)):a===2&&Fv(s,e,t,n,i,r):Tr(rs(s),e,t,n,i,r,1);break}}}function Dv(s){const e=s.prev,t=s,n=s.next;if(Rt(e,t,n)>=0)return!1;const i=e.x,r=t.x,a=n.x,o=e.y,c=t.y,l=n.y,h=i<r?i<a?i:a:r<a?r:a,u=o<c?o<l?o:l:c<l?c:l,d=i>r?i>a?i:a:r>a?r:a,f=o>c?o>l?o:l:c>l?c:l;let b=n.next;for(;b!==e;){if(b.x>=h&&b.x<=d&&b.y>=u&&b.y<=f&&Ps(i,o,r,c,a,l,b.x,b.y)&&Rt(b.prev,b,b.next)>=0)return!1;b=b.next}return!0}function Nv(s,e,t,n){const i=s.prev,r=s,a=s.next;if(Rt(i,r,a)>=0)return!1;const o=i.x,c=r.x,l=a.x,h=i.y,u=r.y,d=a.y,f=o<c?o<l?o:l:c<l?c:l,b=h<u?h<d?h:d:u<d?u:d,v=o>c?o>l?o:l:c>l?c:l,g=h>u?h>d?h:d:u>d?u:d,p=qc(f,b,e,t,n),x=qc(v,g,e,t,n);let _=s.prevZ,m=s.nextZ;for(;_&&_.z>=p&&m&&m.z<=x;){if(_.x>=f&&_.x<=v&&_.y>=b&&_.y<=g&&_!==i&&_!==a&&Ps(o,h,c,u,l,d,_.x,_.y)&&Rt(_.prev,_,_.next)>=0||(_=_.prevZ,m.x>=f&&m.x<=v&&m.y>=b&&m.y<=g&&m!==i&&m!==a&&Ps(o,h,c,u,l,d,m.x,m.y)&&Rt(m.prev,m,m.next)>=0))return!1;m=m.nextZ}for(;_&&_.z>=p;){if(_.x>=f&&_.x<=v&&_.y>=b&&_.y<=g&&_!==i&&_!==a&&Ps(o,h,c,u,l,d,_.x,_.y)&&Rt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;m&&m.z<=x;){if(m.x>=f&&m.x<=v&&m.y>=b&&m.y<=g&&m!==i&&m!==a&&Ps(o,h,c,u,l,d,m.x,m.y)&&Rt(m.prev,m,m.next)>=0)return!1;m=m.nextZ}return!0}function Uv(s,e,t){let n=s;do{const i=n.prev,r=n.next.next;!Wa(i,r)&&xd(i,n,n.next,r)&&Ar(i,r)&&Ar(r,i)&&(e.push(i.i/t|0),e.push(n.i/t|0),e.push(r.i/t|0),Rr(n),Rr(n.next),n=s=r),n=n.next}while(n!==s);return rs(n)}function Fv(s,e,t,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Xv(a,o)){let c=_d(a,o);a=rs(a,a.next),c=rs(c,c.next),Tr(a,e,t,n,i,r,0),Tr(c,e,t,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function Ov(s,e,t,n){const i=[];let r,a,o,c,l;for(r=0,a=e.length;r<a;r++)o=e[r]*n,c=r<a-1?e[r+1]*n:s.length,l=vd(s,o,c,n,!1),l===l.next&&(l.steiner=!0),i.push(Wv(l));for(i.sort(kv),r=0;r<i.length;r++)t=Bv(i[r],t);return t}function kv(s,e){return s.x-e.x}function Bv(s,e){const t=zv(s,e);if(!t)return e;const n=_d(t,s);return rs(n,n.next),rs(t,t.next)}function zv(s,e){let t=e,n=-1/0,i;const r=s.x,a=s.y;do{if(a<=t.y&&a>=t.next.y&&t.next.y!==t.y){const d=t.x+(a-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=r&&d>n&&(n=d,i=t.x<t.next.x?t:t.next,d===r))return i}t=t.next}while(t!==e);if(!i)return null;const o=i,c=i.x,l=i.y;let h=1/0,u;t=i;do r>=t.x&&t.x>=c&&r!==t.x&&Ps(a<l?r:n,a,c,l,a<l?n:r,a,t.x,t.y)&&(u=Math.abs(a-t.y)/(r-t.x),Ar(t,s)&&(u<h||u===h&&(t.x>i.x||t.x===i.x&&Gv(i,t)))&&(i=t,h=u)),t=t.next;while(t!==o);return i}function Gv(s,e){return Rt(s.prev,s,e.prev)<0&&Rt(e.next,s,s.next)<0}function Hv(s,e,t,n){let i=s;do i.z===0&&(i.z=qc(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,Vv(i)}function Vv(s){let e,t,n,i,r,a,o,c,l=1;do{for(t=s,s=null,r=null,a=0;t;){for(a++,n=t,o=0,e=0;e<l&&(o++,n=n.nextZ,!!n);e++);for(c=l;o>0||c>0&&n;)o!==0&&(c===0||!n||t.z<=n.z)?(i=t,t=t.nextZ,o--):(i=n,n=n.nextZ,c--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;t=n}r.nextZ=null,l*=2}while(a>1);return s}function qc(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function Wv(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Ps(s,e,t,n,i,r,a,o){return(i-a)*(e-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(i-a)*(n-o)}function Xv(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!jv(s,e)&&(Ar(s,e)&&Ar(e,s)&&qv(s,e)&&(Rt(s.prev,s,e.prev)||Rt(s,e.prev,e))||Wa(s,e)&&Rt(s.prev,s,s.next)>0&&Rt(e.prev,e,e.next)>0)}function Rt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function Wa(s,e){return s.x===e.x&&s.y===e.y}function xd(s,e,t,n){const i=_a(Rt(s,e,t)),r=_a(Rt(s,e,n)),a=_a(Rt(t,n,s)),o=_a(Rt(t,n,e));return!!(i!==r&&a!==o||i===0&&xa(s,t,e)||r===0&&xa(s,n,e)||a===0&&xa(t,s,n)||o===0&&xa(t,e,n))}function xa(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function _a(s){return s>0?1:s<0?-1:0}function jv(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&xd(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Ar(s,e){return Rt(s.prev,s,s.next)<0?Rt(s,e,s.next)>=0&&Rt(s,s.prev,e)>=0:Rt(s,e,s.prev)<0||Rt(s,s.next,e)<0}function qv(s,e){let t=s,n=!1;const i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function _d(s,e){const t=new Yc(s.i,s.x,s.y),n=new Yc(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function ou(s,e,t,n){const i=new Yc(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Rr(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Yc(s,e,t){this.i=s,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Yv(s,e,t,n){let i=0;for(let r=e,a=t-n;r<t;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}class xr{static area(e){const t=e.length;let n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return xr.area(e)<0}static triangulateShape(e,t){const n=[],i=[],r=[];cu(e),lu(n,e);let a=e.length;t.forEach(cu);for(let c=0;c<t.length;c++)i.push(a),a+=t[c].length,lu(n,t[c]);const o=Iv.triangulate(n,i);for(let c=0;c<o.length;c+=3)r.push(o.slice(c,c+3));return r}}function cu(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function lu(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class Ir extends Lt{constructor(e=new Va([new fe(.5,.5),new fe(-.5,.5),new fe(-.5,-.5),new fe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,i=[],r=[];for(let o=0,c=e.length;o<c;o++){const l=e[o];a(l)}this.setAttribute("position",new yt(i,3)),this.setAttribute("uv",new yt(r,2)),this.computeVertexNormals();function a(o){const c=[],l=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,b=t.bevelSize!==void 0?t.bevelSize:f-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,x=t.UVGenerator!==void 0?t.UVGenerator:Kv;let _,m=!1,L,T,A,D;p&&(_=p.getSpacedPoints(h),m=!0,d=!1,L=p.computeFrenetFrames(h,!1),T=new C,A=new C,D=new C),d||(g=0,f=0,b=0,v=0);const S=o.extractPoints(l);let y=S.shape;const P=S.holes;if(!xr.isClockWise(y)){y=y.reverse();for(let Q=0,oe=P.length;Q<oe;Q++){const I=P[Q];xr.isClockWise(I)&&(P[Q]=I.reverse())}}const k=xr.triangulateShape(y,P),V=y;for(let Q=0,oe=P.length;Q<oe;Q++){const I=P[Q];y=y.concat(I)}function $(Q,oe,I){return oe||console.error("THREE.ExtrudeGeometry: vec does not exist"),Q.clone().addScaledVector(oe,I)}const H=y.length,Z=k.length;function W(Q,oe,I){let Fe,ae,Ee;const ge=Q.x-oe.x,De=Q.y-oe.y,Pe=I.x-Q.x,R=I.y-Q.y,M=ge*ge+De*De,B=ge*R-De*Pe;if(Math.abs(B)>Number.EPSILON){const ee=Math.sqrt(M),se=Math.sqrt(Pe*Pe+R*R),te=oe.x-De/ee,Ue=oe.y+ge/ee,be=I.x-R/se,Ce=I.y+Pe/se,it=((be-te)*R-(Ce-Ue)*Pe)/(ge*R-De*Pe);Fe=te+ge*it-Q.x,ae=Ue+De*it-Q.y;const ce=Fe*Fe+ae*ae;if(ce<=2)return new fe(Fe,ae);Ee=Math.sqrt(ce/2)}else{let ee=!1;ge>Number.EPSILON?Pe>Number.EPSILON&&(ee=!0):ge<-Number.EPSILON?Pe<-Number.EPSILON&&(ee=!0):Math.sign(De)===Math.sign(R)&&(ee=!0),ee?(Fe=-De,ae=ge,Ee=Math.sqrt(M)):(Fe=ge,ae=De,Ee=Math.sqrt(M/2))}return new fe(Fe/Ee,ae/Ee)}const he=[];for(let Q=0,oe=V.length,I=oe-1,Fe=Q+1;Q<oe;Q++,I++,Fe++)I===oe&&(I=0),Fe===oe&&(Fe=0),he[Q]=W(V[Q],V[I],V[Fe]);const ie=[];let ue,ve=he.concat();for(let Q=0,oe=P.length;Q<oe;Q++){const I=P[Q];ue=[];for(let Fe=0,ae=I.length,Ee=ae-1,ge=Fe+1;Fe<ae;Fe++,Ee++,ge++)Ee===ae&&(Ee=0),ge===ae&&(ge=0),ue[Fe]=W(I[Fe],I[Ee],I[ge]);ie.push(ue),ve=ve.concat(ue)}for(let Q=0;Q<g;Q++){const oe=Q/g,I=f*Math.cos(oe*Math.PI/2),Fe=b*Math.sin(oe*Math.PI/2)+v;for(let ae=0,Ee=V.length;ae<Ee;ae++){const ge=$(V[ae],he[ae],Fe);re(ge.x,ge.y,-I)}for(let ae=0,Ee=P.length;ae<Ee;ae++){const ge=P[ae];ue=ie[ae];for(let De=0,Pe=ge.length;De<Pe;De++){const R=$(ge[De],ue[De],Fe);re(R.x,R.y,-I)}}}const xe=b+v;for(let Q=0;Q<H;Q++){const oe=d?$(y[Q],ve[Q],xe):y[Q];m?(A.copy(L.normals[0]).multiplyScalar(oe.x),T.copy(L.binormals[0]).multiplyScalar(oe.y),D.copy(_[0]).add(A).add(T),re(D.x,D.y,D.z)):re(oe.x,oe.y,0)}for(let Q=1;Q<=h;Q++)for(let oe=0;oe<H;oe++){const I=d?$(y[oe],ve[oe],xe):y[oe];m?(A.copy(L.normals[Q]).multiplyScalar(I.x),T.copy(L.binormals[Q]).multiplyScalar(I.y),D.copy(_[Q]).add(A).add(T),re(D.x,D.y,D.z)):re(I.x,I.y,u/h*Q)}for(let Q=g-1;Q>=0;Q--){const oe=Q/g,I=f*Math.cos(oe*Math.PI/2),Fe=b*Math.sin(oe*Math.PI/2)+v;for(let ae=0,Ee=V.length;ae<Ee;ae++){const ge=$(V[ae],he[ae],Fe);re(ge.x,ge.y,u+I)}for(let ae=0,Ee=P.length;ae<Ee;ae++){const ge=P[ae];ue=ie[ae];for(let De=0,Pe=ge.length;De<Pe;De++){const R=$(ge[De],ue[De],Fe);m?re(R.x,R.y+_[h-1].y,_[h-1].x+I):re(R.x,R.y,u+I)}}}J(),G();function J(){const Q=i.length/3;if(d){let oe=0,I=H*oe;for(let Fe=0;Fe<Z;Fe++){const ae=k[Fe];pe(ae[2]+I,ae[1]+I,ae[0]+I)}oe=h+g*2,I=H*oe;for(let Fe=0;Fe<Z;Fe++){const ae=k[Fe];pe(ae[0]+I,ae[1]+I,ae[2]+I)}}else{for(let oe=0;oe<Z;oe++){const I=k[oe];pe(I[2],I[1],I[0])}for(let oe=0;oe<Z;oe++){const I=k[oe];pe(I[0]+H*h,I[1]+H*h,I[2]+H*h)}}n.addGroup(Q,i.length/3-Q,0)}function G(){const Q=i.length/3;let oe=0;z(V,oe),oe+=V.length;for(let I=0,Fe=P.length;I<Fe;I++){const ae=P[I];z(ae,oe),oe+=ae.length}n.addGroup(Q,i.length/3-Q,1)}function z(Q,oe){let I=Q.length;for(;--I>=0;){const Fe=I;let ae=I-1;ae<0&&(ae=Q.length-1);for(let Ee=0,ge=h+g*2;Ee<ge;Ee++){const De=H*Ee,Pe=H*(Ee+1),R=oe+Fe+De,M=oe+ae+De,B=oe+ae+Pe,ee=oe+Fe+Pe;Ie(R,M,B,ee)}}}function re(Q,oe,I){c.push(Q),c.push(oe),c.push(I)}function pe(Q,oe,I){Re(Q),Re(oe),Re(I);const Fe=i.length/3,ae=x.generateTopUV(n,i,Fe-3,Fe-2,Fe-1);Ke(ae[0]),Ke(ae[1]),Ke(ae[2])}function Ie(Q,oe,I,Fe){Re(Q),Re(oe),Re(Fe),Re(oe),Re(I),Re(Fe);const ae=i.length/3,Ee=x.generateSideWallUV(n,i,ae-6,ae-3,ae-2,ae-1);Ke(Ee[0]),Ke(Ee[1]),Ke(Ee[3]),Ke(Ee[1]),Ke(Ee[2]),Ke(Ee[3])}function Re(Q){i.push(c[Q*3+0]),i.push(c[Q*3+1]),i.push(c[Q*3+2])}function Ke(Q){r.push(Q.x),r.push(Q.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return $v(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];n.push(o)}const i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new jc[i.type]().fromJSON(i)),new Ir(n,e.options)}}const Kv={generateTopUV:function(s,e,t,n,i){const r=e[t*3],a=e[t*3+1],o=e[n*3],c=e[n*3+1],l=e[i*3],h=e[i*3+1];return[new fe(r,a),new fe(o,c),new fe(l,h)]},generateSideWallUV:function(s,e,t,n,i,r){const a=e[t*3],o=e[t*3+1],c=e[t*3+2],l=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[i*3],f=e[i*3+1],b=e[i*3+2],v=e[r*3],g=e[r*3+1],p=e[r*3+2];return Math.abs(o-h)<Math.abs(a-l)?[new fe(a,1-c),new fe(l,1-u),new fe(d,1-b),new fe(v,1-p)]:[new fe(o,1-c),new fe(h,1-u),new fe(f,1-b),new fe(g,1-p)]}};function $v(s,e,t){if(t.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Oa extends wl{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Oa(e.radius,e.detail)}}class Xa extends Lt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const h=[],u=new C,d=new C,f=[],b=[],v=[],g=[];for(let p=0;p<=n;p++){const x=[],_=p/n;let m=0;p===0&&a===0?m=.5/t:p===n&&c===Math.PI&&(m=-.5/t);for(let L=0;L<=t;L++){const T=L/t;u.x=-e*Math.cos(i+T*r)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(i+T*r)*Math.sin(a+_*o),b.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),g.push(T+m,1-_),x.push(l++)}h.push(x)}for(let p=0;p<n;p++)for(let x=0;x<t;x++){const _=h[p][x+1],m=h[p][x],L=h[p+1][x],T=h[p+1][x+1];(p!==0||a>0)&&f.push(_,m,T),(p!==n-1||c<Math.PI)&&f.push(m,L,T)}this.setIndex(f),this.setAttribute("position",new yt(b,3)),this.setAttribute("normal",new yt(v,3)),this.setAttribute("uv",new yt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xa(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class El extends Lt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],c=[],l=[],h=new C,u=new C,d=new C;for(let f=0;f<=n;f++)for(let b=0;b<=i;b++){const v=b/i*r,g=f/n*Math.PI*2;u.x=(e+t*Math.cos(g))*Math.cos(v),u.y=(e+t*Math.cos(g))*Math.sin(v),u.z=t*Math.sin(g),o.push(u.x,u.y,u.z),h.x=e*Math.cos(v),h.y=e*Math.sin(v),d.subVectors(u,h).normalize(),c.push(d.x,d.y,d.z),l.push(b/i),l.push(f/n)}for(let f=1;f<=n;f++)for(let b=1;b<=i;b++){const v=(i+1)*f+b-1,g=(i+1)*(f-1)+b-1,p=(i+1)*(f-1)+b,x=(i+1)*f+b;a.push(v,g,x),a.push(g,p,x)}this.setIndex(a),this.setAttribute("position",new yt(o,3)),this.setAttribute("normal",new yt(c,3)),this.setAttribute("uv",new yt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new El(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class qt extends Un{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=hl,this.normalScale=new fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Xn extends qt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new fe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Gt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Le(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Le(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Le(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class ji extends Un{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=hl,this.normalScale=new fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=nl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}function ya(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function Jv(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Zv(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function hu(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let c=0;c!==e;++c)i[a++]=s[o+c]}return i}function yd(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push.apply(t,a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}class Dr{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break e}a=t.length;break t}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Qv extends Dr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Yl,endingEnd:Yl}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Kl:r=e,o=2*t-n;break;case $l:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Kl:a=e,c=2*n-t;break;case $l:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}const l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,b=(n-t)/(i-t),v=b*b,g=v*b,p=-d*g+2*d*v-d*b,x=(1+d)*g+(-1.5-2*d)*v+(-.5+d)*b+1,_=(-1-f)*g+(1.5+f)*v+.5*b,m=f*g-f*v;for(let L=0;L!==o;++L)r[L]=p*a[h+L]+x*a[l+L]+_*a[c+L]+m*a[u+L];return r}}class ex extends Dr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}}class tx extends Dr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class jn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ya(t,this.TimeBufferType),this.values=ya(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ya(e.times,Array),values:ya(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new tx(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ex(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Qv(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Sr:t=this.InterpolantFactoryMethodDiscrete;break;case wr:t=this.InterpolantFactoryMethodLinear;break;case lo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Sr;case this.InterpolantFactoryMethodLinear:return wr;case this.InterpolantFactoryMethodSmooth:return lo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&Jv(i))for(let o=0,c=i.length;o!==c;++o){const l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===lo,r=e.length-1;let a=1;for(let o=1;o<r;++o){let c=!1;const l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(i)c=!0;else{const u=o*n,d=u-n,f=u+n;for(let b=0;b!==n;++b){const v=t[u+b];if(v!==t[d+b]||v!==t[f+b]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}jn.prototype.TimeBufferType=Float32Array;jn.prototype.ValueBufferType=Float32Array;jn.prototype.DefaultInterpolation=wr;class Ys extends jn{constructor(e,t,n){super(e,t,n)}}Ys.prototype.ValueTypeName="bool";Ys.prototype.ValueBufferType=Array;Ys.prototype.DefaultInterpolation=Sr;Ys.prototype.InterpolantFactoryMethodLinear=void 0;Ys.prototype.InterpolantFactoryMethodSmooth=void 0;class Md extends jn{}Md.prototype.ValueTypeName="color";class Vs extends jn{}Vs.prototype.ValueTypeName="number";class nx extends Dr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t);let l=e*o;for(let h=l+o;l!==h;l+=4)Fn.slerpFlat(r,0,a,l-o,a,l,c);return r}}class Ws extends jn{InterpolantFactoryMethodLinear(e){return new nx(this.times,this.values,this.getValueSize(),e)}}Ws.prototype.ValueTypeName="quaternion";Ws.prototype.InterpolantFactoryMethodSmooth=void 0;class Ks extends jn{constructor(e,t,n){super(e,t,n)}}Ks.prototype.ValueTypeName="string";Ks.prototype.ValueBufferType=Array;Ks.prototype.DefaultInterpolation=Sr;Ks.prototype.InterpolantFactoryMethodLinear=void 0;Ks.prototype.InterpolantFactoryMethodSmooth=void 0;class Xs extends jn{}Xs.prototype.ValueTypeName="vector";class ix{constructor(e="",t=-1,n=[],i=Ef){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=wn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(rx(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,a=n.length;r!==a;++r)t.push(jn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);const h=Zv(c);c=hu(c,1,h),l=hu(l,1,h),!i&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new Vs(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],h=l.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(l)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,b,v){if(f.length!==0){const g=[],p=[];yd(f,g,p,b),g.length!==0&&v.push(new u(d,g,p))}},i=[],r=e.name||"default",a=e.fps||30,o=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let u=0;u<l.length;u++){const d=l[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let b;for(b=0;b<d.length;b++)if(d[b].morphTargets)for(let v=0;v<d[b].morphTargets.length;v++)f[d[b].morphTargets[v]]=-1;for(const v in f){const g=[],p=[];for(let x=0;x!==d[b].morphTargets.length;++x){const _=d[b];g.push(_.time),p.push(_.morphTarget===v?1:0)}i.push(new Vs(".morphTargetInfluence["+v+"]",g,p))}c=f.length*a}else{const f=".bones["+t[u].name+"]";n(Xs,f+".position",d,"pos",i),n(Ws,f+".quaternion",d,"rot",i),n(Xs,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,c,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function sx(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Vs;case"vector":case"vector2":case"vector3":case"vector4":return Xs;case"color":return Md;case"quaternion":return Ws;case"bool":case"boolean":return Ys;case"string":return Ks}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function rx(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=sx(s.type);if(s.times===void 0){const t=[],n=[];yd(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const Di={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class ax{constructor(e,t,n){const i=this;let r=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){const u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){const f=l[u],b=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return b}return null}}}const ox=new ax;class $s{constructor(e){this.manager=e!==void 0?e:ox,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}$s.DEFAULT_MATERIAL_NAME="__DEFAULT";const ei={};class cx extends Error{constructor(e,t){super(e),this.response=t}}class Sd extends $s{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Di.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(ei[e]!==void 0){ei[e].push({onLoad:t,onProgress:n,onError:i});return}ei[e]=[],ei[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=ei[e],u=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,b=f!==0;let v=0;const g=new ReadableStream({start(p){x();function x(){u.read().then(({done:_,value:m})=>{if(_)p.close();else{v+=m.byteLength;const L=new ProgressEvent("progress",{lengthComputable:b,loaded:v,total:f});for(let T=0,A=h.length;T<A;T++){const D=h[T];D.onProgress&&D.onProgress(L)}p.enqueue(m),x()}},_=>{p.error(_)})}}});return new Response(g)}else throw new cx(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o===void 0)return l.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(b=>f.decode(b))}}}).then(l=>{Di.add(e,l);const h=ei[e];delete ei[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(l)}}).catch(l=>{const h=ei[e];if(h===void 0)throw this.manager.itemError(e),l;delete ei[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class lx extends $s{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Di.get(e);if(a!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a;const o=Er("img");function c(){h(),Di.add(e,this),t&&t(this),r.manager.itemEnd(e)}function l(u){h(),i&&i(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(e),o.src=e,o}}class wd extends $s{constructor(e){super(e)}load(e,t,n,i){const r=new jt,a=new lx(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class ja extends Et{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Le(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class hx extends ja{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Le(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Xo=new Je,uu=new C,du=new C;class Tl{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new fe(512,512),this.map=null,this.mapPass=null,this.matrix=new Je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new fl,this._frameExtents=new fe(1,1),this._viewportCount=1,this._viewports=[new mt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;uu.setFromMatrixPosition(e.matrixWorld),t.position.copy(uu),du.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(du),t.updateMatrixWorld(),Xo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Xo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Xo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class ux extends Tl{constructor(){super(new rn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Gs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class dx extends ja{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new ux}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const fu=new Je,cr=new C,jo=new C;class fx extends Tl{constructor(){super(new rn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new fe(4,2),this._viewportCount=6,this._viewports=[new mt(2,1,1,1),new mt(0,1,1,1),new mt(3,1,1,1),new mt(1,1,1,1),new mt(3,0,1,1),new mt(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),cr.setFromMatrixPosition(e.matrixWorld),n.position.copy(cr),jo.copy(n.position),jo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(jo),n.updateMatrixWorld(),i.makeTranslation(-cr.x,-cr.y,-cr.z),fu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(fu)}}class px extends ja{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new fx}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class mx extends Tl{constructor(){super(new pl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ed extends ja{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.shadow=new mx}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class _r{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class gx extends $s{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Di.get(e);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(l=>{t&&t(l),r.manager.itemEnd(e)}).catch(l=>{i&&i(l)});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Di.add(e,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),Di.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});Di.add(e,c),r.manager.itemStart(e)}}const Al="\\[\\]\\.:\\/",bx=new RegExp("["+Al+"]","g"),Rl="[^"+Al+"]",vx="[^"+Al.replace("\\.","")+"]",xx=/((?:WC+[\/:])*)/.source.replace("WC",Rl),_x=/(WCOD+)?/.source.replace("WCOD",vx),yx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Rl),Mx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Rl),Sx=new RegExp("^"+xx+_x+yx+Mx+"$"),wx=["material","materials","bones","map"];class Ex{constructor(e,t,n){const i=n||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class _t{constructor(e,t,n){this.path=t,this.parsedPath=n||_t.parseTrackName(t),this.node=_t.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new _t.Composite(e,t,n):new _t(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(bx,"")}static parseTrackName(e){const t=Sx.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);wx.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=_t.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[i];if(a===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}_t.Composite=Ex;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const pu=new Je;class Tx{constructor(e,t,n=0,i=1/0){this.ray=new Pr(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new dl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return pu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(pu),this}intersectObject(e,t=!0,n=[]){return Kc(e,this,n,t),n.sort(mu),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)Kc(e[i],this,n,t);return n.sort(mu),n}}function mu(s,e){return s.distance-e.distance}function Kc(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)Kc(r[a],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:tl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=tl);const Ai=s=>s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]||e);function Ax(s){var t,n,i;const e=[];/^species:[a-z-]+$/.test(s.id)||e.push(s.key+": bad id"),(t=s.commonName)!=null&&t.en||e.push(s.key+": missing English name"),(n=s.facts)!=null&&n.length||e.push(s.key+": no facts");for(const r of s.facts??[])(!((i=r.sources)!=null&&i.length)||r.sources.some(a=>!/^https:\/\//.test(a.url)))&&e.push(s.key+"/"+r.id+": fact without https source");return e}function Rx(s,e,t="en"){var c,l,h;const n=s.commonName[t]??s.commonName.en,i=t!=="nb"&&s.commonName.nb?" · "+s.commonName.nb:"",r=s.facts.map(u=>"<p>"+Ai(u.text)+"</p>"+u.sources.map(d=>'<a href="'+Ai(d.url)+'" target="_blank" rel="noreferrer">'+Ai(d.label)+" ↗</a>").join("")).join(""),a=(l=(c=s.uses)==null?void 0:c[e])==null?void 0:l.role,o=(h=s.links)!=null&&h.speciesProfile?'<a class="w-profile" href="'+Ai(s.links.speciesProfile)+'" target="_blank" rel="noreferrer">Open the full SPECIES profile ↗</a>':"";return"<small>WHAT IS THAT?</small><h3>"+Ai(n)+"</h3><em>"+Ai(s.scientificName)+Ai(i)+"</em>"+r+(a?"<strong>"+Ai(a)+"</strong>":"")+o}const Cx="../species.schema.json",Px=1,Lx="species:orcinus-orca",Ix="orca",Dx="Orcinus orca",Nx={en:"Killer whale",nb:"Spekkhogger"},Ux=[{id:"orca-1",text:"Killer whales range from equatorial waters to the ice edge. Around Svalbard they have been reported in fjords and along the southern fringe of the northern pack ice.",sources:[{label:"Norwegian Polar Institute",url:"https://npolar.no/en/species/killer-whale/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],Fx={"wild-orca":{role:"You · a highly social apex predator whose diet and hunting traditions can differ between pods."}},Ox={approxGameLengthM:7,note:"Game-scale value for rendering, not a morphometric claim."},kx={speciesProfile:null,naturebrain:null},Bx={$schema:Cx,schemaVersion:Px,id:Lx,key:Ix,scientificName:Dx,commonName:Nx,facts:Ux,uses:Fx,visual:Ox,links:kx},zx="../species.schema.json",Gx=1,Hx="species:delphinapterus-leucas",Vx="beluga",Wx="Delphinapterus leucas",Xx={en:"White whale / Beluga",nb:"Hvithval"},jx=[{id:"beluga-1",text:"White whales are Svalbard’s most commonly observed cetacean. They stay close to the coast and often spend time at tidal glacier fronts during the ice-free season.",sources:[{label:"Norwegian Polar Institute",url:"https://npolar.no/en/species/white-whale/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],qx={"wild-orca":{role:"Social Arctic toothed whale · encounter, not a hunt target in this slice."}},Yx={approxGameLengthM:4.3,note:"Game-scale value for rendering, not a morphometric claim."},Kx={speciesProfile:null,naturebrain:null},$x={$schema:zx,schemaVersion:Gx,id:Hx,key:Vx,scientificName:Wx,commonName:Xx,facts:jx,uses:qx,visual:Yx,links:Kx},Jx="../species.schema.json",Zx=1,Qx="species:monodon-monoceros",e_="narwhal",t_="Monodon monoceros",n_={en:"Narwhal",nb:"Narhval"},i_=[{id:"narwhal-1",text:"Narwhals occur in northern Svalbard. Adult males commonly carry the long spiral tusk that makes the species unmistakable.",sources:[{label:"Norwegian Polar Institute",url:"https://npolar.no/en/species/narwhal/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],s_={"wild-orca":{role:"Ice-associated Arctic toothed whale · rare surprise encounter."}},r_={approxGameLengthM:4.4,note:"Game-scale value for rendering, not a morphometric claim."},a_={speciesProfile:null,naturebrain:null},o_={$schema:Jx,schemaVersion:Zx,id:Qx,key:e_,scientificName:t_,commonName:n_,facts:i_,uses:s_,visual:r_,links:a_},c_="../species.schema.json",l_=1,h_="species:pusa-hispida",u_="ringed-seal",d_="Pusa hispida",f_={en:"Ringed seal",nb:"Ringsel"},p_=[{id:"ringed-seal-1",text:"Ringed seals are strongly tied to Arctic sea ice and can maintain breathing holes in fast ice. In Svalbard they occur in fjords and along the northern ice edge.",sources:[{label:"Norwegian Polar Institute",url:"https://npolar.no/en/species/ringed-seal/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],m_={"wild-orca":{role:"Ice-associated seal · part of the Arctic predator–prey web; not hunted in this first slice."}},g_={approxGameLengthM:1.45,note:"Game-scale value for rendering, not a morphometric claim."},b_={speciesProfile:null,naturebrain:null},v_={$schema:c_,schemaVersion:l_,id:h_,key:u_,scientificName:d_,commonName:f_,facts:p_,uses:m_,visual:g_,links:b_},x_="../species.schema.json",__=1,y_="species:odobenus-rosmarus",M_="walrus",S_="Odobenus rosmarus",w_={en:"Walrus",nb:"Hvalross"},E_=[{id:"walrus-1",text:"Atlantic walruses use shallow coastal areas around Svalbard. Adults can exceed a tonne and are strongly associated with benthic feeding grounds and haul-out sites.",sources:[{label:"Norwegian Polar Institute",url:"https://npolar.no/en/species/walrus/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],T_={"wild-orca":{role:"Large coastal benthic feeder · encounter, not prey."}},A_={approxGameLengthM:3,note:"Game-scale value for rendering, not a morphometric claim."},R_={speciesProfile:null,naturebrain:null},C_={$schema:x_,schemaVersion:__,id:y_,key:M_,scientificName:S_,commonName:w_,facts:E_,uses:T_,visual:A_,links:R_},P_="../species.schema.json",L_=1,I_="species:boreogadus-saida",D_="polar-cod",N_="Boreogadus saida",U_={en:"Polar cod",nb:"Polartorsk"},F_=[{id:"polar-cod-1",text:"Polar cod is an important Arctic fish. Svalbard white whales are reported to feed heavily on polar cod, showing how this small fish connects larger predators to the Arctic food web.",sources:[{label:"Norwegian Polar Institute · food-web context",url:"https://npolar.no/en/species/white-whale/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],O_={"wild-orca":{role:"Small forage fish · first fast chase-and-bite target."}},k_={approxGameLengthM:.25,note:"Game-scale value for rendering, not a morphometric claim."},B_={speciesProfile:null,naturebrain:null},z_={$schema:P_,schemaVersion:L_,id:I_,key:D_,scientificName:N_,commonName:U_,facts:F_,uses:O_,visual:k_,links:B_},G_="../species.schema.json",H_=1,V_="species:clupea-harengus",W_="herring",X_="Clupea harengus",j_={en:"Atlantic herring",nb:"Sild"},q_=[{id:"herring-1",text:"In northern Norway, killer whales can cooperate to compress schooling herring into dense bait balls before feeding.",sources:[{label:"Peer-reviewed killer-whale feeding research",url:"https://www.sciencedirect.com/science/article/pii/S1616504717301167"}],evidence:"peer-reviewed",review:"unreviewed-draft",interpretation:"direct-statement"},{id:"herring-2",text:"Field recordings in a northern Norwegian fjord showed killer whales herding herring into tight schools near the surface, stunning fish with underwater slaps of the flukes, then eating the stunned fish one by one.",sources:[{label:"Domenici et al. 2000 · J. Exp. Biol. 203:283–294",url:"https://pure.uhi.ac.uk/en/publications/killer-whales-orcinus-orca-feeding-on-schooling-herring-clupea-ha/"}],evidence:"peer-reviewed",review:"unreviewed-draft",interpretation:"summary-of-source"}],Y_={"wild-orca":{role:"Schooling forage fish · cooperative carousel-hunt target."}},K_={approxGameLengthM:.3,note:"Game-scale value for rendering, not a morphometric claim."},$_={speciesProfile:null,naturebrain:null},J_={$schema:G_,schemaVersion:H_,id:V_,key:W_,scientificName:X_,commonName:j_,facts:q_,uses:Y_,visual:K_,links:$_},Z_="../species.schema.json",Q_=1,ey="species:megaptera-novaeangliae",ty="humpback",ny="Megaptera novaeangliae",iy={en:"Humpback whale",nb:"Knølhval"},sy=[{id:"humpback-1",text:"Humpback whales are among the baleen whales that visit Svalbard waters from the south to feed during summer.",sources:[{label:"Norwegian Polar Institute",url:"https://npolar.no/en/themes/fauna-svalbard/"}],evidence:"authoritative-agency",review:"unreviewed-draft",interpretation:"direct-statement"}],ry={"wild-orca":{role:"Large seasonal baleen whale · deep-water discovery, not prey in this slice."}},ay={approxGameLengthM:14.5,note:"Game-scale value for rendering, not a morphometric claim."},oy={speciesProfile:null,naturebrain:null},cy={$schema:Z_,schemaVersion:Q_,id:ey,key:ty,scientificName:ny,commonName:iy,facts:sy,uses:ry,visual:ay,links:oy},ly="wild-orca",Td=[Bx,$x,o_,v_,C_,z_,J_,cy],Ad=Object.fromEntries(Td.map(s=>[s.key,s])),qo=Td.flatMap(Ax),Yo=s=>Ad[s].commonName.en,hy=s=>Rx(Ad[s],ly),uy={orca:{label:"Hero Orca · ORCAST derivative of “Killer Whale”, served locally",url:"./assets/orca_decoded.glb",source:"https://github.com/GilRaitses/orcastrike/blob/eb23633cb6779c0d81198fcd91d994b7c18653c3/public/orca/LICENSE.md",rights:"CC BY 4.0 · Abner Wu / Trouvaille; modified by ORCAST (reorient, scale, textures, meshopt); WILD challenger vendored a copy with meshopt compression decoded (geometry/textures unchanged); runtime rig + animation by WILD",state:"LIVE"},orcaRemote:{label:"Hero Orca · pinned ORCAST URL (second source)",url:"https://raw.githubusercontent.com/GilRaitses/orcastrike/eb23633cb6779c0d81198fcd91d994b7c18653c3/public/orca/orca.glb",source:"https://github.com/GilRaitses/orcastrike/blob/eb23633cb6779c0d81198fcd91d994b7c18653c3/public/orca/LICENSE.md",rights:"CC BY 4.0 · same file as above",state:"FALLBACK"},orcaProcedural:{label:"Procedural rigged Orca · final fallback",url:"procedural",source:"https://github.com/",rights:"Original WILD code geometry; no third-party asset",state:"FALLBACK"},humpback:{label:"Tidewater Humpback · LOD1/LOD2 extract, served locally",url:"./assets/humpback_lite.json",source:"https://github.com/dgreenheck/tidewater/blob/4811ba48d795197de5621985f404e765c0b7c0ef/CREDITS.md",rights:"MIT © DRG Software Solutions LLC · original procedural model (anatomy-based; NOAA public-domain side-profile reference). Derivative: LOD0/uv1/rig streams removed, albedo downscaled to 1024×512 JPEG",state:"LIVE"},humpbackRemote:{label:"Tidewater Humpback · pinned full source (second source)",url:"https://raw.githubusercontent.com/dgreenheck/tidewater/4811ba48d795197de5621985f404e765c0b7c0ef/public/models/whale/humpback.json",source:"https://github.com/dgreenheck/tidewater/blob/4811ba48d795197de5621985f404e765c0b7c0ef/CREDITS.md",rights:"MIT · as above",state:"FALLBACK"},humpbackFallback:{label:"CC0 Humpback whale · baseline fallback (unchanged)",url:"https://cdn.3dassets.dev/assets/5859/v1/model.glb",source:"https://3dassets.dev/assets/open-ocean-and-deep-sea-life-humpback-whale-16525751",rights:"CC0 1.0",state:"FALLBACK"},creatures:{label:"Beluga, narwhal, ringed seal, walrus, polar cod, herring, trawler, ice, kelp, seabed, water",url:"procedural",source:"https://github.com/",rights:"Original WILD challenger code geometry and shaders; no third-party asset. Replaces the baseline sphere stand-ins and the CDN decor models (not reachable/testable from the challenger build environment).",state:"LIVE"},audio:{label:"All sound · procedural WebAudio synthesis",url:"procedural",source:"https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API",rights:"Generated at runtime. The synthesised calls are game sound design, not recordings of any real animal or pod. Baseline Wikimedia audio URLs removed pending licence re-check.",state:"LIVE"},arcticDem:{label:"ArcticDEM v4.1 · Kongsfjorden land relief (progressive, above-water backdrop only)",url:"",source:"https://www.pgc.umn.edu/data/arcticdem/",rights:"CC BY 4.0 · progressive sampled land-relief source; game derivative remains compressed/stylised",state:"REFERENCE"},svalbardMap:{label:"Svalbard base map",url:"",source:"https://geodata.npolar.no/arcgis/rest/services/Basisdata/NP_Basiskart_Svalbard_WMTS_25833/MapServer",rights:"CC BY 4.0 · geography reference",state:"REFERENCE"},bathymetry:{label:"GEBCO_2026 / IBCAO",url:"",source:"https://www.gebco.net/data-products-gridded-bathymetry-data/gebco2026-grid",rights:"Registered source foundation only. The playable seabed is procedural game geometry, not GEBCO-derived bathymetry.",state:"REFERENCE"},animatedOrcaCandidate:{label:"Deleted Sketchfab animated Orca · historical candidate",url:"",source:"https://sketchfab.com/3d-models/animated-killer-whale-orca-316ac5dee5414c9fa0fccd562c6450fb",rights:"Historical CC BY candidate · source page deleted; never runtime-bound",state:"RETIRED"}},Ko=s=>s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]||e);function dy(){return'<section class="w-sources" id="wSources" hidden><header><div><small>WILD: ORCA · SOURCES + TRUTH</small><h2>Truth stays separate from simulation.</h2></div><button id="wSourcesClose" aria-label="Close">×</button></header><p>This Svalbard-inspired slice is a compressed, stylised game world informed by Arctic ecology. It is not a metric reconstruction of a real fjord, a tracked pod route or navigation-grade bathymetry. Swim speeds, breath, hunt steps and creature counts are game abstractions.</p><p class="w-attrib">Hero Orca: based on “Killer Whale” by Abner Wu / Trouvaille (@dashdu), licensed CC BY 4.0; modified by ORCAST (reoriented, scaled, recentred, optimised); runtime rig and animation by WILD: ORCA. Humpback: Tidewater © DRG Software Solutions LLC, MIT.</p><div>'+Object.values(uy).map(e=>"<article><small>"+e.state+"</small><b>"+Ko(e.label)+"</b><p>"+Ko(e.rights)+"</p>"+(e.source&&e.source!=="https://github.com/"?'<a href="'+Ko(e.source)+'" target="_blank" rel="noreferrer">SOURCE ↗</a>':"")+"</article>").join("")+"</div></section>"}const Ts={call:'<svg viewBox="0 0 24 24"><path d="M4 12c2-3 4-3 6 0s4 3 6 0 4-3 4-3" /><path d="M4 17c2-3 4-3 6 0s4 3 6 0 4-3 4-3" opacity=".5"/></svg>',echo:'<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.6"/><path d="M10 7a7 7 0 0 1 0 10"/><path d="M14 4a11 11 0 0 1 0 16" opacity=".6"/><path d="M18 2a14 14 0 0 1 0 20" opacity=".3"/></svg>',bite:'<svg viewBox="0 0 24 24"><path d="M3 9l3 3 3-3 3 3 3-3 3 3 3-3"/><path d="M3 15l3-3 3 3 3-3 3 3 3-3 3 3" opacity=".6"/></svg>',burst:'<svg viewBox="0 0 24 24"><path d="M5 6l6 6-6 6"/><path d="M12 6l6 6-6 6"/></svg>',sound:'<svg viewBox="0 0 24 24"><path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M17 8a5 5 0 0 1 0 8" /></svg>',full:'<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'};function fy(){return'<main class="w-game"><canvas id="wCanvas" aria-label="WILD: ORCA game world"></canvas><div class="w-vignette" id="wVignette"></div><div class="w-flash" id="wFlash"></div><div class="w-markers" id="wMarkers"><div class="w-goal" id="wGoal"><i></i><span id="wGoalText">POD</span></div></div><header class="w-top"><div class="w-obj" id="wObj"><small id="wZone">WILD: ORCA · GLACIER FJORD</small><b id="wTitle">Swim with your family</b><span id="wHint"></span></div><div class="w-tools"><button id="wSnd" aria-label="Sound">'+Ts.sound+'</button><button id="wSrcBtn">SOURCES</button><button id="wFull" aria-label="Fullscreen">'+Ts.full+'</button></div></header><div class="w-status" id="wStatus"><label class="air">AIR<i><b id="wAir"></b></i></label><label class="en">ENERGY<i><b id="wEnergy"></b></i></label><span id="wDepth">8 M</span><span class="w-found">SPECIES <b id="wFound">1</b>/8</span></div><div class="w-airup" id="wAirUp">↑ AIR</div><div class="w-hunt" id="wHunt" hidden><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="bg"/><circle cx="30" cy="30" r="26" class="fg" id="wHuntRing"/></svg><b id="wHuntValue">0</b><small id="wHuntLabel">CAROUSEL</small></div><div class="w-noise" id="wNoise"><span>VESSEL NOISE</span><i><b id="wNoiseBar"></b></i></div><div class="w-tip" id="wTip"></div><div class="w-toast" id="wToast"></div><div class="w-stick" id="wStick"><span id="wKnob"></span></div><div class="w-speed" id="wSpeed">CRUISE</div><div class="w-pad" id="wPad"><div class="w-pace" id="wPace" role="slider" aria-label="Swim pace" aria-valuemin="0" aria-valuemax="2" aria-valuenow="1" tabindex="0"><span data-gear="2">CHASE</span><span data-gear="1" class="on">CRUISE</span><span data-gear="0">GLIDE</span></div><button id="wCall" class="w-btn sm" aria-label="Call">'+Ts.call+'<small>CALL</small></button><button id="wEcho" class="w-btn sm" aria-label="Echo">'+Ts.echo+'<small>ECHO</small><i class="cd" id="wEchoCd"></i></button><button id="wBurst" class="w-btn md" aria-label="Burst (hold)">'+Ts.burst+'<small>BURST</small></button><button id="wAction" class="w-btn lg" aria-label="Action">'+Ts.bite+'<small id="wActionLabel">BITE</small></button></div><section class="w-card" id="wCard" hidden><button id="wCardClose" aria-label="Close">×</button><div id="wCardBody"></div></section>'+dy()+'<section class="w-end" id="wEnd" hidden><small>WILD: ORCA · SVALBARD SLICE</small><h2 id="wEndTitle">You breached into the light.</h2><p>You moved with your family, met Arctic life, chased polar cod, worked the herring carousel, crossed noisy water and rose into the air.</p><div class="w-stats" id="wStats"></div><div class="w-endbtns"><button id="wReplay" class="primary">SWIM AGAIN</button><button id="wFree">KEEP EXPLORING</button></div></section><section class="w-start" id="wStart"><div class="w-start-inner"><small>A LIVING-OCEAN PROTOTYPE · CLAUDE CHALLENGER 01</small><h1>WILD<span>:</span> ORCA</h1><p>You are a young killer whale in a Svalbard-inspired fjord. Stay with your family, sense the water, hunt together, breathe.</p><ul class="w-howto" id="wHowTo"></ul><button id="wGo" class="primary">DIVE IN</button><em class="w-sound-hint">Best with sound on · headphones make the echo directional</em><em id="wLoadState">loading the ocean…</em></div></section></main>'}const py="<li><b>DRAG</b> anywhere to swim · clearly up/down to rise or dive</li><li>Right thumb: <b>slide PACE</b> · hold <b>BURST</b> · <b>BITE</b> in the corner</li><li>Hunting: <b>tap anywhere</b> to bite · or tap with a <b>second thumb</b> while steering</li><li>In the air: drag to <b>spin</b> and <b>flip</b> · tap an animal to learn what it is</li>",my="<li><b>A / D</b> turn · <b>W / S</b> rise / dive (or drag the mouse)</li><li><b>1 · 2 · 3</b> glide / cruise / chase · hold <b>SHIFT</b> to burst</li><li><b>SPACE</b> bite / slap / breach · <b>E</b> echo · <b>C</b> call</li><li><b>CLICK</b> an animal to learn what it is</li>",Bt=0,un=Ne.clamp,Yt=(s,e,t,n)=>s+(e-s)*(1-Math.exp(-t*n)),si=[3.1,6.4,10.2,15.2],gu=["GLIDE","CRUISE","CHASE","BURST"],bu=.068,gy=.3,vu=10.5,xu=new bn(0,0,0,"YZX"),$o=new C,Jo=new C,Zo=new C;class Rd{constructor(e=0,t=-6,n=0,i=0){Y(this,"pos",new C);Y(this,"vel",new C);Y(this,"quat",new Fn);Y(this,"forward",new C(1,0,0));Y(this,"right",new C(0,0,1));Y(this,"up",new C(0,1,0));Y(this,"yaw",0);Y(this,"pitch",0);Y(this,"roll",0);Y(this,"yawRate",0);Y(this,"pitchRate",0);Y(this,"extraRoll",0);Y(this,"spin",0);Y(this,"effort",.35);Y(this,"commanded",si[1]);Y(this,"strokePhase",0);Y(this,"strokeFreq",1.1);Y(this,"strokeAmp",.6);Y(this,"thrust",0);Y(this,"coasting",!1);Y(this,"coastTimer",0);Y(this,"strokeCount",0);Y(this,"lastPhaseCycle",0);Y(this,"airborne",!1);Y(this,"airTime",0);Y(this,"airSpin",0);Y(this,"airFlip",0);Y(this,"airSpinRate",0);Y(this,"airFlipRate",0);Y(this,"airBasePitch",0);Y(this,"flipArmed",!1);Y(this,"apexY",0);Y(this,"surfaced",!1);Y(this,"lungeTimer",0);Y(this,"agility",1);this.pos.set(e,t,n),this.yaw=i,this.updateFrame(),this.vel.copy(this.forward).multiplyScalar(this.commanded*.9)}get speed(){return this.vel.length()}get forwardSpeed(){return this.vel.dot(this.forward)}get depth(){return Math.max(0,Bt-this.pos.y)}lunge(e=4.5,t=.4){this.vel.addScaledVector(this.forward,e),this.lungeTimer=t}updateFrame(){xu.set(this.roll+this.extraRoll,this.yaw,this.pitch,"YZX"),this.quat.setFromEuler(xu),this.forward.set(1,0,0).applyQuaternion(this.quat),this.up.set(0,1,0).applyQuaternion(this.quat),this.right.set(0,0,1).applyQuaternion(this.quat)}step(e,t,n,i={}){const r=un(t.steerX,-1,1),a=un(t.steerY,-1,1);if(this.airborne)return this.stepAir(e,r,a,n,i),i;this.commanded=Yt(this.commanded,t.targetSpeed,t.targetSpeed>this.commanded?2.6:1.6,e);const o=un(this.commanded/si[3],.05,1.05);this.effort=Yt(this.effort,o,3.2,e);const c=Math.min(1,Math.abs(this.yawRate)*.55),l=.42+this.commanded*.112+c*.18;this.strokeFreq=Yt(this.strokeFreq,l,4,e);const h=t.targetSpeed<=si[0]+.05,u=Math.floor(this.strokePhase/(Math.PI*2));u!==this.lastPhaseCycle&&(this.lastPhaseCycle=u,this.strokeCount+=1),h&&!this.coasting&&this.strokeCount>=2&&Math.abs(r)<.3&&this.forwardSpeed>2.4&&(this.coasting=!0,this.coastTimer=2.3),this.coasting&&(this.coastTimer-=e,(this.coastTimer<=0||!h||Math.abs(r)>.45||this.forwardSpeed<2)&&(this.coasting=!1,this.strokeCount=0));const d=this.coasting?.04:un(.42+this.effort*.58+c*.12,0,1);this.strokeAmp=Yt(this.strokeAmp,d,this.coasting?2.2:4.5,e),(!this.coasting||this.strokeAmp>.12)&&(this.strokePhase+=Math.PI*2*this.strokeFreq*e);const f=1+.42*Math.cos(2*this.strokePhase)+.12*Math.sin(this.strokePhase),b=un(this.strokeAmp/Math.max(.05,d||.05),0,1.3),v=this.commanded*(h?1.32:1);this.thrust=this.coasting?0:bu*v*v*f*Math.min(1.15,.35+b*.65);const g=this.speed,p=un((g-2)/13,0,1),x=Ne.lerp(1.55,.92,p)*this.agility;this.yawRate=Yt(this.yawRate,-r*x,4.6,e),this.yaw+=this.yawRate*e;const m=a*1.02,L=Math.abs(a)>.02?2.6:1.35,T=un((m-this.pitch)*L,-1.25,1.25);this.pitchRate=Yt(this.pitchRate,T,6,e),this.pitch=un(this.pitch+this.pitchRate*e,-1.2,1.2);const A=un(-this.yawRate*(.25+g*.05),-.95,.95);this.roll=Yt(this.roll,A,3.2,e),this.spin?this.extraRoll+=this.spin*e:(this.extraRoll=Math.atan2(Math.sin(this.extraRoll),Math.cos(this.extraRoll)),this.extraRoll=Yt(this.extraRoll,0,2.2,e));const D=n.floorAt(this.pos.x,this.pos.z),S=this.pos.y-D;S<5&&this.pitch<0&&(this.pitch=Yt(this.pitch,.05,(5-S)*.9,e));const y=this.pos.y>Bt-2.4;y&&this.forwardSpeed>10&&a>.12&&this.pos.y>Bt-1.4&&(this.pitch=Math.max(this.pitch,.5));const P=this.forwardSpeed>8.2&&this.pitch>.42;y&&!P&&this.pitch>0&&(this.pitch=Yt(this.pitch,0,3.5,e)),this.updateFrame(),$o.copy(this.forward),Jo.copy(this.right),Zo.copy(this.up);let U=this.vel.dot($o),k=this.vel.dot(Jo),V=this.vel.dot(Zo);const $=Math.exp(-3*e),H=Math.hypot(k,V)*(1-$);k*=$,V*=$,U+=H*gy*Math.sign(U||1);const Z=Math.abs(this.yawRate)*Math.abs(this.yawRate)*.07*Math.max(0,U);if(U+=(this.thrust-bu*U*Math.abs(U)-Z)*e,U<.3&&(U=Yt(U,.3,1,e)),this.vel.copy($o).multiplyScalar(U).addScaledVector(Jo,k).addScaledVector(Zo,V),this.surfaced=!1,y&&!P){const he=Bt-.62,ie=(he-this.pos.y)*5.5-this.vel.y*3.2;this.pos.y>he-1.4&&a>-.25&&(this.vel.y+=ie*e,this.pos.y>he-.45&&(this.surfaced=!0))}this.pos.addScaledVector(this.vel,e),this.lungeTimer>0&&(this.lungeTimer=Math.max(0,this.lungeTimer-e)),this.pos.y>Bt-.32&&this.vel.y>3.2&&(this.airborne=!0,this.airTime=0,this.airSpin=0,this.airFlip=0,this.airSpinRate=0,this.airFlipRate=0,this.airBasePitch=this.pitch,this.flipArmed=!1,this.apexY=this.pos.y,i.leftWater=!0);const W=n.floorAt(this.pos.x,this.pos.z)+1.7;return this.pos.y<W&&(this.pos.y=W,this.vel.y<0&&(this.vel.y*=-.1),i.hitFloor=!0),!this.airborne&&this.pos.y>Bt-.25&&(this.pos.y=Bt-.25,this.vel.y>0&&(this.vel.y=0)),this.applyBounds(e,n),i}stepAir(e,t,n,i,r){this.airTime+=e,this.vel.y-=vu*e,this.vel.multiplyScalar(Math.exp(-.05*e)),this.yawRate=Yt(this.yawRate,0,2,e),this.yaw+=this.yawRate*e;const a=Math.hypot(this.vel.x,this.vel.z),o=Math.atan2(this.vel.y,Math.max(.1,a));if(this.airBasePitch=Yt(this.airBasePitch,un(o,-1.35,1.35),2.6,e),this.airSpinRate=Yt(this.airSpinRate,-t*8.5,7,e),Math.abs(n)<.3&&(this.flipArmed=!0),this.airFlipRate=Yt(this.airFlipRate,this.flipArmed?n*6.2:0,6,e),this.airSpin+=this.airSpinRate*e,this.airFlip+=this.airFlipRate*e,this.extraRoll+=this.airSpinRate*e,this.pitch=this.airBasePitch+this.airFlip,this.pitchRate=0,this.roll=Yt(this.roll,0,2,e),this.strokeAmp=Yt(this.strokeAmp,.18,3,e),this.strokePhase+=Math.PI*2*.9*e,this.updateFrame(),this.pos.addScaledVector(this.vel,e),this.pos.y>this.apexY?this.apexY=this.pos.y:r.apex===void 0&&this.vel.y<0&&this.vel.y>-vu*e*1.5&&(r.apex=this.apexY),this.pos.y<Bt-.6&&this.vel.y<0){const c=b=>Math.atan2(Math.sin(b),Math.cos(b)),l=Math.abs(c(this.extraRoll+this.roll)),h=c(this.pitch),u=b=>Math.round(Math.abs(b)/Math.PI)/2;let d="clean";l>2.2?d="back":l>.8?d="side":h>-.25&&(d="belly"),r.landing={height:Math.max(0,this.apexY-Bt),airTime:this.airTime,spins:u(this.airSpin),flips:u(this.airFlip)*Math.sign(this.airFlip||1),entry:d},this.airborne=!1;const f=this.apexY-Bt<2.5;this.vel.multiplyScalar(d==="clean"?f?.88:.7:.45),this.extraRoll=c(this.extraRoll),this.pitch=un(c(this.pitch),-.75,.2),r.enteredWater=!0}this.applyBounds(e,i)}applyBounds(e,t){const{minX:n,maxX:i,maxZ:r}=t.bounds,a=c=>Math.min(1,c/12);this.pos.z>r+8&&(this.pos.z=r+8),this.pos.z<-r-8&&(this.pos.z=-r-8),this.pos.x<n&&(this.pos.x=n),this.pos.x>i&&(this.pos.x=i);const o=Math.abs(this.pos.z)-r;if(o>0){const c=Math.PI*.2,l=Math.cos(this.yaw)<0;let u=(this.pos.z>0?l?Math.PI-c:c:l?-(Math.PI-c):-c)-this.yaw;u=Math.atan2(Math.sin(u),Math.cos(u)),this.yaw+=u*a(o)*1.6*e}}}function Cd(s,e){return Math.atan2(Math.sin(e-s),Math.cos(e-s))}function $c(s,e){return Math.atan2(-e,s)}function by(s,e,t,n){const i=e.x-s.pos.x,r=e.y-s.pos.y,a=e.z-s.pos.z,o=Math.hypot(i,a),c=Cd(s.yaw,$c(i,a));t.steerX=un(-c*2.2,-1,1);const l=un(Math.atan2(r,Math.max(1,o)),-.9,.9);return t.steerY=un(l/1.02,-1,1),t.targetSpeed=n,t}const qi=(s,e,t,n)=>s+(e-s)*(1-Math.exp(-t*n)),vy=(s,e,t,n)=>{const i=Math.atan2(Math.sin(e-s),Math.cos(e-s));return s+i*(1-Math.exp(-t*n))};class xy{constructor(e,t){Y(this,"yaw",0);Y(this,"pitch",0);Y(this,"pos",new C);Y(this,"look",new C);Y(this,"shakeAmt",0);Y(this,"fovKick",0);Y(this,"initialised",!1);Y(this,"lag",new C);Y(this,"lookInit",!1);this.camera=e,this.floorAt=t}shake(e){this.shakeAmt=Math.max(this.shakeAmt,e)}kick(e){this.fovKick=Math.max(this.fovKick,e)}update(e,t,n,i){const r=this.camera,a=t.speed,o=Ne.clamp(a/15,0,1),c=Math.atan2(-t.vel.z,t.vel.x),l=a>1?t.yaw+Math.atan2(Math.sin(c-t.yaw),Math.cos(c-t.yaw))*.35:t.yaw;this.initialised||(this.initialised=!0,this.yaw=l,this.pitch=0);const h=t.airborne;this.yaw=vy(this.yaw,l,h?1.2:2.7,e);const u=Ne.clamp(t.pitch*.42,-.42,.38);this.pitch=qi(this.pitch,h?.1:u,h?1.2:2.1,e);const d=i.aspect<.8,f=(d?12.5:10.8)+a*.2+i.cinematic*7+(h?6:0),b=Math.cos(this.pitch),v=new C(Math.cos(this.yaw)*b,Math.sin(this.pitch),-Math.sin(this.yaw)*b),g=t.vel.clone().multiplyScalar(-.055);this.lag.x=qi(this.lag.x,g.x,3,e),this.lag.y=qi(this.lag.y,g.y,3,e),this.lag.z=qi(this.lag.z,g.z,3,e);const p=t.pos.clone().addScaledVector(v,-f).add(this.lag);p.y+=1.9+f*.07,!h&&p.y>Bt-.75&&(p.y=Bt-.75);const x=this.floorAt(p.x,p.z)+1.4;p.y<x&&(p.y=x),this.pos.copy(p);const _=6+o*4,m=t.pos.clone().addScaledVector(new C(Math.cos(this.yaw),Math.sin(this.pitch)*.6,-Math.sin(this.yaw)),_);if(m.y+=.6,this.lookInit||(this.look.copy(m),this.lookInit=!0),this.look.lerp(m,1-Math.exp(-9*e)),r.position.copy(this.pos),this.shakeAmt>.001){const A=this.shakeAmt;r.position.x+=(Math.sin(n*71)+Math.sin(n*43))*.5*A,r.position.y+=(Math.sin(n*59)+Math.sin(n*37))*.5*A,r.position.z+=(Math.sin(n*67)+Math.sin(n*29))*.5*A,this.shakeAmt=qi(this.shakeAmt,0,7,e)}r.up.set(0,1,0),r.lookAt(this.look),r.rotateZ(-t.roll*.07);const L=d?Ne.clamp(2*Math.atan(Math.tan(Ne.degToRad(34))/i.aspect)*Ne.RAD2DEG,62,80):58;this.fovKick=qi(this.fovKick,0,3,e);const T=L+o*11+(i.burst?3:0)+this.fovKick;r.fov=qi(r.fov,T,4,e),r.updateProjectionMatrix()}}function Ma(s,e){const t=Math.sin(s*127.1+e*311.7)*43758.5453123;return t-Math.floor(t)}function _y(s,e){const t=Math.floor(s),n=Math.floor(e),i=s-t,r=e-n,a=i*i*(3-2*i),o=r*r*(3-2*r),c=Ma(t,n),l=Ma(t+1,n),h=Ma(t,n+1),u=Ma(t+1,n+1);return c+(l-c)*a+(h-c)*o+(c-l-h+u)*a*o}function Ln(s,e,t=4){let n=0,i=.5,r=1;for(let a=0;a<t;a+=1)n+=i*(_y(s*r,e*r)*2-1),r*=2.03,i*=.5;return n}const lr=(s,e,t)=>{const n=Math.min(1,Math.max(0,(t-s)/(e-s)));return n*n*(3-2*n)};function yy(s){const e=s.water.map(o=>({x:o.x,c:new Le(o.color),d:o.density})),t=Math.min(...s.water.map(o=>o.density)),n=s.features.coastRidges,i=(o,c)=>{let l=s.baseDepth;for(const g of s.profile)l+=lr(g.x0,g.x1,o)*g.rise;if(n){const g=lr(n.x0,n.x0+50,o)*(1-lr(n.x1-45,n.x1,o));l+=g*Math.max(0,Ln(o*.025,c*.03,3))*5}const h=Ln(o*.045,c*.045,4)*2.6+Ln(o*.12,c*.12,2)*.7,u=-Math.exp(-Math.pow(c/45,2))*2.2,d=Math.abs(c),f=Ln(o*.02+7.3,c*.05,3)*10,b=lr(s.extent.corridorZ+10+f*.6,s.extent.corridorZ+83,d),v=b*b*(95+f*2);return l+h+u+v},r=(o,c)=>{if(o<=e[0].x)return c.copy(e[0].c),e[0].d;for(let h=0;h<e.length-1;h+=1){const u=e[h],d=e[h+1];if(o<=d.x){const f=lr(u.x,d.x,o);return c.copy(u.c).lerp(d.c,f),u.d+(d.d-u.d)*f}}const l=e[e.length-1];return c.copy(l.c),l.d},a=new Le;return{...s,floorAt:i,waterAt:r,zoneAt:o=>s.zones.find(c=>o>=c.x0&&o<c.x1)??s.zones[s.zones.length-1],deepness:o=>{const c=r(o,a),l=Math.max(...s.water.map(h=>h.density));return l===t?0:(l-c)/(l-t)},spawn:o=>{const c=s.spawns[o];return c?new C(c[0],c[1],c[2]):new C}}}const Pn=new C(.32,1,.18).normalize(),Jc=`
vec3 wildWater(vec3 dir, float camY, vec3 shallow) {
  float depth = max(0.0, -camY);
  float k = exp(-depth * 0.026);
  vec3 deep = shallow * vec3(0.16, 0.3, 0.4);
  float up = dir.y;
  vec3 c = mix(deep, shallow, smoothstep(-0.85, 0.75, up));
  c *= mix(0.3, 1.0, k);
  float sunAlign = max(dot(dir, normalize(vec3(${Pn.x.toFixed(4)}, ${Pn.y.toFixed(4)}, ${Pn.z.toFixed(4)}))), 0.0);
  c += shallow * pow(sunAlign, 6.0) * 0.55 * k;
  return c;
}
`;let _u=!1;function My(){_u||(_u=!0,et.fog_pars_vertex=`#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogWorld;
#endif`,et.fog_vertex=`#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vFogWorld = transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz);
#endif`,et.fog_pars_fragment=`#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogWorld;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
  ${Jc}
#endif`,et.fog_fragment=`#ifdef USE_FOG
  #ifdef FOG_EXP2
    float wDens = abs(fogDensity);
    float fogFactor = 1.0 - exp( - wDens * wDens * vFogDepth * vFogDepth );
    vec3 wFog = fogColor;
    if (fogDensity > 0.0) {
      vec3 wDir = normalize(vFogWorld - cameraPosition);
      wFog = wildWater(wDir, cameraPosition.y, fogColor);
      // absorption: deeper surfaces lose red/green first
      float wDeep = clamp(-vFogWorld.y / 60.0, 0.0, 1.0);
      gl_FragColor.rgb *= mix(vec3(1.0), vec3(0.45, 0.7, 0.85), wDeep);
    } else {
      // above water: mostly clear air, fade underwater geometry into the water body colour
      if (vFogWorld.y < -0.4) {
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.03, 0.16, 0.2), clamp(-vFogWorld.y * 0.35, 0.0, 0.92));
      }
    }
    gl_FragColor.rgb = mix( gl_FragColor.rgb, wFog, fogFactor );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
#endif`)}const yr={uTime:{value:0},uCaustic:{value:1}};function yu(s,e=1){const t=s.onBeforeCompile;s.onBeforeCompile=(n,i)=>{t==null||t.call(s,n,i),n.uniforms.uTime=yr.uTime,n.uniforms.uCaustic=yr.uCaustic,n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
uniform float uTime; uniform float uCaustic;
float wildCaustic(vec2 p, float t) {
  vec2 q = p;
  float c = 0.0;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    q = vec2(q.x + sin(q.y * 0.9 + t * (0.6 + fi * 0.15)) * 0.8, q.y + cos(q.x * 0.8 - t * (0.5 + fi * 0.1)) * 0.8);
    c += abs(sin(q.x * 1.3) * cos(q.y * 1.3));
  }
  c = c * 0.5;
  float k = 1.0 - c; k *= k; k *= k;
  return k * k * 0.8;
}`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
#ifdef USE_FOG
{
  float ca = wildCaustic(vFogWorld.xz * 0.32, uTime * 0.9) * 1.5;
  float fade = smoothstep(-58.0, -2.0, vFogWorld.y) * smoothstep(0.0, 0.6, normal.y * 0.5 + 0.5);
  totalEmissiveRadiance += vec3(0.42, 0.78, 0.82) * ca * fade * uCaustic * ${e.toFixed(2)} * diffuseColor.rgb * 2.2;
}
#endif`)},s.customProgramCacheKey=()=>"caustic"+e}class Sy{constructor(e,t,n){Y(this,"group",new wt);Y(this,"aboveWater",new wt);Y(this,"floorMesh");Y(this,"dome");Y(this,"surface");Y(this,"rays");Y(this,"rayBase");Y(this,"snow");Y(this,"kelp",null);Y(this,"shallow",new Le);Y(this,"fog");Y(this,"hemi");Y(this,"sun");Y(this,"surfaceUniforms");Y(this,"domeUniforms");Y(this,"rayUniforms");Y(this,"snowUniforms");Y(this,"floes");Y(this,"floeData",[]);Y(this,"habitat");Y(this,"rockColliders",[]);this.habitat=n;const i=n.floorAt,r=n.extent;My(),this.fog=new gl(2787990,.018),e.fog=this.fog,e.background=null,this.hemi=new hx(12448767,731696,2.4),this.sun=new Ed(15268863,2.6),this.sun.position.copy(Pn).multiplyScalar(100),e.add(this.hemi,this.sun,this.sun.target),e.add(this.group),this.domeUniforms={uShallow:{value:this.shallow},uCamY:{value:-5},uAbove:{value:0}},this.dome=new ut(new Xa(380,32,20),new dn({side:Qt,depthWrite:!1,fog:!1,uniforms:this.domeUniforms,vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w * 0.99999; }",fragmentShader:`uniform vec3 uShallow; uniform float uCamY; uniform float uAbove; varying vec3 vDir;
${Jc}
void main(){
  vec3 d = normalize(vDir);
  vec3 under = wildWater(d, uCamY, uShallow);
  vec3 sunD = normalize(vec3(${Pn.x.toFixed(4)}, ${Pn.y.toFixed(4)}, ${Pn.z.toFixed(4)}));
  float h = max(d.y, 0.0);
  vec3 sky = mix(vec3(0.78, 0.86, 0.9), vec3(0.32, 0.55, 0.78), pow(h, 0.55));
  sky += vec3(1.0, 0.92, 0.78) * (pow(max(dot(d, sunD), 0.0), 900.0) * 6.0 + pow(max(dot(d, sunD), 0.0), 12.0) * 0.25);
  if (d.y < 0.0) sky = mix(vec3(0.05, 0.2, 0.25), vec3(0.6, 0.72, 0.78), exp(d.y * 14.0));
  gl_FragColor = vec4(mix(under, sky, uAbove), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`})),this.dome.renderOrder=-10,this.dome.frustumCulled=!1,e.add(this.dome),this.surfaceUniforms={uTime:{value:0},uShallow:{value:this.shallow},uDensity:{value:.018},uUnder:{value:1}};const a=new ri(900,900,t.mobile?60:110,t.mobile?60:110);a.rotateX(-Math.PI/2),this.surface=new ut(a,new dn({side:Zt,fog:!1,uniforms:this.surfaceUniforms,vertexShader:`uniform float uTime; varying vec3 vWorld;
float wave(vec2 p, float t){ return sin(p.x*0.11+t*0.9)*0.16 + sin(p.y*0.13-t*0.75)*0.13 + sin((p.x+p.y)*0.21+t*1.4)*0.06 + sin((p.x-p.y*0.6)*0.37-t*1.9)*0.035; }
void main(){ vec4 w = modelMatrix*vec4(position,1.0); w.y += wave(w.xz, uTime); vWorld = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,fragmentShader:`uniform float uTime; uniform vec3 uShallow; uniform float uDensity; uniform float uUnder; varying vec3 vWorld;
${Jc}
vec3 waveNormal(vec2 p, float t){
  float e = 0.35;
  float h0 = sin(p.x*0.11+t*0.9)*0.16 + sin(p.y*0.13-t*0.75)*0.13 + sin((p.x+p.y)*0.21+t*1.4)*0.06 + sin((p.x-p.y*0.6)*0.37-t*1.9)*0.035;
  vec2 q = p + vec2(e, 0.0);
  float hx = sin(q.x*0.11+t*0.9)*0.16 + sin(q.y*0.13-t*0.75)*0.13 + sin((q.x+q.y)*0.21+t*1.4)*0.06 + sin((q.x-q.y*0.6)*0.37-t*1.9)*0.035;
  q = p + vec2(0.0, e);
  float hz = sin(q.x*0.11+t*0.9)*0.16 + sin(q.y*0.13-t*0.75)*0.13 + sin((q.x+q.y)*0.21+t*1.4)*0.06 + sin((q.x-q.y*0.6)*0.37-t*1.9)*0.035;
  // fine ripples
  float r1 = (sin(p.x*1.7 + p.y*0.9 + t*3.1) * 0.5 + sin(p.y*2.3 - p.x*0.7 - t*2.6) * 0.5) * clamp(1.0 - length(p - cameraPosition.xz) / 60.0, 0.0, 1.0);
  vec3 n = normalize(vec3(-(hx-h0)/e - r1*0.06, 1.0, -(hz-h0)/e - r1*0.05));
  return n;
}
void main(){
  vec3 V = normalize(vWorld - cameraPosition);
  vec3 N = waveNormal(vWorld.xz, uTime);
  float dist = length(vWorld - cameraPosition);
  vec3 sunD = normalize(vec3(${Pn.x.toFixed(4)}, ${Pn.y.toFixed(4)}, ${Pn.z.toFixed(4)}));
  vec3 col;
  if (uUnder > 0.5) {
    // underwater, looking up at the surface
    vec3 R = refract(V, -N, 1.333);
    float depthK = exp(-max(0.0, -cameraPosition.y) * 0.035);
    if (dot(R, R) < 0.001) {
      vec3 refl = reflect(V, -N);
      col = mix(wildWater(refl, cameraPosition.y, uShallow), uShallow * (0.75 + 0.25 * depthK), 0.55);
    } else {
      float edge = smoothstep(0.0, 0.5, R.y);
      vec3 sky = mix(vec3(0.55, 0.8, 0.86), vec3(0.88, 0.97, 1.0), pow(max(R.y, 0.0), 2.0));
      sky += vec3(1.0, 0.96, 0.85) * pow(max(dot(R, sunD), 0.0), 60.0) * 2.0;
      vec3 tir = mix(wildWater(V, cameraPosition.y, uShallow), uShallow, 0.55);
      col = mix(tir, sky * mix(0.5, 1.0, depthK), edge * mix(0.3, 0.85, depthK));
    }
    float fogF = 1.0 - exp(-uDensity*uDensity*dist*dist*0.7);
    col = mix(col, wildWater(V, cameraPosition.y, uShallow), fogF);
  } else {
    // above water
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-V, N), 0.0), 5.0);
    vec3 R = reflect(V, N);
    vec3 sky = mix(vec3(0.42, 0.55, 0.62), vec3(0.16, 0.3, 0.48), pow(max(R.y, 0.0), 0.55));
    vec3 body = vec3(0.008, 0.045, 0.06) + uShallow * 0.06;
    col = mix(body, sky, fres * 0.85);
    col += vec3(1.0, 0.95, 0.85) * pow(max(dot(R, sunD), 0.0), 220.0) * 4.0;
    col = mix(col, vec3(0.7, 0.8, 0.85), 1.0 - exp(-dist * 0.0022));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`})),this.surface.frustumCulled=!1,e.add(this.surface);const o=t.mobile?9:15,c=new ri(1,1,1,6);c.translate(0,-.5,0);const l=new Float32Array(o*4);for(let G=0;G<o;G+=1)l[G*4]=(Math.random()-.5)*120,l[G*4+1]=(Math.random()-.5)*120,l[G*4+2]=1.2+Math.random()*3.2,l[G*4+3]=Math.random()*100;this.rayBase=l.slice(),c.setAttribute("aRay",new Na(l,4)),this.rayUniforms={uTime:{value:0},uStrength:{value:1},uCam:{value:new C}};const h=Pn.clone().negate();this.rays=new Cs(c,new dn({transparent:!0,depthWrite:!1,fog:!1,blending:Us,side:Zt,uniforms:this.rayUniforms,vertexShader:`attribute vec4 aRay; uniform vec3 uCam; uniform float uTime; varying float vU; varying float vV; varying float vFade; varying float vFlick;
void main(){
  vec3 axis = normalize(vec3(${h.x.toFixed(4)}, ${h.y.toFixed(4)}, ${h.z.toFixed(4)}));
  float span = 120.0;
  vec2 rel = mod(aRay.xy - uCam.xz + span*0.5, span) - span*0.5;
  vec3 top = vec3(uCam.x + rel.x, 0.0, uCam.z + rel.y);
  float len = 70.0;
  float t = -position.y;
  vec3 center = top + axis * len * t;
  vec3 toCam = normalize(uCam - center);
  vec3 side = normalize(cross(axis, toCam));
  float width = aRay.z * (1.0 + t * 1.6);
  vec3 p = center + side * position.x * width;
  vU = position.x + 0.5; vV = t;
  float d = length(uCam - center);
  vFade = smoothstep(2.0, 12.0, d) * (1.0 - smoothstep(45.0, 62.0, length(rel)));
  vFlick = 0.6 + 0.4 * sin(uTime * 0.35 + aRay.w) * sin(uTime * 0.21 + aRay.w * 1.7);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`,fragmentShader:`uniform float uStrength; varying float vU; varying float vV; varying float vFade; varying float vFlick;
void main(){
  float across = 1.0 - abs(vU * 2.0 - 1.0);
  across = across * across;
  float along = smoothstep(0.0, 0.08, vV) * (1.0 - smoothstep(0.35, 1.0, vV));
  float a = across * along * vFade * vFlick * uStrength * 0.085;
  gl_FragColor = vec4(vec3(0.72, 0.95, 1.0) * a, a);
  #include <colorspace_fragment>
}`}),o);const u=new Je;for(let G=0;G<o;G+=1)this.rays.setMatrixAt(G,u);this.rays.frustumCulled=!1,e.add(this.rays);const d=t.mobile?1400:2600,f=new Float32Array(d*3),b=new Float32Array(d);for(let G=0;G<d;G+=1)f[G*3]=Math.random()*48,f[G*3+1]=Math.random()*48,f[G*3+2]=Math.random()*48,b[G]=Math.random();const v=new Lt;v.setAttribute("position",new gt(f,3)),v.setAttribute("aSeed",new gt(b,1)),this.snowUniforms={uCam:{value:new C},uTime:{value:0},uPixel:{value:1},uAlpha:{value:1}},this.snow=new _l(v,new dn({transparent:!0,depthWrite:!1,fog:!1,uniforms:this.snowUniforms,vertexShader:`attribute float aSeed; uniform vec3 uCam; uniform float uTime; uniform float uPixel; varying float vA;
void main(){
  float S = 48.0;
  vec3 drift = vec3(sin(uTime*0.1 + aSeed*20.0)*0.6, -uTime*0.12*(0.5+aSeed), cos(uTime*0.08 + aSeed*13.0)*0.6);
  vec3 p = mod(position + drift - uCam + S*0.5, S) - S*0.5 + uCam;
  if (p.y > -0.2) p.y = -0.2 - aSeed * 3.0;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  vA = smoothstep(0.6, 3.0, d) * (1.0 - smoothstep(14.0, 24.0, d)) * (0.35 + aSeed * 0.65);
  gl_PointSize = min(uPixel * (1.2 + aSeed * 2.4) * 22.0 / max(d, 0.5), 9.0 * uPixel);
  gl_Position = projectionMatrix * mv;
}`,fragmentShader:`uniform float uAlpha; varying float vA;
void main(){ vec2 c = gl_PointCoord - 0.5; float r = dot(c,c); if (r > 0.25) discard; float a = (1.0 - r*4.0) * vA * 0.55 * uAlpha; gl_FragColor = vec4(vec3(0.82, 0.96, 0.95) * a, a); }`,blending:Us})),this.snow.frustumCulled=!1,e.add(this.snow);const g=r.maxX-r.minX+200,p=360,x=t.mobile?180:260,_=t.mobile?60:90,m=new ri(g,p,x,_);m.rotateX(-Math.PI/2),m.translate(r.minX-100+g/2,0,0);const L=m.attributes.position;for(let G=0;G<L.count;G+=1)L.setY(G,i(L.getX(G),L.getZ(G)));m.computeVertexNormals();const T=m.attributes.normal,A=new Float32Array(L.count*3),D=new Le(9411206),S=new Le(5661534),y=new Le(3424062),P=new Le(5004087),U=new Le(14674410),k=new Le;for(let G=0;G<L.count;G+=1){const z=L.getX(G),re=L.getY(G),pe=L.getZ(G),Ie=1-T.getY(G),Re=Ln(z*.08,pe*.08,3);k.copy(S).lerp(D,Ne.clamp(.45+Re*.8,0,1)),k.lerp(S,n.deepness(z)*.6);const Ke=n.features.kelp;Ke&&z>Ke.x0-10&&z<Ke.x1+5&&re>-16&&re<-4&&k.lerp(P,Ne.clamp(.35+Re,0,.8)),k.lerp(y,Ne.smoothstep(Ie,.12,.38)),re>1.5&&k.copy(y).lerp(U,Ne.smoothstep(re,18,40)*Ne.clamp(.6+Re,0,1)),A[G*3]=k.r,A[G*3+1]=k.g,A[G*3+2]=k.b}m.setAttribute("color",new gt(A,3));const V=new ji({vertexColors:!0});yu(V,1),this.floorMesh=new ut(m,V),this.floorMesh.name="procedural_fjord_seabed",this.group.add(this.floorMesh);const $=new Oa(1,1),H=$.attributes.position;for(let G=0;G<H.count;G+=1){const z=H.getX(G),re=H.getY(G),pe=H.getZ(G),Ie=1+Ln(z*1.7+3,re*1.7+pe*1.3,3)*.45;H.setXYZ(G,z*Ie,re*Ie*.75,pe*Ie)}$.computeVertexNormals();const Z=new ji({color:4608591});yu(Z,.8);const W=t.mobile?150:240,he=new Cs($,Z,W),ie=new Et,ue=Qo(7);for(let G=0;G<W;G+=1){const z=r.minX+ue()*(r.maxX-r.minX),re=(ue()-.5)*2*(r.corridorZ+20),pe=n.features.coastRidges,Ie=pe&&z>pe.x0&&z<pe.x1?1.6:1,Re=(.6+Math.pow(ue(),3)*4.2)*Ie;ie.position.set(z,i(z,re)+Re*.25,re),ie.rotation.set(ue()*.6,ue()*Math.PI*2,ue()*.4),ie.scale.set(Re*(.8+ue()*.6),Re*(.5+ue()*.5),Re*(.8+ue()*.6)),ie.updateMatrix(),he.setMatrixAt(G,ie.matrix),this.rockColliders.push({x:z,y:ie.position.y,z:re,r:Re*.85})}he.instanceMatrix.needsUpdate=!0,this.group.add(he),this.kelp=this.buildKelp(t.mobile?520:950),this.group.add(this.kelp);const ve=this.buildGlacier();ve&&this.group.add(ve);const{floes:xe,data:J}=this.buildFloes(t.mobile?46:70);this.floes=xe,this.floeData.push(...J),this.group.add(xe),this.group.add(this.buildBergs()),this.aboveWater.add(this.buildMountains()),this.group.add(this.aboveWater)}buildKelp(e){const t=new ri(.9,1,1,8);t.translate(0,.5,0);const n=new ji({color:16777215,side:Zt,emissive:2763278,emissiveIntensity:1});n.onBeforeCompile=h=>{h.uniforms.uTime=yr.uTime,h.vertexShader=h.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
float ph = float(gl_InstanceID) * 1.37;
float h = position.y;
transformed.x += sin(uTime * 0.9 + ph + h * 2.2) * 0.22 * h * h;
transformed.z += cos(uTime * 0.7 + ph * 0.7 + h * 1.6) * 0.16 * h * h;
transformed.x *= 1.0 - h * 0.55;`),h.vertexShader=h.vertexShader.replace("#include <beginnormal_vertex>",`#include <beginnormal_vertex>
objectNormal = normalize(vec3(0.0, 0.35, 1.0));`)},n.customProgramCacheKey=()=>"kelp";const i=new Cs(t,n,e),r=new Et,a=Qo(21),o=[],c=this.habitat.features.kelp??{x0:0,x1:0,zSpread:0,clusters:0};c.clusters||(e=0);for(let h=0;h<c.clusters;h+=1)o.push([c.x0+a()*(c.x1-c.x0),(a()-.5)*2*c.zSpread]);const l=new Le;for(let h=0;h<e;h+=1){const[u,d]=o[h%o.length],f=u+(a()-.5)*16,b=d+(a()-.5)*16,v=3+a()*7;r.position.set(f,this.habitat.floorAt(f,b)-.2,b),r.rotation.set((a()-.5)*.25,a()*Math.PI,(a()-.5)*.25),r.scale.set(.7+a()*.8,v,1),r.updateMatrix(),i.setMatrixAt(h,r.matrix),l.setHSL(.1+a()*.06,.42,.3+a()*.12),i.setColorAt(h,l)}return i.instanceMatrix.needsUpdate=!0,i.instanceColor&&(i.instanceColor.needsUpdate=!0),i.name="procedural_kelp",i}buildGlacier(){const e=this.habitat.features.glacierFront;if(!e)return null;const{x0:t,x1:n,z:i}=e,r=new ri(n-t,46,120,34),a=r.attributes.position,o=new Float32Array(a.count*3),c=new Le;for(let u=0;u<a.count;u+=1){const d=a.getX(u),f=a.getY(u),b=t+(d+(n-t)/2),v=f+4,g=Math.abs(Math.sin(b*.55+Ln(b*.1,v*.05)*3)),p=Ln(b*.06,v*.08,4)*5+(1-g)*1.4;a.setXYZ(u,b,v,i+p-Math.max(0,-v)*.15);const x=v<0?1:0,_=Ne.clamp(.55+Ln(b*.2,v*.2)*.6+(1-g)*.2,0,1);c.setRGB(.55+_*.35,.8+_*.15,.88+_*.1),x&&c.multiplyScalar(.85),o[u*3]=c.r,o[u*3+1]=c.g,o[u*3+2]=c.b}r.setAttribute("color",new gt(o,3)),r.computeVertexNormals();const l=new ji({vertexColors:!0,emissive:2977664,emissiveIntensity:.35,side:Zt}),h=new ut(r,l);return h.name="procedural_glacier_front",h}buildFloes(e){const t=new Va,n=Qo(5),i=9;for(let h=0;h<i;h+=1){const u=h/i*Math.PI*2,d=.75+n()*.3,f=Math.cos(u)*d,b=Math.sin(u)*d;h===0?t.moveTo(f,b):t.lineTo(f,b)}const r=new Ir(t,{depth:1,bevelEnabled:!0,bevelSize:.12,bevelThickness:.12,bevelSegments:1});r.rotateX(Math.PI/2),r.translate(0,.25,0);const a=new ji({color:14676982,emissive:1787730,emissiveIntensity:.2}),o=new Cs(r,a,e),c=new Et,l=[];for(let h=0;h<e;h+=1){const u=this.habitat.features.seaIce??{},d=u.dense?u.sparse?n()<.7:!0:!1,f=u.dense??{x0:0,x1:0,z0:0,z1:0},b=u.sparse??{x0:0,x1:0,zSpread:0},v=d?f.x0+n()*(f.x1-f.x0):b.x0+n()*(b.x1-b.x0),g=d?f.z0+n()*(f.z1-f.z0):(n()-.5)*2*b.zSpread,p=d?1.2+Math.pow(n(),2)*6:2+n()*9;c.position.set(v,0,g),c.rotation.set(0,n()*Math.PI*2,0),c.scale.set(p,.4+p*.12,p*(.7+n()*.5)),c.updateMatrix(),o.setMatrixAt(h,c.matrix),l.push({x:v,z:g,r:p})}return o.instanceMatrix.needsUpdate=!0,o.name="procedural_sea_ice",{floes:o,data:l}}buildBergs(){const e=new wt,t=new ji({color:13627123,emissive:2780024,emissiveIntensity:.3});return(this.habitat.features.icebergs??[]).forEach(([i,r,a],o)=>{const c=new Oa(1,2),l=c.attributes.position;for(let u=0;u<l.count;u+=1){const d=l.getX(u),f=l.getY(u),b=l.getZ(u),v=1+Ln(d*1.3+o,f*1.1+b,3)*.5;l.setXYZ(u,d*v,f<0?f*v*2.4:f*v*.7,b*v)}c.computeVertexNormals();const h=new ut(c,t);h.position.set(i,.6,r),h.scale.setScalar(a),h.rotation.y=o*1.3,e.add(h)}),e.name="procedural_icebergs",e}buildMountains(){const e=new Lr(520,560,1,96,6,!0),t=e.attributes.position,n=new Float32Array(t.count*3);for(let r=0;r<t.count;r+=1){const a=t.getX(r),o=t.getY(r),c=t.getZ(r),l=Math.atan2(c,a),h=40+Math.abs(Ln(Math.cos(l)*3+9,Math.sin(l)*3,5))*260,u=o+.5;t.setY(r,-10+u*h);const d=Ne.smoothstep(u*h,60,140);n[r*3]=.28+d*.6,n[r*3+1]=.32+d*.58,n[r*3+2]=.36+d*.56}e.setAttribute("color",new gt(n,3)),e.computeVertexNormals();const i=new ut(e,new ji({vertexColors:!0,side:Qt,flatShading:!0}));return i.position.set(this.habitat.features.mountainsCenterX??(this.habitat.extent.minX+this.habitat.extent.maxX)/2,0,0),i.scale.set(1.25,1,.55),i.name="stylised_fjord_mountains",i}update(e,t,n,i,r){const a=t.position.y>.05,o=this.habitat.waterAt(n,this.shallow),c=o+r*.003,l=Ne.clamp((o-.0175)/.006,0,1);this.fog.color.copy(this.shallow),this.fog.density=a?-.0022:c,this.surfaceUniforms.uDensity.value=c,this.surfaceUniforms.uTime.value=e,this.surfaceUniforms.uUnder.value=a?0:1,this.domeUniforms.uCamY.value=t.position.y,this.domeUniforms.uAbove.value=a?1:0,this.dome.position.copy(t.position),this.surface.position.set(Math.round(t.position.x/4)*4,0,Math.round(t.position.z/4)*4);const h=Math.max(0,-t.position.y),u=Math.exp(-h*.03);this.hemi.intensity=a?2.2:Ne.lerp(.9,2.5,u),this.sun.intensity=a?3.2:Ne.lerp(.6,2.8,u),this.hemi.color.copy(a?new Le(14677247):this.shallow).lerp(new Le(16777215),a?0:.45),this.hemi.groundColor.set(a?2767424:533034),yr.uTime.value=e,yr.uCaustic.value=a?0:u*1+.15,this.rayUniforms.uTime.value=e,this.rayUniforms.uCam.value.copy(t.position),this.rayUniforms.uStrength.value=a?0:Ne.clamp(u*1.3,.12,1.2)*(1-l*.35),this.snowUniforms.uTime.value=e,this.snowUniforms.uCam.value.copy(t.position),this.snowUniforms.uPixel.value=i,this.snowUniforms.uAlpha.value=a?0:1,this.aboveWater.visible=a,this.rayBase}}function Qo(s){let e=s>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}const wy=1,Ey="habitat:svalbard-fjord-slice",Ty="Svalbard-inspired fjord",Ay={kind:"stylised-compressed",note:"A compressed, stylised game world informed by Svalbard ecology. Not a metric reconstruction of a real fjord, a tracked pod route or navigation-grade bathymetry. Depths, distances and densities are chosen for play."},Ry={minX:-60,maxX:1080,corridorZ:82,floorDepth:360},Cy=[{id:"glacier",label:"ZONE 1 · GLACIER FJORD",x0:-60,x1:270},{id:"coast",label:"ZONE 2 · COAST + KELP",x0:270,x1:540},{id:"shelf",label:"ZONE 3 · DEEP SHELF",x0:540,x1:760},{id:"herring",label:"ZONE 4 · HERRING GROUND",x0:760,x1:920},{id:"vessel",label:"ZONE 5 · VESSEL LANE",x0:920,x1:1080}],Py=[{x:0,color:"#4fae9f",density:.023,note:"glacial meltwater, milky green"},{x:330,color:"#3a9fb0",density:.0175},{x:700,color:"#2b7fae",density:.0155,note:"clearer Atlantic-influenced water"},{x:1e3,color:"#3a9fb0",density:.0175}],Ly=[{x0:200,x1:300,rise:7,note:"glacier basin to coastal shallows"},{x0:520,x1:640,rise:-34,note:"shelf drop"},{x0:760,x1:860,rise:6,note:"herring ground"},{x0:900,x1:1010,rise:12,note:"rising toward the vessel lane"}],Iy=-19,Dy={glacierFront:{x0:70,x1:270,z:-74},kelp:{x0:290,x1:525,zSpread:78,clusters:26},coastRidges:{x0:270,x1:545},seaIce:{dense:{x0:-60,x1:270,z0:-82,z1:38},sparse:{x0:330,x1:890,zSpread:75}},icebergs:[[120,-30,9],[205,22,7],[40,38,6],[300,-55,8],[460,60,6]],mountainsCenterX:500},Ny={player:[0,-7,0],codSchool:[330,-8,-14],herringBall:[842,-24,6],vesselLane:[988,.35,0]},Uy=["orca","beluga","narwhal","ringed-seal","walrus","polar-cod","herring","humpback"],Fy=[{label:"Norwegian Polar Institute · Svalbard fauna",url:"https://npolar.no/en/themes/fauna-svalbard/"},{label:"GEBCO_2026 / IBCAO (registered reference only; not baked into this seabed)",url:"https://www.gebco.net/data-products-gridded-bathymetry-data/gebco2026-grid"}],Oy={schemaVersion:wy,id:Ey,name:Ty,truth:Ay,extent:Ry,zones:Cy,water:Py,profile:Ly,baseDepth:Iy,features:Dy,spawns:Ny,species:Uy,sources:Fy},es=yy(Oy),Yi=es.floorAt,ec=s=>{const e=es.spawns[s];return{x:e[0],y:e[1],z:e[2]}},Xt={minX:es.extent.minX,maxX:es.extent.maxX,corridorZ:es.extent.corridorZ,glacierFront:es.features.glacierFront,herringHome:ec("herringBall"),codHome:ec("codSchool"),vessel:ec("vesselLane")};function as(s,e=!1){const t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,c=new Lt;let l=0;for(let h=0;h<s.length;++h){const u=s[h];let d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,f,h),l+=f}}if(t){let h=0;const u=[];for(let d=0;d<s.length;++d){const f=s[d].index;for(let b=0;b<f.count;++b)u.push(f.getX(b)+h);h+=s[d].attributes.position.count}c.setIndex(u)}for(const h in r){const u=Mu(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;c.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[h]=[];for(let d=0;d<u;++d){const f=[];for(let v=0;v<a[h].length;++v)f.push(a[h][v][d]);const b=Mu(f);if(!b)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;c.morphAttributes[h].push(b)}}return c}function Mu(s){let e,t,n,i=-1,r=0;for(let l=0;l<s.length;++l){const h=s[l];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const a=new e(r),o=new gt(a,t,n);let c=0;for(let l=0;l<s.length;++l){const h=s[l];if(h.isInterleavedBufferAttribute){const u=c/t;for(let d=0,f=h.count;d<f;d++)for(let b=0;b<t;b++){const v=h.getComponent(d,b);o.setComponent(d+u,b,v)}}else a.set(h.array,c);c+=h.count*t}return i!==void 0&&(o.gpuType=i),o}function Su(s,e){if(e===Tf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Hc||e===qu){let t=s.getIndex();if(t===null){const a=[],o=s.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);s.setIndex(a),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Hc)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class Pd extends $s{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Hy(t)}),this.register(function(t){return new Vy(t)}),this.register(function(t){return new Zy(t)}),this.register(function(t){return new Qy(t)}),this.register(function(t){return new eM(t)}),this.register(function(t){return new Xy(t)}),this.register(function(t){return new jy(t)}),this.register(function(t){return new qy(t)}),this.register(function(t){return new Yy(t)}),this.register(function(t){return new Gy(t)}),this.register(function(t){return new Ky(t)}),this.register(function(t){return new Wy(t)}),this.register(function(t){return new Jy(t)}),this.register(function(t){return new $y(t)}),this.register(function(t){return new By(t)}),this.register(function(t){return new tM(t)}),this.register(function(t){return new nM(t)})}load(e,t,n,i){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=_r.extractUrlBase(e);a=_r.resolveURL(l,this.path)}else a=_r.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Sd(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Ld){try{a[ot.KHR_BINARY_GLTF]=new iM(e)}catch(u){i&&i(u);return}r=JSON.parse(a[ot.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new gM(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case ot.KHR_MATERIALS_UNLIT:a[u]=new zy;break;case ot.KHR_DRACO_MESH_COMPRESSION:a[u]=new sM(r,this.dracoLoader);break;case ot.KHR_TEXTURE_TRANSFORM:a[u]=new rM;break;case ot.KHR_MESH_QUANTIZATION:a[u]=new aM;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function ky(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const ot={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class By{constructor(e){this.parser=e,this.name=ot.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const h=new Le(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],on);const u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Ed(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new px(h),l.distance=u;break;case"spot":l=new dx(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),l.decay=2,ii(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}class zy{constructor(){this.name=ot.KHR_MATERIALS_UNLIT}getMaterialType(){return Ii}extendParams(e,t,n){const i=[];e.color=new Le(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],on),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,zt))}return Promise.all(i)}}class Gy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class Hy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new fe(o,o)}return Promise.all(r)}}class Vy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class Wy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}}class Xy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new Le(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],on)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,zt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}}class jy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}}class qy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Le().setRGB(o[0],o[1],o[2],on),Promise.all(r)}}class Yy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class Ky{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new Le().setRGB(o[0],o[1],o[2],on),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,zt)),Promise.all(r)}}class $y{constructor(e){this.parser=e,this.name=ot.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}}class Jy{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Xn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}}class Zy{constructor(e){this.parser=e,this.name=ot.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class Qy{constructor(e){this.parser=e,this.name=ot.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,a.source,c);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class eM{constructor(e){this.parser=e,this.name=ot.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,a.source,c);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class tM{constructor(e){this.name=ot.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const c=i.byteOffset||0,l=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class nM{constructor(e){this.name=ot.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==Mn.TRIANGLES&&l.mode!==Mn.TRIANGLE_STRIP&&l.mode!==Mn.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(h=>(c[l]=h,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const h=l.pop(),u=h.isGroup?h.children:[h],d=l[0].count,f=[];for(const b of u){const v=new Je,g=new C,p=new Fn,x=new C(1,1,1),_=new Cs(b.geometry,b.material,d);for(let m=0;m<d;m++)c.TRANSLATION&&g.fromBufferAttribute(c.TRANSLATION,m),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,m),c.SCALE&&x.fromBufferAttribute(c.SCALE,m),_.setMatrixAt(m,v.compose(g,p,x));for(const m in c)if(m==="_COLOR_0"){const L=c[m];_.instanceColor=new Na(L.array,L.itemSize,L.normalized)}else m!=="TRANSLATION"&&m!=="ROTATION"&&m!=="SCALE"&&b.geometry.setAttribute(m,c[m]);Et.prototype.copy.call(_,b),this.parser.assignFinalMaterial(_),f.push(_)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const Ld="glTF",hr=12,wu={JSON:1313821514,BIN:5130562};class iM{constructor(e){this.name=ot.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,hr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Ld)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-hr,r=new DataView(e,hr);let a=0;for(;a<i;){const o=r.getUint32(a,!0);a+=4;const c=r.getUint32(a,!0);if(a+=4,c===wu.JSON){const l=new Uint8Array(e,hr+a,o);this.content=n.decode(l)}else if(c===wu.BIN){const l=hr+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class sM{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ot.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const h in a){const u=Zc[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=Zc[h]||h.toLowerCase();if(a[h]!==void 0){const d=n.accessors[e.attributes[h]],f=Ns[d.componentType];l[u]=f.name,c[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const b in f.attributes){const v=f.attributes[b],g=c[b];g!==void 0&&(v.normalized=g)}u(f)},o,l,on,d)})})}}class rM{constructor(){this.name=ot.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class aM{constructor(){this.name=ot.KHR_MESH_QUANTIZATION}}class Id extends Dr{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,b=e*l,v=b-l,g=-2*f+3*d,p=f-d,x=1-g,_=p-d+u;for(let m=0;m!==o;m++){const L=a[v+m+o],T=a[v+m+c]*h,A=a[b+m+o],D=a[b+m]*h;r[m]=x*L+_*T+g*A+p*D}return r}}const oM=new Fn;class cM extends Id{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return oM.fromArray(r).normalize().toArray(r),r}}const Mn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Ns={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Eu={9728:an,9729:gn,9984:Ou,9985:wa,9986:dr,9987:ai},Tu={33071:Li,33648:Ia,10497:ts},tc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Zc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Ri={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},lM={CUBICSPLINE:void 0,LINEAR:wr,STEP:Sr},nc={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function hM(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new qt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:li})),s.DefaultMaterial}function Ki(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function ii(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function uM(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,h=e.length;l<h;l++){const u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const a=[],o=[],c=[];for(let l=0,h=e.length;l<h;l++){const u=e[l];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;a.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;o.push(d)}if(r){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;c.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const h=l[0],u=l[1],d=l[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function dM(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function fM(s){let e;const t=s.extensions&&s.extensions[ot.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+ic(t.attributes):e=s.indices+":"+ic(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+ic(s.targets[n]);return e}function ic(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Qc(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function pM(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const mM=new Je;class gM{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new ky,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const c=o.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&a<98?this.textureLoader=new wd(this.options.manager):this.textureLoader=new gx(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Sd(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return Ki(r,o,i),ii(o,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(const c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,h]of a.children.entries())r(h,o.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ot.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load(_r.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=tc[i.type],o=Ns[i.componentType],c=i.normalized===!0,l=new o(i.count*a);return Promise.resolve(new gt(l,a,c))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],c=tc[i.type],l=Ns[i.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,b=i.normalized===!0;let v,g;if(f&&f!==u){const p=Math.floor(d/f),x="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let _=t.cache.get(x);_||(v=new l(o,p*f,i.count*f/h),_=new fv(v,f/h),t.cache.add(x,_)),g=new bl(_,c,d%f/h,b)}else o===null?v=new l(i.count*c):v=new l(o,d,i.count*c),g=new gt(v,c,b);if(i.sparse!==void 0){const p=tc.SCALAR,x=Ns[i.sparse.indices.componentType],_=i.sparse.indices.byteOffset||0,m=i.sparse.values.byteOffset||0,L=new x(a[1],_,i.sparse.count*p),T=new l(a[2],m,i.sparse.count*c);o!==null&&(g=new gt(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let A=0,D=L.length;A<D;A++){const S=L[A];if(g.setX(S,T[A*c]),c>=2&&g.setY(S,T[A*c+1]),c>=3&&g.setZ(S,T[A*c+2]),c>=4&&g.setW(S,T[A*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=b}return g})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const i=this,r=this.json,a=r.textures[e],o=r.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const d=(r.samplers||{})[a.sampler]||{};return h.magFilter=Eu[d.magFilter]||gn,h.minFilter=Eu[d.minFilter]||ai,h.wrapS=Tu[d.wrapS]||ts,h.wrapT=Tu[d.wrapT]||ts,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==an&&h.minFilter!==gn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(u){l=!0;const d=new Blob([u],{type:a.mimeType});return c=o.createObjectURL(d),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(c).then(function(u){return new Promise(function(d,f){let b=d;t.isImageBitmapLoader===!0&&(b=function(v){const g=new jt(v);g.needsUpdate=!0,d(g)}),t.load(_r.resolveURL(u,r.path),b,void 0,f)})}).then(function(u){return l===!0&&o.revokeObjectURL(c),ii(u,a),u.userData.mimeType=a.mimeType||pM(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[ot.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[ot.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=r.associations.get(a);a=r.extensions[ot.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,c)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new fd,Un.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new dd,Un.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),r&&(c.vertexColors=!0),a&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return qt}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},c=r.extensions||{},l=[];if(c[ot.KHR_MATERIALS_UNLIT]){const u=i[ot.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),l.push(u.extendParams(o,r,t))}else{const u=r.pbrMetallicRoughness||{};if(o.color=new Le(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],on),o.opacity=d[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",u.baseColorTexture,zt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=Zt);const h=r.alphaMode||nc.OPAQUE;if(h===nc.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===nc.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Ii&&(l.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new fe(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==Ii&&(l.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Ii){const u=r.emissiveFactor;o.emissive=new Le().setRGB(u[0],u[1],u[2],on)}return r.emissiveTexture!==void 0&&a!==Ii&&l.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,zt)),Promise.all(l).then(function(){const u=new a(o);return r.name&&(u.name=r.name),ii(u,r),t.associations.set(u,{materials:e}),r.extensions&&Ki(i,u,r),u})}createUniqueName(e){const t=_t.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[ot.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return Au(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],h=fM(l),u=i[h];if(u)a.push(u.promise);else{let d;l.extensions&&l.extensions[ot.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=Au(new Lt,l,t),i[h]={primitive:l,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const h=a[c].material===void 0?hM(this.cache):this.getDependency("material",a[c].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){const l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let f=0,b=h.length;f<b;f++){const v=h[f],g=a[f];let p;const x=l[f];if(g.mode===Mn.TRIANGLES||g.mode===Mn.TRIANGLE_STRIP||g.mode===Mn.TRIANGLE_FAN||g.mode===void 0)p=r.isSkinnedMesh===!0?new hd(v,x):new ut(v,x),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),g.mode===Mn.TRIANGLE_STRIP?p.geometry=Su(p.geometry,qu):g.mode===Mn.TRIANGLE_FAN&&(p.geometry=Su(p.geometry,Hc));else if(g.mode===Mn.LINES)p=new bv(v,x);else if(g.mode===Mn.LINE_STRIP)p=new xl(v,x);else if(g.mode===Mn.LINE_LOOP)p=new vv(v,x);else if(g.mode===Mn.POINTS)p=new _l(v,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(p.geometry.morphAttributes).length>0&&dM(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),ii(p,r),g.extensions&&Ki(i,p,g),t.assignFinalMaterial(p),u.push(p)}for(let f=0,b=u.length;f<b;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&Ki(i,u[0],r),u[0];const d=new wt;r.extensions&&Ki(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,b=u.length;f<b;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new rn(Ne.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new pl(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ii(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),a=i,o=[],c=[];for(let l=0,h=a.length;l<h;l++){const u=a[l];if(u){o.push(u);const d=new Je;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Ga(o,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,a=[],o=[],c=[],l=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],b=i.samplers[f.sampler],v=f.target,g=v.node,p=i.parameters!==void 0?i.parameters[b.input]:b.input,x=i.parameters!==void 0?i.parameters[b.output]:b.output;v.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",x)),l.push(b),h.push(v))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],b=u[2],v=u[3],g=u[4],p=[];for(let x=0,_=d.length;x<_;x++){const m=d[x],L=f[x],T=b[x],A=v[x],D=g[x];if(m===void 0)continue;m.updateMatrix&&m.updateMatrix();const S=n._createAnimationTracks(m,L,T,A,D);if(S)for(let y=0;y<S.length;y++)p.push(S[y])}return new ix(r,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=i.weights.length;c<l;c++)o.morphTargetInfluences[c]=i.weights[c]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=i.children||[];for(let l=0,h=o.length;l<h;l++)a.push(n.getDependency("node",o[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(a),c]).then(function(l){const h=l[0],u=l[1],d=l[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,mM)});for(let f=0,b=u.length;f<b;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"",o=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let h;if(r.isBone===!0?h=new vl:l.length>1?h=new wt:l.length===1?h=l[0]:h=new Et,h!==l[0])for(let u=0,d=l.length;u<d;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=a),ii(h,r),r.extensions&&Ki(n,h,r),r.matrix!==void 0){const u=new Je;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new wt;n.name&&(r.name=i.createUniqueName(n.name)),ii(r,n),n.extensions&&Ki(t,r,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(i.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let h=0,u=c.length;h<u;h++)r.add(c[h]);const l=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof Un||d instanceof jt)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){const a=[],o=e.name?e.name:e.uuid,c=[];Ri[r.path]===Ri.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(o);let l;switch(Ri[r.path]){case Ri.weights:l=Vs;break;case Ri.rotation:l=Ws;break;case Ri.position:case Ri.scale:l=Xs;break;default:switch(n.itemSize){case 1:l=Vs;break;case 2:case 3:default:l=Xs;break}break}const h=i.interpolation!==void 0?lM[i.interpolation]:wr,u=this._getArrayFromAccessor(n);for(let d=0,f=c.length;d<f;d++){const b=new l(c[d]+"."+Ri[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(b),a.push(b)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Qc(t.constructor),i=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Ws?cM:Id;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function bM(s,e,t){const n=e.attributes,i=new Hn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(i.set(new C(c[0],c[1],c[2]),new C(l[0],l[1],l[2])),o.normalized){const h=Qc(Ns[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new C,c=new C;for(let l=0,h=r.length;l<h;l++){const u=r[l];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,b=d.max;if(f!==void 0&&b!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(b[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(b[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(b[2]))),d.normalized){const v=Qc(Ns[d.componentType]);c.multiplyScalar(v)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}s.boundingBox=i;const a=new Vn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=a}function Au(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(c){s.setAttribute(o,c)})}for(const a in n){const o=Zc[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return ct.workingColorSpace!==on&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ct.workingColorSpace}" not supported.`),ii(s,e),bM(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?uM(s,e.targets,t):s})}var vM=(function(){var s="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q;iekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq:P8Yqdbk;3sezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhDcbhqinaqae9pmeaDaeaq9RaqaDfae6Egkcsfgocl4cifcd4hxdndndndnaoc9WGgmTmbcbhPcehsawcjdfhzalhHinaraH9Rax6midnaraHaxfgl9RcK6mbczhoinawcj;cbfaogifgoc9WfhOdndndndndnaHaic9WfgAco4fRbbaAci4coG4ciGPlbedibkaO9cb83ibaOcwf9cb83ibxikaOalRblalRbbgAco4gCaCciSgCE86bbaocGfalclfaCfgORbbaAcl4ciGgCaCciSgCE86bbaocVfaOaCfgORbbaAcd4ciGgCaCciSgCE86bbaoc7faOaCfgORbbaAciGgAaAciSgAE86bbaoctfaOaAfgARbbalRbegOco4gCaCciSgCE86bbaoc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc93faAaCfgARbbaOciGgOaOciSgOE86bbaoc94faAaOfgARbbalRbdgOco4gCaCciSgCE86bbaoc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc97faAaCfgARbbaOciGgOaOciSgOE86bbaoc98faAaOfgORbbalRbiglco4gAaAciSgAE86bbaoc99faOaAfgORbbalcl4ciGgAaAciSgAE86bbaoc9:faOaAfgORbbalcd4ciGgAaAciSgAE86bbaocufaOaAfgoRbbalciGglalciSglE86bbaoalfhlxdkaOalRbwalRbbgAcl4gCaCcsSgCE86bbaocGfalcwfaCfgORbbaAcsGgAaAcsSgAE86bbaocVfaOaAfgORbbalRbegAcl4gCaCcsSgCE86bbaoc7faOaCfgORbbaAcsGgAaAcsSgAE86bbaoctfaOaAfgORbbalRbdgAcl4gCaCcsSgCE86bbaoc91faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc4faOaAfgORbbalRbigAcl4gCaCcsSgCE86bbaoc93faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc94faOaAfgORbbalRblgAcl4gCaCcsSgCE86bbaoc95faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc96faOaAfgORbbalRbvgAcl4gCaCcsSgCE86bbaoc97faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc98faOaAfgORbbalRbogAcl4gCaCcsSgCE86bbaoc99faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc9:faOaAfgORbbalRbrglcl4gAaAcsSgAE86bbaocufaOaAfgoRbbalcsGglalcsSglE86bbaoalfhlxekaOal8Pbb83bbaOcwfalcwf8Pbb83bbalczfhlkdnaiam9pmbaiczfhoaral9RcL0mekkaiam6mialTmidnakTmbawaPfRbbhOcbhoazhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkkazcefhzaPcefgPad6hsalhHaPad9hmexvkkcbhlasceGmdxikalaxad2fhCdnakTmbcbhHcehsawcjdfhminaral9Rax6mialTmdalaxfhlawaHfRbbhOcbhoamhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkamcefhmaHcefgHad6hsaHad9hmbkaChlxikcbhocehsinaral9Rax6mdalTmealaxfhlaocefgoad6hsadao9hmbkaChlxdkcbhlasceGTmekc9:hoxikabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqalmbkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;ebf8Kjjjjbaok;yzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;siliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabavcefciGaiVcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:Ohkxekcjjjj94hkkabavcdfciGaiVcetfak87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:Ohqxekcjjjj94hqkabavcufciGaiVcetfaq87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohqxekcjjjj94hqkabavciGaiVcetfaq87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2geTmbinababydbgdcwtcw91:Yadce91cjjj;8ifcjjj98G::NUdbabclfhbaecufgembkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaiczfhiaeczfheadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklz9Kbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q;Aekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq;t9tqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk;h8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhwcbhDinaDae9pmeawaeaD9RaDawfae6Egqcsfgoc9WGgkci2hxakcethmaocl4cifcd4hPabaDad2fhscbhzdnincehHalhOcbhAdninaraO9RaP6miavcj;cbfaAak2fhCaOaPfhlcbhidnakc;ab6mbaral9Rc;Gb6mbcbhoinaCaofhidndndndndnaOaoco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklbalczfhlkdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklzalczfhlkdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklaalczfhlkdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalclfaYpQbfaXc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalcwfaYpQbfaXc:q:yjjbfRbbfhlxekaialpbbbpkl8Walczfhlkaoc;abfhiaocjefak0meaihoaral9Rc;Fb0mbkkdndnaiak9pmbaici4hoinaral9RcK6mdaCaifhXdndndndndnaOaico4fRbbaocoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpklbxikaXalpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaXalpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaXalpbbbpklbalczfhlkaocdfhoaiczfgiak6mbkkalTmbaAci6hHalhOaAcefgohAaoclSmdxekkcbhlaHceGmdkdnakTmbavcjdfazfhiavazfpbdbhYcbhXinaiavcj;cbfaXfgopblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLaoakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEaoamfpblbg3cep9Ta3aQp9op9Hp9rg3aoaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfhiaXczfgXak6mbkkazclfgzad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfhDc9:hoalmexikkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk;uzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:EPliuo97eue978Jjjjjbca9Rhidndnadcl9hmbdnaec98GglTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalae9pmeaiaeciGgvcdtgdVcbczad9R;8kbaiabalcdtfglad;8qbbdnavTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkalaiad;8qbbskdnaec98GgxTmbcbhvabhdinadczfglalpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oawaopmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgvax6mbkkaxae9pmbaiaeciGgvcitgdfcbcaad9R;8kbaiabaxcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oawaopmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalae9pmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbhdabheinaeaepbbbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepkbbaeczfheadclfgdav6mbkkdnaval9pmbaialciGgdcdtgeVcbc;abae9R;8kbaiabavcdtfgvae;8qbbdnadTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepklbkavaiae;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz9Tbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var i=WebAssembly.validate(t)?e:s,r,a=WebAssembly.instantiate(o(i),{}).then(function(p){r=p.instance,r.exports.__wasm_call_ctors()});function o(p){for(var x=new Uint8Array(p.length),_=0;_<p.length;++_){var m=p.charCodeAt(_);x[_]=m>96?m-97:m>64?m-39:m+4}for(var L=0,_=0;_<p.length;++_)x[L++]=x[_]<60?n[x[_]]:(x[_]-60)*64+x[++_];return x.buffer.slice(0,L)}function c(p,x,_,m,L,T){var A=r.exports.sbrk,D=_+3&-4,S=A(D*m),y=A(L.length),P=new Uint8Array(r.exports.memory.buffer);P.set(L,y);var U=p(S,_,m,y,L.length);if(U==0&&T&&T(S,D,m),x.set(P.subarray(S,S+_*m)),A(S-A(0)),U!=0)throw new Error("Malformed buffer data: "+U)}var l={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},h={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},u=[],d=0;function f(p){var x={object:new Worker(p),pending:0,requests:{}};return x.object.onmessage=function(_){var m=_.data;x.pending-=m.count,x.requests[m.id][m.action](m.value),delete x.requests[m.id]},x}function b(p){for(var x="var instance; var ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(o(i))+"]), {}).then(function(result) { instance = result.instance; instance.exports.__wasm_call_ctors(); });self.onmessage = workerProcess;"+c.toString()+g.toString(),_=new Blob([x],{type:"text/javascript"}),m=URL.createObjectURL(_),L=0;L<p;++L)u[L]=f(m);URL.revokeObjectURL(m)}function v(p,x,_,m,L){for(var T=u[0],A=1;A<u.length;++A)u[A].pending<T.pending&&(T=u[A]);return new Promise(function(D,S){var y=new Uint8Array(_),P=d++;T.pending+=p,T.requests[P]={resolve:D,reject:S},T.object.postMessage({id:P,count:p,size:x,source:y,mode:m,filter:L},[y.buffer])})}function g(p){a.then(function(){var x=p.data;try{var _=new Uint8Array(x.count*x.size);c(r.exports[x.mode],_,x.count,x.size,x.source,r.exports[x.filter]),self.postMessage({id:x.id,count:x.count,action:"resolve",value:_},[_.buffer])}catch(m){self.postMessage({id:x.id,count:x.count,action:"reject",value:m})}})}return{ready:a,supported:!0,useWorkers:function(p){b(p)},decodeVertexBuffer:function(p,x,_,m,L){c(r.exports.meshopt_decodeVertexBuffer,p,x,_,m,r.exports[l[L]])},decodeIndexBuffer:function(p,x,_,m){c(r.exports.meshopt_decodeIndexBuffer,p,x,_,m)},decodeIndexSequence:function(p,x,_,m){c(r.exports.meshopt_decodeIndexSequence,p,x,_,m)},decodeGltfBuffer:function(p,x,_,m,L,T){c(r.exports[h[L]],p,x,_,m,r.exports[l[T]])},decodeGltfBufferAsync:function(p,x,_,m,L){return u.length>0?v(p,x,_,h[m],l[L]):a.then(function(){var T=new Uint8Array(p*x);return c(r.exports[h[m]],T,p,x,_,r.exports[l[L]]),T})}}})();const Dd={value:0};function os(s,e,t=18,n={y:1,z:1}){const i=s.map(([a,o])=>new fe(Math.max(1e-4,o*e),(a-.5)*e)),r=new Sl(i,t);return r.rotateZ(-Math.PI/2),r.scale(1,n.y,n.z),r}function qa(s,e){const t=new Va(s.map(([i,r])=>new fe(i,r))),n=new Ir(t,{depth:e,bevelEnabled:!0,bevelThickness:e*.4,bevelSize:e*.5,bevelSegments:1,curveSegments:6});return n.translate(0,0,-e/2),n}function Ya(s,e){const t=s.index?s.toNonIndexed():s,n=t.attributes.position,i=new Float32Array(n.count*3),r=new C,a=new Le;for(let o=0;o<n.count;o+=1)r.fromBufferAttribute(n,o),e(r,a),i[o*3]=a.r,i[o*3+1]=a.g,i[o*3+2]=a.b;return t.setAttribute("color",new gt(i,3)),t.deleteAttribute("uv"),t}function Js(s,e,t){const n=[[0,0],[-e*.35,s*.18],[-e*.8,s*.42],[-e*1.05,s*.5],[-e*.92,s*.36],[-e*.78,s*.12],[-e*.84,0]],i=[...n,...n.slice(1,-1).reverse().map(([a,o])=>[a,-o])],r=qa(i,t);return r.rotateX(Math.PI/2),r}function Ka(s,e,t,n=!0){const i=n?[[0,0],[-e*.3,s*.35],[-e*.55,s*.8],[-e*.35,s],[0,s*.9],[e*.2,s*.45]]:[[0,0],[-e*.2,s*.5],[-e*.5,s],[-e*.15,s*.95],[e*.25,s*.4]],r=qa(i,t);return r.rotateX(Math.PI/2),r}function Nd(){const e=os([[0,.004],[.06,.018],[.14,.035],[.25,.062],[.38,.09],[.52,.106],[.66,.104],[.78,.092],[.88,.072],[.95,.045],[.985,.022],[1,.004]],7,22,{y:1.02,z:.9}),t=qa([[.55,0],[.1,.55],[-.15,1.65],[-.32,1.7],[-.45,.6],[-.8,0]],.09);t.translate(-.3,.62,0);const n=Js(2.1,.9,.07);n.translate(-3.35,0,0);const i=Ka(1.25,.75,.06);i.rotateZ(-.2),i.rotateX(.35),i.translate(1.15,-.45,.55);const r=i.clone();r.scale(1,1,-1);const a=new Le(461067),o=new Le(15331050),c=new Le(5989478),l=(d,f)=>{f.copy(a);const b=Math.hypot(d.y,d.z);d.y<-.18&&d.x>-1.6&&d.x<3.1&&Math.abs(d.z)<.42+Math.max(0,d.x-1.5)*.12&&f.copy(o),d.x>-1.8&&d.x<-.4&&d.y<-.05&&d.y>-.55&&Math.abs(d.z)>.25&&f.copy(o),d.x>2.05&&d.x<2.85&&d.y>.02&&d.y<.32&&Math.abs(d.z)>.28&&b>.35&&f.copy(o),d.x>-1.25&&d.x<-.3&&d.y>.42&&b>.4&&f.copy(c)},h=[e,t,n,i,r].map(d=>Ya(d,l)),u=as(h,!1);return u.computeVertexNormals(),u}function Nr(s,e){const t=new qt({color:s,roughness:e.roughness??.55,metalness:0,vertexColors:!!e.vertexColors}),n=Math.random()*10;return t.onBeforeCompile=i=>{i.uniforms.uTime=Dd,i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        float wildT = clamp((${(e.length*.15).toFixed(3)} - position.x) / ${(e.length*.65).toFixed(3)}, 0.0, 1.0);
        transformed.y += sin(uTime * ${e.freq.toFixed(3)} + ${n.toFixed(3)} - position.x * ${(4.5/e.length).toFixed(3)}) * ${(e.amp*e.length).toFixed(4)} * wildT * wildT;`)},t}function xM(){const e=os([[0,.004],[.06,.02],[.18,.05],[.32,.085],[.5,.115],[.66,.118],[.78,.108],[.86,.1],[.9,.105],[.95,.098],[.985,.06],[1,.012]],4.3,20,{y:1,z:.95}),t=Js(1.1,.42,.05);t.translate(-4.3/2+.05,0,0);const n=Ka(.55,.32,.05);n.translate(1,-.35,.38);const i=n.clone();i.scale(1,1,-1);const r=qa([[.4,0],[0,.06],[-.6,0]],.1);r.translate(-.2,.47,0);const a=as([e,t,n,i,r].map(l=>l.index?l.toNonIndexed():l).map(l=>(l.deleteAttribute("uv"),l)),!1);a.computeVertexNormals();const o=new ut(a,Nr(15134701,{length:4.3,amp:.035,freq:2.6,roughness:.48})),c=new wt;return c.add(o),{root:c,length:4.3}}function _M(){const e=os([[0,.004],[.07,.02],[.2,.05],[.36,.085],[.55,.105],[.72,.1],[.86,.085],[.95,.065],[.99,.03],[1,.006]],4.4,18,{y:.98,z:.92}),t=Js(1.15,.45,.05);t.translate(-4.4/2+.05,0,0);const n=Ka(.45,.25,.04);n.translate(1.1,-.3,.36);const i=n.clone();i.scale(1,1,-1);const r=Ya(as([e,t,n,i].map(l=>l.index?l.toNonIndexed():l).map(l=>(l.deleteAttribute("uv"),l)),!1),(l,h)=>{const u=Math.sin(l.x*7.1+l.z*5.3)*Math.sin(l.y*9.2-l.x*3.1),f=.42+Ne.smoothstep(-l.y,.05,.4)*.4+(u>.55?-.18:0);h.setRGB(f*.93,f*.97,f)});r.computeVertexNormals();const a=new ut(r,Nr(16777215,{length:4.4,amp:.035,freq:2.4,vertexColors:!0})),o=new ut(new Ha(.045,2.4,7),new qt({color:15261638,roughness:.5}));o.rotation.z=-Math.PI/2,o.position.set(4.4/2+1.15,.02,.05);const c=new wt;return c.add(a,o),{root:c,length:4.4}}function yM(){const e=os([[0,.01],[.08,.06],[.25,.14],[.5,.19],[.7,.17],[.8,.12],[.86,.13],[.95,.1],[1,.03]],1.45,16,{y:.9,z:1}),t=Js(.5,.28,.03);t.translate(-1.45/2+.05,0,0);const n=as([e,t].map(a=>a.index?a.toNonIndexed():a).map(a=>(a.deleteAttribute("uv"),a)),!1),i=Ya(n,(a,o)=>{const c=Math.sin(a.x*22)*Math.sin(a.z*25+a.y*9)>.6&&a.y>-.05,l=a.y>0?c?.62:.34:.66;o.setRGB(l*.92,l*.95,l)});i.computeVertexNormals();const r=new wt;return r.add(new ut(i,Nr(16777215,{length:1.45,amp:.05,freq:5.2,vertexColors:!0}))),{root:r,length:1.45}}function Ru(){const e=os([[0,.02],[.08,.1],[.25,.19],[.45,.24],[.65,.23],[.8,.18],[.88,.13],[.95,.12],[1,.05]],3,18,{y:.85,z:1}),t=Js(.9,.45,.05);t.translate(-3/2+.05,-.1,0);const n=as([e,t].map(o=>o.index?o.toNonIndexed():o).map(o=>(o.deleteAttribute("uv"),o)),!1);n.computeVertexNormals();const i=new ut(n,Nr(9071450,{length:3,amp:.02,freq:1.6,roughness:.8})),r=new qt({color:15524552,roughness:.45}),a=new wt;a.add(i);for(const o of[-1,1]){const c=new ut(new Ha(.045,.62,7),r);c.position.set(3/2-.02,-.38,o*.1),c.rotation.z=Math.PI+.25,a.add(c)}return{root:a,length:3}}function MM(){const e=os([[0,.004],[.06,.016],[.16,.035],[.3,.07],[.45,.095],[.6,.1],[.75,.088],[.88,.065],[.96,.04],[1,.012]],14.5,20,{y:.92,z:1}),t=Js(4.4,1.6,.1);t.translate(-14.5/2+.1,0,0);const n=Ka(4.3,.9,.09,!1);n.rotateY(.6),n.translate(2.6,-.7,1);const i=n.clone();i.scale(1,1,-1);const r=as([e,t,n,i].map(o=>o.index?o.toNonIndexed():o).map(o=>(o.deleteAttribute("uv"),o)),!1);r.computeVertexNormals();const a=new wt;return a.add(new ut(r,Nr(2898495,{length:14.5,amp:.02,freq:.9}))),{root:a,length:14.5}}function SM(){const e=os([[0,.012],[.22,.075],[.5,.105],[.78,.085],[1,.012]],1,6,{y:1.25,z:.55}),t=new Lt,n=-1/2+.04,r=[...[n,0,0,n-.22,.13,0,n-.17,0,0,n,0,0,n-.17,0,0,n-.22,-.13,0],n,0,0,n-.17,0,0,n-.22,.13,0,n,0,0,n-.22,-.13,0,n-.17,0,0];t.setAttribute("position",new yt(r,3)),t.computeVertexNormals();const a=[e.index?e.toNonIndexed():e,t];a[0].deleteAttribute("uv");const o=as(a,!1),c=Ya(o,(l,h)=>{const u=Ne.smoothstep(l.y,-.02,.07);h.setRGB(Ne.lerp(.86,.16,u),Ne.lerp(.9,.3,u),Ne.lerp(.92,.36,u))});return c.computeVertexNormals(),c}function wM(){const s=new wt,e=new Va;e.moveTo(-7,1.2),e.lineTo(6.2,1.2),e.quadraticCurveTo(8.2,1.2,8.6,2.2),e.lineTo(8.6,2.6),e.lineTo(-7.2,2.6),e.lineTo(-7.2,1.6),e.quadraticCurveTo(-7.2,.2,-5.5,-.6),e.lineTo(5,-.9),e.quadraticCurveTo(7.5,-.4,6.2,1.2);const t=new ut(new Ir(e,{depth:5,bevelEnabled:!0,bevelSize:.4,bevelThickness:.4,bevelSegments:2}),new qt({color:2831416,roughness:.6}));t.geometry.translate(0,-2.2,-2.5);const n=new ut(new ss(4,2.4,3.6),new qt({color:14278619,roughness:.4}));n.position.set(-1.5,1.6,0);const i=new ut(new Lr(.1,.1,6),n.material);i.position.set(2.5,3,0);const r=new wt;for(let a=0;a<3;a+=1){const o=new ut(new ss(.08,.9,.35),new qt({color:9140810,metalness:.6,roughness:.4}));o.position.y=.45;const c=new wt;c.rotation.x=a/3*Math.PI*2,c.add(o),r.add(c)}return r.position.set(-7.4,-2.3,0),s.add(t,n,i,r),s.userData.prop=r,s.userData.speciesKey=void 0,s}function el(s){const e=window.__WILD_EMBED,t=e==null?void 0:e[s];if(!t)return null;const n=atob(t),i=new Uint8Array(n.length);for(let r=0;r<n.length;r+=1)i[r]=n.charCodeAt(r);return i.buffer}function EM(s,e){const t=window.__WILD_EMBED;return t!=null&&t[s]?`data:${e};base64,${t[s]}`:null}const Ud="./assets/orca_decoded.glb",TM="https://raw.githubusercontent.com/GilRaitses/orcastrike/eb23633cb6779c0d81198fcd91d994b7c18653c3/public/orca/orca.glb";let Sa=null;async function Cu(s){const e=new Pd;e.setMeshoptDecoder(vM);const t=s===Ud?el("orca_decoded.glb"):null,n=t?await e.parseAsync(t,""):await e.loadAsync(s);n.scene.updateMatrixWorld(!0);let i=null;if(n.scene.traverse(l=>{!i&&l.isMesh&&(i=l)}),!i)throw new Error("orca glb: no mesh");const r=i,a=r.geometry.clone();a.applyMatrix4(r.matrixWorld),a.attributes.normal||a.computeVertexNormals();const o=Array.isArray(r.material)?r.material[0]:r.material,c=o instanceof qt?o.clone():new qt({color:658703});return c instanceof qt&&(c.roughness=.36,c.metalness=.02),{geometry:a,material:c}}function AM(s){return Sa||(Sa=(async()=>{try{return{...await Cu(Ud),kind:"orcast-local"}}catch{s==null||s("orca_local_failed")}try{return{...await Cu(TM),kind:"orcast-remote"}}catch{s==null||s("orca_remote_failed")}return{geometry:Nd(),material:new qt({vertexColors:!0,roughness:.34,metalness:.02}),kind:"procedural"}})(),Sa)}function RM(){return{geometry:Nd(),material:new qt({vertexColors:!0,roughness:.34,metalness:.02}),kind:"procedural"}}const It={head:2.1,spine:.8,caudal:[-.7,-1.4,-2.1,-2.8,-3.45],jaw:{x:2.5,y:-.25},pec:{x:.7,y:-.25,z:.85}},CM=[.05,.09,.14,.21,.27],Pu=.55,PM=[.08,.12,.15,.16,.1],Bn=new bn;function Fd(s){const e=s.geometry.clone(),t=s.material.clone(),n={value:0};t instanceof qt&&(t.onBeforeCompile=y=>{y.uniforms.uEcho=n,y.fragmentShader=y.fragmentShader.replace("#include <common>",`#include <common>
uniform float uEcho;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
float wildRim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0,0.0,1.0))), 2.0);
totalEmissiveRadiance += vec3(0.35,0.9,1.0) * uEcho * (0.25 + wildRim * 1.2);`)});const i=(y,P,U=0,k=0)=>{const V=new vl;return V.name=y,V.position.set(P,U,k),V},r=i("orca_root",0),a=i("orca_spine",It.spine),o=i("orca_head",It.head-It.spine),c=i("orca_jaw",It.jaw.x-It.head,It.jaw.y);a.add(o),o.add(c),r.add(a);const l=[];let h=r,u=0;It.caudal.forEach((y,P)=>{const U=i("orca_caudal_"+P,y-u);h.add(U),l.push(U),h=U,u=y});const d=i("orca_pec_L",It.pec.x,It.pec.y,It.pec.z),f=i("orca_pec_R",It.pec.x,It.pec.y,-.85);r.add(d,f);const b=[r,a,o,c,...l,d,f],v=new Map;b.forEach((y,P)=>v.set(y,P));const g=[{bone:o,x:It.head},{bone:a,x:It.spine},{bone:r,x:0},...l.map((y,P)=>({bone:y,x:It.caudal[P]}))],p=e.attributes.position,x=new Uint16Array(p.count*4),_=new Float32Array(p.count*4),m=new C;for(let y=0;y<p.count;y+=1){m.fromBufferAttribute(p,y);let P=0;for(;P<g.length-1&&g[P+1].x>m.x;)P+=1;const U=g[P],k=g[Math.min(P+1,g.length-1)],V=U.x===k.x?0:Ne.clamp((U.x-m.x)/(U.x-k.x),0,1),$=V*V*(3-2*V),H=[{idx:v.get(U.bone),w:1-$},{idx:v.get(k.bone),w:$}];if(m.x>It.head&&m.y<It.jaw.y+.35){const ie=Ne.smoothstep(m.x,It.head,It.head+.9)*(1-Ne.smoothstep(m.y,It.jaw.y-.2,It.jaw.y+.35));ie>.001&&(H.forEach(ue=>{ue.w*=1-ie}),H.push({idx:v.get(c),w:ie}))}const Z=Math.abs(m.z);if(m.x>-.2&&m.x<1.6&&Z>.5&&m.y<.25){const ie=Ne.smoothstep(m.x,-.2,.2)*(1-Ne.smoothstep(m.x,1.1,1.6))*Ne.smoothstep(Z,.5,.9)*(1-Ne.smoothstep(m.y,-.2,.25));ie>.001&&(H.forEach(ue=>{ue.w*=1-ie}),H.push({idx:v.get(m.z>0?d:f),w:ie}))}H.sort((ie,ue)=>ue.w-ie.w);const W=H.slice(0,4),he=Math.max(1e-6,W.reduce((ie,ue)=>ie+ue.w,0));for(let ie=0;ie<4;ie+=1)x[y*4+ie]=W[ie]?W[ie].idx:0,_[y*4+ie]=W[ie]?W[ie].w/he:0}e.setAttribute("skinIndex",new gt(x,4)),e.setAttribute("skinWeight",new gt(_,4));const L=new hd(e,t);L.add(r),L.updateMatrixWorld(!0),L.bind(new Ga(b)),L.frustumCulled=!1,L.userData.orcaMesh=!0;const T=new wt;T.add(L);const A=L,D=d.quaternion.clone(),S=f.quaternion.clone();return{root:T,mesh:L,setEcho(y){n.value=y},setPose(y){const P=Ne.clamp(y.amp,0,1.8),U=Ne.clamp(y.yawRate*.42,-.6,.6),k=Ne.clamp(y.pitchRate*.16,-.18,.18);let V=0,$=0;if(y.slap>=0){const ie=y.slap;$=ie<.42?-Math.sin(ie/.42*Math.PI*.5)*.55:-.55+Math.sin((ie-.42)/.58*Math.PI)*1.55,V=1}A.position.y=-Math.sin(y.phase+.4)*.05*P,A.rotation.z=Math.sin(y.phase+.9)*.022*P+k*.4,Bn.set(0,U*.22,k*.6-Math.sin(y.phase)*.018*P,"XYZ"),a.quaternion.setFromEuler(Bn),Bn.set(0,U*.28,k*.5+Math.sin(y.phase-.5)*.02*P,"XYZ"),o.quaternion.setFromEuler(Bn),l.forEach((ie,ue)=>{const ve=Math.sin(y.phase-ue*Pu)*CM[ue]*P*(1-V*.85),xe=ue===l.length-1?Math.sin(y.phase-ue*Pu+Math.PI*.5)*.16*P*(1-V):0,J=$*(.12+ue*.07),G=-U*PM[ue];Bn.set(0,G,ve+xe+J-k*(ue/l.length)*.7,"XYZ"),ie.quaternion.setFromEuler(Bn)}),c.rotation.z=-Ne.clamp(y.jaw,0,.55);const H=Ne.clamp(y.speed/14,0,1),Z=Math.max(y.flare,1-H)*.45,W=Ne.clamp(-y.yawRate*.3,-.45,.45),he=Math.sin(y.phase+1.2)*.05*P;Bn.set(-Z*.6-.12+he,0,-.1+k*1.5+W,"XYZ"),d.quaternion.copy(D).multiply(new Fn().setFromEuler(Bn)),Bn.set(Z*.6+.12-he,0,-.1+k*1.5-W,"XYZ"),f.quaternion.copy(S).multiply(new Fn().setFromEuler(Bn))}}}const yn=new C,LM=new C;class IM{constructor(e){Y(this,"members",[]);Y(this,"group",new wt);[["Matriarch","matriarch",1.06,new C(16,-1,-6)],["Calf","calf",.56,new C(15,-.5,-3.5)],["Sister","sibling",.92,new C(-4,-1.5,9)],["Brother","brother",1.18,new C(-8,-3,-10)]].forEach(([n,i,r,a],o)=>{const c=new Rd(e.x+a.x,e.y+a.y,e.z+a.z,0);c.agility=i==="calf"?1.15:i==="brother"?.85:.95;const l=new wt;l.scale.setScalar(r),l.userData.speciesKey="orca",this.group.add(l),this.members.push({name:n,role:i,body:c,holder:l,rig:null,scale:r,mode:"escort",breathTimer:14+o*9+Math.random()*6,surfaceHold:0,blowCooldown:0,playTimer:30+o*11,slapTimer:2+o*1.3,slapT:-1,echo:0,jaw:0,input:{steerX:0,steerY:0,targetSpeed:6},huntAngle:o/4*Math.PI*2})})}install(e){for(const t of this.members)t.rig&&t.holder.remove(t.rig.root),t.rig=Fd(e),t.holder.add(t.rig.root)}get matriarch(){return this.members[0]}update(e){var l,h;const{dt:t,time:n,player:i}=e,r=i.yaw,a=LM.set(Math.cos(r),0,-Math.sin(r)),o=new C(-a.z,0,a.x),c=Math.max(3,i.speed);for(const u of this.members){const d=u.body;let f=new C,b=c;if(u.breathTimer-=t,u.blowCooldown-=t,u.mode!=="breathe"&&u.breathTimer<=0&&!e.hunt&&(u.mode="breathe"),e.hunt){u.mode="hunt";const _=1;u.huntAngle+=t*(e.hunt.tight?.55:.42)*_*(e.called?1.35:1);const m=e.hunt.radius+(u.role==="calf"?6:0),L=Math.sin(n*.8+u.huntAngle*2)*2-(u.role==="brother"?3:0);f.set(e.hunt.center.x+Math.cos(u.huntAngle)*m,e.hunt.center.y+L,e.hunt.center.z+Math.sin(u.huntAngle)*m);const T=u.huntAngle+.5;f.lerp(yn.set(e.hunt.center.x+Math.cos(T)*m,f.y,e.hunt.center.z+Math.sin(T)*m),.6),b=e.hunt.tight?8:6.5,e.hunt.slapping&&u.role!=="calf"&&(u.slapTimer-=t,u.slapTimer<=0&&d.pos.distanceTo(e.hunt.center)<m+6&&(u.slapTimer=3.5+Math.random()*3,u.slapT=0))}else if(u.mode==="breathe")f=this.escortTarget(u,e,a,o),f.y=Bt,b=Math.max(4.5,c*.9),d.surfaced&&(u.surfaceHold+=t,u.blowCooldown<=0&&(u.blowCooldown=6,e.onBlow(u,d.pos.clone().addScaledVector(d.forward,2.2*u.scale).setY(Bt+.2))),u.surfaceHold>2.4&&(u.mode="escort",u.surfaceHold=0,u.breathTimer=28+Math.random()*22));else{u.mode="escort",f=this.escortTarget(u,e,a,o);const _=f.distanceTo(d.pos);if(b=Ne.clamp(c+(_-3)*.45,2.6,14),u.role==="matriarch"&&e.leadTarget){const m=d.pos.distanceTo(i.pos);b=m>40?c+3:m>30?3:m>22?Math.max(3,c*.75):Math.max(5.2,c+.6)}if(u.playTimer-=t,u.playTimer<0&&u.playTimer>-4&&(u.role==="calf"||u.role==="sibling")){const m=n*1.6+(u.role==="calf"?0:Math.PI);f.copy(i.pos).addScaledVector(o,Math.cos(m)*7).add(yn.set(0,Math.sin(m)*3,0)).addScaledVector(a,4+Math.sin(m)*4),b=c+3.5,d.spin=u.playTimer>-2.6&&u.playTimer<-.4?Math.PI*2/1.1:0}else u.playTimer<=-4&&(u.playTimer=35+Math.random()*25),d.spin=0}const v=new C;for(const _ of this.members){if(_===u)continue;yn.copy(d.pos).sub(_.body.pos);const m=yn.length(),L=4+(u.scale+_.scale)*2.2;m<L&&m>.01&&v.addScaledVector(yn.normalize(),(L-m)*1.2)}yn.copy(d.pos).sub(i.pos);const g=yn.length();g<8&&g>.01&&v.addScaledVector(yn.normalize(),(8-g)*1.4);const p=yn.copy(i.pos).sub(e.camera),x=p.length();if(x>.1){p.divideScalar(x);const _=d.pos.clone().sub(e.camera),m=Ne.clamp(_.dot(p),0,x+3),L=e.camera.clone().addScaledVector(p,m),T=d.pos.clone().sub(L),A=T.length();A<5&&A>.01&&v.addScaledVector(T.normalize(),(5-A)*2.2)}f.add(v),by(d,f,u.input,b),u.mode==="breathe"&&(u.input.steerY=Math.max(u.input.steerY,.35)),u.slapT>=0&&(u.slapT+=t/.8,u.slapT>.45&&u.slapT-t/.8<=.45&&e.onSlap(u,d.pos.clone().addScaledVector(d.forward,-3.2*u.scale)),u.slapT>=1&&(u.slapT=-1)),d.step(t,u.input,e.env),u.holder.position.copy(d.pos),u.holder.quaternion.copy(d.quat),u.echo=Math.max(0,u.echo-t*.8),u.jaw=Math.max(0,u.jaw-t*1.5),(l=u.rig)==null||l.setPose({phase:d.strokePhase+(u.slapT>=0?u.slapT*6:0),amp:d.strokeAmp,yawRate:d.yawRate,pitchRate:d.pitchRate,speed:d.speed,jaw:u.jaw,slap:u.slapT,flare:d.surfaced?.6:0}),(h=u.rig)==null||h.setEcho(u.echo)}}escortTarget(e,t,n,i){const r=t.player.pos,a=t.time,o=t.called,c=new C;switch(e.role){case"matriarch":{if(t.leadTarget&&!o&&e.body.pos.distanceTo(r)>40)c.copy(r).addScaledVector(n,8).addScaledVector(i,-5);else if(t.leadTarget&&!o){const l=yn.copy(t.leadTarget).sub(r),h=l.length();l.normalize();const u=Math.min(18,h);c.copy(r).addScaledVector(l,u).addScaledVector(i,-5),c.y=Ne.lerp(r.y,t.leadTarget.y,.5)-1}else c.copy(r).addScaledVector(n,o?6:10).addScaledVector(i,-6),c.y=r.y-.5;break}case"calf":{const l=this.matriarch.body;c.copy(l.pos).addScaledVector(l.right,2.8).addScaledVector(l.forward,-.8).add(yn.set(0,.9,0));break}case"sibling":{c.copy(r).addScaledVector(n,o?2:3+Math.sin(a*.3)*3).addScaledVector(i,o?6:9+Math.sin(a*.21)*2),c.y=r.y-1+Math.sin(a*.4)*1.5;break}default:c.copy(r).addScaledVector(n,o?-1:-4).addScaledVector(i,o?-7:-11),c.y=r.y-3+Math.sin(a*.25)*1.5}return t.chase&&e.role!=="calf"&&e.role!=="matriarch"&&c.lerp(yn.copy(t.chase).addScaledVector(i,e.role==="sibling"?10:-10),.55),c.y=Math.min(c.y,Bt-1.2),c}}const DM=(()=>{let s=null;return()=>s??(s=SM())})(),Od={value:0};function NM(s,e){const t=new qt({color:s,roughness:.32,metalness:.35,vertexColors:!0});return t.onBeforeCompile=n=>{n.uniforms.uTime=Od,n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;
varying float vFlash;`).replace("#include <begin_vertex>",`#include <begin_vertex>
float fph = float(gl_InstanceID) * 2.17;
float tailW = 1.0 - smoothstep(-0.5, 0.15, position.x);
transformed.z += sin(uTime * 14.0 + fph + position.x * 6.0) * 0.09 * tailW;
vFlash = pow(max(0.0, sin(uTime * 1.7 + fph)), 40.0);`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
varying float vFlash;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(0.85, 0.95, 1.0) * vFlash * 0.9;`)},t.customProgramCacheKey=()=>"fish"+e,t}const Lu=new Je,Ci=new C,As=new C,zn=new C,UM=new C(0,1,0);class sc{constructor(e){Y(this,"mesh");Y(this,"count");Y(this,"center");Y(this,"home");Y(this,"spread");Y(this,"pos");Y(this,"vel");Y(this,"slot");Y(this,"alive");Y(this,"stun");Y(this,"heading",new C(1,0,0));Y(this,"compress",1);Y(this,"mill",.25);Y(this,"fear");Y(this,"maxSpeed");Y(this,"cruise");Y(this,"active",!0);Y(this,"tagged",0);Y(this,"species");Y(this,"wander");Y(this,"wanderPhase",Math.random()*10);Y(this,"size");Y(this,"floorAt");Y(this,"lift",new C);Y(this,"escapeSpeed",0);this.count=e.count,this.center=e.center.clone(),this.home=e.center.clone(),this.spread=e.spread.clone(),this.fear=e.fear,this.maxSpeed=e.maxSpeed,this.cruise=e.cruise,this.species=e.species,this.wander=e.wander??null,this.size=e.fishLength,this.floorAt=e.floorAt,this.mesh=new Cs(DM(),NM(e.tint,e.fishLength),e.count),this.mesh.frustumCulled=!1,this.mesh.userData.speciesKey=e.species??void 0,this.mesh.userData.school=this,this.pos=new Float32Array(e.count*3),this.vel=new Float32Array(e.count*3),this.slot=new Float32Array(e.count*3),this.alive=new Uint8Array(e.count).fill(1),this.stun=new Float32Array(e.count);for(let t=0;t<e.count;t+=1){let n=0,i=0,r=0;do n=Math.random()*2-1,i=Math.random()*2-1,r=Math.random()*2-1;while(n*n+i*i+r*r>1);this.slot[t*3]=n,this.slot[t*3+1]=i,this.slot[t*3+2]=r,this.pos[t*3]=this.center.x+n*this.spread.x,this.pos[t*3+1]=this.center.y+i*this.spread.y,this.pos[t*3+2]=this.center.z+r*this.spread.z,this.vel[t*3]=e.cruise}}relocate(e,t){this.home.copy(e),this.center.copy(e),this.species=t,this.mesh.userData.speciesKey=t??void 0;for(let n=0;n<this.count;n+=1)this.alive[n]=1,this.stun[n]=0,this.pos[n*3]=e.x+this.slot[n*3]*this.spread.x,this.pos[n*3+1]=e.y+this.slot[n*3+1]*this.spread.y,this.pos[n*3+2]=e.z+this.slot[n*3+2]*this.spread.z}get aliveCount(){let e=0;for(let t=0;t<this.count;t+=1)e+=this.alive[t];return e}nearest(e,t,n=!1){let i=-1,r=t*t;for(let a=0;a<this.count;a+=1){if(!this.alive[a]||n&&this.stun[a]<=0)continue;const o=this.pos[a*3]-e.x,c=this.pos[a*3+1]-e.y,l=this.pos[a*3+2]-e.z,h=o*o+c*c+l*l;h<r&&(r=h,i=a)}return i<0?null:{index:i,dist:Math.sqrt(r)}}fishPosition(e,t){return t.set(this.pos[e*3],this.pos[e*3+1],this.pos[e*3+2])}eat(e){this.alive[e]=0}stunWithin(e,t,n,i=1){let r=0;const a=t*t;for(let o=0;o<this.count;o+=1){if(!this.alive[o])continue;const c=this.pos[o*3]-e.x,l=this.pos[o*3+1]-e.y,h=this.pos[o*3+2]-e.z;c*c+l*l+h*h<a&&Math.random()<i&&(this.stun[o]<=0&&(r+=1),this.stun[o]=n*(.8+Math.random()*.4),this.vel[o*3]*=.1,this.vel[o*3+1]=.6+Math.random()*.6,this.vel[o*3+2]*=.1)}return r}update(e,t,n,i){if(!this.active){this.mesh.visible=!1;return}const a=i.distanceTo(this.center)<150+this.spread.x;if(this.mesh.visible=a,this.wander){this.wanderPhase+=e*this.wander.speed/Math.max(4,this.wander.radius);const p=this.home.x+Math.cos(this.wanderPhase)*this.wander.radius,x=this.home.z+Math.sin(this.wanderPhase*1.3)*this.wander.radius*.6,_=this.home.y+Math.sin(this.wanderPhase*.7)*2.5,m=Ne.damp(this.center.x,p,.4,e),L=Ne.damp(this.center.z,x,.4,e),T=m-this.center.x,A=L-this.center.z;T*T+A*A>1e-6&&this.heading.set(T,0,A).normalize(),this.center.set(m,Ne.damp(this.center.y,_,.4,e),L)}if(this.escapeSpeed>0){const p=new C;for(const x of n){const _=x.distanceTo(this.center);_<this.fear*2.4&&p.add(this.center.clone().sub(x).setY((this.center.y-x.y)*.3).normalize().multiplyScalar(1-_/(this.fear*2.4)))}p.lengthSq()>1e-4&&(p.normalize(),this.center.addScaledVector(p,this.escapeSpeed*e),this.heading.lerp(p,1-Math.exp(-2*e)).normalize())}this.center.add(this.lift.clone().multiplyScalar(e));const o=this.floorAt(this.center.x,this.center.z)+this.spread.y+1.5;if(this.center.y<o&&(this.center.y=o),this.center.y>-1.5-this.spread.y*.4&&(this.center.y=-1.5-this.spread.y*.4),!a)return;const c=t*this.mill,l=Math.cos(c),h=Math.sin(c),u=this.spread.x*this.compress,d=this.spread.y*this.compress,f=this.spread.z*this.compress,b=this.fear*this.fear,v=this.mesh.instanceMatrix.array,g=this.size;for(let p=0;p<this.count;p+=1){const x=p*3;if(!this.alive[p]){for(let U=0;U<16;U+=1)v[p*16+U]=0;continue}let _=this.pos[x],m=this.pos[x+1],L=this.pos[x+2],T=this.vel[x],A=this.vel[x+1],D=this.vel[x+2];const S=this.stun[p]>0;if(S)this.stun[p]-=e,T*=Math.exp(-2*e),D*=Math.exp(-2*e),A=Ne.damp(A,.15,1.5,e);else{const U=this.slot[x],k=this.slot[x+1],V=this.slot[x+2],$=this.center.x+(U*l-V*h)*u,H=this.center.y+k*d,Z=this.center.z+(U*h+V*l)*f;let W=($-_)*1.6-T*1.1+this.heading.x*this.cruise*.8,he=(H-m)*1.6-A*1.1,ie=(Z-L)*1.6-D*1.1+this.heading.z*this.cruise*.8;for(let ve=0;ve<n.length;ve+=1){const xe=n[ve],J=_-xe.x,G=m-xe.y,z=L-xe.z,re=J*J+G*G+z*z;if(re<b&&re>1e-4){const pe=Math.sqrt(re),Ie=1-pe/this.fear,Re=Ie*Ie*70/pe;W+=J*Re,he+=G*Re*.7,ie+=z*Re}}T+=W*e,A+=he*e,D+=ie*e;const ue=Math.hypot(T,A,D);if(ue>this.maxSpeed){const ve=this.maxSpeed/ue;T*=ve,A*=ve,D*=ve}}_+=T*e,m+=A*e,L+=D*e,m>-.6&&(m=-.6,A>0&&(A=0)),this.pos[x]=_,this.pos[x+1]=m,this.pos[x+2]=L,this.vel[x]=T,this.vel[x+1]=A,this.vel[x+2]=D;const y=Math.hypot(T,A,D);if(y>.05?Ci.set(T/y,A/y*.6,D/y).normalize():Ci.copy(this.heading),zn.crossVectors(Ci,UM),zn.lengthSq()<1e-6&&zn.set(0,0,1),zn.normalize(),As.crossVectors(zn,Ci),S){const U=Math.sin(t*6+p)*.3;As.multiplyScalar(-1).addScaledVector(zn,U).normalize(),zn.crossVectors(Ci,As)}const P=g*(.85+p*7919%100/100*.3);Lu.set(Ci.x*P,As.x*P,zn.x*P,_,Ci.y*P,As.y*P,zn.y*P,m,Ci.z*P,As.z*P,zn.z*P,L,0,0,0,1),Lu.toArray(v,p*16)}this.mesh.instanceMatrix.needsUpdate=!0}}class FM{constructor(e=900){Y(this,"points");Y(this,"max");Y(this,"pos");Y(this,"vel");Y(this,"life");Y(this,"maxLife");Y(this,"size");Y(this,"kind");Y(this,"sizeAttr");Y(this,"colorAttr");Y(this,"cursor",0);Y(this,"uniforms",{uPixel:{value:1}});this.max=e,this.pos=new Float32Array(e*3),this.vel=new Float32Array(e*3),this.life=new Float32Array(e),this.maxLife=new Float32Array(e).fill(1),this.size=new Float32Array(e),this.kind=new Uint8Array(e),this.sizeAttr=new Float32Array(e),this.colorAttr=new Float32Array(e*4);const t=new Lt;t.setAttribute("position",new gt(this.pos,3).setUsage(ho)),t.setAttribute("aSize",new gt(this.sizeAttr,1).setUsage(ho)),t.setAttribute("aColor",new gt(this.colorAttr,4).setUsage(ho)),this.points=new _l(t,new dn({transparent:!0,depthWrite:!1,uniforms:this.uniforms,vertexShader:"attribute float aSize; attribute vec4 aColor; uniform float uPixel; varying vec4 vC; void main(){ vC = aColor; vec4 mv = modelViewMatrix*vec4(position,1.0); float dz = max(-mv.z, 0.3); gl_PointSize = min(aSize * uPixel * 300.0 / dz, 48.0 * uPixel); vC.a *= smoothstep(0.4, 1.6, dz); gl_Position = projectionMatrix*mv; }",fragmentShader:"varying vec4 vC; void main(){ vec2 c = gl_PointCoord-0.5; float r = dot(c,c); if (r>0.25) discard; float ring = (1.0 - smoothstep(0.12,0.25,r)) * (0.55 + 0.45*smoothstep(0.05,0.2,r)); gl_FragColor = vec4(vC.rgb, vC.a*ring); }"})),this.points.frustumCulled=!1}setPixelRatio(e){this.uniforms.uPixel.value=e}emit(e,t,n,i,r){const a=this.cursor;this.cursor=(this.cursor+1)%this.max,this.pos[a*3]=t.x,this.pos[a*3+1]=t.y,this.pos[a*3+2]=t.z,this.vel[a*3]=n.x,this.vel[a*3+1]=n.y,this.vel[a*3+2]=n.z,this.life[a]=i,this.maxLife[a]=i,this.size[a]=r,this.kind[a]=e}burst(e,t,n,i,r,a,o){const c=new C;for(let l=0;l<n;l+=1)c.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(i*(.3+Math.random()*.7)),o&&c.add(o),this.emit(e,t,c,r*(.6+Math.random()*.6),a*(.5+Math.random()))}update(e){for(let n=0;n<this.max;n+=1){if(this.life[n]<=0){this.sizeAttr[n]=0;continue}this.life[n]-=e;const i=this.kind[n],r=n*3;i===0?(this.vel[r+1]=Ne.damp(this.vel[r+1],1.6+this.size[n]*6,2,e),this.vel[r]*=Math.exp(-2*e),this.vel[r+2]*=Math.exp(-2*e),this.pos[r]+=Math.sin(this.life[n]*13+n)*e*.3,this.pos[r+1]>-.1&&(this.life[n]=0)):i===1?(this.vel[r+1]-=9.8*e,this.pos[r+1]<-.2&&(this.life[n]=0)):i===2?(this.vel[r]*=Math.exp(-1.5*e),this.vel[r+1]=Ne.damp(this.vel[r+1],-.25,1,e),this.vel[r+2]*=Math.exp(-1.5*e)):(this.vel[r]*=Math.exp(-1.2*e),this.vel[r+1]=Ne.damp(this.vel[r+1],.6,1,e),this.vel[r+2]*=Math.exp(-1.2*e),this.size[n]+=e*.35),this.pos[r]+=this.vel[r]*e,this.pos[r+1]+=this.vel[r+1]*e,this.pos[r+2]+=this.vel[r+2]*e;const a=Math.max(0,this.life[n]/this.maxLife[n]);this.sizeAttr[n]=this.size[n];const o=n*4;if(i===0)this.colorAttr[o]=.85,this.colorAttr[o+1]=.97,this.colorAttr[o+2]=1,this.colorAttr[o+3]=.55*Math.min(1,a*3);else if(i===1)this.colorAttr[o]=1,this.colorAttr[o+1]=1,this.colorAttr[o+2]=1,this.colorAttr[o+3]=.9*a;else if(i===2){const c=.75+.25*Math.sin(this.life[n]*20+n);this.colorAttr[o]=c,this.colorAttr[o+1]=c,this.colorAttr[o+2]=1,this.colorAttr[o+3]=a}else this.colorAttr[o]=.95,this.colorAttr[o+1]=.98,this.colorAttr[o+2]=1,this.colorAttr[o+3]=.35*a}const t=this.points.geometry;t.attributes.position.needsUpdate=!0,t.attributes.aSize.needsUpdate=!0,t.attributes.aColor.needsUpdate=!0}}class OM{constructor(){Y(this,"group",new wt);Y(this,"pool",[]);const e=new Xa(1,40,24);for(let t=0;t<6;t+=1){const n=new dn({transparent:!0,depthWrite:!1,blending:Us,side:Zt,fog:!1,uniforms:{uA:{value:0},uColor:{value:new Le(10483455)}},vertexShader:"varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",fragmentShader:"uniform float uA; uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float rim = 1.0 - abs(dot(vN, vV)); float a = pow(rim, 3.0) * uA; gl_FragColor = vec4(uColor * a, a); }"}),i=new ut(e,n);i.visible=!1,i.frustumCulled=!1,this.group.add(i),this.pool.push({mesh:i,age:0,dur:1,from:0,to:1,strength:0,follow:null})}}spawn(e,t,n,i,r,a=10483455,o=null){const c=this.pool.find(l=>!l.mesh.visible)??this.pool[0];c.mesh.position.copy(e),c.age=0,c.dur=i,c.from=t,c.to=n,c.strength=r,c.follow=o,c.mesh.material.uniforms.uColor.value.set(a),c.mesh.visible=!0}update(e){for(const t of this.pool){if(!t.mesh.visible)continue;t.age+=e;const n=Math.min(1,t.age/t.dur),i=1-Math.pow(1-n,2);t.follow&&t.mesh.position.copy(t.follow),t.mesh.scale.setScalar(t.from+(t.to-t.from)*i),t.mesh.material.uniforms.uA.value=t.strength*(1-n)*Math.min(1,n*8),n>=1&&(t.mesh.visible=!1)}}}class kM{constructor(){Y(this,"ctx",null);Y(this,"master");Y(this,"underwater");Y(this,"ambGain");Y(this,"swimGain");Y(this,"swimFilter");Y(this,"engineGain");Y(this,"windGain");Y(this,"heartTimer",0);Y(this,"noiseBuffer",null);Y(this,"muted",!1);Y(this,"keepAlive",null)}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}try{const t=navigator;t.audioSession&&(t.audioSession.type="playback")}catch{}try{const t=new Audio(BM());t.loop=!0,t.setAttribute("playsinline",""),t.play().catch(()=>{}),this.keepAlive=t}catch{}const e=window.AudioContext||window.webkitAudioContext;if(e)try{const t=new e;this.ctx=t,this.master=t.createGain(),this.master.gain.value=this.muted?0:.9;const n=t.createDynamicsCompressor();n.threshold.value=-18,n.ratio.value=4,this.master.connect(n),n.connect(t.destination),this.underwater=t.createBiquadFilter(),this.underwater.type="lowpass",this.underwater.frequency.value=2600,this.underwater.connect(this.master);const i=t.sampleRate*3,r=t.createBuffer(1,i,t.sampleRate),a=r.getChannelData(0);let o=0;for(let g=0;g<i;g+=1){const p=Math.random()*2-1;o=(o+.02*p)/1.02,a[g]=o*3.2}this.noiseBuffer=r;const c=this.loopNoise(),l=t.createBiquadFilter();l.type="lowpass",l.frequency.value=320,this.ambGain=t.createGain(),this.ambGain.gain.value=.22,c.connect(l).connect(this.ambGain).connect(this.underwater);const h=t.createOscillator(),u=t.createGain();h.frequency.value=.07,u.gain.value=.08,h.connect(u).connect(this.ambGain.gain),h.start();const d=this.loopNoise();this.swimFilter=t.createBiquadFilter(),this.swimFilter.type="bandpass",this.swimFilter.frequency.value=400,this.swimFilter.Q.value=.8,this.swimGain=t.createGain(),this.swimGain.gain.value=0,d.connect(this.swimFilter).connect(this.swimGain).connect(this.underwater),this.engineGain=t.createGain(),this.engineGain.gain.value=0;for(const[g,p]of[[46,.5],[92,.3],[138,.18],[230,.08]]){const x=t.createOscillator();x.type="sawtooth",x.frequency.value=g;const _=t.createGain();_.gain.value=p,x.connect(_).connect(this.engineGain),x.start()}const f=t.createBiquadFilter();f.type="lowpass",f.frequency.value=420,this.engineGain.connect(f).connect(this.master);const b=this.loopNoise(),v=t.createBiquadFilter();v.type="highpass",v.frequency.value=900,this.windGain=t.createGain(),this.windGain.gain.value=0,b.connect(v).connect(this.windGain).connect(this.master)}catch{this.ctx=null}}setMuted(e){this.muted=e,this.keepAlive&&(e?this.keepAlive.pause():this.keepAlive.play().catch(()=>{})),this.ctx&&this.master.gain.setTargetAtTime(e?0:.9,this.ctx.currentTime,.05)}loopNoise(){const t=this.ctx.createBufferSource();return t.buffer=this.noiseBuffer,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*2),t}frame(e,t){const n=this.ctx;if(!n)return;const i=n.currentTime,r=Math.min(1,t.speed/15);this.swimGain.gain.setTargetAtTime(t.above?0:.03+r*.22*(.7+.3*t.stroke),i,.05),this.swimFilter.frequency.setTargetAtTime(220+r*900,i,.1),this.underwater.frequency.setTargetAtTime(t.above?18e3:2400-Math.min(1,t.depth/50)*1200,i,.08),this.ambGain.gain.setTargetAtTime(t.above?.04:.2,i,.2),this.windGain.gain.setTargetAtTime(t.above?.06:0,i,.1),this.engineGain.gain.setTargetAtTime(t.noise*.09,i,.3),t.breath<25&&!t.above&&(this.heartTimer-=e,this.heartTimer<=0&&(this.heartTimer=.9,this.thump(55,.18,.12),this.thump(50,.14,.12,.18)))}thump(e,t,n,i=0){const r=this.ctx;if(!r)return;const a=r.currentTime+i,o=r.createOscillator(),c=r.createGain();o.frequency.setValueAtTime(e*1.6,a),o.frequency.exponentialRampToValueAtTime(e,a+n),c.gain.setValueAtTime(1e-4,a),c.gain.exponentialRampToValueAtTime(t,a+.01),c.gain.exponentialRampToValueAtTime(1e-4,a+n),o.connect(c).connect(this.master),o.start(a),o.stop(a+n+.05)}panner(e){const t=this.ctx;if(typeof t.createStereoPanner=="function"){const n=t.createStereoPanner();return n.pan.value=Math.max(-1,Math.min(1,e)),n}return t.createGain()}call(e={}){const t=this.ctx;if(!t)return;const n=t.currentTime+(e.delay??0),i=e.pitch??1,r=e.volume??.14,a=.9+Math.random()*.4,o=t.createOscillator();o.type="sawtooth";const c=1100*i;o.frequency.setValueAtTime(c,n),o.frequency.linearRampToValueAtTime(c*1.9,n+a*.25),o.frequency.linearRampToValueAtTime(c*1.35,n+a*.7),o.frequency.linearRampToValueAtTime(c*1.7,n+a);const l=t.createOscillator();l.frequency.value=180+Math.random()*60;const h=t.createGain();h.gain.value=.5;const u=t.createGain();u.gain.setValueAtTime(1e-4,n),u.gain.exponentialRampToValueAtTime(r,n+.06),u.gain.setValueAtTime(r,n+a*.8),u.gain.exponentialRampToValueAtTime(1e-4,n+a);const d=t.createBiquadFilter();d.type="bandpass",d.frequency.value=2200*i,d.Q.value=1.4,l.connect(h).connect(u.gain);const f=this.panner(e.pan??0);o.connect(d).connect(u).connect(f).connect(this.underwater),o.start(n),l.start(n),o.stop(n+a+.05),l.stop(n+a+.05)}clicks(e){const t=this.ctx;if(!(!t||!this.noiseBuffer))for(let n=0;n<12;n+=1)this.click(t.currentTime+n*(.03-n*.0012),.09*(.5+e*.5),5200-(1-e)*2400,0)}echoReturn(e,t,n){const i=this.ctx;if(!i)return;const r=.07*Math.max(.15,1-t/90);for(let a=0;a<3;a+=1)this.click(i.currentTime+e+a*.025,r,3600,n)}click(e,t,n,i){const r=this.ctx,a=r.createBufferSource();a.buffer=this.noiseBuffer;const o=r.createBiquadFilter();o.type="bandpass",o.frequency.value=n,o.Q.value=3;const c=r.createGain();c.gain.setValueAtTime(t,e),c.gain.exponentialRampToValueAtTime(1e-4,e+.012);const l=this.panner(i);a.connect(o).connect(c).connect(l).connect(this.master),a.start(e,Math.random()*2,.02)}burst(e){const t=this.ctx;if(!t||!this.noiseBuffer)return;const n=t.currentTime+(e.delay??0),i=t.createBufferSource();i.buffer=this.noiseBuffer;const r=t.createBiquadFilter();r.type=e.type,r.frequency.setValueAtTime(e.freq,n),e.sweepTo&&r.frequency.exponentialRampToValueAtTime(e.sweepTo,n+e.dur),r.Q.value=e.q??.7;const a=t.createGain();a.gain.setValueAtTime(1e-4,n),a.gain.exponentialRampToValueAtTime(e.gain,n+.015),a.gain.exponentialRampToValueAtTime(1e-4,n+e.dur),i.connect(r).connect(a).connect(e.dest??this.master),i.start(n,Math.random()*2,e.dur+.05)}bite(e){this.burst({gain:.35,dur:.12,freq:900,type:"bandpass",q:1.5,sweepTo:300}),e&&(this.thump(90,.35,.14),this.burst({gain:.25,dur:.08,freq:2400,type:"highpass",delay:.03}))}lunge(){this.burst({gain:.25,dur:.45,freq:300,type:"bandpass",q:.6,sweepTo:1400,dest:this.underwater})}slap(){this.thump(70,.6,.25),this.burst({gain:.5,dur:.18,freq:1600,type:"bandpass",q:.9,sweepTo:400})}blow(e=.3){this.burst({gain:e,dur:.7,freq:1800,type:"bandpass",q:.5,sweepTo:700}),this.burst({gain:e*.5,dur:.9,freq:400,type:"lowpass",delay:.5})}splash(e){this.burst({gain:e?.7:.3,dur:e?1.4:.5,freq:e?500:1200,type:"lowpass",sweepTo:150}),this.burst({gain:e?.35:.15,dur:e?.9:.4,freq:3e3,type:"highpass",delay:.05}),e&&this.thump(48,.5,.5)}gulp(){this.thump(140,.25,.1)}sting(e){const t=this.ctx;if(!t)return;(e==="discover"?[523,784]:e==="success"?[392,523,659]:[392,523,659,784,1046]).forEach((i,r)=>{const a=t.currentTime+r*.11,o=t.createOscillator();o.type="sine",o.frequency.value=i;const c=t.createGain();c.gain.setValueAtTime(1e-4,a),c.gain.exponentialRampToValueAtTime(.06,a+.02),c.gain.exponentialRampToValueAtTime(1e-4,a+.9),o.connect(c).connect(this.master),o.start(a),o.stop(a+1)})}}function BM(){const t=new Uint8Array(2044),n=new DataView(t.buffer),i=(a,o)=>{for(let c=0;c<o.length;c+=1)t[a+c]=o.charCodeAt(c)};i(0,"RIFF"),n.setUint32(4,2036,!0),i(8,"WAVE"),i(12,"fmt "),n.setUint32(16,16,!0),n.setUint16(20,1,!0),n.setUint16(22,1,!0),n.setUint32(24,8e3,!0),n.setUint32(28,8e3,!0),n.setUint16(32,1,!0),n.setUint16(34,8,!0),i(36,"data"),n.setUint32(40,2e3,!0),t.fill(128,44);let r="";for(let a=0;a<t.length;a+=1)r+=String.fromCharCode(t[a]);return"data:audio/wav;base64,"+btoa(r)}class zM{constructor(e,t,n){Y(this,"steerX",0);Y(this,"steerYRaw",0);Y(this,"stickPointer",-1);Y(this,"ox",0);Y(this,"oy",0);Y(this,"downAt",0);Y(this,"travel",0);Y(this,"keys",new Set);Y(this,"maxRadius",56);Y(this,"onTap",()=>{});Y(this,"onKey",()=>{});Y(this,"onStickStart",()=>{});Y(this,"onSecondTap",()=>{});Y(this,"override",null);Y(this,"disposers",[]);this.canvas=e,this.stickEl=t,this.knobEl=n;const i=(r,a,o,c)=>{r.addEventListener(a,o,c),this.disposers.push(()=>r.removeEventListener(a,o,c))};i(e,"pointerdown",r=>this.down(r)),i(window,"pointermove",r=>this.move(r)),i(window,"pointerup",r=>this.up(r)),i(window,"pointercancel",r=>this.up(r,!0)),i(window,"keydown",r=>{const a=r.key.toLowerCase();(a===" "||a.startsWith("arrow"))&&r.preventDefault(),this.keys.has(a)||this.onKey(a,!0),this.keys.add(a)}),i(window,"keyup",r=>{const a=r.key.toLowerCase();this.keys.delete(a),this.onKey(a,!1)}),i(window,"blur",()=>{this.keys.clear(),this.release()}),e.addEventListener("contextmenu",r=>r.preventDefault())}dispose(){this.disposers.forEach(e=>e())}down(e){if(this.stickPointer!==-1){e.pointerType==="touch"&&this.onSecondTap();return}if(!(e.pointerType==="mouse"&&e.button!==0)){this.stickPointer=e.pointerId,this.ox=e.clientX,this.oy=e.clientY,this.downAt=performance.now(),this.travel=0,this.stickEl.style.left=e.clientX+"px",this.stickEl.style.top=e.clientY+"px",this.stickEl.classList.add("on"),this.knobEl.style.transform="translate(0px, 0px)",this.onStickStart();try{this.canvas.setPointerCapture(e.pointerId)}catch{}}}move(e){if(e.pointerId!==this.stickPointer)return;const t=e.clientX-this.ox,n=e.clientY-this.oy,i=Math.hypot(t,n);this.travel=Math.max(this.travel,i);const r=i>this.maxRadius?this.maxRadius/i:1,a=t*r,o=n*r;this.knobEl.style.transform=`translate(${a}px, ${o}px)`,this.steerX=a/this.maxRadius,this.steerYRaw=-o/this.maxRadius}up(e,t=!1){if(e.pointerId!==this.stickPointer)return;const n=performance.now()-this.downAt<280&&this.travel<12;this.release(),n&&!t&&this.onTap(e.clientX,e.clientY)}release(){this.stickPointer=-1,this.steerX=0,this.steerYRaw=0,this.stickEl.classList.remove("on")}has(e){return this.keys.has(e)}get stickActive(){return this.stickPointer!==-1}intent(){if(this.override)return this.override;const e=(this.has("d")||this.has("arrowright")?1:0)-(this.has("a")||this.has("arrowleft")?1:0),t=(this.has("w")||this.has("arrowup")?1:0)-(this.has("s")||this.has("arrowdown")?1:0);let n=this.steerX,i=this.steerYRaw;const r=Math.abs(n);n=r<.08?0:Math.sign(n)*Math.pow((r-.08)/.92,1.35);const a=Math.abs(i);return i=a>.3&&a>Math.abs(this.steerX)*.8?Math.sign(i)*Math.min(1,Math.pow((a-.3)/.6,1.15)):0,n=Math.max(-1,Math.min(1,n+e)),i=Math.max(-1,Math.min(1,i+t)),{steerX:n,steerY:i,active:this.stickActive||e!==0||t!==0}}}const La="./assets/",GM="https://raw.githubusercontent.com/dgreenheck/tidewater/4811ba48d795197de5621985f404e765c0b7c0ef/public/models/whale/",HM="https://cdn.3dassets.dev/assets/5859/v1/model.glb";async function Iu(s,e,t){var v;let n,i;const r=s===La?el(t):null,a=s===La?el(e):null;if(r&&a)n=JSON.parse(new TextDecoder().decode(a)),i=r;else{const[g,p]=await Promise.all([fetch(s+e),fetch(s+t)]);if(!g.ok||!p.ok)throw new Error("humpback unavailable");n=await g.json(),i=await p.arrayBuffer()}const o=window.innerWidth<760?"lod2":"lod1",c=n.levels.find(g=>g.name===o)??n.levels[n.levels.length-1],l=new Lt;l.setAttribute("position",new gt(new Float32Array(i,c.position,c.vertices*3),3)),l.setAttribute("normal",new gt(new Int16Array(i,c.normal,c.vertices*3),3,!0)),l.setAttribute("uv",new gt(new Float32Array(i,c.uv,c.vertices*2),2)),l.setIndex(new gt(new Uint32Array(i,c.index,c.indices),1)),l.computeBoundingSphere();let h=null;if((v=n.textures)!=null&&v.albedo)try{h=await new wd().loadAsync((s===La?EM(n.textures.albedo,"image/jpeg"):null)??s+n.textures.albedo),h.colorSpace=zt,h.wrapS=ts}catch{h=null}const u=new qt({color:h?16777215:2767423,map:h,roughness:.6}),d={time:{value:0},amp:{value:.18},turn:{value:0}};u.onBeforeCompile=g=>{g.uniforms.uWT=d.time,g.uniforms.uWA=d.amp,g.uniforms.uWTurn=d.turn,g.vertexShader=g.vertexShader.replace("#include <common>",`#include <common>
uniform float uWT; uniform float uWA; uniform float uWTurn;`).replace("#include <begin_vertex>",`#include <begin_vertex>
float tm = smoothstep(-1.0, 8.2, -position.z);
float wv = sin(uWT * 2.3 - position.z * 0.55) + 0.22 * sin(uWT * 4.6 - position.z * 1.1);
transformed.y += wv * uWA * pow(tm, 1.6);
transformed.y -= sin(uWT * 2.3 + 1.2) * uWA * 0.12 * (1.0 - tm);
transformed.x += uWTurn * 0.2 * pow(tm, 1.8);
// slow pectoral sculling
float pec = smoothstep(0.9, 3.5, abs(position.x)) * smoothstep(-1.0, 3.0, position.z);
transformed.y += sin(uWT * 0.9) * 0.35 * pec;`)};const f=new ut(l,u),b=new wt;return f.rotation.y=Math.PI/2,b.add(f),b.swim=d,b}async function VM(s){const e=(n,i)=>({root:n,kind:i,setMotion(r,a,o){n.swim&&(n.swim.time.value=r,n.swim.amp.value=Ne.lerp(.14,.32,Ne.clamp(a/4,0,1)),n.swim.turn.value=o)}});try{return e(await Iu(La,"humpback_lite.json","humpback_lite.bin"),"tidewater-local")}catch{s("humpback_local_failed")}try{return e(await Iu(GM,"humpback.json","humpback.bin"),"tidewater-remote")}catch{s("humpback_remote_failed")}try{const n=await new Pd().loadAsync(HM),i=new wt,r=n.scene,a=new Hn().setFromObject(r),o=a.getSize(new C);r.position.sub(a.getCenter(new C));const c=new wt;return c.add(r),c.rotation.y=Math.PI/2,c.scale.setScalar(14.5/Math.max(o.x,o.y,o.z,.001)),i.add(c),e(i,"cc0")}catch{s("humpback_cc0_failed")}const t=MM();return e(t.root,"procedural")}const WM="https://overlord.pgc.umn.edu/arcgis/rest/services/elevation/pgc_arcticdem_mosaics_latest/ImageServer/getSamples",Ni={xmin:971426,ymin:-692406,xmax:1042314,ymax:-615887};function XM(s){var n;const e=s.value??((n=s.values)==null?void 0:n[0]),t=typeof e=="number"?e:Number.parseFloat(String(e??""));return!Number.isFinite(t)||t<-250||t>5e3?null:t}async function jM(s,e){var a,o;const t=[];for(let c=0;c<e;c+=1){const l=c/(e-1),h=Ne.lerp(Ni.ymin,Ni.ymax,l);for(let u=0;u<s;u+=1){const d=u/(s-1),f=Ne.lerp(Ni.xmin,Ni.xmax,d);t.push([f,h])}}const n=new AbortController,i=window.setTimeout(()=>n.abort(),6500),r=new URLSearchParams({geometryType:"esriGeometryMultipoint",geometry:JSON.stringify({points:t,spatialReference:{wkid:3413}}),renderingRule:JSON.stringify({rasterFunction:"Height Orthometric"}),interpolation:"RSP_BilinearInterpolation",returnFirstValueOnly:"true",f:"json"});try{const c=await fetch(WM,{method:"POST",mode:"cors",cache:"force-cache",body:r,signal:n.signal});if(!c.ok)throw new Error("ArcticDEM service unavailable");const l=await c.json(),h=[];for(const u of l.samples??[]){const d=(a=u.location)==null?void 0:a.x,f=(o=u.location)==null?void 0:o.y,b=XM(u);typeof d=="number"&&typeof f=="number"&&b!==null&&h.push({x:d,y:f,value:b})}return h}finally{window.clearTimeout(i)}}function qM(s,e,t){let n=Number.POSITIVE_INFINITY,i=null;for(const r of s){const a=r.x-e,o=r.y-t,c=a*a+o*o;c<n&&(n=c,i=r.value)}return i}async function YM(){const e=window.innerWidth<760?30:38,t=window.innerWidth<760?16:22;try{const n=await jM(e,t);if(n.length<Math.max(80,e*t*.22))return null;const i=n.map(v=>v.value).sort((v,g)=>v-g),r=i[Math.max(0,Math.floor(i.length*.08))],a=[],o=[],c=[],l=new Le;for(let v=0;v<t;v+=1){const g=v/(t-1),p=Ne.lerp(Ni.ymin,Ni.ymax,g);for(let x=0;x<e;x+=1){const _=x/(e-1),m=Ne.lerp(Ni.xmin,Ni.xmax,_),L=qM(n,m,p),T=L===null?0:Math.max(0,L-r-2.5),A=T>2&&!(Math.abs((g-.5)*620)<130);c.push(A);const D=-60+_*1210,S=(g-.5)*620,y=Math.abs(S)<130,P=A?y?-2:.2+Math.pow(T,.62)*1.25:-.6;a.push(D,P,S);const U=Ne.smoothstep(T,360,760);l.setRGB(Ne.lerp(.17,.72,U),Ne.lerp(.25,.78,U),Ne.lerp(.28,.8,U)),o.push(l.r,l.g,l.b)}}const h=[];for(let v=0;v<t-1;v+=1)for(let g=0;g<e-1;g+=1){const p=v*e+g,x=p+1,_=p+e,m=_+1;Number(c[p])+Number(c[x])+Number(c[_])+Number(c[m])<2||h.push(p,_,x,x,_,m)}if(h.length<60)return null;const u=new Lt;u.setAttribute("position",new yt(a,3)),u.setAttribute("color",new yt(o,3)),u.setIndex(h),u.computeVertexNormals();const d=new qt({vertexColors:!0,roughness:.93,metalness:.01,side:Zt}),f=new ut(u,d);f.name="arcticdem_kongsfjorden_relief";const b=new wt;return b.name="arcticdem_kongsfjorden_terrain",b.add(f),{group:b,validSamples:n.length}}catch{return null}}const Du="wild-orca-claude:",ti={get(s,e){try{return localStorage.getItem(Du+s)??e}catch{return e}},set(s,e){try{localStorage.setItem(Du+s,e)}catch{}}},Kt=Ne.clamp,ur=(s,e,t,n)=>s+(e-s)*(1-Math.exp(-t*n));function kd(){const s=document.querySelector("#app");s.innerHTML=fy();const e=E=>document.getElementById(E),t=e("wCanvas"),n=window.matchMedia("(pointer: coarse)").matches||window.innerWidth<760,i=[],r=(E,q)=>{i.push({e:E,t:Math.round(performance.now()),v:q})};qo.length&&console.warn("species pack issues",qo);let a;try{a=new uv({canvas:t,antialias:!0,powerPreference:"high-performance"})}catch{return e("wLoadState").textContent="WebGL is not available on this device.",()=>{}}a.outputColorSpace=zt,a.toneMapping=Uu,a.toneMappingExposure=1.22;const o=new dv,c=new rn(60,1,.1,1100),l=new Sy(o,{mobile:n},es),h=new FM(n?700:1100),u=new OM;o.add(h.points,u.group);const d=new xy(c,Yi),f=new kM,b={floorAt:Yi,bounds:{minX:Xt.minX+10,maxX:Xt.maxX-10,maxZ:Xt.corridorZ}},v=16,g=new Map;for(const E of l.rockColliders){const q=Math.floor(E.x/v)+","+Math.floor(E.z/v);(g.get(q)??g.set(q,[]).get(q)).push(E)}const p=new C,x=(E,q)=>{const le=Math.floor(E.pos.x/v),Oe=Math.floor(E.pos.z/v);for(let We=-1;We<=1;We+=1)for(let nt=-1;nt<=1;nt+=1){const qe=g.get(le+We+","+(Oe+nt));if(qe)for(const At of qe){p.set(E.pos.x-At.x,E.pos.y-At.y,E.pos.z-At.z);const xi=p.length(),Tn=At.r+q;if(xi<Tn&&xi>.001){p.divideScalar(xi),E.pos.addScaledVector(p,Tn-xi);const Yn=E.vel.dot(p);Yn<0&&E.vel.addScaledVector(p,-Yn*1.1)}}}},_=()=>{const E=Math.floor(c.position.x/v),q=Math.floor(c.position.z/v);for(let le=-1;le<=1;le+=1)for(let Oe=-1;Oe<=1;Oe+=1){const We=g.get(E+le+","+(q+Oe));if(We)for(const nt of We){p.set(c.position.x-nt.x,c.position.y-nt.y,c.position.z-nt.z);const qe=p.length(),At=nt.r+.9;qe<At&&qe>.001&&c.position.addScaledVector(p.divideScalar(qe),At-qe)}}},m=new Rd(0,-7,0,0),L=new wt;L.userData.speciesKey="orca",o.add(L);let T=null;const A=new IM(m.pos);o.add(A.group);let D="procedural";const S=E=>{T&&L.remove(T.root),T=Fd(E),L.add(T.root),A.install(E),D=E.kind};S(RM()),AM(E=>r(E)).then(E=>{bt||(S(E),r("orca_"+E.kind),e("wLoadState").textContent=E.kind==="procedural"?"hero orca unavailable — using fallback":"ready")});const y=[],P=(E,q,le,Oe,We,nt=!0)=>{q.userData.speciesKey=E,o.add(q);const qe={key:E,root:q,path:le,t:Math.random()*10,speed:Oe,active:nt,found:!1,radius:We,prev:new C};return le(qe.t,qe.prev),q.position.copy(qe.prev),q.visible=nt,y.push(qe),qe};for(let E=0;E<3;E+=1){const q=xM();q.root.scale.setScalar(E===2?.8:1);const le=E*.55;P("beluga",q.root,(Oe,We)=>We.set(185+Math.cos(Oe*.05+le)*34,-6-Math.sin(Oe*.11+E)*3+(E===2?1.2:0),-44+Math.sin(Oe*.05+le)*13+E*3.5),1,5)}for(let E=0;E<2;E+=1){const q=_M();P("narwhal",q.root,(le,Oe)=>{const We=(le*.018+E*.12)%1;return Oe.set(560-We*160,-11-E*2.5+Math.sin(le*.2)*1.5,70-We*120+E*6)},1,6,!1)}P("ringed-seal",yM().root,(E,q)=>q.set(392+Math.cos(E*.45)*9,-2.6+Math.sin(E*.9)*1.6,36+Math.sin(E*.45)*6),1,2.4),[[458,-30,0],[432,-9,1.7],[438,-5,3.1]].forEach(([E,q,le])=>P("walrus",Ru().root,(Oe,We)=>{const nt=E+Math.cos(Oe*.04+le)*6,qe=q+Math.sin(Oe*.06+le)*5;return We.set(nt,Yi(nt,qe)+1.3,qe)},1,3.5));const k=Ru();k.root.scale.setScalar(1.1),P("walrus",k.root,(E,q)=>q.set(400+Math.sin(E*.05)*2,-.9+Math.sin(E*.7)*.12,12+Math.cos(E*.05)*2),1,3.5);const V=new wt,$=P("humpback",V,(E,q)=>q.set(700+Math.cos(E*.012)*70,-29+Math.sin(E*.03)*3,8+Math.sin(E*.012)*24),1,12);let H=null;VM(E=>r(E)).then(E=>{bt||(H=E,V.add(E.root),r("humpback_"+E.kind))});const Z=[],W=[],he=n?7:10;for(let E=0;E<he;E+=1){const q=new sc({count:n?50:80,center:new C(30+E*22,-8,(E%2?1:-1)*(14+E*3)),spread:new C(7,2.8,6),fishLength:.5,tint:16777215,species:"polar-cod",fear:7.5,maxSpeed:7,cruise:1.2,wander:{radius:12,speed:1.4},floorAt:Yi});q.mill=.18,Z.push(q),W.push(q),o.add(q.mesh)}let ie=0;const ue=()=>{const E=new C(Math.cos(m.yaw),0,-Math.sin(m.yaw));for(const q of W){if(q.center.distanceTo(m.pos)<135)continue;const le=45+Math.random()*60,Oe=(Math.random()-.5)*90,We=Kt(m.pos.x+E.x*le-E.z*Oe,Xt.minX+20,Xt.maxX-20),nt=Kt(m.pos.z+E.z*le+E.x*Oe,-Xt.corridorZ,Xt.corridorZ),qe=Yi(We,nt),At=Kt(Ne.lerp(qe+4,-3,Math.random()),qe+4,-3);q.relocate(new C(We,At,nt),We<560?"polar-cod":"herring")}},ve=new sc({count:18,center:new C(Xt.codHome.x,Xt.codHome.y,Xt.codHome.z),spread:new C(3.2,1.4,3.2),fishLength:.85,tint:14214882,species:"polar-cod",fear:6.5,maxSpeed:10.5,cruise:1.5,floorAt:Yi});ve.mill=.4,Z.push(ve),o.add(ve.mesh);const xe=new sc({count:n?380:640,center:new C(Xt.herringHome.x,Xt.herringHome.y,Xt.herringHome.z),spread:new C(10,5,10),fishLength:.6,tint:16777215,species:"herring",fear:5,maxSpeed:8,cruise:.5,floorAt:Yi});xe.mill=.32,Z.push(xe),o.add(xe.mesh);const J=new ut(new El(15,.12,6,120),new Ii({color:11072767,transparent:!0,opacity:0,depthWrite:!1,blending:Us,fog:!1}));J.rotation.x=Math.PI/2,o.add(J);const G=wM();G.position.set(988,.35,0),o.add(G),YM().then(E=>{if(bt||!E){r("arcticdem_fallback");return}l.aboveWater.add(E.group),r("arcticdem_live",E.validSamples)});let z="family",re=0,pe=0,Ie=0,Re=1,Ke=!1,Q=100,oe=100,I=0,Fe=0,ae=0,Ee=0,ge=0,De=0,Pe=0,R=null,M=0,B=!1,ee=0,se=0,te=0,Ue=0,be=-1,Ce=0,it=!1,ce=null,Me=-1,Xe=0,je=0,Te=-1,tt=85,Ze=0,ft=0,N=1,_e=0,K=0,ne=0,Se=0,ye=1,He=!1,bt=!1,Nt=-10;const at=new Set(JSON.parse(ti.get("species","[]"))),en=new Set,Ct={steered:0,geared:!1,pitched:0,echoed:!1,breathed:!1,tricked:!1};let ui=0;const On=new C(60,-6,0);let vn="POD",Oi=!0;const di=[],fi=(E,q)=>{di.push({at:pe+E,fn:q})},cs=e("wTitle"),Ur=e("wHint"),ls=e("wZone"),ki=e("wObj"),Bi=e("wToast"),Fr=e("wTip"),$a=e("wActionLabel"),Or=e("wAction"),w=e("wBurst"),F=e("wEcho"),X=e("wHunt"),j=e("wHuntRing"),O=e("wHuntValue"),de=e("wHuntLabel"),Ae=e("wNoise"),ke=e("wAirUp"),Be=e("wVignette"),Ye=e("wGoal"),Qe=e("wGoalText"),ze=e("wMarkers"),lt=e("wSpeed");e("wHowTo").innerHTML=n?py:my,e("wFound").textContent=String(Math.max(1,at.size));let vt=0;const rt=(E,q,le)=>{cs.textContent=E,Ur.textContent=q,le&&(ls.textContent=le),ki.classList.remove("compact","pulse"),ki.offsetWidth,ki.classList.add("pulse"),window.clearTimeout(vt),vt=window.setTimeout(()=>ki.classList.add("compact"),n?5e3:7e3)},pt=E=>{Bi.textContent=E,Bi.classList.remove("show"),Bi.offsetWidth,Bi.classList.add("show")};let ht="";const Ve=E=>{ui=3.5,ht="",xn(E,!0)},xn=(E,q=!1)=>{ui>0&&!q||ht!==E&&(ht=E,Fr.innerHTML=E,Fr.classList.toggle("on",!!E))},dt=()=>{const E=e("wFlash");E.classList.remove("go"),E.offsetWidth,E.classList.add("go")},Ut=E=>{var q;try{(q=navigator.vibrate)==null||q.call(navigator,E)}catch{}},cn=(E,q=!1)=>{en.add(E),at.has(E)||(at.add(E),ti.set("species",JSON.stringify([...at])),e("wFound").textContent=String(at.size),q||(pt("DISCOVERED · "+Yo(E).toUpperCase()),f.sting("discover")),r("species",at.size))};cn("orca",!0);const tn=E=>{e("wCardBody").innerHTML=hy(E),e("wCard").hidden=!1,cn(E),r("lens_"+E)},Ft=(E,q="")=>{Oi=!!E,E&&On.copy(E),vn=q,Qe.textContent=q},$e=E=>{switch(z=E,re=0,r("phase_"+E),$a.textContent=E==="slap"?"SLAP":E==="breach"?"BREACH":"BITE",X.hidden=!(E==="carousel"||E==="slap"||E==="feed"||E==="chase"),E){case"family":rt("Swim with your family","Your mother leads. Follow her toward the glacier.","ZONE 1 · GLACIER FJORD"),Ft(new C(150,-6,-30),"GLACIER");break;case"glacier":rt("Sense the glacier front","Something moves in the milky water by the ice. Use ECHO to find it.","ZONE 1 · GLACIER FJORD"),Ft(new C(185,-6,-42),"ICE FRONT");break;case"discover":rt("White whales at the ice","Swim close. Tap one to learn what it is.","ZONE 1 · GLACIER FJORD"),Ft(y[0].root.position,"LIFE");break;case"chase":rt("Hunt polar cod · catch 3","Pick CHASE or hold BURST, close in and BITE. Your bite lunges toward the nearest fish.","ZONE 2 · COAST + KELP"),Ft(ve.center,"PREY"),ve.escapeSpeed=4,de.textContent="POLAR COD",pt("THE SCHOOL BREAKS AWAY");break;case"coast":rt("Explore the kelp coast","Seals, walrus and stranger things live here. Then follow the shelf out to deep water.","ZONE 2 · COAST + KELP"),Ft(new C(560,-14,0),"SHELF"),y.filter(q=>q.key==="narwhal").forEach(q=>{q.active=!0,q.root.visible=!0});break;case"deep":rt("Dive the shelf","The light falls away. ECHO reaches where your eyes do not.","ZONE 3 · DEEP SHELF"),Ft(new C(700,-30,10),"DEEP");break;case"herring":rt("A silver mass ahead","Herring. ECHO to find the school, then circle it with your family.","ZONE 4 · HERRING GROUND"),Ft(xe.center,"SCHOOL");break;case"carousel":rt("Carousel · circle the school","Swim around the herring inside the glowing band. Each lap pushes the ball tighter and higher. CALL rallies the pod.","ZONE 4 · COOPERATIVE HUNT"),Ft(null),de.textContent="CAROUSEL",pt("YOUR FAMILY STARTS TO CIRCLE");break;case"slap":rt("Tail-slap the ball","Swim alongside the tight ball and hit SLAP. Your flukes stun the herring.","ZONE 4 · COOPERATIVE HUNT"),de.textContent="STUNNED",pt("THE BALL IS TIGHT · SLAP IT");break;case"feed":rt("Feed · one fish at a time","Bite the stunned, glittering herring. Eat 5.","ZONE 4 · COOPERATIVE HUNT"),de.textContent="FED";break;case"noise":rt("Pass the boat, then breathe","Follow your mother under the fishing boat and surface beyond it. Its engine fills the water: your echo and your family's calls get weaker here.","ZONE 5 · VESSEL LANE"),Ft(G.position,"BOAT"),B=!1;break;case"breach":rt("BREACH","Dive a little, hold BURST and pull up hard — or tap BREACH and let your body do it.","ZONE 5 · VESSEL LANE"),Ft(null);break;case"complete":Ft(null);break;case"free":rt("Free swim","The fjord is yours. Breach, hunt, explore.","WILD: ORCA"),Ft(null);break}},fn=E=>E.copy(m.pos).addScaledVector(m.forward,3.3*ye*.92),qn=()=>{const E=fn(new C);let q=null;const le=[];z==="feed"&&le.push([xe,!0]),(z==="chase"||z==="coast"||z==="free"||z==="family"||z==="glacier"||z==="discover")&&le.push([ve,!1]);const Oe=new C;for(const[We,nt]of le)for(let qe=0;qe<We.count;qe+=1){if(!We.alive[qe]||nt&&We.stun[qe]<=0)continue;We.fishPosition(qe,Oe);const At=Oe.distanceTo(E);if(At>17)continue;const Tn=Oe.sub(m.pos).normalize().dot(m.forward);if(Tn<.55)continue;const Yn=At*(1.6-Tn);(!q||Yn<q.dist)&&(q={school:We,index:qe,dist:Yn})}return q},ln=()=>{if(Ce>0||m.airborne)return;Ce=.55,be=0,it=!1;const E=qn();ce=E?{school:E.school,index:E.index}:null,m.lunge(E?5.5:4,.4),f.lunge(),d.kick(4),Ut(8),r("bite")},En=()=>{Xe>0||Me>=0||(Me=0,Xe=1.1,r("slap"))},kn=()=>{m.airborne||ne>0||(ne=m.pos.y<Bt-8?2:1,Se=0,r("breach_assist"))},pi=()=>{f.unlock(),z!=="complete"&&(z==="slap"?En():z==="breach"?kn():m.surfaced&&z!=="chase"&&z!=="feed"&&!qn()?En():ln())},Ja=()=>{f.unlock(),!(je>0)&&(je=1.3,tt=90*(1-I*.6),Te=0,u.spawn(m.pos,1,tt,tt/60,.7*(1-I*.5),10483455,m.pos),f.clicks(1-I),Ut(6),Ct.echoed=!0,to.clear(),r("echo"),z==="glacier"&&y[0].root.position.distanceTo(m.pos)<tt&&fi(.6,()=>{z==="glacier"&&(pt("ECHO RETURN · SEVERAL LARGE ANIMALS"),$e("discover"))}),z==="herring"&&xe.center.distanceTo(m.pos)<tt&&fi(.5,()=>{z==="herring"&&(pt("A SILVER SCHOOL ANSWERS"),$e("carousel"))}))},Za=()=>{f.unlock(),!(ft>0)&&(ft=2.5,Ze=pe+7,f.call({pitch:1.05,volume:.16}),A.members.forEach((E,q)=>{const le=E.body.pos.clone().project(c);f.call({pan:Kt(le.x,-1,1),pitch:E.role==="calf"?1.35:E.role==="brother"?.85:1,volume:.1*(1-I*.6),delay:.5+q*.35}),E.echo=.9,no(zd[q]),E.breathTimer=Math.max(E.breathTimer,8),E.mode==="breathe"&&(E.mode="escort")}),Ut([6,40,6]),pt(I>.4?"YOUR FAMILY ANSWERS · FAINTLY":"YOUR FAMILY ANSWERS"),r("call"),z==="family"&&$e("glacier"))},mi=new zM(t,e("wStick"),e("wKnob")),gi=e("wPace"),Bd=Array.from(gi.querySelectorAll("span")),hs=E=>{const q=Kt(E,0,2);q!==Re&&(Ut(4),r("gear",q)),Re=q,Bd.forEach(le=>le.classList.toggle("on",Number(le.dataset.gear)===Re)),gi.setAttribute("aria-valuenow",String(Re)),Ct.geared=!0},Cl=E=>{const q=gi.getBoundingClientRect(),le=(E-q.top)/q.height;return le<.36?2:le<.66?1:0};let kr=-1;gi.addEventListener("pointerdown",E=>{E.preventDefault(),f.unlock(),kr=E.pointerId;try{gi.setPointerCapture(E.pointerId)}catch{}hs(Cl(E.clientY))}),gi.addEventListener("pointermove",E=>{E.pointerId===kr&&hs(Cl(E.clientY))});const Pl=E=>{E.pointerId===kr&&(kr=-1)};gi.addEventListener("pointerup",Pl),gi.addEventListener("pointercancel",Pl);const Br=(E,q,le)=>{E.addEventListener("pointerdown",We=>{We.preventDefault(),E.classList.add("down"),q();try{E.setPointerCapture(We.pointerId)}catch{}});const Oe=()=>{E.classList.remove("down"),le==null||le()};E.addEventListener("pointerup",Oe),E.addEventListener("pointercancel",Oe),E.addEventListener("lostpointercapture",Oe)};Br(w,()=>{f.unlock(),Ke=!0,Ct.geared=!0},()=>{Ke=!1}),Br(Or,pi),Br(F,Ja),Br(e("wCall"),Za),mi.onKey=(E,q)=>{E==="shift"&&(Ke=q),q&&(f.unlock(),E==="1"&&hs(0),E==="2"&&hs(1),E==="3"&&hs(2),(E===" "||E==="b")&&pi(),E==="e"&&Ja(),E==="c"&&Za(),E==="m"&&Il(),!He&&(E===" "||E==="enter")&&eo())},mi.onStickStart=()=>f.unlock(),mi.onSecondTap=()=>{He&&pi()};const Qa=new Tx,Ll=new fe;mi.onTap=(E,q)=>{if(!He)return;if(z==="chase"||z==="slap"||z==="feed"||z==="breach"){pi();return}const le=t.getBoundingClientRect();Ll.set((E-le.left)/le.width*2-1,-((q-le.top)/le.height)*2+1),Qa.setFromCamera(Ll,c),Qa.far=140;const Oe=[L,...A.members.map(nt=>nt.holder),...y.filter(nt=>nt.active).map(nt=>nt.root)];for(const nt of Z)nt.mesh.visible&&(nt.mesh.computeBoundingSphere(),Oe.push(nt.mesh));const We=Qa.intersectObjects(Oe,!0);for(const nt of We){let qe=nt.object;for(;qe&&!qe.userData.speciesKey;)qe=qe.parent;const At=qe==null?void 0:qe.userData.speciesKey;if(At){tn(At),z==="discover"&&At==="beluga"&&fi(1.6,()=>{z==="discover"&&$e("chase")});return}}r("lens_empty")};const Il=()=>{f.setMuted(!f.muted),e("wSnd").classList.toggle("off",f.muted)};e("wSnd").addEventListener("click",()=>{f.unlock(),Il()}),e("wSrcBtn").addEventListener("click",()=>{e("wSources").hidden=!1,r("sources_open")}),e("wSourcesClose").addEventListener("click",()=>{e("wSources").hidden=!0}),e("wCardClose").addEventListener("click",()=>{e("wCard").hidden=!0}),e("wFull").addEventListener("click",()=>{var E,q,le;try{document.fullscreenElement?(le=document.exitFullscreen)==null||le.call(document).catch(()=>{}):(q=(E=document.documentElement).requestFullscreen)==null||q.call(E).catch(()=>{})}catch{}}),e("wReplay").addEventListener("click",()=>{Hl(),kd()}),e("wFree").addEventListener("click",()=>{var E;e("wEnd").hidden=!0,(E=document.querySelector(".w-game"))==null||E.classList.remove("w-overlay"),$e("free")});const eo=()=>{He||(He=!0,f.unlock(),e("wStart").classList.add("gone"),window.setTimeout(()=>{e("wStart").hidden=!0},700),$e("family"),r("start"))};e("wGo").addEventListener("click",eo);const zr=[];for(let E=0;E<14;E+=1){const q=document.createElement("div");q.className="w-mark",q.innerHTML="<i></i><span></span>",q.style.opacity="0",ze.appendChild(q),zr.push({el:q,pos:new C,life:0,follow:null})}const to=new Set,Gr=[];y.forEach(E=>Gr.push({pos:()=>E.root.position,kind:"life",active:()=>E.active,label:()=>at.has(E.key)?Yo(E.key).split(" /")[0].toUpperCase():"LIFE"})),Z.forEach(E=>Gr.push({pos:()=>E.center,kind:"prey",active:()=>E.active&&E.aliveCount>0,label:()=>E===xe?"HERRING":E===ve?"POLAR COD":"FISH"}));const zd=A.members.map(E=>({pos:()=>E.body.pos,kind:"family",active:()=>!0,label:()=>E.name.toUpperCase()})),no=(E,q)=>{const le=zr.find(Oe=>Oe.life<=0)??zr[0];le.life=q?5:3.6,le.follow=E.pos,le.el.className="w-mark "+E.kind+(q?" seen":""),le.el.querySelector("span").textContent=q??E.label()},Mt=new C,Hr=new C,Gd=[m.pos,...A.members.map(E=>E.body.pos)];let io=0;const Dl=(E,q)=>{for(let Oe=0;Oe<26;Oe+=1)h.emit(3,E,Mt.set((Math.random()-.5)*.8,4+Math.random()*3,(Math.random()-.5)*.8),1.6,.25+Math.random()*.2);const le=E.distanceTo(c.position);f.blow(q*Kt(1-le/80,.08,1))},Hd={onBlow:(E,q)=>Dl(q,.22),onSlap:(E,q)=>{u.spawn(q,.5,9,.5,.6,16777215),h.burst(0,q,30,4,1.4,.08);const le=xe.stunWithin(q,6,9,.15);q.distanceTo(c.position)<60&&f.slap(),le>0&&E.body.pos.distanceTo(m.pos)<40&&d.shake(.08)}},Nl=E=>{pe+=E;for(let me=di.length-1;me>=0;me-=1)if(di[me].at<=pe){const Ge=di[me];di.splice(me,1),Ge.fn()}He&&z!=="complete"&&z!=="free"&&(Ie+=E),re+=E,Dd.value=pe,Od.value=pe;const q=mi.intent();He&&q.active&&(Math.abs(q.steerX)>.2&&(Ct.steered+=E),Math.abs(q.steerY)>.2&&(Ct.pitched+=E));let le=He?q.steerX:0,Oe=He?q.steerY:0,nt=Ke&&Q>1?si[3]:si[Re];if(He||(nt=si[1]),be>=0&&ce&&ce.school.alive[ce.index]){ce.school.fishPosition(ce.index,Mt);const me=Cd(m.yaw,$c(Mt.x-m.pos.x,Mt.z-m.pos.z));m.yaw+=Kt(me,-1,1)*Math.min(1,E*9);const Ge=Math.hypot(Mt.x-m.pos.x,Mt.z-m.pos.z),Tt=Math.atan2(Mt.y-m.pos.y,Math.max(.5,Ge))-m.pitch;m.pitch+=Kt(Tt,-.8,.8)*Math.min(1,E*7)}ne>0&&(Se+=E,ne===1?(Oe=-1,nt=si[2],(m.pos.y<Bt-9||Se>2.6)&&(ne=2,Se=0)):(Oe=1,nt=si[3],Se>5&&(ne=0)),le*=.3,m.airborne&&(ne=0));const qe={};m.step(E,{steerX:le,steerY:Oe,targetSpeed:nt},b,qe),m.airborne||x(m,1.5*ye);const At=nt>=si[3]-.01;if(At?Q=Math.max(0,Q-E*(ne>0?3:8.5)):Q=Math.min(100,Q+E*(Re===0?4.5:2.6)),w.classList.toggle("empty",Q<3),m.surfaced||m.airborne?(Fe>4&&pe-Nt>2.5&&(Nt=pe,Dl(m.pos.clone().addScaledVector(m.forward,2.4).setY(Bt+.3),.32),Ct.breathed=!0,r("breathe")),Fe=0,oe=Math.min(100,oe+E*32)):(Fe+=E,oe=Math.max(0,oe-E*(.62+(At?.5:0)))),oe<=0&&(Q=Math.max(0,Q-E*6)),Ue=Math.max(Ue,m.depth),te=Math.max(te,m.speed),qe.leftWater){const me=m.pos.clone().setY(.2);h.burst(1,me,60,6,1.2,.2,Mt.set(m.vel.x*.3,4,m.vel.z*.3)),f.splash(!1),r("left_water")}if(qe.apex!==void 0&&qe.apex>2&&(M+=1,(z==="breach"||qe.apex>4)&&(K=.9),r("apex",Math.round(qe.apex*10)/10)),qe.enteredWater&&qe.landing){const me=qe.landing,Ge=me.height>1.5,Tt=me.entry!=="clean",Ot=m.pos.clone().setY(.3),kt=Kt(me.height/6,.25,1.4)*(Tt?1.5:1);if(h.burst(1,Ot,Math.round(40+90*kt),5+6*kt,1.2+.6*kt,.18+.12*kt,Mt.set(0,3+5*kt,0)),h.burst(0,m.pos,Math.round(40+90*kt),5,2.4,.12),f.splash(Ge||Tt),d.shake(.12+.3*kt),Ge&&(dt(),Ut([20,30,40])),Ge){const _i=[me.height.toFixed(1)+" M"];me.spins>=.5&&_i.push("SPIN "+Math.round(me.spins*360));const co=Math.abs(me.flips);co>=.5&&_i.push((co>=2?"DOUBLE ":"")+(me.flips>0?"BACKFLIP":"FRONTFLIP")),_i.push(me.entry==="clean"?"CLEAN ENTRY":me.entry==="side"?"SIDE SPLASH":me.entry==="back"?"BACK SLAM":"BELLY FLOP");const er=Math.round(me.height*40+me.spins*120+co*160+(me.entry==="clean"?80:50));se=Math.max(se,er),er>Number(ti.get("bestBreach","0"))&&(ti.set("bestBreach",String(er)),M>1&&_i.push("NEW BEST")),pt("BREACH · "+_i.join(" · ")+" · "+er),r("landing",er)}else ee+=1;z==="breach"&&m.apexY>2&&Vd()}if(qe.leftWater&&!Ct.tricked&&(Ct.tricked=!0,fi(.25,()=>{m.airborne&&Ve(n?"In the air: drag <b>sideways to spin</b>, <b>up / down to flip</b>":"In the air: <b>A / D spin</b> · <b>W / S flip</b>")})),be>=0){if(be+=E,!it&&be>.08&&be<.5){const me=fn(Hr),Ge=z==="feed"?[[xe,!0]]:[[ve,!1]];for(const[Tt,Ot]of Ge){const kt=Tt.nearest(me,z==="feed"?4.2:3.8,Ot);if(kt){it=!0,Tt.fishPosition(kt.index,Mt),Tt.eat(kt.index),h.burst(2,Mt,26,3,1.4,.07),h.burst(0,Mt,14,2,1,.06),f.bite(!0),_e=.075,d.shake(.12),Ut(18),Q=Math.min(100,Q+9),ye=Math.min(1.08,ye+.006),Tt===ve?(ae+=1,cn("polar-cod"),r("cod",ae),z==="chase"&&(pt(ae>=3?"THREE COD · WELL HUNTED":"+1 POLAR COD"),ae>=3&&(f.sting("success"),$e("coast"),ve.escapeSpeed=2))):(Ee+=1,r("herring_eaten",Ee),pt(Ee>=5?"FED · THE POD FEEDS TOO":"+1 HERRING"),z==="feed"&&Ee>=5&&(f.sting("success"),Q=100,$e("noise")));break}}}be>.55&&(!it&&(z==="chase"||z==="feed")&&f.bite(!1),be=-1,ce=null)}if(Ce=Math.max(0,Ce-E),Me>=0){const me=Me;if(Me+=E/.75,me<.5&&Me>=.5){const Ge=m.pos.clone().addScaledVector(m.forward,-3.3*ye);u.spawn(Ge,.5,10,.5,.9,16777215),h.burst(0,Ge,50,5,1.6,.1),f.slap(),d.shake(.25),Ut([10,20,30]),m.pos.y>Bt-2.2&&(h.burst(1,Ge.clone().setY(.3),90,7,1.4,.24,Mt.set(0,5,0)),f.splash(!0),r("lobtail"));const Tt=Math.min(Ge.distanceTo(xe.center),m.pos.distanceTo(xe.center)),Ot=Tt<14?xe.stunWithin(Tt<9?xe.center:Ge,7,14,.15):0;ge+=Ot,r("slap_stun",Ot),Ot>=4?(pt(Ot+" HERRING STUNNED"),_e=.1,z==="slap"&&ge>=10&&fi(.9,()=>{z==="slap"&&$e("feed")})):z==="slap"&&pt(Tt<22?"CLOSER · RIGHT ALONGSIDE THE BALL":"SWIM TO THE BALL FIRST")}Me>=1&&(Me=-1)}if(Xe=Math.max(0,Xe-E),je=Math.max(0,je-E),ft=Math.max(0,ft-E),Te>=0){const me=Te;Te+=E*60;for(const Ge of Gr){if(!Ge.active()||to.has(Ge))continue;const Tt=Ge.pos().distanceTo(m.pos);if(Tt>6&&Tt>=me&&Tt<Te&&(to.add(Ge),no(Ge),Mt.copy(Ge.pos()).project(c),f.echoReturn(Tt/70,Tt,Kt(Mt.x,-1,1)),Ge.kind==="life"||Ge.kind==="prey")){const Ot=y.find(kt=>kt.root.position===Ge.pos());Ot&&Ot.active&&cn(Ot.key)}}Te>tt&&(Te=-1)}const Tn=z==="carousel"||z==="slap"||z==="feed";A.update({dt:E,time:pe,player:m,camera:c.position,leadTarget:Oi&&!Tn?On:null,called:pe<Ze,hunt:Tn?{center:xe.center,radius:Ne.lerp(17,10,De/100),tight:De>60,slapping:z==="slap"||z==="feed"}:null,chase:z==="chase"?ve.center:null,env:b,...Hd});for(const me of A.members)x(me.body,1.3*me.scale),me.holder.position.copy(me.body.pos);ie-=E,ie<=0&&(ie=1,ue());for(const me of Z)me.update(E,pe,Gd,c.position);if(z==="chase"){const me=ve.center.distanceTo(m.pos);ve.escapeSpeed=me<14?Math.max(2.5,8.5-re*.05):2.5,ve.center.x=Kt(ve.center.x,285,430),ve.center.z=Kt(ve.center.z,-60,60),ve.center.y=Kt(ve.center.y,-13,-3),On.copy(ve.center)}else ve.escapeSpeed=0,ve.center.lerp(ve.home,1-Math.exp(-.05*E));if(z==="carousel"){const me=m.pos.x-xe.center.x,Ge=m.pos.z-xe.center.z,Tt=Math.hypot(me,Ge),Ot=Tt>5&&Tt<27&&Math.abs(m.pos.y-xe.center.y)<12,kt=Math.atan2(Ge,me);if(Ot){if(R!==null){const _i=Math.atan2(Math.sin(kt-R),Math.cos(kt-R));Pe+=Math.abs(_i),De+=Math.abs(_i)/(Math.PI*2)*34}R=kt}else R=null,De-=E*(Tt>40?1.5:.3);De+=E*(pe<Ze?1.6:.7),De=Kt(De,0,100),De>=100&&(f.sting("success"),$e("slap"))}if(Tn){const me=De/100;xe.compress=Ne.lerp(1,.42,me),xe.mill=Ne.lerp(.32,.9,me);const Ge=Ne.lerp(Xt.herringHome.y,-7.5,me);xe.center.y=ur(xe.center.y,Ge,.6,E),xe.center.x=ur(xe.center.x,Xt.herringHome.x,.3,E),xe.center.z=ur(xe.center.z,Xt.herringHome.z,.3,E)}if(J.position.copy(xe.center),J.material.opacity=ur(J.material.opacity,z==="carousel"?.22:0,2,E),J.scale.setScalar(Ne.lerp(1,.75,De/100)),z==="feed"){if(Math.random()<E*.6){const Ge=xe.nearest(A.members[Math.floor(Math.random()*3)].body.pos,9,!0);Ge&&xe.eat(Ge.index)}let me=0;for(let Ge=0;Ge<xe.count;Ge+=1)xe.alive[Ge]&&xe.stun[Ge]>0&&(me+=1);me<6&&xe.stunWithin(xe.center,6,10,.1)}G.position.z=Math.sin(pe*.045)*55,G.position.x=988+Math.sin(pe*.02)*10,G.rotation.y=Math.cos(pe*.045)>0?-Math.PI/2:Math.PI/2,G.userData.prop.rotation.x+=E*20;const Yn=G.position.distanceTo(m.pos);I=Kt(1-(Yn-12)/75,0,1),I>.05&&Math.random()<E*30&&(G.userData.prop.getWorldPosition(Mt),Mt.x+=(Math.random()-.5)*2,Mt.z+=(Math.random()-.5)*2,h.emit(0,Mt,Hr.set(Math.random()-.5,.4,Math.random()-.5),1.5,.08+Math.random()*.08));for(const me of y){if(!me.active)continue;me.t+=E*me.speed,me.path(me.t,Mt);const Ge=Hr.copy(Mt).sub(me.prev);if(me.root.position.copy(Mt),Ge.lengthSq()>1e-8){const Tt=$c(Ge.x,Ge.z),Ot=Math.atan2(Ge.y,Math.hypot(Ge.x,Ge.z));me.root.rotation.set(0,Tt,me.key==="walrus"?-.35:Kt(Ot,-.5,.5),"YZX")}if(me.prev.copy(Mt),me===$&&H&&H.setMotion(pe,Ge.length()/E,0),!me.found&&He&&me.root.position.distanceTo(m.pos)<22+me.radius&&(Mt.copy(me.root.position).project(c),Mt.z<1&&Math.abs(Mt.x)<1&&Math.abs(Mt.y)<1)){me.found=!0,cn(me.key);const Ot=Gr.find(kt=>kt.pos()===me.root.position);Ot&&no(Ot,Yo(me.key).split(" /")[0].toUpperCase()),r("seen_"+me.key)}}const Pt=m.pos.x;if(He&&(z==="family"&&(Pt>70||re>40)&&$e("glacier"),z==="glacier"&&y.filter(Ge=>Ge.key==="beluga").some(Ge=>Ge.root.position.distanceTo(m.pos)<30)&&(pt("WHITE WHALES"),$e("discover")),z==="discover"&&(On.copy(y[0].root.position),(y.filter(Ge=>Ge.key==="beluga").some(Ge=>Ge.root.position.distanceTo(m.pos)<17)&&re>3||re>30)&&(cn("beluga"),$e("chase"))),z==="coast"&&Pt>545&&$e("deep"),z==="deep"&&(Pt>760||Pt>640&&m.pos.y<-22)&&$e("herring"),z==="herring"&&xe.center.distanceTo(m.pos)<32&&(pt("HERRING"),$e("carousel")),z==="noise")){const me=G.position.distanceTo(m.pos);!B&&me<30&&(B=!0,pt("THE ENGINE DROWNS YOUR ECHO"),r("boat_met")),vn==="BOAT"&&On.copy(G.position).setY(-2.5);const Ge=Pt>G.position.x+12;Ge&&vn==="BOAT"&&Ft(new C(G.position.x+40,-1,m.pos.z),"AIR"),Ge&&m.surfaced&&(pt(B?"AIR · PAST THE BOAT":"AIR"),$e("breach"))}(z==="carousel"||z==="herring"||z==="slap"||z==="feed")&&cn("herring",!0),L.position.copy(m.pos),L.quaternion.copy(m.quat),L.scale.setScalar(.92*ye);const Vl=be>=0?Math.sin(Kt(be/.45,0,1)*Math.PI)*.55:0;if(T==null||T.setPose({phase:m.strokePhase+(Me>=0?Me*5:0),amp:m.strokeAmp*(Me>=0?.3:1),yawRate:m.yawRate,pitchRate:m.pitchRate,speed:m.speed,jaw:Vl,slap:Me,flare:m.surfaced?.6:Re===0&&!Ke?.35:0}),T==null||T.setEcho(Te>=0?.6*(1-Te/tt):0),!m.airborne&&m.pos.y<-1&&(m.speed>9||be>=0)&&Math.random()<E*(m.speed*1.4)){const me=Mt.copy(m.pos).addScaledVector(m.forward,-3.4).addScaledVector(m.up,(Math.random()-.5)*.8);h.emit(0,me,Hr.set((Math.random()-.5)*.6,.3,(Math.random()-.5)*.6),2.2,.05+Math.random()*.06)}if(h.update(E),u.update(E),io-=E,ui=Math.max(0,ui-E),He&&io<=0&&ui<=0){io=.4;let me="";Ct.steered<1.2?me=n?"<b>DRAG</b> anywhere to swim":"<b>A / D</b> or drag the mouse to turn":!Ct.geared&&Ie>6?me=n?"Tap <b>CHASE</b> or hold <b>BURST</b> to speed up":"<b>1 · 2 · 3</b> change pace · hold <b>SHIFT</b> to burst":Ct.pitched<.6&&Ie>14?me=n?"Drag clearly <b>UP / DOWN</b> to rise or dive":"<b>W / S</b> to rise or dive":oe<40?me="Low air · <b>rise to the bright surface</b> to breathe":!Ct.echoed&&z==="glacier"?me="Tap <b>ECHO</b> to sense what you cannot see":z==="carousel"&&De<15&&re>6&&(me="Swim <b>around</b> the school inside the glowing band"),xn(me)}},Vd=()=>{if(z==="complete")return;$e("complete"),f.sting("complete");const E=Number(ti.get("best","0")),q=E===0||Ie<E;q&&ti.set("best",String(Math.round(Ie)));const le=Number(ti.get("runs","0"))+1;ti.set("runs",String(le));const Oe=We=>Math.floor(We/60)+":"+String(Math.floor(We%60)).padStart(2,"0");e("wStats").innerHTML=`<div class="${q?"best":""}"><b>${Oe(Ie)}</b><span>${q?"NEW BEST":"BEST "+Oe(E)}</span></div><div><b>${ae}</b><span>POLAR COD</span></div><div><b>${Ee}</b><span>HERRING</span></div><div><b>${en.size}/8</b><span>SPECIES MET</span></div><div><b>${M}</b><span>BREACHES</span></div><div class="${se>0&&se>=Number(ti.get("bestBreach","0"))?"best":""}"><b>${se}</b><span>BEST BREACH</span></div><div><b>${Math.round(Ue)} m</b><span>DEEPEST</span></div><div><b>${Math.round(te*3.6)}</b><span>TOP KM/H</span></div><div><b>${ee}</b><span>LEAPS</span></div>`,window.setTimeout(()=>{var We;bt||(e("wEnd").hidden=!1,(We=document.querySelector(".w-game"))==null||We.classList.add("w-overlay"))},1600),r("complete",Math.round(Ie))};let hn=Math.min(window.devicePixelRatio||1,n?1.35:1.6);const Ul=hn,Zs=()=>{a.setPixelRatio(hn),a.setSize(window.innerWidth,window.innerHeight,!1),c.aspect=window.innerWidth/window.innerHeight,c.updateProjectionMatrix(),h.setPixelRatio(hn)};window.addEventListener("resize",Zs),Zs();let Vr=[],so=0,ro=60,ao=0,Fl=performance.now(),Wr=0;const bi=1/60;let oo=0,Ol=!1,Xr=0;const vi=new C,kl=()=>{e("wAir").style.width=oe.toFixed(0)+"%",e("wEnergy").style.width=Q.toFixed(0)+"%",e("wAir").parentElement.parentElement.classList.toggle("low",oe<30),e("wDepth").textContent=Math.round(m.depth)+" M";const E=Ke&&Q>1?gu[3]:gu[Re];lt.textContent=E+" · "+m.speed.toFixed(1)+" M/S",ke.classList.toggle("on",oe<30&&!m.surfaced),Be.classList.toggle("low-air",oe<18&&!m.surfaced),Ae.classList.toggle("on",I>.05),e("wNoiseBar").style.width=Math.round(I*100)+"%",F.querySelector(".cd").style.setProperty("--p",Math.round(je/1.3*100)+"%");let q=0,le="";z==="chase"?(q=ae/3,le=ae+"/3"):z==="carousel"?(q=De/100,le=Math.round(De)+"%"):z==="slap"?(q=Math.min(1,ge/10),le=String(ge)):z==="feed"&&(q=Ee/5,le=Ee+"/5"),j.style.strokeDashoffset=String(163.4*(1-q));const Oe=z==="chase"||z==="feed"||z==="free"||z==="coast"?qn():null,We=z==="slap"&&m.pos.distanceTo(xe.center)<16;Or.classList.toggle("hot",!!(Oe&&Oe.dist<12)||We||z==="breach"&&!m.airborne),O.textContent=le},Bl=E=>{const q=window.innerWidth,le=window.innerHeight;for(const Pt of zr){if(Pt.life<=0){Pt.el.style.opacity="0";continue}if(Pt.life-=E,Pt.follow&&Pt.pos.copy(Pt.follow()),vi.copy(Pt.pos).project(c),vi.z>1){Pt.el.style.opacity="0";continue}const me=(vi.x*.5+.5)*q,Ge=(-vi.y*.5+.5)*le;Pt.el.style.opacity=String(Math.min(1,Pt.life/.8)*(Pt.life>3.3?(3.6-Pt.life)/.3:1)),Pt.el.style.transform=`translate(${me.toFixed(1)}px, ${Ge.toFixed(1)}px) translate(-50%, -50%)`}if(!Oi||!He||z==="complete"){Ye.style.opacity="0";return}vi.copy(On).project(c);let Oe=vi.x,We=vi.y;const nt=vi.z>1;nt&&(Oe=-Oe,We=-We);const qe=!nt&&Math.abs(Oe)<.9&&Math.abs(We)<.85,At=On.distanceTo(m.pos);if(!qe){const Pt=Math.max(Math.abs(Oe)/.88,Math.abs(We)/.8,1e-4);Oe/=Pt,We/=Pt}Ye.classList.toggle("edge",!qe);const xi=(Oe*.5+.5)*q,Tn=(-We*.5+.5)*le,Yn=Math.atan2(-We,Oe)*180/Math.PI+90;Ye.querySelector("i").style.transform=qe?"":`rotate(${Yn}deg)`,Qe.textContent=vn+(At>25?" · "+Math.round(At)+" M":""),Ye.style.opacity=At<12?"0.25":"0.9",Ye.style.transform=`translate(${xi.toFixed(1)}px, ${Tn.toFixed(1)}px) translate(-50%, -50%)`},zl=E=>{d.update(E*(K>0?.4:1),m,pe,{aspect:c.aspect,burst:Ke&&Q>1,cinematic:He?0:1}),_(),l.update(pe,c,m.pos.x,hn,I),a.render(o,c)},Gl=E=>{if(bt)return;oo=requestAnimationFrame(Gl);const q=Math.min(.1,(E-Fl)/1e3);if(Fl=E,Ol)return;_e>0?(_e-=q,N=.04):K>0?(K-=q,N=.35):N=ur(N,1,10,q),Wr+=q*N;let le=0;const Oe=performance.now();for(;Wr>=bi&&le<5;)Nl(bi),Wr-=bi,le+=1;if(le&&(Xr=Xr*.95+(performance.now()-Oe)/le*.05),le===5&&(Wr=0),f.frame(q,{speed:m.speed,stroke:.5+.5*Math.cos(2*m.strokePhase),depth:m.depth,above:c.position.y>0,noise:I,breath:oe}),zl(q),ao-=q,ao<=0&&(ao=.1,kl()),Bl(q),Vr.push(q),so+=q,so>2){const We=Vr.reduce((nt,qe)=>nt+qe,0)/Vr.length;ro=1/We,We>1/40&&hn>.75?(hn=Math.max(.75,hn-.15),Zs(),r("dpr_down",hn)):We<1/57&&hn<Ul&&(hn=Math.min(Ul,hn+.1),Zs()),Vr=[],so=0}},Wd=/debug/.test(location.hash+location.search);let Qs=null;Wd&&(Qs=document.createElement("div"),Qs.className="w-debug",document.querySelector(".w-game").appendChild(Qs),window.setInterval(()=>{Qs&&(Qs.textContent=`${Math.round(ro)} fps · dpr ${hn.toFixed(2)} · ${a.info.render.calls} draws · ${(a.info.render.triangles/1e3).toFixed(0)}k tris · sim ${Xr.toFixed(2)} ms · ${D}`)},500)),oo=requestAnimationFrame(Gl),rt("Swim with your family","Your mother leads. Follow her toward the glacier.","ZONE 1 · GLACIER FJORD");const Xd={state:()=>({phase:z,phaseTime:+re.toFixed(2),runTime:+Ie.toFixed(1),started:He,pos:m.pos.toArray().map(E=>+E.toFixed(2)),depth:+m.depth.toFixed(2),speed:+m.speed.toFixed(2),pitch:+m.pitch.toFixed(3),roll:+m.roll.toFixed(3),yaw:+m.yaw.toFixed(3),airborne:m.airborne,surfaced:m.surfaced,strokeFreq:+m.strokeFreq.toFixed(2),strokeAmp:+m.strokeAmp.toFixed(2),coasting:m.coasting,breath:+oe.toFixed(1),energy:+Q.toFixed(1),noise:+I.toFixed(2),gear:Re,burst:Ke,codCaught:ae,herringEaten:Ee,stunnedByPlayer:ge,pressure:+De.toFixed(1),breaches:M,discovered:[...at],runFound:[...en],orcaKind:D,humpbackKind:H?H.kind:"loading",fps:Math.round(ro),pixelRatio:hn,draws:a.info.render.calls,triangles:a.info.render.triangles,cod:ve.center.toArray().map(E=>+E.toFixed(1)),herring:xe.center.toArray().map(E=>+E.toFixed(1)),matriarch:A.matriarch.body.pos.toArray().map(E=>+E.toFixed(1)),camera:c.position.toArray().map(E=>+E.toFixed(2)),lapAccum:+Pe.toFixed(2),simMs:+Xr.toFixed(2),boat:G.position.toArray().map(E=>+E.toFixed(1)),boatMet:B,leaps:ee,breachScoreBest:se,walruses:y.filter(E=>E.key==="walrus").length,packErrors:qo.length}),events:()=>i.slice(),begin:eo,setIntent:E=>{mi.override=E?{...E,active:!0}:null},setGear:E=>hs(E),setBurst:E=>{Ke=E},press:E=>E==="action"?pi():E==="echo"?Ja():Za(),tap:(E,q)=>mi.onTap(E,q),step:E=>{const q=Math.round(E/bi);for(let le=0;le<q;le+=1)Nl(bi),d.update(bi,m,pe,{aspect:c.aspect,burst:!1,cinematic:0})},render:()=>{zl(bi),kl(),Bl(0)},freeze:E=>{Ol=E},setBreath:E=>{oe=E},hud:E=>{document.querySelector(".w-game").classList.toggle("w-nohud",!E)},viewSide:(E=9,q=.5,le=0)=>{c.position.copy(m.pos).addScaledVector(m.right,E).addScaledVector(m.forward,le),c.position.y+=q,c.lookAt(m.pos),c.fov=50,c.updateProjectionMatrix(),l.update(pe,c,m.pos.x,hn,I),a.render(o,c)},settleCamera:(E=2)=>{for(let q=0;q<E*60;q+=1)d.update(bi,m,pe,{aspect:c.aspect,burst:!1,cinematic:0})},teleport:E=>{const le={glacier:[120,-6,-20],discover:[150,-6,-35],chase:[300,-8,-12],coast:[420,-8,0],deep:[600,-20,0],herring:[800,-22,0],carousel:[820,-22,-6],noise:[950,-8,0],breach:[980,-6,30]}[E];le&&(m.pos.set(le[0],le[1],le[2]),m.vel.set(4,0,0),m.yaw=0,m.pitch=0,A.members.forEach((Oe,We)=>{Oe.body.pos.set(le[0]-6-We*3,le[1],le[2]+(We-1.5)*6),Oe.body.yaw=0})),(E==="slap"||E==="feed")&&(m.pos.set(Xt.herringHome.x-12,-10,Xt.herringHome.z),De=100,xe.center.y=-8),E==="feed"&&xe.stunWithin(xe.center,12,20),$e(E)},rock:(E=0)=>l.rockColliders[E],nearestCod:()=>{const E=ve.nearest(m.pos,999);return E?ve.fishPosition(E.index,new C).toArray():null},nearestStunned:()=>{const E=xe.nearest(m.pos,999,!0);return E?xe.fishPosition(E.index,new C).toArray():null},renderer:a,scene:o,camera:c,player:m};window.__wild=Xd;function Hl(){bt||(bt=!0,cancelAnimationFrame(oo),window.removeEventListener("resize",Zs),mi.dispose(),a.dispose(),o.traverse(E=>{var Oe;const q=E;q.geometry&&q.geometry.dispose();const le=q.material;Array.isArray(le)?le.forEach(We=>We.dispose()):(Oe=le==null?void 0:le.dispose)==null||Oe.call(le)}))}return Hl}kd();
