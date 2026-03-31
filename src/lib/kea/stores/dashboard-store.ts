'use client';

import { create } from 'zustand';
import type { Alert, ProgressSnapshot } from '@/types/database';

interface DashboardState {
  alerts: Alert[];
  progressSnapshots: ProgressSnapshot[];
  selectedTrackId: string | null;
  setAlerts: (alerts: Alert[]) => void;
  setProgressSnapshots: (snapshots: ProgressSnapshot[]) => void;
  setSelectedTrackId: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  alerts: [],
  progressSnapshots: [],
  selectedTrackId: null,
  setAlerts: (alerts) => set({ alerts }),
  setProgressSnapshots: (progressSnapshots) => set({ progressSnapshots }),
  setSelectedTrackId: (selectedTrackId) => set({ selectedTrackId }),
}));
