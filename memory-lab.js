(() => {
"use strict";

const MQ = window.MQ;
if (!MQ) return;
const S = MQ.state;
const $ = MQ.$;
const shuffle = arr => [...arr].sort(() => Math.random() - .5);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));

const ICONS = ["🐶","🚲","🍎","⭐","🎈","🐟","🚀","🌳","⚽","🎸","🦁","🍕","🌈","🐼","🦋","🎯","🌻","🍉","🐢","🚌","🧸","🥕","🎁","🐝","🏀","🌙","🍓","🐱","🎵","🪁"];
const WORDS = ["river","market","garden","school","bridge","forest","island","window","village","planet","basket","lantern","camera","library","rainbow","journey","harbour","mountain","festival","ocean"];
const COLORS = ["red","blue","green","yellow","orange","purple","pink","teal"];
const SHAPES = ["●","■","▲","◆","★","⬟","⬢","✦"];

const PLANS = [
 ["visual","sequence","location","feature"],["visual","pairs","location","sequence"],
 ["sequence","visual","location","pairs"],["pairs","location","sequence","feature"],
 ["visual","sequence","working","location"],["location","pairs","working","sequence"],
 ["feature","visual","location","working"],["sequence","working","pairs","location"],
 ["location","feature","sequence","working"],["pairs","working","location","feature"],
 ["working","sequence","feature","location"],["feature","pairs","working","sequence"],
 ["location","working","feature","pairs"],["sequence","feature","location","working"],
 ["working","pairs","sequence","feature"],["feature","location","working","sequence"],
 ["working","feature","pairs","location"],["sequence","working","feature","pairs"],
 ["feature","working","sequence","location"]
];

const TYPE_INFO = {
 visual:["Visual Recall","Study the objects, then find every object you saw.","VISUAL MEMORY"],
 sequence:["Sequence Recall","Watch the order carefully, then rebuild it exactly.","SEQUENCING"],
 location:["Location Memory","Remember where each object was placed on the board.","SPATIAL MEMORY"],
 pairs:["Pair Memory","Remember which cards belong together.","ASSOCIATION"],
 feature:["Feature Memory","Remember two details at once: shape and colour.","DETAIL MEMORY"],
 working:["Working Memory","Hold information in mind while it changes.","WORKING MEMORY"]
};

function ageConfig(){
  return [
    {show:6200,response:22000,count:3,grid:3},
    {show:5000,response:18000,count:4,grid:3},
    {show:4100,response:14500,count:5,grid:4},
    {show:3500,response:12000,count:6,grid:4},
    {show:3100,response:10500,count:6,grid:5}
  ][S.age];
}
function spec(){
  const a=ageConfig(), p=(S.level-1)/19;
  const count=clamp(a.count+Math.floor(S.level/5),a.count,a.count+5);
  const show=Math.round(a.show-(a.show*.28*p));
  const response=Math.round(a.response-(a.response*.18*p));
  return {count,show,response};
}
function header(type, subtitleOverride){
  const info=TYPE_INFO[type];
  return '<div class="memory-lab-head"><div><span class="memory-kind">'+info[2]+'</span><h3>'+info[0]+'</h3><p class="memory-sub">'+(subtitleOverride||info[1])+'</p></div><div class="activity-chip">Activity '+(S.memoryActivity+1)+'/4</div></div>';
}
function begin(type, draw){
  S.active=false;
  S.memoryRoundToken=(S.memoryRoundToken||0)+1;
  const token=S.memoryRoundToken;
  draw(spec(),token);
}
function deadline(ms){
  S.timer=setTimeout(()=>{if(S.active)fail();},ms);
}
function fail(){
  if (!S.active) return;
  S.memoryMistakes=(S.memoryMistakes||0)+1;
  MQ.levelFailed();
}
function completeActivity(){
  if (!S.active) return;
  S.active=false;
  clearTimeout(S.timer);
  S.memoryCorrect=(S.memoryCorrect||0)+1;
  const last=S.memoryActivity===3;
  $("game-message").textContent=last ? "✓ Four memory activities complete!": "✓ Activity "+(S.memoryActivity+1)+" complete. Loading the next activity…";
  if(last){
    S.timer=setTimeout(()=>{S.memoryActivity=0;MQ.levelComplete();},650);
  }else{
    S.memoryActivity++;
    S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge();},650);
  }
}

function visual(){
  begin("visual",(sp,token)=>{
    const answer=shuffle(ICONS).slice(0,sp.count);
    const distract=shuffle(ICONS.filter(x=>!answer.includes(x))).slice(0,clamp(3+Math.floor(S.level/4),3,8));
    $("game-stage").innerHTML='<div class="memory-wrap">'+header("visual")+
      '<div class="memory-timer">Study for <b>'+(sp.show/1000).toFixed(1)+' seconds</b></div>'+
      '<div class="memory-items memory-study">'+answer.map(x=>'<div class="memory-item">'+x+'</div>').join("")+'</div>'+
      '<div class="memory-tip">Take in the whole set. The next screen will test your recall.</div></div>';
    S.timer=setTimeout(()=>{
      if(token!==S.memoryRoundToken)return;
      $("game-stage").innerHTML='<div class="memory-wrap">'+header("visual","Select every object you remember. One wrong choice ends this level.")+
        '<div class="memory-timer">Response window: <b>'+Math.round(sp.response/1000)+' seconds</b></div><div id="choices" class="memory-items"></div></div>';
      const box=$("choices");let found=0;S.active=true;
      shuffle(answer.concat(distract)).forEach(x=>{
        const b=document.createElement("button");b.type="button";b.className="choice";b.textContent=x;
        b.addEventListener("click",()=>{if(!S.active||b.disabled)return;b.disabled=true;
          if(!answer.includes(x)){b.classList.add("bad");fail();return;}
          b.classList.add("good");found++;if(found===answer.length)completeActivity();
        });box.appendChild(b);
      });deadline(sp.response);
    },sp.show);
  });
}

function sequence(){
  begin("sequence",(sp,token)=>{
    const len=clamp(sp.count,3,10), seq=shuffle(ICONS).slice(0,len);
    $("game-stage").innerHTML='<div class="memory-wrap">'+header("sequence")+
      '<div class="memory-timer">Watch the sequence for <b>'+(sp.show/1000).toFixed(1)+' seconds</b></div>'+
      '<div class="sequence-display">'+seq.map(x=>'<span class="sequence-token">'+x+'</span>').join("")+'</div></div>';
    S.timer=setTimeout(()=>{
      if(token!==S.memoryRoundToken)return;
      $("game-stage").innerHTML='<div class="memory-wrap">'+header("sequence","Tap the objects in the exact order you saw them.")+
        '<div class="memory-timer">Response window: <b>'+Math.round(sp.response/1000)+' seconds</b></div>'+
        '<div id="sequence-choices" class="memory-items"></div><div id="sequence-picked" class="picked-sequence"></div></div>';
      const box=$("sequence-choices"),picked=$("sequence-picked");let next=0;S.active=true;
      shuffle(seq).forEach(x=>{
        const b=document.createElement("button");b.type="button";b.className="choice";b.textContent=x;
        b.addEventListener("click",()=>{if(!S.active||b.disabled)return;
          if(x!==seq[next]){b.classList.add("bad");fail();return;}
          b.disabled=true;b.classList.add("good");picked.textContent+=(next?" ":"")+x;next++;
          if(next===seq.length)completeActivity();
        });box.appendChild(b);
      });deadline(sp.response);
    },sp.show);
  });
}

function location(){
  begin("location",(sp,token)=>{
    const size=S.level<8?3:S.level<15?4:5, slots=size*size;
    const count=clamp(Math.min(sp.count,Math.floor(slots*.55)),3,Math.min(10,slots-1));
    const positions=shuffle(Array.from({length:slots},(_,i)=>i)).slice(0,count);
    const icons=shuffle(ICONS).slice(0,count);
    const answer=positions.map((slot,i)=>({slot,icon:icons[i]}));
    $("game-stage").innerHTML='<div class="memory-wrap">'+header("location")+
      '<div class="memory-timer">Remember the objects and their locations for <b>'+(sp.show/1000).toFixed(1)+' seconds</b></div>'+
      '<div class="memory-board" style="--grid:'+size+'">'+Array.from({length:slots},(_,i)=>{
        const a=answer.find(x=>x.slot===i);return '<div class="memory-cell">'+(a?a.icon:"")+'</div>';
      }).join("")+'</div></div>';
    S.timer=setTimeout(()=>{
      if(token!==S.memoryRoundToken)return;
      $("game-stage").innerHTML='<div class="memory-wrap">'+header("location","Choose an object, then choose the place where you saw it.")+
        '<div class="location-recall"><div id="location-icons" class="location-icons"></div><div id="location-grid" class="memory-board" style="--grid:'+size+'"></div></div></div>';
      const ib=$("location-icons"),gb=$("location-grid");let chosen=null,placed=0;S.active=true;
      shuffle(icons).forEach(icon=>{
        const b=document.createElement("button");b.type="button";b.className="location-icon";b.textContent=icon;
        b.addEventListener("click",()=>{if(!S.active)return;document.querySelectorAll(".location-icon").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");chosen=icon;});
        ib.appendChild(b);
      });
      for(let i=0;i<slots;i++){
        const b=document.createElement("button");b.type="button";b.className="memory-cell recall-cell";
        b.addEventListener("click",()=>{if(!S.active||!chosen||b.disabled)return;
          const target=answer.find(x=>x.slot===i);
          if(!target||target.icon!==chosen){b.classList.add("bad");fail();return;}
          b.textContent=chosen;b.classList.add("placed");b.disabled=true;placed++;
          const source=[...document.querySelectorAll(".location-icon")].find(x=>x.textContent===chosen);
          if(source){source.disabled=true;source.classList.add("used");}
          chosen=null;if(placed===answer.length)completeActivity();
        });gb.appendChild(b);
      }
      deadline(sp.response*1.25);
    },sp.show);
  });
}

function pairs(){
  begin("pairs",(sp,token)=>{
    const pairCount=clamp(Math.floor(sp.count/2)+2,3,7),chosen=shuffle(ICONS).slice(0,pairCount);
    $("game-stage").innerHTML='<div class="memory-wrap">'+header("pairs")+
      '<div class="memory-timer">Study the matching pairs for <b>'+(sp.show/1000).toFixed(1)+' seconds</b></div>'+
      '<div class="memory-items">'+shuffle(chosen.flatMap(x=>[x,x])).map(x=>'<div class="memory-item">'+x+'</div>').join("")+'</div></div>';
    S.timer=setTimeout(()=>{
      if(token!==S.memoryRoundToken)return;
      $("game-stage").innerHTML='<div class="memory-wrap">'+header("pairs","Turn over two cards at a time and match every pair.")+
        '<div class="memory-timer">Response window: <b>'+Math.round(sp.response/1000)+' seconds</b></div><div id="pair-grid" class="pair-grid"></div></div>';
      const pb=$("pair-grid");let first=null,matched=0,busy=false;S.active=true;
      shuffle(chosen.flatMap((icon,id)=>[{id,icon},{id,icon}])).forEach(card=>{
        const b=document.createElement("button");b.type="button";b.className="pair-card";b.innerHTML="<span>?</span>";
        b.addEventListener("click",()=>{
          if(!S.active||busy||b.classList.contains("matched")||b===first?.b)return;
          b.classList.add("flipped");b.innerHTML="<span>"+card.icon+"</span>";
          if(!first){first={b,card};return;}
          busy=true;
          if(first.card.id===card.id){first.b.classList.add("matched");b.classList.add("matched");matched++;first=null;busy=false;if(matched===chosen.length)completeActivity();}
          else{const old=first.b;setTimeout(()=>{old.classList.remove("flipped");b.classList.remove("flipped");old.innerHTML="<span>?</span>";b.innerHTML="<span>?</span>";first=null;busy=false;},420);}
        });pb.appendChild(b);
      });deadline(sp.response*1.35);
    },sp.show);
  });
}

function feature(){
  begin("feature",(sp,token)=>{
    const count=clamp(sp.count,3,8),colors=shuffle(COLORS).slice(0,count),shapes=shuffle(SHAPES).slice(0,count);
    const items=colors.map((color,i)=>({color,shape:shapes[i]}));
    $("game-stage").innerHTML='<div class="memory-wrap">'+header("feature")+
      '<div class="memory-timer">Remember shape and colour shape and colour for <b>'+(sp.show/1000).toFixed(1)+' seconds</b>.</div>'+
      '<div class="feature-items">'+items.map(x=>'<div class="feature-item"><span>'+x.shape+'</span><small>'+x.color+'</small></div>').join("")+'</div></div>';
    S.timer=setTimeout(()=>{
      if(token!==S.memoryRoundToken)return;
      const distract=items.slice(0,Math.min(3,items.length)).map((x,i)=>({color:x.color,shape:shapes[(i+1)%items.length],correct:false}));
      const choices=shuffle(items.map(x=>({color:x.color,shape:x.shape,correct:true})).concat(distract));
      $("game-stage").innerHTML='<div class="memory-wrap">'+header("feature","Select every exact shape-and-colour combination you saw.")+
        '<div class="memory-timer">Response window: <b>'+Math.round(sp.response/1000)+' seconds</b></div><div id="feature-choices" class="feature-items"></div></div>';
      const box=$("feature-choices");let found=0;S.active=true;
      choices.forEach(x=>{const b=document.createElement("button");b.type="button";b.className="feature-choice";b.innerHTML="<span>"+x.shape+"</span><small>"+x.color+"</small>";
        b.addEventListener("click",()=>{if(!S.active||b.disabled)return;b.disabled=true;if(!x.correct){b.classList.add("bad");fail();return;}b.classList.add("good");found++;if(found===items.length)completeActivity();});box.appendChild(b);});
      deadline(sp.response);
    },sp.show);
  });
}

function working(){
  begin("working",(sp,token)=>{
    const len=clamp(sp.count,4,10),seq=shuffle(WORDS).slice(0,len);
    const removeCount=S.level>=15?2:1;
    $("game-stage").innerHTML='<div class="memory-wrap">'+header("working")+
      '<div class="memory-timer">Hold this sequence in mind for <b>'+(sp.show/1000).toFixed(1)+' seconds</b>.</div>'+
      '<div class="word-sequence">'+seq.map(x=>'<span>'+x+'</span>').join("")+'</div></div>';
    S.timer=setTimeout(()=>{
      if(token!==S.memoryRoundToken)return;
      const missing=seq.slice(0,removeCount),remaining=seq.slice(removeCount);
      const distract=shuffle(WORDS.filter(x=>!seq.includes(x))).slice(0,3);
      $("game-stage").innerHTML='<div class="memory-wrap">'+header("working","Which word or words were removed from the original sequence?")+
        '<div class="word-sequence faded">'+remaining.map(x=>'<span>'+x+'</span>').join("")+'</div><div id="working-options" class="word-options"></div></div>';
      const box=$("working-options");let found=0;S.active=true;
      shuffle(missing.concat(distract)).forEach(x=>{const b=document.createElement("button");b.type="button";b.className="word-option";b.textContent=x;
        b.addEventListener("click",()=>{if(!S.active||b.disabled)return;b.disabled=true;if(!missing.includes(x)){b.classList.add("bad");fail();return;}b.classList.add("good");found++;if(found===missing.length)completeActivity();});box.appendChild(b);});
      deadline(sp.response);
    },sp.show);
  });
}

function run(){
  const type=PLANS[S.level-1][S.memoryActivity] || "visual";
  if(type==="visual")visual();
  else if(type==="sequence")sequence();
  else if(type==="location")location();
  else if(type==="pairs")pairs();
  else if(type==="feature")feature();
  else working();
}
window.MQMemoryLab={run};
})();