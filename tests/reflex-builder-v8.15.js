const fs=require('fs');
const reflex=fs.readFileSync('../reflex-arena.js','utf8');
const builder=fs.readFileSync('../builder.js','utf8');
const tests=[];
function t(name,fn){try{fn();tests.push(`PASS ${name}`)}catch(e){tests.push(`FAIL ${name}: ${e.message}`)}}
t('Rhythm response controls are generated from the actual pool',()=>{
 if(!reflex.includes('id="rhythm-controls">${pool.map(x=>`<button')) throw new Error('rhythm controls are still hardcoded');
});
t('Rhythm pool supports older pathways',()=>{
 if(!reflex.includes("slice(0,2+ageDifficulty())")) throw new Error('age-scaled rhythm pool missing');
});
t('Rhythm validates the expected beat',()=>{
 if(!reflex.includes('const expected=beats[n]')) throw new Error('expected beat check missing');
});
t('Rhythm cannot complete before the full sequence',()=>{
 if(!reflex.includes('if(++n===beats.length)complete()')) throw new Error('sequence completion guard missing');
});
t('Double Target remains sequential',()=>{
 if(!reflex.includes("cells[second].textContent='🎯';cells[second].disabled=false")) throw new Error('second target is not gated');
});
t('Builder maze retains guaranteed route',()=>{
 if(!builder.includes('onSafePath')) throw new Error('maze safe path missing');
});
console.log(tests.join('\n'));
if(tests.some(x=>x.startsWith('FAIL'))) process.exit(1);
