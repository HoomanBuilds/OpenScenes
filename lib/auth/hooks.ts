import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

export function useAuth() {
    const { data: session, status } = useSession();

    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    const login = useCallback(async (provider: 'google' | 'github' = 'google') => {
        await signIn(provider);
    }, []);

    const logout = useCallback(async () => {
        await signOut({ redirectTo: '/login' });
    }, []);

    return {
        session,
        user: session?.user,
        isLoading,
        isAuthenticated,
        login,
        logout,
    };
}
