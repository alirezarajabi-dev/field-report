// Use the browser's ICU/Intl Persian calendar, including its leap-year rules.
// Store dates as ISO to preserve existing draft files across language switches.
const DAY=86400000;
const partsFormatter=new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
export const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
export const weekdays=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
export const persianDigits=value=>String(value).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
export function validISO(iso){return typeof iso==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(iso)&&Number.isFinite(Date.parse(iso+'T12:00:00Z'))&&new Date(iso+'T12:00:00Z').toISOString().slice(0,10)===iso;}
export function persianParts(iso){
 if(!validISO(iso))return null;
 const parts=Object.fromEntries(partsFormatter.formatToParts(new Date(iso+'T12:00:00Z')).filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,Number(p.value)]));
 return parts;
}
export function persianToISO(year,month,day){
 if(!Number.isInteger(year)||year<1||year>9377||!Number.isInteger(month)||month<1||month>12||!Number.isInteger(day)||day<1||day>31)return null;
 let low=Math.floor(Date.UTC(year+621,2,15)/DAY),high=Math.floor(Date.UTC(year+622,2,25)/DAY);
 const key=year*512+month*32+day;
 while(low<=high){const mid=Math.floor((low+high)/2),iso=new Date(mid*DAY).toISOString().slice(0,10),p=persianParts(iso),current=p.year*512+p.month*32+p.day;if(current===key)return iso;if(current<key)low=mid+1;else high=mid-1;}
 return null;
}
export function persianMonthDays(year,month){
 const start=persianToISO(year,month,1),next=persianToISO(month===12?year+1:year,month===12?1:month+1,1);
 return start&&next?Math.round((Date.parse(next+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/DAY):0;
}
export function monthGrid(year,month){
 const first=persianToISO(year,month,1),count=persianMonthDays(year,month);if(!first||!count)return [];
 const offset=(new Date(first+'T12:00:00Z').getUTCDay()+1)%7;
 return Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{const day=i-offset+1;return day<1||day>count?null:{day,iso:new Date(Date.parse(first+'T12:00:00Z')+(day-1)*DAY).toISOString().slice(0,10)};});
}
export function formatVisitDate(iso,lang){
 if(!validISO(iso))return '—';
 return new Intl.DateTimeFormat(lang==='fa'?'fa-IR':'en-CA',{calendar:lang==='fa'?'persian':'gregory',year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z'));
}
export function shiftMonth(year,month,delta){const total=year*12+month-1+delta;return {year:Math.floor(total/12),month:((total%12)+12)%12+1};}
