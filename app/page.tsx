'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Scissors, Calendar, Clock, User, Phone, CheckCircle, Store, PlusCircle, LayoutDashboard, ArrowLeft, Trash2, AlertCircle, LogIn, LogOut, Lock, Tag, Plus, Settings, Copy, Check, Search, Sparkles, MapPin, Users, DollarSign, Heart, FileText, Navigation, Star, MessageSquare, ShieldAlert, Award, Globe } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [businessReviews, setBusinessReviews] = useState<any[]>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNoteInput, setCustomerNoteInput] = useState('');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Yorum Formu State'leri
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhone, setReviewPhone] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showNewBizModal, setShowNewBizModal] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Berber');
  const [bizSlug, setBizSlug] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizInstagram, setBizInstagram] = useState('');
  const [bizMapUrl, setBizMapUrl] = useState(''); // Google Haritalar Embed veya Konum Linki

  const [dashboardBiz, setDashboardBiz] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dashboardReviews, setDashboardReviews] = useState<any[]>([]);
  const [dashboardServices, setDashboardServices] = useState<any[]>([]);
  const [dashboardStaff, setDashboardStaff] = useState<any[]>([]);
  
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('30');

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTitle, setNewStaffTitle] = useState('Usta');

  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // CRM & Müşteri Notu Modalı State'leri
  const [selectedCustomerCRM, setSelectedCustomerCRM] = useState<string | null>(null);
  const [customerHistoryAppointments, setCustomerHistoryAppointments] = useState<any[]>([]);
  const [customerNoteText, setCustomerNoteText] = useState('');

  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryPhone, setQueryPhone] = useState('');
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [myFavorites, setMyFavorites] = useState<string[]>([]);
  const [hasQueried, setHasQueried] = useState(false);

  const todayString = new Date().toISOString().split('T')[0];

  const SUPER_ADMIN_EMAIL = 'yardimcikerem35@gmail.com'; 
  const isSuperAdmin = user && (user.email === SUPER_ADMIN_EMAIL || user.email?.includes('admin'));

  const daysOfWeek = [
    { id: '1', name: 'Pazartesi' },
    { id: '2', name: 'Salı' },
    { id: '3', name: 'Çarşamba' },
    { id: '4', name: 'Perşembe' },
    { id: '5', name: 'Cuma' },
    { id: '6', name: 'Cumartesi' },
    { id: '0', name: 'Pazar' },
  ];

  useEffect(() => {
    checkUser();
    fetchBusinesses();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedBusiness && date && selectedStaff) {
      fetchBookedAppointmentsForDate();
    }
  }, [date, selectedBusiness, selectedStaff]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data.session) {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data.user) {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
      }
    }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setDashboardBiz(null);
  }

  async function fetchBusinesses() {
    const { data } = await supabase.from('businesses').select('*');
    if (data) setBusinesses(data);
  }

  async function selectBusiness(biz: any) {
    setSelectedBusiness(biz);
    setSelectedService(null);
    setSelectedStaff(null);
    setDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setBookedTimes([]);
    setSuccess(false);
    setErrorMessage('');
    setCustomerNoteInput('');
    setReviewComment('');
    setReviewSuccess('');
    setReviewError('');

    const { data: srvData } = await supabase.from('services').select('*').eq('business_id', biz.id);
    if (srvData) setServices(srvData);

    const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', biz.id);
    if (staffData) setStaffList(staffData);

    const { data: revData } = await supabase.from('reviews').select('*').eq('business_id', biz.id).order('created_at', { ascending: false });
    if (revData) setBusinessReviews(revData);
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedDateStr = e.target.value;
    if (!selectedDateStr) return;

    const dayIndex = new Date(selectedDateStr).getDay().toString();
    const bizClosedDays = selectedBusiness?.closed_days || [];

    if (bizClosedDays.includes(dayIndex)) {
      setErrorMessage('Bu işletme seçtiğiniz gün kapalıdır. Lütfen başka bir gün seçin.');
      setDate('');
      return;
    }

    setErrorMessage('');
    setDate(selectedDateStr);
  }

  async function fetchBookedAppointmentsForDate() {
    if (!selectedBusiness || !date || !selectedStaff) return;

    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('business_id', selectedBusiness.id)
      .eq('appointment_date', date)
      .eq('staff_id', selectedStaff.id);

    const booked = data ? data.map(item => item.appointment_time) : [];
    setBookedTimes(booked);

    generateTimeSlots(selectedBusiness.work_start || '09:00', selectedBusiness.work_end || '18:00', selectedBusiness.slot_duration || 30);
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

  async function openDashboard(biz: any) {
    if (!user || (biz.owner_id !== user.id && !isSuperAdmin)) {
      alert('Bu işletmenin yönetim paneline erişim yetkiniz yok.');
      return;
    }

    setDashboardBiz(biz);
    setWorkStart(biz.work_start || '09:00');
    setWorkEnd(biz.work_end || '18:00');
    setSlotDuration(biz.slot_duration || 30);
    setClosedDays(biz.closed_days || []);
    setBizAddress(biz.address || '');
    setBizInstagram(biz.instagram || '');
    setBizMapUrl(biz.map_url || '');
    setSettingsSuccess('');
    setCopiedLink(false);
    
    const { data: appData } = await supabase
      .from('appointments')
      .select('*, services(name, price), staff(name)')
      .eq('business_id', biz.id)
      .order('appointment_date', { ascending: true });
    if (appData) setAppointments(appData);

    const { data: srvData } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', biz.id)
      .order('created_at', { ascending: true });
    if (srvData) setDashboardServices(srvData);

    const { data: stData } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', biz.id)
      .order('created_at', { ascending: true });
    if (stData) setDashboardStaff(stData);

    const { data: revData } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', biz.id)
      .order('created_at', { ascending: false });
    if (revData) setDashboardReviews(revData);
  }

  async function openCustomerCRM(phone: string) {
    setSelectedCustomerCRM(phone);
    
    const { data } = await supabase
      .from('appointments')
      .select('*, services(name, price), staff(name)')
      .eq('business_id', dashboardBiz.id)
      .eq('customer_phone', phone)
      .order('appointment_date', { ascending: false });

    if (data) {
      setCustomerHistoryAppointments(data);
      const foundNote = data.find(a => a.customer_note)?.customer_note || '';
      setCustomerNoteText(foundNote);
    }
  }

  async function handleDeleteBusinessCompletely(bizId: string) {
    if (!confirm('⚠️ DİKKAT! Bu işletmeyi sistemden tamamen silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from('businesses').delete().eq('id', bizId);
    if (!error) {
      setDashboardBiz(null);
      fetchBusinesses();
      alert('İşletme sistemden başarıyla kaldırıldı.');
    } else {
      alert('İşletme silinirken hata oluştu: ' + error.message);
    }
  }

  function copyBusinessLink(slug: string) {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  async function handleUpdateSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!dashboardBiz) return;

    const { error } = await supabase
      .from('businesses')
      .update({
        work_start: workStart,
        work_end: workEnd,
        slot_duration: Number(slotDuration),
        closed_days: closedDays,
        address: bizAddress,
        instagram: bizInstagram,
        map_url: bizMapUrl
      })
      .eq('id', dashboardBiz.id);

    if (!error) {
      setDashboardBiz({
        ...dashboardBiz,
        work_start: workStart,
        work_end: workEnd,
        slot_duration: Number(slotDuration),
        closed_days: closedDays,
        address: bizAddress,
        instagram: bizInstagram,
        map_url: bizMapUrl
      });
      setSettingsSuccess('İşletme ayarları ve harita konumu başarıyla güncellendi!');
      setTimeout(() => setSettingsSuccess(''), 4000);
      fetchBusinesses();
    } else {
      alert('Güncellenirken hata oluştu: ' + error.message);
    }
  }

  function toggleClosedDay(dayId: string) {
    if (closedDays.includes(dayId)) {
      setClosedDays(closedDays.filter(d => d !== dayId));
    } else {
      setClosedDays([...closedDays, dayId]);
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!dashboardBiz || !newSrvName || !newSrvPrice) return;

    const { data, error } = await supabase.from('services').insert([
      {
        business_id: dashboardBiz.id,
        name: newSrvName,
        price: Number(newSrvPrice),
        duration: Number(newSrvDuration)
      }
    ]).select();

    if (!error && data) {
      setDashboardServices([...dashboardServices, data[0]]);
      setNewSrvName('');
      setNewSrvPrice('');
      setNewSrvDuration('30');
    }
  }

  async function handleDeleteService(srvId: string) {
    if (!confirm('Bu hizmeti silmek istediğine emin misin?')) return;
    const { error } = await supabase.from('services').delete().eq('id', srvId);
    if (!error) {
      setDashboardServices(dashboardServices.filter(s => s.id !== srvId));
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!dashboardBiz || !newStaffName) return;

    const { data, error } = await supabase.from('staff').insert([
      {
        business_id: dashboardBiz.id,
        name: newStaffName,
        title: newStaffTitle
      }
    ]).select();

    if (!error && data) {
      setDashboardStaff([...dashboardStaff, data[0]]);
      setNewStaffName('');
      setNewStaffTitle('Usta');
    }
  }

  async function handleDeleteStaff(staffId: string) {
    if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('staff').delete().eq('id', staffId);
    if (!error) {
      setDashboardStaff(dashboardStaff.filter(s => s.id !== staffId));
    }
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedBusiness || !selectedService || !selectedStaff || !customerName || !customerPhone || !date || !selectedTime) {
      setErrorMessage('Lütfen tüm alanları doldurun ve bir personel/saat seçin.');
      return;
    }

    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', selectedBusiness.id)
      .eq('staff_id', selectedStaff.id)
      .eq('appointment_date', date)
      .eq('appointment_time', selectedTime);

    if (existingAppts && existingAppts.length > 0) {
      setErrorMessage('Üzgünüz, seçtiğiniz personelin bu saati az önce doldu. Lütfen başka bir saat seçin.');
      fetchBookedAppointmentsForDate();
      return;
    }

    const { error } = await supabase.from('appointments').insert([
      {
        business_id: selectedBusiness.id,
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_note: customerNoteInput,
        appointment_date: date,
        appointment_time: selectedTime
      }
    ]);

    if (!error) {
      setSuccess(true);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerNoteInput('');
      setSelectedTime('');
      fetchBookedAppointmentsForDate();
    } else {
      setErrorMessage('Randevu oluşturulurken hata: ' + error.message);
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBusiness || !reviewComment || !reviewPhone) return;

    setReviewError('');
    setReviewSuccess('');

    const { data: customerAppts, error: apptError } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_time')
      .eq('business_id', selectedBusiness.id)
      .eq('customer_phone', reviewPhone);

    if (apptError || !customerAppts || customerAppts.length === 0) {
      setReviewError('⚠️ Bu işletmede kayıtlı randevunuz bulunamadı! Sadece randevu alan müşteriler yorum yapabilir.');
      return;
    }

    const now = new Date();
    const hasValidPastOrCurrentAppointment = customerAppts.some(app => {
      const apptDateTime = new Date(`${app.appointment_date}T${app.appointment_time || '00:00'}`);
      return apptDateTime <= now;
    });

    if (!hasValidPastOrCurrentAppointment) {
      setReviewError('⚠️ Randevu saatiniz henüz gelmediği için henüz yorum yapamazsınız.');
      return;
    }

    const { data, error } = await supabase.from('reviews').insert([
      {
        business_id: selectedBusiness.id,
        customer_name: 'Doğrulanmış Müşteri',
        customer_phone: reviewPhone,
        rating: Number(reviewRating),
        comment: reviewComment
      }
    ]).select();

    if (!error && data) {
      setBusinessReviews([data[0], ...businessReviews]);
      setReviewComment('');
      setReviewPhone('');
      setReviewSuccess('Yorumunuz başarıyla eklendi! Teşekkür ederiz.');
      setTimeout(() => setReviewSuccess(''), 4000);
    } else {
      setReviewError('Yorum eklenirken hata oluştu: ' + error?.message);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setBusinessReviews(businessReviews.filter(r => r.id !== reviewId));
      setDashboardReviews(dashboardReviews.filter(r => r.id !== reviewId));
    }
  }

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setShowNewBizModal(false);
      setShowAuthModal(true);
      return;
    }
    if (!bizName || !bizSlug) return;

    const { data, error } = await supabase.from('businesses').insert([
      { 
        name: bizName, 
        slug: bizSlug, 
        category: bizCategory,
        owner_id: user.id
      }
    ]).select();

    if (!error && data) {
      await supabase.from('services').insert([
        { business_id: data[0].id, name: 'Standart Hizmet / Kesim', price: 350, duration: 30 }
      ]);
      await supabase.from('staff').insert([
        { business_id: data[0].id, name: 'Baş Usta', title: 'Usta' }
      ]);
      setShowNewBizModal(false);
      setBizName('');
      setBizSlug('');
      fetchBusinesses();
    } else {
      alert('Hata: ' + error.message);
    }
  }

  async function handleDeleteAppointment(appId: string) {
    if (!confirm('Bu randevuyu silmek istediğine emin misin?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', appId);
    if (!error) {
      setAppointments(appointments.filter(a => a.id !== appId));
    }
  }

  async function handleQueryAppointments(e: React.FormEvent) {
    e.preventDefault();
    if (!queryPhone) return;

    setHasQueried(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*, businesses(name, category, id, slug), services(name, price), staff(name)')
      .eq('customer_phone', queryPhone)
      .order('appointment_date', { ascending: true });

    if (!error && data) {
      setMyAppointments(data);
    } else {
      setMyAppointments([]);
    }

    const { data: favData } = await supabase
      .from('customer_favorites')
      .select('business_id')
      .eq('customer_phone', queryPhone);
    
    if (favData) {
      setMyFavorites(favData.map(f => f.business_id));
    }
  }

  async function toggleFavorite(bizId: string) {
    if (!queryPhone) {
      alert('Önce "Randevularım & Favoriler" menüsünden telefon numaranızla sorgulama yapın!');
      return;
    }

    if (myFavorites.includes(bizId)) {
      await supabase.from('customer_favorites').delete().eq('customer_phone', queryPhone).eq('business_id', bizId);
      setMyFavorites(myFavorites.filter(id => id !== bizId));
    } else {
      await supabase.from('customer_favorites').insert([{ customer_phone: queryPhone, business_id: bizId }]);
      setMyFavorites([...myFavorites, bizId]);
    }
  }

  async function handleCancelMyAppointment(appId: string) {
    if (!confirm('Randevunuzu iptal etmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', appId);
    if (!error) {
      setMyAppointments(myAppointments.filter(a => a.id !== appId));
    }
  }

  const totalRevenue = appointments.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
  const todayRevenue = appointments
    .filter(a => a.appointment_date === todayString)
    .reduce((acc, curr) => acc + (curr.services?.price || 0), 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-amber-500 selection:text-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setSelectedBusiness(null); setDashboardBiz(null); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Scissors className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Rezerv <span className="text-amber-400 font-light">Pro</span>
                {isSuperAdmin && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono border border-red-500/30">SUPER ADMIN</span>}
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Akıllı Randevu Sistemleri</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => { setShowQueryModal(true); setHasQueried(false); setMyAppointments([]); setQueryPhone(''); }}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-amber-500/20 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Randevularım & Favoriler</span>
            </button>

            {user ? (
              <>
                <button 
                  onClick={() => setShowNewBizModal(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/10"
                >
                  <PlusCircle className="w-4 h-4" /> İşletme Ekle
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium transition border border-slate-700"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setIsSignUp(false); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium transition border border-slate-700"
                >
                  <LogIn className="w-3.5 h-3.5" /> Giriş Yap
                </button>
                <button 
                  onClick={() => { setIsSignUp(true); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/10"
                >
                  <PlusCircle className="w-4 h-4" /> Kayıt Ol
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {dashboardBiz ? (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setDashboardBiz(null)}
                  className="text-xs text-amber-400 font-semibold inline-flex items-center gap-1.5 hover:underline bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Ana Sayfaya Dön
                </button>

                {isSuperAdmin && (
                  <button 
                    onClick={() => handleDeleteBusinessCompletely(dashboardBiz.id)}
                    className="text-xs text-red-400 font-semibold inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> İşletmeyi Kapat (Sistemden Sil)
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <span className="text-[11px] font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">{dashboardBiz.category}</span>
                  <h2 className="text-2xl font-black mt-2 text-white">{dashboardBiz.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Yönetim Paneli & Konum Kontrolü</p>
                </div>

                <button
                  onClick={() => copyBusinessLink(dashboardBiz.slug)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Link Kopyalandı!' : `Müşteri Linkini Kopyala (/${dashboardBiz.slug})`}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Toplam Randevu</p>
                    <p className="text-xl font-black text-white mt-0.5">{appointments.length}</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Bugünkü Ciro</p>
                    <p className="text-xl font-black text-emerald-400 mt-0.5">{todayRevenue} TL</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Toplam Potansiyel Ciro</p>
                    <p className="text-xl font-black text-amber-400 mt-0.5">{totalRevenue} TL</p>
                  </div>
                </div>
              </div>

              {/* USTA BAZLI PERFORMANS */}
              <div className="mb-8 pb-8 border-b border-slate-800">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <Award className="w-4 h-4 text-amber-400" /> Usta Bazlı Ciro & Prim Analizi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dashboardStaff.map(st => {
                    const staffAppts = appointments.filter(a => a.staff_id === st.id);
                    const staffRevenue = staffAppts.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
                    return (
                      <div key={st.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                        <p className="font-bold text-sm text-white">{st.name}</p>
                        <p className="text-[11px] text-amber-400 mb-2">{st.title}</p>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80">
                          <span className="text-slate-400">{staffAppts.length} Randevu</span>
                          <span className="font-black text-emerald-400">{staffRevenue} TL</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8 pb-8 border-b border-slate-800">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <Settings className="w-4 h-4 text-amber-400" /> İşletme Ayarları, Adres & Google Harita Konumu
                </h3>

                {settingsSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>{settingsSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Açılış Saati</label>
                      <input 
                        type="time" 
                        value={workStart} 
                        onChange={(e) => setWorkStart(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kapanış Saati</label>
                      <input 
                        type="time" 
                        value={workEnd} 
                        onChange={(e) => setWorkEnd(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Slot Aralığı</label>
                      <select 
                        value={slotDuration} 
                        onChange={(e) => setSlotDuration(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="15">15 Dakika</option>
                        <option value="30">30 Dakika</option>
                        <option value="45">45 Dakika</option>
                        <option value="60">60 Dakika</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Açık Adres</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Karşıyaka Çarşı No:12 İzmir"
                        value={bizAddress} 
                        onChange={(e) => setBizAddress(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Instagram Hesabı</label>
                      <input 
                        type="text" 
                        placeholder="Örn: karsiyakaberber"
                        value={bizInstagram} 
                        onChange={(e) => setBizInstagram(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Google Harita / Konum Linki</label>
                      <input 
                        type="url" 
                        placeholder="Google Maps Paylaş Linki"
                        value={bizMapUrl} 
                        onChange={(e) => setBizMapUrl(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Haftalık Tatil Günleri</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => {
                        const isClosed = closedDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleClosedDay(day.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                              isClosed 
                                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {day.name} {isClosed ? '(Kapalı)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold py-2.5 px-6 rounded-xl text-xs transition border border-slate-700"
                  >
                    Tüm Ayarları Kaydet
                  </button>
                </form>
              </div>

              {/* PERSONEL VE HİZMET YÖNETİMİ (Önceki kodlarla aynı) */}
              <div className="mb-8 pb-8 border-b border-slate-800">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <Users className="w-4 h-4 text-amber-400" /> Personel / Kalfa Listesi ({dashboardStaff.length})
                </h3>

                <form onSubmit={handleAddStaff} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text"
                    required
                    placeholder="Personel Adı"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                  />
                  <input 
                    type="text"
                    required
                    placeholder="Unvan (Örn: Usta)"
                    value={newStaffTitle}
                    onChange={(e) => setNewStaffTitle(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button 
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" /> Personel Ekle
                  </button>
                </form>

                {dashboardStaff.length === 0 ? (
                  <p className="text-xs text-slate-500">Henüz personel eklenmemiş.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dashboardStaff.map((st) => (
                      <div key={st.id} className="p-4 rounded-2xl border border-slate-800 flex justify-between items-center bg-slate-950/40">
                        <div>
                          <p className="font-semibold text-sm text-white">{st.name}</p>
                          <p className="text-xs text-amber-400 mt-0.5">{st.title}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteStaff(st.id)}
                          className="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-8 pb-8 border-b border-slate-800">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                  <Tag className="w-4 h-4 text-amber-400" /> Hizmet & Fiyat Listesi ({dashboardServices.length})
                </h3>

                <form onSubmit={handleAddService} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input 
                    type="text"
                    required
                    placeholder="Hizmet Adı"
                    value={newSrvName}
                    onChange={(e) => setNewSrvName(e.target.value)}
                    className="sm:col-span-2 px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                  />
                  <input 
                    type="number"
                    required
                    placeholder="Fiyat (TL)"
                    value={newSrvPrice}
                    onChange={(e) => setNewSrvPrice(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-2">
                    <select 
                      value={newSrvDuration}
                      onChange={(e) => setNewSrvDuration(e.target.value)}
                      className="flex-1 px-2 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="15">15 dk</option>
                      <option value="30">30 dk</option>
                      <option value="45">45 dk</option>
                      <option value="60">60 dk</option>
                    </select>
                    <button 
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Ekle
                    </button>
                  </div>
                </form>

                {dashboardServices.length === 0 ? (
                  <p className="text-xs text-slate-500">Henüz kayıtlı hizmet yok.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dashboardServices.map((srv) => (
                      <div key={srv.id} className="p-4 rounded-2xl border border-slate-800 flex justify-between items-center bg-slate-950/40">
                        <div>
                          <p className="font-semibold text-sm text-white">{srv.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{srv.duration} dk • <span className="font-bold text-amber-400">{srv.price} TL</span></p>
                        </div>
                        <button onClick={() => handleDeleteService(srv.id)} className="text-slate-500 hover:text-red-400 p-2 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-200">
                <Calendar className="w-4 h-4 text-amber-400" /> Gelen Randevular ({appointments.length})
              </h3>
              {appointments.length === 0 ? (
                <div className="bg-slate-950/50 p-8 rounded-2xl border border-dashed border-slate-800 text-center">
                  <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">Henüz bu işletmeye alınmış bir randevu yok.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((app) => (
                    <div key={app.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => openCustomerCRM(app.customer_phone)}
                            className="font-bold text-sm text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            👤 {app.customer_name}
                          </span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-md font-semibold">{app.services?.name}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md font-semibold">Usta: {app.staff?.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-400" /> {app.customer_phone}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-400" /> {app.appointment_date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {app.appointment_time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openCustomerCRM(app.customer_phone)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/20 transition"
                        >
                          CRM / Notlar
                        </button>
                        <button onClick={() => handleDeleteAppointment(app.id)} className="text-slate-500 hover:text-red-400 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : !selectedBusiness ? (
          <div>
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Yeni Nesil Rezervasyon
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight">İşletmeni Seç veya Dükkanını Aç</h2>
              </div>
            </div>

            {businesses.length === 0 ? (
              <div className="bg-slate-900 p-10 rounded-3xl border border-dashed border-slate-800 text-center">
                <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium text-sm">Henüz kayıtlı bir işletme bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((biz) => {
                  const isOwner = user && (biz.owner_id === user.id || isSuperAdmin);
                  const mapLink = biz.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' ' + (biz.address || ''))}`;
                  return (
                    <div key={biz.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl transition shadow-xl flex flex-col justify-between group relative">
                      <div onClick={() => selectBusiness(biz)} className="cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">{biz.category}</span>
                          <div className="flex items-center gap-2">
                            {isOwner && <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">Senin Dükkanın</span>}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(biz.id); }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                              title="Favorilere Ekle"
                            >
                              <Heart className={`w-4 h-4 ${myFavorites.includes(biz.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mt-3 text-white group-hover:text-amber-400 transition">{biz.name}</h3>
                        {biz.address && (
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {biz.address}</p>
                            <a 
                              href={mapLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                            >
                              <Navigation className="w-3 h-3" /> Haritada Gör / Yol Tarifi
                            </a>
                          </div>
                        )}
                        {biz.instagram && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            📸 <a href={`https://instagram.com/${biz.instagram}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-amber-400 hover:underline">@{biz.instagram}</a>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-800">
                        <button onClick={() => selectBusiness(biz)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition text-center">Hızlı Randevu Al</button>
                        {isOwner && (
                          <button onClick={() => openDashboard(biz)} className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold">
                            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" /> Panel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto relative overflow-hidden">
              <button onClick={() => setSelectedBusiness(null)} className="text-xs text-amber-400 font-semibold mb-6 inline-flex items-center gap-1.5 hover:underline bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <ArrowLeft className="w-3.5 h-3.5" /> Tüm İşletmelere Dön
              </button>

              <div className="border-b border-slate-800 pb-6 mb-6 flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">{selectedBusiness.category}</span>
                  <h2 className="text-2xl font-black mt-2 text-white">{selectedBusiness.name}</h2>
                  {selectedBusiness.address && (
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {selectedBusiness.address}</p>
                      <a 
                        href={selectedBusiness.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.name + ' ' + selectedBusiness.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                      >
                        <Navigation className="w-3 h-3" /> Yol Tarifi Al
                      </a>
                    </div>
                  )}
                  {selectedBusiness.instagram && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      📸 <a href={`https://instagram.com/${selectedBusiness.instagram}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">@{selectedBusiness.instagram}</a>
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => toggleFavorite(selectedBusiness.id)}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 transition"
                  title="Favorilere Ekle"
                >
                  <Heart className={`w-5 h-5 ${myFavorites.includes(selectedBusiness.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
              </div>

              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-300">Randevun Başarıyla Oluşturuldu!</h3>
                  <button onClick={() => setSuccess(false)} className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold transition">Yeni Randevu Al</button>
                </div>
              ) : (
                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">1. Hizmet Seçin</label>
                    {services.length === 0 ? (
                      <p className="text-xs text-slate-500">Bu işletmenin henüz kayıtlı hizmeti bulunmuyor.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {services.map((srv) => (
                          <div 
                            key={srv.id}
                            onClick={() => setSelectedService(srv)}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex justify-between items-center ${
                              selectedService?.id === srv.id 
                                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5' 
                                : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-xs text-white">{srv.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{srv.duration} dakika</p>
                            </div>
                            <span className="font-bold text-amber-400 text-sm">{srv.price} TL</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">2. Personel / Usta Seçin</label>
                    {staffList.length === 0 ? (
                      <p className="text-xs text-slate-500">Bu işletmenin kayıtlı personeli bulunmuyor.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {staffList.map((st) => (
                          <div 
                            key={st.id}
                            onClick={() => setSelectedStaff(st)}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                              selectedStaff?.id === st.id 
                                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5' 
                                : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-white">{st.name}</p>
                              <p className="text-[10px] text-amber-400 mt-0.5">{st.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">3. Tarih Seçin</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                      <input 
                        type="date"
                        required
                        min={todayString}
                        value={date}
                        onChange={handleDateChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {date && selectedStaff && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">4. Uygun Saat Seçin ({selectedStaff.name})</label>
                      {availableSlots.length === 0 ? (
                        <p className="text-xs text-slate-500">Bu gün için uygun saat bulunamadı.</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-800 rounded-2xl bg-slate-950/50">
                          {availableSlots.map((slot) => {
                            const isBooked = bookedTimes.includes(slot);
                            const isSelected = selectedTime === slot;

                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition border ${
                                  isBooked 
                                    ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed line-through' 
                                    : isSelected 
                                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md shadow-amber-500/20' 
                                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-amber-500/50'
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Adınız Soyadınız</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                        <input 
                          type="text"
                          required
                          placeholder="Örn: Ahmet Yılmaz"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Telefon Numaranız</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                        <input 
                          type="tel"
                          required
                          placeholder="0532 000 00 00"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Berbere Özel Not (İsteğe Bağlı)</label>
                    <input 
                      type="text"
                      placeholder="Örn: Sağ yanlar sıfır olsun, kahve severim"
                      value={customerNoteInput}
                      onChange={(e) => setCustomerNoteInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!selectedService || !selectedStaff || !selectedTime}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 text-xs uppercase tracking-wider"
                  >
                    Randevuyu Onayla
                  </button>
                </form>
              )}
            </div>

            {/* YORUMLAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Müşteri Yorumları & Puanlar ({businessReviews.length})
              </h3>

              {reviewSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl text-xs mb-4">
                  {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleAddReview} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 mb-6 space-y-3">
                <p className="text-xs font-bold text-slate-300">Değerlendirmenizi Yazın <span className="text-[10px] text-amber-400 font-normal">(Sadece bu dükkanda randevusu olanlar yazabilir)</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Puanınız:</span>
                  <select 
                    value={reviewRating} 
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Çok İyi)</option>
                    <option value="3">⭐⭐⭐ (3 - Ortalama)</option>
                    <option value="2">⭐⭐ (2 - Kötü)</option>
                    <option value="1">⭐ (1 - Berbat)</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="tel"
                    required
                    placeholder="Randevu Aldığınız Telefon Numaranız"
                    value={reviewPhone}
                    onChange={(e) => setReviewPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <textarea 
                    required
                    rows={2}
                    placeholder="Deneyiminizi yazın..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-900 text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition"
                >
                  Yorumu Gönder (Randevu Kontrollü)
                </button>
              </form>

              {businessReviews.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Bu işletme için henüz yorum yapılmamış.</p>
              ) : (
                <div className="space-y-3">
                  {businessReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white">Doğrulanmış & Randevulu Müşteri</span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{rev.comment}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">{new Date(rev.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MÜŞTERİ CRM & NOT DEFTERİ MODALI */}
      {selectedCustomerCRM && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" /> Müşteri CRM Kartı ({selectedCustomerCRM})
              </h3>
              <button onClick={() => setSelectedCustomerCRM(null)} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-300 mb-1">Esnaf Notu / Tercihler</p>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200">
                  {customerNoteText ? `📝 Not: ${customerNoteText}` : 'Bu müşteri için kayıtlı özel not bulunmuyor.'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Geçmiş Randevuları ({customerHistoryAppointments.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerHistoryAppointments.map(app => (
                    <div key={app.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-xs">
                      <div className="flex justify-between items-center text-white font-semibold">
                        <span>{app.services?.name}</span>
                        <span className="text-amber-400">{app.services?.price} TL</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>{app.appointment_date} - {app.appointment_time}</span>
                        <span>Usta: {app.staff?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedCustomerCRM(null)} className="mt-6 w-full bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold">Kapat</button>
          </div>
        </div>
      )}

      {/* SORGULAMA, AUTH VE YENİ DÜKKAN MODALLARI */}
      {showQueryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Randevularım & Favorilerim</h3>
              </div>
              <button onClick={() => setShowQueryModal(false)} className="text-slate-400 hover:text-white text-sm font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleQueryAppointments} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Telefon Numaranız</label>
                <div className="flex gap-2">
                  <input type="tel" required placeholder="0532 000 00 00" value={queryPhone} onChange={(e) => setQueryPhone(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:outline-none focus:border-amber-500"/>
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl text-xs font-bold transition">Sorgula</button>
                </div>
              </div>
            </form>

            {hasQueried && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Aktif Randevularım ({myAppointments.length})</h4>
                  {myAppointments.length === 0 ? (
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">Bu numaraya ait aktif randevu yok.</div>
                  ) : (
                    <div className="space-y-3">
                      {myAppointments.map((app) => (
                        <div key={app.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-xs text-white">{app.businesses?.name} ({app.staff?.name})</p>
                            <p className="text-[11px] text-slate-400">{app.appointment_date} - {app.appointment_time}</p>
                          </div>
                          <button onClick={() => handleCancelMyAppointment(app.id)} className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold">İptal Et</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Favori İşletmelerim ({myFavorites.length})</h4>
                  {myFavorites.length === 0 ? (
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">Henüz favori işletmeniz yok.</div>
                  ) : (
                    <div className="space-y-2">
                      {businesses.filter(b => myFavorites.includes(b.id)).map(favBiz => (
                        <div key={favBiz.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{favBiz.name}</span>
                          <button onClick={() => { setSelectedBusiness(favBiz); setShowQueryModal(false); }} className="text-xs text-amber-400 font-semibold hover:underline">Hızlı Randevu Al</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <button onClick={() => setShowQueryModal(false)} className="mt-6 w-full bg-slate-800 text-slate-300 py-3 rounded-xl text-xs font-semibold">Kapat</button>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">{isSignUp ? 'İşletme Hesabı Oluştur' : 'İşletme Girişi'}</h3>
            {authError && <div className="bg-red-500/10 text-red-300 p-2 text-xs mb-3 rounded-lg">{authError}</div>}
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="email" required placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"/>
              <input type="password" required placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"/>
              <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs">{isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}</button>
            </form>
            <button onClick={() => setShowAuthModal(false)} className="mt-3 w-full text-xs text-slate-500">Vazgeç</button>
          </div>
        </div>
      )}

      {showNewBizModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Yeni İşletme Kaydı</h3>
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <input type="text" required placeholder="İşletme Adı" value={bizName} onChange={(e) => setBizName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"/>
              <input type="text" required placeholder="Link (örn: karsiyaka-berber)" value={bizSlug} onChange={(e) => setBizSlug(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"/>
              <select value={bizCategory} onChange={(e) => setBizCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white">
                <option value="Berber">Berber</option>
                <option value="Kuaför">Kuaför</option>
                <option value="Güzellik Salonu">Güzellik Salonu</option>
                <option value="Diş Kliniği">Diş Kliniği</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowNewBizModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl text-xs">İptal</button>
                <button type="submit" className="flex-1 bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}