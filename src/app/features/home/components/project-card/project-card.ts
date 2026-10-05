import{Component,ElementRef,inject,input,output,signal,viewChild}from'@angular/core';
import{Project}from'../../../../core/models/project';
import{ProjectsService}from'../../../../core/services/projects.service';
@Component({selector:'app-project-card',templateUrl:'./project-card.html',styleUrl:'./project-card.scss'})
export class ProjectCard{
private readonly service=inject(ProjectsService);
project=input.required<Project>();
index=input(0);
open=output<Project>();
readonly card=viewChild<ElementRef<HTMLElement>>('card');
readonly rx=signal(0);readonly ry=signal(0);readonly gx=signal(50);readonly gy=signal(50);
readonly favorites=this.service.favorites;
move(e:MouseEvent){const el=this.card()?.nativeElement;if(!el)return;const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;this.ry.set((x/r.width-.5)*5);this.rx.set((.5-y/r.height)*5);this.gx.set(x/r.width*100);this.gy.set(y/r.height*100)}
leave(){this.rx.set(0);this.ry.set(0)}
activate(){this.open.emit(this.project())}
favorite(e:MouseEvent){e.stopPropagation();this.service.toggleFavorite(this.project().id)}
}
