// AdminRoute.jsx (Conceptual)
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
    const { user, isLoggedIn } = useAuth();

    if (!isLoggedIn || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;