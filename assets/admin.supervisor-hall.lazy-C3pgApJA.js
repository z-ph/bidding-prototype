import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{gn as r,t as i}from"./button-B1Wwau7K.js";import{n as a}from"./fileRoute-Y-ryzvVx.js";import{t as o}from"./alert-DNojNYNq.js";import{t as s}from"./table-kj3Kqn80.js";import{t as c}from"./message-JNHFxrNa.js";import{t as l}from"./card-BrdtLDdw.js";import{t as u}from"./tabs-4-G4o229.js";import{t as d}from"./divider-DIUyC74r.js";import{t as f}from"./form-czL32uA-.js";import{t as p}from"./input-CoPgOTIQ.js";import{t as m}from"./steps-8VL_JDwR.js";import{t as h}from"./tag-zBq3O40n.js";import{t as g}from"./StatusTag-t77kJkKD.js";var _=e(t(),1),v=n();function SupervisorHall(){let e=r(),[t,n]=(0,_.useState)(`opening`),[a,y]=(0,_.useState)(``);return(0,v.jsxs)(`div`,{className:`supervisor-hall`,children:[(0,v.jsxs)(l,{title:(0,v.jsxs)(`div`,{className:`card-header`,children:[(0,v.jsx)(`span`,{children:`监督大厅`}),(0,v.jsxs)(`div`,{className:`header-tags`,children:[(0,v.jsx)(h,{color:`error`,style:{fontSize:14,padding:`4px 12px`},children:`监督模式：只读`}),(0,v.jsx)(h,{children:`监督人员：王监督`})]})]}),children:[(0,v.jsx)(o,{title:`您当前以监督人员身份进入，可查看开标、评标全过程及操作日志，但不可修改任何业务数据。`,type:`info`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,v.jsx)(u,{type:`card`,activeKey:t,onChange:n,items:[{key:`opening`,label:`开标监督`,children:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(m,{current:4,items:[{title:`签到`},{title:`启动`},{title:`解密`},{title:`唱标`},{title:`结束`}]}),(0,v.jsx)(`h3`,{children:`签到情况`}),(0,v.jsx)(s,{columns:[{title:`角色`,dataIndex:`role`},{title:`姓名/企业`,dataIndex:`name`},{title:`状态`,dataIndex:`status`,render:e=>(0,v.jsx)(g,{label:e,status:e===`已签到`?`completed`:`pending`})},{title:`时间`,dataIndex:`time`}],dataSource:[{role:`招标人`,name:`张三`,status:`已签到`,time:`2026-07-08 14:50`},{role:`招标代理`,name:`李四`,status:`已签到`,time:`2026-07-08 14:52`},{role:`投标人`,name:`A科技有限公司`,status:`已签到`,time:`2026-07-08 14:55`},{role:`监督人`,name:`王监督`,status:`已签到`,time:`2026-07-08 14:53`}],rowKey:e=>`${e.role}-${e.name}`,bordered:!0,pagination:!1,style:{width:`100%`}}),(0,v.jsx)(`h3`,{children:`唱标结果`}),(0,v.jsx)(s,{columns:[{title:`投标人`,dataIndex:`name`},{title:`投标报价（万元）`,dataIndex:`price`},{title:`交货期`,dataIndex:`delivery`},{title:`质保期`,dataIndex:`quality`}],dataSource:[{name:`A科技有限公司`,price:820,delivery:`60天`,quality:`3年`},{name:`B实业有限公司`,price:845,delivery:`55天`,quality:`2年`},{name:`C股份有限公司`,price:798,delivery:`65天`,quality:`3年`}],rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}})]})},{key:`evaluation`,label:`评标监督`,children:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`h3`,{children:`评标委员会`}),(0,v.jsx)(s,{columns:[{title:`专家`,dataIndex:`name`},{title:`专业`,dataIndex:`field`},{title:`签到状态`,dataIndex:`status`,render:e=>(0,v.jsx)(g,{label:e,status:e===`已签到`?`completed`:`pending`})},{title:`评分状态`,dataIndex:`scoreStatus`,render:e=>(0,v.jsx)(g,{label:e,status:e===`已提交`?`completed`:`processing`})}],dataSource:[{name:`专家甲`,field:`电子信息`,status:`已签到`,scoreStatus:`已提交`},{name:`专家乙`,field:`机械设备`,status:`已签到`,scoreStatus:`已提交`},{name:`专家丙`,field:`工程造价`,status:`已签到`,scoreStatus:`待提交`}],rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}}),(0,v.jsx)(`h3`,{children:`评分汇总`}),(0,v.jsx)(s,{columns:[{title:`投标人`,dataIndex:`name`},{title:`商务`,dataIndex:`business`},{title:`技术`,dataIndex:`tech`},{title:`价格`,dataIndex:`price`},{title:`总分`,dataIndex:`total`},{title:`推荐意见`,dataIndex:`recommend`}],dataSource:[{name:`C股份有限公司`,business:28,tech:36,price:29,total:93,recommend:`推荐中标`},{name:`A科技有限公司`,business:27,tech:34,price:28,total:89,recommend:`备选`},{name:`B实业有限公司`,business:26,tech:31,price:27,total:84,recommend:`备选`}],rowKey:`name`,bordered:!0,pagination:!1,style:{width:`100%`}})]})}]}),(0,v.jsx)(d,{}),(0,v.jsx)(`div`,{className:`supervisor-actions`,children:(0,v.jsxs)(l,{className:`action-card`,title:(0,v.jsx)(`span`,{children:`监督专属操作`}),children:[(0,v.jsx)(f,{layout:`vertical`,children:(0,v.jsx)(f.Item,{label:`异常/意见记录`,children:(0,v.jsx)(p.TextArea,{rows:3,placeholder:`如发现异常情况，请在此记录监督意见`,value:a,onChange:e=>y(e.target.value)})})}),(0,v.jsxs)(`div`,{className:`action-btns`,children:[(0,v.jsx)(i,{style:{color:`#fff`,background:`#E6A23C`,borderColor:`#E6A23C`},onClick:()=>{if(!a.trim()){c.warning(`请先填写异常描述`);return}c.warning(`异常记录已保存，将同步至日志`),y(``)},children:`记录异常`}),(0,v.jsx)(i,{type:`primary`,onClick:()=>{if(!a.trim()){c.warning(`请先填写监督意见`);return}c.success(`监督意见已提交`),y(``)},children:`提交监督意见`}),(0,v.jsx)(i,{onClick:()=>e({to:`/admin/supervisor-logs`}),children:`查看完整操作日志`})]})]})})]}),(0,v.jsx)(`style`,{children:`
        .supervisor-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .supervisor-hall .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .supervisor-hall .header-tags {
          display: flex;
          gap: 12px;
        }
        .supervisor-hall .supervisor-actions {
          margin-top: 10px;
        }
        .supervisor-hall .action-card {
          background: #fafafa;
        }
        .supervisor-hall .action-btns {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .supervisor-hall h3 {
          margin: 20px 0 12px;
          font-size: 16px;
        }
      `})]})}var y=a(`/admin/supervisor-hall`)({component:SupervisorHall});export{y as Route};