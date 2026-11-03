import * as THREE from 'three';

export const POND_POSITION={x:14,z:15,r:5.15};
export function createFishPond(){
 const group=new THREE.Group();group.position.set(POND_POSITION.x,0,POND_POSITION.z);group.name='Ao cá koi';
 const mats=new Map();function mat(color){if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.78}));return mats.get(color);}
 function mesh(geometry,color,x,y,z,parent=group){const m=new THREE.Mesh(geometry,color?.isMaterial?color:mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const sphere=(r,color,x,y,z,p)=>mesh(new THREE.SphereGeometry(r,16,10),color,x,y,z,p);
 mesh(new THREE.CylinderGeometry(4.7,4.85,.25,64),0x999c8d,0,.345,0);
 mesh(new THREE.CylinderGeometry(4.5,4.75,.62,64,1,true),0x8a9385,0,.7,0);
 mesh(new THREE.CylinderGeometry(4.43,4.43,.035,64),0x5b8274,0,.49,0);
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const rock=mesh(new THREE.DodecahedronGeometry(.35,1),i%3?0xabb1a0:0xc1bba7,Math.cos(a)*4.55,1.01,Math.sin(a)*4.55);rock.scale.set(1.15,.65,.9);rock.rotation.y=a;}
 // Semi-transparent moving water keeps the fish visible underneath.
 const waterMaterial=new THREE.MeshPhysicalMaterial({color:0x78bcb0,roughness:.22,metalness:.06,transparent:true,opacity:.37,depthWrite:false,clearcoat:.8,clearcoatRoughness:.18,side:THREE.DoubleSide});
 const waterGeometry=new THREE.CircleGeometry(4.38,80,1);const water=mesh(waterGeometry,waterMaterial,0,.96,0);water.rotation.x=-Math.PI/2;water.castShadow=false;water.renderOrder=3;
 const fish=[];
 const tailGeometry=new THREE.BufferGeometry();tailGeometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.2,.025,-.26,.2,.025,-.26],3));tailGeometry.computeVertexNormals();
 for(let i=0;i<9;i++){const koi=new THREE.Group();group.add(koi);const color=[0xe8833d,0xf2e6cf,0xf4b14f][i%3];const body=sphere(1,color,0,0,0,koi);body.scale.set(.14,.095,.34);
  const head=sphere(.12,color,0,0,.24,koi);head.scale.set(.95,.8,1);
  for(const x of [-.085,.085])sphere(.018,0x26352f,x,.045,.29,koi);
  const patch=sphere(.1,i%2?0xcb5b34:0xf8e7cc,.015,.062,.05,koi);patch.scale.set(.85,.35,1.5);
  const tail=mesh(tailGeometry,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.65}),0,0,-.3,koi);
  for(const side of [-1,1]){const fin=mesh(tailGeometry,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.75}),side*.1,0,.02,koi);fin.scale.set(.5,.7,.45);fin.rotation.y=side*1.1;}
  koi.scale.setScalar(.9+(i%3)*.2);fish.push({group:koi,tail,phase:i/9*Math.PI*2,radius:1.4+(i%4)*.65,speed:.14+(i%3)*.045});
 }
 // Water lilies, flowers and reeds along the bank.
 for(let i=0;i<6;i++){const a=2+i*.21,r=3.1+(i%2)*.35;const pad=mesh(new THREE.CircleGeometry(.3,24,0,Math.PI*1.88),0x567e49,Math.cos(a)*r,1.005,Math.sin(a)*r);pad.rotation.x=-Math.PI/2;pad.rotation.z=a;pad.castShadow=false;if(i%2===0){for(let j=0;j<7;j++){const b=j/7*Math.PI*2,p=sphere(.1,0xefbdc6,Math.cos(a)*r+Math.cos(b)*.1,1.065,Math.sin(a)*r+Math.sin(b)*.1);p.scale.set(.5,1.1,1);p.rotation.z=Math.cos(b)*.6;}sphere(.065,0xf0ce78,Math.cos(a)*r,1.12,Math.sin(a)*r);}}
 for(let i=0;i<16;i++){const a=3.3+i*.07,x=Math.cos(a)*4.65,z=Math.sin(a)*4.65,h=.55+(i%4)*.14;const stem=mesh(new THREE.CylinderGeometry(.018,.025,h,5),0x688052,x,1+h/2,z);stem.rotation.z=Math.sin(i)*.15;if(i%3===0)mesh(new THREE.CylinderGeometry(.055,.055,.2,8),0x7f6743,x,1+h,z);}
 const ripples=[];for(let i=0;i<3;i++){const ripple=mesh(new THREE.RingGeometry(.95,1,48),new THREE.MeshBasicMaterial({color:0xd6eee0,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}),i===0?-.8:1.1,1.015,i===2?1.3:-1);ripple.rotation.x=-Math.PI/2;ripple.castShadow=false;ripple.renderOrder=4;ripples.push(ripple);}
 function update(time){const seconds=time/1000;
  for(const koi of fish){const a=koi.phase+seconds*koi.speed;koi.group.position.set(Math.cos(a)*koi.radius,.73+Math.sin(seconds*.9+koi.phase)*.035,Math.sin(a)*koi.radius*.82);koi.group.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a)*.82);koi.tail.rotation.y=Math.sin(seconds*8+koi.phase)*.4;}
  ripples.forEach((ripple,i)=>{const t=(seconds*.24+i/3)%1;ripple.scale.setScalar(.3+t*1.1);ripple.material.opacity=(1-t)*.22;});
  const vertices=waterGeometry.attributes.position;for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),y=vertices.getY(i);vertices.setZ(i,Math.sin(x*2+seconds*.9)*Math.cos(y*1.8-seconds*.6)*.014);}vertices.needsUpdate=true;waterGeometry.computeVertexNormals();
 }
 update(0);return {group,update,fish,obstacle:{...POND_POSITION}};
}
