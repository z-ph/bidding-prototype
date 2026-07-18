import{c as e}from"./useStore-DliLxn3V.js";import{_n as t,t as n}from"./button-CFq-rqtk.js";import{n as r,r as i,t as a}from"./BookOutlined-dE4n5okb.js";import{t as o}from"./QuestionCircleOutlined-mDJkIrKz.js";import{t as s}from"./driver-DyuIdVyB.js";var c=e();function PortalHeader({activeKey:e}){let l=t(),u=i(),startTour=()=>{let run=()=>{s({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[{element:`.logo`,popover:{title:`欢迎来到招投标采购平台`,description:`这里是平台门户，您可以浏览公告、注册账号或登录系统。`,side:`bottom`,align:`center`}},{element:`#portal-notice-section`,popover:{title:`招标公告`,description:`这里展示所有招标公告、变更公告、候选人公示和中标公告，您可以按类型筛选。`,side:`top`,align:`start`}},{element:`#portal-notice-table`,popover:{title:`查看公告详情`,description:`点击公告标题查看详情与附件；供应商登录后进入工作台「项目中心」，从下载招标文件开始参与投标。`,side:`top`,align:`center`}},{element:`#portal-quick-links`,popover:{title:`快速入口`,description:`供应商注册、下载中心、帮助中心、招标人入口，一键直达。`,side:`top`,align:`start`}},{element:`#portal-login-btn`,popover:{title:`开始体验`,description:`点击登录，选择您的角色，进入对应的工作台。`,side:`bottom`,align:`center`}}]}).drive()};u.pathname===`/`?run():(l({to:`/`}),setTimeout(run,400))},goHome=()=>{l({to:`/`}),window.scrollTo({top:0,behavior:`smooth`})},navItemClass=t=>e===t?`nav-active`:``;return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)(r.Header,{className:`portal-header`,children:[(0,c.jsxs)(`div`,{className:`logo`,children:[(0,c.jsx)(a,{style:{marginRight:10,fontSize:28}}),(0,c.jsx)(`span`,{children:`招投标采购平台`})]}),(0,c.jsxs)(`div`,{className:`nav`,children:[(0,c.jsx)(n,{type:`link`,className:navItemClass(`home`),onClick:goHome,children:`首页`}),(0,c.jsx)(n,{type:`link`,className:navItemClass(`review`),onClick:()=>l({to:`/review-change-list`}),children:`评审变更`}),(0,c.jsx)(n,{type:`link`,className:navItemClass(`news`),onClick:()=>l({to:`/news`}),children:`新闻公告`}),(0,c.jsx)(n,{type:`link`,className:navItemClass(`help`),onClick:()=>l({to:`/help`}),children:`帮助中心`}),(0,c.jsx)(n,{type:`link`,className:navItemClass(`downloads`),onClick:()=>l({to:`/downloads`}),children:`下载中心`}),(0,c.jsx)(n,{type:`link`,className:navItemClass(`contact`),onClick:()=>l({to:`/contact`}),children:`联系我们`})]}),(0,c.jsxs)(`div`,{className:`actions`,children:[(0,c.jsx)(n,{type:`link`,icon:(0,c.jsx)(o,{}),onClick:startTour,children:`新手指引`}),(0,c.jsx)(n,{type:`link`,onClick:()=>l({to:`/register`}),children:`注册`}),(0,c.jsx)(n,{id:`portal-login-btn`,type:`primary`,onClick:()=>l({to:`/login`}),children:`登录`})]})]}),(0,c.jsx)(`style`,{children:`
        .portal-header {
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          padding: 0 20px;
          line-height: 64px;
        }
        .logo {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
          color: #001529;
          cursor: pointer;
        }
        .nav {
          display: flex;
          gap: 10px;
        }
        .nav-active {
          color: #1677ff !important;
          font-weight: 500;
        }
        .actions {
          display: flex;
          align-items: center;
        }
      `})]})}export{PortalHeader as t};