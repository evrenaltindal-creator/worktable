/** Koleksiyon ile içindeki oyunlar arasındaki bağlantı */
import { createContext, useContext, useEffect } from 'react';

export type GameId = 'mahjong' | 'sudoku' | 'mines' | 'bubbles' | 'jewels' | 'colorpop' | 'jigsaw' | 'words' | 'cube';

export interface Hub {
  /** Oyundan çıkıp bir önceki ekrana (koleksiyon ya da Mahjong) dön */
  exit: () => void;
  /** Başka bir oyunu aç (ör. Mahjong içinden Küp) */
  open: (id: GameId) => void;
  /** Oyun kendi ana sayfasında mı: "Koleksiyon" düğmesi yalnız orada görünür */
  setAtHome: (atHome: boolean) => void;
}

export const HubContext = createContext<Hub>({ exit: () => {}, open: () => {}, setAtHome: () => {} });

export function useHub(atHome: boolean): Hub {
  const hub = useContext(HubContext);
  useEffect(() => {
    hub.setAtHome(atHome);
  }, [hub, atHome]);
  return hub;
}
