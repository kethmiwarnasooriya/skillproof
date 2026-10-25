import { startTransition, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, GlassCard, Logo } from "../common";
import { MEMBER_NAV_LINKS, NAV_LINKS } from "../../constants/content";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  // Member-only links (Dashboard, Task Hub) are shown only when logged in
  const links = isAuthenticated ? [...MEMBER_NAV_LINKS, ...NAV_LINKS] : NAV_LINKS;

  const handleSignOut = () => {
    setOpen(false);
    // Router navigation runs as a transition; signing out in the same transition makes both render together,
    // so a protected page doesn't see "signed out" first and redirect to /login
    startTransition(() => {
      navigate("/");
      signOut();
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <GlassCard as="nav" className="mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
        <Logo />
        <ul className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {links.map((n) => (
            <li key={n.to}><Link to={n.to} className="hover:text-amber-300">{n.label}</Link></li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 rounded-full pr-1 text-sm text-slate-300 hover:text-white" title={user.email}>
                <Avatar name={user.fullName} size="sm" />
                <span className="max-w-32 truncate">{user.fullName}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white">Sign in</Link>
              <Button href="/register" size="sm">Start</Button>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 text-slate-200 md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </GlassCard>
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-xl md:hidden">
          {isAuthenticated && (
            <div className="mb-5 flex items-center gap-3 border-b border-slate-800 pb-5">
              <Avatar name={user.fullName} />
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{user.fullName}</p>
                <p className="truncate text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
          <ul className="space-y-4 text-slate-200">
            {links.map((n) => <li key={n.to}><Link to={n.to} onClick={() => setOpen(false)}>{n.label}</Link></li>)}
            {!isAuthenticated && <li><Link to="/login" onClick={() => setOpen(false)}>Sign in</Link></li>}
          </ul>
          {isAuthenticated
            ? <Button variant="outline" onClick={handleSignOut} className="mt-5 w-full">Sign out</Button>
            : <Button href="/register" className="mt-5 w-full">Start</Button>}
        </div>
      )}
    </header>
  );
}
