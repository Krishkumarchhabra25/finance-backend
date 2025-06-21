const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createCard, getAllCards, getCardById, getCardByAccount, updateCard, deleteCard } = require('../controller/CardController');
const router = express.Router();

router.post("/createCard" , protect , createCard)
router.get("/getall-cards" , protect , getAllCards)
router.post("/getcard-byId/:id" , protect , getCardById)
router.get("/getcard-byAccount" , protect , getCardByAccount)
router.put("/updateCard/:id" , protect , updateCard)
router.delete("/delete-Card/:id" , protect , deleteCard)

module.exports = router;
