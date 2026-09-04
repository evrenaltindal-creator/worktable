import fs from 'fs';
import path from 'path';
import { Task } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

/**
 * Gorevleri (projeler, sohbet gecmisi ve uretilen tasarimlar) diskte tutar,
 * boylece program kapatilip acildiginda kaldiginiz yerden devam edersiniz.
 * `data/` klasoru gitignore'dadir - icerik bilgisayarinizdan cikmaz.
 */
export class TaskStore {
  load(): Task[] {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Bozuk dosya yuzunden program acilmasin diye bos baslanir.
      return [];
    }
  }

  save(tasks: Task[]) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    // Once gecici dosyaya yazilir: yazma sirasinda kapanma olursa
    // mevcut kayit bozulmaz.
    fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2), 'utf-8');
    fs.renameSync(tmp, DATA_FILE);
  }
}
