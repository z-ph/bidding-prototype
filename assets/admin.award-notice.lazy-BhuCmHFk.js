import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{n as a}from"./fileRoute-Bxjf8qzb.js";import{t as o}from"./alert-Bh3JXUuv.js";import{t as s}from"./message-C2B-DZFE.js";import{t as c}from"./card-N8hGFRYq.js";import{t as l}from"./CheckOutlined-zPSeYluf.js";import{t as u}from"./form-Dk4Ny5so.js";import{t as d}from"./input-Bek0E5oj.js";import{t as f}from"./steps-l21t-5uX.js";import{t as p}from"./tag-Ci3E0V1a.js";var m=e(n(),1),h=i();function AwardNotice(){let e=t(),[n,i]=(0,m.useState)({title:`XX市轨道交通设备采购项目中标通知书`,bidder:`C股份有限公司`,amount:`798 万元`,content:`贵司参与的 XX市轨道交通设备采购项目 经评标委员会评审、招标人确认，被确定为中标人。请于收到通知书后 30 日内与招标人签订合同。`,signed:!1}),updateField=(e,t)=>{i(n=>({...n,[e]:t}))};return(0,h.jsxs)(`div`,{className:`award-notice`,children:[(0,h.jsxs)(c,{title:(0,h.jsxs)(`div`,{className:`card-header`,children:[(0,h.jsx)(`span`,{children:`发送中标通知书`}),(0,h.jsx)(p,{color:`success`,children:`中标人：C股份有限公司`})]}),children:[(0,h.jsx)(f,{current:4,style:{marginBottom:24},items:[{title:`评标结束`},{title:`候选人公示`},{title:`确认中标人`},{title:`结果公示`},{title:`发送通知书`}]}),(0,h.jsx)(o,{title:`根据模板生成中标通知书，支持在线编辑、签章后发送给中标人。发送后中标人可在工作台查看。`,type:`info`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,h.jsxs)(u,{layout:`horizontal`,labelCol:{flex:`120px`},children:[(0,h.jsx)(u.Item,{label:`通知书标题`,required:!0,children:(0,h.jsx)(d,{value:n.title,onChange:e=>updateField(`title`,e.target.value)})}),(0,h.jsx)(u.Item,{label:`中标人`,required:!0,children:(0,h.jsx)(d,{value:n.bidder,disabled:!0})}),(0,h.jsx)(u.Item,{label:`中标金额`,required:!0,children:(0,h.jsx)(d,{value:n.amount,onChange:e=>updateField(`amount`,e.target.value)})}),(0,h.jsx)(u.Item,{label:`通知书正文`,required:!0,children:(0,h.jsx)(d.TextArea,{rows:10,value:n.content,onChange:e=>updateField(`content`,e.target.value)})}),(0,h.jsxs)(u.Item,{label:`电子签章`,children:[(0,h.jsx)(r,{type:`primary`,ghost:!0,onClick:()=>{s.success(`电子签章成功`),updateField(`signed`,!0)},children:`点击进行电子签章`}),n.signed&&(0,h.jsxs)(`span`,{style:{color:`#67C23A`,marginLeft:12},children:[(0,h.jsx)(l,{}),` 已签章`]})]})]}),(0,h.jsxs)(`div`,{className:`actions`,children:[(0,h.jsx)(r,{type:`primary`,size:`large`,onClick:()=>{s.success(`中标通知书已发送给中标人`),e({to:`/admin/contract-archive`})},children:`发送中标通知书`}),(0,h.jsx)(r,{size:`large`,onClick:()=>{s.success(`打开中标通知书预览`)},children:`预览`}),(0,h.jsx)(r,{size:`large`,onClick:()=>e({to:`/admin/contract-archive`}),children:`下一步：合同归档`})]})]}),(0,h.jsx)(`style`,{children:`
        .award-notice {
          max-width: 1000px;
          margin: 0 auto;
        }
        .award-notice .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .award-notice .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `})]})}var g=a(`/admin/award-notice`)({component:AwardNotice});export{g as Route};