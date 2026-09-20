(() => {
"use strict";
const ages=[{range:"3–5",name:"Little Explorers",factor:.75},{range:"6–8",name:"Skill Builders",factor:1},{range:"9–11",name:"Smart Challengers",factor:1.15},{range:"12–14",name:"Young Strategists",factor:1.3},{range:"15–18",name:"Future Leaders",factor:1.45}];
const games=[
{id:"memory",icon:"🧠",name:"Memory Lab",skill:"COGNITIVE",desc:"Remember objects and beat increasingly demanding memory challenges."},
{id:"detective",icon:"🔎",name:"Detective",skill:"COGNITIVE",desc:"Solve patterns, sequences and logic challenges."},
{id:"reflex",icon:"⚡",name:"Reflex Arena",skill:"PSYCHOMOTOR",desc:"React quickly as the target gets faster."},
{id:"builder",icon:"🧩",name:"Builder",skill:"COGNITIVE",desc:"Plan and construct structures with limited spaces."},
{id:"team",icon:"🤝",name:"Team Quest",skill:"BEHAVIOURAL",desc:"Navigate social situations and constructive choices."},
{id:"world",icon:"🌍",name:"World Explorer",skill:"COGNITIVE",desc:"Explore countries, landmarks, maps and journeys."},
{id:"money",icon:"💰",name:"Money Mission",skill:"COGNITIVE",desc:"Count, compare, budget and make change with Ghana cedis."}
];
const state={age:0,game:"memory",level:1,lives:3,streak:0,bestStreak:0,xp:0,score:0,earnedThisRun:0,active:false,timer:null,skills:{cognitive:0,behavioural:0,psychomotor:0},skillStats:{memory:0,attention:0,logic:0,problemSolving:0,reaction:0,precision:0,teamwork:0,empathy:0,responsibility:0,financialLiteracy:0,geography:0},milestonePending:false,account:null,premium:false,premiumPlan:"",premiumTrialUntil:0,retryCount:0};
const $=id=>document.getElementById(id); const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function scrollToTop(){
 try{window.scrollTo({top:0,left:0,behavior:'auto'});}catch{window.scrollTo(0,0)}
 const app=document.getElementById('app');
 if(app)app.scrollTop=0;
 document.documentElement.scrollTop=0;
 document.body.scrollTop=0;
}
function show(id){
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
 $(id)?.classList.add('active');
 requestAnimationFrame(()=>requestAnimationFrame(scrollToTop));
}
function difficulty(){const base=(1+(state.level-1)*.11)*ages[state.age].factor;const retryRelief=Math.min(.18,(state.retryCount||0)*.06);const stretch=state.streak>=3?.05:0;return Math.max(.65,base-retryRelief+stretch);}
function updateGlobal(){
 $("xp").textContent=state.xp;$("streak").textContent=state.streak;$("badges").textContent=Number.isFinite(state.badges)?state.badges:Math.floor(state.xp/500);$("level").textContent=state.level;$("lives").textContent=state.lives;$("game-streak").textContent=state.streak;$("score").textContent=state.score;$("difficulty").textContent=`${difficulty()<1.1?"Warm-up":difficulty()<1.5?"Challenge":difficulty()<2?"Advanced":"Mastery"}`;$("progress").style.width=(state.level/20*100)+"%";$("progress-label").textContent=`Level ${state.level} of 20`;
}
function renderAges(){const box=$("age-options");box.innerHTML="";ages.forEach((a,i)=>{const b=document.createElement('button');b.className='age-btn'+(i===state.age?' active':'');b.type='button';b.textContent=`${a.range}\n${a.name}`;b.style.whiteSpace='pre-line';b.onclick=()=>{state.age=i;renderAges();renderGames();};box.appendChild(b)});$("path-label").textContent='Ages '+ages[state.age].range;}
function renderGames(){const box=$("game-list");box.innerHTML="";games.forEach(g=>{const b=document.createElement('button');b.type='button';b.className='game-tile';b.dataset.game=g.id;b.innerHTML=`<div class="icon">${g.icon}</div><h3>${g.name}</h3><p>${g.desc}</p><span class="tag">${g.skill} • 20 PROGRESSIVE LEVELS</span>`;b.onclick=()=>startGame(g.id);box.appendChild(b)});}
function startGame(id){
 clearTimeout(state.timer);state.game=id;state.level=1;state.lives=3;state.streak=0;state.bestStreak=0;state.retryCount=0;state.score=0;state.earnedThisRun=0;state.active=false;
 ['detectiveActivity','memoryActivity','reflexActivity','builderActivity','teamActivity','worldActivity','moneyActivity'].forEach(k=>state[k]=0);
 const g=games.find(x=>x.id===id);$("game-icon").textContent=g.icon;$("game-name").textContent=g.name;$("game-skill").textContent=g.skill;show('game');updateGlobal();nextChallenge();}
function addSkill(g){const key=g.skill==='COGNITIVE'?'cognitive':g.skill==='BEHAVIOURAL'?'behavioural':'psychomotor';state.skills[key]=(state.skills[key]||0)+1;const map={memory:['memory','attention'],detective:['logic','problemSolving'],reflex:['reaction','precision'],builder:['problemSolving','precision'],team:['teamwork','empathy','responsibility'],world:['geography','problemSolving'],money:['financialLiteracy','problemSolving']};(map[g.id]||[]).forEach(k=>state.skillStats[k]=(state.skillStats[k]||0)+1);}
function levelComplete(){if(!state.active)return;state.active=false;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);state.retryCount=0;const gain=75+state.level*20+state.streak*10;state.xp+=gain;state.score+=gain;state.earnedThisRun+=gain;addSkill(games.find(x=>x.id===state.game));const completed=state.level;updateGlobal();if(completed%5===0){state.milestonePending=true;state.milestoneLevel=completed;state.timer=setTimeout(()=>showMilestone(completed),500);return;}state.level++;updateGlobal();$("game-message").textContent=`✓ Level ${completed} complete! Level ${state.level} is harder. Starting automatically…`;state.timer=setTimeout(()=>{$("game-message").textContent='';nextChallenge()},900);}
function levelFailed(){if(!state.active)return;state.active=false;state.lives--;state.streak=0;state.retryCount=(state.retryCount||0)+1;updateGlobal();const retryHint={memory:"Slow down and look for the pattern before choosing.",detective:"Look for the rule, sequence or clue that makes one answer fit.",reflex:"Wait for the target signal, then respond quickly and deliberately.",builder:"Plan the spaces first; check the required shape or count before placing blocks.",team:"Consider how each choice affects the people and the shared goal.",world:"Use every location clue before deciding.",money:"Check the amounts carefully and compare the numbers, not just the item count."};$("game-message").textContent=state.lives>0?`Not quite. ${retryHint[state.game]||"Take another look at the clues."}`:"Let’s reset this level and try a fresh challenge…";state.timer=setTimeout(()=>{if(state.lives<=0)state.lives=3;$("game-message").textContent='';nextChallenge()},900);}
function nextChallenge(){clearTimeout(state.timer);updateGlobal();if(state.game==='memory')(window.MQMemoryLab?window.MQMemoryLab.run:memory)();else if(state.game==='detective')(window.MQDetective?window.MQDetective.run:detective)();else if(state.game==='reflex')(window.MQReflexArena?window.MQReflexArena.run:reflex)();else if(state.game==='builder')(window.MQBuilder?window.MQBuilder.run:builder)();else if(state.game==='team')(window.MQTeamQuest?window.MQTeamQuest.run:team)();else if(state.game==='world')(window.MQWorldExplorer?window.MQWorldExplorer.run:world)();else if(state.game==='money')(window.MQMoneyMission?window.MQMoneyMission.run:money)();}
function memory(){window.MQMemoryLab?.run?.()}
function detective(){window.MQDetective?.run?.()}
function reflex(){window.MQReflexArena?.run?.()}
function builder(){window.MQBuilder?.run?.()}
function team(){window.MQTeamQuest?.run?.()}
function world(){window.MQWorldExplorer?.run?.()}
function money(){window.MQMoneyMission?.run?.()}
function showMilestone(completed){clearTimeout(state.timer);state.active=false;state.milestonePending=true;state.milestoneLevel=completed;const next=completed<20?completed+1:null;const report=buildReport(completed);$("milestone-title").textContent=completed===20?'20-Level Mastery Complete!':`Level ${completed} Complete!`;$("milestone-subtitle").textContent=completed===20?'You have completed the core MindQuest pathway.':'Great work — here is what your play is building so far.';$("milestone-body").innerHTML=report;const btn=$("milestone-continue");btn.textContent=completed===10?'Continue to Account Setup →':completed===20?'Explore Premium Options →':`Continue to Level ${next} →`;btn.onclick=()=>{if(completed===10)showAccountGate();else if(completed===20)showPremiumVault();else continueAfterMilestone()};show('milestone');}
function buildReport(level){const s=state.skillStats||{};const items=[['🧠 Memory & attention',s.memory+s.attention,'Remembering information, staying focused and handling more than one piece of information at a time.'],['🔎 Logic & problem solving',s.logic+s.problemSolving,'Looking for patterns, testing ideas and working through a challenge before choosing an answer.'],['⚡ Reaction & precision',s.reaction+s.precision,'Responding at the right moment and coordinating what you see with what you do.'],['🤝 Social & emotional skills',s.teamwork+s.empathy+s.responsibility,'Practising cooperation, perspective-taking, patience and responsible choices.'],['🌍 Knowledge & financial thinking',s.geography+s.financialLiteracy,'Using real-world knowledge, quantities and practical information to make sensible decisions.']];return `<div class="performance-grid">${items.map(x=>`<article class="performance-card"><div class="performance-top"><strong>${x[0]}</strong><span>${x[1]} practice points</span></div><p>${x[2]}</p><div class="performance-bar"><span style="width:${clamp(x[1]*6,4,100)}%"></span></div></article>`).join('')}</div><div class="performance-note"><strong>What this means</strong><p>These practice points are indicators of the skills exercised through gameplay. They are not a clinical, academic or intelligence assessment.</p></div>`;}
function continueAfterMilestone(){state.milestonePending=false;state.milestoneLevel=0;state.level++;updateGlobal();show('game');state.timer=setTimeout(nextChallenge,250);}
function showAccountGate(){clearTimeout(state.timer);state.active=false;const hasAccount=!!state.account;$("account-gate").querySelector('h1').textContent=hasAccount?'Your MindQuest account is ready':'Create your MindQuest account';$("account-gate").querySelector('.lead').textContent=hasAccount?'Your player profile is already active on this device. Confirm below to unlock Level 11 and continue your journey.':'You have reached the point where MindQuest begins keeping a longer-term player profile. Create your account before continuing to Level 11.';$("account-submit").textContent=hasAccount?'Continue to Level 11 →':'Create Account & Continue →';if(hasAccount){$("account-name").value=state.account.displayName||'';$("account-username").value=state.account.username||'';$("account-name").disabled=true;$("account-username").disabled=true;$("account-consent").checked=true;$("account-consent").disabled=true;if($("adult-confirm")){$("adult-confirm").checked=true;$("adult-confirm").disabled=true}if($("adult-check-answer")){$("adult-check-answer").value='43';$("adult-check-answer").disabled=true}$("account-error").textContent='';}else{$("account-name").disabled=false;$("account-username").disabled=false;$("account-consent").disabled=false;if($("adult-confirm")){$("adult-confirm").disabled=false;$("adult-confirm").checked=false}if($("adult-check-answer")){$("adult-check-answer").disabled=false;$("adult-check-answer").value=''}}show('account-gate');}
function continueAfterAccount(){state.account=loadAccount()||state.account;if(!state.account){showAccountGate();return;}state.milestonePending=false;state.milestoneLevel=0;if(state.level<11)state.level=11;updateGlobal();show('game');state.timer=setTimeout(nextChallenge,250);}
function loadAccount(){try{return JSON.parse(localStorage.getItem('mindquest-account-v1')||'null')}catch{return null}}
function saveAccount(account){state.account=account;try{const raw=JSON.stringify(account);localStorage.setItem('mindquest-account-v1',raw);localStorage.setItem('mindquest-player-status','player');localStorage.setItem('mindquest-account-created','1')}catch{};try{window.dispatchEvent(new CustomEvent('mindquest:account-updated',{detail:account}))}catch{};if(typeof updateGlobal==='function')updateGlobal();}
function createAccount(){const name=$("account-name").value.trim(),username=$("account-username").value.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'');const consent=$("account-consent").checked,adultConfirm=$("adult-confirm")?.checked,adultAnswer=$("adult-check-answer")?.value.trim();if(name.length<2||username.length<3||!consent||!adultConfirm||adultAnswer!=='43'){$("account-error").textContent='Please complete the profile fields, account notice, and adult/guardian check before continuing.';return}saveAccount({displayName:name,username,agePath:ages[state.age].range,createdAt:new Date().toISOString(),guardianConfirmedAt:new Date().toISOString()});$("account-error").textContent='';const status=$("account-status");if(status)status.textContent='Account created';continueAfterAccount();}
function premiumTrialActive(){state.premium=false;state.premiumTrialUntil=0;try{localStorage.removeItem('mindquest-premium-trial-until')}catch{};return false;}
function showPremiumVault(){state.milestonePending=false;premiumTrialActive();show('premium');renderPremium();}
function startPremiumTrial(){const notice=$("premium-checkout-note");if(notice)notice.innerHTML='<strong>Premium roadmap preview:</strong> these cards describe planned features. No premium feature modules or payment processing are active in this GitHub build.';renderPremium();}
function choosePremiumPlan(plan){
 state.premiumPlan=plan;
 try{localStorage.setItem('mindquest-premium-plan',plan)}catch{}
 const notice=$("premium-checkout-note");
 if(notice)notice.innerHTML='<strong>Plan selected:</strong> '+plan+'. The payment gateway is not connected in this GitHub build yet. Your selection is saved locally so the production checkout can be connected without changing the pricing model.';
}
function renderPremium(){
 premiumTrialActive();
 const active=!!state.premium;
 const trialDays=active&&state.premiumTrialUntil?Math.max(1,Math.ceil((state.premiumTrialUntil-Date.now())/86400000)):0;
 const status=$("premium-status");
 if(status)status.textContent=active?'PREMIUM STATUS':'PREMIUM ROADMAP PREVIEW';
 const banner=$("premium-banner-copy");
 if(banner)banner.innerHTML=active
  ? '<strong>Premium status is stored locally for this prototype.</strong><p>Production entitlements and premium modules are not connected yet.</p>'
  : '<strong>Explore the planned Infinity Layer.</strong><p>The core 20-level pathway remains free. Premium cards are roadmap previews until the underlying features and secure checkout are implemented.</p>';
 const cta=$("premium-trial-btn");
 if(cta){cta.textContent='Preview Premium Roadmap →';cta.disabled=false;cta.onclick=startPremiumTrial;}
 const grid=$("premium-grid");
 if(grid)grid.innerHTML=[['🧠','Adaptive Intelligence Engine','Difficulty adapts to performance patterns across the full skill profile.'],['📊','Deep Performance Lab','Longitudinal skill trends, mastery maps and milestone history.'],['🎯','Daily Mastery Missions','Personalised daily challenges with streaks and rotating objectives.'],['🧭','Mastery Worlds','Advanced game worlds with multi-stage missions and branching challenges.'],['👨‍👩‍👧','Parent / Guardian Insights','A separate progress view focused on practice patterns, not labels or diagnoses.'],['🏆','Elite Badges & Certificates','Milestone certificates, mastery badges and achievement collections.'],['⚙️','Premium Customisation','Optional premium themes, profile presentation and future family controls.']].map(x=>`<article class="premium-card locked"><div class="premium-icon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><span>ROADMAP • NOT ACTIVE IN THIS BUILD</span></article>`).join('');
 const note=$("premium-checkout-note");
 if(note&&!note.innerHTML)note.textContent='Choose a plan to save your preference. Payment processing will be connected separately.';
}
function goHome(){clearTimeout(state.timer);state.active=false;state.level=1;state.lives=3;state.streak=0;state.score=0;state.earnedThisRun=0;show('home');updateGlobal();}
function leaveGame(){if(typeof window.MQProgressSaveAndExit==='function'){window.MQProgressSaveAndExit();return}if(state.active||document.querySelector('#game.screen.active')){const ok=window.confirm('Save your checkpoint and return to the Game Arcade? You can resume it later.');if(!ok)return}goHome()}
window.MQ={state,$,ages,updateGlobal,levelComplete,levelFailed,nextChallenge,showMilestone,showAccountGate,showPremiumVault,createAccount,startPremiumTrial,choosePremiumPlan,renderPremium,goHome,leaveGame};renderAges();renderGames();document.addEventListener("click",e=>{const b=e.target.closest("#account-submit");if(b){e.preventDefault();createAccount();}});
})();
