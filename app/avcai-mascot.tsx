"use client";

import { withBasePath } from "./base-path";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AVCAI_CHAT, AVCAI_SUGGESTIONS } from "./avcai-knowledge.mjs";
import { pageCue, shouldShowAvcai, TOFY_LISTEN_MAX_MS, TOFY_LISTEN_PAUSE_MS, tofySpeechText, voiceChunks } from "./avcai-ui.mjs";
import {
  DEFAULT_TOFY_POPUP,
  TOFY_EXIT_SEEN_KEY,
  TOFY_IDLE_LINE,
  isExitIntent,
  isMouseIdle,
} from "./tofy-exit.mjs";

type ChatItem = {
  role: "avcai" | "user";
  text: string;
  kind?: "voice";
  audioUrl?: string;
  href?: string;
  label?: string;
  sources?: Array<{ url: string; title: string }>;
};

type FormPing = { ok?: boolean; phase?: string };

type TofyPopup = {
  enabled: boolean;
  title: string;
  text: string;
  button: string;
  href: string;
};

const VOICE_KEY = "avcai_voice";

function readVoiceOn() {
  try {
    return window.localStorage.getItem(VOICE_KEY) !== "0";
  } catch {
    return true;
  }
}

function livePath(pathname: string) {
  if (typeof window === "undefined") return pathname;
  return `${pathname}${window.location.hash || ""}`;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.slice(value.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Kayıt okunamadı."));
    reader.readAsDataURL(blob);
  });
}

async function readApiJson<T>(response: Response): Promise<T> {
  const raw = await response.text();
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    throw new Error("Tofy şu an cevap veremedi. Sayfayı yenileyip tekrar dene.");
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error("Tofy şu an cevap veremedi. Sayfayı yenileyip tekrar dene.");
  }
}

function formatClipTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function VoiceClip({ url, caption, onPlay }: { url: string; caption: string; onPlay?: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [length, setLength] = useState(0);
  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    const onMeta = () => setLength(audio.duration || 0);
    const onEnd = () => setOn(false);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [url]);
  return (
    <div className={on ? "avcai-voice-note is-playing" : "avcai-voice-note"}>
      <button
        type="button"
        aria-label={on ? "Kaydı durdur" : "Sesli soruyu dinle"}
        onClick={() => {
          const audio = audioRef.current;
          if (!audio) return;
          if (on) {
            audio.pause();
            audio.currentTime = 0;
            setOn(false);
            return;
          }
          onPlay?.();
          void audio.play().then(() => setOn(true)).catch(() => setOn(false));
        }}
      >
        <svg className="avcai-tool-icon" viewBox="0 0 24 24" aria-hidden="true">
          {on ? (
            <rect x="7.2" y="7.2" width="9.6" height="9.6" rx="1.6" fill="currentColor" />
          ) : (
            <path fill="currentColor" d="M8.2 5.2v13.6L19.4 12z" />
          )}
        </svg>
      </button>
      <span className="avcai-voice-bars" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i />
      </span>
      <strong>{formatClipTime(length)}</strong>
      <p>{caption}</p>
    </div>
  );
}

function AvcaiMark({ talking, listening }: { talking: boolean; listening: boolean }) {
  const state = listening ? " is-listening" : talking ? " is-talking" : "";
  return (
    <span className={`avcai-mark${state}`} aria-hidden="true">
      <i className="avcai-antenna" />
      <i className="avcai-ear avcai-ear-left" />
      <i className="avcai-ear avcai-ear-right" />
      <span className="avcai-face">
        <i className="avcai-eye avcai-eye-left" />
        <i className="avcai-eye avcai-eye-right" />
        <i className="avcai-smile" />
      </span>
      <i className="avcai-jet" />
      <i className="status-dot" />
    </span>
  );
}

export function AvcaiMascot({ exitPopup }: { exitPopup?: TofyPopup } = {}) {
  const popup = exitPopup ?? {
    enabled: DEFAULT_TOFY_POPUP.enabled === "on",
    title: DEFAULT_TOFY_POPUP.title,
    text: DEFAULT_TOFY_POPUP.text,
    button: DEFAULT_TOFY_POPUP.button,
    href: DEFAULT_TOFY_POPUP.href,
  };
  const pathname = usePathname() || "/";
  const sendingRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const unlockedRef = useRef(false);
  const voiceRef = useRef(true);
  const speakGen = useRef(0);
  const itemsRef = useRef<ChatItem[]>([]);
  const speakRef = useRef<(text: string) => Promise<void>>(async () => undefined);
  const askRef = useRef<(text: string, extra?: { clip?: Blob }) => Promise<boolean | void>>(async () => undefined);
  const lastMoveRef = useRef(Date.now());
  const idlePingRef = useRef(false);
  const exitSeenRef = useRef(false);
  const listeningRef = useRef(false);
  const pendingAskRef = useRef("");
  const listenGen = useRef(0);
  const recRef = useRef<SpeechRecognition | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const realtimePeerRef = useRef<RTCPeerConnection | null>(null);
  const realtimeChannelRef = useRef<RTCDataChannel | null>(null);
  const realtimeStreamRef = useRef<MediaStream | null>(null);
  const realtimeAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechTextRef = useRef("");
  const speechTimerRef = useRef<number | null>(null);
  const recRestartRef = useRef<number | null>(null);
  const clipPromiseRef = useRef<Promise<Blob | null> | null>(null);
  const finishingRef = useRef(false);
  const draftRef = useRef("");
  const hoverTimerRef = useRef<number | null>(null);
  const hoverHideRef = useRef<number | null>(null);
  const hoverTargetRef = useRef<Element | null>(null);
  const openRef = useRef(false);
  const nudgeRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [talking, setTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const [realtimeOn, setRealtimeOn] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [nudgeOn, setNudgeOn] = useState(false);
  const [nudgeText, setNudgeText] = useState("");
  const [tapOn, setTapOn] = useState(false);
  const [resting, setResting] = useState(false);
  const [exitOn, setExitOn] = useState(false);
  const [pageContext, setPageContext] = useState("");
  const [hash, setHash] = useState("");
  const [items, setItems] = useState<ChatItem[]>([{ role: "avcai", text: AVCAI_CHAT }]);
  const [status, setStatus] = useState<"idle" | "loading" | "speaking" | "listening" | "error">("idle");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");

  const cue = useMemo(() => pageCue(`${pathname}${hash}`), [pathname, hash]);
  const chips = cue.chips.length ? cue.chips : AVCAI_SUGGESTIONS;
  voiceRef.current = voiceOn;
  itemsRef.current = items;
  draftRef.current = draft;
  openRef.current = open;
  nudgeRef.current = nudgeOn;

  useEffect(() => {
    setVoiceOn(readVoiceOn());
    setHash(window.location.hash || "");
    function openDock() {
      setOpen(true);
      void unlockAudio();
    }
    function onHash() {
      setHash(window.location.hash || "");
    }
    function onForm(event: Event) {
      const ping = (event as CustomEvent<FormPing>).detail || {};
      setOpen(true);
      setNudgeOn(false);
      void unlockAudio();
      const text =
        ping.phase === "loading"
          ? "Gönderiyorum, dur bir saniye."
          : ping.ok
            ? "Tamam, form gitti. Ekip bakacak; 7/24 vaat etmem. Takıldığın yer varsa buradan da yaz."
            : "Form gitmedi. Alanlara bir bak; istersen buradan anlat, yönlendireyim.";
      setItems((current) => [...current, { role: "avcai", text }]);
      if (ping.phase !== "loading" && voiceRef.current) void speak(text);
    }
    window.addEventListener("avcai-open", openDock);
    window.addEventListener("avcai-form", onForm);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("avcai-open", openDock);
      window.removeEventListener("avcai-form", onForm);
      window.removeEventListener("hashchange", onHash);
      endRealtime(false);
      stopListen();
    };
  }, []);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      if (item.audioUrl) URL.revokeObjectURL(item.audioUrl);
    });
  }, []);

  useEffect(() => {
    if (open || !shouldShowAvcai(pathname)) {
      setNudgeOn(false);
      return;
    }
    let hideTimer = 0;
    const timer = window.setTimeout(() => {
      setNudgeText(cue.nudge);
      setNudgeOn(true);
      hideTimer = window.setTimeout(() => setNudgeOn(false), 5000);
    }, 4200);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hideTimer);
    };
  }, [open, pathname, cue.id]);

  useEffect(() => {
    if (!shouldShowAvcai(pathname)) return;
    function clearHoverTimer() {
      if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    function onPointerMove(event: PointerEvent) {
      lastMoveRef.current = Date.now();
      idlePingRef.current = false;
      setResting(false);
      void unlockAudio();
      if (event.pointerType === "touch" || openRef.current || window.matchMedia("(hover: none)").matches) return;
      const origin = event.target instanceof Element ? event.target : null;
      const target = origin?.closest("main section, main article, main [data-avcai-context]") || null;
      if (!target || target.closest("#avcai-mascot")) {
        clearHoverTimer();
        hoverTargetRef.current = null;
        return;
      }
      if (hoverTargetRef.current === target) return;
      clearHoverTimer();
      hoverTargetRef.current = target;
      hoverTimerRef.current = window.setTimeout(() => {
        const heading = target.querySelector("h1, h2, h3")?.textContent || target.getAttribute("aria-label") || "bu bölüm";
        setPageContext(heading.replace(/\s+/g, " ").trim().slice(0, 72) || "bu bölüm");
      }, 1800);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      clearHoverTimer();
      hoverTargetRef.current = null;
    };
  }, [pathname]);

  useEffect(() => {
    if (open || !shouldShowAvcai(pathname)) return;
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible" || openRef.current) return;
      if (!isMouseIdle(lastMoveRef.current)) return;
      setResting(true);
      if (idlePingRef.current || nudgeRef.current) return;
      idlePingRef.current = true;
      setNudgeText(TOFY_IDLE_LINE);
      setNudgeOn(true);
      setTapOn(true);
      window.setTimeout(() => setTapOn(false), 1400);
      if (hoverHideRef.current !== null) window.clearTimeout(hoverHideRef.current);
      hoverHideRef.current = window.setTimeout(() => setNudgeOn(false), 5200);
      void speakRef.current(TOFY_IDLE_LINE);
    }, 1000);
    return () => {
      window.clearInterval(tick);
      if (hoverHideRef.current !== null) window.clearTimeout(hoverHideRef.current);
    };
  }, [open, pathname]);

  useEffect(() => {
    if (!popup.enabled || !shouldShowAvcai(pathname)) return;
    try {
      exitSeenRef.current = window.sessionStorage.getItem(TOFY_EXIT_SEEN_KEY) === "1";
    } catch {
      exitSeenRef.current = false;
    }
    function markSeen() {
      exitSeenRef.current = true;
      try {
        window.sessionStorage.setItem(TOFY_EXIT_SEEN_KEY, "1");
      } catch {
        /* yoksay */
      }
    }
    function onLeave(event: MouseEvent) {
      if (window.matchMedia("(hover: none)").matches) return;
      if (exitSeenRef.current || openRef.current) return;
      if (!isExitIntent(event.clientY, event.relatedTarget)) return;
      markSeen();
      setExitOn(true);
    }
    document.documentElement.addEventListener("mouseleave", onLeave);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setExitOn(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("keydown", onKey);
    };
  }, [pathname, popup.enabled]);

  useEffect(() => {
    return () => {
      speakGen.current += 1;
      try {
        sourceRef.current?.stop();
      } catch {
        /* already stopped */
      }
      void ctxRef.current?.close();
      endRealtime(false);
    };
  }, []);

  function audioContext() {
    const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) ctxRef.current = new Ctor();
    return ctxRef.current;
  }

  async function unlockAudio() {
    try {
      const ctx = audioContext();
      if (ctx && ctx.state === "suspended") await ctx.resume();
      if (ctx && !unlockedRef.current) {
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        const osc = ctx.createOscillator();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
      unlockedRef.current = true;
    } catch {
      unlockedRef.current = false;
    }
  }

  function stopSound() {
    speakGen.current += 1;
    try {
      sourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    window.speechSynthesis?.cancel();
  }

  async function playBuffer(buffer: ArrayBuffer) {
    const ctx = audioContext();
    if (ctx) {
      if (ctx.state === "suspended") await ctx.resume();
      try {
        const decoded = await ctx.decodeAudioData(buffer.slice(0));
        try {
          sourceRef.current?.stop();
        } catch {
          /* already stopped */
        }
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);
        sourceRef.current = source;
        await new Promise<void>((resolve, reject) => {
          source.onended = () => resolve();
          try {
            source.start();
          } catch (caught) {
            reject(caught);
          }
        });
        return;
      } catch {
        /* HTMLAudio yedeği */
      }
    }
    const url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
    const player = new Audio(url);
    player.volume = 1;
    await player.play();
    await new Promise<void>((resolve, reject) => {
      player.onended = () => resolve();
      player.onerror = () => reject(new Error("Ses çalınamadı."));
    });
    URL.revokeObjectURL(url);
  }

  async function fetchVoiceChunk(chunk: string) {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(withBasePath("/api/avcai/ses"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunk }),
        });
        const type = (response.headers.get("content-type") || "").toLowerCase();
        if (!response.ok || !type.includes("audio")) throw new Error("Ses üretilemedi.");
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength) return buffer;
        throw new Error("Boş ses yanıtı.");
      } catch (caught) {
        lastError = caught instanceof Error ? caught : new Error("Ses üretilemedi.");
        if (attempt === 0) await new Promise((resolve) => window.setTimeout(resolve, 240));
      }
    }
    throw lastError || new Error("Ses üretilemedi.");
  }

  async function speak(text: string) {
    const chunks = voiceChunks(tofySpeechText(text), 315);
    if (!voiceRef.current || !chunks.length) {
      setTalking(false);
      setStatus("idle");
      return;
    }
    const token = speakGen.current + 1;
    speakGen.current = token;
    try {
      await unlockAudio();
      setStatus("speaking");
      setTalking(true);
      for (const chunk of chunks) {
        if (speakGen.current !== token || !voiceRef.current) break;
        const buffer = await fetchVoiceChunk(chunk);
        if (speakGen.current !== token) break;
        await playBuffer(buffer);
      }
      if (speakGen.current === token) {
        setTalking(false);
        setStatus("idle");
      }
    } catch {
      if (speakGen.current === token) {
        setTalking(false);
        setStatus("idle");
      }
    }
  }

  async function ask(raw: string, extra?: { clip?: Blob }) {
    const text = raw.trim().slice(0, 400);
    if (text.length < 2) return false;
    stopSound();
    if (listeningRef.current) void finishListen(false);
    if (sendingRef.current) {
      pendingAskRef.current = text;
      return true;
    }
    sendingRef.current = true;
    setOpen(true);
    setNudgeOn(false);
    setStatus("loading");
    setTalking(true);
    setError("");
    await unlockAudio();
    const userItem: ChatItem = extra?.clip && extra.clip.size >= 400
      ? { role: "user", text, kind: "voice", audioUrl: URL.createObjectURL(extra.clip) }
      : { role: "user", text };
    const nextItems = [...itemsRef.current, userItem];
    itemsRef.current = nextItems;
    setItems(nextItems);
    let reply = "";
    let href: string | undefined;
    let label: string | undefined;
    let sources: ChatItem["sources"];
    let voice = true;
    let source = "";
    let maintenanceMode: "on" | "off" | "" = "";
    try {
      const response = await fetch(withBasePath("/api/avcai"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          path: livePath(pathname),
          context: pageContext,
          history: nextItems.slice(-8).map((item) => ({ role: item.role, text: item.text })),
        }),
      });
      const payload = await readApiJson<{
        ok?: boolean;
        error?: string;
        reply?: string;
        href?: string;
        label?: string;
        voice?: boolean;
        source?: string;
        maintenanceMode?: "on" | "off";
        sources?: Array<{ url: string; title: string }>;
      }>(response);
      if (!response.ok || !payload?.ok || typeof payload.reply !== "string") {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Yanıt alınamadı.");
      }
      reply = payload.reply;
      href = payload.href;
      label = payload.label;
      sources = payload.sources;
      voice = payload.voice !== false;
      source = payload.source || "";
      maintenanceMode = payload.maintenanceMode === "on" || payload.maintenanceMode === "off" ? payload.maintenanceMode : "";
      setItems((current) => [...current, { role: "avcai", text: reply, href, label, sources }]);
      window.requestAnimationFrame(() => {
        logRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" });
      });
    } catch (caught) {
      setStatus("error");
      setTalking(false);
      setError(caught instanceof Error ? caught.message : "Yanıt alınamadı.");
      sendingRef.current = false;
      return true;
    }
    sendingRef.current = false;
    if (pendingAskRef.current) {
      const queued = pendingAskRef.current;
      pendingAskRef.current = "";
      void ask(queued);
      return true;
    }
    if (source === "personnel" && maintenanceMode) {
      window.setTimeout(() => window.location.reload(), 500);
    }
    if (voice && voiceRef.current) await speak(reply);
    else {
      setTalking(false);
      setStatus("idle");
    }
    return true;
  }
  speakRef.current = speak;
  askRef.current = ask;

  async function startVoiceClip() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const parts: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) parts.push(event.data);
    };
    clipPromiseRef.current = new Promise((resolve) => {
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(parts, { type: recorder.mimeType || mime || "audio/webm" });
        resolve(blob.size >= 400 ? blob : null);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        resolve(null);
      };
    });
    mediaRef.current = recorder;
    recorder.start(200);
    return true;
  }

  function takeVoiceClip() {
    const recorder = mediaRef.current;
    const done = clipPromiseRef.current;
    mediaRef.current = null;
    clipPromiseRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.requestData?.();
      } catch {
        /* bazı tarayıcılarda yok */
      }
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    return done || Promise.resolve(null);
  }

  async function transcribeClip(blob: Blob) {
    try {
      const response = await fetch(withBasePath("/api/avcai/dinle"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: await blobToBase64(blob), mime: blob.type || "audio/webm" }),
      });
      const payload = await readApiJson<{ text?: string }>(response);
      return typeof payload.text === "string" ? payload.text.replace(/\s+/g, " ").trim().slice(0, 400) : "";
    } catch {
      return "";
    }
  }

  async function finishListen(submit = false) {
    if (!listeningRef.current && !recRef.current && !mediaRef.current) return;
    if (submit && finishingRef.current) return;
    finishingRef.current = true;
    listenGen.current += 1;
    listeningRef.current = false;
    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    if (recRestartRef.current !== null) {
      window.clearTimeout(recRestartRef.current);
      recRestartRef.current = null;
    }
    const spokenNow = (speechTextRef.current || draftRef.current).replace(/\s+/g, " ").trim();
    const recognition = recRef.current;
    recRef.current = null;
    try {
      recognition?.stop();
    } catch {
      /* already stopped */
    }
    const clipPromise = takeVoiceClip();
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    const spoken = (speechTextRef.current || spokenNow).replace(/\s+/g, " ").trim();
    speechTextRef.current = "";
    setListening(false);
    if (!submit) setDraft(spokenNow);
    else setDraft("");
    const clip = await clipPromise;
    finishingRef.current = false;
    if (!submit) return;
    let text = spoken;
    if (text.length < 2 && clip) {
      setStatus("loading");
      text = await transcribeClip(clip);
    }
    if (text.length < 2) {
      setStatus("error");
      setError("Seni duyamadım. Mikrofona basıp tekrar söyle.");
      return;
    }
    await askRef.current(text, clip ? { clip } : undefined);
  }

  function stopListen(submitSpeech = false) {
    void finishListen(submitSpeech);
  }

  function endRealtime(showStatus = true) {
    const channel = realtimeChannelRef.current;
    realtimeChannelRef.current = null;
    try {
      channel?.close();
    } catch {
      /* already closed */
    }
    const peer = realtimePeerRef.current;
    realtimePeerRef.current = null;
    try {
      peer?.close();
    } catch {
      /* already closed */
    }
    realtimeStreamRef.current?.getTracks().forEach((track) => track.stop());
    realtimeStreamRef.current = null;
    const audio = realtimeAudioRef.current;
    realtimeAudioRef.current = null;
    if (audio) {
      audio.pause();
      audio.srcObject = null;
    }
    setRealtimeOn(false);
    setListening(false);
    setTalking(false);
    if (showStatus) {
      setStatus("idle");
      setError("");
    }
  }

  function onRealtimeEvent(raw: string) {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }
    const type = typeof event.type === "string" ? event.type : "";
    if (type === "response.created") {
      setTalking(true);
      return;
    }
    if (type === "response.done") {
      setTalking(false);
      return;
    }
    if (type === "error") {
      const detail = event.error && typeof event.error === "object" ? event.error as { message?: unknown } : null;
      setError(typeof detail?.message === "string" ? detail.message : "Canlı görüşmede bir sorun oluştu.");
      return;
    }
    const transcript = typeof event.transcript === "string"
      ? event.transcript.replace(/\s+/g, " ").trim().slice(0, 700)
      : typeof event.text === "string"
        ? event.text.replace(/\s+/g, " ").trim().slice(0, 700)
        : "";
    if (!transcript) return;
    if (type === "conversation.item.input_audio_transcription.completed") {
      setItems((current) => [...current, { role: "user", text: transcript }]);
      void handleRealtimePersonnelCommand(transcript);
    } else if (["response.output_audio_transcript.done", "response.audio_transcript.done", "response.output_text.done"].includes(type)) {
      setItems((current) => [...current, { role: "avcai", text: transcript }]);
    }
    window.requestAnimationFrame(() => logRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" }));
  }

  async function handleRealtimePersonnelCommand(message: string) {
    const normalized = message.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü\s]/giu, " ").replace(/\s+/g, " ").trim();
    if (normalized !== "tofy kahveye gel" && normalized !== "tofy afiyet olsun") return;
    try {
      const response = await fetch(withBasePath("/api/avcai/personel"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = await readApiJson<{ reply?: unknown; maintenanceMode?: unknown }>(response);
      if (typeof result.reply === "string") {
        setItems((current) => [...current, { role: "avcai", text: result.reply as string }]);
      }
      if (response.ok && (result.maintenanceMode === "on" || result.maintenanceMode === "off")) {
        endRealtime(false);
        window.setTimeout(() => window.location.reload(), 350);
      }
    } catch {
      setError("Personel komutu doğrulanamadı.");
    }
  }

  async function startRealtime() {
    if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined") return false;
    let tokenResponse: Response;
    try {
      tokenResponse = await fetch(withBasePath("/api/avcai/realtime/token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: livePath(pathname),
          context: pageContext,
          history: itemsRef.current.slice(-8).map((item) => ({ role: item.role, text: item.text })),
        }),
      });
    } catch {
      return false;
    }
    const token = await tokenResponse.json().catch(() => null) as { value?: unknown } | null;
    if (!tokenResponse.ok || typeof token?.value !== "string") return false;

    try {
      const peer = new RTCPeerConnection();
      realtimePeerRef.current = peer;
      const audio = new Audio();
      audio.autoplay = true;
      realtimeAudioRef.current = audio;
      peer.ontrack = (event) => {
        audio.srcObject = event.streams[0] || new MediaStream([event.track]);
        void audio.play().catch(() => setError("Canlı yanıt sesi açılamadı. Ses iznini kontrol et."));
      };
      peer.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(peer.connectionState) && realtimePeerRef.current === peer) {
          endRealtime(false);
          setStatus("error");
          setError("Canlı görüşme kesildi. Mikrofona basıp yeniden deneyebilirsin.");
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      realtimeStreamRef.current = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const channel = peer.createDataChannel("oai-events");
      realtimeChannelRef.current = channel;
      channel.onmessage = (event) => onRealtimeEvent(String(event.data || ""));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const answer = await fetch(withBasePath("https://api.openai.com/v1/realtime/calls?model=gpt-realtime-2.1"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp || "",
      });
      if (!answer.ok) throw new Error("Canlı görüşme bağlantısı kurulamadı.");
      await peer.setRemoteDescription({ type: "answer", sdp: await answer.text() });
      setRealtimeOn(true);
      setListening(true);
      setStatus("listening");
      return true;
    } catch {
      endRealtime(false);
      return false;
    }
  }

  async function startLegacyListen() {
    if (listeningRef.current) {
      void finishListen(true);
      return;
    }
    stopSound();
    const token = ++listenGen.current;
    listeningRef.current = true;
    setOpen(true);
    setVoiceOn(true);
    voiceRef.current = true;
    setListening(true);
    setStatus("listening");
    setError("");
    await unlockAudio();
    if (listenGen.current !== token) return;
    try {
      await startVoiceClip();
    } catch {
      listeningRef.current = false;
      setListening(false);
      setStatus("error");
      setError("Mikrofon izni kapalı. Tarayıcıdan açıp tekrar dene.");
      return;
    }
    if (listenGen.current !== token) {
      takeVoiceClip();
      return;
    }
    window.setTimeout(() => {
      if (listenGen.current === token) void finishListen(true);
    }, TOFY_LISTEN_MAX_MS);
    const Speech = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (Speech) {
      const rec = new Speech();
      rec.lang = "tr-TR";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        if (listenGen.current !== token) return;
        let hasFinal = false;
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          if (event.results[index].isFinal) hasFinal = true;
        }
        const full = Array.from(event.results)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        speechTextRef.current = full;
        setDraft(full);
        if (!hasFinal) return;
        if (speechTimerRef.current !== null) window.clearTimeout(speechTimerRef.current);
        speechTimerRef.current = window.setTimeout(() => {
          if (listenGen.current !== token) return;
          void finishListen(true);
        }, TOFY_LISTEN_PAUSE_MS);
      };
      rec.onerror = (event) => {
        if (listenGen.current !== token) return;
        if (event.error === "no-speech" || event.error === "aborted") return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          stopListen(false);
          setStatus("error");
          setError("Mikrofon izni kapalı. Tarayıcıdan açıp tekrar dene.");
        }
      };
      rec.onend = () => {
        if (listenGen.current !== token || recRef.current !== rec) return;
        if (recRestartRef.current !== null) window.clearTimeout(recRestartRef.current);
        recRestartRef.current = window.setTimeout(() => {
          recRestartRef.current = null;
          if (listenGen.current !== token || recRef.current !== rec) return;
          try {
            rec.start();
          } catch {
            recRestartRef.current = window.setTimeout(() => {
              recRestartRef.current = null;
              if (listenGen.current !== token || recRef.current !== rec) return;
              try {
                rec.start();
              } catch {
                /* Dinleme açık kalsın; kullanıcı kareye basınca biter. */
              }
            }, 400);
          }
        }, 180);
      };
      recRef.current = rec;
      try {
        rec.start();
      } catch {
        recRestartRef.current = window.setTimeout(() => {
          recRestartRef.current = null;
          if (listenGen.current !== token || recRef.current !== rec) return;
          try {
            rec.start();
          } catch {
            if (listenGen.current !== token) return;
            stopListen(false);
            setStatus("error");
            setError("Mikrofon açılamadı. İzni kontrol edip tekrar dene.");
          }
        }, 200);
      }
    }
  }

  async function startListen() {
    if (realtimeOn) {
      endRealtime();
      return;
    }
    if (listeningRef.current) {
      void finishListen(true);
      return;
    }
    if (sendingRef.current) return;
    await startLegacyListen();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (message.length < 2) return;
    setDraft("");
    void ask(message);
  }

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    voiceRef.current = next;
    try {
      window.localStorage.setItem(VOICE_KEY, next ? "1" : "0");
    } catch {
      return;
    }
    if (!next) {
      endRealtime(false);
      stopSound();
      stopListen();
      setTalking(false);
      setStatus("idle");
      return;
    }
    void (async () => {
      await unlockAudio();
      await speak("Yanıt sesi açık. Mikrofonla da sorabilirsin.");
    })();
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      setNudgeOn(false);
      setTapOn(false);
      setExitOn(false);
      void unlockAudio();
    } else {
      endRealtime(false);
      stopListen();
    }
  }

  const note =
    status === "error"
      ? error
      : status === "loading"
        ? "Bakıyor…"
        : status === "speaking"
          ? "Cevabı okuyor…"
          : status === "listening"
            ? realtimeOn
              ? "Canlı görüşme açık. Bitirmek için kareye bas."
              : "Seni dinliyorum. Bitince kareye bas; sorun ses kaydı olarak gider."
            : voiceOn
              ? "Yazabilir veya mikrofonla sorabilirsin. Yanıtı sesli dinlersin."
              : "Yazabilir veya mikrofonla sorabilirsin. Yanıt sesi kapalı.";

  if (!shouldShowAvcai(pathname)) return null;

  const mascotClassName = ["avcai-mascot", open ? "is-open" : "", resting && !open ? "is-resting" : ""].filter(Boolean).join(" ");

  return (
    <>
      {exitOn ? (
        <div className="tofy-exit" role="dialog" aria-modal="true" aria-labelledby="tofy-exit-title" aria-describedby="tofy-exit-copy" onClick={() => setExitOn(false)}>
          <div className="tofy-exit-card" onClick={(event) => event.stopPropagation()}>
            <strong id="tofy-exit-title">{popup.title}</strong>
            <p id="tofy-exit-copy">{popup.text}</p>
            <div className="tofy-exit-actions">
              <button type="button" className="tofy-exit-ghost" onClick={() => setExitOn(false)}>Şimdi değil</button>
              <Link className="tofy-exit-go" href={popup.href} onClick={() => setExitOn(false)}>{popup.button}</Link>
            </div>
          </div>
        </div>
      ) : null}
    <div className={mascotClassName} id="avcai-mascot">
      {nudgeOn && !open ? (
        <button type="button" className="avcai-nudge" onClick={toggleOpen}>
          {nudgeText || cue.nudge}
        </button>
      ) : null}

      <div className={open ? "avcai-dock is-open" : "avcai-dock"} id="avcai-dock" hidden={!open}>
        <div className="avcai-dock-head">
          <AvcaiMark talking={talking} listening={listening} />
          <div>
            <small>TOFY</small>
            <strong>Sesli ve yazılı asistan</strong>
          </div>
          <button
            type="button"
            className={voiceOn ? "avcai-sound is-on" : "avcai-sound"}
            aria-label={voiceOn ? "Yanıt sesini kapat" : "Yanıt sesini aç"}
            title={voiceOn ? "Yanıt sesini kapat" : "Yanıt sesini aç"}
            aria-pressed={voiceOn}
            onClick={toggleVoice}
          >
            <svg className="avcai-tool-icon" viewBox="0 0 24 24" aria-hidden="true">
              {voiceOn ? (
                <path
                  fill="currentColor"
                  d="M4.2 9.2v5.6h3.3L12.4 20V4L7.5 9.2H4.2zm11.3.6a2.6 2.6 0 0 1 0 4.4l1.3 1.3a4.6 4.6 0 0 0 0-7zM15.4 5.4a6.8 6.8 0 0 1 0 13.2l1.2 1.4a8.6 8.6 0 0 0 0-16z"
                />
              ) : (
                <path
                  fill="currentColor"
                  d="M4.2 9.2v5.6h3.3L12.4 20v-5.2l-2.4-2.4H6.6V9.2zm13.1-5.1-1.2 1.2 2 2A6.6 6.6 0 0 1 19.6 12a6.6 6.6 0 0 1-1.8 4.6l1.2 1.2A8.4 8.4 0 0 0 21.2 12a8.4 8.4 0 0 0-3.9-7.9zM3.1 4.1 1.9 5.3 20.7 24.1l1.2-1.2z"
                />
              )}
            </svg>
          </button>
          <button type="button" className="avcai-close" aria-label="Sohbeti kapat" onClick={toggleOpen}>×</button>
        </div>
        <div className="avcai-log" ref={logRef} aria-live="polite">
          {items.map((item, index) => (
            <article key={`${item.role}-${index}`} className={item.role === "user" ? (item.kind === "voice" ? "is-user is-voice" : "is-user") : "is-avcai"}>
              <small>{item.role === "user" ? (item.kind === "voice" ? "Siz · Sesli soru" : "Siz") : "Tofy"}</small>
              {item.kind === "voice" && item.audioUrl ? (
                <VoiceClip url={item.audioUrl} caption={item.text} onPlay={stopSound} />
              ) : (
                <p>{item.text}</p>
              )}
              {item.role === "avcai" && item.href && item.label ? <Link href={item.href}>{item.label}</Link> : null}
              {item.role === "avcai" && item.sources?.length ? (
                <span className="avcai-sources">
                  {item.sources.map((source, sourceIndex) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title || `Kaynak ${sourceIndex + 1}`}</a>
                  ))}
                </span>
              ) : null}
            </article>
          ))}
        </div>
        <div className="avcai-chips" role="group" aria-label="Hazır yazılar">
          {chips.map((item) => (
            <button key={item.label} type="button" disabled={status === "loading"} onClick={() => void ask(item.text)}>
              {item.label}
            </button>
          ))}
        </div>
        <form className="avcai-form avcai-compose" onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor="avcai-dock-message">Mesaj</label>
          <input
            id="avcai-dock-message"
            name="message"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            minLength={2}
            maxLength={400}
            autoComplete="off"
            disabled={status === "loading"}
            placeholder={listening ? "Seni dinliyorum…" : talking ? "Yaz, Enter hemen gider" : "Sorunu yaz veya sesli sor"}
            className={listening ? "is-listening" : undefined}
          />
          <button
            type="button"
            className={listening ? "avcai-mic is-on" : "avcai-mic"}
            onClick={() => void startListen()}
            disabled={status === "loading" && !listening}
            aria-label={realtimeOn ? "Canlı görüşmeyi bitir" : listening ? "Dinlemeyi durdur ve gönder" : "Mikrofonla sor"}
            title={realtimeOn ? "Canlı görüşmeyi bitir" : listening ? "Dinlemeyi durdur ve gönder" : "Mikrofonla sor"}
          >
            <svg className="avcai-tool-icon" viewBox="0 0 24 24" aria-hidden="true">
              {realtimeOn || listening ? (
                <rect x="7.2" y="7.2" width="9.6" height="9.6" rx="1.6" fill="currentColor" />
              ) : (
                <path
                  fill="currentColor"
                  d="M12 3.4a3.3 3.3 0 0 0-3.3 3.3v4.4a3.3 3.3 0 1 0 6.6 0V6.7A3.3 3.3 0 0 0 12 3.4zm-7 8.2a.9.9 0 0 1 1.8 0 5.2 5.2 0 0 0 10.4 0 .9.9 0 1 1 1.8 0 7 7 0 0 1-6.1 6.9v1.7h2.2a.9.9 0 1 1 0 1.8H9.9a.9.9 0 1 1 0-1.8h2.2v-1.7A7 7 0 0 1 5 11.6z"
                />
              )}
            </svg>
          </button>
          <button className="button button-primary" type="submit" disabled={status === "loading" || draft.trim().length < 2}>
            {status === "loading" ? "…" : "Gönder"}
          </button>
          <small className={status === "error" ? "form-status error" : "form-status"}>{note}</small>
        </form>
      </div>

      <button
        type="button"
        className={["avcai-fab", talking || listening ? "is-talking" : "", tapOn ? "is-tapping" : ""].filter(Boolean).join(" ")}
        aria-expanded={open}
        aria-controls="avcai-dock"
        aria-label={open ? "Tofy sohbetini kapat" : "Tofy’ye sor"}
        onClick={toggleOpen}
      >
        <AvcaiMark talking={talking} listening={listening} />
        <b>Tofy</b>
      </button>
    </div>
    </>
  );
}

export function openAvcai() {
  window.dispatchEvent(new Event("avcai-open"));
}
