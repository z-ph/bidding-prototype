import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{Ln as r,t as i}from"./button-kN9I3LUV.js";import{n as a}from"./fileRoute-CYesOn2-.js";import{t as o}from"./message-C4PuKih5.js";import{t as s}from"./space-ClptNEZ3.js";import{t as c}from"./modal-BuJNyfb9.js";import{t as l}from"./tabs-Be4V0Dsn.js";import{t as u}from"./CheckOutlined-DSX6lZD-.js";import{t as d}from"./form-DlEcvdzX.js";import{t as f}from"./QuestionCircleOutlined-BOTt5aEV.js";import{t as p}from"./input-CNEvglm2.js";import{l as m,p as h}from"./index-BXX3WQCL.js";import{t as g}from"./useRole-CneseDnH.js";import{t as _}from"./driver-DyuIdVyB.js";var v=e(t(),1),y=n(),b={admin:`all`,tenderee:`enterprise`,agent:`enterprise`,bidder:`enterprise`,expert:`enterprise`};function Login(){let e=r(),{login:t,isAuthenticated:n,redirectToWorkspace:a}=g(),[x,S]=(0,v.useState)(`account`),[C]=d.useForm(),[w]=d.useForm(),[T,E]=(0,v.useState)(0),[D,O]=(0,v.useState)(!1),[k,A]=(0,v.useState)(0),[j,M]=(0,v.useState)(``),[N,P]=(0,v.useState)(0),[F,I]=(0,v.useState)(0),L=(0,v.useRef)(null);(0,v.useEffect)(()=>{n&&a()},[n,a]),(0,v.useEffect)(()=>{if(T<=0)return;let e=setInterval(()=>E(e=>e-1),1e3);return()=>clearInterval(e)},[T]),(0,v.useEffect)(()=>{if(!D||!L.current)return;let e=L.current.getContext(`2d`);e.clearRect(0,0,200,60),e.fillStyle=`#f0f0f0`,e.fillRect(0,0,200,60);for(let t=0;t<5;t++)e.beginPath(),e.moveTo(Math.random()*200,Math.random()*60),e.lineTo(Math.random()*200,Math.random()*60),e.strokeStyle=`#ccc`,e.stroke();e.font=`28px Arial`,e.fillStyle=`#333`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`${N} + ${F} = ?`,100,30)},[D,N,F]);let R={tenderee:`/admin/dashboard`,agent:`/admin/dashboard`,bidder:`/admin/dashboard`,expert:`/admin/dashboard`,admin:`/admin/dashboard`},doLogin=(n,r,i=`账号`)=>{let a=b[n]||`all`;t(n,r,{},a),o.success(`以 ${m[n]} 身份登录成功（${i}）`),e({to:R[n]})},accountLogin=()=>{let e=String(C.getFieldValue(`account`)||`tenderee`).trim(),t=h(e);doLogin(t,e,`账号密码`)},generateCaptcha=()=>{let e=Math.floor(Math.random()*20)+1,t=Math.floor(Math.random()*20)+1;P(e),I(t),A(e+t)},confirmCaptcha=()=>{if(Number(j)!==k){o.error(`图形验证码错误`);return}O(!1),M(``),o.success(`验证码已发送：123456`),E(60)},sendCode=()=>{generateCaptcha(),O(!0)},phoneLogin=()=>{let e=w.getFieldValue(`phone`)||`13800138000`;doLogin(`bidder`,e,`手机验证码`)},startTour=()=>{S(`account`),_({showProgress:!0,allowClose:!0,overlayColor:`rgba(0, 21, 41, 0.75)`,steps:[{element:`#login-tabs`,popover:{title:`选择登录方式`,description:`平台支持账号密码、手机验证码两种登录方式，点击标签切换。`,side:`bottom`,align:`center`}},{element:`#login-role`,popover:{title:`选择您的角色`,description:`平台支持采购单位、采购代理、响应单位、评审专家、平台管理员五种角色，登录后进入对应工作台。`,side:`right`,align:`center`},onHighlighted:()=>S(`account`)},{element:`#login-submit`,popover:{title:`账号密码登录`,description:`选择角色并输入账号密码后，点击登录进入工作台。`,side:`top`,align:`center`},onHighlighted:()=>S(`account`)},{element:`#login-phone-panel`,popover:{title:`手机验证码登录`,description:`输入手机号，点击"获取验证码"，输入收到的短信验证码后登录。`,side:`left`,align:`center`},onHighlighted:()=>S(`phone`)},{element:`#login-phone-code`,popover:{title:`获取验证码`,description:`系统会向您的手机发送一条短信验证码，演示环境固定为 123456。`,side:`top`,align:`center`},onHighlighted:()=>S(`phone`)}]}).drive()},z=(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(d,{form:C,layout:`vertical`,initialValues:{account:`tenderee`,password:`123456`},children:[(0,y.jsx)(d.Item,{label:`账号`,name:`account`,children:(0,y.jsx)(p,{placeholder:`请输入账号，如 tenderee / agent / bidder`})}),(0,y.jsx)(d.Item,{label:`密码`,name:`password`,children:(0,y.jsx)(p.Password,{placeholder:`演示环境无需密码，任意填写`})}),(0,y.jsx)(d.Item,{children:(0,y.jsx)(i,{id:`login-submit`,type:`primary`,style:{width:`100%`},onClick:accountLogin,children:`登录`})})]}),(0,y.jsxs)(`div`,{id:`login-role`,className:`role-hint`,children:[(0,y.jsx)(`p`,{children:`演示账号与角色（点击一键登录）：`}),(0,y.jsx)(s,{wrap:!0,children:[{key:`tenderee`,label:`采购单位-经办`},{key:`tenderee-audit`,label:`采购单位-审核`},{key:`agent`,label:`采购代理`},{key:`bidder`,label:`响应单位`},{key:`expert`,label:`评审专家`},{key:`admin`,label:`管理员`}].map(e=>(0,y.jsx)(i,{size:`small`,onClick:()=>{C.setFieldsValue({account:e.key,password:`123456`}),doLogin(h(e.key),e.key,`账号密码`)},children:e.label},e.key))}),(0,y.jsx)(`p`,{style:{marginTop:8},children:`tenderee → 采购单位（经办），tenderee-audit → 采购单位（审核），agent → 采购代理，`}),(0,y.jsx)(`p`,{children:`bidder → 响应单位，expert → 评审专家，admin → 管理员`}),(0,y.jsx)(`p`,{style:{marginTop:8},children:`经办提交、审核员审批，不能审核本人提交的单据（经办与审核互斥）。`})]})]}),B=(0,y.jsxs)(d,{id:`login-phone-panel`,form:w,layout:`vertical`,initialValues:{phone:`13800138000`,code:`123456`},children:[(0,y.jsx)(d.Item,{label:`手机号`,name:`phone`,children:(0,y.jsx)(p,{placeholder:`请输入手机号`})}),(0,y.jsx)(d.Item,{label:`验证码`,name:`code`,children:(0,y.jsx)(p,{placeholder:`演示环境固定为 123456`,suffix:(0,y.jsx)(i,{id:`login-phone-code`,size:`small`,disabled:T>0,onClick:sendCode,children:T>0?`${T}s`:`获取验证码`})})}),(0,y.jsx)(d.Item,{children:(0,y.jsx)(i,{id:`login-phone-submit`,type:`primary`,style:{width:`100%`},onClick:phoneLogin,children:`登录`})})]});return(0,y.jsxs)(`div`,{className:`login-page`,children:[(0,y.jsxs)(`div`,{className:`login-container`,children:[(0,y.jsxs)(`div`,{className:`login-left`,children:[(0,y.jsx)(`h1`,{children:`采购平台`}),(0,y.jsx)(`p`,{children:`全流程电子化 · 多角色协同 · 安全合规`}),(0,y.jsxs)(`div`,{className:`features`,children:[(0,y.jsxs)(`div`,{className:`feature`,children:[(0,y.jsx)(u,{}),` 在线发布采购`]}),(0,y.jsxs)(`div`,{className:`feature`,children:[(0,y.jsx)(u,{}),` 电子响应加密`]}),(0,y.jsxs)(`div`,{className:`feature`,children:[(0,y.jsx)(u,{}),` 线上开启评审`]}),(0,y.jsxs)(`div`,{className:`feature`,children:[(0,y.jsx)(u,{}),` 成交确认结果公示`]})]})]}),(0,y.jsxs)(`div`,{className:`login-right`,children:[(0,y.jsx)(`div`,{style:{textAlign:`right`,marginBottom:12},children:(0,y.jsx)(i,{type:`link`,icon:(0,y.jsx)(f,{}),onClick:startTour,children:`查看登录引导`})}),(0,y.jsx)(l,{id:`login-tabs`,activeKey:x,onChange:S,type:`card`,items:[{key:`account`,label:`账号登录`,children:z},{key:`phone`,label:`手机登录`,children:B}]}),(0,y.jsx)(`div`,{className:`register-link`,children:(0,y.jsx)(i,{type:`link`,onClick:()=>e({to:`/`}),children:`返回首页`})})]})]}),(0,y.jsx)(c,{title:`图形验证码`,open:D,onCancel:()=>{O(!1),M(``)},footer:null,destroyOnClose:!0,children:(0,y.jsxs)(`div`,{style:{textAlign:`center`,padding:`8px 0`},children:[(0,y.jsx)(`canvas`,{ref:L,width:200,height:60,style:{border:`1px solid #ddd`,borderRadius:4}}),(0,y.jsx)(`div`,{style:{marginTop:12},children:(0,y.jsx)(p,{placeholder:`请输入计算结果`,value:j,onChange:e=>M(e.target.value),style:{width:200},onPressEnter:confirmCaptcha})}),(0,y.jsxs)(`div`,{style:{marginTop:12,display:`flex`,justifyContent:`center`,gap:8},children:[(0,y.jsx)(i,{type:`primary`,onClick:confirmCaptcha,children:`确认`}),(0,y.jsx)(i,{onClick:()=>{generateCaptcha(),M(``)},children:`重新生成`})]})]})}),(0,y.jsx)(`style`,{children:`
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
      `})]})}var x=a(`/login`)({component:Login});export{x as Route};