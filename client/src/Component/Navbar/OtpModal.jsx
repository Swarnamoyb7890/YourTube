import React, { useState } from 'react';
import { verifyLoginOtp } from '../../Api';

const OtpModal = ({ open, email, onClose, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await verifyLoginOtp(email, otp);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess(res.data.user);
        }, 1000);
      } else {
        setError(res.data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h2 style={{ marginBottom: 16, color: '#3399cc' }}>OTP Verification</h2>
        <p style={{ marginBottom: 16 }}>Enter the OTP sent to <b>{email}</b></p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            style={{
              width: '100%', padding: 10, fontSize: 18, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16
            }}
            required
          />
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%', padding: 12, background: '#3399cc', color: 'white', border: 'none', borderRadius: 6,
              fontWeight: 'bold', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 8 }}>OTP Verified!</div>}
        <button
          onClick={onClose}
          style={{ width: '100%', padding: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OtpModal; 