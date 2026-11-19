-- Loads the Novena to the Immaculate Conception 2026 as a draft. Run after 0018. Safe to run more than once.

insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, has_opening, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, invitation_md, seo_title, seo_description, status)
values ($cmp$novena-immaculate-conception-2026$cmp$, $cmp$Novena to the Immaculate Conception 2026$cmp$, $cmp$The Immaculate Conception$cmp$, '2026-12-08', null, 9, false,
  $cmp$**Nine days with Mary, conceived without sin**

On **8 December** the Church celebrates the Solemnity of the Immaculate Conception: from the first moment of her life, by a unique grace of God and in view of the merits of Jesus Christ, the Virgin Mary was preserved from every stain of original sin. Pope Pius IX proclaimed this dogma in 1854, and four years later Our Lady told Saint Bernadette at Lourdes, *“I am the Immaculate Conception.”*

Pray with the Catholic My Pride family for nine days, from **Sunday 29 November** (the First Sunday of Advent) to **Monday 7 December**, in preparation for the feast. In many countries 8 December is a holy day of obligation; check with your parish for Mass times.

This novena runs alongside our [Saint Andrew Christmas Novena](/novenas/saint-andrew-christmas-novena-2026), and you are welcome to pray both.

**How to pray each day**

1. Begin with the Sign of the Cross.
2. Read the day’s Scripture passage and reflection.
3. Pray the day’s prayer and add your own intentions.
4. Pray three Hail Marys.
5. Close with the novena prayer, the Memorare and the Sign of the Cross.

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page.$cmp$, $cmp$*Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.*$cmp$, 3, $cmp$**Novena Prayer to the Immaculate Conception**

O Immaculate Virgin Mary, chosen by God from all eternity to be the Mother of His Son, and preserved from every stain of sin from the first moment of your life: we rejoice in the beauty God has given you.

Look with a mother’s love on all who pray this novena. Obtain for us purity of heart, true sorrow for our sins and a firm love for your Son. Present to Him the intentions we carry today, especially *(mention your intentions)*, and the intentions of the whole Catholic My Pride family.

Crush the power of evil in our lives, as God promised in the garden, and lead us safely to Jesus, who lives and reigns for ever and ever. Amen.

**The Memorare**

Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession, was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.

*O Mary, conceived without sin, pray for us who have recourse to thee.*$cmp$, $cmp$💙 PRAY THE NOVENA TO THE IMMACULATE CONCEPTION WITH CATHOLIC MY PRIDE!

From Sunday 29 November to Monday 7 December 2026, join us for nine days of prayer with Mary, in preparation for the Solemnity of the Immaculate Conception on 8 December.

📖 A Scripture passage and reflection each day
🙏 A daily prayer, three Hail Marys and the Memorare
❤️ Bring your intentions to Our Lady, who never leaves anyone unaided

Write your prayer intentions in the comments, and let us pray for one another!

O Mary, conceived without sin, pray for us who have recourse to thee.

CATHOLIC MY PRIDE
🌐 www.catholicmypride.org/novenas/novena-immaculate-conception-2026$cmp$, $cmp$Novena to the Immaculate Conception 2026: 29 November – 7 December$cmp$, $cmp$Pray the Novena to the Immaculate Conception with Catholic My Pride from 29 November to 7 December 2026, with Scripture, a reflection and a prayer for each of the nine days.$cmp$, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$Chosen from Eternity · First Sunday of Advent$cmp$, $cmp$**Scripture: Ephesians 1:4**

> As he chose us in him before the foundation of the world, that we should be holy and unspotted in his sight in charity.

Long before Mary was born, God had her in His plan. Saint Paul says that God chose us in Christ “before the foundation of the world” to be holy and unspotted. What God desires for every one of us, He brought about fully in Mary from her very first moment. As Advent begins today, we start this novena by thanking God for His eternal love, for Mary, and for us.

**Today’s intention:** Chosen from Eternity

**Prayer**

Eternal Father, before the world began You chose Mary to be the spotless Mother of Your Son. You have chosen each of us too, to be holy in Your sight. As we begin this novena and this Advent, open our hearts to Your plan for our lives. Immaculate Mary, pray for us. Amen.$cmp$),
  (2, $cmp$The Promise in the Garden$cmp$, $cmp$**Scripture: Genesis 3:15**

> I will put enmities between thee and the woman, and thy seed and her seed: she shall crush thy head, and thou shalt lie in wait for her heel.

Right after the first sin, God made a promise: there would be enmity between the serpent and the woman, and her offspring would crush the serpent’s head. The Church has always seen in this “first Gospel” Christ, the Saviour, and Mary, His Mother, who was never under the power of sin. The story of our salvation begins with a promise of hope, and God kept His word.

**Today’s intention:** The Promise in the Garden

**Prayer**

Lord God, even in the moment of our first fall You promised a Saviour and a woman who would never belong to the enemy. Strengthen us against the temptations that lie in wait for our heels. Through the intercession of the Immaculate Virgin, crush the power of evil in our lives and our families. Amen.$cmp$),
  (3, $cmp$Full of Grace$cmp$, $cmp$**Scripture: Luke 1:30**

> And the angel said to her: Fear not, Mary, for thou hast found grace with God.

The angel tells Mary that she has found grace with God; he has already greeted her as “full of grace.” There was no corner of her soul that sin had touched, no room that grace did not fill. We receive grace too, above all in Baptism, Confession and the Eucharist. This Advent, how can we make more room for God’s grace in our lives?

**Today’s intention:** Full of Grace

**Prayer**

Holy Spirit, You filled Mary with grace from the first moment of her life. Fill our souls with Your grace, and remove whatever sin blocks Your light. Lead us to a good Confession this Advent, and to receive the Eucharist with a pure heart. Mary, full of grace, pray for us. Amen.$cmp$),
  (4, $cmp$All Fair Is Mary$cmp$, $cmp$**Scripture: Canticle of Canticles 4:7**

> Thou art all fair, O my love, and there is not a spot in thee.

For centuries the Church has sung of Mary with words from the Canticle of Canticles: “Thou art all fair, O my love, and there is not a spot in thee.” The ancient hymn *Tota pulchra es, Maria* takes up the same words. Mary’s beauty is holiness: a heart wholly given to God. In a world that often sees beauty only on the outside, she shows us the beauty of a pure soul.

**Today’s intention:** All Fair Is Mary

**Prayer**

Most beautiful Virgin, there is no stain in you. Help us to see the beauty of holiness and to seek it above every passing attraction. Purify our thoughts, our words and our desires, and make our souls beautiful in the sight of God. Tota pulchra es, Maria: pray for us. Amen.$cmp$),
  (5, $cmp$Behold the Handmaid of the Lord$cmp$, $cmp$**Scripture: Luke 1:38**

> And Mary said: Behold the handmaid of the Lord; be it done to me according to thy word. And the angel departed from her.

Mary’s sinless heart was free to say yes to God completely. Her answer to the angel is the perfect prayer of a disciple: “Be it done to me according to thy word.” Sin makes us hesitate before God’s will; grace makes us free. Today we ask for the grace to say yes to God in the decisions we face.

**Today’s intention:** Behold the Handmaid of the Lord

**Prayer**

Mary, handmaid of the Lord, you said yes to God without holding anything back. Help us to accept His will in our lives, especially where it is hard to understand. Give us generous hearts that say, with you, “Be it done to me according to thy word.” Amen.$cmp$),
  (6, $cmp$Mary Brings Jesus to Others$cmp$, $cmp$**Scripture: Luke 1:41–42**

> And it came to pass, that when Elizabeth heard the salutation of Mary, the infant leaped in her womb. And Elizabeth was filled with the Holy Ghost: And she cried out with a loud voice, and said: Blessed art thou among women, and blessed is the fruit of thy womb.

Full of grace, Mary did not keep Jesus to herself. She hurried to her cousin Elizabeth, and at the sound of her greeting John leaped for joy and Elizabeth was filled with the Holy Spirit. Wherever Mary goes, she brings Jesus. Today we pray to become like her: people who carry Christ to our families, our workplaces and our neighbours, especially those in need.

**Today’s intention:** Mary Brings Jesus to Others

**Prayer**

Holy Mary, you carried Jesus to Elizabeth and filled her home with joy. Teach us to bring Christ to others by our kindness, our help and our words. Show us someone who needs a visit, a call or a helping hand this week. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Amen.$cmp$),
  (7, $cmp$Purity of Heart$cmp$, $cmp$**Scripture: Matthew 5:8**

> Blessed are the clean of heart: for they shall see God.

Jesus promises that the clean of heart shall see God. Mary, the purest of all creatures, sees God most clearly. Purity of heart is not only about chastity, though it includes it; it means an undivided heart that seeks God above all. Today we ask Mary to help us, and especially young people, to keep our hearts pure in a world full of distractions.

**Today’s intention:** Purity of Heart

**Prayer**

Immaculate Mother, most pure Virgin, obtain for us clean hearts. Protect our eyes, our minds and our bodies from all that would stain them. Help young people to value purity and to live it with joy. Give us undivided hearts that seek God above all things, so that one day we may see Him. Amen.$cmp$),
  (8, $cmp$Behold Thy Mother · Second Sunday of Advent$cmp$, $cmp$**Scripture: John 19:26–27**

> When Jesus therefore had seen his mother and the disciple standing whom he loved, he saith to his mother: Woman, behold thy son. After that, he saith to the disciple: Behold thy mother. And from that hour, the disciple took her to his own.

From the cross, Jesus gave His Mother to the beloved disciple, and in him to all of us: “Behold thy mother.” The Immaculate Virgin is not far away; she is our Mother, who cares for each of her children. On this Second Sunday of Advent, let us take her into our homes as the disciple did, and entrust our families to her.

**Today’s intention:** Behold Thy Mother

**Prayer**

Jesus, from the cross You gave us Your own Mother. Like the beloved disciple, we take her into our homes today. Mary, our Mother, watch over our families, our children and our parents. Keep us united, keep us faithful, and bring us all safely home to your Son. Amen.$cmp$),
  (9, $cmp$Glory of Jerusalem, Joy of Israel$cmp$, $cmp$**Scripture: Judith 15:10**

> Thou art the glory of Jerusalem, thou art the joy of Israel, thou art the honour of our people.

The people praised Judith with words the Church applies to Mary: “Thou art the glory of Jerusalem, thou art the joy of Israel, thou art the honour of our people.” Tomorrow we celebrate the Immaculate Conception, the first dawn of our salvation. Today is also the memorial of Saint Ambrose, who loved and honoured Mary. As our novena ends, we place all our intentions in Mary’s hands, confident that she will bring them to Jesus.

**Today’s intention:** Glory of Jerusalem, Joy of Israel

**Prayer**

Immaculate Virgin Mary, glory of the Church, joy of all Christians, honour of our human family: we thank you for these nine days of prayer. Receive our intentions and present them to your Son. Help us to celebrate your feast tomorrow with joy, and to follow you faithfully to Jesus. O Mary, conceived without sin, pray for us who have recourse to thee. Amen.$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$novena-immaculate-conception-2026$cmp$
on conflict (novena_id, day) do nothing;
