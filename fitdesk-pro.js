(function(){'use strict';window.createFitDeskPro=function createFitDeskPro(c){
 'use strict';
 const key='fitdesk_cloud_config_v1';
 let client=null,user=null,cloudCfg=null,remoteRevision=null,syncEnabled=false,dirty=false,busy=false,timer=null,poll=null,customerSearch='',reportRange='month',cloudMsg='未設定',remoteMeta=null;
 const db=()=>c.db();
 const e=v=>c.esc(v);
 const clean=()=>{const d=db(); if(!Array.isArray(d.customers))d.customers=[];if(!Array.isArray(d.notifications))d.notifications=[];if(!Array.isArray(d.blocks))d.blocks=[];};
 const errMsg=err=>err?.message||String(err||'操作できませんでした');
 function notice(kind,message){
  clean(); const item={id:c.uid(),at:new Date().toISOString(),kind,message}; db().notifications.unshift(item);db().notifications=db().notifications.slice(0,120);
  if(typeof Notification!=='undefined'&&Notification.permission==='granted'&&document.visibilityState==='visible'){try{new Notification('FitDesk',{body:message,tag:kind})}catch(_){ }}
 }
 function customerOf(id){clean();return db().customers.find(x=>x.id===id)}
 function bookingFor(customer){return db().bookings.filter(b=>b.customerId===customer.id||(!b.customerId&&b.client===customer.name))}
 function usedVisits(customer){return bookingFor(customer).filter(b=>b.status==='完了').length}
 function reportBookings(){const now=c.fromKey(c.today),first=reportRange==='month'?c.dayKey(new Date(now.getFullYear(),now.getMonth(),1)):c.monday(c.today),end=reportRange==='month'?c.dayKey(new Date(now.getFullYear(),now.getMonth()+1,0)):c.addDays(first,6);return {first,end,bs:db().bookings.filter(b=>b.date>=first&&b.date<=end),ss:db().shifts.filter(s=>s.date>=first&&s.date<=end)}}
 const yen=n=>'¥'+Math.max(0,Number(n)||0).toLocaleString('ja-JP');
 function renderCustomers(){
  clean();
  const people=db().customers.filter(x=>[x.name,x.phone,x.email,x.notes].join(' ').toLowerCase().includes(customerSearch.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name,'ja'));
  const rows=people.map(x=>{const b=bookingFor(x),completed=usedVisits(x),remaining=Number(x.packageSessions)>0?Math.max(0,Number(x.packageSessions)-completed):null;return `<tr><td class="name-cell">${e(x.name)}${x.archived?' <span class="status cancel">アーカイブ</span>':''}</td><td>${e(x.phone||'—')}<br><small>${e(x.email||'')}</small></td><td>${b.length}件 / 完了 ${completed}件</td><td>${remaining===null?'—':remaining+'回'}</td><td>${yen(x.defaultPrice)}</td><td><button class="btn small" data-customer-open="${e(x.id)}">詳細・編集</button></td></tr>`}).join('');
  return `<div class="panel content-panel"><div class="section-head"><h2 class="subheading">顧客台帳（${db().customers.length}名）</h2><button class="btn primary small" data-customer-open="new">${c.icon('plus')}顧客を登録</button></div><p class="desc">予約履歴・利用回数・回数券の残数を管理します。過去の同名予約も履歴に表示します（名前が重複する場合は顧客IDを設定してください）。</p><div class="filters"><input class="control" id="customerSearch" type="search" placeholder="顧客名・電話・メール検索" value="${e(customerSearch)}"></div><div class="table-scroll"><table class="data-table"><thead><tr><th>顧客</th><th>連絡先</th><th>予約 / 完了</th><th>残り回数</th><th>通常単価</th><th>操作</th></tr></thead><tbody>${rows||'<tr><td colspan="6">顧客が見つかりません。右上から追加できます。</td></tr>'}</tbody></table></div></div>`;
 }
 function customerOptions(selected=''){
  clean();return `<option value="">台帳を選ばず入力</option>`+db().customers.filter(x=>!x.archived||x.id===selected).map(x=>`<option value="${e(x.id)}" ${x.id===selected?'selected':''}>${e(x.name)}</option>`).join('');
 }
 function openCustomer(id){
  clean();
  const x=customerOf(id)||{name:'',phone:'',email:'',notes:'',packageSessions:0,defaultPrice:0,archived:false};
  const hist=id?bookingFor(x).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.start.localeCompare(a.start)):[],used=id?usedVisits(x):0;
  let content=c.field('顧客名 *','name',c.input('name','text',x.name,'required maxlength="60"'))+
   c.field('電話番号','phone',c.input('phone','tel',x.phone,'maxlength="30"'))+
   c.field('メール','email',c.input('email','email',x.email,'maxlength="120"'))+
   c.field('登録回数券（回）','packageSessions',c.input('packageSessions','number',x.packageSessions,'min="0" max="10000" step="1"'))+
   c.field('通常の1回料金（円）','defaultPrice',c.input('defaultPrice','number',x.defaultPrice,'min="0" max="10000000" step="1"'))+
   c.field('状態','archived',c.select('archived',`<option value="false" ${!x.archived?'selected':''}>利用中</option><option value="true" ${x.archived?'selected':''}>アーカイブ</option>`))+
   c.field('備考','notes',`<textarea class="control" id="field_notes" name="notes" maxlength="1000">${e(x.notes||'')}</textarea>`,true);
  if(id)content+=`<div class="field full"><div class="info-box"><strong>完了 ${used}回 / 残り ${Number(x.packageSessions)>0?Math.max(0,Number(x.packageSessions)-used)+'回':'回数券未設定'}</strong><p>予約履歴（直近15件）</p>${hist.slice(0,15).map(b=>`<p>${e(b.date)} ${e(b.start)} / ${e(b.menu)} / ${e(b.status)} / ${yen(b.price||0)}</p>`).join('')||'<p>まだ予約はありません</p>'}</div></div>`;
  c.modal(id?'顧客情報を編集':'顧客を追加',content,'customer',id==='new'?undefined:id);
 }
 function submitCustomer(form){
  if(form.dataset.type!=='customer')return false;
  clean();
  const v=Object.fromEntries(new FormData(form).entries()),id=form.dataset.id;
  v.name=(v.name||'').trim();v.phone=(v.phone||'').trim();v.email=(v.email||'').trim();v.notes=(v.notes||'').trim();
  v.packageSessions=Number(v.packageSessions);v.defaultPrice=Number(v.defaultPrice);v.archived=v.archived==='true';
  if(!v.name||v.name.length>60||!Number.isInteger(v.packageSessions)||v.packageSessions<0||!Number.isInteger(v.defaultPrice)||v.defaultPrice<0){alert('顧客名と回数券・料金の数値を確認してください');return true}
  if(id){
   const old=customerOf(id);if(!old)return true;
   const previous=old.name;Object.assign(old,v);
   for(const b of db().bookings)if(b.customerId===id&&b.client===previous)b.client=v.name;
   notice('customer','顧客情報を変更しました：'+v.name);
  }else{db().customers.push({id:c.uid(),...v});notice('customer','新しい顧客を登録しました：'+v.name)}
  db().demo=false;c.closeModal();c.save();c.toast('顧客情報を保存しました');return true;
 }
 function renderReports(){
  clean();const {first,end,bs,ss}=reportBookings();
  const valid=bs.filter(b=>b.status!=='キャンセル'),paid=valid.filter(b=>b.paymentStatus==='入金済');
  const total=paid.reduce((s,b)=>s+(Number(b.price)||0),0), hours=ss.reduce((sum,s)=>sum+c.worked(s),0);
  const unpriced=valid.filter(b=>b.price===undefined||b.price===null).length;
  const row=db().staff.map(st=>{const w=ss.filter(s=>s.staffId===st.id),b=valid.filter(x=>x.staffId===st.id),p=paid.filter(x=>x.staffId===st.id);const min=w.reduce((n,s)=>n+c.worked(s),0),bm=b.reduce((n,x)=>n+Number(x.duration||0),0);return `<tr><td class="name-cell">${e(st.name)}</td><td>${c.fmtM(min)}</td><td>${b.length}件</td><td>${b.filter(x=>x.status==='完了').length}件</td><td>${min?Math.round(bm/min*100)+'%':'—'}</td><td>${yen(p.reduce((sum,x)=>sum+(Number(x.price)||0),0))}</td></tr>`}).join('');
  const expected=valid.reduce((sum,b)=>sum+(Number(b.price)||0),0);
  return `<div class="panel board-toolbar"><div class="toolbar-left"><strong>${e(first)} 〜 ${e(end)}</strong></div><div class="toolbar-right"><div class="switch"><button type="button" data-report-range="week" class="${reportRange==='week'?'selected':''}">今週</button><button type="button" data-report-range="month" class="${reportRange==='month'?'selected':''}">今月</button></div><button class="btn small" data-export="finance">${c.icon('download')}売上CSV</button></div></div><div class="stats"><div class="panel stat"><div class="label">入金済み登録額</div><div class="num">${yen(total)}</div><div class="meta">予約に入金済みと記録された金額</div></div><div class="panel stat"><div class="label">予約予定額</div><div class="num">${yen(expected)}</div><div class="meta">キャンセルを除く登録金額</div></div><div class="panel stat"><div class="label">勤務時間</div><div class="num">${c.fmtM(hours)}</div><div class="meta">休憩（分）を控除した合計</div></div><div class="panel stat"><div class="label">予約件数</div><div class="num">${valid.length}件</div><div class="meta">完了 ${valid.filter(b=>b.status==='完了').length}件 / 金額未登録 ${unpriced}件</div></div></div><div class="panel content-panel"><h2 class="subheading">スタッフ別の勤務・売上集計</h2><div class="table-scroll" style="margin-top:14px"><table class="data-table"><thead><tr><th>スタッフ</th><th>勤務時間</th><th>予約</th><th>完了</th><th>稼働率の目安</th><th>入金済み登録額</th></tr></thead><tbody>${row||'<tr><td colspan="6">スタッフ未登録</td></tr>'}</tbody></table></div><p class="hint">売上は予約ごとに手入力した料金と「入金済み」を集計した参考値です。決済システムや会計ソフトとは連動していません。以前の予約は料金未設定として維持されます。</p></div>`;
 }
 function renderNotifications(){
  clean();const next=db().bookings.filter(b=>b.status!=='キャンセル'&&b.date>=c.today).sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)).slice(0,12);
  return `<div class="detail-grid"><div class="panel content-panel"><div class="section-head"><h2 class="subheading">アプリ内のお知らせ</h2><button class="btn small" data-enable-notify>ブラウザ通知を許可</button></div><p class="hint">通知はこのアプリを開いているときの予約・勤務変更と、接近した予約を対象にします。アプリを閉じている間のプッシュ通知やお客様へのSMS・メール送信は未対応です。</p><div class="summary-list">${db().notifications.map(x=>`<div class="daybook"><span><b>${e(x.message)}</b><br><small>${e(new Date(x.at).toLocaleString('ja-JP'))}</small></span></div>`).join('')||'<p class="hint">まだ通知はありません</p>'}</div></div><div class="panel content-panel"><h2 class="subheading">これからの予約</h2><div class="summary-list">${next.map(b=>`<button type="button" class="daybook" style="width:100%;background:transparent;border:0;text-align:left" data-edit-booking="${e(b.id)}"><span><b>${e(b.date)} ${e(b.start)} ${e(b.client)}</b><br><small>${e(c.byStaff(b.staffId)?.name||'—')} / ${e(b.menu)} / ${e(b.status)}</small></span></button>`).join('')||'<p class="hint">今後の予約はありません</p>'}</div></div></div>`;
 }
 const cloudConfig=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}};
 function saveCfg(obj){localStorage.setItem(key,JSON.stringify(obj));cloudCfg=obj}
 const urlOk=url=>/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test((url||'').trim());
 function sdk(){
  if(window.supabase&&window.supabase.createClient)return Promise.resolve(window.supabase);
  return new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';sc.async=true;sc.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(Error('SDKを読み込めません'));sc.onerror=()=>reject(Error('認証ライブラリの読み込みに失敗しました'));document.head.appendChild(sc)});
 }
 function redraw(){if(c.page()==='cloud')c.render()}
 async function initCloud(){
  cloudCfg=cloudConfig();if(!cloudCfg||!cloudCfg.url||!cloudCfg.key)return;
  try{
   cloudMsg='接続を初期化中';await sdk();
   client=window.supabase.createClient(cloudCfg.url,cloudCfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   const res=await client.auth.getUser();
   user=res.data?.user||null;
   if(user){cloudMsg='ログイン済み（同期前）';await checkCloud()}
   else cloudMsg='接続設定済み・ログイン待ち';
   client.auth.onAuthStateChange((_event,session)=>{const uid=session?.user?.id;if(uid!==user?.id){user=session?.user||null;syncEnabled=false;remoteRevision=null;cloudMsg=user?'ログイン済み・同期未開始':'未ログイン';if(user)setTimeout(()=>checkCloud(),300);redraw()}});
  }catch(error){cloudMsg='接続エラー：'+errMsg(error);console.error('FitDesk cloud',error)}redraw();
 }
 async function checkCloud(){
  if(!client||!user)return;
  const {data,error}=await client.from('fitdesk_state').select('revision,updated_at').eq('user_id',user.id).maybeSingle();
  if(error){cloudMsg='データベース確認失敗：'+errMsg(error);throw error}
  remoteMeta=data||null;
  cloudMsg=remoteMeta?'クラウドのデータがあります（保存版 '+remoteMeta.revision+'）':'クラウドは空です';
  redraw();return remoteMeta;
 }
 async function readCloud(silent=false){
  if(!user||!client)return;
  const {data,error}=await client.from('fitdesk_state').select('revision,data,updated_at').eq('user_id',user.id).maybeSingle();
  if(error)throw error;if(!data){cloudMsg='クラウドにデータがありません';redraw();return false}
  if(!c.validData(data.data))throw Error('クラウドのデータ形式が正しくありません');
  if(!silent&&!confirm('クラウドの内容でこの端末の勤務・予約・顧客データを置き換えます。続行しますか？'))return false;
  if(dirty&&!silent)throw Error('未送信の変更があります');
  try{localStorage.setItem('fitdesk_presync_backup_'+Date.now(),JSON.stringify(db()))}catch(_){}
  syncEnabled=false;c.setDb(data.data);clean();remoteRevision=data.revision;remoteMeta=data;dirty=false;
  c.save();syncEnabled=true;cloudMsg='同期中・最新版 '+remoteRevision;redraw();return true;
 }
 async function pushCloud(force=false){
  if(!client||!user)throw Error('ログインが必要です');
  if(busy){dirty=true;return}
  busy=true;
  try{
   const local=db();const {data:current,error:readError}=await client.from('fitdesk_state').select('revision,updated_at').eq('user_id',user.id).maybeSingle();
   if(readError)throw readError;
   if(!force&&current&&remoteRevision!==current.revision)throw Error('他端末の変更が先に保存されています。クラウドから読み込み、内容を確認してください');
   if(force&&current&&!confirm('クラウドにあるデータをこの端末の内容で上書きします。よろしいですか？'))return;
   if(!current){
    const {data,error}=await client.from('fitdesk_state').insert({user_id:user.id,data:local,revision:1}).select('revision,updated_at').single();
    if(error)throw error;remoteRevision=data.revision;remoteMeta=data;
   }else{
    const {data,error}=await client.from('fitdesk_state').update({data:local,revision:current.revision+1,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('revision',current.revision).select('revision,updated_at').maybeSingle();
    if(error)throw error;if(!data)throw Error('同期の競合が発生しました。他の端末の変更を確認してください');
    remoteRevision=data.revision;remoteMeta=data;
   }
   syncEnabled=true;dirty=false;cloudMsg='同期済み・版 '+remoteRevision;
  }catch(error){dirty=true;syncEnabled=false;cloudMsg='同期停止：'+errMsg(error);c.toast(cloudMsg)}finally{busy=false;redraw()}
 }
 function onLocalSave(){
  if(!syncEnabled||!client||!user)return;
  dirty=true;clearTimeout(timer);timer=setTimeout(()=>{if(syncEnabled)pushCloud(false)},900);
 }
 async function pollCloud(){
  if(!syncEnabled||!client||!user||busy||dirty)return;
  try{const meta=await checkCloud();if(meta&&meta.revision!==remoteRevision){await readCloud(true);c.toast('他端末の更新を反映しました')}}catch(error){cloudMsg='同期確認失敗：'+errMsg(error);redraw()}
 }
 function renderCloud(){
  const cfg=cloudConfig();const online=!!user;
  return `<div class="detail-grid"><div class="panel content-panel"><h2 class="subheading">クラウド接続（Supabase）</h2><p class="desc">同じアカウントでログインすると、PCとスマホの間でデータを同期できます。外部のSupabaseプロジェクト設定が必要です。</p><div class="filters" style="display:block"><label class="field"><span>プロジェクトURL</span><input class="control" id="cloudProjectUrl" placeholder="https://xxxxx.supabase.co" value="${e(cfg?.url||'')}"></label><label class="field" style="margin-top:10px"><span>Publishable key / anon key</span><input class="control" id="cloudProjectKey" type="password" autocomplete="off" placeholder="公開用キーのみ" value="${e(cfg?.key||'')}"></label><button class="btn primary" style="margin-top:12px" data-cloud-action="configure">接続設定を保存</button></div><div class="info-box"><strong>状態：</strong>${e(cloudMsg)}<br><strong>ログイン：</strong>${online?e(user.email||user.id):'未ログイン'}<br><strong>自動同期：</strong>${syncEnabled?'有効':'無効'}${dirty?'<br>未同期の端末データがあります':''}</div>${cfg?`<div style="margin-top:13px"><label class="field"><span>ログイン用メールアドレス</span><input class="control" id="cloudLoginEmail" type="email" placeholder="メールアドレス"></label><div class="data-actions"><button class="btn" data-cloud-action="login">ログイン用リンクを送信</button>${online?'<button class="btn danger" data-cloud-action="logout">ログアウト</button>':''}</div></div>`:''}</div><div class="panel content-panel"><h2 class="subheading">同期と安全なデータ移行</h2><p class="desc">初回ログイン後、どちらのデータを採用するか選択します。端末のデータは勝手に消しません。アップロード前にJSONバックアップも保存してください。</p><div class="data-actions"><button class="btn" data-export="json">JSONバックアップ</button><button class="btn" data-cloud-action="check" ${!online?'disabled':''}>クラウドを確認</button><button class="btn" data-cloud-action="download" ${!online?'disabled':''}>クラウドから読み込む</button><button class="btn primary" data-cloud-action="upload" ${!online?'disabled':''}>この端末からアップロード</button></div><p class="hint">データはログインした本人の行のみ読み書きできるRLSポリシーを想定しています。同期中は更新版番号を照合し、他端末で変更があると上書きを停止します。</p><p class="hint">ログインはSupabaseのメール認証です。プロジェクト側でこのサイトのURLをリダイレクト先として許可し、同梱の supabase_setup.sql を実行してください。秘密キー（service_role / sb_secret）は入力しないでください。</p><p class="hint">複数スタッフで別々のログインアカウントから同じ施設を編集する機能は未対応です。同一アカウントでの複数端末同期として提供します。</p></div></div>`;
 }
 async function cloudAction(action){
  try{
   if(action==='configure'){
    const url=document.querySelector('#cloudProjectUrl')?.value.trim(),keyv=document.querySelector('#cloudProjectKey')?.value.trim();
    if(!urlOk(url)||!keyv||/^(sb_secret_|service_role)/.test(keyv)){alert('Supabaseの正しいURLと公開用キー（publishable / anon）を入力してください。秘密キーは使用できません');return}
    saveCfg({url,key:keyv});client=null;user=null;remoteRevision=null;syncEnabled=false;await initCloud();c.toast('接続設定を保存しました');return;
   }
   if(!client)throw Error('接続設定を保存してください');
   if(action==='login'){
    const email=document.querySelector('#cloudLoginEmail')?.value.trim();if(!email)throw Error('メールアドレスを入力してください');
    const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
    if(error)throw error;c.toast('ログイン用メールを送信しました');return;
   }
   if(action==='logout'){await client.auth.signOut();user=null;syncEnabled=false;remoteRevision=null;cloudMsg='ログアウトしました。端末のデータは残ります';redraw();return}
   if(action==='check'){await checkCloud();return}
   if(action==='download'){const ok=await readCloud();if(ok)c.toast('クラウドのデータを読み込み、同期を開始しました');return}
   if(action==='upload'){await pushCloud(true);return}
  }catch(error){cloudMsg='操作エラー：'+errMsg(error);c.toast(cloudMsg);redraw()}
 }
 function handleClick(d){
  if(d.customerOpen){openCustomer(d.customerOpen);return true}
  if(d.reportRange){reportRange=d.reportRange;c.render();return true}
  if(d.cloudAction){cloudAction(d.cloudAction);return true}
  if(d.enableNotify!==undefined){if(typeof Notification==='undefined'){c.toast('このブラウザでは通知を使えません')}else Notification.requestPermission().then(x=>c.toast(x==='granted'?'通知を許可しました':'通知が許可されていません'));return true}
  if(d.delete==='customer'){if(!confirm('顧客を削除しますか？登録された予約の顧客名は残ります。'))return true;db().customers=db().customers.filter(x=>x.id!==d.id);c.closeModal();notice('customer','顧客を削除しました');c.save();return true}
  return false;
 }
 function handleChange(target){
  if(target.id==='customerLinked'){
   const x=customerOf(target.value),f=document.querySelector('#field_client'),p=document.querySelector('#field_price');
   if(x&&f){f.value=x.name;if(p&&!Number(p.value))p.value=x.defaultPrice||0}
   return true;
  }
  return false;
 }
 function handleInput(t){
  if(t.id==='customerSearch'){customerSearch=t.value;const parent=t.closest('.content-panel');if(!parent)return true;c.render();document.querySelector('#customerSearch')?.focus();return true}return false;
 }
 function track(type,message){notice(type,message)}
 function exportFinance(){
  const {bs}=reportBookings(),rows=[['日付','開始','お客様','担当','内容','状態','料金(円)','入金状態'],...bs.map(b=>[b.date,b.start,b.client,c.byStaff(b.staffId)?.name||'',b.menu,b.status,Number(b.price)||0,b.paymentStatus||'未設定'])];
  const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  c.download('fitdesk_finance_'+c.today+'.csv',new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
 }
 function reminderCheck(){
  if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const now=Date.now();let seen;try{seen=JSON.parse(localStorage.getItem('fitdesk_alerts_seen')||'{}')}catch(_){seen={}}
  for(const b of db().bookings){if(b.status==='キャンセル')continue;const when=new Date(b.date+'T'+b.start+':00').getTime(),remaining=when-now;if(remaining<0||remaining>3600000)continue;const k=b.id+'_'+b.date+'_'+b.start;if(seen[k])continue;seen[k]=Date.now();try{new Notification('FitDesk：1時間以内の予約',{body:b.start+' '+b.client+' / '+(c.byStaff(b.staffId)?.name||'担当未登録')})}catch(_){}}
  try{localStorage.setItem('fitdesk_alerts_seen',JSON.stringify(Object.fromEntries(Object.entries(seen).filter(([k,v])=>Date.now()-v<2592000000))))}catch(_){}
 }
 // Keep timers strictly in browser while the app is open. No background push is implied.
 setTimeout(()=>{initCloud();reminderCheck()},150);
 poll=setInterval(()=>{pollCloud();reminderCheck()},60000);
 return {renderCustomers,openCustomer,customerOptions,submitCustomer,renderReports,renderNotifications,renderCloud,handleClick,handleChange,handleInput,track,onLocalSave,exportFinance,customerOf,initCloud};
};
})();
