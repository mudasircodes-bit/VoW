import { useState, useEffect, useRef } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  if (menuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [menuOpen]);
  return (
    <nav
  ref={menuRef}
  className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white"
>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}log.jpg`}
            alt="The Voice of Wisdom Logo"
            className="h-11 w-11 rounded-lg object-contain"
          />

          <div>
            <h1 className="text-lg font-bold text-[#12355B]">
              The Voice of Wisdom
            </h1>

            <p className="text-xs text-slate-500">
              School & English Language Center
            </p>
          </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">

         <a href="#home" onClick={() => setMenuOpen(false)}>
  Home
</a>

<a href="#about" onClick={() => setMenuOpen(false)}>
  About
</a>

<a href="#courses" onClick={() => setMenuOpen(false)}>
  Courses
</a>

<a href="#contact" onClick={() => setMenuOpen(false)}>
  Contact
</a>
          {/* Sign Up */}
          <a
            href="/signup"
            className="rounded-lg bg-[#12355B] px-5 py-2.5 font-semibold text-white transition hover:bg-[#00A6A6]"
          >
            Sign Up
          </a>

        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-[#12355B] md:hidden"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">

            <a href="#home">Home</a>

            <a href="#about">About</a>

            <a href="#courses">Courses</a>

            <a href="#contact">Contact</a>

            {/* Sign Up */}
            <a
              href="/signup"
              className="rounded-lg bg-[#12355B] px-5 py-2.5 text-center font-semibold text-white transition hover:bg-[#00A6A6]"
            >
              Sign Up
            </a>

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;