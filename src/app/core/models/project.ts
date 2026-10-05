export type ProjectStatus='Active'|'Building'|'Planned';
export type ProjectCategory='All'|'AI'|'Productivity'|'Platform'|'Internal';
export interface Project{
id:string;
name:string;
tagline:string;
description:string;
category:Exclude<ProjectCategory,'All'>;
status:ProjectStatus;
platforms:string[];
tech:string[];
monogram:string;
accent:string;
progress:number;
version:string;
updated:string;
started:string;
featured?:boolean;
vision:string;
capabilities:string[];
github?:string;
website?:string;
}
export interface ProjectActivity{
id?:number;
projectId:string;
date:string;
title:string;
description:string;
type:'Release'|'Development'|'Milestone';
}
