(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const TYPES=["choice","order","match","plan"];
const BANK=[
["A teammate makes a mistake. What could you do?",["Help them fix it","Laugh at them","Tell everyone it was their fault"]],
["Two teammates want the same role. What is a fair next step?",["Talk and find a fair solution","Grab the role first","Refuse to work"]],
["You notice someone is left out of the activity. What can you do?",["Invite them to join","Ignore them","Tell them they cannot play"]],
["You disagree with a teammate's idea. What should you say?",["Explain your idea and listen","Shout until they agree","Stop listening"]],
["Your team is running out of time. What helps?",["Share tasks and communicate","Hide the problem","Blame the slowest person"]],
["A teammate is nervous about speaking. What is supportive?",["Encourage them and give them time","Make fun of them","Speak over them"]],
["You finish your part early. What is responsible?",["Check whether the team needs help","Leave without telling anyone","Distract others"]],
["Someone gives you useful feedback. What should you do?",["Listen and consider it","Get angry","Ignore every suggestion"]],
["Your team wins. What shows good teamwork?",["Thank the whole team","Take all the credit","Tease the other team"]],
["Your team loses. What is constructive?",["Discuss what to improve next time","Blame one person","Quit immediately"]],
["You find two ways to solve a problem. What should the team do?",["Compare both and choose together","Hide one idea","Choose without listening"]],
["A teammate asks for clarification. What should you do?",["Explain calmly","Tell them to figure it out","Ignore them"]],
["A team rule seems confusing. What is best?",["Ask and clarify the rule","Make up a secret rule","Ignore all rules"]],
["Someone accidentally damages a shared item. What is responsible?",["Tell the team and help solve it","Hide it","Blame someone else"]],
["A friend wants to change the plan halfway through. What helps?",["Discuss the reason and agree on a plan","Refuse to listen","Change everything without telling anyone"]],
["Your teammate is slower than you. What shows patience?",["Give them time and encouragement","Rush them","Leave them behind"]]
];
const INFO={
 choice:["Team Decision","Choose the response that helps the team work well.","Look for cooperation, communication, fairness and responsibility."],
 order:["Team Order","Put the teamwork steps in the best order.","Understand the problem, plan together, act, then check the result."],
 match:["Team Match","Match the situation with the helpful response.","Choose the response that best fits the situation."],
 plan:["Team Plan","Choose the actions that create a strong team plan.","Select useful actions and avoid actions that create conflict."]
};
function activity(){return Number.isInteger(S.teamActivity)?S.teamActivity:0}
function ageBand(){return ["3–5","6–8","9–11","12–14","15–18"][S.age]}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">TEAM QUEST • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;const last=activity()===3;$("game-message").textContent=last?"✓ Four team challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next team challenge…`;if(last){S.teamActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}else{S.teamActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;MQ.levelFailed()}
function instruction(){
 const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);
 $("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">🤝</div><span class="ui-skill">BEHAVIOURAL</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>🤝 Think about others</span><span>✓ Constructive choices</span></div><button id="team-start" class="primary-btn ui-start">Start Activity →</button></div>`;
 $("team-start").onclick=()=>runActivity(type);
}
function runActivity(type){if(type==="choice")choice();else if(type==="order")order();else if(type==="match")match();else plan()}
function choice(){
 const q=BANK[(S.level*3+activity()*5+S.age*7)%BANK.length];
 $("game-stage").innerHTML=`<div class="team-stage">${head("choice")}<div class="team-question">${q[0]}</div><div id="team-options" class="team-options"></div></div>`;
 const box=$("team-options");S.active=true;shuffle(q[1].map((x,i)=>({x,i}))).forEach(o=>{const b=document.createElement("button");b.className="team-option";b.textContent=o.x;b.onclick=()=>o.i===0?complete():fail();box.appendChild(b)});
}
function order(){
 const sets=[["Notice the problem","Talk with the team","Agree on a plan","Act together"],["Listen to each person","Compare ideas","Choose a fair solution","Check the result"],["Set the goal","Share tasks","Complete the tasks","Review the work"]];
 const seq=sets[(S.level+activity()+S.age)%sets.length],sh=shuffle(seq.map((x,i)=>({x,i})));
 $("game-stage").innerHTML=`<div class="team-stage">${head("order")}<p class="team-question">Put the teamwork steps in the right order.</p><div id="team-order" class="team-order"></div></div>`;
 const box=$("team-order");let n=0;S.active=true;sh.forEach(o=>{const b=document.createElement("button");b.className="team-option";b.textContent=o.x;b.onclick=()=>{if(!S.active||b.disabled)return;if(o.i===n){b.disabled=true;b.classList.add("good");n++;if(n===seq.length)complete()}else{b.classList.add("bad");fail()}};box.appendChild(b)});
}
function match(){
 const sets=[["A teammate is confused","Explain the instructions"],["The team disagrees","Listen and discuss"],["Someone is left out","Invite them to join"],["The deadline is close","Share the remaining tasks"],["A mistake happens","Fix it together"],["A teammate is nervous","Encourage them"]];
 const pair=sets[(S.level*2+activity()+S.age)%sets.length],options=shuffle([pair[1],"Ignore the problem","Make the situation worse","Do it alone"]);
 $("game-stage").innerHTML=`<div class="team-stage">${head("match")}<div class="team-match-situation">${pair[0]}</div><p class="team-question">Which response matches?</p><div id="team-options" class="team-options"></div></div>`;
 const box=$("team-options");S.active=true;options.forEach(x=>{const b=document.createElement("button");b.className="team-option";b.textContent=x;b.onclick=()=>x===pair[1]?complete():fail();box.appendChild(b)});
}
function plan(){
 const useful=["Listen to everyone's ideas","Share clear roles","Check progress together","Ask for help when needed"],distract=["Hide information","Blame a teammate","Ignore the plan","Interrupt everyone"];
 const need=S.level<7?2:S.level<14?3:4,correct=shuffle(useful).slice(0,need),options=shuffle(correct.concat(shuffle(distract).slice(0,4)));
 $("game-stage").innerHTML=`<div class="team-stage">${head("plan",`Choose ${need} actions that belong in a strong team plan.`)}<div id="team-plan" class="team-plan"></div><button id="team-submit" class="primary-btn ui-start">Check Plan ✓</button></div>`;
 const box=$("team-plan"),selected=new Set();S.active=true;
 options.forEach(x=>{const b=document.createElement("button");b.className="team-option";b.textContent=x;b.onclick=()=>{if(!S.active)return;if(selected.has(x)){selected.delete(x);b.classList.remove("selected")}else{selected.add(x);b.classList.add("selected")}};box.appendChild(b)});
 $("team-submit").onclick=()=>{if(selected.size!==need)return fail();if([...selected].every(x=>correct.includes(x)))complete();else fail()};
}
window.MQTeamQuest={run:instruction};
})();