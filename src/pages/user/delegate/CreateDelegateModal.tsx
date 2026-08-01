import { useState } from 'react'
import { App, Form, InputNumber, Modal } from 'antd'
import { createDelegate } from '@/api/delegate'
import { useAuth } from '@/auth/AuthContext'
import { ErrorCode, errorText, isApiError } from '@/lib/apiError'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

/** 发起代理：当前用户成为对方（被代理人）的代理人，需对方接受后生效 */
export function CreateDelegateModal({ open, onClose, onCreated }: Props) {
  const { message } = App.useApp()
  const { user } = useAuth()
  const [form] = Form.useForm<{ operateId: number }>()
  const [submitting, setSubmitting] = useState(false)

  const handleOk = async () => {
    let operateId: number
    try {
      const values = await form.validateFields()
      operateId = values.operateId
    } catch {
      return
    }
    setSubmitting(true)
    try {
      await createDelegate(operateId)
      message.success('已发起代理申请，等待对方接受')
      form.resetFields()
      onCreated()
    } catch (err) {
      if (isApiError(err) && (err.code === ErrorCode.DELEGATE_SELF || err.code === ErrorCode.USER_NOT_FOUND)) {
        form.setFields([{ name: 'operateId', errors: [errorText(err)] }])
      } else {
        message.error(errorText(err, '发起失败'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="发起代理"
      okText="发起"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnHidden
      width={400}
    >
      <p className="mb-4 text-sm text-fg-mute">
        你将成为对方的代理人，可代理管理其授权服务；需对方接受后生效。
      </p>
      <Form form={form} layout="vertical">
        <Form.Item
          name="operateId"
          label="被代理人用户 ID"
          rules={[
            { required: true, message: '请输入对方的用户 ID' },
            {
              validator: (_, value?: number) =>
                value != null && user && value === user.userId
                  ? Promise.reject(new Error('不能授权给自己'))
                  : Promise.resolve(),
            },
          ]}
        >
          <InputNumber className="!w-full" min={1} precision={0} placeholder="对方在「基本信息」中的用户 ID" controls={false} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
