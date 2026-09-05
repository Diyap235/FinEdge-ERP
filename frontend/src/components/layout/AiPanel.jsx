import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  Bot,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

/* ── Suggestion prompts ─────────────────────────────────────────── */
const SUGGESTIONS = [
  'Summarize this month\'s financials',
  'Which expenses are highest?',
  'Create a journal entry',
  'Show budget vs actual',
  'Extract invoice details',
];

/* ── Single chat message bubble ────────────────────────────────── */
function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      {/* AI avatar — only on assistant messages */}
      {!isUser && (
        <div
          style={{
            width: 28, height: 28, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 8, marginTop: 2,
            boxShadow: '0 2px 6px rgba(15,106,75,0.3)',
          }}
        >
          <Bot size={14} color="white" />
        </div>
      )}
      <div
        style={{
          maxWidth: '78%',
          padding: '9px 13px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          background: isUser
            ? 'linear-gradient(135deg,#0F6A4B,#1a8a60)'
            : '#f5f2eb',
          color: isUser ? '#fff' : '#222',
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow: isUser
            ? '0 2px 8px rgba(15,106,75,0.25)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* ── Main AI Panel component ────────────────────────────────────── */
export default function AiPanel({ onClose, userName = 'Arjun' }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  /* Auto-scroll to bottom whenever messages change */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* Simulate a dummy response — UI only, no API */
  const handleSend = (text) => {
    const query = (text ?? input).trim();
    if (!query) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'This is a UI-only demo. AI integration will be connected in Phase 2.',
        },
      ]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <motion.div
      key="ai-panel"
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 420,
        height: '100vh',
        background: '#fff',
        borderLeft: '1px solid #e8e3d8',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 45,
        boxShadow: '-4px 0 32px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid #ede9e0',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #0F6A4B 0%, #1a7a55 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'rgba(255,255,255,0.20)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
                  FinEdge AI Copilot
                </span>
                {/* Beta badge */}
                <span
                  style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.6px',
                    background: 'rgba(255,255,255,0.22)',
                    color: '#fff',
                    padding: '2px 6px', borderRadius: 6,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  Beta
                </span>
              </div>
              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.75)', margin: '1px 0 0', lineHeight: 1 }}>
                Your accounting copilot
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', boxShadow: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', padding: 0,
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            aria-label="Close AI panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 16px 0',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d6d1c9 transparent',
        }}
      >

        {/* ── Greeting card (shown when no messages yet) ─────────── */}
        {!hasMessages && (
          <div
            style={{
              background: 'linear-gradient(135deg,#f0f9f5,#e6f5ef)',
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 16,
              border: '1px solid #c5e8d8',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            {/* User avatar */}
            <div
              style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg,#c47a1a,#e8a020)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 6px rgba(196,122,26,0.35)',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#1c1c1e' }}>
                Hi {userName}!
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: '#666', lineHeight: 1.45 }}>
                How can I help you today?
              </p>
            </div>
          </div>
        )}

        {/* ── Suggestion buttons (shown when no messages yet) ────── */}
        {!hasMessages && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 10.5, fontWeight: 700, color: '#aaa',
                textTransform: 'uppercase', letterSpacing: '0.6px',
                margin: '0 0 8px',
              }}
            >
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: '#faf8f4',
                    border: '1px solid #ede9e0',
                    borderRadius: 12,
                    padding: '9px 14px',
                    fontSize: 13, color: '#333',
                    cursor: 'pointer', boxShadow: 'none',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 8,
                    transition: 'background 0.12s, border-color 0.12s',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#e6f5ef';
                    e.currentTarget.style.borderColor = '#a8d8c0';
                    e.currentTarget.style.color = '#0F6A4B';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#faf8f4';
                    e.currentTarget.style.borderColor = '#ede9e0';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  <span>{s}</span>
                  <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Message thread ──────────────────────────────────────── */}
        {hasMessages && (
          <div style={{ paddingBottom: 8 }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} text={msg.text} />
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Bot size={14} color="white" />
                </div>
                <div
                  style={{
                    background: '#f5f2eb', borderRadius: '4px 16px 16px 16px',
                    padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#0F6A4B',
                        display: 'inline-block',
                        animation: `aiBounce 1s ${i * 0.18}s ease-in-out infinite`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty placeholder when messages exist but before first reply */}
        {!hasMessages && (
          <div
            style={{
              textAlign: 'center', padding: '20px 0 8px',
              color: '#ccc', fontSize: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <MessageSquare size={28} style={{ opacity: 0.25 }} />
            <p style={{ margin: 0 }}>Ask anything or pick a suggestion above</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid #ede9e0',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f5f2eb',
            border: '1.5px solid #e5e0d6',
            borderRadius: 14,
            padding: '8px 8px 8px 14px',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = '#0F6A4B';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,106,75,0.10)';
            e.currentTarget.style.background = '#fff';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = '#e5e0d6';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = '#f5f2eb';
          }}
        >
          {/* Sparkles icon inside input */}
          <Sparkles size={14} style={{ color: '#0F6A4B', flexShrink: 0, opacity: 0.7 }} />

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FinEdge AI…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#1c1c1e',
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: input.trim() ? '#0F6A4B' : '#e5e0d6',
              color: input.trim() ? '#fff' : '#aaa',
              border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              padding: 0, boxShadow: input.trim() ? '0 2px 6px rgba(15,106,75,0.3)' : 'none',
            }}
            aria-label="Send message"
          >
            <Send size={13} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#ccc', margin: '8px 0 0' }}>
          UI demo only · AI integration coming in Phase 2
        </p>
      </div>

      {/* Keyframe for typing dots */}
      <style>{`
        @keyframes aiBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
