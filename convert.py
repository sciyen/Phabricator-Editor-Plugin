import re

# Read the file plugin.js
with open('plugin.js', 'r') as file:
    # open a new file to write the converted content
    with open('plugin-inline.js', 'w') as new_file:
        # read the content of the file
        content = file.read()
        # replace all comments with empty string
        content = re.sub(r'(\s|\w)//.*', '', content)

        # replace all comments with empty string
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

        # replace all new lines with empty string
        content = re.sub(r'\n', '', content)

        # replace all 4 spaces with empty string
        content = re.sub(r'    ', '', content)

        # add prefix "javascript:(()=>{" and postfix "})()" to the content
        content = 'javascript:(()=>{' + content + '})()'

        # write the content to the new file
        new_file.write(content)
    
# close the file
file.close()
new_file.close()

