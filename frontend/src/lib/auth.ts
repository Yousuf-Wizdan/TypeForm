import { useUser } from "@clerk/nextjs";

/**
 * Hook to get the current user's identifier for API calls.
 * All forms share the "default_creator" namespace so seed data
 * is visible to every signed-in user.
 */
export function useCurrentUserId(): string | null {
  const { isLoaded } = useUser();

  if (!isLoaded) return null;

  return "default_creator";
}