import { NextRequest } from "next/server"
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { toUIMessageStream } from "@ai-sdk/langchain"
import { createUIMessageStreamResponse, UIMessage } from "ai"
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres"
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export const maxDuration = 30

const pool = new Pool({
    host: process.env.PG_HOST,                                       // ที่อยู่ database server
    port: Number(process.env.PG_PORT),                               // พอร์ต database (แปลงเป็น number)
    user: process.env.PG_USER,                                       // username สำหรับเข้าถึง database
    password: process.env.PG_PASSWORD,                               // password สำหรับเข้าถึง database
    database: process.env.PG_DATABASE,                               // ชื่อ database ที่ต้องการเชื่อมต่อ
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,  // ! SSL config สำหรับ production
})


// ===============================================
// TODO: POST Method: รับข้อความจากผู้ใช้
// ===============================================
export async function POST(req: NextRequest) {
    try {


        // ==================================================
        // * Step 1: รับข้อมูลจาก client
        // ==================================================
        const { messages, sessionId, userId }: {
            messages: UIMessage[];                    // * รายการข้อความทั้งหมดในการสนทนา 
            sessionId?: string;                       // * ID ของ session ปัจจุบัน (optional)
            userId?: string;                          // * ID ของผู้ใช้ที่ส่งข้อความ
        } = await req.json()

        // ==================================================
        // * Step 2: ตรวจสอบและสร้าง session
        // ==================================================
        let currentSessionId = sessionId

        // ? Step 2.1: ถ้าไม่มี session ID 
        if (!currentSessionId) {
            const client = await pool.connect() // TODO: สร้าง connection ใหม่
            try {
                const firstMessage = messages.find(m => m.role === 'user');
                let title = 'New Chat';                // * title เริ่มต้น

                if (firstMessage && Array.isArray(firstMessage.parts) && firstMessage.parts.length > 0) {
                    const textPart = firstMessage.parts.find(part => part.type === 'text');
                    if (textPart && typeof textPart.text === 'string') {
                        title = textPart.text.slice(0, 50) + (textPart.text.length > 50 ? '...' : '');
                    }
                }

                if (!userId) {
                    throw new Error("User ID is required")
                }

                const result = await client.query(`
            INSERT INTO chat_sessions (title, user_id)
            VALUES ($1, $2)
            RETURNING id
          `, [title, userId])

                currentSessionId = result.rows[0].id

            } finally {
                client.release()
            }
        }

        // ! Step 3: ตรวจสอบความถูกต้องของ session ID
        if (!currentSessionId) {
            throw new Error("Failed to get or create session ID")
        }

        // ==================================================
        // * Step 4: สร้าง prompt และ model
        // ==================================================
        const prompt = ChatPromptTemplate.fromMessages([
            ["system",
                "You are a helpful and friendly AI assistant. Answer in Thai language when user asks in Thai."], // ! ต้องระบุบทบาทของ AI ต้องเขียนดักกัน Injection ไม่งั้น .env จะหลุดได้
            new MessagesPlaceholder("chat_history"),                      // ? placeholder สำหรับประวัติการสนทนา
            ["human", "{input}"],                                         // TODO: placeholder สำหรับ input ของผู้ใช้
        ])

        const model = new ChatOpenAI({
            model: "gpt-4o-mini",                                         // * ระบุรุ่น AI model ที่ใช้
            temperature: 0.7,                                             // * ความสร้างสรรค์
            maxTokens: 1000,                                              // * จำนวน token สูงสุดสำหรับคำตอบ
            streaming: true,                                              // * เปิดใช้ streaming response
        })

        // ==================================================
        // * Step 5: สร้าง chain
        // ==================================================
        const chain = prompt.pipe(model)

        // ==================================================
        // * Step 6: สร้าง message history โดยใช้ PostgresChatMessageHistory ต่อกับตาราง chat_messages ใน PostgreSQL
        // ==================================================
        const messageHistory = new PostgresChatMessageHistory({
            sessionId: currentSessionId,                                  // * ID ของ session ปัจจุบัน
            tableName: "chat_messages",                                   // * ชื่อตารางในฐานข้อมูล
            pool: new Pool({                                              // * สร้าง pool ใหม่สำหรับ message history
                host: process.env.PG_HOST,
                port: Number(process.env.PG_PORT),
                user: process.env.PG_USER,
                password: process.env.PG_PASSWORD,
                database: process.env.PG_DATABASE,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            }),
        })

        // ==================================================
        // * Step 7: สร้าง chain ที่มี message history
        // ==================================================
        const chainWithHistory = new RunnableWithMessageHistory({
            runnable: chain,                                             // chain ที่จะใช้ประมวลผล
            getMessageHistory: () => messageHistory,                     // ฟังก์ชันดึงประวัติข้อความ
            inputMessagesKey: "input",                                   // key สำหรับข้อความ input
            historyMessagesKey: "chat_history",                          // key สำหรับประวัติการสนทนา
        })

        // ==================================================
        // * Step 8: หาข้อความล่าสุดของ user
        // ==================================================
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();  // * หาข้อความล่าสุดของ user
        let input = ""                                                          // * ตัวแปรเก็บข้อความที่จะส่งไป AI

        if (lastUserMessage && Array.isArray(lastUserMessage.parts) && lastUserMessage.parts.length > 0) {
            // * หา part แรกที่เป็นประเภท text
            const textPart = lastUserMessage.parts.find(part => part.type === 'text');
            if (textPart) {
                input = textPart.text;                                              // * ดึงข้อความออกมา
            }
        }

        if (!input) {
            console.warn("Could not extract user input from the message parts."); // ! แสดงคำเตือนใน console
            return new Response("No valid user input found.", { status: 400 });   // ! ส่ง error response กลับ
        }

        const stream = await chainWithHistory.stream(
            {
                input: input,                                                       // * ข้อความจากผู้ใช้
            },
            {
                configurable: {
                    sessionId: currentSessionId,                                      // * ID ของ session สำหรับดึงประวัติ
                },
            }
        )
        // ==================================================                                                      // ส่ง response กลับไปยัง client
        // * Step 9: return response stream ไปหาผู้ใช้
        // ==================================================

        const response = createUIMessageStreamResponse({
            stream: toUIMessageStream(stream),                                    // แปลง stream เป็น UI format
            headers: currentSessionId ? {
                'x-session-id': currentSessionId,                                   // ส่ง session ID ผ่าน header
            } : undefined,
        })

        return response                                                         // ส่ง response กลับไปยัง client

    } catch (error) {
        // ==================================================
        // ! Step 10: จัดการ error
        // ==================================================
        console.error("API Error:", error)
        return new Response(
            JSON.stringify({
                error: "An error occurred while processing your request",          // ข้อความ error หลัก
                details: error instanceof Error ? error.message : 'Unknown error'  // รายละเอียด error
            }),
            {
                status: 500,                                                        // HTTP status 500 = Internal Server Error
                headers: { "Content-Type": "application/json" },                   // กำหนด content type เป็น JSON
            }
        )
    }
}


// ===============================================
// TODO: GET Method: ดึงประวัติข้อความของ Session
// ===============================================
export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url)                               // ดึง query parameters จาก URL
        const sessionId = searchParams.get('sessionId')                         // ดึง sessionId parameter

        if (!sessionId) {
            return new Response(
                JSON.stringify({ error: "Session ID is required" }),               // ข้อความ error
                { status: 400, headers: { "Content-Type": "application/json" } }   // HTTP 400 = Bad Request
            )
        }

        const client = await pool.connect()                                     // เชื่อมต่อ database

        try {

            const result = await client.query(`
          SELECT message, message->>'type' as message_type, created_at
          FROM chat_messages 
          WHERE session_id = $1 
          ORDER BY created_at ASC
        `, [sessionId])

            const messages = result.rows.map((row, index) => {
                const messageData = row.message                                     // ข้อมูล message ในรูปแบบ JSON


                let role = 'user'                                                   // ค่าเริ่มต้น
                if (row.message_type === 'ai') {
                    role = 'assistant'                                                // ข้อความจาก AI
                } else if (row.message_type === 'human') {
                    role = 'user'                                                     // ข้อความจากผู้ใช้
                }

                return {
                    id: `history-${index}`,                                           // unique ID สำหรับ message
                    role: role,                                                       // บทบาทของผู้ส่ง
                    content: messageData.content || messageData.text || messageData.message || '', // เนื้อหาข้อความ
                    createdAt: row.created_at                                         // เวลาที่สร้าง
                }
            })


            return new Response(
                JSON.stringify({ messages }),                                       // ข้อมูลข้อความในรูปแบบ JSON
                {
                    status: 200,                                                      // HTTP 200 = OK
                    headers: { "Content-Type": "application/json" }                   // กำหนด content type
                }
            )
        } finally {
            client.release()                                                      // คืน connection กลับไปยัง pool
        }
    } catch (error) {
        console.error("Error fetching messages:", error)                        // แสดง error ใน console

        return new Response(
            JSON.stringify({
                error: "Failed to fetch messages",                                  // ข้อความ error หลัก
                details: error instanceof Error ? error.message : 'Unknown error'   // รายละเอียด error
            }),
            {
                status: 500,                                                        // HTTP 500 = Internal Server Error
                headers: { "Content-Type": "application/json" }                     // กำหนด content type
            }
        )
    }
}