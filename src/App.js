import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [editIndex, setEditIndex] = useState(undefined);
  const formRef = useRef();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/notes');
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    fetchNotes();
  }, []);

  const handleSubmit = async (formData) => {

    const title = formData.get("title");
    const description = formData.get("description");

    if (editIndex !== undefined) {
      try {
        await fetch(`http://localhost:5000/notes/${editIndex}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description }),
        });
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === editIndex ? { ...note, title, description } : note
          )
        );
        setEditIndex(undefined);
        formRef.current.reset();
      } catch (error) {
        console.error('Error updating note:', error);
      }
    } else {
      try {
        const response = await fetch('http://localhost:5000/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description }),
        });
        const data = await response.json();
        setNotes((prevNotes) => [
          ...prevNotes,
          { id: data.id, title, description },
        ]);
        formRef.current.reset();
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Handle delete note
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/notes/${id}`, {
        method: 'DELETE',
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Handle edit note
  const handleEdit = (id) => {
    setEditIndex(id);
    const note = notes.find((note) => note.id === id);
    formRef.current.elements.title.value = note.title;
    formRef.current.elements.description.value = note.description;
  };

  return (
    <div>
      <nav className="bg-black w-full h-10 pl-3 content-center text-white font-sans font-bold text-2xl">
        NOTES
      </nav>

      <div className="flex items-center justify-center">
        <form
          ref={formRef}
          action={handleSubmit}
          className="mt-5 flex items-center flex-col gap-2"
        >
          <input
            className="w-80 h-8 font-bold border-2 border-green-600 outline-none"
            type="text"
            name="title"
            placeholder="Title Here!"
          />
          <textarea
            className="w-96 h-[30vh] border-2 border-blue-600 outline-none"
            name="description"
            placeholder="Type description here!"
          />
          <button className="w-full bg-blue-600 h-10 rounded font-bold text-white font-serif" type="submit">
            Submit
          </button>
        </form>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-5">
        {notes.map((note) => (
          <div className="flex flex-col h-max bg-slate-100 gap-2 border-2 border-black p-2" key={note.id}>
            <h4 className="font-bold mx-auto">{note.title}</h4>
            <p className="p-2">{note.description}</p>

            <div className="flex justify-end gap-1">
              <button onClick={() => handleDelete(note.id)}>
                <Trash2 />
              </button>
              <button onClick={() => handleEdit(note.id)}>
                <Pencil />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;


