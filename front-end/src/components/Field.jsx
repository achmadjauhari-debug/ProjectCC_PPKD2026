import { Label } from '@/components/ui/label';

// Label + kontrol + pesan error dari server, dalam satu blok.
export default function Field({ label, htmlFor, error, children, className = '' }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2 d-block">{label}</Label>
      {children}
      <p className="field-error" role={error ? 'alert' : undefined}>{error}</p>
    </div>
  );
}
