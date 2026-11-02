"""Builds the Canva listing images (icon + featured images) from the app screenshots.
Run: python build.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
FONTS = Path("C:/Windows/Fonts")

PAPER = {"bg": "#FBF8F1", "surface": "#F3EEE3", "border": "#DED6C6", "text": "#2B2A27",
         "muted": "#6B665C", "heading": "#7A3E1D"}
INK = {"bg": "#1C1F24", "surface": "#22262C", "text": "#DAD5C8", "muted": "#9A9588",
       "heading": "#E3AA70"}
PAPER["swatches"] = ["#F3EEE3", "#2B2A27", "#7A3E1D", "#5B4A86", "#2F5D8A", "#55663F"]
INK["swatches"] = ["#22262C", "#DAD5C8", "#E3AA70", "#BBA6E6", "#7FB0DC", "#AABA8F"]


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def icon():
    s = 512
    img = Image.new("RGB", (s, s), PAPER["bg"])
    d = ImageDraw.Draw(img)
    # Ink triangle in the bottom-right half: Paper and Ink in one mark.
    d.polygon([(s, 0), (s, s), (0, s)], fill=INK["bg"])
    f = font("georgiab.ttf", 250)
    # "A" on paper, "a" on ink.
    d.text((150, 210), "A", font=f, fill=PAPER["heading"], anchor="mm")
    d.text((350, 330), "a", font=f, fill=INK["heading"], anchor="mm")
    img.save(OUT / "icon-512.png")


def rounded(im, radius):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def featured(shot, title, subtitle, theme, name):
    w, h = 2400, 1800
    img = Image.new("RGB", (w, h), theme["surface"])
    d = ImageDraw.Draw(img)
    d.text((w // 2, 210), title, font=font("georgiab.ttf", 110), fill=theme["heading"], anchor="mm")
    d.text((w // 2, 345), subtitle, font=font("segoeui.ttf", 56), fill=theme["muted"], anchor="mm")

    sh = Image.open(HERE / shot).convert("RGB")
    target_w = 2160
    sh = sh.resize((target_w, round(sh.height * target_w / sh.width)), Image.LANCZOS)
    x = (w - sh.width) // 2
    y = 470
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([x, y + 18, x + sh.width, y + sh.height + 18], 28,
                                             fill=(0, 0, 0, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))
    img.paste(shadow, (0, 0), shadow)
    sh = rounded(sh, 28)
    img.paste(sh, (x, y), sh)

    # Colour strip under the screenshot.
    sw, gap = 90, 26
    total = len(theme["swatches"]) * sw + (len(theme["swatches"]) - 1) * gap
    sx = (w - total) // 2
    sy = y + sh.height + 70
    for i, c in enumerate(theme["swatches"]):
        d.rounded_rectangle([sx + i * (sw + gap), sy, sx + i * (sw + gap) + sw, sy + sw], 18,
                            fill=c, outline=theme.get("border", theme["muted"]), width=2)
    img.save(OUT / name, optimize=True)


icon()
featured("1-paper-app.png", "Calm colours for writing",
         "Insert a styled sample page in one click", PAPER, "featured-1-paper.png")
featured("2-ink-app.png", "A dark palette for reading",
         "Switch between Paper (light) and Ink (dark)", INK, "featured-2-ink.png")
featured("3-palette-app.png", "Reuse the palette anywhere",
         "Click a colour to set the page background", PAPER, "featured-3-palette.png")
print("done")
