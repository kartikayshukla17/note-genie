import User from '../models/User.js';

// Recursive helper to find item in tree
const findItemInTree = (items, itemId) => {
    for (const item of items) {
        if (item.id === itemId) return item;
        if (item.children && item.children.length > 0) {
            const found = findItemInTree(item.children, itemId);
            if (found) return found;
        }
    }
    return null;
};

// Recursive helper to delete item from tree
const deleteItemFromTree = (items, itemId) => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            items.splice(i, 1);
            return true;
        }
        if (items[i].children && items[i].children.length > 0) {
            if (deleteItemFromTree(items[i].children, itemId)) {
                return true;
            }
        }
    }
    return false;
};

export const getFolders = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ folders: user.folders || [] });
    } catch (error) {
        console.error('Get folders error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const createItem = async (req, res) => {
    try {
        const { type, name, title, content, parentId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const newItem = {
            id: `${type}_${Date.now()}`,
            type,
            name: type === 'folder' ? (name || 'New Folder') : undefined,
            title: type === 'note' ? (title || 'Untitled') : undefined,
            content: type === 'note' ? (content || '') : undefined,
            children: type === 'folder' ? [] : undefined,
            createdAt: Date.now(),
            lastUpdate: Date.now()
        };

        if (parentId) {
            const parent = findItemInTree(user.folders, parentId);
            if (!parent || parent.type !== 'folder') {
                return res.status(404).json({ message: "Parent folder not found" });
            }
            parent.children.push(newItem);
        } else {
            user.folders.push(newItem);
        }

        user.markModified('folders');
        await user.save();
        res.status(201).json({ item: newItem });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, content } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const item = findItemInTree(user.folders, id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (item.type === 'folder' && name !== undefined) {
            item.name = name;
        } else if (item.type === 'note') {
            if (title !== undefined) item.title = title;
            if (content !== undefined) item.content = content;
            item.lastUpdate = Date.now();
        }

        user.markModified('folders');
        await user.save();
        res.status(200).json({ item });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const deleted = deleteItemFromTree(user.folders, id);
        if (!deleted) {
            return res.status(404).json({ message: "Item not found" });
        }

        user.markModified('folders');
        await user.save();
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
