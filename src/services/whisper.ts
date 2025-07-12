import OpenAI from 'openai';
import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface RecordingOptions {
  maxDuration?: number; // in milliseconds
  quality?: 'high' | 'medium' | 'low';
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  duration: number;
}

let recording: Audio.AudioRecorder | null = null;

export const startRecording = async (options: RecordingOptions = {}): Promise<void> => {
  try {
    // Request permissions
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      throw new Error('Audio recording permission not granted');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recordingOptions: Audio.RecordingOptions = {
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: options.quality || Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(recordingOptions);
    await recording.startAsync();

    // Auto-stop recording after max duration
    if (options.maxDuration) {
      setTimeout(async () => {
        if (recording) {
          await stopRecording();
        }
      }, options.maxDuration);
    }
  } catch (error) {
    console.error('Error starting recording:', error);
    throw new Error('Failed to start recording');
  }
};

export const stopRecording = async (): Promise<string | null> => {
  try {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;

    return uri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw new Error('Failed to stop recording');
  }
};

export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  try {
    if (!audioUri) {
      throw new Error('No audio URI provided');
    }

    // Read the audio file
    const audioFile = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob for OpenAI API
    const audioBlob = new Blob([Buffer.from(audioFile, 'base64')], {
      type: 'audio/m4a',
    });

    // Create a File object from the blob
    const file = new File([audioBlob], 'audio.m4a', { type: 'audio/m4a' });

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Can be made configurable
      response_format: 'verbose_json',
    });

    // Get file info for duration
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    
    return {
      text: transcription.text,
      duration: transcription.duration || 0,
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};

export const recordAndTranscribe = async (
  options: RecordingOptions = {}
): Promise<TranscriptionResult | null> => {
  try {
    await startRecording(options);
    
    // Wait for recording to complete (either manually stopped or auto-stopped)
    return new Promise((resolve, reject) => {
      const checkRecording = async () => {
        if (!recording) {
          // Recording has been stopped
          const uri = await stopRecording();
          if (uri) {
            try {
              const result = await transcribeAudio(uri);
              // Clean up the temporary file
              await FileSystem.deleteAsync(uri, { idempotent: true });
              resolve(result);
            } catch (error) {
              reject(error);
            }
          } else {
            resolve(null);
          }
        } else {
          // Check again in 100ms
          setTimeout(checkRecording, 100);
        }
      };
      
      checkRecording();
    });
  } catch (error) {
    console.error('Error in record and transcribe:', error);
    throw new Error('Failed to record and transcribe');
  }
};

export const isRecording = (): boolean => {
  return recording !== null;
};

export const getRecordingStatus = async (): Promise<Audio.RecordingStatus | null> => {
  if (!recording) {
    return null;
  }
  
  try {
    return await recording.getStatusAsync();
  } catch (error) {
    console.error('Error getting recording status:', error);
    return null;
  }
};
