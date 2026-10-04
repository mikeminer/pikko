# -*- coding: utf-8 -*-
"""PIKKO bag / token logos (1024x1024 SVG). Original vector art, no flags or emblems:
country-inspired colour bands + a signature dish popping out of a kraft shopping bag + Pikko's sprout.
Writes public/logos/<bag>.svg. PNGs are rendered by tools/render_logos.mjs.
Usage: python tools/make_logos.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "logos")

# ---------------- signature dishes (centred at 0,0, roughly 320x300) ----------------
ICONS = {
"italy": """
<path d="M-150,-118 L150,-118 L0,150 Z" fill="#f6c768" stroke="#d99a3c" stroke-width="8" stroke-linejoin="round"/>
<rect x="-160" y="-158" width="320" height="52" rx="26" fill="#cf8436"/>
<circle cx="-55" cy="-62" r="28" fill="#c8312b"/><circle cx="45" cy="-58" r="26" fill="#c8312b"/><circle cx="-2" cy="30" r="24" fill="#c8312b"/>
<ellipse cx="62" cy="2" rx="22" ry="11" transform="rotate(35 62 2)" fill="#2e8b3a"/>""",
"poland": """
<path d="M-165,60 A165,165 0 0 1 165,60 Z" fill="#f5e4c3" stroke="#d8b47a" stroke-width="10"/>
""" + "".join(f'<circle cx="{-150 + i * 30}" cy="{60 - int((165**2 - (-150 + i * 30)**2) ** 0.5) + 14}" r="7" fill="#d8b47a"/>' for i in range(11)) + """
<path d="M-40,20 q20,-40 60,-30 M-10,40 q30,-30 70,-10" stroke="#e8cf9e" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M95,-10 l40,-60 M115,-40 l25,-5 M108,-28 l-20,-15" stroke="#3a7d2c" stroke-width="8" stroke-linecap="round"/>""",
"japan": """
<path d="M0,-158 Q22,-158 34,-136 L150,82 Q162,118 126,122 L-126,122 Q-162,118 -150,82 L-34,-136 Q-22,-158 0,-158 Z" fill="#fbfbf6" stroke="#e1ded3" stroke-width="8"/>
<rect x="-62" y="30" width="124" height="92" rx="8" fill="#1f3b2a"/>
<circle cx="-30" cy="-50" r="5" fill="#e1ded3"/><circle cx="20" cy="-80" r="5" fill="#e1ded3"/><circle cx="40" cy="-20" r="5" fill="#e1ded3"/>""",
"mexico": """
<path d="M-165,70 A165,165 0 0 1 165,70 Z" fill="#e3a94b" stroke="#c98a2e" stroke-width="10"/>
<path d="M-128,70 A128,128 0 0 1 128,70 Z" fill="#7a4120"/>
<path d="M-130,10 q20,-30 40,0 q20,-30 40,0 q20,-30 40,0 q20,-30 40,0 q20,-30 40,0 q20,-30 40,0" stroke="#5fb24a" stroke-width="22" fill="none" stroke-linecap="round"/>
<circle cx="-70" cy="-30" r="16" fill="#d62828"/><circle cx="10" cy="-45" r="16" fill="#d62828"/><circle cx="80" cy="-25" r="16" fill="#d62828"/>
<circle cx="-30" cy="-60" r="10" fill="#f7f1e1"/><circle cx="50" cy="-70" r="10" fill="#f7f1e1"/>""",
"usa": """
<path d="M-160,-20 Q-160,-150 0,-150 Q160,-150 160,-20 Z" fill="#e0a050"/>
""" + "".join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="5" fill="#fff3d6"/>' for x, y in [(-80, -90), (-20, -115), (40, -95), (95, -70), (-110, -50), (10, -60), (70, -40)]) + """
<path d="M-170,-10 q20,25 40,0 q20,25 40,0 q20,25 40,0 q20,25 40,0 q20,25 40,0 q20,25 40,0 q20,25 40,0 q20,25 40,0 q20,25 40,0" fill="#5fb24a"/>
<path d="M-150,10 L150,10 L120,45 L-120,45 Z" fill="#ffc93c"/>
<rect x="-165" y="35" width="330" height="58" rx="29" fill="#5a3420"/>
<rect x="-160" y="95" width="320" height="55" rx="22" fill="#d58f46"/>""",
"india": """
<path d="M-170,0 Q-150,150 0,150 Q150,150 170,0 Z" fill="#b8642a"/>
<ellipse cx="0" cy="0" rx="170" ry="40" fill="#f2b134"/>
<ellipse cx="0" cy="0" rx="170" ry="40" fill="none" stroke="#9a4f1f" stroke-width="10"/>
<circle cx="-50" cy="-5" r="9" fill="#3a7d2c"/><circle cx="30" cy="8" r="9" fill="#3a7d2c"/><circle cx="70" cy="-12" r="8" fill="#3a7d2c"/>
<path d="M-60,-60 q-20,-30 0,-60 q20,-30 0,-60 M0,-55 q-20,-30 0,-60 q20,-30 0,-55 M60,-60 q-20,-30 0,-60 q20,-30 0,-60" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.85"/>""",
"france": """
<g fill="#d99a44" stroke="#b87628" stroke-width="8">
<ellipse cx="-125" cy="40" rx="45" ry="30" transform="rotate(-50 -125 40)"/>
<ellipse cx="125" cy="40" rx="45" ry="30" transform="rotate(50 125 40)"/>
<ellipse cx="-75" cy="-20" rx="60" ry="45" transform="rotate(-25 -75 -20)"/>
<ellipse cx="75" cy="-20" rx="60" ry="45" transform="rotate(25 75 -20)"/>
<ellipse cx="0" cy="-45" rx="72" ry="58"/></g>
<path d="M-40,-80 q40,-15 80,0 M-110,-40 q25,-20 45,-5 M110,-40 q-25,-20 -45,-5" stroke="#f3c67a" stroke-width="8" fill="none" stroke-linecap="round"/>""",
"spain": """
<ellipse cx="0" cy="0" rx="175" ry="120" fill="#2b2b2b"/>
<rect x="-215" y="-12" width="44" height="24" rx="12" fill="#2b2b2b"/><rect x="171" y="-12" width="44" height="24" rx="12" fill="#2b2b2b"/>
<ellipse cx="0" cy="0" rx="158" ry="104" fill="#f1b52b"/>
<path d="M-90,-40 a26,26 0 1 1 30,25" stroke="#f26b3a" stroke-width="18" fill="none" stroke-linecap="round"/>
<path d="M40,10 a26,26 0 1 1 30,25" stroke="#f26b3a" stroke-width="18" fill="none" stroke-linecap="round"/>
<circle cx="-30" cy="40" r="11" fill="#5fb24a"/><circle cx="90" cy="-50" r="11" fill="#5fb24a"/><circle cx="-110" cy="30" r="11" fill="#5fb24a"/><circle cx="10" cy="-60" r="11" fill="#5fb24a"/>
<path d="M-20,-10 l70,-20 M-60,60 l60,-10" stroke="#c8312b" stroke-width="14" stroke-linecap="round"/>
<path d="M95,40 a40,40 0 0 1 45,40 l-45,0 Z" fill="#fff176" stroke="#e9c94a" stroke-width="5"/>""",
"greece": """
<path d="M-160,120 C-80,40 20,-40 160,-130" stroke="#7a5a32" stroke-width="16" fill="none" stroke-linecap="round"/>
""" + "".join(f'<ellipse cx="{x}" cy="{y}" rx="52" ry="17" transform="rotate({a} {x} {y})" fill="#6b8e3a"/>' for x, y, a in [(-110, 50, -60), (-60, 40, 20), (-30, -20, -55), (30, -20, 15), (60, -80, -50), (115, -80, 10)]) + """
<ellipse cx="-95" cy="95" rx="30" ry="38" fill="#3b2a4a"/><ellipse cx="0" cy="40" rx="30" ry="38" fill="#3b2a4a"/><ellipse cx="85" cy="-30" rx="28" ry="36" fill="#4f3a5e"/>
<ellipse cx="-104" cy="82" rx="8" ry="12" fill="#ffffff" opacity="0.5"/><ellipse cx="-9" cy="27" rx="8" ry="12" fill="#ffffff" opacity="0.5"/>""",
"turkey": """
<circle cx="0" cy="0" r="110" fill="none" stroke="#b8642a" stroke-width="80"/>
<circle cx="0" cy="0" r="110" fill="none" stroke="#9a4f1f" stroke-width="80" stroke-dasharray="40 30" opacity="0.35"/>
""" + "".join(f'<ellipse cx="{int(110 * __import__("math").cos(a / 10))}" cy="{int(110 * __import__("math").sin(a / 10))}" rx="5" ry="3" fill="#fff3d6"/>' for a in range(0, 63, 3)),
"china": """
<rect x="-170" y="0" width="340" height="120" rx="20" fill="#c9a26b"/>
<ellipse cx="0" cy="0" rx="170" ry="45" fill="#b3884f"/>
<path d="M-170,40 L170,40 M-170,80 L170,80" stroke="#a87d45" stroke-width="8"/>
<g fill="#fbf7ee" stroke="#e3dccb" stroke-width="6">
<path d="M-140,-5 q50,-110 100,0 z"/><path d="M-50,-15 q50,-120 100,0 z"/><path d="M40,-5 q50,-110 100,0 z"/></g>
<path d="M-100,-60 l5,40 M-90,-60 l-5,40 M0,-75 l5,45 M10,-75 l-5,45 M90,-60 l5,40 M100,-60 l-5,40" stroke="#e3dccb" stroke-width="6"/>""",
"korea": """
<path d="M-170,0 Q-160,140 0,140 Q160,140 170,0 Z" fill="#3a3a3a"/>
<ellipse cx="0" cy="0" rx="170" ry="55" fill="#f4efe4"/>
<path d="M0,0 L-160,-15 A160,50 0 0 1 -60,-48 Z" fill="#5fb24a"/>
<path d="M0,0 L-60,-48 A160,50 0 0 1 60,-48 Z" fill="#f28c28"/>
<path d="M0,0 L60,-48 A160,50 0 0 1 160,-15 Z" fill="#7a4120"/>
<path d="M0,0 L160,-15 A160,50 0 0 1 60,48 Z" fill="#d62828"/>
<path d="M0,0 L60,48 A160,50 0 0 1 -160,-15 Z" fill="#c9e39b"/>
<ellipse cx="0" cy="-5" rx="62" ry="34" fill="#ffffff"/><ellipse cx="0" cy="-8" rx="24" ry="16" fill="#ffb703"/>""",
"thailand": """
<ellipse cx="0" cy="10" rx="150" ry="105" transform="rotate(-25 0 10)" fill="#f9b233"/>
<ellipse cx="-40" cy="-20" rx="70" ry="40" transform="rotate(-25 -40 -20)" fill="#fcd46a" opacity="0.7"/>
<path d="M110,-90 q40,-50 90,-30 q-40,40 -90,30 z" fill="#3a7d2c"/>
<path d="M110,-90 q20,-15 40,-25" stroke="#5c4426" stroke-width="10" stroke-linecap="round"/>""",
"vietnam": """
<path d="M-165,-140 L60,40 M-125,-160 L80,25" stroke="#8b5a2b" stroke-width="16" stroke-linecap="round"/>
<path d="M-170,0 Q-160,150 0,150 Q160,150 170,0 Z" fill="#fbfbf6" stroke="#2d6cdf" stroke-width="10"/>
<ellipse cx="0" cy="0" rx="170" ry="50" fill="#d9a35b"/>
<path d="M-120,0 q30,-25 60,0 q30,25 60,0 q30,-25 60,0 q30,25 60,0 M-110,20 q30,-20 60,0 q30,20 60,0 q30,-20 60,0" stroke="#fbf6e9" stroke-width="12" fill="none" stroke-linecap="round"/>
<ellipse cx="-90" cy="-15" rx="24" ry="11" fill="#3a9d3a"/><ellipse cx="70" cy="-20" rx="24" ry="11" fill="#3a9d3a"/><circle cx="20" cy="-25" r="14" fill="#9a4f1f"/>""",
"brazil": """
<path d="M-170,0 Q-160,140 0,140 Q160,140 170,0 Z" fill="#7a4a24"/>
<ellipse cx="0" cy="0" rx="170" ry="55" fill="#5b2a6e"/>
<circle cx="-70" cy="-10" r="30" fill="#f7efc9" stroke="#e5d38f" stroke-width="5"/><circle cx="-10" cy="-20" r="30" fill="#f7efc9" stroke="#e5d38f" stroke-width="5"/><circle cx="50" cy="-8" r="30" fill="#f7efc9" stroke="#e5d38f" stroke-width="5"/>
""" + "".join(f'<circle cx="{x}" cy="{y}" r="8" fill="#d4a24c"/>' for x, y in [(100, 0), (115, -20), (90, 20), (-120, 10), (-130, -15)]) + """
<circle cx="25" cy="25" r="14" fill="#d62828"/>""",
"peru": """
<ellipse cx="0" cy="-20" rx="80" ry="150" fill="#4b2a5e"/>
""" + "".join(f'<circle cx="{x}" cy="{y}" r="15" fill="#6d3d86"/>' for y in range(-150, 120, 34) for x in ([-40, 0, 40] if abs(y) < 120 else [-20, 20])) + """
<path d="M-20,120 C-120,80 -140,-20 -120,-60 C-90,10 -60,80 -10,110 Z" fill="#c9d65a"/>
<path d="M20,120 C120,80 140,-20 120,-60 C90,10 60,80 10,110 Z" fill="#a7c957"/>""",
"morocco": """
<ellipse cx="0" cy="110" rx="190" ry="45" fill="#b5532a"/>
<path d="M-150,100 Q-140,-20 0,-150 Q140,-20 150,100 Z" fill="#d1663a"/>
<path d="M-118,40 Q0,10 118,40 M-135,80 Q0,50 135,80" stroke="#f3d36b" stroke-width="10" fill="none"/>
<circle cx="0" cy="-158" r="22" fill="#b5532a"/>""",
"uk": """
<ellipse cx="0" cy="120" rx="200" ry="40" fill="#fbfbf6" stroke="#2b4c9b" stroke-width="8"/>
<path d="M-130,-60 L130,-60 Q120,100 0,105 Q-120,100 -130,-60 Z" fill="#fbfbf6" stroke="#2b4c9b" stroke-width="8"/>
<path d="M-126,-20 L126,-20" stroke="#2b4c9b" stroke-width="14"/>
<ellipse cx="0" cy="-60" rx="130" ry="26" fill="#a0612f"/>
<path d="M130,-30 a55,55 0 1 1 -10,90" stroke="#fbfbf6" stroke-width="22" fill="none"/>
<path d="M130,-30 a55,55 0 1 1 -10,90" stroke="#2b4c9b" stroke-width="6" fill="none"/>
<path d="M-40,-110 q-15,-25 0,-50 M10,-110 q-15,-25 0,-50" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/>""",
"germany": """
<path d="M-40,110 C-170,110 -190,-20 -110,-90 C-40,-150 60,-120 20,-30 L-90,110 M40,110 C170,110 190,-20 110,-90 C40,-150 -60,-120 -20,-30 L90,110" stroke="#8b4513" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
""" + "".join(f'<rect x="{x}" y="{y}" width="12" height="12" rx="3" fill="#ffffff" transform="rotate(30 {x} {y})"/>' for x, y in [(-150, 0), (-120, -80), (-60, -110), (60, -110), (120, -80), (150, 0), (-30, 60), (30, 60), (-100, 90), (100, 90)]),
"nigeria": """
<path d="M-170,10 Q-160,150 0,150 Q160,150 170,10 Z" fill="#fbfbf6" stroke="#2f8f5b" stroke-width="10"/>
<path d="M-160,10 Q-120,-90 0,-100 Q120,-90 160,10 Z" fill="#e2572c"/>
""" + "".join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="5" fill="#f28c4a"/>' for x, y in [(-100, -10), (-50, -50), (0, -70), (50, -45), (95, -15), (-20, -20), (40, -5)]) + """
<ellipse cx="-60" cy="-5" rx="34" ry="22" fill="#f6b23c" stroke="#c9771f" stroke-width="5"/><ellipse cx="70" cy="-30" rx="34" ry="22" fill="#f6b23c" stroke="#c9771f" stroke-width="5"/>
<circle cx="10" cy="-40" r="10" fill="#3a9d3a"/>""",
"indonesia": """
<ellipse cx="0" cy="120" rx="185" ry="42" fill="#3f8f3a"/>
<path d="M-185,120 q30,-24 60,0 q30,-24 60,0 q30,-24 60,0 q30,-24 60,0 q30,-24 60,0 q30,-24 60,0" fill="#5bb04a"/>
<path d="M0,-165 Q16,-165 26,-140 L120,95 Q126,115 100,118 L-100,118 Q-126,115 -120,95 L-26,-140 Q-16,-165 0,-165 Z" fill="#f6c431" stroke="#d99a1c" stroke-width="8"/>
<path d="M-60,30 L60,30 M-85,80 L85,80" stroke="#e8ad1f" stroke-width="8" stroke-linecap="round"/>
<path d="M-8,-170 l8,-30 l8,30 Z" fill="#d62828"/>
<circle cx="-130" cy="95" r="20" fill="#8b4a1f"/><circle cx="135" cy="92" r="18" fill="#f3e6c4"/><circle cx="-95" cy="112" r="12" fill="#d62828"/><circle cx="100" cy="112" r="12" fill="#5bb04a"/>""",
"russia": """
<path d="M-170,-10 Q-160,140 0,140 Q160,140 170,-10 Z" fill="#1d1d1d"/>
""" + "".join(f'<circle cx="{x}" cy="{y}" r="11" fill="#d62828"/><path d="M{x - 18},{y + 4} q18,-22 36,0" stroke="#f2b134" stroke-width="6" fill="none"/>' for x, y in [(-110, 40), (-50, 80), (20, 95), (90, 70), (140, 20)]) + """
<ellipse cx="0" cy="-10" rx="170" ry="44" fill="#f2b134"/>
<ellipse cx="0" cy="-10" rx="150" ry="34" fill="#8a5a2b"/>
""" + "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="#b07a3f"/>' for x, y in [(-100, -10), (-60, -25), (-20, -5), (30, -20), (70, -8), (110, -18), (-40, 10), (50, 8)]) + """
<path d="M-70,-40 a28,20 0 0 1 56,0 Z M-42,-40 l0,18" fill="#e8d3b0" stroke="#e8d3b0" stroke-width="10"/>
<path d="M20,-30 a24,17 0 0 1 48,0 Z M44,-30 l0,15" fill="#e8d3b0" stroke="#e8d3b0" stroke-width="9"/>
<path d="M110,-150 L60,-30" stroke="#f2b134" stroke-width="16" stroke-linecap="round"/>
<ellipse cx="118" cy="-168" rx="24" ry="34" transform="rotate(22 118 -168)" fill="#d62828" stroke="#f2b134" stroke-width="6"/>""",
"ukraine": """
<path d="M-170,0 Q-160,150 0,150 Q160,150 170,0 Z" fill="#f8f4e9" stroke="#e3dccb" stroke-width="6"/>
""" + "".join(f'<path d="M{x - 9},{y - 9} l18,18 M{x + 9},{y - 9} l-18,18" stroke="{c}" stroke-width="6" stroke-linecap="round"/>' for (x, y), c in zip([(x, 64) for x in range(-120, 121, 30)], ["#d62828", "#1d1d1d"] * 5)) + """
<ellipse cx="0" cy="0" rx="170" ry="48" fill="#f8f4e9"/>
<ellipse cx="0" cy="2" rx="150" ry="38" fill="#a4161a"/>
<ellipse cx="-40" cy="-6" rx="60" ry="14" fill="#c1272d" opacity="0.7"/>
<path d="M-20,-8 q25,-30 55,-4 q-20,18 -55,4 Z" fill="#fffaf0"/>
<path d="M60,-2 l25,-14 M70,-10 l8,-14 M75,-8 l18,-4 M-90,0 l-20,-12 M-100,-6 l-6,-14 M-96,-4 l-20,2" stroke="#3a9d3a" stroke-width="6" stroke-linecap="round"/>""",
"philippines": """
<ellipse cx="0" cy="120" rx="190" ry="40" fill="#3f8f3a"/>
<path d="M-150,40 C-150,-120 150,-120 150,40 C150,110 -150,110 -150,40 Z" fill="#ffb703" stroke="#e08e0b" stroke-width="8"/>
""" + "".join(f'<rect x="{x - 22}" y="{y - 22}" width="44" height="44" rx="10" fill="#ffc93c" stroke="#f4a100" stroke-width="5" transform="rotate(45 {x} {y})"/>' for x, y in [(-90, 20), (-30, -20), (30, -20), (90, 20), (-30, 50), (30, 50), (0, -60), (-60, -45), (60, -45)]) + """
<path d="M120,-60 q40,-40 80,-20 q-36,34 -80,20 z" fill="#3a7d2c"/>""",
"base": """
<circle cx="0" cy="10" r="140" fill="#d62828"/>
<ellipse cx="-50" cy="-40" rx="40" ry="60" transform="rotate(30 -50 -40)" fill="#ff6b6b" opacity="0.6"/>
<path d="M0,-120 q10,-40 30,-60" stroke="#5c4426" stroke-width="14" stroke-linecap="round" fill="none"/>
<path d="M20,-150 q60,-40 100,-10 q-50,40 -100,10 z" fill="#5bbf3a"/>""",
}


def band(bag):
    """Colour band clipped to the bag body (y 640..760)."""
    p, kind, bid = bag["palette"], bag["stripes"], bag["id"]
    x0, x1, y0, y1 = 240, 784, 640, 760
    W, H = x1 - x0, y1 - y0
    out = []
    def rect(x, y, w, h, c):
        out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{c}"/>')
    if kind == "v":
        for i, c in enumerate(p):
            rect(x0 + i * W / len(p), y0, W / len(p) + 1, H, c)
    elif kind in ("h", "h3"):
        ratios = [1, 2, 1] if bid == "spain" else [1] * len(p)
        tot, y = sum(ratios), y0
        for c, r in zip(p, ratios):
            rect(x0, y, W, H * r / tot + 1, c)
            y += H * r / tot
    elif kind == "h5":
        for i in range(5):
            rect(x0, y0 + i * H / 5, W, H / 5 + 1, p[i % 2])
    elif kind == "th":
        ratios, cols = [1, 1, 2, 1, 1], [p[0], p[1], p[2], p[1], p[0]]
        y = y0
        for c, r in zip(cols, ratios):
            rect(x0, y, W, H * r / 6 + 1, c)
            y += H * r / 6
    elif kind == "disc":
        rect(x0, y0, W, H, p[0])
        out.append(f'<circle cx="512" cy="{(y0 + y1) / 2}" r="42" fill="{p[1]}"/>')
    elif kind == "us":
        for i in range(7):
            rect(x0, y0 + i * H / 7, W, H / 7 + 1, p[0] if i % 2 == 0 else p[1])
        rect(x0, y0, 200, H * 4 / 7, p[2])
        for i in range(3):
            for j in range(2):
                out.append(f'<circle cx="{x0 + 40 + i * 60}" cy="{y0 + 18 + j * 32}" r="7" fill="#ffffff"/>')
    elif kind in ("h2", "star"):
        rect(x0, y0, W, H, p[0])
        cx, cy, R = (512, (y0 + y1) / 2, 40) if kind == "star" else (x0 + 120, y0 + 45, 30)
        import math
        pts = []
        for k in range(10):
            r = R if k % 2 == 0 else R * 0.4
            a = -math.pi / 2 + k * math.pi / 5
            pts.append(f"{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}")
        out.append(f'<polygon points="{" ".join(pts)}" fill="{p[1]}"/>')
    elif kind == "br":
        rect(x0, y0, W, H, p[0])
        out.append(f'<polygon points="{x0 + 70},{(y0 + y1) / 2} 512,{y0 + 10} {x1 - 70},{(y0 + y1) / 2} 512,{y1 - 10}" fill="{p[1]}"/>')
        out.append(f'<circle cx="512" cy="{(y0 + y1) / 2}" r="34" fill="{p[2]}"/>')
    elif kind == "cross":
        rect(x0, y0, W, H, p[0])
        rect(x0, y0 + H / 2 - 22, W, 44, p[1])
        rect(512 - 22, y0, 44, H, p[1])
        rect(x0, y0 + H / 2 - 12, W, 24, p[2])
        rect(512 - 12, y0, 24, H, p[2])
    return "".join(out)


BAG_PATH = "M300,452 L724,452 L764,880 Q766,904 742,904 L282,904 Q258,904 260,880 Z"


def svg(bag):
    bid = bag["id"]
    code = bag.get("country", "PIKKO")
    bg = bag.get("bg", "#ffe2d3")
    accent = bag["palette"][-1] if bag["palette"] else "#ff6b35"
    font = "'Arial Black','Segoe UI Black','Helvetica Neue',Arial,sans-serif"
    code_size = 128 if len(code) <= 2 else 92
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<title>PIKKO — {bag['name']['en']} bag</title>
<defs>
<radialGradient id="bg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="{bg}"/><stop offset="1" stop-color="{accent}" stop-opacity="0.55"/></radialGradient>
<linearGradient id="kraft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6ab6c"/><stop offset="1" stop-color="#b98a4e"/></linearGradient>
<clipPath id="bagclip"><path d="{BAG_PATH}"/></clipPath>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#3b2412" flood-opacity="0.28"/></filter>
</defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
<circle cx="512" cy="512" r="478" fill="none" stroke="#ffffff" stroke-width="14" opacity="0.55"/>
<g filter="url(#soft)">
<path d="M402,470 C402,318 622,318 622,470" stroke="#7a4b22" stroke-width="24" fill="none" stroke-linecap="round"/>
<g transform="translate(512,338) scale(1.36)">{ICONS[bid]}</g>
<path d="{BAG_PATH}" fill="url(#kraft)"/>
<g clip-path="url(#bagclip)">
<rect x="240" y="452" width="544" height="42" fill="#a97a40" opacity="0.55"/>
<path d="M300,494 L330,904 M724,494 L694,904" stroke="#a97a40" stroke-width="6" opacity="0.5"/>
{band(bag)}
<rect x="240" y="636" width="544" height="6" fill="#000" opacity="0.12"/><rect x="240" y="760" width="544" height="6" fill="#000" opacity="0.12"/>
</g>
<text x="512" y="{872 if len(code) <= 2 else 862}" text-anchor="middle" font-family="{font}" font-weight="900" font-size="{code_size}" fill="#4a2b12" letter-spacing="6">{code}</text>
<g transform="translate(706,470)">
<path d="M0,0 C4,-30 2,-50 -6,-70" stroke="#3f9a27" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M-6,-70 C-50,-100 -86,-74 -86,-60 C-60,-46 -24,-48 -6,-70 Z" fill="#5bbf3a"/>
<path d="M-6,-70 C30,-110 74,-92 78,-76 C50,-56 14,-56 -6,-70 Z" fill="#6fd14a"/>
</g>
</g>
</svg>
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    data = json.load(open(os.path.join(ROOT, "src", "data", "bags.json"), encoding="utf-8"))
    bags = [{"id": "base", "country": "PIKKO", "name": {"en": "Starter"}, "palette": ["#ff6b35", "#5bbf3a", "#ff6b35"], "stripes": "v", "bg": "#ffe2d3"}] + data["bags"]
    for b in bags:
        with open(os.path.join(OUT, f"{b['id']}.svg"), "w", encoding="utf-8") as fh:
            fh.write(svg(b))
    print(len(bags), "logos in", OUT)


if __name__ == "__main__":
    main()
