<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BurialRecord;
use App\Models\QrCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QrCodeController extends Controller
{
    /**
     * Generate QR code for a burial record
     */
    public function generate($burialId)
    {
        $burialRecord = BurialRecord::find($burialId);

        if (!$burialRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Burial record not found'
            ], 404);
        }

        // If QR already exists, return it
        if ($burialRecord->qrCode) {
            return response()->json([
                'success' => true,
                'data' => [
                    'qr_code' => $burialRecord->qrCode,
                    'qr_url' => $this->generateQrImageUrl($burialRecord->qrCode->code),
                ],
                'message' => 'QR code already exists'
            ]);
        }

        // Generate unique code
        $code = Str::uuid()->toString();

        $publicUrl = config('app.url') . '/grave/' . $code;

        // Create record
        $qrCode = QrCode::create([
            'burial_record_id' => $burialId,
            'code' => $code,
            'url' => $publicUrl,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_code' => $qrCode,
                'qr_url' => $this->generateQrImageUrl($code),
            ],
            'message' => 'QR code generated successfully'
        ], 201);
    }

    /**
     * Show QR code details
     */
    public function show($code)
    {
        $qrCode = QrCode::with('burialRecord.plot')
            ->where('code', $code)
            ->where('is_active', true)
            ->first();

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR code not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'qr_code' => $qrCode,
                'qr_url' => $this->generateQrImageUrl($code),
            ],
            'message' => 'QR code retrieved successfully'
        ]);
    }

    /**
     * Deactivate QR code
     */
    public function deactivate($code)
    {
        $qrCode = QrCode::where('code', $code)->first();

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR code not found'
            ], 404);
        }

        $qrCode->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'QR code deactivated successfully'
        ]);
    }

    /**
     * Regenerate QR code
     */
    public function regenerate($burialId)
    {
        $burialRecord = BurialRecord::find($burialId);

        if (!$burialRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Burial record not found'
            ], 404);
        }

        if ($burialRecord->qrCode) {
            $burialRecord->qrCode->delete();
        }

        $code = Str::uuid()->toString();

        $publicUrl = config('app.url') . '/grave/' . $code;

        $qrCode = QrCode::create([
            'burial_record_id' => $burialId,
            'code' => $code,
            'url' => $publicUrl,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_code' => $qrCode,
                'qr_url' => $this->generateQrImageUrl($code),
            ],
            'message' => 'QR code regenerated successfully'
        ]);
    }

    /**
     * Generate QR Image URL
     */
    private function generateQrImageUrl($code)
    {
        $publicUrl = config('app.url') . '/grave/' . $code;

        return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='
            . urlencode($publicUrl);
    }
}