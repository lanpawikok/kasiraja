<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Halaman Dashboard Absensi di PC Admin
    public function index()
    {
        $today = Carbon::now('Asia/Jakarta')->toDateString();

        $attendances = Attendance::where('date', $today)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Attendance', [
            'attendances' => $attendances,
            'stats' => [
                'todayCount' => $attendances->count(),
                'totalStaff' => 10,
                'percentage' => round(($attendances->count() / 10) * 100),
                'lateCount' => $attendances->where('status', 'Telat')->count(),
                'onTimeCount' => $attendances->where('status', 'Tepat Waktu')->count(),
            ]
        ]);
    }

    // Input manual dari PC Admin
    public function store(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|string',
        ]);

        $now = Carbon::now('Asia/Jakarta');
        $currentTime = $now->toTimeString();
        $status = $currentTime > '10:00:00' ? 'Telat' : 'Tepat Waktu';

        Attendance::create([
            'staff_id' => $request->staff_id,
            'date' => $now->toDateString(),
            'time' => $currentTime,
            'status' => $status,
        ]);

        return redirect()->back();
    }

    // Hapus data absensi
    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return redirect()->back();
    }

    // Tampilan Form Input Nama di HP Karyawan saat Scan QR
    public function showScanForm(Request $request)
    {
        $storeUrl = route('attendance.scan.store');
        $csrfToken = csrf_token();

        return "
            <!DOCTYPE html>
            <html lang='id'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Absensi Karyawan - BrewMaster Pro</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .card { background: white; padding: 35px 25px; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); width: 100%; max-width: 340px; text-align: center; }
                    h2 { color: #1f2937; margin-bottom: 8px; font-size: 22px; }
                    p { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
                    input { width: 100%; padding: 14px; margin-bottom: 16px; border: 1px solid #d1d5db; border-radius: 10px; box-sizing: border-box; font-size: 16px; outline: none; transition: border 0.2s; }
                    input:focus { border-color: #10b981; }
                    button { background: #10b981; color: white; border: none; padding: 14px; width: 100%; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
                    button:hover { background: #059669; }
                </style>
            </head>
            <body>
                <div class='card'>
                    <h2>☕ BrewMaster Pro</h2>
                    <p>Silakan masukkan nama kamu untuk absen</p>
                    <form action='{$storeUrl}' method='POST'>
                        <input type='hidden' name='_token' value='{$csrfToken}'>
                        <input type='text' name='name' placeholder='Nama Lengkap...' required autocomplete='off'>
                        <button type='submit'>Kirim Absen Sekarang</button>
                    </form>
                </div>

                <script>
                    function playBeepAndVibrate() {
                        try {
                            if ('vibrate' in navigator) {
                                navigator.vibrate(200);
                            }
                            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();
                            
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                            
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            
                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.15);
                        } catch (e) {
                            console.log('Audio/Vibration blocked by browser policy');
                        }
                    }

                    window.addEventListener('load', playBeepAndVibrate);
                </script>
            </body>
            </html>
        ";
    }

    // Simpan dari Scan HP dengan Logika Waktu WIB & Batas Jam 10:00 WIB
    public function storeFromScan(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();
        $currentTime = $now->toTimeString();
        $name = trim($request->name);

        // Penentuan Status: Tepat Waktu atau Telat (Batas 10:00:00)
        $status = $currentTime > '10:00:00' ? 'Telat' : 'Tepat Waktu';

        $existing = Attendance::where('staff_id', $name)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return "
                <!DOCTYPE html>
                <html lang='id'>
                <head>
                    <meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Sudah Absen</title>
                    <style>body { font-family: sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }</style>
                </head>
                <body>
                    <div>
                        <h1 style='color: #d97706; font-size: 24px;'>⚠️ Halo, {$name}!</h1>
                        <p style='font-size: 16px; color: #4b5563;'>Kamu sudah tercatat absen hari ini pada pukul <b>{$existing->time}</b>.</p>
                    </div>
                    <script>
                        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
                    </script>
                </body>
                </html>
            ";
        }

        Attendance::create([
            'staff_id' => $name,
            'date'     => $today,
            'time'     => $currentTime,
            'status'   => $status,
        ]);

        $statusColor = $status === 'Tepat Waktu' ? '#059669' : '#dc2626';

        return "
            <!DOCTYPE html>
            <html lang='id'>
            <head>
                <meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Absensi Berhasil</title>
                <style>body { font-family: sans-serif; background: #f0fdf4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }</style>
            </head>
            <body>
                <div>
                    <h1 style='color: {$statusColor}; font-size: 26px;'>✅ Absensi Berhasil!</h1>
                    <p style='font-size: 16px; color: #374151;'>Terima kasih, <b>{$name}</b>.</p>
                    <p style='font-size: 14px; color: #6b7280;'>Status: <b style='color: {$statusColor};'>{$status}</b> ({$currentTime} WIB)</p>
                </div>
                <script>
                    try {
                        if ('vibrate' in navigator) navigator.vibrate(300);
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
                        osc.connect(gain); gain.connect(audioCtx.destination);
                        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
                    } catch(e) {}
                </script>
            </body>
            </html>
        ";
    }
}