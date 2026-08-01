import { useState } from 'react'
import { App, Button, Checkbox, Divider, Form, Input, Modal } from 'antd'
import { GithubOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import { GiteeOutlined } from '@/components/icons/GiteeOutlined'
import { sendLoginSms } from '@/api/auth'
import { ErrorCode, errorText, isApiError } from '@/lib/apiError'
import { useAuth } from './AuthContext'
import { useSmsCountdown } from './useSmsCountdown'
import type { OauthProvider } from '@/types/api'

const PHONE_PATTERN = /^1\d{10}$/

type LoginFormValues = {
  phone: string
  code: string
}

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { message } = App.useApp()
  const { loginBySms, loginByOauth } = useAuth()
  const [form] = Form.useForm<LoginFormValues>()
  const [agreed, setAgreed] = useState(false)
  const [agreementWarn, setAgreementWarn] = useState(false)
  const [sending, setSending] = useState(false)
  const [logging, setLogging] = useState(false)
  const [loginLocked, setLoginLocked] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OauthProvider | null>(null)
  const countdown = useSmsCountdown()

  /** 三个登录入口（短信、Gitee、GitHub）共用的协议校验 */
  const checkAgreement = (): boolean => {
    if (agreed) return true
    setAgreementWarn(true)
    message.warning('请先阅读并同意用户协议')
    return false
  }

  const handleSendCode = async () => {
    let phone: string
    try {
      // 只校验手机号字段，不合法只标字段错误不发请求
      const values = await form.validateFields(['phone'])
      phone = values.phone
    } catch {
      return
    }
    setSending(true)
    try {
      await sendLoginSms(phone)
      message.success('验证码已发送')
      countdown.start(60)
    } catch (err) {
      if (isApiError(err) && err.code === ErrorCode.SMS_RATE_FREQUENCY) {
        // 频控：展示服务端文案并进入倒计时
        message.warning(errorText(err))
        countdown.start(60)
      } else {
        message.error(errorText(err, '验证码发送失败'))
      }
    } finally {
      setSending(false)
    }
  }

  const handleSmsLogin = async (values: LoginFormValues) => {
    if (!checkAgreement()) return
    setLogging(true)
    try {
      await loginBySms(values.phone, values.code)
      message.success('登录成功')
      handleClose()
    } catch (err) {
      if (isApiError(err) && err.code === ErrorCode.SMS_VERIFY) {
        form.setFields([{ name: 'code', errors: ['验证码错误或已失效'] }])
      } else if (isApiError(err) && err.code === ErrorCode.LOGIN_RATE_FREQUENCY) {
        message.warning(errorText(err))
        setLoginLocked(true)
        setTimeout(() => setLoginLocked(false), 10_000)
      } else {
        message.error(errorText(err, '登录失败'))
      }
    } finally {
      setLogging(false)
    }
  }

  const handleOauth = async (provider: OauthProvider) => {
    if (!checkAgreement()) return
    setOauthLoading(provider)
    try {
      await loginByOauth(provider) // 成功则整页跳转，不会回来
      setOauthLoading(null)
    } catch (err) {
      setOauthLoading(null)
      message.error(errorText(err, '获取授权链接失败'))
    }
  }

  const handleClose = () => {
    form.resetFields()
    setAgreed(false)
    setAgreementWarn(false)
    onClose()
  }

  return (
    <Modal open={open} onCancel={handleClose} footer={null} title="登录 / 注册" width={400} destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={handleSmsLogin} requiredMark={false} className="mt-4">
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: PHONE_PATTERN, message: '手机号格式不正确' },
          ]}
        >
          <Input prefix={<MobileOutlined />} placeholder="手机号" maxLength={11} size="large" />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <Input
            prefix={<SafetyOutlined />}
            placeholder="短信验证码"
            maxLength={6}
            size="large"
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
        <Button type="primary" htmlType="submit" block size="large" loading={logging} disabled={loginLocked}>
          登录
        </Button>
      </Form>

      <Divider plain className="!text-fg-faint !text-xs">
        或使用以下方式登录
      </Divider>

      <div className="flex gap-3">
        <Button
          block
          icon={<GithubOutlined />}
          loading={oauthLoading === 'github'}
          onClick={() => handleOauth('github')}
        >
          GitHub
        </Button>
        <Button
          block
          icon={<GiteeOutlined />}
          loading={oauthLoading === 'gitee'}
          onClick={() => handleOauth('gitee')}
        >
          Gitee
        </Button>
      </div>

      <div className={`mt-5 rounded-md p-2 ${agreementWarn && !agreed ? 'bg-danger/10 outline outline-danger/60' : ''}`}>
        <Checkbox
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked)
            if (e.target.checked) setAgreementWarn(false)
          }}
        >
          <span className="text-xs text-fg-mute">
            我已阅读并同意
            <Link to="/doc/user-agreement" target="_blank" className="text-accent">
              《用户协议》
            </Link>
            <Link to="/doc/terms-of-service" target="_blank" className="text-accent">
              《服务条款》
            </Link>
          </span>
        </Checkbox>
      </div>
    </Modal>
  )
}
