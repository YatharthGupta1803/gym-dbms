import { useState, useEffect, useRef } from 'react';
import api from '../api';
import Webcam from 'react-webcam';
import { Plus, X, Search } from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', phone: '', plan_id: '', trainer_id: ''
  });
  
  const webcamRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, pRes, tRes] = await Promise.all([
        api.get('/members'),
        api.get('/plans'),
        api.get('/trainers')
      ]);
      setMembers(mRes.data);
      setPlans(pRes.data);
      setTrainers(tRes.data);
      if(pRes.data.length > 0) {
        setFormData(prev => ({ ...prev, plan_id: pRes.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const captureFrame = () => {
    const src = webcamRef.current.getScreenshot();
    if (src) {
      fetch(src)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "face.jpg", { type: "image/jpeg" });
          setImageFile(file);
        });
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) {
      data.append('image', imageFile);
    }
    
    try {
      await api.post('/members', data);
      setIsModalOpen(false);
      setImageFile(null);
      setFormData({ name: '', age: '', gender: 'Male', phone: '', plan_id: plans[0]?.id || '', trainer_id: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete member?')) {
      await api.delete(`/members/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Members</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 uppercase text-sm">
                <th className="pb-3 pt-2 px-4">Name</th>
                <th className="pb-3 pt-2 px-4">Phone</th>
                <th className="pb-3 pt-2 px-4">Plan</th>
                <th className="pb-3 pt-2 px-4">Join Date</th>
                <th className="pb-3 pt-2 px-4">Expiry Date</th>
                <th className="pb-3 pt-2 px-4">Status</th>
                <th className="pb-3 pt-2 px-4">Face Encoded</th>
                <th className="pb-3 pt-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{m.name}</td>
                  <td className="py-3 px-4 text-gray-600">{m.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{m.plan_name}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(m.join_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(m.expiry_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{m.face_encoding ? '✅ Yes' : '❌ No'}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Member</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500 hover:text-gray-800" /></button>
            </div>
            
            <form onSubmit={handleAddMember} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select className="w-full border rounded-lg px-3 py-2" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select required className="w-full border rounded-lg px-3 py-2" value={formData.plan_id} onChange={e => setFormData({...formData, plan_id: e.target.value})}>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer (Optional)</label>
                <select className="w-full border rounded-lg px-3 py-2" value={formData.trainer_id} onChange={e => setFormData({...formData, trainer_id: e.target.value})}>
                  <option value="">None</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="col-span-2 mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Face Registration</h3>
                {imageFile ? (
                  <div className="flex flex-col items-center border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <img src={URL.createObjectURL(imageFile)} alt="captured" className="w-48 h-48 object-cover rounded-lg mb-4 shadow" />
                    <button type="button" onClick={() => setImageFile(null)} className="text-red-500 hover:underline">Retake Photo</button>
                    <p className="text-sm text-green-600 mt-2 font-medium">Face captured successfully!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-64 h-48 object-cover rounded-lg mb-4 shadow" />
                    <button type="button" onClick={captureFrame} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors shadow">
                      Capture Face
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">Ensure standard lighting. Face the camera directly.</p>
                  </div>
                )}
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow shadow-blue-500/30">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
