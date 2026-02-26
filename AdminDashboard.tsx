import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogOut, Train, MapPin, DollarSign, MessageSquare, Plus, Trash2, X, Edit2 } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stations");
  const [data, setData] = useState<any>({ stations: [], trains: [], train_stops: [], fares: [], opinions: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: string, id: number} | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    if (activeTab === "train_stops" || activeTab === "fares") {
      fetchAuxiliaryData();
    }
  }, [activeTab]);

  const fetchAuxiliaryData = async () => {
    try {
      const [stationsRes, trainsRes] = await Promise.all([
        fetch("/api/stations", { credentials: "include" }),
        fetch("/api/trains", { credentials: "include" })
      ]);
      const stations = await stationsRes.json();
      const trains = await trainsRes.json();
      setData(prev => ({ ...prev, stations, trains }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const endpoints = {
        stations: "/api/stations",
        trains: "/api/trains",
        train_stops: "/api/admin/train_stops",
        fares: "/api/fares",
        opinions: "/api/admin/opinions",
      };
      
      const res = await fetch(endpoints[activeTab as keyof typeof endpoints], {
        credentials: "include"
      });
      if (res.status === 401) {
        navigate("/admin");
        return;
      }
      const json = await res.json();
      setData(prev => ({ ...prev, [activeTab]: json }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    navigate("/admin");
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setSubmitStatus(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/${activeTab}/${editingId}` : `/api/admin/${activeTab}`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      });
      
      if (res.ok) {
        setSubmitStatus({ type: 'success', message: editingId ? 'Updated successfully!' : 'Added successfully!' });
        fetchData();
        if (activeTab === "train_stops" || activeTab === "fares") {
          fetchAuxiliaryData();
        }
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const err = await res.json();
        setSubmitStatus({ type: 'error', message: err.error || (editingId ? 'Failed to update' : 'Failed to add') });
      }
    } catch (err) {
      setSubmitStatus({ type: 'error', message: 'An error occurred' });
    }
  };

  const handleDelete = (type: string, id: number) => {
    setDeleteConfirm({ type, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    setDeleteConfirm(null);
    
    // Optimistic update for instant UI removal
    setData(prev => ({
      ...prev,
      [type]: prev[type]?.filter((item: any) => item.id !== id)
    }));

    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        // Revert on failure
        fetchData();
        const err = await res.json();
        alert(err.error || "Failed to delete");
        return;
      }
      // Re-fetch to ensure consistency
      fetchData();
      if (activeTab === "train_stops" || activeTab === "fares") {
        fetchAuxiliaryData();
      }
    } catch (err) {
      // Revert on failure
      fetchData();
      alert("An error occurred while deleting");
    }
  };

  const tabs = [
    { id: "stations", name: "Stations", icon: <MapPin size={20} /> },
    { id: "trains", name: "Trains", icon: <Train size={20} /> },
    { id: "train_stops", name: "Routes", icon: <MapPin size={20} /> },
    { id: "fares", name: "Fares", icon: <DollarSign size={20} /> },
    { id: "opinions", name: "Opinions", icon: <MessageSquare size={20} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 p-8 md:p-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-500">Manage railway data and view public opinions.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl border border-slate-200 transition-colors shadow-sm font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab} Management</h2>
            {activeTab !== "opinions" && (
              <button type="button" onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors text-sm shadow-sm">
                <Plus size={16} /> Add New
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  {activeTab === "stations" && (
                    <>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "trains" && (
                    <>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Number</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "train_stops" && (
                    <>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Train</th>
                      <th className="p-4 font-medium">Station</th>
                      <th className="p-4 font-medium">Arrival</th>
                      <th className="p-4 font-medium">Departure</th>
                      <th className="p-4 font-medium">Order</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "fares" && (
                    <>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">From</th>
                      <th className="p-4 font-medium">To</th>
                      <th className="p-4 font-medium">Class</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "opinions" && (
                    <>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium w-1/2">Message</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data[activeTab]?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {activeTab === "stations" && (
                      <>
                        <td className="p-4 text-slate-500 font-mono text-sm">{item.id}</td>
                        <td className="p-4 font-medium text-slate-900">{item.name}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete("stations", item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                    {activeTab === "trains" && (
                      <>
                        <td className="p-4 text-slate-500 font-mono text-sm">{item.id}</td>
                        <td className="p-4 font-medium text-slate-900">{item.name}</td>
                        <td className="p-4 font-mono text-slate-500">{item.number}</td>
                        <td className="p-4 text-slate-500">{item.type}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete("trains", item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                    {activeTab === "train_stops" && (
                      <>
                        <td className="p-4 text-slate-500 font-mono text-sm">{item.id}</td>
                        <td className="p-4 font-medium text-slate-900">{item.train_name}</td>
                        <td className="p-4 font-medium text-slate-900">{item.station_name}</td>
                        <td className="p-4 text-slate-500">{item.arrival_time}</td>
                        <td className="p-4 text-slate-500">{item.departure_time}</td>
                        <td className="p-4 text-slate-500">{item.stop_order}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete("train_stops", item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                    {activeTab === "fares" && (
                      <>
                        <td className="p-4 text-slate-500 font-mono text-sm">{item.id}</td>
                        <td className="p-4 font-medium text-slate-900">{item.from_station}</td>
                        <td className="p-4 font-medium text-slate-900">{item.to_station}</td>
                        <td className="p-4 text-slate-500">{item.class}</td>
                        <td className="p-4 font-mono font-bold text-emerald-600">৳{item.amount}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete("fares", item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                    {activeTab === "opinions" && (
                      <>
                        <td className="p-4 text-slate-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-slate-900">{item.name || "Anonymous"}</td>
                        <td className="p-4 text-slate-500">{item.email || "N/A"}</td>
                        <td className="p-4 text-slate-700">{item.message}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete("opinions", item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {(!data[activeTab] || data[activeTab].length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 capitalize">{editingId ? 'Edit' : 'Add New'} {activeTab.replace('_', ' ')}</h3>
              <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {activeTab === "stations" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input required type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </>
              )}
              {activeTab === "trains" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input required type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Number</label>
                    <input required type="text" value={formData.number || ""} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <input required type="text" value={formData.type || ""} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </>
              )}
              {activeTab === "train_stops" && (
                <>
                  <div className="space-y-4 border-b border-slate-100 pb-4">
                    <h4 className="font-semibold text-slate-800">Train Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Train</label>
                      <select required value={formData.train_id || ""} onChange={e => setFormData({...formData, train_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                        <option value="" disabled>Select a train...</option>
                        {data.trains?.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.number})</option>
                        ))}
                        <option value="new">+ Add New Train</option>
                      </select>
                    </div>
                    {formData.train_id === "new" && (
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">New Train Name</label>
                          <input required type="text" value={formData.new_train_name || ""} onChange={e => setFormData({...formData, new_train_name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Train Number</label>
                          <input required type="text" value={formData.new_train_number || ""} onChange={e => setFormData({...formData, new_train_number: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Train Type</label>
                          <input required type="text" value={formData.new_train_type || ""} onChange={e => setFormData({...formData, new_train_type: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-b border-slate-100 pb-4">
                    <h4 className="font-semibold text-slate-800">Station Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Station</label>
                      <select required value={formData.station_id || ""} onChange={e => setFormData({...formData, station_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                        <option value="" disabled>Select a station...</option>
                        {data.stations?.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                        <option value="new">+ Add New Station</option>
                      </select>
                    </div>
                    {formData.station_id === "new" && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Station Name</label>
                        <input required type="text" value={formData.new_station_name || ""} onChange={e => setFormData({...formData, new_station_name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Schedule Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Time</label>
                        <input required type="time" value={formData.arrival_time || ""} onChange={e => setFormData({...formData, arrival_time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Departure Time</label>
                        <input required type="time" value={formData.departure_time || ""} onChange={e => setFormData({...formData, departure_time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Route Order</label>
                      <input required type="number" min="1" value={formData.stop_order || ""} onChange={e => setFormData({...formData, stop_order: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                </>
              )}
              {activeTab === "fares" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">From Station</label>
                    <select required value={formData.from_station_id || ""} onChange={e => setFormData({...formData, from_station_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                      <option value="" disabled>Select a station...</option>
                      {data.stations?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">To Station</label>
                    <select required value={formData.to_station_id || ""} onChange={e => setFormData({...formData, to_station_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                      <option value="" disabled>Select a station...</option>
                      {data.stations?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Train Type</label>
                    <select required value={formData.train_type || ""} onChange={e => setFormData({...formData, train_type: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                      <option value="" disabled>Select train type...</option>
                      <option value="Intercity">Intercity</option>
                      <option value="Mail/Express">Mail/Express</option>
                      <option value="Commuter">Commuter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                    <select required value={formData.class || ""} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                      <option value="" disabled>Select class...</option>
                      <option value="AC_B">AC Berth</option>
                      <option value="AC_S">AC Seat</option>
                      <option value="SNIGDHA">Snigdha</option>
                      <option value="F_BERTH">First Berth</option>
                      <option value="F_SEAT">First Seat</option>
                      <option value="F_CHAIR">First Chair</option>
                      <option value="S_CHAIR">Shovon Chair</option>
                      <option value="SHOVON">Shovon</option>
                      <option value="SHULOV">Shulov</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (৳)</label>
                    <input required type="number" step="any" min="0" value={formData.amount || ""} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </>
              )}

              {submitStatus && (
                <div className={`p-3 rounded-lg text-sm font-medium ${submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {submitStatus.message}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-sm">
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Deletion</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-sm">
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
