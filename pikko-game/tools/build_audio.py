"""Prepare PIKKO web audio from the generated sources (read-only on sources).

- loudness-normalises each file (EBU R128 integrated) to a per-kind target, peak-limited to -1 dBFS sample peak;
- encodes MP3 (music stereo 160k, voice/sfx mono 96k);
- for loops: encodes exactly the loop body and stores its sample length plus a 1024-sample start signature,
  so the runtime can find the true loop start even if a decoder adds MP3 priming silence;
- writes public/audio/manifest.json with provenance (source path + sha256) and approval status.

Usage: python tools/build_audio.py
"""
import base64
import hashlib
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PG = os.environ.get("PIKKO_AUDIO_SRC")  # folder holding PIKKO_audio_v0.2, PIKKO_loop_masters_v0.1, ... (not part of this repo)
if not PG or not os.path.isdir(PG):
    sys.exit("Set PIKKO_AUDIO_SRC to the folder with the generated audio sources.")
sys.path.insert(0, os.path.join(PG, "PIKKO_loop_masters_v0.1", "tools"))
from pikko_audio_lib import FFMPEG, decode, probe_rate  # noqa: E402

SRC = os.path.join(PG, "PIKKO_audio_v0.2", "originali_audio")
LOOPS = os.path.join(PG, "PIKKO_loop_masters_v0.1", "loop_candidates")
OUT = os.path.join(ROOT, "public", "audio")

TARGET = {"music": -20.0, "voice": -16.0, "sfx": -18.0, "end": -15.0}

ITEMS = []


def add(cid, path, kind, loop=False, status="candidate_not_approved", mono=None):
    ITEMS.append(dict(id=cid, path=path, kind=kind, loop=loop, status=status,
                      mono=(kind != "music") if mono is None else mono))


# music loops (candidates built in PIKKO_loop_masters_v0.1)
for cid in ["M10_menu_loop", "M11_breakfast_loop", "M12_lunch_loop", "M13_snack_loop", "M14_dinner_loop",
            "M17_mart_loop", "B01_mediterranean", "B02_polish_pantry", "B03_street_food", "B04_breakfast",
            "B06_christmas", "B07_halloween", "B08_spring_easter", "B09_summer_beach"]:
    add(cid, os.path.join(LOOPS, f"{cid}_LOOPv1.wav"), "music", loop=True, status="loop_candidate_not_approved")
add("M18_results", os.path.join(SRC, "M18_results_take01.mp3"), "music")
add("M01_theme_it_demoA", os.path.join(SRC, "M01_theme_it_demo_takeA.m4a"), "music", status="user_selected_demo_A")
add("M04_theme_instrumental", os.path.join(SRC, "M04_theme_instrumental_take01.mp3"), "music")

# voice: yum / bleah per language
for i in range(1, 5):
    add(f"yum_it_{i}", os.path.join(SRC, f"PIKKO_Gnam_isolato_variante0{i}.mp3"), "voice",
        status="user_approved_character_reference")
for lang, stem in (("en", "S02_yum_en"), ("pl", "S03_mniam_pl")):
    for j, perf in enumerate(("bouncy", "excited", "satisfied"), 1):
        add(f"yum_{lang}_{j}", os.path.join(SRC, f"{stem}_{perf}_take01_var01.mp3"), "voice")
for lang, stem in (("it", "S04_bleah"), ("en", "S04_bleah"), ("pl", "S05_fuj_pl")):
    for j, perf in enumerate(("short", "dramatic", "shiver"), 1):
        add(f"bleah_{lang}_{j}", os.path.join(SRC, f"{stem}_{perf}_take01_var01.mp3"), "voice")
for v in ("content", "curious", "effort", "giggle", "happy_hum", "hiccup", "hop", "lazy_sigh", "nervous", "proud",
          "surprised", "yawn"):
    add(f"vox_{v}", os.path.join(SRC, f"S06_pikko_voice_{v}_variante01.mp3"), "voice")

# end of game
add("end_victory", os.path.join(PG, "PIKKO_vittoria_rutto", "originali_audio", "PIKKO_vittoria_rutto_variante04.mp3"),
    "end", status="user_selected")
add("end_defeat_en", os.path.join(PG, "PIKKO_sconfitta_ahi_my_stomach", "originali_audio",
                                  "PIKKO_sconfitta_Ahi_My_stomach_variante02.mp3"), "end", status="user_selected")
add("end_defeat_it", os.path.join(PG, "PIKKO_sconfitta_IT_PL", "originali_audio",
                                  "PIKKO_sconfitta_IT_Ahi_il_mio_pancino_variante01.mp3"), "end")
add("end_defeat_pl", os.path.join(PG, "PIKKO_sconfitta_IT_PL", "originali_audio",
                                  "PIKKO_sconfitta_PL_Aj_moj_brzuszek_variante01.mp3"), "end")

# foley
for cid, fn in [("crunch_1", "S30_crunch_apple_take01_var01"), ("crunch_2", "S30_crunch_carrot_take01_var01"),
                ("chew", "S31_chew_gulp_chew_take01_var01"), ("gulp", "S31_chew_gulp_swallow_take01_var01"),
                ("juice_1", "S32_juice_splash_orange_take01_var01"), ("juice_2", "S32_juice_splash_peach_take01_var01"),
                ("fizz_can", "S33_fizz_can_open_take01_var01"), ("fizz_glass", "S33_fizz_glass_take01_var01"),
                ("fridge_open", "S35_fridge_open_take01_var01"), ("fridge_click", "S35_fridge_light_click_take01_var01"),
                ("fridge_close", "S35_fridge_close_take01_var01"), ("plate_slide", "S36_plate_drag_slide_take01_var01"),
                ("plate_lift", "S36_plate_drag_lift_take01_var01"), ("plate_drop", "S36_plate_drag_drop_take01_var01"),
                ("dodge_s", "S37_dodge_small_take01_var01"), ("dodge_m", "S37_dodge_medium_take01_var01"),
                ("dodge_l", "S37_dodge_large_take01_var01"), ("squeak", "S37_dodge_squeak_take01_var01"),
                ("step", "S38_vinyl_steps_step_take01_var01"), ("land", "S38_vinyl_steps_landing_take01_var01"),
                ("mart_bag", "S39_mart_bag_take01_var01"), ("mart_beep", "S39_mart_beep_take01_var01"),
                ("mart_cart", "S39_mart_cart_take01_var01"), ("page_turn", "S19_new_recipe_page_turn_take01_var01"),
                ("shutter", "S22_bleah_cam_shutter_take01_var01")]:
    add(cid, os.path.join(SRC, fn + ".mp3"), "sfx")


def lufs_of(x, sr):
    tmp = os.path.join(OUT, "_tmp_measure.wav")
    sf.write(tmp, x, sr, subtype="FLOAT")
    out = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", tmp, "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    os.remove(tmp)
    s = out[out.rfind("Summary:"):]
    import re
    m = re.search(r"I:\s+(-?[\d.]+) LUFS", s)
    return float(m.group(1)) if m else None


def trim_silence(x, sr, thr_db=-50):
    m = np.abs(x).max(axis=1)
    nz = np.where(m > 10 ** (thr_db / 20))[0]
    if len(nz) == 0:
        return x
    a = max(0, nz[0] - int(0.005 * sr))
    b = min(len(x), nz[-1] + int(0.08 * sr))
    return x[a:b]


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {"version": 1, "generated": "2026-10-03", "note": "Gains are applied per file; 'status' reflects approval at build time. Candidates are not approved masters.", "sounds": {}}
    for it in ITEMS:
        p = it["path"]
        if not os.path.exists(p):
            print("MISSING", it["id"], p)
            continue
        raw = open(p, "rb").read()
        if p.endswith(".wav"):
            x, sr = sf.read(p, dtype="float32", always_2d=True)
        else:
            sr = probe_rate(p)
            x = decode(p, sr)
        if not it["loop"]:
            x = trim_silence(x, sr)
            fo = min(len(x), int(0.03 * sr))  # short fade-out so no file ends abruptly
            x[-fo:] *= np.linspace(1, 0, fo, dtype=np.float32)[:, None]
        if it["mono"]:
            x = x.mean(axis=1, keepdims=True)
        measured = lufs_of(x, sr)
        gain_db = (TARGET[it["kind"]] - measured) if measured is not None else 0.0
        y = x * (10 ** (gain_db / 20))
        peak = float(np.abs(y).max())
        if peak > 10 ** (-1 / 20):  # keep at least 1 dB of headroom
            y *= 10 ** (-1 / 20) / peak
            gain_db += 20 * np.log10(10 ** (-1 / 20) / peak)
        tmp = os.path.join(OUT, "_tmp.wav")
        sf.write(tmp, y, sr, subtype="FLOAT")
        mp3 = os.path.join(OUT, it["id"] + ".mp3")
        br = "160k" if it["kind"] == "music" else "96k"
        subprocess.run([FFMPEG, "-v", "error", "-y", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", br, mp3], check=True)
        os.remove(tmp)
        entry = {"url": f"audio/{it['id']}.mp3", "kind": it["kind"], "sampleRate": sr, "channels": y.shape[1],
                 "durationS": round(len(y) / sr, 4), "gainDb": round(gain_db, 2), "lufsTarget": TARGET[it["kind"]],
                 "status": it["status"], "source": os.path.relpath(p, PG).replace(os.sep, "/"), "sourceSha256": hashlib.sha256(raw).hexdigest(),
                 "bytes": os.path.getsize(mp3)}
        if it["loop"]:
            mono = y.mean(axis=1)
            sig = np.clip(mono[:1024] * 32767, -32768, 32767).astype("<i2").tobytes()
            entry["loop"] = {"lengthSamples": int(len(y)), "signature1024": base64.b64encode(sig).decode()}
        manifest["sounds"][it["id"]] = entry
        print(f"{it['id']:28s} {entry['durationS']:7.2f}s gain {gain_db:+6.1f} dB  {entry['bytes'] // 1024:5d} KB  {it['status']}")
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=1, ensure_ascii=False)
    total = sum(v["bytes"] for v in manifest["sounds"].values())
    print(f"{len(manifest['sounds'])} files, {total / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
