(() => {
"use strict";

const ages = [
  {range:"3–5", name:"Little Explorers", factor:.75},
  {range:"6–8", name:"Skill Builders", factor:1},
  {range:"9–11", name:"Smart Challengers", factor:1.15},
  {range:"12–14", name:"Young Strategists", factor:1.3},
  {range:"15–18", name:"Future Leaders", factor:1.45}
];

const games = [
  {id:"memory", icon:"🧠", name:"Memory Lab", skill:"COGNITIVE", desc:"Remember objects and beat increasingly demanding memory challenges."},
  {id:"detective", icon:"🔎", name:"Detective", skill:"COGNITIVE", desc:"Solve patterns, sequences and logic challenges."},
  {id:"reflex", icon:"⚡", name:"Reflex Arena", skill:"PSYCHOMOTOR", desc:"React quickly as the target gets faster."},
  {id:"builder", icon:"🧩", name:"Builder", skill:"COGNITIVE", desc:"Plan and construct structures with limited spaces."},
  {id:"team", icon:"🤝", name:"Team Quest", skill:"BEHAVIOURAL", desc:"Navigate social situations and constructive choices."}
];

const state = {
  age:1, game:"memory", level:1, lives:3, streak:0, bestStreak:0,
  xp:0, score:0, earnedThisRun:0, active:false, timer:null,
  skills:{cognitive:0, behavioural:0, psychomotor:0}
};

const $ = id => document.getElementById(id);
const shuffle = arr => [...arr].sort(() => Math.random() - .5);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));

function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");}
function difficulty(){return (1 + (state.level-1)*.11) * ages[state.age].factor;}
function updateGlobal(){
  $("xp").textContent=state.xp;
  $("streak").textContent=state.streak;
  $("badges").textContent=Math.floor(state.xp/500);
  $("level").textContent=state.level;
  $("lives").textContent=state.lives;
  $("game-streak").textContent=state.streak;
  $("score").textContent=state.score;
  $("difficulty").textContent=difficulty().toFixed(1)+"×";
  $("progress").style.width=(state.level/20*100)+"%";
  $("progress-label").textContent=`Level ${state.level} of 20`;
}
function renderAges(){
  const box=$("age-options"); box.innerHTML="";
  ages.forEach((a,i)=>{
    const b=document.createElement("button"); b.className="age-btn"+(i===state.age?" active":"");
    b.type="button"; b.textContent=`${a.range}\n${a.name}`; b.style.whiteSpace="pre-line";
    b.addEventListener("click",()=>{state.age=i;renderAges();renderGames();});
    box.appendChild(b);
  });
  $("path-label").textContent="Ages "+ages[state.age].range;
}
function renderGames(){
  const box=$("game-list"); box.innerHTML="";
  games.forEach(g=>{
    const b=document.createElement("button"); b.type="button"; b.className="game-tile";
    b.innerHTML=`<div class="icon">${g.icon}</div><h3>${g.name}</h3><p>${g.desc}</p><span class="tag">${g.skill} • 20 PROGRESSIVE LEVELS</span>`;
    b.addEventListener("click",()=>startGame(g.id)); box.appendChild(b);
  });
}
function startGame(id){
  clearTimeout(state.timer); state.game=id; state.level=1; state.lives=3; state.streak=0; state.score=0; state.earnedThisRun=0; state.detectiveActivity=0; state.memoryActivity=0; state.memoryCorrect=0; state.memoryMistakes=0;
  const g=games.find(x=>x.id===id);
  $("game-icon").textContent=g.icon; $("game-name").textContent=g.name; $("game-skill").textContent=g.skill;
  show("game"); updateGlobal(); nextChallenge();
}
function addSkill(g){
  const key=g.skill==="COGNITIVE"?"cognitive":g.skill==="BEHAVIOURAL"?"behavioural":"psychomotor";
  state.skills[key]+=1;
}
function levelComplete(){
  if(!state.active)return; state.active=false;
  state.streak++; state.bestStreak=Math.max(state.bestStreak,state.streak);
  const gain=75+state.level*20+state.streak*10;
  state.xp+=gain; state.score+=gain; state.earnedThisRun+=gain; addSkill(games.find(x=>x.id===state.game));
  if(state.level<20){
    $("game-message").textContent=`✓ Level ${state.level} complete! Level ${state.level+1} is harder. Starting automatically…`;
    state.level++; updateGlobal();
    state.timer=setTimeout(()=>{ $("game-message").textContent=""; nextChallenge(); },900);
  } else finishGame();
}
function levelFailed(){
  if(!state.active)return; state.active=false; state.lives--; state.streak=0; updateGlobal();
  $("game-message").textContent=state.lives>0?"Level not completed. Try again.":"Lives used. Restarting this level…";
  state.timer=setTimeout(()=>{if(state.lives<=0)state.lives=3;$("game-message").textContent="";nextChallenge();},900);
}
function nextChallenge(){
  clearTimeout(state.timer); updateGlobal();
  if(state.game==="memory")(window.MQMemoryLab?window.MQMemoryLab.run:memory)(); else if(state.game==="detective")(window.MQDetective?window.MQDetective.run:detective)();
  else if(state.game==="reflex")reflex(); else if(state.game==="builder")builder(); else team();
}
function memory(){
  const icons=["🐶","🚲","🍎","⭐","🎈","🐟","🚀","🌳","⚽","🎸","🦁","🍕","🌈","🐼","🦋","🎯"];
  const factor=difficulty(), count=clamp(Math.round(3+state.level*.45*factor),3,12);
  const show=clamp(Math.round(2800-state.level*95/ages[state.age].factor),750,2800);
  const answer=shuffle(icons).slice(0,count);
  $("game-stage").innerHTML=`<div class="memory-wrap"><h3>Memorise ${count} objects</h3><p class="lead">You have ${(show/1000).toFixed(1)} seconds.</p><div class="memory-items">${answer.map(x=>`<div class="memory-item">${x}</div>`).join("")}</div></div>`;
  state.active=false;
  state.timer=setTimeout(()=>{
    const distract=shuffle(icons.filter(x=>!answer.includes(x))).slice(0,clamp(3+Math.floor(state.level/3),3,7));
    const choices=shuffle(answer.concat(distract)); let found=0;
    $("game-stage").innerHTML=`<div class="memory-wrap"><h3>Find all ${count} objects</h3><div id="choices" class="memory-items"></div></div>`;
    const box=$("choices"); state.active=true;
    choices.forEach(x=>{
      const b=document.createElement("button"); b.type="button"; b.className="choice"; b.textContent=x;
      b.addEventListener("click",()=>{if(!state.active||b.disabled)return;b.disabled=true;
        if(!answer.includes(x)){b.classList.add("bad");levelFailed();}
        else{b.classList.add("good");found++;if(found===answer.length)levelComplete();}
      });box.appendChild(b);
    });
  },show);
}
function detective(){ return showGameInstruction("detective"); }
function runDetective(){
  const max=9, n=clamp(3+Math.floor(state.level/6),3,6);
  const nums=shuffle(Array.from({length:max},(_,i)=>i+1)).slice(0,n);
  const missing=nums[Math.floor(Math.random()*nums.length)];
  const shown=nums.filter(x=>x!==missing);
  const distract=shuffle(Array.from({length:max},(_,i)=>i+1).filter(x=>!nums.includes(x))).slice(0,3);
  $("game-stage").innerHTML=`<div><h3>Which number is missing?</h3><div class="number-row">${shown.map(x=>`<span class="number">${x}</span>`).join("")}</div><div id="choices" class="number-row"></div></div>`;
  const box=$("choices"); state.active=true;
  shuffle([missing,...distract]).forEach(x=>{const b=document.createElement("button");b.type="button";b.className="number";b.textContent=x;b.addEventListener("click",()=>x===missing?levelComplete():levelFailed());box.appendChild(b);});
}
function reflex(){ return showGameInstruction("reflex"); }
function runReflex(){
  $("game-stage").innerHTML=`<div><h3>Wait for it…</h3><p class="lead">Tap the target as soon as it appears.</p><button id="target" class="target" type="button" disabled>?</button></div>`;
  const delay=clamp(Math.round(1450-(state.level*48)*ages[state.age].factor),260,1450);
  state.active=false;
  state.timer=setTimeout(()=>{const t=$("target");t.textContent="🎯";t.disabled=false;state.active=true;
    t.addEventListener("click",levelComplete,{once:true});
  },delay);
}
function builder(){ return showGameInstruction("builder"); }
function runBuilder(){
  const size=state.level<7?3:state.level<14?4:5;
  const needed=clamp(Math.round(2+state.level*.55*difficulty()),2,size*size-1);
  $("game-stage").innerHTML=`<div><h3>Build with ${needed} blocks</h3><p class="lead">Choose spaces to complete the structure.</p><div id="builder" class="builder-grid"></div></div>`;
  const box=$("builder");let placed=0;state.active=true;
  for(let i=0;i<size*size;i++){const b=document.createElement("button");b.type="button";b.className="builder-block";
    b.addEventListener("click",()=>{if(!state.active||b.classList.contains("filled"))return;b.classList.add("filled");b.textContent="";placed++;if(placed>=needed)levelComplete();});
    box.appendChild(b);
  }
}
function team(){ return showGameInstruction("team"); }
function runTeam(){
  const questions=[
    ["A teammate makes a mistake. What is the most constructive response?",["Help them fix it","Blame them","Ignore the problem"]],
    ["Your team disagrees about a solution. What should happen next?",["Listen and discuss","Shout louder","Quit"]],
    ["A teammate is struggling with the challenge.",["Offer useful help","Laugh at them","Hide the instructions"]],
    ["You finish your task early while the team is behind.",["Ask how you can help","Leave without telling anyone","Distract the team"]]
  ];
  const q=questions[(state.level-1)%questions.length];
  $("game-stage").innerHTML=`<div class="scenario"><h3>${q[0]}</h3><div id="scenario-options"></div></div>`;
  const box=$("scenario-options");state.active=true;
  q[1].forEach((x,i)=>{const b=document.createElement("button");b.type="button";b.className="scenario-option";b.textContent=x;
    b.addEventListener("click",()=>i===0?levelComplete():levelFailed());box.appendChild(b);});
}

function showGameInstruction(id){
  const info={
    detective:{icon:"🔎",skill:"COGNITIVE",name:"Detective",purpose:"Solve the challenge carefully and choose the answer that fits the clues.",how:"Read the sequence, inspect the choices, then select the answer. A wrong answer fails the level.",timing:"No countdown • Think carefully",pass:"Choose the correct answer"},
    reflex:{icon:"⚡",skill:"PSYCHOMOTOR",name:"Reflex Arena",purpose:"Test your reaction speed and timing.",how:"Wait until the target appears. Tap it as quickly as you can. Do not tap early.",timing:"Reaction window • Gets faster",pass:"Hit the target after it appears"},
    builder:{icon:"🧩",skill:"COGNITIVE",name:"Builder",purpose:"Plan a structure and place the required number of blocks.",how:"Choose spaces on the grid. Fill the required number of blocks to complete the build.",timing:"No countdown • Plan first",pass:"Place every required block"},
    team:{icon:"🤝",skill:"BEHAVIOURAL",name:"Team Quest",purpose:"Make constructive decisions in realistic team situations.",how:"Read the situation and choose the response that supports cooperation, communication and responsibility.",timing:"No countdown • Read carefully",pass:"Choose the constructive response"}
  }[id];
  if(!info)return;
  state.active=false; clearTimeout(state.timer);
  $("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">${info.icon}</div><span class="ui-skill">${info.skill}</span><h2>${info.name}</h2><p class="ui-purpose">${info.purpose}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${info.how}</p></div><div class="ui-meta"><span>✓ ${info.pass}</span><span>⏱ ${info.timing}</span></div><button id="ui-start" class="primary-btn ui-start">Start Activity →</button></div>`;
  $("ui-start").addEventListener("click",()=>{
    if(id==="detective")runDetective();
    else if(id==="reflex")runReflex();
    else if(id==="builder")runBuilder();
    else runTeam();
  });
}
function finishGame(){
  state.active=false; updateGlobal(); show("result");
  $("result-text").textContent=`You mastered all 20 levels of ${games.find(x=>x.id===state.game).name}. The challenges became progressively harder as you advanced.`;
  $("result-xp").textContent=state.earnedThisRun; $("result-levels").textContent=20; $("result-streak").textContent=state.bestStreak;
}
function goHome(){
  clearTimeout(state.timer);
  state.active=false;
  state.level=1;
  state.lives=3;
  state.streak=0;
  state.score=0;
  state.earnedThisRun=0;
  show("home");
  updateGlobal();
}
function leaveGame(){
  if(state.active || document.querySelector("#game.screen.active")){
    const ok=window.confirm("Leave this game and return to the Game Arcade? Your current level attempt will end.");
    if(!ok)return;
  }
  goHome();
}
$("back-home").addEventListener("click",leaveGame);
$("result-home").addEventListener("click",goHome);
$("play-again").addEventListener("click",()=>startGame(state.game));
window.MQ={state,$,ages,updateGlobal,levelComplete,levelFailed,nextChallenge}; renderAges(); renderGames(); updateGlobal();
})();