const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let pass=0,fail=0;const ok=(n,c,d='')=>{c?pass++:fail++;console.log(`${c?'PASS':'FAIL'} ${n}${d?` [${d}]`:''}`)};
const index=read('index.html'),progress=read('progress.js'),team=read('team-quest.js'),world=read('world-explorer.js'),money=read('money-mission.js'),detective=read('detective.js'),app=read('app.js');
for(const f of ['app.js','progress.js','memory-lab.js','detective.js','reflex-arena.js','builder.js','team-quest.js','world-explorer.js','money-mission.js']){
  const {spawnSync}=require('child_process'); const r=spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); ok(`syntax: ${f}`,r.status===0,r.stderr.trim());
}
ok('no 700ms persistence interval',!progress.includes('setInterval(save,700)'));
ok('no idle console repaint interval',!progress.includes('setInterval(()=>{syncPlayerIdentity();renderIntelligenceConsole();},1200)'));
ok('event-driven visibility save exists',/visibilitychange/.test(progress)&&/saveCheckpoint\(\)/.test(progress));
const checkpointChunk=(progress.match(/const checkpoint=[\s\S]*?\};\n/)||[''])[0];ok('checkpoints exclude XP',!/[,{]xp\s*:/.test(checkpointChunk));
ok('checkpoint requires real progress',/hasProgress=p=>/.test(progress)&&/Number\(p\.level\)>1/.test(progress));
ok('profile storage exists',/mindquest-profile-v2/.test(progress));
ok('pathway-aware duplicate guard',/\$\{MQ\.state\.age\}:\$\{g\}:\$\{n\}/.test(progress)&&/recordLevel\._last/.test(progress));
ok('Player Profile button container exists',/class="header-actions"/.test(index));
ok('adult gate present',/adult-check-answer/.test(index)&&/adult-confirm/.test(index)&&/guardianConfirmedAt/.test(app));
ok('data export and delete controls exist',/Export My Data/.test(progress)&&/Delete Local Profile/.test(progress));
ok('Team Quest has 14 mechanics',/const TYPES=\[[\s\S]*?activeListening['"]\s*,\s*['"]perspective/.test(team));
ok('Team Quest choice signature fixed',/function choice\(type,prompt,choices,correct\)/.test(team));
ok('World Explorer global direction example',/Paris toward London/.test(world)&&/Northwest/.test(world));
ok('World Explorer distance values distinct',/vals=\[base,base\+5\+\(activity\(\)\*2\),base\+13\]/.test(world));
ok('Money Mission savings pluralisation',/const wk=n=>`\$\{n\} week\$\{n===1\?'':'s'\}`/.test(money));
ok('Money Mission exact-change Clear',/id="change-clear"/.test(money));
ok('Detective probability advanced bank retained',/3\/5/.test(detective)&&/Math\.min\(a,4\)/.test(detective));
ok('Fisher-Yates shuffle used',/for\(let i=.*i>0;i--\)/.test(team)&&/Math\.floor\(Math\.random\(\)\*\(i\+1\)\)/.test(team));
ok('premium copy does not promise inactive activation',/does not activate premium game modules/.test(index));
ok('manifest present',/rel="manifest"/.test(index));
console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
