// Matrix background effect
function initMatrix() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  const characters =
    "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?";
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(0);

  function draw() {
    ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00FF41";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
  window.addEventListener("resize", resizeCanvas);
}

// Common Loader function
function showCommonLoader() {
  return new Promise((resolve) => {
    const loader = document.getElementById("commonLoader");
    const progress = document.getElementById("commonLoaderProgress");

    // Show loader
    loader.classList.add("active");
    progress.style.width = "0%";

    // Simulate loading progress - shorter duration
    const progressSteps = [
      { width: "30%", delay: 200 },
      { width: "60%", delay: 300 },
      { width: "90%", delay: 600 },
      { width: "100%", delay: 200 }
    ];

    let totalDelay = 0;
    progressSteps.forEach((step, index) => {
      totalDelay += step.delay;
      setTimeout(() => {
        progress.style.width = step.width;
      }, totalDelay);
    });

    // Hide loader after completion
    setTimeout(() => {
      loader.classList.remove("active");
      setTimeout(resolve, 0); // Shorter fade out
    }, totalDelay + 600);
  });
}

// Terminal Class
class TerminalPortfolio {
  constructor() {
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentInput = document.getElementById("terminalInput");
    this.terminalContent = document.getElementById("terminalContent");
    this.currentInputContainer = document.getElementById("currentInput");
    this.isLoading = false;

    this.commands = {
      "cr -help": () => this.showHelp(),
      "crombo -help": () => this.showHelp(),
      "cr -about": () => this.showAbout(),
      "crombo -about": () => this.showAbout(),
      "cr -skills": () => this.showSkills(),
      "crombo -skills": () => this.showSkills(),
      "cr -projects": () => this.showProjects(),
      "crombo -projects": () => this.showProjects(),
      "cr -certs" : () => this.showCertifications(),
      "crombo -certs" : () => this.showCertifications(),
      "cr -challs" : ()=> this.showChallenges(),
      "crombo -challs" : ()=> this.showChallenges(),
      "cr -contact": () => this.showContact(),
      "crombo -contact": () => this.showContact(),
      "cr -gui": () => this.switchToGUI(),
      "crombo -gui": () => this.switchToGUI(),
      "ls": () => this.listDirectory(),
      "cd": () => this.changeDirectory(),
      "clear": () => this.clearTerminal(),
      "exit": () => this.showViewSelector(),
    };

    this.initEventListeners();
    this.focusInput();
  }

  initEventListeners() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".terminal-window-controls")) {
        this.focusInput();
      }
    });

    if (this.currentInput) {
      this.currentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autoComplete();
        }
      });
    }

    // Terminal window controls
    const closeBtn = document.getElementById("closeTerminal");
    const minimizeBtn = document.getElementById("minimizeTerminal");
    const maximizeBtn = document.getElementById("maximizeTerminal");

    if (closeBtn) {
      closeBtn.addEventListener("click", async () => {
        await showCommonLoader();
        this.showViewSelector();
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        this.addOutput(
          '[INFO] Terminal minimized. Type "exit" to return to selection screen.'
        );
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", () => {
        this.addOutput("[INFO] Terminal maximized.");
      });
    }
  }

  executeCommand() {
    if (this.isLoading || !this.currentInput) return;

    const command = this.currentInput.value.trim();

    if (command) {
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
      this.addOutput(`CR0M80@portfolio:~$ ${command}`, "command-line");

      if (this.commands[command]) {
        this.commands[command]();
      } else if (command === "cd" || command.startsWith("cd ")) {
        this.changeDirectory(command);
      } else {
        this.addOutput(
          `bash: ${command}: command not found\nType 'cr -help' for available commands.`,
          "error"
        );
      }
    }

    this.clearInput();
    this.createNewPrompt();
  }

  autoComplete() {
    if (!this.currentInput) return;

    const input = this.currentInput.value;
    const commands = Object.keys(this.commands);
    const matches = commands.filter((cmd) =>
      cmd.startsWith(input.toLowerCase())
    );

    if (matches.length === 1) {
      this.currentInput.value = matches[0];
    } else if (matches.length > 1) {
      this.addOutput(matches.join("    "));
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0 || !this.currentInput) return;

    this.historyIndex = Math.max(
      0,
      Math.min(this.commandHistory.length, this.historyIndex + direction)
    );

    if (
      this.historyIndex >= 0 &&
      this.historyIndex < this.commandHistory.length
    ) {
      this.currentInput.value = this.commandHistory[this.historyIndex];
    } else {
      this.currentInput.value = "";
    }
  }

  showHelp() {
    const helpContent = `Available Commands:

You can use "cr" as a shorthand for the "crombo" command
Examples:

cr -help     - Show this help menu
cr -about    - Learn about me
cr -skills   - View my technical skills
cr -projects - See my projects
cr -certs    - See my certifications
cr -challs   - See Forensics challenges that CR0M80 created 
cr -contact  - Get my contact information
cr -gui      - Switch to GUI mode
ls           - List directory contents
cd           - Change directory
clear        - Clear terminal
exit         - Return to mode selection`;
    this.addOutput(helpContent);
  }

  showAbout() {
    const aboutAscii = ` 
 █████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
███████║██████╔╝██║   ██║██║   ██║   ██║   
██╔══██║██╔══██╗██║   ██║██║   ██║   ██║   
██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   `;

    const aboutContent = `${aboutAscii}

Who's CR0M80 ?
I am currently a Cyber Defense Engineering student at the National School of Applied Sciences of Marrakech, part of Cadi Ayyad University. I am deeply passionate about cybersecurity, with a strong interest in digital forensics and security analysis. I actively participate in CTF competitions as a player with my team "5T4F1T", mainly in the Forensics category, where I analyze digital evidence, investigate artifacts, and reconstruct attack scenarios.

I am also a CTF creator, designing forensic challenges to help others learn through realistic and technical scenarios.

My nickname, CR0M80, is inspired by the famous detective "Crombo", known for his intelligence, attention to detail, and ability to solve complex cases. This reflects my investigative mindset and my approach to cybersecurity, especially in forensics.

And as I often say when someone doesn’t follow instructions properly: “Rask mrab3, asat”
(A Moroccan expression meaning: do it properly and follow the instructions carefully)` ; 
    this.addOutput(aboutContent);
  }

  showSkills() {
    const skillsAscii = `
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝`;

    const skillsContent = `${skillsAscii}

Technical Skills:

Security:
██████████████████         93% Networking
█████████                 50% Web Security
██████████████             70% Network Security
█████████████████          85% Cryptography

Development:
█████████████████          85% Python
█████████                 50% C
███████████████            80% HTML
██████████████████         90% MySQL
█████                     35% PL/SQL

Tools & Technologies:
███████████████████        93% Kali Linux
████████████████           86% AutoPsy
███████████████            80% FTKImager
███████████████████        90% Volatility
█████████████████          89% Wireshark`;
    this.addOutput(skillsContent);
  }

  showProjects() {
    const projectsAscii = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗███████╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝██╔════╝
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   ███████╗
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   ╚════██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   ███████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝`;

    const projectsContent = `${projectsAscii}

Recent Projects:

  1. PenAut — Pentest Automation Tool

- Lightweight Linux-based penetration testing automation tool
- Automates reconnaissance, vulnerability analysis, and security checks
- Interactive CLI interface for fast security assessments
- Designed for learning, CTFs, and ethical hacking workflows

➤ Technologies: Python, Shell
➤ GitHub Link: https://github.com/CR0M80/PenAut
➤ Documentation: https://github.com/CR0M80/PenAut?tab=readme-ov-file#-penaut-toolkit


  2. CipherPWD — Encrypted Password Manager

- Command-line tool to securely store encrypted passwords locally
- Offline, open-source and cross-platform (Windows & Linux)
- Uses encryption to protect sensitive credentials
- Simple and efficient password management via terminal

➤ Technologies:  Python, Shell
➤ GitHub Link:   https://github.com/CR0M80/CipherPWD
➤ Documentation: https://github.com/CR0M80/CipherPWD#cipherpwd

  3. PNGFixer — CTF-Oriented PNG Resizer Tool

-  Lightweight Python tool for manipulating PNG image dimensions
-  Modifies IHDR chunk values (width & height) directly
-  Automatically recalculates CRC32 checksum
-  Designed for CTF challenges and digital forensics

➤ Technologies:  Python
➤ GitHub Link:   https://github.com/CR0M80/PNGFixer
➤ Documentation: https://github.com/CR0M80/PNGFixer#pngfixer---ctf-oriented-png-resizer-tool
`;
    this.addOutput(projectsContent);
  }

  showContact() {
    const contactAscii = `
 ██████╗ ██████╗ ███╗   ██╗████████╗ █████╗  ██████╗████████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║   ██║   ███████║██║        ██║   
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██║██║        ██║   
╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╗   ██║   
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝   `;

    const contactContent = `${contactAscii}

Contact Information:

Email:        s.amar.sec@outlook.com
Phone:        +212 664433923
Availability: Currently available for freelance projects or Internship

Social:
- GitHub:     https://github.com/CR0M80
- LinkedIn:   https://www.linkedin.com/in/amar-saad
- Medium:     https://medium.com/@CR0M80
- TryHackMe:  https://tryhackme.com/p/CR0M80

Let's work together to secure your digital assets and 
build innovative technology solutions.`;
    this.addOutput(contactContent);
  }

  listDirectory() {
    const listDirectory = `Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos`;
    this.addOutput(listDirectory);
  }

  changeDirectory(command) {
    this.addOutput(
      `bash: ${command}: Permission denied\nType 'pf -help' for available commands.`,
      "error"
    );
  }
  showCertifications() {
      const certsAscii = `
    ██████╗███████╗██████╗ ████████╗██╗███████╗██╗ ██████╗ ██████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗
██╔════╝██╔════╝██╔══██╗╚══██╔══╝██║██╔════╝██║██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
██║     █████╗  ██████╔╝   ██║   ██║█████╗  ██║██║     ██████╔╝   ██║   ██║██║   ██║██╔██╗ ██║███████╗
██║     ██╔══╝  ██╔══██╗   ██║   ██║██╔══╝  ██║██║     ██╔══██╗   ██║   ██║██║   ██║██║╚██╗██║╚════██║
╚██████╗███████╗██║  ██║   ██║   ██║██║     ██║╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║
 ╚═════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   `;

      const certsContent = `${certsAscii}

          1. TryHackMe — Pre Security Certificate

        - Introductory cybersecurity certification covering networking, Linux, 
          security principles, and common attack techniques
        - Hands-on labs to build a strong foundational understanding of cybersecurity

        ➤ Issuing Organization: TryHackMe
        ➤ Year: 2025
        ➤ Certificate: https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-3CYUVATYV7.pdf

           2. Palo Alto — Network Security Fundamentals

        - Foundational certification focused on network security concepts, firewalls, 
          threat prevention, and modern security architectures
        - Introduces Palo Alto Networks technologies for protecting networks against cyber threats

        ➤ Issuing Organization: Palo Alto
        ➤ Year: 2025

           3. Comprehensive C — Udemy

        - Completed a comprehensive course covering C programming, core syntax, 
          data structures, and problem-solving techniques

        ➤ Issuing Organization: Udemy
        ➤ Year: 2023

           4. Contribution & Technical Leadership — Bootcamp

        - Explained digital forensics concepts and created practical CTF-style challenges 
          during a cybersecurity bootcamp

        ➤ Issuing Organization: GCDxN7 Bootcamp
        ➤ Year: 2023
        `;

      this.addOutput(certsContent);
  }

  showChallenges() {
      const certsAscii = `
██████╗ ███████╗██╗██████╗     ██████╗ ██╗   ██╗ 
██╔══██╗██╔════╝██║██╔══██╗    ██╔══██╗╚██╗ ██╔╝
██║  ██║█████╗  ██║██████╔╝    ██████╔╝ ╚████╔╝ 
██║  ██║██╔══╝  ██║██╔══██╗    ██╔══██╗  ╚██╔╝  
██████╔╝██║     ██║██║  ██║    ██████╔╝   ██║   
╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝    ╚═════╝    ╚═╝   
██████╗██████╗  ██████╗ ███╗   ███╗ █████╗  ██████╗ 
██╔════╝██╔══██╗██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗
██║     ██████╔╝██║   ██║██╔████╔██║╚█████╔╝██║   ██║
██║     ██╔══██╗██║   ██║██║╚██╔╝██║██╔══██╗██║   ██║
╚██████╗██║  ██║╚██████╔╝██║ ╚═╝ ██║╚█████╔╝╚██████╔╝
 ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ `;

      const certsContent = `${certsAscii}

         Please Switch to GUI interface for more details !!!  `;

      this.addOutput(certsContent);
  }


  async switchToGUI() {
    this.isLoading = true;
    this.addOutput("[INFO] Switching to GUI mode...");

    // Remove setTimeout and directly switch after loader
    await showCommonLoader();
    document.getElementById("terminalInterface").style.display = "none";
    document.getElementById("guiInterface").style.display = "block";
    initGUI();
    this.isLoading = false;
  }

  async showViewSelector() {
    this.isLoading = true;
    this.addOutput("[INFO] Returning to mode selection...");

    // Remove setTimeout and directly switch after loader
    await showCommonLoader();
    document.getElementById("terminalInterface").style.display = "none";
    document.getElementById("viewSelector").style.display = "flex";
    this.isLoading = false;
  }

  clearTerminal() {
    const outputs = this.terminalContent.querySelectorAll(".terminal-output");
    outputs.forEach((output, index) => {
      if (index > 0) output.remove();
    });
  }

  addOutput(content, type = "") {
    const output = document.createElement("div");
    output.className = `terminal-output ${type}`;
    output.style.whiteSpace = "pre-wrap";

    if (
      content.includes("██") ||
      content.includes("➤") ||
      content.includes("████")
    ) {
      output.innerHTML = `<div class="ascii-art">${content}</div>`;
    } else {
      output.textContent = content;
    }

    this.terminalContent.insertBefore(output, this.currentInputContainer);
    this.scrollToBottom();
  }

  clearInput() {
    if (this.currentInput) {
      this.currentInput.value = "";
    }
  }

  createNewPrompt() {
    const newInputContainer = document.createElement("div");
    newInputContainer.className = "terminal-input-container";
    newInputContainer.id = "currentInput";
    newInputContainer.innerHTML = `
              <span class="terminal-prompt">CR0M80@portfolio:~$</span>
              <input type="text" class="terminal-input" autocomplete="off" spellcheck="false">
              <span class="terminal-cursor"></span>
            `;

    this.terminalContent.replaceChild(
      newInputContainer,
      this.currentInputContainer
    );
    this.currentInputContainer = newInputContainer;
    this.currentInput = newInputContainer.querySelector(".terminal-input");

    // Reattach event listeners
    if (this.currentInput) {
      this.currentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autoComplete();
        }
      });
    }

    this.focusInput();
    this.scrollToBottom();
  }

  focusInput() {
    if (this.currentInput) {
      this.currentInput.focus();
    }
  }

  scrollToBottom() {
    this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
  }
}

// GUI initialization
function initGUI() {
  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks) {
        navLinks.classList.remove("active");
        if (hamburger) {
          hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });

  // Switch to terminal from GUI
  const switchToTerminalBtn = document.getElementById("switchToTerminal");
  if (switchToTerminalBtn) {
    switchToTerminalBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      await showCommonLoader();

      document.getElementById("guiInterface").style.display = "none";
      document.getElementById("terminalInterface").style.display = "flex";

      if (!window.terminal) {
        window.terminal = new TerminalPortfolio();
      }
      window.terminal.focusInput();
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        if (navLinks && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          if (hamburger) {
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
          }
        }
      }
    });
  });

  // Animate skill bars
  function animateSkillBars() {
    const skillLevels = document.querySelectorAll(".skill-level");
    skillLevels.forEach((skill) => {
      const level = skill.getAttribute("data-level");
      skill.style.width = level + "%";
    });
  }

  // Typing animation
  function initTypingAnimation() {
  const textElement = document.getElementById("typed-text");
  if (!textElement) return;

  const texts = [
    "Cybersecurity Engineering",
    "Digital Forensics Player",
    "Captain & Member of team 5T4F1T"
  ];
  
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let pauseAfterAll = 5000; // 5 secondes après que toutes les phrases sont écrites

  function type() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      textElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      textElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
      // Passe à la phrase suivante ou pause si dernière phrase
      if (textIndex < texts.length - 1) {
        textIndex++;
        charIndex = 0;
        typingSpeed = 900; // court délai avant la prochaine phrase
      } else {
        // Dernière phrase affichée : pause de 5 secondes avant suppression
        isDeleting = true;
        typingSpeed = pauseAfterAll;
      }
    } else if (isDeleting && charIndex === 0) {
      // Reset pour recommencer
      isDeleting = false;
      textIndex = 0;
      typingSpeed = 700;
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1000);
}
  // Initialize animations
  function initAnimations() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
      });
    }

    animateSkillBars();
    initTypingAnimation();
    window.addEventListener("scroll", highlightNavSection);
    highlightNavSection();
  }

  // Highlight current section in navigation
  function highlightNavSection() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    let currentSection = "";
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  // Initialize EmailJS
  (function () {
    emailjs.init("vKxbPXfw618L4ocmy"); // ✅ Replace with your EmailJS public key
  })();

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector(".submit-btn");
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      // 1️⃣ Send notification email (to you)
      emailjs.sendForm("service_va4luii", "template_6c967hv", this)
        .then(() => {
          // 2️⃣ Send auto-reply email (to user)
          return emailjs.sendForm("service_va4luii", "template_08nbffa", this);
        })
        .then(() => {
          alert("✅ Message sent successfully! An auto-reply has been sent to your inbox.");
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        })
        .catch((error) => {
          alert("❌ Failed to send message. Please try again later.");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  initAnimations();
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  initMatrix();

  // View selection event listeners
  const terminalOption = document.getElementById("terminalOption");
  const guiOption = document.getElementById("guiOption");

  if (terminalOption) {
    terminalOption.addEventListener("click", async function () {
      document.getElementById("viewSelector").style.display = "none";

      await showCommonLoader();

      document.getElementById("terminalInterface").style.display = "flex";
      if (!window.terminal) {
        window.terminal = new TerminalPortfolio();
      }
      window.terminal.focusInput();
    });
  }

  if (guiOption) {
    guiOption.addEventListener("click", async function () {
      document.getElementById("viewSelector").style.display = "none";

      await showCommonLoader();

      document.getElementById("guiInterface").style.display = "block";
      initGUI();
    });
  }
});

