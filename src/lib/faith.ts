import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import { publicClient } from './supabase/public'
import type { Faq, QuizQuestion } from './types'

// Questions & Answers and the Quiz bank. The website uses what is saved in the admin; until anything
// is saved, it uses the starter set in data/faith/ (see "Load the starter questions" in the admin).

type StarterFaq = Omit<Faq, 'id'>
type StarterQuiz = Omit<QuizQuestion, 'id'>
const dir = path.join(process.cwd(), 'data', 'faith')
let starterFaqs: Promise<StarterFaq[]> | null = null
let starterQuiz: Promise<StarterQuiz[]> | null = null
export const loadStarterFaqs = () => (starterFaqs ??= readFile(path.join(dir, 'faqs.json'), 'utf8').then((t) => JSON.parse(t) as StarterFaq[]).catch(() => []))
export const loadStarterQuiz = () => (starterQuiz ??= readFile(path.join(dir, 'quiz.json'), 'utf8').then((t) => JSON.parse(t) as StarterQuiz[]).catch(() => []))

const byTopic = (a: { topic: string; question: string }, b: { topic: string; question: string }) =>
  a.topic.localeCompare(b.topic) || a.question.localeCompare(b.question)

export async function getFaqs(): Promise<Faq[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('faqs')
  const db = publicClient()
  if (db) {
    const { data, error } = await db.from('faqs').select('id, question, slug, topic, answer_md, sources, seo_title, seo_description, updated_at').order('topic').limit(2000)
    if (!error && data && data.length) return (data as Faq[]).sort(byTopic)
  }
  return (await loadStarterFaqs()).map((f) => ({ ...f, id: `starter-${f.slug}` })).sort(byTopic)
}

export async function getFaq(slug: string): Promise<Faq | null> {
  return (await getFaqs()).find((f) => f.slug === slug) ?? null
}

export async function getQuizBank(): Promise<QuizQuestion[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('quiz')
  const db = publicClient()
  if (db) {
    const { data, error } = await db.from('quiz_questions').select('id, question, topic, option_a, option_b, option_c, option_d, correct, explanation, source').limit(5000)
    if (!error && data && data.length) return (data as QuizQuestion[]).sort(byTopic)
  }
  return (await loadStarterQuiz()).map((q, i) => ({ ...q, id: `starter-${i}` })).sort(byTopic)
}
