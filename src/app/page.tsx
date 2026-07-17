import Image from 'next/image';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import ReviewForm from '@/components/ReviewForm';
import LogoutButton from '@/components/LogoutButton';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Review from '@/models/Review';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import shriMatajiPortrait from '../../ShriMatajisPictures/1990_Cairns-X3.jpg';

export const revalidate = 0; // Fresh fetch on every load

export default async function Home() {
  let sessions: any[] = [];
  let reviews: any[] = [];
  const session = await getServerSession(authOptions);
  const user = session?.user;

  try {
    await dbConnect();
    // Fetch upcoming active sessions
    sessions = await Session.find({ isActive: true }).sort({ date: 1 });
    // Fetch approved reviews
    reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error loading landing page data:', error);
  }

  const hasSessions = sessions.length > 0;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-200 py-6 px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-widest text-neutral-900">SAHAJA YOGA</span>
            <span className="text-xs text-neutral-500 tracking-wider">Research & Health Centre, Hyderabad</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <a href="#hero" className="hover:text-neutral-500 transition-colors">Home</a>
            
            {/* About Dropdown */}
            <div className="relative group py-2">
              <button className="hover:text-neutral-500 transition-colors flex items-center space-x-1 focus:outline-none">
                <span>About</span>
                <svg className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 py-2 shadow-sm rounded-none hidden group-hover:block z-50">
                <a href="#shri-mataji" className="block px-4 py-2 text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors">Shri Mataji</a>
                <a href="#sahaja-yoga" className="block px-4 py-2 text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors">Sahaja Yoga</a>
                <a href="#about-us" className="block px-4 py-2 text-xs hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors">About Us</a>
              </div>
            </div>

            <a href="https://sahajogtelangana.vercel.app/events" className="hover:text-neutral-500 transition-colors">Events</a>
            {hasSessions && (
              <a href="#upcoming-sessions" className="hover:text-neutral-500 transition-colors">Upcoming Sessions</a>
            )}
            <a href="#reviews" className="hover:text-neutral-500 transition-colors">Reviews</a>
          </nav>

          <MobileNav />

          <div className="flex items-center space-x-4">
            {/* Auth Buttons */}
            {user ? (
              <>
                <span className="hidden md:inline-block text-[10px] text-neutral-400 font-mono">
                  Hi, {user.name}
                </span>
                {user.role === 'Admin' && (
                  <Link 
                    href="/admin" 
                    className="hidden md:inline-block text-xs font-semibold px-4 py-2 border border-neutral-950 hover:bg-neutral-900 hover:text-white transition-colors"
                  >
                    ADMIN
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <Link 
                href="/login" 
                className="hidden md:inline-block text-xs font-semibold px-4 py-2 border border-neutral-200 hover:border-neutral-900 transition-colors"
              >
                LOGIN
              </Link>
            )}

            <Link 
              href="/book" 
              className="text-xs font-semibold px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              REGISTER NOW
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="py-20 px-8 border-b border-neutral-100 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-5">
              <p className="text-xs tracking-[0.35em] uppercase text-neutral-400">Nirmal Nagari, Hyderabad</p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 leading-tight">
                Sahaja Yoga <br />
                <span className="font-normal">Research & Health Centre</span>
              </h1>
              <div className="w-12 h-[1px] bg-neutral-400 mx-auto lg:mx-0"></div>
              <p className="text-lg text-neutral-600 font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to a unique sanctuary of healing and peace, where scientific research meets ancient spiritual knowledge.
                Our treatments utilize the power of <strong className="font-medium text-neutral-900">vibratory awareness</strong> and
                Sahaja Yoga meditation to help cleanse, balance, and rejuvenate the subtle system.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-neutral-200 bg-neutral-50 p-4 text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Meditation Focus</p>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  Join our collective clearance sessions, workshops, and seminars designed around Sahaja Yoga subtle-system awareness.
                </p>
              </div>
              <div className="border border-neutral-200 bg-neutral-50 p-4 text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Scientific Research</p>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  The health benefits of vibratory diagnostics and thoughtless awareness are scientifically evaluated and proven here.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/book"
                className="inline-block text-sm font-medium tracking-wider px-8 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                REGISTER FOR AN UPCOMING SESSION
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden border border-neutral-200 bg-neutral-100">
              <div className="relative aspect-[4/5]">
                <Image
                  src={shriMatajiPortrait}
                  alt="Shri Mataji Nirmala Devi"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="border border-neutral-200 p-6 bg-white space-y-3">
              <p className="text-sm italic text-neutral-600 font-light leading-relaxed">
                &quot;The time has come for all of you to get your self-realisation, by which your attention becomes enlightened, your health gets completely all right, your mental processes are sensible, but above all you stand in your present.&quot;
              </p>
              <p className="text-right text-[10px] text-neutral-400 font-mono">
                — H.H. Shri Mataji Nirmala Devi, 29.09.1994, Los Angeles, USA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Sessions Section - ONLY rendered if there are sessions */}
      {hasSessions && (
        <section id="upcoming-sessions" className="py-20 px-8 border-b border-neutral-100 scroll-mt-24">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-light tracking-wider uppercase">UPCOMING SESSIONS</h2>
              <p className="text-sm text-neutral-500">Book your attendance for our upcoming collective clearance and meditation workshops.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {sessions.map((session) => {
                const spotsLeft = Math.max(0, session.maxParticipants - session.registeredCount);
                return (
                  <div key={session._id.toString()} className="border border-neutral-200 p-6 bg-white flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-neutral-100 px-2 py-0.5 border text-neutral-500 font-semibold tracking-wider uppercase font-mono">
                          {session.time}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                          spotsLeft > 5 ? 'border-neutral-200 text-neutral-600' : 'border-neutral-900 bg-neutral-900 text-white animate-pulse'
                        }`}>
                          {spotsLeft} spots left
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-neutral-900 tracking-wide leading-tight">
                        {session.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-light leading-relaxed">
                        {session.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 space-y-3">
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Instructor:</span>
                        <span className="font-semibold text-neutral-800">{session.instructor}</span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Date:</span>
                        <span className="font-semibold text-neutral-800 font-mono">
                          {new Date(session.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <Link
                        href={`/book?sessionId=${session._id.toString()}`}
                        className="block text-center text-[10px] font-semibold tracking-widest uppercase py-2.5 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all w-full"
                      >
                        Register For Session
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* About Sections */}
      <section className="py-20 px-8 border-b border-neutral-100 bg-neutral-50/50">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* About Shri Mataji */}
          <div id="shri-mataji" className="grid lg:grid-cols-3 gap-8 items-start scroll-mt-24">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-light tracking-widest text-neutral-500 uppercase">SHRI MATAJI</h2>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Founder of Sahaja Yoga</p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                Born in 1923 in Chhindwara, India, Shri Mataji Nirmala Devi discovered a unique method of mass Kundalini awakening on May 5th, 1970.
                She traveled the world for over 40 years, giving self-realization to hundreds of thousands of seekers of truth for free.
              </p>
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                She emphasized that self-realization is the birthright of every human being, and it cannot be bought or paid for. Her teachings on the subtle system form the foundation of all balancing treatments conducted at the Hyderabad Research & Health Centre.
              </p>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-200"></div>

          {/* About Sahaja Yoga */}
          <div id="sahaja-yoga" className="grid lg:grid-cols-3 gap-8 items-start scroll-mt-24">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-light tracking-widest text-neutral-500 uppercase">SAHAJA YOGA</h2>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Spiritual Ascent & Balance</p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                &quot;Saha&quot; means with, &quot;ja&quot; means born, and &quot;yoga&quot; means union. Sahaja Yoga is the spontaneous union of the individual soul with the all-pervading divine energy, achieved through the gentle awakening of the Kundalini energy dormant inside the sacrum bone.
              </p>
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                By experiencing our self-realization, we enter into a state of thoughtless awareness, where the mind becomes silent and peaceful. This activation balances our left (desire) and right (action) energy channels, fostering physical, mental, and emotional recovery.
              </p>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-200"></div>

          {/* About Us */}
          <div id="about-us" className="grid lg:grid-cols-3 gap-8 items-start scroll-mt-24">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-light tracking-widest text-neutral-500 uppercase">ABOUT US</h2>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Research & Health Centre</p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                The Sahaja Yoga Research & Health Centre, located in Nirmal Nagari, Hyderabad, Telangana, is dedicated to scientific exploration of Sahaja Yoga techniques. Our qualified team of doctors and coordinators studies the restorative effects of vibrations on human physiology.
              </p>
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                Seekers visit our sanctuary to learn ancient balancing techniques (such as footsoaking, ice-packs, three-channel balancing, and mantra vibrations) to clear their chakras and strengthen their collective consciousness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle System Section */}
      <section id="subtle-system" className="py-20 px-8 border-b border-neutral-100">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-light tracking-wider">THE SUBTLE SYSTEM</h2>
            <p className="text-sm text-neutral-500">Understanding the inner instrument which controls our physical, mental, and emotional health.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="border border-neutral-200 p-8 space-y-6 bg-white">
              <h3 className="text-lg font-medium border-b border-neutral-100 pb-3">The Three Energy Channels (Nadis)</h3>
              <ul className="space-y-4 text-sm text-neutral-600">
                <li>
                  <strong className="text-neutral-900 font-medium">Ida Nadi (Left Channel / Moon):</strong>
                  <p className="font-light mt-1">Carries the energy of desire and past. It governs our emotions and sub-conscious mind. When cleared, it provides deep joy and peace.</p>
                </li>
                <li>
                  <strong className="text-neutral-900 font-medium">Pingla Nadi (Right Channel / Sun):</strong>
                  <p className="font-light mt-1">Carries the energy of action, planning, and future. It governs our mental processes and physical activities. When cleared, it grants dynamism and clarity.</p>
                </li>
                <li>
                  <strong className="text-neutral-900 font-medium">Sushumna Nadi (Central Channel):</strong>
                  <p className="font-light mt-1">The path of spiritual ascent and present awareness. This channel opens during self-realization, leading to thoughtless awareness.</p>
                </li>
              </ul>
            </div>

            <div className="border border-neutral-200 p-8 space-y-6 bg-white">
              <h3 className="text-lg font-medium border-b border-neutral-100 pb-3">The Seven Plexuses (Chakras) & Kundalini</h3>
              <p className="text-sm text-neutral-600 font-light">
                The <strong className="font-medium text-neutral-900">Kundalini</strong> is a residual spiritual energy dormant in the sacrum bone. 
                Upon awakening, she rises through the central channel and pierces the 7 chakras, establishing yoga (union).
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <div className="p-2 border border-neutral-100 bg-neutral-50">7. Sahastrar (Crown)</div>
                  <div className="p-2 border border-neutral-100 bg-neutral-50">6. Agnya (Forehead)</div>
                  <div className="p-2 border border-neutral-100 bg-neutral-50">5. Vishuddhi (Throat)</div>
                  <div className="p-2 border border-neutral-100 bg-neutral-50">4. Heart (Anahat)</div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 border border-neutral-100 bg-neutral-50">3. Nabhi (Solar Plexus)</div>
                  <div className="p-2 border border-neutral-100 bg-neutral-50">2. Swadhisthan (Lower Abdomen)</div>
                  <div className="p-2 border border-neutral-100 bg-neutral-50">1. Mooladhar (Pelvic Floor)</div>
                  <div className="p-2 border border-neutral-100 bg-neutral-900 text-white text-center font-bold">KUNDALINI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-8 border-b border-neutral-100 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-light tracking-wider uppercase">SEEKER REVIEWS</h2>
            <p className="text-sm text-neutral-500">Read what others have to say about their balancing experiences at the Research & Health Centre.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review._id.toString()} className="border border-neutral-200 p-6 bg-neutral-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-neutral-800">{review.name}</span>
                  <div className="flex text-amber-500 text-xs">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                      <span key={i} className="text-neutral-200">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-600 font-light italic leading-relaxed">
                  &quot;{review.comment}&quot;
                </p>
                <div className="text-[10px] text-neutral-400 font-mono">
                  Submitted on {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-8 bg-neutral-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-light tracking-wider">VISIT THE CENTRE</h2>
            <p className="text-sm text-neutral-500">Plan your visit to Nirmal Nagari, Hyderabad.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-stretch">
            {/* Information */}
            <div className="border border-neutral-200 bg-white p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">Location Address</h4>
                  <p className="text-sm text-neutral-600 font-light leading-relaxed">
                    Sahaja Yoga Research & Health Centre<br />
                    Nirmal Nagari, Ghansimi Bazar,<br />
                    Hyderabad, Telangana - 500005, India
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">Phone Numbers</h4>
                  <p className="text-sm text-neutral-600 font-light">
                    +91 40 1234 5678 (Helpdesk)<br />
                    +91 98765 43210 (Admissions/Registrations Desk)
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">Email Address</h4>
                  <p className="text-sm text-neutral-600 font-light">
                    appointments@syhealthcentre-hyd.org<br />
                    admissions@syhealthcentre-hyd.org
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 text-xs text-neutral-400">
                Note: Seekers must follow the general Sahaja Yoga code of conduct.
              </div>
            </div>

            {/* Map Preview */}
            <div className="border border-neutral-200 bg-white p-4 flex flex-col justify-between">
              <div className="w-full aspect-[4/3] bg-neutral-100 border border-neutral-200 relative overflow-hidden">
                <iframe 
                  src="https://maps.google.com/maps?q=Nirmal%20Nagari,%20Ghansimi%20Bazar,%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-4">
                <a 
                  href="https://maps.app.goo.gl/QNu14TFmGcJaZ3cn6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block text-center text-xs font-semibold px-4 py-2.5 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all w-full"
                >
                  OPEN IN GOOGLE MAPS
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-10 px-8 text-center text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <span>&copy; 2026 Sahaja Yoga Research & Health Centre, Hyderabad. All Rights Reserved.</span>
          <div className="space-x-6">
            <a href="#hero" className="hover:underline">Home</a>
            <a href="#shri-mataji" className="hover:underline">About</a>
            <a href="https://sahajogtelangana.vercel.app/events" className="hover:underline">Events</a>
            {hasSessions && <a href="#upcoming-sessions" className="hover:underline">Sessions</a>}
            <a href="#reviews" className="hover:underline">Reviews</a>
            <Link href="/book" className="hover:underline">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
