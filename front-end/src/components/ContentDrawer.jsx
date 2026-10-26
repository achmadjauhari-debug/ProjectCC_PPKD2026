import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Info, Plus, Save, Trash2, TrendingUp, Undo2, X } from 'lucide-react';
import { api } from '../api.js';
import { STATUSES, FORMATS, PLATFORMS, PRIORITIES, statusLabel, today } from '../constants.js';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SimpleSelect } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import Field from './Field.jsx';
import { useToast } from './Toast.jsx';

const toForm = (c) => ({
  title: c.title, channel_id: c.channel_id, format_type: c.format_type, priority: c.priority,
  scheduled_date: c.scheduled_date || '', description: c.description || '', script_draft: c.script_draft || '',
  published_url: c.published_url || '',
});
const blankMetric = () => ({ recorded_at: today(), views_count: 0, likes_count: 0, comments_count: 0, shares_count: 0 });
const METRIC_FIELDS = [['views_count', 'Views'], ['likes_count', 'Likes'], ['comments_count', 'Komentar'], ['shares_count', 'Shares']];

export default function ContentDrawer({ id, channels, onClose, onChanged }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  const [task, setTask] = useState('');
  const [metric, setMetric] = useState(blankMetric());
  const [mErrs, setMErrs] = useState({});
  const [confirmDel, setConfirmDel] = useState(false);

  const load = useCallback(async () => {
    const r = await api.content(id);
    setDetail(r);
    setForm(toForm(r.content));
  }, [id]);
  useEffect(() => { load().catch((e) => { toast(e.message, true); onClose(); }); }, [load]);

  const close = (o) => !o && onClose();
  if (!detail || !form) {
    return <Sheet open onOpenChange={close}><SheetContent><SheetTitle>Memuat...</SheetTitle></SheetContent></Sheet>;
  }

  const { content: c, checklists, metrics } = detail;
  const idx = STATUSES.findIndex((s) => s[0] === c.status);
  const next = STATUSES[idx + 1];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pick = (k) => (v) => setForm({ ...form, [k]: v });

  // Semua perubahan lewat PATCH; server yang memutuskan valid atau tidak.
  async function patch(extra, okMsg) {
    setErrs({});
    try {
      await api.updateContent(id, { ...form, channel_id: Number(form.channel_id), ...extra });
      await load();
      onChanged();
      toast(okMsg);
    } catch (err) {
      setErrs(err.errors);
      toast(err.message, true);
    }
  }
  const run = async (fn, okMsg) => {
    try { await fn(); await load(); onChanged(); if (okMsg) toast(okMsg); } catch (err) { toast(err.message, true); }
  };
  async function addMetric(e) {
    e.preventDefault();
    setMErrs({});
    try {
      await api.addMetric(id, metric);
      setMetric(blankMetric());
      await load();
      toast('Metrik dicatat.');
    } catch (err) {
      setMErrs(err.errors);
      if (!Object.keys(err.errors).length) toast(err.message, true);
    }
  }
  async function remove() {
    try { await api.deleteContent(id); onChanged(); onClose(); toast('Konten dan data terkait dihapus.'); } catch (err) { toast(err.message, true); }
  }

  const done = checklists.filter((k) => k.is_completed).length;

  return (
    <>
      <Sheet open onOpenChange={close}>
        <SheetContent style={{ '--c': `var(--s-${c.status})` }}>
          <SheetTitle>{c.title}</SheetTitle>
          <div className="steps d-flex gap-1 my-3">
            {STATUSES.map((s, i) => <i key={s[0]} className={i <= idx ? 'on' : ''} title={s[1]} />)}
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Badge style={{ background: `var(--s-${c.status})`, color: '#fff', borderColor: 'transparent' }}>{statusLabel(c.status)}</Badge>
            {next && <Button size="sm" onClick={() => patch({ status: next[0] }, `Status diubah ke ${next[1]}.`)}>Pindah ke {next[1]} <ArrowRight /></Button>}
            {idx > 0 && <Button size="sm" variant="outline" onClick={() => patch({ status: STATUSES[idx - 1][0] }, 'Status dikembalikan.')}><Undo2 /> Kembali</Button>}
          </div>
          {next?.[0] === 'published' && (
            <div className="d-flex gap-2 align-items-start rounded-2 tw-border tw-border-dashed p-2 mt-3 small text-secondary">
              <Info size={16} className="flex-shrink-0 mt-1" />
              <span>Untuk publish, isi tautan postingan di bawah lebih dulu. Server menolak jika kosong atau tidak valid.</span>
            </div>
          )}

          <form className="mt-3" onSubmit={(e) => { e.preventDefault(); patch({}, 'Perubahan disimpan.'); }} noValidate>
            <Field label="Judul" htmlFor="et" error={errs.title}><Input id="et" value={form.title} onChange={set('title')} /></Field>
            <div className="row">
              <Field className="col-6" label="Channel" htmlFor="ec" error={errs.channel_id}>
                <SimpleSelect id="ec" value={form.channel_id} onChange={pick('channel_id')} options={channels.map((ch) => [ch.id, `${PLATFORMS[ch.platform]} ${ch.handle_name}`])} />
              </Field>
              <Field className="col-6" label="Format" htmlFor="ef" error={errs.format_type}>
                <SimpleSelect id="ef" value={form.format_type} onChange={pick('format_type')} options={Object.entries(FORMATS)} />
              </Field>
              <Field className="col-6" label="Prioritas" htmlFor="ep" error={errs.priority}>
                <SimpleSelect id="ep" value={form.priority} onChange={pick('priority')} options={PRIORITIES.map((p) => [p, p])} />
              </Field>
              <Field className="col-6" label="Tanggal rilis" htmlFor="ed" error={errs.scheduled_date}>
                <Input id="ed" type="date" value={form.scheduled_date} onChange={set('scheduled_date')} />
              </Field>
            </div>
            <Field label="Konsep singkat" htmlFor="es" error={errs.description}><Textarea id="es" rows={2} value={form.description} onChange={set('description')} /></Field>
            <Field label="Draf naskah" htmlFor="esc" error={errs.script_draft}><Textarea id="esc" rows={5} value={form.script_draft} onChange={set('script_draft')} /></Field>
            <Field label="Tautan postingan (published_url)" htmlFor="eu" error={errs.published_url}>
              <Input id="eu" value={form.published_url} onChange={set('published_url')} placeholder="https://..." />
            </Field>
            <Button type="submit"><Save /> Simpan perubahan</Button>
          </form>

          <hr className="my-4" />
          <h3 className="h6 mb-2">Checklist produksi ({done}/{checklists.length})</h3>
          {checklists.map((k) => (
            <div key={k.id} className="d-flex align-items-center gap-2 py-2 border-bottom">
              <Checkbox checked={k.is_completed} aria-label={`Selesai: ${k.task_name}`} onCheckedChange={() => run(() => api.toggleChecklist(k.id))} />
              <span className={'flex-grow-1' + (k.is_completed ? ' text-decoration-line-through text-secondary' : '')}>{k.task_name}</span>
              <Button size="icon" variant="ghost" className="tw-size-8 tw-text-destructive" aria-label="Hapus item" onClick={() => run(() => api.deleteChecklist(k.id), 'Item dihapus.')}><X /></Button>
            </div>
          ))}
          {!checklists.length && <p className="small text-secondary">Belum ada tugas. Tambahkan, misalnya: Rekam B-roll.</p>}
          <form className="d-flex gap-2 mt-3" noValidate onSubmit={(e) => { e.preventDefault(); run(() => api.addChecklist(id, { task_name: task }).then(() => setTask(''))); }}>
            <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Nama tugas" aria-label="Nama tugas" />
            <Button variant="secondary"><Plus /> Tambah</Button>
          </form>

          <hr className="my-4" />
          <h3 className="h6 mb-2 d-flex align-items-center gap-2"><TrendingUp size={16} /> Metrik performa</h3>
          {c.status !== 'published' ? <p className="small text-secondary">Metrik dibuka setelah konten berstatus Published.</p> : (
            <>
              {metrics.length ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-3">
                    <thead><tr><th>Tanggal</th><th className="text-end">Views</th><th className="text-end">Likes</th><th className="text-end">Komentar</th><th className="text-end">Shares</th></tr></thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr key={m.id}><td>{m.recorded_at}</td><td className="text-end">{m.views_count.toLocaleString('id')}</td><td className="text-end">{m.likes_count}</td><td className="text-end">{m.comments_count}</td><td className="text-end">{m.shares_count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="small text-secondary">Belum ada catatan metrik.</p>}
              <form onSubmit={addMetric} noValidate>
                <div className="row">
                  <Field className="col-6" label="Tanggal" htmlFor="mr" error={mErrs.recorded_at}>
                    <Input id="mr" type="date" value={metric.recorded_at} onChange={(e) => setMetric({ ...metric, recorded_at: e.target.value })} />
                  </Field>
                  {METRIC_FIELDS.map(([k, label]) => (
                    <Field className="col-6" key={k} label={label} htmlFor={k} error={mErrs[k]}>
                      <Input id={k} type="number" min="0" value={metric[k]} onChange={(e) => setMetric({ ...metric, [k]: e.target.value })} />
                    </Field>
                  ))}
                </div>
                <Button variant="secondary"><Plus /> Catat metrik</Button>
              </form>
            </>
          )}

          <hr className="my-4" />
          <Button variant="outline" className="tw-border-destructive tw-text-destructive" onClick={() => setConfirmDel(true)}><Trash2 /> Hapus konten</Button>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDel} onOpenChange={setConfirmDel}>
        <DialogContent className="tw-z-[1200] tw-max-w-md">
          <div>
            <DialogTitle>Hapus konten ini?</DialogTitle>
            <DialogDescription className="mt-2">
              Konten akan dihapus beserta {checklists.length} checklist dan {metrics.length} log metrik. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline" onClick={() => setConfirmDel(false)}>Batal</Button>
            <Button variant="destructive" onClick={remove}><Trash2 /> Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
