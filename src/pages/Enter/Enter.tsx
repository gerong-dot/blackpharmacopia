import { NavLink } from 'react-router';

function Enter() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-6">
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
      <img
        src="/enter_bg.png"
        alt="입장 화면 배경"
        className="fixed inset-0 w-screen h-screen -z-[1] opacity-60 pointer-events-none"
      />
    </main>
  );
}

export default Enter;
