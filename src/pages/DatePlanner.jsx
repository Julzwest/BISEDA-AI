import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, Clock, MapPin, CheckSquare, Square, Plus, Trash2, 
  Heart, Star, Sparkles, ChevronRight, Edit, Save, X,
  ThumbsUp, ThumbsDown, Meh, BookOpen, Target
} from 'lucide-react';

export default function DatePlanner() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [dates, setDates] = useState([]);
  const [journals, setJournals] = useState([]);
  const [showAddDate, setShowAddDate] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);

  // New date form
  const [newDate, setNewDate] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    notes: '',
    checklist: [
      { id: 1, text: 'Choose outfit', done: false },
      { id: 2, text: 'Confirm reservation', done: false },
      { id: 3, text: 'Plan conversation topics', done: false },
      { id: 4, text: 'Check directions', done: false },
    ]
  });

  // New journal form
  const [newJournal, setNewJournal] = useState({
    dateId: null,
    dateName: '',
    dateDate: '',
    rating: 'good',
    highlights: '',
    improvements: '',
    lessonsLearned: '',
    wouldRepeat: true,
    nextSteps: ''
  });

  // Load from localStorage
  useEffect(() => {
    const savedDates = localStorage.getItem('biseda_dates');
    const savedJournals = localStorage.getItem('biseda_journals');
    if (savedDates) setDates(JSON.parse(savedDates));
    if (savedJournals) setJournals(JSON.parse(savedJournals));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('biseda_dates', JSON.stringify(dates));
  }, [dates]);

  useEffect(() => {
    localStorage.setItem('biseda_journals', JSON.stringify(journals));
  }, [journals]);

  const addDate = () => {
    if (!newDate.name || !newDate.date) return;
    const date = {
      ...newDate,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setDates([...dates, date]);
    setNewDate({
      name: '',
      date: '',
      time: '',
      venue: '',
      notes: '',
      checklist: [
        { id: 1, text: 'Choose outfit', done: false },
        { id: 2, text: 'Confirm reservation', done: false },
        { id: 3, text: 'Plan conversation topics', done: false },
        { id: 4, text: 'Check directions', done: false },
      ]
    });
    setShowAddDate(false);
  };

  const deleteDate = (id) => {
    setDates(dates.filter(d => d.id !== id));
  };

  const toggleChecklistItem = (dateId, itemId) => {
    setDates(dates.map(d => {
      if (d.id === dateId) {
        return {
          ...d,
          checklist: d.checklist.map(item => 
            item.id === itemId ? { ...item, done: !item.done } : item
          )
        };
      }
      return d;
    }));
  };

  const addChecklistItem = (dateId, text) => {
    if (!text.trim()) return;
    setDates(dates.map(d => {
      if (d.id === dateId) {
        return {
          ...d,
          checklist: [...d.checklist, { id: Date.now(), text, done: false }]
        };
      }
      return d;
    }));
  };

  const addJournal = () => {
    if (!newJournal.dateName) return;
    const journal = {
      ...newJournal,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setJournals([journal, ...journals]);
    setNewJournal({
      dateId: null,
      dateName: '',
      dateDate: '',
      rating: 'good',
      highlights: '',
      improvements: '',
      lessonsLearned: '',
      wouldRepeat: true,
      nextSteps: ''
    });
    setShowAddJournal(false);
  };

  const deleteJournal = (id) => {
    setJournals(journals.filter(j => j.id !== id));
    setSelectedJournal(null);
  };

  const getCountdown = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) return { text: t('datePlanner.passed', 'Passed'), color: 'text-slate-500' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days === 0) {
      if (hours === 0) return { text: t('datePlanner.today', 'Today! 🎉'), color: 'text-green-400' };
      return { text: `${hours}h`, color: 'text-yellow-400' };
    }
    if (days === 1) return { text: t('datePlanner.tomorrow', 'Tomorrow'), color: 'text-orange-400' };
    return { text: `${days} ${t('datePlanner.days', 'days')}`, color: 'text-purple-400' };
  };

  const getRatingEmoji = (rating) => {
    switch (rating) {
      case 'amazing': return '🔥';
      case 'good': return '😊';
      case 'okay': return '😐';
      case 'bad': return '😕';
      default: return '😊';
    }
  };

  const upcomingDates = dates.filter(d => new Date(d.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastDates = dates.filter(d => new Date(d.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/50">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{t('datePlanner.title', 'Date Planner')}</h1>
        <p className="text-slate-400 text-sm">{t('datePlanner.subtitle', 'Plan, prepare & reflect on your dates')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('datePlanner.upcoming', 'Upcoming')} ({upcomingDates.length})
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'journal'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('datePlanner.journal', 'Journal')} ({journals.length})
        </button>
      </div>

      {/* Upcoming Dates Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {/* Add Date Button */}
          <Button
            onClick={() => setShowAddDate(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('datePlanner.planDate', 'Plan a Date')}
          </Button>

          {/* Add Date Form */}
          {showAddDate && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  {t('datePlanner.newDate', 'New Date')}
                </h3>
                <button onClick={() => setShowAddDate(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <Input
                  value={newDate.name}
                  onChange={(e) => setNewDate({...newDate, name: e.target.value})}
                  placeholder={t('datePlanner.theirName', "Their name")}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={newDate.date}
                    onChange={(e) => setNewDate({...newDate, date: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <Input
                    type="time"
                    value={newDate.time}
                    onChange={(e) => setNewDate({...newDate, time: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <Input
                  value={newDate.venue}
                  onChange={(e) => setNewDate({...newDate, venue: e.target.value})}
                  placeholder={t('datePlanner.venue', "Venue / Location")}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Textarea
                  value={newDate.notes}
                  onChange={(e) => setNewDate({...newDate, notes: e.target.value})}
                  placeholder={t('datePlanner.notes', "Notes (topics to discuss, things to remember...)")}
                  className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
                />
                <Button onClick={addDate} className="w-full bg-pink-500 hover:bg-pink-600">
                  <Save className="w-4 h-4 mr-2" />
                  {t('datePlanner.saveDate', 'Save Date')}
                </Button>
              </div>
            </Card>
          )}

          {/* Upcoming Dates List */}
          {upcomingDates.length > 0 ? (
            <div className="space-y-4">
              {upcomingDates.map((date) => {
                const countdown = getCountdown(date.date);
                const completedItems = date.checklist.filter(i => i.done).length;
                const totalItems = date.checklist.length;
                
                return (
                  <Card key={date.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
                    {/* Date Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{date.name}</h3>
                          <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(date.date).toLocaleDateString()} {date.time && `at ${date.time}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${countdown.color}`}>{countdown.text}</span>
                        <button onClick={() => deleteDate(date.id)} className="block ml-auto mt-1 text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Venue */}
                    {date.venue && (
                      <div className="flex items-center gap-2 text-slate-300 mb-3">
                        <MapPin className="w-4 h-4 text-pink-400" />
                        {date.venue}
                      </div>
                    )}

                    {/* Checklist Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">{t('datePlanner.checklist', 'Pre-Date Checklist')}</span>
                        <span className="text-sm text-purple-400">{completedItems}/{totalItems}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                          style={{ width: `${(completedItems/totalItems)*100}%` }}
                        />
                      </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2">
                      {date.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem(date.id, item.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                            item.done ? 'bg-green-500/10' : 'bg-slate-900/50 hover:bg-slate-800'
                          }`}
                        >
                          {item.done ? (
                            <CheckSquare className="w-5 h-5 text-green-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500" />
                          )}
                          <span className={`text-sm ${item.done ? 'text-slate-500 line-through' : 'text-white'}`}>
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Notes */}
                    {date.notes && (
                      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400 text-sm">{date.notes}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">{t('datePlanner.noDates', 'No upcoming dates')}</h3>
              <p className="text-slate-400 text-sm">{t('datePlanner.planFirst', 'Plan your first date to get started!')}</p>
            </Card>
          )}
        </div>
      )}

      {/* Journal Tab */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {/* Add Journal Button */}
          <Button
            onClick={() => setShowAddJournal(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-4"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {t('datePlanner.addReflection', 'Add Date Reflection')}
          </Button>

          {/* Add Journal Form */}
          {showAddJournal && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  {t('datePlanner.dateReflection', 'Date Reflection')}
                </h3>
                <button onClick={() => setShowAddJournal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <Input
                  value={newJournal.dateName}
                  onChange={(e) => setNewJournal({...newJournal, dateName: e.target.value})}
                  placeholder={t('datePlanner.whoWith', "Who was the date with?")}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Input
                  type="date"
                  value={newJournal.dateDate}
                  onChange={(e) => setNewJournal({...newJournal, dateDate: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />

                {/* Rating */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">{t('datePlanner.howWasIt', 'How was it?')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'amazing', emoji: '🔥', label: t('datePlanner.amazing', 'Amazing') },
                      { id: 'good', emoji: '😊', label: t('datePlanner.good', 'Good') },
                      { id: 'okay', emoji: '😐', label: t('datePlanner.okay', 'Okay') },
                      { id: 'bad', emoji: '😕', label: t('datePlanner.bad', 'Bad') },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setNewJournal({...newJournal, rating: r.id})}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          newJournal.rating === r.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-700 bg-slate-800/50'
                        }`}
                      >
                        <div className="text-xl mb-1">{r.emoji}</div>
                        <p className="text-xs text-slate-300">{r.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  value={newJournal.highlights}
                  onChange={(e) => setNewJournal({...newJournal, highlights: e.target.value})}
                  placeholder={t('datePlanner.highlights', "✨ Highlights - What went well?")}
                  className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
                />
                <Textarea
                  value={newJournal.improvements}
                  onChange={(e) => setNewJournal({...newJournal, improvements: e.target.value})}
                  placeholder={t('datePlanner.improvements', "📝 What could have been better?")}
                  className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
                />
                <Textarea
                  value={newJournal.lessonsLearned}
                  onChange={(e) => setNewJournal({...newJournal, lessonsLearned: e.target.value})}
                  placeholder={t('datePlanner.lessons', "💡 Lessons learned for next time")}
                  className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
                />

                {/* Would Repeat */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">{t('datePlanner.seeAgain', 'Would you see them again?')}</span>
                  <button
                    onClick={() => setNewJournal({...newJournal, wouldRepeat: true})}
                    className={`p-2 rounded-lg ${newJournal.wouldRepeat ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setNewJournal({...newJournal, wouldRepeat: false})}
                    className={`p-2 rounded-lg ${!newJournal.wouldRepeat ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>

                <Textarea
                  value={newJournal.nextSteps}
                  onChange={(e) => setNewJournal({...newJournal, nextSteps: e.target.value})}
                  placeholder={t('datePlanner.nextSteps', "🎯 Next steps (if any)")}
                  className="bg-slate-900 border-slate-700 text-white min-h-[60px]"
                />

                <Button onClick={addJournal} className="w-full bg-purple-500 hover:bg-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  {t('datePlanner.saveReflection', 'Save Reflection')}
                </Button>
              </div>
            </Card>
          )}

          {/* Journals List */}
          {journals.length > 0 ? (
            <div className="space-y-3">
              {journals.map((journal) => (
                <Card 
                  key={journal.id} 
                  className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                  onClick={() => setSelectedJournal(selectedJournal?.id === journal.id ? null : journal)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getRatingEmoji(journal.rating)}</div>
                      <div>
                        <h3 className="font-semibold text-white">{journal.dateName}</h3>
                        <p className="text-slate-400 text-sm">
                          {journal.dateDate ? new Date(journal.dateDate).toLocaleDateString() : t('datePlanner.noDate', 'No date')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {journal.wouldRepeat ? (
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-red-400" />
                      )}
                      <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${selectedJournal?.id === journal.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded View */}
                  {selectedJournal?.id === journal.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                      {journal.highlights && (
                        <div>
                          <h4 className="text-sm font-medium text-green-400 mb-1">✨ {t('datePlanner.highlights', 'Highlights')}</h4>
                          <p className="text-slate-300 text-sm">{journal.highlights}</p>
                        </div>
                      )}
                      {journal.improvements && (
                        <div>
                          <h4 className="text-sm font-medium text-yellow-400 mb-1">📝 {t('datePlanner.couldImprove', 'Could Improve')}</h4>
                          <p className="text-slate-300 text-sm">{journal.improvements}</p>
                        </div>
                      )}
                      {journal.lessonsLearned && (
                        <div>
                          <h4 className="text-sm font-medium text-purple-400 mb-1">💡 {t('datePlanner.lessons', 'Lessons Learned')}</h4>
                          <p className="text-slate-300 text-sm">{journal.lessonsLearned}</p>
                        </div>
                      )}
                      {journal.nextSteps && (
                        <div>
                          <h4 className="text-sm font-medium text-blue-400 mb-1">🎯 {t('datePlanner.nextSteps', 'Next Steps')}</h4>
                          <p className="text-slate-300 text-sm">{journal.nextSteps}</p>
                        </div>
                      )}
                      <Button
                        onClick={(e) => { e.stopPropagation(); deleteJournal(journal.id); }}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('datePlanner.delete', 'Delete')}
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-8 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">{t('datePlanner.noJournals', 'No reflections yet')}</h3>
              <p className="text-slate-400 text-sm">{t('datePlanner.recordFirst', 'Record your first date experience!')}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
