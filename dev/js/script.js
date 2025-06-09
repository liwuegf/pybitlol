// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to elements
    const elementsToAnimate = document.querySelectorAll('.skill-category, .project-card, .contact-item, .stat');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Animate skill bars when they come into view
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
});

// Typing animation for hero code block
const codeLines = document.querySelectorAll('.code-line');
if (codeLines.length > 0) {
    codeLines.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.5}s`;
    });
}

// Form submission handler
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simple form validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ff4444';
            } else {
                input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
        
        if (isValid) {
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.style.background = '#666';
            
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = 'linear-gradient(135deg, #00d4ff, #00ff88)';
                    contactForm.reset();
                }, 2000);
            }, 1500);
        }
    });
}

// Parallax effect for floating shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.shape');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = scrolled * speed;
        element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Add hover effects to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Add particle effect to hero section
function createParticles() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 212, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation
        particle.style.animation = `particle-float ${3 + Math.random() * 4}s linear infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        hero.appendChild(particle);
    }
}

// Add particle animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes particle-float {
        0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(${Math.random() * 40 - 20}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize particles
document.addEventListener('DOMContentLoaded', createParticles);

// Add glitch effect to logo on hover
const logo = document.querySelector('.logo-text');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.animation = 'glitch 0.3s ease-in-out';
    });
    
    logo.addEventListener('animationend', () => {
        logo.style.animation = '';
    });
}

// Add glitch animation
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }
`;
document.head.appendChild(glitchStyle);