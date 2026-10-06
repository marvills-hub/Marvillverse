import{AfterViewInit,Component,ElementRef,NgZone,OnDestroy,ViewChild}from'@angular/core';
import{initFluid,presets}from'../../fluid';
@Component({
selector:'app-cursor',
templateUrl:'./cursor.html',
styleUrl:'./cursor.scss'
})
export class Cursor implements AfterViewInit,OnDestroy{
@ViewChild('fluidLayer',{static:true})fluidLayer!:ElementRef<HTMLDivElement>;
@ViewChild('head',{static:true})head!:ElementRef<HTMLCanvasElement>;
private fluid:any;
private ctx?:CanvasRenderingContext2D|null;
private raf=0;
private mx=-200;
private my=-200;
private x=-200;
private y=-200;
private px=-200;
private py=-200;
private speed=0;
private angle=0;
private active=false;
private readonly move=(e:PointerEvent)=>{
if(e.pointerType==='touch')return;
this.mx=e.clientX;
this.my=e.clientY;
this.active=true;
};
private readonly leave=()=>this.active=false;
constructor(private readonly zone:NgZone){}
ngAfterViewInit(){
if(matchMedia('(pointer:coarse)').matches)return;
this.zone.runOutsideAngular(()=>{
this.fluid=initFluid({
...presets['Aurora Wisp'],
container:this.fluidLayer.nativeElement,
position:'fixed',
zIndex:0,
pointerEvents:false,
transparent:true,
shading:true,
maxDpr:1,
simResolution:192,
dyeResolution:768,
pressureIteration:14,
pressure:.8,
densityDissipation:1.45,
velocityDissipation:.72,
curl:18,
splatRadius:.040,
splatForce:8200,
colorIntensity:.18,
colorUpdateSpeed:4.2,
palette:null,});
const canvas=this.head.nativeElement;
this.ctx=canvas.getContext('2d');
const dpr=Math.min(devicePixelRatio||1,1.5);
canvas.width=Math.round(150*dpr);
canvas.height=Math.round(150*dpr);
canvas.style.width='150px';
canvas.style.height='150px';
this.ctx?.scale(dpr,dpr);
window.addEventListener('pointermove',this.move,{passive:true});
document.addEventListener('mouseleave',this.leave);
this.draw();
});
}
private draw=()=>{
this.raf=requestAnimationFrame(this.draw);
const ctx=this.ctx;
if(!ctx)return;
const dx=this.mx-this.px;
const dy=this.my-this.py;
const rawSpeed=Math.hypot(dx,dy);
this.speed+=(Math.min(rawSpeed,40)-this.speed)*.16;
this.px=this.mx;
this.py=this.my;
this.x+=(this.mx-this.x)*.38;
this.y+=(this.my-this.y)*.38;
this.angle+=.035+Math.min(this.speed*.0012,.035);
const canvas=this.head.nativeElement;
canvas.style.transform=`translate3d(${this.x-75}px,${this.y-75}px,0)`;
canvas.style.opacity=this.active?'1':'0';
ctx.clearRect(0,0,150,150);
const cx=75,cy=75;
const intensity=.72+Math.min(this.speed/45,.28);
ctx.save();
ctx.globalCompositeOperation='lighter';
const halo=ctx.createRadialGradient(cx,cy,2,cx,cy,43);
halo.addColorStop(0,'rgba(255,255,255,.34)');
halo.addColorStop(.12,'rgba(214,185,255,.24)');
halo.addColorStop(.34,'rgba(143,86,255,.13)');
halo.addColorStop(.7,'rgba(103,61,214,.045)');
halo.addColorStop(1,'rgba(80,40,180,0)');
ctx.fillStyle=halo;
ctx.beginPath();
ctx.arc(cx,cy,45,0,Math.PI*2);
ctx.fill();
for(let arm=0;arm<3;arm++){
const phase=this.angle+arm*Math.PI*2/3;
ctx.beginPath();
for(let i=0;i<=54;i++){
const t=i/54;
const a=phase+t*Math.PI*2.15;
const r=3+t*31;
const squeeze=1-t*.18;
const xx=cx+Math.cos(a)*r;
const yy=cy+Math.sin(a)*r*squeeze;
if(i===0)ctx.moveTo(xx,yy);
else ctx.lineTo(xx,yy);
}
const g=ctx.createLinearGradient(cx-30,cy-30,cx+30,cy+30);
if(arm===0){
g.addColorStop(0,'rgba(107,67,255,0)');
g.addColorStop(.34,`rgba(139,84,255,${.18*intensity})`);
g.addColorStop(.72,`rgba(208,151,255,${.48*intensity})`);
g.addColorStop(1,'rgba(255,255,255,.82)');
}else if(arm===1){
g.addColorStop(0,'rgba(71,161,255,0)');
g.addColorStop(.42,`rgba(87,184,255,${.12*intensity})`);
g.addColorStop(.78,`rgba(149,126,255,${.30*intensity})`);
g.addColorStop(1,'rgba(231,220,255,.48)');
}else{
g.addColorStop(0,'rgba(157,64,255,0)');
g.addColorStop(.42,`rgba(178,74,255,${.10*intensity})`);
g.addColorStop(.78,`rgba(213,132,255,${.25*intensity})`);
g.addColorStop(1,'rgba(255,225,255,.40)');
}
ctx.strokeStyle=g;
ctx.lineCap='round';
ctx.lineWidth=arm===0?2.7:1.45;
ctx.shadowBlur=arm===0?11:7;
ctx.shadowColor=arm===1?'rgba(85,177,255,.65)':'rgba(164,91,255,.72)';
ctx.stroke();
}
const core=ctx.createRadialGradient(cx,cy,0,cx,cy,12);
core.addColorStop(0,'rgba(255,255,255,1)');
core.addColorStop(.16,'rgba(246,226,255,.95)');
core.addColorStop(.42,'rgba(192,126,255,.66)');
core.addColorStop(.72,'rgba(121,72,255,.20)');
core.addColorStop(1,'rgba(104,58,230,0)');
ctx.fillStyle=core;
ctx.shadowBlur=14;
ctx.shadowColor='rgba(185,115,255,.9)';
ctx.beginPath();
ctx.arc(cx,cy,12,0,Math.PI*2);
ctx.fill();
ctx.restore();
};
ngOnDestroy(){
cancelAnimationFrame(this.raf);
window.removeEventListener('pointermove',this.move);
document.removeEventListener('mouseleave',this.leave);
this.fluid?.dispose?.();
this.fluid=undefined;
}
}





