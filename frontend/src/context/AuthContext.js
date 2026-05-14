import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signIn,
  signUp,
  signOut,
  fetchAuthSession,
  signInWithRedirect,
} from "aws-amplify/auth";
import "../auth/cognito";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const DEV_MODE = process.env.REACT_APP_DEV_MODE === "true";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      if (DEV_MODE) {
        const res = await fetch("http://localhost:8000/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } else {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (idToken) {
          const res = await fetch("http://localhost:8000/auth/me", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            setUser(null);
          }
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    if (DEV_MODE) {
      await fetchUser();
      return;
    }
    await signIn({ username: email, password });
    await fetchUser();
  };

  const register = async (email, password) => {
    if (DEV_MODE) {
      await fetchUser();
      return;
    }
    await signUp({
      username: email,
      password,
      options: { userAttributes: { email } },
    });
    await signIn({ username: email, password });
    await fetchUser();
  };

  const loginWithGitHub = () => {
    if (DEV_MODE) return;
    signInWithRedirect({ provider: "GitHub" });
  };

  const logout = async () => {
    if (!DEV_MODE) {
      await signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGitHub, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
