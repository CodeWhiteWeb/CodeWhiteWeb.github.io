const isMobile = window.innerWidth <= 768;
const content = document.querySelector('.content');


if (!isMobile) {
    window.addEventListener('wheel', function (e) {
        e.preventDefault();
        content.scrollLeft += e.deltaY; 
    }, { passive: false });

    
    content.addEventListener('scroll', function () {
        let scrollX = content.scrollLeft; 

        document.querySelector('.layer-1').style.backgroundPosition = `${-scrollX * 0.05}px 0`;
        document.querySelector('.layer-2').style.backgroundPosition = `${-scrollX * 0.1}px 0`;
        document.querySelector('.layer-3').style.backgroundPosition = `${-scrollX * 0.15}px 0`;
        document.querySelector('.layer-4').style.backgroundPosition = `${-scrollX * 0.2}px 0`;
        document.querySelector('.layer-5').style.backgroundPosition = `${-scrollX * 0.25}px 0`;
        document.querySelector('.layer-6').style.backgroundPosition = `${-scrollX * 0.3}px 0`;
    });
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
    });

    content.addEventListener("touchmove", (e) => {
        e.preventDefault(); 
        const x = e.touches[0].pageX - content.offsetLeft;
        const walk = (x - startX) * 2;
        content.scrollLeft = scrollLeft - walk;
    });
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
