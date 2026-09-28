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

const MusicPlayer = ({ soundEnabled = true }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [coverError, setCoverError] = useState(false);

    // Audio Autoplay & Lifecycle
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.65;
        audio.loop = true;

        const attemptPlay = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                setIsPlaying(false);
            }
        };

        attemptPlay();

        // Autoplay unlock on first user interaction if blocked
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
            {/* Native HTML5 Audio Element */}
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

            {/* Industrial Cyber Capsule Dock (Direct Play/Pause - Zero Popups) */}
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
                    {/* Left: Album artwork */}
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

                    {/* Center: Track title & Artist */}
                    <div className="ios-capsule-meta">
                        <span className="ios-capsule-title">{settings.music.title}</span>
                        <span className="ios-capsule-artist">{settings.music.artist}</span>
                    </div>

                    {/* Right: Soundwave Visualizer */}
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

                    {/* Quick Play/Pause button */}
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
