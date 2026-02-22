import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, token } = useAuth();

  if (token) return <Navigate to="/" replace />;

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      isLogin ? await login(email, password) : await register(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-bg flex items-center justify-center">
      <div className="w-full max-w-sm px-6">

        <div className="mb-8">
          <h1 className="text-2xl font-medium text-ink tracking-tight">Ink</h1>
          <p className="text-sm text-ink-muted mt-1">
            {isLogin ? "Sign in to your account." : "Create a new account."}
          </p>
        </div>

        <div className="border border-border">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors border-r border-border cursor-pointer ${
                isLogin ? "bg-fill text-fill-inverse" : "bg-bg text-ink-muted hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer ${
                !isLogin ? "bg-fill text-fill-inverse" : "bg-bg text-ink-muted hover:text-ink"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-7">
            {error && (
              <p className="text-xs text-danger border border-danger bg-danger-subtle px-3 py-2.5 mb-5 anim-slide">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full border border-border-subtle focus:border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder-ink-faint"
                />
              </div>

              <div className="mb-7">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "Enter your password" : "Minimum 6 characters"}
                  className="w-full border border-border-subtle focus:border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder-ink-faint"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-fill text-fill-inverse py-3 text-xs uppercase tracking-widest font-medium hover:opacity-75 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {loading && <Spinner size="sm" light />}
                {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
