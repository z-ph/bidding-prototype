import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{lr as t,t as n,wn as r}from"./button-Cco463MC.js";import{n as i}from"./fileRoute-Bxjf8qzb.js";import{t as a}from"./alert-Bh3JXUuv.js";import{t as o}from"./table-D3sLCi_w.js";import{t as s}from"./message-C2B-DZFE.js";import{t as c}from"./card-N8hGFRYq.js";import{t as l}from"./empty-DkjcKP25.js";import{t as u}from"./tabs-_2KloJ3D.js";import{t as d}from"./radio-CozbkGx0.js";import{t as f}from"./descriptions-BzgK1Az0.js";import{t as p}from"./form-Dk4Ny5so.js";import{t as m}from"./input-Bek0E5oj.js";import{t as h}from"./tag-Ci3E0V1a.js";import{t as g}from"./timeline-DI9pLj3m.js";var _=e(t(),1),v=r();function EvaluationHall(){let[e,t]=(0,_.useState)(`summary`),[r,i]=(0,_.useState)([]),[y]=(0,_.useState)(`评标中`),[b]=(0,_.useState)(`2026-07-15 18:00`),[x]=(0,_.useState)(!1),S=[{rank:1,name:`C股份有限公司`,business:28,tech:36,price:29,total:93,recommend:`推荐中标`},{rank:2,name:`A科技有限公司`,business:27,tech:34,price:28,total:89,recommend:`备选`},{rank:3,name:`B实业有限公司`,business:26,tech:31,price:27,total:84,recommend:`备选`}],C=[{expert:`专家甲`,bidder:`C股份有限公司`,business:28,tech:36,price:29,comment:`技术方案完善，价格合理`,status:`已提交`},{expert:`专家乙`,bidder:`A科技有限公司`,business:27,tech:34,price:28,comment:`资质优良，报价略高`,status:`已提交`},{expert:`专家丙`,bidder:`B实业有限公司`,business:26,tech:31,price:27,comment:`方案基本满足要求`,status:`待提交`}],w=[{name:`D有限公司`,reason:`未按要求加盖电子签章，投标文件无效。`}],addOperationRecord=(e,t)=>{i(n=>[{id:Date.now(),action:e,detail:t,time:new Date().toLocaleString()},...n])},[T,E]=(0,_.useState)({opinion:`经评标委员会评审，C股份有限公司综合得分最高，技术方案满足招标文件要求，报价合理，推荐为中标候选人。`,recommend:`C股份有限公司`}),saveReport=()=>{addOperationRecord(`保存报告`,`评标委员会意见及推荐中标候选人已保存`),s.success(`评标报告已保存`)},exportReport=()=>{addOperationRecord(`导出报告`,`评标报告 PDF 导出中`),s.success(`评标报告 PDF 导出中...`)},submitResult=()=>{if(!x){s.warning(`尚有专家评分未提交，请确认所有专家已完成评分后再提交`);return}addOperationRecord(`提交评标结果`,`评标结果已提交，进入中标公示流程`),s.success(`评标结果已提交，进入中标公示流程`)},D=[{key:`summary`,label:`评分汇总`,children:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{columns:[{title:`排名`,dataIndex:`rank`,width:80},{title:`投标人`,dataIndex:`name`,minWidth:200},{title:`商务标（30）`,dataIndex:`business`,width:120},{title:`技术标（40）`,dataIndex:`tech`,width:120},{title:`价格标（30）`,dataIndex:`price`,width:120},{title:`总分`,dataIndex:`total`,width:100,render:e=>(0,v.jsx)(`strong`,{style:{color:`#409EFF`},children:e})},{title:`推荐意见`,dataIndex:`recommend`,width:120,render:e=>(0,v.jsx)(h,{color:e===`推荐中标`?`success`:`default`,children:e})}],dataSource:S,rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}}),(0,v.jsxs)(`div`,{className:`chart-mock`,children:[(0,v.jsx)(`h4`,{children:`得分对比`}),(0,v.jsx)(`div`,{className:`bars`,children:S.map(e=>(0,v.jsxs)(`div`,{className:`bar-item`,children:[(0,v.jsx)(`span`,{className:`bar-name`,children:e.name}),(0,v.jsx)(`div`,{className:`bar-track`,children:(0,v.jsx)(`div`,{className:`bar-fill`,style:{width:`${e.total}%`}})}),(0,v.jsx)(`span`,{className:`bar-value`,children:e.total})]},e.name))})]})]})},{key:`expert`,label:`专家评审`,children:(0,v.jsx)(o,{columns:[{title:`专家`,dataIndex:`expert`,width:120},{title:`投标人`,dataIndex:`bidder`},{title:`商务`,dataIndex:`business`,width:100},{title:`技术`,dataIndex:`tech`,width:100},{title:`价格`,dataIndex:`price`,width:100},{title:`评审意见`,dataIndex:`comment`,minWidth:200},{title:`状态`,dataIndex:`status`,width:100,render:e=>(0,v.jsx)(h,{color:e===`已提交`?`success`:`warning`,children:e})}],dataSource:C,rowKey:e=>`${e.expert}-${e.bidder}`,bordered:!0,pagination:!1,style:{width:`100%`}})},{key:`reject`,label:`否决投标`,children:w.length===0?(0,v.jsx)(l,{description:`暂无否决投标`}):w.map((e,t)=>(0,v.jsx)(a,{title:`${e.name}：${e.reason}`,type:`error`,closable:!1,style:{marginBottom:12}},t))},{key:`report`,label:`评标报告`,children:(0,v.jsxs)(p,{layout:`vertical`,children:[(0,v.jsx)(p.Item,{label:`评标委员会意见`,children:(0,v.jsx)(m.TextArea,{rows:6,placeholder:`汇总评标委员会整体意见...`,value:T.opinion,onChange:e=>E(t=>({...t,opinion:e.target.value}))})}),(0,v.jsx)(p.Item,{label:`推荐中标候选人`,children:(0,v.jsx)(d.Group,{value:T.recommend,onChange:e=>E(t=>({...t,recommend:e.target.value})),children:S.map(e=>(0,v.jsxs)(d,{value:e.name,children:[e.name,`（`,e.total,`分）`]},e.name))})}),(0,v.jsxs)(p.Item,{children:[(0,v.jsx)(n,{type:`primary`,onClick:saveReport,children:`保存报告`}),(0,v.jsx)(n,{style:{marginLeft:8},onClick:exportReport,children:`导出 PDF`})]})]})}];return(0,v.jsxs)(`div`,{className:`evaluation-hall`,children:[(0,v.jsxs)(c,{title:(0,v.jsxs)(`div`,{className:`hall-header`,children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`h2`,{children:`评标大厅`}),(0,v.jsx)(`p`,{className:`subtitle`,children:`XX市轨道交通设备采购项目 · 标段一：主设备`})]}),(0,v.jsxs)(`div`,{className:`hall-meta`,children:[(0,v.jsx)(h,{color:`success`,style:{fontSize:14,padding:`4px 12px`},children:`评标中`}),(0,v.jsx)(n,{type:`primary`,onClick:submitResult,children:`提交评标结果`})]})]}),children:[(0,v.jsxs)(c,{size:`small`,title:`当前状态与下一步`,style:{marginBottom:20,background:`#f6ffed`},children:[(0,v.jsxs)(f,{column:2,children:[(0,v.jsx)(f.Item,{label:`当前阶段`,children:y}),(0,v.jsx)(f.Item,{label:`截止时间`,children:b}),(0,v.jsx)(f.Item,{label:`当前状态`,children:(0,v.jsx)(h,{color:`success`,children:y})}),(0,v.jsx)(f.Item,{label:`下一步`,children:x?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{style:{marginRight:12},children:`提交评标结果`}),(0,v.jsx)(n,{type:`primary`,size:`small`,onClick:submitResult,children:`提交结果`})]}):(0,v.jsx)(`span`,{children:`等待所有专家完成评分并提交`})})]}),!x&&(0,v.jsx)(a,{title:`阻断原因：尚有专家评分未提交，需所有专家提交后方可发布评标结果。`,type:`warning`,showIcon:!0,closable:!1,style:{marginTop:12}})]}),(0,v.jsx)(u,{type:`card`,activeKey:e,onChange:t,items:D}),r.length>0&&(0,v.jsx)(c,{size:`small`,title:`操作记录`,style:{marginTop:20},children:(0,v.jsx)(g,{items:r.map(e=>({key:e.id,color:`blue`,content:(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`strong`,{children:e.action}),(0,v.jsx)(`span`,{style:{color:`#999`,marginLeft:12,fontSize:12},children:e.time}),(0,v.jsx)(`p`,{style:{margin:`4px 0 0`,color:`#666`},children:e.detail})]})}))})})]}),(0,v.jsx)(`style`,{children:`
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
      `})]})}var y=i(`/admin/evaluation-hall`)({component:EvaluationHall});export{y as Route};