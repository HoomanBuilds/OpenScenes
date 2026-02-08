/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

export const UserMenu: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (isLoading) {
        return (
            <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <Link href="/">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer">
                    <User className="w-5 h-5 text-zinc-400" />
                </div>
            </Link>
        );
    }

    const avatarUrl = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    const joinDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-zinc-800 border-2 border-zinc-700 hover:border-purple-600 transition-colors overflow-hidden group"
                title={user.email || 'User'}
            >
                <img
                    src={avatarUrl}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Purple accent bar */}
                            <div className="h-1 bg-gradient-to-r from-purple-600 via-purple-500 to-zinc-800" />

                            {/* Profile Section */}
                            <div className="p-6 bg-zinc-900/50">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={avatarUrl}
                                        alt={user.name || 'User'}
                                        className="w-16 h-16 border-2 border-zinc-700"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-white truncate">
                                            {user.name || 'User'}
                                        </h3>
                                        <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="px-6 py-4 space-y-3 border-t border-zinc-800">
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <User className="w-4 h-4" />
                                    <span>GitHub Account</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {joinDate}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-zinc-800">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold text-red-400 hover:bg-zinc-900 transition-colors uppercase tracking-wider"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
