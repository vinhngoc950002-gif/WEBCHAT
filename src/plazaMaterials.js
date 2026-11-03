import * as THREE from 'three';

// Locally generated seamless surface detail; assets work offline.
export function surfaceTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');let seed=1729;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const image=ctx.createImageData(512,512);
 for(let i=0;i<image.data.length;i+=4){const noise=(random()-.5)*(kind==='grass'?54:24),base=kind==='grass'?[97,114,73]:kind==='granite'?[157,159,151]:[184,177,161];for(let c=0;c<3;c++)image.data[i+c]=base[c]+noise;image.data[i+3]=255;}ctx.putImageData(image,0,0);
 if(kind==='paving'){
  ctx.strokeStyle='#797a7066';ctx.lineWidth=3;
  for(let row=0;row<4;row++)for(let col=-1;col<4;col++){const x=col*256+(row%2)*128,y=row*128;ctx.strokeRect(x+2,y+2,252,124);ctx.strokeStyle='#e6e1d266';ctx.lineWidth=1;ctx.strokeRect(x+5,y+5,246,118);ctx.strokeStyle='#797a7066';ctx.lineWidth=3;}
 }else if(kind==='granite'){
  for(let i=0;i<12000;i++){const x=random()*512,y=random()*512;ctx.fillStyle=i%3?'#343e3538':'#f5f6ed80';ctx.fillRect(x,y,random()*2+1,random()*2+1);}
 }else{
  for(let i=0;i<15000;i++){ctx.strokeStyle=i%2?'#4c653d50':'#b0b28b55';const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*3-1.5,y-3-random()*5);ctx.stroke();}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=8;texture.repeat.set(kind==='grass'?28:kind==='paving'?18:1,kind==='grass'?28:kind==='paving'?18:1);return texture;
}
export function contactShadow(){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(23,30,24,.35)');gradient.addColorStop(.5,'rgba(23,30,24,.15)');gradient.addColorStop(1,'rgba(23,30,24,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);}
