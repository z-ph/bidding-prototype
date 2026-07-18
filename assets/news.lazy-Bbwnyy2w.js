import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{hn as r}from"./compact-item-BzoyQ67m.js";import{n as i}from"./fileRoute-BqseIIh5.js";import{t as a}from"./message-e5C_tf52.js";import{t as o}from"./button-BuhZ9GOe.js";import{t as s}from"./card-D6vd6Hqa.js";import{t as c}from"./empty-qRh6M7vL.js";import{t as l}from"./EyeOutlined-C0sw2Oge.js";import{t as u}from"./pagination-BUNw2xR7.js";import{t as d}from"./list-sSBV9PYT.js";import{t as f}from"./HomeOutlined-IzQhT0pA.js";import{s as p}from"./index-iA2mwhGe.js";import{n as m}from"./portalStore-BoTkaPUS.js";import{t as h}from"./PortalHeader-kZK1rbMy.js";var g=e(t(),1),_=n(),v={平台公告:`blue`,培训通知:`green`,办事指南:`orange`,政策法规:`purple`,产品更新:`cyan`,采购信息:`magenta`,常见问题:`default`};function News(){let e=r(),[t,n]=(0,g.useState)(1),i=(0,g.useMemo)(()=>m.getPublishedNews(),[]),y=i.slice((t-1)*5,t*5),viewDetail=e=>{a.info(`查看详情：${e.title}`)};return(0,_.jsxs)(`div`,{className:`public-page`,children:[(0,_.jsx)(h,{activeKey:`news`}),(0,_.jsx)(`div`,{className:`public-page-content`,children:(0,_.jsx)(s,{title:(0,_.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`新闻公告`}),extra:(0,_.jsx)(o,{type:`link`,icon:(0,_.jsx)(f,{}),onClick:()=>e({to:`/`}),children:`返回首页`}),children:i.length===0?(0,_.jsx)(c,{description:`暂无新闻公告`}):(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(d,{itemLayout:`horizontal`,dataSource:y,renderItem:e=>(0,_.jsx)(d.Item,{actions:[(0,_.jsx)(p,{color:v[e.category]||`default`,children:e.category},`tag`),(0,_.jsx)(o,{type:`link`,size:`small`,icon:(0,_.jsx)(l,{}),onClick:()=>viewDetail(e),children:`查看`},`view`)],children:(0,_.jsx)(d.Item.Meta,{title:(0,_.jsx)(`a`,{onClick:()=>viewDetail(e),children:e.title}),description:`发布时间：${e.publishTime}`})})}),(0,_.jsx)(`div`,{className:`public-pagination`,children:(0,_.jsx)(u,{current:t,pageSize:5,total:i.length,onChange:n,showSizeChanger:!1})})]})})}),(0,_.jsx)(`style`,{children:`
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
      `})]})}var y=i(`/news`)({component:News});export{y as Route};