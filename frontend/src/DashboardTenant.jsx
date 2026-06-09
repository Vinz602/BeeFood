import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Bell, ChefHat } from 'lucide-react';

const socket = io(SOCKET_URL);

// Mock Data Awal Menu Tenant (Biar sinkron dengan dashboard mahasiswa)
const initialMenus = [
  { id: 1, name: 'Nasi Goreng Spesial', price: 15000, estimatedTime: 10, tenantId: 1, tenantName: 'Dapur Binusian', img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', isAvailable: true },
  { id: 2, name: 'Ayam Geprek Mozzarella', price: 22000, estimatedTime: 15, tenantId: 1, tenantName: 'Dapur Binusian', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80', isAvailable: true }
];

export default function DashboardTenant({ user, setUser }) {
  const navigate = useNavigate();
  const [tenantOrders, setTenantOrders] = useState([]);
  const [menus, setMenus] = useState(initialMenus);

  // Form states untuk Tambah Menu Baru
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuTime, setNewMenuTime] = useState('');

  useEffect(() => {
    // Jalur real-time order masuk
    socket.on('orderCreated', (newOrder) => {
      setTenantOrders(prev => [newOrder, ...prev]);
    });
    return () => socket.off('orderCreated');
  }, []);

  // FITUR 1: UPDATE TAHAPAN STATUS PESANAN (REAL-TIME)
  const changeStatus = (orderId, nextStatus) => {
    setTenantOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
      const targets = updated.find(o => o.id === orderId);
      socket.emit('updateOrderStatus', targets);
      return updated;
    });
  };

  // FITUR 2: TOGGLE STOK KATALOG (TERSEDIA / HABIS)
  const toggleAvailability = (menuId) => {
    setMenus(prevMenus =>
      prevMenus.map(m => {
        if (m.id === menuId) {
          const updatedMenu = { ...m, isAvailable: !m.isAvailable };
          // Opsional: Kirim sinyal socket ke mahasiswa jika ingin update stok real-time tanpa refresh
          socket.emit('menuStockUpdated', updatedMenu);
          return updatedMenu;
        }
        return m;
      })
    );
  };

  // FITUR 3: TAMBAH KATALOG MENU BARU
  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newMenuName || !newMenuPrice || !newMenuTime) return;

    const newMenu = {
      id: Date.now(),
      name: newMenuName,
      price: parseInt(newMenuPrice),
      estimatedTime: parseInt(newMenuTime),
      tenantId: user.tenantId || 1,
      tenantName: user.tenantName,
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', // Default placeholder food image
      isAvailable: true
    };

    setMenus(prev => [...prev, newMenu]);
    setNewMenuName('');
    setNewMenuPrice('');
    setNewMenuTime('');
    alert('✅ Menu baru berhasil dipublish ke katalog kantin!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white text-left font-sans">
      {/* PREMIUM TENANT NAVBAR */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 border-b border-gray-700 shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-32 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left Side - Tenant Branding */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-75"
                  ></motion.div>
                  <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                    <ChefHat className="text-gray-900 w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter">Tenant Console</h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-cyan-400 font-bold text-xs"
                  >
                    Kelola Kantin Anda dengan Mudah
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Tenant Info & Logout */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-6"
            >
              <div className="hidden sm:block text-right">
                <motion.p
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-black text-white"
                >
                  {user.tenantName}
                </motion.p>
                <div className="flex items-center gap-2 mt-1 bg-cyan-500 bg-opacity-20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-cyan-400 border-opacity-30">
                  <Bell className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-sm font-black text-cyan-300">
                    Live Orders
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setUser(null); navigate('/'); }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow-md transition-all text-sm"
              >
                Keluar
              </motion.button>
            </motion.div>
          </div>

          {/* Quick Stats for Tenant */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-6"
          >
            <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 backdrop-blur px-4 py-3 rounded-xl border border-gray-700 hover:border-cyan-500 transition-colors">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-gray-400">Menu Aktif</p>
                <p className="font-black text-lg text-white">{menus.length} Items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 backdrop-blur px-4 py-3 rounded-xl border border-gray-700 hover:border-cyan-500 transition-colors">
              <Zap className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-gray-400">Pesanan Aktif</p>
                <p className="font-black text-lg text-white">{tenantOrders.length} Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 backdrop-blur px-4 py-3 rounded-xl border border-gray-700 hover:border-cyan-500 transition-colors">
              <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-gray-400">Status</p>
                <p className="font-black text-lg text-green-400">Online</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* BODY UTAMA */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI (2 SPAN): KELOLA KATALOG & STOK */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          
          {/* FORM TAMBAH MENU */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-7 rounded-3xl border border-gray-700 text-left shadow-xl hover:shadow-2xl transition-shadow"
          >
            <h2 className="text-lg font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="text-2xl">➕</span> Tambah Menu Makanan Baru
            </h2>
            <form onSubmit={handleAddMenu} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2">Nama Item</label>
                <input
                  type="text"
                  placeholder="Contoh: Es Teh Lemon"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-sm font-bold text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2">Harga Jual (Rp)</label>
                <input
                  type="number"
                  placeholder="Harga"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-sm font-bold text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2">Waktu Masak (Menit)</label>
                <input
                  type="number"
                  placeholder="Menit"
                  value={newMenuTime}
                  onChange={(e) => setNewMenuTime(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-sm font-bold text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(34, 211, 238, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="md:col-span-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-black p-3 rounded-xl transition-all shadow-lg"
              >
                🚀 Publish Menu ke Etalase
              </motion.button>
            </form>
          </motion.section>

          {/* DAFTAR KATALOG AKTIF + PENGELOLAAN STOK */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-2xl">📦</span> Kelola Etalase & Stok Anda
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {menus.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-br rounded-2xl border-2 overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between ${
                    !m.isAvailable
                      ? 'from-gray-700 to-gray-800 border-red-500/30 opacity-70'
                      : 'from-gray-800 to-gray-900 border-cyan-500/30 hover:border-cyan-500'
                  }`}
                >
                  <div className="flex p-5 gap-4 items-center">
                    <motion.img
                      src={m.img}
                      alt={m.name}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-700 group-hover:scale-110 transition-transform"
                      whileHover={{ scale: 1.05 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-extrabold text-base text-white truncate">{m.name}</h3>
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`px-2.5 py-0.5 rounded text-[8px] font-black ${
                            m.isAvailable ? 'bg-green-500/30 text-green-400 border border-green-500/50' : 'bg-red-500/30 text-red-400 border border-red-500/50'
                          }`}
                        >
                          {m.isAvailable ? '✓ READY' : '✗ HABIS'}
                        </motion.span>
                      </div>
                      <p className="text-sm text-cyan-400 font-black">Rp {m.price.toLocaleString('id-ID')}</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-1">⏱ Masak: {m.estimatedTime} menit</p>
                    </div>
                  </div>

                  {/* ACTION CONTROLLER STOK */}
                  <div className="bg-gray-700 px-5 py-3 border-t border-gray-600 flex items-center justify-between">
                    <span className="text-[11px] text-gray-300 font-bold">Ubah Status:</span>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAvailability(m.id)}
                      className={`text-[11px] font-black px-4 py-2 rounded-lg transition-all ${
                        m.isAvailable
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                      }`}
                    >
                      {m.isAvailable ? '⚠️ Tandai Habis' : '✅ Aktifkan'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>

        {/* KOLOM KANAN (1 SPAN): ANTREAN LIVE ORDER TRACKING STEPS */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.h2
            className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2"
          >
            <span className="text-2xl">📋</span> Antrean Pesanan Live
          </motion.h2>
          {tenantOrders.length === 0 ? (
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-2 border-gray-700 text-center"
            >
              <p className="text-sm text-gray-400 font-bold">😴 Belum ada pesanan...</p>
              <p className="text-xs text-gray-500 mt-2">Tunggu pesanan masuk dari mahasiswa</p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
              layout
            >
              {tenantOrders.map((o, idx) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-500 space-y-4 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="font-black text-white text-sm"
                    >
                      🆔 ORDER #{o.id}
                    </motion.span>
                    <motion.span
                      animate={{ backgroundColor: ["rgb(34, 197, 94)", "rgb(59, 130, 246)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`px-3 py-1 rounded-full font-black text-[9px] tracking-wide text-white ${
                        o.status === 'PREPARING'
                          ? 'bg-yellow-600'
                          : o.status === 'READY'
                          ? 'bg-blue-600'
                          : 'bg-green-600'
                      }`}
                    >
                      {o.status === 'PREPARING' && '⏳ Disiapkan'}
                      {o.status === 'READY' && '✅ Siap Ambil'}
                      {o.status === 'DONE' && '🎉 Selesai'}
                    </motion.span>
                  </div>

                  <div className="bg-gray-700/50 p-3 rounded-xl space-y-1.5 border border-gray-600">
                    <p className="text-xs font-bold text-gray-400 uppercase">📝 Item Pesanan:</p>
                    {o.items.map((it, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="text-sm text-cyan-300 font-bold pl-2 border-l border-cyan-500"
                      >
                        {it.qty}x {it.name}
                      </motion.p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                    <span className="text-xs font-bold text-gray-400">Subtotal:</span>
                    <span className="text-lg font-black text-cyan-400">
                      Rp {o.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* KONTROL STATUS TAHAPAN MASAKAN */}
                  <motion.div
                    className="pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {o.status === 'PREPARING' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => changeStatus(o.id, 'READY')}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-black text-sm p-3 rounded-xl transition-all shadow-lg"
                      >
                        ✅ Nyatakan Siap Diambil
                      </motion.button>
                    )}
                    {o.status === 'READY' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => changeStatus(o.id, 'DONE')}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-sm p-3 rounded-xl transition-all shadow-lg"
                      >
                        🎉 Pesanan Selesai Diambil
                      </motion.button>
                    )}
                    {o.status === 'DONE' && (
                      <motion.div
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-center text-sm text-green-400 font-black bg-green-500/20 p-3 rounded-xl border border-green-500/50"
                      >
                        ✨ Pesanan Selesai Dinikmati ✨
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      </main>
    </div>
  );
}