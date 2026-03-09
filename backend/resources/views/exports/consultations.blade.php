<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Konsultasi</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; }
        h1 { margin: 0 0 8px 0; font-size: 20px; }
        .meta { margin-bottom: 14px; font-size: 11px; color: #555; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px; vertical-align: top; }
        th { background: #f3f4f6; text-align: left; }
        .small { font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <h1>Laporan Konsultasi</h1>
    <div class="meta">
        Digenerate: {{ $generatedAt->format('d-m-Y H:i') }}<br>
        Oleh: {{ $generatedBy->name }} ({{ $generatedBy->status_pengguna }})
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Konsultan</th>
                <th>Status</th>
                <th>Psikolog</th>
                <th>Keluhan (Q3)</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($consultations as $item)
                <tr>
                    <td>{{ $item->id }}</td>
                    <td>{{ optional($item->created_at)->format('d-m-Y H:i') }}</td>
                    <td>
                        {{ $item->user->name ?? '-' }}<br>
                        <span class="small">{{ $item->user->email ?? '-' }}</span>
                    </td>
                    <td>{{ $item->status }}</td>
                    <td>{{ $item->psikolog->name ?? '-' }}</td>
                    <td>{{ $item->q3 }}</td>
                    <td>{{ $item->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Tidak ada data konsultasi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
