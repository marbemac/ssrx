import React from 'react';

import { PlayerContext, type Track } from '../routes/Layout.tsx';
import { CirclePauseIcon, CirclePlayIcon } from './icons.tsx';

type TrackListProps = {
  tracks: Track[];
  albumId: string;
  artist: string;
  imageUrl: string;
};

export default function TrackList({ tracks, albumId, artist, imageUrl }: TrackListProps) {
  const { isPlaying, setIsPlaying, currentTrack, setCurrentTrack } = React.useContext(PlayerContext);

  return (
    <ul className="text-xl">
      {tracks.map(track => {
        const isCurrentTrack = track.id == currentTrack?.id;

        return (
          <li
            key={track.id}
            className="hover:bg-gray-50 cursor-pointer px-6 py-4 flex border-b first:border-t items-center"
            onClick={() => {
              setCurrentTrack({
                ...track,
                albumId,
                artist,
                imageUrl,
              });
              setIsPlaying(true);
            }}
          >
            <span className="text-gray-500 w-8 mr-2">
              {isCurrentTrack && !isPlaying ? (
                <CirclePlayIcon />
              ) : isCurrentTrack && isPlaying ? (
                <CirclePauseIcon />
              ) : (
                track.position
              )}
            </span>
            <span className="font-medium">{track.title}</span>
            <span className="text-gray-500 ml-auto">{track.length}</span>
          </li>
        );
      })}
    </ul>
  );
}
