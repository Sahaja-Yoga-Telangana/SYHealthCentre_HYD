import { NextResponse } from 'next/server';
import { seedDatabase } from '@/app/admin/actions';

export async function GET() {
  const result = await seedDatabase();
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with stay dates, registrations, and reviews.',
    });
  } else {
    return NextResponse.json(
      { success: false, error: result.error || 'Seeding failed' },
      { status: 500 }
    );
  }
}
