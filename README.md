# 🏏 IPL Buddy — Smart Match Companion

> Real-time IPL match intelligence platform that converts live cricket data into actionable insights, momentum analysis, and win predictions.

🌐 **Live Demo:** https://ipl-buddy.vercel.app  
📦 **Repository:** https://github.com/shimantranjan/ipl-gdg  

---

## 📌 Overview

**IPL Buddy** is a lightweight, real-time cricket analytics dashboard designed to simplify how users understand live matches.

Traditional platforms provide scores and commentary, but they fail to answer:

> *“Who is actually winning right now, and why?”*

This project bridges that gap by transforming raw match data into **clear, contextual, and intelligent insights**.

---

## 🚨 Problem Statement

During live IPL matches, users:
- Switch between multiple apps (scoreboards, commentary, stats)
- Struggle to interpret match dynamics quickly
- Lack access to concise, real-time insights

Existing solutions focus on **data delivery**, not **decision clarity**.

---

## 💡 Solution

IPL Buddy provides a unified interface that:
- Interprets live match data
- Calculates match pressure and momentum
- Predicts win probability using heuristic models
- Generates short AI-driven insights for quick understanding

---

## ⚙️ System Architecture

The application follows a modular, layered design:

### 🔹 1. Data Layer
- Handles match data (runs, wickets, overs, players)
- Supports mock/live data integration

### 🔹 2. Analytics Layer
- Computes:
  - Current Run Rate (CRR)
  - Required Run Rate (RRR)
  - Wicket pressure
- Applies heuristic-based prediction logic

### 🔹 3. Insight Engine
- Generates contextual insights using prompt-based AI logic
- Converts numerical data into human-readable explanations

### 🔹 4. Presentation Layer
- Interactive dashboard UI
- Displays:
  - Scoreboard
  - Player stats
  - AI insights
  - Win probability

---

## 🚀 Features

- 📊 Real-time Match Dashboard  
- 🧠 AI-Generated Match Insights  
- 📈 Win Probability Prediction  
- 🔥 Momentum Analysis Engine  
- ⚡ Fast & Responsive UI  
- 🧩 Modular Architecture  

---

## 🛠 Tech Stack

| Layer        | Technology              |
|-------------|------------------------|
| Frontend    | React (Vite)           |
| Styling     | Tailwind CSS           |
| Logic Layer | JavaScript (heuristics)|
| AI Layer    | Prompt-based insights  |
| Deployment  | Vercel (CI/CD)         |

---

## 🌐 Deployment

Deployed on **Vercel** with GitHub integration:
- Automatic CI/CD on every push
- Instant production updates
- Optimized global delivery

---

## ⚙️ Local Setup

```bash
git clone https://github.com/shimantranjan/ipl-gdg.git
cd ipl-gdg
npm install
npm run dev
