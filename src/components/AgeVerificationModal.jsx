import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Calendar, CheckCircle2, X } from 'lucide-react';

export default function AgeVerificationModal({ isOpen, onVerify, onDecline }) {
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const calculateAge = (day, month, year) => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerify = () => {
    if (!birthDay || !birthMonth || !birthYear) {
      setError('Please enter your complete date of birth');
      return;
    }

    const age = calculateAge(parseInt(birthDay), parseInt(birthMonth), parseInt(birthYear));
    
    if (age < 18) {
      setError('You must be 18 or older to access this content');
      setTimeout(() => {
        onDecline();
      }, 2000);
      return;
    }

    // Store age verification
    const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;
    localStorage.setItem('ageVerified', 'true');
    localStorage.setItem('userAge', age.toString());
    localStorage.setItem('userDateOfBirth', dateOfBirth);
    
    onVerify(age);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/50 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Age Verification Required</h2>
            <p className="text-slate-400 text-sm">
              You must be 18 or older to access Intimacy Coach
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-300 text-sm font-medium mb-2">⚠️ Mature Content Warning</p>
            <p className="text-slate-300 text-xs">
              This section contains educational content about sexual health, intimacy, and relationships. 
              All content is for educational purposes only.
            </p>
          </div>

          {/* Date of Birth */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Enter Your Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Day */}
              <select
                value={birthDay}
                onChange={(e) => {
                  setBirthDay(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                style={{ fontSize: '16px' }}
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              {/* Month */}
              <select
                value={birthMonth}
                onChange={(e) => {
                  setBirthMonth(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                style={{ fontSize: '16px' }}
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>

              {/* Year */}
              <select
                value={birthYear}
                onChange={(e) => {
                  setBirthYear(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                style={{ fontSize: '16px' }}
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {birthDay && birthMonth && birthYear && (
              <p className="text-slate-400 text-xs mt-2 text-center">
                Age: {calculateAge(parseInt(birthDay), parseInt(birthMonth), parseInt(birthYear))} years old
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onDecline}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white h-12"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white h-12 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Verify Age
            </Button>
          </div>

          {/* Legal Disclaimer */}
          <p className="text-slate-500 text-xs text-center mt-4">
            By continuing, you confirm you are 18+ and agree to receive educational content about sexual health and intimacy.
          </p>
        </div>
      </Card>
    </div>
  );
}
