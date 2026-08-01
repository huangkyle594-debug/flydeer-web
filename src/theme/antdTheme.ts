import { theme, type ThemeConfig } from 'antd'

/**
 * antd 主题：darkAlgorithm 基础上映射「水边夜色 + 鹭羽青」token。
 * 原则：亮青只给激活/选中/focus，大面积保持安静。
 */
export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#0891b2', // accent-deep：主按钮实底
    colorInfo: '#22d3ee',
    colorLink: '#22d3ee',
    colorBgBase: '#0b1014', // surface-0
    colorBgContainer: '#182027', // surface-2：卡片、输入框
    colorBgElevated: '#1f2a33', // surface-3：弹窗、浮层
    colorBgLayout: '#0b1014',
    colorBorder: '#2f3f4a', // line-strong
    colorBorderSecondary: '#233039', // line
    colorText: '#e6edf3',
    colorTextSecondary: '#8b98a5',
    colorTextTertiary: '#8b98a5',
    colorTextPlaceholder: '#5c6873',
    colorError: '#f87171',
    borderRadius: 8,
  },
  components: {
    Layout: {
      headerBg: '#11181e', // surface-1
      bodyBg: '#0b1014',
      footerBg: '#11181e',
    },
    Modal: {
      contentBg: '#182027',
      headerBg: '#182027',
    },
  },
}
