import React, { useState, useEffect } from 'react';
import { sendSmsOtp, verifySmsOtp } from '../../Api';

const MobileOtpModal = ({ open, onClose, onSuccess }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: enter mobile, 2: enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMobile('');
      setOtp('');
      setStep(1);
      setLoading(false);
      setError('');
      setSuccess(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await sendSmsOtp(mobile);
      if (res.data.success) {
        setStep(2);
      } else {
        setError(res.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await verifySmsOtp(mobile, otp);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess(mobile);
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
        <h2 style={{ marginBottom: 16, color: '#3399cc' }}>Mobile OTP Verification</h2>
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="Enter mobile number (with country code)"
              maxLength={15}
              style={{
                width: '100%', padding: 10, fontSize: 18, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16
              }}
              required
            />
            <button
              type="submit"
              disabled={loading || mobile.length < 10}
              style={{
                width: '100%', padding: 12, background: '#3399cc', color: 'white', border: 'none', borderRadius: 6,
                fontWeight: 'bold', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
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
        )}
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

export default MobileOtpModal; 