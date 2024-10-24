import React, { useState } from "react";

export const ThemeContext = React.createContext();

export const ThemeStore = ({ children }) => {
  const [mode, setMode] = useState("dark");
  const changeTheme = (mode) => setMode(mode);
  return (
    <ThemeContext.Provider value={{ changeTheme, mode }}>
      {children}
    </ThemeContext.Provider>
  );
};
