'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/components/button";
import { Play } from "lucide-react";
import { createTemporarySite } from './actions';

export function TestInProductionButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleTestInProduction = () => {
    startTransition(async () => {
      const result = await createTemporarySite();
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else if (result.error) {
        console.error('Failed to create temporary site:', result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleTestInProduction}
      disabled={isPending}
      size="lg"
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Play className="mr-2 h-4 w-4" />
      {isPending ? 'Creating demo...' : 'Test in Production'}
    </Button>
  );
}