# AI Chatbot with LangChain & Next.js – Consolidated README (Day 1–7)

> โครงการตัวอย่าง: **AI Chatbot** ด้วย **Next.js 15 + App Router**, **LangChain**, **AI SDK**, **PostgreSQL**, และ **shadcn/ui**  
> เอกสารนี้รวมทุกวันที่อบรม (Day1–Day7) ให้เป็น README เดียวที่ใช้งานได้จริง: ตั้งแต่ตั้งค่าเครื่อง, สร้างโปรเจกต์, API, UI/UX, Chat History, Auth, ไปจนถึง Optimistic UI และการปรับปรุงโครงสร้างฐานข้อมูลค่ะ

---

## ✨ Highlights
- ⚡️ **Streaming Chat** ด้วย LangChain + AI SDK (Edge/Node runtime ตาม use case)
- 🧰 **Session & Chat History** (PostgreSQL) พร้อม API ที่ออกแบบให้ production-ready
- 🧩 **UI/UX Components** ด้วย shadcn/ui (chat container, dropdown, table, sidebar, scroll button)
- 🔐 **Auth** (Supabase) + middleware protection + user display name
- 🧮 **Math/LaTeX** rendering ผ่าน KaTeX
- 🚀 **Optimistic UI** + DB connection pool แบบ Singleton
- 🧭 โครงสร้างโปรเจกต์แบบชัดเจน ใช้ได้จริงในงานทีมผลิต

---

## 🧱 Prerequisites
- **Node.js 20+ (แนะนำ 22.x)**
- **Git**
- **VS Code**
- (Optional) **Ollama** สำหรับรันโมเดล local
- (Optional) **PostgreSQL** (Managed หรือ Docker)

ตรวจสอบเครื่องมือ:
```bash
node -v && npm -v && npx -v
git version
code --version
ollama -v    # ถ้าติดตั้ง
```

---

## 🚀 Quick Start
```bash
# 1) สร้างโปรเจกต์ Next.js 15
npx create-next-app@latest aichatbot-langchain-nextjs --typescript --tailwind

cd aichatbot-langchain-nextjs

# 2) ติดตั้ง dependencies หลัก
npm install langchain @ai-sdk/langchain @ai-sdk/react @langchain/core @langchain/openai ai

# 3) UI library (shadcn/ui) – init และเพิ่ม component พื้นฐานตามต้องการ
npx shadcn@latest init

# 4) สร้างไฟล์ env
cp .env.local.example .env.local  # ถ้ามี example
# จากนั้นแก้ไขค่าใน .env.local ตามด้านล่าง
```

**ตัวอย่าง `.env.local`**
```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=aichatbot

# Next.js
NODE_ENV=development
```

รัน development server:
```bash
npm run dev
# เปิด http://localhost:3000
```

---

## 🗂️ Project Structure (ตัวอย่าง)
```
aichatbot-langchain-nextjs/
├── src/
│   └── app/
│       ├── api/
│       │   ├── route.ts
│       │   ├── test/
│       │   │   └── route.ts
│       │   ├── chat/
│       │   │   └── route.ts
│       │   ├── chat_01_start/
│       │   │   └── route.ts
│       │   ├── chat_02_request/
│       │   │   └── route.ts
│       │   ├── chat_03_template/
│       │   │   └── route.ts
│       │   ├── chat_04_stream/
│       │   │   └── route.ts
│       │   ├── chat_05_history/
│       │   │   └── route.ts
│       │   ├── chat_06_history_optimize/
│       │   │   └── route.ts
│       │   ├── chat_06_history_optimistic/
│       │       └── route.ts
│       ├── chat/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── auth/
│       │   ├── layout.tsx
│       │   ├── login/page.tsx
│       │   └── signup/page.tsx
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── src/components/
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   ├── update-password-form.tsx
│   ├── chat-history.tsx
│   ├── model-selector.tsx
│   └── ui/…
├── src/constants/
│   ├── models.ts
│   └── api.ts
├── src/hooks/
│   └── use-chat-session.ts
├── src/lib/
│   ├── client.ts
│   ├── database.ts
│   └── middleware.ts
├── public/
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 📅 Day-by-Day Guide

### Day 1 — Setup & Next.js Basics
**หัวข้อหลัก**
- ติดตั้งและตรวจสอบเครื่องมือ
- สร้าง Next.js 15 App Router
- คำสั่งพื้นฐาน: dev/build/start
- โครงสร้างหน้า `src/app/page.tsx` / เพิ่มหน้า `about`, `contact`

**คำสั่งสำคัญ**
```bash
npx create-next-app@latest
cd aichatbot-langchain-nextjs
npm run dev
npm run build
npm start
```

**เริ่มหน้าแรกอย่างง่าย**
```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to AI Chatbot with LangChain & Next.js</h1>
      <p>This is the home page.</p>
    </main>
  )
}
```

---

### Day 2 — Base APIs & Test Routes
**หัวข้อหลัก**
- Base API `/api/route.ts` รองรับ GET/POST/PUT/DELETE
- Test API `/api/test/route.ts` (รับ query + body)
- เตรียมโครงสร้าง Chat API `/api/chat`

**คำสั่งสำคัญ**
```bash
# ทดสอบ endpoints พื้นฐาน
curl http://localhost:3000/api
curl "http://localhost:3000/api/test?name=John"
curl -X POST http://localhost:3000/api/test -H "Content-Type: application/json" -d '{"name":"Jane"}'
```

**ตัวอย่างโค้ดย่อ Base API**
```ts
// src/app/api/route.ts
import { NextResponse } from "next/server";

export async function GET() { return NextResponse.json({ message: "API Running with GET" }) }
export async function POST() { return NextResponse.json({ message: "API Running with POST" }) }
export async function PUT() { return NextResponse.json({ message: "API Running with PUT" }) }
export async function DELETE() { return NextResponse.json({ message: "Delete request received" }) }
```

**Test API**
```ts
// src/app/api/test/route.ts (สรุปแนวคิด)
import { NextRequest, NextResponse } from "next/server"
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url); const name = searchParams.get("name") || "World";
  return NextResponse.json({ message: `Hello, ${name}!` });
}
export async function POST(req: NextRequest) {
  const data = await req.json(); const name = data.name || "World";
  return NextResponse.json({ message: `Hello, ${name}!` });
}
```

---

### Day 3 — LangChain Prompt & Streaming
**หัวข้อหลัก**
- ใช้ `ChatOpenAI` + `ChatPromptTemplate`
- ทำ chain: `prompt.pipe(model).pipe(parser)`
- เพิ่ม endpoint แบบ **Streaming** (Edge runtime) ด้วย AI SDK

**คำสั่งสำคัญ**
```bash
npm install @langchain/openai @langchain/core
```

**Prompt Template (ย่อ)**
```ts
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'คุณเป็นผู้ช่วยทางการเงินของบริษัท'],
  ['user', '{question}']
])
const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0, maxTokens: 300 })
const chain = prompt.pipe(model).pipe(new StringOutputParser())
```

**Streaming API (แนวทาง)**
- `export const runtime = "edge"`
- รับ `messages` จาก client → แปลงเป็นรูปแบบ model → stream กลับ UI

---

### Day 4 — Auth (Supabase) + Middleware + Layouts
**หัวข้อหลัก**
- ตั้งค่า **Supabase Auth** (Allow new users / Disable confirm email)
- Middleware ปกป้องเส้นทาง (ยกเว้น static, image, favicon, media)
- ปรับปรุง layout: global, auth layout, chat layout
- แสดงชื่อผู้ใช้ (display_name) บนหน้า chat
- ปรับหน้า `page.tsx` (Home) ด้วย Hero + CTA

**คำสั่งสำคัญ**
```bash
# ไม่มีแพ็กเกจจำเป็นเพิ่ม (ขึ้นกับโค้ดฐาน)
```

**จุดสำคัญ**
- ใช้ `createClient()` (Supabase client) ฝั่ง client
- อ่าน `user_metadata.display_name` แสดงใน header
- `middleware.ts` ใช้ regex matcher เพื่อ exclude static assets

---

### Day 5 — UI: Model Selector + Chat History (Frontend)
**หัวข้อหลัก**
- เพิ่ม Components: `ModelSelector`, `ChatHistory`
- shadcn/ui: `dropdown-menu`, `table`
- สร้าง `constants/models.ts` เก็บ **AVAILABLE_MODELS** และ `DEFAULT_MODEL`
- สร้าง Mock chat history และปุ่ม Action (copy, vote, delete, etc.)

**คำสั่งสำคัญ**
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
```

**ไฟล์สำคัญ**
- `src/constants/models.ts`
- `src/components/model-selector.tsx`
- `src/components/chat-history.tsx`

---

### Day 6 — Chat History with PostgreSQL (+ LaTeX)
**หัวข้อหลัก**
- เชื่อมต่อฐานข้อมูล PostgreSQL ด้วย `pg`
- เก็บ session (chat_sessions) + ข้อความ (chat_messages)
- ใช้ `PostgresChatMessageHistory` + `RunnableWithMessageHistory`
- เปลี่ยน runtime เป็น **Node** สำหรับเส้นทางที่ใช้ `pg`
- Streaming + header `x-session-id`
- รองรับ **LaTeX/Math** ด้วย `katex`, `remark-math`, `rehype-katex`

**คำสั่งสำคัญ**
```bash
npm install pg
npm install katex rehype-katex remark-math
npm install @types/katex --save-dev
```

**โครงสร้างตาราง (ตัวอย่างแนะนำ)**
```sql
-- session list
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- message history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
```

**แนวทาง API (ย่อ)**
- `POST /api/chat_05_history`
  - body: `{ messages: UIMessage[], sessionId?: string, userId?: string }`
  - สร้าง session ใหม่อัตโนมัติถ้าไม่มี พร้อมตั้ง title จากข้อความแรกของ user
  - stream คำตอบ + header `x-session-id`
- `GET /api/chat_05_history?sessionId=...`
  - คืน `messages[]` แบบแปลง role (ai → assistant, human → user)

---

### Day 7 — Optimistic UI + DB Pool Singleton + Fixes
**หัวข้อหลัก**
- ลบ `uuid` ฝั่งเซิร์ฟเวอร์ → ให้ DB สร้าง ID (INSERT … RETURNING id)
- สร้าง `src/lib/database.ts` → **Singleton** สำหรับ `Pool`
- ปรับทุก route ที่ใช้ db → `const client = await getDatabase().connect()`
- เพิ่ม `src/constants/api.ts` + `buildApiUrl(...)` สำหรับ compose endpoint + query
- ปรับ `use-chat-session.ts` ให้เรียก endpoint ด้วย helper
- ปรับปรุง `login-form.tsx`: `tabIndex`, `autoComplete`, ปุ่ม **Auto Fill**

**คำสั่งสำคัญ**
```bash
npm uninstall uuid @types/uuid
```

**ไฟล์สำคัญ**
- `src/lib/database.ts`
- `src/constants/api.ts`
- `src/hooks/use-chat-session.ts`
- `src/components/login-form.tsx` (tabIndex + autocomplete + autofill demo)

---

## 🧪 API Endpoints Summary
| Endpoint | Method | Runtime | Description |
|---|---|---|---|
| `/api` | GET/POST/PUT/DELETE | Node/Edge | Base sanity check |
| `/api/test` | GET/POST/PUT/DELETE | Node | ทดสอบ query/body |
| `/api/chat` | POST | Edge | Chat พื้นฐาน / ตัวอย่าง |
| `/api/chat_03_template` | POST | Node/Edge | Prompt Template + Chain |
| `/api/chat_04_stream` | POST | Edge | Streaming Chat |
| `/api/chat_05_history` | GET/POST | **Node** | Streaming + DB-backed history |
| `/api/chat_06_history_optimize` | GET/POST | **Node** | ปรับปรุงประสิทธิภาพ |
| `/api/chat_06_history_optimistic` | GET/POST | **Node** | Optimistic UI + headers |

> หมายเหตุ: เส้นทางที่ใช้ `pg` ต้องใช้ **Node runtime** (ปิด Edge) เพื่อรองรับ Node APIs

---

## 🧩 UI/UX Notes (shadcn/ui)
- ใช้ component หลัก: `DropdownMenu`, `Table`, `Sidebar`, `ScrollButton`, `Button`
- `ChatHistory` รองรับ action เช่น copy, vote, delete
- `ModelSelector` อ่านค่า `AVAILABLE_MODELS` + `DEFAULT_MODEL`
- เคล็ดลับ: ใช้ `cn()` รวม class และจัดเงื่อนไขการแสดงผล

---

## 🧮 LaTeX/Math
- ติดตั้ง: `katex`, `remark-math`, `rehype-katex`
- inline: `\( a^2 + b^2 = c^2 \)` → \( a^2 + b^2 = c^2 \)
- block: `\[ \int_{-\infty}^{\infty} e^{-x^2} = \sqrt{\pi} \]`

---

## 🔐 Authentication (Supabase)
- เปิด **Allow new users to sign up**
- ปิด **Confirm email** (ตาม workshop)
- ส่งผู้ใช้ไป `/auth/login` หลังสมัครสำเร็จ
- หลัง login → redirect `/chat`
- อ่าน `user.user_metadata.display_name` → แสดงบนหน้า chat

**Middleware สำคัญ**
- ป้องกันทุก path ยกเว้น static assets, image optimization, favicon, และนามสกุลรูปภาพ (`.svg|.png|.jpg|.jpeg|.gif|.webp`)

---

## 🗜️ Performance & Reliability
- ใช้ **Connection Pool Singleton** (`getDatabase()`) ลด overhead การเชื่อมต่อซ้ำ
- แยก Node/Edge runtime ให้ตรงงาน (DB → Node / pure compute → Edge)
- ใช้ `dynamic = 'force-dynamic'` สำหรับ route ที่เป็น streaming
- ใส่ `maxDuration` สำหรับป้องกัน long-running

---

## 🧯 Troubleshooting Checklist
- ❗️**OpenAI 401**: ตรวจ `OPENAI_API_KEY` ใน `.env.local`
- ❗️**DB connection error**: ตรวจ `PG_*` env และสิทธิ์ของ DB user
- ❗️**Edge runtime error**: หากใช้ `pg` ต้องย้ายเป็น Node runtime
- ❗️**CORS/Streaming ติดขัด**: ใช้ `createUIMessageStreamResponse` และอย่าทำ static generation ให้ route นั้น
- ❗️**Session ID ไม่ตรง**: ให้ DB สร้าง ID (INSERT … RETURNING) แทน uuid ฝั่งเซิร์ฟเวอร์

---

## 📦 Scripts
```bash
npm run dev           # เริ่ม dev server
npm run build         # สร้าง production build
npm start             # รัน production
npm run lint          # ESLint
```

---

## 🧭 Cheatsheet: Key Commands by Day
```bash
# Day 1
npx create-next-app@latest aichatbot-langchain-nextjs --typescript --tailwind
npm run dev && npm run build && npm start

# Day 2
curl "http://localhost:3000/api/test?name=John"
curl -X POST http://localhost:3000/api/test -H "Content-Type: application/json" -d '{"name":"Jane"}'

# Day 3
npm install @langchain/openai @langchain/core

# Day 4
# (ปรับ middleware + layout + auth ไม่มีแพ็กเกจเพิ่มจำเป็น)

# Day 5
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table

# Day 6
npm install pg
npm install katex rehype-katex remark-math
npm install @types/katex --save-dev

# Day 7
npm uninstall uuid @types/uuid
```

---

## 📌 Notes for Production
- เก็บ secret ด้วย Secret Manager/CI (ไม่ push `.env.local`)
- เปิด SSL (DB) และปรับ role/permission ให้เหมาะสม
- เปิด log/monitoring: connection pool, query time, error rate
- ทำ index ในตาราง messages เพิ่มเติมตาม query pattern จริง
- เพิ่ม backoff/retry ในฝั่ง client เมื่อ stream หลุด
- ทำ rate limiting & auth middleware ให้ endpoints ที่สำคัญ

---
