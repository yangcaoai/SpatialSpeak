/* Source-coordinate annotations use the same rigid transform as the point cloud. */
((root) => {
  'use strict';
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const mul=(a,s)=>a.map(v=>v*s);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>mul(a,1/(Math.hypot(...a)||1));
  const transform=(point,t)=>{
    const p=point.map((v,i)=>(v-t.center[i])*(i===0?1:-1));
    return t.level.map((row,i)=>(dot(row,p)-t.leveledCenter[i])*t.scale);
  };
  const arrow=(start,end,halo=false)=>{
    const delta=sub(end,start),length=Math.hypot(...delta);
    if(!Number.isFinite(length)||length<1e-6)return new Float32Array();
    const axis=unit(delta),u=unit(cross(axis,Math.abs(axis[1])<.9?[0,1,0]:[1,0,0])),v=cross(axis,u);
    const head=Math.min(.14,length*.18),radius=halo?.020:.015;
    const tipRadius=halo?.064:.055,vertices=[];
    const at=(distance,r,angle)=>add(add(start,mul(axis,distance)),add(mul(u,r*Math.cos(angle)),mul(v,r*Math.sin(angle))));
    const triangle=(a,b,c)=>vertices.push(...a,...b,...c);
    const frustum=(a,b,ra,rb)=>{
      for(let i=0;i<12;i++){
        const t=i*Math.PI/6,n=(i+1)*Math.PI/6;
        const p=at(a,ra,t),q=at(a,ra,n),r=at(b,rb,t),s=at(b,rb,n);
        triangle(p,q,r);triangle(q,s,r);
      }
    };
    frustum(0,head,0,tipRadius);
    frustum(length-head,length,tipRadius,0);
    const inner=length-2*head,dashes=5,step=inner/dashes;
    for(let i=0;i<dashes;i++)frustum(head+i*step,head+(i+.72)*step,radius,radius);
    return new Float32Array(vertices);
  };
  // Matrices are column-major, matching WebGL uniforms.
  const project=(point,view,projection,width,height)=>{
    const multiply=(m,p)=>[0,1,2,3].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]*p[3]);
    const clip=multiply(projection,multiply(view,[...point,1]));
    if(clip[3]<=0||clip[2]<-clip[3]||clip[2]>clip[3])return null;
    return [(clip[0]/clip[3]+1)*width/2,(1-clip[1]/clip[3])*height/2];
  };
  root.CloudAnnotations={transform,arrow,project};
})(typeof window==='undefined'?globalThis:window);
