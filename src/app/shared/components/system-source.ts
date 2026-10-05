import{Component,inject}from'@angular/core';
import{ProjectsService}from'../../core/services/projects.service';
@Component({
selector:'app-system-source',
templateUrl:'./system-source.html',
styleUrl:'./system-source.scss'
})
export class SystemSource{
readonly service=inject(ProjectsService);
}
