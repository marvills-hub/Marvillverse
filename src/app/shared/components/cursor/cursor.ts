import{AfterViewInit,Component,ElementRef,NgZone,OnDestroy,ViewChild}from'@angular/core';
import{initFluid}from'smokey-fluid-cursor';
@Component({
selector:'app-cursor',
templateUrl:'./cursor.html',
styleUrl:'./cursor.scss'
})
export class Cursor implements AfterViewInit,OnDestroy{
@ViewChild('fluidLayer',{static:true})fluidLayer!:ElementRef<HTMLDivElement>;
private fluid:any;
constructor(private readonly zone:NgZone){}
ngAfterViewInit(){
if(matchMedia('(pointer:coarse)').matches)return;
this.zone.runOutsideAngular(()=>{
this.fluid=initFluid({
container:this.fluidLayer.nativeElement,
position:'absolute',
zIndex:0,
pointerEvents:false
});
});
}
ngOnDestroy(){
this.fluid?.dispose?.();
this.fluid=undefined;
}
}
