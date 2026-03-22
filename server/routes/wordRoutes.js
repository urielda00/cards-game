const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

router.get('/lists/:listId/words', wordController.getWordsByList);
router.post('/lists/:listId/words', wordController.createWord);
router.patch('/words/:id', wordController.updateWord);
router.delete('/words/:id', wordController.deleteWord);

module.exports = router;