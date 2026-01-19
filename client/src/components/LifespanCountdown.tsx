import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownData {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface LifespanCountdownProps {
  initialCountdown: CountdownData;
  healthScore: number;
}

export function LifespanCountdown({ initialCountdown, healthScore }: LifespanCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownData>(initialCountdown);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        let { years, months, days, hours, minutes, seconds } = prev;

        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          hours = 23;
          days -= 1;
        }
        if (days < 0) {
          days = 29;
          months -= 1;
        }
        if (months < 0) {
          months = 11;
          years -= 1;
        }

        if (years < 0) {
          return prev;
        }

        return { years, months, days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    if (healthScore >= 80) return "from-green-500 to-emerald-600";
    if (healthScore >= 60) return "from-blue-500 to-cyan-600";
    if (healthScore >= 40) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getHealthLabel = () => {
    if (healthScore >= 80) return "优秀";
    if (healthScore >= 60) return "良好";
    if (healthScore >= 40) return "一般";
    return "需改善";
  };

  const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <div className="text-4xl md:text-6xl font-bold font-mono tabular-nums text-white drop-shadow-lg">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs md:text-sm text-white/80 uppercase tracking-widest mt-2">{label}</div>
    </motion.div>
  );

  return (
    <div className={`bg-gradient-to-br ${getHealthColor()} rounded-2xl p-8 md:p-12 shadow-2xl`}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">预期寿命倒计时</h2>
        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full">
          <span className="text-white/90 text-sm">健康评分: {healthScore} - {getHealthLabel()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
        <CountdownUnit value={countdown.years} label="年" />
        <CountdownUnit value={countdown.months} label="月" />
        <CountdownUnit value={countdown.days} label="日" />
        <CountdownUnit value={countdown.hours} label="时" />
        <CountdownUnit value={countdown.minutes} label="分" />
        <CountdownUnit value={countdown.seconds} label="秒" />
      </div>

      <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
        <p className="text-white/80 text-sm text-center">
          每日坚持健康打卡，可以改善您的健康评分并延长预期寿命
        </p>
      </div>
    </div>
  );
}
