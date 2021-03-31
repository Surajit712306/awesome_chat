import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChatRoom.css';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import {useHistory, useParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import GroupIcon from '@material-ui/icons/Group';
import Error from '../components/Error';
import {db, storageRef} from '../firebase';
import firebase from 'firebase/app';
import {v4 as uuidv4} from 'uuid';
import GetAppIcon from '@material-ui/icons/GetApp';
import Loading from '../components/Loading';
import {formatAMPM, formatDate} from '../util';

const MAX_FILE_SIZE =  1024 * 1024 * 1024; // 1GB

const getFileSizeInText = size => {
    const sizeExts = ["B", "KB", "MB", "GB"];
    let i = 0;
    while(size >= 1024)
    {
        size /= 1024;
        i += 1;
    }

    const intSize = parseInt(size);
    if(size === intSize)
    {
        return `${size}${sizeExts[i]}`;
    }
    return `${size.toFixed(1)}${sizeExts[i]}`;
}

const MessageFile = React.forwardRef(({file, user, group, timestamp, isSender}, ref) => {

    return (
        <div className={`message ${isSender ? 'sender' : ''}`} ref={ref}>
            {group  && <div className="message-sender">
                {user.displayName}
            </div>}
            <div className="message-info">
                <div className="message-info-file">
                    <a type="button" href={file.url} target="_blank" download={file.name} className="message-file__download">
                        <GetAppIcon />
                    </a>
                    <div className="message-file__name">
                        {file.name}
                    </div>
                    <div className="message-file__size">
                        {getFileSizeInText(file.size)}
                    </div>
                </div>
                <div className="message-time">
                    {timestamp ? formatAMPM(timestamp.toDate()) : ''}
                </div>
            </div>
        </div>
    );
});

const MessageText = React.forwardRef(({text, user, group, timestamp, isSender}, ref) => {
    return (
        <div className={`message ${isSender ? 'sender' : ''}`} ref={ref}>
            {group && <div className="message-sender">
                    {user.displayName}
                </div>}
            <div className="message-info">
                <div className="message-text__content">
                    {text}
                </div>
                <div className="message-time">
                    {timestamp ? formatAMPM(timestamp.toDate()) : ''}
                </div>
            </div>
        </div>);
});

const MessageDate = ({messageDate}) => {
    return (
        <div className="message-date">
            {messageDate}
        </div>
    );
}

const FileUpload = React.memo(({fileUpload}) => {
    return (
        <div className="file-upload">
            <div className="file-upload__name">
                {fileUpload.name}
            </div>
            <div className="file-upload__size">
                ({getFileSizeInText(fileUpload.size)})
            </div>
            <div className="file-upload__percentage">
                {parseInt(fileUpload.percentage)}%
            </div>
        </div>
    );
});


const Message = React.memo(React.forwardRef(({message, messageDate}, ref) => {

    const user = useSelector(state => state.auth.user);
    const isSender = message.user.uid === user.uid;

        return (
            <>
                {messageDate && <MessageDate  messageDate={messageDate} />}
                {message.content.text && <MessageText text={message.content.text}  user={message.user} group={message.group} timestamp={message.timestamp} isSender={isSender} ref={ref} />}
                {message.content.file && <MessageFile file={message.content.file} user={message.user} group={message.group} timestamp={message.timestamp}  isSender={isSender}  ref={ref} />}
            </>);
}));

const useChatRoom = (room) => {
    const initialValues = {
        textMessage: ''
    };
    const [values, setValues] = useState(initialValues)
    const initialFileValues = {
        messageFiles: []
    };
    const [fileValues, setFileValues] = useState(initialFileValues);
    const [error, setError] = useState(null);
    const [isSubmit, setIsSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.auth.user);
    const params = useParams();
    const history = useHistory();
    const [fileUpload, setFileUpload] = useState(null);
    const textInputRef = useRef();

    useEffect(() => {
        setValues(initialValues);
        setFileValues(initialFileValues);

        if(textInputRef.current)
        {
            textInputRef.current.focus();
        }

    }, [params]);

    
    const handleChange = e => {
        setError(null);
        const name = e.target.name;
        let value = e.target.value;

        if(name === 'textMessage')
        {
            if(value === ' ')
            {
                return;
            }
        }

        setValues({
            [name]: value
        });
    }

    const handleFileChange = e => {
        setError(null);
        let files = [...e.target.files];
        let name = e.target.name; 

        if(files.length > 100)
        {
            setError("The no. of files can upload is 100 at a time.");
            return;
        }

        files = files.filter(file => {
            if(file.size > MAX_FILE_SIZE)
            {
                setError("File size must be less than 1GB.");
                return false;
            }
            return true;
        });

        setFileValues({
            [name]: files
        });
    }

    const handleSubmit = async e => {
        e.preventDefault();   
        setIsSubmit(false);

        if(!room)
        {
            history.push('/');
            return;
        }

        const _values = values;
        const _fileValues = fileValues; 
        setValues(initialValues);
        setFileValues(initialFileValues);
        textInputRef.current.focus();

            setLoading(true);
            const _user = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email
            };

            const sendMessageText = async () => {
                try 
                {
                    await db.collection('rooms').doc(room.id).collection('messages').add({
                        content: {
                                text: _values.textMessage
                        },
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        user: _user
                    });
                }
                catch(err)
                {
                    setError(err.message);
                }
            }

            const sendMessageFile = async uploadedFile => {
                try 
                {
                    
                    await db.collection('rooms').doc(room.id).collection('messages').add({
                            content: {
                                file: uploadedFile
                            },
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            user: _user
                        });
                }
                catch(err)
                {
                    setError(err.message);
                }
            }

            if(_values.textMessage)
            {
                sendMessageText();
            }

                _fileValues.messageFiles.forEach(file => {
                    const uploadTask = storageRef.child(`${room.id}/${uuidv4()}.${file.name}`).put(file);
                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snapshot => {
                        const percentage = snapshot.bytesTransferred * 100 / snapshot.totalBytes;
                        setFileUpload({
                            name: file.name,
                            size: file.size,
                            percentage
                        });
                    }, 
                    err => {
                        setError(err.message);
                    }, 
                    async () => {
                        setFileUpload(null);
                        try 
                        {
                            const url = await uploadTask.snapshot.ref.getDownloadURL();
                            const uploadedFile = {
                                url,
                                name: file.name,
                                size: file.size
                            };
                            sendMessageFile(uploadedFile);
                        }
                        catch(err)
                        {
                            setError(err.message);
                        }
                        finally
                        {
                            setLoading(false);
                        }
                    });
                });

    }

    useEffect(() => {

        if(values.textMessage === '' && fileValues.messageFiles.length === 0)
        {
            setIsSubmit(false);
        }
        else 
        {
            setIsSubmit(true);
        }

    }, [fileValues, values]);

    return ({values, fileValues, handleChange, handleFileChange, error, isSubmit, handleSubmit, fileUpload, textInputRef});
}

function ChatRoom() {

    const [roomDetails, setRoomDetails] = useState({
        displayName: '',
        photoURL: '',
        group: false
    });
    const params = useParams();
    const rooms = useSelector(state => state.rooms);
    const user = useSelector(state => state.auth.user);
    const [messages, setMessages] = useState([]);
    const [messageLoading, setMessageLoading] = useState(false);
    const [messageError, setMessageError] = useState(null);
    const [room, setRoom] = useState(null);
    const [lastMessageElem, setLastMessageElem] = useState();

    useEffect(() => {
        const roomId = params.roomId;
        const room = rooms.data.find(room => room.id === roomId);

        if(!room)
        {
            return;
        }

        if(room.group)
        {
            setRoomDetails({
                displayName: room.displayName,
                photoURL: room.photoURL,
                group: true
            });
        }
        else 
        {
            room.users.forEach(_user => {
                if(_user.uid !== user.uid )
                {
                    setRoomDetails({
                        displayName: _user.displayName,
                        photoURL: _user.photoURL
                    });
                }
            });
        }
        setRoom(room);

    }, [rooms, params]);

    const {values, fileValues, handleChange, handleFileChange, error, isSubmit, handleSubmit, fileUpload, textInputRef} = useChatRoom(room);
    const [showFilesDetails, setShowFilesDetails] = useState(false);

    useEffect(() => {
        if(!room)
        {
            return;
        }

        const unsubscribe = db.collection('rooms').doc(room.id).collection('messages').orderBy('timestamp', 'asc').onSnapshot(async snapshot => {
            try 
            {
                const _messages = [];
                for(const doc of snapshot.docs)
                {
                    const _message = {
                        id: doc.id,
                        ...doc.data()
                    };
                    
                    if(room.group)
                    {
                        _message.group = true;
                    }
                    _messages.push(_message);
                }
                setMessages(_messages);
            }
            catch(err)
            {
                setMessageError(err.message);
            }
        });

        return unsubscribe;

    }, [room]);

    useEffect(() => {
        setMessageError(null);

    }, [params]);

    useEffect(() => {

        if(lastMessageElem)
        {
            lastMessageElem.scrollIntoView({behavior: 'smooth'});
        }

    }, [lastMessageElem]);

    const getLastMesssageElemRef = useCallback(elem => {
        setLastMessageElem(elem);
    }, []);

    const handleMouseOver = e => {
        setShowFilesDetails(true);
    }

    const handleMouseOut = e => {
        setShowFilesDetails(false);
    }

    return (
        <div className="chat-room">
            <div className="chat-room__header">
                {roomDetails.photoURL ? 
                    <img src={roomDetails.photoURL} title="Photo" className="chat-room-photo" />
                    :
                    <div  className="chat-room-photo" >
                        {roomDetails.group ? <GroupIcon />  : <AccountCircleIcon /> }
                    </div>
                }
                <div className="chat-room-details">
                    <div className="chat-room-display-name">{roomDetails.displayName}</div>
                </div>
            </div>  
            <div className="chat-room__chat-box">
                {fileUpload && <FileUpload  fileUpload={fileUpload} />}
                {messages.map((message, index) => {
                    let messageDate = message.timestamp ? formatDate(message.timestamp.toDate()) : null;  
                    if(index > 0)
                    {
                        const prevMessageDate = messages[index-1].timestamp ? formatDate(messages[index-1].timestamp.toDate()) : null;
                        if(messageDate === prevMessageDate)
                        {
                            messageDate = null;
                        }
                    }

                    if(index === messages.length - 1)
                    {
                        return <Message key={index} message={message} messageDate={messageDate} ref={getLastMesssageElemRef} />
                    }
                    return <Message key={index} message={message} messageDate={messageDate}  />
                })}
                {messageLoading && <div className="message-loading">
                                        <Loading />
                                    </div>}
                {messageError && <div className="message-error">
                        <Error error={messageError} />
                    </div>}
            </div> 
            {error && <div className="message-input-error">
                                <Error error={error} />
                            </div>}
            <form onSubmit={handleSubmit} className="chat-room__form">
                <div className="message-input-group">
                    <input type="file" id="messageFiles" name="messageFiles" className="message-files" onChange={handleFileChange} multiple />
                    <label htmlFor="messageFiles" className="message-files-label" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                        <AttachFileIcon  />
                    </label>
                    {showFilesDetails && <div className="message-files-details">
                            <div className="message-files-total">
                                Total files : {fileValues.messageFiles.length}
                            </div>
                            {fileValues.messageFiles.map((file, index) => (
                                <div className="message-file-details" key={index}>
                                    {index+1}) {file.name} ({getFileSizeInText(file.size)})
                                </div>
                            ))}
                    </div>}
                </div>
                <textarea name="textMessage" ref={textInputRef} value={values.textMessage} rows={3} onChange={handleChange} placeholder="Enter the message" className="text-message"></textarea>
                {isSubmit && <button type="submit" className="chat-room__form-submit">
                    <SendIcon />
                </button>}
            </form>
        </div>
    );
}

export default ChatRoom;
