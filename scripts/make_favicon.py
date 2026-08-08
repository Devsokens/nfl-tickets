from PIL import Image
import os

SRC = r"public/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"
SCRATCH = r"C:\Users\HPVICT~1\AppData\Local\Temp\claude\c--Users-HP-VICTUS-AMD-RYZEN5-Desktop-SOKENS-DIGITAL-CLIENTS-NFL\5ccc41fa-46dd-4496-91ce-49fb6575b862\scratchpad"

img = Image.open(SRC).convert("RGBA")
bbox = img.getbbox()
cropped = img.crop(bbox)  # 473x196, origin now (0,0)

# Isolate just the "NFL" wordmark + gold square accent (exclude tagline below, drum to the right)
wide = cropped.crop((0, 0, 305, 148))
tight_bbox = wide.getbbox()
print("tight bbox within wide region:", tight_bbox)
nfl_only = wide.crop(tight_bbox)
nfl_only.save(os.path.join(SCRATCH, "step2_nfl_only.png"))
print("nfl_only size:", nfl_only.size)
