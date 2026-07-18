import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{_n as r,t as i}from"./button-CFq-rqtk.js";import{a,n as o}from"./fileRoute-uDG0Xyjp.js";import{t as s}from"./alert-CGiQH5vG.js";import{t as c}from"./message-DYXrK1o7.js";import{t as l}from"./card-B51hGroe.js";import{t as u}from"./empty-gsSFBrQl.js";import{t as d}from"./descriptions-DJZZQ6IV.js";import{t as f}from"./list-CFnwAcFY.js";import{t as p}from"./tag-CC1OK38A.js";import{t as m}from"./DownloadOutlined-CKSoSKDw.js";import{t as h}from"./ArrowLeftOutlined-DtkCSe6z.js";import{t as g}from"./HomeOutlined--ZGAc4yE.js";import{n as _}from"./portalStore-BoTkaPUS.js";import{t as v}from"./PortalHeader-CQnXCtSZ.js";var y=e(t(),1),b=n(),x={primary:`processing`,warning:`orange`,success:`success`,info:`default`};function NoticeDetail(){let{id:e}=a({strict:!1}),t=r(),n=(0,y.useMemo)(()=>_.getNoticeById(e),[e]),handleDownload=e=>{let t=new Blob([`附件内容：${e.name}\n演示文件，仅供原型演示。`],{type:`text/plain;charset=utf-8`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=e.name,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n),c.success(`已开始下载：${e.name}`)};return n?(0,b.jsxs)(`div`,{className:`public-page`,children:[(0,b.jsx)(v,{activeKey:`notice`}),(0,b.jsx)(`div`,{className:`public-page-content`,children:(0,b.jsxs)(l,{title:(0,b.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`公告详情`}),extra:(0,b.jsx)(i,{type:`link`,icon:(0,b.jsx)(g,{}),onClick:()=>t({to:`/`}),children:`返回首页`}),children:[(0,b.jsxs)(`div`,{className:`notice-detail-title`,children:[(0,b.jsx)(`h2`,{children:n.title}),(0,b.jsx)(p,{color:x[n.tagType],children:n.typeName})]}),n.type===`change`&&n.changeReason&&(0,b.jsx)(s,{type:`warning`,showIcon:!0,title:`变更原因：${n.changeReason}`,style:{marginBottom:24}}),(0,b.jsxs)(d,{bordered:!0,column:2,style:{marginBottom:24},children:[(0,b.jsx)(d.Item,{label:`关联项目`,children:n.projectName||`-`}),(0,b.jsx)(d.Item,{label:`项目编号`,children:n.projectCode||`-`}),(0,b.jsx)(d.Item,{label:`采购方式`,children:n.purchaseMode||`-`}),(0,b.jsx)(d.Item,{label:`发布时间`,children:n.publishTime||`-`}),(0,b.jsx)(d.Item,{label:`开标时间`,children:n.bidOpenTime||`-`}),(0,b.jsx)(d.Item,{label:`开标地点`,children:n.bidOpenLocation||`-`}),(0,b.jsx)(d.Item,{label:`评标方法`,children:n.evaluationMethod||`-`}),(0,b.jsx)(d.Item,{label:`开标一览表字段`,children:n.bidSummaryFields?.length>0?n.bidSummaryFields.map(e=>(0,b.jsx)(p,{children:e},e)):`-`}),(0,b.jsx)(d.Item,{label:`联系人`,children:n.contactName||`-`}),(0,b.jsx)(d.Item,{label:`联系电话`,children:n.contactPhone||`-`}),(0,b.jsx)(d.Item,{label:`关联标段`,children:n.packages?.map(e=>e.name).join(`、`)||`-`}),(0,b.jsx)(d.Item,{label:`投标截止`,children:n.deadline||`-`})]}),(0,b.jsx)(l,{type:`inner`,title:`公告正文`,style:{marginBottom:24},children:(0,b.jsx)(`div`,{className:`notice-content`,children:n.content})}),(0,b.jsx)(l,{type:`inner`,title:`附件列表`,style:{marginBottom:24},children:n.attachments&&n.attachments.length>0?(0,b.jsx)(f,{dataSource:n.attachments,renderItem:e=>(0,b.jsxs)(f.Item,{actions:[(0,b.jsx)(i,{type:`link`,icon:(0,b.jsx)(m,{}),onClick:()=>handleDownload(e),children:`下载`},`download`)],children:[e.name,` `,e.size?`（${e.size}）`:``]})}):(0,b.jsx)(u,{description:`暂无附件`})}),(0,b.jsx)(s,{title:`供应商参与投标请登录后进入工作台「项目中心」，从下载招标文件开始（新口径无报名环节）。`,type:`info`,showIcon:!0,closable:!1})]})}),(0,b.jsx)(`style`,{children:`
        .public-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .public-page-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .notice-detail-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .notice-detail-title h2 {
          margin: 0;
        }
        .notice-content {
          line-height: 1.8;
          white-space: pre-wrap;
        }
      `})]}):(0,b.jsxs)(`div`,{className:`public-page`,children:[(0,b.jsx)(v,{}),(0,b.jsx)(`div`,{className:`public-page-content`,children:(0,b.jsxs)(l,{children:[(0,b.jsx)(u,{description:`公告不存在或已下线`}),(0,b.jsx)(`div`,{style:{textAlign:`center`,marginTop:16},children:(0,b.jsx)(i,{icon:(0,b.jsx)(h,{}),onClick:()=>t({to:`/`}),children:`返回首页`})})]})}),(0,b.jsx)(`style`,{children:`
          .public-page {
            min-height: 100vh;
            background-color: #f5f7fa;
          }
          .public-page-content {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
          }
        `})]})}var S=o(`/notice/$id`)({component:NoticeDetail});export{S as Route};