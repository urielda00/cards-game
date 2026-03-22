const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/', listController.getLists);
router.post('/', listController.createList);
router.post('/bulk', listController.createListWithBulkWords);
router.patch('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);
router.patch('/:id/complete', listController.updateListCompletion);
router.post('/verify-password', listController.verifyAdminPassword);

module.exports = router;