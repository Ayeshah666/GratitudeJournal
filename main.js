       // Set current date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
        
        // Sticker functionality
        const stickerCanvas = document.getElementById('sticker-canvas');
        const stickerOptions = document.querySelectorAll('.sticker-option');
        
        stickerOptions.forEach(option => {
            option.addEventListener('click', function() {
                const stickerClass = this.getAttribute('data-sticker');
                const sticker = document.createElement('div');
                sticker.className = 'sticker';
                
                // Random position within canvas (pixel-based)
                const parentRect = stickerCanvas.getBoundingClientRect();
                const maxX = parentRect.width - 50; // Account for sticker size
                const maxY = parentRect.height - 50;
                const randomX = Math.floor(Math.random() * maxX);
                const randomY = Math.floor(Math.random() * maxY);
                
                sticker.style.transform = `translate(${randomX}px, ${randomY}px)`;
                
                const icon = document.createElement('i');
                icon.className = `fas ${stickerClass} text-4xl`;
                
                // Random color
                const colors = ['text-pink-300', 'text-yellow-300', 'text-blue-300', 'text-green-300', 'text-purple-300'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                icon.classList.add(randomColor);
                
                // Random size
                const sizes = ['text-3xl', 'text-4xl', 'text-5xl'];
                const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
                icon.classList.add(randomSize);
                
                sticker.appendChild(icon);
                stickerCanvas.appendChild(sticker);
                
                // Make stickers draggable
                makeDraggable(sticker);
            });
        });
        
        // Make existing stickers draggable
        document.querySelectorAll('#sticker-canvas .sticker').forEach(sticker => {
            makeDraggable(sticker);
        });
        
        function makeDraggable(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            
            element.onmousedown = dragMouseDown;
            
            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // Get the mouse cursor position at startup
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // Call a function whenever the cursor moves
                document.onmousemove = elementDrag;
            }
            
            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                
                // Calculate mouse movement since last position
                const dx = e.clientX - pos3;
                const dy = e.clientY - pos4;
                
                // Get current transform values
                const transform = element.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                let tx = transform ? parseFloat(transform[1]) : 0;
                let ty = transform ? parseFloat(transform[2]) : 0;
                
                // Apply movement (using pixels for more precise control)
                tx += dx;
                ty += dy;
                
                // Constrain to parent bounds
                const parentRect = stickerCanvas.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const maxX = parentRect.width - elementRect.width;
                const maxY = parentRect.height - elementRect.height;
                
                tx = Math.max(0, Math.min(tx, maxX));
                ty = Math.max(0, Math.min(ty, maxY));
                
                // Apply new position
                element.style.transform = `translate(${tx}px, ${ty}px)`;
                
                // Update mouse position
                pos3 = e.clientX;
                pos4 = e.clientY;
            }
            
            function closeDragElement() {
                // Stop moving when mouse button is released
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
        
        // Mood selector animation
        const moodInputs = document.querySelectorAll('.mood-selector input');
        moodInputs.forEach(input => {
            input.addEventListener('change', function() {
                // Remove all checked styles first
                document.querySelectorAll('.mood-selector label').forEach(label => {
                    label.style.transform = '';
                    label.style.filter = '';
                });
                
                // Apply to checked one
                if (this.checked) {
                    const label = document.querySelector(`label[for="${this.id}"]`);
                    label.style.transform = 'scale(1.2)';
                    label.style.filter = 'drop-shadow(0 0 5px rgba(0,0,0,0.2))';
                }
            });
        });
        
        // Photo upload functionality
        const addPhotoBtn = document.getElementById('add-photo-btn');
        const photoUpload = document.getElementById('photo-upload');
        
        addPhotoBtn.addEventListener('click', () => {
            photoUpload.click();
        });
        
        photoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'sticker max-w-[100px] max-h-[100px] object-contain';
                    
                    // Random position within canvas
                    const canvasRect = stickerCanvas.getBoundingClientRect();
                    const maxX = canvasRect.width - 100;
                    const maxY = canvasRect.height - 100;
                    const randomX = Math.floor(Math.random() * maxX);
                    const randomY = Math.floor(Math.random() * maxY);
                    
                    img.style.left = `${randomX}px`;
                    img.style.top = `${randomY}px`;
                    
                    stickerCanvas.appendChild(img);
                    makeDraggable(img);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Save entry functionality
        const saveEntryBtn = document.getElementById('save-entry-btn');
        
        saveEntryBtn.addEventListener('click', () => {
            // Get all entry data
            const date = document.getElementById('current-date').textContent;
            const mood = document.querySelector('.mood-selector input:checked + label p').textContent;
            const gratitudeItems = Array.from(document.querySelectorAll('[placeholder="Person"], [placeholder="Thing"], [placeholder="Experience"]'))
                .map(input => input.value)
                .filter(value => value.trim() !== '');
            const reflection = document.querySelector('.entry-textarea').value;
            
            // Create a data object
            const entryData = {
                date,
                mood,
                gratitudeItems,
                reflection,
                stickers: Array.from(document.querySelectorAll('#sticker-canvas .sticker')).map(sticker => {
                    return {
                        type: sticker.querySelector('i') ? sticker.querySelector('i').className : 'image',
                        position: {
                            left: sticker.style.left,
                            top: sticker.style.top
                        }
                    };
                })
            };
            
            // In a real app, you would send this to a server
            // For now, we'll just show an alert and log to console
            console.log('Entry saved:', entryData);
            alert('Entry saved successfully!');
            
            // You could also save to localStorage for persistence:
            const entries = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
            entries.push(entryData);
            localStorage.setItem('gratitudeEntries', JSON.stringify(entries));
        });
