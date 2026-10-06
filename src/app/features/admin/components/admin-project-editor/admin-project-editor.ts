import{Component,inject,input,OnInit,output,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{Project}from'../../../../core/models/project';
import{AdminService}from'../../../../core/services/admin.service';
@Component({
selector:'app-admin-project-editor',
imports:[FormsModule],
templateUrl:'./admin-project-editor.html',
styleUrl:'./admin-project-editor.scss'
})
export class AdminProjectEditor implements OnInit{
private readonly auth=inject(AdminService);
project=input<Project|null>(null);
cancel=output<void>();
saved=output<void>();
readonly saving=signal(false);
readonly error=signal('');
form:any={};
readonly isExisting=signal(false);
ngOnInit(){
const p=this.project();
this.isExisting.set(!!p&&!!p.id&&!p.id.endsWith('-copy'));
this.form=p?structuredClone(p):this.blank();
if(p?.id.endsWith('-copy'))this.isExisting.set(false);
}
blank(){
return{
id:'',
name:'',
tagline:'',
description:'',
category:'Productivity',
status:'Building',
projectKind:'tool',
platforms:[],
tech:[],
monogram:'',
accent:'#735cff',
progress:0,
version:'0.1.0',
updated:new Date().toISOString().slice(0,10),
started:new Date().toISOString().slice(0,10),
featured:false,
vision:'',
capabilities:[],
github:'',
website:'',
sourceUrl:'',
windowsUrl:'',
androidUrl:'',
iosUrl:''
};
}
get techText(){return(this.form.tech||[]).join(', ')}
set techText(v:string){this.form.tech=v.split(',').map(x=>x.trim()).filter(Boolean)}
get platformText(){return(this.form.platforms||[]).join(', ')}
set platformText(v:string){this.form.platforms=v.split(',').map(x=>x.trim()).filter(Boolean)}
get capabilityText(){return(this.form.capabilities||[]).join('\n')}
set capabilityText(v:string){this.form.capabilities=v.split('\n').map(x=>x.trim()).filter(Boolean)}
slug(){
if(this.isExisting())return;
this.form.id=(this.form.name||'')
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g,'-')
.replace(/^-+|-+$/g,'');
if(!this.form.monogram&&this.form.name)this.form.monogram=this.form.name.charAt(0).toUpperCase();
}
async save(){
this.error.set('');
this.form.id=(this.form.id||'').trim().toLowerCase();
this.form.name=(this.form.name||'').trim();
this.form.tagline=(this.form.tagline||'').trim();
if(!this.form.id||!this.form.name||!this.form.tagline){
this.error.set('Project ID, name and tagline are required.');
return;
}
if(!/^[a-z0-9-]+$/.test(this.form.id)){
this.error.set('Project ID can only contain lowercase letters, numbers and hyphens.');
return;
}
this.form.progress=Math.max(0,Math.min(100,Number(this.form.progress)||0));
this.form.updated=new Date().toISOString().slice(0,10);
this.form.monogram=(this.form.monogram||this.form.name.charAt(0)).toUpperCase();
this.saving.set(true);
try{
const editing=this.isExisting();
const url=editing?'/api/admin/projects/'+encodeURIComponent(this.project()!.id):'/api/admin/projects';
const r=await fetch(url,{
method:editing?'PUT':'POST',
headers:this.auth.headers(),
body:JSON.stringify(this.form)
});
if(!r.ok){
const x:any=await r.json().catch(()=>({}));
throw new Error(x.error||'Unable to save project.');
}
this.saved.emit();
}catch(e:any){
this.error.set(e.message||'Unable to save project.');
}finally{
this.saving.set(false);
}
}
}

