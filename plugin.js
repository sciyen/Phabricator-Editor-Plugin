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
    height: 100%;
}

.editor-right-col {
    display: block;
    position: fixed;
    z-index: 7;
    left: 50%;
    top: 0;
    width: 50%;
    height: 100vh;
    overflow-y: scroll;
}

#editor-enter-btn {
    z-index: 8;
    position: absolute;
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

var styleSheet = document.createElement("style");
styleSheet.innerText = editor_styles;
document.head.appendChild(styleSheet);

var editor_mode = "normal";

var EditorEnterBtn = document.createElement("button");
EditorEnterBtn.setAttribute("id", "editor-enter-btn");
EditorEnterBtn.innerHTML = `<p id="editor-text">Edit</p>`;

EditorTextArea = document.getElementsByClassName("aphront-form-input")

EditorEnterBtn.onclick = (evt)=>{
    if (editor_mode == "normal") {
        editor_mode = "editor";
        document.getElementById("UQ0_17").classList.add("editor-left-col");
        document.getElementsByClassName("phui-remarkup-preview")[0].classList.add("editor-right-col");
        document.getElementById("editor-text").innerText = "Back";
    } else {
        editor_mode = "normal";
        document.getElementById("UQ0_17").classList.remove("editor-left-col");
        document.getElementsByClassName("phui-remarkup-preview")[0].classList.remove("editor-right-col");
        document.getElementById("editor-text").innerText = "Edit";
    }
};

document.body.appendChild(EditorEnterBtn);
