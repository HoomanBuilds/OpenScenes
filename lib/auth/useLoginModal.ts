import { useAuth } from './hooks';
import { useCallback, useState } from 'react';

export function useLoginModal() {
    const { isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const requireLogin = useCallback(async (action?: () => Promise<void> | void) => {
        if (!isAuthenticated) {
            setIsModalOpen(true);
            return false;
        }
        
        if (action) {
            await action();
        }
        return true;
    }, [isAuthenticated]);

    return {
        isModalOpen,
        setIsModalOpen,
        requireLogin,
        isAuthenticated,
    };
}
