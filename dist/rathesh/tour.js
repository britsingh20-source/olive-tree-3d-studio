// Frame-driven tour: no background timers can reopen a cabinet after a stop.
export function createKitchenTour({units,onOverview,onVisit,onAction,onStatus,onComplete}){
 const steps=[{type:'overview',duration:3}];
 for(const unit of units){steps.push({type:'visit',unit,duration:unit.actions.length ? 0.9 : 3.2});for(let i=0;i<unit.actions.length;i++){const action=unit.actions[i];steps.push({type:'open',unit,action,number:i+1,total:unit.actions.length,duration:3.2},{type:'close',unit,action,duration:.8});}}
 steps.push({type:'finish',duration:2.5});let active=false,index=0,elapsed=0;
 function enter(){const s=steps[index];if(s.type==='overview'||s.type==='finish')onOverview();else if(s.type==='visit')onVisit(s.unit);else onAction(s.action,s.type==='open');onStatus({active:true,index,total:steps.length,step:s});}
 return {get active(){return active;},start(){active=true;index=0;elapsed=0;enter();},stop(){if(!active)return false;active=false;onStatus({active:false,stopped:true,index,total:steps.length,step:steps[index]});return true;},update(dt){if(!active)return;elapsed+=Math.max(0,dt);while(active&&elapsed>=steps[index].duration){elapsed-=steps[index].duration;index++;if(index===steps.length){active=false;onStatus({active:false,complete:true,index,total:steps.length});onComplete();break;}enter();}}};
}
