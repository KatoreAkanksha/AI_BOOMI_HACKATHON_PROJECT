import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/api";
import {
  LogOut,
  User,
  MessageCircle,
  TrendingUp,
  ArrowLeft,
  Activity,
  Zap,
  Smile,
  Calendar,
  Settings,
  Bell,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

// --- Types ---
type Assessment = {
  id: number;
  user_id: string;
  stress_score: number;
  depression_score: number;
  anxiety_score: number;
  stress_label: string;
  depression_label: string;
  anxiety_label: string;
  confidence_score?: number;
  date: string;
  notes?: string;
};

// --- Mock Data (Fallback) ---
const mockData = [
  { name: 'Mon', stress: 40, depression: 24, anxiety: 24 },
  { name: 'Tue', stress: 30, depression: 13, anxiety: 22 },
  { name: 'Wed', stress: 20, depression: 38, anxiety: 22 },
  { name: 'Thu', stress: 27, depression: 39, anxiety: 20 },
  { name: 'Fri', stress: 18, depression: 48, anxiety: 21 },
  { name: 'Sat', stress: 23, depression: 38, anxiety: 25 },
  { name: 'Sun', stress: 34, depression: 43, anxiety: 21 },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, token, updateUser, clearUser } = useUser();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [chartData, setChartData] = useState(mockData);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    age: user?.ageGroup || "",
    gender: user?.gender || "",
    profilePicture: user?.profilePicture || ""
  });

  // Ensure user is logged in
  useEffect(() => {
    if (!token && !user.user_id) {
      // We only redirect if we have absolutely no identity
      navigate('/');
    }
  }, [user.user_id, token, navigate]);

  // Fetch assessments - PRIVACY-FIRST: User-scoped data only
  useEffect(() => {
    if (user.user_id) {
      apiFetch(`/api/assessments/${user.user_id}`)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Sort DESC (newest first) - assessments[0] = LATEST
            const sortedDesc = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // For chart: Sort ASC (oldest to newest for timeline)
            const sortedAsc = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const formatted = sortedAsc.map(item => ({
              name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              stress: item.stress_score,
              depression: item.depression_score,
              anxiety: item.anxiety_score
            }));

            setChartData(formatted);
            setAssessments(sortedDesc); // Store with newest first
          } else {
            // No data - clear any stale cache
            setAssessments([]);
            setChartData([]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch assessments", err);
          setAssessments([]);
        });
    }
  }, [user.user_id]);

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    updateUser({
      name: editForm.name,
      ageGroup: editForm.age as any,
      gender: editForm.gender,
      profilePicture: editForm.profilePicture
    });
    setIsEditing(false);

    try {
      await apiFetch("/api/user/update", {
        method: 'PUT',
        body: JSON.stringify({
          user_id: user.user_id,
          name: editForm.name,
          age: editForm.age,
          gender: editForm.gender,
          profile_picture: editForm.profilePicture
        })
      });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Glass Card Component
  const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-2xl bg-[#111C44]/60 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-2xl ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1437] text-white font-sans selection:bg-[#0075FF] overflow-x-hidden relative">
      {/* Background Gradients - Consistent with Welcome Page */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 bg-[#0B1437]/80">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">

            {/* Profile Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-white" />
                    )}
                  </div>
                  <span className="font-medium text-sm text-slate-200 hidden sm:block">{user.name || "User"}</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Update your personal information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-slate-800 border-white/10 text-white focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pic">Profile Picture URL</Label>
                    <Input
                      id="pic"
                      placeholder="https://example.com/me.jpg"
                      value={editForm.profilePicture}
                      onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                      className="bg-slate-800 border-white/10 text-white focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="bg-slate-800 border-white/10 text-white focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={editForm.gender}
                      onValueChange={(val) => setEditForm({ ...editForm, gender: val })}
                    >
                      <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                  <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Hero Card */}
          <div className="lg:col-span-7">
            <GlassCard className="h-full p-8 relative overflow-hidden group">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50 group-hover:opacity-70 transition-opacity" />

              <div className="relative z-10">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Welcome back</h2>
                <h1 className="text-3xl font-bold text-white mb-4">Nice to see you, {user.name || "Friend"}!</h1>
                <p className="text-slate-300 max-w-md mb-8">
                  Your mental wellness journey is important. Track your progress, chat with your AI companion, or take a quick assessment properly.
                </p>

                <Button className="bg-white text-slate-900 hover:bg-indigo-50 rounded-xl px-6 py-6 font-semibold shadow-lg shadow-white/10" asChild>
                  <Link to="/talk-with-your-friend" className="flex items-center gap-2">
                    Start Conversation <MessageCircle size={18} />
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </div>

          {/* Quick Stats - Real User Data */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            {/* Anxiety Card */}
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer" >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Activity size={24} />
              </div>
              {assessments.length > 0 ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {assessments[0].anxiety_label}
                  </h3>
                  <p className="text-xs text-slate-500">{assessments[0].anxiety_score}/100</p>
                </>
              ) : (
                <h3 className="text-sm text-slate-500 mb-1">No Data Yet</h3>
              )}
              <p className="text-xs text-slate-400 mt-1">Anxiety</p>
            </GlassCard>

            {/* Stress Card */}
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Zap size={24} />
              </div>
              {assessments.length > 0 ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {assessments[0].stress_label}
                  </h3>
                  <p className="text-xs text-slate-500">{assessments[0].stress_score}/100</p>
                </>
              ) : (
                <h3 className="text-sm text-slate-500 mb-1">No Data Yet</h3>
              )}
              <p className="text-xs text-slate-400 mt-1">Stress</p>
            </GlassCard>

            {/* Depression Card */}
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                <Heart size={24} />
              </div>
              {assessments.length > 0 ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {assessments[0].depression_label}
                  </h3>
                  <p className="text-xs text-slate-500">{assessments[0].depression_score}/100</p>
                </>
              ) : (
                <h3 className="text-sm text-slate-500 mb-1">No Data Yet</h3>
              )}
              <p className="text-xs text-slate-400 mt-1">Depression</p>
            </GlassCard>

            {/* Latest Activity - Full Width */}
            <GlassCard className="col-span-3 p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                  <Smile size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Latest Activity</h3>
                  <p className="text-xs text-slate-400">
                    {assessments.length > 0
                      ? `Last assessment: ${new Date(assessments[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : "Take your first mental wellness assessment"}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-white/10 text-slate-900 hover:bg-white/5 hover:text-white" asChild>
                <Link to="/assessment/chat-test">{assessments.length > 0 ? 'Retake' : 'Start'} Test</Link>
              </Button>
            </GlassCard>
          </div>
        </div>

        {/* Charts & Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Main Line Chart */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Wellness Overview</h3>
                <p className="text-sm text-slate-400">Stress, Anxiety & Depression Trends</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Stress</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Anxiety</span>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAnxiety" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="stress" stroke="#818cf8" fillOpacity={1} fill="url(#colorStress)" strokeWidth={3} />
                  <Area type="monotone" dataKey="anxiety" stroke="#c084fc" fillOpacity={1} fill="url(#colorAnxiety)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Side Progress Cards */}
          <div className="space-y-6">
            {/* Depression Indicator */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Depression Index</h3>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                  />
                </div>
                <span className="text-emerald-400 font-bold">Low Risk</span>
              </div>
              <p className="text-xs text-slate-400">Your recent patterns indicate a stable mood.</p>
            </GlassCard>

            {/* Recent Activity / Recommendations */}
            <GlassCard className="p-6 flex-1">
              <h3 className="text-lg font-bold text-white mb-4">Recommended for You</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Daily Meditation</h4>
                    <p className="text-xs text-slate-400">5 minutes • Stress Relief</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Breathing Exercise</h4>
                    <p className="text-xs text-slate-400">3 minutes • Anxiety Reduction</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        {/* Assessment History Section */}
        <div className="mt-8">
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">Assessment History</h3>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                {assessments.length} Total Records
              </div>
            </div>

            {assessments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-sm border-b border-white/5">
                      <th className="pb-4 font-semibold uppercase tracking-wider">Date</th>
                      <th className="pb-4 font-semibold uppercase tracking-wider">Anxiety</th>
                      <th className="pb-4 font-semibold uppercase tracking-wider">Depression</th>
                      <th className="pb-4 font-semibold uppercase tracking-wider">Stress</th>
                      <th className="pb-4 font-semibold uppercase tracking-wider">Confidence</th>
                      <th className="pb-4 font-semibold uppercase tracking-wider text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {assessments.map((item) => (
                      <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 text-slate-300">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.anxiety_label === 'Severe' ? 'bg-rose-500/10 text-rose-400' :
                            item.anxiety_label === 'Moderate' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>{item.anxiety_label}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.depression_label === 'Severe' ? 'bg-rose-500/10 text-rose-400' :
                            item.depression_label === 'Moderate' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>{item.depression_label}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.stress_label === 'Severe' ? 'bg-rose-500/10 text-rose-400' :
                            item.stress_label === 'Moderate' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>{item.stress_label}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-slate-400 text-sm">
                            {item.confidence_score ? `${Math.round(item.confidence_score * 100)}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadReport(item)}
                            className="text-slate-400 hover:text-[#0075FF] hover:bg-transparent"
                          >
                            <Download size={18} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Activity size={32} />
                </div>
                <p className="text-slate-500">No assessments found yet. Take a moment to check in with yourself.</p>
                <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link to="/assessment/chat-test">Start First Assessment</Link>
                </Button>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

// PDF Helper duplicated for simplicity (better would be a shared lib)
import { Download as DownloadIcon } from "lucide-react";
import jsPDF from "jspdf";

const downloadReport = (item: Assessment) => {
  const doc = new jsPDF();
  const primaryColor = [11, 20, 55];
  const accentColor = [0, 117, 255];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("MindEase - Personalized Wellness Report", 20, 25);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.text(`Date of Assessment: ${new Date(item.date).toLocaleDateString()}`, 20, 55);
  if (item.confidence_score) {
    doc.text(`AI Confidence: ${Math.round(item.confidence_score * 100)}%`, 140, 55);
  }

  doc.setFontSize(18);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("Assessment Results", 20, 85);
  doc.line(20, 88, 190, 88);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);

  const categories = [
    { label: "Anxiety", score: item.anxiety_score, level: item.anxiety_label },
    { label: "Depression", score: item.depression_score, level: item.depression_label },
    { label: "Stress", score: item.stress_score, level: item.stress_label }
  ];

  let startY = 100;
  categories.forEach(cat => {
    doc.setFont("helvetica", "bold");
    doc.text(`${cat.label}:`, 20, startY);
    doc.setFont("helvetica", "normal");
    doc.text(`${cat.level} (Score: ${cat.score}/100)`, 70, startY);
    startY += 10;
  });

  doc.save(`MindEase_History_Report_${new Date(item.date).getTime()}.pdf`);
};
