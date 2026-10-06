interface Env{
DB:D1Database;
ASSETS:Fetcher;
ADMIN_TOKEN:string;
}

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{
status,
headers:{'content-type':'application/json;charset=UTF-8','cache-control':'no-store'}
});

const parseProject=(row:any)=>({
id:row.id,
name:row.name,
tagline:row.tagline,
description:row.description,
category:row.category,
status:row.status,
projectKind:row.project_kind||'tool',
platforms:JSON.parse(row.platforms||'[]'),
tech:JSON.parse(row.tech||'[]'),
monogram:row.monogram,
accent:row.accent,
progress:row.progress,
version:row.version,
updated:row.updated,
started:row.started,
featured:!!row.featured,
vision:row.vision,
capabilities:JSON.parse(row.capabilities||'[]'),
github:row.github||undefined,
website:row.website||undefined,
sourceUrl:row.source_url||undefined,
windowsUrl:row.windows_url||undefined,
androidUrl:row.android_url||undefined,
iosUrl:row.ios_url||undefined
});

const authorized=(request:Request,env:Env)=>{
const supplied=request.headers.get('x-marvillverse-admin')||'';
return !!env.ADMIN_TOKEN&&supplied===env.ADMIN_TOKEN;
};

const validProject=(p:any)=>{
return p&&
typeof p.id==='string'&&/^[a-z0-9-]+$/.test(p.id)&&
typeof p.name==='string'&&p.name.trim()&&
typeof p.tagline==='string'&&p.tagline.trim()&&
['AI','Productivity','Platform','Internal'].includes(p.category)&&
['Active','Building','Planned'].includes(p.status);
};

export default{
async fetch(request:Request,env:Env):Promise<Response>{
const url=new URL(request.url);

if(url.pathname==='/api/health'){
return json({ok:true,service:'MarvillVerse',database:'D1',time:new Date().toISOString()});
}

if(url.pathname==='/api/projects'&&request.method==='GET'){
const result=await env.DB.prepare('SELECT * FROM projects ORDER BY sort_order ASC,name ASC').all();
return json(result.results.map(parseProject));
}

if(url.pathname==='/api/activities'&&request.method==='GET'){
const result=await env.DB.prepare('SELECT * FROM activities ORDER BY date DESC,id DESC').all();
return json(result.results);
}

if(url.pathname==='/api/admin/verify'&&request.method==='GET'){
return authorized(request,env)?json({ok:true}):json({error:'Unauthorized'},401);
}

if(url.pathname.startsWith('/api/admin/')&&!authorized(request,env)){
return json({error:'Unauthorized'},401);
}

if(url.pathname==='/api/admin/projects'&&request.method==='POST'){
const p:any=await request.json();
if(!validProject(p))return json({error:'Invalid project data'},400);
const exists=await env.DB.prepare('SELECT id FROM projects WHERE id=?').bind(p.id).first();
if(exists)return json({error:'Project ID already exists'},409);
const order:any=await env.DB.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM projects').first();
await env.DB.prepare(`INSERT INTO projects(id,name,tagline,description,category,status,platforms,tech,monogram,accent,progress,version,updated,started,featured,vision,capabilities,github,website,sort_order,project_kind,source_url,windows_url,android_url,ios_url)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
p.id,p.name,p.tagline,p.description||'',p.category,p.status,
JSON.stringify(p.platforms||[]),JSON.stringify(p.tech||[]),p.monogram||p.name[0],
p.accent||'#735cff',Number(p.progress)||0,p.version||'0.1.0',p.updated||new Date().toISOString().slice(0,10),
p.started||'',p.featured?1:0,p.vision||'',JSON.stringify(p.capabilities||[]),
p.github||null,p.website||null,order?.next||1,p.projectKind||'tool',p.sourceUrl||null,p.windowsUrl||null,p.androidUrl||null,p.iosUrl||null
).run();
return json({ok:true},201);
}

const projectMatch=url.pathname.match(/^\/api\/admin\/projects\/([^/]+)$/);

if(projectMatch&&request.method==='PUT'){
const oldId=decodeURIComponent(projectMatch[1]);
const p:any=await request.json();
if(!validProject(p))return json({error:'Invalid project data'},400);
await env.DB.prepare(`UPDATE projects SET name=?,tagline=?,description=?,category=?,status=?,platforms=?,tech=?,monogram=?,accent=?,progress=?,version=?,updated=?,started=?,featured=?,vision=?,capabilities=?,github=?,website=?,project_kind=?,source_url=?,windows_url=?,android_url=?,ios_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(
p.name,p.tagline,p.description||'',p.category,p.status,
JSON.stringify(p.platforms||[]),JSON.stringify(p.tech||[]),p.monogram||p.name[0],
p.accent||'#735cff',Number(p.progress)||0,p.version||'0.1.0',p.updated||new Date().toISOString().slice(0,10),
p.started||'',p.featured?1:0,p.vision||'',JSON.stringify(p.capabilities||[]),
p.github||null,p.website||null,p.projectKind||'tool',p.sourceUrl||null,p.windowsUrl||null,p.androidUrl||null,p.iosUrl||null,oldId
).run();
return json({ok:true});
}

if(projectMatch&&request.method==='DELETE'){
const id=decodeURIComponent(projectMatch[1]);
await env.DB.prepare('DELETE FROM activities WHERE project_id=?').bind(id).run();
await env.DB.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
return json({ok:true});
}

if(url.pathname==='/api/admin/activities'&&request.method==='POST'){
const a:any=await request.json();
if(!a.projectId||!a.title||!a.date||!['Release','Development','Milestone'].includes(a.type))return json({error:'Invalid activity data'},400);
await env.DB.prepare('INSERT INTO activities(project_id,date,title,description,type) VALUES(?,?,?,?,?)')
.bind(a.projectId,a.date,a.title,a.description||'',a.type).run();
return json({ok:true},201);
}

const activityMatch=url.pathname.match(/^\/api\/admin\/activities\/(\d+)$/);
if(activityMatch&&request.method==='DELETE'){
await env.DB.prepare('DELETE FROM activities WHERE id=?').bind(Number(activityMatch[1])).run();
return json({ok:true});
}

if(url.pathname.startsWith('/api/'))return json({error:'Not found'},404);
return env.ASSETS.fetch(request);
}
} satisfies ExportedHandler<Env>;

