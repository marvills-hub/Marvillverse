import{Component,computed,inject,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{Project,ProjectCategory,ProjectStatus}from'../../../../core/models/project';
import{ProjectsService}from'../../../../core/services/projects.service';
import{AdminService}from'../../../../core/services/admin.service';
import{AdminProjectEditor}from'../admin-project-editor/admin-project-editor';
@Component({
selector:'app-admin-projects',
imports:[FormsModule,AdminProjectEditor],
templateUrl:'./admin-projects.html',
styleUrl:'./admin-projects.scss'
})
export class AdminProjects{
readonly service=inject(ProjectsService);
private readonly auth=inject(AdminService);
readonly editor=signal(false);
readonly selected=signal<Project|null>(null);
readonly busy=signal('');
readonly search=signal('');
readonly status=signal<'All'|ProjectStatus>('All');
readonly category=signal<ProjectCategory>('All');
readonly sort=signal<'order'|'name'|'progress-desc'|'progress-asc'|'updated'>('order');
readonly statuses:['All',ProjectStatus,ProjectStatus,ProjectStatus]=['All','Active','Building','Planned'];
readonly categories:ProjectCategory[]=['All','AI','Productivity','Platform','Internal'];
readonly filtered=computed(()=>{
let list=[...this.service.projects()];
const q=this.search().trim().toLowerCase();
if(q)list=list.filter(p=>
p.name.toLowerCase().includes(q)||
p.tagline.toLowerCase().includes(q)||
p.description.toLowerCase().includes(q)||
p.tech.some(t=>t.toLowerCase().includes(q))||
p.platforms.some(x=>x.toLowerCase().includes(q))
);
if(this.status()!=='All')list=list.filter(p=>p.status===this.status());
if(this.category()!=='All')list=list.filter(p=>p.category===this.category());
switch(this.sort()){
case'name':return list.sort((a,b)=>a.name.localeCompare(b.name));
case'progress-desc':return list.sort((a,b)=>b.progress-a.progress);
case'progress-asc':return list.sort((a,b)=>a.progress-b.progress);
case'updated':return list.sort((a,b)=>b.updated.localeCompare(a.updated));
default:return list;
}
});
readonly active=computed(()=>this.service.projects().filter(p=>p.status==='Active').length);
readonly building=computed(()=>this.service.projects().filter(p=>p.status==='Building').length);
readonly featured=computed(()=>this.service.projects().filter(p=>p.featured).length);
readonly average=computed(()=>{
const list=this.service.projects();
return list.length?Math.round(list.reduce((a,p)=>a+p.progress,0)/list.length):0;
});
create(){this.selected.set(null);this.editor.set(true)}
edit(p:Project){this.selected.set(p);this.editor.set(true)}
reset(){
this.search.set('');
this.status.set('All');
this.category.set('All');
this.sort.set('order');
}
async duplicate(p:Project){
const copy:Project={
...structuredClone(p),
id:`${p.id}-copy`,
name:`${p.name} Copy`,
status:'Planned',
progress:0,
version:'0.1.0',
updated:new Date().toISOString().slice(0,10),
featured:false
};
this.selected.set(copy);
this.editor.set(true);
}
async remove(p:Project){
const answer=prompt(`Type "${p.name}" to permanently delete this project and its activity history.`);
if(answer!==p.name)return;
this.busy.set(p.id);
try{
const r=await fetch('/api/admin/projects/'+encodeURIComponent(p.id),{
method:'DELETE',
headers:this.auth.headers()
});
if(!r.ok)throw new Error();
await this.service.refresh();
}catch{
alert('Unable to delete project.');
}finally{
this.busy.set('');
}
}
async saved(){
this.editor.set(false);
this.selected.set(null);
await this.service.refresh();
}
open(url?:string){
if(url)window.open(url,'_blank','noopener,noreferrer');
}
}
