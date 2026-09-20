(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const COLORS=[
 {name:"red",hex:"#ef4444",emoji:"🔴"},{name:"blue",hex:"#3b82f6",emoji:"🔵"},
 {name:"green",hex:"#22c55e",emoji:"🟢"},{name:"yellow",hex:"#eab308",emoji:"🟡"},
 {name:"purple",hex:"#8b5cf6",emoji:"🟣"},{name:"orange",hex:"#f97316",emoji:"🟠"}
];
const SHAPES=["●","▲","■","◆","★","⬟","✚","✦"];
const INFO={
 target:["Target Rush","Wait for the target, then tap it as quickly as possible.","Tap the target only after it appears."],
 color:["Color Flash","Watch the signal and tap the matching color.","Ignore the decoys and react to the target color."],
 avoid:["Safe Tap","Find the safe symbol among the hazards.","Tap only the safe symbol."],
 sequence:["Reaction Sequence","Watch the short sequence, then repeat it.","Tap the symbols in exactly the order shown."]
};
function activity(){return Number.isInteger(S.reflexActivity)?S.reflexActivity:0}
function ageFactor(){return [1.35,1.15,1,.88,.78][S.age]||1}
function difficulty(){return S.level+activity()*.55}
function responseWindow(mult=1){return clamp(Math.round((1750-difficulty()*42)*ageFactor()*mult),520,1750)}
function signalDelay(){return clamp(Math.round((980-difficulty()*18)*ageFactor()),330,980)}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">REFLEX ARENA</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function begin(){S.active=false;clearTimeout(S.timer);S.reflexToken=(S.reflexToken||0)+1;return S.reflexToken}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four reflex challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next challenge…`;if(last){S.reflexActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}else{S.reflexActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){
 const type=["target","color","avoid","sequence"][(S.level-1+activity())%4],i=INFO[type];S.active=false;clearTimeout(S.timer);
 $("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">⚡</div><span class="ui-skill">PSYCHOMOTOR</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>⚡ Faster as you advance</span><span>✓ Four activities per level</span></div><button id="reflex-start" class="primary-btn ui-start">Start Activity →</button></div>`;
 $("reflex-start").onclick=()=>runActivity(type);
}
function runActivity(type){if(type==="target")target();else if(type==="color")color();else if(type==="avoid")avoid();else sequence()}
function target(){
 const token=begin(),count=clamp(3+Math.floor((S.level-1)/4)+activity(),3,8),size=clamp(76-Math.floor(S.level/4)*4,48,76);
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
function sequence(){
 const token=begin(),len=clamp(3+Math.floor((S.level-1)/4)+activity(),3,8),mode=S.level%4;
 const seq=shuffle(SHAPES.slice()).slice(0,len);
 $("game-stage").innerHTML=`<div class="reflex-stage">${head("sequence","Memorize the sequence. It will disappear, then repeat it.")}<div class="reflex-sequence">${seq.map(x=>`<span>${x}</span>`).join("")}</div><p class="reflex-count">Memorize…</p></div>`;
 S.timer=setTimeout(()=>{if(token!==S.reflexToken)return;$("game-stage").innerHTML=`<div class="reflex-stage">${head("sequence","Repeat the sequence in the same order.")}<div id="reaction-seq" class="reflex-options"></div><div id="reaction-picked" class="picked-sequence"></div></div>`;const box=$("reaction-seq"),picked=$("reaction-picked");let n=0;S.active=true;
 const options=shuffle(SHAPES.slice(0,clamp(5+Math.floor(S.level/6),5,8)));
 options.forEach(x=>{const b=document.createElement("button");b.className="reflex-symbol";b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==seq[n]){b.classList.add("bad");fail()}else{b.disabled=true;b.classList.add("good");picked.textContent+=(n?" → ":"")+x;if(++n===seq.length)complete()}};box.appendChild(b)});
 S.timer=setTimeout(()=>{if(S.active)fail()},responseWindow(.9)+len*260)},Math.max(700,850+len*90));
}
window.MQReflexArena={run:instruction};
})();
