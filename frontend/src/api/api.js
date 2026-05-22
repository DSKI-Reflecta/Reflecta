// Demo wireframe build: this module mocks the entire backend API surface.
// Same exports and response shapes as the real api.js, but everything reads
// from / writes to an in-memory store. Refreshing the browser resets state.

import {
  store,
  nextEntryIdValue,
  nextGoalIdValue,
  pickChatReply,
  journalQuestionPool,
  recommendedGoalsPool,
  enhanceDescriptionPool,
  adminStats,
} from "./mockData";

const FAKE_LATENCY_MS = 220;

const delay = (ms = FAKE_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const calendarUpdateListeners = [];

export const addCalendarUpdateListener = (listener) => {
  calendarUpdateListeners.push(listener);
};

export const removeCalendarUpdateListener = (listener) => {
  const index = calendarUpdateListeners.indexOf(listener);
  if (index !== -1) {
    calendarUpdateListeners.splice(index, 1);
  }
};

const notifyCalendarUpdate = () => {
  calendarUpdateListeners.forEach((listener) => listener());
};

const sortEntriesDesc = (arr) =>
  [...arr].sort((a, b) => new Date(b.date) - new Date(a.date));

const cloneDeep = (v) => JSON.parse(JSON.stringify(v));

export const fetchCalendarData = async () => {
  await delay();
  return {
    journalEntries: cloneDeep(sortEntriesDesc(store.entries)),
    goals: cloneDeep(store.goals),
  };
};

export const fetchJournalEntries = async () => {
  await delay();
  return cloneDeep(sortEntriesDesc(store.entries));
};

export const createJournalEntry = async (entryData) => {
  await delay();
  const goalIds = entryData.goals || [];
  const linkedGoals = store.goals
    .filter((g) => goalIds.includes(g.id))
    .map((g) => cloneDeep(g));

  const now = new Date().toISOString();
  const entry = {
    id: nextEntryIdValue(),
    title: entryData.title,
    date: entryData.date,
    content: entryData.content,
    created_at: now,
    updated_at: null,
    sentiment_level: entryData.sentiment_level ?? null,
    sleep_quality: entryData.sleep_quality ?? null,
    stress_level: entryData.stress_level ?? null,
    social_engagement: entryData.social_engagement ?? null,
    formatted_content: null,
    activities: "",
    sentiments: "",
    goals: linkedGoals,
  };
  store.entries.push(entry);
  notifyCalendarUpdate();
  return cloneDeep(entry);
};

export const updateJournalEntry = async (entryId, entryData) => {
  await delay();
  const idx = store.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) {
    throw new Error(`HTTP error! status: 404 - Entry not found`);
  }
  const existing = store.entries[idx];
  const next = {
    ...existing,
    ...entryData,
    id: entryId,
    updated_at: new Date().toISOString(),
  };
  if (entryData.goals !== undefined) {
    next.goals = store.goals
      .filter((g) => entryData.goals.includes(g.id))
      .map((g) => cloneDeep(g));
  }
  store.entries[idx] = next;
  notifyCalendarUpdate();
  return cloneDeep(next);
};

export const deleteJournalEntry = async (entryId) => {
  await delay();
  const idx = store.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) {
    throw new Error(`HTTP error! status: 404 - Entry not found`);
  }
  store.entries.splice(idx, 1);
  notifyCalendarUpdate();
  return true;
};

export const fetchGoals = async () => {
  await delay();
  return cloneDeep(store.goals);
};

export const createGoal = async (goalData) => {
  await delay();
  const now = new Date().toISOString();
  const goal = {
    id: nextGoalIdValue(),
    title: goalData.title,
    type: goalData.type,
    target_date: goalData.target_date || goalData.targetDate || null,
    category: goalData.category,
    priority: goalData.priority,
    description: goalData.description || null,
    progress: goalData.progress ?? 0,
    created_at: now,
    updated_at: null,
    journal_entries: [],
  };
  store.goals.push(goal);
  notifyCalendarUpdate();
  return cloneDeep(goal);
};

export const updateGoal = async (goalId, goalData) => {
  await delay();
  const idx = store.goals.findIndex((g) => g.id === goalId);
  if (idx === -1) {
    throw new Error(`HTTP error! status: 404 - Goal not found`);
  }
  const existing = store.goals[idx];
  const next = {
    ...existing,
    ...goalData,
    id: goalId,
    target_date: goalData.target_date ?? goalData.targetDate ?? existing.target_date,
    updated_at: new Date().toISOString(),
  };
  store.goals[idx] = next;
  notifyCalendarUpdate();
  return cloneDeep(next);
};

export const deleteGoal = async (goalId) => {
  await delay();
  const idx = store.goals.findIndex((g) => g.id === goalId);
  if (idx === -1) {
    throw new Error(`HTTP error! status: 404 - Goal not found`);
  }
  store.goals.splice(idx, 1);
  store.entries.forEach((e) => {
    e.goals = (e.goals || []).filter((g) => g.id !== goalId);
  });
  notifyCalendarUpdate();
  return true;
};

const periodToDays = (period) => {
  if (!period) return 30;
  const m = String(period).match(/(\d+)/);
  if (!m) return 30;
  return parseInt(m[1], 10);
};

const movingAverage = (data, window) => {
  if (data.length < window) return data.map((v) => v);
  const half = Math.floor(window / 2);
  return data.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(data.length, i + half + 1);
    const slice = data.slice(start, end);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
};

const corr = (xs, ys) => {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i += 1) {
    const ax = xs[i] - mx;
    const ay = ys[i] - my;
    num += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
};

const entriesInPeriod = (period) => {
  const days = periodToDays(period);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return [...store.entries]
    .filter((e) => new Date(e.date) >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const calculateStreak = () => {
  const dateSet = new Set(store.entries.map((e) => e.date));
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  let streak = 0;
  while (dateSet.has(cur.toISOString().slice(0, 10))) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
};

export const getAnalyticsTrends = async (period) => {
  await delay();
  const entries = entriesInPeriod(period).filter(
    (e) => e.sentiment_level !== null && e.sentiment_level !== undefined
  );
  if (entries.length === 0) {
    return { dates: [], sentiment: [], sleep: [], stress: [], social: [] };
  }
  const days = periodToDays(period);
  const window = Math.min(21, Math.max(3, Math.floor(days / 7)));
  return {
    dates: entries.map((e) => e.date),
    sentiment: movingAverage(entries.map((e) => e.sentiment_level), window).map(Math.round),
    sleep: movingAverage(entries.map((e) => e.sleep_quality ?? 3), window).map(Math.round),
    stress: movingAverage(entries.map((e) => e.stress_level ?? 3), window).map(Math.round),
    social: movingAverage(entries.map((e) => e.social_engagement ?? 3), window).map(Math.round),
  };
};

export const getAnalyticsStats = async (period) => {
  await delay();
  const entries = entriesInPeriod(period);
  if (entries.length === 0) {
    return {
      sentiment: 0,
      sleep: 0,
      stress: 0,
      social: 0,
      total_entries: 0,
      current_streak: 0,
      average_words_per_entry: 0,
    };
  }
  const avg = (key) => {
    const vals = entries.map((e) => e[key]).filter((v) => v !== null && v !== undefined);
    if (vals.length === 0) return 0;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };
  const totalWords = entries.reduce(
    (s, e) => s + (e.content ? e.content.split(/\s+/).length : 0),
    0
  );
  return {
    sentiment: avg("sentiment_level"),
    sleep: avg("sleep_quality"),
    stress: avg("stress_level"),
    social: avg("social_engagement"),
    total_entries: entries.length,
    current_streak: calculateStreak(),
    average_words_per_entry: totalWords / entries.length,
  };
};

export const getAnalyticsCorrelations = async (period) => {
  await delay();
  const aligned = entriesInPeriod(period).filter(
    (e) =>
      e.sleep_quality != null &&
      e.sentiment_level != null &&
      e.stress_level != null &&
      e.social_engagement != null
  );
  if (aligned.length < 2) {
    return { message: "Not enough data points for correlation analysis" };
  }
  const days = periodToDays(period);
  const window = Math.min(21, Math.max(3, Math.floor(days / 7)));
  const dates = aligned.map((e) => e.date);
  const sleep = aligned.map((e) => e.sleep_quality);
  const sentiment = aligned.map((e) => e.sentiment_level);
  const stress = aligned.map((e) => e.stress_level);
  const social = aligned.map((e) => e.social_engagement);

  const buildPair = (xs, ys, xLabel, yLabel) => ({
    correlation: corr(xs, ys),
    data: dates.map((d, i) => ({ date: d, x: xs[i], y: ys[i] })),
    x_label: xLabel,
    y_label: yLabel,
    x_avg: movingAverage(xs, window),
    y_avg: movingAverage(ys, window),
    insights: [],
  });

  const pairs = {
    sleep_sentiment: buildPair(sleep, sentiment, "Sleep Quality", "Sentiment Level"),
    sleep_stress: buildPair(sleep, stress, "Sleep Quality", "Stress Level"),
    sleep_social: buildPair(sleep, social, "Sleep Quality", "Social Engagement"),
    sentiment_stress: buildPair(sentiment, stress, "Sentiment Level", "Stress Level"),
    sentiment_social: buildPair(sentiment, social, "Sentiment Level", "Social Engagement"),
    stress_social: buildPair(stress, social, "Stress Level", "Social Engagement"),
  };
  const sorted = Object.entries(pairs).sort(
    (a, b) => Math.abs(b[1].correlation) - Math.abs(a[1].correlation)
  );
  const top = Object.fromEntries(sorted.slice(0, 2));

  // Pre-seed plausible insight bullets so the analytics page does not show
  // an empty "generating insights" state during the demo.
  Object.values(top).forEach((pair) => {
    pair.insights = [
      `${pair.x_label} and ${pair.y_label} move together with r = ${pair.correlation.toFixed(2)} across the period.`,
      `The strongest swings happen on entries where ${pair.x_label.toLowerCase()} drops below 3.`,
      `Worth keeping an eye on whether this holds when next week's deadlines hit.`,
    ];
  });

  return { strongest_correlations: top, total_data_points: aligned.length };
};

export const getAnalyticsSummary = async (period) => {
  await delay();
  const entries = entriesInPeriod(period);
  if (entries.length === 0) {
    return { summary: "No journal entries found for the specified period." };
  }
  return {
    summary:
      "Across this period your sentiment trended upward after the database project shipped, with the strongest mood days clustering around outdoor exercise and time with close friends. Sleep was the most uneven signal: nights under five hours preceded most of your low-mood, high-stress days. Goal progress is healthiest on Career and Social, while the Health goal slipped during exam crunch. The pattern points to one lever: protecting sleep on the nights before high-effort days.",
  };
};

export const enhanceGoalDescription = async (title, description) => {
  await delay(450);
  const seed = `${title} ${description || ""}`;
  const idx = Math.abs(
    seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % enhanceDescriptionPool.length;
  return enhanceDescriptionPool[idx];
};

export const sendChatMessage = async (message) => {
  await delay(600);
  const reply = pickChatReply(message);
  store.chatHistory.push({ role: "user", text: message });
  store.chatHistory.push({ role: "assistant", text: reply });
  return reply;
};

export const getJournalQuestion = async (content) => {
  await delay(350);
  const seed = (content || "").length;
  return journalQuestionPool[seed % journalQuestionPool.length];
};

export const recommendGoals = async () => {
  await delay(700);
  return cloneDeep(recommendedGoalsPool);
};

export const getAdminStats = async () => {
  await delay();
  return { ...adminStats };
};
