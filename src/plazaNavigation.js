// Navigation and bench coordinates are shared by pointer, keyboard and touch controls.
export const WORLD_LIMIT=34;
export function seatPose(bench){
 const forward={x:Math.sin(bench.angle),z:Math.cos(bench.angle)};
 return {position:{x:bench.x,z:bench.z+.0},approach:{x:bench.x+forward.x*2.5,z:bench.z+forward.z*2.5},exit:{x:bench.x+forward.x*2.5,z:bench.z+forward.z*2.5},angle:bench.angle};
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function walkable(point,obstacles,padding=.12){return Math.abs(point.x)<=WORLD_LIMIT&&Math.abs(point.z)<=WORLD_LIMIT&&!obstacles.some(o=>distance(point,o)<o.r+padding);}
function clearLine(a,b,obstacles){const n=Math.max(1,Math.ceil(distance(a,b)*4));for(let i=1;i<=n;i++){if(!walkable({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},obstacles))return false;}return true;}
export function planPath(start,goal,obstacles){
 if(!walkable(goal,obstacles))return [];
 if(clearLine(start,goal,obstacles))return [goal];
 const key=(x,z)=>`${x},${z}`;
 const origin={x:Math.round(start.x),z:Math.round(start.z),g:0};origin.f=distance(origin,goal);
 const open=[origin],nodes=new Map([[key(origin.x,origin.z),origin]]),closed=new Set();let finish=null;
 for(let iterations=0;open.length&&iterations<6500;iterations++){
  let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;
  const current=open.splice(best,1)[0],id=key(current.x,current.z);if(closed.has(id))continue;closed.add(id);
  if(distance(current,goal)<1.6&&clearLine(current,goal,obstacles)){finish=current;break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const next={x:current.x+dx,z:current.z+dz},nextId=key(next.x,next.z);
   if(closed.has(nextId)||!clearLine(current,next,obstacles))continue;
   const g=current.g+Math.hypot(dx,dz),old=nodes.get(nextId);if(old&&old.g<=g)continue;
   const node={...next,g,f:g+distance(next,goal),parent:current};nodes.set(nextId,node);open.push(node);
  }
 }
 if(!finish)return [];
 const raw=[goal];for(let n=finish;n?.parent;n=n.parent)raw.unshift({x:n.x,z:n.z});
 const path=[];let from=start,index=0;
 while(index<raw.length){let last=index;for(let i=index;i<raw.length&&clearLine(from,raw[i],obstacles);i++)last=i;path.push(raw[last]);from=raw[last];index=last+1;}
 return path;
}
