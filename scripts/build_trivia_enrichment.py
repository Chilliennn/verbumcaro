# scripts/build_trivia_enrichment.py
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

TRIVIA_SOURCES = {
    "c1": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P41.HTM",
        "sourcePreview": "CCC 1376: By the consecration of the bread and wine there takes place a change of the whole substance of the bread into the substance of the body of Christ our Lord and of the whole substance of the wine into the substance of his blood. This change the holy Catholic Church has fittingly and properly called transubstantiation."
    },
    "c2": {
        "sourceUrl": "https://en.wikipedia.org/wiki/General_Instruction_of_the_Roman_Missal",
        "sourcePreview": "GIRM 346(d): Violet or purple vestments are prescribed during the penitential seasons of Advent and Lent to symbolize repentance, preparation, and spiritual expectation."
    },
    "c3": {
        "sourceUrl": "https://www.newadvent.org/cathen/07674d.htm",
        "sourcePreview": "Ineffabilis Deus (Pius IX, 1854): Blessed Pope Pius IX dogmatically defined that the Blessed Virgin Mary was preserved exempt from all stain of original sin from the first instant of her conception."
    },
    "c4": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_en.html",
        "sourcePreview": "Dei Verbum 10: The task of authentically interpreting the word of God, whether written or handed on, has been entrusted exclusively to the living teaching office of the Church (the Magisterium), whose authority is exercised in the name of Jesus Christ."
    },
    "c5": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P64.HTM",
        "sourcePreview": "CCC 1813: The theological virtues are the foundation of Christian moral activity; they are infused by God into the souls of the faithful to make them capable of acting as his children. There are three: faith, hope, and charity."
    },
    "c6": {
        "sourceUrl": "https://www.newadvent.org/cathen/01556a.htm",
        "sourcePreview": "Catholic Devotional Tradition: St. Anthony of Padua (Doctor of the Church) has been venerated since the 13th century as the patron saint invoked for the recovery of lost articles and missing items."
    },
    "c7": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_en.html",
        "sourcePreview": "Lumen Gentium 28 / CCC 1554: Divinely instituted ecclesiastical ministry is conferred in different degrees: the episcopate (bishops), the presbyterate (priests), and the diaconate (deacons)."
    },
    "c8": {
        "sourceUrl": "https://www.newadvent.org/cathen/15030c.htm",
        "sourcePreview": "Council of Trent (1545–1563): The nineteenth Ecumenical Council definitively defined the canon of 73 biblical books, reaffirmed the seven sacraments, and declared the Latin Vulgate authentic for Church teaching."
    },
    "c9": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P3A.HTM",
        "sourcePreview": "CCC 1212: The sacraments of Christian initiation - Baptism, Confirmation, and the Eucharist - lay the foundations of every Christian life, through which believers receive divine life and nourishment."
    },
    "c10": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Kyrie",
        "sourcePreview": "GIRM 52: The Kyrie, eleison ('Lord, have mercy') is an ancient Greek acclamation and chant preserved in the Roman Rite Mass by which the faithful acclaim the Lord and implore His mercy."
    },
    "c11": {
        "sourceUrl": "https://www.newadvent.org/cathen/11044a.htm",
        "sourcePreview": "Council of Nicaea (325 AD) / CCC 465: The First Ecumenical Council confessed that the Son of God is 'consubstantial' (homoousios) with the Father, affirming His full divinity against the Arian heresy."
    },
    "c12": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P29.HTM",
        "sourcePreview": "CCC 811: 'This is the sole Church of Christ, which in the Creed we profess to be one, holy, catholic and apostolic.' These four marks are essential characteristics of the Church and her divine mission."
    },
    "c13": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P4.HTM",
        "sourcePreview": "CCC 13: The Catechism is structured around four pillars: the Profession of Faith (Creed), the Sacraments of Faith, the Life of Faith (Commandments), and Prayer in Christian Life (Lord's Prayer)."
    },
    "c14": {
        "sourceUrl": "https://www.vatican.va/content/pius-xii/en/apost_constitutions/documents/hf_p-xii_apc_19501101_munificentissimus-deus.html",
        "sourcePreview": "Munificentissimus Deus (Pius XII, 1950): Pope Pius XII dogmatically defined that the Immaculate Mother of God, the ever-virgin Mary, having completed the course of her earthly life, was assumed body and soul into heavenly glory."
    },
    "c15": {
        "sourceUrl": "https://www.newadvent.org/cathen/05491a.htm",
        "sourcePreview": "Council of Ephesus (431 AD) / CCC 495: The Third Ecumenical Council proclaimed Mary as Theotokos (God-bearer / Mother of God) because the Son she conceived and bore is truly God incarnate."
    },
    "c16": {
        "sourceUrl": "https://www.newadvent.org/cathen/09017a.htm",
        "sourcePreview": "Lateran Synod (649 AD) / CCC 499: The dogma of Perpetual Virginity affirms that Mary remained a virgin before, during, and perpetually after the birth of Jesus Christ (Aeiparthenos)."
    },
    "c17": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P1C.HTM",
        "sourcePreview": "CCC 246-248: Western Catholic theology confesses in the Nicene Creed that the Holy Spirit proceeds eternally from the Father and the Son (Filioque) as from a single divine principle."
    },
    "c18": {
        "sourceUrl": "https://www.newadvent.org/cathen/15303a.htm",
        "sourcePreview": "Vatican I, Pastor Aeternus (1870) / CCC 891: Defined that the Roman Pontiff possesses infallibility when speaking ex cathedra to define a doctrine concerning faith or morals to be held by the whole Church."
    },
    "c19": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2A.HTM",
        "sourcePreview": "CCC 881: Christ constituted Saint Peter as the rock and primary shepherd of the Church, conferring upon him the Keys of the Kingdom of Heaven (Matthew 16:18-19) as the first Bishop of Rome."
    },
    "c20": {
        "sourceUrl": "https://www.newadvent.org/cathen/09272b.htm",
        "sourcePreview": "Roman Canon / Liber Pontificalis: Saint Linus was chosen by the Apostles to succeed Saint Peter as the second Bishop of Rome, heading the Church from approximately 67 to 76 AD."
    },
    "c21": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P38.HTM",
        "sourcePreview": "Council of Trent / CCC 1113: The Catholic Church professes that there are seven sacraments instituted by Christ: Baptism, Confirmation, Eucharist, Penance, Anointing of the Sick, Holy Orders, and Matrimony."
    },
    "c22": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P3N.HTM",
        "sourcePreview": "CCC 1263: By Baptism all sins are forgiven, original sin and all personal sins, as well as all punishment for sin. In those who have been reborn nothing remains that would impede entry into the Kingdom of God."
    },
    "c23": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P2U.HTM",
        "sourcePreview": "Canon 849 / CCC 1239-1240: Valid Catholic Baptism requires true water poured or immersed with the essential Trinitarian formula: 'I baptize you in the name of the Father, and of the Son, and of the Holy Spirit.'"
    },
    "c24": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P3R.HTM",
        "sourcePreview": "CCC 1294: Sacred Chrism (Sanctum Chrisma), consecrated by the bishop at the Chrism Mass on Holy Thursday, is perfumed olive oil with balsam used to anoint candidates in Confirmation, Baptism, and Holy Orders."
    },
    "c25": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P46.HTM",
        "sourcePreview": "Council of Trent / CCC 1450: The three acts of the penitent necessary for the valid reception of the Sacrament of Reconciliation are contrition (sorrow of heart), confession of sins, and satisfaction (penance)."
    },
    "c26": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P3G.HTM",
        "sourcePreview": "Canon 983 §1 / CCC 1467: The sacramental seal of Confession is inviolable; it is absolutely forbidden for a confessor to betray the penitent in any way, for any reason, under penalty of automatic excommunication."
    },
    "c27": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P4G.HTM",
        "sourcePreview": "James 5:14-15 / CCC 1510: 'Is any man sick among you? Let him bring in the priests of the church, and let them pray over him, anointing him with oil in the name of the Lord.' This scriptural warrant institutes the Sacrament of the Anointing of the Sick."
    },
    "c28": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P53.HTM",
        "sourcePreview": "CCC 1623: According to the Latin tradition, the spouses as ministers of Christ's grace mutually confer upon each other the sacrament of Matrimony by expressing their consent before the Church."
    },
    "c29": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P3N.HTM",
        "sourcePreview": "Canon 1012 / CCC 1576: A consecrated bishop alone is the minister of sacred ordination, possessing the fullness of the Sacrament of Holy Orders to ordain deacons, priests, and bishops."
    },
    "c30": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Liturgical_year",
        "sourcePreview": "General Norms for the Liturgical Year 39: The liturgical year of the Church commences on the First Sunday of Advent, four Sundays prior to Christmas Day, beginning the season of joyful anticipation."
    },
    "c31": {
        "sourceUrl": "https://en.wikipedia.org/wiki/General_Instruction_of_the_Roman_Missal",
        "sourcePreview": "GIRM 346(b): Red vestments are prescribed on Palm Sunday, Good Friday, Pentecost Sunday, the celebrations of the Lord's Passion, and on the feast days of Apostles, Evangelists, and Martyrs."
    },
    "c32": {
        "sourceUrl": "https://en.wikipedia.org/wiki/General_Instruction_of_the_Roman_Missal",
        "sourcePreview": "GIRM 346(c): Green vestments are worn in the Offices and Masses of Ordinary Time, symbolizing life, hope, and steady spiritual growth in following Christ throughout the liturgical year."
    },
    "c33": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P34.HTM",
        "sourcePreview": "CCC 1168: The Easter Triduum (Holy Thursday evening through Easter Sunday evening) is the summit of the Liturgical Year, commemorating the Passion, Death, and Resurrection of Jesus Christ."
    },
    "c34": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Monstrance",
        "sourcePreview": "Eucharistic Adoration: The monstrance (ostensorium), usually designed as a radiant sunburst, is the sacred vessel used to expose the consecrated Blessed Sacrament for adoration and benediction."
    },
    "c35": {
        "sourceUrl": "https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html",
        "sourcePreview": "Rosarium Virginis Mariae (2002): St. John Paul II introduced the five Luminous Mysteries (Mysteries of Light), bringing the complete traditional Rosary to four sets of mysteries comprising 20 decades."
    },
    "c36": {
        "sourceUrl": "https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html",
        "sourcePreview": "Rosarium Virginis Mariae: The five Sorrowful Mysteries of the Rosary are: The Agony in the Garden, The Scourging at the Pillar, The Crowning with Thorns, The Carrying of the Cross, and The Crucifixion."
    },
    "c37": {
        "sourceUrl": "https://www.newadvent.org/cathen/14663b.htm",
        "sourcePreview": "St. Thomas Aquinas (1225–1274): The Angelic Doctor (Doctor Angelicus), an Italian Dominican friar, composed the monumental Summa Theologiae and provided classic theological syntheses of Catholic dogma."
    },
    "c38": {
        "sourceUrl": "https://www.newadvent.org/cathen/02084a.htm",
        "sourcePreview": "St. Augustine of Hippo (354–430): Bishop of Hippo and Doctor of Grace, author of Confessions and The City of God, whose theology shaped Western Christian thought and sacramental theology."
    },
    "c39": {
        "sourceUrl": "https://www.newadvent.org/cathen/14515b.htm",
        "sourcePreview": "Papal Declaration (1970): Pope Paul VI solemnly proclaimed Saint Teresa of Ávila (together with Saint Catherine of Siena) as the first female Doctor of the Church on September 27, 1970."
    },
    "c40": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2K.HTM",
        "sourcePreview": "CCC 1020-1060: Traditional Catholic eschatology summarizes the 'Four Last Things' (Quattuor Novissima) awaiting every human soul as Death, Judgment, Heaven, and Hell."
    },
    "c41": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2N.HTM",
        "sourcePreview": "CCC 1030-1031: All who die in God's grace and friendship, but still imperfectly purified, undergo purification after death, so as to achieve the holiness necessary to enter the joy of heaven. The Church calls this final purification Purgatory."
    },
    "c42": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2M.HTM",
        "sourcePreview": "CCC 1023: Those who die in God's grace see God face to face, just as He is. This ultimate, supernatural direct contemplation and communion with God is called the Beatific Vision (Visio Beatifica)."
    },
    "c43": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P63.HTM",
        "sourcePreview": "CCC 1805: Four virtues play a pivotal and pivotal role and are called 'cardinal' (from Latin cardo, 'hinge'): Prudence, Justice, Fortitude, and Temperance (Wisdom 8:7)."
    },
    "c44": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P79.HTM",
        "sourcePreview": "CCC 2084: Following St. Augustine, the Catholic Church groups the commandment against idolatry and graven images under the First Commandment: 'I am the Lord your God: you shall not have strange Gods before me.'"
    },
    "c45": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P6C.HTM",
        "sourcePreview": "CCC 1866: Following Saint John Cassian and Saint Gregory the Great, the Catholic tradition identifies Seven Capital Vices (Deadly Sins): Pride, Greed, Envy, Wrath, Lust, Gluttony, and Sloth (Acedia)."
    },
    "c46": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P8E.HTM",
        "sourcePreview": "CCC 2447: The Corporal Works of Mercy, derived from Matthew 25, are charitable actions assisting our neighbors in bodily needs: feeding the hungry, giving drink to the thirsty, clothing the naked, sheltering the homeless, visiting the sick, visiting the imprisoned, and burying the dead."
    },
    "c47": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P8E.HTM",
        "sourcePreview": "CCC 2447: The Spiritual Works of Mercy are: instructing the ignorant, counseling the doubtful, admonishing sinners, bearing wrongs patiently, forgiving offenses willingly, comforting the afflicted, and praying for the living and the dead."
    },
    "c48": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P3G.HTM",
        "sourcePreview": "Canon 989 / CCC 2042: The second precept of the Church mandates that every Catholic who has reached the age of discretion is bound faithfully to confess serious (mortal) sins at least once a year."
    },
    "c49": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P35.HTM",
        "sourcePreview": "Canon 920 / CCC 2042: The third precept of the Church obligates every Catholic to receive the Sacrament of the Holy Eucharist at least once a year, specifically during the Easter season."
    },
    "c50": {
        "sourceUrl": "https://www.newadvent.org/cathen/03555a.htm",
        "sourcePreview": "Council of Chalcedon (451 AD) / CCC 467: The Fourth Ecumenical Council defined that Jesus Christ is one divine Person existing in two complete natures, truly divine and truly human, without confusion, change, division, or separation (Hypostatic Union)."
    },
    "c51": {
        "sourceUrl": "https://www.newadvent.org/cathen/15303a.htm",
        "sourcePreview": "Vatican II (1962–1965): Convened by Saint John XXIII and concluded by Saint Paul VI, the 21st Ecumenical Council issued 16 documents guiding the Church's renewal and pastoral engagement in the modern era."
    },
    "c52": {
        "sourceUrl": "https://www.newadvent.org/cathen/06221a.htm",
        "sourcePreview": "Saint Francis of Assisi (1181/1182–1226): Founded the Order of Friars Minor (Franciscans) embracing radical Gospel poverty, peace, and love for God's creation, receiving the Holy Stigmata in 1224."
    },
    "c53": {
        "sourceUrl": "https://www.newadvent.org/cathen/07639c.htm",
        "sourcePreview": "Saint Ignatius of Loyola (1491–1556): Spanish knight who experienced profound conversion, wrote the Spiritual Exercises, and founded the Society of Jesus (Jesuits) with the motto 'Ad Maiorem Dei Gloriam'."
    },
    "c54": {
        "sourceUrl": "https://www.newadvent.org/cathen/02441a.htm",
        "sourcePreview": "Saint Benedict of Nursia (480–548): Regarded as the Father of Western Monasticism, founder of the Abbey of Monte Cassino, author of the Rule of Saint Benedict ('Ora et Labora'), and Patron of Europe."
    },
    "c55": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Corporal_(liturgy)",
        "sourcePreview": "GIRM 117: The corporal (from Latin corpus, 'body') is the square white linen cloth spread upon the altar upon which the paten, chalice, and ciborium rest during the celebration of the Eucharist."
    },
    "c56": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Thurible",
        "sourcePreview": "GIRM 276-277: The thurible (censer) is the metal vessel suspended from chains in which burning charcoal and incense are placed to cense the altar, cross, gifts, Gospel, priest, and congregation."
    },
    "c57": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P1A.HTM",
        "sourcePreview": "Canon 369: A diocese is a portion of the people of God entrusted to a bishop for him to shepherd with the cooperation of the presbyterium, constituting a particular Church in which the Church of Christ is truly present and operative."
    },
    "c58": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Lateran_Treaty",
        "sourcePreview": "Lateran Treaty (1929): Signed between the Holy See and the Kingdom of Italy on February 11, 1929, recognizing full sovereignty of the Holy See and establishing the independent Vatican City State."
    },
    "c59": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Flag_of_Vatican_City",
        "sourcePreview": "Fundamental Law of Vatican City State: The official flag of Vatican City consists of two equal vertical bands of yellow (gold) and white (silver), with the papal tiara and crossed keys of Saint Peter on the white band."
    },
    "c60": {
        "sourceUrl": "https://www.vatican.va/content/john-paul-ii/en/apost_constitutions/documents/hf_jp-ii_apc_22021996_universi-dominici-gregis.html",
        "sourcePreview": "Universi Dominici Gregis (1996): White smoke (fumata bianca) rising from the Sistine Chapel chimney signals to the world that the Cardinal electors have successfully elected a new Bishop of Rome (Pope)."
    },
    "c61": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P12.HTM",
        "sourcePreview": "CCC 194: The Apostles' Creed is so called because it is rightly considered to be a faithful summary of the apostles' faith. It is the ancient baptismal creed of the Church of Rome."
    },
    "c62": {
        "sourceUrl": "https://www.newadvent.org/cathen/02033b.htm",
        "sourcePreview": "Athanasian Creed (Quicumque Vult) / CCC 192: An ancient fifth-century confession of Catholic faith focusing precisely on the dogmatic mysteries of the Holy Trinity and the Incarnation of Christ."
    },
    "c63": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2.HTM",
        "sourcePreview": "Baltimore Catechism Q. 6 / CCC 1: God made man to know Him, to love Him, and to serve Him in this world, and to be happy with Him forever in heaven."
    },
    "c64": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2B.HTM",
        "sourcePreview": "Lumen Gentium 49 / CCC 954: The Communion of Saints unites the three states of the Church: the Church Militant (on earth), the Church Suffering / Expectant (in Purgatory), and the Church Triumphant (in Heaven)."
    },
    "c65": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P6Y.HTM",
        "sourcePreview": "CCC 1999-2000: Sanctifying grace is the gratuitous gift of divine life infused by the Holy Spirit into the soul to heal it of sin and sanctify it, establishing habitual supernatural union with God."
    },
    "c66": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P39.HTM",
        "sourcePreview": "Council of Trent / CCC 1121: The three sacraments that imprint an indelible spiritual seal (character) upon the soul and can never be repeated are Baptism, Confirmation, and Holy Orders."
    },
    "c67": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P6C.HTM",
        "sourcePreview": "CCC 1857: For a sin to be mortal, three conditions must together be met: 'Mortal sin is sin whose object is grave matter and which is also committed with full knowledge and deliberate consent.'"
    },
    "c68": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P1A.HTM",
        "sourcePreview": "Revelation 12:7-9 / CCC 335: Saint Michael the Archangel ('Quis ut Deus?' - 'Who is like God?') led the celestial hosts against Lucifer and the rebellious angels, casting them down from heaven."
    },
    "c69": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P1A.HTM",
        "sourcePreview": "CCC 336 / St. Basil: 'Beside each believer stands an angel as protector and shepherd leading him to life.' From infancy to death human life is surrounded by the watchful care and intercession of Guardian Angels."
    },
    "c70": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P7K.HTM",
        "sourcePreview": "CCC 2157: The Christian begins the day, his prayers, and his activities with the Sign of the Cross: 'In the name of the Father and of the Son and of the Holy Spirit. Amen', invoking Christ's redemption."
    },
    "c71": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P35.HTM",
        "sourcePreview": "Canon 919 §1: One who is to receive the Most Holy Eucharist is to abstain from any food and drink, with the exception only of water and medicine, for at least the period of one hour before Holy Communion."
    },
    "c72": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Paten",
        "sourcePreview": "GIRM 327: The paten is the shallow round plate, traditionally gilded in gold, upon which the host is placed and consecrated during the Holy Sacrifice of the Mass."
    },
    "c73": {
        "sourceUrl": "https://www.newadvent.org/cathen/04390b.htm",
        "sourcePreview": "Bull Transiturus (1264): Pope Urban IV instituted the universal feast of Corpus Christi celebrating the real presence of Jesus Christ in the Eucharist, with liturgies composed by St. Thomas Aquinas."
    },
    "c74": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_en.html",
        "sourcePreview": "Sacrosanctum Concilium 116 / GIRM 41: The Church acknowledges Gregorian chant as specially suited to the Roman liturgy; therefore, other things being equal, it should be given pride of place in liturgical services."
    },
    "c75": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P4N.HTM",
        "sourcePreview": "Canon 1246 §1: Sunday is the day on which the paschal mystery is celebrated in light of the apostolic tradition and is to be observed as the foremost holyday of obligation in the universal Church."
    },
    "c76": {
        "sourceUrl": "https://www.vatican.va/archive/ENG1104/__P4N.HTM",
        "sourcePreview": "Canon 1246: The Solemnity of Mary, the Holy Mother of God (Theotokos) is universally celebrated on January 1st, the octave day of Christmas and a holyday of obligation in the Roman Rite."
    },
    "c77": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Ash_Wednesday",
        "sourcePreview": "Roman Missal (Ash Wednesday): During the imposition of blessed ashes, the minister proclaims: 'Remember that you are dust, and unto dust you shall return' (Gen 3:19) or 'Repent, and believe in the Gospel' (Mark 1:15)."
    },
    "c78": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_en.html",
        "sourcePreview": "Dei Verbum 11 / CCC 105: The Church relies on the faith of the apostolic age, accepting as sacred and canonical the books of the Old and New Testaments, whole and entire, written under the inspiration of the Holy Spirit."
    },
    "c79": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_en.html",
        "sourcePreview": "Dei Verbum 9-10 / CCC 80-84: Sacred Tradition and Sacred Scripture form one sacred deposit of the Word of God (Depositum Fidei), committed to the Church and interpreted faithfully by the living Magisterium."
    },
    "c80": {
        "sourceUrl": "https://www.vatican.va/content/benedict-xv/en/encyclicals/documents/hf_ben-xv_enc_15091920_spiritus-paraclitus.html",
        "sourcePreview": "Spiritus Paraclitus (1920): Pope Benedict XV praised St. Jerome's monastic retirement in Bethlehem, where adjacent to the Cave of the Nativity he produced the Latin Vulgate translation from the original tongues."
    },
    "c81": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P19.HTM",
        "sourcePreview": "CCC 430 / Early Symbolism: The Greek word for fish, ICHTHYS, serves as an acronym for 'Iēsous Christos, Theou Yios, Sōtēr' (Jesus Christ, Son of God, Savior), an ancient secret confession of faith."
    },
    "c82": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P41.HTM",
        "sourcePreview": "GIRM 274 / CCC 1378: A genuflection, made by bending the right knee to the ground, signifies adoration and is reserved for the Most Blessed Sacrament and for the Holy Cross from Good Friday to Easter."
    },
    "c83": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P42.HTM",
        "sourcePreview": "GIRM 314-317 / CCC 1379: The tabernacle is an immovable, opaque, secure, and dignified receptacle in which the Holy Eucharist is reserved for communion of the sick, viaticum, and private adoration."
    },
    "c84": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Sanctuary_lamp",
        "sourcePreview": "GIRM 316: According to traditional usage, an oil lamp or candle with a red glass flame should burn continuously near the tabernacle to indicate and honor the Real Presence of Christ in the reserved Sacrament."
    },
    "c85": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P1I.HTM",
        "sourcePreview": "CCC 533: The Holy Family of Nazareth - Jesus, Mary, and Joseph - is the exemplary model and radiant icon of prayer, purity, mutual charity, and domestic life for all Christian households."
    },
    "c86": {
        "sourceUrl": "https://en.wikipedia.org/wiki/Kiss_of_peace",
        "sourcePreview": "GIRM 82: The Sign of Peace (Pax) follows the Lord's Prayer and the prayer for peace, where the priest and faithful implore peace and unity for the Church before receiving the Holy Eucharist."
    },
    "c87": {
        "sourceUrl": "https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_15051956_haurietis-aquas.html",
        "sourcePreview": "Haurietis Aquas (Pius XII, 1956): Commemorates the private apparitions of Jesus to Saint Margaret Mary Alacoque at Paray-le-Monial, establishing the widespread devotion to the Sacred Heart of Jesus."
    },
    "c88": {
        "sourceUrl": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000430_faustina_en.html",
        "sourcePreview": "Saint Faustina Kowalska: Canonized in 2000 by Pope John Paul II, the Polish nun received revelations recorded in her Diary 'Divine Mercy in My Soul', establishing Divine Mercy Sunday on the Second Sunday of Easter."
    },
    "c89": {
        "sourceUrl": "https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_11121925_quas-primas.html",
        "sourcePreview": "Quas Primas (Pius XI, 1925) / CCC 2105: Promulgated the universal Solemnity of Christ the King, affirming Christ's supreme spiritual and sovereign authority over individual hearts, families, and civil nations."
    },
    "c90": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_en.html",
        "sourcePreview": "Lumen Gentium 10 / CCC 1548: In the ecclesial service of the ordained minister, it is Christ himself who is present to his Church as Head of his Body, Shepherd of his flock, acting 'in persona Christi Capitis'."
    },
    "c91": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_en.html",
        "sourcePreview": "Lumen Gentium 39-42 / CCC 2013: The Universal Call to Holiness teaches that all the faithful of Christ of whatever rank or status are called to the fullness of the Christian life and to the perfection of charity."
    },
    "c92": {
        "sourceUrl": "https://www.newadvent.org/cathen/10115a.htm",
        "sourcePreview": "Miraculous Medal (1830): The Blessed Virgin Mary appeared to Saint Catherine Labouré at the chapel of the Daughters of Charity in Paris, instructing the striking of the medal promising great graces to those who wear it."
    },
    "c93": {
        "sourceUrl": "https://www.vatican.va/content/john-paul-ii/en/homilies/2004/documents/hf_jp-ii_hom_20040815_lourdes.html",
        "sourcePreview": "Our Lady of Lourdes (1858) / CCC 491: In the sixteenth apparition at the Grotto of Massabielle, the Blessed Mother revealed her identity to Saint Bernadette Soubirous in the local dialect: 'Que soy era Immaculada Concepciou' ('I am the Immaculate Conception')."
    },
    "c94": {
        "sourceUrl": "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20000626_message-fatima_en.html",
        "sourcePreview": "The Message of Fatima (CDF, 2000): In 1917, Our Lady appeared six times to three shepherd children—Lúcia dos Santos, Francisco Marto, and Jacinta Marto—at the Cova da Iria in Fátima, Portugal, urging prayer, rosary, and penance."
    },
    "c95": {
        "sourceUrl": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020731_juan-diego_en.html",
        "sourcePreview": "Our Lady of Guadalupe (1531): The Blessed Virgin appeared to Saint Juan Diego Cuauhtlatoatzin on Tepeyac Hill, leaving her miraculous image imprinted on his cactus-fiber tilma (cloak) before Bishop Zumárraga."
    },
    "c96": {
        "sourceUrl": "https://www.newadvent.org/cathen/09018a.htm",
        "sourcePreview": "Fourth Lateran Council (1215): Convoked by Pope Innocent III, the council officially defined the dogmatic term 'Transubstantiation' and decreed the precept of annual sacramental confession and Easter communion."
    },
    "c97": {
        "sourceUrl": "https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html",
        "sourcePreview": "Rerum Novarum (Leo XIII, 1891) / CCC 2420: Foundational charter of modern Catholic Social Teaching, championing the rights of workers to fair wages, dignified labor, and private property against unfettered capitalism and socialism."
    },
    "c98": {
        "sourceUrl": "https://www.newadvent.org/cathen/11554a.htm",
        "sourcePreview": "Saint Patrick of Ireland (c. 385–461): Apostle of Ireland whose Confessio describes his missionary journeys, traditionally famed for utilizing the three leaves of the shamrock to illustrate the Holy Trinity."
    },
    "c99": {
        "sourceUrl": "https://www.newadvent.org/cathen/07644a.htm",
        "sourcePreview": "St. Ignatius of Antioch (c. 110 AD) / CCC 830: In his Epistle to the Smyrnaeans (8:2), Saint Ignatius was the first Christian author to employ the title 'Catholic Church' (Katholike Ekklesia): 'Wherever Jesus Christ is, there is the Catholic Church.'"
    },
    "c100": {
        "sourceUrl": "https://www.vatican.va/archive/ENG0015/__P2F.HTM",
        "sourcePreview": "CCC 915 / Canon 573: The evangelical counsels of poverty, consecrated chastity (celibacy), and obedience are embraced by religious brothers, sisters, and priests as permanent vows dedicated entirely to God."
    },
    "c101": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_en.html",
        "sourcePreview": "Sacrosanctum Concilium 60 / CCC 1667: Sacramentals are sacred signs instituted by the Church, bearing resemblance to the sacraments, which signify effects, especially of a spiritual kind, that are obtained through the Church's intercession."
    },
    "c102": {
        "sourceUrl": "https://www.newadvent.org/cathen/12734a.htm",
        "sourcePreview": "Congregation for the Causes of Saints / CCC 1674: A First-Class Relic consists of the physical body or bodily remains (bones, flesh, hair, blood) of a canonized saint or beatified person."
    },
    "c103": {
        "sourceUrl": "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_en.html",
        "sourcePreview": "Sacrosanctum Concilium 83-101 / CCC 1174: The Liturgy of the Hours (Divine Office / Breviary) is the official public, daily prayer of the Church, sanctifying the course of each day with Psalms, hymns, and scripture readings."
    },
    "c104": {
        "sourceUrl": "https://www.newadvent.org/cathen/01486b.htm",
        "sourcePreview": "Catholic Devotional Tradition: The Angelus is a Marian devotion recited at 6 AM, noon, and 6 PM commemorating the Incarnation of Jesus Christ ('The Angel of the Lord declared unto Mary, and she conceived of the Holy Spirit')."
    },
    "c105": {
        "sourceUrl": "https://www.newadvent.org/cathen/05413a.htm",
        "sourcePreview": "Vatican Magisterium: An encyclical letter (epistola encyclica) is an authoritative circular letter written by the Pope addressed to all the bishops, clergy, and faithful of the Catholic Church worldwide."
    },
    "c106": {
        "sourceUrl": "https://www.newadvent.org/cathen/15515b.htm",
        "sourcePreview": "Clementine Vulgate (1592): Promulgated by Pope Clement VIII following the Council of Trent with the Bull 'Cum Sacrorum', it served as the official and authoritative Latin Bible of the Catholic Church until the 1979 Nova Vulgata."
    }
}

def verify_all():
    print(f"Verifying all {len(TRIVIA_SOURCES)} trivia URLs...")
    urls = [v["sourceUrl"] for v in TRIVIA_SOURCES.values()]
    def check_url(item):
        qid, data = item
        url = data["sourceUrl"]
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "VerbumCaro/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                return qid, url, resp.status
        except Exception as e:
            return qid, url, str(e)

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(check_url, TRIVIA_SOURCES.items()))

    errors = [r for r in results if r[2] != 200]
    print(f"Total verified: {len(results)}, Succeeded: {len(results) - len(errors)}, Errors: {len(errors)}")
    if errors:
        for qid, url, err in errors:
            print(f"FAILED {qid}: {url} -> {err}")
    return len(errors) == 0

if __name__ == "__main__":
    verify_all()
