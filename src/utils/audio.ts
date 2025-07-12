import { Audio } from 'expo-audio';
import * as Haptics from 'expo-haptics';

export interface AudioManager {
  sound: Audio.AudioPlayer | null;
  isPlaying: boolean;
  duration: number;
  position: number;
}

let audioManager: AudioManager = {
  sound: null,
  isPlaying: false,
  duration: 0,
  position: 0,
};

export const initializeAudio = async (): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

export const loadAudio = async (uri: string): Promise<Audio.Sound> => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false, isLooping: false }
    );
    
    audioManager.sound = sound;
    
    // Get duration
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      audioManager.duration = status.durationMillis || 0;
    }
    
    return sound;
  } catch (error) {
    console.error('Error loading audio:', error);
    throw new Error('Failed to load audio');
  }
};

export const playAudio = async (sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToPlay = sound || audioManager.sound;
    if (!audioToPlay) {
      throw new Error('No audio loaded');
    }

    await audioToPlay.playAsync();
    audioManager.isPlaying = true;
    
    // Haptic feedback for call start
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.error('Error playing audio:', error);
    throw new Error('Failed to play audio');
  }
};

export const pauseAudio = async (sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToPause = sound || audioManager.sound;
    if (!audioToPause) {
      return;
    }

    await audioToPause.pauseAsync();
    audioManager.isPlaying = false;
  } catch (error) {
    console.error('Error pausing audio:', error);
  }
};

export const stopAudio = async (sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToStop = sound || audioManager.sound;
    if (!audioToStop) {
      return;
    }

    await audioToStop.stopAsync();
    audioManager.isPlaying = false;
    audioManager.position = 0;
    
    // Haptic feedback for call end
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

export const unloadAudio = async (sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToUnload = sound || audioManager.sound;
    if (!audioToUnload) {
      return;
    }

    await audioToUnload.unloadAsync();
    if (audioToUnload === audioManager.sound) {
      audioManager.sound = null;
      audioManager.isPlaying = false;
      audioManager.duration = 0;
      audioManager.position = 0;
    }
  } catch (error) {
    console.error('Error unloading audio:', error);
  }
};

export const getAudioStatus = async (sound?: Audio.Sound): Promise<Audio.AudioStatus | null> => {
  try {
    const audioToCheck = sound || audioManager.sound;
    if (!audioToCheck) {
      return null;
    }

    return await audioToCheck.getStatusAsync();
  } catch (error) {
    console.error('Error getting audio status:', error);
    return null;
  }
};

export const setAudioPosition = async (positionMillis: number, sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToSeek = sound || audioManager.sound;
    if (!audioToSeek) {
      return;
    }

    await audioToSeek.setPositionAsync(positionMillis);
    audioManager.position = positionMillis;
  } catch (error) {
    console.error('Error setting audio position:', error);
  }
};

export const setAudioVolume = async (volume: number, sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToAdjust = sound || audioManager.sound;
    if (!audioToAdjust) {
      return;
    }

    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    await audioToAdjust.setVolumeAsync(clampedVolume);
  } catch (error) {
    console.error('Error setting audio volume:', error);
  }
};

export const fadeInAudio = async (duration: number = 1000, sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToFade = sound || audioManager.sound;
    if (!audioToFade) {
      return;
    }

    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const volume = i / steps;
      await setAudioVolume(volume, audioToFade);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  } catch (error) {
    console.error('Error fading in audio:', error);
  }
};

export const fadeOutAudio = async (duration: number = 1000, sound?: Audio.Sound): Promise<void> => {
  try {
    const audioToFade = sound || audioManager.sound;
    if (!audioToFade) {
      return;
    }

    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = steps; i >= 0; i--) {
      const volume = i / steps;
      await setAudioVolume(volume, audioToFade);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  } catch (error) {
    console.error('Error fading out audio:', error);
  }
};

export const getCurrentAudioManager = (): AudioManager => {
  return { ...audioManager };
};
