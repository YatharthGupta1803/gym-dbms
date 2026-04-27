import { useState, useEffect } from 'react';
import api from '../api';
import { Users, AlertCircle, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeMembers: 0,
    totalTrainers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
    expiringMemberships: 0,
  });

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const cards = [
    { title: 'Active Members', value: stats.activeMembers, icon: Users, color: 'bg-blue-500' },
    { title: "Today's Attendance", value: stats.todayAttendance, icon: Activity, color: 'bg-green-500' },
    { title: 'Monthly Revenue', value: `$${stats.monthlyRevenue}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Expiring Soon (7 Days)', value: stats.expiringMemberships, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
              <div className={`p-4 rounded-full text-white ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
