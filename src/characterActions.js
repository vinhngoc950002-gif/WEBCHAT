import {planPath} from './plazaNavigation.js';
const pulse=(time,start,duration)=>time<start||time>start+duration?0:Math.sin((time-start)/duration*Math.PI);
export function wavePose(elapsed){
 const active=elapsed>=0&&elapsed<3200;
 const blend=active?Math.min(1,elapsed/250,(3200-elapsed)/350):0;
 return {active,x:-.25*blend,z:(1.95+Math.sin(elapsed*.014)*.12)*blend,elbowZ:(1.25+Math.sin(elapsed*.018)*.38)*blend};
}
export function fightPose(elapsed){return {finished:elapsed>=2500,heroPunch:Math.max(pulse(elapsed,160,480),pulse(elapsed,1640,480)),botPunch:pulse(elapsed,920,480),heroHit:pulse(elapsed,1100,360),botHit:Math.max(pulse(elapsed,340,360),pulse(elapsed,1820,360))};}
export function planEncounter(start,target,obstacles){
 const angle=Math.atan2(start.x-target.x,start.z-target.z);let best=null;
 for(let i=0;i<16;i++){const a=angle+i*Math.PI/8,goal={x:target.x+Math.sin(a)*1.35,z:target.z+Math.cos(a)*1.35},path=planPath(start,goal,obstacles);if(!path.length)continue;let previous=start,length=0;for(const point of path){length+=Math.hypot(point.x-previous.x,point.z-previous.z);previous=point;}if(!best||length<best.length)best={path,length,goal};}
 return best;
}
