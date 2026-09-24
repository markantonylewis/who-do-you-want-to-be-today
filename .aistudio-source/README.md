# Who Am I Today? 🎭✨

A whimsical, interactive toddler speech & costume app designed for toddlers and early talkers (ages 1–4). Children can see themselves in a magical mirror wearing costumes (Firefighter 🚒, Astronaut 🚀, Doctor 🩺, Chef 👨‍🍳, Builder 🔨, Police Officer 👮, Pilot ✈️, Gardener 🌻), explore interactive sound-action cards, and practice vocabulary repetition with gentle praise.

---

## 🌟 Key Features

- **AR Magic Mirror & Cartoon Avatar**: Real-time MediaPipe face tracking to overlay whimsical animated hats and costumes. If camera access is disabled or unavailable, seamlessly defaults to an adorable animated toddler cartoon avatar.
- **Speech Repetition & Phonics Loop**: 
  - Dual-stage repetition with cheerful voice encouragement.
  - Interactive speech recognition with high-tolerance phonetic matching for toddler pronunciation approximations.
  - Gemini AI speech interpretation fallback for creative toddler word variations.
- **Sensory & Parent Controls**:
  - PIN-protected Parent Dashboard (math challenge or custom PIN).
  - Low-Sensory / Calm Mode with gentler colors, lower pitch sounds, and softer vibrations.
  - Screen time session timers with gentle wind-down warnings.
  - Granular character & costume toggles.
- **Haptic Tactile Feedback**:
  - Physical vibrations on supported mobile devices when tapping costumes, pressing action pictures, and completing learning rounds.
- **Bilingual & Voice Controls**:
  - Natural speech synthesis with pitch, rate, and accent adjustments.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `bun`

### Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   cd <YOUR-REPO-NAME>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env` if you wish to use server-side AI speech interpretation.

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Vision / AR**: MediaPipe FaceLandmarker (@mediapipe/tasks-vision)
- **Audio & Haptics**: Web Audio API synthesizer, Web Speech API (Synthesis & Recognition), Vibration API
- **Backend / Proxy**: Express, tsx, Node.js proxy with optional Gemini API integration
