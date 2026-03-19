import React, { createContext, useContext, useEffect, useState } from 'react';

export type RegionState = {
  countryCode: string;
  currency: 'EGP' | 'USD';
  isEgypt: boolean;
  isLoading: boolean;
};

const RegionContext = createContext<RegionState | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<RegionState>({
    countryCode: 'US', // Safe fallback default
    currency: 'USD',
    isEgypt: false,
    isLoading: true, 
  });

  useEffect(() => {
    let mounted = true;

    const fetchGeoLocation = async () => {
      try {
        const response = await fetch('/api/geo');
        if (response.ok) {
          const data = await response.json();
          const code = (data.countryCode as string).toUpperCase();
          const isEgypt = code === 'EG';
          
          if (mounted) {
            setRegion({
                countryCode: code,
                currency: isEgypt ? 'EGP' : 'USD',
                isEgypt,
                isLoading: false
            });
          }
          return;
        }
      } catch (error) {
        console.warn('Failed to fetch Vercel edge geolocation header', error);
      }
      
      if (mounted) {
        setRegion(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchGeoLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RegionContext.Provider value={region}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
