document.addEventListener("DOMContentLoaded", function() {
    const isMobile = window.innerWidth <= 768;
    const content = document.querySelector('.content');

    
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
                    resizeCanvas(); 
                }
            };
        });

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawParallax(); 
        }

        function drawParallax() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scrollX = content.scrollLeft;

            layers.forEach(layer => {
                const img = layer.img;
                if (!img.complete || img.naturalWidth === 0) return; 

                const imgW = img.width;
                const imgH = img.height;
                const canvasH = canvas.height;
                const drawH = canvasH; 
                const drawW = imgW * (drawH / imgH); 

                let xPosition = (-scrollX * layer.speed) % drawW;

                
                if (xPosition > 0) {
                    xPosition -= drawW;
                }

                const yPosition = (canvasH - drawH) / 2; 

                for (let currentX = xPosition; currentX < canvas.width; currentX += drawW) {
                    ctx.drawImage(img, currentX, yPosition, drawW, drawH);
                }
            });
        }

        window.addEventListener('resize', resizeCanvas);
        content.addEventListener('scroll', () => {
            window.requestAnimationFrame(drawParallax);
        });

        
        if (loadedImages === layers.length) {
            resizeCanvas();
        }
    }

    
    function initContentScrolling() {
        if (isMobile || !content) return; 

        let isDragging = false;
        let startX, scrollLeftInitial;
        const DRAG_MULTIPLIER = 2;

        function handleDragStart(e) {
            isDragging = true;
            

            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            startX = pageX - content.offsetLeft;
            scrollLeftInitial = content.scrollLeft;

            if (e.touches) {
                document.addEventListener('touchmove', handleDragMove, { passive: false });
                document.addEventListener('touchend', handleDragEnd);
                document.addEventListener('touchcancel', handleDragEnd);
            } else {
                
                e.preventDefault();
                document.addEventListener('mousemove', handleDragMove);
                document.addEventListener('mouseup', handleDragEnd);
            }
        }

        function handleDragMove(e) {
            if (!isDragging) return;
            e.preventDefault(); 

            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            const x = pageX - content.offsetLeft;
            const walk = (x - startX) * DRAG_MULTIPLIER;
            content.scrollLeft = scrollLeftInitial - walk;
        }

        function handleDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            

            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
            document.removeEventListener('touchcancel', handleDragEnd);
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        }

        content.addEventListener("mousedown", handleDragStart);
        content.addEventListener("touchstart", handleDragStart, { passive: true });
    }

    
    const statBox = document.querySelector('.stat-box');
    const aboutBox = document.querySelector('.about-box');

    function matchAndSetHeights() {
        if (statBox && aboutBox) {
            
            statBox.style.height = 'auto';
            aboutBox.style.height = 'auto';

            const maxHeight = Math.max(statBox.scrollHeight, aboutBox.scrollHeight);
            statBox.style.height = maxHeight + "px";
            aboutBox.style.height = maxHeight + "px";
        }
    }

    function initMatchBoxHeights() {
        if (!statBox || !aboutBox) return;

        
        
        

        window.addEventListener("resize", matchAndSetHeights);
        window.addEventListener("load", matchAndSetHeights);
    }

    
    function initMobileSkillsTabs() {
        if (!isMobile) return;

        const tabs = document.querySelectorAll('.skills-tab-btn');
        
        const categories = {
            advanced: document.getElementById('skills-advanced'),
            intermediate: document.getElementById('skills-intermediate'),
            beginner: document.getElementById('skills-beginner')
        };

        if (!tabs.length) return;

        
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
                if (validCategories[categoryKey]) { 
                    showCategory(categoryKey);
                }
            });
        });

        
        if (validCategories.advanced) {
            showCategory('advanced');
        } else if (Object.keys(validCategories).length > 0) {
            showCategory(Object.keys(validCategories)[0]);
        }
    }

    
    const mainContentElement = document.querySelector('.content'); 
    const mainSiteOverlayElement = document.querySelector('body > .overlay'); 
    

    function initIframeModal() {
        const toggleButton = document.getElementById('angryEyesButton'); 
        const projectsButton = document.getElementById('myProjectsBtn'); 
        const blackOverlay = document.getElementById('iframeBlackOverlay');
        const iframeContainer = document.getElementById('iframeModalContainer');
        const websiteIframe = document.getElementById('websiteIframe'); 

        if (!toggleButton || !projectsButton || !blackOverlay || !iframeContainer || !websiteIframe || !mainContentElement || !mainSiteOverlayElement) {
            console.warn('Iframe modal elements not found.');
            return;
        }

        
        function openModal(iframeSrc) {
            if (websiteIframe) websiteIframe.src = iframeSrc;
            
            blackOverlay.style.display = 'block';
            iframeContainer.style.display = 'block';
            void blackOverlay.offsetWidth;
            void iframeContainer.offsetWidth;

            blackOverlay.classList.add('visible');
            iframeContainer.classList.add('visible');
            document.body.classList.add('iframe-modal-open');

            setTimeout(() => {
                if (iframeContainer.classList.contains('visible')) {
                    if (mainContentElement) mainContentElement.style.display = 'none';
                    if (mainSiteOverlayElement) mainSiteOverlayElement.style.display = 'none';
                }
            }, 1500); 
        }

        
        function closeModal() {
            if (mainContentElement) mainContentElement.style.display = isMobile ? 'block' : 'flex';
            if (mainSiteOverlayElement) mainSiteOverlayElement.style.display = 'block';

            iframeContainer.classList.remove('visible');
            blackOverlay.classList.remove('visible');
            document.body.classList.remove('iframe-modal-open');

            setTimeout(() => {
                if (!iframeContainer.classList.contains('visible')) {
                    iframeContainer.style.display = 'none';
                    blackOverlay.style.display = 'none';
                }
            }, 1800); 
        }

        toggleButton.addEventListener('click', () => { 
            const isVisible = iframeContainer.classList.contains('visible');
            if (isVisible) {
                closeModal();
            } else {
                openModal('https://sajagin.thedev.id/EYEs'); 
            }
        });

        projectsButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            const isVisible = iframeContainer.classList.contains('visible');
            if (isVisible) {
                closeModal();
            } else {
                openModal('https://sajagin.thedev.id/ShowCase');
            }
        });
    }

    
    function initKeyboardScrolling() {
        if (isMobile || !content) return; 
        
        let scrollDirection = 0; // -1 for left, 1 for right, 0 for none
        const scrollSpeed = 15; // Pixels per frame. Adjust for desired speed.
        let animationFrameId = null;

        function scrollLoop() {
            if (scrollDirection === 0 || !content) { // Added !content check
                animationFrameId = null; // Stop the loop
                return;
            }

            const newScrollLeft = content.scrollLeft + (scrollDirection * scrollSpeed);
            content.scrollLeft = Math.max(0, Math.min(newScrollLeft, content.scrollWidth - content.clientWidth));

            animationFrameId = requestAnimationFrame(scrollLoop);
        }

        window.addEventListener('keydown', (event) => {
            
            if (document.body.classList.contains('iframe-modal-open')) {
                return;
            }
            let newDirection = 0;
            if (event.key === 'ArrowLeft') {
                newDirection = -1;
            } else if (event.key === 'ArrowRight') {
                newDirection = 1;
            } else {
                return; 
            }
           if (scrollDirection !== newDirection) {
                scrollDirection = newDirection;
                if (!animationFrameId) { // Start loop if not already running
                    animationFrameId = requestAnimationFrame(scrollLoop);
                }
            }
            event.preventDefault(); // Prevent default browser scroll for arrow keys
        });
        
        window.addEventListener('keyup', (event) => {
            if ((event.key === 'ArrowLeft' && scrollDirection === -1) ||
                (event.key === 'ArrowRight' && scrollDirection === 1)) {
                scrollDirection = 0; // Stop scrolling
            }
        });
    }

    // Initialize all functionalities
    initParallax();
    initContentScrolling();
    initMatchBoxHeights();
    initMobileSkillsTabs();
    initIframeModal(); 
    initKeyboardScrolling(); 
 });