import{Component,computed,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ProjectsService}from'../../core/services/projects.service';
import{AdminService}from'../../core/services/admin.service';
import{AdminDashboard}from'./components/admin-dashboard/admin-dashboard';
import{AdminProjects}from'./components/admin-projects/admin-projects';
import{AdminActivity}from'./components/admin-activity/admin-activity';
@Component({
selector:'app-admin',
imports:[FormsModule,AdminDashboard,AdminProjects,AdminActivity],
templateUrl:'./admin.html',
styleUrl:'./admin.scss'
})
export class Admin implements OnInit{
readonly projects=inject(ProjectsService);
readonly auth=inject(AdminService);
readonly section=signal<'dashboard'|'projects'|'activity'>('dashboard');
readonly loginToken=signal('');
readonly checking=signal(true);
readonly error=signal(false);
readonly title=computed(()=>this.section()==='dashboard'?'CONTROL CENTER':this.section()==='projects'?'PROJECT REGISTRY':'ACTIVITY LOG');
async ngOnInit(){
await this.auth.verify();
this.checking.set(false);
}
async login(){
this.error.set(false);
this.auth.setToken(this.loginToken());
if(!await this.auth.verify())this.error.set(true);
}
logout(){this.auth.clear();this.loginToken.set('')}
}
