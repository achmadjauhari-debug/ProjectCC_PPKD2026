import { useState } from 'react';
import { Clapperboard, LogIn, UserPlus } from 'lucide-react';
import { api, setSession } from '../api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Field from '../components/Field.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useToast } from '../components/Toast.jsx';

const DEMO = { name: '', email: 'demo@kreator.id', password: 'demo1234' };

export default function AuthPage({ onAuth, theme, onToggleTheme }) {
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(DEMO);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const reg = mode === 'register';
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrs({});
    setBusy(true);
    
    // 🌟 Memastikan fungsi terpanggil di terminal browser Anda saat tombol diklik
    console.log("Mencoba mengirimkan data autentikasi..."); 

    try {
      const res = reg ? await api.register(form) : await api.login({ email: form.email, password: form.password });
      setSession(res.token, res.user);
      onAuth(res.user);
      toast(reg ? 'Akun berhasil dibuat.' : 'Selamat datang kembali.');
    } catch (err) {
      // 🌟 Mengamankan blok catch agar tidak memblokir aplikasi jika err.errors kosong
      console.error("Eror tertangkap saat submit:", err);
      
      if (err && err.errors && typeof err.errors === 'object' && Object.keys(err.errors).length) {
        setErrs(err.errors);
      } else {
        setErrs({ _: err.message || 'Gagal terhubung ke server backend.' });
      }
    } finally {
      setBusy(false);
    }
  }

  const switchMode = () => {
    setMode(reg ? 'login' : 'register');
    setErrs({});
    setForm(reg ? DEMO : { name: '', email: '', password: '' });
  };

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center py-4 position-relative">
      <div className="position-absolute top-0 end-0 p-3"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <Card>
            <CardHeader>
              <CardTitle className="d-flex align-items-center gap-2"><Clapperboard size={26} /> Alur Konten</CardTitle>
              <CardDescription>{reg ? 'Buat akun untuk mulai mengelola konten.' : 'Masuk untuk membuka pipeline konten kamu.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} noValidate>
                {reg && (
                  <Field label="Nama lengkap" htmlFor="n" error={errs.name}>
                    <Input id="n" value={form.name} onChange={set('name')} autoComplete="name" />
                  </Field>
                )}
                <Field label="Email" htmlFor="e" error={errs.email}>
                  <Input id="e" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
                </Field>
                <Field label="Kata sandi" htmlFor="p" error={errs.password || errs._}>
                  <Input id="p" type="password" value={form.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} />
                </Field>
                
                {/* 🌟 PERBAIKAN: Menambahkan type="submit" secara eksplisit ke komponen Shadcn Button */}
                <Button type="submit" className="w-100" disabled={busy}>
                  {reg ? <UserPlus /> : <LogIn />} {busy ? 'Memproses...' : reg ? 'Daftar' : 'Masuk'}
                </Button>
              </form>
              <p className="text-center text-secondary small mt-3 mb-0">
                {reg ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <Button variant="link" className="tw-h-auto tw-p-0" onClick={switchMode}>{reg ? 'Masuk' : 'Daftar'}</Button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
