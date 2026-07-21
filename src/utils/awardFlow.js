// 定标阶段共享口径（fix-award-step-regression-20260721）
// 由 AwardConfirm（确认中标人）、AwardNotice（中标通知书）共同消费，
// 统一阶段推导，杜绝两页面重复实现漂移导致「确认中标人后步骤回退第一步」。
//
// 阶段按推进顺序：评标中 → 评标完成 → 已确认中标人 → 中标通知书已发出
export const AWARD_STAGES = ['evaluating', 'evaluation-done', 'winner-confirmed', 'notice-sent']

export const STAGE_LABELS = {
  evaluating: '评标中',
  'evaluation-done': '评标完成',
  'winner-confirmed': '已确认中标人',
  'notice-sent': '中标通知书已发出'
}

export const stageIndex = (stage) => AWARD_STAGES.indexOf(stage)

// 现状可用的阶段判定（按优先级）：
// 1. 项目记录上的 awardStage —— 定标侧操作回写，最优先；
// 2. 邀请询比价（RFQ）项目当前口径无开标/评标环节，直接视为「评标完成」
//    （hall-purchase-method-mapping-20260721 实施后询比族也走评标，届时可删除本分支）；
// 3. evaluationStore 评标状态 submitted/confirmed —— 评标环节已提交评标报告，视为「评标完成」。
export function resolveAwardStage(projectId, project, evaluationStore, isInvitedRfqProject) {
  if (project?.awardStage) return project.awardStage
  if (isInvitedRfqProject && isInvitedRfqProject(project)) return 'evaluation-done'
  const evalStatus = evaluationStore.getEval(projectId).status
  if (evalStatus === 'submitted' || evalStatus === 'confirmed') return 'evaluation-done'
  return 'evaluating'
}
