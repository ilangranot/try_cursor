// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe about section
const aboutText = document.querySelector('.about-text');
const aboutVisual = document.querySelector('.about-visual');

if (aboutText) {
    aboutText.style.opacity = '0';
    aboutText.style.transform = 'translateX(-30px)';
    aboutText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(aboutText);
}

if (aboutVisual) {
    aboutVisual.style.opacity = '0';
    aboutVisual.style.transform = 'translateX(30px)';
    aboutVisual.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(aboutVisual);
}

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (name && email && message) {
            // Show success message (in a real app, you'd send this to a server)
            alert(`Thank you, ${name}! Your message has been received. We'll get back to you soon at ${email}.`);
            
            // Reset form
            contactForm.reset();
        }
    });
}

// Button click animations
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
    }
});

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 100;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// WhatsApp Summaries Functionality
const API_BASE_URL = 'http://localhost:3000/api'; // Change to your server URL in production

async function loadSummaries() {
    const summariesList = document.getElementById('summariesList');
    const noSummaries = document.getElementById('noSummaries');
    const statusEl = document.getElementById('summariesStatus');
    
    try {
        statusEl.textContent = 'Loading summaries...';
        
        // In production, replace with your actual API URL
        const response = await fetch(`${API_BASE_URL}/summaries`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch summaries');
        }
        
        const summaries = await response.json();
        
        if (summaries.length === 0) {
            summariesList.style.display = 'none';
            noSummaries.style.display = 'block';
            statusEl.textContent = 'No summaries found';
        } else {
            summariesList.style.display = 'grid';
            noSummaries.style.display = 'none';
            statusEl.textContent = `${summaries.length} summary${summaries.length !== 1 ? 'ies' : ''} found`;
            
            summariesList.innerHTML = summaries.map(summary => `
                <div class="summary-card">
                    <div class="summary-header">
                        <div class="summary-contact">
                            <span class="summary-icon">💬</span>
                            <div>
                                <h4>${escapeHtml(summary.contactName)}</h4>
                                <p class="summary-meta">${formatDate(summary.createdAt)} • ${summary.messageCount} messages</p>
                            </div>
                        </div>
                    </div>
                    <div class="summary-content">
                        <p>${escapeHtml(summary.summary.substring(0, 200))}${summary.summary.length > 200 ? '...' : ''}</p>
                    </div>
                    <div class="summary-actions">
                        <a href="${API_BASE_URL}/summaries/${summary.id}/download" class="btn btn-primary btn-sm" download>
                            <span>⬇️</span> Download
                        </a>
                        <button class="btn btn-secondary btn-sm" onclick="viewSummary('${summary.id}')">
                            <span>👁️</span> View Full
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading summaries:', error);
        statusEl.textContent = 'Unable to connect to server. Make sure the bot is running.';
        summariesList.style.display = 'none';
        noSummaries.style.display = 'block';
        noSummaries.innerHTML = `
            <p>⚠️ Cannot connect to the bot server.</p>
            <p>Make sure the WhatsApp bot is running on port 3000.</p>
            <p>See setup instructions below.</p>
        `;
    }
}

async function viewSummary(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/summaries/${id}`);
        const summary = await response.json();
        
        // Create modal to display full summary
        const modal = document.createElement('div');
        modal.className = 'summary-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${escapeHtml(summary.contactName)}</h3>
                    <button class="modal-close" onclick="this.closest('.summary-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="modal-meta">
                        <p><strong>Date:</strong> ${formatDate(summary.createdAt)}</p>
                        <p><strong>Messages:</strong> ${summary.messageCount}</p>
                        <p><strong>Phone:</strong> ${escapeHtml(summary.phoneNumber)}</p>
                    </div>
                    <div class="modal-summary">
                        <h4>Summary:</h4>
                        <p>${escapeHtml(summary.summary)}</p>
                    </div>
                    <div class="modal-actions">
                        <a href="${API_BASE_URL}/summaries/${summary.id}/download" class="btn btn-primary" download>
                            <span>⬇️</span> Download as Text File
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error loading summary:', error);
        alert('Failed to load summary details.');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize summaries when page loads
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshSummaries');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadSummaries);
        loadSummaries();
    }
});
