import { database, ref, push, set, get } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Get tournament ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tournamentId = urlParams.get('tournament');
  
  if (!tournamentId) {
    alert('Invalid tournament link');
    window.location.href = 'tournaments.html';
    return;
  }

  // Load tournament data
  const tournament = await getTournament(tournamentId);
  if (!tournament) return;

  // Setup form based on tournament type
  setupForm(tournament);

  // Handle form submission
  document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitRegistration(tournamentId, tournament.type);
  });
});

async function getTournament(tournamentId) {
  try {
    const snapshot = await get(ref(database, `tournaments/${tournamentId}`));
    if (!snapshot.exists()) {
      alert('Tournament not found!');
      window.location.href = 'tournaments.html';
      return null;
    }
    return snapshot.val();
  } catch (error) {
    console.error("Error loading tournament:", error);
    alert('Error loading tournament data');
    return null;
  }
}

function setupForm(tournament) {
  // Display tournament info
  document.getElementById('tournament-info').innerHTML = `
    <h2>${tournament.name}</h2>
    <p><strong>Type:</strong> ${tournament.type.toUpperCase()} 
    | <strong>Date:</strong> ${new Date(tournament.startDate).toLocaleDateString()}
    | <strong>Prize:</strong> $${tournament.prizePool || 0}</p>
  `;

  // Set form type
  const formType = tournament.type === 'solo' ? 'individual' : 
                 tournament.type === 'duo' ? 'duo' : 'team';
  document.getElementById('reg-type').value = formType;

  // Show correct form section
  document.querySelectorAll('.reg-section').forEach(el => el.style.display = 'none');
  document.getElementById(`${formType}-fields`).style.display = 'block';
}

async function submitRegistration(tournamentId, tournamentType) {
  try {
    // Validate form
    if (!validateForm(tournamentType)) return;

    // Prepare registration data
    const registration = {
      timestamp: new Date().toISOString(),
      tournamentId: tournamentId,
      ...collectFormData()
    };

    // Save to database
    await saveRegistration(tournamentId, registration);
    
    // Update participant count
    await updateParticipantCount(tournamentId);
    
    alert('Registration successful!');
    window.location.href = 'tournaments.html';

  } catch (error) {
    console.error("Registration error:", error);
    alert(`Registration failed: ${error.message}`);
  }
}

function validateForm(tournamentType) {
  // Check required fields
  const requiredFields = {
    individual: ['player-name', 'player-ign', 'player-id'],
    duo: ['player1-name', 'player1-ign', 'player1-id', 'player2-name', 'player2-ign', 'player2-id'],
    team: ['leader-name', 'leader-ign', 'leader-id']
  };

  for (const field of requiredFields[tournamentType]) {
    if (!document.getElementById(field)?.value) {
      alert(`Please fill all required fields`);
      return false;
    }
  }

  if (!document.getElementById('terms').checked) {
    alert('You must agree to the terms');
    return false;
  }

  return true;
}

function collectFormData() {
  const data = {};
  const form = document.getElementById('regForm');
  new FormData(form).forEach((value, key) => {
    if (value) data[key] = value;
  });
  return data;
}

async function saveRegistration(tournamentId, data) {
  const newRegRef = push(ref(database, `registrations/${tournamentId}`));
  await set(newRegRef, data);
}

async function updateParticipantCount(tournamentId) {
  const countRef = ref(database, `tournaments/${tournamentId}/participants`);
  const current = (await get(countRef)).val() || 0;
  await set(countRef, current + 1);
}
