import * as React from 'react';
import { Outlet } from 'react-router-dom';

import Footer from '../components/Footer.tsx';
import Header from '../components/Header.tsx';
import Player from '../components/Player.tsx';

export type Track = {
  id: string;
  title: string;
  position: number;
  length: string;
};

export type PlayerTrack = Track & {
  albumId: string;
  artist: string;
  imageUrl: string;
};

export const PlayerContext = React.createContext<{
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  currentTrack: PlayerTrack | null;
  setCurrentTrack: (v: PlayerTrack) => void;
}>({
  isPlaying: false,
  setIsPlaying: () => {},
  currentTrack: null,
  setCurrentTrack: () => {},
});

export default function Layout() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTrack, setCurrentTrack] = React.useState<PlayerTrack | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentTrack,
        setCurrentTrack,
      }}
    >
      <Header />
      <Outlet />
      <Footer />
      <div id="audio-player">
        <Player />
      </div>
    </PlayerContext.Provider>
  );
}
