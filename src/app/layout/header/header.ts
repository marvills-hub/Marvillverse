import{Component,HostListener,signal}from'@angular/core';
@Component({selector:'app-header',templateUrl:'./header.html',styleUrl:'./header.scss'})
export class Header{
readonly scrolled=signal(false);
readonly menuOpen=signal(false);
@HostListener('window:scroll')onScroll(){this.scrolled.set(window.scrollY>30)}
toggle(){this.menuOpen.update(v=>!v)}
close(){this.menuOpen.set(false)}
}
