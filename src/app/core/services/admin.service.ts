import{Injectable,signal}from'@angular/core';
@Injectable({providedIn:'root'})
export class AdminService{
readonly token=signal(sessionStorage.getItem('mv-admin-token')||'');
readonly authorized=signal(false);
setToken(token:string){
this.token.set(token.trim());
sessionStorage.setItem('mv-admin-token',token.trim());
}
clear(){
this.token.set('');
this.authorized.set(false);
sessionStorage.removeItem('mv-admin-token');
}
headers(){
return{
'content-type':'application/json',
'x-marvillverse-admin':this.token()
};
}
async verify(){
if(!this.token()){this.authorized.set(false);return false}
try{
const r=await fetch('/api/admin/verify',{headers:this.headers()});
this.authorized.set(r.ok);
return r.ok;
}catch{
this.authorized.set(false);
return false;
}
}
}
