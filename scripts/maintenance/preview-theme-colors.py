"""Preview translucent Catppuccin colors over a chosen palette background."""

import argparse
import sys
from dataclasses import dataclass
from typing import cast

type RGB = tuple[int, int, int]
type PaletteRow = tuple[str, str, str, RGB]

PALETTES: dict[str, dict[str, RGB]] = {
    "Latte": {
        "text": (76, 79, 105),
        "base": (239, 241, 245),
        "mantle": (230, 233, 239),
        "crust": (220, 224, 232),
    },
    "Mocha": {
        "text": (205, 214, 244),
        "base": (30, 30, 46),
        "mantle": (24, 24, 37),
        "crust": (17, 17, 27),
    },
}
COLOR_CHOICES = ("text", "base", "mantle", "crust")


class Args(argparse.Namespace):
    background: str
    color: str
    light_color: str | None
    dark_color: str | None
    opacity: float
    light_opacity: float | None
    dark_opacity: float | None
    css: bool
    css_var: str


@dataclass(frozen=True)
class Options:
    background: str
    light_color: str
    dark_color: str
    light_opacity: float
    dark_opacity: float
    css: bool
    css_var: str


def parse_args() -> Options:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--background",
        choices=COLOR_CHOICES,
        default="base",
        help="palette color behind the translucent color",
    )
    parser.add_argument(
        "--color",
        choices=COLOR_CHOICES,
        default="text",
        help="source color for both flavors unless overridden",
    )
    parser.add_argument(
        "--light-color",
        choices=COLOR_CHOICES,
        help="override --color for Latte",
    )
    parser.add_argument(
        "--dark-color",
        choices=COLOR_CHOICES,
        help="override --color for Mocha",
    )
    parser.add_argument(
        "--opacity",
        type=float,
        default=50,
        metavar="PERCENT",
        help="opacity for both flavors unless overridden",
    )
    parser.add_argument(
        "--light-opacity",
        type=float,
        metavar="PERCENT",
        help="override --opacity for Latte",
    )
    parser.add_argument(
        "--dark-opacity",
        type=float,
        metavar="PERCENT",
        help="override --opacity for Mocha",
    )
    parser.add_argument(
        "--css",
        action="store_true",
        help="print a CSS declaration",
    )
    parser.add_argument(
        "--css-var",
        default="--preview-color",
        metavar="NAME",
        help="custom property name used by --css",
    )
    args = parser.parse_args(namespace=Args())
    light_opacity = args.light_opacity or args.opacity
    dark_opacity = args.dark_opacity or args.opacity
    if any(not 0 <= opacity <= 100 for opacity in (light_opacity, dark_opacity)):
        parser.error("opacity percentages must be between 0 and 100")
    return Options(
        background=args.background,
        light_color=args.light_color or args.color or "text",
        dark_color=args.dark_color or args.color or "crust",
        light_opacity=light_opacity,
        dark_opacity=dark_opacity,
        css=args.css,
        css_var=args.css_var,
    )


def composite(foreground: RGB, background: RGB, opacity: float) -> RGB:
    """Return a translucent foreground composited onto an opaque background."""
    return cast(
        tuple[int, int, int],
        tuple(
            round(fg * opacity + bg * (1 - opacity))
            for fg, bg in zip(foreground, background)
        ),
    )


def palette(
    background: str,
    light_color: str,
    dark_color: str,
    light_opacity: float,
    dark_opacity: float,
) -> list[PaletteRow]:
    """Return background, source, and composite rows for both flavors."""
    rows = []
    for flavor, color, opacity in (
        ("Latte", light_color, light_opacity),
        ("Mocha", dark_color, dark_opacity),
    ):
        colors = PALETTES[flavor]
        rows.extend(
            [
                (
                    flavor,
                    f"{background} background",
                    "",
                    colors[background],
                ),
                (
                    flavor,
                    f"{color} composite",
                    f"{opacity:g}%",
                    composite(colors[color], colors[background], opacity / 100),
                ),
                (
                    flavor,
                    f"{color} source",
                    "",
                    colors[color],
                ),
            ]
        )
    return rows


def print_css(
    css_var: str,
    light_color: str,
    dark_color: str,
    light_opacity: float,
    dark_opacity: float,
) -> None:
    light, dark = (
        f"color-mix(in srgb, var(--ctp-{color}) {opacity:g}%, transparent)"
        for color, opacity in (
            (light_color, light_opacity),
            (dark_color, dark_opacity),
        )
    )
    if light == dark:
        print(f"{css_var}: {light};")
    else:
        print(
            "\n".join(
                [
                    f"{css_var}: light-dark(",
                    f"  {light},",
                    f"  {dark}",
                    ");",
                ]
            )
        )


def print_table(rows: list[PaletteRow]) -> None:
    show_preview = sys.stdout.isatty()
    headers = ("flavor", "color", "opacity", "hex", "rgb")
    values = [
        (
            flavor,
            name,
            opacity,
            f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}",
            str(rgb),
        )
        for flavor, name, opacity, rgb in rows
    ]
    widths = [
        max(len(header), *(len(row[index]) for row in values))
        for index, header in enumerate(headers)
    ]
    preview_width = len("preview")
    print(
        "  ".join(
            [
                *(f"{header:<{width}}" for header, width in zip(headers, widths)),
                *(["preview"] if show_preview else []),
            ]
        )
    )
    for row, (_, _, _, rgb) in zip(values, rows):
        print(
            "  ".join(
                [
                    *(f"{value:<{width}}" for value, width in zip(row, widths)),
                    *(
                        [
                            f"\x1b[48;2;{rgb[0]};{rgb[1]};{rgb[2]}m{'':{preview_width}}\x1b[0m"
                        ]
                        if show_preview
                        else []
                    ),
                ]
            )
        )


def main() -> None:
    args = parse_args()
    if args.css:
        print_css(
            args.css_var,
            args.light_color,
            args.dark_color,
            args.light_opacity,
            args.dark_opacity,
        )
    else:
        print_table(
            palette(
                args.background,
                args.light_color,
                args.dark_color,
                args.light_opacity,
                args.dark_opacity,
            )
        )


if __name__ == "__main__":
    main()
