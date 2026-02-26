import { motion } from "motion/react";
import { Train, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 md:p-12 max-w-7xl mx-auto"
    >
      <div className="relative rounded-3xl overflow-hidden bg-emerald-900 text-white shadow-2xl mb-12">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/train/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative z-10 p-12 md:p-24 flex flex-col items-start">
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm font-medium mb-6">
            Welcome to Bangladesh Railway
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
            Journey Through the Heart of Bengal
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mb-10 leading-relaxed">
            Experience safe, comfortable, and reliable train travel across Bangladesh. 
            Find schedules, book tickets, and explore our route network.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/trains"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              Find Trains <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/trains" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Train size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Train Schedules</h3>
          <p className="text-slate-500 leading-relaxed">
            View complete timetables for all Intercity, Mail, and Commuter trains across the country.
          </p>
        </Link>

        <Link to="/stations" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Station Info</h3>
          <p className="text-slate-500 leading-relaxed">
            Find station details, facilities, and real-time arrival/departure information.
          </p>
        </Link>

        <Link to="/fare" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <DollarSign size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Fare Calculator</h3>
          <p className="text-slate-500 leading-relaxed">
            Check ticket prices for different classes between any two stations in our network.
          </p>
        </Link>
      </div>
    </motion.div>
  );
}
