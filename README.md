# Phabricator Remarkup Editor Plugin

This is a simple plugin that adds a button to the Phabricator Remarkup editor that allows you to edit the raw Remarkup text in full-screen mode.

## Usage
- **!! Important !!** Currently, only `Task Maniphest`, `Events`, and `Comments` are supported.

## Installation
<!-- Set the bookmark row to visible -->
1. First, you need to make the bookmark row of your browser visible. In Chrome, you can do this by clicking the three-dot icon at the top right corner, selecting "Bookmarks" (書籤), and then selecting "Show bookmarks bar" (顯示書籤列).
2.  Drag this link 
<a href='javascript:(()=>{var editor_styles = `.editor-left-col {display: block;position: fixed;z-index: 7;left: 0;top: 0;width: 50%;height: 100vh;}.editor-left-col textarea {display: block !important;height: 100% !important;background-color: rgba(250,250,250,1.0) !important;}.editor-right-col {display: block;position: fixed;z-index: 7;left: 50%;top: 0;width: 50%;height: 100vh !important;overflow-y: scroll;background-color: rgba(250,250,250,1.0);}.editor-right-col .phabricator-remarkup {height: 100vh;}#editor-enter-btn {z-index: 8;position: fixed;padding: 0;right: 50px;top: 50px;width: 50px;height: 50px;border-radius: 50%;opacity: 0.7;}#editor-enter-btn p {text-align: center;}%60;var styleSheet = document.createElement("style");styleSheet.innerText = editor_styles;document.head.appendChild(styleSheet);function SetRemarkupPreview(preview_state) {var PreviewBtn = document.querySelector("div.fa-eye").parentElement;if (PreviewBtn == null) return null;const current_state = PreviewBtn.classList.contains("preview-active");if (preview_state != current_state) {PreviewBtn.click();}return PreviewBtn;}function GetRemarkupElement() {return document.getElementsByClassName("remarkup-assist-bar")[0].parentElement;}function GetPreviewElement() {if (document.getElementsByClassName("phui-comment-preview-view").length > 0) {return document.getElementsByClassName("phui-comment-preview-view")[0];} else if (document.getElementsByClassName("phui-remarkup-preview").length > 0) {return document.getElementsByClassName("phui-remarkup-preview")[0];} else if (SetRemarkupPreview(true) !== null) {if (document.getElementsByClassName("remarkup-inline-preview").length > 0)return document.getElementsByClassName("remarkup-inline-preview")[0];} return null;}var editor_mode = "normal";var EditorEnterBtn = document.createElement("button");EditorEnterBtn.setAttribute("id", "editor-enter-btn");EditorEnterBtn.innerHTML = %60<p id="editor-text">Edit</p>%60;EditorEnterBtn.onclick = (evt)=>{var RemarkupElement = GetRemarkupElement();var PreviewElement = GetPreviewElement();if (RemarkupElement === null || PreviewElement === null) {alert("Current page does not support editor mode!");return;}if (editor_mode === "normal") {editor_mode = "editor";RemarkupElement.classList.add("editor-left-col");RemarkupElement.classList.remove("remarkup-preview-active");PreviewElement.classList.add("editor-right-col");document.getElementById("editor-text").innerText = "Back";} else {editor_mode = "normal";RemarkupElement.classList.remove("editor-left-col");PreviewElement.classList.remove("editor-right-col");document.getElementById("editor-text").innerText = "Edit";SetRemarkupPreview(false);}};document.body.appendChild(EditorEnterBtn);})()'>Edit</a>,
to the bookmark row of your browser. 
- (Alternatively), you can right-click on the link, select "Copy link address" (複製連結網址), and then paste the link into the URL field of a new bookmark.
3. Done! Now you can click the bookmark to enable the full-screen editor mode (a button with the text "Edit" will appear at the top right corner of the page).


## Development
1. Remove all comments in the code.
2. Copy the code and paste it into the URL field of a new bookmark manually.
3. Copy the code from the URL field that you just pasted, and then paste it into this README.md file.
4. (Optional) You can remove the extra spaces `    ` used in indentation in the code to make it more compact.