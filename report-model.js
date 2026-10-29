export const SCHEMA='field-report';
export const fields=['reference','date','customer','location','device','serial','technician','counter','issue','diagnosis','work','labor','travel','outcome','next','representative'];
export const checks=['tested','briefed','clean'];
export const digits=value=>String(value??'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
export function number(value){const text=digits(value).replace(/[,٬\s]/g,'').replace('٫','.');return text!==''&&/^\d+(?:\.\d+)?$/.test(text)?Number(text):NaN;}
export const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function blankReport(now=new Date()){
 const pad=x=>String(x).padStart(2,'0'),date=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
 return Object.assign(Object.fromEntries(fields.map(k=>[k,''])),{reference:'FR-'+date.replaceAll('-','')+'-'+pad(now.getHours())+pad(now.getMinutes()),date,outcome:'resolved',parts:[],tested:false,briefed:false,clean:false,isSample:false});
}
export function sampleReport(now=new Date(),lang='en'){
 const report={...blankReport(now),isSample:true,customer:'Northside Studio',location:'Montréal, QC',device:'Konica Minolta bizhub C360i',serial:'DEMO-0360',technician:'Alireza Rajabi',counter:'160280',issue:'Intermittent paper misfeeds from tray 2.',diagnosis:'Feed rollers showed visible wear. The paper guides did not match the loaded stock.',work:'Cleaned the pickup area and replaced the worn feed rollers. Adjusted the paper guides to the loaded stock.\nCompleted a 50-page feed test with no misfeeds.',parts:[{name:'Feed roller kit',reference:'',quantity:'1'},{name:'Cleaning materials',reference:'',quantity:'1'}],labor:'1.5',travel:'30',outcome:'resolved',next:'Use consistent paper stock and check the tray guides when reloading.',tested:true,briefed:true,clean:true,representative:'Jamie Morgan'};
 if(lang==='fa')Object.assign(report,{customer:'استودیوی آفتاب',location:'مونترآل، کبک',device:'کونیکا مینولتا بیزهاب C360i',serial:'نمونه-۰۳۶۰',technician:'علیرضا رجبی',issue:'کاغذ از سینی دوم گاهی درست تغذیه نمی‌شود.',diagnosis:'غلطک‌های کاغذکش فرسوده بودند و راهنماهای سینی با اندازهٔ کاغذ مطابقت نداشتند.',work:'بخش کاغذکش تمیز و غلطک‌های فرسوده تعویض شدند. راهنماهای سینی با اندازهٔ کاغذ تنظیم شدند.\nتست تغذیه با ۵۰ برگ انجام شد و گیرکردن کاغذ مشاهده نشد.',parts:[{name:'کیت غلطک کاغذکش',reference:'',quantity:'1'},{name:'مواد تمیزکننده',reference:'',quantity:'1'}],next:'از کاغذ یکنواخت استفاده شود و هنگام بارگذاری، راهنماهای سینی بررسی شوند.',representative:'آرش مرادی'});
 return report;
}
export function localizeSample(report,lang){
 if(!report.isSample)return report;
 const en=sampleReport(),fa=sampleReport(new Date(),'fa'),target=lang==='fa'?fa:en,result={...report};
 for(const field of ['customer','location','device','serial','technician','issue','diagnosis','work','next','representative'])if(report[field]===en[field]||report[field]===fa[field])result[field]=target[field];
 result.parts=report.parts.map(part=>{const i=en.parts.findIndex((p,n)=>part.name===p.name||part.name===fa.parts[n].name);return i<0?{...part}:{...part,name:target.parts[i].name};});
 return result;
}
export function validate(report){
 const errors=[];
 for(const field of ['customer','device','technician','work'])if(!String(report[field]||'').trim())errors.push(field);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(report.date)||Number.isNaN(Date.parse(report.date))||new Date(report.date+'T12:00:00Z').toISOString().slice(0,10)!==report.date)errors.push('date');
 for(const field of ['labor','travel','counter'])if(report[field].trim()&&(!Number.isFinite(number(report[field]))||(field!=='labor'&&!Number.isInteger(number(report[field])))))errors.push(field);
 report.parts.forEach((part,i)=>{if(part.name.trim()||part.reference.trim()){if(!part.name.trim())errors.push(`part:${i}:name`);if(!Number.isInteger(number(part.quantity))||number(part.quantity)<1||number(part.quantity)>999)errors.push(`part:${i}:quantity`);}});
 return errors;
}
export function toFile(report){return JSON.stringify({schema:SCHEMA,version:1,report},null,2);}
export function fromFile(text){
 if(typeof text!=='string'||text.length>500000)throw Error('Invalid file size');
 const value=JSON.parse(text);if(value.schema!==SCHEMA||value.version!==1||!value.report||typeof value.report!=='object')throw Error('Not a Field Report draft');
 const input=value.report,result=blankReport();
 for(const field of fields){if(typeof input[field]!=='string'||input[field].length>5000)throw Error('Invalid report field');result[field]=input[field];}
 if(!['resolved','followup','parts'].includes(input.outcome))throw Error('Invalid outcome');
 if(!Array.isArray(input.parts)||input.parts.length>30)throw Error('Invalid parts');
 result.parts=input.parts.map(p=>{if(!p||typeof p!=='object')throw Error('Invalid part');const part={};for(const key of ['name','reference','quantity']){if(typeof p[key]!=='string'||p[key].length>300)throw Error('Invalid part field');part[key]=p[key];}return part;});
 for(const field of checks)result[field]=input[field]===true;
 result.isSample=input.isSample===true;
 return result;
}
export function fileName(report){return (report.reference||'field-report').replace(/[^\p{L}\p{N}._-]/gu,'-').slice(0,80)+'.json';}
