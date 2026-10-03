const rooms={Living:{light:75,fan:1,last:75},Bedroom:{light:65,fan:1,last:65},Kitchen:{light:100,fan:0,last:100}};
let room='Bedroom',mode='light';
const $=s=>document.querySelector(s),all=s=>document.querySelectorAll(s),speeds=['Off','Low','Medium','High'];
function update(){
 const s=rooms[room],value=mode==='light'?s.light:s.fan,max=mode==='light'?100:3;
 all('[data-room]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.room===room));
 all('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));
 all('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.speed===s.fan));
 all('[data-room-name]').forEach(e=>e.textContent=room);
 $('#dial-value').textContent=mode==='light'?s.light+'%':speeds[s.fan];
 $('#dial-label').textContent=mode==='light'?'Brightness':'Fan speed';
 $('#dial-input').max=max;$('#dial-input').value=value;$('#dial-input').setAttribute('aria-label',mode==='light'?'Wall dial brightness':'Wall dial fan speed');
 $('#dial-input').setAttribute('aria-valuetext',mode==='light'?value+' percent':speeds[value]);
 $('#phone-brightness').value=s.light;$('#phone-value').textContent=s.light+'%';
 $('#light-toggle').setAttribute('aria-pressed',s.light>0);$('#light-toggle').textContent=s.light?'Lights on':'Lights off';
 $('#dial-ring').style.setProperty('--angle',value/max*270+'deg');
 $('#room-scene').style.setProperty('--brightness',s.light/100);$('#room-scene').style.setProperty('--fan-time',[0,2,1,.5][s.fan]+'s');
 $('#fan-blades').style.animationPlayState=s.fan?'running':'paused';
 $('#room-status').textContent=(s.light?'Lights '+s.light+'%':'Lights off')+' · Fan '+speeds[s.fan].toLowerCase();
 $('#decrease').disabled=value===0;$('#increase').disabled=value===max;
}
function setValue(v){const s=rooms[room];s[mode]=Math.round(Math.max(0,Math.min(mode==='light'?100:3,v)));if(mode==='light'&&s.light)s.last=s.light;update()}
all('[data-room]').forEach(b=>b.addEventListener('click',()=>{room=b.dataset.room;update()}));
all('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;update()}));
all('[data-speed]').forEach(b=>b.addEventListener('click',()=>{rooms[room].fan=+b.dataset.speed;update()}));
$('#dial-input').addEventListener('input',e=>setValue(+e.target.value));
$('#phone-brightness').addEventListener('input',e=>{const s=rooms[room];s.light=+e.target.value;if(s.light)s.last=s.light;update()});
$('#light-toggle').addEventListener('click',()=>{const s=rooms[room];s.light=s.light?0:s.last||65;update()});
$('#decrease').addEventListener('click',()=>setValue(rooms[room][mode]-(mode==='light'?5:1)));
$('#increase').addEventListener('click',()=>setValue(rooms[room][mode]+(mode==='light'?5:1)));
$('#reset-demo').addEventListener('click',()=>{Object.assign(rooms,{Living:{light:75,fan:1,last:75},Bedroom:{light:65,fan:1,last:65},Kitchen:{light:100,fan:0,last:100}});room='Bedroom';mode='light';update()});
// Drag only the outer ring; the native slider provides keyboard and touch alternatives.
const ring=$('#dial-ring');let dragging=false;
function rotate(e){const r=ring.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let angle=(Math.atan2(y,x)*180/Math.PI+225+360)%360;if(angle>270)angle=angle>315?0:270;setValue(angle/270*(mode==='light'?100:3))}
ring.addEventListener('pointerdown',e=>{if(e.target.closest('button,input'))return;const r=ring.getBoundingClientRect(),distance=Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);if(distance<r.width*.36)return;dragging=true;ring.setPointerCapture(e.pointerId);rotate(e)});
ring.addEventListener('pointermove',e=>{if(dragging)rotate(e)});ring.addEventListener('pointerup',()=>dragging=false);ring.addEventListener('pointercancel',()=>dragging=false);
update();
