import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { getCookie } from '../cookie';

function Edit(){

  const navigate = useNavigate();
  const { postId } = useParams();
  const [loaded, setLoaded] = useState(false);

  const token = getCookie("token");
  
  const [prevPost, setPrevPost] = useState({});
  const [currPost, setCurrPost] = useState({
    songTitle: '',
    singer: '',
    imageUrl: '',
    content: ''
  });

  const fileInput = useRef();
  const [imageChanged, setImageChanged] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [currImageURL, setCurrImageURL] = useState();

  const fetchAxiosData = async () => {
    try {
      const axiosData = await axios.get(`http://gwonyeong.shop/post/${postId}`)
      
      const result = axiosData.data.data.poster;
      setPrevPost(result)

      setCurrPost({
        songTitle: prevPost.songTitle,
        singer: prevPost.singer,
        imageUrl: prevPost.imageUrl,
        content: prevPost.content
      })
    } catch (err) {
      console.log(err);
      navigate('/error')
    } finally {
      setLoaded(true)
    }
  };
  
  useEffect(()=>{
    setLoaded(false)
    fetchAxiosData();
  }, [])

  const onChangeHandler = (e) => {
    setCurrPost({
      ...currPost,
      [e.target.name]: e.target.value,
    });
  };
  
  const onEditHandler = (event) => {
    event.preventDefault();

    let isChanged=false;
    for (const x in currPost){
      if(currPost[x]!==prevPost[x]) isChanged=true;
    }

    console.log({...currPost, postId:Number(postId)});

    if(isChanged){
      try {
        axios.patch(`http://gwonyeong.shop/post/${postId}`, ({...currPost, postId: Number(postId)}), {
          headers: { authorization: `Bearer ${token}` },
        }).then((res) => {
          const { msg } = res.data;
          const  statusText = (res.statusText === 'OK')
          if (statusText) {
      
            alert(msg);
            navigate(`/post/${postId}`);
      
          } else {
      
            alert(msg);
      
          }
        });
      } catch (err) {
        console.log(err);
        navigate("/error");
      }
    } else {
      alert('변경된 내용이 없습니다!');
    }
  }
  
  const imageUploadButtonClickHandler = async (ev) => {
    ev.preventDefault();

    const formData = new FormData();
    formData.append('userfile', fileInput.current.files[0])

    await axios.patch(`http://gwonyeong.shop/post/image/${postId}`, formData, {
      headers: {
        authorization: `Bearer ${token}`
      }
    }).then(res => {
      const data = res.data;

      if(data.success){

        alert('이미지가 수정되었습니다.')
        setImageUploaded(true)
        
        setCurrPost({
          ...currPost,
          imageUrl: data.imageUrl,
        });
        
      } else {
        alert('이미지가 수정되지 않았습니다.')
      }
    }).catch(err => {
        console.log(err)
        navigate('/error')
      }
    )

  }


  return (
    <>
      {loaded && (
        <Contents>

          <h3>글 수정</h3>
          
          
          <form
            encType="multipart/form-data"
          >
            {/* <input
              value={currPost.imageUrl}
              name="imageUrl unable"
              placeholder="이미지 URL"
            /> */}
            <input
              type="file"
              placeholder="새로운 게시물 사진"
              name="userfile"
              ref={fileInput}
              className={imageUploaded ? 'unable' : ""}
              onChange={(e) =>{
                setImageChanged(true)
              }}
            />
            <button
              type="button"
              onClick={(ev) => imageUploadButtonClickHandler(ev)}
              className={!imageChanged || imageUploaded ? "unable" : ""}
            >
              게시글 이미지 수정
            </button>
          </form>

          <form
            onSubmit={(event) => {
              onEditHandler(event);
            }}
          >
            <button
              type="button"
              onClick={() => {
                fetchAxiosData();
              }}
            >
              이전 글 불러오기
            </button>


            <input
              onChange={onChangeHandler}
              value={currPost.songTitle}
              name="songTitle"
              placeholder="노래명"
            />

            <input
              onChange={onChangeHandler}
              value={currPost.singer}
              name="singer"
              placeholder="가수명"
            />

            <input
              onChange={onChangeHandler}
              value={currPost.content}
              name="content"
              placeholder="감상평"
            />

            <button>수정하기</button>
          </form>
        </Contents>
      )}
    </>
  );
}

export default Edit;

const Contents = styled.div`
margin-top: 10vh;

padding: 0 20px;
box-sizing: border-box;
text-align: center;

form {
  max-width: 600px;
  margin: 15px auto;

  display: flex;
  flex-flow: column;
  gap: 16px;

  text-align: center;

  h3 {
    font-size: 28px;
  }

  input, button {
    font-size: 18px;
    padding: 6px 26px;
    box-sizing: border-box;
    border-radius: 20px;

    border: none;
    box-shadow: 2px 2px 5px #ddd;

    transition: all .2s;
  }
  
  button:hover {
    background-color: #ccc;
    cursor: pointer;
  }
}

.unable {
  opacity: .5;
  pointer-events: none;
}

.imgURL {
  all: unset;
}

`