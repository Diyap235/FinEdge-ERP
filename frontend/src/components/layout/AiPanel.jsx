import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  Bot,
  ChevronRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { aiAPI } from '../../services/api';
import ErpTable from '../common/ErpTable';

/* ── Theme hook — same pattern as Sidebar / Dashboard ──────────── */
function useIsNight() {
  const [isNight, setIsNight] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('finedge-bg') === 'night'
  );
  useEffect(() => {
    const sync = () => {
      const night = localStorage.getItem('finedge-bg') === 'night';
      setIsNight(prev => (prev !== night ? night : prev));
    };
    const id = setInterval(sync, 250);
    window.addEventListener('storage', sync);
    return () => { clearInterval(id); window.removeEventListener('storage', sync); };
  }, []);
  return isNight;
}

/* ── Suggestion prompts ─────────────────────────────────────────── */
const SUGGESTIONS_BY_ROLE = {
  admin: [
    "Show me today's sales",
    'Show me total revenue this month',
    'Show me low stock products',
    'Show me pending invoices',
  ],
  accountant: [
    'Show me pending invoices',
    'Show me vendor bills',
    'Show me payments',
    "Show me today's sales",
  ],
  contact: [
    'Show me my orders',
    'Show me my invoices',
    'Show me products',
    'What is the status of my latest order?',
  ],
  user: [
    'Show me my orders',
    'Show me my invoices',
    'Show me products',
    'What is the status of my latest order?',
  ],
};

/* ── Client-side table fallback parser (unchanged) ──────────────── */
function parseClientTable(lines) {
  if (!Array.isArray(lines) || lines.length < 3) return null;
  const clean = (s) => (s ? String(s).replace(/\*\*/g, '').replace(/\*/g, '').trim() : '');
  const isSep = (l) => {
    const t = l.trim();
    if (!t.includes('-')) return false;
    return t.split('|').map((s) => s.trim()).every((p) => p === '' || /^:?-+:?$/.test(p));
  };
  const splitCells = (l) => {
    let c = l.split('|').map(clean);
    if (c.length > 0 && c[0] === '') c.shift();
    if (c.length > 0 && c[c.length - 1] === '') c.pop();
    return c;
  };
  const sepIdx = lines.findIndex(isSep);
  if (sepIdx > 0) {
    const columns = splitCells(lines[sepIdx - 1]);
    if (columns.length >= 2) {
      const rows = [];
      let i = sepIdx + 1;
      while (i < lines.length) {
        if (!lines[i].includes('|') || isSep(lines[i])) break;
        const r = splitCells(lines[i]);
        if (r.length >= 2) {
          while (r.length < columns.length) r.push('');
          rows.push(r.slice(0, columns.length));
        } else break;
        i++;
      }
      if (rows.length >= 2) {
        const remaining = [...lines.slice(0, sepIdx - 1), ...lines.slice(i)];
        return { table: { columns, rows }, remaining };
      }
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && !isSep(lines[i])) {
      const header = splitCells(lines[i]);
      if (header.length >= 2) {
        const rows = [];
        let j = i + 1;
        while (j < lines.length && lines[j].includes('|') && !isSep(lines[j])) {
          const r = splitCells(lines[j]);
          if (r.length === header.length) { rows.push(r); j++; } else break;
        }
        if (rows.length >= 2) {
          const remaining = [...lines.slice(0, i), ...lines.slice(j)];
          return { table: { columns: header, rows }, remaining };
        }
      }
    }
  }
  return null;
}

/* ── Single chat message bubble ─────────────────────────────────── */
function MessageBubble({ role, text, reply, details, table, isNight }) {
  const isUser = role === 'user';
  const stripAsterisks = (s) =>
    s ? String(s).replace(/\*\*/g, '').replace(/\*/g, '').trim() : '';

  let mainTitle = '';
  let subDetails = [];
  let tableData = null;

  if (isUser) {
    mainTitle = text || reply || '';
  } else {
    let rawTitle = '';
    let rawDetails = [];
    if (reply !== undefined && reply !== null) {
      rawTitle = stripAsterisks(reply);
      rawDetails = Array.isArray(details) ? details : [];
    } else if (typeof text === 'string') {
      const lines = text.split('\n').map(stripAsterisks).filter(Boolean);
      rawTitle = lines[0] || '';
      rawDetails = lines.slice(1);
    }
    const titleLines = rawTitle.split('\n').map(stripAsterisks).filter(Boolean);
    mainTitle = titleLines[0] || '';
    const extraTitleLines = titleLines.slice(1);
    const flatDetails = [
      ...extraTitleLines,
      ...rawDetails.flatMap((d) =>
        typeof d === 'string'
          ? d.split('\n').map(stripAsterisks).filter(Boolean)
          : [stripAsterisks(d)]
      ),
    ].filter(Boolean);

    if (
      table &&
      Array.isArray(table.columns) && table.columns.length >= 2 &&
      Array.isArray(table.rows) && table.rows.length >= 2
    ) {
      tableData = table;
      subDetails = flatDetails;
    } else {
      const parsed = parseClientTable(flatDetails);
      if (parsed) {
        tableData = parsed.table;
        subDetails = parsed.remaining.map(stripAsterisks).filter(Boolean);
      } else {
        subDetails = flatDetails;
      }
    }
  }

  const hasTable = Boolean(tableData && tableData.rows?.length >= 2);

  /* Matte bubble tokens */
  const userBubble = {
    background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(15,106,75,0.28)',
    border: 'none',
  };
  const aiBubble = {
    background: isNight ? 'rgba(36, 44, 48, 0.72)' : 'rgba(246, 240, 231, 0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(220,210,195,0.65)'}`,
    color: isNight ? '#E8E4DC' : '#1D1B18',
    boxShadow: isNight
      ? '0 2px 10px rgba(0,0,0,0.28)'
      : '0 2px 8px rgba(29,27,24,0.07)',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
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
          maxWidth: !isUser && hasTable ? '95%' : '82%',
          width: !isUser && hasTable ? '95%' : 'auto',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          fontSize: 13,
          lineHeight: 1.5,
          overflow: 'hidden',
          ...(isUser ? userBubble : aiBubble),
        }}
      >
        {isUser ? (
          <div style={{ margin: 0, padding: 0, lineHeight: 1.5 }}>{mainTitle}</div>
        ) : (
          <div style={{ margin: 0, padding: 0, lineHeight: 1.5 }}>
            {mainTitle && (
              <div style={{
                fontWeight: 700, fontSize: 13.5,
                color: isNight ? '#F5F2EC' : '#1c1c1e',
                margin: 0, padding: 0, lineHeight: 1.5,
                marginBottom: hasTable ? 6 : 0,
              }}>
                {mainTitle}
              </div>
            )}
            {hasTable && <ErpTable columns={tableData.columns} rows={tableData.rows} />}
            {subDetails.map((detail, idx) => (
              <div key={idx} style={{
                fontWeight: 400, fontSize: 12.5,
                color: isNight ? '#C8C4BC' : '#444',
                margin: 0, padding: 0, lineHeight: 1.5,
                marginTop: idx === 0 && hasTable ? 6 : 0,
              }}>
                {detail}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main AI Panel component ────────────────────────────────────── */
export default function AiPanel({ onClose, userName = 'Arjun', role = 'admin' }) {
  const isNight = useIsNight();
  const SUGGESTIONS = SUGGESTIONS_BY_ROLE[role] || SUGGESTIONS_BY_ROLE.admin;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* ── Send — logic completely unchanged ─────────────────────────── */
  const handleSend = async (text) => {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput('');
    setError(null);
    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setTyping(true);
    try {
      const conversation = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text || [msg.reply, ...(msg.details || [])].filter(Boolean).join('\n'),
      }));
      const response = await aiAPI.chat(query, conversation);
      setTyping(false);
      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            reply: response.data.reply,
            details: Array.isArray(response.data.details) ? response.data.details : [],
            table: response.data.table || null,
          },
        ]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (err) {
      setTyping(false);
      const isPermissionDenied =
        err.response?.status === 403 ||
        err.response?.data?.error?.includes('permission') ||
        err.response?.data?.error?.includes("don't have access");
      if (isPermissionDenied) {
        const replyText = err.response?.data?.error || "I don't have access to show you this information.";
        setMessages(prev => [...prev, { role: 'assistant', reply: replyText, details: [] }]);
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to connect to AI service';
        setError(errorMessage);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', reply: `Sorry, I encountered an error: ${errorMessage}. Please try again.`, details: [] },
        ]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasMessages = messages.length > 0;

  /* ── Design tokens derived from theme ───────────────────────── */
  const panel = {
    background: isNight ? 'rgba(18, 22, 26, 0.72)' : 'rgba(246, 241, 234, 0.72)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(220,210,195,0.60)'}`,
    boxShadow: isNight
      ? '-8px 0 40px rgba(0,0,0,0.55), -2px 0 12px rgba(0,0,0,0.30)'
      : '-8px 0 40px rgba(29,27,24,0.10), -2px 0 12px rgba(29,27,24,0.05)',
  };

  const textPrimary   = isNight ? '#F5F2EC' : '#1D1B18';
  const textSecondary = isNight ? '#B7B2A8' : '#746C62';
  const textMuted     = isNight ? '#6A6560' : '#9E9589';
  const divider       = isNight ? 'rgba(245,242,236,0.09)' : 'rgba(220,210,195,0.55)';
  const scrollThumb   = isNight ? 'rgba(255,255,255,0.12)' : 'rgba(15,106,75,0.18)';

  const greetingCard = {
    background: isNight ? 'rgba(28,36,40,0.65)' : 'rgba(230,245,239,0.70)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${isNight ? 'rgba(52,211,153,0.14)' : 'rgba(15,106,75,0.16)'}`,
    borderRadius: 18,
    padding: '14px 16px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  };

  const quickActionBtn = {
    base: {
      width: '100%', textAlign: 'left',
      background: isNight ? 'rgba(28,36,40,0.55)' : 'rgba(246,240,231,0.55)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(220,210,195,0.60)'}`,
      borderRadius: 14,
      padding: '9px 14px',
      fontSize: 13,
      color: isNight ? '#C8C4BC' : '#3a3530',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 8,
      transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
      fontFamily: 'inherit',
      fontWeight: 500,
      boxShadow: isNight
        ? '0 1px 4px rgba(0,0,0,0.20)'
        : '0 1px 4px rgba(29,27,24,0.05)',
    },
    hover: {
      background: isNight ? 'rgba(31,138,104,0.18)' : 'rgba(15,106,75,0.10)',
      borderColor: isNight ? 'rgba(52,211,153,0.22)' : 'rgba(15,106,75,0.22)',
      color: isNight ? '#34d399' : '#0F6A4B',
      transform: 'translateY(-1px)',
      boxShadow: isNight
        ? '0 4px 12px rgba(0,0,0,0.30)'
        : '0 4px 12px rgba(29,27,24,0.09)',
    },
  };

  const typingBubble = {
    background: isNight ? 'rgba(36,44,48,0.72)' : 'rgba(246,240,231,0.72)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(220,210,195,0.60)'}`,
    borderRadius: '4px 16px 16px 16px',
    padding: '10px 14px',
    display: 'flex', gap: 4, alignItems: 'center',
  };

  const inputBar = {
    display: 'flex', alignItems: 'center', gap: 8,
    background: isNight ? 'rgba(28,36,40,0.68)' : 'rgba(246,240,231,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1.5px solid ${isNight ? 'rgba(245,242,236,0.12)' : 'rgba(220,210,195,0.70)'}`,
    borderRadius: 18,
    padding: '8px 8px 8px 14px',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <motion.div
      key="ai-panel"
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: 400,
        height: 'calc(100vh - 32px)',
        borderRadius: 28,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 45,
        overflow: 'hidden',
        ...panel,
      }}
    >

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: `1px solid ${divider}`,
          flexShrink: 0,
          background: 'linear-gradient(135deg, #0F6A4B 0%, #1a7a55 60%, #168a62 100%)',
          borderRadius: '28px 28px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'rgba(255,255,255,0.18)',
                border: '1.5px solid rgba(255,255,255,0.30)',
                backdropFilter: 'blur(8px)',
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
                <span
                  style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.6px',
                    background: 'rgba(255,255,255,0.20)',
                    color: '#fff',
                    padding: '2px 7px', borderRadius: 6,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.28)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  Beta
                </span>
              </div>
              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.72)', margin: '2px 0 0', lineHeight: 1 }}>
                Your accounting copilot
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              cursor: 'pointer', boxShadow: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', padding: 0, flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.26)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
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
          scrollbarColor: `${scrollThumb} transparent`,
          background: 'transparent',
        }}
      >

        {/* ── Greeting card ─────────────────────────────────────── */}
        {!hasMessages && (
          <div style={greetingCard}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg,#c47a1a,#e8a020)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 8px rgba(196,122,26,0.35)',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: textPrimary }}>
                Hi {userName}!
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: textSecondary, lineHeight: 1.45 }}>
                How can I help you today?
              </p>
            </div>
          </div>
        )}

        {/* ── Quick actions ──────────────────────────────────────── */}
        {!hasMessages && (
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 10.5, fontWeight: 800, color: textMuted,
              textTransform: 'uppercase', letterSpacing: '0.7px',
              margin: '0 0 8px',
            }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={quickActionBtn.base}
                  onMouseEnter={e => {
                    Object.assign(e.currentTarget.style, quickActionBtn.hover);
                  }}
                  onMouseLeave={e => {
                    Object.assign(e.currentTarget.style, {
                      background: quickActionBtn.base.background,
                      borderColor: isNight ? 'rgba(245,242,236,0.10)' : 'rgba(220,210,195,0.60)',
                      color: quickActionBtn.base.color,
                      transform: 'translateY(0)',
                      boxShadow: quickActionBtn.base.boxShadow,
                    });
                  }}
                >
                  <span>{s}</span>
                  <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.45 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Message thread ──────────────────────────────────────── */}
        {hasMessages && (
          <div style={{ paddingBottom: 8 }}>
            {error && (
              <div
                style={{
                  background: isNight ? 'rgba(239,68,68,0.14)' : 'rgba(254,240,238,0.80)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${isNight ? 'rgba(239,68,68,0.28)' : 'rgba(245,198,192,0.80)'}`,
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <AlertCircle size={16} style={{ color: isNight ? '#f87171' : '#c0392b', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: isNight ? '#f87171' : '#c0392b', lineHeight: 1.4 }}>
                  {error}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                text={msg.text}
                reply={msg.reply}
                details={msg.details}
                table={msg.table}
                isNight={isNight}
              />
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
                <div style={typingBubble}>
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: isNight ? '#34d399' : '#0F6A4B',
                        display: 'inline-block',
                        animation: `aiBounce 1s ${i * 0.18}s ease-in-out infinite`,
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasMessages && (
          <div
            style={{
              textAlign: 'center', padding: '20px 0 8px',
              color: textMuted, fontSize: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <MessageSquare size={28} style={{ opacity: 0.22 }} />
            <p style={{ margin: 0 }}>Ask anything or pick a suggestion above</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 16px 16px',
          borderTop: `1px solid ${divider}`,
          flexShrink: 0,
          background: 'transparent',
        }}
      >
        <div
          style={inputBar}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = '#0F6A4B';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,106,75,0.12)';
            e.currentTarget.style.background = isNight
              ? 'rgba(28,36,40,0.90)'
              : 'rgba(255,255,255,0.85)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = isNight
              ? 'rgba(245,242,236,0.12)'
              : 'rgba(220,210,195,0.70)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = isNight
              ? 'rgba(28,36,40,0.68)'
              : 'rgba(246,240,231,0.75)';
          }}
        >
          <Sparkles size={14} style={{ color: '#0F6A4B', flexShrink: 0, opacity: 0.75 }} />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FinEdge AI…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: textPrimary, fontFamily: 'inherit', minWidth: 0,
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: input.trim()
                ? 'linear-gradient(135deg,#0F6A4B,#1a8a60)'
                : isNight ? 'rgba(245,242,236,0.10)' : 'rgba(220,210,195,0.55)',
              color: input.trim() ? '#fff' : isNight ? '#5A5550' : '#aaa',
              border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, box-shadow 0.15s',
              padding: 0,
              boxShadow: input.trim() ? '0 2px 8px rgba(15,106,75,0.32)' : 'none',
            }}
            aria-label="Send message"
          >
            <Send size={13} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: textMuted, margin: '8px 0 0' }}>
          Powered by Groq AI · FinEdge ERP Assistant
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
