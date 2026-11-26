// Quiz topic pages (/quiz/topics/<slug>): the question bank grouped into the topics people search for.
import type { QuizQuestion } from './types'

export type QuizTopic = { slug: string; name: string; title: string; description: string; intro: string; topics: string[] }

export const QUIZ_TOPICS: QuizTopic[] = [
  { slug: 'bible', name: 'Bible', title: 'Catholic Bible Quiz: Questions and Answers', description: 'Bible quiz questions with answers, on the Old and New Testaments: creation, Moses, the prophets, the Gospels, the parables, the apostles and St Paul.', intro: 'Test your knowledge of Sacred Scripture, from Genesis to the Acts of the Apostles. Each answer comes with a short explanation and its Bible reference.',
    topics: ['Bible', 'Bible verses', 'Creation', 'Noah', 'Abraham', 'Jacob', 'Moses', 'David', 'Solomon', 'Elijah', 'Prophets', 'Gospels', 'Parables', 'Miracles', 'Nativity', 'Passion', 'Resurrection', 'John the Baptist', 'Apostles', 'Saint Paul', 'Cain and Abel', 'Joseph', 'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings', 'Esther', 'Tobit', 'Job', 'Maccabees', 'Childhood of Jesus', 'Baptism of Jesus', 'Ministry of Jesus', 'Sermon on the Mount', 'Transfiguration', 'Ascension', 'Revelation'] },
  { slug: 'saints', name: 'Saints and Popes', title: 'Catholic Saints Quiz: Questions and Answers', description: 'Quiz questions with answers about the saints, martyrs, Doctors of the Church and the popes, with explanations and sources.', intro: 'How well do you know the friends of God? Questions on the lives of the saints, the martyrs, the Doctors of the Church and the popes.',
    topics: ['Saints', 'Popes'] },
  { slug: 'mary', name: 'Our Lady', title: 'Quiz on the Blessed Virgin Mary: Questions and Answers', description: 'Quiz questions with answers about the Virgin Mary: her life in Scripture, the Marian dogmas, her feasts, titles and approved apparitions.', intro: 'Questions on Mary, Mother of God: her life in the Gospels, the four Marian dogmas, her feasts and titles, and her approved apparitions.',
    topics: ['Mary', 'Mary in Scripture', 'Annunciation'] },
  { slug: 'mass-and-sacraments', name: 'Mass and Sacraments', title: 'Catholic Mass and Sacraments Quiz: Questions and Answers', description: 'Quiz questions with answers on the Holy Mass, the Eucharist and the seven sacraments, with explanations from the Catechism.', intro: 'Questions on the Mass, the Eucharist, Confession and all seven sacraments, with answers drawn from the Catechism of the Catholic Church.',
    topics: ['Mass', 'Eucharist', 'Sacraments', 'Penance', 'Liturgy', 'Baptism', 'Confirmation', 'Anointing', 'Holy Orders', 'Marriage', 'Sacramentals'] },
  { slug: 'feasts-prayers-and-customs', name: 'Feasts, Prayers and Customs', title: 'Catholic Feasts, Prayers and Customs Quiz', description: 'Quiz questions with answers on the Church’s feasts and seasons, Advent, Lent, Holy Week, traditional prayers and Catholic customs.', intro: 'Questions on the liturgical year, from Advent to Pentecost, the great feasts, traditional prayers and the customs Catholics keep.',
    topics: ['Feasts', 'Liturgical year', 'Holy Week', 'Pentecost', 'Prayer', 'Customs'] },
  { slug: 'church-history', name: 'Church History', title: 'Catholic Church History Quiz: Questions and Answers', description: 'Church history quiz questions with answers: the early Church, the councils, missionaries, and the Church in Africa and around the world.', intro: 'From the Apostles to the present day: questions on the councils, the great missionaries and the growth of the Church across the world.',
    topics: ['Church History', 'Church', 'Early Church'] },
  { slug: 'catholic-teaching', name: 'Catholic Teaching', title: 'Catholic Faith Quiz: Teaching, the Creed and Morality', description: 'Catholic faith quiz questions with answers on the Creed, the Catechism, angels, morality and the teaching of the Church.', intro: 'Questions on what the Church believes and teaches: the Creed, the Catechism, angels and the moral life.',
    topics: ['Teaching', 'Creed', 'Morality', 'Angels', 'Trinity', 'Holy Spirit', 'Virtues', 'Last Things'] },
]

const bySlug = new Map(QUIZ_TOPICS.map((t) => [t.slug, t]))
const byTopic = new Map(QUIZ_TOPICS.flatMap((t) => t.topics.map((x) => [x.toLowerCase(), t.slug] as const)))

/** The topic page a question belongs to (anything new goes to Catholic Teaching). */
export const topicOf = (q: Pick<QuizQuestion, 'topic'>) => byTopic.get(q.topic.trim().toLowerCase()) ?? 'catholic-teaching'
export const quizTopic = (slug: string) => bySlug.get(slug) ?? null
export const QUIZ_PER_PAGE = 50
