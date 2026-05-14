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
│   └── index.html              # Main HTML file
├── src/
│   ├── api/                    # API service files for backend communication
│   ├── components/             # Reusable UI components (AI, calendar, goals, etc.)
│   ├── pages/                  # Top-level components for each page/route
│   ├── App.js                  # Main application component
│   ├── index.css               # Global CSS styles
│   └── index.js                # Entry point of the React application
├── Dockerfile                  # Docker configuration for the frontend
├── package.json                # Project dependencies and scripts
└── tailwind.config.js          # Tailwind CSS configuration
```

## Technologies Used

* React

* Tailwind CSS

* Lucide React (for icons)
