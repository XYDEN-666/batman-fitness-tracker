// src/components/Header.jsx
import Link from 'next/link';
// import BatIcon from './BatIcon'; // Example

const Header = () => {
  return (
    <header className="bg-black shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors">
          {/* <BatIcon className="inline-block h-8 w-8 mr-2" /> */}
          BAT-TRACKER
        </Link>
        <div className="space-x-4">
          <Link href="/" className="text-neutral-300 hover:text-red-500 transition-colors">
            Dashboard
          </Link>
          <Link href="/log-workout" className="text-neutral-300 hover:text-red-500 transition-colors">
            Log Workout
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;