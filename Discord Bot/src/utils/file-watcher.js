const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class FileWatcher {
    constructor() {
        this.projectRootPath = 'project-root.txt';
        this.ignoredPaths = ['.git', 'node_modules'];
        this.structure = {};
    }

    // Initialize the watcher
    async init() {
        // First read existing project-root.txt
        await this.loadProjectStructure();

        // Set up file watcher
        const watcher = chokidar.watch('.', {
            ignored: /(^|[\/\\])\..|(node_modules)/,
            persistent: true
        });

        watcher
            .on('add', path => this.handleFileAdd(path))
            .on('unlink', path => this.handleFileRemove(path))
            .on('addDir', path => this.handleDirAdd(path))
            .on('unlinkDir', path => this.handleDirRemove(path));
    }

    // Load existing project structure
    async loadProjectStructure() {
        try {
            const content = await fs.promises.readFile(this.projectRootPath, 'utf8');
            this.parseProjectStructure(content);
        } catch (error) {
            console.error('Error loading project structure:', error);
        }
    }

    // Parse the project structure into an object
    parseProjectStructure(content) {
        const lines = content.split('\n');
        let currentPath = [];
        let currentIndent = 0;

        lines.forEach(line => {
            if (!line.trim()) return;

            const indent = line.search(/\S/);
            const name = line.trim();

            if (indent > currentIndent) {
                currentPath.push(name.replace('/', ''));
            } else if (indent < currentIndent) {
                const levels = (currentIndent - indent) / 2;
                currentPath = currentPath.slice(0, -levels);
                currentPath[currentPath.length - 1] = name.replace('/', '');
            } else {
                currentPath[currentPath.length - 1] = name.replace('/', '');
            }

            let current = this.structure;
            currentPath.forEach(part => {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            });

            currentIndent = indent;
        });
    }

    // Handle new file creation
    async handleFileAdd(filePath) {
        if (this.shouldIgnorePath(filePath)) return;

        const relativePath = this.getRelativePath(filePath);
        const parts = relativePath.split(path.sep);
        
        await this.updateProjectRoot(parts, true);
    }

    // Handle file deletion
    async handleFileRemove(filePath) {
        if (this.shouldIgnorePath(filePath)) return;

        const relativePath = this.getRelativePath(filePath);
        const parts = relativePath.split(path.sep);
        
        await this.updateProjectRoot(parts, false);
    }

    // Handle new directory creation
    async handleDirAdd(dirPath) {
        if (this.shouldIgnorePath(dirPath)) return;

        const relativePath = this.getRelativePath(dirPath);
        const parts = relativePath.split(path.sep);
        
        await this.updateProjectRoot(parts, true, true);
    }

    // Handle directory deletion
    async handleDirRemove(dirPath) {
        if (this.shouldIgnorePath(dirPath)) return;

        const relativePath = this.getRelativePath(dirPath);
        const parts = relativePath.split(path.sep);
        
        await this.updateProjectRoot(parts, false, true);
    }

    // Update project-root.txt
    async updateProjectRoot(parts, isAdd, isDirectory = false) {
        try {
            let content = await fs.promises.readFile(this.projectRootPath, 'utf8');
            const lines = content.split('\n');
            const indentation = '  ';
            
            if (isAdd) {
                // Add new entry
                let entry = parts.join('/');
                if (isDirectory) entry += '/';
                
                const indent = (parts.length - 1) * indentation;
                const newLine = indent + entry;
                
                if (!lines.includes(newLine)) {
                    lines.push(newLine);
                    lines.sort((a, b) => {
                        const aPath = a.trim();
                        const bPath = b.trim();
                        return aPath.localeCompare(bPath);
                    });
                }
            } else {
                // Remove entry
                const entryToRemove = parts.join('/');
                const index = lines.findIndex(line => 
                    line.trim() === entryToRemove || line.trim() === entryToRemove + '/');
                if (index !== -1) {
                    lines.splice(index, 1);
                }
            }

            await fs.promises.writeFile(this.projectRootPath, lines.join('\n'));
        } catch (error) {
            console.error('Error updating project-root.txt:', error);
        }
    }

    // Helper to check if path should be ignored
    shouldIgnorePath(filePath) {
        return this.ignoredPaths.some(ignored => filePath.includes(ignored)) ||
               filePath === this.projectRootPath;
    }

    // Helper to get relative path
    getRelativePath(filePath) {
        return filePath.startsWith('./') ? filePath.slice(2) : filePath;
    }
}

module.exports = new FileWatcher();