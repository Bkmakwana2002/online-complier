import './App.css';
import { useState } from 'react'
import axios from 'axios'

function App() {

  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('cpp')
  const [status,setStatus] = useState('')
  const [jobId,setJobId] = useState('')

  const handleSubmit = async () => {
    const payload = {
      language: language,
      code: code
    }
    try {
      setJobId("")
      setStatus("")
      setOutput("")
      const { data } = await axios.post("http://localhost:5000/run", payload)
      console.log(data)
      setJobId(data.jobId)
      let intervalId

      intervalId = setInterval(async () => {
        const { data: dataRes } = await axios(`http://localhost:5000/status?id=${data.jobId}`)
        const { success, job, error } = dataRes
        console.log(dataRes)

        if (success) {
          const { status: jobStatus, output: jobOutput } = job
          setOutput(jobOutput)
          if (jobStatus === "pending") {
            return
          }
          clearInterval(intervalId)
          setStatus(jobStatus)
        }
        else {
          setOutput(error)
          setStatus("error")
          clearInterval(intervalId)
        }
        console.log(dataRes)
      }, 1000 )

    } catch ({ response }) {
      if (response) {
        const errMsg = response.data.error.stderr
        setOutput(errMsg)
      }
      else {
        setOutput("Error Connecting to server")
      }
    }
  }

  return (
    <div className="App">
      <h1>Online Code Complier</h1>
      <div>
        <label htmlFor="">Language</label>
        <select name="" id="" value={language} onChange={(e) => {
          setLanguage(e.target.value)
          console.log(e.target.value)
        }}>
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <br />
      <textarea name="" id="" rows="20" cols="75" value={code} onChange={(e) => { setCode(e.target.value) }} />
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>{jobId}</p>
      <br />
      <p>{output}</p>
    </div>
  );
}

export default App;
