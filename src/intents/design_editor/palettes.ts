// Plagx Writer colours, copied from the shared tokens/colors.json.
// Every text colour meets WCAG AA (4.5:1) against its palette's background.

export type PaletteKey = "paper" | "ink";

export type Palette = {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  heading: string;
  emphasis: string;
  link: string;
  quote: string;
  accent: string;
};

export const PALETTES: Record<PaletteKey, Palette> = {
  paper: {
    bg: "#FBF8F1",
    surface: "#F3EEE3",
    border: "#DED6C6",
    text: "#2B2A27",
    muted: "#6B665C",
    heading: "#7A3E1D",
    emphasis: "#5B4A86",
    link: "#2F5D8A",
    quote: "#55663F",
    accent: "#2F5D8A",
  },
  ink: {
    bg: "#1C1F24",
    surface: "#22262C",
    border: "#30353D",
    text: "#DAD5C8",
    muted: "#9A9588",
    heading: "#E3AA70",
    emphasis: "#BBA6E6",
    link: "#7FB0DC",
    quote: "#AABA8F",
    accent: "#7FB0DC",
  },
};

// Order of swatches shown in the panel and inserted into the design.
export const SWATCH_KEYS: (keyof Palette)[] = [
  "bg",
  "surface",
  "text",
  "muted",
  "heading",
  "emphasis",
  "link",
  "quote",
];
