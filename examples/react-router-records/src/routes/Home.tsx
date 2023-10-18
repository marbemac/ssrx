import { useLoaderData } from 'react-router-dom';

import { Card } from '../components/Card.tsx';

export async function loader() {
  // TODO: Fix synchronous navigations
  await new Promise(r => setTimeout(r, 1));
  const { default: albums } = await import('../data/albums.json');
  return albums;
}

export function Component() {
  const albums = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <section className="py-8">
      <div className="container mx-auto max-w-screen-lg px-6 lg:px-0 flex items-center flex-wrap pt-4 pb-12">
        <h2 className="font-bold text-3xl text-black tracking-tight mb-12">Recently Played</h2>

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {albums.map(album => (
            <Card key={album.id} id={album.id} name={album.name} artist={album.artist} imageUrl={album.img} />
          ))}
        </div>
      </div>
    </section>
  );
}
