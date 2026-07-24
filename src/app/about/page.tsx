import Image from 'next/image';
import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';
import shriMatajiPortrait from '../../../ShriMatajisPictures/PhotoSM-206.jpg';

export const revalidate = 0;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans">
      {/* Universal Shared Header */}
      <HeaderNav />

      {/* Hero Banner */}
      <section className="bg-teal-dark text-white py-16 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">National Trust Resource Centre</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            Sahaja Yoga <span className="font-semibold text-cream">Health Centre & Resource Centre</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Approved by H.H. Shri Mataji Nirmala Devi — A 3-acre sanctuary dedicated to vibratory research, subtle system balancing, and spiritual ascent in Nirmal Nagar, Hyderabad.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Founder & Spiritual Foundation */}
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-center bg-white border border-warm-gray rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-warm-gray bg-cream-dark shadow-sm">
            <Image
              src={shriMatajiPortrait}
              alt="H.H. Shri Mataji Nirmala Devi"
              fill
              className="object-cover object-[20%_center]"
              sizes="(max-width: 768px) 100vw, 35vw"
              priority
            />
          </div>
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-saffron">Divine Guidance</span>
              <h2 className="text-2xl font-light text-teal-dark mt-1">
                Approved by <span className="font-semibold">H.H. Shri Mataji Nirmala Devi</span>
              </h2>
            </div>
            <div className="border-l-2 border-saffron pl-4 py-1 italic text-sm text-warm-charcoal/70 font-light">
              &quot;The concept of Sahaja Yoga Resource Centre & Health Centre was envisioned and approved by Param Pujya Shri Mataji Nirmala Devi to benefit all seekers.&quot;
            </div>
            <p className="text-sm text-warm-charcoal/70 font-light leading-relaxed">
              Born on March 21, 1923, Shri Mataji discovered the spontaneous method of mass Kundalini awakening (Sahaja Yoga) on May 5, 1970. She established the subtle-system balancing techniques that form the foundation of treatments at this Health Centre.
            </p>
          </div>
        </div>

        {/* 3-Acre Resource Centre Infrastructure Details (from PPTX) */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">Resource Centre</span>
            <h2 className="text-2xl sm:text-3xl font-light text-teal-dark">
              Infrastructure
            </h2>
            <p className="text-sm text-warm-charcoal/60 max-w-xl mx-auto font-light">
              Comprehensive facilities designed specifically for Sahaja Yoga collective clearing and medical evaluation on a 3-acre campus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center text-teal font-bold text-lg">01</div>
              <h3 className="text-base font-semibold text-teal-dark">Meditation Hall & Glass Altar</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                Spacious meditation hall featuring a glass-covered Altar and renovated stage area for collective Havans, pujas, and meditation.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 bg-saffron/10 rounded-lg flex items-center justify-center text-saffron font-bold text-lg">02</div>
              <h3 className="text-base font-semibold text-teal-dark">Collective Footsoaking Area</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                Dedicated collective footsoak facilities equipped for multi-seeker evening clearing sessions to soothe the subtle channels.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center text-sage font-bold text-lg">03</div>
              <h3 className="text-base font-semibold text-teal-dark">Shoebeat Ground & Open Lawn</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                Open ground area specified for collective shoebeating and nature clearing surrounded by natural greenery and trees.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center text-teal font-bold text-lg">04</div>
              <h3 className="text-base font-semibold text-teal-dark">Ground & 1st Floor Chambers</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                Health Centre building comprising ground floor OPD treatment chambers and 1st floor accommodation rooms for consulting doctors.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 bg-saffron/10 rounded-lg flex items-center justify-center text-saffron font-bold text-lg">05</div>
              <h3 className="text-base font-semibold text-teal-dark">Kitchen & Dining Shed</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                In-house kitchen and covered dining shed providing Mahaprasad and wholesome vegetarian meals for visiting yogis and patients.
              </p>
            </div>

            <div className="bg-white border border-warm-gray rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center text-sage font-bold text-lg">06</div>
              <h3 className="text-base font-semibold text-teal-dark">Officially Named Govt Road</h3>
              <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light">
                Road officially named <strong className="font-semibold text-warm-charcoal">&quot;PARAM PUJYA SHRI MATAJI NIRMALA DEVI ROAD&quot;</strong> by Panchayat Raj Dept, Govt of Telangana.
              </p>
            </div>
          </div>
        </div>

        {/* Real PPT Images Showcase */}
        <div className="space-y-6 bg-white border border-warm-gray rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center space-y-1 border-b border-warm-gray pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-saffron">Photo Gallery</span>
            <h3 className="text-xl font-semibold text-teal-dark">Resource Centre & Campus Layout</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-warm-gray bg-cream-dark">
              <Image src="/images/ppt/image1.jpg" alt="Health Centre Design Layout" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-warm-gray bg-cream-dark">
              <Image src="/images/ppt/image7.png" alt="Health Centre Construction Progress" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-warm-gray bg-cream-dark">
              <Image src="/images/ppt/image6.png" alt="Health Centre Architecture Plan" fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* Historic Inauguration & Committee Information (from PDF & PPTX) */}
        <div className="bg-teal-dark text-white rounded-2xl p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">National Trust Committee</span>
            <h2 className="text-2xl sm:text-3xl font-light">
              H.H. Shri Mataji Nirmala Devi <span className="font-semibold text-cream">Sahaja Yoga National Trust</span>
            </h2>
            <p className="text-xs text-white/70 max-w-lg mx-auto font-light">
              Organized by the Sahaja Yoga Resource Centre Committee, Hyderabad, Telangana.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-xs text-saffron font-bold uppercase tracking-wider block">Vice Chairman</span>
              <p className="text-sm font-semibold text-white">Capt. Sohan Lal Bhalla</p>
              <span className="text-[10px] text-white/50 block font-mono">National Trust</span>
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-xs text-saffron font-bold uppercase tracking-wider block">State Coordinator</span>
              <p className="text-sm font-semibold text-white">Mr. Gouru Krishna</p>
              <span className="text-[10px] text-white/50 block font-mono">Telangana State</span>
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-xs text-saffron font-bold uppercase tracking-wider block">Trustee</span>
              <p className="text-sm font-semibold text-white">Mr. Madhusudhan Rao</p>
              <span className="text-[10px] text-white/50 block font-mono">Telangana Trustee</span>
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-xs text-saffron font-bold uppercase tracking-wider block">Executive Secretary</span>
              <p className="text-sm font-semibold text-white">Mr. Ramesh Kumar Gupta</p>
              <span className="text-[10px] text-white/50 block font-mono">National Trust</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white border border-warm-gray rounded-2xl p-8 space-y-4 shadow-sm">
          <h3 className="text-xl font-light text-teal-dark">Experience Healing at Nirmal Nagar</h3>
          <p className="text-xs text-warm-charcoal/60 max-w-md mx-auto font-light">
            Book an OPD consultation or stay session to experience vibratory diagnostics and subtle channel balancing.
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              className="inline-block text-xs font-bold uppercase tracking-wider px-8 py-3 bg-saffron text-white rounded-md hover:bg-saffron-dark transition-colors shadow-md"
            >
              REGISTER FOR SESSION NOW
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
