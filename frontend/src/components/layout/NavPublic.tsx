/**
 * NavPublic.tsx
 * Grunge/alt navigation for the public + gallery side.
 */
import { Link, NavLink } from "react-router-dom";

export default function NavPublic() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm uppercase tracking-widest ${
      isActive ? "text-white" : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-widest text-glitch">
          PORTFOLIO // ARCHIVE
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/gallery" className={linkCls}>
            Gallery
          </NavLink>
          <NavLink to="/media" className={linkCls}>
            Media
          </NavLink>
          <NavLink to="/contact" className={linkCls}>
            Contact
          </NavLink>

          {/* ✅ Use /professional (router alias exists; Shell treats it as pro now) */}
          <NavLink to="/professional" className={linkCls}>
            Professional
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
