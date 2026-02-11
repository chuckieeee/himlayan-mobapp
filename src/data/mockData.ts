// =====================================================
// LEGACY MOCK DATA
// This file contains mock data for development/testing
// Real data will come from the backend API via services
// =====================================================

// Export new database types for compatibility
export type { User, Plot, BurialRecord, GraveDetails, PlotWithBurial } from '@/types/database';

// Legacy User interface (for backwards compatibility)
export interface LegacyUser {
  id: string;
  username: string;
  role: 'customer' | 'staff' | 'admin';
  name: string;
  email: string;
}

export const mockUsers: LegacyUser[] = [
  {
    id: '1',
    username: 'visitor1',
    role: 'customer',
    name: 'Juan Dela Cruz',
    email: 'juan@email.com',
  },
  {
    id: '2',
    username: 'staff1',
    role: 'staff',
    name: 'Maria Santos',
    email: 'staff@cemetery.com',
  },
  {
    id: '3',
    username: 'admin1',
    role: 'admin',
    name: 'Pedro Reyes',
    email: 'admin@cemetery.com',
  },
];

// Legacy Grave interface (for backwards compatibility)
export interface Grave {
  id: string;
  lotNumber: string;
  deceasedName: string;
  birthDate: string;
  deathDate: string;
  burialDate: string;
  location: {
    latitude: number;
    longitude: number;
  };
  section: string;
  qrCode: string;
  familyContact?: string;
}

export const mockGraves: Grave[] = [
  {
    id: '1',
    lotNumber: 'LOT-001-A',
    deceasedName: 'Jose Rizal Monument',
    birthDate: '1861-06-19',
    deathDate: '1896-12-30',
    burialDate: '1896-12-30',
    location: { latitude: 14.6760, longitude: 121.0437 },
    section: 'Heritage Section A',
    qrCode: 'QR-LOT-001-A',
    familyContact: '+63 917 123 4567',
  },
  {
    id: '2',
    lotNumber: 'LOT-002-B',
    deceasedName: 'Andres Bonifacio Monument',
    birthDate: '1863-11-30',
    deathDate: '1897-05-10',
    burialDate: '1897-05-10',
    location: { latitude: 14.6765, longitude: 121.0440 },
    section: 'Heritage Section B',
    qrCode: 'QR-LOT-002-B',
    familyContact: '+63 917 234 5678',
  },
  {
    id: '3',
    lotNumber: 'LOT-003-C',
    deceasedName: 'Apolinario Mabini Memorial',
    birthDate: '1864-07-23',
    deathDate: '1903-05-13',
    burialDate: '1903-05-15',
    location: { latitude: 14.6770, longitude: 121.0445 },
    section: 'Heritage Section C',
    qrCode: 'QR-LOT-003-C',
    familyContact: '+63 917 345 6789',
  },
  {
    id: '4',
    lotNumber: 'LOT-004-D',
    deceasedName: 'Emilio Aguinaldo Tribute',
    birthDate: '1869-03-22',
    deathDate: '1964-02-06',
    burialDate: '1964-02-08',
    location: { latitude: 14.6755, longitude: 121.0450 },
    section: 'Heritage Section D',
    qrCode: 'QR-LOT-004-D',
    familyContact: '+63 917 456 7890',
  },
];

// Mock Payment Data
export interface Payment {
  id: string;
  userId: string;
  type: 'burial' | 'reservation' | 'maintenance';
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  description: string;
}

export const mockPayments: Payment[] = [
  {
    id: 'PAY-001',
    userId: '1',
    type: 'maintenance',
    amount: 5000,
    status: 'paid',
    dueDate: '2025-12-31',
    description: 'Annual maintenance fee',
  },
  {
    id: 'PAY-002',
    userId: '1',
    type: 'reservation',
    amount: 15000,
    status: 'pending',
    dueDate: '2026-03-15',
    description: 'Plot reservation deposit',
  },
];

// Mock Announcement Data
export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  author: string;
  priority: 'high' | 'medium' | 'low';
}

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'Cemetery Hours Update',
    message: 'Cemetery visiting hours are now 6:00 AM - 6:00 PM daily.',
    date: '2026-01-15',
    author: 'Admin Office',
    priority: 'high',
  },
  {
    id: 'ANN-002',
    title: 'All Saints Day Schedule',
    message: 'Extended hours during Undas week: October 28 - November 2.',
    date: '2026-01-10',
    author: 'Admin Office',
    priority: 'medium',
  },
  {
    id: 'ANN-003',
    title: 'New QR Code Installation',
    message: 'QR codes have been installed on all heritage monuments.',
    date: '2026-01-05',
    author: 'Staff Office',
    priority: 'low',
  },
];

// Mock Feedback Data
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  message: string;
  type: 'inquiry' | 'feedback' | 'complaint';
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export const mockFeedback: Feedback[] = [
  {
    id: 'FB-001',
    userId: '1',
    userName: 'Juan Dela Cruz',
    message: 'How can I reserve a plot for my family?',
    type: 'inquiry',
    date: '2026-01-20',
    status: 'pending',
  },
  {
    id: 'FB-002',
    userId: '1',
    userName: 'Ana Garcia',
    message: 'The QR code at lot 15 is not working properly.',
    type: 'complaint',
    date: '2026-01-18',
    status: 'reviewed',
  },
  {
    id: 'FB-003',
    userId: '1',
    userName: 'Carlos Mendoza',
    message: 'Excellent navigation system! Very helpful.',
    type: 'feedback',
    date: '2026-01-17',
    status: 'resolved',
  },
];

// Mock Record Data
export interface Record {
  id: string;
  lotNumber: string;
  ownerName: string;
  status: 'occupied' | 'available' | 'reserved';
  lastUpdated: string;
  notes: string;
}

export const mockRecords: Record[] = [
  {
    id: 'REC-001',
    lotNumber: 'LOT-001-A',
    ownerName: 'Rizal Family',
    status: 'occupied',
    lastUpdated: '2026-01-15',
    notes: 'Heritage monument - no modifications allowed',
  },
  {
    id: 'REC-002',
    lotNumber: 'LOT-005-E',
    ownerName: 'Santos Family',
    status: 'reserved',
    lastUpdated: '2026-01-10',
    notes: 'Reservation expires March 2026',
  },
  {
    id: 'REC-003',
    lotNumber: 'LOT-010-F',
    ownerName: 'Available',
    status: 'available',
    lastUpdated: '2026-01-01',
    notes: 'Prime location near main entrance',
  },
];

// Mock Report Data
export interface Report {
  id: string;
  title: string;
  date: string;
  type: 'visitor' | 'plot' | 'payment' | 'maintenance';
  summary: string;
  data: any;
}

export const mockReports: Report[] = [
  {
    id: 'REP-001',
    title: 'Daily Visitor Report',
    date: '2026-01-21',
    type: 'visitor',
    summary: 'Total visitors: 142',
    data: {
      totalVisitors: 142,
      peakHours: '10:00 AM - 2:00 PM',
      mostVisited: 'Heritage Section A',
    },
  },
  {
    id: 'REP-002',
    title: 'Available Lots Report',
    date: '2026-01-20',
    type: 'plot',
    summary: 'Available plots: 45 / Reserved: 23',
    data: {
      available: 45,
      occupied: 312,
      reserved: 23,
      total: 380,
    },
  },
  {
    id: 'REP-003',
    title: 'Payment Collection Report',
    date: '2026-01-19',
    type: 'payment',
    summary: 'Total collected: ₱125,000',
    data: {
      totalCollected: 125000,
      pending: 45000,
      overdue: 15000,
    },
  },
];
