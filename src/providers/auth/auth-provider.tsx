import React, { createContext, useState } from "react";

export interface AuthContextValues {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  currentUsername: string;
  setCurrentUsername: React.Dispatch<React.SetStateAction<string>>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextValues | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  const contextValue: AuthContextValues = {
    isAuthenticated,
    setIsAuthenticated,
    currentUsername,
    setCurrentUsername,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
