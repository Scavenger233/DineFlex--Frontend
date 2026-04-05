import React, { createContext, useContext, useState } from "react";

interface Customer {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

interface AuthContextType {
  currentUser: Customer | null;
  login: (user: Customer, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    const stored = localStorage.getItem("customer");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (user: Customer, token: string) => {
    localStorage.setItem("customer", JSON.stringify(user));
    localStorage.setItem("dineflexUser", JSON.stringify({ token }));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("customer");
    localStorage.removeItem("dineflexUser");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
