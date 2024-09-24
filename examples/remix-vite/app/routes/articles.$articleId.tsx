import { useParams } from '@remix-run/react';
import type { Routes } from 'remix-routes';

import { ActionBar } from '~/components/article-action-bar.tsx';
import { QueryBoundary } from '~/components/query-boundary.tsx';
import { ctx, type RouterOutputs } from '~app';

export default function ArticlePage() {
  const { articleId } = useParams<Routes['/articles/:articleId']['params']>();

  return (
    <div>
      <QueryBoundary
        loadingFallback={<div className="text-muted-foreground">Loading article (with simulated latency)...</div>}
        query={() => ctx.trpc.articles.byId.useSuspenseQuery({ id: articleId! })}
      >
        {data => <Article article={data} />}
      </QueryBoundary>
    </div>
  );
}

const Article = ({ article }: { article: RouterOutputs['articles']['byId'] }) => {
  // ctx.useSeoMeta({ title: article.title });

  return (
    <div className="flex flex-col gap-6">
      <ActionBar article={article} mode="viewing" />

      <div className="flex flex-col gap-10">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <div className="">{article.body}</div>
      </div>
    </div>
  );
};
