import React from 'react';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import Bed from '@/models/Bed';
import '@/models/User';
import RoomForm from './RoomForm';

export const revalidate = 0; // Disable cache to reflect room adjustments in real-time

export default async function AdminRoomsPage() {
  let rooms: any[] = [];
  let bedsByRoom: { [roomId: string]: any[] } = {};
  let errorMsg = '';

  try {
    await dbConnect();
    
    // Fetch rooms
    rooms = await Room.find({}).sort({ roomNumber: 1 });

    // Fetch beds with occupied user details
    const allBeds = await Bed.find({})
      .populate('occupiedBy', 'name email contactNumber')
      .sort({ bedNumber: 1 });

    // Group beds by room
    for (const bed of allBeds) {
      const roomIdStr = bed.roomId.toString();
      if (!bedsByRoom[roomIdStr]) {
        bedsByRoom[roomIdStr] = [];
      }
      bedsByRoom[roomIdStr].push(bed);
    }
  } catch (error: any) {
    console.error('Error fetching rooms/beds:', error);
    errorMsg = error.message || 'Failed to fetch rooms and beds data.';
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">INFRASTRUCTURE MANAGEMENT</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Monitor room allocations, review real-time bed occupancy, and register new facilities.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-mono">
          SYSTEM ERROR: {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rooms Listing */}
        <div className="lg:col-span-2 space-y-6">
          {rooms.length === 0 ? (
            <div className="border border-neutral-200 p-8 bg-white text-center text-xs text-neutral-400">
              No rooms or dormitories defined. Complete the form to create your physical layout.
            </div>
          ) : (
            rooms.map((room) => {
              const beds = bedsByRoom[room._id.toString()] || [];
              const occupiedCount = beds.filter((b) => b.occupied).length;
              const occupancyPercentage = beds.length > 0 ? (occupiedCount / beds.length) * 100 : 0;

              return (
                <div key={room._id.toString()} className="border border-neutral-200 bg-white p-6 space-y-4">
                  {/* Room Meta details */}
                  <div className="flex justify-between items-baseline border-b border-neutral-100 pb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                        {room.category} &bull; Capacity: {room.totalBeds} Beds
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-medium">
                        {occupiedCount} / {room.totalBeds} Occupied
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        ({occupancyPercentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Bed Grid Visualizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {beds.map((bed) => (
                      <div
                        key={bed._id.toString()}
                        className={`border p-3 text-xs flex flex-col justify-between space-y-2 transition-all ${
                          bed.occupied
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-neutral-800">{bed.bedNumber.split(' - ')[1] || bed.bedNumber}</span>
                          <span
                            className={`inline-block px-1.5 py-0.2 border text-[8px] font-bold uppercase tracking-wider ${
                              bed.occupied
                                ? 'border-neutral-950 bg-neutral-950 text-white'
                                : 'border-neutral-200 text-neutral-400'
                            }`}
                          >
                            {bed.occupied ? 'Occupied' : 'Available'}
                          </span>
                        </div>

                        {bed.occupied ? (
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Occupant</p>
                            <p className="font-medium text-neutral-900 truncate">{bed.occupiedBy?.name || 'Yogi Guest'}</p>
                            <p className="text-[9px] text-neutral-500 font-mono">{bed.occupiedBy?.contactNumber || 'N/A'}</p>
                          </div>
                        ) : (
                          <div className="text-[10px] text-neutral-300 italic">Ready for assignment</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Room Form */}
        <div className="lg:col-span-1">
          <RoomForm />
        </div>
      </div>
    </div>
  );
}
