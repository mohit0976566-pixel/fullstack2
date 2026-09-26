
const API_URL = "http://localhost:8080/api/posts";

const postForm = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const platform = document.getElementById("platform");
const contentInput = document.getElementById("content");
const wordCount = document.getElementById("wordCount");
const wordLimit = document.getElementById("wordLimit");

function getWords(value) {
    return value.trim() ? value.trim().split(/\s+/) : [];
}

function updateWordCount() {
    const limit = Number(platform.selectedOptions[0].dataset.limit);
    const count = getWords(contentInput.value).length;
    wordCount.textContent = count;
    wordLimit.textContent = limit;
    wordCount.classList.toggle("over-limit", count > limit);
}

platform.addEventListener("change", updateWordCount);
contentInput.addEventListener("input", updateWordCount);
updateWordCount();


// ===============================
// GET ALL POSTS
// ===============================

async function loadPosts() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load posts");
        }

        displayPosts(result.data);

    } catch (error) {

        postsContainer.innerHTML =
            `<p>Unable to load posts: ${error.message}</p>`;

    }
}


// ===============================
// DISPLAY POSTS
// ===============================

function displayPosts(posts) {

    if (!posts || posts.length === 0) {

        postsContainer.innerHTML =
            "<p>No posts available.</p>";

        return;
    }

    postsContainer.innerHTML = "";

    posts.forEach(post => {

        const postCard = document.createElement("div");

        postCard.className = "post-card";

        postCard.innerHTML = `
            <h3>${post.title}</h3>

            <p class="post-content">
                ${post.content}
            </p>

            <p class="post-author">
                Author: ${post.author}
            </p>

            <div class="post-actions">

                <button
                    class="edit-btn"
                    onclick="editPost(${post.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deletePost(${post.id})">
                    Delete
                </button>

            </div>
        `;

        postsContainer.appendChild(postCard);

    });
}


// ===============================
// CREATE POST
// ===============================

postForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const selectedPlatform = platform.value;
    const content = contentInput.value.trim();
    const limit = Number(platform.selectedOptions[0].dataset.limit);
    const count = getWords(content).length;

    if (content.length < 5 || count > limit) {
        message.textContent = count > limit
            ? `This post is over the ${limit}-word limit.`
            : "Write at least 5 characters before posting.";
        return;
    }

    const postData = {
        title: `${selectedPlatform} post`,
        content,
        author: "OmniPost"
    };

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(postData)

        });

        const result = await response.json();

        if (!response.ok) {
            const details = result.data && typeof result.data === "object"
                ? Object.values(result.data).join(" ")
                : "";
            throw new Error(details || result.message || "Failed to create post");
        }

        message.textContent = "Post created successfully!";

        postForm.reset();
        updateWordCount();

        loadPosts();

    } catch (error) {

        message.textContent =
            "Error: " + error.message;

    }

});


// ===============================
// DELETE POST
// ===============================

async function deletePost(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this post?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(
                result.message || "Failed to delete post"
            );

        }

        alert("Post deleted successfully!");

        loadPosts();

    } catch (error) {

        alert("Error: " + error.message);

    }

}


// ===============================
// EDIT POST
// ===============================

async function editPost(id) {

    const title = prompt("Enter new title:");

    if (title === null) {
        return;
    }

    const content = prompt("Enter new content:");

    if (content === null) {
        return;
    }

    const author = prompt("Enter author name:");

    if (author === null) {
        return;
    }

    const updatedPost = {

        title: title,

        content: content,

        author: author

    };

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedPost)
            }
        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(
                result.message || "Failed to update post"
            );

        }

        alert("Post updated successfully!");

        loadPosts();

    } catch (error) {

        alert("Error: " + error.message);

    }

}

// REFRESH POSTS
refreshBtn.addEventListener("click", loadPosts);

// LOAD POSTS WHEN PAGE OPENS
loadPosts();
