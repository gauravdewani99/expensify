
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivacyContextType {
  amountsBlurred: boolean;
  toggleAmountsVisibility: () => void;
  verifyPin: (enteredPin: string) => boolean;
  isAuthenticated: boolean;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [amountsBlurred, setAmountsBlurred] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleAmountsVisibility = () => {
    if (!amountsBlurred) {
      setAmountsBlurred(true);
      setIsAuthenticated(false); // Reset authentication when hiding amounts
    } else {
      // When trying to unblur, we'll handle this in the consumer components
      // by showing a PIN dialog
    }
  };

  const verifyPin = (enteredPin: string): boolean => {
    const correctPin = "6930";
    const isValid = enteredPin === correctPin;
    
    if (isValid) {
      setAmountsBlurred(false);
      setIsAuthenticated(true); // Mark as authenticated when PIN is correct
    }
    
    return isValid;
  };

  return (
    <PrivacyContext.Provider value={{ amountsBlurred, toggleAmountsVisibility, verifyPin, isAuthenticated }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
