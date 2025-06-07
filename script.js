const isMobile = window.innerWidth <= 768;
const content = document.querySelector('.content');

if (!isMobile) {
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

    let loaded = 0;
    layers.forEach(layer => {
        layer.img.src = layer.src;
        layer.img.onload = () => {
            loaded++;
            if (loaded === layers.length) {
                resizeCanvas();
                drawParallax();
            }
        };
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawParallax();
    }
    window.addEventListener('resize', resizeCanvas);

    function drawParallax() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scrollX = content.scrollLeft;
        layers.forEach(layer => {
            const img = layer.img;
            if (!img.complete) return;
            const imgW = img.width;
            const imgH = img.height;
            const drawH = canvas.height;
            const drawW = imgW * (drawH / imgH);
            let x = -scrollX * layer.speed % drawW;
            if (x > 0) x -= drawW;
            const y = (canvas.height - drawH) / 2;
            for (; x < canvas.width; x += drawW) {
                ctx.drawImage(img, x, y, drawW, drawH);
            }
        });
    }

    content.addEventListener('scroll', () => {
        window.requestAnimationFrame(drawParallax);
    });

    resizeCanvas();
}

let isDown = false;
let startX, scrollLeft;

content.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - content.offsetLeft;
    scrollLeft = content.scrollLeft;
});

content.addEventListener("mouseleave", () => isDown = false);
content.addEventListener("mouseup", () => isDown = false);

content.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - content.offsetLeft;
    const walk = (x - startX) * 2;
    content.scrollLeft = scrollLeft - walk;
});

if (isMobile) {
    content.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX - content.offsetLeft;
        scrollLeft = content.scrollLeft;
    }, { passive: true });

    content.addEventListener("touchmove", (e) => {
        e.preventDefault(); 
        const x = e.touches[0].pageX - content.offsetLeft;
        const walk = (x - startX) * 2;
        content.scrollLeft = scrollLeft - walk;
    }, { passive: false });
}

function matchBoxHeights() {
    const statBox = document.querySelector('.stat-box');
    const aboutBox = document.querySelector('.about-box');
    if (statBox && aboutBox) {
        const maxHeight = Math.max(statBox.scrollHeight, aboutBox.scrollHeight);
        statBox.style.height = maxHeight + "px";
        aboutBox.style.height = maxHeight + "px";
    }
}

window.addEventListener("load", matchBoxHeights);
window.addEventListener("resize", matchBoxHeights);
