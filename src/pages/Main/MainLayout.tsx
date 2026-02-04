import { NavLink, Outlet } from 'react-router';
import MainMenu from './MainMenu';
import Title from '../../components/Title';

function MainLayout() {
  return (
    <main className="min-w-screen min-h-screen fixed inset-0 py-6 px-12 flex flex-col gap-4">
      <header className="flex items-center gap-4">
        <button className="btn btn-link h-fit p-0">
          <NavLink to="/main">
            <img src="/sd.png" alt="메인화면 페어 SD 이미지" className="w-48" />
          </NavLink>
        </button>
        <Title />
      </header>
      <section className="flex gap-4 grow">
        <MainMenu />
        <div className="bg-background/60 w-1/2 backdrop-blur-lg rounded-2xl p-4">
          <Outlet />
        </div>
      </section>
      <img
        src="/ld.png"
        alt="메인화면 배경 페어 LD 이미지"
        className="fixed top-0 right-0 h-screen -z-[1] mask-l-from-30% pointer-events-none"
      />
    </main>
  );
}

export default MainLayout;
