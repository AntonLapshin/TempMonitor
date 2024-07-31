import { styled } from "../stitches.config";

export const Flex = styled("div", {
  display: "flex",
  alignItems: "center",
});

export const Row = styled(Flex, {
  flexDirection: "row",
});

export const Col = styled(Flex, {
  flexDirection: "column",
});

export const H1 = styled("h1", {
  color: "white",
  lineHeight: 1,
  textShadow: "5px 5px 9px #6a6a6a",
  fontSize: "1.5rem",
});

export const Text = styled("span", {
  color: "$subtle",
  lineHeight: 1,
  variants: {
    small: {
      true: {
        fontSize: 12,
      },
    },
    color: {
      base: {
        color: "$base",
      },
      subtle: {
        color: "$subtle",
      },
    },
  },
  defaultVariants: {
    color: "base",
  },
});

export const Grid = styled("div", {
  display: "grid",
});

export const Grid2Cols = styled(Grid, {
  gridTemplateColumns: "1fr 1fr",
});

export const Hr = styled("hr", {
  width: "100%",
  height: 1,
  border: 'none',
  backgroundColor: '#161616'
});
