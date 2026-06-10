import { fireEvent, render, screen, within } from '@testing-library/react';
import { Header } from '@/components/shared/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { vi } from 'vitest';

vi.mock('@/contexts/AuthContext');

const mockedUsePathname = vi.mocked(usePathname);
const mockedUseAuth = vi.mocked(useAuth);

const mockAuth = (isAuthenticated: boolean, logout = vi.fn()) => {
  mockedUseAuth.mockReturnValue({
    isAuthenticated: () => isAuthenticated,
    login: vi.fn(),
    logout,
  });

  return logout;
};

describe('<Header />', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/');
    window.innerWidth = 1024;
    mockAuth(false);
  });

  it('should render the logo linking to the home page', () => {
    render(<Header />);

    expect(
      screen.getByRole('link', { name: 'Curso em Texto' })
    ).toHaveAttribute('href', '/');
  });

  it('should render the public links', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /Início/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cursos/ })).toBeInTheDocument();
  });

  it('should render the "Entrar" link pointing to /login when not authenticated', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /Entrar/ })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('should highlight the "Entrar" link with the primary variant on the login page', () => {
    mockedUsePathname.mockReturnValue('/login');

    render(<Header />);

    expect(screen.getByRole('link', { name: /Entrar/ })).toHaveClass(
      'bg-gradient-primary'
    );
  });

  it('should render the "Entrar" link with the ghost variant outside the login page', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /Entrar/ })).not.toHaveClass(
      'bg-gradient-primary'
    );
  });

  it('should not render "Perfil" and "Sair" when not authenticated', () => {
    render(<Header />);

    expect(
      screen.queryByRole('link', { name: /Perfil/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Sair/ })
    ).not.toBeInTheDocument();
  });

  it('should render "Perfil" and "Sair" when authenticated', () => {
    mockAuth(true);

    render(<Header />);

    expect(screen.getByRole('link', { name: /Perfil/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sair/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Entrar/ })
    ).not.toBeInTheDocument();
  });

  it('should call logout when "Sair" is clicked', () => {
    const logout = mockAuth(true);

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Sair/ }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('should mark the link of the current path as active', () => {
    mockedUsePathname.mockReturnValue('/cursos');

    render(<Header />);

    expect(screen.getByRole('link', { name: /Cursos/ })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: /Início/ })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('should open the mobile drawer when the menu button is clicked', () => {
    window.innerWidth = 375;

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('dialog', { name: 'Menu de navegação' })
    ).toBeInTheDocument();
  });

  it('should close the mobile drawer when the overlay is clicked', () => {
    window.innerWidth = 375;

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getByTestId('menu-overlay'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close the mobile drawer when the close button is clicked', () => {
    window.innerWidth = 375;

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar menu' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close the mobile drawer when pressing Escape', () => {
    window.innerWidth = 375;

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render a separator between the header and the navigation in the drawer', () => {
    window.innerWidth = 375;

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByRole('separator')).toBeInTheDocument();
  });

  it('should close the mobile drawer when a navigation link is clicked', () => {
    window.innerWidth = 375;

    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    const drawer = screen.getByRole('dialog');
    fireEvent.click(within(drawer).getByRole('link', { name: /Início/ }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
