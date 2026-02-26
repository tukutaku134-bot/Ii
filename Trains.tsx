import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Train, Search, Clock, MapPin } from "lucide-react";

export default function TrainsPage() {
  const [trains, setTrains] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTrain, setSelectedTrain] = useState<any>(null);

  useEffect(() => {
    fetch("/api/trains")
      .then((res) => res.json())
      .then((data) => setTrains(data));
  }, []);

  const handleTrainClick = async (id: number) => {
    const res = await fetch(`/api/trains/${id}`);
    const data = await res.json();
    setSelectedTrain(data);
  };

  const filteredTrains = trains.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.number.includes(search)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 md:p-12 max-w-7xl mx-auto"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Train Schedules</h1>
        <p className="text-lg text-slate-500">Find your train and view its complete route and timetable.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search train name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-[600px] flex flex-col">
            <div className="overflow-y-auto p-4 space-y-2">
              {filteredTrains.map((train) => (
                <button
                  key={train.id}
                  onClick={() => handleTrainClick(train.id)}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center justify-between ${
                    selectedTrain?.id === train.id
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Train size={20} className={selectedTrain?.id === train.id ? "text-emerald-500" : "text-slate-400"} />
                    <div>
                      <span className="font-medium text-lg block">{train.name}</span>
                      <span className="text-sm text-slate-500">{train.type}</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    {train.number}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTrain ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
            >
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedTrain.name}</h2>
                  <p className="text-slate-500 flex items-center gap-2">
                    <Train size={16} /> Train Number: <span className="font-mono font-medium text-slate-700">{selectedTrain.number}</span>
                    <span className="mx-2">•</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider">{selectedTrain.type}</span>
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-6">Route Map & Timetable</h3>
              
              {selectedTrain.stops && selectedTrain.stops.length > 0 ? (
                <div className="space-y-12">
                  <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1920/1080')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                    <h4 className="text-white font-bold text-lg mb-8 relative z-10 flex items-center gap-2">
                      <MapPin size={20} className="text-emerald-400" /> Live Route Map
                    </h4>
                    
                    <div className="relative z-10 w-full overflow-x-auto pb-8">
                      <div className="min-w-[600px] flex items-center justify-between relative px-12">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-12 right-12 h-1.5 bg-slate-700 -translate-y-1/2 rounded-full" />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          className="absolute top-1/2 left-12 h-1.5 bg-emerald-500 -translate-y-1/2 rounded-full origin-left"
                        />

                        {/* Stations */}
                        {selectedTrain.stops.map((stop: any, index: number) => (
                          <motion.div 
                            key={stop.station_id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.2 }}
                            className="relative flex flex-col items-center group"
                          >
                            {/* Station Node */}
                            <div className="w-6 h-6 rounded-full bg-slate-900 border-4 border-emerald-500 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                            
                            {/* Tooltip / Info */}
                            <div className={`absolute ${index % 2 === 0 ? "bottom-10" : "top-10"} w-32 text-center`}>
                              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl">
                                <p className="text-white font-bold text-sm mb-1 truncate">{stop.station_name}</p>
                                <div className="flex justify-center gap-2 text-xs font-mono text-emerald-300">
                                  <span>{stop.arrival_time}</span>
                                  <span className="text-slate-500">-</span>
                                  <span>{stop.departure_time}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-8 border-l-2 border-emerald-200 space-y-8 py-4">
                  {selectedTrain.stops.map((stop: any, index: number) => (
                    <div key={stop.station_id} className="relative">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
                      
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MapPin size={20} className="text-emerald-500" />
                            {stop.station_name}
                          </h4>
                          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Stop {stop.stop_order}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <Clock size={20} className="text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Arrival</p>
                              <p className="text-lg font-mono font-medium text-emerald-700">{stop.arrival_time}</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <Clock size={20} className="text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Departure</p>
                              <p className="text-lg font-mono font-medium text-emerald-700">{stop.departure_time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
                  <MapPin size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No route information available for this train yet.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-100/50 rounded-3xl border border-slate-200 border-dashed">
              <div className="text-center text-slate-400">
                <Train size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a train to view route and timetable</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
