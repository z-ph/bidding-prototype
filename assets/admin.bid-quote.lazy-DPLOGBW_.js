import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{n as a}from"./fileRoute-Bxjf8qzb.js";import{t as o}from"./InfoCircleFilled-Dye0Nci6.js";import{t as s}from"./alert-Bh3JXUuv.js";import{t as c}from"./table-D3sLCi_w.js";import{t as l}from"./message-C2B-DZFE.js";import{t as u}from"./card-N8hGFRYq.js";import{n as d,t as f}from"./row-ClXn77SA.js";import{t as p}from"./form-Dk4Ny5so.js";import{t as m}from"./input-Bek0E5oj.js";import{t as h}from"./steps-l21t-5uX.js";import{t as g}from"./tag-Ci3E0V1a.js";var _=e(n(),1),v=i();function BidQuote(){let e=t(),[n,i]=(0,_.useState)({totalPrice:``,delivery:``,quality:``,payment:``}),[a,y]=(0,_.useState)([{name:`主设备 A 型`,spec:`详见技术参数`,quantity:10,unit:`台`,price:``},{name:`辅材 B 型`,spec:`详见技术参数`,quantity:50,unit:`套`,price:``}]),updateQuote=(e,t)=>{i(n=>({...n,[e]:t}))},updatePrice=(e,t)=>{y(n=>n.map((n,r)=>r===e?{...n,price:t}:n))};return(0,v.jsxs)(`div`,{className:`bid-quote`,children:[(0,v.jsxs)(u,{title:(0,v.jsxs)(`div`,{className:`card-header`,children:[(0,v.jsx)(`span`,{children:`在线报价`}),(0,v.jsx)(g,{color:`error`,children:`距投标截止：2 天 5 小时`})]}),children:[(0,v.jsx)(h,{size:`small`,current:3,style:{marginBottom:24},items:[`报名通过`,`下载文件`,`编制标书`,`填写报价`,`上传并加密`].map(e=>({title:e}))}),(0,v.jsx)(s,{title:`请按招标文件要求填写开标一览表和分项报价，提交后投标截止前可修改。`,type:`warning`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,v.jsx)(`h3`,{children:`开标一览表`}),(0,v.jsxs)(p,{labelCol:{flex:`0 0 140px`},wrapperCol:{flex:`auto`},className:`quote-form`,children:[(0,v.jsxs)(f,{gutter:20,children:[(0,v.jsx)(d,{span:12,children:(0,v.jsx)(p.Item,{label:`投标报价（万元）`,required:!0,children:(0,v.jsx)(m,{value:n.totalPrice,onChange:e=>updateQuote(`totalPrice`,e.target.value),placeholder:`请输入总报价`})})}),(0,v.jsx)(d,{span:12,children:(0,v.jsx)(p.Item,{label:`交货期`,required:!0,children:(0,v.jsx)(m,{value:n.delivery,onChange:e=>updateQuote(`delivery`,e.target.value),placeholder:`例如：60天`})})})]}),(0,v.jsxs)(f,{gutter:20,children:[(0,v.jsx)(d,{span:12,children:(0,v.jsx)(p.Item,{label:`质保期`,required:!0,children:(0,v.jsx)(m,{value:n.quality,onChange:e=>updateQuote(`quality`,e.target.value),placeholder:`例如：3年`})})}),(0,v.jsx)(d,{span:12,children:(0,v.jsx)(p.Item,{label:`付款方式`,required:!0,children:(0,v.jsx)(m,{value:n.payment,onChange:e=>updateQuote(`payment`,e.target.value),placeholder:`例如：3-6-1`})})})]})]}),(0,v.jsx)(`h3`,{children:`分项报价`}),(0,v.jsx)(c,{columns:[{title:`分项名称`,dataIndex:`name`,key:`name`},{title:`规格`,dataIndex:`spec`,key:`spec`},{title:`数量`,dataIndex:`quantity`,key:`quantity`,width:120},{title:`单位`,dataIndex:`unit`,key:`unit`,width:100},{title:`单价（元）`,key:`price`,width:180,render:(e,t,n)=>(0,v.jsx)(m,{value:t.price,onChange:e=>updatePrice(n,e.target.value),placeholder:`单价`})},{title:`小计（元）`,key:`subtotal`,width:150,render:(e,t)=>t.quantity*(Number(t.price)||0)}],dataSource:a,rowKey:`name`,pagination:!1,style:{width:`100%`,marginBottom:20}}),(0,v.jsx)(`div`,{className:`quote-tips`,children:(0,v.jsxs)(`p`,{children:[(0,v.jsx)(o,{}),` 报价将用于开标唱标，请确保与上传的报价文件一致。`]})}),(0,v.jsxs)(`div`,{className:`actions`,children:[(0,v.jsx)(r,{type:`primary`,size:`large`,onClick:()=>{l.success(`报价已保存，请继续上传投标文件`)},children:`保存报价`}),(0,v.jsx)(r,{size:`large`,onClick:()=>e({to:`/admin/bid-upload`}),children:`下一步：上传投标文件`})]})]}),(0,v.jsx)(`style`,{children:`
        .bid-quote {
          max-width: 1100px;
          margin: 0 auto;
        }
        .bid-quote .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .bid-quote .quote-form {
          margin: 20px 0;
        }
        .bid-quote .quote-tips {
          color: #E6A23C;
          margin-bottom: 20px;
        }
        .bid-quote .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
      `})]})}var y=a(`/admin/bid-quote`)({component:BidQuote});export{y as Route};