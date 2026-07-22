import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{_n as r,t as i}from"./button-CFq-rqtk.js";import{i as a,n as o}from"./fileRoute-uDG0Xyjp.js";import{t as s}from"./alert-CGiQH5vG.js";import{n as c,t as l}from"./table-DkLjcNMp.js";import{t as u}from"./message-DYXrK1o7.js";import{t as d}from"./modal-DMA9f847.js";import{t as f}from"./card-B51hGroe.js";import{t as p}from"./empty-gsSFBrQl.js";import{t as m}from"./tabs-CNPr8l-V.js";import{t as h}from"./descriptions-DJZZQ6IV.js";import{t as g}from"./form-CTexRMCX.js";import{t as _}from"./input-NJCky5ev.js";import{t as v}from"./tag-CC1OK38A.js";import{t as y}from"./timeline-CXy3m4DU.js";import{t as b}from"./projects-qdAyCCTg.js";import{t as x}from"./useRole-Di0cTDpa.js";import{t as S}from"./evaluationStore-CBU2ttFo.js";import{t as ee}from"./ProjectList-CD2DsNCW.js";import{t as te}from"./ProjectEntryGuard-NPnDDuN9.js";import{t as ne}from"./expertStore-rBAA_MJZ.js";var C=e(t(),1),w=n(),T=[`专家甲`,`专家乙`,`专家丙`],E=[{rank:1,name:`C股份有限公司`,business:28,tech:36,price:29,total:93,recommend:`推荐中标`},{rank:2,name:`A科技有限公司`,business:27,tech:34,price:28,total:89,recommend:`备选`},{rank:3,name:`B实业有限公司`,business:26,tech:31,price:27,total:84,recommend:`备选`}],D=[{name:`D有限公司`,reason:`未按要求加盖电子签章，投标文件无效。`}],O={evaluating:{label:`评标中`,color:`processing`},submitted:{label:`评标结果已提交`,color:`success`},confirmed:{label:`评标结果已确认`,color:`success`}};function EvaluationHall(){let e=r(),t=a({strict:!1}).projectId,{role:n,roleName:o,userName:k}=x();(0,C.useMemo)(()=>b.getProjectById(t)||ee.find(e=>String(e.id)===String(t))||null,[t]);let[A,j]=(0,C.useState)(()=>S.getEval(t)),[M,re]=(0,C.useState)(()=>S.getSubmittedInfo(t)),reload=()=>{j(S.getEval(t)),re(S.getSubmittedInfo(t))},N=(0,C.useMemo)(()=>{let e=[];return(ne.getResult(t)?.experts||[]).forEach(t=>{t?.name&&!e.includes(t.name)&&e.push(t.name)}),Object.keys(A.experts||{}).forEach(t=>{e.includes(t)||e.push(t)}),e.length===0&&e.push(...T),e},[A,t]),P=A.leader||(N.includes(`专家甲`)?`专家甲`:N[0]),F=n===`expert`,I=F&&k===P,L=n===`tenderee`,R=n===`agent`,z=n===`supervisor`,B=O[A.status]||O.evaluating,V=A.deadline||`2026-07-15 18:00`,[H,U]=(0,C.useState)(I?`summary`:`progress`),[W,G]=(0,C.useState)([]),[K,q]=(0,C.useState)(()=>({opinion:A.report?.content||`经评标委员会评审，C股份有限公司综合得分最高，技术方案满足招标文件要求，报价合理，推荐为中标候选人。`,recommend:A.report?.candidates?.[0]||`C股份有限公司`})),J=(0,C.useMemo)(()=>N.map(e=>{let t=A.experts?.[e];return{name:e,isLeader:e===P,me:e===k,submitted:!!t?.submitted,submittedAt:t?.submittedAt||`-`,signed:!!t?.signed}}),[N,A,P,k]),Y=J.filter(e=>!e.submitted).map(e=>e.name),X=(0,C.useMemo)(()=>{let e=Object.values(A.experts||{}).filter(e=>e?.submitted&&e?.scores);if(e.length===0)return{real:!1,items:[{key:`business`,title:`商务标（30）`},{key:`tech`,title:`技术标（40）`},{key:`price`,title:`价格标（30）`}],rows:E};let t=[...new Set(e.flatMap(e=>Object.values(e.scores).flatMap(e=>Object.keys(e||{}))))],n=[...new Set(e.flatMap(e=>Object.keys(e.scores)))].map(n=>{let r={name:n},i=0;return t.forEach(t=>{let a=e.map(e=>Number(e.scores?.[n]?.[t])).filter(e=>!Number.isNaN(e)),o=a.length?Math.round(a.reduce((e,t)=>e+t,0)/a.length*10)/10:0;r[t]=o,i+=o}),r.total=Math.round(i*10)/10,r});return n.sort((e,t)=>t.total-e.total),n.forEach((e,t)=>{e.rank=t+1,e.recommend=t===0?`推荐中标`:`备选`}),{real:!0,items:t.map(e=>({key:e,title:`${e}（均值）`})),rows:n}},[A]),addOperationRecord=(e,t)=>{G(n=>[{id:Date.now(),action:e,detail:t,time:new Date().toLocaleString()},...n])},saveReport=()=>{S.updateEval(t,e=>{e.report={id:e.report?.id||`RPT-${t}`,version:e.report?.version||`V1.0`,content:K.opinion,candidates:K.recommend?[K.recommend]:[],createdAt:new Date().toLocaleString(),createdBy:k,archived:!1}}),reload(),addOperationRecord(`保存报告`,`评标委员会意见及推荐中标候选人已保存`),u.success(`评标报告已保存`)},submitResult=()=>{M.allSubmitted&&d.confirm({title:`提交评标结果确认`,content:`共 ${M.total} 名专家均已提交评分。提交后评标结果将进入中标公示流程，确认提交吗？`,okText:`确认提交`,cancelText:`取消`,onOk:()=>{S.updateEval(t,e=>{e.status=`submitted`}),reload(),addOperationRecord(`提交评标结果`,`评标结果已提交，进入中标公示流程`),u.success(`评标结果已提交，进入中标公示流程`)}})},goExpertProject=()=>{e({to:`/admin/expert-project`,search:{projectId:t}})},ie=[{title:`排名`,dataIndex:`rank`,width:80},{title:`投标人`,dataIndex:`name`,minWidth:200},...X.items.map(e=>({title:e.title,dataIndex:e.key,width:130})),{title:`总分`,dataIndex:`total`,width:100,render:e=>(0,w.jsx)(`strong`,{style:{color:`#409EFF`},children:e})},{title:`推荐意见`,dataIndex:`recommend`,width:120,render:e=>(0,w.jsx)(v,{color:e===`推荐中标`?`success`:`default`,children:e})}],ae=[{title:`专家`,dataIndex:`name`,render:(e,t)=>(0,w.jsxs)(w.Fragment,{children:[e,t.isLeader&&(0,w.jsx)(v,{color:`gold`,style:{marginLeft:8},children:`组长`}),t.me&&(0,w.jsx)(v,{color:`processing`,style:{marginLeft:8},children:`我`})]})},{title:`提交状态`,dataIndex:`submitted`,width:120,render:e=>(0,w.jsx)(v,{color:e?`success`:`warning`,children:e?`已提交`:`待提交`})},{title:`提交时间`,dataIndex:`submittedAt`,width:200},{title:`签名`,dataIndex:`signed`,width:100,render:e=>e?(0,w.jsx)(v,{color:`success`,children:`已签名`}):(0,w.jsx)(v,{children:`未签名`})}],Z={key:`summary`,label:`评分汇总`,children:(0,w.jsxs)(w.Fragment,{children:[!X.real&&(0,w.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`当前为演示汇总数据：尚无专家提交真实评分，提交后此处自动切换为评分项均值汇总。`,style:{marginBottom:16}}),(0,w.jsx)(l,{columns:ie,dataSource:X.rows,rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}}),(0,w.jsxs)(`div`,{className:`chart-mock`,children:[(0,w.jsx)(`h4`,{children:`得分对比`}),(0,w.jsx)(`div`,{className:`bars`,children:X.rows.map(e=>(0,w.jsxs)(`div`,{className:`bar-item`,children:[(0,w.jsx)(`span`,{className:`bar-name`,children:e.name}),(0,w.jsx)(`div`,{className:`bar-track`,children:(0,w.jsx)(`div`,{className:`bar-fill`,style:{width:`${e.total}%`}})}),(0,w.jsx)(`span`,{className:`bar-value`,children:e.total})]},e.name))})]})]})},Q={key:`progress`,label:`评审进度`,children:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsxs)(h,{column:3,style:{marginBottom:16},children:[(0,w.jsx)(h.Item,{label:`评标组长`,children:P}),(0,w.jsx)(h.Item,{label:`专家人数`,children:N.length}),(0,w.jsxs)(h.Item,{label:`已提交`,children:[M.submitted,`/`,M.total||N.length]})]}),(0,w.jsx)(l,{columns:ae,dataSource:J,rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}})]})},$={key:`reject`,label:`否决投标`,children:D.length===0?(0,w.jsx)(p,{description:`暂无否决投标`}):D.map((e,t)=>(0,w.jsx)(s,{title:`${e.name}：${e.reason}`,type:`error`,closable:!1,style:{marginBottom:12}},t))},oe={key:`report`,label:`评标报告`,children:(0,w.jsxs)(g,{layout:`vertical`,children:[(0,w.jsx)(g.Item,{label:`评标委员会意见`,children:(0,w.jsx)(_.TextArea,{rows:6,placeholder:`汇总评标委员会整体意见...`,value:K.opinion,onChange:e=>q(t=>({...t,opinion:e.target.value}))})}),(0,w.jsx)(g.Item,{label:`推荐中标候选人`,children:(0,w.jsx)(c.Group,{value:K.recommend,onChange:e=>q(t=>({...t,recommend:e.target.value})),children:X.rows.map(e=>(0,w.jsxs)(c,{value:e.name,children:[e.name,`（`,e.total,`分）`]},e.name))})}),(0,w.jsx)(g.Item,{children:(0,w.jsx)(i,{type:`primary`,onClick:saveReport,children:`保存报告`})})]})},se={key:`report`,label:`评标报告`,children:A.report?(0,w.jsxs)(h,{column:1,bordered:!0,children:[(0,w.jsx)(h.Item,{label:`报告编号`,children:A.report.id}),(0,w.jsx)(h.Item,{label:`版本`,children:A.report.version}),(0,w.jsx)(h.Item,{label:`评标委员会意见`,children:A.report.content}),(0,w.jsx)(h.Item,{label:`推荐中标候选人`,children:(A.report.candidates||[]).join(`、`)||`—`}),(0,w.jsxs)(h.Item,{label:`生成信息`,children:[A.report.createdBy,` · `,A.report.createdAt]})]}):(0,w.jsx)(p,{description:`评标报告尚未生成`})},ce=I?[Z,Q,$,oe]:F?[Q,Z]:[Q,Z,$,se];return t?(0,w.jsxs)(`div`,{className:`evaluation-hall`,children:[(0,w.jsxs)(f,{title:(0,w.jsxs)(`div`,{className:`hall-header`,children:[(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`h2`,{children:`评标大厅`}),(0,w.jsxs)(`p`,{className:`subtitle`,children:[`XX市轨道交通设备采购项目 · 标段一：主设备 · 项目ID：`,t]})]}),(0,w.jsxs)(`div`,{className:`hall-meta`,children:[(0,w.jsx)(v,{color:B.color,style:{fontSize:14,padding:`4px 12px`},children:B.label}),(0,w.jsxs)(v,{color:I?`gold`:`default`,style:{fontSize:14,padding:`4px 12px`},children:[o,I?`（组长）`:``]}),(0,w.jsx)(i,{onClick:reload,children:`刷新状态`}),I&&A.status!==`submitted`&&A.status!==`confirmed`&&(0,w.jsx)(i,{type:`primary`,disabled:!M.allSubmitted,onClick:submitResult,children:`提交评标结果`})]})]}),children:[I?M.allSubmitted?(0,w.jsx)(s,{type:`success`,showIcon:!0,closable:!1,title:`全部 ${M.total} 名专家已提交评分，可提交评标结果。`,style:{marginBottom:20}}):(0,w.jsx)(s,{type:`warning`,showIcon:!0,closable:!1,title:`您是评标组长，可在全部专家提交后提交评标结果`,description:`未提交专家：${Y.join(`、`)||`—`}。`,style:{marginBottom:20}}):F?(0,w.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`您是评标委员会成员，本页仅可查看评标进度与本人提交状态`,description:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`span`,{style:{marginRight:12},children:`评分与签名请在「评标项目」中完成。`}),(0,w.jsx)(i,{type:`primary`,size:`small`,onClick:goExpertProject,children:`前往评分`})]}),style:{marginBottom:20}}):L?(0,w.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`招标人只读视图：可查看评标进度、评分汇总与评标报告，无操作权限。`,style:{marginBottom:20}}):R?(0,w.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`招标代理只读视图：可查看评标进度与评分汇总；提交评标结果由评标组长完成。`,style:{marginBottom:20}}):z?(0,w.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`监督人员只读视图：全程监督评标过程，不参与评分与提交。`,style:{marginBottom:20}}):null,(0,w.jsxs)(f,{size:`small`,title:`当前状态与下一步`,style:{marginBottom:20,background:`#f6ffed`},children:[(0,w.jsxs)(h,{column:2,children:[(0,w.jsx)(h.Item,{label:`当前阶段`,children:B.label}),(0,w.jsx)(h.Item,{label:`评标截止`,children:V}),(0,w.jsxs)(h.Item,{label:`专家提交进度`,children:[M.submitted,`/`,M.total||N.length,` 已提交`]}),(0,w.jsx)(h.Item,{label:`下一步`,children:I?A.status===`submitted`||A.status===`confirmed`?(0,w.jsx)(`span`,{children:`评标结果已提交，进入中标公示流程`}):M.allSubmitted?(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`span`,{style:{marginRight:12},children:`提交评标结果`}),(0,w.jsx)(i,{type:`primary`,size:`small`,onClick:submitResult,children:`提交结果`})]}):(0,w.jsx)(`span`,{children:`等待所有专家完成评分并提交`}):F?(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`span`,{style:{marginRight:12},children:`前往「评标项目」完成本人评分`}),(0,w.jsx)(i,{type:`primary`,size:`small`,onClick:goExpertProject,children:`去评分`})]}):A.status===`submitted`||A.status===`confirmed`?(0,w.jsx)(`span`,{children:`评标结果已提交，进入中标公示流程`}):(0,w.jsx)(`span`,{children:`等待评标委员会完成评审（只读）`})})]}),!M.allSubmitted&&(0,w.jsx)(s,{title:`阻断原因：尚有 ${Y.length} 名专家评分未提交（${Y.join(`、`)}），需所有专家提交后方可发布评标结果。`,type:`warning`,showIcon:!0,closable:!1,style:{marginTop:12}})]}),(0,w.jsx)(m,{type:`card`,activeKey:H,onChange:U,items:ce}),W.length>0&&(0,w.jsx)(f,{size:`small`,title:`操作记录`,style:{marginTop:20},children:(0,w.jsx)(y,{items:W.map(e=>({key:e.id,color:`blue`,content:(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`strong`,{children:e.action}),(0,w.jsx)(`span`,{style:{color:`#999`,marginLeft:12,fontSize:12},children:e.time}),(0,w.jsx)(`p`,{style:{margin:`4px 0 0`,color:`#666`},children:e.detail})]})}))})})]}),(0,w.jsx)(`style`,{children:`
        .evaluation-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .evaluation-hall .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .evaluation-hall .hall-header h2 {
          margin: 0;
        }
        .evaluation-hall .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .evaluation-hall .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .evaluation-hall .chart-mock {
          margin-top: 24px;
          padding: 20px;
          background: #f9fafc;
          border-radius: 8px;
        }
        .evaluation-hall .chart-mock h4 {
          margin-bottom: 16px;
        }
        .evaluation-hall .bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .evaluation-hall .bar-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .evaluation-hall .bar-name {
          width: 160px;
          font-size: 14px;
          color: #333;
        }
        .evaluation-hall .bar-track {
          flex: 1;
          height: 20px;
          background: #e4e7ed;
          border-radius: 10px;
          overflow: hidden;
        }
        .evaluation-hall .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #409EFF, #67C23A);
          border-radius: 10px;
          transition: width 0.5s;
        }
        .evaluation-hall .bar-value {
          width: 40px;
          text-align: right;
          font-weight: bold;
        }
      `})]}):(0,w.jsx)(te,{})}var k=o(`/admin/evaluation-hall`)({component:EvaluationHall});export{k as Route};