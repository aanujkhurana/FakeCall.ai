import { CallScenario } from '../services/gpt';

export interface PrebuiltScenario extends CallScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedDuration: number;
}

export const prebuiltScenarios: PrebuiltScenario[] = [
  {
    id: 'mum-dinner',
    title: 'Mum Checking In',
    description: 'Sweet and casual check-up call about dinner plans',
    icon: '👩‍👧‍👦',
    persona: 'mum',
    situation: 'Calling to check if you\'re okay and asking about dinner tonight',
    urgency: 'low',
    estimatedDuration: 45,
  },
  {
    id: 'boss-urgent',
    title: 'Boss Emergency',
    description: 'Urgent work matter requiring immediate attention',
    icon: '👔',
    persona: 'boss',
    situation: 'Urgent work issue that requires you to leave immediately',
    urgency: 'high',
    estimatedDuration: 30,
  },
  {
    id: 'friend-help',
    title: 'Friend in Trouble',
    description: 'Close friend needs your help with an emergency',
    icon: '🤝',
    persona: 'friend',
    situation: 'Friend needs immediate help with a personal emergency',
    urgency: 'high',
    estimatedDuration: 40,
  },
  {
    id: 'mum-worried',
    title: 'Worried Parent',
    description: 'Concerned parent call about family matter',
    icon: '😟',
    persona: 'mum',
    situation: 'Worried about a family situation and needs you home',
    urgency: 'medium',
    estimatedDuration: 50,
  },
  {
    id: 'boss-meeting',
    title: 'Last-Minute Meeting',
    description: 'Important client meeting moved up unexpectedly',
    icon: '📅',
    persona: 'boss',
    situation: 'Important client meeting has been moved up and you need to attend',
    urgency: 'medium',
    estimatedDuration: 35,
  },
  {
    id: 'friend-pickup',
    title: 'Emergency Pickup',
    description: 'Friend stranded and needs immediate pickup',
    icon: '🚗',
    persona: 'friend',
    situation: 'Stranded somewhere and desperately needs a ride',
    urgency: 'high',
    estimatedDuration: 25,
  },
  {
    id: 'doctor-appointment',
    title: 'Medical Appointment',
    description: 'Doctor\'s office calling about rescheduled appointment',
    icon: '🏥',
    persona: 'custom',
    situation: 'Doctor\'s office calling about an urgent rescheduled appointment that you must attend today',
    urgency: 'medium',
    estimatedDuration: 40,
  },
  {
    id: 'pet-emergency',
    title: 'Pet Emergency',
    description: 'Veterinary emergency requiring immediate attention',
    icon: '🐕',
    persona: 'custom',
    situation: 'Veterinarian calling about your pet having an emergency and needing you to come immediately',
    urgency: 'high',
    estimatedDuration: 30,
  },
];

export const getScenarioById = (id: string): PrebuiltScenario | undefined => {
  return prebuiltScenarios.find(scenario => scenario.id === id);
};

export const getScenariosByPersona = (persona: CallScenario['persona']): PrebuiltScenario[] => {
  return prebuiltScenarios.filter(scenario => scenario.persona === persona);
};

export const getScenariosByUrgency = (urgency: CallScenario['urgency']): PrebuiltScenario[] => {
  return prebuiltScenarios.filter(scenario => scenario.urgency === urgency);
};

// Quick access scenarios for emergency situations
export const quickScenarios: PrebuiltScenario[] = [
  prebuiltScenarios.find(s => s.id === 'boss-urgent')!,
  prebuiltScenarios.find(s => s.id === 'friend-help')!,
  prebuiltScenarios.find(s => s.id === 'mum-worried')!,
];

// Casual scenarios for less urgent situations
export const casualScenarios: PrebuiltScenario[] = [
  prebuiltScenarios.find(s => s.id === 'mum-dinner')!,
  prebuiltScenarios.find(s => s.id === 'boss-meeting')!,
  prebuiltScenarios.find(s => s.id === 'friend-pickup')!,
];
