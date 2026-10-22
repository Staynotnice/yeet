(() => {
  "use strict";
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const $ = id => document.getElementById(id);
  const ui = {
    time:$("world-time"), healthText:$("health-text"), healthBar:$("health-bar"),
    staminaText:$("stamina-text"), staminaBar:$("stamina-bar"), shards:$("shard-count"),
    questDesc:$("quest-desc"), progress:$("quest-progress"), progressText:$("quest-progress-text"),
    toast:$("toast"), hint:$("interaction-hint"), region:$("region-name"),
    center:$("center-message"), continueBtn:$("continue-btn")
  };
  const WORLD = {w:2400,h:1800};
  let W=innerWidth,H=innerHeight,dpr=1,last=0,toastTimer=0,elapsed=0;
  let keys={},touch={},sprintTouch=false;
  const player={x:WORLD.w/2,y:WORLD.h/2+130,r:12,speed:190,stamina:100,health:100,shards:0,faceX:0,faceY:-1,walk:0};
  let camera={x:0,y:0};
  let complete=false;
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  // Stable world generation: the same landmarks appear on every visit.
  let seed=92831;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  const trees=[],rocks=[],flowers=[],shards=[],landmarks=[];
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  const safeZones=[
    {x:WORLD.w/2,y:WORLD.h/2+130,r:150},
    {x:WORLD.w/2-270,y:WORLD.h/2-210,r:95}
  ];
  for(let i=0;i<330;i++){
    let x=80+random()*(WORLD.w-160),y=80+random()*(WORLD.h-160);
    if(safeZones.some(z=>Math.hypot(x-z.x,y-z.y)<z.r))continue;
    const size=rand(15,31);
    trees.push({x,y,size,tone:Math.floor(random()*4),type:random()>.15?"pine":"round",phase:random()*6.28});
  }
  for(let i=0;i<95;i++){
    rocks.push({x:80+random()*(WORLD.w-160),y:80+random()*(WORLD.h-160),size:rand(5,15),tone:Math.floor(random()*3)});
  }
  for(let i=0;i<250;i++){
    flowers.push({x:35+random()*(WORLD.w-70),y:35+random()*(WORLD.h-70),tone:Math.floor(random()*5),size:rand(1.5,3.2)});
  }
  landmarks.push({x:WORLD.w/2,y:WORLD.h/2+130,name:"Mossvale Camp",kind:"camp"});
  landmarks.push({x:WORLD.w/2-270,y:WORLD.h/2-210,name:"Old Waystone",kind:"stone"});
  landmarks.push({x:WORLD.w/2+440,y:WORLD.h/2-280,name:"The Quiet Shrine",kind:"shrine"});
  landmarks.push({x:WORLD.w/2-560,y:WORLD.h/2+320,name:"Abandoned Watchtower",kind:"tower"});
  landmarks.push({x:WORLD.w/2+540,y:WORLD.h/2+440,name:"Riverbend",kind:"river"});
  // Shards are deliberately placed around the full map, not only near spawn.
  const shardSpots=[
    [WORLD.w/2-260,WORLD.h/2-210],[WORLD.w/2+440,WORLD.h/2-280],
    [WORLD.w/2-560,WORLD.h/2+320],[WORLD.w/2+540,WORLD.h/2+440],
    [300,300],[2050,330],[350,1480],[2050,1450]
  ];
  shardSpots.forEach((p,i)=>shards.push({x:p[0],y:p[1],id:i,found:false,phase:random()*6.28}));
  function resize(){
    W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
    canvas.style.width=W+"px";canvas.style.height=H+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener("resize",resize);resize();
  function worldToScreen(x,y){return{x:x-camera.x+W/2,y:y-camera.y+H/2}}
  function roundRect(x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}
  }
  function polygon(points,fill,stroke){
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}
  }
  function drawGround(){
    ctx.fillStyle="#315344";ctx.fillRect(0,0,W,H);
    // Broad, softly mottled grass patches give the world depth without external assets.
    for(let y=-140;y<H+140;y+=110){
      for(let x=-140;x<W+140;x+=130){
        const wx=Math.floor((x+camera.x)/130),wy=Math.floor((y+camera.y)/110);
        const v=Math.abs(Math.sin(wx*12.9898+wy*78.233)*43758.5453)%1;
        ctx.fillStyle=v>.52?"rgba(133,157,91,.08)":"rgba(12,43,38,.08)";
        ctx.beginPath();ctx.ellipse(x+((wy%2)*40),y,randStatic(wx,wy,22,60),randStatic(wy,wx,15,42),0,0,Math.PI*2);ctx.fill();
      }
    }
    // Winding dirt trail between camp and landmarks.
    ctx.save();ctx.translate(W/2-camera.x,H/2-camera.y);
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();ctx.moveTo(0,260);ctx.bezierCurveTo(-110,140,-130,70,-270,-80);ctx.bezierCurveTo(-340,-190,-250,-290,0,-340);ctx.bezierCurveTo(210,-370,360,-300,440,-280);
    ctx.strokeStyle="#203f35";ctx.lineWidth=48;ctx.stroke();
    ctx.strokeStyle="#8e8a61";ctx.lineWidth=36;ctx.stroke();
    ctx.strokeStyle="#a8a075";ctx.lineWidth=1.5;ctx.setLineDash([3,14]);ctx.stroke();ctx.setLineDash([]);
    ctx.restore();
    // River ribbon along the eastern side.
    ctx.save();ctx.beginPath();
    for(let y=-100;y<H+120;y+=25){const wx=camera.x+W/2+480+Math.sin((y+camera.y)*.005)*55; if(y===-100)ctx.moveTo(wx,y);else ctx.lineTo(wx,y);}
    for(let y=H+120;y>-100;y-=25){const wx=camera.x+W/2+535+Math.sin((y+camera.y)*.005)*55;ctx.lineTo(wx,y);}
    ctx.closePath();ctx.fillStyle="#286c70";ctx.fill();ctx.strokeStyle="#8dc3ad55";ctx.lineWidth=3;ctx.stroke();ctx.restore();
    // World boundaries are distant ridges.
    const left=worldToScreen(0,0),right=worldToScreen(WORLD.w,WORLD.h);
    const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,"rgba(10,30,29,.18)");shade.addColorStop(.5,"rgba(0,0,0,0)");shade.addColorStop(1,"rgba(9,25,21,.2)");ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
  }
  function randStatic(a,b,lo,hi){let n=Math.sin(a*127.1+b*311.7)*43758.5453;n-=Math.floor(n);return lo+n*(hi-lo)}
  function drawTree(t){
    const p=worldToScreen(t.x,t.y);if(p.x<-70||p.x>W+70||p.y<-100||p.y>H+80)return;
    const s=t.size;ctx.save();ctx.translate(p.x,p.y);
    ctx.fillStyle="#142d28a8";ctx.beginPath();ctx.ellipse(5,s*.45,s*.75,s*.28,.1,0,Math.PI*2);ctx.fill();
    if(t.type==="pine"){
      polygon([[-s*.15,-s*.2],[s*.12,-s*.2],[s*.15,s*.42],[-s*.2,s*.42]],"#755b3d");
      const c=["#244d3b","#2d5b43","#356749","#28533e"][t.tone];
      polygon([[-s*.8,-s*.1],[0,-s*1.45],[s*.8,-s*.1]],c);
      polygon([[-s*.67,-s*.38],[0,-s*1.12],[s*.67,-s*.38]],["#326448","#3b704e","#2d6047","#3b6749"][t.tone]);
      polygon([[-s*.48,-s*.63],[0,-s*1.55],[s*.48,-s*.63]],["#447451","#4d8058","#386d4d","#477b54"][t.tone]);
      polygon([[-s*.08,-s*1.48],[0,-s*1.55],[s*.12,-s*.7],[-s*.04,-s*.7]],"rgba(182,198,124,.13)");
    }else{
      ctx.fillStyle="#6b5639";ctx.fillRect(-s*.13,-s*.4,s*.26,s*.8);
      ctx.fillStyle=["#315f43","#3c704b","#2b563d","#456e49"][t.tone];ctx.beginPath();ctx.arc(0,-s*.63,s*.58,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="rgba(159,190,112,.18)";ctx.beginPath();ctx.arc(-s*.16,-s*.77,s*.34,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawRock(r){
    const p=worldToScreen(r.x,r.y);if(p.x<-30||p.x>W+30||p.y<-30||p.y>H+30)return;
    let s=r.size;ctx.fillStyle="#142e2c55";ctx.beginPath();ctx.ellipse(p.x+3,p.y+4,s*1.2,s*.58,0,0,Math.PI*2);ctx.fill();
    polygon([[p.x-s,p.y],[p.x-s*.5,p.y-s*.65],[p.x+s*.35,p.y-s*.8],[p.x+s,p.y-s*.15],[p.x+s*.65,p.y+s*.35],[p.x-s*.55,p.y+s*.3]],["#687c70","#7b8979","#596f67"][r.tone]);
    polygon([[p.x-s*.5,p.y-s*.65],[p.x+s*.35,p.y-s*.8],[p.x+s*.05,p.y-s*.2],[p.x-s*.35,p.y-s*.1]],"#a1ad8c55");
  }
  function drawFlower(f){
    const p=worldToScreen(f.x,f.y);if(p.x<-5||p.x>W+5||p.y<-5||p.y>H+5)return;
    const colors=["#d6c780","#d3a6a0","#d6d6a1","#b7c7a0","#e0d4b5"];
    ctx.fillStyle="#a6bc8b";ctx.fillRect(p.x,p.y,1,3);
    ctx.fillStyle=colors[f.tone];ctx.beginPath();ctx.arc(p.x,p.y,f.size,0,Math.PI*2);ctx.fill();
  }
  function drawLandmark(l){
    const p=worldToScreen(l.x,l.y);if(p.x<-100||p.x>W+100||p.y<-120||p.y>H+100)return;
    ctx.save();ctx.translate(p.x,p.y);
    if(l.kind==="camp"){
      // Tent and campfire.
      ctx.fillStyle="#162c2a88";ctx.beginPath();ctx.ellipse(0,14,55,22,0,0,Math.PI*2);ctx.fill();
      polygon([[-40,5],[-14,-29],[12,5]],"#d5c69b");polygon([[-14,-29],[12,5],[36,4]],"#9e9a72");
      polygon([[-14,-29],[-14,5],[12,5]],"#b6ad83");
      ctx.fillStyle="#d8b768";ctx.beginPath();ctx.ellipse(43,4,6,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#e8e0a0";ctx.beginPath();ctx.arc(43,0,3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#d6d7a0";ctx.font="10px Manrope";ctx.textAlign="center";ctx.fillText("MOSSVALE CAMP",0,38);
    }else if(l.kind==="stone"||l.kind==="shrine"){
      ctx.fillStyle="#18332e88";ctx.beginPath();ctx.ellipse(0,13,28,11,0,0,Math.PI*2);ctx.fill();
      polygon([[-18,12],[-15,-20],[-3,-29],[13,-23],[18,12]],"#778c78");
      polygon([[-15,-20],[-3,-29],[13,-23],[4,-14]],"#a1ad8c");
      ctx.strokeStyle="#d9d89b";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(0,2);ctx.moveTo(-6,-8);ctx.lineTo(6,-8);ctx.stroke();
      if(l.kind==="shrine"){ctx.strokeStyle="#d9d89b66";ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-9,32,0,Math.PI*2);ctx.stroke();}
    }else if(l.kind==="tower"){
      ctx.fillStyle="#17312b88";ctx.beginPath();ctx.ellipse(0,14,30,13,0,0,Math.PI*2);ctx.fill();
      polygon([[-20,10],[-17,-24],[15,-24],[20,10]],"#7c8169");polygon([[-17,-24],[-4,-38],[15,-24]],"#a99b73");
      ctx.fillStyle="#3a4a3d";ctx.fillRect(-7,-9,8,14);
    }else if(l.kind==="river"){
      ctx.strokeStyle="#a9d7b866";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-24,0);ctx.quadraticCurveTo(0,-12,22,0);ctx.stroke();
    }
    ctx.restore();
  }
  function drawShard(s){
    if(s.found)return;const p=worldToScreen(s.x,s.y);if(p.x<-50||p.x>W+50||p.y<-60||p.y>H+60)return;
    const bob=Math.sin(elapsed*2.2+s.phase)*5;
    ctx.save();ctx.translate(p.x,p.y-20+bob);
    const glow=ctx.createRadialGradient(0,0,1,0,0,29);glow.addColorStop(0,"rgba(232,215,128,.35)");glow.addColorStop(1,"rgba(232,215,128,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,29,0,Math.PI*2);ctx.fill();
    ctx.rotate(elapsed*.5+s.phase);
    polygon([[0,-11],[7,0],[0,12],[-7,0]],"#f1e4a3","#fff4c4");
    polygon([[0,-8],[2,0],[0,8],[-2,0]],"#fff9d7");
    ctx.restore();
    ctx.fillStyle="#f0e6b7";ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(p.x,p.y+3,9,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  function drawPlayer(){
    const p=worldToScreen(player.x,player.y),bob=Math.sin(player.walk*10)*1.6;
    ctx.fillStyle="#112d28a0";ctx.beginPath();ctx.ellipse(p.x,p.y+7,13,6,0,0,Math.PI*2);ctx.fill();
    // Feet
    ctx.fillStyle="#342f28";ctx.beginPath();ctx.ellipse(p.x-5,p.y+4+bob,4,3,0,0,Math.PI*2);ctx.ellipse(p.x+5,p.y+4-bob,4,3,0,0,Math.PI*2);ctx.fill();
    // Cloak/body
    polygon([[p.x-8,p.y-9+bob],[p.x+8,p.y-9-bob],[p.x+10,p.y+3],[p.x-10,p.y+3]],"#bf9a61");
    polygon([[p.x-6,p.y-11+bob],[p.x+6,p.y-11-bob],[p.x+7,p.y+1],[p.x-7,p.y+1]],"#d4c18a");
    // Head and hood
    ctx.fillStyle="#2a4236";ctx.beginPath();ctx.arc(p.x,p.y-13,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#d8caa0";ctx.beginPath();ctx.arc(p.x,p.y-14,4.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#243b32";ctx.beginPath();ctx.arc(p.x,p.y-16,5.5,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f5e4ac";ctx.beginPath();ctx.arc(p.x+player.faceX*3,p.y-14+player.faceY*2,1.1,0,Math.PI*2);ctx.fill();
  }
  function drawMinimap(){
    const mw=116,mh=82,x=W-mw-27,y=H-126;
    if(W<700)return;
    roundRect(x,y,mw,mh,9,"rgba(13,27,25,.7)","rgba(220,231,211,.18)");
    ctx.save();ctx.beginPath();ctx.roundRect(x+5,y+5,mw-10,mh-10,6);ctx.clip();
    ctx.fillStyle="#315344";ctx.fillRect(x+5,y+5,mw-10,mh-10);
    // map trail
    ctx.strokeStyle="#b6a779";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+mw*.5,y+mh*.72);ctx.lineTo(x+mw*.42,y+mh*.52);ctx.lineTo(x+mw*.39,y+mh*.34);ctx.lineTo(x+mw*.58,y+mh*.2);ctx.stroke();
    ctx.fillStyle="#39787a";ctx.fillRect(x+mw*.72,y+5,9,mh);
    landmarks.forEach(l=>{ctx.fillStyle="#c6c5a0";ctx.beginPath();ctx.arc(x+5+l.x/WORLD.w*(mw-10),y+5+l.y/WORLD.h*(mh-10),2,0,Math.PI*2);ctx.fill()});
    shards.filter(s=>!s.found).forEach(s=>{ctx.fillStyle="#f3d77b";ctx.beginPath();ctx.arc(x+5+s.x/WORLD.w*(mw-10),y+5+s.y/WORLD.h*(mh-10),2.2,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle="#fff5c9";ctx.beginPath();ctx.arc(x+5+player.x/WORLD.w*(mw-10),y+5+player.y/WORLD.h*(mh-10),3,0,Math.PI*2);ctx.fill();
    ctx.restore();
    ctx.fillStyle="#d8dfc8";ctx.font="7px DM Mono,monospace";ctx.letterSpacing="1px";ctx.fillText("FIELD MAP",x+9,y+12);ctx.letterSpacing="0px";
  }
  function drawVignette(){
    const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.72);
    g.addColorStop(0,"rgba(6,22,19,0)");g.addColorStop(1,"rgba(6,18,18,.36)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Subtle sunlight bloom
    const sun=ctx.createRadialGradient(W*.78,H*.12,0,W*.78,H*.12,Math.min(W,H)*.55);
    sun.addColorStop(0,"rgba(242,219,151,.09)");sun.addColorStop(1,"rgba(242,219,151,0)");ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
  }
  function updateUI(){
    ui.time.textContent="DAY 01 · "+String(8+Math.floor(elapsed/90)%12).padStart(2,"0")+":"+String(Math.floor((elapsed%90)/90*60)).padStart(2,"0");
    ui.healthText.textContent=Math.round(player.health)+" / 100";ui.healthBar.style.width=player.health+"%";
    ui.staminaText.textContent=Math.round(player.stamina)+" / 100";ui.staminaBar.style.width=player.stamina+"%";
    ui.shards.textContent=player.shards+" / "+shards.length;
    ui.progress.style.width=(player.shards/shards.length*100)+"%";
    ui.progressText.textContent=player.shards+" OF "+shards.length+" DISCOVERED";
    ui.questDesc.textContent=player.shards===shards.length?"Every shard has been found. Wildwood's light is restored.":"Find "+(shards.length-player.shards)+" more ancient light shard"+(shards.length-player.shards===1?"":"s")+" hidden across Wildwood.";
  }
  function showToast(text){
    ui.toast.textContent=text;ui.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),2500);
  }
  function interact(){
    const nearest=landmarks.map(l=>({l,d:dist(player,l)})).sort((a,b)=>a.d-b.d)[0];
    if(nearest&&nearest.d<82){
      const messages={
        camp:"Mossvale Camp — A quiet place to rest. The old trail begins here.",
        stone:"Old Waystone — Its carvings speak of eight lights scattered through the wild.",
        shrine:"The Quiet Shrine — The stone hums softly. One of the ancient lights is close.",
        tower:"Abandoned Watchtower — From here, the forest seems endless.",
        river:"Riverbend — Clear water runs over smooth, silver stones."
      };
      showToast(messages[nearest.l.kind]);return;
    }
    const shard=shards.find(s=>!s.found&&dist(player,s)<52);
    if(shard){collectShard(shard);return;}
    showToast("Only wind and birdsong answer you.");
  }
  function collectShard(s){
    s.found=true;player.shards++;player.stamina=Math.min(100,player.stamina+18);
    showToast("Ancient light shard found · "+player.shards+" / "+shards.length);
    updateUI();
    if(player.shards===shards.length){
      complete=true;ui.center.hidden=false;
    }
  }
  ui.continueBtn.addEventListener("click",()=>{ui.center.hidden=true;complete=false;showToast("The frontier is yours to explore.");});
  function setKey(e,down){
    const key=e.key.toLowerCase();
    if(["arrowup","arrowdown","arrowleft","arrowright"," ","shift"].includes(key))e.preventDefault();
    keys[key]=down;
    if(down&&!e.repeat&&(key==="e"||key==="enter"))interact();
  }
  addEventListener("keydown",e=>setKey(e,true));addEventListener("keyup",e=>setKey(e,false));
  addEventListener("blur",()=>{keys={};touch={};sprintTouch=false});
  document.querySelectorAll("[data-move]").forEach(btn=>{
    const d=btn.dataset.move;
    const down=e=>{e.preventDefault();touch[d]=true;try{btn.setPointerCapture(e.pointerId)}catch(_){}};
    const up=e=>{e.preventDefault();touch[d]=false};
    btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointercancel",up);btn.addEventListener("lostpointercapture",up);
  });
  const sprintBtn=$("sprint-touch");
  sprintBtn.addEventListener("pointerdown",e=>{e.preventDefault();sprintTouch=true;try{sprintBtn.setPointerCapture(e.pointerId)}catch(_){}});
  ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>sprintBtn.addEventListener(ev,e=>{e.preventDefault();sprintTouch=false}));
  canvas.addEventListener("pointerdown",()=>{if(W<700)interact()});
  function update(dt){
    elapsed+=dt;
    let dx=(keys.d||keys.arrowright||touch.right?1:0)-(keys.a||keys.arrowleft||touch.left?1:0);
    let dy=(keys.s||keys.arrowdown||touch.down?1:0)-(keys.w||keys.arrowup||touch.up?1:0);
    const moving=dx!==0||dy!==0;
    if(moving){const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;player.faceX=dx;player.faceY=dy;}
    const sprint=(keys.shift||sprintTouch)&&moving&&player.stamina>1;
    const speed=player.speed*(sprint?1.65:1);
    if(moving){
      player.x=clamp(player.x+dx*speed*dt,30,WORLD.w-30);
      player.y=clamp(player.y+dy*speed*dt,30,WORLD.h-30);
      player.walk+=dt*(sprint?15:9);
      if(sprint)player.stamina=Math.max(0,player.stamina-27*dt);
      else player.stamina=Math.min(100,player.stamina+13*dt);
    }else{player.stamina=Math.min(100,player.stamina+19*dt);}
    camera.x+=(player.x-camera.x)*Math.min(1,dt*5);camera.y+=(player.y-camera.y)*Math.min(1,dt*5);
    // The interaction hint appears near an undiscovered shard or a landmark.
    const nearShard=shards.some(s=>!s.found&&dist(player,s)<62);
    const nearLandmark=landmarks.some(l=>dist(player,l)<82);
    ui.hint.hidden=!(nearShard||nearLandmark);
    ui.region.textContent=player.y<500?"Northreach":player.y>1300?"Southgrove":player.x>1500?"Riverlands":"Mossvale";
    updateUI();
  }
  function render(){
    ctx.clearRect(0,0,W,H);drawGround();
    flowers.forEach(drawFlower);
    // Depth-sort world objects so objects lower on the screen appear in front.
    const objects=[];
    trees.forEach(o=>objects.push({y:o.y,draw:()=>drawTree(o)}));
    rocks.forEach(o=>objects.push({y:o.y,draw:()=>drawRock(o)}));
    landmarks.forEach(o=>objects.push({y:o.y,draw:()=>drawLandmark(o)}));
    shards.forEach(o=>objects.push({y:o.y,draw:()=>drawShard(o)}));
    objects.push({y:player.y,draw:drawPlayer});
    objects.sort((a,b)=>a.y-b.y);objects.forEach(o=>o.draw());
    drawVignette();drawMinimap();
  }
  function frame(t){
    const dt=Math.min(.033,Math.max(0,(t-last)/1000||0));last=t;
    if(!complete)update(dt);else elapsed+=dt;
    render();requestAnimationFrame(frame);
  }
  // Intro positioning and first-time guidance.
  camera.x=player.x;camera.y=player.y;
  updateUI();showToast("Welcome to Wildwood. Follow the old trail and seek the light.");
  requestAnimationFrame(frame);
})();
