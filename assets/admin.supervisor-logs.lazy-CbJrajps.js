import{c as e}from"./useStore-DliLxn3V.js";import{n as t}from"./fileRoute-BqseIIh5.js";import{t as n}from"./alert-DEc4i3Ob.js";import{t as r}from"./table-Dm4X6obR.js";import{t as i}from"./message-e5C_tf52.js";import{t as a}from"./button-BuhZ9GOe.js";import{t as o}from"./card-D6vd6Hqa.js";import{s}from"./index-iA2mwhGe.js";var c=e();function SupervisorLogs(){return(0,c.jsxs)(`div`,{className:`supervisor-logs`,children:[(0,c.jsxs)(o,{title:(0,c.jsxs)(`div`,{className:`card-header`,children:[(0,c.jsx)(`span`,{children:`操作日志`}),(0,c.jsx)(a,{type:`primary`,onClick:()=>{i.success(`操作日志导出中...`)},children:`导出日志`})]}),children:[(0,c.jsx)(n,{title:`本页记录开标、评标过程中的关键操作，包括签到、解密、唱标、评分、签名等行为。`,type:`info`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,c.jsx)(r,{columns:[{title:`操作时间`,dataIndex:`time`,width:180},{title:`操作人`,dataIndex:`operator`,width:150},{title:`角色`,dataIndex:`role`,width:120},{title:`操作内容`,dataIndex:`action`,minWidth:250},{title:`IP 地址`,dataIndex:`ip`,width:140},{title:`结果`,dataIndex:`result`,width:100,render:e=>(0,c.jsx)(s,{color:e===`成功`?`success`:`error`,children:e})}],dataSource:[{time:`2026-07-08 14:50:12`,operator:`张三`,role:`招标人`,action:`进入开标大厅`,ip:`192.168.1.10`,result:`成功`},{time:`2026-07-08 14:55:33`,operator:`A科技有限公司`,role:`投标人`,action:`在线签到`,ip:`192.168.1.21`,result:`成功`},{time:`2026-07-08 15:02:18`,operator:`A科技有限公司`,role:`投标人`,action:`CA 解密投标文件`,ip:`192.168.1.21`,result:`成功`},{time:`2026-07-08 15:10:05`,operator:`李四`,role:`招标代理`,action:`执行唱标`,ip:`192.168.1.11`,result:`成功`},{time:`2026-07-08 15:30:22`,operator:`专家甲`,role:`评标专家`,action:`提交评分`,ip:`192.168.1.31`,result:`成功`}],rowKey:e=>`${e.time}-${e.operator}`,pagination:!1,style:{width:`100%`}})]}),(0,c.jsx)(`style`,{children:`
        .supervisor-logs {
          max-width: 1100px;
          margin: 0 auto;
        }
        .supervisor-logs .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
      `})]})}var l=t(`/admin/supervisor-logs`)({component:SupervisorLogs});export{l as Route};