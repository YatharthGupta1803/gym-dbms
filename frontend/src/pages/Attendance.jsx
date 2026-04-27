import { useState, useEffect } from 'react';
import api from '../api';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setAttendance(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Attendance Logs</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 uppercase text-sm">
                <th className="pb-3 pt-2 px-4">Member Name</th>
                <th className="pb-3 pt-2 px-4">Time</th>
                <th className="pb-3 pt-2 px-4">Method</th>
                <th className="pb-3 pt-2 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{a.member_name}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(a.check_in_time).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.method === 'FACE_RECOGNITION' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                      {a.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {a.confidence_score ? `${(parseFloat(a.confidence_score) * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">No attendance logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
