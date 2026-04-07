import { useState, useRef, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";

const T = "#08B89C", TD = "#067A68", G = "#F5B01B", D = "#0F1923", CH = "#1A2B3A", M = "#6B7B8D";
const TABS = ["Home","Infographics","Case Studies","Courses","Resources","Dashboard","AI Navigator"];

const CAP_DATA = [
  {yr:"FY15",solar:3.7,wind:23.4},{yr:"FY16",solar:6.8,wind:26.8},{yr:"FY17",solar:12.3,wind:32.3},
  {yr:"FY18",solar:21.7,wind:34.0},{yr:"FY19",solar:28.2,wind:35.6},{yr:"FY20",solar:34.6,wind:37.7},
  {yr:"FY21",solar:40.1,wind:39.2},{yr:"FY22",solar:54.0,wind:40.4},{yr:"FY23",solar:67.1,wind:42.6},
  {yr:"FY24",solar:82.6,wind:46.1},{yr:"FY25",solar:106.3,wind:48.0},{yr:"H1 FY26",solar:129.9,wind:48.5}
];
const TARIFF = [
  {yr:"2017",tariff:2.44,bess:null},{yr:"2018",tariff:2.44,bess:null},{yr:"2019",tariff:2.54,bess:null},
  {yr:"2020",tariff:1.99,bess:null},{yr:"2021",tariff:1.99,bess:4.04},{yr:"2022",tariff:2.20,bess:3.60},
  {yr:"2023",tariff:2.51,bess:3.40},{yr:"2024",tariff:2.15,bess:3.24}
];
const STATE_DATA = [
  {state:"Rajasthan",cap:32100},{state:"Gujarat",cap:20500},{state:"Maharashtra",cap:15800},
  {state:"Karnataka",cap:12800},{state:"Tamil Nadu",cap:11200},{state:"Andhra Pradesh",cap:8500},
  {state:"Telangana",cap:6200},{state:"Madhya Pradesh",cap:5800}
];
const TECH_MIX = [
  {name:"Mono PERC",value:72,color:T},{name:"Poly-Si",value:18,color:G},
  {name:"TOPCon",value:8,color:TD},{name:"HJT+Thin Film",value:2,color:M}
];
const INVEST = [
  {yr:"2019",re:11.2,solar:6.5},{yr:"2020",re:8.6,solar:4.8},{yr:"2021",re:11.3,solar:6.2},
  {yr:"2022",re:14.5,solar:8.4},{yr:"2023",re:16.5,solar:10.2},{yr:"2024",re:19.8,solar:12.5}
];

const AI_SYS = `You are the AI assistant for India's Virtual Resource Centre of Excellence (R-CoE) for Solar Energy, a platform by NISE and GGGI. You answer questions about Indian solar energy: policies, schemes (PM Surya Ghar, PM-KUSUM, Solar Parks), tariffs, regulations, state-wise data, manufacturing, open access, net metering, financing, case studies. Keep answers concise (3-5 sentences max), cite sources like MNRE, KERC, SECI, IREDA. Use actual data: India has 129.9 GW solar (Oct 2025), 500 GW RE target by 2030, lowest tariff ₹2.15/kWh (2024), PM Surya Ghar outlay ₹75,021 Cr with ₹78,000 max subsidy for 3kW, PM-KUSUM 34,800 MW target. For Karnataka open access: charges evolved from waiver (2015-17) to CSS ₹1.08-1.25/kWh (2018-20) to ₹1.35/kWh (2024-25) with 15-day banking limit. Be helpful and specific.`;

function Logo({white,h=28}){
  return <div style={{display:"flex",alignItems:"center",gap:6}}>
    <div style={{width:h,height:h,borderRadius:6,background:white?'rgba(255,255,255,.15)':`${T}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:h*.4,fontWeight:800,color:white?"#fff":T,fontFamily:"Outfit"}}>R</div>
  </div>;
}

function Stat({val,label,sub,gold}){
  return <div style={{textAlign:"center"}}>
    <div style={{fontSize:30,fontWeight:800,fontFamily:"Outfit",color:gold?G:T,lineHeight:1.1}}>{val}</div>
    <div style={{fontSize:12,fontWeight:600,color:D,marginTop:4}}>{label}</div>
    <div style={{fontSize:10,color:M}}>{sub}</div>
  </div>;
}

function Card({children,style,...p}){
  return <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #E8EDEE",transition:"all .2s",...style}} {...p}>{children}</div>;
}

function SH({icon,text}){
  return <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,marginTop:32}}>
    <span style={{fontSize:22}}>{icon}</span>
    <h2 style={{fontFamily:"Outfit",fontSize:20,fontWeight:800,color:D,margin:0}}>{text}</h2>
  </div>;
}

function DataTable({cols,rows}){
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{cols.map((c,i)=><th key={i} style={{background:T,color:"#fff",padding:"8px 12px",textAlign:"left",fontWeight:600,whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=><tr key={i} style={{background:i%2?"#F8FAF9":"#fff"}}>{r.map((c,j)=><td key={j} style={{padding:"7px 12px",borderBottom:"1px solid #EEF1F0"}}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export default function App(){
  const [tab,setTab]=useState(0);
  const [msgs,setMsgs]=useState([{role:"assistant",content:"Welcome to the R-CoE AI Navigator! Ask me anything about Indian solar energy — schemes, policies, tariffs, state-wise data, or regulations."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const chatEnd=useRef(null);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function sendMsg(){
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim()};
    setMsgs(p=>[...p,userMsg]);setInput("");setLoading(true);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:AI_SYS,
          messages:[...msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0),userMsg].slice(-10)})
      });
      const d=await r.json();
      const text=d.content?.map(c=>c.text||"").join("")||"Sorry, I couldn't process that. Please try again.";
      setMsgs(p=>[...p,{role:"assistant",content:text}]);
    }catch(e){setMsgs(p=>[...p,{role:"assistant",content:"Connection error. Please try again."}]);}
    setLoading(false);
  }

  return <div style={{fontFamily:"'DM Sans',sans-serif",color:CH,background:"#FAFBFC",minHeight:"100vh"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

    {/* NAV */}
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid #E8EDEE"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <Logo/> 
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {TABS.map((t,i)=><button key={i} onClick={()=>setTab(i)} style={{padding:"5px 12px",borderRadius:18,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"DM Sans",background:tab===i?T:"transparent",color:tab===i?"#fff":"#5A6B7A",transition:"all .2s"}}>{t}</button>)}
        </div>
      </div>
    </nav>

    {/* HERO */}
    {tab===0&&<div style={{background:`linear-gradient(135deg,${D} 0%,${CH} 50%,${TD} 100%)`,padding:"56px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:400,height:400,background:`radial-gradient(circle,${T}15,transparent 70%)`,borderRadius:"50%"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",position:"relative"}}>
        <div style={{display:"inline-block",background:`${T}20`,border:`1px solid ${T}35`,borderRadius:18,padding:"3px 12px",fontSize:11,color:T,fontWeight:600,marginBottom:16}}>National Knowledge Platform</div>
        <h1 style={{fontFamily:"Outfit",fontSize:44,fontWeight:800,color:"#fff",lineHeight:1.1,marginBottom:14,maxWidth:650}}>Virtual Resource Centre of <span style={{color:G}}>Excellence</span></h1>
        <p style={{fontSize:16,color:"#9AB0C0",maxWidth:560,lineHeight:1.6,marginBottom:24}}>Training, data, AI-powered insights, and practitioner networks for India's solar energy ecosystem — from 130 GW to 500 GW.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setTab(3)} style={{padding:"10px 24px",borderRadius:8,border:"none",background:T,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Outfit"}}>Start Learning</button>
          <button onClick={()=>setTab(6)} style={{padding:"10px 24px",borderRadius:8,border:`2px solid ${T}60`,background:"transparent",color:T,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Outfit"}}>Try AI Navigator</button>
        </div>
      </div>
    </div>}

    {/* STATS - Only on Infographics page */}
    {tab===1&&<div style={{background:"#fff",borderBottom:"1px solid #E8EDEE",padding:"24px 20px"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        <Stat val="129.9 GW" label="Solar Capacity" sub="Oct 2025"/>
        <Stat val="23.8 GW" label="Added FY25" sub="YoY" gold/>
        <Stat val="₹2.15/kWh" label="Lowest Tariff" sub="2024"/>
        <Stat val="500 GW" label="2030 Target" sub="NDC" gold/>
      </div>
    </div>}

    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px"}}>

    {/* HOME */}
    {tab===0&&<div>
      <SH icon="🎯" text="Platform Features"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[{i:"📚",t:"Interactive Learning",d:"6 video course modules with certification — fundamentals to emerging tech."},
          {i:"📊",t:"Data & Dashboards",d:"20-sheet India solar dataset: capacity, tariffs, schemes, manufacturing, investment."},
          {i:"🤖",t:"AI Knowledge Navigator",d:"Ask in natural language about policies, subsidies, regulations. Sourced answers."},
          {i:"📋",t:"Case Study Library",d:"50+ deployment case studies — Bhadla, Pavagada, floating solar, agrivoltaics."},
          {i:"🎓",t:"Certification Engine",d:"Learning paths for technicians, DISCOMs, financiers. Auto-generated certificates."},
          {i:"🤝",t:"Practitioner Network",d:"Peer forums, expert panels, state-level coordination, industry–academia links."}
        ].map((f,i)=><Card key={i}><div style={{fontSize:26,marginBottom:10}}>{f.i}</div><h3 style={{fontFamily:"Outfit",fontSize:15,fontWeight:700,color:D,marginBottom:6}}>{f.t}</h3><p style={{fontSize:12,color:M,lineHeight:1.6}}>{f.d}</p></Card>)}
      </div>
      <SH icon="👥" text="Target Stakeholders"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
        {[["🔧","Technicians"],["⚡","DISCOMs"],["🏗️","Developers"],["🏦","Financiers"],["🚀","Startups"],["🏠","Consumers"]].map(([i,r],k)=>
          <Card key={k} style={{textAlign:"center",padding:14}}><div style={{fontSize:28,marginBottom:4}}>{i}</div><div style={{fontSize:12,fontWeight:700,color:D,fontFamily:"Outfit"}}>{r}</div></Card>
        )}
      </div>
    </div>}

    {/* INFOGRAPHICS */}
    {tab===1&&<div>
      <SH icon="📊" text="Solar Capacity Growth (GW)"/>
      <Card><ResponsiveContainer width="100%" height={300}>
        <AreaChart data={CAP_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#EEF"/><XAxis dataKey="yr" fontSize={11}/><YAxis fontSize={11}/>
          <Tooltip/><Legend/><Area type="monotone" dataKey="solar" stackId="1" stroke={T} fill={T} fillOpacity={.6} name="Solar GW"/>
          <Area type="monotone" dataKey="wind" stackId="1" stroke={G} fill={G} fillOpacity={.4} name="Wind GW"/></AreaChart>
      </ResponsiveContainer></Card>

      <SH icon="📉" text="Tariff Evolution (₹/kWh)"/>
      <Card><ResponsiveContainer width="100%" height={280}>
        <LineChart data={TARIFF}><CartesianGrid strokeDasharray="3 3" stroke="#EEF"/><XAxis dataKey="yr" fontSize={11}/><YAxis fontSize={11} domain={[1.5,4.5]}/>
          <Tooltip/><Legend/><Line type="monotone" dataKey="tariff" stroke={T} strokeWidth={3} name="Solar Tariff" dot={{r:5}}/>
          <Line type="monotone" dataKey="bess" stroke={G} strokeWidth={3} name="Solar+BESS" dot={{r:5}} strokeDasharray="5 5"/></LineChart>
      </ResponsiveContainer></Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
        <div><SH icon="🗺️" text="State-wise Capacity (MW)"/>
          <Card><ResponsiveContainer width="100%" height={280}>
            <BarChart data={STATE_DATA} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#EEF"/><XAxis type="number" fontSize={10}/>
              <YAxis dataKey="state" type="category" fontSize={10} width={90}/><Tooltip/>
              <Bar dataKey="cap" fill={T} radius={[0,4,4,0]} name="Capacity MW"/></BarChart>
          </ResponsiveContainer></Card>
        </div>
        <div><SH icon="⚙️" text="Module Technology Mix"/>
          <Card><ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={TECH_MIX} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({name,value})=>`${name} ${value}%`}>
              {TECH_MIX.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip/></PieChart>
          </ResponsiveContainer></Card>
        </div>
      </div>

      <SH icon="💰" text="RE Investment Trends ($B)"/>
      <Card><ResponsiveContainer width="100%" height={250}>
        <BarChart data={INVEST}><CartesianGrid strokeDasharray="3 3" stroke="#EEF"/><XAxis dataKey="yr" fontSize={11}/><YAxis fontSize={11}/><Tooltip/><Legend/>
          <Bar dataKey="re" fill={T} name="Total RE" radius={[4,4,0,0]}/><Bar dataKey="solar" fill={G} name="Solar Share" radius={[4,4,0,0]}/></BarChart>
      </ResponsiveContainer></Card>

      <SH icon="📜" text="Key Policy & Regulatory Summary"/>
      <Card>
        <DataTable cols={["Policy/Regulation","Key Provision","Status","Impact"]} rows={[
          ["RPO Trajectory","Solar RPO → 10.5% (FY25), 43% RE by 2030","Active","Drives demand for solar procurement"],
          ["BCD on Modules","40% duty on imported solar modules","Since Apr 2022","Boosts domestic manufacturing"],
          ["BCD on Cells","25% duty on imported solar cells","Since Apr 2024","Supports cell manufacturing PLI"],
          ["ALMM Order","Approved List of Models & Manufacturers","Active","Only listed modules in govt projects"],
          ["Green Energy OA Rules","Framework for open access solar (>100 kW)","Active, state variations","Enables industrial/commercial solar"],
          ["Net Metering","Consumer exports surplus to grid","State-specific rules","Key driver for rooftop adoption"],
          ["DCR Norms","Domestic Content Requirement for govt projects","Active","Supports Make in India"],
          ["PM Surya Ghar","₹78K subsidy for 3kW rooftop","Launched Feb 2024","Target: 1 Cr households / 30 GW"],
        ]}/>
      </Card>
    </div>}

    {/* CASE STUDIES */}
    {tab===2&&<div>
      <SH icon="🗂️" text="India Solar Deployment Case Studies"/>
      {[{n:"Bhadla Solar Park",l:"Rajasthan",c:"2,245 MW",a:"56 sq km",y:"2020",tag:"Utility Scale",
          d:"World's largest solar park set record tariff of ₹2.44/kWh. Located in Thar Desert with high irradiance (5.72 kWh/m²/day). Demonstrates viability of desert-scale deployment.",
          lessons:["Ultra-low tariffs achievable at scale","Desert land monetization model","Transmission infrastructure critical","Multi-developer park reduces risk"]},
        {n:"Pavagada Solar Park",l:"Karnataka",c:"2,050 MW",a:"53 sq km",y:"2019",tag:"Land Innovation",
          d:"Innovative land-lease model where farmers retain ownership and earn ₹21,000/acre/year rent. Solved land acquisition challenges that delayed projects elsewhere.",
          lessons:["Land-lease model replicable nationwide","Farmer income supplementation","Reduced social resistance","KPCL as implementing agency model"]},
        {n:"Rewa Ultra Mega Solar",l:"Madhya Pradesh",c:"750 MW",a:"6.4 sq km",y:"2020",tag:"Replicable Model",
          d:"First project to supply a metro city (Delhi Metro). IFC-backed innovative structure with payment security mechanism replicated in 25+ subsequent projects.",
          lessons:["Payment security mechanism essential","Metro/railway offtake model","IFC technical assistance value","Benchmark for ultra-mega projects"]},
        {n:"Khavda Renewable Energy Park",l:"Gujarat",c:"30 GW planned",a:"726 sq km",y:"Under Construction",tag:"Mega Scale",
          d:"World's largest hybrid renewable energy park on the Rann of Kutch. Combines solar + wind at unprecedented scale. Adani Green leads Phase 1 development.",
          lessons:["Hybrid solar+wind improves CUF","Wasteland utilization at scale","Massive transmission buildout needed","Green hydrogen potential"]},
        {n:"NTPC Ramagundam Floating Solar",l:"Telangana",c:"100 MW",a:"Reservoir",y:"2023",tag:"Floating Solar",
          d:"India's largest floating solar installation on a reservoir. Reduces water evaporation by 5%, improves panel efficiency 5-15% through water cooling effect.",
          lessons:["Addresses land scarcity","Water conservation co-benefit","Higher efficiency vs ground-mount","Reservoir infrastructure leverage"]},
        {n:"PM Surya Ghar Programme",l:"Nationwide",c:"7 GW / 20.85L systems",a:"Rooftop",y:"2024-ongoing",tag:"Rooftop",
          d:"World's largest residential rooftop solar programme. ₹75,021 Cr outlay targeting 1 Crore households. Digital portal + DISCOM integration + tiered subsidy structure.",
          lessons:["Digital-first application process","DISCOM integration critical","Tiered subsidy effective","Vendor empanelment quality control"]}
      ].map((c,i)=><Card key={i} style={{marginBottom:16,borderLeft:`4px solid ${i%2?G:T}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <h3 style={{fontFamily:"Outfit",fontSize:17,fontWeight:700,color:D,margin:0}}>{c.n}</h3>
          <span style={{fontSize:10,fontWeight:700,background:`${T}12`,color:T,padding:"2px 8px",borderRadius:10,whiteSpace:"nowrap"}}>{c.tag}</span>
        </div>
        <div style={{fontSize:12,fontWeight:600,color:T,margin:"6px 0 10px"}}>{c.l} · {c.c} · {c.a} · {c.y}</div>
        <p style={{fontSize:13,color:M,lineHeight:1.6,marginBottom:12}}>{c.d}</p>
        <div style={{fontSize:12,fontWeight:600,color:D,marginBottom:6}}>Key Lessons:</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
          {c.lessons.map((l,j)=><div key={j} style={{fontSize:11,color:M,padding:"3px 0"}}>✓ {l}</div>)}
        </div>
      </Card>)}
    </div>}

    {/* COURSES */}
    {tab===3&&<div>
      <SH icon="🎓" text="Course Catalog"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[{i:"☀️",t:"Solar Fundamentals",d:"PV technology, solar radiation, system components, types of installations",l:"Beginner",h:"2 hrs",modules:["Solar Cell Physics","PV System Types","Solar Resource Assessment","Balance of System"]},
          {i:"🔧",t:"System Design & Installation",d:"Residential & commercial sizing, safety codes, net metering setup",l:"Intermediate",h:"4 hrs",modules:["Load Analysis","System Sizing","Installation Safety","Net Metering Configuration"]},
          {i:"🔋",t:"Energy Storage & Grid Integration",d:"BESS technologies, hybrid systems, smart grid applications",l:"Advanced",h:"3 hrs",modules:["Battery Technologies","Hybrid System Design","Grid Integration","SCADA & Monitoring"]},
          {i:"💰",t:"Solar Economics & Finance",d:"Project IRR, PPAs, IREDA financing, bankability assessment",l:"Intermediate",h:"2.5 hrs",modules:["Financial Modeling","PPA Structures","IREDA Schemes","Risk Assessment"]},
          {i:"🛠️",t:"O&M & Troubleshooting",d:"Performance monitoring, fault diagnosis, degradation analysis",l:"Intermediate",h:"2 hrs",modules:["Performance Ratio","IV Curve Tracing","Thermal Imaging","Degradation Analysis"]},
          {i:"📜",t:"Policy & Regulatory Framework",d:"RPO, net metering, BCD, ALMM, DCR, state regulations",l:"All Levels",h:"2 hrs",modules:["Central Policies","State Regulations","Open Access Rules","Incentive Schemes"]}
        ].map((c,i)=><Card key={i}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:42,height:42,borderRadius:10,background:`${i%2?G:T}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.i}</div>
            <div style={{flex:1}}><div style={{fontFamily:"Outfit",fontSize:15,fontWeight:700,color:D}}>{c.t}</div><div style={{fontSize:11,color:M,marginTop:2}}>{c.d}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,fontWeight:700,color:T,background:`${T}10`,padding:"2px 8px",borderRadius:8,marginBottom:3}}>{c.l}</div><div style={{fontSize:10,color:M}}>{c.h}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {c.modules.map((m,j)=><div key={j} style={{fontSize:11,color:CH,padding:"4px 8px",background:"#F6F8F7",borderRadius:6}}>Module {j+1}: {m}</div>)}
          </div>
        </Card>)}
      </div>
    </div>}

    {/* RESOURCES */}
    {tab===4&&<div>
      <SH icon="📦" text="Technical Guides"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[{i:"📄",t:"Design Manual",d:"Solar system design from 1kW to utility scale"},{i:"🔒",t:"Safety Guidelines",d:"Installation safety, electrical codes, BIS standards"},
          {i:"🔧",t:"O&M Best Practices",d:"Maintenance schedules, cleaning, performance monitoring"},{i:"📊",t:"Economic Templates",d:"Financial models, ROI calculators, tariff analysis"}
        ].map((r,i)=><Card key={i} style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>{r.i}</div><div style={{fontFamily:"Outfit",fontSize:13,fontWeight:700,color:D,marginBottom:3}}>{r.t}</div><div style={{fontSize:11,color:M}}>{r.d}</div></Card>)}
      </div>
      <SH icon="🧮" text="Calculation Tools"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[{i:"🌤️",t:"Solar Irradiance",d:"Location-wise GHI/DNI data for India"},{i:"📐",t:"System Sizing",d:"Calculate optimal kW for your consumption"},
          {i:"💹",t:"ROI Analyzer",d:"Payback period, IRR, LCOE calculator"},{i:"⚡",t:"Yield Estimator",d:"Annual generation estimate by location"}
        ].map((r,i)=><Card key={i} style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>{r.i}</div><div style={{fontFamily:"Outfit",fontSize:13,fontWeight:700,color:D,marginBottom:3}}>{r.t}</div><div style={{fontSize:11,color:M}}>{r.d}</div></Card>)}
      </div>
      <SH icon="📜" text="Policy Repository"/>
      <Card>
        <DataTable cols={["Document","Type","Source","Year","Key Provision"]} rows={[
          ["PM Surya Ghar Guidelines","Scheme","MNRE","2024","₹78K subsidy for 3kW rooftop, 1 Cr household target"],
          ["PM-KUSUM Guidelines","Scheme","MNRE","2019","34,800 MW: grid plants + standalone + solarized pumps"],
          ["Green Energy OA Rules","Regulation","MoP","2022","Open access for >100 kW loads, streamlined approval"],
          ["RPO & REC Framework","Regulation","CERC","2024","Solar RPO 10.5% FY25, trajectory to 43% by 2030"],
          ["ALMM Order","Regulation","MNRE","2021","Mandatory use of approved modules in govt projects"],
          ["BCD Notification","Tariff","MoF","2022","40% on modules, 25% on cells (from Apr 2024)"],
          ["Solar Park Scheme 2.0","Scheme","MNRE","2020","40 GW target, 55 parks, ₹25L/MW CFA"],
          ["PLI for Solar PV","Scheme","MNRE","2023","₹24,000 Cr for integrated cell+module manufacturing"],
        ]}/>
      </Card>
      <SH icon="📊" text="Research Data"/>
      <Card>
        <DataTable cols={["Dataset","Source","Coverage","Update Freq"]} rows={[
          ["State-wise RE Capacity","MNRE","All states, FY14-FY26","Monthly"],
          ["Solar Tariff History","Mercom/SECI","2017-2024 auctions","Per auction"],
          ["Grid Emission Factors","CEA","FY14-FY25","Annual"],
          ["RE Employment Data","IRENA","Global + India","Annual"],
          ["Solar Manufacturing","MNRE/Industry","Cell + Module capacity","Quarterly"],
          ["Investment & FDI","BNEF/IEEFA","RE investment flows","Annual"],
          ["PM Surya Ghar Progress","MNRE Portal","State-wise installations","Daily"],
          ["Tender Pipeline","SECI/DISCOMs","Upcoming 50,000+ MW","Weekly"],
        ]}/>
      </Card>
    </div>}

    {/* DASHBOARD */}
    {tab===5&&<div>
      <SH icon="📊" text="Live Dashboard"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:16}}>
        {[{l:"Solar Capacity",v:"129.9 GW",d:"↑ +23.8 GW YoY"},{l:"Lowest Tariff",v:"₹2.15/kWh",d:"→ Waaree, 2024"},
          {l:"RE Investment",v:"$19.8B",d:"↑ +20% vs 2023"},{l:"Module Mfg.",v:"85 GW",d:"↑ Cell: 45 GW"}
        ].map((m,i)=><Card key={i}><div style={{fontSize:10,fontWeight:600,color:M}}>{m.l}</div><div style={{fontSize:24,fontWeight:800,fontFamily:"Outfit",color:T}}>{m.v}</div><div style={{fontSize:10,color:i%2?G:"#2ECC71",marginTop:3}}>{m.d}</div></Card>)}
      </div>

      <SH icon="🗺️" text="State × Year Capacity Matrix (GW)"/>
      <Card>
        <DataTable cols={["State","Mar-20","Mar-21","Mar-22","Mar-23","Mar-24","Mar-25","Oct-25"]} rows={[
          ["Rajasthan","5.5","7.7","14.3","17.6","20.8","28.5","32.1"],
          ["Gujarat","3.0","4.0","8.2","10.5","13.8","18.2","20.5"],
          ["Maharashtra","1.8","2.3","5.4","8.1","10.7","14.0","15.8"],
          ["Karnataka","7.4","7.7","8.6","8.9","9.6","11.5","12.8"],
          ["Tamil Nadu","4.3","5.2","6.4","7.4","8.3","10.1","11.2"],
          ["Andhra Pradesh","3.6","4.2","4.6","5.0","5.5","7.2","8.5"],
        ]}/>
      </Card>

      <SH icon="🏭" text="Manufacturing Capacity Tracker"/>
      <Card>
        <DataTable cols={["Company","Module GW","Cell GW","Status","PLI Beneficiary"]} rows={[
          ["Waaree Energies","12","5.4","Expanding","Yes"],
          ["Adani Solar","10","4","Integrated","Yes"],
          ["Tata Power Solar","4.3","1.5","Expanding","Yes"],
          ["Premier Energies","3.8","2.5","IPO completed","Yes"],
          ["Vikram Solar","3.5","1.2","Operational","Yes"],
          ["Renewsys","2.5","0.8","Operational","No"],
          ["Goldi Solar","2.5","1.0","Expanding","No"],
          ["Total India","85","45","Growing 30% YoY","16 companies"],
        ]}/>
      </Card>

      <SH icon="📋" text="Tender Pipeline (FY26)"/>
      <Card>
        <DataTable cols={["Agency","Capacity MW","Type","Status"]} rows={[
          ["SECI","15,000","ISTS Solar","Under Bidding"],
          ["SECI","5,000","Solar+BESS","Awarded"],
          ["GUVNL","3,000","State Solar","Under Bidding"],
          ["MSEDCL","2,500","Rooftop","Implementation"],
          ["NTPC","4,000","Solar","Awarded"],
          ["Others","20,500+","Various","Various"],
          ["Total Pipeline","50,000+","All agencies","FY26"],
        ]}/>
      </Card>
    </div>}

    {/* AI NAVIGATOR */}
    {tab===6&&<div>
      <SH icon="🤖" text="AI Knowledge Navigator"/>
      <p style={{fontSize:13,color:M,marginBottom:4}}>Ask about solar policies, schemes, tariffs, state data, open access charges, or any solar energy topic.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,marginTop:12}}>
        <Card style={{padding:0,display:"flex",flexDirection:"column",height:480}}>
          <div style={{background:T,padding:"10px 16px",borderRadius:"12px 12px 0 0",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🤖</span><span style={{fontFamily:"Outfit",fontSize:13,fontWeight:700,color:"#fff"}}>R-CoE AI Navigator</span>
          </div>
          <div style={{flex:1,overflow:"auto",padding:14}}>
            {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
              <div style={{maxWidth:"80%",padding:"9px 13px",fontSize:12,lineHeight:1.5,borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",
                background:m.role==="user"?G:"#fff",color:m.role==="user"?"#fff":CH,fontWeight:m.role==="user"?600:400,
                boxShadow:"0 1px 4px rgba(0,0,0,.06)",whiteSpace:"pre-wrap"}}>{m.content}</div>
            </div>)}
            {loading&&<div style={{display:"flex",justifyContent:"flex-start",marginBottom:10}}><div style={{padding:"9px 13px",fontSize:12,background:"#fff",borderRadius:"12px 12px 12px 3px",color:M,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>Thinking...</div></div>}
            <div ref={chatEnd}/>
          </div>
          <div style={{padding:10,borderTop:"1px solid #E8EDEE",display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}
              placeholder="Ask about solar energy..." style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #DDE",fontSize:12,fontFamily:"DM Sans",outline:"none"}}/>
            <button onClick={sendMsg} disabled={loading} style={{padding:"8px 16px",borderRadius:8,border:"none",background:T,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Outfit",opacity:loading?.6:1}}>Send</button>
          </div>
        </Card>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:D,marginBottom:8,fontFamily:"Outfit"}}>Try asking:</div>
          {["What are my options to install rooftop solar?","How much does a 3kW system cost with subsidy?","Summarize Karnataka open access charges evolution","What is the PM-KUSUM scheme?","Compare solar tariffs 2017 vs 2024","Which states lead in solar capacity?","What are the latest SECI tender results?","Explain RPO trajectory for 2030"
          ].map((q,i)=><div key={i} onClick={()=>{setInput(q);}} style={{fontSize:11,color:T,padding:"6px 10px",background:`${T}08`,borderRadius:8,marginBottom:4,cursor:"pointer",border:`1px solid ${T}15`,transition:"all .15s"}}
            onMouseEnter={e=>e.target.style.background=`${T}18`} onMouseLeave={e=>e.target.style.background=`${T}08`}>{q}</div>)}
        </div>
      </div>
    </div>}

    </div>

    {/* FOOTER */}
    <footer style={{background:D,padding:"28px 20px",marginTop:32}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><Logo white h={24}/><span style={{fontSize:11,color:"#5A7B6A"}}>Virtual Resource Centre of Excellence for Solar Energy</span></div>
        <div style={{fontSize:10,color:"#4A6B5A"}}>Prototype · Data as of Dec 2025</div>
      </div>
    </footer>
  </div>;
}
