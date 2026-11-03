import * as THREE from 'three';
import {createLongAnMonument} from './longAnMonument.js';

// Code-native miniatures: no remote models or textures required.
export function createLandmark(info){
 const root=new THREE.Group();root.name=info.name;
 const v=info.variant;
 const stone=0xd5c5a8,brick=0xb9613d,roof=0x9a493c,gold=0xd6ad58,bronze=0x698378;
 const mats=new Map();
 function add(geometry,color,x=0,y=0,z=0,parent=root){if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.76}));const m=new THREE.Mesh(geometry,mats.get(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,c,x=0,y=h/2,z=0,p)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
 const ball=(r,c,x,y,z,p)=>add(new THREE.SphereGeometry(r,16,12),c,x,y,z,p);
 const cyl=(rt,rb,h,c,x=0,y=h/2,z=0,p)=>add(new THREE.CylinderGeometry(rt,rb,h,24),c,x,y,z,p);
 function beam(a,b,width,color,parent=root){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const m=add(new THREE.CylinderGeometry(width,width,delta.length(),10),color,0,0,0,parent);m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
 function hip(w,d,y,color=roof,x=0,z=0,h=.8){const m=add(new THREE.ConeGeometry(1,h,4),color,x,y,z);m.rotation.y=Math.PI/4;m.scale.set(w/Math.SQRT2,1,d/Math.SQRT2);return m;}
 function steps(width=5){for(let i=0;i<3;i++)box(width-i*.45,.2,width-i*.45,stone,0,.1+i*.2,0);}
 function arch(x,y,z,width,height,color=0x373d43){box(width,height,.06,color,x,y,z);ball(width/2,color,x,y+height/2,z).scale.set(1,1,.08);}
 function person(x,y,z,scale=1,raised=false,color=bronze){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);root.add(group);cyl(.3,.45,1.4,color,0,1.55,0,group);ball(.32,color,0,2.55,0,group);[-.22,.22].forEach(px=>beam([px,.1,0],[px,1,0],.14,color,group));beam([-.3,2,0],[-.7,1.2,.1],.13,color,group);beam([.3,2,0],raised?[.85,3,.1]:[.7,1.2,.1],.13,color,group);return group;}
 function temple(){steps(7);const width=5+(v%3)*.45;box(width,1.8,3,0xe6cd88,0,1.5);for(let x=-2;x<=2;x++)box(.38,1.7,.1,0x784237,x,1.4,1.55);hip(width+1,4,2.6,roof,0,0,1);hip(width+.45,3.5,3.15,roof,0,0,.8);for(const x of [-width/2,width/2])ball(.15,gold,x,3,0);if(v%2===1){box(2,1.4,1.8,0xe8d4a0,0,3.35,0);hip(3.3,2.7,4.25,roof);}for(const x of [-2.8,2.8])cyl(.15,.15,1.8,brick,x,1.2,2.4);}
 function pagoda(){steps(4);const levels=Math.max(3,v);for(let i=0;i<levels;i++){const w=2.7-i*(1.6/levels),y=.65+i*.47;box(w,.4,w,v===11?brick:stone,0,y+.2);if(v===11){box(w+.14,.1,w+.14,brick,0,y+.45);}else hip(w+.55,w+.55,y+.5,v===14?0x8c745d:roof,0,0,.32);for(const x of [-w*.27,w*.27])arch(x,y+.18,w/2+.02,.17,.22);}cyl(0,.17,.7,gold,0,.75+levels*.47);}
 function cham(){steps(5);const count=v===4?3:v===2?2:1;for(let i=0;i<count;i++){const x=(i-(count-1)/2)*2.3,h=i===0?4.5:3.5;box(1.9,h,2.1,brick,x,.6+h/2,0);for(let k=0;k<4;k++)box(2-k*.35,.45,2.2-k*.35,brick,x,h+.8+k*.4,0);arch(x,1.7,1.065,.7,1.5,0x492f2b);for(const dx of [-.8,-.6,.6,.8])box(.13,h,.18,0xcf7950,x+dx,.6+h/2,1.1);cyl(0,.2,.7,stone,x,h+2.4,0);}}
 function statue(){steps(4.8);box(2.8,1.25,2.6,0x9b7561,0,1.2);const p=person(0,1.9,0,1.3,v!==2);if(v===1){hip(1.4,1,5.55,bronze,0,0,.3);beam([.6,3.2,0],[1.6,5.8,0],.06,bronze);}if(v===2){p.scale.set(1.4,1.45,1.2);cyl(.32,.7,1.5,bronze,0,3,0);beam([.6,3.9,0],[1.2,6.4,0],.05,bronze);box(1.2,.8,.07,bronze,1.8,6,0);}if(v>=3){box(4.8,2,.35,0xa48a68,0,1.6,-1.5);for(let i=0;i<5;i++)box(.35,.5+(i%3)*.2,.15,stone,-1.6+i*.8,1.8,-1.27);}}
 function victory(){steps(5.5);box(4.2,1.1,3.4,0xa17762,0,1.05);for(let i=0;i<3;i++)person((i-1)*1.05,1.6,Math.abs(i-1)*.18,1+i*.06,i===1);const height=5.6+(v%3)*.3;beam([.3,3,0],[.9,height,0],.06,bronze);box(1.8,1.1,.09,bronze,1.75,height-.45,0);if(v===4){for(const x of [-2.2,2.2])box(.35,4,.4,stone,x,2.5,-1);}}
 function flag(){steps(5);if(v===2){cyl(1.6,1.9,2,stone,0,1.5);for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.5,.45,.5,stone,Math.cos(a)*1.5,2.65,Math.sin(a)*1.5);}}else{box(3,2,3,brick,0,1.6);hip(3.5,3.5,2.8,roof,0,0,.5);}cyl(.06,.09,4.7,0xc7c9c5,0,4.8);box(1.8,1.1,.06,0xd52f35,.92,6.45,0);const star=new THREE.Shape();for(let i=0;i<10;i++){const angle=Math.PI/2+i*Math.PI/5,r=i%2?.14:.34;const x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(i===0)star.moveTo(x,y);else star.lineTo(x,y);}star.closePath();add(new THREE.ShapeGeometry(star),0xffdd44,.92,6.45,.04);}
 function lake(){cyl(3.5,3.7,.2,0x61bfcc,0,.25);const count=v===7?7:3;for(let i=0;i<count;i++){const a=i/count*Math.PI*2,r=1.4+(i%2)*.8;const rock=add(new THREE.DodecahedronGeometry(1,0),0x7b9580,Math.cos(a)*r,1.1+(i%3)*.25,Math.sin(a)*r);rock.scale.set(.7+(i%2)*.3,1.6+(i%3)*.35,.8);}if(v===3){box(1.3,.2,.45,0x886243,0,.55,2.4);}}
 function waterfall(){cyl(3.5,3.5,.2,0x67c5d8,0,.2);for(let i=0;i<5;i++){const height=v===3?2.1+(i%3)*.65:3.4;box(1.35,height,2,0x718279,-2.6+i*1.3,.4+height/2,-.7);box(1,.12,2.1,0x57a7ae,-2.6+i*1.3,.5+height,-.6);box(.9,height,.12,0xd4f1ee,-2.6+i*1.3,.4+height/2,.36);for(let j=0;j<3;j++)ball(.16,0xf0ffff,-2.6+i*1.3+(j-1)*.28,.42,.55);} }
 function bridge(dragon=false,covered=false){box(8,.22,4,0x67bbc7,0,.3);box(7,.32,1.7,0xcac4b1,0,1.1);for(const x of [-2.5,0,2.5])box(.35,1.2,1.5,stone,x,.6);for(const z of [-.85,.85]){for(let i=0;i<17;i++){const x=-3.3+i*.41;const y=1.5+Math.sin(i/16*Math.PI)*(v===2?.65:1.2);ball(.1,dragon?0xf2bf3b:0xe7d7b1,x,y,z);if(i)beam([x-.41,1.5+Math.sin((i-1)/16*Math.PI)*(v===2?.65:1.2),z],[x,y,z],.09,dragon?0xf2bf3b:0xe7d7b1);beam([x,1.2,z],[x,y,z],.025,dragon?gold:stone);}}if(dragon){const curve=new THREE.CatmullRomCurve3(Array.from({length:22},(_,i)=>new THREE.Vector3(-3.3+i*.3,2.4+Math.sin(i*.5)*.5,0)));add(new THREE.TubeGeometry(curve,60,.19,8,false),0xe9ad2d);const head=ball(.48,0xf4bd3b,3,2.4,0);head.scale.set(1.4,.8,.7);box(.7,.22,.5,0xe6a52a,3.55,2.3,0);for(const z of [-.27,.27]){ball(.08,0x342f31,3.18,2.6,z);beam([2.8,2.65,z],[2.55,3.3,z],.06,gold);}}if(covered){for(const x of [-2.6,-1.3,0,1.3,2.6])for(const z of [-.65,.65])box(.12,1.6,.12,0x663f30,x,2,z);hip(7.8,2.8,3,roof,0,0,1);}}
 function gate(){steps(7);const c=v===3?0x8c9085:brick;const h=v===3?2.5:2.1;box(7,h,2,c,0,h/2+.6);for(const x of [-2.1,0,2.1])arch(x,1.25,1.04,v===3?1.25:.85,1.05);if(v!==3){box(3,1.5,1.8,stone,0,h+1.3);arch(0,h+1.2,.94,.7,.8);hip(4,3,h+2.3,roof);}else for(let i=0;i<7;i++)box(.65,.3,2,c,-3+i,3.3);}
 function church(){steps(6);box(4,2.7,2.5,0xf4dea6,0,2);for(const x of [-2.1,2.1]){box(1.1,5,1.5,0xe9c587,x,3.1,.3);box(1.35,.3,1.8,0xf1dfa9,x,5.2,.3);hip(1.5,1.7,6.1,0xa84d4e,x,.3,1.4);arch(x,4.2,1.08,.45,.8);cyl(.03,.03,.6,gold,x,7,.3);}for(const x of [-1,0,1])arch(x,1.4,1.29,.6,1.2);hip(4,3,4.1,roof);ball(.4,0x6fadc1,0,3.35,1.3).scale.z=.1;}
 function lotus(flower=false){steps(5);cyl(1.7,2,.8,0xd8c5a0,0,1);for(let i=0;i<(flower?12:8);i++){const a=i/(flower?12:8)*Math.PI*2;const petal=add(new THREE.SphereGeometry(1,16,12),flower?0xf1bb36:0xe99eac,Math.cos(a)*1.1,2.35,Math.sin(a)*1.1);petal.scale.set(.5,1.65,.27);petal.rotation.set(Math.sin(a)*.65,0,-Math.cos(a)*.65);}ball(.8,flower?0x927c36:0xf4d88e,0,2.7,0);if(flower)for(let i=0;i<5;i++)box(.08,2.4,.08,0x8ab4b8,(i-2)*.25,2.2,1.12);}
 function mountain(){cyl(3.4,3.6,.25,0x658a61,0,.3);const count=info.type==='summit'?3:v===2?2:4;for(let i=0;i<count;i++){const rock=add(new THREE.ConeGeometry(1.65,3.5+(i%3),5),0x7c927c,(i-(count-1)/2)*1.5,2.1+(i%3)*.5,-(i%2)*.9);rock.rotation.y=i*.7;}if(info.type==='summit'){add(new THREE.ConeGeometry(.55,.9,3),0xc6cccb,0,4.9,0);cyl(.04,.04,1.4,stone,.8,5.2,0);box(.7,.4,.05,0xda3a36,1.15,5.6,0);}}
 switch(info.type){
 case 'longAn':root.add(createLongAnMonument());break;
 case 'temple':temple();break;
 case 'pagoda':pagoda();break;
 case 'cham':cham();break;
 case 'statue':statue();break;
 case 'victory':victory();break;
 case 'flag':flag();break;
 case 'lake':lake();break;
 case 'waterfall':waterfall();break;
 case 'bridge':bridge();break;
 case 'dragon':bridge(true);break;
 case 'coveredBridge':bridge(false,true);break;
 case 'gate':gate();break;
 case 'mountain':case 'summit':mountain();break;
 case 'lotus':lotus();break;
 case 'flower':lotus(true);break;
 case 'caodai':church();break;
 case 'christ':{steps(4);cyl(1.1,1.4,1.4,stone,0,1.3);cyl(.45,.9,2.5,0xf3f0dc,0,3.1);ball(.4,0xf3f0dc,0,4.8,0);beam([-2.4,4.3,0],[2.4,4.3,0],.16,0xf3f0dc);box(.5,.5,.5,0xf3f0dc,0,4.15);break;}
 case 'reclining':{steps(7);box(6,.6,2,brick,0,.9);const body=ball(1,0xf1dfbc,0,1.8,0);body.scale.set(2.5,.55,.6);ball(.62,0xf1dfbc,-2.2,2,0);ball(.45,0x433a2f,-2.5,2.22,0);beam([-1.5,1.8,.5],[-2.2,2.3,.5],.15,0xf1dfbc);break;}
 case 'lute':{steps(4);cyl(.8,.9,.5,stone,0,.9);const body=cyl(1.2,1.2,.4,0xe4ad4a,0,2.3);body.rotation.x=Math.PI/2;box(.24,3.6,.25,0xb67c34,0,4.5);for(const x of [-.09,.09])beam([x,1.5,.24],[x,6.4,.24],.013,0x463529);for(let i=0;i<4;i++)box(.8,.09,.1,gold,0,5.4+i*.25);break;}
 case 'tank':{steps(5.5);box(4.5,1.4,3,stone,0,1.3);for(const z of [-1,1])box(3,.6,.5,0x384c41,0,2.2,z);box(3.2,.6,1.8,0x607356,0,2.6);box(1.4,.6,1.3,0x607356,-.25,3.15);beam([0,3.3,0],[2.8,3.5,0],.1,0x607356);break;}
 case 'turtle':{cyl(3.1,3.1,.18,0x6fbcb7,0,.24);cyl(1.9,2.2,.35,0x8e9b75,0,.5);for(let i=0;i<3;i++){const w=3.5-i*.65,y=.7+i*1.15;box(w,1.1,w*.7,stone,0,y+.55);for(const x of [-w*.29,0,w*.29])arch(x,y+.4,w*.35+.03,.42,.5);box(w+.15,.13,w*.7+.2,0xc8bca4,0,y+1.12);}hip(2.4,1.9,4.4,0x7d806e,0,0,.8);break;}
 case 'house':{steps(6);box(5,2.5,3,0xf3e6bc,0,1.9);for(const x of [-1.7,0,1.7]){box(.15,2.5,.2,stone,x,1.9,1.65);arch(x,1.6,1.54,.8,1.3,0x664735);}hip(6.5,4,3.5,0x934e3a,0,0,.9);for(const x of [-2.6,2.6])box(.4,.7,.4,stone,x,3.8);break;}
 case 'shrine':{const rock=add(new THREE.DodecahedronGeometry(2.2,0),0x8b9082,0,1.5,0);rock.scale.y=.8;box(2.5,1.5,2,0xe6c779,0,3.2);hip(3.5,3,4.2,roof);for(let i=0;i<5;i++)box(1,.22,.5,stone,1.8-i*.1,.4+i*.4,2.7-i*.45);break;}
 case 'rong':case 'stilt':{const tall=info.type==='rong';for(const x of [-2,0,2])for(const z of [-1,1])cyl(.1,.14,1.3,0x805832,x,.85,z);box(4.5,1.5,2.8,0xb99461,0,2);hip(5.6,3.5,tall?4.9:3.4,0xa77c44,0,0,tall?5.2:1.4);for(let i=0;i<5;i++)box(1,.18,.4,0x9c754c,0,.3+i*.22,2.8-i*.3);break;}
 case 'theatre':{steps(7);box(6,2.6,3,0xf0dfaa,0,1.9);for(let i=0;i<6;i++)cyl(.13,.15,2.3,stone,-2.5+i,1.9,1.8);box(6.5,.3,3.6,stone,0,3.3);const front=add(new THREE.ConeGeometry(1,.9,3),stone,0,3.8,1.8);front.rotation.z=0;front.scale.set(3.7,1,.13);hip(7,4,3.9,0x727a7d);break;}
 case 'khmer':{steps(6);box(4,2,3,0xf1d49a,0,1.6);for(let i=0;i<3;i++)hip(5-i*.65,4-i*.5,2.9+i*.45,v===1?0xc1793c:0xa85435,0,0,.9);for(const x of [-2,0,2])cyl(0,.22,1.5,gold,x,4.25,0);arch(0,1.4,1.54,1,1.2);for(const x of [-2,2])beam([x,.6,2],[x,2.6,1.6],.1,gold);break;}
 case 'bellTower':{steps(5);for(let level=0;level<3;level++){const w=4-level*.5;for(const x of [-w/2+.3,w/2-.3])for(const z of [-1,1])box(.2,1.1,.2,0x694936,x,1.2+level*1.1,z);hip(w+1,3.5-level*.3,1.9+level*1.1,0x785b45);}cyl(.4,.55,.8,bronze,0,2.8);break;}
 case 'memorial':{steps(5);box(4,1.4,2.5,stone,0,1.3);for(const x of [-1.5,0,1.5])box(.65,4-Math.abs(x)*.6,.7,0xd2c7af,x,3,-.7);person(-.7,2,0,.75,true);person(.7,2,0,.75);break;}
 case 'imperial':{steps(8);box(8,2.2,3,0xc99764,0,1.7);for(const x of [-2.5,-1.25,0,1.25,2.5])arch(x,1.35,1.54,.65,1.1);for(const x of [-2.6,0,2.6]){box(2.1,1.3,2,0xb84936,x,3.5);hip(3.2,3.3,4.4,x===0?0xd4a43d:0x557d67,x,0,.9);}hip(3,3,5,0xd4a43d,0,0,.65);break;}
 case 'market':{steps(7);box(7,1.6,3,0xe3c884,0,1.4);hip(8,4,2.6,roof,0,0,1);box(1.8,3.5,1.4,0xe8d4a6,0,2.35,1.6);arch(0,1.3,2.33,1,1.1);const clock=cyl(.42,.42,.06,0xf7f0d8,0,3.5,2.34);clock.rotation.x=Math.PI/2;beam([0,3.5,2.39],[0,3.78,2.39],.025,0x303a3e);beam([0,3.5,2.39],[.23,3.5,2.39],.025,0x303a3e);hip(2.5,2,4.3,roof,0,1.6,.9);break;}
 case 'terraces':{for(let i=0;i<7;i++){const m=cyl(3.4-i*.38,3.6-i*.38,.5,i%2?0xd9bc55:0x9bbd57,0,.4+i*.48);m.scale.z=.72;}box(.75,.6,.65,0x986c44,.2,3.7);hip(1.2,1,4.15,0x765740,.2,0,.65);break;}
 default:throw new Error(`Unknown landmark type: ${info.type}`);
 }
 // Normalize all silhouettes so room-to-room camera and collision stay consistent.
 root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const scale=Math.min(7.4/size.x,7.4/size.z,7.5/size.y);
 for(const child of root.children)child.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));
 root.scale.setScalar(scale);root.position.y=.35;root.updateMatrixWorld(true);
 return root;
}

