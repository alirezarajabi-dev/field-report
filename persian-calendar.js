import {months,weekdays,persianDigits,persianParts,monthGrid,formatVisitDate,shiftMonth} from './persian-date.js?v=1';
const todayISO=()=>{const now=new Date(),pad=n=>String(n).padStart(2,'0');return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;};
export function createPersianCalendar({input,trigger,dialog,onSelect}){
 const monthSelect=dialog.querySelector('#calendar-month'),yearSelect=dialog.querySelector('#calendar-year'),body=dialog.querySelector('#calendar-days'),table=dialog.querySelector('table');
 let current=persianParts(input.value)||persianParts(todayISO());
 monthSelect.innerHTML=months.map((name,i)=>`<option value="${i+1}">${name}</option>`).join('');
 dialog.querySelector('#calendar-weekdays').innerHTML=weekdays.map(name=>`<th scope="col"><abbr title="${name}">${name.slice(0,1)}</abbr></th>`).join('');
 function render(){
  monthSelect.value=String(current.month);
  const years=[...new Set([...Array.from({length:201},(_,i)=>1300+i),...[-2,-1,0,1,2].map(n=>current.year+n)])].filter(y=>y>0&&y<9378).sort((a,b)=>a-b);
  if(![...yearSelect.options].some(option=>Number(option.value)===current.year))yearSelect.innerHTML=years.map(year=>`<option value="${year}">${persianDigits(year)}</option>`).join('');
  yearSelect.value=String(current.year);
  const cells=monthGrid(current.year,current.month),today=todayISO(),focus=cells.find(c=>c?.iso===input.value)||cells.find(Boolean);
  table.setAttribute('aria-label',months[current.month-1]+' '+persianDigits(current.year));
  body.innerHTML=Array.from({length:cells.length/7},(_,row)=>'<tr>'+cells.slice(row*7,row*7+7).map(cell=>cell?`<td><button type="button" data-date="${cell.iso}" class="calendar-day${cell.iso===input.value?' selected':''}${cell.iso===today?' today':''}" tabindex="${cell.iso===focus.iso?'0':'-1'}" aria-label="${persianDigits(cell.day)} ${months[current.month-1]} ${persianDigits(current.year)}"${cell.iso===today?' aria-current="date"':''}>${persianDigits(cell.day)}</button></td>`:'<td></td>').join('')+'</tr>').join('');
 }
 function sync(){trigger.querySelector('span').textContent=input.value?formatVisitDate(input.value,'fa'):'انتخاب تاریخ شمسی';}
 function open(){current=persianParts(input.value)||persianParts(todayISO());render();dialog.showModal();body.querySelector('[tabindex="0"]')?.focus({preventScroll:true});}
 function choose(iso){onSelect(iso);sync();dialog.close();}
 trigger.addEventListener('click',open);
 dialog.addEventListener('close',()=>trigger.focus({preventScroll:true}));
 monthSelect.addEventListener('change',()=>{current.month=Number(monthSelect.value);render();});
 yearSelect.addEventListener('change',()=>{current.year=Number(yearSelect.value);render();});
 for(const [selector,delta] of [['#calendar-prev',-1],['#calendar-next',1]])dialog.querySelector(selector).addEventListener('click',()=>{current=shiftMonth(current.year,current.month,delta);render();});
 body.addEventListener('click',event=>{const button=event.target.closest('[data-date]');if(button)choose(button.dataset.date);});
 body.addEventListener('keydown',event=>{
  const button=event.target.closest('[data-date]');if(!button)return;
  const delta={ArrowLeft:1,ArrowRight:-1,ArrowDown:7,ArrowUp:-7}[event.key];
  if(delta!==undefined){event.preventDefault();const iso=new Date(Date.parse(button.dataset.date+'T12:00:00Z')+delta*86400000).toISOString().slice(0,10);current=persianParts(iso);render();const next=body.querySelector(`[data-date="${iso}"]`);if(next){for(const day of body.querySelectorAll('button'))day.tabIndex=day===next?0:-1;next.focus();}}
  else if(['PageUp','PageDown'].includes(event.key)){event.preventDefault();current=shiftMonth(current.year,current.month,event.key==='PageUp'?-1:1);render();body.querySelector('[tabindex="0"]')?.focus();}
 });
 dialog.querySelector('#calendar-today').addEventListener('click',()=>choose(todayISO()));
 dialog.querySelector('#calendar-cancel').addEventListener('click',()=>dialog.close());
 sync();return {sync,open};
}
