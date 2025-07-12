import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface CallScenario {
  persona: 'mum' | 'boss' | 'friend' | 'custom';
  situation: string;
  urgency: 'low' | 'medium' | 'high';
  duration?: number; // in seconds
}

export interface GeneratedScript {
  dialogue: string[];
  audioUrl?: string;
  duration: number;
}

export const generateCallScript = async (scenario: CallScenario): Promise<GeneratedScript> => {
  try {
    // Check if API key is properly configured
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-openai-api-key-here')) {
      // Return demo script for testing
      return generateDemoScript(scenario);
    }

    const prompt = createPrompt(scenario);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates realistic phone call scripts for emergency exit situations. Create natural, believable dialogue with realistic pauses and interruptions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const scriptContent = completion.choices[0]?.message?.content || '';
    const dialogue = parseDialogue(scriptContent);

    return {
      dialogue,
      duration: estimateDuration(dialogue),
    };
  } catch (error) {
    console.error('Error generating call script:', error);
    // Fallback to demo script if API fails
    return generateDemoScript(scenario);
  }
};

const createPrompt = (scenario: CallScenario): string => {
  const personaPrompts = {
    mum: "You are calling as the user's concerned mother. You need to check if they're okay and ask about dinner plans. Speak warmly and naturally.",
    boss: "You are calling as the user's boss with an urgent work matter that requires them to leave immediately. Be professional but insistent.",
    friend: "You are calling as the user's close friend who needs immediate help with an emergency situation. Sound worried but not panicked.",
    custom: scenario.situation
  };

  const urgencyModifiers = {
    low: "Keep the conversation casual and relaxed.",
    medium: "Add some urgency but remain natural.",
    high: "Make it sound urgent and important, requiring immediate attention."
  };

  return `${personaPrompts[scenario.persona]} ${urgencyModifiers[scenario.urgency]}

Create a realistic phone conversation script with:
- Natural dialogue with pauses and interruptions
- The caller should continue naturally even if the user stays silent
- Keep it believable and not overly dramatic
- Duration should be around ${scenario.duration || 30} seconds

IMPORTANT: Only provide the actual spoken dialogue. Do NOT include:
- Background sound descriptions (like "pause", "typing sounds", etc.)
- Stage directions or actions in parentheses
- Sound effects or ambient noise descriptions

Format the response as a series of dialogue lines that the AI caller will speak.`;
};

const parseDialogue = (scriptContent: string): string[] => {
  // Split the script into individual dialogue lines
  return scriptContent
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(line => {
      // Filter out background sound descriptions and stage directions
      const lowerLine = line.toLowerCase();

      // Skip lines that are clearly background sound descriptions
      if (lowerLine.includes('(') && lowerLine.includes(')')) {
        return false; // Skip parenthetical stage directions
      }

      // Skip lines that mention background sounds or actions
      const backgroundKeywords = [
        'pause', 'typing', 'keyboard', 'phone ringing', 'background',
        'sound of', 'noise', 'ambient', 'beeping', 'clicking',
        'rustling', 'footsteps', 'door', 'muffled', 'distant'
      ];

      const isBackgroundDescription = backgroundKeywords.some(keyword =>
        lowerLine.includes(keyword) && !lowerLine.includes('"') && !lowerLine.includes("'")
      );

      if (isBackgroundDescription) {
        return false; // Skip background sound descriptions
      }

      // Keep lines that are actual dialogue
      return line.length > 0;
    });
};

const estimateDuration = (dialogue: string[]): number => {
  // Rough estimate: 3 words per second for natural speech
  const totalWords = dialogue.join(' ').split(' ').length;
  return Math.ceil(totalWords / 3);
};

const generateDemoScript = (scenario: CallScenario): GeneratedScript => {
  const demoScripts = {
    mum: [
      "Hi sweetheart, it's Mum calling. How are you doing?",
      "I was just thinking about you and wanted to check in.",
      "Are you still coming for dinner on Sunday? Dad's making his famous roast.",
      "Oh, and don't forget to call your grandmother, she's been asking about you.",
      "Anyway, I should let you get back to what you were doing. Love you!"
    ],
    boss: [
      "Hi, it's Sarah from the office. Sorry to call you like this.",
      "We've got a situation with the Morrison account that needs immediate attention.",
      "The client just called and they're not happy with the latest proposal.",
      "I really need you to come in and help sort this out. Can you make it within the hour?",
      "I know it's inconvenient, but this could make or break the deal. Thanks."
    ],
    friend: [
      "Hey! Oh my god, I'm so glad you picked up.",
      "I'm having the worst day ever. My car just died on me.",
      "I'm stuck here at the mall and I have no way to get home.",
      "Could you possibly come get me? I'll totally owe you one.",
      "I tried calling an Uber but it's surge pricing and I'm broke until payday."
    ],
    custom: [
      "Hello, this is Jennifer from Dr. Martinez's office.",
      "I'm calling about your appointment scheduled for this afternoon.",
      "Unfortunately, we've had an emergency and need to reschedule.",
      "Could you please call us back at your earliest convenience?",
      "Again, I apologize for the short notice. Thank you."
    ]
  };

  const dialogue = demoScripts[scenario.persona] || demoScripts.custom;

  return {
    dialogue,
    duration: estimateDuration(dialogue),
  };
};
