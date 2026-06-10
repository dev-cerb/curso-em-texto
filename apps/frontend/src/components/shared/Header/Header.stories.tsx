import { usePathname } from '@storybook/nextjs-vite/navigation.mock';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AuthContext } from '@/contexts/AuthContext';
import { Header } from '@/components/shared/Header';
import { MouseEvent, useState } from 'react';

const meta = {
  title: 'Components/Shared/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveHeader = ({ authenticated }: { authenticated: boolean }) => {
  const [pathname, setPathname] = useState('/');

  usePathname.mockReturnValue(pathname);

  const handleNavigate = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');

    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');

    if (href) {
      event.preventDefault();
      setPathname(href);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: () => authenticated,
        login: () => {},
        logout: () => {},
      }}
    >
      <div onClickCapture={handleNavigate}>
        <Header />
      </div>
    </AuthContext.Provider>
  );
};

export const LoggedOut: Story = {
  render: () => <InteractiveHeader authenticated={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const coursesLink = canvas.getByRole('link', { name: /Cursos/ });
    await userEvent.click(coursesLink);

    await expect(coursesLink).toHaveAttribute('aria-current', 'page');
  },
};

export const LoggedIn: Story = {
  render: () => <InteractiveHeader authenticated />,
};
