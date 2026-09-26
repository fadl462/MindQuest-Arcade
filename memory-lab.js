(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
function ensureDualSequenceStyles(){
  if(document.getElementById('mq-dual-sequence-v830'))return;
  const style=document.createElement('style');style.id='mq-dual-sequence-v830';
  style.textContent=`
    .dual-study-board,.dual-response-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:620px;width:min(620px,100%);margin:10px auto 8px}
    .dual-memory-stream{min-width:0;border:1px solid #dfe3f2;border-radius:14px;background:#fff;padding:9px 10px;transition:all .18s ease}
    .dual-memory-stream.is-active{border-color:#5b5ce2;box-shadow:0 0 0 3px rgba(91,92,226,.10);background:#fbfbff}
    .dual-memory-stream.is-waiting{opacity:.52}
    .dual-memory-stream-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:11px;font-weight:800;letter-spacing:.08em}
    .dual-memory-stream-head small{font-size:9px;letter-spacing:.04em;padding:4px 8px;border-radius:999px;background:#f0f1f8;color:#69708a}
    .dual-memory-stream.is-active .dual-memory-stream-head small{background:#ecebff;color:#4d4ed0}
    .dual-memory-row{display:flex;justify-content:center;gap:7px;flex-wrap:nowrap}
    .dual-memory-token{width:54px;height:54px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #d8ddec;border-radius:12px;background:#fff;font-size:27px;line-height:1;cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease,opacity .12s ease}
    .dual-study-board .dual-memory-token{cursor:default}
    .dual-response-board .dual-memory-token:not(:disabled):hover{transform:translateY(-2px);border-color:#6869e8;box-shadow:0 5px 14px rgba(60,60,120,.10)}
    .dual-response-board .dual-memory-token:disabled{cursor:not-allowed;opacity:.48}
    .dual-response-board .dual-memory-token.correct-picked{border-color:#35a36a;background:#eefbf4;opacity:.62}
    .dual-response-board .dual-memory-token.wrong-flash{border-color:#df5d66;background:#fff0f1;animation:mqDualWrong .32s ease}
    @keyframes mqDualWrong{50%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
    .dual-phase-label{display:flex;align-items:center;justify-content:center;gap:7px;margin:2px auto 5px;font-size:11px}
    .dual-phase-label span{font-size:9px;font-weight:900;letter-spacing:.09em;padding:4px 7px;border-radius:999px;background:#eeeefe;color:#5557d8}
    .dual-phase-label strong{font-size:12px}
    .dual-pattern-guide{text-align:center;font-size:11px;font-weight:800;color:#66708b;margin:5px 0}
    .dual-turn{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:6px auto 5px;padding:6px 12px;border-radius:12px;background:#f5f6fb;border:1px solid #e1e4f0;max-width:360px}
    .dual-turn span{font-size:8px;font-weight:900;letter-spacing:.08em;color:#5a5bd7}.dual-turn strong{font-size:12px}.dual-turn small{font-size:9px;color:#68718b}
    .dual-study-progress{margin:5px auto 0;max-width:360px;font-size:10px}
    @media(max-width:520px){.dual-study-board,.dual-response-board{grid-template-columns:1fr;gap:8px}.dual-memory-row{flex-wrap:wrap}.dual-memory-token{width:50px;height:50px;font-size:25px}.dual-memory-stream{padding:8px}.dual-study-board,.dual-response-board{margin:7px auto 5px}}
  `;
  document.head.appendChild(style);
  const fitStyle=document.createElement('style');fitStyle.id='mq-dual-fit-v831';
  fitStyle.textContent=`
    #game.active .game-card:has(.dual-study-board),#game.active .game-card:has(.dual-response-board){overflow:hidden}
    #game.active #game-stage:has(.dual-study-board),#game.active #game-stage:has(.dual-response-board){overflow:hidden}
    #game.active .memory-wrap:has(.dual-study-board),#game.active .memory-wrap:has(.dual-response-board){overflow:hidden;max-height:100%;width:min(860px,100%)}
    .dual-study-board .dual-memory-stream,.dual-response-board .dual-memory-stream{box-sizing:border-box}
  `;document.head.appendChild(fitStyle);
}
ensureDualSequenceStyles();
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ICONS=['🐶','🐱','🐰','🐼','🦊','🐸','🐵','🐯','🐨','🐷','🐮','🐙','🐳','🦋','🐝','🐢','🍎','🍌','🍊','🍉','🍓','🍇','🥕','🌽','🍪','🍕','🧁','🥭','🍍','🥝','🍋','🍒','🚗','🚌','🚲','🚀','✈️','🚁','🚂','⛵','🎈','🪁','⚽','🎸','🎨','🎁','🧸','🛴','⭐','🌙','☀️','☁️','🌈','🌳','🌻','🌊','🔥','❄️','🌟','🍀','🌺','🌴','⛰️','🌋'];
const ARROWS=['↑','→','↓','←','↗','↘','↙','↖'];
const SHAPES=['●','▲','■','◆','★','⬟','♥','✚'];
const COLORS=['RED','BLUE','GREEN','YELLOW','PURPLE','ORANGE','PINK','BROWN'];
const COLOR_EMOJI={RED:'🟥',BLUE:'🟦',GREEN:'🟩',YELLOW:'🟨',PURPLE:'🟪',ORANGE:'🟧',PINK:'🩷',BROWN:'🟫'};
const PLANS_BY_AGE=[
  [
    ['category','direction','grid','visual'],
    ['direction','grid','visual','category'],
    ['grid','visual','category','direction'],
    ['visual','category','direction','grid'],
    ['category','direction','grid','visual'],
    ['working','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['working','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['working','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['working','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['order','sequence','working','change'],
    ['count','feature','pairs','category'],
    ['direction','grid','visual','location'],
    ['order','sequence','working','change'],
    ['count','feature','pairs','category'],
    ['direction','grid','visual','location'],
    ['order','sequence','working','change']
  ],
  [
    ['category','direction','grid','visual'],
    ['direction','grid','visual','category'],
    ['location','order','sequence','working'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['category','direction','grid','visual'],
    ['sequence','working','change','count'],
    ['feature','pairs','category','direction'],
    ['grid','visual','location','order'],
    ['sequence','working','change','count'],
    ['feature','pairs','category','direction'],
    ['grid','visual','location','order'],
    ['sequence','working','change','count'],
    ['feature','pairs','category','direction'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback']
  ],
  [
    ['category','direction','grid','visual'],
    ['visual','location','order','sequence'],
    ['working','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['working','category','direction','grid'],
    ['count','feature','pairs','category'],
    ['direction','grid','visual','location'],
    ['order','sequence','working','change'],
    ['count','feature','pairs','category'],
    ['direction','grid','visual','location'],
    ['order','sequence','working','change'],
    ['switchback','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['working','change','count','feature'],
    ['pairs','dual','interference','reverse'],
    ['switchback','category','direction','grid'],
    ['visual','location','order','sequence'],
    ['working','change','count','feature'],
    ['pairs','dual','interference','reverse'],
    ['switchback','category','direction','grid']
  ],
  [
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['feature','pairs','category','direction'],
    ['grid','visual','location','order'],
    ['sequence','working','change','count'],
    ['feature','pairs','category','direction'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual']
  ],
  [
    ['category','direction','grid','visual'],
    ['sequence','working','change','count'],
    ['feature','pairs','category','direction'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual'],
    ['location','order','sequence','working'],
    ['change','count','feature','pairs'],
    ['dual','interference','reverse','switchback'],
    ['category','direction','grid','visual']
  ]
];
const PLANS=PLANS_BY_AGE[0];
const UNLOCKS_BY_AGE=[
  {tier2:6,tier3:14,tier4:null},
  {tier2:3,tier3:9,tier4:17},
  {tier2:2,tier3:6,tier4:12},
  {tier2:1,tier3:3,tier4:7},
  {tier2:1,tier3:2,tier4:4}
];

const INFO={
 visual:['Visual Recall','Remember the objects, then select every object you saw.','VISUAL MEMORY'],
 sequence:['Sequence Recall','Remember the exact order of the objects.','SEQUENCING'],
 grid:['Grid Recall','Remember the highlighted locations, then reproduce them.','SPATIAL MEMORY'],
 pairs:['Pair Memory','Remember which cards belong together.','ASSOCIATION'],
 location:['Location Memory','Remember where each object appeared.','SPATIAL MEMORY'],
 feature:['Feature Memory','Remember each shape together with its colour.','DETAIL MEMORY'],
 direction:['Direction Memory','Remember the direction sequence, then repeat it exactly.','DIRECTIONAL MEMORY'],
 category:['Category Recall','Remember the named category, then select only its members.','CATEGORICAL MEMORY'],
 working:['What\'s Missing','Study a set, then identify the single item that was removed.','MEMORY CHANGE'],
 count:['Count & Recall','Remember how many times each object appeared.','QUANTITY MEMORY'],
 change:['Change Detective','Compare the two scenes and identify what changed.','CHANGE DETECTION'],
 order:['Order Builder','Remember the order, then rebuild it.','ORDER MEMORY'],
 reverse:['Reverse Recall','Remember the sequence, then reproduce it backwards.','REVERSE MEMORY'],
 dual:['Dual-Sequence Recall','Remember two streams and reproduce them alternately.','DUAL WORKING MEMORY'],
 interference:['Interference Recall','Remember the target sequence while ignoring distractors.','DISTRACTION-RESISTANT MEMORY'],
 switchback:['Switchback Recall','Remember two streams and switch between them in order.','ATTENTIONAL SWITCHING']
};
const RULES={
 visual:'Study the objects. When they disappear, select every object you remember.',
 sequence:'Study the order. When the objects disappear, tap them in exactly the same order.',
 grid:'Study the highlighted cells. When they disappear, tap the same locations.',
 pairs:'Study the cards. Then turn over two cards at a time and find every matching pair.',
 location:'Study each object and its position. Select an object, then tap the position where it belonged.',
 feature:'Study each shape and colour combination. Select the exact combinations you remember.',
 direction:'Study the arrows. Then tap the directions in the exact same order.',
 category:'Remember the named category. Then select every object that belongs to it.',
 working:'Study the set. One item will disappear; identify the single missing object.',
 count:'Study the display. Then choose how many times each object appeared.',
 change:'Study Scene A. Scene B will differ in one place. Identify the changed item.',
 order:'Study the left-to-right order. Rebuild that order from first to last.',
 reverse:'Study the sequence. Then reproduce it from the last item to the first.',
 dual:'Study the two streams. Reproduce them by alternating Stream A, Stream B, A, B.',
 interference:'Remember the target sequence. Ignore the distractor sequence and reproduce the target.',
 switchback:'Study the two streams. Rebuild the sequence by switching between them one item at a time.'
};
// Age/level pacing is deliberately lighter than a conventional difficulty curve.
// MindQuest is a game for learning, so difficulty should grow through mastery,
// not by flooding the player with items or shrinking the study window.
// age index: 0=3–5, 1=6–8, 2=9–11, 3=12–14, 4=15–18
const DIFFICULTY_POINTS=[
  [{l:1,count:3,show:9000,response:30000},{l:5,count:3,show:9500,response:30000},{l:10,count:4,show:9000,response:29000},{l:15,count:4,show:8500,response:28000},{l:20,count:4,show:8000,response:27000}],
  [{l:1,count:3,show:8500,response:29000},{l:5,count:4,show:8500,response:29000},{l:10,count:4,show:8000,response:28000},{l:15,count:5,show:7500,response:27000},{l:20,count:5,show:7000,response:26000}],
  [{l:1,count:4,show:8000,response:28000},{l:5,count:4,show:8000,response:28000},{l:10,count:5,show:7500,response:27000},{l:15,count:6,show:7000,response:25000},{l:20,count:6,show:6500,response:24000}],
  [{l:1,count:5,show:7500,response:27000},{l:5,count:5,show:7500,response:27000},{l:10,count:6,show:7000,response:26000},{l:15,count:7,show:6500,response:24000},{l:20,count:7,show:6000,response:23000}],
  [{l:1,count:5,show:7000,response:26000},{l:5,count:6,show:7000,response:26000},{l:10,count:6,show:6500,response:25000},{l:15,count:7,show:6000,response:23000},{l:20,count:8,show:5500,response:22000}]
];
function interpolate(points,level,key){
  if(level<=points[0].l)return points[0][key];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];
    if(level<=b.l){
      const t=(level-a.l)/(b.l-a.l);
      return a[key]+(b[key]-a[key])*t;
    }
  }
  return points[points.length-1][key];
}
function pacingSummary(){
  return {
    ageBands:['3–5','6–8','9–11','12–14','15–18'],
    note:'Memory Lab pacing uses smaller item loads, longer study windows, and bounded response time. Advanced mechanics use their own age-aware caps.'
  };
}
function profile(){
  const age=clamp(Number(S.age)||0,0,4),level=clamp(Number(S.level)||1,1,20),points=DIFFICULTY_POINTS[age];
  const count=Math.round(interpolate(points,level,'count'));
  const baseShow=Math.round(interpolate(points,level,'show'));
  const baseResponse=Math.round(interpolate(points,level,'response'));
  // Add a little study time as the load grows. A player should never be asked
  // to encode a longer sequence inside the same fixed window.
  const show=Math.min(12000,baseShow+Math.max(0,count-3)*850);
  const response=Math.min(40000,baseResponse+Math.max(0,count-3)*1800);
  return {count,show,response};
}
const LOCATION_GRID=[3,3,4,4,4];
function memoryGridSize(){
  const age=clamp(Number(S.age)||0,0,4),level=Number(S.level)||1;
  // Keep the board visually simple. Larger boards are unlocked gradually,
  // and no Memory Lab grid exceeds 4×4.
  if(age===0)return 3;
  if(age===1)return level>=16?4:3;
  if(age===2)return level>=12?4:3;
  if(age===3)return level>=8?4:3;
  return level>=6?4:3;
}

function recentRegistry(){
  try{return JSON.parse(localStorage.getItem('mindquest-memory-lab-content-v1')||'{}')}catch{return {}}
}
function rememberDraw(key,items){
  try{
    const r=recentRegistry(),list=Array.isArray(r[key])?r[key]:[];
    const signature=items.join('|');
    const next=[signature,...list.filter(x=>x!==signature)].slice(0,4);
    r[key]=next;localStorage.setItem('mindquest-memory-lab-content-v1',JSON.stringify(r));
  }catch{}
}
function drawUnique(pool,n,key){
  const source=[...new Set(pool)],recent=recentRegistry()[key]||[];
  let best=null;
  for(let attempt=0;attempt<8;attempt++){
    const draw=shuffle(source).slice(0,n),sig=draw.join('|');
    if(!recent.includes(sig)){best=draw;break;}
    best=draw;
  }
  rememberDraw(key,best||source.slice(0,n));
  return best||source.slice(0,n);
}
function token(){S.memoryRoundToken=(S.memoryRoundToken||0)+1;return S.memoryRoundToken}
function clear(){clearTimeout(S.timer);S.timer=null}
function stage(html){$('game-stage').innerHTML=html}
function header(type,sub){const i=INFO[type];return `<div class="memory-lab-head"><div><span class="memory-kind">${i[2]}</span><h3>${i[0]}</h3><p class="memory-sub">${sub||i[1]}</p></div><div class="activity-chip">Activity ${(S.memoryActivity||0)+1} / 4</div></div>`}
function shell(type,body,sub){return `<div class="memory-wrap">${header(type,sub)}${body}</div>`}
function begin(draw){clear();S.active=false;const t=token();draw(profile(),t)}
function timeout(ms){S.timer=setTimeout(()=>{if(S.active)fail()},ms)}
function fail(){if(!S.active)return;S.active=false;clear();S.memoryAttempts=(S.memoryAttempts||0)+1;const attempt=S.memoryAttempts;const remaining=3-attempt;if(remaining>0){const activity=(S.memoryActivity||0)+1;$('game-message').textContent=`Not quite. You have ${remaining} ${remaining===1?'attempt':'attempts'} left. Restarting Activity ${activity} from the beginning.`;S.timer=setTimeout(()=>{if(!S.active){runType(S.memoryCurrentType||'visual')}},850)}else{MQ.levelFailed()}}
function complete(){if(!S.active)return;S.active=false;clear();S.memoryAttempts=0;const activity=S.memoryActivity||0;const last=activity===3;$('game-message').textContent=last?'✓ Level complete — moving to the next level…':`✓ Activity ${activity+1} complete — loading the next activity…`;S.timer=setTimeout(()=>{if(last){S.memoryActivity=0;MQ.state.active=true;MQ.levelComplete()}else{S.memoryActivity=activity+1;MQ.nextChallenge()}},520)}
function optionButton(text,cls='choice'){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;return b}
function visual(){begin((p,t)=>{const a=drawUnique(ICONS,p.count,`visual:${S.age}`);const distract=shuffle(ICONS.filter(x=>!a.includes(x))).slice(0,clamp(p.count,3,7));stage(shell('visual',`<div class="memory-instruction-banner">Study these objects carefully.</div><div class="memory-items memory-study">${a.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('visual',`<div class="memory-instruction-banner">Select every object you remember.</div><div id="memory-choices" class="memory-items"></div><div class="memory-progress" id="memory-progress">0 / ${a.length} selected</div>`,'Select every object you saw.'));const box=$('memory-choices');let hit=0;S.active=true;shuffle([...a,...distract]).forEach(x=>{const b=optionButton(x);b.onclick=()=>{if(!S.active||b.disabled)return;if(a.includes(x)){b.classList.add('good','selected');b.disabled=true;hit++;$('memory-progress').textContent=`${hit} / ${a.length} selected`;if(hit===a.length)complete()}else{b.classList.add('bad');fail()}};box.appendChild(b)});timeout(p.response)},p.show)})}
function sequence(){begin((p,t)=>{const a=drawUnique(ICONS,p.count,`sequence:${S.age}`);stage(shell('sequence',`<div class="memory-instruction-banner">Watch the sequence from left to right.</div><div class="sequence-display">${a.map((x,i)=>`<span class="sequence-token" data-i="${i}">${x}</span>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('sequence',`<div class="memory-instruction-banner">Tap the objects in the same order.</div><div id="seq-options" class="memory-items"></div><div class="picked-sequence" id="seq-picked">Your sequence: <span>—</span></div>`));const box=$('seq-options'),picked=$('seq-picked').querySelector('span');let i=0;S.active=true;shuffle([...new Set(a)]).forEach(x=>{const b=optionButton(x);b.dataset.value=x;b.onclick=()=>{if(!S.active)return;if(x!==a[i]){b.classList.add('bad');fail();return}b.classList.add('selected');picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ')+x;i++;if(i===a.length)complete()};box.appendChild(b)});timeout(p.response)},p.show)})}
function direction(){begin((p,t)=>{
  const age=clamp(Number(S.age)||0,0,4), level=clamp(Number(S.level)||1,1,20);
  // Direction Memory is a learning game, so the study phase must remain visible
  // long enough for the player to encode the full sequence before the response board appears.
  // Keep the cognitive load age-appropriate instead of inheriting the generic profile count.
  const countByAge=[
    level<=12?2:3,
    level<=10?3:level<=18?4:4,
    level<=8?3:level<=16?4:5,
    level<=6?4:level<=14?5:6,
    level<=5?4:level<=12?5:level<=18?6:7
  ];
  const len=clamp(countByAge[age],3,8);
  const a=drawUnique(ARROWS,len,`direction:${age}`);
  const studyBase=[8500,9000,9500,10000,10500][age];
  const studyPerItem=[1400,1450,1500,1550,1600][age];
  const studyMs=clamp(studyBase+Math.max(0,len-3)*studyPerItem,8500,23000);
  const responseBase=[28000,30000,33000,36000,40000][age];
  const responsePerItem=[2500,2700,2900,3100,3300][age];
  const responseMs=clamp(responseBase+len*responsePerItem,30000,65000);
  let remaining=studyMs;

  stage(shell('direction',`<div class="memory-instruction-banner"><strong>MEMORIZE NOW</strong> — Study the direction sequence carefully. It will stay visible until the study timer finishes.</div><div class="sequence-display direction-study-sequence">${a.map(x=>`<span class="sequence-token direction-token">${x}</span>`).join('')}</div><div class="memory-progress direction-study-progress" id="direction-study-progress">Memorize now • ${(studyMs/1000).toFixed(1)} sec remaining</div>`));

  const update=()=>{
    if(t!==S.memoryRoundToken)return;
    remaining=Math.max(0,remaining-100);
    const el=$('direction-study-progress');
    if(el)el.textContent=remaining>0?`Memorize now • ${(remaining/1000).toFixed(1)} sec remaining`:'Get ready…';
    if(remaining>0)S.studyTicker=setTimeout(update,100);
  };
  clearTimeout(S.studyTicker); S.studyTicker=setTimeout(update,100);

  S.timer=setTimeout(()=>{
    if(t!==S.memoryRoundToken)return;
    clearTimeout(S.studyTicker);
    stage(shell('direction',`<div class="memory-instruction-banner"><strong>YOUR TURN</strong> — Tap the directions in the exact order you memorized.</div><div id="dir-options" class="memory-items direction-options"></div><div class="picked-sequence" id="dir-picked">Your sequence: <span>—</span></div><div class="memory-progress" id="direction-response-progress">0 / ${a.length} directions</div>`));
    const box=$('dir-options'),picked=$('dir-picked').querySelector('span');let i=0;S.active=true;
    ARROWS.forEach(x=>{const b=optionButton(x);b.onclick=()=>{if(!S.active||b.disabled)return;if(x!==a[i]){b.classList.add('bad');fail();return}b.classList.add('selected');b.disabled=true;picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ')+x;i++;const prog=$('direction-response-progress');if(prog)prog.textContent=`${i} / ${a.length} directions`;if(i===a.length)complete()};box.appendChild(b)});
    timeout(responseMs);
  },studyMs);
})}
function advancedItemCount(type, age, level, fallback){
  age=clamp(Number(age)||0,0,4); level=clamp(Number(level)||1,1,20);
  // Advanced mechanics are deliberately lighter than the generic item-count curve.
  // Ages 3–5 are not eligible for Tier 4; the runtime guard below falls back safely.
  const reverseCaps=[3,4,5,6,7];
  const reverseStarts=[3,3,4,5,5];
  const reverseLate=[3,4,5,6,7];
  const switchPairs=[2,2,3,3,3];
  if(type==='reverse'){
    if(age===0)return 3;
    const start=reverseStarts[age],cap=reverseCaps[age],late=reverseLate[age];
    const threshold=age===1?19:age===2?14:age===3?10:8;
    if(level<threshold)return start;
    return Math.min(cap, start + (level>=threshold+5 ? 1 : 0));
  }
  if(type==='switchback'){
    if(age===0)return 2;
    let n=switchPairs[age];
    // Keep each stream compact. Only the oldest pathway may reach four per stream,
    // and only late in the pathway.
    if(age===4 && level>=12)n=4;
    if(age===3 && level>=16)n=4;
    return n;
  }
  if(type==='dual'){
    if(age===0)return 2;
    return age===1?2:age===2?3:age===3?3:4;
  }
  if(type==='interference'){
    if(age===0)return 3;
    return age===1?3:age===2?4:age===3?5:6;
  }
  return clamp(fallback,3,7);
}
function reverse(){begin((p,t)=>{
  const age=clamp(Number(S.age)||0,0,4), level=clamp(Number(S.level)||1,1,20);
  const count=advancedItemCount('reverse',age,level,p.count);
  const a=drawUnique(ICONS,count,`reverse:${age}`),target=[...a].reverse();

  // Reverse Recall is a game, not a speed test. Give the player enough time to
  // encode the objects AND their order before asking them to reverse it.
  const studyPerItem=[0,3800,4000,4200,4400][age];
  const studyBase=[12000,13500,14500,15500,16500][age];
  const studyMs=clamp(studyBase+Math.max(0,count-3)*studyPerItem,12000,32000);
  const responseBase=[30000,36000,40000,44000,48000][age];
  const responsePerItem=[2500,3000,3200,3400,3600][age];
  const responseMs=clamp(responseBase+count*responsePerItem,32000,60000);
  let remaining=studyMs;

  stage(shell('reverse',`
    <div class="memory-instruction-banner"><strong>MEMORIZE NOW</strong> — Study the sequence from left to right. You will reproduce it from the last item to the first.</div>
    <div class="sequence-display reverse-study-sequence">${a.map((x,i)=>`<span class="sequence-token" data-i="${i}">${x}</span>`).join('')}</div>
    <div class="memory-progress reverse-study-progress" id="reverse-study-progress">Memorize now • ${(studyMs/1000).toFixed(1)} sec remaining</div>
  `));

  const update=()=>{
    if(t!==S.memoryRoundToken)return;
    remaining=Math.max(0,remaining-100);
    const el=$('reverse-study-progress');
    if(el)el.textContent=remaining>0?`Memorize now • ${(remaining/1000).toFixed(1)} sec remaining`:'Get ready…';
    if(remaining>0)S.studyTicker=setTimeout(update,100);
  };
  S.studyTicker=setTimeout(update,100);

  S.timer=setTimeout(()=>{
    if(t!==S.memoryRoundToken)return;
    clearTimeout(S.studyTicker);
    stage(shell('reverse',`
      <div class="memory-instruction-banner"><strong>YOUR TURN</strong> — Start with the last object and work backwards, one object at a time.</div>
      <div id="rev-options" class="memory-items reverse-options"></div>
      <div class="picked-sequence" id="rev-picked">Your reverse sequence: <span>—</span></div>
    `));
    const box=$('rev-options'),picked=$('rev-picked').querySelector('span');
    let i=0;
    S.active=true;
    shuffle([...a]).forEach(x=>{
      const b=optionButton(x);
      b.onclick=()=>{
        if(!S.active||b.disabled)return;
        if(x!==target[i]){b.classList.add('bad');fail();return}
        b.classList.add('good','selected');
        b.disabled=true;
        picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ')+x;
        i++;
        if(i===target.length)complete();
      };
      box.appendChild(b);
    });
    timeout(responseMs);
  },studyMs);
})}
function grid(){begin((p,t)=>{
  const age=clamp(Number(S.age)||0,0,4),level=clamp(Number(S.level)||1,1,20);
  const size=memoryGridSize(),slots=size*size;
  const countCaps=[3,4,5,6,7];
  const levelBonus=level>=12?1:0;
  const count=clamp(Math.min(countCaps[age]+levelBonus- (age===0?levelBonus:0),p.count,slots-1),2,Math.min(7,slots-1));
  const cells=shuffle([...Array(slots).keys()]).slice(0,count);
  const studyBase=[10500,10000,9500,9000,8500][age];
  const perCell=[1700,1600,1500,1400,1300][age];
  const studyMs=clamp(studyBase+Math.max(0,count-3)*perCell,10000,21000);
  const responseMs=clamp([30000,30000,28000,27000,26000][age]+count*[2500,2400,2300,2200,2100][age],30000,50000);
  let remaining=studyMs;
  stage(shell('grid',`<div class="memory-instruction-banner"><strong>MEMORIZE NOW</strong> — Study the highlighted locations. The board will stay visible until the timer finishes.</div><div class="memory-board" style="--grid:${size}">${[...Array(slots)].map((_,i)=>`<div class="memory-cell ${cells.includes(i)?'placed':''}">${cells.includes(i)?'●':''}</div>`).join('')}</div><div class="memory-progress" id="grid-study-progress">Memorize now • ${(studyMs/1000).toFixed(1)} sec remaining</div>`));
  const update=()=>{
    if(t!==S.memoryRoundToken)return;
    remaining=Math.max(0,remaining-100);
    const el=$('grid-study-progress');
    if(el)el.textContent=remaining>0?`Memorize now • ${(remaining/1000).toFixed(1)} sec remaining`:'Get ready…';
    if(remaining>0)S.studyTicker=setTimeout(update,100);
  };
  clearTimeout(S.studyTicker);S.studyTicker=setTimeout(update,100);
  S.timer=setTimeout(()=>{
    if(t!==S.memoryRoundToken)return;
    clearTimeout(S.studyTicker);
    stage(shell('grid',`<div class="memory-instruction-banner"><strong>YOUR TURN</strong> — Tap every highlighted location.</div><div id="grid-recall" class="memory-board" style="--grid:${size}"></div><div class="memory-progress" id="grid-progress">0 / ${cells.length} found</div>`));
    const box=$('grid-recall');let hit=0;S.active=true;
    for(let i=0;i<slots;i++){const b=optionButton('','memory-cell recall-cell');b.setAttribute('aria-label',`Grid cell ${i+1}`);b.onclick=()=>{if(!S.active||b.disabled)return;if(!cells.includes(i)){b.classList.add('bad');fail();return}b.classList.add('good','placed');b.disabled=true;b.textContent='●';hit++;$('grid-progress').textContent=`${hit} / ${cells.length} found`;if(hit===cells.length)complete()};box.appendChild(b)}
    timeout(responseMs);
  },studyMs);
})}
function pairs(){begin((p,t)=>{const pairsCount=clamp(2+Math.floor((p.count-2)/2),2,5);const faces=drawUnique(ICONS,pairsCount,`pairs:${S.age}`);const cards=shuffle(faces.flatMap((x,i)=>[{x,id:i*2},{x,id:i*2+1}]));stage(shell('pairs',`<div class="memory-instruction-banner">Study the matching pairs.</div><div class="pair-grid" style="grid-template-columns:repeat(${pairsCount<4?2:4},minmax(0,1fr))">${cards.map(c=>`<div class="pair-card pair-study">${c.x}</div>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('pairs',`<div class="memory-instruction-banner">Turn over two cards at a time and find all pairs.</div><div id="pair-game" class="pair-grid" style="grid-template-columns:repeat(${pairsCount<4?2:4},minmax(0,1fr))"></div><div class="memory-progress" id="pair-progress">0 / ${pairsCount} pairs</div>`));const box=$('pair-game');let first=null,lock=false,matches=0;S.active=true;cards.forEach((c,idx)=>{const b=optionButton('?','pair-card');b.dataset.face=c.x;b.dataset.idx=idx;b.onclick=()=>{if(!S.active||lock||b.classList.contains('flipped')||b.classList.contains('matched'))return;b.classList.add('flipped');b.textContent=c.x;if(!first){first=b;return}if(first.dataset.face===b.dataset.face){first.classList.add('matched');b.classList.add('matched');first=null;matches++;$('pair-progress').textContent=`${matches} / ${pairsCount} pairs`;if(matches===pairsCount)complete()}else{lock=true;const prev=first;setTimeout(()=>{if(S.active){prev.classList.remove('flipped');prev.textContent='?';b.classList.remove('flipped');b.textContent='?'}first=null;lock=false},550)}};box.appendChild(b)});timeout(Math.max(p.response*1.7,12000))},p.show)})}
function location(){begin((p,t)=>{const age=clamp(Number(S.age)||0,0,4),size=LOCATION_GRID[age]||3;const slots=size*size;const minCount=age===0?2:3;const count=clamp(Math.min(p.count,Math.floor(slots*.45),[3,4,5,6,7][age]),minCount,Math.min(7,slots-1));const icons=drawUnique(ICONS,count,`location:${S.age}`),positions=shuffle([...Array(slots).keys()]).slice(0,count),map=positions.map((slot,i)=>({slot,icon:icons[i]}));stage(shell('location',`<div class="memory-instruction-banner">Remember each object and where it appears.</div><div class="memory-board" style="--grid:${size}">${[...Array(slots)].map((_,i)=>{const m=map.find(x=>x.slot===i);return `<div class="memory-cell">${m?m.icon:''}</div>`}).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('location',`<div class="memory-instruction-banner">Select an object, then tap its original location.</div><div id="loc-icons" class="location-icons" aria-label="Objects to place"></div><div class="memory-progress location-progress-inline" id="loc-progress">0 / ${map.length} placed</div><div id="loc-grid" class="memory-board" style="--grid:${size}" aria-label="Location memory board"></div>`));const ib=$('loc-icons'),gb=$('loc-grid');let selected=null,placed=0;S.active=true;shuffle(icons).forEach(icon=>{const b=optionButton(icon,'location-icon');b.dataset.icon=icon;b.setAttribute('aria-label',`Select ${icon}`);b.onclick=()=>{if(!S.active||b.disabled)return;selected=icon;ib.querySelectorAll('.location-icon').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};ib.appendChild(b)});for(let i=0;i<slots;i++){const b=optionButton('','memory-cell recall-cell');b.dataset.slot=String(i);b.setAttribute('aria-label',`Grid position ${i+1}`);b.onclick=()=>{if(!S.active||!selected||b.disabled)return;const slot=Number(b.dataset.slot),expected=map.find(x=>x.slot===slot);if(!expected||expected.icon!==selected){b.classList.add('bad');fail();return}b.classList.add('good','placed');b.textContent=selected;b.disabled=true;const src=[...ib.children].find(x=>x.dataset.icon===selected);if(src){src.disabled=true;src.classList.remove('selected');src.classList.add('used')}selected=null;placed++;$('loc-progress').textContent=`${placed} / ${map.length} placed`;if(placed===map.length)complete()};gb.appendChild(b)}timeout(p.response*1.25)},p.show)})}
function feature(){begin((p,t)=>{const age=clamp(Number(S.age)||0,0,4);const n=clamp(Math.min(p.count,[3,4,5,6,7][age]),3,7),items=drawUnique(SHAPES,n,`feature:${S.age}`).map((shape,i)=>({shape,color:COLORS[(i+S.level+S.age)%COLORS.length]}));stage(shell('feature',`<div class="memory-instruction-banner">Remember each shape together with its colour.</div><div class="feature-grid">${items.map(x=>`<div class="feature-token"><span>${x.shape}</span><small>${COLOR_EMOJI[x.color]} ${x.color}</small></div>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;const distract=shuffle(COLORS.flatMap(c=>SHAPES.map(s=>({shape:s,color:c})) ).filter(x=>!items.some(y=>y.shape===x.shape&&y.color===x.color))).slice(0,Math.min(6,n+2));stage(shell('feature',`<div class="memory-instruction-banner">Select the exact shape + colour combinations you remember.</div><div id="feature-options" class="feature-grid"></div><div class="memory-progress" id="feature-progress">0 / ${n} selected</div>`));const box=$('feature-options');let hit=0;S.active=true;shuffle([...items,...distract]).forEach(x=>{const b=optionButton('', 'feature-option');b.innerHTML=`<span>${x.shape}</span><small>${COLOR_EMOJI[x.color]} ${x.color}</small>`;b.onclick=()=>{if(!S.active||b.disabled)return;if(items.some(y=>y.shape===x.shape&&y.color===x.color)){b.classList.add('good','selected');b.disabled=true;hit++;$('feature-progress').textContent=`${hit} / ${n} selected`;if(hit===n)complete()}else{b.classList.add('bad');fail()}};box.appendChild(b)});timeout(p.response)},p.show)})}
function category(){begin((p,t)=>{const age=clamp(Number(S.age)||0,0,4);const groups=age===0?{animals:['🐶','🐱','🐼'],foods:['🍎','🍕','🍌'],vehicles:['🚗','🚌','🚲'],nature:['🌳','🌊','🌻']}:{animals:['🐶','🐱','🐼','🦊'],foods:['🍎','🍕','🍌','🥕'],vehicles:['🚗','🚌','🚲','✈️'],nature:['🌳','🌊','🌻','⛰️']};const names=Object.keys(groups),name=names[(S.level+S.age)%names.length],target=groups[name];const distract=shuffle(Object.values(groups).flat()).filter(x=>!target.includes(x)).slice(0,Math.max(3,p.count));const study=shuffle([...target,...distract]);stage(shell('category',`<div class="memory-instruction-banner">Remember the category: <strong>${name.toUpperCase()}</strong></div><div class="memory-items">${study.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('category',`<div class="memory-instruction-banner">Select every object from the <strong>${name}</strong> category.</div><div id="cat-options" class="memory-items"></div><div class="memory-progress" id="cat-progress">0 / ${target.length} selected</div>`));const box=$('cat-options');let hit=0;S.active=true;shuffle(study).forEach(x=>{const b=optionButton(x);b.onclick=()=>{if(!S.active||b.disabled)return;if(target.includes(x)){b.classList.add('good','selected');b.disabled=true;hit++;$('cat-progress').textContent=`${hit} / ${target.length} selected`;if(hit===target.length)complete()}else{b.classList.add('bad');fail()}};box.appendChild(b)});timeout(p.response)},p.show)})}
function count(){begin((p,t)=>{const age=clamp(Number(S.age)||0,0,4);const n=clamp(Math.min(p.count-1,[2,3,3,4,4][age]),2,4),types=drawUnique(ICONS,n,`count:${S.age}`),counts=types.map((_,i)=>2+((S.level+i+S.age)%([2,2,3,3,3][age])));const pool=shuffle(types.flatMap((x,i)=>Array(counts[i]).fill(x)));stage(shell('count',`<div class="memory-instruction-banner">Remember how many times each object appears.</div><div class="memory-items">${pool.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('count',`<div class="memory-instruction-banner">Choose the correct count for each object.</div><div id="count-list" class="count-list"></div>`));const box=$('count-list');let done=0;S.active=true;types.forEach((icon,i)=>{const row=document.createElement('div');row.className='count-row';row.innerHTML=`<span class="count-object">${icon}</span><div class="count-choices"></div>`;const cb=row.querySelector('.count-choices'),correct=counts[i];const vals=shuffle([...new Set([correct,1,2,3,4,5,6])]).slice(0,4);if(!vals.includes(correct))vals[0]=correct;shuffle(vals).forEach(v=>{const b=optionButton(String(v),'word-option');b.onclick=()=>{if(!S.active||b.disabled)return;if(v!==correct){b.classList.add('bad');fail();return}b.classList.add('good','selected');b.disabled=true;done++;if(done===types.length)complete()};cb.appendChild(b)});box.appendChild(row)});timeout(p.response*1.25)},p.show)})}
function working(){begin((p,t)=>{const a=drawUnique(ICONS,p.count,`working:${S.age}`),missingIndex=Math.floor(a.length/2),missing=a[missingIndex];stage(shell('working',`<div class="memory-instruction-banner">Study the sequence. One item will disappear.</div><div class="sequence-display">${a.map(x=>`<span class="sequence-token">${x}</span>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;const shown=a.map((x,i)=>i===missingIndex?'❓':x);const distract=shuffle(ICONS.filter(x=>!a.includes(x))).slice(0,3);stage(shell('working',`<div class="memory-instruction-banner">Which object was missing?</div><div class="sequence-display">${shown.map(x=>`<span class="sequence-token">${x}</span>`).join('')}</div><div id="work-options" class="memory-items"></div>`));const box=$('work-options');S.active=true;shuffle([missing,...distract]).forEach(x=>{const b=optionButton(x);b.onclick=()=>{if(!S.active)return;if(x===missing){b.classList.add('good');complete()}else{b.classList.add('bad');fail()}};box.appendChild(b)});timeout(p.response)},p.show)})}
function change(){begin((p,t)=>{const a=drawUnique(ICONS,p.count,`change:${S.age}`),idx=Math.floor(a.length/2),changed=shuffle(ICONS.filter(x=>!a.includes(x)))[0],b=[...a];b[idx]=changed;stage(shell('change',`<div class="memory-instruction-banner">Study Scene A carefully.</div><div class="memory-items">${a.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('change',`<div class="memory-instruction-banner">Which object changed?</div><div class="change-scenes"><div><small>SCENE A</small><div class="memory-items">${a.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div><div><small>SCENE B</small><div class="memory-items">${b.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div></div></div><div id="change-options" class="memory-items"></div>`));const box=$('change-options');S.active=true;shuffle([a[idx],changed,...shuffle(ICONS.filter(x=>!a.includes(x)&&x!==changed)).slice(0,2)]).forEach(x=>{const b=optionButton(x);b.onclick=()=>{if(!S.active)return;if(x===changed){b.classList.add('good');complete()}else{b.classList.add('bad');fail()}};box.appendChild(b)});timeout(p.response)},p.show)})}
function order(){begin((p,t)=>{const a=drawUnique(ICONS,p.count,`order:${S.age}`);stage(shell('order',`<div class="memory-instruction-banner">Remember this left-to-right order.</div><div class="sequence-display">${a.map(x=>`<span class="sequence-token">${x}</span>`).join('')}</div>`));S.timer=setTimeout(()=>{if(t!==S.memoryRoundToken)return;stage(shell('order',`<div class="memory-instruction-banner">Tap the objects from first to last.</div><div id="order-options" class="memory-items"></div><div class="picked-sequence" id="order-picked">Your order: <span>—</span></div>`));const box=$('order-options'),picked=$('order-picked').querySelector('span');let i=0;S.active=true;shuffle([...a]).forEach(x=>{const b=optionButton(x);b.onclick=()=>{if(!S.active)return;if(x!==a[i]){b.classList.add('bad');fail();return}b.classList.add('selected');picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ')+x;i++;if(i===a.length)complete()};box.appendChild(b)});timeout(p.response)},p.show)})}
function dual(){begin((p,t)=>{
  const n=clamp(Math.floor(p.count/2),2,4),
    a=drawUnique(ICONS,n,`dual-a:${S.age}`),
    b=drawUnique(ICONS.filter(x=>!a.includes(x)),n,`dual-b:${S.age}`),
    seq=[];
  for(let i=0;i<n;i++)seq.push({stream:'A',index:i,value:a[i]},{stream:'B',index:i,value:b[i]});

  // Dual-Sequence gets its own generous study window. The response board mirrors
  // the study board so the player is never asked to translate between layouts.
  const studyMs=clamp(15000+n*2500,17500,25000);
  const responseMs=Math.max(30000,p.response*1.8);
  const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const streamMarkup=(name,items,active=false)=>`
    <div class="dual-memory-stream ${active?'is-active':''}" data-stream="${name}">
      <div class="dual-memory-stream-head"><span>STREAM ${name}</span><small>${active?'YOUR TURN':'WAIT'}</small></div>
      <div class="dual-memory-row">${items.map((x,i)=>`<span class="dual-memory-token" data-stream="${name}" data-index="${i}">${esc(x)}</span>`).join('')}</div>
    </div>`;

  $('game-message').textContent='';
  stage(shell('dual',`
    <div class="dual-phase-label study"><span>MEMORIZE</span><strong>Study both streams carefully.</strong></div>
    <div class="memory-instruction-banner"><strong>Remember the pattern:</strong> first item in A, first item in B, then second item in A, second item in B.</div>
    <div class="dual-study-board">
      ${streamMarkup('A',a)}
      ${streamMarkup('B',b)}
    </div>
    <div class="memory-progress dual-study-progress" id="dual-study-progress">Memorize now • ${(studyMs/1000).toFixed(1)} sec remaining</div>
  `));

  let remaining=studyMs;
  const update=()=>{
    if(t!==S.memoryRoundToken)return;
    remaining=Math.max(0,remaining-100);
    const el=$('dual-study-progress');
    if(el)el.textContent=remaining>0?`Memorize now • ${(remaining/1000).toFixed(1)} sec remaining`:'Get ready…';
    if(remaining>0)S.studyTicker=setTimeout(update,100);
  };
  S.studyTicker=setTimeout(update,100);

  S.timer=setTimeout(()=>{
    if(t!==S.memoryRoundToken)return;
    clearTimeout(S.studyTicker);
    $('game-message').textContent='';

    stage(shell('dual',`
      <div class="dual-phase-label response"><span>YOUR TURN</span><strong>Rebuild the pattern one step at a time.</strong></div>
      <div class="memory-instruction-banner"><strong>Follow the highlighted turn.</strong> Choose exactly one item from the active stream. Then the game will switch to the other stream.</div>
      <div class="dual-pattern-guide" id="dual-pattern-guide">A → B → A → B → …</div>
      <div class="dual-response-board" id="dual-response-board">
        ${streamMarkup('A',a,true)}
        ${streamMarkup('B',b,false)}
      </div>
      <div class="dual-turn" id="dual-turn"><span>YOUR TURN</span><strong>Stream A</strong><small>Choose item 1 of ${n}</small></div>
      <div class="picked-sequence" id="dual-picked">Your sequence: <span>—</span></div>
    `));

    const board=$('dual-response-board'),turn=$('dual-turn'),picked=$('dual-picked').querySelector('span');
    let i=0;
    S.active=true;

    const groups={A:board.querySelector('[data-stream="A"]'),B:board.querySelector('[data-stream="B"]')};
    const setTurn=()=>{
      const expected=seq[i];
      ['A','B'].forEach(stream=>{
        const group=groups[stream];
        const active=stream===expected.stream;
        group.classList.toggle('is-active',active);
        group.classList.toggle('is-waiting',!active);
        group.querySelector('.dual-memory-stream-head small').textContent=active?'YOUR TURN':'WAIT';
        group.querySelectorAll('.dual-memory-token').forEach(btn=>{
          btn.disabled=!active || btn.dataset.used==='1';
          btn.setAttribute('aria-disabled',String(!active || btn.dataset.used==='1'));
        });
      });
      turn.innerHTML=`<span>YOUR TURN</span><strong>Stream ${expected.stream}</strong><small>Choose item ${expected.index+1} of ${n}</small>`;
    };

    groups.A.querySelectorAll('.dual-memory-token').forEach(btn=>btn.type='button');
    groups.B.querySelectorAll('.dual-memory-token').forEach(btn=>btn.type='button');

    const bind=(stream,group)=>group.querySelectorAll('.dual-memory-token').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(!S.active || btn.disabled)return;
        const expected=seq[i];
        const index=Number(btn.dataset.index);
        if(stream!==expected.stream || index!==expected.index){
          btn.classList.remove('wrong-flash');void btn.offsetWidth;btn.classList.add('wrong-flash');
          fail();
          return;
        }
        btn.dataset.used='1';
        btn.classList.add('correct-picked');
        btn.disabled=true;
        const label=btn.textContent;
        picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ') + label;
        i++;
        if(i===seq.length){complete();return;}
        setTurn();
      });
    });
    bind('A',groups.A);bind('B',groups.B);setTurn();
    timeout(responseMs);
  },studyMs);
});}
function interference(){begin((p,t)=>{
  const n=clamp(p.count,3,7),
    target=drawUnique(ICONS,n,`interference:${S.age}`),
    distract=shuffle(ICONS.filter(x=>!target.includes(x))).slice(0,clamp(2+S.age,2,5));

  // Interference Recall needs a deliberate memorisation phase. The generic Memory Lab
  // show timer becomes too short at higher levels, so this activity uses its own
  // generous study window and keeps the target visible until that window ends.
  const studyMs=clamp(14000+n*1400,16000,22000);
  const responseMs=Math.max(30000,p.response*1.8);
  let remaining=studyMs;

  stage(shell('interference',`
    <div class="memory-instruction-banner"><strong>MEMORIZE THE TARGET</strong> — Ignore the distractors and study the target sequence from left to right.</div>
    <div class="sequence-display interference-target">${target.map((x,i)=>`<span class="sequence-token" data-i="${i}">${x}</span>`).join('')}</div>
    <div class="memory-distractor"><span>DISTRACTORS — IGNORE</span>${distract.join(' ')}</div>
    <div class="memory-progress interference-study-progress" id="interference-study-progress">Memorize now • ${(studyMs/1000).toFixed(1)} sec remaining</div>
  `));

  const update=()=>{
    if(t!==S.memoryRoundToken)return;
    remaining=Math.max(0,remaining-100);
    const el=$('interference-study-progress');
    if(el)el.textContent=remaining>0?`Memorize now • ${(remaining/1000).toFixed(1)} sec remaining`:'Get ready…';
    if(remaining>0)S.studyTicker=setTimeout(update,100);
  };
  S.studyTicker=setTimeout(update,100);

  S.timer=setTimeout(()=>{
    if(t!==S.memoryRoundToken)return;
    clearTimeout(S.studyTicker);
    stage(shell('interference',`
      <div class="memory-instruction-banner"><strong>YOUR TURN</strong> — Tap the TARGET sequence in the original order.</div>
      <div id="int-options" class="memory-items interference-options"></div>
      <div class="picked-sequence" id="int-picked">Target: <span>—</span></div>
    `));
    const box=$('int-options'),picked=$('int-picked').querySelector('span');
    let i=0;
    S.active=true;
    shuffle([...new Set([...target,...distract])]).forEach(x=>{
      const b=optionButton(x);
      b.onclick=()=>{
        if(!S.active||b.disabled)return;
        if(x!==target[i]){b.classList.add('bad');fail();return}
        b.classList.add('good','selected');
        b.disabled=true;
        picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ')+x;
        i++;
        if(i===target.length)complete();
      };
      box.appendChild(b);
    });
    timeout(responseMs);
  },studyMs);
})}
function switchback(){begin((p,t)=>{
  const age=clamp(Number(S.age)||0,0,4), level=clamp(Number(S.level)||1,1,20);
  const n=advancedItemCount('switchback',age,level,p.count);
  const a=drawUnique(ICONS,n,`switch-a:${age}`),
    b=drawUnique(ICONS.filter(x=>!a.includes(x)),n,`switch-b:${age}`),
    seq=[];
  for(let i=0;i<n;i++)seq.push({stream:'A',index:i,value:a[i]},{stream:'B',index:i,value:b[i]});

  // Keep the streams compact and give enough quiet study time to encode both
  // the items and the alternating rule.
  const studyBase=[14000,17000,19000,21000,23000][age];
  const studyPerItem=[0,2200,2300,2400,2500][age];
  const studyMs=clamp(studyBase+Math.max(0,n-2)*studyPerItem,14000,32000);
  const responseBase=[32000,38000,42000,46000,50000][age];
  const responsePerStep=[3000,3200,3400,3500,3600][age];
  const responseMs=clamp(responseBase+(seq.length*responsePerStep),35000,65000);
  const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const streamMarkup=(name,items,active=false)=>`
    <div class="dual-memory-stream ${active?'is-active':''}" data-stream="${name}">
      <div class="dual-memory-stream-head"><span>STREAM ${name}</span><small>${active?'YOUR TURN':'WAIT'}</small></div>
      <div class="dual-memory-row">${items.map((x,i)=>`<span class="dual-memory-token" data-stream="${name}" data-index="${i}">${esc(x)}</span>`).join('')}</div>
    </div>`;

  $('game-message').textContent='';
  stage(shell('switchback',`
    <div class="dual-phase-label study"><span>MEMORIZE</span><strong>Study both streams carefully.</strong></div>
    <div class="memory-instruction-banner"><strong>Remember the pattern:</strong> first item in A, first item in B, then second in A, second in B.</div>
    <div class="dual-study-board">${streamMarkup('A',a)}${streamMarkup('B',b)}</div>
    <div class="memory-progress dual-study-progress" id="switch-study-progress">Memorize now • ${(studyMs/1000).toFixed(1)} sec remaining</div>
  `));

  let remaining=studyMs;
  const update=()=>{
    if(t!==S.memoryRoundToken)return;
    remaining=Math.max(0,remaining-100);
    const el=$('switch-study-progress');
    if(el)el.textContent=remaining>0?`Memorize now • ${(remaining/1000).toFixed(1)} sec remaining`:'Get ready…';
    if(remaining>0)S.studyTicker=setTimeout(update,100);
  };
  S.studyTicker=setTimeout(update,100);

  S.timer=setTimeout(()=>{
    if(t!==S.memoryRoundToken)return;
    clearTimeout(S.studyTicker);
    stage(shell('switchback',`
      <div class="dual-phase-label response"><span>YOUR TURN</span><strong>Switch between A and B one item at a time.</strong></div>
      <div class="memory-instruction-banner"><strong>Follow the highlighted turn.</strong> Choose one item from the active stream, then switch to the other stream.</div>
      <div class="dual-pattern-guide">A → B → A → B → …</div>
      <div class="dual-response-board" id="switch-response-board">${streamMarkup('A',a,true)}${streamMarkup('B',b,false)}</div>
      <div class="dual-turn" id="switch-turn"><span>YOUR TURN</span><strong>Stream A</strong><small>Choose item 1 of ${n}</small></div>
      <div class="picked-sequence" id="switch-picked">Your sequence: <span>—</span></div>
    `));

    const board=$('switch-response-board'),turn=$('switch-turn'),picked=$('switch-picked').querySelector('span');
    let i=0;S.active=true;
    const groups={A:board.querySelector('[data-stream="A"]'),B:board.querySelector('[data-stream="B"]')};
    const setTurn=()=>{
      const expected=seq[i];
      ['A','B'].forEach(stream=>{
        const group=groups[stream],active=stream===expected.stream;
        group.classList.toggle('is-active',active);group.classList.toggle('is-waiting',!active);
        group.querySelector('.dual-memory-stream-head small').textContent=active?'YOUR TURN':'WAIT';
        group.querySelectorAll('.dual-memory-token').forEach(btn=>{btn.disabled=!active||btn.dataset.used==='1';btn.setAttribute('aria-disabled',String(!active||btn.dataset.used==='1'));});
      });
      turn.innerHTML=`<span>YOUR TURN</span><strong>Stream ${expected.stream}</strong><small>Choose item ${expected.index+1} of ${n}</small>`;
    };
    const bind=(stream,group)=>group.querySelectorAll('.dual-memory-token').forEach(btn=>{
      btn.type='button';
      btn.addEventListener('click',()=>{
        if(!S.active||btn.disabled)return;
        const expected=seq[i],index=Number(btn.dataset.index);
        if(stream!==expected.stream||index!==expected.index){btn.classList.remove('wrong-flash');void btn.offsetWidth;btn.classList.add('wrong-flash');fail();return;}
        btn.dataset.used='1';btn.classList.add('correct-picked');btn.disabled=true;
        picked.textContent=(picked.textContent==='—'?'':picked.textContent+' ')+btn.textContent;
        i++;if(i===seq.length){complete();return;}setTurn();
      });
    });
    bind('A',groups.A);bind('B',groups.B);setTurn();timeout(responseMs);
  },studyMs);
})}
function runType(type){S.memoryCurrentType=type;({visual,sequence,grid,pairs,location,feature,direction,category,working,count,change,order,reverse,dual,interference,switchback}[type]||visual)()}
function activityStudyMs(type,p){
  const age=clamp(Number(S.age)||0,0,4), level=clamp(Number(S.level)||1,1,20);
  if(type==='dual'){
    const n=advancedItemCount('dual',age,level,p.count);
    return clamp([14000,17000,19000,21000,23000][age]+Math.max(0,n-2)*[0,2200,2300,2400,2500][age],14000,32000);
  }
  if(type==='interference'){
    const n=advancedItemCount('interference',age,level,p.count);
    return clamp([15000,18000,20000,22000,24000][age]+Math.max(0,n-3)*[0,1800,2000,2200,2400][age],15000,32000);
  }
  if(type==='reverse'){
    const n=advancedItemCount('reverse',age,level,p.count);
    return clamp([12000,13500,14500,15500,16500][age]+Math.max(0,n-3)*[0,3800,4000,4200,4400][age],12000,32000);
  }
  if(type==='switchback'){
    const n=advancedItemCount('switchback',age,level,p.count);
    return clamp([14000,17000,19000,21000,23000][age]+Math.max(0,n-2)*[0,2200,2300,2400,2500][age],14000,32000);
  }
  return p.show;
}
function activityResponseMs(type,p){
  const age=clamp(Number(S.age)||0,0,4), level=clamp(Number(S.level)||1,1,20);
  if(type==='dual'){
    const n=advancedItemCount('dual',age,level,p.count),steps=n*2;
    return clamp([32000,38000,42000,46000,50000][age]+steps*[3000,3200,3400,3500,3600][age],35000,65000);
  }
  if(type==='interference'){
    const n=advancedItemCount('interference',age,level,p.count);
    return clamp([32000,36000,40000,44000,48000][age]+n*[2800,3000,3200,3400,3500][age],35000,60000);
  }
  if(type==='reverse'){
    const n=advancedItemCount('reverse',age,level,p.count);
    return clamp([30000,36000,40000,44000,48000][age]+n*[2500,3000,3200,3400,3600][age],32000,60000);
  }
  if(type==='switchback'){
    const n=advancedItemCount('switchback',age,level,p.count),steps=n*2;
    return clamp([32000,38000,42000,46000,50000][age]+steps*[3000,3200,3400,3500,3600][age],35000,65000);
  }
  return p.response;
}
function instructions(type){const i=INFO[type]||INFO.visual,p=profile(),studyMs=activityStudyMs(type,p),responseMs=activityResponseMs(type,p);clear();S.active=false;stage(`<div class="memory-instruction-screen"><div class="instruction-icon">🧠</div><span class="memory-kind">${i[2]}</span><div class="instruction-activity">Activity ${(S.memoryActivity||0)+1} of 4</div><h2>${i[0]}</h2><p class="instruction-purpose">${i[1]}</p><div class="instruction-rule"><strong>How to play</strong><p>${RULES[type]||RULES.visual}</p></div><div class="instruction-timing"><span>⏱️ Study: ${(studyMs/1000).toFixed(1)} sec</span><span>🎯 Response: ${Math.round(responseMs/1000)} sec</span></div><button id="start-memory-activity" type="button" class="primary-btn instruction-start">Start Activity →</button></div>`);$('start-memory-activity').onclick=()=>{S.memoryAttempts=0;S.memoryCurrentType=type;runType(type)}}
function validatePlans(){
  const errors=[];
  PLANS_BY_AGE.forEach((plan,age)=>{
    if(plan.length!==20)errors.push(`age ${age}: expected 20 levels`);
    plan.forEach((row,l)=>{
      if(row.length!==4)errors.push(`age ${age} level ${l+1}: expected 4 activities`);
      if(new Set(row).size!==4)errors.push(`age ${age} level ${l+1}: duplicate mechanic`);
      if(l>0)row.forEach((m,slot)=>{if(m===plan[l-1][slot])errors.push(`age ${age} level ${l+1} slot ${slot+1}: consecutive repeat ${m}`)});
    });
    if(age===0&&plan.flat().some(m=>['reverse','dual','interference','switchback'].includes(m)))errors.push('age 3–5 contains Tier 4');
  });
  return errors;
}
const PLAN_ERRORS=validatePlans();
function run(){
  S.memoryActivity=Number.isFinite(S.memoryActivity)?S.memoryActivity:0;
  const age=clamp(Number(S.age)||0,0,4),level=clamp(Number(S.level)||1,1,20);
  const plan=PLANS_BY_AGE[age]||PLANS_BY_AGE[0],row=plan[level-1]||plan[0];
  let type=row[clamp(S.memoryActivity,0,3)]||'visual';
  // Hard safety gate: Tier 4 is intentionally unavailable to ages 3–5.
  // This protects players even if an older cached schedule is still present.
  if(age===0 && ['reverse','dual','interference','switchback'].includes(type)){
    const fallback=['visual','category','direction','grid'];
    type=fallback[clamp(S.memoryActivity,0,3)];
  }
  instructions(type);
}
window.MQMemoryLab={run,plans:PLANS_BY_AGE,unlocks:UNLOCKS_BY_AGE,difficulty:DIFFICULTY_POINTS,planErrors:PLAN_ERRORS,mechanics:Object.keys(INFO),pacing:pacingSummary()};
})();
