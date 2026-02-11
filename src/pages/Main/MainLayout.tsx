import { NavLink, Outlet } from 'react-router';
import MainMenu from './MainMenu';
import Title from '../../components/Title';
import MusicPlayer from '../../components/MusicPlayer';

function MainLayout() {
  return (
    <main className="min-w-screen min-h-screen fixed inset-0 py-6 px-4 lg:px-12 flex flex-col gap-4">
      <header className="flex flex-col lg:flex-row items-center gap-4">
        <button className="btn btn-link h-fit p-0">
          <NavLink to="/main">
            <img
              src="/sd.png"
              alt="메인화면 페어 SD 이미지"
              className="w-24 lg:w-48"
            />
          </NavLink>
        </button>
        <Title />
      </header>
      <section className="flex flex-col lg:flex-row gap-4 grow min-h-0">
        <div className="flex flex-col items-center">
          <MainMenu />
          <MusicPlayer />
        </div>
        <div className="bg-background/60 w-full lg:w-1/2 backdrop-blur-lg rounded-2xl p-2 lg:p-4 overflow-y-auto">
          <Outlet />
        </div>
      </section>
      <img
        src="/ld.png"
        alt="메인화면 배경 페어 LD 이미지"
        className="fixed top-0 right-0 object-cover h-screen -z-[1] lg:mask-l-from-30% opacity-60 lg:opacity-100 pointer-events-none"
      />
    </main>
  );
}

export default MainLayout;
