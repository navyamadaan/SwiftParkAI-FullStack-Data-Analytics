import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Bot, User } from "lucide-react";

const PRESET_QUESTIONS = [
  "Which zone is the busiest right now?",
  "Which zone has the highest turnover?",
  "Which zone should I avoid?",
  "Which zone has the most available spots?",
  "Which zone has the longest average dwell time?",
  "How many parking spots do we have in total?",
];

export const AIChat = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const askAI = async (q) => {
    if (!q || q.trim() === "" || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ask-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't get a response. Please try again.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askAI(question);
  };

  return (
    <div className="glass-panel p-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-signal" size={20} />
        <h2 className="text-xl text-signal font-bold">Ask SwiftPark AI</h2>
      </div>

      {/* Preset question chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESET_QUESTIONS.map((q, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => askAI(q)}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Chat history */}
      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto flex flex-col gap-3 mb-6 pr-2 scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <div className="text-slate-500 italic text-sm text-center py-8">
            Ask a question above to get started.
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex gap-2 items-start ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-blue-400" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : msg.isError
                    ? "bg-red-500/10 border border-red-400/20 text-red-300 rounded-bl-sm"
                    : "bg-white/10 border border-white/10 text-slate-100 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <User size={16} className="text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-start justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-blue-400" />
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-300"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Free text input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your own question..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading || question.trim() === ""}
          className="px-5 py-3 bbg-signal hover:bg-signal-dim text-ink text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send size={18} />
        </motion.button>
      </form>
    </div>
  );
};