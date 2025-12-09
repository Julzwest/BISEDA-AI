import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, MapPin, Star, Music, PartyPopper, Globe, ExternalLink, Search, Heart, Gift, Flag, ChevronRight, Clock, Bookmark, BookmarkCheck, Share2, Ticket, X, Plus, Dumbbell, UtensilsCrossed, Laugh, Film, Mountain, Palette, Flower2, Tent, HeartHandshake } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { countries, getCitiesForCountry, getCountryByCode, getCityNameEn } from '@/config/countries';
import { getBackendUrl } from '@/utils/getBackendUrl';
import ShareButton from '@/components/ShareButton';
import PullToRefresh from '@/components/PullToRefresh';
import { toggleVenueFavorite, isVenueFavorited } from '@/utils/favorites';
import { trackFeatureUse } from '@/utils/analytics';

// Additional Albanian cities not in the main list
const additionalAlbanianCities = [
  'Bajram Curri', 'Bilisht', 'Burrel', 'Çorovodë', 'Fushë-Krujë',
  'Gramsh', 'Krrabë', 'Librazhd', 'Mamurras', 'Orikum', 'Patos',
  'Peqin', 'Përrenjas', 'Rrogozhinë', 'Rubik', 'Selenicë', 'Shëngjin',
  'Sukth', 'Ura Vajgurore', 'Vau i Dejës', 'Velipojë', 'Xhafzotaj'
];

// Festive dates data by country - Comprehensive list
const festiveDatesByCountry = {
  // Albania - Full list of holidays and celebrations
  AL: [
    { month: 0, date: 1, name: 'Dita e Vitit të Ri', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 2, name: 'Dita e Dytë e Vitit të Ri', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎊' },
    { month: 0, date: 11, name: 'Dita e Republikës', icon: Flag, color: 'from-red-500 to-orange-500', emoji: '🇦🇱' },
    { month: 1, date: 14, name: 'Dita e Dashurisë', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 2, date: 7, name: 'Dita e Mësuesit', icon: Star, color: 'from-yellow-500 to-amber-500', emoji: '📚' },
    { month: 2, date: 8, name: 'Dita Ndërkombëtare e Gruas', icon: Heart, color: 'from-purple-500 to-pink-500', emoji: '👩' },
    { month: 2, date: 14, name: 'Dita e Verës', icon: Sparkles, color: 'from-green-500 to-emerald-500', emoji: '🌸' },
    { month: 2, date: 22, name: 'Dita e Nevruzit', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🌷' },
    { month: 3, date: 1, name: 'Dita e Shakave (April Fools)', icon: Sparkles, color: 'from-yellow-500 to-orange-500', emoji: '🃏' },
    { month: 4, date: 1, name: 'Dita Ndërkombëtare e Punëtorëve', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 5, name: 'Dita e Dëshmorëve', icon: Flag, color: 'from-red-500 to-black-500', emoji: '🎖️' },
    { month: 4, date: 12, name: 'Dita e Nënës', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💐' },
    { month: 5, date: 1, name: 'Dita Ndërkombëtare e Fëmijëve', icon: Gift, color: 'from-yellow-500 to-orange-500', emoji: '🎈' },
    { month: 5, date: 16, name: 'Dita e Babait', icon: Heart, color: 'from-blue-500 to-cyan-500', emoji: '👨' },
    { month: 5, date: 21, name: 'Dita e Muzikës', icon: Music, color: 'from-purple-500 to-pink-500', emoji: '🎵' },
    { month: 8, date: 5, name: 'Dita e Nënë Terezës', icon: Heart, color: 'from-blue-500 to-white-500', emoji: '🙏' },
    { month: 9, date: 19, name: 'Dita e Lumturisë së Nënë Terezës', icon: Heart, color: 'from-blue-500 to-white-500', emoji: '✨' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 28, name: 'Dita e Flamurit', icon: Flag, color: 'from-red-500 to-black-500', emoji: '🇦🇱' },
    { month: 10, date: 29, name: 'Dita e Çlirimit', icon: Flag, color: 'from-red-500 to-orange-500', emoji: '🎖️' },
    { month: 11, date: 8, name: 'Dita e Rinisë', icon: Star, color: 'from-blue-500 to-cyan-500', emoji: '🎓' },
    { month: 11, date: 24, name: 'Nata e Krishtlindjeve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Krishtlindjet', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 26, name: 'Dita e Dytë e Krishtlindjeve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
    { month: 11, date: 31, name: 'Nata e Vitit të Ri', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Kosovo
  XK: [
    { month: 0, date: 1, name: 'Dita e Vitit të Ri', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 2, name: 'Dita e Dytë e Vitit të Ri', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎊' },
    { month: 1, date: 14, name: 'Dita e Dashurisë', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 1, date: 17, name: 'Dita e Pavarësisë', icon: Flag, color: 'from-blue-500 to-yellow-500', emoji: '🇽🇰' },
    { month: 2, date: 8, name: 'Dita Ndërkombëtare e Gruas', icon: Heart, color: 'from-purple-500 to-pink-500', emoji: '👩' },
    { month: 3, date: 9, name: 'Dita e Kushtetutës', icon: Flag, color: 'from-blue-500 to-yellow-500', emoji: '📜' },
    { month: 4, date: 1, name: 'Dita e Punëtorëve', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 9, name: 'Dita e Evropës', icon: Flag, color: 'from-blue-500 to-yellow-500', emoji: '🇪🇺' },
    { month: 5, date: 12, name: 'Dita e Çlirimit', icon: Flag, color: 'from-blue-500 to-yellow-500', emoji: '🎖️' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 28, name: 'Dita e Flamurit', icon: Flag, color: 'from-red-500 to-black-500', emoji: '🇦🇱' },
    { month: 11, date: 24, name: 'Nata e Krishtlindjeve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Krishtlindjet', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 31, name: 'Nata e Vitit të Ri', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // United Kingdom
  GB: [
    { month: 0, date: 1, name: 'New Year\'s Day', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 25, name: 'Burns Night (Scotland)', icon: Star, color: 'from-blue-500 to-white-500', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { month: 1, date: 14, name: 'Valentine\'s Day', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 2, date: 1, name: 'St David\'s Day (Wales)', icon: Flag, color: 'from-green-500 to-white-500', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { month: 2, date: 17, name: 'St Patrick\'s Day', icon: Star, color: 'from-green-500 to-emerald-500', emoji: '☘️' },
    { month: 3, date: 23, name: 'St George\'s Day (England)', icon: Flag, color: 'from-red-500 to-white-500', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { month: 4, date: 5, name: 'May Day Bank Holiday', icon: Sparkles, color: 'from-green-500 to-emerald-500', emoji: '🌸' },
    { month: 5, date: 16, name: 'Father\'s Day', icon: Heart, color: 'from-blue-500 to-cyan-500', emoji: '👨' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 5, name: 'Bonfire Night', icon: Sparkles, color: 'from-orange-500 to-red-500', emoji: '🎆' },
    { month: 10, date: 11, name: 'Remembrance Day', icon: Heart, color: 'from-red-500 to-black-500', emoji: '🌺' },
    { month: 10, date: 30, name: 'St Andrew\'s Day (Scotland)', icon: Flag, color: 'from-blue-500 to-white-500', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { month: 11, date: 24, name: 'Christmas Eve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Christmas Day', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 26, name: 'Boxing Day', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
    { month: 11, date: 31, name: 'New Year\'s Eve', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Germany
  DE: [
    { month: 0, date: 1, name: 'Neujahr', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 6, name: 'Heilige Drei Könige', icon: Star, color: 'from-yellow-500 to-amber-500', emoji: '👑' },
    { month: 1, date: 14, name: 'Valentinstag', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 4, date: 1, name: 'Tag der Arbeit', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 12, name: 'Muttertag', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💐' },
    { month: 9, date: 3, name: 'Tag der Deutschen Einheit', icon: Flag, color: 'from-black-500 to-yellow-500', emoji: '🇩🇪' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 11, name: 'St. Martin', icon: Star, color: 'from-orange-500 to-red-500', emoji: '🏮' },
    { month: 11, date: 6, name: 'Nikolaustag', icon: Gift, color: 'from-red-500 to-white-500', emoji: '🎅' },
    { month: 11, date: 24, name: 'Heiligabend', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Weihnachten', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 26, name: 'Zweiter Weihnachtstag', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
    { month: 11, date: 31, name: 'Silvester', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // United States
  US: [
    { month: 0, date: 1, name: 'New Year\'s Day', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 20, name: 'Martin Luther King Jr. Day', icon: Star, color: 'from-blue-500 to-red-500', emoji: '✊' },
    { month: 1, date: 2, name: 'Groundhog Day', icon: Sparkles, color: 'from-amber-500 to-brown-500', emoji: '🦫' },
    { month: 1, date: 14, name: 'Valentine\'s Day', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 2, date: 17, name: 'St. Patrick\'s Day', icon: Star, color: 'from-green-500 to-emerald-500', emoji: '☘️' },
    { month: 3, date: 1, name: 'April Fools\' Day', icon: Sparkles, color: 'from-yellow-500 to-orange-500', emoji: '🃏' },
    { month: 4, date: 5, name: 'Cinco de Mayo', icon: Star, color: 'from-green-500 to-red-500', emoji: '🇲🇽' },
    { month: 4, date: 12, name: 'Mother\'s Day', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💐' },
    { month: 5, date: 16, name: 'Father\'s Day', icon: Heart, color: 'from-blue-500 to-cyan-500', emoji: '👨' },
    { month: 6, date: 4, name: 'Independence Day', icon: Flag, color: 'from-red-500 to-blue-500', emoji: '🇺🇸' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 11, name: 'Veterans Day', icon: Flag, color: 'from-red-500 to-blue-500', emoji: '🎖️' },
    { month: 10, date: 28, name: 'Thanksgiving', icon: Gift, color: 'from-orange-500 to-amber-500', emoji: '🦃' },
    { month: 11, date: 24, name: 'Christmas Eve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Christmas Day', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 31, name: 'New Year\'s Eve', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Italy
  IT: [
    { month: 0, date: 1, name: 'Capodanno', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 6, name: 'Epifania', icon: Star, color: 'from-yellow-500 to-amber-500', emoji: '👑' },
    { month: 1, date: 14, name: 'San Valentino', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 2, date: 8, name: 'Festa della Donna', icon: Heart, color: 'from-yellow-500 to-orange-500', emoji: '🌼' },
    { month: 3, date: 25, name: 'Festa della Liberazione', icon: Flag, color: 'from-green-500 to-red-500', emoji: '🇮🇹' },
    { month: 4, date: 1, name: 'Festa dei Lavoratori', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 12, name: 'Festa della Mamma', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💐' },
    { month: 5, date: 2, name: 'Festa della Repubblica', icon: Flag, color: 'from-green-500 to-red-500', emoji: '🇮🇹' },
    { month: 7, date: 15, name: 'Ferragosto', icon: Sparkles, color: 'from-yellow-500 to-orange-500', emoji: '☀️' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 1, name: 'Ognissanti', icon: Star, color: 'from-purple-500 to-white-500', emoji: '🕯️' },
    { month: 11, date: 8, name: 'Immacolata Concezione', icon: Star, color: 'from-blue-500 to-white-500', emoji: '🙏' },
    { month: 11, date: 24, name: 'Vigilia di Natale', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Natale', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 26, name: 'Santo Stefano', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
    { month: 11, date: 31, name: 'San Silvestro', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // France
  FR: [
    { month: 0, date: 1, name: 'Jour de l\'An', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 1, date: 14, name: 'Saint-Valentin', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 4, date: 1, name: 'Fête du Travail', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 8, name: 'Victoire 1945', icon: Flag, color: 'from-blue-500 to-red-500', emoji: '🇫🇷' },
    { month: 5, date: 21, name: 'Fête de la Musique', icon: Music, color: 'from-purple-500 to-pink-500', emoji: '🎵' },
    { month: 6, date: 14, name: 'Fête Nationale', icon: Flag, color: 'from-blue-500 to-red-500', emoji: '🇫🇷' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 1, name: 'La Toussaint', icon: Star, color: 'from-purple-500 to-white-500', emoji: '🕯️' },
    { month: 10, date: 11, name: 'Armistice', icon: Flag, color: 'from-blue-500 to-red-500', emoji: '🎖️' },
    { month: 11, date: 24, name: 'Réveillon de Noël', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Noël', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 31, name: 'Saint-Sylvestre', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Spain
  ES: [
    { month: 0, date: 1, name: 'Año Nuevo', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 6, name: 'Día de Reyes', icon: Gift, color: 'from-yellow-500 to-amber-500', emoji: '👑' },
    { month: 1, date: 14, name: 'San Valentín', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 4, date: 1, name: 'Día del Trabajo', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 5, name: 'Día de la Madre', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💐' },
    { month: 5, date: 24, name: 'San Juan', icon: Sparkles, color: 'from-orange-500 to-yellow-500', emoji: '🔥' },
    { month: 9, date: 12, name: 'Fiesta Nacional de España', icon: Flag, color: 'from-red-500 to-yellow-500', emoji: '🇪🇸' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 10, date: 1, name: 'Día de Todos los Santos', icon: Star, color: 'from-purple-500 to-white-500', emoji: '🕯️' },
    { month: 11, date: 6, name: 'Día de la Constitución', icon: Flag, color: 'from-red-500 to-yellow-500', emoji: '📜' },
    { month: 11, date: 24, name: 'Nochebuena', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Navidad', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 31, name: 'Nochevieja', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Greece
  GR: [
    { month: 0, date: 1, name: 'Πρωτοχρονιά', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 6, name: 'Θεοφάνεια', icon: Star, color: 'from-blue-500 to-white-500', emoji: '💧' },
    { month: 1, date: 14, name: 'Αγίου Βαλεντίνου', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 2, date: 25, name: 'Εθνική Επέτειος', icon: Flag, color: 'from-blue-500 to-white-500', emoji: '🇬🇷' },
    { month: 4, date: 1, name: 'Πρωτομαγιά', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 9, date: 28, name: 'Επέτειος του Όχι', icon: Flag, color: 'from-blue-500 to-white-500', emoji: '🇬🇷' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 11, date: 24, name: 'Παραμονή Χριστουγέννων', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Χριστούγεννα', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 31, name: 'Παραμονή Πρωτοχρονιάς', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Switzerland
  CH: [
    { month: 0, date: 1, name: 'Neujahr', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 1, date: 14, name: 'Valentinstag', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 7, date: 1, name: 'Schweizer Nationalfeiertag', icon: Flag, color: 'from-red-500 to-white-500', emoji: '🇨🇭' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 11, date: 24, name: 'Heiligabend', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Weihnachten', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 26, name: 'Stephanstag', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
    { month: 11, date: 31, name: 'Silvester', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Austria
  AT: [
    { month: 0, date: 1, name: 'Neujahr', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 6, name: 'Heilige Drei Könige', icon: Star, color: 'from-yellow-500 to-amber-500', emoji: '👑' },
    { month: 1, date: 14, name: 'Valentinstag', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 4, date: 1, name: 'Staatsfeiertag', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 9, date: 26, name: 'Nationalfeiertag', icon: Flag, color: 'from-red-500 to-white-500', emoji: '🇦🇹' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 11, date: 24, name: 'Heiliger Abend', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
    { month: 11, date: 25, name: 'Weihnachten', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 11, date: 26, name: 'Stefanitag', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
    { month: 11, date: 31, name: 'Silvester', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // North Macedonia
  MK: [
    { month: 0, date: 1, name: 'Nova Godina', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 7, name: 'Božik (Orthodox)', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 1, date: 14, name: 'Den na Vljubenite', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 4, date: 1, name: 'Den na Trudot', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 24, name: 'Sv. Kiril i Metodij', icon: Star, color: 'from-yellow-500 to-amber-500', emoji: '📜' },
    { month: 7, date: 2, name: 'Den na Republikata', icon: Flag, color: 'from-red-500 to-yellow-500', emoji: '🇲🇰' },
    { month: 8, date: 8, name: 'Den na Nezavisnosta', icon: Flag, color: 'from-red-500 to-yellow-500', emoji: '🇲🇰' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 11, date: 31, name: 'Nova Godina Eve', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ],
  // Montenegro
  ME: [
    { month: 0, date: 1, name: 'Nova Godina', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
    { month: 0, date: 7, name: 'Božić (Orthodox)', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
    { month: 1, date: 14, name: 'Dan Zaljubljenih', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
    { month: 4, date: 1, name: 'Praznik Rada', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
    { month: 4, date: 21, name: 'Dan Nezavisnosti', icon: Flag, color: 'from-red-500 to-gold-500', emoji: '🇲🇪' },
    { month: 6, date: 13, name: 'Dan Državnosti', icon: Flag, color: 'from-red-500 to-gold-500', emoji: '🇲🇪' },
    { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
    { month: 11, date: 31, name: 'Doček Nove Godine', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
  ]
};

// Default festive dates for countries not specifically defined
const defaultFestiveDates = [
  { month: 0, date: 1, name: 'Dita e Vitit të Ri', icon: Sparkles, color: 'from-blue-500 to-cyan-500', emoji: '🎆' },
  { month: 0, date: 6, name: 'Epifania / Tre Mbretërit', icon: Star, color: 'from-yellow-500 to-amber-500', emoji: '👑' },
  { month: 1, date: 14, name: 'Dita e Dashurisë', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💕' },
  { month: 2, date: 8, name: 'Dita Ndërkombëtare e Gruas', icon: Heart, color: 'from-purple-500 to-pink-500', emoji: '👩' },
  { month: 3, date: 1, name: 'Dita e Shakave', icon: Sparkles, color: 'from-yellow-500 to-orange-500', emoji: '🃏' },
  { month: 4, date: 1, name: 'Dita e Punëtorëve', icon: Star, color: 'from-red-500 to-orange-500', emoji: '✊' },
  { month: 4, date: 12, name: 'Dita e Nënës', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💐' },
  { month: 5, date: 1, name: 'Dita e Fëmijëve', icon: Gift, color: 'from-yellow-500 to-orange-500', emoji: '🎈' },
  { month: 5, date: 16, name: 'Dita e Babait', icon: Heart, color: 'from-blue-500 to-cyan-500', emoji: '👨' },
  { month: 5, date: 21, name: 'Dita e Muzikës', icon: Music, color: 'from-purple-500 to-pink-500', emoji: '🎵' },
  { month: 9, date: 31, name: 'Halloween', icon: Sparkles, color: 'from-orange-500 to-purple-500', emoji: '🎃' },
  { month: 10, date: 1, name: 'Dita e të Gjithë Shenjtorëve', icon: Star, color: 'from-purple-500 to-white-500', emoji: '🕯️' },
  { month: 11, date: 24, name: 'Nata e Krishtlindjeve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🌟' },
  { month: 11, date: 25, name: 'Krishtlindjet', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎄' },
  { month: 11, date: 26, name: 'Dita e Dytë e Krishtlindjeve', icon: Gift, color: 'from-green-500 to-red-500', emoji: '🎁' },
  { month: 11, date: 31, name: 'Nata e Vitit të Ri', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '🎉' }
];

export default function Events() {
  const backendUrl = getBackendUrl();
  
  // Get user's country from localStorage with state for reactivity
  const [userCountry, setUserCountry] = useState(localStorage.getItem('userCountry') || 'AL');
  const currentCountry = getCountryByCode(userCountry);
  const cities = getCitiesForCountry(userCountry).map(c => c.name);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [localEvents, setLocalEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventType, setEventType] = useState('all');
  const [showAllFestive, setShowAllFestive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  
  // City selection modal
  const [showCityModal, setShowCityModal] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [showMoreCities, setShowMoreCities] = useState(false);

  // Listen for country changes from the global CountrySwitcher
  useEffect(() => {
    const handleCountryChange = (event) => {
      const newCountry = event.detail?.countryCode || localStorage.getItem('userCountry') || 'AL';
      setUserCountry(newCountry);
      setSelectedCity(''); // Reset city when country changes
      setLocalEvents([]); // Clear events
    };

    window.addEventListener('countryChanged', handleCountryChange);
    
    // Also check localStorage on mount in case it changed
    const storedCountry = localStorage.getItem('userCountry') || 'AL';
    if (storedCountry !== userCountry) {
      setUserCountry(storedCountry);
    }

    return () => {
      window.removeEventListener('countryChanged', handleCountryChange);
    };
  }, []);

  // Get upcoming festive dates
  const getUpcomingFestiveDates = () => {
    const festiveDates = festiveDatesByCountry[userCountry] || defaultFestiveDates;
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Calculate days until each festive date
    const upcomingDates = festiveDates.map(festive => {
      let festiveDate = new Date(currentYear, festive.month, festive.date);
      
      // If the date has passed this year, use next year
      if (festiveDate < today) {
        festiveDate = new Date(currentYear + 1, festive.month, festive.date);
      }
      
      const diffTime = festiveDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...festive,
        daysUntil: diffDays,
        fullDate: festiveDate
      };
    });
    
    // Sort by days until
    return upcomingDates.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcomingFestiveDates = getUpcomingFestiveDates();
  const nextFestive = upcomingFestiveDates[0];
  const months = ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gus', 'Sht', 'Tet', 'Nën', 'Dhj'];

  const eventTypes = [
    { id: 'all', name: 'Të gjitha', icon: PartyPopper },
    { id: 'music', name: 'Muzikë', icon: Music },
    { id: 'nightlife', name: 'Jetë Nate', icon: Sparkles },
    { id: 'culture', name: 'Kulturë', icon: Calendar },
    { id: 'sports', name: 'Sport', icon: Dumbbell },
    { id: 'food', name: 'Gastronomi', icon: UtensilsCrossed },
    { id: 'comedy', name: 'Komedi', icon: Laugh },
    { id: 'cinema', name: 'Kinema', icon: Film },
    { id: 'outdoor', name: 'Aventurë', icon: Mountain },
    { id: 'art', name: 'Art', icon: Palette },
    { id: 'wellness', name: 'Wellness', icon: Flower2 },
    { id: 'festivals', name: 'Festivale', icon: Tent },
    { id: 'romantic', name: 'Romantike', icon: HeartHandshake }
  ];

  // Search queries for different event types
  const getSearchQuery = (type) => {
    switch (type) {
      case 'music':
        return 'live music concerts music venues bands DJ';
      case 'nightlife':
        return 'nightclubs bars pubs night entertainment lounge';
      case 'culture':
        return 'theaters museums cultural centers heritage sites';
      case 'sports':
        return 'sports stadium gym fitness center football basketball tennis';
      case 'food':
        return 'restaurants wine bar food festival tasting cooking class';
      case 'comedy':
        return 'comedy club stand up comedy show entertainment venue';
      case 'cinema':
        return 'cinema movie theater film screening';
      case 'outdoor':
        return 'hiking trails outdoor activities adventure park beach nature';
      case 'art':
        return 'art gallery exhibition museum contemporary art studio';
      case 'wellness':
        return 'spa wellness center yoga studio massage meditation retreat';
      case 'festivals':
        return 'festival fair carnival seasonal events market';
      case 'romantic':
        return 'romantic restaurant rooftop bar scenic viewpoint date night couples';
      default:
        return 'events venues concert halls theaters nightclubs entertainment';
    }
  };

  // Generate ticket search URL
  const getTicketSearchUrl = (cityName) => {
    const cityNameEn = getCityNameEn(userCountry, cityName) || cityName;
    const countryNameEn = currentCountry?.nameEn || 'Albania';
    return `https://www.google.com/search?q=events+tickets+${encodeURIComponent(cityNameEn)}+${encodeURIComponent(countryNameEn)}+2024`;
  };

  // Search for local events
  const searchLocalEvents = async () => {
    if (!selectedCity) return;
    
    setIsLoadingEvents(true);
    setLocalEvents([]);
    setVisibleCount(10); // Show more results initially

    try {
      // Use the city name directly - works for both predefined and custom cities
      const cityNameEn = getCityNameEn(userCountry, selectedCity) || selectedCity;
      const countryNameEn = currentCountry?.nameEn || 'Albania';
      
      // Make location search more specific for better filtering
      // For small cities, include the region/country to help Google find the right place
      const locationQuery = `${cityNameEn}, ${countryNameEn}`;
      
      console.log('🎉 Searching for events in', locationQuery);
      
      const response = await fetch(`${backendUrl}/api/places/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${getSearchQuery(eventType)} in ${cityNameEn}`,
          location: locationQuery,
          category: 'events',
          maxResults: 20,
          // Add strict location filtering
          strictLocation: true,
          cityName: cityNameEn,
          countryName: countryNameEn
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.source === 'google-places' && data.places && data.places.length > 0) {
          console.log('✅ Found', data.places.length, 'event venues from Google Places');
          
          // Filter results to only include venues that contain the city name in their address
          const filteredPlaces = data.places.filter(place => {
            const address = (place.location || '').toLowerCase();
            const cityLower = cityNameEn.toLowerCase();
            const selectedCityLower = selectedCity.toLowerCase();
            
            // Check if the address contains the city name
            return address.includes(cityLower) || 
                   address.includes(selectedCityLower) ||
                   // Also check for common Albanian city name variations
                   address.includes(cityLower.replace('ë', 'e')) ||
                   address.includes(selectedCityLower.replace('ë', 'e'));
          });
          
          // If no filtered results, show all results but with a note
          const placesToShow = filteredPlaces.length > 0 ? filteredPlaces : data.places;
          
          const formattedEvents = placesToShow.map((place, index) => ({
            id: index + 1,
            name: place.name,
            description: place.description,
            location: place.location,
            rating: place.rating,
            googleMapsLink: place.googleMapsLink,
            isOpen: place.isOpen,
            type: 'venue',
            reviewCount: place.reviewCount,
            // Flag if this venue might not be in the exact city
            possibleMismatch: filteredPlaces.length === 0,
            // Add ticket search link
            ticketSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(place.name)}+tickets+events+${encodeURIComponent(cityNameEn)}`
          }));
          
          setLocalEvents(formattedEvents);
        } else if (data.source === 'fallback') {
          // API not configured - show empty state with message
          console.log('⚠️ Google Places API not configured');
          setLocalEvents([]);
        } else {
          // No results found
          setLocalEvents([]);
        }
      }
    } catch (error) {
      console.error('❌ Error searching events:', error);
      setLocalEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Search when city or event type changes
  useEffect(() => {
    if (selectedCity) {
      searchLocalEvents();
      trackFeatureUse('events', 'search');
    }
  }, [selectedCity, eventType]);

  // Handle favorite toggle
  const handleFavoriteToggle = (venue) => {
    const isFavorited = toggleVenueFavorite(venue);
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(venue.id || venue.name);
      } else {
        newSet.delete(venue.id || venue.name);
      }
      return newSet;
    });
    trackFeatureUse('events', 'venueClick');
  };

  // Check if venue is favorited
  const checkFavorite = (venue) => {
    return favoriteIds.has(venue.id || venue.name) || isVenueFavorited(venue.id, venue.name);
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (selectedCity) {
      await searchLocalEvents();
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="px-4 pt-6 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/50 animate-pulse">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center animate-bounce">
              <Music className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent mb-2">
          Evente Lokale 🎉
        </h1>
        <p className="text-slate-400 text-sm">Gjej vende eventesh dhe argëtimi në qytetin tënd</p>
      </div>

      {/* 🎯 Upcoming Festive Dates Countdown - Modern Design */}
      {nextFestive && (
        <div className="mb-6">
          {/* Main Countdown Card - Glassmorphism Style */}
          <div 
            className="relative overflow-hidden rounded-3xl cursor-pointer group"
            onClick={() => setShowAllFestive(!showAllFestive)}
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(20, 184, 166, 0.15) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <div className="relative p-5">
              {/* Subtle glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
              
              <div className="relative flex items-center gap-4">
                {/* Icon with modern styling */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-3xl">{nextFestive.emoji}</span>
                  </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Festa e ardhshme</span>
                  <h3 className="text-white font-bold text-xl mt-1 truncate">{nextFestive.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 text-sm font-medium">{nextFestive.date} {months[nextFestive.month]}</span>
                  </div>
                </div>
                
                {/* Countdown - Big and Bold */}
                <div className="text-center shrink-0">
                  <div className="text-4xl font-black text-emerald-400">
                    {nextFestive.daysUntil}
                  </div>
                  <div className="text-xs text-emerald-300/70 font-semibold uppercase tracking-wider">
                    ditë
                  </div>
                </div>
                
                {/* Expand indicator */}
                <ChevronRight className={`w-6 h-6 text-emerald-400/60 transition-transform duration-300 ${showAllFestive ? 'rotate-90' : ''}`} />
              </div>
              
              {/* Bottom hint & See More Button */}
              <div className="mt-4 pt-3 border-t border-emerald-500/20 space-y-3">
                <p className="text-xs text-emerald-300/60 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Planifiko një takim special! Kliko për më shumë data festive.
                </p>
                
                {/* See More Festive Dates Button */}
                <Link
                  to="/festive-dates"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/30"
                >
                  <Calendar className="w-4 h-4" />
                  Shiko më shumë data festive
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Expandable list of upcoming dates */}
          {showAllFestive && (
            <div className="mt-3 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Datat e ardhshme festive</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {upcomingFestiveDates.slice(1, 7).map((festive, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all`}
                  >
                    <span className="text-xl">{festive.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{festive.name}</p>
                      <p className="text-slate-400 text-xs">{festive.date} {months[festive.month]}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${festive.color} bg-opacity-20`}>
                      <span className="text-xs font-bold text-white">{festive.daysUntil}d</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* See More Button */}
              <Link
                to="/festive-dates"
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold transition-all hover:scale-[1.02]"
              >
                <Calendar className="w-4 h-4" />
                Shiko të gjitha datat festive
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Event Type Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Tipi i Eventit</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setEventType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  eventType === type.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* City Selection - Modern Design */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Zgjidh Qytetin</h2>
          <span className="text-xs text-slate-500 ml-auto">{currentCountry?.flag} {currentCountry?.name}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Show first 12 cities, or all if showMoreCities */}
          {cities.slice(0, showMoreCities ? cities.length : 12).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/40'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-700/50 hover:border-yellow-500/50'
              }`}
            >
              {city}
            </button>
          ))}
          
          {/* Show More Cities button */}
          {cities.length > 12 && !showMoreCities && (
            <button
              onClick={() => setShowMoreCities(true)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50 flex items-center gap-1.5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>+{cities.length - 12} të tjera</span>
            </button>
          )}
          
          {/* Open city modal button */}
          <button
            onClick={() => setShowCityModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tjetër qytet</span>
          </button>
        </div>
        
        {/* Selected custom city indicator */}
        {selectedCity && !cities.includes(selectedCity) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-400">Qyteti i zgjedhur:</span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-semibold">
              {selectedCity}
            </span>
            <button
              onClick={() => setSelectedCity('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  Zgjidh Qytetin
                </h3>
                <button
                  onClick={() => setShowCityModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  placeholder="Kërko ose shkruaj qytetin..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
              </div>
            </div>
            
            {/* City List */}
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {/* If user typed something, show it as an option to select */}
              {customCityInput.trim() && !cities.some(c => c.toLowerCase() === customCityInput.toLowerCase()) && (
                <button
                  onClick={() => {
                    setSelectedCity(customCityInput.trim());
                    setShowCityModal(false);
                    setCustomCityInput('');
                  }}
                  className="w-full p-3 mb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-xl text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">"{customCityInput.trim()}"</p>
                      <p className="text-purple-300 text-sm">Kërko në këtë qytet</p>
                    </div>
                  </div>
                </button>
              )}
              
              {/* Filter cities based on input */}
              <div className="space-y-2">
                {cities
                  .filter(city => 
                    !customCityInput || 
                    city.toLowerCase().includes(customCityInput.toLowerCase())
                  )
                  .map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityModal(false);
                        setCustomCityInput('');
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedCity === city
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-yellow-500/30 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedCity === city
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                            : 'bg-slate-700'
                        }`}>
                          <MapPin className={`w-5 h-5 ${selectedCity === city ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${selectedCity === city ? 'text-yellow-300' : 'text-white'}`}>{city}</p>
                          <p className="text-slate-500 text-sm">{currentCountry?.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
              
              {/* No results message */}
              {customCityInput && !cities.some(c => c.toLowerCase().includes(customCityInput.toLowerCase())) && (
                <p className="text-center text-slate-400 text-sm mt-4">
                  Qyteti "{customCityInput}" nuk u gjet në listë, por mund ta kërkosh direkt.
                </p>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <Button
                onClick={() => {
                  if (customCityInput.trim()) {
                    setSelectedCity(customCityInput.trim());
                  }
                  setShowCityModal(false);
                  setCustomCityInput('');
                }}
                disabled={!customCityInput.trim() && !selectedCity}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl"
              >
                {customCityInput.trim() ? `Kërko në "${customCityInput.trim()}"` : 'Mbyll'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Button */}
      {selectedCity && (
        <Button
          onClick={searchLocalEvents}
          disabled={isLoadingEvents}
          className="w-full mb-6 py-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 hover:scale-[1.02] active:scale-95"
        >
          {isLoadingEvents ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Duke kërkuar...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              <span>Kërko Evente në {selectedCity}</span>
            </div>
          )}
        </Button>
      )}

      {/* Loading Local Events */}
      {isLoadingEvents && selectedCity && (
        <div className="text-center py-6 mb-6">
          <div className="inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 mt-3 text-sm">Duke kërkuar vende eventesh në {selectedCity}...</p>
        </div>
      )}

      {/* Local Events/Venues Section */}
      {selectedCity && !isLoadingEvents && localEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-yellow-400" />
              {localEvents.length} Vende në {selectedCity}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
          </div>

          <div className="space-y-4">
            {localEvents.slice(0, visibleCount).map((venue, index) => (
              <div
                key={venue.id}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(192, 132, 252, 0.1) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.3s ease-out forwards'
                }}
              >
                {/* Subtle glow */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                
                <div className="relative p-4">
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {venue.isOpen !== undefined && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          venue.isOpen 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {venue.isOpen ? '● Hapur' : '○ Mbyllur'}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs font-semibold text-purple-300">
                        ✓ Verified
                      </span>
                    </div>
                    {venue.rating && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 rounded-full">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-amber-300">{venue.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Main content */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg mb-1">{venue.name}</h3>
                      <p className="text-slate-400 text-sm mb-2 line-clamp-2">{venue.description}</p>
                      
                      {venue.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <span className="truncate">{venue.location}</span>
                        </div>
                      )}

                      {/* Actions - Modern Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {venue.googleMapsLink && (
                          <a
                            href={venue.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-xs font-bold text-purple-300 transition-all hover:scale-105"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Google Maps
                          </a>
                        )}
                        
                        {/* Ticket Search Button */}
                        {venue.ticketSearchUrl && (
                          <a
                            href={venue.ticketSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl text-xs font-bold text-pink-300 transition-all hover:scale-105"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            Bileta
                          </a>
                        )}
                      
                        {/* Favorite Button */}
                        <button
                          onClick={() => handleFavoriteToggle(venue)}
                          className={`p-2 rounded-xl transition-all ${
                            checkFavorite(venue)
                              ? 'bg-pink-500/30 text-pink-300'
                              : 'bg-slate-700/30 text-slate-400 hover:text-pink-300 hover:bg-pink-500/20'
                          }`}
                          title={checkFavorite(venue) ? 'Hiq nga të preferuarat' : 'Shto në të preferuara'}
                        >
                          {checkFavorite(venue) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        
                        {/* Share Button */}
                        <ShareButton
                          variant="mini"
                          title={venue.name}
                          text={`Shiko ${venue.name} në ${selectedCity}! 🎉`}
                          url={venue.googleMapsLink || window.location.href}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {localEvents.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLoadingMore(true);
                  setTimeout(() => {
                    setVisibleCount(prev => prev + 5);
                    setIsLoadingMore(false);
                  }, 300);
                }}
                disabled={isLoadingMore}
                className="group relative px-8 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border-2 border-yellow-500/50 hover:border-yellow-400 rounded-2xl text-yellow-300 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  {isLoadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                      Duke ngarkuar...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Shiko më shumë ({localEvents.length - visibleCount} të tjera)
                    </>
                  )}
                </span>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {/* Show count indicator */}
          {localEvents.length > 0 && (
            <p className="text-center text-slate-500 text-sm mt-4">
              Duke shfaqur {Math.min(visibleCount, localEvents.length)} nga {localEvents.length} vende
            </p>
          )}

          {/* Search Tickets Online Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 border border-purple-500/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Kërko Bileta Online</h3>
                <p className="text-slate-400 text-xs">Gjej bileta për evente në {selectedCity}</p>
              </div>
            </div>
            <a
              href={getTicketSearchUrl(selectedCity)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              Kërko Bileta për {selectedCity}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Empty state for events */}
      {selectedCity && !isLoadingEvents && localEvents.length === 0 && (
        <div className="text-center py-12 mb-6">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-white font-bold text-lg mb-2">Nuk u gjetën vende eventesh</h3>
          <p className="text-slate-400">Nuk u gjetën vende eventesh në {selectedCity}</p>
          <p className="text-slate-500 text-sm mt-1">Provo një qytet tjetër ose tip tjetër eventi</p>
        </div>
      )}

      {/* No city selected state */}
      {!selectedCity && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-white font-bold text-lg mb-2">Zgjidh një qytet</h3>
          <p className="text-slate-400">Zgjidh qytetin tënd për të parë evente dhe vende argëtimi</p>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-yellow-500/30 backdrop-blur-sm">
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Këshilla për Evente
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Kontrollo oraret e hapjes para se të shkosh</li>
            <li>• Rezervo paraprakisht për evente të mëdha</li>
            <li>• Evente muzikore janë perfekte për takime</li>
            <li>• Eksploro vende të reja kulturore në qytetin tënd</li>
          </ul>
        </div>
      </Card>
    </div>
    </PullToRefresh>
  );
}

