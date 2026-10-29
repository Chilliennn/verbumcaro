# VerbumNobis

A modern, responsive Catholic Bible reader built for parallel study across multiple translations. Designed for both personal devotion and scholarly comparison.

---

## ✨ Features

### For Readers
- **Parallel Two-Panel Reading** — Compare any two translations side-by-side with synchronized scrolling
- **Passage Picker** — Navigate by book, chapter, and verse with intuitive dropdowns
- **Translation Selector** — Switch between 4 Catholic translations instantly
- **Search & Reference Input** — Jump to any verse using natural language (e.g., "John 3:16", "Psalm 23")
- **Light/Dark Mode** — Automatic system detection with manual override
- **Heading Toggle** — Show/hide sectional headings for cleaner reading
- **Verse Synchronization** — Both panels stay aligned on the same passage
- **URL State Sharing** — Share exact panel configurations via URL
- **Fully Responsive** — Works beautifully on desktop, tablet, and mobile
- **Local Persistence** — Your preferences (translations, theme, layout) saved automatically

### For Developers
- **Type-Safe** — Full TypeScript coverage with strict mode
- **Zero-Runtime Dependencies** — Only React/React-DOM in production
- **Static Data Pipeline** — Reproducible builds from source texts
- **Test Coverage** — Unit and integration tests with Vitest
- **CI/CD Ready** — GitHub Pages deployment configured

---

## 📖 Supported Translations

| Code | Translation | Language | Books | Notes |
|------|-------------|----------|-------|-------|
| `catholic_org` | **New Jerusalem Bible** | English | 73 (full Catholic canon) | Modern English, literary quality |
| `sigao` | **思高圣经 (Studium Biblicum)** | Chinese (Simplified) | 73 | Standard Chinese Catholic translation |
| `shinkyo` | **新共同訳 (Shinkyōdōyaku)** | Japanese | 73 | Ecumenical Japanese translation |
| `vulgate` | **Biblia Sacra Vulgata** | Latin | 73 | Public domain, Clementine edition |

All translations include the complete **73-book Catholic canon** (including deuterocanonical books: Tobit, Judith, Wisdom, Sirach, Baruch, 1–2 Maccabees, plus additions to Esther and Daniel).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20.x
- **Python** ≥ 3.11 (for data pipeline only)

### Installation
```bash
# Clone the repository
git clone https://github.com/chilliennn/verbumnobis.git
cd verbumnobis

# Install frontend dependencies
npm install

# (Optional) Set up Python environment for data pipeline
python -m venv .venv
source .venv/bin/activate
pip install -r pipeline/requirements.txt
```

### Development
```bash
# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Validate data integrity
npm run validate:data
```

### Production Build
```bash
# Type-check and build
npm run build

# Preview production build locally
npm run preview
```

---

## 🏗 Project Structure

```
verbumnobis/
├── app/                    # Application entry & routing
├── components/             # React components
│   ├── layout/             # ReaderToolbar, Panel, etc.
│   ├── modals/             # SearchGuideModal, HubModal
│   └── landing/            # HeroSection
├── features/               # Feature-based modules
│   └── references/         # Bible reference parser
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & shared logic
├── pipeline/               # Data pipeline (Python)
│   ├── scrapers/           # Source fetchers (Vulgate, Shinkyo, etc.)
│   ├── parsers/            # Format parsers
│   ├── normalizers/        # Canonical verse normalization
│   ├── validators/         # Data quality checks
│   └── data/               # Raw/intermediate outputs (gitignored)
├── public/
│   └── data/               # Static assets served to browser
│       ├── translations.json      # Translation metadata
│       ├── availability.json      # Book availability per translation
│       └── translations/          # Per-book JSON files
├── scripts/                # Build-time scripts (validate_data.ts)
├── styles.css              # Global styles & CSS variables
├── tests/                  # Vitest test suite
└── vite.config.ts          # Vite configuration
```

---

## 🔧 Data Pipeline

The Bible text data is **not committed** — it's generated from source texts via a reproducible Python pipeline.

### Running the Pipeline
```bash
cd pipeline
source ../.venv/bin/activate

# Full pipeline (all translations)
python run_pipeline.py

# Individual translations
python run_vulgate.py
python run_shinkyo.py
python run_sigao.py
```

### Pipeline Stages
1. **Scrape** — Fetch source texts from authoritative origins
2. **Parse** — Convert raw formats (HTML, XML, custom) to intermediate JSON
3. **Normalize** — Map to canonical verse references (OSIS standard)
4. **Validate** — Check completeness, verse counts, encoding
5. **Export** — Emit per-book JSON files to `public/data/translations/`

### Adding a New Translation
1. Create scraper in `pipeline/scrapers/<name>/`
2. Add parser/normalizer if needed
3. Register in `translations.json` with metadata
4. Run pipeline and commit generated `public/data/`

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage

# UI dashboard
npm run test:ui
```

Test files live in `tests/` and alongside components as `*.test.tsx`.

---

## 🌐 Deployment

Configured for **GitHub Pages** via `gh-pages` package:

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

The `deploy` script runs `npm run build` then pushes `dist/` to the `gh-pages` branch.

**Live demo**: https://chilliennn.github.io/verbumnobis/

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style (ESLint + Prettier configured)
- Write tests for new features
- Update documentation for user-facing changes
- Keep PRs focused and atomic

---

## 📄 License & Legal Notice

### Application Source Code
The web application interface, search index algorithms, and reader code are open source and licensed under the [MIT License](LICENSE).

### Third-Party Content & Intellectual Property
The MIT License **strictly applies only to the software application code**. It does **not** cover, transfer, or license third-party Scripture translations, dictionary datasets, or linguistic resources:
- Scripture texts and linguistic databases remain the intellectual property of their respective copyright holders, Bible societies, and research groups.
- This platform operates strictly as an independent, non-commercial, non-profit academic and devotional study tool. It hosts no advertising, charges no fees, and collects no commercial revenue.

---

## 🙏 Acknowledgments & Copyright Notices

### Scripture Translations
- **Biblia Sacra Vulgata (Latin)**: Clementine Vulgate (1592 edition). Sourced via Sacred-Texts. Public Domain.
- **New Jerusalem Bible (English)**: Text © 1985 by Darton, Longman & Todd Ltd and Doubleday, a division of Penguin Random House LLC. Displayed for comparative theological analysis and personal devotion.
- **思高圣经 (Studium Biblicum Chinese)**: 中文译本版权归属于 **香港方济会思高圣经学会** (Studium Biblicum Franciscanum, Hong Kong, 1968). 供天主教教友、慕道班及学者研读比对之用。
- **新共同訳 (Shinkyōdōyaku Japanese)**: 日本語訳聖書 © **日本聖書協会** (Japan Bible Society), 1987, 1988. Ecumenical edition displayed for cross-language study.

### Linguistic & Lexical Resources
- **JMdict (Japanese Dictionary)**: Property of the **Electronic Dictionary Research and Development Group (EDRDG)**, used in accordance with the [EDRDG Licence](http://www.edrdg.org/edrdg/licence.html) (Creative Commons Attribution-ShareAlike 3.0 / 4.0).
- **Tatoeba Project (Example Sentences)**: Example sentences provided by contributors at [Tatoeba.org](https://tatoeba.org/) under [Creative Commons Attribution 2.0 (CC BY 2.0 FR)](https://creativecommons.org/licenses/by/2.0/fr/).
- **Kuroshiro & Kuromoji**: Morphological analysis and furigana generator libraries under MIT and Apache 2.0 licenses.
- **OSIS Standards**: Open Scripture Information Standard for canonical Bible book abbreviations and verse references.

---

## ⚖️ DMCA & Notice-and-Takedown Policy

VerbumNobis respects intellectual property rights and adheres to the principles of fair dealing and copyright stewardship. 

If you are a copyright owner, Bible society, publisher, or authorized legal representative and believe that any text, translation, or content available on this service infringes upon your copyright:

1. Please submit a notification to our designated contact:
   - **Contact**: `chillien0815@gmail.com`
   - **Subject**: `[Copyright Notice] VerbumNobis Content Review`
2. Please identify the specific translation or passage and evidence of ownership or representation.
3. Upon receipt and validation, the disputed material will be promptly restricted or removed within **7 business days**.

---

## 🌐 Sponsorship & Mission Transparency

VerbumNobis was created out of personal passion to bridge Catholic translations for multilingual study and comparative reading. 

**Why Sponsorship is Mentioned:**
- **Credibility & Trust**: Moving from a temporary `github.io` subdomain to a recognized custom domain (e.g. `verbumnobis.org`) makes the resource look professional, legitimate, and safe for catechists, parish study groups, and university students.
- **Search Engine Discovery (SEO)**: A dedicated top-level domain allows Catholic Scripture students searching for parallel multilingual texts to discover the platform organically on search engines.
- **Infrastructure**: Covering domain registration renewals and CDN bandwidth.

> **Zero Monetization Statement**: The author does not seek personal profit, financial compensation, or fame from this project. Any potential sponsorship is allocated 100% directly to domain registry costs and CDN infrastructure.

---

## 📞 Support & Community

- **Issues & Suggestions** — [GitHub Issues](https://github.com/chilliennn/verbumnobis/issues)
- **Discussions** — [GitHub Discussions](https://github.com/chilliennn/verbumnobis/discussions)
- **Contact** — [chillien0815@gmail.com](mailto:chillien0815@gmail.com)

---

*Verbum Caro factum est et habitavit in nobis* — **And the Word became flesh and dwelt among us** (John 1:14)


