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
    z-index: 14;
    left: 0;
    bottom: 0;
    width: 50%;
    height: 100vh;
}   

.editor-left-col textarea {
    position: absolute;
    display: block !important;
    height: 100% !important;
    z-index: 14;
    background-color: transparent !important;
    padding-bottom: 80px;
}

.force-textarea-background {
    background-color: var(--lt-color-background-primary);
}

.editor-right-col {
    display: block;
    position: fixed;
    z-index: 14;
    left: 50%;
    bottom: 0;
    width: 50%;
    overflow-y: scroll;
    background-color: var(--lt-color-background-primary);
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

a.phabricator-remarkup-embed-image img {
  background-color: white;
}

.back-drop {
    position: absolute;
    z-index: 13;
    overflow: auto;
    width: 100%;
    height: 100%;
    padding: 4px 6px;
    box-sizing: border-box;
    border: 1px solid #A1A6B0;
    background-color: var(--lt-color-background-primary);
    padding-bottom: 80px;
}

.highlights {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: transparent;
}

marker {
  color: transparent;
}

marker.bold {
  font-weight: bold;
  color: var(--lt-color-text-primary);
}

marker.long-bar::after {
  content: "";
  width: 100%;
  position: absolute;
  left: 0px;
}

marker.heading-1::after {
  height: 26px;
  background: var(--lt-color-heading-1);
}

marker.heading-2::after {
  height: 18px;
  background: var(--lt-color-heading-2);
}

marker.heading-3::after {
  height: 10px;
  background: var(--lt-color-heading-3);
}
  
marker.heading-4::after {
  height: 10px;
  background: var(--lt-color-heading-4);
}

marker.circle::after {
  content: "";
  position: absolute;
  margin-left: -1.5em;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
}

marker.rect {
  background-color: var(--lt-color-rect);
}

marker.dash::after {
  content: "";
  position: absolute;
  margin-top: 0.5em;
  margin-left: -1.5em;
  width: 1em;
  height: 0.5em;
  border-radius: 20%;
}

marker.bullet::after {
  background-color: var(--lt-color-bullet);
}

marker.number {
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
  background-color: var(--lt-color-number);
}

marker.border {
  background-color: transparent;
  box-shadow: var(--lt-color-border) 0px 0px 1px 1px;
}
`;


// Set up primary colors
(() => {
    // check if the background color is light or dark
    function isLight(color) {
        const rgb = color.match(/\d+/g);
        const brightness = Math.round(((parseInt(rgb[0]) * 299) +
            (parseInt(rgb[1]) * 587) +
            (parseInt(rgb[2]) * 114)) / 1000);
        return brightness > 155;
    }

    // get the color of the background
    function getBackgroundColor() {
        const style = getComputedStyle(document.body);
        return style.backgroundColor;
    }

    const color_mode = isLight(getBackgroundColor()) ? "light" : "dark";
    var editor_root_styles = `
    :root {
        --lt-color-background-darkmode: #1B2430;
        --lt-color-background-light: #FEFEFE;
        --lt-color-text-primary: var(${(color_mode === 'light') ? '--lt-color-text-dark' : '--lt-color-white'});
        --lt-color-background-primary: var(${(color_mode === 'light') ? '--lt-color-background-light' : '--lt-color-background-darkmode'});
        --lt-color-heading-1: ${(color_mode === 'light') ? '#B5C0D0' : '#E2BBE9'};
        --lt-color-heading-2: ${(color_mode === 'light') ? '#CCD3CA' : '#9B86BD'};
        --lt-color-heading-3: ${(color_mode === 'light') ? '#F5E8DD' : '#7776B3'};
        --lt-color-heading-4: ${(color_mode === 'light') ? '#EED3D9' : '#5A639C'};
        --lt-color-bullet: ${(color_mode === 'light') ? '#B1AFFF' : '#50727B'};
        --lt-color-number: ${(color_mode === 'light') ? '#BBE9FF' : '#78A083'};
        --lt-color-border: ${(color_mode === 'light') ? '#1679AB' : '#B25068'};
        --lt-color-rect: ${(color_mode === 'light') ? '#ecdff1' : '#622f78'};
    }
    `;
    var editor_root_style = document.createElement("style");
    editor_root_style.innerText = editor_root_styles;
    document.head.appendChild(editor_root_style);
})();

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
    var PreviewBtn = document.querySelectorAll("div.fa-eye")[num_btn - 1].parentElement;
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

    var targetRemarkUpElement = assist_bar[assist_bar.length - 1].parentElement;
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

EditorEnterBtn.onclick = (evt) => {
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

        // Insert text hightlight container for the textarea
        var textarea = RemarkupElement.querySelector("textarea");
        var highlight_container = textarea.parentElement.insertBefore(document.createElement("div"), textarea);
        highlight_container.classList.add("back-drop");
        highlight_container.setAttribute("id", "back-drop");

        // check if PhabricatorMonospaced appears in the textarea's class
        var textarea_class = textarea.getAttribute("class");
        if (textarea_class.includes("PhabricatorMonospaced") === true) {
            var PhabricatorMonospaced = (textarea_class.includes("PhabricatorMonospaced")) ? "PhabricatorMonospaced" : "";
            highlight_container.innerHTML = `<div id="div-highlights" class="highlights ${PhabricatorMonospaced}"></div>`;

            textarea.addEventListener("input", (evt) => {
                var text = evt.target.value;
                var highlightedText = ((text) => {
                    return text
                        .replace(/\n$/g, '\n\n')
                        .replace(/^#{1}(?!#).*$/gm, function (a, b) {
                            // Heading 1
                            return '<marker class="bold long-bar heading-1">' + a + '</marker>';
                        })
                        .replace(/^#{2}(?!#).*$/gm, function (a, b) {
                            // Heading 2
                            return '<marker class="bold long-bar heading-2">' + a + '</marker>';
                        })
                        .replace(/^#{3}(?!#).*$/gm, function (a, b) {
                            // Heading 3
                            return '<marker class="bold long-bar heading-3">' + a + '</marker>';
                        })
                        .replace(/^#{4}(?!#).*$/gm, function (a, b) {
                            // Heading 4
                            return '<marker class="bold long-bar heading-4">' + a + '</marker>';
                        })
                        .replace(/^={5}(?!#).*$/gm, function (a, b) {
                            // Heading 4
                            return '<marker class="bold long-bar heading-3">' + a + '</marker>';
                        })
                        .replace(/^={6}(?!#).*$/gm, function (a, b) {
                            // Heading 4
                            return '<marker class="bold long-bar heading-4">' + a + '</marker>';
                        })
                        .replace(/\*\*.*?\*\*/gm, function (a, b) {
                            // Bold
                            return '<marker class="bold">' + a + '</marker>';
                        })
                        .replace(/^(\s*(\-|\+)\s)/gm, function (a, b) {
                            // Bullet
                            return '<marker class="dash bullet">' + a + '</marker>';
                        })
                        .replace(/\W(\d+\.\s)/gm, function (a, b) {
                            // Number list
                            return '<marker class="number">' + a + '</marker>';
                        })
                        .replace(/\{.*?\}/g, function (a, b) {
                            // {}
                            return '<marker class="border parantheless">' + a + '</marker>';
                        })
                        .replace(/\[.*?\]/g, function (a, b) {
                            // []
                            return '<marker class="border parantheless">' + a + '</marker>';
                        })
                        .replace(/!!.*!!/gm, function (a, b) {
                            // !! !! !!.*!!
                            return '<marker class="rect">' + a + '</marker>';
                        })
                })(text);
                evt.target.parentElement.querySelector("#div-highlights").innerHTML = highlightedText;
            });
            // Trigger the input event for the first time
            textarea.dispatchEvent(new Event('input'));

            textarea.addEventListener("scroll", (evt) => {
                var scrollTop = evt.target.scrollTop;
                evt.target.parentElement.getElementsByClassName("back-drop")[0].scrollTop = scrollTop;
            });
        } else {
            // If highlight container is not enabled, the background will be transparent,
            // and thus, I insert the background-color to its parent.
            textarea.parentElement.classList.add("force-textarea-background");
        }
    } else {
        editor_mode = "normal";
        var textarea = RemarkupElement.querySelector("textarea");

        textarea.parentElement.classList.remove("force-textarea-background");

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

        // delete the highlight container
        var highlight_container = RemarkupElement.querySelector("#back-drop");
        RemarkupElement.removeChild(highlight_container);
    }
};

var EditorSizeBtn = document.createElement("button");
EditorSizeBtn.setAttribute("id", "editor-size-btn");
EditorSizeBtn.classList.add("editor-btn");
EditorSizeBtn.innerHTML = `<p id="editor-size-text">Half<br>Size</p>`;

EditorSizeBtn.onclick = (evt) => {
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
        <div>
            <input type="text" id="find-input" class="find-input" placeholder="Find">
            <div id="span-num-text-found"></div>
            <div title="Case sensitive">
                <span>|Aa|</span>
                <label class="switch">
                    <input id="capital-switch" type="checkbox">
                    <span class="slider round"></span>
                </label>
            </div>
            <div title="Match whole word">
                <span>[Aa]</span>
                <label class="switch">
                    <input id="whole-word-switch" type="checkbox">
                    <span class="slider round"></span>
                </label>
            </div>
            <button id="find-btn" class="find-btn">Find</button>
        </div>
        <div>
            <input type="text" id="replace-input" class="replace-input" placeholder="Replace">
            <div title="Replace All">
                <span>All</span>
                <label class="switch">
                    <input id="match-all-switch" type="checkbox">
                    <span class="slider round"></span>
                </label>
            </div>
            <button id="replace-btn" class="replace-btn">Replace</button>
        </div>
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
        padding: 1px;
        background-color: var(--lt-color-background-primary);
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    .find-replace-box div {
        display: inline-block;
        position: relative;
        margin-left: 3px;
        margin-right: 3px;
    }
    .find-replace-box > div {
        padding-left: 10px;
        padding-right: 10px;
    }
    .find-input, .replace-input {
        padding: 1px !important;
        height: 20px !important;
    }
    .find-btn, .replace-btn {
        padding: 1px;
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

    function getSearchRegex(findText) {
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

        const num_text_found = ((text || '').match(searchRegex) || []).length;
        if (num_text_found !== 0) {
            do {
                var current_selected_index = textarea.selectionEnd;
                var text_below_cursor = text.substring(current_selected_index);
                var num_text_found_here = ((text_below_cursor || '').match(searchRegex) || []).length;

                if (num_text_found_here === 0 && num_text_found > 0) {
                    // if the text is not found below the cursor, search from the beginning
                    textarea.setSelectionRange(0, 0);
                    text_below_cursor = text;
                    current_selected_index = 0;
                } else {
                    const position = text_below_cursor.search(searchRegex) + current_selected_index;
                    textarea.setSelectionRange(position, position + findText.length);
                    document.getElementById("span-num-text-found").innerText = `${num_text_found - num_text_found_here + 1} / ${num_text_found}`;
                }
            } while (num_text_found_here === 0 && num_text_found > 0);
        } else {
            document.getElementById("span-num-text-found").innerText = "0 / 0";
        }
    };

    document.getElementById('find-input').addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById('find-btn').click();
        }
    });

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
    if (document.activeElement.type == 'textarea') {
        // insert text into textarea: 
        // https://phuoc.ng/collection/html-dom/insert-text-into-a-text-area-at-the-current-position/
        let textarea = document.activeElement;
        if (event.ctrlKey && event.key === 'b') {
            insertText(textarea, '**');
            // cancel selection and go to the last position of the inserted text
            textarea.setSelectionRange(textarea.selectionEnd - 2, textarea.selectionEnd - 2);
            event.preventDefault();
        } else if (event.ctrlKey && event.key == 'i') {
            insertText(textarea, '//');
            // cancel selection and go to the last position of the inserted text
            textarea.setSelectionRange(textarea.selectionEnd - 2, textarea.selectionEnd - 2);
            event.preventDefault();
        } else if (event.ctrlKey && event.key == 'f') {
            // textarea.value
        } else if (event.key == '`') {
            insertText(textarea, '`');
            textarea.setSelectionRange(textarea.selectionEnd - 1, textarea.selectionEnd - 1);
            event.preventDefault();
        } else if (event.key == 'Tab') {
            // if selection is not empty, indent the selected text
            var start = textarea.selectionStart;
            // find the last line break before the start position
            while (start > 0 && textarea.value[start - 1] != '\n') {
                // (start-1) avoids additional space at the end of previous line
                start--;
            }

            // This avoids un-captured case when the cursor is at the beginning of the line
            var end = textarea.selectionEnd;
            while (end < textarea.value.length && textarea.value[end + 1] != '\n') {
                end++;
            }

            const text = textarea.value;
            const selectedText = text.substring(start, end);
            const newText = selectedText.split('\n').map((line) => {
                if (event.shiftKey) {
                    // if shift is pressed, unindent the selected text
                    // remove the two spaces at the beginning of the line
                    return line.replace(/^  /, '');
                } else {
                    // indent
                    return '  ' + line;
                }
            }).join('\n');

            textarea.setRangeText(newText, start, end, 'select');
            event.preventDefault();
        } else if (event.key == 'Enter') {
            event.preventDefault();
            // if selection is not empty, insert a new line and indent the selected text
            var start = textarea.selectionStart;
            // find the last line break before the start position
            while (start > 0 && textarea.value[start - 1] != '\n') {
                // (start-1) avoids additional space at the end of previous line
                start--;
            }

            // Obtain the indention of the current line
            var current_line = textarea.value.substring(start, textarea.selectionStart);
            var indention = current_line.match(/^\s*[-+]*(\d+\.)*\s*/m);

            if (indention !== null) {
                indention = indention[0];
                // Increment the number in the indention if it is a number list
                if (indention.match(/^\d+\./) !== null) {
                    // Increment the number in the indention
                    var num = parseInt(indention.match(/^\d+/)[0]) + 1;
                    indention = indention.replace(/^\d+/, num);
                }

            } else {
                indention = '';
            }

            // Check if current textarea is a child of a td element
            // if so, insert {newline} followed by '\n'
            var parent_td = textarea.closest("td");
            var linebreak = '';
            if (parent_td !== null) {
                linebreak = '{newline} \n';
            } else {
                linebreak = '\n';
            }

            // Insert the indention at current cursor position
            const text = textarea.value;
            const selectedText = text.substring(start, textarea.selectionEnd);
            const newText = selectedText + linebreak + indention;
            textarea.setRangeText(newText, start, textarea.selectionEnd, 'end');
        }
    }
});

// Insert block id to all the timeline extra element
(() => {
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

    // Retrieve task id
    const task_id = (() => {
        const crumb_node = document.getElementsByClassName("phabricator-last-crumb")[0];
        if (crumb_node !== null) {
            const crumb_name = crumb_node.getElementsByClassName("phui-crumb-name")[0].innerText;
            // remove spaces
            return crumb_name.replace(/\s/g, '');
        } else {
            // try to parse from url
            const url = window.location.href;

            // This only works for tasks and events
            const task_id = url.match(/[T|E]\d{4}/);

            // It will return null if the id is not found
            return task_id;
        }
    })();

    const blockIdStyleSheet = document.createElement("style");
    blockIdStyleSheet.innerText = blockIdStyles;
    document.head.appendChild(blockIdStyleSheet);

    var timeline_extra = document.querySelectorAll('.phui-timeline-extra');
    for (var i = 0; i < timeline_extra.length; i++) {
        var stamp_element = timeline_extra[i].querySelector('a');

        if (stamp_element !== null) {
            // get href
            var href = task_id + stamp_element.getAttribute('href');

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
        }
    };
})();

// Table Editor

var tableEditor_styles = `
#table-editor-btn {
    position: fixed;
    z-index: 1000;
    display: none;
    padding: 3px 5px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background: rgba(41,128,185,0.8);
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    color: white;
}

#table-editor-div {
    position: fixed;
    z-index: 1001;
    background: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    width: 80%;
    max-width: 80%;
    max-height: 80%;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    overflow: auto;
}

#table-editor-div tr td {
    position: relative;
    overflow: hidden;
    width: auto;
    min-width: 150px;
    padding: 0;
    border: 1px solid #ccc;
    vertical-align: top;
}

#table-editor-div tr td textarea{
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 4px;
    border: none;
    outline: none;
    overflow: none;
    resize: both;
    overflow-wrap: break-word;
}

#table-editor-div button {
    margin: 5px;
    padding: 5px 10px;
}
`;

// Inserting the styles to the head
var styleSheet = document.createElement("style");
styleSheet.innerText = tableEditor_styles;
document.head.appendChild(styleSheet);

(() => {
    const tableRowRegex = /^\s*\|(?:[^|]+\|)+\s*$/;
    let tableEditor = null;
    let originalRange = null;
    let textaera_element = null;

    function isTableFormat(text) {
        const lines = text.trim().split('\n');
        return lines.length > 0 && lines.every(line => tableRowRegex.test(line));
    }

    window.addEventListener("mouseup", (event) => {
        if (document.activeElement.type == 'textarea') {
            setTimeout(() => {
                const selection = window.getSelection();
                const text = selection.toString();

                if (selection.rangeCount > 0 && isTableFormat(text)) {
                    textaera_element = document.activeElement;
                    originalRange = {
                        selectionStart: textaera_element.selectionStart,
                        selectionEnd: textaera_element.selectionEnd,
                    };
                    showFloatingButton(event.clientX, event.clientY);
                } else {
                    hideFloatingButton();
                }
            }, 10);
        }
    });

    const tableEditorBtn = document.createElement('button');
    tableEditorBtn.setAttribute("id", "table-editor-btn");
    tableEditorBtn.textContent = 'Table Editor';
    document.body.appendChild(tableEditorBtn);

    function showFloatingButton(x, y) {
        tableEditorBtn.style.left = `${x}px`;
        tableEditorBtn.style.top = `${y}px`;
        tableEditorBtn.style.display = 'block';
    }

    function hideFloatingButton() {
        tableEditorBtn.style.display = 'none';
    }

    tableEditorBtn.addEventListener('click', () => {
        const selection = window.getSelection();
        const text = selection.toString();
        if (!isTableFormat(text)) return;

        showTableEditor(parseTable(text));
        hideFloatingButton();
    });

    function parseTable(text) {
        return text.trim().split('\n').map(row =>
            row.trim().split('|').filter(cell => cell !== '').map(cell => cell.trim())
        );
    }

    function replaceSelectionWithText(text) {
        const textarea = textaera_element;
        const start = originalRange.selectionStart;
        const end = originalRange.selectionEnd;

        // Remove every '\n' that is not followed by '|'
        text = text.replace(/(\n)(?=[^|])/g, '');

        textarea.setRangeText(text, start, end, 'select');
    }

    function showTableEditor(tableData) {
        if (tableEditor) tableEditor.remove();

        tableEditor = document.createElement('div');
        tableEditor.setAttribute("id", "table-editor-div");

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const el = entry.target;
                const newWidth = el.offsetWidth;
                const newHeight = el.offsetHeight;
                const r = el.dataset.row;
                const c = el.dataset.col;

                // Sync column width
                [...table.rows].forEach(row => {
                    const cell = row.cells[c];
                    if (cell) {
                        const ta = cell.querySelector('textarea');
                        if (ta !== el) ta.style.width = `${newWidth}px`;
                    }
                });

                // Sync row height
                const currentRow = table.rows[r];
                [...currentRow.cells].forEach(cell => {
                    const ta = cell.querySelector('textarea');
                    if (ta !== el) ta.style.height = `${newHeight}px`;
                });
            }
        });

        function createNewCell(text, rowIdx, colIdx) {
            const td = document.createElement('td');
            const textarea = document.createElement('textarea');
            textarea.value = text;

            textarea.dataset.row = rowIdx;
            textarea.dataset.col = colIdx;

            resizeObserver.observe(textarea);


            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            });

            td.appendChild(textarea);
            return td;
        }

        tableData.forEach((rowData, rowIdx) => {
            const tr = document.createElement('tr');
            rowData.forEach((cellData, colIdx) => {

                // Add a '\n' after all '{newline}'
                text = cellData.replace(/\{newline\}/g, '\{newline\}\n');
                td = createNewCell(text, rowIdx, colIdx);
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.style.marginRight = '10px';

        const discardBtn = document.createElement('button');
        discardBtn.textContent = 'Discard';

        const addRowBtn = document.createElement('button');
        addRowBtn.textContent = 'Insert Row';

        const addColBtn = document.createElement('button');
        addColBtn.textContent = 'Insert Column';

        const buttonRow = document.createElement('div');
        buttonRow.style.marginTop = '10px';
        buttonRow.appendChild(saveBtn);
        buttonRow.appendChild(discardBtn);
        buttonRow.appendChild(addRowBtn);
        buttonRow.appendChild(addColBtn);

        tableEditor.appendChild(table);
        tableEditor.appendChild(buttonRow);
        document.body.appendChild(tableEditor);

        // Save click
        saveBtn.addEventListener('click', () => {
            const newData = [...table.rows].map(tr =>
                [...tr.cells].map(td => td.firstChild.value.trim())
            );
            const newTableText = newData.map(row => '| ' + row.join(' | ') + ' |').join('\n');
            replaceSelectionWithText(newTableText);
            tableEditor.remove();
            tableEditor = null;
        });

        // Discard click
        discardBtn.addEventListener('click', () => {
            tableEditor.remove();
            tableEditor = null;
        });

        addRowBtn.addEventListener('click', () => {
            const colCount = table.rows[0]?.cells.length || 0;
            const tr = document.createElement('tr');
            const rowIdx = table.rows.length;

            for (let colIdx = 0; colIdx < colCount; colIdx++) {
                td = createNewCell('', rowIdx, colIdx);
                tr.appendChild(td);
            }

            table.appendChild(tr);
        });

        addColBtn.addEventListener('click', () => {
            const rowCount = table.rows.length;

            for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                const row = table.rows[rowIdx];
                const colIdx = row.cells.length;

                td = createNewCell('', rowIdx, colIdx);
                row.appendChild(td);
            }
        });
    }
})();

EditorEnterBtn.click();
