import { Link, Outlet, useParams } from 'react-router-dom';

import { ctx, type RouterOutputs } from '~/app.tsx';
import { QueryBoundary } from '~/components/query-boundary.tsx';
import { paths } from '~/routes.tsx';
import { cn } from '~/utils.ts';

export async function loader() {
  void ctx.trpc.articles.list.prefetchQuery();

  return null;
}

export function Component() {
  ctx.useSeoMeta({ title: 'Articles' });

  return (
    <div className="flex divide-x flex-1">
      <div className="flex-1">
        <QueryBoundary
          query={() => ctx.trpc.articles.list.useSuspenseQuery()}
          loadingFallback={
            <div className="p-10 text-muted-foreground">Loading articles (with simulated latency)...</div>
          }
        >
          {data => <ArticleList articles={data} />}
        </QueryBoundary>
      </div>

      <div className="flex-1 p-10">
        <Outlet />
      </div>
    </div>
  );
}

const ArticleList = ({ articles }: { articles: RouterOutputs['articles']['list'] }) => {
  const { articleId: activeArticleId } = useParams<{ articleId?: string }>();

  if (!articles.length) {
    return (
      <div className="p-10 text-muted-foreground">No articles found. Click "Add article" to create a new one.</div>
    );
  }

  return (
    <div className="divide-y">
      {articles.map(article => (
        <ArticleListItem key={article.id} article={article} isActive={article.id === activeArticleId} />
      ))}
    </div>
  );
};

const ArticleListItem = ({
  article,
  isActive,
}: {
  article: RouterOutputs['articles']['list'][0];
  isActive?: boolean;
}) => {
  return (
    <Link
      to={isActive ? paths.Articles.buildPath({}) : paths.Article.buildPath({ articleId: article.id })}
      className={cn('flex items-center py-4 px-6', isActive && 'bg-muted', !isActive && 'hover:bg-subtle')}
    >
      <div className="flex-1 font-medium">{article.title}</div>

      {article.status === 'draft' ? (
        <div className="rounded border px-1 py-0.5 text-xs uppercase text-muted-foreground">draft</div>
      ) : null}
    </Link>
  );
};
