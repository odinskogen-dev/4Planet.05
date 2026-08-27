import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { LUME_ORCA_ROOM, type LumeRoomNode } from "@/content/lumeRoom";
import "@/styles/lume-room.css";

const ROOM = LUME_ORCA_ROOM;
const NODES = ROOM.nodes;

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

export default function LumeRoom() {
  const roomRef = useRef<HTMLElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundTimer = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<LumeRoomNode["id"]>("identity");
  const [soundActive, setSoundActive] = useState(false);
  const active = NODES.find((node) => node.id === activeId) ?? NODES[0];
  const activeIndex = NODES.findIndex((node) => node.id === active.id) + 1;

  useEffect(() => () => {
    if (soundTimer.current !== null) window.clearTimeout(soundTimer.current);
    void audioRef.current?.close();
  }, []);

  const moveRoom = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    roomRef.current?.style.setProperty("--look-x", x.toFixed(3));
    roomRef.current?.style.setProperty("--look-y", y.toFixed(3));
  };

  const playSonification = async () => {
    const context = audioRef.current ?? new AudioContext();
    audioRef.current = context;
    if (context.state === "suspended") await context.resume();
    const start = context.currentTime + 0.03;
    pulseTone(context, start, 92, 1.55, 0.085);
    pulseTone(context, start + 0.32, 410, 0.62, 0.045);
    pulseTone(context, start + 0.76, 615, 0.48, 0.03);
    setSoundActive(true);
    if (soundTimer.current !== null) window.clearTimeout(soundTimer.current);
    soundTimer.current = window.setTimeout(() => setSoundActive(false), 2100);
  };

  return (
    <main
      ref={roomRef}
      id="main-content"
      className="lume-room"
      data-active-node={active.id}
      data-sound-active={soundActive}
      onPointerMove={moveRoom}
    >
      <a className="lume-room__skip" href="#lume-room-detail">SKIP TO PROJECTED DETAIL</a>

      <header className="lume-room__header">
        <Link to="/" className="lume-room__brand">4PLANET_</Link>
        <div className="lume-room__coordinates" aria-label="Room identity">
          <span>LUME ROOM 01</span>
          <span>OCE4N_</span>
          <span>SPECIES / ORCA</span>
        </div>
        <Link to={ROOM.species.profileRoute} className="lume-room__exit">EXIT TO SPECIES <span aria-hidden>↗</span></Link>
      </header>

      <section className="lume-room__stage" aria-label="Interactive Orca species room">
        <div className="lume-room__architecture" aria-hidden="true">
          <div className="lume-room__back-wall" />
          <div className="lume-room__left-wall" />
          <div className="lume-room__right-wall" />
          <div className="lume-room__floor" />
          <div className="lume-room__horizon" />
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

        <figure className="lume-room__subject">
          <div className="lume-room__subject-field" aria-hidden="true" />
          <img className="lume-room__subject-echo" src={ROOM.visual.src} alt="" aria-hidden="true" />
          <img
            className="lume-room__subject-image"
            src={ROOM.visual.src}
            alt={ROOM.visual.alt}
          />
          <figcaption>{ROOM.visual.disclosure}</figcaption>
        </figure>

        <div className="lume-room__nodes" aria-label="Explore projected species information">
          {NODES.map((node, index) => (
            <button
              key={node.id}
              type="button"
              className="lume-room__node"
              data-node={node.id}
              data-active={active.id === node.id}
              aria-pressed={active.id === node.id}
              aria-controls="lume-room-detail"
              onClick={() => setActiveId(node.id)}
            >
              <span className="lume-room__node-pulse" aria-hidden />
              <span className="lume-room__node-index">0{index + 1}</span>
              <span className="lume-room__node-label">{node.label}</span>
            </button>
          ))}
        </div>

        <aside id="lume-room-detail" className="lume-room__detail" aria-live="polite">
          <div className="lume-room__detail-meta">
            <span>{active.status}</span>
            <span>0{activeIndex} / 04</span>
          </div>
          <h2>{active.title}</h2>
          <p>{active.body}</p>
          <p className="lume-room__limit"><span>BOUNDARY</span>{active.limit}</p>
          <a href={active.sourceUrl} target="_blank" rel="noreferrer">{active.sourceLabel} ↗</a>
        </aside>

        <div className="lume-room__sound">
          <button type="button" onClick={playSonification} aria-pressed={soundActive}>
            <span className="lume-room__sound-mark" aria-hidden><i /><i /><i /><i /><i /></span>
            <span>{soundActive ? "SIGNAL ACTIVE" : "HEAR ROOM PULSE"}</span>
          </button>
          <small>{ROOM.soundDisclosure}</small>
        </div>

        <div className="lume-room__instruction">
          <span>SELECT ONE SIGNAL</span>
          <b aria-hidden>→</b>
          <span>READ THE SOURCE BOUNDARY</span>
        </div>
      </section>
    </main>
  );
}
