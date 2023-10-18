import React from 'react';

import { PlayerContext } from '../routes/Layout.tsx';

type RecordProps = {
  albumId: string;
  title: string;
  imageUrl: string;
};

export default function Record({ albumId, title, imageUrl }: RecordProps) {
  const { isPlaying, currentTrack } = React.useContext(PlayerContext);
  const isPlayingCurrentRecord = isPlaying && currentTrack?.albumId === albumId;
  const animationClass = isPlayingCurrentRecord ? 'vinyl-animation-in-spinning' : 'vinyl-animation-in';

  return (
    <div className="relative shadow-xl mr-32 w-72 md:w-auto c-record">
      <img
        src={imageUrl}
        alt={title}
        width="400"
        height="400"
        className="block rounded-md tag-album-cover relative z-10 bg-white c-record--album"
      />
      <img
        src="/react-router-records/vinyl-lp.webp"
        width="400"
        height="400"
        className={`absolute top-0 opacity-0 vinyl-image c-record--vinyl ${animationClass}`}
      />
    </div>
  );
}
