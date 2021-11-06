const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.some(user => user.username === username);

  if (!userExists) return response.status(404).json({
    error: 'User not found!'
  });

  request.username = username

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) return response.status(400).json({ error: "User already exists!" })

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  const userTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), //should be passed as yyyy-mm-dd,
    created_at: new Date()
  }

  user.todos.push(userTodos);

  return response.status(201).json(userTodos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  let todosExists = user.todos.find(todo => todo.id === id);

  if (!todosExists) return response.status(404).json({ error: "Todo not found!" });

  todosExists.title = title;
  todosExists.deadline = new Date(deadline);

  return response.status(200).json(todosExists);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find(user => user.username === username);

  let todosExists = user.todos.find(todo => todo.id === id);

  if (!todosExists) return response.status(404).json({ error: "Todo not found!" });

  todosExists.done = true;

  return response.status(200).json(todosExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  let user = users.find(user => user.username === username);

  let todosExists = user.todos.find(todo => todo.id === id);

  if (!todosExists) return response.status(404).json({ error: "Todo not found!" })

  const todoIndex = user.todos.indexOf(todosExists);

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;