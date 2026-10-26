import { useEffect, useState } from 'react';
import { Plus, Radio } from 'lucide-react';
import { api } from '../api.js';
import { PLATFORMS } from '../constants.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SimpleSelect } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Field from '../components/Field.jsx';
import { useToast } from '../components/Toast.jsx';

export default function ChannelsPage() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ platform: 'youtube', handle_name: '' });
  const [errs, setErrs] = useState({});

  const load = () => api.channels().then((r) => setList(r.data)).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setErrs({});
    try {
      await api.addChannel(form);
      setForm({ ...form, handle_name: '' });
      await load();
      toast('Channel ditambahkan.');
    } catch (err) {
      setErrs(err.errors);
      toast(err.message, true);
    }
  }

  return (
    <>
      <h2 className="h4 mb-3">Channel kamu</h2>
      <div className="row g-3 mb-4">
        {list.map((c) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={c.id}>
            <Card className="h-100">
              <CardHeader className="tw-pb-2">
                <CardTitle className="tw-text-lg d-flex align-items-center gap-2"><Radio size={18} /> {PLATFORMS[c.platform]}</CardTitle>
              </CardHeader>
              <CardContent className="d-flex justify-content-between align-items-center">
                <span className="text-secondary">{c.handle_name}</span>
                <Badge variant="secondary">{c.contents_count} konten</Badge>
              </CardContent>
            </Card>
          </div>
        ))}
        {!list.length && <p className="text-secondary">Belum ada channel. Tambahkan satu di bawah.</p>}
      </div>

      <div className="row">
        <div className="col-12 col-md-8 col-lg-5">
          <Card>
            <CardHeader><CardTitle className="tw-text-lg">Tambah channel</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={add} noValidate>
                <Field label="Platform" htmlFor="cp" error={errs.platform}>
                  <SimpleSelect id="cp" value={form.platform} onChange={(v) => setForm({ ...form, platform: v.toLowerCase() })} options={Object.entries(PLATFORMS)} />
                </Field>
                <Field label="Handle" htmlFor="ch" error={errs.handle_name}>
                  <Input id="ch" value={form.handle_name} placeholder="@namaakun" onChange={(e) => setForm({ ...form, handle_name: e.target.value })} />
                </Field>
                <Button type="submit" ><Plus /> Tambah channel</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
