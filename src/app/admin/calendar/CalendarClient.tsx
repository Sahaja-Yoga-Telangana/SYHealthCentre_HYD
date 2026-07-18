'use client';

import React, { useState } from 'react';

interface RegistrationItem {
  id: string;
  mrdNumber: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  checkInStatus: string;
  status: string;
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
    instructor: string;
  };
  billing?: {
    samarpanAmount: number;
    paymentMode: string;
    paymentStatus: string;
    transactionId?: string;
  };
}

interface DoctorItem {
  id: string;
  name: string;
}

interface CalendarClientProps {
  initialRegistrations: RegistrationItem[];
  doctors: DoctorItem[];
}

export default function CalendarClient({ initialRegistrations, doctors }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get start day of month (0 = Sunday, 1 = Monday, etc.)
  // We align to start with Monday: (day + 6) % 7
  const startDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  // Filter registrations by doctor
  const getFilteredRegs = (regs: RegistrationItem[]) => {
    if (selectedDoctor === 'all') return regs;
    return regs.filter((r) => r.session.instructor.toLowerCase().includes(selectedDoctor.toLowerCase()));
  };

  // Check if a registration matches a specific calendar date (day, month, year)
  const getRegsForDate = (day: number) => {
    const regs = initialRegistrations.filter((r) => {
      if (!r.session.date) return false;
      const d = new Date(r.session.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
    return getFilteredRegs(regs);
  };

  const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Selected date list for sidebar
  const selectedDateRegs = selectedDate
    ? initialRegistrations.filter((r) => {
        if (!r.session.date) return false;
        const d = new Date(r.session.date);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const filteredSelectedDateRegs = getFilteredRegs(selectedDateRegs);

  const handlePrint = () => {
    if (!selectedDate) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = selectedDate.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const rows = filteredSelectedDateRegs.map((reg) => `
      <tr style="border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">
        <td style="padding: 8px;">${reg.mrdNumber}</td>
        <td style="padding: 8px; font-weight: bold;">${reg.name}</td>
        <td style="padding: 8px;">${reg.age} / ${reg.gender}</td>
        <td style="padding: 8px;">${reg.phone}</td>
        <td style="padding: 8px; font-weight: bold; color: ${reg.billing?.paymentStatus === 'Outstanding' ? '#dc2626' : '#16a34a'}">
          ${reg.billing?.paymentStatus || 'Outstanding'}
        </td>
        <td style="padding: 8px;">${reg.checkInStatus}</td>
        <td style="padding: 8px;">${reg.session.instructor}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Seeker Stays List - ${formattedDate}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { border-bottom: 2px solid #333; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <h2 style="font-weight: 300; letter-spacing: 0.05em; text-transform: uppercase;">SAHAJA YOGA RESEARCH & HEALTH CENTRE</h2>
          <h3 style="font-weight: 400; color: #666; margin-top: -10px;">DAILY BOOKINGS DIRECTORY</h3>
          <hr style="border: 0; border-top: 1px solid #ccc;"/>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Doctor / Filter:</strong> ${selectedDoctor === 'all' ? 'All Schedules' : selectedDoctor}</p>
          <p><strong>Total Appointments:</strong> ${filteredSelectedDateRegs.length} Seekers</p>
          <table>
            <thead>
              <tr>
                <th>MRD Number</th>
                <th>Seeker Name</th>
                <th>Age/Gender</th>
                <th>Phone</th>
                <th>Samarpan Status</th>
                <th>Queue Check-In</th>
                <th>Doctor Incharge</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #aaa;">No stay bookings recorded for this day.</td></tr>'}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
      
      {/* Calendar Area */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-light tracking-wide uppercase text-neutral-900">
              {MONTH_NAMES[month]} {year}
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 border border-neutral-200 hover:border-neutral-950 transition-colors text-xs font-semibold"
              >
                ←
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 border border-neutral-200 hover:border-neutral-950 transition-colors text-xs font-semibold"
              >
                →
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Physician:</span>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="text-xs p-1.5 border border-neutral-200 bg-neutral-50 focus:outline-none flex-1 sm:flex-initial"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-t border-l border-neutral-200 text-neutral-600">
          
          {/* Weekday headers */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="p-3 text-center border-b border-r border-neutral-200 text-[10px] font-bold tracking-wider text-neutral-400 bg-neutral-50/50"
            >
              {day}
            </div>
          ))}

          {/* Empty padding cells for start week offset */}
          {Array.from({ length: startDayIndex }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="p-3 border-b border-r border-neutral-100 bg-neutral-50/10 min-h-[90px]"
            />
          ))}

          {/* Calendar Day Cells */}
          {Array.from({ length: totalDays }).map((_, index) => {
            const dayNum = index + 1;
            const dayRegs = getRegsForDate(dayNum);
            const bookingCount = dayRegs.length;
            
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            const isSelected =
              selectedDate &&
              dayNum === selectedDate.getDate() &&
              month === selectedDate.getMonth() &&
              year === selectedDate.getFullYear();

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                className={`p-2 border-b border-r border-neutral-200 min-h-[90px] flex flex-col justify-between transition-all cursor-pointer hover:bg-neutral-50/70 select-none ${
                  isSelected ? 'bg-neutral-50 border-double border-2 border-neutral-950 z-10' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-none ${
                      isToday ? 'bg-neutral-900 text-white' : 'text-neutral-500'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {bookingCount > 0 && (
                  <div className="space-y-1">
                    <div className={`px-1.5 py-0.5 border text-[9px] font-bold text-center tracking-wider block uppercase ${
                      bookingCount > 40
                        ? 'border-neutral-900 bg-neutral-900 text-white animate-pulse'
                        : 'border-neutral-200 text-neutral-600 bg-neutral-50'
                    }`}>
                      {bookingCount} Stays
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Details Panel */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6 sticky top-24">
        
        {/* Panel Header */}
        <div className="border-b border-neutral-100 pb-3 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800">
              Stay Directory List
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {selectedDate ? selectedDate.toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : 'No Date Selected'}
            </p>
          </div>
          {selectedDate && filteredSelectedDateRegs.length > 0 && (
            <button
              onClick={handlePrint}
              className="text-[9px] font-bold border border-neutral-900 px-2.5 py-1 text-neutral-900 uppercase hover:bg-neutral-50 tracking-wider"
            >
              PRINT
            </button>
          )}
        </div>

        {selectedDate ? (
          <div className="space-y-4">
            
            {/* Summary statistics bar */}
            <div className="grid grid-cols-2 gap-4 border bg-neutral-50 border-neutral-200 p-3 text-center">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">Appointed Stays</span>
                <span className="text-base font-bold font-mono text-neutral-800">{filteredSelectedDateRegs.length}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">Capacity Status</span>
                <span className={`text-xs font-bold uppercase ${filteredSelectedDateRegs.length >= 45 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                  {filteredSelectedDateRegs.length} / 50 Max
                </span>
              </div>
            </div>

            {/* List */}
            {filteredSelectedDateRegs.length === 0 ? (
              <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
                No stays booked for this physician or date.
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredSelectedDateRegs.map((reg) => {
                  const hasOutstanding = reg.billing?.paymentStatus === 'Outstanding';
                  return (
                    <div key={reg.id} className="p-3 border border-neutral-200 space-y-2 hover:border-neutral-950 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{reg.name}</p>
                          <p className="text-[9px] font-mono text-neutral-400 mt-0.5">{reg.mrdNumber}</p>
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 border text-[8px] font-bold tracking-wider uppercase ${
                          hasOutstanding
                            ? 'border-red-200 bg-red-50 text-red-600 animate-pulse'
                            : 'border-green-200 bg-green-50 text-green-600'
                        }`}>
                          {hasOutstanding ? 'Outstanding' : 'Paid'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-neutral-500 grid grid-cols-2 gap-y-1 gap-x-2 font-light">
                        <span>Age/Gender: <strong>{reg.age} yrs / {reg.gender}</strong></span>
                        <span>Phone: <strong>{reg.phone}</strong></span>
                        <span>Check-In: <strong>{reg.checkInStatus}</strong></span>
                        <span>Physician: <strong className="text-neutral-700 font-medium">{reg.session.instructor}</strong></span>
                        {reg.billing?.transactionId && (
                          <span className="col-span-2">UPI Transaction ID: <strong className="font-mono text-neutral-800">{reg.billing.transactionId}</strong></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
            Select a day from the grid to view detailed seeker stay registrations and printable lists.
          </p>
        )}
      </div>
    </div>
  );
}
