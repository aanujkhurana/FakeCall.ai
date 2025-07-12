import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getScenarioById } from '../data/scenarios';
import { generateCallScript } from '../services/gpt';
import { generateCallAudio, playCallSequence, cleanupAudioFiles, stopAllSpeech } from '../services/tts';
import { startRinging, stopRinging } from '../services/ringtone';
import { startBackgroundNoise, stopBackgroundNoise, getBackgroundForPersona } from '../services/backgroundAudio';
import { triggerCallHaptics } from '../utils/timer';
import ApiKeyWarning from '../components/ApiKeyWarning';

type CallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Call'>;
type CallScreenRouteProp = RouteProp<RootStackParamList, 'Call'>;

const { width, height } = Dimensions.get('window');

const CallScreen = () => {
  const navigation = useNavigation<CallScreenNavigationProp>();
  const route = useRoute<CallScreenRouteProp>();
  const { scenarioId, customScenario } = route.params;

  const [callState, setCallState] = useState<'incoming' | 'active' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [scenario, setScenario] = useState<any>(null);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  useEffect(() => {
    // Get scenario
    if (scenarioId === 'custom' && customScenario) {
      setScenario({
        title: 'Custom Call',
        icon: '🎭',
        ...customScenario,
      });
    } else {
      const foundScenario = getScenarioById(scenarioId);
      setScenario(foundScenario);
    }

    // Start ringing when call screen loads
    startRinging();
    triggerCallHaptics('ring');

    // Cleanup on unmount
    return () => {
      stopRinging();
      stopBackgroundNoise();
      stopAllSpeech(); // Stop any ongoing speech synthesis
    };
  }, [scenarioId, customScenario]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerCall = async () => {
    if (!scenario) return;

    // Stop ringing when call is answered
    await stopRinging();
    setCallState('active');
    setIsGenerating(true);
    await triggerCallHaptics('start');

    try {
      // Start background noise appropriate for the persona
      const backgroundSettings = getBackgroundForPersona(scenario.persona);
      await startBackgroundNoise(backgroundSettings);

      // Generate the call script using GPT
      const script = await generateCallScript(scenario);

      // Generate audio for the script
      const audioResults = await generateCallAudio(script.dialogue);

      setIsGenerating(false);

      // Play the AI character speaking with background noise
      await playCallSequence(audioResults, scenario.persona, (text) => {
        setCurrentDialogue(text);
      });

      // Clean up audio files
      await cleanupAudioFiles(audioResults);
      
      // Auto-end call after dialogue finishes
      setTimeout(() => {
        if (callState === 'active') {
          handleEndCall();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error during call:', error);
      setIsGenerating(false);

      // Check if it's an API key error
      if (error instanceof Error && error.message.includes('API key')) {
        setShowApiKeyWarning(true);
      } else {
        Alert.alert(
          'Call Error',
          'There was an issue generating the call. Please check your internet connection and API key.',
          [{ text: 'OK', onPress: handleEndCall }]
        );
      }
    }
  };

  const handleEndCall = async () => {
    await stopRinging();
    await stopBackgroundNoise();
    await stopAllSpeech(); // Stop any ongoing speech synthesis
    setCallState('ended');
    await triggerCallHaptics('end');

    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const handleDeclineCall = async () => {
    await stopRinging();
    await stopBackgroundNoise();
    await stopAllSpeech(); // Stop any ongoing speech synthesis
    navigation.goBack();
  };

  if (!scenario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Scenario not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent={false}
      />

      {/* Real iOS/Android Call Interface */}
      {callState === 'incoming' && (
        <View style={styles.incomingCallContainer}>
          {/* Top Status Bar */}
          <View style={styles.topStatusBar}>
            <Text style={styles.carrierText}>Verizon</Text>
            <Text style={styles.timeText}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            <Text style={styles.batteryText}>100%</Text>
          </View>

          {/* Incoming Call Label */}
          <Text style={styles.incomingLabel}>Incoming call</Text>

          {/* Contact Photo */}
          <View style={styles.contactPhotoContainer}>
            <View style={styles.contactPhoto}>
              <Text style={styles.contactInitial}>
                {scenario.persona === 'mum' && 'M'}
                {scenario.persona === 'boss' && 'S'}
                {scenario.persona === 'friend' && 'J'}
                {scenario.persona === 'custom' && 'C'}
              </Text>
            </View>
          </View>

          {/* Contact Name */}
          <Text style={styles.contactName}>
            {scenario.persona === 'mum' && 'Mom'}
            {scenario.persona === 'boss' && 'Sarah (Work)'}
            {scenario.persona === 'friend' && 'Jessica'}
            {scenario.persona === 'custom' && 'Dr. Martinez Office'}
          </Text>

          {/* Phone Number */}
          <Text style={styles.phoneNumber}>
            {scenario.persona === 'mum' && 'mobile +1 (555) 123-4567'}
            {scenario.persona === 'boss' && 'work +1 (555) 987-6543'}
            {scenario.persona === 'friend' && 'mobile +1 (555) 456-7890'}
            {scenario.persona === 'custom' && '+1 (555) 000-0000'}
          </Text>

          {/* Call Actions */}
          <View style={styles.callActionsContainer}>
            <View style={styles.callActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionLabel}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>👤</Text>
                <Text style={styles.actionLabel}>Remind Me</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Answer/Decline Buttons */}
          <View style={styles.answerDeclineContainer}>
            <TouchableOpacity
              style={styles.declineButtonReal}
              onPress={handleDeclineCall}
            >
              <View style={styles.phoneIconContainer}>
                <Text style={styles.phoneIcon}>📞</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.answerButtonReal}
              onPress={handleAnswerCall}
            >
              <View style={styles.phoneIconContainer}>
                <Text style={styles.phoneIcon}>📞</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Call Interface */}
      {callState === 'active' && (
        <View style={styles.activeCallContainer}>
          {/* Top Status */}
          <View style={styles.activeTopBar}>
            <Text style={styles.activeCallStatus}>
              {isGenerating ? 'Connecting...' : formatDuration(callDuration)}
            </Text>
          </View>

          {/* Contact Info */}
          <View style={styles.activeContactContainer}>
            <View style={styles.activeContactPhoto}>
              <Text style={styles.activeContactInitial}>
                {scenario.persona === 'mum' && 'M'}
                {scenario.persona === 'boss' && 'S'}
                {scenario.persona === 'friend' && 'J'}
                {scenario.persona === 'custom' && 'C'}
              </Text>
            </View>
            <Text style={styles.activeContactName}>
              {scenario.persona === 'mum' && 'Mom'}
              {scenario.persona === 'boss' && 'Sarah (Work)'}
              {scenario.persona === 'friend' && 'Jessica'}
              {scenario.persona === 'custom' && 'Dr. Martinez Office'}
            </Text>
          </View>

          {/* Call Controls */}
          <View style={styles.activeCallControls}>
            <View style={styles.controlRow}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>🔇</Text>
                <Text style={styles.controlLabel}>mute</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>⌨️</Text>
                <Text style={styles.controlLabel}>keypad</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>🔊</Text>
                <Text style={styles.controlLabel}>speaker</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.controlRow}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>➕</Text>
                <Text style={styles.controlLabel}>add call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>📹</Text>
                <Text style={styles.controlLabel}>FaceTime</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>📞</Text>
                <Text style={styles.controlLabel}>contacts</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* End Call Button */}
          <View style={styles.endCallContainer}>
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <Text style={styles.endCallIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Call Ended */}
      {callState === 'ended' && (
        <View style={styles.endedContainer}>
          <Text style={styles.endedText}>Call Ended</Text>
          <Text style={styles.endedDuration}>Duration: {formatDuration(callDuration)}</Text>
        </View>
      )}



      {/* API Key Warning */}
      {showApiKeyWarning && (
        <ApiKeyWarning onDismiss={() => setShowApiKeyWarning(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Incoming Call Styles (Real iOS/Android Look)
  incomingCallContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 40,
  },
  carrierText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  batteryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  incomingLabel: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 40,
  },
  contactPhotoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  contactPhoto: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#555',
  },
  contactInitial: {
    fontSize: 80,
    color: '#fff',
    fontWeight: '300',
  },
  contactName: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 60,
  },
  callActionsContainer: {
    paddingHorizontal: 40,
    marginBottom: 80,
  },
  callActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  answerDeclineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    paddingBottom: 50,
  },
  declineButtonReal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButtonReal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIconContainer: {
    transform: [{ rotate: '0deg' }],
  },
  phoneIcon: {
    fontSize: 32,
    color: '#fff',
  },

  // Active Call Styles
  activeCallContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  activeTopBar: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 40,
  },
  activeCallStatus: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  activeContactContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  activeContactPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeContactInitial: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '300',
  },
  activeContactName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
  },
  activeCallControls: {
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    width: 80,
  },
  controlIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.6,
  },
  endCallContainer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    fontSize: 32,
    color: '#fff',
    transform: [{ rotate: '135deg' }],
  },

  // Call Ended Styles
  endedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  endedText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  endedDuration: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default CallScreen;
