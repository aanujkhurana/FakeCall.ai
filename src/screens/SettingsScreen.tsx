import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { cancelAllScheduledCalls } from '../utils/timer';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [autoEndCalls, setAutoEndCalls] = useState(true);

  const handleClearScheduledCalls = () => {
    Alert.alert(
      'Clear All Scheduled Calls',
      'Are you sure you want to cancel all scheduled calls?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllScheduledCalls();
            Alert.alert('Success', 'All scheduled calls have been cancelled.');
          },
        },
      ]
    );
  };

  const handleOpenNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'To ensure fake calls work properly, please enable notifications for this app in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon: string,
    destructive: boolean = false
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle,
            destructive && styles.destructiveText
          ]}>
            {title}
          </Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App Settings</Text>
        
        {renderSettingItem(
          'Notifications',
          'Enable notifications for scheduled calls',
          notificationsEnabled,
          setNotificationsEnabled,
          '🔔'
        )}
        
        {renderSettingItem(
          'Haptic Feedback',
          'Vibrate during call interactions',
          hapticsEnabled,
          setHapticsEnabled,
          '📳'
        )}
        
        {renderSettingItem(
          'Auto-End Calls',
          'Automatically end calls after dialogue finishes',
          autoEndCalls,
          setAutoEndCalls,
          '⏱️'
        )}
      </View>

      {/* Call Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Call Management</Text>
        
        {renderActionItem(
          'Notification Permissions',
          'Manage notification settings for this app',
          handleOpenNotificationSettings,
          '⚙️'
        )}
        
        {renderActionItem(
          'Clear Scheduled Calls',
          'Cancel all pending scheduled calls',
          handleClearScheduledCalls,
          '🗑️',
          true
        )}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        
        <View style={styles.aboutCard}>
          <Text style={styles.appTitle}>📞 FakeCall.AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your AI-powered escape companion for awkward situations. 
            Generate realistic fake calls using GPT-4o and advanced text-to-speech technology.
          </Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Features</Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>AI-Generated Conversations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎭</Text>
            <Text style={styles.featureText}>Multiple Personas (Mum, Boss, Friend)</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔊</Text>
            <Text style={styles.featureText}>Realistic Text-to-Speech</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏰</Text>
            <Text style={styles.featureText}>Scheduled Call Timing</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Custom Scenarios</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureText}>Realistic Call Interface</Text>
          </View>
        </View>
      </View>

      {/* Privacy Notice */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Privacy</Text>
        
        <View style={styles.privacyCard}>
          <Text style={styles.privacyText}>
            This app uses OpenAI's GPT-4o and TTS services to generate realistic conversations. 
            Your scenario descriptions are sent to OpenAI for processing but are not stored permanently. 
            No personal information is collected or shared.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for those awkward moments
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  chevron: {
    fontSize: 18,
    color: '#c0c0c0',
    fontWeight: '300',
  },
  aboutCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  privacyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;
