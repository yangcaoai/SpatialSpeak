(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const sceneData={
    classroom:{response:["Let me count the blackboard instances.", "• Instance 1: center = (2.4, −0.9, 1.2) m", "• Instance 2: center = (−1.7, −0.1, −0.1) m", "Total count = 2 blackboard object(s).", "<reliability: HIGH>"],file:'fig3_and_fig7',label:'scene0030_00',figure:3,type:'OBJECT COUNTING',question:'How many blackboards are in the scene?',fallback:26,frames:[22,23,24,25],answer:'2',unit:'blackboards',truth:'2',baseline:'3',steps:[['Locate the objects','Identify blackboards across the input views.'],['Estimate 3D object centers','Instance 1: (2.4, −0.9, 1.2) m.<br>Instance 2: (−1.7, −0.1, −0.1) m.'],['Count distinct instances','Two blackboards, with a high reliability estimate.']],view:{yaw:0,pitch:.12,distance:4.0,level:[[0.9998241744505935,0.018715336885183374,0.0011646241725485904],[-0.018715336885183374,0.9921099971432409,0.12396567966059298],[0.0011646241725485904,-0.12396567966059298,0.9922858226926473]]}},
    bathroom:{response:["Let me estimate the distance.", "Trash bin: center = (−3.7, 1.0, 0.3) m", "Dimensions = 0.4 × 0.4 × 0.3 m", "Toilet: center = (0.0, 0.0, 1.6) m", "Dimensions = 0.7 × 0.4 × 0.4 m", "Center distance = 4.0 m", "Radius adjustment = 0.2 m + 0.2 m", "Closest-point distance = 3.6 m", "<reliability: HIGH>"],file:'fig5',assetVersion:'3c779a140f23',label:'scene0441_00',figure:5,type:'METRIC DISTANCE',question:'How far is the trash bin from the toilet?',fallback:31,frames:[32,33,34,35],answer:'3.6',unit:'meters',truth:'3.5 m',baseline:'2.7 m',steps:[['Estimate object geometry','Trash bin center: (−3.7, 1.0, 0.3) m.<br>Toilet center: (0.0, 0.0, 1.6) m.'],['Derive the center distance','The example estimates a center distance of 4.0 m.'],['Account for object size','Subtract approximate radii: 4.0 − 0.2 − 0.2 = 3.6 m.']],view:{yaw:0,pitch:.12,distance:4.7,level:[[0.9918988757406026,-0.12261036300017854,-0.033216248877513295],[0.12261036300017854,0.8557055334136966,0.5027273008004891],[-0.033216248877513295,-0.5027273008004891,0.8638066576730938]]}},
    chairs:{response:["Let me count the chair instances.", "• Instance 1: center = (−1.3, 0.1, 1.9) m", "• Instance 2: center = (−0.5, 0.4, 1.4) m", "• Instance 3: center = (−0.5, 0.1, 2.0) m", "• Instance 4: center = (−1.2, 0.4, 1.2) m", "Total count = 4 chair object(s).", "<reliability: HIGH>"],file:'fig6',label:'scene0578_00',figure:6,type:'OBJECT COUNTING',question:'How many chairs are in the scene?',fallback:36,frames:[40,37,38,39],answer:'4',unit:'chairs',truth:'4',baseline:'6',steps:[['Find chair instances','Inspect the room across multiple input views.'],['Separate objects in 3D','The recorded trace lists four distinct chair centers.'],['Aggregate the count','Four chairs, with a high reliability estimate.']],view:{yaw:0,pitch:.12,distance:4.0,level:[[0.9999998640522677,-0.0005054970618395288,-0.00012793813561995813],[0.0005054970618395288,0.8795994257982932,0.4757148248772928],[-0.00012793813561995813,-0.4757148248772928,0.8795995617460255]]}},
    reconstruction:{file:'fig4',assetVersion:'ea5df7ffc223',label:'scene0086_02',figure:4,type:'RECONSTRUCTION QUALITY',question:'How accurate is the scale of the reconstructed geometry?',fallback:29,frames:[27,29,28,30],answer:'1.24',unit:'meters',truth:'1.25 m',baseline:null,steps:[['Follow the red arrow','Rotate the scene to see the marked span across the sink area.'],['Compare the same marked distance','SpatialSpeak: 1.24 m. Ground truth: 1.25 m.'],['Check the other reconstructions','CUT3R: 1.38 m. MapAnything: 1.63 m.']],note:'The red arrow marks the span across the sink area. Its label reports the paper’s distance.',inputLabel:'COMPARISON VIEWS · GT / OURS / CUT3R / MAPANYTHING',view:{yaw:0,pitch:.12,distance:4.4,level:[[0.9997741854197231,0.020472220264204952,0.005697926445906818],[-0.020472220264204952,0.855999741169239,0.5165707418308257],[0.005697926445906818,-0.5165707418308257,0.856225555749516]]}},
    'reconstruction-b':{file:'fig7',label:'scene0645_00',figure:7,type:'RECONSTRUCTION QUALITY',question:'How accurate is the scale of the reconstructed geometry?',fallback:41,frames:[42,41,43,44],answer:'2.52',unit:'meters',truth:'2.54 m',baseline:null,steps:[['Follow the red arrow','Rotate the scene to see the marked span across the bed.'],['Compare the marked distance','SpatialSpeak: 2.52 m. Ground truth: 2.54 m.'],['Read the baseline estimates','CUT3R: 2.82 m. MapAnything: 2.90 m.']],note:'The red arrow marks the span across the bed. Its label reports the paper’s distance.',inputLabel:'COMPARISON VIEWS · GT / OURS / CUT3R / MAPANYTHING',view:{yaw:0,pitch:.12,distance:4.0,level:[[0.9999202333177712,-0.012496576978221739,-0.001833729958645976],[0.012496576978221739,0.9577652198800324,0.28727968802541637],[-0.001833729958645976,-0.28727968802541637,0.9578449865622611]]}},
  };
  const figureCaptions={1:'SpatialSpeak overview: reconstruction pretraining, spatial reasoning, and ReVSI performance.',2:'Two-stage learning: local and global QA-native reconstruction, followed by spatial CoT with visual compensation.',3:'Blackboard-counting example: SpatialSpeak predicts 2; ground truth is 2.',4:'Qualitative reconstruction comparison: ground truth, SpatialSpeak, CUT3R, and MapAnything.',5:'Object-distance example: SpatialSpeak predicts 3.6 m; ground truth is 3.5 m.',6:'Chair-counting example: SpatialSpeak predicts 4; ground truth is 4.',7:'Detailed reconstruction comparisons across MapAnything, CUT3R, SpatialSpeak, and ground truth.'};
  const measurementViews={"reconstruction": "<img class=\"paper-measurement\" src=\"assets/figures/scene0086_02-ours.svg?v=eab4e9c64280\" alt=\"SpatialSpeak: red arrows mark the 1.24-meter span\" loading=\"lazy\">", "reconstruction-b": "<img class=\"paper-measurement\" src=\"assets/figures/scene0645_00-ours.svg?v=905ba1710ac0\" alt=\"SpatialSpeak: red arrows mark the 2.52-meter bed length\" loading=\"lazy\">"};
  const measurementAnnotations={"reconstruction":{"start":[-0.85,-0.3,1.43],"end":[0.3,-0.67,1.65],"label":"1.24 m","description":"Marked span across the sink area"},"reconstruction-b":{"start":[-0.85,0.55,1.15],"end":[0.7,-0.24,2.7],"label":"2.52 m","description":"Marked span across the bed"}};
  let activeScene='classroom',viewer;
  let rotationRequested=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const updateRotation=()=>{
    const enabled=rotationRequested&&!$('#viewer').classList.contains('measurement-mode');
    viewer?.setAutoRotate(enabled);
    $('#rotate-button').setAttribute('aria-pressed',String(enabled));
    $('#rotate-button').innerHTML=enabled?'Ⅱ <span>Pause rotation</span>':'↻ <span>Auto rotate</span>';
  };
  const state=(status,count)=>{
    const root=$('#viewer'),message=$('#viewer-message');
    root.classList.toggle('is-ready',status==='ready');
    root.classList.toggle('is-unavailable',status==='unavailable'||status==='error');
    $('#point-count').textContent=status==='ready'?`${count.toLocaleString('en-US')} points`:'Paper reconstruction';
    message.textContent=status==='loading'?'Loading 3D scene…':status==='error'?'Scene could not load. Showing the paper preview.':status==='unavailable'?'3D is unavailable in this browser. Showing the paper preview.':'';
    if(status==='ready')message.textContent='';
    ['#rotate-button','#reset-view','#fullscreen-button'].forEach(id=>$(id).disabled=status==='unavailable'||status==='error');
  };
  const setMeasurementMode=enabled=>{
    $('#viewer').classList.toggle('measurement-mode',enabled);
    $('#measurement-preview').hidden=!enabled;
    $('#measurement-toggle').setAttribute('aria-pressed',String(enabled));
    $('#measurement-toggle').textContent=enabled?'Back to 3D':'Paper view';
    $('.viewer-hint').textContent=enabled?'Red arrows mark the measured span':'↔ Drag to rotate · Scroll to zoom';
    updateRotation();
  };
  $('#measurement-toggle').addEventListener('click',()=>setMeasurementMode(!$('#viewer').classList.contains('measurement-mode')));
  const selectScene=id=>{
    if(!sceneData[id])return;activeScene=id;const s=sceneData[id];
    document.querySelectorAll('[role=tab][data-scene]').forEach(tab=>{const selected=tab.dataset.scene===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    $('#scene-panel').setAttribute('aria-labelledby',`tab-${id}`);
    $('#cloud-canvas').setAttribute('aria-label',`${s.label}. Interactive point cloud. Drag or use arrow keys to rotate. Use plus and minus to zoom, R to reset.`);
    $('#cloud-fallback').src=`assets/frames/image${s.fallback}.webp`;$('#cloud-fallback').alt=`Paper preview for ${s.label.toLowerCase()}`;
    $('#example-type').textContent=s.label;$('#scene-question').textContent=s.question;
    $('#example-note').textContent=s.note||'A recorded example from the paper, paired with its reconstruction.';
    $('#reasoning-steps').classList.toggle('plain-response',Boolean(s.response));
    $('#reasoning-steps').innerHTML=s.response?s.response.map(line=>`<li>${line.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</li>`).join(''):s.steps.map(([title,text])=>`<li><strong>${title}</strong>${text}</li>`).join('');
    $('#answer-label').textContent=s.answerLabel||'SpatialSpeak';$('#truth-label').textContent=s.truthLabel||'Ground truth';
    $('#answer-value').innerHTML=`${s.answer} <small>${s.unit}</small>`;$('#truth-value').textContent=s.truth;
    $('#baseline-result').innerHTML=s.baseline?`Without QA-RP and CoT-VC: <strong>${s.baseline}</strong>`:'All values shown are recorded paper results.';
    $('#figure-ref').textContent='';
    $('.views-label>span').textContent=s.inputLabel||'INPUT VIEWS';
    const frames=$('#input-frames');frames.classList.toggle('no-frames',s.frames.length===0);
    frames.innerHTML=s.frames.length?s.frames.map((n,i)=>`<img src="assets/frames/image${n}.webp" alt="${s.label}, ${s.inputLabel?'comparison':'input'} view ${i+1}" width="160" height="120">`).join(''):'Drag the scene to inspect the provided reconstruction.';
    $('#scene-kind').textContent=s.label;
    document.dispatchEvent(new CustomEvent('scenechange',{detail:{id}}));
    $('#view-example-figure').textContent=s.response?'View recorded example ↗':'View full comparison ↗';
    const measurement=measurementViews[id];
    $('#measurement-toggle').hidden=!measurement;
    $('#measurement-preview').innerHTML=measurement||'';
    setMeasurementMode(false);
    if(viewer)viewer.load(`assets/clouds/${s.file}.bin${s.assetVersion?'?v='+s.assetVersion:''}`,s.view,measurementAnnotations[id]);
  };
  document.querySelectorAll('[data-scene]').forEach(tab=>{
    tab.addEventListener('click',()=>selectScene(tab.dataset.scene));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
      const tabs=[...document.querySelectorAll('[data-scene]')],i=tabs.indexOf(tab);
      const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      tabs[n].focus();selectScene(tabs[n].dataset.scene);tabs[n].scrollIntoView({block:'nearest',inline:'nearest'});
    });
  });
  $('#rotate-button').addEventListener('click',()=>{rotationRequested=!rotationRequested;updateRotation();});
  $('#reset-view').addEventListener('click',()=>viewer.reset());
  $('#fullscreen-button').addEventListener('click',async()=>{
    try {if(document.fullscreenElement)await document.exitFullscreen();else if($('#viewer').requestFullscreen)await $('#viewer').requestFullscreen();}
    catch(e){$('#viewer-message').textContent='Full-screen view is unavailable in this browser.';}
  });
  if(!$('#viewer').requestFullscreen)$('#fullscreen-button').hidden=true;
  const dialog=$('#figure-dialog');let lastFigureTrigger=null;
  const showFigure=(n,trigger)=>{lastFigureTrigger=trigger||document.activeElement;$('#dialog-title').textContent=({1:'Research overview',2:'Method',3:'scene0030_00',4:'scene0086_02',5:'scene0441_00',6:'scene0578_00',7:'Reconstruction comparisons'})[n];$('#dialog-image').src=`assets/figures/figure-${n}.svg`;$('#dialog-image').alt=figureCaptions[n];$('#dialog-pdf').href=`assets/figures/figure-${n}.pdf`;$('#dialog-caption').textContent=figureCaptions[n];dialog.showModal();};
  document.querySelectorAll('[data-figure]').forEach(button=>button.addEventListener('click',()=>showFigure(button.dataset.figure,button)));
  $('#view-example-figure').addEventListener('click',e=>showFigure(sceneData[activeScene].figure,e.currentTarget));
  $('#close-figure').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>lastFigureTrigger?.focus({preventScroll:true}));
  document.querySelectorAll('[data-select-scene]').forEach(link=>link.addEventListener('click',()=>selectScene(link.dataset.selectScene)));
  $('#copy-citation').addEventListener('click',async()=>{
    const content=$('#bibtex').textContent;
    try {await navigator.clipboard.writeText(content);$('#copy-citation').textContent='Copied ✓';$('#copy-status').textContent='BibTeX citation copied to clipboard.';setTimeout(()=>{$('#copy-citation').textContent='Copy BibTeX ⧉';},2200);}
    catch(e){const range=document.createRange();range.selectNodeContents($('#bibtex'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('#copy-status').textContent='Citation selected. Press Command+C or Control+C to copy.';$('#copy-citation').textContent='Citation selected';}
  });
  const config=window.SITE_CONFIG||{};
  document.querySelectorAll('[data-resource]').forEach(el=>{
    const key=el.dataset.resource,url=config[key]||(key==='paperUrl'?config.arxivUrl:'');if(!url)return;
    try{
      const parsed=new URL(url,location.href);if(!['http:','https:'].includes(parsed.protocol))return;
      const a=document.createElement('a'),comingSoon=key==='codeUrl'&&config.codeComingSoon;
      a.className=comingSoon?'resource-pending':'button primary';a.href=url;a.target='_blank';a.rel='noopener noreferrer';
      if(comingSoon){a.append(...Array.from(el.childNodes,node=>node.cloneNode(true)));a.append(' ↗');}
      else a.textContent=key==='paperUrl'?'Read the paper ↗':'Code on GitHub ↗';
      el.replaceWith(a);
    }catch(e){console.warn('Invalid public resource URL');}
  });
  if(config.projectUrl){try{const url=new URL(config.projectUrl);if(url.protocol==='https:'){const link=document.createElement('link');link.rel='canonical';link.href=url.href;document.head.append(link);$('meta[property="og:image"]').content=new URL('assets/videos/sample-1.webp',url.href.endsWith('/')?url.href:url.href+'/').href;}}catch(e){}}
  selectScene(activeScene);
  try{viewer=new window.CloudViewer($('#cloud-canvas'),state);viewer.load(`assets/clouds/${sceneData[activeScene].file}.bin`,sceneData[activeScene].view,measurementAnnotations[activeScene]);updateRotation();}catch(e){console.error(e);state('unavailable');}
})();
