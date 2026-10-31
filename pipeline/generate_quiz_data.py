# pipeline/generate_quiz_data.py
# Generates 100+ verified multiple choice questions for both Bible Quiz and Catholic Trivia
import json
import os

BIBLE_QUESTIONS = [
    {
        "category": "Gospels & Logos",
        "question": "Which Gospel opens with the foundational declaration: 'In the beginning was the Word, and the Word was with God, and the Word was God'?",
        "options": ["Gospel according to Matthew", "Gospel according to Mark", "Gospel according to Luke", "Gospel according to John"],
        "correctIndex": 3,
        "citation": "John 1:1 (Vulgate: In principio erat Verbum)",
        "explanation": "St. John's prologue presents Christ as the eternal Logos ('Verbum') through whom all creation was made, inspiring the name Verbum Caro."
    },
    {
        "category": "Canon & Deuterocanon",
        "question": "How many canonical books are contained in the Catholic Old Testament, including the deuterocanonical texts?",
        "options": ["39 books", "46 books", "66 books", "73 books"],
        "correctIndex": 1,
        "citation": "Council of Trent (1546), CCC 120",
        "explanation": "The Catholic Old Testament contains 46 books, preserving the 7 deuterocanonical books (Tobit, Judith, 1 & 2 Maccabees, Wisdom, Sirach, Baruch) from the Greek Septuagint."
    },
    {
        "category": "New Testament Epistles",
        "question": "Which Epistle emphasizes the unity of faith and action with the verse: 'So faith also, if it have not works, is dead in itself'?",
        "options": ["Epistle of St. James", "Epistle to the Galatians", "First Epistle to the Corinthians", "Epistle to the Hebrews"],
        "correctIndex": 0,
        "citation": "James 2:17 (Vulgate: sic et fides, si non habeat opera, mortua est in semetipsa)",
        "explanation": "St. James teaches that genuine Christian faith is not merely intellectual assent, but actively lives out charity through righteous works."
    },
    {
        "category": "Infancy Narratives",
        "question": "Who was the devout elder in Jerusalem who took the infant Christ into his arms in the Temple and praised God with the 'Nunc Dimittis'?",
        "options": ["Nicodemus", "Simeon", "Zechariah", "Joseph of Arimathea"],
        "correctIndex": 1,
        "citation": "Luke 2:25-32",
        "explanation": "Simeon had been promised by the Holy Spirit that he would not see death before he had seen the Lord's Messiah: 'Now dismiss thy servant, O Lord, according to thy word in peace.'"
    },
    {
        "category": "Messianic Prophecy",
        "question": "Which prophet spoke the famous oracle: 'Behold, a virgin shall conceive, and bear a son, and his name shall be called Emmanuel'?",
        "options": ["Jeremiah", "Ezekiel", "Isaiah", "Micah"],
        "correctIndex": 2,
        "citation": "Isaiah 7:14 / Matthew 1:23",
        "explanation": "The prophet Isaiah delivered this sign to the House of David, fulfilled in the Virgin Mary and the Incarnation of Jesus Christ."
    },
    {
        "category": "Pentateuch & Covenant",
        "question": "On which holy mountain did Moses receive the Tablets of the Ten Commandments from God?",
        "options": ["Mount Tabor", "Mount Sinai (Horeb)", "Mount Carmel", "Mount of Olives"],
        "correctIndex": 1,
        "citation": "Exodus 19-20; 31:18",
        "explanation": "God made His covenant with the Israelites and handed down the Decalogue to Moses atop Mount Sinai."
    },
    {
        "category": "The Psalms",
        "question": "Which Psalm begins with the beloved verse: 'The Lord is my shepherd: and nothing shall be wanting to me'?",
        "options": ["Psalm 22 (23)", "Psalm 50 (51) - Miserere", "Psalm 90 (91)", "Psalm 129 (130) - De Profundis"],
        "correctIndex": 0,
        "citation": "Psalm 22 in Vulgate / Psalm 23 in Hebrew numbering",
        "explanation": "The pastoral Psalm of David expresses complete filial trust in God's providential care and guidance."
    },
    {
        "category": "Passion & Resurrection",
        "question": "In which garden did Jesus endure His agony in prayer the night before His crucifixion?",
        "options": ["Garden of Eden", "Garden of Gethsemane", "Pool of Siloam", "Valley of Kidron"],
        "correctIndex": 1,
        "citation": "Matthew 26:36; Mark 14:32",
        "explanation": "At Gethsemane on the Mount of Olives, Jesus prayed: 'My Father, if it be possible, let this chalice pass from me. Nevertheless not as I will, but as thou wilt.'"
    },
    {
        "category": "Acts & Early Church",
        "question": "On which feast day was the Holy Spirit poured out upon the Apostles in tongues as of fire?",
        "options": ["Passover", "Pentecost", "Feast of Tabernacles", "Yom Kippur"],
        "correctIndex": 1,
        "citation": "Acts 2:1-4",
        "explanation": "Fifty days after the Resurrection, on the Jewish feast of Pentecost (Shavuot), the Holy Spirit descended, marking the birth of the Church."
    },
    {
        "category": "Vulgate & Scripture",
        "question": "Which early Church Father translated the Hebrew and Greek scriptures into Latin, producing the authoritative Latin Vulgate?",
        "options": ["St. Augustine of Hippo", "St. Jerome", "St. Ambrose of Milan", "St. Gregory the Great"],
        "correctIndex": 1,
        "citation": "Catholic Church History / Council of Trent",
        "explanation": "Commissioned by Pope Damasus I in 382 AD, St. Jerome spent decades in Bethlehem translating the Sacred Scriptures into Latin."
    },
    {
        "category": "Parables of Christ",
        "question": "In the Parable of the Good Samaritan (Luke 10), who was the first person to pass by the wounded traveler without assisting?",
        "options": ["A Levite", "A Priest", "A Roman Centurion", "A Pharisee"],
        "correctIndex": 1,
        "citation": "Luke 10:31-32",
        "explanation": "A priest went down the same way and, seeing him, passed by; then a Levite similarly passed by before the Samaritan showed mercy."
    },
    {
        "category": "Wisdom Literature",
        "question": "Which book of Wisdom begins with the famous passage: 'All things have their season, and in their times all things pass under heaven' ('A time to be born, and a time to die')?",
        "options": ["Proverbs", "Ecclesiastes (Qoheleth)", "Song of Songs", "Book of Wisdom"],
        "correctIndex": 1,
        "citation": "Ecclesiastes 3:1-2 (Vulgate: Omnia tempus habent)",
        "explanation": "Written by Qoheleth, Ecclesiastes reflects on the seasons of human mortality and the sovereignty of God over time."
    },
    {
        "category": "Creation & Origins",
        "question": "What is the first book of the Holy Bible?",
        "options": ["Exodus", "Genesis", "Leviticus", "Psalms"],
        "correctIndex": 1,
        "citation": "Genesis 1:1",
        "explanation": "Genesis recounts the creation of the heavens and the earth, the fall of man, and the patriarchs of the covenant."
    },
    {
        "category": "Creation & Origins",
        "question": "Who were the first man and woman created by God according to the Book of Genesis?",
        "options": ["Abraham and Sarah", "Moses and Zipporah", "Adam and Eve", "Isaac and Rebekah"],
        "correctIndex": 2,
        "citation": "Genesis 2:7, 21-23",
        "explanation": "God formed Adam from the dust of the ground and breathed into him the breath of life, and created Eve as his suitable partner."
    },
    {
        "category": "Patriarchs & Flood",
        "question": "Whom did God command to build an ark of gopher wood to preserve his household and the living creatures from the deluge?",
        "options": ["Noah", "Enoch", "Methuselah", "Melchizedek"],
        "correctIndex": 0,
        "citation": "Genesis 6:13-14",
        "explanation": "Noah was found righteous in his generation and obeyed God in constructing the Ark."
    },
    {
        "category": "Patriarchs & Flood",
        "question": "How long did rain pour upon the earth during the great flood in the days of Noah?",
        "options": ["7 days and nights", "40 days and nights", "100 days and nights", "3 months"],
        "correctIndex": 1,
        "citation": "Genesis 7:12",
        "explanation": "Rain fell upon the earth forty days and forty nights, inaugurating the great flood."
    },
    {
        "category": "Covenant Signs",
        "question": "What celestial sign did God set in the clouds as a perpetual covenant that waters would never again destroy all flesh?",
        "options": ["A pillar of cloud", "A radiant halo", "The Rainbow", "A shooting star"],
        "correctIndex": 2,
        "citation": "Genesis 9:13-16",
        "explanation": "God stated: 'I will set my bow in the clouds, and it shall be the sign of a covenant between me, and between the earth.'"
    },
    {
        "category": "Babel & Dispersion",
        "question": "What city's inhabitants attempted to construct a tower reaching the heavens, resulting in the confusion of human speech?",
        "options": ["Babel", "Nineveh", "Ur of the Chaldees", "Sodom"],
        "correctIndex": 0,
        "citation": "Genesis 11:1-9",
        "explanation": "At the Tower of Babel, human pride sought to make a name for themselves, and the Lord confused their single language."
    },
    {
        "category": "Patriarchs & Covenant",
        "question": "Who answered God's call to leave his fatherland of Ur to become the father of a multitude of nations?",
        "options": ["Lot", "Abraham", "Nahor", "Terah"],
        "correctIndex": 1,
        "citation": "Genesis 12:1-4; 17:5",
        "explanation": "God promised Abraham that in him and his seed all the families of the earth would be blessed."
    },
    {
        "category": "Sacrifice of Isaac",
        "question": "Which beloved son did Abraham bind upon Mount Moriah in faithful obedience to God's testing?",
        "options": ["Ishmael", "Isaac", "Jacob", "Esau"],
        "correctIndex": 1,
        "citation": "Genesis 22:1-14",
        "explanation": "The Akedah (binding of Isaac) prefigures God the Father offering His only-begotten Son on Calvary."
    },
    {
        "category": "Joseph in Egypt",
        "question": "Which son of Jacob was stripped of his tunic of many colors, sold into Egyptian bondage, and later became viceroy of Egypt?",
        "options": ["Reuben", "Judah", "Joseph", "Benjamin"],
        "correctIndex": 2,
        "citation": "Genesis 37:28; 41:40",
        "explanation": "Joseph forgave his brothers, testifying: 'You thought evil against me: but God turned it into good.'"
    },
    {
        "category": "Moses & Calling",
        "question": "Out of what miraculous sign did the Lord speak to Moses on Mount Horeb, commanding him to deliver Israel?",
        "options": ["A cloud of incense", "A burning bush that was not consumed", "A roaring waterfall", "A tablet of sapphire"],
        "correctIndex": 1,
        "citation": "Exodus 3:2-4",
        "explanation": "The Angel of the Lord appeared in a flame of fire out of the midst of a bush that burned without being consumed."
    },
    {
        "category": "The Exodus",
        "question": "How many plagues did God send upon Egypt to compel Pharaoh to release the children of Israel?",
        "options": ["Seven", "Ten", "Twelve", "Forty"],
        "correctIndex": 1,
        "citation": "Exodus 7–12",
        "explanation": "The ten plagues culminated in the tenth plague on the firstborn, initiating the Passover."
    },
    {
        "category": "The Exodus",
        "question": "Which body of water did Moses part with his rod, allowing the Israelites to walk through on dry seabed?",
        "options": ["The River Jordan", "The Sea of Galilee", "The Red Sea", "The Dead Sea"],
        "correctIndex": 2,
        "citation": "Exodus 14:21-22",
        "explanation": "The Lord drove back the sea with a strong east wind all night, creating walls of water on their right and left."
    },
    {
        "category": "Idolatry in Wilderness",
        "question": "What molten idol did Aaron fashion at the demand of the Israelites while Moses was atop Sinai?",
        "options": ["A Golden Calf", "A Bronze Serpent", "A Silver Lion", "A Golden Eagle"],
        "correctIndex": 0,
        "citation": "Exodus 32:4",
        "explanation": "Aaron fashioned a molten calf, prompting Moses to shatter the stone tablets upon descending the mountain."
    },
    {
        "category": "Conquest of Canaan",
        "question": "Who succeeded Moses as commander of Israel and led the twelve tribes across the Jordan into the Promised Land?",
        "options": ["Caleb", "Joshua", "Phinehas", "Eleazar"],
        "correctIndex": 1,
        "citation": "Joshua 1:1-3",
        "explanation": "God charged Joshua: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee.'"
    },
    {
        "category": "Conquest of Canaan",
        "question": "Which fortified Canaanite city had its walls collapse after the Israelites marched around it for seven days blowing ram's horns?",
        "options": ["Jericho", "Ai", "Gibeon", "Hazor"],
        "correctIndex": 0,
        "citation": "Joshua 6:20",
        "explanation": "On the seventh day, after seven circuits, the priests blew trumpets, the people shouted, and the walls fell flat."
    },
    {
        "category": "Judges of Israel",
        "question": "Which prophetess and judge of Israel sat under a palm tree in Ephraim and inspired Barak to overthrow Sisera?",
        "options": ["Ruth", "Deborah", "Jael", "Hannah"],
        "correctIndex": 1,
        "citation": "Judges 4:4-9",
        "explanation": "Deborah judged Israel at that time and accompanied the army of Mount Tabor to victory."
    },
    {
        "category": "Judges of Israel",
        "question": "Which judge of Israel possessed extraordinary supernatural strength bound to his consecrated Nazirite locks?",
        "options": ["Gideon", "Jephthah", "Samson", "Othniel"],
        "correctIndex": 2,
        "citation": "Judges 13:5; 16:17",
        "explanation": "Samson was consecrated to God as a Nazirite from the womb; no razor had ever touched his head."
    },
    {
        "category": "Judges of Israel",
        "question": "Who enticed Samson into revealing that his strength lay in his uncut hair, delivering him to the Philistines?",
        "options": ["Delilah", "Jezebel", "Athaliah", "Michal"],
        "correctIndex": 0,
        "citation": "Judges 16:4-19",
        "explanation": "Delilah coaxed Samson into confiding his secret and called a man to shave off the seven locks of his head."
    },
    {
        "category": "Old Testament Figures",
        "question": "Which Moabite widow demonstrated profound devotion to her mother-in-law Naomi, proclaiming: 'Thy people shall be my people, and thy God my God'?",
        "options": ["Orpah", "Ruth", "Tamar", "Rahab"],
        "correctIndex": 1,
        "citation": "Ruth 1:16",
        "explanation": "Ruth married Boaz in Bethlehem and became the great-grandmother of King David, included in Christ's genealogy."
    },
    {
        "category": "Prophets & Samuel",
        "question": "Which young boy ministering before the High Priest Eli in Shiloh responded to God's nighttime voice: 'Speak, Lord; for thy servant heareth'?",
        "options": ["Samuel", "Nathan", "David", "Solomon"],
        "correctIndex": 0,
        "citation": "1 Samuel 3:9-10",
        "explanation": "The Lord revealed Himself to Samuel in Shiloh, establishing him as an accredited prophet to all Israel."
    },
    {
        "category": "Monarchy of Israel",
        "question": "Who was anointed by Samuel as the very first earthly king over the united tribes of Israel?",
        "options": ["Saul of Benjamin", "David of Judah", "Solomon", "Jeroboam"],
        "correctIndex": 0,
        "citation": "1 Samuel 10:1",
        "explanation": "Samuel took a vial of oil and poured it upon Saul's head, anointing him as captain over the Lord's inheritance."
    },
    {
        "category": "David & Goliath",
        "question": "What Philistine giant from Gath did the young shepherd David strike down with a single sling stone?",
        "options": ["Og", "Sihon", "Goliath", "Ishbibenob"],
        "correctIndex": 2,
        "citation": "1 Samuel 17:49-50",
        "explanation": "David confronted Goliath in the name of the Lord of Hosts, striking his forehead with a smooth brook stone."
    },
    {
        "category": "Monarchy of Israel",
        "question": "Which king of Israel established Jerusalem as his royal capital, composed numerous Psalms, and received God's eternal covenant promise?",
        "options": ["King Saul", "King David", "King Solomon", "King Hezekiah"],
        "correctIndex": 1,
        "citation": "2 Samuel 7:12-16",
        "explanation": "God promised David that his royal throne would be established forever, fulfilled eternally in Jesus the Son of David."
    },
    {
        "category": "Wisdom & Temple",
        "question": "Which son of David was gifted with unparalleled divine wisdom and erected the first Temple of the Lord in Jerusalem?",
        "options": ["Solomon", "Absalom", "Adonijah", "Rehoboam"],
        "correctIndex": 0,
        "citation": "1 Kings 3:12; 6:1",
        "explanation": "King Solomon asked God for an understanding heart to judge the people, and constructed the magnificent Temple on Mount Moriah."
    },
    {
        "category": "Elijah the Prophet",
        "question": "Which prophet challenged 450 prophets of Baal to a contest of fire on Mount Carmel, calling down divine fire from heaven?",
        "options": ["Elisha", "Elijah", "Isaiah", "Jeremiah"],
        "correctIndex": 1,
        "citation": "1 Kings 18:36-38",
        "explanation": "The fire of the Lord fell, consuming Elijah's sacrifice, wood, stones, and water in the trench."
    },
    {
        "category": "Elijah the Prophet",
        "question": "How was the prophet Elijah bodily assumed into the heavens in the presence of his disciple Elisha?",
        "options": ["In an earthquake", "In a whirlwind with a chariot and horses of fire", "On an eagle's wings", "In a pillar of smoke"],
        "correctIndex": 1,
        "citation": "2 Kings 2:11",
        "explanation": "A chariot of fire and horses of fire parted them asunder, and Elijah went up by a whirlwind into heaven."
    },
    {
        "category": "Elisha the Prophet",
        "question": "Which Syrian military commander was cured of leprosy after Elisha told him to wash seven times in the Jordan River?",
        "options": ["Hazael", "Naaman", "Benhadad", "Sennacherib"],
        "correctIndex": 1,
        "citation": "2 Kings 5:14",
        "explanation": "Naaman dipped seven times in the Jordan, and his flesh was restored like that of a little child."
    },
    {
        "category": "Babylonian Exile",
        "question": "Which righteous Hebrew youth in Babylon interpreted Nebuchadnezzar's dreams and survived unhurt in a den of hungry lions?",
        "options": ["Daniel", "Ezekiel", "Ezra", "Nehemiah"],
        "correctIndex": 0,
        "citation": "Daniel 6:22",
        "explanation": "Daniel testified to King Darius: 'My God hath sent his angel, and hath shut up the mouths of the lions.'"
    },
    {
        "category": "Babylonian Exile",
        "question": "What were the Hebrew names of the three youths who were cast into the fiery furnace for refusing to worship the golden colossus?",
        "options": ["Shadrach, Meshach, and Abednego (Hananiah, Mishael, Azariah)", "Shem, Ham, and Japheth", "Peter, James, and John", "Elihu, Eliphaz, and Zophar"],
        "correctIndex": 0,
        "citation": "Daniel 3:19-25",
        "explanation": "King Nebuchadnezzar beheld a fourth figure walking with them unbound in the furnace, having the appearance of a son of God."
    },
    {
        "category": "Minor Prophets",
        "question": "Which reluctant prophet fled towards Tarshish on a ship, was swallowed by a great sea monster, and preached repentance to Nineveh?",
        "options": ["Jonah", "Amos", "Hosea", "Micah"],
        "correctIndex": 0,
        "citation": "Jonah 1:17; 3:4",
        "explanation": "Jesus cited the 'sign of Jonah'—three days and nights in the whale's belly—as a typology for His resurrection."
    },
    {
        "category": "The Nativity",
        "question": "In which Judean city of David was Jesus Christ born in a manger, as foretold by the prophet Micah?",
        "options": ["Nazareth", "Jerusalem", "Bethlehem", "Capernaum"],
        "correctIndex": 2,
        "citation": "Micah 5:2 / Luke 2:4-7",
        "explanation": "Joseph and Mary journeyed to Bethlehem Ephrathah, the ancestral city of David, where Mary gave birth to Jesus."
    },
    {
        "category": "The Annunciation",
        "question": "Which archangel was dispatched by God to Nazareth to announce the Incarnation to the Blessed Virgin Mary?",
        "options": ["St. Michael", "St. Gabriel", "St. Raphael", "St. Uriel"],
        "correctIndex": 1,
        "citation": "Luke 1:26-28",
        "explanation": "Gabriel greeted Mary: 'Hail, full of grace, the Lord is with thee: blessed art thou among women.'"
    },
    {
        "category": "John the Baptist",
        "question": "Who lived in the wilderness clothed in camel's hair, baptizing with water and heralding: 'Behold the Lamb of God'?",
        "options": ["Simon Peter", "John the Baptist", "Stephen the Deacon", "Barnabas"],
        "correctIndex": 1,
        "citation": "John 1:29; Matthew 3:1-4",
        "explanation": "John the Baptist was the voice crying in the wilderness to prepare the way of the Lord."
    },
    {
        "category": "Miracles of Christ",
        "question": "At which Galilean wedding feast did Jesus perform His first public miracle at the intercession of His Mother?",
        "options": ["Cana of Galilee", "Bethsaida", "Nain", "Emmaus"],
        "correctIndex": 0,
        "citation": "John 2:1-11",
        "explanation": "At Mary's word ('Do whatever he tells you'), Jesus transformed six stone water jars of water into choice wine."
    },
    {
        "category": "The Apostles",
        "question": "How many Apostles did Jesus specially choose and commission to be the foundations of His Church?",
        "options": ["Seven", "Ten", "Twelve", "Seventy"],
        "correctIndex": 2,
        "citation": "Matthew 10:1-4; Luke 6:13",
        "explanation": "The Twelve Apostles correspond typologically to the twelve patriarchs of the twelve tribes of Israel."
    },
    {
        "category": "Primacy of Peter",
        "question": "To which Apostle did Jesus say at Caesarea Philippi: 'Thou art Peter; and upon this rock I will build my church'?",
        "options": ["Andrew", "Simon Peter", "John", "James"],
        "correctIndex": 1,
        "citation": "Matthew 16:18-19",
        "explanation": "Christ gave Peter the Keys of the Kingdom of Heaven and the power to bind and loose on earth."
    },
    {
        "category": "The Passion",
        "question": "Which Apostle betrayed Jesus to the chief priests for thirty pieces of silver in the Garden of Gethsemane?",
        "options": ["Thomas", "Judas Iscariot", "Philip", "Bartholomew"],
        "correctIndex": 1,
        "citation": "Matthew 26:14-16, 48-49",
        "explanation": "Judas betrayed the Lord with a kiss in Gethsemane, fulfilling Zechariah's prophecy regarding the thirty pieces of silver."
    },
    {
        "category": "The Passion",
        "question": "How many times did Simon Peter deny knowing Jesus in the High Priest's courtyard before the cock crew?",
        "options": ["Once", "Twice", "Three times", "Seven times"],
        "correctIndex": 2,
        "citation": "Luke 22:60-62",
        "explanation": "Peter denied Him thrice; immediately the cock crew, the Lord turned and looked at Peter, and Peter wept bitterly."
    },
    {
        "category": "The Crucifixion",
        "question": "What Roman procurator of Judea sentenced Jesus to be scourged and crucified after washing his own hands?",
        "options": ["Pontius Pilate", "Felix", "Festus", "Herod Antipas"],
        "correctIndex": 0,
        "citation": "Matthew 27:24-26",
        "explanation": "Pilate took water and washed his hands before the crowd, saying: 'I am innocent of the blood of this just person.'"
    },
    {
        "category": "The Crucifixion",
        "question": "What is the name of the skull-shaped hill outside Jerusalem where Jesus was crucified between two thieves?",
        "options": ["Mount of Olives", "Golgotha (Calvary)", "Mount Zion", "Mount Moriah"],
        "correctIndex": 1,
        "citation": "John 19:17; Luke 23:33",
        "explanation": "Golgotha (Aramaic for 'the place of a skull', Latin: Calvaria) was the site of the holy cross."
    },
    {
        "category": "The Resurrection",
        "question": "Who was the first person to encounter the risen Lord outside the empty garden tomb on Easter morning?",
        "options": ["Mary the mother of James", "Mary Magdalene", "Joanna", "Salome"],
        "correctIndex": 1,
        "citation": "John 20:14-16; Mark 16:9",
        "explanation": "The Risen Jesus appeared first to Mary Magdalene, commissioning her as the 'apostle to the apostles'."
    },
    {
        "category": "The Resurrection",
        "question": "Which Apostle doubted the Resurrection until Jesus invited him to put his finger into His nail-prints and side?",
        "options": ["Thomas (Didymus)", "Nathanael", "Matthew", "Thaddaeus"],
        "correctIndex": 0,
        "citation": "John 20:27-28",
        "explanation": "Thomas exclaimed the great confession of divinity: 'My Lord and my God!' (Dominus meus et Deus meus)."
    },
    {
        "category": "Early Church Martyrs",
        "question": "Who is honored in the Acts of the Apostles as the first Christian martyr (protomartyr), stoned while praying for his killers?",
        "options": ["St. Stephen", "St. James the Greater", "St. Barnabas", "St. Timothy"],
        "correctIndex": 0,
        "citation": "Acts 7:58-60",
        "explanation": "Stephen, filled with the Holy Spirit, looked steadfastly into heaven, saw the glory of God, and prayed: 'Lord, lay not this sin to their charge.'"
    },
    {
        "category": "Apostle to the Gentiles",
        "question": "On the road to which Syrian city was the persecutor Saul blinded by a blazing light from heaven and converted by the Risen Christ?",
        "options": ["Antioch", "Damascus", "Tarsus", "Jericho"],
        "correctIndex": 1,
        "citation": "Acts 9:3-6",
        "explanation": "Jesus called out: 'Saul, Saul, why persecutest thou me?' He was baptized by Ananias in Damascus and became St. Paul."
    },
    {
        "category": "New Testament Canon",
        "question": "How many total books are in the canonical New Testament accepted by the Church?",
        "options": ["24 books", "27 books", "39 books", "46 books"],
        "correctIndex": 1,
        "citation": "Council of Rome (382), Council of Trent (1546), CCC 120",
        "explanation": "The New Testament canon comprises 27 books: four Gospels, Acts, fourteen Pauline Epistles (with Hebrews), seven Catholic Epistles, and Revelation."
    },
    {
        "category": "Apocalypse / Revelation",
        "question": "Which Apostle authored the Book of Revelation (Apocalypse) while exiled on the Greek island of Patmos?",
        "options": ["St. Peter", "St. Paul", "St. John the Evangelist", "St. Jude"],
        "correctIndex": 2,
        "citation": "Revelation 1:1, 9",
        "explanation": "St. John was in the island called Patmos for the word of God, where he received the prophetic visions of the heavenly liturgy and New Jerusalem."
    },
    {
        "category": "Gospel Authors",
        "question": "Which two Evangelists were members of the original Twelve Apostles chosen by Jesus?",
        "options": ["Mark and Luke", "Matthew and John", "Peter and Paul", "James and Jude"],
        "correctIndex": 1,
        "citation": "Matthew 9:9; John 21:24",
        "explanation": "St. Matthew (Levi the tax collector) and St. John (the beloved disciple) were eyewitness Apostles."
    },
    {
        "category": "Sermon on the Mount",
        "question": "Which famous Gospel discourse (Matthew 5–7) opens with the Eight Beatitudes: 'Blessed are the poor in spirit'?",
        "options": ["The Sermon on the Plain", "The Sermon on the Mount", "The Olivet Discourse", "The Upper Room Discourse"],
        "correctIndex": 1,
        "citation": "Matthew 5:1-12",
        "explanation": "In the Sermon on the Mount, Christ promulgates the New Law of interior righteousness and divine beatitude."
    },
    {
        "category": "The Golden Rule",
        "question": "What did Jesus declare in Matthew 7:12: 'All things therefore whatsoever you would that men should do to you, do you also to them'?",
        "options": ["The Lex Talionis", "The Golden Rule", "The Deuteronomic Blessing", "The Priestly Benediction"],
        "correctIndex": 1,
        "citation": "Matthew 7:12",
        "explanation": "Jesus designated this ethical precept as the summation of the Law and the Prophets."
    },
    {
        "category": "Greatest Commandment",
        "question": "When asked which is the great commandment in the Law, what did Jesus cite first?",
        "options": ["Thou shalt honor thy father and mother", "Thou shalt love the Lord thy God with thy whole heart, soul, and mind", "Thou shalt keep the Sabbath holy", "Thou shalt not kill"],
        "correctIndex": 1,
        "citation": "Matthew 22:37-38 / Deuteronomy 6:5",
        "explanation": "Jesus answered with the Shema from Deuteronomy: to love God with all one's heart, soul, and mind; the second is like it: to love one's neighbor as oneself."
    },
    {
        "category": "Armor of God",
        "question": "In Ephesians 6, St. Paul describes the spiritual Armor of God. What is identified as the 'Sword of the Spirit'?",
        "options": ["The Virtue of Charity", "The Word of God", "The Rosary", "The Cross"],
        "correctIndex": 1,
        "citation": "Ephesians 6:17",
        "explanation": "St. Paul writes: 'And take unto you the helmet of salvation, and the sword of the Spirit (which is the word of God).'"
    },
    {
        "category": "Theological Virtues in Scripture",
        "question": "In 1 Corinthians 13:13, which three virtues remain, and which one does St. Paul declare is the greatest?",
        "options": ["Faith, Hope, and Charity; the greatest is Charity (Love)", "Justice, Wisdom, and Peace; the greatest is Peace", "Humility, Patience, and Faith; the greatest is Faith", "Prudence, Fortitude, and Temperance; the greatest is Fortitude"],
        "correctIndex": 0,
        "citation": "1 Corinthians 13:13",
        "explanation": "'And now there remain faith, hope, and charity, these three: but the greatest of these is charity.' Faith and hope pass away in heaven, but love endures eternally."
    },
    {
        "category": "Fruits of the Spirit",
        "question": "In Galatians 5:22-23, what are listed as fruits of the Holy Spirit?",
        "options": ["Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control", "Wealth, honor, longevity, power, victory", "Prophecy, tongues, miracles, interpretation", "Law, judgment, vengeance, retribution"],
        "correctIndex": 0,
        "citation": "Galatians 5:22-23; CCC 1832",
        "explanation": "The fruits of the Spirit are perfections that the Holy Spirit forms in us as the first fruits of eternal glory."
    },
    {
        "category": "Feeding the Multitude",
        "question": "With what meager provision did Jesus miraculously feed the five thousand men beside the Sea of Galilee?",
        "options": ["Seven loaves and a few small fish", "Five barley loaves and two fish", "Three loaves of wheat and oil", "A bowl of lentils and figs"],
        "correctIndex": 1,
        "citation": "John 6:9; Matthew 14:17-21",
        "explanation": "A young boy had five barley loaves and two fishes; Jesus blessed them, broke them, and twelve baskets of fragments were gathered."
    },
    {
        "category": "The Transfiguration",
        "question": "Which two Old Testament figures appeared in radiant glory conversing with Jesus on the Mount of Transfiguration?",
        "options": ["Abraham and David", "Moses and Elijah", "Enoch and Noah", "Isaiah and Jeremiah"],
        "correctIndex": 1,
        "citation": "Matthew 17:3; Luke 9:30-31",
        "explanation": "Moses (representing the Law) and Elijah (representing the Prophets) appeared speaking of His departure (exodus) in Jerusalem."
    },
    {
        "category": "The Good Shepherd",
        "question": "In John 10, what title does Jesus bestow upon Himself, contrasting with the hireling who flees when the wolf attacks?",
        "options": ["The True Vine", "The Good Shepherd", "The Light of the World", "The Door of the Sheep"],
        "correctIndex": 1,
        "citation": "John 10:11",
        "explanation": "'I am the good shepherd. The good shepherd giveth his life for his sheep.'"
    },
    {
        "category": "Eucharistic Discourse",
        "question": "In the Bread of Life discourse (John 6), what solemn declaration does Christ make regarding His flesh?",
        "options": ["My flesh is meat indeed: and my blood is drink indeed", "My flesh is merely a symbol of brotherhood", "My flesh shall be remembered in spirit only", "My flesh is like manna that perished in the desert"],
        "correctIndex": 0,
        "citation": "John 6:55-56",
        "explanation": "'He that eateth my flesh, and drinketh my blood, abideth in me, and I in him.'"
    },
    {
        "category": "The Lord's Prayer",
        "question": "In which Gospel does Jesus teach His disciples the 'Our Father' (Pater Noster) during the Sermon on the Mount?",
        "options": ["Gospel of Matthew", "Gospel of Mark", "Gospel of John", "Book of Acts"],
        "correctIndex": 0,
        "citation": "Matthew 6:9-13; Luke 11:2-4",
        "explanation": "The Lord's Prayer is the quintessential Christian prayer taught by the Master Himself."
    },
    {
        "category": "Holy Thursday",
        "question": "What humble act of servanthood did Jesus perform for His disciples before instituting the Eucharist at the Last Supper?",
        "options": ["He crowned them with olive wreaths", "He washed their feet", "He anointed their heads with nard", "He bestowed golden garments upon them"],
        "correctIndex": 1,
        "citation": "John 13:4-15",
        "explanation": "Jesus poured water into a basin and washed the disciples' feet, commanding them to do as He had done."
    },
    {
        "category": "The Ascension",
        "question": "From which mount near Jerusalem did the Risen Lord ascend into heaven forty days after His resurrection?",
        "options": ["Mount of Olives", "Mount Carmel", "Mount Tabor", "Mount Hermon"],
        "correctIndex": 0,
        "citation": "Acts 1:9-12",
        "explanation": "He was taken up in a cloud from the Mount of Olives while the Apostles watched, and two angels promised His return in like manner."
    },
    {
        "category": "Zacchaeus the Tax Collector",
        "question": "What kind of tree did the short tax collector Zacchaeus climb in Jericho in order to see Jesus pass by?",
        "options": ["A Cedar of Lebanon", "A Sycamore-fig tree", "An Olive tree", "A Date palm"],
        "correctIndex": 1,
        "citation": "Luke 19:4",
        "explanation": "Zacchaeus ran before and climbed up into a sycamore tree to see Him, and Jesus lodged at his home that day."
    },
    {
        "category": "Raising of Lazarus",
        "question": "For how many days had Lazarus of Bethany been buried in the tomb before Jesus cried out: 'Lazarus, come forth'?",
        "options": ["One day", "Two days", "Four days", "Seven days"],
        "correctIndex": 2,
        "citation": "John 11:17, 39, 43",
        "explanation": "Martha noted that he had been in the tomb four days, yet Jesus commanded the stone rolled away and raised him to life."
    },
    {
        "category": "Prodigal Son",
        "question": "In the Parable of the Prodigal Son (Luke 15), what did the compassionate father order his servants to bring for the returning younger son?",
        "options": ["A whip for chastisement", "The best robe, a ring on his hand, and shoes on his feet", "A bag of coins to repay the debt", "A beggar's tunic"],
        "correctIndex": 1,
        "citation": "Luke 15:22-23",
        "explanation": "The father welcomed his repentant son with the best robe, a signet ring, sandals, and killed the fatted calf for celebration."
    },
    {
        "category": "The Lost Sheep",
        "question": "In the Parable of the Lost Sheep, how many sheep did the shepherd leave in the wilderness to search for the single one that went astray?",
        "options": ["Twelve", "Fifty", "Ninety-nine", "Four hundred"],
        "correctIndex": 2,
        "citation": "Luke 15:4",
        "explanation": "The shepherd leaves the ninety-nine in the desert and goes after the one that was lost until he finds it."
    },
    {
        "category": "Nicodemus by Night",
        "question": "To which Pharisee and ruler of the Jews did Jesus say: 'Amen, amen I say to thee, unless a man be born again of water and the Holy Ghost, he cannot enter into the kingdom of God'?",
        "options": ["Gamaliel", "Nicodemus", "Caiaphas", "Jairus"],
        "correctIndex": 1,
        "citation": "John 3:1-5",
        "explanation": "Nicodemus came to Jesus by night, and Jesus revealed the necessity of spiritual regeneration through Baptism."
    },
    {
        "category": "The Great Commission",
        "question": "In the Great Commission (Matthew 28:19), in whose Name did the Risen Christ command His Apostles to baptize all nations?",
        "options": ["In the name of Jesus only", "In the name of the Father, and of the Son, and of the Holy Ghost", "In the name of Abraham and Moses", "In the name of the Holy Catholic Church"],
        "correctIndex": 1,
        "citation": "Matthew 28:19",
        "explanation": "'Going therefore, teach ye all nations; baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.'"
    },
    {
        "category": "Samaritan Woman at the Well",
        "question": "At whose ancestral well in Sychar did Jesus converse with the Samaritan woman, offering her 'living water'?",
        "options": ["Abraham's Well", "Jacob's Well", "Isaac's Well", "Moses' Well"],
        "correctIndex": 1,
        "citation": "John 4:5-14",
        "explanation": "Jacob's well was there; Jesus, tired from his journey, sat by the well and revealed Himself as the Messiah."
    },
    {
        "category": "Walking on Water",
        "question": "Which Apostle climbed out of the fishing boat to walk on the stormy waves of the Sea of Galilee toward Jesus?",
        "options": ["John", "Simon Peter", "Andrew", "James"],
        "correctIndex": 1,
        "citation": "Matthew 14:28-31",
        "explanation": "Peter walked on the water, but seeing the wind strong, became afraid and began to sink, crying: 'Lord, save me!'"
    },
    {
        "category": "The Transfiguration Witnesses",
        "question": "Which three Apostles accompanied Jesus to witness His Transfiguration and later His Agony in Gethsemane?",
        "options": ["Peter, James, and John", "Andrew, Philip, and Bartholomew", "Matthew, Thomas, and Simon", "Jude, James the Less, and Matthias"],
        "correctIndex": 0,
        "citation": "Matthew 17:1; Mark 14:33",
        "explanation": "Peter, James, and John formed the intimate inner circle of the Apostles chosen to witness Christ's greatest glories and trials."
    },
    {
        "category": "Paul's Shipwreck",
        "question": "On which Mediterranean island was St. Paul shipwrecked while being transported under Roman guard to appeal to Caesar?",
        "options": ["Crete", "Cyprus", "Malta (Melita)", "Sicily"],
        "correctIndex": 2,
        "citation": "Acts 28:1",
        "explanation": "All 276 passengers escaped safely to shore on Malta, where Paul shook off a venomous viper without harm."
    },
    {
        "category": "Old Testament Judges",
        "question": "Which judge of Israel reduced his army from thirty-two thousand men down to three hundred who lapped water with their tongues?",
        "options": ["Gideon", "Barak", "Jephthah", "Ehud"],
        "correctIndex": 0,
        "citation": "Judges 7:4-7",
        "explanation": "The Lord told Gideon that with the three hundred men who lapped water he would deliver Midian, proving that salvation belongs to God."
    },
    {
        "category": "Queen Esther",
        "question": "Which Jewish queen risked her life before Persian King Ahasuerus to thwart Haman's plot to exterminate her people?",
        "options": ["Queen Esther (Hadassah)", "Queen Vashti", "Queen Jezebel", "Queen of Sheba"],
        "correctIndex": 0,
        "citation": "Esther 4:16; 7:3",
        "explanation": "Esther fasted three days and approached the king, declaring: 'If I perish, I perish', rescuing her people and establishing Purim."
    },
    {
        "category": "The Prophet Isaiah",
        "question": "Which major prophet beheld the Lord high and lifted up, while Seraphim cried 'Holy, Holy, Holy' (Sanctus)?",
        "options": ["Isaiah", "Jeremiah", "Ezekiel", "Daniel"],
        "correctIndex": 0,
        "citation": "Isaiah 6:1-3",
        "explanation": "Isaiah saw the Lord seated upon a throne, and a Seraph touched his mouth with a live coal, purging his iniquity."
    },
    {
        "category": "Suffering Servant",
        "question": "In which chapter of Isaiah is the Messiah foretold as the Suffering Servant who 'was wounded for our iniquities, bruised for our sins'?",
        "options": ["Isaiah 7", "Isaiah 9", "Isaiah 40", "Isaiah 53"],
        "correctIndex": 3,
        "citation": "Isaiah 53:5",
        "explanation": "Isaiah 53 provides the profound prophecy of the Passion of Christ, led like a lamb to the slaughter."
    },
    {
        "category": "Book of Job",
        "question": "Which righteous man from the land of Uz endured the loss of his children, wealth, and health yet declared: 'The Lord gave, and the Lord hath taken away; blessed be the name of the Lord'?",
        "options": ["Job", "Tobit", "Enoch", "Lot"],
        "correctIndex": 0,
        "citation": "Job 1:21",
        "explanation": "Job maintained his integrity and faith in the Redeemer: 'I know that my Redeemer liveth, and in the last day I shall rise out of the earth.'"
    },
    {
        "category": "Deuterocanonical Books",
        "question": "Which deuterocanonical book describes the young man Tobias guided on his perilous journey by the Archangel Raphael?",
        "options": ["Book of Judith", "Book of Tobit", "First Maccabees", "Book of Wisdom"],
        "correctIndex": 1,
        "citation": "Tobit 5:4; 12:15",
        "explanation": "The Archangel Raphael revealed himself: 'I am the angel Raphael, one of the seven, who stand before the Lord.'"
    },
    {
        "category": "Maccabees & Hanukkah",
        "question": "Which books of the Catholic Old Testament recount the heroic revolt led by Judas Maccabeus against Antiochus IV Epiphanes to rededicate the Temple?",
        "options": ["First and Second Maccabees", "First and Second Chronicles", "First and Second Kings", "Ezra and Nehemiah"],
        "correctIndex": 0,
        "citation": "1 Maccabees 4:36-59",
        "explanation": "The Maccabees cleansed the sanctuary and instituted the eight-day Feast of the Dedication of the Altar."
    },
    {
        "category": "Prayer for the Dead",
        "question": "In 2 Maccabees 12:46, what salutary practice is affirmed as holy and wholesome?",
        "options": ["Praying and making atonement for the dead that they may be loosed from their sins", "Building monuments for fallen generals", "Offering sacrifices to foreign deities", "Fasting during military campaigns"],
        "correctIndex": 0,
        "citation": "2 Maccabees 12:46; CCC 1032",
        "explanation": "'It is therefore a holy and wholesome thought to pray for the dead, that they may be loosed from sins'—a foundational scriptural support for Purgatory."
    },
    {
        "category": "Judith & Holofernes",
        "question": "Which courageous Jewish widow decapitated the Assyrian general Holofernes in his tent, delivering Bethulia and all Israel?",
        "options": ["Judith", "Esther", "Jael", "Deborah"],
        "correctIndex": 0,
        "citation": "Judith 13:6-10",
        "explanation": "Judith prayed for divine strength, struck Holofernes twice on his neck, and carried his head back to Bethulia."
    },
    {
        "category": "The Synoptic Gospels",
        "question": "Which three Gospels are known as the 'Synoptic Gospels' due to their shared perspective and common outline of Christ's ministry?",
        "options": ["Matthew, Mark, and Luke", "Matthew, Luke, and John", "Mark, Luke, and John", "Matthew, Mark, and John"],
        "correctIndex": 0,
        "citation": "Biblical Studies / Dei Verbum 18",
        "explanation": "Matthew, Mark, and Luke can be viewed 'with one eye' (synoptic) because of their chronological and narrative parallels."
    },
    {
        "category": "St. Luke the Physician",
        "question": "Which Evangelist, companion of St. Paul and physician by trade, also authored the Book of the Acts of the Apostles?",
        "options": ["St. Matthew", "St. Mark", "St. Luke", "St. Barnabas"],
        "correctIndex": 2,
        "citation": "Colossians 4:14; Acts 1:1",
        "explanation": "St. Luke ('the beloved physician') addressed both his Gospel and the Acts of the Apostles to the honorable Theophilus."
    },
    {
        "category": "The Good Thief",
        "question": "What did the penitent thief (St. Dismas) say to Jesus on the cross, receiving the promise: 'This day thou shalt be with me in paradise'?",
        "options": ["Lord, remember me when thou shalt come into thy kingdom", "If thou be the Christ, save thyself and us", "Master, tell my brother to divide the inheritance", "Have mercy on me, a poor sinner from Galilee"],
        "correctIndex": 0,
        "citation": "Luke 23:42-43",
        "explanation": "Dismas rebuked the other criminal, confessed Jesus' innocence, and asked to be remembered in His Kingdom."
    },
    {
        "category": "St. Joseph",
        "question": "From which royal lineage and house was St. Joseph, the chaste spouse of the Blessed Virgin Mary and foster father of Jesus?",
        "options": ["The House of Levi", "The House of David", "The House of Benjamin", "The House of Ephraim"],
        "correctIndex": 1,
        "citation": "Matthew 1:20; Luke 1:27",
        "explanation": "The angel of the Lord appeared to Joseph in a dream, saying: 'Joseph, son of David, fear not to take unto thee Mary thy wife.'"
    },
    {
        "category": "The Visitation",
        "question": "Who leaped with joy in the womb of St. Elizabeth when the pregnant Virgin Mary greeted her at the Visitation?",
        "options": ["John the Baptist", "James the Greater", "Simon of Cyrene", "Timothy"],
        "correctIndex": 0,
        "citation": "Luke 1:41",
        "explanation": "Elizabeth exclaimed: 'For behold as soon as the voice of thy salutation sounded in my ears, the infant in my womb leaped for joy.'"
    },
    {
        "category": "The Magnificat",
        "question": "Which majestic canticle did the Virgin Mary proclaim at the home of Elizabeth, opening: 'My soul doth magnify the Lord'?",
        "options": ["The Benedictus", "The Magnificat", "The Nunc Dimittis", "The Te Deum"],
        "correctIndex": 1,
        "citation": "Luke 1:46-55 (Vulgate: Magnificat anima mea Dominum)",
        "explanation": "The Magnificat is Mary's song of thanksgiving praising God for exalting the humble and scattering the proud."
    },
    {
        "category": "The Benedictus",
        "question": "Which elder priest and father of John the Baptist had his speech restored and proclaimed the 'Benedictus' canticle?",
        "options": ["Zechariah", "Simeon", "Caiaphas", "Annas"],
        "correctIndex": 0,
        "citation": "Luke 1:67-79",
        "explanation": "Zechariah wrote 'John is his name', his tongue was loosed, and he prophesied: 'Blessed be the Lord God of Israel; because he hath visited and wrought the redemption of his people.'"
    },
    {
        "category": "St. Paul's Epistles",
        "question": "In which Epistle did St. Paul write the celebrated Christological hymn describing Christ emptying Himself ('Kenosis') and taking the form of a servant?",
        "options": ["Epistle to the Romans", "Epistle to the Philippians", "First Epistle to Timothy", "Epistle to Titus"],
        "correctIndex": 1,
        "citation": "Philippians 2:5-11",
        "explanation": "Christ 'emptied himself, taking the form of a servant... wherefore God also hath exalted him, and given him a name which is above all names.'"
    },
    {
        "category": "New Testament Terms",
        "question": "What is the Hebrew/Aramaic word meaning 'Amen, Come Lord Jesus' used by early Christians and St. Paul in 1 Cor 16:22?",
        "options": ["Maranatha", "Hosanna", "Hallelujah", "Ephphatha"],
        "correctIndex": 0,
        "citation": "1 Corinthians 16:22; Revelation 22:20",
        "explanation": "'Maranatha' is the ancient liturgical invocation meaning 'Our Lord, come!' expressing fervent longing for the Parousia."
    },
    {
        "category": "Final Words of Scripture",
        "question": "With what benediction does the entire Sacred Scripture conclude in Revelation 22:21?",
        "options": ["The grace of our Lord Jesus Christ be with you all. Amen", "Woe to the inhabitants of the earth", "Holy, Holy, Holy is the Lord God of hosts", "Glory be to the Father, and to the Son, and to the Holy Ghost"],
        "correctIndex": 0,
        "citation": "Revelation 22:21",
        "explanation": "The Bible closes with St. John's loving benediction of the grace of Jesus Christ upon all the faithful."
    }
]

CATHOLIC_QUESTIONS = [
    {
        "category": "Sacraments & Dogma",
        "question": "What is the dogmatic term for the change of the entire substance of bread and wine into the Body and Blood of Christ at the Consecration?",
        "options": ["Consubstantiation", "Transubstantiation", "Hypostatic Union", "Symbolic Representation"],
        "correctIndex": 1,
        "citation": "Catechism of the Catholic Church (CCC 1376)",
        "explanation": "Transubstantiation affirms that the entire substance of bread and wine becomes the Body, Blood, Soul, and Divinity of Christ, while the accidents (sensory appearances) remain."
    },
    {
        "category": "Liturgical Seasons",
        "question": "What liturgical color is worn by priests during the penitential seasons of Advent and Lent?",
        "options": ["Red (Rubens)", "Green (Viridis)", "Violet / Purple (Violaceus)", "Rose (Rosaceus)"],
        "correctIndex": 2,
        "citation": "General Instruction of the Roman Missal (GIRM 346d)",
        "explanation": "Violet symbolizes repentance, preparation, and spiritual expectation during Advent and Lent. Rose is reserved solely for Gaudete and Laetare Sundays."
    },
    {
        "category": "Marian Dogmas",
        "question": "Which Pope solemnly proclaimed the dogma of the Immaculate Conception in 1854 with the Apostolic Constitution 'Ineffabilis Deus'?",
        "options": ["Pope Leo XIII", "Pope Pius IX", "Pope Pius XII", "Pope Gregory XVI"],
        "correctIndex": 1,
        "citation": "Ineffabilis Deus (1854) / CCC 491",
        "explanation": "Blessed Pope Pius IX defined that the Blessed Virgin Mary was preserved exempt from all stain of original sin from the first instant of her conception."
    },
    {
        "category": "Church Authority",
        "question": "What term denotes the living teaching office and authority of the Catholic Church, held by the Pope and bishops in communion with him?",
        "options": ["The Roman Curia", "The Magisterium", "The College of Cardinals", "The Sacred Synod"],
        "correctIndex": 1,
        "citation": "Dei Verbum 10 / CCC 85-87",
        "explanation": "The Magisterium is charged with authentically interpreting the Word of God, whether written in Sacred Scripture or handed on through Sacred Tradition."
    },
    {
        "category": "Theological Virtues",
        "question": "According to Catholic moral theology and St. Paul (1 Cor 13:13), what are the three Theological Virtues infused by divine grace?",
        "options": ["Prudence, Justice, and Fortitude", "Faith, Hope, and Charity (Love)", "Humility, Chastity, and Obedience", "Patience, Kindness, and Temperance"],
        "correctIndex": 1,
        "citation": "1 Corinthians 13:13 / CCC 1812-1813",
        "explanation": "Theological virtues are infused directly by God into the soul: Faith, Hope, and Charity. The four cardinal virtues are Prudence, Justice, Fortitude, and Temperance."
    },
    {
        "category": "Saints & Devotions",
        "question": "Which Franciscan Doctor of the Church is traditionally invoked as the patron saint for the recovery of lost articles?",
        "options": ["St. Anthony of Padua", "St. Jude Thaddaeus", "St. Francis of Assisi", "St. Padre Pio of Pietrelcina"],
        "correctIndex": 0,
        "citation": "Catholic Devotional Tradition",
        "explanation": "St. Anthony of Padua is the patron saint of lost things. St. Jude Thaddaeus is invoked for desperate and impossible causes."
    },
    {
        "category": "Holy Orders & Hierarchy",
        "question": "What are the three degrees of the Sacrament of Holy Orders instituted by Christ in the Church?",
        "options": ["Subdeacon, Deacon, Priest", "Deacon, Priest (Presbyter), Bishop (Episcopate)", "Monk, Abbot, Bishop", "Acolyte, Priest, Cardinal"],
        "correctIndex": 1,
        "citation": "CCC 1554 / Lumen Gentium 28",
        "explanation": "Catholic doctrine teaches that the three degrees of ordained ministry established by Christ are the episcopate (bishops), presbyterate (priests), and diaconate (deacons)."
    },
    {
        "category": "Ecumenical Councils",
        "question": "Which 16th-century Ecumenical Council was convened to respond to the Protestant Reformation and reaffirm Catholic doctrine and the Latin Vulgate?",
        "options": ["Council of Nicaea", "Council of Trent", "First Vatican Council", "Council of Constance"],
        "correctIndex": 1,
        "citation": "Council of Trent (1545–1563)",
        "explanation": "The Council of Trent definitively reaffirmed the 73-book Catholic biblical canon, the seven sacraments, and the authoritative standing of the Latin Vulgate."
    },
    {
        "category": "Sacraments of Initiation",
        "question": "Which three sacraments together constitute the Sacraments of Christian Initiation in the Catholic Church?",
        "options": ["Baptism, Confirmation, Holy Eucharist", "Baptism, Penance, Holy Eucharist", "Baptism, Confirmation, Matrimony", "Confirmation, Holy Eucharist, Holy Orders"],
        "correctIndex": 0,
        "citation": "Catechism of the Catholic Church (CCC 1212)",
        "explanation": "Christian initiation is accomplished through Baptism (new birth in Christ), Confirmation (strengthening with the Holy Spirit), and Holy Eucharist (spiritual food of eternal life)."
    },
    {
        "category": "Liturgy & Mass",
        "question": "What ancient Greek prayer of petition remains untranslated in the Ordinary of the Roman Rite Mass?",
        "options": ["Agnus Dei", "Sanctus", "Kyrie eleison", "Gloria in excelsis Deo"],
        "correctIndex": 2,
        "citation": "General Instruction of the Roman Missal (GIRM 52)",
        "explanation": "'Kyrie eleison, Christe eleison' ('Lord, have mercy, Christ, have mercy') preserves the ancient Greek linguistic heritage of the early Church in the Roman Rite."
    },
    {
        "category": "Creeds of Faith",
        "question": "Which Ecumenical Council in 325 AD formulated the first portion of the Nicene Creed, affirming Christ as 'consubstantial' with the Father?",
        "options": ["Council of Nicaea I", "Council of Constantinople I", "Council of Ephesus", "Council of Chalcedon"],
        "correctIndex": 0,
        "citation": "CCC 242, 465",
        "explanation": "The First Council of Nicaea (325 AD) defended the full divinity of the Son against the Arian heresy using the Greek term 'homoousios' (Latin: consubstantialem)."
    },
    {
        "category": "Marks of the Church",
        "question": "Recited in the Nicene Creed, what are the Four Marks (essential characteristics) of the Catholic Church?",
        "options": ["Ancient, Apostolic, Traditional, Holy", "One, Holy, Catholic, and Apostolic", "Roman, Universal, Apostolic, Eternal", "Faithful, Sacramental, One, True"],
        "correctIndex": 1,
        "citation": "Nicene Creed / CCC 811",
        "explanation": "'Credo in unam, sanctam, catholicam et apostolicam Ecclesiam' — One, Holy, Catholic, and Apostolic."
    },
    {
        "category": "Pillars of the Catechism",
        "question": "What are the four foundational 'Pillars' upon which the Catechism of the Catholic Church (CCC) is structured?",
        "options": ["Scripture, Tradition, Magisterium, and Papacy", "Creed, Sacraments, Commandments/Morality, and Prayer", "Faith, Hope, Charity, and Prudence", "Baptism, Eucharist, Confirmation, and Penance"],
        "correctIndex": 1,
        "citation": "CCC 13",
        "explanation": "The Catechism is divided into four parts: The Profession of Faith (Creed), Celebration of the Christian Mystery (Sacraments), Life in Christ (Commandments), and Christian Prayer."
    },
    {
        "category": "Marian Dogmas",
        "question": "Which Pope dogmatically defined the bodily Assumption of the Blessed Virgin Mary into heaven in 1950 via 'Munificentissimus Deus'?",
        "options": ["Pope Pius IX", "Pope Leo XIII", "Pope Pius XII", "Pope John XXIII"],
        "correctIndex": 2,
        "citation": "Munificentissimus Deus (1950) / CCC 966",
        "explanation": "Venerable Pope Pius XII defined that the Immaculate Mother of God, having completed the course of her earthly life, was assumed body and soul into heavenly glory."
    },
    {
        "category": "Marian Dogmas",
        "question": "Which ancient Ecumenical Council in 431 AD proclaimed the Virgin Mary as 'Theotokos' (Mother of God / God-bearer)?",
        "options": ["Council of Ephesus", "Council of Nicaea", "Council of Chalcedon", "Second Council of Constantinople"],
        "correctIndex": 0,
        "citation": "Council of Ephesus (431 AD) / CCC 495",
        "explanation": "Against Nestorius, the Council of Ephesus affirmed that Christ's human and divine natures are united in one Divine Person, making Mary truly the Mother of God."
    },
    {
        "category": "Marian Dogmas",
        "question": "What does the Catholic dogma of the Perpetual Virginity of Mary (Semper Virgo) affirm?",
        "options": ["Mary was a virgin only until Jesus was born", "Mary remained a virgin before, during, and perpetually after the birth of Christ", "Mary was an allegorical figure", "Mary took monastic vows in Rome"],
        "correctIndex": 1,
        "citation": "Lateran Synod (649 AD) / CCC 499",
        "explanation": "The Church professes Mary's real and perpetual virginity: ante partum, in partu, and post partum."
    },
    {
        "category": "The Holy Trinity",
        "question": "In the Nicene Creed, from whom does the Holy Spirit proceed according to Western Catholic theology (the Filioque)?",
        "options": ["From the Father alone", "From the Son alone", "From the Father and the Son (Filioque)", "From the created cosmos"],
        "correctIndex": 2,
        "citation": "CCC 246-248",
        "explanation": "The Latin Church confesses: 'Qui ex Patre Filioque procedit' ('Who proceeds from the Father and the Son'), affirming the eternal consubstantial communion of the Trinity."
    },
    {
        "category": "The Papacy",
        "question": "Which Ecumenical Council promulgated the dogmatic constitution 'Pastor Aeternus', defining Papal Infallibility in matters of faith and morals?",
        "options": ["Council of Trent", "First Vatican Council (1870)", "Second Vatican Council", "Council of Constance"],
        "correctIndex": 1,
        "citation": "Vatican I (1870) / CCC 891",
        "explanation": "Vatican I declared that the Roman Pontiff speaks infallibly when, ex cathedra, he defines a doctrine concerning faith or morals to be held by the whole Church."
    },
    {
        "category": "The Papacy",
        "question": "Who is historically recognized as the First Pope, having received the Keys of the Kingdom from Christ?",
        "options": ["St. Paul", "St. Peter (Simon Bar-Jona)", "St. Linus", "St. Clement of Rome"],
        "correctIndex": 1,
        "citation": "Matthew 16:18-19 / CCC 881",
        "explanation": "St. Peter served as Bishop of Rome and suffered martyrdom on Vatican Hill under Emperor Nero, establishing the Roman Petrine succession."
    },
    {
        "category": "The Papacy",
        "question": "Who succeeded St. Peter as the second Bishop of Rome (second Pope)?",
        "options": ["St. Cletus", "St. Linus", "St. Clement I", "St. Sixtus I"],
        "correctIndex": 1,
        "citation": "Roman Canon / Liber Pontificalis",
        "explanation": "St. Linus (mentioned by St. Paul in 2 Timothy 4:21) governed the Roman See immediately after St. Peter's martyrdom."
    },
    {
        "category": "The Sacraments",
        "question": "How many total Sacraments were instituted by Jesus Christ and are celebrated in the Catholic Church?",
        "options": ["Two", "Three", "Seven", "Twelve"],
        "correctIndex": 2,
        "citation": "Council of Trent / CCC 1113",
        "explanation": "The seven sacraments are Baptism, Confirmation, Eucharist, Penance/Reconciliation, Anointing of the Sick, Holy Orders, and Matrimony."
    },
    {
        "category": "Sacrament of Baptism",
        "question": "What essential grace is conferred by the Sacrament of Baptism regarding Original Sin and personal sins?",
        "options": ["It reduces future temptations but does not remove guilt", "It washes away Original Sin and all personal sins prior to baptism, imparting sanctifying grace", "It serves solely as an outward public demonstration of personal dedication", "It is only an administrative entry into the parish register"],
        "correctIndex": 1,
        "citation": "CCC 1262-1266",
        "explanation": "By Baptism all sins are forgiven, Original Sin and all personal sins, as well as all punishment for sin; the baptized becomes an adopted child of God."
    },
    {
        "category": "Sacrament of Baptism",
        "question": "What is the essential matter and form required for a valid Catholic baptism?",
        "options": ["Immersion or pouring of true water, and the Trinitarian formula ('I baptize you in the name of the Father, and of the Son, and of the Holy Spirit')", "Rose water and the Lord's Prayer", "Holy Chrism and laying on of hands only", "Salt and wine with the Apostles' Creed"],
        "correctIndex": 0,
        "citation": "Canon 849 / CCC 1239-1240",
        "explanation": "Anyone, even a non-Christian in danger of death, can validly baptize using natural water and the Trinitarian formula with the Church's intention."
    },
    {
        "category": "Sacrament of Confirmation",
        "question": "What sacred perfumed oil consecrated by the Bishop on Holy Thursday is used to anoint the forehead in Confirmation?",
        "options": ["Oil of Catechumens (Oleum Catechumenorum)", "Oil of the Sick (Oleum Infirmorum)", "Sacred Chrism (Sanctum Chrisma)", "Oil of Nard"],
        "correctIndex": 2,
        "citation": "CCC 1293-1296",
        "explanation": "Sacred Chrism, a mixture of olive oil and balsam, signifies the indelible seal and consecration of the Holy Spirit."
    },
    {
        "category": "Sacrament of Confession",
        "question": "What are the three essential acts required of the penitent for the valid reception of the Sacrament of Penance?",
        "options": ["Contrition, Confession of sins, and Satisfaction (Penance)", "Tithing, Fasting, and Pilgrimage", "Memorization of the Creed, Almsgiving, and Silence", "Public apology, Ritual bath, and Meditation"],
        "correctIndex": 0,
        "citation": "Council of Trent / CCC 1450-1460",
        "explanation": "The penitent must have sorrow of soul (contrition), confess all remembered mortal sins to a priest, and resolve to fulfill satisfaction."
    },
    {
        "category": "Sacrament of Confession",
        "question": "What is the absolute obligation binding every priest under pain of automatic excommunication never to reveal sins heard in Confession?",
        "options": ["The Pontifical Secret", "The Seal of the Confessional (Sigillum Confessionis)", "The Clerical Immunity", "The Vow of Discretion"],
        "correctIndex": 1,
        "citation": "Canon 983 / CCC 1467",
        "explanation": "The sacramental seal is inviolable; a confessor may not by word or in any other manner or for any reason ever betray a penitent."
    },
    {
        "category": "Sacrament of the Sick",
        "question": "Which New Testament epistle explicitly commands: 'Is any man sick among you? Let him bring in the priests of the church, and let them pray over him, anointing him with oil'?",
        "options": ["Epistle of St. James", "First Epistle of St. Peter", "Epistle to the Hebrews", "First Epistle of St. John"],
        "correctIndex": 0,
        "citation": "James 5:14-15 / CCC 1510",
        "explanation": "St. James explicitly documents the apostolic practice of the Anointing of the Sick for bodily healing and forgiveness of sins."
    },
    {
        "category": "Sacrament of Matrimony",
        "question": "In the Latin Rite of the Catholic Church, who are the ordinary ministers of the Sacrament of Holy Matrimony?",
        "options": ["The Priest or Deacon", "The Bishop exclusively", "The Spouses themselves (the bride and groom conferring mutual consent)", "The Maid of Honor and Best Man"],
        "correctIndex": 2,
        "citation": "CCC 1623",
        "explanation": "In the Latin tradition, the spouses as ministers of Christ's grace mutually confer the sacrament by expressing their consent before the Church's witness."
    },
    {
        "category": "Sacrament of Holy Orders",
        "question": "Who alone possesses the power to validly confer the Sacrament of Holy Orders upon deacons, priests, and bishops?",
        "options": ["Any validly ordained Priest", "A validly consecrated Catholic Bishop", "The Abbot of a monastery", "The Papal Nuncio only"],
        "correctIndex": 1,
        "citation": "CCC 1576 / Canon 1012",
        "explanation": "As successors of the Apostles, validly consecrated bishops alone are the ministers of sacred ordination."
    },
    {
        "category": "The Liturgical Year",
        "question": "Which Sunday marks the official commencement of the Catholic Church's liturgical year?",
        "options": ["First Sunday of Lent", "First Sunday of Advent", "Easter Sunday", "Feast of Christ the King"],
        "correctIndex": 1,
        "citation": "General Norms for the Liturgical Year 39",
        "explanation": "Advent begins four Sundays before Christmas, opening the new liturgical cycle and preparing for the Nativity and Second Coming."
    },
    {
        "category": "Liturgical Vestments",
        "question": "What color vestment is prescribed for martyrs' feast days, Pentecost, Good Friday, and Palm Sunday?",
        "options": ["White", "Green", "Red", "Rose"],
        "correctIndex": 2,
        "citation": "GIRM 346b",
        "explanation": "Red symbolizes the fire of the Holy Spirit on Pentecost and the blood of Christ and His martyrs."
    },
    {
        "category": "Liturgical Vestments",
        "question": "What color vestments are worn during Ordinary Time, symbolizing spiritual growth, vitality, and hope?",
        "options": ["Red", "Green", "Violet", "Black"],
        "correctIndex": 1,
        "citation": "GIRM 346c",
        "explanation": "Green is worn during Ordinary Time to represent the living hope and spiritual growth of the Church."
    },
    {
        "category": "Liturgical Days",
        "question": "What is the holiest season of the Church year, spanning Holy Thursday evening, Good Friday, Holy Saturday, and Easter Sunday?",
        "options": ["The Paschal Triduum", "The Octave of Christmas", "The Rogation Days", "Quinquagesima"],
        "correctIndex": 0,
        "citation": "CCC 1168 / GIRM 19",
        "explanation": "The Paschal Triduum of the Passion and Resurrection of the Lord is the culmination of the entire liturgical year."
    },
    {
        "category": "Eucharistic Adoration",
        "question": "What is the sacred vessel, usually shaped like a golden sunburst, used to expose the consecrated Blessed Sacrament for public adoration?",
        "options": ["Ciborium", "Monstrance (Ostensorium)", "Chalice", "Pyx"],
        "correctIndex": 1,
        "citation": "Holy Communion and Worship of the Eucharist Outside Mass",
        "explanation": "The monstrance contains a circular transparent glass receptacle (the luna) holding the consecrated Host for veneration."
    },
    {
        "category": "The Holy Rosary",
        "question": "How many total decades are in the traditional Rosary, including the Joyful, Sorrowful, Glorious, and Luminous Mysteries?",
        "options": ["15 decades", "20 decades", "10 decades", "25 decades"],
        "correctIndex": 1,
        "citation": "Rosarium Virginis Mariae (St. John Paul II, 2002)",
        "explanation": "With the addition of the 5 Luminous Mysteries (Mysteries of Light) by Pope St. John Paul II, the complete Rosary comprises 20 decades."
    },
    {
        "category": "The Holy Rosary",
        "question": "Which of the following is NOT one of the five Sorrowful Mysteries of the Holy Rosary?",
        "options": ["The Agony in the Garden", "The Scourging at the Pillar", "The Transfiguration of the Lord", "The Crowning with Thorns"],
        "correctIndex": 2,
        "citation": "Apostolic Letter Rosarium Virginis Mariae",
        "explanation": "The five Sorrowful Mysteries are the Agony in the Garden, Scourging at the Pillar, Crowning with Thorns, Carrying of the Cross, and Crucifixion. The Transfiguration is a Luminous Mystery."
    },
    {
        "category": "Doctors of the Church",
        "question": "Which Italian Dominican theologian and philosopher is known as the 'Angelic Doctor' (Doctor Angelicus) and authored the 'Summa Theologiae'?",
        "options": ["St. Bonaventure", "St. Thomas Aquinas", "St. Albert the Great", "St. Anselm of Canterbury"],
        "correctIndex": 1,
        "citation": "Enchiridion / CCC 18",
        "explanation": "St. Thomas Aquinas synthesized Christian revelation with Aristotelian philosophy, forming the cornerstone of Scholastic theology."
    },
    {
        "category": "Doctors of the Church",
        "question": "Who was the Bishop of Hippo in North Africa who wrote the 'Confessions' and 'The City of God'?",
        "options": ["St. Augustine", "St. Athanasius", "St. Cyprian", "St. John Chrysostom"],
        "correctIndex": 0,
        "citation": "Patristic Theology / CCC 27",
        "explanation": "St. Augustine of Hippo (Doctor Gratiae) is one of the greatest Latin Church Fathers, renowned for his theological works on grace and the Trinity."
    },
    {
        "category": "Doctors of the Church",
        "question": "Who was the first woman declared a Doctor of the Church by Pope St. Paul VI in 1970, alongside St. Catherine of Siena?",
        "options": ["St. Teresa of Ávila", "St. Thérèse of Lisieux", "St. Hildegard of Bingen", "St. Joan of Arc"],
        "correctIndex": 0,
        "citation": "Papal Declaration (1970)",
        "explanation": "St. Teresa of Jesus (of Ávila), Spanish Carmelite reformer and mystic, author of 'The Interior Castle', was declared Doctor of the Church in 1970."
    },
    {
        "category": "Eschatology & Four Last Things",
        "question": "What are the traditional 'Four Last Things' taught in Catholic eschatology?",
        "options": ["Death, Judgment, Heaven, and Hell", "Sin, Penance, Grace, and Glory", "Baptism, Mass, Viaticum, and Burial", "Creation, Fall, Redemption, and Consummation"],
        "correctIndex": 0,
        "citation": "CCC 1020-1060",
        "explanation": "The Four Last Things (Quattuor Novissima) describe the ultimate destiny of every human soul: Death, Judgment (Particular & Final), Heaven, and Hell."
    },
    {
        "category": "Purgatory & Indulgences",
        "question": "What is Purgatory according to the Catechism of the Catholic Church?",
        "options": ["A second chance for unrepentant mortal sinners", "The final purification of all who die in God's grace and friendship, but still imperfectly purified", "A physical holding prison beneath the earth", "An ancient mythological invention abandoned by the Church"],
        "correctIndex": 1,
        "citation": "CCC 1030-1032",
        "explanation": "Purgatory is the state of cleansing after death wherein souls assured of their eternal salvation undergo purification to achieve the holiness necessary for the beatific vision."
    },
    {
        "category": "The Beatific Vision",
        "question": "What is the ultimate supernatural contemplation and immediate knowledge of God face-to-face in Heaven called?",
        "options": ["The Beatific Vision (Visio Beatifica)", "The Cosmic Consciousness", "The Nirvana", "The Astral Ascension"],
        "correctIndex": 0,
        "citation": "1 Corinthians 13:12 / CCC 1023",
        "explanation": "The Beatific Vision is the direct contemplation of God in His heavenly glory, where the blessed see Him 'face to face' and partake in perfect eternal happiness."
    },
    {
        "category": "Cardinal Virtues",
        "question": "What are the four Cardinal (Moral) Virtues, known since antiquity and reinforced by Christian revelation?",
        "options": ["Prudence, Justice, Fortitude, and Temperance", "Faith, Hope, Charity, and Humility", "Poverty, Chastity, Obedience, and Silence", "Kindness, Patience, Peace, and Joy"],
        "correctIndex": 0,
        "citation": "Wisdom 8:7 / CCC 1805",
        "explanation": "The cardinal virtues (from Latin 'cardo', hinge) are the primary moral virtues upon which all other good habits pivot."
    },
    {
        "category": "The Ten Commandments",
        "question": "According to the Catholic numbering of the Decalogue (St. Augustine's tradition), what is the First Commandment?",
        "options": ["I am the Lord thy God: thou shalt not have strange gods before me", "Thou shalt not take the name of the Lord thy God in vain", "Remember that thou keep holy the Sabbath day", "Honor thy father and thy mother"],
        "correctIndex": 0,
        "citation": "Exodus 20:2-5 / CCC 2084",
        "explanation": "The First Commandment summons man to believe in God, to hope in Him, and to love Him above all other things."
    },
    {
        "category": "The Seven Capital Sins",
        "question": "Which of the following represents the traditional Seven Capital Sins (Seven Deadly Sins)?",
        "options": ["Pride, Greed (Avarice), Lust, Anger (Wrath), Gluttony, Envy, and Sloth (Acedia)", "Theft, Murder, Adultery, Lying, Blasphemy, Idolatry, and Treason", "Ignorance, Weakness, Malice, Fear, Cowardice, Doubt, and Despair", "Despair, Presumption, Obstinacy, Impenitence, Envy, Sloth, and Rage"],
        "correctIndex": 0,
        "citation": "CCC 1866 / St. Gregory the Great",
        "explanation": "They are called 'capital' sins (from caput, head) because they engender other sins and vices."
    },
    {
        "category": "Corporal Works of Mercy",
        "question": "Which of the following is one of the seven traditional Corporal Works of Mercy based on Matthew 25?",
        "options": ["To counsel the doubtful", "To feed the hungry", "To instruct the ignorant", "To pray for the living and the dead"],
        "correctIndex": 1,
        "citation": "Matthew 25:35-40 / CCC 2447",
        "explanation": "The Corporal Works of Mercy are: feed the hungry, give drink to the thirsty, clothe the naked, shelter the homeless, visit the sick, visit the imprisoned, and bury the dead."
    },
    {
        "category": "Spiritual Works of Mercy",
        "question": "Which of the following is one of the seven Spiritual Works of Mercy?",
        "options": ["To clothe the naked", "To counsel the doubtful", "To shelter the homeless", "To bury the dead"],
        "correctIndex": 1,
        "citation": "CCC 2447",
        "explanation": "The Spiritual Works of Mercy address spiritual poverty: counsel the doubtful, instruct the ignorant, admonish the sinner, comfort the sorrowful, forgive injuries, bear wrongs patiently, and pray for living and dead."
    },
    {
        "category": "Precepts of the Church",
        "question": "How often is a Catholic obligated to confess serious (mortal) sins according to the Precepts of the Church?",
        "options": ["At least once a month", "At least once a year", "Every Sunday before communion", "Only when requested by the bishop"],
        "correctIndex": 1,
        "citation": "Canon 989 / CCC 2042",
        "explanation": "The second precept of the Church mandates that every faithful person who has reached the age of discretion must confess grave sins at least once a year."
    },
    {
        "category": "Precepts of the Church",
        "question": "What is the minimum obligation for receiving Holy Communion according to the Precepts of the Church?",
        "options": ["At least once a year, during the Easter season", "At every single Mass attended", "Only on Christmas Day", "Once every decade"],
        "correctIndex": 0,
        "citation": "Canon 920 / CCC 2042",
        "explanation": "The third precept states that the faithful must receive the sacrament of the Eucharist at least during the Easter season (the 'Easter Duty')."
    },
    {
        "category": "Ecumenical Councils",
        "question": "Which Council held in 451 AD defined the Hypostatic Union: that Christ is one Divine Person in two unconfused, undivided natures (true God and true man)?",
        "options": ["Council of Chalcedon", "Council of Trent", "Council of Nicaea", "Council of Lyons"],
        "correctIndex": 0,
        "citation": "Council of Chalcedon (451 AD) / CCC 467",
        "explanation": "Chalcedon proclaimed Christ perfect in divinity and perfect in humanity, consubstantial with the Father as touching His Godhead, and consubstantial with us as touching His manhood."
    },
    {
        "category": "Ecumenical Councils",
        "question": "Which 20th-century Ecumenical Council was opened by Pope St. John XXIII in 1962 to renew Church life and pastoral dialogue with the modern world?",
        "options": ["Second Vatican Council (Vatican II)", "First Vatican Council", "Council of Florence", "Council of Trent"],
        "correctIndex": 0,
        "citation": "Vatican II (1962-1965) / CCC 18",
        "explanation": "Vatican II produced sixteen major documents, including 'Lumen Gentium', 'Dei Verbum', 'Sacrosanctum Concilium', and 'Gaudium et Spes'."
    },
    {
        "category": "Saints & Orders",
        "question": "Which Italian saint founded the Order of Friars Minor (Franciscans), embraced 'Lady Poverty', and received the holy Stigmata on Mount La Verna?",
        "options": ["St. Dominic de Guzmán", "St. Francis of Assisi", "St. Ignatius of Loyola", "St. Philip Neri"],
        "correctIndex": 1,
        "citation": "Franciscan Tradition / CCC 956",
        "explanation": "St. Francis rebuilt San Damiano, renounced worldly wealth, and was configured to the crucified Christ by receiving the sacred wounds."
    },
    {
        "category": "Saints & Orders",
        "question": "Which Spanish soldier-turned-mystic founded the Society of Jesus (Jesuits) and wrote the 'Spiritual Exercises' under the motto 'Ad Maiorem Dei Gloriam' (AMDG)?",
        "options": ["St. Francis Xavier", "St. Ignatius of Loyola", "St. John of the Cross", "St. Peter Canisius"],
        "correctIndex": 1,
        "citation": "Jesuit History / CCC 2015",
        "explanation": "St. Ignatius founded the Society of Jesus in 1540 to champion the defense and propagation of the faith for the greater glory of God."
    },
    {
        "category": "Saints & Orders",
        "question": "Which 6th-century Father of Western Monasticism authored the 'Holy Rule' at Monte Cassino with the famous motto 'Ora et Labora' (Pray and Work)?",
        "options": ["St. Anthony of the Desert", "St. Benedict of Nursia", "St. Bernard of Clairvaux", "St. Bruno"],
        "correctIndex": 1,
        "citation": "Rule of St. Benedict / Patron of Europe",
        "explanation": "St. Benedict founded Western monasticism on balance, prayer, community life, and labor, profoundly shaping European civilization."
    },
    {
        "category": "Liturgical Terms",
        "question": "What is the small linen cloth placed on the altar upon which the chalice and paten rest during the Holy Sacrifice of the Mass?",
        "options": ["Corporal", "Purificator", "Pall", "Amice"],
        "correctIndex": 0,
        "citation": "GIRM 117",
        "explanation": "The corporal (from corpus, body) is the square white linen upon which the sacred Body and Blood of Christ are placed on the altar."
    },
    {
        "category": "Liturgical Terms",
        "question": "What is the name of the vessel containing incense and suspended on chains, used for censing the altar, clergy, and congregation?",
        "options": ["Thurible (Censer)", "Navicula (Boat)", "Aspergillum", "Cruet"],
        "correctIndex": 0,
        "citation": "GIRM 276-277",
        "explanation": "The thurible holds burning charcoal onto which incense from the incense boat is spooned, symbolizing the prayers of the saints rising to God (Psalm 140:2)."
    },
    {
        "category": "Canon Law & Jurisdiction",
        "question": "What is the territorial district and community of the faithful under the pastoral governance of a Catholic Bishop called?",
        "options": ["A Parish", "A Diocese (or Eparchy)", "A Prelature", "A Vicariate"],
        "correctIndex": 1,
        "citation": "Canon 369",
        "explanation": "A diocese is a portion of the people of God entrusted to a bishop to be shepherded by him with the cooperation of the presbyterium."
    },
    {
        "category": "Vatican City State",
        "question": "By which 1929 bilateral agreement between the Holy See and Italy was the sovereign Vatican City State established?",
        "options": ["Treaty of Versailles", "Lateran Treaty (Patti Lateranensi)", "Peace of Westphalia", "Concordat of Worms"],
        "correctIndex": 1,
        "citation": "Holy See History (1929)",
        "explanation": "Signed on February 11, 1929, the Lateran Pacts recognized the full independence and sovereign jurisdiction of the Holy See over Vatican City."
    },
    {
        "category": "The Papal Flag",
        "question": "What two colors comprise the official flag of the Holy See and Vatican City State?",
        "options": ["Red and White", "Yellow (Gold) and White (Silver)", "Blue and Gold", "Black and White"],
        "correctIndex": 1,
        "citation": "Fundamental Law of Vatican City State",
        "explanation": "The yellow and white vertical fields symbolize gold and silver, matching the keys of heaven held in the papal tiara crest."
    },
    {
        "category": "Papal Conclave",
        "question": "What color smoke from the Sistine Chapel chimney signals to St. Peter's Square that a new Pope has been canonically elected?",
        "options": ["Black smoke (Fumata Nera)", "White smoke (Fumata Bianca)", "Red smoke", "Golden smoke"],
        "correctIndex": 1,
        "citation": "Universi Dominici Gregis",
        "explanation": "White smoke produced by burning ballots with chemical additives signals the election of the Supreme Pontiff, followed by the bell toll and 'Habemus Papam'."
    },
    {
        "category": "Creeds of Faith",
        "question": "Which ancient statement of Catholic faith is traditionally attributed to the twelve Apostles before their dispersion?",
        "options": ["The Apostles' Creed (Symbolum Apostolicum)", "The Athanasian Creed (Quicumque Vult)", "The Creed of Pope Paul VI", "The Tridentine Profession of Faith"],
        "correctIndex": 0,
        "citation": "CCC 194",
        "explanation": "The Apostles' Creed is considered a faithful summary of the Apostles' faith, anciently used as the baptismal symbol of the Church of Rome."
    },
    {
        "category": "Athanasian Creed",
        "question": "Which historic creed opens with the Latin words 'Quicumque vult salvus esse' ('Whosoever will be saved') and articulates the Trinitarian mystery in great precision?",
        "options": ["Nicene Creed", "Athanasian Creed", "Chalcedonian Definition", "Apostles' Creed"],
        "correctIndex": 1,
        "citation": "Denzinger 75-76 / CCC 192",
        "explanation": "The Athanasian Creed details orthodox Trinitarian theology and the dual natures of Christ in majestic rhythmical prose."
    },
    {
        "category": "The Great Commission & Purpose of Man",
        "question": "According to the Baltimore Catechism (Q. 6), why did God make man?",
        "options": ["To conquer the natural world through science", "To know Him, to love Him, and to serve Him in this world, and to be happy with Him forever in the next", "To enjoy material abundance and longevity", "To evolve into higher spiritual planes"],
        "correctIndex": 1,
        "citation": "Baltimore Catechism / CCC 1",
        "explanation": "God, infinitely perfect and blessed in Himself, freely created man to make him share in His own blessed life: to know, love, and serve God."
    },
    {
        "category": "Communion of Saints",
        "question": "What three states of the Church comprise the unified Communion of Saints?",
        "options": ["The Church Militant (earth), Church Suffering (purgatory), and Church Triumphant (heaven)", "The Latin Rite, Byzantine Rite, and Maronite Rite", "The Clergy, Religious, and Laity", "The Past, Present, and Future generations"],
        "correctIndex": 0,
        "citation": "CCC 954 / Lumen Gentium 49",
        "explanation": "All three states form one single family in Christ, interceding for and aiding one another through prayers and the Holy Sacrifice."
    },
    {
        "category": "Sacramental Grace",
        "question": "What distinct grace is gratuitously given in the sacraments to establish us in an abiding, supernatural friendship with God?",
        "options": ["Actual grace", "Sanctifying (Deifying) grace", "Charismatic grace", "Common grace"],
        "correctIndex": 1,
        "citation": "CCC 1999-2000",
        "explanation": "Sanctifying grace is the habitual, permanent divine gift of God's life infused into our soul by the Holy Spirit to heal it of sin and sanctify it."
    },
    {
        "category": "Indelible Character",
        "question": "Which three sacraments imprint an indelible spiritual character (seal) on the soul and therefore can NEVER be repeated?",
        "options": ["Baptism, Confirmation, and Holy Orders", "Baptism, Eucharist, and Penance", "Confirmation, Matrimony, and Extreme Unction", "Baptism, Matrimony, and Penance"],
        "correctIndex": 0,
        "citation": "Council of Trent / CCC 1121",
        "explanation": "Baptism, Confirmation, and Holy Orders imprint an indelible sacramental mark that configures the soul to Christ permanently and cannot be effaced."
    },
    {
        "category": "Mortal vs Venial Sin",
        "question": "What three simultaneous conditions are required for a sin to be considered mortal (deadly)?",
        "options": ["Grave matter, full knowledge, and deliberate consent", "Public scandal, legal violation, and arrest", "Harm to others, bad intent, and repeated behavior", "Omission of church attendance, anger, and gossip"],
        "correctIndex": 0,
        "citation": "CCC 1857-1859",
        "explanation": "Mortal sin destroys charity in the heart of man by a grave violation of God's law; it requires grave matter, full knowledge of its evil, and complete deliberate consent."
    },
    {
        "category": "Angels & Archangels",
        "question": "Which Archangel whose name means 'Who is like God?' cast Lucifer out of heaven and is invoked in the St. Michael Prayer?",
        "options": ["St. Gabriel", "St. Michael", "St. Raphael", "St. Uriel"],
        "correctIndex": 1,
        "citation": "Revelation 12:7-9 / CCC 335",
        "explanation": "St. Michael the Archangel is the leader of the heavenly host and protector of the Church against the snares of the devil."
    },
    {
        "category": "The Guardian Angels",
        "question": "According to Catholic doctrine and Tradition, when does each human person receive their personal Guardian Angel?",
        "options": ["At the age of reason (seven years old)", "From its beginning until death (from conception / birth)", "Only upon receiving holy baptism", "Only when entering religious life"],
        "correctIndex": 1,
        "citation": "CCC 336 / St. Basil the Great",
        "explanation": "From its beginning until death, human life is surrounded by the watchful care and intercession of holy guardian angels."
    },
    {
        "category": "Sacramental Signs",
        "question": "What is the physical sign or gesture by which a Catholic blesses oneself with the words 'In the name of the Father, and of the Son, and of the Holy Spirit'?",
        "options": ["The Sign of the Cross (Signum Crucis)", "The Genuflection", "The Metania", "The Kiss of Peace"],
        "correctIndex": 0,
        "citation": "CCC 2157 / Tertullian",
        "explanation": "The Sign of the Cross recalls Christ's redemptive sacrifice and the Holy Trinity, sanctifying daily actions since the apostolic age."
    },
    {
        "category": "Eucharistic Fast",
        "question": "According to modern Code of Canon Law (Canon 919), how long must a Catholic abstain from all food and drink (water and medicine excepted) prior to Holy Communion?",
        "options": ["At least one hour", "At least three hours", "From midnight", "At least twenty-four hours"],
        "correctIndex": 0,
        "citation": "Canon 919 §1",
        "explanation": "A person who is to receive the Most Holy Eucharist is to abstain for at least one hour before Holy Communion from any food and drink, except water and medicine."
    },
    {
        "category": "Chalice and Paten",
        "question": "What is the sacred plate upon which the primary host rests during Mass before being broken and placed on the altar?",
        "options": ["The Paten", "The Pyx", "The Cruet", "The Thurible"],
        "correctIndex": 0,
        "citation": "GIRM 327",
        "explanation": "The paten (from patina, dish) is the shallow golden plate designated to hold the bread for consecration in the Eucharist."
    },
    {
        "category": "Feast of Corpus Christi",
        "question": "Which Pope instituted the worldwide Solemnity of Corpus Christi in 1264 following the Eucharistic miracle of Bolsena, with hymns composed by St. Thomas Aquinas?",
        "options": ["Pope Urban IV", "Pope Innocent III", "Pope Boniface VIII", "Pope Gregory IX"],
        "correctIndex": 0,
        "citation": "Bull Transiturus de hoc mundo (1264)",
        "explanation": "Pope Urban IV instituted Corpus Christi to celebrate the Real Presence, adopting the hymns 'Pange Lingua' and 'Lauda Sion' composed by Aquinas."
    },
    {
        "category": "Sacred Music",
        "question": "What traditional sacred monophonic chant is recognized by the Second Vatican Council as 'specially suited to the Roman liturgy'?",
        "options": ["Gregorian Chant", "Byzantine Chant", "Polyphonic Madrigal", "Modern Gospel Hymnody"],
        "correctIndex": 0,
        "citation": "Sacrosanctum Concilium 116 / GIRM 41",
        "explanation": "The Church acknowledges Gregorian chant as specially suited to the Roman liturgy; therefore, other things being equal, it should be given pride of place."
    },
    {
        "category": "Holy Days of Obligation",
        "question": "Which of the following solemnities is universally observed as a Holy Day of Obligation on August 15 in the Roman Catholic Church?",
        "options": ["The Assumption of the Blessed Virgin Mary", "The Nativity of St. John the Baptist", "The Feast of the Transfiguration", "The Annunciation of the Lord"],
        "correctIndex": 0,
        "citation": "Canon 1246 §1",
        "explanation": "The Solemnity of the Assumption of the Blessed Virgin Mary into Heaven on August 15 is one of the principal holy days of obligation."
    },
    {
        "category": "Holy Days of Obligation",
        "question": "On which date does the Church celebrate the Solemnity of the Immaculate Conception of the Blessed Virgin Mary?",
        "options": ["March 25", "August 15", "September 8", "December 8"],
        "correctIndex": 3,
        "citation": "Canon 1246 / Liturgical Calendar",
        "explanation": "December 8 commemorates Mary's preservation from original sin, celebrated exactly nine months before the feast of her Nativity (September 8)."
    },
    {
        "category": "Ash Wednesday",
        "question": "What solemn scriptural reminder does the priest pronounce when imposing ashes on the forehead on Ash Wednesday?",
        "options": ["Remember, man, that thou art dust, and unto dust thou shalt return (or Repent and believe in the Gospel)", "Go in peace to love and serve the Lord", "May the blessing of Almighty God rest upon you", "Peace be to this house and all who dwell in it"],
        "correctIndex": 0,
        "citation": "Genesis 3:19 / Mark 1:15 / Roman Missal",
        "explanation": "The imposition of ashes initiates the forty days of Lent with the call to penance and remembrance of human mortality."
    },
    {
        "category": "Sacred Scriptures & Inspiration",
        "question": "According to the Dogmatic Constitution 'Dei Verbum', how did God author Sacred Scripture through the human writers?",
        "options": ["By dictating word-for-word while putting the authors in a trance", "By inspiring human authors to use their own faculties to write everything and only what God wanted", "By delivering completed golden books from heaven", "By approving human folklore centuries after it was recorded"],
        "correctIndex": 1,
        "citation": "Dei Verbum 11 / CCC 105-106",
        "explanation": "God chose men and while employed by Him they made use of their powers and abilities, so that with Him acting in them and through them, they wrote as true authors all that He wanted."
    },
    {
        "category": "The Deposit of Faith",
        "question": "What two inseparable fonts make up the single sacred 'Deposit of Faith' (Depositum Fidei) entrusted to the Church?",
        "options": ["Sacred Scripture and Sacred Tradition", "Canon Law and Civil Law", "The Old Testament and New Testament", "The Papal Encyclicals and Catechisms"],
        "correctIndex": 0,
        "citation": "Dei Verbum 9-10 / CCC 80-84",
        "explanation": "Sacred Scripture is the speech of God put down in writing under the breath of the Holy Spirit; Sacred Tradition transmits in its entirety the Word of God entrusted to the Apostles."
    },
    {
        "category": "The Vulgate Translation",
        "question": "At which ancient town in the Holy Land did St. Jerome dwell in a cave monastery while translating the Latin Vulgate Bible?",
        "options": ["Bethlehem", "Jerusalem", "Nazareth", "Antioch"],
        "correctIndex": 0,
        "citation": "St. Jerome Biography / Papal Encyclical Spiritus Paraclitus",
        "explanation": "St. Jerome spent over thirty years in a cave near the Church of the Nativity in Bethlehem laboring over the Latin Vulgate translation."
    },
    {
        "category": "Titles of Christ",
        "question": "What Greek acronym for 'Jesus Christ, Son of God, Savior' was symbolized by a fish in the early catacombs of Rome?",
        "options": ["ICHTHYS (ΙΧΘΥΣ)", "ALPHA & OMEGA", "CHRISTOS", "KYRIOS"],
        "correctIndex": 0,
        "citation": "Early Church Symbolism / CCC 430",
        "explanation": "Ι-Χ-Θ-Υ-Σ stands for Iēsous Christos Theou Yios Sōtēr (Jesus Christ, Son of God, Savior), forming the Greek word for 'fish'."
    },
    {
        "category": "Liturgical Actions",
        "question": "What physical gesture of reverence (bending the right knee to touch the ground) is made toward the Blessed Sacrament in the Tabernacle?",
        "options": ["Bow of the Head", "Genuflection", "Prostration", "Metania"],
        "correctIndex": 1,
        "citation": "GIRM 274 / CCC 1378",
        "explanation": "Genuflection (from genua flectere, to bend the knee) is an act of adoration reserved for the Holy Eucharist present in the Tabernacle or exposed upon the altar."
    },
    {
        "category": "The Tabernacle",
        "question": "What is the dedicated secure receptacle in every Catholic church where the consecrated Blessed Sacrament is reserved for the sick and for adoration?",
        "options": ["The Ambo", "The Tabernacle (Tabernaculum)", "The Ambry", "The Sacristy"],
        "correctIndex": 1,
        "citation": "GIRM 314-317 / CCC 1379",
        "explanation": "The tabernacle (tent/dwelling of God with men) houses the Real Presence of Jesus Christ in the consecrated species, signified by a continuously burning sanctuary lamp."
    },
    {
        "category": "Sanctuary Lamp",
        "question": "What color lamp or candle kept burning near the tabernacle indicates the Real Presence of Christ in the reserved Eucharist?",
        "options": ["Red Sanctuary Lamp", "Green Sanctuary Lamp", "Blue Sanctuary Lamp", "White Candle only"],
        "correctIndex": 0,
        "citation": "GIRM 316",
        "explanation": "A special lamp, fueled by oil or wax and usually covered in red glass, shines continuously near the tabernacle to indicate and honor the presence of Christ."
    },
    {
        "category": "The Holy Family",
        "question": "Who comprise the earthly Holy Family of Nazareth, the model of all Christian households?",
        "options": ["Jesus, Mary, and Joseph", "Abraham, Sarah, and Isaac", "Zechariah, Elizabeth, and John", "Joachim, Anne, and Mary"],
        "correctIndex": 0,
        "citation": "CCC 533",
        "explanation": "The Holy Family of Jesus, Mary, and Joseph presents the holy sanctuary of silence, domestic prayer, and daily labor."
    },
    {
        "category": "The Sign of Peace",
        "question": "At what point in the Holy Sacrifice of the Mass does the priest invite the congregation to share the Pax (Sign of Peace)?",
        "options": ["Immediately before the Penitential Rite", "After the Lord's Prayer and before the Fraction of the Host (Agnus Dei)", "Immediately after the homily", "After the final dismissal"],
        "correctIndex": 1,
        "citation": "GIRM 82 / Roman Missal",
        "explanation": "The sign of peace precedes Holy Communion, where the faithful implore peace and unity for the Church and express mutual love before receiving the one Body of Christ."
    },
    {
        "category": "Devotion to the Sacred Heart",
        "question": "To which 17th-century French Visitation nun at Paray-le-Monial did Jesus appear, revealing His Sacred Heart inflamed with love for humanity?",
        "options": ["St. Margaret Mary Alacoque", "St. Bernadette Soubirous", "St. Catherine Labouré", "St. Faustina Kowalska"],
        "correctIndex": 0,
        "citation": "Papal Encyclical Haurietis Aquas (1956)",
        "explanation": "Jesus revealed His Sacred Heart to St. Margaret Mary Alacoque, requesting the Feast of the Sacred Heart and First Friday communions of reparation."
    },
    {
        "category": "Divine Mercy Devotion",
        "question": "Which Polish nun and mystic of the Congregation of Our Lady of Mercy recorded Christ's messages of Divine Mercy in her Diary?",
        "options": ["St. Faustina Kowalska", "St. Teresa Benedicta of the Cross (Edith Stein)", "St. Gianna Beretta Molla", "St. Maria Goretti"],
        "correctIndex": 0,
        "citation": "Diary of St. Faustina / St. John Paul II",
        "explanation": "St. Maria Faustina Kowalska was canonized in 2000 by Pope St. John Paul II, who designated the Second Sunday of Easter as Divine Mercy Sunday."
    },
    {
        "category": "Feast of Christ the King",
        "question": "Which Pope instituted the worldwide Solemnity of Our Lord Jesus Christ, King of the Universe, in 1925 with the encyclical 'Quas Primas'?",
        "options": ["Pope Pius XI", "Pope Leo XIII", "Pope St. Pius X", "Pope Benedict XV"],
        "correctIndex": 0,
        "citation": "Quas Primas (1925) / CCC 2105",
        "explanation": "Pope Pius XI instituted the feast to combat rising secularism and proclaim Christ's sovereign reign over individual hearts, families, and civil nations."
    },
    {
        "category": "Priesthood of Christ",
        "question": "In what manner does an ordained Catholic priest act during the Holy Sacrifice of the Mass and the absolution of sins?",
        "options": ["In persona Christi Capitis (in the person of Christ the Head)", "Solely as a community representative", "As an elected congregational spokesman", "As an honorary master of ceremonies"],
        "correctIndex": 0,
        "citation": "Lumen Gentium 10 / CCC 1548",
        "explanation": "Through the Sacrament of Holy Orders, the priest is configured to Christ, acting 'in the person of Christ the Head' to offer the one Sacrifice of Calvary."
    },
    {
        "category": "Universal Call to Holiness",
        "question": "What central teaching of the Second Vatican Council ('Lumen Gentium', Chapter 5) affirms that all Christians in every state of life are called to the fullness of Christian life and perfection of charity?",
        "options": ["The Universal Call to Holiness", "The Doctrine of the Two Swords", "The Temporal Power of the Papacy", "The Cluniac Reform"],
        "correctIndex": 0,
        "citation": "Lumen Gentium 39-42 / CCC 2013",
        "explanation": "'All the faithful, whatever their condition or state, are called by the Lord, each in his own way, to that perfect holiness whereby the Father Himself is perfect.'"
    },
    {
        "category": "The Miraculous Medal",
        "question": "To which French Daughter of Charity nun in the Rue du Bac chapel in Paris did the Blessed Virgin Mary reveal the design of the Miraculous Medal in 1830?",
        "options": ["St. Catherine Labouré", "St. Bernadette Soubirous", "St. Thérèse of Lisieux", "St. Joan of Arc"],
        "correctIndex": 0,
        "citation": "Miraculous Medal History / Holy See",
        "explanation": "Mary appeared to St. Catherine Labouré, instructing her to have a medal struck with the words: 'O Mary, conceived without sin, pray for us who have recourse to thee.'"
    },
    {
        "category": "Our Lady of Lourdes",
        "question": "In 1858, at the Grotto of Massabielle in Lourdes, what name did the heavenly apparition reveal to the young peasant girl St. Bernadette?",
        "options": ["I am the Queen of Heaven", "I am the Immaculate Conception", "I am the Mystical Rose", "I am the Mother of Mercy"],
        "correctIndex": 1,
        "citation": "Lourdes Apparitions (1858) / CCC 491",
        "explanation": "Speaking in the local Occitan dialect, Our Lady proclaimed: 'Que soy era Immaculada Councepciou' ('I am the Immaculate Conception'), confirming the dogma defined four years prior."
    },
    {
        "category": "Our Lady of Fatima",
        "question": "In 1917, to which three shepherd children did the Blessed Virgin Mary appear in Cova da Iria near Fatima, Portugal?",
        "options": ["Lucia dos Santos, and Francisco and Jacinta Marto", "Juan Diego, Maria, and Bernardino", "Bernadette, Therese, and Catherine", "Dominic, Anthony, and Clare"],
        "correctIndex": 0,
        "citation": "Fatima Apparitions (1917) / Congregation for the Doctrine of the Faith",
        "explanation": "Mary appeared six times to Lucia, Francisco, and Jacinta, culminating in the Miracle of the Sun on October 13, 1917, calling for prayer and the daily Rosary."
    },
    {
        "category": "Our Lady of Guadalupe",
        "question": "On whose tilma (cloak) was the miraculous image of Our Lady of Guadalupe imprinted atop Tepeyac Hill in Mexico in 1531?",
        "options": ["St. Juan Diego Cuauhtlatoatzin", "St. Martin de Porres", "St. Peter Claver", "St. Toribio de Mogrovejo"],
        "correctIndex": 0,
        "citation": "Nican Mopohua / Canonization by St. John Paul II",
        "explanation": "When St. Juan Diego unfolded his tilma before Bishop Zumárraga to present Castilian roses, the miraculous image of the Virgin of Guadalupe was revealed on the cactus-fiber cloth."
    },
    {
        "category": "Ecumenical Councils",
        "question": "Which 13th-century Ecumenical Council (1215) under Pope Innocent III mandated annual confession and defined the word 'Transubstantiation'?",
        "options": ["Fourth Lateran Council (Lateran IV)", "First Council of Lyons", "Council of Vienne", "Third Lateran Council"],
        "correctIndex": 0,
        "citation": "Lateran IV (1215) / Denzinger 800",
        "explanation": "The Fourth Lateran Council defined that Jesus Christ is priest and sacrifice, whose body and blood are truly contained in the sacrament of the altar under the forms of bread and wine, transubstantiated by divine power."
    },
    {
        "category": "Catholic Social Teaching",
        "question": "Which groundbreaking 1891 papal encyclical by Pope Leo XIII addressed the condition of the working classes and inaugurated modern Catholic Social Teaching?",
        "options": ["Rerum Novarum", "Quadragesimo Anno", "Pacem in Terris", "Centesimus Annus"],
        "correctIndex": 0,
        "citation": "Leo XIII, Rerum Novarum (1891) / CCC 2420",
        "explanation": "'Rerum Novarum' ('Of Revolutionary Change') defended workers' rights to just wages, fair working hours, private property, and labor unions while refuting unbridled capitalism and socialism."
    },
    {
        "category": "Patron Saints of Nations",
        "question": "Which 5th-century bishop and apostle of Ireland used the three-leaf shamrock to illustrate the Holy Trinity?",
        "options": ["St. Patrick", "St. Columba", "St. Brigid of Kildare", "St. Brendan the Navigator"],
        "correctIndex": 0,
        "citation": "Irish Catholic Tradition",
        "explanation": "St. Patrick evangelized Ireland, baptizing thousands, founding monasteries, and utilizing the clover to explain three Persons in one divine Essence."
    },
    {
        "category": "Catholic Apologetics",
        "question": "What early Church Father and bishop of Antioch was the first to use the phrase 'Catholic Church' (Katholike Ekklesia) around 110 AD?",
        "options": ["St. Ignatius of Antioch", "St. Polycarp of Smyrna", "St. Justin Martyr", "St. Irenaeus of Lyons"],
        "correctIndex": 0,
        "citation": "Epistle to the Smyrnaeans 8:2 / CCC 830",
        "explanation": "St. Ignatius wrote on his way to martyrdom in Rome: 'Wherever Jesus Christ is, there is the Catholic Church.'"
    },
    {
        "category": "Monastic Life & Vows",
        "question": "What are the three evangelical counsels professed as perpetual vows by members of Catholic religious institutes?",
        "options": ["Poverty, Chastity, and Obedience", "Silence, Fasting, and Prayer", "Faith, Hope, and Charity", "Study, Preaching, and Solitude"],
        "correctIndex": 0,
        "citation": "CCC 915 / Canon 573",
        "explanation": "Religious consecrate themselves to God through public profession of the evangelical counsels of poverty, consecrated chastity, and obedience."
    },
    {
        "category": "Holy Water & Sacramentals",
        "question": "What are sacred signs instituted by the Church (such as holy water, crucifixes, rosaries, and ashes) that prepare us to receive grace?",
        "options": ["Sacramentals (Sacramentalia)", "Sacraments", "Amulets", "Relics"],
        "correctIndex": 0,
        "citation": "CCC 1667-1670 / Sacrosanctum Concilium 60",
        "explanation": "Sacramentals are sacred signs that bear a resemblance to the sacraments; they signify effects, especially of a spiritual kind, that are obtained through the Church's intercession."
    },
    {
        "category": "Church Relics",
        "question": "In Catholic theology, what constitutes a 'First-Class Relic' of a canonized saint?",
        "options": ["A physical part of the saint's bodily remains (such as bone, flesh, or hair)", "An item of clothing worn by the saint", "An object touched to the saint's tomb", "A holy card bearing the saint's picture"],
        "correctIndex": 0,
        "citation": "Congregation for the Causes of Saints / CCC 1674",
        "explanation": "First-class relics are parts of the saint's body. Second-class relics are items owned or used by the saint (e.g. habit, rosary). Third-class relics are items touched to a first- or second-class relic."
    },
    {
        "category": "Liturgy of the Hours",
        "question": "What is the official daily liturgical prayer of the Catholic Church, sanctifying the hours of each day through the Psalms and scripture canticles?",
        "options": ["The Liturgy of the Hours (Divine Office / Breviary)", "The Chaplet of Divine Mercy", "The Novena to St. Joseph", "The Angelus"],
        "correctIndex": 0,
        "citation": "Sacrosanctum Concilium 83-101 / CCC 1174",
        "explanation": "The Liturgy of the Hours is the public, constant prayer of the Mystical Body of Christ, uniting priests, consecrated religious, and laity worldwide throughout the day."
    },
    {
        "category": "The Angelus",
        "question": "What traditional Catholic devotion, recited three times daily (morning, noon, and evening) at the sound of church bells, commemorates the Incarnation?",
        "options": ["The Angelus (Angelus Domini nuntiavit Mariae)", "The Regina Caeli", "The Sub Tuum Praesidium", "The Salve Regina"],
        "correctIndex": 0,
        "citation": "Catholic Devotional Tradition / Enchiridion Indulgentiarum",
        "explanation": "The Angelus recalls the Archangel Gabriel's message to Mary and the Word becoming flesh ('Et Verbum caro factum est'). During Eastertide, the 'Regina Caeli' replaces the Angelus."
    },
    {
        "category": "Papal Encyclicals",
        "question": "What is an authoritative circular letter written by the Pope addressed to all bishops, clergy, and faithful worldwide called?",
        "options": ["An Encyclical (Epistola Encyclica)", "A Papal Bull", "An Apostolic Constitution", "A Motu Proprio"],
        "correctIndex": 0,
        "citation": "Vatican Terminology / Magisterium",
        "explanation": "An encyclical is a formal pastoral letter from the Supreme Pontiff guiding the Church on doctrinal, moral, or social teachings."
    },
    {
        "category": "The Latin Vulgate & Trent",
        "question": "Which 1592 edition of the Latin Vulgate, promulgated by Pope Clement VIII following the Council of Trent, served as the standard Bible of the Roman Rite for over three centuries?",
        "options": ["The Clementine Vulgate (Biblia Sacra Vulgata Clementina)", "The Gutenberg Bible", "The Nova Vulgata", "The Complutensian Polyglot"],
        "correctIndex": 0,
        "citation": "Council of Trent / Cum Sacrorum (1592)",
        "explanation": "The Clementine Vulgate was the official standardized text of the Latin Vulgate used throughout the Roman Catholic Church from 1592 until the Nova Vulgata in 1979."
    }
]

def main():
    print(f"Total Bible questions to write: {len(BIBLE_QUESTIONS)}")
    print(f"Total Catholic questions to write: {len(CATHOLIC_QUESTIONS)}")

    # Format into target JSON with ID
    bible_payload = {
        "count": len(BIBLE_QUESTIONS),
        "questions": []
    }
    for idx, q in enumerate(BIBLE_QUESTIONS, start=1):
        bible_payload["questions"].append({
            "id": f"b{idx}",
            "category": q["category"],
            "question": q["question"],
            "options": q["options"],
            "correctIndex": q["correctIndex"],
            "citation": q["citation"],
            "explanation": q["explanation"]
        })

    catholic_payload = {
        "count": len(CATHOLIC_QUESTIONS),
        "questions": []
    }
    from scripts.build_trivia_enrichment import TRIVIA_SOURCES
    for idx, q in enumerate(CATHOLIC_QUESTIONS, start=1):
        qid = f"c{idx}"
        src = TRIVIA_SOURCES.get(qid, {})
        catholic_payload["questions"].append({
            "id": qid,
            "category": q["category"],
            "question": q["question"],
            "options": q["options"],
            "correctIndex": q["correctIndex"],
            "citation": q["citation"],
            "sourceUrl": src.get("sourceUrl", ""),
            "sourcePreview": src.get("sourcePreview", ""),
            "explanation": q["explanation"]
        })

    with open("public/data/bible-quiz.json", "w", encoding="utf-8") as f:
        json.dump(bible_payload, f, indent=2, ensure_ascii=False)
    print("Wrote public/data/bible-quiz.json")

    with open("public/data/catholic-trivia.json", "w", encoding="utf-8") as f:
        json.dump(catholic_payload, f, indent=2, ensure_ascii=False)
    print("Wrote public/data/catholic-trivia.json")

if __name__ == "__main__":
    main()
