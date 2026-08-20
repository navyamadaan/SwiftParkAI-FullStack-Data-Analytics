import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Login = ({ onLogin }) => {
  const [stage, setStage] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const validUsername = process.env.REACT_APP_LOGIN_USERNAME;
    const validPassword = process.env.REACT_APP_LOGIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setError("");
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex relative w-full h-screen justify-center items-center overflow-hidden bg-ink font-body">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-40">
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40 z-0"></div>

      <AnimatePresence mode="wait">
        {stage === 1 ? (
          <motion.div
            key="experience"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="z-10 bg-panel/60 backdrop-blur-xl border border-gold/15 p-10 rounded-3xl shadow-2xl w-96 text-center"
          >
            <span className="eyebrow">Mall Operations Platform</span>
            <h1 className="text-5xl font-display font-semibold text-porcelain mt-3 mb-2 tracking-tight">
              SwiftPark<span className="text-gold">AI</span>
            </h1>
            <p className="text-mist mb-8 italic font-display">
              Premium Mall Concierge
            </p>
            <button
              onClick={() => setStage(2)}
              className="w-full py-4 bg-gold hover:bg-gold-light text-ink rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg shadow-gold/20"
            >
              Enter the Experience
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-10 bg-panel/60 backdrop-blur-xl border border-gold/15 p-10 rounded-3xl shadow-2xl w-96 text-center"
          >
            <span className="eyebrow">Access Required</span>
            <h2 className="text-2xl font-display font-semibold text-porcelain mt-2 mb-6">Partner Login</h2>
            <form className="flex flex-col text-left" onSubmit={handleSubmit}>
              <label className="font-mono text-[11px] text-mist mb-1 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                className="bg-white/5 border border-gold/10 rounded-lg p-3 mb-4 text-porcelain placeholder-mist/50 outline-none focus:border-signal/50 focus:bg-white/10 transition-all font-mono text-sm"
                placeholder="Enter username..."
              />

              <label className="font-mono text-[11px] text-mist mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="bg-white/5 border border-gold/10 rounded-lg p-3 mb-2 text-porcelain outline-none focus:border-signal/50 focus:bg-white/10 transition-all font-mono text-sm"
                placeholder="••••••••"
              />

              {error && <p className="text-red-400 text-xs mb-4 font-mono">{error}</p>}
              {!error && <div className="mb-4"></div>}

              <button
                type="submit"
                className="w-full py-3 bg-signal text-ink rounded-xl font-semibold hover:bg-signal-dim transition-colors shadow-xl"
              >
                Sign In
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};