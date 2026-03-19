import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ThemeToggle } from './ui/theme-toggle';

const Navbar = ({
  onCreateClick,
  onExploreClick,
  onTestClick,
  onSearch,
  onGoToLogin,
  onGoToRegister,
  onGoHome,
  onGoToProfile
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', onClick: onGoHome },
    { label: 'Explore', onClick: onExploreClick },
    { label: 'Test', onClick: onTestClick }
  ];

  if (isAuthenticated) {
    navItems.push({ label: 'Create', onClick: onCreateClick });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <button className="flex items-center gap-2" onClick={onGoHome}>
          <div className="rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 p-2 text-white">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
          </div>
          <span className="text-lg font-bold tracking-tight">AI Prompt Builder</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" onClick={item.onClick}>
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <form onSubmit={submitSearch} className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-muted-foreground">search</span>
            <Input
              className="w-56 pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              aria-label="Search prompts"
            />
          </form>

          <ThemeToggle />

          {!isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={onGoToLogin}>Login</Button>
              <Button onClick={onGoToRegister}>Sign up</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onGoToProfile}>{user?.name || 'Profile'}</Button>
              <Button variant="secondary" onClick={logout}>Logout</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen((prev) => !prev)}>
            <span className="material-symbols-outlined">menu</span>
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              aria-label="Search prompts"
            />
            <Button type="submit" size="icon">
              <span className="material-symbols-outlined">search</span>
            </Button>
          </form>

          <div className="grid gap-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  item.onClick?.();
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
              </Button>
            ))}

            {!isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => { onGoToLogin?.(); setIsMobileMenuOpen(false); }}>Login</Button>
                <Button onClick={() => { onGoToRegister?.(); setIsMobileMenuOpen(false); }}>Sign up</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => { onGoToProfile?.(); setIsMobileMenuOpen(false); }}>Profile</Button>
                <Button variant="secondary" onClick={logout}>Logout</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
