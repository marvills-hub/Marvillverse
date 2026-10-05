import{Component,computed,inject,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ProjectsService}from'../../../../core/services/projects.service';
import{AdminService}from'../../../../core/services/admin.service';
type ActivityType='Release'|'Development'|'Milestone'|'Update'|'Launch';
interface ActivityItem{
id?:number|string;
project_id:string;
project_name?:string;
type:ActivityType;
title:string;
description:string;
date:string;
version?:string;
}
@Component({
selector:'app-admin-activity',
imports:[FormsModule],
templateUrl:'./admin-activity.html',
styleUrl:'./admin-activity.scss'
})
export class AdminActivity{
readonly projects=inject(ProjectsService);
private readonly auth=inject(AdminService);
readonly items=signal<ActivityItem[]>([]);
readonly loading=signal(true);
readonly modal=signal(false);
readonly saving=signal(false);
readonly deleting=signal<string|number|null>(null);
readonly search=signal('');
readonly project=signal('All');
readonly type=signal<'All'|ActivityType>('All');
readonly types:ActivityType[]=['Release','Development','Milestone','Update','Launch'];
readonly form=signal<ActivityItem>(this.blank());
readonly filtered=computed(()=>{
const q=this.search().trim().toLowerCase();
return this.items()
.filter(x=>this.project()==='All'||x.project_id===this.project())
.filter(x=>this.type()==='All'||x.type===this.type())
.filter(x=>!q||
x.title.toLowerCase().includes(q)||
x.description.toLowerCase().includes(q)||
(x.project_name||'').toLowerCase().includes(q)||
(x.version||'').toLowerCase().includes(q))
.sort((a,b)=>b.date.localeCompare(a.date));
});
readonly releases=computed(()=>this.items().filter(x=>x.type==='Release').length);
readonly milestones=computed(()=>this.items().filter(x=>x.type==='Milestone').length);
constructor(){this.load()}
blank():ActivityItem{
return{
project_id:this.projects.projects()[0]?.id||'',
type:'Development',
title:'',
description:'',
date:new Date().toISOString().slice(0,10),
version:''
};
}
async load(){
this.loading.set(true);
try{
const r=await fetch('/api/activity');
if(!r.ok)throw new Error();
const data:any=await r.json();
const list=Array.isArray(data)?data:Array.isArray(data.activities)?data.activities:[];
this.items.set(list.map((x:any)=>({
id:x.id,
project_id:x.project_id||x.projectId||'',
project_name:x.project_name||x.projectName||this.projectName(x.project_id||x.projectId),
type:this.normalizeType(x.type),
title:x.title||'Untitled activity',
description:x.description||'',
date:(x.date||x.created_at||x.createdAt||'').slice(0,10),
version:x.version||''
})));
}catch{
this.items.set([]);
}finally{
this.loading.set(false);
}
}
normalizeType(v:string):ActivityType{
const value=(v||'').toLowerCase();
if(value==='release')return'Release';
if(value==='milestone')return'Milestone';
if(value==='update')return'Update';
if(value==='launch')return'Launch';
return'Development';
}
projectName(id:string){
return this.projects.projects().find(p=>p.id===id)?.name||id||'MarvillVerse';
}
projectAccent(id:string){
return this.projects.projects().find(p=>p.id===id)?.accent||'#735cff';
}
open(){
this.form.set(this.blank());
this.modal.set(true);
}
reset(){
this.search.set('');
this.project.set('All');
this.type.set('All');
}
async save(){
const f=this.form();
if(!f.project_id||!f.title.trim()||!f.date)return;
this.saving.set(true);
try{
const r=await fetch('/api/admin/activity',{
method:'POST',
headers:this.auth.headers(),
body:JSON.stringify({
project_id:f.project_id,
type:f.type,
title:f.title.trim(),
description:f.description.trim(),
date:f.date,
version:f.version?.trim()||''
})
});
if(!r.ok){
const x:any=await r.json().catch(()=>({}));
throw new Error(x.error||'Unable to create activity.');
}
this.modal.set(false);
await this.load();
}catch(e:any){
alert(e.message||'Unable to create activity.');
}finally{
this.saving.set(false);
}
}
async remove(item:ActivityItem){
if(item.id===undefined)return;
if(!confirm(`Delete "${item.title}" from the activity registry?`))return;
this.deleting.set(item.id);
try{
const r=await fetch('/api/admin/activity/'+encodeURIComponent(String(item.id)),{
method:'DELETE',
headers:this.auth.headers()
});
if(!r.ok)throw new Error();
await this.load();
}catch{
alert('Unable to delete activity.');
}finally{
this.deleting.set(null);
}
}
}
