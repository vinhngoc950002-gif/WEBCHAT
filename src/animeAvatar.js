import * as THREE from 'three';
import {normalizeAvatarGender} from './avatarProfile.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const animePalettes=[
 {hair:0x34365f,iris:0x7b63d8,coat:0x7364d6,accent:0xffcf73,long:false},
 {hair:0xb96b96,iris:0x7e61b4,coat:0xe999ba,accent:0xffe4af,long:true},
 {hair:0x435780,iris:0x4faac2,coat:0x648bc9,accent:0xace6e6,long:false},
 {hair:0xb97a43,iris:0x72945a,coat:0xe6ac64,accent:0xffe2a4,long:true},
 {hair:0x4c787b,iris:0x48a298,coat:0x65b4a3,accent:0xd6f5bf,long:false}
];

// Articulated chibi rig: the same hip/knee pivots support walking and bench poses.
export function createAnimeAvatar(index=0,gender='male'){
 gender=normalizeAvatarGender(gender);
 const palette={...animePalettes[index%animePalettes.length],long:gender==='female'};
 const group=new THREE.Group(),body=new THREE.Group();group.add(body);group.userData.avatarGender=gender;
 const ramp=new THREE.DataTexture(new Uint8Array([95,95,95,255,158,158,158,255,218,218,218,255,255,255,255,255]),4,1,THREE.RGBAFormat);
 ramp.minFilter=THREE.NearestFilter;ramp.magFilter=THREE.NearestFilter;ramp.colorSpace=THREE.NoColorSpace;ramp.needsUpdate=true;
 const materials=new Map(),ink=new THREE.MeshBasicMaterial({color:0x34304b,side:THREE.BackSide});
 function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshToonMaterial({color,gradientMap:ramp}));return materials.get(color);}
 function part(geometry,color,x,y,z,parent=body,outline=true){const mesh=new THREE.Mesh(geometry,material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(outline){const edge=new THREE.Mesh(geometry,ink);edge.scale.setScalar(1.035);mesh.add(edge);}return mesh;}
 const ball=(r,c,x,y,z,p=body,outline=true)=>part(new THREE.SphereGeometry(r,24,18),c,x,y,z,p,outline);
 const box=(w,h,d,c,x,y,z,p=body)=>part(new RoundedBoxGeometry(w,h,d,2,.06),c,x,y,z,p);
 // Fitted jacket, inner shirt, contrasting collar and small star-like brooch.
 box(.76,.87,.44,palette.coat,0,1.59,0);box(.22,.62,.035,0xfff4e8,0,1.63,.245);
 for(const side of [-1,1]){const collar=box(.18,.29,.04,palette.accent,side*.14,1.91,.26);collar.rotation.z=side*.35;}
 box(.75,.1,.46,0x454865,0,1.19,0);ball(.065,palette.accent,.24,1.79,.26);
 part(new THREE.CylinderGeometry(.12,.13,.16,16),0xffd8c2,0,2.1,0);
 const head=ball(.55,0xffdbc8,0,2.63,0);head.scale.set(.95,1.05,.87);
 // Hair cap leaves the face open. Polygonal fringe and side locks give an anime silhouette.
 part(new THREE.SphereGeometry(.575,24,16,0,Math.PI*2,0,1.7),palette.hair,0,2.82,-.025);
 for(let i=0;i<7;i++){const x=(i-3)*.125;const fringe=part(new THREE.ConeGeometry(.115,.4+(i%3)*.065,5),palette.hair,x,2.96,.36-Math.abs(x)*.18);fringe.rotation.z=Math.PI+(i-3)*.1;fringe.rotation.x=-.12;}
 for(const side of [-1,1]){const lock=part(new THREE.ConeGeometry(.16,palette.long?.95:.63,6),palette.hair,side*.48,palette.long?2.5:2.65,-.04);lock.rotation.z=Math.PI+side*.12;}
 if(palette.long){for(const side of [-1,1]){const tail=ball(.27,palette.hair,side*.57,2.15,-.22);tail.scale.set(.7,1.9,.9);ball(.1,palette.accent,side*.57,2.62,-.16);}}
 // Layered large eyes, limbal ring, irises, pupils and two catchlights.
 for(const side of [-1,1]){const x=side*.19;
  const white=ball(.135,0xfff9f2,x,2.64,.447,body,false);white.scale.set(.84,1.13,.26);
  const rim=ball(.108,0x302d49,x,2.635,.478,body,false);rim.scale.set(.77,1.1,.24);
  const iris=ball(.091,palette.iris,x,2.63,.499,body,false);iris.scale.set(.75,1.12,.24);
  const pupil=ball(.055,0x2c2944,x,2.64,.518,body,false);pupil.scale.set(.6,1,.24);
  const glint=ball(.034,0xffffff,x-side*.018,2.685,.536,body,false);glint.scale.z=.25;
  const glintSmall=ball(.016,0xfff5e5,x+side*.025,2.6,.533,body,false);glintSmall.scale.z=.25;
  const lash=box(.23,.035,.028,0x3a304b,x,2.765,.467);lash.rotation.z=-side*.12;
  const cheek=ball(.085,0xf2aeb0,side*.32,2.49,.399,body,false);cheek.scale.set(1,.34,.13);
 }
 const nose=ball(.045,0xf0bca9,0,2.515,.471,body,false);nose.scale.set(.6,.8,.7);
 const smileCurve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.065,2.435,.443),new THREE.Vector3(0,2.39,.468),new THREE.Vector3(.065,2.435,.443));
 part(new THREE.TubeGeometry(smileCurve,12,.012,5,false),0x9a5765,0,0,0,body,false);
 if(gender==='female'){
  part(new THREE.CylinderGeometry(.36,.56,.44,12),palette.coat,0,1.21,0);
  for(const side of [-1,1]){const ribbon=box(.17,.12,.065,palette.accent,side*.11,1.86,.3);ribbon.rotation.z=side*.3;}
 }
 const legs=[],calves=[],arms=[],forearms=[];
 for(const x of [-.2,.2]){const hip=new THREE.Group();hip.position.set(x,1.15,0);body.add(hip);part(new THREE.CapsuleGeometry(.14,.25,4,10),0x414362,0,-.24,0,hip);const knee=new THREE.Group();knee.position.y=-.5;hip.add(knee);part(new THREE.CapsuleGeometry(.12,.27,4,10),0x565773,0,-.24,0,knee);box(.26,.12,.29,0xf8f0e6,0,-.39,0,knee);box(.29,.18,.44,palette.coat,0,-.5,.09,knee);box(.31,.065,.46,0xf5efe6,0,-.565,.09,knee);legs.push(hip);calves.push(knee);}
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.49,1.98,0);body.add(arm);
  part(new THREE.CapsuleGeometry(.12,.12,4,10),palette.coat,0,-.15,0,arm);
  const elbow=new THREE.Group();elbow.position.y=-.29;arm.add(elbow);
  part(new THREE.CapsuleGeometry(.095,.12,4,10),palette.coat,0,-.12,0,elbow);
  box(.22,.075,.23,palette.accent,0,-.24,0,elbow);
  const palm=ball(.105,0xffd6bd,0,-.34,0,elbow);palm.scale.set(1,.95,.55);
  for(let finger=0;finger<4;finger++){
   const digit=part(new THREE.CapsuleGeometry(.023,.085-Math.abs(finger-1.5)*.014,3,6),0xffd6bd,(finger-1.5)*.045,-.45+Math.abs(finger-1.5)*.009,0,elbow,false);
   digit.rotation.z=(finger-1.5)*.11;
  }
  const thumb=part(new THREE.CapsuleGeometry(.028,.06,3,6),0xffd6bd,side*.115,-.35,0,elbow,false);thumb.rotation.z=side*.65;
  arms.push(arm);forearms.push(elbow);
 }
 return {group,body,legs,calves,arms,forearms,ramp,gender};
}
