import { useState, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Search, Radar, LayoutDashboard, Plus, Zap, ChevronRight, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Star, Eye, EyeOff, Quote, TrendingUp, TrendingDown, ArrowRight, X, Settings, RefreshCw, Trash2, ExternalLink, Target, Award, BarChart3, Sparkles, FileText, Copy, Check, BookOpen, Send, Globe, PenTool, Wifi, WifiOff } from "lucide-react";

// ======== CONFIG ========
const PLATFORMS_CONFIG = {
  DeepSeek: { color:"#4f8ef7", icon:"🔍", apiRoute:"/api/deepseek" },
  "豆包": { color:"#ff6b4a", icon:"🫘", apiRoute:"/api/doubao" },
  Kimi: { color:"#a855f7", icon:"🌙", apiRoute:"/api/moonshot" },
};
const PLATFORM_NAMES = Object.keys(PLATFORMS_CONFIG);
const ST = {
  "首推":{ color:"#00d4aa", bg:"rgba(0,212,170,0.1)", icon:Star, score:100 },
  "被提及":{ color:"#4f8ef7", bg:"rgba(79,142,247,0.1)", icon:Eye, score:60 },
  "被引用":{ color:"#f59e0b", bg:"rgba(245,158,11,0.1)", icon:Quote, score:30 },
  "未出现":{ color:"#555", bg:"rgba(85,85,85,0.08)", icon:EyeOff, score:0 },
};
const CATS = [
  { key:"选购决策", color:"#00d4aa" }, { key:"行业场景", color:"#4f8ef7" },
  { key:"知识教育", color:"#f59e0b" }, { key:"痛点诊断", color:"#ef4444" },
];

const CHANNEL_GROUPS = [
  { group:"通用高权重平台", color:"#00d4aa", channels:[
    { name:"知乎专栏", icon:"📝", url:"https://zhuanlan.zhihu.com/write", desc:"AI引用率最高", p:"核心" },
    { name:"知乎回答", icon:"💬", url:"https://www.zhihu.com", desc:"场景问答首选", p:"核心" },
    { name:"CSDN博客", icon:"🖥", url:"https://editor.csdn.net/md", desc:"技术内容权重极高", p:"核心" },
    { name:"博客园", icon:"🌿", url:"https://i.cnblogs.com/posts/edit", desc:"多AI平台引用", p:"重要" },
  ]},
  { group:"字节生态（豆包优先抓取）", color:"#ff6b4a", channels:[
    { name:"头条号", icon:"📱", url:"https://mp.toutiao.com/profile_v4/graphic/publish", desc:"豆包核心信息源", p:"核心" },
    { name:"抖音", icon:"🎵", url:"https://creator.douyin.com", desc:"豆包直接抓取", p:"核心" },
    { name:"抖音百科", icon:"📖", url:"https://www.douyin.com/encyclopedia", desc:"知识类内容", p:"重要" },
    { name:"西瓜视频", icon:"🍉", url:"https://studio.ixigua.com", desc:"长视频内容", p:"补充" },
  ]},
  { group:"百度生态（文心一言优先）", color:"#3388ff", channels:[
    { name:"百家号", icon:"📰", url:"https://baijiahao.baidu.com/builder/rc/edit", desc:"文心一言核心源", p:"核心" },
    { name:"百度百科", icon:"📚", url:"https://baike.baidu.com", desc:"最高权威来源", p:"核心" },
    { name:"百度知道", icon:"❓", url:"https://zhidao.baidu.com", desc:"问答内容高频引用", p:"重要" },
    { name:"百度经验", icon:"📋", url:"https://jingyan.baidu.com", desc:"教程型内容", p:"补充" },
    { name:"百度贴吧", icon:"💭", url:"https://tieba.baidu.com", desc:"增加品牌提及", p:"补充" },
  ]},
  { group:"腾讯生态（元宝优先）", color:"#07c160", channels:[
    { name:"微信公众号", icon:"💚", url:"https://mp.weixin.qq.com", desc:"元宝核心源，3.6亿内容库", p:"核心" },
    { name:"腾讯新闻", icon:"📺", url:"https://om.qq.com/article/articleIndex", desc:"元宝高频引用", p:"重要" },
    { name:"腾讯内容开放平台", icon:"🔷", url:"https://om.qq.com", desc:"一键分发腾讯系", p:"重要" },
  ]},
  { group:"新闻媒体（DeepSeek/Kimi主抓）", color:"#e54d42", channels:[
    { name:"搜狐号", icon:"🔶", url:"https://mp.sohu.com/mpfe/v3/main/new-batch/article", desc:"高权重门户", p:"核心" },
    { name:"新浪财经", icon:"🔴", url:"https://cj.sina.com.cn", desc:"财经内容高权重", p:"重要" },
    { name:"网易号", icon:"📡", url:"https://mp.163.com", desc:"覆盖面广", p:"重要" },
    { name:"凤凰号", icon:"🦅", url:"https://ishare.ifeng.com", desc:"新闻权威性强", p:"补充" },
    { name:"一点资讯", icon:"📍", url:"https://mp.yidianzixun.com", desc:"补充分发", p:"补充" },
  ]},
  { group:"垂直 & 长文平台", color:"#a855f7", channels:[
    { name:"简书", icon:"📖", url:"https://www.jianshu.com/writer", desc:"长文友好", p:"重要" },
    { name:"掘金", icon:"⛏", url:"https://juejin.cn/editor/drafts/new", desc:"科技类权重高", p:"重要" },
    { name:"36氪", icon:"🚀", url:"https://36kr.com", desc:"商业科技媒体", p:"补充" },
    { name:"人人都是产品经理", icon:"🧑‍💼", url:"https://www.woshipm.com", desc:"互联网营销垂直", p:"补充" },
    { name:"站长之家", icon:"🌐", url:"https://www.chinaz.com", desc:"SEO行业垂直", p:"补充" },
  ]},
  { group:"社交 & 种草", color:"#ff2442", channels:[
    { name:"小红书", icon:"📕", url:"https://creator.xiaohongshu.com", desc:"品牌口碑建设", p:"重要" },
    { name:"微博", icon:"🔵", url:"https://weibo.com", desc:"社交声量", p:"补充" },
    { name:"豆瓣", icon:"🟢", url:"https://www.douban.com", desc:"长尾SEO价值高", p:"补充" },
  ]},
];

const ATYPES = [
  { key:"guide", label:"行业深度指南", desc:"3000-5000字", icon:BookOpen },
  { key:"qa", label:"场景化问答", desc:"800-1500字", icon:Search },
  { key:"case", label:"案例深度复盘", desc:"1500-2500字", icon:Target },
  { key:"compare", label:"选型对比评测", desc:"2000-3000字", icon:BarChart3 },
];

// ======== HELPERS ========
function analyzeResponse(text, brand, comps) {
  const brandLower = brand.toLowerCase();
  const hasBrand = text.toLowerCase().includes(brandLower);
  const lines = text.split('\n');
  let position = null;
  let isFirst = false;

  // 检查是否在列表中出现
  const listItems = lines.filter(l => /^[\d•\-\*]/.test(l.trim()));
  if (listItems.length > 0) {
    for (let i = 0; i < listItems.length; i++) {
      if (listItems[i].toLowerCase().includes(brandLower)) { position = i + 1; if (i === 0) isFirst = true; break; }
    }
  }

  let status = "未出现";
  if (isFirst || (hasBrand && position === 1)) status = "首推";
  else if (hasBrand && position) status = "被提及";
  else if (hasBrand) status = "被引用";

  const foundComps = comps.filter(c => text.includes(c)).map((name, i) => ({ name, position: i + 1 }));

  const quality = listItems.length > 0 && foundComps.length > 0 ? "详细推荐" : hasBrand || foundComps.length > 0 ? "泛泛回答" : "拒绝推荐";

  return { myBrandStatus: status, myBrandPosition: position, competitors: foundComps, responseQuality: quality };
}

function mockResult(q, p, cat, brand, comps) {
  const w = {"选购决策":[18,22,15,45],"行业场景":[8,18,20,54],"知识教育":[5,12,28,55],"痛点诊断":[6,10,22,62]}[cat]||[10,15,20,55];
  const r = Math.random()*100;
  const s = r<w[0]?"首推":r<w[0]+w[1]?"被提及":r<w[0]+w[1]+w[2]?"被引用":"未出现";
  const mc = [...comps].sort(()=>Math.random()-.5).slice(0,2+Math.floor(Math.random()*3)).map((n,i)=>({name:n,position:i+1}));
  return { id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`, question:q, platform:p, category:cat, myBrandStatus:s, competitors:mc,
    responseQuality:["详细推荐","泛泛回答","泛泛回答"][Math.floor(Math.random()*3)],
    rawResponse:`[模拟数据] ${p}对"${q}"的回答。${s!=="未出现"?`提到了${brand}。`:""}推荐了${mc.map(c=>c.name).join("、")}。\n\n⚠️ 这是模拟数据。接入真实API后将显示AI的实际回答。`,
    collectedAt:new Date().toISOString(), isReal:false };
}

function mockHistory() { return Array.from({length:8},(_,i)=>({week:`W${i+1}`,score:Math.min(92,Math.round(12+i*9.5+Math.random()*8)),mentioned:Math.round(3+i*2+Math.random()*4)})); }

// ======== SMALL COMPONENTS ========
function Badge({status}){const s=ST[status]||ST["未出现"];const I=s.icon;return<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:6,background:s.bg,color:s.color,fontSize:11,fontWeight:600}}><I size={10}/>{status}</span>;}
function StatC({label,value,sub,color,icon:I}){return<div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:"18px 20px",flex:1,minWidth:145,position:"relative",overflow:"hidden"}}>{I&&<I size={42} style={{position:"absolute",right:10,top:10,color:color||"#fff",opacity:0.04}}/>}<div style={{fontSize:11,color:"#777",marginBottom:7}}>{label}</div><div style={{fontSize:30,fontWeight:800,color:color||"#fff",fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:11,color:"#555",marginTop:7}}>{sub}</div>}</div>;}
function STab({active,icon:I,label,badge,onClick}){return<button onClick={onClick} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderRadius:8,background:active?"rgba(0,212,170,0.08)":"transparent",border:active?"1px solid rgba(0,212,170,0.2)":"1px solid transparent",color:active?"#00d4aa":"#666",fontSize:12.5,fontWeight:active?600:400,width:"100%"}}><I size={15}/>{label}{badge>0&&<span style={{marginLeft:"auto",background:active?"#00d4aa":"rgba(255,255,255,0.08)",color:active?"#0a0a0f":"#888",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:8}}>{badge}</span>}</button>;}
function Empty({icon:I,title,desc,action,onAction}){return<div style={{textAlign:"center",padding:"50px 30px"}}><div style={{width:50,height:50,borderRadius:12,background:"rgba(255,255,255,0.03)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><I size={22} style={{color:"#333"}}/></div><div style={{fontSize:14,color:"#555",fontWeight:500,marginBottom:5}}>{title}</div><div style={{fontSize:12,color:"#3a3a3a",maxWidth:280,margin:"0 auto"}}>{desc}</div>{action&&<button onClick={onAction} style={{marginTop:18,background:"rgba(0,212,170,0.08)",border:"1px solid rgba(0,212,170,0.15)",borderRadius:8,padding:"9px 22px",color:"#00d4aa",fontSize:13,display:"inline-flex",alignItems:"center",gap:6}}>{action}<ArrowRight size={13}/></button>}</div>;}

// ======== MAIN APP ========
export default function Home() {
  const [tab, setTab] = useState("settings");
  const [apiStatus, setApiStatus] = useState({ deepseek:false, doubao:false, moonshot:false });
  const [brand, setBrand] = useState(""); const [brandIn, setBrandIn] = useState("");
  const [compIn, setCompIn] = useState(""); const [comps, setComps] = useState([]);
  const [kw, setKw] = useState(""); const [qs, setQs] = useState([]); const [isGen, setIsGen] = useState(false); const [sel, setSel] = useState(new Set());
  const [mon, setMon] = useState([]); const [res, setRes] = useState([]); const [isCol, setIsCol] = useState(false); const [prog, setProg] = useState(0); const [expQ, setExpQ] = useState(null); const [expR, setExpR] = useState(null);
  const [cQ, setCQ] = useState(null); const [aType, setAType] = useState("guide"); const [article, setArticle] = useState(""); const [isGenA, setIsGenA] = useState(false); const [copied, setCopied] = useState(false); const [genH, setGenH] = useState([]);
  const [history] = useState(mockHistory); const [chFilter, setChFilter] = useState("all");

  // 检查API状态
  useEffect(() => { fetch('/api/status').then(r=>r.json()).then(setApiStatus).catch(()=>{}); }, []);
  const anyApiConnected = apiStatus.deepseek || apiStatus.doubao || apiStatus.moonshot;
  const apiMap = { DeepSeek:'deepseek', '豆包':'doubao', Kimi:'moonshot' };

  // ===== 关键词生成 =====
  const genKw = useCallback(async()=>{
    if(!kw.trim())return; setIsGen(true); setQs([]); setSel(new Set());
    const prompt = `你是GEO关键词专家。输入：${kw.trim()}\n生成24个长尾问题，JSON返回，不要其他文字：\n[{"category":"选购决策","question":"..."},{"category":"行业场景","question":"..."},{"category":"知识教育","question":"..."},{"category":"痛点诊断","question":"..."}]\n每类6个。口语化场景化。`;
    try {
      const r = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:2000}) });
      const d = await r.json();
      if(d.text) { setQs(JSON.parse(d.text.replace(/```json|```/g,"").trim())); }
      else throw new Error('no text');
    } catch(e) {
      // fallback mock
      const t={"选购决策":["哪家公司好","多少钱一个月","靠谱推荐","性价比高","口碑好","不踩坑"],"行业场景":["餐饮店怎么做","教育机构有用吗","工厂怎么获客","本地商家怎么做","电商适合吗","装修公司能获客吗"],"知识教育":["自己做还是找代运营","怎么判断靠不靠谱","合同注意什么","多久见效","要准备什么","比传统营销好在哪"],"痛点诊断":["三个月没效果","没人看什么原因","没效果能退吗","播放量上不去","做得不好怎么换","没线索怎么办"]};
      setQs(Object.entries(t).flatMap(([c,q])=>q.map(v=>({category:c,question:`${kw}${v}`}))));
    } setIsGen(false);
  },[kw]);

  const toggleQ=i=>setSel(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});
  const addMon=()=>{const nq=[...sel].map(i=>({question:qs[i].question,category:qs[i].category})).filter(q=>!mon.some(m=>m.question===q.question));if(nq.length){setMon(p=>[...p,...nq]);setSel(new Set());setTab("monitor");}};

  // ===== 真实采集 =====
  const collectOne = async(question, platform) => {
    const key = apiMap[platform];
    if(!apiStatus[key]) return null;
    try {
      const r = await fetch(PLATFORMS_CONFIG[platform].apiRoute, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ messages:[{role:'user',content:question}], max_tokens:2000 })
      });
      const d = await r.json();
      return d.text || null;
    } catch(e) { return null; }
  };

  const collect = useCallback(async()=>{
    if(!brand||!mon.length)return; setIsCol(true); setProg(0);
    const total = mon.length * PLATFORM_NAMES.length;
    const nr = [];
    for(let i=0;i<mon.length;i++){
      for(let j=0;j<PLATFORM_NAMES.length;j++){
        const p = PLATFORM_NAMES[j];
        const key = apiMap[p];
        let result;
        if(apiStatus[key]) {
          // 真实API调用
          const text = await collectOne(mon[i].question, p);
          if(text) {
            const analysis = analyzeResponse(text, brand, comps);
            result = { id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`, question:mon[i].question, platform:p, category:mon[i].category,
              ...analysis, rawResponse:text, collectedAt:new Date().toISOString(), isReal:true };
          } else {
            result = mockResult(mon[i].question, p, mon[i].category, brand, comps);
          }
        } else {
          // Mock降级
          await new Promise(r=>setTimeout(r,80+Math.random()*120));
          result = mockResult(mon[i].question, p, mon[i].category, brand, comps);
        }
        nr.push(result);
        setProg(Math.round(((i*PLATFORM_NAMES.length+j+1)/total)*100));
      }
    }
    setRes(nr); setIsCol(false);
  },[mon,brand,comps,apiStatus]);

  // ===== 文章生成 =====
  const genArticle = useCallback(async()=>{
    if(!cQ)return; setIsGenA(true); setArticle(""); setCopied(false);
    const tp={guide:"写一篇3000字以上行业深度指南。开头直接回答，小标题分段，有数据案例，自然融入品牌，符合EEAT标准。",qa:"写一篇800-1500字精准问答。第一段直接给答案，包含具体数字，自然提及品牌。",case:"写一篇1500-2500字案例复盘。客户背景→痛点→方案→执行→数据结果。",compare:"写一篇2000-3000字选型对比评测。表格横向对比，不同场景给明确推荐。"};
    const prompt = `你是GEO内容专家。目标问题：${cQ.question}\n品牌：${brand||"未设置"}\n竞对：${comps.join("、")||"暂无"}\n\n${tp[aType]}\n\nMarkdown格式，包含标题。直接输出正文。`;
    try {
      const r = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:4000})});
      const d = await r.json();
      if(d.text) setArticle(d.text);
      else throw new Error('no text');
    } catch(e) {
      setArticle(`# ${cQ.question}\n\n> ⚠️ API未连接，这是模拟文章。请在Vercel环境变量中配置API Key后重新生成。\n\n## 核心回答\n\n针对这个问题，以下是基于行业实践的专业解答...\n\n## 详细分析\n\n### 1. 市场现状\n\n当前市场...\n\n### 2. 关键要素\n\n...\n\n## 总结\n\n...`);
    }
    setGenH(p=>[{question:cQ.question,type:aType,time:new Date().toISOString()},...p].slice(0,20));
    setIsGenA(false);
  },[cQ,aType,brand,comps]);

  const copyA=useCallback(async()=>{try{await navigator.clipboard.writeText(article)}catch(e){const ta=document.createElement("textarea");ta.value=article;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);}setCopied(true);setTimeout(()=>setCopied(false),2500);},[article]);

  // ===== 看板计算 =====
  const stats = useMemo(()=>{
    if(!res.length)return null;
    const score=Math.round(res.reduce((s,r)=>s+ST[r.myBrandStatus].score,0)/res.length);
    const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};res.forEach(r=>counts[r.myBrandStatus]++);
    const mr=Math.round(((res.length-counts["未出现"])/res.length)*100);
    const bp={};PLATFORM_NAMES.forEach(p=>{const pr=res.filter(r=>r.platform===p);bp[p]={score:pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus].score,0)/pr.length):0,counts:{"首推":0,"被提及":0,"被引用":0,"未出现":0}};pr.forEach(r=>bp[p].counts[r.myBrandStatus]++);});
    const cf={};res.forEach(r=>r.competitors?.forEach(c=>{cf[c.name]=(cf[c.name]||0)+1;}));const cr=Object.entries(cf).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({name:n,count:c}));
    const mx={};mon.forEach(m=>{mx[m.question]={category:m.category};PLATFORM_NAMES.forEach(p=>mx[m.question][p]="未出现");});res.forEach(r=>{if(mx[r.question])mx[r.question][r.platform]=r.myBrandStatus;});
    const realCount = res.filter(r=>r.isReal).length;
    return{score,counts,mr,bp,cr,mx,realCount};
  },[res,mon]);
  const pie=stats?Object.entries(stats.counts).filter(([_,v])=>v>0).map(([n,v])=>({name:n,value:v})):[];

  const renderMd=(md)=>{if(!md)return null;return md.split("\n").map((l,i)=>{if(l.startsWith("# "))return<h1 key={i} style={{fontSize:20,fontWeight:800,color:"#fff",margin:"20px 0 10px"}}>{l.slice(2)}</h1>;if(l.startsWith("## "))return<h2 key={i} style={{fontSize:16,fontWeight:700,color:"#ddd",margin:"16px 0 8px"}}>{l.slice(3)}</h2>;if(l.startsWith("### "))return<h3 key={i} style={{fontSize:14,fontWeight:700,color:"#bbb",margin:"12px 0 6px"}}>{l.slice(4)}</h3>;if(l.startsWith("> "))return<blockquote key={i} style={{borderLeft:"3px solid #00d4aa",paddingLeft:14,margin:"10px 0",color:"#999",fontStyle:"italic",fontSize:13}}>{l.slice(2)}</blockquote>;if(l.startsWith("- ")||l.startsWith("* "))return<div key={i} style={{paddingLeft:14,margin:"3px 0",fontSize:13,color:"#aaa",lineHeight:1.6}}>• {l.slice(2)}</div>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<p key={i} style={{fontSize:13,color:"#aaa",lineHeight:1.7,margin:"4px 0"}}>{l}</p>;});};

  const filteredGroups = chFilter==="all"?CHANNEL_GROUPS:chFilter==="核心"?CHANNEL_GROUPS.map(g=>({...g,channels:g.channels.filter(c=>c.p==="核心")})).filter(g=>g.channels.length>0):CHANNEL_GROUPS.filter(g=>g.group.includes(chFilter));

  return(<div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
    {/* SIDEBAR */}
    <div style={{width:210,borderRight:"1px solid rgba(255,255,255,0.05)",padding:"16px 10px",display:"flex",flexDirection:"column",gap:3,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"2px 8px",marginBottom:14}}><div style={{fontSize:17,fontWeight:800,color:"#00d4aa",display:"flex",alignItems:"center",gap:7}}><Target size={16}/>GEO Monitor</div><div style={{fontSize:10,color:"#444",marginTop:2}}>AI能见度监控工具</div></div>
      <div style={{fontSize:9,color:"#333",padding:"0 10px",marginBottom:2,letterSpacing:1,fontWeight:600}}>工作流</div>
      <STab active={tab==="keywords"} icon={Search} label="❶ 关键词扩展" onClick={()=>setTab("keywords")}/>
      <STab active={tab==="monitor"} icon={Radar} label="❷ 采集监控" badge={mon.length} onClick={()=>setTab("monitor")}/>
      <STab active={tab==="content"} icon={PenTool} label="❸ 内容生成" badge={genH.length} onClick={()=>setTab("content")}/>
      <STab active={tab==="publish"} icon={Send} label="❹ 渠道发布" onClick={()=>setTab("publish")}/>
      <STab active={tab==="dashboard"} icon={LayoutDashboard} label="❺ 效果看板" onClick={()=>setTab("dashboard")}/>
      <div style={{height:1,background:"rgba(255,255,255,0.04)",margin:"8px 6px"}}/>
      <STab active={tab==="settings"} icon={Settings} label="品牌设置" onClick={()=>setTab("settings")}/>
      <div style={{flex:1}}/>

      {/* API状态面板 */}
      <div style={{padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,margin:"4px 4px 8px"}}>
        <div style={{fontSize:10,color:"#555",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>{anyApiConnected?<Wifi size={10} style={{color:"#00d4aa"}}/>:<WifiOff size={10} style={{color:"#ef4444"}}/>}API连接状态</div>
        {PLATFORM_NAMES.map(p=>{const key=apiMap[p];const ok=apiStatus[key];return<div key={p} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,marginBottom:3}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:ok?"#00d4aa":"#555"}}/>
          <span style={{color:ok?"#aaa":"#555"}}>{p}</span>
          <span style={{marginLeft:"auto",fontSize:9,color:ok?"#00d4aa":"#555"}}>{ok?"已连接":"未连接"}</span>
        </div>;})}
      </div>

      <div style={{padding:"8px 10px",background:"rgba(255,255,255,0.02)",borderRadius:8,margin:"0 4px"}}><div style={{fontSize:10,color:"#555"}}>当前品牌</div>{brand?<div style={{fontSize:12,fontWeight:700,color:"#00d4aa",marginTop:2}}>{brand}</div>:<div style={{fontSize:11,color:"#ef4444",marginTop:2}}>未设置</div>}</div>
    </div>

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",padding:"22px 32px"}}>

      {/* SETTINGS */}
      {tab==="settings"&&<div style={{maxWidth:600}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 8px"}}>品牌设置</h2>

        {/* API连接状态 */}
        <div style={{background:anyApiConnected?"rgba(0,212,170,0.05)":"rgba(245,158,11,0.06)",border:`1px solid ${anyApiConnected?"rgba(0,212,170,0.15)":"rgba(245,158,11,0.15)"}`,borderRadius:11,padding:"16px 20px",marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:700,color:anyApiConnected?"#00d4aa":"#f59e0b",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            {anyApiConnected?<Wifi size={15}/>:<WifiOff size={15}/>} API连接状态
          </div>
          <div style={{display:"flex",gap:16}}>
            {PLATFORM_NAMES.map(p=>{const key=apiMap[p];const ok=apiStatus[key];return<div key={p} style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:ok?"#00d4aa":"#555"}}/>
              <span style={{color:ok?"#ccc":"#666"}}>{p}</span>
              <span style={{fontSize:11,color:ok?"#00d4aa":"#555"}}>{ok?"✓":"✗"}</span>
            </div>;})}
          </div>
          {!anyApiConnected&&<div style={{fontSize:12,color:"#888",marginTop:10,lineHeight:1.5}}>
            所有API均未连接，工具将使用模拟数据运行。要接入真实数据，请在 Vercel 项目设置 → Environment Variables 中添加 API Key，然后重新部署。
          </div>}
        </div>

        <div style={{marginBottom:28}}><label style={{fontSize:13,fontWeight:600,color:"#aaa",display:"block",marginBottom:8}}>品牌名称</label><p style={{fontSize:12,color:"#666",margin:"-2px 0 10px"}}>采集时检测这个名字是否出现在AI回答中</p><div style={{display:"flex",gap:8}}><input value={brandIn} onChange={e=>setBrandIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&brandIn.trim()&&setBrand(brandIn.trim())} placeholder="输入品牌名或公司名" style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none"}}/><button onClick={()=>brandIn.trim()&&setBrand(brandIn.trim())} style={{background:brandIn.trim()?"#00d4aa":"rgba(0,212,170,0.15)",color:brandIn.trim()?"#0a0a0f":"#00d4aa",border:"none",borderRadius:9,padding:"0 20px",fontSize:13,fontWeight:700}}>保存</button></div>{brand&&<div style={{marginTop:6,fontSize:12,color:"#00d4aa",display:"flex",alignItems:"center",gap:5}}><CheckCircle2 size={13}/>当前：{brand}</div>}</div>
        <div><label style={{fontSize:13,fontWeight:600,color:"#aaa",display:"block",marginBottom:8}}>竞对品牌</label><div style={{display:"flex",gap:8,marginBottom:10}}><input value={compIn} onChange={e=>setCompIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const c=compIn.trim();if(c&&!comps.includes(c)){setComps(p=>[...p,c]);setCompIn("");}}}} placeholder="输入竞对名，回车添加" style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none"}}/></div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{comps.map(c=><span key={c} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:7,fontSize:12,color:"#aaa"}}>{c}<button onClick={()=>setComps(p=>p.filter(x=>x!==c))} style={{background:"none",border:"none",color:"#555",padding:0,display:"flex"}}><X size={11}/></button></span>)}{comps.length===0&&<span style={{fontSize:12,color:"#444"}}>暂未添加</span>}</div></div>
        {brand&&<div style={{marginTop:28}}><button onClick={()=>setTab("keywords")} style={{background:"#00d4aa",color:"#0a0a0f",border:"none",borderRadius:9,padding:"12px 28px",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:8}}>设置完成，去生成关键词 <ArrowRight size={15}/></button></div>}
      </div>}

      {/* KEYWORDS */}
      {tab==="keywords"&&<div><h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 20px"}}>❶ 关键词扩展</h2>
        <div style={{display:"flex",gap:10,marginBottom:22}}><input value={kw} onChange={e=>setKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genKw()} placeholder="输入关键词，如：济南短视频运营" style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,padding:"11px 15px",color:"#fff",fontSize:14,outline:"none"}}/><button onClick={genKw} disabled={isGen||!kw.trim()} style={{background:isGen?"rgba(0,212,170,0.15)":"#00d4aa",color:isGen?"#00d4aa":"#0a0a0f",border:"none",borderRadius:9,padding:"0 22px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:!kw.trim()?.4:1,whiteSpace:"nowrap"}}>{isGen?<><Loader2 size={14} className="spin"/>生成中</>:<><Zap size={14}/>生成长尾问题</>}</button></div>
        {qs.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:9}}><span style={{fontSize:12,color:"#888"}}>共<b style={{color:"#00d4aa"}}>{qs.length}</b>个 · 已选<b style={{color:"#4f8ef7"}}>{sel.size}</b>个</span><div style={{display:"flex",gap:8}}><button onClick={()=>setSel(p=>p.size===qs.length?new Set():new Set(qs.map((_,i)=>i)))} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"5px 12px",color:"#aaa",fontSize:11}}>{sel.size===qs.length?"取消":"全选"}</button><button onClick={addMon} disabled={!sel.size} style={{background:sel.size?"#00d4aa":"rgba(0,212,170,0.1)",color:sel.size?"#0a0a0f":"#00d4aa",border:"none",borderRadius:6,padding:"5px 16px",fontSize:11,fontWeight:700,opacity:sel.size?1:.5}}><Plus size={12}/>加入监控</button></div></div>
        {CATS.map(cat=>{const cq=qs.map((q,i)=>({...q,idx:i})).filter(q=>q.category===cat.key);if(!cq.length)return null;return<div key={cat.key} style={{marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}><span style={{width:7,height:7,borderRadius:"50%",background:cat.color}}/><span style={{fontSize:11,fontWeight:700,color:cat.color}}>{cat.key}</span><span style={{fontSize:10,color:"#555"}}>{cq.length}个</span></div>{cq.map(q=><div key={q.idx} onClick={()=>toggleQ(q.idx)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel.has(q.idx)?"rgba(79,142,247,0.06)":"rgba(255,255,255,0.015)",border:sel.has(q.idx)?"1px solid rgba(79,142,247,0.2)":"1px solid rgba(255,255,255,0.03)",borderRadius:7,marginBottom:3,cursor:"pointer"}}><div style={{width:16,height:16,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:sel.has(q.idx)?"#4f8ef7":"rgba(255,255,255,0.05)",border:sel.has(q.idx)?"none":"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>{sel.has(q.idx)&&<CheckCircle2 size={10} color="#fff"/>}</div><span style={{fontSize:13,color:sel.has(q.idx)?"#ccc":"#888"}}>{q.question}</span></div>)}</div>})}</>}
        {!qs.length&&!isGen&&<Empty icon={Sparkles} title="输入关键词生成AI搜索问题" desc="AI将自动生成24个分类好的场景化长尾问题"/>}
      </div>}

      {/* MONITOR */}
      {tab==="monitor"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}><div><h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>❷ 采集监控</h2><p style={{color:"#666",fontSize:13,margin:0}}>{mon.length}问题 × {PLATFORM_NAMES.length}平台{anyApiConnected?" · 真实API已连接":" · 模拟数据模式"}</p></div><div style={{display:"flex",gap:6}}>{mon.length>0&&<button onClick={()=>{setMon([]);setRes([]);}} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"9px 14px",color:"#ef4444",fontSize:11,display:"flex",alignItems:"center",gap:4}}><Trash2 size={12}/>清空</button>}<button onClick={collect} disabled={isCol||!mon.length||!brand} style={{background:isCol||!mon.length||!brand?"rgba(0,212,170,0.12)":"#00d4aa",color:isCol||!mon.length||!brand?"#00d4aa":"#0a0a0f",border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:!mon.length||!brand?.4:1}}>{isCol?<><Loader2 size={14} className="spin"/>{prog}%</>:<><RefreshCw size={14}/>开始采集</>}</button></div></div>
        {!brand&&mon.length>0&&<div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:8,padding:"10px 16px",marginBottom:14,fontSize:12,color:"#f59e0b",display:"flex",alignItems:"center",gap:8}}><AlertCircle size={14}/>请先设置品牌名称<button onClick={()=>setTab("settings")} style={{marginLeft:"auto",background:"rgba(245,158,11,0.15)",border:"none",borderRadius:5,padding:"4px 10px",color:"#f59e0b",fontSize:11}}>去设置</button></div>}
        {isCol&&<div style={{marginBottom:14}}><div style={{background:"rgba(255,255,255,0.04)",borderRadius:5,height:4,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#00d4aa,#4f8ef7)",transition:"width 0.3s"}}/></div></div>}
        {!mon.length?<Empty icon={Radar} title="监控列表为空" desc="先去关键词扩展生成问题" action="去生成" onAction={()=>setTab("keywords")}/>:
        mon.map((m,qi)=>{const qr=res.filter(r=>r.question===m.question);const isE=expQ===qi;return<div key={qi} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,marginBottom:5,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}} onClick={()=>setExpQ(isE?null:qi)}><span style={{flex:1,fontSize:13,color:"#bbb"}}>{m.question}</span>{qr.length>0&&<div style={{display:"flex",gap:4}}>{PLATFORM_NAMES.map(p=>{const r=qr.find(r=>r.platform===p);return r?<Badge key={p} status={r.myBrandStatus}/>:null;})}</div>}{isE?<ChevronUp size={14} color="#555"/>:<ChevronDown size={14} color="#555"/>}<button onClick={e=>{e.stopPropagation();setMon(p=>p.filter((_,i)=>i!==qi));}} style={{background:"none",border:"none",color:"#333",padding:2}}><X size={12}/></button></div>
          {isE&&qr.length>0&&<div style={{padding:"0 14px 12px",borderTop:"1px solid rgba(255,255,255,0.03)"}}>{PLATFORM_NAMES.map(p=>{const r=qr.find(r=>r.platform===p);if(!r)return null;const isD=expR===r.id;return<div key={p} style={{marginTop:8,background:"rgba(0,0,0,0.2)",borderRadius:8,overflow:"hidden"}}><div onClick={()=>setExpR(isD?null:r.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",cursor:"pointer"}}><span style={{fontSize:11,fontWeight:700,color:PLATFORMS_CONFIG[p].color,minWidth:55}}>{PLATFORMS_CONFIG[p].icon}{p}</span><Badge status={r.myBrandStatus}/>{r.isReal&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"rgba(0,212,170,0.1)",color:"#00d4aa"}}>真实数据</span>}<span style={{fontSize:11,color:"#444",marginLeft:"auto"}}>{r.competitors.map(c=>c.name).join("、")}</span>{isD?<ChevronUp size={13} color="#444"/>:<ChevronDown size={13} color="#444"/>}</div>{isD&&<div style={{padding:"0 12px 10px",borderTop:"1px solid rgba(255,255,255,0.03)"}}><div style={{fontSize:12,color:"#999",lineHeight:1.6,whiteSpace:"pre-wrap",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"8px 10px",marginTop:6,maxHeight:300,overflowY:"auto"}}>{r.rawResponse}</div></div>}</div>;})}</div>}
        </div>;})}
      </div>}

      {/* CONTENT */}
      {tab==="content"&&<div><h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 20px"}}>❸ 内容生成</h2>
        <div style={{marginBottom:20}}><div style={{fontSize:12,fontWeight:600,color:"#aaa",marginBottom:8}}>选择问题</div>
          {!mon.length?<div style={{padding:18,textAlign:"center",fontSize:12,color:"#555",background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.08)",borderRadius:9}}>列表为空<button onClick={()=>setTab("keywords")} style={{marginLeft:8,background:"rgba(0,212,170,0.08)",border:"none",borderRadius:5,padding:"4px 12px",color:"#00d4aa",fontSize:11}}>去生成</button></div>:
          <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:160,overflowY:"auto"}}>{mon.map((m,i)=><div key={i} onClick={()=>setCQ(m)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:7,cursor:"pointer",background:cQ?.question===m.question?"rgba(0,212,170,0.08)":"rgba(255,255,255,0.015)",border:cQ?.question===m.question?"1px solid rgba(0,212,170,0.25)":"1px solid rgba(255,255,255,0.03)"}}><span style={{fontSize:12,color:cQ?.question===m.question?"#00d4aa":"#888",flex:1}}>{m.question}</span>{cQ?.question===m.question&&<CheckCircle2 size={12} color="#00d4aa"/>}</div>)}</div>}
        </div>
        <div style={{marginBottom:20}}><div style={{fontSize:12,fontWeight:600,color:"#aaa",marginBottom:8}}>文章类型</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{ATYPES.map(t=>{const a=aType===t.key;const I=t.icon;return<div key={t.key} onClick={()=>setAType(t.key)} style={{padding:"12px 14px",borderRadius:9,cursor:"pointer",background:a?"rgba(79,142,247,0.08)":"rgba(255,255,255,0.02)",border:a?"1px solid rgba(79,142,247,0.25)":"1px solid rgba(255,255,255,0.04)"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><I size={13} style={{color:a?"#4f8ef7":"#666"}}/><span style={{fontSize:12,fontWeight:600,color:a?"#4f8ef7":"#aaa"}}>{t.label}</span></div><div style={{fontSize:11,color:"#555"}}>{t.desc}</div></div>;})}</div></div>
        <button onClick={genArticle} disabled={!cQ||isGenA} style={{background:!cQ||isGenA?"rgba(0,212,170,0.12)":"#00d4aa",color:!cQ||isGenA?"#00d4aa":"#0a0a0f",border:"none",borderRadius:9,padding:"11px 28px",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:8,opacity:!cQ?.4:1,marginBottom:20}}>{isGenA?<><Loader2 size={16} className="spin"/>生成中...</>:<><Sparkles size={16}/>一键生成文章</>}</button>
        {article&&<div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.015)"}}><div style={{display:"flex",alignItems:"center",gap:8}}><FileText size={14} style={{color:"#00d4aa"}}/><span style={{fontSize:13,fontWeight:600,color:"#ccc"}}>文章预览 · {article.length}字</span></div><div style={{display:"flex",gap:6}}><button onClick={copyA} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,background:copied?"rgba(0,212,170,0.1)":"rgba(79,142,247,0.1)",border:copied?"1px solid rgba(0,212,170,0.2)":"1px solid rgba(79,142,247,0.2)",color:copied?"#00d4aa":"#4f8ef7"}}>{copied?<><Check size={12}/>已复制</>:<><Copy size={12}/>复制全文</>}</button><button onClick={()=>setTab("publish")} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,background:"#00d4aa",color:"#0a0a0f",border:"none"}}><Send size={12}/>去发布</button></div></div><div style={{padding:"16px 22px",maxHeight:400,overflowY:"auto"}}>{renderMd(article)}</div></div>}
      </div>}

      {/* PUBLISH */}
      {tab==="publish"&&<div><h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 20px"}}>❹ 渠道发布</h2>
        {article?<div style={{background:"rgba(0,212,170,0.05)",border:"1px solid rgba(0,212,170,0.15)",borderRadius:11,padding:"14px 20px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}><FileText size={18} style={{color:"#00d4aa",flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#00d4aa"}}>文章已就绪 · {article.length}字</div></div><button onClick={copyA} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",borderRadius:8,fontSize:13,fontWeight:700,background:copied?"rgba(0,212,170,0.15)":"#00d4aa",color:copied?"#00d4aa":"#0a0a0f",border:"none"}}>{copied?<><Check size={14}/>已复制</>:<><Copy size={14}/>一键复制全文</>}</button></div>:<div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.12)",borderRadius:11,padding:"14px 20px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}><AlertCircle size={18} style={{color:"#f59e0b",flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#f59e0b"}}>还没有生成文章</div></div><button onClick={()=>setTab("content")} style={{background:"rgba(245,158,11,0.12)",border:"none",borderRadius:7,padding:"7px 16px",color:"#f59e0b",fontSize:12,fontWeight:600}}>去生成</button></div>}
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>{[{k:"all",l:"全部"},{k:"核心",l:"只看核心"},{k:"字节",l:"字节系"},{k:"百度",l:"百度系"},{k:"腾讯",l:"腾讯系"},{k:"新闻",l:"新闻媒体"},{k:"垂直",l:"垂直平台"},{k:"社交",l:"社交种草"}].map(f=><button key={f.k} onClick={()=>setChFilter(f.k)} style={{padding:"5px 12px",borderRadius:16,fontSize:11,fontWeight:600,border:"1px solid",background:chFilter===f.k?"rgba(0,212,170,0.1)":"transparent",borderColor:chFilter===f.k?"rgba(0,212,170,0.25)":"rgba(255,255,255,0.06)",color:chFilter===f.k?"#00d4aa":"#666"}}>{f.l}</button>)}</div>
        {filteredGroups.map(g=><div key={g.group} style={{marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{width:8,height:8,borderRadius:"50%",background:g.color}}/><span style={{fontSize:13,fontWeight:700,color:g.color}}>{g.group}</span></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{g.channels.map(ch=><div key={ch.name} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{ch.icon}</span><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:700,color:"#ccc"}}>{ch.name}</span><span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:3,background:ch.p==="核心"?"rgba(0,212,170,0.12)":ch.p==="重要"?"rgba(79,142,247,0.12)":"rgba(255,255,255,0.05)",color:ch.p==="核心"?"#00d4aa":ch.p==="重要"?"#4f8ef7":"#666"}}>{ch.p}</span></div><div style={{fontSize:10,color:"#555",marginTop:2}}>{ch.desc}</div></div><a href={ch.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:4,padding:"6px 11px",borderRadius:6,fontSize:11,fontWeight:600,background:`${g.color}15`,color:g.color,border:`1px solid ${g.color}25`,textDecoration:"none",flexShrink:0}}>去发布<ExternalLink size={10}/></a></div>)}</div></div>)}
      </div>}

      {/* DASHBOARD */}
      {tab==="dashboard"&&<div><h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 20px"}}>❺ 效果看板</h2>
        {!stats?<Empty icon={BarChart3} title="暂无数据" desc="完成采集后自动生成看板" action="去采集" onAction={()=>setTab("monitor")}/>:<>
          {stats.realCount>0&&<div style={{background:"rgba(0,212,170,0.05)",border:"1px solid rgba(0,212,170,0.15)",borderRadius:9,padding:"10px 16px",marginBottom:16,fontSize:12,color:"#00d4aa",display:"flex",alignItems:"center",gap:6}}><Wifi size={13}/>本次采集包含 {stats.realCount} 条真实API数据，{res.length-stats.realCount} 条模拟数据</div>}
          <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap"}}><StatC label="能见度评分" value={stats.score} color="#00d4aa" icon={Award} sub="0-100综合评分"/><StatC label="提及率" value={stats.mr+"%"} color="#4f8ef7" icon={Eye} sub="出现/总查询"/><StatC label="首推次数" value={stats.counts["首推"]} color="#f59e0b" icon={Star} sub={`${res.length}次查询`}/><StatC label="已生成文章" value={genH.length} color="#a855f7" icon={FileText}/></div>
          <div style={{display:"flex",gap:14,marginBottom:22}}>
            <div style={{flex:1,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"16px 20px"}}><div style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:12}}>状态分布</div><div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:120,height:120}}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} strokeWidth={0}>{pie.map((d,i)=><Cell key={i} fill={ST[d.name].color}/>)}</Pie></PieChart></ResponsiveContainer></div><div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>{Object.entries(stats.counts).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}><span style={{width:7,height:7,borderRadius:2,background:ST[s].color}}/><span style={{color:"#999",flex:1}}>{s}</span><span style={{fontWeight:700,color:ST[s].color,fontFamily:"'JetBrains Mono',monospace"}}>{c}</span></div>)}</div></div></div>
            <div style={{flex:1,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"16px 20px"}}><div style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:12}}>平台得分</div>{PLATFORM_NAMES.map(p=>{const ps=stats.bp[p];return<div key={p} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600,color:PLATFORMS_CONFIG[p].color}}>{PLATFORMS_CONFIG[p].icon}{p}</span><span style={{fontSize:16,fontWeight:800,color:PLATFORMS_CONFIG[p].color,fontFamily:"'JetBrains Mono',monospace"}}>{ps.score}</span></div><div style={{display:"flex",gap:1,height:6,borderRadius:3,overflow:"hidden",background:"rgba(255,255,255,0.04)"}}>{["首推","被提及","被引用","未出现"].map(s=>{const t=Object.values(ps.counts).reduce((a,b)=>a+b,0);const pct=t>0?(ps.counts[s]/t*100):0;return pct>0?<div key={s} style={{width:`${pct}%`,background:ST[s].color}}/>:null;})}</div></div>;})}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"16px 20px",marginBottom:22}}><div style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:12}}>状态矩阵</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 2px"}}><thead><tr><th style={{textAlign:"left",padding:"5px 8px",color:"#555",fontSize:10}}>问题</th>{PLATFORM_NAMES.map(p=><th key={p} style={{textAlign:"center",padding:"5px",color:PLATFORMS_CONFIG[p].color,fontSize:10,width:90}}>{p}</th>)}</tr></thead><tbody>{Object.entries(stats.mx).map(([q,d])=><tr key={q}><td style={{padding:"7px 8px",fontSize:11,color:"#777",background:"rgba(255,255,255,0.015)",borderRadius:"4px 0 0 4px",maxWidth:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q}</td>{PLATFORM_NAMES.map((p,pi)=><td key={p} style={{textAlign:"center",padding:"6px 4px",background:"rgba(255,255,255,0.015)",borderRadius:pi===2?"0 4px 4px 0":0}}><Badge status={d[p]}/></td>)}</tr>)}</tbody></table></div></div>
          {stats.cr.length>0&&<div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"16px 20px",marginBottom:22}}><div style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:12}}>竞对排行</div><div style={{height:Math.max(140,stats.cr.length*30)}}><ResponsiveContainer><BarChart data={stats.cr} layout="vertical" margin={{left:90,right:20}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/><XAxis type="number" tick={{fill:"#555",fontSize:10}} axisLine={{stroke:"rgba(255,255,255,0.05)"}}/><YAxis type="category" dataKey="name" tick={{fill:"#999",fontSize:10}} axisLine={false} tickLine={false} width={85}/><Tooltip contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#ddd",fontSize:11}}/><Bar dataKey="count" radius={[0,5,5,0]} barSize={18}>{stats.cr.map((_,i)=><Cell key={i} fill={["#ef4444","#f59e0b","#4f8ef7","#a855f7","#00d4aa"][i%5]}/>)}</Bar></BarChart></ResponsiveContainer></div></div>}
          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"16px 20px"}}><div style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:12}}>趋势</div><div style={{height:180}}><ResponsiveContainer><LineChart data={history} margin={{left:0,right:16,top:8,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/><XAxis dataKey="week" tick={{fill:"#555",fontSize:10}} axisLine={{stroke:"rgba(255,255,255,0.05)"}}/><YAxis tick={{fill:"#555",fontSize:10}} axisLine={{stroke:"rgba(255,255,255,0.05)"}} domain={[0,100]}/><Tooltip contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#ddd",fontSize:11}}/><Line type="monotone" dataKey="score" stroke="#00d4aa" strokeWidth={2} dot={{fill:"#00d4aa",r:3}} name="能见度"/></LineChart></ResponsiveContainer></div></div>
        </>}
      </div>}

    </div>
  </div>);
}
