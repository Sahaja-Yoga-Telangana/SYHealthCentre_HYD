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

      {/* 1. Hero Section */}
      <section id="hero" className="relative h-[65vh] sm:h-[75vh] lg:h-[85vh] scroll-mt-24">
        <HeroCarousel />
        
        {/* Clean Hero Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end z-20 px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 pointer-events-none">
          <div className="max-w-3xl space-y-3 pointer-events-auto">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-[3px] bg-saffron rounded-full"></div>
              <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-saffron font-bold [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
                National Sahaja Yoga Resource Centre
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.9)]">
              Health Centre <span className="font-light text-cream">Hyderabad</span>
            </h1>
            <div className="pt-2">
              <Link
                href="/book"
                prefetch={true}
                className="inline-block text-xs sm:text-sm font-bold tracking-wider px-8 py-3.5 bg-saffron text-white hover:bg-saffron-dark transition-all rounded-md shadow-lg uppercase"
              >
                Register for Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Combined Divine Approval & Foundation Section */}
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
                Spanning 3 acres at Nirmal Nagar, Hyderabad, Telangana, this Resource Centre and Health Centre operates under the divine blessings of Shri Mataji to provide vibratory diagnostics, chakra clearance, and collective meditation.
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Image 4: Meditation Hall */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/ppt/image4.jpeg" alt="Meditation Hall & Glass Altar" fill className="object-cover" />
                  <span className="absolute top-2 right-2 bg-saffron text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    In Construction
                  </span>
                </div>
                <div className="p-4 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Meditation Hall & Glass Altar</h3>
                    <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                      Spacious meditation hall featuring a glass-covered Altar and renovated stage area for collective Havans, pujas, and meditation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image 6: Footsoaking Area */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/ppt/image6.png" alt="Collective Footsoaking Area" fill className="object-cover" />
                </div>
                <div className="p-4 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Collective Footsoaking Area</h3>
                    <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                      Dedicated collective footsoaking shed equipped for evening element treatment sessions to soothe and clear subtle channels.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image 7: Shoebeat Ground */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/ppt/image7.png" alt="Shoebeat Ground & Open Lawn" fill className="object-cover" />
                </div>
                <div className="p-4 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Shoebeat Ground & Open Lawn</h3>
                    <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                      Open ground area specified for collective shoebeating and nature clearing surrounded by natural greenery and trees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Constructed Health Centre Card: Updated to health-centre-main.jpg */}
              <div className="bg-cream border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
                <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                  <Image src="/images/health-centre-main.jpg" alt="Constructed Health Centre Building" fill className="object-cover" />
                  <span className="absolute top-2 right-2 bg-sage text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    Constructed Building
                  </span>
                </div>
                <div className="p-4 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-teal-dark">Constructed Health Centre</h3>
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

      {/* 3. Upcoming Health Sessions Section */}
      <section id="sessions" className="py-16 px-4 sm:px-6 lg:px-8 bg-cream-dark scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs tracking-[0.3em] uppercase text-saffron font-semibold">Upcoming Health Sessions</p>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-teal-dark">
              Register for a <span className="font-semibold">Session</span>
            </h2>
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
                        <strong className="font-semibold text-warm-charcoal">Doctor:</strong> {sess.instructor}
                      </p>
                      <p>
                        <strong className="font-semibold text-warm-charcoal">Date:</strong>{' '}
                        {new Date(sess.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p>
                        <strong className="font-semibold text-warm-charcoal">Seats Left:</strong>{' '}
                        <span className={isFull ? 'text-red-500 font-bold' : 'text-teal font-bold'}>
                          {remaining}
                        </span>{' '}
                        / {sess.maxParticipants}
                      </p>
                    </div>

                    <div className="pt-2">
                      {isFull ? (
                        <button
                          disabled
                          className="w-full text-center text-xs font-bold uppercase tracking-wider py-2.5 bg-warm-gray text-warm-charcoal/40 rounded-md cursor-not-allowed"
                        >
                          Session Full
                        </button>
                      ) : (
                        <Link
                          href={`/book?sessionId=${sess._id.toString()}`}
                          className="block text-center text-xs font-bold uppercase tracking-wider py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm"
                        >
                          Select & Register →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-warm-gray rounded-2xl p-10 text-center space-y-3 shadow-sm max-w-lg mx-auto">
              <div className="w-12 h-12 bg-saffron/10 text-saffron rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                !
              </div>
              <h3 className="text-base font-semibold text-teal-dark">No Active Sessions Scheduled</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                There are no active health sessions scheduled at this moment. Please check back later or contact our desk.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Experience Reviews Section (if enabled by Admin) */}
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
