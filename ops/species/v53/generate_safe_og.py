#!/usr/bin/env python3
"""Fallback Open Graph cards for EXISTING Claude Species page data.

NO animal image is invented, scraped or misattributed. Once an editorially
approved wild image is attached to Claude's page.hero, that image wins.
These are social-preview assets only; no UI or species truth is duplicated.
"""
import html,json,math,re,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

dist=Path(sys.argv[1] if len(sys.argv)>1 else "dist")
public=Path(sys.argv[2] if len(sys.argv)>2 else "public/species-data/v1")
font1="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font2="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
small=ImageFont.truetype(font2,25)
medium=ImageFont.truetype(font2,34)
title_font=ImageFont.truetype(font1,90)
scientific_font=ImageFont.truetype(font2,38)
dest=dist/"species-og/v1"
dest.mkdir(parents=True,exist_ok=True)
made=[]
def upsert_meta(content,field,name,value):
    tag='<meta '+field+'="'+name+'" content="'+html.escape(value,quote=True)+'" />'
    pattern=r'<meta\s+'+re.escape(field)+r'="'+re.escape(name)+r'"[^>]*>'
    if re.search(pattern,content,flags=re.I):return re.sub(pattern,lambda _:tag,content,count=1,flags=re.I)
    assert "</head>" in content
    return content.replace("</head>","    "+tag+"\n</head>",1)
for f in sorted(public.glob("*.json")):
    if f.stem=="index":continue
    try:page=json.loads(f.read_text())
    except Exception:continue
    if page.get("schema")!="4PLANET_SPECIES_PAGE_01":continue
    if page.get("hero")!="auto":continue
    slug=page.get("slug",f.stem)
    target=dist/slug/"index.html"
    if not target.exists():continue
    common=page["identity"]["commonName"]; scientific=page["identity"]["scientificName"]
    canvas=Image.new("RGB",(1200,630)); pix=canvas.load()
    for y in range(630):
        for x in range(1200):
            t=y/630;v=math.sin((x/1200)*math.pi)*0.12
            pix[x,y]=(int(8+14*t+14*v),int(21+17*t+20*v),int(27+20*t+15*v))
    draw=ImageDraw.Draw(canvas)
    draw.ellipse((780,-240,1390,370),outline=(83,110,112),width=2)
    draw.ellipse((835,-185,1340,320),outline=(54,75,78),width=2)
    draw.line([(72,114),(1130,114)],fill=(88,113,111),width=2)
    draw.text((75,61),"4PLANET  /  SPECIES",font=medium,fill=(199,217,210))
    draw.text((76,169),"MEET THE LIVING WORLD",font=small,fill=(169,194,186))
    # Keep extremely long names inside card without shrinking to illegibility.
    size=90
    font=title_font
    while draw.textbbox((0,0),common,font=font)[2]>1030 and size>44:
        size-=4;font=ImageFont.truetype(font1,size)
    draw.text((72,248),common,font=font,fill=(245,249,244))
    draw.text((76,364),scientific,font=scientific_font,fill=(188,208,199))
    draw.line([(76,485),(1120,485)],fill=(101,129,121),width=2)
    draw.text((76,519),"Verified claims and sources inside 4species.com",font=small,fill=(207,223,214))
    if page.get("provenance",{}).get("review")!="REVIEWED":
        draw.text((76,573),"EDITORIAL DRAFT",font=ImageFont.truetype(font1,18),fill=(186,195,184))
    canvas.save(dest/(slug+".png"),format="PNG",optimize=True)
    src=target.read_text()
    image="https://4species.com/species-og/v1/"+slug+".png"
    for a,n,v in [
        ("property","og:image",image),
        ("property","og:image:alt",common+" ("+scientific+") — 4PLANET SPECIES"),
        ("property","og:image:width","1200"),
        ("property","og:image:height","630"),
        ("name","twitter:image",image),
        ("name","twitter:card","summary_large_image")
    ]:src=upsert_meta(src,a,n,v)
    target.write_text(src)
    made.append(slug)
print("SPECIES_OG_FALLBACK_CARDS",len(made),made)
assert len(made)>=15,"Expected all unreviewed auto-image public species pages"
