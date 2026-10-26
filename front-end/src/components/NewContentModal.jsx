import { useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../api.js';
import { FORMATS, PLATFORMS, PRIORITIES } from '../constants.js';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import Field from './Field.jsx';
import { useToast } from './Toast.jsx';

export default function NewContentModal({ channels, onClose, onCreated }) {
  const toast = useToast();
  const [f, setF] = useState({ title: '', channel_id: '', format_type: 'short_video', priority: 'medium', scheduled_date: '', description: '' });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (k) => (v) => setF({ ...f, [k]: v });

  async function submit(e) {
    e.preventDefault();
    setErrs({});
    try {
      await api.createContent(f); // validasi dilakukan di backend
      toast('Ide disimpan di Idea backlog.');
      onCreated();
    } catch (err) {
      setErrs(err.errors);
      if (!Object.keys(err.errors).length) toast(err.message, true);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <div>
          <DialogTitle>Ide konten baru</DialogTitle>
          <DialogDescription className="mt-1">Ide masuk ke Idea backlog, lalu digeser lewat tahap produksi.</DialogDescription>
        </div>
        <form onSubmit={submit} noValidate>
          <Field label="Judul" htmlFor="nt" error={errs.title}>
            <Input id="nt" value={f.title} onChange={set('title')} autoFocus />
          </Field>
          <div className="row">
            <Field className="col-6" label="Channel" htmlFor="nc" error={errs.channel_id}>
              <SimpleSelect id="nc" value={f.channel_id} onChange={pick('channel_id')} placeholder="Pilih channel"
                options={channels.map((c) => [c.id, `${PLATFORMS[c.platform]} ${c.handle_name}`])} />
            </Field>
            <Field className="col-6" label="Format" htmlFor="nf" error={errs.format_type}>
              <SimpleSelect id="nf" value={f.format_type} onChange={pick('format_type')} options={Object.entries(FORMATS)} />
            </Field>
            <Field className="col-6" label="Prioritas" htmlFor="np" error={errs.priority}>
              <SimpleSelect id="np" value={f.priority} onChange={pick('priority')} options={PRIORITIES.map((p) => [p, p])} />
            </Field>
            <Field className="col-6" label="Tanggal rilis (opsional)" htmlFor="nd" error={errs.scheduled_date}>
              <Input id="nd" type="date" value={f.scheduled_date} onChange={set('scheduled_date')} />
            </Field>
          </div>
          <Field label="Konsep singkat" htmlFor="ns">
            <Textarea id="ns" rows={3} value={f.description} onChange={set('description')} />
          </Field>
          <div className="d-flex gap-2 justify-content-end">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit"><Save /> Simpan ide</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
