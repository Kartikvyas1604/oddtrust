export const fonts = {
  display: '"Fraunces", serif',
  mono: '"Martian Mono", monospace',
} as const;

export const fontWeights = {
  display: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  mono: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
} as const;
