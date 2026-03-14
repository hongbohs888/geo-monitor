import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Search, Radar, LayoutDashboard, Plus, Zap, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Star, Eye, EyeOff, Quote, ArrowRight, X, Settings, RefreshCw, Trash2, ExternalLink, Target, BarChart3, Sparkles, FileText, Copy, Check, BookOpen, Send, PenTool, Wifi, WifiOff, Lock, KeyRound, User, Phone, MessageCircle, MapPin, QrCode, Image, Archive, Clock, ChevronRight, Database, RotateCw, ClipboardList, LogOut, Home as HomeIcon, Lightbulb } from "lucide-react";
import { supabase } from "../lib/supabase";

// ======== CONFIG ========
const PF={DeepSeek:{color:"#007AFF",icon:"🔍",api:"/api/deepseek"},"豆包":{color:"#FF6B2C",icon:"🫘",api:"/api/doubao"},Kimi:{color:"#AF52DE",icon:"🌙",api:"/api/moonshot"}};
const PN=Object.keys(PF);
const ST={"首推":{color:"#38A169",bg:"#F0FFF4",icon:Star,score:100},"被提及":{color:"#3182CE",bg:"#EBF8FF",icon:Eye,score:60},"被引用":{color:"#DD6B20",bg:"#FFFAF0",icon:Quote,score:30},"未出现":{color:"#A0AEC0",bg:"#F7FAFC",icon:EyeOff,score:0}};
const STAGES=[{key:"TOFU-痛点驱动",color:"#3182CE",emoji:"😣",desc:"遇到问题怎么办"},{key:"TOFU-需求评估",color:"#5856D6",emoji:"🤔",desc:"要不要做"},{key:"MOFU-选型对比",color:"#38A169",emoji:"🛒",desc:"找谁做、多少钱"},{key:"MOFU-避坑决策",color:"#DD6B20",emoji:"⚠️",desc:"怎么不被坑"},{key:"BOFU-品牌验证",color:"#E53E3E",emoji:"🔍",desc:"这家靠谱吗"},{key:"BOFU-效果诊断",color:"#805AD5",emoji:"😰",desc:"做了没效果"}];
const CG=[{group:"通用高权重",color:"#38A169",ch:[{n:"知乎专栏",i:"📝",u:"https://zhuanlan.zhihu.com/write",d:"AI引用率最高",p:"核心"},{n:"知乎回答",i:"💬",u:"https://www.zhihu.com",d:"场景问答首选",p:"核心"},{n:"CSDN",i:"🖥",u:"https://editor.csdn.net/md",d:"技术内容权重极高",p:"核心"},{n:"博客园",i:"🌿",u:"https://i.cnblogs.com/posts/edit",d:"多AI平台引用",p:"重要"}]},{group:"字节生态",color:"#FF6B2C",ch:[{n:"头条号",i:"📱",u:"https://mp.toutiao.com/profile_v4/graphic/publish",d:"豆包核心源",p:"核心"},{n:"抖音",i:"🎵",u:"https://creator.douyin.com",d:"豆包抓取",p:"核心"}]},{group:"百度生态",color:"#3182CE",ch:[{n:"百家号",i:"📰",u:"https://baijiahao.baidu.com/builder/rc/edit",d:"文心一言核心",p:"核心"},{n:"百度百科",i:"📚",u:"https://baike.baidu.com",d:"最高权威",p:"核心"},{n:"百度知道",i:"❓",u:"https://zhidao.baidu.com",d:"问答高频",p:"重要"}]},{group:"腾讯生态",color:"#5856D6",ch:[{n:"微信公众号",i:"💚",u:"https://mp.weixin.qq.com",d:"元宝核心源",p:"核心"},{n:"腾讯新闻",i:"📺",u:"https://om.qq.com/article/articleIndex",d:"元宝引用",p:"重要"}]},{group:"新闻媒体",color:"#E53E3E",ch:[{n:"搜狐号",i:"🔶",u:"https://mp.sohu.com/mpfe/v3/main/new-batch/article",d:"高权重门户",p:"核心"},{n:"网易号",i:"📡",u:"https://mp.163.com",d:"覆盖面广",p:"重要"}]},{group:"垂直&种草",color:"#805AD5",ch:[{n:"简书",i:"📖",u:"https://www.jianshu.com/writer",d:"长文友好",p:"重要"},{n:"小红书",i:"📕",u:"https://creator.xiaohongshu.com",d:"口碑建设",p:"重要"},{n:"微博",i:"🔵",u:"https://weibo.com",d:"社交声量",p:"补充"}]}];
const ATY=[{key:"guide",label:"行业深度指南",desc:"3000-5000字",icon:BookOpen},{key:"qa",label:"场景化问答",desc:"800-1500字",icon:Search},{key:"case",label:"案例深度复盘",desc:"1500-2500字",icon:Target},{key:"compare",label:"选型对比评测",desc:"2000-3000字",icon:BarChart3}];
const KB_CATS=["公司介绍","客户案例","服务说明","行业数据","公众号素材","其他"];

// ======== HELPERS ========
function analyzeR(t,b,cs){const bl=b.toLowerCase(),has=t.toLowerCase().includes(bl),ls=t.split('\n').filter(l=>/^[\d•\-\*]/.test(l.trim()));let pos=null,f=false;if(ls.length>0)for(let i=0;i<ls.length;i++)if(ls[i].toLowerCase().includes(bl)){pos=i+1;if(i===0)f=true;break;}let s="未出现";if(f)s="首推";else if(has&&pos)s="被提及";else if(has)s="被引用";return{myBrandStatus:s,competitors:cs.filter(c=>t.includes(c)).map((n,i)=>({name:n,position:i+1}))};}
function mockR(q,p,c,b,cs){const w={"TOFU-痛点驱动":[3,8,25,64],"TOFU-需求评估":[5,10,20,65],"MOFU-选型对比":[18,22,15,45],"MOFU-避坑决策":[8,15,22,55],"BOFU-品牌验证":[12,18,20,50],"BOFU-效果诊断":[6,10,22,62]}[c]||[10,15,20,55];const r=Math.random()*100;const s=r<w[0]?"首推":r<w[0]+w[1]?"被提及":r<w[0]+w[1]+w[2]?"被引用":"未出现";const mc=[...cs].sort(()=>Math.random()-.5).slice(0,Math.floor(Math.random()*3)+1).map((n,i)=>({name:n,position:i+1}));return{question:q,platform:p,category:c,status:s,competitors:mc,rawResponse:`[模拟] ${p}对"${q}"的回答。`,isReal:false};}

// ======== UI ========
function Badge({status}){const s=ST[status]||ST["未出现"];const I=s.icon;return<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:s.bg,color:s.color,fontSize:12,fontWeight:600}}><I size={12}/>{status}</span>;}
function StatCard({label,value,sub,color,icon:Icon}){return<div style={{background:"#fff",borderRadius:16,padding:"24px",flex:1,minWidth:160,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>{Icon&&<div style={{width:40,height:40,borderRadius:12,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}><Icon size={20} color={color}/></div>}<div style={{fontSize:14,color:"#718096",marginBottom:8}}>{label}</div><div style={{fontSize:36,fontWeight:700,color:color||"#1A202C",letterSpacing:-1.5,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:13,color:"#A0AEC0",marginTop:8}}>{sub}</div>}</div>;}
const Btn=({children,primary,danger,small,disabled,onClick,style:s})=><button onClick={onClick} disabled={disabled} style={{padding:small?"7px 14px":primary?"13px 28px":"9px 18px",borderRadius:small?10:12,border:"none",fontSize:small?13:primary?16:14,fontWeight:600,background:disabled?"#EDF2F7":danger?"#FED7D7":primary?"#007AFF":"#EDF2F7",color:disabled?"#A0AEC0":danger?"#E53E3E":primary?"#fff":"#4A5568",cursor:disabled?"default":"pointer",display:"inline-flex",alignItems:"center",gap:6,...s}}>{children}</button>;
const Card=({children,style:s})=><div style={{background:"#fff",borderRadius:16,padding:"24px 28px",marginBottom:20,boxShadow:"0 1px 3px rgba(0,0,0,0.04)",...s}}>{children}</div>;
const Label=({children})=><div style={{fontSize:18,fontWeight:600,marginBottom:14,color:"#1A202C"}}>{children}</div>;
const Input=({...props})=><input {...props} style={{width:"100%",background:"#F7FAFC",border:"1px solid #E2E8F0",borderRadius:12,padding:"13px 18px",color:"#1A202C",fontSize:16,outline:"none",marginBottom:12,...(props.style||{})}}/>;
const TextArea=({...props})=><textarea {...props} style={{width:"100%",background:"#F7FAFC",border:"1px solid #E2E8F0",borderRadius:12,padding:"13px 18px",color:"#1A202C",fontSize:15,outline:"none",resize:"vertical",minHeight:100,lineHeight:1.6,...(props.style||{})}}/>;

// ======== MAIN ========
export default function Home({ session }) {
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;
  const userName = session?.user?.user_metadata?.name || userEmail?.split("@")[0];

  // Core state
  const[tab,setTab]=useState("home");
  const[project,setProject]=useState(null);
  const[loading,setLoading]=useState(true);
  const[api,setApi]=useState({deepseek:false,doubao:false,moonshot:false});

  // Project data
  const[brand,setBrand]=useState("");const[brandIn,setBrandIn]=useState("");
  const[comps,setComps]=useState([]);const[compIn,setCompIn]=useState("");
  const[contactInfo,setContactInfo]=useState({wechat:"",phone:"",address:"",website:"",slogan:""});

  // Keywords
  const[kw,setKw]=useState("");const[qs,setQs]=useState([]);const[isGen,setIsGen]=useState(false);const[sel,setSel]=useState(new Set());

  // Monitor
  const[mon,setMon]=useState([]);const[res,setRes]=useState([]);const[isCol,setIsCol]=useState(false);const[prog,setProg]=useState(0);const[expQ,setExpQ]=useState(null);const[expR,setExpR]=useState(null);

  // Content
  const[cQ,setCQ]=useState(null);const[aType,setAType]=useState("guide");const[article,setArticle]=useState("");const[isGenA,setIsGenA]=useState(false);const[copied,setCopied]=useState(false);

  // KB
  const[kb,setKb]=useState([]);const[kbTitle,setKbTitle]=useState("");const[kbContent,setKbContent]=useState("");const[kbCat,setKbCat]=useState("客户案例");const[kbFilter,setKbFilter]=useState("all");const[kbEdit,setKbEdit]=useState(null);const[kbMode,setKbMode]=useState("search");
  const[wxKw,setWxKw]=useState("");const[wxResults,setWxResults]=useState([]);const[wxLoading,setWxLoading]=useState(false);const[wxPage,setWxPage]=useState(1);const[wxTotal,setWxTotal]=useState(0);const[wxPeriod,setWxPeriod]=useState(30);const[wxSaved,setWxSaved]=useState(new Set());
  const[wxName,setWxName]=useState("");const[wxHist,setWxHist]=useState([]);const[wxHLoading,setWxHLoading]=useState(false);const[wxHPage,setWxHPage]=useState(1);const[wxHTotalPage,setWxHTotalPage]=useState(0);const[wxMpInfo,setWxMpInfo]=useState(null);

  // Articles & Queue
  const[articles,setArticles]=useState([]);const[viewArticle,setViewArticle]=useState(null);
  const[isRecreating,setIsRecreating]=useState(null);
  const[chFilter,setChFilter]=useState("all");
  const fileRef=useRef(null);

  // Dashboard data
  const[batches,setBatches]=useState([]);
  const[aiSuggestions,setAiSuggestions]=useState("");

  // ======== INIT: Load project ========
  useEffect(()=>{
    if(!userId)return;
    (async()=>{
      // Check API status
      fetch('/api/status').then(r=>r.json()).then(setApi).catch(()=>{});
      // Load or create project
      let{data:proj}=await supabase.from('projects').select('*').eq('user_id',userId).limit(1).single();
      if(!proj){
        const{data:newProj}=await supabase.from('projects').insert({user_id:userId,name:'我的GEO项目',brand:'',competitors:[],contact_info:{}}).select().single();
        proj=newProj;
      }
      if(proj){
        setProject(proj);
        setBrand(proj.brand||"");setBrandIn(proj.brand||"");
        setComps(proj.competitors||[]);
        setContactInfo(prev=>({...prev,...(proj.contact_info||{})}));
        // Load keywords
        const{data:kws}=await supabase.from('keywords').select('*').eq('project_id',proj.id).order('created_at',{ascending:false});
        if(kws)setMon(kws.map(k=>({id:k.id,question:k.question,category:k.category})));
        // Load KB
        const{data:kbData}=await supabase.from('knowledge_base').select('*').eq('project_id',proj.id).order('created_at',{ascending:false});
        if(kbData)setKb(kbData);
        // Load articles
        const{data:arts}=await supabase.from('articles').select('*').eq('project_id',proj.id).order('created_at',{ascending:false});
        if(arts)setArticles(arts);
        // Load batches
        const{data:bs}=await supabase.from('collection_batches').select('*').eq('project_id',proj.id).order('completed_at',{ascending:false}).limit(10);
        if(bs)setBatches(bs);
      }
      setLoading(false);
    })();
  },[userId]);

  const am={DeepSeek:'deepseek','豆包':'doubao',Kimi:'moonshot'};
  const anyApi=api.deepseek||api.doubao||api.moonshot;

  // Contact
  const contactLines=[contactInfo.slogan,contactInfo.phone?`📞 电话：${contactInfo.phone}`:"",contactInfo.wechat?`💬 微信：${contactInfo.wechat}`:"",contactInfo.website?`🌐 官网：${contactInfo.website}`:"",contactInfo.address?`📍 地址：${contactInfo.address}`:""].filter(Boolean);
  const contactText=contactLines.join("\n");
  const hasContact=contactLines.length>0;

  // KB context
  const kbContext=useMemo(()=>{
    if(!kb.length)return"";
    return"\n\n## 公司知识库素材\n\n"+kb.slice(0,5).map(k=>`【${k.category}】${k.title}：${k.content?.slice(0,300)||""}`).join("\n\n");
  },[kb]);

  // ======== SAVE PROJECT ========
  const saveProject=useCallback(async(updates)=>{
    if(!project)return;
    await supabase.from('projects').update(updates).eq('id',project.id);
  },[project]);

  const saveBrand=useCallback(async()=>{
    if(!brandIn.trim())return;
    setBrand(brandIn.trim());
    await saveProject({brand:brandIn.trim()});
  },[brandIn,saveProject]);

  const saveComps=useCallback(async(newComps)=>{
    setComps(newComps);
    await saveProject({competitors:newComps});
  },[saveProject]);

  const saveContact=useCallback(async(info)=>{
    setContactInfo(info);
    await saveProject({contact_info:info});
  },[saveProject]);

  // ======== KEYWORDS ========
  const genKw=useCallback(async()=>{if(!kw.trim())return;setIsGen(true);setQs([]);setSel(new Set());
    const prompt=`你是GEO高级策略顾问，精通LLM查询扇出机制。输入关键词：${kw.trim()}${brand?`\n品牌：${brand}`:""}${comps.length?`\n竞对：${comps.join("、")}`:""}

生成6组×4个=24个问题，按TOFU→MOFU→BOFU排列：
【TOFU-痛点驱动】描述具体问题+具体行业。【TOFU-需求评估】带自身条件评估值不值。【MOFU-选型对比】比较/问价格。【MOFU-避坑决策】担心被坑。【BOFU-品牌验证】验证品牌。【BOFU-效果诊断】做了没效果，带数据。

要求：15-25字完整自然语言、至少半数带地域、零重复、口语化、禁止关键词堆砌。
JSON：[{"stage":"TOFU-痛点驱动","question":"..."}]`;
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:3000})});const d=await r.json();if(d.text)setQs(JSON.parse(d.text.replace(/```json|```/g,"").trim()));else throw 0;}catch(e){
      const t={"TOFU-痛点驱动":["在济南开了个餐饮店抖音发了半年没客人","教培机构抖音管得严还有什么线上获客办法","同行都做短视频我不做是不是被淘汰","工厂想短视频找客户不知从哪下手"],"TOFU-需求评估":["月营业额十几万有必要花钱做短视频吗","不会拍剪是不是只能找代运营","短视频运营能带来多少客户","预算每月三五千做短视频够吗"],"MOFU-选型对比":["济南短视频代运营怎么选预算五千","自己招人和找代运营哪个划算","代运营一个月多少钱济南行情","大公司和小工作室有什么区别"],"MOFU-避坑决策":["找短视频代运营最容易踩什么坑","承诺保证播放量能信吗","签合同要注意哪些条款","怎么判断一家公司靠不靠谱"],"BOFU-品牌验证":[`${brand||"某公司"}做短视频效果怎么样`,"济南做餐饮短视频做得好的公司","想找本地代运营谁家口碑好",`${comps[0]||"A公司"}和${comps[1]||"B公司"}哪个好`],"BOFU-效果诊断":["找了代运营三个月花两万播放量几十个","涨了一万粉但没客户什么情况","做了半年没线索是谁的问题","感觉被忽悠了想换怕又踩坑"]};
      setQs(Object.entries(t).flatMap(([s,a])=>a.map(q=>({stage:s,question:q}))));
    }setIsGen(false);},[kw,brand,comps]);

  const toggleQ=i=>setSel(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});
  const addMon=useCallback(async()=>{
    const nq=[...sel].map(i=>({question:qs[i].question,category:qs[i].stage})).filter(q=>!mon.some(m=>m.question===q.question));
    if(!nq.length||!project)return;
    const inserts=nq.map(q=>({project_id:project.id,question:q.question,category:q.category}));
    const{data}=await supabase.from('keywords').insert(inserts).select();
    if(data)setMon(p=>[...p,...data.map(k=>({id:k.id,question:k.question,category:k.category}))]);
    setSel(new Set());setTab("monitor");
  },[sel,qs,mon,project]);

  // ======== COLLECT ========
  const collect=useCallback(async()=>{
    if(!brand||!mon.length||!project)return;setIsCol(true);setProg(0);
    const t=mon.length*PN.length,nr=[];
    for(let i=0;i<mon.length;i++){for(let j=0;j<PN.length;j++){
      const p=PN[j],k=am[p];let result;
      if(api[k]){try{const r=await fetch(PF[p].api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:mon[i].question}],max_tokens:2000})});const d=await r.json();if(d.text){const a=analyzeR(d.text,brand,comps);result={...a,question:mon[i].question,platform:p,category:mon[i].category,rawResponse:d.text,isReal:true};}else throw 0;}catch(e){result=mockR(mon[i].question,p,mon[i].category,brand,comps);}}
      else{await new Promise(r=>setTimeout(r,60+Math.random()*100));result=mockR(mon[i].question,p,mon[i].category,brand,comps);}
      nr.push(result);setProg(Math.round(((i*PN.length+j+1)/t)*100));
    }}
    setRes(nr);
    // Save batch
    const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};nr.forEach(r=>counts[r.myBrandStatus||r.status]++);
    const score=Math.round(nr.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/nr.length);
    const mr=Math.round(((nr.length-counts["未出现"])/nr.length)*100);
    const pScores={};PN.forEach(p=>{const pr=nr.filter(r=>r.platform===p);pScores[p]=pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/pr.length):0;});
    const{data:batch}=await supabase.from('collection_batches').insert({project_id:project.id,total_queries:nr.length,score,mention_rate:mr,status_counts:counts,platform_scores:pScores}).select().single();
    if(batch){setBatches(p=>[batch,...p]);
      // Save individual results
      const inserts=nr.map(r=>({project_id:project.id,batch_id:batch.id,keyword_id:mon.find(m=>m.question===r.question)?.id,platform:r.platform,status:r.myBrandStatus||r.status,raw_response:r.rawResponse,competitors:r.competitors||[],is_real:r.isReal}));
      await supabase.from('collections').insert(inserts);
      // Generate AI suggestions
      genSuggestions(nr,score,mr,counts,pScores);
    }
    setIsCol(false);
  },[mon,brand,comps,api,project]);

  // ======== AI SUGGESTIONS ========
  const genSuggestions=useCallback(async(results,score,mr,counts,pScores)=>{
    const summary=`品牌：${brand}\n能见度评分：${score}/100\n提及率：${mr}%\n首推：${counts["首推"]}次，被提及：${counts["被提及"]}次，被引用：${counts["被引用"]}次，未出现：${counts["未出现"]}次\n平台得分：${PN.map(p=>`${p}=${pScores[p]}`).join("、")}\n未被提及的关键词：${results.filter(r=>(r.myBrandStatus||r.status)==="未出现").map(r=>r.question).slice(0,5).join("；")}`;
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`你是GEO优化顾问。根据以下采集数据给出3-5条优化建议，每条包含：优先级（🔴紧急/🟠重要/🟡一般）、问题描述、具体行动、预期效果。\n\n${summary}`}],max_tokens:1500})});const d=await r.json();
      if(d.text){setAiSuggestions(d.text);
        if(batches[0])await supabase.from('collection_batches').update({ai_suggestions:d.text}).eq('id',batches[0]?.id||'');
      }
    }catch(e){}
  },[brand,batches]);

  // ======== CONTENT ========
  const genArticle=useCallback(async()=>{if(!cQ)return;setIsGenA(true);setArticle("");setCopied(false);
    const tp={guide:"写一篇3000字以上行业深度指南。",qa:"写一篇800-1500字精准问答。",case:"写一篇1500-2500字案例复盘。",compare:"写一篇2000-3000字选型对比评测。"};
    const cp=hasContact?`\n\n文章最后必须添加引流段落，先写过渡语，然后逐行列出：\n---\n${contactLines.join("\n")}\n---`:"";
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`你是GEO内容专家。目标：${cQ.question}\n品牌：${brand||"未设置"}\n竞对：${comps.join("、")||"未设置"}\n类型：${ATY.find(t=>t.key===aType)?.label}${kbContext}\n\n${tp[aType]}每个H2前50-80字独立完整，每段≥1量化数据点。${cp}\n\nMarkdown输出。`}],max_tokens:4000})});const d=await r.json();if(d.text)setArticle(d.text);else throw 0;}catch(e){setArticle(`# ${cQ.question}\n\n> API未连接。\n\n...`);}setIsGenA(false);},[cQ,aType,brand,comps,kbContext,hasContact,contactLines]);

  // Save article to Supabase
  const saveArticleToQueue=useCallback(async(content,question,type,source)=>{
    if(!project||!content)return;
    const{data}=await supabase.from('articles').insert({project_id:project.id,question:question||cQ?.question||"",article_type:type||aType,content,word_count:content.length,source:source||"内容生成",status:"待发布"}).select().single();
    if(data)setArticles(p=>[data,...p]);
  },[project,cQ,aType]);

  // 二创
  const recreateFromAI=useCallback(async(result)=>{
    setIsRecreating(result.question+result.platform);
    const cp=hasContact?`\n\n文章最后添加引流段落：\n---\n${contactLines.join("\n")}\n---`:"";
    try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:`基于AI回答二创。原始问题：${result.question}\n原始回答：${result.rawResponse}\n品牌：${brand||"未设置"}${kbContext}\n\n用全新表述重写1500-2500字，融入品牌案例，每段含数据点，H2前50-80字独立完整。${cp}\n\nMarkdown输出。`}],max_tokens:4000})});const d=await r.json();
      if(d.text)await saveArticleToQueue(d.text,result.question,"recreate",`${result.platform}二创`);
    }catch(e){}
    setIsRecreating(null);setTab("queue");
  },[brand,kbContext,hasContact,contactLines,saveArticleToQueue]);

  const copyA=useCallback(async()=>{try{await navigator.clipboard.writeText(article)}catch(e){}setCopied(true);setTimeout(()=>setCopied(false),2500);},[article]);
  const copyText=async t=>{try{await navigator.clipboard.writeText(t)}catch(e){}};
  const handleQr=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>saveContact({...contactInfo,qrCode:ev.target.result});r.readAsDataURL(f);};

  // KB functions
  const addKbItem=useCallback(async()=>{
    if(!kbTitle.trim()||!kbContent.trim()||!project)return;
    if(kbEdit){
      await supabase.from('knowledge_base').update({title:kbTitle,content:kbContent,category:kbCat}).eq('id',kbEdit);
      setKb(p=>p.map(k=>k.id===kbEdit?{...k,title:kbTitle,content:kbContent,category:kbCat}:k));setKbEdit(null);
    }else{
      const{data}=await supabase.from('knowledge_base').insert({project_id:project.id,title:kbTitle.trim(),content:kbContent.trim(),category:kbCat}).select().single();
      if(data)setKb(p=>[data,...p]);
    }setKbTitle("");setKbContent("");
  },[kbTitle,kbContent,kbCat,kbEdit,project]);

  const delKbItem=async id=>{await supabase.from('knowledge_base').delete().eq('id',id);setKb(p=>p.filter(k=>k.id!==id));};

  // WX Search
  const wxSearch=useCallback(async(page=1)=>{if(!wxKw.trim())return;setWxLoading(true);if(page===1)setWxResults([]);
    try{const r=await fetch('/api/wxsearch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kw:wxKw.trim(),page,period:wxPeriod})});const d=await r.json();if(d.code===200&&d.data){if(page===1)setWxResults(d.data);else setWxResults(p=>[...p,...d.data]);setWxTotal(d.total||0);setWxPage(page);}}catch(e){}setWxLoading(false);},[wxKw,wxPeriod]);

  const wxSaveToKb=useCallback(async item=>{
    if(!project)return;const content=item.content?item.content.replace(/<[^>]+>/g,'').slice(0,5000):item.title;
    const{data}=await supabase.from('knowledge_base').insert({project_id:project.id,title:item.title,content,category:"公众号素材",source:item.wx_name,source_url:item.url,metadata:{read:item.read,praise:item.praise}}).select().single();
    if(data)setKb(p=>[data,...p]);setWxSaved(p=>new Set([...p,item.url]));
  },[project]);

  // WX History
  const wxHistSearch=useCallback(async(page=1)=>{if(!wxName.trim())return;setWxHLoading(true);if(page===1){setWxHist([]);setWxMpInfo(null);}
    try{const r=await fetch('/api/wxhistory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:wxName.trim(),page})});const d=await r.json();if(d.code===200&&d.data){if(page===1)setWxHist(d.data);else setWxHist(p=>[...p,...d.data]);setWxHTotalPage(d.total_page||0);setWxHPage(page);if(d.mp_nickname)setWxMpInfo({name:d.mp_nickname,avatar:d.head_img,total:d.total_num});}}catch(e){}setWxHLoading(false);},[wxName]);

  const wxHistSave=useCallback(async item=>{
    if(!project)return;
    const{data}=await supabase.from('knowledge_base').insert({project_id:project.id,title:item.title,content:item.digest||item.title,category:"公众号素材",source:wxMpInfo?.name||wxName,source_url:item.url}).select().single();
    if(data)setKb(p=>[data,...p]);setWxSaved(p=>new Set([...p,item.url]));
  },[project,wxMpInfo,wxName]);

  // Stats
  const stats=useMemo(()=>{if(!res.length)return null;const score=Math.round(res.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/res.length);const counts={"首推":0,"被提及":0,"被引用":0,"未出现":0};res.forEach(r=>counts[r.myBrandStatus||r.status]++);const mr=Math.round(((res.length-counts["未出现"])/res.length)*100);const bp={};PN.forEach(p=>{const pr=res.filter(r=>r.platform===p);bp[p]={score:pr.length?Math.round(pr.reduce((s,r)=>s+ST[r.myBrandStatus||r.status].score,0)/pr.length):0,counts:{"首推":0,"被提及":0,"被引用":0,"未出现":0}};pr.forEach(r=>bp[p].counts[r.myBrandStatus||r.status]++);});const cf={};res.forEach(r=>r.competitors?.forEach(c=>{cf[c.name]=(cf[c.name]||0)+1;}));const cr=Object.entries(cf).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({name:n,count:c}));const mx={};mon.forEach(m=>{mx[m.question]={};PN.forEach(p=>mx[m.question][p]="未出现");});res.forEach(r=>{if(mx[r.question])mx[r.question][r.platform]=r.myBrandStatus||r.status;});return{score,counts,mr,bp,cr,mx};},[res,mon]);
  const pie=stats?Object.entries(stats.counts).filter(([_,v])=>v>0).map(([n,v])=>({name:n,value:v})):[];
  const filteredKb=kbFilter==="all"?kb:kb.filter(k=>k.category===kbFilter);
  const filteredGroups=chFilter==="all"?CG:chFilter==="核心"?CG.map(g=>({...g,ch:g.ch.filter(c=>c.p==="核心")})).filter(g=>g.ch.length>0):CG.filter(g=>g.group.includes(chFilter));
  const queueCount=articles.filter(a=>a.status==="待发布").length;

  const renderMd=md=>{if(!md)return null;return md.split("\n").map((l,i)=>{if(l.startsWith("# "))return<h1 key={i} style={{fontSize:24,fontWeight:700,color:"#1A202C",margin:"24px 0 12px"}}>{l.slice(2)}</h1>;if(l.startsWith("## "))return<h2 key={i} style={{fontSize:20,fontWeight:600,color:"#2D3748",margin:"20px 0 10px"}}>{l.slice(3)}</h2>;if(l.startsWith("### "))return<h3 key={i} style={{fontSize:17,fontWeight:600,color:"#4A5568",margin:"16px 0 8px"}}>{l.slice(4)}</h3>;if(l.startsWith("> "))return<blockquote key={i} style={{borderLeft:"3px solid #3182CE",paddingLeft:16,margin:"12px 0",color:"#718096",fontSize:15}}>{l.slice(2)}</blockquote>;if(l.startsWith("- ")||l.startsWith("* "))return<div key={i} style={{paddingLeft:16,margin:"4px 0",fontSize:15,color:"#4A5568",lineHeight:1.7}}>• {l.slice(2)}</div>;if(l==="---")return<hr key={i} style={{border:"none",borderTop:"1px solid #E2E8F0",margin:"16px 0"}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<p key={i} style={{fontSize:15,color:"#4A5568",lineHeight:1.8,margin:"5px 0"}}>{l}</p>;});};

  const logout=async()=>{await supabase.auth.signOut();};

  const tabs=[{id:"home",label:"首页",icon:Home},{id:"keywords",label:"关键词",icon:Search},{id:"monitor",label:"采集",icon:Radar,badge:mon.length},{id:"kb",label:"知识库",icon:Database,badge:kb.length},{id:"content",label:"内容",icon:PenTool},{id:"queue",label:"待发布",icon:ClipboardList,badge:queueCount},{id:"publish",label:"发布",icon:Send},{id:"dashboard",label:"看板",icon:BarChart3}];

  if(loading)return<div style={{height:"100vh",background:"#F0F4F8",display:"flex",alignItems:"center",justifyContent:"center"}}><Loader2 size={32} className="spin" color="#007AFF"/></div>;

  return(<div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#F0F4F8"}}>
    {/* SIDEBAR */}
    <div style={{width:220,background:"#fff",borderRight:"1px solid #E2E8F0",padding:"24px 12px",display:"flex",flexDirection:"column",gap:2,flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"0 12px",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#007AFF,#5856D6)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,color:"#fff",fontWeight:800}}>G</span></div>
          <div><div style={{fontSize:17,fontWeight:700,color:"#1A202C"}}>GEO Monitor</div></div>
        </div>
      </div>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,width:"100%",border:"none",background:tab===t.id?"#EBF4FF":"transparent",color:tab===t.id?"#007AFF":"#718096",cursor:"pointer",fontSize:14,fontWeight:tab===t.id?600:500}}><t.icon size={17}/><span>{t.label}</span>{t.badge>0&&<span style={{marginLeft:"auto",background:tab===t.id?"#007AFF":"#E2E8F0",color:tab===t.id?"#fff":"#718096",fontSize:11,fontWeight:700,padding:"1px 7px",borderRadius:10}}>{t.badge}</span>}</button>)}
      <div style={{height:1,background:"#E2E8F0",margin:"10px 8px"}}/>
      <button onClick={()=>setTab("settings")} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,width:"100%",border:"none",background:tab==="settings"?"#EBF4FF":"transparent",color:tab==="settings"?"#007AFF":"#718096",cursor:"pointer",fontSize:14}}><Settings size={17}/>设置</button>
      <div style={{flex:1}}/>
      {/* User info */}
      <div style={{padding:"12px",background:"#F7FAFC",borderRadius:12,margin:"0 4px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:10,background:"#EBF4FF",display:"flex",alignItems:"center",justifyContent:"center"}}><User size={16} color="#007AFF"/></div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#2D3748",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</div></div>
          <button onClick={logout} style={{background:"none",border:"none",color:"#A0AEC0",cursor:"pointer",padding:2}} title="退出登录"><LogOut size={16}/></button>
        </div>
      </div>
      {/* API Status */}
      <div style={{padding:"10px 12px",margin:"6px 4px 0"}}>
        {PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,marginBottom:3,color:api[am[p]]?"#38A169":"#CBD5E0"}}><span style={{width:6,height:6,borderRadius:"50%",background:api[am[p]]?"#38A169":"#CBD5E0"}}/>{p}</div>)}
      </div>
    </div>

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",padding:"32px 40px"}}>

      {/* HOME DASHBOARD */}
      {tab==="home"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div><h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:0}}>欢迎回来，{userName}</h1><p style={{fontSize:15,color:"#718096",margin:"4px 0 0"}}>{brand?`正在监控：${brand}`:"请先在设置中配置品牌名称"}</p></div>
          <Btn primary onClick={()=>setTab("keywords")}><Zap size={16}/>开始工作</Btn>
        </div>

        {/* Stats cards */}
        <div style={{display:"flex",gap:14,marginBottom:24}}>
          <StatCard label="能见度评分" value={batches[0]?.score||"--"} color="#007AFF" icon={BarChart3} sub={batches[0]?`最近采集 ${new Date(batches[0].completed_at).toLocaleDateString("zh-CN")}`:"暂无采集数据"}/>
          <StatCard label="提及率" value={batches[0]?batches[0].mention_rate+"%":"--"} color="#38A169" icon={Eye} sub="出现 / 总查询"/>
          <StatCard label="待发布文章" value={queueCount} color="#DD6B20" icon={FileText} sub="等待发布"/>
          <StatCard label="知识库素材" value={kb.length} color="#805AD5" icon={Database} sub="条"/>
        </div>

        {/* AI Suggestions */}
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Lightbulb size={20} color="#DD6B20"/><Label>AI优化建议</Label></div>
          {aiSuggestions||batches[0]?.ai_suggestions?
            <div style={{fontSize:15,color:"#4A5568",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{renderMd(aiSuggestions||batches[0]?.ai_suggestions)}</div>:
            <div style={{textAlign:"center",padding:"24px 0",color:"#A0AEC0"}}>
              <Lightbulb size={32} style={{marginBottom:8,opacity:0.3}}/>
              <div style={{fontSize:15}}>完成第一次采集后，AI会自动分析并给出优化建议</div>
              <Btn primary onClick={()=>setTab("monitor")} style={{marginTop:14}}>去采集 <ArrowRight size={15}/></Btn>
            </div>
          }
        </Card>

        {/* Recent batches */}
        {batches.length>0&&<Card>
          <Label>采集历史</Label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {batches.slice(0,5).map(b=><div key={b.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:"#F7FAFC",borderRadius:12}}>
              <div style={{fontSize:28,fontWeight:700,color:b.score>=60?"#38A169":b.score>=30?"#DD6B20":"#E53E3E",minWidth:48}}>{b.score}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#2D3748"}}>采集 {b.total_queries} 条 · 提及率 {b.mention_rate}%</div><div style={{fontSize:13,color:"#A0AEC0",marginTop:2}}>{new Date(b.completed_at).toLocaleDateString("zh-CN")}</div></div>
            </div>)}
          </div>
        </Card>}

        {/* Quick actions */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          {[{label:"生成关键词",desc:"AI扩展搜索问题",icon:Search,tab:"keywords",color:"#3182CE"},{label:"采集监控",desc:"检测AI推荐状态",icon:Radar,tab:"monitor",color:"#38A169"},{label:"生成文章",desc:"一键创建GEO内容",icon:PenTool,tab:"content",color:"#805AD5"}].map(a=>(
            <div key={a.tab} onClick={()=>setTab(a.tab)} style={{background:"#fff",borderRadius:16,padding:"24px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.2s"}}>
              <div style={{width:44,height:44,borderRadius:12,background:a.color+"15",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}><a.icon size={22} color={a.color}/></div>
              <div style={{fontSize:16,fontWeight:600,color:"#1A202C",marginBottom:4}}>{a.label}</div>
              <div style={{fontSize:13,color:"#A0AEC0"}}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* KEYWORDS */}
      {tab==="keywords"&&<div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 24px"}}>关键词扩展</h1>
        <div style={{display:"flex",gap:12,marginBottom:28}}><Input value={kw} onChange={e=>setKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&genKw()} placeholder="输入关键词，如：济南短视频运营" style={{flex:1,marginBottom:0,borderRadius:14,padding:"14px 20px",fontSize:16}}/><Btn primary onClick={genKw} disabled={isGen||!kw.trim()}>{isGen?<><Loader2 size={16} className="spin"/>生成中</>:<><Zap size={16}/>生成问题</>}</Btn></div>
        {qs.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><span style={{fontSize:15,color:"#718096"}}>共<b style={{color:"#1A202C"}}>{qs.length}</b>个 · 已选<b style={{color:"#007AFF"}}>{sel.size}</b>个</span><div style={{display:"flex",gap:8}}><Btn onClick={()=>setSel(p=>p.size===qs.length?new Set():new Set(qs.map((_,i)=>i)))}>{sel.size===qs.length?"取消":"全选"}</Btn><Btn primary onClick={addMon} disabled={!sel.size}><Plus size={14}/>加入监控</Btn></div></div>
        {STAGES.map(stg=>{const sq=qs.map((q,i)=>({...q,idx:i})).filter(q=>q.stage===stg.key);if(!sq.length)return null;return<div key={stg.key} style={{marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:18}}>{stg.emoji}</span><span style={{fontSize:16,fontWeight:600,color:stg.color}}>{stg.key}</span><span style={{fontSize:13,color:"#A0AEC0"}}>{stg.desc}</span></div>{sq.map(q=><div key={q.idx} onClick={()=>toggleQ(q.idx)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:sel.has(q.idx)?"#EBF4FF":"#fff",border:sel.has(q.idx)?"1px solid #90CDF4":"1px solid #E2E8F0",borderRadius:12,marginBottom:5,cursor:"pointer"}}><div style={{width:20,height:20,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:sel.has(q.idx)?"#007AFF":"#fff",border:sel.has(q.idx)?"none":"1.5px solid #CBD5E0",flexShrink:0}}>{sel.has(q.idx)&&<Check size={13} color="#fff"/>}</div><span style={{fontSize:15,color:sel.has(q.idx)?"#2D3748":"#4A5568"}}>{q.question}</span></div>)}</div>})}</>}
        {!qs.length&&!isGen&&<div style={{textAlign:"center",padding:"60px 0"}}><Search size={40} color="#CBD5E0" style={{marginBottom:12}}/><div style={{fontSize:17,color:"#A0AEC0"}}>输入关键词生成AI搜索问题</div></div>}
      </div>}

      {/* MONITOR */}
      {tab==="monitor"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}><div><h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 4px"}}>采集监控</h1><p style={{fontSize:15,color:"#718096",margin:0}}>{mon.length}问题 × {PN.length}平台</p></div><div style={{display:"flex",gap:8}}>{mon.length>0&&<Btn onClick={async()=>{if(project)await supabase.from('keywords').delete().eq('project_id',project.id);setMon([]);setRes([]);}}><Trash2 size={14}/>清空</Btn>}<Btn primary onClick={collect} disabled={isCol||!mon.length||!brand}>{isCol?<><Loader2 size={14} className="spin"/>{prog}%</>:<><RefreshCw size={14}/>开始采集</>}</Btn></div></div>
        {isCol&&<div style={{marginBottom:16}}><div style={{background:"#E2E8F0",borderRadius:6,height:5,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#007AFF,#38A169)",transition:"width 0.3s"}}/></div></div>}
        {!mon.length?<div style={{textAlign:"center",padding:"60px 0"}}><Radar size={40} color="#CBD5E0" style={{marginBottom:12}}/><div style={{fontSize:17,color:"#A0AEC0"}}>监控列表为空</div><Btn primary onClick={()=>setTab("keywords")} style={{marginTop:14}}>去生成关键词</Btn></div>:
        mon.map((m,qi)=>{const qr=res.filter(r=>r.question===m.question);const isE=expQ===qi;return<div key={qi} style={{background:"#fff",borderRadius:14,marginBottom:6,overflow:"hidden",border:"1px solid #E2E8F0"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer"}} onClick={()=>setExpQ(isE?null:qi)}><span style={{flex:1,fontSize:14,color:"#2D3748"}}>{m.question}</span>{qr.length>0&&<div style={{display:"flex",gap:4}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);return r?<Badge key={p} status={r.myBrandStatus||r.status}/>:null;})}</div>}{isE?<ChevronUp size={16} color="#A0AEC0"/>:<ChevronDown size={16} color="#A0AEC0"/>}</div>
          {isE&&qr.length>0&&<div style={{padding:"0 18px 14px",borderTop:"1px solid #EDF2F7"}}>{PN.map(p=>{const r=qr.find(r=>r.platform===p);if(!r)return null;const isD=expR===(r.question+p);return<div key={p} style={{marginTop:8,background:"#F7FAFC",borderRadius:10,overflow:"hidden"}}><div onClick={()=>setExpR(isD?null:r.question+p)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",cursor:"pointer"}}><span style={{fontSize:14,fontWeight:600,color:PF[p].color}}>{PF[p].icon} {p}</span><Badge status={r.myBrandStatus||r.status}/>{r.isReal&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:5,background:"#F0FFF4",color:"#38A169"}}>真实</span>}<span style={{marginLeft:"auto"}}/><Btn small onClick={e=>{e.stopPropagation();recreateFromAI(r);}} disabled={isRecreating===r.question+r.platform} style={{background:"#FFFAF0",color:"#DD6B20"}}>{isRecreating===r.question+r.platform?<><Loader2 size={12} className="spin"/>二创中</>:<><RotateCw size={12}/>二创</>}</Btn></div>{isD&&<div style={{padding:"0 14px 12px",borderTop:"1px solid #EDF2F7"}}><div style={{fontSize:13,color:"#718096",lineHeight:1.7,whiteSpace:"pre-wrap",background:"#fff",borderRadius:8,padding:"12px",marginTop:6,maxHeight:240,overflowY:"auto"}}>{r.rawResponse}</div></div>}</div>;})}</div>}
        </div>;})}
      </div>}

      {/* KB */}
      {tab==="kb"&&<div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 20px"}}>知识库</h1>
        <div style={{display:"flex",gap:6,marginBottom:20}}>{[{k:"search",l:"🔍 关键词搜索"},{k:"follow",l:"📡 公众号订阅"},{k:"manual",l:"✏️ 手动录入"}].map(m=><button key={m.k} onClick={()=>setKbMode(m.k)} style={{padding:"10px 18px",borderRadius:12,border:kbMode===m.k?"1px solid #90CDF4":"1px solid #E2E8F0",background:kbMode===m.k?"#EBF4FF":"#fff",color:kbMode===m.k?"#007AFF":"#718096",cursor:"pointer",fontSize:14,fontWeight:600,flex:1,textAlign:"center"}}>{m.l}</button>)}</div>

        {kbMode==="search"&&<Card style={{border:"1px solid #FEEBC8"}}><div style={{fontSize:17,fontWeight:700,marginBottom:14}}>💚 公众号文章搜索</div><div style={{display:"flex",gap:8,marginBottom:12}}><Input value={wxKw} onChange={e=>setWxKw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&wxSearch(1)} placeholder="搜索关键词..." style={{flex:1,marginBottom:0}}/><select value={wxPeriod} onChange={e=>setWxPeriod(Number(e.target.value))} style={{background:"#F7FAFC",border:"1px solid #E2E8F0",borderRadius:12,padding:"0 14px",fontSize:14,outline:"none"}}><option value={7}>近7天</option><option value={30}>近30天</option><option value={90}>近90天</option></select><Btn primary onClick={()=>wxSearch(1)} disabled={wxLoading||!wxKw.trim()}>{wxLoading?<Loader2 size={14} className="spin"/>:<Search size={14}/>}</Btn></div>
          {wxResults.map((item,idx)=>{const saved=wxSaved.has(item.url)||kb.some(k=>k.title===item.title);return<div key={idx} style={{padding:"12px 16px",background:"#F7FAFC",borderRadius:10,marginBottom:6,display:"flex",gap:12,alignItems:"flex-start"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:"#2D3748",marginBottom:4}}>{item.title}</div><div style={{fontSize:12,color:"#A0AEC0"}}>{item.wx_name} · 👁{item.read>=10000?(item.read/10000).toFixed(1)+'w':item.read} · {item.publish_time_str}</div></div><Btn small primary onClick={()=>wxSaveToKb(item)} disabled={saved}>{saved?<Check size={12}/>:<Plus size={12}/>}</Btn></div>})}
          {wxResults.length<wxTotal&&<div style={{textAlign:"center",marginTop:10}}><Btn onClick={()=>wxSearch(wxPage+1)} disabled={wxLoading}>加载更多</Btn></div>}
        </Card>}

        {kbMode==="follow"&&<Card style={{border:"1px solid #C6F6D5"}}><div style={{fontSize:17,fontWeight:700,marginBottom:14}}>📡 公众号订阅</div><div style={{display:"flex",gap:8,marginBottom:12}}><Input value={wxName} onChange={e=>setWxName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&wxHistSearch(1)} placeholder="公众号名称..." style={{flex:1,marginBottom:0}}/><Btn primary onClick={()=>wxHistSearch(1)} disabled={wxHLoading||!wxName.trim()}>{wxHLoading?<Loader2 size={14} className="spin"/>:<Search size={14}/>}</Btn></div>
          {wxMpInfo&&<div style={{padding:"12px",background:"#F0FFF4",borderRadius:10,marginBottom:12,fontSize:14,color:"#38A169",fontWeight:600}}>{wxMpInfo.name} · 总发文{wxMpInfo.total}次</div>}
          {wxHist.filter(i=>i.title).map((item,idx)=>{const saved=wxSaved.has(item.url)||kb.some(k=>k.title===item.title);return<div key={idx} style={{padding:"12px 16px",background:"#F7FAFC",borderRadius:10,marginBottom:6,display:"flex",gap:12,alignItems:"center"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:"#2D3748"}}>{item.title}</div><div style={{fontSize:12,color:"#A0AEC0"}}>{item.post_time_str} · {item.position===0?"头条":`第${item.position+1}条`}</div></div><Btn small primary onClick={()=>wxHistSave(item)} disabled={saved}>{saved?<Check size={12}/>:<Plus size={12}/>}</Btn></div>})}
          {wxHPage<wxHTotalPage&&<div style={{textAlign:"center",marginTop:10}}><Btn onClick={()=>wxHistSearch(wxHPage+1)} disabled={wxHLoading}>加载更多</Btn></div>}
        </Card>}

        {kbMode==="manual"&&<Card><Label>{kbEdit?"编辑素材":"添加素材"}</Label><Input value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="标题"/><div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{KB_CATS.map(c=><button key={c} onClick={()=>setKbCat(c)} style={{padding:"6px 14px",borderRadius:16,fontSize:13,border:"none",cursor:"pointer",background:kbCat===c?"#007AFF":"#EDF2F7",color:kbCat===c?"#fff":"#718096"}}>{c}</button>)}</div><TextArea value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="粘贴素材内容..." rows={4}/><div style={{display:"flex",gap:8,marginTop:12}}>{kbEdit&&<Btn onClick={()=>{setKbEdit(null);setKbTitle("");setKbContent("");}}>取消</Btn>}<Btn primary onClick={addKbItem} disabled={!kbTitle.trim()||!kbContent.trim()}><Plus size={14}/>{kbEdit?"保存":"添加"}</Btn></div></Card>}

        {kb.length>0&&<><div style={{fontSize:17,fontWeight:600,marginBottom:12,color:"#1A202C"}}>📚 已收录 ({kb.length})</div><div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}><button onClick={()=>setKbFilter("all")} style={{padding:"5px 12px",borderRadius:14,fontSize:13,border:"none",cursor:"pointer",background:kbFilter==="all"?"#007AFF":"#EDF2F7",color:kbFilter==="all"?"#fff":"#718096"}}>全部</button>{KB_CATS.map(c=>{const cnt=kb.filter(k=>k.category===c).length;return cnt>0?<button key={c} onClick={()=>setKbFilter(c)} style={{padding:"5px 12px",borderRadius:14,fontSize:13,border:"none",cursor:"pointer",background:kbFilter===c?"#007AFF":"#EDF2F7",color:kbFilter===c?"#fff":"#718096"}}>{c}({cnt})</button>:null;})}</div>{filteredKb.map(k=><div key={k.id} style={{background:"#fff",borderRadius:12,padding:"14px 18px",marginBottom:6,border:"1px solid #E2E8F0"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:12,padding:"2px 8px",borderRadius:6,background:k.category==="公众号素材"?"#F0FFF4":"#EBF4FF",color:k.category==="公众号素材"?"#38A169":"#3182CE",fontWeight:600}}>{k.category}</span><span style={{fontSize:15,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#2D3748"}}>{k.title}</span><Btn small onClick={()=>{setKbMode("manual");setKbTitle(k.title);setKbContent(k.content);setKbCat(k.category);setKbEdit(k.id);}}><PenTool size={11}/></Btn><Btn small danger onClick={()=>delKbItem(k.id)}><Trash2 size={11}/></Btn></div><div style={{fontSize:13,color:"#718096",lineHeight:1.5,maxHeight:50,overflow:"hidden"}}>{k.content}</div></div>)}</>}
      </div>}

      {/* CONTENT */}
      {tab==="content"&&<div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 24px"}}>内容生成</h1>
        <Card><Label>选择问题</Label>{!mon.length?<div style={{textAlign:"center",color:"#A0AEC0",padding:12}}>列表为空 <Btn onClick={()=>setTab("keywords")} style={{marginLeft:8}}>去生成</Btn></div>:<div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:170,overflowY:"auto"}}>{mon.map((m,i)=><div key={i} onClick={()=>setCQ(m)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,cursor:"pointer",background:cQ?.question===m.question?"#EBF4FF":"#F7FAFC",border:cQ?.question===m.question?"1px solid #90CDF4":"1px solid transparent"}}><span style={{fontSize:14,color:cQ?.question===m.question?"#007AFF":"#4A5568",flex:1}}>{m.question}</span>{cQ?.question===m.question&&<CheckCircle2 size={16} color="#007AFF"/>}</div>)}</div>}</Card>
        <Card><Label>文章类型</Label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{ATY.map(t=>{const a=aType===t.key;const I=t.icon;return<div key={t.key} onClick={()=>setAType(t.key)} style={{padding:"16px 18px",borderRadius:12,cursor:"pointer",background:a?"#EBF4FF":"#F7FAFC",border:a?"1px solid #90CDF4":"1px solid transparent"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><I size={16} style={{color:a?"#007AFF":"#A0AEC0"}}/><span style={{fontSize:15,fontWeight:600,color:a?"#007AFF":"#4A5568"}}>{t.label}</span></div><div style={{fontSize:13,color:"#A0AEC0"}}>{t.desc}</div></div>;})}</div></Card>
        {kb.length>0&&<div style={{background:"#EBF4FF",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:13,color:"#3182CE"}}><Database size={13} style={{verticalAlign:-2}}/> 知识库 {kb.length} 条素材已加载</div>}
        <Btn primary onClick={genArticle} disabled={!cQ||isGenA} style={{marginBottom:20}}>{isGenA?<><Loader2 size={16} className="spin"/>生成中...</>:<><Sparkles size={16}/>一键生成文章</>}</Btn>
        {article&&<Card style={{padding:0,overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 22px",borderBottom:"1px solid #EDF2F7"}}><span style={{fontSize:15,fontWeight:600,color:"#2D3748"}}>预览 · {article.length}字</span><div style={{display:"flex",gap:6}}><Btn small onClick={()=>saveArticleToQueue(article)}><ClipboardList size={12}/>待发布</Btn><Btn small onClick={copyA}>{copied?<><Check size={12}/>已复制</>:<><Copy size={12}/>复制</>}</Btn><Btn small primary onClick={()=>setTab("publish")}><Send size={12}/>发布</Btn></div></div><div style={{padding:"18px 24px",maxHeight:420,overflowY:"auto"}}>{renderMd(article)}</div></Card>}
      </div>}

      {/* QUEUE */}
      {tab==="queue"&&<div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 24px"}}>待发布列表</h1>
        {viewArticle?<div><Btn onClick={()=>setViewArticle(null)} style={{marginBottom:16}}>← 返回</Btn><Card style={{padding:0,overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 22px",borderBottom:"1px solid #EDF2F7"}}><div><div style={{fontSize:15,fontWeight:600,color:"#2D3748"}}>{viewArticle.question}</div><div style={{fontSize:12,color:"#A0AEC0",marginTop:2}}>{viewArticle.word_count}字 · {viewArticle.source} · {new Date(viewArticle.created_at).toLocaleDateString("zh-CN")}</div></div><div style={{display:"flex",gap:6}}><Btn small onClick={()=>copyText(viewArticle.content)}><Copy size={12}/>复制</Btn><Btn small primary onClick={()=>{setArticle(viewArticle.content);setTab("publish");}}><Send size={12}/>发布</Btn></div></div><div style={{padding:"18px 24px",maxHeight:500,overflowY:"auto"}}>{renderMd(viewArticle.content)}</div></Card></div>:
        articles.length===0?<div style={{textAlign:"center",padding:"60px 0"}}><ClipboardList size={40} color="#CBD5E0" style={{marginBottom:12}}/><div style={{fontSize:17,color:"#A0AEC0"}}>待发布列表为空</div></div>:
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{articles.map(a=><div key={a.id} style={{background:"#fff",borderRadius:14,padding:"16px 20px",border:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>setViewArticle(a)}>
          <div style={{width:42,height:42,borderRadius:10,background:a.article_type==="recreate"?"#FFFAF0":"#EBF4FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{a.article_type==="recreate"?<RotateCw size={18} color="#DD6B20"/>:<FileText size={18} color="#3182CE"/>}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:600,color:"#2D3748",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.question}</div><div style={{fontSize:12,color:"#A0AEC0",marginTop:3}}>{a.source||a.article_type} · {a.word_count}字 · {new Date(a.created_at).toLocaleDateString("zh-CN")}</div></div>
          <Btn small onClick={e=>{e.stopPropagation();copyText(a.content);}}><Copy size={12}/></Btn>
          <Btn small danger onClick={async e=>{e.stopPropagation();await supabase.from('articles').delete().eq('id',a.id);setArticles(p=>p.filter(x=>x.id!==a.id));}}><Trash2 size={12}/></Btn>
        </div>)}</div>}
      </div>}

      {/* PUBLISH */}
      {tab==="publish"&&<div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 24px"}}>渠道发布</h1>
        {article?<div style={{background:"#F0FFF4",border:"1px solid #C6F6D5",borderRadius:16,padding:"16px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:14}}><FileText size={20} color="#38A169"/><div style={{flex:1}}><div style={{fontSize:16,fontWeight:600,color:"#38A169"}}>文章已就绪 · {article.length}字</div></div><Btn primary onClick={copyA}>{copied?<><Check size={14}/>已复制</>:<><Copy size={14}/>复制</>}</Btn></div>:<div style={{background:"#FFFAF0",border:"1px solid #FEEBC8",borderRadius:16,padding:"16px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:14}}><AlertCircle size={20} color="#DD6B20"/><div style={{flex:1}}><div style={{fontSize:16,fontWeight:600,color:"#DD6B20"}}>还没有文章</div></div><Btn onClick={()=>setTab("content")}>去生成</Btn></div>}
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>{[{k:"all",l:"全部"},{k:"核心",l:"核心"},{k:"字节",l:"字节系"},{k:"百度",l:"百度系"},{k:"腾讯",l:"腾讯系"},{k:"新闻",l:"新闻"},{k:"垂直",l:"垂直&种草"}].map(f=><button key={f.k} onClick={()=>setChFilter(f.k)} style={{padding:"6px 14px",borderRadius:16,fontSize:13,border:"none",cursor:"pointer",background:chFilter===f.k?"#007AFF":"#EDF2F7",color:chFilter===f.k?"#fff":"#718096"}}>{f.l}</button>)}</div>
        {filteredGroups.map(g=><div key={g.group} style={{marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{width:8,height:8,borderRadius:"50%",background:g.color}}/><span style={{fontSize:16,fontWeight:600,color:g.color}}>{g.group}</span></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{g.ch.map(ch=><div key={ch.n} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>{ch.i}</span><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:600,color:"#2D3748"}}>{ch.n}</span><span style={{fontSize:11,fontWeight:600,padding:"2px 6px",borderRadius:5,background:ch.p==="核心"?"#F0FFF4":ch.p==="重要"?"#EBF4FF":"#F7FAFC",color:ch.p==="核心"?"#38A169":ch.p==="重要"?"#3182CE":"#A0AEC0"}}>{ch.p}</span></div><div style={{fontSize:12,color:"#A0AEC0",marginTop:2}}>{ch.d}</div></div><a href={ch.u} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:4,padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:600,background:"#EBF4FF",color:"#007AFF",border:"none",textDecoration:"none",flexShrink:0}}>去发布<ExternalLink size={12}/></a></div>)}</div></div>)}
      </div>}

      {/* DASHBOARD */}
      {tab==="dashboard"&&<div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 24px"}}>效果看板</h1>
        {!stats?<div style={{textAlign:"center",padding:"60px 0"}}><BarChart3 size={40} color="#CBD5E0" style={{marginBottom:12}}/><div style={{fontSize:17,color:"#A0AEC0"}}>暂无数据</div><Btn primary onClick={()=>setTab("monitor")} style={{marginTop:14}}>去采集</Btn></div>:<>
          <div style={{display:"flex",gap:14,marginBottom:24}}><StatCard label="能见度" value={stats.score} color="#38A169" icon={BarChart3}/><StatCard label="提及率" value={stats.mr+"%"} color="#3182CE" icon={Eye}/><StatCard label="首推" value={stats.counts["首推"]} color="#DD6B20" icon={Star}/></div>
          <div style={{display:"flex",gap:14,marginBottom:24}}>
            <Card style={{flex:1,marginBottom:0}}><Label>状态分布</Label><div style={{display:"flex",alignItems:"center",gap:20}}><div style={{width:120,height:120}}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={3} strokeWidth={0}>{pie.map((d,i)=><Cell key={i} fill={ST[d.name].color}/>)}</Pie></PieChart></ResponsiveContainer></div><div style={{flex:1}}>{Object.entries(stats.counts).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginBottom:6}}><span style={{width:8,height:8,borderRadius:3,background:ST[s].color}}/><span style={{color:"#718096",flex:1}}>{s}</span><span style={{fontWeight:700,color:ST[s].color}}>{c}</span></div>)}</div></div></Card>
            <Card style={{flex:1,marginBottom:0}}><Label>平台得分</Label>{PN.map(p=>{const ps=stats.bp[p];return<div key={p} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,fontWeight:600,color:PF[p].color}}>{PF[p].icon} {p}</span><span style={{fontSize:20,fontWeight:700,color:PF[p].color}}>{ps.score}</span></div><div style={{display:"flex",gap:2,height:6,borderRadius:3,overflow:"hidden",background:"#EDF2F7"}}>{["首推","被提及","被引用","未出现"].map(s=>{const t=Object.values(ps.counts).reduce((a,b)=>a+b,0);const pct=t>0?(ps.counts[s]/t*100):0;return pct>0?<div key={s} style={{width:`${pct}%`,background:ST[s].color}}/>:null;})}</div></div>})}</Card>
          </div>
          <Card><Label>状态矩阵</Label><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px"}}><thead><tr><th style={{textAlign:"left",padding:"6px 10px",color:"#A0AEC0",fontSize:13}}>问题</th>{PN.map(p=><th key={p} style={{textAlign:"center",padding:"6px",color:PF[p].color,fontSize:13,width:100}}>{p}</th>)}</tr></thead><tbody>{Object.entries(stats.mx).map(([q,d])=><tr key={q}><td style={{padding:"10px 12px",fontSize:13,color:"#4A5568",background:"#F7FAFC",borderRadius:"8px 0 0 8px",maxWidth:320,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q}</td>{PN.map((p,pi)=><td key={p} style={{textAlign:"center",padding:"8px 4px",background:"#F7FAFC",borderRadius:pi===PN.length-1?"0 8px 8px 0":0}}><Badge status={d[p]}/></td>)}</tr>)}</tbody></table></div></Card>
        </>}
      </div>}

      {/* SETTINGS */}
      {tab==="settings"&&<div style={{maxWidth:600}}>
        <h1 style={{fontSize:28,fontWeight:700,color:"#1A202C",margin:"0 0 28px"}}>设置</h1>
        <Card><div style={{fontSize:12,color:"#A0AEC0",textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>API连接</div><div style={{display:"flex",gap:20,marginTop:14}}>{PN.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:"50%",background:api[am[p]]?"#38A169":"#CBD5E0"}}/><span style={{fontSize:15,color:api[am[p]]?"#2D3748":"#A0AEC0"}}>{p} {api[am[p]]?"✓":"✗"}</span></div>)}</div></Card>
        <Card><Label>品牌名称</Label><div style={{display:"flex",gap:10}}><Input value={brandIn} onChange={e=>setBrandIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBrand()} placeholder="品牌名或公司名" style={{marginBottom:0,flex:1}}/><Btn primary onClick={saveBrand} disabled={!brandIn.trim()}>保存</Btn></div>{brand&&<div style={{marginTop:10,fontSize:14,color:"#38A169"}}><CheckCircle2 size={14} style={{verticalAlign:-3}}/> 当前：{brand}</div>}</Card>
        <Card><Label>竞对品牌</Label><Input value={compIn} onChange={e=>setCompIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const c=compIn.trim();if(c&&!comps.includes(c)){saveComps([...comps,c]);setCompIn("");}}}} placeholder="竞对名，回车添加"/><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{comps.map(c=><span key={c} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#EDF2F7",borderRadius:8,fontSize:13,color:"#4A5568"}}>{c}<button onClick={()=>saveComps(comps.filter(x=>x!==c))} style={{background:"none",border:"none",color:"#A0AEC0",cursor:"pointer",padding:0}}><X size={12}/></button></span>)}</div></Card>
        <Card><Label>引流信息</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><div style={{fontSize:13,color:"#718096",marginBottom:4}}>微信</div><Input value={contactInfo.wechat} onChange={e=>{const v={...contactInfo,wechat:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="微信号"/></div>
            <div><div style={{fontSize:13,color:"#718096",marginBottom:4}}>电话</div><Input value={contactInfo.phone} onChange={e=>{const v={...contactInfo,phone:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="手机号"/></div>
            <div><div style={{fontSize:13,color:"#718096",marginBottom:4}}>官网</div><Input value={contactInfo.website} onChange={e=>{const v={...contactInfo,website:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="官网"/></div>
            <div><div style={{fontSize:13,color:"#718096",marginBottom:4}}>地址</div><Input value={contactInfo.address} onChange={e=>{const v={...contactInfo,address:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="地址"/></div>
          </div>
          <div style={{marginTop:8}}><div style={{fontSize:13,color:"#718096",marginBottom:4}}>引流话术</div><Input value={contactInfo.slogan} onChange={e=>{const v={...contactInfo,slogan:e.target.value};setContactInfo(v);saveContact(v);}} placeholder="如：免费诊断短视频账号"/></div>
          {hasContact&&<div style={{marginTop:12,padding:"12px 16px",background:"#F0FFF4",borderRadius:10,border:"1px solid #C6F6D5"}}><div style={{fontSize:12,color:"#38A169",fontWeight:600,marginBottom:4}}>✅ 文章末尾将添加：</div><div style={{fontSize:13,color:"#718096",whiteSpace:"pre-line",lineHeight:1.5}}>{contactText}</div></div>}
        </Card>
      </div>}
    </div>
  </div>);
}
