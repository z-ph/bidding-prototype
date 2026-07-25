import{c as e}from"./useStore-DliLxn3V.js";import{t}from"./button-kN9I3LUV.js";import{n}from"./fileRoute-CYesOn2-.js";import{t as r}from"./alert-7UhMD6Ax.js";import{t as i}from"./table-Byu8Gjrq.js";import{t as a}from"./message-C4PuKih5.js";import{t as o}from"./card-xz9k-4M9.js";import{t as s}from"./tag-BtNDBJzJ.js";var c=e();function SupervisorLogs(){return(0,c.jsxs)(`div`,{className:`supervisor-logs`,children:[(0,c.jsxs)(o,{title:(0,c.jsxs)(`div`,{className:`card-header`,children:[(0,c.jsx)(`span`,{children:`操作日志`}),(0,c.jsx)(t,{type:`primary`,onClick:()=>{a.success(`操作日志导出中...`)},children:`导出日志`})]}),children:[(0,c.jsx)(r,{title:`本页记录开启、评审过程中的关键操作，包括签到、解密、唱价、评分、签名等行为。所有 IP 地址为演示数据。`,type:`info`,showIcon:!0,closable:!1,style:{marginBottom:20}}),(0,c.jsx)(i,{columns:[{title:`操作时间`,dataIndex:`time`,width:180},{title:`操作人`,dataIndex:`operator`,width:150},{title:`角色`,dataIndex:`role`,width:120},{title:`操作内容`,dataIndex:`action`,minWidth:250},{title:`IP 地址`,dataIndex:`ip`,width:140},{title:`结果`,dataIndex:`result`,width:100,render:e=>(0,c.jsx)(s,{color:e===`成功`?`success`:`error`,children:e})}],dataSource:[{time:`2026-07-08 14:50:12`,operator:`张三`,role:`采购单位`,action:`进入开启大厅`,ip:`192.168.1.10`,result:`成功`},{time:`2026-07-08 14:55:33`,operator:`A科技有限公司`,role:`响应单位`,action:`在线签到`,ip:`192.168.1.21`,result:`成功`},{time:`2026-07-08 15:02:18`,operator:`A科技有限公司`,role:`响应单位`,action:`CA 解密响应文件`,ip:`192.168.1.21`,result:`成功`},{time:`2026-07-08 15:10:05`,operator:`李四`,role:`采购代理`,action:`执行唱价`,ip:`192.168.1.11`,result:`成功`},{time:`2026-07-08 15:30:22`,operator:`专家甲`,role:`评审专家`,action:`提交评分`,ip:`192.168.1.31`,result:`成功`}],rowKey:e=>`${e.time}-${e.operator}`,pagination:!1,style:{width:`100%`}})]}),(0,c.jsx)(`style`,{children:`
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
      `})]})}var l=n(`/admin/supervisor-logs`)({component:SupervisorLogs});export{l as Route};