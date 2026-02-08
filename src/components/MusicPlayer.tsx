import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import type { IManagePageListProperties } from '../../dto/notion';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  Loader2Icon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from 'lucide-react';

function MusicPlayer() {
  const [playing, setPlaying] = useState(true);
  const playerRef = useRef<HTMLVideoElement>(null);
  const { data, isLoading, isError, error } =
    useQuery<IManagePageListProperties>({
      queryKey: ['url'],
      queryFn: () => ky.get('/api/main?query=playlist').json(),
    });

  if (isLoading && !data) <Loader2Icon className="animate-spin" />;
  if (!data || isError)
    return <h1 className="text-sm font-bold">{error?.message}</h1>;

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          src={data?.properties.이름.title[0].plain_text}
          playing={playing}
          volume={0.4}
          loop
        />
      </div>
      <div className="flex gap-2 items-center">
        <button>
          <SkipBackIcon size={14} />
        </button>
        <button onClick={() => setPlaying(!playing)}>
          {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>
        <SkipForwardIcon size={14} />
      </div>
    </div>
  );
}

export default MusicPlayer;
