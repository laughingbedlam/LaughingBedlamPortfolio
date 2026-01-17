/**
 * NavPro.tsx
 * Cleaner professional nav for writing side.
 * Requirement: minimal; writing library is the default.
 */
import { Link, NavLink, useLocation } from "react-router-dom";

export default function NavPro() {
  const location = useLocation();

  // If user is on /professional/* keep them there; otherwise stay on /pro/*
  const writingRoot = location.pathname.startsWith("/professional") ? "/professional" : "/pro/writing";

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm tracking-wide ${
      isActive ? "text-white" : "text-white/75 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070a]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={writingRoot} className="text-base font-semibold tracking-wider">
          Laughing Bedlam — Writing
        </Link>

        <nav className="flex items-center gap-1">
          {/* Default professional view */}
          <NavLink to={writingRoot} className={linkCls} end>
            Writing Library
          </NavLink>

          <NavLink to="/media" className={linkCls}>
            Media
          </NavLink>
          <NavLink to="/contact" className={linkCls}>
            Contact
          </NavLink>
          <NavLink to="/gallery" className={linkCls}>
            Gallery
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
