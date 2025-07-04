import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateGroupData, getGroups } from '../../action/groups';
import { FaUsers, FaPaperPlane, FaEllipsisV, FaEdit, FaTrash, FaCheck, FaTimes, FaArrowDown, FaCircle } from 'react-icons/fa';
import './Styles/variables.css';
import './Styles/chat.css';
import './Styles/messages.css';
import './Styles/sidebar.css';
import './Styles/user.css';
import { fetchMessages, sendMessage, editMessage as editMessageAction, deleteMessage as deleteMessageAction } from '../../action/messages';
import { API } from '../../Api';

const UserAvatar = ({ user }) => {
    if (!user || !user.name) {
        return null; // Don't render anything if the user data isn't loaded yet
    }
    return (
        <div className="user-avatar">
            <div className="avatar-initial">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-status online"></div>
        </div>
    );
};

const Message = ({ message, currentUser, onEdit, onDelete }) => {
    const isSentByMe = message.sender === currentUser?.result?._id;
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const [showActions, setShowActions] = useState(false);
    const editInputRef = useRef(null);
    const messageRef = useRef(null);

    // Handle click outside to close actions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (messageRef.current && !messageRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };

        if (showActions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActions]);

    const handleEdit = () => {
        setIsEditing(true);
        setShowActions(false);
        setTimeout(() => {
            editInputRef.current?.focus();
        }, 0);
    };

    const handleSave = () => {
        if (editedContent.trim() && editedContent !== message.content) {
            onEdit(message._id, editedContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(message.content);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div 
            ref={messageRef}
            className={`message ${isSentByMe ? 'sent' : 'received'}`}
            onMouseEnter={() => !isEditing && setShowActions(true)}
            onMouseLeave={() => !isEditing && setShowActions(false)}
        >
            <div className="message-bubble">
                {!isSentByMe && (
                    <div className="message-sender">{message.senderName}</div>
                )}
                {isEditing ? (
                    <div className="message-edit-container">
                        <textarea
                            ref={editInputRef}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="message-edit-input"
                            rows={1}
                        />
                        <div className="message-edit-actions">
                            <button onClick={handleSave} className="edit-action-btn save">
                                <FaCheck />
                            </button>
                            <button onClick={handleCancel} className="edit-action-btn cancel">
                                <FaTimes />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="message-content">
                            {message.content}
                        </div>
                        <div className="message-timestamp">
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                            {message.isEdited && <span className="edited-indicator">(edited)</span>}
                        </div>
                    </>
                )}
            </div>
            {isSentByMe && !isEditing && (
                <div className={`message-actions ${showActions ? 'visible' : ''}`}>
                    <button onClick={handleEdit} className="message-action-btn edit" title="Edit message">
                        <FaEdit />
                    </button>
                    <button onClick={() => onDelete(message._id)} className="message-action-btn delete" title="Delete message">
                        <FaTrash />
                    </button>
                </div>
            )}
        </div>
    );
};

const GroupChat = () => {
    const { groupId, inviteLink } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.currentuserreducer);
    const groups = useSelector(state => state.groups.data);
    const messages = useSelector(state => state.messages.data);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [groupInfo, setGroupInfo] = useState(null);
    const [showGroupMenu, setShowGroupMenu] = useState(false);

    useEffect(() => {
        dispatch(getGroups());
    }, [dispatch]);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchMessages(groupId));
        }
    }, [dispatch, groupId]);

    useEffect(() => {
        if (!currentUser?.result) {
            setError('Please log in to access the group chat.');
            return;
        }

        const loadGroup = () => {
            if (!groups) {
                // Data is not loaded yet, wait for the next render
                return;
            }
            try {
                let group;
                if (inviteLink) {
                    group = groups.find(g => g.inviteLink === inviteLink);
                    if (group) {
                        if (!group.members.find(m => m._id === currentUser?.result?._id)) {
                            const updatedGroup = {
                                ...group,
                                members: [...group.members, currentUser.result]
                            };
                            dispatch(updateGroupData(updatedGroup));
                            group = updatedGroup;
                        }
                        navigate(`/group/${group._id}`);
                    }
                } else {
                    group = groups.find(g => g._id === groupId);
                }

                if (!group) {
                    throw new Error('Group not found');
                }

                setGroupInfo(group);
                // In a real app, you would fetch messages for the group here
                // loadMessages(); 
            } catch (error) {
                setError('Failed to load group');
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [groupId, inviteLink, currentUser, navigate, groups, dispatch]);

    // Detect new messages when not at bottom
    useEffect(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (!isAtBottom && messages.length > 0) {
            setHasNewMessages(true);
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setHasNewMessages(false);
    };

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        setShowScrollButton(!isNearBottom);
        if (isNearBottom) {
            setHasNewMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const messageData = {
            groupId,
            sender: currentUser.result._id,
            senderName: currentUser.result.name,
            content: newMessage.trim()
        };
        await dispatch(sendMessage(messageData));
        setNewMessage('');
        scrollToBottom();
    };

    const handleEditMessage = async (messageId, newContent) => {
        await dispatch(editMessageAction(messageId, newContent));
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            await dispatch(deleteMessageAction(messageId));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const getGroupEmoji = () => {
        const emojis = ['🚀', '💬', '🎯', '🎮', '💡', '🎨', '🎵', '📚', '🌟', '🎪'];
        const index = groupId ? Math.abs(groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % emojis.length : 0;
        return emojis[index];
    };

    const handleDeleteGroup = async () => {
        if (!groupInfo || !currentUser?.result?._id) return;
        if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
        try {
            await API.delete(`/groups/${groupInfo._id}?userId=${currentUser.result._id}`);
            navigate('/');
        } catch (err) {
            alert('Failed to delete group.');
        }
    };

    if (!currentUser?.result) {
        return (
            <div className="group-chat-page">
                <div className="error-message">
                    Please log in to access the group chat.
                </div>
            </div>
        );
    }

    return (
        <div className="group-chat-page">
            <div className="group-chat-container">
                {/* <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
                    <FaBars />
                </button> */}
                <div className="chat-sidebar">
                    <div className="group-info">
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'}}>
                            <div className="chat-header-room-icon">
                                {getGroupEmoji()}
                            </div>
                            <h2 className="group-name" style={{margin: 0}}>
                                {groupInfo?.name}
                            </h2>
                        </div>
                        <div className="member-count">
                            {groupInfo?.members?.length || 0} members
                        </div>
                    </div>
                    <div className="members-list">
                        {groupInfo?.members?.map(member => (
                            <div key={member._id} className="member-item">
                                <UserAvatar user={member} />
                                <div>{member.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-main">
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <div className="chat-header-room-icon">
                                {getGroupEmoji()}
                            </div>
                            <div className="chat-header-info">
                                <div className="chat-header-room-name">
                                    {groupInfo?.name}
                                </div>
                                <div className="chat-header-members">
                                    <FaUsers size={14} />
                                    {groupInfo?.members?.length || 0} members
                                </div>
                            </div>
                        </div>
                        <div className="chat-header-actions" style={{ position: 'relative' }}>
                            {groupInfo && groupInfo.creator === currentUser?.result?._id && (
                                <>
                                    <button className="chat-header-btn" title="More options" onClick={() => setShowGroupMenu(v => !v)}>
                                        <FaEllipsisV />
                                    </button>
                                    {showGroupMenu && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '2.5rem',
                                            right: 0,
                                            background: '#222',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            zIndex: 10,
                                            minWidth: '140px',
                                            padding: '0.5rem 0'
                                        }}>
                                            <button
                                                onClick={() => { setShowGroupMenu(false); handleDeleteGroup(); }}
                                                style={{
                                                    width: '100%',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#e74c3c',
                                                    padding: '0.1rem 0.2rem',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    fontWeight: 500,
                                                    fontSize: '1rem',
                                                    borderRadius: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <FaTrash style={{ verticalAlign: 'middle' }} /> Delete Group
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div 
                        className="messages-container" 
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                    >
                        {loading ? (
                            <div className="loading">Loading messages...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <Message
                                        key={message._id}
                                        message={message}
                                        currentUser={currentUser}
                                        onEdit={handleEditMessage}
                                        onDelete={handleDeleteMessage}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                                {showScrollButton && (
                                    <button 
                                        className="scroll-to-bottom-btn"
                                        onClick={scrollToBottom}
                                        title="Scroll to bottom"
                                    >
                                        <FaArrowDown />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    {hasNewMessages && (
                        <div className="new-messages-indicator center" onClick={scrollToBottom}>
                            <FaCircle className="pulse" />
                            <span>New Messages</span>
                        </div>
                    )}
                    <div className="message-input-container">
                        <textarea
                            className="message-input"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            className="send-button"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            title="Send message"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupChat;