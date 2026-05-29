import type { ContentManifest, ContentNode, ContentFileNode, DomainConfig, InterviewBankBundle } from './types'

// Stateless helpers for navigating the content tree.
// No caching here — the loader is called once at app boot.

export async function loadContentManifest(url = '/content-index.json'): Promise<ContentManifest> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load content manifest: ${response.status}`)
  }
  return (await response.json()) as ContentManifest
}

export async function loadDomainConfig(url = '/data/domain-config.json'): Promise<DomainConfig> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load domain config: ${response.status}`)
  }
  return (await response.json()) as DomainConfig
}

export async function loadMarkdownContent(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load markdown content: ${response.status}`)
  }
  return response.text()
}

export async function loadInterviewBank(url = '/data/interview-bank.json'): Promise<InterviewBankBundle> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load interview bank: ${response.status}`)
  }
  return (await response.json()) as InterviewBankBundle
}

export function isFile(node: ContentNode): node is ContentFileNode {
  return node.type === 'file'
}

export function flattenFiles(node: ContentNode): ContentFileNode[] {
  if (isFile(node)) return [node]
  const children = node.children ?? []
  return children.flatMap((child) => flattenFiles(child))
}

export function findFileById(node: ContentNode, id: string): ContentFileNode | null {
  if (isFile(node)) return node.id === id ? node : null
  for (const child of node.children ?? []) {
    const found = findFileById(child, id)
    if (found) return found
  }
  return null
}

export function findFileByPath(node: ContentNode, relativePath: string): ContentFileNode | null {
  if (isFile(node)) return node.relativePath === relativePath ? node : null
  for (const child of node.children ?? []) {
    const found = findFileByPath(child, relativePath)
    if (found) return found
  }
  return null
}
