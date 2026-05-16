import { createContext, useContext, useState } from 'react';

const SplashContext = createContext(null);

export function SplashProvider({ children }) {
  const [visibile, setVisibile] = useState(true);

  function nascondi() {
    setVisibile(false);
  }

  return (
    <SplashContext.Provider value={{ visibile, nascondi }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  return useContext(SplashContext);
}
