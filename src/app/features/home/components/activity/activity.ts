import{Component,inject}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
@Component({selector:'app-activity',imports:[RevealDirective],templateUrl:'./activity.html',styleUrl:'./activity.scss'})
export class Activity{
private readonly service=inject(ProjectsService);
readonly activities=this.service.activities;
project(id:string){return this.service.projects().find(p=>p.id===id)!}
}
