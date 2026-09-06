/**
 * ProfitChart — vertical bar chart showing monthly net profit for the last 6 months.
 * Profit = Revenue (income credits) − Expenses (expense debits) per month.
 * Positive bars: emerald green. Negative bars: red.
 * Data from /reports/ledger — no dummy values, no new backend endpoints.
 */
import { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { reportsAPI } from '../../services/api';

/* ── helpers ──────────────────────────────────────────────────── */

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

function aggregateMonthly(ledgerLines) {
  const revenue  = {};
  const expenses = {};

  for (const line of ledgerLines) {
    const type = (line.accountType || '').toLowerCase();
    if (type !== 'income' && type !== 'expense') continue;

    const d = new Date(line.date);
    if (isNaN(d.getTime())) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (type === 'income') {
      const net = parseFloat(line.credit || 0) - parseFloat(line.debit || 0);
      revenue[key] = (revenue[key] ?? 0) + net;
    } else {
      const net = parseFloat(line.debit || 0) - parseFloat(line.credit || 0);
      expenses[key] = (expenses[key] ?? 0) + net;
    }
  }
  return { revenue, expenses };
}

/* ── custom tooltip ───────────────────────────────────────────── */
function ProfitTooltip({ active, payload, label, isNight }) {
  if (!active || !payload?.length) return null;
  const profit = payload[0]?.value ?? 0;
  const isPos  = profit >= 0;
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
      <p style={{ margin: '0 0 2px', fontSize: 10.5, color: isNight ? '#807B72' : '#9a9080' }}>
        Net Profit
      </p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: isPos ? '#10b981' : '#ef4444' }}>
        {isPos ? '' : '−'}₹{Math.abs(profit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

/* ── shimmer skeleton ─────────────────────────────────────────── */
function ChartSkeleton({ isNight }) {
  return (
    <div style={{ padding: '24px 0 8px' }}>
      <style>{`@keyframes shimmer2{0%{opacity:.4}50%{opacity:.8}100%{opacity:.4}}.shimmer2{animation:shimmer2 1.4s ease-in-out infinite}`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, paddingBottom: 8 }}>
        {[65, 40, 85, 30, 90, 55].map((h, i) => (
          <div key={i} className="shimmer2" style={{
            flex: 1, height: `${h}%`, borderRadius: 6,
            background: isNight ? 'rgba(245,242,236,0.08)' : 'rgba(16,185,129,0.10)',
            animationDelay: `${i * 0.12}s`,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 6 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="shimmer2" style={{
            flex: 1, height: 10, borderRadius: 4,
            background: isNight ? 'rgba(245,242,236,0.08)' : 'rgba(0,0,0,0.07)',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── custom bar shape — rounded top corners only ──────────────── */
function RoundedBar(props) {
  const { x, y, width, height, fill } = props;
  if (!height || height === 0) return null;
  const r = Math.min(5, Math.abs(height) / 2);
  const isPositive = height >= 0;

  if (isPositive) {
    // rounded top
    return (
      <path
        d={`M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} L${x},${y + height} Z`}
        fill={fill}
      />
    );
  } else {
    // rounded bottom (negative bar grows downward)
    const absH = Math.abs(height);
    return (
      <path
        d={`M${x},${y} L${x + width},${y} L${x + width},${y + absH - r} Q${x + width},${y + absH} ${x + width - r},${y + absH} L${x + r},${y + absH} Q${x},${y + absH} ${x},${y + absH - r} Z`}
        fill={fill}
      />
    );
  }
}

/* ── main component ───────────────────────────────────────────── */
export default function ProfitChart({ isNight }) {
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

  const monthKeys = useMemo(() => buildMonthKeys(6), []);
  const { revenue: revMap, expenses: expMap } = useMemo(
    () => aggregateMonthly(ledger ?? []),
    [ledger]
  );

  const chartData = monthKeys.map(({ key, label, isCurrent }) => {
    const rev = Math.max(0, revMap[key] ?? 0);
    const exp = Math.max(0, expMap[key] ?? 0);
    return { month: label, profit: rev - exp, isCurrent };
  });

  const hasData = chartData.some(d => d.profit !== 0);

  /* ── design tokens ──────────────────────────────────────────── */
  const surface  = isNight ? 'rgba(22,28,31,0.62)'     : 'rgba(246,241,234,0.62)';
  const border   = isNight ? 'rgba(245,242,236,0.10)'  : 'rgba(220,210,195,0.55)';
  const shadow   = isNight ? '0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.22)' : '0 8px 32px rgba(40,30,20,0.10), 0 2px 8px rgba(40,30,20,0.05)';
  const textMain = isNight ? '#F5F2EC' : '#1a1714';
  const textSub  = isNight ? '#B7B2A8' : '#746C62';
  const gridCol  = isNight ? 'rgba(245,242,236,0.06)' : 'rgba(200,190,175,0.30)';
  const axisCol  = isNight ? '#807B72' : '#9a9080';
  const zeroLine = isNight ? 'rgba(245,242,236,0.18)' : 'rgba(0,0,0,0.15)';

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
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: textMain }}>Profit Overview</h3>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: textSub }}>Net profit over the last 6 months</p>
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
          <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>No accounting data available yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 11.5, color: axisCol }}>Profit will appear once transactions are recorded</p>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="32%">
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
                tickFormatter={v => {
                  const abs = Math.abs(v);
                  const fmt = abs >= 1000 ? `₹${(abs / 1000).toFixed(0)}k` : `₹${abs}`;
                  return v < 0 ? `-${fmt}` : fmt;
                }}
                width={58}
              />
              <ReferenceLine y={0} stroke={zeroLine} strokeWidth={1.5} />
              <Tooltip content={<ProfitTooltip isNight={isNight} />} cursor={{ fill: isNight ? 'rgba(245,242,236,0.04)' : 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="profit" shape={<RoundedBar />} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.profit >= 0
                      ? (entry.isCurrent ? '#059669' : '#10b981')
                      : (entry.isCurrent ? '#dc2626' : '#ef4444')}
                    opacity={entry.isCurrent ? 1 : 0.78}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: textSub }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981', display: 'inline-block' }} />
              Profit
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: textSub }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444', display: 'inline-block' }} />
              Loss
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
