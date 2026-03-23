export function analyzeWithRules(text) {
  const lower = text.toLowerCase()

  const scamKeywords = [
    { keyword: 'registration fee', label: 'Asks for registration fee upfront' },
    { keyword: 'payment', label: 'Mentions payment from applicant' },
    { keyword: 'earn instantly', label: 'Promises instant earnings' },
    { keyword: 'guaranteed job', label: 'Guarantees job without process' },
    { keyword: 'work from home', label: 'Vague work from home offer' },
    { keyword: 'no experience needed', label: 'No experience or skills required' },
    { keyword: 'unlimited income', label: 'Promises unlimited income' },
    { keyword: 'wire transfer', label: 'Requests wire transfer' },
    { keyword: 'advance fee', label: 'Advance fee required' },
    { keyword: 'send money', label: 'Asks you to send money' },
    { keyword: 'deposit required', label: 'Deposit required to start' },
    { keyword: 'easy money', label: 'Promises easy money' },
    { keyword: 'whatsapp only', label: 'Contact via WhatsApp only' },
    { keyword: 'no interview', label: 'No interview required' },
    { keyword: 'direct joining', label: 'Direct joining without screening' },
    { keyword: 'urgently required', label: 'Urgency pressure tactic used' },
  ]

  const matched = scamKeywords.filter(k => lower.includes(k.keyword))
  const score = Math.min(matched.length * 20, 100)
  const flags = matched.slice(0, 4).map(k => k.label)

  let status = 'Safe'
  if (score >= 40 && score < 70) status = 'Suspicious'
  if (score >= 70) status = 'Scam'

  const reason = matched.length > 0
    ? `Found ${matched.length} scam indicator(s) in this posting.`
    : 'No major scam indicators detected.'

  return { score, status, reason, flags, fallback: true }
}