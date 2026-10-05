import{Component,inject,OnInit,signal}from'@angular/core';
import{ProjectsService}from'../../../../core/services/projects.service';
import{RevealDirective}from'../../../../shared/directives/reveal.directive';
interface ActivityItem{id:number|string;project_id:string;type:string;title:string;description:string;date:string;version?:string}
@Component({
selector:'app-activity-stream',
imports:[RevealDirective],
templateUrl:'./activity-stream.html',
styleUrl:'./activity-stream.scss'
})
export class ActivityStream implements OnInit{
readonly service=inject(ProjectsService);
readonly items=signal<ActivityItem[]>([]);
async ngOnInit(){
try{
const r=await fetch('/api/activity');
if(!r.ok)return;
const x:any=await r.json();
const list=Array.isArray(x)?x:x.activities||[];
this.items.set(list.slice(0,6));
}catch{}
}
name(id:string){return this.service.projects().find(p=>p.id===id)?.name||id}
accent(id:string){return this.service.projects().find(p=>p.id===id)?.accent||'#735cff'}
}
