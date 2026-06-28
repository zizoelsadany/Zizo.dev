const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zizo123';

// Database Connection Helper
let dbConnection = null;
const connectDB = async () => {
    if (!process.env.MONGODB_URI) return;
    if (dbConnection && mongoose.connection.readyState === 1) return;
    try {
        dbConnection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
};

// Database Schemas & Models
const ProfileSchema = new mongoose.Schema({
    logoFirstName: String,
    logoLastName: String,
    logoSubtitle: String,
    name: String,
    title: String,
    description: String,
    bioTitle: String,
    bioText1: String,
    bioText2: String,
    location: String,
    email: String,
    experienceYears: String,
    happyClients: String,
    successRate: String,
    cvBase64: String
});
const Profile = mongoose.model('Profile', ProfileSchema);

const ProjectSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    tags: [String],
    demoLink: String,
    githubLink: String
});
const Project = mongoose.model('Project', ProjectSchema);

const SkillSchema = new mongoose.Schema({
    category: String,
    icon: String,
    skills: [{
        name: String,
        level: Number
    }]
});
const Skill = mongoose.model('Skill', SkillSchema);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Disable caching for API calls to support real-time sync across multiple devices
app.use('/api', (req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    next();
});

app.use(express.static(path.join(__dirname)));

// Ensure data folder exists (Local fallback)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');

// --- SEED SECTIONS ---
const initialProjects = [
    {
        id: "1",
        title: "AI SaaS Analytics Dashboard",
        description: "A real-time data analysis software incorporating OpenAI API for smart content generation, predictive graphs, and multi-tenant user billing integration.",
        image: "assets/project_saas.png",
        tags: ["Next.js", "TypeScript", "OpenAI"],
        demoLink: "#",
        githubLink: "#"
    },
    {
        id: "2",
        title: "Sleek Headless E-Commerce",
        description: "A lightning-fast modern online store featuring modular item grids, search filtering, user profile carts, and a highly secure checkout flow with Stripe.",
        image: "assets/project_ecommerce.png",
        tags: ["React.js", "Node.js", "Stripe"],
        demoLink: "#",
        githubLink: "#"
    },
    {
        id: "3",
        title: "Interactive Kanban Board",
        description: "A highly interactive productivity software with drag-and-drop capability, user workspaces, customizable color themes, and automatic browser storage persistence.",
        image: "assets/project_dashboard.png",
        tags: ["HTML5", "CSS3", "JavaScript"],
        demoLink: "#",
        githubLink: "#"
    }
];

if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(initialProjects, null, 2));
}

const initialProfile = {
    logoFirstName: "AbdElaziz",
    logoLastName: "Elsadany",
    logoSubtitle: "PORTFOLIO",
    name: "AbdElaziz Elsadany",
    title: "Senior Full-Stack Developer",
    description: "I build premium, high-performance web applications with a focus on animation, responsive UI architecture, and robust database logic.",
    bioTitle: "I engineer digital solutions that load fast and look premium.",
    bioText1: "I am a passionate Full-Stack developer with a knack for building sleek user interfaces and solid backends. I love staying at the forefront of web technologies and creating highly optimized web systems.",
    bioText2: "Whether it's a high-concurrency SaaS dashboard, a fast-loading landing page, or a dynamic application, I focus on clean architecture, beautiful animations, and ultimate mobile responsiveness.",
    location: "Cairo, Egypt",
    email: "zizoelsadany5@gmail.com",
    experienceYears: "3+",
    happyClients: "15+",
    successRate: "99%"
};

if (!fs.existsSync(PROFILE_FILE)) {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(initialProfile, null, 2));
}

const initialSkills = [
    {
        category: "Languages & Core",
        icon: "code-2",
        skills: [
            { name: "JavaScript (ES6+)", level: 95 },
            { name: "TypeScript", level: 85 },
            { name: "HTML5 & CSS3", level: 95 },
            { name: "PHP / Python", level: 75 }
        ]
    },
    {
        category: "Frontend Frameworks",
        icon: "layout",
        skills: [
            { name: "React.js", level: 92 },
            { name: "Next.js (App Router)", level: 90 },
            { name: "TailwindCSS", level: 95 },
            { name: "Redux / Zustand", level: 85 }
        ]
    },
    {
        category: "Backend & Databases",
        icon: "server",
        skills: [
            { name: "Node.js / Express", level: 90 },
            { name: "MongoDB", level: 88 },
            { name: "PostgreSQL / MySQL", level: 85 },
            { name: "RESTful & GraphQL APIs", level: 90 }
        ]
    },
    {
        category: "Tools & DevOps",
        icon: "terminal",
        skills: [
            { name: "Git & GitHub", level: 95 },
            { name: "Docker", level: 70 },
            { name: "Linux / Bash", level: 80 },
            { name: "Vercel / Netlify / AWS", level: 90 }
        ]
    }
];

if (!fs.existsSync(SKILLS_FILE)) {
    fs.writeFileSync(SKILLS_FILE, JSON.stringify(initialSkills, null, 2));
}

// --- FILE HELPER FUNCTIONS ---
function readJSON(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading database file: ${file}`, err);
        return [];
    }
}

function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing database file: ${file}`, err);
        return false;
    }
}

// --- API ENDPOINTS ---

// 1. Auth Login Route
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: "zizo_secret_session_token_12345" });
    } else {
        res.status(401).json({ success: false, message: "Incorrect password." });
    }
});

// 2. Profile Details Routes
app.get('/api/profile', async (req, res) => {
    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            let profile = await Profile.findOne();
            if (!profile) {
                profile = new Profile(initialProfile);
                await profile.save();
            }
            return res.json(profile);
        }
        
        const profile = readJSON(PROFILE_FILE);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/profile', async (req, res) => {
    const token = req.headers.authorization;
    if (token !== "zizo_secret_session_token_12345") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const updatedProfile = req.body;
    if (!updatedProfile.name || !updatedProfile.title) {
        return res.status(400).json({ success: false, message: "Name and title are required fields." });
    }

    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            let profile = await Profile.findOne();
            if (!profile) {
                profile = new Profile(updatedProfile);
            } else {
                // Merge text inputs (exclude cvBase64 to not wipe it)
                const cvBase64 = profile.cvBase64;
                Object.assign(profile, updatedProfile);
                if (!updatedProfile.cvBase64 && cvBase64) {
                    profile.cvBase64 = cvBase64;
                }
            }
            await profile.save();
            return res.json({ success: true, profile });
        }

        const currentProfile = readJSON(PROFILE_FILE);
        const mergedProfile = { ...currentProfile, ...updatedProfile };
        if (writeJSON(PROFILE_FILE, mergedProfile)) {
            res.json({ success: true, profile: mergedProfile });
        } else {
            res.status(500).json({ success: false, message: "Failed to write profile updates." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CV File Processing Routes
app.post('/api/profile/upload-cv', async (req, res) => {
    const token = req.headers.authorization;
    if (token !== "zizo_secret_session_token_12345") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { fileData } = req.body;
    if (!fileData) {
        return res.status(400).json({ success: false, message: "No file data provided." });
    }

    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            let profile = await Profile.findOne();
            if (!profile) {
                profile = new Profile(initialProfile);
            }
            profile.cvBase64 = fileData;
            await profile.save();
            return res.json({ success: true, message: "CV uploaded to database successfully." });
        }

        // Local filesystem fallback
        const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ success: false, message: "Invalid base64 PDF format." });
        }

        const buffer = Buffer.from(matches[2], 'base64');
        const assetsDir = path.join(__dirname, 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir);
        }

        fs.writeFileSync(path.join(assetsDir, 'resume.pdf'), buffer);
        res.json({ success: true, message: "CV uploaded to local storage successfully." });
    } catch (err) {
        console.error("Error saving CV file:", err);
        res.status(500).json({ success: false, message: "Failed to write PDF file." });
    }
});

app.get('/api/profile/download-cv', async (req, res) => {
    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            const profile = await Profile.findOne();
            if (profile && profile.cvBase64) {
                const matches = profile.cvBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const buffer = Buffer.from(matches[2], 'base64');
                    res.set({
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="resume.pdf"'
                    });
                    return res.send(buffer);
                }
            }
        }

        const localPath = path.join(__dirname, 'assets', 'resume.pdf');
        if (fs.existsSync(localPath)) {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"'
            });
            return res.sendFile(localPath);
        }

        res.status(404).send("CV File not found.");
    } catch (err) {
        console.error("Error serving CV file:", err);
        res.status(500).send("Error streaming CV file.");
    }
});

// 3. Technical Skills Routes
app.get('/api/skills', async (req, res) => {
    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            let skills = await Skill.find();
            if (skills.length === 0) {
                const defaultSkills = readJSON(SKILLS_FILE) || [];
                if (defaultSkills.length > 0) {
                    await Skill.insertMany(defaultSkills);
                    skills = await Skill.find();
                }
            }
            return res.json(skills);
        }

        const skills = readJSON(SKILLS_FILE);
        res.json(skills);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/skills', async (req, res) => {
    const token = req.headers.authorization;
    if (token !== "zizo_secret_session_token_12345") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const updatedSkills = req.body;
    if (!Array.isArray(updatedSkills)) {
        return res.status(400).json({ success: false, message: "Skills payload must be an array." });
    }

    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            await Skill.deleteMany({});
            await Skill.insertMany(updatedSkills);
            return res.json({ success: true, skills: updatedSkills });
        }

        if (writeJSON(SKILLS_FILE, updatedSkills)) {
            res.json({ success: true, skills: updatedSkills });
        } else {
            res.status(500).json({ success: false, message: "Failed to write skills updates." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Projects Routes (CRUD)
app.get('/api/projects', async (req, res) => {
    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            let projects = await Project.find();
            if (projects.length === 0) {
                const defaultProjects = readJSON(PROJECTS_FILE) || [];
                if (defaultProjects.length > 0) {
                    await Project.insertMany(defaultProjects);
                    projects = await Project.find();
                }
            }
            // Map _id to id
            const mapped = projects.map(p => {
                const o = p.toObject();
                o.id = o._id.toString();
                return o;
            });
            return res.json(mapped);
        }

        const projects = readJSON(PROJECTS_FILE);
        res.json(projects);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    const token = req.headers.authorization;
    if (token !== "zizo_secret_session_token_12345") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { title, description, image, tags, demoLink, githubLink } = req.body;
    if (!title || !description) {
        return res.status(400).json({ success: false, message: "Title and description are required." });
    }

    const newProjectData = {
        title,
        description,
        image: image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
        demoLink: demoLink || "#",
        githubLink: githubLink || "#"
    };

    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            const project = new Project(newProjectData);
            await project.save();
            const o = project.toObject();
            o.id = o._id.toString();
            return res.status(201).json({ success: true, project: o });
        }

        const projects = readJSON(PROJECTS_FILE);
        const newProject = {
            id: Date.now().toString(),
            ...newProjectData
        };
        projects.push(newProject);
        if (writeJSON(PROJECTS_FILE, projects)) {
            res.status(201).json({ success: true, project: newProject });
        } else {
            res.status(500).json({ success: false, message: "Failed to save project." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    const token = req.headers.authorization;
    if (token !== "zizo_secret_session_token_12345") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { id } = req.params;
    const { title, description, image, tags, demoLink, githubLink } = req.body;
    const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : undefined;

    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            const project = await Project.findById(id);
            if (!project) return res.status(404).json({ success: false, message: "Project not found." });

            if (title !== undefined) project.title = title;
            if (description !== undefined) project.description = description;
            if (image !== undefined) project.image = image;
            if (tagsArray !== undefined) project.tags = tagsArray;
            if (demoLink !== undefined) project.demoLink = demoLink;
            if (githubLink !== undefined) project.githubLink = githubLink;

            await project.save();
            const o = project.toObject();
            o.id = o._id.toString();
            return res.json({ success: true, project: o });
        }

        const projects = readJSON(PROJECTS_FILE);
        const projectIndex = projects.findIndex(p => p.id === id);
        if (projectIndex === -1) {
            return res.status(404).json({ success: false, message: "Project not found." });
        }

        const updatedProject = {
            ...projects[projectIndex],
            title: title !== undefined ? title : projects[projectIndex].title,
            description: description !== undefined ? description : projects[projectIndex].description,
            image: image !== undefined ? image : projects[projectIndex].image,
            tags: tagsArray !== undefined ? tagsArray : projects[projectIndex].tags,
            demoLink: demoLink !== undefined ? demoLink : projects[projectIndex].demoLink,
            githubLink: githubLink !== undefined ? githubLink : projects[projectIndex].githubLink
        };

        projects[projectIndex] = updatedProject;
        if (writeJSON(PROJECTS_FILE, projects)) {
            res.json({ success: true, project: updatedProject });
        } else {
            res.status(500).json({ success: false, message: "Failed to update project." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const token = req.headers.authorization;
    if (token !== "zizo_secret_session_token_12345") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { id } = req.params;

    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
            const project = await Project.findByIdAndDelete(id);
            if (!project) return res.status(404).json({ success: false, message: "Project not found." });
            return res.json({ success: true, message: "Project deleted successfully." });
        }

        let projects = readJSON(PROJECTS_FILE);
        const initialLength = projects.length;
        projects = projects.filter(p => p.id !== id);

        if (projects.length === initialLength) {
            return res.status(404).json({ success: false, message: "Project not found." });
        }

        if (writeJSON(PROJECTS_FILE, projects)) {
            res.json({ success: true, message: "Project deleted successfully." });
        } else {
            res.status(500).json({ success: false, message: "Failed to delete project." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('*', (req, res) => {
    if (req.path.includes('.') || req.path.startsWith('/assets/') || req.path.startsWith('/data/')) {
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`=================================================`);
        console.log(`  AbdElaziz's Portfolio Server Running!`);
        console.log(`  Local Address:   http://localhost:${PORT}`);
        console.log(`  Admin Panel:     http://localhost:${PORT}/admin.html`);
        console.log(`  Access from LAN: http://<your-ip>:${PORT}`);
        console.log(`=================================================`);
    });
}

module.exports = app;
