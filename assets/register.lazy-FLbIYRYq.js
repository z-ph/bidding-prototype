import{Q as e,Y as t,c as n}from"./useStore-DliLxn3V.js";import{hn as r}from"./compact-item-BzoyQ67m.js";import{n as i}from"./fileRoute-BqseIIh5.js";import{t as a}from"./message-e5C_tf52.js";import{t as o}from"./button-BuhZ9GOe.js";import{t as s}from"./card-D6vd6Hqa.js";import{t as c}from"./tabs-DQnkvcOM.js";import{n as l,t as u}from"./row--ylINF3E.js";import{t as d}from"./form-Dhkd__kg.js";import{t as f}from"./input-B5Mlbp8a.js";import{t as p}from"./upload-B6PiuUw3.js";import{t as m}from"./UploadOutlined-BKiGnYjT.js";import{s as h,u as g}from"./index-iA2mwhGe.js";var _=e(t(),1),v=n(),y=[{key:`营业执照`,label:`营业执照`},{key:`ISO9001认证`,label:`ISO9001认证`},{key:`安全生产许可证`,label:`安全生产许可证`},{key:`特定行业资质`,label:`特定行业资质`}];function Register(){let e=r(),[t]=d.useForm(),[n,i]=(0,_.useState)(`tenderee`),[b,x]=(0,_.useState)([]),[S,C]=(0,_.useState)({}),submit=()=>{t.validateFields().then(()=>{if(n===`bidder`){let e=y.filter(e=>!S[e.key]||S[e.key].length===0);if(e.length>0){a.error(`请先上传：${e.map(e=>e.label).join(`、`)}`);return}}if(n===`tenderee`&&b.length===0){a.error(`请先上传营业执照等资质`);return}a.success(`注册信息已提交，等待平台审核`),e({to:`/login`})})},w={fileList:b,onChange:({fileList:e})=>x(e),beforeUpload:()=>!1,multiple:!0},renderCommonFields=()=>(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(d.Item,{label:`手机号`,name:`phone`,rules:[{required:!0,message:`请输入手机号`}],children:(0,v.jsx)(f,{placeholder:`请输入手机号`})}),(0,v.jsx)(d.Item,{label:`登录密码`,name:`password`,rules:[{required:!0,message:`请设置登录密码`}],children:(0,v.jsx)(f.Password,{placeholder:`请设置登录密码`})})]}),T={validator:(e,t)=>t?Promise.resolve():Promise.reject(Error(`请阅读并同意用户协议`))},renderOrgForm=e=>(0,v.jsxs)(d,{form:t,layout:`vertical`,children:[(0,v.jsx)(d.Item,{label:e?`单位名称`:`企业名称`,name:`companyName`,rules:[{required:!0,message:e?`请输入单位全称`:`请输入企业全称`}],children:(0,v.jsx)(f,{placeholder:e?`请输入单位全称`:`请输入企业全称`})}),(0,v.jsx)(d.Item,{label:`统一社会信用代码`,name:`creditCode`,rules:[{required:!0,message:`请输入统一社会信用代码`}],children:(0,v.jsx)(f,{placeholder:`请输入统一社会信用代码`})}),(0,v.jsx)(d.Item,{label:`联系人`,name:`contactName`,rules:[{required:!0,message:`请输入联系人姓名`}],children:(0,v.jsx)(f,{placeholder:`请输入联系人姓名`})}),renderCommonFields(),e?(0,v.jsx)(d.Item,{label:`资质附件`,children:(0,v.jsx)(p,{...w,children:(0,v.jsx)(o,{icon:(0,v.jsx)(m,{}),children:`上传营业执照等资质`})})}):(0,v.jsxs)(d.Item,{label:`资质附件`,children:[(0,v.jsxs)(`div`,{style:{marginBottom:12},children:[(0,v.jsx)(h,{color:`blue`,children:`按资质类型上传`}),(0,v.jsx)(`span`,{style:{color:`#666`,marginLeft:8},children:`便于后续按项目资质要求自动检测`})]}),(0,v.jsx)(u,{gutter:[16,16],children:y.map(e=>(0,v.jsx)(l,{span:12,children:(0,v.jsx)(s,{size:`small`,title:e.label,children:(0,v.jsx)(p,{fileList:S[e.key]||[],onChange:({fileList:t})=>C(n=>({...n,[e.key]:t})),beforeUpload:()=>!1,multiple:!1,children:(0,v.jsxs)(o,{icon:(0,v.jsx)(m,{}),children:[`上传 `,e.label]})})})},e.key))})]}),(0,v.jsx)(d.Item,{name:`agreed`,valuePropName:`checked`,rules:[T],children:(0,v.jsx)(g,{children:`我已阅读并同意《平台用户协议》`})})]}),E=(0,v.jsxs)(d,{form:t,layout:`vertical`,children:[(0,v.jsx)(d.Item,{label:`姓名`,name:`contactName`,rules:[{required:!0,message:`请输入姓名`}],children:(0,v.jsx)(f,{placeholder:`请输入姓名`})}),(0,v.jsx)(d.Item,{label:`身份证号`,name:`idCard`,rules:[{required:!0,message:`请输入身份证号`}],children:(0,v.jsx)(f,{placeholder:`请输入身份证号`})}),(0,v.jsx)(d.Item,{label:`专业领域`,name:`expertField`,rules:[{required:!0,message:`请输入专业领域`}],children:(0,v.jsx)(f,{placeholder:`例如：电子信息、机械设备`})}),renderCommonFields(),(0,v.jsx)(d.Item,{label:`资质附件`,children:(0,v.jsx)(p,{...w,children:(0,v.jsx)(o,{icon:(0,v.jsx)(m,{}),children:`上传职称证书等`})})})]}),D=[{key:`tenderee`,label:`招标人注册`,children:renderOrgForm(!0)},{key:`bidder`,label:`供应商注册`,children:renderOrgForm(!1)},{key:`expert`,label:`专家注册`,children:E}];return(0,v.jsxs)(`div`,{className:`register-page`,children:[(0,v.jsxs)(`div`,{className:`register-container`,children:[(0,v.jsx)(`h2`,{children:`平台注册`}),(0,v.jsx)(c,{activeKey:n,onChange:i,type:`card`,items:D}),(0,v.jsxs)(`div`,{className:`actions`,children:[(0,v.jsx)(o,{type:`primary`,size:`large`,style:{width:`100%`},onClick:submit,children:`提交注册`}),(0,v.jsxs)(`div`,{className:`login-link`,children:[`已有账号？`,(0,v.jsx)(o,{type:`link`,onClick:()=>e({to:`/login`}),children:`立即登录`})]})]})]}),(0,v.jsx)(`style`,{children:`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #001529 0%, #003366 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .register-container {
          width: 520px;
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
      `})]})}var b=i(`/register`)({component:Register});export{b as Route};