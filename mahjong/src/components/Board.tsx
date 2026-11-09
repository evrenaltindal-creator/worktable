import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Pos, layoutBounds } from '../game/layouts';
import { MatchBurst } from './Effects';
import { Tile, TileLook } from './Tile';

/** Taş yüzünün en/boy oranı (çizimlerle aynı: 88 x 116) */
const FACE_RATIO = 116 / 88;
const DEPTH_RATIO = 0.14;

export interface Burst {
  id: number;
  a: number;
  b: number;
  points: number;
  label: string | null;
}

interface Props {
  positions: Pos[];
  faces: string[];
  present: boolean[];
  history: [number, number][];
  free: Set<number>;
  selected: number | null;
  hint: [number, number] | null;
  highlightFree: boolean;
  shake: { index: number; nonce: number } | null;
  bursts: Burst[];
  width: number;
  height: number;
  onTilePress: (index: number) => void;
}

export function boardMetrics(positions: Pos[], width: number, height: number) {
  const b = layoutBounds(positions);
  const cols = (b.maxX - b.minX + 2) / 2;
  const rows = (b.maxY - b.minY + 2) / 2;
  const kW = cols * (1 + DEPTH_RATIO) + b.maxZ * DEPTH_RATIO;
  const kH = rows * (FACE_RATIO + DEPTH_RATIO) + b.maxZ * DEPTH_RATIO;
  const faceW = Math.max(10, Math.min(width / kW, height / kH, 130));
  const faceH = faceW * FACE_RATIO;
  const depth = faceW * DEPTH_RATIO;
  const boardW = kW * faceW;
  const boardH = kH * faceW;
  return { b, faceW, faceH, depth, boardW, boardH };
}

function BoardView(props: Props) {
  const { positions, faces, present, history, free, selected, hint, highlightFree, shake, bursts, width, height, onTilePress } = props;
  const m = useMemo(() => boardMetrics(positions, width, height), [positions, width, height]);

  // Her taşın ekrandaki sol-üst köşesi
  const spots = useMemo(() => {
    const cellW = m.faceW + m.depth;
    const cellH = m.faceH + m.depth;
    const offsetX = (width - m.boardW) / 2;
    const offsetY = (height - m.boardH) / 2;
    return positions.map((p) => ({
      left: offsetX + ((p.x - m.b.minX) / 2) * cellW + (m.b.maxZ - p.z) * m.depth,
      top: offsetY + ((p.y - m.b.minY) / 2) * cellH + (m.b.maxZ - p.z) * m.depth,
    }));
  }, [positions, m, width, height]);

  // Kalkan her taş eşine doğru yarı yola uçar
  const partner = useMemo(() => {
    const map = new Map<number, number>();
    for (const [a, b] of history) {
      map.set(a, b);
      map.set(b, a);
    }
    return map;
  }, [history]);

  const introStep = Math.min(14, 1100 / Math.max(1, positions.length));

  return (
    <View style={{ width, height }}>
      {positions.map((p, i) => {
        let look: TileLook = 'normal';
        if (selected === i) look = 'selected';
        else if (hint && (hint[0] === i || hint[1] === i)) look = 'hint';
        else if (highlightFree && present[i] && !free.has(i)) look = 'blocked';
        const j = !present[i] ? partner.get(i) : undefined;
        const flyX = j !== undefined ? (spots[j].left - spots[i].left) / 2 : 0;
        const flyY = j !== undefined ? (spots[j].top - spots[i].top) / 2 : 0;
        return (
          <Tile
            key={i}
            index={i}
            face={faces[i]}
            left={spots[i].left}
            top={spots[i].top}
            faceW={m.faceW}
            faceH={m.faceH}
            depth={m.depth}
            look={look}
            raised={p.z > 0}
            removed={!present[i]}
            flyX={flyX}
            flyY={flyY}
            introDelay={i * introStep}
            shake={shake && shake.index === i ? shake.nonce : 0}
            onPress={onTilePress}
          />
        );
      })}
      {bursts.map((bu) => {
        const a = spots[bu.a];
        const b = spots[bu.b];
        return (
          <MatchBurst
            key={bu.id}
            x={(a.left + b.left) / 2 + m.faceW / 2}
            y={(a.top + b.top) / 2 + m.faceH / 2}
            size={m.faceW}
            points={bu.points}
            label={bu.label}
          />
        );
      })}
    </View>
  );
}

export const Board = memo(BoardView);
