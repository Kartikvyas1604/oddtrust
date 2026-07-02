export const colors = {
  bg: {
    void: '#0A0D0B',
    panel: '#121815',
    raised: '#1A2320',
  },
  line: {
    hairline: '#253029',
  },
  pitch: {
    green: '#39FF6A',
    dim: '#1E7A3E',
  },
  signal: {
    amber: '#FFB13C',
    red: '#FF4D4D',
  },
  trophy: {
    gold: '#D4AF6A',
  },
  text: {
    primary: '#E9F2EC',
    secondary: '#8FA398',
    tertiary: '#4E5D55',
  },
} as const;

export type ColorKey = keyof typeof colors;
