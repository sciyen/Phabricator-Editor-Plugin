var editor_styles = `
.editor-left-col {
    display: block;
    position: fixed;
    z-index: 7;
    left: 0;
    top: 0;
    width: 50%;
    height: 100vh;
}

.editor-left-col textarea {
    display: block !important;
    height: 100% !important;
    background-color: rgba(250,250,250,1.0) !important;
}

.editor-right-col {
    display: block;
    position: fixed;
    z-index: 7;
    left: 50%;
    top: 0;
    width: 50%;
    height: 100vh !important;
    overflow-y: scroll;
    background-color: rgba(250,250,250,1.0);
}

.editor-right-col .phabricator-remarkup {
    height: 100vh;
}

#editor-enter-btn {
    z-index: 8;
    position: fixed;
    padding: 0;
    right: 50px;
    top: 50px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    opacity: 0.7;
}

#editor-enter-btn p {
    text-align: center;
}
`;
// Inserting the styles to the head
var styleSheet = document.createElement("style");
styleSheet.innerText = editor_styles;
document.head.appendChild(styleSheet);

/* If the preview is not available natively, we need to trigger the preview button to show the preview.
 * @param {boolean} preview_state - The state of the preview button (true: active, false: inactive)
 */
function SetRemarkupPreview(preview_state) {
    var PreviewBtn = document.querySelector("div.fa-eye").parentElement;
    if (PreviewBtn == null) 
        return null;
    const current_state = PreviewBtn.classList.contains("preview-active");
    if (preview_state != current_state) {
        PreviewBtn.click();
    }
    return PreviewBtn;
}

/* To retrieve the Remarkup element.
 * Currently, the Task Maniphest, Event, and Comments are supported.
 */
function GetRemarkupElement() {
    return document.getElementsByClassName("remarkup-assist-bar")[0].parentElement;
}

/* To retrieve the Preview element.
 * Currently, the Task Maniphest, Event, and Comments are supported.
 */
function GetPreviewElement() {
    // If native preview is available, use the native one (real-time update)
    if (document.getElementsByClassName("phui-comment-preview-view").length > 0) {
        // For Comments preview
        return document.getElementsByClassName("phui-comment-preview-view")[0];
    } else if (document.getElementsByClassName("phui-remarkup-preview").length > 0) {
        // For Task Maniphest preview
        return document.getElementsByClassName("phui-remarkup-preview")[0];
    } else if (SetRemarkupPreview(true) !== null) {
        // Trigger the preview button to show the preview, this must be called before using it (otherwise it does not exist)
        // If native preview is not available, use the static preview
        if (document.getElementsByClassName("remarkup-inline-preview").length > 0)
            return document.getElementsByClassName("remarkup-inline-preview")[0];
    } 
    return null;
}

var editor_mode = "normal";

var EditorEnterBtn = document.createElement("button");
EditorEnterBtn.setAttribute("id", "editor-enter-btn");
EditorEnterBtn.innerHTML = `<p id="editor-text">Edit</p>`;

EditorEnterBtn.onclick = (evt)=>{
    var RemarkupElement = GetRemarkupElement();
    var PreviewElement = GetPreviewElement();

    if (RemarkupElement === null || PreviewElement === null) {
        alert("Current page does not support editor mode!");
        return;
    }

    if (editor_mode === "normal") {
        editor_mode = "editor";
        RemarkupElement.classList.add("editor-left-col");

        // Make the editor bar available
        RemarkupElement.classList.remove("remarkup-preview-active");

        PreviewElement.classList.add("editor-right-col");
        document.getElementById("editor-text").innerText = "Back";
    } else {
        editor_mode = "normal";

        RemarkupElement.classList.remove("editor-left-col");
        PreviewElement.classList.remove("editor-right-col");
        document.getElementById("editor-text").innerText = "Edit";

        // Trigger the preview button to hide the preview, this must be called at the end to unset the preview
        SetRemarkupPreview(false);
    }
};

document.body.appendChild(EditorEnterBtn);
