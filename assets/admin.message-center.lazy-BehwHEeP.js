import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{t as r}from"./button-CFq-rqtk.js";import{n as i}from"./fileRoute-uDG0Xyjp.js";import{t as a}from"./message-DYXrK1o7.js";import{t as o}from"./card-B51hGroe.js";import{t as s}from"./empty-gsSFBrQl.js";import{t as c}from"./tabs-CNPr8l-V.js";import{t as l}from"./tag-CC1OK38A.js";import{t as u}from"./timeline-CXy3m4DU.js";import{t as d}from"./useRole-eT9C_jtb.js";import{n as f,t as p}from"./messageStore-8oaJLkzt.js";var m=e(t(),1),h=n(),g=Object.fromEntries(p.map(e=>[e.value,e.label])),_={approval:`blue`,system:`gray`,notice:`orange`};function MessageCenter(){let{role:e,roleName:t,userName:n}=d(),[i,p]=(0,m.useState)(`all`),[v,y]=(0,m.useState)(0),b=(0,m.useMemo)(()=>[t,...e===`tenderee`?[`采购管理部`,`需求部门`]:[]],[e,t]),x=(0,m.useMemo)(()=>f.list().filter(e=>e.toUser?e.toUser===n:!e.toRole||b.some(t=>e.toRole===t||t.includes(e.toRole)||e.toRole.includes(t))),[b,n,v]),S=x.filter(e=>!e.read),markRead=e=>{f.markRead(e),y(e=>e+1)},markAllRead=()=>{S.forEach(e=>f.markRead(e.id)),y(e=>e+1),a.success(`已全部标记为已读`)},renderTimeline=e=>(0,h.jsx)(u,{items:e.map(e=>({key:e.id,color:_[e.type]||`blue`,content:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(`div`,{className:e.read?void 0:`unread`,children:[(0,h.jsx)(l,{color:_[e.type]||`blue`,style:{marginRight:8},children:g[e.type]||`消息`}),(0,h.jsx)(`strong`,{children:e.title}),!e.read&&(0,h.jsx)(r,{type:`link`,size:`small`,onClick:()=>markRead(e.id),children:`标为已读`}),(0,h.jsx)(`p`,{children:e.content})]}),(0,h.jsx)(`div`,{style:{color:`#999`,fontSize:12,marginTop:4},children:e.createdAt})]})}))}),C=[{key:`all`,label:`全部消息`,children:x.length===0?(0,h.jsx)(s,{description:`暂无消息`}):renderTimeline(x)},{key:`unread`,label:`未读（${S.length}）`,children:S.length===0?(0,h.jsx)(s,{description:`暂无未读消息`}):renderTimeline(S)}];return(0,h.jsxs)(`div`,{className:`message-center`,children:[(0,h.jsx)(o,{title:(0,h.jsxs)(`div`,{className:`card-header`,children:[(0,h.jsx)(`span`,{children:`消息中心`}),(0,h.jsx)(r,{type:`primary`,onClick:markAllRead,disabled:S.length===0,children:`全部已读`})]}),children:(0,h.jsx)(c,{type:`card`,activeKey:i,onChange:p,items:C})}),(0,h.jsx)(`style`,{children:`
        .message-center {
          max-width: 1000px;
          margin: 0 auto;
        }
        .message-center .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
        .unread {
          font-weight: bold;
          color: #001529;
        }
        .unread p {
          font-weight: normal;
          color: #606266;
        }
      `})]})}var v=i(`/admin/message-center`)({component:MessageCenter});export{v as Route};