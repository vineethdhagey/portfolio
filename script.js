const cursor = document.getElementById("custom-cursor");

console.log(cursor);
window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX - 250 + "px";
  cursor.style.top = e.clientY - 250 + "px";
});

// Navbar scroll effects
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    // Hide scroll indicator after scrolling
    if (!scrolled) {
        const indicator = document.querySelector('.scroll-indicator');
        indicator.style.opacity = '0';
        scrolled = true;
    }
});

// Navigation links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        // Close mobile menu if open (only on mobile)
        if (window.innerWidth <= 768) {
            const mobileMenu = document.querySelector('.nav-menu');
            mobileMenu.classList.remove('active');
        }
    });
});

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.querySelector('.nav-menu');
hamburger.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
});

// Back to top functionality
document.getElementById('backToTop').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Toggle card content with smooth animation (improved with exact height calc)
const educationCard = document.getElementById('educationCard');
const skillsCard = document.getElementById('skillsCard');
const projectsCard = document.getElementById('projectsCard');
const contactCard = document.getElementById('contactCard'); // Now toggleable for consistency
const resumeCard = document.getElementById('resumeCard');

function toggleCard(card) {
    const wasActive = card.classList.contains('active');
    const content = card.querySelector('.card-content');
    
    // Close all other cards
    document.querySelectorAll('.card').forEach(c => {
        if (c !== card) {
            c.classList.remove('active');
            const otherContent = c.querySelector('.card-content');
            if (otherContent) otherContent.style.height = '0';
        }
    });
    
    // Toggle current card
    if (!wasActive) {
        card.classList.add('active');
        if (content) {
            // Calculate exact height for smooth, reflow-free expansion
            content.style.height = content.scrollHeight + 'px';
        }
        // Smooth scroll to card if needed
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        card.classList.remove('active');
        if (content) content.style.height = '0';
    }
}

// Determine if the device supports hover (mouse-like) interactions
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Helper to open a card (closes others)
function openCard(card) {
    const content = card.querySelector('.card-content');
    // Close all other cards
    document.querySelectorAll('.card').forEach(c => {
        if (c !== card) {
            c.classList.remove('active');
            const otherContent = c.querySelector('.card-content');
            if (otherContent) otherContent.style.height = '0';
        }
    });

    if (!card.classList.contains('active')) {
        card.classList.add('active');
        if (content) {
            // Set explicit height for smooth expansion
            content.style.height = content.scrollHeight + 'px';
        }
        // Scroll the opened card into view
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function closeCard(card) {
    const content = card.querySelector('.card-content');
    card.classList.remove('active');
    if (content) content.style.height = '0';
}

// Apply hover interactions for pointer devices; fall back to click for touch
if (supportsHover) {
    // Use mouseenter/mouseleave so moving cursor in/out triggers expansion
    [educationCard, skillsCard, projectsCard, contactCard].forEach(card => {
        if (!card) return;
        card.addEventListener('mouseenter', function (e) {
            openCard(this);
        });
        card.addEventListener('mouseleave', function (e) {
            // Collapse on mouse leave
            closeCard(this);
        });
    });
} else {
    // Touch devices: keep click-to-toggle behavior
    educationCard.addEventListener('click', function() {
        toggleCard(this);
    });

    skillsCard.addEventListener('click', function() {
        toggleCard(this);
    });

    projectsCard.addEventListener('click', function() {
        toggleCard(this);
    });

    contactCard.addEventListener('click', function() {
        toggleCard(this); // Now expandable (though content is static)
    });
}

// Resume card opens link (no expansion)
resumeCard.addEventListener('click', function(e) {
    // Only open resume link if click was not on an anchor inside the card
    const anchor = e.target.closest('a');
    if (anchor) return; // let anchor handle navigation
    e.preventDefault();
    window.open('https://drive.google.com/file/d/11LdYcoT4H0R-OJWcsZ847EAuwmPwPPLU/view?usp=sharing', '_blank', 'noopener');
});

// Make sure anchor clicks inside cards don't bubble to card handlers
document.querySelectorAll('.card a').forEach(a => {
    // ensure external links open in new tab safely
    if (!a.target) a.target = '_blank';
    a.rel = a.rel ? a.rel + ' noopener noreferrer' : 'noopener noreferrer';
    a.addEventListener('click', function(e) {
        e.stopPropagation();
        // allow default behaviour to open the link
    });
});

// Smooth scroll behavior for anchor links
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

// Add subtle parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / 500);
    }
});

let scrolled = false;
