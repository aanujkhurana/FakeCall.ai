import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getScenarioById } from '../data/scenarios';
import { scheduleCall, presetTimers, getScheduledCalls, cancelScheduledCall } from '../utils/timer';

type TimerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Timer'>;
type TimerScreenRouteProp = RouteProp<RootStackParamList, 'Timer'>;

const TimerScreen = () => {
  const navigation = useNavigation<TimerScreenNavigationProp>();
  const route = useRoute<TimerScreenRouteProp>();
  const { scenarioId } = route.params;

  const [scenario, setScenario] = useState<any>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [scheduledCalls, setScheduledCalls] = useState(getScheduledCalls());

  useEffect(() => {
    const foundScenario = getScenarioById(scenarioId);
    setScenario(foundScenario);
  }, [scenarioId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScheduledCalls(getScheduledCalls());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScheduleCall = async (delaySeconds: number) => {
    if (!scenario) return;

    try {
      const callId = await scheduleCall(scenario, {
        delay: delaySeconds,
        title: `${scenario.title}`,
        body: `Your fake call from ${scenario.persona} is ready!`,
      });

      Alert.alert(
        'Call Scheduled',
        `Your fake call will arrive in ${Math.floor(delaySeconds / 60)} minutes and ${delaySeconds % 60} seconds.`,
        [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Scheduling Error',
        'Failed to schedule the call. Please check your notification permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Invalid Time', 'Please enter a valid number of minutes.');
      return;
    }

    if (minutes > 1440) { // 24 hours
      Alert.alert('Time Limit', 'Maximum scheduling time is 24 hours (1440 minutes).');
      return;
    }

    handleScheduleCall(minutes * 60);
  };

  const handleCancelCall = async (callId: string) => {
    Alert.alert(
      'Cancel Call',
      'Are you sure you want to cancel this scheduled call?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelScheduledCall(callId);
            if (success) {
              setScheduledCalls(getScheduledCalls());
              Alert.alert('Call Cancelled', 'The scheduled call has been cancelled.');
            }
          },
        },
      ]
    );
  };

  const renderPresetButton = (label: string, delaySeconds: number, icon: string) => (
    <TouchableOpacity
      key={label}
      style={styles.presetButton}
      onPress={() => handleScheduleCall(delaySeconds)}
    >
      <Text style={styles.presetIcon}>{icon}</Text>
      <Text style={styles.presetLabel}>{label}</Text>
      <Text style={styles.presetTime}>
        {delaySeconds < 60 ? `${delaySeconds}s` : `${Math.floor(delaySeconds / 60)}m`}
      </Text>
    </TouchableOpacity>
  );

  if (!scenario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Scenario not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Scenario Info */}
      <View style={styles.scenarioSection}>
        <View style={styles.scenarioHeader}>
          <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
          <View style={styles.scenarioInfo}>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioDescription}>{scenario.description}</Text>
          </View>
        </View>
      </View>

      {/* Preset Timers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Schedule</Text>
        <Text style={styles.sectionSubtitle}>Choose a preset time for your fake call</Text>
        
        <View style={styles.presetGrid}>
          {renderPresetButton('Emergency', presetTimers.immediate.delay, '🚨')}
          {renderPresetButton('1 Minute', presetTimers.oneMinute.delay, '⏱️')}
          {renderPresetButton('5 Minutes', presetTimers.fiveMinutes.delay, '🕐')}
          {renderPresetButton('10 Minutes', presetTimers.tenMinutes.delay, '🕙')}
          {renderPresetButton('30 Minutes', presetTimers.thirtyMinutes.delay, '🕕')}
        </View>
      </View>

      {/* Custom Timer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Custom Timer</Text>
        <Text style={styles.sectionSubtitle}>Set your own schedule time</Text>
        
        <View style={styles.customTimerContainer}>
          <TextInput
            style={styles.customInput}
            placeholder="Enter minutes"
            value={customMinutes}
            onChangeText={setCustomMinutes}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleCustomTimer}
          >
            <Text style={styles.customButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scheduled Calls */}
      {scheduledCalls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Your Scheduled Calls</Text>
          {scheduledCalls.map((call) => (
            <View key={call.id} style={styles.scheduledCallCard}>
              <View style={styles.scheduledCallInfo}>
                <Text style={styles.scheduledCallTitle}>
                  {call.scenario?.title || 'Custom Call'}
                </Text>
                <Text style={styles.scheduledCallTime}>
                  {call.scheduledTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelCall(call.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            • Make sure notifications are enabled for the app
          </Text>
          <Text style={styles.tipText}>
            • Keep your phone's volume up to hear the call
          </Text>
          <Text style={styles.tipText}>
            • The call will appear as a realistic incoming call
          </Text>
          <Text style={styles.tipText}>
            • You can cancel scheduled calls anytime
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scenarioSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scenarioIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  presetTime: {
    fontSize: 12,
    color: '#666',
  },
  customTimerContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduledCallCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduledCallInfo: {
    flex: 1,
  },
  scheduledCallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scheduledCallTime: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default TimerScreen;
