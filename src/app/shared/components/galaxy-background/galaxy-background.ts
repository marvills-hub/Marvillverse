import{AfterViewInit,Component,ElementRef,NgZone,OnDestroy,ViewChild}from'@angular/core';

@Component({
selector:'app-galaxy-background',
templateUrl:'./galaxy-background.html',
styleUrl:'./galaxy-background.scss'
})
export class GalaxyBackground implements AfterViewInit,OnDestroy{
@ViewChild('canvas',{static:true})canvas!:ElementRef<HTMLCanvasElement>;
private resize?:()=>void;
constructor(private readonly zone:NgZone){}
ngAfterViewInit(){
this.zone.runOutsideAngular(()=>this.build());
}
ngOnDestroy(){
if(this.resize)window.removeEventListener('resize',this.resize);
}
private build(){
const canvas=this.canvas.nativeElement;
const ctx=canvas.getContext('2d');
if(!ctx)return;
const stars:{x:number;y:number;r:number;a:number;c:string}[]=[];
const nebula:{x:number;y:number;rx:number;ry:number;c:string;a:number}[]=[];
const random=(min:number,max:number)=>min+Math.random()*(max-min);
const generate=()=>{
stars.length=0;
nebula.length=0;
const area=window.innerWidth*window.innerHeight;
const count=Math.max(900,Math.min(2600,Math.floor(area/620)));
const colors=[
'220,230,255',
'255,255,255',
'140,175,255',
'167,130,255',
'105,210,255',
'255,205,160'
];
for(let i=0;i<count;i++){
const bright=Math.random();
stars.push({
x:Math.random(),
y:Math.random(),
r:bright>.985?random(1.3,2.1):bright>.91?random(.7,1.15):random(.25,.65),
a:bright>.985?random(.72,1):bright>.91?random(.38,.72):random(.12,.42),
c:colors[Math.floor(Math.random()*colors.length)]
});
}
const clouds=[
{c:'62,73,255',a:.10},
{c:'119,63,255',a:.09},
{c:'0,174,255',a:.065},
{c:'190,56,255',a:.055},
{c:'49,74,190',a:.065},
{c:'42,128,210',a:.05}
];
for(let i=0;i<14;i++){
const cloud=clouds[i%clouds.length];
nebula.push({
x:random(-.05,1.05),
y:random(-.05,1.05),
rx:random(.14,.32),
ry:random(.08,.22),
c:cloud.c,
a:cloud.a*random(.65,1.15)
});
}
};
const draw=()=>{
const dpr=Math.min(devicePixelRatio||1,1.5);
const w=window.innerWidth;
const h=window.innerHeight;
canvas.width=Math.round(w*dpr);
canvas.height=Math.round(h*dpr);
canvas.style.width=`${w}px`;
canvas.style.height=`${h}px`;
ctx.setTransform(dpr,0,0,dpr,0,0);
ctx.clearRect(0,0,w,h);
ctx.fillStyle='#07070c';
ctx.fillRect(0,0,w,h);

for(const n of nebula){
const x=n.x*w;
const y=n.y*h;
const radius=Math.max(w*n.rx,h*n.ry);
const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);
gradient.addColorStop(0,`rgba(${n.c},${n.a})`);
gradient.addColorStop(.34,`rgba(${n.c},${n.a*.52})`);
gradient.addColorStop(1,`rgba(${n.c},0)`);
ctx.save();
ctx.translate(x,y);
ctx.scale(1,n.ry/n.rx);
ctx.translate(-x,-y);
ctx.fillStyle=gradient;
ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
ctx.restore();
}

for(const s of stars){
const x=s.x*w;
const y=s.y*h;
ctx.beginPath();
ctx.arc(x,y,s.r,0,Math.PI*2);
ctx.fillStyle=`rgba(${s.c},${s.a})`;
ctx.fill();

if(s.r>1.25){
ctx.strokeStyle=`rgba(${s.c},${s.a*.38})`;
ctx.lineWidth=.55;
ctx.beginPath();
ctx.moveTo(x-s.r*3.4,y);
ctx.lineTo(x+s.r*3.4,y);
ctx.moveTo(x,y-s.r*3.4);
ctx.lineTo(x,y+s.r*3.4);
ctx.stroke();
}
}
};
const rebuild=()=>{
generate();
draw();
};
this.resize=rebuild;
window.addEventListener('resize',rebuild,{passive:true});
rebuild();
}
}
