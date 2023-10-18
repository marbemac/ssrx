import { NavLink } from 'react-router-dom';

type CardProps = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
};

export function Card({ id, name, artist, imageUrl }: CardProps) {
  return (
    <div className="flex flex-col c-card">
      <NavLink to={`/album/${id}`} className="text-black hover:text-pink-500" unstable_viewTransition>
        <div className="shadow-md hover:shadow-lg relative">
          <img
            className="card-image rounded-md relative z-10 c-card--album"
            src={imageUrl}
            alt={name}
            width="400"
            height="400"
          />
          <img
            src="/react-router-records/vinyl-lp.webp"
            width="400"
            height="400"
            className="absolute top-0 opacity-0 vinyl-image c-card--vinyl"
          />
        </div>
        <p className="pt-4 font-semibold">{name}</p>
        <p className="pt-1 text-gray-700">{artist}</p>
      </NavLink>
    </div>
  );
}
