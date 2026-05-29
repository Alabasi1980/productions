import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, CircleDot, XCircle } from 'lucide-react'
import type { Question } from '../../engine/types'
import type { SelfGrade } from './types'

type Props = {
  question: Question
  index: number
  total: number
  resolveLessonTitle?: (lessonId: string) => string | null
  onGrade: (userAnswer: string, grade: SelfGrade) => void
  onOpenLesson?: (lessonId: string) => void
}

const SECTION_LABELS: Record<string, string> = {
  concept: 'سؤال مفاهيمي',
  terminology: 'مصطلح',
  analysis: 'تحليل',
  comparison: 'مقارنة',
  scenario: 'سيناريو تطبيقي',
  general: 'سؤال',
}

const GRADE_BUTTONS: Array<{ value: SelfGrade; label: string; tone: string; icon: typeof CheckCircle2 }> = [
  { value: 'correct', label: 'إجابتي صحيحة', tone: 'correct', icon: CheckCircle2 },
  { value: 'partial', label: 'جزئياً', tone: 'partial', icon: CircleDot },
  { value: 'wrong', label: 'إجابتي خاطئة', tone: 'wrong', icon: XCircle },
]

function isMultipleChoiceQuestion(question: Question): question is Question & {
  type: 'multiple-choice'
  options: string[]
  correctOptionIndex: number
  explanation?: string
} {
  return question.type === 'multiple-choice' && Array.isArray(question.options) && typeof question.correctOptionIndex === 'number'
}

function isTrueFalseQuestion(question: Question): question is Question & {
  type: 'true-false'
  correctBoolean: boolean
  explanation?: string
} {
  return question.type === 'true-false' && typeof question.correctBoolean === 'boolean'
}

export function QuizQuestion({ question, index, total, resolveLessonTitle, onGrade, onOpenLesson }: Props) {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [objectiveAnswer, setObjectiveAnswer] = useState<string | null>(null)
  const [objectiveGrade, setObjectiveGrade] = useState<SelfGrade | null>(null)

  useEffect(() => {
    setAnswer('')
    setRevealed(false)
    setObjectiveAnswer(null)
    setObjectiveGrade(null)
  }, [question.id])

  const sectionType = typeof question.sectionType === 'string' ? question.sectionType : 'general'
  const lessonId = typeof question.lessonId === 'string' ? question.lessonId : undefined
  const lessonTitle = lessonId ? resolveLessonTitle?.(lessonId) ?? null : null

  const term = typeof question.term === 'string' ? question.term : undefined
  const explanation = typeof question.explanation === 'string' ? question.explanation : null

  function revealObjective(userAnswer: string, grade: SelfGrade) {
    setObjectiveAnswer(userAnswer)
    setObjectiveGrade(grade)
    setRevealed(true)
  }

  if (isMultipleChoiceQuestion(question)) {
    return (
      <div className="quiz-question" dir="rtl">
        <header className="quiz-question__head">
          <span className="quiz-question__pos">{index + 1} / {total}</span>
          <span className="quiz-question__tag">اختيار من متعدد</span>
        </header>

        <h3 className="quiz-question__text">{question.text}</h3>

        <div className="quiz-question__choices">
          {question.options.map((option, optionIndex) => {
            const isSelected = objectiveAnswer === option
            const isCorrect = question.correctOptionIndex === optionIndex
            return (
              <button
                key={`${question.id}-${optionIndex}`}
                type="button"
                className={[
                  'quiz-choice',
                  isSelected ? 'quiz-choice--selected' : '',
                  revealed && isCorrect ? 'quiz-choice--correct' : '',
                  revealed && isSelected && !isCorrect ? 'quiz-choice--wrong' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => revealObjective(option, isCorrect ? 'correct' : 'wrong')}
                disabled={revealed}
              >
                {option}
              </button>
            )
          })}
        </div>

        {revealed ? (
          <div className="quiz-question__feedback">
            {lessonTitle ? (
              <p className="quiz-question__reference">
                راجع المرجع في:&nbsp;
                <button
                  type="button"
                  className="quiz-question__lesson-link"
                  onClick={() => lessonId && onOpenLesson?.(lessonId)}
                >
                  {lessonTitle}
                </button>
              </p>
            ) : null}

            {explanation ? <p className="quiz-question__explanation">{explanation}</p> : null}

            <div className="quiz-question__actions">
              <button
                type="button"
                className="quiz-action quiz-action--primary"
                onClick={() => onGrade(objectiveAnswer ?? '', objectiveGrade ?? 'wrong')}
              >
                التالي
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (isTrueFalseQuestion(question)) {
    return (
      <div className="quiz-question" dir="rtl">
        <header className="quiz-question__head">
          <span className="quiz-question__pos">{index + 1} / {total}</span>
          <span className="quiz-question__tag">صح أم خطأ</span>
        </header>

        <h3 className="quiz-question__text">{question.text}</h3>

        <div className="quiz-question__choices quiz-question__choices--binary">
          {[
            { label: 'صح', value: true },
            { label: 'خطأ', value: false },
          ].map((choice) => {
            const isSelected = objectiveAnswer === choice.label
            const isCorrect = question.correctBoolean === choice.value
            return (
              <button
                key={`${question.id}-${choice.label}`}
                type="button"
                className={[
                  'quiz-choice',
                  isSelected ? 'quiz-choice--selected' : '',
                  revealed && isCorrect ? 'quiz-choice--correct' : '',
                  revealed && isSelected && !isCorrect ? 'quiz-choice--wrong' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => revealObjective(choice.label, isCorrect ? 'correct' : 'wrong')}
                disabled={revealed}
              >
                {choice.label}
              </button>
            )
          })}
        </div>

        {revealed ? (
          <div className="quiz-question__feedback">
            {lessonTitle ? (
              <p className="quiz-question__reference">
                راجع المرجع في:&nbsp;
                <button
                  type="button"
                  className="quiz-question__lesson-link"
                  onClick={() => lessonId && onOpenLesson?.(lessonId)}
                >
                  {lessonTitle}
                </button>
              </p>
            ) : null}

            {explanation ? <p className="quiz-question__explanation">{explanation}</p> : null}

            <div className="quiz-question__actions">
              <button
                type="button"
                className="quiz-action quiz-action--primary"
                onClick={() => onGrade(objectiveAnswer ?? '', objectiveGrade ?? 'wrong')}
              >
                التالي
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="quiz-question" dir="rtl">
      <header className="quiz-question__head">
        <span className="quiz-question__pos">{index + 1} / {total}</span>
        <span className="quiz-question__tag">{SECTION_LABELS[sectionType] ?? sectionType}</span>
      </header>

      <h3 className="quiz-question__text">
        {term ? <span className="quiz-question__term">{term}</span> : question.text}
      </h3>

      {term ? <p className="quiz-question__instruction">اشرح المصطلح أعلاه بإيجاز.</p> : null}

      <textarea
        className="quiz-question__answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="اكتب إجابتك بكلماتك..."
        rows={4}
      />

      {!revealed ? (
        <div className="quiz-question__actions">
          <button
            type="button"
            className="quiz-action quiz-action--reveal"
            onClick={() => setRevealed(true)}
            disabled={answer.trim().length === 0}
          >
            <BookOpen size={14} /> أظهر المرجع وقيّم نفسي
          </button>
        </div>
      ) : (
        <div className="quiz-question__feedback">
          {lessonTitle ? (
            <p className="quiz-question__reference">
              راجع الإجابة في:&nbsp;
              <button
                type="button"
                className="quiz-question__lesson-link"
                onClick={() => lessonId && onOpenLesson?.(lessonId)}
              >
                {lessonTitle}
              </button>
            </p>
          ) : (
            <p className="quiz-question__reference">قارن إجابتك بمحتوى الدرس المرتبط.</p>
          )}

          <p className="quiz-question__self-prompt">قيّم إجابتك بنفسك:</p>
          <div className="quiz-question__grades">
            {GRADE_BUTTONS.map((button) => {
              const Icon = button.icon
              return (
                <button
                  key={button.value}
                  type="button"
                  className={`quiz-grade quiz-grade--${button.tone}`}
                  onClick={() => onGrade(answer, button.value)}
                >
                  <Icon size={16} />
                  {button.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
