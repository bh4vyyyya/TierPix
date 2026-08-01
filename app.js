/**
 * TierPix 2D Brutalist Engine - Calm, Smooth, & Satisfying Rating Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- App Constants & State ---
    const BUFFER_SIZE = 3;
    const MAX_VISIBLE_PER_TIER = 50;
    const MAX_SEEN_URLS = 500;

    const ambientMoods = ['NORMAL', 'DREAMCORE', 'LIMINAL', 'RETRO TECH', 'CYBERPUNK', 'INDUSTRIAL', 'CHAOS'];
    const chaosRules = ['MONOCHROME ONLY', 'ANCIENT MAPS ONLY', 'FOOD ONLY', 'THINGS WITH EYES ONLY', 'ABANDONED PLACES ONLY'];

    const state = {
        keywords: [],
        currentImage: null,
        imageBuffer: [],
        seenUrls: new Set(),
        seenImageIds: new Set(),
        keywordUsageMap: {},
        recentTagsBuffer: [],
        categoryRotationIndex: 0,
        imagesSinceChaos: 0,
        nextChaosInterval: 7,
        ratedImages: [],
        streak: 0,
        ratedCount: 0,
        soundEnabled: true,
        theme: 'light',
        panelWidthPercent: 52,
        isTransitioning: false,
        draggedItemId: null,
        expandedTiers: {},
        collectibles: [],
        curiosityProfile: { liked: [], hated: [] },
        chaosModeActive: false,
        chaosModeRule: null,
        chaosModeRemaining: 0,
        abyssModeActive: false,
        abyssModeRemaining: 0,
        rabbitHoleQueue: [],
        ambientMoodIndex: 0
    };

    // --- CATEGORIZED TAXONOMY PROMPT POOLS FOR DYNAMIC CATEGORY HOPPING ---
    const cozyPrompts = [
        "sleepy kitten", "golden retriever puppy", "baby rabbit", "tiny hamster", "fluffy duckling",
        "sleeping fox", "cute panda", "baby otter", "capybara relaxing", "shiba inu smiling",
        "cozy cottage", "rainy window", "warm fireplace", "sunlit reading nook", "flower meadow",
        "cherry blossom path", "lavender field", "peaceful lakeside", "forest cabin", "mountain sunrise",
        "tea cup aesthetic", "hot chocolate", "fresh baked bread", "cozy bookstore", "cat cafe",
        "cute plushies", "kawaii stationery", "pastel bedroom", "fairy garden", "sleepy village",
        "studio ghibli scenery", "cozy pixel art", "cottagecore", "pastel clouds", "cute bakery",
        "frog on lily pad", "sleepy corgi", "duck pond", "cozy autumn cafe", "tiny flower shop"
    ];

    const scifiPrompts = [
        "cyberpunk neon alleyway", "cybernetic arm joint", "cyberpunk flying taxi", "solarpunk greenhouse skyscraper",
        "solarpunk wind turbine garden", "solarpunk stained glass solar panel", "dieselpunk armored limousine",
        "dieselpunk monowheel tank", "dieselpunk armored zeppelin", "atompunk bubble top concept car",
        "atompunk retro rocket pad", "megastructure Dyson sphere segment", "megastructure O'Neill cylinder landscape",
        "space colony Martian dome farm", "alien ecosystem bioluminescent forest", "terraforming colony",
        "robot graveyard", "drone swarm", "cybernetic raven", "victorian automaton"
    ];

    const historyPrompts = [
        "ancient observatory", "sunken temple", "buried city", "lost civilization", "stone monolith",
        "mysterious cave painting", "forgotten manuscript", "ancient map", "ritual mask", "bronze age artifact",
        "ancient Sumerian clay tablet", "Mayan obsidian sacrificial mirror", "Egyptian faience scarab",
        "Byzantine gold icon plaque", "Celtic bronze torc", "Viking silver ingot", "occult astrolabe",
        "alchemical parchment diagram", "medieval scientific manuscript", "ancient astronomical sphere"
    ];

    const naturePrompts = [
        "deep sea creature", "anglerfish", "giant squid", "bioluminescent jellyfish", "ice cave",
        "lava tube", "salt flats", "mushroom forest", "glowing crystal cavern", "foggy swamp",
        "deep sea hatchetfish bioluminescence", "siphonophore colony ocean trench", "vampire squid underwater",
        "radiolarian electron microscope shell", "diatom glass shell pattern", "bioluminescent mushroom cluster",
        "blue ice cavern Iceland", "volcanic lava tube cavern", "salt flat mirror sky reflection"
    ];

    const weirdcorePrompts = [
        "dreamcore floating door", "dreamcore eye in the sky", "dreamcore static television field",
        "dreamcore pastel void", "dreamcore infinite staircase", "weirdcore low resolution playground",
        "weirdcore distorted angel", "weirdcore vintage textbook illustration", "weirdcore rainbow void",
        "analog horror emergency broadcast screen", "analog horror distorted face tape",
        "analog horror security camera footage", "analog horror vintage orientation video",
        "liminal hallway", "liminal airport terminal 3am", "liminal hotel corridor", "liminal backrooms carpet"
    ];

    const obsoleteTechPrompts = [
        "vacuum tube computer", "cassette player", "crt monitor", "floppy disk collection",
        "retro operating system", "mainframe terminal", "punch card machine", "experimental prototype",
        "industrial control panel", "analog synthesizer", "Nixie tube clock array",
        "vacuum tube audio amplifier", "mainframe magnetic tape reel", "cathode ray tube oscilloscope",
        "dial-up modem circuit board", "obsolete floppy disk tower", "rotary telephone exchange",
        "Frutiger Aero water bubble desktop", "Frutiger Aero glassy green orb", "Y2K metallic silver cyber visor"
    ];
    const surrealPrompts = [
        "abandoned soviet bus", "neon frog sculpture", "1960s dental equipment", "medieval duck illustration", 
        "underwater mailbox", "cursed mannequin", "glitch cyber skull", "retro astronaut", "brutalist architecture", 
        "liminal hallway", "vintage arcade cabinet", "ancient alchemy diagram", "floating monolith", "quantum reactor",
        "cybernetic raven", "victorian automaton", "deep sea bioluminescence", "steampunk locomotive",
        "abandoned shopping mall", "forgotten subway station", "underground bunker", "flooded library",
        "deserted amusement park", "overgrown greenhouse", "empty classroom", "neon alleyway", "retro computer lab",
        "ancient observatory", "sunken temple", "buried city", "lost civilization", "stone monolith",
        "mysterious cave painting", "forgotten manuscript", "ancient map", "ritual mask", "bronze age artifact",
        "vacuum tube computer", "cassette player", "crt monitor", "floppy disk collection", "retro operating system",
        "mainframe terminal", "punch card machine", "experimental prototype", "industrial control panel", "analog synthesizer",
        "deep sea creature", "anglerfish", "giant squid", "bioluminescent jellyfish", "ice cave", "lava tube",
        "salt flats", "mushroom forest", "glowing crystal cavern", "foggy swamp", "strange invention", "failed technology",
        "concept vehicle", "prototype aircraft", "clockwork automaton", "mechanical calculator", "robot graveyard",
        "drone swarm", "alien ecosystem", "terraforming colony", "cursed advertisement", "haunted amusement ride",
        "upside down house", "infinite staircase", "floating island village", "giant rubber duck factory",
        "abandoned waterpark", "underwater mailbox", "cathedral made of ice", "robot repairing robot",
        "museum of obsolete technology", "interdimensional train station", "moon farming colony", "forgotten arcade machine", "deserted spaceport"
    ];

    const archaeologyPrompts = [
        "geocities page", "2000s meme", "old forum screenshot", "flash game screenshot", 
        "y2k graphics", "pixel blog banner", "90s website", "retro desktop background",
        "retro operating system", "mainframe terminal", "punch card machine", "floppy disk collection",
        "crt monitor wallpaper", "analog synthesizer panel", "forgotten website design", "geocities gif banner",
        "flash animation sprite", "internet history artifact", "vintage computer lab", "mechanical calculator"
    ];

    const timeTravelPrompts = [
        "1850s photography", "1900s advertisement", "1950s blueprint", "WW2 technical manual", 
        "vintage packaging", "ancient world map", "victorian portrait", "1970s magazine page",
        "bronze age artifact", "forgotten manuscript", "ritual mask", "ancient observatory",
        "sunken temple ruins", "stone monolith engraving", "alchemical parchment", "medieval scientific diagram",
        "obsolete patent drawing", "vintage propaganda poster", "steampunk device schematic"
    ];

    const abyssPrompts = [
        "bizarre museum exhibit", "obscure patent 1800s", "weird historical invention", 
        "unusual architectural anomaly", "strange anatomical illustration", "mysterious relic",
        "cursed advertisement", "haunted amusement ride", "upside down house", "infinite staircase",
        "robot repairing robot", "museum of obsolete technology", "deep sea hatchetfish", "bioluminescent comb jelly",
        "microscopic tardigrade electron micrograph", "failed prototype aircraft", "mechanical automaton internal clockwork"
    ];

    const randomDictionary = [
        // --- COZY & WHOLESOME AESTHETICS ---
        "sleepy kitten", "golden retriever puppy", "baby rabbit", "tiny hamster", "fluffy duckling",
        "sleeping fox", "cute panda", "baby otter", "capybara relaxing", "shiba inu smiling",
        "cozy cottage", "rainy window", "warm fireplace", "sunlit reading nook", "flower meadow",
        "cherry blossom path", "lavender field", "peaceful lakeside", "forest cabin", "mountain sunrise",
        "tea cup aesthetic", "hot chocolate", "fresh baked bread", "cozy bookstore", "cat cafe",
        "cute plushies", "kawaii stationery", "pastel bedroom", "fairy garden", "sleepy village",
        "studio ghibli scenery", "cozy pixel art", "cottagecore", "pastel clouds", "cute bakery",
        "frog on lily pad", "sleepy corgi", "duck pond", "cozy autumn cafe", "tiny flower shop",
        "sleepy kitten in blanket", "golden retriever puppy in meadow", "baby rabbit in clover",
        "tiny hamster eating seed", "fluffy duckling swimming", "sleeping fox in snowfall",
        "cute panda resting on bamboo", "baby otter floating on back", "capybara in warm bath",
        "cozy bookstore wooden shelves", "rainy window coffee cup", "sunlit reading nook armchair",

        // --- ABANDONED PLACES & LIMINAL SPACES ---
        "abandoned shopping mall", "forgotten subway station", "underground bunker", "flooded library",
        "deserted amusement park", "overgrown greenhouse", "liminal hallway", "empty classroom",
        "neon alleyway", "retro computer lab", "abandoned soviet bus", "abandoned soviet rally car",
        "abandoned arctic research station", "abandoned radar dome", "abandoned submarine pen",
        "abandoned hydrofoil", "abandoned offshore oil rig", "abandoned textile mill",
        "abandoned grain elevator", "abandoned sanatorium ward", "abandoned cinema balcony",
        "flooded subway station", "flooded marble temple", "flooded train depot", "flooded ballroom crypt",
        "liminal airport terminal 3am", "liminal hotel corridor", "liminal indoor pool at night",
        "liminal backrooms carpet", "liminal bowling alley neon", "liminal empty mall atrium",
        "liminal fluorescent office", "liminal school gymnasium", "liminal yellow staircase",

        // --- ANCIENT CIVILIZATIONS & ARTIFACTS ---
        "ancient observatory", "sunken temple", "buried city", "lost civilization", "stone monolith",
        "mysterious cave painting", "forgotten manuscript", "ancient map", "ritual mask", "bronze age artifact",
        "ancient Sumerian clay tablet", "Mayan obsidian sacrificial mirror", "Egyptian faience scarab",
        "Byzantine gold icon plaque", "Celtic bronze torc", "Viking silver ingot", "occult astrolabe",
        "alchemical parchment diagram", "medieval scientific manuscript", "ancient astronomical sphere",

        // --- OBSOLETE ELECTRONICS & RETRO TECH ---
        "vacuum tube computer", "cassette player", "crt monitor", "floppy disk collection",
        "retro operating system", "mainframe terminal", "punch card machine", "experimental prototype",
        "industrial control panel", "analog synthesizer", "Nixie tube clock array",
        "vacuum tube audio amplifier", "mainframe magnetic tape reel", "cathode ray tube oscilloscope",
        "dial-up modem circuit board", "obsolete floppy disk tower", "rotary telephone exchange",
        "Frutiger Aero water bubble desktop", "Frutiger Aero glassy green orb", "Frutiger Aero aurora desktop",
        "Y2K metallic silver cyber visor", "Y2K clear blue translucent gameboy", "Cassette Futurism orange LED deck",
        "Soviet brutalist bus stop monument", "Soviet space race cosmonaut helmet", "Soviet cybernetics console",

        // --- DEEP SEA & BIOLUMINESCENT LIFE ---
        "deep sea creature", "anglerfish", "giant squid", "bioluminescent jellyfish", "ice cave",
        "lava tube", "salt flats", "mushroom forest", "glowing crystal cavern", "foggy swamp",
        "deep sea hatchetfish bioluminescence", "siphonophore colony ocean trench", "vampire squid underwater",
        "radiolarian electron microscope shell", "diatom glass shell pattern", "bioluminescent mushroom cluster",
        "blue ice cavern Iceland", "volcanic lava tube cavern", "salt flat mirror sky reflection",

        // --- STRANGE INVENTIONS & SCI-FI ---
        "strange invention", "failed technology", "concept vehicle", "prototype aircraft",
        "clockwork automaton", "mechanical calculator", "robot graveyard", "drone swarm",
        "alien ecosystem", "terraforming colony", "cursed advertisement", "haunted amusement ride",
        "upside down house", "infinite staircase", "floating island village", "giant rubber duck factory",
        "abandoned waterpark", "underwater mailbox", "cathedral made of ice", "robot repairing robot",
        "museum of obsolete technology", "interdimensional train station", "moon farming colony",
        "forgotten arcade machine", "deserted spaceport", "dieselpunk armored limousine",
        "dieselpunk monowheel tank", "solarpunk greenhouse skyscraper", "solarpunk wind turbine garden",
        "atompunk bubble top concept car", "megastructure Dyson sphere segment", "megastructure O'Neill cylinder",

        // --- CORE ARTISTIC & POPULAR STYLES ---
        "anime", "cyberpunk", "synthwave", "mecha", "manga", "pixel art", "comic", "fantasy", "steampunk", "gothic", 
        "chibi", "vaporwave", "rpg", "retro gaming", "kawaii", "samurai", "ninja", "kaiju", "vtuber", "arcade",
        "painting", "sketch", "diagram", "logo", "blueprint", "concept art", "poster", "graffiti", "sculpture", 
        "tattoo", "typography", "pattern", "sticker", "mosaic", "portrait", "glitch art", "stained glass", "origami",
        "oil painting", "watercolor", "line art", "charcoal drawing", "calligraphy", "vector art", "woodcut", "surrealism",
        "cubism", "impressionism", "pop art", "minimalism", "doodle", "fresco", "low poly", "voxel",
        "galaxy", "nebula", "astronomy", "hologram", "space station", "supernova", "planet", "black hole", "telescope",
        "asteroid", "alien", "astronaut", "constellation", "solar flare", "lunar crater", "milky way", "satellite",
        "architecture", "castle", "ruins", "skyscraper", "lighthouse", "bridge", "cathedral", "monument", "pyramid",
        "pagoda", "bunker", "greenhouse", "windmill", "observatory", "aqueduct", "fortress", "cabin", "dystopian city",
        "robot", "circuit", "microscope", "cyborg", "drone", "laboratory", "quantum", "laser", "dna", "server room",
        "mainframe", "motherboard", "radar", "holograph", "nanotech", "supercomputer", "particle accelerator",
        "supercar", "aircraft", "vintage car", "steam engine", "submarine", "helicopter", "locomotive", "hovercraft",
        "spaceship", "motorcycle", "armored tank", "zeppelin", "sailboat", "rocket", "monster truck", "drone vehicle",
        "monster", "creature", "dinosaur", "mythology", "underwater", "coral reef", "dragon", "phoenix", "griffin",
        "chameleon", "jellyfish", "owl", "wolf", "falcon", "panther", "whale", "mantis", "fox", "axolotl",
        "volcano", "crystal", "bioluminescence", "waterfall", "glacier", "desert dunes", "rainforest", "aurora borealis",
        "lightning", "canyon", "geysers", "tsunami", "cave", "autumn forest", "tundra", "cherry blossom", "swamp",
        "ancient artifact", "hieroglyphics", "knight", "viking", "pharaoh", "spartan", "pirate ship", "catacombs",
        "tomb", "manuscript", "relic", "armor", "fossil", "amulet", "scroll", "medieval castle", "runes",
        "weapon", "food", "hourglass", "compass", "lantern", "mask", "throne", "mirror", "crown",
        "chest", "key", "potion", "crystal ball", "pocket watch", "shield", "telescope lens", "microchip"
    ];

    // --- DOM ELEMENT CACHE ---
    const dom = {
        appViewport: document.querySelector('.app-viewport'),
        leftPanel: document.getElementById('left-panel'),
        panelResizer: document.getElementById('panel-resizer'),
        imageStage: document.getElementById('image-stage'),
        randomImage: document.getElementById('random-image'),
        loader: document.getElementById('loader'),
        imgSourceTag: document.getElementById('img-source-tag'),
        imgIdTag: document.getElementById('img-id-tag'),
        imgLicenseTag: document.getElementById('img-license-tag'),
        stageRarityBadge: document.getElementById('stage-rarity-badge'),
        stageEventBanner: document.getElementById('stage-event-banner'),
        eventBannerText: document.getElementById('event-banner-text'),
        secretCollectibleBadge: document.getElementById('secret-collectible-badge'),
        stageStampOverlay: document.getElementById('stage-stamp-overlay'),
        keywordInput: document.getElementById('keyword-input'),
        btnAddKw: document.getElementById('btn-add-kw'),
        activeKwChips: document.getElementById('active-kw-chips'),
        btnSkip: document.getElementById('btn-skip'),
        btnCopyUrl: document.getElementById('btn-copy-url'),
        btnOpenOriginal: document.getElementById('btn-open-original'),
        statTotal: document.getElementById('stat-total'),
        statStreak: document.getElementById('stat-streak'),
        streakVal: document.getElementById('streak-val'),
        btnSoundToggle: document.getElementById('btn-sound-toggle'),
        soundIconHolder: document.getElementById('sound-icon-holder'),
        btnThemeToggle: document.getElementById('btn-theme-toggle'),
        themeIconHolder: document.getElementById('theme-icon-holder'),
        btnCollectiblesToggle: document.getElementById('btn-collectibles-toggle'),
        collectiblesCount: document.getElementById('collectibles-count'),
        btnExport: document.getElementById('btn-export'),
        btnClearAll: document.getElementById('btn-clear-all'),
        ratingButtonsRow: document.querySelector('.rating-buttons-row'),
        tierChartGrid: document.getElementById('tier-chart-grid'),
        tierContents: {
            S: document.getElementById('tier-content-S'),
            A: document.getElementById('tier-content-A'),
            B: document.getElementById('tier-content-B'),
            C: document.getElementById('tier-content-C'),
            D: document.getElementById('tier-content-D'),
            F: document.getElementById('tier-content-F')
        },
        previewModal: document.getElementById('preview-modal'),
        modalImg: document.getElementById('modal-img'),
        modalTierBadge: document.getElementById('modal-tier-badge'),
        modalDate: document.getElementById('modal-date'),
        modalLicenseLink: document.getElementById('modal-license-link'),
        modalUrlText: document.getElementById('modal-url-text'),
        modalExternalLink: document.getElementById('modal-external-link'),
        modalDeleteBtn: document.getElementById('modal-delete-btn'),
        modalRerateBtns: document.getElementById('modal-rerate-btns'),
        modalClose: document.getElementById('modal-close'),
        collectiblesModal: document.getElementById('collectibles-modal'),
        collectiblesModalClose: document.getElementById('collectibles-modal-close'),
        collectiblesGrid: document.getElementById('collectibles-grid'),
        toastContainer: document.getElementById('toast-container'),
        fxCanvas: document.getElementById('fx-canvas')
    };

    // --- INTERACTIVE PANEL RESIZER DRAG CONTROLLER (60 FPS rAF LOCKED) ---
    function initPanelResizer() {
        if (!dom.leftPanel || !dom.panelResizer) return;

        let isDragging = false;
        let rafId = null;

        dom.panelResizer.addEventListener('mousedown', () => {
            isDragging = true;
            dom.panelResizer.classList.add('is-dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
                const containerWidth = window.innerWidth;
                let newPercent = (e.clientX / containerWidth) * 100;

                if (newPercent < 25) newPercent = 25;
                if (newPercent > 75) newPercent = 75;

                dom.leftPanel.style.width = `${newPercent}%`;
                state.panelWidthPercent = newPercent;
                scheduleSaveToLocalStorage();
            });
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (rafId) cancelAnimationFrame(rafId);
                dom.panelResizer.classList.remove('is-dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    // --- GENTLE FLOATING SCORE POP ---
    function spawnFloatingTextPop(x, y, text, tier = 'S') {
        const pop = document.createElement('div');
        pop.className = 'floating-text-pop';
        pop.textContent = text;
        pop.style.left = `${x}px`;
        pop.style.top = `${y}px`;

        const tierColors = { S: '#e11d48', A: '#f97316', B: '#eab308', C: '#22c55e', D: '#3b82f6', F: '#4b5563' };
        if (tierColors[tier]) pop.style.color = tierColors[tier];

        document.body.appendChild(pop);

        setTimeout(() => {
            pop.remove();
        }, 800);
    }

    // --- RARITY CALCULATOR ---
    function calculateImageRarity(seedStr) {
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = (hash << 5) - hash + seedStr.charCodeAt(i);
            hash |= 0;
        }
        const val = Math.abs(hash) % 100;
        if (val < 1) return { text: 'CURSED', class: 'rarity-cursed' };
        if (val < 5) return { text: 'LEGENDARY', class: 'rarity-legendary' };
        if (val < 15) return { text: 'RARE', class: 'rarity-rare' };
        if (val < 40) return { text: 'UNCOMMON', class: 'rarity-uncommon' };
        return { text: 'COMMON', class: 'rarity-common' };
    }

    // --- NON-BLOCKING THROTTLED STORAGE PERSISTENCE ---
    let saveTimeout = null;
    function scheduleSaveToLocalStorage() {
        if (saveTimeout) return;
        saveTimeout = setTimeout(() => {
            saveTimeout = null;
            const runSave = () => {
                try {
                    const seenUrlsArray = Array.from(state.seenUrls).slice(-200);
                    localStorage.setItem('tierpix_brutal_pure_data', JSON.stringify({
                        keywords: state.keywords,
                        seenUrls: seenUrlsArray,
                        ratedImages: state.ratedImages,
                        streak: state.streak,
                        ratedCount: state.ratedCount,
                        soundEnabled: state.soundEnabled,
                        theme: state.theme,
                        panelWidthPercent: state.panelWidthPercent,
                        collectibles: state.collectibles,
                        curiosityProfile: state.curiosityProfile
                    }));
                } catch (e) {
                    console.warn('Storage save error:', e);
                }
            };

            if ('requestIdleCallback' in window) {
                requestIdleCallback(runSave, { timeout: 1000 });
            } else {
                runSave();
            }
        }, 1500);
    }

    // --- DARK / LIGHT THEME CONTROLLER ---
    function updateThemeUI() {
        document.body.classList.toggle('dark-theme', state.theme === 'dark');
        if (!dom.themeIconHolder) return;

        if (state.theme === 'dark') {
            dom.themeIconHolder.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
            `;
        } else {
            dom.themeIconHolder.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
            `;
        }
    }

    // --- CALM & GENTLE PARTICLE SPARKLE ENGINE (BUG-FREE & LEAK-PROOF) ---
    const fxCtx = dom.fxCanvas.getContext('2d');
    let particles = [];
    let particleRafId = null;
    let resizeRafId = null;
    const MAX_PARTICLES = 80;

    function resizeCanvas() {
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(() => {
            dom.fxCanvas.width = window.innerWidth;
            dom.fxCanvas.height = window.innerHeight;
            resizeRafId = null;
        });
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    function triggerParticlePop(x, y, tier = 'S') {
        const count = 12;
        const paletteMap = {
            S: ['#facc15', '#ffffff'],
            A: ['#f97316', '#ffffff'],
            B: ['#eab308', '#ffffff'],
            C: ['#22c55e', '#ffffff'],
            D: ['#3b82f6', '#ffffff'],
            F: ['#4b5563', '#ffffff']
        };
        const colors = paletteMap[tier] || paletteMap.S;

        const startX = x || window.innerWidth / 2;
        const startY = y || window.innerHeight / 2;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 1;
            particles.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                size: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.025 + 0.015
            });
        }

        if (particles.length > MAX_PARTICLES) {
            particles.splice(0, particles.length - MAX_PARTICLES);
        }

        if (!particleRafId) {
            particleRafId = requestAnimationFrame(animateParticles);
        }
    }

    function animateParticles() {
        if (particles.length === 0) {
            fxCtx.clearRect(0, 0, dom.fxCanvas.width, dom.fxCanvas.height);
            particleRafId = null;
            return;
        }

        fxCtx.clearRect(0, 0, dom.fxCanvas.width, dom.fxCanvas.height);

        let writeIdx = 0;
        const len = particles.length;

        for (let i = 0; i < len; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.alpha -= p.decay;

            if (p.alpha > 0) {
                fxCtx.fillStyle = p.color;
                fxCtx.strokeStyle = '#000';
                fxCtx.lineWidth = 1.5;
                fxCtx.globalAlpha = p.alpha;

                fxCtx.fillRect(p.x, p.y, p.size, p.size);
                fxCtx.strokeRect(p.x, p.y, p.size, p.size);

                particles[writeIdx++] = p;
            }
        }

        particles.length = writeIdx;
        fxCtx.globalAlpha = 1;

        if (particles.length > 0) {
            particleRafId = requestAnimationFrame(animateParticles);
        } else {
            particleRafId = null;
        }
    }

    // --- SOOTHING WARM WEB AUDIO SFX ENGINE (AUTOPLAY & RESUME SAFE) ---
    let audioCtx = null;
    let lastSoundTime = 0;

    function initOrResumeAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') {
            audioCtx.resume().catch(() => {});
        }
    }

    const unlockAudioOnGesture = () => {
        initOrResumeAudioContext();
        window.removeEventListener('pointerdown', unlockAudioOnGesture);
        window.removeEventListener('keydown', unlockAudioOnGesture);
    };
    window.addEventListener('pointerdown', unlockAudioOnGesture, { passive: true });
    window.addEventListener('keydown', unlockAudioOnGesture, { passive: true });

    function playSound(tier, streakCount = 0) {
        if (!state.soundEnabled) return;

        const now = Date.now();
        if (now - lastSoundTime < 120) return;
        lastSoundTime = now;

        try {
            initOrResumeAudioContext();
            if (!audioCtx || audioCtx.state !== 'running') return;

            const ctxTime = audioCtx.currentTime;

            if (tier === 'skip') {
                playSingleTone(880, ctxTime, 0.08, 'sine', 0.20);
                return;
            }

            if (tier === 'S') {
                playSoftChime([1046.50, 1318.51, 1567.98, 2093.00], ctxTime, 0.25);
            } else if (tier === 'A') {
                playSoftChime([880.00, 1108.73, 1318.51], ctxTime, 0.22);
            } else if (tier === 'B') {
                playSingleTone(783.99, ctxTime, 0.15, 'sine', 0.22);
            } else if (tier === 'C') {
                playSingleTone(659.25, ctxTime, 0.15, 'sine', 0.20);
            } else if (tier === 'D') {
                playSingleTone(523.25, ctxTime, 0.15, 'sine', 0.18);
            } else if (tier === 'F') {
                playSingleTone(392.00, ctxTime, 0.18, 'triangle', 0.18);
            }

        } catch (e) {
            console.warn('Web Audio playback error:', e);
        }
    }

    function playSingleTone(freq, ctxTime, duration, type = 'sine', maxVol = 0.20) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctxTime);
        gain.gain.setValueAtTime(maxVol, ctxTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + duration);

        osc.start(ctxTime);
        osc.stop(ctxTime + duration);
    }

    function playSoftChime(freqs, ctxTime, maxVol = 0.22) {
        if (!audioCtx) return;
        freqs.forEach((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const noteTime = ctxTime + (idx * 0.04);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, noteTime);
            gain.gain.setValueAtTime(maxVol, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

            osc.start(noteTime);
            osc.stop(noteTime + 0.18);
        });
    }

    // --- INPUT SANITIZATION & SECURITY UTILITIES ---
    function sanitizeKeyword(raw) {
        if (typeof raw !== 'string') return '';
        return raw
            .replace(/<[^>]*>?/gm, '')
            .replace(/[^\w\s\-\.\#\:\/\?\=]/gi, '')
            .trim()
            .slice(0, 40);
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- FETCH TIMEOUT & CANCELABLE NETWORK CONTROLLER ---
    const FETCH_TIMEOUT_MS = 2500;
    let streamAbortController = new AbortController();

    async function fetchWithTimeout(resource, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        const onStreamAbort = () => controller.abort();
        streamAbortController.signal.addEventListener('abort', onStreamAbort, { once: true });

        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            streamAbortController.signal.removeEventListener('abort', onStreamAbort);
            return response;
        } catch (error) {
            clearTimeout(id);
            streamAbortController.signal.removeEventListener('abort', onStreamAbort);
            throw error;
        }
    }

    // --- INTELLIGENT DISCOVERY & TAXONOMY ENGINES ---
    const categoryPools = [
        { name: 'COZY', pool: cozyPrompts },
        { name: 'SCI-FI', pool: scifiPrompts },
        { name: 'HISTORY', pool: historyPrompts },
        { name: 'NATURE', pool: naturePrompts },
        { name: 'WEIRDCORE', pool: weirdcorePrompts },
        { name: 'OBSOLETE TECH', pool: obsoleteTechPrompts }
    ];

    function getWeightedKeyword(list) {
        if (!list || list.length === 0) return 'nature';
        
        let totalWeight = 0;
        const weights = list.map(kw => {
            const usage = state.keywordUsageMap[kw] || 0;
            const w = 1 / (1 + usage * 0.6);
            totalWeight += w;
            return w;
        });

        let rand = Math.random() * totalWeight;
        for (let i = 0; i < list.length; i++) {
            if (rand < weights[i]) {
                state.keywordUsageMap[list[i]] = (state.keywordUsageMap[list[i]] || 0) + 1;
                return list[i];
            }
            rand -= weights[i];
        }
        const picked = list[Math.floor(Math.random() * list.length)];
        state.keywordUsageMap[picked] = (state.keywordUsageMap[picked] || 0) + 1;
        return picked;
    }

    function getNextRotatedCategoryQuery() {
        state.categoryRotationIndex = (state.categoryRotationIndex + 1) % categoryPools.length;
        const cat = categoryPools[state.categoryRotationIndex];
        return getWeightedKeyword(cat.pool);
    }

    function isTooSimilarToRecent(queryOrTitle) {
        if (!queryOrTitle || state.recentTagsBuffer.length === 0) return false;
        
        const candidateTokens = queryOrTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        if (candidateTokens.length === 0) return false;

        let overlapCount = 0;
        state.recentTagsBuffer.forEach(recentTag => {
            const recentTokens = recentTag.toLowerCase().split(/\s+/);
            candidateTokens.forEach(token => {
                if (recentTokens.includes(token)) {
                    overlapCount++;
                }
            });
        });

        return overlapCount >= 3;
    }

    function recordImageTags(query, title) {
        const combined = `${query} ${title || ''}`;
        state.recentTagsBuffer.push(combined);
        if (state.recentTagsBuffer.length > 10) {
            state.recentTagsBuffer.shift();
        }
    }

    function recordSeenImageId(id, url) {
        if (id) {
            state.seenImageIds.add(id);
            if (state.seenImageIds.size > 500) {
                const firstId = state.seenImageIds.values().next().value;
                state.seenImageIds.delete(firstId);
            }
        }
        if (url) {
            state.seenUrls.add(url);
            if (state.seenUrls.size > 500) {
                const firstUrl = state.seenUrls.values().next().value;
                state.seenUrls.delete(firstUrl);
            }
        }
    }

    function checkAndInjectChaosPick() {
        state.imagesSinceChaos++;
        if (state.imagesSinceChaos >= state.nextChaosInterval) {
            state.imagesSinceChaos = 0;
            state.nextChaosInterval = Math.floor(Math.random() * 6) + 5;
            
            const chaosPools = [abyssPrompts, surrealPrompts, weirdcorePrompts];
            const pickedPool = chaosPools[Math.floor(Math.random() * chaosPools.length)];
            return getWeightedKeyword(pickedPool);
        }
        return null;
    }

    // --- DEDUPLICATION SET MANAGEMENT ---
    function addSeenUrl(url) {
        if (!url) return;
        state.seenUrls.add(url);
        if (state.seenUrls.size > MAX_SEEN_URLS) {
            const firstItem = state.seenUrls.values().next().value;
            state.seenUrls.delete(firstItem);
        }
    }

    // --- KEYWORD MANAGEMENT SYSTEM ---
    function addKeyword(rawInput) {
        if (!rawInput) return;
        const kwList = rawInput.split(/[,;]+/).map(s => sanitizeKeyword(s)).filter(s => s.length > 0);
        let addedAny = false;

        kwList.forEach(kw => {
            if (!state.keywords.includes(kw) && state.keywords.length < 15) {
                state.keywords.push(kw);
                addedAny = true;
            }
        });

        if (addedAny) {
            renderKeywordChips();
            scheduleSaveToLocalStorage();
            showToast(`KEYWORD SET: <strong>${state.keywords.map(k => escapeHTML(k)).join(', ')}</strong>`, 'info');
            refreshStreamForNewKeywords();
        }
        dom.keywordInput.value = '';
    }

    function removeKeyword(kwToRemove) {
        state.keywords = state.keywords.filter(k => k !== kwToRemove);
        renderKeywordChips();
        scheduleSaveToLocalStorage();
        showToast(`REMOVED KEYWORD: <strong>${escapeHTML(kwToRemove)}</strong>`, 'info');
        refreshStreamForNewKeywords();
    }

    function renderKeywordChips() {
        if (state.keywords.length === 0) {
            dom.activeKwChips.innerHTML = '<span class="kw-placeholder">No keywords set (Openverse & Wikimedia open web stream)</span>';
            return;
        }

        const fragment = document.createDocumentFragment();
        state.keywords.forEach(kw => {
            const chip = document.createElement('span');
            chip.className = 'kw-chip';
            const safeKw = escapeHTML(kw);
            chip.innerHTML = `${safeKw} <button class="kw-del-btn" data-kw="${safeKw}" title="Remove keyword">&times;</button>`;
            fragment.appendChild(chip);
        });

        dom.activeKwChips.innerHTML = '';
        dom.activeKwChips.appendChild(fragment);
    }

    function refreshStreamForNewKeywords() {
        streamAbortController.abort();
        streamAbortController = new AbortController();

        state.imageBuffer = [];
        dom.loader.style.opacity = '1';
        dom.loader.style.pointerEvents = 'all';
        fillImageBuffer().then(() => {
            displayNextImageInstant();
        });
    }

    // --- OPEN WEB IMAGE QUERY APIS WITH VERIFIABLE OPEN LICENSES ---
    async function fetchOpenverseImage(query) {
        try {
            const cleanQ = sanitizeKeyword(query);
            if (!cleanQ) return null;

            const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanQ)}&page_size=20`;
            const res = await fetchWithTimeout(url);
            if (res && res.ok) {
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const valid = data.results.filter(item => (item.url || item.thumbnail) && item.license && !state.seenUrls.has(item.url));
                    const pool = valid.length > 0 ? valid : data.results.filter(item => (item.url || item.thumbnail) && item.license);
                    if (pool.length === 0) return null;

                    const randomItem = pool[Math.floor(Math.random() * pool.length)];

                    if (randomItem) {
                        let licName = 'CC BY 2.0';
                        if (randomItem.license) {
                            const rawLic = randomItem.license.toUpperCase();
                            const ver = randomItem.license_version ? ` ${randomItem.license_version}` : '';
                            if (rawLic === 'CC0' || rawLic === 'PDM' || rawLic === 'PUBLICDOMAIN') {
                                licName = 'PUBLIC DOMAIN';
                            } else {
                                licName = rawLic.startsWith('CC') ? `${rawLic}${ver}` : `CC ${rawLic}${ver}`;
                            }
                        }
                        const licUrl = randomItem.license_url || 'https://creativecommons.org/licenses/';
                        const fastUrl = randomItem.thumbnail || randomItem.url;

                        return {
                            url: fastUrl,
                            thumbUrl: randomItem.thumbnail || fastUrl,
                            source: `OPENVERSE: ${cleanQ.toUpperCase()}`,
                            id: `OPV-${randomItem.id ? randomItem.id.slice(0, 5) : Math.floor(Math.random()*10000)}`,
                            license: licName,
                            licenseUrl: licUrl,
                            author: randomItem.creator ? sanitizeKeyword(randomItem.creator) : 'Openverse Contributor',
                            title: randomItem.title ? sanitizeKeyword(randomItem.title) : cleanQ
                        };
                    }
                }
            }
        } catch (e) {
            // Quiet timeout handling
        }
        return null;
    }

    async function fetchWikimediaSearchImage(query) {
        try {
            const cleanQ = sanitizeKeyword(query);
            if (!cleanQ) return null;

            const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanQ)}&gsrnamespace=6&prop=imageinfo&iiprop=url|thumburl|extmetadata&iiurlwidth=1000&format=json&origin=*`;
            const res = await fetchWithTimeout(url);
            if (res && res.ok) {
                const data = await res.json();
                if (data.query && data.query.pages) {
                    const pages = Object.values(data.query.pages);
                    const validPages = pages.filter(p => p.imageinfo && p.imageinfo[0] && (p.imageinfo[0].thumburl || p.imageinfo[0].url));
                    
                    const unseen = validPages.filter(p => !state.seenUrls.has(p.imageinfo[0].url));
                    const pool = unseen.length > 0 ? unseen : validPages;

                    if (pool.length > 0) {
                        const picked = pool[Math.floor(Math.random() * pool.length)];
                        const imgInfo = picked.imageinfo[0];
                        const fastUrl = imgInfo.thumburl || imgInfo.url;

                        let licName = 'CC BY-SA 4.0';
                        let licUrl = 'https://commons.wikimedia.org/wiki/Commons:Licensing';
                        let author = 'Wikimedia Commons';
                        let title = picked.title ? picked.title.replace(/^File:/i, '') : cleanQ;

                        if (imgInfo.extmetadata) {
                            const meta = imgInfo.extmetadata;
                            if (meta.LicenseShortName && meta.LicenseShortName.value) {
                                licName = meta.LicenseShortName.value.toUpperCase();
                            } else if (meta.License && meta.License.value) {
                                licName = meta.License.value.toUpperCase();
                            }

                            if (meta.LicenseUrl && meta.LicenseUrl.value) {
                                licUrl = meta.LicenseUrl.value;
                            }
                            if (meta.Artist && meta.Artist.value) {
                                author = sanitizeKeyword(meta.Artist.value);
                            }
                        }

                        return {
                            url: fastUrl,
                            thumbUrl: fastUrl,
                            source: `WIKIMEDIA: ${cleanQ.toUpperCase()}`,
                            id: `WM-${picked.pageid || Math.floor(Math.random()*10000)}`,
                            license: licName,
                            licenseUrl: licUrl,
                            author: author,
                            title: title
                        };
                    }
                }
            }
        } catch (e) {
            // Quiet timeout handling
        }
        return null;
    }

    // --- HIGH-ENTROPY FAST DYNAMIC QUERY SELECTOR (OPENVERSE & WIKIMEDIA ONLY) ---
    async function getNextOpenWebImageData() {
        const chaosPickQuery = checkAndInjectChaosPick();
        const queryTerm = chaosPickQuery || (state.keywords.length > 0 ? getWeightedKeyword(state.keywords) : getNextRotatedCategoryQuery());
        
        const randomVal = Math.floor(Math.random() * 1000000000);
        const highEntropySeed = `${Date.now()}_${randomVal}`;
        const sourceRotation = randomVal % 2;

        let candidate = null;
        if (sourceRotation === 0) {
            candidate = await fetchWikimediaSearchImage(queryTerm) || await fetchOpenverseImage(queryTerm);
        } else {
            candidate = await fetchOpenverseImage(queryTerm) || await fetchWikimediaSearchImage(queryTerm);
        }

        if (candidate && candidate.url && candidate.id && !state.seenImageIds.has(candidate.id) && !state.seenUrls.has(candidate.url)) {
            candidate.seed = highEntropySeed;
            candidate.isChaosPick = !!chaosPickQuery;
            recordImageTags(queryTerm, candidate.title || queryTerm);
            return candidate;
        }

        const fallbackTerm = getWeightedKeyword(randomDictionary);
        const fallbackCandidate = await fetchWikimediaSearchImage(fallbackTerm) || await fetchOpenverseImage(fallbackTerm);

        if (fallbackCandidate && fallbackCandidate.id && !state.seenImageIds.has(fallbackCandidate.id)) {
            fallbackCandidate.seed = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
            recordImageTags(fallbackTerm, fallbackCandidate.title || fallbackTerm);
            return fallbackCandidate;
        }

        return {
            url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/VAN_GOGH_-_Starry_Night_-_Google_Art_Project.jpg',
            thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/VAN_GOGH_-_Starry_Night_-_Google_Art_Project.jpg/300px-VAN_GOGH_-_Starry_Night_-_Google_Art_Project.jpg',
            source: 'WIKIMEDIA: STARRY NIGHT',
            id: 'WM-84920',
            license: 'PUBLIC DOMAIN',
            licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain',
            author: 'Vincent van Gogh',
            title: 'Starry Night',
            seed: `${Date.now()}_emergency`
        };
    }

    // --- ADAPTIVE IMAGE PRELOADING & MEMORY CLEANUP ---
    let dynamicBufferSize = 5;
    function adjustAdaptiveBuffer(loadTimeMs) {
        if (loadTimeMs < 800) {
            dynamicBufferSize = Math.min(dynamicBufferSize + 1, 8);
        } else if (loadTimeMs > 2500) {
            dynamicBufferSize = Math.max(dynamicBufferSize - 1, 4);
        }
    }

    function preloadSingleImage() {
        return new Promise(async (resolve) => {
            const data = await getNextOpenWebImageData();
            if (!data || !data.url) {
                resolve(null);
                return;
            }

            const startTime = Date.now();
            const imgObj = new Image();

            const cleanup = () => {
                imgObj.onload = null;
                imgObj.onerror = null;
            };

            imgObj.onload = () => {
                const loadTime = Date.now() - startTime;
                adjustAdaptiveBuffer(loadTime);

                cleanup();
                recordSeenImageId(data.id, data.url);
                resolve(data);
            };

            imgObj.onerror = async () => {
                cleanup();
                const fbData = await fetchWikimediaSearchImage('nature') || {
                    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/VAN_GOGH_-_Starry_Night_-_Google_Art_Project.jpg',
                    thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/VAN_GOGH_-_Starry_Night_-_Google_Art_Project.jpg/300px-VAN_GOGH_-_Starry_Night_-_Google_Art_Project.jpg',
                    source: 'WIKIMEDIA: STARRY NIGHT',
                    id: 'WM-84920',
                    license: 'PUBLIC DOMAIN',
                    licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain',
                    author: 'Vincent van Gogh',
                    title: 'Starry Night'
                };
                recordSeenImageId(fbData.id, fbData.url);
                resolve(fbData);
            };

            imgObj.src = data.url;
        });
    }

    async function fillImageBuffer() {
        const missingCount = dynamicBufferSize - state.imageBuffer.length;
        if (missingCount <= 0) return;

        const promises = Array.from({ length: missingCount }, () => preloadSingleImage());
        const newItems = await Promise.all(promises);

        newItems.forEach(item => {
            if (item && item.url) state.imageBuffer.push(item);
        });
    }

    // --- DISPLAY NEXT IMAGE WITH SMOOTH PAUSE ---
    async function displayNextImageInstant() {
        if (state.isTransitioning) return;
        state.isTransitioning = true;

        if (state.imageBuffer.length === 0) {
            dom.loader.style.opacity = '1';
            dom.loader.style.pointerEvents = 'all';
            await fillImageBuffer();
        }

        if (state.imageBuffer.length > 0) {
            const nextData = state.imageBuffer.shift();
            state.currentImage = nextData;

            recordSeenImageId(nextData.id, nextData.url);

            dom.randomImage.src = nextData.url;
            dom.imgSourceTag.textContent = nextData.source;
            dom.imgIdTag.textContent = `#${nextData.id}`;
            dom.btnOpenOriginal.href = nextData.url;

            if (dom.imgLicenseTag) {
                dom.imgLicenseTag.textContent = nextData.license || 'CC BY 2.0';
                dom.imgLicenseTag.href = nextData.licenseUrl || 'https://creativecommons.org/';
            }

            if (nextData.isChaosPick) {
                showToast('🌀 RARE CHAOS PICK INJECTED!', 'S');
            }

            const rarity = calculateImageRarity(nextData.seed || nextData.id);
            dom.stageRarityBadge.textContent = rarity.text;
            dom.stageRarityBadge.className = `meta-rarity ${rarity.class}`;

            if (rarity.text === 'LEGENDARY') {
                triggerParticlePop(window.innerWidth / 4, window.innerHeight / 2, 'S');
                showToast('🟡 LEGENDARY FIND ENCOUNTERED!', 'S');
            } else if (rarity.text === 'CURSED') {
                showToast('🔴 CURSED IMAGE DETECTED!', 'F');
            }

            const secretRoll = Math.random();
            if (secretRoll < 0.05) {
                dom.secretCollectibleBadge.classList.remove('hidden');
            } else {
                dom.secretCollectibleBadge.classList.add('hidden');
            }

            if (state.abyssModeActive && state.abyssModeRemaining > 0) {
                state.abyssModeRemaining--;
                dom.eventBannerText.textContent = `⚠️ THE ABYSS (${state.abyssModeRemaining} LEFT)`;
                dom.stageEventBanner.className = 'stage-event-banner abyss-mode';
                if (state.abyssModeRemaining <= 0) state.abyssModeActive = false;
            } else if (state.chaosModeActive && state.chaosModeRemaining > 0) {
                state.chaosModeRemaining--;
                dom.eventBannerText.textContent = `⚠️ CHAOS ROUND: ${state.chaosModeRule} (${state.chaosModeRemaining} LEFT)`;
                dom.stageEventBanner.className = 'stage-event-banner';
                if (state.chaosModeRemaining <= 0) state.chaosModeActive = false;
            } else {
                dom.stageEventBanner.classList.add('hidden');
            }

            dom.randomImage.classList.remove('hidden', 'anim-pop');
            nextData.loadedImg = null;
        }

        dom.loader.style.opacity = '0';
        dom.loader.style.pointerEvents = 'none';
        state.isTransitioning = false;

        fillImageBuffer();
    }

    // --- INSTANT ZERO-LATENCY RATING ENGINE ---
    function rateCurrentImage(tier) {
        if (!state.currentImage || state.isTransitioning) return;

        const currentItem = state.currentImage;

        // 1. Immediate sound & particle feedback
        playSound(tier, state.streak);

        const btn = document.querySelector(`.tier-btn[data-tier="${tier}"]`);
        if (btn) {
            btn.classList.add('btn-active-slam');
            setTimeout(() => btn.classList.remove('btn-active-slam'), 120);
        }

        const rect = btn ? btn.getBoundingClientRect() : dom.imageStage.getBoundingClientRect();
        const clickX = rect.left + rect.width / 2;
        const clickY = rect.top + rect.height / 2;

        triggerParticlePop(clickX, clickY, tier);
        spawnFloatingTextPop(clickX, clickY - 20, `${tier} TIER RATED`, tier);

        if (dom.stageStampOverlay) {
            dom.stageStampOverlay.textContent = tier;
            dom.stageStampOverlay.className = `stage-stamp-overlay stamp-active stamp-${tier.toLowerCase()}`;
            setTimeout(() => {
                dom.stageStampOverlay.className = 'stage-stamp-overlay';
            }, 300);
        }

        // 2. Store rated item
        const item = {
            id: currentItem.id || `IMG-${Date.now()}`,
            url: currentItem.url,
            thumbUrl: currentItem.thumbUrl || currentItem.url,
            tier: tier,
            license: currentItem.license || 'CC BY 2.0',
            licenseUrl: currentItem.licenseUrl || 'https://creativecommons.org/',
            author: currentItem.author || 'Open Source Contributor',
            title: currentItem.title || 'Rated Image',
            timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };

        state.ratedImages.push(item);
        state.streak += 1;
        state.ratedCount += 1;

        const kwMatch = currentItem.source.split(': ')[1];
        if (kwMatch) {
            const cleanSourceKw = kwMatch.toLowerCase();
            if (tier === 'S' || tier === 'A') {
                if (!state.curiosityProfile.liked.includes(cleanSourceKw)) {
                    state.curiosityProfile.liked.push(cleanSourceKw);
                }
                state.rabbitHoleQueue = [
                    `${cleanSourceKw} anomaly`,
                    `surreal ${cleanSourceKw}`,
                    `ancient ${cleanSourceKw}`
                ];
            } else if (tier === 'F') {
                if (!state.curiosityProfile.hated.includes(cleanSourceKw)) {
                    state.curiosityProfile.hated.push(cleanSourceKw);
                }
            }
        }

        if (state.ratedCount > 0 && state.ratedCount % 50 === 0) {
            state.abyssModeActive = true;
            state.abyssModeRemaining = 10;
            showToast('⚠️ ENTERING THE ABYSS MODE (10 IMAGES)!', 'S');
        } else if (state.ratedCount > 0 && state.ratedCount % 25 === 0) {
            state.chaosModeActive = true;
            state.chaosModeRemaining = 5;
            state.chaosModeRule = chaosRules[Math.floor(Math.random() * chaosRules.length)];
            showToast(`⚠️ CHAOS ROUND STARTED: ${state.chaosModeRule}!`, 'A');
        } else if (state.ratedCount > 0 && state.ratedCount % 15 === 0) {
            state.ambientMoodIndex = (state.ambientMoodIndex + 1) % ambientMoods.length;
            const mood = ambientMoods[state.ambientMoodIndex];
            showToast(`MOOD SHIFT: <strong>${mood}</strong>`, 'info');
        }

        // 3. ZERO-LATENCY INSTANT SWAP (0ms delay!)
        displayNextImageInstant();

        // 4. Update UI tier row & stats
        renderTierRow(tier, item.id);
        updateStats();
        scheduleSaveToLocalStorage();
    }

    function skipCurrentImage() {
        if (state.isTransitioning) return;
        playSound('skip');
        state.streak = 0;
        updateStats();
        showToast('SKIPPED IMAGE', 'skip');
        displayNextImageInstant();
    }

    // --- RENDER TIER ROW WITH INCREMENTAL APPEND OPTIMIZATION ---
    function renderTierRow(tierKey, newlyPlacedId = null) {
        const container = dom.tierContents[tierKey];
        if (!container) return;

        const tierItems = state.ratedImages.filter(img => img.tier === tierKey);

        if (tierItems.length === 0) {
            container.innerHTML = `<div class="empty-placeholder">DROP OR RATE ${tierKey} TIER IMAGES HERE</div>`;
            return;
        }

        const isExpanded = !!state.expandedTiers[tierKey];

        // Fast O(1) incremental append for newly rated single items
        if (newlyPlacedId && container.querySelector('.brutal-thumb-card') && !isExpanded) {
            const newItem = tierItems.find(img => img.id === newlyPlacedId);
            if (newItem) {
                const emptyPlaceholder = container.querySelector('.empty-placeholder');
                if (emptyPlaceholder) emptyPlaceholder.remove();

                const newCard = createThumbnailCardElement(newItem);
                newCard.classList.add('new-placed-pop');

                const showMoreBtn = container.querySelector('.show-more-tier-btn');
                if (showMoreBtn) {
                    container.insertBefore(newCard, showMoreBtn);
                } else {
                    container.appendChild(newCard);
                }

                const cards = container.querySelectorAll('.brutal-thumb-card');
                if (cards.length > MAX_VISIBLE_PER_TIER) {
                    cards[0].remove();
                }
                return;
            }
        }

        const visibleItems = isExpanded ? tierItems : tierItems.slice(-MAX_VISIBLE_PER_TIER);
        const hiddenCount = tierItems.length - visibleItems.length;

        const fragment = document.createDocumentFragment();

        visibleItems.forEach(item => {
            const thumbCard = createThumbnailCardElement(item);
            if (newlyPlacedId && item.id === newlyPlacedId) {
                thumbCard.classList.add('new-placed-pop');
            }
            fragment.appendChild(thumbCard);
        });

        if (hiddenCount > 0 && !isExpanded) {
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'brutal-btn small yellow show-more-tier-btn';
            showMoreBtn.textContent = `+ ${hiddenCount} MORE`;
            showMoreBtn.title = `Show older ${hiddenCount} images in ${tierKey} Tier`;
            showMoreBtn.dataset.expandTier = tierKey;

            fragment.appendChild(showMoreBtn);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    function renderAllTierRows() {
        Object.keys(dom.tierContents).forEach(tierKey => {
            renderTierRow(tierKey);
        });
    }

    // --- CREATE THUMBNAIL CARD ELEMENT (INSTANT MEMORY CACHE LOAD) ---
    function createThumbnailCardElement(item) {
        const thumbCard = document.createElement('div');
        thumbCard.className = 'brutal-thumb-card';
        thumbCard.draggable = true;
        thumbCard.dataset.id = item.id;
        thumbCard.dataset.tier = item.tier;

        // Use item.url first because it is 100% pre-decoded and cached in memory from the main stage!
        const displaySrc = item.url || item.thumbUrl;

        thumbCard.innerHTML = `
            <img src="${displaySrc}" alt="Rated ${item.tier} image" loading="eager" />
            <button class="thumb-del-btn" data-del-id="${item.id}" data-del-tier="${item.tier}" title="Remove image">&times;</button>
        `;

        return thumbCard;
    }

    // --- STAGE & CHART DRAG AND DROP CONTROLLER ---
    function initDragAndDrop() {
        if (!dom.tierChartGrid) return;

        // Enable Stage Image Dragging (PICK Phase)
        if (dom.randomImage) {
            dom.randomImage.addEventListener('dragstart', (e) => {
                state.draggedItemId = 'MAIN_STAGE_IMAGE';
                e.dataTransfer.setData('text/plain', 'MAIN_STAGE_IMAGE');
                e.dataTransfer.effectAllowed = 'copyMove';
                dom.randomImage.classList.add('is-dragging');
                if (dom.imageStage) dom.imageStage.classList.add('stage-picked-up');
            });
            dom.randomImage.addEventListener('dragend', () => {
                state.draggedItemId = null;
                dom.randomImage.classList.remove('is-dragging');
                if (dom.imageStage) dom.imageStage.classList.remove('stage-picked-up');
            });
        }

        // Tier Chart Card Dragging
        dom.tierChartGrid.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.brutal-thumb-card');
            if (card) {
                state.draggedItemId = card.dataset.id;
                e.dataTransfer.setData('text/plain', card.dataset.id);
            }
        });

        dom.tierChartGrid.addEventListener('dragend', () => {
            state.draggedItemId = null;
            if (dom.randomImage) dom.randomImage.classList.remove('is-dragging');
            if (dom.imageStage) dom.imageStage.classList.remove('stage-picked-up');
            document.querySelectorAll('.row-content, .chart-row').forEach(el => el.classList.remove('drag-over'));
        });

        // DRAGGING Phase (Hovering over Tier Row)
        dom.tierChartGrid.addEventListener('dragover', (e) => {
            const rowContent = e.target.closest('.row-content') || e.target.closest('.chart-row');
            if (rowContent) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const chartRow = rowContent.closest('.chart-row') || rowContent;
                chartRow.classList.add('drag-over');
            }
        });

        dom.tierChartGrid.addEventListener('dragleave', (e) => {
            const rowContent = e.target.closest('.row-content') || e.target.closest('.chart-row');
            if (rowContent) {
                const chartRow = rowContent.closest('.chart-row') || rowContent;
                chartRow.classList.remove('drag-over');
            }
        });

        // PLACED Phase (Drop Slam & Placement Effect)
        dom.tierChartGrid.addEventListener('drop', (e) => {
            const rowContent = e.target.closest('.row-content') || e.target.closest('.chart-row');
            if (!rowContent) return;

            e.preventDefault();

            if (dom.randomImage) dom.randomImage.classList.remove('is-dragging');
            if (dom.imageStage) dom.imageStage.classList.remove('stage-picked-up');
            document.querySelectorAll('.row-content, .chart-row').forEach(el => el.classList.remove('drag-over'));

            const chartRow = rowContent.closest('.chart-row');
            if (chartRow) {
                chartRow.classList.add('tier-drop-slam');
                setTimeout(() => chartRow.classList.remove('tier-drop-slam'), 300);
            }

            const targetRow = rowContent.classList.contains('row-content') ? rowContent : rowContent.querySelector('.row-content');
            const targetTier = targetRow ? targetRow.dataset.tier : null;
            if (!targetTier) return;

            const itemId = e.dataTransfer.getData('text/plain') || state.draggedItemId;

            triggerParticlePop(e.clientX, e.clientY, targetTier);

            // Main Stage Image Drop -> Rate Image Instantly!
            if (itemId === 'MAIN_STAGE_IMAGE' || state.draggedItemId === 'MAIN_STAGE_IMAGE') {
                rateCurrentImage(targetTier);
                state.draggedItemId = null;
                return;
            }

            // Existing Thumbnail Card Drop -> Re-tier Item
            if (itemId) {
                const item = state.ratedImages.find(img => img.id === itemId);
                if (item && item.tier !== targetTier) {
                    const oldTier = item.tier;
                    item.tier = targetTier;

                    renderTierRow(oldTier);
                    renderTierRow(targetTier, item.id);

                    scheduleSaveToLocalStorage();
                    playSound(targetTier);
                    showToast(`MOVED TO <strong>${targetTier} TIER</strong>`, targetTier);
                }
            }
        });

        dom.tierChartGrid.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.thumb-del-btn');
            if (delBtn) {
                e.stopPropagation();
                removeRatedItem(delBtn.dataset.delId, delBtn.dataset.delTier);
                return;
            }

            const expandBtn = e.target.closest('.show-more-tier-btn');
            if (expandBtn) {
                const tierKey = expandBtn.dataset.expandTier;
                state.expandedTiers[tierKey] = true;
                renderTierRow(tierKey);
                return;
            }

            const card = e.target.closest('.brutal-thumb-card');
            if (card) {
                const item = state.ratedImages.find(img => img.id === card.dataset.id);
                if (item) openPreviewModal(item);
            }
        });
    }

    // --- Remove Item ---
    function removeRatedItem(id, tier) {
        state.ratedImages = state.ratedImages.filter(img => img.id !== id);
        scheduleSaveToLocalStorage();
        updateStats();

        renderTierRow(tier);
        showToast('IMAGE REMOVED', 'info');
    }

    // --- Re-tier from Modal ---
    function reTierItem(item, newTier) {
        if (item.tier === newTier) return;
        const oldTier = item.tier;
        item.tier = newTier;

        renderTierRow(oldTier);
        renderTierRow(newTier);

        scheduleSaveToLocalStorage();

        dom.modalTierBadge.textContent = `${newTier} TIER`;
        playSound(newTier);
        showToast(`RE-RANKED TO <strong>${newTier} TIER</strong>`, newTier);
    }

    // --- Preview Modal ---
    let activeModalItem = null;
    function openPreviewModal(item) {
        activeModalItem = item;
        dom.modalImg.src = item.url;
        dom.modalTierBadge.textContent = `${item.tier} TIER`;
        dom.modalDate.textContent = `RATED ON: ${item.timestamp}`;
        if (dom.modalLicenseLink) {
            const authorText = item.author ? ` (${escapeHTML(item.author)})` : '';
            dom.modalLicenseLink.innerHTML = `${escapeHTML(item.license || 'CC BY 2.0')}${authorText}`;
            dom.modalLicenseLink.href = item.licenseUrl || 'https://creativecommons.org/';
        }
        dom.modalUrlText.textContent = item.url;
        dom.modalExternalLink.href = item.url;

        dom.previewModal.classList.remove('hidden');
    }

    function closePreviewModal() {
        dom.previewModal.classList.add('hidden');
        activeModalItem = null;
    }

    // --- Collectibles Drawer ---
    function renderCollectiblesGrid() {
        if (!dom.collectiblesGrid) return;
        if (state.collectibles.length === 0) {
            dom.collectiblesGrid.innerHTML = '<div class="empty-placeholder">NO SECRET OBJECTS FOUND YET! KEEP RATING IMAGES TO UNCOVER HIDDEN ITEMS.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        state.collectibles.forEach(item => {
            const card = document.createElement('div');
            card.className = 'collectible-card';
            card.innerHTML = item;
            fragment.appendChild(card);
        });

        dom.collectiblesGrid.innerHTML = '';
        dom.collectiblesGrid.appendChild(fragment);
    }

    function unlockSecretCollectible() {
        const itemPool = [
            '👾 GOLDEN PIXEL BADGE',
            '👾 ABYSS KEYCARD',
            '👾 RETRO SOUND PACK',
            '👾 LIMINAL PASS',
            '👾 CYBER SKULL EMBLEM',
            '👾 GEOCITIES RELIC'
        ];

        const newItem = itemPool[Math.floor(Math.random() * itemPool.length)];
        if (!state.collectibles.includes(newItem)) {
            state.collectibles.push(newItem);
        }

        dom.secretCollectibleBadge.classList.add('hidden');
        if (dom.collectiblesCount) dom.collectiblesCount.textContent = state.collectibles.length;
        scheduleSaveToLocalStorage();
        triggerParticlePop(window.innerWidth / 2, window.innerHeight / 2, 'S');
        showToast(`UNLOCKED COLLECTIBLE: <strong>${newItem}</strong>!`, 'S');
    }

    // --- Stats & Local Storage ---
    function updateStats() {
        dom.statTotal.textContent = state.ratedImages.length;
        if (dom.streakVal) dom.streakVal.textContent = state.streak;
        if (dom.collectiblesCount) dom.collectiblesCount.textContent = state.collectibles.length;
    }

    function updateSoundUI() {
        if (!dom.soundIconHolder) return;

        if (state.soundEnabled) {
            dom.soundIconHolder.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
            `;
        } else {
            dom.soundIconHolder.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
            `;
        }
    }

    function loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem('tierpix_brutal_pure_data');
            if (raw) {
                const data = JSON.parse(raw);
                if (Array.isArray(data.keywords)) {
                    state.keywords = data.keywords;
                    renderKeywordChips();
                }
                if (Array.isArray(data.seenUrls)) {
                    state.seenUrls = new Set(data.seenUrls);
                }
                if (Array.isArray(data.ratedImages)) {
                    state.ratedImages = data.ratedImages;
                    renderAllTierRows();
                }
                if (typeof data.streak === 'number') state.streak = data.streak;
                if (typeof data.ratedCount === 'number') state.ratedCount = data.ratedCount;
                if (typeof data.soundEnabled === 'boolean') {
                    state.soundEnabled = data.soundEnabled;
                    updateSoundUI();
                }
                if (typeof data.theme === 'string') {
                    state.theme = data.theme;
                    updateThemeUI();
                }
                if (typeof data.panelWidthPercent === 'number') {
                    state.panelWidthPercent = data.panelWidthPercent;
                    if (dom.leftPanel) dom.leftPanel.style.width = `${state.panelWidthPercent}%`;
                }
                if (Array.isArray(data.collectibles)) {
                    state.collectibles = data.collectibles;
                }
                if (data.curiosityProfile) {
                    state.curiosityProfile = data.curiosityProfile;
                }
                updateStats();
            }
        } catch (e) {
            console.warn('Storage load error:', e);
        }
    }

    // --- Copy Link ---
    function copyImageUrl() {
        if (!state.currentImage || !state.currentImage.url) return;
        navigator.clipboard.writeText(state.currentImage.url).then(() => {
            showToast('IMAGE URL COPIED!', 'info');
        }).catch(() => {
            showToast('FAILED TO COPY', 'skip');
        });
    }

    // --- Toasts ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type.toLowerCase()}`;
        toast.innerHTML = message;
        dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 200);
        }, 1800);
    }

    // --- OPTIMIZED ZERO-ALLOCATION BLOB EXPORT ---
    function exportTierListJSON() {
        if (state.ratedImages.length === 0) {
            showToast('NO IMAGES RATED YET!', 'info');
            return;
        }
        const jsonStr = JSON.stringify(state.ratedImages, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);

        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = `TierPix_List_${Date.now()}.json`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        showToast('EXPORTED TIER LIST JSON!', 'S');
    }

    // --- Clear All ---
    function clearAllTierData() {
        if (state.ratedImages.length === 0) return;
        if (confirm('ARE YOU SURE YOU WANT TO RESET YOUR ENTIRE TIER LIST?')) {
            state.ratedImages = [];
            state.seenUrls.clear();
            state.streak = 0;
            state.ratedCount = 0;
            state.expandedTiers = {};
            scheduleSaveToLocalStorage();
            updateStats();
            renderAllTierRows();
            showToast('TIER LIST RESET', 'info');
        }
    }

    // --- EVENT DELEGATION & LISTENERS ---
    function initEvents() {
        initPanelResizer();

        dom.btnAddKw.addEventListener('click', () => {
            addKeyword(dom.keywordInput.value);
        });

        dom.keywordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addKeyword(dom.keywordInput.value);
            }
        });

        dom.activeKwChips.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.kw-del-btn');
            if (delBtn && delBtn.dataset.kw) {
                removeKeyword(delBtn.dataset.kw);
            }
        });

        if (dom.ratingButtonsRow) {
            dom.ratingButtonsRow.addEventListener('click', (e) => {
                const btn = e.target.closest('.tier-btn');
                if (btn && btn.dataset.tier) {
                    rateCurrentImage(btn.dataset.tier);
                }
            });
        }

        if (dom.secretCollectibleBadge) {
            dom.secretCollectibleBadge.addEventListener('click', unlockSecretCollectible);
        }

        // Skip & Copy
        dom.btnSkip.addEventListener('click', skipCurrentImage);
        dom.btnCopyUrl.addEventListener('click', copyImageUrl);

        // Keyboard Shortcuts (S, A, B, C, D, F / 1-6)
        let lastKeyTime = 0;
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            if (e.repeat) return;

            const now = Date.now();
            if (now - lastKeyTime < 100) return;
            lastKeyTime = now;

            const key = e.key.toUpperCase();
            const btnMap = { S: 'S', '1': 'S', A: 'A', '2': 'A', B: 'B', '3': 'B', C: 'C', '4': 'C', D: 'D', '5': 'D', F: 'F', '6': 'F' };

            if (btnMap[key]) {
                const tier = btnMap[key];
                rateCurrentImage(tier);
            } else if (e.code === 'Space') {
                e.preventDefault();
                skipCurrentImage();
            }
        });

        // Sound Toggle
        dom.btnSoundToggle.addEventListener('click', () => {
            state.soundEnabled = !state.soundEnabled;
            updateSoundUI();
            scheduleSaveToLocalStorage();
            showToast(state.soundEnabled ? 'SOUND ON' : 'SOUND MUTED', 'info');
        });

        // Theme Toggle
        if (dom.btnThemeToggle) {
            dom.btnThemeToggle.addEventListener('click', () => {
                state.theme = state.theme === 'dark' ? 'light' : 'dark';
                updateThemeUI();
                scheduleSaveToLocalStorage();
                showToast(state.theme === 'dark' ? 'DARK MODE ACTIVATED' : 'LIGHT MODE ACTIVATED', 'info');
            });
        }

        // Collectibles Drawer Toggle
        if (dom.btnCollectiblesToggle) {
            dom.btnCollectiblesToggle.addEventListener('click', () => {
                renderCollectiblesGrid();
                dom.collectiblesModal.classList.remove('hidden');
            });
        }

        if (dom.collectiblesModalClose) {
            dom.collectiblesModalClose.addEventListener('click', () => {
                dom.collectiblesModal.classList.add('hidden');
            });
        }

        // Export JSON & Clear All
        dom.btnExport.addEventListener('click', exportTierListJSON);
        dom.btnClearAll.addEventListener('click', clearAllTierData);

        // Modal Re-rating buttons delegation
        dom.modalRerateBtns.addEventListener('click', (e) => {
            const rBtn = e.target.closest('.r-btn');
            if (rBtn && activeModalItem) {
                reTierItem(activeModalItem, rBtn.dataset.rerate);
            }
        });

        // Modal Close
        dom.modalClose.addEventListener('click', closePreviewModal);
        dom.previewModal.addEventListener('click', (e) => {
            if (e.target === dom.previewModal || e.target === dom.collectiblesModal) {
                closePreviewModal();
                dom.collectiblesModal.classList.add('hidden');
            }
        });

        dom.modalDeleteBtn.addEventListener('click', () => {
            if (activeModalItem) {
                removeRatedItem(activeModalItem.id, activeModalItem.tier);
                closePreviewModal();
            }
        });
    }

    // --- INSTANT FAST STARTUP SEQUENCE ---
    initEvents();
    initDragAndDrop();
    loadFromLocalStorage();
    updateThemeUI();

    preloadSingleImage().then(firstImg => {
        if (firstImg && firstImg.url) {
            state.imageBuffer.push(firstImg);
            displayNextImageInstant();
        } else {
            displayNextImageInstant();
        }
        fillImageBuffer();
    });
});
