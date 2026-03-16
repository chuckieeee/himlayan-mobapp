<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        $query = Payment::with(['user:id,name,email', 'plot:id,plot_number,section', 'verifier:id,name']);

        if (auth()->user()->role === 'member') {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_type') && $request->payment_type) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 10);
        $payments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ]
        ]);
    }

    /**
     * Store manual payment (optional feature)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plot_id' => 'nullable|exists:plots,id',
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|string|max:50',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create([
            ...$validated,
            'user_id' => auth()->id(),
            'status' => 'pending',
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment submitted successfully.',
            'data' => $payment
        ], 201);
    }

    /**
     * CREATE XENDIT PAYMENT (🔥 THIS IS WHAT YOU NEEDED)
     */
    public function createXendit(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|string',
            'payment_method' => 'required|string',
        ]);

        $user = auth()->user();

        $externalId = 'INV-' . Str::random(12);

        $secretKey = env('XENDIT_SECRET_KEY');

        if (!$secretKey) {
            return response()->json([
                'success' => false,
                'error' => 'Xendit secret key not configured'
            ], 500);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => $externalId,
                'amount' => (int) $validated['amount'],
                'payer_email' => $user->email,
                'description' => ucfirst($validated['payment_type']) . ' Payment',
            ]);

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create invoice',
                'details' => $response->json()
            ], 500);
        }

        $invoice = $response->json();

        $payment = Payment::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'payment_method' => $validated['payment_method'],
            'reference_number' => $externalId,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'invoice_url' => $invoice['invoice_url'],
            'payment' => $payment
        ]);
    }

    /**
     * Show single payment
     */
    public function show($id)
    {
        $payment = Payment::with(['user:id,name,email', 'plot:id,plot_number,section', 'verifier:id,name'])->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        if (auth()->user()->role === 'member' && $payment->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Verify payment
     */
    public function verify(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:verified,rejected',
            'notes' => 'nullable|string',
        ]);

        $payment->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $payment->notes,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment ' . $validated['status'] . ' successfully',
            'data' => $payment
        ]);
    }

    /**
     * Delete payment
     */
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully'
        ]);
    }

    /**
     * Payment statistics
     */
    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Payment::count(),
                'pending' => Payment::where('status', 'pending')->count(),
                'verified' => Payment::where('status', 'verified')->count(),
                'rejected' => Payment::where('status', 'rejected')->count(),
                'total_amount' => Payment::where('status', 'verified')->sum('amount'),
                'pending_amount' => Payment::where('status', 'pending')->sum('amount'),
            ]
        ]);
    }

    /**
     * Member dues
     */
    public function myDues()
    {
        $payments = Payment::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }
}