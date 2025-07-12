import OpenAI from 'openai';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface TTSOptions {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.25 to 4.0
  model: 'tts-1' | 'tts-1-hd';
}

export interface AudioResult {
  uri?: string;
  duration: number;
  text: string;
  sound?: Audio.Sound;
}

// Global flag to control speech sequence cancellation
let isSequenceCancelled = false;

export const generateSpeech = async (
  text: string,
  options: Partial<TTSOptions> = {}
): Promise<AudioResult> => {
  try {
    // For immediate feedback, we'll use expo-speech instead of OpenAI TTS
    // This provides instant audio without API delays
    const estimatedDuration = Math.max(2, text.length * 0.1); // Rough estimate

    return {
      text,
      duration: estimatedDuration,
    };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
};

export const generateCallAudio = async (
  dialogue: string[],
  options: Partial<TTSOptions> = {}
): Promise<AudioResult[]> => {
  try {
    const audioResults: AudioResult[] = [];
    
    for (const line of dialogue) {
      if (line.trim()) {
        const audio = await generateSpeech(line, options);
        audioResults.push(audio);
        
        // Add small delay between lines for natural conversation flow
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return audioResults;
  } catch (error) {
    console.error('Error generating call audio:', error);
    throw new Error('Failed to generate call audio');
  }
};

export const playCallSequence = async (
  audioResults: AudioResult[],
  persona: string,
  onDialogueChange?: (text: string) => void
): Promise<void> => {
  try {
    // Reset cancellation flag at start of new sequence
    isSequenceCancelled = false;

    for (const audio of audioResults) {
      // Check if sequence was cancelled
      if (isSequenceCancelled) {
        break;
      }

      // Update dialogue display
      if (onDialogueChange) {
        onDialogueChange(audio.text);
      }

      // Speak the text using expo-speech with persona-specific voice
      await speakTextAsPersona(audio.text, persona);

      // Check again before pause
      if (isSequenceCancelled) {
        break;
      }

      // Natural pause between dialogue lines (like real phone conversation)
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  } catch (error) {
    console.error('Error playing call sequence:', error);
    throw new Error('Failed to play call sequence');
  }
};

export const speakTextAsPersona = async (text: string, persona: string): Promise<void> => {
  return new Promise((resolve) => {
    // Use Web Speech API for more natural voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceSettings = getVoiceSettingsForPersona(persona);

      // Try to find a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = findBestVoiceForPersona(voices, persona);

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.pitch = voiceSettings.pitch;
      utterance.rate = voiceSettings.rate;
      utterance.volume = 0.9;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback to expo-speech
      const voiceSettings = getVoiceSettingsForPersona(persona);

      Speech.speak(text, {
        language: 'en-US',
        pitch: voiceSettings.pitch,
        rate: voiceSettings.rate,
        onDone: () => resolve(),
        onError: () => resolve(),
      });
    }
  });
};

const getVoiceSettingsForPersona = (persona: string) => {
  const voiceSettings = {
    mum: {
      pitch: 1.15,     // Higher pitch for maternal voice
      rate: 0.7,      // Slower, caring pace
    },
    boss: {
      pitch: 0.85,     // Lower pitch for authority
      rate: 0.8,      // Professional pace
    },
    friend: {
      pitch: 1.05,     // Slightly higher pitch for friendliness
      rate: 0.85,     // Casual pace
    },
    custom: {
      pitch: 1.0,      // Neutral settings
      rate: 0.8,
    },
  };

  return voiceSettings[persona as keyof typeof voiceSettings] || voiceSettings.custom;
};

const findBestVoiceForPersona = (voices: SpeechSynthesisVoice[], persona: string): SpeechSynthesisVoice | null => {
  if (!voices.length) return null;

  // Preferred voice names for each persona
  const voicePreferences = {
    mum: ['Karen', 'Susan', 'Victoria', 'Samantha', 'female'],
    boss: ['Daniel', 'Alex', 'David', 'male'],
    friend: ['Zoe', 'Tessa', 'Allison', 'female'],
    custom: ['Samantha', 'Alex', 'default'],
  };

  const preferences = voicePreferences[persona as keyof typeof voicePreferences] || voicePreferences.custom;

  // Try to find preferred voices
  for (const preference of preferences) {
    const voice = voices.find(v =>
      v.name.toLowerCase().includes(preference.toLowerCase()) ||
      v.lang.includes('en')
    );
    if (voice) return voice;
  }

  // Fallback to first English voice
  return voices.find(v => v.lang.includes('en')) || voices[0];
};

export const stopAllSpeech = async (): Promise<void> => {
  try {
    // Cancel any ongoing sequence
    isSequenceCancelled = true;

    // Stop Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Stop expo-speech
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};

export const cleanupAudioFiles = async (audioResults: AudioResult[]): Promise<void> => {
  try {
    // Stop all speech first
    await stopAllSpeech();

    for (const audio of audioResults) {
      await FileSystem.deleteAsync(audio.uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error cleaning up audio files:', error);
  }
};

// Voice options for different personas
export const getVoiceForPersona = (persona: string): TTSOptions['voice'] => {
  const voiceMap: Record<string, TTSOptions['voice']> = {
    mum: 'nova',      // Warm, maternal voice
    boss: 'onyx',     // Professional, authoritative
    friend: 'alloy',  // Casual, friendly
    custom: 'shimmer' // Neutral option
  };
  
  return voiceMap[persona] || 'nova';
};
