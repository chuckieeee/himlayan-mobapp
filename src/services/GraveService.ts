import { apiRequest, API_ENDPOINTS, getErrorMessage } from '@/config/api';
import type {
  GraveDetails,
  BurialRecord,
  Plot,
  PlotWithBurial,
  PlotSummary,
  SearchResponse,
  PaginatedResponse,
  CreateBurialRecordRequest,
  UpdateBurialRecordRequest,
  QRCode,
} from '@/types/database';

export class GraveService {
  /**
   * Get all graves (plots with burial records)
   */
  static async getAllGraves(): Promise<PlotWithBurial[]> {
    try {
      const response = await apiRequest<{ data: PlotWithBurial[] }>(
        API_ENDPOINTS.PLOT_SUMMARY
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching graves:', getErrorMessage(error));
      return [];
    }
  }

  /**
   * Search graves by deceased name
   */
  static async searchGravesByName(query: string): Promise<GraveDetails[]> {
    try {
      const response = await apiRequest<SearchResponse>(
        `${API_ENDPOINTS.SEARCH_BY_NAME}?query=${encodeURIComponent(query)}`
      );
      return response.results || response.data || [];
    } catch (error) {
      console.error('Error searching by name:', getErrorMessage(error));
      return [];
    }
  }

  /**
   * Search graves by plot number
   */
  static async searchGravesByPlotNumber(
    plotNumber: string
  ): Promise<GraveDetails[]> {
    try {
      const response = await apiRequest<SearchResponse>(
        `${API_ENDPOINTS.SEARCH_BY_PLOT}?query=${encodeURIComponent(plotNumber)}`
      );
      return response.results || response.data || [];
    } catch (error) {
      console.error('Error searching by plot number:', getErrorMessage(error));
      return [];
    }
  }

  /**
   * Alias for searchGravesByPlotNumber (for backward compatibility)
   */
  static async searchGravesByLotNumber(
    lotNumber: string
  ): Promise<GraveDetails[]> {
    return this.searchGravesByPlotNumber(lotNumber);
  }

  /**
   * General search (searches both name and plot number)
   */
  static async search(query: string): Promise<GraveDetails[]> {
    try {
      const response = await apiRequest<SearchResponse>(
        `${API_ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}`
      );
      return response.results || response.data || [];
    } catch (error) {
      console.error('Error searching:', getErrorMessage(error));
      return [];
    }
  }

  /**
   * Get grave details by burial record ID
   */
  static async getGraveById(id: number): Promise<GraveDetails> {
    try {
      const response = await apiRequest<{ data: GraveDetails }>(
        API_ENDPOINTS.BURIAL_RECORD_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grave:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get grave by QR code
   */
  static async getGraveByQRCode(qrCode: string): Promise<GraveDetails> {
    try {
      const response = await apiRequest<{ data: GraveDetails }>(
        API_ENDPOINTS.QR_CODE_BY_CODE(qrCode)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grave by QR:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get plot by ID
   */
  static async getPlotById(id: number): Promise<PlotWithBurial> {
    try {
      const response = await apiRequest<{ data: PlotWithBurial }>(
        API_ENDPOINTS.PLOT_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching plot:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get available plots
   */
  static async getAvailablePlots(): Promise<Plot[]> {
    try {
      const response = await apiRequest<{ data: Plot[] }>(
        `${API_ENDPOINTS.PLOTS}?status=available`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching available plots:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get plots by status
   */
  static async getPlotsByStatus(
    status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  ): Promise<Plot[]> {
    try {
      const response = await apiRequest<{ data: Plot[] }>(
        `${API_ENDPOINTS.PLOTS}?status=${status}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching plots by status:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get plots by section
   */
  static async getPlotsBySection(section: string): Promise<Plot[]> {
    try {
      const response = await apiRequest<{ data: Plot[] }>(
        `${API_ENDPOINTS.PLOTS}?section=${encodeURIComponent(section)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching plots by section:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Create a new burial record
   */
  static async createBurialRecord(
    data: CreateBurialRecordRequest
  ): Promise<BurialRecord> {
    try {
      const response = await apiRequest<{ data: BurialRecord }>(
        API_ENDPOINTS.BURIAL_RECORDS,
        {
          method: 'POST',
          body: data,
        }
      );
      console.log('✅ Burial record created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Error creating burial record:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Update a burial record
   */
  static async updateBurialRecord(
    id: number,
    data: UpdateBurialRecordRequest
  ): Promise<BurialRecord> {
    try {
      const response = await apiRequest<{ data: BurialRecord }>(
        API_ENDPOINTS.BURIAL_RECORD_BY_ID(id),
        {
          method: 'PUT',
          body: data,
        }
      );
      console.log('✅ Burial record updated:', id);
      return response.data;
    } catch (error) {
      console.error('Error updating burial record:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Delete a burial record (soft delete)
   */
  static async deleteBurialRecord(id: number): Promise<void> {
    try {
      await apiRequest(API_ENDPOINTS.BURIAL_RECORD_BY_ID(id), {
        method: 'DELETE',
      });
      console.log('✅ Burial record deleted:', id);
    } catch (error) {
      console.error('Error deleting burial record:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get QR code for a burial record
   */
  static async getQRCode(burialRecordId: number): Promise<QRCode | null> {
    try {
      const response = await apiRequest<{ data: QRCode | null }>(
        `${API_ENDPOINTS.QR_CODES}?burial_record_id=${burialRecordId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching QR code:', getErrorMessage(error));
      return null;
    }
  }

  /**
   * Generate QR code for a burial record
   */
  static async generateQRCode(burialRecordId: number): Promise<QRCode> {
    try {
      const response = await apiRequest<{ data: QRCode }>(
        API_ENDPOINTS.QR_CODE_GENERATE(burialRecordId),
        {
          method: 'POST',
        }
      );
      console.log('✅ QR code generated for burial record:', burialRecordId);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', getErrorMessage(error));
      throw error;
    }
  }
}
