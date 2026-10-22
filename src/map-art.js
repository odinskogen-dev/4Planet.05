
(function(){
'use strict';
const ranges=[
 [[6.4,45.7],[7.5,46.2],[9.4,46.2],[10.8,46.7],[12.5,46.6],[14.6,46.7],[16,46.9]],
 [[9.8,44.3],[11.2,43.3],[12.7,42.7],[13.6,42],[14.5,41.4],[15,40.8],[15.8,40.5],[16.1,39.8]],
 [[-1.5,43],[0,42.7],[1.3,42.7],[2.8,42.5]],
 [[-9,31.6],[-7,31.6],[-4,32.2],[-2,33.4],[0,34.5],[3,35.4],[7,35.7]],
 [[20,42.8],[22.1,42.3],[24,42.6],[26.5,43.1]],
 [[29,37.2],[32,37.1],[34,37.5],[36.4,37.7],[38.1,37.3]],
 [[45,36.8],[46,35.7],[47,34.1],[48.3,33.2],[49.2,31.7],[51.5,30]]
];
const names=[
 ['HISPANIA',-4.9,39.3],['GALLIA',3.3,48.1],['ITALIA',12.5,42.1],
 ['GRAECIA',23.1,39.3],['ASIA MINOR',33.1,39.4],['AFRICA',10,32.9],
 ['AEGYPTUS',30.6,26.8],['MESOPOTAMIA',43.1,33.7],['PERSIS',54.7,29.4],
 ['BRITANNIA',-2.8,53.1]
];
function stroke(ctx,points,color,width){
 ctx.beginPath();points.forEach((p,i)=>{if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});
 ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function sea(ctx,w,h){
 const g=ctx.createLinearGradient(0,0,w,h);
 g.addColorStop(0,'#78969a');g.addColorStop(.55,'#5c8186');g.addColorStop(1,'#385c65');
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.globalAlpha=.12;
 for(let t=1;t<16;t++){
  const y=h*t/16;
  ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(w*.3,y-20,w*.63,y+15,w,y-9);
  ctx.strokeStyle='#e5ede0';ctx.lineWidth=.8;ctx.stroke();
 }
 ctx.restore();
}
function land(ctx,pos,z){
 ctx.save();
 for(const chain of ranges){
  const points=chain.map(([lon,lat])=>pos(lon,lat));
  const width=Math.max(3,Math.min(120,8*z));
  stroke(ctx,points,'rgba(117,91,63,.21)',width*2.8);
  stroke(ctx,points,'rgba(108,81,51,.17)',width*1.55);
  stroke(ctx,points,'rgba(247,225,173,.39)',width*.8);
  if(z>.7)stroke(ctx,points,'rgba(86,70,47,.37)',Math.max(1,Math.min(3,z*.6)));
 }
 if(z>2){
  for(const [lon,lat,nx,ny] of [
   [16.05,41.22,8,7],[16.15,41.30,7,6],[15.8,40.96,7,5],
   [15.34,41.51,6,5],[14.78,41.13,6,5],[14.25,41.08,6,5]
  ]){
   for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
    const lo=lon+(i-nx/2)*.022,la=lat+(j-ny/2)*.014;
    const [x,y]=pos(lo,la),[x2,y2]=pos(lo+.018,la+.010);
    const w=Math.abs(x2-x),h=Math.abs(y2-y);
    if(w<1||h<1)continue;
    ctx.fillStyle=['rgba(130,119,62,.26)','rgba(85,118,69,.2)','rgba(171,144,81,.24)','rgba(102,99,65,.18)'][(i*3+j*7)%4];
    ctx.fillRect(Math.min(x,x2),Math.min(y,y2),w*.91,h*.86);
   }
  }
 }
 ctx.restore();
}
function river(ctx,pos,z){
 if(z<1.65)return;
 const points=[[15.44,40.99],[15.61,41.09],[15.72,41.19],[15.89,41.25],[16.08,41.31],[16.25,41.36]].map(p=>pos(...p));
 stroke(ctx,points,'rgba(255,242,206,.72)',Math.min(14,3*z));
 stroke(ctx,points,'rgba(68,116,134,.8)',Math.min(9,1.9*z));
 const p=pos(16.0,41.36);
 if(z>3){ctx.save();ctx.textAlign='center';ctx.fillStyle='#476b70';ctx.font='italic 11px Georgia';ctx.fillText('Aufidus · approximate',p[0],p[1]-8);ctx.restore();}
}
function labels(ctx,pos,z,w,h){
 ctx.save();ctx.textAlign='center';
 if(z<7)for(const [name,lon,lat] of names){
  const [x,y]=pos(lon,lat);if(x<-80||x>w+80||y<-30||y>h+30)continue;
  ctx.font='600 '+Math.max(10,Math.min(18,10+z))+'px Georgia';
  ctx.fillStyle='rgba(66,58,43,.44)';ctx.fillText(name,x,y);
 }
 for(const [name,lon,lat] of [['MARE NOSTRUM',17,35.7],['MARE TYRRHENUM',10.6,39],['MARE ADRIATICUM',17.2,43.2]]){
  const [x,y]=pos(lon,lat);if(x<-190||x>w+190||y<-35||y>h+35)continue;
  ctx.font='italic '+Math.max(13,Math.min(21,12+z))+'px Georgia';
  ctx.fillStyle='rgba(228,239,224,.36)';ctx.fillText(name,x,y);
 }
 ctx.restore();
}
function city(ctx,x,y,c,owner,selected,z,showLabel){
 ctx.save();const color=owner==='rome'?'#9b7038':owner==='carthage'?'#a24835':owner==='seleucid'?'#816b90':'#747357';
 if(selected){ctx.beginPath();ctx.arc(x,y,21,0,Math.PI*2);ctx.fillStyle='#fff6ce66';ctx.fill();}
 ctx.shadowColor='#29261a77';ctx.shadowBlur=6;
 ctx.beginPath();ctx.arc(x,y,z>2?8:6,0,Math.PI*2);
 ctx.fillStyle='#f2dfb6';ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();
 ctx.beginPath();ctx.arc(x,y,2.3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
 if(showLabel){
  const ly=y+(c.id==='cannae'?-20:c.id==='canusium'?29:3);
  ctx.font=(selected?'700 ':'600 ')+(z>4?13:11)+'px Georgia';
  const tw=ctx.measureText(c.name).width;
  ctx.fillStyle='rgba(239,226,196,.86)';ctx.fillRect(x+10,ly-12,tw+11,17);
  ctx.fillStyle='#393224';ctx.textAlign='left';ctx.fillText(c.name,x+14,ly);
 }
 ctx.restore();
}
function army(ctx,x,y,a,selected,z){
 ctx.save();const xx=x+(a.owner==='rome'?-26:26),yy=y+(a.owner==='rome'?-31:31);
 if(selected){ctx.fillStyle='rgba(255,229,165,.35)';ctx.beginPath();ctx.arc(xx,yy,22,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=a.owner==='rome'?'#922d26':'#3b3331';ctx.strokeStyle='#f0d4a5';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.roundRect(xx-14,yy-13,28,28,4);ctx.fill();ctx.stroke();
 ctx.fillStyle='#f4e5c7';ctx.font='700 9px Arial';ctx.textAlign='center';ctx.fillText(a.owner==='rome'?'SPQR':'H',xx,yy+3);
 ctx.fillStyle='#f2d8ab';ctx.font='700 10px Arial';ctx.fillText((a.men/1000).toFixed(1)+'K',xx,yy+27);
 ctx.restore();
}
window.ROMA_CARTOGRAPHY={sea,land,river,labels,city,army};
})();