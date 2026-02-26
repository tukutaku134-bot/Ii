import { useState } from "react";
import { motion } from "motion/react";
import { Armchair, Info } from "lucide-react";

export default function SeatPlanPage() {
  const [selectedClass, setSelectedClass] = useState("Shuvon");

  const classes = [
    { name: "Shuvon", desc: "Non-AC Chair Coach", layout: "2x3" },
    { name: "Snigdha", desc: "AC Chair Coach", layout: "2x2" },
    { name: "AC Seat", desc: "AC Cabin Seat", layout: "Cabin" },
    { name: "AC Berth", desc: "AC Sleeping Berth", layout: "Cabin" },
  ];

  const renderSeats = () => {
    if (selectedClass === "Shuvon") {
      return (
        <div className="grid grid-cols-6 gap-4 max-w-md mx-auto">
          {Array.from({ length: 10 }).map((_, row) => (
            <div key={row} className="col-span-6 flex justify-between gap-8 mb-2">
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700">A{row + 1}</div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700">B{row + 1}</div>
              </div>
              <div className="w-8 flex items-center justify-center text-slate-300 text-xs font-mono">AISLE</div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700">C{row + 1}</div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700">D{row + 1}</div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700">E{row + 1}</div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (selectedClass === "Snigdha") {
      return (
        <div className="grid grid-cols-5 gap-4 max-w-sm mx-auto">
          {Array.from({ length: 10 }).map((_, row) => (
            <div key={row} className="col-span-5 flex justify-between gap-8 mb-2">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm">A{row + 1}</div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm">B{row + 1}</div>
              </div>
              <div className="w-10 flex items-center justify-center text-slate-300 text-xs font-mono">AISLE</div>
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm">C{row + 1}</div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm">D{row + 1}</div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
          {Array.from({ length: 4 }).map((_, cabin) => (
            <div key={cabin} className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-sm">
              <h4 className="text-center font-bold text-purple-800 mb-4 uppercase tracking-wider text-sm">Cabin {String.fromCharCode(65 + cabin)}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-xl border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700 shadow-sm">L1</div>
                <div className="w-16 h-16 bg-purple-100 rounded-xl border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700 shadow-sm">R1</div>
                <div className="w-16 h-16 bg-purple-100 rounded-xl border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700 shadow-sm">L2</div>
                <div className="w-16 h-16 bg-purple-100 rounded-xl border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700 shadow-sm">R2</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 md:p-12 max-w-7xl mx-auto"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Seat Plan Layouts</h1>
        <p className="text-lg text-slate-500">Visual representation of different train classes and seat arrangements.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {classes.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedClass(c.name)}
              className={`w-full text-left p-6 rounded-2xl transition-all border-2 ${
                selectedClass === c.name
                  ? "bg-white border-emerald-500 shadow-md"
                  : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Armchair size={24} className={selectedClass === c.name ? "text-emerald-500" : "text-slate-400"} />
                <h3 className="text-xl font-bold text-slate-800">{c.name}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-3">{c.desc}</p>
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase tracking-wider">
                Layout: {c.layout}
              </span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200 min-h-[600px] flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-t-[3rem] p-8 shadow-sm border-2 border-slate-200 mb-8 border-b-0 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-300 rounded-b-full" />
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">{selectedClass} COACH</h2>
                <p className="text-slate-500 text-sm flex items-center justify-center gap-2 mt-2">
                  <Info size={14} /> Front of Train
                </p>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                {renderSeats()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
