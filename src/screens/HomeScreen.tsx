import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { quickScenarios, casualScenarios } from '../data/scenarios';
import { getScheduledCalls, formatTimeRemaining } from '../utils/timer';
import AudioNotification from '../components/AudioNotification';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [scheduledCalls, setScheduledCalls] = useState(getScheduledCalls());
  const [showAudioNotification, setShowAudioNotification] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setScheduledCalls(getScheduledCalls());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickCall = (scenarioId: string) => {
    Alert.alert(
      'Quick Call',
      'Start this fake call immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => navigation.navigate('Call', { scenarioId }),
        },
      ]
    );
  };

  const handleScheduleCall = (scenarioId: string) => {
    navigation.navigate('Timer', { scenarioId });
  };

  const renderScenarioCard = (scenario: any, isQuick: boolean = false) => (
    <TouchableOpacity
      key={scenario.id}
      style={[styles.scenarioCard, isQuick && styles.quickCard]}
      onPress={() => handleQuickCall(scenario.id)}
      onLongPress={() => handleScheduleCall(scenario.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
        <View style={styles.cardContent}>
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <Text style={styles.scenarioDescription}>{scenario.description}</Text>
          <Text style={styles.scenarioDuration}>
            ~{scenario.estimatedDuration}s • {scenario.urgency} urgency
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleQuickCall(scenario.id)}
        >
          <Text style={styles.actionButtonText}>📞 Call Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.timerButton]}
          onPress={() => handleScheduleCall(scenario.id)}
        >
          <Text style={styles.actionButtonText}>⏱️ Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to FakeCall.AI</Text>
        <Text style={styles.welcomeSubtitle}>
          Your AI-powered escape companion for awkward situations
        </Text>
      </View>

      {/* Scheduled Calls Section */}
      {scheduledCalls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Scheduled Calls</Text>
          {scheduledCalls.map((call) => (
            <View key={call.id} style={styles.scheduledCallCard}>
              <Text style={styles.scheduledCallTitle}>
                {call.scenario?.title || 'Custom Call'}
              </Text>
              <Text style={styles.scheduledCallTime}>
                {formatTimeRemaining(call.scheduledTime)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Emergency Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 Emergency Scenarios</Text>
        <Text style={styles.sectionSubtitle}>
          Tap to call immediately, long press to schedule
        </Text>
        <View style={styles.scenarioGrid}>
          {quickScenarios.map((scenario) => renderScenarioCard(scenario, true))}
        </View>
      </View>

      {/* Casual Scenarios Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>😊 Casual Scenarios</Text>
        <Text style={styles.sectionSubtitle}>
          Perfect for less urgent situations
        </Text>
        <View style={styles.scenarioGrid}>
          {casualScenarios.map((scenario) => renderScenarioCard(scenario))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Scenarios')}
        >
          <Text style={styles.quickActionText}>🎭 Browse All Scenarios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.quickActionText}>⚙️ App Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Audio Notification */}
      {showAudioNotification && (
        <AudioNotification onDismiss={() => setShowAudioNotification(false)} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#007AFF',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  scenarioGrid: {
    gap: 12,
  },
  scenarioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scenarioIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scenarioDuration: {
    fontSize: 12,
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#34C759',
  },
  timerButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scheduledCallCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  scheduledCallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scheduledCallTime: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeScreen;
