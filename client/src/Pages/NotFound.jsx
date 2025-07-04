import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="not-found-page">
            <div className="not-found-container">
                <div className="not-found-content">
                    <h1>404</h1>
                    <h2>Page Not Found</h2>
                    <p>Oops! The page you're looking for doesn't exist.</p>
                    <p>It might have been moved, deleted, or you entered the wrong URL.</p>
                    
                    <div className="not-found-actions">
                        <button onClick={handleGoHome} className="btn-primary">
                            Go to Home
                        </button>
                        <button onClick={handleGoBack} className="btn-secondary">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 