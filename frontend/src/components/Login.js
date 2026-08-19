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
    <div className="flex relative w-full h-screen justify-center items-center overflow-hidden bg-slate-900">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay to make text pop */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      <AnimatePresence mode="wait">
        {stage === 1 ? (
          /* STAGE 1: EXPERIENCE BOX */
          <motion.div
            key="experience"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl w-96 text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              SwiftParkAI
            </h1>
            <p className="text-blue-200 mb-8 italic font-light">
              Premium Mall Concierge
            </p>
            <button
              onClick={() => setStage(2)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              Enter the Experience
            </button>
          </motion.div>
        ) : (
          /* STAGE 2: LOGIN BOX */
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl w-96 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Partner Login</h2>
            <form
              className="flex flex-col text-left"
              onSubmit={handleSubmit}
            >
              <label className="text-blue-100 text-xs font-semibold mb-1 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4 text-white placeholder-blue-200/50 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                placeholder="Enter username..."
              />

              <label className="text-blue-100 text-xs font-semibold mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                placeholder="••••••••"
              />

              {error && (
                <p className="text-red-400 text-xs mb-4">{error}</p>
              )}
              {!error && <div className="mb-4"></div>}

              <button
                type="submit"
                className="w-full py-3 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-xl"
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