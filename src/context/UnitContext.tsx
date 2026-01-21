import React, { createContext, useContext, useEffect, useState } from 'react';
import { UnitSystem, loadUnitSystem, saveUnitSystem } from '../utils/logic';

interface UnitContextType {
    unitSystem: UnitSystem;
    toggleUnitSystem: () => void;
    setUnitSystem: (system: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize with saved preference or default to 'metric'
    const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => loadUnitSystem());

    useEffect(() => {
        saveUnitSystem(unitSystem);
        // Dispatch a custom event for non-React components if needed
        window.dispatchEvent(new CustomEvent('mrx_unit_change', { detail: unitSystem }));
    }, [unitSystem]);

    const toggleUnitSystem = () => {
        setUnitSystemState(prev => prev === 'metric' ? 'imperial' : 'metric');
    };

    const setUnitSystem = (system: UnitSystem) => {
        setUnitSystemState(system);
    };

    return (
        <UnitContext.Provider value={{ unitSystem, toggleUnitSystem, setUnitSystem }}>
            {children}
        </UnitContext.Provider>
    );
};

export const useUnitSystem = (): UnitContextType => {
    const context = useContext(UnitContext);
    if (context === undefined) {
        throw new Error('useUnitSystem must be used within a UnitProvider');
    }
    return context;
};
