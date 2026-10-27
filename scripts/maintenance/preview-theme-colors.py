"""Preview translucent Catppuccin colors across an opacity range."""

import argparse
from collections.abc import Iterator
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import cast

type RGB = tuple[int, int, int]

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
PREVIEW_BORDER_COLS = 5
PREVIEW_CENTER_COLS = 16
PREVIEW_BORDER_ROWS = 2
PREVIEW_CENTER_ROWS = 3


class Args(argparse.Namespace):
    background: str
    color: str
    light_color: str | None
    dark_color: str | None
    opacity: list[Decimal]
    css_var: str


@dataclass(frozen=True)
class Options:
    background: str
    light_color: str
    dark_color: str
    start: Decimal
    end: Decimal
    step: Decimal
    css_var: str


def decimal_type(value: str) -> Decimal:
    try:
        return Decimal(value)
    except InvalidOperation as error:
        raise argparse.ArgumentTypeError(f"invalid percentage: {value}") from error


def parse_args() -> Options:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--background",
        choices=COLOR_CHOICES,
        default="base",
        help="palette color in the preview's center",
    )
    parser.add_argument(
        "--color",
        choices=COLOR_CHOICES,
        default="text",
        help="overlay color for both flavors unless overridden",
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
        nargs=3,
        type=decimal_type,
        required=True,
        metavar=("START", "END", "STEP"),
        help="inclusive percentage range and increment",
    )
    parser.add_argument(
        "--css-var",
        default="--preview-color",
        metavar="NAME",
        help="custom property name printed before each preview",
    )
    args = parser.parse_args(namespace=Args())
    start, end, step = args.opacity
    if not all(value.is_finite() for value in (start, end, step)):
        parser.error("opacity values must be finite")
    if not 0 <= start <= end <= 100 or step <= 0:
        parser.error("opacity must satisfy 0 <= START <= END <= 100 and STEP > 0")
    return Options(
        background=args.background,
        light_color=args.light_color or args.color,
        dark_color=args.dark_color or args.color,
        start=start,
        end=end,
        step=step,
        css_var=args.css_var,
    )


def composite(foreground: RGB, background: RGB, opacity: Decimal) -> RGB:
    fraction = opacity / 100
    return cast(
        RGB,
        tuple(
            round(Decimal(fg) * fraction + Decimal(bg) * (1 - fraction))
            for fg, bg in zip(foreground, background)
        ),
    )


def percentage_text(value: Decimal) -> str:
    text = format(value, "f")
    return text.rstrip("0").rstrip(".") if "." in text else text


def color_block(rgb: RGB, width: int) -> str:
    """Return spaces with a 24-bit ANSI background color."""
    return f"\x1b[48;2;{rgb[0]};{rgb[1]};{rgb[2]}m{'':{width}}\x1b[0m"


def print_preview(background: RGB, overlay: RGB) -> None:
    border = color_block(
        overlay,
        PREVIEW_BORDER_COLS,
    )
    center = color_block(
        background,
        PREVIEW_CENTER_COLS,
    )
    outside = color_block(
        overlay,
        2 * PREVIEW_BORDER_COLS + PREVIEW_CENTER_COLS,
    )

    print(
        "\n".join(
            [outside] * PREVIEW_BORDER_ROWS
            + [border + center + border] * PREVIEW_CENTER_ROWS
            + [outside] * PREVIEW_BORDER_ROWS
        )
    )


def print_css(css_var: str, color: str, opacity: Decimal) -> None:
    print(
        f"{css_var}: color-mix(in srgb, var(--ctp-{color}) {percentage_text(opacity)}%, transparent);"
    )


def opacities(start: Decimal, end: Decimal, step: Decimal) -> Iterator[Decimal]:
    count = int((end - start) // step) + 1
    for index in range(count):
        yield start + index * step


def main() -> None:
    options = parse_args()

    for opacity in opacities(options.start, options.end, options.step):
        for flavor, color in (
            ("Latte", options.light_color),
            ("Mocha", options.dark_color),
        ):
            palette = PALETTES[flavor]
            background = palette[options.background]
            overlay = composite(palette[color], background, opacity)

            print(f"/* {flavor}: {percentage_text(opacity)}% */")
            print_css(options.css_var, color, opacity)
            print_preview(background, overlay)
            print()


if __name__ == "__main__":
    main()
