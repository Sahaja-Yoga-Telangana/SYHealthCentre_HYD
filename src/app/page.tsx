import Image from 'next/image';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import ReviewForm from '@/components/ReviewForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteSettings } from '@/app/admin/actions';
import HeaderNav from '@/components/HeaderNav';

export const revalidate = 0;

export default async function Home() {
  let sessions: any[] = [];
  let settings = {
    reviewsEnabled: false,
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
  } catch (error) {
    console.error('Error loading landing page data:', error);
  }

  const hasSessions = sessions.length > 0;

  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans selection:bg-saffron selection:text-white">
      {/* Universal Header */}
      <HeaderNav announcement={settings.announcementBanner} />

      {/* 1. Hero Section (30% Left: Shri Dhanvantri, 70% Right: Hero Carousel) */}
      <section id="hero" className="py-6 px-4 sm:px-6 lg:px-8 bg-cream border-b border-warm-gray scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-4 lg:gap-6 items-stretch">
          {/* Left 30% Column: Shri Dhanvantri Picture (No text overlay) */}
          <div className="md:col-span-3 relative rounded-2xl overflow-hidden border border-warm-gray shadow-sm bg-cream-dark min-h-[300px] md:min-h-[380px]">
            <Image
              src="/images/shri-dhanvantari.jpg"
              alt="Shri Dhanvantari"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 30vw"
              priority
            />
          </div>

          {/* Right 70% Column: Hero Carousel with Compact Text Overlay */}
          <div className="md:col-span-7 relative rounded-2xl overflow-hidden border border-warm-gray shadow-sm h-[320px] sm:h-[380px] md:h-auto min-h-[320px]">
            <HeroCarousel />

            {/* Clean Hero Text Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end z-20 px-6 sm:px-8 pb-6 sm:pb-8 pointer-events-none">
              <div className="max-w-xl space-y-2 pointer-events-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-[2.5px] bg-saffron rounded-full"></div>
                  <p className="text-[11px] sm:text-xs tracking-[0.2em] uppercase text-saffron font-bold [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
                    National Sahaja Yoga Resource Centre
                  </p>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight [text-shadow:_0_2px_10px_rgba(0,0,0,0.9)]">
                  Sahaja Yoga <span className="font-light text-cream">Health Centre</span>
                </h1>
                <div className="pt-1.5">
                  <Link
                    href="/book"
                    prefetch={true}
                    className="inline-block text-xs font-bold tracking-wider px-6 py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-all rounded-md shadow-md uppercase"
                  >
                    Register for Session
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upcoming Health Sessions Section (Right below Hero, only shown if sessions exist) */}
      {hasSessions && (
        <section id="sessions" className="py-12 px-4 sm:px-6 lg:px-8 bg-cream-dark border-b border-warm-gray scroll-mt-24">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">Upcoming Health Sessions</p>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
                Register for a <span className="font-semibold">Session</span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((sess) => {
                const isUnlimited = sess.limitSeats === false;
                const remaining = Math.max(0, sess.maxParticipants - sess.registeredCount);
                const isFull = !isUnlimited && remaining === 0;
                const sessionUrl = `/sessions/${sess._id.toString()}`;

                return (
                  <div
                    key={sess._id.toString()}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      isFull ? 'border-warm-gray opacity-60' : 'border-warm-gray hover:border-saffron/50'
                    }`}
                  >
                    {/* Clickable Image Banner with object-top */}
                    {sess.imageUrl && (
                      <Link href={sessionUrl} className="block relative w-full aspect-[16/9] bg-cream-dark border-b border-warm-gray group">
                        <Image
                          src={sess.imageUrl}
                          alt={sess.title}
                          fill
                          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                    )}

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={sessionUrl} className="hover:text-saffron transition-colors">
                            <h3 className="text-base font-semibold text-teal-dark leading-snug">{sess.title}</h3>
                          </Link>
                          <span
                            className={`shrink-0 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${
                              sess.stayAvailable
                                ? 'bg-sage/20 text-sage-dark'
                                : 'bg-warm-gray text-warm-charcoal/60'
                            }`}
                          >
                            {sess.stayAvailable ? 'Stay Included' : 'Day Visit'}
                          </span>
                        </div>
                        <p className="text-xs text-warm-charcoal/70 font-light line-clamp-3">{sess.description}</p>
                      </div>

                      <div className="text-xs space-y-1 text-warm-charcoal/70 pt-2 border-t border-warm-gray font-light">
                        <p>
                          <strong className="font-semibold text-warm-charcoal">Coordinator / Doctor:</strong> {sess.instructor}
                        </p>
                        <p>
                          <strong className="font-semibold text-warm-charcoal">Date:</strong>{' '}
                          {new Date(sess.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        {/* Only display seat availability if seat limiting is enabled */}
                        {!isUnlimited && (
                          <p>
                            <strong className="font-semibold text-warm-charcoal">Seat Availability:</strong>{' '}
                            <span className={isFull ? 'text-red-500 font-bold' : 'text-teal font-bold'}>
                              {remaining} / {sess.maxParticipants} left
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href={sessionUrl}
                          className="flex-1 text-center text-xs font-semibold uppercase tracking-wider py-2.5 bg-cream hover:bg-warm-gray text-teal-dark transition-colors rounded-md border border-warm-gray"
                        >
                          Details
                        </Link>
                        {isFull ? (
                          <button
                            disabled
                            className="flex-1 text-center text-xs font-bold uppercase tracking-wider py-2.5 bg-warm-gray text-warm-charcoal/40 rounded-md cursor-not-allowed"
                          >
                            Full
                          </button>
                        ) : (
                          <Link
                            href={`/book?sessionId=${sess._id.toString()}`}
                            className="flex-1 text-center text-xs font-bold uppercase tracking-wider py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm"
                          >
                            Register →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Combined Divine Approval & Infrastructure Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-warm-gray">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Founder & Divine Approval Card */}
          <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center bg-cream border border-warm-gray rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-xl border border-warm-gray bg-cream-dark shadow-sm">
              <Image
                src="/images/ppt/image3.png"
                alt="Approved by H.H. Shri Mataji Nirmala Devi"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-saffron">Divine Guidance</span>
                <h2 className="text-2xl font-light text-teal-dark mt-1">
                  Approved by <span className="font-semibold">H.H. Shri Mataji Nirmala Devi</span>
                </h2>
              </div>
              <div className="border-l-2 border-saffron pl-4 py-1 italic text-sm text-warm-charcoal/70 font-light">
                &quot;The concept of Sahaja Yoga Resource Centre & Health Centre was envisioned and approved by Param Pujya Shri Mataji Nirmala Devi to benefit all Sahaja Yogis.&quot;
              </div>
              <p className="text-sm text-warm-charcoal/70 font-light leading-relaxed">
                With the blessings of Shri Mataji this Resource Centre and Health Centre operates under the H. H. Shri Mataji Nirmala Devi Trust (National) to provide vibratory diagnostics, chakra clearance, and collective meditation.
              </p>
            </div>
          </div>

          {/* Infrastructure Facility Cards */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">Resource Centre Campus</span>
              <h2 className="text-2xl sm:text-3xl font-light text-teal-dark">
                Infrastructure
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Image 4: Meditation Hall */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/ppt/image4.jpeg" alt="Meditation Hall & Glass Altar" fill className="object-cover" />
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Meditation Hall & Glass Altar</h3>
                    <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                      Spacious meditation hall featuring a glass-covered Altar and renovated stage area for collective Havans, pujas, and meditation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image 6: Footsoaking Area */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/ppt/image6.png" alt="Collective Footsoaking Area" fill className="object-cover" />
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Collective Footsoaking Area</h3>
                    <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                      Dedicated collective footsoaking shed equipped for evening element treatment sessions to soothe and clear subtle channels.
                    </p>
                  </div>
                </div>
              </div>

              {/* Newly Constructed Health Centre */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/health-centre-main.jpg" alt="Newly Constructed Health Centre Building" fill className="object-cover" />
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Newly Constructed Health Centre</h3>
                    <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                      Completed main Health Centre facility featuring ground floor consultation rooms and doctor accommodation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Visit the Centre Section (Placed above Share Your Experience) */}
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
                  className="inline-block text-center text-xs font-semibold px-4 py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-all w-full rounded-md uppercase tracking-wider"
                >
                  OPEN IN GOOGLE MAPS
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Experience Reviews Section (Placed below Visit the Centre, if enabled by Admin) */}
      {settings.reviewsEnabled && (
        <section id="reviews" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-warm-gray scroll-mt-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">Sahaja Yogi Feedback</p>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
                Share Your <span className="font-semibold">Experience</span>
              </h2>
            </div>

            <ReviewForm />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-warm-gray py-10 px-8 bg-cream">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <span className="text-xs text-warm-charcoal/50">&copy; 2026 H.H. Shri Mataji Nirmala Devi Sahaja Yoga National Trust. All Rights Reserved.</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-warm-charcoal/50 justify-center">
            <Link href="/" prefetch={true} className="hover:text-saffron transition-colors">Home</Link>
            <Link href="/sessions" prefetch={true} className="hover:text-saffron transition-colors">Sessions</Link>
            <Link href="/book" prefetch={true} className="hover:text-saffron transition-colors">Register for Session</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
