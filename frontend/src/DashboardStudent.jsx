import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';
import { motion } from 'framer-motion';
import { Flame, Award, Zap, Clock } from 'lucide-react';

const socket = io(SOCKET_URL);

// Mock Database Terintegrasi dengan Foto & Nama Restoran
const dummyTenants = [
  { id: 1, name: 'Dapur Binusian', location: 'Kantin Lt. 1' },
  { id: 2, name: 'HIMTI Coffee & Bento', location: 'Kantin Lt. 2' }
];

const dummyMenus = [
  { id: 1, name: 'Nasi Goreng Spesial', price: 15000, estimatedTime: 10, tenantId: 1, tenantName: 'Dapur Binusian', img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Ayam Geprek Mozzarella', price: 22000, estimatedTime: 15, tenantId: 1, tenantName: 'Dapur Binusian', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Kopi Susu Gula Aren', price: 12000, estimatedTime: 5, tenantId: 2, tenantName: 'HIMTI Coffee & Bento', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Chicken Katsu Don', price: 25000, estimatedTime: 12, tenantId: 2, tenantName: 'HIMTI Coffee & Bento', img: 'https://images.unsplash.com/photo-1591814468924-cafb1d223297?auto=format&fit=crop&w=400&q=80' }
];

export default function DashboardStudent({ user, setUser }) {
  const navigate = useNavigate();
  const [selectedTenant, setSelectedTenant] = useState(dummyTenants[0]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('BEEPAY');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });
    return () => socket.off('orderUpdated');
  }, []);

  const updateQty = (menuId, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.id === menuId);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.id !== menuId);
      return prev.map(i => i.id === menuId ? { ...i, qty: newQty } : i);
    });
  };

  const addToCart = (menuItem) => {
    setCart(prev => {
      const item = prev.find(i => i.id === menuItem.id);
      if (item) return prev.map(i => i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...menuItem, qty: 1 }];
    });
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'BEEPAY' && user.balance < totalCartPrice) {
      alert('Saldo BeePay tidak cukup!');
      return;
    }

    const newOrder = {
      id: Math.floor(Math.random() * 9000) + 1000,
      status: 'PREPARING', // Tahapan 1: Sedang Disiapkan
      totalPrice: totalCartPrice,
      payment: paymentMethod,
      items: [...cart]
    };

    if (paymentMethod === 'BEEPAY') {
      setUser(prev => ({ ...prev, balance: prev.balance - totalCartPrice }));
    }

    setOrders(prev => [newOrder, ...prev]);
    // Kirim sinyal real-time ke tenant
    socket.emit('newOrderCreated', newOrder);
    setCart([]);
    alert(`Pembayaran sukses menggunakan ${paymentMethod}! Pre-order dikirim.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 text-left font-sans">
      {/* BEAUTIFUL BANNER HEADER */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 shadow-xl">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-32 -left-40 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Side - Logo & Greeting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-200 rounded-2xl blur opacity-75"
                  ></motion.div>
                  <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                    <span className="text-2xl">🍽️</span>
                  </div>
                </div>
                <h1 className="text-4xl font-black tracking-tighter">BeeFood</h1>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-orange-100 font-bold text-sm"
              >
                Platform Pre-Order Makanan Tercepat & Terpercaya
              </motion.p>
            </motion.div>

            {/* Right Side - User Info & Balance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-6"
            >
              <div className="hidden sm:block text-right text-white">
                <motion.p
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-black"
                >
                  {user.name}
                </motion.p>
                <div className="flex items-center gap-2 mt-1 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-black text-yellow-100">
                    Rp {user.balance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setUser(null); navigate('/'); }}
                className="bg-white hover:bg-red-50 text-orange-600 font-bold px-4 py-2 rounded-lg shadow-md transition-all text-sm"
              >
                Keluar
              </motion.button>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-6 text-white"
          >
            <div className="flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur px-4 py-3 rounded-xl border border-white border-opacity-20">
              <Flame className="w-5 h-5 text-yellow-300" />
              <div>
                <p className="text-xs font-bold opacity-80">Popular Today</p>
                <p className="font-black text-lg">Hot Deals 🔥</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur px-4 py-3 rounded-xl border border-white border-opacity-20">
              <Clock className="w-5 h-5 text-yellow-300" />
              <div>
                <p className="text-xs font-bold opacity-80">Fastest</p>
                <p className="font-black text-lg">5-15 Min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur px-4 py-3 rounded-xl border border-white border-opacity-20">
              <Award className="w-5 h-5 text-yellow-300" />
              <div>
                <p className="text-xs font-bold opacity-80">Best App</p>
                <p className="font-black text-lg">#1 Kantin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* STEP 1: PILIH RESTORAN */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <span className="text-2xl">🏪</span> Pilih Kantin Favorit Anda
            </motion.h2>
            <div className="grid grid-cols-2 gap-4">
              {dummyTenants.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedTenant(t)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer transform hover:scale-105 ${
                    selectedTenant.id === t.id
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-base mb-1">{t.name}</h3>
                  <p className="text-sm opacity-80">📍 {t.location}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* STEP 2: DAFTAR MENU BERGAMBAR */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <span className="text-2xl">🍲</span> Menu di {selectedTenant.name}
            </motion.h2>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {dummyMenus.filter(m => m.tenantId === selectedTenant.id).map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between group"
                >
                  <div className="relative overflow-hidden h-48">
                    <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full">⚡ {m.estimatedTime}min</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">{m.tenantName}</span>
                      <h3 className="font-extrabold text-base mt-2 text-gray-900">{m.name}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="font-black text-orange-500 text-lg">Rp {m.price.toLocaleString('id-ID')}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(m)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
                      >
                        + Tambah
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* SIDEBAR: KERANJANG QUANTITY & STEPPER REAL-TIME TRACKING */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* KERANJANG BELANJA */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <motion.h3
              className="font-black text-lg uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-900"
            >
              <span className="text-2xl">🛒</span> Keranjang Anda
            </motion.h3>
            {cart.length === 0 ? (
              <motion.p
                animate={{ opacity: [0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-sm text-gray-400 py-8 text-center font-medium"
              >
                Keranjang kosong. Yuk pesan makanan! 🍽️
              </motion.p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="py-3 flex items-center justify-between text-sm hover:bg-orange-50 px-2 rounded transition-colors"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-orange-600 font-extrabold">Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-orange-200 hover:text-orange-700 rounded transition-colors"
                        >
                          −
                        </motion.button>
                        <span className="w-6 text-center font-bold text-gray-900">{item.qty}</span>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-orange-200 hover:text-orange-700 rounded transition-colors"
                        >
                          +
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* PILIHAN METODE PEMBAYARAN */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-600 uppercase">💳 Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all"
                  >
                    <option value="BEEPAY">💰 BeePay (Saldo Internal)</option>
                    <option value="QRIS">📱 QRIS (Gopay/OVO/Dana)</option>
                    <option value="GOPAY">🚀 GoPay Direct</option>
                  </select>
                </div>

                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex justify-between items-center font-black text-base pt-3 border-t border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl"
                >
                  <span className="text-gray-900">Total Belanja:</span>
                  <span className="text-2xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Rp {totalCartPrice.toLocaleString('id-ID')}
                  </span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold p-4 rounded-xl text-center text-sm shadow-lg transition-all"
                >
                  ✨ Bayar Sekarang
                </motion.button>
              </div>
            )}
          </div>

          {/* STEPPER LIVE TRACKING REAL-TIME */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-lg">
            <motion.h3
              className="font-black text-lg uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-900"
            >
              <span className="text-2xl">📍</span> Status Pesanan
            </motion.h3>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 font-medium">Belum ada pesanan aktif</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o, idx) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-gray-700 text-sm">🆔 ORDER #{o.id}</span>
                      <span className="px-3 py-1 bg-orange-500 text-white rounded-full font-bold text-[10px]">{o.payment}</span>
                    </div>

                    {/* STEPPER VISUAL */}
                    <div className="flex items-center justify-between relative pt-2">
                      <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 -z-0"></div>

                      {/* Step 1 */}
                      <div className="z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${o.status === 'PREPARING' || o.status === 'READY' || o.status === 'DONE' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>✓</div>
                        <span className="text-[9px] font-bold mt-1.5 text-gray-700 text-center">Disiapkan</span>
                      </div>
                      {/* Step 2 */}
                      <div className="z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${o.status === 'READY' || o.status === 'DONE' ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                          {o.status === 'READY' || o.status === 'DONE' ? '✓' : '2'}
                        </div>
                        <span className="text-[9px] font-bold mt-1.5 text-gray-700 text-center">Siap Ambil</span>
                      </div>
                      {/* Step 3 */}
                      <div className="z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${o.status === 'DONE' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                          {o.status === 'DONE' ? '✓' : '3'}
                        </div>
                        <span className="text-[9px] font-bold mt-1.5 text-gray-700 text-center">Selesai</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}