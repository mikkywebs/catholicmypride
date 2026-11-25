-- 0037: longer devotions. Novenas can now run up to 60 days, or once a week on a chosen weekday
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

-- Total Consecration to Jesus through Mary (33 Days)
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, weekly_on, has_opening, repeats_yearly, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, seo_title, seo_description, status)
values ($cmp$total-consecration-to-jesus-through-mary$cmp$, $cmp$Total Consecration to Jesus through Mary (33 Days)$cmp$, $cmp$Mary, Mother of God (Consecration Day)$cmp$, '2027-01-01', null, 33, null, false, true,
  $cmp$**33 days of preparation, then the gift of yourself to Jesus through Mary**

The Total Consecration to Jesus through Mary is the 33-day preparation taught by **St Louis-Marie de Montfort** (1673–1716) in his book *True Devotion to Mary*. It is made in four parts: twelve days to empty ourselves of the spirit of the world, then a week each on knowledge of self, knowledge of Mary and knowledge of Jesus. On the 34th day you make your Act of Consecration, go to Confession in the days before, and receive Holy Communion.

We pray it together so that the consecration falls on **1 January, the Solemnity of Mary, Mother of God**: Day 1 is **29 November**, the First Sunday of Advent. You can also make it at any time of year, ending on another feast of Our Lady (2 February, 25 March, 13 May, 15 August, 8 December).

**How to pray each day**

1. Begin with the Sign of the Cross and the prayers for that part (named under each day).
2. Read the day’s Scripture passage and reflection.
3. Pray the day’s prayer and add your own intentions.

The full texts of the traditional prayers (Veni Creator, Ave Maris Stella, the litanies, St Louis de Montfort’s prayers and the Act of Consecration) are in the free booklet *[33 Day Preparation for Consecration to Jesus through Mary](https://legionofmary.ie/images/uploads/files/33_Day_Preparation_for_Consecration_to_Jesus_through_Mary.pdf)* from the Legion of Mary. To go deeper, read St Louis de Montfort’s *True Devotion to Mary* alongside these days.

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page.$cmp$,
  null, null,
  $cmp$**Close each day**

Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

*O Jesus, living in Mary, come and live in Thy servants. (St Louis de Montfort, traditional)*$cmp$,
  $cmp$33-Day Total Consecration to Jesus through Mary$cmp$, $cmp$Pray St Louis de Montfort’s 33-day preparation with Catholic My Pride and consecrate yourself to Jesus through Mary on 1 January, Mary, Mother of God.$cmp$, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$Blessed are the poor in spirit$cmp$, $cmp$**Read:** Matthew 5:1–12

Jesus begins the Sermon on the Mount by calling blessed those the world overlooks. The first step of this consecration is to ask which voices shape our hearts: the world’s, or the Gospel’s.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** A heart free from the spirit of the world

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: a heart free from the spirit of the world. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (2, $cmp$Salt of the earth, light of the world$cmp$, $cmp$**Read:** Matthew 5:13–19

We are called to give flavour and light, not to blend in. A Christian who takes on the spirit of the world loses his saltiness.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Courage to live the faith openly

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: courage to live the faith openly. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (3, $cmp$Seek first the kingdom$cmp$, $cmp$**Read:** Matthew 6:19–34

Where our treasure is, there our heart is. Jesus invites us to trust the Father with our needs and to put God first.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Freedom from worry and greed

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: freedom from worry and greed. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (4, $cmp$The narrow gate$cmp$, $cmp$**Read:** Matthew 7:1–14

The way to life is narrow, and few find it. The world offers the wide road; Jesus offers Himself.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Perseverance on the narrow way

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: perseverance on the narrow way. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (5, $cmp$Built on rock$cmp$, $cmp$**Read:** Matthew 7:15–29

Hearing the Word is not enough; we must do it. A life built on Christ stands when the storms come.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** A faith that acts

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: a faith that acts. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (6, $cmp$The world hates Me first$cmp$, $cmp$**Read:** John 15:18–27

Jesus warned that His disciples would not be at home in the world. Do not be surprised when the Gospel goes against the current.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Strength for Christians who suffer for their faith

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: strength for christians who suffer for their faith. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (7, $cmp$Not of the world$cmp$, $cmp$**Read:** John 17:9–19

At the Last Supper, Jesus prayed that we would be in the world but not of it, kept safe from the evil one.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Holiness in our daily work

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: holiness in our daily work. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (8, $cmp$Do not love the world$cmp$, $cmp$**Read:** 1 John 2:15–17

The world, with its desires, is passing away. Whoever does the will of God remains for ever.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Detachment from what passes away

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: detachment from what passes away. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (9, $cmp$Do not be conformed$cmp$, $cmp$**Read:** Romans 12:1–2

Offer your bodies as a living sacrifice and be transformed by the renewal of your mind. Consecration is exactly this offering.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** A renewed mind and heart

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: a renewed mind and heart. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (10, $cmp$Friendship with the world$cmp$, $cmp$**Read:** James 4:1–10

Draw near to God, and He will draw near to you. Humble yourselves before the Lord, and He will lift you up.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Humility and a clean heart

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: humility and a clean heart. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (11, $cmp$What profits a man?$cmp$, $cmp$**Read:** Mark 8:34–38

What does it profit to gain the whole world and lose one’s soul? To follow Jesus is to take up the cross daily.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Souls in danger of being lost

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: souls in danger of being lost. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (12, $cmp$Treasure in heaven$cmp$, $cmp$**Read:** Luke 12:13–34

The rich fool planned for barns, not for eternity. Today we ask Mary to help us store up treasure where it lasts.

*Part 1: Emptying ourselves of the spirit of the world.* Prayers for these days: Veni Creator Spiritus, Ave Maris Stella, the Magnificat and the Glory Be.

**Today’s intention:** Generosity to the poor

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: generosity to the poor. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (13, $cmp$Know yourself in God’s light$cmp$, $cmp$**Read:** Luke 18:9–14

The Pharisee praised himself; the tax collector beat his breast. Knowledge of self begins with honesty before God.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** An honest examination of conscience

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: an honest examination of conscience. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (14, $cmp$The vine and the branches$cmp$, $cmp$**Read:** John 15:1–8

Without Jesus we can do nothing. To know ourselves is to know how much we need Him.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** Dependence on Christ

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: dependence on christ. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (15, $cmp$Repent and believe$cmp$, $cmp$**Read:** Mark 1:14–15

Conversion is not a single moment but a daily turning back to God. Today, name one habit to bring to the Lord.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** A good confession

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: a good confession. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (16, $cmp$The prodigal son$cmp$, $cmp$**Read:** Luke 15:11–32

However far we have wandered, the Father runs to meet us. Self-knowledge leads not to despair but to the Father’s arms.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** Those far from the Church

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: those far from the church. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (17, $cmp$Wash me, O Lord$cmp$, $cmp$**Read:** Psalm 50 (51)

David’s great psalm of repentance gives us words when ours fail: a contrite and humble heart, O God, You will not despise.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** Healing from past sins

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: healing from past sins. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (18, $cmp$Pride and humility$cmp$, $cmp$**Read:** Philippians 2:1–11

Christ emptied Himself, taking the form of a servant. We are invited to the same mind and the same humility.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** Freedom from pride

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: freedom from pride. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (19, $cmp$Without Me you can do nothing$cmp$, $cmp$**Read:** John 15:4–5

This first week of preparation ends where it began: on our need for grace. Mary will teach us how to receive it.

*Part 2: Knowledge of self.* Prayers for these days: Litany of the Holy Spirit, Litany of the Blessed Virgin Mary (Litany of Loreto) and Ave Maris Stella.

**Today’s intention:** Trust in God’s grace

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: trust in god’s grace. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (20, $cmp$Hail, full of grace$cmp$, $cmp$**Read:** Luke 1:26–38

God chose Mary and asked her consent. Her “be it done unto me” is the pattern of every consecration.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** A generous “yes” to God

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: a generous “yes” to god. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (21, $cmp$The Visitation$cmp$, $cmp$**Read:** Luke 1:39–56

Mary hurried to serve Elizabeth and sang the Magnificat. Where Mary goes, Jesus brings joy.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** Mothers and expectant mothers

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: mothers and expectant mothers. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (22, $cmp$Mary at Bethlehem$cmp$, $cmp$**Read:** Luke 2:1–20

Mary gave the world its Saviour in poverty and kept all these things in her heart. She teaches us to treasure God’s work.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** Families who lack a home

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: families who lack a home. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (23, $cmp$Mary at Cana$cmp$, $cmp$**Read:** John 2:1–11

“Whatsoever he shall say to you, do ye.” Mary’s last recorded words point us to her Son.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** Married couples

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: married couples. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (24, $cmp$Mary at the foot of the Cross$cmp$, $cmp$**Read:** John 19:25–27

From the Cross, Jesus gave us His Mother. To consecrate ourselves to her is to take her into our home, as St John did.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** All who are suffering

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: all who are suffering. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (25, $cmp$Mary in the Upper Room$cmp$, $cmp$**Read:** Acts 1:12–14

Mary prayed with the apostles as they waited for the Holy Spirit. She is Mother of the Church.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** The Pope, bishops and priests

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: the pope, bishops and priests. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (26, $cmp$The woman clothed with the sun$cmp$, $cmp$**Read:** Apocalypse 12:1–6

The Church sees Mary in the great sign of the woman crowned with twelve stars. She is our Queen and our Mother.

*Part 3: Knowledge of the Blessed Virgin Mary.* Prayers for these days: Litany of the Holy Spirit, Litany of Loreto, Ave Maris Stella, St Louis de Montfort’s Prayer to Mary and the Holy Rosary.

**Today’s intention:** Victory over evil in our lives

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: victory over evil in our lives. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (27, $cmp$The Word was made flesh$cmp$, $cmp$**Read:** John 1:1–14

We now turn our gaze fully to Jesus, the eternal Word who became one of us. Mary leads us straight to Him.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Growth in love for Jesus

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: growth in love for jesus. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (28, $cmp$I am the Way, the Truth and the Life$cmp$, $cmp$**Read:** John 14:1–14

No one comes to the Father except through Jesus. True devotion to Mary is always a road to Christ.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Those searching for truth

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: those searching for truth. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (29, $cmp$I am the Good Shepherd$cmp$, $cmp$**Read:** John 10:1–18

Jesus knows His sheep by name and lays down His life for them.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Vocations to the priesthood

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: vocations to the priesthood. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (30, $cmp$I am the Bread of Life$cmp$, $cmp$**Read:** John 6:35–51

Jesus gives us Himself in the Eucharist. Prepare to receive Him at Mass on your consecration day.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Reverence for the Blessed Sacrament

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: reverence for the blessed sacrament. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (31, $cmp$The Passion of the Lord$cmp$, $cmp$**Read:** John 19:16–30

Jesus loved us to the end. Consecration means belonging to Him who gave everything for us.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Gratitude for our redemption

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: gratitude for our redemption. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (32, $cmp$He is risen$cmp$, $cmp$**Read:** John 20:1–18

Mary Magdalene met the risen Lord in the garden. Our consecration is a share in His new life.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Hope for the dying

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: hope for the dying. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$),
  (33, $cmp$Tomorrow, the gift of ourselves$cmp$, $cmp$**Read:** John 2:1–5 and Luke 1:38

Tomorrow, on the Solemnity of Mary, Mother of God, make your Act of Consecration. Go to Confession in these days, and receive Holy Communion tomorrow.

*Part 4: Knowledge of Jesus Christ.* Prayers for these days: Litany of the Holy Spirit, Ave Maris Stella, Litany of the Holy Name of Jesus, St Louis de Montfort’s Prayer to Jesus and O Jesus Living in Mary.

**Today’s intention:** Final preparation for consecration

**Prayer**

Holy Spirit, Spirit of truth, enlighten my mind and move my heart as I prepare to give myself entirely to Jesus through Mary. Mary, my Mother, take me by the hand today: final preparation for consecration. Teach me to say yes to God as you did. Amen. *(Catholic My Pride)*$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$total-consecration-to-jesus-through-mary$cmp$
on conflict (novena_id, day) do nothing;

-- 54-Day Rosary Novena
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, weekly_on, has_opening, repeats_yearly, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, seo_title, seo_description, status)
values ($cmp$54-day-rosary-novena$cmp$, $cmp$54-Day Rosary Novena$cmp$, $cmp$Our Lady of the Rosary$cmp$, '2026-10-07', null, 54, null, false, true,
  $cmp$**Six novenas of the Rosary: 27 days of petition and 27 days of thanksgiving**

The 54-Day Rosary Novena is six nine-day Rosary novenas prayed one after another: three in petition and three in thanksgiving, whether or not the request has been granted. It comes from Naples, where, according to tradition, Our Lady of the Rosary appeared on 3 March 1884 to **Fortuna Agrelli**, a young woman gravely ill for thirteen months, and asked her to pray this way. She was healed. ([University of Dayton, Marian Library](https://udayton.edu/imri/mary/f/fifty-four-day-rosary-novena.php) · [The Catholic Company](https://www.catholiccompany.com/getfed/what-is-a-54-day-rosary-novena))

We pray it together so that it ends on **7 October, Our Lady of the Rosary**, but it can be started on any day of the year.

**How to pray each day**

1. Begin with the Sign of the Cross and say the day’s offering prayer.
2. Pray five decades of the Rosary on the day’s mysteries (they follow each other: Joyful, Sorrowful, Glorious, Luminous). The tap counter below helps you keep count of the fifty Hail Marys.
3. Close with the Hail Holy Queen.

New to the Rosary? See our [Holy Rosary](/rosary) page.$cmp$,
  $cmp$Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.$cmp$, 50,
  $cmp$**Close each day: Hail, Holy Queen**

Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.

V. Pray for us, O holy Mother of God.
R. That we may be made worthy of the promises of Christ.$cmp$,
  $cmp$54-Day Rosary Novena: How to Pray It, Day by Day$cmp$, $cmp$Pray the 54-Day Rosary Novena with Catholic My Pride: 27 days of petition and 27 of thanksgiving, with the day’s mysteries, a Hail Mary counter and prayers.$cmp$, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (2, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (3, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (4, $cmp$Petition · Luminous Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (5, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (6, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (7, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (8, $cmp$Petition · Luminous Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (9, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (10, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (11, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (12, $cmp$Petition · Luminous Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (13, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (14, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (15, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (16, $cmp$Petition · Luminous Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (17, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (18, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (19, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (20, $cmp$Petition · Luminous Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (21, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (22, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (23, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (24, $cmp$Petition · Luminous Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (25, $cmp$Petition · Joyful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (26, $cmp$Petition · Sorrowful Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (27, $cmp$Petition · Glorious Mysteries$cmp$, $cmp$Days 1–27 are prayed in petition.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries as a crown of roses. With trust I place before you my petition, *(name it)*. Present it to your Son, and obtain for me the grace to accept His holy will. Amen. *(Catholic My Pride)*$cmp$),
  (28, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Today the thanksgiving part begins: thank Our Lady whether or not your request has been granted.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (29, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (30, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (31, $cmp$Thanksgiving · Glorious Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (32, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (33, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (34, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (35, $cmp$Thanksgiving · Glorious Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (36, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (37, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (38, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (39, $cmp$Thanksgiving · Glorious Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (40, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (41, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (42, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (43, $cmp$Thanksgiving · Glorious Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (44, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (45, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (46, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (47, $cmp$Thanksgiving · Glorious Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (48, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (49, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (50, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (51, $cmp$Thanksgiving · Glorious Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Glorious Mysteries**

1. **The Resurrection** (Matthew 28:1–10) · fruit: faith
2. **The Ascension** (Acts 1:6–11) · fruit: hope
3. **The Descent of the Holy Spirit** (Acts 2:1–13) · fruit: love of God
4. **The Assumption of Mary** (Apocalypse 12:1) · fruit: a happy death
5. **The Coronation of Mary** (Apocalypse 12:1) · fruit: trust in Mary

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these glorious mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (52, $cmp$Thanksgiving · Luminous Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Luminous Mysteries**

1. **The Baptism of the Lord** (Matthew 3:13–17) · fruit: openness to the Holy Spirit
2. **The Wedding at Cana** (John 2:1–11) · fruit: trust in Mary’s intercession
3. **The Proclamation of the Kingdom** (Mark 1:14–15) · fruit: conversion
4. **The Transfiguration** (Matthew 17:1–8) · fruit: desire for holiness
5. **The Institution of the Eucharist** (Matthew 26:26–28) · fruit: love of the Eucharist

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these luminous mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (53, $cmp$Thanksgiving · Joyful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Joyful Mysteries**

1. **The Annunciation** (Luke 1:26–38) · fruit: humility
2. **The Visitation** (Luke 1:39–56) · fruit: love of neighbour
3. **The Nativity** (Luke 2:1–20) · fruit: poverty of spirit
4. **The Presentation in the Temple** (Luke 2:22–38) · fruit: obedience
5. **The Finding of Jesus in the Temple** (Luke 2:41–52) · fruit: joy in finding Jesus

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these joyful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$),
  (54, $cmp$Thanksgiving · Sorrowful Mysteries$cmp$, $cmp$Days 28–54 are prayed in thanksgiving.

**Today’s mysteries: the Sorrowful Mysteries**

1. **The Agony in the Garden** (Matthew 26:36–46) · fruit: sorrow for sin
2. **The Scourging at the Pillar** (John 19:1) · fruit: purity
3. **The Crowning with Thorns** (Matthew 27:27–31) · fruit: courage
4. **The Carrying of the Cross** (John 19:17) · fruit: patience
5. **The Crucifixion** (Luke 23:33–46) · fruit: perseverance

**Prayer**

Holy Mary, Queen of the Most Holy Rosary, I offer you these sorrowful mysteries in thanksgiving. Whether my petition has been granted or not, I thank you, for I know that God hears every prayer and gives what is best. Amen. *(Catholic My Pride)*$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$54-day-rosary-novena$cmp$
on conflict (novena_id, day) do nothing;

-- Thirty Days’ Prayer to Saint Joseph
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, weekly_on, has_opening, repeats_yearly, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, seo_title, seo_description, status)
values ($cmp$thirty-days-prayer-to-saint-joseph$cmp$, $cmp$Thirty Days’ Prayer to Saint Joseph$cmp$, $cmp$Saint Joseph, Spouse of the Blessed Virgin Mary$cmp$, '2027-03-19', null, 30, null, false, true,
  $cmp$**Thirty days, in honour of the thirty years St Joseph spent with Jesus and Mary**

The Thirty Days’ Prayer to St Joseph is an old devotion for any special intention, prayed in honour of the thirty years St Joseph spent with Jesus and Mary in Nazareth. We pray it together in the thirty days before his feast on **19 March**, but it can be prayed at any time.

Each day we meditate on one of St Joseph’s titles from the **Litany of St Joseph**, including the seven Pope Francis added in 2021.

**How to pray each day**

1. Begin with the Sign of the Cross.
2. Read the day’s Scripture passage and reflection.
3. Pray the traditional Thirty Days’ Prayer to St Joseph, then the day’s prayer, and name your intention.

The full traditional text of the Thirty Days’ Prayer is on [EWTN](https://www.ewtn.com/catholicism/devotions/thirty-days-prayer-to-saint-joseph-399) and [Catholic Culture](https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=1270).

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page.$cmp$,
  null, null,
  $cmp$**Close each day**

Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.

Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

*St Joseph, pray for us.*$cmp$,
  $cmp$Thirty Days’ Prayer to St Joseph: Day by Day$cmp$, $cmp$Pray the Thirty Days’ Prayer to St Joseph with Catholic My Pride, one title of the Litany of St Joseph each day, ending before his feast on 19 March.$cmp$, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$Renowned offspring of David$cmp$, $cmp$**Read:** Matthew 1:1–16

Jesus is called Son of David through Joseph, the heir of the royal line.

Day 1 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, renowned offspring of David, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (2, $cmp$Light of Patriarchs$cmp$, $cmp$**Read:** Genesis 37:1–11 and Matthew 1:18–21

Like Joseph of old, St Joseph received God’s guidance in dreams and saved his family.

Day 2 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, light of Patriarchs, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (3, $cmp$Spouse of the Mother of God$cmp$, $cmp$**Read:** Matthew 1:18–25

God entrusted the Virgin Mary to Joseph as his wife.

Day 3 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, spouse of the Mother of God, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (4, $cmp$Guardian of the Redeemer$cmp$, $cmp$**Read:** Matthew 2:13–15

Joseph protected the Child Jesus from Herod. Pope Francis added this title to the Litany in 2021.

Day 4 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, guardian of the Redeemer, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (5, $cmp$Chaste guardian of the Virgin$cmp$, $cmp$**Read:** Luke 1:26–27

Joseph loved Mary with a pure and faithful love.

Day 5 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, chaste guardian of the Virgin, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (6, $cmp$Foster father of the Son of God$cmp$, $cmp$**Read:** Luke 2:41–51

Jesus was subject to Joseph and Mary in Nazareth.

Day 6 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, foster father of the Son of God, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (7, $cmp$Diligent protector of Christ$cmp$, $cmp$**Read:** Matthew 2:19–23

Joseph rose at night and acted without delay whenever God asked.

Day 7 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, diligent protector of Christ, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (8, $cmp$Servant of Christ$cmp$, $cmp$**Read:** Matthew 1:24

Joseph did as the angel commanded him. He served Jesus with his whole life.

Day 8 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, servant of Christ, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (9, $cmp$Minister of salvation$cmp$, $cmp$**Read:** Luke 2:4–7

Through his care, Joseph cooperated in God’s plan to save the world.

Day 9 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, minister of salvation, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (10, $cmp$Head of the Holy Family$cmp$, $cmp$**Read:** Luke 2:39–40

Joseph led his family with gentleness and faith.

Day 10 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, head of the Holy Family, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (11, $cmp$Joseph most just$cmp$, $cmp$**Read:** Matthew 1:19

Scripture calls Joseph a just man: righteous before God.

Day 11 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, joseph most just, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (12, $cmp$Joseph most chaste$cmp$, $cmp$**Read:** Matthew 1:24–25

Joseph’s purity made him a worthy guardian of the Holy Family.

Day 12 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, joseph most chaste, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (13, $cmp$Joseph most prudent$cmp$, $cmp$**Read:** Matthew 2:22–23

Joseph listened, weighed and chose wisely where to settle his family.

Day 13 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, joseph most prudent, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (14, $cmp$Joseph most strong$cmp$, $cmp$**Read:** Matthew 2:13–14

Joseph carried his family through danger into exile.

Day 14 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, joseph most strong, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (15, $cmp$Joseph most obedient$cmp$, $cmp$**Read:** Matthew 1:24

When Joseph awoke, he did as the angel of the Lord had told him.

Day 15 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, joseph most obedient, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (16, $cmp$Joseph most faithful$cmp$, $cmp$**Read:** Luke 2:41–42

Year after year, Joseph brought his family to Jerusalem for the Passover.

Day 16 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, joseph most faithful, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (17, $cmp$Mirror of patience$cmp$, $cmp$**Read:** Luke 2:6–7

When there was no room at the inn, Joseph trusted and made a home of a stable.

Day 17 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, mirror of patience, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (18, $cmp$Lover of poverty$cmp$, $cmp$**Read:** Luke 2:24

Joseph and Mary offered the gift of the poor: a pair of turtledoves.

Day 18 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, lover of poverty, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (19, $cmp$Model of workmen$cmp$, $cmp$**Read:** Matthew 13:55

Jesus was known as “the carpenter’s son”.

Day 19 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, model of workmen, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (20, $cmp$Glory of home life$cmp$, $cmp$**Read:** Luke 2:51–52

In the quiet home of Nazareth, Jesus grew in wisdom, age and grace.

Day 20 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, glory of home life, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (21, $cmp$Guardian of virgins$cmp$, $cmp$**Read:** 1 Corinthians 7:32–35

St Joseph protects all who give themselves to God with an undivided heart.

Day 21 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, guardian of virgins, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (22, $cmp$Pillar of families$cmp$, $cmp$**Read:** Ephesians 5:21–6:4

St Joseph holds families together in love and faith.

Day 22 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, pillar of families, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (23, $cmp$Support in difficulties$cmp$, $cmp$**Read:** Matthew 2:13

In every trouble, go to Joseph. (Added to the Litany in 2021.)

Day 23 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, support in difficulties, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (24, $cmp$Solace of the wretched$cmp$, $cmp$**Read:** Matthew 11:28–30

St Joseph comforts the sorrowful and leads them to Jesus.

Day 24 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, solace of the wretched, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (25, $cmp$Hope of the sick$cmp$, $cmp$**Read:** James 5:13–16

We bring the sick to St Joseph, who cared for Jesus and Mary.

Day 25 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, hope of the sick, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (26, $cmp$Patron of exiles$cmp$, $cmp$**Read:** Matthew 2:14–15

Joseph knew the life of a refugee in Egypt. (Added in 2021.)

Day 26 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, patron of exiles, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (27, $cmp$Patron of the afflicted$cmp$, $cmp$**Read:** Psalm 33 (34):19

The Lord is close to the broken-hearted, and so is St Joseph. (Added in 2021.)

Day 27 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, patron of the afflicted, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (28, $cmp$Patron of the poor$cmp$, $cmp$**Read:** Luke 2:7

Joseph shared the poverty of those who have little. (Added in 2021.)

Day 28 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, patron of the poor, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (29, $cmp$Patron of the dying$cmp$, $cmp$**Read:** John 11:25–26

Joseph died in the arms of Jesus and Mary. We ask him for a holy death.

Day 29 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, patron of the dying, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$),
  (30, $cmp$Protector of Holy Church$cmp$, $cmp$**Read:** Matthew 16:18

Blessed Pius IX declared St Joseph Patron of the Universal Church in 1870.

Day 30 of the 30 years Jesus lived with Joseph and Mary.

**Prayer**

St Joseph, protector of Holy Church, pray for us. Present to Jesus my request, *(name it)*, and obtain for me the grace to do God’s will in everything. Amen. *(Catholic My Pride)*$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$thirty-days-prayer-to-saint-joseph$cmp$
on conflict (novena_id, day) do nothing;

-- Seven Sundays of Saint Joseph
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, weekly_on, has_opening, repeats_yearly, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, seo_title, seo_description, status)
values ($cmp$seven-sundays-of-saint-joseph$cmp$, $cmp$Seven Sundays of Saint Joseph$cmp$, $cmp$Saint Joseph, Spouse of the Blessed Virgin Mary$cmp$, '2027-03-19', null, 7, $cmp$sunday$cmp$, false, true,
  $cmp$**Seven Sundays with the sorrows and joys of St Joseph**

A long-standing tradition prepares for the feast of St Joseph on **19 March** by dedicating the **seven Sundays before it** to him, in memory of his seven sorrows and seven joys. Pope Gregory XVI encouraged this custom and attached indulgences to it. ([Opus Dei](https://opusdei.org/en/article/seven-sundays-of-saint-joseph/) · [Catholic News Agency](https://catholicnewsagency.com/resources/185929/seven-sundays-devotion))

The devotion begins on the seventh Sunday before 19 March (the last Sunday of January or the first of February). Each Sunday we meditate on one sorrow and one joy from the Gospels.

**How to pray each Sunday**

1. Begin with the Sign of the Cross.
2. Read the sorrow and the joy in the Gospel passages given.
3. Pray an Our Father, Hail Mary and Glory Be, then the Sunday’s prayer, and name your intention.

It is customary to ask St Joseph for one particular grace through the seven Sundays.$cmp$,
  null, null,
  $cmp$**Close each Sunday**

Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.

Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

*St Joseph, pray for us.*$cmp$,
  $cmp$Seven Sundays of St Joseph: Sorrows and Joys$cmp$, $cmp$Pray the Seven Sundays devotion to St Joseph with Catholic My Pride: one sorrow and one joy each Sunday before his feast on 19 March.$cmp$, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$His doubt · The message of the angel$cmp$, $cmp$Joseph’s heart was troubled until God revealed His plan. Bring your own doubts to him today.

**Sorrow:** His doubt (Matthew 1:19)

**Joy:** The message of the angel (Matthew 1:20)

**Prayer**

St Joseph, by your sorrow (his doubt) and your joy (the message of the angel), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$),
  (2, $cmp$The poverty of Jesus’ birth · The birth of the Saviour$cmp$, $cmp$There was no room at the inn, yet the angels sang. God’s glory shines in poor places.

**Sorrow:** The poverty of Jesus’ birth (Luke 2:7)

**Joy:** The birth of the Saviour (Luke 2:10–11)

**Prayer**

St Joseph, by your sorrow (the poverty of jesus’ birth) and your joy (the birth of the Saviour), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$),
  (3, $cmp$The circumcision · The Holy Name of Jesus$cmp$, $cmp$Joseph saw the Child’s first blood and gave Him the name above every name.

**Sorrow:** The circumcision (Luke 2:21)

**Joy:** The Holy Name of Jesus (Matthew 1:21)

**Prayer**

St Joseph, by your sorrow (the circumcision) and your joy (the Holy Name of Jesus), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$),
  (4, $cmp$The prophecy of Simeon · The salvation of souls$cmp$, $cmp$Joseph heard that a sword would pierce Mary’s soul, and also that this Child would save many.

**Sorrow:** The prophecy of Simeon (Luke 2:34–35)

**Joy:** The salvation of souls (Luke 2:38)

**Prayer**

St Joseph, by your sorrow (the prophecy of simeon) and your joy (the salvation of souls), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$),
  (5, $cmp$The flight into Egypt · Jesus present among the Egyptians$cmp$, $cmp$Joseph led his family into exile by night. With Jesus present, even a foreign land was blessed.

**Sorrow:** The flight into Egypt (Matthew 2:13–14)

**Joy:** Jesus present among the Egyptians (Isaias 19:1)

**Prayer**

St Joseph, by your sorrow (the flight into egypt) and your joy (jesus present among the Egyptians), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$),
  (6, $cmp$The return from Egypt · Life with Jesus and Mary in Nazareth$cmp$, $cmp$Fear of Archelaus gave way to the peace of the hidden life in Nazareth.

**Sorrow:** The return from Egypt (Matthew 2:22)

**Joy:** Life with Jesus and Mary in Nazareth (Luke 2:39–40)

**Prayer**

St Joseph, by your sorrow (the return from egypt) and your joy (life with Jesus and Mary in Nazareth), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$),
  (7, $cmp$The loss of the Child Jesus · Finding Him in the Temple$cmp$, $cmp$Three days of anguish ended in joy. When we lose Jesus, St Joseph helps us find Him again.

**Sorrow:** The loss of the Child Jesus (Luke 2:43–45)

**Joy:** Finding Him in the Temple (Luke 2:46–49)

**Prayer**

St Joseph, by your sorrow (the loss of the child jesus) and your joy (finding Him in the Temple), obtain for us the grace to trust God in every trial and to find our joy in Jesus. Hear my intention, *(name it)*. Amen. *(Catholic My Pride)*$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$seven-sundays-of-saint-joseph$cmp$
on conflict (novena_id, day) do nothing;

-- Thirteen Tuesdays of Saint Anthony
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, weekly_on, has_opening, repeats_yearly, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, seo_title, seo_description, status)
values ($cmp$thirteen-tuesdays-of-saint-anthony$cmp$, $cmp$Thirteen Tuesdays of Saint Anthony$cmp$, $cmp$Saint Anthony of Padua$cmp$, '2027-06-13', null, 13, $cmp$tuesday$cmp$, false, true,
  $cmp$**Thirteen Tuesdays with St Anthony of Padua**

St Anthony of Padua died on 13 June 1231 and was buried on a Tuesday, a day marked by many miracles. Since then Tuesdays have been special days to honour him, and it is customary to pray to him on **thirteen consecutive Tuesdays**. ([Catholic Culture](https://www.catholicculture.org/culture/liturgicalyear/calendar/day.cfm?date=2018-06-13) · [EWTN](https://www.ewtn.com/pray/the-thirteen-tuesdays-to-saint-anthony))

We pray the thirteen Tuesdays before his feast on **13 June**. Each Tuesday we ask for one of the fruits of the Holy Spirit (Galatians 5:22–23), as in the traditional devotion.

**How to pray each Tuesday**

1. Begin with the Sign of the Cross.
2. Read the Scripture passage and reflection.
3. Pray the Tuesday’s prayer and name your intention, then an Our Father, Hail Mary and Glory Be.

Many people also pray St Bonaventure’s Responsory of St Anthony, *Si quaeris miracula*, and visit a church on Tuesdays during the devotion.$cmp$,
  null, null,
  $cmp$**Close each Tuesday**

Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.

Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

*St Anthony, pray for us.*$cmp$,
  $cmp$Thirteen Tuesdays of St Anthony: Prayers Week by Week$cmp$, $cmp$Pray the Thirteen Tuesdays devotion to St Anthony of Padua with Catholic My Pride, one fruit of the Holy Spirit each Tuesday before his feast on 13 June.$cmp$, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$Charity$cmp$, $cmp$**Read:** 1 Corinthians 13:1–7

St Anthony preached the love of God with such fire that crowds closed their shops to hear him.

Fruit of the Holy Spirit: **Charity**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of charity. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (2, $cmp$Joy$cmp$, $cmp$**Read:** Philippians 4:4–7

Christian joy is not the absence of trouble but the presence of the Lord.

Fruit of the Holy Spirit: **Joy**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of joy. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (3, $cmp$Peace$cmp$, $cmp$**Read:** John 14:27

St Anthony made peace between families and cities. Ask him for peace in your home.

Fruit of the Holy Spirit: **Peace**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of peace. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (4, $cmp$Patience$cmp$, $cmp$**Read:** James 5:7–11

The farmer waits for the precious fruit of the earth. God’s timing is never late.

Fruit of the Holy Spirit: **Patience**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of patience. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (5, $cmp$Long-suffering$cmp$, $cmp$**Read:** Colossians 3:12–15

Bear with one another and forgive, as the Lord has forgiven you.

Fruit of the Holy Spirit: **Long-suffering**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of long-suffering. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (6, $cmp$Kindness$cmp$, $cmp$**Read:** Ephesians 4:31–32

St Anthony is remembered for his care of the poor, still honoured today in St Anthony’s Bread.

Fruit of the Holy Spirit: **Kindness**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of kindness. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (7, $cmp$Goodness$cmp$, $cmp$**Read:** Galatians 6:9–10

Let us not grow weary of doing good, especially to those of the household of faith.

Fruit of the Holy Spirit: **Goodness**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of goodness. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (8, $cmp$Meekness$cmp$, $cmp$**Read:** Matthew 11:29

Learn of Me, for I am meek and humble of heart, says the Lord.

Fruit of the Holy Spirit: **Meekness**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of meekness. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (9, $cmp$Faith$cmp$, $cmp$**Read:** Hebrews 11:1–6

St Anthony defended the faith with the Scriptures, and the Church named him a Doctor of the Church.

Fruit of the Holy Spirit: **Faith**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of faith. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (10, $cmp$Modesty$cmp$, $cmp$**Read:** 1 Peter 3:3–4

True beauty is the hidden person of the heart.

Fruit of the Holy Spirit: **Modesty**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of modesty. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (11, $cmp$Self-control$cmp$, $cmp$**Read:** 1 Corinthians 9:24–27

Every athlete exercises self-control. St Anthony lived a life of prayer and penance.

Fruit of the Holy Spirit: **Self-control**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of self-control. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (12, $cmp$Chastity$cmp$, $cmp$**Read:** Matthew 5:8

Blessed are the clean of heart, for they shall see God. St Anthony is often shown holding a lily.

Fruit of the Holy Spirit: **Chastity**

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me the virtue of chastity. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$),
  (13, $cmp$All the fruits of the Holy Spirit$cmp$, $cmp$**Read:** Galatians 5:22–25

On this last Tuesday we ask St Anthony that the fruits we prayed for may grow in us for life.

**Prayer**

St Anthony, friend of the poor and faithful servant of Jesus, obtain for me all the fruits of the Holy Spirit. Present to the Lord my request, *(name it)*, and if it is not for my good, obtain for me what is. Amen. *(Catholic My Pride)*$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$thirteen-tuesdays-of-saint-anthony$cmp$
on conflict (novena_id, day) do nothing;

notify pgrst, 'reload schema';
