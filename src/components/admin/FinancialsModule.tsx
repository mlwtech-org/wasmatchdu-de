import React from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, History, Crown, Plus } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const FinancialsModule: React.FC = () => {

  const transactions = [
    { id: "tx_1aB9c", user: "sarah_p", amount: 4.99, type: "Subscription", date: "2 mins ago", status: "success" },
    { id: "tx_2xZ8q", user: "mike_23", amount: 1.00, type: "Tip", date: "15 mins ago", status: "success" },
    { id: "tx_3bM11", user: "dv8_gamer", amount: 9.99, type: "Pro Upgrade", date: "1 hour ago", status: "success" },
    { id: "tx_4yT9o", user: "anon_9x", amount: 4.99, type: "Subscription", date: "3 hours ago", status: "refunded" },
    { id: "tx_5kP0l", user: "jessica_l", amount: 2.50, type: "Tip", date: "5 hours ago", status: "success" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Revenue Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Monthly Recurring Revenue</h3>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            $42,895<span className="text-lg font-bold text-slate-500">.00</span>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +15.2% vs last month
          </p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Active Subscriptions</h3>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            8,492
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +124 this week
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">Churn Rate</h3>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            2.1<span className="text-lg font-bold text-slate-500">%</span>
          </div>
          <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +0.3% vs last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Ledger */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Live Transaction Ledger
            </h3>
            <button className="text-sm text-blue-500 font-medium hover:text-blue-400">View All</button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Transaction ID</th>
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-400 font-mono">{tx.id}</td>
                    <td className="p-4 font-medium text-white">{tx.user}</td>
                    <td className="p-4 text-slate-400">{tx.type}</td>
                    <td className="p-4 font-bold text-white">${tx.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-xs font-bold",
                        tx.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pro Plans Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Subscription Tiers
            </h3>
            <button className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-1 bg-blue-500 text-[10px] font-bold text-white rounded-bl-lg uppercase tracking-wider">Most Popular</div>
              <h4 className="font-bold text-white text-lg">Pro Tier</h4>
              <div className="text-2xl font-black text-white mt-1 mb-3">$4.99<span className="text-sm text-slate-500 font-medium">/mo</span></div>
              <p className="text-xs text-slate-400">Ad-free viewing, custom emotes, 1080p source quality.</p>
              <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white rounded-lg transition-colors">Edit Plan</button>
            </div>

            <div className="p-4 rounded-xl border border-slate-700 bg-slate-950">
              <h4 className="font-bold text-slate-300 text-lg">Premium Tier</h4>
              <div className="text-2xl font-black text-slate-300 mt-1 mb-3">$9.99<span className="text-sm text-slate-600 font-medium">/mo</span></div>
              <p className="text-xs text-slate-500">4K source, priority support, exclusive badges.</p>
              <button className="w-full mt-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-sm font-bold text-slate-300 rounded-lg transition-colors">Edit Plan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
