import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, MapPin, Clock } from "lucide-react";

export default function StationsPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStation, setSelectedStation] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then((data) => setStations(data));
  }, []);

  const handleStationClick = async (id: number) => {
    const res = await fetch(`/api/stations/${id}`);
    const data = await res.json();
    setSelectedStation(data);
  };

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 md:p-12 max-w-7xl mx-auto"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Railway Stations</h1>
        <p className="text-lg text-slate-500">Explore all stations across the Bangladesh Railway network.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search stations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-[600px] flex flex-col">
            <div className="overflow-y-auto p-4 space-y-2">
              {filteredStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleStationClick(station.id)}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center justify-between ${
                    selectedStation?.id === station.id
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={selectedStation?.id === station.id ? "text-emerald-500" : "text-slate-400"} />
                    <span className="font-medium text-lg">{station.name}</span>
                  </div>
                  {station.code && (
                    <span className="text-sm font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {station.code}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedStation ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
            >
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedStation.name} Station</h2>
                  <p className="text-slate-500 flex items-center gap-2">
                    <MapPin size={16} /> 
                    {selectedStation.code && (
                      <>Station Code: <span className="font-mono font-medium text-slate-700">{selectedStation.code}</span></>
                    )}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-6">Trains at this station</h3>
              
              {selectedStation.trains && selectedStation.trains.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                        <th className="pb-4 font-medium">Train Name</th>
                        <th className="pb-4 font-medium">Train No.</th>
                        <th className="pb-4 font-medium">Arrival</th>
                        <th className="pb-4 font-medium">Departure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStation.trains.map((train: any) => (
                        <tr key={train.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-medium text-slate-900">{train.name}</td>
                          <td className="py-4 font-mono text-slate-500">{train.number}</td>
                          <td className="py-4 text-emerald-600 font-medium">{train.arrival_time}</td>
                          <td className="py-4 text-emerald-600 font-medium">{train.departure_time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
                  <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No train schedules available for this station yet.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-100/50 rounded-3xl border border-slate-200 border-dashed">
              <div className="text-center text-slate-400">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a station to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
