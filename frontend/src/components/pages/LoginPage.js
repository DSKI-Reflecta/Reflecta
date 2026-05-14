import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGitHub } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 60"
            className="h-14 w-auto mx-auto mb-4"
          >
            <defs>
              <linearGradient
                id="purpleGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9B30FF" />
                <stop offset="100%" stopColor="#6A0DAD" />
              </linearGradient>
            </defs>
            <g>
              <rect
                x="10"
                y="10"
                width="40"
                height="40"
                rx="10"
                ry="10"
                fill="url(#purpleGradient)"
              />
              <line
                x1="30"
                y1="10"
                x2="30"
                y2="50"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <path
                d="M20 25 Q 25 18, 30 25 Q 35 32, 40 25"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M20 35 Q 25 42, 30 35 Q 35 28, 40 35"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />
            </g>
            <text
              x="60"
              y="38"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontWeight="400"
              fontSize="24"
              fill="#171717"
            >
              Reflecta
            </text>
          </svg>
          <p className="text-gray-500 text-sm">Your AI-powered journal</p>
        </div>

        <div className="card p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                isLogin
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                !isLogin
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={loginWithGitHub}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
