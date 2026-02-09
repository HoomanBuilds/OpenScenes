import React from 'react';
import Dashboard from './Dashboard';

export const dynamic = "force-dynamic";
export default function GeneratePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Dashboard />
    </main>
  );
}
