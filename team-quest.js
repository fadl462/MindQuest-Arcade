(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const TYPES=["choice","order","match","plan","empathy","responsibility","communication","negotiation","conflict"];
const AGE=['3–5','6–8','9–11','12–14','15–18'];
const BANK=[
 ["A friend drops their crayons. What could you do?",["Help pick them up","Laugh","Walk away"]],
 ["Two children want the same toy. What is fair?",["Take turns","Grab it","Hide it"]],
 ["Someone is alone during a game. What can you do?",["Invite them to join","Ignore them","Tell them to leave"]],
 ["A teammate has a different idea. What should you do?",["Listen to the idea","Shout","Refuse to listen"]],
 ["Your group has a small job to finish. What helps?",["Share the work","Let one person do everything","Argue"]],
 ["A teammate is nervous. What is kind?",["Encourage them","Make fun of them","Rush them"]],
 ["You finish your part early. What is responsible?",["Ask if anyone needs help","Distract everyone","Leave without telling the group"]],
 ["Someone gives you a helpful suggestion. What should you do?",["Listen and think about it","Get angry","Ignore it"]],
 ["Your team succeeds. What shows teamwork?",["Thank everyone","Take all the credit","Tease others"]],
 ["Your team makes a mistake. What is constructive?",["Fix it together","Blame one person","Hide it"]],
 ["There are two good ideas. What should the group do?",["Compare them together","Hide one","Choose without listening"]],
 ["A teammate does not understand the instructions. What helps?",["Explain calmly","Tell them to guess","Ignore them"]],
 ["A rule is unclear. What should the team do?",["Ask for clarification","Invent a secret rule","Ignore the rule"]],
 ["A shared item is damaged by accident. What is responsible?",["Tell the group and help fix it","Hide it","Blame someone else"]],
 ["The plan needs to change. What is best?",["Discuss the change together","Change everything secretly","Refuse to talk"]],
 ["A teammate is working slowly. What shows patience?",["Give them time","Rush them","Leave them behind"]],
 ["Someone is talking. What shows respect?",["Listen until they finish","Interrupt","Talk louder"]],
 ["A teammate asks for help. What is cooperative?",["Help if you can","Ignore them","Tell others not to help"]],
 ["You disagree about a game rule. What should you do?",["Talk and check the rule","Start shouting","Make up a new rule"]],
 ["A new person joins the group. What helps them feel included?",["Welcome them","Ignore them","Tell them they cannot join"]]
];
const ORDERS=[
 ["Notice the problem","Listen to the team","Choose a plan","Act together"],
 ["Set the goal","Share the tasks","Do the tasks","Check the result"],
 ["Hear each idea","Compare the ideas","Choose together","Try the plan"],
 ["Invite everyone","Explain the activity","Play together","Thank the team"],
 ["Find what is wrong","Ask for ideas","Try a solution","Review what happened"],
 ["Choose a goal","Decide who does what","Work on the task","Check the work"],
 ["Listen carefully","Ask a question","Agree on the next step","Do the next step"],
 ["Spot the missing item","Tell the team","Search together","Put it back"],
 ["Learn the rules","Share roles","Start the game","Resolve problems fairly"],
 ["Collect the materials","Plan the build","Build together","Clean up"],
 ["Identify the deadline","Divide the work","Complete the parts","Review before sharing"],
 ["Hear the concern","Explain your view","Find common ground","Agree on an action"],
 ["Welcome the new member","Explain the goal","Give them a role","Work together"],
 ["Notice someone needs help","Ask what they need","Help appropriately","Check that they are okay"],
 ["Define the problem","List possible solutions","Choose one","Test it"],
 ["Receive feedback","Ask for an example","Make an adjustment","Try again"],
 ["Decide the destination","Choose the route","Travel together","Check the plan"],
 ["Set a shared rule","Explain why it matters","Use the rule","Review whether it works"],
 ["Share the materials","Take turns","Finish the activity","Return the materials"],
 ["Recognize the conflict","Stay calm","Talk through the issue","Agree on a fair solution"]
];
const MATCH=[
 ["A teammate is confused","Explain the instructions"],["The team disagrees","Listen and discuss"],["Someone is left out","Invite them to join"],["The deadline is close","Share the remaining tasks"],["A mistake happens","Fix it together"],["A teammate is nervous","Encourage them"],["Someone is speaking","Listen without interrupting"],["A rule is unclear","Ask for clarification"],["A new member arrives","Welcome them"],["A teammate asks for help","Offer useful help"],["Two people need one item","Take turns"],["A plan is not working","Discuss an adjustment"],["A teammate has feedback","Listen and consider it"],["The group wins","Celebrate together"],["The group loses","Learn and try again"],["Someone has a different idea","Ask them to explain it"],["The group is rushed","Prioritize the task"],["A shared item is broken","Report it and help repair it"],["A disagreement grows","Stay calm and talk"],["A teammate finishes early","Offer help to the group"]
];
const PLANS=[
 ["Listen to everyone's ideas","Share clear roles"],
 ["Take turns","Check that everyone understands"],
 ["Agree on the goal","Divide the work","Check progress"],
 ["Invite quieter members","Compare ideas","Choose together"],
 ["Set a deadline","Share tasks","Review the result"],
 ["Ask for help when needed","Communicate changes","Finish your part"],
 ["Listen first","Explain your view respectfully","Find common ground"],
 ["Welcome new members","Give clear instructions","Make space for questions"],
 ["Check the rules","Assign fair roles","Resolve problems calmly"],
 ["Collect materials","Plan the steps","Work together","Clean up"],
 ["Define the problem","Suggest options","Choose a solution","Test it"],
 ["Share progress","Offer support","Ask for clarification","Review together"],
 ["Set a shared goal","Use each person's strengths","Check quality","Celebrate contributions"],
 ["Notice who needs help","Ask before helping","Give appropriate support"],
 ["Compare two ideas","Discuss trade-offs","Choose transparently","Review the outcome"],
 ["Receive feedback","Ask questions","Make a change","Try again"],
 ["Make a simple plan","Tell everyone the plan","Do the work","Check completion"],
 ["Stay calm","Let each person speak","Agree on a fair next step"],
 ["Share resources","Take turns","Encourage effort","Return resources"],
 ["Review what happened","Identify what worked","Choose one improvement","Try it next time"]
];
const INFO={
 choice:["Team Decision","Choose the response that helps the group work well.","Look for cooperation, communication, fairness and responsibility."],
 order:["Team Order","Put the teamwork steps in the most useful order.","Think about what must happen first, what follows, and what should be checked at the end."],
 match:["Team Match","Match the situation with the helpful response.","Choose the response that best fits the situation."],
 plan:["Team Plan","Select actions that create a strong team plan.","Choose useful actions and avoid actions that create conflict or confusion."],
 responsibility:["Responsibility Check","Choose the action that shows ownership and reliability.","Think about honesty, following through and taking responsibility for shared work."],
 empathy:["Perspective Check","Choose the response that best recognises another person's perspective.","Think about how the other person may feel and what response would help."],
 communication:["Communication Check","Choose a clear and respectful message for the situation.","Be specific, calm and constructive."],
 negotiation:["Negotiation Check","Choose a fair way to reach agreement when people want different things.","Listen, compare options and agree on a workable next step."],
 conflict:["Conflict Resolution","Choose a calm response that helps a disagreement move forward.","Focus on the problem, listen to both sides and look for a fair next step."]
};
function activity(){return Number.isInteger(S.teamActivity)?S.teamActivity:0}
function levelIndex(){return (S.level-1)%20}
function ageBand(){return AGE[S.age]||AGE[0]}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">TEAM QUEST • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four team challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next team challenge…`;if(last){S.teamActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}else{S.teamActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function ageText(text){
 if(S.age<=1)return text.replace(/deadline/g,"time").replace(/trade-offs/g,"differences").replace(/clarification/g,"help");
 return text;
}
function instruction(){const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);$("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">🤝</div><span class="ui-skill">BEHAVIOURAL</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>🤝 Think about others</span><span>✓ Four activities per level</span></div><button id="team-start" class="primary-btn ui-start">Start Activity →</button></div>`;$("team-start").onclick=()=>runActivity(type)}

function conflict(){
 const qs=[
 ['Two teammates disagree about whose idea to use. What should happen?','Let both explain their ideas, then compare them against the goal.'],
 ['A teammate feels left out of a decision. What helps?','Invite them to share their view before the group decides.'],
 ['A disagreement is becoming heated. What is a constructive next step?','Pause, listen and return to the shared goal.'],
 ['Two people misunderstand each other. What should the team do?','Ask questions and clarify what each person meant.'],
 ['The group cannot agree immediately. What is fair?','Use the agreed team rules to decide the next step.']
 ]; const q=qs[(S.level+activity()+S.age)%qs.length];choice(head('conflict'),`<div class="team-question"><b>${q[0]}</b></div>`,[q[1],'Interrupt and decide for everyone.','Blame one person.','Stop listening.'],q[1]);
}
function runActivity(type){if(type==="choice")choice();else if(type==="order")order();else if(type==="match")match();else if(type==="empathy")empathy();else if(type==="responsibility")responsibility();else if(type==="communication")communication();else if(type==="negotiation")negotiation();else if(type==="conflict")conflict();else plan()}

function negotiation(){
 const qs=[
  ['Two teammates want different roles. What is fair?','Discuss the strengths of each person and agree on roles together.'],
  ['Two people want the same equipment. What helps?','Agree on a turn-taking plan so both can use it.'],
  ['The team has two good ideas but time for one. What should happen?','Compare both ideas against the goal and agree on one.'],
  ['A teammate cannot meet the original deadline. What is constructive?','Discuss a realistic new deadline and adjust the plan together.'],
  ['Two teammates disagree about the rules. What should they do?','Check the agreed rules and talk through the disagreement calmly.']
 ];
 const q=qs[(S.level+activity()+S.age)%qs.length];
 choice(head('negotiation'),`<div class="team-question"><b>${q[0]}</b></div>`,[q[1],'Let the loudest person decide.','Ignore the disagreement.','Blame the other teammate.'],q[1]);
}
function communication(){const qs=[['A teammate is late. What is the clearest message?','I am waiting. Are you able to arrive by 3 PM?'],['A task is unclear. What should you say?','Could you explain which part I should complete first?'],['A teammate made a mistake. What is constructive?','Let us check what happened and fix it together.'],['You need help. What is clear?','I have finished step one. Could you help me with step two?'],['Plans changed. What should you communicate?','The plan changed. Here is the new time and what we need to do.']];const q=qs[(S.level+activity()+S.age)%qs.length];const distract=['You always do this wrong.','Whatever, just fix it.','Nobody told me anything.'];choice(head('communication'),`<div class="team-question"><b>${q[0]}</b></div>`,[q[1],...distract],q[1])}

function responsibility(){
 const BANK=[
  ['You promised to bring the team materials, but forgot. What is responsible?', ['Tell the team honestly and help find another solution','Hide the mistake','Blame someone else']],
  ['You notice the shared workspace is messy after the activity. What should you do?', ['Help tidy it before leaving','Leave it for someone else','Pretend you did not notice']],
  ['You cannot finish your assigned part on time. What should you do?', ['Tell the team early and discuss the next step','Say nothing until the deadline','Delete the unfinished work']],
  ['A teammate trusts you with an important task. What shows responsibility?', ['Complete it carefully and report back','Ignore it','Give it away without telling them']],
  ['You make an error in the team report. What is best?', ['Point it out and help correct it','Hide it','Change someone else’s work to cover it']],
  ['The group rule applies to everyone. What should you do?', ['Follow it even when it is inconvenient','Break it secretly','Ask others to break it too']]
 ];
 const q=BANK[(S.level+activity()+S.age)%BANK.length];
 $('game-stage').innerHTML=`<div class=\"team-stage\">${head('responsibility')}<div class=\"team-question\">${ageText(q[0])}</div><div id=\"team-options\" class=\"team-options\"></div></div>`;
 const box=$('team-options');S.active=true;shuffle(q[1].map((x,i)=>({x,i}))).forEach(o=>{const b=document.createElement('button');b.className='team-option';b.textContent=ageText(o.x);b.onclick=()=>o.i===0?complete():fail();box.appendChild(b)});
}
function choice(){
 const q=BANK[levelIndex()];$("game-stage").innerHTML=`<div class="team-stage">${head("choice")}<div class="team-question">${ageText(q[0])}</div><div id="team-options" class="team-options"></div></div>`;
 const box=$("team-options");S.active=true;shuffle(q[1].map((x,i)=>({x,i}))).forEach(o=>{const b=document.createElement("button");b.className="team-option";b.textContent=ageText(o.x);b.onclick=()=>o.i===0?complete():fail();box.appendChild(b)});
}
function order(){
 const seq=ORDERS[(levelIndex()+activity()*3)%ORDERS.length],sh=shuffle(seq.map((x,i)=>({x,i})));$("game-stage").innerHTML=`<div class="team-stage">${head("order")}<p class="team-question">Put the teamwork steps in the right order.</p><div id="team-order" class="team-order"></div></div>`;
 const box=$("team-order");let n=0;S.active=true;sh.forEach(o=>{const b=document.createElement("button");b.className="team-option";b.textContent=ageText(o.x);b.onclick=()=>{if(!S.active||b.disabled)return;if(o.i===n){b.disabled=true;b.classList.add("good");n++;if(n===seq.length)complete()}else{b.classList.add("bad");fail()}};box.appendChild(b)});
}
function match(){
 const pair=MATCH[(levelIndex()+activity()*5)%MATCH.length],wrong=["Ignore the situation","Make it worse","Do it alone"];const options=shuffle([pair[1],...wrong]);$("game-stage").innerHTML=`<div class="team-stage">${head("match")}<div class="team-match-situation">${ageText(pair[0])}</div><p class="team-question">Which response matches?</p><div id="team-options" class="team-options"></div></div>`;
 const box=$("team-options");S.active=true;options.forEach(x=>{const b=document.createElement("button");b.className="team-option";b.textContent=ageText(x);b.onclick=()=>x===pair[1]?complete():fail();box.appendChild(b)});
}
function empathy(){
 const cases=[
  ["A teammate makes a mistake and looks embarrassed.",["Encourage them and help fix it","Laugh at them","Tell everyone about the mistake"]],
  ["Someone is quiet during a group discussion.",["Invite them to share if they want","Ignore them","Speak for them without asking"]],
  ["A teammate says they are confused.",["Ask what part needs explaining","Tell them to figure it out alone","Move on without checking"]],
  ["A new player is struggling to join the activity.",["Explain the rules and include them","Tell them to watch only","Give them the hardest task immediately"]],
  ["Two teammates disagree about an idea.",["Listen to both views and look for common ground","Choose the louder person","Stop the discussion"]]
 ];
 const q=cases[(S.level+activity()+S.age)%cases.length];
 $('game-stage').innerHTML=`<div class="team-stage">${head('empathy')}<div class="team-match-situation">${ageText(q[0])}</div><p class="team-question">Which response shows understanding?</p><div id="team-options" class="team-options"></div></div>`;
 const box=$('team-options');S.active=true;shuffle(q[1].map((x,i)=>({x,i}))).forEach(o=>{const b=document.createElement('button');b.className='team-option';b.textContent=ageText(o.x);b.onclick=()=>o.i===0?complete():fail();box.appendChild(b)});
}

function responsibility(){
 const cases=[["You promised to bring materials but forgot. What is responsible?",["Tell the team honestly and help find a solution","Pretend you brought them","Blame someone else"]],["You notice a mistake in your team's work. What should you do?",["Tell the team and help correct it","Hide it","Wait for someone else to notice"]],["You finish your assigned task. What should you do next?",["Check whether the team needs help","Leave immediately","Delete someone else's work"]],["A group rule applies to everyone. What should you do?",["Follow it consistently","Follow it only when watched","Ask others to follow it while you ignore it"]],["You cannot finish your part on time. What is responsible?",["Tell the team early and discuss a solution","Say nothing","Wait until the deadline passes"]]];
 const q=cases[(S.level+activity()+S.age)%cases.length];$("game-stage").innerHTML=`<div class="team-stage">${head("responsibility")}<div class="team-match-situation">${ageText(q[0])}</div><p class="team-question">Which response shows responsibility?</p><div id="team-options" class="team-options"></div></div>`;
 const box=$("team-options");S.active=true;shuffle(q[1].map((x,i)=>({x,i}))).forEach(o=>{const b=document.createElement("button");b.className="team-option";b.textContent=ageText(o.x);b.onclick=()=>o.i===0?complete():fail();box.appendChild(b)});
}
function plan(){
 const base=PLANS[(levelIndex()+activity()*2)%PLANS.length],need=S.level<6?Math.min(2,base.length):S.level<13?Math.min(3,base.length):Math.min(4,base.length);const correct=shuffle(base).slice(0,need),distractors=["Hide information","Blame a teammate","Ignore the plan","Interrupt everyone","Keep the goal secret","Change roles without telling anyone"];const options=shuffle(correct.concat(shuffle(distractors).slice(0,4)));
 $("game-stage").innerHTML=`<div class="team-stage">${head("plan",`Choose ${need} actions that belong in a strong team plan.`)}<div id="team-plan" class="team-plan"></div><button id="team-submit" class="primary-btn ui-start">Check Plan ✓</button></div>`;
 const box=$("team-plan"),selected=new Set();S.active=true;options.forEach(x=>{const b=document.createElement("button");b.className="team-option";b.textContent=ageText(x);b.onclick=()=>{if(!S.active)return;if(selected.has(x)){selected.delete(x);b.classList.remove("selected")}else{selected.add(x);b.classList.add("selected")}};box.appendChild(b)});
 $("team-submit").onclick=()=>{if(selected.size!==need)return fail();if([...selected].every(x=>correct.includes(x)))complete();else fail()};
}
window.MQTeamQuest={run:instruction};
})();
