'use client';

import { ReactNode, useEffect, useState, useSyncExternalStore } from 'react';
import { BookOpen, Home, LogIn, LogOut, Menu, User, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/Button';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Link from 'next/link';

export const navLinkVariants = cva(
  'flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-all focus-visible:ring-2 focus-visible:ring-gray-100 focus-visible:outline-none',
  {
    variants: {
      active: {
        true: 'bg-gradient-primary text-gray-50 shadow-sm',
        false: 'text-gray-200 hover:text-gray-50',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export type NavLinkVariants = VariantProps<typeof navLinkVariants>;

interface HeaderNavLink {
  label: string;
  href: string;
  icon: ReactNode;
  requiresAuth?: boolean;
}

const navLinks: HeaderNavLink[] = [
  { label: 'Início', href: '/', icon: <Home size={18} /> },
  { label: 'Cursos', href: '/cursos', icon: <BookOpen size={18} /> },
  {
    label: 'Perfil',
    href: '/perfil',
    icon: <User size={18} />,
    requiresAuth: true,
  },
];

export const Header = () => {
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

  const renderNavLinks = (onNavigate?: () => void) => (
    <>
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          aria-current={isActive(link.href) ? 'page' : undefined}
          className={cn(navLinkVariants({ active: isActive(link.href) }))}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}

      {isLoggedIn ? (
        <Button
          variant="ghost"
          icon={<LogOut size={18} />}
          iconPosition="left"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          className="justify-start px-4 py-2 hover:bg-transparent"
        >
          Sair
        </Button>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className={cn(
            buttonVariants({
              variant: isActive('/login') ? 'primary' : 'ghost',
            }),
            'justify-start px-4 py-2 hover:bg-transparent'
          )}
        >
          <LogIn size={18} />
          Entrar
        </Link>
      )}
    </>
  );

  return (
    <header
      className={cn('w-full border-b border-background-200 bg-background-500')}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href={'/'} className="text-gradient-primary text-xl font-bold">
          Curso em Texto
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex md:items-center md:gap-2"
        >
          {renderNavLinks()}
        </nav>

        <Button
          variant="ghost"
          aria-label="Abrir menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          icon={<Menu size={24} />}
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-100 md:hidden"
        />
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            data-testid="menu-overlay"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute top-0 right-0 flex h-full w-72 max-w-[80%] flex-col gap-2 bg-background-500 p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gradient-primary text-lg font-bold">
                Curso em Texto
              </span>

              <Button
                variant="ghost"
                aria-label="Fechar menu"
                icon={<X size={24} />}
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-100"
              />
            </div>

            <hr className="mb-4 border-background-200" />

            <nav aria-label="Navegação mobile" className="flex flex-col gap-2">
              {renderNavLinks(() => setIsOpen(false))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
