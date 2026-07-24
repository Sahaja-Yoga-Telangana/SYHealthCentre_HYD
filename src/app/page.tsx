import Image from 'next/image';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import HeroCarousel from '@/components/HeroCarousel';
import LogoutButton from '@/components/LogoutButton';
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

      {/* 1. Hero Section */}
      <section id="hero" className="relative h-[65vh] sm:h-[75vh] lg:h-[85vh] scroll-mt-24">
        <HeroCarousel />
        
        {/* Clean, Uncluttered Hero Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end z-20 px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 pointer-events-none">
          <div className="max-w-2xl space-y-3 pointer-events-auto">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-[3px] bg-saffron rounded-full"></div>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-saffron font-bold [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
                Nirmal Nagar, Telangana
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.9)]">
              Sahaja Yoga <br />
              <span className="font-bold text-cream">Health Centre Hyderabad</span>
            </h1>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/book"
                prefetch={true}
                className="inline-block text-xs sm:text-sm font-bold tracking-wider px-6 py-3 bg-saffron text-white hover:bg-saffron-dark transition-all rounded-md shadow-lg transform hover:-translate-y-0.5"
              >
                BOOK SESSION
              </Link>
              <Link
                href="/about"
                prefetch={true}
                className="inline-block text-xs sm:text-sm font-semibold tracking-wider px-6 py-3 bg-white/20 text-white border border-white/40 hover:bg-white/30 backdrop-blur-md transition-all rounded-md hover:border-white shadow-md"
              >
                ABOUT US →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upcoming Health Sessions Section */}
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
                    className={`bg-white border rounded-2xl p-6 space-y-4 transition-all hover:shadow-md ${
                      isFull ? 'border-warm-gray opacity-60' : 'border-warm-gray hover:border-saffron/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-teal-dark leading-snug">{sess.title}</h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${
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
                        <span>Dr. <strong className="text-warm-charcoal">{sess.instructor}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{new Date(sess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-warm-charcoal/30">•</span>
                        <span>{sess.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-warm-gray">
                      <div>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : remaining < 10 ? 'text-saffron' : 'text-sage'}`}>
                          {isFull ? 'FULLY BOOKED' : `${remaining} seats left`}
                        </span>
                        <span className="text-[10px] text-warm-charcoal/40 block font-mono">{sess.maxParticipants} total capacity</span>
                      </div>
                      <Link
                        href={isFull ? '#' : `/book?sessionId=${sess._id.toString()}`}
                        prefetch={true}
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
            <div className="text-center py-12 bg-white border border-warm-gray rounded-2xl">
              <p className="text-sm text-warm-charcoal/50 font-light">No active sessions currently scheduled. Please check back soon.</p>
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              href="/sessions"
              prefetch={true}
              className="inline-block text-xs font-semibold text-teal hover:text-teal-dark border border-teal px-6 py-2.5 rounded-md transition-colors"
            >
              VIEW ALL SESSIONS (UPCOMING & PAST) →
            </Link>
          </div>
        </div>
      </section>

      {/* Share Experience Review Form (If feature-flagged or directly accessible) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-cream border-t border-warm-gray">
        <div className="max-w-xl mx-auto space-y-4">
          <ReviewForm />
        </div>
      </section>

      {/* 3. Plan Your Visit / Contact Section */}
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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6">
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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-full aspect-[4/3] bg-warm-charcoal/20 border border-white/10 relative overflow-hidden rounded-xl">
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
                  className="inline-block text-center text-xs font-semibold px-4 py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-all w-full rounded-md shadow-md"
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
            <Link href="/" prefetch={true} className="hover:text-saffron transition-colors">Home</Link>
            <Link href="/about" prefetch={true} className="hover:text-saffron transition-colors">About</Link>
            <Link href="/sessions" prefetch={true} className="hover:text-saffron transition-colors">Sessions</Link>
            <Link href="/book" prefetch={true} className="hover:text-saffron transition-colors">Register</Link>
            <Link href="/login" prefetch={true} className="hover:text-saffron transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
