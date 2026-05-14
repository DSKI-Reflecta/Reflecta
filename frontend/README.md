# Reflecta Frontend

This repository contains the frontend code for the Reflecta application, built with React and Tailwind CSS.

## Getting Started

Follow these instructions to set up and run the frontend project locally.

### Prerequisites

* Node.js (LTS version recommended)

* npm or yarn package manager

### Installation

   ```
1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install

   ```

### Running the Project

1. Start the development server:

   ```bash
   npm start
   # or
   yarn start

   ```

   This will typically open the application in your default browser at `http://localhost:3000`.

2. Ensure your backend server is also running, as the frontend communicates with it to fetch and save data.

## Project Structure

The frontend project follows a component-based architecture. Here's an overview of the main directories and files:

```
frontend/
├── public/
│   └── index.html          # The main HTML file
├── src/
│   ├── api/                # API service files (for interacting with the backend)
│   ├── components/         # Reusable UI components
│   │   ├── ai/             # Components related to the AI chat feature
│   │   │   ├── AIButton.js
│   │   │   └── AIChat.js
│   │   ├── calendar/       # Components for the calendar feature
│   │   │   └── JournalCalendar.js
│   │   ├── common/         # Generic, reusable components (e.g., Modal)
│   │   │   └── Modal.js
│   │   ├── goals/          # Components for the goals feature
│   │   │   ├── GoalCard.js
│   │   │   ├── GoalForm.js
│   │   │   └── GoalList.js
│   │   ├── journal/        # Components for the journal feature
│   │   │   ├── EntryCard.js
│   │   │   ├── EntryForm.js
│   │   │   └── EntryList.js
│   │   └── layout/         # Layout components (Sidebar, Header)
│   │       ├── Header.js
│   │       └── Sidebar.js
│   ├── pages/              # Top-level components for each page/route
│   │   ├── CalendarPage.js
│   │   ├── GoalPage.js
│   │   └── JournalPage.js
│   ├── App.js              # The main application component
│   ├── FloatingButton.js   # Component for the floating action button
│   ├── index.css           # Global CSS styles (likely includes Tailwind directives)
│   └── index.js            # Entry point of the React application
├── .env                    # Environment variables (if used)
├── .gitignore              # Specifies intentionally untracked files
├── package-lock.json       # Records the exact versions of dependencies
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration (used by Tailwind)
├── README.md               # This file
└── tailwind.config.js      # Tailwind CSS configuration

```

## Technologies Used

* React

* Tailwind CSS

* Lucide React (for icons)
