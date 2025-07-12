import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { prebuiltScenarios, getScenariosByPersona, getScenariosByUrgency } from '../data/scenarios';
import { CallScenario } from '../services/gpt';

type ScenarioScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ScenarioScreen = () => {
  const navigation = useNavigation<ScenarioScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mum' | 'boss' | 'friend' | 'custom'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customScenario, setCustomScenario] = useState<CallScenario>({
    persona: 'custom',
    situation: '',
    urgency: 'medium',
    duration: 30,
  });

  const getFilteredScenarios = () => {
    let filtered = prebuiltScenarios;

    if (selectedFilter !== 'all') {
      filtered = getScenariosByPersona(selectedFilter);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(scenario => scenario.urgency === urgencyFilter);
    }

    return filtered;
  };

  const handleScenarioPress = (scenarioId: string) => {
    Alert.alert(
      'Start Call',
      'How would you like to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => navigation.navigate('Call', { scenarioId }),
        },
        {
          text: 'Schedule',
          onPress: () => navigation.navigate('Timer', { scenarioId }),
        },
      ]
    );
  };

  const handleCustomScenario = () => {
    if (!customScenario.situation.trim()) {
      Alert.alert('Error', 'Please describe the situation for your custom call.');
      return;
    }

    Alert.alert(
      'Custom Scenario',
      'How would you like to proceed with your custom scenario?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            navigation.navigate('Call', { 
              scenarioId: 'custom',
              customScenario 
            });
            setShowCustomModal(false);
          },
        },
        {
          text: 'Schedule',
          onPress: () => {
            navigation.navigate('Timer', { 
              scenarioId: 'custom',
            });
            setShowCustomModal(false);
          },
        },
      ]
    );
  };

  const renderFilterButton = (filter: string, label: string, isPersona: boolean = true) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        (isPersona ? selectedFilter : urgencyFilter) === filter && styles.activeFilterButton,
      ]}
      onPress={() => {
        if (isPersona) {
          setSelectedFilter(filter as any);
        } else {
          setUrgencyFilter(filter as any);
        }
      }}
    >
      <Text
        style={[
          styles.filterButtonText,
          (isPersona ? selectedFilter : urgencyFilter) === filter && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderScenarioCard = (scenario: any) => (
    <TouchableOpacity
      key={scenario.id}
      style={styles.scenarioCard}
      onPress={() => handleScenarioPress(scenario.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
        <View style={styles.cardContent}>
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <Text style={styles.scenarioDescription}>{scenario.description}</Text>
          <View style={styles.scenarioMeta}>
            <Text style={styles.scenarioPersona}>
              {scenario.persona.charAt(0).toUpperCase() + scenario.persona.slice(1)}
            </Text>
            <Text style={styles.scenarioDuration}>
              ~{scenario.estimatedDuration}s
            </Text>
            <Text style={[
              styles.scenarioUrgency,
              scenario.urgency === 'high' && styles.highUrgency,
              scenario.urgency === 'medium' && styles.mediumUrgency,
              scenario.urgency === 'low' && styles.lowUrgency,
            ]}>
              {scenario.urgency.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Persona Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>👤 Caller Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton('all', 'All')}
            {renderFilterButton('mum', '👩‍👧‍👦 Mum')}
            {renderFilterButton('boss', '👔 Boss')}
            {renderFilterButton('friend', '🤝 Friend')}
            {renderFilterButton('custom', '🎭 Custom')}
          </ScrollView>
        </View>

        {/* Urgency Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>⚡ Urgency Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {renderFilterButton('all', 'All', false)}
            {renderFilterButton('low', '🟢 Low', false)}
            {renderFilterButton('medium', '🟡 Medium', false)}
            {renderFilterButton('high', '🔴 High', false)}
          </ScrollView>
        </View>

        {/* Custom Scenario Button */}
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => setShowCustomModal(true)}
        >
          <Text style={styles.customButtonText}>✨ Create Custom Scenario</Text>
        </TouchableOpacity>

        {/* Scenarios List */}
        <View style={styles.scenariosSection}>
          <Text style={styles.sectionTitle}>
            📋 Available Scenarios ({getFilteredScenarios().length})
          </Text>
          {getFilteredScenarios().map(renderScenarioCard)}
        </View>
      </ScrollView>

      {/* Custom Scenario Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Custom Scenario</Text>
            <TouchableOpacity onPress={handleCustomScenario}>
              <Text style={styles.modalDoneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Situation Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe the situation for your fake call..."
              value={customScenario.situation}
              onChangeText={(text) => setCustomScenario({...customScenario, situation: text})}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Urgency Level</Text>
            <View style={styles.urgencyButtons}>
              {['low', 'medium', 'high'].map((urgency) => (
                <TouchableOpacity
                  key={urgency}
                  style={[
                    styles.urgencyButton,
                    customScenario.urgency === urgency && styles.selectedUrgencyButton,
                  ]}
                  onPress={() => setCustomScenario({...customScenario, urgency: urgency as any})}
                >
                  <Text style={[
                    styles.urgencyButtonText,
                    customScenario.urgency === urgency && styles.selectedUrgencyButtonText,
                  ]}>
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Estimated Duration (seconds)</Text>
            <TextInput
              style={styles.numberInput}
              placeholder="30"
              value={customScenario.duration?.toString()}
              onChangeText={(text) => setCustomScenario({
                ...customScenario, 
                duration: parseInt(text) || 30
              })}
              keyboardType="numeric"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  customButton: {
    backgroundColor: '#34C759',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scenariosSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scenarioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginBottom: 8,
  },
  scenarioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scenarioPersona: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  scenarioDuration: {
    fontSize: 12,
    color: '#999',
  },
  scenarioUrgency: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  highUrgency: {
    backgroundColor: '#FF3B30',
    color: '#fff',
  },
  mediumUrgency: {
    backgroundColor: '#FF9500',
    color: '#fff',
  },
  lowUrgency: {
    backgroundColor: '#34C759',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDoneButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
  },
  numberInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedUrgencyButton: {
    backgroundColor: '#007AFF',
  },
  urgencyButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedUrgencyButtonText: {
    color: '#fff',
  },
});

export default ScenarioScreen;
