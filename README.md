🧠 Smart AI-Driven Journal & Reflection Assistant

A private, intelligent journaling system to help you reflect on your life, track emotional patterns, and stay aligned with your goals — guided by an AI agent.

## 📓 1. Daily Journal Entry
Each day, you write a short entry and optionally log your state. The AI handles the rest.
🧘‍♀️ State Tracking
* Visual sliders/toggles to track:
    * Sentiment (1–5)
    * Sleep (1–5)
    * Stress (1–5)
    * Social engagement (alone → very social)
* 🧩 Used for correlation insights like: “Your mood tends to dip on days with low sleep and high stress.”
🤖 AI-Powered Journal Analysis
1. ✍️ Formatting Agent: Improves structure and readability.
2. ✅ Activity Extraction: Summarizes what you did.
3. 😊 Sentiment Analysis: Detects emotional tone (e.g. happy, reflective).
4. 🧠 Keyword Extraction: Highlights recurring themes like "family", "burnout", etc.
5. 💾 Memory Storage: Saves results to a local SQLite database.
🔔 Reminder: Daily notification to encourage writing.
Reflection Loop (Optional but Powerful)
* After a journal entry, the agent can ask a self-reflection question, like: “What are you grateful for today?” or “What would you like to do differently tomorrow?”


## 📅 2. Weekly Summary (Every Sunday)
* Automatically generated overview.
* Includes:
    1. Weekly activity recap.
    2. Sentiment trends.
    3. Top themes and patterns.
📚 Stored in SQLite for long-term tracking and reflection.
Reflection Loop (Optional but Powerful)
* After a reading the weekly summary, the agent can ask a self-reflection question, like: “What are you grateful for today?” or “What would you like to do differently tomorrow?”

## 🎯 3. Goals & Priorities
* Set, update, or delete personal goals and priorities.
* Drag-and-drop or number-based ordering of goals by priority. Also allow categories for goals.
* 🗨️ Agent Interaction:
* When setting or changing the order, the agent asks:“Why did you put this goal first?”“How do you want to balance goal 2 and 3 this week?”

## 🧠 4. Agent-Guided Goal Tracking
* 🚦 Progress Detection: Checks how well your journal aligns with your goals.
* 💡 Agent Suggestions: Nudges when goals seem neglected, e.g.“You haven’t mentioned your ‘meditation’ goal this week — still important to you?”

## 🧠 5. Coping Toolbox
* Let users store techniques that help them (meditation, walks, talking to friends).
* Agent can suggest tools when stress is high:“You’ve logged high stress 3 days in a row. Want to revisit your coping tools?”

## 🧭 6. “Future Me” Letters
* Write a letter to your future self (e.g. 30 days from now).
* Get it back as a notification later with a comment from the agent:“Here’s what past-you hoped. How do you feel about it now?”