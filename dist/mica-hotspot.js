// A single small instruction stays attached to an actual moving shutter surface.
export function createMicaHotspot({THREE,button,stage,camera,getTarget,onActivate}){
 let activeKey=null,anchor=null,current=null;const bounds=new THREE.Box3(),point=new THREE.Vector3(),normal=new THREE.Vector3();
 function surface(mesh){mesh.updateWorldMatrix(true,false);bounds.setFromObject(mesh);bounds.getCenter(point);normal.set(0,0,1).transformDirection(mesh.matrixWorld);return current?.allowBack||normal.dot(camera.position.clone().sub(point))>0;}
 function update(){current=getTarget();if(!current){button.hidden=true;activeKey=null;anchor=null;return;}if(current.key!==activeKey){activeKey=current.key;anchor=null;}camera.updateMatrixWorld(true);
 if(!anchor){let best=Infinity;for(const mesh of current.candidates.filter(Boolean)){if(!surface(mesh))continue;const q=point.clone().project(camera),score=q.x*q.x+q.y*q.y;if(q.z>-1&&q.z<1&&score<best){best=score;anchor=mesh;}}}
 if(!anchor||!surface(anchor)){button.hidden=true;return;}const q=point.clone().project(camera),w=stage.clientWidth,h=stage.clientHeight,x=(q.x+1)*w/2,y=(1-q.y)*h/2+(current.offsetY||0);button.hidden=q.z<=-1||q.z>=1||x<45||x>w-45||y<20||y>h-20;if(button.hidden)return;button.style.left=x+'px';button.style.top=y+'px';button.textContent=current.labelForAnchor?.(anchor)||current.label||'Change mica';button.setAttribute('aria-label',current.labelForAnchor?button.textContent+' of '+current.name:current.ariaLabel||'Change mica for '+current.name);button.dataset.target=current.key;
 }
 button.onpointerdown=e=>e.stopPropagation();button.onpointerup=e=>e.stopPropagation();button.onclick=e=>{e?.preventDefault?.();e?.stopPropagation?.();if(current)onActivate({...current,anchor});};return {update};
}
export function highlightMicaTray(tray){if(!tray)return;tray.classList?.remove('mica-next-step');void tray.offsetWidth;tray.classList?.add('mica-next-step');}
