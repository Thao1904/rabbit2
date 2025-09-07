const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Mapbox Initialization
mapboxgl.accessToken = "pk.eyJ1Ijoia3VrdXRyb3MiLCJhIjoiY21mOXVmcWIzMDZnNDJscHZ5NDdyNjNoZiJ9.-0IL0drrDKV0v4Ss7OVgnw";
const map = new mapboxgl.Map({
    container: "map-container",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [106.6957, 10.782577],
    zoom: 15,
});
map.scrollZoom.disable();
map.dragPan.disable();
// Game State
let gameRunning = false;
let timer = 240; // Timer: 4 minutes
let charactersLeft = 0;
let intervalId;

// Main Character Configuration
const mainChar = {
    lng: 106.67236482883555,
    lat:10.78549826142816,
    direction: "down",
    spriteIndex: 0,
    speed: 0.0006,
};

const mainCharSprites = {
    left: ["Asset/hi/main_right_1.png", "Asset/hi/main_right_2.png", "Asset/hi/main_right_3.png"],
    right:  ["Asset/hi/main_left_1.png", "Asset/hi/main_left_2.png", "Asset/hi/main_left_3.png"],
    up: ["Asset/hi/main_up_1.png", "Asset/hi/main_up_2.png", "Asset/hi/main_up_3.png"],
    down:  ["Asset/hi/main_down_1.png", "Asset/hi/main_down_2.png", "Asset/hi/main_down_3.png"],
};

// Side Characters Configuration
const sideCharSprites = ["Asset/hi/1.png", "Asset/hi/2.png", "Asset/hi/3.png"];
const sideCharMetSprites = ["Asset/hi/4.png", "Asset/hi/5.png", "Asset/hi/6.png"];
const sideCharacters = [
    { lat: 10.730132543154971,
      lng: 106.72089739464411,
      met: false,
      text: "WELCOME TO FULBRIGHT UNIVERSITY VIETNAM",
      description: "Fulbright University in Ho Chi Minh City is an American-style liberal arts university offering world-class education. The campus fosters creativity and innovation with state-of-the-art facilities for students…",
      spriteIndex: 0,
      Img_src: "Asset/hi/location/fulbright.png" },
    { lat: 10.768616847521251,
        lng: 106.69723252489433,
        met: false,
        text: "WELCOME TO LITTLE EGG CAFÉ", 
        description: "Little Hanoi Egg Coffee is a hidden gem that serves the traditional Hanoi drink made with egg yolk, sugar, and coffee, offering a unique taste of Vietnamese coffee culture. Situated in a quiet corner…",
        spriteIndex: 0,
        Img_src: "Asset/hi/location/little_egg.png" },
    {
        lat: 10.777239261805084,
        lng: 106.68891807284692,
        met: false,
        text: "WELCOME TO THE COCOA PROJECT", 
        description: "Cocoa Project, located on Nguyễn Đình Chiểu, is a cozy café that blends sustainable architecture with the rich history of cacao. The café features cacao trees growing on-site and offers a wide selection …",
        spriteIndex: 0,
       Img_src: "Asset/hi/location/cocoa.png" },
 
   { 
 lat: 10.803889067686692, 
        lng: 106.73498326653761,
        met: false,
        text: "WELCOME TO THE HIVE CO-WORKING SPACE", 
        description: "The Hive Thao Dien is a premium co-working space in Ho Chi Minh City, providing various workspaces ranging from open hot desks to private offices. It’s known for fostering creativity, collaboration, …...",
        spriteIndex: 0,
        Img_src: "Asset/hi/location/the_hive.png" },
    {
 lat: 10.73145801944059, 
        lng: 106.71039755557922,
        met: false,
        text: "WELCOME TO BÚN BÒ VỸ DẠ XƯA", 
        description: "Bún Bò Vỹ Dạ Xưa is a renowned restaurant specializing in bún bò Huế, a spicy noodle dish made with beef shank and a rich broth. The restaurant prides itself on using bone broth for an authentic taste. …..",
        spriteIndex: 0,
        Img_src: "Asset/hi/location/bun_bo.png" },
    {
 lat: 10.784879715359668, 
        lng: 106.6789854960589,
        met: false,
        text: "WELCOME TO CƠM SƯỜN - CƠM TẤM 932P", 
        description: "Cơm Sườn 932P Trường Sa is a local gem that specializes in cơm tấm (broken rice) served with crispy grilled pork chops. Located on a bustling street in District 3, it offers affordable meals and authentic flavors. …..",
        spriteIndex: 0,
        Img_src: "Asset/hi/location/com_suon.png" },
    {
 lat: 10.772893284767788, 
        lng: 106.69328061086975,
        met: false,
        text: "WELCOME TO FLASH FITNESS NGUYEN DU", 
        description: "Nguyễn Du Gym is located at the Nguyễn Du Culture and Sports Center, a well-established venue known for providing comprehensive athletic facilities. The gym is equipped with specialized rooms and professional ….",
        spriteIndex: 0,
        Img_src: "Asset/hi/location/gym.png" },
 ];
 
 

let sideCharAnimationFrameCounter = 0;
const sideCharAnimationSpeed = 15; // Adjust for slower animation

// Animation Frame Counter for Main Character
let mainCharAnimationFrameCounter = 0;
const mainCharAnimationSpeed = 10; // Adjust for slower main character animation

// Start Menu Logic
document.getElementById("startGame").onclick = () => {
    document.getElementById("startMenu").classList.add("hidden");
    startGame();
};

document.getElementById("exitGame").onclick = () => alert("Game Closed!");

// End Menu Buttons
document.getElementById("playAgain").onclick = () => location.reload();

document.getElementById("continueExplore").onclick = () => {
    // Hide the end menu
    document.getElementById("endMenu").classList.add("hidden");
    
    // Reset game state
    gameRunning = true;
    timer = 5000; // Set the timer to 99999 seconds
    charactersLeft = sideCharacters.filter(char => !char.met).length;

    // Resume or start the game loop
    if (!intervalId) intervalId = setInterval(updateTimer, 1000);
    gameLoop();
};


// Timer Update
function updateTimer() {
    document.getElementById("timer").innerText = ` ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;
    document.getElementById("timer1").innerText = `Time Left: ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;
    document.getElementById("charCounter").innerText = ` ${charactersLeft} Places Left`;
    if (timer <= 0 || charactersLeft === 0) endGame();
    timer--;
}

// Start Game
function startGame() {
    gameRunning = true;
    timer = 45;
    charactersLeft = sideCharacters.length;
    intervalId = setInterval(updateTimer, 1000);
    gameLoop();
}

// End Game
function endGame() {
    clearInterval(intervalId);
    gameRunning = false;
    document.getElementById("endMenu").classList.remove("hidden");
    document.getElementById("endMessage").innerText = charactersLeft
    ? "The clock stops, the rush pauses. The day feels incomplete, but was it ever about finishing? When you try again tomorrow, what will you do differently?"

             : "You’ve made it to the end of your day. The journey is complete, but what did you take away: the memories, or the checkmarks?";
}

// Movement Logic
window.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft") mainChar.lng -= mainChar.speed, mainChar.direction = "left";
    if (e.key === "ArrowRight") mainChar.lng += mainChar.speed, mainChar.direction = "right";
    if (e.key === "ArrowUp") mainChar.lat += mainChar.speed, mainChar.direction = "up";
    if (e.key === "ArrowDown") mainChar.lat -= mainChar.speed, mainChar.direction = "down";

    map.setCenter([mainChar.lng, mainChar.lat]);
});

function updateStayButtonOpacity() {
    const stayButton = document.getElementById("stayButton");
    if (timer < 120) {
        stayButton.style.opacity = "0.3";
    } else {
        stayButton.style.opacity = "1"; // Reset opacity when the timer is not below 120
    }
}

// Draw Main Character
function drawMainCharacter() {
    mainCharAnimationFrameCounter++;
    if (mainCharAnimationFrameCounter >= mainCharAnimationSpeed) {
        mainChar.spriteIndex = (mainChar.spriteIndex + 1) % 3;
        mainCharAnimationFrameCounter = 0;
    }

    const sprite = new Image();
    sprite.src = mainCharSprites[mainChar.direction][mainChar.spriteIndex];
    ctx.drawImage(sprite, canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 50);
}

function drawSideCharacters() {
    sideCharAnimationFrameCounter++;

    sideCharacters.forEach((char) => {
        const position = map.project([char.lng, char.lat]);
        const x = position.x - map.project([mainChar.lng, mainChar.lat]).x + canvas.width / 2;
        const y = position.y - map.project([mainChar.lng, mainChar.lat]).y + canvas.height / 2;

        const sprites = char.met ? sideCharMetSprites : sideCharSprites; // Show a "met" sprite if applicable

        const img = new Image();
        img.src = sprites[char.spriteIndex];
        ctx.drawImage(img, x - 25, y - 25, 50, 50);

        if (sideCharAnimationFrameCounter >= sideCharAnimationSpeed) {
            char.spriteIndex = (char.spriteIndex + 1) % sprites.length;
        }

        const distance = Math.hypot(mainChar.lng - char.lng, mainChar.lat - char.lat);
        if (distance < 0.0008 && !char.met) {
            char.met = true; // Mark as met
           
            
            charactersLeft--;
            showStoryModal(char.text, char.description, char.Img_src);

            setTimeout(() => {
                char.met = false;
            }, 15000);
        }
    });

    if (sideCharAnimationFrameCounter >= sideCharAnimationSpeed) {
        sideCharAnimationFrameCounter = 0;
    }
}
function showStoryModal(text, description, Img_src) {
    document.getElementById("storyText").innerText = text;
    document.getElementById("storyDescription").innerText = description;
    document.getElementById("storyImage").classList.remove("hidden");

    // Store the image source temporarily for "STAY" button action
    document.getElementById("stayButton").dataset.imgSrc = Img_src;

    document.getElementById("storyModal").classList.remove("hidden");
    document.getElementById("overlay").classList.add("hidden");

}

function showStoryExpandedModal(Img_src) {
    console.log("show expanded")
    document.getElementById("mau").src = "/mau.jpg"
}

document.getElementById("closeStory").onclick = () => {
    document.getElementById("storyModal").classList.add("hidden");
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("storyImage").classList.add("hidden");

};

document.getElementById("closeExpand").onclick = () => {
    document.getElementById("expanded_modal").classList.add("hidden");
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("storyImage").classList.add("hidden");

};

document.getElementById("stayButton").onclick = () => {
    const imgSrc = document.getElementById("stayButton").dataset.imgSrc; // Retrieve stored image source
    const mauImage = document.getElementById("mau");
    document.getElementById("storyImage").classList.add("hidden");
    
    // Update the 'src' attribute and display the image
    mauImage.src = imgSrc;
    mauImage.classList.remove("hidden");
    document.getElementById("expanded_modal").classList.remove("hidden");
    // Hide the modal and bring back the overlay
    document.getElementById("storyModal").classList.add("hidden");
    document.getElementById("overlay").classList.remove("hidden");
};


function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

function calculateAngle(target) {
    const dx = target.lng - mainChar.lng;
    const dy = target.lat - mainChar.lat;
    return Math.atan2(dy, dx) * (180 / Math.PI);
}

function drawArrows() {
    sideCharacters.forEach((char) => {
        if (char.met) return; // Skip if the character is already met

        // Calculate distance
        char.distance = calculateDistance(mainChar.lat, mainChar.lng, char.lat, char.lng);

        // If close to the character, skip drawing an arrow
        if (char.distance < 20) return;

        // Calculate angle and position
        const angle = calculateAngle(char);
        const radians = toRadians(angle);

        const offsetX = Math.cos(radians) * 100; // Distance from the center
        const offsetY = Math.sin(radians) * 100;

        // Arrow position relative to canvas center
        const arrowX = canvas.width / 2 + offsetX;
        const arrowY = canvas.height / 2 + offsetY;

        // Draw Arrow
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(radians); // Rotate based on angle
      
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw Distance Label
        ctx.fillStyle = '#fb127f';
        ctx.font = 'bold 14px Montserrat'; // Add 'bold' before the font size
        ctx.fillText(`${Math.round(char.distance)}m`, arrowX - 15, arrowY - 20);
        
    });
}


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSideCharacters();
    drawMainCharacter();
    drawArrows(); // Add this to display arrows dynamically
    updateStayButtonOpacity();
    if (gameRunning) requestAnimationFrame(gameLoop);
}

