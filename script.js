document.addEventListener("DOMContentLoaded", function() {
    const isMobile = window.innerWidth <= 768;
    const content = document.querySelector('.content');
    let activeCanvasEmojis = []; // Global array for emojis to be drawn on canvas

    
    function initParallax() {
        if (isMobile || !content) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'parallax-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d'); // Ensure ctx is accessible within drawParallax

        const layers = [
            { src: 'assets/city_parallax/1.avif', speed: 0.1, img: new Image() },
            { src: 'assets/city_parallax/2.avif', speed: 0.2, img: new Image() },
            { src: 'assets/city_parallax/3.avif', speed: 0.3, img: new Image() },
            // Add more layers here if needed for emoji depth
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

        // This is the main drawing loop for both parallax and emojis
        function drawParallax() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scrollX = content.scrollLeft;
            const now = Date.now(); // Get current time once per frame

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

                // --- Draw Emojis in front of this layer (Optional: requires assigning layer index to emojis) ---
                // If you want emojis between layers, you'd add logic here to filter
                // activeCanvasEmojis based on a 'targetLayerIndex' property you add
                // to the emoji objects in animateEmojiFlyUp.
            });

            // --- Draw Emojis on Canvas (currently drawn on top of all layers) ---
            // Filter out finished emojis and draw active ones
            activeCanvasEmojis = activeCanvasEmojis.filter(emoji => {
                // Check if animation has started
                if (now < emoji.animationStartTime) {
                    // If not started, just keep it in the array for now
                    return true; 
                }

                const elapsedTime = now - emoji.animationStartTime;
                // Check if animation is finished
                if (elapsedTime > emoji.animationDuration) {
                    return false; // Remove emoji from array
                }

                const progress = elapsedTime / emoji.animationDuration;

                // Update properties based on animation progress
                emoji.currentY = emoji.startY - (progress * (canvas.height + emoji.size * 2)); // Fly upwards
                emoji.currentX = (emoji.startXPercent / 100 * canvas.width) - (scrollX * emoji.parallaxFactor);
                emoji.opacity = Math.sin(progress * Math.PI); // Fade in and out (0 to 1 to 0)
                emoji.currentRotation = emoji.initialRotation + progress * (emoji.targetRotation - emoji.initialRotation);

                // Draw the emoji
                ctx.save(); // Save current canvas state
                ctx.font = `${emoji.size}px Syne, Segoe UI Emoji, Noto Color Emoji, Arial, sans-serif`; // Use Syne + emoji fallbacks
                ctx.globalAlpha = emoji.opacity; // Apply opacity
                ctx.translate(emoji.currentX, emoji.currentY); // Move origin to emoji center
                ctx.rotate(emoji.currentRotation * Math.PI / 180); // Apply rotation (convert degrees to radians)
                ctx.textAlign = 'center'; // Center text around the origin
                ctx.textBaseline = 'middle'; // Center text vertically around the origin
                ctx.fillText(emoji.char, 0, 0); // Draw the emoji at the origin
                ctx.restore(); // Restore canvas state
                return true; // Keep emoji in array if animation is ongoing
            });
        }

        window.addEventListener('resize', resizeCanvas);
        content.addEventListener('scroll', () => {
            window.requestAnimationFrame(drawParallax); 
        });

        window.addEventListener('resize', resizeCanvas); // Ensure resizeCanvas calls drawParallax
        
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
        // const toggleButton = document.getElementById('angryEyesButton'); // Functionality moved to initEmojiHover
        const projectsButton = document.getElementById('myProjectsBtn'); 
        const blackOverlay = document.getElementById('iframeBlackOverlay');
        const iframeContainer = document.getElementById('iframeModalContainer');
        const websiteIframe = document.getElementById('websiteIframe'); 

        // Removed toggleButton from this check
        if (!projectsButton || !blackOverlay || !iframeContainer || !websiteIframe || !mainContentElement || !mainSiteOverlayElement) {
            console.warn('Iframe modal elements for projects or core components not found.');
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

        // Event listener for angryEyesButton (toggleButton) removed, its new functionality is in initEmojiHover
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

    function initEmojiHover() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return;

        const angryEyesButton = document.getElementById('angryEyesButton');
        if (!angryEyesButton) {
            console.warn('Emoji hover button "angryEyesButton" not found.');
            return;
        }

        // Preserve the original icon and clear the button for restructuring
        const originalIconHTML = angryEyesButton.innerHTML;
        angryEyesButton.innerHTML = '';

        // Create the emoji panel
        const emojiPanel = document.createElement('div');
        // emojiPanel.id = 'emojiPanel'; // ID might not be needed if styled as child
        emojiPanel.className = 'emoji-panel'; // This will be a child of angryEyesButton
        
        const emojis = ['💩', '😊', '🎈', '🎉', '👍'];
        emojis.forEach(emojiChar => {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emojiChar;
            emojiSpan.style.cursor = 'pointer'; // Indicate emojis are clickable
            emojiSpan.addEventListener('click', () => animateEmojiFlyUp(emojiChar));
            emojiPanel.appendChild(emojiSpan);
        });

        // Create a wrapper for the original icon
        const iconContainer = document.createElement('span');
        iconContainer.className = 'button-icon-container';
        iconContainer.innerHTML = originalIconHTML;

        // Append new structure: emoji panel first (left), then icon container (right)
        angryEyesButton.appendChild(emojiPanel);
        angryEyesButton.appendChild(iconContainer);

        let panelTimeout;

        function openPanel() {
            clearTimeout(panelTimeout);
            // Add class to button for shape change and panel reveal (CSS handles animation)
            angryEyesButton.classList.add('expanded-emoji-button');
        }

        function closePanel() {
            panelTimeout = setTimeout(() => {
                angryEyesButton.classList.remove('expanded-emoji-button');
            }, 100); // Small delay to allow mouse to move to panel before closing
        }

        angryEyesButton.addEventListener('mouseenter', openPanel);
        angryEyesButton.addEventListener('mouseleave', closePanel);

        // Keep panel open if mouse enters the emoji panel itself (which is now inside the button)
        emojiPanel.addEventListener('mouseenter', () => {
            clearTimeout(panelTimeout); // Keep panel open if mouse enters panel
        });
        emojiPanel.addEventListener('mouseleave', closePanel);
    }

    function animateEmojiFlyUp(emojiChar) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return; // Optional: disable on mobile for performance

        // Ensure canvas is available before trying to animate on it
        const canvas = document.querySelector('.parallax-canvas');
        if (!canvas) {
            console.warn("Parallax canvas not found for emoji animation.");
            return;
        }
        const canvasHeight = canvas.height;

        const numEmojis = 10;
        // Match these speeds to your background layers or make them slightly different
        // to appear between, in front of, or behind specific layers.
        // For simplicity, we'll make them generally fast to appear "in front" of most.
        const emojiParallaxFactors = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]; 

        for (let i = 0; i < numEmojis; i++) {
            // Randomize properties for variety
            const startXPercent = Math.random() * 90 + 5; // % across the screen (5% to 95%)
            const randomSize = 20 + Math.random() * 30; // px (20px to 50px)
            const animationDurationInMs = (3 + Math.random() * 4) * 1000; // Convert seconds to milliseconds
            const animationDelay = (Math.random() * 1.5) * 1000; // milliseconds (0s to 1.5s)
            const initialRotation = (Math.random() - 0.5) * 20; // Initial small rotation
            const targetRotation = initialRotation + (Math.random() - 0.5) * 180; // Target rotation change
            const chosenParallaxFactor = emojiParallaxFactors[Math.floor(Math.random() * emojiParallaxFactors.length)];

            activeCanvasEmojis.push({
                char: emojiChar,
                startXPercent: startXPercent,
                startY: canvasHeight + randomSize + (Math.random() * 50), // Start below canvas
                currentX: 0, // Will be calculated in draw loop
                currentY: 0, // Will be calculated in draw loop
                size: randomSize,
                opacity: 0,
                initialRotation: initialRotation,
                targetRotation: targetRotation,
                currentRotation: initialRotation,
                parallaxFactor: chosenParallaxFactor,
                animationStartTime: Date.now() + animationDelay,
                animationDuration: animationDurationInMs,
            });
        }
    }

    // updateFlyingEmojiScroll function is no longer needed as its logic is in drawParallax

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
    initEmojiHover();
 });