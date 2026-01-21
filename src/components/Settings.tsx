// src/components/Settings.tsx
// UI component allowing the user to select the AI model (Gemini or OpenAI)
// Uses the existing Radix UI Select component for consistent styling.

import * as React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { getSelectedModel, setSelectedModel, AIModel } from '../config/aiModel';

const Settings: React.FC = () => {
    const [model, setModel] = React.useState<AIModel>(getSelectedModel());

    const handleChange = (value: string) => {
        const newModel = value as AIModel;
        setModel(newModel);
        setSelectedModel(newModel);
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                AI Model Selection
            </h2>
            <Select.Root value={model} onValueChange={handleChange}>
                <Select.Trigger className="inline-flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm leading-none focus:outline-none">
                    <Select.Value placeholder="Select model" />
                    <Select.Icon className="ml-2">
                        <ChevronDown className="w-4 h-4" />
                    </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content className="bg-white dark:bg-gray-800 rounded shadow-md">
                        <Select.Viewport className="p-2">
                            <Select.Item value="gemini" className="flex items-center px-2 py-1 rounded cursor-pointer focus:bg-gray-200 dark:focus:bg-gray-600">
                                <Select.ItemText>Gemini (default)</Select.ItemText>
                                <Select.ItemIndicator className="ml-auto">
                                    <Check className="w-4 h-4" />
                                </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="openai" className="flex items-center px-2 py-1 rounded cursor-pointer focus:bg-gray-200 dark:focus:bg-gray-600">
                                <Select.ItemText>OpenAI (Pro/Mini Fallback)</Select.ItemText>
                                <Select.ItemIndicator className="ml-auto">
                                    <Check className="w-4 h-4" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </div>
    );
};

export default Settings;
