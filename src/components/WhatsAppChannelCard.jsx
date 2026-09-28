import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    ExternalLink, 
    Copy, 
    Check, 
    CheckCircle2, 
    MessageCircle,
    Radio
} from 'lucide-react';

const playClickHaptic = (enabled) => {
    if (!enabled || typeof window === 'undefined') return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
};

const WhatsAppChannelCard = ({ 
    channelUrl = "https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j", 
    groupUrl = "https://chat.whatsapp.com/IFVpqBdZIOGHvdcT1ngaiD",
    soundEnabled = true
}) => {
    // TAB AKTIF: 'channel' ATAU 'group'
    const [activeTab, setActiveTab] = useState('channel');
    const [channelData, setChannelData] = useState(null);
    
    // DATA GRUP SIAP LANGSUNG TAMPIL INSTAN KETIKA DIKLIK TANPA MENUNGGU FETCHING
    const [groupData, setGroupData] = useState({
        name: "Homescreen",
        description: "Grup WhatsApp resmi untuk diskusi, sharing, dan komunikasi bersama.",
        followers: "Komunitas Aktif",
        channel_type: "Grup WhatsApp",
        is_group: true,
        profile_image: "https://pps.whatsapp.net/v/t61.24694-24/700486496_2006249146761512_427075127442207393_n.jpg?ccb=11-4&oh=01_Q5Aa5gGL_N96m-oUziJNNa7fK5DaqRtG1yJs-kjveQ2M0ybVGQ&oe=6AC73B9E&_nc_sid=5e03e0&_nc_cat=109",
        verified: false
    });
    
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [imgError, setImgError] = useState(false);

    const currentUrl = activeTab === 'channel' ? channelUrl : groupUrl;
    const activeData = activeTab === 'channel' ? channelData : groupData;

    const fetchData = async (url, type) => {
        try {
            const res = await fetch(`/api/whatsapp-info?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    if (type === 'channel') setChannelData(data);
                    else setGroupData(prev => ({ ...prev, ...data }));
                }
            }
        } catch (e) {
            console.error("FAILED TO FETCH WHATSAPP DATA:", e);
        }
    };

    // AMBIL DATA SALURAN & SINKRONISASI LATAR BELAKANG SEJAK AWAL
    useEffect(() => {
        setImgError(false);
        fetchData(channelUrl, 'channel');
        fetchData(groupUrl, 'group');
    }, [channelUrl, groupUrl]);

    const handleCopyLink = async () => {
        playClickHaptic(soundEnabled);
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {}
    };

    const avatarSrc = activeData?.profile_image 
        ? `/api/image-proxy?url=${encodeURIComponent(activeData.profile_image)}`
        : null;

    return (
        <div className="wa-channel-card" id="wa-community-widget">
            {/* SWITCHER TAB ATAS (SIMETRIS & BERSIH) */}
            <div className="wa-card-top-controls">
                <div className="wa-tabs-switcher">
                    <button 
                        className={`wa-tab-btn ${activeTab === 'channel' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setActiveTab('channel');
                        }}
                    >
                        <Radio size={13} />
                        <span>Saluran</span>
                    </button>
                    <button 
                        className={`wa-tab-btn ${activeTab === 'group' ? 'active' : ''}`}
                        onClick={() => {
                            playClickHaptic(soundEnabled);
                            setActiveTab('group');
                        }}
                    >
                        <Users size={13} />
                        <span>Grup WhatsApp</span>
                    </button>
                </div>

                <div className="wa-top-tag">
                    <span>Komunitas</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="wa-channel-content">
                        <div className="wa-avatar-container">
                            {avatarSrc && !imgError ? (
                                <img 
                                    src={avatarSrc} 
                                    alt={activeData?.name || "WhatsApp"} 
                                    className="wa-avatar-img"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="wa-avatar-fallback">
                                    <MessageCircle size={24} className="text-[#00B8DB]" />
                                </div>
                            )}
                        </div>

                        <div className="wa-info-col">
                            <div className="wa-title-row">
                                <h3 className="wa-channel-name">
                                    {activeData?.name || (activeTab === 'channel' ? 'Saluran WhatsApp' : 'Grup WhatsApp')}
                                </h3>
                                {activeData?.verified && (
                                    <span className="wa-verified-badge" title="Verified">
                                        <CheckCircle2 size={15} />
                                    </span>
                                )}
                            </div>

                            <div className="wa-meta-row">
                                <span className="wa-meta-pill wa-followers-pill">
                                    <Users size={12} />
                                    <strong>{activeData?.followers || (activeTab === 'channel' ? 'Saluran Resmi' : 'Komunitas Aktif')}</strong>
                                </span>
                            </div>

                            <p className="wa-description-text">
                                {activeData?.description || (activeTab === 'channel' 
                                    ? 'Saluran informasi seputar teknologi, web development, dan update terbaru.' 
                                    : 'Grup WhatsApp resmi untuk diskusi, sharing, dan komunikasi bersama.')}
                            </p>
                        </div>
                    </div>

                    <div className="wa-actions-row">
                        <a 
                            href={currentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="wa-join-btn"
                            onClick={() => playClickHaptic(soundEnabled)}
                        >
                            <i className="fa-brands fa-whatsapp wa-btn-icon"></i>
                            <span>{activeTab === 'channel' ? 'Buka Saluran' : 'Gabung Grup'}</span>
                            <ExternalLink size={14} className="wa-external-icon" />
                        </a>

                        <button 
                            className="wa-copy-btn" 
                            onClick={handleCopyLink}
                            title="Salin Link"
                            aria-label="Salin Link WhatsApp"
                        >
                            {copied ? <Check size={14} className="text-[#34D399]" /> : <Copy size={14} />}
                            <span>{copied ? 'Tersalin' : 'Salin'}</span>
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WhatsAppChannelCard;
