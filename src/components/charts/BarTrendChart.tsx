import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MonthComparisonData {
  month: string;
  income: number;
  expenses: number;
}

export const BarTrendChart: React.FC = () => {
  const { transactions, formatCurrency } = useApp();

  const comparison: MonthComparisonData[] = React.useMemo(() => {
    const now = new Date();
    const result: MonthComparisonData[] = [];

    // Last 2 months (Previous & Current)
    for (let i = 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mName = d.toLocaleDateString('en-IN', { month: 'short' });

      const mTx = transactions.filter((t) => (t.date || '').startsWith(mStr));
      const income = mTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = mTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      result.push({ month: mName, income, expenses });
    }
    return result;
  }, [transactions]);

  const maxVal = Math.max(100, ...comparison.flatMap((c) => [c.income, c.expenses])) * 1.15;

  const prevSurplus = (comparison[0]?.income || 0) - (comparison[0]?.expenses || 0);
  const curSurplus = (comparison[1]?.income || 0) - (comparison[1]?.expenses || 0);
  const surplusGrowth = prevSurplus !== 0
    ? Math.round(((curSurplus - prevSurplus) / Math.abs(prevSurplus)) * 100)
    : (curSurplus > 0 ? 100 : 0);

  const prevIncome = comparison[0]?.income || 0;
  const curIncome = comparison[1]?.income || 0;
  const incomeGrowth = prevIncome > 0
    ? Math.round(((curIncome - prevIncome) / prevIncome) * 100)
    : (curIncome > 0 ? 100 : 0);

  const prevExpenses = comparison[0]?.expenses || 0;
  const curExpenses = comparison[1]?.expenses || 0;
  const expenseGrowth = prevExpenses > 0
    ? Math.round(((curExpenses - prevExpenses) / prevExpenses) * 100)
    : (curExpenses > 0 ? 100 : 0);

  return (
    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Monthly Financial Comparison
          </h4>
          <p className="text-[11px] text-slate-400">
            {comparison[0]?.month} vs {comparison[1]?.month} Trend
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          surplusGrowth >= 0
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
        }`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{surplusGrowth >= 0 ? `+${surplusGrowth}%` : `${surplusGrowth}%`} Surplus</span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="flex items-end justify-around h-36 pt-4 border-b border-slate-800/80 pb-2">
        {comparison.map((c) => {
          const incomeHeight = Math.max(4, Math.round((c.income / maxVal) * 100));
          const expenseHeight = Math.max(4, Math.round((c.expenses / maxVal) * 100));

          return (
            <div key={c.month} className="flex flex-col items-center gap-2">
              <div className="flex items-end gap-2.5 h-28">
                {/* Income Bar */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold mb-1">
                    {formatCurrency(c.income)}
                  </span>
                  <div
                    style={{ height: `${incomeHeight}%` }}
                    className="w-7 rounded-t-lg bg-emerald-500 hover:bg-emerald-400 transition-all duration-500 shadow-md shadow-emerald-500/20"
                  />
                </div>

                {/* Expense Bar */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-rose-400 font-semibold mb-1">
                    {formatCurrency(c.expenses)}
                  </span>
                  <div
                    style={{ height: `${expenseHeight}%` }}
                    className="w-7 rounded-t-lg bg-rose-500 hover:bg-rose-400 transition-all duration-500 shadow-md shadow-rose-500/20"
                  />
                </div>
              </div>

              <span className="text-xs font-medium text-slate-300">{c.month}</span>
            </div>
          );
        })}
      </div>

      {/* Legend & Summary Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-400">Income</span>
          </div>
          <span className={`font-mono font-semibold flex items-center ${
            incomeGrowth >= 0 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {incomeGrowth >= 0 ? `+${incomeGrowth}%` : `${incomeGrowth}%`}{' '}
            {incomeGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-400">Expenses</span>
          </div>
          <span className={`font-mono font-semibold flex items-center ${
            expenseGrowth <= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {expenseGrowth <= 0 ? `-${Math.abs(expenseGrowth)}%` : `+${expenseGrowth}%`}{' '}
            {expenseGrowth <= 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>
    </div>
  );
};
