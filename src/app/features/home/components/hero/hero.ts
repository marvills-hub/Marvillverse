import{Component,computed,ElementRef,inject,signal,HostListener}from'@angular/core';
import{Project}from'../../../../core/models/project';
import{ProjectsService}from'../../../../core/services/projects.service';
import{SoftwareModal}from'../../../../shared/components/software-modal/software-modal';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
@Component({
selector:'app-hero',
imports:[SoftwareModal,RevealDirective],
templateUrl:'./hero.html',
styleUrl:'./hero.scss'
})
export class Hero{
constructor(){
document.documentElement.classList.remove('mv-universe-immersive');
document.body.classList.remove('mv-universe-immersive');
}
private readonly service=inject(ProjectsService);
private readonly host=inject(ElementRef<HTMLElement>);
private lastTitleX=0;
private lastTitleY=0;
private lastTitleTime=0;
private titleFlying=false;
readonly selected=signal<Project|null>(null);
readonly projects=computed(()=>this.service.projects().filter(p=>p.projectKind==='tool'));
readonly projectCount=computed(()=>this.projects().length);
readonly universeTransform=signal('translate3d(0,0,0)');
readonly universeImmersive=signal(false);
private universeScrollY=0;
open(project:Project){this.selected.set(project)}

toggleUniverse(event?:MouseEvent){
event?.preventDefault();
event?.stopPropagation();

const entering=!this.universeImmersive();

if(entering){
this.universeScrollY=window.scrollY;
this.universeImmersive.set(true);
document.documentElement.classList.add('mv-universe-immersive');
document.body.classList.add('mv-universe-immersive');
requestAnimationFrame(()=>{
const frame=this.host.nativeElement.querySelector('.universe-frame') as HTMLIFrameElement|null;
frame?.contentWindow?.postMessage({type:'marvillverse-universe-mode',immersive:true},location.origin);
});
}else{
const frame=this.host.nativeElement.querySelector('.universe-frame') as HTMLIFrameElement|null;
frame?.contentWindow?.postMessage({type:'marvillverse-universe-mode',immersive:false},location.origin);
this.universeImmersive.set(false);
document.documentElement.classList.remove('mv-universe-immersive');
document.body.classList.remove('mv-universe-immersive');
requestAnimationFrame(()=>{
window.scrollTo({top:this.universeScrollY,left:0,behavior:'instant'});
});
}
}
scroll(){document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'})}
move(event:MouseEvent){
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const x=(event.clientX/window.innerWidth-.5)*12;
const y=(event.clientY/window.innerHeight-.5)*12;
this.universeTransform.set(`translate3d(${x}px,${y}px,0)`);
}
reset(){
this.universeTransform.set('translate3d(0,0,0)');
this.resetTitle();
}
playTitle(event:MouseEvent){
if(
this.titleFlying||
this.gravityRunning||
window.matchMedia('(prefers-reduced-motion: reduce)').matches
)return;

const title=event.currentTarget as HTMLElement;
const letters=Array.from(
title.querySelectorAll('.title-base .play-letter')
) as HTMLElement[];

if(!letters.length)return;

title.classList.add('is-playing');

const now=performance.now();
const velocityX=this.lastTitleTime
?event.clientX-this.lastTitleX
:0;

const velocityY=this.lastTitleTime
?event.clientY-this.lastTitleY
:0;

this.lastTitleX=event.clientX;
this.lastTitleY=event.clientY;
this.lastTitleTime=now;

for(const letter of letters){
const rect=letter.getBoundingClientRect();

const cx=rect.left+rect.width/2;
const cy=rect.top+rect.height/2;

const dx=cx-event.clientX;
const dy=cy-event.clientY;

const distance=Math.hypot(dx,dy);
const radius=165;

if(distance>=radius){
letter.style.setProperty('--mx','0px');
letter.style.setProperty('--my','0px');
letter.style.setProperty('--mz','0px');
letter.style.setProperty('--rx','0deg');
letter.style.setProperty('--ry','0deg');
letter.style.setProperty('--scale','1');
letter.style.setProperty('--energy','0');
continue;
}

const force=1-distance/radius;
const eased=force*force*(3-2*force);
const length=distance||1;

const nx=dx/length;
const ny=dy/length;

/*
Original interaction:
letters nearest the cursor are pushed away in 3D.
*/

const push=30*eased;

const mx=
nx*push+
Math.max(-8,Math.min(8,velocityX*.12))*eased;

const my=
ny*push+
Math.max(-6,Math.min(6,velocityY*.10))*eased;

const mz=46*eased;

const rx=
Math.max(-14,Math.min(14,-ny*13))*eased;

const ry=
Math.max(-18,Math.min(18,nx*17))*eased;

const scale=1+eased*.08;

letter.style.setProperty('--mx',`${mx.toFixed(2)}px`);
letter.style.setProperty('--my',`${my.toFixed(2)}px`);
letter.style.setProperty('--mz',`${mz.toFixed(2)}px`);
letter.style.setProperty('--rx',`${rx.toFixed(2)}deg`);
letter.style.setProperty('--ry',`${ry.toFixed(2)}deg`);
letter.style.setProperty('--scale',scale.toFixed(3));
letter.style.setProperty('--energy',eased.toFixed(3));
}
}
leaveTitle(){
const title=this.host.nativeElement.querySelector(
'.dimension-title'
) as HTMLElement|null;

title?.classList.remove('is-playing');
this.resetTitle();
}

resetTitle(){
const letters=this.host.nativeElement.querySelectorAll('.play-letter') as NodeListOf<HTMLElement>;
letters.forEach(letter=>{
letter.style.setProperty('--mx','0px');
letter.style.setProperty('--my','0px');
letter.style.setProperty('--mz','0px');
letter.style.setProperty('--rx','0deg');
letter.style.setProperty('--ry','0deg');
letter.style.setProperty('--scale','1');
letter.style.setProperty('--energy','0');
});
this.lastTitleTime=0;
}


/* MARVILLVERSE-GRAVITY-TS */
private gravityRunning=false;

flyTitle(event:MouseEvent){
if(this.gravityRunning||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

event.preventDefault();
event.stopPropagation();

const title=event.currentTarget as HTMLElement;
const originals=Array.from(
title.querySelectorAll('.title-base .play-letter')
) as HTMLElement[];

if(!originals.length)return;

this.gravityRunning=true;
this.titleFlying=true;

type GravityBody={
el:HTMLElement;
homeX:number;
homeY:number;
x:number;
y:number;
vx:number;
vy:number;
angle:number;
spin:number;
width:number;
height:number;
};

const layer=document.createElement('div');
layer.className='mv-gravity-layer';
document.body.appendChild(layer);

const bodies:GravityBody[]=originals.map((original,index)=>{
const rect=original.getBoundingClientRect();
const style=getComputedStyle(original);

const clone=document.createElement('span');
clone.className='mv-gravity-letter';
clone.textContent=original.textContent;

clone.style.left=`${rect.left}px`;
clone.style.top=`${rect.top}px`;
clone.style.width=`${rect.width}px`;
clone.style.height=`${rect.height}px`;

clone.style.fontFamily=style.fontFamily;
clone.style.fontSize=style.fontSize;
clone.style.fontWeight=style.fontWeight;
clone.style.fontStyle=style.fontStyle;
clone.style.letterSpacing=style.letterSpacing;
clone.style.lineHeight=style.lineHeight;

const isProjects=original.closest('.worlds')!==null;

clone.style.color=isProjects
?'#7065ff'
:'#f5f5f7';

layer.appendChild(clone);

return{
el:clone,
homeX:rect.left,
homeY:rect.top,
x:rect.left,
y:rect.top,
vx:(Math.random()-.5)*7+(index%2===0?-1.4:1.4),
vy:-Math.random()*7-2,
angle:0,
spin:(Math.random()-.5)*10,
width:rect.width,
height:rect.height
};
});

title.classList.add('gravity-source-hidden');

let mouseX=event.clientX;
let mouseY=event.clientY;

const mouseMove=(e:MouseEvent)=>{
mouseX=e.clientX;
mouseY=e.clientY;
};

window.addEventListener('mousemove',mouseMove,{passive:true});

let previous=performance.now();
const started=previous;

const frame=(now:number)=>{
const dt=Math.min((now-previous)/16.667,1.8);
previous=now;

const elapsed=now-started;

for(const body of bodies){
body.vy+=.72*dt;

body.vx*=Math.pow(.996,dt);
body.vy*=Math.pow(.998,dt);

const cx=body.x+body.width/2;
const cy=body.y+body.height/2;

const dx=cx-mouseX;
const dy=cy-mouseY;
const distance=Math.hypot(dx,dy);

if(distance<150&&distance>1){
const strength=(1-distance/150)*2.4*dt;

body.vx+=(dx/distance)*strength;
body.vy+=(dy/distance)*strength;
body.spin+=(dx/distance)*.18*dt;
}

body.x+=body.vx*dt;
body.y+=body.vy*dt;
body.angle+=body.spin*dt;

if(body.x<0){
body.x=0;
body.vx=Math.abs(body.vx)*.72;
body.spin*=.9;
}

if(body.x+body.width>window.innerWidth){
body.x=window.innerWidth-body.width;
body.vx=-Math.abs(body.vx)*.72;
body.spin*=.9;
}

if(body.y<0){
body.y=0;
body.vy=Math.abs(body.vy)*.65;
}

const floor=window.innerHeight-body.height-8;

if(body.y>floor){
body.y=floor;

if(Math.abs(body.vy)>.75){
body.vy=-Math.abs(body.vy)*.48;
}
else{
body.vy=0;
}

body.vx*=.94;
body.spin*=.9;
}

body.el.style.transform=
`translate3d(${body.x-body.homeX}px,${body.y-body.homeY}px,0) rotate(${body.angle}deg)`;
}

/* approximate collisions */

for(let i=0;i<bodies.length;i++){
for(let j=i+1;j<bodies.length;j++){
const a=bodies[i];
const b=bodies[j];

const overlapX=
Math.min(a.x+a.width,b.x+b.width)-
Math.max(a.x,b.x);

const overlapY=
Math.min(a.y+a.height,b.y+b.height)-
Math.max(a.y,b.y);

if(overlapX<=0||overlapY<=0)continue;

if(overlapY<overlapX){
const direction=
a.y+a.height/2<
b.y+b.height/2
?-1
:1;

const push=overlapY/2;

a.y+=direction*push;
b.y-=direction*push;

const av=a.vy;
a.vy=b.vy*.55;
b.vy=av*.55;
}
else{
const direction=
a.x+a.width/2<
b.x+b.width/2
?-1
:1;

const push=overlapX/2;

a.x+=direction*push;
b.x-=direction*push;

const av=a.vx;
a.vx=b.vx*.65;
b.vx=av*.65;
}
}
}

if(elapsed<4200){
requestAnimationFrame(frame);
return;
}

window.removeEventListener('mousemove',mouseMove);

layer.classList.add('is-returning');

bodies.forEach((body,index)=>{
body.el.style.transition=
`transform ${700+index*16}ms cubic-bezier(.16,1,.3,1)`;

body.el.style.transform=
'translate3d(0,0,0) rotate(0deg)';
});

window.setTimeout(()=>{
title.classList.remove('gravity-source-hidden');
layer.remove();

this.gravityRunning=false;
this.titleFlying=false;
this.resetTitle();
},1150);
};

requestAnimationFrame(frame);
}
/* /MARVILLVERSE-GRAVITY-TS */


/* MARVILLVERSE-COMPRESS-HOVER */
compressTitle(event:MouseEvent){
if(
this.gravityRunning||
this.titleFlying||
window.matchMedia('(prefers-reduced-motion: reduce)').matches
)return;

const title=event.currentTarget as HTMLElement;

const letters=Array.from(
title.querySelectorAll('.title-base .play-letter')
) as HTMLElement[];

const mx=event.clientX;
const my=event.clientY;

for(const letter of letters){
const rect=letter.getBoundingClientRect();

const cx=rect.left+rect.width/2;
const cy=rect.top+rect.height/2;

const dx=mx-cx;
const dy=my-cy;

/*
Elliptical influence zone.
Horizontal distance matters more because we're squeezing type.
*/
const distance=Math.sqrt(
Math.pow(dx/1.25,2)+
Math.pow(dy/1.8,2)
);

const radius=190;
const pressure=Math.max(0,1-distance/radius);

/*
Strong non-linear response.
The closest glyph can shrink to ~30% width.
*/
const power=Math.pow(pressure,1.35);

const scaleX=1-power*.70;
const scaleY=1+power*.18;

/*
Pull surrounding glyphs toward the cursor.
*/
let shiftX=0;

if(Math.abs(dx)>3){
shiftX=Math.sign(dx)*power*14;
}

/*
Tiny vertical deformation makes it feel soft rather than
like ordinary CSS scaling.
*/
const shiftY=
Math.max(-5,Math.min(5,dy*.025))*power;

letter.style.setProperty(
'--press-x',
scaleX.toFixed(3)
);

letter.style.setProperty(
'--press-y',
scaleY.toFixed(3)
);

letter.style.setProperty(
'--press-tx',
`${shiftX.toFixed(2)}px`
);

letter.style.setProperty(
'--press-ty',
`${shiftY.toFixed(2)}px`
);

letter.style.setProperty(
'--press-energy',
power.toFixed(3)
);
}
}

releaseTitle(){
const letters=this.host.nativeElement.querySelectorAll(
'.title-base .play-letter'
) as NodeListOf<HTMLElement>;

letters.forEach(letter=>{
letter.style.setProperty('--press-x','1');
letter.style.setProperty('--press-y','1');
letter.style.setProperty('--press-tx','0px');
letter.style.setProperty('--press-ty','0px');
letter.style.setProperty('--press-energy','0');
});
}
/* /MARVILLVERSE-COMPRESS-HOVER */

/* MARVILLVERSE-SUBTEXT-WAVE */
waveSubtext(event:MouseEvent){
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

const paragraph=event.currentTarget as HTMLElement;
const words=Array.from(paragraph.querySelectorAll('span')) as HTMLElement[];

const mx=event.clientX;
const my=event.clientY;

for(const word of words){
const rect=word.getBoundingClientRect();
const cx=rect.left+rect.width/2;
const cy=rect.top+rect.height/2;

const dx=cx-mx;
const dy=cy-my;

/*
Elliptical wave radius keeps several neighboring words
moving together instead of affecting only one word.
*/
const distance=Math.sqrt(
Math.pow(dx/1.45,2)+
Math.pow(dy/1.8,2)
);

const radius=180;
const force=Math.max(0,1-distance/radius);
const wave=Math.sin(force*Math.PI*.5);
const energy=wave*wave;

const lift=-12*energy;
const scale=1+energy*.055;

/*
Very small horizontal displacement away from the cursor
gives the sentence a soft flowing motion.
*/
const pushX=
distance>1
?(dx/distance)*energy*3.5
:0;

word.style.setProperty('--wave-y',`${lift.toFixed(2)}px`);
word.style.setProperty('--wave-x',`${pushX.toFixed(2)}px`);
word.style.setProperty('--wave-scale',scale.toFixed(3));
word.style.setProperty('--wave-energy',energy.toFixed(3));
}
}

resetSubtext(){
const words=this.host.nativeElement.querySelectorAll(
'.hero-subtext span'
) as NodeListOf<HTMLElement>;

words.forEach(word=>{
word.style.setProperty('--wave-y','0px');
word.style.setProperty('--wave-x','0px');
word.style.setProperty('--wave-scale','1');
word.style.setProperty('--wave-energy','0');
});
}
/* /MARVILLVERSE-SUBTEXT-WAVE */

/* MV-V4-MESSAGE-START */
@HostListener('window:message',['$event'])
onUniverseIframeMessage(messageEvent:MessageEvent){
if(messageEvent.origin!==location.origin)return;

const universeIframe=this.host.nativeElement.querySelector('.universe-frame') as HTMLIFrameElement|null;

if(!universeIframe)return;
if(messageEvent.source!==universeIframe.contentWindow)return;
if(messageEvent.data?.type!=='MV_UNIVERSE_DBLCLICK')return;

this.toggleUniverse();

requestAnimationFrame(()=>{
universeIframe.contentWindow?.postMessage(
{
type:'MV_UNIVERSE_STATE',
immersive:this.universeImmersive()
},
location.origin
);
});
}
/* MV-V4-MESSAGE-END */
}

