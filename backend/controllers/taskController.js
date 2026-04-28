import { getAllTasks, getTaskById, createTask, updateTask, deleteTask, completeTask, getAnalytics } from '../models/taskModel.js';

export const getTasks = async (req, res) => {
  try {
    const tasks = await getAllTasks(req.user.userId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await getTaskById(req.params.id, req.user.userId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const task = await createTask(req.user.userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const editTask = async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.user.userId, req.body);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeTask = async (req, res) => {
  try {
    await deleteTask(req.params.id, req.user.userId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markComplete = async (req, res) => {
  try {
    const task = await completeTask(req.params.id, req.user.userId);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTaskAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalytics(req.user.userId);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
