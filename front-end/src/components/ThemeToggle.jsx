import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Ganti tema">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
