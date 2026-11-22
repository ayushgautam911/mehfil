import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface QRBlockProps {
  code?: string | null;
  size?: number;
}

const N = 21;
const PAD = 6;

// Deterministic faux-QR rendered as a 21×21 module grid, green-on-black,
// seeded from `code`, with 3 finder squares. Ported from the design system
// QRPass primitive. (For production, swap for react-native-qrcode-svg.)
export default function QRBlock({ code = 'HIVE', size = 176 }: QRBlockProps) {
  const cells = useMemo(() => buildCells(code || 'HIVE'), [code]);
  const cellSize = (size - PAD * 2) / N;

  return (
    <View style={[styles.container, { width: size, height: size, padding: PAD }]}>
      {Array.from({ length: N }).map((_, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: N }).map((_, c) => (
            <View
              key={c}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cells[r * N + c] ? colors.green : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function buildCells(code: string): boolean[] {
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  const cells: boolean[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let on: boolean;
      if (isFinder(r, c)) {
        const rr = r >= N - 7 ? r - (N - 7) : r;
        const cc = c >= N - 7 ? c - (N - 7) : c;
        on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
      } else {
        on = rng() > 0.52;
      }
      cells.push(on);
    }
  }
  return cells;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
  },
  row: {
    flexDirection: 'row',
  },
});
