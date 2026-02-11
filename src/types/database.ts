// Database Models - matching backend schema

// =====================================================
// USER MODEL
// =====================================================
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: 'admin' | 'staff' | 'customer' | 'visitor';
  created_at: string;
  updated_at: string;
}

// =====================================================
// PLOT MODEL
// =====================================================
export interface Plot {
  id: number;
  plot_number: string;
  section: string | null;
  row_number: number | null;
  column_number: number | null;
  latitude: number;
  longitude: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =====================================================
// BURIAL RECORD MODEL
// =====================================================
export interface BurialRecord {
  id: number;
  plot_id: number;
  deceased_name: string;
  birth_date: string | null;
  death_date: string;
  burial_date: string;
  photo_url: string | null;
  obituary: string | null;
  notes: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =====================================================
// QR CODE MODEL
// =====================================================
export interface QRCode {
  id: number;
  burial_record_id: number;
  code: string;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PERSONAL ACCESS TOKEN MODEL (Laravel Sanctum)
// =====================================================
export interface PersonalAccessToken {
  id: number;
  tokenable_type: string;
  tokenable_id: number;
  name: string;
  token: string;
  abilities: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// VIEW: PLOT SUMMARY
// =====================================================
export interface PlotSummary {
  id: number;
  plot_number: string;
  section: string | null;
  row_number: number | null;
  column_number: number | null;
  latitude: number;
  longitude: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  deceased_name: string | null;
  burial_date: string | null;
  has_qr_code: 'Yes' | 'No';
}

// =====================================================
// COMBINED TYPES FOR APP USE
// =====================================================
export interface GraveDetails extends BurialRecord {
  plot: Plot;
  qr_code?: QRCode;
}

export interface PlotWithBurial extends Plot {
  burial_record?: BurialRecord;
  qr_code?: QRCode;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
  expires_at: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'staff';
}

// Plots
export interface CreatePlotRequest {
  plot_number: string;
  section?: string;
  row_number?: number;
  column_number?: number;
  latitude: number;
  longitude: number;
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
  notes?: string;
}

export interface UpdatePlotRequest extends Partial<CreatePlotRequest> {}

// Burial Records
export interface CreateBurialRecordRequest {
  plot_id: number;
  deceased_name: string;
  birth_date?: string;
  death_date: string;
  burial_date: string;
  photo_url?: string;
  obituary?: string;
  notes?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface UpdateBurialRecordRequest extends Partial<CreateBurialRecordRequest> {}

// QR Codes
export interface CreateQRCodeRequest {
  burial_record_id: number;
}

export interface QRCodeResponse {
  qr_code: QRCode;
  image_url: string; // Base64 or URL to QR code image
}

// Search
export interface SearchRequest {
  query: string;
  type?: 'name' | 'plot_number' | 'all';
}

export interface SearchResponse {
  results: GraveDetails[];
  total: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Error Response
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
