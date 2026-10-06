export type ProjectStatus='Active'|'Building'|'Planned';
export type ProjectCategory='All'|'AI'|'Productivity'|'Platform'|'Internal';
export type ProjectKind='tool'|'common';
export interface Project{
id:string;
name:string;
tagline:string;
description:string;
category:Exclude<ProjectCategory,'All'>;
status:ProjectStatus;
projectKind:ProjectKind;
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
sourceUrl?:string;
windowsUrl?:string;
androidUrl?:string;
iosUrl?:string;
}
export interface ProjectActivity{
id?:number;
projectId:string;
date:string;
title:string;
description:string;
type:'Release'|'Development'|'Milestone';
}
