import { createContext, useContext, useState } from 'react';

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(true);
  return (
    <LayoutContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
