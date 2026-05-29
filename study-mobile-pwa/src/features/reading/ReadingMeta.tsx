import { Clock, Layers, FileText } from 'lucide-react'
import type { ContentFileNode } from '../../engine/types'

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'متقدم',
  high: 'متقدم',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  lesson: 'درس',
  test: 'اختبار',
  glossary: 'قاموس',
  reference: 'مرجع',
  exercise: 'تمرين',
  tool: 'أداة تشغيلية',
  intro: 'مدخل',
  meta: 'ملف تنظيمي',
  guide: 'دليل',
  'study-path': 'مسار دراسة',
  'test-resource': 'مرجع اختبار',
  index: 'فهرس',
  document: 'وثيقة',
}

export function ReadingMeta({ doc }: { doc: ContentFileNode }) {
  const difficulty = DIFFICULTY_LABELS[doc.difficulty] ?? doc.difficulty
  const docTypeLabel = DOC_TYPE_LABELS[doc.docType] ?? doc.docType

  return (
    <div className="reading-meta" dir="rtl">
      <span className="reading-meta__pill reading-meta__pill--type">{docTypeLabel}</span>
      <span className="reading-meta__pill"><Clock size={14} /> {doc.estReadMin} دقيقة قراءة</span>
      <span className="reading-meta__pill"><FileText size={14} /> {doc.wordCount.toLocaleString('ar-EG')} كلمة</span>
      {difficulty ? <span className="reading-meta__pill"><Layers size={14} /> {difficulty}</span> : null}
    </div>
  )
}
