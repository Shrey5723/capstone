import express from 'express'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import http from 'http'
import {Server} from 'socket.io'
import pty from 'node-pty'
import os from 'os'

const WORKING_DIR = '/workspace'

const app = express()
const httpServer = http.createServer(app)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'))

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST", "PATCH"],
    }
})

app.get('/',(req,res)=>{
    res.status(200).json({
        message: "hello from agent",
        status: 'success'
    })
})

const shell = process.env.SHELL || 'bash'

const ptyProcess = pty.spawn(shell,[], {
    name: 'xterm-color',
    cols:80,
    rows: 30,
    cwd: '/workspace',
    env: process.env
})

ptyProcess.onData((data)=>{
    io.emit('terminal-output',data)
})

ptyProcess.onExit(({exitCode,signal})=>{
    console.log(`PTY process exited with code: ${exitCode}, signal: ${signal}`)
})

io.on("connection", (socket) =>{
    console.log("Client connected : " + socket.id)

    socket.on("terminal-input",(data)=>{
        ptyProcess.write(data)
    })

    socket.on("disconnect", ()=>{
        console.log("Client disconnected: " + socket.id)
    })
})

app.get(["/list-files", "/list_files"], async (req, res) => {

    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            // Exclude certain directories
            if (entry.isDirectory() && [ 'node_modules', '.git', 'dist' ].includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }

        return files;
    }

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({
            message: 'Files listed successfully',
            files,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error listing files: ${err.message}`,
            status: 'error',
        });
    }

})

app.get(["/read-files", "/read_files"], async(req,res)=>{

    const files = req.query.files;

    if(!files){
        return res.status(400).json({
            message: "no files",
            status: 'error'
        })
    }

    const fileList = files.split(',')

    const results = await Promise.all(fileList.map(async (file)=>{
        const clean = path.normalize(file.trim());
        const normalized = clean.startsWith(WORKING_DIR) ? path.relative(WORKING_DIR, clean) : clean;
        const filePath = path.join(WORKING_DIR, normalized);

        try{
            const content = await fs.promises.readFile(filePath,'utf-8');
            return {
                [filePath] : content,
                [normalized] : content,
            }
        } catch(err){
            return{
                [filePath] : `error reading file ${err.message}`,
                [normalized] : `error reading file ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message: 'file content',
        files: results
    })
})

const handleUpdateFiles = async (req, res) => {
    const updates = req.body.updates;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with an "updates" property containing an array of file updates.',
            status: 'error',
        });
    }

    const results = await Promise.all(updates.map(async (update) => {
        const file = update.file || update.path;
        if (!file) return { error: "Missing file or path in update entry" };
        const clean = path.normalize(file.trim());
        const normalized = clean.startsWith(WORKING_DIR) ? path.relative(WORKING_DIR, clean) : clean;
        const filePath = path.join(WORKING_DIR, normalized);
        try {
            console.log(path.dirname(filePath), filePath);

            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, update.content ?? '', 'utf-8');
            return {
                [ filePath ]: 'File updated successfully',
                [ normalized ]: 'File updated successfully',
            }
        } catch (err) {
            return {
                [ filePath ]: `Error updating file: ${err.message}`,
                [ normalized ]: `Error updating file: ${err.message}`,
            }
        }
    }));

    res.status(200).json({
        message: 'File update results',
        results,
    });
}

app.patch("/update-files", handleUpdateFiles);
app.post("/update-files", handleUpdateFiles);
app.patch("/update_files", handleUpdateFiles);
app.post("/update_files", handleUpdateFiles);

app.post(["/create-files", "/create_files"], async (req, res) => {
    const files = req.body.files;

    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with a "files" property containing an array of file objects.',
            status: 'error',
        });
    }

    const results = await Promise.all(files.map(async (fileObj) => {
        const file = fileObj.file || fileObj.path;
        if (!file) return { error: "Missing file or path in fileObj" };
        const clean = path.normalize(file.trim());
        const normalized = clean.startsWith(WORKING_DIR) ? path.relative(WORKING_DIR, clean) : clean;
        const filePath = path.join(WORKING_DIR, normalized);
        try {

            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, fileObj.content ?? '', 'utf-8');
            return {
                [ filePath ]: 'File created successfully',
                [ normalized ]: 'File created successfully',
            }
        } catch (err) {
            return {
                [ filePath ]: `Error creating file: ${err.message}`,
                [ normalized ]: `Error creating file: ${err.message}`,
            }
        }
    }));

    res.status(200).json({
        message: 'File creation results',
        results,
    });
})

app.get(["/check-up", "/check_up"], (req, res) => {
    res.status(200).json({
        status: "ok",
        buildErrors: [],
        runtimeErrors: [],
        warnings: []
    });
})

export default httpServer