// Demo wireframe build: real AuthContext is replaced with a stub. The login
// form looks and behaves like the real one, but submitting any email and
// password "logs in" without contacting Cognito or the backend.

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const DEMO_USER = {
  id: 1,
  email: "demo@reflecta.app",
  cognito_sub: "demo-user",
  is_admin: true,
  created_at: new Date().toISOString(),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (_email, _password) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUser(DEMO_USER);
  };

  const register = async (email, _password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser({ ...DEMO_USER, email });
  };

  const loginWithGitHub = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(DEMO_USER);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading: false, login, register, loginWithGitHub, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
