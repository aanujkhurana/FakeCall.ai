import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface AudioNotificationProps {
  onDismiss?: () => void;
}

const AudioNotification: React.FC<AudioNotificationProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleEnableAudio = () => {
    Alert.alert(
      'Realistic Fake Call Experience',
      'Your FakeCall.AI app creates realistic incoming calls:\n\n📞 Phone rings like a real call\n📳 Device vibrates naturally\n🎭 AI character speaks to YOU\n🔊 Background noise (office, home, street)\n\nHow it works:\n• You receive a fake incoming call\n• AI character (Mum/Boss/Friend) talks to you\n• Background sounds make it realistic\n• Perfect for escaping awkward situations!',
      [
        { text: 'Got it!', onPress: () => setIsVisible(false) },
      ]
    );
  };

  const handleTestAudio = () => {
    // Test speech synthesis with AI character voice
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Hi honey, it\'s Mum calling! This is how your fake calls will sound.');
      utterance.rate = 0.75;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      Alert.alert('Speech Not Available', 'Speech synthesis is not supported in this environment.');
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🔊</Text>
        <Text style={styles.title}>Realistic Fake Calls Ready!</Text>
        <Text style={styles.message}>
          AI characters will call and speak to you with realistic background noise. Perfect for escaping awkward situations!
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleEnableAudio}
          >
            <Text style={styles.primaryButtonText}>Learn More</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleTestAudio}
          >
            <Text style={styles.secondaryButtonText}>Test AI Voice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setIsVisible(false)}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    maxWidth: 350,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AudioNotification;
