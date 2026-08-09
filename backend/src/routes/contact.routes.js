const express = require('express');
const {
  searchUsers,
  sendContactRequest,
  getReceivedRequests,
  getSentRequests,
  acceptContactRequest,
  rejectContactRequest,
  getContacts,
} = require('../controllers/contact.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/users/search', searchUsers);
router.post('/contact-requests', sendContactRequest);
router.get('/contact-requests/received', getReceivedRequests);
router.get('/contact-requests/sent', getSentRequests);
router.patch('/contact-requests/:requestId/accept', acceptContactRequest);
router.patch('/contact-requests/:requestId/reject', rejectContactRequest);
router.get('/contacts', getContacts);

module.exports = router;
