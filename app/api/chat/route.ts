import { NextRequest } from 'next/server'

// Simple Server-Sent Streaming of AI-like responses.
// If OPENAI_API_KEY is present, you can wire a real provider here later.

export const runtime = 'edge'

function ruleBasedReply(prompt: string): string {
  const p = prompt.toLowerCase()
  if (/your name|who are you|name\??/.test(p)) return "I'm SmartFind Assistant — here to help with lost & found."
  if (/hello|hi|hey/.test(p)) return 'Hello! How can I help you with your lost or found item today?'
  if (/help|how|guide|steps/.test(p)) return 'Tell me whether you lost or found an item, and I\'ll guide you step by step.'
  if (/joke|funny/.test(p)) return 'Why did the key apply to college? Because it heard a lot about master degrees! 🔑'
  return "I can answer in real time. Ask me anything about reporting, matching, safety, or verification."
}

function streamText(text: string): ReadableStream {
  const encoder = new TextEncoder()
  const words = text.split(/(\s+)/)
  return new ReadableStream({
    async start(controller) {
      for (const w of words) {
        controller.enqueue(encoder.encode(w))
        await new Promise(r => setTimeout(r, 20))
      }
      controller.close()
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const last = messages?.[messages.length - 1]?.content || ''

    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      // Call OpenAI for a better response, then stream it back from our server
      const system = {
        role: 'system',
        content:
          'You are SmartFind Assistant, expert in lost & found workflows. Answer briefly, helpfully, safely. If asked general questions (name, jokes), respond naturally.'
      }
      const payload = {
        model: 'gpt-4o-mini',
        messages: [system, ...(messages || []).map((m: any) => ({ role: m.role, content: m.content }))],
        temperature: 0.7,
        stream: false,
      }

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })
      if (r.ok) {
        const data = await r.json()
        const text = data?.choices?.[0]?.message?.content || ruleBasedReply(String(last))
        return new Response(streamText(text), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
          }
        })
      }
    }

    // Fallback: rule-based + streaming
    const answer = ruleBasedReply(String(last))

    return new Response(streamText(answer), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      }
    })
  } catch (e: any) {
    return new Response('Error', { status: 500 })
  }
}


