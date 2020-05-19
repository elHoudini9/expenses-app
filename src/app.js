const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { validationResult } = require('express-validator')
const db = require('./db')
const validationRules = require('./validationRules')

const app = express()
const port = 3000

app.use(express.static('public'))
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Views
app.get('/', (req, res) => res.redirect('/form'))

app.get('/form', (req, res) => res.render('form', { title: 'Expense Form' }))

app.get('/list', async (req, res) => {
  try {
    const query = await db.query(
      `select * from expenses where description ilike $1`,
      [`%${req.query.search}%`]
    )
    res.render('list', {
      expenses: query.rows,
      title: 'Expense List',
      search: req.query.search
    })
  } catch (err) {
    res.json(err)
    console.log(err)
  }
})

app.get('/list/:description', async (req, res) => {
  try {
    const query = await db.query(
      `select * from expenses where description ilike '%${req.params.description}%'`
    )
    res.render('list', {
      expenses: query.rows,
      search: req.params.description,
      title: 'Expense List'
    })
  } catch (err) {
    res.json(err)
    console.log(err)
  }
})

app.get('/editor/:id', async (req, res) => {
  const { id } = req.params

  try {
    const query = await db.query(
      'select * from expenses where expenseid = $1',
      [id]
    )
    if (query.rowCount > 0) {
      res.render('editor', { data: query.rows[0] })
    } else {
      res.redirect('/list')
    }
  } catch (err) {
    res.json(err)
    console.log(err)
  }
})

// Insert
app.post('/form', validationRules, async (req, res) => {
  const errors = validationResult(req)
  console.log(errors)
  const { expenseDate, description, category, paymentType, amount } = req.body

  const text = `
    insert into
      expenses (expense_date, entry_time, description, category, payment_type, amount) 
      values ($1, $2, $3, $4, $5, $6)
  `

  const values = [
    expenseDate,
    new Date(),
    description,
    category,
    paymentType,
    amount
  ]
  try {
    if (errors.isEmpty()) {
      await db.query(text, values)
      res.redirect('/list')
    } else {
      res.render('form', {
        title: 'Expense Form',
        errors: errors.array(),
        data: req.body
      })
    }
  } catch (err) {
    res.json(err)
    console.log(err)
  }
})

// Update
app.post('/update/:id', validationRules, async (req, res) => {
  const errors = validationResult(req)
  const { id } = req.params
  const { expenseDate, description, category, paymentType, amount } = req.body
  const text = `
    update expenses set
      expense_date = $1,
      description = $2,
      category = $3,
      payment_type = $4,
      amount = $5
    where expenseid = $6
  `
  const values = [expenseDate, description, category, paymentType, amount, id]

  try {
    if (errors.isEmpty()) {
      await db.query(text, values)
      res.redirect('/list')
    } else {
      res.redirect(`/editor/${id}`)
    }
  } catch (err) {
    console.log(err)
    res.json(err)
  }
})

// Delete
app.post('/delete/:id', async (req, res) => {
  const { id } = req.params
  try {
    const query = await db.query('delete from expenses where expenseid = $1', [
      id
    ])
    res.redirect('/list')
  } catch (err) {
    res.json(err)
    console.log(err)
  }
})

app.listen(port, () =>
  console.log(`Jeff's expenses app is listening at http://localhost:${port}!`)
)
