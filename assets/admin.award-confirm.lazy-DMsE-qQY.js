import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{n as a}from"./fileRoute-Bxjf8qzb.js";import{t as o}from"./alert-Bh3JXUuv.js";import{t as s}from"./table-95e_rQ2_.js";import{t as c}from"./message-C2B-DZFE.js";import{t as l}from"./modal-BfqtGKO8.js";import{t as u}from"./card-N8hGFRYq.js";import{t as d}from"./radio-CozbkGx0.js";import{t as f}from"./form-Dk4Ny5so.js";import{t as p}from"./input-Bek0E5oj.js";import{t as m}from"./steps-l21t-5uX.js";import{t as h}from"./tag-Ci3E0V1a.js";var g=e(n(),1),_=i();function AwardConfirm(){let e=t(),[n,i]=(0,g.useState)(``),a=[{rank:1,name:`C股份有限公司`,total:93,price:798,recommend:`综合得分最高，推荐为第一中标候选人`},{rank:2,name:`A科技有限公司`,total:89,price:820,recommend:`推荐为第二中标候选人`},{rank:3,name:`B实业有限公司`,total:84,price:845,recommend:`推荐为第三中标候选人`}],[v,y]=(0,g.useState)({opinion:`经公示无异议，确定第一中标候选人 C股份有限公司 为中标人。`});return(0,_.jsxs)(`div`,{className:`award-confirm`,children:[(0,_.jsxs)(u,{title:(0,_.jsxs)(`div`,{className:`card-header`,children:[(0,_.jsx)(`span`,{children:`确认中标人`}),(0,_.jsx)(h,{color:`warning`,children:`项目：XX市轨道交通设备采购项目`})]}),children:[(0,_.jsx)(m,{current:2,style:{marginBottom:24},items:[{title:`评标结束`},{title:`候选人公示`},{title:`确认中标人`},{title:`结果公示`},{title:`发送通知书`}]}),(0,_.jsx)(o,{title:`公示期结束后，招标人在此处确认最终中标人。确认后将进入中标结果公示和中标通知书发送环节。`,type:`info`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,_.jsx)(`h3`,{children:`中标候选人排名`}),(0,_.jsx)(s,{columns:[{title:`排名`,dataIndex:`rank`,width:80},{title:`投标人`,dataIndex:`name`,minWidth:200},{title:`综合得分`,dataIndex:`total`,width:120},{title:`投标报价（万元）`,dataIndex:`price`,width:160},{title:`评标委员会推荐意见`,dataIndex:`recommend`,minWidth:200},{title:`选择`,width:120,render:(e,t)=>(0,_.jsx)(d,{checked:n===t.name,onChange:()=>i(t.name),children:`选择`})}],dataSource:a,rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}}),(0,_.jsx)(f,{layout:`vertical`,style:{marginTop:20},children:(0,_.jsx)(f.Item,{label:`定标意见`,children:(0,_.jsx)(p.TextArea,{rows:4,placeholder:`请填写定标意见...`,value:v.opinion,onChange:e=>y(t=>({...t,opinion:e.target.value}))})})}),(0,_.jsxs)(`div`,{className:`actions`,children:[(0,_.jsx)(r,{type:`primary`,size:`large`,onClick:()=>{if(!n){c.warning(`请先选择中标人`);return}l.confirm({title:`确认中标人`,content:`确定将 ${n} 确认为本项目中标人吗？确认后将进入中标结果公示环节。`,okText:`确认中标`,cancelText:`取消`,onOk:()=>{c.success(`已确认中标人：${n}`),e({to:`/admin/award-notice`})}})},children:`确认中标人`}),(0,_.jsx)(r,{size:`large`,onClick:()=>e({to:`/admin/award-notice`}),children:`下一步：发送中标通知书`})]})]}),(0,_.jsx)(`style`,{children:`
        .award-confirm {
          max-width: 1100px;
          margin: 0 auto;
        }
        .award-confirm .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .award-confirm .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `})]})}var v=a(`/admin/award-confirm`)({component:AwardConfirm});export{v as Route};