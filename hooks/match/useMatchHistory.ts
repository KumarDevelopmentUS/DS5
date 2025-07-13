// hooks/match/useMatchHistory.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../../services/database/databaseService';
import { Match } from '../../types/models';
import { parseError } from '../../utils/errors';

// ============================================
// TYPE DEFINITIONS
// ============================================

type MatchStatus = 'completed' | 'abandoned';

export interface UseMatchHistoryOptions {
  pageSize?: number;
  status?: MatchStatus;
}

export interface UseMatchHistoryResult {
  matches: Match[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refresh: () => void;
}

interface QueryResult {
  items: Match[];
  nextCursor: number | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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
 * Fetches a paginated history of matches for a given user.
 *
 * @param userId - The ID of the user.
 * @param limit - The number of items to fetch per page.
 * @param offset - The starting point for the fetch.
 * @param status - An optional status to filter the matches by.
 * @returns A promise that resolves to an array of Match objects.
 */
const fetchMatchHistory = async (
  userId: string,
  limit: number,
  offset: number,
  status?: MatchStatus
): Promise<Match[]> => {
  // Get the IDs of all matches the user has participated in.
  const { data: participantEntries, error: participantError } = await supabase
    .from('match_participants')
    .select('match_id')
    .eq('user_id', userId);

  if (participantError) {
    throw parseError(participantError);
  }

  if (!participantEntries || participantEntries.length === 0) {
    return [];
  }

  const matchIds = participantEntries.map((entry) => entry.match_id);

  // Build the query to fetch the match details.
  let query = supabase
    .from('matches')
    .select('*')
    .in('id', matchIds)
    .in('status', ['completed', 'abandoned']) // Only fetch finished matches
    .order('ended_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  // Apply the status filter if provided.
  if (status) {
    query = query.eq('status', status);
  }

  const { data: matches, error: matchesError } = await query;

  if (matchesError) {
    throw parseError(matchesError);
  }

  return (matches || []).map(transformMatch);
};

// ============================================
// MAIN HOOK
// ============================================

/**
 * A custom hook to fetch and paginate a user's match history.
 *
 * @param options - Configuration options for fetching, including pageSize and status filter.
 * @returns An object containing the paginated match history and query state.
 */
export const useMatchHistory = (
  options: UseMatchHistoryOptions = {}
): UseMatchHistoryResult => {
  const { pageSize = 15, status } = options;
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<QueryResult, Error>({
    queryKey: ['matchHistory', user?.id, status],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) {
        return { items: [], nextCursor: null };
      }

      const offset = pageParam as number;
      const items = await fetchMatchHistory(user.id, pageSize, offset, status);

      return {
        items,
        nextCursor: items.length === pageSize ? offset + pageSize : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user?.id,
    initialPageParam: 0,
  });

  const matches = data?.pages.flatMap((page) => page.items) || [];

  return {
    matches,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage: () => fetchNextPage(),
    refresh: () => refetch(),
  };
};
