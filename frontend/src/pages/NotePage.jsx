import { TabsContent } from '@radix-ui/react-tabs'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { FileSpreadsheet, SquarePen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { axiosInstance } from '../lib/axios'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import moment from 'moment'

const NotePage = () => {
  const [currentNote, setCurrentNote] = useState({})
  const [loading, setLoading] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()

  const fetchNotesById = async (noteId) => {
    setLoading(true)
    if (!noteId) return
    try {
      const res = await axiosInstance.get(`/notes/${noteId}`)
      setCurrentNote(res.data)
      console.log(res.data)
    } catch (error) {
      console.log("Error in fetching note by id")
    } finally {
      setLoading(false)
    }
  }

  

  const EditNotesById = async (noteId) => {
    setLoading(true)
    try {
      const res = await axiosInstance.put(`/notes/${noteId}`, currentNote)
      setCurrentNote(res.data)
      
      fetchNotesById(noteId)

      toast.success("Note updated successfully")
      setTimeout(() => {
        window.location.reload();
      },400)

   } catch (error) {
      console.log("Error in updating note by id")
    } finally {
      setLoading(false)
    }
  }

  const DeleteNotesById = async (noteId) => {
    setLoading(true)
    try {
      const res = await axiosInstance.delete(`/notes/${noteId}`)
      
      toast.success("Note deleted successfully")
      
      navigate("/")
      setTimeout(() => {
        window.location.reload();
      },400)
      
    } catch (error) {
      console.log("Error in deleting note by id")
    } finally {
      setLoading(false)
      
    }
  }

  useEffect(() => {
    fetchNotesById(id)
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading note...</span>
      </div>
    )
  }
  

  return (
    <div>
      <Tabs defaultValue="read">
        <div className='flex justify-center mt-6'>
          <TabsList className="flex justify-center ">
          <TabsTrigger value="read">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            <span>Read</span>
          </TabsTrigger>
          <TabsTrigger value="edit">
            <SquarePen className="w-4 h-4 mr-2"/>  
            <span>Edit</span>
          </TabsTrigger>
        </TabsList>
        </div>
        

        {/* Read Tab */}
<TabsContent value="read">
  <div className="p-6 bg-yellow-50 rounded-xl shadow-lg max-w-7xl h-195 mx-auto mt-6 space-y-4 relative">
    <div className="absolute top-6 right-6 text-xs text-gray-400 text-right">
      <div>{moment(currentNote.createdAt).format("MMM D, YYYY")}</div>
      <div>{moment(currentNote.createdAt).format("h:mm A")}</div>
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentNote.title}</h2>
    <p className="text-gray-700 whitespace-pre-line">{currentNote.content}</p>
    <div className="absolute bottom-6 right-6 text-xs text-gray-400 text-right">
      <div>Last updated:</div>
      <div>{moment(currentNote.updatedAt || currentNote.createdAt).format("MMM D, YYYY h:mm A")}</div>
    </div>
  </div>
</TabsContent>
    
        {/* Edit Tab */}
        <TabsContent value="edit">
          <div className="p-6 bg-yellow-50 rounded-xl shadow-lg max-w-7xl h-195 mx-auto mt-6 space-y-4">
            <input
              type="text"
              value={currentNote.title || ''}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              placeholder="Title"
              className="w-full text-2xl font-bold text-gray-800 bg-transparent outline-none border-b border-gray-400 focus:border-blue-500"
            />
            <textarea
              value={currentNote.content || ''}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              placeholder="Write your notes here..."
              rows={10}
              className="w-full h-155 text-gray-700 bg-transparent outline-none border border-gray-300 rounded-md p-3 resize-none focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => DeleteNotesById(id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => EditNotesById(id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save
              </button>
              
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotePage
