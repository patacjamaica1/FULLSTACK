import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button,
  FlatList, TouchableOpacity, StyleSheet, Switch
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  editing?: boolean;
  editText?: string;
};

const API_URL = "https://fullstack-1q3k.onrender.com/todos/";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [newTask, setNewTask] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") return;
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.trim(), completed: false }),
      });
      fetchTasks();
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleComplete = async (id: number) => {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;
    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const updatedTask: Task = await response.json();
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const startEditing = (id: number) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, editing: true, editText: task.title } : task
    ));
  };

  const confirmEdit = async (id: number) => {
    const task = tasks.find((task) => task.id === id);
    if (!task || !task.editText?.trim()) return;
    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, title: task.editText }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const updatedTask: Task = await response.json();
      setTasks(tasks.map((t) =>
        t.id === updatedTask.id ? { ...updatedTask, editing: false } : t
      ));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <View style={[styles.container, darkMode && styles.dark]}>
      <View style={styles.header}>
        <Text style={styles.title}>To-Do List</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
        <Text style={styles.modeText}>{darkMode ? "Dark Mode" : "Light Mode"}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Add Task" onPress={addTask} />
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.taskItem, item.completed && styles.completed]}>
            <View style={styles.taskContent}>
              <CheckBox
                value={item.completed}
                onValueChange={() => toggleComplete(item.id)}
              />
              {item.editing ? (
                <TextInput
                  style={styles.input}
                  value={item.editText}
                  onChangeText={(text) =>
                    setTasks(tasks.map((t) =>
                      t.id === item.id ? { ...t, editText: text } : t
                    ))
                  }
                  onEndEditing={() => confirmEdit(item.id)}
                  autoFocus
                />
              ) : (
                <Text style={styles.taskText}>{item.title}</Text>
              )}
            </View>
            <View style={styles.taskButtons}>
              {item.editing ? (
                <Button title="Save" onPress={() => confirmEdit(item.id)} />
              ) : (
                <Button title="Edit" onPress={() => startEditing(item.id)} />
              )}
              <Button title="Delete" onPress={() => deleteTask(item.id)} />
            </View>
          </View>
        )}
      />

      <View style={styles.filterButtons}>
        <TouchableOpacity style={[styles.filterButton, filter === "all" && styles.active]} onPress={() => setFilter("all")}>
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === "completed" && styles.active]} onPress={() => setFilter("completed")}>
          <Text>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === "pending" && styles.active]} onPress={() => setFilter("pending")}>
          <Text>Pending</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f2ef",
    justifyContent: "center",
    padding: 20,
  },
  dark: {
    backgroundColor: "#222",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modeText: {
    color: "#5a3e36",
  },
  inputContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: "#c2a68d",
    borderWidth: 1,
    borderRadius: 5,
  },
  taskItem: {
    backgroundColor: "#f2e1d9",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completed: {
    backgroundColor: "#ddd",
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskText: {
    marginLeft: 10,
  },
  taskButtons: {
    flexDirection: "row",
    gap: 5,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#decab9",
    borderRadius: 5,
  },
  active: {
    backgroundColor: "#a9746e",
  },
});

export default App;
