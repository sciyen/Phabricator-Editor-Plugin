# Phabricator Remarkup Editor Plugin

This is a simple plugin that adds a button to the Phabricator Remarkup editor that allows you to edit the raw Remarkup text in full screen mode.

## Usage
**!! Important !!** Only click the bookmark when you are in the editor mode!

## Installation
<!-- Set the bookmark row to visible -->
1. First, you need to make the bookmark row of your browser visible. In Chrome, you can do this by clicking three-dot icon at the top right corner, selecting "Bookmarks" (書籤), and then selecting "Show bookmarks bar" (顯示書籤列).
2.  Drag this 
<a href='javascript:(()=>{var editor_styles = `.editor-left-col {display: block;position: fixed;z-index: 7;left: 0;top: 0;width: 50%;height: 100vh;}.editor-left-col textarea {height: 100%;}.editor-right-col {display: block;position: fixed;z-index: 7;left: 50%;top: 0;width: 50%;height: 100vh;overflow-y: scroll;}#editor-enter-btn {z-index: 8;position: absolute;padding: 0;right: 50px;top: 50px;width: 50px;height: 50px;border-radius: 50%;opacity: 0.7;}#editor-enter-btn p {text-align: center;}%60;var styleSheet = document.createElement("style");styleSheet.innerText = editor_styles;document.head.appendChild(styleSheet);var editor_mode = "normal";var EditorEnterBtn = document.createElement("button");EditorEnterBtn.setAttribute("id", "editor-enter-btn");EditorEnterBtn.innerHTML = %60<p id="editor-text">Edit</p>%60;EditorEnterBtn.onclick = (evt)=>{if (editor_mode == "normal") {editor_mode = "editor";document.getElementById("UQ0_17").classList.add("editor-left-col");document.getElementsByClassName("phui-remarkup-preview")[0].classList.add("editor-right-col");document.getElementById("editor-text").innerText = "Back";} else {editor_mode = "normal";document.getElementById("UQ0_17").classList.remove("editor-left-col");document.getElementsByClassName("phui-remarkup-preview")[0].classList.remove("editor-right-col");document.getElementById("editor-text").innerText = "Edit";}};document.body.appendChild(EditorEnterBtn);})();'>link</a>,
to the bookmark row of your browser. 
    - (Alternatively), you can right-click on link, select "Copy link address" (複製連結網址), and then paste the link into the URL field of a new bookmark.
3. Done! Now you can click the bookmark to enable the full screen editor mode (a button with the text "Edit" will appear at the top right corner of the page).
