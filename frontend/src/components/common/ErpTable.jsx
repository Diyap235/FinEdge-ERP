import React from 'react';

/**
 * Return status badge styling if cell value matches a known ERP status
 */
function getStatusBadgeStyle(val) {
  if (!val || typeof val !== 'string') return null;
  const upper = val.toUpperCase().trim();

  // Green: positive / completed / active
  if (['PAID', 'CONFIRMED', 'ACTIVE', 'POSTED', 'DONE'].includes(upper)) {
    return {
      background: '#e6f4ea',
      color: '#137333',
      border: '1px solid #ceead6',
    };
  }

  // Amber / Orange: pending / warning
  if (['UNPAID', 'PENDING', 'DRAFT'].includes(upper)) {
    return {
      background: '#fef7e0',
      color: '#b06000',
      border: '1px solid #feefc3',
    };
  }

  // Blue: transactional states
  if (['INVOICED', 'BILLED'].includes(upper)) {
    return {
      background: '#e8f0fe',
      color: '#1a73e8',
      border: '1px solid #d2e3fc',
    };
  }

  // Red: negative
  if (['CANCELLED', 'REJECTED', 'OVERDUE'].includes(upper)) {
    return {
      background: '#fce8e6',
      color: '#c5221f',
      border: '1px solid #fad2cf',
    };
  }

  // Gray: role / classification badges
  if (['ADMIN', 'ACCOUNTANT', 'USER', 'CONTACT', 'CUSTOMER', 'VENDOR'].includes(upper)) {
    return {
      background: '#f1f3f4',
      color: '#3c4043',
      border: '1px solid #dadce0',
    };
  }

  return null;
}

/**
 * Responsive ERP Table Component for AI Chatbot
 * - Horizontal scrolling for small screens / drawers
 * - Visually distinct headers
 * - Alternating row backgrounds
 * - Preserves exact values returned by backend
 * - Strips any stray markdown asterisks
 */
export default function ErpTable({ columns = [], rows = [] }) {
  if (
    !Array.isArray(columns) ||
    columns.length === 0 ||
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return null;
  }

  const cleanStr = (s) =>
    s ? String(s).replace(/\*\*/g, '').replace(/\*/g, '').trim() : '';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        marginTop: 8,
        marginBottom: 6,
        borderRadius: 8,
        border: '1px solid #e2ddd3',
        background: '#ffffff',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: columns.length >= 4 ? 340 : '100%',
          borderCollapse: 'collapse',
          fontSize: '11.5px',
          textAlign: 'left',
          lineHeight: 1.4,
          fontFamily: 'inherit',
        }}
      >
        <thead>
          <tr
            style={{
              background: '#f5f2eb',
              borderBottom: '1px solid #e2ddd3',
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '7px 10px',
                  fontWeight: 700,
                  fontSize: '11px',
                  color: '#444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {cleanStr(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                borderBottom:
                  rowIdx < rows.length - 1 ? '1px solid #eeebe3' : 'none',
                background: rowIdx % 2 === 0 ? '#ffffff' : '#faf9f6',
              }}
            >
              {(Array.isArray(row) ? row : []).map((cell, cellIdx) => {
                const text = cleanStr(cell);
                const badgeStyle = getStatusBadgeStyle(text);

                return (
                  <td
                    key={cellIdx}
                    style={{
                      padding: '7px 10px',
                      color: '#222',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {badgeStyle ? (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: 12,
                          fontSize: '10.5px',
                          fontWeight: 600,
                          ...badgeStyle,
                        }}
                      >
                        {text}
                      </span>
                    ) : (
                      text
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
