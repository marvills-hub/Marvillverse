import{Component,HostListener,signal}from'@angular/core';
@Component({selector:'app-scroll-progress',template:'<div [style.width.%]="progress()"></div>',styleUrl:'./scroll-progress.scss'})
export class ScrollProgress{
readonly progress=signal(0);
@HostListener('window:scroll')scroll(){const d=document.documentElement;const max=d.scrollHeight-d.clientHeight;this.progress.set(max?d.scrollTop/max*100:0)}
}
