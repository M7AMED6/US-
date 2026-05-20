"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar } from "lucide-react";
import { SoundEffects } from "@/utils/SoundEffects";

interface QuestionScreenProps {
  onConfirm: (date: Date) => void;
  userName: string;
}

export default function QuestionScreen({ onConfirm, userName }: QuestionScreenProps) {
  // Setup consistent dropdown selectors for cross-platform iOS + Android compatibility
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i);
  const months = [
    { value: 0, label: "يناير" },
    { value: 1, label: "فبراير" },
    { value: 2, label: "مارس" },
    { value: 3, label: "أبريل" },
    { value: 4, label: "مايو" },
    { value: 5, label: "يونيو" },
    { value: 6, label: "يوليو" },
    { value: 7, label: "أغسطس" },
    { value: 8, label: "سبتمبر" },
    { value: 9, label: "أكتوبر" },
    { value: 10, label: "نوفمبر" },
    { value: 11, label: "ديسمبر" },
  ];

  const [selectedDay, setSelectedDay] = useState("20");
  const [selectedMonth, setSelectedMonth] = useState("4"); // May (0-indexed 4)
  const [selectedYear, setSelectedYear] = useState(String(currentYear - 2)); // default to 2 years ago
  const [heartPopKey, setHeartPopKey] = useState(0);

  // Generate days based on month/year selection
  const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth) + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  const handleConfirm = () => {
    SoundEffects.playChime();
    const date = new Date(Number(selectedYear), Number(selectedMonth), Number(selectedDay));
    onConfirm(date);
  };

  const handleDayChange = (val: string) => {
    SoundEffects.playTick();
    setSelectedDay(val);
    setHeartPopKey((prev) => prev + 1);
  };

  const handleMonthChange = (val: string) => {
    SoundEffects.playTick();
    setSelectedMonth(val);
    setHeartPopKey((prev) => prev + 1);
  };

  const handleYearChange = (val: string) => {
    SoundEffects.playTick();
    setSelectedYear(val);
    setHeartPopKey((prev) => prev + 1);
  };

  // Framer Motion staggered child reveal config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  } as const;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden animate-flow-gradient px-4">
      {/* Soft blurred radial gradient background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,182,193,0.15)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl text-center z-10 flex flex-col items-center"
      >
        {/* Welcome Greeting */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl font-bold text-softRose mb-2"
        >
          أهلاً يا {userName} 💕
        </motion.p>

        {/* Script Font Phrase */}
        <motion.p
          variants={itemVariants}
          className="text-2xl md:text-3xl text-softRose mb-4 px-2"
        >
          كل لحظة معاكي هي ذِكرى غالية عليا
        </motion.p>

        {/* Playfair Header Question */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-800 tracking-tight leading-tight mb-8"
        >
          إمتى اتعرفنا؟
        </motion.h1>

        {/* Glassmorphism Date Picker Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card w-full max-w-lg p-6 md:p-8 mb-10 flex flex-col gap-6 relative shadow-[0_8px_32px_rgba(244,114,182,0.25)] border-white/60 bg-white/20 backdrop-blur-xl"
        >
          {/* Heart Pop Animation Container */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0 z-30">
            <AnimatePresence mode="popLayout">
              {heartPopKey > 0 && (
                <motion.span
                  key={heartPopKey}
                  initial={{ scale: 0.3, opacity: 0, y: 15 }}
                  animate={{ scale: [0.3, 1.4, 1], opacity: [0, 1, 0], y: -30 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 text-3xl pointer-events-none"
                >
                  ❤️
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle icon marker */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/60 border border-white/80 shadow-md flex items-center justify-center text-softRose">
            <Calendar size={20} />
          </div>

          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-2">
            اكتبي التاريخ المميز ده
          </div>

          {/* Selector Columns */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-2">
            {/* Month select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-right pr-1">الشهر</label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full py-3 px-2 md:px-3 bg-white/40 border border-white/60 rounded-xl text-gray-700 text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-softRose/40 transition cursor-pointer appearance-none text-center shadow-inner"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value} className="bg-[#FFF0F3] text-gray-700">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Day select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-right pr-1">اليوم</label>
              <select
                value={selectedDay}
                onChange={(e) => handleDayChange(e.target.value)}
                className="w-full py-3 px-2 md:px-3 bg-white/40 border border-white/60 rounded-xl text-gray-700 text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-softRose/40 transition cursor-pointer appearance-none text-center shadow-inner"
              >
                {days.map((d) => (
                  <option key={d} value={d} className="bg-[#FFF0F3] text-gray-700">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Year select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-right pr-1">السنة</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full py-3 px-2 md:px-3 bg-white/40 border border-white/60 rounded-xl text-gray-700 text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-softRose/40 transition cursor-pointer appearance-none text-center shadow-inner"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#FFF0F3] text-gray-700">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Confirm Button */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleConfirm}
          className="px-10 py-4 bg-gradient-to-r from-softRose to-deepRose text-white font-bold rounded-full shadow-lg shadow-softRose/20 hover:shadow-xl hover:shadow-[0_0_20px_rgba(244,114,182,0.6)] flex items-center gap-3 transition-all duration-300 cursor-pointer text-base md:text-lg group"
        >
          <span>أكد التاريخ ❤️</span>
          <Heart size={18} className="fill-white group-hover:scale-110 transition duration-300" />
        </motion.button>
      </motion.div>
    </div>
  );
}
