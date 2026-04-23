export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto py-8 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎓</span>
          <span className="font-bold text-gray-800 tracking-tight">Future Scholars Hub</span>
        </div>
        
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Empowering the next generation of scholars with interactive learning and seamless classroom management. ✨
        </p>

        <div className="flex gap-4 mt-2">
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Learn
          </span>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Grow
          </span>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Succeed
          </span>
        </div>

        <div className="w-12 h-1 bg-[#6C63FF]/20 rounded-full my-2"></div>

        <p className="text-xs text-gray-400">
          © {currentYear} Future Scholars Hub. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
