// hooks/match/useActiveMatches.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../../services/database/databaseService';
import { Match } from '../../types/models';
import { parseError } from '../../utils/errors';

/**
 * Interface for the return value of the useActiveMatches hook.
 */
export interface UseActiveMatchesResult {
  activeMatches: Match[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Transforms a match object from the database (snake_case) to the application's Match model (camelCase).
 * @param dbMatch - The raw match object from the Supabase query.
 * @returns A Match object that conforms to the application's type definitions.
 */
const transformMatch = (dbMatch: any): Match => ({
  id: dbMatch.id,
  roomCode: dbMatch.room_code,
  title: dbMatch.title,
  description: dbMatch.description,
  creatorId: dbMatch.creator_id,
  location: dbMatch.location,
  status: dbMatch.status,
  gameType: dbMatch.game_type,
  settings: dbMatch.settings,
  isPublic: dbMatch.is_public,
  createdAt: new Date(dbMatch.created_at),
  startedAt: dbMatch.started_at ? new Date(dbMatch.started_at) : undefined,
  endedAt: dbMatch.ended_at ? new Date(dbMatch.ended_at) : undefined,
});

/**
 * Fetches all matches for a given user that are currently in an 'active' state.
 *
 * @param userId - The ID of the user whose active matches are to be fetched.
 * @returns A promise that resolves to an array of active Match objects.
 */
const fetchActiveMatches = async (userId: string): Promise<Match[]> => {
  // First, get the IDs of all matches the user is a participant in.
  const { data: participantEntries, error: participantError } = await supabase
    .from('match_participants')
    .select('match_id')
    .eq('user_id', userId);

  if (participantError) {
    throw parseError(participantError);
  }

  if (!participantEntries || participantEntries.length === 0) {
    return []; // The user is not a participant in any matches.
  }

  const matchIds = participantEntries.map((entry) => entry.match_id);

  // Then, fetch the full details for those matches that have a status of 'active'.
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .in('id', matchIds)
    .eq('status', 'active');

  if (matchesError) {
    throw parseError(matchesError);
  }

  // Transform the snake_case data from the DB to the camelCase model
  return (matches || []).map(transformMatch);
};

/**
 * A custom hook to fetch and manage the state for a user's currently active matches.
 * It handles fetching the data, loading states, and potential errors.
 *
 * @returns An object containing the active matches, loading state, error state, and a refetch function.
 */
export const useActiveMatches = (): UseActiveMatchesResult => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<Match[], Error>({
    queryKey: ['activeMatches', user?.id],
    queryFn: () => {
      if (!user?.id) {
        // If there is no user, return an empty array.
        return Promise.resolve([]);
      }
      return fetchActiveMatches(user.id);
    },
    // The query will only execute if a user is authenticated.
    enabled: !!user?.id,
  });

  return {
    activeMatches: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
