import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

const API_URL = 'https://fullstack-1q3k.onrender.com/todos';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tasks');
    }
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask, completed: false }),
      });
      setNewTask('');
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, completed: !task.completed }),
      });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.title);
  };

  const handleUpdate = async (id) => {
    if (!editingText.trim()) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingText }),
      });
      setEditingTaskId(null);
      setEditingText('');
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.appTitle, darkMode && styles.darkText]}>REACT'S</Text>
        <Text style={[styles.todoTitle, darkMode && styles.darkText]}>My To-Do List</Text>
        <View style={styles.modeToggle}>
          <Text style={darkMode ? styles.darkText : styles.lightText}>{darkMode ? '☀️ Light' : '🌙 Dark'}</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, darkMode && styles.darkInput]}
          placeholder="Add a new task..."
          placeholderTextColor={darkMode ? '#c2a68d' : '#6e4b3d'}
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Add Task" onPress={handleAdd} color="#6e4b3d" />
      </View>

      <ScrollView style={styles.taskList}>
        {filteredTasks.map((task) => (
          <View key={task.id} style={[styles.taskCard, darkMode && styles.darkTaskCard]}>
            <TouchableOpacity onPress={() => handleToggleComplete(task)} style={styles.checkbox}>
              <Text style={task.completed ? styles.completed : styles.incomplete}>
                {task.completed ? '☑️' : '⬜'}
              </Text>
            </TouchableOpacity>
            {editingTaskId === task.id ? (
              <>
                <TextInput
                  style={[styles.editInput, darkMode && styles.darkInput]}
                  value={editingText}
                  onChangeText={setEditingText}
                />
                <Button title="Save" onPress={() => handleUpdate(task.id)} color="#6e4b3d" />
              </>
            ) : (
              <Text style={[styles.taskTitle, task.completed && styles.completed, darkMode && styles.darkText]}>
                {task.title}
              </Text>
            )}
            <View style={styles.taskActions}>
              <Button title="Edit" onPress={() => handleEdit(task)} color="#6e4b3d" />
              <Button title="Delete" onPress={() => handleDelete(task.id)} color="#b22222" />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.filters}>
        <Button title="All" onPress={() => setFilter('all')} color={filter === 'all' ? '#6e4b3d' : '#decab9'} />
        <Button
          title="Completed"
          onPress={() => setFilter('completed')}
          color={filter === 'completed' ? '#6e4b3d' : '#decab9'}
        />
        <Button
          title="Pending"
          onPress={() => setFilter('pending')}
          color={filter === 'pending' ? '#6e4b3d' : '#decab9'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f7e1d5',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  darkContainer: {
    backgroundColor: '#3b2f2b',
  },

  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Pacifico',
    color: '#6e4b3d',
  },
  todoTitle: {
    fontSize: 20,
    fontFamily: 'Pacifico',
    color: '#6e4b3d',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },

  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  inputGroup: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  input: {
    borderColor: '#6e4b3d',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    color: '#6e4b3d',
    width: 200,
    backgroundColor: '#f7e1d5',
  },
  darkInput: {
    backgroundColor: '#4a3a3a',
    color: '#fff',
    borderColor: '#b5a397',
  },

  taskList: {
    width: '100%',
    marginBottom: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0c2a6',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'space-between',
  },
  darkTaskCard: {
    backgroundColor: '#4a3a3a',
  },

  checkbox: {
    marginRight: 10,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#6e4b3d',
  },
  incomplete: {
    color: '#000',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#6e4b3d',
  },

  editInput: {
    borderColor: '#6e4b3d',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    color: '#6e4b3d',
    width: 180,
    backgroundColor: '#f7e1d5',
  },

  taskActions: {
    flexDirection: 'row',
    gap: 5,
  },

  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
});
