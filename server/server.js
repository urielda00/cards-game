const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const dataCache = {
	words: [],
	lists: [],
	imageCards: [],
	imageLists: [],
};

const dataPath = path.join(__dirname, 'data');

const loadDataIntoCache = async () => {
	try {
		dataCache.words = JSON.parse(await fs.readFile(path.join(dataPath, 'words.json'), 'utf8'));
		dataCache.lists = JSON.parse(await fs.readFile(path.join(dataPath, 'lists.json'), 'utf8'));
		dataCache.imageCards = JSON.parse(
			await fs.readFile(path.join(dataPath, 'imageCards.json'), 'utf8')
		);
		dataCache.imageLists = JSON.parse(
			await fs.readFile(path.join(dataPath, 'imageLists.json'), 'utf8')
		);
		console.log('All data (words & images) loaded into cache successfully.');
	} catch (error) {
		console.error('Failed to load data into cache:', error);
		process.exit(1);
	}
};

app.use(
	cors({
		//origin: 'https://cards-game-nb5r.onrender.com',
		origin: 'https://cards-gamee.netlify.app',
	})
);
app.use(express.json());

app.use((req, res, next) => {
	const oldSend = res.send;
	res.send = function (data) {
		const now = new Date();
		const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
		console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
		res.send = oldSend;
		return res.send(data);
	};
	next();
});

// --- WORD LISTS API ---
app.get('/api/lists', (req, res) => res.send(dataCache.lists));
app.post('/api/lists', async (req, res) => {
	const { name } = req.body;
	if (!name) return res.status(400).send({ message: 'List name is required' });
	const newList = { id: `list${Date.now()}`, name: name, completed: false };
	dataCache.lists.push(newList);
	try {
		await fs.writeFile(path.join(dataPath, 'lists.json'), JSON.stringify(dataCache.lists, null, 2));
		res.status(201).send(newList);
	} catch (err) {
		res.status(500).send({ message: 'Error saving new list' });
	}
});
app.patch('/api/lists/:id', async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	const listIndex = dataCache.lists.findIndex((l) => l.id === id);
	if (listIndex === -1) return res.status(404).send({ message: 'List not found' });
	if (!name) return res.status(400).send({ message: 'New name is required' });
	dataCache.lists[listIndex].name = name;
	try {
		await fs.writeFile(path.join(dataPath, 'lists.json'), JSON.stringify(dataCache.lists, null, 2));
		res.status(200).send(dataCache.lists[listIndex]);
	} catch (err) {
		res.status(500).send({ message: 'Error saving list' });
	}
});
app.delete('/api/lists/:id', async (req, res) => {
	const { id } = req.params;
	const initialListLength = dataCache.lists.length;
	dataCache.lists = dataCache.lists.filter((l) => l.id !== id);
	if (dataCache.lists.length === initialListLength)
		return res.status(404).send({ message: 'List not found' });
	dataCache.words = dataCache.words.filter((w) => w.listId !== id);
	try {
		await fs.writeFile(path.join(dataPath, 'lists.json'), JSON.stringify(dataCache.lists, null, 2));
		await fs.writeFile(path.join(dataPath, 'words.json'), JSON.stringify(dataCache.words, null, 2));
		res.status(204).send();
	} catch (err) {
		res.status(500).send({ message: 'Error deleting list data' });
	}
});
app.patch('/api/lists/:id/complete', async (req, res) => {
	const { id } = req.params;
	const { completed } = req.body;
	const listIndex = dataCache.lists.findIndex((l) => l.id === id);
	if (listIndex === -1) return res.status(404).send({ message: 'List not found' });
	if (typeof completed !== 'boolean')
		return res.status(400).send({ message: 'Completed status must be a boolean' });
	dataCache.lists[listIndex].completed = completed;
	try {
		await fs.writeFile(path.join(dataPath, 'lists.json'), JSON.stringify(dataCache.lists, null, 2));
		res.status(200).send(dataCache.lists[listIndex]);
	} catch (err) {
		res.status(500).send({ message: 'Error saving list completion status' });
	}
});

// --- WORD CARDS API ---
app.get('/api/lists/:listId/words', (req, res) => {
	const { listId } = req.params;
	res.send(dataCache.words.filter((w) => w.listId === listId));
});
app.post('/api/lists/:listId/words', async (req, res) => {
	const { listId } = req.params;
	const { front, back } = req.body;
	if (!front || !back) return res.status(400).send({ message: 'Front and back are required' });
	if (!dataCache.lists.find((l) => l.id === listId))
		return res.status(404).send({ message: 'List not found' });
	const newWord = {
		id: `w${Date.now()}`,
		type: 'word',
		front,
		back,
		bucket: 1,
		starred: false,
		listId: listId,
	};
	dataCache.words.push(newWord);
	try {
		await fs.writeFile(path.join(dataPath, 'words.json'), JSON.stringify(dataCache.words, null, 2));
		res.status(201).send(newWord);
	} catch (err) {
		res.status(500).send({ message: 'Error saving data' });
	}
});
app.patch('/api/words/:id', async (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	const cardIndex = dataCache.words.findIndex((c) => c.id === id);
	if (cardIndex === -1) return res.status(404).send({ message: 'Card not found' });
	dataCache.words[cardIndex] = { ...dataCache.words[cardIndex], ...updates };
	try {
		await fs.writeFile(path.join(dataPath, 'words.json'), JSON.stringify(dataCache.words, null, 2));
		res.status(200).send(dataCache.words[cardIndex]);
	} catch (err) {
		res.status(500).send({ message: 'Error saving data' });
	}
});
app.delete('/api/words/:id', async (req, res) => {
	const { id } = req.params;
	const initialLength = dataCache.words.length;
	dataCache.words = dataCache.words.filter((c) => c.id !== id);
	if (dataCache.words.length === initialLength)
		return res.status(404).send({ message: 'Card not found' });
	try {
		await fs.writeFile(path.join(dataPath, 'words.json'), JSON.stringify(dataCache.words, null, 2));
		res.status(204).send();
	} catch (err) {
		res.status(500).send({ message: 'Error saving data' });
	}
});

// ========================================================
// --- IMAGE LISTS API ---
// ========================================================
app.get('/api/image-lists', (req, res) => res.send(dataCache.imageLists));
app.post('/api/image-lists', async (req, res) => {
	const { name } = req.body;
	if (!name) return res.status(400).send({ message: 'List name is required' });
	const newList = { id: `imglist${Date.now()}`, name, completed: false };
	dataCache.imageLists.push(newList);
	try {
		await fs.writeFile(
			path.join(dataPath, 'imageLists.json'),
			JSON.stringify(dataCache.imageLists, null, 2)
		);
		res.status(201).send(newList);
	} catch (err) {
		res.status(500).send({ message: 'Error saving new image list' });
	}
});
app.delete('/api/image-lists/:id', async (req, res) => {
	const { id } = req.params;
	const initialLength = dataCache.imageLists.length;
	dataCache.imageLists = dataCache.imageLists.filter((l) => l.id !== id);
	if (dataCache.imageLists.length === initialLength)
		return res.status(404).send({ message: 'Image list not found' });
	dataCache.imageCards = dataCache.imageCards.filter((c) => c.listId !== id);
	try {
		await fs.writeFile(
			path.join(dataPath, 'imageLists.json'),
			JSON.stringify(dataCache.imageLists, null, 2)
		);
		await fs.writeFile(
			path.join(dataPath, 'imageCards.json'),
			JSON.stringify(dataCache.imageCards, null, 2)
		);
		res.status(204).send();
	} catch (err) {
		res.status(500).send({ message: 'Error deleting image list data' });
	}
});

// ========================================================
// --- IMAGE CARDS API ---
// ========================================================
app.get('/api/image-lists/:listId/cards', (req, res) => {
	const { listId } = req.params;
	res.send(dataCache.imageCards.filter((c) => c.listId === listId));
});

// --- THIS IS THE MISSING/ADDED PART ---
app.patch('/api/image-cards/:id', async (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	const cardIndex = dataCache.imageCards.findIndex((c) => c.id === id);
	if (cardIndex === -1) return res.status(404).send({ message: 'Image card not found' });

	dataCache.imageCards[cardIndex] = { ...dataCache.imageCards[cardIndex], ...updates };
	try {
		await fs.writeFile(
			path.join(dataPath, 'imageCards.json'),
			JSON.stringify(dataCache.imageCards, null, 2)
		);
		res.status(200).send(dataCache.imageCards[cardIndex]);
	} catch (err) {
		res.status(500).send({ message: 'Error saving image card' });
	}
});

app.delete('/api/image-cards/:id', async (req, res) => {
	const { id } = req.params;
	const initialLength = dataCache.imageCards.length;
	dataCache.imageCards = dataCache.imageCards.filter((c) => c.id !== id);
	if (dataCache.imageCards.length === initialLength)
		return res.status(404).send({ message: 'Image card not found' });
	try {
		await fs.writeFile(
			path.join(dataPath, 'imageCards.json'),
			JSON.stringify(dataCache.imageCards, null, 2)
		);
		res.status(204).send();
	} catch (err) {
		res.status(500).send({ message: 'Error saving data' });
	}
});

loadDataIntoCache().then(() => {
	app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
});
