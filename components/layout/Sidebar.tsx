'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
}

const sidebarItems: SidebarItem[] = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/usuarios', label: 'Usuarios', icon: '👥' },
  { href: '/parcelas', label: 'Parcelas', icon: '🌱' },
  { href: '/sensores', label: 'Sensores', icon: '📡' },
  { href: '/mediciones', label: 'Mediciones', icon: '📈' },
  { href: '/alertas', label: 'Alertas', icon: '⚠️' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Huertas Urbanas</h1>
        <p className="text-gray-300 text-sm">Sistema de Gestión IoT</p>
      </div>

      <nav>
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
