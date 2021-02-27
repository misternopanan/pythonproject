import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './App.css'

var peer = new Peer({ secure: false });
var conn = peer.connect()

const App = () => {

  const [myID, setMyID] = useState('')
  const [friendID, setFriendID] = useState('')
  const [mystream, setsMytream] = useState()

  const [stateConnect, setStateConnect] = useState(false)
  let [stateCopy, setStateCopy] = useState(false)

  const [txtMessage, setTxtMessage] = useState()
  const [messages, setMessages] = useState([])

  const myVideo = useRef();
  const friendVideo = useRef();

  // Set Title
  document.title = "Video streaming"

  useEffect(() => {
    
    //Open My camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setsMytream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    })

    //Set my id
    peer.on('open', id => {
      setMyID(id);
    });

    //Connection
    peer.on('connection', connection => {
      setStateConnect(true)
      connection.on('data', data => {
        // setFriendID(data)
        if (data.type == "id")
          setFriendID(data.id)
        else if (data.type == "message")
          onReceivedMessage(data)
      });
    });

    // Answer
    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream)
          call.on('stream', stream => {
            friendVideo.current.srcObject = stream
          })
        })
        .catch((err) => {
          console.error('Failed to get local stream', err);
        });
    })

  }, []);

    
  const startConnection = () => {
    conn = peer.connect(friendID);
    setStateConnect(true)

    conn.on('data', data => {
      if (data.type == "message")
        onReceivedMessage(data)
    })

    peer.on('error', err => {
      if (err.type === 'peer-unavailable')
        alert("The id or peer you're trying to connect to does not exist.")
    })

    // Call
    let call = peer.call(friendID, mystream)
    call.on('stream', stream => {
      friendVideo.current.srcObject = stream
    })

  }

  // My Video Conponent
  let MyVideo;
  if (mystream) {
    MyVideo = (
      <video playsInline muted ref={myVideo} autoPlay style={{ maxWidth: "100%" }} />
    );
  }

  // Friend Video Conponent
  let FriendVideo;
  if (friendVideo) {
    FriendVideo = (
      <video playsInline muted ref={friendVideo} autoPlay style={{ maxWidth: "100%" }} />
    );
  }

  const onReceivedMessage = (data) => {
    setMessages(messages => [...messages, { message: data.message, owner: false }])
  }

  const sendMessage = () => {
    conn.send({ type: "message", message: txtMessage })
    setMessages(messages => [...messages, { message: txtMessage, owner: true }])
    setTxtMessage('')
  }

  const copyMyID = () => {
    setStateCopy(stateCopy ? false : true)
    navigator.clipboard.writeText(myID)
  }

  const handleChange = (e) => {
    setFriendID(e.target.value)
  }

  return (
    <div className="App">
      <div className="container mt-5">
        <div className="row">
          <div className="col-4">
            <div class="input-group mb-2">
              <h5 id="myid">My ID</h5>
              <input type="text" className="form-control" id="myId" value={myID} />
              <button className="btn btn-outline  " onClick={copyMyID}><i class="fas fa-copy"></i></button>
            </div>
          </div>
          <div className="col-4">
            <div class="input-group mb-3">
              <h5 id="myid">Friend ID</h5>
              <input type="text" className="form-control" id="friendID" placeholder="Enter Friend ID" value={friendID} onChange={e => handleChange(e)} />
              <button className="btn btn-primary" disabled={friendID ? false : true} onClick={startConnection}>Connect</button>
            </div>
          </div>
          {
            stateConnect ? (
              <h6 style={{ color: "green" }}>Connected</h6>
            ) : (
                <h6 style={{ color: "red" }}>Not Connect</h6>
              )
          }
          <div className="container mt-3">
            <div className="row">
              <div className="col-6">
                {
                  stateConnect ? FriendVideo : (<h3 className="text-center" style={{ marginTop: "20%", color: "#ccc" }}>No video yet</h3>)
                }
              </div>
              <div className="col-2">
                {MyVideo}
              </div>
              <div className="col-4">
                <div className="card">
                  {
                    messages && messages.map((message, index) => (
                      <div id={message.owner ? "btnright" : "btnleft"} className={message.owner ? "text-right" : "text-left"}>
                        <button className={message.owner ? "mt-2 btn btn-primary" : "mt-2 btn btn-secondary"}> {message.message} </button>
                      </div>

                    ))
                  }
                </div>
                <div id="msg-input" className="input-group">
                  <input id="msg-box" className="form-control mb-3" placeholder="Enter Message" value={txtMessage} onKeyDown={e => { if (e.key === "Enter") sendMessage() }} onChange={e => setTxtMessage(e.target.value)} />
                  <button id="msg-button" className="btn btn-primary" onClick={sendMessage}><i class="far fa-paper-plane"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;