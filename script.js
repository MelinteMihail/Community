const buttonLeft = document.querySelector('.left');
const buttonRight = document.querySelector('.right');
const title = document.querySelector('.title');
const tab = document.querySelector('.tab');
const tabWrapper = document.querySelector('.tab-wrapper');
const podiumParent = tab.querySelector('.podium-parent');

const secondTab = tab.cloneNode(true);
secondTab.className = 'second-tab';
tabWrapper.appendChild(secondTab);

let yearArray = [];
let currentYear = 0;
let savedData;
let selectedTeam = 1;

window.addEventListener("load", readDataFile);
secondTab.addEventListener('transitionend', () => updateYear());

for (const podium of podiumParent.querySelectorAll('.podium')) {
    const name = podium.querySelector('.name');
    podium.addEventListener('transitionend', () => {
        name.classList.add('active');
        name.style.transition = "opacity 0.25s ease-in-out";
    }); 
}

function readDataFile() {
    fetch("data/data.json")
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(handleData)
        .catch((error) => console.error("Fetch error:", error));
}

function handleData(data) {
    yearArray = Object.keys(data);
    savedData = data;
    currentYear = yearArray.length - 1;
    buttonLeft.disabled = true;
    buttonRight.disabled = true;
    updateYear();
}

buttonRight.addEventListener("click", () => {
    if (currentYear >= yearArray.length - 1) return;
    currentYear++;
    changeTab("right");
});

buttonLeft.addEventListener("click", () => {
    if (currentYear <= 0) return;
    currentYear--;
    changeTab("left");
});

function changeTab(direction) {
    const xTranslate = direction === "right" ? 100 : -100;

    updateTab(secondTab);
    secondTab.style.transition = "none";
    secondTab.style.transform = `translateX(${xTranslate}%)`;

    secondTab.offsetHeight;

    secondTab.style.transition = "transform 0.6s ease";
    secondTab.style.transform = "translateX(0)";

    buttonLeft.disabled = true;
    buttonRight.disabled = true;

    tab.style.transition = "transform 0.6s ease";
    tab.style.transform = `translateX(${-xTranslate}%)`;

    for (const name of podiumParent.querySelectorAll('name')) {
        name.classList.remove('active');
        name.style.transition = "none";
    }
}

function updateYear() {
    resetTabPositions();

    const yearKey = yearArray[currentYear];
    title.textContent = yearKey;

    if (currentYear < yearArray.length - 1)
        buttonRight.disabled = false;

    if (currentYear > 0)
        buttonLeft.disabled = false;

    for (const podium of podiumParent.querySelectorAll('.podium')) {
        podium.classList.remove('active');
        podium.style.transition = "none";

        void podium.offsetWidth;

        podium.style.transition = "height 0.6s cubic-bezier(0, 0.55, 0.45, 1)";
        podium.classList.add('active');
    }

    const podiums = podiumParent.querySelectorAll('.podium');

    podiums.forEach((podium, i) => {
        podium.classList.remove('active');
        podium.style.transition = "none";
        podium.offsetWidth;
        const name = podium.querySelector('.name');
        name.classList.remove('active');
        name.style.transition = "none";
        
        i++;
        const delay = i * 0.1 * (i % 2);
        podium.style.transition = `height 0.6s ${delay}s cubic-bezier(0, 0.55, 0.45, 1)`;
        podium.classList.add('active');
    });

    updateTab(tab);
}

function updateTab(selectedTab) {
    const yearKey = yearArray[currentYear];
    const h1Content = selectedTab.querySelector('.text');
    const first = selectedTab.querySelector('.first').querySelector('.name');
    const second = selectedTab.querySelector('.second').querySelector('.name');
    const third = selectedTab.querySelector('.third').querySelector('.name');

    h1Content.textContent = savedData[yearKey]["first"]["text"];
    first.textContent = savedData[yearKey]["first"]["name"];
    second.textContent = savedData[yearKey]["second"]["name"];
    third.textContent = savedData[yearKey]["third"]["name"];
}

function resetTabPositions() {
    secondTab.style.transition = "none";
    secondTab.style.transform = "translateX(100%)";

    tab.style.transition = "none";
    tab.style.transform = "translateX(0)";
}

function selectTeam(team) {
    selectTeam = team;

    
}