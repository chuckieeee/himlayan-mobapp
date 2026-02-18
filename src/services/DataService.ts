import { apiRequest, API_ENDPOINTS, getErrorMessage } from '@/config/api';
import type {
  Plot,
  BurialRecord,
  PlotWithBurial,
  CreatePlotRequest,
  UpdatePlotRequest,
  CreateBurialRecordRequest,
  UpdateBurialRecordRequest,
  PaginatedResponse,
} from '@/types/database';

/**
 * DataService - Handles plot and burial record management
 * This is primarily for admin and staff operations
 */
export class DataService {
  // =====================================================
  // PLOT MANAGEMENT
  // =====================================================

  /**
   * Get all plots with pagination
   */
  static async getAllPlots(
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<Plot>> {
    try {
      const response = await apiRequest<PaginatedResponse<Plot>>(
        `${API_ENDPOINTS.PLOTS}?page=${page}&per_page=${perPage}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching plots:', getErrorMessage(error));
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
   * Create a new plot
   */
  static async createPlot(data: CreatePlotRequest): Promise<Plot> {
    try {
      const response = await apiRequest<{ data: Plot }>(API_ENDPOINTS.PLOTS, {
        method: 'POST',
        body: data,
      });
      console.log('✅ Plot created:', response.data.plot_number);
      return response.data;
    } catch (error) {
      console.error('Error creating plot:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Update a plot
   */
  static async updatePlot(id: number, data: UpdatePlotRequest): Promise<Plot> {
    try {
      const response = await apiRequest<{ data: Plot }>(
        API_ENDPOINTS.PLOT_BY_ID(id),
        {
          method: 'PUT',
          body: data,
        }
      );
      console.log('✅ Plot updated:', id);
      return response.data;
    } catch (error) {
      console.error('Error updating plot:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Delete a plot (soft delete)
   */
  static async deletePlot(id: number): Promise<void> {
    try {
      await apiRequest(API_ENDPOINTS.PLOT_BY_ID(id), {
        method: 'DELETE',
      });
      console.log('✅ Plot deleted:', id);
    } catch (error) {
      console.error('Error deleting plot:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Update plot status
   */
  static async updatePlotStatus(
    id: number,
    status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  ): Promise<Plot> {
    return this.updatePlot(id, { status });
  }

  // =====================================================
  // BURIAL RECORD MANAGEMENT
  // =====================================================

  /**
   * Get all burial records with pagination
   */
  static async getAllBurialRecords(
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<BurialRecord>> {
    try {
      const response = await apiRequest<PaginatedResponse<BurialRecord>>(
        `${API_ENDPOINTS.BURIAL_RECORDS}?page=${page}&per_page=${perPage}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching burial records:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get burial record by ID
   */
  static async getBurialRecordById(id: number): Promise<BurialRecord> {
    try {
      const response = await apiRequest<{ data: BurialRecord }>(
        API_ENDPOINTS.BURIAL_RECORD_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching burial record:', getErrorMessage(error));
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

  // =====================================================
  // STATISTICS & REPORTS
  // =====================================================

  /**
   * Get plot statistics
   */
  static async getPlotStatistics(): Promise<{
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
  }> {
    try {
      const response = await apiRequest<{
        data: {
          total: number;
          available: number;
          occupied: number;
          reserved: number;
          maintenance: number;
        };
      }>(`${API_ENDPOINTS.PLOTS}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plot statistics:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Get burial statistics
   */
  static async getBurialStatistics(): Promise<{
    total: number;
    this_month: number;
    this_year: number;
  }> {
    try {
      const response = await apiRequest<{
        data: {
          total: number;
          this_month: number;
          this_year: number;
        };
      }>(`${API_ENDPOINTS.BURIAL_RECORDS}/statistics`);
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching burial statistics:',
        getErrorMessage(error)
      );
      throw error;
    }
  }

  /**
   * Get sections list
   */
  static async getSections(): Promise<string[]> {
    try {
      const response = await apiRequest<{ data: string[] }>(
        `${API_ENDPOINTS.PLOTS}/sections`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', getErrorMessage(error));
      throw error;
    }
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  /**
   * Get dashboard statistics and overview
   */
  static async getDashboardData(): Promise<{
    plots: {
      total: number;
      available: number;
      occupied: number;
      reserved: number;
      maintenance: number;
    };
    burials: {
      total: number;
      this_month: number;
      this_year: number;
    };
    recent_burials?: any[];
    announcements?: any[];
  }> {
    try {
      const response = await apiRequest<{ data: any }>(API_ENDPOINTS.DASHBOARD);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', getErrorMessage(error));
      throw error;
    }
  }
}
