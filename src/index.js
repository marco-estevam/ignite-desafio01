const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  let { username } = request.headers

  let user = users.find(user => user.username == username)

  if(!user) {
    response.status(404).json({error: 'User not found'})
  }
  
  request.user = user

  next()
}

app.post('/users', (request, response) => {
  let { name, username } = request.body

  let user = users.find(user => user.username == username)

  if(user) {
    response.status(400).json({error: 'Username alread exists'})
  }

  let data = { 
    id: uuidv4(), 
    name, 
    username, 
    todos: []
  }

  users.push(data)

  response.status(201).json(data)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  let {user} = request

  response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  let username = user.username
  let { title, deadline } = request.body

  let todo = { 
    id: uuidv4(), 
    title, 
    done: false, 
    deadline: new Date(deadline), 
	  created_at: new Date()
  }

  for (let i = 0; i < users.length; i++) {
    if(users[i].username === username){
      users[i].todos.push(todo)
    }
  }

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request
  let { title, deadline } = request.body

  let todo = user.todos.find(todo => todo.id == id)

  if(!todo) {
    response.status(404).json({error: 'To-do not found'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  let todo = user.todos.find(todo => todo.id == id)

  if(!todo) {
    response.status(404).json({error: 'To-do not found'})
  }

  todo.done = true

  response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  let todoIndex = user.todos.findIndex(todo => todo.id == id)
console.log(todoIndex)
  if(todoIndex < 0) {
    response.status(404).json({error: 'To-do not found'})
  }

  user.todos.splice(todoIndex, 1)

  response.status(204).json()
});

module.exports = app;