
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">RoomReady</h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/") ? "text-primary" : "text-gray-600"
            )}
          >
            Dashboard
          </Link>
          <Link 
            to="/rooms" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/rooms") ? "text-primary" : "text-gray-600"
            )}
          >
            Rooms
          </Link>
          <Link 
            to="/bookings" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/bookings") ? "text-primary" : "text-gray-600"
            )}
          >
            Bookings
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
