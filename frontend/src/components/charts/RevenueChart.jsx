/**
 * RevenueChart — smooth area chart showing monthly revenue for the last 6 months.
 * Data is derived from the existing /reports/ledger endpoint (income account credits).
 * No dummy data. No new backend endpoints.
 */
import { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { reportsAPI } from '../../services/api';

/* ── helpers ──────────────────────────────────────────────────── */

/** Build the last N month keys in ascending order: ["Nov 25", "Dec 25", …] */
function buildMonthKeys(n = 6) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      isCurrent: i === 0,
    });
  }
  return keys;
}

/** Aggregate ledger lines into monthly revenue map { "2025-06": 42000, … } */
function aggregateRevenue(ledgerLines) {
  const map = {};
  for (const line of ledgerLines) {
    const type = (line.accountType || '').toLowerCase();
    if (type !== 'income') continue;

    const d = new Date(line.date);
    if (isNaN(d.getTime())) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const net = parseFloat(line.credit || 0) - parseFloat(line.debit || 0);
    map[key] = (map[key] ?? 0) + net;
  }
  return map;
}

/* ── custom tooltip ───────────────────────────────────────────── */
function RevenueTooltip({ active, payload, label, isNight }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div style={{
      background: isNight ? 'rgba(22,28,31,0.92)' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${isNight ? 'rgba(245,242,236,0.15)' : 'rgba(220,210,195,0.70)'}`,
      borderRadius: 12,
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: isNight ? '#B7B2A8' : '#746C62', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#10b981' }}>
        ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

/* ── shimmer skeleton ─────────────────────────────────────────── */
function ChartSkeleton({ isNight }) {
  return (
    <div style={{ padding: '24px 0 8px' }}>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        .shimmer-bar { animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, paddingBottom: 8 }}>
        {[55, 80, 45, 95, 70, 100].map((h, i) => (
          <div key={i} className="shimmer-bar" style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: 6,
            background: isNight ? 'rgba(245,242,236,0.08)' : 'rgba(16,185,129,0.12)',
            animationDelay: `${i * 0.12}s`,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 6 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="shimmer-bar" style={{
            flex: 1, height: 10, borderRadius: 4,
            background: isNight ? 'rgba(245,242,236,0.08)' : 'rgba(0,0,0,0.07)',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────── */
export default function RevenueChart({ isNight }) {
  const [ledger, setLedger]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportsAPI.getLedger()
      .then(res => { if (!cancelled) { setLedger(res.data); setError(null); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const monthKeys  = useMemo(() => buildMonthKeys(6), []);
  const revenueMap = useMemo(() => aggregateRevenue(ledger ?? []), [ledger]);

  const chartData = monthKeys.map(({ key, label, isCurrent }) => ({
    month: label,
    revenue: Math.max(0, revenueMap[key] ?? 0),
    isCurrent,
  }));

  const hasData = chartData.some(d => d.revenue > 0);

  /* ── design tokens ──────────────────────────────────────────── */
  const surface  = isNight ? 'rgba(22,28,31,0.62)'     : 'rgba(246,241,234,0.62)';
  const border   = isNight ? 'rgba(245,242,236,0.10)'  : 'rgba(220,210,195,0.55)';
  const shadow   = isNight ? '0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.22)' : '0 8px 32px rgba(40,30,20,0.10), 0 2px 8px rgba(40,30,20,0.05)';
  const textMain = isNight ? '#F5F2EC'  : '#1a1714';
  const textSub  = isNight ? '#B7B2A8'  : '#746C62';
  const gridCol  = isNight ? 'rgba(245,242,236,0.06)' : 'rgba(200,190,175,0.30)';
  const axisCol  = isNight ? '#807B72'  : '#9a9080';

  return (
    <div style={{
      background:           surface,
      backdropFilter:       'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      borderRadius:         24,
      border:               `1px solid ${border}`,
      boxShadow:            shadow,
      padding:              '24px 24px 20px',
      minHeight:            280,
    }}>
      {/* header */}
      <div style={{ marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: textMain }}>Revenue Overview</h3>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: textSub }}>Total revenue over the last 6 months</p>
      </div>

      {/* body */}
      {loading ? (
        <ChartSkeleton isNight={isNight} />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: isNight ? '#f87171' : '#c0392b', fontSize: 13 }}>
          Failed to load chart data
        </div>
      ) : !hasData ? (
        <div style={{ textAlign: 'center', padding: '48px 0 40px', color: textSub }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>No accounting data available yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 11.5, color: axisCol }}>Revenue will appear once invoices are recorded</p>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={isNight ? 0.35 : 0.22} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridCol} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: axisCol, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: axisCol, fontSize: 10.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                width={52}
              />
              <Tooltip content={<RevenueTooltip isNight={isNight} />} cursor={{ stroke: isNight ? 'rgba(245,242,236,0.10)' : 'rgba(0,0,0,0.06)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.isCurrent) return null;
                  return <circle key="current-dot" cx={cx} cy={cy} r={4} fill="#10b981" stroke={isNight ? '#1c2327' : '#fff'} strokeWidth={2} />;
                }}
                activeDot={{ r: 5, fill: '#10b981', stroke: isNight ? '#1c2327' : '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
