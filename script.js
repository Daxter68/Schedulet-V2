// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initCalendar();
    initMusicPlayer();
    initBackgroundImage();
    initNotifications();
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    
    // Dark mode initialization and event listener
    initDarkMode();
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    initTaskControls();
});

// Task management functions
function addTask() {
    const taskInput = document.getElementById('newTask');
    const descriptionInput = document.getElementById('taskDescription');
    const dateInput = document.getElementById('taskDate');
    const priorityInput = document.getElementById('taskPriority');
    const categoryInput = document.getElementById('taskCategory');
    const reminderInput = document.getElementById('reminderTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const editId = addTaskBtn.dataset.editId;
        
        if (editId) {
            // Editing existing task
            const taskIndex = tasks.findIndex(t => t.id.toString() === editId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title: taskText,
                    description: descriptionInput.value.trim(),
                    date: dateInput.value,
                    priority: priorityInput.value,
                    category: categoryInput.value.trim(),
                    reminderTime: reminderInput.value,
                    notified: false // Reset notification status for edited tasks
                };
            }
            // Reset button
            addTaskBtn.textContent = 'Add Task';
            delete addTaskBtn.dataset.editId;
        } else {
            // Adding new task
            const newTask = {
                id: Date.now(),
                title: taskText,
                description: descriptionInput.value.trim(),
                date: dateInput.value,
                priority: priorityInput.value,
                category: categoryInput.value.trim(),
                completed: false,
                reminderTime: reminderInput.value,
                notified: false
            };
            tasks.push(newTask);
        }
        
        // Save to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update UI
        renderTasks(tasks);
        updateCategoryList();
        
        // Clear inputs
        taskInput.value = '';
        descriptionInput.value = '';
        dateInput.value = '';
        priorityInput.value = 'low';
        categoryInput.value = '';
        reminderInput.value = '';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    renderTasks(tasks);
}

// Add these new functions for dark mode
function initDarkMode() {
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('darkModeToggle').textContent = '☀️';
    }
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const toggle = document.getElementById('darkModeToggle');
    
    if (isDarkMode) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('darkMode', 'false');
        toggle.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
        toggle.textContent = '☀️';
    }
}

// Add these calendar-related functions
let currentDate = new Date();

function initCalendar() {
    updateCalendar();
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
}

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get all tasks
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Clear existing calendar days
    const calendarGrid = document.querySelector('.calendar-grid');
    const weekdayHeaders = document.querySelectorAll('.weekday-header');
    const daysContainer = Array.from(calendarGrid.children)
        .filter(child => !child.classList.contains('weekday-header'));
    daysContainer.forEach(day => day.remove());
    
    // Add empty cells for days before first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of month
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Get tasks for this day
        const currentDate = new Date(year, month, day);
        const dayTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate.getDate() === day && 
                   taskDate.getMonth() === month && 
                   taskDate.getFullYear() === year;
        });
        
        // Add event indicator and tooltip if there are tasks
        if (dayTasks.length > 0) {
            dayElement.classList.add('has-events');
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'calendar-tooltip';
            
            // Add tasks to tooltip
            dayTasks.forEach(task => {
                const taskTime = task.date ? new Date(task.date) : null;
                const eventDiv = document.createElement('div');
                eventDiv.className = 'tooltip-event';
                eventDiv.innerHTML = `
                    <div class="tooltip-event-title">${task.title}</div>
                    ${taskTime ? `
                        <div class="tooltip-event-time">
                            ${taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    ` : ''}
                    ${task.description ? `
                        <div class="tooltip-event-description">${task.description}</div>
                    ` : ''}
                `;
                tooltip.appendChild(eventDiv);
            });
            
            dayElement.appendChild(tooltip);
        }
        
        // Highlight today
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Add click handler
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day.selected')
                .forEach(el => el.classList.remove('selected'));
            dayElement.classList.add('selected');
            
            const selectedDate = new Date(year, month, day);
            const dateInput = document.getElementById('taskDate');
            dateInput.valueAsDate = selectedDate;
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// Update the music player initialization
function initMusicPlayer() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const previousBtn = document.getElementById('previousTrack');
    const nextBtn = document.getElementById('nextTrack');
    const uploadBtn = document.getElementById('uploadMusic');
    const musicInput = document.getElementById('musicInput');
    const volumeSlider = document.getElementById('volumeSlider');
    const muteBtn = document.getElementById('toggleMute');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const repeatBtn = document.getElementById('toggleRepeat');
    const shuffleBtn = document.getElementById('toggleShuffle');
    const clearPlaylistBtn = document.getElementById('clearPlaylist');
    
    let playlist = [];
    let currentTrackIndex = 0;
    let isShuffled = false;
    let repeatMode = 'none'; // none, one, all

    // Load playlist from localStorage
    const savedPlaylist = localStorage.getItem('playlist');
    if (savedPlaylist) {
        playlist = JSON.parse(savedPlaylist);
        updatePlaylistUI();
    }

    // Remove directory-only restriction
    musicInput.removeAttribute('webkitdirectory');
    musicInput.removeAttribute('directory');
    
    // Update file input handler
    musicInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files)
            .filter(file => {
                // Accept common audio formats
                return file.type.startsWith('audio/') || 
                       file.name.endsWith('.mp3') || 
                       file.name.endsWith('.wav') || 
                       file.name.endsWith('.ogg') ||
                       file.name.endsWith('.m4a');
            });
        
        if (files.length > 0) {
            // Add new files to playlist
            const newTracks = files.map(file => ({
                name: file.name,
                url: URL.createObjectURL(file)
            }));
            
            playlist.push(...newTracks);
            updatePlaylistUI();
            savePlaylist();
            
            // If no track is currently playing, start the first new track
            if (!audioPlayer.src) {
                loadTrack(playlist.length - newTracks.length);
            }

            // Show feedback
            alert(`Added ${files.length} track(s) to playlist`);
        } else {
            alert('Please select valid audio files (MP3, WAV, OGG, M4A)');
        }
    });

    // Playback controls
    playPauseBtn.addEventListener('click', togglePlay);
    previousBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Progress bar
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });

    // Volume controls
    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
        updateVolumeIcon();
    });

    muteBtn.addEventListener('click', () => {
        audioPlayer.muted = !audioPlayer.muted;
        updateVolumeIcon();
    });

    // Playlist controls
    repeatBtn.addEventListener('click', () => {
        switch(repeatMode) {
            case 'none':
                repeatMode = 'one';
                repeatBtn.textContent = '🔂';
                break;
            case 'one':
                repeatMode = 'all';
                repeatBtn.textContent = '🔁';
                break;
            default:
                repeatMode = 'none';
                repeatBtn.textContent = '🔁';
        }
    });

    shuffleBtn.addEventListener('click', () => {
        isShuffled = !isShuffled;
        shuffleBtn.style.opacity = isShuffled ? '1' : '0.5';
    });

    clearPlaylistBtn.addEventListener('click', () => {
        if (confirm('Clear playlist?')) {
            playlist = [];
            currentTrackIndex = 0;
            audioPlayer.src = '';
            updatePlaylistUI();
            savePlaylist();
        }
    });

    // Audio player event listeners
    audioPlayer.addEventListener('timeupdate', () => {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('ended', () => {
        if (repeatMode === 'one') {
            audioPlayer.play();
        } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
            playNext();
        }
    });

    // Helper functions
    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.textContent = '⏸️';
        } else {
            audioPlayer.pause();
            playPauseBtn.textContent = '▶️';
        }
    }

    function playPrevious() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    }

    function playNext() {
        if (isShuffled) {
            currentTrackIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack(currentTrackIndex);
    }

    function loadTrack(index) {
        if (playlist[index]) {
            audioPlayer.src = playlist[index].url;
            audioPlayer.play();
            playPauseBtn.textContent = '⏸️';
            playPauseBtn.disabled = false;
            previousBtn.disabled = false;
            nextBtn.disabled = false;
            updatePlaylistUI();
        }
    }

    function updateVolumeIcon() {
        const volume = audioPlayer.volume;
        const isMuted = audioPlayer.muted;
        
        if (isMuted || volume === 0) {
            muteBtn.textContent = '🔇';
        } else if (volume < 0.5) {
            muteBtn.textContent = '🔉';
        } else {
            muteBtn.textContent = '🔊';
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Add playlist toggle functionality
    const playlistSection = document.querySelector('.playlist-section');
    const togglePlaylistBtn = document.createElement('button');
    togglePlaylistBtn.id = 'togglePlaylist';
    togglePlaylistBtn.innerHTML = '📑';
    togglePlaylistBtn.title = 'Toggle Playlist';
    document.querySelector('.music-controls').appendChild(togglePlaylistBtn);

    togglePlaylistBtn.addEventListener('click', () => {
        playlistSection.classList.toggle('show');
        togglePlaylistBtn.innerHTML = playlistSection.classList.contains('show') ? '📑' : '📑';
    });

    // Update the updatePlaylistUI function
    function updatePlaylistUI() {
        const playlistEl = document.getElementById('playlist');
        if (playlist.length === 0) {
            playlistEl.innerHTML = '<li class="playlist-item">No songs added</li>';
            return;
        }

        playlistEl.innerHTML = playlist.map((track, index) => `
            <li class="playlist-item ${index === currentTrackIndex ? 'playing' : ''}"
                onclick="loadTrack(${index})">
                <span>${track.name}</span>
                <button class="music-btn" onclick="event.stopPropagation(); removeFromPlaylist(${index})">❌</button>
            </li>
        `).join('');
    }

    function savePlaylist() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }

    // Make functions available globally
    window.loadTrack = loadTrack;
    window.removeFromPlaylist = (index) => {
        playlist.splice(index, 1);
        if (index === currentTrackIndex) {
            if (playlist.length > 0) {
                loadTrack(0);
            } else {
                audioPlayer.src = '';
                playPauseBtn.disabled = true;
                previousBtn.disabled = true;
                nextBtn.disabled = true;
            }
        }
        updatePlaylistUI();
        savePlaylist();
    };
}

// Add these background image functions
function initBackgroundImage() {
    const bgImageBtn = document.getElementById('bgImageBtn');
    const bgImageInput = document.getElementById('bgImageInput');

    // Load saved background if it exists
    const savedBg = localStorage.getItem('backgroundImage');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
    }

    bgImageBtn.addEventListener('click', () => {
        bgImageInput.click();
    });

    bgImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageUrl = event.target.result;
                document.body.style.backgroundImage = `url(${imageUrl})`;
                localStorage.setItem('backgroundImage', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Add these new functions
function initTaskControls() {
    document.getElementById('searchTasks').addEventListener('input', filterTasks);
    document.getElementById('filterPriority').addEventListener('change', filterTasks);
    document.getElementById('filterCategory').addEventListener('change', filterTasks);
    document.getElementById('filterStatus').addEventListener('change', filterTasks);
    updateCategoryList();
}

function updateCategoryList() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const categories = new Set(tasks.map(task => task.category).filter(Boolean));
    const datalist = document.getElementById('categoryList');
    datalist.innerHTML = Array.from(categories)
        .map(category => `<option value="${category}">`)
        .join('');
    
    const filterCategory = document.getElementById('filterCategory');
    filterCategory.innerHTML = '<option value="">All Categories</option>' +
        Array.from(categories)
            .map(category => `<option value="${category}">${category}</option>`)
            .join('');
}

function filterTasks() {
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    const priorityFilter = document.getElementById('filterPriority').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                            task.description.toLowerCase().includes(searchTerm);
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        const matchesCategory = !categoryFilter || task.category === categoryFilter;
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'completed') === task.completed;
        
        return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });
    
    renderTasks(filteredTasks);
}

function renderTasks(tasks) {
    const taskList = document.getElementById('taskItems');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' task-completed' : '');
        
        const reminderText = task.reminderTime ? 
            `<span class="reminder-badge">⏰ Reminder set</span>` : '';
        
        li.innerHTML = `
            <div class="task-content">
                <div class="task-header">
                    <strong>${task.title}</strong>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                    ${reminderText}
                    <span class="task-date">${formatDate(task.date)}</span>
                </div>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            </div>
            <div class="task-actions">
                <button onclick="toggleTaskComplete('${task.id}')" class="action-btn">
                    ${task.completed ? '↩️' : '✓'}
                </button>
                <button onclick="editTask('${task.id}')" class="action-btn">✏️</button>
                <button onclick="deleteTask('${task.id}')" class="action-btn">🗑️</button>
            </div>
        `;
        
        taskList.appendChild(li);
    });
}

function toggleTaskComplete(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id.toString() === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        filterTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const filteredTasks = tasks.filter(t => t.id.toString() !== taskId);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
        filterTasks();
        updateCategoryList();
    }
}

function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const task = tasks.find(t => t.id.toString() === taskId);
    if (task) {
        // Fill the form with task data
        document.getElementById('newTask').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskDate').value = task.date || '';
        document.getElementById('taskPriority').value = task.priority || 'low';
        document.getElementById('taskCategory').value = task.category || '';
        document.getElementById('reminderTime').value = task.reminderTime || '';
        
        // Change the Add Task button to Update
        const addTaskBtn = document.getElementById('addTaskBtn');
        addTaskBtn.textContent = 'Update Task';
        addTaskBtn.dataset.editId = taskId; // Store the task ID being edited
        
        // Scroll to the form
        document.querySelector('.task-input').scrollIntoView({ behavior: 'smooth' });
    }
}

// Add these notification-related functions
function initNotifications() {
    // Request notification permission on page load
    if ("Notification" in window) {
        Notification.requestPermission();
    }
    
    // Check for tasks with reminders every minute
    setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately on load
}

function checkReminders() {
    if (Notification.permission !== "granted") return;
    
    const now = new Date();
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    tasks.forEach(task => {
        if (task.date && task.reminderTime && !task.notified) {
            const taskDate = new Date(task.date);
            const reminderDate = new Date(taskDate - task.reminderTime * 60000); // Convert minutes to milliseconds
            
            if (now >= reminderDate && now < taskDate) {
                showNotification(task);
                markTaskNotified(task.id);
            }
        }
    });
}

function showNotification(task) {
    const minutesBefore = task.reminderTime;
    const timeString = minutesBefore === '0' ? 'now' : 
                      `in ${minutesBefore} minute${minutesBefore === '1' ? '' : 's'}`;
    
    const notification = new Notification("Task Reminder", {
        body: `${task.title} - Starting ${timeString}`,
        icon: "/favicon.ico", // Add a favicon to your project for this
        badge: "/favicon.ico",
        vibrate: [200, 100, 200]
    });
    
    notification.onclick = function() {
        window.focus();
        document.getElementById('taskItems').scrollIntoView({ behavior: 'smooth' });
    };
}

function markTaskNotified(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
    if (taskIndex !== -1) {
        tasks[taskIndex].notified = true;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
} 
