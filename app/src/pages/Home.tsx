import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readFiles } from '../model/parser'
import { addStreams } from '../util/db'

const Home = () => {
    const [files, setFiles] = useState<File[]>([])
    const navigate = useNavigate()

    const handleUpload = async () => {
        if (files.length === 0) return;
    
        const streams = await readFiles(files); // your parser
        await addStreams(streams);              // save to IndexedDB
        navigate('/stats');                     // go to StatView
      };

    return (
        <div>
            <h1>Upload Spotify files</h1>
            <input 
                type="file" 
                accept=".json" 
                multiple 
                onChange={(e) => {
                    if (e.target.files) {
                        setFiles(Array.from(e.target.files));
                    }
                }}
            />
            <button
                onClick={handleUpload}> 
                Upload
            </button>
        </div>
    )
}

export default Home;