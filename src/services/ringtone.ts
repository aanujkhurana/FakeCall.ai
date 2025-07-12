import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let ringtoneSound: Audio.Sound | null = null;
let isRinging = false;

export const startRinging = async (): Promise<void> => {
  try {
    if (isRinging) return;

    // Initialize audio mode for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Create a simple ringtone using Audio.Sound
    // For now, we'll use a system sound or create a simple tone
    isRinging = true;

    // Start vibration pattern for incoming call
    startCallVibration();

    // Play a simple beep sound repeatedly
    playRingtoneLoop();

  } catch (error) {
    console.error('Error starting ringtone:', error);
  }
};

export const stopRinging = async (): Promise<void> => {
  try {
    isRinging = false;

    if (ringtoneSound) {
      await ringtoneSound.stopAsync();
      await ringtoneSound.unloadAsync();
      ringtoneSound = null;
    }

    // Stop vibration
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  } catch (error) {
    console.error('Error stopping ringtone:', error);
  }
};

const playRingtoneLoop = async (): Promise<void> => {
  try {
    while (isRinging) {
      // Create a simple beep sound
      await playBeep();

      // Wait between rings
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!isRinging) break;

      // Vibrate during ring
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Wait for next ring cycle
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error in ringtone loop:', error);
  }
};

const playBeep = async (): Promise<void> => {
  try {
    // For web/testing, we'll use a simple audio context beep
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (error) {
    console.log('Audio beep not available:', error);
  }
};

const startCallVibration = async (): Promise<void> => {
  try {
    // Initial strong vibration for incoming call
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Continue vibrating while ringing
    const vibrateInterval = setInterval(async () => {
      if (!isRinging) {
        clearInterval(vibrateInterval);
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 1500);

  } catch (error) {
    console.error('Error with vibration:', error);
  }
};

export const isCurrentlyRinging = (): boolean => {
  return isRinging;
};