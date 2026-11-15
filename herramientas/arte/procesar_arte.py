"""Art pipeline: AI-generated sprite sheets -> web-ready WebP sprites + animations.

Re-runnable and deterministic (fixed RNG seeds). From the repo root:

    python -I herramientas/arte/procesar_arte.py
    python -I herramientas/arte/procesar_arte.py --preview <dir>   # + contact sheets

Inputs : herramientas/arte/fuentes/*.jpg   (AI-generated sheets, black background)
Outputs: frontend/public/assets/art/{sprites,bg,anim}/...
         frontend/src/data/artManifest.ts  (generated, do not edit by hand)

Rules (AGENTS.md): no NASA logo assets (the NASA-logotype rocket, the
"meatball" turret and the flag-patch astronauts of sheet 10 are never cut),
and AI-made backgrounds/animations carry a visible "AI-generated art" mark.
"""
from __future__ import annotations

import argparse
import math
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage as ndi

sys.dont_write_bytecode = True  # keep herramientas/arte free of __pycache__
sys.path.insert(0, str(Path(__file__).resolve().parent))
from segmentar import SheetParams, cut_sprite, find_components, fit_max_side  # noqa: E402

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SRC = HERE / "fuentes"
OUT = REPO / "frontend" / "public" / "assets" / "art"
MANIFEST = REPO / "frontend" / "src" / "data" / "artManifest.ts"
PUBLIC_PREFIX = "/assets/art"

MAX_SIDE = 512
SPRITE_QUALITY = 85
WATERMARK = "AI-generated art"

GROUPS = ("planets", "vehicles", "astronauts", "equipment", "terrain", "parts")


# --------------------------------------------------------------------------
# Name maps. Each entry matches the component whose bbox has the best IoU
# with ``box`` (bboxes as printed by --preview / component dump, in source
# pixels of the 2000x1116 sheet). ``clip`` restricts the cut to rectangles.
# Anything not listed is skipped (debris, fragments, excluded logo assets).
# --------------------------------------------------------------------------
@dataclass
class Entry:
    name: str
    group: str
    box: tuple[int, int, int, int]
    clip: list[tuple[int, int, int, int]] | None = None
    # Recolour a red cross to green: the red cross on white is a protected
    # emblem (Geneva Conventions) and must not be used as a med-kit icon.
    red_to_green: bool = False


@dataclass
class Sheet:
    key: str          # output folder: sprites/<key>/
    file: str         # source file in fuentes/
    params: SheetParams
    entries: list[Entry] = field(default_factory=list)


E = Entry
SHEETS: list[Sheet] = [
    Sheet("sheet3", "sheet_equipo_a.jpg", SheetParams(), [
        E("rover-small", "vehicles", (53, 33, 342, 311)),
        E("rover-solar", "vehicles", (369, 80, 741, 313)),
        E("battery-green", "equipment", (836, 52, 938, 189)),
        E("battery-charge", "equipment", (944, 52, 1046, 188)),
        E("battery-pack-mli", "equipment", (834, 197, 1046, 331)),
        E("fuel-tank", "equipment", (1071, 60, 1204, 339)),
        E("pressure-tank", "equipment", (1217, 41, 1424, 343)),
        E("generator", "equipment", (1470, 95, 1725, 305)),
        E("crate-orange", "equipment", (1755, 52, 1949, 191)),
        E("crate-green", "equipment", (1756, 196, 1950, 338)),
        E("o2-bottle", "equipment", (51, 397, 132, 652)),
        E("gas-bottle-green", "equipment", (155, 401, 247, 652)),
        E("gas-bottle-silver", "equipment", (265, 401, 363, 652)),
        E("supply-canister", "equipment", (382, 429, 492, 523)),
        E("power-pack", "equipment", (508, 431, 620, 514)),
        E("sample-jar", "equipment", (384, 536, 442, 651)),
        E("med-kit", "equipment", (463, 530, 614, 649)),
        E("backpack", "equipment", (635, 470, 774, 651)),
        E("antenna-mast", "equipment", (835, 377, 984, 680)),
        E("dish-antenna", "equipment", (1002, 399, 1148, 679)),
        E("dish-antenna-b", "equipment", (1163, 399, 1345, 676)),
        E("robotic-arm", "equipment", (1368, 425, 1600, 667)),
        E("drill", "equipment", (1674, 427, 1852, 573)),
        E("drill-hand", "equipment", (1517, 523, 1667, 667)),
        E("sampler-tool", "equipment", (1652, 522, 1838, 673)),
        E("core-drill", "equipment", (1864, 427, 1948, 668)),
        E("girders", "parts", (51, 731, 460, 950)),
        E("girder-beam", "parts", (52, 905, 462, 1075)),
        E("mli-foil", "parts", (477, 733, 717, 942)),
        E("mli-foil-scrap", "parts", (488, 951, 708, 1075)),
        E("cables", "parts", (730, 749, 1082, 835)),
        E("hull-panel", "parts", (742, 900, 973, 1075)),
        E("metal-shard-a", "parts", (987, 851, 1102, 964)),
        E("metal-shard-b", "parts", (1077, 922, 1198, 1040)),
        E("cable-bundle", "parts", (1406, 766, 1732, 1071)),
        E("hose", "parts", (1507, 845, 1733, 927)),
        E("console", "equipment", (1746, 766, 1950, 887)),
        E("data-case", "equipment", (1746, 896, 1867, 971)),
        E("mini-display", "equipment", (1880, 895, 1949, 971)),
        E("handheld-terminal", "equipment", (1584, 986, 1756, 1074)),
        E("jar-small", "equipment", (1767, 1010, 1841, 1075)),
        E("vial", "equipment", (1847, 983, 1888, 1074)),
        E("jar-orange", "equipment", (1893, 979, 1948, 1074)),
    ]),
    Sheet("sheet4", "sheet_vehiculos_astronautas.jpg", SheetParams(), [
        E("rover-tracked", "vehicles", (70, 47, 910, 533)),
        E("habitat-module", "vehicles", (946, 33, 1634, 551)),
        E("astronaut-float-a", "astronauts", (1682, 50, 1953, 538)),
        E("astronaut-float-b", "astronauts", (96, 582, 364, 1060)),
        E("satellite", "vehicles", (469, 604, 1353, 1076)),
        E("supply-kit", "equipment", (1503, 621, 1883, 811)),
        E("crate-tan", "equipment", (1262, 887, 1517, 1068)),
        E("backpack-b", "equipment", (1522, 867, 1715, 1045)),
        E("o2-bottle-b", "equipment", (1689, 855, 1947, 1072)),
    ]),
    Sheet("sheet5", "nave_espacial.jpg", SheetParams(t_lo=10.0, t_hi=40.0, dilate=10), [
        E("spaceship", "vehicles", (80, 225, 1917, 876)),
    ]),
    Sheet("sheet6", "sheet_partes_rover.jpg", SheetParams(t_lo=8.0, t_hi=30.0, fill_holes_max=1800), [
        E("rover-exploded", "vehicles", (52, 11, 1967, 1109)),
        E("track-segment", "parts", (52, 11, 1967, 1109), clip=[(55, 842, 622, 1105)]),
        E("solar-panel", "parts", (1381, 16, 1972, 277), clip=[(1381, 16, 1677, 277)]),
        E("solar-panel-b", "parts", (1381, 16, 1972, 277), clip=[(1677, 16, 1972, 277)]),
        E("vent-grille", "parts", (525, 228, 657, 321)),
        E("vent-grille-b", "parts", (23, 683, 133, 821)),
        E("vent-grille-c", "parts", (143, 733, 255, 815)),
        E("power-cell", "parts", (1347, 268, 1543, 438)),
        E("camera-a", "parts", (1612, 295, 1746, 379)),
        E("camera-b", "parts", (1758, 284, 1964, 378)),
        E("ladder", "parts", (16, 429, 110, 664)),
        E("foil-sheet", "parts", (1746, 388, 1893, 525)),
        E("foil-sheets-box", "parts", (1550, 563, 1749, 817)),
        E("canister", "parts", (1901, 390, 1970, 528)),
        E("gear", "parts", (1793, 883, 1871, 975)),
        E("light-module", "parts", (1879, 889, 1948, 961)),
    ]),
    Sheet("sheet8", "planetas.jpg", SheetParams(t_lo=5.0, t_hi=30.0, t_mask=14.0, dilate=8, fill_holes_max=10**7), [
        E("planet-mars", "planets", (63, 14, 602, 553)),
        E("planet-moon", "planets", (738, 20, 1263, 548)),
        E("asteroid-a", "planets", (1410, 23, 1823, 485)),
        E("asteroid-b", "planets", (736, 568, 1237, 1060)),
        E("planet-earth", "planets", (1395, 562, 1932, 1103)),
    ]),
    Sheet("sheet9", "sheet_terreno.jpg", SheetParams(t_lo=8.0, t_hi=34.0, fill_holes_max=10**6), [
        E("terrain-mars-strip", "terrain", (18, 10, 368, 95)),
        E("terrain-mars-strip-b", "terrain", (19, 104, 368, 195)),
        E("terrain-mars-rocks", "terrain", (378, 27, 804, 191)),
        E("terrain-mars-crater", "terrain", (810, 50, 1214, 191)),
        E("terrain-mars-ice", "terrain", (1219, 55, 1489, 191)),
        E("habitat-tent-mars", "terrain", (1492, 18, 1723, 191)),
        E("rock-mars", "terrain", (1754, 26, 1860, 112)),
        E("sample-bag-mars", "equipment", (1885, 18, 1966, 115)),
        E("drill-bit", "equipment", (1899, 133, 1953, 338)),
        E("terrain-mars-cliffs", "terrain", (19, 205, 369, 353)),
        E("terrain-mars-dune", "terrain", (373, 222, 671, 353)),
        E("terrain-mars-dunes", "terrain", (674, 224, 1191, 353)),
        E("habitat-greenhouse-mars", "terrain", (1194, 212, 1724, 353)),
        E("rock-mars-b", "terrain", (1730, 156, 1899, 251)),
        E("rock-grey", "terrain", (1761, 258, 1877, 353)),
        E("terrain-moon-strip", "terrain", (20, 370, 368, 439)),
        E("terrain-moon-strip-b", "terrain", (19, 447, 368, 569)),
        E("terrain-moon-strip-c", "terrain", (19, 579, 368, 685)),
        E("terrain-moon-craters", "terrain", (374, 374, 662, 685)),
        E("terrain-moon-rocks", "terrain", (672, 381, 950, 531)),
        E("terrain-moon-tile", "terrain", (956, 390, 1110, 531)),
        E("terrain-moon-tile-b", "terrain", (1114, 374, 1277, 547)),
        E("terrain-moon-rocks-b", "terrain", (673, 543, 926, 685)),
        E("terrain-moon-tile-c", "terrain", (1114, 563, 1276, 706)),
        E("habitat-moon-base", "terrain", (1281, 374, 1731, 549)),
        E("habitat-moon-module", "terrain", (1281, 552, 1982, 706)),
        E("rock-moon", "terrain", (1749, 367, 1889, 458)),
        E("regolith-pile", "terrain", (1734, 472, 1898, 558)),
        E("drill-bit-b", "equipment", (1914, 354, 1943, 557)),
        E("asteroid-chunk-a", "terrain", (20, 708, 237, 924)),
        E("asteroid-metal-a", "terrain", (263, 711, 438, 919)),
        E("asteroid-metal-b", "terrain", (462, 709, 662, 934)),
        E("asteroid-crater", "terrain", (684, 712, 915, 929)),
        E("asteroid-probe", "terrain", (925, 720, 1118, 916)),
        E("asteroid-probe-b", "terrain", (1343, 711, 1484, 918)),
        E("rock-small", "terrain", (1673, 720, 1780, 807)),
        E("terrain-mars-mound", "terrain", (1604, 814, 1982, 925)),
        E("asteroid-chunk-b", "terrain", (24, 964, 151, 1098)),
        E("asteroid-chunk-c", "terrain", (311, 988, 400, 1074)),
        E("sample-bag-a", "equipment", (422, 985, 519, 1099)),
        E("sample-bag-b", "equipment", (535, 985, 632, 1099)),
        E("sample-bag-c", "equipment", (646, 985, 744, 1099)),
        E("sample-bag-d", "equipment", (758, 985, 855, 1099)),
        E("drill-bit-c", "equipment", (877, 972, 914, 1103)),
        E("rock-mars-c", "terrain", (920, 1026, 1014, 1095)),
        E("drill-bit-d", "equipment", (1015, 969, 1065, 1101)),
        E("terrain-mars-hill", "terrain", (1174, 947, 1596, 1103)),
        E("terrain-mars-trench", "terrain", (1604, 955, 1982, 1103)),
    ]),
    # Sheet 10: EXCLUDED on purpose -> the big rocket with the "NASA"
    # logotype (box 24,352,1212,650) and every astronaut (agency patches /
    # US flags: boxes at x>=1196, y 349..1106 except tanks and dishes).
    Sheet("sheet10", "sheet_cohetes_capsulas.jpg", SheetParams(), [
        E("rocket-stage", "vehicles", (28, 19, 787, 342)),
        E("control-panel", "equipment", (817, 21, 1025, 180)),
        E("mli-panel", "parts", (1032, 46, 1108, 140)),
        E("solar-array", "parts", (1108, 22, 1302, 179)),
        E("comm-relay", "vehicles", (1322, 20, 1572, 330)),
        E("capsule", "vehicles", (1562, 27, 1974, 319)),
        E("cargo-module", "parts", (815, 194, 1023, 348)),
        E("dish-instrument", "parts", (1028, 189, 1269, 353)),
        E("camera-module", "parts", (1289, 228, 1411, 314)),
        E("service-module", "vehicles", (26, 667, 264, 821)),
        E("docking-module", "vehicles", (279, 665, 479, 822)),
        E("launch-tower-small", "vehicles", (489, 701, 625, 1105)),
        E("launch-tower", "vehicles", (648, 615, 1173, 1105)),
        E("capsule-b", "vehicles", (26, 802, 420, 1106)),
        E("gantry-stairs", "parts", (828, 1001, 1181, 1106)),
        E("fuel-tank-tall", "equipment", (1197, 745, 1319, 1106)),
        E("fuel-tank-tall-b", "equipment", (1330, 745, 1453, 1106)),
        E("dish-gold", "equipment", (1479, 913, 1626, 1107)),
        E("dish-white", "equipment", (1648, 914, 1795, 1107)),
        E("satellite-small", "vehicles", (1815, 916, 1978, 1107)),
    ]),
    # Sheet 11: EXCLUDED on purpose -> the turret with the NASA "meatball"
    # logo (box 1194,30,1543,350).
    Sheet("sheet11", "sheet_equipo_b.jpg", SheetParams(), [
        E("excavator", "vehicles", (32, 21, 574, 349)),
        E("drill-rig", "equipment", (613, 32, 708, 349)),
        E("gas-tank-array", "equipment", (748, 22, 1120, 350)),
        E("drone", "vehicles", (1563, 23, 1977, 241)),
        E("solar-flag", "parts", (1698, 284, 1955, 421)),
        E("robotic-arm-b", "equipment", (32, 386, 385, 647)),
        E("stairs", "parts", (999, 401, 1252, 665)),
        E("platform", "parts", (1251, 384, 1623, 666)),
        E("ramp", "parts", (1599, 437, 1969, 638)),
        E("generator-b", "equipment", (425, 453, 731, 651)),
        E("generator-c", "equipment", (747, 451, 970, 646)),
        E("sign-high-voltage", "equipment", (42, 680, 158, 836)),
        E("sign-radiation", "equipment", (177, 680, 292, 836)),
        E("beacon-red", "equipment", (308, 664, 403, 848)),
        E("beacon-pair", "equipment", (408, 662, 599, 847)),
        E("console-dual", "equipment", (622, 706, 983, 808)),
        E("satellite-debris", "parts", (1031, 704, 1388, 1072)),
        E("debris-bent", "parts", (1401, 699, 1621, 853)),
        E("debris-panel", "parts", (1656, 717, 1826, 923)),
        E("debris-chunk", "parts", (996, 759, 1135, 924)),
        E("debris-pipe", "parts", (1319, 859, 1643, 972)),
        E("debris-pipe-b", "parts", (1167, 997, 1469, 1094)),
        E("debris-plate", "parts", (1482, 956, 1627, 1096)),
        E("ore-rock", "terrain", (1824, 800, 1965, 912)),
        E("ore-rock-b", "terrain", (1642, 949, 1787, 1094)),
        E("ore-rock-c", "terrain", (1794, 941, 1970, 1095)),
        E("fuel-pump", "equipment", (34, 871, 226, 1097)),
        E("tool-case", "equipment", (224, 928, 419, 1095)),
        E("printer-3d", "equipment", (443, 876, 621, 1097)),
        E("scanner", "equipment", (644, 943, 746, 1096)),
        E("flashlight", "equipment", (765, 929, 821, 1096)),
        E("med-kit-white", "equipment", (841, 960, 994, 1096), red_to_green=True),
    ]),
]


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def iou(a: tuple[int, int, int, int], b: tuple[int, int, int, int]) -> float:
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    ua = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / ua if ua else 0.0


def camel(name: str) -> str:
    parts = name.replace("_", "-").split("-")
    s = parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])
    return ("n" + s) if s[:1].isdigit() else s


def font(size: int) -> ImageFont.ImageFont:
    for f in ("arialbd.ttf", "arial.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def watermark(im: Image.Image, size: int, margin: int) -> Image.Image:
    """Small but legible 'AI-generated art' tag in the bottom-right corner."""
    base = im.convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = font(size)
    x0, y0, x1, y1 = d.textbbox((0, 0), WATERMARK, font=f)
    tw, th = x1 - x0, y1 - y0
    pad = max(3, size // 3)
    bx = base.width - margin - tw - 2 * pad
    by = base.height - margin - th - 2 * pad
    d.rounded_rectangle((bx, by, bx + tw + 2 * pad, by + th + 2 * pad), radius=pad, fill=(0, 0, 0, 120))
    d.text((bx + pad - x0, by + pad - y0), WATERMARK, font=f, fill=(255, 255, 255, 190))
    return Image.alpha_composite(base, layer).convert(im.mode)


def red_cross_to_green(im: Image.Image) -> Image.Image:
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    red = (r > 110) & (r > 1.6 * g) & (r > 1.6 * b)
    out = a.copy()
    out[..., 0] = np.where(red, g * 0.6 + 20, r)
    out[..., 1] = np.where(red, r * 0.72, g)
    out[..., 2] = np.where(red, b * 0.8 + 40, b)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def rel(p: Path) -> str:
    return PUBLIC_PREFIX + "/" + p.relative_to(OUT).as_posix()


# --------------------------------------------------------------------------
# sprites
# --------------------------------------------------------------------------
@dataclass
class SpriteOut:
    name: str
    group: str
    path: Path
    width: int
    height: int
    image: Image.Image
    origin: tuple[int, int]   # top-left of the cut in sheet pixels
    scale: float              # output px per sheet px


def build_sprites() -> list[SpriteOut]:
    out: list[SpriteOut] = []
    seen: set[str] = set()
    for sh in SHEETS:
        rgb = np.asarray(Image.open(SRC / sh.file).convert("RGB"))
        labels, comps = find_components(rgb, sh.params)
        folder = OUT / "sprites" / sh.key
        folder.mkdir(parents=True, exist_ok=True)
        for e in sh.entries:
            assert e.group in GROUPS, e
            assert e.name not in seen, f"duplicate sprite name {e.name}"
            seen.add(e.name)
            best = max(comps, key=lambda c: iou(c.bbox, e.box), default=None)
            if best is None or iou(best.bbox, e.box) < 0.6:
                print(f"  ! {sh.key}/{e.name}: no component matches {e.box}")
                continue
            lab = labels
            if e.clip:
                keep = np.zeros(labels.shape, dtype=bool)
                for (x0, y0, x1, y1) in e.clip:
                    keep[y0:y1, x0:x1] = True
                lab = np.where(keep, labels, 0)
            cut = cut_sprite(rgb, lab, [best.label], sh.params)
            if cut is None:
                print(f"  ! {sh.key}/{e.name}: empty cut")
                continue
            im, origin = cut
            full_w = im.width
            if e.red_to_green:
                im = red_cross_to_green(im)
            im = fit_max_side(im, MAX_SIDE)
            p = folder / f"{e.name}.webp"
            im.save(p, "WEBP", quality=SPRITE_QUALITY, method=6, alpha_quality=90)
            out.append(SpriteOut(e.name, e.group, p, im.width, im.height, im, origin, im.width / full_w))
        print(f"  {sh.key}: {sum(1 for s in out if s.path.parent == folder)} sprites")
    return out


# --------------------------------------------------------------------------
# backgrounds
# --------------------------------------------------------------------------
def build_backgrounds() -> dict[str, tuple[Path, int, int]]:
    src = Image.open(SRC / "fondo_nebulosa.jpg").convert("RGB")
    res: dict[str, tuple[Path, int, int]] = {}
    (OUT / "bg").mkdir(parents=True, exist_ok=True)
    for key, w, fs in (("nebula", 1920, 18), ("nebulaSm", 960, 12)):
        h = round(src.height * w / src.width)
        im = src.resize((w, h), Image.Resampling.LANCZOS)
        im = watermark(im, fs, margin=max(8, fs // 2 + 4))
        p = OUT / "bg" / ("nebula.webp" if key == "nebula" else "nebula-sm.webp")
        im.save(p, "WEBP", quality=82, method=6)
        res[key] = (p, w, h)
    return res


# --------------------------------------------------------------------------
# procedural thruster flame (8-frame strip, 128x256 each, nozzle at top)
# --------------------------------------------------------------------------
FLAME_FRAMES = 8
FLAME_W, FLAME_H = 128, 256


def smooth_noise(rng: np.random.Generator, h: int, w: int, cell: int) -> np.ndarray:
    gh, gw = h // cell + 3, w // cell + 3
    g = rng.random((gh, gw)).astype(np.float32)
    z = ndi.zoom(g, (cell, cell), order=3)
    return z[cell:cell + h, cell:cell + w]


def flame_frame(i: int, n: int, w: int = FLAME_W, h: int = FLAME_H, seed: int = 7) -> Image.Image:
    rng = np.random.default_rng(seed + i * 101)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = i / n
    length = h * (0.80 + 0.10 * math.sin(2 * math.pi * t) + 0.06 * math.sin(6 * math.pi * t + 1.3))
    y = yy / max(length, 1.0)
    # noise: big wobble + fine turbulence that scrolls downwards
    n1 = smooth_noise(rng, h, w, 32) - 0.5
    n2 = smooth_noise(rng, h, w, 10) - 0.5
    cx = w / 2 + n1 * 10.0 * np.clip(y, 0, 1)
    half = (w * 0.36) * np.power(np.clip(1.0 - y, 0, 1), 0.5) * (0.9 + 0.25 * np.exp(-((y - 0.12) ** 2) / 0.01))
    half = np.maximum(half, 1e-3)
    dx = np.abs(xx - cx) / half
    body = np.clip(1.0 - dx, 0, 1) ** 1.2 * np.clip(1.0 - y, 0, 1) ** 0.7
    body *= (yy < length).astype(np.float32)
    body = np.clip(body + n2 * 0.35 * body, 0, 1)
    core = np.clip(1.0 - dx / 0.45, 0, 1) * np.clip(1.0 - y / 0.45, 0, 1)
    glow_r = np.sqrt(((xx - w / 2) / (w * 0.5)) ** 2 + ((yy - 6) / (h * 0.22)) ** 2)
    glow = np.clip(1.0 - glow_r, 0, 1) ** 2 * 0.55
    inten = np.clip(np.maximum(body, glow) + core * 0.6, 0, 1)
    # colour ramp: deep red -> orange -> yellow -> white core
    stops = np.array([0.0, 0.25, 0.55, 0.8, 1.0], dtype=np.float32)
    cols = np.array([[120, 20, 0], [235, 80, 10], [255, 160, 30], [255, 225, 110], [255, 255, 235]], dtype=np.float32)
    rgb = np.stack([np.interp(inten, stops, cols[:, k]) for k in range(3)], axis=-1)
    alpha = np.clip(inten * 1.6, 0, 1) ** 0.9
    img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
    return img.filter(ImageFilter.GaussianBlur(1.6))


def build_thruster_strip() -> tuple[Path, list[Image.Image]]:
    frames = [flame_frame(i, FLAME_FRAMES) for i in range(FLAME_FRAMES)]
    strip = Image.new("RGBA", (FLAME_W * FLAME_FRAMES, FLAME_H), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        strip.paste(f, (i * FLAME_W, 0))
    (OUT / "anim").mkdir(parents=True, exist_ok=True)
    p = OUT / "anim" / "thruster-flame.webp"
    strip.save(p, "WEBP", quality=88, alpha_quality=95, method=6)
    return p, frames


# --------------------------------------------------------------------------
# astronaut float (animated, transparent)
# --------------------------------------------------------------------------
ASTRO_FRAMES = 24
ASTRO_MS = 83
ASTRO_SPRITE_H = 232
ASTRO_CANVAS = (240, 288)


def build_astronaut(sprites: dict[str, SpriteOut]) -> tuple[Path, int, int]:
    s = sprites["astronaut-float-a"].image
    k = ASTRO_SPRITE_H / s.height
    s = s.resize((round(s.width * k), ASTRO_SPRITE_H), Image.Resampling.LANCZOS)
    cw, ch = ASTRO_CANVAS
    frames = []
    for i in range(ASTRO_FRAMES):
        t = 2 * math.pi * i / ASTRO_FRAMES
        rot = 5.0 * math.sin(t + math.pi / 3)
        dy = 11.0 * math.sin(t)
        r = s.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
        fr = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        fr.alpha_composite(r, (round((cw - r.width) / 2), round((ch - r.height) / 2 + dy)))
        frames.append(fr)
    p = OUT / "anim" / "astronaut-float.webp"
    frames[0].save(p, "WEBP", save_all=True, append_images=frames[1:], duration=ASTRO_MS,
                   loop=0, quality=72, alpha_quality=85, method=6, background=(0, 0, 0, 0))
    return p, cw, ch


# --------------------------------------------------------------------------
# loading loop (animated, 960x540, seamless)
# --------------------------------------------------------------------------
LOOP_W, LOOP_H = 960, 540
LOOP_FRAMES = 60
LOOP_MS = 56            # ~18 fps -> 3.36 s loop
LOOP_MAX_BYTES = 2_500_000


def star_layer(rng: np.random.Generator, n: int, w: int, h: int):
    xs = rng.uniform(0, w, n)
    ys = rng.uniform(0, h, n)
    size = rng.choice([1.0, 1.4, 2.0, 2.8], n, p=[0.5, 0.28, 0.15, 0.07])
    base = rng.uniform(0.35, 1.0, n)
    freq = rng.integers(1, 4, n)          # integer cycles per loop -> seamless
    phase = rng.uniform(0, 2 * math.pi, n)
    tint = rng.choice([0, 1, 2], n, p=[0.6, 0.25, 0.15])
    return xs, ys, size, base, freq, phase, tint


def draw_stars(frame: np.ndarray, stars, t: float, shift: tuple[float, float]) -> None:
    xs, ys, size, base, freq, phase, tint = stars
    h, w, _ = frame.shape
    colours = np.array([[1.0, 1.0, 1.0], [0.75, 0.85, 1.0], [1.0, 0.8, 0.6]], dtype=np.float32)
    for x, y, s, b, f, ph, tn in zip(xs, ys, size, base, freq, phase, tint):
        a = b * (0.55 + 0.45 * math.sin(2 * math.pi * f * t + ph))
        px = (x + shift[0]) % w
        py = (y + shift[1]) % h
        r = int(math.ceil(s * 3))
        x0, x1 = int(px) - r, int(px) + r + 1
        y0, y1 = int(py) - r, int(py) + r + 1
        if x0 < 0 or y0 < 0 or x1 > w or y1 > h:
            continue
        gy, gx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        d2 = (gx - px) ** 2 + (gy - py) ** 2
        g = np.exp(-d2 / (2 * (s * 0.6) ** 2)) * a
        if s >= 2.0:  # little cross flare on the bright ones
            g += a * 0.5 * (np.exp(-((gy - py) ** 2) / 0.6) * np.exp(-((gx - px) ** 2) / (s * 3) ** 2)
                            + np.exp(-((gx - px) ** 2) / 0.6) * np.exp(-((gy - py) ** 2) / (s * 3) ** 2))
        frame[y0:y1, x0:x1] += g[..., None] * colours[tn] * 255.0


def build_loading_loop(sprites: dict[str, SpriteOut], flames: list[Image.Image]) -> tuple[Path, int]:
    rng = np.random.default_rng(2026)
    bg_src = Image.open(SRC / "fondo_nebulosa.jpg").convert("RGB")
    sw, sh = bg_src.size

    # parallax pan along a closed ellipse + breathing zoom -> seamless
    base_scale = LOOP_W / (sw * 0.84)   # show ~84% of the source width
    pan_x, pan_y, zoom_amp = 0.035 * sw, 0.025 * sh, 0.035

    stars_far = star_layer(rng, 110, LOOP_W, LOOP_H)
    stars_near = star_layer(rng, 45, LOOP_W, LOOP_H)

    # asteroid drift layer (sprites from the terrain sheet)
    rock_names = ["asteroid-chunk-a", "asteroid-metal-a", "asteroid-crater", "asteroid-chunk-b",
                  "asteroid-chunk-c", "asteroid-metal-b", "rock-small"]
    rocks = []
    wrap = LOOP_W + 240
    for j, nm in enumerate(rock_names):
        im = sprites[nm].image
        target = float(rng.uniform(26, 70))
        k = target / max(im.size)
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.Resampling.LANCZOS)
        # darken a bit so they read as silhouettes against the nebula
        arr = np.asarray(im).astype(np.float32)
        arr[..., :3] *= 0.62
        im = Image.fromarray(arr.astype(np.uint8), "RGBA")
        laps = 1 if j % 2 else 2           # integer wraps per loop -> seamless
        rocks.append(dict(im=im, x0=float(rng.uniform(0, wrap)), y=float(rng.uniform(40, LOOP_H - 60)),
                          laps=laps, spin=int(rng.choice([-1, 1])), bob=float(rng.uniform(4, 10)),
                          ph=float(rng.uniform(0, 2 * math.pi))))

    ship_sp = sprites["spaceship"]
    ship_w = 330
    k = ship_w / ship_sp.image.width
    ship = ship_sp.image.resize((ship_w, round(ship_sp.image.height * k)), Image.Resampling.LANCZOS)
    # main nozzle exits of the 5.jpg ship, in sheet pixels
    nozzles_src = [(212, 382), (212, 683)]
    s_tot = ship_sp.scale * k
    nozzles = [((x - ship_sp.origin[0]) * s_tot, (y - ship_sp.origin[1]) * s_tot) for x, y in nozzles_src]
    flame_small = [f.rotate(-90, expand=True).resize((96, 46), Image.Resampling.LANCZOS) for f in flames]

    frames: list[Image.Image] = []
    for i in range(LOOP_FRAMES):
        t = i / LOOP_FRAMES
        th = 2 * math.pi * t
        z = base_scale * (1.0 + zoom_amp * (0.5 - 0.5 * math.cos(th)))
        cx = sw / 2 + pan_x * math.cos(th)
        cy = sh / 2 + pan_y * math.sin(th)
        # affine: output (u,v) -> source (x,y)
        a, e = 1 / z, 1 / z
        c = cx - (LOOP_W / 2) / z
        f_ = cy - (LOOP_H / 2) / z
        bg = bg_src.transform((LOOP_W, LOOP_H), Image.Transform.AFFINE, (a, 0, c, 0, e, f_),
                              resample=Image.Resampling.BICUBIC)
        arr = np.asarray(bg).astype(np.float32)
        far_shift = (-pan_x * math.cos(th) * z * 0.4, -pan_y * math.sin(th) * z * 0.4)
        near_shift = (-pan_x * math.cos(th) * z * 1.6, -pan_y * math.sin(th) * z * 1.6)
        draw_stars(arr, stars_far, t, far_shift)
        draw_stars(arr, stars_near, t, near_shift)
        frame = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")

        for r in rocks:
            x = (r["x0"] - r["laps"] * wrap * t) % wrap - 120
            y = r["y"] + r["bob"] * math.sin(th + r["ph"])
            im = r["im"].rotate(r["spin"] * 360.0 * t, resample=Image.Resampling.BICUBIC, expand=True)
            frame.alpha_composite(im, (round(x - im.width / 2), round(y - im.height / 2)))

        # ship glides left -> right once per loop; off-screen at the seam
        sx = -ship.width - 60 + (LOOP_W + ship.width + 120) * t
        sy = LOOP_H * 0.52 - ship.height / 2 + 10 * math.sin(th)
        fl = flame_small[(i * 3) % len(flame_small)]
        glow_a = 0.75 + 0.25 * math.sin(th * 9)
        for nx, ny in nozzles:
            g = fl.copy()
            if glow_a < 1:
                ga = np.asarray(g).astype(np.float32)
                ga[..., 3] *= glow_a
                g = Image.fromarray(ga.astype(np.uint8), "RGBA")
            px, py = round(sx + nx - g.width + 10), round(sy + ny - g.height / 2)
            if -g.width < px < LOOP_W:
                frame.alpha_composite(g, (max(px, 0), py), (max(0, -px), 0))
        if -ship.width < sx < LOOP_W:
            frame.alpha_composite(ship, (max(round(sx), 0), round(sy)), (max(0, -round(sx)), 0))

        frame = watermark(frame.convert("RGB"), 13, 8)
        frames.append(frame)

    p = OUT / "anim" / "loading-loop.webp"
    for q in (72, 64, 56, 48, 40, 32):
        frames[0].save(p, "WEBP", save_all=True, append_images=frames[1:], duration=LOOP_MS,
                       loop=0, quality=q, method=4)
        size = p.stat().st_size
        print(f"  loading-loop q={q}: {size / 1e6:.2f} MB")
        if size <= LOOP_MAX_BYTES:
            break
    return p, LOOP_FRAMES


# --------------------------------------------------------------------------
# manifest
# --------------------------------------------------------------------------
def write_manifest(sprites: list[SpriteOut], bgs: dict[str, tuple[Path, int, int]],
                   loop_path: Path, flame_path: Path, astro: tuple[Path, int, int]) -> None:
    L: list[str] = []
    L.append("// AUTO-GENERATED by herramientas/arte/procesar_arte.py — do not edit by hand.")
    L.append("// Re-run: python -I herramientas/arte/procesar_arte.py")
    L.append("// All art is AI-generated (see referencias.md); show the global 'AI-generated art' label.")
    L.append("")
    L.append("export interface ArtImage {")
    L.append("  readonly src: string;")
    L.append("  readonly width: number;")
    L.append("  readonly height: number;")
    L.append("}")
    L.append("")
    L.append("export interface ArtAnimation extends ArtImage {")
    L.append("  readonly frames: number;")
    L.append("  readonly fps: number;")
    L.append("}")
    L.append("")
    L.append("export interface ArtStrip extends ArtImage {")
    L.append("  readonly frames: number;")
    L.append("  readonly frameWidth: number;")
    L.append("  readonly frameHeight: number;")
    L.append("}")
    L.append("")

    def img(src: str, w: int, h: int) -> str:
        return f"{{ src: '{src}', width: {w}, height: {h} }}"

    L.append("export const ART = {")
    L.append("  bg: {")
    for key, (p, w, h) in bgs.items():
        L.append(f"    {key}: {img(rel(p), w, h)},")
    L.append("  },")
    L.append("  anim: {")
    L.append(f"    loadingLoop: {{ src: '{rel(loop_path)}', width: {LOOP_W}, height: {LOOP_H}, "
             f"frames: {LOOP_FRAMES}, fps: {round(1000 / LOOP_MS, 2)} }},")
    L.append(f"    thrusterFlame: {{ src: '{rel(flame_path)}', width: {FLAME_W * FLAME_FRAMES}, height: {FLAME_H}, "
             f"frames: {FLAME_FRAMES}, frameWidth: {FLAME_W}, frameHeight: {FLAME_H} }},")
    ap, aw, ah = astro
    L.append(f"    astronautFloat: {{ src: '{rel(ap)}', width: {aw}, height: {ah}, "
             f"frames: {ASTRO_FRAMES}, fps: {round(1000 / ASTRO_MS, 2)} }},")
    L.append("  },")
    for g in GROUPS:
        L.append(f"  {g}: {{")
        for s in sorted((s for s in sprites if s.group == g), key=lambda s: s.name):
            L.append(f"    {camel(s.name)}: {img(rel(s.path), s.width, s.height)},")
        L.append("  },")
    L.append("} as const;")
    L.append("")
    L.append("export type ArtGroup = keyof typeof ART;")
    L.append("export type SpriteGroup = Exclude<ArtGroup, 'bg' | 'anim'>;")
    L.append("")
    MANIFEST.write_text("\n".join(L), encoding="utf-8", newline="\n")


# --------------------------------------------------------------------------
# preview contact sheets (optional, for checking the name maps)
# --------------------------------------------------------------------------
def write_previews(sprites: list[SpriteOut], outdir: Path) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    cell = 200
    f = font(14)
    for sh in SHEETS:
        items = [s for s in sprites if s.path.parent.name == sh.key]
        if not items:
            continue
        cols = 6
        rows = math.ceil(len(items) / cols)
        board = Image.new("RGB", (cols * cell, rows * (cell + 22)), (40, 44, 60))
        d = ImageDraw.Draw(board)
        for i, s in enumerate(items):
            x, y = (i % cols) * cell, (i // cols) * (cell + 22)
            # checker so alpha problems are visible
            for cy in range(0, cell, 20):
                for cx in range(0, cell, 20):
                    if (cx // 20 + cy // 20) % 2:
                        d.rectangle((x + cx, y + cy, x + cx + 19, y + cy + 19), fill=(70, 76, 96))
            im = s.image.copy()
            im.thumbnail((cell - 8, cell - 8))
            board.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2), im)
            d.text((x + 4, y + cell + 3), s.name, font=f, fill=(255, 255, 255))
        board.save(outdir / f"preview_{sh.key}.png")


# --------------------------------------------------------------------------
def dir_size(p: Path) -> int:
    return sum(f.stat().st_size for f in p.rglob("*") if f.is_file())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--preview", type=Path, help="write contact sheets of the cut sprites here")
    args = ap.parse_args()

    if (OUT / "sprites").exists():
        shutil.rmtree(OUT / "sprites")   # stale names from older name maps
    print("sprites:")
    sprites = build_sprites()
    by_name = {s.name: s for s in sprites}
    print("backgrounds:")
    bgs = build_backgrounds()
    print("animations:")
    flame_path, flames = build_thruster_strip()
    astro = build_astronaut(by_name)
    loop_path, _ = build_loading_loop(by_name, flames)
    write_manifest(sprites, bgs, loop_path, flame_path, astro)
    if args.preview:
        write_previews(sprites, args.preview)
    print(f"done: {len(sprites)} sprites, total {dir_size(OUT) / 1e6:.2f} MB in {OUT}")
    print(f"manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
