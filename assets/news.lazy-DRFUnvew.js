import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{n as a}from"./fileRoute-Bxjf8qzb.js";import{t as o}from"./message-C2B-DZFE.js";import{t as s}from"./card-N8hGFRYq.js";import{t as c}from"./empty-DkjcKP25.js";import{t as l}from"./EyeOutlined-DdTZ-PyY.js";import{t as u}from"./pagination-C_xUKDNd.js";import{t as d}from"./list-DiolVGFM.js";import{t as f}from"./tag-Ci3E0V1a.js";import{t as p}from"./HomeOutlined-s4bGXu9e.js";import{n as m}from"./portalStore-f4q-AlIF.js";import{t as h}from"./PortalHeader-CZ-cxf4S.js";var g=e(n(),1),_=i(),v={平台公告:`blue`,培训通知:`green`,办事指南:`orange`,政策法规:`purple`,产品更新:`cyan`,采购信息:`magenta`,常见问题:`default`};function News(){let e=t(),[n,i]=(0,g.useState)(1),a=(0,g.useMemo)(()=>m.getPublishedNews(),[]),y=a.slice((n-1)*5,n*5),viewDetail=e=>{o.info(`查看详情：${e.title}`)};return(0,_.jsxs)(`div`,{className:`public-page`,children:[(0,_.jsx)(h,{activeKey:`news`}),(0,_.jsx)(`div`,{className:`public-page-content`,children:(0,_.jsx)(s,{title:(0,_.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`新闻公告`}),extra:(0,_.jsx)(r,{type:`link`,icon:(0,_.jsx)(p,{}),onClick:()=>e({to:`/`}),children:`返回首页`}),children:a.length===0?(0,_.jsx)(c,{description:`暂无新闻公告`}):(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(d,{itemLayout:`horizontal`,dataSource:y,renderItem:e=>(0,_.jsx)(d.Item,{actions:[(0,_.jsx)(f,{color:v[e.category]||`default`,children:e.category},`tag`),(0,_.jsx)(r,{type:`link`,size:`small`,icon:(0,_.jsx)(l,{}),onClick:()=>viewDetail(e),children:`查看`},`view`)],children:(0,_.jsx)(d.Item.Meta,{title:(0,_.jsx)(`a`,{onClick:()=>viewDetail(e),children:e.title}),description:`发布时间：${e.publishTime}`})})}),(0,_.jsx)(`div`,{className:`public-pagination`,children:(0,_.jsx)(u,{current:n,pageSize:5,total:a.length,onChange:i,showSizeChanger:!1})})]})})}),(0,_.jsx)(`style`,{children:`
        .public-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .public-page-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .public-pagination {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
      `})]})}var y=a(`/news`)({component:News});export{y as Route};