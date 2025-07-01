import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProfilePage = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const { user, token, setUser } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch('http://localhost:3000/api/auth/me');

    //             if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //             }

    //             const data = await response.json();
    //             console.log(data);

    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // chức năng đổi tên hiển thị và email
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!formData.displayName.trim()) {
            setError('Display name is required');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/auth/me/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: formData.email || user?.email,
                    displayName: formData.displayName
                })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Cập nhật thất bại');
                return;
            }
            // Cập nhật lại user trong context và localStorage
            if (user) {
                const updatedUser = { ...user, displayName: formData.displayName, email: formData.email || user.email };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setSuccess('Cập nhật thành công!');
        } catch (error) {
            setError('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword)
            return;

        try {
            const response = await fetch('http://localhost:3000/api/auth/me/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPassword: passwordData.newPassword,
                    oldPassword: passwordData.oldPassword
                })
            });

            const data = await response.json();
            console.log(data);


            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {

        }
    }


    const [activeTab, setActiveTab] = useState("profile");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    return (
        <section className="bg-light py-3 py-md-5 py-xl-8">
            <Header />
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-12 col-md-10 col-lg-8 col-xl-7 col-xxl-6">
                        <p className="text-secondary text-center lead fs-4 mb-5"></p>
                        <hr className="w-50 mx-auto mb-5 mb-xl-9 border-dark-subtle" />
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row gy-4 gy-lg-0">
                    <div className="col-12 col-lg-4 col-xl-3">
                        <div className="row gy-4">
                            <div className="col-12">
                                <div className="card widget-card border-light shadow-sm">
                                    <div className="card-header text-bg-primary fw-bold fs-5">Chào mừng {user?.displayName}</div>
                                    <div className="card-body">
                                        <div className="text-center mb-3">
                                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.displayName}`} className="img-fluid rounded-circle" alt="Luna John" />
                                        </div>
                                        <h5 className="text-center mb-1">{user?.displayName}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-8 col-xl-9">
                        <div className="card widget-card border-light shadow-sm mb-5">
                            <div className="card-body p-2 fs-5">
                                <ul className="nav nav-tabs" id="profileTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === "profile" ? "active" : ""}`} id="profile-tab" data-bs-toggle="tab"
                                            data-bs-target="#profile-tab-pane" type="button"
                                            onClick={() => handleTabChange("profile")} role="tab" aria-controls="profile-tab-pane" aria-selected="false">Thông tin</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === "profileEdit" ? "active" : ""}`} id="profileEdit-tab" data-bs-toggle="tab"
                                            data-bs-target="#profileEdit-tab-pane" type="button"
                                            onClick={() => handleTabChange("profileEdit")} role="tab" aria-controls="profileEdit-tab-pane" aria-selected="true">Chỉnh sửa thông tin</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === "password" ? "active" : ""}`} id="password-tab" data-bs-toggle="tab"
                                            data-bs-target="#password-tab-pane" type="button"
                                            onClick={() => handleTabChange("password")} role="tab" aria-controls="password-tab-pane" aria-selected="false">Đổi mật khẩu</button>
                                    </li>
                                </ul>
                                <div className="tab-content pt-4" id="profileEditTabContent">
                                    {/* Tab thông tin */}
                                    {activeTab === "profile" && (
                                        <div className="tab-pane fade show active" id="profile-tab-pane">
                                            <div className="row g-0">
                                                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                                                    <div className="p-2">Tên hiển thị</div>
                                                </div>
                                                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                                                    <div className="p-2">{user?.displayName}</div>
                                                </div>
                                                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                                                    <div className="p-2">Email</div>
                                                </div>
                                                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                                                    <div className="p-2">{user?.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Tab chỉnh sửa thông tin */}
                                    {activeTab === "profileEdit" && (
                                        <div className="tab-pane fade show active" id="profileEdit-tab-pane">
                                            <div className="col-12 col-md-6 mt-3">
                                                <label htmlFor="inputFirstName" className="form-label">
                                                    Nhập tên hiển thị
                                                </label>
                                                <input type="text" className="form-control" id="inputFirstName" name='displayName' value={formData.displayName} onChange={handleChange} />
                                                {error && <div className="text-danger mt-1">{error}</div>}
                                            </div>
                                            <div className="col-12 col-md-6 mt-3">
                                                <label htmlFor="inputEmail" className="form-label">
                                                    Email
                                                </label>
                                                <input type="email" className="form-control" id="inputEmail" name='email' value={formData.email} onChange={handleChange} />
                                            </div>
                                            <div className="col-12 mt-3">
                                                <button className="btn btn-primary" onClick={handleSubmit}>
                                                    lưu thông tin
                                                </button>
                                                {success && <div className="text-success mt-2">{success}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab Password */}
                                    {activeTab === "password" && (
                                        <div className="tab-pane fade show active" id="password-tab-pane">
                                            <div className="row gy-3 gy-xxl-4">
                                                <div className="col-12">
                                                    <label htmlFor="currentPassword" className="form-label">
                                                        Mật khẩu cũ
                                                    </label>
                                                    <input type="password" className="form-control" id="currentPassword" name="oldPassword" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="newPassword" className="form-label">
                                                        Mật khẩu mới
                                                    </label>
                                                    <input type="password" className="form-control" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="confirmPassword" className="form-label">
                                                        Nhập lại mật khẩu
                                                    </label>
                                                    <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                                                </div>
                                                <div className="col-12 ">
                                                    <button className="btn btn-primary" onClick={handleChangePassword}>
                                                        Lưu mật khẩu
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </section >
    );
};
export default ProfilePage;