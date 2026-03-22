const List = require('../models/List');
const Word = require('../models/Word');

const getLists = async (req, res) => {
    try {
        // Fetch all lists, exclude MongoDB internal fields
        const lists = await List.find({}, '-_id -__v');
        res.send(lists);
    } catch (err) {
        res.status(500).send({ message: 'Error fetching lists' });
    }
};

const createList = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).send({ message: 'List name is required' });
        
        const newList = new List({
            id: `list${Date.now()}`,
            name,
            completed: false
        });
        
        await newList.save();
        
        // Remove internal fields before sending response
        const listObj = newList.toObject();
        delete listObj._id;
        delete listObj.__v;
        
        res.status(201).send(listObj);
    } catch (err) {
        res.status(500).send({ message: 'Error creating list' });
    }
};

const updateList = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).send({ message: 'New name is required' });

        const updatedList = await List.findOneAndUpdate(
            { id }, 
            { name }, 
            { new: true, projection: '-_id -__v' }
        );
        
        if (!updatedList) return res.status(404).send({ message: 'List not found' });
        res.status(200).send(updatedList);
    } catch (err) {
        res.status(500).send({ message: 'Error updating list' });
    }
};

const deleteList = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedList = await List.findOneAndDelete({ id });
        
        if (!deletedList) return res.status(404).send({ message: 'List not found' });
        
        // Cascade delete: remove all words associated with this list
        await Word.deleteMany({ listId: id });
        
        res.status(204).send();
    } catch (err) {
        res.status(500).send({ message: 'Error deleting list data' });
    }
};

const updateListCompletion = async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        
        if (typeof completed !== 'boolean') {
            return res.status(400).send({ message: 'Completed status must be a boolean' });
        }

        const updatedList = await List.findOneAndUpdate(
            { id }, 
            { completed }, 
            { new: true, projection: '-_id -__v' }
        );
        
        if (!updatedList) return res.status(404).send({ message: 'List not found' });
        res.status(200).send(updatedList);
    } catch (err) {
        res.status(500).send({ message: 'Error saving list completion status' });
    }
};

const createListWithBulkWords = async (req, res) => {
    try {
        const { name, words } = req.body;
        
        if (!name) return res.status(400).send({ message: 'List name is required' });
        if (!words || !Array.isArray(words)) return res.status(400).send({ message: 'Words array is required' });

        // 1. Create the new list
        const listId = `list${Date.now()}`;
        const newList = new List({
            id: listId,
            name,
            completed: false
        });
        
        await newList.save();

        // 2. Format the words for DB insertion
        const formattedWords = words.map((word, index) => ({
            id: `w${Date.now()}_${index}`,
            type: 'word',
            front: word.front,
            back: word.back,
            bucket: 1,
            starred: false,
            listId: listId
        }));

        // 3. Bulk insert all words
        if (formattedWords.length > 0) {
            await Word.insertMany(formattedWords);
        }

        const listObj = newList.toObject();
        delete listObj._id;
        delete listObj.__v;

        res.status(201).send({ list: listObj, wordsAdded: formattedWords.length });
    } catch (err) {
        res.status(500).send({ message: 'Error in bulk creation' });
    }
};


const verifyAdminPassword = (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        return res.status(200).send({ success: true });
    }
    return res.status(401).send({ success: false, message: 'סיסמה שגויה' });
};
module.exports = { 
    getLists, 
    createList, 
    updateList, 
    deleteList, 
    updateListCompletion,
    verifyAdminPassword,
    createListWithBulkWords
};