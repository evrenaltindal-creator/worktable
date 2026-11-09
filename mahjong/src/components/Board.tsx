import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Pos, layoutBounds } from '../game/layouts';
import { Tile, TileLook } from './Tile';

/** Taş yüzünün en/boy oranı (çizimlerle aynı: 88 x 116) */
const FACE_RATIO = 116 / 88;
const DEPTH_RATIO = 0.14;

interface Props {
  positions: Pos[];
  faces: string[];
  present: boolean[];
  free: Set<number>;
  selected: number | null;
  hint: [number, number] | null;
  highlightFree: boolean;
  shake: { index: number; nonce: number } | null;
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
  const { positions, faces, present, free, selected, hint, highlightFree, shake, width, height, onTilePress } = props;
  const m = useMemo(() => boardMetrics(positions, width, height), [positions, width, height]);

  const cellW = m.faceW + m.depth;
  const cellH = m.faceH + m.depth;
  const offsetX = (width - m.boardW) / 2;
  const offsetY = (height - m.boardH) / 2;

  return (
    <View style={{ width, height }}>
      {positions.map((p, i) => {
        let look: TileLook = 'normal';
        if (selected === i) look = 'selected';
        else if (hint && (hint[0] === i || hint[1] === i)) look = 'hint';
        else if (highlightFree && present[i] && !free.has(i)) look = 'blocked';
        const left = offsetX + ((p.x - m.b.minX) / 2) * cellW + (m.b.maxZ - p.z) * m.depth;
        const top = offsetY + ((p.y - m.b.minY) / 2) * cellH + (m.b.maxZ - p.z) * m.depth;
        return (
          <Tile
            key={i}
            index={i}
            face={faces[i]}
            left={left}
            top={top}
            faceW={m.faceW}
            faceH={m.faceH}
            depth={m.depth}
            look={look}
            raised={p.z > 0}
            removed={!present[i]}
            shake={shake && shake.index === i ? shake.nonce : 0}
            onPress={onTilePress}
          />
        );
      })}
    </View>
  );
}

export const Board = memo(BoardView);
