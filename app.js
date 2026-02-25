// RSVP App - Iftar 2026
// Uses Supabase for backend storage

// ============================================
// CONFIGURATION - Update with your Supabase credentials
// ============================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// For demo/testing without Supabase, set this to true
const USE_LOCAL_STORAGE = true;

// ============================================
// Initialize
// ============================================
let supabase = null;

if (!USE_LOCAL_STORAGE && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    // Load Supabase client dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        loadGuests();
    };
    document.head.appendChild(script);
} else {
    // Use localStorage for demo
    document.addEventListener('DOMContentLoaded', loadGuests);
}

// ============================================
// DOM Elements
// ============================================
const form = document.getElementById('rsvp-form');
const nameInput = document.getElementById('name');
const attendingInput = document.getElementById('attending');
const submitBtn = document.querySelector('.submit-btn');
const successMessage = document.getElementById('success');
const guestsContainer = document.getElementById('guests');
const guestCount = document.getElementById('guest-count');
const attendanceBtns = document.querySelectorAll('.attendance-btn');

// ============================================
// Event Listeners
// ============================================
attendanceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selected from all buttons
        attendanceBtns.forEach(b => b.classList.remove('selected'));
        // Add selected to clicked button
        btn.classList.add('selected');
        // Set hidden input value
        attendingInput.value = btn.dataset.value;
        // Enable submit button
        updateSubmitButton();
    });
});

nameInput.addEventListener('input', updateSubmitButton);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const attending = attendingInput.value === 'yes';
    
    if (!name || !attendingInput.value) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        await saveRSVP(name, attending);
        
        // Show success message
        form.style.display = 'none';
        successMessage.classList.add('show');
        
        // Update guest list
        loadGuests();
    } catch (error) {
        console.error('Error saving RSVP:', error);
        alert('Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit RSVP';
    }
});

// ============================================
// Helper Functions
// ============================================
function updateSubmitButton() {
    const hasName = nameInput.value.trim().length > 0;
    const hasAttendance = attendingInput.value !== '';
    submitBtn.disabled = !(hasName && hasAttendance);
}

// ============================================
// Data Functions
// ============================================
async function saveRSVP(name, attending) {
    if (USE_LOCAL_STORAGE || !supabase) {
        // Use localStorage
        const guests = JSON.parse(localStorage.getItem('iftar_guests') || '[]');
        guests.push({
            id: Date.now(),
            name,
            attending,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('iftar_guests', JSON.stringify(guests));
        return;
    }
    
    // Use Supabase
    const { error } = await supabase
        .from('rsvps')
        .insert([{ name, attending }]);
    
    if (error) throw error;
}

async function loadGuests() {
    let guests = [];
    
    if (USE_LOCAL_STORAGE || !supabase) {
        // Use localStorage
        guests = JSON.parse(localStorage.getItem('iftar_guests') || '[]');
    } else {
        // Use Supabase
        const { data, error } = await supabase
            .from('rsvps')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Error loading guests:', error);
            return;
        }
        guests = data || [];
    }
    
    renderGuests(guests);
}

function renderGuests(guests) {
    if (guests.length === 0) {
        guestsContainer.innerHTML = '<span class="no-guests">No responses yet</span>';
        guestCount.textContent = '0 coming';
        return;
    }
    
    const coming = guests.filter(g => g.attending);
    const notComing = guests.filter(g => !g.attending);
    
    guestCount.textContent = `${coming.length} coming`;
    
    let html = '';
    
    // Show those coming first
    coming.forEach(guest => {
        html += `<span class="guest-chip coming">✓ ${escapeHtml(guest.name)}</span>`;
    });
    
    // Then those not coming
    notComing.forEach(guest => {
        html += `<span class="guest-chip not-coming">${escapeHtml(guest.name)}</span>`;
    });
    
    guestsContainer.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
