import{Component,computed,inject,signal}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
import{Project,ProjectCategory}from'../../../../core/models/project';
import{ProjectCard}from'../project-card/project-card';
import{ProjectInspector}from'../project-inspector/project-inspector';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
@Component({selector:'app-projects',imports:[ProjectCard,ProjectInspector,RevealDirective],templateUrl:'./projects.html',styleUrl:'./projects.scss'})
export class Projects{
private readonly service=inject(ProjectsService);
readonly categories:ProjectCategory[]=['All','AI','Productivity','Platform','Internal'];
readonly selected=signal<ProjectCategory>('All');
readonly query=signal('');
readonly sort=signal<'featured'|'name'|'progress'|'updated'>('featured');
readonly activeProject=signal<Project|null>(null);
readonly projects=computed(()=>{
const q=this.query().trim().toLowerCase();
let items=this.service.projects().filter(p=>(this.selected()==='All'||p.category===this.selected())&&(!q||(p.name+' '+p.tagline+' '+p.tech.join(' ')).toLowerCase().includes(q)));
return [...items].sort((a,b)=>this.sort()==='name'?a.name.localeCompare(b.name):this.sort()==='progress'?b.progress-a.progress:this.sort()==='updated'?b.updated.localeCompare(a.updated):Number(!!b.featured)-Number(!!a.featured));
});
readonly projectCount=computed(()=>this.service.projects().length.toString().padStart(2,'0'));
select(category:ProjectCategory){this.selected.set(category)}
open(project:Project){this.activeProject.set(project);document.body.style.overflow='hidden'}
close(){this.activeProject.set(null);document.body.style.overflow=''}
}
