document.addEventListener("DOMContentLoaded", function() {
    const isMobile = window.innerWidth <= 768;
    const content = document.querySelector('.content');

    // --- Parallax Effect ---
    function initParallax() {
        if (isMobile || !content) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'parallax-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const layers = [
            { src: 'assets/city_parallax/1.avif', speed: 0.1, img: new Image() },
            { src: 'assets/city_parallax/2.avif', speed: 0.2, img: new Image() },
            { src: 'assets/city_parallax/3.avif', speed: 0.3, img: new Image() },
            { src: 'assets/city_parallax/4.avif', speed: 0.4, img: new Image() },
            { src: 'assets/city_parallax/5.avif', speed: 0.5, img: new Image() },
            { src: 'assets/city_parallax/6.avif', speed: 0.6, img: new Image() }
        ];

        let loadedImages = 0;
        layers.forEach(layer => {
            layer.img.src = layer.src;
            layer.img.onload = () => {
                loadedImages++;
                if (loadedImages === layers.length) {
                    resizeCanvas(); // Initial draw after all images loaded
                }
            };
        });

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawParallax(); // Redraw after resize
        }

        function drawParallax() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scrollX = content.scrollLeft;

            layers.forEach(layer => {
                const img = layer.img;
                if (!img.complete || img.naturalWidth === 0) return; // Skip if image not ready

                const imgW = img.width;
                const imgH = img.height;
                const canvasH = canvas.height;
                const drawH = canvasH; // Draw image to fill canvas height
                const drawW = imgW * (drawH / imgH); // Calculate width to maintain aspect ratio

                let xPosition = (-scrollX * layer.speed) % drawW;

                // Ensure seamless looping for images that are narrower than the canvas width when tiled
                if (xPosition > 0) {
                    xPosition -= drawW;
                }

                const yPosition = (canvasH - drawH) / 2; // Center vertically if needed, though drawH = canvasH

                for (let currentX = xPosition; currentX < canvas.width; currentX += drawW) {
                    ctx.drawImage(img, currentX, yPosition, drawW, drawH);
                }
            });
        }

        window.addEventListener('resize', resizeCanvas);
        content.addEventListener('scroll', () => {
            window.requestAnimationFrame(drawParallax);
        });

        // Initial call in case images were cached and loaded quickly
        if (loadedImages === layers.length) {
            resizeCanvas();
        }
    }

    // --- Content Scrolling (Mouse & Touch) ---
    function initContentScrolling() {
        if (isMobile || !content) return; // Prevent initialization on mobile

        let isDragging = false;
        let startX, scrollLeftInitial;
        const DRAG_MULTIPLIER = 2;

        function handleDragStart(e) {
            isDragging = true;
            // content.classList.add('is-dragging'); // Optional: for styling

            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            startX = pageX - content.offsetLeft;
            scrollLeftInitial = content.scrollLeft;

            if (e.touches) {
                document.addEventListener('touchmove', handleDragMove, { passive: false });
                document.addEventListener('touchend', handleDragEnd);
                document.addEventListener('touchcancel', handleDragEnd);
            } else {
                // Prevent default drag behavior for mouse (e.g., dragging images)
                e.preventDefault();
                document.addEventListener('mousemove', handleDragMove);
                document.addEventListener('mouseup', handleDragEnd);
            }
        }

        function handleDragMove(e) {
            if (!isDragging) return;
            e.preventDefault(); // Crucial for touchmove to prevent browser scroll

            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            const x = pageX - content.offsetLeft;
            const walk = (x - startX) * DRAG_MULTIPLIER;
            content.scrollLeft = scrollLeftInitial - walk;
        }

        function handleDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            // content.classList.remove('is-dragging'); // Optional

            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
            document.removeEventListener('touchcancel', handleDragEnd);
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        }

        content.addEventListener("mousedown", handleDragStart);
        content.addEventListener("touchstart", handleDragStart, { passive: true });
    }

    // --- Match Box Heights ---
    const statBox = document.querySelector('.stat-box');
    const aboutBox = document.querySelector('.about-box');

    function matchAndSetHeights() {
        if (statBox && aboutBox) {
            // Reset height to auto to allow natural height calculation
            statBox.style.height = 'auto';
            aboutBox.style.height = 'auto';

            const maxHeight = Math.max(statBox.scrollHeight, aboutBox.scrollHeight);
            statBox.style.height = maxHeight + "px";
            aboutBox.style.height = maxHeight + "px";
        }
    }

    function initMatchBoxHeights() {
        if (!statBox || !aboutBox) return;

        // Initial call on DOMContentLoaded might be too early if images/fonts inside affect scrollHeight.
        // Rely on 'load' for the first accurate sizing.
        // matchAndSetHeights(); 

        window.addEventListener("resize", matchAndSetHeights);
        window.addEventListener("load", matchAndSetHeights);
    }

    // --- Mobile Skills Tabs Logic ---
    function initMobileSkillsTabs() {
        if (!isMobile) return;

        const tabs = document.querySelectorAll('.skills-tab-btn');
        // Assuming categories are direct children or identifiable uniquely
        const categories = {
            advanced: document.getElementById('skills-advanced'),
            intermediate: document.getElementById('skills-intermediate'),
            beginner: document.getElementById('skills-beginner')
        };

        if (!tabs.length) return;

        // Filter out non-existent category elements
        const validCategories = {};
        Object.keys(categories).forEach(key => {
            if (categories[key]) {
                validCategories[key] = categories[key];
            } else {
                console.warn(`Skills category element with ID 'skills-${key}' not found.`);
            }
        });

        function showCategory(categoryToShow) {
            Object.keys(validCategories).forEach(key => {
                validCategories[key].style.display = (key === categoryToShow) ? '' : 'none';
            });
            tabs.forEach(tab => {
                tab.classList.toggle('active', tab.dataset.category === categoryToShow);
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const categoryKey = tab.dataset.category;
                if (validCategories[categoryKey]) { // Show only if category element exists
                    showCategory(categoryKey);
                }
            });
        });

        // Show 'advanced' by default if it exists, otherwise the first available
        if (validCategories.advanced) {
            showCategory('advanced');
        } else if (Object.keys(validCategories).length > 0) {
            showCategory(Object.keys(validCategories)[0]);
        }
    }

    // Initialize all functionalities
    initParallax();
    initContentScrolling();
    initMatchBoxHeights();
    initMobileSkillsTabs();
});
