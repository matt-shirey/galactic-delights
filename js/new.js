import fs from "fs";
import path from "path";
import {parse} from "node-html-parser";

// Source folder path
const sourceFolder = "./template";

// Get the new folder name from command-line arguments
const [, , ...args] = process.argv;
const newFolderName = args[0];

// Check if the new folder name is provided
if(!newFolderName) {
    console.log("Please provide the new folder name as an argument.");
    process.exit(1);
}

// Resolve the absolute paths for the source and destination folders
const sourcePath = path.resolve(sourceFolder);
const destinationPath = path.join(
    path.dirname(sourcePath),
    "demos",
    newFolderName
);

// Copy the source folder to the destination folder recursively
fs.cpSync(sourcePath, destinationPath, {
    recursive: true
});

// List of files to rename
const filesToRename = [
    { oldName: "template.js", newName: `${newFolderName}.js` },
    { oldName: "template.css", newName: `${newFolderName}.css` },
    { oldName: "template.html", newName: `${newFolderName}.html` },
];

// Rename files
for (const { oldName, newName} of filesToRename) {
    const oldPath = path.join(destinationPath, oldName);
    const newPath = path.join(destinationPath, newName);
    fs.renameSync(oldPath, newPath);
}

// List of files to modify
const filesToMinify = [
    path.join(destinationPath, `${newFolderName}.js`),
    path.join(destinationPath, `${newFolderName}.html`),
    path.join(destinationPath, `${newFolderName}.css`),
];

// Modify the specified files
for (const file of filesToMinify) {
    // Read the file content
    let content = fs.readFileSync(file, "utf8");

    if(file.includes(".html")) {
        content = content.replace(/title>(.*?)</, `title>${newFolderName}<`);
    }

    // Replace all occurrences of 'template' with the new folder name
    content = content.replace(/template\b/g, newFolderName);
    if(file)
    // Write the modified content back to the file
    fs.writeFileSync(file, content, "utf8");
}

console.log(`Folder duplicated and modified successfully: ${destinationPath}`);