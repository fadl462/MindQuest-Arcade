(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
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
 const spawn=()=>{if(!S.active||token!==S.reflexToken)return;area.innerHTML='';const b=document.createElement('button');b.className='reflex-target';b.textContent='●';b.style.cssText=`position:absolute;left:${8+Math.random()*76}%;top:${10+Math.random()*65}%;transform:translate(-50%,-50%);width:${Math.max(34,62-Math.floor(S.level*1.35))}px;height:${Math.max(34,62-Math.floor(S.level*1.35))}px;border-radius:50%;cursor:pointer`;b.onclick=()=>{if(!S.active)return;clearTimeout(S.timer);hit++;$('chase-count').textContent=`${hit} / ${steps}`;if(hit>=steps){complete();return}spawn()};area.appendChild(b);S.timer=setTimeout(()=>fail(),Math.max(700,responseWindow()))};
 spawn();
}
function activity(){return Number.isInteger(S.reflexActivity)?S.reflexActivity:0}
function ageFactor(){return [1.35,1.15,1,.88,.78][S.age]||1}
function ageDifficulty(){return [0,0,0,1,1][S.age]||0}
function difficulty(){return S.level+activity()*.55+ageDifficulty()*.35}
function tier(){return S.level<5?0:S.level<9?1:S.level<13?2:S.level<17?3:4}
function complexity(){return tier()+Math.min(3,activity())}

function responseWindow(mult=1){return clamp(Math.round((1750-difficulty()*42)*ageFactor()*mult),520,1750)}
function signalDelay(){return clamp(Math.round((980-difficulty()*18)*ageFactor()),330,980)}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">REFLEX ARENA</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function begin(){S.active=false;clearTimeout(S.timer);S.reflexToken=(S.reflexToken||0)+1;return S.reflexToken}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four reflex challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next challenge…`;if(last){S.reflexActivity=0;S.timer=setTimeout(()=>{MQ.state.active=true;MQ.levelComplete()},650)}else{S.reflexActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){
 const types=["target","color","avoid","sequence","go","double","multitap","switch","delay","rhythm","precision","alternate","combo","mirror","chase"];const type=types[(S.level-1+activity())%types.length],i=INFO[type];S.active=false;clearTimeout(S.timer);
 $("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">⚡</div><span class="ui-skill">PSYCHOMOTOR</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>⚡ Faster as you advance</span><span>✓ Four activities per level</span></div><button id="reflex-start" class="primary-btn ui-start">Start Activity →</button></div>`;
 $("reflex-start").onclick=()=>runActivity(type);
}
function alternate(){
 const token=begin(),steps=clamp(4+Math.floor(S.level/4)+Math.floor(activity()/2),4,10);let hit=0,side=0;
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('alternate','Hit the highlighted side, then alternate sides.')}<div id="alt-area" style="display:flex;justify-content:center;gap:24px;margin:22px auto;max-width:520px"><button class="reflex-target" id="alt-left">LEFT</button><button class="reflex-target" id="alt-right">RIGHT</button></div><div id="alt-count" class="reflex-target">0 / ${steps}</div></div>`;
 const left=$('alt-left'),right=$('alt-right'),count=$('alt-count');S.active=true;
 const arm=()=>{if(!S.active||token!==S.reflexToken)return;left.classList.toggle('good',side===0);right.classList.toggle('good',side===1);S.timer=setTimeout(fail,responseWindow(1.05))};
 const tap=(which)=>{if(!S.active)return;if(which!==side){fail();return}clearTimeout(S.timer);hit++;count.textContent=`${hit} / ${steps}`;if(hit>=steps){complete();return}side=1-side;arm()};
 left.onclick=()=>tap(0);right.onclick=()=>tap(1);arm();
}
function switchSignal(){const dirs=[['←','LEFT'],['→','RIGHT'],['↑','UP'],['↓','DOWN']];const d=dirs[(S.level+activity()+S.age)%dirs.length];const token=begin();$('game-stage').innerHTML=`<div class="reflex-stage">${head('switch')}<div class="reflex-target">GET READY</div><div class="reflex-controls"><button class="reflex-key" data-v="LEFT">←</button><button class="reflex-key" data-v="RIGHT">→</button><button class="reflex-key" data-v="UP">↑</button><button class="reflex-key" data-v="DOWN">↓</button></div></div>`;const delay=signalDelay();S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;const t=performance.now();document.querySelector('.reflex-target').textContent=d[0];S.active=true;S.timer=setTimeout(()=>fail(),responseWindow());document.querySelectorAll('.reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;clearTimeout(S.timer);b.dataset.v===d[1]?complete():fail();});},delay)}
function delayedTap(){
 const token=begin();
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('delay','Wait for the signal.')}<div class="reflex-signal" id="delay-signal">WAIT…</div><button class="reflex-target" id="delay-button" disabled>TAP</button></div>`;
 const wait=clamp(Math.round(980+activity()*70-difficulty()*9),360,1100);
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;const b=$('delay-button');$('delay-signal').textContent='NOW';b.disabled=false;S.active=true;const tapWindow=clamp(Math.round((820-difficulty()*14)*ageFactor()),360,820);S.timer=setTimeout(()=>fail(),tapWindow);b.onclick=()=>{if(!S.active)return;clearTimeout(S.timer);complete();};},wait);
}

function rhythm(){
 const token=begin(),len=clamp(2+Math.floor((S.level-1)/5)+Math.floor(activity()/2)+ageDifficulty(),2,8),beats=Array.from({length:len},(_,i)=>(i+S.level+S.age)%2?'●':'○');
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('rhythm')}<div class="reflex-target">${beats.join(' ')}</div><p>Watch the pattern…</p></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;let n=0;$('game-stage').innerHTML=`<div class="reflex-stage">${head('rhythm','Repeat the beat pattern.')}<div class="reflex-controls" id="rhythm-controls"><button class="reflex-key" data-v="●">●</button><button class="reflex-key" data-v="○">○</button></div></div>`;S.active=true;document.querySelectorAll('#rhythm-controls .reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;const expected=beats[n];if(b.dataset.v!==expected){b.classList.add('bad');fail();return}b.classList.add('good');if(++n===beats.length)complete()});S.timer=setTimeout(()=>fail(),responseWindow(1.1)+len*140);},Math.max(450,signalDelay()));
}
function precision(){
 const token=begin(),size=clamp(70-Math.floor(S.level*1.8),32,70),x=12+((S.level*17+activity()*23+S.age*11)%70),y=15+((S.level*29+activity()*13+S.age*7)%62);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("precision","Wait for the target, then tap it once.")}<div class="precision-board" id="precision-board" style="position:relative;min-height:360px;overflow:hidden;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)"><button class="precision-target" style="position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;border-radius:50%;border:0;cursor:pointer;touch-action:manipulation" aria-label="Precision target"></button></div></div>`;
 const b=$("precision-board").querySelector('button'); b.disabled=true; b.onclick=()=>complete();
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;b.disabled=false;S.active=true;S.timer=setTimeout(fail,responseWindow(.85))},signalDelay());
}


function combo(){
 const token=begin(),n=clamp(3+Math.floor((S.level-1)/4)+Math.floor(activity()/2)+ageDifficulty(),3,10),pool=shuffle(['●','▲','■','◆','★']).slice(0,clamp(3+ageDifficulty(),3,5)),seq=Array.from({length:n},(_,i)=>pool[(i+S.level+S.age)%pool.length]);
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('combo','Memorize the target sequence.')}<div class="reflex-target">${seq.join(' ')}</div></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$('game-stage').innerHTML=`<div class="reflex-stage">${head('combo','Hit the targets in order.')}<div class="reflex-controls">${pool.map(x=>`<button class="reflex-key" data-v="${x}">${x}</button>`).join('')}</div></div>`;let i=0;S.active=true;document.querySelectorAll('.reflex-key').forEach(b=>b.onclick=()=>{if(!S.active)return;if(b.dataset.v!==seq[i]){b.classList.add('bad');fail();return}b.classList.add('good','selected');b.dataset.picks=String((Number(b.dataset.picks)||0)+1);if(++i===seq.length)complete()});S.timer=setTimeout(fail,responseWindow(1.1));},Math.max(500,signalDelay()+150));
}

function runActivity(type){if(type==="target")target();else if(type==="color")color();else if(type==="avoid")avoid();else if(type==="go")goNoGo();else if(type==="double")doubleTarget();else if(type==="multitap")multiTap();else if(type==="switch")switchSignal();else if(type==="delay")delayedTap();else if(type==="rhythm")rhythm();else if(type==="precision")precision();else if(type==="chase")chase();else if(type==="alternate")alternate();else if(type==="combo")combo();else if(type==="mirror")mirror();else sequence()}
function goNoGo(){
 const token=begin(),go=Math.random()>.38;
 $('game-stage').innerHTML=`<div class="reflex-stage">${head('go','Wait for the signal. Tap GO, but do not tap NO-GO.')}<div class="reflex-signal" id="go-signal">Get ready…</div><div id="go-button-wrap" class="reflex-options"><button id="go-button" class="reflex-target" disabled>RESPOND</button></div></div>`;
 const b=$('go-button');
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$('go-signal').textContent=go?'GO':'NO-GO';b.disabled=false;S.active=true;let responded=false;
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
   b.style.width='58px';b.style.height='58px';b.disabled=true;
   b.setAttribute('aria-label',`Target ${i+1}`);
   b.onclick=()=>{
     if(!S.active||b.disabled)return;
     if((S.doubleStep||0)===0&&i===first){
       S.doubleStep=1;
       b.textContent='';b.disabled=true;
       cells[second].textContent='🎯';cells[second].disabled=false;
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
   cells[first].disabled=false;
   S.active=true;
   $('double-count').textContent='Target 1 — tap it';
   S.timer=setTimeout(()=>fail(),responseWindow(.9));
 },signalDelay());
}

function target(){
 const token=begin(),count=clamp(3+Math.floor((S.level-1)/4)+activity()+ageDifficulty(),3,9),size=clamp(76-Math.floor(S.level/4)*4,48,76);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("target","Wait for the target. Then tap it before time runs out.")}<p class="reflex-count">Get ready…</p><div id="target-board" class="reflex-options"></div></div>`;
 const board=$("target-board"),targetIndex=(S.level*7+activity()*3+S.age)%count;
 for(let i=0;i<count;i++){const b=document.createElement("button");b.className="reflex-target";b.style.width=size+"px";b.style.height=size+"px";b.disabled=true;b.textContent="";b.setAttribute("aria-label",`Target ${i+1}`);b.onclick=()=>i===targetIndex?complete():fail();board.appendChild(b)}
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;board.querySelectorAll("button").forEach((b,i)=>{b.disabled=false;if(i===targetIndex)b.textContent="🎯"});S.active=true;S.timer=setTimeout(fail,responseWindow(.9))},signalDelay());
}
function color(){
 const token=begin(),correct=COLORS[(S.level*3+activity()*2+S.age)%COLORS.length],optionCount=clamp(4+Math.floor(S.level/7),4,6);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("color","Wait for the color flash, then choose the matching color.")}<div class="reflex-signal" id="reflex-signal">?</div><div id="reflex-colors" class="reflex-options"></div></div>`;
 const box=$("reflex-colors"),options=shuffle([correct,...shuffle(COLORS.filter(x=>x.name!==correct.name)).slice(0,optionCount-1)]);
 options.forEach(x=>{const b=document.createElement("button");b.className="reflex-color";b.innerHTML=`<span style="background:${x.hex}"></span>${x.name}`;b.disabled=true;b.onclick=()=>x.name===correct.name?complete():fail();box.appendChild(b)});
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("reflex-signal").textContent=correct.emoji;box.querySelectorAll("button").forEach(b=>b.disabled=false);S.active=true;S.timer=setTimeout(fail,responseWindow(1))},signalDelay());
}
function avoid(){
 const token=begin(),safe=SHAPES[(S.level*2+activity()+S.age)%SHAPES.length],hazard=SHAPES[(S.level*2+activity()+4)%SHAPES.length],count=clamp(4+Math.floor(S.level/6),4,7);
 const pool=shuffle(SHAPES.filter(x=>x!==safe&&x!==hazard)).slice(0,count-2);
 const options=shuffle([safe,hazard,...pool]);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("avoid","The safe symbol will be revealed. Tap only that symbol.")}<div class="reflex-signal" id="avoid-signal">?</div><div id="avoid-options" class="reflex-options"></div></div>`;
 const box=$("avoid-options");options.forEach(x=>{const b=document.createElement("button");b.className="reflex-symbol";b.textContent=x;b.disabled=true;b.onclick=()=>x===safe?complete():fail();box.appendChild(b)});
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("avoid-signal").textContent=`SAFE: ${safe}`;box.querySelectorAll("button").forEach(b=>b.disabled=false);S.active=true;S.timer=setTimeout(fail,responseWindow(.95))},signalDelay());
}
function multiTap(){
 const token=begin(),len=clamp(2+Math.floor((S.level-1)/5)+activity()+ageDifficulty(),2,6),positions=shuffle([...Array(6).keys()]).slice(0,len);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("multitap","Watch the target order, then tap the same positions.")}<div id="multi-board" class="reflex-options"></div></div>`;
 const board=$("multi-board");for(let i=0;i<6;i++){const b=document.createElement("button");b.className="reflex-target";b.textContent="";b.dataset.i=i;b.disabled=true;board.appendChild(b)}
 let show=0;const reveal=()=>{if(token!==S.reflexToken)return;if(show<positions.length){board.querySelectorAll("button").forEach(b=>b.textContent="");board.querySelectorAll("button")[positions[show]].textContent="🎯";show++;S.timer=setTimeout(reveal,Math.max(210,680-S.level*18));}else{let n=0;board.querySelectorAll("button").forEach(b=>{b.disabled=false;b.onclick=()=>{if(!S.active)return;const i=Number(b.dataset.i);if(i!==positions[n])return fail();b.classList.add("good");if(++n===positions.length)complete()}});S.active=true;S.timer=setTimeout(fail,responseWindow(1.1)+positions.length*180)}};reveal();
}
function sequence(){
 const token=begin(),len=clamp(3+Math.floor((S.level-1)/4)+activity()+ageDifficulty(),3,9),mode=S.level%4;
 const seq=Array.from({length:len},(_,i)=>SHAPES[(S.level*2+i*(mode+1)+activity()*2+S.age)%SHAPES.length]);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("sequence","Memorize the sequence. It will disappear, then repeat it.")}<div class="reflex-sequence">${seq.map(x=>`<span>${x}</span>`).join("")}</div><p class="reflex-count">Memorize…</p></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("game-stage").innerHTML=`<div class="reflex-stage">${head("sequence","Repeat the sequence in the same order.")}<div id="reaction-seq" class="reflex-options"></div><div id="reaction-picked" class="picked-sequence"></div></div>`;const box=$("reaction-seq"),picked=$("reaction-picked");let n=0;S.active=true;
 const options=shuffle(SHAPES.slice(0,clamp(5+Math.floor(S.level/6),5,8)));
 options.forEach(x=>{const b=document.createElement("button");b.className="reflex-symbol";b.textContent=x;b.onclick=()=>{if(!S.active)return;if(x!==seq[n]){b.classList.add("bad");fail()}else{b.classList.add("good","selected");b.dataset.picks=String((Number(b.dataset.picks)||0)+1);picked.textContent+=(n?" → ":"")+x;if(++n===seq.length)complete()}};box.appendChild(b)});
 S.timer=setTimeout(()=>{if(S.active)fail()},responseWindow(.9)+len*260)},Math.max(700,850+len*90));
}
window.MQReflexArena={run:instruction};
})();
