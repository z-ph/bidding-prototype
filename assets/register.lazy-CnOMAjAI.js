import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{Ln as r,t as i}from"./button-kN9I3LUV.js";import{n as a}from"./fileRoute-CYesOn2-.js";import{t as o}from"./message-C4PuKih5.js";import{t as s}from"./modal-BuJNyfb9.js";import{t as c}from"./tabs-Be4V0Dsn.js";import{t as l}from"./select-DMXNXCRp.js";import{t as u}from"./checkbox-CiMfPRHf.js";import{t as d}from"./card-xz9k-4M9.js";import{n as f,t as p}from"./row-jEtFkGWh.js";import{t as m}from"./form-DlEcvdzX.js";import{t as h}from"./input-CNEvglm2.js";import{t as g}from"./upload-DTcMFNaB.js";import{t as _}from"./tag-BtNDBJzJ.js";import{t as v}from"./UploadOutlined-Cbv8YSh5.js";var y=e(t(),1),b=n(),x=[{key:`营业执照`,label:`营业执照`},{key:`ISO9001认证或相关证书`,label:`ISO9001认证或相关证书`},{key:`安全生产许可证`,label:`安全生产许可证`},{key:`特定行业资质`,label:`特定行业资质`}];function Register(){let e=r(),[t]=m.useForm(),[n,a]=(0,y.useState)(`tenderee`),[S,C]=(0,y.useState)([]),[w,T]=(0,y.useState)({}),[E,D]=(0,y.useState)(0),[O,k]=(0,y.useState)(!1),[A,j]=(0,y.useState)(0),[M,N]=(0,y.useState)(``),[P,F]=(0,y.useState)(0),[I,L]=(0,y.useState)(0),R=(0,y.useRef)(null);(0,y.useEffect)(()=>{if(E<=0)return;let e=setInterval(()=>D(e=>e-1),1e3);return()=>clearInterval(e)},[E]),(0,y.useEffect)(()=>{if(!O||!R.current)return;let e=R.current.getContext(`2d`);e.clearRect(0,0,200,60),e.fillStyle=`#f0f0f0`,e.fillRect(0,0,200,60);for(let t=0;t<5;t++)e.beginPath(),e.moveTo(Math.random()*200,Math.random()*60),e.lineTo(Math.random()*200,Math.random()*60),e.strokeStyle=`#ccc`,e.stroke();e.font=`28px Arial`,e.fillStyle=`#333`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`${P} + ${I} = ?`,100,30)},[O,P,I]);let generateCaptcha=()=>{let e=Math.floor(Math.random()*20)+1,t=Math.floor(Math.random()*20)+1;F(e),L(t),j(e+t)},confirmCaptcha=()=>{if(Number(M)!==A){o.error(`图形验证码错误`);return}k(!1),N(``),o.success(`验证码已发送：123456`),D(60)},handleSendCode=()=>{generateCaptcha(),k(!0)},submit=()=>{t.validateFields().then(()=>{if(n===`bidder`){let e=x.filter(e=>!w[e.key]||w[e.key].length===0);if(e.length>0){o.error(`请先上传：${e.map(e=>e.label).join(`、`)}`);return}}if(n===`tenderee`&&S.length===0){o.error(`请先上传营业执照等资质`);return}o.success(`注册信息已提交，等待平台审核`),e({to:`/login`})})},z={fileList:S,onChange:({fileList:e})=>C(e),beforeUpload:()=>!1,multiple:!0},renderCommonFields=()=>(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(m.Item,{label:`手机号`,name:`phone`,rules:[{required:!0,message:`请输入手机号`}],children:(0,b.jsx)(h,{placeholder:`请输入手机号`})}),(0,b.jsx)(m.Item,{label:`短信验证码`,name:`smsCode`,rules:[{required:!0,message:`请输入短信验证码`}],children:(0,b.jsx)(h,{placeholder:`请输入短信验证码`,suffix:(0,b.jsx)(i,{size:`small`,disabled:E>0,onClick:handleSendCode,children:E>0?`${E}s`:`获取短信验证码`})})}),(0,b.jsx)(m.Item,{label:`登录密码`,name:`password`,rules:[{required:!0,message:`请设置登录密码`}],children:(0,b.jsx)(h.Password,{placeholder:`请设置登录密码`})})]}),B={validator:(e,t)=>t?Promise.resolve():Promise.reject(Error(`请阅读并同意用户协议`))},renderOrgForm=e=>(0,b.jsxs)(m,{form:t,layout:`vertical`,children:[(0,b.jsx)(m.Item,{label:e?`单位名称`:`企业名称`,name:`companyName`,rules:[{required:!0,message:e?`请输入单位全称`:`请输入企业全称`}],children:(0,b.jsx)(h,{placeholder:e?`请输入单位全称`:`请输入企业全称`})}),(0,b.jsx)(m.Item,{label:`统一社会信用代码`,name:`creditCode`,rules:[{required:!0,message:`请输入统一社会信用代码`}],children:(0,b.jsx)(h,{placeholder:`请输入统一社会信用代码`})}),(0,b.jsx)(m.Item,{label:`联系人`,name:`contactName`,rules:[{required:!0,message:`请输入联系人姓名`}],children:(0,b.jsx)(h,{placeholder:`请输入联系人姓名`})}),!e&&(0,b.jsx)(m.Item,{label:`供应商类型`,name:`supplierType`,rules:[{required:!0,message:`请选择供应商类型`}],children:(0,b.jsx)(l,{placeholder:`请选择供应商类型`,options:[{label:`劳务`,value:`劳务`},{label:`材料`,value:`材料`},{label:`服务`,value:`服务`}]})}),renderCommonFields(),e?(0,b.jsx)(m.Item,{label:`资质附件`,children:(0,b.jsx)(g,{...z,children:(0,b.jsx)(i,{icon:(0,b.jsx)(v,{}),children:`上传营业执照等资质`})})}):(0,b.jsxs)(m.Item,{label:`资质附件`,children:[(0,b.jsxs)(`div`,{style:{marginBottom:12},children:[(0,b.jsx)(_,{color:`blue`,children:`按资质类型上传`}),(0,b.jsx)(`span`,{style:{color:`#666`,marginLeft:8},children:`便于后续按项目资质要求自动检测`})]}),(0,b.jsx)(p,{gutter:[16,16],children:x.map(e=>(0,b.jsx)(f,{xs:24,sm:12,children:(0,b.jsx)(d,{size:`small`,title:e.label,children:(0,b.jsx)(g,{fileList:w[e.key]||[],onChange:({fileList:t})=>T(n=>({...n,[e.key]:t})),beforeUpload:()=>!1,multiple:!1,children:(0,b.jsxs)(i,{icon:(0,b.jsx)(v,{}),children:[`上传 `,e.label]})})})},e.key))})]}),(0,b.jsx)(m.Item,{name:`agreed`,valuePropName:`checked`,rules:[B],children:(0,b.jsx)(u,{children:`我已阅读并同意《平台用户协议》`})})]}),V=(0,b.jsxs)(m,{form:t,layout:`vertical`,children:[(0,b.jsx)(m.Item,{label:`姓名`,name:`contactName`,rules:[{required:!0,message:`请输入姓名`}],children:(0,b.jsx)(h,{placeholder:`请输入姓名`})}),(0,b.jsx)(m.Item,{label:`身份证号`,name:`idCard`,rules:[{required:!0,message:`请输入身份证号`}],children:(0,b.jsx)(h,{placeholder:`请输入身份证号`})}),(0,b.jsx)(m.Item,{label:`专业领域`,name:`expertField`,rules:[{required:!0,message:`请输入专业领域`}],children:(0,b.jsx)(h,{placeholder:`例如：电子信息、机械设备`})}),renderCommonFields(),(0,b.jsx)(m.Item,{label:`资质附件`,children:(0,b.jsx)(g,{...z,children:(0,b.jsx)(i,{icon:(0,b.jsx)(v,{}),children:`上传职称证书等`})})})]}),H=[{key:`tenderee`,label:`采购单位注册`,children:renderOrgForm(!0)},{key:`bidder`,label:`供应商注册`,children:renderOrgForm(!1)},{key:`expert`,label:`专家注册`,children:V}];return(0,b.jsxs)(`div`,{className:`register-page`,children:[(0,b.jsxs)(`div`,{className:`register-container`,children:[(0,b.jsx)(`h2`,{children:`平台注册`}),(0,b.jsx)(c,{activeKey:n,onChange:a,type:`card`,items:H}),(0,b.jsxs)(`div`,{className:`actions`,children:[(0,b.jsx)(i,{type:`primary`,size:`large`,style:{width:`100%`},onClick:submit,children:`提交注册`}),(0,b.jsxs)(`div`,{className:`login-link`,children:[`已有账号？`,(0,b.jsx)(i,{type:`link`,onClick:()=>e({to:`/login`}),children:`立即登录`})]})]})]}),(0,b.jsx)(s,{title:`图形验证码`,open:O,onCancel:()=>{k(!1),N(``)},footer:null,destroyOnClose:!0,children:(0,b.jsxs)(`div`,{style:{textAlign:`center`,padding:`8px 0`},children:[(0,b.jsx)(`canvas`,{ref:R,width:200,height:60,style:{border:`1px solid #ddd`,borderRadius:4}}),(0,b.jsx)(`div`,{style:{marginTop:12},children:(0,b.jsx)(h,{placeholder:`请输入计算结果`,value:M,onChange:e=>N(e.target.value),style:{width:200},onPressEnter:confirmCaptcha})}),(0,b.jsxs)(`div`,{style:{marginTop:12,display:`flex`,justifyContent:`center`,gap:8},children:[(0,b.jsx)(i,{type:`primary`,onClick:confirmCaptcha,children:`确认`}),(0,b.jsx)(i,{onClick:()=>{generateCaptcha(),N(``)},children:`重新生成`})]})]})}),(0,b.jsx)(`style`,{children:`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .register-container {
          width: 720px;
          max-width: 100%;
          background: #fff;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .register-container h2 {
          text-align: center;
          margin-bottom: 24px;
          color: #001529;
        }
        .actions {
          margin-top: 24px;
        }
        .login-link {
          margin-top: 16px;
          text-align: center;
          color: #666;
        }
        @media (max-width: 768px) {
          .register-page {
            padding: 20px 12px;
            align-items: flex-start;
          }
          .register-container {
            padding: 20px 16px;
          }
          .register-container h2 {
            font-size: 20px;
            margin-bottom: 16px;
          }
        }
      `})]})}var S=a(`/register`)({component:Register});export{S as Route};