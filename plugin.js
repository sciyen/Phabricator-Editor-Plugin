var editor_styles = `
.editor-left-col {
    display: block;
    position: fixed;
    z-index: 15;
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
    z-index: 15;
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
    z-index: 20;
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
    // If there has multiple preview buttons, choose the last one
    const num_btn = document.querySelectorAll("div.fa-eye").length;
    var PreviewBtn = document.querySelectorAll("div.fa-eye")[num_btn-1].parentElement;
    if (PreviewBtn == null) 
        return null;
    const current_state = PreviewBtn.classList.contains("preview-active");
    if (preview_state != current_state) {
        PreviewBtn.click();
    }
    return PreviewBtn;
}

class EditorMode {
    static None = new EditorMode("None");
    static Normal = new EditorMode("Normal");
    static Task = new EditorMode("Task");
    static Event = new EditorMode("Event");
    static BlockEditor = new EditorMode("BlockEditor");
    static NewComment = new EditorMode("NewComment");

    constructor(name) {
        this.name = name;
    }
}

/* To retrieve the Remarkup element.
 * Currently, the Task Maniphest, Event, and Comments are supported.
 */
function GetRemarkupElement() {
    var assist_bar = document.getElementsByClassName("remarkup-assist-bar");
    const edit_mode = (assist_bar.length > 1) ? EditorMode.BlockEditor : EditorMode.Normal;

    var targetRemarkUpElement = assist_bar[assist_bar.length-1].parentElement;
    targetRemarkUpElement.querySelector("textarea").focus();

    // I don't know why I can not insert text into the textarea (maybe the php 
    // backend can not detect the insertion done by js)
    // if (targetRemarkUpElement.querySelector("lt-span").innerText === "") {
    //     // Insert something into editor textarea
    //     targetRemarkUpElement.querySelector("lt-span").innerText = "Type something here";
    // } 
    return [edit_mode, targetRemarkUpElement];
}

/* To retrieve the Preview element.
 * Currently, the Task Maniphest, Event, and Comments are supported.
 */
function GetPreviewElement(edit_mode) {
    // For those editing mode has real-time preview (e.g., Task Maniphest, New Comment)
    if (edit_mode.name === EditorMode.Normal.name) {
        // If native preview is available, use the native one (real-time update)
        if (document.getElementsByClassName("phui-comment-preview-view").length > 0) {
            // For Comments preview
            return document.getElementsByClassName("phui-comment-preview-view")[0];
        } else if (document.getElementsByClassName("phui-remarkup-preview").length > 0) {
            // For Task Maniphest preview
            return document.getElementsByClassName("phui-remarkup-preview")[0];
        }
    }

    // If native preview is not available, use the static preview
    // Note that since comment block editor does not support preview, we force to
    // skip the above preview selection (to avoid selecting the preview for a new 
    // comment).
    // Event editor does not support preview (WTF?)
    if (SetRemarkupPreview(true) !== null) {
        // Trigger the preview button to show the preview, this must be called 
        // before using it (otherwise it does not exist)
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
    var [edit_mode, RemarkupElement] = GetRemarkupElement();
    var PreviewElement = GetPreviewElement(edit_mode);

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
