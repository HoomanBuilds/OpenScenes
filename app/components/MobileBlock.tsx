import React from 'react';
import { MonitorX } from 'lucide-react';

const MobileBlock = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-8 md:hidden">
            <div className="flex flex-col items-center space-y-4 text-center">
                <MonitorX className="w-8 h-8 text-zinc-800" strokeWidth={1.5} />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-400">Desktop Terminal Required</p>
                    <p className="text-xs text-zinc-600">Please switch to a larger display.</p>
                </div>
            </div>
        </div>
    );
};

export default MobileBlock;
