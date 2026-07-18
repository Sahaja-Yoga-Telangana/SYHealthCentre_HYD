import React from 'react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { createAdminAction, deleteAdminAction } from '../actions';
import AdminForm from './AdminForm';

export const revalidate = 0; // Fresh load

export default async function AdminsAdminPage() {
  let adminsList: any[] = [];

  try {
    await dbConnect();
    const admins = await User.find({ role: 'Admin' }).sort({ createdAt: 1 });
    adminsList = admins.map((a) => ({
      id: a._id.toString(),
      name: a.name,
      email: a.email,
      createdAt: a.createdAt?.toISOString() || '',
    }));
  } catch (error) {
    console.error('Error fetching admins list:', error);
  }

  // Inline server action to delete admin
  const handleDeleteAdmin = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await deleteAdminAction(id);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">ADMINISTRATORS</h1>
        <p className="text-xs text-neutral-400 mt-1">Manage system administrators, delegate permissions, and add new portal coordinators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Admins List */}
        <div className="border border-neutral-200 bg-white p-6 space-y-6">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
            System Administrators
          </h3>

          <div className="divide-y divide-neutral-200 text-xs">
            {adminsList.map((admin) => (
              <div key={admin.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-900">{admin.name}</p>
                  <p className="text-neutral-500 font-light font-mono break-all">{admin.email}</p>
                  <p className="text-[10px] text-neutral-400">Added on: {new Date(admin.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Prevent self deletion or empty admin list */}
                {adminsList.length > 1 && (
                  <form action={handleDeleteAdmin}>
                    <input type="hidden" name="id" value={admin.id} />
                    <button
                      type="submit"
                      className="w-full sm:w-auto text-[10px] font-semibold tracking-wider border border-red-200 text-red-500 px-3 py-1.5 hover:border-red-950 hover:bg-red-50 transition-colors"
                    >
                      REVOKE ACCESS
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Admin Form */}
        <div>
          <AdminForm />
        </div>
      </div>
    </div>
  );
}
