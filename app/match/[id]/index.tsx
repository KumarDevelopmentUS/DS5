// app/match/[id]/index.tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Tracker } from '../../../components/match/Tracker/Tracker';

/**
 * Live Match Screen
 * 
 * Displays the tracker interface for a specific match.
 */
export default function LiveMatchScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  if (!matchId) return null;
  return <Tracker matchId={matchId} />;
}
