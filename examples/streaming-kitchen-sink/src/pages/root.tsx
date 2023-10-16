import { useCallback } from 'react';
import { NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router-dom';

import type { RouterOutputs } from '~/app.tsx';
import { ctx } from '~/app.tsx';
import { Button } from '~/components/ui/button.tsx';
import { Toaster } from '~/components/ui/toaster.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip.tsx';
import { useToast } from '~/components/ui/use-toast.ts';
import { cn } from '~/utils.ts';

export function Component() {
  const navigate = useNavigate();
  const linkClass = useCallback(
    ({ isActive }: any) => (isActive ? 'opacity-100 cursor-default' : 'hover:opacity-100 opacity-60'),
    [],
  );

  // https://unhead.unjs.io/usage/guides/template-params#separator
  ctx.useHead({
    titleTemplate: '%s %separator %subpage %separator %site.name',
    templateParams: {
      site: { name: 'Streaming Kitchen Sink' },
      separator: '-',
      subpage: null,
    },
    meta: [
      {
        name: 'description',
        content: 'Welcome to %site.name.',
      },
      {
        property: 'og:site_name',
        content: '%site.name',
      },
      {
        property: 'og:url',
        content: '%site.url/my-page',
      },
    ],
  });

  return (
    <>
      <TooltipProvider>
        <div className="border-b flex">
          <nav className="border-b flex items-center gap-6 py-4 px-6 flex-1">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>

            <NavLink to="/articles" className={linkClass}>
              Articles
            </NavLink>

            <NavLink to="/wait" className={linkClass}>
              Waiter
            </NavLink>
          </nav>

          <nav className="flex items-center gap-4 py-4 px-6">
            <AddArticleButton onSuccess={({ id }) => navigate(`/articles/${id}/edit`)} />
            <LoginButton />
            <LogoutButton />
          </nav>
        </div>

        <Outlet />
      </TooltipProvider>

      <Toaster />
      <ScrollRestoration />
    </>
  );
}

const AddArticleButton = ({ onSuccess }: { onSuccess?: (article: RouterOutputs['articles']['create']) => void }) => {
  const { toast } = useToast();

  const { data } = ctx.trpc.auth.me.useQuery();
  const isLoggedIn = !!data;

  const mut = ctx.trpc.articles.create.useMutation();

  const buttonElem = (
    <Button
      size="sm"
      disabled={!isLoggedIn || mut.isPending}
      className={cn(!isLoggedIn && 'pointer-events-none')}
      onClick={async () => {
        try {
          const article = await mut.mutateAsync({
            title: 'Your new article',
            body: 'Write something awesome...',
          });

          if (onSuccess) onSuccess(article);

          toast({
            description: 'Article created',
          });
        } catch (e: any) {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        }
      }}
    >
      Add Article
    </Button>
  );

  if (isLoggedIn) return buttonElem;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{buttonElem}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>You must login to create an article</p>
      </TooltipContent>
    </Tooltip>
  );
};

// const SignupButton = () => {
//   const { data, isLoading } = ctx.trpc.auth.me.useQuery();
//   const signup = ctx.trpc.auth.signup.useMutation();

//   if (data || isLoading) return null;

//   return (
//     <Button
//       size="sm"
//       disabled={signup.isPending}
//       onClick={async () => {
//         try {
//           await signup.mutateAsync({
//             username: 'marc',
//             password: 'password',
//           });
//         } catch (e: any) {
//           alert(`Error: ${e.message}`);
//         }
//       }}
//     >
//       Signup
//     </Button>
//   );
// };

const LoginButton = () => {
  const { data, isLoading } = ctx.trpc.auth.me.useQuery();
  const login = ctx.trpc.auth.login.useMutation();

  if (data || isLoading) return null;

  return (
    <Button
      size="sm"
      disabled={login.isPending}
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
    </Button>
  );
};

const LogoutButton = () => {
  const { data } = ctx.trpc.auth.me.useQuery();
  const logout = ctx.trpc.auth.logout.useMutation();

  if (!data) {
    return null;
  }

  return (
    <Button
      size="sm"
      disabled={logout.isPending}
      variant="secondary"
      onClick={async () => {
        try {
          await logout.mutateAsync();
        } catch (e: any) {
          alert(`Error: ${e.message}`);
        }
      }}
    >
      Hi {data.username} - Logout
    </Button>
  );
};
