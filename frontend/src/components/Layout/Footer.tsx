const Footer = () => (
  <footer className="border-t border-gray-200 bg-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
      <span>XSS Security Lab — Information Systems Security</span>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Backend :3002
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          Frontend :5173
        </span>
      </div>
    </div>
  </footer>
)

export default Footer
