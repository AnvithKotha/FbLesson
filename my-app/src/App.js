import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, deleteDoc, getDocs, collection } from "firebase/firestore";

const ChecklistItem = ({ item, onToggle, onRemove }) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        className="form-checkbox h-5 w-5 text-blue-500"
      />
      <p className={item.checked ? 'line-through' : ''}>{item.label}</p>
      <button
        onClick={() => onRemove(item.id)}
        className="p-1 bg-red-500 text-white rounded-md"
      >
        Remove
      </button>
    </div>
  );
};

const App = () => {
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);
  const firebaseConfig = {
    apiKey: "AIzaSyASY_JXhAzneSa9Und-yRgovzGoQ0GLP-g",
    authDomain: "demo2-50˜5e0.firebaseapp.com",
    projectId: "demo2-505e0",
    storageBucket: "demo2-505e0.appspot.com",
    messagingSenderId: "54101193946",
    appId: "1:54101193946:web:f9df485a1d8fa91fe2a1e3",
    measurementId: "G-37RJHEFMZ1"
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "Tasks"));
      const fetchedItems = [];
      let maxId = 0;
      querySnapshot.forEach((doc) => {
        // Assuming the document ID is the label, and contains a 'checked' field
        if (doc.id > maxId) maxId = doc.id
        fetchedItems.push({
          id: doc.id,
          label: doc.data().label,
          checked: doc.data().checked
        });
      });
      setItems(fetchedItems);

      // Updating the nextId based on fetched items count
      setNextId(parseInt(maxId) + 1);
    };

    fetchItems();
  }, []);

  const toggleCheck = async (id) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    for (let i=0; i<items.length; i++) {
      if (items[i].id === id) {
        await setDoc(doc(db, "Tasks", items[i].id.toString()), {
          label: items[i].label,
          checked: !items[i].checked
        });
      }
    }
    setItems(newItems);
  };

  const addItem = async () => {
    const label = prompt('Enter the name of the item:');
    if (label) {
      const newItem = { id: nextId, label: label, checked: false };
      setItems([...items, newItem]);
      await setDoc(doc(db, "Tasks", nextId.toString()), {
        label: label,
        checked: false
      });
      setNextId(nextId + 1);
    }
  };

  const removeItem = async (id) => {
    const newItems = items.filter((item) => item.id !== id);

    for (let i=0; i<items.length; i++) {
      if (items[i].id === id) {
        await deleteDoc(doc(db, "Tasks", items[i].id.toString()))
      }
    }

    setItems(newItems);
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-4 border border-gray-300 rounded-md">
      {items.map((item) => (
        <ChecklistItem
          key={item.id}
          item={item}
          onToggle={toggleCheck}
          onRemove={removeItem}
        />
      ))}
      <button
        onClick={addItem}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Add Item
      </button>
    </div>
  );
};

export default App;
