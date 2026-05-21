import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const sourceRoot = path.resolve(projectRoot, '..', '00_مسار الدراسة المهنية')
const publicRoot = path.join(projectRoot, 'public')
const contentRoot = path.join(publicRoot, 'content')
const manifestPath = path.join(publicRoot, 'content-index.json')

const numberPrefixPattern = /^(\d+)_/

function stripNumberPrefix(value) {
  return value.replace(numberPrefixPattern, '')
}

function formatTitle(name) {
  return stripNumberPrefix(name.replace(/\.md$/i, '')).replace(/_/g, ' ').trim()
}

function splitForSort(name) {
  const match = name.match(numberPrefixPattern)
  return {
    index: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER,
    label: name,
  }
}

function compareNames(left, right) {
  const leftMeta = splitForSort(left)
  const rightMeta = splitForSort(right)

  if (leftMeta.index !== rightMeta.index) {
    return leftMeta.index - rightMeta.index
  }

  return leftMeta.label.localeCompare(rightMeta.label, 'ar')
}

function toUrlPath(relativePath) {
  return relativePath.split('/').map(encodeURIComponent).join('/')
}

async function buildNode(absolutePath, relativePath = '') {
  const stats = await fs.stat(absolutePath)
  const name = path.basename(absolutePath)

  if (stats.isDirectory()) {
    const entries = (await fs.readdir(absolutePath)).filter((entry) => !entry.startsWith('.')).sort(compareNames)
    const children = []

    for (const entry of entries) {
      const childAbsolutePath = path.join(absolutePath, entry)
      const childRelativePath = relativePath ? `${relativePath}/${entry}` : entry
      const childNode = await buildNode(childAbsolutePath, childRelativePath)

      if (childNode) {
        children.push(childNode)
      }
    }

    return {
      type: 'directory',
      name,
      title: formatTitle(name),
      relativePath,
      children,
    }
  }

  if (path.extname(name).toLowerCase() !== '.md') {
    return null
  }

  return {
    type: 'file',
    name,
    title: formatTitle(name),
    relativePath,
    url: `/content/${toUrlPath(relativePath)}`,
  }
}

async function main() {
  await fs.mkdir(publicRoot, { recursive: true })
  await fs.rm(contentRoot, { recursive: true, force: true })

  await fs.cp(sourceRoot, contentRoot, {
    recursive: true,
    filter: (source) => {
      const stats = source === sourceRoot ? null : null
      const extension = path.extname(source).toLowerCase()
      return extension === '' || extension === '.md'
    },
  })

  const manifest = await buildNode(sourceRoot)

  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        root: manifest,
      },
      null,
      2,
    ),
    'utf8',
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
