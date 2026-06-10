import { ReactNode, useEffect, useState, useSyncExternalStore } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/contexts/AuthContext';
import { Book, Home, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderNavLink {
  label: string;
  href: string;
  icon: ReactNode;
  requiresAuth?: boolean;
}

const navLinks: HeaderNavLink[] = [
  { label: 'Início', href: '/', icon: <Home size={18} /> },
  { label: 'Cursos', href: '/cursos', icon: <Book size={18} /> },
  {
    label: 'Perfil',
    href: '/perfil',
    icon: <User size={18} />,
    requiresAuth: true,
  },
];

export const useHeader = () => {
  const pathname = usePathname() ?? '/';
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const isLoggedIn = useSyncExternalStore(
    (callback) => {
      window.addEventListener('auth-change', callback);
      return () => window.removeEventListener('auth-change', callback);
    },
    () => isAuthenticated(),
    () => false
  );

  const visibleLinks = navLinks.filter(
    (link) => !link.requiresAuth || isLoggedIn
  );

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isDrawerOpen = isMobile && isOpen;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isLoggedIn,
    isOpen,
    setIsOpen,
    isDrawerOpen,
    visibleLinks,
    isActive,
    logout,
  };
};
