'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation';
import moment from 'moment'

function Todolist() {

  const { data: session, status: sessionStatus } = useSession();
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenEdt, setIsModalOpenEdt] = useState(false)
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('pending')
  const [due_date, setDue] = useState('')
  const dialogRef = useRef(null)

  const openModal = () => {
    setIsModalOpen(true)
  }
  const openModalEdt = (id) => {
    setIsModalOpenEdt(true)
    setEditId(id)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsModalOpenEdt(false)
  }

  const getPost = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          query: `
          query {
            todos {
              id
              title
              description
              status
              due_date
              created_date
              updated_date
            }
          }
        `,
        }),
      });

      const result = await response.json();
      console.log("Fetched todos:", result.data.todos);
      setTodos(result.data.todos)
      return result.data.todos;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const HandlerSubmit = async (e) => {
    e.preventDefault()
    try {
      const query = `
        mutation AddTodo($title: String!, $description: String!, $status: String!, $due_date: Date!) {
          addTodo(title: $title,description:$description,status:$status,due_date:$due_date)
       }
      `;

      const variables = {
        title,
        description,
        status,
        due_date,
      };

      const response = await fetch("http://localhost:3000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();
      console.log("Inserted:", result.data);
      const form = e.target
      setIsModalOpen(false)
      form.reset()
      getPost()
    } catch (error) {
      console.log(error)
    }
  }

  const HandlerDelete = async (e, id) => {
    e.preventDefault()
    try {
      const query = `
      mutation DeleteToDo($id:ID!){
        deleteTodo(id:$id)
      }
      `

      const variables = { id }

      const response = await fetch("http://localhost:3000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();
      console.log("Deleted:", result.data.deleteTodo);
      getPost()
    } catch (error) {
      console.log(error)
    }
  }

  const HandlerStatus = async (e, id, status) => {
    try {
      const query = `
      mutation StatusTodo($id:ID!,$status:String!){
        statusTodo(id:$id,status:$status)
      }
      `

      const variables = { id, status }
      const response = await fetch("http://localhost:3000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();
      console.log("Deleted:", result.data.statusTodo);
      getPost()
    } catch (error) {
      console.log(error)
    }
  }

  const HandlerEdit = async (e) => {
    e.preventDefault()
    try {

      const query = `
        mutation EditTodo($id:ID!,$title: String!, $description: String!, $status: String!, $due_date: Date!) {
          editTodo(id : $id, title: $title,description:$description,status:$status,due_date:$due_date)
       }
      `;

      const variables = {
        id: editId,
        title,
        description,
        status,
        due_date,
      };

      console.log(variables)

      const response = await fetch("http://localhost:3000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      const resData = await response.json();
      console.log(resData);
      const form = e.target
      form.reset()
      getPost()
      closeModal()


    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getPost()
  }, [])

  const taskToEdit = todos.find(e => e.id === editId);

  useEffect(() => {
    if (isModalOpen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpenEdt && dialogRef.current) {
      dialogRef.current.showModal();

      const task = todos.find(e => e.id === editId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setDue(moment(task.due_date).format('YYYY-MM-DD'));
      }
    }
  }, [isModalOpenEdt]);


  if (sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-gray-500"></div>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) redirect('/')

  return (
    <div className='bg-gray-100 h-screen'>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-lg">
            Todo App
          </div>
          <div className="flex items-center justify-between space-x-4">
            <h4 className="text-white font-bold">{session.user.name}</h4>
            <button
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-700 transition"
              onClick={() => signOut('/')}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-md mx-auto p-4 font-sans">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-3xl font-bold text-gray-800">{moment().format('DD')}</div>
            <div className="text-sm text-gray-600">{moment().format('dddd')}</div>
            <div className="text-sm text-gray-600">{moment().format('MMM YYYY')}</div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow hover:bg-purple-700 transition"
            onClick={openModal}
          >
            <span className="text-lg">+</span> NEW TASK
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-center text-lg font-bold mb-2">TODO TASKS</h2>
          <div className="space-y-3">
            {
              todos && todos.length > 0 && todos.some(t => t.status != 'completed') ? (
                todos.filter(t => t.status !== 'completed').map((task) => (
                  <div key={task.id} className={`rounded-xl p-4 text-white shadow ${task.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'}`}>

                    <div className="flex justify-between items-center text-xs font-semibold uppercase mb-3">
                      <button
                        className='flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow hover:bg-purple-700 transition'
                        onClick={() => openModalEdt(task.id)}
                      >
                        Edit
                      </button>
                      <button
                        className='flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow hover:bg-red-700 transition'
                        onClick={(e) => HandlerDelete(e, task.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold uppercase mb-1">
                      <span>{task.status === 'pending' ? 'HIGH PRIORITY' : 'NORMAL PRIORITY'}</span>
                      <span>Due : {moment(task.due_date).format('DD-MMM-YYYY')}</span>
                    </div>
                    <div className="font-bold text-lg">{task.title}</div>
                    <div className="text-sm mb-3">{task.description}</div>
                    {["pending", "in-progress", "completed"].map((label, index) => (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer mt-2 mx-2 justify-end">
                        <span className="text-sm text-white min-w-[100px] text-right capitalize">
                          {label.replace('-', ' ')}
                        </span>
                        <input
                          type="radio"
                          name={`status-${task.id}`}
                          value={label}
                          className="peer hidden"
                          onClick={(e) => HandlerStatus(e, task.id, e.target.value)}
                          defaultChecked={task.status === label}
                        />
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-purple-600 peer-checked:bg-purple-600 flex items-center justify-center transition">
                          <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition"></div>
                        </div>
                      </label>
                    ))}
                  </div>
                ))
              ) : (
                <div className='rounded-xl p-4 text-white shadow bg-black'>
                  <div className="text-xs font-semibold uppercase mb-1">
                  </div>
                  <div className="font-bold text-lg text-center">Not Task Todo</div>
                </div>
              )
            }
          </div>
        </div>

        <div>
          <h2 className="text-center text-lg font-bold mb-2">DONE TASKS</h2>
          <div className="space-y-3">
            {
              todos && todos.length > 0 && todos.some(t => t.status === 'completed') ? (
                todos
                  .filter(t => t.status === 'completed')
                  .map((task) => (
                    <div key={task.id} className="bg-green-600 text-white rounded-xl p-4 shadow">
                      <div className="flex justify-between items-center text-xs font-semibold uppercase mb-3">
                        <button
                          className='flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow hover:bg-purple-700 transition'
                          onClick={() => openModalEdt(task.id)}
                        >
                          Edit
                        </button>
                        <button
                          className='flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow hover:bg-red-700 transition'
                          onClick={(e) => HandlerDelete(e, task.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold uppercase mb-1">
                        <span>DONE</span>
                        <span></span>
                      </div>
                      <div className="font-bold text-lg">{task.title}</div>
                      <div className="text-sm">{task.description}</div>
                      <div className="flex justify-end mt-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  ))
              ) : (
                <div className='rounded-xl p-4 text-white shadow bg-black'>
                  <div className="font-bold text-lg text-center">Not Task Completed</div>
                </div>
              )
            }
          </div>
        </div>

        {isModalOpen && (
          <dialog
            ref={dialogRef}
            className="fixed inset-0 m-auto rounded-lg border-2 border-gray-400 shadow-lg p-6 w-[450px] bg-white"
            onClose={closeModal}
          >
            <h2 className="text-xl font-bold mb-4 text-center">Add New Todo</h2>

            <form className="flex flex-col gap-4" onSubmit={HandlerSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows={3} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" onChange={(e) => setDue(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </dialog>
        )}

        {isModalOpenEdt && (
          <dialog
            ref={dialogRef}
            className="fixed inset-0 m-auto rounded-lg border-2 border-gray-400 shadow-lg p-6 w-[450px] bg-white"
            onClose={closeModal}
          >
            <h2 className="text-xl font-bold mb-4 text-center">Edit Task</h2>

            <form className="flex flex-col gap-4" onSubmit={HandlerEdit}>
              {taskToEdit && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" value={due_date ? moment(due_date).format('YYYY-MM-DD') : ''} onChange={(e) => setDue(e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
}

export default Todolist
