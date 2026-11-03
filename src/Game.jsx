import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {getLandmark} from './landmarks.js';
import {createLandmark} from './createLandmark.js';
import {createFishPond} from './fishPond.js';
import {createAnimeAvatar} from './animeAvatar.js';
import {wavePose,fightPose,planEncounter} from './characterActions.js';
import {surfaceTexture,contactShadow} from './plazaMaterials.js';
import {WORLD_LIMIT,seatPose,planPath} from './plazaNavigation.js';

// Only actual scene participants belong here; sample NPCs are no longer spawned.
const PLAZA_CHARACTERS=[];
const clamp=v=>THREE.MathUtils.clamp(v,-WORLD_LIMIT,WORLD_LIMIT);
function makeLabel(text,{bubble=false}={}){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;
 const ctx=canvas.getContext('2d');ctx.font='600 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle=bubble?'#ffffff':'#253454e8';ctx.beginPath();ctx.roundRect(12,18,1000,156,30);ctx.fill();ctx.fillStyle=bubble?'#253454':'#ffffff';ctx.fillText(text,512,96,950);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(bubble?4:2.7,bubble?.75:.51,1);sprite.renderOrder=10;return sprite;
}

export default function Game({action,chatText,joystick,roomName='Toàn quốc'}){
 const host=useRef(null),api=useRef(null),joy=useRef(joystick);
 const [error,setError]=useState(''),[seatState,setSeatState]=useState({mode:'walking',name:''});
 const [selectedName,setSelectedName]=useState(''),[combatStatus,setCombatStatus]=useState('');
 useEffect(()=>{joy.current=joystick;},[joystick]);
 useEffect(()=>{
  const parent=host.current;if(!parent)return;setError('');setSeatState({mode:'walking',name:''});setSelectedName('');setCombatStatus('');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{setError('Không khởi tạo được 3D. Hãy bật tăng tốc đồ họa trong trình duyệt và tải lại trang.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.setClearColor(0xcbd6dc);parent.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xcbd6dc,.006);
  const camera=new THREE.PerspectiveCamera(46,1,.1,240);
  const pmrem=new THREE.PMREMGenerator(renderer),roomEnvironment=new RoomEnvironment();const environment=pmrem.fromScene(roomEnvironment,.05);scene.environment=environment.texture;scene.environmentIntensity=.32;roomEnvironment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xd9e7f3,0x716d53,1.45));
  const sun=new THREE.DirectionalLight(0xffe4bb,3.5);sun.position.set(-28,45,24);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-46;sun.shadow.camera.right=46;sun.shadow.camera.top=46;sun.shadow.camera.bottom=-46;sun.shadow.camera.far=140;sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);
  const materials=new Map();
  function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.78}));return materials.get(color);}
  function mesh(geometry,color,x,y,z,group=scene){const object=new THREE.Mesh(geometry,color?.isMaterial?color:material(color));object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;group.add(object);return object;}
  const box=(w,h,d,c,x,y,z,g)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,g);
  const roundBox=(w,h,d,c,x,y,z,g)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.12,h/4,d/4)),c,x,y,z,g);
  const sphere=(r,c,x,y,z,g)=>mesh(new THREE.SphereGeometry(r,20,14),c,x,y,z,g);
  const cylinder=(rt,rb,h,c,x,y,z,g)=>mesh(new THREE.CylinderGeometry(rt,rb,h,24),c,x,y,z,g);
  const textures=[surfaceTexture('grass'),surfaceTexture('paving'),surfaceTexture('granite'),contactShadow()];
  textures.forEach(t=>t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()));
  const grassMaterial=new THREE.MeshStandardMaterial({map:textures[0],roughness:1});
  const pavingMaterial=new THREE.MeshStandardMaterial({map:textures[1],bumpMap:textures[1],bumpScale:.065,roughness:.89,color:0xf6f0e1});
  const stoneMaterial=new THREE.MeshStandardMaterial({map:textures[2],bumpMap:textures[2],bumpScale:.025,roughness:.56,color:0xe2e0d9});
  const ground=box(180,.4,180,grassMaterial,0,-.3,0);ground.castShadow=false;
  box(73,.3,73,0xa5a497,0,-.05,0);const paving=box(71,.12,71,pavingMaterial,0,.14,0);paving.castShadow=false;
  // Dark granite borders, a cross of generous walking avenues, and central inlay.
  for(const x of [-35.6,35.6])box(.3,.16,72,stoneMaterial,x,.17,0);
  for(const z of [-35.6,35.6])box(72,.16,.3,stoneMaterial,0,.17,z);
  for(const offset of [-4.8,4.8]){box(.12,.025,70,0x8c8b7e,offset,.213,0);box(70,.025,.12,0x8c8b7e,0,.214,offset);}
  const ring=new THREE.Mesh(new THREE.RingGeometry(5.2,5.45,96),stoneMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=.215;ring.receiveShadow=true;scene.add(ring);
  const obstacles=[],benches=[],benchMeshes=[];
  const fishPond=createFishPond();scene.add(fishPond.group);obstacles.push(fishPond.obstacle);
  function shadow(x,z,sx,sz,parent=scene){const plane=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),new THREE.MeshBasicMaterial({map:textures[3],transparent:true,depthWrite:false}));plane.rotation.x=-Math.PI/2;plane.position.set(x,.225,z);parent.add(plane);return plane;}
  function tree(x,z,index){cylinder(.17,.34,4.4,0x776751,x,2.2,z);for(let j=0;j<3;j++){const branch=cylinder(.06,.12,2,0x776751,x+(j-1)*.45,3.7,z);branch.rotation.z=(j-1)*.5;}
   for(let j=0;j<8;j++){const a=j*2.4,r=.6+(j%3)*.5;const crown=mesh(new THREE.IcosahedronGeometry(1.2+(j%3)*.22,2),[0x65764e,0x78845a,0x536c49][(j+index)%3],x+Math.cos(a)*r,4.5+(j%3)*.6,z+Math.sin(a)*r);crown.scale.y=1.15;}
   shadow(x,z,5,5);obstacles.push({x,z,r:.65});}
  for(let n=-32;n<=32;n+=8){tree(n,-39,n+32);tree(n,39,n+33);tree(-39,n,n+34);tree(39,n,n+35);}
  function bench(x,z,angle){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;scene.add(group);const id=benches.length+1;const seat={x,z,angle,name:`Ghế đá ${id}`,group};benches.push(seat);
   const parts=[roundBox(3.6,.24,1.08,stoneMaterial,0,.9,0,group),roundBox(3.6,.78,.2,stoneMaterial,0,1.43,-.46,group)];
   for(const px of [-1.22,1.22]){parts.push(roundBox(.4,.65,.8,stoneMaterial,px,.48,0,group));roundBox(.18,.17,.85,stoneMaterial,px*1.25,1.15,0,group);box(.12,.28,.12,0x70736d,px*1.25,1.03,.3,group);}
   parts.forEach(part=>part.userData.bench=seat);benchMeshes.push(...parts);shadow(x,z,5.3,3.1);obstacles.push({x,z,r:2});
  }
  for(const x of [-8,8]){bench(x,-7,0);bench(x,7,Math.PI);}
  for(const x of [-23,23])for(const z of [-19,0,19])bench(x,z,x<0?Math.PI/2:-Math.PI/2);
  for(const x of [-10,10]){bench(x,-28,0);bench(x,28,Math.PI);}
  const info=getLandmark(roomName),landmark=createLandmark(info);scene.add(landmark);if(info.type!=='longAn')cylinder(4.5,4.7,.25,stoneMaterial,0,.27,0);shadow(0,0,11,11);obstacles.push({x:0,z:0,r:4.95});
  const landmarkTop=new THREE.Box3().setFromObject(landmark).max.y;const landmarkLabel=makeLabel(info.name);landmarkLabel.position.set(0,landmarkTop+.7,0);landmarkLabel.scale.set(6.8,1.27,1);scene.add(landmarkLabel);
  // Raised garden beds are physical obstacles, leaving the central avenues clear.
  for(const x of [-28,28])for(const z of [-27,27]){box(5,.5,5,stoneMaterial,x,.44,z);box(4.6,.12,4.6,0x4c573c,x,.74,z);obstacles.push({x,z,r:3.6});
   for(let i=0;i<24;i++){const a=i*2.4,r=.4+(i%5)*.36;const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;cylinder(.018,.024,.45,0x58664a,px,.94,pz);sphere(.1,[0xd4b5ad,0xc4aa73,0xb5b4ca][i%3],px,1.21,pz);}}
  for(const x of [-17,17])for(const z of [-24,-8,8,24]){cylinder(.07,.17,4.7,0x454d48,x,2.5,z);roundBox(.55,.65,.55,0xf4dda5,x,5,z);const lamp=material(0xf4dda5);lamp.emissive.set(0xffce85);lamp.emissiveIntensity=.45;cylinder(.4,.12,.25,0x454d48,x,5.5,z);}
  box(4.2,2,2.5,0xb39b80,-13,1.2,-33);const roof=mesh(new THREE.ConeGeometry(3.2,1.6,4),0x8d7661,-13,3,-33);roof.rotation.y=Math.PI/4;obstacles.push({x:-13,z:-33,r:2.8});
  const sign=makeLabel('QUẢNG TRƯỜNG '+roomName.toLocaleUpperCase('vi'));sign.position.set(0,5.5,-33);sign.scale.set(10,1.87,1);scene.add(sign);
  function avatar(name,index,x,z){
   const rig=createAnimeAvatar(index);rig.group.position.set(x,0,z);scene.add(rig.group);
   textures.push(rig.ramp);
   const label=makeLabel(name);label.position.y=3.85;rig.group.add(label);
   rig.group.userData.character=rig;rig.name=name;return {...rig,shade:shadow(x,z,1.8,1.8)};
  }
  const hero=avatar('Bạn',0,0,9);const bots=PLAZA_CHARACTERS.map((character,index)=>avatar(character.name,index+1,character.x,character.z));
  let selectedBot=null,pendingAttack=null,fight=null,waveStarted=-Infinity;
  let yaw=Math.PI/4,distance=23,bubble=null,bubbleUntil=0,emoteUntil=0,path=[],pendingSeat=null,seated=null;
  const keys=new Set(),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let drag=null,hovered=null;
  const indicator=new THREE.Mesh(new THREE.RingGeometry(2.15,2.23,64),new THREE.MeshBasicMaterial({color:0xe7cf8d,transparent:true,opacity:.85,depthWrite:false}));indicator.rotation.x=-Math.PI/2;indicator.position.y=.235;indicator.visible=false;scene.add(indicator);
  function say(text){if(bubble){hero.group.remove(bubble);bubble.material.map.dispose();bubble.material.dispose();}bubble=makeLabel(Array.from(text).slice(0,45).join(''),{bubble:true});bubble.position.y=4.65;hero.group.add(bubble);bubbleUntil=performance.now()+4000;}
  function stand(){if(!seated)return;const exit=seatPose(seated).exit;hero.group.position.set(exit.x,0,exit.z);seated=null;pendingSeat=null;path=[];setSeatState({mode:'walking',name:''});}
  function goTo(point,bench=null){cancelCombat();stand();const result=planPath(hero.group.position,point,obstacles);if(!result.length){say('Lối đi đang bị chắn. Hãy chọn chỗ khác.');pendingSeat=null;setSeatState({mode:'walking',name:''});return;}path=result;pendingSeat=bench;setSeatState({mode:bench?'approaching':'walking',name:bench?.name||''});}
  function requestSeat(bench){goTo(seatPose(bench).approach,bench);}
  function sit(bench){const pose=seatPose(bench);seated=bench;pendingSeat=null;path=[];hero.group.position.set(pose.position.x,0,pose.position.z);hero.body.rotation.y=pose.angle;keys.clear();setSeatState({mode:'seated',name:bench.name});}
  const selectionRing=new THREE.Mesh(new THREE.RingGeometry(.8,.93,48),new THREE.MeshBasicMaterial({color:0xffbe67,transparent:true,opacity:.9,depthWrite:false}));selectionRing.rotation.x=-Math.PI/2;selectionRing.visible=false;scene.add(selectionRing);
  const impact=new THREE.Group();scene.add(impact);impact.visible=false;
  for(let i=0;i<8;i++){const shard=mesh(new THREE.ConeGeometry(.07,.4,4),new THREE.MeshBasicMaterial({color:i%2?0xfff5bc:0xffb44f}),Math.cos(i*Math.PI/4)*.4,Math.sin(i*Math.PI/4)*.4,0,impact);shard.rotation.z=i*Math.PI/4-Math.PI/2;}
  function cancelCombat(){pendingAttack=null;fight=null;setCombatStatus('');}
  function selectBot(name){cancelCombat();path=[];if(pendingSeat){pendingSeat=null;setSeatState({mode:'walking',name:''});}selectedBot=bots.find(bot=>bot.name===name)||null;setSelectedName(selectedBot?.name||'');}
  function wave(){cancelCombat();path=[];keys.clear();if(pendingSeat){pendingSeat=null;setSeatState({mode:'walking',name:''});}waveStarted=performance.now();hero.body.rotation.y=selectedBot?Math.atan2(selectedBot.group.position.x-hero.group.position.x,selectedBot.group.position.z-hero.group.position.z):yaw;say('👋 Xin chào!');}
  function attack(){if(!selectedBot||fight||pendingAttack)return;stand();waveStarted=-Infinity;const route=planEncounter(hero.group.position,selectedBot.group.position,obstacles);if(!route){say('Chưa tìm được lối đến nhân vật này.');return;}keys.clear();pendingSeat=null;setSeatState({mode:'walking',name:''});path=route.path;pendingAttack=selectedBot;setCombatStatus('Đang tiến đến '+selectedBot.name);}
  api.current={say,stand,wave,attack,selectBot,nearestSeat(){const nearest=[...benches].sort((a,b)=>hero.group.position.distanceToSquared(new THREE.Vector3(a.x,0,a.z))-hero.group.position.distanceToSquared(new THREE.Vector3(b.x,0,b.z)))[0];requestSeat(nearest);},emote(emoji){if(emoji==='👋'){wave();return;}say(emoji);if(!seated)emoteUntil=performance.now()+900;}};
  const focused=()=>['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  function keydown(e){if(focused())return;const key=e.key.toLowerCase();if(key==='e'&&!e.repeat){e.preventDefault();if(seated)stand();else api.current.nearestSeat();return;}if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){e.preventDefault();keys.add(key);}}
  const keyup=e=>keys.delete(e.key.toLowerCase()),blur=()=>{keys.clear();drag=null;};
  const canvas=renderer.domElement;canvas.style.touchAction='none';
  function aim(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(benchMeshes,false)[0]?.object.userData.bench;}
  function down(e){if(e.button!==0&&e.button!==2)return;canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,startX:e.clientX,startY:e.clientY,button:e.button,moved:false};}
  function move(e){if(!drag){hovered=aim(e);canvas.style.cursor=hovered?'pointer':'grab';return;}const dx=e.clientX-drag.x;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;if(drag.moved)yaw-=dx*.008;drag.x=e.clientX;}
  function up(e){if(!drag)return;if(!drag.moved&&drag.button===0){const bench=aim(e);const picked=raycaster.intersectObjects(bots.map(bot=>bot.group),true)[0];if(picked){let object=picked.object;while(object&&!object.userData.character)object=object.parent;const bot=bots.find(item=>item.group===object);if(bot)selectBot(bot.name);}else if(bench){requestSeat(bench);}else{selectBot('');const hit=new THREE.Vector3();if(raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.2),hit))goTo({x:clamp(hit.x),z:clamp(hit.z)});}}drag=null;}
  const cancel=()=>{drag=null;hovered=null;},context=e=>e.preventDefault(),wheel=e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.015,11,46);};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('pointerleave',cancel);canvas.addEventListener('contextmenu',context);canvas.addEventListener('wheel',wheel,{passive:false});
  const resize=new ResizeObserver(()=>{const w=parent.clientWidth,h=parent.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}});resize.observe(parent);
  const look=hero.group.position.clone();look.y=1.4;camera.position.set(look.x+Math.sin(yaw)*distance,look.y+distance*.68,look.z+Math.cos(yaw)*distance);camera.lookAt(look);
  let last=performance.now(),frame;
  function animate(now){frame=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;
   let dx=0,dz=0;if(!focused()){dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+(joy.current?.x||0);dz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+(joy.current?.y||0);}
   const movement=new THREE.Vector3();if(dx||dz){if(fight||pendingAttack)cancelCombat();stand();path=[];if(pendingSeat){pendingSeat=null;setSeatState({mode:'walking',name:''});}movement.set(Math.cos(yaw)*dx+Math.sin(yaw)*dz,0,-Math.sin(yaw)*dx+Math.cos(yaw)*dz).normalize().multiplyScalar(5.5*dt);}else if(!fight&&!seated&&!focused()&&path.length){const goal=path[0];movement.set(goal.x-hero.group.position.x,0,goal.z-hero.group.position.z);if(movement.length()<.15){path.shift();movement.set(0,0,0);}else movement.setLength(Math.min(5.5*dt,movement.length()));}
   let moving=false;
   if(!seated){const next=hero.group.position.clone().add(movement);next.x=clamp(next.x);next.z=clamp(next.z);for(const o of obstacles){const vx=next.x-o.x,vz=next.z-o.z,d=Math.hypot(vx,vz);if(d<o.r){if(d>.001){next.x=o.x+vx/d*o.r;next.z=o.z+vz/d*o.r;}else next.copy(hero.group.position);}}
    moving=next.distanceToSquared(hero.group.position)>.00001;if(moving){hero.body.rotation.y=Math.atan2(next.x-hero.group.position.x,next.z-hero.group.position.z);hero.group.position.copy(next);}
    if(pendingSeat&&!path.length){const approach=seatPose(pendingSeat).approach;if(Math.hypot(hero.group.position.x-approach.x,hero.group.position.z-approach.z)<.4)sit(pendingSeat);}
   }
   if(pendingAttack&&!path.length&&!focused()){if(hero.group.position.distanceTo(pendingAttack.group.position)<1.65){fight={target:pendingAttack,started:now};pendingAttack=null;setCombatStatus('Đang giao đấu');}else{cancelCombat();say('Hãy chọn lại mục tiêu để tiến gần hơn.');}}
   const seatedNow=Boolean(seated);hero.legs.forEach((leg,i)=>leg.rotation.x=seatedNow?-Math.PI/2:moving?Math.sin(now*.012+i*Math.PI)*.48:0);hero.calves.forEach(calf=>calf.rotation.x=seatedNow?Math.PI/2:0);hero.arms.forEach((arm,i)=>{arm.rotation.set(seatedNow?-.55:moving?Math.sin(now*.012-i*Math.PI)*.35:0,0,0);});
   hero.forearms.forEach(arm=>arm.rotation.set(0,0,0));
   hero.body.position.y=seatedNow?-.15:now<emoteUntil?Math.abs(Math.sin(now*.018))*.4:0;hero.shade.position.set(hero.group.position.x,.225,hero.group.position.z);
   bots.forEach((bot,i)=>{bot.body.position.set(0,Math.sin(now*.002+i)*.018,0);bot.body.rotation.x=0;bot.body.rotation.z=0;bot.arms.forEach(arm=>arm.rotation.set(0,0,0));bot.forearms.forEach(arm=>arm.rotation.set(0,0,0));});
   hero.body.rotation.x=0;hero.body.rotation.z=0;hero.body.position.z=0;impact.visible=false;
   const waving=wavePose(now-waveStarted);if(waving.active&&!fight){hero.arms.forEach((arm,i)=>{const side=i===0?-1:1;arm.rotation.set(waving.x,0,side*waving.z);hero.forearms[i].rotation.z=side*waving.elbowZ;});}
   if(fight){const pose=fightPose(now-fight.started),target=fight.target;hero.body.rotation.y=Math.atan2(target.group.position.x-hero.group.position.x,target.group.position.z-hero.group.position.z);target.body.rotation.y=hero.body.rotation.y+Math.PI;
    hero.arms[1].rotation.x=-.6-pose.heroPunch*1.2;hero.arms[0].rotation.x=-.65;target.arms[1].rotation.x=-.6-pose.botPunch*1.2;target.arms[0].rotation.x=-.65;
    hero.body.rotation.x=-pose.heroHit*.22;target.body.rotation.x=-pose.botHit*.22;hero.body.position.y+=pose.heroHit*.12;target.body.position.y+=pose.botHit*.12;
    if(pose.heroHit>0||pose.botHit>0){const receiver=pose.botHit>0?target:hero;impact.visible=true;impact.position.copy(receiver.group.position).add(new THREE.Vector3(0,2.1,0));impact.quaternion.copy(camera.quaternion);impact.scale.setScalar(.5+Math.max(pose.heroHit,pose.botHit)*.7);}
    if(pose.finished){fight=null;setCombatStatus('Đã kết thúc giao đấu');}
   }
   selectionRing.visible=Boolean(selectedBot);if(selectedBot)selectionRing.position.set(selectedBot.group.position.x,.235,selectedBot.group.position.z);
   if(bubble)bubble.visible=now<bubbleUntil;
   const marked=pendingSeat||hovered;indicator.visible=Boolean(marked)&&!seated;if(marked)indicator.position.set(marked.x,.235,marked.z);
   look.lerp(new THREE.Vector3(hero.group.position.x,seatedNow?1.25:1.4,hero.group.position.z),1-Math.exp(-7*dt));camera.position.set(look.x+Math.sin(yaw)*distance,look.y+distance*.68,look.z+Math.cos(yaw)*distance);camera.lookAt(look);camera.updateMatrixWorld();

   fishPond.update(now);renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();api.current=null;window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',cancel);canvas.removeEventListener('pointerleave',cancel);canvas.removeEventListener('contextmenu',context);canvas.removeEventListener('wheel',wheel);
   const geometries=new Set(),mats=new Set(),maps=new Set(textures);scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(mat=>{mats.add(mat);if(mat.map)maps.add(mat.map);});}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());maps.forEach(t=>t.dispose());environment.dispose();renderer.dispose();canvas.remove();};
 },[roomName]);
 useEffect(()=>{if(action){if(action.type==='wave')api.current?.wave();else api.current?.emote(action.emoji);}},[action]);
 useEffect(()=>{if(chatText)api.current?.say(chatText.text);},[chatText]);
 return <div ref={host} className="phaser-host game-3d-host" aria-label="Quảng trường 3D: nhấn để đi, chọn ghế đá để ngồi, kéo để xoay camera">{error&&<p role="alert" className="game-3d-error">{error}</p>}<div className="character-actions"><div className="character-action-buttons"><button onClick={()=>api.current?.wave()}>👋 Vẫy tay</button><button disabled={!selectedName||combatStatus.startsWith('Đang')} onClick={()=>api.current?.attack()}>🥊 Chan Nhau</button></div><details className="character-directory"><summary>Danh sách nhân vật · {PLAZA_CHARACTERS.length}</summary><div className="character-directory-list">{PLAZA_CHARACTERS.length===0&&<p className="character-directory-empty">Chưa có nhân vật khác trên bản đồ.</p>}{PLAZA_CHARACTERS.map(character=>character.name).map(name=><button key={name} aria-pressed={selectedName===name} onClick={()=>api.current?.selectBot(name)}><span className="mini-avatar">{name[0]}</span><span>{name.replace(' · Mẫu','')}</span><span className="profile-arrow">›</span></button>)}</div></details>{selectedName&&<div className="character-profile"><div className="profile-title"><strong>{selectedName.replace(' · Mẫu','')}</strong><button aria-label="Đóng thông tin nhân vật" onClick={()=>api.current?.selectBot('')}>×</button></div><dl><div><dt>Phòng</dt><dd>{roomName}</dd></div><div><dt>Trạng thái</dt><dd>{combatStatus||'Đang ở quảng trường'}</dd></div></dl><p>Chọn Vẫy tay hoặc Chan Nhau để tương tác.</p></div>}<small role="status">{combatStatus|| (selectedName?'Đã chọn '+selectedName:'Nhấn nhân vật để chọn mục tiêu')}</small></div><div className="seat-controls"><span role="status">{seatState.mode==='seated'?`Đang ngồi · ${seatState.name}`:seatState.mode==='approaching'?`Đang đi tới ${seatState.name}…`:'Chọn ghế đá để ngồi nghỉ'}</span><button onClick={()=>seatState.mode==='seated'?api.current?.stand():api.current?.nearestSeat()}>{seatState.mode==='seated'?'Đứng dậy':'Ngồi ghế gần nhất'} <kbd>E</kbd></button></div></div>;
}





