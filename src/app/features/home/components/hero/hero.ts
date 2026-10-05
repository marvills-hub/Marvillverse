import{Component,computed,HostListener,inject,signal}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
@Component({
selector:'app-hero',
templateUrl:'./hero.html',
styleUrl:'./hero.scss'
})
export class Hero{
private readonly service=inject(ProjectsService);
readonly projects=this.service.projects;
readonly projectCount=computed(()=>this.projects().length);
readonly mx=signal(0);
readonly my=signal(0);
readonly transform=computed(()=>`translate3d(${this.mx()*18}px,${this.my()*18}px,0) rotateX(${this.my()*-2}deg) rotateY(${this.mx()*3}deg)`);
@HostListener('mousemove',['$event'])
move(e:MouseEvent){
this.mx.set((e.clientX/window.innerWidth-.5)*2);
this.my.set((e.clientY/window.innerHeight-.5)*2);
}
}
