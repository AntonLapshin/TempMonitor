import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      gray400: "gainsboro",
      gray500: "lightgray",
      subtle: "#919191",
      base: '#131313',
      borderColor: '#ececec'
    },
  },
  media: {
    bp1: "(min-width: 480px)",
  },
});
