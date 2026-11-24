// ============================================================
//  SELF-HELP PAGE  (selfhelp.html)
//  For people who can't start therapy right now.
//  Edit the text between quotes. The two self-check quizzes
//  (PHQ-9 and GAD-7) are standard screening tools — their
//  questions are fixed and should not be changed.
// ============================================================

var SELFHELP = {
  intro: "Not ready for therapy yet, or can't start right now? That's okay. These free tools can help you understand how you're feeling and find some calm today — and we're here whenever you're ready.",

  // Crisis / free helplines (shown at the top and after the quizzes)
  helplines: [
    { name: "Tele-MANAS (Govt. of India)", number: "14416", alt: "1-800-891-4416",
      note: "Free · 24×7 · 20 languages incl. Marathi & Hindi" },
    { name: "Emergency", number: "112", alt: "",
      note: "If you or someone is in immediate danger" }
  ],

  // Simple daily practices (icon, title, text)
  tips: [
    { icon: "🌙", title: "Protect your sleep",
      text: "Same sleep and wake time daily, screens off 30 minutes before bed, and a dark, cool room." },
    { icon: "🚶", title: "Move a little",
      text: "A 15–20 minute walk, ideally outdoors in daylight, lifts mood and eases anxious energy." },
    { icon: "📓", title: "Write it down",
      text: "Spend 10 minutes writing what's on your mind. Putting worries on paper makes them smaller." },
    { icon: "⏰", title: "Set a 'worry time'",
      text: "Give worries 15 minutes a day. When they come at other times, note them and save them for later." },
    { icon: "🤝", title: "Talk to someone",
      text: "A short call or chat with a trusted friend or family member can lighten what you carry." },
    { icon: "📵", title: "Take screen breaks",
      text: "Put your phone away for an hour each evening. Notice how your mind feels without the scroll." }
  ],

  // When to seek professional help (bullet points)
  whenToSeek: [
    "Feeling low, anxious or irritable most days for more than 2 weeks",
    "Sleep, appetite, studies or work are clearly affected",
    "Relying on screens, smoking or other habits to cope",
    "Relationships at home or work are getting strained",
    "Thoughts of hurting yourself — please reach out today"
  ]
};
