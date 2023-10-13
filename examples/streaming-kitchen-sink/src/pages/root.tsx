import './root.css';

import { useCallback } from 'react';
import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';

import { ctx } from '~/app.tsx';

export function Component() {
  const linkClass = useCallback(({ isActive }: any) => `root-nav__item ${isActive ? 'active' : undefined}`, []);

  return (
    <>
      <nav className="root-nav">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>

        <NavLink to="/wait" className={linkClass}>
          Waiter
        </NavLink>

        <NavLink to="/lazy-component" className={linkClass}>
          Lazy Component
        </NavLink>

        <NavLink to="/admin" className={linkClass}>
          Admin
        </NavLink>

        <AddPostButton />

        <SignupButton />

        <LoginButton />

        <LogoutButton />
      </nav>

      <div className="root-content">
        <Outlet />
      </div>

      <ScrollRestoration />
    </>
  );
}

const AddPostButton = () => {
  const mut = ctx.trpc.posts.create.useMutation();

  return (
    <button
      onClick={async () => {
        try {
          await mut.mutateAsync({
            title: 'Hello',
            body: 'World',
          });
        } catch (e: any) {
          alert(`Error: ${e.message}`);
        }
      }}
    >
      Add Post
    </button>
  );
};

const SignupButton = () => {
  const { data, isLoading } = ctx.trpc.auth.me.useQuery();
  const signup = ctx.trpc.auth.signup.useMutation();

  if (data || isLoading) return null;

  return (
    <button
      onClick={async () => {
        try {
          await signup.mutateAsync({
            username: 'marc',
            password: 'password',
          });
        } catch (e: any) {
          alert(`Error: ${e.message}`);
        }
      }}
    >
      Signup
    </button>
  );
};

const LoginButton = () => {
  const { data, isLoading } = ctx.trpc.auth.me.useQuery();
  const login = ctx.trpc.auth.login.useMutation();

  if (data || isLoading) return null;

  return (
    <button
      onClick={async () => {
        try {
          await login.mutateAsync({
            username: 'marc',
            password: 'password',
          });
        } catch (e: any) {
          alert(`Error: ${e.message}`);
        }
      }}
    >
      Login
    </button>
  );
};

const LogoutButton = () => {
  const { data } = ctx.trpc.auth.me.useQuery();
  const logout = ctx.trpc.auth.logout.useMutation();

  if (!data) {
    return null;
  }

  return (
    <button
      onClick={async () => {
        try {
          await logout.mutateAsync();
        } catch (e: any) {
          alert(`Error: ${e.message}`);
        }
      }}
    >
      Hi {data.username} - Logout
    </button>
  );
};
