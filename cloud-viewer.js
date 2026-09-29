/* A dependency-free, colored point-cloud viewer. Coordinates remain in the source
   files; centering, scaling and camera-axis conversion apply only for display. */
(() => {
  'use strict';
  const vertexSource = `
    attribute vec3 position;
    attribute vec3 color;
    uniform mat4 view;
    uniform mat4 projection;
    uniform float pixelRatio;
    varying vec3 pointColor;
    void main() {
      vec4 p = view * vec4(position, 1.0);
      gl_Position = projection * p;
      gl_PointSize = clamp(3.6 * pixelRatio * 4.0 / max(0.1, -p.z), 1.0, 11.0 * pixelRatio);
      pointColor = color;
    }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec3 pointColor;
    void main() {
      float r = length(gl_PointCoord - vec2(0.5));
      if (r > 0.49) discard;
      gl_FragColor = vec4(pointColor, 1.0);
    }
  `;
  const normalize = v => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const clamp = (x,a,b) => Math.min(b,Math.max(a,x));

  class CloudViewer {
    constructor(canvas, onState) {
      this.canvas = canvas;
      this.onState = onState;
      this.gl = canvas.getContext('webgl', {antialias:true,alpha:false,powerPreference:'low-power'});
      this.cache = new Map();
      this.count = 0;
      this.requestId = 0;
      this.visible = true;
      this.autoRotate = false;
      this.pendingFrame = null;
      this.yaw = .15;
      this.pitch = .16;
      this.distance = 4.4;
      this.pointers = new Map();
      this.defaultView = {yaw:.15,pitch:.16,distance:4.4};
      this.measurement = null;
      this.measurementLabel = document.createElement('div');
      this.measurementLabel.className = 'cloud-measurement-label';
      this.measurementLabel.hidden = true;
      this.measurementLabel.setAttribute('role','note');
      canvas.parentElement.append(this.measurementLabel);
      if (!this.gl) { this.onState('unavailable'); return; }
      try { this.initGL(); } catch(e) { console.error(e); this.onState('unavailable'); return; }
      this.ready = true;
      this.resizeObserver = new ResizeObserver(() => this.invalidate());
      this.resizeObserver.observe(canvas);
      this.intersectionObserver = new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting;
        if (this.visible) this.invalidate();
      }, {rootMargin:'80px'});
      this.intersectionObserver.observe(canvas);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.invalidate(); });
      canvas.addEventListener('webglcontextlost', e => {
        e.preventDefault(); this.ready = false; this.onState('unavailable');
        this.measurementLabel.hidden=true;
        cancelAnimationFrame(this.pendingFrame); this.pendingFrame = null;
      });
      canvas.addEventListener('webglcontextrestored', () => {
        try { this.initGL(); this.ready = true; if(this.currentData) { this.upload(this.currentData); this.onState('ready',this.count); } }
        catch(e) { console.error(e); this.onState('unavailable'); }
      });
      this.bindControls();
    }
    initGL() {
      const gl=this.gl;
      const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
      this.program=gl.createProgram();
      const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
      gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);
      if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
      gl.deleteShader(vs);gl.deleteShader(fs);
      gl.useProgram(this.program);
      this.positionLocation=gl.getAttribLocation(this.program,'position');
      this.colorLocation=gl.getAttribLocation(this.program,'color');
      this.viewLocation=gl.getUniformLocation(this.program,'view');
      this.projectionLocation=gl.getUniformLocation(this.program,'projection');
      this.pixelRatioLocation=gl.getUniformLocation(this.program,'pixelRatio');
      this.buffer=gl.createBuffer();
      this.annotationProgram=gl.createProgram();
      const avs=compile(gl.VERTEX_SHADER,'attribute vec3 position; uniform mat4 view; uniform mat4 projection; void main(){gl_Position=projection*view*vec4(position,1.0);}');
      const afs=compile(gl.FRAGMENT_SHADER,'precision mediump float; uniform vec4 color; void main(){gl_FragColor=color;}');
      gl.attachShader(this.annotationProgram,avs);gl.attachShader(this.annotationProgram,afs);gl.linkProgram(this.annotationProgram);
      if(!gl.getProgramParameter(this.annotationProgram,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.annotationProgram));
      gl.deleteShader(avs);gl.deleteShader(afs);
      this.annotationLocations={position:gl.getAttribLocation(this.annotationProgram,'position'),view:gl.getUniformLocation(this.annotationProgram,'view'),projection:gl.getUniformLocation(this.annotationProgram,'projection'),color:gl.getUniformLocation(this.annotationProgram,'color')};
      this.annotationBuffer=gl.createBuffer();
      gl.clearColor(247/255,248/255,251/255,1);
      gl.enable(gl.DEPTH_TEST);
    }
    async load(url, view={}, measurement=null) {
      const requestId=++this.requestId;
      this.measurement=null;
      this.measurementLabel.hidden=true;
      this.defaultView={yaw:.15,pitch:.16,distance:4.4,...view};
      this.reset();
      if(!this.ready) {this.onState('unavailable');return;}
      this.onState('loading');
      this.count=0;this.invalidate();
      try {
        let data=this.cache.get(url);
        if(!data){
          const response=await fetch(url);
          if(!response.ok)throw new Error(`Scene request failed: ${response.status}`);
          const raw=await response.arrayBuffer();
          if(raw.byteLength<4)throw new Error('Invalid point cloud');
          const dv=new DataView(raw),count=dv.getUint32(0,true);
          if(!count||count>1000000||raw.byteLength!==4+count*16)throw new Error('Invalid point count');
          const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
          for(let i=0;i<count;i++)for(let a=0;a<3;a++){
            const value=dv.getFloat32(4+i*16+a*4,true);
            if(!Number.isFinite(value))throw new Error('Invalid coordinate');
            min[a]=Math.min(min[a],value);max[a]=Math.max(max[a],value);
          }
          const center=min.map((v,i)=>(v+max[i])/2);
          const level=view.level||[[1,0,0],[0,1,0],[0,0,1]];
          const leveled=new Float32Array(count*3);
          const boundsMin=[Infinity,Infinity,Infinity],boundsMax=[-Infinity,-Infinity,-Infinity];
          for(let i=0;i<count;i++){
            const point=[0,1,2].map(a=>(dv.getFloat32(4+i*16+a*4,true)-center[a])*(a===0?1:-1));
            for(let a=0;a<3;a++){
              const value=dot(level[a],point);leveled[i*3+a]=value;
              boundsMin[a]=Math.min(boundsMin[a],value);boundsMax[a]=Math.max(boundsMax[a],value);
            }
          }
          const leveledCenter=boundsMin.map((v,i)=>(v+boundsMax[i])/2);
          const scale=2.7/(Math.max(...boundsMax.map((v,i)=>v-boundsMin[i]))||1);
          const packed=new Float32Array(count*6);
          for(let i=0;i<count;i++){
            for(let a=0;a<3;a++)packed[i*6+a]=(leveled[i*3+a]-leveledCenter[a])*scale;
            for(let a=0;a<3;a++)packed[i*6+3+a]=dv.getUint8(4+i*16+12+a)/255;
          }
          data={packed,count,transform:{center,level,leveledCenter,scale}};this.cache.set(url,data);
        }
        if(requestId!==this.requestId)return;
        this.currentData=data;
        if(measurement){
          const start=window.CloudAnnotations.transform(measurement.start,data.transform),end=window.CloudAnnotations.transform(measurement.end,data.transform);
          this.measurement={start,end,midpoint:start.map((v,i)=>(v+end[i])/2),mesh:window.CloudAnnotations.arrow(start,end),halo:window.CloudAnnotations.arrow(start,end,true)};
          this.measurementLabel.textContent=measurement.label;
          this.measurementLabel.setAttribute('aria-label',measurement.description+' '+measurement.label+'. Reported in the paper.');
        }
        this.upload(data);this.onState('ready',data.count);
      } catch(e) {if(requestId===this.requestId){console.error(e);this.onState('error');}}
    }
    upload(data) {
      const gl=this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,data.packed,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.positionLocation);gl.vertexAttribPointer(this.positionLocation,3,gl.FLOAT,false,24,0);
      gl.enableVertexAttribArray(this.colorLocation);gl.vertexAttribPointer(this.colorLocation,3,gl.FLOAT,false,24,12);
      this.count=data.count;this.invalidate();
    }
    reset() { Object.assign(this,this.defaultView);this.invalidate(); }
    setAutoRotate(value) { this.autoRotate=value;this.invalidate(); }
    invalidate() {
      if(!this.ready||this.pendingFrame!==null)return;
      this.pendingFrame=requestAnimationFrame(time=>{this.pendingFrame=null;this.draw(time);});
    }
    draw(time) {
      if(!this.ready||!this.visible||document.hidden)return;
      const gl=this.gl,canvas=this.canvas,rect=canvas.getBoundingClientRect();
      if(rect.width<1||rect.height<1)return;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      if(this.autoRotate&&this.pointers.size===0){const dt=Math.min((time-(this.lastTime||time))/1000,.05);this.yaw+=dt*.12;}
      this.lastTime=time;
      const cameraDistance=this.distance*Math.max(1,h/w);
      const eye=[Math.sin(this.yaw)*Math.cos(this.pitch)*cameraDistance,Math.sin(this.pitch)*cameraDistance,Math.cos(this.yaw)*Math.cos(this.pitch)*cameraDistance];
      const z=normalize(eye),x=normalize(cross([0,1,0],z)),y=cross(z,x);
      const view=new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
      const f=1/Math.tan(Math.PI/8),near=.05,far=50,range=1/(near-far),aspect=w/h;
      const projection=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(near+far)*range,-1,0,0,near*far*2*range,0]);
      gl.useProgram(this.program);gl.uniformMatrix4fv(this.viewLocation,false,view);gl.uniformMatrix4fv(this.projectionLocation,false,projection);gl.uniform1f(this.pixelRatioLocation,dpr);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
      gl.enableVertexAttribArray(this.positionLocation);gl.vertexAttribPointer(this.positionLocation,3,gl.FLOAT,false,24,0);
      gl.enableVertexAttribArray(this.colorLocation);gl.vertexAttribPointer(this.colorLocation,3,gl.FLOAT,false,24,12);
      if(this.count)gl.drawArrays(gl.POINTS,0,this.count);
      this.drawMeasurement(view,projection,rect.width,rect.height);
      if(this.autoRotate)this.invalidate();
    }
    drawMeasurement(view,projection,width,height) {
      this.measurementLabel.hidden=true;
      if(!this.measurement||!this.count)return;
      const gl=this.gl,m=this.measurement,loc=this.annotationLocations;
      // Dimension graphics remain legible through sparse surfaces, while their
      // vertices and endpoints rotate in world space with the reconstruction.
      gl.disable(gl.DEPTH_TEST);gl.useProgram(this.annotationProgram);
      gl.uniformMatrix4fv(loc.view,false,view);gl.uniformMatrix4fv(loc.projection,false,projection);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.annotationBuffer);
      gl.disableVertexAttribArray(this.colorLocation);
      gl.enableVertexAttribArray(loc.position);gl.vertexAttribPointer(loc.position,3,gl.FLOAT,false,12,0);
      for(const [mesh,color] of [[m.halo,[1,1,1,1]],[m.mesh,[.9,.08,.12,1]]]){
        gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.DYNAMIC_DRAW);gl.uniform4fv(loc.color,color);gl.drawArrays(gl.TRIANGLES,0,mesh.length/3);
      }
      gl.enable(gl.DEPTH_TEST);
      const point=window.CloudAnnotations.project(m.midpoint,view,projection,width,height);
      if(point&&point[0]>=0&&point[0]<=width&&point[1]>=0&&point[1]<=height){
        this.measurementLabel.hidden=false;
        this.measurementLabel.style.left=point[0]+'px';this.measurementLabel.style.top=(point[1]-17)+'px';
      }
    }
    bindControls() {
      const c=this.canvas;
      c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.pinchDistance=null;c.focus({preventScroll:true});});
      c.addEventListener('pointermove',e=>{
        const prev=this.pointers.get(e.pointerId);if(!prev)return;
        const dx=e.clientX-prev.x,dy=e.clientY-prev.y;
        this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(this.pointers.size===2){const [a,b]=Array.from(this.pointers.values());const d=Math.hypot(a.x-b.x,a.y-b.y);if(this.pinchDistance)this.distance=clamp(this.distance*this.pinchDistance/Math.max(d,1),1.2,10);this.pinchDistance=d;}
        else{this.yaw-=dx*.007;this.pitch=clamp(this.pitch+dy*.006,-1.35,1.35);}
        this.invalidate();
      });
      const end=e=>{this.pointers.delete(e.pointerId);this.pinchDistance=null;};
      c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);c.addEventListener('lostpointercapture',end);
      c.addEventListener('wheel',e=>{e.preventDefault();this.distance=clamp(this.distance*Math.exp(e.deltaY*.001),1.2,10);this.invalidate();},{passive:false});
      c.addEventListener('keydown',e=>{
        const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'];if(!keys.includes(e.key))return;e.preventDefault();
        if(e.key==='ArrowLeft')this.yaw-=.12;if(e.key==='ArrowRight')this.yaw+=.12;
        if(e.key==='ArrowUp')this.pitch=clamp(this.pitch+.1,-1.35,1.35);if(e.key==='ArrowDown')this.pitch=clamp(this.pitch-.1,-1.35,1.35);
        if(e.key==='+'||e.key==='=')this.distance=clamp(this.distance*.9,1.2,10);if(e.key==='-')this.distance=clamp(this.distance*1.1,1.2,10);
        if(e.key.toLowerCase()==='r')this.reset();this.invalidate();
      });
    }
  }
  window.CloudViewer=CloudViewer;
})();
