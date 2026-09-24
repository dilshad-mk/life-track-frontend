import React, { useState } from 'react';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  Calendar,
  Layers,
  ChevronDown,
  HandCoins,
  Scale,
  DollarSign,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionCard } from '../components/finance/TransactionCard';
import { TransactionFormModal } from '../components/finance/TransactionFormModal';
import { PendingFundFormModal } from '../components/finance/PendingFundFormModal';
import { ReceiveFundModal } from '../components/finance/ReceiveFundModal';
import { DebtFormModal } from '../components/finance/DebtFormModal';
import { RepayDebtModal } from '../components/finance/RepayDebtModal';
import { PendingFundCard } from '../components/finance/PendingFundCard';
import { DebtCard } from '../components/finance/DebtCard';
import { FinancialGoalWidget } from '../components/finance/FinancialGoalWidget';
import { DonutChart } from '../components/charts/DonutChart';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { AdaptiveAmount } from '../components/common/AdaptiveAmount';
import { TransactionType, PendingFund, Debt } from '../types';
import { TODAY_IST } from '../utils/dateUtils';

type FinanceTab = 'transactions' | 'pending' | 'debts' | 'analytics';

export const FinancePage: React.FC = () => {
  const {
    transactions,
    financeCategories,
    deleteTransaction,
    pendingFunds,
    deletePendingFund,
    debts,
    deleteDebt,
    totalSavingsBalance,
    totalPendingFunds,
    totalOutstandingDebt,
    formatCurrency,
  } = useApp();

  const currentMonthDefault = TODAY_IST.substring(0, 7);
  const [activeFinanceTab, setActiveFinanceTab] = useState<FinanceTab>('transactions');

  // Transaction Modal states
  const [isTxFormOpen, setIsTxFormOpen] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState<TransactionType>('expense');
  const [txToDeleteId, setTxToDeleteId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Pending Funds Modal states (Sky Blue)
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [selectedPendingFundForEdit, setSelectedPendingFundForEdit] = useState<PendingFund | null>(null);
  const [selectedPendingFundForReceive, setSelectedPendingFundForReceive] = useState<PendingFund | null>(null);
  const [pendingToDeleteId, setPendingToDeleteId] = useState<string | null>(null);

  // Debts Modal states
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedDebtForEdit, setSelectedDebtForEdit] = useState<Debt | null>(null);
  const [selectedDebtForRepay, setSelectedDebtForRepay] = useState<Debt | null>(null);
  const [debtToDeleteId, setDebtToDeleteId] = useState<string | null>(null);

  // Period analysis
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthDefault);
  const [compareWithLastYear, setCompareWithLastYear] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(true);

  // Dynamically generate month options
  const monthOptions = React.useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + (i === 0 ? ' (Current)' : '');
      opts.push({ value: val, label });
    }
    transactions.forEach((t) => {
      const m = (t.date || '').substring(0, 7);
      if (m && !opts.some((o) => o.value === m)) {
        const [y, mon] = m.split('-').map(Number);
        const d = new Date(y, mon - 1, 1);
        opts.push({
          value: m,
          label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        });
      }
    });
    return opts;
  }, [transactions]);

  // Calculate selected month's metrics
  const currentMonthTx = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const monthIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthSurplus = monthIncome - monthExpenses;
  const isDeficit = monthSurplus < 0;

  // Real YoY comparison
  const [selYear, selMon] = (selectedMonth || currentMonthDefault).split('-').map(Number);
  const lastYearMonthStr = `${selYear - 1}-${String(selMon).padStart(2, '0')}`;
  const lastYearTx = transactions.filter((t) => (t.date || '').startsWith(lastYearMonthStr));
  const lastYearIncome = lastYearTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const lastYearExpenses = lastYearTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const lastYearSurplus = lastYearIncome - lastYearExpenses;
  const yoyIncomeGrowth = lastYearIncome > 0
    ? Math.round(((monthIncome - lastYearIncome) / lastYearIncome) * 100)
    : (monthIncome > 0 ? 100 : 0);
  const yoySurplusGrowth = lastYearSurplus !== 0
    ? Math.round(((monthSurplus - lastYearSurplus) / Math.abs(lastYearSurplus)) * 100)
    : (monthSurplus > 0 ? 100 : 0);

  // Expense categories breakdown for Donut chart
  const expenseTransactions = currentMonthTx.filter((t) => t.type === 'expense');
  const categoryMap: { [catId: string]: { name: string; amount: number; color: string } } = {};

  expenseTransactions.forEach((tx) => {
    const cat = financeCategories.find((c) => c.id === tx.categoryId);
    const catId = tx.categoryId;
    const catName = cat?.name || 'Other';
    const color = cat?.color || '#94a3b8';

    if (!categoryMap[catId]) {
      categoryMap[catId] = { name: catName, amount: 0, color };
    }
    categoryMap[catId].amount += tx.amount;
  });

  const donutData = Object.entries(categoryMap).map(([catId, data]) => ({
    categoryId: catId,
    categoryName: data.name,
    amount: data.amount,
    color: data.color,
  }));

  const handleOpenAddTx = (type: TransactionType) => {
    setFormDefaultType(type);
    setIsTxFormOpen(true);
  };

  const confirmDeleteTx = async () => {
    if (txToDeleteId) {
      await deleteTransaction(txToDeleteId);
      setTxToDeleteId(null);
    }
  };

  const confirmDeletePending = async () => {
    if (pendingToDeleteId) {
      await deletePendingFund(pendingToDeleteId);
      setPendingToDeleteId(null);
    }
  };

  const confirmDeleteDebt = async () => {
    if (debtToDeleteId) {
      await deleteDebt(debtToDeleteId);
      setDebtToDeleteId(null);
    }
  };

  // Filter transaction list
  const displayedTransactions = transactions.filter((t) => {
    if (selectedTypeFilter !== 'all' && t.type !== selectedTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* 1. Main Finance Overview Card (Funds in Hand + Expected Non-Hand + Debts) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-indigo-500/25 shadow-xl space-y-4">
        {/* Available Wealth Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Available Wealth (Funds in Hand)
            </span>
            <div className="mt-0.5">
              <AdaptiveAmount
                value={formatCurrency(totalSavingsBalance)}
                mode="hero"
                className={`font-extrabold font-mono tracking-tight ${
                  totalSavingsBalance >= 0 ? 'text-emerald-400' : 'text-rose-500'
                }`}
              />
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 font-mono border ${
                monthSurplus >= 0
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse'
              }`}
            >
              {monthSurplus >= 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{monthIncome > 0 ? Math.round((monthSurplus / monthIncome) * 100) : 0}% Growth</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Deficit Warning</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* 2 Special Highlight Pills: Expected Inflow (Sky Blue) & Debts Owed (Rose/Amber) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Money Not in Hand (Expected Soon - Sky Blue) */}
          <button
            type="button"
            onClick={() => setActiveFinanceTab('pending')}
            className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-left hover:bg-sky-500/15 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[10px] uppercase">
              <HandCoins className="w-3.5 h-3.5" />
              <span>Not in Hand</span>
            </div>
            <div className="mt-1 font-mono font-extrabold text-sm text-sky-300 truncate">
              {formatCurrency(totalPendingFunds)}
            </div>
            <span className="text-[10px] text-sky-400/80 mt-0.5 block">
              {pendingFunds.filter((p) => p.status !== 'received').length} expected inflows →
            </span>
          </button>

          {/* Debts & Liabilities (Money I Owe) */}
          <button
            type="button"
            onClick={() => setActiveFinanceTab('debts')}
            className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left hover:bg-amber-500/15 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase">
              <Scale className="w-3.5 h-3.5" />
              <span>Debts I Owe</span>
            </div>
            <div className="mt-1 font-mono font-extrabold text-sm text-rose-400 truncate">
              {formatCurrency(totalOutstandingDebt)}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-0.5 block">
              {debts.filter((d) => d.status !== 'settled').length} active debts →
            </span>
          </button>
        </div>

        {/* Overspending Warning Banner when expenses > income */}
        {isDeficit && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-start gap-2.5 text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs min-w-0">
              <strong className="block font-bold text-rose-200">
                Overspending Warning!
              </strong>
              Expenses exceed income by {formatCurrency(Math.abs(monthSurplus))} this month.
            </div>
          </div>
        )}

        {/* 3 Metrics: Income, Expenses, Monthly Surplus */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/40 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans block truncate mb-0.5">Income</span>
            <AdaptiveAmount
              value={formatCurrency(monthIncome)}
              prefix="+"
              mode="compact"
              className="text-emerald-400"
            />
          </div>

          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/40 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans block truncate mb-0.5">Expenses</span>
            <AdaptiveAmount
              value={formatCurrency(monthExpenses)}
              prefix="-"
              mode="compact"
              className="text-rose-400"
            />
          </div>

          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/40 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans block truncate mb-0.5">Surplus</span>
            <AdaptiveAmount
              value={formatCurrency(monthSurplus)}
              prefix={monthSurplus >= 0 ? '+' : ''}
              mode="compact"
              className={monthSurplus >= 0 ? 'text-emerald-400' : 'text-rose-500'}
            />
          </div>
        </div>

        {/* Quick Add Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleOpenAddTx('income')}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Add Income</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddTx('expense')}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs for Finance Modules */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFinanceTab('transactions')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeFinanceTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Transactions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceTab('pending')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeFinanceTab === 'pending'
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
              : 'text-sky-600 dark:text-sky-400 hover:bg-sky-500/10'
          }`}
        >
          <HandCoins className="w-3.5 h-3.5" />
          <span>Not in Hand ({pendingFunds.filter((p) => p.status !== 'received').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceTab('debts')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeFinanceTab === 'debts'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Debts ({debts.filter((d) => d.status !== 'settled').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceTab('analytics')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeFinanceTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: TRANSACTIONS LIST */}
      {activeFinanceTab === 'transactions' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Recent Transactions
            </h3>
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
              {(['all', 'expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                    selectedTypeFilter === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {displayedTransactions.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No transactions logged"
                description="Record your income and expenses to keep tabs on your wealth."
                actionLabel="Add Transaction"
                onAction={() => handleOpenAddTx('expense')}
              />
            ) : (
              displayedTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onDelete={(id) => setTxToDeleteId(id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB B: MONEY NOT IN HAND (SKY BLUE - EXPECTED INFLOW) */}
      {activeFinanceTab === 'pending' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <HandCoins className="w-4 h-4" />
                <span>Money Not in Hand (Expected)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tap 'Receive' when money arrives to transfer directly to Income
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPendingFundForEdit(null);
                setIsPendingModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Inflow</span>
            </button>
          </div>

          {/* Pending Funds List */}
          <div className="space-y-2.5">
            {pendingFunds.length === 0 ? (
              <EmptyState
                icon={HandCoins}
                title="No expected inflows logged"
                description="Have pending client payments, bonus, or money owed to you? Track them here and receive into your wallet with 1 tap."
                actionLabel="Add Expected Fund"
                onAction={() => {
                  setSelectedPendingFundForEdit(null);
                  setIsPendingModalOpen(true);
                }}
              />
            ) : (
              pendingFunds.map((pf) => (
                <PendingFundCard
                  key={pf.id}
                  pendingFund={pf}
                  onEdit={(fund) => {
                    setSelectedPendingFundForEdit(fund);
                    setIsPendingModalOpen(true);
                  }}
                  onReceive={(fund) => {
                    setSelectedPendingFundForReceive(fund);
                  }}
                  onDelete={(id) => setPendingToDeleteId(id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB C: DEBTS & LIABILITIES (MONEY I OWE) */}
      {activeFinanceTab === 'debts' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                <span>Debts & Liabilities (Money I Owe)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Track lender names, deadlines, and record repayments
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDebtForEdit(null);
                setIsDebtModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Debt</span>
            </button>
          </div>

          {/* Debts List */}
          <div className="space-y-2.5">
            {debts.length === 0 ? (
              <EmptyState
                icon={Scale}
                title="No debts recorded"
                description="You have no outstanding debts logged. Stay debt-free or record loans to manage due dates."
                actionLabel="Record Debt"
                onAction={() => {
                  setSelectedDebtForEdit(null);
                  setIsDebtModalOpen(true);
                }}
              />
            ) : (
              debts.map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  onEdit={(debt) => {
                    setSelectedDebtForEdit(debt);
                    setIsDebtModalOpen(true);
                  }}
                  onRepay={(debt) => {
                    setSelectedDebtForRepay(debt);
                  }}
                  onDelete={(id) => setDebtToDeleteId(id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB D: ANALYTICS & GOAL CONNECTION */}
      {activeFinanceTab === 'analytics' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Period & Growth Analysis */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Period & Growth Analysis</span>
              </div>

              <button
                type="button"
                onClick={() => setCompareWithLastYear(!compareWithLastYear)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  compareWithLastYear
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {compareWithLastYear ? 'Comparing 2025 vs 2026' : 'Compare Last Year (2025)'}
              </button>
            </div>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Growth Statistics Grid */}
            {compareWithLastYear && (
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 space-y-2 text-xs animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium shrink-0">Income YoY Growth:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate text-right">
                    +{yoyIncomeGrowth}% ({formatCurrency(lastYearIncome)} → {formatCurrency(monthIncome)})
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium shrink-0">Surplus / Profit Growth:</span>
                  <span
                    className={`font-mono font-bold truncate text-right ${
                      yoySurplusGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}
                  >
                    {yoySurplusGrowth >= 0 ? '+' : ''}{yoySurplusGrowth}% ({formatCurrency(lastYearSurplus)} → {formatCurrency(monthSurplus)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Financial Goal Connection Widget */}
          <FinancialGoalWidget onOpenGoalModal={() => handleOpenAddTx('income')} />

          {/* Donut Category Breakdown */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                <PieChart className="w-4 h-4 text-indigo-500" />
                <span>Category Spending Breakdown</span>
              </div>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                {showCharts ? 'Hide Visual' : 'Show Visual'}
              </button>
            </div>

            {showCharts && (
              <div className="pt-2 animate-in fade-in duration-300">
                <DonutChart data={donutData} total={monthExpenses} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionFormModal
        isOpen={isTxFormOpen}
        onClose={() => setIsTxFormOpen(false)}
        defaultType={formDefaultType}
      />

      <PendingFundFormModal
        isOpen={isPendingModalOpen}
        onClose={() => {
          setIsPendingModalOpen(false);
          setSelectedPendingFundForEdit(null);
        }}
        pendingFund={selectedPendingFundForEdit}
      />

      <ReceiveFundModal
        isOpen={!!selectedPendingFundForReceive}
        onClose={() => setSelectedPendingFundForReceive(null)}
        pendingFund={selectedPendingFundForReceive}
      />

      <DebtFormModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setSelectedDebtForEdit(null);
        }}
        debt={selectedDebtForEdit}
      />

      <RepayDebtModal
        isOpen={!!selectedDebtForRepay}
        onClose={() => setSelectedDebtForRepay(null)}
        debt={selectedDebtForRepay}
      />

      <ConfirmationModal
        isOpen={!!txToDeleteId}
        onClose={() => setTxToDeleteId(null)}
        onConfirm={confirmDeleteTx}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction record?"
        confirmLabel="Delete"
      />

      <ConfirmationModal
        isOpen={!!pendingToDeleteId}
        onClose={() => setPendingToDeleteId(null)}
        onConfirm={confirmDeletePending}
        title="Delete Expected Fund?"
        message="Are you sure you want to remove this expected money record?"
        confirmLabel="Delete"
      />

      <ConfirmationModal
        isOpen={!!debtToDeleteId}
        onClose={() => setDebtToDeleteId(null)}
        onConfirm={confirmDeleteDebt}
        title="Delete Debt Record?"
        message="Are you sure you want to delete this debt record?"
        confirmLabel="Delete"
      />
    </div>
  );
};
