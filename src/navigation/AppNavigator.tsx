import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import ScenarioScreen from '../screens/ScenarioScreen';
import CallScreen from '../screens/CallScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TimerScreen from '../screens/TimerScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Call: {
    scenarioId: string;
    customScenario?: any;
  };
  Timer: {
    scenarioId: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Scenarios: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scenarios') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'FakeCall.AI',
          headerTitle: '📞 FakeCall.AI',
        }}
      />
      <Tab.Screen 
        name="Scenarios" 
        component={ScenarioScreen}
        options={{
          title: 'Scenarios',
          headerTitle: '🎭 Scenarios',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: '⚙️ Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Call" 
          component={CallScreen}
          options={{
            title: '📞 Incoming Call',
            headerBackTitle: 'Back',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen 
          name="Timer" 
          component={TimerScreen}
          options={{
            title: '⏱️ Schedule Call',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
