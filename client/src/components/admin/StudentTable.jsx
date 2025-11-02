// client/src/components/admin/StatsCard.jsx
import { Card } from 'antd';

export default function StatsCard({ title, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <Card className="rounded-xl shadow-lg border-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-full text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
