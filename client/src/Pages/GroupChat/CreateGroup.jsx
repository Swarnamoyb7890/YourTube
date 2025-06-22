import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../../action/groups';
import './Styles/variables.css';
import './Styles/create-group.css';

const CreateGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const currentUser = useSelector(state => state.currentuserreducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Simulate API delay
        setTimeout(async () => {
            try {
                // Generate a random group ID
                const groupId = Math.random().toString(36).substring(7);
                const mockGroup = {
                    _id: groupId,
                    name: groupName,
                    creator: currentUser?.result?._id,
                    members: [currentUser?.result],
                    inviteLink: Math.random().toString(36).substring(7)
                };

                // Store group using Redux action
                await dispatch(createGroup(mockGroup));
                
                setInviteLink(`${window.location.origin}/group/join/${mockGroup.inviteLink}`);
                
                // Navigate to the group chat after 2 seconds
                setTimeout(() => {
                    navigate(`/group/${groupId}`);
                }, 2000);

            } catch (error) {
                setError('Failed to create group');
            } finally {
                setLoading(false);
            }
        }, 1000);
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert('Invite link copied to clipboard!');
    };

    if (!currentUser?.result) {
        return (
            <div className="group-chat-page">
                <div className="create-group-container">
                    <div className="error-message">
                        Please log in to create a group chat.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group-chat-page">
            <div className="create-group-container">
                <h2>Create New Group</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleCreateGroup} className="create-group-form">
                    <input
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                        className="group-input"
                        disabled={loading}
                        minLength={3}
                        maxLength={50}
                    />
                    <button type="submit" className="create-group-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </form>
                
                {inviteLink && (
                    <div className="invite-link-container">
                        <h3>Share this link to invite others:</h3>
                        <div className="invite-link">
                            <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                className="invite-link-input"
                            />
                            <button onClick={copyInviteLink} className="copy-link-btn">
                                Copy Link
                            </button>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            Redirecting to group chat in 2 seconds...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateGroup;