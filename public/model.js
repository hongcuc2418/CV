export const VERSION='1.0.0';
export const STORAGE_KEY='cv-atelier:v1';
export const defaults={schemaVersion:1,profile:{name:'Nông Thị Hồng Cúc',role:'Chuyên viên Phòng Đào tạo',eyebrow:'HỒ SƠ ỨNG TUYỂN',tagline:'Kết nối nghiệp vụ đào tạo\nvới công nghệ.',summary:'Có kinh nghiệm làm việc tại ASC từ tháng 12/2022, tham gia các dự án phần mềm cho nhiều cơ sở giáo dục. Mong muốn vận dụng kinh nghiệm phần mềm để hỗ trợ công tác quản lý đào tạo và phục vụ người học.',goal:'Gắn bó với môi trường đại học, phát triển chuyên môn trong công tác đào tạo và góp phần nâng cao hiệu quả vận hành, chất lượng hỗ trợ giảng viên, sinh viên.',phone:'',email:'',address:'',photo:'',photoY:50},experiences:[{company:'ASC',role:'Mảng phần mềm quản lý đào tạo',period:'12/12/2022 – Nay',description:'Kinh nghiệm tại các dự án phần mềm dành cho cơ sở giáo dục.',bullets:['Tiếp nhận, tổng hợp yêu cầu nghiệp vụ đào tạo từ các đơn vị sử dụng phần mềm.','Phối hợp kiểm tra dữ liệu và rà soát chức năng phục vụ công tác quản lý đào tạo.','Hướng dẫn sử dụng hệ thống, hỗ trợ giải đáp và theo dõi các vướng mắc phát sinh.','Phối hợp các bộ phận để cập nhật, hoàn thiện chức năng theo nhu cầu thực tế.']},{company:'Phần mềm HRM',role:'Mảng phần mềm quản trị nhân sự',period:'8 tháng',description:'Kinh nghiệm làm việc với phần mềm quản trị nhân sự.',bullets:[]}],institutions:['VLU','NTT','DNTU','NDUN','HNIVC','HDIU','TLU','IUH'],education:[{school:'',major:'',period:'',detail:''}],skills:['Công tác đào tạo','Hỗ trợ nghiệp vụ học vụ','Ứng dụng công nghệ trong quản lý'],certificates:[],design:{theme:'navy',font:'editorial',showInstitutions:true,showEducation:true,showSkills:true,showCertificates:true,showGoal:true,draft:true}};
export const clone=x=>JSON.parse(JSON.stringify(x));
export const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const string=(v,max=6000)=>{if(typeof v!=='string'||v.length>max)throw Error('Một trường văn bản không hợp lệ hoặc quá dài.');return v;};
const strings=(v,max=40)=>{if(!Array.isArray(v)||v.length>max)throw Error('Danh sách không hợp lệ hoặc quá nhiều mục.');return v.map(x=>string(x,6000));};
export function validateData(raw){
if(!raw||raw.schemaVersion!==1)throw Error('Tệp không đúng định dạng CV Atelier v1.');
const p=raw.profile,d=raw.design;
if(!p||!d)throw Error('Tệp thiếu thông tin hồ sơ hoặc thiết kế.');
const profile={};for(const key of ['name','role','eyebrow','tagline','summary','goal','phone','email','address'])profile[key]=string(p[key]);
profile.photo=string(p.photo,2000000);if(profile.photo&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(profile.photo))throw Error('Ảnh không hợp lệ. Chỉ hỗ trợ JPEG, PNG, WebP.');
if(!Number.isFinite(p.photoY)||p.photoY<0||p.photoY>100)throw Error('Vị trí ảnh không hợp lệ.');profile.photoY=p.photoY;
if(!Array.isArray(raw.experiences)||raw.experiences.length>20)throw Error('Tối đa 20 mục kinh nghiệm.');
const experiences=raw.experiences.map(e=>({company:string(e.company),role:string(e.role),period:string(e.period),description:string(e.description),bullets:strings(e.bullets)}));
if(!Array.isArray(raw.education)||raw.education.length>15)throw Error('Tối đa 15 mục học vấn.');
const education=raw.education.map(e=>({school:string(e.school),major:string(e.major),period:string(e.period),detail:string(e.detail)}));
if(!['navy','forest','burgundy'].includes(d.theme)||!['editorial','modern'].includes(d.font))throw Error('Thiết kế không hợp lệ.');
const design={theme:d.theme,font:d.font};for(const k of ['showInstitutions','showEducation','showSkills','showCertificates','showGoal','draft']){if(typeof d[k]!=='boolean')throw Error('Tùy chọn hiển thị không hợp lệ.');design[k]=d[k];}
return {schemaVersion:1,profile,experiences,education,institutions:strings(raw.institutions),skills:strings(raw.skills),certificates:strings(raw.certificates),design};
}
export function setPath(obj,path,value){const parts=path.split('.');if(parts.some(p=>['__proto__','constructor','prototype'].includes(p)))throw Error('Trường không hợp lệ.');let target=obj;for(const k of parts.slice(0,-1)){if(!Object.hasOwn(target,k))throw Error('Trường không tồn tại.');target=target[k];}const key=parts.at(-1);if(!Object.hasOwn(target,key))throw Error('Trường không tồn tại.');target[key]=value;}
export function safeContact(type,value){if(type==='email')return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)?'mailto:'+value:'';if(type==='phone')return /^\+?[\d\s().-]{6,30}$/.test(value)?'tel:'+value.replace(/[^\d+]/g,''):'';return '';}
