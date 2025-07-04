import Group from '../Models/Group.js';

export const createGroup = async (req, res) => {
    try {
        const { name, members, creator } = req.body;
        const group = new Group({ name, members, creator });
        await group.save();
        // Generate invite link after _id is available
        // Use frontend URL for invite links
        const frontendUrl = process.env.FRONTEND_URL || 'https://yourtubesb.netlify.app';
        group.inviteLink = `${frontendUrl}/group/join/${group._id}`;
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

        if (!userId || !userName) {
            return res.status(400).json({ message: 'User ID and name are required' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is already a member
        const isAlreadyMember = group.members.some(member => member.userId === userId);
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        // Add user to group
        group.members.push({ userId, userName });
        await group.save();

        res.status(200).json({
            message: 'Successfully joined group',
            group: group
        });
    } catch (error) {
        console.error('Error joining group:', error);
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