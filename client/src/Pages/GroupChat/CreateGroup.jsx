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
        if (!groupName.trim() || !currentUser?.result) return;

        setLoading(true);
        setError('');

        const groupData = {
            name: groupName,
            members: [currentUser.result._id] // Send member IDs
        };

        try {
            const newGroup = await dispatch(createGroup(groupData));
            if (newGroup && newGroup._id) {
                // In a real app, the backend would generate and return the invite link
                const generatedInviteLink = `${window.location.origin}/group/join/${newGroup._id}`;
                setInviteLink(generatedInviteLink);
                
                // Navigate to the group chat
                navigate(`/group/${newGroup._id}`);
            } else {
                setError('Failed to create group. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
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