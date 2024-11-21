import { Suspense } from 'react';
import { SettingsClient } from './settings-client';
import { SettingsSkeleton } from '@/components/dashboard/settings-skeleton';
import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  try {
    const settings = await getSettings();

    return (
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsClient initialSettings={settings} />
      </Suspense>
    );
  } catch (error) {
    console.error('Settings error:', error);
    throw error;
  }
} 