import{Component,HostListener,signal}from'@angular/core';
@Component({selector:'app-cursor',templateUrl:'./cursor.html',styleUrl:'./cursor.scss'})
export class Cursor{
readonly x=signal(-200);
readonly y=signal(-200);
readonly active=signal(false);
@HostListener('document:mousemove',['$event'])move(e:MouseEvent){this.x.set(e.clientX);this.y.set(e.clientY)}
@HostListener('document:mouseover',['$event'])over(e:MouseEvent){this.active.set(!!(e.target as HTMLElement).closest('a,button,article'))}
}
