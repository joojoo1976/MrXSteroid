"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date;
  lang: 'ar' | 'en';
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, lang }) => {
  const calculateTimeLeft = () => {
    const difference = +endDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return;
    }
    timerComponents.push(
      <span key={interval} className="mx-1 p-2 bg-gray-700 rounded-md text-lg font-mono">
        {timeLeft[interval as keyof typeof timeLeft]} {lang === 'ar' ? getArabicUnit(interval) : interval}
      </span>
    );
  });

  const getArabicUnit = (unit: string) => {
    switch (unit) {
      case 'days': return 'أيام';
      case 'hours': return 'ساعات';
      case 'minutes': return 'دقائق';
      case 'seconds': return 'ثواني';
      default: return '';
    }
  };

  return (
    <div className="flex justify-center items-center text-white">
      {timerComponents.length ? timerComponents : <span className="text-lg">{lang === 'ar' ? 'انتهى العرض!' : 'Offer Expired!'}</span>}
    </div>
  );
};

export default CountdownTimer;