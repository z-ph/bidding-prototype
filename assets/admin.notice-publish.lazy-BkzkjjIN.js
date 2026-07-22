import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{_n as r,t as i}from"./button-CFq-rqtk.js";import{i as a,n as o}from"./fileRoute-uDG0Xyjp.js";import{t as s}from"./message-DYXrK1o7.js";import{t as c}from"./card-B51hGroe.js";import{t as l}from"./select-Cc7b5aq5.js";import{n as u,t as d}from"./row-ErzqQw3c.js";import{t as f}from"./divider-B-Wa7dO9.js";import{t as p}from"./descriptions-DJZZQ6IV.js";import{t as m}from"./form-CTexRMCX.js";import{t as h}from"./input-NJCky5ev.js";import{t as g}from"./list-CFnwAcFY.js";import{t as _}from"./upload-D5vgmlc_.js";import{t as v}from"./UploadOutlined-BWI9lGYO.js";import{n as y,r as b}from"./notices-Ceo3cVXO.js";import{t as x}from"./projects-qdAyCCTg.js";import{u as S}from"./ProjectList-CD2DsNCW.js";import{t as C}from"./ProjectEntryGuard-NPnDDuN9.js";var w=e(t(),1),T=n(),E={type:`tender`,projectId:null,title:``};function NoticePublish(){let e=r(),t=a({strict:!1}),n=t.id,o=t.projectId,D=(0,w.useMemo)(()=>S(x.getProjects()),[]),[O,k]=(0,w.useState)(E),[A,j]=(0,w.useState)([]);(0,w.useEffect)(()=>{let t=o==null?null:String(o);if(!n){k({...E,projectId:t}),j([]);return}let r=b.getNoticeById(n);if(!r){s.error(`公告不存在`),e({to:`/admin/notice-list`});return}k({type:r.type||`tender`,projectId:r.projectId==null?t:String(r.projectId),title:r.title||``}),j((r.attachments||[]).map((e,t)=>({uid:String(-t-1),name:e.name,size:typeof e.size==`string`&&e.size.includes(`MB`)?Number(e.size.replace(`MB`,``))*1024*1024:2048})))},[n,o,D,e]);let M=(0,w.useMemo)(()=>D.find(e=>String(e.id)===String(O.projectId)),[D,O.projectId]),updateField=(e,t)=>{k(n=>({...n,[e]:t}))},handleTypeChange=e=>{k(t=>({...t,type:e}))},saveDraft=()=>{s.success(`演示环境 · 草稿已保存`)},publish=()=>{s.success(`演示环境 · 公告已发布`),e({to:`/admin/notice-list`})},N=y.find(e=>e.value===O.type)?.label||`公告`;return o?(0,T.jsxs)(`div`,{className:`notice-publish`,children:[(0,T.jsx)(c,{title:(0,T.jsx)(`span`,{children:n?`编辑公告`:`发布公告`}),extra:(0,T.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,T.jsx)(i,{onClick:()=>e({to:`/admin/notice-list`}),children:`返回公告列表`}),(0,T.jsx)(i,{onClick:saveDraft,children:`保存草稿`}),(0,T.jsx)(i,{type:`primary`,onClick:publish,children:`发布`})]}),children:(0,T.jsxs)(m,{layout:`horizontal`,labelCol:{flex:`100px`},className:`notice-form`,children:[(0,T.jsxs)(d,{gutter:20,children:[(0,T.jsx)(u,{span:12,children:(0,T.jsx)(m.Item,{label:`公告类型`,required:!0,children:(0,T.jsx)(l,{placeholder:`请选择`,style:{width:`100%`},value:O.type,onChange:handleTypeChange,options:y.map(e=>({label:e.label,value:e.value}))})})}),(0,T.jsx)(u,{span:12,children:(0,T.jsx)(m.Item,{label:`关联项目`,required:!0,children:(0,T.jsx)(h,{readOnly:!0,value:M?.name||(O.projectId?`项目 ${O.projectId}`:``)})})})]}),(0,T.jsx)(m.Item,{label:`公告标题`,required:!0,children:(0,T.jsx)(h,{placeholder:`请输入公告标题`,value:O.title,onChange:e=>updateField(`title`,e.target.value)})}),(0,T.jsx)(m.Item,{label:`附件`,children:(0,T.jsx)(_,{fileList:A,onChange:({fileList:e})=>j(e),beforeUpload:()=>!1,multiple:!0,children:(0,T.jsx)(i,{type:`primary`,icon:(0,T.jsx)(v,{}),children:`上传附件`})})}),(0,T.jsx)(m.Item,{label:`公告预览`,children:(0,T.jsxs)(c,{className:`preview-card`,children:[(0,T.jsx)(`h2`,{children:O.title||`公告标题`}),(0,T.jsxs)(`div`,{className:`preview-meta`,children:[(0,T.jsxs)(`span`,{children:[`公告类型：`,N]}),(0,T.jsxs)(`span`,{children:[`关联项目：`,M?.name||`（未选择）`]})]}),(0,T.jsx)(f,{}),(0,T.jsx)(p,{column:1,bordered:!0,size:`small`,children:(0,T.jsxs)(p.Item,{label:`附件数量`,children:[A.length,` 个`]})}),A.length>0&&(0,T.jsx)(g,{size:`small`,dataSource:A,renderItem:e=>(0,T.jsx)(g.Item,{children:e.name})})]})})]})}),(0,T.jsx)(`style`,{children:`
        .notice-publish {
          max-width: 1000px;
          margin: 0 auto;
        }
        .notice-form {
          margin-top: 10px;
        }
        .preview-card {
          background: #fafafa;
          width: 100%;
        }
        .preview-card h2 {
          text-align: center;
          margin-bottom: 12px;
        }
        .preview-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
          color: #666;
          font-size: 14px;
        }
      `})]}):(0,T.jsx)(C,{})}var D=o(`/admin/notice-publish`)({component:NoticePublish});export{D as Route};