import{Component,computed,HostListener,inject,output,signal}from'@angular/core';
import{ProjectsService}from'../../../core/services/projects.service';
import{Project}from'../../../core/models/project';
@Component({selector:'app-command-palette',templateUrl:'./command-palette.html',styleUrl:'./command-palette.scss'})
export class CommandPalette{
private readonly service=inject(ProjectsService);
openProject=output<Project>();
readonly open=signal(false);
readonly query=signal('');
readonly results=computed(()=>{const q=this.query().trim().toLowerCase();const projects=this.service.projects();return !q?projects:projects.filter(p=>(p.name+' '+p.tagline+' '+p.category+' '+p.tech.join(' ')).toLowerCase().includes(q))});
@HostListener('document:keydown',['$event'])keys(e:KeyboardEvent){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();this.toggle()}if(e.key==='Escape'&&this.open())this.close()}
toggle(){this.open.update(v=>!v);this.query.set('');document.body.style.overflow=this.open()?'hidden':''}
close(){this.open.set(false);document.body.style.overflow=''}
select(project:Project){this.close();this.openProject.emit(project)}
}
