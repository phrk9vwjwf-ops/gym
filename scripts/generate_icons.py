#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

SIZES = [180, 192, 512]
BG_COLOR = (0x0E, 0x12, 0x16)  # dark background from TZ
ACCENT_COLOR = (0x5A, 0xA9, 0xF5)  # accent from TZ

def create_icon(size):
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    # Draw a simple white letter 'З' (Cyrillic Ze) in center? Too complex.
    # Instead draw a white circle in center with accent color ring?
    # Let's draw a white circle with accent border.
    padding = size // 8
    bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(bbox, fill=(255,255,255))
    # inner circle
    inner_pad = padding * 2
    inner_bbox = [inner_pad, inner_pad, size - inner_pad, size - inner_pad]
    draw.ellipse(inner_bbox, fill=BG_COLOR)
    return img

if __name__ == '__main__':
    public_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(public_dir, exist_ok=True)
    for s in SIZES:
        img = create_icon(s)
        img.save(os.path.join(public_dir, f'icon-{s}.png'), 'PNG')
        print(f'Generated icon-{s}.png')