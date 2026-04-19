const Header = () => {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold">Security Lab – XSS Demo</h1>
        </div>
        <div className="text-sm bg-red-800 px-3 py-1 rounded-full">
          ⚠️ Educational purpose only
        </div>
      </div>
    </header>
  )
}

export default Header