import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Search, Radar, LayoutDashboard, Plus, Zap, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Star, Eye, EyeOff, Quote, ArrowRight, X, Settings, RefreshCw, Trash2, ExternalLink, Target, Award, BarChart3, Sparkles, FileText, Copy, Check, BookOpen, Send, PenTool, Wifi, WifiOff, Lock, Unlock, KeyRound, User, Phone, MessageCircle, MapPin, QrCode, Image, Archive, Clock, ChevronRight, Database, RotateCw, ClipboardList, Tag, FolderOpen } from "lucide-react";

// ======== CRYPTO ========
async function dk(p,s){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:s,iterations:100000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);}
async function EN(p,d){const s=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await dk(p,s),e=await crypto.subtle.encrypt({name:"AES-GCM",iv},k,new TextEncoder().encode(JSON.stringify(d))),b=new Uint8Array(s.length+iv.length+e.byteLength);b.set(s,0);b.set(iv,16);b.set(new Uint8Array(e),28);return btoa(String.fromCharCode(...b));}
async function DE(p,b){try{const a=Uint8Array.from(atob(b),c=>c.charCodeAt(0)),k=await dk(p,a.slice(0,16)),d=await crypto.subtle.decrypt({name:"AES-GCM",iv:a.slice(16,28)},k,a.slice(28));return JSON.parse(new TextDecoder().decode(d));}catch(e){return null;}}

// ======== CONFIG ========
const PC={DeepSeek:{color:"#007AFF",icon:"🔍",api:"/api/deepseek"},"豆包":{color:"#FF6B2C",icon:"🫘",api:"/api/doubao"},Kimi:{color:"#AF52DE",icon:"🌙",api:"/api/moonshot"}};
const PN=Object.keys(PC);
const ST={"首推":{color:"#34C759",bg:"rgba(52,199,89,0.12)",icon:Star,score:100},"被提及":{color:"#007AFF",bg:"rgba(0,122,255,0.12)",icon:Eye,score:60},"被引用":{color:"#FF9500",bg:"rgba(255,149,0,0.12)",icon:Quote,score:30},"未出现":{color:"#8E8E93",bg:"rgba(142,142,147,0.08)",icon:EyeOff,score:0}};
const STAGES=[{key:"TOFU-痛点驱动",color:"#007AFF",emoji:"😣",desc:"遇到问题怎么办"},{key:"TOFU-需求评估",color:"#5856D6",emoji:"🤔",desc:"要不要做"},{key:"MOFU-选型对比",color:"#34C759",emoji:"🛒",desc:"找谁做、多少钱"},{key:"MOFU-避坑决策",color:"#FF9500",emoji:"⚠️",desc:"怎么不被坑"},{key:"BOFU-品牌验证",color:"#FF3B30",emoji:"🔍",desc:"这家靠谱吗"},{key:"BOFU-效果诊断",color:"#AF52DE",emoji:"😰",desc:"做了没效果"}];
const CG=[{group:"通用高权重",color:"#34C759",ch:[{n:"知乎专栏",i:"📝",u:"https://zhuanlan.zhihu.com/write",d:"AI引用率最高",p:"核心"},{n:"知乎回答",i:"💬",u:"https://www.zhihu.com",d:"场景问答首选",p:"核心"},{n:"CSDN",i:"🖥",u:"https://editor.csdn.net/md",d:"技术内容权重极高",p:"核心"},{n:"博客园",i:"🌿",u:"https://i.cnblogs.com/posts/edit",d:"多AI平台引用",p:"重要"}]},{group:"字节生态",color:"#FF6B2C",ch:[{n:"头条号",i:"📱",u:"https://mp.toutiao.com/profile_v4/graphic/publish",d:"豆包核心源",p:"核心"},{n:"抖音",i:"🎵",u:"https://creator.douyin.com",d:"豆包直接抓取",p:"核心"},{n:"抖音百科",i:"📖",u:"https://www.douyin.com/encyclopedia",d:"知识类",p:"重要"}]},{group:"百度生态",color:"#007AFF",ch:[{n:"百家号",i:"📰",u:"https://baijiahao.baidu.com/builder/rc/edit",d:"文心一言核心",p:"核心"},{n:"百度百科",i:"📚",u:"https://baike.baidu.com",d:"最高权威",p:"核心"},{n:"百度知道",i:"❓",u:"https://zhidao.baidu.com",d:"问答高频",p:"重要"}]},{group:"腾讯生态",color:"#5856D6",ch:[{n:"微信公众号",i:"💚",u:"https://mp.weixin.qq.com",d:"元宝核心源",p:"核心"},{n:"腾讯新闻",i:"📺",u:"https://om.qq.com/article/articleIndex",d:"元宝引用",p:"重要"}]},{group:"新闻媒体",color:"#FF3B30",ch:[{n:"搜狐号",i:"🔶",u:"https://mp.sohu.com/mpfe/v3/main/new-batch/article",d:"高权重门户",p:"核心"},{n:"新浪财经",i:"🔴",u:"https://cj.sina.com.cn",d:"财经高权重",p:"重要"},{n:"网易号",i:"📡",u:"https://mp.163.com",d:"覆盖面广",p:"重要"}]},{group:"垂直&种草",color:"#AF52DE",ch:[{n:"简书",i:"📖",u:"https://www.jianshu.com/writer",d:"长文友好",p:"重要"},{n:"小红书",i:"📕",u:"https://creator.xiaohongshu.com",d:"口碑建设",p:"重要"},{n:"微博",i:"🔵",u:"https://weibo.com",d:"社交声量",p:"补充"}]}];
const AT=[{key:"guide",label:"行业深度指南",desc:"3000-5000字",icon:BookOpen},{key:"qa",label:"场景化问答",desc:"800-1500字",icon:Search},{key:"case",label:"案例深度复盘",desc:"1500-2500字",icon:Target},{key:"compare",label:"选型对比评测",desc:"2000-3000字",icon:BarChart3}];
const KB_CATS=["公司介绍","客户案例","服务说明","行业数据","公众号素材","其他"];

// ======== HELPERS ========
function analyzeR(t,b,cs){const bl=b.toLowerCase(),has=t.toLowerCase().includes(bl),ls=t.split('\n').filter(l=>/^[\d•\-\*]/.test(l.trim()));let pos=null,f=false;if(ls.length>0)for(let i=0;i<ls.length;i++)if(ls[i].toLowerCase().includes(bl)){pos=i+1;if(i===0)f=true;break;}let s="未出现";if(f)s="首推";else if(has&&pos)s="被提及";else if(has)s="被引用";return{myBrandStatus:s,competitors:cs.filter(c=>t.includes(c)).map((n,i)=>({name:n,position:i+1})),responseQuality:ls.length>0?"详细推荐":"泛泛回答"};}
function mockR(q,p,c,b,cs){const w={"TOFU-痛点驱动":[3,8,25,64],"TOFU-需求评估":[5,10,20,65],"MOFU-选型对比":[18,22,15,45],"MOFU-避坑决策":[8,15,22,55],"BOFU-品牌验证":[12,18,20,50],"BOFU-效果诊断":[6,10,22,62]}[c]||[10,15,20,55];const r=Math.random()*100;const s=r<w[0]?"首推":r<w[0]+w[1]?"被提及":r<w[0]+w[1]+w[2]?"被引用":"未出现";const mc=[...cs].sort(()=>Math.random()-.5).slice(0,2+Math.floor(Math.random()*3)).map((n,i)=>({name:n,position:i+1}));return{id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,question:q,platform:p,category:c,myBrandStatus:s,competitors:mc,responseQuality:"泛泛回答",rawResponse:`[模拟] ${p}对"${q}"的回答。${s!=="未出现"?`提到了${b}。`:""}`,collectedAt:new Date().toISOString(),isReal:false};}
function mockH(){return Array.from({length:8},(_,i)=>({week:`W${i+1}`,score:Math.min(92,Math.round(12+i*9.5+Math.random()*8)),mentioned:Math.round(3+i*2+Math.random()*4)}));}

// ======== UI ========
function Badge({status}){const s=ST[status]||ST["未出现"];const I=s.icon;return<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,background:s.bg,color:s.color,fontSize:13,fontWeight:600}}><I size={13}/>{status}</span>;}
function StatCard({label,value,sub,color}){return<div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:"28px",flex:1,minWidth:170}}><div style={{fontSize:15,color:"rgba(255,255,255,0.5)",marginBottom:12}}>{label}</div><div style={{fontSize:40,fontWeight:700,color:color||"#fff",letterSpacing:-2,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:12}}>{sub}</div>}</div>;}
const Btn=({children,primary,danger,small,disabled,onClick,style:s})=><button onClick={onClick} disabled={disabled} style={{padding:small?"8px 16px":primary?"14px 32px":"10px 20px",borderRadius:small?10:14,border:"none",fontSize:small?13:primary?17:15,fontWeight:600,background:disabled?"rgba(255,255,255,0.05)":danger?"rgba(255,59,48,0.12)":primary?"#007AFF":"rgba(255,255,255,0.08)",color:disabled?"rgba(255,255,255,0.2)":danger?"#FF3B30":primary?"#fff":"rgba(255,255,255,0.8)",cursor:disabled?"default":"pointer",display:"inline-flex",alignItems:"center",gap:8,...s}}>{children}</button>;
const Card=({children,style:s})=><div style={{background:"rgba(255,255,255,0.03)",borderRadius:20,padding:"28px 32px",marginBottom:24,...s}}>{children}</div>;
const Label=({children})=><div style={{fontSize:20,fontWeight:600,marginBottom:16}}>{children}</div>;
const Input=({...props})=><input {...props} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 20px",color:"#fff",fontSize:17,outline:"none",marginBottom:14,...(props.style||{})}}/>;
const TextArea=({...props})=><textarea {...props} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 20px",color:"#fff",fontSize:16,outline:"none",resize:"vertical",minHeight:120,lineHeight:1.6,...(props.style||{})}}/>;

function PwdModal({channel,accounts,onSave,onClose}){const e=accounts[channel.n]||{username:"",password:"",note:""};const[u,setU]=useState(e.username);const[p,setP]=useState(e.password);const[n,setN]=useState(e.note);const[show,setShow]=useState(false);const[saved,setSaved]=useState(false);
  return<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}><div onClick={e=>e.stopPropagation()} style={{background:"#1c1c1e",borderRadius:24,padding:"36px",width:440,maxWidth:"90vw",border:"1px solid rgba(255,255,255,0.1)"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}><span style={{fontSize:32}}>{channel.i}</span><div><div style={{fontSize:20,fontWeight:700}}>{channel.n}</div></div><button onClick={onClose} style={{marginLeft:"auto",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.4)",cursor:"pointer"}}><X size={16}/></button></div>
    <Input value={u} onChange={e=>setU(e.target.value)} placeholder="账号"/><div style={{position:"relative",marginBottom:14}}><Input value={p} onChange={e=>setP(e.target.value)} type={show?"text":"password"} placeholder="密码" style={{marginBottom:0,paddingRight:50}}/><button onClick={()=>setShow(!show)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer"}}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div><Input value={n} onChange={e=>setN(e.target.value)} placeholder="备注（选填）"/>
    <div style={{display:"flex",gap:10}}>{e.username&&<Btn danger onClick={()=>{onSave(channel.n,null);onClose();}}>删除</Btn>}<div style={{flex:1}}/><Btn onClick={onClose}>取消</Btn><Btn primary onClick={()=>{onSave(channel.n,{username:u,password:p,note:n});setSaved(true);setTimeout(onClose,600);}} disabled={!u.trim()}>{saved?<><Check size={16}/>已保存</>:<><Lock size={16}/>保存</>}</Btn></div>
  </div></div>;
}

function LockScreen({onUnlock}){const[mode,setMode]=useState("check");const[pwd,setPwd]=useState("");const[pwd2,setPwd2]=useState("");const[err,setErr]=useState("");
  useEffect(()=>{setMode(localStorage.getItem("geo_master_hash")?"unlock":"create");},[]);
  const hash=async p=>{const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(p+"_geo_salt"));return btoa(String.fromCharCode(...new Uint8Array(h)));};
  const create=async()=>{if(pwd.length<4){setErr("至少4位");return;}if(pwd!==pwd2){setErr("不一致");return;}localStorage.setItem("geo_master_hash",await hash(pwd));for(const k of["geo_vault","geo_articles","geo_contact","geo_kb"])localStorage.setItem(k,await EN(pwd,k==="geo_articles"||k==="geo_kb"?[]:{}));onUnlock(pwd);};
  const unlock=async()=>{if(await hash(pwd)!==localStorage.getItem("geo_master_hash")){setErr("密码错误");setPwd("");return;}onUnlock(pwd);};
  const reset=()=>{if(confirm("确定重置？将清除所有数据。")){["geo_vault","geo_master_hash","geo_articles","geo_contact","geo_kb"].forEach(k=>localStorage.removeItem(k));setMode("create");setPwd("");setPwd2("");setErr("");}};
  const is={width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px 20px",color:"#fff",fontSize:18,outline:"none",textAlign:"center",letterSpacing:4};
  return<div style={{height:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,sans-serif"}}><div style={{textAlign:"center",width:400,maxWidth:"90vw"}}>
    <div style={{width:80,height:80,borderRadius:24,background:"rgba(255,255,255,0.05)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>{mode==="create"?<KeyRound size={36} color="#007AFF"/>:<Lock size={36} color="#007AFF"/>}</div>
    <h1 style={{fontSize:28,fontWeight:700,color:"#fff",margin:"0 0 8px"}}>{mode==="create"?"设置主密码":"输入主密码"}</h1>
    <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",margin:"0 0 36px"}}>{mode==="create"?"用于加密保护数据":"解锁后使用工具"}</p>
    {mode==="create"?<><input value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} type="password" placeholder="设置主密码" style={{...is,marginBottom:14}}/><input value={pwd2} onChange={e=>{setPwd2(e.target.value);setErr("");}} type="password" placeholder="再输一次" style={{...is,marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&create()}/>{err&&<div style={{color:"#FF3B30",fontSize:15,marginBottom:16}}>{err}</div>}<Btn primary onClick={create} disabled={!pwd||!pwd2} style={{width:"100%",justifyContent:"center",fontSize:18,padding:"16px"}}>创建并进入</Btn></>:
    <><input value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} type="password" placeholder="主密码" style={{...is,marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&unlock()} autoFocus/>{err&&<div style={{color:"#FF3B30",fontSize:15,marginBottom:16}}>{err}</div>}<Btn primary onClick={unlock} disabled={!pwd} style={{width:"100%",justifyContent:"center",fontSize:18,padding:"16px"}}><Unlock size={18}/>解锁</Btn><button onClick={reset} style={{marginTop:20,background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:14}}>忘记密码？重置</button></>}
  </div></div>;
}

// ======== MAIN ========
export default function Home(){
  const[mp,setMp]=useState(null);
  const[accounts,setAccounts]=useState({});
  const[savedArticles,setSavedArticles]=useState([]);
  const[contactInfo,setContactInfo]=useState({wechat:"",phone:"",address:"",website:"",slogan:"",qrCode:""});
  const[knowledgeBase,setKnowledgeBase]=useState([]);
  const[editCh,setEditCh]=useState(null);
  const[loaded,setLoaded]=useState(false);

  // Load
  useEffect(()=>{if(!mp)return;(async()=>{
    for(const[k,setter]of[["geo_vault",setAccounts],["geo_articles",setSavedArticles],["geo_contact",d=>setContactInfo(p=>({...p,...d}))],["geo_kb",setKnowledgeBase]]){const v=localStorage.getItem(k);if(v){const d=await DE(mp,v);if(d)setter(d);}}
    setLoaded(true);
  })();},[mp]);
  // Save
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_vault",await EN(mp,accounts));})();},[accounts,mp,loaded]);
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_articles",await EN(mp,savedArticles));})();},[savedArticles,mp,loaded]);
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_contact",await EN(mp,contactInfo));})();},[contactInfo,mp,loaded]);
  useEffect(()=>{if(!mp||!loaded)return;(async()=>{localStorage.setItem("geo_kb",await EN(mp,knowledgeBase));})();},[knowledgeBase,mp,loaded]);
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
  // KB state
  const[kbTitle,setKbTitle]=useState("");const[kbContent,setKbContent]=useState("");const[kbCat,setKbCat]=useState("客户案例");const[kbFilter,setKbFilter]=useState("all");const[kbEdit,setKbEdit]=useState(null);
  // 公众号搜索 state
  const[wxKw,setWxKw]=useState("");const[wxResults,setWxResults]=useState([]);const[wxLoading,setWxLoading]=useState(false);const[wxPage,setWxPage]=useState(1);const[wxTotal,setWxTotal]=useState(0);const[wxExpand,setWxExpand]=useState(null);const[wxPeriod,setWxPeriod]=useState(30);const[wxSaved,setWxSaved]=useState(new Set());
  // 公众号订阅 state
  const[wxName,setWxName]=useState("");const[wxHist,setWxHist]=useState([]);const[wxHLoading,setWxHLoading]=useState(false);const[wxHPage,setWxHPage]=useState(1);const[wxHTotalPage,setWxHTotalPage]=useState(0);const[wxHExpand,setWxHExpand]=useState(null);const[wxMpInfo,setWxMpInfo]=useState(null);
  const[kbMode,setKbMode]=useState("search"); // search | follow | manual
  // 二创 state
  const[isRecreating,setIsRecreating]=useState(null);

  useEffect(()=>{fetch('/api/status').then(r=>r.json()).then(setApi).catch(()=>{});},[]);
  const anyApi=api.deepseek||api.doubao||api.moonshot;
  const am={DeepSeek:'deepseek','豆包':'doubao',Kimi:'moonshot'};

  // Contact
  const contactLines=[contactInfo.slogan,contactInfo.phone?`📞 电话：${contactInfo.phone}`:"",contactInfo.wechat?`💬 微信：${contactInfo.wechat}`:"",contactInfo.website?`🌐 官网：${contactInfo.website}`:"",contactInfo.address?`📍 地址：${contactInfo.address}`:""].filter(Boolean);
  const contactText=contactLines.join("\n");
  const hasContact=contactLines.length>0;

  // KB context for article generation
  const kbContext = useMemo(()=>{
    if(!knowledgeBase.length) return "";
    const items = knowledgeBase.slice(0,5).map(k=>`【${k.category}】${k.title}：${k.content.slice(0,300)}`).join("\n\n");
    return `\n\n## 公司知识库素材（请从中选取相关内容融入文章）\n\n${items}`;
  },[knowledgeBase]);

  // ===== KEYWORDS =====
  const genKw=useCallback(async()=>{if(!kw.trim())return;setIsGen(true);setQs([]);setSel(new Set());
    const prompt=`你是GEO高级策略顾问，精通LLM查询扇出机制。当用户在AI平台提问时，LLM会将问题分解为6-20个子查询并行检索。你生成的问题必须覆盖七维度子查询空间：定义型、对比型、操作型、场景型、异议型、实体扩展型、数据型。

行业特点：短视频运营/数字营销服务——决策链短(1-4周)、价格敏感、效果定义具体(播放量/粉丝/线索/ROI)、地域性强、信任靠案例。

输入关键词：${kw.trim()}
${brand?`品牌：${brand}`:""}${comps.length?`\n竞对：${comps.join("、")}`:""}

生成6组×4个=24个问题：
【TOFU-痛点驱动】描述具体问题+具体行业。覆盖：场景型+操作型
【TOFU-需求评估】带自身条件评估值不值。覆盖：异议型+数据型
【MOFU-选型对比】比较选项/问价格。覆盖：对比型+数据型+实体扩展型
【MOFU-避坑决策】担心被坑的风险排查。覆盖：异议型+操作型
【BOFU-品牌验证】验证具体品牌。覆盖：实体扩展型+对比型
【BOFU-效果诊断】做了没效果求助，带具体数据。覆盖：异议型+操作型+数据型

要求：15-25字完整自然语言、至少一半带地域、零重复、像真人打字、禁止关键词堆砌。
JSON返回：[{"stage":"TOFU-痛点驱动","question":"..."}]`;
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:3000})});const d=await r.json();if(d.text)setQs(JSON.parse(d.text.replace(/```json|```/g,"").trim()));else throw 0;}catch(e){
      const t={"TOFU-痛点驱动":["在济南开了个餐饮店抖音发了半年没客人怎么办","教培机构抖音管得严还有什么办法线上获客","同行都在做短视频我不做是不是就被淘汰了","工厂想通过短视频找客户完全不知道从哪下手"],"TOFU-需求评估":["月营业额十几万的小店有必要花钱做短视频吗","自己不会拍剪是不是只能找代运营","短视频运营能带来多少客户有没有大概数据","预算每月三五千做短视频运营够吗"],"MOFU-选型对比":["济南短视频代运营怎么选预算五千左右","自己招人和找代运营到底哪个划算","代运营一个月多少钱济南什么行情","大公司和小工作室做代运营有什么区别"],"MOFU-避坑决策":["找短视频代运营最容易踩什么坑","代运营承诺保证播放量能信吗","跟代运营签合同要注意哪些条款","怎么判断一家短视频运营公司靠不靠谱"],"BOFU-品牌验证":[`${brand||"某公司"}做短视频运营效果怎么样`,"济南做餐饮短视频做得好的公司有哪些","想找济南本地代运营谁家口碑好",`${comps[0]||"A公司"}和${comps[1]||"B公司"}哪个好`],"BOFU-效果诊断":["找了代运营三个月花了两万播放量还是几十个","代运营涨了一万粉但一个客户没来什么情况","短视频做了半年没线索是我的问题还是公司的","感觉被代运营忽悠了想换一家怕又踩坑"]};
      setQs(Object.entries(t).flatMap(([s,a])=>a.map(q=>({stage:s,question:q}))));
    }setIsGen(false);},[kw,brand,comps]);
  const toggleQ=i=>setSel(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});
  const addMon=()=>{const nq=[...sel].map(i=>({question:qs[i].question,category:qs[i].stage})).filter(q=>!mon.some(m=>m.question===q.question));if(nq.length){setMon(p=>[...p,...nq]);setSel(new Set());setTab("monitor");}};

  // ===== COLLECT =====
  const collect=useCallback(async()=>{if(!brand||!mon.length)return;setIsCol(true);setProg(0);const t=mon.length*PN.length,nr=[];for(let i=0;i<mon.length;i++){for(let j=0;j<PN.length;j++){const p=PN[j],k=am[p];let result;if(api[k]){try{const r=await fetch(PC[p].api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:mon[i].question}],max_tokens:2000})});const d=await r.json();if(d.text){const a=analyzeR(d.text,brand,comps);result={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,question:mon[i].question,platform:p,category:mon[i].category,...a,rawResponse:d.text,collectedAt:new Date().toISOString(),isReal:true};}else throw 0;}catch(e){result=mockR(mon[i].question,p,mon[i].category,brand,comps);}}else{await new Promise(r=>setTimeout(r,80+Math.random()*120));result=mockR(mon[i].question,p,mon[i].category,brand,comps);}nr.push(result);setProg(Math.round(((i*PN.length+j+1)/t)*100));}}setRes(nr);setIsCol(false);},[mon,brand,comps,api]);

  // ===== 二创功能 =====
  const recreateFromAI = useCallback(async(result)=>{
    setIsRecreating(result.id);
    const contactPrompt = hasContact ? `\n\n文章最后必须添加引流段落，先写1-2句自然过渡引导语，然后逐行列出：\n---\n${contactLines.join("\n")}\n---` : "";
    const prompt = `你是GEO内容二创专家。下面是某AI平台对用户提问的回答，请基于这个回答进行二次创作，生成一篇高质量的原创文章。

## 原始问题
${result.question}

## AI原始回答
${result.rawResponse}

## 品牌信息
品牌名称：${brand||"未设置"}
${kbContext}

## 二创要求
1. 保留原始回答中有价值的信息框架，但用全新的表述重写，不能照搬原文
2. 融入品牌信息和知识库中的案例数据，让文章带有你的品牌特色
3. 每个主要段落至少包含1个量化数据点
4. 每个H2段落的前50-80字必须独立完整，可被AI提取引用
5. 语气专业但口语化，像资深从业者在分享经验
6. 文章字数1500-2500字${contactPrompt}

Markdown格式输出，直接输出文章正文。`;

    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:4000})});const d=await r.json();
      if(d.text){
        const item = {id:`art-${Date.now()}`,question:result.question,type:"recreate",content:d.text,createdAt:new Date().toISOString(),wordCount:d.text.length,source:`${result.platform}二创`,status:"待发布"};
        setSavedArticles(p=>[item,...p]);
        setTab("queue");
      }
    }catch(e){}
    setIsRecreating(null);
  },[brand,kbContext,hasContact,contactLines]);

  // ===== GENERATE =====
  const genArticle=useCallback(async()=>{if(!cQ)return;setIsGenA(true);setArticle("");setCopied(false);
    const tp={guide:"写一篇3000字以上行业深度指南。开头50字内直接回答核心问题，每个H2前50-80字独立完整可被AI提取引用，每段至少1个量化数据点。",qa:"写一篇800-1500字精准问答。第一段30字内直接给答案，包含具体数字。",case:"写一篇1500-2500字案例复盘。结构：客户背景→诊断→方案→执行→数据结果→方法论。",compare:"写一篇2000-3000字选型对比评测。用表格横向对比，每个维度给明确判断。"};
    const contactPrompt=hasContact?`\n\n文章最后必须添加引流段落。先写1-2句自然过渡引导语，然后另起一行，逐行列出联系方式（不能省略任何一项，不能改格式）：\n---\n${contactLines.join("\n")}\n---\n这个联系方式段落必须出现在文章最末尾。`:"";
    const prompt=`你是GEO内容专家。统计数据植入提升AI引用率41%，权威引用添加提升28%，关键词堆砌是负效果。

目标问题：${cQ.question}
品牌：${brand||"未设置"}
竞对：${comps.join("、")||"未设置"}
文章类型：${AT.find(t=>t.key===aType)?.label}
${kbContext}

${tp[aType]}

内容三原则：1.节点架构：每个H2前50-80字独立完整 2.数据信号：每段≥1量化数据点 3.自然语言：用客户真实措辞${contactPrompt}

Markdown格式，直接输出正文。`;
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:4000})});const d=await r.json();if(d.text)setArticle(d.text);else throw 0;}catch(e){setArticle(`# ${cQ.question}\n\n> API未连接，模拟内容。\n\n...${hasContact?"\n\n---\n\n"+contactText:""}`);}setIsGenA(false);},[cQ,aType,brand,comps,kbContext,hasContact,contactLines,contactText]);

  // Save to queue
  const saveToQueue=useCallback((content,question,type)=>{
    const item={id:`art-${Date.now()}`,question:question||cQ?.question||"未命名",type:type||aType,content:content||article,createdAt:new Date().toISOString(),wordCount:(content||article).length,status:"待发布"};
    setSavedArticles(p=>[item,...p]);
  },[cQ,aType,article]);

  const copyA=useCallback(async()=>{try{await navigator.clipboard.writeText(article)}catch(e){}setCopied(true);setTimeout(()=>setCopied(false),2500);},[article]);
  const copyText=async t=>{try{await navigator.clipboard.writeText(t)}catch(e){}};
  const handleQr=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setContactInfo(p=>({...p,qrCode:ev.target.result}));};r.readAsDataURL(f);};

  // KB
  const addKbItem=()=>{if(!kbTitle.trim()||!kbContent.trim())return;if(kbEdit){setKnowledgeBase(p=>p.map(k=>k.id===kbEdit?{...k,title:kbTitle,content:kbContent,category:kbCat}:k));setKbEdit(null);}else{setKnowledgeBase(p=>[{id:`kb-${Date.now()}`,title:kbTitle.trim(),content:kbContent.trim(),category:kbCat,createdAt:new Date().toISOString()},...p]);}setKbTitle("");setKbContent("");};
  const editKbItem=item=>{setKbTitle(item.title);setKbContent(item.content);setKbCat(item.category);setKbEdit(item.id);};
  const delKbItem=id=>setKnowledgeBase(p=>p.filter(k=>k.id!==id));
  const filteredKb=kbFilter==="all"?knowledgeBase:knowledgeBase.filter(k=>k.category===kbFilter);

  // 公众号文章搜索
  const wxSearch=useCallback(async(page=1)=>{
    if(!wxKw.trim())return;setWxLoading(true);if(page===1)setWxResults([]);
    try{
      const r=await fetch('/api/wxsearch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kw:wxKw.trim(),page,period:wxPeriod,sort_type:1})});
      const d=await r.json();
      if(d.code===200&&d.data){
        if(page===1)setWxResults(d.data);else setWxResults(p=>[...p,...d.data]);
        setWxTotal(d.total||0);setWxPage(page);
      }else{ if(page===1)setWxResults([]); }
    }catch(e){console.error(e);}
    setWxLoading(false);
  },[wxKw,wxPeriod]);

  const wxSaveToKb=(item)=>{
    const content=item.content?item.content.replace(/<[^>]+>/g,'').slice(0,5000):item.title;
    setKnowledgeBase(p=>[{id:`kb-wx-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,title:item.title,content,category:"公众号素材",createdAt:new Date().toISOString(),source:item.wx_name,sourceUrl:item.url,read:item.read,praise:item.praise},...p]);
    setWxSaved(p=>new Set([...p,item.url]));
  };

  // 公众号历史发文
  const wxHistSearch=useCallback(async(page=1)=>{
    if(!wxName.trim())return;setWxHLoading(true);if(page===1){setWxHist([]);setWxMpInfo(null);}
    try{
      const r=await fetch('/api/wxhistory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:wxName.trim(),page})});
      const d=await r.json();
      if(d.code===200&&d.data){
        if(page===1)setWxHist(d.data);else setWxHist(p=>[...p,...d.data]);
        setWxHTotalPage(d.total_page||0);setWxHPage(page);
        if(d.mp_nickname)setWxMpInfo({name:d.mp_nickname,avatar:d.head_img,wxid:d.mp_wxid,ghid:d.mp_ghid,total:d.total_num,masssend:d.masssend_count,publish:d.publish_count});
      }
    }catch(e){console.error(e);}
    setWxHLoading(false);
  },[wxName]);

  const wxHistSaveToKb=(item)=>{
    const content=item.digest||item.title;
    const mpName=wxMpInfo?.name||wxName;
    setKnowledgeBase(p=>[{id:`kb-wxh-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,title:item.title,content,category:"公众号素材",createdAt:new Date().toISOString(),source:mpName,sourceUrl:item.url,position:item.position},...p]);
    setWxSaved(p=>new Set([...p,item.url]));
  };

  // STATS
  const stats=useMemo(()=>{if(!res.length)return null;const score=Math.round(res.reduce((s,r)=>s+ST[r.myBrandStatus].score,0)/res.length);const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};res.forEach(r=>counts[r.myBrandStatus]++);const mr=Math.round(((res.length-counts["未出现"])/res.length)*100);const bp={};PN.forEach(p=>{const pr=res.filter(r=>r.platform===p);bp[p]={score:pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus].score,0)/pr.length):0,counts:{"首推":0,"被提及":0,"被引用":0,"未出现":0}};pr.forEach(r=>bp[p].counts[r.myBrandStatus]++);});const cf={};res.forEach(r=>r.competitors?.forEach(c=>{cf[c.name]=(cf[c.name]||0)+1;}));const cr=Object.entries(cf).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({name:n,count:c}));const mx={};mon.forEach(m=>{mx[m.question]={category:m.category};PN.forEach(p=>mx[m.question][p]="未出现");});res.forEach(r=>{if(mx[r.question])mx[r.question][r.platform]=r.myBrandStatus;});return{score,counts,mr,bp,cr,mx};},[res,mon]);
  const pie=stats?Object.entries(stats.counts).filter(([_,v])=>v>0).map(([n,v])=>({name:n,value:v})):[];
  const renderMd=md=>{if(!md)return null;return md.split("\n").map((l,i)=>{if(l.startsWith("# "))return<h1 key={i} style={{fontSize:26,fontWeight:700,color:"#fff",margin:"24px 0 12px"}}>{l.slice(2)}</h1>;if(l.startsWith("## "))return<h2 key={i} style={{fontSize:20,fontWeight:600,color:"rgba(255,255,255,0.85)",margin:"20px 0 10px"}}>{l.slice(3)}</h2>;if(l.startsWith("### "))return<h3 key={i} style={{fontSize:17,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"16px 0 8px"}}>{l.slice(4)}</h3>;if(l.startsWith("> "))return<blockquote key={i} style={{borderLeft:"3px solid #007AFF",paddingLeft:18,margin:"12px 0",color:"rgba(255,255,255,0.5)",fontSize:15}}>{l.slice(2)}</blockquote>;if(l.startsWith("- ")||l.startsWith("* "))return<div key={i} style={{paddingLeft:18,margin:"4px 0",fontSize:15,color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>• {l.slice(2)}</div>;if(l==="---")return<hr key={i} style={{border:"none",borderTop:"1px solid rgba(255,255,255,0.1)",margin:"18px 0"}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<p key={i} style={{fontSize:15,color:"rgba(255,255,255,0.7)",lineHeight:1.8,margin:"5px 0"}}>{l}</p>;});};
  const filteredGroups=chFilter==="all"?CG:chFilter==="核心"?CG.map(g=>({...g,ch:g.ch.filter(c=>c.p==="核心")})).filter(g=>g.ch.length>0):CG.filter(g=>g.group.includes(chFilter));

  const queueCount=savedArticles.filter(a=>a.status==="待发布").length;
  const tabs=[{id:"keywords",label:"关键词",icon:Search,n:"1"},{id:"monitor",label:"采集",icon:Radar,n:"2",badge:mon.length},{id:"kb",label:"知识库",icon:Database,n:"",badge:knowledgeBase.length},{id:"content",label:"内容",icon:PenTool,n:"3"},{id:"queue",label:"待发布",icon:ClipboardList,n:"",badge:queueCount},{id:"publish",label:"发布",icon:Send,n:"4"},{id:"dashboard",label:"看板",icon:LayoutDashboard,n:"5"}];

  if(!mp)return<LockScreen onUnlock={setMp}/>;

  return(<div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#000",color:"#fff",fontFamily:"-apple-system,'SF Pro Display','Helvetica Neue',sans-serif"}}>
    {/* SIDEBAR */}
    <div style={{width:240,background:"rgba(255,255,255,0.03)",borderRight:"1px solid rgba(255,255,255,0.06)",padding:"28px 16px",display:"flex",flexDirection:"column",gap:4,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"0 12px",marginBottom:28}}><div style={{fontSize:22,fontWeight:700}}>GEO Monitor</div><div style={{fontSize:14,color:"rgba(255,255,255,0.3)",marginTop:4}}>AI能见度监控</div></div>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,width:"100%",border:"none",background:tab===t.id?"rgba(255,255,255,0.08)":"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:15,fontWeight:tab===t.id?600:400}}>{t.n&&<span style={{fontSize:12,opacity:0.4}}>{t.n}</span>}<t.icon size={17}/><span>{t.label}</span>{t.badge>0&&<span style={{marginLeft:"auto",background:"#007AFF",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{t.badge}</span>}</button>)}
      <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"12px 8px"}}/>
      <button onClick={()=>setTab("settings")} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,width:"100%",border:"none",background:tab==="settings"?"rgba(255,255,255,0.08)":"transparent",color:tab==="settings"?"#fff":"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:15}}><Settings size={17}/>设置</button>
      <div style={{flex:1}}/>
      <div style={{padding:"12px",background:"rgba(255,255,255,0.03)",borderRadius:12,margin:"0 4px"}}><div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:6}}>{anyApi?<Wifi size={11} style={{color:"#34C759",verticalAlign:-2}}/>:<WifiOff size={11} style={{color:"#FF3B30",verticalAlign:-2}}/>} API</div>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,marginBottom:4}}><span style={{width:7,height:7,borderRadius:"50%",background:api[am[p]]?"#34C759":"rgba(255,255,255,0.15)"}}/><span style={{color:api[am[p]]?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.2)"}}>{p}</span></div>)}</div>
      {brand&&<div style={{padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:12,margin:"6px 4px 0"}}><div style={{fontSize:12,color:"rgba(255,255,255,0.25)"}}>品牌</div><div style={{fontSize:15,fontWeight:600,color:"#34C759",marginTop:2}}>{brand}</div></div>}
    </div>

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",padding:"36px 44px"}}>

      {/* SETTINGS */}
      {tab==="settings"&&<div style={{maxWidth:640}}>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 32px"}}>设置</h1>
        <Card><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>API连接</div><div style={{display:"flex",gap:24,marginTop:16}}>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:10,height:10,borderRadius:"50%",background:api[am[p]]?"#34C759":"rgba(255,255,255,0.15)"}}/><span style={{fontSize:16,color:api[am[p]]?"#fff":"rgba(255,255,255,0.3)"}}>{p} {api[am[p]]?"✓":"✗"}</span></div>)}</div></Card>
        <Card><Label>品牌名称</Label><div style={{display:"flex",gap:12}}><Input value={brandIn} onChange={e=>setBrandIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&brandIn.trim()&&setBrand(brandIn.trim())} placeholder="品牌名或公司名" style={{marginBottom:0,flex:1}}/><Btn primary onClick={()=>brandIn.trim()&&setBrand(brandIn.trim())} disabled={!brandIn.trim()}>保存</Btn></div>{brand&&<div style={{marginTop:10,fontSize:15,color:"#34C759"}}><CheckCircle2 size={15} style={{verticalAlign:-3}}/> 当前：{brand}</div>}</Card>
        <Card><Label>竞对品牌</Label><Input value={compIn} onChange={e=>setCompIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const c=compIn.trim();if(c&&!comps.includes(c)){setComps(p=>[...p,c]);setCompIn("");}}}} placeholder="竞对名，回车添加"/><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{comps.map(c=><span key={c} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",background:"rgba(255,255,255,0.06)",borderRadius:10,fontSize:14,color:"rgba(255,255,255,0.7)"}}>{c}<button onClick={()=>setComps(p=>p.filter(x=>x!==c))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",padding:0}}><X size={13}/></button></span>)}</div></Card>
        <Card><Label>引流信息</Label><div style={{fontSize:14,color:"rgba(255,255,255,0.35)",margin:"-10px 0 16px"}}>生成文章末尾自动带上联系方式</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:5}}><MessageCircle size={13} style={{verticalAlign:-2}}/> 微信</div><Input value={contactInfo.wechat} onChange={e=>setContactInfo(p=>({...p,wechat:e.target.value}))} placeholder="微信号"/></div>
            <div><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:5}}><Phone size={13} style={{verticalAlign:-2}}/> 电话</div><Input value={contactInfo.phone} onChange={e=>setContactInfo(p=>({...p,phone:e.target.value}))} placeholder="手机号"/></div>
            <div><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:5}}><ExternalLink size={13} style={{verticalAlign:-2}}/> 官网</div><Input value={contactInfo.website} onChange={e=>setContactInfo(p=>({...p,website:e.target.value}))} placeholder="官网"/></div>
            <div><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:5}}><MapPin size={13} style={{verticalAlign:-2}}/> 地址</div><Input value={contactInfo.address} onChange={e=>setContactInfo(p=>({...p,address:e.target.value}))} placeholder="地址"/></div>
          </div>
          <div style={{marginBottom:12}}><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:5}}><Sparkles size={13} style={{verticalAlign:-2}}/> 引流话术</div><Input value={contactInfo.slogan} onChange={e=>setContactInfo(p=>({...p,slogan:e.target.value}))} placeholder="如：免费诊断短视频账号，加微信领方案"/></div>
          <div><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:8}}><QrCode size={13} style={{verticalAlign:-2}}/> 二维码</div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              {contactInfo.qrCode?<div style={{position:"relative"}}><img src={contactInfo.qrCode} style={{width:100,height:100,borderRadius:12,objectFit:"cover"}}/><button onClick={()=>setContactInfo(p=>({...p,qrCode:""}))} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:10,background:"#FF3B30",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={10}/></button></div>:
              <button onClick={()=>fileRef.current?.click()} style={{width:100,height:100,borderRadius:12,border:"2px dashed rgba(255,255,255,0.1)",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:"rgba(255,255,255,0.25)",fontSize:13}}><Image size={20}/>上传</button>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleQr} style={{display:"none"}}/>
            </div>
          </div>
          {hasContact&&<div style={{marginTop:16,padding:"14px 18px",background:"rgba(52,199,89,0.06)",borderRadius:12,border:"1px solid rgba(52,199,89,0.15)"}}><div style={{fontSize:13,color:"#34C759",fontWeight:600,marginBottom:6}}>✅ 文章末尾将添加：</div><div style={{fontSize:14,color:"rgba(255,255,255,0.5)",whiteSpace:"pre-line",lineHeight:1.6}}>{contactText}</div></div>}
        </Card>
        {brand&&<Btn primary onClick={()=>setTab("keywords")} style={{fontSize:17,padding:"14px 32px"}}>开始使用 <ArrowRight size={17}/></Btn>}
      </div>}

      {/* KEYWORDS */}
      {tab==="keywords"&&<div>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 32px"}}>关键词扩展</h1>
        <div style={{display:"flex",gap:12,marginBottom:32}}><Input value={kw} onChange={e=>setKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genKw()} placeholder="输入关键词，如：济南短视频运营" style={{flex:1,marginBottom:0,borderRadius:16,padding:"15px 22px",fontSize:17}}/><Btn primary onClick={genKw} disabled={isGen||!kw.trim()} style={{fontSize:16,padding:"15px 28px"}}>{isGen?<><Loader2 size={17} className="spin"/>生成中</>:<><Zap size={17}/>生成问题</>}</Btn></div>
        {qs.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><span style={{fontSize:16,color:"rgba(255,255,255,0.5)"}}>共<b style={{color:"#fff"}}>{qs.length}</b>个 · 已选<b style={{color:"#007AFF"}}>{sel.size}</b>个</span><div style={{display:"flex",gap:8}}><Btn onClick={()=>setSel(p=>p.size===qs.length?new Set():new Set(qs.map((_,i)=>i)))}>{sel.size===qs.length?"取消":"全选"}</Btn><Btn primary onClick={addMon} disabled={!sel.size}><Plus size={15}/>加入监控</Btn></div></div>
        {STAGES.map(stg=>{const sq=qs.map((q,i)=>({...q,idx:i})).filter(q=>q.stage===stg.key);if(!sq.length)return null;return<div key={stg.key} style={{marginBottom:24}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:20}}>{stg.emoji}</span><span style={{fontSize:17,fontWeight:600,color:stg.color}}>{stg.key}</span><span style={{fontSize:14,color:"rgba(255,255,255,0.3)"}}>{stg.desc}</span></div>{sq.map(q=><div key={q.idx} onClick={()=>toggleQ(q.idx)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",background:sel.has(q.idx)?"rgba(0,122,255,0.08)":"rgba(255,255,255,0.02)",border:sel.has(q.idx)?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.04)",borderRadius:12,marginBottom:5,cursor:"pointer"}}><div style={{width:20,height:20,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:sel.has(q.idx)?"#007AFF":"rgba(255,255,255,0.06)",border:sel.has(q.idx)?"none":"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>{sel.has(q.idx)&&<Check size={13} color="#fff"/>}</div><span style={{fontSize:15,color:sel.has(q.idx)?"#fff":"rgba(255,255,255,0.6)"}}>{q.question}</span></div>)}</div>})}</>}
        {!qs.length&&!isGen&&<div style={{textAlign:"center",padding:"70px 0"}}><div style={{fontSize:44,marginBottom:14}}>🔍</div><div style={{fontSize:18,color:"rgba(255,255,255,0.4)"}}>输入关键词生成AI搜索问题</div></div>}
      </div>}

      {/* MONITOR + 二创按钮 */}
      {tab==="monitor"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}><div><h1 style={{fontSize:32,fontWeight:700,margin:"0 0 6px"}}>采集监控</h1><p style={{fontSize:16,color:"rgba(255,255,255,0.4)",margin:0}}>{mon.length}问题 × {PN.length}平台</p></div><div style={{display:"flex",gap:8}}>{mon.length>0&&<Btn onClick={()=>{setMon([]);setRes([]);}}><Trash2 size={14}/>清空</Btn>}<Btn primary onClick={collect} disabled={isCol||!mon.length||!brand}>{isCol?<><Loader2 size={15} className="spin"/>{prog}%</>:<><RefreshCw size={15}/>开始采集</>}</Btn></div></div>
        {isCol&&<div style={{marginBottom:18}}><div style={{background:"rgba(255,255,255,0.05)",borderRadius:6,height:5,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#007AFF,#34C759)",transition:"width 0.3s"}}/></div></div>}
        {!mon.length?<div style={{textAlign:"center",padding:"70px 0"}}><div style={{fontSize:44,marginBottom:14}}>📡</div><div style={{fontSize:18,color:"rgba(255,255,255,0.4)"}}>监控列表为空</div><Btn primary onClick={()=>setTab("keywords")} style={{marginTop:18}}>去生成关键词</Btn></div>:
        mon.map((m,qi)=>{const qr=res.filter(r=>r.question===m.question);const isE=expQ===qi;return<div key={qi} style={{background:"rgba(255,255,255,0.03)",borderRadius:14,marginBottom:6,overflow:"hidden",border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer"}} onClick={()=>setExpQ(isE?null:qi)}><span style={{flex:1,fontSize:15,color:"rgba(255,255,255,0.8)"}}>{m.question}</span>{qr.length>0&&<div style={{display:"flex",gap:5}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);return r?<Badge key={p} status={r.myBrandStatus}/>:null;})}</div>}{isE?<ChevronUp size={16} color="rgba(255,255,255,0.3)"/>:<ChevronDown size={16} color="rgba(255,255,255,0.3)"/>}<button onClick={e=>{e.stopPropagation();setMon(p=>p.filter((_,i)=>i!==qi));}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.12)",cursor:"pointer"}}><X size={15}/></button></div>
          {isE&&qr.length>0&&<div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            {PN.map(p=>{const r=qr.find(r=>r.platform===p);if(!r)return null;const isD=expR===r.id;
            return<div key={p} style={{marginTop:10,background:"rgba(0,0,0,0.3)",borderRadius:12,overflow:"hidden"}}>
              <div onClick={()=>setExpR(isD?null:r.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",cursor:"pointer"}}>
                <span style={{fontSize:15,fontWeight:600,color:PC[p].color}}>{PC[p].icon} {p}</span><Badge status={r.myBrandStatus}/>{r.isReal&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:5,background:"rgba(52,199,89,0.12)",color:"#34C759"}}>真实</span>}
                <span style={{marginLeft:"auto"}}/>
                {/* 二创按钮 */}
                <Btn small onClick={e=>{e.stopPropagation();recreateFromAI(r);}} disabled={isRecreating===r.id} style={{background:"rgba(255,149,0,0.12)",color:"#FF9500"}}>
                  {isRecreating===r.id?<><Loader2 size={12} className="spin"/>二创中</>:<><RotateCw size={12}/>一键二创</>}
                </Btn>
              </div>
              {isD&&<div style={{padding:"0 16px 14px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.7,whiteSpace:"pre-wrap",background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"14px",marginTop:8,maxHeight:280,overflowY:"auto"}}>{r.rawResponse}</div>
              </div>}
            </div>;})}
          </div>}
        </div>;})}
      </div>}

      {/* KNOWLEDGE BASE */}
      {tab==="kb"&&<div>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 6px"}}>知识库</h1>
        <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",margin:"0 0 20px"}}>采集公众号文章 & 录入公司资料，生成内容时AI自动引用</p>

        {/* 模式切换 */}
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {[{k:"search",l:"🔍 关键词搜索"},{k:"follow",l:"📡 公众号订阅"},{k:"manual",l:"✏️ 手动录入"}].map(m=>
            <button key={m.k} onClick={()=>setKbMode(m.k)} style={{padding:"12px 20px",borderRadius:14,border:kbMode===m.k?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.06)",background:kbMode===m.k?"rgba(0,122,255,0.08)":"rgba(255,255,255,0.03)",color:kbMode===m.k?"#007AFF":"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:15,fontWeight:600,flex:1,textAlign:"center"}}>{m.l}</button>
          )}
        </div>

        {/* 关键词搜索 */}
        {kbMode==="search"&&<Card style={{border:"1px solid rgba(255,149,0,0.15)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><span style={{fontSize:24}}>💚</span><div><div style={{fontSize:18,fontWeight:700}}>公众号文章采集</div><div style={{fontSize:14,color:"rgba(255,255,255,0.35)",marginTop:2}}>按关键词搜索，收录行业好文</div></div></div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <Input value={wxKw} onChange={e=>setWxKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&wxSearch(1)} placeholder="搜索关键词，如：短视频运营、餐饮获客..." style={{flex:1,marginBottom:0}}/>
            <select value={wxPeriod} onChange={e=>setWxPeriod(Number(e.target.value))} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"0 16px",color:"#fff",fontSize:15,outline:"none",cursor:"pointer"}}><option value={7} style={{background:"#1c1c1e"}}>近7天</option><option value={30} style={{background:"#1c1c1e"}}>近30天</option><option value={90} style={{background:"#1c1c1e"}}>近90天</option><option value={365} style={{background:"#1c1c1e"}}>近1年</option></select>
            <Btn primary onClick={()=>wxSearch(1)} disabled={wxLoading||!wxKw.trim()} style={{flexShrink:0}}>{wxLoading?<><Loader2 size={15} className="spin"/>搜索中</>:<><Search size={15}/>搜索</>}</Btn>
          </div>
          {wxResults.length>0&&<><div style={{fontSize:14,color:"rgba(255,255,255,0.35)",marginBottom:12}}>找到 {wxTotal} 篇，已加载 {wxResults.length} 篇</div><div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:500,overflowY:"auto"}}>{wxResults.map((item,idx)=>{const isSaved=wxSaved.has(item.url)||knowledgeBase.some(k=>k.title===item.title);const isExp=wxExpand===idx;return<div key={idx} style={{background:"rgba(255,255,255,0.03)",borderRadius:14,border:"1px solid rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{padding:"16px 20px",display:"flex",gap:14,alignItems:"flex-start"}}>{item.avatar&&<img src={item.avatar} style={{width:80,height:52,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display='none';}}/>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:16,fontWeight:600,lineHeight:1.4,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.title}</div><div style={{display:"flex",flexWrap:"wrap",gap:10,fontSize:13,color:"rgba(255,255,255,0.35)"}}><span style={{color:"rgba(255,255,255,0.5)",fontWeight:500}}>{item.wx_name}</span><span>👁 {item.read>=10000?(item.read/10000).toFixed(1)+'w':item.read}</span><span>👍 {item.praise}</span><span>{item.publish_time_str}</span>{item.is_original===1&&<span style={{color:"#34C759",fontWeight:600}}>原创</span>}</div></div><div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}><Btn small primary onClick={()=>wxSaveToKb(item)} disabled={isSaved}>{isSaved?<><Check size={12}/>已收录</>:<><Plus size={12}/>收录</>}</Btn><Btn small onClick={()=>setWxExpand(isExp?null:idx)}>{isExp?<><ChevronUp size={12}/>收起</>:<><Eye size={12}/>预览</>}</Btn>{item.url&&<a href={item.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.4)",textDecoration:"none"}}>原文<ExternalLink size={11}/></a>}</div></div>{isExp&&item.content&&<div style={{padding:"0 20px 16px",borderTop:"1px solid rgba(255,255,255,0.04)"}}><div style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.7,maxHeight:300,overflowY:"auto",marginTop:12}} dangerouslySetInnerHTML={{__html:item.content.replace(/<img[^>]*>/g,'').slice(0,3000)}}/></div>}</div>})}</div>{wxResults.length<wxTotal&&<div style={{textAlign:"center",marginTop:14}}><Btn onClick={()=>wxSearch(wxPage+1)} disabled={wxLoading}>{wxLoading?<Loader2 size={14} className="spin"/>:"加载更多"}</Btn></div>}</>}
          {wxResults.length===0&&!wxLoading&&<div style={{textAlign:"center",padding:"30px 0",color:"rgba(255,255,255,0.2)",fontSize:15}}>输入关键词搜索公众号文章</div>}
        </Card>}

        {/* 公众号订阅 */}
        {kbMode==="follow"&&<Card style={{border:"1px solid rgba(52,199,89,0.15)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><span style={{fontSize:24}}>📡</span><div><div style={{fontSize:18,fontWeight:700}}>公众号订阅采集</div><div style={{fontSize:14,color:"rgba(255,255,255,0.35)",marginTop:2}}>输入公众号名称，拉取历史文章，批量收录</div></div></div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <Input value={wxName} onChange={e=>setWxName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&wxHistSearch(1)} placeholder="输入公众号名称，如：人民日报、运营研究社..." style={{flex:1,marginBottom:0}}/>
            <Btn primary onClick={()=>wxHistSearch(1)} disabled={wxHLoading||!wxName.trim()} style={{flexShrink:0}}>{wxHLoading?<><Loader2 size={15} className="spin"/>查询中</>:<><Search size={15}/>查询</>}</Btn>
          </div>
          {wxMpInfo&&<div style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",background:"rgba(52,199,89,0.06)",borderRadius:14,marginBottom:16,border:"1px solid rgba(52,199,89,0.1)"}}>{wxMpInfo.avatar&&<img src={wxMpInfo.avatar} style={{width:48,height:48,borderRadius:12}} onError={e=>{e.target.style.display='none';}}/>}<div style={{flex:1}}><div style={{fontSize:17,fontWeight:700,color:"#34C759"}}>{wxMpInfo.name}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:3}}>ID: {wxMpInfo.wxid} · 总发文 {wxMpInfo.total} 次</div></div></div>}
          {wxHist.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:14,color:"rgba(255,255,255,0.35)"}}>已加载 {wxHist.filter(i=>i.title).length} 篇</span><Btn small onClick={()=>{const unsaved=wxHist.filter(i=>!wxSaved.has(i.url)&&!knowledgeBase.some(k=>k.title===i.title)&&i.title);unsaved.forEach(i=>wxHistSaveToKb(i));}}><Plus size={12}/>全部收录 ({wxHist.filter(i=>!wxSaved.has(i.url)&&!knowledgeBase.some(k=>k.title===i.title)&&i.title).length})</Btn></div><div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:500,overflowY:"auto"}}>{wxHist.filter(i=>i.title).map((item,idx)=>{const isSaved=wxSaved.has(item.url)||knowledgeBase.some(k=>k.title===item.title);const isDeleted=item.is_deleted==="1"||item.msg_status===7;return<div key={idx} style={{background:isDeleted?"rgba(255,59,48,0.03)":"rgba(255,255,255,0.03)",borderRadius:14,border:isDeleted?"1px solid rgba(255,59,48,0.1)":"1px solid rgba(255,255,255,0.05)",opacity:isDeleted?0.5:1,padding:"14px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>{item.cover_url&&<img src={item.cover_url} style={{width:72,height:48,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display='none';}}/>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:600,lineHeight:1.4,marginBottom:5}}>{item.title}</div><div style={{display:"flex",flexWrap:"wrap",gap:8,fontSize:12,color:"rgba(255,255,255,0.3)"}}><span>{item.post_time_str}</span><span>{item.position===0?"头条":`第${item.position+1}条`}</span><span>{item.types===9?"群发":"发布"}</span>{item.original===1&&<span style={{color:"#34C759"}}>原创</span>}{isDeleted&&<span style={{color:"#FF3B30"}}>已删除</span>}</div>{item.digest&&<div style={{fontSize:13,color:"rgba(255,255,255,0.25)",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.digest}</div>}</div><div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>{!isDeleted&&<Btn small primary onClick={()=>wxHistSaveToKb(item)} disabled={isSaved}>{isSaved?<><Check size={12}/>已收录</>:<><Plus size={12}/>收录</>}</Btn>}{item.url&&<a href={item.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.4)",textDecoration:"none"}}>原文<ExternalLink size={11}/></a>}</div></div>})}</div>{wxHPage<wxHTotalPage&&<div style={{textAlign:"center",marginTop:14}}><Btn onClick={()=>wxHistSearch(wxHPage+1)} disabled={wxHLoading}>{wxHLoading?<Loader2 size={14} className="spin"/>:"加载更多"}</Btn></div>}</>}
          {wxHist.length===0&&!wxHLoading&&<div style={{textAlign:"center",padding:"30px 0",color:"rgba(255,255,255,0.2)",fontSize:15}}>输入公众号名称查询历史文章</div>}
        </Card>}

        {/* 手动添加 */}
        {kbMode==="manual"&&<Card>
          <Label>{kbEdit?"编辑素材":"添加素材"}</Label>
          <Input value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="标题，如：某餐饮客户3个月涨粉2万案例"/>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>{KB_CATS.map(c=><button key={c} onClick={()=>setKbCat(c)} style={{padding:"7px 16px",borderRadius:20,fontSize:14,border:"none",cursor:"pointer",background:kbCat===c?"#007AFF":"rgba(255,255,255,0.06)",color:kbCat===c?"#fff":"rgba(255,255,255,0.4)"}}>{c}</button>)}</div>
          <TextArea value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="粘贴公司介绍、案例复盘、服务说明、行业数据等素材..." rows={5}/>
          <div style={{display:"flex",gap:8,marginTop:14}}>{kbEdit&&<Btn onClick={()=>{setKbEdit(null);setKbTitle("");setKbContent("");}}>取消</Btn>}<Btn primary onClick={addKbItem} disabled={!kbTitle.trim()||!kbContent.trim()}><Plus size={15}/>{kbEdit?"保存修改":"添加到知识库"}</Btn></div>
        </Card>}

        {/* 素材列表 */}
        {knowledgeBase.length>0&&<><div style={{fontSize:18,fontWeight:600,marginBottom:14,marginTop:8}}>📚 已收录素材 ({knowledgeBase.length})</div><div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}><button onClick={()=>setKbFilter("all")} style={{padding:"6px 14px",borderRadius:16,fontSize:14,border:"none",cursor:"pointer",background:kbFilter==="all"?"#007AFF":"rgba(255,255,255,0.06)",color:kbFilter==="all"?"#fff":"rgba(255,255,255,0.4)"}}>全部 ({knowledgeBase.length})</button>{KB_CATS.map(c=>{const cnt=knowledgeBase.filter(k=>k.category===c).length;return cnt>0?<button key={c} onClick={()=>setKbFilter(c)} style={{padding:"6px 14px",borderRadius:16,fontSize:14,border:"none",cursor:"pointer",background:kbFilter===c?"#007AFF":"rgba(255,255,255,0.06)",color:kbFilter===c?"#fff":"rgba(255,255,255,0.4)"}}>{c} ({cnt})</button>:null;})}</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{filteredKb.map(k=><div key={k.id} style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:"18px 22px",border:"1px solid rgba(255,255,255,0.04)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:13,padding:"3px 10px",borderRadius:8,background:k.category==="公众号素材"?"rgba(52,199,89,0.1)":"rgba(0,122,255,0.1)",color:k.category==="公众号素材"?"#34C759":"#007AFF",fontWeight:600}}>{k.category}</span><span style={{fontSize:16,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k.title}</span>{k.source&&<span style={{fontSize:12,color:"rgba(255,255,255,0.25)",flexShrink:0}}>来源：{k.source}</span>}<Btn small onClick={()=>{setKbMode("manual");editKbItem(k);}}><PenTool size={12}/></Btn><Btn small danger onClick={()=>delKbItem(k.id)}><Trash2 size={12}/></Btn></div><div style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.6,maxHeight:60,overflow:"hidden"}}>{k.content}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.2)",marginTop:6}}>{new Date(k.createdAt).toLocaleDateString("zh-CN")} · {k.content.length}字{k.read!==undefined&&<span> · 👁{k.read} 👍{k.praise}</span>}</div></div>)}</div></>}
        {!knowledgeBase.length&&<div style={{textAlign:"center",padding:"40px 0",color:"rgba(255,255,255,0.3)"}}><Database size={32} style={{marginBottom:10,opacity:0.3}}/><div style={{fontSize:16}}>知识库为空，采集公众号文章或手动添加素材</div></div>}
      </div>}

      {/* CONTENT */}
      {tab==="content"&&<div>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 32px"}}>内容生成</h1>
        <Card><Label>选择问题</Label>{!mon.length?<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:15,padding:14}}>列表为空 <Btn onClick={()=>setTab("keywords")} style={{marginLeft:10}}>去生成</Btn></div>:<div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:180,overflowY:"auto"}}>{mon.map((m,i)=><div key={i} onClick={()=>setCQ(m)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderRadius:10,cursor:"pointer",background:cQ?.question===m.question?"rgba(0,122,255,0.1)":"rgba(255,255,255,0.02)",border:cQ?.question===m.question?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.04)"}}><span style={{fontSize:15,color:cQ?.question===m.question?"#007AFF":"rgba(255,255,255,0.5)",flex:1}}>{m.question}</span>{cQ?.question===m.question&&<CheckCircle2 size={16} color="#007AFF"/>}</div>)}</div>}</Card>
        <Card><Label>文章类型</Label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{AT.map(t=>{const a=aType===t.key;const I=t.icon;return<div key={t.key} onClick={()=>setAType(t.key)} style={{padding:"16px 20px",borderRadius:14,cursor:"pointer",background:a?"rgba(0,122,255,0.1)":"rgba(255,255,255,0.02)",border:a?"1px solid rgba(0,122,255,0.3)":"1px solid rgba(255,255,255,0.04)"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><I size={16} style={{color:a?"#007AFF":"rgba(255,255,255,0.4)"}}/><span style={{fontSize:16,fontWeight:600,color:a?"#007AFF":"rgba(255,255,255,0.7)"}}>{t.label}</span></div><div style={{fontSize:14,color:"rgba(255,255,255,0.3)"}}>{t.desc}</div></div>;})}</div></Card>
        {knowledgeBase.length>0&&<div style={{background:"rgba(0,122,255,0.06)",borderRadius:12,padding:"12px 18px",marginBottom:20,fontSize:14,color:"#007AFF"}}><Database size={14} style={{verticalAlign:-3}}/> 知识库已加载 {knowledgeBase.length} 条素材，将自动融入文章</div>}
        {hasContact&&<div style={{background:"rgba(52,199,89,0.06)",borderRadius:12,padding:"12px 18px",marginBottom:20,fontSize:14,color:"#34C759"}}><CheckCircle2 size={14} style={{verticalAlign:-3}}/> 文章末尾将植入联系方式</div>}
        {!hasContact&&<div style={{background:"rgba(255,149,0,0.06)",borderRadius:12,padding:"12px 18px",marginBottom:20,fontSize:14,color:"#FF9500",display:"flex",alignItems:"center"}}><AlertCircle size={14} style={{marginRight:8}}/>未设置引流信息 <Btn small onClick={()=>setTab("settings")} style={{marginLeft:"auto"}}>去设置</Btn></div>}
        <Btn primary onClick={genArticle} disabled={!cQ||isGenA} style={{fontSize:17,padding:"14px 32px",marginBottom:24}}>{isGenA?<><Loader2 size={17} className="spin"/>生成中...</>:<><Sparkles size={17}/>一键生成文章</>}</Btn>
        {article&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:16,fontWeight:600}}>预览 · {article.length}字</span><div style={{display:"flex",gap:8}}><Btn small onClick={()=>{saveToQueue();}}><ClipboardList size={13}/>加入待发布</Btn><Btn small onClick={copyA}>{copied?<><Check size={13}/>已复制</>:<><Copy size={13}/>复制</>}</Btn><Btn small primary onClick={()=>setTab("publish")}><Send size={13}/>去发布</Btn></div></div><div style={{padding:"20px 28px",maxHeight:450,overflowY:"auto"}}>{renderMd(article)}</div></div>}
      </div>}

      {/* QUEUE 待发布列表 */}
      {tab==="queue"&&<div>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 6px"}}>待发布列表</h1>
        <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",margin:"0 0 28px"}}>内容生成和AI二创的文章汇集在这里，逐篇复制到各平台发布</p>
        {viewArticle?<div>
          <Btn onClick={()=>setViewArticle(null)} style={{marginBottom:18}}>← 返回</Btn>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div><div style={{fontSize:16,fontWeight:600}}>{viewArticle.question}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:3}}>{viewArticle.wordCount}字 · {viewArticle.source||viewArticle.type} · {new Date(viewArticle.createdAt).toLocaleDateString("zh-CN")}</div></div>
              <div style={{display:"flex",gap:8}}><Btn small onClick={()=>copyText(viewArticle.content)}><Copy size={13}/>复制</Btn><Btn small primary onClick={()=>{setArticle(viewArticle.content);setTab("publish");}}><Send size={13}/>去发布</Btn></div>
            </div>
            <div style={{padding:"20px 28px",maxHeight:550,overflowY:"auto"}}>{renderMd(viewArticle.content)}</div>
          </div>
        </div>:
        savedArticles.length===0?<div style={{textAlign:"center",padding:"70px 0"}}><div style={{fontSize:44,marginBottom:14}}>📋</div><div style={{fontSize:18,color:"rgba(255,255,255,0.4)"}}>待发布列表为空</div><div style={{fontSize:14,color:"rgba(255,255,255,0.2)",marginTop:8}}>在「内容生成」写文章或在「采集监控」一键二创</div></div>:
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {savedArticles.map(a=><div key={a.id} style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:"18px 22px",border:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>setViewArticle(a)}>
            <div style={{width:44,height:44,borderRadius:12,background:a.type==="recreate"?"rgba(255,149,0,0.1)":"rgba(0,122,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{a.type==="recreate"?<RotateCw size={20} color="#FF9500"/>:<FileText size={20} color="#007AFF"/>}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:16,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.question}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:3,display:"flex",alignItems:"center",gap:10}}><span>{a.source||AT.find(t=>t.key===a.type)?.label||a.type}</span><span>{a.wordCount}字</span><span><Clock size={11} style={{verticalAlign:-2}}/> {new Date(a.createdAt).toLocaleDateString("zh-CN")}</span></div></div>
            <Btn small onClick={e=>{e.stopPropagation();copyText(a.content);}}><Copy size={13}/></Btn>
            <Btn small danger onClick={e=>{e.stopPropagation();setSavedArticles(p=>p.filter(x=>x.id!==a.id));}}><Trash2 size={13}/></Btn>
            <ChevronRight size={16} color="rgba(255,255,255,0.15)"/>
          </div>)}
        </div>}
      </div>}

      {/* PUBLISH */}
      {tab==="publish"&&<div>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 24px"}}>渠道发布</h1>
        {article?<div style={{background:"rgba(52,199,89,0.06)",border:"1px solid rgba(52,199,89,0.15)",borderRadius:18,padding:"18px 24px",marginBottom:28,display:"flex",alignItems:"center",gap:14}}><FileText size={20} style={{color:"#34C759"}}/><div style={{flex:1}}><div style={{fontSize:17,fontWeight:600,color:"#34C759"}}>文章已就绪 · {article.length}字</div></div><Btn primary onClick={copyA}>{copied?<><Check size={15}/>已复制</>:<><Copy size={15}/>一键复制</>}</Btn></div>:<div style={{background:"rgba(255,149,0,0.06)",border:"1px solid rgba(255,149,0,0.15)",borderRadius:18,padding:"18px 24px",marginBottom:28,display:"flex",alignItems:"center",gap:14}}><AlertCircle size={20} style={{color:"#FF9500"}}/><div style={{flex:1}}><div style={{fontSize:17,fontWeight:600,color:"#FF9500"}}>还没有文章</div></div><Btn onClick={()=>setTab("content")}>去生成</Btn></div>}
        <div style={{display:"flex",gap:7,marginBottom:24,flexWrap:"wrap"}}>{[{k:"all",l:"全部"},{k:"核心",l:"核心"},{k:"字节",l:"字节系"},{k:"百度",l:"百度系"},{k:"腾讯",l:"腾讯系"},{k:"新闻",l:"新闻"},{k:"垂直",l:"垂直&种草"}].map(f=><button key={f.k} onClick={()=>setChFilter(f.k)} style={{padding:"7px 16px",borderRadius:18,fontSize:14,border:"none",cursor:"pointer",background:chFilter===f.k?"#007AFF":"rgba(255,255,255,0.06)",color:chFilter===f.k?"#fff":"rgba(255,255,255,0.4)"}}>{f.l}</button>)}</div>
        {filteredGroups.map(g=><div key={g.group} style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{width:8,height:8,borderRadius:"50%",background:g.color}}/><span style={{fontSize:17,fontWeight:600,color:g.color}}>{g.group}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {g.ch.map(ch=>{const ha=!!accounts[ch.n];return<div key={ch.n} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:26}}>{ch.i}</span>
              <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15,fontWeight:600}}>{ch.n}</span><span style={{fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:5,background:ch.p==="核心"?"rgba(52,199,89,0.12)":ch.p==="重要"?"rgba(0,122,255,0.12)":"rgba(255,255,255,0.05)",color:ch.p==="核心"?"#34C759":ch.p==="重要"?"#007AFF":"rgba(255,255,255,0.3)"}}>{ch.p}</span></div><div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:3}}>{ch.d}</div>{ha&&<div style={{fontSize:12,color:"rgba(255,255,255,0.2)",marginTop:2}}><User size={10} style={{verticalAlign:-1}}/> {accounts[ch.n].username}</div>}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                <a href={ch.u} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:5,padding:"9px 16px",borderRadius:10,fontSize:13,fontWeight:600,background:"rgba(0,122,255,0.1)",color:"#007AFF",border:"none",textDecoration:"none",justifyContent:"center"}}>去发布<ExternalLink size={12}/></a>
                <button onClick={()=>setEditCh(ch)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,fontSize:12,background:ha?"rgba(52,199,89,0.08)":"rgba(255,255,255,0.04)",color:ha?"#34C759":"rgba(255,255,255,0.25)",border:"none",justifyContent:"center",cursor:"pointer"}}>{ha?<><Lock size={11}/>账号</>:<><KeyRound size={11}/>存账号</>}</button>
              </div>
            </div>;})}
          </div>
        </div>)}
      </div>}

      {/* DASHBOARD */}
      {tab==="dashboard"&&<div>
        <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 32px"}}>效果看板</h1>
        {!stats?<div style={{textAlign:"center",padding:"70px 0"}}><div style={{fontSize:44,marginBottom:14}}>📊</div><div style={{fontSize:18,color:"rgba(255,255,255,0.4)"}}>暂无数据</div><Btn primary onClick={()=>setTab("monitor")} style={{marginTop:18}}>去采集</Btn></div>:<>
          <div style={{display:"flex",gap:14,marginBottom:28}}><StatCard label="能见度" value={stats.score} color="#34C759" sub="0-100"/><StatCard label="提及率" value={stats.mr+"%"} color="#007AFF" sub="出现/总查询"/><StatCard label="首推" value={stats.counts["首推"]} color="#FF9500" sub={`共${res.length}次`}/></div>
          <div style={{display:"flex",gap:14,marginBottom:28}}>
            <Card style={{flex:1,marginBottom:0}}><div style={{fontSize:17,fontWeight:600,marginBottom:16}}>状态分布</div><div style={{display:"flex",alignItems:"center",gap:20}}><div style={{width:130,height:130}}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} strokeWidth={0}>{pie.map((d,i)=><Cell key={i} fill={ST[d.name].color}/>)}</Pie></PieChart></ResponsiveContainer></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>{Object.entries(stats.counts).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:8,fontSize:14}}><span style={{width:8,height:8,borderRadius:3,background:ST[s].color}}/><span style={{color:"rgba(255,255,255,0.6)",flex:1}}>{s}</span><span style={{fontWeight:700,color:ST[s].color}}>{c}</span></div>)}</div></div></Card>
            <Card style={{flex:1,marginBottom:0}}><div style={{fontSize:17,fontWeight:600,marginBottom:16}}>平台得分</div>{PN.map(p=>{const ps=stats.bp[p];return<div key={p} style={{marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:15,fontWeight:600,color:PC[p].color}}>{PC[p].icon} {p}</span><span style={{fontSize:22,fontWeight:700,color:PC[p].color}}>{ps.score}</span></div><div style={{display:"flex",gap:2,height:7,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,0.05)"}}>{["首推","被提及","被引用","未出现"].map(s=>{const t=Object.values(ps.counts).reduce((a,b)=>a+b,0);const pct=t>0?(ps.counts[s]/t*100):0;return pct>0?<div key={s} style={{width:`${pct}%`,background:ST[s].color}}/>:null;})}</div></div>})}</Card>
          </div>
          <Card><div style={{fontSize:17,fontWeight:600,marginBottom:16}}>状态矩阵</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px"}}><thead><tr><th style={{textAlign:"left",padding:"7px 10px",color:"rgba(255,255,255,0.3)",fontSize:13}}>问题</th>{PN.map(p=><th key={p} style={{textAlign:"center",padding:"7px",color:PC[p].color,fontSize:13,width:100}}>{p}</th>)}</tr></thead><tbody>{Object.entries(stats.mx).map(([q,d])=><tr key={q}><td style={{padding:"10px 12px",fontSize:14,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.02)",borderRadius:"8px 0 0 8px",maxWidth:360,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q}</td>{PN.map((p,pi)=><td key={p} style={{textAlign:"center",padding:"8px 5px",background:"rgba(255,255,255,0.02)",borderRadius:pi===PN.length-1?"0 8px 8px 0":0}}><Badge status={d[p]}/></td>)}</tr>)}</tbody></table></div></Card>
          {stats.cr.length>0&&<Card><div style={{fontSize:17,fontWeight:600,marginBottom:16}}>竞对排行</div><div style={{height:Math.max(140,stats.cr.length*34)}}><ResponsiveContainer><BarChart data={stats.cr} layout="vertical" margin={{left:90,right:20}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis type="number" tick={{fill:"rgba(255,255,255,0.3)",fontSize:12}} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/><YAxis type="category" dataKey="name" tick={{fill:"rgba(255,255,255,0.6)",fontSize:13}} axisLine={false} tickLine={false} width={85}/><Tooltip contentStyle={{background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#fff",fontSize:13}}/><Bar dataKey="count" radius={[0,6,6,0]} barSize={20}>{stats.cr.map((_,i)=><Cell key={i} fill={["#FF3B30","#FF9500","#007AFF","#AF52DE","#34C759"][i%5]}/>)}</Bar></BarChart></ResponsiveContainer></div></Card>}
          <Card><div style={{fontSize:17,fontWeight:600,marginBottom:16}}>趋势</div><div style={{height:200}}><ResponsiveContainer><LineChart data={history} margin={{left:0,right:16,top:8,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="week" tick={{fill:"rgba(255,255,255,0.3)",fontSize:12}} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/><YAxis tick={{fill:"rgba(255,255,255,0.3)",fontSize:12}} axisLine={{stroke:"rgba(255,255,255,0.06)"}} domain={[0,100]}/><Tooltip contentStyle={{background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#fff",fontSize:13}}/><Line type="monotone" dataKey="score" stroke="#007AFF" strokeWidth={2.5} dot={{fill:"#007AFF",r:4}} name="能见度"/></LineChart></ResponsiveContainer></div></Card>
        </>}
      </div>}
    </div>

    {editCh&&<PwdModal channel={editCh} accounts={accounts} onSave={saveAccount} onClose={()=>setEditCh(null)}/>}
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}.spin{animation:spin 1s linear infinite;}*{box-sizing:border-box;margin:0;padding:0;}html,body,#__next{height:100%;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px;}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2);}button{cursor:pointer;transition:opacity 0.15s;}button:hover:not(:disabled){opacity:0.85;}button:disabled{cursor:default;}a{transition:opacity 0.15s;}a:hover{opacity:0.85;}`}</style>
  </div>);
}
