import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

var peer = new Peer();
var conn = peer.connect();

const App = () => {

  const [myID, setMyID] = useState('')
  const [friendID, setFriendID] = useState('')
  const [connected, setConnected] = useState(false)
  const [files, setFiles] = useState([])

  let [stateCopy, setStateCopy] = useState(false)
  useEffect(() => {

    peer.on('open', id => {
      setMyID(id)
    })

    peer.on('connection', connection => {

      conn = connection
      setConnected(true)

      connection.on('open', () => {
      })

      connection.on('data', (data) => {
        onReceiveData(data)
      })

    })

  }, [])

  const Connect = (friendD) => {
    conn = peer.connect(friendID)

    conn.on('open', () => {
      setConnected(true)
    })

    conn.on('data', (data) => {
      onReceiveData(data)
    })
  }

  const SendFile = (e) => {

    const file = e.target.files[0]

    if (file.size <= 5242880) {
      const blob = new Blob(e.target.files, { type: file.type })

      conn.send({
        file: blob,
        filename: file.name,
        filetype: file.type
      })
    } else {
      alert("The file is larger than 5 MB.")
    }

  }

  const onReceiveData = (data) => {

    const blob = new Blob([data.file], { type: data.filetype })
    const url = URL.createObjectURL(blob)

    addFile({ 'name': data.filename, 'url': url })
  }

  const addFile = (file) => {
    const data = { name: file.name, url: file.url }
    setFiles(files => [...files, data])
  }

  const copyMyID = () => {
    setStateCopy(stateCopy ? false : true)
    navigator.clipboard.writeText(myID)
  }
  return (
    <div className="App">
      <div className="container mt-5">
        <div className="row-auto">
          <h3>My ID</h3>
          <div className="col-3">
            <div class="input-group mb-2">
              <input type="text" className="form-control" id="myId" value={myID} />
              <button className="btn btn-primary" onClick={copyMyID}>Copy</button>
            </div>
          </div>
        </div>
        {
          connected ? (
            <h4 style={{ color: "green" }}>Connected</h4>
          ) : (
              <h4 style={{ color: "red" }}>Not Connect</h4>
            )
        }

        {
          connected ? (
            <div>
              <input className="mt-2" type="file" name="file" id="file" onChange={e => SendFile(e)} />
            </div>
          ) : (
              <div className="row">
                <div class="col-3">
                  <div class="input-group mb-3">
                    <input type="text" className="form-control" id="friendID" placeholder="Enter Friend ID" value={friendID} onChange={e => setFriendID(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => Connect(friendID)}>Connect</button>
                  </div>
                </div>
              </div>
            )
        }

        <div>
          <ul>
            {
              files.map((file, index) => (
                <li key={index}><a href={file.url} download={file.name} >{file.name}</a></li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;