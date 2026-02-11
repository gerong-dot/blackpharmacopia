import { useQueries } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import {
  getAbout,
  getBoardAll,
  getGalleryAll,
  getGuestBookAll,
  getMain,
  getMusicUrl,
} from '../../services/api';

function LoadingBar({ value }: { value: number }) {
  return (
    <progress className="progress w-2/3 lg:w-2xl" value={value} max={100} />
  );
}

function Enter() {
  const results = useQueries({
    queries: [
      { queryKey: ['main'], queryFn: getMain },
      { queryKey: ['about'], queryFn: getAbout },
      { queryKey: ['url'], queryFn: getMusicUrl },
      { queryKey: ['posts'], queryFn: getBoardAll },
      { queryKey: ['galleries'], queryFn: getGalleryAll },
      { queryKey: ['guestbook'], queryFn: getGuestBookAll },
    ],
  });

  const isLoading = results.some((result) => result.isLoading);
  const percentage = results.filter((r) => r.isSuccess).length / 7;

  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-6">
      {isLoading ? (
        <>
          <h1 className="text-center font-beau-rivage text-5xl">Loading...</h1>
          <LoadingBar value={percentage * 100} />
        </>
      ) : (
        <div className="grid place-items-center">
          <img src="/sd.png" alt="입장 화면 페어 SD 캐릭터" />
          <button className="btn btn-ghost px-2 py-6">
            <NavLink
              to="/main"
              className="font-hepta-slab text-5xl tracking-widest"
              end
            >
              ENTER
            </NavLink>
          </button>
        </div>
      )}
      <img
        src="/enter_bg.png"
        alt="입장 화면 배경"
        className="fixed inset-0 object-cover w-screen h-screen -z-[1] opacity-60 pointer-events-none"
      />
    </main>
  );
}

export default Enter;
