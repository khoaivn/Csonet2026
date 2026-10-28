import { firebaseConfig, ownerEmail } from './firebase-config.js?v=20261028-decks3';

// The database Rules enforce the same identity; this panel is only the UI gate.
export async function authorizeRemote({ controller }) {
 const panel=document.createElement('section');panel.className='remote-auth-panel';
 panel.innerHTML='<h2>Đăng nhập để điều khiển</h2><p>Chỉ tài khoản được cấp quyền mới có thể kết nối.</p><p class="remote-auth-status" role="status"></p><button type="button">Đăng nhập Google</button>';
 const message=panel.querySelector('.remote-auth-status'),login=panel.querySelector('button');
 const parent=controller?document.body:document.getElementById('remoteDialog');
 parent.prepend(panel);
 if(controller)document.querySelector('.remote-page').hidden=true;
 const explain=text=>{message.textContent=text;};
 const reveal=()=>{panel.hidden=true;if(controller)document.querySelector('.remote-page').hidden=false;else if(parent.open)parent.close();};
 if(!firebaseConfig.apiKey){explain('Chưa có Firebase Web apiKey. Cần điền firebaseConfig và bật Google trong Firebase Authentication.');login.disabled=true;if(!controller)parent.showModal();throw Error('Thiếu cấu hình Firebase Authentication.');}
 let appSdk,authSdk;
 try{
  [appSdk,authSdk]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js')
  ]);
 }catch(error){explain('Không tải được đăng nhập. Kiểm tra Internet rồi tải lại trang.');login.disabled=true;if(!controller)parent.showModal();throw error;}
 const app=appSdk.initializeApp(firebaseConfig);
 const auth=authSdk.getAuth(app);
 try{await authSdk.setPersistence(auth,authSdk.browserLocalPersistence);}catch{await authSdk.setPersistence(auth,authSdk.browserSessionPersistence);}
 const isOwner=user=>!!user&&user.email?.toLowerCase()===ownerEmail.toLowerCase()&&user.emailVerified&&user.providerData.some(provider=>provider.providerId==='google.com');
 const provider=new authSdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account',login_hint:ownerEmail});
 const errors={
  'auth/unauthorized-domain':'Cần thêm khoaivn.github.io vào Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed':'Cần bật Google trong Firebase Authentication → Sign-in method.',
  'auth/popup-blocked':'Safari đã chặn cửa sổ đăng nhập. Cho phép mở cửa sổ rồi nhấn Đăng nhập Google lần nữa.',
  'auth/popup-closed-by-user':'Bạn đã đóng cửa sổ đăng nhập. Nhấn lại khi sẵn sàng.',
  'auth/invalid-api-key':'Firebase apiKey chưa đúng. Kiểm tra firebase-config.js.'
 };
 login.onclick=async()=>{
  login.disabled=true;explain('Đang đăng nhập…');
  try{const result=await authSdk.signInWithPopup(auth,provider);if(!isOwner(result.user)){await authSdk.signOut(auth);explain('Tài khoản này không có quyền điều khiển. Hãy chọn tài khoản được cấp quyền.');}}
  catch(error){explain(errors[error.code]||`Không đăng nhập được (${error.code||'network-error'}).`);}
  finally{login.disabled=false;}
 };
 await new Promise(resolve=>{
  let granted=false;
  authSdk.onAuthStateChanged(auth,user=>{
   if(isOwner(user)){if(granted){location.reload();return;}granted=true;reveal();resolve();}
   else{
    panel.hidden=false;if(controller)document.querySelector('.remote-page').hidden=true;
    if(!controller&&!parent.open)parent.showModal();
    explain(user?'Tài khoản này không có quyền điều khiển. Hãy đăng nhập bằng tài khoản được cấp quyền.':'Đăng nhập tài khoản Google được cấp quyền để tiếp tục.');
    if(granted)window.dispatchEvent(new Event('remote-access-lost'));
   }
  },error=>explain(errors[error.code]||'Không kiểm tra được trạng thái đăng nhập.'));
 });
 const account=document.createElement('div');account.className='remote-account';
 const label=document.createElement('span');label.textContent=`Đã đăng nhập: ${auth.currentUser.email}`;
 const logout=document.createElement('button');logout.type='button';logout.textContent='Đăng xuất';
 logout.onclick=async()=>{window.dispatchEvent(new Event('remote-access-lost'));await authSdk.signOut(auth);location.reload();};
 account.append(label,logout);parent.append(account);
 return {
  async getToken(){if(!isOwner(auth.currentUser))throw Error('Cần đăng nhập tài khoản chủ sở hữu.');return auth.currentUser.getIdToken();},
  onTokenChanged(callback){return authSdk.onIdTokenChanged(auth,user=>{if(isOwner(user))callback();});}
 };
}
