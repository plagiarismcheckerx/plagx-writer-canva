import { useFeatureSupport } from "@canva/app-hooks";
import {
  Button,
  FormField,
  Rows,
  SegmentedControl,
  Text,
  Title,
} from "@canva/app-ui-kit";
import {
  addElementAtCursor,
  addElementAtPoint,
  getCurrentPageContext,
  setCurrentPageBackground,
} from "@canva/design";
import { useState } from "react";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";
import type { Palette, PaletteKey } from "./palettes";
import { PALETTES, SWATCH_KEYS } from "./palettes";

type TextBlock = {
  key: string;
  label: string;
  sample: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  colorKey: keyof Palette;
};

export const App = () => {
  const intl = useIntl();
  const isSupported = useFeatureSupport();
  const [paletteKey, setPaletteKey] = useState<PaletteKey>("paper");
  const palette = PALETTES[paletteKey];

  const addElement = [addElementAtPoint, addElementAtCursor].find((fn) =>
    isSupported(fn),
  );
  const canSetBackground = isSupported(setCurrentPageBackground);

  const blocks: TextBlock[] = [
    {
      key: "title",
      label: intl.formatMessage({
        defaultMessage: "Title",
        description: "Button label: inserts a large title text",
      }),
      sample: intl.formatMessage({
        defaultMessage: "Feedback timing and revision quality",
        description: "Sample title text inserted into the design",
      }),
      fontSize: 52,
      fontWeight: "bold",
      fontStyle: "normal",
      colorKey: "heading",
    },
    {
      key: "heading",
      label: intl.formatMessage({
        defaultMessage: "Heading",
        description: "Button label: inserts a section heading",
      }),
      sample: intl.formatMessage({
        defaultMessage: "Method",
        description: "Sample heading text inserted into the design",
      }),
      fontSize: 38,
      fontWeight: "bold",
      fontStyle: "normal",
      colorKey: "heading",
    },
    {
      key: "body",
      label: intl.formatMessage({
        defaultMessage: "Body text",
        description: "Button label: inserts a paragraph of body text",
      }),
      sample: intl.formatMessage({
        defaultMessage:
          "Early feedback changes how students revise. Replace this text with your own paragraph.",
        description: "Sample body paragraph inserted into the design",
      }),
      fontSize: 25,
      fontWeight: "normal",
      fontStyle: "normal",
      colorKey: "text",
    },
    {
      key: "quote",
      label: intl.formatMessage({
        defaultMessage: "Quote",
        description: "Button label: inserts an italic quotation",
      }),
      sample: intl.formatMessage({
        defaultMessage: "“Students revised structure, not just wording.”",
        description: "Sample quotation inserted into the design",
      }),
      fontSize: 27,
      fontWeight: "normal",
      fontStyle: "italic",
      colorKey: "quote",
    },
    {
      key: "caption",
      label: intl.formatMessage({
        defaultMessage: "Caption",
        description: "Button label: inserts a small caption or source line",
      }),
      sample: intl.formatMessage({
        defaultMessage: "Source: Smith & Lee, 2020, p. 52",
        description: "Sample caption text inserted into the design",
      }),
      fontSize: 17,
      fontWeight: "normal",
      fontStyle: "normal",
      colorKey: "muted",
    },
  ];

  // Font sizes are designed for a 1000px-wide page and scaled to the real page.
  const getPageScale = async () => {
    const { dimensions } = await getCurrentPageContext();
    return dimensions ? dimensions : undefined;
  };

  const scaledSize = (size: number, pageWidth?: number) =>
    Math.min(100, Math.max(6, Math.round(size * ((pageWidth ?? 1000) / 1000))));

  const insertText = async (block: TextBlock) => {
    if (!addElement) {
      return;
    }
    const page = await getPageScale();
    const text = {
      type: "text" as const,
      children: [block.sample],
      fontSize: scaledSize(block.fontSize, page?.width),
      fontWeight: block.fontWeight,
      fontStyle: block.fontStyle,
      color: palette[block.colorKey],
    };
    if (page && isSupported(addElementAtPoint)) {
      // Give the text box a real width so Canva doesn't shrink it to fit.
      await addElementAtPoint({
        ...text,
        top: Math.round(page.height * 0.4),
        left: Math.round(page.width * 0.1),
        width: Math.round(page.width * 0.8),
      });
      return;
    }
    await addElement(text);
  };

  const canInsertShape = isSupported(addElementAtPoint);

  const canInsertSamplePage =
    isSupported(addElementAtPoint) && canSetBackground;

  const insertSamplePage = async () => {
    const page = await getPageScale();
    const width = page?.width ?? 1000;
    const height = page?.height ?? 750;
    await setCurrentPageBackground({ color: palette.bg });
    const left = Math.round(width * 0.1);
    const boxWidth = Math.round(width * 0.8);
    let top = Math.round(height * 0.1);
    for (const block of blocks) {
      const fontSize = scaledSize(block.fontSize, width);
      await addElementAtPoint({
        type: "text",
        children: [block.sample],
        fontSize,
        fontWeight: block.fontWeight,
        fontStyle: block.fontStyle,
        color: palette[block.colorKey],
        top,
        left,
        width: boxWidth,
      });
      // Rough line estimate so blocks don't overlap.
      const lines = Math.max(
        1,
        Math.ceil((block.sample.length * fontSize * 0.5) / boxWidth),
      );
      top += Math.round(lines * fontSize * 1.4 + fontSize * 0.9);
    }
  };

  const applyBackground = async () => {
    await setCurrentPageBackground({ color: palette.bg });
  };

  const insertPalette = async () => {
    if (!canInsertShape) {
      return;
    }
    // Canva allows at most 6 colours per shape, so the row is split into
    // shapes of 4 squares placed side by side.
    const perShape = 4;
    const size = 100;
    const gap = 20;
    const page = await getPageScale();
    const pageWidth = page?.width ?? 1000;
    const pageHeight = page?.height ?? 750;
    const total = SWATCH_KEYS.length;
    const rowWidth = Math.round(pageWidth * 0.8);
    const unit = rowWidth / (total * (size + gap) - gap);
    const squarePx = size * unit;
    const top = Math.round((pageHeight - squarePx) / 2);
    const left0 = (pageWidth - rowWidth) / 2;
    for (let start = 0; start < total; start += perShape) {
      const keys = SWATCH_KEYS.slice(start, start + perShape);
      const viewWidth = keys.length * (size + gap) - gap;
      await addElementAtPoint({
        type: "shape",
        top,
        left: Math.round(left0 + start * (size + gap) * unit),
        width: viewWidth * unit,
        height: squarePx,
        paths: keys.map((key, i) => {
          const x = i * (size + gap);
          return {
            d: `M ${x} 0 H ${x + size} V ${size} H ${x} Z`,
            fill: { dropTarget: false, color: palette[key] },
          };
        }),
        viewBox: { width: viewWidth, height: size, top: 0, left: 0 },
      });
    }
  };

  const setBackgroundColor = async (color: string) => {
    await setCurrentPageBackground({ color });
  };

  const unsupported = intl.formatMessage({
    defaultMessage: "This isn't supported in the current design",
    description: "Tooltip shown when the design type doesn't allow this action",
  });

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          {intl.formatMessage({
            defaultMessage:
              "Calm, readable colours for essays, reading guides, study notes and slides. Every text colour meets WCAG AA contrast on its background.",
            description: "Short introduction at the top of the app",
          })}
        </Text>

        <FormField
          label={intl.formatMessage({
            defaultMessage: "Palette",
            description: "Label for choosing the light or dark colour palette",
          })}
          value={paletteKey}
          control={(props) => (
            <SegmentedControl
              {...props}
              options={[
                {
                  value: "paper",
                  label: intl.formatMessage({
                    defaultMessage: "Paper (light)",
                    description: "Name of the light colour palette",
                  }),
                },
                {
                  value: "ink",
                  label: intl.formatMessage({
                    defaultMessage: "Ink (dark)",
                    description: "Name of the dark colour palette",
                  }),
                },
              ]}
              onChange={(value: PaletteKey) => setPaletteKey(value)}
            />
          )}
        />

        <div
          className={styles.swatchRow}
          aria-label={intl.formatMessage({
            defaultMessage: "Colours in this palette",
            description: "Accessible label for the row of colour previews",
          })}
        >
          {SWATCH_KEYS.map((key) => {
            const label = intl.formatMessage(
              {
                defaultMessage: "Use {color} as page background",
                description:
                  "Tooltip on a colour swatch; {color} is a hex colour code",
              },
              { color: palette[key] },
            );
            const pick = () => {
              if (canSetBackground) {
                setBackgroundColor(palette[key]);
              }
            };
            return (
              <div
                key={key}
                role="button"
                tabIndex={canSetBackground ? 0 : -1}
                aria-disabled={!canSetBackground}
                className={styles.swatch}
                style={{ background: palette[key] }}
                title={label}
                aria-label={label}
                onClick={pick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pick();
                  }
                }}
              />
            );
          })}
        </div>

        <Button
          variant="primary"
          stretch
          onClick={applyBackground}
          disabled={!canSetBackground}
          tooltipLabel={!canSetBackground ? unsupported : undefined}
        >
          {intl.formatMessage({
            defaultMessage: "Set page background",
            description:
              "Button: sets the current page background to the palette's background colour",
          })}
        </Button>

        <Title size="small">
          {intl.formatMessage({
            defaultMessage: "Insert text",
            description: "Section heading above the text style buttons",
          })}
        </Title>
        <Button
          variant="primary"
          stretch
          onClick={insertSamplePage}
          disabled={!canInsertSamplePage}
          tooltipLabel={!canInsertSamplePage ? unsupported : undefined}
        >
          {intl.formatMessage({
            defaultMessage: "Insert sample page",
            description:
              "Button: sets the background and adds a laid-out title, heading, body, quote and caption",
          })}
        </Button>
        {blocks.map((block) => (
          <Button
            key={block.key}
            variant="secondary"
            stretch
            onClick={() => insertText(block)}
            disabled={!addElement}
            tooltipLabel={!addElement ? unsupported : undefined}
          >
            {block.label}
          </Button>
        ))}

        <Title size="small">
          {intl.formatMessage({
            defaultMessage: "Colours",
            description: "Section heading above the palette button",
          })}
        </Title>
        <Button
          variant="secondary"
          stretch
          onClick={insertPalette}
          disabled={!canInsertShape}
          tooltipLabel={!canInsertShape ? unsupported : undefined}
        >
          {intl.formatMessage({
            defaultMessage: "Insert colour palette",
            description:
              "Button: inserts the palette's colours as squares into the design",
          })}
        </Button>
        <Text size="small" tone="tertiary">
          {intl.formatMessage({
            defaultMessage:
              'Tip: click a colour above to use it as the page background. After inserting the palette, pick these colours from Canva\'s colour menu under "Document colours".',
            description: "Hint about reusing the inserted colours",
          })}
        </Text>
      </Rows>
    </div>
  );
};
