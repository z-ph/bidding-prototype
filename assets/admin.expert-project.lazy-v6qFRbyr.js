import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{i as a,n as o}from"./fileRoute-Bxjf8qzb.js";import{t as s}from"./input-number-s-rzIf5r.js";import{t as c}from"./table-D3sLCi_w.js";import{t as l}from"./message-C2B-DZFE.js";import{t as u}from"./modal-BfqtGKO8.js";import{t as d}from"./card-N8hGFRYq.js";import{t as f}from"./tabs-_2KloJ3D.js";import{t as p}from"./checkbox-D7LU1__H.js";import{n as m,t as h}from"./row-ClXn77SA.js";import{t as g}from"./descriptions-BzgK1Az0.js";import{t as _}from"./FileTextOutlined-CK4CDqwq.js";import{t as v}from"./form-Dk4Ny5so.js";import{t as y}from"./QuestionCircleOutlined-Drymf_3l.js";import{t as b}from"./input-Bek0E5oj.js";import{t as x}from"./steps-l21t-5uX.js";import{t as S}from"./tag-Ci3E0V1a.js";import{t as C}from"./EditOutlined-CzdqFiU9.js";import{t as w}from"./tenderDocStore-DBjdCjjL.js";import{t as T}from"./StatusTag-DWwfFSA1.js";import{t as E}from"./driver-DyuIdVyB.js";var D=e(n(),1),O=i(),k=[{id:`1`,name:`XX市轨道交通设备采购项目`,code:`ZB20260701001`,stage:`评标中`,deadline:`2026-07-10 17:00`,isLeader:!0},{id:`2`,name:`办公桌椅采购项目`,code:`ZB20260702002`,stage:`待评标`,deadline:`2026-07-12 14:00`,isLeader:!1},{id:`3`,name:`软件开发服务项目`,code:`ZB20260703003`,stage:`评标中`,deadline:`2026-07-15 09:00`,isLeader:!1}];function ExpertProject(){let e=t(),n=a({strict:!1}).projectId;return n?(0,O.jsx)(EvaluationDetail,{projectId:n,onBack:()=>e({to:`/admin/expert-project`})}):(0,O.jsx)(ProjectList,{onEnter:t=>e({to:`/admin/expert-project`,search:{projectId:t}})})}function ProjectList({onEnter:e}){return(0,O.jsxs)(`div`,{className:`expert-project-list`,children:[(0,O.jsx)(d,{title:`评标任务列表`,children:(0,O.jsx)(c,{rowKey:`id`,dataSource:k,columns:[{title:`项目名称`,dataIndex:`name`,minWidth:260},{title:`项目编号`,dataIndex:`code`,width:160},{title:`当前阶段`,dataIndex:`stage`,width:120,render:e=>(0,O.jsx)(T,{label:e,status:e})},{title:`评标截止`,dataIndex:`deadline`,width:180},{title:`身份`,dataIndex:`isLeader`,width:100,render:e=>e?(0,O.jsx)(S,{color:`gold`,children:`组长`}):(0,O.jsx)(S,{children:`成员`})},{title:`操作`,width:150,render:(t,n)=>(0,O.jsx)(r,{type:`primary`,size:`small`,onClick:()=>e(n.id),children:`进入评标`})}],pagination:!1})}),(0,O.jsx)(`style`,{children:`
        .expert-project-list {
          max-width: 1100px;
          margin: 0 auto;
        }
      `})]})}function EvaluationDetail({projectId:e,onBack:t}){let n=w.getCurrentPublishedVersion(e),[i,a]=(0,D.useState)(0),[o,S]=(0,D.useState)(!1),[k,A]=(0,D.useState)(!1),[j,M]=(0,D.useState)(!1),[N,P]=(0,D.useState)(``),[F,I]=(0,D.useState)(!1),[L,R]=(0,D.useState)(!1),[z,B]=(0,D.useState)([{name:`专家甲`,field:`电子信息`,status:`已签到`,isLeader:!0},{name:`专家乙`,field:`机械设备`,status:`已签到`,isLeader:!1},{name:`专家丙`,field:`工程造价`,status:`已签到`,isLeader:!1}]),V=z.some(e=>e.name===`专家甲`&&e.isLeader),[H,U]=(0,D.useState)([{name:`A科技有限公司`,business:25,tech:32,price:26,comment:``},{name:`B实业有限公司`,business:24,tech:30,price:25,comment:``},{name:`C股份有限公司`,business:27,tech:35,price:28,comment:``}]),W=H.every(e=>e.business!==null&&e.business!==void 0&&e.tech!==null&&e.tech!==void 0&&e.price!==null&&e.price!==void 0&&e.comment.trim()!==``),G=F,updateBidder=(e,t,n)=>{U(r=>r.map((r,i)=>i===e?{...r,[t]:n}:r))},checkIn=()=>{l.success(`签到成功`),a(e=>e+1)},voteLeader=e=>{B(t=>t.map(t=>({...t,isLeader:t.name===e.name}))),l.success(`已推选 ${e.name} 为评标组长`)},viewDoc=e=>{if(e.includes(`招标文件`)&&n){l.success(`在线查阅招标文件：${n.versionNo}，发布时间：${n.publishedAt||n.updatedAt}`);return}l.success(`在线查阅：${e}`)},doSign=()=>{F||(M(!0),P(new Date().toLocaleString()),l.success(`电子签名完成`))},submitAll=()=>{if(!W){l.warning(`请完成所有投标人的评分和评审意见`);return}if(!j){l.warning(`请先完成电子签名`);return}u.confirm({title:`确认提交`,content:`提交后评分结果将锁定，无法修改，是否继续？`,okText:`确认提交`,cancelText:`取消`,onOk:()=>{I(!0),l.success(`评分已提交，结果已锁定`)}})},finish=()=>{if(!j){l.warning(`请先完成电子签名`);return}submitAll()},summarizeResults=()=>{if(!G){l.warning(`请等待所有专家提交评分`);return}u.confirm({title:`统计评标结果`,content:`系统将汇总所有专家评分并生成推荐意见，是否继续？`,okText:`确认统计`,cancelText:`取消`,onOk:()=>{l.success(`评标结果已统计汇总`),R(!0)}})},generateReport=()=>{if(!L){l.warning(`请先统计评标结果`);return}u.confirm({title:`生成评标报告`,content:`生成评标报告后将进入定标流程，是否继续？`,okText:`确认生成`,cancelText:`取消`,onOk:()=>{l.success(`评标报告已生成`)}})},startTour=()=>{E({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[{element:`#expert-steps`,popover:{title:`评标流程`,description:`评标共分为 6 步：回避声明 → 专家签到 → 推选组长 → 查阅资料 → 在线评分 → 电子签名。`,side:`bottom`,align:`center`}},{element:`.step-content`,popover:{title:`当前步骤`,description:`按提示完成当前步骤操作，完成后点击底部按钮进入下一步。`,side:`right`,align:`start`}},{element:`#expert-submit-btn`,popover:{title:`提交评分`,description:`所有专家评分并签名后，点击此处提交评标结果。`,side:`bottom`,align:`center`}}]}).drive()},K=[{title:`专家姓名`,dataIndex:`name`},{title:`专业领域`,dataIndex:`field`},{title:`签到状态`,dataIndex:`status`},{title:`操作`,width:180,render:(e,t)=>(0,O.jsx)(r,{type:`primary`,size:`small`,disabled:t.isLeader,onClick:()=>voteLeader(t),children:t.isLeader?`已当选组长`:`推选为组长`})}],q=[{name:n?`招标文件（${n.versionNo}）`:`招标文件`,color:`#409EFF`,version:n?.versionNo},{name:`投标文件`,color:`#67C23A`},{name:`开标记录`,color:`#E6A23C`}],J=H.map((e,t)=>({key:e.name,label:e.name,children:(0,O.jsxs)(v,{labelCol:{flex:`0 0 120px`},wrapperCol:{flex:`auto`},children:[(0,O.jsxs)(h,{gutter:20,children:[(0,O.jsx)(m,{span:8,children:(0,O.jsx)(v.Item,{label:`商务标`,children:(0,O.jsx)(s,{min:0,max:30,disabled:F,value:e.business,onChange:e=>updateBidder(t,`business`,e)})})}),(0,O.jsx)(m,{span:8,children:(0,O.jsx)(v.Item,{label:`技术标`,children:(0,O.jsx)(s,{min:0,max:40,disabled:F,value:e.tech,onChange:e=>updateBidder(t,`tech`,e)})})}),(0,O.jsx)(m,{span:8,children:(0,O.jsx)(v.Item,{label:`价格标`,children:(0,O.jsx)(s,{min:0,max:30,disabled:F,value:e.price,onChange:e=>updateBidder(t,`price`,e)})})})]}),(0,O.jsx)(v.Item,{label:`评审意见`,children:(0,O.jsx)(b.TextArea,{rows:3,placeholder:`请填写评审意见`,disabled:F,value:e.comment,onChange:e=>updateBidder(t,`comment`,e.target.value)})})]})})),Y=H.map(e=>({...e,total:(e.business||0)+(e.tech||0)+(e.price||0)})).sort((e,t)=>t.total-e.total);return(0,O.jsxs)(`div`,{className:`expert-project`,children:[(0,O.jsxs)(d,{title:(0,O.jsxs)(`div`,{className:`hall-header`,children:[(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`h2`,{children:`评标项目`}),(0,O.jsxs)(`p`,{className:`subtitle`,children:[`XX市轨道交通设备采购项目 · 标段一：主设备 · 项目ID：`,e]})]}),(0,O.jsxs)(`div`,{className:`hall-meta`,children:[(0,O.jsx)(T,{label:F?`已提交锁定`:`评标中`,status:F?`completed`:`processing`}),!F&&(0,O.jsx)(r,{type:`primary`,ghost:!0,icon:(0,O.jsx)(y,{}),onClick:startTour,children:`评标引导`}),(0,O.jsx)(r,{onClick:t,children:`返回列表`}),F?(0,O.jsx)(r,{disabled:!0,children:`已提交`}):(0,O.jsx)(r,{id:`expert-submit-btn`,type:`primary`,onClick:submitAll,children:`提交我的评分`}),V&&F&&(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(r,{type:`primary`,ghost:!0,onClick:summarizeResults,children:`统计评标结果`}),(0,O.jsx)(r,{type:`primary`,onClick:generateReport,disabled:!L,children:`生成评标报告`})]})]})]}),children:[(0,O.jsx)(`div`,{id:`expert-steps`,style:{marginBottom:24},children:(0,O.jsx)(x,{current:i,items:[{title:`回避声明`},{title:`专家签到`},{title:`推选组长`},{title:`查阅资料`},{title:`在线评分`},{title:`电子签名`}]})}),(0,O.jsxs)(`div`,{className:`step-panel`,children:[i===0&&(0,O.jsxs)(`div`,{className:`step-content`,children:[(0,O.jsx)(`h3`,{children:`回避声明与评标纪律`}),(0,O.jsx)(`p`,{className:`tip`,children:`请确认与投标人不存在利害关系，并承诺遵守评标纪律。`}),(0,O.jsxs)(d,{className:`declare-card`,size:`small`,children:[(0,O.jsx)(`p`,{children:`1. 本人与本次招标项目的投标人及其利害关系人不存在任何利害关系；`}),(0,O.jsx)(`p`,{children:`2. 本人将严格按照招标文件和评标办法独立、客观、公正地进行评审；`}),(0,O.jsx)(`p`,{children:`3. 本人不会泄露评标过程中的任何商业秘密和投标人的保密信息。`})]}),(0,O.jsx)(p,{checked:o,onChange:e=>S(e.target.checked),style:{marginTop:16},children:`我已阅读并遵守上述回避声明和评标纪律`}),(0,O.jsx)(`div`,{className:`stage-action`,children:(0,O.jsx)(r,{type:`primary`,size:`large`,disabled:!o,onClick:()=>a(e=>e+1),children:o?`下一步：专家签到`:`请先勾选回避声明`})})]}),i===1&&(0,O.jsxs)(`div`,{className:`step-content`,children:[(0,O.jsx)(`h3`,{children:`专家签到`}),(0,O.jsx)(`p`,{className:`tip`,children:`请确认身份信息并完成在线签到，评标开始前需全部专家签到完毕。`}),(0,O.jsxs)(g,{column:2,bordered:!0,children:[(0,O.jsx)(g.Item,{label:`项目名称`,children:`XX市轨道交通设备采购项目`}),(0,O.jsx)(g.Item,{label:`评标地点`,children:`线上评标大厅`}),(0,O.jsx)(g.Item,{label:`专家姓名`,children:`专家甲`}),(0,O.jsx)(g.Item,{label:`专业领域`,children:`电子信息`})]}),(0,O.jsxs)(`div`,{className:`stage-action`,children:[(0,O.jsx)(r,{onClick:()=>a(e=>e-1),children:`返回`}),(0,O.jsx)(r,{type:`primary`,size:`large`,onClick:checkIn,children:`完成签到`})]})]}),i===2&&(0,O.jsxs)(`div`,{className:`step-content`,children:[(0,O.jsx)(`h3`,{children:`推选评标组长`}),(0,O.jsx)(`p`,{className:`tip`,children:`评标委员会成员可自荐或推选组长，组长负责汇总评分和生成报告。`}),(0,O.jsx)(c,{columns:K,dataSource:z,rowKey:`name`,pagination:!1,style:{width:`100%`}}),(0,O.jsxs)(`div`,{className:`stage-action`,children:[(0,O.jsx)(r,{onClick:()=>a(e=>e-1),children:`返回`}),(0,O.jsx)(r,{type:`primary`,size:`large`,disabled:!V,onClick:()=>a(e=>e+1),children:V?`下一步：查阅资料`:`请先推选组长`})]})]}),i===3&&(0,O.jsxs)(`div`,{className:`step-content`,children:[(0,O.jsx)(`h3`,{children:`查阅投标资料`}),(0,O.jsx)(`p`,{className:`tip`,children:`请仔细查阅招标文件、投标文件、开标记录和报价一览表，为评分做准备。`}),(0,O.jsx)(h,{gutter:20,children:q.map(e=>(0,O.jsx)(m,{span:8,children:(0,O.jsxs)(d,{hoverable:!0,className:`doc-card`,onClick:()=>viewDoc(e.name),children:[(0,O.jsx)(_,{style:{fontSize:32,color:e.color}}),(0,O.jsx)(`p`,{children:e.name})]})},e.name))}),(0,O.jsxs)(`div`,{className:`stage-action`,children:[(0,O.jsx)(r,{onClick:()=>a(e=>e-1),children:`返回`}),(0,O.jsx)(p,{checked:k,onChange:e=>A(e.target.checked),style:{marginRight:12},children:`我已查阅全部投标资料`}),(0,O.jsx)(r,{type:`primary`,size:`large`,disabled:!k,onClick:()=>a(e=>e+1),children:`我已查阅，开始评分`})]})]}),i===4&&(0,O.jsxs)(`div`,{className:`step-content`,children:[(0,O.jsx)(`h3`,{children:`在线评分`}),(0,O.jsx)(`p`,{className:`tip`,children:`请按评分项独立打分，每个投标人满分 100 分（商务 30 + 技术 40 + 价格 30）。`}),(0,O.jsx)(f,{type:`card`,items:J}),(0,O.jsxs)(`div`,{className:`stage-action`,children:[(0,O.jsx)(r,{onClick:()=>a(e=>e-1),children:`返回`}),(0,O.jsx)(r,{type:`primary`,size:`large`,disabled:!W||F,onClick:()=>a(e=>e+1),children:F?`已锁定`:W?`提交评分并签名`:`请完成所有评分`})]})]}),i===5&&(0,O.jsxs)(`div`,{className:`step-content`,children:[(0,O.jsx)(`h3`,{children:`电子签名确认`}),(0,O.jsx)(`p`,{className:`tip`,children:`请使用 CA 证书对评分结果和评标报告进行电子签名，签名后不可修改。`}),(0,O.jsx)(d,{className:`sign-area${j?` signed`:``}`,size:`small`,children:(0,O.jsxs)(`div`,{className:`sign-placeholder`,onClick:doSign,children:[(0,O.jsx)(C,{style:{fontSize:48,color:j?`#67C23A`:`#409EFF`}}),(0,O.jsx)(`p`,{children:j?`电子签名已完成`:`点击此处进行电子签名`}),j&&(0,O.jsxs)(`p`,{className:`sign-time`,children:[`签名时间：`,N]})]})}),V&&F&&(0,O.jsxs)(d,{title:`组长：评标结果汇总`,size:`small`,style:{marginTop:20},children:[(0,O.jsx)(c,{rowKey:`name`,dataSource:Y,pagination:!1,columns:[{title:`排名`,render:(e,t,n)=>n+1,width:80},{title:`投标人`,dataIndex:`name`},{title:`总分`,dataIndex:`total`,width:100}]}),(0,O.jsxs)(`div`,{className:`stage-action`,children:[(0,O.jsx)(r,{type:`primary`,ghost:!0,onClick:summarizeResults,children:`统计评标结果`}),(0,O.jsx)(r,{type:`primary`,onClick:generateReport,disabled:!L,children:`生成评标报告`})]})]}),(0,O.jsxs)(`div`,{className:`stage-action`,children:[(0,O.jsx)(r,{disabled:F,onClick:()=>a(e=>e-1),children:`返回修改`}),(0,O.jsx)(r,{type:`primary`,size:`large`,disabled:!j||F,onClick:finish,children:F?`已完成提交`:`完成签名并提交`})]})]})]})]}),(0,O.jsx)(`style`,{children:`
        .expert-project {
          max-width: 1100px;
          margin: 0 auto;
        }
        .expert-project .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .expert-project .hall-header h2 {
          margin: 0;
        }
        .expert-project .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .expert-project .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .expert-project .step-content h3 {
          margin-bottom: 8px;
        }
        .expert-project .tip {
          color: #666;
          margin-bottom: 16px;
        }
        .expert-project .declare-card p {
          margin: 8px 0;
          line-height: 1.6;
          color: #333;
        }
        .expert-project .doc-card {
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .expert-project .doc-card:hover {
          transform: translateY(-4px);
        }
        .expert-project .doc-card p {
          margin-top: 8px;
        }
        .expert-project .sign-area {
          background: #f9fafc;
        }
        .expert-project .sign-area.signed {
          background: #f0f9eb;
        }
        .expert-project .sign-placeholder {
          height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #dcdfe6;
          border-radius: 8px;
          cursor: pointer;
        }
        .expert-project .sign-area.signed .sign-placeholder {
          border-color: #67C23A;
        }
        .expert-project .sign-time {
          color: #67C23A;
          font-size: 12px;
          margin-top: 8px;
        }
        .expert-project .stage-action {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }
      `})]})}var A=o(`/admin/expert-project`)({component:ExpertProject});export{A as Route};