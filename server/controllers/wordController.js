const Word = require('../models/Word');
const List = require('../models/List');

const getWordsByList = async (req, res) => {
    try {
        const { listId } = req.params;
        const words = await Word.find({ listId }, '-_id -__v');
        res.send(words);
    } catch (err) {
        res.status(500).send({ message: 'Error fetching words' });
    }
};

const createWord = async (req, res) => {
    try {
        const { listId } = req.params;
        const { front, back } = req.body;
        
        if (!front || !back) return res.status(400).send({ message: 'Front and back are required' });
        
        // Check if the parent list exists
        const listExists = await List.findOne({ id: listId });
        if (!listExists) return res.status(404).send({ message: 'List not found' });
        
        const newWord = new Word({
            id: `w${Date.now()}`,
            type: 'word',
            front,
            back,
            bucket: 1,
            starred: false,
            listId
        });
        
        await newWord.save();
        
        const wordObj = newWord.toObject();
        delete wordObj._id;
        delete wordObj.__v;
        
        res.status(201).send(wordObj);
    } catch (err) {
        res.status(500).send({ message: 'Error saving data' });
    }
};

const updateWord = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedWord = await Word.findOneAndUpdate(
            { id }, 
            { $set: updates }, 
            { new: true, projection: '-_id -__v' }
        );
        
        if (!updatedWord) return res.status(404).send({ message: 'Card not found' });
        res.status(200).send(updatedWord);
    } catch (err) {
        res.status(500).send({ message: 'Error saving data' });
    }
};

const deleteWord = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedWord = await Word.findOneAndDelete({ id });
        
        if (!deletedWord) return res.status(404).send({ message: 'Card not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).send({ message: 'Error saving data' });
    }
};

module.exports = { getWordsByList, createWord, updateWord, deleteWord };