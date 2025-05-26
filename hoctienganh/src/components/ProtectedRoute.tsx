import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Đang kiểm tra trạng thái xác thực
  if (isAuthenticated === null) {
    return <div className="loading-screen">Đang tải...</div>;
  }

  // Nếu không xác thực, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã xác thực, hiển thị nội dung
  return <>{children}</>;
};

export default ProtectedRoute; 