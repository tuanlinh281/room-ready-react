
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">RoomReady</h1>
        </div>
        <nav className="hidden md:flex space-x-8 items-center">
          {user && (
            <>
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
            </>
          )}
          
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
