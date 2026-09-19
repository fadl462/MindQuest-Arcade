(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=["fill","pattern","path","mirror"];
const INFO={
 fill:["Block Builder","Fill the required spaces without using a blocked cell.","Choose exactly the number of build cells requested."],
 pattern:["Pattern Builder","Complete the structure by following its repeating pattern.","Study the filled cells, then choose the missing cell."],
 path:["Path Builder","Connect the start to the finish using the fewest steps.","Select the next correct cell in the path."],
 mirror:["Mirror Builder","Build the mirror image of the shown structure.","Choose the cell that completes the reflected design."]
};
function activity(){return Number.isInteger(S.builderActivity)?S.builderActivity:0}
function size(){return S.level<7?3:S.level<14?4:5}
function ageScale(){return [0.72,0.88,1,1.12,1.24][S.age]||1}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">BUILDER</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four building challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next build…`;if(last){S.builderActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}else{S.builderActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;MQ.levelFailed()}
function instruction(){
 const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);
 $("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">🧩</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>🧩 Plan before you place</span><span>✓ One correct build</span></div><button id="builder-start" class="primary-btn ui-start">Start Activity →</button></div>`;
 $("builder-start").onclick=()=>runActivity(type);
}
function makeGrid(n){return `<div class="builder-lab-grid" style="--n:${n}">${Array.from({length:n*n},(_,i)=>`<button type="button" class="builder-cell" data-i="${i}"></button>`).join("")}</div>`}
function runActivity(type){if(type==="fill")fill();else if(type==="pattern")pattern();else if(type==="path")path();else mirror()}
function fill(){
 const n=size(),total=n*n,need=clamp(Math.round((2+Math.floor(S.level*.55)+activity())*ageScale()),2,total-2),blocked=shuffle([...Array(total).keys()]).slice(0,Math.min(2+Math.floor(S.level/7),4));
 $("game-stage").innerHTML=`<div class="builder-stage">${head("fill")}<p class="builder-task">Build with <b>${need}</b> blocks. Avoid the blocked cells.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];blocked.forEach(i=>cells[i].classList.add("blocked"));let count=0;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled||blocked.includes(i))return;b.classList.add("filled");b.disabled=true;if(++count===need)complete()});
}
function pattern(){
 const n=size(),total=n*n;
 const target=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(((r+c+S.level+activity())%3)===0)target.push(r*n+c);
 const missing=target[(S.level+activity())%target.length],shown=target.filter(x=>x!==missing);
 $("game-stage").innerHTML=`<div class="builder-stage">${head("pattern")}<p class="builder-task">Which cell completes the pattern?</p>${makeGrid(n)}<div id="builder-choices" class="builder-choice-row"></div></div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];shown.forEach(i=>cells[i].classList.add("filled"));
 const box=$("builder-choices");shuffle([missing,...shuffle([...Array(total).keys()].filter(x=>!target.includes(x))).slice(0,3)]).forEach(i=>{const b=document.createElement("button");b.className="word-option";b.textContent=`Cell ${i+1}`;b.onclick=()=>i===missing?complete():fail();box.appendChild(b)});S.active=true;
}
function path(){
 const n=size(),pathCells=[];let r=0,c=0;pathCells.push(0);while(c<n-1){c++;pathCells.push(r*n+c)}while(r<n-1){r++;pathCells.push(r*n+c)}
 const decoys=shuffle([...Array(n*n).keys()].filter(i=>!pathCells.includes(i))).slice(0,Math.min(4,n+1));
 $("game-stage").innerHTML=`<div class="builder-stage">${head("path")}<p class="builder-task">Start at <b>🚀</b> and reach <b>🏁</b>. Choose the next cell.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];cells[0].textContent="🚀";cells[n*n-1].textContent="🏁";decoys.forEach(i=>cells[i].classList.add("blocked"));let step=1;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled||decoys.includes(i))return;if(i===pathCells[step]){b.classList.add("filled");b.disabled=true;step++;if(step===pathCells.length)complete()}else fail()});
}
function mirror(){
 const n=size(),left=[];for(let r=0;r<n;r++)for(let c=0;c<Math.ceil(n/2);c++)if(((r*2+c+S.level+activity())%3)===0)left.push(r*n+c);
 const target=left.map(i=>{const r=Math.floor(i/n),c=i%n;return r*n+(n-1-c)}),targets=[...new Set(target.filter(i=>!left.includes(i)))];
 $("game-stage").innerHTML=`<div class="builder-stage">${head("mirror")}<p class="builder-task">Tap the cells that make the right side mirror the left.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];left.forEach(i=>cells[i].classList.add("filled"));let done=0;S.active=true;
 cells.forEach((b,i)=>{if(left.includes(i))b.disabled=true;b.onclick=()=>{if(!S.active||b.disabled)return;if(targets.includes(i)){b.classList.add("filled");b.disabled=true;if(++done===targets.length)complete()}else fail()}});
}
window.MQBuilder={run:instruction};
})();