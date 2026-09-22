(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=["fill","pattern","path","mirror","count","rotate","balance","sequence","symmetry","packing","allocate","weight","maze","tileMatch"];
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
 packing:["Packing Builder","Choose how many items can fit without exceeding the available space.","Use the capacity and item size together; do not exceed the limit."],
allocate:["Resource Allocation","Allocate a limited number of blocks to the structure.","Select exactly the required number of blocks before building."],
tileMatch:['Tile Match','Build the exact target pattern by selecting the required cells.','Select every cell that belongs to the target pattern, and no others.'],
maze:['Maze Builder','Find a route from the start to the goal without stepping on blocked cells.','Tap adjacent cells to build a valid path from START to GOAL.'],
weight:["Weight Balance","Balance two sides using blocks with different weights.","Choose the added weight that makes both sides equal."]
};
function activity(){return Number.isInteger(S.builderActivity)?S.builderActivity:0}
function ageScale(){return [0.72,0.88,1,1.12,1.24][S.age]||1}
function size(){return S.level<5?3:S.level<10?4:5}
function tier(){return S.level<5?0:S.level<9?1:S.level<13?2:S.level<17?3:4}
function ageComplexity(){return [0,0,0,1,1][S.age]||0}
function buildComplexity(){return tier()+Math.min(3,activity())+ageComplexity()*.5}

function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">BUILDER</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four building challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next build…`;if(last){S.builderActivity=0;S.timer=setTimeout(()=>{MQ.state.active=true;MQ.levelComplete()},650)}else{S.builderActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);$("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">🧩</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>🧩 Plan before you place</span><span>✓ Four activities per level</span></div><button id="builder-start" class="primary-btn ui-start">Start Activity →</button></div>`;$("builder-start").onclick=()=>runActivity(type)}
function weight(){
 const left=6+tier()+(S.level%6),right=2+((S.level+activity()+S.age)%4),need=left-right;
 const options=[...new Set([need,Math.max(1,need-1),need+1,need+2])];
 choiceBuilder('weight',`The left side weighs <b>${left}</b> units and the right side weighs <b>${right}</b> units. How much weight must you add to the right side to balance the structure?`,options,need);
}
function choiceBuilder(type,prompt,choices,correct){
 $('game-stage').innerHTML=`<div class="builder-stage">${head(type)}<div class="builder-prompt">${prompt}</div><div class="builder-options" id="builder-choice"></div></div>`;const box=$('builder-choice');S.active=true;shuffle(choices).forEach(x=>{const b=document.createElement('button');b.className='builder-option';b.textContent=x;b.onclick=()=>Number(x)===Number(correct)?complete():fail();box.appendChild(b)})
}
function allocate(){
 const total=S.level<8?8:S.level<15?12:16,target=2+(S.level+activity())%5,need=Math.min(total-2,target+2);
 $('game-stage').innerHTML=`<div class="builder-stage">${head('allocate','Choose exactly the right number of blocks without exceeding the build budget.')}<div class="builder-prompt"><h3>Resource Allocation</h3><p>You have <b>${total}</b> blocks. Your structure needs <b>${need}</b> blocks.</p><div id="alloc" class="builder-options"></div><button id="alloc-done" class="primary-btn">Build Structure →</button><div id="alloc-count" style="margin-top:12px">Selected: 0</div></div></div>`;
 const box=$('alloc');let n=0;S.active=true;for(let i=0;i<total;i++){const b=document.createElement('button');b.className='builder-option';b.textContent='□';b.onclick=()=>{if(!S.active)return;b.classList.toggle('good');n+=b.classList.contains('good')?1:-1;$('alloc-count').textContent=`Selected: ${n}`};box.appendChild(b)}$('alloc-done').onclick=()=>n===need?complete():fail();
}
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
 for(let r=0;r<n;r++) for(let c=0;c<Math.ceil(n/2);c++){
   const yes=(r+c+S.level+activity())%3===0;
   if(yes){cells[r*n+c]=true;cells[r*n+(n-1-c)]=true;}
 }
 const candidates=[];
 for(let r=0;r<n;r++) for(let c=0;c<Math.floor(n/2);c++) if(cells[r*n+c]) candidates.push(r*n+c);
 if(!candidates.length){
   const fallbackRow=(S.level+activity())%n;
   const fallbackCol=(S.level+activity())%Math.floor(n/2);
   const fallback=fallbackRow*n+fallbackCol;
   cells[fallback]=true;
   cells[fallbackRow*n+(n-1-fallbackCol)]=true;
   candidates.push(fallback);
 }
 const source=candidates[(S.level+activity())%candidates.length];
 const sr=Math.floor(source/n),sc=source%n,target=sr*n+(n-1-sc);
 cells[target]=false;
 $('game-stage').innerHTML=`<div class="builder-stage">${head('symmetry','Complete the reflected pattern.')}<div class="builder-prompt"><h3>Which cell should be filled?</h3><p>One cell is missing from the reflected side.</p><div class="builder-lab-grid" style="--n:${n}">${cells.map((v,i)=>`<button class="builder-cell ${v?'filled':''}" data-i="${i}">${i===target?'?':''}</button>`).join('')}</div></div></div>`;S.active=true;document.querySelectorAll('.builder-cell').forEach(b=>b.onclick=()=>b.dataset.i===String(target)?complete():fail());
}
function packing(){
 const capacity=6+Math.floor(S.level/4)+activity(),item=1+(S.level+S.age+activity())%3,correct=Math.floor(capacity/item),choices=[...new Set([correct,Math.max(1,correct-1),correct+1,correct+2])];
 $("game-stage").innerHTML=`<div class="builder-stage">${head('packing')}<div class="builder-prompt"><h3>How many items fit?</h3><p>Space available: <b>${capacity}</b> units. Each item uses <b>${item}</b> units.</p><div class="builder-options">${shuffle(choices).map(v=>`<button class="builder-option" data-v="${v}">${v} items</button>`).join('')}</div></div></div>`;
 S.active=true;document.querySelectorAll('.builder-option').forEach(b=>b.onclick=()=>b.dataset.v===String(correct)?complete():fail());
}


function tileMatch(){
 const n=size(),target=new Set(),mod=Math.max(2,4-tier());
 for(let i=0;i<n*n;i++){if((i*2+S.level+activity()*2)%mod===0)target.add(i)}
 if(!target.size)target.add((S.level+activity())%(n*n));
 const cells=Array.from({length:n*n},(_,i)=>`<button class="builder-cell" data-i="${i}"></button>`).join('');
 $('game-stage').innerHTML=`<div class="builder-stage">${head('tileMatch')}<p>Memorize the highlighted pattern, then rebuild it exactly.</p><div class="builder-lab-grid" style="--n:${n}" id="tile-grid">${cells}</div><p id="tile-status">Memorize…</p></div>`;
 const grid=document.querySelectorAll('#tile-grid .builder-cell');target.forEach(i=>grid[i].classList.add('filled'));
 const picked=new Set();let reveal=true;S.active=false;
 const hideAt=Math.max(650,1000-S.level*18);
 const token=Symbol('tile-match');S.builderTileToken=token;
 S.timer=setTimeout(()=>{
   if(S.builderTileToken!==token)return;
   reveal=false;
   target.forEach(i=>grid[i].classList.remove('filled'));
   $('tile-status').textContent='Rebuild the pattern.';
   S.active=true;
 },hideAt);
 grid.forEach(b=>b.onclick=()=>{if(!S.active)return;const i=+b.dataset.i;if(picked.has(i)){picked.delete(i);b.classList.remove('selected')}else{picked.add(i);b.classList.add('selected')}if(picked.size===target.size&&[...picked].every(i=>target.has(i)))complete();else if(picked.size>target.size)fail()})
}

function maze(){
 const n=size(),start=0,goal=n*n-1,blocked=new Set();
 for(let i=1;i<goal;i++){const onSafePath=(i<n)||((i%n)===n-1);if(!onSafePath && (i*7+S.level*3+activity()*5+S.age*11)%Math.max(3,6-tier()-Math.min(1,ageComplexity()))===0) blocked.add(i);}
 blocked.delete(1);blocked.delete(goal-1);
 $('game-stage').innerHTML=`<div class="builder-stage">${head('maze','Build a route from START to GOAL.')}<div class="builder-lab-grid" id="maze-grid" style="--n:${n}">${Array.from({length:n*n},(_,i)=>`<button class="builder-cell" data-i="${i}" ${blocked.has(i)?'disabled':''}>${i===start?'START':i===goal?'GOAL':''}</button>`).join('')}</div><p id="maze-path">0 steps</p></div>`;
 let pos=start,steps=0;S.active=true;const cells=[...document.querySelectorAll('#maze-grid .builder-cell')];const adjacent=(a,b)=>{const ar=Math.floor(a/n),ac=a%n,br=Math.floor(b/n),bc=b%n;return Math.abs(ar-br)+Math.abs(ac-bc)===1};
 cells.forEach(b=>b.onclick=()=>{if(!S.active)return;const i=Number(b.dataset.i);if(!adjacent(pos,i)||blocked.has(i)){fail();return}pos=i;steps++;b.classList.add('good');$('maze-path').textContent=`${steps} steps`;if(pos===goal)complete()});
}

function runActivity(type){if(type==="fill")fill();else if(type==="pattern")pattern();else if(type==="path")path();else if(type==="count")count();else if(type==="rotate")rotate();else if(type==="balance")balance();else if(type==="sequence")buildSequence();else if(type==="symmetry")symmetry();else if(type==="packing")packing();else if(type==="allocate")allocate();else if(type==="weight")weight();else if(type==="maze")maze();else if(type==="tileMatch")tileMatch();else mirror()}
function makeGrid(n){return `<div class="builder-lab-grid" style="--n:${n}">${Array.from({length:n*n},(_,i)=>`<button type="button" class="builder-cell" data-i="${i}"></button>`).join("")}</div>`}
function fill(){
 const n=size(),total=n*n,blockedCount=clamp(1+tier(),1,6),blocked=shuffle([...Array(total).keys()]).slice(0,Math.min(blockedCount,total-3)),available=total-blocked.length,need=clamp(Math.round((2+Math.floor(S.level*.55)+activity()+tier())*ageScale()),2,Math.max(2,available-1));
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
 else {for(let r=0;r<n;r++)path.push(r*n+n-1);for(let c=n-2;c>=0;c--)path.push((n-1)*n+c)}
 const blocked=shuffle([...Array(total).keys()].filter(i=>!path.includes(i))).slice(0,clamp(2+Math.floor(S.level/4)+ageComplexity(),2,total-path.length-1));
 $("game-stage").innerHTML=`<div class="builder-stage">${head("path","Route ${variant+1}: follow the safe route step by step.")}<p class="builder-task">Start at <b>🚀</b> and reach <b>🏁</b>. Choose the next cell.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];cells[path[0]].textContent="🚀";cells[path[path.length-1]].textContent="🏁";blocked.forEach(i=>cells[i].classList.add("blocked"));let step=1;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled||blocked.includes(i))return;if(i===path[step]){b.classList.add("filled");b.disabled=true;step++;if(step===path.length)complete()}else fail()});
}
function count(){
 const n=size(),target=clamp(Math.round((2+Math.floor(S.level/3)+activity())*ageScale()),2,n*n-1);
 const choices=[target,target+1,target+2,Math.max(1,target-1)].filter((v,i,a)=>v<=n*n&&a.indexOf(v)===i);
 $('game-stage').innerHTML=`<div class="builder-stage">${head('count',`Build count ${target}: choose the option containing exactly the requested number of blocks.`)}<p class="builder-task">How many blocks should the finished structure contain?</p><div class="builder-count-options">${shuffle(choices).map(v=>`<button class="word-option" data-count="${v}">${v} blocks</button>`).join('')}</div></div>`;
 S.active=true;document.querySelectorAll('.builder-count-options [data-count]').forEach(b=>b.onclick=()=>Number(b.dataset.count)===target?complete():fail());
}

function rotate(){
 const variants=[["↑","→","↓","←"],["└","┌","┐","┘"],["▲","▶","▼","◀"]],v=variants[(S.level+activity())%variants.length],correct=v[3];
 $("game-stage").innerHTML=`<div class="builder-stage">${head("rotate")}<p class="builder-task">The shape turns one quarter-turn at a time. Which direction comes next?</p><div class="rotation-display">${v.slice(0,3).map(x=>`<span>${x}</span>`).join("<b>→</b>")}<b>→</b><span>?</span></div><div class="builder-choice-row" id="rotation-options"></div></div>`;
 const box=$("rotation-options");S.active=true;shuffle(v).forEach(x=>{const b=document.createElement("button");b.className="word-option";b.textContent=x;b.onclick=()=>x===correct?complete():fail();box.appendChild(b)});
}

function balance(){
 const left=4+tier()+(S.level%5),right=2+((S.level+activity()+S.age)%4),gap=left-right;
 const choices=[...new Set([gap,Math.max(1,gap-1),gap+1,gap+2])];
 $('game-stage').innerHTML=`<div class="builder-stage">${head('balance','Balance the structure by adding blocks to the lighter side.')}<div class="builder-prompt"><h3>How many blocks are needed?</h3><div class="builder-balance-visual" style="display:flex;align-items:center;justify-content:center;gap:18px;margin:18px auto;max-width:620px"><div class="builder-balance-side" style="flex:1;display:grid;gap:6px;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:16px"><strong>LEFT</strong><span>${left} blocks</span></div><div class="builder-balance-scale" aria-hidden="true" style="font-size:32px">⚖️</div><div class="builder-balance-side" style="flex:1;display:grid;gap:6px;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:16px"><strong>RIGHT</strong><span>${right} blocks</span></div></div><p>How many blocks should be added to the right side so both sides are equal?</p><div class="builder-options">${shuffle(choices).map(v=>`<button class="builder-option" data-v="${v}">${v} block${v===1?'':'s'}</button>`).join('')}</div></div></div>`;
 S.active=true;document.querySelectorAll('.builder-option').forEach(b=>b.onclick=()=>b.dataset.v===String(gap)?complete():fail());
}

function mirror(){
 const n=size(),axis=Math.floor(n/2),mode=S.level%3,left=[];
 for(let r=0;r<n;r++)for(let c=0;c<=axis;c++){
   const yes=mode===0?((r+c+S.level)%3===0):mode===1?((r*2+c+S.level)%4===0):((r===c)||(r+c===n-1));
   if(yes&&c<axis)left.push(r*n+c);
 }
 const targets=[...new Set(left.map(i=>{const r=Math.floor(i/n),c=i%n;return r*n+(n-1-c)}))];
 if(!left.length){const fallback=(S.level+activity())%n;left.push(fallback*n);targets.push(fallback*n+(n-1));}
 $("game-stage").innerHTML=`<div class="builder-stage">${head("mirror",`Mirror pattern ${mode+1}: complete the reflected side.`)}<p class="builder-task">Tap the cells that mirror the left side.</p>${makeGrid(n)}</div>`;
 const cells=[...document.querySelectorAll(".builder-cell")];left.forEach(i=>{cells[i].classList.add("filled");cells[i].disabled=true});let done=0;S.active=true;
 cells.forEach((b,i)=>b.onclick=()=>{if(!S.active||b.disabled)return;if(targets.includes(i)){b.classList.add("filled");b.disabled=true;if(++done===targets.length)complete()}else fail()});
}
window.MQBuilder={run:instruction};
})();
