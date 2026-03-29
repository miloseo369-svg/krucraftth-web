import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            KruCraft
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              คอร์สเรียน
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 text-center py-24">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
            เรียนรู้ทักษะใหม่
            <br />
            <span className="text-indigo-600">ด้วยวิดีโอคุณภาพ</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            แพลตฟอร์มเรียนออนไลน์ที่ออกแบบมาเพื่อคนไทย
            เรียนได้ทุกที่ทุกเวลา พร้อมรับใบประกาศนียบัตร
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-lg"
            >
              สมัครเรียนฟรี
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-lg"
            >
              ดูคอร์สทั้งหมด
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 KruCraft — ระบบเรียนออนไลน์
        </div>
      </footer>
    </div>
  );
}
