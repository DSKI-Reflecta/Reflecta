## 🧠 Reflecta

A private, intelligent journaling system to reflect, track emotional patterns, and stay aligned with your goals — guided by an AI agent.

### Core Features

📓 **1. Daily Journal Entry**
Simple input, powerful insights. Each day, users can:
* ✍️ Write a short entry.
* 🧘‍♀️ Optionally log their current state using interactive sliders for sentiment, sleep quality, stress level, and social engagement.
* 🤖 Benefit from an AI-powered analysis pipeline that formats entries, extracts activities, performs sentiment analysis, and stores everything in a local SQLite database.

🎯 **2. Goals & Priorities**
Set, organize, and evolve your direction.
* ➕ Add, ✏️ update, and ❌ delete personal goals.
* 🗂️ Categorize goals (e.g., Health, Work, Relationships).
* 📊 Connect journal entries to goal relevance to track your progress.

🗓️ **3. Calendar**
Visualize your journey.
* 🗓️ View your journal entries, plans, and goal due dates in a comprehensive calendar with month, week, and daily views.

📈 **4. Analytics**
Gain personal insights from your data.
* 🎯 Track goal alignment and monitor trends in your mood, sleep, stress, and sociality.
* 🔁 Discover correlation insights, such as how sleep quality impacts stress levels.
* ✅ Get a summary of your activities over time.

🤖 **5. AI Chatbot (Reflecta Assistant)**
Your personal, context-aware companion.
* 💡 The assistant knows your journal, goals, and trends to provide personalized support.
* 📬 Get help with goal setting, mood reflection, and planning.
* 🧠 Receive smart suggestions and check-ins to stay on track.

---

# 🚀 Getting Started with Docker

This project is fully containerized using Docker. With just one command, you can get the entire application (frontend and backend) up and running.
Alternatively, you can navigate to the README files in the frontend and backend directory and follow the instructions to launch the app manually. 

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

