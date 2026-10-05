import{Component,computed,inject}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
@Component({selector:'app-ecosystem',imports:[RevealDirective],templateUrl:'./ecosystem.html',styleUrl:'./ecosystem.scss'})
export class Ecosystem{
private readonly service=inject(ProjectsService);
readonly count=computed(()=>this.service.projects().length);
readonly platforms=computed(()=>new Set(this.service.projects().flatMap(p=>p.platforms)).size);
}
