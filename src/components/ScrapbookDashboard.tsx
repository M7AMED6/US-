"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Music, 
  Play, 
  Pause, 
  Calendar, 
  Maximize,
  Sparkles,
  ChevronRight,
  BookOpen,
  Mail
} from "lucide-react";
import { SoundEffects } from "@/utils/SoundEffects";

interface ScrapbookDashboardProps {
  startDate: Date;
  onRestart: () => void;
  userName: string;
}

interface HeartBurst {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function ScrapbookDashboard({ startDate, onRestart, userName }: ScrapbookDashboardProps) {
  // --- Audio / Music State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopCountRef = useRef(0);
  
  // --- Live Timer State ---
  const [timeDiff, setTimeDiff] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // --- Heart Burst Particles ---
  const [heartBursts, setHeartBursts] = useState<HeartBurst[]>([]);

  // --- Message Section States & Config ---
  const MY_MESSAGE = " والله العظيم دي اقل حاجة اقدر اعملهالك انا لو اطول اديكي عيني مش هبخل عليكي والله وبعدين الموضوع الي حصل ده واله كان غصب عني انا مليش غيرك في الدنيا ها ";
  const [displayedMessage, setDisplayedMessage] = useState("");

  // --- Custom Video Player States ---
  const [videoPlaying, setVideoPlaying] = useState<boolean[]>([false, false]);
  const [videoProgress, setVideoProgress] = useState<number[]>([0, 0]);
  const videoRefs = [useRef<HTMLVideoElement | null>(null), useRef<HTMLVideoElement | null>(null)];

  // --- Navigation & Scroll Tracking ---
  const [activeSection, setActiveSection] = useState("home");
  const sectionRefs = {
    home: useRef<HTMLElement | null>(null),
    timer: useRef<HTMLElement | null>(null),
    song: useRef<HTMLElement | null>(null),
    memories: useRef<HTMLElement | null>(null),
    moments: useRef<HTMLElement | null>(null),
  };

  // 1. Initialize Audio Context and source
  useEffect(() => {
    // We use the custom local song from public folder
    const audioUrl = "/song77.mp3";
    const audio = new Audio(audioUrl);
    audio.loop = false; // Disable default looping to handle count manually
    audioRef.current = audio;

    const updateProgress = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        // Fallback to update duration dynamically if event was missed
        setAudioDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    // If metadata is already loaded when effect runs, set duration directly
    if (audio.readyState >= 1) {
      setAudioDuration(audio.duration);
    }

    const handleAudioPlay = () => setIsPlaying(true);
    const handleAudioPause = () => setIsPlaying(false);

    const handleEnded = () => {
      if (loopCountRef.current < 2) {
        loopCountRef.current += 1;
        audio.currentTime = 0;
        audio.play().catch((err) => console.log("Audio replay blocked", err));
      } else {
        setIsPlaying(false);
        loopCountRef.current = 0; // Reset counter for subsequent manual clicks
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", handleAudioPause);
    audio.addEventListener("ended", handleEnded);

    // Sync volume/mute
    audio.muted = SoundEffects.getMutedState();

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("pause", handleAudioPause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);



  // 2. Live Love Timer Updates
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      
      const totalSeconds = Math.floor(diffTime / 1000);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const totalHours = Math.floor(totalMinutes / 60);
      const hours = totalHours % 24;

      // Accurate calendar differences for Years / Months / Days
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      setTimeDiff({ years, months, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // 3. Setup Intersection Observer for floating navigation highlight
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px", // Detect section when center-screen
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Interaction Handlers ---
  const handleMusicPlay = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    SoundEffects.playChime();
    
    // On user interaction, resume Web Audio context
    if (typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext;
      if (AudioContextClass) {
        const tempCtx = new AudioContextClass();
        if (tempCtx.state === "suspended") {
          tempCtx.resume();
        }
      }
    }

    if (audioRef.current.paused) {
      try {
        loopCountRef.current = 0; // Reset loop count on manual play
        audioRef.current.muted = false; // Ensure audio is unmuted on user play
        await audioRef.current.play();
      } catch (err) {
        console.log("Audio play blocked", err);
        const errorName = err instanceof Error ? err.name : "";
        if (errorName === "NotAllowedError" || errorName === "NotSupportedError") {
          setShowPlayOverlay(true);
        }
      }
    } else {
      audioRef.current.pause();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioDuration;
    
    audioRef.current.currentTime = newTime;
    setAudioProgress(percentage * 100);
  };

  const handleTapToPlay = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowPlayOverlay(false);
    SoundEffects.playChime();
    if (audioRef.current) {
      try {
        loopCountRef.current = 0; // Reset loop count on tap-to-play
        audioRef.current.muted = false; // Ensure audio is unmuted on tap-to-play
        await audioRef.current.play();
      } catch (err) {
        console.log("Audio play blocked", err);
        const errorName = err instanceof Error ? err.name : "";
        if (errorName === "NotAllowedError" || errorName === "NotSupportedError") {
          setShowPlayOverlay(true);
        }
      }
    }
  };

  // Spawns heart-burst micro-interactions
  const triggerHeartBurst = (e: React.MouseEvent<HTMLDivElement>) => {
    SoundEffects.playTick();
    const emojis = ["❤️", "💖", "🌸", "💕", "✨", "💓", "💘"];
    const rect = e.currentTarget.getBoundingClientRect();
    // Use fixed page coordinates
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const newBursts = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: startX + (Math.random() - 0.5) * 40,
      y: startY + (Math.random() - 0.5) * 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    setHeartBursts((prev) => [...prev, ...newBursts]);
    
    // Clean up particles
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((b) => !newBursts.find((nb) => nb.id === b.id)));
    }, 1000);
  };

  // Video Controls
  const toggleVideo = (index: number) => {
    const video = videoRefs[index].current;
    if (!video) return;

    SoundEffects.playTick();
    if (videoPlaying[index]) {
      video.pause();
      setVideoPlaying((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    } else {
      video.play().then(() => {
        setVideoPlaying((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      });
    }
  };

  const handleVideoProgress = (index: number) => {
    const video = videoRefs[index].current;
    if (!video) return;
    if (video.duration) {
      setVideoProgress((prev) => {
        const next = [...prev];
        next[index] = (video.currentTime / video.duration) * 100;
        return next;
      });
    }
  };

  const triggerVideoFullscreen = (index: number) => {
    const video = videoRefs[index].current;
    if (!video) return;
    SoundEffects.playTick();
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else {
      const v = video as unknown as Record<string, unknown>;
      if (typeof v.webkitRequestFullscreen === "function") {
        (v.webkitRequestFullscreen as () => void)();
      }
    }
  };

  const scrollToSection = (id: string) => {
    SoundEffects.playChime();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  // Typewriter effect triggered when "moments" section scrolls into view
  useEffect(() => {
    if (activeSection === "moments") {
      const messageText = MY_MESSAGE.trim() || "رسالة قريباً... 💌";
      setDisplayedMessage("");
      const interval = setInterval(() => {
        setDisplayedMessage((prev) => {
          if (prev.length >= messageText.length) {
            clearInterval(interval);
            return prev;
          }
          return messageText.slice(0, prev.length + 1);
        });
      }, 35);
      return () => clearInterval(interval);
    }
  }, [activeSection]);

  // Format date helper
  const formattedDate = startDate.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-pastelBg via-[#FFF4F6] to-[#FFF0F3]">
      
      {/* 1. iOS / Safari Autoplay Permission Overlay */}
      <AnimatePresence>
        {showPlayOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-8 text-center flex flex-col items-center gap-6 shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-softRose/20 flex items-center justify-center text-deepRose cursor-pointer"
                onClick={(e) => handleTapToPlay(e)}
              >
                <Heart size={28} className="fill-current" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">اهلا ياروحي في السايت بتاعك  💕</h2>
                <p className="text-gray-500 text-sm mt-2">دوسي تحت علشان تشغلي الاغنية ♪</p>
              </div>
              <button
                onClick={(e) => handleTapToPlay(e)}
                className="w-full py-3 bg-gradient-to-r from-softRose to-deepRose text-white font-bold rounded-full shadow-lg hover:shadow-xl transition cursor-pointer"
              >
                شغلي الاغنية 🎵
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Heart Burst Particles (Micro-interaction) */}
      <AnimatePresence>
        {heartBursts.map((b) => (
          <motion.span
            key={b.id}
            initial={{ y: 0, x: 0, scale: 0.5, opacity: 1 }}
            animate={{ 
              y: -80 - Math.random() * 40, 
              x: (Math.random() - 0.5) * 80, 
              scale: [0.5, 1.3, 0.7], 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="fixed pointer-events-none z-50 text-2xl"
            style={{ left: b.x, top: b.y }}
          >
            {b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>



      {/* 4. Scroll Container for Snap Sections */}
      <div className="scroll-container no-scrollbar h-screen w-full">
        
        {/* ================= SECTION 1: HOME ================= */}
        <section 
          id="home" 
          ref={sectionRefs.home}
          className="scroll-section w-full flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,182,193,0.1)_0%,transparent_50%)] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-2xl z-10 flex flex-col items-center"
          >
            {/* 1. Subtitle Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#F472B6]/15 to-[#E11D48]/15 border border-[#E11D48]/35 px-6 py-2.5 rounded-full text-sm md:text-base font-bold text-deepRose tracking-wide mb-6 inline-block shadow-sm select-none"
            >
              ذكرياتنا هتعيش دايماً هنا 💕
            </motion.div>

            {/* 2. Interactive Card containing Greeting & title */}
            <motion.div
              className="relative p-8 md:p-10 rounded-[32px] glass-card border border-white/60 shadow-xl max-w-md w-full flex flex-col items-center bg-white/25 backdrop-blur-md mb-8 group overflow-hidden select-none cursor-pointer"
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(244, 114, 182, 0.25)",
                borderColor: "rgba(244, 114, 182, 0.45)"
              }}
              onClick={triggerHeartBurst}
            >
              {/* Decorative side elements */}
              <Sparkles size={20} className="absolute left-4 top-4 text-softRose/80 animate-pulse pointer-events-none" />
              <Heart size={20} className="absolute right-4 bottom-4 text-deepRose/80 animate-bounce pointer-events-none" />
              
              <motion.h2
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-softRose to-deepRose flex items-center gap-2 mb-2"
              >
                أهلاً يا {userName} 💕
              </motion.h2>
              
              <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-softRose to-deepRose mb-2">الريلاشن...</span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tight leading-tight">
                 بتبدأ من هنا
              </h1>
              
              <p className="text-gray-400 text-[10px] mt-4 font-semibold">
                اضغطي هنا علشان ترشي قلوب وسباركلز ✨
              </p>
            </motion.div>
            
            <p className="text-gray-500 font-medium text-sm md:text-base max-w-md leading-relaxed mb-8">
                 مش ده اكيد الي هيبين انا قد ايه بحبك بس اهي حاجة يارب تعجبك <span className="text-deepRose font-bold underline">{formattedDate}</span>.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => scrollToSection("timer")}
                className="px-6 py-3 bg-white/40 border border-white/60 hover:bg-white/60 text-gray-800 font-bold rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow hover:shadow-md cursor-pointer flex items-center gap-2 group"
              >
                <span>خدي لفة</span>
                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition duration-300" />
              </button>
              <button
                onClick={onRestart}
                className="px-4 py-3 text-xs text-gray-400 hover:text-softRose font-semibold transition cursor-pointer underline underline-offset-4"
              >
                تغيير التاريخ
              </button>
            </div>
          </motion.div>
        </section>

        {/* ================= SECTION 2: TIMER ================= */}
        <section 
          id="timer" 
          ref={sectionRefs.timer}
          className="scroll-section w-full flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-4xl w-full z-10 text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl text-softRose mb-2 animate-pulse"
            >
              بقالنا مع بعض...
            </motion.p>
            
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-8"
            >
              ساعات وثواني مفارقتيش بالي 
            </motion.h2>

            {/* Glowing counter grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 mt-4">
              {[
                { label: "سنين", value: timeDiff.years },
                { label: "شهور", value: timeDiff.months },
                { label: "أيام", value: timeDiff.days },
                { label: "ساعات", value: timeDiff.hours },
                { label: "دقائق", value: timeDiff.minutes },
                { label: "ثواني", value: timeDiff.seconds }
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card p-4 md:p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300"
                  style={{ 
                    boxShadow: "0 8px 32px rgba(244, 114, 182, 0.15), 0 0 20px rgba(244, 114, 182, 0.2)"
                  }}
                >
                  {/* Subtle breathing pulse light behind the numbers */}
                  <div className="absolute inset-0 bg-pink-100/10 animate-pulse pointer-events-none" />
                  
                  {/* Flip Number implementation */}
                  <FlipNumber value={String(card.value).padStart(2, "0")} />
                  
                  <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">
                    {card.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: SONG ================= */}
        <section 
          id="song" 
          ref={sectionRefs.song}
          className="scroll-section w-full flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-md w-full z-10 text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl text-softRose mb-2"
            >
              أغنية كل اما اسمعها افتكرك  🎵
            </motion.p>
            
            {/* Custom Music Player Glassmorphism Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card w-full p-6 md:p-8 rounded-[32px] mt-6 relative overflow-hidden border border-white/60 flex flex-col items-center"
            >
              {/* Blur backdrop reflection */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-300/20 rounded-full blur-2xl pointer-events-none" />

              {/* Rotating Album Art */}
              <div className="relative w-44 h-44 mb-6 select-none">
                {/* Vinyl record styling */}
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={isPlaying ? { ease: "linear", duration: 14, repeat: Infinity } : {}}
                  className="w-full h-full rounded-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-4 border-white/30 shadow-2xl p-1 flex items-center justify-center relative"
                >
                  {/* Decorative grooves on vinyl */}
                  <div className="absolute inset-2 border border-white/5 rounded-full" />
                  <div className="absolute inset-6 border border-white/5 rounded-full" />
                  <div className="absolute inset-10 border border-white/5 rounded-full" />
                  
                  {/* Album Cover inside */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-peachStart to-peachEnd flex items-center justify-center border-4 border-gray-950 overflow-hidden relative">
                    <Heart className="w-10 h-10 text-softRose fill-softRose/30 animate-pulse" />
                  </div>
                </motion.div>
                
                {/* Player Needle Arm */}
                <motion.div
                  animate={isPlaying ? { rotate: 18 } : { rotate: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-0 right-0 w-8 h-20 origin-top-right pointer-events-none transform translate-x-1"
                  style={{
                    backgroundImage: "linear-gradient(to bottom, #d1d5db 70%, #9ca3af 100%)",
                    clipPath: "polygon(40% 0, 60% 0, 60% 80%, 100% 100%, 0 100%)",
                    right: "-12px",
                    top: "-15px"
                  }}
                />
              </div>

              {/* Song details */}
              <h3 className="text-xl font-bold text-gray-800 tracking-wide">أغنيتنا الخاصة 💕</h3>
              <p className="text-gray-400 text-xs mt-1 font-semibold uppercase tracking-wider mb-6"> </p>

              {/* Progress Slider */}
              <div className="w-full flex items-center justify-between gap-3 mb-6">
                <span className="text-[10px] font-bold text-gray-400 min-w-[28px] text-right">
                  {formatTime(audioRef.current?.currentTime || 0)}
                </span>
                
                {/* Custom Clickable Bar */}
                <div 
                  onClick={handleProgressBarClick}
                  className="flex-1 h-2 bg-white/40 border border-white/50 rounded-full overflow-hidden cursor-pointer relative"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-softRose to-deepRose rounded-full transition-all duration-100" 
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>

                <span className="text-[10px] font-bold text-gray-400 min-w-[28px] text-left">
                  {formatTime(audioDuration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleMusicPlay(e)}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-softRose to-deepRose text-white flex items-center justify-center shadow-lg hover:shadow-xl transition cursor-pointer"
                  aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                >
                  {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="ml-1 fill-current" />}
                </motion.button>
              </div>

              {/* Waveform Visualization Bars */}
              <div className="flex items-end justify-center gap-1.5 h-8 mt-6">
                {[1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 2].map((val, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-t-full bg-softRose/60 transition-all duration-300 ${
                      isPlaying 
                        ? idx % 4 === 0 
                          ? "animate-wave-1" 
                          : idx % 4 === 1 
                            ? "animate-wave-2" 
                            : idx % 4 === 2 
                              ? "animate-wave-3" 
                              : "animate-wave-4"
                        : "h-[15%]"
                    }`}
                  />
                ))}
              </div>

            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 4: MEMORIES (FAVORITE THINGS) ================= */}
        <section 
          id="memories" 
          ref={sectionRefs.memories}
          className="scroll-section w-full flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-4xl w-full z-10 text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl text-softRose mb-2"
            >
              حاجات انا عارفها ❤️
            </motion.p>
            
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-8"
            >
             ياريت يكونوا صح
            </motion.h2>

            {/* Grid of 6 interactive cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4">
              {[
                { title: "الأكلة المفضلة", desc: "   شاورما وكريب اكيدد", icon: "🍓" },
                { title: "اللون المفضل", desc: " الاسود والاحمر والاخضر  ", icon: "🎨" },
                { title: "الفيلم المفضل", desc: "365 DAY", icon: "🎬" },
                { title: "المكان المفضل", desc: "اسكندرية في الشتا وممكن دهب في الصيف", icon: "📍" },
                { title: "الهواية المفضلة", desc: "  تربية القطط طبعاا", icon: "🌸" },
                { title: "أحلى ذكرى", desc: "أول خروجة لينا تحت المطر", icon: "💌" }
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ 
                    scale: 1.04, 
                    boxShadow: "0 12px 40px rgba(244, 114, 182, 0.25)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={triggerHeartBurst}
                  className="glass-card p-6 md:p-8 rounded-[28px] border border-white/60 flex flex-col justify-between items-center text-center cursor-pointer min-h-[160px] md:min-h-[200px]"
                >
                  <span className="text-4xl md:text-5xl select-none filter drop-shadow-sm mb-3">
                    {card.icon}
                  </span>
                  
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-800">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-snug font-medium">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: MOMENTS (MERGED) ================= */}
        <section 
          id="moments" 
          ref={sectionRefs.moments}
          className="scroll-section w-full flex flex-col items-center justify-center p-6 pb-24 md:pb-6"
        >
          <div className="max-w-4xl w-full z-10 text-center flex flex-col items-center gap-12">
            
            {/* Part 1: Message Card */}
            <div className="w-full max-w-2xl text-center">
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-3xl text-softRose mb-2"
              >
                رسالتي ليكي 💌
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-8"
              >
                 كلام جد ها وياريت نفهمم 
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card p-8 md:p-10 rounded-[32px] border border-white/60 relative overflow-hidden flex flex-col items-center gap-6 shadow-lg shadow-softRose/10"
              >
                {/* Romantic Decorative Frame */}
                <div className="absolute inset-4 border-2 border-dashed border-softRose/30 rounded-[24px] pointer-events-none" />
                
                {/* Mail Icon at top of card */}
                <div className="w-12 h-12 rounded-full bg-white/65 border border-white/80 shadow-sm flex items-center justify-center text-softRose mb-2 z-10">
                  <Mail size={22} className="text-softRose animate-pulse" />
                </div>

                {/* Typewriter message string display */}
                <p
                  lang="ar"
                  style={{
                    fontFamily: 'var(--font-cairo), -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    unicodeBidi: 'plaintext',
                    textAlign: 'right',
                    direction: 'rtl',
                    lineHeight: '2',
                    letterSpacing: '0',
                    wordSpacing: '2px',
                    whiteSpace: 'pre-wrap',
                  }}
                  className="message-arabic-text text-gray-700 text-lg md:text-xl font-medium max-w-lg z-10 min-h-[140px] select-text"
                >
                  {displayedMessage}
                </p>
              </motion.div>
            </div>

            {/* Part 2: Video Gallery */}
            <div className="w-full">
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-3xl text-softRose mb-2"
              >
                 بحب الفديو ده 🎥
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-8"
              >
                 احنا ولا ايه 
              </motion.h2>

              {/* Custom Videos Grid */}
              <div className="grid grid-cols-1 max-w-xl mx-auto gap-6 md:gap-8 mt-4 w-full">
                {[
                  { 
                    title: "يارب بقى يارب", 
                    src: "/vidtik.mp4"
                  }
                ].map((videoData, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                    className="glass-card p-4 rounded-[32px] border border-white/60 relative overflow-hidden flex flex-col gap-4 shadow-lg"
                  >
                    {/* Custom HTML5 video box */}
                    <div className="relative aspect-video w-full rounded-[20px] overflow-hidden bg-gray-950 shadow-inner group">
                      <video
                        ref={videoRefs[idx]}
                        src={videoData.src}
                        playsInline
                        {...{ "webkit-playsinline": "true" }}
                        preload="metadata"
                        muted
                        onTimeUpdate={() => handleVideoProgress(idx)}
                        className="w-full h-full object-cover"
                      />

                      {/* Custom Overlay Controls */}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-20">
                        <div className="w-full flex justify-between items-center">
                          <span className="text-white text-xs font-semibold drop-shadow-md">
                            {videoData.title}
                          </span>
                          <button 
                            onClick={() => triggerVideoFullscreen(idx)}
                            className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer"
                            aria-label="ملء الشاشة"
                          >
                            <Maximize size={16} />
                          </button>
                        </div>

                        {/* Center Play Button Overlay */}
                        <button
                          onClick={() => toggleVideo(idx)}
                          className="w-14 h-14 rounded-full bg-white/90 text-deepRose flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all self-center cursor-pointer"
                          aria-label={videoPlaying[idx] ? "إيقاف مؤقت" : "تشغيل"}
                        >
                          {videoPlaying[idx] ? <Pause size={20} className="fill-current" /> : <Play size={20} className="ml-1 fill-current" />}
                        </button>

                        {/* Video Progress Bar */}
                        <div className="w-full flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-softRose"
                              style={{ width: `${videoProgress[idx]}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Show play icon state indicator overlay if not hovered and video is paused */}
                      {!videoPlaying[idx] && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10">
                          <button
                            onClick={() => toggleVideo(idx)}
                            className="w-12 h-12 rounded-full bg-white/90 text-deepRose flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition"
                            aria-label="تشغيل الفيديو"
                          >
                            <Play size={18} className="ml-0.5 fill-current" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-800 text-right px-1">
                      {videoData.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* ================= FLOATING NAVIGATION BAR ================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg">
        <nav className="glass-nav py-3.5 px-6 rounded-full flex justify-between items-center relative gap-1">
          {[
            { id: "home", label: "الرئيسية", icon: BookOpen },
            { id: "timer", label: "الوقت", icon: Calendar },
            { id: "song", label: "أغنيتنا", icon: Music },
            { id: "memories", label: "حاجاتنا", icon: Sparkles },
            { id: "moments", label: "لحظاتنا", icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-1 text-gray-400 hover:text-softRose transition duration-300 select-none cursor-pointer"
                aria-label={tab.label}
              >
                {/* Highlight Circle for active state */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-y-1 inset-x-2 rounded-2xl bg-gradient-to-r from-peachStart/30 to-peachEnd/30 z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <span className={`relative z-10 transition duration-300 ${isActive ? "text-deepRose scale-110" : "scale-100"}`}>
                  <Icon size={18} />
                </span>

                <span className={`text-[9px] font-bold relative z-10 transition duration-300 ${isActive ? "text-deepRose opacity-100" : "text-gray-400 opacity-60"}`}>
                  {tab.label}
                </span>

                {/* active status indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="w-1.5 h-1.5 rounded-full bg-deepRose mt-0.5"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </div>
  );
}

// --- Flip number custom counter helper ---
function FlipNumber({ value }: { value: string }) {
  return (
    <div className="relative overflow-hidden h-10 md:h-14 flex items-center justify-center min-w-[2.2rem] md:min-w-[3.2rem]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute font-playfair text-2xl md:text-4xl font-extrabold text-deepRose select-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// --- Time formatting helper ---
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
