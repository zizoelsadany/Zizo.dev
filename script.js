document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Fetch & Render Profile, Skills, and Projects Dynamically from API
    const projectsGrid = document.getElementById('projects-grid');
    const statsProjectsCount = document.getElementById('stats-projects-count');
    const skillsGrid = document.getElementById('skills-grid');
    
    let globalProjects = []; // Store fetched projects for terminal lookup
    let globalProfile = {};  // Store fetched profile for terminal lookup
    let globalSkills = [];   // Store fetched skills for terminal lookup

    async function loadProfile() {
        try {
            const response = await fetch(`/api/profile?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to load profile.");
            const profile = await response.json();
            globalProfile = profile;

            // Bind values to UI elements
            const heroName = document.getElementById('hero-name');
            const heroTitle = document.getElementById('hero-title');
            const heroDesc = document.getElementById('hero-desc');
            const aboutBioTitle = document.getElementById('about-bio-title');
            const aboutBioText1 = document.getElementById('about-bio-text-1');
            const aboutBioText2 = document.getElementById('about-bio-text-2');
            const aboutLocation = document.getElementById('about-location');
            const aboutEmail = document.getElementById('about-email');
            
            const statExperience = document.getElementById('stat-experience');
            const statClients = document.getElementById('stat-clients');
            const statSuccess = document.getElementById('stat-success');

            if (heroName) heroName.textContent = profile.name;
            if (heroTitle) heroTitle.textContent = profile.title;
            if (heroDesc) heroDesc.textContent = profile.description;

            // Bind Header and Footer Logos
            const logoFirst = document.getElementById('logo-first');
            const logoLast = document.getElementById('logo-last');
            const logoSub = document.getElementById('logo-sub');
            const footerLogoFirst = document.getElementById('footer-logo-first');
            const footerLogoLast = document.getElementById('footer-logo-last');
            const footerLogoSub = document.getElementById('footer-logo-sub');

            if (logoFirst) logoFirst.textContent = profile.logoFirstName || 'Zeyad';
            if (logoLast) logoLast.textContent = profile.logoLastName || 'Zizo';
            if (logoSub) logoSub.textContent = profile.logoSubtitle || 'PORTFOLIO';

            if (footerLogoFirst) footerLogoFirst.textContent = profile.logoFirstName || 'Zeyad';
            if (footerLogoLast) footerLogoLast.textContent = profile.logoLastName || 'Zizo';
            if (footerLogoSub) footerLogoSub.textContent = profile.logoSubtitle || 'PORTFOLIO';
            
            if (aboutBioTitle) aboutBioTitle.textContent = profile.bioTitle;
            if (aboutBioText1) aboutBioText1.textContent = profile.bioText1;
            if (aboutBioText2) aboutBioText2.textContent = profile.bioText2;
            
            if (aboutLocation) aboutLocation.textContent = profile.location;
            if (aboutEmail) {
                aboutEmail.innerHTML = `<a href="mailto:${profile.email}">${profile.email}</a>`;
            }

            if (statExperience) statExperience.textContent = profile.experienceYears;
            if (statClients) statClients.textContent = profile.happyClients;
            if (statSuccess) statSuccess.textContent = profile.successRate;
        } catch (error) {
            console.error("Profile load error:", error);
        }
    }

    async function loadSkills() {
        try {
            const response = await fetch(`/api/skills?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to load skills.");
            const skills = await response.json();
            globalSkills = skills;

            if (skillsGrid) {
                if (skills.length === 0) {
                    skillsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No skills in database.</p>`;
                } else {
                    skillsGrid.innerHTML = skills.map(cat => `
                        <div class="skills-category-card">
                            <div class="category-header">
                                <i data-lucide="${cat.icon || 'code-2'}"></i>
                                <h3>${cat.category}</h3>
                            </div>
                            <div class="skills-list">
                                ${cat.skills.map(s => `
                                    <div class="skill-item">
                                        <span class="skill-name">${s.name}</span>
                                        <div class="skill-bar"><div class="skill-progress" style="width: ${s.level}%;"></div></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('');
                }
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        } catch (error) {
            console.error("Skills load error:", error);
            if (skillsGrid) {
                skillsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Failed to load skills.</p>`;
            }
        }
    }

    async function loadProjects() {
        try {
            const response = await fetch(`/api/projects?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to load projects.");
            const projects = await response.json();
            globalProjects = projects;
            
            // Update stats count
            if (statsProjectsCount) {
                statsProjectsCount.textContent = `${projects.length}+`;
            }

            // Render projects
            if (projectsGrid) {
                if (projects.length === 0) {
                    projectsGrid.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
                            <i data-lucide="folder-open" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                            <p>No projects found in database. Add some from the Admin Panel!</p>
                        </div>
                    `;
                } else {
                    projectsGrid.innerHTML = projects.map(proj => `
                        <div class="project-card">
                            <div class="project-img-wrapper">
                                <img src="${proj.image}" alt="${proj.title} Preview" class="project-img" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'">
                                <div class="project-overlay">
                                    <div class="project-links">
                                        <a href="${proj.demoLink}" target="_blank" rel="noopener noreferrer" class="project-link-btn" aria-label="View live demo"><i data-lucide="external-link"></i></a>
                                        <a href="${proj.githubLink}" target="_blank" rel="noopener noreferrer" class="project-link-btn" aria-label="View source code"><i data-lucide="github"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="project-details">
                                <div class="project-tags">
                                    ${proj.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                                </div>
                                <h3 class="project-title">${proj.title}</h3>
                                <p class="project-description">${proj.description}</p>
                            </div>
                        </div>
                    `).join('');
                }
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        } catch (error) {
            console.error(error);
            if (projectsGrid) {
                projectsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px;">
                        <p>Error loading projects from database. Please check server status.</p>
                    </div>
                `;
            }
        }
    }

    loadProfile();
    loadSkills();
    loadProjects();

    // 3. Sliding Active Link Highlight (Pill)
    const activePill = document.getElementById('nav-active-pill');
    const navLinks = document.querySelectorAll('.nav-link');
    const mainNav = document.getElementById('main-nav');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    function updateActivePill() {
        if (window.innerWidth > 768) {
            const activeLink = document.querySelector('.nav-link.active');
            if (activeLink && activePill) {
                activePill.style.display = 'block';
                activePill.style.width = `${activeLink.offsetWidth}px`;
                activePill.style.height = `${activeLink.offsetHeight}px`;
                activePill.style.left = `${activeLink.offsetLeft}px`;
                activePill.style.top = `${activeLink.offsetTop}px`;
            }
        } else {
            if (activePill) {
                activePill.style.display = 'none';
            }
        }
    }

    setTimeout(updateActivePill, 200);
    window.addEventListener('resize', updateActivePill);

    // 4. Mobile Navigation Menu Toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            const menuIcon = mobileToggle.querySelector('i');
            
            if (menuIcon) {
                if (isOpen) {
                    menuIcon.setAttribute('data-lucide', 'x');
                } else {
                    menuIcon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                const menuIcon = mobileToggle.querySelector('i');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            }
        });
    });

    // 5. Scroll Active Section Tracker (Intersection Observer)
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
                
                if (correspondingLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                    updateActivePill();
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    });

    // 6. Magnetic Spotlight Glow Effect for Cards
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.service-card, .skills-category-card, .project-card, .stat-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 7. Interactive Terminal Sandbox Simulator
    const terminalBody = document.getElementById('terminal-body');
    const terminalInput = document.getElementById('terminal-input');

    if (terminalInput && terminalBody) {
        // Keep focus on terminal input when clicking inside body
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim().toLowerCase();
                
                // 1. Output the entered command line
                const inputLine = document.createElement('div');
                inputLine.className = 'terminal-line';
                inputLine.innerHTML = `<span class="terminal-prompt">guest@zizo.dev:~$</span> <span>${terminalInput.value}</span>`;
                
                // Insert before the input line container
                terminalBody.insertBefore(inputLine, terminalInput.parentElement);
                terminalInput.value = '';

                // 2. Process command
                const responseLine = document.createElement('div');
                responseLine.className = 'terminal-line';

                switch (command) {
                    case '':
                        responseLine.innerHTML = '';
                        break;
                    case 'help':
                        responseLine.innerHTML = `
                            Available commands:<br>
                            - <span class="text-gradient" style="font-weight:bold;">about</span>    : Learn more about Zeyad.<br>
                            - <span class="text-gradient" style="font-weight:bold;">skills</span>   : Print out core technical stack.<br>
                            - <span class="text-gradient" style="font-weight:bold;">projects</span> : List featured project titles.<br>
                            - <span class="text-gradient" style="font-weight:bold;">contact</span>  : Get email and social contact links.<br>
                            - <span class="text-gradient" style="font-weight:bold;">clear</span>    : Clear terminal screen.
                        `;
                        break;
                    case 'about':
                        responseLine.innerHTML = `${globalProfile.name || 'Zeyad Zizo'} is a ${globalProfile.title || 'Senior Full-Stack Developer'} based in ${globalProfile.location || 'Cairo, Egypt'}. ${globalProfile.bioText1 || ''}`;
                        break;
                    case 'skills':
                        if (globalSkills.length === 0) {
                            responseLine.innerHTML = "No skills data loaded from database.";
                        } else {
                            responseLine.innerHTML = "Technical Stack Categories:<br>" + 
                                globalSkills.map(cat => `- <span style="color:var(--accent-color); font-weight:bold;">${cat.category}</span>: ${cat.skills.map(s => `${s.name} (${s.level}%)`).join(', ')}`).join('<br>');
                        }
                        break;
                    case 'projects':
                        if (globalProjects.length === 0) {
                            responseLine.innerHTML = "No projects in database. Fetching...";
                        } else {
                            responseLine.innerHTML = "Featured Projects in Database:<br>" + 
                                globalProjects.map((p, idx) => `${idx + 1}. <span style="color:var(--accent-color); font-weight:bold;">${p.title}</span> - ${p.tags.join(', ')}`).join('<br>');
                        }
                        break;
                    case 'contact':
                        responseLine.innerHTML = `
                            Contact Information:<br>
                            - <span style="color:var(--accent-color);">Email</span>: ${globalProfile.email || 'zeyad@zizo.dev'}<br>
                            - <span style="color:var(--accent-secondary);">GitHub</span>: github.com/zizo-dev<br>
                            - <span style="color:#22c55e;">LinkedIn</span>: linkedin.com/in/zizo-dev
                        `;
                        break;
                    case 'clear':
                        // Remove all output lines before the input line
                        const lines = Array.from(terminalBody.querySelectorAll('.terminal-line'));
                        lines.forEach(line => line.remove());
                        responseLine.innerHTML = '';
                        break;
                    default:
                        responseLine.innerHTML = `sh: command not found: <span style="color:#ef4444;">${command}</span>. Type <span style="color:var(--accent-color);">help</span> for instructions.`;
                        break;
                }

                if (command !== 'clear') {
                    terminalBody.insertBefore(responseLine, terminalInput.parentElement);
                }
                
                // 3. Scroll to bottom
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        });
    }

    // 8. Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            submitBtn.disabled = true;
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Sending...</span><div class="pulse-dot"></div>`;
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                formStatus.className = 'form-status success';
                formStatus.innerHTML = '<i data-lucide="check-circle" style="display:inline-block; vertical-align:middle; margin-right:6px; width:16px; height:16px;"></i> Message sent successfully! I will reply soon.';
                lucide.createIcons();
                
                contactForm.reset();
                
                setTimeout(() => {
                    formStatus.className = 'form-status';
                    formStatus.innerHTML = '';
                }, 5000);
            }, 1500);
        });
    }

    // 9. Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTopBtn.style.display = 'flex';
                backToTopBtn.style.opacity = '1';
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => {
                    if (window.scrollY <= 600) {
                        backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        });

        backToTopBtn.style.display = 'none';
        backToTopBtn.style.transition = 'opacity 0.3s ease';

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
