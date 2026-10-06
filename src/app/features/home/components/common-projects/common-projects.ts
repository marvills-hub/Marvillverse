import{Component,computed,inject}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
@Component({
selector:'app-common-projects',
imports:[RevealDirective],
templateUrl:'./common-projects.html',
styleUrl:'./common-projects.scss'
})
export class CommonProjects{
private readonly service=inject(ProjectsService);
readonly projects=computed(()=>this.service.projects().filter(p=>p.projectKind==='common'));
open(url?:string){if(url)window.open(url,'_blank','noopener,noreferrer')}
}
