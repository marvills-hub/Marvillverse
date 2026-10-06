import{Injectable,computed,signal}from'@angular/core';
import{Project,ProjectActivity}from'../models/project';

@Injectable({providedIn:'root'})
export class ProjectsService{
readonly loading=signal(true);
readonly source=signal<'cloud'|'local'>('local');
readonly favorites=signal<Set<string>>(this.loadFavorites());

private readonly fallbackProjects:Project[]=[
{id:'veylith',projectKind:'tool',name:'Veylith',tagline:'Autonomous Development System',description:'A cloud-based autonomous engineering system designed to plan, build, test and continuously develop software.',category:'AI',status:'Building',platforms:['Cloud','Web'],tech:['AI','Node','Git'],monogram:'V',accent:'#ff4057',progress:68,version:'0.9.0',updated:'2026-09-27',started:'2026-09',featured:true,vision:'An autonomous engineering environment capable of continuously transforming ideas into working software.',capabilities:['Autonomous planning','Code generation','Build & test cycles','Git operations','Live monitoring'],github:'https://github.com/marvills-hub/veylith'},
{id:'zevryth',projectKind:'tool',name:'Zevryth',tagline:'AI Image Generation',description:'An intelligent image generation platform focused on turning ideas into high-quality visual creations.',category:'AI',status:'Building',platforms:['Web'],tech:['Angular','AI','Ollama'],monogram:'Z',accent:'#9b6cff',progress:42,version:'0.1.0',updated:'2026-09-26',started:'2026-09',featured:true,vision:'A visual intelligence system built to transform imagination into generated imagery and eventually motion.',capabilities:['Image generation','Prompt workspace','Local AI','Generation history','Future animation']},
{id:'lexyra',projectKind:'tool',name:'Lexyra',tagline:'Universal Text Engine',description:'An offline-first text utility with more than a hundred tools for transforming, formatting, generating and processing text.',category:'Productivity',status:'Active',platforms:['Web','Desktop'],tech:['Angular','AI'],monogram:'L',accent:'#438cff',progress:78,version:'0.4.0',updated:'2026-09-29',started:'2026-09',featured:true,vision:'One powerful environment for manipulating virtually any kind of text with or without artificial intelligence.',capabilities:['138+ text tools','Offline processing','Formatting engine','Converters','Optional AI']},
{id:'notiva',projectKind:'tool',name:'Notiva',tagline:'Visual Notes & Ideas',description:'A cross-platform visual workspace for notes, ideas, reminders, calendars and creative thinking on an infinite canvas.',category:'Productivity',status:'Building',platforms:['Web','Desktop','Mobile'],tech:['Angular','Tauri','Capacitor'],monogram:'N',accent:'#e8a86b',progress:74,version:'0.7.0',updated:'2026-09-19',started:'2026-08',vision:'A tactile digital space where thoughts can be arranged visually instead of being trapped inside conventional documents.',capabilities:['Infinite boards','Visual notes','Rich editor','Calendar notes','Cross-platform'],website:'https://notiva-b07f7.web.app/'},
{id:'notificator',projectKind:'tool',name:'Notificator',tagline:'Unified Notification Center',description:'A desktop notification aggregator bringing important communication from multiple services into one focused experience.',category:'Productivity',status:'Building',platforms:['Desktop'],tech:['Angular','Tauri','Cloudflare'],monogram:'N',accent:'#42d9a5',progress:61,version:'0.6.0',updated:'2026-09-06',started:'2026-08',vision:'One intelligent notification layer that keeps important communication visible without forcing users between applications.',capabilities:['Gmail integration','Floating widget','Urgent alerts','Multi-account','Cloud sync'],github:'https://github.com/marvills-hub/notificator'},
{id:'manager',projectKind:'tool',name:'Marvills Manager',tagline:'Project Management Platform',description:'A multi-workspace project management system for projects, tasks, clients, meetings, notes, diagrams and reporting.',category:'Platform',status:'Active',platforms:['Web'],tech:['Angular','Firebase'],monogram:'M',accent:'#ffb84d',progress:82,version:'1.0.0',updated:'2026-09-01',started:'2025',vision:'A unified workspace for managing the complete lifecycle of projects, teams, clients and everyday work.',capabilities:['Projects & tasks','Client management','Meetings','Time tracking','Reports']},
{id:'ceonix',projectKind:'common',name:'Ceonix',tagline:'CEOSI Internal Super-App',description:'An internal employee platform combining communication, voting, meal decisions and expandable company tools.',category:'Internal',status:'Building',platforms:['Web','Desktop','Mobile'],tech:['Angular','Tauri','Capacitor'],monogram:'C',accent:'#39c7ff',progress:34,version:'0.1.0',updated:'2026-10-03',started:'2026-10',vision:'A single internal digital home for everyday collaboration and employee tools across CEOSI.',capabilities:['Team chat','Polls & voting','Meal decisions','Internal tools','Multi-platform']}
];

private readonly fallbackActivities:ProjectActivity[]=[
{projectId:'ceonix',date:'2026-10-03',title:'Ceonix enters development',description:'Initial multi-platform internal application foundation established.',type:'Milestone'},
{projectId:'lexyra',date:'2026-09-29',title:'138 tools registered',description:'Lexyra tool registry reached 138 verified text utilities.',type:'Milestone'},
{projectId:'veylith',date:'2026-09-27',title:'Autonomous runtime online',description:'Persistent job runtime and autonomous development pipeline progressed.',type:'Development'},
{projectId:'zevryth',date:'2026-09-26',title:'Local AI direction',description:'Image generation architecture moved toward local Ollama-powered workflows.',type:'Development'},
{projectId:'notiva',date:'2026-09-19',title:'Visual editor expanded',description:'Board, notes, calendar and rich text editing continued evolving.',type:'Development'},
{projectId:'notificator',date:'2026-09-06',title:'Gmail restore operational',description:'Gmail connection and restoration flow became operational.',type:'Milestone'}
];

readonly projects=signal<Project[]>(this.fallbackProjects);
readonly activities=signal<ProjectActivity[]>(this.fallbackActivities);
readonly count=computed(()=>this.projects().length);

constructor(){this.refresh()}

async refresh(){
this.loading.set(true);
try{
const [projects,activities]=await Promise.all([
fetch('/api/projects'),
fetch('/api/activities')
]);
if(!projects.ok||!activities.ok)throw new Error();
this.projects.set(await projects.json() as Project[]);
const raw=await activities.json() as any[];
this.activities.set(raw.map(a=>({
projectId:a.project_id,
date:a.date,
title:a.title,
description:a.description,
type:a.type
})));
this.source.set('cloud');
}catch{
this.projects.set(this.fallbackProjects);
this.activities.set(this.fallbackActivities);
this.source.set('local');
}finally{
this.loading.set(false);
}
}

private loadFavorites(){
try{return new Set<string>(JSON.parse(localStorage.getItem('marvillverse-favorites')||'[]'))}
catch{return new Set<string>()}
}

toggleFavorite(id:string){
const next=new Set(this.favorites());
next.has(id)?next.delete(id):next.add(id);
this.favorites.set(next);
localStorage.setItem('marvillverse-favorites',JSON.stringify([...next]));
}

isFavorite(id:string){return this.favorites().has(id)}
}

