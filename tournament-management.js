import { database, ref, push, set, auth } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
  });

  const form = document.getElementById('createTournamentForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const tournament = {
        name: document.getElementById('tournament-name').value,
        type: document.getElementById('tournament-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        description: document.getElementById('tournament-description').value,
        prizePool: parseFloat(document.getElementById('prize-pool').value) || 0,
        entryFee: parseFloat(document.getElementById('entry-fee').value) || 0,
        maxParticipants: parseInt(document.getElementById('max-teams').value) || 100,
        rules: document.getElementById('tournament-rules').value.split('\n')
          .filter(rule => rule.trim() !== ''),
        maps: document.getElementById('tournament-maps').value.split(',')
          .map(map => map.trim()),
        registrationDeadline: document.getElementById('registration-deadline').value,
        streamLink: document.getElementById('stream-link').value || '',
        imageUrl: document.getElementById('banner-url').value || 
          'https://via.placeholder.com/800x400?text=Tournament+Banner',
        status: 'upcoming',
        participants: 0,
        createdAt: new Date().toISOString()
      };

      // Create new tournament in Firebase
      const newTournamentRef = push(ref(database, 'tournaments'));
      await set(newTournamentRef, tournament);
      
      alert('Tournament created successfully!');
      form.reset();
      
      // Refresh the page to show new tournament
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert(`Error: ${error.message}`);
    }
  });
});