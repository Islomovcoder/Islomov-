import React, { useState } from 'react';
import { Search, Users, Download, Star, Phone, Mail, Award } from 'lucide-react';
import { Customer, Language } from '../../types';
import { translations } from '../../data/translations';
import { formatCurrency } from '../../services/storage';

interface AdminCustomersProps {
  customers: Customer[];
  currentLang: Language;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers, currentLang }) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID,Ism,Telefon,Email,Buyurtmalar soni,Jami xarid,Segment'];
    const rows = filtered.map(
      (c) =>
        `"${c.id}","${c.name}","${c.phone}","${c.email}",${c.totalOrders},${c.totalSpent},"${c.segment}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `savdohub_mijozlar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            {t.navCustomers}
          </h1>
          <p className="text-xs text-stone-400">
            Mijozlar bazasi va segmentatsiya (VIP, Doimiy, Yangi)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>CSV Eksport</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ism, telefon yoki email bo'yicha qidirish..."
            className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder:text-stone-500 outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/40 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Mijoz</th>
                <th className="py-3 px-4">Aloqa</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4">Buyurtmalar</th>
                <th className="py-3 px-4">Jami xarid</th>
                <th className="py-3 px-4">Ro'yxatdan o'tgan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-200">{c.name}</p>
                        <p className="text-[11px] font-mono text-stone-500">{c.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-stone-300">
                    <p>{c.phone}</p>
                    <p className="text-[11px] text-stone-500">{c.email}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        c.segment === 'VIP'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : c.segment === 'Regular'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {c.segment}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-stone-200">
                    {c.totalOrders || c.ordersCount || 0} ta
                  </td>

                  <td className="py-3 px-4 font-black text-amber-400">
                    {formatCurrency(c.totalSpent)}
                  </td>

                  <td className="py-3 px-4 text-stone-400">
                    {new Date(c.createdAt || c.registeredAt || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
