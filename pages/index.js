import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Search, Radar, LayoutDashboard, Plus, Zap, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Star, Eye, EyeOff, Quote, ArrowRight, X, Settings, RefreshCw, Trash2, ExternalLink, Target, BarChart3, Sparkles, FileText, Copy, Check, BookOpen, Send, PenTool, Wifi, WifiOff, Lock, KeyRound, User, Phone, MessageCircle, MapPin, Image, Archive, Clock, ChevronRight, Database, RotateCw, ClipboardList, LogOut, Home as HomeIcon, Lightbulb, Building2, Globe } from "lucide-react";
import { supabase } from "../lib/supabase";

// ======== CONFIG ========
const PF={DeepSeek:{color:"#007AFF",icon:"🔍",api:"/api/deepseek"},"豆包":{color:"#FF6B2C",icon:"🫘",api:"/api/doubao"},Kimi:{color:"#AF52DE",icon:"🌙",api:"/api/moonshot"}};
const PN=Object.keys(PF);
const ST={"首推":{color:"#38A169",bg:"#F0FFF4",icon:Star,score:100},"被提及":{color:"#3182CE",bg:"#EBF8FF",icon:Eye,score:60},"被引用":{color:"#DD6B20",bg:"#FFFAF0",icon:Quote,score:30},"未出现":{color:"#A0AEC0",bg:"#F7FAFC",icon:EyeOff,score:0}};
const STAGES=[{key:"TOFU认知层-痛点驱动",color:"#007AFF",emoji:"😣",desc:"遇到问题怎么办"},{key:"TOFU认知层-需求评估",color:"#5856D6",emoji:"🤔",desc:"要不要做"},{key:"MOFU考虑层-选型对比",color:"#34C759",emoji:"🛒",desc:"找谁做、多少钱"},{key:"MOFU考虑层-避坑决策",color:"#FF9500",emoji:"⚠️",desc:"怎么不被坑"},{key:"BOFU决策层-品牌验证",color:"#FF3B30",emoji:"🔍",desc:"这家公司靠谱吗"},{key:"BOFU决策层-效果诊断",color:"#AF52DE",emoji:"😰",desc:"做了没效果怎么办"}];
const CG=[{group:"通用高权重",color:"#38A169",ch:[{n:"知乎专栏",i:"📝",u:"https://zhuanlan.zhihu.com/write",d:"AI引用率最高",p:"核心"},{n:"知乎回答",i:"💬",u:"https://www.zhihu.com",d:"场景问答首选",p:"核心"},{n:"CSDN",i:"🖥",u:"https://editor.csdn.net/md",d:"技术内容权重极高",p:"核心"}]},{group:"字节生态",color:"#FF6B2C",ch:[{n:"头条号",i:"📱",u:"https://mp.toutiao.com/profile_v4/graphic/publish",d:"豆包核心源",p:"核心"},{n:"抖音",i:"🎵",u:"https://creator.douyin.com",d:"豆包抓取",p:"核心"}]},{group:"百度生态",color:"#3182CE",ch:[{n:"百家号",i:"📰",u:"https://baijiahao.baidu.com/builder/rc/edit",d:"文心一言核心",p:"核心"},{n:"百度百科",i:"📚",u:"https://baike.baidu.com",d:"最高权威",p:"核心"}]},{group:"腾讯生态",color:"#5856D6",ch:[{n:"微信公众号",i:"💚",u:"https://mp.weixin.qq.com",d:"元宝核心源",p:"核心"},{n:"腾讯新闻",i:"📺",u:"https://om.qq.com/article/articleIndex",d:"元宝引用",p:"重要"}]},{group:"新闻媒体",color:"#E53E3E",ch:[{n:"搜狐号",i:"🔶",u:"https://mp.sohu.com/mpfe/v3/main/new-batch/article",d:"高权重门户",p:"核心"},{n:"网易号",i:"📡",u:"https://mp.163.com",d:"覆盖面广",p:"重要"}]},{group:"垂直&种草",color:"#805AD5",ch:[{n:"简书",i:"📖",u:"https://www.jianshu.com/writer",d:"长文友好",p:"重要"},{n:"小红书",i:"📕",u:"https://creator.xiaohongshu.com",d:"口碑建设",p:"重要"},{n:"微博",i:"🔵",u:"https://weibo.com",d:"社交声量",p:"补充"}]}];
const ATY=[{key:"guide",label:"行业深度指南",desc:"3000-5000字",icon:BookOpen},{key:"qa",label:"场景化问答",desc:"800-1500字",icon:Search},{key:"case",label:"案例深度复盘",desc:"1500-2500字",icon:Target},{key:"compare",label:"选型对比评测",desc:"2000-3000字",icon:BarChart3}];
const KB_CATS=["公司介绍","客户案例","服务说明","行业数据","其他"];

// ======== HELPERS ========
function analyzeR(t,b,cs){const bl=b.toLowerCase(),has=t.toLowerCase().includes(bl),ls=t.split('\n').filter(l=>/^[\d•\-\*]/.test(l.trim()));let pos=null,f=false;if(ls.length>0)for(let i=0;i<ls.length;i++)if(ls[i].toLowerCase().includes(bl)){pos=i+1;if(i===0)f=true;break;}let s="未出现";if(f)s="首推";else if(has&&pos)s="被提及";else if(has)s="被引用";return{myBrandStatus:s,competitors:cs.filter(c=>t.includes(c)).map((n,i)=>({name:n,position:i+1}))};}
function mockR(q,p,c,b,cs){const w={"TOFU-痛点驱动":[3,8,25,64],"TOFU-需求评估":[5,10,20,65],"MOFU-选型对比":[18,22,15,45],"MOFU-避坑决策":[8,15,22,55],"BOFU-品牌验证":[12,18,20,50],"BOFU-效果诊断":[6,10,22,62]}[c]||[10,15,20,55];const r=Math.random()*100;const s=r<w[0]?"首推":r<w[0]+w[1]?"被提及":r<w[0]+w[1]+w[2]?"被引用":"未出现";const mc=[...cs].sort(()=>Math.random()-.5).slice(0,Math.floor(Math.random()*3)+1).map((n,i)=>({name:n,position:i+1}));return{question:q,platform:p,category:c,status:s,competitors:mc,rawResponse:`[模拟] ${p}对"${q}"的回答。`,isReal:false};}

// ======== UI ========
function Badge({status}){const s=ST[status]||ST["未出现"];const I=s.icon;return<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:s.bg,color:s.color,fontSize:12,fontWeight:600}}><I size={12}/>{status}</span>;}
function StatCard({label,value,sub,color,icon:Icon}){return<div style={{background:"#fff",borderRadius:16,padding:"24px",flex:1,minWidth:150,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>{Icon&&<div style={{width:40,height:40,borderRadius:12,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}><Icon size={20} color={color}/></div>}<div style={{fontSize:14,color:"#718096",marginBottom:8}}>{label}</div><div style={{fontSize:34,fontWeight:700,color:color||"#1A202C",letterSpacing:-1.5,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:13,color:"#A0AEC0",marginTop:8}}>{sub}</div>}</div>;}
const Btn=({children,primary,danger,small,disabled,onClick,style:s})=><button onClick={onClick} disabled={disabled} style={{padding:small?"7px 14px":primary?"12px 24px":"9px 18px",borderRadius:small?10:12,border:"none",fontSize:small?13:primary?15:14,fontWeight:600,background:disabled?"#EDF2F7":danger?"#FED7D7":primary?"#007AFF":"#EDF2F7",color:disabled?"#A0AEC0":danger?"#E53E3E":primary?"#fff":"#4A5568",cursor:disabled?"default":"pointer",display:"inline-flex",alignItems:"center",gap:6,...s}}>{children}</button>;
const Card=({children,style:s})=><div style={{background:"#fff",borderRadius:16,padding:"24px 28px",marginBottom:20,boxShadow:"0 1px 3px rgba(0,0,0,0.04)",...s}}>{children}</div>;
const Lbl=({children})=><div style={{fontSize:18,fontWeight:600,marginBottom:14,color:"#1A202C"}}>{children}</div>;
const Inp=({...p})=><input {...p} style={{width:"100%",background:"#F7FAFC",border:"1px solid #E2E8F0",borderRadius:12,padding:"13px 18px",color:"#1A202C",fontSize:16,outline:"none",marginBottom:12,...(p.style||{})}}/>;
const TArea=({...p})=><textarea {...p} style={{width:"100%",background:"#F7FAFC",border:"1px solid #E2E8F0",borderRadius:12,padding:"13px 18px",color:"#1A202C",fontSize:15,outline:"none",resize:"vertical",minHeight:100,lineHeight:1.6,...(p.style||{})}}/>;
const renderMd=md=>{if(!md)return null;return md.split("\n").map((l,i)=>{if(l.startsWith("# "))return<h1 key={i} style={{fontSize:24,fontWeight:700,color:"#1A202C",margin:"24px 0 12px"}}>{l.slice(2)}</h1>;if(l.startsWith("## "))return<h2 key={i} style={{fontSize:20,fontWeight:600,color:"#2D3748",margin:"20px 0 10px"}}>{l.slice(3)}</h2>;if(l.startsWith("### "))return<h3 key={i} style={{fontSize:17,fontWeight:600,color:"#4A5568",margin:"16px 0 8px"}}>{l.slice(4)}</h3>;if(l.startsWith("> "))return<blockquote key={i} style={{borderLeft:"3px solid #3182CE",paddingLeft:16,margin:"12px 0",color:"#718096",fontSize:15}}>{l.slice(2)}</blockquote>;if(l.startsWith("- ")||l.startsWith("* "))return<div key={i} style={{paddingLeft:16,margin:"4px 0",fontSize:15,color:"#4A5568",lineHeight:1.7}}>• {l.slice(2)}</div>;if(l==="---")return<hr key={i} style={{border:"none",borderTop:"1px solid #E2E8F0",margin:"16px 0"}}/>;if(!l.trim())return<div key={i} style={{height:6}}/>;return<p key={i} style={{fontSize:15,color:"#4A5568",lineHeight:1.8,margin:"5px 0"}}>{l}</p>;});};

// ======== MAIN ========
export default function GeoApp({ session }) {
  const userId=session?.user?.id;
  const userEmail=session?.user?.email;
  const userName=session?.user?.user_metadata?.name||userEmail?.split("@")[0];

  const[tab,setTab]=useState("home");
  const[project,setProject]=useState(null);
  const[loading,setLoading]=useState(true);
  const[api,setApi]=useState({deepseek:false,doubao:false,moonshot:false});
  const[brand,setBrand]=useState("");const[brandIn,setBrandIn]=useState("");
  const[comps,setComps]=useState([]);const[compIn,setCompIn]=useState("");
  const[contactInfo,setContactInfo]=useState({wechat:"",phone:"",address:"",website:"",slogan:""});
  // Keywords
  const[kw,setKw]=useState("");const[qs,setQs]=useState([]);const[isGen,setIsGen]=useState(false);const[sel,setSel]=useState(new Set());
  // Monitor
  const[mon,setMon]=useState([]);const[res,setRes]=useState([]);const[isCol,setIsCol]=useState(false);const[prog,setProg]=useState(0);const[expQ,setExpQ]=useState(null);const[expR,setExpR]=useState(null);const[monSel,setMonSel]=useState(new Set());
  // Content
  const[cQ,setCQ]=useState(null);const[aType,setAType]=useState("guide");const[article,setArticle]=useState("");const[isGenA,setIsGenA]=useState(false);const[copied,setCopied]=useState(false);
  // Company KB
  const[kb,setKb]=useState([]);const[kbTitle,setKbTitle]=useState("");const[kbContent,setKbContent]=useState("");const[kbCat,setKbCat]=useState("客户案例");const[kbFilter,setKbFilter]=useState("all");const[kbEdit,setKbEdit]=useState(null);
  // WX - search
  const[wxTab,setWxTab]=useState("search");
  const[wxKw,setWxKw]=useState("");const[wxResults,setWxResults]=useState([]);const[wxLoading,setWxLoading]=useState(false);const[wxPage,setWxPage]=useState(1);const[wxTotal,setWxTotal]=useState(0);const[wxPeriod,setWxPeriod]=useState(30);
  // WX - history (公众号订阅)
  const[wxName,setWxName]=useState("");const[wxHist,setWxHist]=useState([]);const[wxHLoading,setWxHLoading]=useState(false);const[wxHPage,setWxHPage]=useState(1);const[wxHTotalPage,setWxHTotalPage]=useState(0);const[wxMpInfo,setWxMpInfo]=useState(null);
  // WX - search history & detail
  const[searchHistory,setSearchHistory]=useState([]);
  const[wxDetail,setWxDetail]=useState(null);
  const[wxSaved,setWxSaved]=useState(new Set());
  // Articles
  const[articles,setArticles]=useState([]);const[viewArticle,setViewArticle]=useState(null);
  const[isRecreating,setIsRecreating]=useState(null);
  const[chFilter,setChFilter]=useState("all");
  // Dashboard
  const[batches,setBatches]=useState([]);const[aiSuggestions,setAiSuggestions]=useState("");

  const am={DeepSeek:'deepseek','豆包':'doubao',Kimi:'moonshot'};

  // ======== INIT ========
  useEffect(()=>{
    if(!userId)return;
    (async()=>{
      fetch('/api/status').then(r=>r.json()).then(setApi).catch(()=>{});
      let{data:proj}=await supabase.from('projects').select('*').eq('user_id',userId).limit(1).single();
      if(!proj){const{data:np}=await supabase.from('projects').insert({user_id:userId,name:'我的GEO项目',brand:'',competitors:[],contact_info:{}}).select().single();proj=np;}
      if(proj){
        setProject(proj);setBrand(proj.brand||"");setBrandIn(proj.brand||"");setComps(proj.competitors||[]);setContactInfo(p=>({...p,...(proj.contact_info||{})}));
        const{data:kws}=await supabase.from('keywords').select('*').eq('project_id',proj.id).order('created_at',{ascending:false});
        if(kws)setMon(kws.map(k=>({id:k.id,question:k.question,category:k.category})));
        const{data:kbD}=await supabase.from('knowledge_base').select('*').eq('project_id',proj.id).order('created_at',{ascending:false});
        if(kbD)setKb(kbD);
        const{data:arts}=await supabase.from('articles').select('*').eq('project_id',proj.id).order('created_at',{ascending:false});
        if(arts)setArticles(arts);
        const{data:bs}=await supabase.from('collection_batches').select('*').eq('project_id',proj.id).order('completed_at',{ascending:false}).limit(10);
        if(bs)setBatches(bs);
        // Load search history
        const{data:sh}=await supabase.from('wx_search_history').select('*').eq('project_id',proj.id).order('searched_at',{ascending:false}).limit(20);
        if(sh)setSearchHistory(sh);
      }
      setLoading(false);
    })();
  },[userId]);

  const contactLines=[contactInfo.slogan,contactInfo.phone?`📞 电话：${contactInfo.phone}`:"",contactInfo.wechat?`💬 微信：${contactInfo.wechat}`:"",contactInfo.website?`🌐 官网：${contactInfo.website}`:"",contactInfo.address?`📍 地址：${contactInfo.address}`:""].filter(Boolean);
  const contactText=contactLines.join("\n");const hasContact=contactLines.length>0;

  const kbContext=useMemo(()=>{if(!kb.length)return"";return"\n\n## 公司知识库素材\n\n"+kb.slice(0,5).map(k=>`【${k.category}】${k.title}：${(k.content||"").slice(0,300)}`).join("\n\n");},[kb]);

  // ======== SAVE HELPERS ========
  const saveProject=useCallback(async u=>{if(project)await supabase.from('projects').update(u).eq('id',project.id);},[project]);
  const saveBrand=useCallback(async()=>{if(!brandIn.trim())return;setBrand(brandIn.trim());await saveProject({brand:brandIn.trim()});},[brandIn,saveProject]);
  const saveComps=useCallback(async c=>{setComps(c);await saveProject({competitors:c});},[saveProject]);
  const saveContact=useCallback(async i=>{setContactInfo(i);await saveProject({contact_info:i});},[saveProject]);
  const copyA=useCallback(async()=>{try{await navigator.clipboard.writeText(article)}catch(e){}setCopied(true);setTimeout(()=>setCopied(false),2500);},[article]);
  const copyText=async t=>{try{await navigator.clipboard.writeText(t)}catch(e){}};

  // ======== KEYWORDS ========
  const genKw=useCallback(async()=>{if(!kw.trim())return;setIsGen(true);setQs([]);setSel(new Set());
    const prompt=`你是GEO高级策略顾问，精通LLM查询扇出机制。当用户在AI平台提问时，LLM会将问题分解为6-20个子查询并行检索，所以你生成的问题必须覆盖完整的子查询空间。

输入关键词：${kw.trim()}${brand?`\n品牌：${brand}`:""}${comps.length?`\n竞对：${comps.join("、")}`:""}

生成6组问题，每组4个，按客户决策旅程排列。每个问题必须是15-25字的完整自然语言句子，像真人在手机上打字问AI的语气。至少一半要带地域信息。

【TOFU认知层-痛点驱动】客户还不知道需要这个服务，在描述自己遇到的问题。句式：我遇到了XX问题怎么办、XX行业怎么做XX。必须包含具体行业名称和具体痛点描述。
【TOFU认知层-需求评估】客户在犹豫要不要做。句式：有没有必要、值不值得、什么情况下该做。必须带客户自身条件（规模、预算、行业）。
【MOFU考虑层-选型对比】客户决定做了，在挑选。句式：哪家好、怎么选、多少钱、什么价位、和XX比。必须有价格或选择标准相关信息。
【MOFU考虑层-避坑决策】客户担心被坑。句式：容易踩什么坑、怎么判断靠不靠谱、合同注意什么。带具体的担忧场景。
【BOFU决策层-品牌验证】客户在做最终确认。句式：XX公司怎么样、有人合作过吗、效果好不好。可以带竞对品牌名。
【BOFU决策层-效果诊断】客户已经在做了但不满意。句式：做了没效果、播放量上不去、感觉被骗了。带具体的数据描述。

质量要求：口语化像真人打字、每个问题切入不同需求角度、24个问题之间零意思重复、查询变体在句式结构和约束条件上有实质差异。禁止关键词堆砌。
JSON返回：[{"stage":"TOFU认知层-痛点驱动","question":"..."}]`;
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:3000})});const d=await r.json();if(d.text)setQs(JSON.parse(d.text.replace(/```json|```/g,"").trim()));else throw 0;}catch(e){
      const t={"TOFU认知层-痛点驱动":["在济南开了餐饮店抖音发了半年没客人","教培机构抖音管得严还有什么获客办法","同行都做短视频我不做是不是被淘汰","工厂想短视频找客户不知从哪下手"],"TOFU认知层-需求评估":["月营业额十几万有必要花钱做短视频吗","不会拍剪是不是只能找代运营","短视频运营能带来多少客户","预算每月三五千做短视频够吗"],"MOFU考虑层-选型对比":["济南短视频代运营怎么选预算五千","自己招人和找代运营哪个划算","代运营一个月多少钱济南行情","大公司和小工作室有什么区别"],"MOFU考虑层-避坑决策":["找短视频代运营最容易踩什么坑","承诺保证播放量能信吗","签合同要注意哪些条款","怎么判断一家公司靠不靠谱"],"BOFU决策层-品牌验证":[`${brand||"某公司"}做短视频效果怎么样`,"济南做餐饮短视频做得好的公司","想找本地代运营谁家口碑好","A公司和B公司哪个好"],"BOFU决策层-效果诊断":["找了代运营三个月花两万播放量几十个","涨了一万粉但没客户什么情况","做了半年没线索是谁的问题","感觉被忽悠了想换怕又踩坑"]};
      setQs(Object.entries(t).flatMap(([s,a])=>a.map(q=>({stage:s,question:q}))));
    }setIsGen(false);},[kw,brand,comps]);
  const toggleQ=i=>setSel(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});
  const addMon=useCallback(async()=>{const nq=[...sel].map(i=>({question:qs[i].question,category:qs[i].stage})).filter(q=>!mon.some(m=>m.question===q.question));if(!nq.length||!project)return;const{data}=await supabase.from('keywords').insert(nq.map(q=>({project_id:project.id,question:q.question,category:q.category}))).select();if(data)setMon(p=>[...p,...data.map(k=>({id:k.id,question:k.question,category:k.category}))]);setSel(new Set());setTab("monitor");},[sel,qs,mon,project]);

  // ======== COLLECT ========
  const collect=useCallback(async()=>{if(!brand||!mon.length||!project)return;setIsCol(true);setProg(0);const t=mon.length*PN.length,nr=[];for(let i=0;i<mon.length;i++){for(let j=0;j<PN.length;j++){const p=PN[j],k=am[p];let result;if(api[k]){try{const r=await fetch(PF[p].api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:mon[i].question}],max_tokens:2000})});const d=await r.json();if(d.text){const a=analyzeR(d.text,brand,comps);result={...a,question:mon[i].question,platform:p,category:mon[i].category,rawResponse:d.text,isReal:true};}else throw 0;}catch(e){result=mockR(mon[i].question,p,mon[i].category,brand,comps);}}else{await new Promise(r=>setTimeout(r,60+Math.random()*100));result=mockR(mon[i].question,p,mon[i].category,brand,comps);}nr.push(result);setProg(Math.round(((i*PN.length+j+1)/t)*100));}}setRes(nr);
    const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};nr.forEach(r=>counts[r.myBrandStatus||r.status]++);const score=Math.round(nr.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/nr.length);const mr=Math.round(((nr.length-counts["未出现"])/nr.length)*100);const pS={};PN.forEach(p=>{const pr=nr.filter(r=>r.platform===p);pS[p]=pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/pr.length):0;});
    const{data:batch}=await supabase.from('collection_batches').insert({project_id:project.id,total_queries:nr.length,score,mention_rate:mr,status_counts:counts,platform_scores:pS}).select().single();
    if(batch){setBatches(p=>[batch,...p]);await supabase.from('collections').insert(nr.map(r=>({project_id:project.id,batch_id:batch.id,keyword_id:mon.find(m=>m.question===r.question)?.id,platform:r.platform,status:r.myBrandStatus||r.status,raw_response:r.rawResponse,competitors:r.competitors||[],is_real:r.isReal})));genSugg(nr,score,mr,counts,pS);}setIsCol(false);},[mon,brand,comps,api,project]);

  // ======== AI SUGGESTIONS ========
  const genSugg=useCallback(async(results,score,mr,counts,pS)=>{const sum=`品牌：${brand}\n评分：${score}/100\n提及率：${mr}%\n首推${counts["首推"]}，提及${counts["被提及"]}，引用${counts["被引用"]}，未现${counts["未出现"]}\n平台：${PN.map(p=>`${p}=${pS[p]}`).join("、")}\n未覆盖：${results.filter(r=>(r.myBrandStatus||r.status)==="未出现").map(r=>r.question).slice(0,5).join("；")}`;try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`你是GEO优化顾问。给出3-5条建议，含优先级（🔴紧急/🟠重要/🟡一般）、问题、行动、预期效果。\n\n${sum}`}],max_tokens:1500})});const d=await r.json();if(d.text){setAiSuggestions(d.text);if(batches[0])await supabase.from('collection_batches').update({ai_suggestions:d.text}).eq('id',batches[0]?.id||'');}}catch(e){}},[brand,batches]);

  // ======== CONTENT ========
  const genArticle=useCallback(async()=>{if(!cQ)return;setIsGenA(true);setArticle("");setCopied(false);const tp={guide:"写一篇3000字以上行业深度指南。",qa:"写一篇800-1500字精准问答。",case:"写一篇1500-2500字案例复盘。",compare:"写一篇2000-3000字选型对比评测。"};const cp=hasContact?`\n\n文章最后必须添加引流段落，先写过渡语，然后逐行列出：\n---\n${contactLines.join("\n")}\n---`:"";try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`你是GEO内容专家。目标：${cQ.question}\n品牌：${brand||"未设置"}\n竞对：${comps.join("、")||"未设置"}\n类型：${ATY.find(t=>t.key===aType)?.label}${kbContext}\n\n${tp[aType]}每个H2前50-80字独立完整，每段≥1数据点。${cp}\n\nMarkdown输出。`}],max_tokens:4000})});const d=await r.json();if(d.text)setArticle(d.text);else throw 0;}catch(e){setArticle(`# ${cQ.question}\n\n> API未连接。`);}setIsGenA(false);},[cQ,aType,brand,comps,kbContext,hasContact,contactLines]);

  const saveToQueue=useCallback(async(content,question,type,source)=>{if(!project||!content)return;const{data}=await supabase.from('articles').insert({project_id:project.id,question:question||cQ?.question||"",article_type:type||aType,content,word_count:content.length,source:source||"内容生成",status:"待发布"}).select().single();if(data)setArticles(p=>[data,...p]);},[project,cQ,aType]);

  // ======== 二创（共用逻辑）========
  const recreate=useCallback(async(srcContent,srcQuestion,srcLabel)=>{setIsRecreating(srcQuestion);const cp=hasContact?`\n\n文章最后添加引流段落：\n---\n${contactLines.join("\n")}\n---`:"";try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`基于以下内容二创。原始问题/标题：${srcQuestion}\n原始内容：${(srcContent||"").slice(0,3000)}\n品牌：${brand||"未设置"}${kbContext}\n\n用全新表述重写1500-2500字，融入品牌案例，每段含数据点，H2前50-80字独立完整。${cp}\n\nMarkdown输出。`}],max_tokens:4000})});const d=await r.json();if(d.text)await saveToQueue(d.text,srcQuestion,"recreate",srcLabel||"二创");}catch(e){}setIsRecreating(null);setTab("queue");},[brand,kbContext,hasContact,contactLines,saveToQueue]);

  // ======== WX SEARCH (公众号采集) ========
  const wxSearch=useCallback(async(page=1)=>{if(!wxKw.trim()||!project)return;setWxLoading(true);if(page===1)setWxResults([]);
    try{const r=await fetch('/api/wxsearch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kw:wxKw.trim(),page,period:wxPeriod})});const d=await r.json();
      if(d.code===0&&d.data){
        const items=page===1?d.data:[...wxResults,...d.data];setWxResults(items);setWxTotal(d.total||0);setWxPage(page);
        // Auto save search history
        if(page===1){const{data:sh}=await supabase.from('wx_search_history').insert({project_id:project.id,keyword:wxKw.trim(),result_count:d.total||d.data.length,search_type:'kw_search'}).select().single();
          if(sh)setSearchHistory(p=>[sh,...p.filter(h=>h.keyword!==wxKw.trim())].slice(0,20));
          // Auto save articles to DB
          const inserts=d.data.map(a=>({project_id:project.id,search_id:sh?.id,title:a.title,content:a.content||"",digest:a.title?.slice(0,200),wx_name:a.wx_name,wx_id:a.wx_id,url:a.url,short_link:a.short_link,cover_url:a.avatar,read_count:a.read||0,praise_count:a.praise||0,looking_count:a.looking||0,publish_time_str:a.publish_time_str,is_original:a.is_original||0,classify:a.classify}));
          await supabase.from('wx_articles').insert(inserts);
        }
      }
    }catch(e){}setWxLoading(false);},[wxKw,wxPeriod,project,wxResults]);

  // Load from search history
  const loadHistory=useCallback(async(h)=>{setWxKw(h.keyword);setWxTab("search");
    const{data}=await supabase.from('wx_articles').select('*').eq('search_id',h.id).order('read_count',{ascending:false});
    if(data&&data.length)setWxResults(data.map(a=>({title:a.title,content:a.content,wx_name:a.wx_name,url:a.url,avatar:a.cover_url,read:a.read_count,praise:a.praise_count,looking:a.looking_count,publish_time_str:a.publish_time_str,is_original:a.is_original,classify:a.classify,short_link:a.short_link,wx_id:a.wx_id,_fromDb:true})));
    else{setWxKw(h.keyword);wxSearch(1);}
  },[wxSearch]);

  // WX History (公众号订阅)
  const wxHistSearch=useCallback(async(page=1)=>{if(!wxName.trim())return;setWxHLoading(true);if(page===1){setWxHist([]);setWxMpInfo(null);}
    try{const r=await fetch('/api/wxhistory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:wxName.trim(),page})});const d=await r.json();if(d.code===0&&d.data){if(page===1)setWxHist(d.data);else setWxHist(p=>[...p,...d.data]);setWxHTotalPage(d.total_page||0);setWxHPage(page);if(d.mp_nickname)setWxMpInfo({name:d.mp_nickname,avatar:d.head_img,total:d.total_num});}}catch(e){}setWxHLoading(false);},[wxName]);

  // Save WX article to company KB
  const wxSaveToKb=useCallback(async item=>{if(!project)return;const content=item.content?item.content.replace(/<[^>]+>/g,'').slice(0,5000):item.title;const{data}=await supabase.from('knowledge_base').insert({project_id:project.id,title:item.title,content,category:"公众号素材",source:item.wx_name,source_url:item.url,metadata:{read:item.read,praise:item.praise}}).select().single();if(data)setKb(p=>[data,...p]);setWxSaved(p=>new Set([...p,item.url]));},[project]);

  // Company KB
  const addKbItem=useCallback(async()=>{if(!kbTitle.trim()||!kbContent.trim()||!project)return;if(kbEdit){await supabase.from('knowledge_base').update({title:kbTitle,content:kbContent,category:kbCat}).eq('id',kbEdit);setKb(p=>p.map(k=>k.id===kbEdit?{...k,title:kbTitle,content:kbContent,category:kbCat}:k));setKbEdit(null);}else{const{data}=await supabase.from('knowledge_base').insert({project_id:project.id,title:kbTitle.trim(),content:kbContent.trim(),category:kbCat}).select().single();if(data)setKb(p=>[data,...p]);}setKbTitle("");setKbContent("");},[kbTitle,kbContent,kbCat,kbEdit,project]);
  const delKbItem=async id=>{await supabase.from('knowledge_base').delete().eq('id',id);setKb(p=>p.filter(k=>k.id!==id));};

  // Stats
  const stats=useMemo(()=>{if(!res.length)return null;const score=Math.round(res.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/res.length);const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};res.forEach(r=>counts[r.myBrandStatus||r.status]++);const mr=Math.round(((res.length-counts["未出现"])/res.length)*100);const bp={};PN.forEach(p=>{const pr=res.filter(r=>r.platform===p);bp[p]={score:pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/pr.length):0,counts:{"首推":0,"被提及":0,"被引用":0,"未出现":0}};pr.forEach(r=>bp[p].counts[r.myBrandStatus||r.status]++);});const mx={};mon.forEach(m=>{mx[m.question]={};PN.forEach(p=>mx[m.question][p]="未出现");});res.forEach(r=>{if(mx[r.question])mx[r.question][r.platform]=r.myBrandStatus||r.status;});return{score,counts,mr,bp,mx};},[res,mon]);
  const pie=stats?Object.entries(stats.counts).filter(([_,v])=>v>0).map(([n,v])=>({name:n,value:v})):[];
  const filteredKb=kbFilter==="all"?kb.filter(k=>k.category!=="公众号素材"):kb.filter(k=>k.category===kbFilter);
  const filteredGroups=chFilter==="all"?CG:chFilter==="核心"?CG.map(g=>({...g,ch:g.ch.filter(c=>c.p==="核心")})).filter(g=>g.ch.length>0):CG.filter(g=>g.group.includes(chFilter));
  const queueCount=articles.filter(a=>a.status==="待发布").length;
  const logout=async()=>{await supabase.auth.signOut();};

  // ======== NAV ========
  const navSections=[
    {label:"",items:[{id:"home",label:"首页",icon:HomeIcon},{id:"keywords",label:"关键词",icon:Search},{id:"monitor",label:"采集",icon:Radar,badge:mon.length}]},
    {label:"素材",items:[{id:"wxcollect",label:"公众号采集",icon:Globe,badge:searchHistory.length},{id:"companyKb",label:"公司知识库",icon:Building2,badge:kb.filter(k=>k.category!=="公众号素材").length}]},
    {label:"内容",items:[{id:"content",label:"内容生成",icon:PenTool},{id:"queue",label:"待发布",icon:ClipboardList,badge:queueCount},{id:"publish",label:"渠道发布",icon:Send}]},
    {label:"",items:[{id:"dashboard",label:"效果看板",icon:BarChart3}]},
  ];

  if(loading)return<div style={{height:"100vh",background:"#F0F4F8",display:"flex",alignItems:"center",justifyContent:"center"}}><Loader2 size={32} className="spin" color="#007AFF"/></div>;

  return(<div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#F0F4F8"}}>
    {/* SIDEBAR */}
    <div style={{width:210,background:"#fff",borderRight:"1px solid #E2E8F0",padding:"20px 10px",display:"flex",flexDirection:"column",gap:1,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"0 12px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#007AFF,#5856D6)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:"#fff",fontWeight:800}}>G</span></div><span style={{fontSize:16,fontWeight:700,color:"#1A202C"}}>GEO Monitor</span></div>
      {navSections.map((sec,si)=><div key={si}>{sec.label&&<div style={{fontSize:10,color:"#A0AEC0",textTransform:"uppercase",letterSpacing:0.5,padding:"8px 14px 4px",fontWeight:600}}>{sec.label}</div>}{sec.items.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 14px",borderRadius:9,width:"100%",border:"none",background:tab===t.id?"#EBF4FF":"transparent",color:tab===t.id?"#007AFF":"#718096",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:500}}><t.icon size={16}/><span>{t.label}</span>{t.badge>0&&<span style={{marginLeft:"auto",background:tab===t.id?"#007AFF":"#E2E8F0",color:tab===t.id?"#fff":"#718096",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8}}>{t.badge}</span>}</button>)}{si<navSections.length-1&&<div style={{height:1,background:"#EDF2F7",margin:"6px 8px"}}/>}</div>)}
      <div style={{height:1,background:"#EDF2F7",margin:"6px 8px"}}/>
      <button onClick={()=>setTab("settings")} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 14px",borderRadius:9,width:"100%",border:"none",background:tab==="settings"?"#EBF4FF":"transparent",color:tab==="settings"?"#007AFF":"#718096",cursor:"pointer",fontSize:13}}><Settings size={16}/>设置</button>
      <div style={{flex:1}}/>
      <div style={{padding:"10px",background:"#F7FAFC",borderRadius:10,margin:"0 4px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:28,height:28,borderRadius:8,background:"#EBF4FF",display:"flex",alignItems:"center",justifyContent:"center"}}><User size={14} color="#007AFF"/></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#2D3748",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</div></div><button onClick={logout} style={{background:"none",border:"none",color:"#A0AEC0",cursor:"pointer",padding:2}}><LogOut size={14}/></button></div></div>
      <div style={{padding:"8px 12px",margin:"4px 4px 0"}}>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,marginBottom:2,color:api[am[p]]?"#38A169":"#CBD5E0"}}><span style={{width:5,height:5,borderRadius:"50%",background:api[am[p]]?"#38A169":"#CBD5E0"}}/>{p}</div>)}</div>
    </div>

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",padding:"28px 36px"}}>

    {/* HOME */}
    {tab==="home"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><div><h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:0}}>欢迎回来，{userName}</h1><p style={{fontSize:14,color:"#718096",margin:"4px 0 0"}}>{brand?`监控品牌：${brand}`:"请先设置品牌名称"}</p></div><Btn primary onClick={()=>setTab("keywords")}><Zap size={15}/>开始工作</Btn></div>
      <div style={{display:"flex",gap:12,marginBottom:20}}><StatCard label="能见度" value={batches[0]?.score||"--"} color="#007AFF" icon={BarChart3} sub={batches[0]?`${new Date(batches[0].completed_at).toLocaleDateString("zh-CN")}采集`:"暂无数据"}/><StatCard label="提及率" value={batches[0]?batches[0].mention_rate+"%":"--"} color="#38A169" icon={Eye}/><StatCard label="待发布" value={queueCount} color="#DD6B20" icon={FileText}/><StatCard label="知识库" value={kb.length} color="#805AD5" icon={Database}/></div>
      <Card><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Lightbulb size={18} color="#DD6B20"/><Lbl>AI优化建议</Lbl></div>{aiSuggestions||batches[0]?.ai_suggestions?<div style={{fontSize:14,color:"#4A5568",lineHeight:1.8}}>{renderMd(aiSuggestions||batches[0]?.ai_suggestions)}</div>:<div style={{textAlign:"center",padding:"20px 0",color:"#A0AEC0"}}><div style={{fontSize:14}}>完成第一次采集后自动生成</div><Btn primary onClick={()=>setTab("monitor")} style={{marginTop:12}}>去采集</Btn></div>}</Card>
      {batches.length>0&&<Card><Lbl>采集历史</Lbl>{batches.slice(0,5).map(b=><div key={b.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#F7FAFC",borderRadius:10,marginBottom:6}}><div style={{fontSize:26,fontWeight:700,color:b.score>=60?"#38A169":"#DD6B20",minWidth:44}}>{b.score}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#2D3748"}}>采集{b.total_queries}条 · 提及率{b.mention_rate}%</div><div style={{fontSize:12,color:"#A0AEC0"}}>{new Date(b.completed_at).toLocaleDateString("zh-CN")}</div></div></div>)}</Card>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{[{l:"生成关键词",d:"AI扩展问题",icon:Search,t:"keywords",c:"#3182CE"},{l:"采集监控",d:"检测推荐状态",icon:Radar,t:"monitor",c:"#38A169"},{l:"公众号采集",d:"采集行业好文",icon:Globe,t:"wxcollect",c:"#DD6B20"}].map(a=><div key={a.t} onClick={()=>setTab(a.t)} style={{background:"#fff",borderRadius:14,padding:"20px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}><div style={{width:40,height:40,borderRadius:10,background:a.c+"15",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><a.icon size={20} color={a.c}/></div><div style={{fontSize:15,fontWeight:600,color:"#1A202C",marginBottom:3}}>{a.l}</div><div style={{fontSize:12,color:"#A0AEC0"}}>{a.d}</div></div>)}</div>
    </div>}

    {/* KEYWORDS */}
    {tab==="keywords"&&<div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 20px"}}>关键词扩展</h1>
      <div style={{display:"flex",gap:10,marginBottom:24}}><Inp value={kw} onChange={e=>setKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genKw()} placeholder="输入关键词" style={{flex:1,marginBottom:0}}/><Btn primary onClick={genKw} disabled={isGen||!kw.trim()}>{isGen?<><Loader2 size={15} className="spin"/>生成中</>:<><Zap size={15}/>生成</>}</Btn></div>
      {qs.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:14,color:"#718096"}}>共{qs.length}个 · 已选{sel.size}个</span><div style={{display:"flex",gap:6}}><Btn onClick={()=>setSel(p=>p.size===qs.length?new Set():new Set(qs.map((_,i)=>i)))}>{sel.size===qs.length?"取消":"全选"}</Btn><Btn primary onClick={addMon} disabled={!sel.size}><Plus size={14}/>加入监控</Btn></div></div>
      {STAGES.map(stg=>{const sq=qs.map((q,i)=>({...q,idx:i})).filter(q=>q.stage===stg.key);if(!sq.length)return null;return<div key={stg.key} style={{marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:16}}>{stg.emoji}</span><span style={{fontSize:15,fontWeight:600,color:stg.color}}>{stg.key}</span><span style={{fontSize:12,color:"#A0AEC0"}}>{stg.desc}</span></div>{sq.map(q=><div key={q.idx} onClick={()=>toggleQ(q.idx)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:sel.has(q.idx)?"#EBF4FF":"#fff",border:sel.has(q.idx)?"1px solid #90CDF4":"1px solid #E2E8F0",borderRadius:10,marginBottom:4,cursor:"pointer"}}><div style={{width:18,height:18,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",background:sel.has(q.idx)?"#007AFF":"#fff",border:sel.has(q.idx)?"none":"1.5px solid #CBD5E0",flexShrink:0}}>{sel.has(q.idx)&&<Check size={12} color="#fff"/>}</div><span style={{fontSize:14,color:"#4A5568"}}>{q.question}</span></div>)}</div>})}</>}
      {!qs.length&&!isGen&&<div style={{textAlign:"center",padding:"50px 0"}}><Search size={36} color="#CBD5E0" style={{marginBottom:10}}/><div style={{fontSize:16,color:"#A0AEC0"}}>输入关键词生成问题</div></div>}
    </div>}

    {/* MONITOR */}
    {tab==="monitor"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 4px"}}>采集监控</h1><p style={{fontSize:14,color:"#718096",margin:0}}>{mon.length}问题 × {PN.length}平台{monSel.size>0&&<span style={{color:"#007AFF"}}> · 已选{monSel.size}个</span>}</p></div>
        <div style={{display:"flex",gap:6}}>
          {mon.length>0&&<Btn onClick={()=>setMonSel(p=>p.size===mon.length?new Set():new Set(mon.map((_,i)=>i)))}>{monSel.size===mon.length?"取消":"全选"}</Btn>}
          {monSel.size>0&&<Btn danger onClick={async()=>{const ids=mon.filter((_,i)=>monSel.has(i)).map(m=>m.id).filter(Boolean);if(ids.length&&project)for(const id of ids)await supabase.from('keywords').delete().eq('id',id);setMon(p=>p.filter((_,i)=>!monSel.has(i)));setRes(p=>p.filter(r=>!mon.filter((_,i)=>monSel.has(i)).some(m=>m.question===r.question)));setMonSel(new Set());}}><Trash2 size={13}/>删除({monSel.size})</Btn>}
          {mon.length>0&&monSel.size===0&&<Btn onClick={async()=>{if(project)await supabase.from('keywords').delete().eq('project_id',project.id);setMon([]);setRes([]);}}><Trash2 size={13}/>清空</Btn>}
          <Btn primary onClick={collect} disabled={isCol||!mon.length||!brand}>{isCol?<><Loader2 size={14} className="spin"/>{prog}%</>:<><RefreshCw size={14}/>采集</>}</Btn>
        </div>
      </div>
      {isCol&&<div style={{marginBottom:14}}><div style={{background:"#E2E8F0",borderRadius:5,height:4,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#007AFF,#38A169)",transition:"width 0.3s"}}/></div></div>}
      {!mon.length?<div style={{textAlign:"center",padding:"50px 0"}}><Radar size={36} color="#CBD5E0" style={{marginBottom:10}}/><div style={{fontSize:16,color:"#A0AEC0"}}>列表为空</div><Btn primary onClick={()=>setTab("keywords")} style={{marginTop:12}}>去生成</Btn></div>:
      mon.map((m,qi)=>{const qr=res.filter(r=>r.question===m.question);const isE=expQ===qi;const isSel=monSel.has(qi);return<div key={qi} style={{background:isSel?"#EBF4FF":"#fff",borderRadius:12,marginBottom:5,border:isSel?"1px solid #90CDF4":"1px solid #E2E8F0"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer"}}>
          <div onClick={e=>{e.stopPropagation();setMonSel(p=>{const n=new Set(p);n.has(qi)?n.delete(qi):n.add(qi);return n;});}} style={{width:18,height:18,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",background:isSel?"#007AFF":"#fff",border:isSel?"none":"1.5px solid #CBD5E0",flexShrink:0,cursor:"pointer"}}>{isSel&&<Check size={12} color="#fff"/>}</div>
          <span onClick={()=>setExpQ(isE?null:qi)} style={{flex:1,fontSize:13,color:"#2D3748",cursor:"pointer"}}>{m.question}</span>
          {qr.length>0&&<div style={{display:"flex",gap:3}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);return r?<Badge key={p} status={r.myBrandStatus||r.status}/>:null;})}</div>}
          <Btn small danger onClick={async e=>{e.stopPropagation();if(m.id)await supabase.from('keywords').delete().eq('id',m.id);setMon(p=>p.filter((_,i)=>i!==qi));setRes(p=>p.filter(r=>r.question!==m.question));setMonSel(p=>{const n=new Set();p.forEach(v=>{if(v<qi)n.add(v);else if(v>qi)n.add(v-1);});return n;});}}><Trash2 size={11}/></Btn>
          {isE?<ChevronUp size={15} color="#A0AEC0" onClick={()=>setExpQ(null)} style={{cursor:"pointer"}}/>:<ChevronDown size={15} color="#A0AEC0" onClick={()=>setExpQ(qi)} style={{cursor:"pointer"}}/>}
        </div>
        {isE&&qr.length>0&&<div style={{padding:"0 16px 12px",borderTop:"1px solid #EDF2F7"}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);if(!r)return null;const isD=expR===(r.question+p);return<div key={p} style={{marginTop:6,background:"#F7FAFC",borderRadius:8,overflow:"hidden"}}><div onClick={()=>setExpR(isD?null:r.question+p)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 12px",cursor:"pointer"}}><span style={{fontSize:13,fontWeight:600,color:PF[p].color}}>{PF[p].icon} {p}</span><Badge status={r.myBrandStatus||r.status}/><span style={{marginLeft:"auto"}}/><Btn small onClick={e=>{e.stopPropagation();recreate(r.rawResponse,r.question,`${r.platform}采集二创`);}} disabled={isRecreating===r.question} style={{background:"#FFFAF0",color:"#DD6B20"}}>{isRecreating===r.question?<Loader2 size={11} className="spin"/>:<><RotateCw size={11}/>二创</>}</Btn></div>{isD&&<div style={{padding:"0 12px 10px",borderTop:"1px solid #EDF2F7"}}><div style={{fontSize:12,color:"#718096",lineHeight:1.7,whiteSpace:"pre-wrap",background:"#fff",borderRadius:6,padding:"10px",marginTop:4,maxHeight:220,overflowY:"auto"}}>{r.rawResponse}</div></div>}</div>;})}</div>}
      </div>;})}
    </div>}

    {/* WX COLLECT 公众号采集 */}
    {tab==="wxcollect"&&<div>
      {wxDetail?<div>
        {/* 文章详情页 */}
        <Btn onClick={()=>setWxDetail(null)} style={{marginBottom:14}}>← 返回列表</Btn>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"20px 24px",borderBottom:"1px solid #EDF2F7"}}>
            <h2 style={{fontSize:20,fontWeight:700,color:"#1A202C",margin:"0 0 10px",lineHeight:1.4}}>{wxDetail.title}</h2>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:28,height:28,borderRadius:8,background:"#EBF4FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#007AFF",fontWeight:600}}>{(wxDetail.wx_name||"?")[0]}</div><div><div style={{fontSize:13,fontWeight:600,color:"#2D3748"}}>{wxDetail.wx_name}</div><div style={{fontSize:12,color:"#A0AEC0"}}>{wxDetail.publish_time_str} · 阅读{wxDetail.read>=10000?(wxDetail.read/10000).toFixed(1)+'w':wxDetail.read} · 点赞{wxDetail.praise}{wxDetail.is_original===1?" · 原创":""}</div></div></div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Btn small onClick={()=>copyText(wxDetail.content||wxDetail.title)}><Copy size={12}/>复制全文</Btn>
              <Btn small onClick={()=>wxSaveToKb(wxDetail)} style={{background:"#F0FFF4",color:"#38A169"}}><Plus size={12}/>收录知识库</Btn>
              <Btn small onClick={()=>recreate(wxDetail.content||wxDetail.title,wxDetail.title,"公众号二创")} disabled={isRecreating===wxDetail.title} style={{background:"#FFFAF0",color:"#DD6B20"}}>{isRecreating===wxDetail.title?<Loader2 size={11} className="spin"/>:<><RotateCw size={12}/>AI二创</>}</Btn>
              {wxDetail.url&&<a href={wxDetail.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,padding:"7px 14px",borderRadius:10,fontSize:13,fontWeight:600,background:"#EDF2F7",color:"#718096",textDecoration:"none"}}>原文<ExternalLink size={11}/></a>}
            </div>
          </div>
          <div style={{padding:"20px 24px",maxHeight:500,overflowY:"auto"}}>
            {wxDetail.content?<div style={{fontSize:15,color:"#4A5568",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{wxDetail.content.replace(/<[^>]+>/g,'')}</div>:<div style={{textAlign:"center",padding:"30px 0",color:"#A0AEC0"}}><div style={{fontSize:14}}>该文章仅有摘要，点击上方"原文"查看完整内容</div></div>}
          </div>
        </Card>
      </div>:<div>
        <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 16px"}}>公众号采集</h1>
        {/* Search history tags */}
        {searchHistory.length>0&&<div style={{marginBottom:16}}><div style={{fontSize:13,color:"#A0AEC0",marginBottom:6}}>🕐 搜索历史</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{searchHistory.map(h=><button key={h.id} onClick={()=>loadHistory(h)} style={{padding:"5px 12px",borderRadius:16,fontSize:12,border:"1px solid #E2E8F0",background:wxKw===h.keyword?"#EBF4FF":"#fff",color:wxKw===h.keyword?"#007AFF":"#718096",cursor:"pointer",fontWeight:500}}>{h.keyword} ({h.result_count})</button>)}</div></div>}
        {/* Tabs */}
        <div style={{display:"flex",gap:5,marginBottom:16}}>{[{k:"search",l:"🔍 关键词搜索"},{k:"follow",l:"📡 公众号订阅"}].map(m=><button key={m.k} onClick={()=>setWxTab(m.k)} style={{padding:"9px 16px",borderRadius:10,border:wxTab===m.k?"1px solid #90CDF4":"1px solid #E2E8F0",background:wxTab===m.k?"#EBF4FF":"#fff",color:wxTab===m.k?"#007AFF":"#718096",cursor:"pointer",fontSize:14,fontWeight:600,flex:1,textAlign:"center"}}>{m.l}</button>)}</div>
        {/* Search */}
        {wxTab==="search"&&<Card style={{border:"1px solid #FEEBC8"}}>
          <div style={{display:"flex",gap:8,marginBottom:12}}><Inp value={wxKw} onChange={e=>setWxKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&wxSearch(1)} placeholder="搜索关键词，如：短视频运营" style={{flex:1,marginBottom:0}}/><select value={wxPeriod} onChange={e=>setWxPeriod(Number(e.target.value))} style={{background:"#F7FAFC",border:"1px solid #E2E8F0",borderRadius:10,padding:"0 12px",fontSize:13,outline:"none"}}><option value={7}>近7天</option><option value={30}>近30天</option><option value={90}>近90天</option></select><Btn primary onClick={()=>wxSearch(1)} disabled={wxLoading||!wxKw.trim()}>{wxLoading?<Loader2 size={14} className="spin"/>:<Search size={14}/>}</Btn></div>
          {wxResults.length>0&&<div style={{fontSize:12,color:"#A0AEC0",marginBottom:8}}>共{wxTotal}篇 · 已加载{wxResults.length}篇{wxResults[0]?._fromDb?" (缓存)":""}</div>}
          {wxResults.map((item,idx)=><div key={idx} style={{padding:"12px 14px",background:"#F7FAFC",borderRadius:10,marginBottom:5,display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}} onClick={()=>setWxDetail(item)}>
            {item.avatar&&<img src={item.avatar} style={{width:60,height:40,borderRadius:6,objectFit:"cover",flexShrink:0}} onError={e=>{e.target.style.display='none';}}/>}
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:"#2D3748",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",lineHeight:1.4}}>{item.title}</div><div style={{fontSize:11,color:"#A0AEC0"}}>{item.wx_name} · 👁{item.read>=10000?(item.read/10000).toFixed(1)+'w':item.read} · 👍{item.praise} · {item.publish_time_str}{item.is_original===1?" · 原创":""}</div></div>
            <ChevronRight size={16} color="#CBD5E0" style={{flexShrink:0,marginTop:8}}/>
          </div>)}
          {wxResults.length>0&&wxResults.length<wxTotal&&!wxResults[0]?._fromDb&&<div style={{textAlign:"center",marginTop:8}}><Btn onClick={()=>wxSearch(wxPage+1)} disabled={wxLoading}>加载更多</Btn></div>}
          {!wxResults.length&&!wxLoading&&<div style={{textAlign:"center",padding:"24px 0",color:"#A0AEC0",fontSize:14}}>输入关键词搜索公众号文章</div>}
        </Card>}
        {/* Follow */}
        {wxTab==="follow"&&<Card style={{border:"1px solid #C6F6D5"}}>
          <div style={{display:"flex",gap:8,marginBottom:12}}><Inp value={wxName} onChange={e=>setWxName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&wxHistSearch(1)} placeholder="公众号名称" style={{flex:1,marginBottom:0}}/><Btn primary onClick={()=>wxHistSearch(1)} disabled={wxHLoading||!wxName.trim()}>{wxHLoading?<Loader2 size={14} className="spin"/>:<Search size={14}/>}</Btn></div>
          {wxMpInfo&&<div style={{padding:"10px",background:"#F0FFF4",borderRadius:8,marginBottom:10,fontSize:13,color:"#38A169",fontWeight:600}}>{wxMpInfo.name} · 总发文{wxMpInfo.total}次</div>}
          {wxHist.filter(i=>i.title).map((item,idx)=><div key={idx} style={{padding:"10px 14px",background:"#F7FAFC",borderRadius:8,marginBottom:5,display:"flex",gap:10,alignItems:"center",cursor:"pointer"}} onClick={()=>setWxDetail({...item,wx_name:wxMpInfo?.name||wxName,content:item.digest||"",read:0,praise:0})}>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#2D3748"}}>{item.title}</div><div style={{fontSize:11,color:"#A0AEC0"}}>{item.post_time_str} · {item.position===0?"头条":`第${item.position+1}条`}{item.original===1?" · 原创":""}</div></div><ChevronRight size={14} color="#CBD5E0"/>
          </div>)}
          {wxHPage<wxHTotalPage&&<div style={{textAlign:"center",marginTop:8}}><Btn onClick={()=>wxHistSearch(wxHPage+1)} disabled={wxHLoading}>加载更多</Btn></div>}
          {!wxHist.length&&!wxHLoading&&<div style={{textAlign:"center",padding:"24px 0",color:"#A0AEC0",fontSize:14}}>输入公众号名称查询</div>}
        </Card>}
      </div>}
    </div>}

    {/* COMPANY KB 公司知识库 */}
    {tab==="companyKb"&&<div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 16px"}}>公司知识库</h1>
      <p style={{fontSize:14,color:"#718096",margin:"0 0 20px"}}>管理公司资料，生成文章时AI自动引用</p>
      <Card><Lbl>{kbEdit?"编辑素材":"添加素材"}</Lbl><Inp value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="标题，如：某餐饮客户3个月涨粉2万案例"/>
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>{KB_CATS.map(c=><button key={c} onClick={()=>setKbCat(c)} style={{padding:"6px 12px",borderRadius:14,fontSize:12,border:"none",cursor:"pointer",background:kbCat===c?"#007AFF":"#EDF2F7",color:kbCat===c?"#fff":"#718096"}}>{c}</button>)}</div>
        <TArea value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="粘贴公司介绍、案例复盘、服务说明、行业数据等..." rows={4}/>
        <div style={{display:"flex",gap:6,marginTop:10}}>{kbEdit&&<Btn onClick={()=>{setKbEdit(null);setKbTitle("");setKbContent("");}}>取消</Btn>}<Btn primary onClick={addKbItem} disabled={!kbTitle.trim()||!kbContent.trim()}><Plus size={14}/>{kbEdit?"保存":"添加"}</Btn></div>
      </Card>
      {kb.filter(k=>k.category!=="公众号素材").length>0&&<>
        <div style={{fontSize:16,fontWeight:600,marginBottom:10}}>📚 已收录 ({kb.filter(k=>k.category!=="公众号素材").length})</div>
        <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}><button onClick={()=>setKbFilter("all")} style={{padding:"5px 10px",borderRadius:12,fontSize:12,border:"none",cursor:"pointer",background:kbFilter==="all"?"#007AFF":"#EDF2F7",color:kbFilter==="all"?"#fff":"#718096"}}>全部</button>{KB_CATS.map(c=>{const cnt=kb.filter(k=>k.category===c).length;return cnt>0?<button key={c} onClick={()=>setKbFilter(c)} style={{padding:"5px 10px",borderRadius:12,fontSize:12,border:"none",cursor:"pointer",background:kbFilter===c?"#007AFF":"#EDF2F7",color:kbFilter===c?"#fff":"#718096"}}>{c}({cnt})</button>:null;})}</div>
        {filteredKb.map(k=><div key={k.id} style={{background:"#fff",borderRadius:10,padding:"14px 16px",marginBottom:5,border:"1px solid #E2E8F0"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:5,background:"#EBF4FF",color:"#3182CE",fontWeight:600}}>{k.category}</span><span style={{fontSize:14,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#2D3748"}}>{k.title}</span><Btn small onClick={()=>{setKbTitle(k.title);setKbContent(k.content);setKbCat(k.category);setKbEdit(k.id);}}><PenTool size={10}/></Btn><Btn small danger onClick={()=>delKbItem(k.id)}><Trash2 size={10}/></Btn></div><div style={{fontSize:12,color:"#718096",lineHeight:1.5,maxHeight:44,overflow:"hidden"}}>{k.content}</div></div>)}
      </>}
      {kb.filter(k=>k.category!=="公众号素材").length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#A0AEC0"}}><Building2 size={32} style={{marginBottom:8,opacity:0.3}}/><div>添加公司资料后，AI生成文章更精准</div></div>}
    </div>}

    {/* CONTENT */}
    {tab==="content"&&<div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 20px"}}>内容生成</h1>
      <Card><Lbl>选择问题</Lbl>{!mon.length?<div style={{textAlign:"center",color:"#A0AEC0",padding:10}}>列表为空 <Btn onClick={()=>setTab("keywords")} style={{marginLeft:6}}>去生成</Btn></div>:<div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:160,overflowY:"auto"}}>{mon.map((m,i)=><div key={i} onClick={()=>setCQ(m)} style={{padding:"9px 12px",borderRadius:8,cursor:"pointer",background:cQ?.question===m.question?"#EBF4FF":"#F7FAFC",border:cQ?.question===m.question?"1px solid #90CDF4":"1px solid transparent",fontSize:13,color:cQ?.question===m.question?"#007AFF":"#4A5568"}}>{m.question}</div>)}</div>}</Card>
      <Card><Lbl>文章类型</Lbl><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{ATY.map(t=>{const a=aType===t.key;const I=t.icon;return<div key={t.key} onClick={()=>setAType(t.key)} style={{padding:"14px 16px",borderRadius:10,cursor:"pointer",background:a?"#EBF4FF":"#F7FAFC",border:a?"1px solid #90CDF4":"1px solid transparent"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><I size={15} style={{color:a?"#007AFF":"#A0AEC0"}}/><span style={{fontSize:14,fontWeight:600,color:a?"#007AFF":"#4A5568"}}>{t.label}</span></div><div style={{fontSize:12,color:"#A0AEC0"}}>{t.desc}</div></div>;})}</div></Card>
      {kb.length>0&&<div style={{background:"#EBF4FF",borderRadius:8,padding:"8px 14px",marginBottom:14,fontSize:12,color:"#3182CE"}}><Database size={12} style={{verticalAlign:-2}}/> 知识库{kb.length}条素材已加载</div>}
      <Btn primary onClick={genArticle} disabled={!cQ||isGenA} style={{marginBottom:16}}>{isGenA?<><Loader2 size={15} className="spin"/>生成中</>:<><Sparkles size={15}/>一键生成</>}</Btn>
      {article&&<Card style={{padding:0,overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:"1px solid #EDF2F7"}}><span style={{fontSize:14,fontWeight:600}}>预览 · {article.length}字</span><div style={{display:"flex",gap:5}}><Btn small onClick={()=>saveToQueue(article)}><ClipboardList size={11}/>待发布</Btn><Btn small onClick={copyA}>{copied?<Check size={11}/>:<Copy size={11}/>}</Btn><Btn small primary onClick={()=>setTab("publish")}><Send size={11}/>发布</Btn></div></div><div style={{padding:"16px 22px",maxHeight:380,overflowY:"auto"}}>{renderMd(article)}</div></Card>}
    </div>}

    {/* QUEUE */}
    {tab==="queue"&&<div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 20px"}}>待发布列表</h1>
      {viewArticle?<div><Btn onClick={()=>setViewArticle(null)} style={{marginBottom:14}}>← 返回</Btn><Card style={{padding:0,overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:"1px solid #EDF2F7"}}><div><div style={{fontSize:14,fontWeight:600}}>{viewArticle.question}</div><div style={{fontSize:11,color:"#A0AEC0",marginTop:2}}>{viewArticle.word_count}字 · {viewArticle.source} · {new Date(viewArticle.created_at).toLocaleDateString("zh-CN")}</div></div><div style={{display:"flex",gap:5}}><Btn small onClick={()=>copyText(viewArticle.content)}><Copy size={11}/></Btn><Btn small primary onClick={()=>{setArticle(viewArticle.content);setTab("publish");}}><Send size={11}/>发布</Btn></div></div><div style={{padding:"16px 22px",maxHeight:450,overflowY:"auto"}}>{renderMd(viewArticle.content)}</div></Card></div>:
      articles.length===0?<div style={{textAlign:"center",padding:"50px 0"}}><ClipboardList size={36} color="#CBD5E0" style={{marginBottom:10}}/><div style={{fontSize:16,color:"#A0AEC0"}}>列表为空</div></div>:
      <div style={{display:"flex",flexDirection:"column",gap:6}}>{articles.map(a=><div key={a.id} style={{background:"#fff",borderRadius:12,padding:"14px 18px",border:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setViewArticle(a)}>
        <div style={{width:38,height:38,borderRadius:9,background:a.article_type==="recreate"?"#FFFAF0":"#EBF4FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{a.article_type==="recreate"?<RotateCw size={16} color="#DD6B20"/>:<FileText size={16} color="#3182CE"/>}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:"#2D3748",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.question}</div><div style={{fontSize:11,color:"#A0AEC0",marginTop:2}}>{a.source||a.article_type} · {a.word_count}字 · {new Date(a.created_at).toLocaleDateString("zh-CN")}</div></div>
        <Btn small onClick={e=>{e.stopPropagation();copyText(a.content);}}><Copy size={11}/></Btn>
        <Btn small danger onClick={async e=>{e.stopPropagation();await supabase.from('articles').delete().eq('id',a.id);setArticles(p=>p.filter(x=>x.id!==a.id));}}><Trash2 size={11}/></Btn>
      </div>)}</div>}
    </div>}

    {/* PUBLISH */}
    {tab==="publish"&&<div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 20px"}}>渠道发布</h1>
      {article?<div style={{background:"#F0FFF4",border:"1px solid #C6F6D5",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}><FileText size={18} color="#38A169"/><div style={{flex:1,fontSize:15,fontWeight:600,color:"#38A169"}}>文章已就绪 · {article.length}字</div><Btn primary onClick={copyA}>{copied?<Check size={13}/>:<Copy size={13}/>} 复制</Btn></div>:<div style={{background:"#FFFAF0",border:"1px solid #FEEBC8",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}><AlertCircle size={18} color="#DD6B20"/><div style={{flex:1,fontSize:15,fontWeight:600,color:"#DD6B20"}}>还没有文章</div><Btn onClick={()=>setTab("content")}>去生成</Btn></div>}
      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>{[{k:"all",l:"全部"},{k:"核心",l:"核心"},{k:"字节",l:"字节系"},{k:"百度",l:"百度系"},{k:"腾讯",l:"腾讯系"},{k:"新闻",l:"新闻"},{k:"垂直",l:"垂直&种草"}].map(f=><button key={f.k} onClick={()=>setChFilter(f.k)} style={{padding:"5px 12px",borderRadius:14,fontSize:12,border:"none",cursor:"pointer",background:chFilter===f.k?"#007AFF":"#EDF2F7",color:chFilter===f.k?"#fff":"#718096"}}>{f.l}</button>)}</div>
      {filteredGroups.map(g=><div key={g.group} style={{marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><span style={{width:7,height:7,borderRadius:"50%",background:g.color}}/><span style={{fontSize:15,fontWeight:600,color:g.color}}>{g.group}</span></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{g.ch.map(ch=><div key={ch.n} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{ch.i}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#2D3748"}}>{ch.n} <span style={{fontSize:10,fontWeight:600,padding:"1px 5px",borderRadius:4,background:ch.p==="核心"?"#F0FFF4":"#EBF4FF",color:ch.p==="核心"?"#38A169":"#3182CE"}}>{ch.p}</span></div><div style={{fontSize:11,color:"#A0AEC0",marginTop:1}}>{ch.d}</div></div><a href={ch.u} target="_blank" rel="noopener noreferrer" style={{padding:"7px 12px",borderRadius:7,fontSize:12,fontWeight:600,background:"#EBF4FF",color:"#007AFF",textDecoration:"none"}}>发布</a></div>)}</div></div>)}
    </div>}

    {/* DASHBOARD */}
    {tab==="dashboard"&&<div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 20px"}}>效果看板</h1>
      {!stats?<div style={{textAlign:"center",padding:"50px 0"}}><BarChart3 size={36} color="#CBD5E0" style={{marginBottom:10}}/><div style={{fontSize:16,color:"#A0AEC0"}}>暂无数据</div><Btn primary onClick={()=>setTab("monitor")} style={{marginTop:12}}>去采集</Btn></div>:<>
        <div style={{display:"flex",gap:12,marginBottom:20}}><StatCard label="能见度" value={stats.score} color="#38A169" icon={BarChart3}/><StatCard label="提及率" value={stats.mr+"%"} color="#3182CE" icon={Eye}/><StatCard label="首推" value={stats.counts["首推"]} color="#DD6B20" icon={Star}/></div>
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          <Card style={{flex:1,marginBottom:0}}><Lbl>状态分布</Lbl><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{width:110,height:110}}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={50} paddingAngle={3} strokeWidth={0}>{pie.map((d,i)=><Cell key={i} fill={ST[d.name].color}/>)}</Pie></PieChart></ResponsiveContainer></div><div>{Object.entries(stats.counts).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,marginBottom:5}}><span style={{width:7,height:7,borderRadius:2,background:ST[s].color}}/><span style={{color:"#718096",flex:1}}>{s}</span><span style={{fontWeight:700,color:ST[s].color}}>{c}</span></div>)}</div></div></Card>
          <Card style={{flex:1,marginBottom:0}}><Lbl>平台得分</Lbl>{PN.map(p=>{const ps=stats.bp[p];return<div key={p} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:PF[p].color}}>{PF[p].icon} {p}</span><span style={{fontSize:18,fontWeight:700,color:PF[p].color}}>{ps.score}</span></div><div style={{display:"flex",gap:1,height:5,borderRadius:3,overflow:"hidden",background:"#EDF2F7"}}>{["首推","被提及","被引用","未出现"].map(s=>{const t=Object.values(ps.counts).reduce((a,b)=>a+b,0);const pct=t>0?(ps.counts[s]/t*100):0;return pct>0?<div key={s} style={{width:`${pct}%`,background:ST[s].color}}/>:null;})}</div></div>})}</Card>
        </div>
        <Card><Lbl>状态矩阵</Lbl><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px"}}><thead><tr><th style={{textAlign:"left",padding:"5px 8px",color:"#A0AEC0",fontSize:12}}>问题</th>{PN.map(p=><th key={p} style={{textAlign:"center",padding:"5px",color:PF[p].color,fontSize:12,width:90}}>{p}</th>)}</tr></thead><tbody>{Object.entries(stats.mx).map(([q,d])=><tr key={q}><td style={{padding:"8px 10px",fontSize:12,color:"#4A5568",background:"#F7FAFC",borderRadius:"6px 0 0 6px",maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q}</td>{PN.map((p,pi)=><td key={p} style={{textAlign:"center",padding:"6px 3px",background:"#F7FAFC",borderRadius:pi===PN.length-1?"0 6px 6px 0":0}}><Badge status={d[p]}/></td>)}</tr>)}</tbody></table></div></Card>
      </>}
    </div>}

    {/* SETTINGS */}
    {tab==="settings"&&<div style={{maxWidth:560}}>
      <h1 style={{fontSize:26,fontWeight:700,color:"#1A202C",margin:"0 0 24px"}}>设置</h1>
      <Card><div style={{fontSize:11,color:"#A0AEC0",textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>API连接</div><div style={{display:"flex",gap:18,marginTop:12}}>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:7,height:7,borderRadius:"50%",background:api[am[p]]?"#38A169":"#CBD5E0"}}/><span style={{fontSize:14,color:api[am[p]]?"#2D3748":"#A0AEC0"}}>{p}{api[am[p]]?" ✓":" ✗"}</span></div>)}</div></Card>
      <Card><Lbl>品牌名称</Lbl><div style={{display:"flex",gap:8}}><Inp value={brandIn} onChange={e=>setBrandIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBrand()} placeholder="品牌名" style={{marginBottom:0,flex:1}}/><Btn primary onClick={saveBrand} disabled={!brandIn.trim()}>保存</Btn></div>{brand&&<div style={{marginTop:8,fontSize:13,color:"#38A169"}}><CheckCircle2 size={13} style={{verticalAlign:-2}}/> 当前：{brand}</div>}</Card>
      <Card><Lbl>竞对品牌</Lbl><Inp value={compIn} onChange={e=>setCompIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const c=compIn.trim();if(c&&!comps.includes(c)){saveComps([...comps,c]);setCompIn("");}}}} placeholder="竞对名，回车添加"/><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{comps.map(c=><span key={c} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 10px",background:"#EDF2F7",borderRadius:6,fontSize:12,color:"#4A5568"}}>{c}<button onClick={()=>saveComps(comps.filter(x=>x!==c))} style={{background:"none",border:"none",color:"#A0AEC0",cursor:"pointer",padding:0}}><X size={11}/></button></span>)}</div></Card>
      <Card><Lbl>引流信息</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><div style={{fontSize:12,color:"#718096",marginBottom:3}}>微信</div><Inp value={contactInfo.wechat} onChange={e=>{const v={...contactInfo,wechat:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="微信号"/></div>
          <div><div style={{fontSize:12,color:"#718096",marginBottom:3}}>电话</div><Inp value={contactInfo.phone} onChange={e=>{const v={...contactInfo,phone:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="手机号"/></div>
          <div><div style={{fontSize:12,color:"#718096",marginBottom:3}}>官网</div><Inp value={contactInfo.website} onChange={e=>{const v={...contactInfo,website:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="官网"/></div>
          <div><div style={{fontSize:12,color:"#718096",marginBottom:3}}>地址</div><Inp value={contactInfo.address} onChange={e=>{const v={...contactInfo,address:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="地址"/></div>
        </div>
        <div style={{marginTop:6}}><div style={{fontSize:12,color:"#718096",marginBottom:3}}>引流话术</div><Inp value={contactInfo.slogan} onChange={e=>{const v={...contactInfo,slogan:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="如：免费诊断短视频账号"/></div>
        {hasContact&&<div style={{marginTop:10,padding:"10px 14px",background:"#F0FFF4",borderRadius:8,border:"1px solid #C6F6D5"}}><div style={{fontSize:11,color:"#38A169",fontWeight:600,marginBottom:3}}>✅ 文章末尾将添加：</div><div style={{fontSize:12,color:"#718096",whiteSpace:"pre-line",lineHeight:1.5}}>{contactText}</div></div>}
      </Card>
    </div>}

    </div>
  </div>);
}
