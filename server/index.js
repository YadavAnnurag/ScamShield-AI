import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'
import { getCached, setCached, getCacheStats } from './cache.js'
import { analyzeWithRules } from './fallback.js'

const app = express()

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const allowedOrigins = [
  'http://localhost:5173',
  'https://scam-shield-ai-gamma.vercel.app/' 
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))


app.use(express.json())

// ─── AI Scam Detection ────────────────────────────────────────────
async function detectScamWithGroq(text) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert job scam detection AI used to protect job seekers.

Analyze the given job posting and respond with ONLY a valid JSON object in this exact format:

{
  "score": <number between 0 and 100>,
  "status": "<Safe | Suspicious | Scam>",
  "reason": "<one sentence overall summary under 20 words>",
  "flags": ["<red flag 1>", "<red flag 2>", "<red flag 3>"]
}

Scoring rules:
- 0 to 39   → Safe
- 40 to 69  → Suspicious
- 70 to 100 → Scam

Red flags to detect:
- Asks for registration fee, deposit, or advance payment
- Promises guaranteed or instant income
- No interview or direct joining
- Vague job with unrealistic salary
- WhatsApp or personal email only contact
- Urgency pressure tactics
- No skills or experience required
- Requests bank details upfront
- Too good to be true offer

Rules:
- Respond with ONLY the JSON object. No markdown, no explanation.
- score must be a number 0-100.
- status must be exactly one of: Safe, Suspicious, Scam.
- reason must be a single sentence under 20 words.
- flags must be an array of 2 to 4 specific red flags found. If none found, return empty array [].`
      },
      {
        role: 'user',
        content: `Analyze this job posting for scam indicators: "${text}"`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  })

  const raw = response.choices[0].message.content
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

// ─── Route ────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text field is required' })
  }

  const cacheKey = text.trim().toLowerCase()

  // 1. Check cache
  const cached = getCached(cacheKey)
  if (cached) {
    return res.json({ ...cached, fromCache: true })
  }

  // 2. Try AI
  try {
    const result = await detectScamWithGroq(text)
    setCached(cacheKey, result)
    return res.json({ ...result, fromCache: false })

  } catch (error) {
    console.error('Groq failed:', error.message)

    // 3. Fallback to rule-based
    console.log('Falling back to rule-based scam detection...')
    const fallbackResult = analyzeWithRules(text)
    return res.json(fallbackResult)
  }
})

// ─── Cache Stats ──────────────────────────────────────────────────
app.get('/api/cache-stats', (req, res) => {
  res.json(getCacheStats())
})

// ─── Start Server ─────────────────────────────────────────────────
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})