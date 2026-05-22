// In-memory demo data store. Mutated by mock api.js so writes persist for the
// session. Refreshing the browser resets everything to the initial seed.

const today = new Date();
today.setHours(12, 0, 0, 0);

const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};

const isoDate = (d) => d.toISOString().slice(0, 10);
const isoDateTime = (d) => d.toISOString();

// CS student persona. Numbers spread to keep analytics charts interesting:
// sentiment 1-5, sleep 1-5, stress 1-5, social 1-5.
const seedEntries = [
  {
    offset: 0,
    title: "Submitted the database project",
    sentiment_level: 5,
    sleep_quality: 3,
    stress_level: 2,
    social_engagement: 4,
    content:
      "Finally pushed the final commit on the database systems project. The query optimizer benchmarks came out cleaner than I expected. Met the team for coffee afterwards to celebrate. Going to actually sleep early tonight.",
    formatted_content:
      "**Morning**\nWoke up tense. Did one last review pass on the SQL benchmark notebook before the deadline.\n\n**Afternoon**\nSubmission went through at 14:02. The query optimizer benchmarks came out cleaner than I expected.\n\n**Evening**\nMet the team for coffee. Plan to actually sleep early tonight.",
    activities: "coding, project submission, coffee with team",
    sentiments: "Proud, Content, Grateful",
    goalIds: [1, 2],
  },
  {
    offset: 1,
    title: "Crunch night before deadline",
    sentiment_level: 2,
    sleep_quality: 1,
    stress_level: 5,
    social_engagement: 2,
    content:
      "Pulled an almost-allnighter debugging the join cardinality estimator. The synthetic dataset broke the histogram bucketing. Two hours of sleep. Skipped the gym. I know I said I would not do this again.",
    activities: "coding, debugging, allnighter",
    sentiments: "Stressed, Tired, Frustrated",
    goalIds: [1],
  },
  {
    offset: 3,
    title: "Distributed systems lecture clicked",
    sentiment_level: 4,
    sleep_quality: 4,
    stress_level: 3,
    social_engagement: 3,
    content:
      "Raft consensus finally made sense after the third attempt. Drew the leader election state machine on paper and something just clicked. Took notes on the log replication invariants for later.",
    activities: "lecture, note-taking, studying",
    sentiments: "Inspired, Motivated, Content",
    goalIds: [3],
  },
  {
    offset: 4,
    title: "Long run by the river",
    sentiment_level: 5,
    sleep_quality: 5,
    stress_level: 1,
    social_engagement: 2,
    content:
      "10k along the river path. Slept nine hours and felt it the whole run. Phone stayed in my pocket. Brain quiet for the first time this week.",
    activities: "running, exercise, outdoors",
    sentiments: "Peaceful, Calm, Proud",
    goalIds: [4],
  },
  {
    offset: 6,
    title: "Group project standup went sideways",
    sentiment_level: 2,
    sleep_quality: 3,
    stress_level: 4,
    social_engagement: 4,
    content:
      "M. has not pushed anything in five days. Tried to raise it without making it personal. Felt the tension. We agreed on smaller daily checkins. Need to follow up tomorrow.",
    activities: "meeting, group project, conflict",
    sentiments: "Frustrated, Worried, Anxious",
    goalIds: [3, 5],
  },
  {
    offset: 8,
    title: "Coffee with L.",
    sentiment_level: 5,
    sleep_quality: 4,
    stress_level: 2,
    social_engagement: 5,
    content:
      "Two hours at the place near the library. Talked about everything except coursework. Walked back the long way. These are the days I want more of.",
    activities: "coffee, conversation, walking",
    sentiments: "Happy, Grateful, Content",
    goalIds: [5],
  },
  {
    offset: 10,
    title: "Algorithms exam went OK",
    sentiment_level: 3,
    sleep_quality: 3,
    stress_level: 4,
    social_engagement: 2,
    content:
      "Got through everything but the dynamic programming question. I knew the recurrence and ran out of time on the implementation. Solid B territory I think. Went home and slept.",
    activities: "exam, studying",
    sentiments: "Tired, Content, Disappointed",
    goalIds: [1, 3],
  },
  {
    offset: 13,
    title: "Hackathon idea session",
    sentiment_level: 5,
    sleep_quality: 4,
    stress_level: 2,
    social_engagement: 5,
    content:
      "Three of us whiteboarded for two hours. Settled on a build system observability tool. The demo path is realistic and the slice of work is small. Excited.",
    activities: "brainstorming, whiteboarding, hackathon",
    sentiments: "Excited, Inspired, Motivated",
    goalIds: [2, 5],
  },
  {
    offset: 15,
    title: "Bad sleep, foggy day",
    sentiment_level: 2,
    sleep_quality: 1,
    stress_level: 4,
    social_engagement: 2,
    content:
      "Up until 2 reading and then could not switch off. Lecture this morning was a blur. Skipped the gym again. Need to put the phone in the other room tonight.",
    activities: "lecture, low energy",
    sentiments: "Tired, Anxious, Overwhelmed",
    goalIds: [4],
  },
  {
    offset: 18,
    title: "Resume revision session",
    sentiment_level: 4,
    sleep_quality: 4,
    stress_level: 3,
    social_engagement: 3,
    content:
      "Sat down with the career advisor. Tightened the bullet points on the systems internship. She liked the framing. Three companies to apply to this week.",
    activities: "career planning, writing, meeting",
    sentiments: "Hopeful, Motivated, Proud",
    goalIds: [2],
  },
  {
    offset: 21,
    title: "Lazy Sunday with family call",
    sentiment_level: 4,
    sleep_quality: 5,
    stress_level: 2,
    social_engagement: 4,
    content:
      "Slept until 10. Long video call with mom and dad. Talked about the summer plans. Did laundry, cooked something proper, no laptop after 6.",
    activities: "family call, cooking, rest",
    sentiments: "Content, Calm, Grateful",
    goalIds: [4, 5],
  },
  {
    offset: 24,
    title: "First gym session in two weeks",
    sentiment_level: 4,
    sleep_quality: 3,
    stress_level: 3,
    social_engagement: 3,
    content:
      "Went easier than I feared. Lifted lighter than I used to but it felt fine. The bar to start is always higher than the workout itself. Note to future me.",
    activities: "gym, exercise",
    sentiments: "Proud, Motivated, Content",
    goalIds: [4],
  },
  {
    offset: 28,
    title: "Compiler assignment frustration",
    sentiment_level: 2,
    sleep_quality: 3,
    stress_level: 5,
    social_engagement: 2,
    content:
      "Lexer is fine. Parser keeps choking on left recursion in the expression rule. Read the dragon book chapter twice. Going to sleep on it.",
    activities: "coding, compilers, debugging",
    sentiments: "Frustrated, Confused, Stressed",
    goalIds: [1, 3],
  },
  {
    offset: 32,
    title: "Solo museum afternoon",
    sentiment_level: 5,
    sleep_quality: 4,
    stress_level: 1,
    social_engagement: 1,
    content:
      "No plans, walked into the modern art museum on impulse. Two hours, no phone. Sat with one painting for a long time. Came out feeling like the week reset.",
    activities: "museum, walking, solo time",
    sentiments: "Peaceful, Inspired, Calm",
    goalIds: [],
  },
  {
    offset: 36,
    title: "Study group productivity",
    sentiment_level: 4,
    sleep_quality: 4,
    stress_level: 3,
    social_engagement: 5,
    content:
      "Three of us at the library for four hours. Worked through the practice exam together. Explaining concepts out loud is still the fastest way to find the holes in my understanding.",
    activities: "studying, group work, library",
    sentiments: "Motivated, Content, Grateful",
    goalIds: [3, 5],
  },
];

const seedGoals = [
  {
    id: 1,
    title: "Ship a side project to production",
    type: "long-term",
    target_date: isoDate(daysAgo(-45)),
    category: "Career",
    priority: "High",
    description:
      "Pick one side project and take it from idea to a real deployed thing with a domain and at least three users I do not know.",
    progress: 65,
  },
  {
    id: 2,
    title: "Land a software engineering internship",
    type: "long-term",
    target_date: isoDate(daysAgo(-90)),
    category: "Career",
    priority: "High",
    description:
      "Apply to ten roles, prep systems-design fundamentals, and complete two mock interviews per week.",
    progress: 40,
  },
  {
    id: 3,
    title: "GPA above 3.7 this semester",
    type: "short-term",
    target_date: isoDate(daysAgo(-30)),
    category: "Academic",
    priority: "High",
    description:
      "Stay on top of weekly readings, start assignments the day they are released, and keep a steady review rhythm.",
    progress: 70,
  },
  {
    id: 4,
    title: "Run 4x per week",
    type: "recurring",
    target_date: null,
    category: "Health",
    priority: "Medium",
    description:
      "Two short runs, one long run, one easy recovery jog. Track in the app and skip kindly when sick or injured.",
    progress: 55,
  },
  {
    id: 5,
    title: "See a friend in person twice a week",
    type: "recurring",
    target_date: null,
    category: "Social",
    priority: "Medium",
    description:
      "It is too easy to disappear into coursework. Coffee, a meal, a walk, anything counts.",
    progress: 80,
  },
  {
    id: 6,
    title: "Read 12 non-CS books this year",
    type: "long-term",
    target_date: isoDate(daysAgo(-200)),
    category: "Personal Growth",
    priority: "Low",
    description:
      "Fiction, philosophy, biography. Anything that is not about distributed systems. One per month.",
    progress: 25,
  },
];

let nextEntryId = 1;
const buildEntry = (seed) => {
  const date = daysAgo(seed.offset);
  const created = new Date(date);
  created.setHours(20, 30, 0, 0);
  return {
    id: nextEntryId++,
    title: seed.title,
    date: isoDate(date),
    content: seed.content,
    created_at: isoDateTime(created),
    updated_at: null,
    sentiment_level: seed.sentiment_level,
    sleep_quality: seed.sleep_quality,
    stress_level: seed.stress_level,
    social_engagement: seed.social_engagement,
    formatted_content: seed.formatted_content || null,
    activities: seed.activities,
    sentiments: seed.sentiments,
    goals: seed.goalIds
      .map((id) => seedGoals.find((g) => g.id === id))
      .filter(Boolean)
      .map((g) => ({
        id: g.id,
        title: g.title,
        type: g.type,
        target_date: g.target_date,
        category: g.category,
        priority: g.priority,
        description: g.description,
        progress: g.progress,
        created_at: isoDateTime(daysAgo(60)),
        updated_at: null,
      })),
  };
};

export const store = {
  entries: seedEntries.map(buildEntry),
  goals: seedGoals.map((g) => ({
    ...g,
    created_at: isoDateTime(daysAgo(60)),
    updated_at: null,
    journal_entries: [],
  })),
  chatHistory: [],
};

export const nextEntryIdValue = () => {
  const max = store.entries.reduce((m, e) => Math.max(m, e.id), 0);
  return max + 1;
};

export const nextGoalIdValue = () => {
  const max = store.goals.reduce((m, g) => Math.max(m, g.id), 0);
  return max + 1;
};

export const todayIso = isoDate(today);

// Plausible canned chatbot replies. Picks based on simple keyword match,
// otherwise rotates through neutral supportive replies.
const cannedReplies = {
  stress: [
    "Looking at your last few entries, the high-stress days line up with nights under five hours of sleep. Want to set a wind-down reminder for tonight?",
    "Stress shows up most in your entries on days right before deadlines. Would breaking the next assignment into three smaller checkpoints help?",
  ],
  sleep: [
    "Your sleep quality has averaged 3.4 over the last two weeks, which is a noticeable dip. The pattern looks tied to late-night coding sessions.",
    "Two of your best mood days this month followed sleep scores of 5. The signal is there. What time do you want to be in bed tonight?",
  ],
  goal: [
    "Your goal 'Run 4x per week' is at 55% progress. You logged one run this week. Want to plan the other three now?",
    "On your internship goal, applications seem to have stalled. The career advisor suggested three companies last week. Did that list end up anywhere actionable?",
  ],
  exam: [
    "You wrote that the algorithms exam felt like solid B territory. That tracks with your study log. How are you feeling going into the next one?",
    "Your strongest study sessions this month were in groups at the library. Want to schedule one before the next exam?",
  ],
  default: [
    "I picked up on a few things from your recent entries. Your sentiment has trended up since the database project shipped, but sleep is still uneven.",
    "Your last week looked balanced. Two strong social days, one solo reset, decent sleep. What do you want to protect about this rhythm?",
    "Reflecta noticed three recurring themes lately: deadline stress, slow recovery from late nights, and high mood when you exercise outdoors. Want to dig into any of them?",
    "Looking at the past two weeks, your mood spikes when entries mention exercise or time with friends. Worth keeping in mind.",
  ],
};

let defaultReplyIndex = 0;
export const pickChatReply = (message) => {
  const m = message.toLowerCase();
  if (/(stress|overwhelm|anxious|burn)/.test(m)) {
    return cannedReplies.stress[
      Math.floor(Math.random() * cannedReplies.stress.length)
    ];
  }
  if (/(sleep|tired|insomnia|night)/.test(m)) {
    return cannedReplies.sleep[
      Math.floor(Math.random() * cannedReplies.sleep.length)
    ];
  }
  if (/(goal|progress|run|gym|internship|apply)/.test(m)) {
    return cannedReplies.goal[
      Math.floor(Math.random() * cannedReplies.goal.length)
    ];
  }
  if (/(exam|test|assignment|study|grade|gpa)/.test(m)) {
    return cannedReplies.exam[
      Math.floor(Math.random() * cannedReplies.exam.length)
    ];
  }
  const reply = cannedReplies.default[defaultReplyIndex % cannedReplies.default.length];
  defaultReplyIndex += 1;
  return reply;
};

export const journalQuestionPool = [
  "What is one small thing today that you do not want to forget?",
  "What surprised you about your reaction to something this week?",
  "If you had to name what is taking up the most space in your head right now, what would it be?",
  "What is one thing you are quietly proud of from the last few days?",
  "Where in your day did you feel most like yourself?",
  "What did you avoid today, and what was underneath that?",
];

export const recommendedGoalsPool = [
  {
    title: "Build a wind-down routine for school nights",
    description:
      "Phone in another room by 22:30 on weekdays. The connection between late-night scrolling and your low-mood mornings is showing up clearly in your entries.",
    category: "Health",
  },
  {
    title: "Schedule a weekly check-in with one classmate",
    description:
      "Your highest-mood entries cluster around in-person time with friends. A standing weekly slot makes it less likely to slip when deadlines pile up.",
    category: "Social",
  },
  {
    title: "Apply to two internships per week",
    description:
      "You have momentum from the resume revision session. Two well-targeted applications a week is steady progress without burning out.",
    category: "Career",
  },
  {
    title: "Read one non-CS chapter before bed",
    description:
      "A short reading habit could double as the wind-down trigger you have been looking for and chip away at the reading goal.",
    category: "Personal Growth",
  },
];

export const enhanceDescriptionPool = [
  "Define a specific weekly cadence and one measurable signal of progress. Keep it small enough that a busy week does not break it.",
  "Tie this goal to a routine you already have. Stack it after something you do every day so the trigger is automatic.",
  "Write down what success looks like in three months and what you would do this week to move 5% closer to it.",
];

export const adminStats = {
  total_users: 1248,
  active_users_7d: 312,
  total_entries: 18642,
  total_ai_calls: 9421,
  ai_success_rate: 99.2,
  ai_calls_today: 87,
  ai_tokens_total: 4823910,
};
