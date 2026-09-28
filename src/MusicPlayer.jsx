import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    Pause, 
    Music2,
    X
} from 'lucide-react';
import { settings } from './settings.js';

const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
    }
};

const MusicPlayer = ({ soundEnabled = true }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [coverError, setCoverError] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);

    // AUTOPLAY AUDIO DAN SIKLUS HIDUP PLAYBACK (PAS MASUK WEB AUTOPLAY LANGSUNG NYALA DAN BERSUARA)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.65;
        audio.loop = true;
        audio.muted = !soundEnabled;

        // FUNGSI UNTUK MEMUTAR AUDIO BERSUARA SECARA OTOMATIS
        const attemptPlay = async () => {
            try {
                audio.muted = !soundEnabled;
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                // JIKA KEBIJAKAN BROWSER MEMERLUKAN INTERAKSI UNTUK SUARA, PUTAR LANGSUNG DAN BUKA SUARA SAAT SENTUHAN PERTAMA
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

        // AKTIFKAN SUARA OTOMATIS BEGITU PENGGUNA BERINTERAKSI PERTAMA KALI DENGAN HALAMAN
        const handleUnlock = () => {
            if (audio) {
                if (soundEnabled) {
                    audio.muted = false;
                }
                if (audio.paused) {
                    audio.play()
                        .then(() => setIsPlaying(true))
                        .catch(() => {});
                }
            }
            window.removeEventListener('pointerdown', handleUnlock);
            window.removeEventListener('touchstart', handleUnlock);
            window.removeEventListener('keydown', handleUnlock);
            window.removeEventListener('click', handleUnlock);
        };

        window.addEventListener('pointerdown', handleUnlock, { once: true });
        window.addEventListener('touchstart', handleUnlock, { once: true });
        window.addEventListener('keydown', handleUnlock, { once: true });
        window.addEventListener('click', handleUnlock, { once: true });

        return () => {
            window.removeEventListener('pointerdown', handleUnlock);
            window.removeEventListener('touchstart', handleUnlock);
            window.removeEventListener('keydown', handleUnlock);
            window.removeEventListener('click', handleUnlock);
        };
    }, []);

    // SINKRONISASI STATUS SUARA (AKTIF / SILENT) TANPA MEMPAUSE ATAU MENGULANG LAGU
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

    // TAMPILKAN PRATINJAU COVER LENGKAP KETIKA COVER DIKLIK (TANPA MENGGANGGU PLAY/PAUSE)
    const handleCoverClick = (e) => {
        e?.stopPropagation?.();
        triggerHaptic();
        setShowCoverModal(true);
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

            {/* DOCK KAPSUL CYBER INDUSTRIAL */}
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
                    {/* KIRI: SAMPUL ALBUM MUSIK (BORDER CONTAINER DIHAPUS, KLIK UNTUK MELIHAT FULL COVER BESERTA BORDER PUTIH GAMBAR) */}
                    <div 
                        className="ios-capsule-art"
                        onClick={handleCoverClick}
                        title="Klik untuk melihat sampul album penuh"
                        role="button"
                        tabIndex={0}
                        aria-label="Lihat sampul album penuh"
                    >
                        {!coverError ? (
                            <img 
                                src={settings.music.cover} 
                                alt={settings.music.title} 
                                className="ios-capsule-cover"
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

            {/* MODAL PRATINJAU COVER PENUH KETIKA COVER DIKLIK */}
            <AnimatePresence>
                {showCoverModal && (
                    <motion.div 
                        className="cover-lightbox-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCoverModal(false)}
                    >
                        <motion.div 
                            className="cover-lightbox-card"
                            initial={{ scale: 0.92, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 12 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="cover-lightbox-header">
                                <div className="cover-lightbox-meta">
                                    <span className="cover-lightbox-title">{settings.music.title}</span>
                                    <span className="cover-lightbox-artist">{settings.music.artist}</span>
                                </div>
                                <button 
                                    className="cover-lightbox-close"
                                    onClick={() => setShowCoverModal(false)}
                                    title="Tutup Pratinjau Sampul"
                                    aria-label="Tutup pratinjau sampul"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="cover-lightbox-img-box">
                                <img 
                                    src={settings.music.cover} 
                                    alt={settings.music.title} 
                                    className="cover-lightbox-img" 
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MusicPlayer;
