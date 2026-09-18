import React, { useState } from 'react';
import { Save, Store, Shield, Truck, Users, Plus, Check } from 'lucide-react';
import { StoreSettings, StaffMember, UserRole, Language } from '../../types';
import { translations } from '../../data/translations';

interface AdminSettingsProps {
  settings: StoreSettings;
  staff: StaffMember[];
  currentLang: Language;
  onSaveSettings: (settings: StoreSettings) => void;
  onSaveStaff: (staff: StaffMember[]) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  staff,
  currentLang,
  onSaveSettings,
  onSaveStaff,
}) => {
  const t = translations[currentLang];

  // Settings form states
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [telegramChannel, setTelegramChannel] = useState(settings.telegramChannel);
  const [address, setAddress] = useState(settings.address);
  const [standardFee, setStandardFee] = useState(settings.standardDeliveryFee);
  const [expressFee, setExpressFee] = useState(settings.expressDeliveryFee);
  const [freeThreshold, setFreeThreshold] = useState(settings.freeDeliveryThreshold);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Staff states
  const [staffList, setStaffList] = useState<StaffMember[]>(staff);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('manager');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      storeName,
      phone,
      email,
      telegramChannel,
      address,
      currency: 'UZS',
      standardDeliveryFee: Number(standardFee),
      expressDeliveryFee: Number(expressFee),
      freeDeliveryThreshold: Number(freeThreshold),
    };

    onSaveSettings(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
    };

    const updated = [newMember, ...staffList];
    setStaffList(updated);
    onSaveStaff(updated);
    setNewStaffName('');
    setNewStaffEmail('');
  };

  const handleToggleStaff = (id: string) => {
    const updated = staffList.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setStaffList(updated);
    onSaveStaff(updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
          {t.navSettings}
        </h1>
        <p className="text-xs text-stone-400">
          Do'kon profili, yetkazib berish shartlari va xodimlar ruxsatlari (RBAC)
        </p>
      </div>

      {/* Main Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-6 text-xs"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-stone-800">
          <Store className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-stone-100 text-sm">Do'kon asosiy rekvizitlari</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-stone-400 block mb-1">Do'kon nomi</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="text-stone-400 block mb-1">Telefon raqam</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="text-stone-400 block mb-1">Aloqa emaili</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-stone-400 block mb-1">Telegram kanal / bot</label>
            <input
              type="text"
              required
              value={telegramChannel}
              onChange={(e) => setTelegramChannel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-stone-400 block mb-1">Do'kon / Omborni jismoniy manzili</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Delivery Rates */}
        <div className="pt-4 border-t border-stone-800 space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-stone-100 text-sm">Yetkazib berish tariflari</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-stone-400 block mb-1">Standart yetkazish (so'm)</label>
              <input
                type="number"
                required
                min="0"
                value={standardFee}
                onChange={(e) => setStandardFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-bold outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Tezkor kuryer (so'm)</label>
              <input
                type="number"
                required
                min="0"
                value={expressFee}
                onChange={(e) => setExpressFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-bold outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">
                Bepul yetkazish chegarasi (so'm)
              </label>
              <input
                type="number"
                required
                min="0"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-bold outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {isSavedNotice && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Sozlamalar muvaffaqiyatli saqlandi!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
        </div>
      </form>

      {/* Staff & RBAC Management */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-stone-100 text-sm">
              Xodimlar va Ruxsatlar tizimi (RBAC)
            </h3>
          </div>
        </div>

        {/* Add staff inline form */}
        <form
          onSubmit={handleAddStaff}
          className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="text-stone-400 block mb-1">Xodim ismi</label>
            <input
              type="text"
              required
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              placeholder="Jasur Qodirov"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-stone-400 block mb-1">Email manzili</label>
            <input
              type="email"
              required
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              placeholder="jasur@savdohub.uz"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-stone-400 block mb-1">Roli (Vazifasi)</label>
            <select
              value={newStaffRole}
              onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 outline-hidden focus:border-amber-500 font-semibold"
            >
              <option value="admin">Administrator (To'liq ruxsat)</option>
              <option value="manager">Menejer (Mahsulot va buyurtmalar)</option>
              <option value="courier">Kuryer (Faqat yetkazish)</option>
            </select>
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Xodim qo'shish</span>
          </button>
        </form>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold">
                <th className="py-2.5 pr-4">Xodim</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Roli</th>
                <th className="py-2.5 px-4">Holat</th>
                <th className="py-2.5 pl-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 pr-4 font-bold text-stone-200">{s.name}</td>
                  <td className="py-3 px-4 text-stone-400">{s.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-400 uppercase font-mono font-bold text-[10px]">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {s.active ? 'Faol' : 'Bloklangan'}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      onClick={() => handleToggleStaff(s.id)}
                      className="text-stone-400 hover:text-white underline text-[11px]"
                    >
                      {s.active ? 'Nofaol qilish' : 'Faollashtirish'}
                    </button>
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
