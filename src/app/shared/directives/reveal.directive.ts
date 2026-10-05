import{AfterViewInit,Directive,ElementRef,inject,OnDestroy}from'@angular/core';
@Directive({selector:'[reveal]'})
export class RevealDirective implements AfterViewInit,OnDestroy{
private readonly el=inject(ElementRef<HTMLElement>);
private observer?:IntersectionObserver;
ngAfterViewInit(){
this.el.nativeElement.classList.add('reveal');
this.observer=new IntersectionObserver(([entry])=>{
if(entry.isIntersecting){this.el.nativeElement.classList.add('revealed');this.observer?.disconnect()}
},{threshold:.12});
this.observer.observe(this.el.nativeElement);
}
ngOnDestroy(){this.observer?.disconnect()}
}
