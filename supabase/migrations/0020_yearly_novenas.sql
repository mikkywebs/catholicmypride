-- 0020: novenas can repeat every year (dates roll over by themselves),
-- and the Saint Andrew and Immaculate Conception novenas drop "2026". Safe to run more than once.

alter table public.novenas add column if not exists repeats_yearly boolean not null default false;

-- Saint Andrew Christmas Novena: new address and title, repeats every year, evergreen text.
-- Your featured image, audio and Published/Draft setting are kept.
-- (If an extra 2026 copy was loaded again after this update, remove that copy.)
delete from public.novenas where slug = $cmp$saint-andrew-christmas-novena-2026$cmp$ and exists (select 1 from public.novenas where slug = $cmp$saint-andrew-christmas-novena$cmp$);
update public.novenas set
  slug = $cmp$saint-andrew-christmas-novena$cmp$, title = $cmp$Saint Andrew Christmas Novena$cmp$, repeats_yearly = true,
  intro_md = $cmp$**Theme: Preparing Our Hearts for the Coming of Jesus Christ**

Each year the Catholic My Pride Saint Andrew Christmas Novena opens on **29 November**, as Advent begins, with a prayer of dedication. Day 1 is **30 November**, the Feast of Saint Andrew, and the novena ends on **Day 25, Christmas Eve**.

Traditionally known as the Christmas Novena or the Saint Andrew Christmas Novena, this devotion centres on a prayer that contemplates the hour of Jesus’ birth in Bethlehem. The traditional prayer is said **fifteen times each day**. We keep this beautiful Catholic tradition and add a Scripture passage, a short reflection and a special intention for each day.

**How to pray each day**

1. Begin with the Sign of the Cross.
2. Read the day’s Scripture passage.
3. Reflect on the day’s theme.
4. Present the day’s intention, and your own.
5. Say the traditional Saint Andrew prayer fifteen times (you can split it into three sets of five during the day).
6. Close with the community prayer and the Sign of the Cross.

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page, and we will pray for one another.$cmp$, common_prayers_md = $cmp$**Our Closing Prayer for the Catholic My Pride Community**

Heavenly Father, we thank You for the gift of this Advent journey.

As we approach the celebration of the birth of Your Son, may the prayers we have offered bring us closer to You.

Through the intercession of Saint Andrew, grant us the courage to follow Jesus, the humility to serve others and the faith to trust in Your divine providence.

May every family represented in this novena experience Your peace. May the sick receive comfort, the troubled find hope, the unemployed discover opportunities, and those carrying heavy burdens receive strength.

May our hearts become a dwelling place for Christ, not only at Christmas but throughout our lives.

We ask this through Christ our Lord. Amen.

*Saint Andrew the Apostle, pray for us.*
*Our Lady, Mother of God, pray for us.*
*Jesus Christ, Son of the Living God, come into our hearts. Amen.*$cmp$, invitation_md = $cmp$🎄 JOIN THE CATHOLIC MY PRIDE SAINT ANDREW CHRISTMAS NOVENA!

This Advent, let us prepare our hearts for the coming of Jesus Christ.

Beginning November 30, the Feast of Saint Andrew, we invite you to join the Catholic My Pride family in the traditional 25-day Saint Andrew Christmas Novena, continuing until Christmas Eve.

🙏 Fifteen repetitions of the traditional prayer daily.
📖 Daily Scripture readings and reflections.
❤️ Special intentions for families, healing, employment, financial needs, reconciliation and answered prayers.

On November 29, we will begin with a special Advent dedication.

Whatever you are praying for this Christmas, bring your intentions before the Lord.

Write your prayer intentions in the comments. Let us pray for one another!

Saint Andrew the Apostle, pray for us.

CATHOLIC MY PRIDE
🌐 www.catholicmypride.org/novenas/saint-andrew-christmas-novena$cmp$,
  seo_title = $cmp$Saint Andrew Christmas Novena: 25 Days of Advent Prayer$cmp$, seo_description = $cmp$Pray the Saint Andrew Christmas Novena with Catholic My Pride from 29 November to Christmas Eve: the traditional prayer 15 times a day, Scripture, reflections and daily intentions.$cmp$, updated_at = now()
where slug in ($cmp$saint-andrew-christmas-novena-2026$cmp$, $cmp$saint-andrew-christmas-novena$cmp$);

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (0, $cmp$Advent Opening and Dedication$cmp$, $cmp$**Scripture: Romans 13:11–12**

> And that knowing the season; that it is now the hour for us to rise from sleep. For now our salvation is nearer than when we believed. The night is passed, and the day is at hand. Let us therefore cast off the works of darkness, and put on the armour of light.

**Opening Prayer**

Heavenly Father, as we begin this holy season of Advent, awaken our hearts to the coming of Your Son, Jesus Christ.

Through the intercession of Saint Andrew the Apostle, help us to become faithful disciples who seek Jesus, follow Him wholeheartedly and lead others to encounter His love.

As we prepare for Christmas, remove every obstacle that prevents us from receiving Christ. Heal our wounded hearts, strengthen our families, restore broken relationships and renew our hope.

We place before You all the intentions entrusted to Catholic My Pride, especially those who are praying for healing, employment, financial assistance, marriage, children, protection, deliverance, reconciliation and peace.

May this Advent be a season of answered prayers, deeper faith, sincere repentance and renewed commitment to Christ.

Through Jesus Christ our Lord. Amen.$cmp$),
  (1, $cmp$Saint Andrew: Answering Christ’s Call$cmp$, $cmp$**Scripture: Matthew 4:18–20**

> And Jesus walking by the sea of Galilee, saw two brethren, Simon who is called Peter, and Andrew his brother, casting a net into the sea (for they were fishers). And he saith to them: Come ye after me, and I will make you to be fishers of men. And they immediately leaving their nets, followed him.

Today the Church celebrates Saint Andrew, the fisherman of Galilee who left his nets at once when Jesus called. Andrew was the first to follow, and the first to bring someone else to Christ: he found his brother Simon and said, “We have found the Messias.” This novena takes his name because his feast opens it. Like Andrew, we are invited to drop whatever holds us back and follow without delay, and then to lead others to Jesus. Who could you invite to pray with us this Advent?

**Today’s intention:** Saint Andrew: Answering Christ’s Call

**Prayer**

Lord Jesus, You called Andrew by the sea, and he followed You at once. Give us the same readiness to leave behind whatever keeps us from You. Make us fishers of men in our homes, our work and our communities, so that through us others may come to know You. Saint Andrew, pray for us. Amen.$cmp$),
  (2, $cmp$Faith and Trust in God’s Promises$cmp$, $cmp$**Scripture: Luke 1:45**

> And blessed art thou that hast believed, because those things shall be accomplished that were spoken to thee by the Lord.

Elizabeth calls Mary blessed not first because of her privileges, but because she believed. Mary trusted that what the Lord had spoken would be fulfilled, even before she could see how. Advent is a school of trust: Israel waited centuries for the Messiah, and God kept His word in the stable at Bethlehem. Whatever promise we are waiting on today, the Lord who was faithful then is faithful now.

**Today’s intention:** Faith and Trust in God’s Promises

**Prayer**

Faithful God, You never fail those who trust in You. Strengthen our faith where it is weak and our trust where it wavers. Like Mary, may we believe that every word You have spoken will be fulfilled in Your time. We place before You all who are struggling to believe. Amen.$cmp$),
  (3, $cmp$Families and Marriages$cmp$, $cmp$**Scripture: Colossians 3:12–14**

> Put ye on therefore, as the elect of God, holy, and beloved, the bowels of mercy, benignity, humility, modesty, patience: Bearing with one another, and forgiving one another, if any have a complaint against another: even as the Lord hath forgiven you, so do you also. But above all these things have charity, which is the bond of perfection.

Saint Paul describes the clothing of a Christian home: mercy, kindness, humility, gentleness, patience, forgiveness, and above all charity, “the bond of perfection.” The Holy Family of Nazareth lived these virtues in poverty and uncertainty. Today we pray for every family and every marriage in the Catholic My Pride community, for those that are thriving and those that are hurting.

**Today’s intention:** Families and Marriages

**Prayer**

Lord Jesus, You chose to grow up in the family of Mary and Joseph. Bless our families and our marriages. Where there is love, deepen it; where there is coldness, rekindle it; where there is division, heal it. Clothe our homes in patience, forgiveness and charity, and make them places where You are welcome. Holy Family of Nazareth, pray for us. Amen.$cmp$),
  (4, $cmp$Healing for the Sick$cmp$, $cmp$**Scripture: Isaias 53:4–5**

> Surely he hath borne our infirmities and carried our sorrows: and we have thought him as it were a leper, and as one struck by God and afflicted. But he was wounded for our iniquities, he was bruised for our sins: the chastisement of our peace was upon him, and by his bruises we are healed.

Isaias foretold a Saviour who would carry our infirmities and by whose wounds we are healed. In the Gospels, Jesus touches lepers, raises the dead and heals all who come to Him. He still does this today through prayer, through the Sacrament of the Anointing of the Sick, and through the care of doctors and nurses. Today we bring to Him all who are sick in body, mind or spirit.

**Today’s intention:** Healing for the Sick

**Prayer**

Lord Jesus, Divine Physician, by Your wounds we are healed. Look with love on all the sick we carry in our hearts today. Grant them healing according to Your holy will, relief from pain, peace in their fears and strength for each day. Bless those who care for them. Our Lady, Health of the Sick, pray for us. Amen.$cmp$),
  (5, $cmp$Financial Breakthrough and Employment$cmp$, $cmp$**Scripture: Matthew 6:31–33**

> Be not solicitous therefore, saying, What shall we eat: or what shall we drink, or wherewith shall we be clothed? For after all these things do the heathens seek. For your Father knoweth that you have need of all these things. Seek ye therefore first the kingdom of God, and his justice, and all these things shall be added unto you.

Jesus does not dismiss our worries about food, clothing and work; He tells us that the Father already knows we need them. He invites us to seek first the kingdom of God, trusting that the rest will follow. Today we pray for all who are unemployed, underpaid, in debt or anxious about providing for their families, and for wisdom and honesty in our work.

**Today’s intention:** Financial Breakthrough and Employment

**Prayer**

Heavenly Father, You know all our needs before we ask. Provide for those who are without work, those burdened by debt and those who worry about tomorrow. Open doors of honest employment, bless the work of our hands, and teach us to seek Your kingdom first and to share generously what we receive. Saint Joseph the Worker, pray for us. Amen.$cmp$),
  (6, $cmp$Children and Young People$cmp$, $cmp$**Scripture: Mark 10:14**

> Whom when Jesus saw, he was much displeased, and saith to them: Suffer the little children to come unto me, and forbid them not; for of such is the kingdom of God.

When the disciples turned children away, Jesus was displeased: “Suffer the little children to come unto me.” The Son of God Himself came to us as a child. Today we pray for children and young people everywhere: for their safety, their education, their faith and their future, and for parents, teachers and catechists who guide them.

**Today’s intention:** Children and Young People

**Prayer**

Lord Jesus, You welcomed little children and blessed them. Protect our children and young people from every danger to body and soul. Help them to grow in wisdom and grace, to know You and to love You. Give parents, teachers and catechists patience and wisdom. Holy Child of Bethlehem, bless them. Amen.$cmp$),
  (7, $cmp$Forgiveness and Reconciliation$cmp$, $cmp$**Scripture: Ephesians 4:31–32**

> Let all bitterness, and anger, and indignation, and clamour, and blasphemy, be put away from you, with all malice. And be ye kind one to another; merciful, forgiving one another, even as God hath forgiven you in Christ.

In Advent, John the Baptist calls us to prepare the way of the Lord. One of the best ways to prepare is to forgive. Saint Paul asks us to put away bitterness and anger and to forgive one another as God in Christ has forgiven us. Is there someone we need to forgive, or someone whose forgiveness we need to seek, before Christmas? Advent is also a good time to go to Confession.

**Today’s intention:** Forgiveness and Reconciliation

**Prayer**

Merciful Father, You have forgiven us so much in Christ. Give us the grace to forgive those who have hurt us, and the humility to ask forgiveness of those we have hurt. Heal broken relationships in our families and communities, and lead us to the Sacrament of Reconciliation this Advent. Amen.$cmp$),
  (8, $cmp$Deliverance and Freedom from Bondage$cmp$, $cmp$**Scripture: Luke 4:18–19**

> The Spirit of the Lord is upon me. Wherefore he hath anointed me to preach the gospel to the poor, he hath sent me to heal the contrite of heart, To preach deliverance to the captives, and sight to the blind, to set at liberty them that are bruised, to preach the acceptable year of the Lord, and the day of reward.

In the synagogue at Nazareth, Jesus announced His mission: to preach deliverance to captives and to set at liberty those who are bruised. Many people are bound today: by addiction, by fear, by sin that has become habit, by occult practices or by wounds from the past. Christ came to set us free. Today we ask Him to break every chain in our lives and in the lives of those we love.

**Today’s intention:** Deliverance and Freedom from Bondage

**Prayer**

Lord Jesus, You came to set captives free. Deliver us from every evil and every bondage: from addiction, fear, hatred and sin, and from every power that opposes You. Fill the places that were held captive with Your Holy Spirit and Your peace. Saint Michael the Archangel, defend us. Amen.$cmp$),
  (9, $cmp$Immaculate Conception: Through Mary’s Intercession$cmp$, $cmp$**Scripture: Luke 1:28**

> And the angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women.

Today is the Solemnity of the Immaculate Conception. God preserved Mary from every stain of original sin from the first moment of her life, preparing a pure dwelling for His Son. The angel’s greeting, “Hail, full of grace,” describes who she always was. We entrust our novena intentions to her today, confident that the Mother who said yes to God will present our prayers to her Son.

**Today’s intention:** Immaculate Conception: Through Mary’s Intercession

**Prayer**

Immaculate Virgin Mary, full of grace, God prepared you to be the Mother of our Saviour. We entrust to you all the intentions of this novena and of the Catholic My Pride family. Help us to say yes to God as you did, and keep us close to your Son. O Mary, conceived without sin, pray for us who have recourse to thee. Amen.$cmp$),
  (10, $cmp$Those Waiting for Answered Prayers$cmp$, $cmp$**Scripture: Isaias 40:31**

> But they that hope in the Lord shall renew their strength, they shall take wings as eagles, they shall run and not be weary, they shall walk and not faint.

Waiting is hard, especially when we have prayed for a long time and nothing seems to change. Isaias promises that those who hope in the Lord shall renew their strength. Advent teaches us that God’s timing is not ours, and that waiting with hope is itself a prayer. Today we pray for everyone who is tired of waiting.

**Today’s intention:** Those Waiting for Answered Prayers

**Prayer**

Lord, You hear every prayer, even when we do not yet see the answer. Strengthen all who are waiting: for healing, for work, for a spouse, for a child, for peace. Renew their strength, keep their hope alive and grant their requests according to Your loving will. Teach us to wait for You with trust. Amen.$cmp$),
  (11, $cmp$Protection Against Evil and Temptation$cmp$, $cmp$**Scripture: 1 Corinthians 10:13**

> Let no temptation take hold on you, but such as is human. And God is faithful, who will not suffer you to be tempted above that which you are able: but will make also with temptation issue, that you may be able to bear it.

Saint Paul reminds us that God is faithful and will not let us be tempted beyond our strength; with every temptation He provides a way out. Today we pray for protection for ourselves, our families and our homes against every evil, seen and unseen, and for the strength to resist the temptations we know best.

**Today’s intention:** Protection Against Evil and Temptation

**Prayer**

Faithful God, guard us under the shadow of Your wings. Protect our families, our homes and our journeys from all harm. When temptation comes, show us the way out and give us the strength to take it. Saint Michael the Archangel, defend us in battle. Our Guardian Angels, watch over us. Amen.$cmp$),
  (12, $cmp$Peace in Troubled Homes$cmp$, $cmp$**Scripture: John 14:27**

> Peace I leave with you, my peace I give unto you: not as the world giveth, do I give unto you. Let not your heart be troubled, nor let it be afraid.

Jesus gives a peace the world cannot give. Many homes are troubled by quarrels, money worries, illness, distance or silence. The Prince of Peace was born into a world without peace, and He wants to be born in our homes too. Today we pray for every troubled home, beginning with our own.

**Today’s intention:** Peace in Troubled Homes

**Prayer**

Lord Jesus, Prince of Peace, enter every troubled home today. Calm angry words, heal old wounds, soften hard hearts and restore trust. Where there is violence, bring safety; where there is silence, bring gentle words. Let Your peace, which the world cannot give, rest on our families. Amen.$cmp$),
  (13, $cmp$Our Lady of Guadalupe: Hope for Families$cmp$, $cmp$**Scripture: Apocalypse 12:1**

> And a great sign appeared in heaven: A woman clothed with the sun, and the moon under her feet, and on her head a crown of twelve stars.

In 1531 Our Lady appeared to Saint Juan Diego in Mexico, clothed with the sun like the woman of the Apocalypse, and expecting a child. She said to him, “Am I not here, I who am your mother?” Patroness of the Americas and protector of the unborn, she brings hope to families everywhere. Today we bring her our families and every mother and unborn child.

**Today’s intention:** Our Lady of Guadalupe: Hope for Families

**Prayer**

Our Lady of Guadalupe, Mother of the true God, you came to Juan Diego with tenderness and hope. Watch over our families. Protect mothers and unborn children, comfort the poor and the forgotten, and lead all your children to your Son. Am I not here, who am your Mother? Yes, Mother, and we trust in you. Amen.$cmp$),
  (14, $cmp$Conversion and Return to the Faith$cmp$, $cmp$**Scripture: Luke 15:20**

> And rising up he came to his father. And when he was yet a great way off, his father saw him, and was moved with compassion, and running to him fell upon his neck, and kissed him.

Around this time the Church keeps Gaudete Sunday, the Sunday of joy, when the rose candle is lit. The greatest joy in heaven is a sinner who comes home. In the parable, the father runs to meet his son while he is still far away. Today we pray for those who have drifted from the faith, those who have never known Christ, and for our own ongoing conversion.

**Today’s intention:** Conversion and Return to the Faith

**Prayer**

Merciful Father, You run to meet every child who turns back to You. Bring home all who have wandered from the Church, especially our own family members and friends. Give them the courage to take the first step, and give us patience, love and the right words. Let there be joy in heaven over every return. Amen.$cmp$),
  (15, $cmp$The Lonely, Abandoned and Grieving$cmp$, $cmp$**Scripture: Isaias 49:15**

> Can a woman forget her infant, so as not to have pity on the son of her womb? and if she should forget, yet will not I forget thee.

God speaks through Isaias with a mother’s tenderness: even if a mother could forget her child, “yet will not I forget thee.” Christmas can be the loneliest season for those who are grieving, separated from family, abandoned or forgotten. Today we pray for them, and ask how we might be God’s presence to someone who is alone.

**Today’s intention:** The Lonely, Abandoned and Grieving

**Prayer**

Loving Father, You never forget any of Your children. Comfort all who are lonely, abandoned or grieving this Advent. Be close to those who mourn, those far from home, the elderly and the forgotten. Show us someone we can visit, call or help, so that no one feels alone this Christmas. Eternal rest grant unto the faithful departed, O Lord. Amen.$cmp$),
  (16, $cmp$Strength in Times of Suffering$cmp$, $cmp$**Scripture: 2 Corinthians 12:9**

> And he said to me: My grace is sufficient for thee; for power is made perfect in infirmity. Gladly therefore will I glory in my infirmities, that the power of Christ may dwell in me.

Saint Paul begged God three times to take away his suffering, and heard instead: “My grace is sufficient for thee.” God does not always remove our cross, but He never leaves us alone under it. United to Christ, our suffering has meaning. Today we pray for all who are carrying heavy crosses.

**Today’s intention:** Strength in Times of Suffering

**Prayer**

Lord Jesus, You carried Your cross for love of us. Give strength to all who suffer in body, mind or spirit. When the burden seems too heavy, let them feel that Your grace is enough. Help us to unite our sufferings with Yours for the salvation of souls. Our Lady of Sorrows, pray for us. Amen.$cmp$),
  (17, $cmp$Vocations and Faithful Servants of God$cmp$, $cmp$**Scripture: Matthew 9:37–38**

> Then he saith to his disciples, The harvest indeed is great, but the labourers are few. Pray ye therefore the Lord of the harvest, that he send forth labourers into his harvest.

Jesus looked at the crowds and saw a great harvest with few labourers, and He asked us to pray for more. Today we pray for vocations to the priesthood, to religious life and to holy marriage, and for faithful servants of God already serving: our Pope, bishops, priests, deacons, religious and lay ministers.

**Today’s intention:** Vocations and Faithful Servants of God

**Prayer**

Lord of the harvest, send labourers into Your harvest. Call generous young men to the priesthood and young men and women to religious life, and give them the courage to answer. Bless and protect our Pope, our bishops, our priests and all who serve You. Make them holy and faithful. Amen.$cmp$),
  (18, $cmp$God’s Mercy and Forgiveness$cmp$, $cmp$**Scripture: Luke 1:50**

> And his mercy is from generation unto generations, to them that fear him.

From today the Church prays the great “O Antiphons” as Christmas draws near. In her Magnificat, Mary sings that God’s mercy reaches from generation to generation. The Child of Bethlehem is mercy made visible. No sin is greater than God’s mercy for those who repent. Today we thank God for His mercy and ask it for the whole world.

**Today’s intention:** God’s Mercy and Forgiveness

**Prayer**

God of mercy, Your mercy is from generation to generation. Have mercy on us and on the whole world. Forgive our sins, heal the wounds they have caused, and make us merciful as You are merciful. Jesus, I trust in You. Amen.$cmp$),
  (19, $cmp$Couples Waiting for the Gift of Children$cmp$, $cmp$**Scripture: Luke 1:13**

> But the angel said to him: Fear not, Zachary, for thy prayer is heard; and thy wife Elizabeth shall bear thee a son, and thou shalt call his name John.

Zachary and Elizabeth had prayed for a child for many years. When they were old, the angel said, “Fear not, Zachary, for thy prayer is heard.” Today we pray with great tenderness for couples who long for the gift of children, for those who have lost children, and for those who are discerning adoption.

**Today’s intention:** Couples Waiting for the Gift of Children

**Prayer**

Lord, giver of life, You heard the prayer of Zachary and Elizabeth. Look with love on all couples who long for children. Grant them this gift if it is Your will; comfort them in their waiting and in their grief; and give them peace in Your plan for their family. Saint Elizabeth and Saint Anne, pray for them. Amen.$cmp$),
  (20, $cmp$The Poor, Needy and Displaced$cmp$, $cmp$**Scripture: Luke 2:7**

> And she brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.

There was no room for them in the inn. The Son of God was born among the poor, laid in a manger, and soon became a refugee in Egypt. Today we pray for the poor, the hungry, the homeless, refugees and all who are displaced by war or disaster, and we ask what we can give this Christmas.

**Today’s intention:** The Poor, Needy and Displaced

**Prayer**

Lord Jesus, You were born poor and had nowhere to lay Your head. Provide for the poor, the hungry, the homeless and all who have fled their homes. Open our hearts and our hands to share what we have, so that no one is turned away this Christmas. Amen.$cmp$),
  (21, $cmp$Preparation for the Coming of Christ$cmp$, $cmp$**Scripture: Isaias 40:3**

> The voice of one crying in the desert: Prepare ye the way of the Lord, make straight in the wilderness the paths of our God.

As Advent draws to its close, the voice of the prophet rings out: “Prepare ye the way of the Lord.” Christmas is only days away. Beyond the shopping and the cooking, how is our heart prepared? A good confession, a reconciliation, an act of charity, time in quiet prayer: these make straight the paths of the Lord.

**Today’s intention:** Preparation for the Coming of Christ

**Prayer**

Come, Lord Jesus. Prepare our hearts for Your coming. Level the mountains of pride, fill the valleys of discouragement, and make straight the crooked paths in our lives. Let us not be too busy to welcome You this Christmas. Amen.$cmp$),
  (22, $cmp$Hope in Difficult and Impossible Situations$cmp$, $cmp$**Scripture: Luke 1:37**

> Because no word shall be impossible with God.

The angel told Mary that “no word shall be impossible with God.” A virgin would conceive; an elderly woman was already with child. Some of us face situations that seem truly impossible. Today we bring them to the God for whom nothing is impossible.

**Today’s intention:** Hope in Difficult and Impossible Situations

**Prayer**

Almighty God, nothing is impossible for You. We bring You the situations that seem hopeless: illnesses, debts, broken relationships, legal troubles and long-standing problems. Act in Your power and love. Give us hope where we see no way. Saint Jude and Saint Rita, patrons of impossible causes, pray for us. Amen.$cmp$),
  (23, $cmp$Gratitude for God’s Blessings$cmp$, $cmp$**Scripture: Luke 1:46–49**

> And Mary said: My soul doth magnify the Lord. And my spirit hath rejoiced in God my Saviour. Because he hath regarded the humility of his handmaid; for behold from henceforth all generations shall call me blessed. Because he that is mighty, hath done great things to me; and holy is his name.

In the Magnificat, Mary sings with joy: “He that is mighty hath done great things to me.” Gratitude opens our eyes to what God has already done. Today, before asking for anything more, let us count our blessings from this past year and thank God for each one.

**Today’s intention:** Gratitude for God’s Blessings

**Prayer**

Father, we thank You for every blessing of this year: for life and health, for family and friends, for food and shelter, for answered prayers and even for prayers answered differently than we hoped. Above all, we thank You for the gift of Your Son. My soul magnifies the Lord. Amen.$cmp$),
  (24, $cmp$Surrendering Our Lives and Intentions to God$cmp$, $cmp$**Scripture: Luke 1:38**

> And Mary said: Behold the handmaid of the Lord; be it done to me according to thy word. And the angel departed from her.

Mary’s answer to the angel is the most beautiful prayer of surrender: “Be it done to me according to thy word.” She did not know every detail of God’s plan, but she trusted Him completely. As the novena draws to an end, we place all our intentions into God’s hands and let go of our need to control the outcome.

**Today’s intention:** Surrendering Our Lives and Intentions to God

**Prayer**

Lord, like Mary, I surrender to You. Be it done to me according to Your word. I place into Your hands my life, my family, my work, my worries and every intention of this novena. Take care of everything. Jesus, I trust in You. Amen.$cmp$),
  (25, $cmp$Christmas Eve: Welcoming Jesus into Our Hearts$cmp$, $cmp$**Scripture: Isaias 9:6**

> For a child is born to us, and a son is given to us, and the government is upon his shoulder: and his name shall be called, Wonderful, Counsellor, God the Mighty, the Father of the world to come, the Prince of Peace.

“For a child is born to us, and a son is given to us.” Tonight the waiting ends. The Son of God is born of the Virgin Mary in Bethlehem, in the cold of night, as our novena prayer has contemplated each day. Tonight we pray the traditional prayer for the last time this year, and we offer God our heart as His dwelling place. Thank you for praying with the Catholic My Pride family. A blessed and joyful Christmas to you and your loved ones!

**Today’s intention:** Christmas Eve: Welcoming Jesus into Our Hearts

**Prayer**

Lord Jesus, Wonderful Counsellor, God the Mighty, Prince of Peace, come and be born in our hearts tonight. We thank You for these days of prayer. Receive all our intentions, bless all who have prayed this novena, and fill our homes with the joy of Your birth. Glory to God in the highest, and on earth peace to people of good will. Amen.$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$saint-andrew-christmas-novena$cmp$
on conflict (novena_id, day) do update set title = excluded.title, prayer_md = excluded.prayer_md;

-- Novena to the Immaculate Conception: new address and title, repeats every year, evergreen text.
-- Your featured image, audio and Published/Draft setting are kept.
-- (If an extra 2026 copy was loaded again after this update, remove that copy.)
delete from public.novenas where slug = $cmp$novena-immaculate-conception-2026$cmp$ and exists (select 1 from public.novenas where slug = $cmp$novena-immaculate-conception$cmp$);
update public.novenas set
  slug = $cmp$novena-immaculate-conception$cmp$, title = $cmp$Novena to the Immaculate Conception$cmp$, repeats_yearly = true,
  intro_md = $cmp$**Nine days with Mary, conceived without sin**

On **8 December** the Church celebrates the Solemnity of the Immaculate Conception: from the first moment of her life, by a unique grace of God and in view of the merits of Jesus Christ, the Virgin Mary was preserved from every stain of original sin. Pope Pius IX proclaimed this dogma in 1854, and four years later Our Lady told Saint Bernadette at Lourdes, *“I am the Immaculate Conception.”*

Pray with the Catholic My Pride family for nine days, from **29 November** to **7 December**, in preparation for the feast. In many countries 8 December is a holy day of obligation; check with your parish for Mass times.

This novena runs alongside our [Saint Andrew Christmas Novena](/novenas/saint-andrew-christmas-novena), and you are welcome to pray both.

**How to pray each day**

1. Begin with the Sign of the Cross.
2. Read the day’s Scripture passage and reflection.
3. Pray the day’s prayer and add your own intentions.
4. Pray three Hail Marys.
5. Close with the novena prayer, the Memorare and the Sign of the Cross.

Bring your intentions to us on our [Prayer Requests](/prayer-requests) page.$cmp$, common_prayers_md = $cmp$**Novena Prayer to the Immaculate Conception**

O Immaculate Virgin Mary, chosen by God from all eternity to be the Mother of His Son, and preserved from every stain of sin from the first moment of your life: we rejoice in the beauty God has given you.

Look with a mother’s love on all who pray this novena. Obtain for us purity of heart, true sorrow for our sins and a firm love for your Son. Present to Him the intentions we carry today, especially *(mention your intentions)*, and the intentions of the whole Catholic My Pride family.

Crush the power of evil in our lives, as God promised in the garden, and lead us safely to Jesus, who lives and reigns for ever and ever. Amen.

**The Memorare**

Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession, was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.

*O Mary, conceived without sin, pray for us who have recourse to thee.*$cmp$, invitation_md = $cmp$💙 PRAY THE NOVENA TO THE IMMACULATE CONCEPTION WITH CATHOLIC MY PRIDE!

From 29 November to 7 December, join us for nine days of prayer with Mary, in preparation for the Solemnity of the Immaculate Conception on 8 December.

📖 A Scripture passage and reflection each day
🙏 A daily prayer, three Hail Marys and the Memorare
❤️ Bring your intentions to Our Lady, who never leaves anyone unaided

Write your prayer intentions in the comments, and let us pray for one another!

O Mary, conceived without sin, pray for us who have recourse to thee.

CATHOLIC MY PRIDE
🌐 www.catholicmypride.org/novenas/novena-immaculate-conception$cmp$,
  seo_title = $cmp$Novena to the Immaculate Conception: 29 November – 7 December$cmp$, seo_description = $cmp$Pray the Novena to the Immaculate Conception with Catholic My Pride every year from 29 November to 7 December, with Scripture, a reflection and a prayer for each of the nine days.$cmp$, updated_at = now()
where slug in ($cmp$novena-immaculate-conception-2026$cmp$, $cmp$novena-immaculate-conception$cmp$);

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
  (1, $cmp$Chosen from Eternity$cmp$, $cmp$**Scripture: Ephesians 1:4**

> As he chose us in him before the foundation of the world, that we should be holy and unspotted in his sight in charity.

Long before Mary was born, God had her in His plan. Saint Paul says that God chose us in Christ “before the foundation of the world” to be holy and unspotted. What God desires for every one of us, He brought about fully in Mary from her very first moment. As Advent begins, we start this novena by thanking God for His eternal love, for Mary, and for us.

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
  (8, $cmp$Behold Thy Mother$cmp$, $cmp$**Scripture: John 19:26–27**

> When Jesus therefore had seen his mother and the disciple standing whom he loved, he saith to his mother: Woman, behold thy son. After that, he saith to the disciple: Behold thy mother. And from that hour, the disciple took her to his own.

From the cross, Jesus gave His Mother to the beloved disciple, and in him to all of us: “Behold thy mother.” The Immaculate Virgin is not far away; she is our Mother, who cares for each of her children. This Advent, let us take her into our homes as the disciple did, and entrust our families to her.

**Today’s intention:** Behold Thy Mother

**Prayer**

Jesus, from the cross You gave us Your own Mother. Like the beloved disciple, we take her into our homes today. Mary, our Mother, watch over our families, our children and our parents. Keep us united, keep us faithful, and bring us all safely home to your Son. Amen.$cmp$),
  (9, $cmp$Glory of Jerusalem, Joy of Israel$cmp$, $cmp$**Scripture: Judith 15:10**

> Thou art the glory of Jerusalem, thou art the joy of Israel, thou art the honour of our people.

The people praised Judith with words the Church applies to Mary: “Thou art the glory of Jerusalem, thou art the joy of Israel, thou art the honour of our people.” Tomorrow we celebrate the Immaculate Conception, the first dawn of our salvation. On 7 December the Church also remembers Saint Ambrose, who loved and honoured Mary. As our novena ends, we place all our intentions in Mary’s hands, confident that she will bring them to Jesus.

**Today’s intention:** Glory of Jerusalem, Joy of Israel

**Prayer**

Immaculate Virgin Mary, glory of the Church, joy of all Christians, honour of our human family: we thank you for these nine days of prayer. Receive our intentions and present them to your Son. Help us to celebrate your feast tomorrow with joy, and to follow you faithfully to Jesus. O Mary, conceived without sin, pray for us who have recourse to thee. Amen.$cmp$)
) as d(day, title, prayer_md)
where n.slug = $cmp$novena-immaculate-conception$cmp$
on conflict (novena_id, day) do update set title = excluded.title, prayer_md = excluded.prayer_md;
