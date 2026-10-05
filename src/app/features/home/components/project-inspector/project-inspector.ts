import{Component,HostListener,inject,input,output}from'@angular/core';
import{Project}from'../../../../core/models/project';
import{ProjectsService}from'../../../../core/services/projects.service';
@Component({selector:'app-project-inspector',templateUrl:'./project-inspector.html',styleUrl:'./project-inspector.scss'})
export class ProjectInspector{
private readonly service=inject(ProjectsService);
project=input.required<Project>();
close=output<void>();
readonly favorites=this.service.favorites;
@HostListener('document:keydown.escape')escape(){this.close.emit()}
favorite(){this.service.toggleFavorite(this.project().id)}
}
