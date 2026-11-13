import { BoosterKind, Boosters } from '../boosters';
import { Settings } from '../storage';

/** Yeni oyun ekranlarının ortak özellikleri */
export interface ModeScreenProps {
  level: number;
  settings: Settings;
  boosters: Boosters;
  onUseBooster: (kind: BoosterKind) => void;
  /** Seviye kazanıldı (1-3 yıldız) */
  onWin: (stars: number) => void;
  onNext: () => void;
  onHome: () => void;
  onGames: () => void;
}
