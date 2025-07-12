# 📞 FakeCall.AI

An AI-powered mobile app that simulates realistic phone calls to help you escape awkward situations gracefully.

## ✅ Build Status

**COMPLETELY REALISTIC FAKE CALL EXPERIENCE!** 🎉📞

- ✅ **REAL-LOOKING CALL INTERFACE**: Identical to iOS/Android native calls
- ✅ **NATURAL AI VOICES**: Human-like speech with persona-specific voices
- ✅ **REALISTIC BACKGROUND AUDIO**: Office, home, street ambience
- ✅ **AUTHENTIC PHONE RINGING**: Real ringtone sounds and vibration
- ✅ **INDISTINGUISHABLE FROM REAL CALLS**: Perfect for any situation
- ✅ AI services integrated (GPT-4o for realistic dialogue)
- ✅ Cross-platform support (iOS/Android/Web)
- ✅ Development server running successfully

## 🚀 Quick Start

1. **Add your OpenAI API key** to the `.env` file:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

2. **Test the app** by scanning the QR code with Expo Go or running on simulator

3. **Try the features**:
   - Browse scenarios on the Home screen
   - Create custom scenarios
   - Schedule fake calls
   - **Test the realistic call interface with SOUND!**

## 📞 REALISTIC FAKE CALL EXPERIENCE

**Your app creates INDISTINGUISHABLE fake calls:**

### 🎭 **Visual Realism:**
- **Exact iOS/Android call interface** - Status bar, contact photos, call controls
- **Real contact names** - "Mom", "Sarah (Work)", "Jessica", "Dr. Martinez Office"
- **Authentic phone numbers** - Realistic mobile/work number display
- **Native call controls** - Mute, keypad, speaker, add call, FaceTime buttons

### 🔊 **Audio Realism:**
- **Natural AI voices** - Human-like speech with persona-specific characteristics
- **Realistic background noise** - Office typing, home TV, street traffic
- **Authentic phone ringing** - Real ringtone sounds and vibration patterns
- **Professional voice quality** - Uses advanced speech synthesis

### 🎯 **Perfect Deception:**
- **Mum calls** - Caring maternal voice with home background (TV, kitchen)
- **Boss calls** - Professional authoritative voice with office sounds (typing, phones)
- **Friend calls** - Casual friendly voice with street/social background
- **Custom calls** - Configurable for any scenario (doctor, emergency, etc.)

## 🎯 Features

- **AI-Generated Conversations**: Uses GPT-4o to create realistic, contextual dialogue
- **Multiple Personas**: Choose from Mum, Boss, Friend, or create custom scenarios
- **Text-to-Speech**: High-quality voice synthesis for natural-sounding calls
- **Scheduled Calls**: Set timers for calls to arrive at the perfect moment
- **Realistic Interface**: Authentic call screen that looks like a real incoming call
- **Emergency Mode**: Quick access for immediate fake calls
- **Custom Scenarios**: Create personalized situations for any context

## 📱 App Screens

1. **Home Screen** - Quick access to emergency scenarios and scheduled calls
2. **Scenarios Screen** - Browse and filter available call scenarios  
3. **Call Screen** - Realistic incoming call interface with AI-generated dialogue
4. **Timer Screen** - Schedule calls for specific times
5. **Settings Screen** - Configure app preferences and permissions

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **AI Services**: OpenAI GPT-4o for dialogue generation
- **Text-to-Speech**: OpenAI TTS API
- **Speech-to-Text**: OpenAI Whisper (optional)
- **Navigation**: React Navigation
- **Notifications**: Expo Notifications
- **Audio**: Expo AV

## 🎭 Usage Scenarios

- **Social Events**: Escape boring conversations or uncomfortable situations
- **Work Meetings**: Get out of lengthy or unproductive meetings
- **Dates**: Graceful exit strategy for awkward first dates
- **Family Gatherings**: Polite way to leave early
- **Sales Calls**: Interrupt persistent salespeople
- **Any Situation**: Custom scenarios for specific needs

## 🔧 Configuration

The app supports various configuration options:

- **Voice Selection**: Choose different TTS voices for different personas
- **Call Duration**: Customize how long conversations last
- **Urgency Levels**: Adjust the intensity of the fake emergency
- **Notification Settings**: Configure when and how calls are delivered

## 📋 Required Permissions

- **Notifications**: To deliver scheduled fake calls
- **Audio**: For TTS playback and optional voice recording
- **Microphone**: Optional, for voice interaction features

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens (Home, Scenarios, Call, Timer, Settings)
├── services/           # API integrations (GPT, TTS, Whisper)
├── data/              # Static data and scenarios
├── utils/             # Utility functions (audio, timer)
└── navigation/        # App navigation setup
```

## 🔒 Privacy

- All conversations are generated in real-time using OpenAI's API
- No personal data is stored permanently
- Scenario descriptions are sent to OpenAI for processing only
- Audio files are temporarily cached and automatically cleaned up

## 🚀 Next Steps

1. **Get an OpenAI API key** from https://platform.openai.com/api-keys
2. **Add the API key** to your `.env` file
3. **Test on your device** using Expo Go
4. **Customize scenarios** in `src/data/scenarios.ts`
5. **Build for production** using `expo build` when ready

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This app is designed for entertainment and social convenience purposes. Use responsibly and considerately. Always be honest with close friends and family about your whereabouts for safety reasons.
