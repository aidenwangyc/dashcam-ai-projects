from pathlib import Path
from io import BytesIO
import json
import sys

from openpyxl import load_workbook
from openpyxl.utils import get_column_letter
from PIL import Image, ImageDraw, ImageFont


sys.stdout.reconfigure(encoding='utf-8')
SOURCE = Path('C:/Users/Administrator/Desktop/VM-R&D- VM REC - VM FEEDBACK - 04092026.xlsx')
OUT = Path(__file__).parent
OUT.mkdir(exist_ok=True)
sheet = load_workbook(SOURCE, data_only=False)['6-REPORT']
rows = []
for row in sheet:
    cells = {cell.coordinate: cell.value for cell in row if cell.value is not None}
    if cells:
        rows.append(cells)
(OUT / 'source_cells.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2, default=str), encoding='utf-8')

font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 19)
images = []
manifest = []
for index, embedded in enumerate(sheet._images):
    anchor = embedded.anchor._from
    coord = f'{get_column_letter(anchor.col + 1)}{anchor.row + 1}'
    picture = Image.open(BytesIO(embedded._data())).convert('RGB')
    output = OUT / f'image_{index:02d}_{coord}.png'
    picture.save(output)
    images.append((index, coord, picture))
    manifest.append({'index': index, 'anchor': coord, 'path': str(output.resolve()), 'size': picture.size})

for offset in range(0, len(images), 20):
    group = images[offset:offset + 20]
    cell_w, cell_h = 410, 465
    canvas = Image.new('RGB', (cell_w * 5, cell_h * 4), '#e5e7eb')
    draw = ImageDraw.Draw(canvas)
    for slot, (index, coord, picture) in enumerate(group):
        left = (slot % 5) * cell_w
        top = (slot // 5) * cell_h
        draw.rectangle((left + 5, top + 5, left + cell_w - 5, top + cell_h - 5), fill='white')
        draw.text((left + 12, top + 10), f'Image {index:02d} | {coord}', fill='black', font=font)
        thumb = picture.copy()
        thumb.thumbnail((cell_w - 24, cell_h - 50))
        canvas.paste(thumb, (left + (cell_w - thumb.width) // 2, top + 42))
    canvas.save(OUT / f'contact_{offset // 20 + 1}.jpg', quality=92)

(OUT / 'images.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps({'source_rows': len(rows), 'embedded_images': len(images), 'contact_sheets': 3}, ensure_ascii=False))
