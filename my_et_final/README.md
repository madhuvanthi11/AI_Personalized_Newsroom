# My ET — AI Personalized Newsroom
### Economic Times Hackathon | Multi-Agent AI News Platform

---

## 🚀 Quick Start (5 minutes)

### Step 1 — Get Free API Keys (2 minutes)

| Service | Purpose | Sign up |
|---------|---------|---------|
| **Groq AI** | AI chat, video scripts, greetings | https://console.groq.com → API Keys → Create |
| **GNews** | Real-time news fetching | https://gnews.io → Register → API Key |

Both are **completely free** with generous limits.

---

### Step 2 — Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env and add your keys:
#   VITE_GROQ_API_KEY=gsk_xxxxx
#   VITE_GNEWS_API_KEY=xxxxx

npm install
npm run dev
```

Open **http://localhost:5173** ✅

The frontend works **without the backend** — it fetches news directly from GNews and uses Groq AI directly from the browser.

---

### Step 3 — Backend Setup (optional, for full multi-agent system)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add: GROQ_API_KEY=gsk_xxxxx  GNEWS_API_KEY=xxxxx

python main.py
```

Backend runs at **http://localhost:8000**

---

## 🤖 Where Gen AI is Used (Hackathon Criteria)

| Feature | AI Used | How |
|---------|---------|-----|
| **AI Chat Assistant** | Groq `llama-3.3-70b` | RAG: live news articles injected as context. Role-specific system prompts (ARIA/NOVA/SAGE/NEXUS/etc.) |
| **Avatar Greetings** | Groq `llama-3.3-70b` | Dynamic personalized greeting generated from real news every session |
| **AI Video Studio** | Groq `llama-3.3-70b` | Generates 4-section broadcast script (Hook/Main/Context/Close) + browser TTS narration |
| **Story Arc Analysis** | Groq `llama-3.3-70b` | On-demand 2-sentence analysis of evolving story significance |
| **Search Insight** | Groq `llama-3.3-70b` | AI-generated summary of search results in role-specific voice |
| **Content Processing** | Groq `llama-3.3-70b` | Summarizes RSS articles, extracts entities, scores role relevance |
| **Breaking News Detection** | Groq `llama-3.3-70b` | Classifies impact level, generates alert messages, assigns role targets |
| **Translation** | MyMemory API + Groq fallback | Hindi, Tamil, Malayalam, Telugu, Bengali, Marathi |

---

## 🏗️ Multi-Agent Architecture

```
User Request
     │
     ▼
┌─────────────────────────────────┐
│       ORCHESTRATOR AGENT        │  Routes tasks, coordinates pipeline
└─────────────────────────────────┘
     │
     ├──► NEWS INGESTION AGENT      GNews API + 15 RSS feeds → raw articles
     ├──► CONTENT PROCESSING AGENT  Groq: summarize, extract entities, score relevance
     ├──► STORY CLUSTERING AGENT    Group related articles by category + semantics
     ├──► BREAKING NEWS AGENT       Groq: detect high-impact events → alerts
     ├──► PERSONALIZATION AGENT     Rank articles by role + behavior signals
     ├──► USER PROFILE AGENT        Track interests from behavior events
     ├──► CONVERSATION AGENT        Groq + RAG: answer user questions with news context
     ├──► AVATAR PERSONALITY AGENT  Groq: generate role-specific greetings/insights
     ├──► STORY ARC AGENT           Build evolving timelines + Groq analysis
     └──► LOCALIZATION AGENT        MyMemory API + Groq: translate to 6 Indian languages
```

---

## 🎭 8 User Roles + AI Avatars

| Role | Avatar | Focus |
|------|--------|-------|
| Investor | ARIA 📈 | Markets, RBI, portfolio |
| Startup Founder | NOVA 🚀 | Funding, competitors, M&A |
| Student | SAGE 📚 | Explained news, concepts |
| Policy Analyst | NEXUS 🌍 | Policy, geopolitics, macro |
| Cinema Enthusiast | REEL 🎬 | Box office, OTT, awards |
| Sports Fan | ACE 🏏 | Cricket, IPL, sports business |
| Literature Enthusiast | QUILL 📖 | Books, authors, publishing |
| Entrepreneur | FORGE ⚙️ | MSME, GST, market opportunities |

---

## 🎬 Hackathon Demo Flow (3 minutes)

1. **Open app** → splash screen → "Get Started"
2. **Select role** → e.g. "Investor" → Enter name → "Launch My Newsroom"
3. **Dashboard loads** with:
   - Live GNews articles (real-time, no placeholders)
   - ARIA avatar with Groq-generated greeting
   - Breaking news alert pops up (sound)
4. **Search** → type "RBI" → see AI search insight from Groq
5. **Click "Ask AI"** on any article → Chat opens with article pre-filled
   - Ask: "What does this mean for my portfolio?" → Groq responds with news context
6. **Click "🎬 Video Studio"** on any article → Groq generates broadcast script → play with TTS
7. **Story Arc Tracker** → click "Analyze with Groq AI" → 2-sentence analysis
8. **Change language** → Tamil/Hindi → articles translate via MyMemory API

---

## 📁 Project Structure

```
my_et_project/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root routing
│   │   ├── pages/
│   │   │   ├── OnboardingPage.jsx     # 8-role selection + name
│   │   │   └── DashboardPage.jsx      # Main dashboard
│   │   ├── components/
│   │   │   ├── AvatarPanel.jsx        # AI avatar + greeting
│   │   │   ├── ChatAssistant.jsx      # Groq chat with RAG
│   │   │   ├── NewsFeed.jsx           # Real-time articles
│   │   │   ├── StoryArcTracker.jsx    # Evolving story timelines
│   │   │   ├── VideoStudio.jsx        # AI video script + TTS
│   │   │   └── index.jsx              # LanguageSwitcher, NotificationBell, BreakingNewsAlert
│   │   ├── services/
│   │   │   ├── groqService.js         # Groq AI: chat, video, greetings, search
│   │   │   ├── gnewsService.js        # GNews: real-time news for all 8 roles
│   │   │   └── translationService.js  # MyMemory: 6 Indian languages
│   │   └── data/
│   │       └── demoData.js            # Avatars, tabs, story arcs, breaking alerts
│   └── .env.example
│
└── backend/
    ├── main.py                        # FastAPI server
    ├── agents/
    │   ├── orchestrator.py            # Coordinates all agents
    │   ├── news_ingestion_agent.py    # GNews + RSS fetcher
    │   ├── content_processing_agent.py# Groq: summarize + entity extract
    │   ├── breaking_news_agent.py     # Groq: detect high-impact news
    │   ├── conversation_agent.py      # Groq + RAG: chatbot
    │   ├── avatar_personality_agent.py# Groq: role-specific greetings
    │   ├── story_arc_agent.py         # Real story timelines + Groq analysis
    │   ├── localization_agent.py      # MyMemory + Groq translation
    │   ├── personalization_agent.py   # Rank articles by role + behavior
    │   ├── story_clustering_agent.py  # Group articles by category
    │   └── user_profile_agent.py      # Track user interests
    ├── database/db.py                 # SQLite: users, articles, alerts
    ├── rag/pipeline.py                # In-memory keyword RAG
    ├── notifications/service.py       # Breaking alert management
    └── personalization/engine.py      # Behavior tracking + feed ranking
```
