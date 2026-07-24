import Image from 'next/image';
import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';

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
        
        {/* Founder & Divine Approval (Image 3 from PPT) */}
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center bg-white border border-warm-gray rounded-2xl p-6 sm:p-10 shadow-sm">
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
              &quot;The concept of Sahaja Yoga Resource Centre & Health Centre was envisioned and approved by Param Pujya Shri Mataji Nirmala Devi to benefit all Sahaja Yogis and seekers.&quot;
            </div>
            <p className="text-sm text-warm-charcoal/70 font-light leading-relaxed">
              Spanning 3 acres at Nirmal Nagar, Hyderabad, Telangana, this Resource Centre and Health Centre operates under the divine blessings of Shri Mataji to provide vibratory diagnostics, chakra clearance, and collective meditation.
            </p>
          </div>
        </div>

        {/* Infrastructure Section (PPT Images Mapping) */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-saffron">Resource Centre Campus</span>
            <h2 className="text-2xl sm:text-3xl font-light text-teal-dark">
              Infrastructure
            </h2>
            <p className="text-sm text-warm-charcoal/60 max-w-xl mx-auto font-light">
              Comprehensive facilities designed specifically for Sahaja Yoga collective clearing and medical evaluation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Image 4: Meditation Hall */}
            <div className="bg-white border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
              <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                <Image src="/images/ppt/image4.jpeg" alt="Meditation Hall & Glass Altar" fill className="object-cover" />
                <span className="absolute top-2 right-2 bg-saffron text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  In Construction
                </span>
              </div>
              <div className="p-5 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-teal-dark">Meditation Hall & Glass Altar</h3>
                  <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                    Spacious meditation hall featuring a glass-covered Altar and renovated stage area for collective Havans, pujas, and meditation.
                  </p>
                </div>
              </div>
            </div>

            {/* Image 6: Footsoaking Area */}
            <div className="bg-white border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
              <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                <Image src="/images/ppt/image6.png" alt="Collective Footsoaking Area" fill className="object-cover" />
              </div>
              <div className="p-5 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-teal-dark">Collective Footsoaking Area</h3>
                  <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                    Dedicated collective footsoaking shed equipped for evening element treatment sessions to soothe and clear subtle channels.
                  </p>
                </div>
              </div>
            </div>

            {/* Image 7: Shoebeat Ground */}
            <div className="bg-white border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
              <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                <Image src="/images/ppt/image7.png" alt="Shoebeat Ground & Open Lawn" fill className="object-cover" />
              </div>
              <div className="p-5 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-teal-dark">Shoebeat Ground & Open Lawn</h3>
                  <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                    Open ground area specified for collective shoebeating and nature clearing surrounded by natural greenery and trees.
                  </p>
                </div>
              </div>
            </div>

            {/* Image 8: Layout Plan */}
            <div className="bg-white border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
              <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                <Image src="/images/ppt/image8.jpg" alt="Campus Layout Plan" fill className="object-cover" />
              </div>
              <div className="p-5 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-teal-dark">Resource Centre Master Layout</h3>
                  <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                    Proposed layout plan detailing the stage, meditation hall, kitchen shed, and health centre expansion.
                  </p>
                </div>
              </div>
            </div>

            {/* Image 9 & 10: Health Centre Construction */}
            <div className="bg-white border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
              <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                <Image src="/images/ppt/image9.jpeg" alt="Under Construction Health Centre" fill className="object-cover" />
                <span className="absolute top-2 right-2 bg-saffron text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  Phase 1 Construction
                </span>
              </div>
              <div className="p-5 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-teal-dark">Under Construction Chambers</h3>
                  <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                    Construction of 1st floor slab and OPD treatment chambers progressing to welcome Shri Dhanvantari.
                  </p>
                </div>
              </div>
            </div>

            {/* Image 11: Constructed Health Centre */}
            <div className="bg-white border border-warm-gray rounded-2xl overflow-hidden shadow-sm space-y-3 flex flex-col">
              <div className="relative aspect-[16/10] bg-cream-dark border-b border-warm-gray">
                <Image src="/images/ppt/image11.png" alt="Constructed Health Centre Building" fill className="object-cover" />
                <span className="absolute top-2 right-2 bg-sage text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  Constructed Building
                </span>
              </div>
              <div className="p-5 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-teal-dark">Constructed Health Centre</h3>
                  <p className="text-xs text-warm-charcoal/60 leading-relaxed font-light mt-1">
                    Completed main Health Centre facility featuring ground floor consultation rooms and doctor accommodation.
                  </p>
                </div>
              </div>
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
              BOOK SESSION NOW
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
