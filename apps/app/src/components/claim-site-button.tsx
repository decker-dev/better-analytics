'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Clock, Trophy, ArrowRight } from 'lucide-react';

interface ClaimSiteButtonProps {
  siteKey: string;
  timeRemaining: number | null;
  onClaim?: (siteKey: string) => void;
}

export function ClaimSiteButton({ siteKey, timeRemaining, onClaim }: ClaimSiteButtonProps) {
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const handleClaim = async () => {
    if (!siteName.trim()) return;
    
    setLoading(true);
    try {
      // Aquí llamaremos a la API para hacer claim del site
      const response = await fetch('/api/sites/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteKey,
          name: siteName.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (response.ok) {
        onClaim?.(siteKey);
        // Redirect to onboarding or dashboard
        window.location.href = '/onboarding';
      } else {
        // Handle error
        console.error('Failed to claim site');
      }
    } catch (error) {
      console.error('Error claiming site:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!timeRemaining) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            ¿Te gusta lo que ves?
          </h3>
          <p className="text-gray-600 text-sm">
            Este sitio de demo expira en{' '}
            <span className="font-medium text-red-600">
              <Clock className="inline w-4 h-4 mr-1" />
              {formatTimeRemaining(timeRemaining)}
            </span>
          </p>
        </div>

        {!showClaimForm ? (
          <Button 
            onClick={() => setShowClaimForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Reclamar sitio
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="w-80 space-y-3">
            <Input
              placeholder="Nombre del sitio"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-blue-200 focus:border-blue-400 h-20"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClaimForm(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={!siteName.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Reclamando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}