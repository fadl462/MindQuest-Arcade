(() => {
  'use strict';
  const MQ = window.MQ;
  if (!MQ) return;

  const STORE = 'mindquest-progress-v2';
  const SESSION = 'mindquest-session-v2';
  const AGE_KEY = 'mindquest-age-pathway';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; } })();
  let suppressSave = false;

  const keyFor = (age, game) => `${age}:${game}`;
  const gameName = id => ({memory:'Memory Lab', detective:'Detective', reflex:'Reflex Arena', builder:'Builder', team:'Team Quest'})[id] || id;
  const save = () => {
    if (suppressSave || !MQ.state.game) return;
    const s = MQ.state;
    saved[keyFor(s.age, s.game)] = {
      age:s.age, game:s.game, level:s.level, lives:s.lives, streak:s.streak,
      bestStreak:s.bestStreak, xp:s.xp, score:s.score, earnedThisRun:s.earnedThisRun,
      detectiveActivity:Number.isInteger(s.detectiveActivity)?s.detectiveActivity:0,
      memoryActivity:Number.isInteger(s.memoryActivity)?s.memoryActivity:0,
      skills:s.skills
    };
    try {
      localStorage.setItem(STORE, JSON.stringify(saved));
      localStorage.setItem(SESSION, JSON.stringify({age:s.age,game:s.game}));
      localStorage.setItem(AGE_KEY, String(s.age));
    } catch {}
  };
  const restore = (p) => {
    const s = MQ.state;
    Object.assign(s, p);
    s.active = false;
    s.timer = null;
    s.skills = p.skills || s.skills;
    MQ.updateGlobal();
  };
  const showGame = () => {
    document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
    document.getElementById('game').classList.add('active');
  };

  // Restore the selected age immediately and keep it across refreshes.
  try {
    const age = Number(localStorage.getItem(AGE_KEY));
    if (Number.isInteger(age) && age >= 0 && age < MQ.ages.length) {
      MQ.state.age = age;
      document.querySelectorAll('.age-btn').forEach((b,i) => b.classList.toggle('active', i === age));
      document.getElementById('path-label').textContent = 'Ages ' + MQ.ages[age].range;
    }
  } catch {}

  // Save frequently so refreshes/browser closes do not erase progress.
  setInterval(save, 400);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });

  // If the player is on a game and refreshes, resume that game at the saved level/activity.
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION) || 'null'); } catch {}
  if (session) {
    const p = saved[keyFor(session.age, session.game)];
    if (p && p.level >= 1 && p.level <= 20) {
      setTimeout(() => {
        restore(p);
        const g = document.querySelector('#game-icon');
        const n = document.querySelector('#game-name');
        const sk = document.querySelector('#game-skill');
        const meta = {memory:['🧠','Memory Lab','COGNITIVE'],detective:['🔎','Detective','COGNITIVE'],reflex:['⚡','Reflex Arena','PSYCHOMOTOR'],builder:['🧩','Builder','COGNITIVE'],team:['🤝','Team Quest','BEHAVIOURAL']}[p.game];
        if (meta) { g.textContent=meta[0]; n.textContent=meta[1]; sk.textContent=meta[2]; }
        showGame();
        MQ.nextChallenge();
      }, 80);
    }
  }

  // Add a clear Resume button to the arcade home screen.
  const homeCard = document.querySelector('#home .card:last-of-type');
  if (homeCard) {
    const resumeWrap = document.createElement('div');
    resumeWrap.id = 'resume-progress-wrap';
    resumeWrap.style.cssText = 'margin-top:14px;display:none;';
    homeCard.appendChild(resumeWrap);

    const renderResume = () => {
      const entries = Object.values(saved).filter(p => p && p.level >= 1 && p.level <= 20);
      if (!entries.length) { resumeWrap.style.display='none'; return; }
      entries.sort((a,b) => (b.level-a.level) || (b.xp-a.xp));
      const p = entries[0];
      resumeWrap.style.display='block';
      resumeWrap.innerHTML = `<div class="resume-card" style="border:1px solid var(--line);border-radius:16px;padding:14px;background:#f8f9fc;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><strong>Continue ${gameName(p.game)}</strong><div style="color:var(--muted);font-size:13px;margin-top:3px">Ages ${MQ.ages[p.age].range} • Level ${p.level}/20 • ${p.xp} XP</div></div><button id="resume-last" class="primary-btn" type="button">Resume Game →</button></div>`;
      document.getElementById('resume-last').onclick = () => {
        suppressSave = true;
        restore(p);
        suppressSave = false;
        const meta = {memory:['🧠','Memory Lab','COGNITIVE'],detective:['🔎','Detective','COGNITIVE'],reflex:['⚡','Reflex Arena','PSYCHOMOTOR'],builder:['🧩','Builder','COGNITIVE'],team:['🤝','Team Quest','BEHAVIOURAL']}[p.game];
        document.getElementById('game-icon').textContent=meta[0];
        document.getElementById('game-name').textContent=meta[1];
        document.getElementById('game-skill').textContent=meta[2];
        showGame();
        localStorage.setItem(SESSION, JSON.stringify({age:p.age,game:p.game}));
        MQ.nextChallenge();
      };
    };
    setTimeout(renderResume, 120);
    setInterval(renderResume, 1000);
  }

  // Preserve the saved checkpoint when the player uses "Game Arcade".
  document.getElementById('back-home')?.addEventListener('click', () => {
    save();
    suppressSave = true;
    setTimeout(() => { suppressSave = false; }, 1200);
  }, true);

  // Age buttons should update the persistent pathway immediately.
  document.querySelectorAll('.age-btn').forEach((b,i) => b.addEventListener('click', () => {
    try { localStorage.setItem(AGE_KEY, String(i)); } catch {}
  }));
})();
