function AboutSection() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
            About Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#12355B] sm:text-4xl">
             The Voice of Wisdom
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            The Voice of Wisdom School and The English Language Center is
            committed to providing quality education in a supportive,
            disciplined, and inspiring environment where students can learn,
            grow, and become confident individuals.
          </p>
        </div>


        {/* Leadership */}
        <div className="mt-20">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Our Leadership
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#12355B]">
              Meet Our Leadership
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our leadership team works together to maintain high educational
              standards and create a positive learning environment for every
              student.
            </p>
          </div>


          {/* Leadership Cards */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">

            {/* Director */}
            <div className="overflow-hidden rounded-2xl border border-[#DDE7EA] bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">
              <div className="h-72 overflow-hidden bg-slate-100">
                <img
                  src="/Driector.jpg"
                  alt="Director"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6 text-center">
                <h4 className="text-xl font-bold text-[#12355B]">
                  Iqbal Tareen
                </h4>

                <p className="mt-1 font-semibold text-[#00A6A6]">
                  Director
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  Providing leadership and guidance with a strong commitment
                  to quality education, student development, and the future
                  success of the institution.
                </p>
              </div>
            </div>


            {/* Deputy Director */}
            <div className="overflow-hidden rounded-2xl border border-[#DDE7EA] bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">
              <div className="h-72 overflow-hidden bg-slate-100">
                <img
                  src="/Duty Driector.jpg"
                  alt="Deputy Director"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6 text-center">
                <h4 className="text-xl font-bold text-[#12355B]">
                  Raiz Durrani
                </h4>

                <p className="mt-1 font-semibold text-[#00A6A6]">
                  Deputy Director
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  Supporting the institution through effective management,
                  coordination, and a strong focus on maintaining a productive
                  and respectful academic environment.
                </p>
              </div>
            </div>


            {/* Assistant Director */}
            <div className="overflow-hidden rounded-2xl border border-[#DDE7EA] bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">
              <div className="h-72 overflow-hidden bg-slate-100">
                <img
                  src="/Assisstant Driector.jpg"
                  alt="Assistant Director"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6 text-center">
                <h4 className="text-xl font-bold text-[#12355B]">
                  Zia Tareen
                </h4>

                <p className="mt-1 font-semibold text-[#00A6A6]">
                  Assistant Director
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  Helping manage academic and institutional activities while
                  supporting students, teachers, and staff in achieving
                  educational excellence.
                </p>
              </div>
            </div>

          </div>
        </div>


        {/* Faculty & Administration */}
        <div className="mt-24 grid gap-12 lg:grid-cols-2">

          {/* Faculty */}
          <div className="rounded-3xl border border-transparent bg-slate-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl lg:p-10">
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Our Faculty
            </p>

            <h3 className="mt-3 text-2xl font-bold text-[#12355B] sm:text-3xl">
              Experienced & Dedicated Teachers
            </h3>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Our faculty consists of experienced, dedicated, and supportive
              teachers who understand the needs of students and encourage them
              to learn with confidence. Our teachers focus not only on academic
              performance but also on communication, discipline, critical
              thinking, and personal development.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Through interactive teaching, classroom participation, and
              individual guidance, students are encouraged to ask questions,
              express their ideas, and become active learners.
            </p>
          </div>


          {/* Administration */}
          <div className="rounded-3xl border border-transparent bg-[#12355B] p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl lg:p-10">
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Administration
            </p>

            <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Professional & Supportive Administration
            </h3>

            <p className="mt-5 text-lg leading-8 text-slate-200">
              Our administration team works to ensure smooth academic and
              organizational operations. The Admin Officer supports students,
              parents, teachers, and visitors while helping maintain an
              organized and welcoming environment.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-200">
              We believe that strong administration and effective
              communication play an important role in creating a successful
              educational institution.
            </p>
          </div>

        </div>


        {/* Learning Environment */}
        <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">

          {/* Text - Left */}
          <div>
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Learning Environment
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#12355B] sm:text-4xl">
              Great Classrooms, Better Learning
            </h3>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              We aim to provide clean, comfortable, and engaging classrooms
              where students can concentrate on their studies, participate
              confidently, and enjoy the learning process.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              A positive classroom environment helps students stay focused,
              interact with their teachers, ask questions, and take an active
              part in their education.
            </p>
          </div>


          {/* Picture - Right */}
          <div className="overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <img
              src="/acticities.jpg"
              alt="The Voice of Wisdom Classroom"
              className="h-80 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-96"
            />
          </div>

        </div>


        {/* Student Activities */}
        <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">

          {/* Picture - Left */}
          <div className="overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <img
              src="/class roon.jpg"
              alt="Student Activities at The Voice of Wisdom"
              className="h-80 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-96"
            />
          </div>


          {/* Text - Right */}
          <div>
            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Student Activities
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#12355B] sm:text-4xl">
              Learning Beyond the Classroom
            </h3>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Education is not limited to books and classrooms. We encourage
              students to participate in activities that build confidence,
              courage, communication skills, leadership, and teamwork.
            </p>
          </div>

        </div>


        {/* Activities */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {/* Parliamentary Debates */}
          <div className="rounded-2xl border border-[#DDE7EA] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#12355B] text-2xl text-white transition-colors duration-300 group-hover:bg-[#00A6A6]">
              🎤
            </div>

            <h4 className="mt-5 text-xl font-bold text-[#12355B]">
              Parliamentary Debates
            </h4>

            <p className="mt-3 leading-7 text-slate-600">
              Students develop confidence, reasoning, speaking, and
              argument-building skills.
            </p>
          </div>


          {/* Public Speaking */}
          <div className="rounded-2xl border border-[#DDE7EA] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#12355B] text-2xl text-white">
              🗣️
            </div>

            <h4 className="mt-5 text-xl font-bold text-[#12355B]">
              Public Speaking
            </h4>

            <p className="mt-3 leading-7 text-slate-600">
              Students get opportunities to speak before others and express
              their thoughts with confidence.
            </p>
          </div>


          {/* Shows & Presentations */}
          <div className="rounded-2xl border border-[#DDE7EA] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A6A6] hover:shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#12355B] text-2xl text-white">
              🎭
            </div>

            <h4 className="mt-5 text-xl font-bold text-[#12355B]">
              Shows & Presentations
            </h4>

            <p className="mt-3 leading-7 text-slate-600">
              Educational shows and presentations help students overcome
              hesitation and become confident performers.
            </p>
          </div>

        </div>


        {/* Closing Statement */}
        <div className="mt-24 rounded-3xl bg-[#12355B] px-6 py-12 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl sm:px-12">
          <h3 className="text-3xl font-bold text-white">
            Building Confidence for a Brighter Future
          </h3>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            At The Voice of Wisdom, we believe every student has the ability
            to learn, grow, and achieve. Through quality teaching,
            experienced faculty, supportive administration, and meaningful
            activities, we help students develop the confidence and courage
            to speak, think, lead, and succeed.
          </p>
        </div>

      </div>
    </section>
  );
}

export default AboutSection;