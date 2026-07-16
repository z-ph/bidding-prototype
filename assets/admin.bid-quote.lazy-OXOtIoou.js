import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{i as a,n as o}from"./fileRoute-Bxjf8qzb.js";import{t as s}from"./InfoCircleFilled-Dye0Nci6.js";import{t as c}from"./alert-Bh3JXUuv.js";import{t as l}from"./table-95e_rQ2_.js";import{t as u}from"./message-C2B-DZFE.js";import{t as d}from"./card-N8hGFRYq.js";import{n as f,t as p}from"./row-ClXn77SA.js";import{t as m}from"./form-Dk4Ny5so.js";import{t as h}from"./input-Bek0E5oj.js";import{t as g}from"./steps-l21t-5uX.js";import{t as _}from"./tag-Ci3E0V1a.js";import{t as v}from"./projects-BxECS7vb.js";var y=e(n(),1),b=i();function BidQuote(){let e=t(),n=a({strict:!1}).projectId,i=(0,y.useMemo)(()=>{let e=v.getProjectById(n);return e?.quoteFields?.length?e.quoteFields:[{key:`totalPrice`,label:`投标报价`,unit:`万元`,required:!0},{key:`delivery`,label:`交货期`,unit:``,required:!0},{key:`quality`,label:`质保期`,unit:``,required:!0},{key:`payment`,label:`付款方式`,unit:``,required:!0}]},[n]),[o,x]=(0,y.useState)(()=>{let e={};return i.forEach(t=>{e[t.key]=``}),e}),[S,C]=(0,y.useState)([{name:`主设备 A 型`,spec:`详见技术参数`,quantity:10,unit:`台`,price:``},{name:`辅材 B 型`,spec:`详见技术参数`,quantity:50,unit:`套`,price:``}]),isTenderMode=e=>[`open`,`invitation`].includes(e),w=v.getProjectById(n),T=w&&!isTenderMode(w.purchaseMode),E=w?.status===`待报价`||w?.status===`已开标`,D=T&&!E,updateQuote=(e,t)=>{D||x(n=>({...n,[e]:t}))},updatePrice=(e,t)=>{D||C(n=>n.map((n,r)=>r===e?{...n,price:t}:n))};return(0,b.jsxs)(`div`,{className:`bid-quote`,children:[(0,b.jsxs)(d,{title:(0,b.jsxs)(`div`,{className:`card-header`,children:[(0,b.jsx)(`span`,{children:`在线报价`}),(0,b.jsx)(_,{color:`error`,children:`距投标截止：2 天 5 小时`})]}),children:[(0,b.jsx)(g,{size:`small`,current:T?4:3,style:{marginBottom:24},items:(T?[`报名通过`,`下载文件`,`编制标书`,`上传并加密`,`开标`,`填写报价`]:[`报名通过`,`下载文件`,`编制标书`,`填写报价`,`上传并加密`]).map(e=>({title:e}))}),D?(0,b.jsx)(c,{title:`询比价项目的报价将在开标后启动，当前项目尚未开标，暂不可报价。请在项目中心等待开标完成后进入。`,type:`info`,showIcon:!0,closable:!1,style:{marginBottom:20}}):(0,b.jsx)(c,{title:T?`当前为询比价项目，已开标，请填写最终报价，提交后进入唱标。`:`请按招标文件要求填写开标一览表和分项报价，提交后投标截止前可修改。`,type:`warning`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,b.jsx)(`h3`,{children:`开标一览表`}),(0,b.jsx)(m,{labelCol:{flex:`0 0 140px`},wrapperCol:{flex:`auto`},className:`quote-form`,children:(0,b.jsx)(p,{gutter:20,children:i.map(e=>(0,b.jsx)(f,{span:12,children:(0,b.jsx)(m.Item,{label:e.unit?`${e.label}（${e.unit}）`:e.label,required:e.required,children:(0,b.jsx)(h,{value:o[e.key],disabled:D,onChange:t=>updateQuote(e.key,t.target.value),placeholder:`请输入${e.label}`})})},e.key))})}),(0,b.jsx)(`h3`,{children:`分项报价`}),(0,b.jsx)(l,{columns:[{title:`分项名称`,dataIndex:`name`,key:`name`},{title:`规格`,dataIndex:`spec`,key:`spec`},{title:`数量`,dataIndex:`quantity`,key:`quantity`,width:120},{title:`单位`,dataIndex:`unit`,key:`unit`,width:100},{title:`单价（元）`,key:`price`,width:180,render:(e,t,n)=>(0,b.jsx)(h,{value:t.price,onChange:e=>updatePrice(n,e.target.value),placeholder:`单价`})},{title:`小计（元）`,key:`subtotal`,width:150,render:(e,t)=>t.quantity*(Number(t.price)||0)}],dataSource:S,rowKey:`name`,pagination:!1,style:{width:`100%`,marginBottom:20}}),(0,b.jsx)(`div`,{className:`quote-tips`,children:(0,b.jsxs)(`p`,{children:[(0,b.jsx)(s,{}),` 报价将用于开标唱标，请确保与上传的报价文件一致。`]})}),(0,b.jsxs)(`div`,{className:`actions`,children:[(0,b.jsx)(r,{type:`primary`,size:`large`,disabled:D,onClick:()=>{if(D){u.warning(`询比价项目报价将在开标后启动，当前不可报价`);return}u.success(T?`报价已保存`:`报价已保存，请继续上传投标文件`)},children:`保存报价`}),T?(0,b.jsx)(r,{size:`large`,onClick:()=>e({to:`/admin/bidder-projects`}),children:`返回项目中心`}):(0,b.jsx)(r,{size:`large`,onClick:()=>e({to:`/admin/bid-upload`}),children:`下一步：上传投标文件`})]})]}),(0,b.jsx)(`style`,{children:`
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
      `})]})}var x=o(`/admin/bid-quote`)({component:BidQuote});export{x as Route};