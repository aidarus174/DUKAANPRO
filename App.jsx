import React,{useEffect,useState} from "react";
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import {auth,googleProvider,firebaseConfigured} from "./firebase";
import {createShop,listenProducts,addProduct} from "./firestore";
import {translations,setLanguage} from "./i18n";

const demoProducts=[
  {id:"demo-1",name:"BIYO QABOW",stock:42,retailPrice:0.5,wholesalePrice:0.4},
  {id:"demo-2",name:"FANTA QABOW",stock:28,retailPrice:0.8,wholesalePrice:0.65},
  {id:"demo-3",name:"COCO QABOW",stock:19,retailPrice:1,wholesalePrice:0.8},
  {id:"demo-4",name:"MONSTER QABOW",stock:15,retailPrice:1.5,wholesalePrice:1.25}
];

function Auth({onDemo}){
  const [mode,setMode]=useState("signin"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const submit=async e=>{e.preventDefault();setError("");if(!firebaseConfigured||!auth)return setError("Firebase is not configured yet. Use Try Demo, or add your Firebase Web App configuration to .env.");setBusy(true);
    try{
      if(mode==="signup"){
        const c=await createUserWithEmailAndPassword(auth,email.trim(),password);
        await createShop(c.user.uid,{name:"DukaanPro",displayName:c.user.displayName||email.trim()});
      }else await signInWithEmailAndPassword(auth,email.trim(),password);
    }catch(x){setError(friendlyAuthError(x))}finally{setBusy(false)}
  };
  const google=async()=>{if(!firebaseConfigured||!auth)return setError("Firebase is not configured yet. Use Try Demo, or configure Firebase first.");setBusy(true);setError("");try{await signInWithPopup(auth,googleProvider)}catch(x){setError(friendlyAuthError(x))}finally{setBusy(false)}};
  const reset=async()=>{if(!email.trim())return setError("Enter your email first.");if(!firebaseConfigured||!auth)return setError("Firebase is not configured yet.");try{await sendPasswordResetEmail(auth,email.trim());setError("Password reset email sent. Check your inbox.")}catch(x){setError(friendlyAuthError(x))}};
  return <main className="auth">
    <div className="hero"><div className="brand">DUKAANPRO</div><div className="eyebrow">SMART • SIMPLE • PROFESSIONAL</div><h1>Smart Shop Management Made Simple</h1><p>Professional sales, stock, customers, debts and finance in one secure system.</p>
      <div className="showcase">{demoProducts.map((x,i)=><div className="product-card" key={x.id}><div className={`drink drink-${i}`}>{["💧","🥤","🍫","⚡"][i]}</div><b>{x.name}</b><small>Ready for your shop</small></div>)}</div>
    </div>
    <section className="auth-card"><div className="auth-badge">DUKAANPRO</div><h2>Welcome to DukaanPro</h2><p className="muted">{mode==="signup"?"Create your secure shop account.":"Sign in to your shop dashboard."}</p>
      <form onSubmit={submit}><input autoComplete="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required/><input autoComplete={mode==="signup"?"new-password":"current-password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength="6" required/><button disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create account":"Sign In"}</button></form>
      <button className="secondary" disabled={busy} onClick={google}>Continue with Google</button><button className="link" onClick={reset}>Forgot password?</button>
      {error&&<div className="error" role="alert">{error}</div>}
      <div className="switch">{mode==="signup"?"Already have an account?":"Need an account?"} <button className="link" onClick={()=>{setError("");setMode(mode==="signup"?"signin":"signup")}}>{mode==="signup"?"Sign In":"Sign Up"}</button></div>
      <button className="demo" onClick={onDemo}>Try Demo</button>
      {!firebaseConfigured&&<div className="config-note"><b>Setup needed</b><br/>Firebase is not configured in this build. The page will still work in Demo Mode instead of showing a blank screen.</div>}
    </section>
  </main>
}

function DemoDashboard({onExit}){
  const [products,setProducts]=useState(demoProducts),[lang,setLang]=useState("en"),[saleCount,setSaleCount]=useState(0),[cash,setCash]=useState(0);
  useEffect(()=>setLanguage(lang),[lang]);
  const t=translations[lang]||translations.en;
  const sell=id=>setProducts(ps=>ps.map(p=>p.id===id&&p.stock>0?({...p,stock:p.stock-1}):p).map(p=>p));
  const sellAndCash=id=>{const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return;setProducts(ps=>ps.map(x=>x.id===id?({...x,stock:x.stock-1}):x));setSaleCount(x=>x+1);setCash(x=>x+p.retailPrice)};
  return <div className="app"><header><div><div className="brand">DukaanPro</div><small>DEMO MODE • isolated data</small></div><div className="actions"><select value={lang} onChange={e=>setLang(e.target.value)}><option value="en">🇬🇧 English</option><option value="so">🇸🇴 Somali</option><option value="ar">🇸🇦 العربية</option></select><span className="status">● {navigator.onLine?"ONLINE":"OFFLINE"}</span><button onClick={onExit}>Exit Demo</button></div></header>
    <nav>{[t.dashboard,t.products,t.sales,t.customers,t.debts,t.expenses,t.purchases,t.suppliers,t.reports,t.employees,t.settings].map(x=><span key={x}>{x}</span>)}</nav>
    <main className="content"><div className="demo-banner">Demo data is isolated. Nothing here can change a real shop account.</div><div className="cards">{[["Today's Sales",saleCount],["Today's Cash",money(cash)], ["Today's Profit","—"],["Total Debt","$0.00"],["Debt Collected","$0.00"],["Total Products",products.length],["Low Stock",products.filter(p=>p.stock<=5).length],["Customers",0]].map(([x,v])=><div className="metric" key={x}><small>{x}</small><strong>{v}</strong></div>)}</div>
      <section className="panel"><div className="section-title"><div><h2>{t.products}</h2><p>Sample products for safe exploration.</p></div><span className="badge">DEMO</span></div><div className="table">{products.map(p=><div className="tr" key={p.id}><span><b>{p.name}</b></span><span>{p.stock}</span><span>{money(p.retailPrice)}</span><span><button disabled={!p.stock} onClick={()=>sellAndCash(p.id)}>＋ Sale</button></span></div>)}</div></section>
      <section className="panel"><h2>Quick Actions</h2><div className="quick-grid"><button onClick={()=>setSaleCount(x=>x+1)}>＋ New Sale</button><button>＋ Add Product</button><button>＋ Add Customer</button><button>＋ Debt Payment</button><button>＋ Add Expense</button><button>＋ Add Purchase</button></div></section>
    </main></div>
}

function Dashboard({user}){
  const [lang,setLang]=useState("en"),[products,setProducts]=useState([]),[name,setName]=useState(""),[stock,setStock]=useState("0"),[price,setPrice]=useState(""),[msg,setMsg]=useState("");
  useEffect(()=>setLanguage(lang),[lang]);
  useEffect(()=>listenProducts(user.uid,setProducts),[user.uid]);
  const add=async()=>{if(!name.trim())return setMsg("Product name is required.");try{await addProduct(user.uid,{name:name.trim(),stock:Number(stock),retailPrice:Number(price),wholesalePrice:Number(price),purchasePrice:0},{uid:user.uid,displayName:user.email,role:"OWNER"});setName("");setStock("0");setPrice("");setMsg("Product added.");}catch(e){setMsg(e.message)}};
  const t=translations[lang]||translations.en;
  return <div className="app"><header><div><div className="brand">DukaanPro</div><small>{user.email||"Account"}</small></div><div className="actions"><select value={lang} onChange={e=>setLang(e.target.value)}><option value="en">🇬🇧 English</option><option value="so">🇸🇴 Somali</option><option value="ar">🇸🇦 العربية</option></select><span className="status">● {navigator.onLine?"ONLINE":"OFFLINE"}</span><button onClick={()=>signOut(auth)}>Sign Out</button></div></header>
  <nav>{[t.dashboard,t.products,t.sales,t.customers,t.debts,t.expenses,t.purchases,t.suppliers,t.reports,t.employees,t.settings].map(x=><span key={x}>{x}</span>)}</nav>
  <main className="content"><div className="cards">{[["Today's Sales","—"],["Today's Cash","—"],["Today's Profit","—"],["Total Debt","—"],["Debt Collected","—"],["Total Products",products.length],["Low Stock",products.filter(p=>Number(p.stock)<=5).length],["Customers","—"]].map(([x,v])=><div className="metric" key={x}><small>{x}</small><strong>{v}</strong></div>)}</div>
  <section className="panel"><h2>{t.products}</h2><div className="formrow"><input placeholder="Product name" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Stock" type="number" min="0" value={stock} onChange={e=>setStock(e.target.value)}/><input placeholder="Retail price" type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)}/><button onClick={add}>+ Add Product</button></div>{msg&&<p className="notice">{msg}</p>}<div className="table"><div className="tr head"><span>Name</span><span>Stock</span><span>Retail</span><span>Wholesale</span></div>{products.map(p=><div className="tr" key={p.id}><span>{p.name}</span><span>{p.stock}</span><span>{p.retailPrice}</span><span>{p.wholesalePrice}</span></div>)}</div></section></main></div>
}

function App(){const [user,setUser]=useState(null),[demo,setDemo]=useState(false),[authReady,setAuthReady]=useState(!firebaseConfigured);
  useEffect(()=>{if(!firebaseConfigured||!auth){setAuthReady(true);return;}return onAuthStateChanged(auth,u=>{setUser(u);setAuthReady(true)})},[]);
  if(demo)return <DemoDashboard onExit={()=>setDemo(false)}/>;
  if(!authReady)return <div className="loading-screen"><div className="spinner"></div><b>Starting DukaanPro…</b></div>;
  return user?<Dashboard user={user}/>:<Auth onDemo={()=>setDemo(true)}/>;
}

function money(n){return new Intl.NumberFormat(undefined,{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(n)||0)}
function friendlyAuthError(x){const code=x?.code||"";const map={"auth/invalid-credential":"Email or password is incorrect.","auth/invalid-email":"Please enter a valid email.","auth/email-already-in-use":"An account with this email already exists.","auth/weak-password":"Password must be at least 6 characters.","auth/popup-closed-by-user":"Google sign-in was cancelled.","auth/network-request-failed":"Network error. Check your connection and try again.","auth/too-many-requests":"Too many attempts. Please wait and try again."};return map[code]||x?.message||"Authentication failed."}

export default App;
