<div align="center">

# 🚀 FOCUSYNC
### Privacy-First Productivity & Burnout-Awareness App

*A productivity app for developers that tracks focus time, visualizes trends, and provides context-aware AI guidance—all while keeping user data local and secure.*

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-orange?style=for-the-badge&logo=google)
![Google Cloud Run](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

</div>

---

# 📖 Overview

FOCUSYNC is a privacy-first productivity and burnout-awareness app for developers. It helps students and developers track focus time, visualize productivity trends, and receive context-aware AI guidance. 

The core concept follows a simple and effective loop:
1. Users track focus sessions using a timer.
2. The app calculates productivity and burnout risk.
3. An AI Coach analyzes these stats to give personalized advice.

All user data (sessions, moods, settings) is stored **locally in the browser**. No personal data is sent to any backend server, ensuring complete privacy.

> *Focus well. Sync better.*

---

# ✨ Features

- 🧠 **Privacy-First:** 100% localStorage based, no central server or hidden analytics.
- ⏱️ **Pomodoro-Style Timer:** Focus tracking with category selection and smart break reminders.
- 📊 **Real-Time Analytics:** Dashboards for productivity, burnout risk, and weekly focus trends.
- 🤖 **AI Coach:** Gemini-powered context-aware guidance and a "Debug Mode" for clean code output.
- 🐙 **GitHub Integration:** Fetches public commit activity and contribution graphs.
- 💼 **LinkedIn Tracking:** Manual, honest metric tracking for career growth alongside coding.
- 🎨 **Flow-State UI:** Category-based themes and engaging animations.
- 🚨 **Smart Alerts:** Background monitoring for burnout risk and mood check-ins.

---

# 🏗 Architecture

```mermaid
graph TD
    User["User (Student / Developer)"]
    
    subgraph CloudRun ["Google Cloud Run (Serverless Hosting)"]
        ReactApp["React & TypeScript SPA"]
        
        subgraph UI_Modules ["FOCUSYNC Modules"]
            Timer["Focus Timer"]
            Dashboard["Real-Time Dashboard"]
            Analytics["Analytics (Recharts)"]
            AICoach["AI Coach"]
            Settings["Settings & Profile"]
        end
    end

    subgraph External ["External APIs"]
        Gemini["Google Gemini API (AI Coach & Debug)"]
        GitHub["GitHub Public Events API"]
    end
    
    subgraph Storage ["Privacy-First Data Layer"]
        LocalStorage["Browser LocalStorage"]
    end
    
    User --> ReactApp
    ReactApp --> UI_Modules
    
    UI_Modules -. "Local Read/Write (Zero Backend)" .-> LocalStorage
    
    AICoach -- "Prompts & Context" --> Gemini
    Dashboard -- "Fetch Public Commits" --> GitHub
```

---

# 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React, TypeScript | Component-based UI and type-safe logic |
| **Styling** | Tailwind CSS | Utility-first styling and dynamic themes |
| **Visualization**| Recharts | Data visualization and analytics charts |
| **AI & APIs** | Gemini API | AI Coach and Debug Mode functionality |
| **Integrations**| GitHub API | Fetches public commit activity |
| **Deployment** | Google Cloud Run | Serverless deployment and scale-to-zero hosting |

---

# 🔐 Privacy & Data Philosophy

FOCUSYNC is built with privacy as a **core design principle**.

- No accounts required
- No backend database
- No tracking scripts
- No hidden analytics

Users can **export their data**, **clear history**, or **delete everything instantly** right from the settings.

---

# 📸 Screenshots

### 🏠 Dashboard
<img width="1920" height="990" alt="Screenshot (980)" src="https://github.com/user-attachments/assets/aa45dbb6-0c6b-46fa-a2c2-5584a14bc325" />

---

### ⏱️ Focus Timer (Flow State)
<img width="1920" height="1001" alt="Screenshot (981)" src="https://github.com/user-attachments/assets/a6c8cd80-ecf1-4788-9d81-28ebfb91b440" />

---

### 📊 Analytics
<img width="1920" height="986" alt="Screenshot (982)" src="https://github.com/user-attachments/assets/46741d5d-ee5f-4b5b-a49f-788c8ef15660" />

---

### 🤖 AI Coach
<img width="1920" height="979" alt="Screenshot (983)" src="https://github.com/user-attachments/assets/e5268591-4957-40d2-bdeb-1f3fa4568e5b" />

---

### ⚙️ Settings & Profile
<img width="1920" height="993" alt="Screenshot (984)" src="https://github.com/user-attachments/assets/688cca35-dd48-478a-85e5-a8513c690080" />

---

# ⚙️ Installation & Setup

## 1. Clone the repository
```bash
git clone https://github.com/Khushi1310-nayak/focusync.git
cd focusync
```

## 2. Install dependencies
```bash
npm install
```

## 3. Start the development server
```bash
npm run dev
```

---

# 🤝 Contributing

Contributions are welcome!

Feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👩💻 Author

## **Manisa Nayak**

🎓 Student | Full-Stack Developer | AI Product Builder

Passionate about:
- Full-Stack Architecture
- User Experience (UI/UX)
- AI Automation & Product Building

### Connect with Me

**GitHub:** https://github.com/Khushi1310-nayak  
**LinkedIn:** https://www.linkedin.com/in/manisa-nayak-185bb5378/

---

## ⭐ If you found this project interesting, consider giving it a Star!
