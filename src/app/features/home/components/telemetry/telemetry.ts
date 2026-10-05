import{Component,computed,inject}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
@Component({
selector:'app-telemetry',
imports:[RevealDirective],
templateUrl:'./telemetry.html',
styleUrl:'./telemetry.scss'
})
export class Telemetry{
private readonly service=inject(ProjectsService);
readonly projects=this.service.projects;
readonly avg=computed(()=>{
const projects=this.projects();
return projects.length?Math.round(projects.reduce((sum,project)=>sum+project.progress,0)/projects.length):0;
});
}
