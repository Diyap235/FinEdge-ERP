# FinEdge-ERP Accounting Rules

## Core Principles

1. **Double-Entry Accounting**: Every transaction must have equal debits and credits
2. **Mandatory Balance Validation**: All journal entries are validated before posting
3. **Transaction Rollback**: If an entry doesn't balance, the entire transaction is rolled back
4. **Single Service for Accounting**: `accountingService.createJournalEntry()` is the only place where accounting entries are created

## Account Types

- **Asset**: Cash, Bank, Debtors (debit normal balance)
- **Liability**: Creditors (credit normal balance)
- **Income**: Sales Income (credit normal balance)
- **Expense**: Purchase Expense (debit normal balance)
- **Capital**: Owner Capital (credit normal balance)

## Accounting Entries

### Purchase Flow

1. **Create Purchase Order** - No accounting entry
2. **Convert to Vendor Bill** - Creates accounting entry:
   - **Debit**: Purchase Expense
   - **Credit**: Creditors
   - Status: UNPAID

3. **Record Payment** - Creates accounting entry:
   - **Debit**: Creditors
   - **Credit**: Cash or Bank
   - Bill status: PAID (when fully paid)

### Sales Flow

1. **Create Sales Order** - No accounting entry
2. **Generate Customer Invoice** - Creates accounting entry:
   - **Debit**: Debtors
   - **Credit**: Sales Income
   - Status: UNPAID

3. **Record Payment** - Creates accounting entry:
   - **Debit**: Cash or Bank
   - **Credit**: Debtors
   - Invoice status: PAID (when fully paid)

## Validation Rules

- **All journal items must have an account ID**
- **Each item must have either debit OR credit (not both)**
- **Debit and credit cannot be negative**
- **Total debits must equal total credits**
- **All accounts must exist in the system**
- **All journals must exist in the system**

## Error Handling

If any validation fails:
1. Transaction is rolled back
2. No journal entry is created
3. No journal items are created
4. Error is returned to the frontend

## Balance Calculations

### Assets & Expenses
- Debit increases
- Credit decreases
- Normal balance: DEBIT

### Liabilities, Income & Capital
- Credit increases
- Debit decreases
- Normal balance: CREDIT

## Ledger Generation

The ledger is generated on-the-fly from journal items. It is NOT pre-calculated or cached.
This ensures accuracy and consistency.

## Reports

### Profit & Loss
- Total Income = All credits in income accounts
- Total Expenses = All debits in expense accounts
- Net Profit = Total Income - Total Expenses

### Balance Sheet
- Assets = Debit balances in asset accounts
- Liabilities = Credit balances in liability accounts
- Capital = Credit balances in capital accounts + Net Profit
- Validation: Assets must equal (Liabilities + Capital + Expenses)
