var editor_styles = `
.editor-height-full {
    height: 100vh !important;
}

.editor-height-half {
    height: 50vh !important;
}

.editor-left-col {
    display: block;
    position: fixed;
    z-index: 15;
    left: 0;
    bottom: 0;
    width: 50%;
    iiheight: 100vh;
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
    bottom: 0;
    width: 50%;
    overflow-y: scroll;
    background-color: rgba(250,250,250,1.0);
}

.editor-btn {
    z-index: 20;
    position: fixed;
    padding: 0;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    opacity: 0.7;
}

.editor-btn p {
    text-align: center;
}

#editor-enter-btn {
    right: 50px;
    top: 50px;
}

#editor-size-btn {
    right: 120px;
    top: 50px;
}

.editor-move-down {
    position: fixed;
    bottom: 0;
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

class EditorStyle {
    static Full = new EditorStyle("Full", "editor-height-full");
    static Half = new EditorStyle("Half", "editor-height-half");

    constructor(name, style_name) {
        this.name = name;
        this.style_name = style_name;
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
            return document.getElementsByClassName("phui-comment-preview-view")[0].querySelector("div.phui-timeline-view");

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

function HideOriginalEditor(hide) {
    var mask = document.getElementsByClassName("jx-mask")[0];
    var originalEditor = document.getElementsByClassName("jx-client-dialog")[0];
    if (hide) {
        mask.style.display = "none";
        originalEditor.classList.add("editor-move-down");
    } else {
        mask.style.display = "block";
        originalEditor.classList.remove("editor-move-down");
    }

}

var editor_mode = "normal";
var editor_style = EditorStyle.Full;

var EditorEnterBtn = document.createElement("button");
EditorEnterBtn.setAttribute("id", "editor-enter-btn");
EditorEnterBtn.classList.add("editor-btn");
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
        RemarkupElement.classList.add(editor_style.style_name);

        // Make the editor bar available
        RemarkupElement.classList.remove("remarkup-preview-active");

        PreviewElement.classList.add("editor-right-col");
        PreviewElement.classList.add(editor_style.style_name);
        document.getElementById("editor-text").innerText = "Back";

        // Hide the original editor, such that one can scroll over the content
        if (edit_mode === EditorMode.BlockEditor) {
            HideOriginalEditor(true);
        }
    } else {
        editor_mode = "normal";

        RemarkupElement.classList.remove("editor-left-col");
        RemarkupElement.classList.remove(editor_style.style_name);

        PreviewElement.classList.remove("editor-right-col");
        PreviewElement.classList.remove(editor_style.style_name);
        document.getElementById("editor-text").innerText = "Edit";

        // Trigger the preview button to hide the preview, this must be called at the end to unset the preview
        SetRemarkupPreview(false);

        // Show the original editor
        if (edit_mode === EditorMode.BlockEditor) {
            HideOriginalEditor(false);
        }
    }
};

var EditorSizeBtn = document.createElement("button");
EditorSizeBtn.setAttribute("id", "editor-size-btn");
EditorSizeBtn.classList.add("editor-btn");
EditorSizeBtn.innerHTML = `<p id="editor-size-text">Half<br>Size</p>`;

EditorSizeBtn.onclick = (evt)=>{
    var [edit_mode, RemarkupElement] = GetRemarkupElement();
    var PreviewElement = GetPreviewElement(edit_mode);

    RemarkupElement.classList.remove(editor_style.style_name);
    PreviewElement.classList.remove(editor_style.style_name);

    // switch the style
    editor_style = (editor_style === EditorStyle.Full) ? EditorStyle.Half : EditorStyle.Full;

    EditorSizeBtn.innerText = editor_style.name;
    RemarkupElement.classList.add(editor_style.style_name);
    PreviewElement.classList.add(editor_style.style_name);
};

document.body.appendChild(EditorEnterBtn);
document.body.appendChild(EditorSizeBtn);

/*
 * Create element for find and replace tool box
 */
(() => {
    const findReplaceDiv = document.createElement("div");
    findReplaceDiv.innerHTML = `
    <div id="find-replace-box" class="find-replace-box">
        <input type="text" id="find-input" class="find-input" placeholder="Find">
        <div title="Case sensitive">
        <p>|Aa|</p>
        <label class="switch">
            <input id="capital-switch" type="checkbox">
            <span class="slider round"></span>
        </label>
        </div>
        <div title="Match whole word">
        <p>[Aa]</p>
        <label class="switch">
            <input id="whole-word-switch" type="checkbox">
            <span class="slider round"></span>
        </label>
        </div>
        <button id="find-btn" class="find-btn">Find</button>
        <input type="text" id="replace-input" class="replace-input" placeholder="Replace">
        <div title="Replace All">
        <p>All</p>
        <label class="switch">
            <input id="match-all-switch" type="checkbox">
            <span class="slider round"></span>
        </label>
        </div>
        <button id="replace-btn" class="replace-btn">Replace</button>
    </div>`;
    document.body.appendChild(findReplaceDiv);

    // Create css for the find and replace tool box
    // From https://www.w3schools.com/howto/howto_css_switch.asp
    const findReplaceStyles = `
    .find-replace-box {
        position: fixed;
        z-index: 100;
        bottom: 0;
        left: 0;
        padding: 5px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    .find-replace-box div {
        display: inline-block;
        position: relative;
        bottom: -8px;
    }
    .find-input, .replace-input {
        padding: 2px;
        margin: 2px;
    }
    .find-btn, .replace-btn {
        padding: 2px;
        margin: 2px;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
    }
      
    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }
      
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
    }
    
    .slider:before {
        position: absolute;
        content: "";
        height: 10px;
        width: 10px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }
      
    input:checked + .slider {
        background-color: #2196F3;
    }
      
    input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
      }
      
    input:checked + .slider:before {
        -webkit-transform: translateX(13px);
        -ms-transform: translateX(13px);
        transform: translateX(13px);
    }
      
    .slider.round {
        border-radius: 17px;
    }
      
    .slider.round:before {
        border-radius: 50%;
    }
    `;
    const findReplaceStyleSheet = document.createElement("style");
    findReplaceStyleSheet.innerText = findReplaceStyles;
    document.head.appendChild(findReplaceStyleSheet);

    // set up click event for find and replace
    const findBtn = document.getElementById("find-btn");
    const replaceBtn = document.getElementById("replace-btn");

    function getSearchRegex (findText) {
        // get search options from the switch input 
        const caseSensitive = document.getElementById("capital-switch").checked;
        const wholeWord = document.getElementById("whole-word-switch").checked;
        const flags = caseSensitive ? "g" : "gi";

        // Add prefix to reserved characters in regex
        findText = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp(wholeWord ? `\\b${findText}\\b` : findText, flags);
    };

    findBtn.onclick = () => {
        var textarea = GetRemarkupElement()[1].querySelector("textarea");
        const findText = document.getElementById("find-input").value;
        const text = textarea.value;
        var searchRegex = getSearchRegex(findText);
        if (searchRegex.test(text)) {
            const position = text.search(searchRegex);
            textarea.setSelectionRange(position, position + findText.length);
        }
    };

    replaceBtn.onclick = () => {
        var textarea = GetRemarkupElement()[1].querySelector("textarea");
        const findText = document.getElementById("find-input").value;
        const replaceText = document.getElementById("replace-input").value;
        const matchAll = document.getElementById("match-all-switch").checked;
        var searchRegex = getSearchRegex(findText);
        const text = textarea.value;
        if (searchRegex.test(text)) {
            if (matchAll) {
                // using the regex to replace all the text
                textarea.value = text.replace(searchRegex, replaceText);
            } else {
                const position = text.search(searchRegex);
                textarea.setRangeText(replaceText, position, position + findText.length, 'select');
            }
        }
    };
})();

/*
 * Hot key for the editor
 */
const insertText = (textarea, token) => {
    const position = textarea.selectionStart;
    // const end = position + text.length;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = token + window.getSelection().toString() + token;
    textarea.setRangeText(text, start, end, 'select');
};

window.addEventListener("keydown", (event) => {
    if (document.activeElement.type == 'textarea' ){
        // insert text into textarea: 
        // https://phuoc.ng/collection/html-dom/insert-text-into-a-text-area-at-the-current-position/
        let textarea = document.activeElement;
        if(event.ctrlKey && event.key === 'b') {
            insertText(textarea, '**');
            event.preventDefault(); 
        } else if(event.ctrlKey && event.key == 'i') { 
            insertText(textarea, '//');
            event.preventDefault(); 
        } else if(event.ctrlKey && event.key == 'f') { 
            // textarea.value
        } else if (event.key == '`') {
            insertText(textarea, '`');
            event.preventDefault();
        } else if(event.key == 'Tab') { 
            // if selection is not empty, indent the selected text
            var start = textarea.selectionStart;
            // find the last line break before the start position
            while (start > 0 && textarea.value[start] != '\n') {
                start--;
            }
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(start, end);
            const newText = selectedText.split('\n').map(line => '  ' + line).join('\n');
            textarea.setRangeText(newText, start, end, 'select');
            event.preventDefault(); 
        }
    }
});

// Insert block id to all the timeline extra element
(()=>{
    // Insert css for the block id
    const blockIdStyles = `
    .phui-timeline-extra .block-id {
        margin-left: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
    .phui-timeline-extra .block-id:hover {
        cursor: pointer;
    }
    .phui-timeline-extra .block-id.show-copied {
        background-color: #4CAF50;
        padding-left: 2px;
        padding-right: 2px;
        color: white;
    }
    `;
    const blockIdStyleSheet = document.createElement("style");
    blockIdStyleSheet.innerText = blockIdStyles;
    document.head.appendChild(blockIdStyleSheet);

    var timeline_extra = document.querySelectorAll('.phui-timeline-extra');
    for (var i = 0; i < timeline_extra.length; i++) {
        var stamp_element = timeline_extra[i].querySelector('a');
        // get href
        var href = stamp_element.getAttribute('href');
        
        // insert a span element to show the href
        var span = document.createElement('span');
        span.classList.add('block-id');
        span.innerText = href;
        span.setAttribute('title', 'Copy to clipboard');
        // Add an event listener to the stamp element, such that when the user click the stamp, the href will be copied to the clipboard
        span.onclick = (evt) => {
            const href = evt.target.innerText;
            navigator.clipboard.writeText(href);

            // show the copied message
            evt.target.innerText = 'Copied!';
            evt.target.classList.add('show-copied');
            setTimeout(() => {
                evt.target.innerText = href;
                evt.target.classList.remove('show-copied');
            }, 1000);
        };

        timeline_extra[i].appendChild(span);
    };
})()
