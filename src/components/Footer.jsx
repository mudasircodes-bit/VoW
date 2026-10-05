function Footer() {
  return (
    <footer className="border-t border-[#DDE7EA] bg-[#12355B] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">

          {/* School Info */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}log.jpg`}
                alt="The Voice of Wisdom Logo"
                className="h-12 w-12 rounded-lg bg-white object-contain"
              />

              <div>
                <h2 className="text-lg font-bold">
                  The Voice of Wisdom
                </h2>
                <p className="text-sm text-slate-300">
                  School & English Language Center
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-300">
              Building knowledge, confidence, and communication skills
              through quality education and effective English learning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <a
                href="#home"
                className="transition hover:text-[#00A6A6]"
              >
                Home
              </a>

              <a
                href="#about"
                className="transition hover:text-[#00A6A6]"
              >
                About
              </a>

              <a
                href="#courses"
                className="transition hover:text-[#00A6A6]"
              >
                Courses
              </a>

              <a
                href="#contact"
                className="transition hover:text-[#00A6A6]"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Student Portal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Student Portal
            </h3>

            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <a
                href="/login"
                className="transition hover:text-[#00A6A6]"
              >
                Student Login
              </a>

              <a
                href="/signup"
                className="transition hover:text-[#00A6A6]"
              >
                Student Sign Up
              </a>

              <a
                href="/student-dashboard"
                className="transition hover:text-[#00A6A6]"
              >
                Student Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/20 pt-6 text-center">
          <p className="text-sm text-slate-300">
            © {new Date().getFullYear()} The Voice of Wisdom School and
            The English Language Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;