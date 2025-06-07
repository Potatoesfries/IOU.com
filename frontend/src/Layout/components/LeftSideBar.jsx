import { useEffect } from "react";
import { axiosInstance } from "../../lib/axios";
import { useState } from "react";
import moment from "moment";
import {Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog";
import { ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";	
import {ScrollArea} from "@/components/ui/scroll-area"
import {Link } from "react-router";

const LeftSideBar = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);

    const [newNote, setNewNote] = useState({
        title: "",
        content: ""
    });

  const fetchNotes = async()=>{
        try {
          const res = await axiosInstance.get("/notes")
          setNotes(res.data)
        } catch (error) {
          console.log("error fetching notes")
        }finally{
          setLoading(false)
        }
      }
    const handleSubmit = async ()=>{
      setLoading(true)
      try {
        if(!newNote.title.trim() || !newNote.content.trim()){
         
          return toast.error("Enter All Fields")
        }

        await axiosInstance.post("/notes", {
          title: newNote.title,
          content: newNote.content
        },
			)
        
        setNewNote({
          title: "",
          content: ""
        })

        toast.success("Note created successfully")
        setNoteDialogOpen(false)
        await fetchNotes()
      } catch (error) {
        toast.error("Failed to add note, something went wrong")
      } finally{
        setLoading(false)
      }
    }

  useEffect(()=>{
    fetchNotes()
  },[])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 border-r border-gray-200 flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          
          <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
            <DialogTrigger asChild>
              <button className="group relative inline-flex items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md active:shadow-lg transform hover:scale-105 active:scale-95">
                <ClipboardPlus 
                  className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-active:text-blue-700 transition-colors duration-200" 
                />
                <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
              </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Create New Note
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Add a new note to your collection. Fill in the details below.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="note-title" 
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Title
                  </label>
                  <input 
                    id="note-title"
                    type="text"
                    placeholder="Enter note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="note-content" 
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Content
                  </label>
                  <textarea  
                    id="note-content"
                    placeholder="Write your note content here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  onClick={() => setNoteDialogOpen(false)} 
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !newNote.title.trim() || !newNote.content.trim()}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Create Note"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Section with ScrollArea */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 text-sm">Loading your notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Create your first note to get started organizing your thoughts and ideas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <Link
                    to={`/notes/${note._id}`}
                    key={note.id || index}
                    className="group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 block"
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight pr-4 group-hover:text-blue-700 transition-colors">
                        {note.title}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      </div>
                    </div>

                    {/* Note Content */}
                    {note.content && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {note.content}
                      </p>
                    )}

                    {/* Note Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-medium">
                        {moment(note.createdAt).format("MMM D, YYYY")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {moment(note.createdAt).format("h:mm A")}
                      </span>
                    </div>

                    {/* Hover Accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default LeftSideBar