// Menu-specific JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const sweetItems = document.querySelectorAll('.sweet-item');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('navSearchInput');
    const mobileSearchInput = document.getElementById('menuSearchInput');

    // CATEGORY FILTERING FUNCTIONALITY
    const filterCategory = (category) => {
        // Update active button
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Filter items with smooth animations
        sweetItems.forEach((item, index) => {
            const itemCategory = item.dataset.category;
            
            if (category === 'all' || itemCategory === category) {
                // Show item with staggered animation
                setTimeout(() => {
                    item.style.display = '';
                    item.classList.remove('hidden');
                    item.classList.add('visible');
                }, index * 50); // Stagger the animations
            } else {
                // Hide item with animation
                item.classList.remove('visible');
                item.classList.add('hidden');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });

    };

    // Make filterCategory function globally available
    window.filterCategory = filterCategory;

    // SEARCH FUNCTIONALITY
    let currentSearchTerm = '';
    
    // Function to perform search
    const performSearch = (query) => {
        const searchTerm = query.toLowerCase().trim();
        
        sweetItems.forEach(item => {
            const name = (item.dataset.name || '').toLowerCase();
            const description = (item.dataset.description || '').toLowerCase();
            
            // Check if item name or description starts with the search term
            const nameMatch = name.startsWith(searchTerm);
            const descMatch = description.startsWith(searchTerm);
            
            if (searchTerm === '' || nameMatch || descMatch) {
                item.style.display = '';
                item.classList.remove('hidden');
                item.classList.add('visible');
            } else {
                item.classList.remove('visible');
                item.classList.add('hidden');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    };

    // Desktop search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
            // Add active class to matching items for visual feedback
            if (e.target.value.trim() !== '') {
                document.querySelectorAll('.sweet-item.visible').forEach(item => {
                    item.classList.add('search-match');
                });
            } else {
                document.querySelectorAll('.sweet-item').forEach(item => {
                    item.classList.remove('search-match');
                });
            }
        });
    }

    // Mobile search
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
            // Add active class to matching items for visual feedback
            if (e.target.value.trim() !== '') {
                document.querySelectorAll('.sweet-item.visible').forEach(item => {
                    item.classList.add('search-match');
                });
            } else {
                document.querySelectorAll('.sweet-item').forEach(item => {
                    item.classList.remove('search-match');
                });
            }
        });

        // Handle Enter key press in mobile search
        mobileSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                performSearch(mobileSearchInput.value);
            }
        });
    }

    // Handle mobile search form submission
    const mobileSearchForm = document.querySelector('.search-below-heading');
    if (mobileSearchForm) {
        mobileSearchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            performSearch(mobileSearchInput.value);
        });
    }

    // Handle desktop search form submission
    const desktopSearchForm = document.querySelector('.nav-search');
    if (desktopSearchForm) {
        desktopSearchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            performSearch(searchInput.value);
        });
    }

    // Initialize with all items visible
    filterCategory('all');

    // Slider functionality
    const sliderContainer = document.querySelector('.slider-container');
    const images = document.querySelectorAll('.slider-image');
    
    // Clone first image and add to end for smooth infinite loop
    const firstImageClone = images[0].cloneNode(true);
    sliderContainer.appendChild(firstImageClone);
    
    let currentIndex = 0;
    
    setInterval(() => {
        currentIndex++;
        sliderContainer.style.transition = 'transform 0.5s ease';
        sliderContainer.style.transform = `translateX(-${currentIndex * 20}%)`;
        
        if(currentIndex === images.length) {
            setTimeout(() => {
                sliderContainer.style.transition = 'none';
                currentIndex = 0;
                sliderContainer.style.transform = 'translateX(0)';
            }, 500);
        }
    }, 2000);

    // Pre-cache category items for faster filtering
    const categoryCache = new Map();
    
    // Initialize cache
    sweetItems.forEach(item => {
        const category = item.dataset.category.toLowerCase();
        if (!categoryCache.has(category)) {
            categoryCache.set(category, []);
        }
        categoryCache.get(category).push(item);
    });

    // Optimized filter function
    window.filterCategory = function(category) {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        event.target.classList.add('active');

        const targetCategory = category.toLowerCase();

        requestAnimationFrame(() => {
            sweetItems.forEach(item => {
                const itemCategory = item.dataset.category.toLowerCase();
                const shouldShow = category === 'all' || itemCategory === targetCategory;
                
                item.style.display = shouldShow ? '' : 'none';
                item.classList.toggle('visible', shouldShow);
                item.classList.toggle('hidden', !shouldShow);
            });
        });
    };

    // Initial load - show all items
    filterCategory('all');
});



