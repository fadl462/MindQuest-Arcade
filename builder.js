(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=["fill","pattern","path","mirror","count","rotate","balance","sequence","symmetry","packing"];
const INFO={
 fill:["Block Builder","Fill the required spaces without using blocked cells.","Choose exactly the number of build cells requested."],
 pattern:["Pattern Builder","Complete the structure by following its visual rule.","Study the filled cells, then choose the missing cell."],
 path:["Path Builder","Connect the start to the finish while avoiding blocked cells.","Select the next correct cell in the path."],
 mirror:["Mirror Builder","Complete the reflected half of the structure.","Copy the pattern across the mirror line." ],
 count:["Count Builder","Read the construction target and select the grid with the correct number of filled cells.","Count carefully and choose the matching construction."],
 rotate:["Rotation Builder","Identify the cell pattern after a quarter-turn rotation.","Imagine rotating the shape 90 degrees clockwise, then choose the new position."],
 balance:["Balance Builder","Choose the structure that uses the correct total weight.","Compare the two sides and choose the option that balances the scale."],
 sequence:["Build Sequence","Choose the correct order for constructing a simple structure.","Follow the dependency: foundation before walls, walls before roof."],
 symmetry:["Symmetry Builder","Complete the missing half of a symmetrical design.","Choose the cell that makes the pattern balanced across the centre."],
 packing:["Packing Builder","Choose how many items can fit without exceeding the available space.","Use the capacity and item size together; do not exceed the limit."]
};
function activity(){return Number.isInteger(S.builderActivity)?S.builderActivity:0}
function ageScale(){return [0.72,0.88,1,1.12,1.24][S.age]||1}
function size(){return S.level<6?3:S.level<13?4:5}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">BUILDER</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four building challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next build…`;if(last){S.builderActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}else{S.builderActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);$("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">🧩</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>🧩 Plan before you place</span><span>✓ Four activities per level</span></div><button id="builder-start" class="primary-btn ui-start">Start Activity →</button></div>`;$("builder-start").onclick=()=>runActivity(type)}
function buildSequence(){
 const sets=[
  ['Lay the foundation','Build the walls','Add the roof','Decorate'],
  ['Choose the plan','Place the base','Add supports','Finish the details'],
  ['Clear the site','Place the base','Add the structure','Inspect the build'],
  ['Measure the space','Prepare materials','Assemble parts','Check stability']
 ];
 const seq=sets[(S.level+activity()+S.age)%sets.length];
 const correct=seq.join(' → ');
 const variants=[correct,[...seq].reverse().join(' → '),[seq[1],seq[0],seq[2],seq[3]].join(' → '),[seq[0],seq[2],seq[1],seq[3]].join(' → ')];
 $('game-stage').innerHTML=`<div class="builder-stage">${head('sequence')}<div class="builder-prompt"><h3>Which construction order is correct?</h3><div class="builder-options">${shuffle(variants).map(v=>`<button class="builder-option" data-v="${v}">${v}</button>`).join('')}</div></div></div>`;
 S.active=true;document.querySelectorAll('.builder-option').forEach(b=>b.onclick=()=>b.dataset.v===correct?complete():fail());
}

function symmetry(){
 const n=S.level<8?3:S.level<15?4:5,center=Math.floor(n/2);
 const cells=Array.from({length:n*n},()=>false);
 for(let r=0;r<n;r++) for(let c=0;c<center;c++) if((r+c+S.level)%3===0){cells[r*n+c]=true;cells[r*n+(n-1-c)]=true;}
 const missing=[];for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(c>=center && cells[r*n+c]!==cells[r*n+(n-1-c)]) missing.push(r*n+c);
 const target=missing[0]??center*n+center; const distract=[(target+n-1)%(n*n),(target+1)%(n*n),(target+n)%(n*n)];
 $('game-stage').innerHTML=`<div class="builder-stage">${head('symmetry')}<div class="builder-prompt"><h3>Which cell should be filled?</h3><div class="builder-lab-grid" style="--n:${n}">${cells.map((v,i)=>`<button class="builder-cell ${v?'filled':''}" data-i="${i}">${i===target?'?':''}</button>`).join('')}</div></div></div>`;S.active=true;document.querySelectorAll('.builder-cell').forEach(b=>b.onclick=()=>b.dataset.i===String(target)?complete():fail());
}
function packing(){
 const capacity=6+Math.floor(S.level/4)+activity(),item=1+(S.level+S.age+activity())%3,correct=Math.floor(capacity/item),choices=[correct,Math.max(1,correct-1),correct+1,correct+2];
 $("game-stage").innerHTML=`<div class="builder-stage">${head('packing')}<div class="builder-prompt"><h3>How many items fit?</h3><p>Space available: <b>${capacity}</b> units. Each item uses <b>${item}</b> units.</p><div class="builder-options">${shuffle(choices).map(v=>`<button class="builder-option" data-v="${v}">${v} items</button>`).join('')}</div></div></div>`;
 S.active=true;document.querySelectorAll('.builder-option').forEach(b=>b.onclick=()=>b.dataset.v===String(correct)?complete():fail());
}

function runActivity(type){if(type==="fill")fill();else if(type==="pattern")pattern();else if(type==="path")path();else if(type==="count")count();else if(type==="rotate")rotate();else if(type==="balance")balance();else if(type==="sequence")buildSequence();else if(type==="symmetry")symmetry();else if(type==="packing")packing();else mirror()}
function makeGrid(n){return `<div class="builder-lab-grid" style="--n:${n}">${Array.from({length:n*n},(_,i)=>`<button type="button" class="builder-cell" data-i="${i}"></button>`).join("")}</div>`}
function fill(){
 const n=size(),total=n*n,need=clamp(Math.round((2+Math.floor(S.level*.5)+activity())*ageScale()),2,total-2),blockedCount=clamp(1+Math.floor(S.level/5),1,4),blocked=shuffle([...Array(total).keys()]).slice(0,blockedCount);
 $("game-stage").innerHTML=`<div class="builder-stage">${head("fill")}<p class="builder-task">Build with <b>${need}</b> blocks. Avoid the blocked cells.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];blocked.forEach(i=>cells[i].classList.add("blocked"));let count=0;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled||blocked.includes(i))return;b.classList.add("filled");b.disabled=true;if(++count===need)complete()});
}
function pattern(){
 const n=size(),total=n*n,mode=(S.level+activity())%4,target=[];
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){
   const yes=mode===0?((r+c+S.level)%2===0):mode===1?((r===c)||(r+c===n-1)):mode===2?((r+c+S.level)%3===0):((r%2===0)&&(c%2===0));
   if(yes)target.push(r*n+c);
 }
 const missing=target[(S.level*2+activity())%target.length];
 $("game-stage").innerHTML=`<div class="builder-stage">${head("pattern",`Pattern ${mode+1}: find the one missing cell.`)}<p class="builder-task">Which cell completes the structure?</p>${makeGrid(n)}<div id="builder-choices" class="builder-choice-row"></div></div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];target.filter(x=>x!==missing).forEach(i=>cells[i].classList.add("filled"));
 const wrongs=shuffle([...Array(total).keys()].filter(x=>!target.includes(x))).slice(0,3),box=$("builder-choices");shuffle([missing,...wrongs]).forEach(i=>{const b=document.createElement("button");b.className="word-option";b.textContent=`Cell ${i+1}`;b.onclick=()=>i===missing?complete():fail();box.appendChild(b)});S.active=true;
}
function path(){
 const n=size(),total=n*n,variant=S.level%4,path=[];
 // Four distinct route families: top-row, left-column, staircase, or perimeter-to-centre.
 if(variant===0){for(let c=0;c<n;c++)path.push(c);for(let r=1;r<n;r++)path.push(r*n+n-1)}
 else if(variant===1){for(let r=0;r<n;r++)path.push(r*n);for(let c=1;c<n;c++)path.push((n-1)*n+c)}
 else if(variant===2){let r=0,c=0;path.push(0);while(r<n-1||c<n-1){if(c<n-1){c++;path.push(r*n+c)}if(r<n-1){r++;path.push(r*n+c)}}}
 else {for(let c=0;c<n;c++)path.push(c);for(let r=1;r<n;r++)path.push(r*n+n-1);for(let c=n-2;c>=0;c--)path.push((n-1)*n+c)}
 const blocked=shuffle([...Array(total).keys()].filter(i=>!path.includes(i))).slice(0,clamp(2+Math.floor(S.level/4),2,total-path.length-1));
 $("game-stage").innerHTML=`<div class="builder-stage">${head("path","Route ${variant+1}: follow the safe route step by step.")}<p class="builder-task">Start at <b>🚀</b> and reach <b>🏁</b>. Choose the next cell.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];cells[path[0]].textContent="🚀";cells[path[path.length-1]].textContent="🏁";blocked.forEach(i=>cells[i].classList.add("blocked"));let step=1;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled||blocked.includes(i))return;if(i===path[step]){b.classList.add("filled");b.disabled=true;step++;if(step===path.length)complete()}else fail()});
}
function count(){
 const n=size(),target=clamp(2+Math.floor(S.level/3)+activity(),2,n*n-1);
 const choices=[target,target+1,target+2,Math.max(1,target-1)].filter((v,i,a)=>v<=n*n&&a.indexOf(v)===i);
 $('game-stage').innerHTML=`<div class="builder-stage">${head('count',`Build count ${target}: choose the option containing exactly the requested number of blocks.`)}<p class="builder-task">How many blocks should the finished structure contain?</p><div class="builder-count-options">${shuffle(choices).map(v=>`<button class="word-option" data-count="${v}">${v} blocks</button>`).join('')}</div></div>`;
 S.active=true;document.querySelectorAll('.builder-count-options [data-count]').forEach(b=>b.onclick=()=>Number(b.dataset.count)===target?complete():fail());
}

function rotate(){
 const n=size(),r=(S.level+activity())%n,c=(S.level*2+S.age)%n;
 const target=(c)*n+(n-1-r);
 const wrongs=shuffle([...Array(n*n).keys()].filter(i=>i!==target)).slice(0,3);
 $('game-stage').innerHTML=`<div class=\"builder-stage\">${head('rotate',`Rotate the highlighted cell 90° clockwise.`)}<p class=\"builder-task\">Where does it land?</p>${makeGrid(n)}<div id=\"rotate-options\" class=\"builder-choice-row\"></div></div>`;
 const cells=[...document.querySelectorAll('.builder-cell')];cells[r*n+c].classList.add('filled');const box=$('rotate-options');shuffle([target,...wrongs]).forEach(i=>{const b=document.createElement('button');b.className='word-option';b.textContent=`Cell ${i+1}`;b.onclick=()=>i===target?complete():fail();box.appendChild(b)});S.active=true;
}
function rotate(){
 const variants=[["↑","→","↓","←"],["└","┌","┐","┘"],["▲","▶","▼","◀"]],v=variants[(S.level+activity())%variants.length],correct=v[(S.level+activity())%4];
 $("game-stage").innerHTML=`<div class="builder-stage">${head("rotate")}<p class="builder-task">The shape turns one quarter-turn at a time. Which direction comes next?</p><div class="rotation-display">${v.slice(0,3).map(x=>`<span>${x}</span>`).join("<b>→</b>")}<b>→</b><span>?</span></div><div class="builder-choice-row" id="rotation-options"></div></div>`;
 const box=$("rotation-options");S.active=true;shuffle(v).forEach(x=>{const b=document.createElement("button");b.className="word-option";b.textContent=x;b.onclick=()=>x===correct?complete():fail();box.appendChild(b)});
}

function balance(){const left=2+(S.level%5),right=left+(activity()%2);const target=left*2+right;const correct=target;const choices=[correct,correct+1,Math.max(1,correct-1),correct+2];const i=INFO.balance;$('game-stage').innerHTML=`<div class="builder-stage">${head('balance')}<div class="builder-prompt"><h3>Balance the structure</h3><p>Left side: ${left} blocks + ${right} blocks. What total weight must the right side have?</p><div class="builder-options">${shuffle(choices).map(v=>`<button class="builder-option" data-v="${v}">${v} blocks</button>`).join('')}</div></div></div>`;S.active=true;document.querySelectorAll('.builder-option').forEach(b=>b.onclick=()=>b.dataset.v===String(correct)?complete():fail())}

function mirror(){
 const n=size(),axis=Math.floor(n/2),mode=S.level%3,left=[];
 for(let r=0;r<n;r++)for(let c=0;c<=axis;c++){
   const yes=mode===0?((r+c+S.level)%3===0):mode===1?((r*2+c+S.level)%4===0):((r===c)||(r+c===n-1));
   if(yes&&c<axis)left.push(r*n+c);
 }
 const targets=[...new Set(left.map(i=>{const r=Math.floor(i/n),c=i%n;return r*n+(n-1-c)}))];
 $("game-stage").innerHTML=`<div class="builder-stage">${head("mirror",`Mirror pattern ${mode+1}: complete the reflected side.`)}<p class="builder-task">Tap the cells that mirror the left side.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];left.forEach(i=>{cells[i].classList.add("filled");cells[i].disabled=true});let done=0;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled)return;if(targets.includes(i)){b.classList.add("filled");b.disabled=true;if(++done===targets.length)complete()}else fail()});
}
window.MQBuilder={run:instruction};
})();
