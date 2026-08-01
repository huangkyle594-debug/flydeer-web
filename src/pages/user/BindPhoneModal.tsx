import { useState } from 'react'
import { App, Alert, Button, Form, Input, Modal } from 'antd'
import { MobileOutlined, SafetyOutlined } from '@ant-design/icons'
import { bindPhone, sendBindPhoneSms } from '@/api/user'
import { useAuth } from '@/auth/AuthContext'
import { useSmsCountdown } from '@/auth/useSmsCountdown'
import { ErrorCode, errorText, isApiError } from '@/lib/apiError'

const PHONE_PATTERN = /^1\d{10}$/

type BindFormValues = { phone: string; code: string }

/**
 * OAuth 渠道用户绑定手机号完成实名。
 * 成功后必须先替换本地 accessToken（新 token verified=true），再重拉资料。
 */
export function BindPhoneModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { message } = App.useApp()
  const { applyNewToken, refreshProfile } = useAuth()
  const [form] = Form.useForm<BindFormValues>()
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const countdown = useSmsCountdown()

  const handleSendCode = async () => {
    let phone: string
    try {
      const values = await form.validateFields(['phone'])
      phone = values.phone
    } catch {
      return
    }
    setSending(true)
    try {
      await sendBindPhoneSms(phone)
      message.success('验证码已发送')
      countdown.start(60)
    } catch (err) {
      if (isApiError(err) && err.code === ErrorCode.SMS_RATE_FREQUENCY) {
        message.warning(errorText(err))
        countdown.start(60)
      } else {
        message.error(errorText(err, '验证码发送失败'))
      }
    } finally {
      setSending(false)
    }
  }

  const handleOk = async () => {
    let values: BindFormValues
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    setSubmitting(true)
    try {
      const vo = await bindPhone(values.phone, values.code)
      // 顺序敏感：先换 token（verified=true），否则后续实名接口 403
      applyNewToken(vo)
      await refreshProfile()
      message.success('绑定成功，已完成实名')
      form.resetFields()
      onClose()
    } catch (err) {
      if (isApiError(err) && err.code === ErrorCode.SMS_VERIFY) {
        form.setFields([{ name: 'code', errors: ['验证码错误或已失效'] }])
      } else if (isApiError(err) && err.code === ErrorCode.PHONE_BIND_LIMIT) {
        form.setFields([{ name: 'phone', errors: ['该手机号已被同渠道其他账号绑定'] }])
      } else {
        message.error(errorText(err, '绑定失败'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="绑定手机号"
      okText="确认绑定"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnHidden
      width={400}
    >
      <Alert type="info" showIcon message="绑定手机号后即完成实名认证" className="my-4" />
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: PHONE_PATTERN, message: '手机号格式不正确' },
          ]}
        >
          <Input prefix={<MobileOutlined />} placeholder="手机号" maxLength={11} />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <Input
            prefix={<SafetyOutlined />}
            placeholder="短信验证码"
            maxLength={6}
            suffix={
              <Button
                type="link"
                size="small"
                disabled={countdown.running}
                loading={sending}
                onClick={handleSendCode}
              >
                {countdown.running ? `重新发送(${countdown.remaining}s)` : '获取验证码'}
              </Button>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
