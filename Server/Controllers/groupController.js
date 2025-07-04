import Group from '../Models/Group.js';
import mongoose from 'mongoose';

export const createGroup = async (req, res) => {
    try {
        const { name, members, creator } = req.body;
        const group = new Group({ name, members, creator });
        await group.save();

        // Generate invite link after _id is available
        const frontendUrl = process.env.FRONTEND_URL || 'https://yourtubesb.netlify.app';
        const inviteLink = `${frontendUrl}/group/join/${group._id}`;

        // Save invite link in both inviteLink field and description
        group.inviteLink = inviteLink;
        group.description = `Invite Link: ${inviteLink}\n\nShare this link with others to invite them to the group.`;
        await group.save();

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error creating group', error: error.message });
    }
};

export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('members');
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, members } = req.body;
        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { name, members },
            { new: true, runValidators: true }
        );
        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: 'Error updating group', error: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the creator can delete this group.' });
        }
        await group.deleteOne();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting group', error: error.message });
    }
};

export const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, userName } = req.body;

        console.log('Join group request:', { groupId, userId, userName });

        if (!userId || !userName) {
            console.log('Missing required fields:', { userId, userName });
            return res.status(400).json({ message: 'User ID and name are required' });
        }

        // Validate userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid userId format:', userId);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Validate groupId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            console.log('Invalid groupId format:', groupId);
            return res.status(400).json({ message: 'Invalid group ID format' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            console.log('Group not found:', groupId);
            return res.status(404).json({ message: 'Group not found' });
        }

        console.log('Found group:', {
            groupId: group._id,
            name: group.name,
            currentMembers: group.members.length
        });

        // Check if user is already a member
        const isAlreadyMember = group.members.some(member => member.toString() === userId);
        if (isAlreadyMember) {
            console.log('User already a member:', userId);
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        // Add user to group (just the userId as ObjectId)
        group.members.push(userId);
        await group.save();

        console.log('User added to group successfully');

        // Populate the members to return full user data
        await group.populate('members');

        res.status(200).json({
            message: 'Successfully joined group',
            group: group
        });
    } catch (error) {
        console.error('Error joining group:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Error joining group', error: error.message });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId).populate('members');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ message: 'Error fetching group', error: error.message });
    }
};

export const regenerateInviteLink = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is the creator
        if (group.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the group creator can regenerate invite links' });
        }

        // Generate new invite link
        const frontendUrl = process.env.FRONTEND_URL || 'https://yourtubesb.netlify.app';
        const inviteLink = `${frontendUrl}/group/join/${group._id}`;

        // Update invite link and description
        group.inviteLink = inviteLink;
        group.description = `Invite Link: ${inviteLink}\n\nShare this link with others to invite them to the group.`;
        await group.save();

        res.status(200).json({
            message: 'Invite link regenerated successfully',
            group: group
        });
    } catch (error) {
        console.error('Error regenerating invite link:', error);
        res.status(500).json({ message: 'Error regenerating invite link', error: error.message });
    }
}; 