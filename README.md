# 🎨 Rakugaki Gallery | 落書き美術館

あなたの落書きを世界的美術評論家が大真面目に評価するジョークアプリです。

![App Screenshot](./docs/screenshot.png)

## ✨ Features

- **描画キャンバス**: マウス/タッチ対応の直感的な描画
- **AI評論生成**: Gemini Flash APIによる格調高い（？）美術評論
- **価格算定**: 作品の要素を分析し100万円〜100億円の範囲で価格を決定
- **続編機能**: 同じ「アーティスト」として作品を重ね、価格変動を体験
- **シェア機能**: X/LINE/画像保存で友達に自慢

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js + react-konva
- **State**: Zustand
- **AI**: Google Gemini Flash API
- **Validation**: Zod
- **Animation**: Framer Motion

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- [Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rakugaki-gallery.git
cd rakugaki-gallery

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file with:
# GEMINI_API_KEY=your_api_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API Key | Yes |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/evaluate/       # API route for critique generation
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout with SEO
│   └── page.tsx            # Main application page
├── components/
│   ├── canvas/             # Drawing canvas & toolbar
│   ├── gallery/            # Gallery card & price tag
│   ├── share/              # Share buttons
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── gemini.ts           # Gemini API client
│   ├── prompts.ts          # Art critic prompts
│   ├── parseResponse.ts    # JSON response parser
│   ├── fallback.ts         # Fallback evaluation
│   └── utils.ts            # Utility functions
├── stores/
│   └── galleryStore.ts     # Zustand global state
└── types/
    └── index.ts            # TypeScript + Zod types
```

## 🎭 The Art Critic

**ジャン＝ピエール・デュボワ** (Jean-Pierre Dubois)

パリ国立高等美術学校で教鞭を執り、ヴェネツィア・ビエンナーレの審査員を3度務めた権威。
どんな落書きにも深遠な芸術的意義を見出し、格調高く讃える。

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📄 License

MIT License - feel free to use this project for learning or fun!

## 🙏 Acknowledgments

- Google Gemini API for AI-powered critiques
- The amazing open-source community

---

*This is a joke application. All art critiques are AI-generated parodies and should not be taken seriously.*
