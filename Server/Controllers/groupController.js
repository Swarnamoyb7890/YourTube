import Group from '../Models/Group.js';

export const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const group = new Group({ name, members });
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
        const deletedGroup = await Group.findByIdAndDelete(id);
        if (!deletedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting group', error: error.message });
    }
}; 