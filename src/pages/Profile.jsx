// Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdWork, 
  MdLocationOn, 
  MdCalendarToday,
  MdEdit,
  MdLock,
  MdNotifications,
  MdSave,
  MdClose 
} from 'react-icons/md';

const styles = `
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex-grow: 1;
}

.profile-info h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color:rgb(77, 79, 188);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-profile-btn:hover {
  background-color:rgb(65, 67, 221);
}

.profile-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-card h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.info-icon {
  color: #666;
  font-size: 24px;
}

.info-item label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  display: block;
}

.info-item p {
  margin: 0;
  color: #333;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.activity-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.activity-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.completed {
  background-color: #4CAF50;
  color: white;
}

.status.in-progress {
  background-color:rgb(84, 61, 211);
  color: white;
}

.status.pending {
  background-color: #FFC107;
  color: black;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #666;
}

.error {
  text-align: center;
  padding: 20px;
  color: #f44336;
}

.edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.9);
}

.name-input {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.edit-buttons {
  display: flex;
  gap: 8px;
}

.save-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
}

.save-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #da190b;
}

/* New styles for password modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
}

.success-message {
  color: #4CAF50;
  font-size: 14px;
  margin-top: 10px;
}
`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('No user data found');
        }
        const { id } = JSON.parse(userData);
        const response = await axios.post('http://localhost:8000/get_profile.php', {
          userId: id
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.data.success) {
          setUser(response.data.user);
          setEditedUser(response.data.user);
        } else {
          throw new Error(response.data.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:8000/get_profile.php', {
        action: 'update',
        userId: editedUser.id,
        userData: editedUser
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setUser(editedUser);
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    }
  };
//delete code from here 


const handleDeleteAccount = async () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('No user data found');
    }
    const { id } = JSON.parse(userData);
    const response = await axios.post('http://localhost:8000/delete_account.php', {
      userId: id
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.data.success) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      throw new Error(response.data.message || 'Failed to delete account');
    }
  } catch (error) {
    setError(error.message);
  }
};

const renderDeleteModal = () => {
  if (!showDeleteModal) return null;
  return (
    
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Delete Account</h2>
          <button className="close-button" onClick={() => setShowDeleteModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div className="modal-buttons">
            <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/get_profile.php', {
        action: 'change_password',
        userId: user.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(response.data.message || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'An error occurred');
    }
  };

  const renderPersonalInfo = () => {
    if (isEditing) {
      return (
        <div className="info-grid">
          <div className="info-item">
            <MdEmail className="info-icon" />
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editedUser?.email || ''}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
          </div>
          <div className="info-item">
            <MdPhone className="info-icon" />
            <div>
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={editedUser?.phone || ''}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
          </div>
          <div className="info-item">
            <MdLocationOn className="info-icon" />
            <div>
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={editedUser?.location || ''}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
          </div>
          <div className="info-item">
            <MdCalendarToday className="info-icon" />
            <div>
              <label>Joined</label>
              <p>{user?.joinDate || '-'}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="info-grid">
        <div className="info-item">
          <MdEmail className="info-icon" />
          <div>
            <label>Email</label>
            <p>{user?.email || '-'}</p>
          </div>
        </div>
        <div className="info-item">
          <MdPhone className="info-icon" />
          <div>
            <label>Phone</label>
            <p>{user?.phone || '-'}</p>
          </div>
        </div>
        <div className="info-item">
          <MdLocationOn className="info-icon" />
          <div>
          <label>Location</label>
            <p>{user?.location || '-'}</p>
          </div>
        </div>
        <div className="info-item">
          <MdCalendarToday className="info-icon" />
          <div>
            <label>Joined</label>
            <p>{user?.joinDate || '-'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPasswordModal = () => {
    if (!showPasswordModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Change Password</h2>
            <button 
              className="close-button"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            <div className="modal-buttons">
              <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading....</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1 className="title">Profile</h1>
      <div className="profile-header glass-card">
        <div className="profile-avatar">
          <MdPerson size={50} />
        </div>
        <div className="profile-info">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedUser?.name || ''}
              onChange={handleInputChange}
              className="edit-input name-input"
            />
          ) : (
            <h1>{user?.name || 'User'}</h1>
          )}
        </div>
        {isEditing ? (
          <div className="edit-buttons">
            <button className="save-btn" onClick={handleSave}>
              <MdSave /> Save
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              <MdClose /> Cancel
            </button>
          </div>
        ) : (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <MdEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-card glass-card">
          <h2>Personal Information</h2>
          {renderPersonalInfo()}
        </div>

        <div className="profile-card glass-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => setShowPasswordModal(true)}>
              <MdLock /> Change Password
            </button>
            <button className="action-btn danger" onClick={() => setShowDeleteModal(true)}>
              <MdNotifications /> Delete Account
            </button>
          </div>
        </div>
      </div>
      {renderPasswordModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default Profile;