import{Q as e,Y as t,c as n,i as r}from"./useStore-DliLxn3V.js";import{_n as i,t as a}from"./button-CFq-rqtk.js";import{a as o,n as s}from"./fileRoute-uDG0Xyjp.js";import{t as c}from"./alert-CGiQH5vG.js";import{t as l}from"./message-DYXrK1o7.js";import{t as u}from"./card-B51hGroe.js";import{t as d}from"./empty-gsSFBrQl.js";import{t as f}from"./descriptions-DJZZQ6IV.js";import{t as p}from"./list-CFnwAcFY.js";import{t as m}from"./tag-CC1OK38A.js";import{t as h}from"./DownloadOutlined-CKSoSKDw.js";import{t as g}from"./ArrowLeftOutlined-DtkCSe6z.js";import{t as _}from"./HomeOutlined--ZGAc4yE.js";import{n as v}from"./portalStore-rruQgR8L.js";import{t as y}from"./PortalHeader-BCD1iqX2.js";var b=e(t(),1),x=n(),S={primary:`processing`,warning:`orange`,success:`success`,info:`default`};function NoticeDetail(){let{id:e}=o({strict:!1}),t=i(),n=r(),s=(0,b.useMemo)(()=>v.getNoticeById(e),[e]),goBack=()=>{window.history.length>1?n.history.back():t({to:`/`})},handleDownload=e=>{let t=new Blob([`附件内容：${e.name}\n演示文件，仅供原型演示。`],{type:`text/plain;charset=utf-8`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=e.name,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n),l.success(`已开始下载：${e.name}`)};return s?(0,x.jsxs)(`div`,{className:`public-page`,children:[(0,x.jsx)(y,{activeKey:`notice`}),(0,x.jsx)(`div`,{className:`public-page-content`,children:(0,x.jsxs)(u,{title:(0,x.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`公告详情`}),extra:(0,x.jsxs)(`span`,{style:{display:`inline-flex`,gap:8},children:[(0,x.jsx)(a,{icon:(0,x.jsx)(g,{}),onClick:goBack,children:`返回上一页`}),(0,x.jsx)(a,{type:`link`,icon:(0,x.jsx)(_,{}),onClick:()=>t({to:`/`}),children:`返回首页`})]}),children:[(0,x.jsxs)(`div`,{className:`notice-detail-title`,children:[(0,x.jsx)(`h2`,{children:s.title}),(0,x.jsx)(m,{color:S[s.tagType],children:s.typeName})]}),s.type===`change`&&s.changeReason&&(0,x.jsx)(c,{type:`warning`,showIcon:!0,title:`变更原因：${s.changeReason}`,style:{marginBottom:24}}),(0,x.jsxs)(f,{bordered:!0,column:2,style:{marginBottom:24},children:[(0,x.jsx)(f.Item,{label:`关联项目`,children:s.projectName||`-`}),(0,x.jsx)(f.Item,{label:`项目编号`,children:s.projectCode||`-`}),(0,x.jsx)(f.Item,{label:`采购方式`,children:s.purchaseMode||`-`}),(0,x.jsx)(f.Item,{label:`发布时间`,children:s.publishTime||`-`}),(0,x.jsx)(f.Item,{label:`开标时间`,children:s.bidOpenTime||`-`}),(0,x.jsx)(f.Item,{label:`开标地点`,children:s.bidOpenLocation||`-`}),(0,x.jsx)(f.Item,{label:`评标方法`,children:s.evaluationMethod||`-`}),(0,x.jsx)(f.Item,{label:`开标一览表字段`,children:s.bidSummaryFields?.length>0?s.bidSummaryFields.map(e=>(0,x.jsx)(m,{children:e},e)):`-`}),(0,x.jsx)(f.Item,{label:`联系人`,children:s.contactName||`-`}),(0,x.jsx)(f.Item,{label:`联系电话`,children:s.contactPhone||`-`}),(0,x.jsx)(f.Item,{label:`关联标段`,children:s.packages?.map(e=>e.name).join(`、`)||`-`}),(0,x.jsx)(f.Item,{label:`投标截止`,children:s.deadline||`-`})]}),(0,x.jsx)(u,{type:`inner`,title:`公告正文`,style:{marginBottom:24},children:(0,x.jsx)(`div`,{className:`notice-content`,children:s.content})}),(0,x.jsx)(u,{type:`inner`,title:`附件列表`,style:{marginBottom:24},children:s.attachments&&s.attachments.length>0?(0,x.jsx)(p,{dataSource:s.attachments,renderItem:e=>(0,x.jsxs)(p.Item,{actions:[(0,x.jsx)(a,{type:`link`,icon:(0,x.jsx)(h,{}),onClick:()=>handleDownload(e),children:`下载`},`download`)],children:[e.name,` `,e.size?`（${e.size}）`:``]})}):(0,x.jsx)(d,{description:`暂无附件`})}),(0,x.jsx)(c,{title:`供应商参与投标请登录后进入工作台「项目中心」，从下载招标文件开始（新口径无报名环节）。`,type:`info`,showIcon:!0,closable:!1})]})}),(0,x.jsx)(`style`,{children:`
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
      `})]}):(0,x.jsxs)(`div`,{className:`public-page`,children:[(0,x.jsx)(y,{}),(0,x.jsx)(`div`,{className:`public-page-content`,children:(0,x.jsxs)(u,{children:[(0,x.jsx)(d,{description:`公告不存在或已下线`}),(0,x.jsx)(`div`,{style:{textAlign:`center`,marginTop:16},children:(0,x.jsx)(a,{icon:(0,x.jsx)(g,{}),onClick:()=>t({to:`/`}),children:`返回首页`})})]})}),(0,x.jsx)(`style`,{children:`
          .public-page {
            min-height: 100vh;
            background-color: #f5f7fa;
          }
          .public-page-content {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
          }
        `})]})}var C=s(`/notice/$id`)({component:NoticeDetail});export{C as Route};