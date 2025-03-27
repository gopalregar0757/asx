import { database, ref, push, set, get, onValue } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get tournament ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('tournament');

    if (!tournamentId) {
        alert('No tournament specified! Please register from the tournaments page.');
        window.location.href = 'tournaments.html';
        return;
    }

    // Load tournament data
    const tournamentRef = ref(database, `tournaments/${tournamentId}`);
    onValue(tournamentRef, (snapshot) => {
        const tournament = snapshot.val();
        if (!tournament) {
            alert('Tournament not found!');
            window.location.href = 'tournaments.html';
            return;
        }

        // Display tournament info
        document.getElementById('tournament-info').innerHTML = `
            <h2>Registering for: ${tournament.name}</h2>
            <p><strong>Type:</strong> ${tournament.type.toUpperCase()} | 
            <strong>Date:</strong> ${new Date(tournament.startDate).toLocaleDateString()} | 
            <strong>Prize:</strong> $${tournament.prizePool || 0}</p>
            <hr>
        `;

        // Set form type based on tournament
        const regType = tournament.type === 'solo' ? 'individual' : 
                       tournament.type === 'duo' ? 'duo' : 'team';
        document.getElementById('reg-type').value = regType;

        // Show correct form section
        document.querySelectorAll('.reg-section').forEach(el => el.style.display = 'none');
        document.getElementById(`${regType}-fields`).style.display = 'block';
    });

    // Team member management
    let memberCount = 0;
    document.getElementById('add-member')?.addEventListener('click', function() {
        const maxMembers = 3; // 1 leader + 3 members = 4 total for squad
        if (memberCount >= maxMembers) {
            alert('Maximum team members reached!');
            return;
        }
        
        memberCount++;
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        memberDiv.innerHTML = `
            <h4>Member ${memberCount}</h4>
            <div class="form-group">
                <input type="text" placeholder="Member Name" name="member${memberCount}-name" required>
            </div>
            <div class="form-group">
                <input type="text" placeholder="IGN" name="member${memberCount}-ign" required>
            </div>
            <div class="form-group">
                <input type="text" placeholder="UID" name="member${memberCount}-id" required>
            </div>
            <hr>
        `;
        document.getElementById('team-members').appendChild(memberDiv);
    });

    // Form submission
    document.getElementById('regForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Basic validation
            if (!document.getElementById('terms').checked) {
                throw new Error('You must agree to the terms');
            }

            // Prepare registration data
            const formData = new FormData(e.target);
            const registration = {
                timestamp: new Date().toISOString(),
                tournamentId: tournamentId
            };

            // Process form data
            for (const [key, value] of formData.entries()) {
                if (value) registration[key] = value;
            }

            // Save to Firebase
            const newRegRef = push(ref(database, `registrations/${tournamentId}`));
            await set(newRegRef, registration);
            
            // Update participant count
            const tournamentRef = ref(database, `tournaments/${tournamentId}/participants`);
            const currentCount = (await get(tournamentRef)).val() || 0;
            await set(tournamentRef, currentCount + 1);

            alert('Registration successful!');
            window.location.href = 'tournaments.html';
            
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        }
    });
});