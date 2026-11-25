# Builds supabase/migrations/0037_long_devotions.sql: five longer devotions, saved as drafts for review.
# Prayers marked "Catholic My Pride" are original. Traditional prayers used in full are only short, standard ones
# (Our Father, Hail Mary, Glory Be, Memorare, Hail Holy Queen). Longer traditional texts are linked to trusted sources.
import json, pathlib

OUR_FATHER = "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen."
HAIL_MARY = "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."
GLORY_BE = "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen."
MEMORARE = "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen."
HAIL_HOLY_QUEEN = "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nV. Pray for us, O holy Mother of God.\nR. That we may be made worthy of the promises of Christ."

def day_md(scripture, reflection, intention, prayer, extra=""):
    parts = []
    if scripture: parts.append(f"**Read:** {scripture}")
    if reflection: parts.append(reflection)
    if extra: parts.append(extra)
    if intention: parts.append(f"**Today’s intention:** {intention}")
    parts.append(f"**Prayer**\n\n{prayer}")
    return "\n\n".join(parts)

novenas = []

# ---------------------------------------------------------------- 1. Total Consecration (33 days, ends 1 January)
periods = [
  (range(1, 13), "Emptying ourselves of the spirit of the world", "Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be"),
  (range(13, 20), "Knowledge of self", "Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella"),
  (range(20, 27), "Knowledge of the Blessed Virgin Mary", "Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary"),
  (range(27, 34), "Knowledge of Jesus Christ", "Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary"),
]
consec = [
  ("Blessed are the poor in spirit", "Matthew 5:1–12", "Jesus begins the Sermon on the Mount by calling blessed those the world overlooks. The first step of this consecration is to ask which voices shape our hearts: the world’s, or the Gospel’s.", "A heart free from the spirit of the world"),
  ("Salt of the earth, light of the world", "Matthew 5:13–19", "We are called to give flavour and light, not to blend in. A Christian who takes on the spirit of the world loses his saltiness.", "Courage to live the faith openly"),
  ("Seek first the kingdom", "Matthew 6:19–34", "Where our treasure is, there our heart is. Jesus invites us to trust the Father with our needs and to put God first.", "Freedom from worry and greed"),
  ("The narrow gate", "Matthew 7:1–14", "The way to life is narrow, and few find it. The world offers the wide road; Jesus offers Himself.", "Perseverance on the narrow way"),
  ("Built on rock", "Matthew 7:15–29", "Hearing the Word is not enough; we must do it. A life built on Christ stands when the storms come.", "A faith that acts"),
  ("The world hates Me first", "John 15:18–27", "Jesus warned that His disciples would not be at home in the world. Do not be surprised when the Gospel goes against the current.", "Strength for Christians who suffer for their faith"),
  ("Not of the world", "John 17:9–19", "At the Last Supper, Jesus prayed that we would be in the world but not of it, kept safe from the evil one.", "Holiness in our daily work"),
  ("Do not love the world", "1 John 2:15–17", "The world, with its desires, is passing away. Whoever does the will of God remains for ever.", "Detachment from what passes away"),
  ("Do not be conformed", "Romans 12:1–2", "Offer your bodies as a living sacrifice and be transformed by the renewal of your mind. Consecration is exactly this offering.", "A renewed mind and heart"),
  ("Friendship with the world", "James 4:1–10", "Draw near to God, and He will draw near to you. Humble yourselves before the Lord, and He will lift you up.", "Humility and a clean heart"),
  ("What profits a man?", "Mark 8:34–38", "What does it profit to gain the whole world and lose one’s soul? To follow Jesus is to take up the cross daily.", "Souls in danger of being lost"),
  ("Treasure in heaven", "Luke 12:13–34", "The rich fool planned for barns, not for eternity. Today we ask Mary to help us store up treasure where it lasts.", "Generosity to the poor"),
  ("Know yourself in God’s light", "Luke 18:9–14", "The Pharisee praised himself; the tax collector beat his breast. Knowledge of self begins with honesty before God.", "An honest examination of conscience"),
  ("The vine and the branches", "John 15:1–8", "Without Jesus we can do nothing. To know ourselves is to know how much we need Him.", "Dependence on Christ"),
  ("Repent and believe", "Mark 1:14–15", "Conversion is not a single moment but a daily turning back to God. Today, name one habit to bring to the Lord.", "A good confession"),
  ("The prodigal son", "Luke 15:11–32", "However far we have wandered, the Father runs to meet us. Self-knowledge leads not to despair but to the Father’s arms.", "Those far from the Church"),
  ("Wash me, O Lord", "Psalm 50 (51)", "David’s great psalm of repentance gives us words when ours fail: a contrite and humble heart, O God, You will not despise.", "Healing from past sins"),
  ("Pride and humility", "Philippians 2:1–11", "Christ emptied Himself, taking the form of a servant. We are invited to the same mind and the same humility.", "Freedom from pride"),
  ("Without Me you can do nothing", "John 15:4–5", "This first week of preparation ends where it began: on our need for grace. Mary will teach us how to receive it.", "Trust in God’s grace"),
  ("Hail, full of grace", "Luke 1:26–38", "God chose Mary and asked her consent. Her “be it done unto me” is the pattern of every consecration.", "A generous “yes” to God"),
  ("The Visitation", "Luke 1:39–56", "Mary hurried to serve Elizabeth and sang the Magnificat. Where Mary goes, Jesus brings joy.", "Mothers and expectant mothers"),
  ("Mary at Bethlehem", "Luke 2:1–20", "Mary gave the world its Saviour in poverty and kept all these things in her heart. She teaches us to treasure God’s work.", "Families who lack a home"),
  ("Mary at Cana", "John 2:1–11", "“Whatsoever he shall say to you, do ye.” Mary’s last recorded words point us to her Son.", "Married couples"),
  ("Mary at the foot of the Cross", "John 19:25–27", "From the Cross, Jesus gave us His Mother. To consecrate ourselves to her is to take her into our home, as St John did.", "All who are suffering"),
  ("Mary in the Upper Room", "Acts 1:12–14", "Mary prayed with the apostles as they waited for the Holy Spirit. She is Mother of the Church.", "The Pope, bishops and priests"),
  ("The woman clothed with the sun", "Apocalypse 12:1–6", "The Church sees Mary in the great sign of the woman crowned with twelve stars. She is our Queen and our Mother.", "Victory over evil in our lives"),
  ("The Word was made flesh", "John 1:1–14", "We now turn our gaze fully to Jesus, the eternal Word who became one of us. Mary leads us straight to Him.", "Growth in love for Jesus"),
  ("I am the Way, the Truth and the Life", "John 14:1–14", "No one comes to the Father except through Jesus. True devotion to Mary is always a road to Christ.", "Those searching for truth"),
  ("I am the Good Shepherd", "John 10:1–18", "Jesus knows His sheep by name and lays down His life for them.", "Vocations to the priesthood"),
  ("I am the Bread of Life", "John 6:35–51", "Jesus gives us Himself in the Eucharist. Prepare to receive Him at Mass on your consecration day.", "Reverence for the Blessed Sacrament"),
  ("The Passion of the Lord", "John 19:16–30", "Jesus loved us to the end. Consecration means belonging to Him who gave everything for us.", "Gratitude for our redemption"),
  ("He is risen", "John 20:1–18", "Mary Magdalene met the risen Lord in the garden. Our consecration is a share in His new life.", "Hope for the dying"),
  ("Tomorrow, the gift of ourselves", "John 2:1–5 and Luke 1:38", "Tomorrow, on the Solemnity of Mary, Mother of God, make your Act of Consecration. Go to Confession in these days, and receive Holy Communion tomorrow.", "Final preparation for consecration"),
]
assert len(consec) == 33
cdays = []
for i, (title, ref, refl, intention) in enumerate(consec, start=1):
    period = next(p for p in periods if i in p[0])
    extra = f"*Part {periods.index(period) + 1}: {period[1]}.* Prayers for these days: {period[2]}."
    prayer = f"Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: {intention.lower()}. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*"
    cdays.append((i, title, day_md(ref, refl, intention, prayer, extra)))
novenas.append(dict(
  slug="total-consecration-to-jesus-through-mary", title="Total Consecration to Jesus through Mary (33 Days)",
  feast_name="Mary, Mother of God (Consecration Day)", feast_date="2027-01-01", days_count=33, weekly_on=None,
  repeat_prayer=None, repeat_count=None,
  intro=f"""**33 days of preparation, then the gift of yourself to Jesus through Mary**

The Total Consecration to Jesus through Mary is the 33-day preparation taught by **St Louis-Marie de Montfort** (1673–1716) in his book *True Devotion to Mary*. It is made in four parts: twelve days to empty ourselves of the spirit of the world, then a week each on knowledge of self, knowledge of Mary and knowledge of Jesus. On the 34th day you make your Act of Consecration, go to Confession in the days before, and receive Holy Communion.

We pray it together so that the consecration falls on **1 January, the Solemnity of Mary, Mother of God**: Day 1 is **29 November**, the First Sunday of Advent. You can also make it at any time of year, ending on another feast of Our Lady (2 February, 25 March, 13 May, 15 August, 8 December).

**How to pray each day**

1. Begin with the Sign of the Cross and the prayers for that part (named under each day).
2. Read the day’s Scripture passage and reflection.
3. Pray the day’s prayer and add your own intentions.

The full texts of the traditional prayers (Veni Creator, Ave Maris Stella, the litanies, St Louis de Montfort’s prayers and the Act of Consecration) are in the free booklet *[33 Day Preparation for Consecration to Jesus through Mary](https://legionofmary.ie/images/uploads/files/33_Day_Preparation_for_Consecration_to_Jesus_through_Mary.pdf)* from the Legion of Mary. To go deeper, read St Louis de Montfort’s *True Devotion to Mary* alongside these days.

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page.""",
  common=f"**Close each day**\n\n{HAIL_MARY}\n\n{GLORY_BE}\n\n*O Jesus, living in Mary, come and live in Thy servants. (St Louis de Montfort, traditional)*",
  seo_title="33-Day Total Consecration to Jesus through Mary",
  seo_description="Pray St Louis de Montfort’s 33-day preparation with Catholic My Pride and consecrate yourself to Jesus through Mary on 1 January, Mary, Mother of God.",
  days=cdays))

# ---------------------------------------------------------------- 2. 54-Day Rosary Novena (ends 7 October)
MYST = {
  "Joyful": [("The Annunciation", "Luke 1:26–38", "humility"), ("The Visitation", "Luke 1:39–56", "love of neighbour"), ("The Nativity", "Luke 2:1–20", "poverty of spirit"), ("The Presentation in the Temple", "Luke 2:22–38", "obedience"), ("The Finding of Jesus in the Temple", "Luke 2:41–52", "joy in finding Jesus")],
  "Sorrowful": [("The Agony in the Garden", "Matthew 26:36–46", "sorrow for sin"), ("The Scourging at the Pillar", "John 19:1", "purity"), ("The Crowning with Thorns", "Matthew 27:27–31", "courage"), ("The Carrying of the Cross", "John 19:17", "patience"), ("The Crucifixion", "Luke 23:33–46", "perseverance")],
  "Glorious": [("The Resurrection", "Matthew 28:1–10", "faith"), ("The Ascension", "Acts 1:6–11", "hope"), ("The Descent of the Holy Spirit", "Acts 2:1–13", "love of God"), ("The Assumption of Mary", "Apocalypse 12:1", "a happy death"), ("The Coronation of Mary", "Apocalypse 12:1", "trust in Mary")],
  "Luminous": [("The Baptism of the Lord", "Matthew 3:13–17", "openness to the Holy Spirit"), ("The Wedding at Cana", "John 2:1–11", "trust in Mary’s intercession"), ("The Proclamation of the Kingdom", "Mark 1:14–15", "conversion"), ("The Transfiguration", "Matthew 17:1–8", "desire for holiness"), ("The Institution of the Eucharist", "Matthew 26:26–28", "love of the Eucharist")],
}
order = ["Joyful", "Sorrowful", "Glorious", "Luminous"]
rdays = []
for d in range(1, 55):
    kind = order[(d - 1) % 4]
    phase = "petition" if d <= 27 else "thanksgiving"
    lines = "\n".join(f"{k + 1}. **{t}** ({r}) · fruit: {f}" for k, (t, r, f) in enumerate(MYST[kind]))
    if phase == "petition":
        title = f"Petition · {kind} Mysteries"
        prayer = f"Holy Mary, Queen of the Most Holy Rosary, I offer you these {kind.lower()} mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*"
    else:
        title = f"Thanksgiving · {kind} Mysteries"
        prayer = f"Holy Mary, Queen of the Most Holy Rosary, I offer you these {kind.lower()} mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*"
    extra = f"**Today’s mysteries: the {kind} Mysteries**\n\n{lines}"
    note = "Days 1–27 are prayed in petition." if phase == "petition" else ("Today the thanksgiving part begins: thank Our Lady whether or not your request has been granted." if d == 28 else "Days 28–54 are prayed in thanksgiving.")
    rdays.append((d, title, day_md(None, note, None, prayer, extra)))
novenas.append(dict(
  slug="54-day-rosary-novena", title="54-Day Rosary Novena",
  feast_name="Our Lady of the Rosary", feast_date="2026-10-07", days_count=54, weekly_on=None,
  repeat_prayer=HAIL_MARY, repeat_count=50,
  intro="""**Six novenas of the Rosary: 27 days of petition and 27 days of thanksgiving**

The 54-Day Rosary Novena is six nine-day Rosary novenas prayed one after another: three in petition and three in thanksgiving, whether or not the request has been granted. It comes from Naples, where, according to tradition, Our Lady of the Rosary appeared on 3 March 1884 to **Fortuna Agrelli**, a young woman gravely ill for thirteen months, and asked her to pray this way. She was healed. ([University of Dayton, Marian Library](https://udayton.edu/imri/mary/f/fifty-four-day-rosary-novena.php) · [The Catholic Company](https://www.catholiccompany.com/getfed/what-is-a-54-day-rosary-novena))

We pray it together so that it ends on **7 October, Our Lady of the Rosary**, but it can be started on any day of the year.

**How to pray each day**

1. Begin with the Sign of the Cross and say the day’s offering prayer.
2. Pray five decades of the Rosary on the day’s mysteries (they follow each other: Joyful, Sorrowful, Glorious, Luminous). The tap counter below helps you keep count of the fifty Hail Marys.
3. Close with the Hail Holy Queen.

New to the Rosary? See our [Holy Rosary](/rosary) page.""",
  common=f"**Close each day: Hail, Holy Queen**\n\n{HAIL_HOLY_QUEEN}",
  seo_title="54-Day Rosary Novena: How to Pray It, Day by Day",
  seo_description="Pray the 54-Day Rosary Novena with Catholic My Pride: 27 days of petition and 27 of thanksgiving, with the day’s mysteries, a Hail Mary counter and prayers.",
  days=rdays))

# ---------------------------------------------------------------- 3. Thirty Days' Prayer to St Joseph (ends 18 March)
titles = [
  ("Renowned offspring of David", "Matthew 1:1–16", "Jesus is called Son of David through Joseph, the heir of the royal line."),
  ("Light of Patriarchs", "Genesis 37:1–11 and Matthew 1:18–21", "Like Joseph of old, St Joseph received God’s guidance in dreams and saved his family."),
  ("Spouse of the Mother of God", "Matthew 1:18–25", "God entrusted the Virgin Mary to Joseph as his wife."),
  ("Guardian of the Redeemer", "Matthew 2:13–15", "Joseph protected the Child Jesus from Herod. Pope Francis added this title to the Litany in 2021."),
  ("Chaste guardian of the Virgin", "Luke 1:26–27", "Joseph loved Mary with a pure and faithful love."),
  ("Foster father of the Son of God", "Luke 2:41–51", "Jesus was subject to Joseph and Mary in Nazareth."),
  ("Diligent protector of Christ", "Matthew 2:19–23", "Joseph rose at night and acted without delay whenever God asked."),
  ("Servant of Christ", "Matthew 1:24", "Joseph did as the angel commanded him. He served Jesus with his whole life."),
  ("Minister of salvation", "Luke 2:4–7", "Through his care, Joseph cooperated in God’s plan to save the world."),
  ("Head of the Holy Family", "Luke 2:39–40", "Joseph led his family with gentleness and faith."),
  ("Joseph most just", "Matthew 1:19", "Scripture calls Joseph a just man: righteous before God."),
  ("Joseph most chaste", "Matthew 1:24–25", "Joseph’s purity made him a worthy guardian of the Holy Family."),
  ("Joseph most prudent", "Matthew 2:22–23", "Joseph listened, weighed and chose wisely where to settle his family."),
  ("Joseph most strong", "Matthew 2:13–14", "Joseph carried his family through danger into exile."),
  ("Joseph most obedient", "Matthew 1:24", "When Joseph awoke, he did as the angel of the Lord had told him."),
  ("Joseph most faithful", "Luke 2:41–42", "Year after year, Joseph brought his family to Jerusalem for the Passover."),
  ("Mirror of patience", "Luke 2:6–7", "When there was no room at the inn, Joseph trusted and made a home of a stable."),
  ("Lover of poverty", "Luke 2:24", "Joseph and Mary offered the gift of the poor: a pair of turtledoves."),
  ("Model of workmen", "Matthew 13:55", "Jesus was known as “the carpenter’s son”."),
  ("Glory of home life", "Luke 2:51–52", "In the quiet home of Nazareth, Jesus grew in wisdom, age and grace."),
  ("Guardian of virgins", "1 Corinthians 7:32–35", "St Joseph protects all who give themselves to God with an undivided heart."),
  ("Pillar of families", "Ephesians 5:21–6:4", "St Joseph holds families together in love and faith."),
  ("Support in difficulties", "Matthew 2:13", "In every trouble, go to Joseph. (Added to the Litany in 2021.)"),
  ("Solace of the wretched", "Matthew 11:28–30", "St Joseph comforts the sorrowful and leads them to Jesus."),
  ("Hope of the sick", "James 5:13–16", "We bring the sick to St Joseph, who cared for Jesus and Mary."),
  ("Patron of exiles", "Matthew 2:14–15", "Joseph knew the life of a refugee in Egypt. (Added in 2021.)"),
  ("Patron of the afflicted", "Psalm 33 (34):19", "The Lord is close to the broken-hearted, and so is St Joseph. (Added in 2021.)"),
  ("Patron of the poor", "Luke 2:7", "Joseph shared the poverty of those who have little. (Added in 2021.)"),
  ("Patron of the dying", "John 11:25–26", "Joseph died in the arms of Jesus and Mary. We ask him for a holy death."),
  ("Protector of Holy Church", "Matthew 16:18", "Blessed Pius IX declared St Joseph Patron of the Universal Church in 1870."),
]
assert len(titles) == 30
jdays = []
for i, (t, ref, refl) in enumerate(titles, start=1):
    prayer = f"St Joseph, {t[0].lower() + t[1:]}, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*"
    jdays.append((i, t, day_md(ref, refl, None, prayer, f"Day {i} of the 30 years Jesus lived with Joseph and Mary.")))
novenas.append(dict(
  slug="thirty-days-prayer-to-saint-joseph", title="Thirty Days’ Prayer to Saint Joseph",
  feast_name="Saint Joseph, Spouse of the Blessed Virgin Mary", feast_date="2027-03-19", days_count=30, weekly_on=None,
  repeat_prayer=None, repeat_count=None,
  intro="""**Thirty days, in honour of the thirty years St Joseph spent with Jesus and Mary**

The Thirty Days’ Prayer to St Joseph is an old devotion for any special intention, prayed in honour of the thirty years St Joseph spent with Jesus and Mary in Nazareth. We pray it together in the thirty days before his feast on **19 March**, but it can be prayed at any time.

Each day we meditate on one of St Joseph’s titles from the **Litany of St Joseph**, including the seven Pope Francis added in 2021.

**How to pray each day**

1. Begin with the Sign of the Cross.
2. Read the day’s Scripture passage and reflection.
3. Pray the traditional Thirty Days’ Prayer to St Joseph, then the day’s prayer, and name your intention.

The full traditional text of the Thirty Days’ Prayer is on [EWTN](https://www.ewtn.com/catholicism/devotions/thirty-days-prayer-to-saint-joseph-399) and [Catholic Culture](https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=1270).

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page.""",
  common=f"**Close each day**\n\n{OUR_FATHER}\n\n{HAIL_MARY}\n\n{GLORY_BE}\n\n*St Joseph, pray for us.*",
  seo_title="Thirty Days’ Prayer to St Joseph: Day by Day",
  seo_description="Pray the Thirty Days’ Prayer to St Joseph with Catholic My Pride, one title of the Litany of St Joseph each day, ending before his feast on 19 March.",
  days=jdays))

# ---------------------------------------------------------------- 4. Seven Sundays of St Joseph
sundays = [
  ("His doubt", "Matthew 1:19", "The message of the angel", "Matthew 1:20", "Joseph’s heart was troubled until God revealed His plan. Bring your own doubts to him today."),
  ("The poverty of Jesus’ birth", "Luke 2:7", "The birth of the Saviour", "Luke 2:10–11", "There was no room at the inn, yet the angels sang. God’s glory shines in poor places."),
  ("The circumcision", "Luke 2:21", "The Holy Name of Jesus", "Matthew 1:21", "Joseph saw the Child’s first blood and gave Him the name above every name."),
  ("The prophecy of Simeon", "Luke 2:34–35", "The salvation of souls", "Luke 2:38", "Joseph heard that a sword would pierce Mary’s soul, and also that this Child would save many."),
  ("The flight into Egypt", "Matthew 2:13–14", "Jesus present among the Egyptians", "Isaias 19:1", "Joseph led his family into exile by night. With Jesus present, even a foreign land was blessed."),
  ("The return from Egypt", "Matthew 2:22", "Life with Jesus and Mary in Nazareth", "Luke 2:39–40", "Fear of Archelaus gave way to the peace of the hidden life in Nazareth."),
  ("The loss of the Child Jesus", "Luke 2:43–45", "Finding Him in the Temple", "Luke 2:46–49", "Three days of anguish ended in joy. When we lose Jesus, St Joseph helps us find Him again."),
]
sdays = []
for i, (sorrow, sref, joy, jref, refl) in enumerate(sundays, start=1):
    extra = f"**Sorrow:** {sorrow} ({sref})\n\n**Joy:** {joy} ({jref})"
    prayer = f"St Joseph, by your sorrow ({sorrow.lower()}) and your joy ({joy[0].lower() + joy[1:]}), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*"
    sdays.append((i, f"{sorrow[0].upper() + sorrow[1:]} · {joy}", day_md(None, refl, None, prayer, extra)))
novenas.append(dict(
  slug="seven-sundays-of-saint-joseph", title="Seven Sundays of Saint Joseph",
  feast_name="Saint Joseph, Spouse of the Blessed Virgin Mary", feast_date="2027-03-19", days_count=7, weekly_on="sunday",
  repeat_prayer=None, repeat_count=None,
  intro="""**Seven Sundays with the sorrows and joys of St Joseph**

A long-standing tradition prepares for the feast of St Joseph on **19 March** by dedicating the **seven Sundays before it** to him, in memory of his seven sorrows and seven joys. Pope Gregory XVI encouraged this custom and attached indulgences to it. ([Opus Dei](https://opusdei.org/en/article/seven-sundays-of-saint-joseph/) · [Catholic News Agency](https://catholicnewsagency.com/resources/185929/seven-sundays-devotion))

The devotion begins on the seventh Sunday before 19 March (the last Sunday of January or the first of February). Each Sunday we meditate on one sorrow and one joy from the Gospels.

**How to pray each Sunday**

1. Begin with the Sign of the Cross.
2. Read the sorrow and the joy in the Gospel passages given.
3. Pray an Our Father, Hail Mary and Glory Be, then the Sunday’s prayer, and name your intention.

It is customary to ask St Joseph for one particular grace through the seven Sundays.""",
  common=f"**Close each Sunday**\n\n{OUR_FATHER}\n\n{HAIL_MARY}\n\n{GLORY_BE}\n\n*St Joseph, pray for us.*",
  seo_title="Seven Sundays of St Joseph: Sorrows and Joys",
  seo_description="Pray the Seven Sundays devotion to St Joseph with Catholic My Pride: one sorrow and one joy each Sunday before his feast on 19 March.",
  days=sdays))

# ---------------------------------------------------------------- 5. Thirteen Tuesdays of St Anthony
fruits = [
  ("Charity", "1 Corinthians 13:1–7", "St Anthony preached the love of God with such fire that crowds closed their shops to hear him."),
  ("Joy", "Philippians 4:4–7", "Christian joy is not the absence of trouble but the presence of the Lord."),
  ("Peace", "John 14:27", "St Anthony made peace between families and cities. Ask him for peace in your home."),
  ("Patience", "James 5:7–11", "The farmer waits for the precious fruit of the earth. God’s timing is never late."),
  ("Long-suffering", "Colossians 3:12–15", "Bear with one another and forgive, as the Lord has forgiven you."),
  ("Kindness", "Ephesians 4:31–32", "St Anthony is remembered for his care of the poor, still honoured today in St Anthony’s Bread."),
  ("Goodness", "Galatians 6:9–10", "Let us not grow weary of doing good, especially to those of the household of faith."),
  ("Meekness", "Matthew 11:29", "Learn of Me, for I am meek and humble of heart, says the Lord."),
  ("Faith", "Hebrews 11:1–6", "St Anthony defended the faith with the Scriptures, and the Church named him a Doctor of the Church."),
  ("Modesty", "1 Peter 3:3–4", "True beauty is the hidden person of the heart."),
  ("Self-control", "1 Corinthians 9:24–27", "Every athlete exercises self-control. St Anthony lived a life of prayer and penance."),
  ("Chastity", "Matthew 5:8", "Blessed are the clean of heart, for they shall see God. St Anthony is often shown holding a lily."),
  ("The fruits of the Spirit ripen", "Galatians 5:22–25", "On this last Tuesday we ask St Anthony that the fruits we prayed for may grow in us for life."),
]
tdays = []
for i, (fruit, ref, refl) in enumerate(fruits, start=1):
    what = "the virtue of " + fruit.lower() if i < 13 else "all the fruits of the Holy Spirit"
    prayer = f"St Anthony, friend of the poor and faithful servant of Jesus, obtain for me {what}. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*"
    tdays.append((i, fruit if i < 13 else "All the fruits of the Holy Spirit", day_md(ref, refl, None, prayer, f"Fruit of the Holy Spirit: **{fruit}**" if i < 13 else None)))
novenas.append(dict(
  slug="thirteen-tuesdays-of-saint-anthony", title="Thirteen Tuesdays of Saint Anthony",
  feast_name="Saint Anthony of Padua", feast_date="2027-06-13", days_count=13, weekly_on="tuesday",
  repeat_prayer=None, repeat_count=None,
  intro="""**Thirteen Tuesdays with St Anthony of Padua**

St Anthony of Padua died on 13 June 1231 and was buried on a Tuesday, a day marked by many miracles. Since then Tuesdays have been special days to honour him, and it is customary to pray to him on **thirteen consecutive Tuesdays**. ([Catholic Culture](https://www.catholicculture.org/culture/liturgicalyear/calendar/day.cfm?date=2018-06-13) · [EWTN](https://www.ewtn.com/pray/the-thirteen-tuesdays-to-saint-anthony))

We pray the thirteen Tuesdays before his feast on **13 June**. Each Tuesday we ask for one of the fruits of the Holy Spirit (Galatians 5:22–23), as in the traditional devotion.

**How to pray each Tuesday**

1. Begin with the Sign of the Cross.
2. Read the Scripture passage and reflection.
3. Pray the Tuesday’s prayer and name your intention, then an Our Father, Hail Mary and Glory Be.

Many people also pray St Bonaventure’s Responsory of St Anthony, *Si quaeris miracula*, and visit a church on Tuesdays during the devotion.""",
  common=f"**Close each Tuesday**\n\n{OUR_FATHER}\n\n{HAIL_MARY}\n\n{GLORY_BE}\n\n*St Anthony, pray for us.*",
  seo_title="Thirteen Tuesdays of St Anthony: Prayers Week by Week",
  seo_description="Pray the Thirteen Tuesdays devotion to St Anthony of Padua with Catholic My Pride, one fruit of the Holy Spirit each Tuesday before his feast on 13 June.",
  days=tdays))

# ---------------------------------------------------------------- SQL
def q(s):
    if s is None: return "null"
    assert "$cmp$" not in s
    return f"$cmp${s}$cmp$"

out = ["""-- 0037: longer devotions. Novenas can now run up to 60 days, or once a week on a chosen weekday
-- (e.g. the Seven Sundays of St Joseph). Adds five devotions as DRAFTS for you to review and publish:
-- Total Consecration (33 days), 54-Day Rosary Novena, Thirty Days' Prayer to St Joseph,
-- Seven Sundays of St Joseph, Thirteen Tuesdays of St Anthony. Safe to run more than once.

alter table public.novenas add column if not exists weekly_on text;
alter table public.novenas drop constraint if exists novenas_weekly_on_check;
alter table public.novenas add constraint novenas_weekly_on_check check (weekly_on is null or weekly_on in ('sunday','monday','tuesday','wednesday','thursday','friday','saturday'));
alter table public.novenas drop constraint if exists novenas_days_count_check;
alter table public.novenas add constraint novenas_days_count_check check (days_count between 1 and 60);
alter table public.novena_days drop constraint if exists novena_days_day_check;
alter table public.novena_days add constraint novena_days_day_check check (day between 0 and 60);
"""]
for n in novenas:
    out.append(f"""-- {n['title']}
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, weekly_on, has_opening, repeats_yearly, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, seo_title, seo_description, status)
values ({q(n['slug'])}, {q(n['title'])}, {q(n['feast_name'])}, '{n['feast_date']}', null, {n['days_count']}, {q(n['weekly_on'])}, false, true,
  {q(n['intro'])},
  {q(n['repeat_prayer'])}, {n['repeat_count'] if n['repeat_count'] else 'null'},
  {q(n['common'])},
  {q(n['seo_title'])}, {q(n['seo_description'])}, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
""" + ",\n".join(f"  ({d}, {q(t)}, {q(b)})" for d, t, b in n['days']) + f"""
) as d(day, title, prayer_md)
where n.slug = {q(n['slug'])}
on conflict (novena_id, day) do nothing;
""")
out.append("notify pgrst, 'reload schema';\n")
path = pathlib.Path(__file__).resolve().parents[2] / "supabase/migrations/0037_long_devotions.sql"
path.write_text("\n".join(out))
print(path, sum(len(n['days']) for n in novenas), "days in", len(novenas), "devotions;", path.stat().st_size // 1024, "KB")
