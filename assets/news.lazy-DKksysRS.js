import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{Ln as r,t as i}from"./button-kN9I3LUV.js";import{n as a}from"./fileRoute-CYesOn2-.js";import{t as o}from"./message-C4PuKih5.js";import{t as s}from"./empty-B5CqFOjl.js";import{t as c}from"./card-xz9k-4M9.js";import{t as l}from"./EyeOutlined-C-HzOAhN.js";import{t as u}from"./pagination-DSUvy5ku.js";import{t as d}from"./list-CFV7fSZO.js";import{t as f}from"./tag-BtNDBJzJ.js";import{t as p}from"./HomeOutlined-CzoLksDe.js";import{n as m}from"./portalStore-CskJKkkE.js";import{t as h}from"./PortalHeader-DWtqfSAA.js";var g=e(t(),1),_=n(),v={平台公告:`blue`,培训通知:`green`,办事指南:`orange`,政策法规:`purple`,产品更新:`cyan`,采购信息:`magenta`,常见问题:`default`};function News(){let e=r(),[t,n]=(0,g.useState)(1),a=(0,g.useMemo)(()=>m.getPublishedNews(),[]),y=a.slice((t-1)*5,t*5),viewDetail=e=>{o.info(`查看详情：${e.title}`)};return(0,_.jsxs)(`div`,{className:`public-page`,children:[(0,_.jsx)(h,{activeKey:`news`}),(0,_.jsx)(`div`,{className:`public-page-content`,children:(0,_.jsx)(c,{title:(0,_.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`新闻公告`}),extra:(0,_.jsx)(i,{type:`link`,icon:(0,_.jsx)(p,{}),onClick:()=>e({to:`/`}),children:`返回首页`}),children:a.length===0?(0,_.jsx)(s,{description:`暂无新闻公告`}):(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(d,{itemLayout:`horizontal`,dataSource:y,renderItem:e=>(0,_.jsx)(d.Item,{actions:[(0,_.jsx)(f,{color:v[e.category]||`default`,children:e.category},`tag`),(0,_.jsx)(i,{type:`link`,size:`small`,icon:(0,_.jsx)(l,{}),onClick:()=>viewDetail(e),children:`查看`},`view`)],children:(0,_.jsx)(d.Item.Meta,{title:(0,_.jsx)(`a`,{onClick:()=>viewDetail(e),children:e.title}),description:`发布时间：${e.publishTime}`})})}),(0,_.jsx)(`div`,{className:`public-pagination`,children:(0,_.jsx)(u,{current:t,pageSize:5,total:a.length,onChange:n,showSizeChanger:!1})})]})})}),(0,_.jsx)(`style`,{children:`
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