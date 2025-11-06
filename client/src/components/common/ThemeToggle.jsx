import { BulbOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${className}`}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunOutlined className="text-xl text-amber-500" />
      ) : (
        <BulbOutlined className="text-xl text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}



