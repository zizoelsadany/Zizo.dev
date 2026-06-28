document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const loginOverlay = document.getElementById('login-overlay');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');
    const passwordInput = document.getElementById('admin-password');
    const logoutBtn = document.getElementById('logout-btn');

    // Projects CRUD selectors
    const projectForm = document.getElementById('project-crud-form');
    const projectIdInput = document.getElementById('project-id');
    const projectTitleInput = document.getElementById('project-title');
    const projectDescInput = document.getElementById('project-desc');
    const projectImageInput = document.getElementById('project-image');
    const projectTagsInput = document.getElementById('project-tags');
    const projectDemoInput = document.getElementById('project-demo');
    const projectGithubInput = document.getElementById('project-github');

    const formActionTitle = document.getElementById('form-action-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const crudStatus = document.getElementById('crud-status');
    const projectsListTable = document.getElementById('projects-list-table');

    // Profile selectors
    const profileForm = document.getElementById('profile-edit-form');
    const profileStatus = document.getElementById('profile-status');

    // Skills selectors
    const skillsJsonInput = document.getElementById('skills-json-input');
    const formatSkillsBtn = document.getElementById('format-skills-btn');
    const saveSkillsBtn = document.getElementById('save-skills-btn');
    const skillsStatus = document.getElementById('skills-status');

    let allProjects = [];

    // Tabs Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Check Auth Status
    function checkAuth() {
        const token = localStorage.getItem('zizo_admin_token');
        if (token === "zizo_secret_session_token_12345") {
            loginOverlay.style.display = 'none';
            adminDashboard.style.display = 'block';
            loadAdminProjects();
            loadAdminProfile();
            loadAdminSkills();
        } else {
            loginOverlay.style.display = 'flex';
            adminDashboard.style.display = 'none';
            if (passwordInput) passwordInput.focus();
        }
    }

    checkAuth();

    // Login Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = passwordInput.value;
            
            loginStatus.className = 'form-status';
            loginStatus.textContent = 'Authenticating...';

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('zizo_admin_token', data.token);
                    loginStatus.className = 'form-status success';
                    loginStatus.textContent = 'Success! Accessing dashboard...';
                    setTimeout(() => {
                        passwordInput.value = '';
                        checkAuth();
                    }, 800);
                } else {
                    loginStatus.className = 'form-status error';
                    loginStatus.textContent = data.message || 'Incorrect password.';
                }
            } catch (err) {
                loginStatus.className = 'form-status error';
                loginStatus.textContent = 'Server connection error.';
            }
        });
    }

    // Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('zizo_admin_token');
            checkAuth();
        });
    }

    // --- Tab 1: Projects Portfolio Logic ---
    async function loadAdminProjects() {
        if (!projectsListTable) return;
        
        projectsListTable.innerHTML = `<div class="loading-state"><span class="pulse-dot"></span> Fetching projects...</div>`;

        try {
            const response = await fetch(`/api/projects?t=${Date.now()}`);
            allProjects = await response.json();
            
            renderAdminProjects(allProjects);
        } catch (err) {
            projectsListTable.innerHTML = `<div class="loading-state" style="color:#ef4444;">Failed to fetch database projects.</div>`;
        }
    }

    function renderAdminProjects(projects) {
        if (projects.length === 0) {
            projectsListTable.innerHTML = `
                <div class="loading-state">
                    <p>No projects found in database.</p>
                </div>
            `;
            return;
        }

        projectsListTable.innerHTML = projects.map(proj => `
            <div class="list-item-card">
                <img src="${proj.image}" alt="${proj.title}" class="item-img-preview" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'">
                <div class="item-info">
                    <h4 class="item-title">${proj.title}</h4>
                    <div class="item-tags">
                        ${proj.tags.map(t => `<span class="item-tag-badge">${t}</span>`).join('')}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-icon-only btn-edit-action" data-id="${proj.id}" title="Edit Project">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only btn-delete-action" data-id="${proj.id}" title="Delete Project">
                        <i data-lucide="trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();

        // Attach event listeners
        document.querySelectorAll('.btn-edit-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const project = allProjects.find(p => p.id === id);
                if (project) setupEditMode(project);
            });
        });

        document.querySelectorAll('.btn-delete-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteProject(id);
            });
        });
    }

    function setupEditMode(project) {
        projectIdInput.value = project.id;
        projectTitleInput.value = project.title;
        projectDescInput.value = project.description;
        projectImageInput.value = project.image;
        projectTagsInput.value = project.tags.join(', ');
        projectDemoInput.value = project.demoLink;
        projectGithubInput.value = project.githubLink;

        formActionTitle.innerHTML = `<i data-lucide="edit" class="text-gradient"></i> Edit Project`;
        saveBtn.innerHTML = `<i data-lucide="save"></i> Update Project`;
        cancelEditBtn.style.display = 'inline-flex';
        lucide.createIcons();
        
        projectTitleInput.scrollIntoView({ behavior: 'smooth' });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetForm);
    }

    function resetForm() {
        projectForm.reset();
        projectIdInput.value = '';
        formActionTitle.innerHTML = `<i data-lucide="plus-circle" class="text-gradient"></i> Add New Project`;
        saveBtn.innerHTML = `<i data-lucide="save"></i> Save Project`;
        cancelEditBtn.style.display = 'none';
        lucide.createIcons();
    }

    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const token = localStorage.getItem('zizo_admin_token');
            const id = projectIdInput.value;
            const title = projectTitleInput.value;
            const description = projectDescInput.value;
            const image = projectImageInput.value;
            const tags = projectTagsInput.value;
            const demoLink = projectDemoInput.value;
            const githubLink = projectGithubInput.value;

            const isEdit = id !== '';
            const url = isEdit ? `/api/projects/${id}` : '/api/projects';
            const method = isEdit ? 'PUT' : 'POST';

            crudStatus.className = 'form-status';
            crudStatus.textContent = isEdit ? 'Updating project...' : 'Creating project...';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ title, description, image, tags, demoLink, githubLink })
                });

                const data = await response.json();
                if (data.success) {
                    crudStatus.className = 'form-status success';
                    crudStatus.textContent = isEdit ? 'Project updated successfully!' : 'Project created successfully!';
                    
                    resetForm();
                    loadAdminProjects();

                    setTimeout(() => {
                        crudStatus.className = 'form-status';
                        crudStatus.textContent = '';
                    }, 4000);
                } else {
                    crudStatus.className = 'form-status error';
                    crudStatus.textContent = data.message || 'Database transaction failed.';
                }
            } catch (err) {
                crudStatus.className = 'form-status error';
                crudStatus.textContent = 'Server response error.';
            }
        });
    }

    async function deleteProject(id) {
        const confirmDelete = confirm("Are you sure you want to delete this project? This will sync immediately on all devices.");
        if (!confirmDelete) return;

        const token = localStorage.getItem('zizo_admin_token');
        crudStatus.className = 'form-status';
        crudStatus.textContent = 'Deleting project...';

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });

            const data = await response.json();
            if (data.success) {
                crudStatus.className = 'form-status success';
                crudStatus.textContent = 'Project deleted successfully.';
                loadAdminProjects();
                
                setTimeout(() => {
                    crudStatus.className = 'form-status';
                    crudStatus.textContent = '';
                }, 4000);
            } else {
                crudStatus.className = 'form-status error';
                crudStatus.textContent = data.message || 'Delete operation failed.';
            }
        } catch (err) {
            crudStatus.className = 'form-status error';
            crudStatus.textContent = 'Server response error.';
        }
    }

    // --- Tab 2: Profile Management Logic ---
    async function loadAdminProfile() {
        try {
            const response = await fetch(`/api/profile?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to load profile details.");
            const profile = await response.json();

            document.getElementById('profile-logo-first').value = profile.logoFirstName || '';
            document.getElementById('profile-logo-last').value = profile.logoLastName || '';
            document.getElementById('profile-logo-sub').value = profile.logoSubtitle || '';
            document.getElementById('profile-name').value = profile.name || '';
            document.getElementById('profile-title').value = profile.title || '';
            document.getElementById('profile-desc').value = profile.description || '';
            document.getElementById('profile-biotitle').value = profile.bioTitle || '';
            document.getElementById('profile-biotext1').value = profile.bioText1 || '';
            document.getElementById('profile-biotext2').value = profile.bioText2 || '';
            document.getElementById('profile-location').value = profile.location || '';
            document.getElementById('profile-email').value = profile.email || '';
            document.getElementById('profile-experience').value = profile.experienceYears || '';
            document.getElementById('profile-clients').value = profile.happyClients || '';
            document.getElementById('profile-success').value = profile.successRate || '';
        } catch (err) {
            console.error("Error loading profile configuration:", err);
        }
    }

    function readCVFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('zizo_admin_token');

            const updatedProfile = {
                logoFirstName: document.getElementById('profile-logo-first').value,
                logoLastName: document.getElementById('profile-logo-last').value,
                logoSubtitle: document.getElementById('profile-logo-sub').value,
                name: document.getElementById('profile-name').value,
                title: document.getElementById('profile-title').value,
                description: document.getElementById('profile-desc').value,
                bioTitle: document.getElementById('profile-biotitle').value,
                bioText1: document.getElementById('profile-biotext1').value,
                bioText2: document.getElementById('profile-biotext2').value,
                location: document.getElementById('profile-location').value,
                email: document.getElementById('profile-email').value,
                experienceYears: document.getElementById('profile-experience').value,
                happyClients: document.getElementById('profile-clients').value,
                successRate: document.getElementById('profile-success').value
            };

            profileStatus.className = 'form-status';
            profileStatus.textContent = 'Synchronizing profile details...';

            try {
                // 1. Update text profile info
                const response = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(updatedProfile)
                });
                const data = await response.json();
                
                if (!data.success) {
                    profileStatus.className = 'form-status error';
                    profileStatus.textContent = data.message || 'Profile save transaction failed.';
                    return;
                }

                // 2. Check if CV PDF file is selected to upload
                const cvFileInput = document.getElementById('profile-cv-upload');
                let uploadSuccess = true;
                let uploadErrorMsg = '';

                if (cvFileInput && cvFileInput.files.length > 0) {
                    profileStatus.textContent = 'Profile saved. Processing PDF CV upload...';
                    
                    const file = cvFileInput.files[0];
                    try {
                        const base64Data = await readCVFileAsBase64(file);
                        const uploadRes = await fetch('/api/profile/upload-cv', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token
                            },
                            body: JSON.stringify({ fileData: base64Data })
                        });
                        const uploadData = await uploadRes.json();
                        if (!uploadData.success) {
                            uploadSuccess = false;
                            uploadErrorMsg = uploadData.message || 'Server failed to save CV.';
                        } else {
                            cvFileInput.value = ''; // Reset input field
                        }
                    } catch (uploadErr) {
                        uploadSuccess = false;
                        uploadErrorMsg = 'CV parsing or network connection error.';
                    }
                }

                // 3. Output final combined status
                if (uploadSuccess) {
                    profileStatus.className = 'form-status success';
                    profileStatus.textContent = 'Profile details and CV PDF updated and synced successfully!';
                } else {
                    profileStatus.className = 'form-status error';
                    profileStatus.textContent = 'Profile details saved, but CV upload failed: ' + uploadErrorMsg;
                }

                setTimeout(() => {
                    profileStatus.className = 'form-status';
                    profileStatus.textContent = '';
                }, 5000);

            } catch (err) {
                profileStatus.className = 'form-status error';
                profileStatus.textContent = 'Server response error.';
            }
        });
    }

    // --- Tab 3: Technical Skills Logic ---
    async function loadAdminSkills() {
        if (!skillsJsonInput) return;
        try {
            const response = await fetch(`/api/skills?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to load skills list.");
            const skills = await response.json();
            skillsJsonInput.value = JSON.stringify(skills, null, 4);
        } catch (err) {
            console.error("Error loading technical skills configuration:", err);
        }
    }

    if (formatSkillsBtn && skillsJsonInput) {
        formatSkillsBtn.addEventListener('click', () => {
            try {
                const parsed = JSON.parse(skillsJsonInput.value);
                skillsJsonInput.value = JSON.stringify(parsed, null, 4);
                skillsStatus.className = 'form-status success';
                skillsStatus.textContent = 'JSON syntax formatted successfully!';
                setTimeout(() => {
                    skillsStatus.className = 'form-status';
                    skillsStatus.textContent = '';
                }, 3000);
            } catch (err) {
                skillsStatus.className = 'form-status error';
                skillsStatus.textContent = 'JSON Syntax Error: ' + err.message;
            }
        });
    }

    if (saveSkillsBtn && skillsJsonInput) {
        saveSkillsBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('zizo_admin_token');
            let skillsArray = [];
            
            skillsStatus.className = 'form-status';
            skillsStatus.textContent = 'Validating JSON array...';

            try {
                skillsArray = JSON.parse(skillsJsonInput.value);
                if (!Array.isArray(skillsArray)) {
                    throw new Error("Target root schema must be an array.");
                }
            } catch (err) {
                skillsStatus.className = 'form-status error';
                skillsStatus.textContent = 'Validation Error: ' + err.message;
                return;
            }

            skillsStatus.textContent = 'Saving skills configuration to database...';

            try {
                const response = await fetch('/api/skills', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(skillsArray)
                });
                const data = await response.json();
                if (data.success) {
                    skillsStatus.className = 'form-status success';
                    skillsStatus.textContent = 'Technical skills array synchronized successfully!';
                    setTimeout(() => {
                        skillsStatus.className = 'form-status';
                        skillsStatus.textContent = '';
                    }, 4000);
                } else {
                    skillsStatus.className = 'form-status error';
                    skillsStatus.textContent = data.message || 'Skills save transaction failed.';
                }
            } catch (err) {
                skillsStatus.className = 'form-status error';
                skillsStatus.textContent = 'Server response error.';
            }
        });
    }
});
