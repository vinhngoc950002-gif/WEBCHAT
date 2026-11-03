import * as THREE from 'three';

// Dedicated reconstruction of the two-part Long An monument, based on the
// QDND 05/04/2023 and VNA 29/09/2024 reference photographs. Hand modeled,
// not a scan: the silhouette, two groups and red terraces are the priority.
export function createLongAnMonument(){
 const root=new THREE.Group();root.name='Long An – cụm người và rồng';
 let seed=9357;const data=new Uint8Array(128*128*4);for(let i=0;i<data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=190+(seed%48);data[i]=n;data[i+1]=n;data[i+2]=n;data[i+3]=255;}
 const grain=new THREE.DataTexture(data,128,128,THREE.RGBAFormat);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);grain.needsUpdate=true;
 const stone=new THREE.MeshStandardMaterial({color:0xd5cbb9,map:grain,bumpMap:grain,bumpScale:.018,roughness:.88});
 const recess=new THREE.MeshStandardMaterial({color:0x9d9282,map:grain,roughness:.92});
 const granite=new THREE.MeshStandardMaterial({color:0x873d2e,map:grain,bumpMap:grain,bumpScale:.012,roughness:.57});
 const trim=new THREE.MeshStandardMaterial({color:0xa6563b,map:grain,roughness:.64});
 function mesh(geometry,mat,x=0,y=0,z=0,p=root){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
 const box=(w,h,d,mat,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,p);
 const ellipsoid=(rx,ry,rz,x,y,z,mat=stone,p=root)=>{const m=mesh(new THREE.SphereGeometry(1,24,18),mat,x,y,z,p);m.scale.set(rx,ry,rz);return m;};
 function rod(points,r,mat=stone,p=root){const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*7),r,10,false),mat,0,0,0,p);}
 function slab(points,depth,mat=stone,z=0,p=root,bevel=.06){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1}),mat,0,0,z,p);}
 function terrace(x,z,w,d,levels){for(let i=0;i<levels;i++){box(w-i*.38,.25,d-i*.3,granite,x,.125+i*.25,z);box(w-i*.38,.035,d-i*.3,trim,x,.255+i*.25,z);}}
 terrace(-3.35,1.5,5.5,4.4,4);terrace(2.65,-.8,5.9,5.2,5);
 // Broad stairs leading to the rear sculpture, rather than a generic tall plinth.
 for(let i=0;i<8;i++)box(4.5,.12,4.1-i*.39,granite,2.65,.12+i*.14,1.1-i*.16);
 // Sculpted mother figure at the front left. Anatomical masses are elongated,
 // with arms, facial planes, scarf and flowing garment folds, not round-head dolls.
 const mother=new THREE.Group();mother.position.set(-3.65,1.04,1.7);root.add(mother);
 const head=ellipsoid(.24,.35,.235,0,4.62,.03,stone,mother);head.rotation.z=.08;
 ellipsoid(.22,.12,.21,0,4.86,0,stone,mother);ellipsoid(.12,.19,.13,0,4.18,0,stone,mother);
 // Jaw, brow, nose bridge, lips and ears, all carved in the same stone.
 ellipsoid(.17,.14,.19,.015,4.4,.065,stone,mother);
 for(const x of [-.11,.11]){ellipsoid(.067,.027,.025,x,4.64,.224,recess,mother);rod([[x-.065,4.69,.21],[x,4.71,.24],[x+.06,4.69,.21]],.022,stone,mother);ellipsoid(.04,.09,.04,x<0?-.24:.24,4.61,.01,stone,mother);}
 ellipsoid(.038,.095,.055,0,4.59,.255,stone,mother);rod([[-.07,4.45,.235],[0,4.43,.25],[.065,4.45,.23]],.012,recess,mother);
 ellipsoid(.48,.72,.3,0,3.65,0,stone,mother);
 // Tapered robe with a bent contour and visible, narrow carved folds.
 const robe=new THREE.LatheGeometry([new THREE.Vector2(.58,.1),new THREE.Vector2(.61,.4),new THREE.Vector2(.5,1.15),new THREE.Vector2(.43,1.9),new THREE.Vector2(.35,2.7),new THREE.Vector2(.42,3.3)],32);
 mesh(robe,stone,0,.25,0,mother);
 for(let i=0;i<13;i++){const a=i/13*Math.PI*2;rod([[Math.cos(a)*.32,3.4,Math.sin(a)*.3],[Math.cos(a+.1)*.46,2.1,Math.sin(a+.1)*.42],[Math.cos(a-.12)*.59,.55,Math.sin(a-.12)*.5]],.026,stone,mother);}
 // One arm down and one reaching out; hands have a palm and fingers.
 rod([[-.34,4.05,.03],[-.55,3.4,.05],[-.54,2.75,.15]],.12,stone,mother);
 rod([[.34,4.05,0],[.63,3.48,.05],[.94,3.03,.18]],.12,stone,mother);
 for(const [x,y,z] of [[-.54,2.72,.15],[.97,2.99,.18]]){ellipsoid(.11,.17,.08,x,y,z,stone,mother);for(let j=0;j<4;j++)rod([[x+(j-1.5)*.042,y-.08,z],[x+(j-1.5)*.044,y-.25,z+.02]],.016,stone,mother);}
 // Draped scarf sweeping across the chest, projecting behind the shoulder.
 slab([[-.42,4.13],[-.22,4.27],[.46,4.02],[.94,4.56],[.99,4.41],[.55,3.7],[-.1,3.93]],.13,stone,.25,mother,.035);
 rod([[-.4,4.1,.4],[.1,3.91,.42],[.52,3.88,.34],[.9,4.4,.13]],.035,stone,mother);
 // Low foreground figures and flowing relief form a continuous diagonal.
 function reliefPerson(x,y,z,s,lean=0){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);g.rotation.z=lean;root.add(g);ellipsoid(.2,.28,.2,0,1.9,0,stone,g);ellipsoid(.3,.55,.22,0,1.15,0,stone,g);rod([[-.2,1.55,0],[-.48,1.2,.08],[-.68,1.05,.25]],.08,stone,g);rod([[.23,1.5,0],[.52,1.7,0],[.66,2,.08]],.08,stone,g);rod([[-.14,.8,0],[-.25,.38,.06],[-.5,.12,.25]],.11,stone,g);rod([[.14,.8,0],[.5,.4,-.06],[.8,.14,.02]],.11,stone,g);}
 reliefPerson(-3.1,1.15,2.25,.9,-.15);reliefPerson(-2,1.12,2.15,.68,.65);
 slab([[-4.25,1.55],[-3.7,2.5],[-3.2,2.2],[-2.8,2.7],[-2.1,2.2],[-.8,1.3],[-1.65,1.15],[-2.9,1.4]],.6,stone,1.55);
 for(let i=0;i<6;i++)rod([[-3.6+i*.2,2.15,2.25],[-2.9+i*.23,1.7,2.35],[-2.1+i*.25,1.3,2.35]],.035,stone);
 // Rear rising dragon. An extruded carved silhouette, crest, projecting muzzle,
 // layered neck bands and a long flank with reliefs replace the old flag pole.
 const dragon=new THREE.Group();dragon.position.set(2.1,1.3,-1.05);root.add(dragon);
 slab([[-1.45,0],[1.7,0],[1.5,2],[1.1,3.4],[.7,4.1],[.65,5.15],[.2,6.35],[-.55,7.15],[-1,6.9],[-1.15,5.7],[-.8,4.85],[-1,3.9],[-1.2,2.9]],1.8,stone,-.9,dragon,.09);
 // Rising fan-shaped crest, taken from the strong outline in the reference.
 const crest=[[-.4,6.7],[-.55,9.3],[.05,8.15],[.48,8.9],[.7,7.8],[1.18,8.3],[1.17,7.4],[1.8,7.75],[1.6,6.95],[2.16,7.05],[1.98,6.4],[2.35,6.4],[2.2,5.85],[1.25,5.85],[.5,6.25]];
 slab(crest,.6,stone,-.4,dragon,.04);
 // Head points left, with brow, deep open mouth, jaw, nostrils and horns.
 slab([[-1.1,7.1],[-1.55,6.85],[-1.73,6.48],[-2.05,6.2],[-1.97,5.99],[-1.35,6.06],[-1.2,5.78],[-1.76,5.59],[-1.7,5.36],[-.83,5.33],[-.38,5.87],[-.3,6.6]],1.05,stone,.1,dragon,.07);
 slab([[-1.98,5.97],[-1.31,6.01],[-1.15,5.76],[-1.72,5.63]],.05,recess,1.18,dragon,.01);
 ellipsoid(.12,.047,.04,-.98,6.59,1.22,recess,dragon);ellipsoid(.055,.035,.035,-.99,6.595,1.245,stone,dragon);
 rod([[-1.25,6.76,1.22],[-.95,6.85,1.3],[-.55,6.73,1.1]],.08,stone,dragon);
 ellipsoid(.085,.06,.05,-1.87,6.18,1.2,recess,dragon);
 for(let i=0;i<4;i++)slab([[-1.7+i*.14,6.02],[-1.61+i*.14,6.02],[-1.65+i*.14,5.86]],.06,stone,1.24,dragon,.01);
 for(let i=0;i<7;i++){const y=1.3+i*.57,w=2.8-i*.16;box(w,.17,2.12,stone,0,y,0,dragon);box(w+.1,.07,2.18,stone,0,y+.13,0,dragon);}
 // Carved crest ribs, cheek scrolls, horn ridges and projecting whiskers.
 for(const [x,y] of [[-.48,9.03],[.43,8.65],[1.05,8.05],[1.58,7.52],[1.94,6.9],[2.12,6.26]]){
  rod([[.05,6.35,.26],[x*.5,7+(y-7)*.35,.27],[x,y,.27]],.037,stone,dragon);
 }
 for(let i=0;i<3;i++)rod([[-.58+i*.12,6.8,1.18],[-.22+i*.12,6.31,1.24],[-.55+i*.1,5.92,1.22]],.035,stone,dragon);
 rod([[-1.7,6.27,1.19],[-2.14,6.34,1.28],[-2.24,6.56,1.3],[-2.12,6.77,1.25]],.04,stone,dragon);
 rod([[-1.4,5.38,1.06],[-1.05,5.08,1.23],[-.72,5.24,1.18]],.055,stone,dragon);
 // Layered scrollwork and scales on both sides, with a relief wall extending back.
 box(1.2,3.2,4.5,stone,.68,1.65,-1.8,dragon);
 for(const side of [-1,1])for(let row=0;row<4;row++)for(let col=0;col<6;col++){const x=side*1.32,y=.65+row*.68,z=.35-col*.62;const scale=ellipsoid(.1,.26,.22,x,y,z,stone,dragon);scale.rotation.x=(col%2)*.24;}
 for(let i=0;i<5;i++){const y=2.9+i*.6;rod([[-1,y,.98],[-.5,y+.23,1.16],[0,y+.15,1.18],[.55,y+.35,1.04]],.085,stone,dragon);}
 // Relief heads embedded in the lower dragon column.
 for(let i=0;i<3;i++){ellipsoid(.18,.24,.12,-.66+i*.6,1.85+i*.25,1.15,stone,dragon);slab([[-.9+i*.6,1.6+i*.25],[-.5+i*.6,1.6+i*.25],[-.36+i*.6,.75+i*.25],[-1.02+i*.6,.75+i*.25]],.14,stone,1.02,dragon,.025);}
 root.userData.reference='https://www.qdnd.vn/xa-hoi/tin-tuc/dang-huong-tuong-dai-long-an-trung-dung-kien-cuong-toan-dan-danh-giac-724026';
 return root;
}

