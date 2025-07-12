# 📞 FakeCall.AI

**FakeCall.AI** is an AI-powered mobile app that simulates realistic phone calls to help users exit awkward, uncomfortable, or unsafe situations. Built with React Native and OpenAI’s GPT-4o, it generates custom, lifelike voice calls on demand.

---

## ✨ Features

- 🧠 **AI-Generated Voice Calls** using GPT-4o and realistic TTS
- ⏱️ **Timer-Based Call Triggering** with customizable delays
- 🎭 **Pre-Built Personas** like “Mum,” “Boss,” “Friend,” or custom callers
- 🎙️ **Fake Call Screen** that mimics real phone UI (iOS & Android)
- 🗣️ **Optional User Voice Input** processed with Whisper (or Vosk)
- 📔 **Call History Log** for realistic alibi records (optional)

---

## 📲 Demo Scenarios

| Scenario | Description |
|----------|-------------|
| 🧓 Mum Checking In | Sweet and casual check-up call |
| 🧑‍💼 Boss Calling | Urgent work excuse to leave immediately |
| 🧑‍🤝‍🧑 Friend in Trouble | High-pressure call needing your help |
| 🎨 Custom | You write your own excuse or dialogue |

---

## 🧱 Tech Stack

### Frontend
- [React Native](https://reactnative.dev/) (with Expo)
- [`react-navigation`](https://reactnavigation.org/)
- [`react-native-callkeep`](https://github.com/react-native-webrtc/react-native-callkeep) / `CallKit` / `ConnectionService`
- `expo-av` for audio playback

### Backend (Optional)
- [Supabase](https://supabase.com/) or Firebase for auth, data, and edge functions
- Node.js + Express (if custom backend needed)

### AI & Audio
- [OpenAI GPT-4o](https://platform.openai.com/docs/guides/gpt)
- [OpenAI Text-to-Speech](https://platform.openai.com/docs/guides/text-to-speech)
- [Whisper Speech-to-Text](https://platform.openai.com/docs/guides/speech-to-text)
- (Optional) [ElevenLabs](https://www.elevenlabs.io/) for voice cloning

---

## ⚙️ Project Structure

```

/src
/components       → React Native UI components
/screens          → Call UI, Scenario picker, etc.
/services
gpt.ts          → GPT-4o API calls
tts.ts          → TTS conversion logic
whisper.ts      → Optional speech recognition
/data             → Static or dynamic scenarios
/utils            → Audio playback, timers, helpers
App.tsx           → Main entry point

````

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/your-username/fakecall-ai.git
cd fakecall-ai
npm install
````

### 2. Set Up API Keys

Create an `.env` file:

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=public-anon-key
```

### 3. Run the App

```bash
npx expo start
```

Use Expo Go or a simulator (Xcode / Android Studio).

---

## 🔐 Permissions

* 📞 `CALL_PHONE` / `CallKit` – to simulate call screen
* 🎤 `RECORD_AUDIO` – optional, for listening to user replies
* 🔊 `AUDIO` – to play AI voice
* 🔔 Notifications – to schedule future fake calls

---

## 💡 Development Notes

* GPT-4o is used to generate the dialogue script for each call.
* The call screen uses platform-native APIs to mimic realism.
* Audio is either **pre-fetched** (TTS before call) or streamed (if supported).
* Optional voice interaction uses **Whisper STT** to adjust AI response in real time.

---

## 📈 Monetization (Future Plans)

* **Free Tier**: 3 fake calls per day
* **Premium**: Unlimited calls, custom personas, save call logs
* **Add-ons**: Celebrity voice packs, prank templates, etc.

---

## 📸 Screenshots (Coming Soon)

| Scenario Picker | Fake Call Screen | AI Voice Settings |
| --------------- | ---------------- | ----------------- |
| ![screen1]()    | ![screen2]()     | ![screen3]()      |

---

## 🧠 Prompt Example (GPT-4o)

```ts
"You are calling the user as their concerned mum. You need to ask if they're okay, and if they're still coming to dinner. Speak warmly, include realistic pauses and interruptions. The user may stay silent — continue naturally."
```

---

## 🧪 TODO / Roadmap

* [ ] Implement Whisper STT for two-way interaction
* [ ] Add call logs with fake metadata
* [ ] Local cache of generated audio
* [ ] Shareable “Fake Call Alibi” cards
* [ ] Voice style selector (e.g., nervous, chill, angry)

---

## 🛡️ License

MIT — open to community contributions and plug-ins.

---

## 👋 Contribute

Want to add your own persona or prank call template? Fork this repo and open a PR!