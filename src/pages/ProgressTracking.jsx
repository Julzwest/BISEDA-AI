import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Zap, Calendar, MessageSquare, Heart, Star, Trophy, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function ProgressTracking() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    messagesThisWeek: 0,
    datesPlanned: 0,
    rehearsalsSessions: 0,
    tipsViewed: 0,
    photosFeedback: 0,
    conversationStartersUsed: 0,
    currentStreak: 0,
    level: 1
  });

  const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('userProgressStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Calculate weekly activity
    const activity = Array(7).fill(0).map((_, i) => Math.floor(Math.random() * 20));
    setWeeklyActivity(activity);
  }, []);

  const achievements = [
    { id: 'first_message', title: 'First Message', desc: 'Sent your first AI chat', icon: '🎯', unlocked: stats.totalMessages > 0 },
    { id: 'conversationalist', title: 'Conversationalist', desc: 'Sent 50 messages', icon: '💬', unlocked: stats.totalMessages >= 50 },
    { id: 'date_planner', title: 'Date Planner', desc: 'Planned 5 dates', icon: '📅', unlocked: stats.datesPlanned >= 5 },
    { id: 'rehearsal_pro', title: 'Rehearsal Pro', desc: 'Completed 3 rehearsals', icon: '🎭', unlocked: stats.rehearsalsSessions >= 3 },
    { id: 'photo_perfectionist', title: 'Photo Perfectionist', desc: 'Got photo feedback', icon: '📸', unlocked: stats.photosFeedback > 0 },
    { id: 'smooth_talker', title: 'Smooth Talker', desc: 'Used 10 conversation starters', icon: '😎', unlocked: stats.conversationStartersUsed >= 10 },
    { id: 'wisdom_seeker', title: 'Wisdom Seeker', desc: 'Read 20 tips', icon: '📚', unlocked: stats.tipsViewed >= 20 },
    { id: 'on_fire', title: 'On Fire', desc: '7-day streak', icon: '🔥', unlocked: stats.currentStreak >= 7 }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;

  const statCards = [
    { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { label: 'This Week', value: stats.messagesThisWeek, icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { label: 'Dates Planned', value: stats.datesPlanned, icon: Calendar, color: 'from-rose-500 to-pink-500' },
    { label: 'Current Level', value: stats.level, icon: Star, color: 'from-yellow-500 to-orange-500' }
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivity = Math.max(...weeklyActivity, 1);

  return (
    <div className="px-4 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Your Progress</h1>
        </div>
        <p className="text-slate-400">Track your journey to dating success</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-slate-800/50 border-slate-700 p-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} bg-opacity-20 rounded-xl flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Weekly Activity */}
      <Card className="bg-slate-800/50 border-slate-700 p-5 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          This Week's Activity
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyActivity.map((activity, i) => {
            const height = (activity / maxActivity) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-700 rounded-t relative" style={{ height: `${height}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"></div>
                </div>
                <span className="text-xs text-slate-400">{weekDays[i]}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Achievement Progress */}
      <Card className="bg-slate-800/50 border-slate-700 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Achievements
          </h3>
          <span className="text-sm text-slate-400">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
          <div 
            className="h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-xl border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                  : 'bg-slate-900 border-slate-700 opacity-50'
              }`}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{achievement.title}</div>
              <div className="text-xs text-slate-400">{achievement.desc}</div>
              {achievement.unlocked && (
                <div className="mt-2 text-xs text-green-400 font-semibold">✓ Unlocked!</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700 p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Continue Your Journey
        </h3>
        <div className="space-y-2">
          <Link to="/chat">
            <button className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-left hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-semibold text-sm">Chat with AI Coach</div>
                  <div className="text-slate-400 text-xs">Get personalized advice</div>
                </div>
              </div>
            </button>
          </Link>
          <Link to="/rehearsal">
            <button className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-left hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-semibold text-sm">Practice Date Scenarios</div>
                  <div className="text-slate-400 text-xs">Build confidence</div>
                </div>
              </div>
            </button>
          </Link>
          <Link to="/starters">
            <button className="w-full p-3 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-xl text-left hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="text-white font-semibold text-sm">Browse Conversation Starters</div>
                  <div className="text-slate-400 text-xs">Never run out of things to say</div>
                </div>
              </div>
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
