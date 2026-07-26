import { useUser } from "@clerk/nextjs";

/**
 * Hook to get the current user's identifier for API calls.
 * Returns null while auth is loading, a unique user id once ready.
 */
export function useCurrentUserId(): string | null {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return null;

  if (user) return user.id;

  if (typeof window !== "undefined") {
    const googleUser = localStorage.getItem("tf_google_user");
    if (googleUser) {
      try {
        const parsed = JSON.parse(googleUser);
        if (parsed.email) return parsed.email;
      } catch {}
    }
  }

  return "default_creator";
}