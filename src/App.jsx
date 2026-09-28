import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Share2, 
    Volume2, 
    VolumeX, 
    MapPin, 
    ArrowUpRight, 
    Clock 
} from 'lucide-react';
import { settings } from './settings.js';
import WhatsAppChannelCard from './components/WhatsAppChannelCard.jsx';
import SociaBuzzIcon from './components/SociaBuzzIcon.jsx';
import MusicPlayer from './MusicPlayer.jsx';
import './style.css';

const playClickHaptic = (enabled) => {
    if (!enabled || typeof window === 'undefined') return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1
        }
    }
};

const linkVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    }
};

const App = () => {
    // DEFAULT SOUND TRUE: PAS MASUK WEB AUTOPLAY LANGSUNG NYALA DAN BERSUARA
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(() => {
        return new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta'
        });
    });

    useEffect(() => {
        const updateClock = () => {
            setCurrentTime(new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Asia/Jakarta'
            }));
        };
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCopySite = async () => {
        playClickHaptic(soundEnabled);
        const siteUrl = settings.site.siteUrl || "https://karinnchans.my.id";
        try {
            await navigator.clipboard.writeText(siteUrl);
        } catch (err) {}
    };

    return (
        <div className="app-wrapper">
            {/* LATAR BELAKANG VIDEO */}
            <video autoPlay muted loop playsInline id="bg-video">
                <source src={settings.profile.videoBg} type="video/mp4" />
            </video>

            {/* OVERLAY GRID CYBER INDUSTRI */}
            <div className="cyber-grid-overlay" />

            {/* BAR TINDAKAN HUD ATAS */}
            <header className="top-hud-bar">
                <div className="hud-clock-pill">
                    <Clock size={12} className="hud-clock-icon" />
                    <span>{currentTime} WIB</span>
                </div>

                <div className="hud-actions-group">
                    {/* TOMBOL TOGGLE SUARA: MENGATUR MODE SUARA/HENING TANPA MEMPAUSE LAGU */}
                    <button 
                        className={`hud-circle-btn ${!soundEnabled ? 'is-muted' : ''}`}
                        onClick={() => {
                            setSoundEnabled(prev => !prev);
                        }}
                        title={soundEnabled ? "Audio Aktif (Klik untuk Mode Hening)" : "Audio Hening (Klik untuk Mengaktifkan Suara)"}
                        aria-label={soundEnabled ? "Nonaktifkan suara" : "Aktifkan suara"}
                    >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    <button 
                        className="hud-circle-btn" 
                        onClick={handleCopySite}
                        title="Salin Situs Web (https://karinnchans.my.id)"
                        aria-label="Salin tautan situs web"
                    >
                        <Share2 size={16} />
                    </button>
                </div>
            </header>

            {/* AREA KONTEN UTAMA */}
            <main className="main-content-area">
                <div className="profile-container">
                    {/* HERO PROFIL */}
                    <div className="profile-hero">
                        <div className="avatar-frame-outer">
                            <span className="corner-bracket top-left" />
                            <span className="corner-bracket top-right" />
                            <span className="corner-bracket bottom-left" />
                            <span className="corner-bracket bottom-right" />
                            <div className="avatar-wrapper">
                                <img 
                                    src={settings.profile.avatar} 
                                    alt={settings.profile.name} 
                                    className="avatar-image" 
                                />
                            </div>
                        </div>

                        <h1 className="display-name">{settings.profile.name}</h1>
                        <p className="handle-text">{settings.profile.handle}</p>

                        <div className="role-headline">
                            <span>{settings.profile.title}</span>
                            <span className="headline-divider">•</span>
                            <span className="location-tag">
                                <MapPin size={12} />
                                {settings.profile.location}
                            </span>
                        </div>

                        <p className="profile-bio-text">
                            {settings.profile.bio}
                        </p>
                    </div>

                    {/* WIDGET SALURAN & GRUP WHATSAPP */}
                    <WhatsAppChannelCard 
                        channelUrl={settings.profile.whatsappChannel || "https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j"}
                        groupUrl={settings.profile.whatsappGroup || "https://chat.whatsapp.com/IFVpqBdZIOGHvdcT1ngaiD"}
                        soundEnabled={soundEnabled}
                    />

                    {/* DAFTAR TAUTAN LINKTREE BERSIH & SIMETRIS */}
                    <motion.div 
                        className="simple-links-list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {settings.links.map((link) => (
                            <motion.a 
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linktree-btn"
                                variants={linkVariants}
                                onClick={() => playClickHaptic(soundEnabled)}
                            >
                                <div className="linktree-icon-box">
                                    {link.icon === 'sociabuzz' ? (
                                        <SociaBuzzIcon size={19} />
                                    ) : (
                                        <i className={link.icon}></i>
                                    )}
                                </div>

                                <div className="linktree-text-col">
                                    <span className="linktree-title">{link.title}</span>
                                    <span className="linktree-subtitle">{link.subtitle}</span>
                                </div>

                                <div className="linktree-arrow">
                                    <ArrowUpRight size={17} />
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* PEMISAH BAGIAN: TULISAN PROJECT DI TENGAH-TENGAH */}
                    <div className="section-divider-center">
                        <span className="section-divider-line" />
                        <span className="section-divider-label">PROJECT</span>
                        <span className="section-divider-line" />
                    </div>

                    {/* DAFTAR TOMBOL PROYEK DENGAN LOGO INTERNET BULAT */}
                    <motion.div 
                        className="simple-links-list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {settings.projects.map((proj) => (
                            <motion.a 
                                key={proj.id}
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linktree-btn"
                                variants={linkVariants}
                                onClick={() => playClickHaptic(soundEnabled)}
                            >
                                <div className="linktree-icon-box">
                                    <i className={proj.icon}></i>
                                </div>

                                <div className="linktree-text-col">
                                    <span className="linktree-title">{proj.title}</span>
                                    <span className="linktree-subtitle">{proj.subtitle}</span>
                                </div>

                                <div className="linktree-arrow">
                                    <ArrowUpRight size={17} />
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                </div>

                {/* FOOTER KREDIT SIMETRIS DI TENGAH */}
                <footer className="footer-credits">
                    <p className="footer-text">
                        © {new Date().getFullYear()} <strong>{settings.profile.name}</strong> • {settings.profile.handle}
                    </p>
                    <div className="footer-indicator">
                        <span>Official Links</span>
                    </div>
                </footer>
            </main>

            {/* KAPSUL PEMUTAR MUSIK DI BAGIAN BAWAH */}
            <MusicPlayer soundEnabled={soundEnabled} />
        </div>
    );
};

export default App;
