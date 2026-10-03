(() => {
  const catalog = {
    pitched: {
      label: 'Pitched roof',
      finishes: [
        {id:'coastal', label:'Coastal white + sage', color:'#e9e4d7', image:'pitched-coastal-white-sage.webp', description:'Chalk-white stucco, a sage door, and a light silver metal roof.'},
        {id:'charcoal', label:'Charcoal + cedar', color:'#45443e', image:'pitched-charcoal-cedar.webp', description:'Charcoal siding, a cedar gable and porch, and a graphite metal roof.'},
        {id:'clay', label:'Warm clay + bronze', color:'#b4714e', image:'pitched-warm-clay-bronze.webp', description:'Clay stucco, a muted turquoise door, and a bronze-toned metal roof.'}
      ]
    },
    flat: {
      label:'Flat roof',
      finishes:[
        {id:'coastal', label:'Coastal California', color:'#e9e4d7', image:'coastal-california-signature-exterior.webp', description:'Cream stucco, driftwood tones, and a sage-green door.'},
        {id:'keys', label:'Florida Keys', color:'#91c3c1', image:'florida-keys-signature-exterior.webp', description:'Sea-glass aqua, crisp white trim, and a coral door.'},
        {id:'rural', label:'Rural America', color:'#974a3c', image:'rural-america-signature-exterior.webp', description:'Barn-red walls, ivory trim, and charcoal accents.'},
        {id:'mountain', label:'Colorado Mountains', color:'#344d3d', image:'colorado-mountains-signature-exterior.webp', description:'Forest green, cedar tones, and graphite detailing.'},
        {id:'clay', label:'New Mexico Plains', color:'#b4714e', image:'new-mexico-plains-signature-exterior.webp', description:'Adobe-clay stucco, a turquoise door, and bronze details.'}
      ]
    }
  };
  let currentRoof = 'pitched';
  const rememberedFinish = {pitched:'coastal',flat:'coastal'};
  const finishGroup=document.querySelector('#roof-finishes');
  const roofImage=document.querySelector('#roof-image');
  const enlarge=document.querySelector('#roof-enlarge');
  const status=document.createElement('span');
  status.className='sr-only';
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  status.style.cssText='position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  finishGroup.after(status);

  function applyFinish(id, announce=true){
    const roof=catalog[currentRoof];
    const finish=roof.finishes.find(item=>item.id===id)||roof.finishes[0];
    rememberedFinish[currentRoof]=finish.id;
    finishGroup.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.finish===finish.id)));
    roofImage.src='assets/'+finish.image;
    roofImage.alt=`Origin 320 ${roof.label.toLowerCase()} exterior in ${finish.label}. ${finish.description}`;
    enlarge.setAttribute('aria-label',`Enlarge ${finish.label} ${roof.label.toLowerCase()} concept`);
    document.querySelector('#roof-caption-type').textContent=roof.label;
    document.querySelector('#roof-caption-finish').textContent=finish.label;
    document.querySelector('#roof-finish-description').textContent=finish.description;
    window.originRoofSelection={roofLabel:roof.label,finishLabel:finish.label};
    if(typeof updateContact==='function')updateContact();
    if(announce)status.textContent=`${roof.label}: ${finish.label}`;
  }

  function chooseRoof(type, announce=true){
    currentRoof=type;
    const roof=catalog[type];
    document.querySelectorAll('[data-roof]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.roof===type)));
    finishGroup.setAttribute('aria-label',roof.label+' finishes');
    document.querySelector('#roof-finish-count').textContent=roof.finishes.length+' concepts';
    finishGroup.replaceChildren();
    roof.finishes.forEach(finish=>{
      const button=document.createElement('button');
      button.type='button';button.className='roof-finish';button.dataset.finish=finish.id;
      const swatch=document.createElement('span');swatch.className='finish-swatch';swatch.style.backgroundColor=finish.color;swatch.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.textContent=finish.label;
      button.append(swatch,label);button.addEventListener('click',()=>applyFinish(finish.id));finishGroup.append(button);
    });
    applyFinish(rememberedFinish[type],announce);
  }
  document.querySelectorAll('[data-roof]').forEach(button=>button.addEventListener('click',()=>chooseRoof(button.dataset.roof)));
  enlarge.addEventListener('click',()=>{
    const dialog=document.querySelector('#lightbox');
    dialog.querySelector('img').src=roofImage.src;
    dialog.querySelector('img').alt=roofImage.alt;
    dialog.querySelector('p').textContent=`${window.originRoofSelection.roofLabel} / ${window.originRoofSelection.finishLabel} - exterior concept`;
    dialog.showModal();
  });
  chooseRoof(currentRoof,false);
})();
