function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-screen items-center bg-slate-50 pt-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">

        {/* Text */}
        <div>
          <p className="mb-4 font-semibold uppercase tracking-wider text-[#00A6A6]">
            Learn • Grow • Succeed
          </p>

          <h1 className="text-4xl font-bold leading-tight text-[#12355B] sm:text-5xl lg:text-5xl">
            The Voice Of Wisdom
          </h1>

          <h2 className="mt-4 text-2xl font-semibold text-slate-700 sm:text-3xl">
            School & English Language Center
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 text-justify">
  Building knowledge, confidence, and communication skills through quality
  education and effective English learning creates a strong foundation for
  lifelong success. By fostering critical thinking and mastering clear
  expression, students gain the poise to connect with the world and pursue
  global opportunities. Quality instruction sharpens academic potential while
  nurturing the passion and self-belief needed to overcome limits. Ultimately,
  fluent English and empowering education serve as a gateway to personal
  growth, inspiring future leaders to dream big and shape a brighter tomorrow.
</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="rounded-lg bg-[#12355B] px-6 py-3 font-semibold text-white transition hover:bg-[#5edada]"
            >
              Apply Now
            </a>

            <a
              href="#courses"
              className="rounded-lg border-2 border-[#12355B] px-6 py-3 font-semibold text-[#12355B] transition hover:bg-[#12355B] hover:text-white"
            >
              Explore Courses
            </a>
          </div>
        </div>

       {/* Hero Visual */}
<div className="flex justify-center lg:justify-end">
  <div className="w-full max-w-lg overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
    <img
      src="/pic.jpg"
      alt="The Voice of Wisdom"
      className="h=full w-full bg-white object-contain transition-transform duration-500 hover:scale-105"
    />
  </div>
</div>

      </div>
    </section>
  );
}

export default Hero;