import Message from '../Models/Message.js';

export const sendMessage = async (req, res) => {
    try {
        const { groupId, sender, content } = req.body;
        const message = new Message({ groupId, sender, content });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId }).populate('sender');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

export const updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedMessage = await Message.findByIdAndUpdate(
            id,
            { content, isEdited: true },
            { new: true, runValidators: true }
        );
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating message', error: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMessage = await Message.findByIdAndDelete(id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
}; 