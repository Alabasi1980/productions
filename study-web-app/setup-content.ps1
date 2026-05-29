# setup-content.ps1
# انسخ هذا السكريبت وشغّله مرة واحدة لنسخ ملفات الكتاب إلى مجلد content/

$source = "..\00_مسار الدراسة المهنية"
$dest   = ".\content"

if (-not (Test-Path $source)) {
    Write-Host "خطأ: لم يتم العثور على مجلد المصدر: $source" -ForegroundColor Red
    exit 1
}

Write-Host "جار نسخ الملفات..." -ForegroundColor Cyan
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Copy-Item -Path $source -Destination $dest -Recurse -Force
Write-Host "تم! الملفات موجودة في: $dest" -ForegroundColor Green
Write-Host "يمكنك الآن فتح index.html عبر Live Server أو رفع المجلد كاملاً على موقعك." -ForegroundColor Yellow
