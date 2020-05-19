const { check } = require('express-validator')

module.exports = [
  check('expenseDate')
    .isISO8601()
    .toDate()
    .withMessage('Expense Date should be a valid date!'),
  check('description')
    .isLength({ min: 1, max: 60 })
    .withMessage("Description shouldn't be longer than 60 characters!"),
  check('category')
    .isLength({ min: 1, max: 30 })
    .withMessage("Category shouldn't be longer than 30 characters!"),
  check('paymentType')
    .isLength({ min: 1, max: 30 })
    .withMessage("Payment Type shouldn't be longer than 30 characters!"),
  check('amount').isNumeric().withMessage('Amount should be a number!')
]
