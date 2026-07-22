import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{_n as r,t as i}from"./button-CFq-rqtk.js";import{i as a,n as o}from"./fileRoute-uDG0Xyjp.js";import{t as s}from"./alert-CGiQH5vG.js";import{t as c}from"./table-DkLjcNMp.js";import{t as l}from"./message-DYXrK1o7.js";import{t as u}from"./card-B51hGroe.js";import{t as d}from"./descriptions-DJZZQ6IV.js";import{t as f}from"./result-Bd08NkOb.js";import{t as p}from"./steps-C3fNpjyk.js";import{t as m}from"./tag-CC1OK38A.js";import{t as h}from"./timeline-CXy3m4DU.js";import{t as g}from"./projects-qdAyCCTg.js";import{t as _}from"./useRole-Di0cTDpa.js";import{c as v,l as y,t as b}from"./ProjectList-CD2DsNCW.js";import{t as x}from"./ProjectEntryGuard-NPnDDuN9.js";import{t as S}from"./quoteStore-BxU7Z55i.js";import{t as C}from"./StatusTag-DLAicr-g.js";var w=e(t(),1),T=n(),E=[{name:`A科技有限公司`,totalPrice:128,deliveryPeriod:`合同签订后 15 个日历日`,warrantyPeriod:`3 年`,savedAt:`2026-07-19 10:00`},{name:`B实业有限公司`,totalPrice:132,deliveryPeriod:`合同签订后 10 个日历日`,warrantyPeriod:`3 年`,savedAt:`2026-07-19 11:30`},{name:`C股份有限公司`,totalPrice:125,deliveryPeriod:`合同签订后 20 个日历日`,warrantyPeriod:`2 年`,savedAt:`2026-07-19 14:20`}];function ComparisonHall(){let e=r(),t=a({strict:!1}).projectId,{role:n,roleName:o,userName:D}=_(),O=(0,w.useMemo)(()=>g.getProjectById(t)||b.find(e=>String(e.id)===String(t))||null,[t]),k=y(O),[A,j]=(0,w.useState)(0),[M,N]=(0,w.useState)([]),P=[`tenderee`,`agent`].includes(n),F=n===`bidder`,I=P?`warning`:`default`,L=(0,w.useMemo)(()=>{let e=S.getQuotes(),n=Object.entries(e).filter(([e])=>e.startsWith(`${t}::`)).map(([e,t])=>({name:e.split(`::`)[1],totalPrice:t?.quote?.totalPrice??`-`,deliveryPeriod:t?.quote?.deliveryPeriod??`-`,warrantyPeriod:t?.quote?.warrantyPeriod??`-`,savedAt:t?.savedAt??`-`}));return n.length>0?n:E},[t]),R=(0,w.useMemo)(()=>[...L].sort((e,t)=>{let n=Number(e.totalPrice),r=Number(t.totalPrice);return Number.isNaN(n)?1:Number.isNaN(r)?-1:n-r}),[L]),z=(0,w.useMemo)(()=>F?R.filter(e=>e.name===D):R,[R,F,D]),B=R[0],addOperationRecord=(e,t)=>{N(n=>[{id:`${e}-${n.length}-${t}`,action:e,detail:t,operator:D||`-`,time:new Date().toLocaleString()},...n])},nextStage=()=>{j(e=>{let t=Math.min(e+1,2);return t!==e&&t===1&&addOperationRecord(`报价比较`,`已按总价升序生成报价比较表，共 ${L.length} 家供应商`),t})},prevStage=()=>{j(e=>Math.max(e-1,0))},finishComparison=()=>{j(2),addOperationRecord(`比价完成`,`比价结果已生成（推荐：${B?.name||`-`}，报价 ${B?.totalPrice??`-`} 万元），可进入评标大厅`),l.success(`比价完成，比价结果已生成，请进入评标大厅`)},goEvaluate=()=>{e({to:`/admin/evaluation-hall`,search:{projectId:t}})};return t?k?(0,T.jsxs)(`div`,{className:`comparison-hall`,children:[(0,T.jsxs)(u,{title:(0,T.jsxs)(`div`,{className:`hall-header`,children:[(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h2`,{children:`比价大厅`}),(0,T.jsxs)(`p`,{className:`subtitle`,children:[O?.name||`-`,` · 采购方式：`,v(O),` · 项目ID：`,t]})]}),(0,T.jsxs)(`div`,{className:`hall-meta`,children:[(0,T.jsx)(m,{color:`purple`,style:{fontSize:14,padding:`4px 12px`},children:`询比族项目`}),(0,T.jsx)(m,{color:I,style:{fontSize:14,padding:`4px 12px`},children:o})]})]}),children:[(0,T.jsx)(p,{current:A,items:[{title:`报价汇总`,description:`确认各供应商报价响应`},{title:`报价比较`,description:`按总价/交货期/质保期比较`},{title:`比价完成`,description:`生成比价结果，进入评标`}]}),(0,T.jsx)(u,{size:`small`,title:`当前状态与下一步`,style:{marginTop:24,marginBottom:24,background:`#f6ffed`},children:(0,T.jsxs)(d,{column:2,children:[(0,T.jsx)(d.Item,{label:`当前阶段`,children:[`报价汇总`,`报价比较`,`比价完成`][A]}),(0,T.jsxs)(d.Item,{label:`供应商数量`,children:[L.length,` 家`]}),(0,T.jsx)(d.Item,{label:`当前状态`,children:(0,T.jsx)(m,{color:A===2?`success`:`processing`,children:A===2?`比价完成`:`进行中`})}),(0,T.jsx)(d.Item,{label:`下一步`,children:A===2?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`span`,{style:{marginRight:12},children:`进入评标大厅`}),(0,T.jsx)(i,{type:`primary`,size:`small`,onClick:goEvaluate,children:`去评标`})]}):A===0?(0,T.jsx)(`span`,{children:`确认各供应商报价已汇总`}):(0,T.jsx)(`span`,{children:`比较各供应商报价并生成比价结果`})})]})}),(0,T.jsxs)(`div`,{className:`stage-panel`,children:[A===0&&(0,T.jsxs)(`div`,{className:`stage-content`,children:[(0,T.jsx)(`h3`,{children:`报价汇总`}),(0,T.jsx)(`p`,{className:`tip`,children:`汇总各供应商在报价截止前提交的报价，确认响应情况后进入报价比较。`}),!P&&(0,T.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`您当前以 ${o} 身份进入，${F?`仅可查看本人报价`:`仅可查看比价过程`}。`,style:{marginBottom:16}}),(0,T.jsx)(c,{columns:[{title:`供应商`,dataIndex:`name`,minWidth:180},{title:`报价状态`,key:`status`,width:120,render:()=>(0,T.jsx)(C,{label:`已报价`,status:`completed`})},{title:`报价时间`,dataIndex:`savedAt`,width:170}],dataSource:z,rowKey:`name`,pagination:!1,style:{width:`100%`}}),(0,T.jsx)(`div`,{className:`stage-action`,children:P&&(0,T.jsx)(i,{type:`primary`,size:`large`,onClick:nextStage,children:`报价已汇总，进入报价比较`})})]}),A===1&&(0,T.jsxs)(`div`,{className:`stage-content`,children:[(0,T.jsx)(`h3`,{children:`报价比较`}),(0,T.jsx)(`p`,{className:`tip`,children:`按报价总价升序排列，综合比较交货期、质保期等要素（报价最低者排名第 1）。`}),(0,T.jsx)(c,{columns:[{title:`排名`,key:`rank`,width:80,render:(e,t)=>{let n=R.findIndex(e=>e.name===t.name);return(0,T.jsx)(m,{color:n===0?`success`:`default`,children:n+1})}},{title:`供应商`,dataIndex:`name`,minWidth:180},{title:`报价（万元）`,dataIndex:`totalPrice`,width:130},{title:`交货期`,dataIndex:`deliveryPeriod`,minWidth:180},{title:`质保期`,dataIndex:`warrantyPeriod`,width:100},{title:`报价时间`,dataIndex:`savedAt`,width:170}],dataSource:z,rowKey:`name`,pagination:!1,style:{width:`100%`}}),(0,T.jsxs)(`div`,{className:`stage-action`,children:[P&&(0,T.jsx)(i,{onClick:prevStage,children:`返回`}),P&&(0,T.jsx)(i,{type:`primary`,size:`large`,onClick:finishComparison,children:`比价完成`})]})]}),A===2&&(0,T.jsx)(`div`,{className:`stage-content`,children:(0,T.jsx)(f,{status:`success`,title:`比价完成`,subTitle:`比价结果已生成：${B?.name||`-`} 报价最低（${B?.totalPrice??`-`} 万元）。评标对所有项目开放，请进入评标大厅完成评审。`,extra:[(0,T.jsx)(i,{type:`primary`,onClick:goEvaluate,children:`进入评标大厅`},`evaluate`),P&&(0,T.jsx)(i,{onClick:()=>j(0),children:`重新演示`},`replay`)].filter(Boolean)})})]}),M.length>0&&(0,T.jsx)(u,{size:`small`,title:`操作记录`,style:{marginTop:24},children:(0,T.jsx)(h,{items:M.map(e=>({key:e.id,color:`blue`,content:(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`strong`,{children:e.action}),(0,T.jsx)(`span`,{style:{color:`#999`,marginLeft:12,fontSize:12},children:e.time}),(0,T.jsx)(`p`,{style:{margin:`4px 0 0`,color:`#666`},children:e.detail}),(0,T.jsxs)(`p`,{style:{margin:0,color:`#999`,fontSize:12},children:[`操作人：`,e.operator]})]})}))})})]}),(0,T.jsx)(`style`,{children:`
        .comparison-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .comparison-hall .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .comparison-hall .hall-header h2 {
          margin: 0;
        }
        .comparison-hall .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .comparison-hall .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .comparison-hall .stage-panel {
          margin-top: 30px;
          padding: 20px;
          background: #f9fafc;
          border-radius: 8px;
        }
        .comparison-hall .stage-content h3 {
          margin-bottom: 8px;
        }
        .comparison-hall .tip {
          color: #666;
          margin-bottom: 16px;
        }
        .comparison-hall .stage-action {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `})]}):(0,T.jsx)(`div`,{className:`comparison-hall`,style:{maxWidth:1100,margin:`0 auto`},children:(0,T.jsxs)(u,{children:[(0,T.jsx)(f,{status:`info`,title:`招标族项目请在开标大厅操作`,subTitle:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(`p`,{style:{margin:0},children:[O?.name||`项目ID：${t}`,`（采购方式：`,v(O),`）`]}),(0,T.jsx)(`p`,{style:{margin:`8px 0 0`},children:`公开招标、邀请招标项目需在开标大厅完成签到、解密、唱标。`})]}),extra:[(0,T.jsx)(i,{type:`primary`,onClick:()=>e({to:`/admin/opening-hall`,search:{projectId:t}}),children:`前往开标大厅`},`opening`),(0,T.jsx)(i,{onClick:()=>e({to:n===`bidder`?`/admin/bidder-projects`:n===`supervisor`?`/admin/supervisor-hall`:`/admin/projects`}),children:`返回`},`back`)]}),(0,T.jsx)(s,{type:`info`,showIcon:!0,closable:!1,title:`口径说明：开标大厅服务招标族（公开招标、邀请招标），比价大厅服务询比族（公开询比价、邀请询比价），评标大厅对所有项目开放（2026-07-21 需求）。`})]})}):(0,T.jsx)(x,{})}var D=o(`/admin/comparison-hall`)({component:ComparisonHall});export{D as Route};