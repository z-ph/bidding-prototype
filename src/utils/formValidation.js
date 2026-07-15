// 表单最终校验与自动定位工具
// 支持 Ant Design Form 校验结果，自动滚动并聚焦到首个错误字段

/**
 * 从 Ant Design Form validateFields() 抛出的错误信息中定位首个错误字段，
 * 滚动到对应表单元素并触发聚焦。
 *
 * @param {object} errorInfo - Ant Design Form 抛出的错误对象，通常包含 errorFields
 * @param {object} [options]
 * @param {string} [options.formSelector='.ant-form'] - 表单容器选择器
 * @param {string} [options.errorClass='ant-form-item-has-error'] - 错误表单项类名
 */
export function validateAndScrollToError(errorInfo, options = {}) {
  const { formSelector = '.ant-form', errorClass = 'ant-form-item-has-error' } = options

  // 延迟执行，确保 Ant Design 已经完成错误提示渲染
  setTimeout(() => {
    const formElement = document.querySelector(formSelector)
    if (!formElement) return

    const firstErrorItem = formElement.querySelector(`.${errorClass}`)
    if (!firstErrorItem) return

    // 滚动到首个错误字段
    firstErrorItem.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // 聚焦到字段内的第一个可聚焦元素
    const focusable = firstErrorItem.querySelector(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), .ant-select:not(.ant-select-disabled)'
    )
    if (focusable) {
      focusable.focus()
      if (focusable.select && typeof focusable.select === 'function') {
        try {
          focusable.select()
        } catch {
          // ignore
        }
      }
    }
  }, 100)
}

/**
 * 校验指定字段数组是否为空，返回首个未填字段信息。
 * 用于非 Form.Item 托管字段的手动校验。
 *
 * @param {Array<{key:string, value:any, label:string}>} fields
 * @returns {{valid:boolean, firstInvalid?:object}}
 */
export function validateRequiredFields(fields) {
  for (const field of fields) {
    const { key, value, label } = field
    const isEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    if (isEmpty) {
      return { valid: false, firstInvalid: field }
    }
  }
  return { valid: true }
}

/**
 * 滚动到自定义选择器对应的元素并聚焦。
 *
 * @param {string} selector - CSS 选择器
 */
export function scrollToElement(selector) {
  const element = document.querySelector(selector)
  if (!element) return
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const focusable = element.querySelector(
    'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), .ant-select:not(.ant-select-disabled)'
  )
  if (focusable) focusable.focus()
}
