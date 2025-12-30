import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Plus, Calendar, MapPin, Gift, Heart, 
  Clock, Trash2, Edit3, Check, X, ChevronRight,
  Sparkles, Star, BookOpen, Users, MessageCircle,
  Camera, StickyNote, Tag, Filter, Search
} from 'lucide-react';

export default function Journal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAlbanian = i18n.language === 'sq';
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('dates');
  
  // Data states - loaded from localStorage
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [savedGifts, setSavedGifts] = useState([]);
  const [dateNotes, setDateNotes] = useState([]);
  const [matchNotes, setMatchNotes] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load data from localStorage on mount
  useEffect(() => {
    const loadedDates = JSON.parse(localStorage.getItem('journal_dates') || '[]');
    const loadedPlaces = JSON.parse(localStorage.getItem('journal_places') || '[]');
    const loadedGifts = JSON.parse(localStorage.getItem('journal_gifts') || '[]');
    const loadedNotes = JSON.parse(localStorage.getItem('journal_notes') || '[]');
    const loadedMatches = JSON.parse(localStorage.getItem('journal_matches') || '[]');
    
    setUpcomingDates(loadedDates);
    setSavedPlaces(loadedPlaces);
    setSavedGifts(loadedGifts);
    setDateNotes(loadedNotes);
    setMatchNotes(loadedMatches);
  }, []);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('journal_dates', JSON.stringify(upcomingDates));
  }, [upcomingDates]);
  
  useEffect(() => {
    localStorage.setItem('journal_places', JSON.stringify(savedPlaces));
  }, [savedPlaces]);
  
  useEffect(() => {
    localStorage.setItem('journal_gifts', JSON.stringify(savedGifts));
  }, [savedGifts]);
  
  useEffect(() => {
    localStorage.setItem('journal_notes', JSON.stringify(dateNotes));
  }, [dateNotes]);
  
  useEffect(() => {
    localStorage.setItem('journal_matches', JSON.stringify(matchNotes));
  }, [matchNotes]);
  
  // Tab configuration
  const tabs = [
    { id: 'dates', label: t('journal.tabs.dates', 'Dates'), icon: Calendar, emoji: '📅' },
    { id: 'places', label: t('journal.tabs.places', 'Places'), icon: MapPin, emoji: '📍' },
    { id: 'gifts', label: t('journal.tabs.gifts', 'Gifts'), icon: Gift, emoji: '🎁' },
    { id: 'notes', label: t('journal.tabs.notes', 'Notes'), icon: StickyNote, emoji: '📝' },
    { id: 'matches', label: t('journal.tabs.matches', 'Matches'), icon: Heart, emoji: '💕' },
  ];
  
  // Add new date
  const addDate = (dateData) => {
    const newDate = {
      id: Date.now(),
      ...dateData,
      createdAt: new Date().toISOString(),
    };
    setUpcomingDates([newDate, ...upcomingDates]);
    setShowAddModal(false);
  };
  
  // Add new place
  const addPlace = (placeData) => {
    const newPlace = {
      id: Date.now(),
      ...placeData,
      createdAt: new Date().toISOString(),
    };
    setSavedPlaces([newPlace, ...savedPlaces]);
    setShowAddModal(false);
  };
  
  // Add new gift
  const addGift = (giftData) => {
    const newGift = {
      id: Date.now(),
      ...giftData,
      createdAt: new Date().toISOString(),
    };
    setSavedGifts([newGift, ...savedGifts]);
    setShowAddModal(false);
  };
  
  // Add new note
  const addNote = (noteData) => {
    const newNote = {
      id: Date.now(),
      ...noteData,
      createdAt: new Date().toISOString(),
    };
    setDateNotes([newNote, ...dateNotes]);
    setShowAddModal(false);
  };
  
  // Add new match
  const addMatch = (matchData) => {
    const newMatch = {
      id: Date.now(),
      ...matchData,
      createdAt: new Date().toISOString(),
    };
    setMatchNotes([newMatch, ...matchNotes]);
    setShowAddModal(false);
  };
  
  // Delete functions
  const deleteDate = (id) => setUpcomingDates(upcomingDates.filter(d => d.id !== id));
  const deletePlace = (id) => setSavedPlaces(savedPlaces.filter(p => p.id !== id));
  const deleteGift = (id) => setSavedGifts(savedGifts.filter(g => g.id !== id));
  const deleteNote = (id) => setDateNotes(dateNotes.filter(n => n.id !== id));
  const deleteMatch = (id) => setMatchNotes(matchNotes.filter(m => m.id !== id));
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isAlbanian ? 'sq-AL' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get days until date
  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return isAlbanian ? 'Kaloi' : 'Passed';
    if (diff === 0) return isAlbanian ? 'Sot!' : 'Today!';
    if (diff === 1) return isAlbanian ? 'Nesër' : 'Tomorrow';
    return isAlbanian ? `${diff} ditë` : `${diff} days`;
  };
  
  // Rating stars component
  const RatingStars = ({ rating, onRate, readonly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star 
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  );
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dates':
        return <DatesTab 
          dates={upcomingDates} 
          onDelete={deleteDate}
          onAdd={() => setShowAddModal(true)}
          formatDate={formatDate}
          getDaysUntil={getDaysUntil}
          t={t}
          isAlbanian={isAlbanian}
        />;
      case 'places':
        return <PlacesTab 
          places={savedPlaces}
          onDelete={deletePlace}
          onAdd={() => setShowAddModal(true)}
          t={t}
          RatingStars={RatingStars}
        />;
      case 'gifts':
        return <GiftsTab 
          gifts={savedGifts}
          onDelete={deleteGift}
          onAdd={() => setShowAddModal(true)}
          t={t}
        />;
      case 'notes':
        return <NotesTab 
          notes={dateNotes}
          onDelete={deleteNote}
          onAdd={() => setShowAddModal(true)}
          formatDate={formatDate}
          t={t}
          RatingStars={RatingStars}
        />;
      case 'matches':
        return <MatchesTab 
          matches={matchNotes}
          onDelete={deleteMatch}
          onAdd={() => setShowAddModal(true)}
          t={t}
        />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            {t('journal.title', 'My Journal')} 📔
          </h1>
          <p className="text-slate-400 text-sm">
            {t('journal.subtitle', 'Save dates, places, gifts & notes')}
          </p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Content */}
      {renderContent()}
      
      {/* Add Modal */}
      {showAddModal && (
        <AddModal 
          type={activeTab}
          onClose={() => setShowAddModal(false)}
          onAdd={
            activeTab === 'dates' ? addDate :
            activeTab === 'places' ? addPlace :
            activeTab === 'gifts' ? addGift :
            activeTab === 'notes' ? addNote :
            addMatch
          }
          t={t}
          isAlbanian={isAlbanian}
        />
      )}
    </div>
  );
}

// ===== DATES TAB =====
function DatesTab({ dates, onDelete, onAdd, formatDate, getDaysUntil, t, isAlbanian }) {
  const upcomingDates = dates.filter(d => new Date(d.dateTime) >= new Date());
  const pastDates = dates.filter(d => new Date(d.dateTime) < new Date());
  
  return (
    <div className="space-y-4">
      {/* Empty State */}
      {dates.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('journal.dates.empty', 'No dates planned yet')}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {t('journal.dates.emptyDesc', 'Add your upcoming dates to keep track!')}
          </p>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {t('journal.dates.addFirst', '+ Add Your First Date')}
          </button>
        </div>
      )}
      
      {/* Upcoming Dates */}
      {upcomingDates.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('journal.dates.upcoming', 'Upcoming')}
          </h3>
          <div className="space-y-3">
            {upcomingDates.map((date) => (
              <DateCard 
                key={date.id} 
                date={date} 
                onDelete={onDelete}
                formatDate={formatDate}
                getDaysUntil={getDaysUntil}
                t={t}
                isUpcoming={true}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Past Dates */}
      {pastDates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">
            {t('journal.dates.past', 'Past Dates')}
          </h3>
          <div className="space-y-3 opacity-60">
            {pastDates.slice(0, 5).map((date) => (
              <DateCard 
                key={date.id} 
                date={date} 
                onDelete={onDelete}
                formatDate={formatDate}
                getDaysUntil={getDaysUntil}
                t={t}
                isUpcoming={false}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Add Button */}
      {dates.length > 0 && (
        <button 
          onClick={onAdd}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-2xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('journal.dates.add', 'Add New Date')}
        </button>
      )}
    </div>
  );
}

// Date Card Component
function DateCard({ date, onDelete, formatDate, getDaysUntil, t, isUpcoming }) {
  const daysUntil = getDaysUntil(date.dateTime);
  
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isUpcoming 
        ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30' 
        : 'bg-slate-800/30 border-slate-700/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{date.emoji || '💕'}</span>
            <h4 className="font-semibold text-white">{date.personName}</h4>
            {isUpcoming && daysUntil && (
              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                {daysUntil}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(date.dateTime)}
            </span>
            {date.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {date.location}
              </span>
            )}
          </div>
          
          {date.notes && (
            <p className="text-slate-300 text-sm mt-2 line-clamp-2">{date.notes}</p>
          )}
          
          {date.activity && (
            <span className="inline-block mt-2 text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg">
              {date.activity}
            </span>
          )}
        </div>
        
        <button 
          onClick={() => onDelete(date.id)}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ===== PLACES TAB =====
function PlacesTab({ places, onDelete, onAdd, t, RatingStars }) {
  const categories = [
    { id: 'restaurant', emoji: '🍽️', label: t('journal.places.restaurant', 'Restaurant') },
    { id: 'bar', emoji: '🍸', label: t('journal.places.bar', 'Bar/Club') },
    { id: 'cafe', emoji: '☕', label: t('journal.places.cafe', 'Cafe') },
    { id: 'activity', emoji: '🎳', label: t('journal.places.activity', 'Activity') },
    { id: 'outdoor', emoji: '🌳', label: t('journal.places.outdoor', 'Outdoor') },
    { id: 'event', emoji: '🎉', label: t('journal.places.event', 'Event') },
    { id: 'other', emoji: '📍', label: t('journal.places.other', 'Other') },
  ];
  
  return (
    <div className="space-y-4">
      {/* Empty State */}
      {places.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('journal.places.empty', 'No places saved yet')}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {t('journal.places.emptyDesc', 'Save places you want to visit or have been to!')}
          </p>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {t('journal.places.addFirst', '+ Add a Place')}
          </button>
        </div>
      )}
      
      {/* Places Grid */}
      {places.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {places.map((place) => {
            const category = categories.find(c => c.id === place.category) || categories[6];
            return (
              <div 
                key={place.id}
                className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{category.emoji}</span>
                      <h4 className="font-semibold text-white">{place.name}</h4>
                    </div>
                    
                    {place.address && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {place.address}
                      </p>
                    )}
                    
                    {place.rating && (
                      <div className="mt-2">
                        <RatingStars rating={place.rating} readonly />
                      </div>
                    )}
                    
                    {place.notes && (
                      <p className="text-slate-300 text-sm mt-2">{place.notes}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg">
                        {category.label}
                      </span>
                      {place.visited && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-lg flex items-center gap-1">
                          <Check className="w-3 h-3" /> {t('journal.places.visited', 'Visited')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onDelete(place.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add Button */}
      {places.length > 0 && (
        <button 
          onClick={onAdd}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-2xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('journal.places.add', 'Add New Place')}
        </button>
      )}
    </div>
  );
}

// ===== GIFTS TAB =====
function GiftsTab({ gifts, onDelete, onAdd, t }) {
  return (
    <div className="space-y-4">
      {/* Empty State */}
      {gifts.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('journal.gifts.empty', 'No gifts saved yet')}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {t('journal.gifts.emptyDesc', 'Save gift ideas for your special someone!')}
          </p>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {t('journal.gifts.addFirst', '+ Add a Gift Idea')}
          </button>
        </div>
      )}
      
      {/* Gifts Grid */}
      {gifts.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {gifts.map((gift) => (
            <div 
              key={gift.id}
              className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{gift.emoji || '🎁'}</span>
                    <h4 className="font-semibold text-white">{gift.name}</h4>
                  </div>
                  
                  {gift.forPerson && (
                    <p className="text-sm text-purple-300 flex items-center gap-1 mt-1">
                      <Heart className="w-3.5 h-3.5" />
                      {t('journal.gifts.for', 'For')}: {gift.forPerson}
                    </p>
                  )}
                  
                  {gift.price && (
                    <p className="text-sm text-green-400 mt-1">
                      💰 {gift.price}
                    </p>
                  )}
                  
                  {gift.notes && (
                    <p className="text-slate-300 text-sm mt-2">{gift.notes}</p>
                  )}
                  
                  {gift.occasion && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-pink-500/20 text-pink-300 rounded-lg">
                      {gift.occasion}
                    </span>
                  )}
                  
                  {gift.purchased && (
                    <span className="inline-block mt-2 ml-2 text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('journal.gifts.purchased', 'Purchased')}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => onDelete(gift.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Button */}
      {gifts.length > 0 && (
        <button 
          onClick={onAdd}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-2xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('journal.gifts.add', 'Add Gift Idea')}
        </button>
      )}
    </div>
  );
}

// ===== NOTES TAB =====
function NotesTab({ notes, onDelete, onAdd, formatDate, t, RatingStars }) {
  return (
    <div className="space-y-4">
      {/* Empty State */}
      {notes.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('journal.notes.empty', 'No notes yet')}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {t('journal.notes.emptyDesc', 'Write notes about your dates and experiences!')}
          </p>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {t('journal.notes.addFirst', '+ Write a Note')}
          </button>
        </div>
      )}
      
      {/* Notes List */}
      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => (
            <div 
              key={note.id}
              className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{note.mood || '💭'}</span>
                  <h4 className="font-semibold text-white">{note.title}</h4>
                </div>
                <button 
                  onClick={() => onDelete(note.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{note.content}</p>
              
              {note.rating && (
                <div className="mt-3">
                  <RatingStars rating={note.rating} readonly />
                </div>
              )}
              
              <p className="text-xs text-slate-500 mt-3">
                {formatDate(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Button */}
      {notes.length > 0 && (
        <button 
          onClick={onAdd}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-2xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('journal.notes.add', 'Add Note')}
        </button>
      )}
    </div>
  );
}

// ===== MATCHES TAB =====
function MatchesTab({ matches, onDelete, onAdd, t }) {
  return (
    <div className="space-y-4">
      {/* Empty State */}
      {matches.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <div className="text-5xl mb-4">💕</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('journal.matches.empty', 'No matches saved yet')}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {t('journal.matches.emptyDesc', 'Keep track of people you\'re talking to!')}
          </p>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {t('journal.matches.addFirst', '+ Add a Match')}
          </button>
        </div>
      )}
      
      {/* Matches Grid */}
      {matches.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {matches.map((match) => (
            <div 
              key={match.id}
              className="p-4 bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-2xl border border-pink-500/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl">
                      {match.emoji || '💕'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">{match.name}</h4>
                      {match.platform && (
                        <p className="text-sm text-slate-400">{match.platform}</p>
                      )}
                    </div>
                  </div>
                  
                  {match.status && (
                    <span className={`inline-block text-xs px-2 py-1 rounded-lg ${
                      match.status === 'talking' ? 'bg-blue-500/20 text-blue-300' :
                      match.status === 'dating' ? 'bg-pink-500/20 text-pink-300' :
                      match.status === 'complicated' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {match.status === 'talking' ? t('journal.matches.statusTalking', '💬 Talking') :
                       match.status === 'dating' ? t('journal.matches.statusDating', '💕 Dating') :
                       match.status === 'complicated' ? t('journal.matches.statusComplicated', '🤔 Complicated') :
                       t('journal.matches.statusOther', '📱 Other')}
                    </span>
                  )}
                  
                  {match.notes && (
                    <p className="text-slate-300 text-sm mt-2">{match.notes}</p>
                  )}
                  
                  {match.interests && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.interests.split(',').map((interest, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => onDelete(match.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Button */}
      {matches.length > 0 && (
        <button 
          onClick={onAdd}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-2xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('journal.matches.add', 'Add Match')}
        </button>
      )}
    </div>
  );
}

// ===== ADD MODAL =====
function AddModal({ type, onClose, onAdd, t, isAlbanian }) {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({});
  };
  
  const renderForm = () => {
    switch (type) {
      case 'dates':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.personName', 'Person\'s Name')} *
              </label>
              <input
                type="text"
                value={formData.personName || ''}
                onChange={(e) => setFormData({...formData, personName: e.target.value})}
                placeholder={t('journal.modal.personNamePlaceholder', 'e.g., Sara, John...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.dateTime', 'Date & Time')} *
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime || ''}
                onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.location', 'Location')}
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder={t('journal.modal.locationPlaceholder', 'e.g., Coffee shop downtown')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.activity', 'Activity')}
              </label>
              <select
                value={formData.activity || ''}
                onChange={(e) => setFormData({...formData, activity: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">{t('journal.modal.selectActivity', 'Select activity...')}</option>
                <option value="☕ Coffee">☕ {t('journal.modal.coffee', 'Coffee')}</option>
                <option value="🍽️ Dinner">🍽️ {t('journal.modal.dinner', 'Dinner')}</option>
                <option value="🍸 Drinks">🍸 {t('journal.modal.drinks', 'Drinks')}</option>
                <option value="🎬 Movie">🎬 {t('journal.modal.movie', 'Movie')}</option>
                <option value="🚶 Walk">🚶 {t('journal.modal.walk', 'Walk')}</option>
                <option value="🎳 Activity">🎳 {t('journal.modal.activityOpt', 'Activity')}</option>
                <option value="🏠 Home">🏠 {t('journal.modal.home', 'Home')}</option>
                <option value="🎉 Event">🎉 {t('journal.modal.event', 'Event')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={t('journal.modal.notesPlaceholder', 'Any notes or plans...')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );
        
      case 'places':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.placeName', 'Place Name')} *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('journal.modal.placeNamePlaceholder', 'e.g., Cozy Coffee Shop')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.category', 'Category')}
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">{t('journal.modal.selectCategory', 'Select category...')}</option>
                <option value="restaurant">🍽️ {t('journal.places.restaurant', 'Restaurant')}</option>
                <option value="bar">🍸 {t('journal.places.bar', 'Bar/Club')}</option>
                <option value="cafe">☕ {t('journal.places.cafe', 'Cafe')}</option>
                <option value="activity">🎳 {t('journal.places.activity', 'Activity')}</option>
                <option value="outdoor">🌳 {t('journal.places.outdoor', 'Outdoor')}</option>
                <option value="event">🎉 {t('journal.places.event', 'Event')}</option>
                <option value="other">📍 {t('journal.places.other', 'Other')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.address', 'Address')}
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder={t('journal.modal.addressPlaceholder', 'Enter address...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={t('journal.modal.placeNotesPlaceholder', 'Why is this place good for dates?')}
                rows={2}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visited || false}
                onChange={(e) => setFormData({...formData, visited: e.target.checked})}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-slate-300">{t('journal.modal.alreadyVisited', 'Already visited')}</span>
            </label>
          </div>
        );
        
      case 'gifts':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.giftName', 'Gift Idea')} *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('journal.modal.giftNamePlaceholder', 'e.g., Flowers, Watch, Book...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.forPerson', 'For Who?')}
              </label>
              <input
                type="text"
                value={formData.forPerson || ''}
                onChange={(e) => setFormData({...formData, forPerson: e.target.value})}
                placeholder={t('journal.modal.forPersonPlaceholder', 'Person\'s name...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.price', 'Price')}
              </label>
              <input
                type="text"
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder={t('journal.modal.pricePlaceholder', 'e.g., €50, $100...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.occasion', 'Occasion')}
              </label>
              <select
                value={formData.occasion || ''}
                onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">{t('journal.modal.selectOccasion', 'Select occasion...')}</option>
                <option value="🎂 Birthday">🎂 {t('journal.modal.birthday', 'Birthday')}</option>
                <option value="💕 Anniversary">💕 {t('journal.modal.anniversary', 'Anniversary')}</option>
                <option value="❤️ Valentine's">❤️ {t('journal.modal.valentines', 'Valentine\'s Day')}</option>
                <option value="🎄 Christmas">🎄 {t('journal.modal.christmas', 'Christmas')}</option>
                <option value="💝 Just Because">💝 {t('journal.modal.justBecause', 'Just Because')}</option>
                <option value="🎉 Other">🎉 {t('journal.modal.otherOccasion', 'Other')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={t('journal.modal.giftNotesPlaceholder', 'Where to buy, links, etc...')}
                rows={2}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );
        
      case 'notes':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.noteTitle', 'Title')} *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t('journal.modal.noteTitlePlaceholder', 'e.g., First date with Sara')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.mood', 'How did it go?')}
              </label>
              <div className="flex gap-2">
                {['😍', '😊', '😐', '😅', '😢'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({...formData, mood: emoji})}
                    className={`text-2xl p-2 rounded-xl transition-all ${
                      formData.mood === emoji 
                        ? 'bg-purple-500/30 scale-110' 
                        : 'bg-slate-700/50 hover:bg-slate-600/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.noteContent', 'Your Notes')} *
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder={t('journal.modal.noteContentPlaceholder', 'Write about your experience...')}
                rows={5}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.rating', 'Rate the date')}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= (formData.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'matches':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.matchName', 'Name')} *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('journal.modal.matchNamePlaceholder', 'Their name...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.platform', 'Where did you meet?')}
              </label>
              <select
                value={formData.platform || ''}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">{t('journal.modal.selectPlatform', 'Select...')}</option>
                <option value="Tinder">🔥 Tinder</option>
                <option value="Bumble">🐝 Bumble</option>
                <option value="Hinge">💜 Hinge</option>
                <option value="Instagram">📸 Instagram</option>
                <option value="In Person">👋 {t('journal.modal.inPerson', 'In Person')}</option>
                <option value="Other">📱 {t('journal.modal.otherPlatform', 'Other')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.status', 'Status')}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'talking', label: t('journal.matches.statusTalking', '💬 Talking'), color: 'bg-blue-500/20 text-blue-300' },
                  { id: 'dating', label: t('journal.matches.statusDating', '💕 Dating'), color: 'bg-pink-500/20 text-pink-300' },
                  { id: 'complicated', label: t('journal.matches.statusComplicated', '🤔 Complicated'), color: 'bg-amber-500/20 text-amber-300' },
                ].map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setFormData({...formData, status: status.id})}
                    className={`px-3 py-2 rounded-xl text-sm transition-all ${
                      formData.status === status.id 
                        ? status.color + ' ring-2 ring-white/20' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.interests', 'Their Interests')}
              </label>
              <input
                type="text"
                value={formData.interests || ''}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                placeholder={t('journal.modal.interestsPlaceholder', 'e.g., Music, Travel, Cooking...')}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('journal.modal.notes', 'Notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={t('journal.modal.matchNotesPlaceholder', 'Things to remember about them...')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const getModalTitle = () => {
    switch (type) {
      case 'dates': return t('journal.modal.addDate', 'Add Upcoming Date');
      case 'places': return t('journal.modal.addPlace', 'Add Place');
      case 'gifts': return t('journal.modal.addGift', 'Add Gift Idea');
      case 'notes': return t('journal.modal.addNote', 'Add Note');
      case 'matches': return t('journal.modal.addMatch', 'Add Match');
      default: return '';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{getModalTitle()}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {renderForm()}
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {t('journal.modal.save', 'Save')}
          </button>
        </form>
      </div>
    </div>
  );
}

