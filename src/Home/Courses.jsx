function Courses() {
  return (
    <section id="courses" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
            Our Courses
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#12355B] sm:text-4xl">
            Learn, Grow & Succeed
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            We offer quality educational and English language programs
            designed to improve knowledge, communication skills, confidence,
            and academic performance.
          </p>
        </div>

        {/* Course Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* English Language */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12355B] text-3xl text-white">
              📚
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#12355B]">
              English Language
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Improve your English through practical learning focused on
              grammar, vocabulary, speaking, listening, reading, and writing.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* Speaking */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12355B] text-3xl text-white">
              🗣️
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#12355B]">
              Speaking
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Build confidence in speaking English through conversations,
              presentations, discussions, and everyday communication practice.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* Grammar & Writing */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12355B] text-3xl text-white">
              ✍️
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#12355B]">
              Grammar & Writing
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Strengthen grammar, sentence structure, vocabulary, paragraph
              writing, essays, and effective written communication.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* School Education */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12355B] text-3xl text-white">
              🎓
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#12355B]">
              School Education
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              We provide quality school education in a disciplined and
              supportive environment, helping students build strong academic
              foundations and develop a positive attitude toward learning.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* Student Development */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12355B] text-3xl text-white">
              🌱
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#12355B]">
              Student Development
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              We focus on the complete development of students by building
              confidence, discipline, critical thinking, creativity, leadership,
              and responsible behavior alongside academic learning.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
              >
                Learn More →
              </a>
            </div>
          </div>

          {/* Co-Curricular Activities */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12355B] text-3xl text-white">
              🏆
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#12355B]">
              Co-Curricular Activities
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Students take part in debates, public speaking, presentations,
              educational activities, and teamwork that help them discover
              their abilities and develop confidence beyond the classroom.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="font-semibold text-[#00A6A6] transition hover:text-[#12355B]"
              >
                Learn More →
              </a>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-3xl bg-[#12355B] px-6 py-12 text-center shadow-lg">
          <h3 className="text-3xl font-bold text-white">
            Ready to Start Learning?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-200">
            Take the next step toward better communication, stronger
            confidence, and a brighter educational future.
          </p>

          <a
            href="#contact"
            className="mt-7 inline-block rounded-lg bg-[#00A6A6] px-7 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#12355B] hover:shadow-lg"
          >
            Contact Us
          </a>
        </div>

      </div>
    </section>
  );
}

export default Courses;