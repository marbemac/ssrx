import { useParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { Routes } from 'remix-routes';

import { ActionBar } from '~/components/article-action-bar.tsx';
import { QueryBoundary } from '~/components/query-boundary.tsx';
import { Button } from '~/components/ui/button.tsx';
import { Input } from '~/components/ui/input.tsx';
import { Textarea } from '~/components/ui/textarea.tsx';
import { useToast } from '~/components/ui/use-toast.ts';
import { ctx, type RouterInputs, type RouterOutputs } from '~app';

export default function Component() {
  const { articleId } = useParams<Routes['/articles/:articleId']['params']>();

  return (
    <QueryBoundary
      loadingFallback={<div className="text-muted-foreground">Loading article (with simulated latency)...</div>}
      query={() => ctx.trpc.articles.byId.useQuery({ id: articleId! })}
    >
      {data => <Article article={data} />}
    </QueryBoundary>
  );
}

const Article = ({ article }: { article: RouterOutputs['articles']['byId'] }) => {
  // ctx.useSeoMeta({ title: `Edit ${article.title}` });

  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);

  useEffect(() => {
    setTitle(article.title);
  }, [article.title]);

  useEffect(() => {
    setBody(article.body);
  }, [article.body]);

  return (
    <div className="flex flex-col gap-6">
      <ActionBar
        leadingActions={<SaveButton id={article.id} getUpdates={() => ({ title, body })} />}
        article={article}
        mode="editing"
      />

      <div className="flex flex-col gap-6">
        <Input
          type="text"
          className="text-3xl font-bold h-16 px-4"
          placeholder="Article title..."
          value={title}
          onChange={e => setTitle((e.target as any).value)}
        />

        <Textarea
          className="min-h-[300px]"
          placeholder="Article content..."
          value={body}
          onChange={e => setBody((e.target as any).value)}
        />
      </div>
    </div>
  );
};

const SaveButton = ({
  id,
  getUpdates,
}: {
  id: string;
  getUpdates: () => RouterInputs['articles']['update']['set'];
}) => {
  const { toast } = useToast();

  const mut = ctx.trpc.articles.update.useMutation({
    onSuccess: () => Promise.all([ctx.trpc.articles.list.invalidate(), ctx.trpc.articles.$invalidate({ id })]),
  });

  return (
    <Button
      size="xs"
      disabled={mut.isPending}
      onClick={async () => {
        try {
          await mut.mutateAsync({
            lookup: { id },
            set: getUpdates(),
          });

          toast({
            description: 'Article saved',
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
      Save
    </Button>
  );
};
