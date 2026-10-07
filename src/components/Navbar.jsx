import { useState, useEffect, useRef } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setSignupOpen(false);
      }
    };

    if (menuOpen || signupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, signupOpen]);

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

          <a href="#home">Home</a>

          <a href="#about">About</a>

          <a href="#courses">Courses</a>

          <a href="#contact">Contact</a>

          {/* Sign Up Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSignupOpen(!signupOpen)}
              className="rounded-lg bg-[#12355B] px-5 py-2.5 font-semibold text-white transition hover:bg-[#00A6A6]"
            >
              Sign Up
            </button>

            {signupOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

                <a
                  href="/signup"
                  className="block rounded-lg px-4 py-3 transition hover:bg-slate-100"
                  onClick={() => setSignupOpen(false)}
                >
                  <div className="font-semibold text-[#12355B]">
                    Student Sign Up
                  </div>
                  <div className="text-sm text-slate-500">
                    Register as a student
                  </div>
                </a>

                <a
                  href="/teacher-signup"
                  className="block rounded-lg px-4 py-3 transition hover:bg-slate-100"
                  onClick={() => setSignupOpen(false)}
                >
                  <div className="font-semibold text-[#12355B]">
                    Teacher Sign Up
                  </div>
                  <div className="text-sm text-slate-500">
                    Apply as a teacher
                  </div>
                </a>

              </div>
            )}
          </div>
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

            {/* Mobile Sign Up */}
            <button
              onClick={() => setSignupOpen(!signupOpen)}
              className="rounded-lg bg-[#12355B] px-5 py-2.5 text-center font-semibold text-white transition hover:bg-[#00A6A6]"
            >
              Sign Up
            </button>

            {signupOpen && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">

                <a
                  href="/signup"
                  onClick={() => {
                    setSignupOpen(false);
                    setMenuOpen(false);
                  }}
                  className="rounded-lg bg-white px-4 py-3 transition hover:bg-slate-100"
                >
                  <div className="font-semibold text-[#12355B]">
                    Student Sign Up
                  </div>
                  <div className="text-sm text-slate-500">
                    Register as a student
                  </div>
                </a>

                <a
                  href="/teacher-signup"
                  onClick={() => {
                    setSignupOpen(false);
                    setMenuOpen(false);
                  }}
                  className="rounded-lg bg-white px-4 py-3 transition hover:bg-slate-100"
                >
                  <div className="font-semibold text-[#12355B]">
                    Teacher Sign Up
                  </div>
                  <div className="text-sm text-slate-500">
                    Apply as a teacher
                  </div>
                </a>

              </div>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;