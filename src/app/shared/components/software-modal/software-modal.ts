import{Component,input,output}from'@angular/core';
import{Project}from'../../../core/models/project';
@Component({
selector:'app-software-modal',
templateUrl:'./software-modal.html',
styleUrl:'./software-modal.scss'
})
export class SoftwareModal{
project=input.required<Project>();
close=output<void>();
open(url?:string){
if(url)window.open(url,'_blank','noopener,noreferrer');
}
}
