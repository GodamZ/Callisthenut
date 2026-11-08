// Local activity journal and Android Health Connect bridge.
function healthState(){
 if(!state.health)state.health={steps:{},goal:6000};
 return state.health;
}

function activityInput(data){
 const name=String(data.name||'').trim(),minutes=Number(data.minutes),raw=String(data.calories??'').trim();
 const met=Number(data.met);
 if(!name||name.length>60||!Number.isFinite(minutes)||minutes<1||minutes>1440)throw Error('Indique un nom et une durée entre 1 et 1 440 minutes.');
 if(![2.5,5,8].includes(met))throw Error('Choisis une intensité.');
 const calories=raw===''?Math.round(met*3.5*state.weight/200*minutes):Number(raw);
 if(!Number.isFinite(calories)||calories<0||calories>10000)throw Error('Les calories doivent être comprises entre 0 et 10 000.');
 return {name,minutes,calories:Math.round(calories),estimated:raw===''};
}
function recordActivity(data){
 const activity=activityInput(data);settleDays();
 const day=dateKey(),used=state.history.filter(h=>h.date===day&&h.source==='manual').reduce((sum,h)=>sum+(h.xp||0),0);
 // A shared daily allowance prevents farming XP by splitting one activity.
 const proposed=Math.min(160,Math.floor(activity.minutes*2)+Math.floor(activity.calories/5));
 const gain=Math.min(proposed,Math.max(0,200-used),xpThreshold(99)-state.rpg.xp);
 state.history.push({id:crypto.randomUUID(),date:day,title:activity.name,minutes:activity.minutes,calories:activity.calories,estimated:activity.estimated,source:'manual',xp:gain});
 state.rpg.xp+=gain;state.rpg.ledger.push({day,xp:gain,label:activity.name});saveState();render();renderHealth();
 showActivityReward(activity.name,gain,`${activity.minutes} min · ${activity.estimated?'≈ ':''}${activity.calories} kcal · Récompenses des activités libres : maximum 200 XP par jour.`);
 return gain;
}
function showActivityReward(name,xp,detail){
 navigateTo('today');
 document.querySelector('#questRewardTitle').textContent=name;
 document.querySelector('#questReward').textContent=`+${xp} XP`;
 document.querySelector('#questRewardDetail').textContent=detail;
 document.querySelector('#questLevelUp').textContent=`LVL ${heroLevel()} · Continue ton aventure !`;
 document.querySelector('#questSuccess').showModal();
}
function updateSteps(day,count,source){
 if(day!==dateKey()||!Number.isSafeInteger(count)||count<0||count>200000||!['manual','health-connect'].includes(source))throw Error('Nombre de pas du jour invalide (0 à 200 000).');
 const health=healthState(),entry=health.steps[day]||{rewarded:0};
 // Two observations of the same daily total must never be added together.
 entry[source]=count;entry.source=source;entry.updatedAt=new Date().toISOString();
 health.steps[day]=entry;saveState();renderHealth();return stepTotal(entry);
}
function stepTotal(entry){return entry?.source?entry[entry.source]||0:0}
function setStepGoal(value){
 const goal=Number(value);
 if(!Number.isSafeInteger(goal)||goal<1000||goal>30000)throw Error('Choisis un objectif entre 1 000 et 30 000 pas.');
 healthState().goal=goal;saveState();renderHealth();
}
function rewardSteps(){
 const entry=healthState().steps[dateKey()];if(!entry)return 0;
 // Fixed milestones: changing the personal target never generates more rewards.
 const earned=Math.min(60,Math.floor(stepTotal(entry)/1000)*10);
 const gain=Math.min(Math.max(0,earned-(entry.rewarded||0)),xpThreshold(99)-state.rpg.xp);
 if(!gain)return 0;
 entry.rewarded=(entry.rewarded||0)+gain;
 state.rpg.xp+=gain;state.rpg.ledger.push({day:dateKey(),xp:gain,label:'Exploration · pas du jour'});
 saveState();render();renderHealth();showActivityReward('Les pas de l’aventure',gain,'10 XP par tranche de 1 000 pas, jusqu’à 60 XP par jour. Les pas ne rajoutent pas de calories à celles des activités.');return gain;
}
function renderHealth(){
 const health=healthState(),entry=health.steps[dateKey()],total=stepTotal(entry);
 document.querySelector('#stepCount').textContent=total.toLocaleString('fr-FR');
 document.querySelector('#stepTargetLabel').textContent=`/ ${health.goal.toLocaleString('fr-FR')} pas`;
 document.querySelector('#stepProgress').value=Math.min(100,total/health.goal*100);
 document.querySelector('#stepSource').textContent=entry?`${entry.source==='health-connect'?'Health Connect':'Saisie manuelle'} · ${new Date(entry.updatedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`:'Aucune donnée aujourd’hui';
 const available=Math.max(0,Math.min(60,Math.floor(total/1000)*10)-(entry?.rewarded||0));
 document.querySelector('#claimStepXp').disabled=!available;
 document.querySelector('#claimStepXp').textContent=available?`Récupérer +${available} XP`:'Prochain palier : 1 000 pas';
 if(total>=6000&&!available)document.querySelector('#claimStepXp').textContent='Récompenses du jour obtenues';
 document.querySelector('#healthConnection').textContent=window.AndroidHealth?'Health Connect · synchronisation à l’ouverture et à la demande':'Version web · saisis tes pas ci-dessous. La synchronisation Health Connect nécessite la version Android.';
 document.querySelector('#syncHealth').disabled=!window.AndroidHealth;
 document.querySelector('#recentSteps').innerHTML=Object.entries(health.steps).sort(([a],[b])=>b.localeCompare(a)).slice(0,7).map(([day,e])=>`<div class="step-history"><span>${day}</span><strong>${stepTotal(e).toLocaleString('fr-FR')} pas</strong><small>${e.source==='health-connect'?'Health Connect':'Manuel'}</small></div>`).join('');
}
function syncHealth(){
 if(!window.AndroidHealth){toast('Health Connect est disponible dans la version Android.');return}
 document.querySelector('#healthStatus').textContent='Connexion à Health Connect…';
 try{window.AndroidHealth.syncSteps()}catch{document.querySelector('#healthStatus').textContent='Connexion impossible. Réessaie depuis la version Android.'}
}
window.receiveHealthSteps=function(payload){
 try{
  if(!window.AndroidHealth)throw Error('Connexion Android indisponible.');
  if(payload.error)throw Error(payload.error);
  updateSteps(payload.date,payload.steps,'health-connect');
  document.querySelector('#healthStatus').textContent='Pas synchronisés. Le total remplace la dernière observation, sans addition.';
 }catch(error){document.querySelector('#healthStatus').textContent=error.message}
};
document.querySelector('#manualActivityForm').addEventListener('submit',event=>{
 event.preventDefault();const form=event.currentTarget;
 try{recordActivity({name:form.elements.activityName.value,minutes:form.elements.activityMinutes.value,met:form.elements.activityIntensity.value,calories:form.elements.activityCalories.value});form.reset();document.querySelector('#activityError').textContent=''}catch(error){document.querySelector('#activityError').textContent=error.message}
});
document.querySelector('#manualStepsForm').addEventListener('submit',event=>{
 event.preventDefault();
 try{updateSteps(dateKey(),Number(event.currentTarget.elements.manualSteps.value),'manual');toast('Total de pas enregistré.')}catch(error){document.querySelector('#healthStatus').textContent=error.message}
});
document.querySelector('#stepGoalForm').addEventListener('submit',event=>{
 event.preventDefault();try{setStepGoal(event.currentTarget.elements.stepGoal.value);toast('Objectif enregistré.')}catch(error){document.querySelector('#healthStatus').textContent=error.message}
});
document.querySelector('#syncHealth').addEventListener('click',syncHealth);
document.querySelector('#claimStepXp').addEventListener('click',rewardSteps);
document.querySelector('#disconnectHealth').addEventListener('click',()=>{
 if(window.AndroidHealth)window.AndroidHealth.disconnect();
 document.querySelector('#healthStatus').textContent='Synchronisation automatique désactivée. Les données déjà enregistrées sont conservées. Tu peux révoquer l’accès dans les paramètres Health Connect.';
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHealth()});
renderHealth();
