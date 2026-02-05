'use client';

interface CropSuggestionAIProps {
  soilType: string;
}

const cropSuggestions: Record<string, string[]> = {
  loamy: ['Wheat', 'Rice', 'Maize', 'Sugarcane'],
  clay: ['Rice', 'Sugarcane', 'Cotton', 'Soybean'],
  sandy: ['Groundnut', 'Millets', 'Potatoes', 'Carrots'],
  alluvial: ['Rice', 'Wheat', 'Sugarcane', 'Cotton'],
  black: ['Cotton', 'Soybean', 'Wheat', 'Chickpeas'],
  red: ['Millets', 'Groundnut', 'Pulses', 'Tobacco'],
  laterite: ['Cashews', 'Rubber', 'Tea', 'Coffee'],
  saline: ['Rice', 'Barley', 'Cotton', 'Sugarcane'],
  acidic: ['Tea', 'Coffee', 'Pineapple', 'Rubber'],
  alkaline: ['Barley', 'Wheat', 'Sugarcane', 'Cotton'],
};

export default function CropSuggestionAI({ soilType }: CropSuggestionAIProps) {
  const suggestions = cropSuggestions[soilType.toLowerCase()] || ['General crops: Rice, Wheat, Maize'];

  return (
    <div className="mt-2 p-3 bg-green-50 rounded-md">
      <h4 className="text-sm font-semibold text-green-800 mb-1">AI Suggested Crops:</h4>
      <p className="text-sm text-green-700">{suggestions.join(', ')}</p>
    </div>
  );
}
