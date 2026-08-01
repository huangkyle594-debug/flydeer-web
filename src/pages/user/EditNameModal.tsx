import { useState } from 'react'
import { App, Form, Input, Modal } from 'antd'
import { updateName } from '@/api/user'
import { useAuth } from '@/auth/AuthContext'
import { ErrorCode, errorText, isApiError } from '@/lib/apiError'

export function EditNameModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { message } = App.useApp()
  const { user, refreshProfile } = useAuth()
  const [form] = Form.useForm<{ name: string }>()
  const [submitting, setSubmitting] = useState(false)

  const handleOk = async () => {
    let name: string
    try {
      const values = await form.validateFields()
      name = values.name.trim()
    } catch {
      return
    }
    setSubmitting(true)
    try {
      await updateName(name)
      await refreshProfile()
      message.success('昵称已更新')
      onClose()
    } catch (err) {
      if (isApiError(err) && err.code === ErrorCode.BAD_REQUEST) {
        form.setFields([{ name: 'name', errors: [errorText(err)] }])
      } else {
        message.error(errorText(err, '昵称更新失败'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="修改昵称"
      okText="保存"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnHidden
      width={400}
    >
      <Form form={form} layout="vertical" initialValues={{ name: user?.name }} className="mt-4">
        <Form.Item
          name="name"
          rules={[
            { required: true, whitespace: true, message: '请输入昵称' },
            { max: 20, message: '昵称最长 20 个字符' },
          ]}
        >
          <Input maxLength={20} showCount placeholder="输入新昵称" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
