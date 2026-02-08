import { auth } from '@/lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function checkAuth(req: NextRequest) {
    const session = await auth();
    
    if (!session || !session.user) {
        return {
            isAuthenticated: false,
            error: NextResponse.json(
                { error: 'Unauthorized: Please sign in to access this resource' },
                { status: 401 }
            ),
            user: null,
        };
    }

    return {
        isAuthenticated: true,
        error: null,
        user: session.user,
    };
}
