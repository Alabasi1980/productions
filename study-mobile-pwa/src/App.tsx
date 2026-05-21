import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { BookOpen, Download, FolderTree, Menu, Search, Sparkles, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

type ContentNode = {
  type: 'directory' | 'file'
  name: string
  title: string
  relativePath: string
  url?: string
  children?: ContentNode[]
}

type ContentManifest = {
  generatedAt: string
  root: ContentNode
}

type FlatDoc = {
  title: string
  relativePath: string
  pathLabel: string
  url: string
}

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const STORAGE_KEYS = {
  selectedDoc: 'study-mobile-pwa:selected-doc',
}

function flattenFiles(node: ContentNode, parents: string[] = []): FlatDoc[] {
  if (node.type === 'file' && node.url) {
    return [
      {
        title: node.title,
        relativePath: node.relativePath,
        pathLabel: parents.join(' / '),
        url: node.url,
      },
    ]
  }

  return (node.children ?? []).flatMap((child) =>
    flattenFiles(child, node.relativePath ? [...parents, node.title] : parents),
  )
}

function countDocs(node: ContentNode): number {
  if (node.type === 'file') {
    return 1
  }

  return (node.children ?? []).reduce((sum, child) => sum + countDocs(child), 0)
}

function countFolders(node: ContentNode): number {
  if (node.type === 'file') {
    return 0
  }

  return 1 + (node.children ?? []).reduce((sum, child) => sum + countFolders(child), 0)
}

function decodeInternalPath(href: string): string | null {
  const decodedHref = decodeURIComponent(href)
  const marker = '/00_مسار الدراسة المهنية/'

  if (decodedHref.includes(marker)) {
    return decodedHref.split(marker)[1] ?? null
  }

  if (decodedHref.startsWith('/content/')) {
    return decodedHref.replace('/content/', '')
  }

  return null
}

function filterTree(node: ContentNode, query: string): ContentNode | null {
  if (!query.trim()) {
    return node
  }

  const normalizedQuery = query.trim().toLowerCase()
  const titleMatches = node.title.toLowerCase().includes(normalizedQuery)

  if (node.type === 'file') {
    return titleMatches ? node : null
  }

  const filteredChildren = (node.children ?? [])
    .map((child) => filterTree(child, normalizedQuery))
    .filter(Boolean) as ContentNode[]

  if (titleMatches || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
    }
  }

  return null
}

function TreeItem({
  node,
  depth,
  activePath,
  onSelect,
}: {
  node: ContentNode
  depth: number
  activePath: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(depth < 2)

  useEffect(() => {
    if (node.type === 'directory' && node.children?.some((child) => child.relativePath === activePath || activePath?.startsWith(`${child.relativePath}/`))) {
      setOpen(true)
    }
  }, [activePath, node])

  if (node.type === 'file' && node.url) {
    return (
      <button
        type="button"
        className={`tree-file ${activePath === node.relativePath ? 'active' : ''}`}
        onClick={() => onSelect(node.relativePath)}
      >
        <span>{node.title}</span>
      </button>
    )
  }

  return (
    <div className="tree-group">
      {node.relativePath ? (
        <button type="button" className="tree-group-toggle" onClick={() => setOpen((current) => !current)}>
          <FolderTree size={16} />
          <span>{node.title}</span>
        </button>
      ) : null}

      {(node.relativePath === '' || open) && node.children?.length ? (
        <div className={`tree-children depth-${Math.min(depth, 6)}`}>
          {node.children.map((child) => (
            <TreeItem key={child.relativePath || child.name} node={child} depth={depth + 1} activePath={activePath} onSelect={onSelect} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function App() {
  const [manifest, setManifest] = useState<ContentManifest | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [installPrompt, setInstallPrompt] = useState<DeferredPromptEvent | null>(null)

  const allDocs = useMemo(() => (manifest ? flattenFiles(manifest.root) : []), [manifest])
  const selectedDoc = useMemo(
    () => allDocs.find((doc) => doc.relativePath === selectedPath) ?? null,
    [allDocs, selectedPath],
  )
  const filteredTree = useMemo(
    () => (manifest ? filterTree(manifest.root, deferredSearch) : null),
    [deferredSearch, manifest],
  )

  useEffect(() => {
    let active = true

    fetch('/content-index.json')
      .then((response) => response.json())
      .then((data: ContentManifest) => {
        if (!active) {
          return
        }

        setManifest(data)
        const savedPath = window.localStorage.getItem(STORAGE_KEYS.selectedDoc)
        const docs = flattenFiles(data.root)
        const defaultPath = docs.find((doc) => doc.relativePath.endsWith('00_دليل_المجلد.md'))?.relativePath ?? docs[0]?.relativePath ?? null
        setSelectedPath(savedPath && docs.some((doc) => doc.relativePath === savedPath) ? savedPath : defaultPath)
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as DeferredPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    return () => {
      active = false
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (!selectedDoc) {
      return
    }

    let active = true
    setContent('')

    fetch(selectedDoc.url)
      .then((response) => response.text())
      .then((text) => {
        if (!active) {
          return
        }

        setContent(text)
        window.localStorage.setItem(STORAGE_KEYS.selectedDoc, selectedDoc.relativePath)
      })

    return () => {
      active = false
    }
  }, [selectedDoc])

  function handleSelectDoc(relativePath: string) {
    startTransition(() => {
      setSelectedPath(relativePath)
      setDrawerOpen(false)
    })
  }

  async function handleInstall() {
    if (!installPrompt) {
      return
    }

    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const docsCount = manifest ? countDocs(manifest.root) : 0
  const foldersCount = manifest ? countFolders(manifest.root) - 1 : 0

  return (
    <div className="app-shell">
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <div>
            <p className="eyebrow">دراسة متنقلة</p>
            <h1>مسار الدراسة المهنية</h1>
          </div>
          <button type="button" className="icon-button mobile-only" title="إغلاق القائمة" aria-label="إغلاق القائمة" onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن درس أو ملحق أو اختبار"
          />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>{docsCount}</span>
            <small>ملف دراسي</small>
          </div>
          <div className="stat-card">
            <span>{foldersCount}</span>
            <small>مجلد</small>
          </div>
        </div>

        <div className="sidebar-tree">
          {loading ? <p className="muted">جار تحميل الفهرس...</p> : null}
          {filteredTree ? (
            <TreeItem node={filteredTree} depth={0} activePath={selectedPath} onSelect={handleSelectDoc} />
          ) : null}
        </div>
      </aside>

      {drawerOpen ? <button type="button" className="drawer-backdrop" title="إغلاق القائمة" aria-label="إغلاق القائمة" onClick={() => setDrawerOpen(false)} /> : null}

      <main className="reader-panel">
        <header className="reader-header">
          <div className="header-actions">
            <button type="button" className="icon-button mobile-only" title="فتح القائمة" aria-label="فتح القائمة" onClick={() => setDrawerOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <p className="eyebrow">تصفح مباشر للمحتوى</p>
              <h2>{selectedDoc?.title ?? 'اختر ملفًا للقراءة'}</h2>
            </div>
          </div>

          <div className="cta-row">
            {installPrompt ? (
              <button type="button" className="install-button" onClick={handleInstall}>
                <Download size={18} />
                تثبيت على الهاتف
              </button>
            ) : null}
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <p className="eyebrow">أفضل خيار لأندرويد</p>
            <h3>تطبيق PWA موبايل-أول يفتح الكتاب كاملًا من مكان واحد</h3>
            <p>
              تصفح الفهرس، افتح أي ملف فورًا، وثبّت التطبيق على شاشة هاتفك الرئيسية لتدرس في أي مكان ووقت.
            </p>
          </div>
          <div className="hero-badges">
            <span><BookOpen size={16} /> قراءة Markdown مباشرة</span>
            <span><FolderTree size={16} /> تصفح حسب المجلدات</span>
            <span><Sparkles size={16} /> جاهز للتثبيت والعمل دون تعقيد</span>
          </div>
        </section>

        <section className="doc-meta">
          <span>{selectedDoc?.pathLabel || 'المجلد الجذر'}</span>
          <span>{manifest ? `آخر تحديث: ${new Date(manifest.generatedAt).toLocaleDateString('ar')}` : ''}</span>
        </section>

        <article className="markdown-card">
          {!selectedDoc ? <p className="muted">اختر ملفًا من القائمة لبدء القراءة.</p> : null}
          {selectedDoc && !content ? <p className="muted">جار تحميل الملف...</p> : null}
          {content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href = '', children, ...props }) => {
                  const internalPath = decodeInternalPath(href)

                  if (internalPath && allDocs.some((doc) => doc.relativePath === internalPath)) {
                    return (
                      <a
                        {...props}
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          handleSelectDoc(internalPath)
                        }}
                      >
                        {children}
                      </a>
                    )
                  }

                  return (
                    <a {...props} href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
          ) : null}
        </article>
      </main>
    </div>
  )
}

export default App
