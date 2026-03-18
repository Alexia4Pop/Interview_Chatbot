# AI Interviewer - Simplified Anthropic Interviewer Tool

An interactive system that conducts short AI-powered interviews with users on a
selected topic.

---

## 🚀 Live Demo
**https://interviewaichatbot.vercel.app**

---

## ✨ Features
- **Dynamic Topic Selection:** Users can choose their interview role (e.g., AI in the workplace, Software Engineer, etc.).
- **AI-Powered Questioning:** Generates 3-5 sequential, context-aware interview questions using Llama 3.3.
- **Automated Feedback:** Produces a detailed summary at the end of the session, including:
  - Overall Impression Score (0-100).
  - Sentiment Analysis & Key Themes.
  - Identification of Strengths and Areas for Improvement.
- **Structured Data Storage:** Interview transcripts and analysis are stored for future review.

---

## 🛠️ Technical Stack
- **Frontend:** Next.js, TypeScript, Tailwind CSS.
- **AI Integration:** Vercel AI SDK, Groq (Llama 3.3 70B Model).
- **Backend/Storage:** [Mention your storage, e.g., Firebase or LocalStorage].
- **Deployment:** Vercel.

---

## 🏗️ Architecture & Principles (GRASP)
[cite_start]This project was designed following the **GRASP (General Responsibility Assignment Software Patterns)** principles to ensure high cohesion and low coupling[cite: 3, 4, 320]:

- [cite_start]**Information Expert:** Responsibility for scoring and analysis is assigned to the service layer that holds the raw interview data[cite: 83].
- [cite_start]**Controller:** A dedicated controller manages the transition between interview states and UI events[cite: 239, 241].
- [cite_start]**Creator:** The `InterviewSession` logic is responsible for instantiating the feedback and analysis objects[cite: 143].
- [cite_start]**Low Coupling:** The UI is decoupled from the LLM logic through the use of standardized interfaces, making it easy to swap AI providers[cite: 443, 450].

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/username/ai-interviewer.git](https://github.com/username/ai-interviewer.git)