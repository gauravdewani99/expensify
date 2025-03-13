
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivacyContextType {
  amountsBlurred: boolean;
  toggleAmountsVisibility: () => void;
  verifyPin: (enteredPin: string) => boolean;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [amountsBlurred, setAmountsBlurred] = useState(true);

  const toggleAmountsVisibility = () => {
    if (!amountsBlurred) {
      setAmountsBlurred(true);
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
    }
    
    return isValid;
  };

  return (
    <PrivacyContext.Provider value={{ amountsBlurred, toggleAmountsVisibility, verifyPin }}>
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
