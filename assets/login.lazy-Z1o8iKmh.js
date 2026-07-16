import{r as e}from"./rolldown-runtime-BpP4ry7R.js";import{gn as t,lr as n,t as r,wn as i}from"./button-Cco463MC.js";import{n as a}from"./fileRoute-Bxjf8qzb.js";import{t as o}from"./message-C2B-DZFE.js";import{t as s}from"./space-D3uGGALW.js";import{t as c}from"./tabs-_2KloJ3D.js";import{t as l}from"./CheckOutlined-zPSeYluf.js";import{t as u}from"./form-Dk4Ny5so.js";import{t as d}from"./QuestionCircleOutlined-Drymf_3l.js";import{t as f}from"./input-Bek0E5oj.js";import{t as p}from"./tag-Ci3E0V1a.js";import{t as m}from"./LockOutlined-CDoEz9Dh.js";import{n as h,o as g}from"./index-Bqr2gv4N.js";import{t as _}from"./useRole-C0vY5_xc.js";import{t as v}from"./driver-DyuIdVyB.js";var y=e(n(),1),b=i(),x={tenderee:`123456`,agent:`123456`,bidder:`123456`,expert:`123456`,supervisor:`123456`,admin:`123456`,zhangsan:`123456`,lisi:`123456`,gongying:`123456`,zhuanjia:`123456`,jiandu:`123456`},S={admin:`all`,tenderee:`enterprise`,agent:`enterprise`,bidder:`enterprise`,expert:`enterprise`,supervisor:`all`};function Login(){let e=t(),{login:n,isAuthenticated:i,redirectToWorkspace:a}=_(),[C,w]=(0,y.useState)(`account`),[T]=u.useForm(),[E]=u.useForm(),[D]=u.useForm(),[O,k]=(0,y.useState)(0),[A,j]=(0,y.useState)({status:`idle`,message:``});(0,y.useEffect)(()=>{i&&a()},[i,a]),(0,y.useEffect)(()=>{if(O<=0)return;let e=setInterval(()=>k(e=>e-1),1e3);return()=>clearInterval(e)},[O]);let M={tenderee:`/admin/dashboard`,agent:`/admin/dashboard`,bidder:`/admin/dashboard`,expert:`/admin/dashboard`,supervisor:`/admin/supervisor-hall`,admin:`/admin/admin-dashboard`},doLogin=(t,r,i=`账号`)=>{let a=S[t]||`all`;n(t,r,{},a),o.success(`以 ${h[t]} 身份登录成功（${i}）`),e({to:M[t]})},accountLogin=()=>{T.validateFields().then(e=>{let t=String(e.account).toLowerCase().trim();if(!x[t]||x[t]!==e.password){o.error(`账号或密码错误`);return}let n=g(e.account);doLogin(n,e.account,`账号密码`)})},sendCode=()=>{E.validateFields([`phone`]).then(()=>{o.success(`验证码已发送：123456`),k(60)})},phoneLogin=()=>{E.validateFields().then(e=>{if(e.code!==`123456`){o.error(`验证码错误`);return}doLogin(`bidder`,e.phone,`手机验证码`)})},caLogin=()=>{D.validateFields([`account`]).then(e=>{let t=String(e.account).trim();if(!t){o.error(`请输入账号以确定角色`);return}j({status:`checking`,message:`正在检测 CA 证书...`}),setTimeout(()=>{if(t.toLowerCase()===`ca`){j({status:`success`,message:`证书检测通过`});let e=g(`ca`)||`bidder`;doLogin(e,t,`CA 证书`)}else j({status:`error`,message:`未检测到 CA 证书，请插入 UKey`})},800)})},startTour=()=>{w(`account`),v({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[{element:`#login-tabs`,popover:{title:`选择登录方式`,description:`平台支持账号密码、CA 数字证书、手机验证码三种登录方式，点击标签切换。`,side:`bottom`,align:`center`}},{element:`#login-role`,popover:{title:`选择您的角色`,description:`平台支持招标人、招标代理、投标人、评标专家、监督人员、平台管理员六种角色，登录后进入对应工作台。`,side:`right`,align:`center`},onHighlighted:()=>w(`account`)},{element:`#login-submit`,popover:{title:`账号密码登录`,description:`选择角色并输入账号密码后，点击登录进入工作台。`,side:`top`,align:`center`},onHighlighted:()=>w(`account`)},{element:`#login-ca-panel`,popover:{title:`CA 数字证书登录`,description:`插入 CA UKey 后，点击“检测证书并登录”完成高安全身份认证。首次使用请下载 CA 驱动或申请证书。`,side:`left`,align:`center`},onHighlighted:()=>w(`ca`)},{element:`#login-phone-panel`,popover:{title:`手机验证码登录`,description:`输入手机号，点击“获取验证码”，输入收到的短信验证码后登录。`,side:`left`,align:`center`},onHighlighted:()=>w(`phone`)},{element:`#login-phone-code`,popover:{title:`获取验证码`,description:`系统会向您的手机发送一条短信验证码，演示环境固定为 123456。`,side:`top`,align:`center`},onHighlighted:()=>w(`phone`)}]}).drive()},N=(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)(u,{form:T,layout:`vertical`,initialValues:{account:`tenderee`,password:`123456`},children:[(0,b.jsx)(u.Item,{label:`账号`,name:`account`,rules:[{required:!0,message:`请输入账号`}],children:(0,b.jsx)(f,{placeholder:`请输入账号，如 tenderee / agent / bidder`})}),(0,b.jsx)(u.Item,{label:`密码`,name:`password`,rules:[{required:!0,message:`请输入密码`}],children:(0,b.jsx)(f.Password,{placeholder:`请输入密码`})}),(0,b.jsx)(u.Item,{children:(0,b.jsx)(r,{id:`login-submit`,type:`primary`,style:{width:`100%`},onClick:accountLogin,children:`登录`})})]}),(0,b.jsxs)(`div`,{id:`login-role`,className:`role-hint`,children:[(0,b.jsx)(`p`,{children:`演示账号与角色：`}),(0,b.jsx)(s,{wrap:!0,children:[{key:`tenderee`,label:`招标人`},{key:`agent`,label:`招标代理`},{key:`bidder`,label:`投标人`},{key:`expert`,label:`评标专家`},{key:`supervisor`,label:`监督人员`},{key:`admin`,label:`管理员`}].map(e=>(0,b.jsx)(r,{size:`small`,onClick:()=>{T.setFieldsValue({account:e.key,password:`123456`}),doLogin(e.key,e.key,`账号密码`)},children:e.label},e.key))}),(0,b.jsx)(`p`,{style:{marginTop:8},children:`tenderee → 招标人，agent → 招标代理，bidder → 投标人，`}),(0,b.jsx)(`p`,{children:`expert → 评标专家，supervisor → 监督人员，admin → 管理员`})]})]}),P=(0,b.jsxs)(`div`,{id:`login-ca-panel`,className:`ca-login`,children:[(0,b.jsx)(m,{style:{fontSize:60,color:`#409EFF`}}),(0,b.jsx)(`p`,{children:`请插入 CA 数字证书 UKey`}),(0,b.jsx)(u,{form:D,layout:`vertical`,className:`ca-account-form`,children:(0,b.jsx)(u.Item,{label:`账号`,name:`account`,rules:[{required:!0,message:`请输入账号以确定角色`}],children:(0,b.jsx)(f,{placeholder:`请输入账号以确定角色`})})}),(0,b.jsx)(r,{id:`login-ca-btn`,type:`primary`,onClick:caLogin,loading:A.status===`checking`,children:`检测证书并登录`}),A.status!==`idle`&&A.status!==`checking`&&(0,b.jsx)(`div`,{style:{marginTop:12},children:(0,b.jsx)(p,{color:A.status===`success`?`success`:`error`,children:A.message})}),(0,b.jsxs)(`div`,{className:`ca-tips`,children:[(0,b.jsx)(r,{type:`link`,children:`下载 CA 驱动`}),(0,b.jsx)(`span`,{children:`|`}),(0,b.jsx)(r,{type:`link`,children:`CA 证书申请`})]}),(0,b.jsx)(`p`,{className:`ca-demo-tip`,children:`演示环境：输入账号 ca 模拟证书检测通过`})]}),F=(0,b.jsxs)(u,{id:`login-phone-panel`,form:E,layout:`vertical`,children:[(0,b.jsx)(u.Item,{label:`手机号`,name:`phone`,rules:[{required:!0,message:`请输入手机号`},{pattern:/^1[3-9]\d{9}$/,message:`请输入有效的手机号`}],children:(0,b.jsx)(f,{placeholder:`请输入手机号`})}),(0,b.jsx)(u.Item,{label:`验证码`,name:`code`,rules:[{required:!0,message:`请输入验证码`}],children:(0,b.jsx)(f,{placeholder:`请输入验证码`,suffix:(0,b.jsx)(r,{id:`login-phone-code`,size:`small`,disabled:O>0,onClick:sendCode,children:O>0?`${O}s`:`获取验证码`})})}),(0,b.jsx)(u.Item,{children:(0,b.jsx)(r,{id:`login-phone-submit`,type:`primary`,style:{width:`100%`},onClick:phoneLogin,children:`登录`})})]});return(0,b.jsxs)(`div`,{className:`login-page`,children:[(0,b.jsxs)(`div`,{className:`login-container`,children:[(0,b.jsxs)(`div`,{className:`login-left`,children:[(0,b.jsx)(`h1`,{children:`招投标采购平台`}),(0,b.jsx)(`p`,{children:`全流程电子化 · 多角色协同 · 安全合规`}),(0,b.jsxs)(`div`,{className:`features`,children:[(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 在线招标发标`]}),(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 电子投标加密`]}),(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 线上开标评标`]}),(0,b.jsxs)(`div`,{className:`feature`,children:[(0,b.jsx)(l,{}),` 合同归档管理`]})]})]}),(0,b.jsxs)(`div`,{className:`login-right`,children:[(0,b.jsx)(`div`,{style:{textAlign:`right`,marginBottom:12},children:(0,b.jsx)(r,{type:`link`,icon:(0,b.jsx)(d,{}),onClick:startTour,children:`查看登录引导`})}),(0,b.jsx)(c,{id:`login-tabs`,activeKey:C,onChange:w,type:`card`,items:[{key:`account`,label:`账号登录`,children:N},{key:`ca`,label:`CA 登录`,children:P},{key:`phone`,label:`手机登录`,children:F}]}),(0,b.jsxs)(`div`,{className:`register-link`,children:[`还没有账号？`,(0,b.jsx)(r,{type:`link`,onClick:()=>e({to:`/register`}),children:`立即注册`}),(0,b.jsx)(`span`,{style:{margin:`0 8px`},children:`|`}),(0,b.jsx)(r,{type:`link`,onClick:()=>e({to:`/`}),children:`返回首页`})]})]})]}),(0,b.jsx)(`style`,{children:`
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
      `})]})}var C=a(`/login`)({component:Login});export{C as Route};