import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Styles/join-group.css';

const JoinGroup = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.currentuserreducer);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://yourtube-atxv.onrender.com/groups/${groupId}`);
            setGroup(response.data);
        } catch (error) {
            console.error('Error fetching group details:', error);
            if (error.response?.status === 404) {
                setError('Group not found. The invite link may be invalid or the group may have been deleted.');
            } else {
                setError('Failed to load group details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!currentUser?.result) {
            setError('Please log in to join this group.');
            return;
        }

        try {
            setJoining(true);
            setError('');
            setSuccess('');

            const response = await axios.post(`https://yourtube-atxv.onrender.com/groups/join/${groupId}`, {
                userId: currentUser.result._id,
                userName: currentUser.result.name || currentUser.result.email
            });

            setSuccess('Successfully joined the group!');
            
            // Wait a bit longer to ensure the backend has processed the join
            setTimeout(() => {
                // Refresh the page to ensure we get the latest group data
                window.location.href = `/group/${groupId}`;
            }, 3000);
        } catch (error) {
            console.error('Error joining group:', error);
            let errorMessage = 'Failed to join group. Please try again.';
            
            if (error.response?.status === 400) {
                errorMessage = error.response.data.message || 'You are already a member of this group.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Group not found. The invite link may be invalid.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again in a few moments.';
            }
            
            setError(errorMessage);
        } finally {
            setJoining(false);
        }
    };

    const handleGoToLogin = () => {
        navigate('/auth');
    };

    const handleGoToGroupChat = () => {
        navigate('/groupchat');
    };

    if (loading) {
        return (
            <div className="join-group-page">
                <div className="join-group-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading group details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !group) {
        return (
            <div className="join-group-page">
                <div className="join-group-container">
                    <div className="error-message">
                        <h2>❌ Group Not Found</h2>
                        <p>{error}</p>
                        <div className="action-buttons">
                            <button onClick={handleGoToGroupChat} className="btn-primary">
                                Go to Group Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="join-group-page">
            <div className="join-group-container">
                <div className="group-info">
                    <h2>🎉 Join Group</h2>
                    
                    {group && (
                        <div className="group-details">
                            <h3>{group.name}</h3>
                            <p className="group-stats">
                                {group.members?.length || 0} members
                            </p>
                            <p className="group-description">
                                You've been invited to join this group chat!
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <p>✅ {success}</p>
                            <p>Redirecting to group chat...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <p>❌ {error}</p>
                        </div>
                    )}

                    <div className="action-buttons">
                        {!currentUser?.result ? (
                            <>
                                <button onClick={handleGoToLogin} className="btn-primary">
                                    Login to Join
                                </button>
                                <button onClick={handleGoToGroupChat} className="btn-secondary">
                                    Go to Group Chat
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={handleJoinGroup} 
                                    disabled={joining}
                                    className="btn-primary"
                                >
                                    {joining ? 'Joining...' : 'Join Group'}
                                </button>
                                <button onClick={handleGoToGroupChat} className="btn-secondary">
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinGroup; 