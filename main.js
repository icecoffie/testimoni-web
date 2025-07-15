const API_BASE_URL = './api.php'; 

        const testimonyForm = document.getElementById('testimonyForm');
        const clientNameInput = document.getElementById('clientName');
        const testimonyTextInput = document.getElementById('testimonyText');
        const starRatingDiv = document.getElementById('starRating');
        const ratingValueInput = document.getElementById('ratingValue');
        const sliderWrapper = document.getElementById('sliderWrapper');
        const noTestimonyMessage = sliderWrapper.querySelector('.no-testimony-message');
        const prevSlideBtn = document.getElementById('prevSlide');
        const nextSlideBtn = document.getElementById('nextSlide');
        const sliderDotsDiv = document.getElementById('sliderDots');
        const adminModeToggle = document.getElementById('adminModeToggle');
        const adminIcon = document.getElementById('adminIcon'); 
        const adminPasswordModal = document.getElementById('adminPasswordModal');
        const adminPasswordInput = document.getElementById('adminPasswordInput');
        const confirmAdminPasswordBtn = document.getElementById('confirmAdminPassword');
        const cancelAdminPasswordBtn = document.getElementById('cancelAdminPassword');

        let currentRating = 0;
        let currentSlideIndex = 0;
        let slideInterval;
        let isAdminMode = false;
        const ADMIN_PASSWORD = 'maungapain'; 

        const ROCKET_OUTLINE_ICON = 'admin.png';
        const ROCKET_SOLID_ICON = 'admin1.png'; 

        function renderStars(rating) {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<span class="${i <= rating ? 'selected' : ''}">&#9733;</span>`;
            }
            return starsHtml;
        }

        function setupTestimoniesListener() {
            loadTestimonies();
        }

        async function loadTestimonies() {
            try {
                const response = await fetch(API_BASE_URL);
                const result = await response.json();
                
                if (result.success) {
                    displayTestimonies(result.data);
                } else {
                    console.error("Error loading testimonies:", result.error);
                    showCustomMessage("Gagal memuat testimoni. Silakan coba lagi.", false);
                }
            } catch (error) {
                console.error("Error fetching testimonies:", error);
                showCustomMessage("Gagal memuat testimoni. Silakan coba lagi.", false);
            }
        }

        function displayTestimonies(testimonies) {
            sliderWrapper.innerHTML = '';
            sliderDotsDiv.innerHTML = '';

            if (testimonies.length === 0) {
                noTestimonyMessage.style.display = 'block';
                sliderWrapper.appendChild(noTestimonyMessage);
                prevSlideBtn.style.display = 'none';
                nextSlideBtn.style.display = 'none';
                stopAutoplay();
            } else {
                noTestimonyMessage.style.display = 'none';
                prevSlideBtn.style.display = 'block';
                nextSlideBtn.style.display = 'block';
                testimonies.forEach((testimony, index) => {
                    const testimonyCard = document.createElement('div');
                    testimonyCard.classList.add('testimony-card', 'bg-[var(--primary-bg)]', 'p-5', 'rounded-md', 'shadow-md', 'border', 'border-[var(--border-color)]', 'flex', 'flex-col', 'justify-between', 'slider-item');

                    const randomVariant = Math.floor(Math.random() * 3);
                    if (randomVariant === 1) {
                        testimonyCard.classList.add('variant-1');
                    } else if (randomVariant === 2) {
                        testimonyCard.classList.add('variant-2');
                    }

                    const date = new Date(testimony.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    testimonyCard.innerHTML = `
                        <div class="card-header mb-4">
                            <h3 class="text-xl font-semibold text-[var(--accent-color)] mb-2">${testimony.name}</h3>
                            <div class="stars-display text-2xl text-[var(--star-filled)]">${renderStars(testimony.rating)}</div>
                        </div>
                        <p class="text-[var(--text-color)] flex-grow">"${testimony.text}"</p>
                        <div class="card-footer text-right mt-4 text-sm text-[#aaa]">
                            <span>${date}</span>
                        </div>
                    `;

                    if (isAdminMode) {
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('delete-button');
                        deleteButton.textContent = 'Hapus';
                        deleteButton.dataset.id = testimony.id; 
                        deleteButton.addEventListener('click', (e) => {
                            showCustomMessage('Apakah Anda yakin ingin menghapus testimoni ini?', true, () => {
                                deleteTestimony(e.target.dataset.id); 
                            });
                        });
                        testimonyCard.appendChild(deleteButton);
                    }
                    sliderWrapper.appendChild(testimonyCard);

                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    dot.dataset.index = index;
                    dot.addEventListener('click', () => showSlide(index));
                    sliderDotsDiv.appendChild(dot);
                });
                if (testimonies.length > 0) { 
                    if (currentSlideIndex >= testimonies.length) {
                        currentSlideIndex = 0; 
                    }
                } else {
                    currentSlideIndex = 0; 
                }
                showSlide(currentSlideIndex);
                startAutoplay();
            }
        }

        async function deleteTestimony(testimonyId) {
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: testimonyId,
                        admin_password: ADMIN_PASSWORD
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showCustomMessage('Testimoni berhasil dihapus!', false);
                    loadTestimonies(); // Reload testimonies
                } else {
                    showCustomMessage(result.error || 'Gagal menghapus testimoni.', false);
                }
            } catch (error) {
                console.error("Error deleting testimony:", error);
                showCustomMessage('Gagal menghapus testimoni. Silakan coba lagi.', false);
            }
        }

        function showSlide(index) {
            const slides = sliderWrapper.querySelectorAll('.slider-item');
            const dots = sliderDotsDiv.querySelectorAll('.dot');
            if (slides.length === 0) return;

            if (index >= slides.length) {
                currentSlideIndex = 0;
            } else if (index < 0) {
                currentSlideIndex = slides.length - 1;
            } else {
                currentSlideIndex = index;
            }

            const offset = -currentSlideIndex * 100;
            sliderWrapper.style.transform = `translateX(${offset}%)`;

            dots.forEach((dot, i) => {
                if (i === currentSlideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function nextSlide() {
            showSlide(currentSlideIndex + 1);
        }

        function prevSlide() {
            showSlide(currentSlideIndex - 1);
        }

        function startAutoplay() {
            stopAutoplay();
            slideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(slideInterval);
        }

        function showCustomMessage(message, isConfirmation = false, onConfirmCallback = null) {
            const existingModal = document.querySelector('.modal-overlay.fixed.inset-0');
            if (existingModal) {
                document.body.removeChild(existingModal);
            }

            const modalOverlay = document.createElement('div');
            modalOverlay.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'flex', 'items-center', 'justify-content-center', 'z-50', 'modal-overlay');
            modalOverlay.innerHTML = `
                <div class="bg-[var(--secondary-bg)] p-8 rounded-lg shadow-xl border border-[var(--border-color)] max-w-sm w-full text-center modal-content">
                    <p class="text-lg mb-6 text-[var(--text-color)]">${message}</p>
                    <div class="modal-buttons">
                        <button id="closeModal" class="confirm-button">${isConfirmation ? 'Ya' : 'OK'}</button>
                        ${isConfirmation ? '<button id="cancelModal" class="cancel-button">Tidak</button>' : ''}
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            document.getElementById('closeModal').addEventListener('click', () => {
                document.body.removeChild(modalOverlay);
                if (isConfirmation && onConfirmCallback) {
                    onConfirmCallback();
                }
            });

            if (isConfirmation) {
                document.getElementById('cancelModal').addEventListener('click', () => {
                    document.body.removeChild(modalOverlay);
                });
            }
        }


        // Initialize page when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Load testimonies on page load
            setupTestimoniesListener();
            starRatingDiv.addEventListener('mouseover', (e) => {
                starRatingDiv.querySelectorAll('span').forEach(star => {
                    star.classList.remove('hover-effect');
                });

                let hoveredStar = e.target.closest('span');
                if (hoveredStar) {
                    let value = parseInt(hoveredStar.dataset.value);
                    for (let i = 1; i <= value; i++) {
                        starRatingDiv.querySelector(`span[data-value="${i}"]`).classList.add('hover-effect');
                    }
                }
            });

            starRatingDiv.addEventListener('mouseout', () => {
                starRatingDiv.querySelectorAll('span').forEach(star => {
                    star.classList.remove('hover-effect');
                });
            });

            starRatingDiv.addEventListener('click', (e) => {
                let clickedStar = e.target.closest('span');
                if (clickedStar) {
                    currentRating = parseInt(clickedStar.dataset.value);
                    ratingValueInput.value = currentRating;

                    starRatingDiv.querySelectorAll('span').forEach(star => {
                        let starValue = parseInt(star.dataset.value);
                        if (starValue <= currentRating) {
                            star.classList.add('selected');
                        } else {
                            star.classList.remove('selected');
                        }
                    });
                }
            });

            prevSlideBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoplay();
            });

            nextSlideBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoplay();
            });

            adminModeToggle.addEventListener('click', () => {
                if (isAdminMode) {
                    isAdminMode = false;
                    adminIcon.src = ROCKET_OUTLINE_ICON; 
                    loadTestimonies(); // Reload to hide delete buttons
                } else {
                    adminPasswordModal.classList.remove('hidden');
                    adminPasswordInput.value = '';
                    adminPasswordInput.focus();
                }
            });

            confirmAdminPasswordBtn.addEventListener('click', () => {
                const password = adminPasswordInput.value.trim();
                if (password === ADMIN_PASSWORD) {
                    isAdminMode = true;
                    adminIcon.src = ROCKET_SOLID_ICON;
                    adminPasswordModal.classList.add('hidden');
                    loadTestimonies(); // Reload to show delete buttons
                } else {
                    showCustomMessage('Password salah!', false);
                }
            });

            cancelAdminPasswordBtn.addEventListener('click', () => {
                adminPasswordModal.classList.add('hidden');
            });

            testimonyForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const clientName = clientNameInput.value.trim();
                const testimonyText = testimonyTextInput.value.trim();
                const rating = parseInt(ratingValueInput.value);

                if (clientName === '' || testimonyText === '' || rating === 0) {
                    showCustomMessage('Harap isi semua kolom dan berikan rating bintang!', false);
                    return;
                }

                const newTestimony = {
                    name: clientName,
                    text: testimonyText,
                    rating: rating
                };

                try {
                    const response = await fetch(API_BASE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newTestimony)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showCustomMessage('Testimoni Anda berhasil dikirim!', false);
                        
                        // Reset form
                        clientNameInput.value = '';
                        testimonyTextInput.value = '';
                        ratingValueInput.value = '0';
                        currentRating = 0;
                        starRatingDiv.querySelectorAll('span').forEach(star => {
                            star.classList.remove('selected', 'hover-effect');
                        });
                        
                        // Reload testimonies
                        loadTestimonies();
                    } else {
                        showCustomMessage(result.error || 'Gagal mengirim testimoni.', false);
                    }
                } catch (error) {
                    console.error("Error submitting testimony:", error);
                    showCustomMessage('Gagal mengirim testimoni. Silakan coba lagi.', false);
                }
            });
        });
