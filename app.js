/* Paste your full app.js content here */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6dJgXWdrbJ5LCQtXBWugbkMoA2pFM1JM",
  authDomain: "nirob-1615.firebaseapp.com",
  databaseURL: "https://nirob-1615-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nirob-1615",
  storageBucket: "nirob-1615.appspot.com",
  messagingSenderId: "529807045925",
  appId: "1:529807045925:web:dd8d950f80610fdd4b56cc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ADMIN_PASSWORD = "@mehedi@1615";

const adminBtn = document.getElementById("admin-btn");
const adminModal = document.getElementById("admin-modal");
const passwordInput = document.getElementById("admin-pass");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const adminForm = document.getElementById("admin-post-form");

const postText = document.getElementById("post-text");
const postVideo = document.getElementById("post-video");
const postSubmit = document.getElementById("post-submit");

const postsContainer = document.getElementById("posts-container");

let isAdmin = false; // ✅ Track admin status

// Admin login modal
adminBtn.onclick = () => { adminModal.style.display = "flex"; };
cancelBtn.onclick = () => { adminModal.style.display = "none"; passwordInput.value=""; };
submitBtn.onclick = () => {
  if(passwordInput.value === ADMIN_PASSWORD){
    adminModal.style.display="none";
    adminForm.style.display="flex";
    passwordInput.value="";
    isAdmin = true; // ✅ Admin logged in
    alert("✅ Admin mode activated");
    loadPosts(); // refresh posts to show delete buttons
  } else {
    alert("❌ Wrong password!");
  }
};

// Post submit
postSubmit.onclick = () => {
  const text = postText.value.trim();
  const link = postVideo.value.trim();
  if(text==="" && link===""){ alert("⚠️ Enter text or video link!"); return; }
  push(ref(db,"posts"), { text:text||"", link:link||"", time:Date.now() });
  postText.value=""; postVideo.value="";
  alert("✅ Post added!");
};

// Load posts
function loadPosts(){
  onValue(ref(db,"posts"), snapshot=>{
    postsContainer.innerHTML="";
    const data=snapshot.val();
    if(!data) return;
    Object.entries(data).sort((a,b)=>b[1].time-a[1].time).forEach(([id, post])=>{
      const div=document.createElement("div");
      div.className="post";

      if(post.text){ const p=document.createElement("p"); p.textContent=post.text; div.appendChild(p); }
      if(post.link){ 
        const iframe=document.createElement("iframe");
        iframe.src=convertToEmbed(post.link);
        iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen=true; div.appendChild(iframe);
      }

      // ✅ Delete button only visible for Admin
      if(isAdmin){
        const delBtn = document.createElement("button");
        delBtn.textContent="Delete";
        delBtn.className="delete-btn";
        delBtn.onclick = ()=> {
          if(confirm("Are you sure to delete this post?")){
            remove(ref(db, `posts/${id}`));
          }
        };
        div.appendChild(delBtn);
      }

      postsContainer.appendChild(div);
    });
  });
}

loadPosts();

// Convert FB/YT link to embed
function convertToEmbed(url){
  if(url.includes("youtube.com")||url.includes("youtu.be")){
    const id=url.includes("youtu.be")? url.split("/").pop() : new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
  }
  if(url.includes("facebook.com")){
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  }
  return url;
    }
