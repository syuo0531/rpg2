
(()=>{
'use strict';
const vitamins=window.VITAMIN_DATA||[],lookup=Object.fromEntries(vitamins.map(v=>[v.id,v]));
const KEY='vitamin-card-study-v1',valid=new Set(vitamins.map(v=>v.id));
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let saved={};
try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))saved=raw;
  else {
    const previous=JSON.parse(localStorage.getItem('vitamin-forge-save-v1')||'null');
    if(previous){
      for(const v of vitamins){
        if(previous.weak&&previous.weak[v.id])saved[v.id]='again';
        else if(previous.cardKnown&&Object.keys(previous.cardKnown).some(key=>key.startsWith(v.id+':')&&previous.cardKnown[key]))saved[v.id]='known';
      }
    }
  }
}catch(e){}
saved=Object.fromEntries(Object.entries(saved).filter(([id,value])=>valid.has(id)&&['known','again'].includes(value)));
let filter='all',mode='name',view='cards',flipped=false,activeId=null,shuffled=false;
let order=vitamins.map(v=>v.id);
const textStatus=id=>saved[id]==='known'?'覚えた':saved[id]==='again'?'もう一度':'未確認';
const memo=(title,value,extra=false)=>'<span class="detail'+(extra?' memo':'')+'"><b>'+title+'</b>'+safe(value??'元の一覧表に記載なし')+'</span>';
function save(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){$('notice').textContent='保存できません。ブラウザの保存設定を確認してください。'}}
function includes(v){
  if(mode==='deficiency'&&(!v.deficiency||v.deficiency.startsWith('通常の食生活')))return false;
  if(filter==='water'&&v.group!=='water')return false;
  if(filter==='fat'&&v.group!=='fat')return false;
  if(filter==='unlearned'&&saved[v.id]==='known')return false;
  if(filter==='again'&&saved[v.id]!=='again')return false;
  return true;
}
const deck=()=>order.filter(id=>includes(lookup[id]));
function current(){
  const ids=deck();
  if(!ids.length){activeId=null;return null}
  if(!ids.includes(activeId))activeId=ids[0];
  return lookup[activeId];
}
function renderProgress(){
  const count=vitamins.filter(v=>saved[v.id]==='known').length;
  $('known-count').textContent=count;$('retry-count').textContent=vitamins.filter(v=>saved[v.id]==='again').length;
  $('bar').style.width=(vitamins.length?count/vitamins.length*100:0)+'%';
}
function renderCard(){
  const ids=deck(),v=current();
  $('study').hidden=view!=='cards';$('listing').hidden=view!=='list';
  $('tab-cards').classList.toggle('active',view==='cards');$('tab-list').classList.toggle('active',view==='list');
  $('tab-cards').setAttribute('aria-selected',String(view==='cards'));$('tab-list').setAttribute('aria-selected',String(view==='list'));
  if(view!=='cards')return;
  $('group').value=filter;$('mode').value=mode;$('position').textContent=v?((ids.indexOf(v.id)+1)+' / '+ids.length):'0 / 0';
  $('shuffle').textContent=shuffled?'元の順番に戻す':'シャッフル';
  $('empty').hidden=!!v;$('study-body').hidden=!v;
  if(!v){$('empty-message').textContent=filter==='again'?'復習するカードはまだありません。':'条件に合うカードはありません。';return}
  const item=$('flash');
  item.classList.toggle('open',flipped);
  item.setAttribute('aria-label',flipped?'表に戻す':'裏面を見る');
  const faceLabel=mode==='name'?'このビタミンの特徴は？':mode==='role'?'この働きをするビタミンは？':'この欠乏症に関係するビタミンは？';
  const frontValue=mode==='name'?v.name:mode==='role'?(v.roleShort||v.role):(v.deficiencyShort||v.deficiency);
  const front='<span class="prompt">'+faceLabel+'</span><strong class="question'+(frontValue.length>18?' long':'')+'">'+safe(frontValue)+'</strong>'+(mode==='name'?'<span class="alias">'+safe(v.alias)+'</span>':'')+'<span class="hint">タップして裏面を見る →</span>';
  const back='<span class="back-name">'+safe(v.name)+'</span><span class="back-alias">'+safe(v.alias)+' ／ '+(v.group==='water'?'水溶性':'脂溶性')+'</span>'+memo('主な働き',v.role)+memo('不足・欠乏症',v.deficiency)+memo('過剰摂取',v.excess)+memo('暗記のヒント',v.mnemonic,true);
  item.innerHTML='<span class="pill">'+(v.group==='water'?'水溶性':'脂溶性')+'</span><span class="status">'+textStatus(v.id)+'</span>'+(flipped?back:front);
  $('flip-label').textContent=flipped?'表に戻す':'答えを見る';
  $('record').hidden=!flipped;
}
function renderMini(){
  $('mini').innerHTML=vitamins.map(v=>'<button type="button" data-action="choose" data-id="'+v.id+'" class="'+(view==='cards'&&activeId===v.id?'selected':'')+'"><span>'+safe(v.name)+'</span><small class="'+(saved[v.id]==='known'?'good':saved[v.id]==='again'?'retry':'')+'">'+textStatus(v.id)+'</small></button>').join('');
}
function renderList(){
  if(view!=='list')return;
  $('list-grid').innerHTML=vitamins.map(v=>'<button class="item'+(v.group==='fat'?' fat':'')+'" type="button" data-action="choose" data-id="'+v.id+'"><span class="code">'+safe(v.code)+'</span><span><strong>'+safe(v.name)+'</strong><small>'+safe(v.alias)+'</small></span><span class="state">'+textStatus(v.id)+'</span></button>').join('');
}
function render(){renderProgress();renderCard();renderMini();renderList()}
function next(delta){
  const ids=deck();if(!ids.length)return;
  activeId=ids[(Math.max(0,ids.indexOf(activeId))+delta+ids.length)%ids.length];flipped=false;render();
}
function select(id){
  if(!lookup[id])return;
  activeId=id;view='cards';filter='all';mode='name';flipped=false;$('notice').textContent='';render();
  if(window.innerWidth<750)$('study').scrollIntoView({behavior:'smooth',block:'start'});
}
function rate(value){
  if(!activeId||!flipped)return;
  const prev=deck(),idx=prev.indexOf(activeId);
  saved[activeId]=value;save();
  const after=deck();
  if(!after.length)activeId=null;
  else if(after.includes(activeId))activeId=after[(after.indexOf(activeId)+1)%after.length];
  else activeId=after[Math.min(idx,after.length-1)];
  flipped=false;$('notice').textContent=value==='known'?'「覚えた」に保存しました。':'「もう一度」に保存しました。';render();
}
function shuffle(){
  if(shuffled){order=vitamins.map(v=>v.id);shuffled=false}
  else{
    order=vitamins.map(v=>v.id);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
    shuffled=true;
  }
  activeId=null;flipped=false;render();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;
  switch(b.dataset.action){
  case 'view':view=b.dataset.view;flipped=false;render();break;
  case 'flip':if(current()){flipped=!flipped;renderCard()}break;
  case 'next':next(1);break;
  case 'prev':next(-1);break;
  case 'choose':select(b.dataset.id);break;
  case 'known':rate('known');break;
  case 'again':rate('again');break;
  case 'shuffle':shuffle();break;
  case 'all':filter='all';activeId=null;flipped=false;render();break;
  case 'reset':if(confirm('学習の記録をすべて削除しますか？')){saved={};save();activeId=null;flipped=false;$('notice').textContent='記録をリセットしました。';render()}break;
  }
});
$('group').addEventListener('change',e=>{filter=e.target.value;activeId=null;flipped=false;render()});
$('mode').addEventListener('change',e=>{mode=e.target.value;activeId=null;flipped=false;render()});
document.addEventListener('keydown',e=>{
 if(view!=='cards'||/^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName))return;
 if(e.key==='ArrowRight'){e.preventDefault();next(1)}
 if(e.key==='ArrowLeft'){e.preventDefault();next(-1)}
 if((e.key===' '||e.key==='Enter')&&e.target===document.body){e.preventDefault();if(current()){flipped=!flipped;renderCard()}}
});
render();
})();
