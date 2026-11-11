import sys, subprocess
from PIL import Image, ImageFilter, ImageDraw, ImageFont, ImageEnhance
ep, t, l1, l2, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
src=f'/home/claude/rv/videos-ados/fil-d-or-{int(ep):02d}.mp4'
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',t,'-i',src,'-frames:v','1','/tmp/w/f.png'],check=True)
f=Image.open('/tmp/w/f.png').convert('RGB')  # 1080x1920
W,H=1280,720
bg=f.resize((W, int(W*1920/1080))).crop((0,300,W,300+H)).filter(ImageFilter.GaussianBlur(28))
bg=ImageEnhance.Brightness(bg).enhance(0.45)
# character crop: upper-middle part of the vertical frame (faces)
fg=f.crop((0,470,1080,1210)).resize((760,520))
grad=Image.new('L',(760,520)); gd=ImageDraw.Draw(grad)
for x in range(760):
  for y0 in (0,):
    pass
for x in range(760): gd.line((x,0,x,520),fill=255 if x<560 else int(255*(760-x)/200))
vg=Image.new('L',(760,520)); vd=ImageDraw.Draw(vg)
for y in range(520): vd.line((0,y,760,y),fill=255 if 60<y<440 else int(255*(min(y,520-y))/60) if y<=60 or y>=440 else 255)
from PIL import ImageChops
m=ImageChops.multiply(grad,vg)
glow=Image.new('RGB',(W,H),(0,0,0)); gl=ImageDraw.Draw(glow); gl.ellipse((780,60,1280,600),fill=(120,80,20)); glow=glow.filter(ImageFilter.GaussianBlur(120))
bg=ImageChops.add(bg,glow)
bg.paste(fg,(-20,100),m)
d=ImageDraw.Draw(bg)
gold=(242,193,78)
def font(sz): return ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf',sz)
def fit(txt,maxw,sz):
    while d.textlength(txt,font=font(sz))>maxw and sz>40: sz-=4
    return font(sz)
x0=640; maxw=W-x0-40
f1=fit(l1,maxw,104); f2=fit(l2,maxw,104)
y=220
for txt,fn,col in ((l1,f1,(255,255,255)),(l2,f2,gold)):
    for dx,dy in ((-4,0),(4,0),(0,-4),(0,4),(5,5)): d.text((x0+dx,y+dy),txt,font=fn,fill=(0,0,0))
    d.text((x0,y),txt,font=fn,fill=col); y+=fn.size+24
# badge
b=f'ÉP. {int(ep)}'; fb=font(44); bw=d.textlength(b,font=fb)
d.rounded_rectangle((x0,y+20,x0+bw+40,y+20+70),radius=18,fill=gold)
d.text((x0+20,y+27),b,font=fb,fill=(40,10,40))
d.text((x0,40),"LE FIL D'OR",font=font(40),fill=gold)
bg.save(out,quality=90)
