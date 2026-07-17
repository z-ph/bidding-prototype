import{Q as e,X as t,Y as n,c as r}from"./useStore-DliLxn3V.js";import{U as i,gn as a,t as o}from"./button-B1Wwau7K.js";import{a as s,n as c}from"./fileRoute-Y-ryzvVx.js";import{t as l}from"./alert-DNojNYNq.js";import{t as u}from"./message-JNHFxrNa.js";import{t as d}from"./modal-DoBgUekD.js";import{t as f}from"./card-BrdtLDdw.js";import{t as p}from"./empty-CmyiYpuY.js";import{t as m}from"./radio-lyRdlb-w.js";import{t as h}from"./descriptions-aPpOgtJi.js";import{t as g}from"./form-czL32uA-.js";import{t as _}from"./QuestionCircleOutlined-CBrGelJ1.js";import{t as v}from"./input-CoPgOTIQ.js";import{t as y}from"./list-DlK3xSM3.js";import{t as b}from"./upload-S2H3Ifwn.js";import{t as x}from"./tag-zBq3O40n.js";import{t as S}from"./DownloadOutlined-DbdiM0SV.js";import{t as C}from"./ArrowLeftOutlined-cWHbRjQm.js";import{t as w}from"./HomeOutlined-Dl8U1MNj.js";import{t as T}from"./UploadOutlined-DI-vVzQB.js";import{n as E}from"./portalStore-B1qF3xc_.js";import{t as D}from"./objectionStore-CPbLg9wg.js";import{t as O}from"./PortalHeader-D9kXRA7F.js";var k=t((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.default={icon:{tag:`svg`,attrs:{viewBox:`64 64 896 896`,focusable:`false`},children:[{tag:`path`,attrs:{d:`M904 512h-56c-4.4 0-8 3.6-8 8v320H184V184h320c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V520c0-4.4-3.6-8-8-8z`}},{tag:`path`,attrs:{d:`M355.9 534.9L354 653.8c-.1 8.9 7.1 16.2 16 16.2h.4l118-2.9c2-.1 4-.9 5.4-2.3l415.9-415c3.1-3.1 3.1-8.2 0-11.3L785.4 114.3c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-415.8 415a8.3 8.3 0 00-2.3 5.6zm63.5 23.6L779.7 199l45.2 45.1-360.5 359.7-45.7 1.1.7-46.4z`}}]},name:`form`,theme:`outlined`}})),A=e(n()),j=e(k());function _extends(){return _extends=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},_extends.apply(this,arguments)}var M=A.forwardRef((e,t)=>A.createElement(i,_extends({},e,{ref:t,icon:j.default}))),N=r(),P={primary:`processing`,warning:`orange`,success:`success`,info:`default`};function NoticeDetail(){let{id:e}=s({strict:!1}),t=a(),n=(0,A.useMemo)(()=>E.getNoticeById(e),[e]),r=!!localStorage.getItem(`bidding-role`),i=(localStorage.getItem(`bidding-role`)||``)===`bidder`,[c,k]=(0,A.useState)(!1),[j,F]=(0,A.useState)({type:`商务`,content:``,attachments:[]}),I=new Date,L=n?.registerStart&&n?.registerEnd?I>=new Date(n.registerStart)&&I<=new Date(n.registerEnd):!1,R=r&&i&&n?.canRegister&&L,updateObjectionField=(e,t)=>{F(n=>({...n,[e]:t}))},submitObjection=()=>{if(!j.content.trim()){u.warning(`请填写质疑内容`);return}D.add({id:`obj-${Date.now()}`,project:n?.projectName||`未知项目`,projectId:String(n?.projectId||``),type:`招标文件`,subType:j.type,bidder:localStorage.getItem(`bidding-account`)||`当前投标人`,content:j.content,status:`待答复`,attachments:j.attachments.map(e=>e.name||e),reply:``,createdAt:new Date().toLocaleString()}),u.success(`质疑已提交，招标人/代理将在异议管理中处理`),k(!1),F({type:`商务`,content:``,attachments:[]})},handleRegister=()=>{if(!r){u.warning(`请先登录`),t({to:`/login`});return}if(!i){u.warning(`仅供应商可报名`);return}if(!L){u.warning(`当前不在报名时间内`);return}t({to:`/admin/bid-register`})},handleDownload=e=>{let t=new Blob([`附件内容：${e.name}\n演示文件，仅供原型演示。`],{type:`text/plain;charset=utf-8`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=e.name,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n),u.success(`已开始下载：${e.name}`)};return n?(0,N.jsxs)(`div`,{className:`public-page`,children:[(0,N.jsx)(O,{activeKey:`notice`}),(0,N.jsx)(`div`,{className:`public-page-content`,children:(0,N.jsxs)(f,{title:(0,N.jsx)(`span`,{style:{fontSize:18,fontWeight:`bold`},children:`公告详情`}),extra:(0,N.jsx)(o,{type:`link`,icon:(0,N.jsx)(w,{}),onClick:()=>t({to:`/`}),children:`返回首页`}),children:[(0,N.jsxs)(`div`,{className:`notice-detail-title`,children:[(0,N.jsx)(`h2`,{children:n.title}),(0,N.jsx)(x,{color:P[n.tagType],children:n.typeName})]}),n.type===`change`&&n.changeReason&&(0,N.jsx)(l,{type:`warning`,showIcon:!0,title:`变更原因：${n.changeReason}`,style:{marginBottom:24}}),(0,N.jsxs)(h,{bordered:!0,column:2,style:{marginBottom:24},children:[(0,N.jsx)(h.Item,{label:`关联项目`,children:n.projectName||`-`}),(0,N.jsx)(h.Item,{label:`项目编号`,children:n.projectCode||`-`}),(0,N.jsx)(h.Item,{label:`采购方式`,children:n.purchaseMode||`-`}),(0,N.jsx)(h.Item,{label:`发布时间`,children:n.publishTime||`-`}),(0,N.jsx)(h.Item,{label:`开标时间`,children:n.bidOpenTime||`-`}),(0,N.jsx)(h.Item,{label:`开标地点`,children:n.bidOpenLocation||`-`}),(0,N.jsx)(h.Item,{label:`评标方法`,children:n.evaluationMethod||`-`}),(0,N.jsx)(h.Item,{label:`开标一览表字段`,children:n.bidSummaryFields?.length>0?n.bidSummaryFields.map(e=>(0,N.jsx)(x,{children:e},e)):`-`}),(0,N.jsx)(h.Item,{label:`联系人`,children:n.contactName||`-`}),(0,N.jsx)(h.Item,{label:`联系电话`,children:n.contactPhone||`-`}),(0,N.jsx)(h.Item,{label:`关联标段`,children:n.packages?.map(e=>e.name).join(`、`)||`-`}),(0,N.jsx)(h.Item,{label:`报名截止`,children:n.deadline||`-`})]}),(0,N.jsx)(f,{type:`inner`,title:`公告正文`,style:{marginBottom:24},children:(0,N.jsx)(`div`,{className:`notice-content`,children:n.content})}),(0,N.jsx)(f,{type:`inner`,title:`附件列表`,style:{marginBottom:24},children:n.attachments&&n.attachments.length>0?(0,N.jsx)(y,{dataSource:n.attachments,renderItem:e=>(0,N.jsxs)(y.Item,{actions:[(0,N.jsx)(o,{type:`link`,icon:(0,N.jsx)(S,{}),onClick:()=>handleDownload(e),children:`下载`},`download`)],children:[e.name,` `,e.size?`（${e.size}）`:``]})}):(0,N.jsx)(p,{description:`暂无附件`})}),(0,N.jsxs)(`div`,{className:`notice-actions`,children:[(0,N.jsx)(o,{type:`primary`,size:`large`,icon:(0,N.jsx)(M,{}),disabled:!R,onClick:handleRegister,children:`立即报名`}),r&&i&&(0,N.jsx)(o,{size:`large`,icon:(0,N.jsx)(_,{}),onClick:()=>k(!0),children:`质疑招标文件`}),!R&&(0,N.jsx)(`span`,{className:`register-hint`,children:r?i?L?`该公告不支持报名`:`当前不在报名时间内`:`仅供应商角色可报名`:`请先登录后报名`})]}),(0,N.jsx)(d,{title:`质疑招标文件`,open:c,width:640,onOk:submitObjection,onCancel:()=>k(!1),okText:`提交质疑`,cancelText:`取消`,children:(0,N.jsxs)(g,{layout:`horizontal`,labelCol:{flex:`100px`},children:[(0,N.jsx)(g.Item,{label:`质疑类型`,children:(0,N.jsxs)(m.Group,{value:j.type,onChange:e=>updateObjectionField(`type`,e.target.value),children:[(0,N.jsx)(m,{value:`商务`,children:`商务`}),(0,N.jsx)(m,{value:`技术`,children:`技术`}),(0,N.jsx)(m,{value:`其他`,children:`其他`})]})}),(0,N.jsx)(g.Item,{label:`质疑内容`,children:(0,N.jsx)(v.TextArea,{rows:6,placeholder:`请详细描述对招标文件的质疑内容，包括条款、参数、评分办法等...`,value:j.content,onChange:e=>updateObjectionField(`content`,e.target.value)})}),(0,N.jsx)(g.Item,{label:`附件`,children:(0,N.jsx)(b,{fileList:j.attachments,onChange:({fileList:e})=>updateObjectionField(`attachments`,e),beforeUpload:()=>!1,multiple:!0,children:(0,N.jsx)(o,{icon:(0,N.jsx)(T,{}),children:`上传附件`})})})]})})]})}),(0,N.jsx)(`style`,{children:`
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
        .notice-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          padding: 20px 0;
        }
        .register-hint {
          color: #999;
          font-size: 14px;
        }
      `})]}):(0,N.jsxs)(`div`,{className:`public-page`,children:[(0,N.jsx)(O,{}),(0,N.jsx)(`div`,{className:`public-page-content`,children:(0,N.jsxs)(f,{children:[(0,N.jsx)(p,{description:`公告不存在或已下线`}),(0,N.jsx)(`div`,{style:{textAlign:`center`,marginTop:16},children:(0,N.jsx)(o,{icon:(0,N.jsx)(C,{}),onClick:()=>t({to:`/`}),children:`返回首页`})})]})}),(0,N.jsx)(`style`,{children:`
          .public-page {
            min-height: 100vh;
            background-color: #f5f7fa;
          }
          .public-page-content {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
          }
        `})]})}var F=c(`/notice/$id`)({component:NoticeDetail});export{F as Route};