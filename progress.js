(() => {
'use strict';
const MQ=window.MQ;if(!MQ)return;
const STORE='mindquest-progress-v3',SESSION='mindquest-session-v3',AGE_KEY='mindquest-age-pathway',VIEW_KEY='mindquest-current-view-v3',ACCOUNT_KEY='mindquest-account-v1',INTEL_KEY='mindquest-intelligence-v1';
const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}})();
const intel=(()=>{try{return JSON.parse(localStorage.getItem(INTEL_KEY)||'{}')}catch{return {}}})();
let arcadeExitSave=false;
const keyFor=(age,game)=>`${age}:${game}`;
const gameName=id=>({memory:'Memory Lab',detective:'Detective',reflex:'Reflex Arena',builder:'Builder',team:'Team Quest',world:'World Explorer',money:'Money Mission'})[id]||id;
const skillLabels={memory:'Memory',attention:'Attention',logic:'Logic',problemSolving:'Problem Solving',reaction:'Reaction',precision:'Precision',teamwork:'Teamwork',empathy:'Empathy',responsibility:'Responsibility',geography:'World Knowledge',financialLiteracy:'Financial Thinking'};
const allSkills=Object.keys(skillLabels);
const checkpoint=()=>{const s=MQ.state;return {age:s.age,game:s.game,level:s.level,lives:s.lives,streak:s.streak,bestStreak:s.bestStreak,xp:s.xp,score:s.score,earnedThisRun:s.earnedThisRun,milestonePending:!!s.milestonePending,milestoneLevel:s.milestoneLevel||0,detectiveActivity:s.detectiveActivity||0,memoryActivity:s.memoryActivity||0,reflexActivity:s.reflexActivity||0,builderActivity:s.builderActivity||0,teamActivity:s.teamActivity||0,worldActivity:s.worldActivity||0,moneyActivity:s.moneyActivity||0,skills:s.skills,skillStats:s.skillStats,account:s.account||null,premium:!!s.premium,premiumPlan:s.premiumPlan||"",premiumTrialUntil:s.premiumTrialUntil||0}};
const save=()=>{try{if(MQ.state.account)persistAccount(MQ.state.account);if(MQ.state.game)saved[keyFor(MQ.state.age,MQ.state.game)]=checkpoint();localStorage.setItem(STORE,JSON.stringify(saved));localStorage.setItem(SESSION,JSON.stringify({age:MQ.state.age,game:MQ.state.game}));localStorage.setItem(AGE_KEY,String(MQ.state.age));localStorage.setItem(INTEL_KEY,JSON.stringify(intel));return true}catch{return false}};
const showSaveStatus=(message='Progress saved')=>{const el=document.getElementById('save-status');if(!el)return;el.textContent=message;el.classList.add('visible');clearTimeout(showSaveStatus.t);showSaveStatus.t=setTimeout(()=>el.classList.remove('visible'),1800)};
const saveNow=()=>{const ok=save();showSaveStatus(ok?'Progress saved':'Save unavailable — continuing locally');return ok};
const saveAndExit=()=>{saveNow();try{localStorage.setItem(VIEW_KEY,'home')}catch{};arcadeExitSave=true;setTimeout(()=>{arcadeExitSave=false;document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById('home')?.classList.add('active');if(typeof MQ?.goHome==='function')MQ.goHome();},40)};
const restore=p=>{Object.assign(MQ.state,p);MQ.state.active=false;MQ.state.timer=null;MQ.state.skills=p.skills||MQ.state.skills;MQ.state.skillStats=p.skillStats||MQ.state.skillStats;MQ.state.account=p.account||MQ.state.account;MQ.state.premium=!!p.premium;MQ.state.premiumPlan=p.premiumPlan||"";MQ.state.premiumTrialUntil=p.premiumTrialUntil||0;syncPlayerIdentity();MQ.updateGlobal()};
function injectStyles(){if(document.getElementById('mq-intel-styles'))return;const s=document.createElement('style');s.id='mq-intel-styles';s.textContent=`
.player-identity{display:flex;align-items:center;gap:8px;margin-left:6px;padding:6px 10px 6px 7px;border:1px solid var(--line);border-radius:14px;background:#fff;min-width:112px;box-shadow:0 3px 12px rgba(25,32,70,.05)}.player-identity .player-avatar{width:28px;height:28px;display:grid;place-items:center;border-radius:9px;background:#f0efff;font-size:14px}.player-identity small{display:block;font-size:8px;font-weight:900;letter-spacing:.08em;color:var(--muted);line-height:1}.player-identity b{display:block;font-size:11px;max-width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px}.mq-profile-btn{margin-left:4px}.mq-profile-overlay{position:fixed;inset:0;background:rgba(8,10,25,.55);backdrop-filter:blur(7px);z-index:120;display:none;overflow:auto;padding:18px}.mq-profile-overlay.open{display:block}.mq-profile{width:min(1050px,100%);margin:0 auto;background:#fff;border-radius:28px;padding:26px;box-shadow:0 30px 100px rgba(0,0,0,.25)}.mq-profile-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.mq-profile h2{margin:3px 0}.mq-close{border:1px solid var(--line);background:#fff;border-radius:12px;width:38px;height:38px;cursor:pointer}.mq-profile-hero{margin:18px 0;padding:20px;border-radius:20px;background:linear-gradient(135deg,#171a38,#34378f);color:#fff;display:grid;grid-template-columns:1.3fr .7fr;gap:15px}.mq-profile-hero h3{font-size:25px;margin:3px 0}.mq-profile-hero p{color:#dce0ff;font-size:12px}.mq-profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.mq-profile-stat{padding:13px;border-radius:14px;background:rgba(255,255,255,.1)}.mq-profile-stat b{display:block;font-size:22px}.mq-profile-stat span{font-size:10px;color:#dce0ff}.mq-skill-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.mq-skill{border:1px solid var(--line);border-radius:15px;padding:13px;background:#fafbfe}.mq-skill-top{display:flex;justify-content:space-between;gap:8px;font-size:11px;font-weight:900}.mq-skill small{display:block;color:var(--muted);margin-top:4px;font-size:10px}.mq-bar{height:7px;background:#eceef5;border-radius:99px;margin-top:9px;overflow:hidden}.mq-bar span{display:block;height:100%;background:var(--accent);border-radius:99px}.mq-section{margin-top:22px}.mq-section h3{margin:0 0 9px}.mq-mission{border:1px solid var(--line);border-radius:16px;padding:15px;background:#f8f9fc;display:flex;justify-content:space-between;gap:15px;align-items:center}.mq-history{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.mq-history-card{border:1px solid var(--line);border-radius:14px;padding:12px}.mq-history-card strong{font-size:18px}.mq-history-card small{display:block;color:var(--muted);font-size:10px;margin-top:4px}.mq-note{font-size:11px;color:var(--muted);line-height:1.45}.mq-premium-chip{display:inline-block;padding:5px 8px;border-radius:99px;background:#fff3cf;color:#765b00;font-size:9px;font-weight:900}@media(max-width:760px){.mq-profile-hero{grid-template-columns:1fr}.mq-skill-grid{grid-template-columns:repeat(2,1fr)}.mq-history{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.mq-profile{padding:18px}.mq-skill-grid{grid-template-columns:1fr}.mq-profile-stats{grid-template-columns:1fr 1fr 1fr}.mq-mission{display:block}.mq-mission button{margin-top:10px}}@media(max-width:900px){#home .game-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:650px){#home .game-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){#home .game-grid{grid-template-columns:1fr}}#home .game-tile{min-width:0;min-height:175px}#resume-progress-wrap{width:100%;margin:16px 0 0!important}.mq-resume-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:18px}.mq-resume-meta{margin-top:4px;color:var(--muted);font-size:12px}.mq-resume-card strong{font-size:15px}@media(max-width:600px){.mq-resume-card{align-items:flex-start;flex-direction:column}.mq-resume-card button{width:100%}}
`;document.head.appendChild(s)}
function ensureIntel(){
  intel.version=2;
  intel.history=Array.isArray(intel.history)?intel.history:[];
  intel.totalLevels=Number(intel.totalLevels||0);
  intel.highestLevel=Number(intel.highestLevel||0);
  intel.completedLevels=Number(intel.completedLevels||0);
  intel.milestones=Array.isArray(intel.milestones)?intel.milestones:[];
  intel.games=(intel.games&&typeof intel.games==='object')?intel.games:{};
  intel.skillStats=(intel.skillStats&&typeof intel.skillStats==='object')?intel.skillStats:{};
  allSkills.forEach(k=>intel.skillStats[k]=Number(intel.skillStats[k]||0));
  intel.streakBest=Number(intel.streakBest||0);
  intel.totalFailures=Number(intel.totalFailures||0);
  intel.completedKeys=Array.isArray(intel.completedKeys)?intel.completedKeys:[];
  intel.daily=intel.daily&&typeof intel.daily==='object'?intel.daily:{date:'',done:false};
  intel.createdAt=intel.createdAt||new Date().toISOString();
}
function mergeCheckpointIntelligence(){
  ensureIntel();
  const checkpoints=Object.values(saved).filter(p=>p&&typeof p==='object');
  for(const p of checkpoints){
    intel.highestLevel=Math.max(intel.highestLevel,Number(p.level||0));
    if(p.skillStats&&typeof p.skillStats==='object'){
      for(const k of allSkills) intel.skillStats[k]=Math.max(Number(intel.skillStats[k]||0),Number(p.skillStats[k]||0));
    }
    if(p.bestStreak) intel.streakBest=Math.max(intel.streakBest,Number(p.bestStreak||0));
  }
  const current=MQ.state.skillStats||{};
  for(const k of allSkills) intel.skillStats[k]=Math.max(Number(intel.skillStats[k]||0),Number(current[k]||0));
  /* Migrate legacy game counters into practice indicators when older builds
     recorded completed levels but did not persist the per-skill counters. */
  const legacyMap={memory:['memory','attention'],detective:['logic','problemSolving'],reflex:['reaction','precision'],builder:['problemSolving','precision'],team:['teamwork','empathy','responsibility'],world:['geography','problemSolving'],money:['financialLiteracy','problemSolving']};
  for(const [g,v] of Object.entries(intel.games||{})){
    const count=typeof v==='number'?v:Number(v?.levels||0);
    if(count>0){
      for(const k of (legacyMap[g]||[])) intel.skillStats[k]=Math.max(Number(intel.skillStats[k]||0),count);
      if(typeof v==='number') intel.games[g]={levels:count,failures:0,lastPlayed:null};
    }
  }
  if(intel.completedLevels===0 && intel.totalLevels>0) intel.completedLevels=intel.totalLevels;
  syncIntelToState();
  persistIntel();
}
function syncIntelToState(){
  ensureIntel();
  MQ.state.skillStats=MQ.state.skillStats||{};
  for(const k of allSkills) MQ.state.skillStats[k]=Math.max(Number(MQ.state.skillStats[k]||0),Number(intel.skillStats[k]||0));
}
function persistIntel(){try{localStorage.setItem(INTEL_KEY,JSON.stringify(intel))}catch{}}
function dailyMission(){
  ensureIntel();
  const d=new Date().toISOString().slice(0,10);
  if(intel.daily.date!==d){
    const missions=[
      {type:'levels',title:'Complete 3 levels',desc:'Complete three levels with care.',target:3},
      {type:'streak',title:'Build a 3-level streak',desc:'Complete three levels without a failed attempt.',target:3},
      {type:'games',title:'Explore 2 game worlds',desc:'Complete levels in two different games today.',target:2},
      {type:'skill',title:'Practise a new skill',desc:'Complete a level that exercises a less-practised skill.',target:1}
    ];
    const m=missions[(new Date().getDate()+MQ.state.age)%missions.length];
    intel.daily={date:d,done:false,type:m.type,title:m.title,desc:m.desc,target:m.target,progress:0};
    persistIntel();
  }
  updateDailyMissionProgress();
  return intel.daily;
}
function updateDailyMissionProgress(){
  ensureIntel();
  const d=intel.daily;if(!d||!d.date)return;
  const today=d.date;
  const events=intel.history.filter(e=>String(e.date||'').slice(0,10)===today&&e.type==='level');
  if(d.type==='levels') d.progress=events.length;
  else if(d.type==='streak'){
    let run=0,max=0;
    for(const e of events){if(e.failedBefore)run=0;run++;max=Math.max(max,run)}
    d.progress=max;
  } else if(d.type==='games') d.progress=new Set(events.map(e=>e.game)).size;
  else if(d.type==='skill'){
    const practiced=events.some(e=>Array.isArray(e.skills)&&e.skills.some(k=>Number(intel.skillStats[k]||0)<=2));
    d.progress=practiced?1:0;
  }
  d.progress=Math.min(Number(d.target||1),Number(d.progress||0));
  d.done=d.progress>=Number(d.target||1);
  persistIntel();
}
function recordMilestone(level){
  ensureIntel();
  const n=Number(level||0);intel.highestLevel=Math.max(intel.highestLevel,n);intel.streakBest=Math.max(intel.streakBest,Number(MQ.state.bestStreak||0));
  if(!intel.milestones.some(m=>m.level===n)) intel.milestones.push({level:n,date:new Date().toISOString(),xp:MQ.state.xp,skills:{...(MQ.state.skillStats||intel.skillStats)}});
  intel.milestones=intel.milestones.slice(-12);persistIntel();
}
function recordLevel(level,game){
  ensureIntel();
  const g=game||MQ.state.game,n=Number(level||0),now=new Date().toISOString(),eventKey=`${g}:${n}`;
  if(intel.completedKeys.includes(eventKey)) return;
  intel.completedKeys.push(eventKey);intel.completedKeys=intel.completedKeys.slice(-300);
  const skillMap={memory:['memory','attention'],detective:['logic','problemSolving'],reflex:['reaction','precision'],builder:['problemSolving','precision'],team:['teamwork','empathy','responsibility'],world:['geography','problemSolving'],money:['financialLiteracy','problemSolving']};
  const delta={};
  for(const k of (skillMap[g]||[])){delta[k]=1;intel.skillStats[k]=Number(intel.skillStats[k]||0)+1;}
  intel.games[g]=intel.games[g]||{levels:0,failures:0,lastPlayed:null};
  if(typeof intel.games[g]==='number') intel.games[g]={levels:intel.games[g],failures:0,lastPlayed:null};
  intel.games[g].levels=Number(intel.games[g].levels||0)+1;intel.games[g].lastPlayed=now;
  intel.totalLevels=Number(intel.totalLevels||0)+1;intel.completedLevels=Math.max(Number(intel.completedLevels||0),intel.totalLevels);intel.highestLevel=Math.max(intel.highestLevel,n);intel.streakBest=Math.max(intel.streakBest,Number(MQ.state.bestStreak||0));
  intel.history.push({type:'level',date:now,game:g,level:n,xp:MQ.state.xp,skills:Object.keys(delta),failedBefore:false});
  intel.history=intel.history.slice(-200);
  updateDailyMissionProgress();persistIntel();syncIntelToState();
}
function recordFailure(game){
  ensureIntel();const g=game||MQ.state.game,now=new Date().toISOString();
  intel.totalFailures=Number(intel.totalFailures||0)+1;intel.games[g]=intel.games[g]||{levels:0,failures:0,lastPlayed:null};if(typeof intel.games[g]==='number')intel.games[g]={levels:intel.games[g],failures:0,lastPlayed:null};intel.games[g].failures=Number(intel.games[g].failures||0)+1;intel.games[g].lastPlayed=now;
  intel.history.push({type:'failure',date:now,game:g,level:Number(MQ.state.level||0)});intel.history=intel.history.slice(-200);persistIntel();
}
function openProfile(){ensureIntel();const s=MQ.state;ensureIntel();syncIntelToState();const stats=intel.skillStats||{};dailyMission();const account=s.account;const skillHtml=allSkills.map(k=>{const v=Number(stats[k]||0),pct=Math.min(100,v*5);return `<div class="mq-skill"><div class="mq-skill-top"><span>${skillLabels[k]}</span><b>${v}</b></div><small>${v? 'Practised through gameplay':'Not yet practised'}</small><div class="mq-bar"><span style="width:${pct}%"></span></div></div>`}).join('');const hist=(intel.milestones||[]).slice(-4).reverse().map(m=>`<div class="mq-history-card"><strong>Lv ${m.level}</strong><small>${new Date(m.date).toLocaleDateString()} • ${m.xp} XP</small></div>`).join('')||'<div class="mq-note">Your first milestone report will appear after Level 5.</div>';const overlay=document.getElementById('mq-profile-overlay');overlay.innerHTML=`<div class="mq-profile"><div class="mq-profile-head"><div><p class="eyebrow">MINDQUEST PLAYER INTELLIGENCE</p><h2>${account?account.displayName:'Guest Explorer'}</h2><p class="mq-note">${account?'Player account active on this device.':'Guest profile — account tracking begins at Level 10.'}</p></div><button class="mq-close" id="mq-profile-close">✕</button></div><div class="mq-profile-hero"><div><span class="mq-premium-chip">${s.premium?'PREMIUM ACTIVE':'CORE PATHWAY'}</span><h3>Keep building your mind.</h3><p>MindQuest tracks the skills you practise across games. These indicators describe gameplay practice; they are not IQ, clinical or academic assessments.</p></div><div class="mq-profile-stats"><div class="mq-profile-stat"><b>${s.xp}</b><span>XP</span></div><div class="mq-profile-stat"><b>${s.streak}</b><span>Current streak</span></div><div class="mq-profile-stat"><b>${intel.totalLevels||0}</b><span>Levels logged</span></div></div></div><div class="mq-section"><h3>Today's Mastery Mission</h3><div class="mq-mission"><div><strong>${intel.daily.title}</strong><div class="mq-note">${intel.daily.desc}</div></div><span>${intel.daily.done?'✓ Complete':'In progress'}</span></div></div><div class="mq-section"><h3>Skill Map</h3><div class="mq-skill-grid">${skillHtml}</div></div><div class="mq-section"><h3>Milestone History</h3><div class="mq-history">${hist}</div></div><div class="mq-section"><h3>What the indicators mean</h3><p class="mq-note">Memory and attention reflect recall and sustained focus practice. Logic and problem solving reflect pattern, reasoning and planning practice. Reaction and precision reflect timing and coordination practice. Teamwork, empathy and responsibility reflect constructive social decision practice. World knowledge and financial thinking reflect practical knowledge and quantity-based decision practice.</p></div></div>`;overlay.classList.add('open');document.getElementById('mq-profile-close').onclick=()=>overlay.classList.remove('open')}
function consoleInsight(){
  ensureIntel();syncIntelToState();
  const st=intel.skillStats||{}, entries=allSkills.map(k=>[k,Number(st[k]||0)]).sort((a,b)=>b[1]-a[1]);
  const practiced=entries.filter(x=>x[1]>0), focus=practiced[0], least=entries.filter(x=>x[1]===0)[0]||entries[entries.length-1];
  const mission=dailyMission(), games=Object.entries(intel.games||{}).filter(([,v])=>v&&typeof v==='object'&&Number(v.levels||0)>0);
  const today=intel.history.filter(e=>String(e.date||'').slice(0,10)===new Date().toISOString().slice(0,10));
  const active=document.querySelector('.screen.active');
  const premiumScreen=active?.id==='premium';
  return {
    focus:focus?skillLabels[focus[0]]:'Start exploring',focusPoints:focus?.[1]||0,
    next:least?skillLabels[least[0]]:'Explore a new skill',nextPoints:least?.[1]||0,
    levels:Number(intel.totalLevels||0),highest:Number(intel.highestLevel||0),failures:Number(intel.totalFailures||0),
    games:games.length,todayLevels:today.filter(e=>e.type==='level').length,todayFailures:today.filter(e=>e.type==='failure').length,
    mission,account:!!MQ.state.account,premium:premiumScreen,streak:Number(MQ.state.streak||0),bestStreak:Number(intel.streakBest||MQ.state.bestStreak||0)
  };
}
function renderIntelligenceConsole(){
  const host=document.getElementById('mq-intelligence-console');if(!host)return;const i=consoleInsight();
  const gameRows=Object.entries(intel.games||{}).filter(([,v])=>v&&typeof v==='object'&&Number(v.levels||0)>0).sort((a,b)=>Number(b[1].levels||0)-Number(a[1].levels||0)).slice(0,4).map(([g,v])=>`<div class="mq-console-game"><span>${gameName(g)}</span><b>${Number(v.levels||0)}</b></div>`).join('');
  const missionPct=Math.round((Number(i.mission.progress||0)/Math.max(1,Number(i.mission.target||1)))*100);
  host.innerHTML=`<div class="mq-console-head"><div><p class="eyebrow">PLAYER INTELLIGENCE</p><h3>${i.account?(safename(MQ.state.account.displayName)+"'s console"):'Your learning console'}</h3><p>Gameplay signals are used to organise practice and progression — not to label ability.</p></div><span class="mq-console-state">${i.premium?'PREMIUM':i.account?'PLAYER':'EXPLORE'}</span></div>
  <div class="mq-console-grid mq-console-grid-6"><div><b>${i.levels}</b><span>levels completed</span></div><div><b>${i.games}</b><span>game worlds explored</span></div><div><b>${i.focusPoints}</b><span>${safename(i.focus)} practice points</span></div><div><b>${i.streak}</b><span>current streak</span></div><div><b>${i.bestStreak}</b><span>best streak</span></div><div><b>${i.failures}</b><span>retries recorded</span></div></div>
  <div class="mq-console-insight-row"><div class="mq-console-insight"><small>CURRENT FOCUS</small><strong>${safename(i.focus)}</strong><span>${i.focusPoints} practice points recorded</span></div><div class="mq-console-insight"><small>NEXT PRACTICE</small><strong>${safename(i.next)}</strong><span>Try this skill to broaden your practice</span></div><div class="mq-console-insight"><small>PATHWAY</small><strong>Level ${i.highest||1} / 20</strong><span>${i.todayLevels} level${i.todayLevels===1?'':'s'} completed today</span></div></div>
  <div class="mq-console-bottom"><div><div class="mq-console-subhead"><strong>Today's Mastery Mission</strong><span>${i.mission.done?'✓ Complete':`${i.mission.progress||0}/${i.mission.target||1}`}</span></div><div class="mq-console-mission"><div><b>${safename(i.mission.title||'Build your practice')}</b><span>${safename(i.mission.desc||'Complete a focused challenge today.')}</span></div><div class="mq-mission-bar"><i style="width:${missionPct}%"></i></div></div></div><div class="mq-console-worlds"><div class="mq-console-subhead"><strong>Recent game worlds</strong><span>${i.games}/7</span></div>${gameRows||'<span class="mq-empty">Your game activity will appear here.</span>'}</div></div>
  <div class="mq-console-tip"><strong>Next suggestion</strong><span>${i.account?`Try a ${safename(i.next)} challenge next to broaden your practice.`:'Create a player profile when prompted to unlock persistent intelligence features.'}</span></div>`;
}
function safename(v){return String(v||'Player').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
window.addEventListener('mindquest:account-updated',()=>{syncPlayerIdentity();renderIntelligenceConsole();});
function syncExperienceMode(){
 const body=document.body;if(!body)return;
 const active=document.querySelector('.screen.active');
 const isPremium=!!(active&&active.id==='premium');
 const hasAccount=!!MQ.state.account;
 body.classList.toggle('mq-guest-mode',!hasAccount&&!isPremium);
 body.classList.toggle('mq-player-mode',hasAccount&&!isPremium);
 body.classList.toggle('mq-premium-mode',isPremium);
 let badge=document.getElementById('mq-mode-badge');
 const identity=document.getElementById('player-identity');
 if(identity&&!badge){badge=document.createElement('span');badge.id='mq-mode-badge';badge.className='mq-mode-badge';identity.parentNode.insertBefore(badge,identity);}
 if(badge){badge.innerHTML=isPremium?'<i></i>PREMIUM':hasAccount?'<i></i>PLAYER':'<i></i>EXPLORE';badge.title=isPremium?'MindQuest premium experience':hasAccount?'MindQuest player experience':'MindQuest guest experience';} const homeName=document.getElementById('account-home-name'),homeNote=document.getElementById('account-home-note'),homeBadge=document.getElementById('account-home-badge'); if(homeName)homeName.textContent=hasAccount?(MQ.state.account.displayName||'Player'):'Guest Explorer'; if(homeNote)homeNote.textContent=hasAccount?'Player account active on this device. Intelligence, history and personalised practice are enabled.':'Explore freely. Your player identity and long-term intelligence profile will activate when an account is created.'; if(homeBadge)homeBadge.textContent=isPremium?'PREMIUM':hasAccount?'PLAYER':'GUEST';
}
function syncPlayerIdentity(){const n=document.getElementById('player-identity-name');if(n)n.textContent=MQ.state.account?.displayName||'Guest';syncExperienceMode();}
function addProfileButton(){injectStyles();let box=document.querySelector('.header-actions');if(box&&!document.getElementById('mq-profile-open')){const b=document.createElement('button');b.id='mq-profile-open';b.className='header-action profile-action';b.type='button';b.title='Player Profile';b.setAttribute('aria-label','Open player profile');b.innerHTML='<span>📊</span><small>Profile</small>';b.onclick=openProfile;box.insertBefore(b,box.firstChild)}if(!document.getElementById('mq-profile-overlay')){const d=document.createElement('div');d.id='mq-profile-overlay';d.className='mq-profile-overlay';document.body.appendChild(d)}}
function readStoredAccount(){
  const keys=[ACCOUNT_KEY,'mindquest-account-v0','mindquest-player-account'];
  for(const k of keys){try{const a=JSON.parse(localStorage.getItem(k)||'null');if(a&&typeof a==='object'&&a.displayName){return a}}catch{}}
  try{
    const all=Object.values(saved).filter(p=>p&&typeof p==='object');
    for(const p of all){if(p.account&&p.account.displayName)return p.account}
  }catch{}
  return null;
}
function persistAccount(a){if(!a)return;try{localStorage.setItem(ACCOUNT_KEY,JSON.stringify(a));localStorage.setItem('mindquest-player-status','player');localStorage.setItem('mindquest-account-created','1')}catch{};MQ.state.account=a;syncPlayerIdentity();}
try{const age=Number(localStorage.getItem(AGE_KEY));if(Number.isInteger(age)&&age>=0&&age<MQ.ages.length)MQ.state.age=age;const a=readStoredAccount();if(a)persistAccount(a);}catch{}
mergeCheckpointIntelligence();
try{const trialUntil=Number(localStorage.getItem('mindquest-premium-trial-until')||0);if(trialUntil>Date.now()){MQ.state.premium=true;MQ.state.premiumTrialUntil=trialUntil;MQ.state.premiumPlan='7-day-preview';}}catch{}
function setView(view){try{localStorage.setItem(VIEW_KEY,view)}catch{};requestAnimationFrame(()=>requestAnimationFrame(()=>{try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch{window.scrollTo(0,0)}document.documentElement.scrollTop=0;document.body.scrollTop=0;const app=document.getElementById('app');if(app)app.scrollTop=0;}))}
function activeSavedCheckpoint(){
  try{
    const session=JSON.parse(localStorage.getItem(SESSION)||'null');
    if(session&&session.age!==undefined&&session.game){
      const p=saved[keyFor(Number(session.age),session.game)];
      if(p)return p;
    }
  }catch{}
  const entries=Object.values(saved).filter(p=>p&&p.level>=1&&p.level<=20);
  entries.sort((a,b)=>(b.level-a.level)||(b.xp-a.xp));
  return entries[0]||null;
}
function restoreSavedView(){
  let view='home';
  try{view=localStorage.getItem(VIEW_KEY)||'home'}catch{}
  if(view==='home')return;
  const p=activeSavedCheckpoint();
  if(!p)return;
  restore(p);
  if(view==='account'){MQ.showAccountGate();return;}
  if(view==='premium'){MQ.showPremiumVault();return;}
  if(view==='milestone'||p.milestonePending){MQ.showMilestone(p.milestoneLevel||p.level);return;}
  if(view==='game'){
    const meta={memory:['🧠','Memory Lab','COGNITIVE'],detective:['🔎','Detective','COGNITIVE'],reflex:['⚡','Reflex Arena','PSYCHOMOTOR'],builder:['🧩','Builder','COGNITIVE'],team:['🤝','Team Quest','BEHAVIOURAL'],world:['🌍','World Explorer','COGNITIVE'],money:['💰','Money Mission','COGNITIVE']}[p.game];
    if(!meta)return;
    document.getElementById('game-icon').textContent=meta[0];document.getElementById('game-name').textContent=meta[1];document.getElementById('game-skill').textContent=meta[2];
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById('game').classList.add('active');
    MQ.nextChallenge();
  }
}
ensureIntel();addProfileButton();syncPlayerIdentity();renderIntelligenceConsole();
const mqModeObserver=new MutationObserver(()=>syncExperienceMode());
const mqMain=document.querySelector('main');if(mqMain)mqModeObserver.observe(mqMain,{subtree:true,attributes:true,attributeFilter:['class']});

const originalNextChallenge=MQ.nextChallenge;
MQ.nextChallenge=function(){setView('game');return originalNextChallenge()};
const originalShowAccountGate=MQ.showAccountGate;
MQ.showAccountGate=function(){setView('account');return originalShowAccountGate()};
const originalShowPremiumVault=MQ.showPremiumVault;
MQ.showPremiumVault=function(){setView('premium');return originalShowPremiumVault()};
const originalShowMilestone=MQ.showMilestone;
MQ.showMilestone=function(level){setView('milestone');recordMilestone(level);return originalShowMilestone(level)};
const originalFailed=MQ.levelFailed;
MQ.levelFailed=function(){const g=MQ.state.game;recordFailure(g);return originalFailed();};

const originalComplete=MQ.levelComplete;
MQ.levelComplete=function(){
 const wasActive=!!MQ.state.active;
 /*
    Some game modules deliberately set active=false as soon as the final
    activity is solved, then call MQ.levelComplete() after a short transition.
    The original core guard rejected that legitimate completion and left the
    player stuck on Activity 4/4. Treat a direct level-complete call as a
    trusted transition, while keeping normal activity input disabled.
 */
 if(!wasActive)MQ.state.active=true;
 const before=MQ.state.level,game=MQ.state.game;
 originalComplete();
 if(before!==MQ.state.level||before===20){
   recordLevel(before,game);
   if(before%5===0)recordMilestone(before);
   renderIntelligenceConsole();
 }
};
setInterval(save,350);setInterval(()=>{syncPlayerIdentity();renderIntelligenceConsole();},1200);window.addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
function syncHomePathway(){const age=Number(MQ.state.age);document.querySelectorAll('.age-btn').forEach((b,i)=>b.classList.toggle('active',i===age));const label=document.getElementById('path-label');if(label&&MQ.ages[age])label.textContent='Ages '+MQ.ages[age].range;}
syncHomePathway();
const homeCard=document.querySelector('#home .card:last-of-type');
if(homeCard){const wrap=document.createElement('div');wrap.id='resume-progress-wrap';wrap.style.cssText='display:none;';homeCard.parentNode.insertBefore(wrap,homeCard.nextSibling);const render=()=>{syncHomePathway();const entries=Object.values(saved).filter(p=>p&&p.level>=1&&p.level<=20);if(!entries.length){wrap.style.display='none';return}entries.sort((a,b)=>(b.level-a.level)||(b.xp-a.xp));const p=entries[0];wrap.style.display='block';wrap.innerHTML=`<div class="mq-resume-card"><div><strong>Continue ${gameName(p.game)}</strong><div class="mq-resume-meta">Ages ${MQ.ages[p.age].range} • Level ${p.level}/20 • ${p.xp} XP${p.milestonePending?' • Checkpoint report ready':''}</div></div><button id="resume-last" class="primary-btn" type="button">Resume Game →</button></div>`;document.getElementById('resume-last').onclick=()=>{restore(p);if(p.milestonePending){MQ.showMilestone(p.milestoneLevel||p.level);return}if(p.level>=11&&!MQ.state.account){MQ.showAccountGate();return}const meta={memory:['🧠','Memory Lab','COGNITIVE'],detective:['🔎','Detective','COGNITIVE'],reflex:['⚡','Reflex Arena','PSYCHOMOTOR'],builder:['🧩','Builder','COGNITIVE'],team:['🤝','Team Quest','BEHAVIOURAL'],world:['🌍','World Explorer','COGNITIVE'],money:['💰','Money Mission','COGNITIVE']}[p.game];if(!meta)return;document.getElementById('game-icon').textContent=meta[0];document.getElementById('game-name').textContent=meta[1];document.getElementById('game-skill').textContent=meta[2];document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById('game').classList.add('active');try{localStorage.setItem(VIEW_KEY,'game')}catch{}localStorage.setItem(SESSION,JSON.stringify({age:p.age,game:p.game}));MQ.nextChallenge()};};setTimeout(render,120);setInterval(render,1000)}
document.getElementById('back-home')?.addEventListener('click',()=>saveAndExit(),true);
const saveButton=document.getElementById('save-game');if(saveButton){saveButton.addEventListener('click',e=>{e.preventDefault();saveAndExit()})}if(!document.getElementById('save-status')){const st=document.createElement('span');st.id='save-status';st.className='save-status';st.setAttribute('aria-live','polite');st.textContent='Progress saved';document.querySelector('.game-head-left')?.appendChild(st)}
setTimeout(restoreSavedView,60);
document.querySelectorAll('.age-btn').forEach((b,i)=>b.addEventListener('click',()=>{try{localStorage.setItem(AGE_KEY,String(i))}catch{}}));
})();
