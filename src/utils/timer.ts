import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

export interface TimerOptions {
  delay: number; // in seconds
  title?: string;
  body?: string;
  sound?: boolean;
  vibrate?: boolean;
}

export interface ScheduledCall {
  id: string;
  notificationId: string;
  scheduledTime: Date;
  scenario: any; // Will be typed properly when we have the scenario type
  isActive: boolean;
}

let scheduledCalls: ScheduledCall[] = [];

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleCall = async (
  scenario: any,
  options: TimerOptions
): Promise<string> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const scheduledTime = new Date(Date.now() + options.delay * 1000);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title || 'Incoming Call',
        body: options.body || 'You have an incoming fake call',
        sound: options.sound !== false,
        vibrate: options.vibrate !== false ? [0, 250, 250, 250] : undefined,
        data: {
          type: 'fake-call',
          scenario: scenario,
        },
      },
      trigger: {
        seconds: options.delay,
      },
    });

    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledCall: ScheduledCall = {
      id: callId,
      notificationId,
      scheduledTime,
      scenario,
      isActive: true,
    };

    scheduledCalls.push(scheduledCall);
    
    return callId;
  } catch (error) {
    console.error('Error scheduling call:', error);
    throw new Error('Failed to schedule call');
  }
};

export const cancelScheduledCall = async (callId: string): Promise<boolean> => {
  try {
    const callIndex = scheduledCalls.findIndex(call => call.id === callId);
    if (callIndex === -1) {
      return false;
    }

    const scheduledCall = scheduledCalls[callIndex];
    
    // Cancel the notification
    await Notifications.cancelScheduledNotificationAsync(scheduledCall.notificationId);
    
    // Mark as inactive and remove from array
    scheduledCall.isActive = false;
    scheduledCalls.splice(callIndex, 1);
    
    return true;
  } catch (error) {
    console.error('Error canceling scheduled call:', error);
    return false;
  }
};

export const cancelAllScheduledCalls = async (): Promise<void> => {
  try {
    // Cancel all notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Clear the scheduled calls array
    scheduledCalls.forEach(call => call.isActive = false);
    scheduledCalls = [];
  } catch (error) {
    console.error('Error canceling all scheduled calls:', error);
  }
};

export const getScheduledCalls = (): ScheduledCall[] => {
  return scheduledCalls.filter(call => call.isActive);
};

export const getScheduledCall = (callId: string): ScheduledCall | undefined => {
  return scheduledCalls.find(call => call.id === callId && call.isActive);
};

export const formatTimeRemaining = (scheduledTime: Date): string => {
  const now = new Date();
  const diff = scheduledTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Now';
  }
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const createQuickTimer = (minutes: number): TimerOptions => {
  return {
    delay: minutes * 60,
    title: 'Incoming Call',
    body: `Your scheduled fake call is ready`,
    sound: true,
    vibrate: true,
  };
};

// Preset timer options
export const presetTimers = {
  immediate: { delay: 5, title: 'Incoming Call', body: 'Emergency fake call' },
  oneMinute: { delay: 60, title: 'Incoming Call', body: 'Your fake call is ready' },
  fiveMinutes: { delay: 300, title: 'Incoming Call', body: 'Your scheduled fake call' },
  tenMinutes: { delay: 600, title: 'Incoming Call', body: 'Your scheduled fake call' },
  thirtyMinutes: { delay: 1800, title: 'Incoming Call', body: 'Your scheduled fake call' },
};

// Listen for notification responses
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Trigger haptic feedback for call events
export const triggerCallHaptics = async (type: 'start' | 'end' | 'ring'): Promise<void> => {
  try {
    switch (type) {
      case 'start':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'end':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'ring':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  } catch (error) {
    console.error('Error triggering haptics:', error);
  }
};
