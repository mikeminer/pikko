// Bleah Cam (GDD §14.2 #1): records ~4 s of the canvas + game audio when Pikko pulls a disgust face.
// Feature-detected; silently unavailable where MediaRecorder / captureStream are missing.
import { audio } from '../audio/audio';

let recorder: MediaRecorder | null = null;
let best: { blob: Blob; mega: boolean } | null = null;

function mime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const m of ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return null;
}

export function bleahCamSupported(canvas: HTMLCanvasElement): boolean {
  return !!mime() && typeof canvas.captureStream === 'function';
}

export function resetClip(): void { best = null; }

export function recordReaction(canvas: HTMLCanvasElement, mega: boolean, seconds = 4): void {
  if (recorder || !bleahCamSupported(canvas)) return;
  if (best?.mega && !mega) return; // keep the best (mega) clip
  try {
    const stream = canvas.captureStream(30);
    const a = audio.streamDest?.stream.getAudioTracks()[0];
    if (a) stream.addTrack(a);
    const type = mime()!;
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2_500_000 });
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      recorder = null;
      stream.getVideoTracks().forEach((tr) => tr.stop());
      if (chunks.length) best = { blob: new Blob(chunks, { type: type.split(';')[0] }), mega };
    };
    recorder = rec;
    rec.start();
    setTimeout(() => { if (rec.state !== 'inactive') rec.stop(); }, seconds * 1000);
  } catch {
    recorder = null;
  }
}

export function clip(): Blob | null { return best?.blob ?? null; }
