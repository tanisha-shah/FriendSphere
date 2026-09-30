import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Layers,
  Compass,
  Activity,
  Network,
  Share2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#2dd4bf', '#38bdf8', '#a855f7', '#f43f5e', '#fbbf24', '#34d399'];

export const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Network Growth Mock Data (Simulating monthly social expansion)
  const growthData = [
    { month: 'Jan', connections: 12, reach: 45 },
    { month: 'Feb', connections: 24, reach: 98 },
    { month: 'Mar', connections: 38, reach: 180 },
    { month: 'Apr', connections: 52, reach: 260 },
    { month: 'May', connections: 74, reach: 390 },
    { month: 'Jun', connections: 110, reach: 520 },
  ];

  // Friend Degree Distribution Data
  const degreeDistributionData = [
    { range: '1-3 Connections', users: 14 },
    { range: '4-6 Connections', users: 18 },
    { range: '7-9 Connections', users: 8 },
    { range: '10+ Connections', users: 2 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anData, clData] = await Promise.all([
          api.getAnalytics(),
          api.getClusters(),
        ]);
        setAnalytics(anData);
        setClusters(clData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glow-card rounded-3xl h-28 bg-slate-900" />
          ))}
        </div>
      </div>
    );
  }

  // Interest Distribution Data
  const interestData = (clusters || []).map((cl) => ({
    name: cl.clusterLabel.replace('Circle: ', '').split('&')[0].trim(),
    value: cl.members ? cl.members.length : (cl.memberUserIds?.length || 8),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Social Network Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time insights into your personal network reach, community growth, and connection dynamics.
          </p>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Friends */}
        <div className="glow-card rounded-3xl p-5 border border-slate-800 space-y-1.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Friends</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">8</div>
          <span className="text-[10px] text-emerald-400 font-medium">Direct Connections</span>
        </div>

        {/* Friends of Friends */}
        <div className="glow-card rounded-3xl p-5 border border-slate-800 space-y-1.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Friends of Friends</span>
          <div className="text-2xl sm:text-3xl font-black text-brand-400 font-mono">34</div>
          <span className="text-[10px] text-brand-300 font-medium">2nd-Degree Reach</span>
        </div>

        {/* Communities */}
        <div className="glow-card rounded-3xl p-5 border border-slate-800 space-y-1.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Communities</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">6</div>
          <span className="text-[10px] text-purple-300 font-medium">Active Circles</span>
        </div>

        {/* Network Density */}
        <div className="glow-card rounded-3xl p-5 border border-slate-800 space-y-1.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Network Density</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {(analytics.networkDensity * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-blue-300 font-medium">Connectedness</span>
        </div>

        {/* Avg Distance */}
        <div className="glow-card rounded-3xl p-5 border border-slate-800 space-y-1.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Avg Distance</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">1.8</div>
          <span className="text-[10px] text-amber-300 font-medium">Hops to Anyone</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Network Growth Over Time */}
        <div className="glow-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>Network Expansion Over Time</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Monthly Growth</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reach" stroke="#2dd4bf" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReach)" name="Extended Reach" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Friend Degree Distribution */}
        <div className="glow-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Friend Connectivity Distribution</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Connection Tiers</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={degreeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontSize: '12px' }}
                />
                <Bar dataKey="users" fill="#38bdf8" radius={[8, 8, 0, 0]} name="Users Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest Distribution */}
        <div className="glow-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Interest Distribution Across Network</span>
            </h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interestData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {interestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontSize: '12px' }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Community Sizes */}
        <div className="glow-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Community Sizes & Engagement</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'AI & Machine Learning', members: 156, percent: 85, color: 'bg-teal-500' },
              { name: 'Competitive Programming', members: 92, percent: 60, color: 'bg-blue-500' },
              { name: 'Creative Tech & Game Dev', members: 73, percent: 48, color: 'bg-purple-500' },
              { name: 'Outdoor Expeditions & Wellness', members: 120, percent: 70, color: 'bg-emerald-500' },
            ].map((comm, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{comm.name}</span>
                  <span className="text-slate-400 font-mono">{comm.members} members</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${comm.color} rounded-full`} style={{ width: `${comm.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
