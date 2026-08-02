const MESSAGE = '该网站正在建设中...'

/** 顶栏下方滚动提示条 */
export function ConstructionBanner() {
  // 复制多段以保证宽屏也能连续滚动
  const units = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="mx-8 shrink-0">
      {MESSAGE}
    </span>
  ))

  return (
    <div
      className="overflow-hidden border-b border-line bg-surface-2 py-1.5 text-xs text-accent"
      role="status"
      aria-label={MESSAGE}
    >
      <div className="site-marquee-track flex w-max whitespace-nowrap">
        <div className="flex">{units}</div>
        <div className="flex" aria-hidden>
          {units}
        </div>
      </div>
    </div>
  )
}
