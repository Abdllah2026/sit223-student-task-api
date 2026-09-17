const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

let tasks = [
  {
    id: 1,
    title: 'Review Jenkins pipeline',
    completed: false
  },
  {
    id: 2,
    title: 'Check security scan',
    completed: true
  }
];

app.get('/', (req, res) => {
  res.send('SIT223 Student Task API is running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    project: 'SIT223 Student Task API',
    version: '2.0.0',
    status: 'Running'
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Create a new task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      error: 'Task title is required'
    });
  }

  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
    title,
    completed: false
  };

  tasks.push(newTask);

  return res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find(item => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  if (req.body.title !== undefined) {
    task.title = req.body.title;
  }

  if (req.body.completed !== undefined) {
    task.completed = req.body.completed;
  }

  return res.json(task);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const taskIndex = tasks.findIndex(item => item.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  return res.json({
    message: 'Task deleted successfully',
    task: deletedTask
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;