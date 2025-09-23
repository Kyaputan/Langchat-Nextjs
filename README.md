# AI Chatbot with LangChain & Next.js

## Overview

โปรเจกต์นี้เป็นการสร้าง **AI Chatbot** โดยใช้ **Next.js** + **LangChain** พร้อมระบบ **UI/UX**, **Chat History**, **Database Integration**, **Optimistic UI** และ **Authentication** ครอบคลุมการทำงานตั้งแต่การ Setup จนถึงการ Optimize การทำงานจริง

---

## 📌 Day 1 – Project Setup

* ติดตั้ง **Next.js**, **TypeScript**, **TailwindCSS**
* ติดตั้ง library เบื้องต้น เช่น `langchain`, `ai`, `shadcn/ui`
* Setup โครงสร้างโปรเจกต์ `src/app`, `src/components`, `src/lib`

---

## 📌 Day 2 – LangChain & Basic Chat

* ใช้ **LangChain** เชื่อมต่อกับ **OpenAI**
* API Routes: `/api/chat`
* ใช้ `useChat` Hook เพื่อดึงข้อมูลจาก API
* สร้าง **UI chat interface** เบื้องต้น

---

## 📌 Day 3 – Streaming Response

* เปิดใช้งาน **Streaming Response** จาก OpenAI
* ใช้ `createStreamableValue` และ `ai/rsc`
* UI สามารถรับข้อความทีละ chunk ได้แบบ real-time

---

## 📌 Day 4 – Improved UI & Session Management

* เพิ่ม **Sidebar** สำหรับ Session List
* สร้าง **Session Management**
* เก็บ **Chat Session Title**
* UI ปรับปรุง: ChatContainer, SidebarTrigger, ScrollButton

---

## 📌 Day 5 – Chat History (Frontend)

* เพิ่ม **Chat History Component**
* ใช้ **shadcn/ui**: `dropdown-menu`, `table`
* เพิ่ม **Model Selector**
* Mock chat history ใน UI
* Component หลัก:

  * `ModelSelector`
  * `ChatHistory`

---

## 📌 Day 6 – Chat History with PostgreSQL

* เชื่อมต่อฐานข้อมูล **PostgreSQL**
* ใช้ `pg` + `PostgresChatMessageHistory`
* จัดการ **Session + Messages**
* ฟีเจอร์:

  * บันทึกข้อความลง DB
  * ดึงประวัติจาก Session ID
  * Streaming response + History
* เพิ่ม **Math/LaTeX Support** ด้วย `katex`, `remark-math`, `rehype-katex`

---

## 📌 Day 7 – Optimistic UI & DB Refactor

* แก้ไข **Login Form**: tabindex, autoComplete, autofill demo
* ลบ `uuid` → ใช้ DB สร้าง Session ID
* สร้าง **database.ts** → Singleton PostgreSQL Connection Pool
* Refactor API Routes ให้ใช้ `getDatabase()`
* สร้าง **api.ts** → จัดการ API endpoints + query params
* Optimize **use-chat-session.ts** → ใช้ `buildApiUrl`

---

## 🛠️ Tech Stack

* **Frontend**: Next.js, TypeScript, TailwindCSS, shadcn/ui
* **Backend**: Next.js API Routes
* **AI**: LangChain, OpenAI
* **Database**: PostgreSQL
* **Utilities**: `pg`, `katex`, `remark-math`, `rehype-katex`

---

## 🚀 Features

* Real-time Streaming Chat
* Multi-Model Selection
* Session Management
* Chat History (DB-backed)
* Optimistic UI Update
* Math/LaTeX Rendering
* Authentication (Login UI)

---

คุณอยากให้ฉันรวม README นี้เป็นไฟล์เดียว (เช่น `README.md`) แล้วส่งกลับมาให้ดาวน์โหลดเลยไหมคะ?
