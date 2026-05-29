export type Rating = 'low' | 'medium' | 'high'

export type LessonStudy = {
  rating?: Rating
  ratedAt?: number
  feynman?: string
  feynmanUpdatedAt?: number
}

export type ReviewItemType = 'lesson' | 'flashcard' | 'question'

export type ReviewItem = {
  sourceId: string
  itemType: ReviewItemType
  dueAt: number
  intervalDays: number
  lastRating?: Rating
  addedAt: number
}

export type LessonsStudyMap = Record<string, LessonStudy>
export type ReviewQueueMap = Record<string, ReviewItem>
