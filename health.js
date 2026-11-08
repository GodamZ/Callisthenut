// Local activity journal and Android Health Connect bridge.
let healthSyncPending=false,healthSyncTimer=null;
function hasHealthBridge(){return typeof window.AndroidHealth?.syncSteps==='function'}
function finishHealthRequest(){
 healthSyncPending=false;clearTimeout(healthSyncTimer);healthSyncTimer=null;
}
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
 const beforeXp=state.rpg.xp;
 const day=dateKey(),used=state.history.filter(h=>h.date===day&&h.source==='manual').reduce((sum,h)=>sum+(h.xp||0),0);
 // A shared daily allowance prevents farming XP by splitting one activity.
 const proposed=Math.min(160,Math.floor(activity.minutes*2)+Math.floor(activity.calories/5));
 const gain=Math.min(proposed,Math.max(0,200-used),xpThreshold(99)-state.rpg.xp);
 state.history.push({id:crypto.randomUUID(),date:day,title:activity.name,minutes:activity.minutes,calories:activity.calories,estimated:activity.estimated,source:'manual',xp:gain});
 state.rpg.xp+=gain;state.rpg.ledger.push({day,xp:gain,label:activity.name});saveState();render();renderHealth();
 showActivityReward(activity.name,gain,`${activity.minutes} min · ${activity.estimated?'≈ ':''}${activity.calories} kcal · Récompenses des activités libres : maximum 200 XP par jour.`,beforeXp);
 return gain;
}
function showActivityReward(name,xp,detail,beforeXp=state.rpg.xp-xp){
 navigateTo('today');
 document.querySelector('#questRewardTitle').textContent=name;
 document.querySelector('#questReward').textContent=`+${xp} XP`;
 document.querySelector('#questRewardDetail').textContent=detail;
 document.querySelector('#questLevelUp').textContent='Chaque petit pas fait avancer ton aventure.';
 document.querySelector('#questSuccess').showModal();
 animateXpReward('quest',beforeXp,state.rpg.xp);
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
 const native=hasHealthBridge(),enabled=window.healthConnectionState?.enabled;
 document.querySelector('#healthConnection').textContent=window.healthBridgeIssue||(!native?'Health Connect est inaccessible depuis ce site, même installé comme raccourci sur Android. Il faut installer l’APK Android de Callisthenut pour autoriser la lecture des pas.':enabled===true?'Health Connect connecté · lecture des pas à l’ouverture et à la demande.':enabled===false?'Version Android détectée · connexion Health Connect désactivée.':'Version Android détectée · connecte Health Connect pour autoriser les pas.');
 document.querySelector('#syncHealth').disabled=healthSyncPending;
 document.querySelector('#syncHealth').textContent=healthSyncPending?'Synchronisation en cours…':native?'Connecter / synchroniser Health Connect':'Pourquoi la connexion est indisponible ?';
 document.querySelector('#disconnectHealth').hidden=!native;
 document.querySelector('#recentSteps').innerHTML=Object.entries(health.steps).sort(([a],[b])=>b.localeCompare(a)).slice(0,7).map(([day,e])=>`<div class="step-history"><span>${day}</span><strong>${stepTotal(e).toLocaleString('fr-FR')} pas</strong><small>${e.source==='health-connect'?'Health Connect':'Manuel'}</small></div>`).join('');
}
function syncHealth(){
 if(!hasHealthBridge()){
  document.querySelector('#healthStatus').textContent=window.healthBridgeIssue||'Tu utilises la version web. Chrome et les raccourcis installés depuis le site ne donnent pas accès à Health Connect. La synchronisation nécessite l’APK Android de Callisthenut ; tu peux saisir les pas manuellement ici.';
  return;
 }
 if(healthSyncPending)return;
 healthSyncPending=true;
 document.querySelector('#healthStatus').textContent='Connexion à Health Connect…';
 healthSyncTimer=setTimeout(()=>{
  finishHealthRequest();document.querySelector('#healthStatus').textContent='Aucune réponse de l’application Android. Termine la demande d’autorisation si elle est ouverte, puis réessaie. Vérifie aussi que ton APK est à jour.';renderHealth();
 },60000);
 renderHealth();
 try{window.AndroidHealth.syncSteps()}catch{finishHealthRequest();document.querySelector('#healthStatus').textContent='Le lien avec l’application Android a échoué. Ferme puis rouvre Callisthenut et réessaie.';renderHealth()}
}
window.receiveHealthSteps=function(payload){
 try{
  if(!window.AndroidHealth)throw Error('Connexion Android indisponible.');
  if(!payload||typeof payload!=='object')throw Error('Réponse Health Connect invalide.');
  if(payload.status==='ready'){
   window.healthConnectionState={enabled:payload.enabled===true};renderHealth();return;
  }
  finishHealthRequest();
  if(payload.status==='disconnected'){
   window.healthConnectionState={enabled:false};document.querySelector('#healthStatus').textContent='Synchronisation désactivée. Les pas déjà enregistrés sont conservés.';renderHealth();return;
  }
  if(typeof payload.enabled==='boolean')window.healthConnectionState={enabled:payload.enabled};
  if(payload.error)throw Error(payload.error);
  if(payload.hasData===false){
   document.querySelector('#healthStatus').textContent='Connexion autorisée, mais Health Connect ne contient pas encore de pas pour aujourd’hui. Active le partage des pas dans ton application de santé, puis réessaie. Le total précédent est conservé.';renderHealth();return;
  }
  updateSteps(payload.date,payload.steps,'health-connect');
  window.healthConnectionState={enabled:true};renderHealth();
  document.querySelector('#healthStatus').textContent='Pas synchronisés. Le total remplace la dernière observation, sans addition.';
 }catch(error){finishHealthRequest();document.querySelector('#healthStatus').textContent=error.message;renderHealth()}
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
 try{
  if(typeof window.AndroidHealth?.disconnect!=='function')return;
  window.AndroidHealth.disconnect();finishHealthRequest();window.healthConnectionState={enabled:false};renderHealth();
  document.querySelector('#healthStatus').textContent='Synchronisation automatique désactivée. Les données déjà enregistrées sont conservées. Tu peux révoquer l’accès dans les paramètres Health Connect.';
 }catch{document.querySelector('#healthStatus').textContent='La déconnexion n’a pas abouti. Réessaie ou révoque l’accès dans les paramètres Health Connect.'}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHealth()});
renderHealth();
