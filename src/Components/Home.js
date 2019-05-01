import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dropbox } from 'dropbox';
import { token$, updateToken } from '../Store';
import { Redirect } from 'react-router-dom';
import Header from './Header';
import Content from './Content';
import Navigation from './Navigation';
import styles from './Home.module.css';
import Dialog from './Dialog';
import UploadFile from './UploadFile';

const Home = (props) => {
  // console.log("HEJ", props.location);

  const currentPath = props.location.pathname.substr(5);
  const [uploadFile, setUploadFile] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [currentFolder, setCurrentFolder] = useState({});
  const [redirectLogout, setRedirectLogout] = useState(false);
  const [didMount, setDidMount] = useState(false);

  function signOut () {
    setRedirectLogout(true);
    updateToken(null);
  }

  function formatPath () {
    //takes currentPath, returns formatted path to pass to header
  }

  useEffect(() => {
    let token = window.location.search.replace('?code=', '');
    const API = `https://api.dropboxapi.com/oauth2/token?code=${token}&grant_type=authorization_code&redirect_uri=http://localhost:3000/home&client_id=h7s722dkxc8lgct&client_secret=u81zydr2i3rbxth`;

    if (!token$.value) {
      axios.post(API)
      .then((res) => {
        console.log(res);
        updateToken(res.data.access_token);
        setDidMount(true);
      })
      .catch(err => {
        console.log(err.response.data)
        setRedirectLogout(true);
      })
    }
    else{
      setDidMount(true);
    }
  }, []);

  useEffect(() => {
    if(didMount){
      const dbx = new Dropbox({accessToken: token$.value, fetch});
      dbx.filesListFolder({path: currentPath})
      .then(res => {
        console.log(res);
        setCurrentFolder(res);
      })
    }
  }, [didMount]);

  useEffect(() => {
    console.log("test", currentPath);
    if (didMount) {
      const dbx = new Dropbox({accessToken: token$.value, fetch});
      dbx.filesListFolder({path: currentPath})
        .then(res => {
          setCurrentFolder(res);
        })
    }
  }, [currentPath])
  return (
    <>
      {
        redirectLogout ? <Redirect to="/"/> :
          <div className={styles.home}>
            <div className={styles['home__left-container']}>
              <Navigation newFile={() => setNewFolder(true)} uploadFile={() => setUploadFile(true)} signOut={signOut}/>
            </div>
            <div className={styles['home__right-container']}>
              <Header currentPath={props.location}/>
              <Content currentFolder={currentFolder} currentPath={currentPath}/>
            </div>
          </div>
      }
      {uploadFile ? <UploadFile /> : null}
      {newFolder === true ? <Dialog canselNewFile={() => setNewFolder(false)} /> : null}
    </>
  )
}

export default Home;
