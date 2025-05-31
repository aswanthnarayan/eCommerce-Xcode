import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
    redirectTo = '/login', 
    adminOnly = false, 
    children 
}) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    return children || <Outlet />;
};

export default ProtectedRoute;
