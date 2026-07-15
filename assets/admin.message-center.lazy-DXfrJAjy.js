import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{lr as t,t as n,wn as r}from"./button-Cco463MC.js";import{n as i}from"./fileRoute-Bxjf8qzb.js";import{t as a}from"./message-C2B-DZFE.js";import{t as o}from"./card-N8hGFRYq.js";import{t as s}from"./empty-DkjcKP25.js";import{t as c}from"./tabs-_2KloJ3D.js";import{t as l}from"./timeline-DI9pLj3m.js";var u=e(t(),1),d=r();function MessageCenter(){let[e,t]=(0,u.useState)(`all`),[r,i]=(0,u.useState)([{id:1,title:`报名审核通过`,content:`您在 XX市轨道交通设备采购项目 的报名已通过审核。`,time:`2026-07-08 10:00`,type:`success`,read:!1},{id:2,title:`开标提醒`,content:`XX市轨道交通设备采购项目 将于 2026-07-08 15:00 开标。`,time:`2026-07-08 09:00`,type:`warning`,read:!1},{id:3,title:`系统通知`,content:`平台将于今晚 22:00 进行例行维护。`,time:`2026-07-07 18:00`,type:`info`,read:!0}]),f=r.filter(e=>!e.read),p={warning:`orange`,primary:`blue`,danger:`red`,success:`green`,info:`gray`},markAllRead=()=>{i(e=>e.map(e=>({...e,read:!0}))),a.success(`已全部标记为已读`)},renderTimeline=e=>(0,d.jsx)(l,{items:e.map(e=>({key:e.id,color:p[e.type],content:(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(`div`,{className:e.read?void 0:`unread`,children:[(0,d.jsx)(`strong`,{children:e.title}),(0,d.jsx)(`p`,{children:e.content})]}),(0,d.jsx)(`div`,{style:{color:`#999`,fontSize:12,marginTop:4},children:e.time})]})}))}),m=[{key:`all`,label:`全部消息`,children:r.length===0?(0,d.jsx)(s,{description:`暂无消息`}):renderTimeline(r)},{key:`unread`,label:`未读`,children:f.length===0?(0,d.jsx)(s,{description:`暂无未读消息`}):renderTimeline(f)}];return(0,d.jsxs)(`div`,{className:`message-center`,children:[(0,d.jsx)(o,{title:(0,d.jsxs)(`div`,{className:`card-header`,children:[(0,d.jsx)(`span`,{children:`消息中心`}),(0,d.jsx)(n,{type:`primary`,onClick:markAllRead,children:`全部已读`})]}),children:(0,d.jsx)(c,{type:`card`,activeKey:e,onChange:t,items:m})}),(0,d.jsx)(`style`,{children:`
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
      `})]})}var f=i(`/admin/message-center`)({component:MessageCenter});export{f as Route};