// Abrí la página histórica de una promoción y ejecutá este script en la consola.
// Antes, asegurate de que la tabla muestre TODOS los registros (sin paginación).
(() => {
 const match=location.pathname.match(/egresados-(\d{4})/);
 const year=match?Number(match[1]):Number(prompt('Año de la promoción:'));
 if(!Number.isInteger(year)||year<1900||year>2200)throw new Error('Año inválido');
 const items=[];
 for(const row of document.querySelectorAll('table tbody tr')){
  const cells=[...row.querySelectorAll('td')];
  if(cells.length<5)continue;
  const link=cells[cells.length-1].querySelector('a[href]');
  if(!link)continue;
  const raw=cells[3].textContent.trim().replace(',','.');
  const average=raw===''?null:Number(raw);
  if(average!==null&&(!Number.isFinite(average)||average<0||average>10))throw new Error('Revisá el promedio de '+cells[1].textContent);
  items.push({name:cells[1].textContent.trim(),institute:cells[0].textContent.trim(),document_number:cells[2].textContent.trim(),graduation_year:year,average,certificate_url:link.href,status:'published'});
 }
 if(!items.length)throw new Error('No se encontró una tabla compatible. Exportá desde WordPress o compartí el HTML para adaptar el importador.');
 if(!confirm(`Se exportarán ${items.length} egresados de ${year}. ¿Coincide con el total de la tabla original?`))return;
 for(let start=0;start<items.length;start+=500){
  const blob=new Blob([JSON.stringify(items.slice(start,start+500),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`egresados-${year}-${start/500+1}.json`;a.click();URL.revokeObjectURL(url);
 }
})();
