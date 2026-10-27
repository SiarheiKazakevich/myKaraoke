import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Settings2, Music2, BookOpen, Mic2, ListMusic, ChevronDown
} from "lucide-react";
import "./styles.css";

const songs = [
  {
    id: "demo",
    title: "Demo Song",
    artist: "Karaoke Room",
    genre: "Demo",
    audio: "/audio/demo.mp3",
    lyrics: [
      { start: 0, end: 4, text: "Добро пожаловать в Karaoke Room" },
      { start: 4, end: 8, text: "Здесь музыка встречается с текстом" },
      { start: 8, end: 12, text: "Добавь свои песни в библиотеку" },
      { start: 12, end: 16, text: "И пой вместе с бегущей строкой" },
      { start: 16, end: 20, text: "🎤 Текст будет следовать за музыкой" },
      { start: 20, end: 24, text: "А режим «Только текст» отключит сопровождение" }
    ]
  },
  {
    id: "example",
    title: "Пример второй песни",
    artist: "Твой исполнитель",
    genre: "Поп",
    audio: "/audio/example.mp3",
    lyrics: [
      { start: 0, end: 4, text: "Это вторая демонстрационная песня" },
      { start: 4, end: 8, text: "Замени её своими данными" },
      { start: 8, end: 12, text: "Формат текста очень простой" },
      { start: 12, end: 16, text: "Каждая строка имеет start и end" }
    ]
  }
];

function App() {
  const [selectedId, setSelectedId] = useState(songs[0].id);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("karaoke");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const lyricsRef = useRef(null);

  const song = songs.find((item) => item.id === selectedId) ?? songs[0];

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [query]);

  const activeIndex = song.lyrics.findIndex(
    (line) => currentTime >= line.start && currentTime < line.end
  );

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedId]);

  useEffect(() => {
    if (!lyricsRef.current || activeIndex < 0) return;
    const node = lyricsRef.current.querySelector(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + seconds)
    );
  };

  const chooseSong = (id) => setSelectedId(id);

  const nextSong = () => {
    const i = songs.findIndex((s) => s.id === selectedId);
    setSelectedId(songs[(i + 1) % songs.length].id);
  };

  const prevSong = () => {
    const i = songs.findIndex((s) => s.id === selectedId);
    setSelectedId(songs[(i - 1 + songs.length) % songs.length].id);
  };

  const formatTime = (value) => {
    if (!Number.isFinite(value)) return "00:00";
    const m = Math.floor(value / 60).toString().padStart(2, "0");
    const s = Math.floor(value % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Mic2 size={20} /></div>
          <div>
            <strong>Karaoke Room</strong>
            <span>Твоя музыкальная коллекция</span>
          </div>
        </div>

        <div className="mode-switch">
          <button className={mode === "karaoke" ? "active" : ""} onClick={() => setMode("karaoke")}>
            <Music2 size={17} /> Караоке
          </button>
          <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>
            <BookOpen size={17} /> Только текст
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="library-title">
            <div>
              <span className="eyebrow">БИБЛИОТЕКА</span>
              <h2>Песни</h2>
            </div>
            <ListMusic size={21} />
          </div>

          <label className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти песню..."
            />
          </label>

          <div className="song-list">
            {filteredSongs.map((item) => (
              <button
                key={item.id}
                className={`song-card ${item.id === selectedId ? "selected" : ""}`}
                onClick={() => chooseSong(item.id)}
              >
                <div className="song-art"><Music2 size={18} /></div>
                <div className="song-info">
                  <strong>{item.title}</strong>
                  <span>{item.artist}</span>
                </div>
                <ChevronDown size={16} className="song-arrow" />
              </button>
            ))}
          </div>

          <div className="sidebar-note">
            <strong>Как добавить песню?</strong>
            <p>Положи MP3 в <code>public/audio</code> и добавь запись в <code>src/main.jsx</code>.</p>
          </div>
        </aside>

        <section className="player">
          <div className="now-playing">
            <span className="eyebrow">СЕЙЧАС ИГРАЕТ</span>
            <h1>{song.title}</h1>
            <p>{song.artist} <span>•</span> {song.genre}</p>
          </div>

          <div className={`lyrics ${mode === "text" ? "text-only" : ""}`} ref={lyricsRef}>
            {song.lyrics.map((line, index) => (
              <div
                key={`${song.id}-${index}`}
                data-index={index}
                className={`lyric-line ${index === activeIndex && mode === "karaoke" ? "current" : ""} ${index < activeIndex && mode === "karaoke" ? "past" : ""}`}
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = line.start;
                }}
              >
                {line.text}
              </div>
            ))}
          </div>

          <div className="controls-wrap">
            <div className="timeline">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={audioRef.current?.duration || 0}
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setCurrentTime(value);
                  if (audioRef.current) audioRef.current.currentTime = value;
                }}
              />
              <span>{formatTime(audioRef.current?.duration || 0)}</span>
            </div>

            <div className="controls">
              <button className="icon-btn" onClick={prevSong} title="Предыдущая"><SkipBack /></button>
              <button className="icon-btn small" onClick={() => skip(-10)} title="-10 секунд">−10</button>
              <button className="play-btn" onClick={togglePlay}>
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
              </button>
              <button className="icon-btn small" onClick={() => skip(10)} title="+10 секунд">+10</button>
              <button className="icon-btn" onClick={nextSong} title="Следующая"><SkipForward /></button>

              <div className="volume">
                {volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="status">
            <Settings2 size={16} />
            <span>Режим: <strong>{mode === "karaoke" ? "музыка + синхронизация" : "только текст"}</strong></span>
          </div>

          <audio
            ref={audioRef}
            src={song.audio}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          />
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);