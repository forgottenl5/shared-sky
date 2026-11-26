# 26 Nov 2026: labels corrected to the PHYS1 figures; the raw renders were not kept, so docs/img was relabelled in place by painting over the old label.
# Adds a city name and headline to each home-page thumbnail (also used as the link-preview image). Source images are the committed raw renders.
from PIL import Image, ImageDraw, ImageFont
S='<scratchpad>/'
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
items={'houston':('HOUSTON','61% fewer planned conflicts','realistic flights, shared heights (corrected 26 Nov)'),
       'dfw':('DALLAS–FORT WORTH','72% fewer planned conflicts','realistic flights, shared heights (corrected 26 Nov)'),
       'airtaxi':('AIR TAXIS · DFW + HOUSTON','Simulated networks in 3D','pads, parking, batteries, noise')}
for k,(kick,big,sm) in items.items():
    im=Image.open(S+f'raw_{k}.jpg').convert('RGBA'); w,h=im.size
    ov=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(ov)
    for y in range(h//2,h): d.line([(0,y),(w,y)],fill=(3,6,12,int(235*max(0.0,(y-h/2)/(h/2))**1.3)))
    im=Image.alpha_composite(im,ov); d=ImageDraw.Draw(im)
    d.text((26,h-112),kick,font=ImageFont.truetype(B,17),fill=(255,233,168,255))
    d.text((24,h-88),big,font=ImageFont.truetype(B,34),fill=(234,241,251,255))
    d.text((26,h-44),sm,font=ImageFont.truetype(R,18),fill=(159,177,200,255))
    im.convert('RGB').save(f'<repo>/docs/img/{k}.jpg',quality=80,optimize=True)
print('ok')
