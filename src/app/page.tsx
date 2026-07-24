import Image from 'next/image';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import HeroCarousel from '@/components/HeroCarousel';
import LogoutButton from '@/components/LogoutButton';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Review from '@/models/Review';
import ReviewForm from '@/components/ReviewForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteSettings } from '@/app/admin/actions';
import shriMatajiPortrait from '../../ShriMatajisPictures/PhotoSM-206.jpg';

export const revalidate = 0;

export default async function Home() {
  let sessions: any[] = [];
  let reviews: any[] = [];
  let settings = {
    reviewsEnabled: true,
    bookingEnabled: true,
    helpdeskPhone: '',
    contactEmail: 'syhydhealthcentre@gmail.com',
    upiId: '',
    upiQrCodeUrl: '',
    upiPayeeName: 'Sahaja Yoga Health Centre',
    announcementBanner: '',
  };

  const session = await getServerSession(authOptions);
  const user = session?.user;

  try {
    await dbConnect();
    settings = await getSiteSettings();
    sessions = await Session.find({ isActive: true }).sort({ date: 1 });
    if (settings.reviewsEnabled) {
      reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    }
  } catch (error) {
    console.error('Error loading landing page data:', error);
  }

  const hasSessions = sessions.length > 0;

  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans selection:bg-saffron selection:text-white">
      {/* Announcement Banner (if configured in Admin) */}
      {settings.announcementBanner && (
        <div className="bg-saffron text-white text-xs font-semibold py-2 px-4 text-center tracking-wide shadow-inner">
          {settings.announcementBanner}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-warm-gray py-4 px-4 sm:px-6 lg:px-8 sticky top-0 bg-cream/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold text-sm sm:text-lg tracking-widest text-teal-dark">SAHAJA YOGA</span>
            <span className="text-[10px] sm:text-xs text-warm-charcoal/50 tracking-wider truncate">Health Centre & Meditation Hall</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <a href="#hero" className="text-warm-charcoal/70 hover:text-saffron transition-colors">Home</a>
            <a href="#about" className="text-warm-charcoal/70 hover:text-saffron transition-colors">About</a>
            <a href="#sessions" className="text-warm-charcoal/70 hover:text-saffron transition-colors">Sessions</a>
            {settings.reviewsEnabled && (
              <a href="#reviews" className="text-warm-charcoal/70 hover:text-saffron transition-colors">Reviews</a>
            )}
            <a href="#contact" className="text-warm-charcoal/70 hover:text-saffron transition-colors">Contact</a>
          </nav>

          <MobileNav />

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <span className="hidden md:inline-block text-[10px] text-warm-charcoal/50 font-mono">
                  Hi, {user.name}
                </span>
                {user.role === 'Admin' && (
                  <Link 
                    href="/admin" 
                    className="hidden md:inline-block text-xs font-semibold px-4 py-2 border border-teal text-teal hover:bg-teal hover:text-white transition-colors rounded-md"
                  >
                    ADMIN
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : null}

            <Link 
              href="/book" 
              className="text-[10px] sm:text-xs font-semibold px-3 sm:px-5 py-2 bg-saffron text-white hover:bg-saffron-dark transition-colors whitespace-nowrap rounded-md shadow-sm"
            >
              REGISTER NOW
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Full-Width Photo Carousel */}
      <section id="hero" className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] scroll-mt-24">
        <HeroCarousel />
        
        {/* Hero Content Overlay with Superior Contrast */}
        <div className="absolute inset-0 flex flex-col justify-end z-20 px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 pointer-events-none">
          <div className="max-w-3xl space-y-4 bg-warm-charcoal/40 backdrop-blur-sm border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl pointer-events-auto">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-[3px] bg-saffron rounded-full"></div>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-saffron font-bold [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
                Nirmal Nagar, Telangana
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.9)]">
              Sahaja Yoga <br />
              <span className="font-bold text-cream">Health Centre & Meditation Hall</span>
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-normal max-w-xl leading-relaxed [text-shadow:_0_1px_8px_rgba(0,0,0,0.9)]">
              A sanctuary of healing and spiritual research where vibratory awareness and Sahaja Yoga meditation help cleanse, balance, and rejuvenate the subtle system.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/book"
                className="inline-block text-sm font-bold tracking-wider px-6 py-3 bg-saffron text-white hover:bg-saffron-dark transition-all rounded-md shadow-lg hover:shadow-saffron/20 transform hover:-translate-y-0.5"
              >
                REGISTER FOR SESSION
              </Link>
              <a
                href="#sessions"
                className="inline-block text-sm font-semibold tracking-wider px-6 py-3 bg-white/15 text-white border border-white/40 hover:bg-white/30 backdrop-blur-md transition-all rounded-md hover:border-white shadow-md"
              >
                VIEW SESSIONS
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About the Centre — Merged Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-cream scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          
          {/* Shri Mataji Feature */}
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-center mb-16">
            <div className="relative overflow-hidden rounded-xl border border-warm-gray bg-cream-dark shadow-sm">
              <div className="relative aspect-[3/4]">
                <Image
                  src={shriMatajiPortrait}
                  alt="H.H. Shri Mataji Nirmala Devi — Founder of Sahaja Yoga"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold mb-2">Founder of Sahaja Yoga</p>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
                  H.H. Shri Mataji <span className="font-semibold">Nirmala Devi</span>
                </h2>
              </div>
              <div className="border-l-2 border-saffron pl-5 py-2">
                <p className="text-sm italic text-warm-charcoal/70 font-light leading-relaxed">
                  &quot;The time has come for all of you to get your self-realisation, by which your attention becomes enlightened, your health gets completely all right, your mental processes are sensible, but above all you stand in your present.&quot;
                </p>
                <p className="text-[11px] text-warm-charcoal/40 font-mono mt-3">
                  — H.H. Shri Mataji Nirmala Devi, 29.09.1994, Los Angeles
                </p>
              </div>
              <p className="text-sm text-warm-charcoal/70 font-light leading-relaxed">
                Born in 1923 in Chhindwara, India, Shri Mataji discovered a unique method of mass Kundalini awakening on May 5th, 1970.
                She emphasized that self-realization is the birthright of every human being and cannot be bought or sold. Her teachings on the subtle system form the foundation of all balancing treatments at this centre.
              </p>
            </div>
          </div>

          {/* Centre Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-base font-semibold text-teal-dark">Health Centre & Meditation Hall</h3>
              <p className="text-sm text-warm-charcoal/60 font-light leading-relaxed">
                Ground floor and first floor comprising treatment chambers, dedicated rooms, and accommodation for doctors. The first-ever Sahaja Yoga Resource Centre in Telangana.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-saffron/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
              </div>
              <h3 className="text-base font-semibold text-teal-dark">Vibratory Awareness Research</h3>
              <p className="text-sm text-warm-charcoal/60 font-light leading-relaxed">
                Scientific evaluation of vibratory diagnostics and thoughtless awareness. Collective clearance sessions, workshops, and seminars on subtle-system balancing.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </div>
              <h3 className="text-base font-semibold text-teal-dark">Holistic Healing Treatments</h3>
              <p className="text-sm text-warm-charcoal/60 font-light leading-relaxed">
                Learn ancient balancing techniques — footsoaking, ice-packs, three-channel balancing, and mantra vibrations to clear chakras and strengthen consciousness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Section */}
      <section id="sessions" className="py-16 px-4 sm:px-6 lg:px-8 bg-cream-dark scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">Upcoming Health Sessions</p>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
              Register for a <span className="font-semibold">Session</span>
            </h2>
            <p className="text-sm text-warm-charcoal/60 font-light max-w-xl mx-auto">
              Choose an upcoming doctor consultation or health session below. Limited seats per session.
            </p>
          </div>

          {hasSessions ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((sess) => {
                const remaining = Math.max(0, sess.maxParticipants - sess.registeredCount);
                const isFull = remaining === 0;
                return (
                  <div
                    key={sess._id.toString()}
                    className={`bg-white border rounded-xl p-6 space-y-4 transition-all hover:shadow-md ${
                      isFull ? 'border-warm-gray opacity-60' : 'border-warm-gray hover:border-saffron/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-teal-dark leading-snug">{sess.title}</h3>
                        <span
                          className={`shrink-0 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${
                            sess.stayAvailable
                              ? 'bg-sage/10 text-sage border border-sage/30'
                              : 'bg-saffron/10 text-saffron border border-saffron/30'
                          }`}
                        >
                          {sess.stayAvailable ? 'Stay: Yes' : 'Day Visit'}
                        </span>
                      </div>
                      <p className="text-xs text-warm-charcoal/60 font-light leading-relaxed line-clamp-2">
                        {sess.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono text-warm-charcoal/60">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>Dr. <strong className="text-warm-charcoal">{sess.instructor}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-warm-charcoal/30">•</span>
                        <span>{sess.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-warm-gray">
                      <div>
                        <span className={`text-sm font-bold ${isFull ? 'text-red-500' : remaining < 10 ? 'text-saffron' : 'text-sage'}`}>
                          {isFull ? 'FULLY BOOKED' : `${remaining} seats left`}
                        </span>
                        <span className="text-[10px] text-warm-charcoal/40 block font-mono">{sess.maxParticipants} total capacity</span>
                      </div>
                      <Link
                        href={isFull ? '#' : `/book?sessionId=${sess._id.toString()}`}
                        className={`text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-md transition-colors ${
                          isFull
                            ? 'bg-warm-gray text-warm-charcoal/40 cursor-not-allowed'
                            : 'bg-saffron text-white hover:bg-saffron-dark shadow-sm'
                        }`}
                      >
                        {isFull ? 'FULL' : 'REGISTER →'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-warm-gray rounded-xl">
              <p className="text-sm text-warm-charcoal/50 font-light">No active sessions currently scheduled. Please check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subtle System Overview — Condensed */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">The Inner Instrument</p>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
              The <span className="font-semibold">Subtle System</span>
            </h2>
            <p className="text-sm text-warm-charcoal/60 font-light max-w-xl mx-auto">
              Understanding the inner instrument which controls our physical, mental, and emotional health.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-warm-gray rounded-xl p-6 sm:p-8 space-y-5">
              <h3 className="text-lg font-semibold text-teal-dark border-b border-warm-gray pb-3">The Three Energy Channels</h3>
              <ul className="space-y-4 text-sm text-warm-charcoal/70">
                <li>
                  <strong className="text-teal font-medium">Ida Nadi (Left / Moon):</strong>
                  <p className="font-light mt-1">Governs emotions and sub-conscious mind. When cleared, provides deep joy and peace.</p>
                </li>
                <li>
                  <strong className="text-saffron font-medium">Pingala Nadi (Right / Sun):</strong>
                  <p className="font-light mt-1">Governs mental processes and physical activities. When cleared, grants dynamism and clarity.</p>
                </li>
                <li>
                  <strong className="text-sage font-medium">Sushumna Nadi (Central):</strong>
                  <p className="font-light mt-1">The path of spiritual ascent. Opens during self-realization, leading to thoughtless awareness.</p>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 sm:p-8 space-y-5">
              <h3 className="text-lg font-semibold text-teal-dark border-b border-warm-gray pb-3">The Seven Chakras & Kundalini</h3>
              <p className="text-sm text-warm-charcoal/70 font-light">
                The <strong className="font-medium text-teal-dark">Kundalini</strong> is a residual spiritual energy dormant in the sacrum bone. Upon awakening, she rises through the central channel and pierces the 7 chakras.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">7. Sahastrar (Crown)</div>
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">6. Agnya (Forehead)</div>
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">5. Vishuddhi (Throat)</div>
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">4. Anahat (Heart)</div>
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">3. Nabhi (Solar Plexus)</div>
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">2. Swadhisthan</div>
                <div className="p-2.5 border border-warm-gray bg-cream rounded-md text-warm-charcoal/70">1. Mooladhar</div>
                <div className="p-2.5 border border-saffron bg-saffron/10 rounded-md text-saffron font-bold text-center">KUNDALINI ↑</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section (Feature Flagged) */}
      {settings.reviewsEnabled && (
        <section id="reviews" className="py-16 px-4 sm:px-6 lg:px-8 bg-cream-dark scroll-mt-24 border-t border-warm-gray">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">Seeker Experiences</p>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
                Seeker <span className="font-semibold">Reviews</span>
              </h2>
              <p className="text-sm text-warm-charcoal/60 font-light max-w-xl mx-auto">
                Read reflections and experiences from seekers visiting the Sahaja Yoga Health Centre.
              </p>
            </div>

            {reviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((rev) => (
                  <div key={rev._id.toString()} className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-teal-dark">{rev.name}</span>
                      <div className="flex text-saffron text-xs">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-warm-charcoal/70 font-light italic leading-relaxed">
                      &quot;{rev.comment}&quot;
                    </p>
                    <div className="text-[10px] text-warm-charcoal/40 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center text-warm-charcoal/40 font-light">No published reviews yet. Be the first to leave feedback below!</p>
            )}

            <div className="max-w-xl mx-auto pt-4">
              <ReviewForm />
            </div>
          </div>
        </section>
      )}

      {/* Contact Section — Real Data */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-dark text-white scroll-mt-24">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">Plan Your Visit</p>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
              Visit the <span className="font-semibold">Centre</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Contact Info */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-saffron font-semibold mb-2">Location & Address</h4>
                <p className="text-sm text-white/80 font-light leading-relaxed">
                  Sahaja Yoga Health Centre & Meditation Hall<br />
                  Nirmal Nagar, Jainepally Village,<br />
                  Bibi Nagar Mandal, Yadadri Dst,<br />
                  Telangana — 508126
                </p>
                <p className="text-[11px] text-white/50 font-mono mt-2">
                  Plus Code: GQ9M+WPW, Tirmalagiri
                </p>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">
                  Landmark: Param Pujya Shri Mataji Nirmala Devi Road
                </p>
              </div>

              {settings.helpdeskPhone && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-saffron font-semibold mb-2">General Helpdesk</h4>
                  <p className="text-sm text-white/80 font-light">{settings.helpdeskPhone}</p>
                </div>
              )}

              <div>
                <h4 className="text-xs uppercase tracking-wider text-saffron font-semibold mb-2">Email Address</h4>
                <a href={`mailto:${settings.contactEmail || 'syhydhealthcentre@gmail.com'}`} className="text-sm text-white/80 hover:text-saffron transition-colors font-light">
                  {settings.contactEmail || 'syhydhealthcentre@gmail.com'}
                </a>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-saffron font-semibold mb-2">Organized By</h4>
                <p className="text-sm text-white/80 font-light leading-relaxed">
                  H.H. Shri Mataji Nirmala Devi<br />
                  Sahaja Yoga National Trust
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] text-white/40">
                Seekers must follow the general Sahaja Yoga code of conduct.
              </div>
            </div>

            {/* Map */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col justify-between">
              <div className="w-full aspect-[4/3] bg-warm-charcoal/20 border border-white/10 relative overflow-hidden rounded-lg">
                <iframe 
                  src="https://maps.google.com/maps?q=17.5198654,78.7843353&hl=en&z=16&output=embed" 
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
                  className="inline-block text-center text-xs font-semibold px-4 py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-all w-full rounded-md"
                >
                  OPEN IN GOOGLE MAPS
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-gray py-10 px-8 bg-cream">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <span className="text-xs text-warm-charcoal/50">&copy; 2026 H.H. Shri Mataji Nirmala Devi Sahaja Yoga National Trust. All Rights Reserved.</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-warm-charcoal/50 justify-center">
            <a href="#hero" className="hover:text-saffron transition-colors">Home</a>
            <a href="#sessions" className="hover:text-saffron transition-colors">Sessions</a>
            <Link href="/book" className="hover:text-saffron transition-colors">Register</Link>
            <Link href="/login" className="hover:text-saffron transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
