(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ICONS=['🐶','🐱','🐰','🐼','🦊','🐸','🐵','🐯','🐨','🐷','🐮','🐙','🐳','🦋','🐝','🐢','🍎','🍌','🍊','🍉','🍓','🍇','🥕','🌽','🍪','🍕','🧁','🥭','🍍','🥝','🍋','🍒','🚗','🚌','🚲','🚀','✈️','🚁','🚂','⛵','🎈','🪁','⚽','🎸','🎨','🎁','🧸','🛴','⭐','🌙','☀️','☁️','🌈','🌳','🌻','🌊','🔥','❄️','🌟','🍀','🌺','🌴','⛰️','🌋'];
const COLORS=['RED','BLUE','GREEN','YELLOW','PURPLE','ORANGE','PINK','BROWN'];
const ARROWS=['↑','→','↓','←','↗','↘','↙','↖'];
const SHAPES=['●','▲','■','◆','★','⬟','♥','✚'];
const WORDS=['apple','river','garden','rocket','pencil','window','tiger','banana','castle','planet','school','market','forest','camera','bridge','orange','rabbit','ocean','circle','music','flower','bottle','village','train','cloud','button','family','basket','guitar','sun','moon','star'];
const PLANS=[
 ['visual','sequence','direction','pairs','location'],
 ['feature','change','category','direction','order'],
 ['working','count','visual','direction','pairs'],
 ['sequence','location','feature','category','direction'],
 ['visual','sequence','direction','pairs','location'],
 ['feature','change','category','direction','order'],
 ['working','count','visual','direction','pairs'],
 ['sequence','location','feature','category','direction'],
 ['visual','sequence','direction','pairs','location'],
 ['feature','change','category','direction','order'],
 ['working','count','visual','direction','pairs'],
 ['sequence','location','feature','category','direction'],
 ['visual','sequence','direction','pairs','location'],
 ['feature','change','category','direction','order'],
 ['working','count','visual','direction','pairs'],
 ['sequence','location','feature','category','direction'],
 ['visual','sequence','direction','pairs','location'],
 ['feature','change','category','direction','order'],
 ['working','count','visual','direction','pairs'],
 ['sequence','location','feature','category','direction']
];
const INFO={
 visual:['Visual Recall','Remember the objects, then find every object you saw.','VISUAL MEMORY'],
 sequence:['Sequence Recall','Remember the exact order of the objects.','SEQUENCING'],
 location:['Location Memory','Remember where each object appeared.','SPATIAL MEMORY'],
 pairs:['Pair Memory','Remember which cards belong together.','ASSOCIATION'],
 feature:['Feature Memory','Remember the exact shape and colour together.','DETAIL MEMORY'],
 working:['Working Memory','Hold information in mind while part of it changes.','WORKING MEMORY'],
 change:['Change Detective','Remember the scene, then spot what changed.','CHANGE DETECTION'],
 category:['Category Recall','Remember which objects belonged to a named group.','CATEGORICAL MEMORY'],
 order:['Order Builder','Remember positions in an ordered set, then rebuild them.','ORDER MEMORY'],
 count:['Count & Recall','Remember how many times each object appeared.','QUANTITY MEMORY'],
 direction:['Direction Memory','Remember the direction sequence, then repeat it exactly.','DIRECTIONAL MEMORY']
};
function cfg(){
 const base=[{show:5200,response:18000,count:3},{show:4300,response:15000,count:4},{show:3600,response:12500,count:5},{show:3200,response:10500,count:6},{show:2900,response:9500,count:6}][S.age];
 const p=(S.level-1)/19;
 return {count:clamp(base.count+Math.floor(S.level/5),base.count,base.count+5),show:Math.round(base.show*(1-.25*p)),response:Math.round(base.response*(1-.15*p))};
}
function header(type,sub){
 const i=INFO[type];
 return `<div class="memory-lab-head"><div><span class="memory-kind">${i[2]}</span><h3>${i[0]}</h3><p class="memory-sub">${sub||i[1]}</p></div><div class="activity-chip">Activity ${(S.memoryActivity||0)+1}/4</div></div>`;
}
function begin(draw){S.active=false;S.memoryRoundToken=(S.memoryRoundToken||0)+1;const t=S.memoryRoundToken;draw(cfg(),t)}
function deadline(ms){S.timer=setTimeout(()=>{if(S.active)fail()},ms)}
function fail(){if(!S.active)return;MQ.levelFailed()}
function complete(){
 if(!S.active)return;S.active=false;clearTimeout(S.timer);
 const last=(S.memoryActivity||0)===3;
 $('game-message').textContent=last?'✓ Four memory activities complete!':`✓ Activity ${(S.memoryActivity||0)+1} complete. Loading the next activity…`;
 if(last)S.timer=setTimeout(()=>{S.memoryActivity=0;MQ.levelComplete()},650);
 else{S.memoryActivity++;S.timer=setTimeout(()=>{$('game-message').textContent='';MQ.nextChallenge()},650)}
}
function visual(){begin((sp,t)=>{
 const pool=ICONS.slice((S.level*3+S.age*7)%ICONS.length).concat(ICONS).slice(0,ICONS.length);
 const a=shuffle(pool).slice(0,sp.count),d=shuffle(ICONS.filter(x=>!a.includes(x))).slice(0,Math.min(9,3+Math.floor(S.level/2)));
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('visual')}<div class="memory-timer">Study for <b>${(sp.show/1000).toFixed(1)} seconds</b></div><div class="memory-items memory-study">${a.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('visual','Select every object you remember.')}<div id="choices" class="memory-items"></div></div>`;const box=$('choices');let n=0;S.active=true;shuffle(a.concat(d)).forEach(x=>{const b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;b.disabled=true;if(!a.includes(x)){b.classList.add('bad');fail()}else{b.classList.add('good');if(++n===a.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}
function sequence(){begin((sp,t)=>{
 const offset=(S.level*5+S.age*11)%ICONS.length,a=shuffle(ICONS.slice(offset).concat(ICONS.slice(0,offset))).slice(0,clamp(sp.count,3,10));
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('sequence')}<div class="memory-timer">Watch for <b>${(sp.show/1000).toFixed(1)} seconds</b></div><div class="sequence-display">${a.map(x=>`<span class="sequence-token">${x}</span>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('sequence','Tap the objects in exactly the same order.')}<div id="sequence-choices" class="memory-items"></div><div id="sequence-picked" class="picked-sequence"></div></div>`;const box=$('sequence-choices'),picked=$('sequence-picked');let n=0;S.active=true;shuffle(a).forEach(x=>{const b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==a[n]){b.classList.add('bad');fail()}else{b.disabled=true;b.classList.add('good');picked.textContent+=(n?' ':'')+x;if(++n===a.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}
function location(){begin((sp,t)=>{
 const size=S.level<7?3:S.level<14?4:5,slots=size*size,count=clamp(Math.min(sp.count,Math.floor(slots*.55)),3,Math.min(12,slots-1));
 const start=(S.level*7+S.age*5)%ICONS.length,icons=shuffle(ICONS.slice(start).concat(ICONS.slice(0,start))).slice(0,count),pos=shuffle([...Array(slots).keys()]).slice(0,count),ans=pos.map((slot,i)=>({slot,icon:icons[i]}));
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('location')}<div class="memory-timer">Remember the objects and where they are.</div><div class="memory-board" style="--grid:${size}">${[...Array(slots)].map((_,i)=>{const z=ans.find(x=>x.slot===i);return `<div class="memory-cell">${z?z.icon:''}</div>`}).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('location','Select an object, then place it where you saw it.')}<div class="location-recall"><div id="location-icons" class="location-icons"></div><div id="location-grid" class="memory-board" style="--grid:${size}"></div></div></div>`;const ib=$('location-icons'),gb=$('location-grid');let chosen=null,n=0;S.active=true;shuffle(icons).forEach(icon=>{const b=document.createElement('button');b.className='location-icon';b.textContent=icon;b.onclick=()=>{document.querySelectorAll('.location-icon').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');chosen=icon};ib.appendChild(b)});for(let i=0;i<slots;i++){const b=document.createElement('button');b.className='memory-cell recall-cell';b.onclick=()=>{if(!S.active||!chosen||b.disabled)return;const z=ans.find(x=>x.slot===i);if(!z||z.icon!==chosen){b.classList.add('bad');fail();return}b.textContent=chosen;b.classList.add('placed');b.disabled=true;const s=[...document.querySelectorAll('.location-icon')].find(x=>x.textContent===chosen);if(s){s.disabled=true;s.classList.add('used')}chosen=null;if(++n===ans.length)complete()};gb.appendChild(b)}deadline(sp.response*1.2)},sp.show)
})}
function pairs(){begin((sp,t)=>{
 const count=clamp(3+Math.floor(S.level/4),3,8),icons=shuffle(ICONS.slice((S.level*2+S.age*9)%ICONS.length).concat(ICONS)).slice(0,count);
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('pairs')}<div class="memory-timer">Study the pairs for <b>${(sp.show/1000).toFixed(1)} seconds</b></div><div class="memory-items">${shuffle(icons.flatMap(x=>[x,x])).map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('pairs','Turn over two cards at a time and match every pair.')}<div class="pair-grid" id="pair-grid"></div></div>`;const box=$('pair-grid');let first=null,n=0,busy=false;S.active=true;shuffle(icons.flatMap((icon,id)=>[{id,icon},{id,icon}])).forEach(c=>{const b=document.createElement('button');b.className='pair-card';b.innerHTML='<span>?</span>';b.onclick=()=>{if(!S.active||busy||b.classList.contains('matched')||first?.b===b)return;b.classList.add('flipped');b.innerHTML=`<span>${c.icon}</span>`;if(!first){first={b,c};return}busy=true;if(first.c.id===c.id){first.b.classList.add('matched');b.classList.add('matched');first=null;busy=false;if(++n===icons.length)complete()}else{const old=first.b;setTimeout(()=>{old.classList.remove('flipped');b.classList.remove('flipped');old.innerHTML='<span>?</span>';b.innerHTML='<span>?</span>';first=null;busy=false},360)}};box.appendChild(b)});deadline(sp.response*1.3)},sp.show)
})}
function feature(){begin((sp,t)=>{
 const count=clamp(sp.count,3,8),co=COLORS.length,sh=SHAPES.length;
 const colorStart=(S.level*3+S.age*2)%co,shapeStart=(S.level*5+S.age*3)%sh;
 const colors=[];const shapes=[];const used=new Set();
 for(let i=0;colors.length<count;i++){const color=COLORS[(colorStart+i*3)%co],shape=SHAPES[(shapeStart+i*5)%sh],key=`${shape}|${color}`;if(!used.has(key)){used.add(key);colors.push(color);shapes.push(shape)}}
 const a=colors.map((color,i)=>({color,shape:shapes[i]}));
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('feature')}<div class="memory-timer">Remember the exact shape + colour for <b>${(sp.show/1000).toFixed(1)} seconds</b>.</div><div class="feature-items">${a.map(x=>`<div class="feature-item"><span>${x.shape}</span><small>${x.color}</small></div>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;
  const d=a.map((x,i)=>({color:x.color,shape:shapes[(i+1)%shapes.length],correct:false}));
  $('game-stage').innerHTML=`<div class="memory-wrap">${header('feature','Select every exact shape-and-colour combination you saw.')}<div id="feature-choices" class="feature-items"></div></div>`;
  const box=$('feature-choices');let n=0;S.active=true;
  shuffle(a.map(x=>({...x,correct:true})).concat(d)).forEach(x=>{const b=document.createElement('button');b.className='feature-choice';b.innerHTML=`<span>${x.shape}</span><small>${x.color}</small>`;b.onclick=()=>{if(!S.active||b.disabled)return;b.disabled=true;if(!x.correct){b.classList.add('bad');fail()}else{b.classList.add('good');if(++n===a.length)complete()}};box.appendChild(b)});
  deadline(sp.response)
 },sp.show)
})}
function working(){begin((sp,t)=>{
 const len=clamp(sp.count,4,10),start=(S.level*3+S.age*7)%WORDS.length,seq=shuffle(WORDS.slice(start).concat(WORDS.slice(0,start))).slice(0,len),remove=S.level>=15?2:1;
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('working')}<div class="memory-timer">Hold the sequence for <b>${(sp.show/1000).toFixed(1)} seconds</b>.</div><div class="word-sequence">${seq.map(x=>`<span>${x}</span>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;const missing=seq.slice(0,remove),remain=seq.slice(remove),d=shuffle(WORDS.filter(x=>!seq.includes(x))).slice(0,5);$('game-stage').innerHTML=`<div class="memory-wrap">${header('working','Which word or words were removed?')}<div class="word-sequence faded">${remain.map(x=>`<span>${x}</span>`).join('')}</div><div id="working-options" class="word-options"></div></div>`;const box=$('working-options');let n=0;S.active=true;shuffle(missing.concat(d)).forEach(x=>{const b=document.createElement('button');b.className='word-option';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;b.disabled=true;if(!missing.includes(x)){b.classList.add('bad');fail()}else{b.classList.add('good');if(++n===missing.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}
function change(){begin((sp,t)=>{
 const count=clamp(sp.count,4,9),before=shuffle(ICONS.slice((S.level*4+S.age*5)%ICONS.length).concat(ICONS)).slice(0,count),idx=(S.level*3+S.age)%count,after=[...before],replacement=shuffle(ICONS.filter(x=>!before.includes(x)))[(S.level+S.age)%8];after[idx]=replacement;
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('change')}<div class="memory-timer">Study Scene A for <b>${(sp.show*.65/1000).toFixed(1)} seconds</b></div><div class="memory-items">${before.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{$('game-stage').innerHTML=`<div class="memory-wrap">${header('change','Scene B has one change. Remember both scenes.')}<div class="memory-timer">Scene B: <b>${(sp.show*.5/1000).toFixed(1)} seconds</b></div><div class="memory-items">${shuffle(after).map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div>`;S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('change','What happened to the scene?')}<div class="change-options"><button class="word-option" id="changed">One object changed</button><button class="word-option" id="same">Nothing changed</button></div></div>`;S.active=true;$('#changed').onclick=complete;$('#same').onclick=fail;deadline(sp.response)},sp.show*.5)},sp.show*.65)
})}
function category(){begin((sp,t)=>{
 const groups=[
  ['Animals',['🐶','🐱','🐘','🦁','🐼','🐢','🐝']],['Food',['🍎','🍕','🍓','🍉','🍪','🥕','🧃']],
  ['Travel',['🚗','🚌','🚲','🚀','✈️','🚂','⛵']],['Play',['⚽','🎸','🎨','🎁','🪁','🧸','🎯']],
  ['Nature',['🌳','🌻','🌊','🌈','🌴','⛰️','🌺']],['Sky',['⭐','🌙','☀️','☁️','🌟','🌈']],
  ['School',['📚','✏️','📏','🖍️','🎒','📓','🧮']],['Music',['🎸','🎹','🥁','🎺','🎻','🎷','🎤']],
  ['Vehicles',['🚗','🚕','🚌','🚓','🚑','🚒','🚜']],['Fruit',['🍎','🍌','🍊','🍇','🍉','🍓','🍍']],
  ['Sea',['🐳','🐟','🦀','🐙','🦈','🐬','🐚']],['Farm',['🐄','🐖','🐑','🐔','🌽','🥕','🚜']],
  ['Space',['🚀','🌙','⭐','🪐','☄️','👩‍🚀','🛰️']],['Shapes',['🔵','🟢','🟡','🔺','🟥','🟣','⬛']],
  ['Clothes',['👕','👖','🧢','🧥','🧦','👟','🧤']],['Tools',['🔨','🔧','🪛','🪚','✂️','🧰','🪣']],
  ['Weather',['☀️','🌧️','⛈️','❄️','🌪️','🌈','☁️']],['Kitchen',['🥄','🍴','🍽️','🥣','🫖','🍳','🧂']],
  ['Jobs',['👩‍🏫','👨‍⚕️','👩‍🍳','👨‍🚒','👩‍🌾','👨‍✈️','👩‍🔬']],['Celebration',['🎂','🎈','🎁','🎉','🎊','🪅','🎆']]
 ];
 const g=groups[(S.level-1+S.age*4)%groups.length],a=shuffle(g[1]).slice(0,clamp(sp.count,3,7)),d=shuffle(ICONS.filter(x=>!a.includes(x))).slice(0,4);
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('category')}<div class="memory-timer">Remember the <b>${g[0]}</b> objects for <b>${(sp.show/1000).toFixed(1)} seconds</b>.</div><div class="memory-items">${a.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('category',`Select only the objects from the ${g[0]} group.`)}<div class="memory-items" id="cat"></div></div>`;const box=$('cat');let n=0;S.active=true;shuffle(a.concat(d)).forEach(x=>{const b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;b.disabled=true;if(!a.includes(x)){b.classList.add('bad');fail()}else{b.classList.add('good');if(++n===a.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}
function order(){begin((sp,t)=>{
 const len=clamp(sp.count,4,9),start=(S.level*3+S.age)%ICONS.length,a=shuffle(ICONS.slice(start).concat(ICONS.slice(0,start))).slice(0,len);
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('order')}<div class="memory-timer">Remember the left-to-right order for <b>${(sp.show/1000).toFixed(1)} seconds</b>.</div><div class="sequence-display">${a.map((x,i)=>`<span class="sequence-token">${i+1}. ${x}</span>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('order','Rebuild the order from first to last.')}<div id="order-options" class="memory-items"></div><div id="order-picked" class="picked-sequence"></div></div>`;const box=$('order-options'),picked=$('order-picked');let n=0;S.active=true;shuffle(a).forEach(x=>{const b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==a[n]){b.classList.add('bad');fail()}else{b.disabled=true;b.classList.add('good');picked.textContent+=(n?' → ':'')+x;if(++n===a.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}

function reverse(){begin((sp,t)=>{
 const len=clamp(3+Math.floor(S.level/5)+(S.memoryActivity||0),3,8);
 const start=(S.level*3+S.age*4)%ICONS.length;
 const seq=shuffle(ICONS.slice(start).concat(ICONS.slice(0,start))).slice(0,len);
 const answer=[...seq].reverse();
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('reverse')}<div class="memory-timer">Study the sequence for <b>${(sp.show/1000).toFixed(1)} seconds</b>.</div><div class="sequence-display">${seq.map(x=>`<span class="sequence-token">${x}</span>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('reverse','Tap the objects in reverse order.')}<div id="reverse-choices" class="memory-items"></div><div id="reverse-picked" class="picked-sequence"></div></div>`;const box=$('reverse-choices'),picked=$('reverse-picked');let n=0;S.active=true;shuffle([...new Set(seq)]).forEach(x=>{const b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==answer[n]){b.classList.add('bad');fail()}else{b.disabled=true;b.classList.add('good');picked.textContent+=(n?' ':'')+x;if(++n===answer.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}

function direction(){begin((sp,t)=>{
 const len=clamp(3+Math.floor(S.level/5)+(S.memoryActivity||0),3,8);
 const seq=Array.from({length:len},(_,i)=>ARROWS[(S.level*2+S.age+i*2+(S.memoryActivity||0))%ARROWS.length]);
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('direction')}<div class="memory-timer">Watch the directions for <b>${(sp.show/1000).toFixed(1)} seconds</b>.</div><div class="sequence-display">${seq.map(x=>`<span class="sequence-token">${x}</span>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('direction','Repeat the direction sequence exactly.')}<div id="direction-choices" class="memory-items"></div><div id="direction-picked" class="picked-sequence"></div></div>`;const box=$('direction-choices'),picked=$('direction-picked');let n=0;S.active=true;shuffle([...new Set(seq.concat(ARROWS))].slice(0,Math.min(ARROWS.length,5+Math.floor(S.level/7)+2))).forEach(x=>{const b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==seq[n]){b.classList.add('bad');fail()}else{b.disabled=true;b.classList.add('good');picked.textContent+=(n?' ':'')+x;if(++n===seq.length)complete()}};box.appendChild(b)});deadline(sp.response)},sp.show)
})}

function count(){begin((sp,t)=>{
 const n=clamp(sp.count,3,7),start=(S.level*2+S.age*5)%ICONS.length,types=shuffle(ICONS.slice(start).concat(ICONS.slice(0,start))).slice(0,n),counts=types.map((x,i)=>2+((S.level+i+S.age)%3)),pool=types.flatMap((x,i)=>Array(counts[i]).fill(x));
 $('game-stage').innerHTML=`<div class="memory-wrap">${header('count')}<div class="memory-timer">Remember how many times each object appears.</div><div class="memory-items">${shuffle(pool).map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div>`;
 S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;$('game-stage').innerHTML=`<div class="memory-wrap">${header('count','Choose the number for each object.')}<div class="count-list" id="count-list"></div></div>`;const box=$('count-list');let done=0;S.active=true;types.forEach((icon,i)=>{const row=document.createElement('div');row.className='count-row';row.innerHTML=`<span>${icon}</span><div class="count-choices"></div>`;const cb=row.querySelector('.count-choices'),correct=counts[i],vals=[correct,1+(correct%4),2+(correct%4),3+(correct%4)].filter((v,j,a)=>a.indexOf(v)===j).slice(0,4);shuffle(vals).forEach(v=>{const b=document.createElement('button');b.className='word-option';b.textContent=v;b.onclick=()=>{if(!S.active||b.disabled)return;b.disabled=true;if(v!==correct){b.classList.add('bad');fail()}else{b.classList.add('good');if(++done===types.length)complete()}};cb.appendChild(b)});box.appendChild(row)});deadline(sp.response*1.25)},sp.show)
})}
const START={visual,sequence,location,pairs,feature,working,change,category,order,count,direction,reverse};
const RULES={
 visual:'Remember the objects you see, then select them from the choices.',
 sequence:'Watch the exact order, then tap the objects in the same order.',
 location:'Remember each object and its position. Place each one back where it belongs.',
 pairs:'Remember the cards, then turn over two cards at a time to find every pair.',
 feature:'Remember each shape together with its colour. Select only exact matches.',
 working:'Hold the sequence in your mind. After part disappears, identify what was removed.',
 change:'Compare Scene A and Scene B carefully, then identify the change.',
 category:'Remember the named group, then select only objects that belonged to it.',
 order:'Remember the left-to-right order, then rebuild it from first to last.',
 count:'Remember how many times each object appeared, then choose each count.',
 direction:'Watch the arrow sequence, then tap the directions in the same order.',
 reverse:'Remember the sequence, then reproduce it from last to first.'
};
function instructions(type){
 const i=INFO[type],sp=cfg();
 $('game-stage').innerHTML=`<div class="memory-instruction-screen"><div class="instruction-icon">🧠</div><span class="memory-kind">${i[2]}</span><div class="instruction-activity">Activity ${(S.memoryActivity||0)+1} of 4</div><h2>${i[0]}</h2><p class="instruction-purpose">${i[1]}</p><div class="instruction-rule"><strong>How to play</strong><p>${RULES[type]}</p></div><div class="instruction-timing"><span>⏱️ Study: ${(sp.show/1000).toFixed(1)} sec • Response: ${Math.round(sp.response/1000)} sec</span><span>🎯 Pass with no incorrect response</span></div><button id="start-memory-activity" type="button" class="primary-btn instruction-start">Start Activity →</button></div>`;
 S.active=false;clearTimeout(S.timer);
 $('start-memory-activity').onclick=()=>{START[type]();};
}
function run(){S.memoryActivity=Number.isFinite(S.memoryActivity)?S.memoryActivity:0;instructions(PLANS[S.level-1]?.[S.memoryActivity]||'visual')}
window.MQMemoryLab={run};
})();