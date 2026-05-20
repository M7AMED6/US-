"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import BackgroundParticles from "@/components/BackgroundParticles";
import Butterflies from "@/components/Butterflies";
import SignInScreen from "@/components/SignInScreen";
import QuestionScreen from "@/components/QuestionScreen";
import ScrapbookDashboard from "@/components/ScrapbookDashboard";
import { SoundEffects } from "@/utils/SoundEffects";

type ScreenState = "loading" | "signin" | "question" | "dashboard";

export default function Home() {
  const [screenState, setScreenState] = useState<ScreenState>("loading");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [userName, setUserName] = useState<string>("");

  // 1. Initial State Loading & Storage Hydration
  useEffect(() => {
    // Retrieve stored userName and loveDate
    const storedName = localStorage.getItem("userName");
    const storedDate = localStorage.getItem("loveDate");

    if (storedName) {
      setUserName(storedName);
    }
    if (storedDate) {
      setStartDate(new Date(storedDate));
    }

    // Beautiful loading intro delay
    const timer = setTimeout(() => {
      if (storedName && storedDate) {
        setScreenState("dashboard");
      } else if (storedName) {
        setScreenState("question");
      } else {
        setScreenState("signin");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // --- State Transition Handlers ---
  const handleSignInSuccess = (name: string) => {
    SoundEffects.playChime();
    setUserName(name);
    if (startDate) {
      setScreenState("dashboard");
    } else {
      setScreenState("question");
    }
  };

  const handleDateConfirm = (date: Date) => {
    SoundEffects.playChime();
    setStartDate(date);
    localStorage.setItem("loveDate", date.toISOString());
    setScreenState("dashboard");
  };

  const handleRestart = () => {
    SoundEffects.playChime();
    localStorage.removeItem("loveDate");
    setStartDate(null);
    setScreenState("question");
  };

  return (
    <main className="relative min-h-screen w-full select-none overflow-x-hidden">
      {/* Canvas-based high performance background floating hearts & petals */}
      {screenState !== "loading" && <BackgroundParticles />}
      {screenState !== "loading" && <Butterflies />}

      <AnimatePresence mode="wait">
        
        {/* A. LOADING SCREEN */}
        {screenState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-tr from-peachStart via-pastelBg to-peachEnd"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.12, 1],
                filter: ["drop-shadow(0 0 4px rgba(225,29,72,0.1))", "drop-shadow(0 0 16px rgba(225,29,72,0.4))", "drop-shadow(0 0 4px rgba(225,29,72,0.1))"]
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-deepRose flex items-center justify-center mb-4 cursor-pointer"
              onClick={() => SoundEffects.playChime()}
            >
              <Heart size={64} className="fill-current" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide"
            >
              كشكول ذكرياتنا
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2"
            >
              بنفتكر كل لحظة حلوة...
            </motion.p>
          </motion.div>
        )}

        {/* B. SIGN IN SCREEN */}
        {screenState === "signin" && (
          <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          >
            <SignInScreen onSuccess={handleSignInSuccess} />
          </motion.div>
        )}

        {/* C. QUESTION / DATE SELECTOR SCREEN */}
        {screenState === "question" && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          >
            <QuestionScreen onConfirm={handleDateConfirm} userName={userName} />
          </motion.div>
        )}

        {/* D. SCRAPBOOK DASHBOARD */}
        {screenState === "dashboard" && startDate && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <ScrapbookDashboard startDate={startDate} onRestart={handleRestart} userName={userName} />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
