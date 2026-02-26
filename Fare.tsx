import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { DollarSign, Filter } from "lucide-react";

export default function FarePage() {
  const [fares, setFares] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState("All");

  useEffect(() => {
    fetch("/api/fares")
      .then((res) => res.json())
      .then((data) => setFares(data));
  }, []);

  const classes = ["All", ...Array.from(new Set(fares.map((f) => f.class)))];

  const filteredFares = filterClass === "All" ? fares : fares.filter((f) => f.class === filterClass);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 md:p-12 max-w-7xl mx-auto"
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Fare Calculator</h1>
          <p className="text-lg text-slate-500">Check ticket prices for different classes between stations.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <Filter size={20} className="text-slate-400 ml-2" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-700 font-medium py-2 pr-8 pl-2 cursor-pointer outline-none"
          >
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-6 font-medium">From Station</th>
                <th className="p-6 font-medium">To Station</th>
                <th className="p-6 font-medium">Train Type</th>
                <th className="p-6 font-medium">Class</th>
                <th className="p-6 font-medium text-right">Fare (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFares.length > 0 ? (
                filteredFares.map((fare) => (
                  <tr key={fare.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-medium text-slate-900">{fare.from_station}</td>
                    <td className="p-6 font-medium text-slate-900">{fare.to_station}</td>
                    <td className="p-6 text-slate-500">{fare.train_type}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {fare.class}
                      </span>
                    </td>
                    <td className="p-6 text-right font-mono text-lg font-bold text-emerald-600">
                      ৳{fare.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>No fare information available for the selected criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
