import React, { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';

export function SaveButton({ item, type, onSaved, className = '' }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const backendUrl = getBackendUrl();
  const userId = localStorage.getItem('userId');

  const handleSave = async (e) => {
    e.stopPropagation();
    
    if (!userId) {
      alert('Duhet të jesh i kyçur për të ruajtur');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${backendUrl}/api/user/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ type, item })
      });

      if (response.ok) {
        setSaved(true);
        if (onSaved) onSaved();
        
        // Show success message
        setTimeout(() => {
          setSaved(false);
        }, 2000);
      } else {
        alert('Gabim gjatë ruajtjes');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Gabim gjatë ruajtjes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
        saved
          ? 'bg-green-500/20 text-green-300 border border-green-500/50'
          : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50'
      } disabled:opacity-50 ${className}`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          <span className="text-sm">Ruajtur!</span>
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          <span className="text-sm">{saving ? 'Duke ruajtur...' : 'Ruaj'}</span>
        </>
      )}
    </button>
  );
}

