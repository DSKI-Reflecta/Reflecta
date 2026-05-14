# 🚀 Getting Started with Docker

This project is fully containerized using Docker. With just one command, you can get the entire application (frontend and backend) up and running.

### Prerequisites

*   [Docker Desktop](https://www.docker.com/products/docker-desktop) installed on your machine.

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/0Chris5R/AdvancedProgrammingProject.git
    cd AdvancedProgrammingProject
    ```

2.  **Create the environment file for the backend:**
    Navigate to the root directory and create a `.env` file. Copy the contents from `example.env` in the root directory and replace `your_api_key` with your actual Gemini API key.

    `.env`:
    ```
    GEMINI_API_KEY=your_api_key
    ```

3.  **Run the application:**
    From the root directory of the project, run the following command:
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for the frontend and backend and start the services.

4.  **Access the application:**
    *   **Frontend:** [http://localhost:3000](http://localhost:3000)
    *   **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧠 Reflecta

A private, intelligent journaling system to reflect, track emotional patterns, and stay aligned with your goals — guided by an AI agent.

📓 1. Daily Journal Entry
Simple input, powerful insights.Each day, users can:
* ✍️ Write a short entry
* 🧘‍♀️ Optionally log their current state
🔄 State Tracking
Interactive sliders or toggles for:
* Sentiment (1–5)
* Sleep Quality (1–5)
* Stress Level (1–5)
* Social Engagement (Alone → Very Social)
🤖 AI-Powered Journal Analysis
Automated pipeline:
1. ✍️ Formatting Agent – Enhances structure and readability
2. ✅ Activity Extraction – Summarizes what you did today
3. 😊 Sentiment Analysis – Detects emotional tone (e.g., happy, stressed, reflective)
4. 💾 Memory Storage – Saves everything to a local SQLite database
📬 Daily Reminder: Email or notification to encourage consistent journaling

🎯 2. Goals & Priorities
Set, organize, and evolve your direction.
* ➕ Add / ✏️ Update / ❌ Delete personal goals
* 🗂️ Categorize (e.g., Health, Work, Relationships)
* 🔢 Prioritize via drag-and-drop or numbering
* 📊 Connect journal entries to goal relevance

🗓️ 3. Calendar
Visualize your journal entries, plans and goal due dates
* 🗓️ Views: Month / Week / Tomorrow

---
To be completed:

📈 4. Analytics
Gain personal insights from your data
* 🎯 Goal alignment tracking
* 📊 Track trends: sleep, stress, mood, sociality
* 🔁 Correlation insights (e.g., “Low sleep → high stress next day”)
* ✅ Activities summary

🤖 5. AI Chatbot (Reflecta Assistant)
Your personal, context-aware companion
* 💡 Knows your journal, goals, trends, coping tools
* 📬 Can help with goal setting, mood reflection, plan adjustments
* 🧠 Smart suggestions and check-ins

📅 6. Plans for Tomorrow
* Write a brief outline of next-day intentions
* Review past plans and see if they were completed
