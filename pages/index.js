import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Search, Radar, LayoutDashboard, Plus, Zap, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Star, Eye, EyeOff, Quote, ArrowRight, X, Settings, RefreshCw, Trash2, ExternalLink, Target, Award, BarChart3, Sparkles, FileText, Copy, Check, BookOpen, Send, PenTool, Wifi, WifiOff, Lock, Unlock, KeyRound, User, Phone, MessageCircle, MapPin, QrCode, Image, Archive, Clock, ChevronRight } from "lucide-react";

// ======== CRYPTO ========
async function deriveKey(p,s){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:s,iterations:100000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);}
async function encrypt(p,d){const s=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await deriveKey(p,s),e=await crypto.subtle.encrypt({name:"AES-GCM",iv},k,new TextEncoder().encode(JSON.stringify(d))),b=new Uint8Array(s.length+iv.length+e.byteLength);b.set(s,0);b.set(iv,16);b.set(new Uint8Array(e),28);return btoa(String.fromCharCode(...b));}
async function decrypt(p,b64){try{const b=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)),k=await deriveKey(p,b.slice(0,16)),d=await crypto.subtle.decrypt({name:"AES-GCM",iv:b.slice(16,28)},k,b.slice(28));return JSON.parse(new TextDecoder().decode(d));}catch(e){return null;}}

// ======== CONFIG ========
const PC={DeepSeek:{color:"#007AFF",icon:"🔍",api:"/api/deepseek"},"豆包":{color:"#FF6B2C",icon:"🫘",api:"/api/doubao"},Kimi:{color:"#AF52DE",icon:"🌙",api:"/api/moonshot"}};
const PN=Object.keys(PC);
const ST={"首推":{color:"#34C759",bg:"rgba(52,199,89,0.12)",icon:Star,score:100},"被提及":{color:"#007AFF",bg:"rgba(0,122,255,0.12)",icon:Eye,score:60},"被引用":{color:"#FF9500",bg:"rgba(255,149,0,0.12)",icon:Quote,score:30},"未出现":{color:"#8E8E93",bg:"rgba(142,142,147,0.08)",icon:EyeOff,score:0}};
const STAGES=[{key:"初步了解",color:"#007AFF",emoji:"💡",desc:"这是什么东西"},{key:"需求确认",color:"#5856D6",emoji:"🤔",desc:"我要不要做"},{key:"选购对比",color:"#34C759",emoji:"🛒",desc:"我找谁做"},{key:"行业场景",color:"#FF9500",emoji:"🏭",desc:"我这个行业怎么做"},{key:"执行困惑",color:"#FF3B30",emoji:"😰",desc:"做了没效果怎么办"},{key:"深度决策",color:"#AF52DE",emoji:"📋",desc:"签合同前确认什么"}];
const CG=[{group:"通用高权重",color:"#34C759",ch:[{n:"知乎专栏",i:"📝",u:"https://zhuanlan.zhihu.com/write",d:"AI引用率最高",p:"核心"},{n:"知乎回答",i:"💬",u:"https://www.zhihu.com",d:"场景问答首选",p:"核心"},{n:"CSDN",i:"🖥",u:"https://editor.csdn.net/md",d:"技术内容权重极高",p:"核心"},{n:"博客园",i:"🌿",u:"https://i.cnblogs.com/posts/edit",d:"多AI平台引用",p:"重要"}]},{group:"字节生态（豆包优先）",color:"#FF6B2C",ch:[{n:"头条号",i:"📱",u:"https://mp.toutiao.com/profile_v4/graphic/publish",d:"豆包核心信息源",p:"核心"},{n:"抖音",i:"🎵",u:"https://creator.douyin.com",d:"豆包直接抓取",p:"核心"},{n:"抖音百科",i:"📖",u:"https://www.douyin.com/encyclopedia",d:"知识类内容",p:"重要"},{n:"西瓜视频",i:"🍉",u:"https://studio.ixigua.com",d:"长视频内容",p:"补充"}]},{group:"百度生态（文心一言优先）",color:"#007AFF",ch:[{n:"百家号",i:"📰",u:"https://baijiahao.baidu.com/builder/rc/edit",d:"文心一言核心源",p:"核心"},{n:"百度百科",i:"📚",u:"https://baike.baidu.com",d:"最高权威来源",p:"核心"},{n:"百度知道",i:"❓",u:"https://zhidao.baidu.com",d:"问答高频引用",p:"重要"},{n:"百度经验",i:"📋",u:"https://jingyan.baidu.com",d:"教程型内容",p:"补充"},{n:"百度贴吧",i:"💭",u:"https://tieba.baidu.com",d:"增加品牌提及",p:"补充"}]},{group:"腾讯生态（元宝优先）",color:"#5856D6",ch:[{n:"微信公众号",i:"💚",u:"https://mp.weixin.qq.com",d:"元宝核心源",p:"核心"},{n:"腾讯新闻",i:"📺",u:"https://om.qq.com/article/articleIndex",d:"元宝高频引用",p:"重要"},{n:"腾讯开放平台",i:"🔷",u:"https://om.qq.com",d:"一键分发腾讯系",p:"重要"}]},{group:"新闻媒体",color:"#FF3B30",ch:[{n:"搜狐号",i:"🔶",u:"https://mp.sohu.com/mpfe/v3/main/new-batch/article",d:"高权重门户",p:"核心"},{n:"新浪财经",i:"🔴",u:"https://cj.sina.com.cn",d:"财经高权重",p:"重要"},{n:"网易号",i:"📡",u:"https://mp.163.com",d:"覆盖面广",p:"重要"},{n:"凤凰号",i:"🦅",u:"https://ishare.ifeng.com",d:"新闻权威性强",p:"补充"}]},{group:"垂直 & 长文",color:"#AF52DE",ch:[{n:"简书",i:"📖",u:"https://www.jianshu.com/writer",d:"长文友好",p:"重要"},{n:"掘金",i:"⛏",u:"https://juejin.cn/editor/drafts/new",d:"科技类权重高",p:"重要"},{n:"36氪",i:"🚀",u:"https://36kr.com",d:"商业科技",p:"补充"}]},{group:"社交 & 种草",color:"#FF2D55",ch:[{n:"小红书",i:"📕",u:"https://creator.xiaohongshu.com",d:"品牌口碑建设",p:"重要"},{n:"微博",i:"🔵",u:"https://weibo.com",d:"社交声量",p:"补充"},{n:"豆瓣",i:"🟢",u:"https://www.douban.com",d:"长尾SEO",p:"补充"}]}];
const AT=[{key:"guide",label:"行业深度指南",desc:"3000-5000字",icon:BookOpen},{key:"qa",label:"场景化问答",desc:"800-1500字",icon:Search},{key:"case",label:"案例深度复盘",desc:"1500-2500字",icon:Target},{key:"compare",label:"选型对比评测",desc:"2000-3000字",icon:BarChart3}];

// ======== HELPERS ========
function analyzeR(t,b,cs){const bl=b.toLowerCase(),has=t.toLowerCase().includes(bl),ls=t.split('\n').filter(l=>/^[\d•\-\*]/.test(l.trim()));let pos=null,f=false;if(ls.length>0)for(let i=0;i<ls.length;i++)if(ls[i].toLowerCase().includes(bl)){pos=i+1;if(i===0)f=true;break;}let s="未出现";if(f)s="首推";else if(has&&pos)s="被提及";else if(has)s="被引用";return{myBrandStatus:s,competitors:cs.filter(c=>t.includes(c)).map((n,i)=>({name:n,position:i+1})),responseQuality:ls.length>0?"详细推荐":"泛泛回答"};}
function mockR(q,p,c,b,cs){const w={"初步了解":[3,8,25,64],"需求确认":[5,10,20,65],"选购对比":[18,22,15,45],"行业场景":[8,18,20,54],"执行困惑":[6,10,22,62],"深度决策":[5,12,28,55]}[c]||[10,15,20,55];const r=Math.random()*100;const s=r<w[0]?"首推":r<w[0]+w[1]?"被提及":r<w[0]+w[1]+w[2]?"被引用":"未出现";const mc=[...cs].sort(()=>Math.random()-.5).slice(0,2+Math.floor(Math.random()*3)).map((n,i)=>({name:n,position:i+1}));return{id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,question:q,platform:p,category:c,myBrandStatus:s,competitors:mc,responseQuality:"泛泛回答",rawResponse:`[模拟] ${p}对"${q}"的回答。${s!=="未出现"?`提到了${b}。`:""}推荐了${mc.map(c=>c.name).join("、")}。`,collectedAt:new Date().toISOString(),isReal:false};}
function mockH(){return Array.from({length:8},(_,i)=>({week:`W${i+1}`,score:Math.min(92,Math.round(12+i*9.5+Math.random()*8)),mentioned:Math.round(3+i*2+Math.random()*4)}));}

// ======== UI COMPONENTS ========
function Badge({status}){const s=ST[status]||ST["未出现"];const I=s.icon;return<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,background:s.bg,color:s.color,fontSize:13,fontWeight:600}}><I size={13}/>{status}</span>;}
function StatCard({label,value,sub,color}){return<div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:"28px",flex:1,minWidth:170}}><div style={{fontSize:15,color:"rgba(255,255,255,0.5)",marginBottom:12}}>{label}</div><div style={{fontSize:40,fontWeight:700,color:color||"#fff",letterSpacing:-2,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:12}}>{sub}</div>}</div>;}
const Btn=({children,primary,danger,disabled,onClick,style:s})=><button onClick={onClick} disabled={disabled} style={{padding:primary?"14px 32px":"10px 20px",borderRadius:14,border:"none",fontSize:primary?17:15,fontWeight:600,background:disabled?"rgba(255,255,255,0.05)":danger?"rgba(255,59,48,0.12)":primary?"#007AFF":"rgba(255,255,255,0.08)",color:disabled?"rgba(255,255,255,0.2)":danger?"#FF3B30":primary?"#fff":"rgba(255,255,255,0.8)",cursor:disabled?"default":"pointer",display:"inline-flex",alignItems:"center",gap:8,...s}}>{children}</button>;
const Card=({children,style:s})=><div style={{background:"rgba(255,255,255,0.03)",borderRadius:20,padding:"28px 32px",marginBottom:24,...s}}>{children}</div>;
const Label=({children})=><div style={{fontSize:20,fontWeight:600,marginBottom:16}}>{children}</div>;
const SubLabel=({children})=><div style={{fontSize:14,color:"rgba(255,255,255,0.35)",margin:"-10px 0 16px"}}>{children}</div>;
const Input=({...props})=><input {...props} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 20px",color:"#fff",fontSize:17,outline:"none",marginBottom:14,...(props.style||{})}}/>;

// ======== PASSWORD MODAL ========
function PwdModal({channel,accounts,onSave,onClose}){const e=accounts[channel.n]||{username:"",password:"",note:""};const[u,setU]=useState(e.username);const[p,setP]=useState(e.password);const[n,setN]=useState(e.note);const[show,setShow]=useState(false);const[saved,setSaved]=useState(false);
  return<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}><div onClick={e=>e.stopPropagation()} style={{background:"#1c1c1e",borderRadius:24,padding:"36px",width:440,maxWidth:"90vw",border:"1px solid rgba(255,255,255,0.1)"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}><span style={{fontSize:32}}>{channel.i}</span><div><div style={{fontSize:20,fontWeight:700}}>{channel.n}</div><div style={{fontSize:14,color:"rgba(255,255,255,0.3)"}}>账号管理</div></div><button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.4)",cursor:"pointer"}}><X size={16}/></button></div>
    <Input value={u} onChange={e=>setU(e.target.value)} placeholder="账号（手机号/邮箱）"/>
    <div style={{position:"relative",marginBottom:14}}><Input value={p} onChange={e=>setP(e.target.value)} type={show?"text":"password"} placeholder="密码" style={{marginBottom:0,paddingRight:50}}/><button onClick={()=>setShow(!show)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer"}}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
    <Input value={n} onChange={e=>setN(e.target.value)} placeholder="备注（选填）"/>
    <div style={{display:"flex",gap:10,marginTop:8}}>{e.username&&<Btn danger onClick={()=>{onSave(channel.n,null);onClose();}}>删除</Btn>}<div style={{flex:1}}/><Btn onClick={onClose}>取消</Btn><Btn primary onClick={()=>{onSave(channel.n,{username:u,password:p,note:n});setSaved(true);setTimeout(onClose,600);}} disabled={!u.trim()}>{saved?<><Check size={16}/>已保存</>:<><Lock size={16}/>加密保存</>}</Btn></div>
  </div></div>;
}

// ======== LOCK SCREEN ========
function LockScreen({onUnlock}){const[mode,setMode]=useState("check");const[pwd,setPwd]=useState("");const[pwd2,setPwd2]=useState("");const[err,setErr]=useState("");
  useEffect(()=>{setMode(localStorage.getItem("geo_master_hash")?"unlock":"create");},[]);
  const hash=async p=>{const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(p+"_geo_salt"));return btoa(String.fromCharCode(...new Uint8Array(h)));};
  const create=async()=>{if(pwd.length<4){setErr("至少4位");return;}if(pwd!==pwd2){setErr("两次不一致");return;}localStorage.setItem("geo_master_hash",await hash(pwd));localStorage.setItem("geo_vault",await encrypt(pwd,{}));localStorage.setItem("geo_articles",await encrypt(pwd,[]));localStorage.setItem("geo_contact",await encrypt(pwd,{}));onUnlock(pwd);};
  const unlock=async()=>{if(await hash(pwd)!==localStorage.getItem("geo_master_hash")){setErr("密码错误");setPwd("");return;}onUnlock(pwd);};
  const reset=()=>{if(confirm("确定重置？将清除所有数据。")){["geo_vault","geo_master_hash","geo_articles","geo_contact"].forEach(k=>localStorage.removeItem(k));setMode("create");setPwd("");setPwd2("");setErr("");}};
  const is={width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px 20px",color:"#fff",fontSize:18,outline:"none",textAlign:"center",letterSpacing:4};
  return<div style={{height:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,sans-serif"}}><div style={{textAlign:"center",width:400,maxWidth:"90vw"}}>
    <div style={{width:80,height:80,borderRadius:24,background:"rgba(255,255,255,0.05)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>{mode==="create"?<KeyRound size={36} color="#007AFF"/>:<Lock size={36} color="#007AFF"/>}</div>
    <h1 style={{fontSize:28,fontWeight:700,color:"#fff",margin:"0 0 8px"}}>{mode==="create"?"设置主密码":"输入主密码"}</h1>
    <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",margin:"0 0 36px"}}>{mode==="create"?"用于加密保护账号信息和文章数据":"解锁后才能使用工具"}</p>
    {mode==="create"?<><input value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} type="password" placeholder="设置主密码" style={{...is,marginBottom:14}}/><input value={pwd2} onChange={e=>{setPwd2(e.target.value);setErr("");}} type="password" placeholder="再输一次" style={{...is,marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&create()}/>{err&&<div style={{color:"#FF3B30",fontSize:15,marginBottom:16}}>{err}</div>}<Btn primary onClick={create} disabled={!pwd||!pwd2} style={{width:"100%",justifyContent:"center",fontSize:18,padding:"16px"}}><KeyRound size={18}/>创建并进入</Btn></>:
    <><input value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} type="password" placeholder="输入主密码" style={{...is,marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&unlock()} autoFocus/>{err&&<div style={{color:"#FF3B30",fontSize:15,marginBottom:16}}>{err}</div>}<Btn primary onClick={unlock} disabled={!pwd} style={{width:"100%",justifyContent:"center",fontSize:18,padding:"16px"}}><Unlock size={18}/>解锁</Btn><button onClick={reset} style={{marginTop:20,background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:14}}>忘记密码？重置数据</button></>}
  </div></div>;
}

// ======== MAIN ========
export default function Home(){
  const[mp,setMp]=useState(null);
  const[accounts,setAccounts]=useState({});
  const[savedArticles,setSavedArticles]=useState([]);
  const[contactInfo,setContactInfo]=useState({wechat:"",phone:"",address:"",website:"",slogan:"",qrCode:""});
  const[editCh,setEditCh]=useState(null);
  const[loaded,setLoaded]=useState(false);

  // Load encrypted data
  useEffect(()=>{if(!mp)return;(async()=>{
    const v=localStorage.getItem("geo_vault");if(v){const d=await decrypt(mp,v);if(d)setAccounts(d);}
    const a=localStorage.getItem("geo_articles");if(a){const d=await decrypt(mp,a);if(d)setSavedArticles(d);}
    const c=localStorage.getItem("geo_contact");if(c){const d=await decrypt(mp,c);if(d)setContactInfo(prev=>({...prev,...d}));}
    setLoaded(true);
  })();},[mp]);

  // Auto-save encrypted data
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_vault",await encrypt(mp,accounts));})();},[accounts,mp,loaded]);
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_articles",await encrypt(mp,savedArticles));})();},[savedArticles,mp,loaded]);
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_contact",await encrypt(mp,contactInfo));})();},[contactInfo,mp,loaded]);

  const saveAccount=(n,d)=>setAccounts(p=>{const x={...p};if(d===null)delete x[n];else x[n]=d;return x;});

  const[tab,setTab]=useState("settings");
  const[api,setApi]=useState({deepseek:false,doubao:false,moonshot:false});
  const[brand,setBrand]=useState("");const[brandIn,setBrandIn]=useState("");
  const[compIn,setCompIn]=useState("");const[comps,setComps]=useState([]);
  const[kw,setKw]=useState("");const[qs,setQs]=useState([]);const[isGen,setIsGen]=useState(false);const[sel,setSel]=useState(new Set());
  const[mon,setMon]=useState([]);const[res,setRes]=useState([]);const[isCol,setIsCol]=useState(false);const[prog,setProg]=useState(0);const[expQ,setExpQ]=useState(null);const[expR,setExpR]=useState(null);
  const[cQ,setCQ]=useState(null);const[aType,setAType]=useState("guide");const[article,setArticle]=useState("");const[isGenA,setIsGenA]=useState(false);const[copied,setCopied]=useState(false);
  const[history]=useState(mockH);const[chFilter,setChFilter]=useState("all");
  const[viewArticle,setViewArticle]=useState(null);
  const fileRef=useRef(null);

  useEffect(()=>{fetch('/api/status').then(r=>r.json()).then(setApi).catch(()=>{});},[]);
  const anyApi=api.deepseek||api.doubao||api.moonshot;
  const am={DeepSeek:'deepseek','豆包':'doubao',Kimi:'moonshot'};

  if(!mp)return<LockScreen onUnlock={setMp}/>;

  // Build contact suffix for articles
  const contactSuffix = [
    contactInfo.slogan,
    contactInfo.phone ? `📞 电话：${contactInfo.phone}` : "",
    contactInfo.wechat ? `💬 微信：${contactInfo.wechat}` : "",
    contactInfo.website ? `🌐 官网：${contactInfo.website}` : "",
    contactInfo.address ? `📍 地址：${contactInfo.address}` : "",
  ].filter(Boolean).join("\n");

  // ===== KEYWORDS =====
  const genKw=useCallback(async()=>{if(!kw.trim())return;setIsGen(true);setQs([]);setSel(new Set());
    const prompt=`你是GEO关键词研究员。根据用户输入的关键词，生成真实用户在AI搜索平台上会输入的自然语言问题。

输入关键词：${kw.trim()}

生成6组，每组4个：
【初步了解】刚听说，想搞清楚是什么。句式：是什么、有什么用、和XX有什么区别。
【需求确认】在评估要不要做。句式：我这种情况适合吗、有没有必要。
【选购对比】决定要做了，在挑选。句式：哪家好、推荐、多少钱。
【行业场景】带具体行业来问。必须包含行业名称+怎么做。
【执行困惑】已在做但遇到问题。句式：没效果、上不去、怎么办。
【深度决策】最终决定前确认细节。句式：合同注意什么、效果怎么衡量。

口语化像真人打字、带地域背景、24个不重复。
JSON返回：[{"stage":"初步了解","question":"..."}]`;
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:2000})});const d=await r.json();if(d.text)setQs(JSON.parse(d.text.replace(/```json|```/g,"").trim()));else throw 0;}catch(e){
      const t={"初步了解":["到底是干什么的","和自己做有什么区别","有必要专门找人做吗","做了能带来什么"],"需求确认":["我这种小店有必要做吗","花几千块做值不值","多久能看到效果","不做被同行超过怎么办"],"选购对比":["哪家公司比较好","一般多少钱","怎么判断靠不靠谱","有性价比高的推荐吗"],"行业场景":["餐饮店怎么做能引流","教育机构做有用吗","工厂怎么获客","装修公司能接到单吗"],"执行困惑":["三个月没效果","播放量几十个","感觉被忽悠了","花了几万没客户"],"深度决策":["合同写清楚什么","效果不好能退吗","需要我配合什么","签多长时间合适"]};
      setQs(Object.entries(t).flatMap(([s,a])=>a.map(q=>({stage:s,question:`${kw}${q}`}))));
    }setIsGen(false);},[kw]);
  const toggleQ=i=>setSel(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});
  const addMon=()=>{const nq=[...sel].map(i=>({question:qs[i].question,category:qs[i].stage})).filter(q=>!mon.some(m=>m.question===q.question));if(nq.length){setMon(p=>[...p,...nq]);setSel(new Set());setTab("monitor");}};

  // ===== COLLECT =====
  const collect=useCallback(async()=>{if(!brand||!mon.length)return;setIsCol(true);setProg(0);const t=mon.length*PN.length,nr=[];for(let i=0;i<mon.length;i++){for(let j=0;j<PN.length;j++){const p=PN[j],k=am[p];let result;if(api[k]){try{const r=await fetch(PC[p].api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:mon[i].question}],max_tokens:2000})});const d=await r.json();if(d.text){const a=analyzeR(d.text,brand,comps);result={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,question:mon[i].question,platform:p,category:mon[i].category,...a,rawResponse:d.text,collectedAt:new Date().toISOString(),isReal:true};}else throw 0;}catch(e){result=mockR(mon[i].question,p,mon[i].category,brand,comps);}}else{await new Promise(r=>setTimeout(r,80+Math.random()*120));result=mockR(mon[i].question,p,mon[i].category,brand,comps);}nr.push(result);setProg(Math.round(((i*PN.length+j+1)/t)*100));}}setRes(nr);setIsCol(false);},[mon,brand,comps,api]);

  // ===== GENERATE (with contact info) =====
  const genArticle=useCallback(async()=>{if(!cQ)return;setIsGenA(true);setArticle("");setCopied(false);
    const tp={guide:"写一篇3000字以上行业深度指南。开头直接回答，有数据案例，自然融入品牌。",qa:"写一篇800-1500字精准问答。第一段直接给答案。",case:"写一篇1500-2500字案例复盘。客户背景→痛点→方案→数据结果。",compare:"写一篇2000-3000字选型对比评测。表格横向对比。"};
    const contactPrompt = contactSuffix ? `\n\n重要：在文章结尾自然地加入以下联系方式引导读者咨询，用"如果您有相关需求，欢迎联系我们"之类的自然过渡语：\n${contactSuffix}` : "";
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`你是GEO内容专家。目标问题：${cQ.question}\n品牌：${brand||"未设置"}\n竞对：${comps.join("、")||"暂无"}\n\n${tp[aType]}${contactPrompt}\n\nMarkdown格式，直接输出正文。`}],max_tokens:4000})});const d=await r.json();if(d.text)setArticle(d.text);else throw 0;}catch(e){setArticle(`# ${cQ.question}\n\n> API未连接，模拟内容。\n\n## 核心回答\n\n...${contactSuffix?"\n\n---\n\n"+contactSuffix:""}`);}
    setIsGenA(false);},[cQ,aType,brand,comps,contactSuffix]);

  // Save article
  const saveArticle=()=>{if(!article||!cQ)return;const item={id:`art-${Date.now()}`,question:cQ.question,type:aType,content:article,createdAt:new Date().toISOString(),wordCount:article.length};setSavedArticles(p=>[item,...p]);};

  const copyA=useCallback(async()=>{try{await navigator.clipboard.writeText(article)}catch(e){}setCopied(true);setTimeout(()=>setCopied(false),2500);},[article]);
  const copyText=async(t)=>{try{await navigator.clipboard.writeText(t)}catch(e){}};

  // QR upload
  const handleQrUpload=(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=(ev)=>{setContactInfo(p=>({...p,qrCode:ev.target.result}));};reader.readAsDataURL(file);};

  // ===== STATS =====
  const stats=useMemo(()=>{if(!res.length)return null;const score=Math.round(res.reduce((s,r)=>s+ST[r.myBrandStatus].score,0)/res.length);const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};res.forEach(r=>counts[r.myBrandStatus]++);const mr=Math.round(((res.length-counts["未出现"])/res.length)*100);const bp={};PN.forEach(p=>{const pr=res.filter(r=>r.platform===p);bp[p]={score:pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus].score,0)/pr.length):0,counts:{"首推":0,"被提及":0,"被引用":0,"未出现":0}};pr.forEach(r=>bp[p].counts[r.myBrandStatus]++);});const cf={};res.forEach(r=>r.competitors?.forEach(c=>{cf[c.name]=(cf[c.name]||0)+1;}));const cr=Object.entries(cf).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({name:n,count:c}));const mx={};mon.forEach(m=>{mx[m.question]={category:m.category};PN.forEach(p=>mx[m.question][p]="未出现");});res.forEach(r=>{if(mx[r.question])mx[r.question][r.platform]=r.myBrandStatus;});return{score,counts,mr,bp,cr,mx};},[res,mon]);
  const pie=stats?Object.entries(stats.counts).filter(([_,v])=>v>0).map(([n,v])=>({name:n,value:v})):[];
  const renderMd=(md)=>{if(!md)return null;return md.split("\n").map((l,i)=>{if(l.startsWith("# "))return<h1 key={i} style={{fontSize:28,fontWeight:700,color:"#fff",margin:"28px 0 14px"}}>{l.slice(2)}</h1>;if(l.startsWith("## "))return<h2 key={i} style={{fontSize:22,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:"24px 0 10px"}}>{l.slice(3)}</h2>;if(l.startsWith("### "))return<h3 key={i} style={{fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"18px 0 8px"}}>{l.slice(4)}</h3>;if(l.startsWith("> "))return<blockquote key={i} style={{borderLeft:"3px solid #007AFF",paddingLeft:20,margin:"14px 0",color:"rgba(255,255,255,0.5)",fontSize:16}}>{l.slice(2)}</blockquote>;if(l.startsWith("- ")||l.startsWith("* "))return<div key={i} style={{paddingLeft:20,margin:"5px 0",fontSize:16,color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>• {l.slice(2)}</div>;if(l.trim()==="")return<div key={i} style={{height:8}}/>;return<p key={i} style={{fontSize:16,color:"rgba(255,255,255,0.7)",lineHeight:1.8,margin:"6px 0"}}>{l}</p>;});};
  const filteredGroups=chFilter==="all"?CG:chFilter==="核心"?CG.map(g=>({...g,ch:g.ch.filter(c=>c.p==="核心")})).filter(g=>g.ch.length>0):CG.filter(g=>g.group.includes(chFilter));
  const tabs=[{id:"keywords",label:"关键词",icon:Search,n:"1"},{id:"monitor",label:"采集",icon:Radar,n:"2",badge:mon.length},{id:"content",label:"内容",icon:PenTool,n:"3"},{id:"articles",label:"文章库",icon:Archive,n:"",badge:savedArticles.length},{id:"publish",label:"发布",icon:Send,n:"4"},{id:"dashboard",label:"看板",icon:LayoutDashboard,n:"5"}];

  // ===== RENDER =====
  return(<div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#000",color:"#fff",fontFamily:"-apple-system,'SF Pro Display','Helvetica Neue',sans-serif"}}>
    {/* SIDEBAR */}
    <div style={{width:240,background:"rgba(255,255,255,0.03)",borderRight:"1px solid rgba(255,255,255,0.06)",padding:"28px 16px",display:"flex",flexDirection:"column",gap:4,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"0 12px",marginBottom:28}}><div style={{fontSize:22,fontWeight:700}}>GEO Monitor</div><div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:4}}>AI能见度监控</div></div>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,width:"100%",border:"none",background:tab===t.id?"rgba(255,255,255,0.08)":"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:16,fontWeight:tab===t.id?600:400}}>{t.n&&<span style={{fontSize:13,opacity:0.4}}>{t.n}</span>}<t.icon size={18}/><span>{t.label}</span>{t.badge>0&&<span style={{marginLeft:"auto",background:"#007AFF",color:"#fff",fontSize:12,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{t.badge}</span>}</button>)}
      <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"12px 8px"}}/>
      <button onClick={()=>setTab("settings")} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,width:"100%",border:"none",background:tab==="settings"?"rgba(255,255,255,0.08)":"transparent",color:tab==="settings"?"#fff":"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:16}}><Settings size={18}/>设置</button>
      <div style={{flex:1}}/>
      <div style={{padding:"14px",background:"rgba(255,255,255,0.03)",borderRadius:14,margin:"0 4px"}}><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>{anyApi?<Wifi size={12} style={{color:"#34C759"}}/>:<WifiOff size={12} style={{color:"#FF3B30"}}/>}API状态</div>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:8,fontSize:14,marginBottom:5}}><span style={{width:8,height:8,borderRadius:"50%",background:api[am[p]]?"#34C759":"rgba(255,255,255,0.15)"}}/><span style={{color:api[am[p]]?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.25)"}}>{p}</span></div>)}</div>
      {brand&&<div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:14,margin:"8px 4px 0"}}><div style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>品牌</div><div style={{fontSize:16,fontWeight:600,color:"#34C759",marginTop:2}}>{brand}</div></div>}
    </div>

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",padding:"40px 48px"}}>

      {/* SETTINGS */}
      {tab==="settings"&&<div style={{maxWidth:640}}>
        <h1 style={{fontSize:34,fontWeight:700,margin:"0 0 36px"}}>设置</h1>
        {/* API */}
        <Card><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>API连接</div><div style={{display:"flex",gap:24,marginTop:16}}>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:10,height:10,borderRadius:"50%",background:api[am[p]]?"#34C759":"rgba(255,255,255,0.15)"}}/><span style={{fontSize:17,color:api[am[p]]?"#fff":"rgba(255,255,255,0.3)"}}>{p} {api[am[p]]?"✓":"✗"}</span></div>)}</div></Card>
        {/* Brand */}
        <Card><Label>品牌名称</Label><div style={{display:"flex",gap:12}}><Input value={brandIn} onChange={e=>setBrandIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&brandIn.trim()&&setBrand(brandIn.trim())} placeholder="输入品牌名或公司名" style={{marginBottom:0,flex:1}}/><Btn primary onClick={()=>brandIn.trim()&&setBrand(brandIn.trim())} disabled={!brandIn.trim()}>保存</Btn></div>{brand&&<div style={{marginTop:12,fontSize:16,color:"#34C759",display:"flex",alignItems:"center",gap:8}}><CheckCircle2 size={16}/>当前：{brand}</div>}</Card>
        {/* Competitors */}
        <Card><Label>竞对品牌</Label><Input value={compIn} onChange={e=>setCompIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const c=compIn.trim();if(c&&!comps.includes(c)){setComps(p=>[...p,c]);setCompIn("");}}}} placeholder="输入竞对名，回车添加"/><div style={{display:"flex",flexWrap:"wrap",gap:10}}>{comps.map(c=><span key={c} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 16px",background:"rgba(255,255,255,0.06)",borderRadius:12,fontSize:15,color:"rgba(255,255,255,0.7)"}}>{c}<button onClick={()=>setComps(p=>p.filter(x=>x!==c))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",padding:0,display:"flex"}}><X size={14}/></button></span>)}</div></Card>
        {/* Contact Info - NEW */}
        <Card>
          <Label>引流信息</Label>
          <SubLabel>填写后生成的文章会自动在结尾植入你的联系方式</SubLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><MessageCircle size={14}/>微信号</div><Input value={contactInfo.wechat} onChange={e=>setContactInfo(p=>({...p,wechat:e.target.value}))} placeholder="如：your_wechat_id"/></div>
            <div><div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><Phone size={14}/>电话</div><Input value={contactInfo.phone} onChange={e=>setContactInfo(p=>({...p,phone:e.target.value}))} placeholder="如：138xxxx8888"/></div>
            <div><div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><Globe size={14}/>官网</div><Input value={contactInfo.website} onChange={e=>setContactInfo(p=>({...p,website:e.target.value}))} placeholder="如：www.yoursite.com"/></div>
            <div><div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><MapPin size={14}/>地址</div><Input value={contactInfo.address} onChange={e=>setContactInfo(p=>({...p,address:e.target.value}))} placeholder="如：济南市历下区xxx"/></div>
          </div>
          <div style={{marginBottom:14}}><div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><Sparkles size={14}/>引流话术</div><Input value={contactInfo.slogan} onChange={e=>setContactInfo(p=>({...p,slogan:e.target.value}))} placeholder="如：免费诊断你的短视频账号，加微信领取方案"/></div>
          {/* QR Code */}
          <div><div style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:10,display:"flex",alignItems:"center",gap:6}}><QrCode size={14}/>二维码</div>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              {contactInfo.qrCode?<div style={{position:"relative"}}><img src={contactInfo.qrCode} style={{width:120,height:120,borderRadius:12,objectFit:"cover",border:"1px solid rgba(255,255,255,0.1)"}}/><button onClick={()=>setContactInfo(p=>({...p,qrCode:""}))} style={{position:"absolute",top:-8,right:-8,width:24,height:24,borderRadius:12,background:"#FF3B30",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={12}/></button></div>:
              <button onClick={()=>fileRef.current?.click()} style={{width:120,height:120,borderRadius:12,border:"2px dashed rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.02)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,color:"rgba(255,255,255,0.3)",fontSize:14}}><Image size={24}/>上传二维码</button>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleQrUpload} style={{display:"none"}}/>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.25)",maxWidth:240}}>上传微信二维码或公众号二维码，复制文章时可一并使用。支持 JPG / PNG 格式。</div>
            </div>
          </div>
          {contactSuffix&&<div style={{marginTop:20,padding:"16px 20px",background:"rgba(255,255,255,0.03)",borderRadius:12}}><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:8}}>文章末尾将自动添加：</div><div style={{fontSize:15,color:"rgba(255,255,255,0.6)",whiteSpace:"pre-line",lineHeight:1.7}}>{contactSuffix}</div></div>}
        </Card>
        {brand&&<Btn primary onClick={()=>setTab("keywords")} style={{fontSize:18,padding:"16px 36px"}}>开始使用 <ArrowRight size={18}/></Btn>}
      </div>}

      {/* KEYWORDS */}
      {tab==="keywords"&&<div>
        <h1 style={{fontSize:34,fontWeight:700,margin:"0 0 36px"}}>关键词扩展</h1>
        <div style={{display:"flex",gap:14,marginBottom:36}}><Input value={kw} onChange={e=>setKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genKw()} placeholder="输入关键词，如：济南短视频运营" style={{flex:1,marginBottom:0,borderRadius:16,padding:"16px 24px",fontSize:18}}/><Btn primary onClick={genKw} disabled={isGen||!kw.trim()} style={{fontSize:17,padding:"16px 32px"}}>{isGen?<><Loader2 size={18} className="spin"/>生成中</>:<><Zap size={18}/>生成问题</>}</Btn></div>
        {qs.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><span style={{fontSize:17,color:"rgba(255,255,255,0.5)"}}>共<b style={{color:"#fff"}}>{qs.length}</b>个 · 已选<b style={{color:"#007AFF"}}>{sel.size}</b>个</span><div style={{display:"flex",gap:10}}><Btn onClick={()=>setSel(p=>p.size===qs.length?new Set():new Set(qs.map((_,i)=>i)))}>{sel.size===qs.length?"取消":"全选"}</Btn><Btn primary onClick={addMon} disabled={!sel.size}><Plus size={16}/>加入监控</Btn></div></div>
        {STAGES.map(stg=>{const sq=qs.map((q,i)=>({...q,idx:i})).filter(q=>q.stage===stg.key);if(!sq.length)return null;return<div key={stg.key} style={{marginBottom:28}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:22}}>{stg.emoji}</span><span style={{fontSize:18,fontWeight:600,color:stg.color}}>{stg.key}</span><span style={{fontSize:15,color:"rgba(255,255,255,0.3)"}}>{stg.desc}</span></div>{sq.map(q=><div key={q.idx} onClick={()=>toggleQ(q.idx)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",background:sel.has(q.idx)?"rgba(0,122,255,0.08)":"rgba(255,255,255,0.02)",border:sel.has(q.idx)?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.04)",borderRadius:14,marginBottom:6,cursor:"pointer"}}><div style={{width:22,height:22,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:sel.has(q.idx)?"#007AFF":"rgba(255,255,255,0.06)",border:sel.has(q.idx)?"none":"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>{sel.has(q.idx)&&<Check size={14} color="#fff"/>}</div><span style={{fontSize:16,color:sel.has(q.idx)?"#fff":"rgba(255,255,255,0.6)"}}>{q.question}</span></div>)}</div>})}</>}
        {!qs.length&&!isGen&&<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:48,marginBottom:16}}>🔍</div><div style={{fontSize:20,color:"rgba(255,255,255,0.4)"}}>输入关键词，生成AI搜索问题</div></div>}
      </div>}

      {/* MONITOR */}
      {tab==="monitor"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}><div><h1 style={{fontSize:34,fontWeight:700,margin:"0 0 8px"}}>采集监控</h1><p style={{fontSize:17,color:"rgba(255,255,255,0.4)",margin:0}}>{mon.length}问题 × {PN.length}平台</p></div><div style={{display:"flex",gap:10}}>{mon.length>0&&<Btn onClick={()=>{setMon([]);setRes([]);}}><Trash2 size={15}/>清空</Btn>}<Btn primary onClick={collect} disabled={isCol||!mon.length||!brand}>{isCol?<><Loader2 size={16} className="spin"/>{prog}%</>:<><RefreshCw size={16}/>开始采集</>}</Btn></div></div>
        {isCol&&<div style={{marginBottom:20}}><div style={{background:"rgba(255,255,255,0.05)",borderRadius:8,height:6,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#007AFF,#34C759)",transition:"width 0.3s"}}/></div></div>}
        {!mon.length?<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:48,marginBottom:16}}>📡</div><div style={{fontSize:20,color:"rgba(255,255,255,0.4)"}}>监控列表为空</div><Btn primary onClick={()=>setTab("keywords")} style={{marginTop:20}}>去生成关键词</Btn></div>:
        mon.map((m,qi)=>{const qr=res.filter(r=>r.question===m.question);const isE=expQ===qi;const sc=STAGES.find(s=>s.key===m.category);return<div key={qi} style={{background:"rgba(255,255,255,0.03)",borderRadius:16,marginBottom:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",cursor:"pointer"}} onClick={()=>setExpQ(isE?null:qi)}>{sc&&<span>{sc.emoji}</span>}<span style={{flex:1,fontSize:16,color:"rgba(255,255,255,0.8)"}}>{m.question}</span>{qr.length>0&&<div style={{display:"flex",gap:6}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);return r?<Badge key={p} status={r.myBrandStatus}/>:null;})}</div>}{isE?<ChevronUp size={18} color="rgba(255,255,255,0.3)"/>:<ChevronDown size={18} color="rgba(255,255,255,0.3)"/>}<button onClick={e=>{e.stopPropagation();setMon(p=>p.filter((_,i)=>i!==qi));}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.15)",cursor:"pointer"}}><X size={16}/></button></div>
          {isE&&qr.length>0&&<div style={{padding:"0 20px 20px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);if(!r)return null;const isD=expR===r.id;return<div key={p} style={{marginTop:12,background:"rgba(0,0,0,0.3)",borderRadius:14,overflow:"hidden"}}><div onClick={()=>setExpR(isD?null:r.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",cursor:"pointer"}}><span style={{fontSize:16,fontWeight:600,color:PC[p].color}}>{PC[p].icon} {p}</span><Badge status={r.myBrandStatus}/>{r.isReal&&<span style={{fontSize:12,padding:"3px 8px",borderRadius:6,background:"rgba(52,199,89,0.12)",color:"#34C759"}}>真实数据</span>}</div>{isD&&<div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(255,255,255,0.04)"}}><div style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.7,whiteSpace:"pre-wrap",background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"16px",marginTop:10,maxHeight:300,overflowY:"auto"}}>{r.rawResponse}</div></div>}</div>;})}</div>}
        </div>;})}
      </div>}

      {/* CONTENT */}
      {tab==="content"&&<div>
        <h1 style={{fontSize:34,fontWeight:700,margin:"0 0 36px"}}>内容生成</h1>
        <Card><Label>选择问题</Label>{!mon.length?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:16,padding:16}}>列表为空 <Btn onClick={()=>setTab("keywords")} style={{marginLeft:12}}>去生成</Btn></div>:<div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>{mon.map((m,i)=><div key={i} onClick={()=>setCQ(m)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderRadius:12,cursor:"pointer",background:cQ?.question===m.question?"rgba(0,122,255,0.1)":"rgba(255,255,255,0.02)",border:cQ?.question===m.question?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.04)"}}><span style={{fontSize:16,color:cQ?.question===m.question?"#007AFF":"rgba(255,255,255,0.5)",flex:1}}>{m.question}</span>{cQ?.question===m.question&&<CheckCircle2 size={18} color="#007AFF"/>}</div>)}</div>}</Card>
        <Card><Label>文章类型</Label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{AT.map(t=>{const a=aType===t.key;const I=t.icon;return<div key={t.key} onClick={()=>setAType(t.key)} style={{padding:"18px 22px",borderRadius:16,cursor:"pointer",background:a?"rgba(0,122,255,0.1)":"rgba(255,255,255,0.02)",border:a?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.04)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><I size={18} style={{color:a?"#007AFF":"rgba(255,255,255,0.4)"}}/><span style={{fontSize:17,fontWeight:600,color:a?"#007AFF":"rgba(255,255,255,0.7)"}}>{t.label}</span></div><div style={{fontSize:15,color:"rgba(255,255,255,0.3)"}}>{t.desc}</div></div>;})}</div></Card>
        {contactSuffix&&<div style={{background:"rgba(52,199,89,0.06)",borderRadius:14,padding:"14px 20px",marginBottom:24,fontSize:14,color:"#34C759",display:"flex",alignItems:"center",gap:10}}><CheckCircle2 size={16}/>文章结尾将自动植入你的引流信息</div>}
        <Btn primary onClick={genArticle} disabled={!cQ||isGenA} style={{fontSize:18,padding:"16px 36px",marginBottom:28}}>{isGenA?<><Loader2 size={18} className="spin"/>生成中...</>:<><Sparkles size={18}/>一键生成文章</>}</Btn>
        {article&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:20,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 28px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <span style={{fontSize:17,fontWeight:600}}>文章预览 · {article.length}字</span>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={saveArticle}><Archive size={15}/>保存到文章库</Btn>
              <Btn onClick={copyA}>{copied?<><Check size={15}/>已复制</>:<><Copy size={15}/>复制全文</>}</Btn>
              <Btn primary onClick={()=>setTab("publish")}><Send size={15}/>去发布</Btn>
            </div>
          </div>
          <div style={{padding:"24px 32px",maxHeight:500,overflowY:"auto"}}>{renderMd(article)}</div>
        </div>}
      </div>}

      {/* ARTICLES LIBRARY - NEW */}
      {tab==="articles"&&<div>
        <h1 style={{fontSize:34,fontWeight:700,margin:"0 0 8px"}}>文章库</h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,0.4)",margin:"0 0 36px"}}>所有生成并保存的文章，加密存储在本地</p>
        {viewArticle?<div>
          <Btn onClick={()=>setViewArticle(null)} style={{marginBottom:20}}>← 返回列表</Btn>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:20,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 28px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div><div style={{fontSize:17,fontWeight:600}}>{viewArticle.question}</div><div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:4}}>{AT.find(t=>t.key===viewArticle.type)?.label} · {viewArticle.wordCount}字 · {new Date(viewArticle.createdAt).toLocaleDateString("zh-CN")}</div></div>
              <div style={{display:"flex",gap:10}}><Btn onClick={()=>copyText(viewArticle.content)}><Copy size={15}/>复制</Btn><Btn primary onClick={()=>{setArticle(viewArticle.content);setTab("publish");}}><Send size={15}/>去发布</Btn></div>
            </div>
            <div style={{padding:"24px 32px",maxHeight:600,overflowY:"auto"}}>{renderMd(viewArticle.content)}</div>
          </div>
        </div>:
        savedArticles.length===0?<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:48,marginBottom:16}}>📚</div><div style={{fontSize:20,color:"rgba(255,255,255,0.4)"}}>还没有保存的文章</div><div style={{fontSize:16,color:"rgba(255,255,255,0.2)",marginTop:8}}>在「内容生成」页面生成文章后点击"保存到文章库"</div></div>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {savedArticles.map(a=><div key={a.id} style={{background:"rgba(255,255,255,0.03)",borderRadius:16,padding:"20px 24px",border:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:16,cursor:"pointer"}} onClick={()=>setViewArticle(a)}>
            <div style={{width:48,height:48,borderRadius:12,background:"rgba(0,122,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FileText size={22} color="#007AFF"/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:17,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.question}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:4,display:"flex",alignItems:"center",gap:12}}>
                <span>{AT.find(t=>t.key===a.type)?.label}</span>
                <span>{a.wordCount}字</span>
                <span style={{display:"flex",alignItems:"center",gap:4}}><Clock size={12}/>{new Date(a.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={e=>{e.stopPropagation();copyText(a.content);}}><Copy size={14}/>复制</Btn>
              <Btn danger onClick={e=>{e.stopPropagation();setSavedArticles(p=>p.filter(x=>x.id!==a.id));}}><Trash2 size={14}/></Btn>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.2)"/>
          </div>)}
        </div>}
      </div>}

      {/* PUBLISH */}
      {tab==="publish"&&<div>
        <h1 style={{fontSize:34,fontWeight:700,margin:"0 0 28px"}}>渠道发布</h1>
        {article?<div style={{background:"rgba(52,199,89,0.06)",border:"1px solid rgba(52,199,89,0.15)",borderRadius:20,padding:"20px 28px",marginBottom:32,display:"flex",alignItems:"center",gap:16}}><FileText size={22} style={{color:"#34C759"}}/><div style={{flex:1}}><div style={{fontSize:18,fontWeight:600,color:"#34C759"}}>文章已就绪 · {article.length}字</div></div><Btn primary onClick={copyA}>{copied?<><Check size={16}/>已复制</>:<><Copy size={16}/>一键复制全文</>}</Btn></div>:<div style={{background:"rgba(255,149,0,0.06)",border:"1px solid rgba(255,149,0,0.15)",borderRadius:20,padding:"20px 28px",marginBottom:32,display:"flex",alignItems:"center",gap:16}}><AlertCircle size={22} style={{color:"#FF9500"}}/><div style={{flex:1}}><div style={{fontSize:18,fontWeight:600,color:"#FF9500"}}>还没有文章</div></div><Btn onClick={()=>setTab("content")}>去生成</Btn></div>}
        <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>{[{k:"all",l:"全部"},{k:"核心",l:"只看核心"},{k:"字节",l:"字节系"},{k:"百度",l:"百度系"},{k:"腾讯",l:"腾讯系"},{k:"新闻",l:"新闻媒体"},{k:"垂直",l:"垂直平台"},{k:"社交",l:"社交种草"}].map(f=><button key={f.k} onClick={()=>setChFilter(f.k)} style={{padding:"8px 18px",borderRadius:20,fontSize:15,fontWeight:500,border:"none",cursor:"pointer",background:chFilter===f.k?"#007AFF":"rgba(255,255,255,0.06)",color:chFilter===f.k?"#fff":"rgba(255,255,255,0.4)"}}>{f.l}</button>)}</div>
        {filteredGroups.map(g=><div key={g.group} style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{width:10,height:10,borderRadius:"50%",background:g.color}}/><span style={{fontSize:18,fontWeight:600,color:g.color}}>{g.group}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {g.ch.map(ch=>{const ha=!!accounts[ch.n];return<div key={ch.n} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:16,padding:"18px 22px",display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:28}}>{ch.i}</span>
              <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16,fontWeight:600}}>{ch.n}</span><span style={{fontSize:12,fontWeight:600,padding:"2px 8px",borderRadius:6,background:ch.p==="核心"?"rgba(52,199,89,0.12)":ch.p==="重要"?"rgba(0,122,255,0.12)":"rgba(255,255,255,0.05)",color:ch.p==="核心"?"#34C759":ch.p==="重要"?"#007AFF":"rgba(255,255,255,0.3)"}}>{ch.p}</span></div><div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:4}}>{ch.d}</div>{ha&&<div style={{fontSize:13,color:"rgba(255,255,255,0.25)",marginTop:3}}><User size={11} style={{display:"inline",verticalAlign:-1}}/> {accounts[ch.n].username}</div>}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                <a href={ch.u} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:12,fontSize:14,fontWeight:600,background:"rgba(0,122,255,0.1)",color:"#007AFF",border:"none",textDecoration:"none",justifyContent:"center"}}>去发布<ExternalLink size={13}/></a>
                <button onClick={()=>setEditCh(ch)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,fontSize:13,background:ha?"rgba(52,199,89,0.08)":"rgba(255,255,255,0.04)",color:ha?"#34C759":"rgba(255,255,255,0.3)",border:"none",justifyContent:"center",cursor:"pointer"}}>{ha?<><Lock size={12}/>账号</>:<><KeyRound size={12}/>存账号</>}</button>
              </div>
            </div>;})}
          </div>
        </div>)}
      </div>}

      {/* DASHBOARD */}
      {tab==="dashboard"&&<div>
        <h1 style={{fontSize:34,fontWeight:700,margin:"0 0 36px"}}>效果看板</h1>
        {!stats?<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:48,marginBottom:16}}>📊</div><div style={{fontSize:20,color:"rgba(255,255,255,0.4)"}}>暂无数据</div><Btn primary onClick={()=>setTab("monitor")} style={{marginTop:20}}>去采集</Btn></div>:<>
          <div style={{display:"flex",gap:16,marginBottom:32}}><StatCard label="能见度评分" value={stats.score} color="#34C759" sub="0-100"/><StatCard label="提及率" value={stats.mr+"%"} color="#007AFF" sub="出现/总查询"/><StatCard label="首推" value={stats.counts["首推"]} color="#FF9500" sub={`共${res.length}次`}/></div>
          <div style={{display:"flex",gap:16,marginBottom:32}}>
            <Card style={{flex:1}}><Label>状态分布</Label><div style={{display:"flex",alignItems:"center",gap:24}}><div style={{width:140,height:140}}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} strokeWidth={0}>{pie.map((d,i)=><Cell key={i} fill={ST[d.name].color}/>)}</Pie></PieChart></ResponsiveContainer></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>{Object.entries(stats.counts).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:10,fontSize:15}}><span style={{width:10,height:10,borderRadius:4,background:ST[s].color}}/><span style={{color:"rgba(255,255,255,0.6)",flex:1}}>{s}</span><span style={{fontWeight:700,color:ST[s].color}}>{c}</span></div>)}</div></div></Card>
            <Card style={{flex:1}}><Label>平台得分</Label>{PN.map(p=>{const ps=stats.bp[p];return<div key={p} style={{marginBottom:18}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:16,fontWeight:600,color:PC[p].color}}>{PC[p].icon} {p}</span><span style={{fontSize:24,fontWeight:700,color:PC[p].color}}>{ps.score}</span></div><div style={{display:"flex",gap:2,height:8,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,0.05)"}}>{["首推","被提及","被引用","未出现"].map(s=>{const t=Object.values(ps.counts).reduce((a,b)=>a+b,0);const pct=t>0?(ps.counts[s]/t*100):0;return pct>0?<div key={s} style={{width:`${pct}%`,background:ST[s].color}}/>:null;})}</div></div>;})}</Card>
          </div>
          <Card><Label>状态矩阵</Label><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px"}}><thead><tr><th style={{textAlign:"left",padding:"8px 12px",color:"rgba(255,255,255,0.3)",fontSize:14}}>问题</th>{PN.map(p=><th key={p} style={{textAlign:"center",padding:"8px",color:PC[p].color,fontSize:14,width:110}}>{p}</th>)}</tr></thead><tbody>{Object.entries(stats.mx).map(([q,d])=><tr key={q}><td style={{padding:"12px 14px",fontSize:15,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.02)",borderRadius:"10px 0 0 10px",maxWidth:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q}</td>{PN.map((p,pi)=><td key={p} style={{textAlign:"center",padding:"10px 6px",background:"rgba(255,255,255,0.02)",borderRadius:pi===PN.length-1?"0 10px 10px 0":0}}><Badge status={d[p]}/></td>)}</tr>)}</tbody></table></div></Card>
          {stats.cr.length>0&&<Card><Label>竞对排行</Label><div style={{height:Math.max(160,stats.cr.length*36)}}><ResponsiveContainer><BarChart data={stats.cr} layout="vertical" margin={{left:100,right:24}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis type="number" tick={{fill:"rgba(255,255,255,0.3)",fontSize:13}} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/><YAxis type="category" dataKey="name" tick={{fill:"rgba(255,255,255,0.6)",fontSize:14}} axisLine={false} tickLine={false} width={95}/><Tooltip contentStyle={{background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:14}}/><Bar dataKey="count" radius={[0,8,8,0]} barSize={22}>{stats.cr.map((_,i)=><Cell key={i} fill={["#FF3B30","#FF9500","#007AFF","#AF52DE","#34C759"][i%5]}/>)}</Bar></BarChart></ResponsiveContainer></div></Card>}
          <Card><Label>能见度趋势</Label><div style={{height:220}}><ResponsiveContainer><LineChart data={history} margin={{left:0,right:20,top:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="week" tick={{fill:"rgba(255,255,255,0.3)",fontSize:13}} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/><YAxis tick={{fill:"rgba(255,255,255,0.3)",fontSize:13}} axisLine={{stroke:"rgba(255,255,255,0.06)"}} domain={[0,100]}/><Tooltip contentStyle={{background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:14}}/><Line type="monotone" dataKey="score" stroke="#007AFF" strokeWidth={2.5} dot={{fill:"#007AFF",r:4,strokeWidth:0}} name="能见度"/></LineChart></ResponsiveContainer></div></Card>
        </>}
      </div>}
    </div>

    {editCh&&<PwdModal channel={editCh} accounts={accounts} onSave={saveAccount} onClose={()=>setEditCh(null)}/>}

    <style>{`@keyframes spin{to{transform:rotate(360deg);}}.spin{animation:spin 1s linear infinite;}*{box-sizing:border-box;margin:0;padding:0;}html,body,#__next{height:100%;}::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px;}input::placeholder{color:rgba(255,255,255,0.2);}button{cursor:pointer;transition:opacity 0.15s;}button:hover:not(:disabled){opacity:0.85;}button:disabled{cursor:default;}a{transition:opacity 0.15s;}a:hover{opacity:0.85;}`}</style>
  </div>);
}
