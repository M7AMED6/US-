"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Heart } from "lucide-react";
import { SoundEffects } from "@/utils/SoundEffects";

interface SignInScreenProps {
  onSuccess: (name: string) => void;
}

export default function SignInScreen({ onSuccess }: SignInScreenProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    SoundEffects.playChime();
    setIsLoading(true);
    
    // On submit, save the name to localStorage with key userName
    localStorage.setItem("userName", username);
    
    // Simulate brief luxury loader before transition
    setTimeout(() => {
      onSuccess(username);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-tr from-peachStart via-pastelBg to-peachEnd px-4 py-8">
      {/* Dynamic drifting background clouds/ellipses for organic depth */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-pink-200 opacity-30 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-rose-200 opacity-25 blur-3xl animate-float-medium pointer-events-none" />

      {/* Main Glassmorphism Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 flex flex-col items-center"
      >
        {/* Animated Heart Illustration at top */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 mb-6 flex items-center justify-center cursor-pointer"
          onClick={() => SoundEffects.playChime()}
        >
          {/* Outer glowing ring */}
          <div className="absolute inset-0 bg-softRose/20 rounded-full blur-xl animate-pulse" />
          
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-deepRose filter drop-shadow-md relative z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            {/* Draw-in animation paths */}
            <motion.path
              d="M 50,30 
                 C 50,30 65,10 80,25 
                 C 95,40 85,60 50,85 
                 C 15,60 5,40 20,25 
                 C 35,10 50,30 50,30 Z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              fill="url(#heart-grad)"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Inner sparkling heart icon */}
          <Heart className="absolute w-6 h-6 text-white z-20 fill-white" />
        </motion.div>

        {/* Title */}
        <div className="w-full text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold text-gray-800 tracking-wide"
          >
           ادخلي برجلك اليمين ❤️
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-sm mt-2"
          >
          يامسهل الحال يارب.
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Username Input */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative flex flex-col"
          >
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400">
              <User size={18} />
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اكتبي اسمك يا نور عيني "
              className="w-full pr-12 pl-4 py-3.5 bg-white/40 border border-white/60 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-softRose/50 focus:border-softRose transition duration-300 text-sm md:text-base font-medium shadow-inner text-center"
            />
          </motion.div>

          {/* Sign In Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-softRose to-deepRose text-white font-bold rounded-full shadow-lg shadow-deepRose/20 hover:shadow-xl hover:shadow-deepRose/30 hover:brightness-105 active:scale-95 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>يلا ندخل ✨</span>
                <Heart size={16} className="fill-current" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
