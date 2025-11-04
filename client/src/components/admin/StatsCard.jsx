// Modern StatsCard Component - MetaMask Inspired
import { Card } from 'antd';

export default function StatsCard({ title, value, icon, color = 'blue', trend }) {
  const colorConfigs = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    green: {
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    },
    purple: {
      gradient: 'from-purple-500 to-indigo-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-500',
    },
    orange: {
      gradient: 'from-amber-500 to-rose-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-rose-500',
    },
  };

  const config = colorConfigs[color] || colorConfigs.blue;

  return (
    <Card 
      className={`
        rounded-2xl border-0 shadow-md hover:shadow-xl
        bg-white dark:bg-slate-800/80
        backdrop-blur-sm
        transition-all duration-300
        hover:-translate-y-1
        group
      `}
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
            {title}
          </p>
          <h3 className={`
            text-3xl font-bold mb-1
            ${config.text}
            transition-all duration-300
            group-hover:scale-105
          `}>
            {value}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`
          ${config.iconBg}
          p-4 rounded-2xl
          text-white
          shadow-lg
          transition-all duration-300
          group-hover:scale-110 group-hover:rotate-3
        `}>
          <div className="text-2xl">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Gradient Accent Line */}
      <div className={`h-1 bg-gradient-to-r ${config.gradient} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </Card>
  );
}
