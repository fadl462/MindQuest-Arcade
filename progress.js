(() => {
  'use strict';
  const MQ=window.MQ;if(!MQ)return;
  const STORE='mindquest-progress-v2',SESSION='mindquest-session-v2',AGE_KEY='mindquest-age-pathway',VIEW_KEY='mindquest-current-view-v1';
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}})();
  let suppressSave=false,arcadeExitSave=false,lastView='home';
  const keyFor=(age,game)=>`${age}:${game}`;
  const gameName=id=>({memory:'Memory Lab',detective:'Detective',reflex:'Reflex Arena',builder:'Builder',team:'Team Quest',world:'World Explorer',money:'Money Mission'})[id]||id;
  const checkpoint=()=>{const s=MQ.state;return {age:s.age,game:s.game,level:s.level,lives:s.lives,streak:s.streak,bestStreak:s.bestStreak,xp:s.xp,score:s.score,earnedThisRun:s.earnedThisRun,detectiveActivity:s.detectiveActivity||0,memoryActivity:s.memoryActivity||0,reflexActivity:s.reflexActivity||0,builderActivity:s.builderActivity||0,teamActivity:s.teamActivity||0,worldActivity:s.worldActivity||0,moneyActivity:s.moneyActivity||0,skills:s.skills}};
  const save=()=>{if(suppressSave||!MQ.state.game||arcadeExitSave)return;saved[keyFor(MQ.state.age,MQ.state.game)]=checkpoint();try{localStorage.setItem(STORE,JSON.stringify(saved));localStorage.setItem(SESSION,JSON.stringify({age:MQ.state.age,game:MQ.state.game}));localStorage.setItem(AGE_KEY,String(MQ.state.age))}catch{}};
  const saveAndExit=()=>{if(!MQ.state.game)return;saved[keyFor(MQ.state.age,MQ.state.game)]=checkpoint();try{localStorage.setItem(STORE,JSON.stringify(saved));localStorage.setItem(SESSION,JSON.stringify({age:MQ.state.age,game:MQ.state.game}));localStorage.setItem(AGE_KEY,String(MQ.state.age));localStorage.setItem(VIEW_KEY,'home')}catch{}arcadeExitSave=true;lastView='home';setTimeout(()=>arcadeExitSave=false,1500)};
  const restore=p=>{Object.assign(MQ.state,p);MQ.state.active=false;MQ.state.timer=null;MQ.state.skills=p.skills||MQ.state.skills;MQ.updateGlobal()};
  const showGame=()=>{document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById('game').classList.add('active')};
  try{const age=Number(localStorage.getItem(AGE_KEY));if(Number.isInteger(age)&&age>=0&&age<MQ.ages.length){MQ.state.age=age;document.querySelectorAll('.age-btn').forEach((b,i)=>b.classList.toggle('active',i===age));document.getElementById('path-label').textContent='Ages '+MQ.ages[age].range}}catch{}
  try{const stored=localStorage.getItem(VIEW_KEY);lastView=stored==='game'?'game':'home';localStorage.setItem(VIEW_KEY,'home')}catch{}
  setInterval(save,400);window.addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
  const homeCard=document.querySelector('#home .card:last-of-type');
  if(homeCard){const wrap=document.createElement('div');wrap.id='resume-progress-wrap';wrap.style.cssText='margin-top:14px;display:none;';homeCard.appendChild(wrap);
    const render=()=>{const entries=Object.values(saved).filter(p=>p&&p.level>=1&&p.level<=20);if(!entries.length){wrap.style.display='none';return}entries.sort((a,b)=>(b.level-a.level)||(b.xp-a.xp));const p=entries[0];wrap.style.display='block';wrap.innerHTML=`<div class="resume-card" style="border:1px solid var(--line);border-radius:16px;padding:14px;background:#f8f9fc;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><strong>Continue ${gameName(p.game)}</strong><div style="color:var(--muted);font-size:13px;margin-top:3px">Ages ${MQ.ages[p.age].range} • Level ${p.level}/20 • ${p.xp} XP</div></div><button id="resume-last" class="primary-btn" type="button">Resume Game →</button></div>`;
      document.getElementById('resume-last').onclick=()=>{suppressSave=true;arcadeExitSave=false;restore(p);suppressSave=false;const meta={memory:['🧠','Memory Lab','COGNITIVE'],detective:['🔎','Detective','COGNITIVE'],reflex:['⚡','Reflex Arena','PSYCHOMOTOR'],builder:['🧩','Builder','COGNITIVE'],team:['🤝','Team Quest','BEHAVIOURAL'],world:['🌍','World Explorer','COGNITIVE'],money:['💰','Money Mission','COGNITIVE']}[p.game];if(!meta)return;document.getElementById('game-icon').textContent=meta[0];document.getElementById('game-name').textContent=meta[1];document.getElementById('game-skill').textContent=meta[2];showGame();try{localStorage.setItem(VIEW_KEY,'game')}catch{}lastView='game';localStorage.setItem(SESSION,JSON.stringify({age:p.age,game:p.game}));MQ.nextChallenge()};
    };setTimeout(render,120);setInterval(render,1000)}
  document.getElementById('back-home')?.addEventListener('click',()=>saveAndExit(),true);
  document.querySelectorAll('.age-btn').forEach((b,i)=>b.addEventListener('click',()=>{try{localStorage.setItem(AGE_KEY,String(i))}catch{}}));
})();
