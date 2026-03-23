# 🛡️ ScamShield AI

> Detect fake job postings instantly using AI.

![ScamShield Demo](./demo.png)

## 🚀 Live Demo
🌐 **Frontend:** https://your-app.vercel.app
🔗 **Backend:** https://scamshield-api.onrender.com

---

## 💡 Problem
7.5 million Indians fall victim to job scams every year.
Fraudulent job postings on WhatsApp and job boards trick
people into paying fake "registration fees" and sharing
personal details with scammers.

## ✅ Solution
ScamShield AI analyzes any job posting in under 3 seconds
and returns a risk score, status, and clear reasoning —
powered by Llama 3.3 70B via Groq.

---

## 🧱 Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React + Vite + Tailwind |
| Animations| Framer Motion           |
| Backend   | Node.js + Express       |
| AI        | Groq (Llama 3.3 70B)    |
| OCR       | Tesseract.js            |
| Hosting   | Vercel + Render         |

---

## ⚙️ How It Works
```
User pastes job text or uploads screenshot
              ↓
React sends POST to Express backend
              ↓
Cache checked → AI called if not cached
              ↓
Groq AI returns score + status + red flags
              ↓
Result displayed with color-coded UI
```

---

## 🏃 Run Locally

### Backend
```bash
cd server
npm install
# create .env with GROQ_API_KEY=your-key
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Server
| Variable       | Description          |
|----------------|----------------------|
| GROQ_API_KEY   | Groq API key         |

### Client
| Variable       | Description          |
|----------------|----------------------|
| VITE_API_URL   | Backend URL          |

---

## 👨‍💻 Built by
Anurag Yadav — [github.com/YadavAnnurag](https://github.com/YadavAnnurag/)
