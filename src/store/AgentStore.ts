import fs from 'fs';
import path from 'path';
import { AgentConfig } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'agents.json');
const DEFAULT_FILE = path.join(__dirname, '..', 'config', 'agents.default.json');

/**
 * Ajan roster'ini (API anahtarlari dahil) diskte tutar. `data/agents.json`
 * gitignore'dadir; ilk calistirmada `config/agents.default.json` icindeki
 * anahtarsiz varsayilan roster'dan kopyalanir.
 */
export class AgentStore {
  load(): AgentConfig[] {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    const defaults: AgentConfig[] = JSON.parse(fs.readFileSync(DEFAULT_FILE, 'utf-8'));
    this.save(defaults);
    return defaults;
  }

  save(agents: AgentConfig[]) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(agents, null, 2), 'utf-8');
  }
}
