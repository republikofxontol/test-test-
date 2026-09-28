import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    Pause, 
    Music2
} from 'lucide-react';
import { settings } from './settings.js';

const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
    }
};

const MusicPlayer = ({ soundEnabled = false }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [coverError, setCoverError] = useState(false);

    // AUTOPLAY AUDIO DAN SIKLUS HIDUP PLAYBACK (AUTO SILENT KETIKA AUTOPLAY DIAKTIFKAN TANPA MEMPAUSE LAGU)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.65;
        audio.loop = true;
        // KETIKA AUTOPLAY NYALA: ATUR MENJADI AUTO SILENT (MUTED) SECARA DEFAULT SEHINGGA BROWSER TIDAK MEMBLOKIR DAN LAGU TETAP BERJALAN
        audio.muted = !soundEnabled;

        const attemptPlay = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                // JIKA BROWSER MEMERLUKAN MUTED UNTUK AUTOPLAY, PASTIKAN MUTED DAN PUTAR LANGSUNG
                try {
                    audio.muted = true;
                    await audio.play();
                    setIsPlaying(true);
                } catch (e) {
                    setIsPlaying(false);
                }
            }
        };

        attemptPlay();

        // PEMULIHAN INTERAKSI PERTAMA PENGGUNA JIKA AUTOPLAY AWAL TERHALANG
        const handleUnlock = () => {
            if (audio.paused) {
                audio.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => {});
            }
            window.removeEventListener('pointerdown', handleUnlock);
            window.removeEventListener('keydown', handleUnlock);
        };

        window.addEventListener('pointerdown', handleUnlock, { once: true });
        window.addEventListener('keydown', handleUnlock, { once: true });

        return () => {
            window.removeEventListener('pointerdown', handleUnlock);
            window.removeEventListener('keydown', handleUnlock);
        };
    }, []);

    // SINKRONISASI STATUS SUARA (AUTO SILENT / AKTIF) TANPA MEMPAUSE ATAU MENGULANG LAGU
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !soundEnabled;
    }, [soundEnabled]);

    const togglePlay = (e) => {
        e?.stopPropagation?.();
        triggerHaptic();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
        }
    };

    return (
        <>
            {/* ELEMEN AUDIO HTML5 ASLI */}
            <audio
                ref={audioRef}
                src={settings.music.audio}
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                    setIsPlaying(false);
                }}
            />

            {/* DOCK KAPSUL CYBER INDUSTRIAL (PUTAR/JEDA LANGSUNG - TANPA POPUP) */}
            <div 
                className="ios-pill-dock"
                id="ios-pill-dock"
            >
                <div 
                    className="ios-island-capsule"
                    onClick={togglePlay}
                    id="ios-island-capsule"
                    role="button"
                    tabIndex={0}
                    aria-label={isPlaying ? "Jeda Audio" : "Putar Audio"}
                >
                    {/* KIRI: SAMPUL ALBUM MUSIK */}
                    <div className="ios-capsule-art">
                        {!coverError ? (
                            <img 
                                src={settings.music.cover} 
                                alt={settings.music.title} 
                                className={`ios-capsule-cover ${isPlaying ? 'playing' : ''}`}
                                onError={() => setCoverError(true)}
                            />
                        ) : (
                            <div className="ios-capsule-fallback">
                                <Music2 size={16} className="text-[#00B8DB]" />
                            </div>
                        )}
                    </div>

                    {/* TENGAH: JUDUL LAGU & NAMA ARTIS */}
                    <div className="ios-capsule-meta">
                        <span className="ios-capsule-title">{settings.music.title}</span>
                        <span className="ios-capsule-artist">{settings.music.artist}</span>
                    </div>

                    {/* KANAN: VISUALISASI GELOMBANG SUARA ANIMATIF */}
                    <div className="ios-capsule-soundwave" aria-hidden="true">
                        {[35, 80, 55, 95, 45].map((barHeight, idx) => (
                            <span 
                                key={idx} 
                                className={`ios-wave-bar ${isPlaying ? 'animated' : ''}`}
                                style={{
                                    height: isPlaying ? `${barHeight}%` : '24%',
                                    animationDelay: `${idx * 0.12}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* TOMBOL PINTAS PUTAR / JEDA */}
                    <button 
                        className="ios-capsule-play-btn"
                        onClick={togglePlay}
                        id="ios-capsule-play-btn"
                        aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
                    >
                        {isPlaying ? (
                            <Pause size={14} className="fill-current" />
                        ) : (
                            <Play size={14} className="fill-current" />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default MusicPlayer;
