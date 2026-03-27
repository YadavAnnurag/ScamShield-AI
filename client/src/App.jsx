import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from './ImageUploader'

const statusConfig = {
  Safe: {
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.35)',
    bg: 'rgba(74,222,128,0.12)',
    border: 'rgba(74,222,128,0.35)',
    emoji: '✅',
    label: 'SAFE',
    sub: 'This job posting appears legitimate.'
  },
  Suspicious: {
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.35)',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.35)',
    emoji: '⚠️',
    label: 'SUSPICIOUS',
    sub: 'Proceed with caution. Verify before applying.'
  },
  Scam: {
    color: '#f87171',
    glow: 'rgba(248,113,113,0.35)',
    bg: 'rgba(248,113,113,0.12)',
    border: 'rgba(248,113,113,0.35)',
    emoji: '🚨',
    label: 'SCAM DETECTED',
    sub: 'Do NOT share personal info or pay any fees.'
  }
}


function ScoreRing({ score, color }) {
  const radius = 54
  const stroke = 7
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        {/* Background ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Score ring */}
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      {/* Score number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center"
      >
        <span className="text-4xl font-black text-white leading-none">{score}</span>
        <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          / 100
        </span>
      </motion.div>
    </div>
  )
}

function App() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEmpty = !inputText.trim()
  const config = result?.status ? statusConfig[result.status] : null

  const handleTextExtracted = (text) => {
    setInputText(text)
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (isEmpty || loading) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      setResult(data)

    } catch (err) {
      setError('Cannot reach server. Is your backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-xl rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >

        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-7"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ScamShield AI
            </h1>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(99,102,241,0.25)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#a5b4fc'
              }}
            >
              AI POWERED
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Detect fake job postings instantly. Protect yourself before it's too late.
          </p>
        </motion.div>

        {/* ── Image Uploader ─────────────────────────── */}
        <ImageUploader onTextExtracted={handleTextExtracted} />

        {/* ── Divider ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            or paste job text
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* ── Textarea ───────────────────────────────── */}
        <textarea
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setResult(null); setError(null) }}
          placeholder="Paste job description, WhatsApp message, or offer letter here..."
          rows={5}
          className="w-full rounded-2xl p-4 text-sm leading-relaxed resize-none focus:outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${inputText ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
            color: 'white',
            caretColor: '#a5b4fc',
          }}
        />

        {/* Character count */}
        <div className="flex justify-end mt-1 mb-4">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {inputText.length} characters
          </span>
        </div>

        {/* ── Analyze Button ─────────────────────────── */}
        <motion.button
          onClick={handleAnalyze}
          disabled={isEmpty || loading}
          whileHover={!isEmpty && !loading ? { scale: 1.02, y: -1 } : {}}
          whileTap={!isEmpty && !loading ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="w-full font-bold py-3.5 rounded-2xl text-sm tracking-wide transition-all duration-300"
          style={{
            background: isEmpty || loading
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: isEmpty ? 'rgba(255,255,255,0.3)' : 'white',
            cursor: isEmpty || loading ? 'not-allowed' : 'pointer',
            boxShadow: !isEmpty && !loading
              ? '0 0 24px rgba(99,102,241,0.4)'
              : 'none',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Analyzing with AI...
            </span>
          ) : (
            '🔍 Analyze Job Posting'
          )}
        </motion.button>

        {/* ── Error ──────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-xl px-4 py-3 text-sm text-center"
              style={{
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: '#fca5a5'
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ────────────────────────────────── */}
        <AnimatePresence>
          {result && config && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-6"
            >

              {/* Cache / Fallback badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {result.fromCache && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(74,222,128,0.12)',
                      border: '1px solid rgba(74,222,128,0.3)',
                      color: '#86efac'
                    }}
                  >
                    ⚡ Cached Result
                  </span>
                )}
                {result.fallback && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(251,191,36,0.12)',
                      border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fde68a'
                    }}
                  >
                    ⚠️ Rule-based (AI unavailable)
                  </span>
                )}
              </div>

              {/* ── Main Result Card ── */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="rounded-2xl p-6 mb-4"
                style={{
                  background: config.bg,
                  border: `1px solid ${config.border}`,
                  boxShadow: `0 0 40px ${config.glow}`,
                }}
              >
                {/* Top row: ring + status */}
                <div className="flex items-center gap-6 mb-5">
                  <ScoreRing score={result.score} color={config.color} />

                  <div className="flex-1">
                    {/* Status badge */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
                      style={{
                        background: `${config.color}22`,
                        border: `1px solid ${config.color}55`,
                      }}
                    >
                      <span className="text-base">{config.emoji}</span>
                      <span
                        className="text-sm font-black tracking-widest"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </span>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {config.sub}
                    </motion.p>

                    {/* Risk label */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="text-xs mt-2 font-semibold"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      RISK SCORE: {result.score}/100
                    </motion.p>
                  </div>
                </div>

                {/* Score bar */}
                <div
                  className="w-full rounded-full h-1.5 mb-1"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <motion.div
                    className="h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    style={{
                      background: `linear-gradient(90deg, #4ade80, ${config.color})`,
                      boxShadow: `0 0 8px ${config.color}`
                    }}
                  />
                </div>
                <div
                  className="flex justify-between text-xs"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  <span>0 — Safe</span>
                  <span>40 — Suspicious</span>
                  <span>70 — Scam</span>
                </div>
              </motion.div>

              {/* ── AI Reason ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  🤖 AI Assessment
                </p>
                <p className="text-sm text-white leading-relaxed">
                  {result.reason}
                </p>
              </motion.div>

              {/* ── Red Flags ── */}
              {result.flags && result.flags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    🚩 Red Flags Detected
                  </p>
                  <ul className="space-y-2">
                    {result.flags.map((flag, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: 'rgba(255,255,255,0.75)' }}
                      >
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                          style={{
                            background: config.bg,
                            border: `1px solid ${config.border}`,
                            color: config.color
                          }}
                        >
                          !
                        </span>
                        {flag}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* ── No flags for Safe ── */}
              {result.flags && result.flags.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: 'rgba(74,222,128,0.06)',
                    border: '1px solid rgba(74,222,128,0.15)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'rgba(74,222,128,0.8)' }}>
                    ✓ No red flags detected in this posting.
                  </p>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Impact Section ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3 text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Why This Matters
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { stat: '7.5M+', label: 'Indians scammed yearly' },
              { stat: '₹26Cr', label: 'Lost to job fraud in 2023' },
              { stat: '3 sec', label: 'To scan any posting' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.08 }}
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-base font-black text-white">{item.stat}</p>
                <p
                  className="text-xs mt-0.5 leading-tight"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* ── Footer ─────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-xs"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        ScamShield AI — Built to protect job seekers
      </motion.p>

    </div>
  )
}

export default App