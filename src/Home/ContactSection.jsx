function ContactSection() {
  return (
    <section id="contact" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
            Contact Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#12355B] sm:text-4xl">
            Get in Touch With Us
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Have questions about admissions, courses, or our school? Contact
            The Voice of Wisdom and our team will be happy to guide you.
          </p>
        </div>

        {/* Contact Content */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2">

          {/* Contact Information */}
          <div className="rounded-3xl bg-[#12355B] p-8 shadow-lg lg:p-10">

            <p className="font-semibold uppercase tracking-wider text-[#00A6A6]">
              Let's Connect
            </p>

            <h3 className="mt-3 text-3xl font-bold text-white">
              We Are Here to Help
            </h3>

            <p className="mt-5 leading-8 text-slate-200">
              Whether you are looking for information about school admission,
              English language courses, or student activities, feel free to
              reach out to us.
            </p>

            {/* Address */}
            <div className="mt-10 flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A6A6] text-xl">
                📍
              </div>

              <div>
                <h4 className="font-bold text-white">
                  Address
                </h4>

                <p className="mt-1 text-slate-300">
                  Block no 5 , Satellite Town , Quetta, Pakistan.
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A6A6] text-xl">
                📞
              </div>

              <div>
                <h4 className="font-bold text-white">
                  Phone
                </h4>

                <p className="mt-1 text-slate-300">
                  +92 345 8343065
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A6A6] text-xl">
                ✉️
              </div>

              <div>
                <h4 className="font-bold text-white">
                  Email
                </h4>

                <p className="mt-1 text-slate-300">
                  
zohaib85@yahoo.com
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A6A6] text-xl">
                🕒
              </div>

              <div>
                <h4 className="font-bold text-white">
                  Office Hours
                </h4>

                <p className="mt-1 text-slate-300">
                  Monday – Saturday
                </p>

                <p className="text-slate-300">
                  9:00 AM – 5:00 PM
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-[#DDE7EA] bg-white p-8 shadow-lg lg:p-10">

            <h3 className="text-3xl font-bold text-[#12355B]">
              Send Us a Message
            </h3>

            <p className="mt-3 text-slate-600">
              Fill out the form below and we will get back to you.
            </p>

            <form className="mt-8 space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Subject
                </label>

                <input
                  type="text"
                  placeholder="Admission / Course / General Inquiry"
                  className="w-full rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block font-semibold text-[#12355B]">
                  Message
                </label>

                <textarea
                  rows="5"
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border border-[#DDE7EA] px-4 py-3 outline-none transition focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/20"
                ></textarea>
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#12355B] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#00A6A6] hover:shadow-lg"
              >
                Send Message
              </button>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}

export default ContactSection;