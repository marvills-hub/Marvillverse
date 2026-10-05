import{Component,computed,inject,output}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
@Component({selector:'app-admin-dashboard',templateUrl:'./admin-dashboard.html',styleUrl:'./admin-dashboard.scss'})
export class AdminDashboard{
private readonly service=inject(ProjectsService);
navigate=output<'projects'|'activity'>();
readonly projects=this.service.projects;
readonly activities=this.service.activities;
readonly active=computed(()=>this.projects().filter(p=>p.status==='Active').length);
readonly building=computed(()=>this.projects().filter(p=>p.status==='Building').length);
readonly avg=computed(()=>{const p=this.projects();return p.length?Math.round(p.reduce((a,x)=>a+x.progress,0)/p.length):0});
readonly tech=computed(()=>new Set(this.projects().flatMap(p=>p.tech)).size);
}
