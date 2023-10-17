import { useEffect, useState } from 'react';
import type { Params } from 'react-router-dom';
import { useTypedParams } from 'react-router-typesafe-routes/dom';

import { ctx, type RouterInputs, type RouterOutputs } from '~app';
import { ActionBar } from '~client/components/article-action-bar.tsx';
import { QueryBoundary } from '~client/components/query-boundary.tsx';
import { Button } from '~client/components/ui/button.tsx';
import { Input } from '~client/components/ui/input.tsx';
import { Textarea } from '~client/components/ui/textarea.tsx';
import { useToast } from '~client/components/ui/use-toast.ts';
import { paths } from '~client/routes.tsx';

export async function loader({ params: { articleId } }: { params: Params<'articleId'> }) {
  void ctx.trpc.articles.byId.prefetchQuery({ id: articleId! }, { meta: { deferStream: true } });

  return null;
}

export function Component() {
  const { articleId } = useTypedParams(paths.Article.Edit);

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
  ctx.useSeoMeta({ title: `Edit ${article.title}` });

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

  const mut = ctx.trpc.articles.update.useMutation();

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
