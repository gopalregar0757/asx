import { 
    auth, database, storage, 
    signOut, ref, onValue, remove, set,
    storageRef, uploadBytes, getDownloadURL 
} from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registrationsBody = document.getElementById('registrations-body');
    const totalReg = document.getElementById('total-reg');
    const individualReg = document.getElementById('individual-reg');
    const teamReg = document.getElementById('team-reg');
    const duoReg = document.getElementById('duo-reg');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterType = document.getElementById('filter-type');
    const filterTournament = document.getElementById('filter-tournament');
    const exportBtn = document.getElementById('export-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const logoutBtn = document.getElementById('logout');
    const viewModal = document.getElementById('view-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalData = document.getElementById('modal-data');
    
    // Pagination variables
    let currentPage = 1;
    const registrationsPerPage = 10;
    let filteredRegistrations = [];
    let tournaments = [];
    let allRegistrations = [];
    
    // Check admin authentication
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            loadData();
        }
    });

    // Load tournaments and registrations
    function loadData() {
        // Load tournaments
        const tournamentsRef = ref(database, 'tournaments');
        onValue(tournamentsRef, (snapshot) => {
            tournaments = [];
            snapshot.forEach((childSnapshot) => {
                const tournament = childSnapshot.val();
                tournament.id = childSnapshot.key;
                tournaments.push(tournament);
            });
            
            updateTournamentFilter();
        });
        
        // Load all registrations
        const registrationsRef = ref(database, 'registrations');
        onValue(registrationsRef, (snapshot) => {
            allRegistrations = [];
            snapshot.forEach((tournamentSnapshot) => {
                tournamentSnapshot.forEach((registrationSnapshot) => {
                    const registration = registrationSnapshot.val();
                    registration.id = registrationSnapshot.key;
                    registration.tournamentId = tournamentSnapshot.key;
                    allRegistrations.push(registration);
                });
            });
            
            renderRegistrations(allRegistrations);
            updateStats();
        });
    }
    
    // Update tournament filter dropdown
    function updateTournamentFilter() {
        filterTournament.innerHTML = '<option value="all">All Tournaments</option>';
        
        tournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament.id;
            option.textContent = tournament.name;
            filterTournament.appendChild(option);
        });
    }
    
    // Apply filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const typeFilter = filterType.value;
        const tournamentFilter = filterTournament.value;
        
        filteredRegistrations = allRegistrations.filter(reg => {
            // Tournament filter
            if (tournamentFilter !== 'all' && reg.tournamentId !== tournamentFilter) {
                return false;
            }
            
            // Type filter
            if (typeFilter !== 'all' && reg['reg-type'] !== typeFilter) {
                return false;
            }
            
            // Search filter
            if (searchTerm) {
                const searchFields = [
                    reg['player-name'],
                    reg['team-name'],
                    reg['duo-name'],
                    reg['player-ign'],
                    reg['leader-ign'],
                    reg['player1-ign'],
                    reg['player2-ign']
                ].filter(Boolean).join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Reset to first page when filters change
        currentPage = 1;
        renderRegistrations(filteredRegistrations);
        updateStats();
    }
    
    // Update statistics
    function updateStats() {
        totalReg.textContent = allRegistrations.length;
        individualReg.textContent = allRegistrations.filter(r => r['reg-type'] === 'individual').length;
        teamReg.textContent = allRegistrations.filter(r => r['reg-type'] === 'team').length;
        duoReg.textContent = allRegistrations.filter(r => r['reg-type'] === 'duo').length;
    }
    
    // Render registrations table
    function renderRegistrations(registrations) {
        const startIndex = (currentPage - 1) * registrationsPerPage;
        const endIndex = startIndex + registrationsPerPage;
        const paginatedRegs = registrations.slice(startIndex, endIndex);
        
        registrationsBody.innerHTML = '';
        
        if (paginatedRegs.length === 0) {
            registrationsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No registrations found</td></tr>';
        } else {
            paginatedRegs.forEach((reg, index) => {
                const tournament = tournaments.find(t => t.id === reg.tournamentId) || {};
                const row = document.createElement('tr');
                
                // Determine name/team to display
                let displayName = '';
                if (reg['reg-type'] === 'individual') {
                    displayName = reg['player-name'];
                } else if (reg['reg-type'] === 'team') {
                    displayName = reg['team-name'] || `Team ${startIndex + index + 1}`;
                } else if (reg['reg-type'] === 'duo') {
                    displayName = reg['duo-name'] || `Duo ${startIndex + index + 1}`;
                }
                
                // Determine IGN to display
                let displayIGN = '';
                if (reg['reg-type'] === 'individual') {
                    displayIGN = reg['player-ign'];
                } else if (reg['reg-type'] === 'team') {
                    displayIGN = reg['leader-ign'];
                } else if (reg['reg-type'] === 'duo') {
                    displayIGN = `${reg['player1-ign']} & ${reg['player2-ign']}`;
                }
                
                // Format date
                const regDate = new Date(reg.timestamp);
                const formattedDate = regDate.toLocaleDateString() + ' ' + regDate.toLocaleTimeString();
                
                row.innerHTML = `
                    <td>${startIndex + index + 1}</td>
                    <td>${reg['reg-type'].charAt(0).toUpperCase() + reg['reg-type'].slice(1)}</td>
                    <td>${displayName}</td>
                    <td>${displayIGN}</td>
                    <td>${tournament.name || 'Unknown'}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${reg.id}" data-tournament="${reg.tournamentId}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn delete-btn" data-id="${reg.id}" data-tournament="${reg.tournamentId}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                registrationsBody.appendChild(row);
            });
        }
        
        updatePaginationControls();
    }
    
    // Update pagination controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredRegistrations.length / registrationsPerPage);
        
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // View registration details
    function viewRegistration(registrationId, tournamentId) {
        const registration = allRegistrations.find(
            reg => reg.id === registrationId && reg.tournamentId === tournamentId
        );
        
        if (!registration) return;
        
        const tournament = tournaments.find(t => t.id === tournamentId) || {};
        
        modalTitle.textContent = `Registration Details (${registration['reg-type'].charAt(0).toUpperCase() + registration['reg-type'].slice(1)})`;
        modalData.innerHTML = '';
        
        // Create modal content based on registration type
        let modalContent = `
            <div class="modal-field">
                <label>Tournament:</label>
                <span>${tournament.name || 'Unknown'}</span>
            </div>
            <div class="modal-field">
                <label>Registration Type:</label>
                <span>${registration['reg-type'].charAt(0).toUpperCase() + registration['reg-type'].slice(1)}</span>
            </div>
            <div class="modal-field">
                <label>Registered At:</label>
                <span>${new Date(registration.timestamp).toLocaleString()}</span>
            </div>
        `;
        
        if (registration['reg-type'] === 'individual') {
            modalContent += `
                <h3>Player Information</h3>
                <div class="modal-field">
                    <label>Name:</label>
                    <span>${registration['player-name']}</span>
                </div>
                <div class="modal-field">
                    <label>IGN:</label>
                    <span>${registration['player-ign']}</span>
                </div>
                <div class="modal-field">
                    <label>UID:</label>
                    <span>${registration['player-id']}</span>
                </div>
                <div class="modal-field">
                    <label>Email:</label>
                    <span>${registration['player-email']}</span>
                </div>
                <div class="modal-field">
                    <label>Phone:</label>
                    <span>${registration['player-phone']}</span>
                </div>
            `;
        } else if (registration['reg-type'] === 'team') {
            modalContent += `
                <h3>Team Information</h3>
                <div class="modal-field">
                    <label>Team Name:</label>
                    <span>${registration['team-name'] || 'Not specified'}</span>
                </div>
                
                <h4>Team Leader</h4>
                <div class="modal-field">
                    <label>Name:</label>
                    <span>${registration['leader-name']}</span>
                </div>
                <div class="modal-field">
                    <label>IGN:</label>
                    <span>${registration['leader-ign']}</span>
                </div>
                <div class="modal-field">
                    <label>UID:</label>
                    <span>${registration['leader-id']}</span>
                </div>
                <div class="modal-field">
                    <label>Email:</label>
                    <span>${registration['leader-email']}</span>
                </div>
                <div class="modal-field">
                    <label>Phone:</label>
                    <span>${registration['leader-phone']}</span>
                </div>
            `;
            
            if (registration.teamMembers && registration.teamMembers.length > 0) {
                modalContent += `<h3>Team Members</h3>`;
                registration.teamMembers.forEach((member, index) => {
                    modalContent += `
                        <h4>Member ${index + 1}</h4>
                        <div class="modal-field">
                            <label>Name:</label>
                            <span>${member.name}</span>
                        </div>
                        <div class="modal-field">
                            <label>IGN:</label>
                            <span>${member.ign}</span>
                        </div>
                        <div class="modal-field">
                            <label>UID:</label>
                            <span>${member.uid}</span>
                        </div>
                    `;
                });
            }
        } else if (registration['reg-type'] === 'duo') {
            modalContent += `
                <h3>Duo Information</h3>
                <div class="modal-field">
                    <label>Duo Name:</label>
                    <span>${registration['duo-name'] || 'Not specified'}</span>
                </div>
                
                <h4>Player 1</h4>
                <div class="modal-field">
                    <label>Name:</label>
                    <span>${registration['player1-name']}</span>
                </div>
                <div class="modal-field">
                    <label>IGN:</label>
                    <span>${registration['player1-ign']}</span>
                </div>
                <div class="modal-field">
                    <label>UID:</label>
                    <span>${registration['player1-id']}</span>
                </div>
                
                <h4>Player 2</h4>
                <div class="modal-field">
                    <label>Name:</label>
                    <span>${registration['player2-name']}</span>
                </div>
                <div class="modal-field">
                    <label>IGN:</label>
                    <span>${registration['player2-ign']}</span>
                </div>
                <div class="modal-field">
                    <label>UID:</label>
                    <span>${registration['player2-id']}</span>
                </div>
                
                <div class="modal-field">
                    <label>Contact Email:</label>
                    <span>${registration['duo-email']}</span>
                </div>
                <div class="modal-field">
                    <label>Contact Phone:</label>
                    <span>${registration['duo-phone']}</span>
                </div>
            `;
        }
        
        modalData.innerHTML = modalContent;
        viewModal.style.display = 'block';
    }
    
    // Delete registration
    function deleteRegistration(registrationId, tournamentId) {
        if (!confirm('Are you sure you want to delete this registration?')) return;
        
        const registrationRef = ref(database, `registrations/${tournamentId}/${registrationId}`);
        remove(registrationRef)
            .then(() => {
                // Update participant count in tournament
                const tournamentRef = ref(database, `tournaments/${tournamentId}`);
                onValue(tournamentRef, (snapshot) => {
                    const tournament = snapshot.val();
                    const newCount = Math.max((tournament.participants || 0) - 1, 0);
                    set(ref(database, `tournaments/${tournamentId}/participants`), newCount);
                }, { onlyOnce: true });
                
                alert('Registration deleted successfully');
            })
            .catch(error => {
                console.error('Error deleting registration:', error);
                alert('Error deleting registration. Please try again.');
            });
    }
    
    // Export data to CSV
    function exportData() {
        if (filteredRegistrations.length === 0) {
            alert('No data to export');
            return;
        }
        
        // Convert to CSV
        let csv = 'ID,Registration Type,Name,IGN,UID,Email,Phone,Tournament,Date\n';
        
        filteredRegistrations.forEach(reg => {
            const tournament = tournaments.find(t => t.id === reg.tournamentId) || {};
            
            if (reg['reg-type'] === 'individual') {
                csv += `"${reg.id}",Individual,"${reg['player-name']}","${reg['player-ign']}","${reg['player-id']}","${reg['player-email']}","${reg['player-phone']}","${tournament.name || 'Unknown'}","${reg.timestamp}"\n`;
            } else if (reg['reg-type'] === 'team') {
                csv += `"${reg.id}",Team,"${reg['team-name'] || ''}","${reg['leader-ign']}","${reg['leader-id']}","${reg['leader-email']}","${reg['leader-phone']}","${tournament.name || 'Unknown'}","${reg.timestamp}"\n`;
            } else if (reg['reg-type'] === 'duo') {
                csv += `"${reg.id}",Duo,"${reg['duo-name'] || ''}","${reg['player1-ign']} & ${reg['player2-ign']}","${reg['player1-id']} & ${reg['player2-id']}","${reg['duo-email']}","${reg['duo-phone']}","${tournament.name || 'Unknown'}","${reg.timestamp}"\n`;
            }
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `nexus_registrations_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // Event listeners
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && applyFilters());
    filterType.addEventListener('change', applyFilters);
    filterTournament.addEventListener('change', applyFilters);
    exportBtn.addEventListener('click', exportData);
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderRegistrations(filteredRegistrations);
        }
    });
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredRegistrations.length / registrationsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderRegistrations(filteredRegistrations);
        }
    });
    
    registrationsBody.addEventListener('click', (e) => {
        if (e.target.closest('.view-btn')) {
            const btn = e.target.closest('.view-btn');
            viewRegistration(btn.dataset.id, btn.dataset.tournament);
        }
        
        if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            deleteRegistration(btn.dataset.id, btn.dataset.tournament);
        }
    });
    
    closeModal.addEventListener('click', () => viewModal.style.display = 'none');
    window.addEventListener('click', (e) => e.target === viewModal && (viewModal.style.display = 'none'));
    logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = 'index.html'));
    
    // Initial load
    applyFilters();
});