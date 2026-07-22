import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{_n as r,t as i}from"./button-CFq-rqtk.js";import{n as a}from"./fileRoute-uDG0Xyjp.js";import{t as o}from"./message-DYXrK1o7.js";import{t as s}from"./space-B-eeZLNu.js";import{t as c}from"./tabs-CNPr8l-V.js";import{t as l}from"./CheckOutlined-CpPv3_2m.js";import{t as u}from"./form-CTexRMCX.js";import{t as d}from"./QuestionCircleOutlined-mDJkIrKz.js";import{t as f}from"./input-NJCky5ev.js";import{t as p}from"./tag-CC1OK38A.js";import{t as m}from"./LockOutlined-CdLF9bEJ.js";import{l as h,p as g}from"./index-BVrzx6M0.js";import{t as _}from"./useRole-Di0cTDpa.js";import{t as v}from"./driver-DyuIdVyB.js";var y=e(t(),1),b=n(),x={admin:`all`,tenderee:`enterprise`,agent:`enterprise`,bidder:`enterprise`,expert:`enterprise`,supervisor:`all`};function Login(){let e=r(),{login:t,isAuthenticated:n,redirectToWorkspace:a}=_(),[S,C]=(0,y.useState)(`account`),[w]=u.useForm(),[T]=u.useForm(),[E]=u.useForm(),[D,O]=(0,y.useState)(0),[k,A]=(0,y.useState)({status:`idle`,message:``});(0,y.useEffect)(()=>{n&&a()},[n,a]),(0,y.useEffect)(()=>{if(D<=0)return;let e=setInterval(()=>O(e=>e-1),1e3);return()=>clearInterval(e)},[D]);let j={tenderee:`/admin/dashboard`,agent:`/admin/dashboard`,bidder:`/admin/dashboard`,expert:`/admin/dashboard`,supervisor:`/admin/supervisor-hall`,admin:`/admin/dashboard`},doLogin=(n,r,i=`账号`)=>{let a=x[n]||`all`;t(n,r,{},a),o.success(`以 ${h[n]} 身份登录成功（${i}）`),e({to:j[n]})},accountLogin=()=>{let e=String(w.getFieldValue(`account`)||`tenderee`).trim(),t=g(e);doLogin(t,e,`账号密码`)},sendCode=()=>{o.success(`验证码已发送：123456`),O(60)},phoneLogin=()=>{let e=T.getFieldValue(`phone`)||`13800138000`;doLogin(`bidder`,e,`手机验证码`)},caLogin=()=>{let e=String(E.getFieldValue(`account`)||`ca`).trim();A({status:`checking`,message:`正在检测 CA 证书...`}),setTimeout(()=>{A({status:`success`,message:`证书检测通过`});let t=g(e)||`bidder`;doLogin(t,e,`CA 证书`)},800)},startTour=()=>{C(`account`),v({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[{element:`#login-tabs`,popover:{title:`选择登录方式`,description:`平台支持账号密码、CA 数字证书、手机验证码三种登录方式，点击标签切换。`,side:`bottom`,align:`center`}},{element:`#login-role`,popover:{title:`选择您的角色`,description:`平台支持招标人、招标代理、投标人、评标专家、监督人员、平台管理员六种角色，登录后进入对应工作台。`,side:`right`,align:`center`},onHighlighted:()=>C(`account`)},{element:`#login-submit`,popover:{title:`账号密码登录`,description:`选择角色并输入账号密码后，点击登录进入工作台。`,side:`top`,align:`center`},onHighlighted:()=>C(`account`)},{element:`#login-ca-panel`,popover:{title:`CA 数字证书登录`,description:`插入 CA UKey 后，点击"检测证书并登录"完成高安全身份认证。首次使用请下载 CA 驱动或申请证书。`,side:`left`,align:`center`},onHighlighted:()=>C(`ca`)},{element:`#login-phone-panel`,popover:{title:`手机验证码登录`,description:`输入手机号，点击"获取验证码"，输入收到的短信验证码后登录。`,side:`left`,align:`center`},onHighlighted:()=>C(`phone`)},{element:`#login-phone-code`,popover:{title:`获取验证码`,description:`系统会向您的手机发送一条短信验证码，演示环境固定为 123456。`,side:`top`,align:`center`},onHighlighted:()=>C(`phone`)}]}).drive()},M=(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)(u,{form:w,layout:`vertical`,initialValues:{account:`tenderee`,password:`123456`},children:[(0,b.jsx)(u.Item,{label:`账号`,name:`account`,children:(0,b.jsx)(f,{placeholder:`请输入账号，如 tenderee / agent / bidder`})}),(0,b.jsx)(u.Item,{label:`密码`,name:`password`,children:(0,b.jsx)(f.Password,{placeholder:`演示环境无需密码，任意填写`})}),(0,b.jsx)(u.Item,{children:(0,b.jsx)(i,{id:`login-submit`,type:`primary`,style:{width:`100%`},onClick:accountLogin,children:`登录`})})]}),(0,b.jsxs)(`div`,{id:`login-role`,className:`role-hint`,children:[(0,b.jsx)(`p`,{children:`演示账号与角色（点击一键登录）：`}),(0,b.jsx)(s,{wrap:!0,children:[{key:`tenderee`,label:`招标人`},{key:`agent`,label:`招标代理`},{key:`bidder`,label:`投标人`},{key:`expert`,label:`评标专家`},{key:`supervisor`,label:`监督人员`},{key:`admin`,label:`管理员`}].map(e=>(0,b.jsx)(i,{size:`small`,onClick:()=>{w.setFieldsValue({account:e.key,password:`123456`}),doLogin(e.key,e.key,`账号密码`)},children:e.label},e.key))}),(0,b.jsx)(`p`,{style:{marginTop:8},children:`tenderee → 招标人，agent → 招标代理，bidder → 投标人，`}),(0,b.jsx)(`p`,{children:`expert → 评标专家，supervisor → 监督人员，admin → 管理员`})]})]}),N=(0,b.jsxs)(`div`,{id:`login-ca-panel`,className:`ca-login`,children:[(0,b.jsx)(m,{style:{fontSize:60,color:`#409EFF`}}),(0,b.jsx)(`p`,{children:`请插入 CA 数字证书 UKey`}),(0,b.jsx)(u,{form:E,layout:`vertical`,className:`ca-account-form`,initialValues:{account:`ca`},children:(0,b.jsx)(u.Item,{label:`账号`,name:`account`,children:(0,b.jsx)(f,{placeholder:`请输入账号以确定角色`})})}),(0,b.jsx)(i,{id:`login-ca-btn`,type:`primary`,onClick:caLogin,loading:k.status===`checking`,children:`检测证书并登录`}),k.status!==`idle`&&k.status!==`checking`&&(0,b.jsx)(`div`,{style:{marginTop:12},children:(0,b.jsx)(p,{color:k.status===`success`?`success`:`error`,children:k.message})}),(0,b.jsxs)(`div`,{className:`ca-tips`,children:[(0,b.jsx)(i,{type:`link`,children:`下载 CA 驱动`}),(0,b.jsx)(`span`,{children:`|`}),(0,b.jsx)(i,{type:`link`,children:`CA 证书申请`})]}),(0,b.jsx)(`p`,{className:`ca-demo-tip`,children:`演示环境：点击登录即模拟证书检测通过`})]}),P=(0,b.jsxs)(u,{id:`login-phone-panel`,form:T,layout:`vertical`,initialValues:{phone:`13800138000`,code:`123456`},children:[(0,b.jsx)(u.Item,{label:`手机号`,name:`phone`,children:(0,b.jsx)(f,{placeholder:`请输入手机号`})}),(0,b.jsx)(u.Item,{label:`验证码`,name:`code`,children:(0,b.jsx)(f,{placeholder:`演示环境固定为 123456`,suffix:(0,b.jsx)(i,{id:`login-phone-code`,size:`small`,disabled:D>0,onClick:sendCode,children:D>0?`${D}s`:`获取验证码`})})}),(0,b.jsx)(u.Item,{children:(0,b.jsx)(i,{id:`login-phone-submit`,type:`primary`,style:{width:`100%`},onClick:phoneLogin,children:`登录`})})]});return(0,b.jsxs)(`div`,{className:`login-page`,children:[(0,b.jsxs)(`div`,{className:`login-container`,children:[(0,b.jsxs)(`div`,{className:`login-left`,children:[(0,b.jsx)(`h1`,{children:`招投标采购平台`}),(0,b.jsx)(`p`,{children:`全流程电子化 · 多角色协同 · 安全合规`}),(0,b.jsxs)(`div`,{className:`features`,children:[(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 在线招标发标`]}),(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 电子投标加密`]}),(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 线上开标评标`]}),(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 定标结果公示`]})]})]}),(0,b.jsxs)(`div`,{className:`login-right`,children:[(0,b.jsx)(`div`,{style:{textAlign:`right`,marginBottom:12},children:(0,b.jsx)(i,{type:`link`,icon:(0,b.jsx)(d,{}),onClick:startTour,children:`查看登录引导`})}),(0,b.jsx)(c,{id:`login-tabs`,activeKey:S,onChange:C,type:`card`,items:[{key:`account`,label:`账号登录`,children:M},{key:`ca`,label:`CA 登录`,children:N},{key:`phone`,label:`手机登录`,children:P}]}),(0,b.jsxs)(`div`,{className:`register-link`,children:[`还没有账号？`,(0,b.jsx)(i,{type:`link`,onClick:()=>e({to:`/register`}),children:`立即注册`}),(0,b.jsx)(`span`,{style:{margin:`0 8px`},children:`|`}),(0,b.jsx)(i,{type:`link`,onClick:()=>e({to:`/`}),children:`返回首页`})]})]})]}),(0,b.jsx)(`style`,{children:`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container {
          width: 900px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .login-left {
          width: 400px;
          background: #001529;
          color: #fff;
          padding: 60px 40px;
        }
        .login-left h1 {
          font-size: 32px;
          margin-bottom: 16px;
          color: #fff;
        }
        .login-left p {
          font-size: 16px;
          opacity: 0.8;
          margin-bottom: 40px;
        }
        .features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
        }
        .login-right {
          flex: 1;
          padding: 40px;
        }
        .ca-login {
          text-align: center;
          padding: 20px 20px;
        }
        .ca-login p {
          margin: 12px 0;
          color: #666;
        }
        .ca-account-form {
          max-width: 280px;
          margin: 0 auto 16px;
          text-align: left;
        }
        .ca-tips {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 16px;
          color: #ccc;
          align-items: center;
        }
        .ca-demo-tip {
          color: #999;
          font-size: 12px;
          margin-top: 12px;
        }
        .role-hint {
          margin-top: 16px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px;
          font-size: 12px;
          color: #606266;
          line-height: 1.6;
        }
        .role-hint p {
          margin: 0;
        }
        .register-link {
          margin-top: 20px;
          text-align: center;
          color: #666;
        }
      `})]})}var S=a(`/login`)({component:Login});export{S as Route};