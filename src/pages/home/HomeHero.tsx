import { useEffect, useState } from 'react'

const PHRASE = '一场AI时代传统程序员的赎罪'

const ROW_COUNT = 8
const WORDS_PER_ROW = 4

/** 编程相关词库：语言 / 框架 / 工具 / 概念 / 符号 */
const WORD_BANK = [
  // languages
  'Java',
  'Python',
  'Go',
  'Rust',
  'TypeScript',
  'JavaScript',
  'C++',
  'C#',
  'Kotlin',
  'Swift',
  'Scala',
  'Ruby',
  'PHP',
  'SQL',
  'Bash',
  'Lua',
  // frameworks / libs
  'Spring',
  'React',
  'Vue',
  'Next.js',
  'Node.js',
  'Django',
  'Flask',
  'FastAPI',
  'Gin',
  'NestJS',
  'MyBatis',
  'Hibernate',
  'JPA',
  'Express',
  'Laravel',
  'Rails',
  'Flutter',
  'Android',
  'iOS',
  // infra / data
  'Redis',
  'Kafka',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Elastic',
  'Docker',
  'K8s',
  'Nginx',
  'AWS',
  'GCP',
  'Azure',
  'CI/CD',
  'Git',
  'Linux',
  'Prometheus',
  'Grafana',
  // protocols / concepts
  'JVM',
  'Netty',
  'gRPC',
  'HTTP',
  'TCP',
  'WebSocket',
  'GraphQL',
  'REST',
  'MQ',
  'RPC',
  'API',
  'ORM',
  'DDD',
  'TDD',
  'GC',
  // tooling
  'Maven',
  'Gradle',
  'npm',
  'pnpm',
  'Webpack',
  'Vite',
  'JUnit',
  'Jest',
  'Pytest',
  'Lombok',
  'Jackson',
  'Tomcat',
  'Nacos',
  'Dubbo',
  'Zookeeper',
  'RabbitMQ',
  // symbols / shorthand
  'async',
  'await',
  'null',
  'bug',
  'fix',
  'refactor',
  'ship',
  // short snippets
  'while (true)',
  'try/catch',
  'throw e;',
  'SELECT *',
  'JOIN ON',
  'git push',
  'npm i',
  'docker run',
  'kubectl get',
  'fn main()',
  'def main():',
  'public static',
  'System.out',
  'console.log',
  'fmt.Println',
  'printf("%s")',
  '?.map()',
  '...args',
  'Promise.all',
  'useState()',
  '@Override',
  '@Autowired',
  'new Thread()',
  'lock.unlock()',
  'COMMIT;',
  'curl -X POST',
] as const

function shuffle<T>(list: T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildRandomRows(): string[][] {
  const need = ROW_COUNT * WORDS_PER_ROW
  const pool = shuffle([...WORD_BANK])
  // 词库不够时循环补齐，但仍尽量打散
  while (pool.length < need) {
    pool.push(...shuffle([...WORD_BANK]))
  }
  const picked = pool.slice(0, need)
  const rows: string[][] = []
  for (let i = 0; i < ROW_COUNT; i++) {
    rows.push(picked.slice(i * WORDS_PER_ROW, (i + 1) * WORDS_PER_ROW))
  }
  return rows
}

function CodeRow({ items }: { items: readonly string[] }) {
  return (
    <div className="home-hero-code-strip">
      {items.map((item, i) => (
        <span key={`${item}-${i}`}>{item}</span>
      ))}
    </div>
  )
}

/**
 * 首页题词区：静态图标 + 艺术字 + 椭圆蒙层多行重叠横向滚动词条。
 * 词条每次挂载随机抽取，避免 SSR/CSR hydration 不一致。
 */
export function HomeHero() {
  const [rows, setRows] = useState<string[][] | null>(null)

  useEffect(() => {
    setRows(buildRandomRows())
  }, [])

  return (
    <section
      className="home-hero relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden"
      aria-label={PHRASE}
    >
      <div className="home-hero-code" aria-hidden>
        {rows ? (
          <div className="home-hero-code-rows">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`home-hero-code-track ${i % 2 === 1 ? 'home-hero-code-track--reverse' : ''}`}
                style={{ animationDuration: `${(44 + i * 7) * 0.9}s` }}
              >
                <CodeRow items={row} />
                <CodeRow items={row} />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative z-[1] mx-auto flex max-w-5xl flex-col items-center px-6 pt-0 pb-0">
        <div className="flex flex-col items-center justify-center pt-0 pb-2">
          <img
            src="/logo.png"
            alt="飞天小鹭"
            className="mb-3 h-24 w-24 rounded-2xl sm:h-28 sm:w-28"
            draggable={false}
          />
          <h1 className="home-hero-title text-center">{PHRASE}</h1>
        </div>
        <div className="home-hero-horizon -mt-0.5 w-full max-w-md sm:max-w-xl" aria-hidden />
      </div>
    </section>
  )
}
