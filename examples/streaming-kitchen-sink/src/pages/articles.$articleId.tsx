import type { Params } from 'react-router-dom';
import { useTypedParams } from 'react-router-typesafe-routes/dom';

import type { RouterOutputs } from '~/app.tsx';
import { ctx } from '~/app.tsx';
import { ActionBar } from '~/components/article-action-bar.tsx';
import { QueryBoundary } from '~/components/query-boundary.tsx';
import { paths } from '~/routes.tsx';

export async function loader({ params: { articleId } }: { params: Params<'articleId'> }) {
  void ctx.trpc.articles.byId.prefetchQuery({ id: articleId! }, { meta: { deferStream: true } });

  return null;
}

export function Component() {
  const { articleId } = useTypedParams(paths.Article);

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
  ctx.useSeoMeta({ title: article.title });

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
