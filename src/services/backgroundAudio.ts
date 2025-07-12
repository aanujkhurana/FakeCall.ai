import { Audio } from 'expo-av';

let backgroundSound: Audio.Sound | null = null;
let isPlayingBackground = false;

export interface BackgroundNoiseOptions {
  type: 'office' | 'home' | 'street' | 'restaurant' | 'car' | 'hospital' | 'none';
  volume: number; // 0.0 to 1.0
}

// Background noise types for different scenarios
export const backgroundNoiseTypes = {
  office: {
    name: 'Office Environment',
    description: 'Keyboard typing, phone ringing, office chatter',
    url: 'https://www.soundjay.com/misc/sounds/office-ambience.mp3', // We'll generate this
  },
  home: {
    name: 'Home Environment', 
    description: 'TV in background, kitchen sounds, quiet atmosphere',
    url: 'https://www.soundjay.com/misc/sounds/home-ambience.mp3',
  },
  street: {
    name: 'Street/Outdoor',
    description: 'Traffic, people walking, urban sounds',
    url: 'https://www.soundjay.com/misc/sounds/street-ambience.mp3',
  },
  restaurant: {
    name: 'Restaurant/Cafe',
    description: 'People talking, dishes clinking, busy atmosphere',
    url: 'https://www.soundjay.com/misc/sounds/restaurant-ambience.mp3',
  },
  car: {
    name: 'In Car',
    description: 'Engine running, road noise, radio faintly',
    url: 'https://www.soundjay.com/misc/sounds/car-ambience.mp3',
  },
  hospital: {
    name: 'Hospital/Medical',
    description: 'PA announcements, medical equipment beeping',
    url: 'https://www.soundjay.com/misc/sounds/hospital-ambience.mp3',
  },
  none: {
    name: 'No Background',
    description: 'Clean audio with no background noise',
    url: '',
  },
};

export const startBackgroundNoise = async (options: BackgroundNoiseOptions): Promise<void> => {
  try {
    if (isPlayingBackground) {
      await stopBackgroundNoise();
    }

    if (options.type === 'none') {
      return;
    }

    // For now, we'll create synthetic background noise using Web Audio API
    if (typeof window !== 'undefined' && window.AudioContext) {
      await createSyntheticBackground(options);
    }

    isPlayingBackground = true;
  } catch (error) {
    console.error('Error starting background noise:', error);
  }
};

export const stopBackgroundNoise = async (): Promise<void> => {
  try {
    if (backgroundSound) {
      await backgroundSound.stopAsync();
      await backgroundSound.unloadAsync();
      backgroundSound = null;
    }
    
    // Stop synthetic background if running
    if (typeof window !== 'undefined' && (window as any).backgroundAudioContext) {
      (window as any).backgroundAudioContext.close();
      (window as any).backgroundAudioContext = null;
    }

    isPlayingBackground = false;
  } catch (error) {
    console.error('Error stopping background noise:', error);
  }
};

const createSyntheticBackground = async (options: BackgroundNoiseOptions): Promise<void> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    (window as any).backgroundAudioContext = audioContext;

    // Create different background noise patterns based on type
    switch (options.type) {
      case 'office':
        await createOfficeAmbience(audioContext, options.volume);
        break;
      case 'home':
        await createHomeAmbience(audioContext, options.volume);
        break;
      case 'street':
        await createStreetAmbience(audioContext, options.volume);
        break;
      case 'restaurant':
        await createRestaurantAmbience(audioContext, options.volume);
        break;
      case 'car':
        await createCarAmbience(audioContext, options.volume);
        break;
      case 'hospital':
        await createHospitalAmbience(audioContext, options.volume);
        break;
    }
  } catch (error) {
    console.error('Error creating synthetic background:', error);
  }
};

const createOfficeAmbience = async (audioContext: AudioContext, volume: number): Promise<void> => {
  // Create realistic office sounds
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(volume * 0.4, audioContext.currentTime);
  masterGain.connect(audioContext.destination);

  // Air conditioning hum (realistic frequency)
  const acHum = audioContext.createOscillator();
  const acGain = audioContext.createGain();
  acHum.frequency.setValueAtTime(120, audioContext.currentTime);
  acHum.type = 'sawtooth';
  acGain.gain.setValueAtTime(0.3, audioContext.currentTime);
  acHum.connect(acGain);
  acGain.connect(masterGain);
  acHum.start();

  // Distant phone ringing occasionally
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance
      createPhoneRing(audioContext, masterGain, volume * 0.2);
    }
  }, 8000);

  // Keyboard typing bursts
  setInterval(() => {
    if (Math.random() < 0.4) { // 40% chance
      createTypingBurst(audioContext, masterGain, volume * 0.3);
    }
  }, 3000);

  // Distant conversation murmur
  const murmur = audioContext.createOscillator();
  const murmurGain = audioContext.createGain();
  murmur.frequency.setValueAtTime(200 + Math.random() * 100, audioContext.currentTime);
  murmur.type = 'triangle';
  murmurGain.gain.setValueAtTime(0.1, audioContext.currentTime);
  murmur.connect(murmurGain);
  murmurGain.connect(masterGain);
  murmur.start();
};

const createPhoneRing = (audioContext: AudioContext, destination: AudioNode, volume: number) => {
  const ringOsc = audioContext.createOscillator();
  const ringGain = audioContext.createGain();

  ringOsc.frequency.setValueAtTime(800, audioContext.currentTime);
  ringOsc.type = 'sine';
  ringGain.gain.setValueAtTime(volume, audioContext.currentTime);
  ringGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

  ringOsc.connect(ringGain);
  ringGain.connect(destination);
  ringOsc.start();
  ringOsc.stop(audioContext.currentTime + 1.5);
};

const createTypingBurst = (audioContext: AudioContext, destination: AudioNode, volume: number) => {
  const burstDuration = 1 + Math.random() * 2; // 1-3 seconds
  const clickInterval = 80 + Math.random() * 40; // 80-120ms between clicks

  let clickTime = audioContext.currentTime;
  while (clickTime < audioContext.currentTime + burstDuration) {
    const clickOsc = audioContext.createOscillator();
    const clickGain = audioContext.createGain();

    clickOsc.frequency.setValueAtTime(1200 + Math.random() * 800, clickTime);
    clickOsc.type = 'square';
    clickGain.gain.setValueAtTime(volume * (0.5 + Math.random() * 0.5), clickTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.05);

    clickOsc.connect(clickGain);
    clickGain.connect(destination);
    clickOsc.start(clickTime);
    clickOsc.stop(clickTime + 0.05);

    clickTime += clickInterval / 1000;
  }
};

const createHomeAmbience = async (audioContext: AudioContext, volume: number): Promise<void> => {
  // Realistic home atmosphere
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
  masterGain.connect(audioContext.destination);

  // TV in background (realistic frequency range)
  const tvOsc = audioContext.createOscillator();
  const tvGain = audioContext.createGain();
  tvOsc.frequency.setValueAtTime(180 + Math.random() * 40, audioContext.currentTime);
  tvOsc.type = 'triangle';
  tvGain.gain.setValueAtTime(0.4, audioContext.currentTime);
  tvOsc.connect(tvGain);
  tvGain.connect(masterGain);
  tvOsc.start();

  // Occasional kitchen sounds
  setInterval(() => {
    if (Math.random() < 0.2) { // 20% chance
      createKitchenSound(audioContext, masterGain, volume * 0.4);
    }
  }, 6000);

  // House settling/creaking occasionally
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance
      createHouseCreak(audioContext, masterGain, volume * 0.3);
    }
  }, 12000);
};

const createKitchenSound = (audioContext: AudioContext, destination: AudioNode, volume: number) => {
  const sounds = [
    // Dish clink
    () => {
      const clink = audioContext.createOscillator();
      const clinkGain = audioContext.createGain();
      clink.frequency.setValueAtTime(1500 + Math.random() * 1000, audioContext.currentTime);
      clink.type = 'sine';
      clinkGain.gain.setValueAtTime(volume, audioContext.currentTime);
      clinkGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      clink.connect(clinkGain);
      clinkGain.connect(destination);
      clink.start();
      clink.stop(audioContext.currentTime + 0.3);
    },
    // Water running
    () => {
      const water = audioContext.createOscillator();
      const waterGain = audioContext.createGain();
      water.frequency.setValueAtTime(400 + Math.random() * 200, audioContext.currentTime);
      water.type = 'sawtooth';
      waterGain.gain.setValueAtTime(volume * 0.6, audioContext.currentTime);
      waterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
      water.connect(waterGain);
      waterGain.connect(destination);
      water.start();
      water.stop(audioContext.currentTime + 2);
    }
  ];

  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  randomSound();
};

const createHouseCreak = (audioContext: AudioContext, destination: AudioNode, volume: number) => {
  const creak = audioContext.createOscillator();
  const creakGain = audioContext.createGain();
  creak.frequency.setValueAtTime(80 + Math.random() * 40, audioContext.currentTime);
  creak.type = 'sawtooth';
  creakGain.gain.setValueAtTime(volume, audioContext.currentTime);
  creakGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
  creak.connect(creakGain);
  creakGain.connect(destination);
  creak.start();
  creak.stop(audioContext.currentTime + 0.8);
};

const createStreetAmbience = async (audioContext: AudioContext, volume: number): Promise<void> => {
  // Traffic and urban sounds
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume * 0.4, audioContext.currentTime);
  gainNode.connect(audioContext.destination);

  // Traffic rumble
  const trafficOsc = audioContext.createOscillator();
  trafficOsc.frequency.setValueAtTime(80 + Math.random() * 40, audioContext.currentTime);
  trafficOsc.type = 'sawtooth';
  trafficOsc.connect(gainNode);
  trafficOsc.start();
};

const createRestaurantAmbience = async (audioContext: AudioContext, volume: number): Promise<void> => {
  // Busy restaurant chatter and dishes
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
  gainNode.connect(audioContext.destination);

  // Chatter simulation
  const chatterOsc = audioContext.createOscillator();
  chatterOsc.frequency.setValueAtTime(200 + Math.random() * 300, audioContext.currentTime);
  chatterOsc.type = 'triangle';
  chatterOsc.connect(gainNode);
  chatterOsc.start();

  // Occasional dish clinks
  setInterval(() => {
    if (Math.random() < 0.2) {
      const clinkOsc = audioContext.createOscillator();
      const clinkGain = audioContext.createGain();
      
      clinkOsc.frequency.setValueAtTime(1200 + Math.random() * 800, audioContext.currentTime);
      clinkOsc.type = 'sine';
      clinkGain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
      clinkGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      clinkOsc.connect(clinkGain);
      clinkGain.connect(audioContext.destination);
      clinkOsc.start();
      clinkOsc.stop(audioContext.currentTime + 0.2);
    }
  }, 3000);
};

const createCarAmbience = async (audioContext: AudioContext, volume: number): Promise<void> => {
  // Engine and road noise
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume * 0.4, audioContext.currentTime);
  gainNode.connect(audioContext.destination);

  // Engine rumble
  const engineOsc = audioContext.createOscillator();
  engineOsc.frequency.setValueAtTime(120 + Math.random() * 30, audioContext.currentTime);
  engineOsc.type = 'sawtooth';
  engineOsc.connect(gainNode);
  engineOsc.start();
};

const createHospitalAmbience = async (audioContext: AudioContext, volume: number): Promise<void> => {
  // Medical equipment beeps and PA system
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
  gainNode.connect(audioContext.destination);

  // Occasional beeps
  setInterval(() => {
    if (Math.random() < 0.4) {
      const beepOsc = audioContext.createOscillator();
      const beepGain = audioContext.createGain();
      
      beepOsc.frequency.setValueAtTime(800, audioContext.currentTime);
      beepOsc.type = 'sine';
      beepGain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
      beepGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      beepOsc.connect(beepGain);
      beepGain.connect(audioContext.destination);
      beepOsc.start();
      beepOsc.stop(audioContext.currentTime + 0.3);
    }
  }, 4000);
};

export const getBackgroundForPersona = (persona: string): BackgroundNoiseOptions => {
  const backgroundMap: Record<string, BackgroundNoiseOptions> = {
    mum: { type: 'home', volume: 0.3 },
    boss: { type: 'office', volume: 0.4 },
    friend: { type: 'street', volume: 0.5 },
    custom: { type: 'none', volume: 0.0 },
  };
  
  return backgroundMap[persona] || { type: 'none', volume: 0.0 };
};

export const isBackgroundPlaying = (): boolean => {
  return isPlayingBackground;
};
