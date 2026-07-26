import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{Ln as r,d as i,t as a}from"./button-kN9I3LUV.js";import{n as o}from"./fileRoute-CYesOn2-.js";import{h as s}from"./style-BqC_FcZL.js";import{t as c}from"./select-DMXNXCRp.js";import{t as l}from"./empty-B5CqFOjl.js";import{t as u}from"./card-xz9k-4M9.js";import{t as d}from"./input-CNEvglm2.js";import{t as f}from"./HomeOutlined-CzoLksDe.js";import{n as p}from"./portalStore-DcfJXVEg.js";import{t as m}from"./PortalHeader-DWtqfSAA.js";var h=e(t(),1),g=n(),{Option:_}=c,v=[{value:`all`,label:`全部分类`},{value:`操作指南`,label:`操作指南`},{value:`常见问题`,label:`常见问题`},{value:`政策法规`,label:`政策法规`},{value:`联系方式`,label:`联系方式`}];function Help(){let e=r(),[t,n]=(0,h.useState)(``),[o,y]=(0,h.useState)(`all`),b=(0,h.useMemo)(()=>p.getPublishedHelpDocs(),[]),x=(0,h.useMemo)(()=>{let e=t.trim().toLowerCase();return b.filter(t=>o===`all`||t.category===o?!e||t.title.toLowerCase().includes(e)||t.content.toLowerCase().includes(e):!1)},[t,o,b]),S=x.map(e=>({key:String(e.id),label:e.title,children:(0,g.jsx)(`p`,{style:{whiteSpace:`pre-wrap`,margin:0},children:e.content})}));return(0,g.jsxs)(`div`,{className:`public-page`,children:[(0,g.jsx)(m,{activeKey:`help`}),(0,g.jsx)(`div`,{className:`public-page-content`,children:(0,g.jsxs)(u,{title:(0,g.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`帮助中心`}),extra:(0,g.jsx)(a,{type:`link`,icon:(0,g.jsx)(f,{}),onClick:()=>e({to:`/`}),children:`返回首页`}),children:[(0,g.jsxs)(`div`,{className:`help-filter`,children:[(0,g.jsx)(d,{placeholder:`请输入关键词搜索`,prefix:(0,g.jsx)(s,{}),value:t,onChange:e=>n(e.target.value),allowClear:!0,style:{width:280}}),(0,g.jsx)(c,{value:o,onChange:y,style:{width:160},children:v.map(e=>(0,g.jsx)(_,{value:e.value,children:e.label},e.value))})]}),x.length===0?(0,g.jsx)(l,{description:`未找到匹配的帮助内容`,style:{marginTop:40}}):(0,g.jsx)(i,{defaultActiveKey:x.map(e=>String(e.id)),items:S})]})}),(0,g.jsx)(`style`,{children:`
        .public-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .public-page-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .help-filter {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }
      `})]})}var y=o(`/help`)({component:Help});export{y as Route};