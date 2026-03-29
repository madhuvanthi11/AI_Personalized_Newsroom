// demoData.js — My ET: AI Personalized Newsroom
// All roles, avatars, story arcs, breaking alerts, chat suggestions

// ─── AVATAR CONFIGS ────────────────────────────────────────────────────────

export const AVATAR_CONFIGS = {
  investor: {
    name: "ARIA", fullName: "Advanced Returns & Intelligence Assistant",
    emoji: "📈", avatarBg: "bg-amber-500", gradient: "from-amber-500 to-orange-500",
    color: "#F59E0B", accent: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10",
    greetings: [
      "Good morning! Markets are showing early volatility — your watchlist needs attention. Nifty futures point to a cautious open. Let me show you what matters most today.",
      "Hello! Banking and IT sectors are driving early momentum. Three of your tracked stocks have major news updates. Your AI briefing is ready.",
      "Morning! RBI commentary is the story of the day. Interest-rate sensitive stocks in your portfolio may see movement. I've prepared your daily impact analysis.",
    ],
  },
  founder: {
    name: "NOVA", fullName: "Network & Opportunities Venture Assistant",
    emoji: "🚀", avatarBg: "bg-violet-500", gradient: "from-violet-500 to-purple-600",
    color: "#8B5CF6", accent: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/10",
    greetings: [
      "Hey! Three fintech startups raised Series B rounds overnight — the funding ecosystem is buzzing. Your competitor tracker has 2 new moves. Let's dive in!",
      "Good morning, founder! D2C and SaaS sectors are hot right now. I've spotted 5 market gaps worth exploring today.",
      "Rise and build! Two major acquisitions happened in your sector overnight. M&A activity is up 40% this quarter.",
    ],
  },
  student: {
    name: "SAGE", fullName: "Student Advisory & Growth Engine",
    emoji: "📚", avatarBg: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500",
    color: "#10B981", accent: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10",
    greetings: [
      "Good morning! Today's top story is about inflation — and it's actually fascinating! I'll explain it with examples you'll remember.",
      "Hey! The Union Budget is all over the news today. Don't worry — I'll break it down step by step so it actually makes sense!",
      "Morning! Today we'll explore why interest rates matter to everyone, not just bankers. Plus a startup story that'll inspire you!",
    ],
  },
  policy_analyst: {
    name: "NEXUS", fullName: "National & Economic Xpert for Understanding Signals",
    emoji: "🌍", avatarBg: "bg-blue-500", gradient: "from-blue-500 to-cyan-500",
    color: "#3B82F6", accent: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10",
    greetings: [
      "Good morning. The RBI's monetary policy committee meets today — all signals point to a hold, but the commentary will be crucial.",
      "Good morning. Geopolitical tensions are creating ripple effects in energy policy. India's trade balance data releases today.",
      "Morning brief: The Finance Ministry's new FDI framework changes the landscape for three sectors. Full analysis ready.",
    ],
  },
  cinema_enthusiast: {
    name: "REEL", fullName: "Real-time Entertainment & Earnings Lens",
    emoji: "🎬", avatarBg: "bg-pink-500", gradient: "from-pink-500 to-rose-500",
    color: "#EC4899", accent: "text-pink-400", border: "border-pink-500/30", bg: "bg-pink-500/10",
    greetings: [
      "Lights, camera, action! Box office numbers are in — a major surprise hit crossed ₹100 crore in just 3 days. Your entertainment briefing is live!",
      "Good morning, film lover! OTT wars are heating up — Netflix, Prime, and Jio Cinema all announced big releases this week.",
      "Hey! Award season is creating buzz — two Indian films are Oscar contenders this year. The entertainment economy is at a record high!",
    ],
  },
  sportsperson: {
    name: "ACE", fullName: "Athletic & Commerce Engine",
    emoji: "🏏", avatarBg: "bg-orange-500", gradient: "from-orange-500 to-red-500",
    color: "#F97316", accent: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10",
    greetings: [
      "Game day! IPL auction results are reshaping team strategies — three unexpected buys could change the tournament dynamics. Your sports briefing is ready.",
      "Morning! The Indian cricket team's new sponsorship deal just broke records. Sports business is booming — ₹3,000 crore in deals this month alone.",
      "Hey champion! The BCCI's latest broadcast rights deal could change how you watch cricket forever. Plus fantasy league insights just updated!",
    ],
  },
  literature_enthusiast: {
    name: "QUILL", fullName: "Quality Understanding of Ideas & Literary Landscape",
    emoji: "📖", avatarBg: "bg-indigo-500", gradient: "from-indigo-500 to-purple-500",
    color: "#6366F1", accent: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/10",
    greetings: [
      "Good morning, reader! The Booker Prize longlist just dropped — three Indian authors made it this year! Your literary digest is ready.",
      "Hello! A major Indian publisher just closed a ₹500 crore deal with an international conglomerate. The publishing world is changing fast.",
      "Morning! Audible India reports 300% growth in regional language audiobooks. The Indian reading renaissance is very much real!",
    ],
  },
  entrepreneur: {
    name: "FORGE", fullName: "Future Opportunities & Revenue Growth Engine",
    emoji: "⚙️", avatarBg: "bg-teal-500", gradient: "from-teal-500 to-cyan-600",
    color: "#14B8A6", accent: "text-teal-400", border: "border-teal-500/30", bg: "bg-teal-500/10",
    greetings: [
      "Good morning! New GST simplification rules take effect today — your compliance costs just dropped. Three new business opportunities have opened up.",
      "Hey entrepreneur! The government's MSME credit guarantee scheme just expanded to ₹5 lakh crore. Funding your next phase just got easier.",
      "Morning! Export opportunities in 4 new sectors emerged this week. Plus the PM's Vishwakarma scheme is now accepting applications.",
    ],
  },
};

export const getAvatarConfig = (role) => AVATAR_CONFIGS[role] || AVATAR_CONFIGS.investor;

// ─── ROLE TABS ─────────────────────────────────────────────────────────────

export const ROLE_TABS = {
  investor: [
    { id: "portfolio", label: "Portfolio Impact", icon: "📈" },
    { id: "market", label: "Market Movers", icon: "🚀" },
    { id: "sector", label: "Sector Trends", icon: "🏭" },
    { id: "economic", label: "Economic Signals", icon: "📊" },
    { id: "briefings", label: "AI Briefings", icon: "🤖" },
  ],
  founder: [
    { id: "funding", label: "Startup Funding", icon: "💰" },
    { id: "competitors", label: "Competitor Watch", icon: "🔍" },
    { id: "opportunities", label: "Market Gaps", icon: "🌱" },
    { id: "deals", label: "M&A Deals", icon: "🤝" },
  ],
  student: [
    { id: "explained", label: "News Explained", icon: "📚" },
    { id: "learn", label: "Learn Business", icon: "🎓" },
    { id: "concepts", label: "Concepts", icon: "💡" },
    { id: "quiz", label: "Quiz", icon: "❓" },
  ],
  policy_analyst: [
    { id: "policy", label: "Policy Tracker", icon: "📋" },
    { id: "global", label: "Global Economy", icon: "🌍" },
    { id: "regulations", label: "Regulations", icon: "⚖️" },
    { id: "geopolitics", label: "Geopolitics", icon: "🗺️" },
  ],
  cinema_enthusiast: [
    { id: "boxoffice", label: "Box Office", icon: "🎬" },
    { id: "ott", label: "OTT Streaming", icon: "📺" },
    { id: "awards", label: "Awards & Festivals", icon: "🏆" },
    { id: "industry", label: "Film Industry", icon: "🎥" },
  ],
  sportsperson: [
    { id: "cricket", label: "Cricket & IPL", icon: "🏏" },
    { id: "football", label: "Football", icon: "⚽" },
    { id: "business", label: "Sports Business", icon: "💼" },
    { id: "athlete", label: "Athlete News", icon: "🥇" },
  ],
  literature_enthusiast: [
    { id: "books", label: "New Releases", icon: "📖" },
    { id: "awards", label: "Literary Awards", icon: "🏆" },
    { id: "publishing", label: "Publishing Biz", icon: "🏢" },
    { id: "authors", label: "Author Profiles", icon: "✍️" },
  ],
  entrepreneur: [
    { id: "opportunities", label: "Opportunities", icon: "🌱" },
    { id: "policy", label: "Policy & GST", icon: "📋" },
    { id: "funding", label: "MSME Funding", icon: "💰" },
    { id: "market", label: "Market Entry", icon: "🚪" },
  ],
};

export const getRoleTabs = (role) => ROLE_TABS[role] || ROLE_TABS.investor;

// ─── BREAKING ALERTS ───────────────────────────────────────────────────────

export const BREAKING_ALERTS = [
  {
    id: "alert001",
    message: "RBI raises repo rate by 25bps to 6.75% — banking stocks react sharply",
    impact_level: "high", category: "policy", icon: "🔴", time: "2 min ago",
    affected_roles: ["investor", "policy_analyst", "founder", "student", "entrepreneur"],
  },
  {
    id: "alert002",
    message: "Sensex drops 800 points on US Fed rate uncertainty",
    impact_level: "high", category: "markets", icon: "📉", time: "5 min ago",
    affected_roles: ["investor"],
  },
  {
    id: "alert003",
    message: "Zepto raises $350M Series F at $5B valuation, targets IPO in 2026",
    impact_level: "medium", category: "startup", icon: "🚀", time: "12 min ago",
    affected_roles: ["founder", "investor"],
  },
  {
    id: "alert004",
    message: "India GDP growth revised to 7.4% — beats IMF forecast by 60bps",
    impact_level: "high", category: "policy", icon: "🌍", time: "18 min ago",
    affected_roles: ["investor", "policy_analyst", "student", "entrepreneur"],
  },
  {
    id: "alert005",
    message: "IPL 2025 media rights cross ₹48,000 crore — new record",
    impact_level: "high", category: "sports", icon: "🏏", time: "25 min ago",
    affected_roles: ["sportsperson", "investor", "entrepreneur"],
  },
  {
    id: "alert006",
    message: "Pathaan 2 crosses ₹500 crore globally in opening weekend",
    impact_level: "medium", category: "cinema", icon: "🎬", time: "1h ago",
    affected_roles: ["cinema_enthusiast", "investor"],
  },
  {
    id: "alert007",
    message: "Jhumpa Lahiri wins Man Booker Prize 2025 — first Indian-American in a decade",
    impact_level: "medium", category: "literature", icon: "📖", time: "2h ago",
    affected_roles: ["literature_enthusiast"],
  },
  {
    id: "alert008",
    message: "GST simplified for MSMEs: filing frequency cut from monthly to quarterly",
    impact_level: "high", category: "policy", icon: "⚙️", time: "3h ago",
    affected_roles: ["entrepreneur", "founder", "policy_analyst"],
  },
];

// ─── STORY ARCS (real events) ──────────────────────────────────────────────

export const STORY_ARCS = [
  {
    id: "arc001",
    topic: "Tesla India Entry",
    emoji: "⚡",
    status: "evolving",
    summary: "Tesla's India launch progressed from trademark filing to showroom planning after PM Modi's meeting with Elon Musk.",
    events: [
      { date: "Nov '23", headline: "Tesla files India trademark in key categories", done: true },
      { date: "Jun '24", headline: "Elon Musk–PM Modi meeting in New York", done: true },
      { date: "Oct '24", headline: "GoI reduces EV import duty to 15% for manufacturers", done: true },
      { date: "Jan '25", headline: "Tesla India Pvt Ltd incorporated in Mumbai", done: true },
      { date: "Feb '25", headline: "Showroom locations confirmed: Delhi, Mumbai, Bengaluru", done: true },
      { date: "Q2 '25", headline: "Model Y India launch & first deliveries", done: false },
    ],
  },
  {
    id: "arc002",
    topic: "RBI Rate Cycle 2024–25",
    emoji: "📊",
    status: "evolving",
    summary: "RBI navigated inflation vs growth tension through a 5-meeting pause before launching an easing cycle in early 2025.",
    events: [
      { date: "Jun '24", headline: "RBI holds at 6.5% — 4th consecutive pause", done: true },
      { date: "Oct '24", headline: "MPC minutes signal dovish pivot; one member dissents", done: true },
      { date: "Dec '24", headline: "CPI falls to 4.1% — within RBI's 4% comfort zone", done: true },
      { date: "Feb '25", headline: "First 25bps cut → repo rate now 6.25%", done: true },
      { date: "Apr '25", headline: "Next MPC meeting: markets expect another 25bps cut", done: false },
    ],
  },
  {
    id: "arc003",
    topic: "India AI Policy Framework",
    emoji: "🤖",
    status: "breaking",
    summary: "India's AI policy has evolved rapidly from a task force to the IndiaAI Mission, with regulation still being drafted.",
    events: [
      { date: "Aug '24", headline: "MeitY forms National AI Task Force with 25 members", done: true },
      { date: "Nov '24", headline: "IndiaAI Mission receives ₹10,372 crore government approval", done: true },
      { date: "Jan '25", headline: "IndiaAI compute infrastructure launched: 10,000 GPUs", done: true },
      { date: "Mar '25", headline: "Draft AI Regulation Framework open for public comment", done: false },
      { date: "Jun '25", headline: "Final AI Policy Act tabled in Parliament", done: false },
    ],
  },
  {
    id: "arc004",
    topic: "IPL Media Rights War",
    emoji: "🏏",
    status: "evolving",
    summary: "IPL media rights have become the most contested broadcasting deal in Indian sports history, reshaping the OTT landscape.",
    events: [
      { date: "Jun '22", headline: "BCCI sells IPL rights for ₹48,390 crore — record shattered", done: true },
      { date: "Mar '23", headline: "JioCinema streams IPL free — disrupts OTT pricing wars", done: true },
      { date: "Nov '23", headline: "Disney-Reliance merger creates India's largest media company", done: true },
      { date: "Dec '24", headline: "IPL 2025 viewership target: 800M — biggest sporting event", done: true },
      { date: "2027", headline: "Next IPL rights cycle auction: expected to cross ₹1 lakh crore", done: false },
    ],
  },
  {
    id: "arc005",
    topic: "India Startup Unicorn Surge",
    emoji: "🦄",
    status: "evolving",
    summary: "India's startup ecosystem rebounded from the 2023 funding winter and is on track to produce 15+ new unicorns in 2025.",
    events: [
      { date: "2023", headline: "Funding winter: startup investment drops 72% YoY", done: true },
      { date: "Q1 '24", headline: "Zepto, Perfios lead recovery; AI-first startups emerge", done: true },
      { date: "Q3 '24", headline: "India adds 6 unicorns — fastest pace since 2021", done: true },
      { date: "Jan '25", headline: "Angel tax abolished; Budget extends startup tax holiday to 5yrs", done: true },
      { date: "2025", headline: "Target: 150 Indian unicorns; IPO pipeline has 40+ startups", done: false },
    ],
  },
];

// ─── CHAT SUGGESTIONS ─────────────────────────────────────────────────────

export const CHAT_SUGGESTIONS = {
  investor: [
    "Why did the stock market fall today?",
    "Which sectors are outperforming this week?",
    "Explain RBI's rate decision impact on my portfolio",
    "What are the top 3 stocks to watch this week?",
  ],
  founder: [
    "Which startups raised funding this week?",
    "What's the trend in Series A valuations in India?",
    "Explain the new angel tax rules for startups",
    "Who acquired whom in Indian tech this month?",
  ],
  student: [
    "Explain the Union Budget in simple terms",
    "What is GDP and why does it matter?",
    "How does RBI control inflation?",
    "What is a startup unicorn?",
  ],
  policy_analyst: [
    "What did the latest MPC meeting decide?",
    "Summarize this week's regulatory changes",
    "How will the FDI changes impact foreign inflows?",
    "Analyze India's trade deficit trend",
  ],
  cinema_enthusiast: [
    "What are the top Bollywood box office hits this week?",
    "Which OTT platform is winning the streaming war in India?",
    "Which Indian films are getting global recognition?",
    "How much did the latest big release earn on opening weekend?",
  ],
  sportsperson: [
    "Who won the latest IPL match?",
    "What are the biggest sports business deals in India right now?",
    "How is India performing in international cricket?",
    "What is the latest in fantasy sports industry in India?",
  ],
  literature_enthusiast: [
    "Which Indian books are getting international attention?",
    "What are the latest literary award winners?",
    "How is the Indian publishing industry evolving?",
    "Which Indian author should I read next?",
  ],
  entrepreneur: [
    "What are the new GST changes affecting small businesses?",
    "How can I access MSME government funding schemes?",
    "What business opportunities are emerging in India right now?",
    "Explain the new export incentive schemes for small businesses",
  ],
};

// ─── FALLBACK NEWS DATA (used only if GNews fails) ─────────────────────────

export const FALLBACK_NEWS = {
  investor: [
    { id: "f_inv1", title: "Sensex surges 1,200 points as RBI signals rate cut ahead", summary: "Markets rallied sharply after RBI Governor hinted at upcoming rate reduction. Banking stocks led the charge.", source: "Economic Times", time: "2h ago", sentiment: "positive", impact_score: 9, tags: ["Sensex", "RBI", "Banking"], readTime: "3 min", keyPoints: ["Nifty crosses 22,500 intraday", "Banking index up 4.1%", "FII net buyers at ₹2,400 cr"] },
    { id: "f_inv2", title: "Infosys, TCS report strong Q3 deal wins amid global IT slowdown", summary: "IT majors announced combined deal wins of $4.2B in Q3, countering worries about US tech spending slowdown.", source: "ET Markets", time: "4h ago", sentiment: "positive", impact_score: 7, tags: ["Infosys", "TCS", "IT"], readTime: "4 min", keyPoints: ["Infosys deal wins up 18% YoY", "TCS adds 3 large accounts"] },
    { id: "f_inv3", title: "Budget 2025: LTCG raised to 12.5%, markets react sharply", summary: "Finance Minister restructured capital gains taxation in Budget 2025, hiking LTCG on equities from 10% to 12.5%.", source: "Economic Times", time: "1d ago", sentiment: "negative", impact_score: 9, tags: ["Budget", "Capital Gains", "Tax"], readTime: "6 min", keyPoints: ["LTCG raised to 12.5%", "STCG now 20%", "Real estate indexation removed"] },
  ],
  founder: [
    { id: "f_fo1", title: "Zepto raises $350M Series F at $5B valuation, eyes IPO in 2026", summary: "Quick-commerce unicorn Zepto closed its largest funding round, pushing valuation to $5 billion.", source: "Inc42", time: "1h ago", sentiment: "positive", impact_score: 9, tags: ["Zepto", "Funding", "Quick-commerce"], readTime: "4 min", keyPoints: ["$350M Series F", "$5B valuation", "100 city expansion"] },
    { id: "f_fo2", title: "Google acquires Sarvam.ai for $300M — largest Indian AI acqui-hire", summary: "Google acquired Bengaluru-based AI startup Sarvam.ai, known for its regional language models.", source: "YourStory", time: "3h ago", sentiment: "positive", impact_score: 8, tags: ["Google", "Sarvam", "AI", "Acquisition"], readTime: "5 min", keyPoints: ["$300M acquisition", "120 engineers team", "Language AI focus"] },
  ],
  student: [
    { id: "f_st1", title: "Inflation Explained: Why your ₹100 buys less every year", summary: "A simple guide to inflation, how RBI tries to control it, and why it affects everything from groceries to loans.", source: "ET Simplified", time: "Today", sentiment: "neutral", impact_score: 6, tags: ["Inflation", "RBI", "Explained"], readTime: "5 min", keyPoints: ["What causes inflation", "How RBI fights it", "Impact on savings"] },
    { id: "f_st2", title: "Union Budget 2025 Decoded: What it means for students", summary: "The Union Budget is the government's annual financial plan. Here's what Budget 2025 means for education and jobs.", source: "ET Simplified", time: "Yesterday", sentiment: "positive", impact_score: 7, tags: ["Budget", "Students", "Education"], readTime: "6 min", keyPoints: ["₹1.5L cr for education", "New internship scheme", "Job creation targets"] },
  ],
  policy_analyst: [
    { id: "f_pa1", title: "RBI's MPC holds rate at 6.5% — signals cautious easing in H1 2025", summary: "The Monetary Policy Committee voted 5-1 to hold rates. Governor signals 'watchful and patient' stance on inflation.", source: "Economic Times", time: "3h ago", sentiment: "neutral", impact_score: 9, tags: ["RBI", "MPC", "Monetary Policy"], readTime: "8 min", keyPoints: ["5-1 MPC vote", "CPI at 4.8%", "GDP forecast at 7.2%"] },
    { id: "f_pa2", title: "India's FDI policy overhaul: defense, insurance, space sectors opened", summary: "Government announces major FDI liberalization across key sectors while streamlining the prior approval route.", source: "Economic Times", time: "5h ago", sentiment: "positive", impact_score: 8, tags: ["FDI", "Policy", "Regulation"], readTime: "7 min", keyPoints: ["Defense FDI raised to 100%", "Space sector opened", "Approval threshold revised"] },
  ],
  cinema_enthusiast: [
    { id: "f_ci1", title: "Pathaan 2 crosses ₹500 crore globally in record opening weekend", summary: "Shah Rukh Khan's action blockbuster shattered box office records, crossing ₹500 crore in just 4 days.", source: "ET Panache", time: "1h ago", sentiment: "positive", impact_score: 8, tags: ["Bollywood", "Box Office", "SRK"], readTime: "3 min", keyPoints: ["₹500 crore in 4 days", "Global release in 85 countries", "YRF's biggest ever"] },
    { id: "f_ci2", title: "Netflix India bets ₹3,500 crore on local content in 2025", summary: "Netflix India announced its biggest-ever local content investment, commissioning 40 original films and series.", source: "ET Panache", time: "4h ago", sentiment: "positive", impact_score: 7, tags: ["Netflix", "OTT", "India"], readTime: "4 min", keyPoints: ["₹3,500 crore investment", "40 Indian originals", "Regional content push"] },
  ],
  sportsperson: [
    { id: "f_sp1", title: "IPL 2025 auction breaks record — ₹650 crore bid for Rishabh Pant", summary: "Delhi Capitals' Rishabh Pant became the most expensive player in IPL history at the 2025 mega auction.", source: "ET Sports", time: "2h ago", sentiment: "positive", impact_score: 9, tags: ["IPL", "Cricket", "Auction"], readTime: "4 min", keyPoints: ["₹650 crore bid — all-time record", "Delhi Capitals retain Pant", "Total auction value ₹4,800 crore"] },
    { id: "f_sp2", title: "BCCI signs $1B global broadcast deal for Indian cricket 2025–2028", summary: "India's cricket board signed its largest-ever international broadcast rights deal, covering 30 countries over 3 years.", source: "ET Sports", time: "6h ago", sentiment: "positive", impact_score: 8, tags: ["BCCI", "Cricket", "Broadcast"], readTime: "3 min", keyPoints: ["$1B (₹8,300 crore) deal", "30 countries covered", "Streaming + linear TV rights"] },
  ],
  literature_enthusiast: [
    { id: "f_li1", title: "Arundhati Roy's new novel tops bestseller charts globally", summary: "After a 26-year gap, Arundhati Roy's second novel debuted at #1 on the Times bestseller list and sold 300,000 copies in week one.", source: "ET Culture", time: "3h ago", sentiment: "positive", impact_score: 7, tags: ["Arundhati Roy", "Books", "Bestseller"], readTime: "4 min", keyPoints: ["26-year gap since first novel", "300K copies in week one", "Rights sold in 45 countries"] },
    { id: "f_li2", title: "Jaipur Literature Festival 2025 breaks attendance record with 5 lakh visitors", summary: "JLF 2025 attracted a record 500,000 attendees, with Indian diaspora authors dominating the programming.", source: "ET Culture", time: "1d ago", sentiment: "positive", impact_score: 6, tags: ["JLF", "Literature", "Festival"], readTime: "3 min", keyPoints: ["5 lakh attendees — record", "200+ authors from 35 countries", "Economic impact ₹150 crore for Jaipur"] },
  ],
  entrepreneur: [
    { id: "f_en1", title: "GST simplified for MSMEs: quarterly filing replaces monthly for small firms", summary: "Finance Ministry's new rules reduce compliance burden for 1.3 crore small businesses, cutting filing frequency and costs.", source: "Economic Times", time: "2h ago", sentiment: "positive", impact_score: 8, tags: ["GST", "MSME", "Policy"], readTime: "4 min", keyPoints: ["1.3 crore businesses benefit", "Filing cut from 12x to 4x/year", "₹10,000 crore compliance savings"] },
    { id: "f_en2", title: "PM Vishwakarma scheme: 50 lakh artisans get ₹3 lakh credit at 5% interest", summary: "The Vishwakarma Yojana expanded access for traditional artisans and craftsmen with soft credit and skills training.", source: "Economic Times", time: "5h ago", sentiment: "positive", impact_score: 7, tags: ["MSME", "Artisans", "Government Scheme"], readTime: "3 min", keyPoints: ["50 lakh beneficiaries", "₹3 lakh collateral-free credit", "5% interest rate — subsidized"] },
  ],
};
