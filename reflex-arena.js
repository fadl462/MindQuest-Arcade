(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
// Reflex Arena interaction bridge. All live controls use this common pointer/click
// path so dynamically-created buttons remain responsive across mouse and touch.
// Native button activation is intentionally used for Reflex controls.
// Individual activities attach their handlers directly to their live buttons.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const COLORS=[
 {name:"red",hex:"#ef4444",emoji:"🔴"},{name:"blue",hex:"#3b82f6",emoji:"🔵"},
 {name:"green",hex:"#22c55e",emoji:"🟢"},{name:"yellow",hex:"#eab308",emoji:"🟡"},
 {name:"purple",hex:"#8b5cf6",emoji:"🟣"},{name:"orange",hex:"#f97316",emoji:"🟠"}
];
const SHAPES=["●","▲","■","◆","★","⬟","✚","✦"];
const INFO={
 switch:['Signal Switch','Watch the arrow signal and tap the matching side before time runs out.','Respond to the displayed direction. Do not tap early.'],
 go:["Go / No-Go","React to the GO signal but do nothing for NO-GO.","Tap only when the signal says GO."],
 target:["Target Rush","Wait for the target, then tap it as quickly as possible.","Tap the target only after it appears."],
 color:["Color Flash","Watch the signal and tap the matching color.","Ignore the decoys and react to the target color."],
 avoid:["Safe Tap","Find the safe symbol among the hazards.","Tap only the safe symbol."],
 multitap:["Multi-Target Rush","Tap the targets in the order they appear.","React to each target in sequence without tapping a decoy."],
 sequence:["Reaction Sequence","Watch the short sequence, then repeat it.","Tap the symbols in exactly the order shown."],
 double:["Double Target","React to two targets in the correct order.","Tap the first target, then the second target without tapping a decoy."],
 delay:["Delayed Tap","Wait for the signal, then respond during a short timing window.","Do not tap during the countdown. Tap only when the signal appears."],
 rhythm:["Rhythm Tap","Watch the visual rhythm and reproduce it accurately.","Tap the symbols in the same rhythm and order."],
 precision:["Precision Tap","Wait for a target, then tap it accurately before the timer expires.","Do not tap early. Hit the target once it appears."],
 alternate:["Alternating Targets","Switch between the left and right targets in the required order.","Tap the highlighted side, then switch sides each time."],
 combo:["Combo Rush","Remember a short symbol sequence and reproduce it quickly.","Tap every symbol in the exact order shown."],
 mirror:["Mirror Signal","Respond with the opposite direction shown by the signal.","If the signal points one way, tap the opposite direction."],
 chase:["Moving Target Chase","Follow a moving target and hit it repeatedly before it moves again.","Tap each target as it appears until the required number of hits is reached."]
};
function mirror(){const dirs=[['←','RIGHT'],['→','LEFT'],['↑','DOWN'],['↓','UP']];const d=dirs[(S.level+activity()+S.age)%dirs.length],token=begin();$('game-stage').innerHTML=`<div class="reflex-stage">${head('mirror')}<div class="reflex-target">${d[0]}</div><div class="reflex-controls"><button class="reflex-key" data-v="LEFT">←</button><button class="reflex-key" data-v="RIGHT">→</button><button class="reflex-key" data-v="UP">↑</button><button class="reflex-key" data-v="DOWN">↓</button></div></div>`;S.active=true;S.timer=setTimeout(()=>fail(),responseWindow());document.querySelectorAll('.reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;b.dataset.v===d[1]?complete():fail()})}
function chase(){
 const token=begin(),size=S.level<8?170:S.level<15?140:115,steps=2+Math.floor((S.level-1)/7)+activity();let hit=0;
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('chase','Follow the moving target. Tap it before it moves again.')}<div id="chase-area" style="position:relative;width:min(100%,620px);height:${size}px;margin:20px auto;border:1px solid rgba(255,255,255,.14);border-radius:20px;overflow:hidden"></div><div id="chase-count" class="reflex-target">0 / ${steps}</div></div>`;
 const area=$('chase-area');S.active=true;
 const spawn=()=>{if(!S.active||token!==S.reflexToken)return;area.innerHTML='';const b=document.createElement('button');b.className='reflex-target';b.textContent='●';const targetPx=Math.max(34,62-Math.floor(S.level*1.35));const areaRect=area.getBoundingClientRect();const safeX=Math.max(targetPx/2+6,Math.min(areaRect.width-targetPx/2-6,areaRect.width*(.10+Math.random()*.80)));const safeY=Math.max(targetPx/2+6,Math.min(areaRect.height-targetPx/2-6,areaRect.height*(.18+Math.random()*.64)));b.style.cssText=`position:absolute;left:${safeX}px;top:${safeY}px;transform:translate(-50%,-50%);width:${targetPx}px;height:${targetPx}px;border-radius:50%;cursor:pointer;touch-action:manipulation`;b.onclick=()=>{if(!S.active)return;clearTimeout(S.timer);hit++;$('chase-count').textContent=`${hit} / ${steps}`;if(hit>=steps){complete();return}spawn()};area.appendChild(b);S.timer=setTimeout(()=>fail(),Math.max(700,responseWindow()))};
 spawn();
}
function activity(){return Number.isInteger(S.reflexActivity)?S.reflexActivity:0}
function ageFactor(){return [1.55,1.25,1,.9,.82][S.age]||1}
function ageDifficulty(){return [0,0,0,1,1][S.age]||0}
function difficulty(){return S.level+activity()*.55+ageDifficulty()*.35}
function tier(){return S.level<5?0:S.level<9?1:S.level<13?2:S.level<17?3:4}
function complexity(){return tier()+Math.min(3,activity())}

// Response time is deliberately age-calibrated. Ages 3–5 receive a substantially
// longer response window and a longer preparation period so the challenge tests
// recognition and coordination rather than reading speed.
function responseWindow(mult=1){
  const ageBonus=[900,450,0,-180,-320][S.age]||0;
  const base=2300-difficulty()*35+ageBonus;
  return clamp(Math.round(base*mult),900,3200);
}
function signalDelay(){
  const ageBonus=[520,260,0,-120,-180][S.age]||0;
  return clamp(Math.round(1050-difficulty()*14+ageBonus),520,1550);
}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">REFLEX ARENA</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function begin(){S.active=false;clearTimeout(S.timer);S.reflexToken=(S.reflexToken||0)+1;return S.reflexToken}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four reflex challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next challenge…`;if(last){S.reflexActivity=0;S.timer=setTimeout(()=>{MQ.state.active=true;MQ.levelComplete()},650)}else{S.reflexActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){
 const types=["target","color","avoid","sequence","go","double","multitap","switch","delay","rhythm","precision","alternate","combo","mirror","chase"];const type=types[(S.level-1+activity())%types.length],i=INFO[type];S.active=false;clearTimeout(S.timer);
 // If the browser was refreshed during the live challenge, rebuild that
 // challenge directly. Do this before marking the view as an instruction so
 // a second refresh cannot downgrade the saved phase back to the instruction.
 if(S.resumeLiveActivity){
   S.resumeLiveActivity=false;
   runActivity(type);
   return;
 }
 // A refresh while an instruction is visible should restore this instruction,
 // not jump into the live challenge. The progress layer records this view.
 if(window.MQProgressSetLivePhase)MQProgressSetLivePhase('instruction',type);
 $("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">⚡</div><span class="ui-skill">PSYCHOMOTOR</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>⚡ Faster as you advance</span><span>✓ Four activities per level</span></div><button id="reflex-start" type="button" class="primary-btn ui-start">Start Activity →</button></div>`;
 $("reflex-start").onclick=()=>{if(window.MQProgressSetLivePhase)MQProgressSetLivePhase('active',type);runActivity(type)};
}
function alternate(){
 const token=begin(),steps=clamp(4+Math.floor(S.level/4)+Math.floor(activity()/2),4,10);let hit=0,side=0;
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('alternate','Hit the highlighted side, then alternate sides.')}<div id="alt-area" style="display:flex;justify-content:center;gap:24px;margin:22px auto;max-width:520px"><button type="button" class="reflex-target" id="alt-left">LEFT</button><button type="button" class="reflex-target" id="alt-right">RIGHT</button></div><div id="alt-count" class="reflex-target">0 / ${steps}</div></div>`;
 const left=$('alt-left'),right=$('alt-right'),count=$('alt-count');S.active=true;
 const arm=()=>{if(!S.active||token!==S.reflexToken)return;left.classList.toggle('good',side===0);right.classList.toggle('good',side===1);S.timer=setTimeout(fail,responseWindow(1.05))};
 const tap=(which)=>{if(!S.active)return;if(which!==side){fail();return}clearTimeout(S.timer);hit++;count.textContent=`${hit} / ${steps}`;if(hit>=steps){complete();return}side=1-side;arm()};
 left.onclick=()=>tap(0);right.onclick=()=>tap(1);arm();
}
function switchSignal(){const dirs=[['←','LEFT'],['→','RIGHT'],['↑','UP'],['↓','DOWN']];const d=dirs[(S.level+activity()+S.age)%dirs.length];const token=begin();$('game-stage').innerHTML=`<div class="reflex-stage">${head('switch')}<div class="reflex-target">GET READY</div><div class="reflex-controls"><button class="reflex-key" data-v="LEFT">←</button><button class="reflex-key" data-v="RIGHT">→</button><button class="reflex-key" data-v="UP">↑</button><button class="reflex-key" data-v="DOWN">↓</button></div></div>`;const delay=signalDelay();S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;const t=performance.now();document.querySelector('.reflex-target').textContent=d[0];S.active=true;S.timer=setTimeout(()=>fail(),responseWindow());document.querySelectorAll('.reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;clearTimeout(S.timer);b.dataset.v===d[1]?complete():fail();});},delay)}
function delayedTap(){
 const token=begin();
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('delay','Wait for the signal.')}<div class="reflex-signal" id="delay-signal">WAIT…</div><button class="reflex-target" id="delay-button" type="button" aria-disabled="true">TAP</button></div>`;
 const wait=clamp(Math.round(980+activity()*70-difficulty()*9),360,1100);
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;const start=performance.now();const b=$('delay-button');$('delay-signal').textContent='NOW';b.setAttribute("aria-disabled","false");S.active=true;S.timer=setTimeout(()=>fail(),responseWindow(1.1));b.onclick=()=>{if(!S.active)return;const rt=performance.now()-start;clearTimeout(S.timer);const window=clamp(175-difficulty()*3.2,55,175);Math.abs(rt-(responseWindow(.65)))<=window?complete():fail();};},wait);
}

function rhythm(){
 const token=begin(),len=clamp(2+Math.floor((S.level-1)/5)+Math.floor(activity()/2)+ageDifficulty(),2,8);
 const pool=SHAPES.slice(0,2+Math.min(3,tier()+Math.floor(activity()/2)));
 const beats=[];
 for(let i=0;i<len;i++){
   let next=pool[(S.level*3+S.age*5+i*2+activity()*3)%pool.length];
   if(i>0 && next===beats[i-1]) next=pool[(pool.indexOf(next)+1)%pool.length];
   if(i>2 && next===beats[i-2] && pool.length>2) next=pool[(pool.indexOf(next)+1)%pool.length];
   beats.push(next);
 }
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('rhythm')}<div class="reflex-target">${beats.join(' ')}</div><p>Watch the pattern…</p></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;let n=0;$('game-stage').innerHTML=`<div class="reflex-stage">${head('rhythm','Repeat the pattern in the same order.')}<div class="reflex-controls" id="rhythm-controls">${pool.map(x=>`<button class="reflex-key" data-v="${x}">${x}</button>`).join('')}</div></div>`;S.active=true;document.querySelectorAll('#rhythm-controls .reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;const expected=beats[n];if(b.dataset.v!==expected){b.classList.add('bad');fail();return}b.classList.add('good');if(++n===beats.length)complete()});S.timer=setTimeout(()=>fail(),responseWindow(1.1)+len*140);},Math.max(450,signalDelay()));
}

function precision(){
 const token=begin(),size=clamp(70-Math.floor(S.level*1.8),32,70),boardMin=360,xMin=Math.max(10,(size/boardMin)*100/2+2),xMax=100-xMin,yMin=Math.max(12,(size/boardMin)*100/2+2),yMax=100-yMin,x=(xMin+((S.level*17+activity()*23+S.age*11)%100)/100*(xMax-xMin)),y=(yMin+((S.level*29+activity()*13+S.age*7)%100)/100*(yMax-yMin));
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("precision","Wait for the target, then tap it once.")}<div class="precision-board" id="precision-board" style="position:relative;min-height:360px;overflow:hidden;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)"><button class="precision-target" style="position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;border-radius:50%;border:0;cursor:pointer;touch-action:manipulation" aria-label="Precision target"></button></div></div>`;
 const b=$("precision-board").querySelector('button'); b.setAttribute("aria-disabled","true"); b.onclick=()=>complete();
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;b.setAttribute('aria-disabled','false');S.active=true;S.timer=setTimeout(fail,responseWindow(.85))},signalDelay());
}


function combo(){
 const token=begin(),n=clamp(3+Math.floor((S.level-1)/4)+Math.floor(activity()/2)+ageDifficulty(),3,10),pool=shuffle(['●','▲','■','◆','★']).slice(0,clamp(3+ageDifficulty(),3,5)),seq=Array.from({length:n},(_,i)=>pool[(i+S.level+S.age)%pool.length]);
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('combo','Memorize the target sequence.')}<div class="reflex-target">${seq.join(' ')}</div></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$('game-stage').innerHTML=`<div class="reflex-stage">${head('combo','Hit the targets in order.')}<div class="reflex-controls">${pool.map(x=>`<button class="reflex-key" data-v="${x}">${x}</button>`).join('')}</div></div>`;let i=0;S.active=true;document.querySelectorAll('.reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;if(b.dataset.v!==seq[i]){b.classList.add('bad');fail();return}b.classList.add('good','selected');b.dataset.picks=String((Number(b.dataset.picks)||0)+1);if(++i===seq.length)complete()});S.timer=setTimeout(fail,responseWindow(1.1));},Math.max(500,signalDelay()+150));
}

function runActivity(type){if(type==="target")target();else if(type==="color")color();else if(type==="avoid")avoid();else if(type==="go")goNoGo();else if(type==="double")doubleTarget();else if(type==="multitap")multiTap();else if(type==="switch")switchSignal();else if(type==="delay")delayedTap();else if(type==="rhythm")rhythm();else if(type==="precision")precision();else if(type==="chase")chase();else if(type==="alternate")alternate();else if(type==="combo")combo();else if(type==="mirror")mirror();else sequence()}
function goNoGo(){
 const token=begin(),go=Math.random()>.38;
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('go','Wait for the signal. Tap GO, but do not tap NO-GO.')}<div class="reflex-signal" id="go-signal">Get ready…</div><div id="go-button-wrap" class="reflex-options"><button id="go-button" class="reflex-target" type="button" aria-disabled="true">RESPOND</button></div></div>`;
 const b=$('go-button');
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$('go-signal').textContent=go?'GO':'NO-GO';b.setAttribute('aria-disabled','false');S.active=true;let responded=false;
 b.onclick=()=>{if(!S.active||responded)return;responded=true;if(go)complete();else fail()};
 if(!go)S.timer=setTimeout(()=>{if(S.active&&!responded)complete()},responseWindow(1.15));
 else S.timer=setTimeout(()=>{if(S.active&&!responded)fail()},responseWindow(.85));
 },signalDelay());
}

function doubleTarget(){
 const token=begin(),count=clamp(4+Math.floor(S.level/5)+ageDifficulty(),4,9),first=(S.level+activity()*2+S.age)%count,second=(first+2+activity())%count===first?(first+1)%count:(first+2+activity())%count;
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('double','Wait for the first target. Tap it, then tap the second target when it appears.')}<p id="double-count" class="reflex-count">Get ready…</p><div id="double-board" class="reflex-options"></div></div>`;
 const board=$('double-board');
 for(let i=0;i<count;i++){
   const b=document.createElement('button');
   b.className='reflex-target';
   b.type='button';b.style.width='58px';b.style.height='58px';b.setAttribute('aria-disabled','true');
   b.setAttribute('aria-label',`Target ${i+1}`);
   b.onclick=()=>{
     if(!S.active||b.getAttribute('aria-disabled')==='true')return;
     if((S.doubleStep||0)===0&&i===first){
       S.doubleStep=1;
       b.textContent='';b.setAttribute('aria-disabled','true');
       cells[second].textContent='🎯';cells[second].setAttribute('aria-disabled','false');
       $('double-count').textContent='Target 2 — tap it now';
       clearTimeout(S.timer);S.timer=setTimeout(()=>fail(),responseWindow(.8));
     }else if(S.doubleStep===1&&i===second){
       S.doubleStep=0;complete();
     }else fail();
   };
   board.appendChild(b);
 }
 const cells=[...board.querySelectorAll('button')];
 S.doubleStep=0;
 S.timer=setTimeout(()=>{
   if(token!==S.reflexToken)return;
   cells[first].textContent='🎯';
   cells[first].setAttribute('aria-disabled','false');
   S.active=true;
   $('double-count').textContent='Target 1 — tap it';
   S.timer=setTimeout(()=>fail(),responseWindow(.9));
 },signalDelay());
}

function target(){
 const token=begin(),age=S.age,count=clamp(3+Math.floor((S.level-1)/4)+activity()+ageDifficulty(),3,9),size=clamp(82-Math.floor(S.level/4)*4-(age*3),50,82);
 const copy=age===0?{title:"Catch the Target",sub:"Wait for 🎯. Tap it when it appears!",ready:"Get ready…",go:"Tap the target!"}:age===1?{title:"Target Rush",sub:"Wait for the target, then tap it quickly.",ready:"Get ready…",go:"Target! Tap it!"}:age===2?{title:"Target Rush",sub:"Wait for the target, then react as quickly as you can.",ready:"Get ready…",go:"Target appeared — react!"}:{title:"Target Rush",sub:"Wait for the target, then react as quickly and accurately as possible.",ready:"Prepare…",go:"Target appeared — react now."};
 const boardStyle=age===0?`display:grid;grid-template-columns:repeat(${Math.min(count,3)},minmax(${size}px,1fr));gap:18px;justify-items:center;align-items:center;width:min(100%,430px);margin:22px auto;padding:18px 12px;border-radius:24px;background:rgba(99,102,241,.055);border:1px solid rgba(99,102,241,.10)`:`display:grid;grid-template-columns:repeat(${Math.min(count,4)},minmax(${size}px,1fr));gap:16px;justify-items:center;align-items:center;width:min(100%,620px);margin:22px auto;padding:20px 14px;border-radius:24px;background:rgba(99,102,241,.045);border:1px solid rgba(99,102,241,.09)`;
 $("game-stage").innerHTML=`<div class="reflex-stage"><div class="arcade-lab-head"><div><span class="lab-kind">REFLEX ARENA</span><h3>${copy.title}</h3><p>${copy.sub}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div><p id="target-status" class="reflex-count">${copy.ready}</p><div id="target-board" class="reflex-options" style="${boardStyle}"></div><div id="target-hint" style="text-align:center;font-size:12px;font-weight:800;color:rgba(30,35,60,.56);min-height:18px"></div></div>`;
 const board=$("target-board"),status=$("target-status"),hint=$("target-hint");
 const targetIndex=Math.floor(Math.random()*count);
 const buttons=[];
 for(let i=0;i<count;i++){
   const b=document.createElement("button");
   b.type="button";
   b.className="reflex-target";
   b.style.width=size+"px";b.style.height=size+"px";
   b.style.minWidth=size+"px";b.style.minHeight=size+"px";
   // Do not use the native disabled state: some touch/browser combinations can
   // swallow interaction on dynamically enabled controls. aria-disabled keeps
   // the visual/accessibility state without blocking pointer events.
   b.textContent="";
   b.dataset.targetIndex=String(i);
   b.setAttribute("aria-label",`Target position ${i+1}`);
   b.setAttribute("aria-disabled","true");
   b.style.pointerEvents="none";
   buttons.push(b);board.appendChild(b);
 }
 const handleTargetInput=(event)=>{
   const button=event.target.closest?.("button[data-target-index]");
   if(!button||!board.contains(button)||!S.active||button.getAttribute("aria-disabled")==="true")return;
   event.preventDefault();
   event.stopPropagation();
   const pickedIndex=Number(button.dataset.targetIndex);
   pickedIndex===targetIndex?complete():fail();
 };
 // pointerdown is deliberately handled in addition to click so touch screens
 // get immediate feedback and mouse clicks retain the normal fallback.
 board.addEventListener("pointerdown",handleTargetInput,true);
 board.addEventListener("click",handleTargetInput,true);
 const delay=signalDelay();
 let countdown=Math.max(1,Math.ceil(delay/500));
 status.textContent=age===0?`Get ready… ${countdown}`:copy.ready;
 const countdownTimer=setInterval(()=>{if(token!==S.reflexToken){clearInterval(countdownTimer);return} countdown-=1;if(countdown>0&&age===0)status.textContent=`Get ready… ${countdown}`;},500);
 S.timer=setTimeout(()=>{
   clearInterval(countdownTimer);
   if(token!==S.reflexToken)return;
   buttons.forEach((b,i)=>{
     b.setAttribute("aria-disabled","false");
     b.style.pointerEvents="auto";
     if(i===targetIndex){
       b.textContent="🎯";b.dataset.target="true";
       b.style.transform="scale(1.04)";
       b.style.boxShadow="0 12px 30px rgba(79,70,229,.24)";
     }
   });
   status.textContent=copy.go;
   hint.textContent=age===0?"Find 🎯 and tap it!":"React before time runs out.";
   S.active=true;
   S.timer=setTimeout(()=>fail(),responseWindow(.9));
 },delay);
}
function color(){
 const token=begin(),correct=COLORS[(S.level*3+activity()*2+S.age)%COLORS.length],optionCount=clamp(4+Math.floor(S.level/7),4,6);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("color","Wait for the color flash, then choose the matching color.")}<div class="reflex-signal" id="reflex-signal">?</div><div id="reflex-colors" class="reflex-options"></div></div>`;
 const box=$("reflex-colors"),options=shuffle([correct,...shuffle(COLORS.filter(x=>x.name!==correct.name)).slice(0,optionCount-1)]);
 options.forEach(x=>{const b=document.createElement("button");b.type="button";b.className="reflex-color";b.innerHTML=`<span style="background:${x.hex}"></span>${x.name}`;b.setAttribute("aria-disabled","true");b.onclick=()=>x.name===correct.name?complete():fail();box.appendChild(b)});
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("reflex-signal").textContent=correct.emoji;box.querySelectorAll("button").forEach(b=>b.setAttribute("aria-disabled","false"));S.active=true;S.timer=setTimeout(fail,responseWindow(1))},signalDelay());
}
function avoid(){
 const token=begin(),safe=SHAPES[(S.level*2+activity()+S.age)%SHAPES.length],hazard=SHAPES[(S.level*2+activity()+4)%SHAPES.length],count=clamp(4+Math.floor(S.level/6),4,7);
 const pool=shuffle(SHAPES.filter(x=>x!==safe&&x!==hazard)).slice(0,count-2);
 const options=shuffle([safe,hazard,...pool]);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("avoid","The safe symbol will be revealed. Tap only that symbol.")}<div class="reflex-signal" id="avoid-signal">?</div><div id="avoid-options" class="reflex-options"></div></div>`;
 const box=$("avoid-options");options.forEach(x=>{const b=document.createElement("button");b.type="button";b.className="reflex-symbol";b.textContent=x;b.setAttribute("aria-disabled","true");b.onclick=()=>x===safe?complete():fail();box.appendChild(b)});
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("avoid-signal").textContent=`SAFE: ${safe}`;box.querySelectorAll("button").forEach(b=>b.setAttribute("aria-disabled","false"));S.active=true;S.timer=setTimeout(fail,responseWindow(.95))},signalDelay());
}
function multiTap(){
 const token=begin();
 const age=S.age;
 const slots=age===0?4:age===1?5:6;
 const len=age===0?clamp(2+Math.floor((S.level-1)/8)+Math.floor(activity()/2),2,3)
   :age===1?clamp(3+Math.floor((S.level-1)/7)+Math.floor(activity()/2),3,4)
   :clamp(3+Math.floor((S.level-1)/5)+activity(),3,6);
 const positions=shuffle([...Array(slots).keys()]).slice(0,len);
 const boardColumns=age===0?2:3;
 const targetSize=age===0?88:age===1?76:68;
 const boardWidth=age===0?220:age===1?300:340;
 const instruction=age===0
   ?'Watch the targets appear, then tap the same positions in order.'
   :'Watch the target order, then tap the same positions.';
 const revealMs=age===0?1100:age===1?820:680;
 const gapMs=age===0?700:age===1?520:Math.max(360,680-S.level*18);
 const responseMs=responseWindow(age===0?1.3:age===1?1.12:1.05)+len*(age===0?420:age===1?300:220);
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('multitap',instruction)}<p id="multi-status" class="reflex-count">Watch carefully…</p><div id="multi-board" class="reflex-options" style="display:grid;grid-template-columns:repeat(${boardColumns},${targetSize}px);gap:${age===0?18:14}px;justify-content:center;align-items:center;width:min(100%,${boardWidth}px);margin:18px auto;padding:${age===0?18:16}px;border-radius:24px;background:rgba(99,102,241,.045);border:1px solid rgba(99,102,241,.10)"></div><p id="multi-progress" class="reflex-count">Sequence: 0 / ${len}</p></div>`;
 const board=$("multi-board"),status=$("multi-status"),progress=$("multi-progress");
 const buttons=[];
 for(let i=0;i<slots;i++){
   const b=document.createElement('button');
   b.type='button';b.className='reflex-target';b.dataset.i=String(i);
   b.setAttribute('aria-disabled','true');
   b.style.cssText=`width:${targetSize}px;height:${targetSize}px;min-width:${targetSize}px;min-height:${targetSize}px;display:flex;align-items:center;justify-content:center;font-size:${age===0?34:30}px;touch-action:manipulation;cursor:pointer;`;
   buttons.push(b);board.appendChild(b);
 }
 let show=0;
 const reveal=()=>{
   if(token!==S.reflexToken)return;
   buttons.forEach(b=>{b.textContent='';b.classList.remove('good','selected','bad');});
   if(show<positions.length){
     const b=buttons[positions[show]];
     b.textContent='🎯';b.classList.add('good');
     status.textContent=`Remember target ${show+1} of ${len}`;
     show++;
     S.timer=setTimeout(reveal,gapMs);
   }else{
     buttons.forEach(b=>b.setAttribute('aria-disabled','false'));
     status.textContent='Your turn — tap the same positions in order.';
     progress.textContent=`Sequence: 0 / ${len}`;
     let n=0;
     const tap=(b)=>{
       if(!S.active)return;
       const i=Number(b.dataset.i);
       if(i!==positions[n]){b.classList.add('bad');fail();return;}
       b.classList.add('good','selected');
       n++;
       progress.textContent=`Sequence: ${n} / ${len}`;
       if(n===positions.length)complete();
     };
     buttons.forEach(b=>{b.onclick=()=>tap(b)});
     S.active=true;
     S.timer=setTimeout(()=>{if(S.active)fail()},responseMs);
   }
 };
 reveal();
}
function sequence(){
 const token=begin(),age=S.age;
 // Young children get shorter sequences with more time to encode and reproduce them.
 const lenByAge=[
   clamp(2+Math.floor((S.level-1)/8)+Math.floor(activity()/2),2,4),
   clamp(3+Math.floor((S.level-1)/7)+Math.floor(activity()/2),3,5),
   clamp(4+Math.floor((S.level-1)/6)+Math.floor(activity()/2),4,6),
   clamp(5+Math.floor((S.level-1)/5)+activity(),5,8),
   clamp(5+Math.floor((S.level-1)/4)+activity(),5,9)
 ];
 const len=lenByAge[age]||lenByAge[2],mode=S.level%4;
 const pool=age===0?SHAPES.slice(0,4):age===1?SHAPES.slice(0,5):SHAPES;
 const seq=Array.from({length:len},(_,i)=>pool[(S.level*2+i*(mode+1)+activity()*2+age)%pool.length]);
 const displayMs=age===0?Math.max(1800,1450+len*360):age===1?Math.max(1300,1100+len*260):Math.max(900,850+len*150);
 const options=shuffle(pool.slice(0,Math.min(pool.length,age===0?4:age===1?5:8)));
 const responseMs=responseWindow(age===0?1.25:age===1?1.08:.9)+len*(age===0?420:age===1?300:260);
 $('game-stage').innerHTML=`<div class="reflex-stage">${head("sequence",age===0?"Watch carefully, then tap the shapes in the same order.":"Memorize the sequence. It will disappear, then repeat it.")}<div class="reflex-sequence">${seq.map(x=>`<span>${x}</span>`).join("")}</div><p class="reflex-count">${age===0?'Look carefully…':'Memorize…'}</p></div>`;
 S.timer=setTimeout(()=>{
   if(token!==S.reflexToken)return;
   $('game-stage').innerHTML=`<div class="reflex-stage">${head("sequence",age===0?"Tap the shapes in the same order you saw them.":"Repeat the sequence in the same order.")}<div id="reaction-seq" class="reflex-options"></div><div id="reaction-picked" class="picked-sequence" aria-live="polite"></div><p id="sequence-progress" class="reflex-count">0 / ${len}</p></div>`;
   const box=$("reaction-seq"),picked=$("reaction-picked"),progress=$("sequence-progress");
   let n=0;S.active=true;
   options.forEach(x=>{
     const b=document.createElement("button");
     b.type="button";b.className="reflex-symbol";b.textContent=x;
     b.style.touchAction="manipulation";
     b.onclick=()=>{
       if(!S.active)return;
       if(x!==seq[n]){b.classList.add("bad");fail();return;}
       b.classList.add("good","selected");
       picked.textContent+=(n?" → ":"")+x;
       n++;progress.textContent=`${n} / ${len}`;
       if(n===seq.length)complete();
     };
     box.appendChild(b);
   });
   S.timer=setTimeout(()=>{if(S.active)fail()},responseMs);
 },displayMs);
}
window.MQReflexArena={run:instruction};
})();
