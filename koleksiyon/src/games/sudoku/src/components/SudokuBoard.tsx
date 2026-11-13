import { memo, useEffect, useMemo, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { box, col, row } from '../game/sudoku';

const native = Platform.OS !== 'web';

export const BOARD = {
  frame: '#8A5A22',
  cell: '#FFFBF0',
  peer: '#F1E4C3',
  same: '#F6D98A',
  selected: '#FFD54F',
  wrongBg: '#F8D3CF',
  given: '#1B2A4A',
  user: '#1F5FA8',
  wrong: '#C42F2A',
  note: '#5B6B86',
};

interface CellProps {
  index: number;
  value: number;
  notes: number;
  given: boolean;
  wrong: boolean;
  bg: string;
  size: number;
  left: number;
  top: number;
  onPress: (i: number) => void;
}

const Cell = memo(function Cell({ index, value, notes, given, wrong, bg, size, left, top, onPress }: CellProps) {
  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityRole="button"
      accessibilityLabel={`${row(index) + 1}-${col(index) + 1}${value ? `: ${value}` : ''}`}
      style={[styles.cell, { left, top, width: size, height: size, backgroundColor: bg }]}
    >
      {value ? (
        <Text
          style={[
            styles.value,
            { fontSize: size * 0.64, lineHeight: size * 0.9, color: wrong ? BOARD.wrong : given ? BOARD.given : BOARD.user },
            given && styles.givenWeight,
          ]}
        >
          {value}
        </Text>
      ) : notes ? (
        <View style={styles.notes}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <Text key={d} style={[styles.note, { width: size / 3, height: size / 3, fontSize: size * 0.27, lineHeight: size / 3 }]}>
              {notes & (1 << d) ? d : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
});

interface Props {
  size: number;
  values: number[];
  notes: number[];
  given: boolean[];
  solution: number[];
  selected: number | null;
  showMistakes: boolean;
  highlightSame: boolean;
  /** Yeni tamamlanan satır/sütun/kutu hücreleri (parlama) */
  flash: { cells: number[]; id: number } | null;
  onSelect: (i: number) => void;
}

/** Hücre yerleşimi: kutular arası kalın, hücreler arası ince çizgi */
export function boardGeometry(size: number) {
  const outer = Math.max(3, size * 0.012);
  const thin = 1;
  const thick = Math.max(2.5, size * 0.008);
  const cell = (size - outer * 2 - thin * 6 - thick * 2) / 9;
  const pos = (k: number) => outer + k * cell + (k - Math.floor(k / 3)) * thin + Math.floor(k / 3) * thick;
  return { cell, pos };
}

function SudokuBoardView({ size, values, notes, given, solution, selected, showMistakes, highlightSame, flash, onSelect }: Props) {
  const { cell, pos } = useMemo(() => boardGeometry(size), [size]);
  const [glow] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!flash) return;
    glow.setValue(1);
    Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: native }).start();
  }, [flash, glow]);

  const selValue = selected !== null ? values[selected] : 0;

  return (
    <View style={[styles.board, { width: size, height: size, borderRadius: size * 0.025 }]}>
      {values.map((v, i) => {
        let bg = BOARD.cell;
        const wrong = showMistakes && v !== 0 && v !== solution[i];
        if (selected !== null) {
          if (i === selected) bg = BOARD.selected;
          else if (highlightSame && selValue && v === selValue) bg = BOARD.same;
          else if (row(i) === row(selected) || col(i) === col(selected) || box(i) === box(selected)) bg = BOARD.peer;
        }
        if (wrong && i !== selected) bg = BOARD.wrongBg;
        return (
          <Cell
            key={i}
            index={i}
            value={v}
            notes={notes[i]}
            given={given[i]}
            wrong={wrong}
            bg={bg}
            size={cell}
            left={pos(col(i))}
            top={pos(row(i))}
            onPress={onSelect}
          />
        );
      })}
      {flash
        ? flash.cells.map((i) => (
            <Animated.View
              key={`${flash.id}-${i}`}
              pointerEvents="none"
              style={[styles.flash, { left: pos(col(i)), top: pos(row(i)), width: cell, height: cell, opacity: glow }]}
            />
          ))
        : null}
    </View>
  );
}

export const SudokuBoard = memo(SudokuBoardView);

const styles = StyleSheet.create({
  board: {
    backgroundColor: BOARD.frame,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '700', textAlign: 'center' },
  givenWeight: { fontWeight: '900' },
  notes: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%' },
  note: { textAlign: 'center', color: BOARD.note, fontWeight: '700' },
  flash: { position: 'absolute', backgroundColor: 'rgba(255,200,40,0.75)' },
});
