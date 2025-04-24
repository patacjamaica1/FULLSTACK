// App.js  (single‑file version)
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import axios from "axios";

/* ---------- API helpers ---------- */
const API = axios.create({ baseURL: "https://fullstack-1q3k.onrender.com" });
const fetchTasks  = () => API.get("/todos/");
const addTask     = (body) => API.post("/todos/", body);
const updateTask  = (id, body) => API.put(`/todos/${id}`, body);
const deleteTask  = (id) => API.delete(`/todos/${id}`);

/* ---------- Main component ---------- */
export default function App() {
  const [tasks,   setTasks]   = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter,  setFilter]  = useState("all");
  const [dark,    setDark]    = useState(false);

  /* load once */
  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await fetchTasks();
    setTasks(data);
  };

  /* CRUD wrappers */
  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await addTask({ title: newTask.trim(), completed: false });
    setNewTask(""); load();
  };
  const handleUpd = async (t) => {
    const { data } = await updateTask(t.id, t);
    setTasks((p) => p.map((x) => (x.id === data.id ? data : x)));
  };
  const handleDel = async (id) => { await deleteTask(id); load(); };

  /* filter */
  const show = tasks.filter((t) =>
    filter === "completed" ? t.completed :
    filter === "pending"   ? !t.completed : true);

  return (
    <SafeAreaView style={[styles.root, dark && styles.dark]}>
      {/* header */}
      <View style={styles.rowBetween}>
        <Text style={styles.h1}>To‑Do List</Text>
        <Switch value={dark} onValueChange={setDark}/>
      </View>

      {/* add box */}
      <View style={styles.addBox}>
        <TextInput
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Add a new task"
          placeholderTextColor="#888"
          style={[styles.input, dark && styles.inputDark]}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addTxt}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* list */}
      <FlatList
        data={show}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            dark={dark}
            onToggle={() => handleUpd({ ...item, completed: !item.completed })}
            onEdit={(text) => handleUpd({ ...item, title: text })}
            onDelete={() => handleDel(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* filters */}
      <View style={styles.filters}>
        {["all","completed","pending"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.fBtn, filter===f && styles.fActive]}
          >
            <Text style={[styles.fTxt, filter===f && styles.fTxtA]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

/* ---------- TaskItem sub‑component ---------- */
function TaskItem({ task, onToggle, onEdit, onDelete, dark }) {
  const [editing, setEditing] = useState(false);
  const [text,    setText]    = useState(task.title);
  const save = () => { onEdit(text.trim()); setEditing(false); };

  return (
    <View style={[styles.row, dark && styles.rowDark]}>
      <Switch value={task.completed} onValueChange={onToggle}/>
      {editing ? (
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={save}
          style={[styles.tInput, dark && styles.tInputDark]}
          autoFocus
        />
      ) : (
        <Text style={[
          styles.tText,
          task.completed && styles.tDone,
          dark && styles.tDark]}>
          {task.title}
        </Text>
      )}

      <View style={styles.tBtns}>
        <TouchableOpacity onPress={editing ? save : () => setEditing(true)}>
          <Text style={styles.tBtnTxt}>{editing? "Save":"Edit"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={[styles.tBtnTxt,{color:"#b22222"}]}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  root:{flex:1,
    backgroundColor:"#f7f2ef",
    padding:20},
  dark:{
    backgroundColor:"#222"},
    rowBetween:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"},
  h1:{
    fontSize:26,
    fontWeight:"bold",
    color:"#5a3e36"},
  addBox:{
    flexDirection:"row",
    marginTop:20},
  input:{
    flex:1,borderWidth:1,
    borderColor:"#c2a68d",
    borderRadius:6,padding:10,
    backgroundColor:"#fff"},
  inputDark:{
    backgroundColor:"#333",
    color:"#fff",borderColor:"#555"},
  addBtn:{
    backgroundColor:"#8b5e3c",
    paddingHorizontal:14,
    borderRadius:6,
    marginLeft:8,
    justifyContent:"center"},
  addTxt:{
    color:"#fff",
    fontWeight:"600"},
  filters:{
    flexDirection:"row",
    marginTop:16,
    justifyContent:"space-between"},
  fBtn:{
    flex:1,padding:10,
    backgroundColor:"#decab9",
    marginHorizontal:4,
    borderRadius:6},
  fActive:{
    backgroundColor:"#a9746e"},
  fTxt:{textAlign:"center",
    color:"#5a3e36"},
  fTxtA:{color:"#fff",
    fontWeight:"700"},

  /* TaskItem styles */
  row:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#f2e1d9",
    marginVertical:6,
    borderRadius:8,
    padding:10},
  rowDark:{
    backgroundColor:"#444"},
  tText:{
    flex:1,
    marginHorizontal:10,
    fontSize:16,
    color:"#333"},
  tDark:{
    color:"#eee"},
  tDone:{
    textDecorationLine:"line-through",
    color:"#999"},
  tInput:{
    flex:1,
    borderBottomWidth:1,
    borderColor:"#aaa",
    marginHorizontal:10},
  tInputDark:{
    color:"#fff",
    borderColor:"#777"},
  tBtns:{
    flexDirection:"row",
    gap:10},
  tBtnTxt:{
    color:"#a0522d",
    fontWeight:"600"},
});
