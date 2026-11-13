'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Scissors, Calendar, Clock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug;

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Randevu Formu State'leri
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (slug) {
      fetchBusinessData();
    }
  }, [slug]);

  // Tarih değiştiğinde o günün dolu saatlerini çek
  useEffect(() => {
    if (business && date) {
      fetchBookedAppointmentsForDate();
    }
  }, [date, business]);

  async function fetchBusinessData() {
    setLoading(true);
    const { data: bizData, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (bizError || !bizData) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    setBusiness(bizData);

    const { data: srvData } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', bizData.id);

    if (srvData) setServices(srvData);
    setLoading(false);
  }

  // Seçilen tarihteki dolu randevuları çek ve saat slotlarını üret
  async function fetchBookedAppointmentsForDate() {
    if (!business || !date) return;

    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('business_id', business.id)
      .eq('appointment_date', date);

    const booked = data ? data.map(item => item.appointment_time) : [];
    setBookedTimes(booked);

    // Otomatik Saat Slotları Üretme (Örn: 09:00 - 18:00 arası 30'ar dakikalık bloklar)
    generateTimeSlots(business.work_start || '09:00', business.work_end || '18:00', business.slot_duration || 30);
  }

  function generateTimeSlots(start: string, end: string, intervalMinutes: number) {
    const slots: string[] = [];
    let [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    while (currentTotalMinutes < endTotalMinutes) {
      const h = Math.floor(currentTotalMinutes / 60).toString().padStart(2, '0');
      const m = (currentTotalMinutes % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      currentTotalMinutes += intervalMinutes;
    }

    setAvailableSlots(slots);
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    if (!business || !selectedService || !customerName || !customerPhone || !date || !selectedTime) {
      setErrorMessage('Lütfen tüm alanları doldurun ve bir saat seçin.');
      return;
    }

    // Çift kontrol (Garanti olsun)
    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', business.id)
      .eq('appointment_date', date)
      .eq('appointment_time', selectedTime);

    if (existingAppts && existingAppts.length > 0) {
      setErrorMessage('Üzgünüz, az önce bu saat başkası tarafından seçildi.');
      fetchBookedAppointmentsForDate(); // Slotları güncelle
      return;
    }

    const { error } = await supabase.from('appointments').insert([
      {
        business_id: business.id,
        service_id: selectedService.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        appointment_date: date,
        appointment_time: selectedTime,
      }
    ]);

    if (!error) {
      setSuccess(true);
      setCustomerName('');
      setCustomerPhone('');
      setSelectedTime('');
      fetchBookedAppointmentsForDate();
    } else {
      setErrorMessage('Randevu oluşturulurken hata oluştu: ' + error.message);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor...</div>;
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <Scissors className="w-12 h-12 text-gray-300 mb-3" />
        <h1 className="text-xl font-bold text-gray-800">İşletme Bulunamadı</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Aradığınız linke ait bir işletme mevcut değil.</p>
        <Link href="/" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight">RandevuPlatformu</h1>
          </Link>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
            Tüm İşletmeler
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="border-b pb-4 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">{business.category}</span>
            <h2 className="text-2xl font-bold mt-2">{business.name}</h2>
            <p className="text-xs text-gray-400 mt-1">Özel Randevu Sayfası (@{business.slug})</p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-emerald-800">Randevun Başarıyla Oluşturuldu!</h3>
              <p className="text-sm text-emerald-600 mt-1">İşletme randevunuzu kaydetti. Belirtilen saatte görüşmek üzere!</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-5 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              >
                Yeni Randevu Al
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateAppointment} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Hizmet Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">1. Hizmet Seçin</label>
                {services.length === 0 ? (
                  <p className="text-sm text-gray-400">Bu işletmenin henüz kayıtlı hizmeti bulunmuyor.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((srv) => (
                      <div 
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                          selectedService?.id === srv.id 
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{srv.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{srv.duration} dakika</p>
                        </div>
                        <span className="font-bold text-indigo-600">{srv.price} TL</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Tarih Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Tarih Seçin</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* 3. Saat Slotları (Bloklar) */}
              {date && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">3. Uygun Saat Seçin</label>
                  {availableSlots.length === 0 ? (
                    <p className="text-xs text-gray-400">Bu gün için uygun saat bulunamadı.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
                      {availableSlots.map((slot) => {
                        const isBooked = bookedTimes.includes(slot);
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                              isBooked 
                                ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed line-through' 
                                : isSelected 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-600'
                            }`}
                          >
                            {slot} {isBooked && '(Dolu)'}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Müşteri Bilgileri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Adınız Soyadınız</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon Numaranız</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="tel"
                      required
                      placeholder="0532 000 00 00"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!selectedService || !selectedTime}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition shadow-sm"
              >
                Randevuyu Onayla
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}