import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-200 py-6 px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50 relative">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-widest text-neutral-900">SAHAJA YOGA</span>
            <span className="text-xs text-neutral-500 tracking-wider">Research & Health Centre, Hyderabad</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
            <a href="#about" className="hover:text-neutral-500 transition-colors">About</a>
            <a href="#tariffs" className="hover:text-neutral-500 transition-colors">Tariffs</a>
            <a href="#subtle-system" className="hover:text-neutral-500 transition-colors">Subtle System</a>
            <a href="#contact" className="hover:text-neutral-500 transition-colors">Contact</a>
          </nav>
          <MobileNav />
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin" 
              className="hidden md:inline-block text-xs font-semibold px-4 py-2 border border-neutral-200 hover:border-neutral-900 transition-colors"
            >
              ADMIN
            </Link>
            <Link 
              href="/book" 
              className="text-xs font-semibold px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              BOOK NOW
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="py-20 px-8 border-b border-neutral-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 leading-tight">
            International Sahaja Yoga <br />
            <span className="font-normal">Research & Health Centre</span>
          </h1>
          <p className="text-xs tracking-widest uppercase text-neutral-400">Nirmal Nagari, Hyderabad</p>
          <div className="w-12 h-[1px] bg-neutral-400 mx-auto"></div>
          <p className="text-lg text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
            Welcome to a unique sanctuary of healing and peace, where scientific research meets ancient spiritual knowledge. 
            Our treatments utilize the power of <strong className="font-medium text-neutral-900">vibratory awareness</strong> and 
            Sahaja Yoga meditation, helping to cleanse, balance, and rejuvenate the subtle system.
          </p>
          <div className="pt-6">
            <Link 
              href="/book" 
              className="inline-block text-sm font-medium tracking-wider px-8 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              SCHEDULE A VISIT OR STAY
            </Link>
          </div>
        </div>
      </section>

      {/* Tariffs Section */}
      <section id="tariffs" className="py-20 px-8 border-b border-neutral-100 bg-neutral-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-light tracking-wider">TREATMENT & TARIFF SCHEME</h2>
            <p className="text-sm text-neutral-500">Eligibility, pricing, and services provided at the centre.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-neutral-200 bg-white">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 border-r border-neutral-200">Category</th>
                  <th className="p-4 border-r border-neutral-200">Description</th>
                  <th className="p-4 border-r border-neutral-200">Timings & Eligibility</th>
                  <th className="p-4">Tariff (INR)</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-neutral-200 text-neutral-600">
                <tr>
                  <td className="p-4 font-medium text-neutral-950 border-r border-neutral-200">OPD (Outpatient)</td>
                  <td className="p-4 border-r border-neutral-200">Consultation with a qualified doctor on vibratory diagnostic methods.</td>
                  <td className="p-4 border-r border-neutral-200">10:00 AM - 12:30 PM (Mon-Sat)<br /><span className="text-xs text-neutral-400">Req: 6+ months practicing</span></td>
                  <td className="p-4 font-mono font-medium text-neutral-950">₹50</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-950 border-r border-neutral-200">Day Stay</td>
                  <td className="p-4 border-r border-neutral-200">Day use facility including diagnostic checks, treatment sessions, and nutritious meals.</td>
                  <td className="p-4 border-r border-neutral-200">10:00 AM - 5:00 PM (Mon-Sat)<br /><span className="text-xs text-neutral-400">Req: 6+ months practicing</span></td>
                  <td className="p-4 font-mono font-medium text-neutral-950">₹400 / day</td>
                </tr>
                <tr className="bg-neutral-50/50">
                  <td className="p-4 font-medium text-neutral-950 border-r border-neutral-200" rowSpan={4}>IPD (Accommodation + Treatment)</td>
                  <td className="p-4 border-r border-neutral-200"><strong>Double Room (Single Occupant)</strong><br />Full board, individual treatments.</td>
                  <td className="p-4 border-r border-neutral-200" rowSpan={4}>Requires 24-hour admission<br /><span className="text-xs text-neutral-400">Req: 1+ year practicing</span></td>
                  <td className="p-4 border-b border-neutral-200 font-mono font-medium text-neutral-950">₹3,000 / day <span className="text-xs text-neutral-400">(All Nationalities)</span></td>
                </tr>
                <tr className="bg-neutral-50/50">
                  <td className="p-4 border-r border-neutral-200"><strong>Double Room (Shared Occupancy)</strong><br />Per adult rate, shared double room.</td>
                  <td className="p-4 border-b border-neutral-200 font-mono font-medium text-neutral-950">₹1,800 / day <span className="text-xs text-neutral-400">(Indian)</span><br />₹2,000 / day <span className="text-xs text-neutral-400">(Non-Indian)</span></td>
                </tr>
                <tr className="bg-neutral-50/50">
                  <td className="p-4 border-r border-neutral-200"><strong>Dormitory (Ladies &amp; Men&apos;s)</strong><br />Gender-separated large halls (Ladies: max 36, Men&apos;s: max 25).</td>
                  <td className="p-4 border-b border-neutral-200 font-mono font-medium text-neutral-950">₹1,000 / day <span className="text-xs text-neutral-400">(Indian)</span><br />₹1,500 / day <span className="text-xs text-neutral-400">(Non-Indian)</span></td>
                </tr>
                <tr className="bg-neutral-50/50">
                  <td className="p-4 border-r border-neutral-200"><strong>Family Room</strong><br />Private family room accommodating up to 4 adults.</td>
                  <td className="p-4 font-mono font-medium text-neutral-950">₹2,500 / day <span className="text-xs text-neutral-400">(Indian)</span><br />₹3,000 / day <span className="text-xs text-neutral-400">(Non-Indian)</span></td>
                </tr>
              </tbody>
            </table>
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
            <div className="border border-neutral-200 p-8 space-y-6">
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

            <div className="border border-neutral-200 p-8 space-y-6">
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
                  <div className="p-2 border border-neutral-100 bg-neutral-50">4. Anahat (Heart)</div>
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
                    International Sahaja Yoga Research & Health Centre<br />
                    Nirmal Nagari, Ghansimi Bazar,<br />
                    Hyderabad, Telangana - 500005, India
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">Phone Numbers</h4>
                  <p className="text-sm text-neutral-600 font-light">
                    +91 40 1234 5678 (OPD Desk)<br />
                    +91 98765 43210 (In-Patient Booking Helpdesk)
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
                Note: Patients must follow general Sahaja Yoga code of conduct.
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="border border-neutral-200 bg-white p-8 flex flex-col items-center justify-center text-center">
              <div className="space-y-4 w-full">
                <div className="w-full aspect-[4/3] bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-400 mb-2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs font-semibold tracking-widest uppercase text-neutral-900">Map representation</span>
                  <span className="text-xs text-neutral-500 font-light mt-1 max-w-[200px]">Nirmal Nagari Area, Near Ghansimi Bazar, Hyderabad</span>
                  <div className="w-full mt-4 border-t border-dashed border-neutral-300 pt-2 text-[10px] text-neutral-400">
                    Lat: 17.3850° N, Long: 78.4867° E
                  </div>
                </div>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block text-xs font-semibold px-4 py-2 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all w-full"
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
          <span>&copy; 2026 International Sahaja Yoga Research & Health Centre, Hyderabad. All Rights Reserved.</span>
          <div className="space-x-6">
            <a href="#about" className="hover:underline">About</a>
            <a href="#tariffs" className="hover:underline">Tariffs</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
