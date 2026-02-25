// RSVP App - Iftar 2026
// Uses Supabase for backend storage

// ============================================
// SUPABASE CONFIG - Update these!
// ============================================
const SUPABASE_URL = 'https://modyrxaskcdrnojgqpcq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZHlyeGFza2Nkcm5vamdxcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDQ1NzAsImV4cCI6MjA4NzYyMDU3MH0.WZMt3OvzcrYloNop6OA1zG4S6zGjrEOBVVSqybXhUPU';

// ============================================
// Initialize Supabase
// ============================================
let supabase = null;
let dbReady = false;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'https://your-project.supabase.co') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        dbReady = true;
        console.log('Supabase connected!');
        loadGuests();
    } else if (SUPABASE_URL === 'https://your-project.supabase.co') {
        console.warn('Supabase not configured - using localStorage fallback');
        dbReady = false;
        loadGuests();
    }
}

// Wait for Supabase SDK to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
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
if (attendanceBtns) {
    attendanceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            attendanceBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            attendingInput.value = btn.dataset.value;
            updateSubmitButton();
        });
    });
}

if (nameInput) {
    nameInput.addEventListener('input', updateSubmitButton);
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const attending = attendingInput.value === 'yes';
        
        if (!name || !attendingInput.value) return;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            await saveRSVP(name, attending);
            form.style.display = 'none';
            successMessage.classList.add('show');
            if (!attending) {
                successMessage.querySelector('.success-subtext').textContent = 'Maybe next time insha\'Allah 🤲';
            }
            loadGuests();
        } catch (error) {
            console.error('Error saving RSVP:', error);
            alert('Something went wrong. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    });
}

// ============================================
// Helper Functions
// ============================================
function updateSubmitButton() {
    if (!submitBtn) return;
    const hasName = nameInput.value.trim().length > 0;
    const hasAttendance = attendingInput.value !== '';
    submitBtn.disabled = !(hasName && hasAttendance);
}

// ============================================
// Data Functions
// ============================================
async function saveRSVP(name, attending) {
    if (dbReady && supabase) {
        const { error } = await supabase
            .from('rsvps')
            .insert([{ name, attending }]);
        
        if (error) throw error;
    } else {
        // Fallback to localStorage
        const guests = JSON.parse(localStorage.getItem('iftar_guests') || '[]');
        guests.push({
            id: Date.now(),
            name,
            attending,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('iftar_guests', JSON.stringify(guests));
    }
}

async function loadGuests() {
    let guests = [];
    
    if (dbReady && supabase) {
        const { data, error } = await supabase
            .from('rsvps')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Error loading guests:', error);
            return;
        }
        guests = data || [];
    } else {
        guests = JSON.parse(localStorage.getItem('iftar_guests') || '[]');
    }
    
    renderGuests(guests);
}

function renderGuests(guests) {
    if (!guestsContainer) return;
    
    if (guests.length === 0) {
        guestsContainer.innerHTML = '<span class="no-guests">No responses yet</span>';
        if (guestCount) guestCount.textContent = '0 coming';
        return;
    }
    
    const coming = guests.filter(g => g.attending);
    const notComing = guests.filter(g => !g.attending);
    
    if (guestCount) guestCount.textContent = `${coming.length} coming`;
    
    let html = '';
    coming.forEach(guest => {
        html += `<span class="guest-chip coming">✓ ${escapeHtml(guest.name)}</span>`;
    });
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

// Export for admin page
window.loadGuests = loadGuests;
window.supabaseClient = () => supabase;
window.isDbReady = () => dbReady;
