# ResumeLoops — Independent Project

A modern, publication-quality AI-powered resume builder engineered with deterministic ATS scoring and editorial design precision, inspired by Google Stitch.

---

## 🏗️ Project Overview

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 with custom Stitch design tokens
- **Design System Reference**: `design-reference/resumeloops_design_system/DESIGN.md`

---

## 🎨 Design System Tokens

The user interface follows the Stitch editorial design guidelines:
- **Warm Ivory Canvas**: `#FAF9F6`
- **Pure White Containers**: `#FFFFFF`
- **Primary Typography**: `#171717` (Near-Black)
- **Primary Indigo Accent**: `#5145E5`
- **Secondary Lavender**: `#EEEBFF`
- **Subtle Warm Borders**: `#E9E6E0`
- **Typography**: Inter (Google Fonts) with tight display tracking

---

## 🚀 Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Type-check
npm run type-check

# 3. Lint
npm run lint

# 4. Run local development server
npm run dev

# 5. Production build
npm run build
```

---

## 📁 Repository Structure

```
ResumeLoops/
├── design-reference/      # Preserved Google Stitch design specifications & screen HTML
├── src/
│   ├── app/
│   │   ├── globals.css    # Stitch design tokens & Tailwind v4 theme
│   │   ├── layout.tsx     # Root HTML layout with Inter font
│   │   └── page.tsx       # Verified scaffold landing view
│   ├── components/
│   │   └── ui/            # Reusable UI primitives (Button, Badge, Header)
│   ├── lib/               # Utility functions & helpers
│   └── types/             # TypeScript definitions
├── .env.example           # Safe placeholder environment configuration
├── .gitignore             # Comprehensive ignore rules
├── eslint.config.mjs      # ESLint 9 configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── postcss.config.mjs     # PostCSS Tailwind v4 configuration
└── tsconfig.json          # Strict TypeScript configuration
```
