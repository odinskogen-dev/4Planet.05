import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { LUME_ORCA_ROOM, type LumeRoomNode } from "@/content/lumeRoom";
import "@/styles/lume-room.css";

const ROOM = LUME_ORCA_ROOM;
const NODES = ROOM.nodes;
const BACK_COLUMNS = [29, 36, 43, 50, 57, 64, 71];
const BACK_ROWS = [24, 32, 40, 48, 56];
const DEPTH_STEPS = [0, 0.2, 0.42, 0.68, 1];

type AudioState = "off" | "loading" | "playing" | "muted" | "error";
type SubjectGuide = { pointerId: number; startX: number; startY: number; originX: number; originY: number };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

function WorldProjection() {
  const meridians = [125, 250, 375, 500, 625, 750, 875];
  const parallels = [75, 150, 225, 300, 375];
  return (
    <div className="lume-room__map" role="img" aria-label="Schematic world map for species-level global ocean orientation; not a live track or migration route">
      <svg viewBox="0 0 1000 450" aria-hidden="true">
        <g className="lume-room__map-grid">
          {meridians.map((x) => <path key={`meridian-${x}`} d={`M ${x} 24 Q ${500 + (x - 500) * .18} 225 ${x} 426`} />)}
          {parallels.map((y) => <path key={`parallel-${y}`} d={`M 34 ${y} Q 500 ${y + (225 - y) * .08} 966 ${y}`} />)}
        </g>
        <g className="lume-room__map-land">
          <path d="M45 96 92 64 146 68 178 45 227 54 274 89 295 128 268 155 230 150 204 180 173 184 147 219 108 207 94 172 57 151Z" />
          <path d="M278 54 317 38 343 59 323 91 286 88Z" />
          <path d="M220 205 257 218 284 253 279 292 300 321 282 374 253 414 231 367 221 320 201 281 205 239Z" />
          <path d="M438 93 470 70 508 76 533 61 588 72 624 63 673 83 722 73 779 91 842 86 900 112 939 146 910 176 858 164 818 190 770 174 728 195 687 172 650 183 612 159 572 166 536 145 498 154 462 134Z" />
          <path d="M483 165 529 158 567 188 579 231 562 278 536 331 499 315 477 271 452 229 459 190Z" />
          <path d="M823 287 862 270 909 292 928 329 896 354 850 347 812 321Z" />
          <path d="M35 416 Q 500 387 965 416 L 930 437 Q 500 420 70 437Z" />
        </g>
        <g className="lume-room__map-labels">
          <text x="74" y="286">PACIFIC</text><text x="342" y="244">ATLANTIC</text><text x="646" y="276">INDIAN</text><text x="805" y="225">PACIFIC</text>
        </g>
      </svg>
      <div className="lume-room__map-meta"><span>SPECIES ORIENTATION · ALL OCEANS</span><span>NOT A LIVE TRACK</span></div>
    </div>
  );
}

function pulseTone(context: AudioContext, at: number, frequency: number, duration: number, gainValue: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, at);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.55, at + duration * 0.22);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.74, at + duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(gainValue, at + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(filter).connect(gain).connect(context.destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.03);
}

function audioButtonLabel(state: AudioState) {
  if (state === "loading") return "LOADING ORCA AUDIO";
  if (state === "playing") return "MUTE ORCA AUDIO";
  if (state === "muted") return "RESUME ORCA AUDIO";
  if (state === "error") return "RETRY ORCA AUDIO";
  return "HEAR ORCA ECHOLOCATION";
}

export default function LumeRoom() {
  const roomRef = useRef<HTMLElement>(null);
  const subjectRef = useRef<HTMLElement>(null);
  const subjectGuideRef = useRef<SubjectGuide | null>(null);
  const subjectPositionRef = useRef({ x: 0, y: 0 });
  const fieldAudioRef = useRef<HTMLAudioElement>(null);
  const proceduralAudioRef = useRef<AudioContext | null>(null);
  const soundTimer = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<LumeRoomNode["id"]>("identity");
  const [audioState, setAudioState] = useState<AudioState>("off");
  const [soundActive, setSoundActive] = useState(false);
  const [subjectGuided, setSubjectGuided] = useState(false);
  const active = NODES.find((node) => node.id === activeId) ?? NODES[0];
  const activeIndex = NODES.findIndex((node) => node.id === active.id) + 1;

  useEffect(() => () => {
    if (soundTimer.current !== null) window.clearTimeout(soundTimer.current);
    fieldAudioRef.current?.pause();
    void proceduralAudioRef.current?.close();
  }, []);

  const moveRoom = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    roomRef.current?.style.setProperty("--look-x", x.toFixed(3));
    roomRef.current?.style.setProperty("--look-y", y.toFixed(3));
  };

  const settleRoom = () => {
    roomRef.current?.style.setProperty("--look-x", "0");
    roomRef.current?.style.setProperty("--look-y", "0");
  };

  const guideSubject = (x: number, y: number) => {
    const maximumX = Math.min(54, window.innerWidth * .055);
    const maximumY = Math.min(34, window.innerHeight * .04);
    const nextX = clamp(x, -maximumX, maximumX);
    const nextY = clamp(y, -maximumY, maximumY);
    subjectPositionRef.current = { x: nextX, y: nextY };
    subjectRef.current?.style.setProperty("--subject-x", `${nextX.toFixed(1)}px`);
    subjectRef.current?.style.setProperty("--subject-y", `${nextY.toFixed(1)}px`);
    subjectRef.current?.style.setProperty("--subject-yaw", `${(nextX * .1).toFixed(2)}deg`);
    subjectRef.current?.style.setProperty("--subject-roll", `${(nextY * -.035).toFixed(2)}deg`);
  };

  const resetSubject = () => guideSubject(0, 0);

  const startSubjectGuide = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.pointerType === "mouse" && event.button !== 0) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    subjectGuideRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: subjectPositionRef.current.x, originY: subjectPositionRef.current.y };
    setSubjectGuided(true);
  };

  const moveSubject = (event: ReactPointerEvent<HTMLElement>) => {
    const guide = subjectGuideRef.current;
    if (!guide || guide.pointerId !== event.pointerId) return;
    event.preventDefault();
    guideSubject(guide.originX + event.clientX - guide.startX, guide.originY + event.clientY - guide.startY);
  };

  const stopSubjectGuide = (event: ReactPointerEvent<HTMLElement>) => {
    if (subjectGuideRef.current?.pointerId !== event.pointerId) return;
    subjectGuideRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setSubjectGuided(false);
  };

  const guideSubjectWithKeyboard = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const step = event.shiftKey ? 16 : 8;
    const { x, y } = subjectPositionRef.current;
    if (event.key === "ArrowLeft") guideSubject(x - step, y);
    else if (event.key === "ArrowRight") guideSubject(x + step, y);
    else if (event.key === "ArrowUp") guideSubject(x, y - step);
    else if (event.key === "ArrowDown") guideSubject(x, y + step);
    else if (event.key === "Home" || event.key === "Enter") resetSubject();
    else return;
    event.preventDefault();
  };

  const toggleFieldAudio = async () => {
    const audio = fieldAudioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setAudioState("muted");
      return;
    }
    if (audio.ended) audio.currentTime = 0;
    setAudioState("loading");
    try {
      await audio.play();
    } catch {
      setAudioState("error");
    }
  };

  const playSonification = async () => {
    try {
      const context = proceduralAudioRef.current ?? new AudioContext();
      proceduralAudioRef.current = context;
      if (context.state === "suspended") await context.resume();
      const start = context.currentTime + 0.03;
      pulseTone(context, start, 92, 1.55, 0.075);
      pulseTone(context, start + 0.32, 410, 0.62, 0.038);
      pulseTone(context, start + 0.76, 615, 0.48, 0.026);
      setSoundActive(true);
      if (soundTimer.current !== null) window.clearTimeout(soundTimer.current);
      soundTimer.current = window.setTimeout(() => setSoundActive(false), 2100);
    } catch {
      setSoundActive(false);
    }
  };

  return (
    <main
      ref={roomRef}
      id="main-content"
      className="lume-room"
      data-room-version="03"
      data-active-node={active.id}
      data-audio-state={audioState}
      data-sound-active={soundActive}
      data-subject-motion="2.5D"
      data-subject-guided={subjectGuided}
      onPointerMove={moveRoom}
      onPointerLeave={settleRoom}
    >
      <a className="lume-room__skip" href="#lume-room-detail">SKIP TO PROJECTED DETAIL</a>

      <header className="lume-room__header">
        <Link to="/" className="lume-room__brand">4PLANET_</Link>
        <div className="lume-room__coordinates" aria-label="Room identity">
          <span>LUME ROOM 03</span>
          <span>OCE4N_</span>
          <span>SPECIES / ORCA</span>
        </div>
        <Link to={ROOM.species.profileRoute} className="lume-room__exit">EXIT TO SPECIES <span aria-hidden>↗</span></Link>
      </header>

      <section className="lume-room__stage" aria-label="Interactive Orca species gallery">
        <div className="lume-room__architecture" aria-hidden="true">
          <svg className="lume-room__volume" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="lume-projection-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="0.18" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g className="lume-room__volume-grid" filter="url(#lume-projection-glow)">
              <rect x="23" y="17" width="54" height="47" />
              {BACK_COLUMNS.map((x) => <line key={`back-v-${x}`} x1={x} y1="17" x2={x} y2="64" />)}
              {BACK_ROWS.map((y) => <line key={`back-h-${y}`} x1="23" y1={y} x2="77" y2={y} />)}
              {DEPTH_STEPS.map((step) => {
                const x = 23 * (1 - step);
                const left = 23 - x;
                const right = 77 + x;
                const floorY = 64 + 36 * step;
                const ceilingY = 17 * (1 - step);
                return <g key={`depth-${step}`}><line x1={left} y1={floorY} x2={right} y2={floorY} /><line x1={left} y1={ceilingY} x2={right} y2={ceilingY} /></g>;
              })}
              {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map((step) => (
                <g key={`ray-${step}`}><line x1={23 + 54 * step} y1="64" x2={100 * step} y2="100" /><line x1={23 + 54 * step} y1="17" x2={100 * step} y2="0" /></g>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((step) => (
                <g key={`wall-depth-${step}`}><line x1={23 * step} y1={17 * step} x2={23 * step} y2={100 - 36 * step} /><line x1={100 - 23 * step} y1={17 * step} x2={100 - 23 * step} y2={100 - 36 * step} /></g>
              ))}
              {[17, 29, 41, 53, 64].map((y, index) => (
                <g key={`wall-row-${y}`}><line x1="0" y1={index * 25} x2="23" y2={y} /><line x1="100" y1={index * 25} x2="77" y2={y} /></g>
              ))}
            </g>
          </svg>
          <div className="lume-room__ceiling-wash" />
          <div className="lume-room__floor-wash" />
          <div className="lume-room__vanishing-point" />
          <div className="lume-room__scan" />
        </div>

        <aside className="lume-room__identity" aria-label="Species identity">
          <span className="lume-room__eyebrow">SPECIES IDENTITY</span>
          <h1>{ROOM.species.commonName}</h1>
          <p><em>{ROOM.species.scientificName}</em></p>
          <dl>
            <div><dt>TAXON</dt><dd>{ROOM.species.taxonLabel}</dd></div>
            <div><dt>GROUP</dt><dd>{ROOM.species.group}</dd></div>
            <div><dt>RANGE</dt><dd>{ROOM.species.range}</dd></div>
          </dl>
        </aside>

        <figure ref={subjectRef} className="lume-room__subject" tabIndex={0} aria-label="Interactive 2.5D Orca projection. Drag, touch or use arrow keys to guide it; press Enter or Home to reset." onPointerDown={startSubjectGuide} onPointerMove={moveSubject} onPointerUp={stopSubjectGuide} onPointerCancel={stopSubjectGuide} onDoubleClick={resetSubject} onKeyDown={guideSubjectWithKeyboard}>
          <div className="lume-room__subject-swim">
            <div className="lume-room__subject-field" aria-hidden="true" />
            <span className="lume-room__wake lume-room__wake--one" aria-hidden="true" />
            <span className="lume-room__wake lume-room__wake--two" aria-hidden="true" />
            <img className="lume-room__subject-echo" src={ROOM.visual.src} alt="" aria-hidden="true" draggable={false} />
            <img className="lume-room__subject-image" src={ROOM.visual.src} alt={ROOM.visual.alt} draggable={false} />
          </div>
          <figcaption>{ROOM.visual.disclosure} · 2.5D MOTION</figcaption>
        </figure>

        <div className="lume-room__nodes" aria-label="Explore projected species information">
          {NODES.map((node, index) => (
            <button key={node.id} type="button" className="lume-room__node" data-node={node.id} data-active={active.id === node.id} aria-label={`0${index + 1} ${node.label}`} aria-pressed={active.id === node.id} aria-controls="lume-room-detail" onClick={() => setActiveId(node.id)}>
              <span className="lume-room__node-pulse" aria-hidden />
              <span className="lume-room__node-index">0{index + 1}</span>
              <span className="lume-room__node-label">{node.label}</span>
            </button>
          ))}
        </div>

        <aside id="lume-room-detail" className="lume-room__detail" data-projection={active.projection ?? "text"} aria-live="polite">
          <div className="lume-room__detail-meta"><span>{active.status}</span><span>0{activeIndex} / 04</span></div>
          <h2>{active.title}</h2>
          {active.projection === "map" ? <WorldProjection /> : null}
          <p>{active.body}</p>
          <p className="lume-room__limit"><span>BOUNDARY</span>{active.limit}</p>
          <a href={active.sourceUrl} target="_blank" rel="noreferrer">{active.sourceLabel} ↗</a>
        </aside>

        <div className="lume-room__sound" aria-label="Room audio controls">
          <audio ref={fieldAudioRef} preload="none" src={ROOM.audio.src} onPlaying={() => setAudioState("playing")} onPause={() => setAudioState((state) => state === "playing" ? "muted" : state)} onEnded={() => setAudioState("muted")} onError={() => setAudioState("error")} />
          <div className="lume-room__sound-actions">
            <button type="button" data-audio="field" onClick={toggleFieldAudio} aria-pressed={audioState === "playing"}>
              <span className="lume-room__sound-mark" aria-hidden><i /><i /><i /><i /><i /></span>
              <span>{audioButtonLabel(audioState)}</span>
            </button>
            <button type="button" data-audio="procedural" onClick={playSonification} aria-pressed={soundActive}><span>{soundActive ? "ROOM RESPONSE ACTIVE" : "SEND ROOM ECHO"}</span></button>
          </div>
          <small>{ROOM.audio.kind} · {ROOM.audio.label} · {ROOM.audio.place} · {ROOM.audio.credit}</small>
          <a href={ROOM.audio.sourceUrl} target="_blank" rel="noreferrer">{ROOM.audio.sourceLabel} ↗</a>
          <small>{ROOM.proceduralSoundDisclosure}</small>
        </div>

        <div className="lume-room__instruction"><span>DRAG ORCA · ARROWS / ENTER RESET</span><b aria-hidden>→</b><span>SELECT A WALL PROJECTION</span></div>
      </section>
    </main>
  );
}
