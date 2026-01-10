# 🚀 FOCUSYNC

**FOCUSYNC** is a **privacy-first productivity and burnout-awareness app for developers**.  
It helps students and developers track focus time, visualize productivity trends, and receive **context-aware AI guidance** — all while keeping user data local and secure.

> Focus well. Sync better.

---

## ✨ Key Highlights

- 🧠 Privacy-first (localStorage based, no central server)
- ⏱️ Pomodoro-style focus tracking
- 📊 Real-time productivity & burnout analytics
- 🤖 AI Coach powered by Gemini
- 🐙 GitHub activity insights (public data only)
- 💼 LinkedIn growth tracking (manual, honest metrics)
- 🎨 Flow-state UI with category-based themes
- 🔐 Cost-efficient, student-friendly cloud usage

---

## 🧩 Core Concept

FOCUSYNC follows a simple and effective loop:


- Users track focus sessions using a timer
- The app calculates productivity and burnout risk
- An AI Coach analyzes these stats to give personalized advice

All user data (sessions, moods, settings) is stored **locally in the browser**.  
No personal data is sent to any backend server.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|--------|-----------|--------|
| **Frontend** | TypeScript | Type-safe application logic |
|  | React | Component-based UI development |
|  | Tailwind CSS | Utility-first styling and theming |
|  | Recharts | Data visualization and analytics charts |
| **AI & APIs** | Gemini API | AI Coach and Debug Mode functionality |
|  | GitHub Public Events API | Fetches public commit activity |
|  | ghchart.rshah.org | Renders GitHub contribution graph (SVG) |
| **Deployment** | Google Cloud Run | Serverless deployment and hosting |
|  | Budget Alerts & Free Tier | Cost control and safe usage limits |

---

## ⏱️ Features Overview

### 1️⃣ Focus Timer (Tracker)
- Pomodoro-style focus sessions
- Category selection (DSA, Web Dev, Projects, etc.)
- Dynamic theme changes per category
- Flow-state UI with animations
- Smart break reminders based on user preferences

---

### 2️⃣ Dashboard (Real-Time Insights)
- **Productivity Score**  
- **Burnout Risk Meter**
- +20% if work > 4 hours
- +50% if work > 8 hours
- +30% if last mood = “Exhausted”
- −20% if last mood = “Great”
- Weekly focus trend (area chart)
- Recent GitHub commit messages

---

### 3️⃣ Analytics (Deep Dive)
- Pie chart showing time distribution by category
- Bar chart for daily focus hours (current week)
- Helps identify patterns, imbalance, and overwork

---

### 4️⃣ AI Coach (Gemini Integration)
- Context-aware responses using:
- focus duration
- mood
- user goals
- Encourages rest when burnout risk is high
- Motivates gently when productivity is low

#### 🛠️ Debug Mode
- Switches AI to “Engineering Expert”
- Accepts code input
- Returns clean, copy-pasteable Markdown code blocks
- Prevents layout breaking for long code outputs

---

### 5️⃣ GitHub Integration
- User provides GitHub profile URL
- App fetches **public events only**
- Displays:
- recent commit messages
- contribution graph (SVG)
- No private repositories or code content accessed

---

### 6️⃣ LinkedIn Metrics Tracking
- LinkedIn has no public API for private analytics
- Users manually enter:
- profile views
- post impressions
- App visualizes career growth alongside coding activity
- Ensures **accuracy and honesty**, no data hallucination

---

## ⚙️ Settings & Profile

- User profile (role, focus type, goals)
- Daily goal & break preferences
- GitHub & LinkedIn connections
- Notification permissions
- AI personalization toggles
- Full privacy & data controls

---

## 🔐 Privacy & Data Philosophy

FOCUSYNC is built with privacy as a **core design principle**.

- No accounts required
- No backend database
- No tracking scripts
- No hidden analytics

Users can:
- export their data
- clear history
- delete everything instantly

---

## 🚨 Smart Alert System

- Background monitoring using React hooks
- Triggers:
- Burnout alerts after excessive work
- Mood check-in reminders
- Notifications delivered via:
- in-app toasts
- browser system notifications (with consent)

---

## 🌍 Deployment & Cost Control

- Deployed on **Google Cloud Run**
- Uses scale-to-zero infrastructure
- Minimal real-world cost (student usage)
- Budget alerts enabled for safety

---

## 📸 Screenshots

> A quick visual walkthrough of FOCUSYNC

### 🏠 Dashboard
<img width="1920" height="990" alt="Screenshot (980)" src="https://github.com/user-attachments/assets/aa45dbb6-0c6b-46fa-a2c2-5584a14bc325" />

### ⏱️ Focus Timer (Flow State)
<img width="1920" height="1001" alt="Screenshot (981)" src="https://github.com/user-attachments/assets/a6c8cd80-ecf1-4788-9d81-28ebfb91b440" />

### 📊 Analytics
<img width="1920" height="986" alt="Screenshot (982)" src="https://github.com/user-attachments/assets/46741d5d-ee5f-4b5b-a49f-788c8ef15660" />

### 🤖 AI Coach
<img width="1920" height="979" alt="Screenshot (983)" src="https://github.com/user-attachments/assets/e5268591-4957-40d2-bdeb-1f3fa4568e5b" />

### ⚙️ Settings & Profile
<img width="1920" height="993" alt="Screenshot (984)" src="https://github.com/user-attachments/assets/688cca35-dd48-478a-85e5-a8513c690080" />

---

## 🧪 Getting Started (Run Locally)

### Clone the repository
```bash
git clone https://github.com/Khushi1310-nayak/focusync.git
cd focusync
```
### Install dependencies
```bash
npm Install
```
### Start the development server
```bash
npm run dev
```
### 🤝 Contributing

Contributions are welcome!
Feel free to fork the repository, create a feature branch, and submit a pull request.

### 📜 License

This project is licensed under the MIT License.

#### 👩‍💻 Author

Khushi Nayak
Student Developer | Hackathon Enthusiast

GitHub: https://github.com/Khushi1310-nayak
