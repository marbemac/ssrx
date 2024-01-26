import { Link, useNavigate } from 'react-router-dom';

import type { RouterOutputs } from '~/app.tsx';
import { ctx } from '~/app.tsx';
import { Button } from '~/components/ui/button.tsx';
import { useToast } from '~/components/ui/use-toast.ts';
import { paths } from '~/routes.tsx';

export const ActionBar = ({
  article,
  mode,
  leadingActions,
  trailingActions,
}: {
  article: RouterOutputs['articles']['byId'];
  mode: 'viewing' | 'editing';
  leadingActions?: React.ReactNode;
  trailingActions?: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { data } = ctx.trpc.auth.me.useQuery();
  if (!data) return null;

  return (
    <div className="flex gap-2">
      {leadingActions}

      <ToggleStatusButton article={article} />

      {mode === 'editing' ? <DiscardButton id={article.id} /> : null}
      {mode === 'viewing' ? <EditButton /> : null}

      <DeleteButton
        article={article}
        onSuccess={() => {
          navigate(paths.Articles.buildPath({}));
        }}
      />

      {trailingActions}
    </div>
  );
};

const ToggleStatusButton = ({ article }: { article: Pick<RouterOutputs['articles']['byId'], 'id' | 'status'> }) => {
  const { toast } = useToast();

  const mut = ctx.trpc.articles.update.useMutation({
    onSuccess: () => ctx.trpc.articles.$invalidate(),
  });

  return (
    <Button
      size="xs"
      disabled={mut.isPending}
      onClick={async () => {
        try {
          await mut.mutateAsync({
            lookup: { id: article.id },
            set: {
              status: article.status === 'draft' ? 'published' : 'draft',
            },
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
      {article.status === 'draft' ? 'Publish' : 'Unpublish'}
    </Button>
  );
};

const DiscardButton = ({ id }: { id: string }) => {
  return (
    <Button size="xs">
      <Link to={paths.Article.buildPath({ articleId: id })}>Stop Editing</Link>
    </Button>
  );
};

const EditButton = () => {
  return (
    <Button size="xs">
      <Link to="edit">Edit</Link>
    </Button>
  );
};

const DeleteButton = ({
  article,
  onSuccess,
}: {
  article: Pick<RouterOutputs['articles']['byId'], 'id'>;
  onSuccess?: () => void;
}) => {
  const { toast } = useToast();

  const mut = ctx.trpc.articles.delete.useMutation({
    onSuccess: async () => {
      if (onSuccess) onSuccess();
      await ctx.trpc.articles.$invalidate();
      toast({ description: 'Article deleted' });
    },
  });

  return (
    <Button
      size="xs"
      disabled={mut.isPending}
      variant="destructive"
      onClick={async () => {
        try {
          const c = confirm('Are you sure?');
          if (!c) return;

          await mut.mutateAsync({ id: article.id });
        } catch (e: any) {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        }
      }}
    >
      Delete
    </Button>
  );
};
