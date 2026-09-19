(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const TYPES=["target","color","avoid","sequence"];
const COLORS=[
 {name:"red",hex:"#ef4444",emoji:"🔴"},{name:"blue",hex:"#3b82f6",emoji:"🔵"},
 {name:"green",hex:"#22c55e",emoji:"🟢"},{name:"yellow",hex:"#eab308",emoji:"🟡"},
 {name:"purple",hex:"#8b5cf6",emoji:"🟣"},{name:"orange",hex:"#f97316",emoji:"🟠"}
];
const SHAPES=["●","▲","■","◆","★","⬟"];
const INFO={
 target:["Target Rush","Wait for the target, then tap it as quickly as possible.","Tap only after the target appears."],
 color:["Color Flash","Watch the signal and tap the matching color.","Ignore the decoys and react to the target color."],
 avoid:["Safe Tap","Tap the safe symbol and avoid the hazard.","Only the safe target earns the level."],
 sequence:["Reaction Sequence","Watch the short sequence, then repeat it.","Tap the symbols in exactly the order shown."]
};
function ageFactor(){return [1.35,1.15,1,.88,.78][S.age]||1}
function activity(){return Number.isInteger(S.reflexActivity)?S.reflexActivity:0}
function cfg(){
 const a=activity(), l=S.level;
 return {delay:clamp(Math.round((1200-l*34-a*35)*ageFactor()),260,1200),
         window:clamp(Math.round((1500-l*28-a*35)*ageFactor()),520,1500),
         count:clamp(2+Math.floor(l/5)+a,2,6)};
}
function head(type,sub){
 const i=INFO[type];
 return `<div class="arcade-lab-head"><div><span class="lab-kind">REFLEX ARENA</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`;
}
function startRound(){S.active=false;clearTimeout(S.timer);S.reflexToken=(S.reflexToken||0)+1;return S.reflexToken}
function complete(){
 if(!S.active)return; S.active=false; clearTimeout(S.timer);
 const last=activity()===3;
 $("game-message").textContent=last?"✓ Four reflex challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next challenge…`;
 if(last){S.reflexActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}
 else{S.reflexActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}
}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){
 const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];
 S.active=false;clearTimeout(S.timer);
 $("game-stage").innerHTML=`<div class="universal-instruction">
 <div class="ui-icon">⚡</div><span class="ui-skill">PSYCHOMOTOR</span><h2>${i[0]}</h2>
 <p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div>
 <div class="ui-meta"><span>⚡ Faster as you advance</span><span>✓ One correct response</span></div>
 <button id="reflex-start" class="primary-btn ui-start">Start Activity →</button></div>`;
 $("reflex-start").onclick=()=>runActivity(type);
}
function runActivity(type){if(type==="target")target();else if(type==="color")color();else if(type==="avoid")avoid();else sequence()}
function target(){
 const token=startRound(),c=cfg(),size=clamp(78-S.level*1.2,48,78);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("target")}<p class="reflex-count">Get ready…</p><div class="reflex-target-slot"><button id="reflex-target" class="reflex-target" disabled>+</button></div></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;const b=$("reflex-target");b.disabled=false;b.textContent="🎯";b.style.width=size+"px";b.style.height=size+"px";b.onclick=complete;S.active=true;S.timer=setTimeout(()=>{if(S.active)fail()},c.window)},c.delay);
}
function color(){
 const token=startRound(),c=cfg(),correct=COLORS[(S.level*2+activity()+S.age)%COLORS.length];
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("color","Wait for the flash, then tap the matching color.")}<div class="reflex-signal" id="reflex-signal">?</div><div id="reflex-colors" class="reflex-options"></div></div>`;
 const box=$("reflex-colors");
 shuffle(COLORS.slice(0,4+(S.level>10?1:0))).forEach(x=>{const b=document.createElement("button");b.className="reflex-color";b.innerHTML=`<span style="background:${x.hex}"></span>${x.name}`;b.disabled=true;b.onclick=()=>x.name===correct.name?complete():fail();box.appendChild(b)});
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("reflex-signal").textContent=correct.emoji;box.querySelectorAll("button").forEach(b=>b.disabled=false);S.active=true;S.timer=setTimeout(()=>{if(S.active)fail()},c.window)},c.delay);
}
function avoid(){
 const token=startRound(),c=cfg(),safe=SHAPES[(S.level+activity())%SHAPES.length],hazard=SHAPES[(S.level+activity()+3)%SHAPES.length];
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("avoid","A safe symbol appears with hazards. Tap only the safe one.")}<div class="reflex-signal" id="avoid-signal">?</div><div id="avoid-options" class="reflex-options"></div></div>`;
 const box=$("avoid-options");
 shuffle([safe,hazard,...shuffle(SHAPES.filter(x=>x!==safe&&x!==hazard)).slice(0,2+(S.level>12?1:0))]).forEach(x=>{const b=document.createElement("button");b.className="reflex-symbol";b.textContent=x;b.disabled=true;b.onclick=()=>x===safe?complete():fail();box.appendChild(b)});
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("avoid-signal").textContent="GO";box.querySelectorAll("button").forEach(b=>b.disabled=false);S.active=true;S.timer=setTimeout(()=>{if(S.active)fail()},c.window)},c.delay);
}
function sequence(){
 const token=startRound(),c=cfg(),len=c.count;
 const seq=Array.from({length:len},(_,i)=>SHAPES[(S.level*2+i*2+activity()+S.age)%SHAPES.length]);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("sequence","Watch the order, then repeat it quickly.")}<div class="reflex-sequence">${seq.map(x=>`<span>${x}</span>`).join("")}</div></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("game-stage").innerHTML=`<div class="reflex-stage">${head("sequence","Repeat the sequence.")}<div id="reaction-seq" class="reflex-options"></div><div id="reaction-picked" class="picked-sequence"></div></div>`;const box=$("reaction-seq"),picked=$("reaction-picked");let n=0;S.active=true;
 shuffle(SHAPES.slice(0,Math.min(5+Math.floor(S.level/7),SHAPES.length))).forEach(x=>{const b=document.createElement("button");b.className="reflex-symbol";b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==seq[n]){b.classList.add("bad");fail()}else{b.disabled=true;b.classList.add("good");picked.textContent+=(n?" → ":"")+x;if(++n===seq.length)complete()}};box.appendChild(b)});
 S.timer=setTimeout(()=>{if(S.active)fail()},c.window+len*280)},Math.max(650,900-c.delay/3));
}
window.MQReflexArena={run:instruction};
})();