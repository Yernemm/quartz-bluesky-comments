
//find bluesky-comments

let commentCount = 0;
const maxDepth = 5;

function recursiveCommentParser(comment: any, author: string, depth: number = 0): string {



    let text = comment.post.record.text;

    let parsedText = text.replaceAll(/\*\*(.*?)\*\*/g, "<b>$1</b>"); // bold
    parsedText = parsedText.replaceAll(/\*(.*?)\*/g, "<i>$1</i>"); // italic
    parsedText = parsedText.replaceAll(/~~(.*?)~~/g, "<s>$1</s>"); // strikethrough
    parsedText = parsedText.replaceAll(/`(.*?)`/g, "<code>$1</code>");
    parsedText = parsedText.replaceAll(/https?:\/\/\S+/g, (url : string) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }); // links

    //sanitize the text to prevent XSS attacks
    parsedText = parsedText.replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;");
    parsedText = parsedText.replaceAll(/\n/g, "<br>"); // newlines

    let authorName = comment.post.author.displayName.replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;");
    let authorHandle = comment.post.author.handle.replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;");

    let profilePicture = `<div><img src="${comment.post.author.avatar}" alt="${authorName}'s profile picture" class="bsky-profile-picture"></div>`;

    let timeSince = Date.now() - new Date(comment.post.record.createdAt).getTime();
    let timeSinceText = "";
    if (timeSince < 60000) {
        timeSinceText = "just now";
    } else if (timeSince < 3600000) {
        timeSinceText = `${Math.floor(timeSince / 60000)} minutes ago`;
    } else if (timeSince < 86400000) {
        timeSinceText = `${Math.floor(timeSince / 3600000)} hours ago`;
    } else if (timeSince < 604800000) {
        timeSinceText = `${Math.floor(timeSince / 86400000)} days ago`;
    } else if (timeSince < 2419200000) {
        timeSinceText = `${Math.floor(timeSince / 604800000)} weeks ago`;
    } else if (timeSince < 29030400000) {
        timeSinceText = `${Math.floor(timeSince / 2419200000)} months ago`;
    } else {
        timeSinceText = `${Math.floor(timeSince / 29030400000)} years ago`;
    }

    timeSinceText = `<span class="bsky-comment-time">${timeSinceText}</span>`;

    let authorHandleText = `<span class="bsky-comment-handle">(@${authorHandle})</span>`;
    

    let headerDiv = `<div class="bsky-comment-header-text"><h2 class="bsky-comment-author ${author === authorHandle ? 'bsky-op-author' : ''}"> ${authorName}</h2><p> ${authorHandleText}  -  ${timeSinceText}</p></div>`;

    let commentsHtml = `<div class="bsky-comment"><div class="bsky-comment-header">${profilePicture} ${headerDiv}</div><p class="bsky-comment-text">${parsedText}</p>`;

    if (comment.replies && comment.replies.length > 0) {

        if (depth +1 > maxDepth) {
            commentsHtml += `<div class="bsky-more-replies"><p><i>${comment.replies.length} more repl${comment.replies.length > 1 ? 'ies' : 'y'}...</i></p></div>`;
            commentCount += comment.replies.length;
            
        }else{

            commentsHtml += `<div class="bsky-replies">`;
            for (const reply of comment.replies) {
                commentsHtml += recursiveCommentParser(reply, author, depth + 2);
            }
            commentsHtml += `</div>`;

        }


    }

    commentsHtml += `</div>`;

    commentCount++;

    return commentsHtml;
}



document.addEventListener("nav", () => {

    commentCount = 0;

    const commentsContainer = document.getElementById("bluesky-comments");
    if (!commentsContainer) {
        //no comments
        return;
    } 
    const postUrl = commentsContainer.getAttribute("data-post-url");
    const author = commentsContainer.getAttribute("data-author") || "unknown";
    if (!postUrl) {
        //no comments
        return;
    } 
    
    

    // extract the DID and RKEY from the post URL
    const urlParts = postUrl.split("/");
    const DID = urlParts[urlParts.length - 3];
    const RKEY = urlParts[urlParts.length - 1];

    const apiUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${DID}/app.bsky.feed.post/${RKEY}&depth=${maxDepth+1}&parentHeight=50`

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Bluesky comments:", data);
            const thread = data.thread;
            const replies = thread.replies || [];

            let commentsHtml = "";

            replies.forEach((reply: any, index: number) => {
                commentsHtml += recursiveCommentParser(reply, author);
            });

            document.getElementById("bluesky-comment-count")!.textContent = commentCount.toString() + (commentCount === 1 ? " Comment" : " Comments");
           
            commentsContainer.innerHTML = commentsHtml;
        })
        .catch(error => {
            console.error("Error fetching Bluesky post thread:", error);
            commentsContainer.innerHTML = "<p>Failed to load comments. Please try again later.</p>";
        });

})

