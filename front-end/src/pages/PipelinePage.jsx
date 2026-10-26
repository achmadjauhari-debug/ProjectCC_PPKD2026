import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ListChecks, Plus, Search } from "lucide-react";
import { api } from "../api.js";
import { STATUSES, FORMATS, PLATFORMS } from "../constants.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/select";
import { useToast } from "../components/Toast.jsx";
import ContentDrawer from "../components/ContentDrawer.jsx";
import NewContentModal from "../components/NewContentModal.jsx";

const EMPTY = {
  q: "",
  status: "",
  channel_id: "",
  format_type: "",
  platform: "",
};

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match.length >= 3 ? match[2] : null;
}

export default function PipelinePage() {
  const toast = useToast();
  const [filters, setFilters] = useState(EMPTY);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(
    () =>
      api
        .contents(filters)
        .then((r) => setItems(r.data))
        .catch((e) => toast(e.message, true))
        .finally(() => setLoading(false)),
    [filters],
  );
  
  useEffect(() => {
    load();
  }, [load]);
  
  useEffect(() => {
    api
      .channels()
      .then((r) => setChannels(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => setFilters((f) => (f.q === q ? f : { ...f, q })),
      300,
    );
    return () => clearTimeout(t);
  }, [q]);

  const setF = (k) => (v) => setFilters({ ...filters, [k]: v });
  
  const openNew = () =>
    channels.length
      ? setShowNew(true)
      : toast("Tambahkan channel dulu di tab Channel.", true);
      
  const channelOpts = channels.map((c) => [
    c.id,
    `${PLATFORMS[c.platform]} ${c.handle_name}`,
  ]);

  return (
    <>
      <div className="row g-2 align-items-end mb-4">
        <div className="col-12 col-lg">
          <Label htmlFor="fq" className="mb-2 d-block">Cari judul</Label>
          <div className="position-relative">
            <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-secondary" />
            <Input id="fq" className="tw-pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik judul konten" />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <Label htmlFor="fs" className="mb-2 d-block">Status</Label>
          <SimpleSelect id="fs" value={filters.status} onChange={setF("status")} options={STATUSES} allLabel="Semua status" />
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <Label htmlFor="fc" className="mb-2 d-block">Channel</Label>
          <SimpleSelect id="fc" value={filters.channel_id} onChange={setF("channel_id")} options={channelOpts} allLabel="Semua channel" />
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <Label htmlFor="fp" className="mb-2 d-block">Platform</Label>
          <SimpleSelect id="fp" value={filters.platform} onChange={setF("platform")} options={Object.entries(PLATFORMS)} allLabel="Semua platform" />
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <Label htmlFor="ff" className="mb-2 d-block">Format</Label>
          <SimpleSelect id="ff" value={filters.format_type} onChange={setF("format_type")} options={Object.entries(FORMATS)} allLabel="Semua format" />
        </div>
        <div className="col-12 col-lg-auto">
          <Button className="w-100" onClick={openNew}><Plus /> Konten baru</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-secondary">Memuat konten...</p>
      ) : (
        <div className="d-flex gap-3 overflow-auto pb-2 align-items-start">
          {STATUSES.map(([s, title]) => {
            const col = items.filter((c) => c.status === s);
            return (
              <section key={s} className="board-col rounded-3 p-2 bg-body-tertiary" style={{ minHeight: 220 }}>
                <h3 className="h6 d-flex justify-content-between align-items-center px-1 pb-2 mb-2 border-bottom border-3" style={{ "--bs-border-color": `var(--s-${s})` }}>
                  {title} <Badge variant="secondary">{col.length}</Badge>
                </h3>

                {col.map((c) => {
                  const videoId = getYouTubeId(c.published_url);

                  return (
                    <button
                      key={c.id}
                      onClick={() => setOpenId(c.id)}
                      className="tw-mb-2 tw-block tw-w-full tw-rounded-lg tw-border tw-border-l-4 tw-bg-card tw-p-3 tw-text-left tw-text-card-foreground tw-shadow-sm tw-transition-colors hover:tw-border-primary"
                      style={{ borderLeftColor: `var(--s-${c.status})` }}
                    >
                      <span className="d-block fw-semibold mb-2">{c.title}</span>

                      <span className="d-flex flex-wrap gap-1 align-items-center">
                        <Badge variant="outline">{PLATFORMS[c.platform]}</Badge>
                        <Badge variant="outline">{FORMATS[c.format_type]}</Badge>
                        <Badge variant={c.priority === "high" ? "destructive" : "outline"}>{c.priority}</Badge>
                      </span>

                      {(c.scheduled_date || c.checklist_total > 0) && (
                        <span className="d-flex gap-3 mt-2 small text-secondary">
                          {c.scheduled_date && (
                            <span className="d-flex align-items-center gap-1"><CalendarDays size={14} />{c.scheduled_date}</span>
                          )}
                          {c.checklist_total > 0 && (
                            <span className="d-flex align-items-center gap-1"><ListChecks size={14} />{c.checklist_done}/{c.checklist_total}</span>
                          )}
                        </span>
                      )}

                      {c.checklist_total > 0 && (
                        <span className="progress mt-2 d-flex" style={{ height: 4 }}>
                          <span className="progress-bar bg-success" style={{ width: `${(c.checklist_done / c.checklist_total) * 100}%` }} />
                        </span>
                      )}

                      {/* 🌟 PEMUTAR VIDEO: Berada di paling bawah kartu dengan format url embed yang benar */}
                      {videoId && (
                        <div 
                          className="tw-mt-3 tw-overflow-hidden tw-rounded-md tw-border tw-bg-black"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="position-relative w-100" style={{ paddingBottom: "56.25%", height: 0 }}>
                            <iframe
                              className="position-absolute top-0 start-0 w-100 h-100"
                              src={`https://youtube.com${videoId}`}
                              title={`Preview ${c.title}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}

                {!col.length && <p className="small text-secondary px-1">Belum ada konten di tahap ini.</p>}
              </section>
            );
          })}
        </div>
      )}

      {showNew && <NewContentModal channels={channels} onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />}
      {openId && <ContentDrawer id={openId} channels={channels} onClose={() => setOpenId(null)} onChanged={load} />}
    </>
  );
}
