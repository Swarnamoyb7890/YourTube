import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import './UpgradePlan.css';
import { createRazorpayOrder, verifyPayment } from '../Api';
import { setcurrentuser } from '../action/currentuser';

const plans = [
  { name: 'Free', limit: '5 mins/video', price: 0, description: 'Watch up to 5 minutes per video.' },
  { name: 'Bronze', limit: '7 mins/video', price: 10, description: 'Watch up to 7 minutes per video.' },
  { name: 'Silver', limit: '10 mins/video', price: 50, description: 'Watch up to 10 minutes per video.' },
  { name: 'Gold', limit: 'Unlimited', price: 100, description: 'Watch videos with no time limit.' }
];

const UpgradePlan = () => {
  const currentUser = useSelector(state => state.currentuserreducer?.result);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the previous page from location state or default to home
  const previousPage = location.state?.from || '/';
  
  console.log('Current location state:', location.state);
  console.log('Previous page:', previousPage);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async (plan) => {
    if (plan.price === 0) {
      // Handle free plan upgrade
      try {
        setLoading(true);
        // You can add a direct upgrade API call here for free plans
        setSelectedPlan(plan.name);
        setSuccess(true);
        setInvoice({
          user: currentUser?.name,
          plan: plan.name,
          price: plan.price,
          date: new Date().toLocaleString()
        });
      } catch (err) {
        alert('Failed to upgrade plan.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      
      // Create order on server
      const orderResponse = await createRazorpayOrder({
        amount: plan.price,
        currency: 'INR'
      });

      if (!orderResponse.data || !orderResponse.data.id) {
        throw new Error('Invalid order response from server');
      }

      const order = orderResponse.data;

      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_5UBqyMVR3qmoMG', // Use your actual test key
        amount: order.amount,
        currency: order.currency,
        name: 'YourTube Premium',
        description: `${plan.name} Plan - ${plan.description}`,
        order_id: order.id,
        handler: async function (response) {
          console.log('Payment successful! Response:', response);
          try {
            console.log('Starting payment verification...');
            // Verify payment on server
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.name.toLowerCase(),
              userId: currentUser._id,
              amount: plan.price
            });
            console.log('Verification response:', verifyResponse);

            if (verifyResponse.data.success) {
              console.log('Payment verified successfully!');
              setSelectedPlan(plan.name);
              setSuccess(true);
              setInvoice({
                user: currentUser?.name,
                plan: plan.name,
                price: plan.price,
                date: new Date().toLocaleString(),
                paymentId: response.razorpay_payment_id
              });

              // Update user state
              if (verifyResponse.data.user) {
                dispatch(setcurrentuser({ ...currentUser, result: verifyResponse.data.user }));
              }

              // Show success message and redirect after 3 seconds
              setTimeout(() => {
                navigate(previousPage);
              }, 3000);
            } else {
              console.log('Payment verification failed:', verifyResponse.data);
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upgrade-plan-page">
      <h2>Upgrade Your Plan</h2>
      <div className="plans-container">
        {plans.map(plan => (
          <div key={plan.name} className={`plan-card${currentUser?.plan === plan.name.toLowerCase() ? ' current' : ''}`}>
            <h3>{plan.name}</h3>
            <p className="plan-limit">{plan.limit}</p>
            <p className="plan-desc">{plan.description}</p>
            <p className="plan-price">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</p>
            {plan.price !== 0 && currentUser?.plan !== plan.name.toLowerCase() && (
              <button 
                className="upgrade-btn" 
                onClick={() => handleUpgrade(plan)}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
              </button>
            )}
            {currentUser?.plan === plan.name.toLowerCase() && <span className="current-plan">Current Plan</span>}
          </div>
        ))}
      </div>
      {success && invoice && (
        <div className="upgrade-success">
          <h4>🎉 Upgrade Successful!</h4>
          <p>Thank you, {invoice.user}! You have upgraded to the <b>{invoice.plan}</b> plan.</p>
          <p style={{ color: '#3399cc', fontWeight: 'bold' }}>
            Redirecting you back in 3 seconds...
          </p>
          <button 
            onClick={() => {
              console.log('Navigating to:', previousPage);
              try {
                navigate(previousPage);
              } catch (error) {
                console.error('Navigation error:', error);
                // Fallback to home page
                navigate('/');
              }
            }}
            style={{
              background: 'linear-gradient(90deg, #00b09b 0%, #96c93d 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '30px',
              cursor: 'pointer',
              marginTop: '18px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3399cc 0%, #00b09b 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #00b09b 0%, #96c93d 100%)'}
          >
            Go Back Now
          </button>
          <div className="invoice-box">
            <h5>Invoice</h5>
            <p><b>Name:</b> {invoice.user}</p>
            <p><b>Plan:</b> {invoice.plan}</p>
            <p><b>Amount Paid:</b> ₹{invoice.price}</p>
            <p><b>Date:</b> {invoice.date}</p>
            {invoice.paymentId && <p><b>Payment ID:</b> {invoice.paymentId}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradePlan; 