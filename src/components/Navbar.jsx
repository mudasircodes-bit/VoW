import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white">
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

          <a
            href="#home"
            className="relative font-medium text-slate-700 transition-colors duration-300 hover:text-[#00A6A6] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A6A6] after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </a>

          <a
            href="#about"
            className="relative font-medium text-slate-700 transition-colors duration-300 hover:text-[#00A6A6] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A6A6] after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </a>

          <a
            href="#courses"
            className="relative font-medium text-slate-700 transition-colors duration-300 hover:text-[#00A6A6] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A6A6] after:transition-all after:duration-300 hover:after:w-full"
          >
            Courses
          </a>

          <a
            href="#contact"
            className="relative font-medium text-slate-700 transition-colors duration-300 hover:text-[#00A6A6] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A6A6] after:transition-all after:duration-300 hover:after:w-full"
          >
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