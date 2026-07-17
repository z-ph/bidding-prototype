import{Q as e,X as t,Y as n,c as r}from"./useStore-DliLxn3V.js";import{U as i,gn as a,t as o}from"./button-B1Wwau7K.js";import{t as s}from"./table-kj3Kqn80.js";import{t as c}from"./message-JNHFxrNa.js";import{h as l}from"./style-Bw8PR00t.js";import{t as u}from"./card-BrdtLDdw.js";import{n as d}from"./tabs-4-G4o229.js";import{n as f,t as p}from"./row-D6x3dI6b.js";import{t as m}from"./ClockCircleOutlined-Sf3usDKG.js";import{t as h}from"./descriptions-aPpOgtJi.js";import{t as g}from"./FileTextOutlined-CgamR4-K.js";import{t as _}from"./QuestionCircleOutlined-CBrGelJ1.js";import{t as v}from"./result-DQJDfhM3.js";import{t as y}from"./FolderOutlined-CMvv9lB7.js";import{t as b}from"./tag-zBq3O40n.js";import{t as x}from"./timeline-DisIb2Yi.js";import{t as S}from"./BellOutlined-D0Bs1Dmk.js";import{t as C}from"./FileProtectOutlined-DIXbOMnt.js";import{t as w}from"./PlayCircleOutlined-DIkUoqDF.js";import{t as T}from"./StarOutlined-D4iLQqvb.js";import{t as E}from"./UploadOutlined-DI-vVzQB.js";import{t as D}from"./WalletOutlined-CNNW-b45.js";import{t as O}from"./useRole-WcKxCdcY.js";import{t as k}from"./StatusTag-t77kJkKD.js";import{t as A}from"./driver-DyuIdVyB.js";var j=t((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.default={icon:{tag:`svg`,attrs:{viewBox:`64 64 896 896`,focusable:`false`},children:[{tag:`path`,attrs:{d:`M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z`}},{tag:`path`,attrs:{d:`M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z`}}]},name:`info-circle`,theme:`outlined`}})),M=e(n()),N=e(j());function _extends(){return _extends=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},_extends.apply(this,arguments)}var P=M.forwardRef((e,t)=>M.createElement(i,_extends({},e,{ref:t,icon:N.default}))),F=r();function Dashboard(){let e=a(),{role:t}=O(),n={tenderee:`招标人工作台`,agent:`招标代理工作台`,bidder:`投标人工作台`,expert:`评标专家工作台`,supervisor:`监督工作台`,admin:`平台管理控制台`}[t]||`工作台`,r=(0,M.useMemo)(()=>({tenderee:`发起采购需求、管理项目、确认评标和定标结果`,agent:`受委托执行招标流程，编制文件、发公告、组织开评标`,bidder:`报名、缴费、下载文件、上传投标文件、报价`,expert:`参与评标、独立评分、签署评标报告`,supervisor:`查看并监督开标、评标、定标全过程`,admin:`维护系统基础数据、用户权限、日志审计`})[t]||``,[t]),i=[{title:`进行中项目`,value:12,icon:y,bg:`#409EFF`},{title:`待开标项目`,value:3,icon:w,bg:`#67C23A`},{title:`待评标项目`,value:2,icon:T,bg:`#E6A23C`},{title:`今日截止`,value:1,icon:m,bg:`#F56C6C`}],j=[{title:`可参与项目`,value:5,icon:l,bg:`#409EFF`},{title:`已报名项目`,value:3,icon:C,bg:`#67C23A`},{title:`待缴费`,value:1,icon:D,bg:`#E6A23C`},{title:`待上传标书`,value:2,icon:E,bg:`#F56C6C`}],N=t===`agent`?[{id:1,content:`XX市轨道交通设备采购项目即将开标，请完成开标前准备`,type:`warning`,time:`2026-07-08 10:00`,path:`/admin/opening-hall`,projectId:`1`},{id:2,content:`办公桌椅采购项目招标文件需复核后发布`,type:`primary`,time:`2026-07-08 09:30`,path:`/admin/tender-doc`,projectId:`2`},{id:3,content:`软件开发服务项目评标报告待汇总提交`,type:`danger`,time:`2026-07-07 16:00`,path:`/admin/evaluation-hall`,projectId:`3`},{id:4,content:`物业服务采购项目中标通知书待发送`,type:`success`,time:`2026-07-07 11:20`,path:`/admin/award-notice`,projectId:`4`}]:[{id:1,content:`XX市轨道交通设备采购项目即将开标，请确认开标安排`,type:`warning`,time:`2026-07-08 10:00`,path:`/admin/opening-hall`,projectId:`1`},{id:2,content:`办公桌椅采购项目有 2 家供应商报名，请审核资质`,type:`primary`,time:`2026-07-08 09:30`,path:`/admin/projects`,projectId:`2`},{id:3,content:`软件开发服务项目评标报告待审批`,type:`danger`,time:`2026-07-07 16:00`,path:`/admin/award-confirm`,projectId:`3`},{id:4,content:`物业服务采购项目中标公告待发布`,type:`success`,time:`2026-07-07 11:20`,path:`/admin/notice-publish`,projectId:`4`}],I=[{id:1,content:`XX市轨道交通设备采购项目已报名通过，请缴纳招标文件费`,type:`warning`,time:`2026-07-08`,path:`/admin/bid-payment`,projectId:`1`},{id:2,content:`软件开发服务项目待上传投标文件并报价`,type:`danger`,time:`2026-07-07`,path:`/admin/bid-upload`,projectId:`3`}],L=[{project:`XX市轨道交通设备采购项目`,stage:`评标中`,deadline:`2026-07-10 17:00`}],R=t===`agent`?[{title:`创建项目`,icon:d,color:`#409EFF`,path:`/admin/projects/create`},{title:`发布公告`,icon:S,color:`#E6A23C`,path:`/admin/notice-publish`},{title:`开标大厅`,icon:w,color:`#67C23A`,path:`/admin/opening-hall`},{title:`评标大厅`,icon:T,color:`#F56C6C`,path:`/admin/evaluation-hall`}]:[{title:`创建项目`,icon:d,color:`#409EFF`,path:`/admin/projects/create`},{title:`审批文件`,icon:g,color:`#909399`,path:`/admin/tender-doc`},{title:`确认中标`,icon:S,color:`#E6A23C`,path:`/admin/award-confirm`},{title:`合同归档`,icon:C,color:`#67C23A`,path:`/admin/contract-archive`}],z=[{id:1,name:`XX市轨道交通设备采购项目`,code:`ZB20260701001`,type:`公开招标`,stage:`报名中`,deadline:`2026-07-20 17:00`},{id:2,name:`办公桌椅采购项目`,code:`ZB20260702002`,type:`公开询比价`,stage:`待开标`,deadline:`2026-07-18 14:00`},{id:3,name:`软件开发服务项目`,code:`ZB20260703003`,type:`邀请招标`,stage:`评标中`,deadline:`2026-07-15 09:00`},{id:4,name:`实验室设备采购项目`,code:`ZB20260705005`,type:`公开招标`,stage:`招标中`,deadline:`2026-07-25 17:00`}],handleTodo=t=>{t.projectId?e({to:t.path,search:{projectId:t.projectId}}):e({to:t.path})},viewProject=e=>c.success(`查看项目详情：${e.name}`),continueProject=t=>{let n={招标中:`/admin/tender-doc`,报名中:`/admin/projects`,待开标:`/admin/opening-hall`,评标中:`/admin/evaluation-hall`}[t.stage]||`/admin/projects`;t.id&&[`/admin/opening-hall`,`/admin/tender-doc`].includes(n)?e({to:n,search:{projectId:String(t.id)}}):e({to:n})},B={warning:`orange`,primary:`blue`,danger:`red`,success:`green`},V=[{title:`项目名称`,dataIndex:`name`,key:`name`,minWidth:250},{title:`项目编号`,dataIndex:`code`,key:`code`,width:160},{title:`采购方式`,dataIndex:`type`,key:`type`,width:120},{title:`当前阶段`,dataIndex:`stage`,key:`stage`,width:140,render:e=>(0,F.jsx)(k,{label:e,status:e})},{title:`截止时间`,dataIndex:`deadline`,key:`deadline`,width:150},{title:`操作`,key:`action`,width:180,render:(e,t)=>(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(o,{type:`link`,onClick:()=>viewProject(t),children:`详情`}),(0,F.jsx)(o,{type:`link`,onClick:()=>continueProject(t),children:`继续`})]})}],H=[{title:`项目名称`,dataIndex:`project`,key:`project`,minWidth:260},{title:`当前阶段`,dataIndex:`stage`,key:`stage`,width:140},{title:`截止时间`,dataIndex:`deadline`,key:`deadline`,width:180},{title:`操作`,key:`action`,width:150,render:()=>(0,F.jsx)(o,{type:`primary`,size:`small`,onClick:()=>e({to:`/admin/expert-project`}),children:`开始评标`})}],startTour=()=>{let e=[{element:`.role-banner`,popover:{title:n,description:r,side:`bottom`,align:`center`}}],i={tenderee:[{element:`.stat-row`,popover:{title:`数据概览`,description:`快速了解进行中项目、待开标、待评标和今日截止等核心数据。`,side:`bottom`,align:`start`}},{element:`#dashboard-todos`,popover:{title:`待办事项`,description:`这里列出需要您处理的最新待办，点击“处理”可直达对应页面。`,side:`right`,align:`start`}},{element:`#dashboard-quick`,popover:{title:`快捷入口`,description:`创建项目、发布公告、上传文件、编辑招标文件，一键进入常用功能。`,side:`left`,align:`start`}}],agent:[{element:`.stat-row`,popover:{title:`数据概览`,description:`快速了解进行中项目、待开标、待评标和今日截止等核心数据。`,side:`bottom`,align:`start`}},{element:`#dashboard-todos`,popover:{title:`待办事项`,description:`报名审核、评标报告、公告发布等需要您处理的待办。`,side:`right`,align:`start`}},{element:`#dashboard-quick`,popover:{title:`快捷入口`,description:`创建项目、发布公告、上传文件、编辑招标文件，一键进入常用功能。`,side:`left`,align:`start`}}],bidder:[{element:`.stat-row`,popover:{title:`我的投标看板`,description:`可参与项目、已报名项目、待缴费、待上传标书一目了然。`,side:`bottom`,align:`start`}},{element:`.todo-card`,popover:{title:`投标待办`,description:`系统会按项目进度提醒您接下来该做什么，点击“去处理”即可继续。`,side:`right`,align:`start`}}],expert:[{element:`.ant-card`,popover:{title:`评标任务`,description:`这里显示分配给您评标的项目，点击“开始评标”进入评标大厅。`,side:`bottom`,align:`start`}}],supervisor:[{element:`.ant-card`,popover:{title:`监督概览`,description:`查看今日开标、评标场次和异常预警，进入监督大厅可查看详细过程。`,side:`bottom`,align:`start`}}],admin:[{element:`.stat-row`,popover:{title:`平台运营数据`,description:`注册供应商、待审核供应商、平台项目、异常预警等核心指标。`,side:`bottom`,align:`start`}}]};A({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[...e,...i[t]||[]]}).drive()},renderStatCard=e=>{let t=e.icon;return(0,F.jsx)(u,{hoverable:!0,styles:{body:{padding:`20px`}},children:(0,F.jsxs)(`div`,{className:`stat-card`,children:[(0,F.jsx)(`div`,{className:`stat-icon`,style:{background:e.bg},children:(0,F.jsx)(t,{style:{fontSize:28,color:`#fff`}})}),(0,F.jsxs)(`div`,{className:`stat-info`,children:[(0,F.jsx)(`div`,{className:`stat-value`,children:e.value}),(0,F.jsx)(`div`,{className:`stat-title`,children:e.title})]})]})})};return(0,F.jsxs)(`div`,{className:`dashboard`,children:[(0,F.jsxs)(`div`,{className:`role-banner`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`h2`,{children:n}),(0,F.jsx)(`p`,{children:r})]}),(0,F.jsx)(o,{icon:(0,F.jsx)(_,{}),onClick:startTour,children:`工作台引导`})]}),(t===`tenderee`||t===`agent`)&&(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(p,{gutter:20,className:`stat-row`,children:i.map(e=>(0,F.jsx)(f,{span:6,children:renderStatCard(e)},e.title))}),(0,F.jsxs)(p,{gutter:20,className:`module-row`,children:[(0,F.jsx)(f,{span:16,children:(0,F.jsx)(u,{title:(0,F.jsxs)(`div`,{id:`dashboard-todos`,className:`card-header`,children:[(0,F.jsx)(`span`,{children:`待办事项`}),(0,F.jsxs)(b,{color:`error`,children:[N.length,` 项待处理`]})]}),className:`todo-card`,children:(0,F.jsx)(x,{items:N.map(e=>({key:e.id,color:B[e.type],content:(0,F.jsxs)(F.Fragment,{children:[(0,F.jsxs)(`div`,{className:`todo-item`,children:[(0,F.jsx)(`span`,{children:e.content}),(0,F.jsx)(o,{type:`primary`,size:`small`,onClick:()=>handleTodo(e),children:`处理`})]}),(0,F.jsx)(`div`,{style:{color:`#999`,fontSize:12,marginTop:4},children:e.time})]})}))})})}),(0,F.jsx)(f,{span:8,children:(0,F.jsx)(u,{title:(0,F.jsx)(`div`,{id:`dashboard-quick`,className:`card-header`,children:(0,F.jsx)(`span`,{children:`快捷入口`})}),className:`quick-card`,children:(0,F.jsx)(`div`,{className:`quick-grid`,children:R.map(t=>{let n=t.icon;return(0,F.jsxs)(`div`,{className:`quick-entry`,onClick:()=>e({to:t.path}),children:[(0,F.jsx)(n,{style:{fontSize:24,color:t.color}}),(0,F.jsx)(`span`,{children:t.title})]},t.title)})})})})]}),(0,F.jsx)(u,{title:(0,F.jsxs)(`div`,{className:`card-header`,children:[(0,F.jsx)(`span`,{children:`最近项目`}),(0,F.jsx)(o,{type:`link`,onClick:()=>e({to:`/admin/projects`}),children:`查看全部`})]}),className:`project-card`,children:(0,F.jsx)(s,{rowKey:`id`,dataSource:z,columns:V,pagination:!1})})]}),t===`bidder`&&(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(p,{gutter:20,className:`stat-row`,children:j.map(e=>(0,F.jsx)(f,{span:6,children:renderStatCard(e)},e.title))}),(0,F.jsx)(u,{title:(0,F.jsxs)(`div`,{className:`card-header`,children:[(0,F.jsx)(`span`,{children:`我的投标待办`}),(0,F.jsx)(o,{type:`link`,onClick:()=>e({to:`/admin/bidder-projects`}),children:`查看全部项目`})]}),children:(0,F.jsx)(x,{items:I.map(e=>({key:e.id,color:B[e.type],content:(0,F.jsxs)(F.Fragment,{children:[(0,F.jsxs)(`div`,{className:`todo-item`,children:[(0,F.jsx)(`span`,{children:e.content}),(0,F.jsx)(o,{type:`primary`,size:`small`,onClick:()=>handleTodo(e),children:`去处理`})]}),(0,F.jsx)(`div`,{style:{color:`#999`,fontSize:12,marginTop:4},children:e.time})]})}))})})]}),t===`expert`&&(0,F.jsx)(u,{title:(0,F.jsxs)(`div`,{className:`card-header`,children:[(0,F.jsx)(`span`,{children:`我的评标任务`}),(0,F.jsx)(o,{type:`link`,onClick:()=>e({to:`/admin/expert-project`}),children:`进入评标大厅`})]}),children:(0,F.jsx)(s,{rowKey:`project`,dataSource:L,columns:H,pagination:!1})}),t===`supervisor`&&(0,F.jsx)(u,{title:(0,F.jsxs)(`div`,{className:`card-header`,children:[(0,F.jsx)(`span`,{children:`监督概览`}),(0,F.jsx)(o,{type:`link`,onClick:()=>e({to:`/admin/supervisor-hall`}),children:`进入监督大厅`})]}),children:(0,F.jsxs)(h,{column:3,bordered:!0,children:[(0,F.jsx)(h.Item,{label:`今日开标`,children:`3 场`}),(0,F.jsx)(h.Item,{label:`今日评标`,children:`2 场`}),(0,F.jsx)(h.Item,{label:`异常预警`,children:`0 条`})]})}),t===`admin`&&(0,F.jsx)(v,{icon:(0,F.jsx)(P,{}),title:`管理员工作台`,subTitle:`管理员请使用左侧“管理控制台”菜单进入后台功能`,extra:(0,F.jsx)(o,{type:`primary`,onClick:()=>e({to:`/admin/admin-dashboard`}),children:`进入管理控制台`})}),(0,F.jsx)(`style`,{children:`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .role-banner {
          background: linear-gradient(90deg, #001529 0%, #003366 100%);
          color: #fff;
          padding: 24px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .role-banner h2 {
          margin: 0 0 8px;
          color: #fff;
        }
        .role-banner p {
          margin: 0;
          opacity: 0.85;
        }
        .stat-row {
          margin-bottom: 0 !important;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #001529;
        }
        .stat-title {
          color: #666;
          font-size: 14px;
        }
        .module-row {
          margin-top: 0 !important;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .quick-entry {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
          background: #f5f7fa;
        }
        .quick-entry:hover {
          background: #e6f2ff;
        }
        .quick-entry span {
          font-size: 14px;
          color: #333;
        }
        .project-card {
          margin-top: 0;
        }
      `})]})}export{Dashboard as t};