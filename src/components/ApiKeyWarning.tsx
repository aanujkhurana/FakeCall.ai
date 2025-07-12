import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';

interface ApiKeyWarningProps {
  onDismiss?: () => void;
}

const ApiKeyWarning: React.FC<ApiKeyWarningProps> = ({ onDismiss }) => {
  const handleOpenDocs = () => {
    Linking.openURL('https://platform.openai.com/api-keys');
  };

  const handleShowInstructions = () => {
    Alert.alert(
      'Setup Instructions',
      '1. Get your OpenAI API key from platform.openai.com/api-keys\n\n2. Open the .env file in your project root\n\n3. Replace "sk-your-openai-api-key-here" with your actual API key\n\n4. Restart the app',
      [
        { text: 'Open OpenAI', onPress: handleOpenDocs },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>API Key Required</Text>
        <Text style={styles.message}>
          To use AI-generated calls, you need to add your OpenAI API key to the .env file.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleShowInstructions}
          >
            <Text style={styles.primaryButtonText}>Setup Instructions</Text>
          </TouchableOpacity>
          
          {onDismiss && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onDismiss}
            >
              <Text style={styles.secondaryButtonText}>Continue Anyway</Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ApiKeyWarning;
