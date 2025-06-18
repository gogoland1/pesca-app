import { Waves, Fish } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-ocean-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Fish className="h-8 w-8" />
              <Waves className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">PescaApp</h1>
          </div>
          <p className="hidden sm:block text-ocean-100">Para Pescadores Artesanales</p>
        </div>
      </div>
    </header>
  )
}