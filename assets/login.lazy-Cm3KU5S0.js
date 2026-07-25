import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{Ln as r,t as i}from"./button-kN9I3LUV.js";import{n as a}from"./fileRoute-CYesOn2-.js";import{t as o}from"./message-C4PuKih5.js";import{t as s}from"./space-ClptNEZ3.js";import{t as c}from"./modal-BuJNyfb9.js";import{t as l}from"./tabs-Be4V0Dsn.js";import{t as u}from"./CheckOutlined-DSX6lZD-.js";import{t as d}from"./form-DlEcvdzX.js";import{t as f}from"./QuestionCircleOutlined-BOTt5aEV.js";import{t as p}from"./input-CNEvglm2.js";import{t as m}from"./tag-BtNDBJzJ.js";import{t as h}from"./LockOutlined-BNeQg5FB.js";import{l as g,p as _}from"./index-CmMEUkDH.js";import{t as v}from"./useRole-GufTOCqP.js";import{t as y}from"./driver-DyuIdVyB.js";var b=e(t(),1),x=n(),S={admin:`all`,tenderee:`enterprise`,agent:`enterprise`,bidder:`enterprise`,expert:`enterprise`,supervisor:`all`};function Login(){let e=r(),{login:t,isAuthenticated:n,redirectToWorkspace:a}=v(),[C,w]=(0,b.useState)(`account`),[T]=d.useForm(),[E]=d.useForm(),[D]=d.useForm(),[O,k]=(0,b.useState)(0),[A,j]=(0,b.useState)(!1),[M,N]=(0,b.useState)(0),[P,F]=(0,b.useState)(``),[I,L]=(0,b.useState)(0),[R,z]=(0,b.useState)(0),B=(0,b.useRef)(null),[V,H]=(0,b.useState)({status:`idle`,message:``});(0,b.useEffect)(()=>{n&&a()},[n,a]),(0,b.useEffect)(()=>{if(O<=0)return;let e=setInterval(()=>k(e=>e-1),1e3);return()=>clearInterval(e)},[O]),(0,b.useEffect)(()=>{if(!A||!B.current)return;let e=B.current.getContext(`2d`);e.clearRect(0,0,200,60),e.fillStyle=`#f0f0f0`,e.fillRect(0,0,200,60);for(let t=0;t<5;t++)e.beginPath(),e.moveTo(Math.random()*200,Math.random()*60),e.lineTo(Math.random()*200,Math.random()*60),e.strokeStyle=`#ccc`,e.stroke();e.font=`28px Arial`,e.fillStyle=`#333`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`${I} + ${R} = ?`,100,30)},[A,I,R]);let U={tenderee:`/admin/dashboard`,agent:`/admin/dashboard`,bidder:`/admin/dashboard`,expert:`/admin/dashboard`,supervisor:`/admin/supervisor-hall`,admin:`/admin/dashboard`},doLogin=(n,r,i=`账号`)=>{let a=S[n]||`all`;t(n,r,{},a),o.success(`以 ${g[n]} 身份登录成功（${i}）`),e({to:U[n]})},accountLogin=()=>{let e=String(T.getFieldValue(`account`)||`tenderee`).trim(),t=_(e);doLogin(t,e,`账号密码`)},generateCaptcha=()=>{let e=Math.floor(Math.random()*20)+1,t=Math.floor(Math.random()*20)+1;L(e),z(t),N(e+t)},confirmCaptcha=()=>{if(Number(P)!==M){o.error(`图形验证码错误`);return}j(!1),F(``),o.success(`验证码已发送：123456`),k(60)},sendCode=()=>{generateCaptcha(),j(!0)},phoneLogin=()=>{let e=E.getFieldValue(`phone`)||`13800138000`;doLogin(`bidder`,e,`手机验证码`)},caLogin=()=>{let e=String(D.getFieldValue(`account`)||`ca`).trim();H({status:`checking`,message:`正在检测 CA 证书...`}),setTimeout(()=>{H({status:`success`,message:`证书检测通过`});let t=_(e)||`bidder`;doLogin(t,e,`CA 证书`)},800)},startTour=()=>{w(`account`),y({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[{element:`#login-tabs`,popover:{title:`选择登录方式`,description:`平台支持账号密码、CA 数字证书、手机验证码三种登录方式，点击标签切换。`,side:`bottom`,align:`center`}},{element:`#login-role`,popover:{title:`选择您的角色`,description:`平台支持采购单位、采购代理、响应单位、评审专家、监督人员、平台管理员六种角色，登录后进入对应工作台。`,side:`right`,align:`center`},onHighlighted:()=>w(`account`)},{element:`#login-submit`,popover:{title:`账号密码登录`,description:`选择角色并输入账号密码后，点击登录进入工作台。`,side:`top`,align:`center`},onHighlighted:()=>w(`account`)},{element:`#login-ca-panel`,popover:{title:`CA 数字证书登录`,description:`插入 CA UKey 后，点击"检测证书并登录"完成高安全身份认证。首次使用请下载 CA 驱动或申请证书。`,side:`left`,align:`center`},onHighlighted:()=>w(`ca`)},{element:`#login-phone-panel`,popover:{title:`手机验证码登录`,description:`输入手机号，点击"获取验证码"，输入收到的短信验证码后登录。`,side:`left`,align:`center`},onHighlighted:()=>w(`phone`)},{element:`#login-phone-code`,popover:{title:`获取验证码`,description:`系统会向您的手机发送一条短信验证码，演示环境固定为 123456。`,side:`top`,align:`center`},onHighlighted:()=>w(`phone`)}]}).drive()},W=(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(d,{form:T,layout:`vertical`,initialValues:{account:`tenderee`,password:`123456`},children:[(0,x.jsx)(d.Item,{label:`账号`,name:`account`,children:(0,x.jsx)(p,{placeholder:`请输入账号，如 tenderee / agent / bidder`})}),(0,x.jsx)(d.Item,{label:`密码`,name:`password`,children:(0,x.jsx)(p.Password,{placeholder:`演示环境无需密码，任意填写`})}),(0,x.jsx)(d.Item,{children:(0,x.jsx)(i,{id:`login-submit`,type:`primary`,style:{width:`100%`},onClick:accountLogin,children:`登录`})})]}),(0,x.jsxs)(`div`,{id:`login-role`,className:`role-hint`,children:[(0,x.jsx)(`p`,{children:`演示账号与角色（点击一键登录）：`}),(0,x.jsx)(s,{wrap:!0,children:[{key:`tenderee`,label:`采购单位`},{key:`agent`,label:`采购代理`},{key:`bidder`,label:`响应单位`},{key:`expert`,label:`评审专家`},{key:`supervisor`,label:`监督人员`},{key:`admin`,label:`管理员`}].map(e=>(0,x.jsx)(i,{size:`small`,onClick:()=>{T.setFieldsValue({account:e.key,password:`123456`}),doLogin(e.key,e.key,`账号密码`)},children:e.label},e.key))}),(0,x.jsx)(`p`,{style:{marginTop:8},children:`tenderee → 采购单位，agent → 采购代理，bidder → 响应单位，`}),(0,x.jsx)(`p`,{children:`expert → 评审专家，supervisor → 监督人员，admin → 管理员`})]})]}),G=(0,x.jsxs)(`div`,{id:`login-ca-panel`,className:`ca-login`,children:[(0,x.jsx)(h,{style:{fontSize:60,color:`#409EFF`}}),(0,x.jsx)(`p`,{children:`请插入 CA 数字证书 UKey`}),(0,x.jsx)(d,{form:D,layout:`vertical`,className:`ca-account-form`,initialValues:{account:`ca`},children:(0,x.jsx)(d.Item,{label:`账号`,name:`account`,children:(0,x.jsx)(p,{placeholder:`请输入账号以确定角色`})})}),(0,x.jsx)(i,{id:`login-ca-btn`,type:`primary`,onClick:caLogin,loading:V.status===`checking`,children:`检测证书并登录`}),V.status!==`idle`&&V.status!==`checking`&&(0,x.jsx)(`div`,{style:{marginTop:12},children:(0,x.jsx)(m,{color:V.status===`success`?`success`:`error`,children:V.message})}),(0,x.jsxs)(`div`,{className:`ca-tips`,children:[(0,x.jsx)(i,{type:`link`,children:`下载 CA 驱动`}),(0,x.jsx)(`span`,{children:`|`}),(0,x.jsx)(i,{type:`link`,children:`CA 证书申请`})]}),(0,x.jsx)(`p`,{className:`ca-demo-tip`,children:`演示环境：点击登录即模拟证书检测通过`})]}),K=(0,x.jsxs)(d,{id:`login-phone-panel`,form:E,layout:`vertical`,initialValues:{phone:`13800138000`,code:`123456`},children:[(0,x.jsx)(d.Item,{label:`手机号`,name:`phone`,children:(0,x.jsx)(p,{placeholder:`请输入手机号`})}),(0,x.jsx)(d.Item,{label:`验证码`,name:`code`,children:(0,x.jsx)(p,{placeholder:`演示环境固定为 123456`,suffix:(0,x.jsx)(i,{id:`login-phone-code`,size:`small`,disabled:O>0,onClick:sendCode,children:O>0?`${O}s`:`获取验证码`})})}),(0,x.jsx)(d.Item,{children:(0,x.jsx)(i,{id:`login-phone-submit`,type:`primary`,style:{width:`100%`},onClick:phoneLogin,children:`登录`})})]});return(0,x.jsxs)(`div`,{className:`login-page`,children:[(0,x.jsxs)(`div`,{className:`login-container`,children:[(0,x.jsxs)(`div`,{className:`login-left`,children:[(0,x.jsx)(`h1`,{children:`采购平台`}),(0,x.jsx)(`p`,{children:`全流程电子化 · 多角色协同 · 安全合规`}),(0,x.jsxs)(`div`,{className:`features`,children:[(0,x.jsxs)(`div`,{className:`feature`,children:[(0,x.jsx)(u,{}),` 在线发布采购`]}),(0,x.jsxs)(`div`,{className:`feature`,children:[(0,x.jsx)(u,{}),` 电子响应加密`]}),(0,x.jsxs)(`div`,{className:`feature`,children:[(0,x.jsx)(u,{}),` 线上开启评审`]}),(0,x.jsxs)(`div`,{className:`feature`,children:[(0,x.jsx)(u,{}),` 成交确认结果公示`]})]})]}),(0,x.jsxs)(`div`,{className:`login-right`,children:[(0,x.jsx)(`div`,{style:{textAlign:`right`,marginBottom:12},children:(0,x.jsx)(i,{type:`link`,icon:(0,x.jsx)(f,{}),onClick:startTour,children:`查看登录引导`})}),(0,x.jsx)(l,{id:`login-tabs`,activeKey:C,onChange:w,type:`card`,items:[{key:`account`,label:`账号登录`,children:W},{key:`ca`,label:`CA 登录`,children:G},{key:`phone`,label:`手机登录`,children:K}]}),(0,x.jsxs)(`div`,{className:`register-link`,children:[`还没有账号？`,(0,x.jsx)(i,{type:`link`,onClick:()=>e({to:`/register`}),children:`立即注册`}),(0,x.jsx)(`span`,{style:{margin:`0 8px`},children:`|`}),(0,x.jsx)(i,{type:`link`,onClick:()=>e({to:`/`}),children:`返回首页`})]})]})]}),(0,x.jsx)(c,{title:`图形验证码`,open:A,onCancel:()=>{j(!1),F(``)},footer:null,destroyOnClose:!0,children:(0,x.jsxs)(`div`,{style:{textAlign:`center`,padding:`8px 0`},children:[(0,x.jsx)(`canvas`,{ref:B,width:200,height:60,style:{border:`1px solid #ddd`,borderRadius:4}}),(0,x.jsx)(`div`,{style:{marginTop:12},children:(0,x.jsx)(p,{placeholder:`请输入计算结果`,value:P,onChange:e=>F(e.target.value),style:{width:200},onPressEnter:confirmCaptcha})}),(0,x.jsxs)(`div`,{style:{marginTop:12,display:`flex`,justifyContent:`center`,gap:8},children:[(0,x.jsx)(i,{type:`primary`,onClick:confirmCaptcha,children:`确认`}),(0,x.jsx)(i,{onClick:()=>{generateCaptcha(),F(``)},children:`重新生成`})]})]})}),(0,x.jsx)(`style`,{children:`
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