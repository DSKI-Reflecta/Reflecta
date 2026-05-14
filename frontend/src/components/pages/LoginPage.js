import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

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
      setError(err.message);
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
                minLength={6}
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
