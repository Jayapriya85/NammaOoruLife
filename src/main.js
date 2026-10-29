import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ThreeScene } from './js/ThreeScene.js';
import { DistrictCanvasPlayer } from './js/DistrictCanvasPlayer.js';
import districtsData from './data/districts.json';
import { filmstripDistricts } from './js/districtsFilmstripData.js';
import { AudioEngine } from './js/AudioEngine.js';

gsap.registerPlugin(ScrollTrigger);

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  currentDistrict: null,
  drawerOpen: false,
  activeFilter: 'all',
  searchQuery: '',
};

// ─── Flatten all districts ────────────────────────────────────────────────────
const allDistricts = districtsData.regions.flatMap((r) =>
  r.districts.map((d) => ({ ...d, region: r.name, regionId: r.id, regionColor: r.color }))
);
const activeDistricts = allDistricts.filter((d) => d.active);

// ─── DOM References ──────────────────────────────────────────────────────────
let threeScene = null;
let lenis = null;
let districtCanvasPlayer = null;

let selectedDistrictId = 'coimbatore';

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHUD();
  buildHero();
  buildHistoriesSection();
  buildCultureSection();
  buildStatsStrip();
  buildDistrictsSection();
  buildDistrictView();
  buildFooter();
  initLenis();
  initCanvasPlayer();
  initHeritageModal();
  initGSAP();
  initAtlasDrawer();
  initHUDScroll();
});

// ─── Lenis ───────────────────────────────────────────────────────────────────
function initLenis() {
  lenis = new Lenis({
    duration: 1.3,
    lerp: 0.07,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

function initCanvasPlayer() {
  districtCanvasPlayer = new DistrictCanvasPlayer({
    lenis,
    activeDistricts,
    onClose: () => {
      state.currentDistrict = null;
      document.getElementById('hud-view-label').textContent = 'LANDING VIEW';
    },
    onSwitchDistrict: (nextDistrict) => {
      state.currentDistrict = nextDistrict;
      document.getElementById('hud-view-label').textContent = nextDistrict.name.toUpperCase();
      districtCanvasPlayer.switchDistrict(nextDistrict);
    },
  });
}

// ─── Historical & Cultural Knowledge Base (Sandstone & Temple Gold) ─────────
const historiesData = [
  {
    id: 'chola',
    dynasty: 'Imperial Chola Empire (சோழப் பேரரசு)',
    era: '300 BCE – 1279 CE · Imperial Zenith: 985 – 1044 CE',
    capital: 'Thanjavur · Gangaikonda Cholapuram · Pazhaiyarai',
    tagline: 'Maritime Thalassocracy, Blue-Water Armadas & Monolithic Granite Vimanas',
    emblem: 'Jumping Tiger (புலி)',
    metrics: [
      { label: 'MARITIME REACH', val: 'Bay of Bengal to Sumatra & Malaya' },
      { label: 'CAPSTONE MONOLITH', val: '80-Tonne Single Granite Cupola' },
      { label: 'NAVAL ZENITH', val: 'Emperor Rajendra I (Kadaram Conqueror)' },
    ],
    desc: 'Under the visionary rule of Raja Raja Chola I and his son Rajendra Chola I, the Chola Empire established one of antiquity’s most formidable blue-water maritime thalassocracies. Their naval fleets crossed the Bay of Bengal (frequently styled "The Chola Lake"), launching successful overseas campaigns against the Srivijaya Empire in Sumatra, the Kingdom of Kadaram (modern Kedah, Malaysia), and Sri Lanka. Domestically, the Cholas transformed the Cauvery delta into an agricultural marvel with extensive canal networks and constructed the Brihadeeswarar Big Temple in Thanjavur (1010 CE)—a UNESCO World Heritage wonder topped by an 80-tonne monolithic granite cupola erected without mortar. Furthermore, their generational guilds pioneered the world-renowned lost-wax Panchaloha bronze metallurgy, creating kinetic cosmic Nataraja sculptures celebrated globally.',
    strategicHighlights: [
      'Imperial Chola Navy: Dominated maritime silk & spice sea lanes between China and the Abbasid Caliphate.',
      'Brihadeeswarar Vimana: 216-foot stepped pyramidal tower engineered with interlocking granite blocks.',
      'Gangaikonda Cholapuram: Memorial royal capital crowned by the 16-mile-long Cholagangam reservoir lake.',
      'Panchaloha Alchemy: Casting the cosmic Nataraja dance of subatomic creation and dissolution.'
    ],
    keyArtifacts: ['Brihadeeswarar Granite Monolith', 'Rajendra I Kadaram Copper Inscriptions', 'Swamimalai Cosmic Nataraja Bronze', 'Anbil & Karandai Royal Copper Plates']
  },
  {
    id: 'pandya',
    dynasty: 'Pandya Dynasty (பாண்டியர் பேரரசு)',
    era: '6th Century BCE – 14th Century CE',
    capital: 'Madurai (The Ancient Lotus City) · Korkai Pearl Port',
    tagline: 'Sangam Tamil Conclaves, Concentric Lotus City Planning & Gulf Pearls',
    emblem: 'Twin Carps (இரட்டை கயல்)',
    metrics: [
      { label: 'URBAN PATTERN', val: 'Concentric Lotus Grid' },
      { label: 'PEARL MONOPOLY', val: 'Gulf of Mannar Diving Fleets' },
      { label: 'LITERARY CONCLAVES', val: 'Patrons of All 3 Tamil Sangams' },
    ],
    desc: 'The Pandyas are among the oldest sovereign dynasties mentioned in ancient Mediterranean, Greek, and Mauryan chronicles—recorded by Megasthenes, the Ashokan Rock Edicts, Strabo, and Marco Polo. They were the immortal royal patrons of the three classical Tamil Sangam literary assemblies, codifying the sublime poetic canon of Tamil literature. Their ancient capital, Madurai, was meticulously engineered as a sacred concentric lotus, with grand residential and commercial avenues radiating outwards from the celestial center—the Sri Meenakshi Sundareswarar Temple. Controlling the lucrative Gulf of Mannar pearl fisheries headquartered at the ancient port of Korkai, Pandya pearls were prized from Rome to imperial China. In architecture, they pioneered towering polychrome Gopuram gateway portals adorned with thousands of sculpted mythological figures, including the soaring emblem of Tamil Nadu—the Srivilliputhur Andal Gopuram.',
    strategicHighlights: [
      'Sacred Concentric Lotus Planning: Ancient Madurai’s radial street layout designed in accordance with Shilpa Shastra.',
      'The Three Sangam Conclaves: Nurtured legendary poets including Nakkeerar, Kapilar, and Avvaiyar.',
      'Korkai Pearl Port: Controlled global pearl monopolies traded with Augustan Rome and Ptolemaic Egypt.',
      'Monolithic Cave Temples: Kalugumalai Vettuvan Koil monolithic rock-cut sanctum carved out of living granite.'
    ],
    keyArtifacts: ['Madurai Meenakshi Golden Lotus Tank', 'Korkai Excavated Pearl Fishery Shells', 'Srivilliputhur Andal Gopuram Facade', 'Mangulam Tamil-Brahmi Cave Inscriptions']
  },
  {
    id: 'chera',
    dynasty: 'Chera Dynasty (சேரர் பேரரசு)',
    era: '300 BCE – 12th Century CE',
    capital: 'Karur / Vanji & Muziris International Deep-Water Terminal',
    tagline: 'Western Ghats Realm, Roman Spice Fleets & Kongu Monsoon Passes',
    emblem: 'Bow and Arrow (வில் & அம்பு)',
    metrics: [
      { label: 'PRIMARY COMMODITY', val: 'Black Pepper ("Black Gold") & Beryl' },
      { label: 'GLOBAL EMPIRE HUB', val: 'Muziris & Poompuhar Trade Nexus' },
      { label: 'LITERARY CHRONICLE', val: 'Padirruppattu Heroic Anthologies' },
    ],
    desc: 'Ruling the verdant Western Ghats, Kongu Nadu plateau, and the Malabar coast, the Cheras maintained the critical crossroads of ancient trans-oceanic spice commerce. Through the strategic Palakkad mountain pass, they transported Malabar black pepper ("Yavanapriya" or "Black Gold"), wild cardamom, ivory, and fine Padiyur beryl gems to international ports. At the legendary emporium of Muziris, fleets of Roman merchant ships from Alexandria docked annually, laden with gold aurei and Italian amphorae in exchange for sacred Indian spices—as meticulously documented in the Greek Periplus of the Erythraean Sea and the Sangam anthology Padirruppattu. Chera rulers were celebrated for supreme martial fortitude, with Emperor Senguttuvan famously immortalized in the Tamil epic Silappadikaram for quarrying Himalayan stone to sculpt the memorial idol of Kannagi, the embodiment of chastity and justice.',
    strategicHighlights: [
      'Muziris International Spice Harbor: Handled thousands of tons of spices, Roman coinage, and Mediterranean glassware.',
      'The Palakkad Gap Conduit: Strategic inland trade highway connecting the Arabian Sea to the Coromandel coast.',
      'Padiyur Beryl & Quartz Mines: Supplied gemstones favored by Roman patricians and emperors.',
      'Silappadikaram Epic Connection: Emperor Cheran Senguttuvan’s Kannagi Temple memorial tradition.'
    ],
    keyArtifacts: ['Roman Gold Aurei Hoards of Kongu Nadu', 'Karur Ancient Chera Coinage with Bow & Arrow', 'Padiyur Beryl Intaglios & Beads', 'Padirruppattu Palm-Leaf Manuscripts']
  },
  {
    id: 'pallava',
    dynasty: 'Pallava Dynasty (பல்லவர் பேரரசு)',
    era: '275 CE – 897 CE',
    capital: 'Kanchipuram & Mamallapuram International Port',
    tagline: 'Rock-Cut Monolithic Architecture, Shore Temples & Silk Weaving',
    emblem: 'Bull / Nandi (நந்தி)',
    metrics: [
      { label: 'ARCHITECTURAL SHIFT', val: 'Perishable Wood to Eternal Granite' },
      { label: 'UNESCO MONUMENT', val: 'Mamallapuram Shore Temple & Rathas' },
      { label: 'SCHOLASTIC HUB', val: 'Kanchi Ghatika Buddhist & Vedic Center' },
    ],
    desc: 'The Pallavas orchestrated one of the greatest artistic revolutions in Asian civilizational history by transmuting South Indian sacred architecture from perishable timber, brick, and stucco into eternal monolithic granite. Under monarch-scholars Mahendravarman I (Vichitrachitta, "the curious-minded") and Narasimhavarman I ("Mamalla", the great wrestler), the coastal port of Mamallapuram was transformed into an immortal open-air rock sculpture museum. Masters carved free-standing monolithic temples from massive boulders—the Pancha Rathas—and sculpted the world’s largest open-air relief, "Arjuna’s Penance" (Descent of the Ganga), depicting celestial beings, elephants, and ascetics in living rock. Their inland royal capital, Kanchipuram, flourished as an internationally revered intellectual hub housing the famed Kanchi Ghatika university, celebrated by Chinese pilgrim Xuanzang, while nurturing the timeless GI-tagged Kanchipuram pure mulberry silk weaving heritage.',
    strategicHighlights: [
      'Invention of Structural Granite Temples: Transitioned from rock excavation to freestanding structural masonry at the Shore Temple.',
      'Descent of the Ganga (Arjuna’s Penance): 96-foot-long monolithic granite canvas carved with astonishing lifelike naturalism.',
      'Kanchi Ghatika University: Attracted philosophers, logicians, and scholars from across Asia.',
      'Kanchipuram Silk Weaving: Centuries-old tradition of interweaving pure zari gold threads into sacred mulberry silk.'
    ],
    keyArtifacts: ['Mamallapuram Monolithic Shore Temple', 'Pancha Rathas Five Monolithic Chariots', 'Kanchi Kailasanathar Sandstone Frescoes', 'Mahendravarman Mandagapattu Rock Inscription']
  }
];

const cultureData = [
  {
    id: 'bharatanatyam',
    title: 'Bharatanatyam (பரதநாட்டியம்)',
    category: 'Sacred Classical Dance',
    subtitle: 'Cosmic Geometry, Rhythmic Adavus & Expressive Abhinaya',
    origin: '2,000+ Years · Natya Shastra & Temple Sanctums',
    desc: 'Bharatanatyam is one of the world’s oldest, most geometrically refined classical dance traditions. Originating as a sacred devotional offering performed in the temple mandapams of Tamil Nadu, it harmonizes three foundational pillars: Bha (Bhava - Emotion), Ra (Raga - Melody), and Ta (Tala - Rhythm). The dancer’s posture is anchored in the foundational "Aramandi" (half-seated demi-plié), which geometrically mirrors the symmetry of monolithic Dravidian temple pillars. Through crisp rhythmic footwork (Adavus), 28 single-hand (Asamyutta) and 24 double-hand (Samyutta) Mudras, and emotive facial nuance (Abhinaya), the practitioner translates intricate Sanskrit and Tamil poetry into a living visual symphony embodying the cosmic dance of Nataraja.',
    features: [
      'Aramandi & Murmandi: Low-center-of-gravity architectural balance mirroring temple mandala proportions.',
      '28 Asamyutta & 24 Samyutta Hastas: Precise hand mudras conveying gods, animals, elements, and deep philosophical concepts.',
      'Solkattu & Nattuvangam: Vocalization of complex rhythmic mnemonics (Tha-Dhi-Thom-Nam) accompanied by bronze cymbals.',
      'Bhakti & Nayaka-Nayika Bhava: Spiritual surrender depicted through sublime metaphorical storytelling.'
    ],
    heritageTags: ['Natya Shastra Roots', 'Tanjore Quartet Codification', 'Sacred Aramandi Symmetry', 'UNESCO Global Intangible Icon']
  },
  {
    id: 'silambam',
    title: 'Silambam & Ancient Martial Traditions (சிலம்பம்)',
    category: 'Sangam Martial Heritage',
    subtitle: 'Bamboo Staff Warfare & Varma Kalai Dating to 2nd Century BCE',
    origin: 'Ancient Tamilakam · Mentioned in Sangam Epic Silappadikaram',
    desc: 'Documented extensively in the Sangam epic Silappadikaram and ancient martial treatises, Silambam is recognized as one of humanity’s oldest surviving armed combat disciplines. The primary weapon is a seasoned Pirambu (flexible mountain bamboo) staff measured to the practitioner’s forehead height. When twirled at blinding speeds, the staff creates an impenetrable kinetic sphere of defense and lightning-fast offensive strikes. Beyond the bamboo stave, advanced Silambam masters wield deadly traditional weapons including the deer-horn Maduvu, the three-bladed Valari (indigenous boomerang), and the Surul Vaal (lethal flexible ribbon-steel whip). Silambam is intrinsically intertwined with Varma Kalai—the ancient Tamil anatomical science of the 108 vital energetic pressure points used for defensive incapacitation and therapeutic healing.',
    features: [
      'Seasoned Pirambu Bamboo Mastery: Precision strikes, spins, blocks, and sweeps executed with acrobatic agility.',
      'Surul Vaal & Maduvu: Specialized indigenous weaponry requiring years of heightened spatial discipline.',
      'Varma Kalai Pressure Points: Scientific knowledge of 108 vital Marma junctions governing neurological reflexes.',
      'Kaaladi Footwork Systems: Hexagonal and circular footwork patterns inspired by tigers, snakes, and fighting eagles.'
    ],
    heritageTags: ['2nd Century BCE Roots', 'Silappadikaram Epic Reference', 'Varma Kalai Anatomy', 'Ancient Warrior Self-Defense']
  },
  {
    id: 'bronze-metallurgy',
    title: 'Swamimalai Lost-Wax Bronze Metallurgy (ஐம்பொன் கலை)',
    category: 'Sacred Metallurgy & Sculpture',
    subtitle: 'Panchaloha Sacred Alchemy & The Celestial Nataraja Icon',
    origin: 'Chola Golden Age (9th–13th Century CE) · Swamimalai Guilds',
    desc: 'The sacred bronze sculptures of Tamil Nadu represent the pinnacle of medieval global metallurgy. Handcrafted by hereditary Sthapatis in Swamimalai holding unbroken generational knowledge, every bronze sculpture is crafted via the cire-perdue (lost-wax) technique—meaning each finished work is a completely unique, unrepeatable masterpiece with no joint, seam, or weld. The icons are cast from Panchaloha (five sacred metals): copper (sacred base), zinc, tin, silver, and gold, blended in astrological proportions to yield resonant acoustic properties and enduring sheen. The crowning masterpiece of this tradition is the cosmic Nataraja—the dancing Shiva enclosed within a halo of fire (Prabhavali), celebrated by quantum physicists like Fritjof Capra and Carl Sagan as the ultimate visual metaphor for the continuous kinetic pulsation of the cosmos.',
    features: [
      'Cire-Perdue (Lost Wax) Process: Sculpting intricate beeswax models before encasing in Cauvery clay molds.',
      'Panchaloha Five-Metal Resonance: Astrological alloy engineered for metaphysical vibration and millennial longevity.',
      'Swamimalai GI Tag: Geographical Indication protecting the ancient lineage of hereditary bronze sthapatis.',
      'Cosmic Nataraja Iconography: Damaru drum of creation, Agni flame of dissolution, and Abhaya gesture of protection.'
    ],
    heritageTags: ['Swamimalai UNESCO/GI Tag', 'Panchaloha Five-Metal Alloy', 'Seamless Lost-Wax Casting', 'Cosmic Nataraja Icon']
  },
  {
    id: 'sangam-literature',
    title: 'Classical Sangam Literature & Thirukkural (சங்க இலக்கியம்)',
    category: 'Immortal Classical Poetics',
    subtitle: 'Ancient Poetic Canons, Agam/Puram Dichotomy & The Universal Kural',
    origin: '300 BCE – 300 CE · World’s Oldest Living Classical Language',
    desc: 'Tamil holds the rare distinction of being recognized as an unbroken living classical language with literature dating continuously over two and a half millennia. The ancient Sangam corpus—encompassing the Tholkappiyam (comprehensive treatise on phonetics, grammar, and poetics), the Ettuthogai (Eight Anthologies), and the Pathuppattu (Ten Idylls)—reflects a remarkably secular, nature-attuned humanist society. The poetry is organized into two timeless realms: Agam (the interior landscape of human emotional intimacy and love, paired with five distinct ecological landscapes or Thinai) and Puram (the exterior world of heroic valor, ethics, kingship, and justice). Central to this heritage is the Thirukkural authored by sage Thiruvalluvar—1,330 seven-word couplets that articulate universal ethical guidance on virtue (Aram), wealth/governance (Porul), and love (Inbam) devoid of sectarian dogma.',
    features: [
      'Five Ecological Landscapes (Ainthinai): Kurinji (mountains), Mullai (forests), Marutham (pastures), Neithal (coasts), and Paalai (desert).',
      'The Universal Thirukkural: 1,330 couplets translated into over 40 global languages for their secular moral clarity.',
      'Tholkappiyam Grammatical Treatise: Precise linguistic taxonomy predating most European classical literature.',
      '"யாதும் ஊரே யாவரும் கேளிர்": Immortal Sangam decree proclaiming global brotherhood and common humanity.'
    ],
    heritageTags: ['Oldest Living Classical Tongue', 'Five Thinai Landscapes', '1,330 Ethical Kural Couplets', 'Agam & Puram Poetic Canon']
  },
  {
    id: 'carnatic-music',
    title: 'Carnatic Classical Music & Acoustic Stone (கர்நாடக இசை)',
    category: 'Sacred Melodic & Acoustic Architecture',
    subtitle: '72 Melakarta Ragas, Tala Mathematics & Singing Granite Pillars',
    origin: 'Ancient Tamil Pannisai Tradition · Margazhi Festival',
    desc: 'Tamil Nadu is the beating spiritual heart of Carnatic classical music, South Asia’s deeply intellectual and melodic musical tradition. Rooted in the ancient Tamil Pannisai hymns of the Thevaram and Thiruvasagam, Carnatic music is organized around an exhaustive mathematical matrix of 72 Melakarta (parent scales) and thousands of Janya ragas, governed by precise rhythmic cycles (Talas). Every December, Chennai hosts the world’s largest classical music gathering—the month-long Margazhi Season. Remarkably, Tamil architects physicalized this musical genius into stone: temples like the Nellaiappar Shrine in Tirunelveli and Meenakshi Amman in Madurai contain clusters of monolithic granite musical pillars (Isai Thoongal). When tapped gently, each carved stone column resonates at specific, pitch-perfect frequencies mimicking the Sapta Swaras (the seven musical notes).',
    features: [
      '72 Melakarta Raga Scheme: Exhaustive mathematical taxonomy of parent scales formulated with rigorous precision.',
      'Acoustic Musical Stone Pillars: Solid granite pillars carved from resonant core rock producing bell-like musical frequencies.',
      'Chennai Margazhi Music Season: World’s largest annual performing arts festival hosting thousands of concerts.',
      'Instrumental Mastery: Saraswati Veena, Mridangam, Ghatam, Kanjira, and the thunderous temple Nadaswaram.'
    ],
    heritageTags: ['72 Parent Melakarta Scales', 'Tirunelveli Musical Granite Pillars', 'Chennai Margazhi Festival', 'Sacred Temple Nadaswaram']
  },
  {
    id: 'dravidian-architecture',
    title: 'Dravidian Monolithic Temple Architecture (திராவிடக் கலை)',
    category: 'Architectural Monumentality',
    subtitle: 'Granite Vimanas, Monumental Gopurams & 1000-Pillar Mandapams',
    origin: '7th – 17th Century CE · Pallava, Chola, Pandya, Nayaka Eras',
    desc: 'Dravidian temple architecture is a monumental synthesis of cosmic geometry, structural engineering, and stone masonry. Constructed primarily with interlocking, dry-laid crystalline granite blocks without mortar or binder, these temple complexes were built to endure for eternity. The key architectural components include the Vimana (the pyramidal tower soaring over the inner sanctum / Garbhagriha), the soaring polychrome Gopurams (multi-tiered gateway portals marking entry into the sacred realm), the expansive Aayiram Kaal Mandapams (thousand-pillar stone pavilions sculpted with lifelike cavalry and mythological dancers), and vast concentric courtyards (Prakarams) designed as acoustic and spiritual insulation for meditation and ritual worship.',
    features: [
      'Interlocking Granite Construction: Multi-ton dry-stone granite assembly engineered to resist seismic shifts for a millennium.',
      'Towering Gateway Gopurams: Multi-tiered tapering portals adorned with detailed stucco iconographic narratives.',
      'Aayiram Kaal Mandapam: Thousand-pillared hall uniting acoustic reverberation with architectural rhythm.',
      'Sacred Temple Water Tanks (Teppakulam): Hydraulic engineering systems providing rain harvesting and cooling.'
    ],
    heritageTags: ['Mortarless Granite Masonry', 'Stepped Pyramidal Vimanas', '1000-Pillar Hypostyle Halls', 'Sacred Teppakulam Hydraulics']
  }
];

// ─── Full-Page Immersive Heritage Portal Engine ──────────────────────────────
function initHeritageModal() {
  const portal = document.getElementById('heritage-modal-overlay');
  const scrollContainer = document.getElementById('hm-content-scroll');
  const tabHistories = document.getElementById('hm-tab-histories');
  const tabCulture = document.getElementById('hm-tab-culture');
  const closeBtn = document.getElementById('hm-close-btn');

  if (!portal || !scrollContainer) return;

  const renderHistories = () => {
    scrollContainer.innerHTML = `
      <!-- Hero Editorial Banner -->
      <header class="hp-section-hero">
        <div class="hp-hero-meta">
          <span class="hp-tamil-badge">வரலாற்றுச் சுவடுகள்</span>
          <span class="hp-hero-kicker">CHRONICLES OF CLASSICAL TAMILAKAM // 3,000 BCE – 1400 CE</span>
        </div>
        <h1 class="hp-hero-title">THE FOUR IMPERIAL DYNASTIES</h1>
        <p class="hp-hero-subtitle">
          Three millennia of sovereign thalassocracies, ocean-crossing armadas, literary conclaves, and monolithic granite architecture that shaped Asian civilizational history.
        </p>

        <!-- Metrics Ribbon -->
        <div class="hp-metrics-ribbon">
          <div class="hp-metric-cell">
            <span class="hp-mc-val">3,000+</span>
            <span class="hp-mc-lbl">YEARS RECORDED HISTORY</span>
          </div>
          <div class="hp-metric-cell">
            <span class="hp-mc-val">4</span>
            <span class="hp-mc-lbl">IMPERIAL REALMS</span>
          </div>
          <div class="hp-metric-cell">
            <span class="hp-mc-val">38</span>
            <span class="hp-mc-lbl">HERITAGE DISTRICTS</span>
          </div>
          <div class="hp-metric-cell">
            <span class="hp-mc-val">UNESCO</span>
            <span class="hp-mc-lbl">GREAT LIVING MONUMENTS</span>
          </div>
        </div>

        <blockquote class="hp-hero-epigraph">
          <span class="hp-quote-tamil">"யாதும் ஊரே யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா"</span>
          <span class="hp-quote-trans">"To us all towns are one, all people our kin; Good and evil come not from others but from within." — Kaniyan Poongundranar (Purananuru 192, c. 300 BCE)</span>
        </blockquote>
      </header>

      <!-- Dynasties Master Showcase Grid -->
      <section class="hp-dynasties-grid" aria-label="Ancient Tamil Dynasties">
        ${historiesData.map((d, idx) => `
          <article class="hp-dynasty-card" data-dynasty="${d.id}">
            <div class="hpd-top-header">
              <div class="hpd-index-badge">DYNASTY 0${idx + 1} // ${d.emblem}</div>
              <div class="hpd-era-pill">${d.era}</div>
            </div>

            <div class="hpd-title-row">
              <h2 class="hpd-name">${d.dynasty}</h2>
              <div class="hpd-capitals">CAPITAL CITIES: <span class="hpd-cap-val">${d.capital}</span></div>
            </div>

            <p class="hpd-tagline">✦ ${d.tagline}</p>

            <div class="hpd-metrics-row">
              ${d.metrics.map(m => `
                <div class="hpd-mini-metric">
                  <span class="hpd-mm-lbl">${m.label}</span>
                  <span class="hpd-mm-val">${m.val}</span>
                </div>
              `).join('')}
            </div>

            <div class="hpd-body-text">
              <p>${d.desc}</p>
            </div>

            <div class="hpd-pillars-box">
              <h4 class="hpd-pillars-title">STRATEGIC CIVILIZATIONAL BREAKTHROUGHS</h4>
              <ul class="hpd-pillars-list">
                ${d.strategicHighlights.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>

            <div class="hpd-artifacts-footer">
              <span class="hpd-af-label">ARCHAEOLOGICAL & ARCHITECTURAL ANCHORS:</span>
              <div class="hpd-af-tags">
                ${d.keyArtifacts.map(a => `<span class="hpd-artifact-pill">🏛 ${a}</span>`).join('')}
              </div>
            </div>
          </article>
        `).join('')}
      </section>
    `;
  };

  const renderCulture = () => {
    scrollContainer.innerHTML = `
      <!-- Hero Editorial Banner -->
      <header class="hp-section-hero">
        <div class="hp-hero-meta">
          <span class="hp-tamil-badge">கலை & பண்பாடு</span>
          <span class="hp-hero-kicker">SACRED LIVING HERITAGE // TIMELESS ARTS & SANGAM TRADITIONS</span>
        </div>
        <h1 class="hp-hero-title">TAMIL CLASSICAL ARTS & HERITAGE</h1>
        <p class="hp-hero-subtitle">
          Sacred temple dances, 2,200-year-old martial disciplines, lost-wax Panchaloha metallurgy, universal ethical literature, and acoustic granite architecture nurtured through unbroken generational lineages.
        </p>

        <!-- Epigraph Banner -->
        <blockquote class="hp-hero-epigraph">
          <span class="hp-quote-tamil">"அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு"</span>
          <span class="hp-quote-trans">"As the letter 'A' is the origin of all speech, so is the Primordial Consciousness the source of the universe." — Thirukkural, Couplet 1 (c. 300 BCE)</span>
        </blockquote>
      </header>

      <!-- Classical Arts Master Grid -->
      <section class="hp-culture-grid" aria-label="Tamil Classical Arts & Traditions">
        ${cultureData.map((c, idx) => `
          <article class="hp-culture-card" data-culture="${c.id}">
            <div class="hpc-top-header">
              <span class="hpc-index-badge">DISCIPLINE 0${idx + 1} // ${c.category}</span>
              <span class="hpc-origin-pill">${c.origin}</span>
            </div>

            <h2 class="hpc-name">${c.title}</h2>
            <p class="hpc-subtitle">✦ ${c.subtitle}</p>

            <div class="hpc-body-text">
              <p>${c.desc}</p>
            </div>

            <div class="hpc-features-box">
              <h4 class="hpc-features-title">CORE PRINCIPLES & ANATOMICAL RIGOR</h4>
              <ul class="hpc-features-list">
                ${c.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>

            <div class="hpc-tags-footer">
              ${c.heritageTags.map(t => `<span class="hpc-tag-pill">✦ ${t}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </section>
    `;
  };

  const openPortal = (tab = 'histories') => {
    portal.classList.add('active');
    portal.classList.add('open');
    document.body.classList.add('modal-open');
    if (tab === 'culture') {
      tabCulture.classList.add('active');
      tabHistories.classList.remove('active');
      tabCulture.setAttribute('aria-selected', 'true');
      tabHistories.setAttribute('aria-selected', 'false');
      renderCulture();
    } else {
      tabHistories.classList.add('active');
      tabCulture.classList.remove('active');
      tabHistories.setAttribute('aria-selected', 'true');
      tabCulture.setAttribute('aria-selected', 'false');
      renderHistories();
    }
    scrollContainer.scrollTop = 0;
  };

  const closePortal = () => {
    portal.classList.remove('active');
    portal.classList.remove('open');
    document.body.classList.remove('modal-open');
  };

  tabHistories.addEventListener('click', () => {
    tabHistories.classList.add('active');
    tabCulture.classList.remove('active');
    tabHistories.setAttribute('aria-selected', 'true');
    tabCulture.setAttribute('aria-selected', 'false');
    renderHistories();
    scrollContainer.scrollTop = 0;
  });

  tabCulture.addEventListener('click', () => {
    tabCulture.classList.add('active');
    tabHistories.classList.remove('active');
    tabCulture.setAttribute('aria-selected', 'true');
    tabHistories.setAttribute('aria-selected', 'false');
    renderCulture();
    scrollContainer.scrollTop = 0;
  });

  closeBtn.addEventListener('click', closePortal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && portal.classList.contains('active')) {
      closePortal();
    }
  });

  window.openHeritageModal = openPortal;
}

// ─── HUD Bar ─────────────────────────────────────────────────────────────────
function buildHUD() {
  document.getElementById('hud').innerHTML = `
    <div class="hud-logo" id="hud-logo">
      <span class="hud-logo-title">Tamil Nadu</span>
      <span class="hud-logo-sub">360° Heritage</span>
    </div>
    <div class="hud-status">
      <span id="hud-view-label">LANDING VIEW</span> &nbsp;·&nbsp;
      <span>TN // 38 DISTRICTS</span>
    </div>
    <button class="hud-btn" id="atlas-toggle">EXPLORE 38 DISTRICTS</button>
  `;
  document.getElementById('hud-logo').addEventListener('click', returnToHero);
  document.getElementById('atlas-toggle').addEventListener('click', openAtlas);
}

function initHUDScroll() {
  const hud = document.getElementById('hud');
  window.addEventListener('scroll', () => {
    hud.classList.toggle('scrolled', window.scrollY > 120);
  });
}

// ─── Audio Engine ────────────────────────────────────────────────────────────
const audioEngine = new AudioEngine();

// ─── Curated Iconic Landmark Slides ──────────────────────────────────────────
const landmarkSlides = [
  {
    num: '03',
    districtId: 'thanjavur',
    archiveTag: 'ARCHIVE NO. 03 // IMPERIAL CHOLA REALM',
    shortTag: 'ARCHIVE NO. 03 / SOUTHERN HERITAGE',
    kicker: 'CHOLA IMPERIAL SEAT',
    title: 'BRIHADEESWARAR BIG TEMPLE',
    subtitle: 'THE ARCHITECTURAL & CULTURAL SOUL OF THE SOUTH',
    coords: '10.7870° N, 79.1378° E',
    image: '/assets/images/thanjavur_temple.jpg',
  },
  {
    num: '02',
    districtId: 'madurai',
    archiveTag: 'ARCHIVE NO. 02 // PANDYA DYNASTY',
    shortTag: 'ARCHIVE NO. 02 / MEENAKSHI AMMAN',
    kicker: 'FOURTEEN SACRED GOPURAMS',
    title: 'MEENAKSHI AMMAN TEMPLE',
    subtitle: 'THE ANCIENT CRADLE OF TAMIL SANGAM LITERATURE',
    coords: '9.9252° N, 78.1198° E',
    image: '/assets/images/madurai_temple_1793010397489.jpg',
  },
  {
    num: '01',
    districtId: 'chennai',
    archiveTag: 'ARCHIVE NO. 01 // COROMANDEL COAST',
    shortTag: 'ARCHIVE NO. 01 / SEVENTH-CENTURY HARBOR',
    kicker: 'DRAVIDIAN COASTAL CITADEL',
    title: 'KAPALEESHWARAR TEMPLE',
    subtitle: 'SEVENTH-CENTURY MARITIME GATEWAY & SACRED HARBOR',
    coords: '13.0827° N, 80.2707° E',
    image: '/assets/images/chennai_temple.jpg',
  },
  {
    num: '04',
    districtId: 'coimbatore',
    archiveTag: 'ARCHIVE NO. 04 // VELLIANGIRI FOOTHILLS',
    shortTag: 'ARCHIVE NO. 04 / SOUTHERN HERITAGE',
    kicker: 'WESTERN GHATS RIDGEWAY',
    title: 'MARUDAMALAI HILL TEMPLE',
    subtitle: 'ANCIENT GRANITE TEMPLE SURVEYING THE VELLIANGIRI HILLS',
    coords: '11.0168° N, 76.9558° E',
    image: '/assets/images/coimbatore_temple_1793010380097.jpg',
  },
  {
    num: '05',
    districtId: 'theni',
    archiveTag: 'ARCHIVE NO. 05 // CARDAMOM HIGHLANDS',
    shortTag: 'ARCHIVE NO. 05 / CLOUD FORESTS',
    kicker: 'MEGHAMALAI CLOUD FORESTS',
    title: 'HIGHWAVYS TEA CANOPY',
    subtitle: 'MIST-VEILED SHOLA RANGES & THE CRADLE OF VAIGAI RIVER',
    coords: '10.0104° N, 77.4768° E',
    image: '/assets/images/theni_hills_1793010414064.jpg',
  },
  {
    num: '06',
    districtId: 'tirunelveli',
    archiveTag: 'ARCHIVE NO. 06 // TAMIRABARANI BASIN',
    shortTag: 'ARCHIVE NO. 06 / MUSICAL PILLARS',
    kicker: 'SWAMY NELLAIAPPAR SHRINE',
    title: 'THE MUSICAL PILLARS',
    subtitle: 'MONOLITHIC RESONANT GRANITE SCULPTED IN TONAL OCTAVES',
    coords: '8.7139° N, 77.7567° E',
    image: '/assets/images/tirunelveli_temple_1793010428386.jpg',
  },
  {
    num: '26',
    districtId: 'tenkasi',
    archiveTag: 'ARCHIVE NO. 26 // WESTERN GHATS CASCADE',
    shortTag: 'ARCHIVE NO. 26 / COURTALLAM FALLS',
    kicker: 'COURTALLAM HEALING DELUGE',
    title: 'NINE SACRED WATERFALLS',
    subtitle: 'MEDICINAL MOUNTAIN HERB WATERS OF THE SOUTHERN GHATS',
    coords: '8.9594° N, 77.3149° E',
    image: '/assets/images/waterfall_scenic_1793010804110.jpg',
  },
  {
    num: '09',
    districtId: 'nilgiris',
    archiveTag: 'ARCHIVE NO. 09 // BLUE MOUNTAINS BIOSPHERE',
    shortTag: 'ARCHIVE NO. 09 / HIGHEST ORGANIC TEA',
    kicker: 'NILGIRIS CLOUD TERRACES',
    title: 'ORGANIC TEA HIGHLANDS',
    subtitle: 'EMERALD CANOPIES KISSED BY DAWN AT 2,600 METERS',
    coords: '11.4064° N, 76.6932° E',
    image: '/assets/images/tea_plantation_1793010831550.jpg',
  },
];

let heroSlideshowTimer = null;
let currentHeroSlide = 0;
let isHeroSlideshowHovered = false;

// ─── Hero Section ────────────────────────────────────────────────────────────
function buildHero() {
  const hero = document.getElementById('hero');
  
  // Render full luxury reference layout
  const slidesHtml = landmarkSlides.map((s, idx) => `
    <img class="cs-slide-layer ${idx === 0 ? 'active' : ''}" data-index="${idx}" src="${s.image}" alt="${s.title}" loading="${idx === 0 ? 'eager' : 'lazy'}" />
  `).join('');

  // Generate 14 sprocket holes for celluloid film border
  const sprocketsHtml = Array.from({ length: 14 }).map(() => '<div class="sprocket-hole"></div>').join('');

  // Generate 38 filmstrip cells
  const filmstripCellsHtml = filmstripDistricts.map((d, idx) => `
    <div class="film-cell ${d.id === selectedDistrictId || idx === 0 ? 'active' : ''}" data-num="${d.num}" data-id="${d.id}" data-index="${idx}" title="${d.name} · ${d.tamil}">
      <div class="film-cell-thumb-wrap">
        <img class="film-cell-thumb" src="${d.image}" alt="${d.name}" loading="lazy" />
        <div class="film-cell-gradient"></div>
        ${d.active ? '<span class="film-cell-active-tag">ACTIVE 360°</span>' : ''}
        <div class="film-cell-info">
          <span class="film-cell-num">${d.num}</span>
          <span class="film-cell-name">${d.name} <span class="film-cell-arrow">↓</span></span>
        </div>
      </div>
    </div>
  `).join('');

  hero.innerHTML = `
    <!-- Ambient 3D Topographic Canvas Background -->
    <canvas id="three-canvas"></canvas>

    <!-- Main Viewport Architectural Stage Frame -->
    <div class="hero-viewport-frame">
      <!-- Left Editorial Stage Area (Cols 1, 2, 3) -->
      <div class="stage-main-area">

        <!-- Row 1: Top Navigation Bar -->
        <header class="stage-nav-bar">
          <!-- Top-Left Branding: Prominent & Striking NammaOoruLife -->
          <div class="brand-logo-wrap" id="hero-brand-logo" role="button" tabindex="0" title="NammaOoruLife // 360° Heritage · Explore 38 Districts">
            <div class="brand-crest-box">
              <svg class="brand-gopuram-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 2L15 7H21L18 2Z" fill="url(#brandGoldGrad)"/>
                <circle cx="18" cy="2" r="1.5" fill="#FFE27A"/>
                <path d="M13 8H23L22 12H14L13 8Z" stroke="#D4AF37" stroke-width="1.2" fill="rgba(212,175,55,0.25)"/>
                <path d="M11 13H25L24 17H12L11 13Z" stroke="#D4AF37" stroke-width="1.2" fill="rgba(212,175,55,0.3)"/>
                <path d="M9 18H27L26 23H10L9 18Z" stroke="#D4AF37" stroke-width="1.2" fill="rgba(212,175,55,0.35)"/>
                <path d="M7 24H29L28 29H8L7 24Z" stroke="#D4AF37" stroke-width="1.2" fill="rgba(212,175,55,0.4)"/>
                <path d="M5 30H31V34H5V30Z" stroke="#D4AF37" stroke-width="1.2" fill="#D4AF37"/>
                <path d="M15 34V28Q18 26 21 28V34" fill="#FF9E2C"/>
                <defs>
                  <linearGradient id="brandGoldGrad" x1="15" y1="2" x2="21" y2="7" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFE27A"/>
                    <stop offset="1" stop-color="#D4AF37"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="brand-text-block">
              <div class="brand-name">Namma<span class="brand-accent">Ooru</span>Life</div>
            </div>
          </div>

          <!-- Top-Right Navigation Links -->
          <div class="stage-nav-right">
            <button class="hen-nav-btn" id="nav-histories" aria-label="Explore Tamil Dynasties">HISTORIES</button>
            <button class="hen-nav-btn" id="nav-culture" aria-label="Explore Tamil Culture & Arts">CULTURE</button>
          </div>
        </header>

        <!-- Row 2: Monumental Title Row -->
        <div class="stage-title-row">
          <h1 class="hero-monumental-heading">TAMIL NADU</h1>
        </div>

        <!-- Row 3: The 3 Equal-Height Cards Row -->
        <div class="stage-cards-row">
          
          <!-- Authentic Dravidian Temple Architectural & Cultural Blueprint Backdrop (Matches Reference Exact Aesthetic) -->
          <div class="stage-cards-backdrop" aria-hidden="true">
            <svg class="scb-svg" viewBox="0 0 1600 700" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <!-- Stone frieze pattern -->
                <pattern id="templeFriezePattern" width="28" height="14" patternUnits="userSpaceOnUse">
                  <path d="M0 7 L7 2 L14 7 L21 2 L28 7 L21 12 L14 7 L7 12 Z" stroke="#D4AF37" stroke-width="0.8" fill="none"/>
                  <circle cx="14" cy="7" r="1.5" fill="#D4AF37"/>
                </pattern>
              </defs>

              <!-- 1. Top Horizontal Stone Relief Frieze Band (Across Card 2 and 3: X = 250 to 1600) -->
              <g class="scb-frieze-group">
                <line x1="250" y1="12" x2="1600" y2="12" stroke="#D4AF37" stroke-width="1.3"/>
                <rect x="250" y="12" width="1350" height="14" fill="url(#templeFriezePattern)"/>
                <line x1="250" y1="26" x2="1600" y2="26" stroke="#D4AF37" stroke-width="1.3"/>
                <line x1="250" y1="30" x2="1600" y2="30" stroke="#D4AF37" stroke-width="0.5" stroke-dasharray="3 4"/>
              </g>

              <!-- 2. Sacred Kolam Knot (Above Center Card, X ~ 610) -->
              <g class="scb-mid-kolam" transform="translate(590, 16)">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" stroke-width="0.7" stroke-dasharray="2 3"/>
                <polygon points="20,4 36,20 20,36 4,20" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M20 8 C28 14 32 20 32 20 C32 20 28 26 20 32 C12 26 8 20 8 20 C8 20 12 14 20 8 Z" stroke="#D4AF37" stroke-width="0.8"/>
                <circle cx="20" cy="20" r="2.5" fill="#D4AF37"/>
              </g>

              <!-- 3. Upper Right Annapakshi (Sacred Tamil Swan/Peacock) Motif (X ~ 1470, Y ~ 20) -->
              <g class="scb-annapakshi" transform="translate(1470, 20)">
                <!-- Base Lotus Pedestal -->
                <path d="M15 65 Q40 58 65 65" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M20 65 Q40 72 60 65" stroke="#D4AF37" stroke-width="0.7"/>
                <!-- Feet / Claws -->
                <line x1="34" y1="58" x2="32" y2="64" stroke="#D4AF37" stroke-width="0.9"/>
                <line x1="46" y1="58" x2="48" y2="64" stroke="#D4AF37" stroke-width="0.9"/>
                <!-- Body & Curved Neck -->
                <path d="M32 58 C25 51 22 40 29 34 C34 29 40 31 43 36 C48 43 50 54 45 58 Z" stroke="#D4AF37" stroke-width="1"/>
                <path d="M32 34 C30 27 29 18 33 12 C37 8 42 8 44 11 C45 15 43 23 40 32" stroke="#D4AF37" stroke-width="1"/>
                <!-- Head, Beak, Eye & Ornate Crest -->
                <path d="M44 11 C48 10 52 11 55 13 L51 16 C48 15 45 15 43 16 Z" stroke="#D4AF37" stroke-width="0.9"/>
                <circle cx="41" cy="11" r="1.3" fill="#D4AF37"/>
                <!-- Crest Plumes (Kalapam) -->
                <path d="M38 9 Q35 1 29 0 M40 8 Q41 -1 44 -2 M42 9 Q48 1 51 1" stroke="#D4AF37" stroke-width="0.8"/>
                <circle cx="29" cy="0" r="1.2" fill="#D4AF37"/>
                <circle cx="44" cy="-2" r="1.2" fill="#D4AF37"/>
                <circle cx="51" cy="1" r="1.2" fill="#D4AF37"/>
                <!-- Ornate Sweeping Tail Plumage (Annapakshi Flowing Feather Scrolls) -->
                <path d="M28 44 C18 41 8 34 3 25 C-1 18 3 11 10 11 C19 11 26 24 30 33" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M26 47 C14 47 4 43 -2 34 C-7 25 -2 16 7 18 C16 20 21 33 28 40" stroke="#D4AF37" stroke-width="0.8"/>
                <path d="M30 52 C18 56 7 56 0 49 C-5 42 0 33 9 33 C18 33 25 42 30 49" stroke="#D4AF37" stroke-width="0.8"/>
                <circle cx="3" cy="25" r="1.8" stroke="#D4AF37" stroke-width="0.7"/>
                <circle cx="-2" cy="34" r="1.8" stroke="#D4AF37" stroke-width="0.7"/>
                <circle cx="0" cy="49" r="1.8" stroke="#D4AF37" stroke-width="0.7"/>
              </g>

              <!-- 4. Grand Dravidian Temple Gopuram Elevation Blueprint (Centered at X = 1260) -->
              <g class="scb-gopuram-group">
                <!-- Center Plumb Line Axis -->
                <line x1="1260" y1="35" x2="1260" y2="670" stroke="#D4AF37" stroke-width="0.4" stroke-dasharray="3 5"/>

                <!-- Row of 7 Kalasam Urns atop Sala Ridge (X = 1170 to 1350, Y = 50 to 80) -->
                <g stroke="#D4AF37" stroke-width="0.9">
                  <circle cx="1170" cy="62" r="3.5"/><line x1="1170" y1="50" x2="1170" y2="58"/>
                  <circle cx="1200" cy="57" r="4"/><line x1="1200" y1="45" x2="1200" y2="53"/>
                  <circle cx="1230" cy="53" r="4.5"/><line x1="1230" y1="41" x2="1230" y2="48"/>
                  <circle cx="1260" cy="50" r="5"/><line x1="1260" y1="36" x2="1260" y2="45"/>
                  <circle cx="1290" cy="53" r="4.5"/><line x1="1290" y1="41" x2="1290" y2="48"/>
                  <circle cx="1320" cy="57" r="4"/><line x1="1320" y1="45" x2="1320" y2="53"/>
                  <circle cx="1350" cy="62" r="3.5"/><line x1="1350" y1="50" x2="1350" y2="58"/>
                </g>

                <!-- Barrel-Vaulted Sala Ridge Crest (Wagon-Roof Crest with Makara End Gables, Y = 80 to 115) -->
                <path d="M1150 82 Q1260 62 1370 82 L1378 104 H1142 L1150 82 Z" stroke="#D4AF37" stroke-width="1.3"/>
                <path d="M1142 104 Q1132 78 1150 82 M1378 104 Q1388 78 1370 82" stroke="#D4AF37" stroke-width="0.9"/>
                <line x1="1136" y1="104" x2="1384" y2="104" stroke="#D4AF37" stroke-width="1.2"/>

                <!-- Tier 1 (Uppermost Tala, Y = 104 to 155) -->
                <line x1="1126" y1="104" x2="1394" y2="104" stroke="#D4AF37" stroke-width="1"/>
                <path d="M1132 104 L1118 155 H1402 L1388 104" stroke="#D4AF37" stroke-width="1.1"/>
                <!-- Center Sala Arch on Tier 1 -->
                <path d="M1244 155 V125 Q1260 118 1276 125 V155" stroke="#D4AF37" stroke-width="0.8"/>
                <line x1="1178" y1="104" x2="1170" y2="155" stroke="#D4AF37" stroke-width="0.6"/>
                <line x1="1342" y1="104" x2="1350" y2="155" stroke="#D4AF37" stroke-width="0.6"/>

                <!-- Tier 2 (Y = 155 to 215) -->
                <line x1="1104" y1="155" x2="1416" y2="155" stroke="#D4AF37" stroke-width="1.3"/>
                <path d="M1112 155 L1092 215 H1428 L1408 155" stroke="#D4AF37" stroke-width="1.2"/>
                <rect x="1106" y="155" width="308" height="7" stroke="#D4AF37" stroke-width="0.7"/>
                <line x1="1090" y1="215" x2="1430" y2="215" stroke="#D4AF37" stroke-width="1.2"/>
                <!-- Center Sala Arch & Flanking Niches on Tier 2 -->
                <path d="M1240 215 V178 Q1260 167 1280 178 V215" stroke="#D4AF37" stroke-width="0.9"/>
                <line x1="1158" y1="162" x2="1148" y2="215" stroke="#D4AF37" stroke-width="0.7"/>
                <line x1="1362" y1="162" x2="1372" y2="215" stroke="#D4AF37" stroke-width="0.7"/>
                <path d="M1182 215 V188 Q1192 182 1202 188 V215" stroke="#D4AF37" stroke-width="0.6"/>
                <path d="M1318 215 V188 Q1328 182 1338 188 V215" stroke="#D4AF37" stroke-width="0.6"/>

                <!-- Tier 3 (Y = 215 to 285) -->
                <line x1="1074" y1="215" x2="1446" y2="215" stroke="#D4AF37" stroke-width="1.4"/>
                <path d="M1082 215 L1058 285 H1462 L1438 215" stroke="#D4AF37" stroke-width="1.2"/>
                <rect x="1076" y="215" width="368" height="8" stroke="#D4AF37" stroke-width="0.7"/>
                <!-- Center Sala Arch & Details -->
                <path d="M1235 285 V240 Q1260 226 1285 240 V285" stroke="#D4AF37" stroke-width="0.9"/>
                <circle cx="1260" cy="256" r="6" stroke="#D4AF37" stroke-width="0.7"/>
                <line x1="1132" y1="223" x2="1120" y2="285" stroke="#D4AF37" stroke-width="0.7"/>
                <line x1="1388" y1="223" x2="1400" y2="285" stroke="#D4AF37" stroke-width="0.7"/>
                <path d="M1165 285 V250 Q1178 243 1191 250 V285" stroke="#D4AF37" stroke-width="0.7"/>
                <path d="M1329 285 V250 Q1342 243 1355 250 V285" stroke="#D4AF37" stroke-width="0.7"/>

                <!-- Tier 4 (Y = 285 to 370) -->
                <line x1="1040" y1="285" x2="1480" y2="285" stroke="#D4AF37" stroke-width="1.4"/>
                <path d="M1050 285 L1020 370 H1500 L1470 285" stroke="#D4AF37" stroke-width="1.2"/>
                <rect x="1042" y="285" width="436" height="9" stroke="#D4AF37" stroke-width="0.7"/>
                <!-- Center Gateway Niche on Tier 4 -->
                <path d="M1230 370 V310 Q1260 292 1290 310 V370" stroke="#D4AF37" stroke-width="1.1"/>
                <path d="M1240 370 V322 Q1260 307 1280 322 V370" stroke="#D4AF37" stroke-width="0.7"/>
                <line x1="1104" y1="294" x2="1088" y2="370" stroke="#D4AF37" stroke-width="0.7"/>
                <line x1="1416" y1="294" x2="1432" y2="370" stroke="#D4AF37" stroke-width="0.7"/>
                <path d="M1142 370 V325 Q1156 315 1170 325 V370" stroke="#D4AF37" stroke-width="0.7"/>
                <path d="M1350 370 V325 Q1364 315 1378 325 V370" stroke="#D4AF37" stroke-width="0.7"/>

                <!-- Tier 5 (Great Cornice Tier, Y = 370 to 465) -->
                <line x1="1000" y1="370" x2="1520" y2="370" stroke="#D4AF37" stroke-width="1.5"/>
                <path d="M1010 370 L976 465 H1544 L1510 370" stroke="#D4AF37" stroke-width="1.3"/>
                <rect x="1002" y="370" width="516" height="12" stroke="#D4AF37" stroke-width="0.8"/>
                <!-- Pilaster Columns on Tier 5 -->
                <line x1="1070" y1="382" x2="1050" y2="465" stroke="#D4AF37" stroke-width="0.8"/>
                <line x1="1450" y1="382" x2="1470" y2="465" stroke="#D4AF37" stroke-width="0.8"/>
                <path d="M1118 465 V405 Q1138 390 1158 405 V465" stroke="#D4AF37" stroke-width="0.8"/>
                <path d="M1362 465 V405 Q1382 390 1402 405 V465" stroke="#D4AF37" stroke-width="0.8"/>
                <!-- Center Grand Torana Arch on Tier 5 -->
                <path d="M1224 465 V395 Q1260 372 1296 395 V465" stroke="#D4AF37" stroke-width="1.2"/>
                <circle cx="1260" cy="420" r="9" stroke="#D4AF37" stroke-width="0.8"/>

                <!-- Great Kapota (Eaves) over Gateway Plinth (Y = 465 to 480) -->
                <line x1="954" y1="465" x2="1566" y2="465" stroke="#D4AF37" stroke-width="1.6"/>
                <rect x="960" y="465" width="600" height="14" stroke="#D4AF37" stroke-width="0.9"/>
                <line x1="944" y1="479" x2="1576" y2="479" stroke="#D4AF37" stroke-width="1.5"/>

                <!-- Lower Gateway Massive Stone Walls (Y = 479 to 630) -->
                <rect x="960" y="479" width="600" height="151" stroke="#D4AF37" stroke-width="1.2"/>
                <!-- Outer Pilasters & Dvārapāla Relieved Niches -->
                <line x1="1015" y1="479" x2="1015" y2="630" stroke="#D4AF37" stroke-width="0.9"/>
                <line x1="1040" y1="479" x2="1040" y2="630" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M1062 590 V515 Q1086 492 1110 515 V590" stroke="#D4AF37" stroke-width="0.8"/>
                <line x1="1132" y1="479" x2="1132" y2="630" stroke="#D4AF37" stroke-width="0.9"/>

                <line x1="1388" y1="479" x2="1388" y2="630" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M1410 590 V515 Q1434 492 1458 515 V590" stroke="#D4AF37" stroke-width="0.8"/>
                <line x1="1480" y1="479" x2="1480" y2="630" stroke="#D4AF37" stroke-width="0.9"/>
                <line x1="1505" y1="479" x2="1505" y2="630" stroke="#D4AF37" stroke-width="0.9"/>

                <!-- Grand Concentric Arched Gateway Portal (Gopura Dvara, Centered at X = 1260) -->
                <rect x="1158" y="479" width="204" height="151" stroke="#D4AF37" stroke-width="1.1"/>
                <!-- Outer Vault Arch -->
                <path d="M1172 630 V528 Q1260 475 1348 528 V630" stroke="#D4AF37" stroke-width="1.6"/>
                <!-- Inner Moulding Arch -->
                <path d="M1188 630 V544 Q1260 495 1332 544 V630" stroke="#D4AF37" stroke-width="1.2"/>
                <!-- Recessed Sanctuary Arch -->
                <path d="M1204 630 V560 Q1260 516 1316 560 V630" stroke="#D4AF37" stroke-width="0.9" stroke-dasharray="3 3"/>
                <circle cx="1260" cy="530" r="5" stroke="#D4AF37" stroke-width="0.9" fill="rgba(212,175,55,0.2)"/>
                <line x1="1172" y1="630" x2="1348" y2="630" stroke="#D4AF37" stroke-width="1.7"/>

                <!-- Base Plinths (Adhishthana & Upapitha Granite Courses, Y = 630 to 670) -->
                <line x1="910" y1="630" x2="1600" y2="630" stroke="#D4AF37" stroke-width="1.7"/>
                <rect x="920" y="630" width="670" height="18" stroke="#D4AF37" stroke-width="1"/>
                <line x1="900" y1="648" x2="1600" y2="648" stroke="#D4AF37" stroke-width="1.5"/>
                <rect x="905" y="648" width="690" height="20" stroke="#D4AF37" stroke-width="1.1"/>
                <line x1="890" y1="668" x2="1600" y2="668" stroke="#D4AF37" stroke-width="1.8"/>
              </g>

              <!-- 5. Classical Dravidian Carved Stone Pillar (Right Edge, X ~ 1560) -->
              <g class="scb-pillar-group">
                <!-- Bracket Corbel (Bodigai, Y = 95 to 145) -->
                <path d="M1560 100 C1538 100 1528 82 1533 70 L1585 70 L1585 145 L1560 145 Z" stroke="#D4AF37" stroke-width="1"/>
                <circle cx="1533" cy="70" r="2.5" fill="#D4AF37"/>
                <!-- Capital & Abacus -->
                <rect x="1546" y="145" width="42" height="9" stroke="#D4AF37" stroke-width="1"/>
                <ellipse cx="1567" cy="164" rx="19" ry="10" stroke="#D4AF37" stroke-width="0.9"/>
                <rect x="1550" y="174" width="34" height="16" stroke="#D4AF37" stroke-width="0.8"/>
                <!-- Pillar Shaft -->
                <rect x="1555" y="190" width="24" height="440" stroke="#D4AF37" stroke-width="1.2"/>
                <line x1="1562" y1="190" x2="1562" y2="630" stroke="#D4AF37" stroke-width="0.6"/>
                <line x1="1572" y1="190" x2="1572" y2="630" stroke="#D4AF37" stroke-width="0.6"/>
                <!-- Carved Moulding Rings on Shaft -->
                <rect x="1553" y="265" width="28" height="9" stroke="#D4AF37" stroke-width="0.8"/>
                <rect x="1553" y="385" width="28" height="9" stroke="#D4AF37" stroke-width="0.8"/>
                <rect x="1553" y="515" width="28" height="9" stroke="#D4AF37" stroke-width="0.8"/>
                <!-- Pedestal Base -->
                <rect x="1544" y="630" width="46" height="18" stroke="#D4AF37" stroke-width="1.1"/>
                <rect x="1538" y="648" width="58" height="20" stroke="#D4AF37" stroke-width="1.3"/>
              </g>

              <!-- 6. Flanking Kolam Motifs (Left of 38, exactly matching reference image) -->
              <g class="scb-side-kolam-1" transform="translate(1015, 315)">
                <polygon points="15,0 30,15 15,30 0,15" stroke="#D4AF37" stroke-width="0.8"/>
                <circle cx="15" cy="15" r="9" stroke="#D4AF37" stroke-width="0.6" stroke-dasharray="2 2"/>
                <path d="M15 5 C21 9 25 15 25 15 C25 15 21 21 15 25 C9 21 5 15 5 15 C5 15 9 9 15 5 Z" stroke="#D4AF37" stroke-width="0.7"/>
                <circle cx="15" cy="15" r="1.8" fill="#D4AF37"/>
              </g>

              <g class="scb-side-kolam-2" transform="translate(1005, 560)">
                <polygon points="14,0 28,14 14,28 0,14" stroke="#D4AF37" stroke-width="0.7"/>
                <circle cx="14" cy="14" r="7.5" stroke="#D4AF37" stroke-width="0.5"/>
                <circle cx="14" cy="14" r="1.6" fill="#D4AF37"/>
              </g>

              <!-- 7. Center Bottom Annapakshi Motif (Beneath Center Card, matching reference image) -->
              <g class="scb-bottom-annapakshi" transform="translate(585, 660) scale(0.65)">
                <path d="M15 35 Q40 30 65 35" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M32 30 C25 24 22 17 29 13 C34 9 40 11 43 15 C48 20 50 27 45 30 Z" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M32 13 C30 9 29 4 33 2 C37 0 42 0 44 2 C45 4 43 9 40 13" stroke="#D4AF37" stroke-width="0.9"/>
                <circle cx="41" cy="2" r="1" fill="#D4AF37"/>
                <path d="M28 20 C18 18 8 14 3 9 C-1 5 3 2 10 2 C19 2 26 9 30 14" stroke="#D4AF37" stroke-width="0.8"/>
              </g>
            </svg>
          </div>
          
          <!-- Card 1: Left Cultural Manifesto -->
          <div class="stage-card card-manifesto">
            <div class="cm-top">
              <h2 class="hc-manifesto-kicker" id="hc-manifesto-title">THE ARCHITECTURAL<br>& CULTURAL SOUL<br>OF THE SOUTH</h2>
            </div>
            
            <!-- Traditional Tamil Sikku Kolam & Stone Frieze Divider (Reference Exact Match) -->
            <div class="cm-center-motif" aria-hidden="true">
              <svg class="cm-kolam-svg" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Guidelines -->
                <circle cx="110" cy="110" r="102" stroke="#D4AF37" stroke-width="0.5" stroke-dasharray="3 4"/>
                <circle cx="110" cy="110" r="90" stroke="#D4AF37" stroke-width="0.7"/>
                <circle cx="110" cy="110" r="68" stroke="#D4AF37" stroke-width="0.6"/>
                <circle cx="110" cy="110" r="35" stroke="#D4AF37" stroke-width="0.8"/>
                <circle cx="110" cy="110" r="8" stroke="#D4AF37" stroke-width="1.2" fill="rgba(212,175,55,0.15)"/>
                
                <!-- Pulli (Dots) Matrix -->
                <circle cx="110" cy="76" r="2" fill="#D4AF37"/>
                <circle cx="110" cy="144" r="2" fill="#D4AF37"/>
                <circle cx="76" cy="110" r="2" fill="#D4AF37"/>
                <circle cx="144" cy="110" r="2" fill="#D4AF37"/>
                <circle cx="86" cy="86" r="2" fill="#D4AF37"/>
                <circle cx="134" cy="86" r="2" fill="#D4AF37"/>
                <circle cx="86" cy="134" r="2" fill="#D4AF37"/>
                <circle cx="134" cy="134" r="2" fill="#D4AF37"/>

                <!-- Interlocking Sikku Brahma Mudi Loop Petals -->
                <path d="M110 26 C132 44 148 72 148 110 C148 148 132 176 110 194 C88 176 72 148 72 110 C72 72 88 44 110 26 Z" stroke="#D4AF37" stroke-width="1.1"/>
                <path d="M26 110 C44 88 72 72 110 72 C148 72 176 88 194 110 C176 132 148 148 110 148 C72 148 44 132 26 110 Z" stroke="#D4AF37" stroke-width="1.1"/>
                
                <!-- Diagonal Intersecting Loops -->
                <path d="M51 51 C77 60 94 83 110 110 C126 137 143 160 169 169 C160 143 137 126 110 110 C83 94 60 77 51 51 Z" stroke="#D4AF37" stroke-width="0.9"/>
                <path d="M169 51 C143 60 126 83 110 110 C94 137 77 160 51 169 C60 143 83 126 110 110 C137 94 160 77 169 51 Z" stroke="#D4AF37" stroke-width="0.9"/>

                <!-- Outer Diamond Sacred Knot & Corner Accents -->
                <polygon points="110,18 202,110 110,202 18,110" stroke="#D4AF37" stroke-width="1"/>
                <polygon points="110,30 190,110 110,190 30,110" stroke="#D4AF37" stroke-width="0.6" stroke-dasharray="3 3"/>
                <line x1="110" y1="18" x2="110" y2="6" stroke="#D4AF37" stroke-width="1"/>
                <line x1="202" y1="110" x2="214" y2="110" stroke="#D4AF37" stroke-width="1"/>
                <line x1="110" y1="202" x2="110" y2="214" stroke="#D4AF37" stroke-width="1"/>
                <line x1="18" y1="110" x2="6" y2="110" stroke="#D4AF37" stroke-width="1"/>
                <circle cx="110" cy="6" r="2.5" stroke="#D4AF37" stroke-width="0.8" fill="#D4AF37"/>
                <circle cx="214" cy="110" r="2.5" stroke="#D4AF37" stroke-width="0.8" fill="#D4AF37"/>
                <circle cx="110" cy="214" r="2.5" stroke="#D4AF37" stroke-width="0.8" fill="#D4AF37"/>
                <circle cx="6" cy="110" r="2.5" stroke="#D4AF37" stroke-width="0.8" fill="#D4AF37"/>
              </svg>
              <div class="cm-stone-frieze">
                <svg class="cm-frieze-svg" viewBox="0 0 220 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="2" x2="220" y2="2" stroke="#D4AF37" stroke-width="0.9"/>
                  <line x1="0" y1="16" x2="220" y2="16" stroke="#D4AF37" stroke-width="0.9"/>
                  <path d="M10 2 L15 9 L10 16 L5 9 Z M30 2 L35 9 L30 16 L25 9 Z M50 2 L55 9 L50 16 L45 9 Z M70 2 L75 9 L70 16 L65 9 Z M90 2 L95 9 L90 16 L85 9 Z M110 2 L115 9 L110 16 L105 9 Z M130 2 L135 9 L130 16 L125 9 Z M150 2 L155 9 L150 16 L145 9 Z M170 2 L175 9 L170 16 L165 9 Z M190 2 L195 9 L190 16 L185 9 Z M210 2 L215 9 L210 16 L205 9 Z" stroke="#D4AF37" stroke-width="0.7"/>
                  <line x1="0" y1="9" x2="220" y2="9" stroke="#D4AF37" stroke-width="0.4" stroke-dasharray="2 3"/>
                </svg>
              </div>
            </div>

            <div class="cm-bottom">
              <p class="card-editorial-text" id="hc-manifesto-desc">
                A sacred confluence of monolithic Dravidian gopurams, living temple rituals, classical Sangam poetry, and eternal coastal trade routes.
              </p>
              <div class="cm-bottom-motif" aria-hidden="true">
                <svg width="44" height="24" viewBox="0 0 54 28" fill="none" stroke="#D4AF37" stroke-width="0.8">
                  <path d="M12 22 C16 17 22 13 27 13 C32 13 38 17 42 22"/>
                  <path d="M27 6 C24 10 21 14 27 20 C33 14 30 10 27 6 Z"/>
                  <circle cx="27" cy="4" r="1.3" fill="#D4AF37"/>
                  <path d="M18 20 C21 16 24 15 27 15 C30 15 33 16 36 20"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Card 2: Center Landmark Slideshow Card (Compact & Balanced) -->
          <div class="stage-card card-center-slideshow">
            <div class="center-slideshow-frame" id="center-slideshow-frame" role="button" aria-label="Explore Landmark">
              <div class="cs-slides-container" id="cs-slides-container">
                ${slidesHtml}
              </div>
              <div class="cs-vignette-layer"></div>
              <div class="cs-corner-tag-tr" id="cs-tag-tr">
                <span class="sct-archive">ARCHIVE NO. 03</span>
                <span class="sct-gold">SOUTHERN HERITAGE</span>
              </div>
              <div class="cs-corner-tag-bl" id="cs-tag-bl">
                ARCHIVE NO. 03 / SOUTHERN HERITAGE
              </div>
              <div class="cs-hover-badge">
                <span>✦ CLICK TO EXPLORE 360° ✦</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Right Monumental "38" Stat Card -->
          <div class="stage-card card-stat-38">
            <div class="cs38-top">
              <div class="hero-giant-num">38</div>
            </div>
            <div class="cs38-bottom">
              <p class="card-editorial-text">
                Thirty-eight sovereign geographic realms, unified across three millennia of imperial dynasties—from the Cauvery delta granaries to the cloud-crowned Western Ghats.
              </p>
            </div>
          </div>

        </div>

      </div>

      <!-- Right 35mm Celluloid Filmstrip Column with Top ENTER JOURNEY Button -->
      <aside class="stage-filmstrip-col" id="hc-filmstrip" aria-label="38 Districts Filmstrip">
        <!-- Top ENTER JOURNEY Button Cell -->
        <div class="filmstrip-top-header">
          <button class="filmstrip-enter-journey-btn" id="hero-enter-btn" aria-label="Enter Walkthrough Journey">
            <span>ENTER JOURNEY</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- 35mm Scrollable Body -->
        <div class="filmstrip-body-wrap">
          <div class="filmstrip-sprockets left" aria-hidden="true">${sprocketsHtml}</div>
          <div class="filmstrip-sprockets right" aria-hidden="true">${sprocketsHtml}</div>
          <div class="filmstrip-scroll-wrap" id="filmstrip-scroll" role="list">
            ${filmstripCellsHtml}
          </div>
        </div>

        <!-- Filmstrip Controls -->
        <div class="filmstrip-controls">
          <button class="filmstrip-arrow-btn" id="film-up-btn" aria-label="Scroll Up">▲</button>
          <span class="filmstrip-count-label" id="filmstrip-counter">01 / 38</span>
          <button class="filmstrip-arrow-btn" id="film-down-btn" aria-label="Scroll Down">▼</button>
        </div>
      </aside>
    </div>
  `;

  // Init Three.js ambient background
  const canvas = document.getElementById('three-canvas');
  if (canvas) {
    threeScene = new ThreeScene(canvas);
  }

  // Initialize Core Engines
  initHeroSlideshow();
  initHeroFilmstrip();

  // Navigation Event Bindings
  document.getElementById('hero-brand-logo').addEventListener('click', openAtlas);
  document.getElementById('nav-histories').addEventListener('click', () => {
    const sec = document.getElementById('histories-section');
    if (sec) {
      if (lenis) {
        lenis.scrollTo(sec, { offset: -30 });
      } else {
        sec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
  document.getElementById('nav-culture').addEventListener('click', () => {
    const sec = document.getElementById('culture-section');
    if (sec) {
      if (lenis) {
        lenis.scrollTo(sec, { offset: -30 });
      } else {
        sec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  document.getElementById('hero-enter-btn').addEventListener('click', handleEnterJourney);
  document.getElementById('center-slideshow-frame').addEventListener('click', handleEnterJourney);
}

function handleEnterJourney() {
  const targetDistrict = activeDistricts.find(d => d.id === selectedDistrictId)
    || activeDistricts.find(d => d.name.toLowerCase() === selectedDistrictId.toLowerCase())
    || activeDistricts[0];
  if (targetDistrict) {
    openDistrictView(targetDistrict);
  }
}

// ─── Continuous Auto-Rotating Landmark Slideshow ──────────────────────────────
function initHeroSlideshow() {
  const frame = document.getElementById('center-slideshow-frame');
  if (!frame) return;

  const slideImgs = frame.querySelectorAll('.cs-slide-layer');
  const tagTr = document.getElementById('cs-tag-tr');
  const tagBl = document.getElementById('cs-tag-bl');
  const manifestoTitle = document.getElementById('hc-manifesto-title');

  const goToSlide = (idx) => {
    currentHeroSlide = idx % landmarkSlides.length;
    const slide = landmarkSlides[currentHeroSlide];

    // Cross-fade image layers
    slideImgs.forEach((img, i) => {
      img.classList.toggle('active', i === currentHeroSlide);
    });

    // Update Editorial Tags
    if (tagTr) {
      tagTr.innerHTML = `
        <span class="sct-archive">ARCHIVE NO. ${slide.num}</span>
        <span class="sct-gold">${slide.kicker}</span>
      `;
    }
    if (tagBl) {
      tagBl.textContent = slide.shortTag;
    }
    if (manifestoTitle) {
      manifestoTitle.textContent = slide.subtitle;
    }

    // Keep selected district synced if user hasn't explicitly clicked a different one
    selectedDistrictId = slide.districtId;
    updateFilmstripSelection(slide.districtId);
  };

  // Auto-rotate every 4.2 seconds
  if (heroSlideshowTimer) clearInterval(heroSlideshowTimer);
  heroSlideshowTimer = setInterval(() => {
    if (!isHeroSlideshowHovered) {
      goToSlide(currentHeroSlide + 1);
    }
  }, 4200);

  frame.addEventListener('mouseenter', () => { isHeroSlideshowHovered = true; });
  frame.addEventListener('mouseleave', () => { isHeroSlideshowHovered = false; });
}

// ─── 38-District Filmstrip Momentum Scroller ──────────────────────────────────
function initHeroFilmstrip() {
  const scrollWrap = document.getElementById('filmstrip-scroll');
  const upBtn = document.getElementById('film-up-btn');
  const downBtn = document.getElementById('film-down-btn');
  const counterLabel = document.getElementById('filmstrip-counter');
  if (!scrollWrap) return;

  // Arrow navigation
  if (upBtn) {
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollWrap.scrollBy({ top: -240, behavior: 'smooth' });
    });
  }
  if (downBtn) {
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollWrap.scrollBy({ top: 240, behavior: 'smooth' });
    });
  }

  // Smooth wheel scrolling on the filmstrip container itself
  scrollWrap.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { passive: true });

  // Cell clicks: Highlights card as active and sets selectedDistrictId
  scrollWrap.querySelectorAll('.film-cell').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      const districtId = cell.dataset.id;
      const districtNum = cell.dataset.num;
      const district = filmstripDistricts.find(d => d.id === districtId);

      selectedDistrictId = districtId;

      // Play soft harmonic temple chime
      audioEngine.playTempleChime(720);

      // Highlight active cell on filmstrip
      scrollWrap.querySelectorAll('.film-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');

      if (counterLabel) {
        counterLabel.textContent = `${districtNum} / 38`;
      }

      // Check if this district matches a slide in the continuous slideshow
      const slideIdx = landmarkSlides.findIndex(s => s.districtId === districtId);
      if (slideIdx >= 0) {
        const frame = document.getElementById('center-slideshow-frame');
        if (frame) {
          const slideImgs = frame.querySelectorAll('.cs-slide-layer');
          slideImgs.forEach((img, i) => img.classList.toggle('active', i === slideIdx));
        }
        currentHeroSlide = slideIdx;
      }

      // Update Live Manifesto info
      if (district) {
        const mTitle = document.getElementById('hc-manifesto-title');
        if (mTitle) mTitle.textContent = district.subtitle;
        const tagTr = document.getElementById('cs-tag-tr');
        if (tagTr) {
          tagTr.innerHTML = `
            <span class="sct-archive">ARCHIVE NO. ${district.num}</span>
            <span class="sct-gold">${district.region}</span>
          `;
        }
        const tagBl = document.getElementById('cs-tag-bl');
        if (tagBl) tagBl.textContent = `ARCHIVE NO. ${district.num} / ${district.name}`;
      }
    });
  });

  // Track scroll position to update counter label
  scrollWrap.addEventListener('scroll', () => {
    const total = scrollWrap.scrollHeight - scrollWrap.clientHeight;
    const progress = total > 0 ? scrollWrap.scrollTop / total : 0;
    const currentNum = Math.min(38, Math.max(1, Math.round(progress * 37) + 1));
    const padNum = String(currentNum).padStart(2, '0');
    if (counterLabel) {
      counterLabel.textContent = `${padNum} / 38`;
    }
  }, { passive: true });
}

function updateFilmstripSelection(districtId) {
  const scrollWrap = document.getElementById('filmstrip-scroll');
  if (!scrollWrap) return;

  const cell = scrollWrap.querySelector(`.film-cell[data-id="${districtId}"]`);
  if (!cell) return;

  scrollWrap.querySelectorAll('.film-cell').forEach(c => c.classList.remove('active'));
  cell.classList.add('active');

  const counterLabel = document.getElementById('filmstrip-counter');
  if (counterLabel && cell.dataset.num) {
    counterLabel.textContent = `${cell.dataset.num} / 38`;
  }
}

// ─── Ambient Audio Engine Binding ─────────────────────────────────────────────
function initHeroAudio() {
  const volBtn = document.getElementById('hero-vol-btn');
  const label = document.getElementById('vol-state-label');
  if (!volBtn) return;

  volBtn.addEventListener('click', () => {
    const isPlaying = audioEngine.toggle();
    volBtn.classList.toggle('playing', isPlaying);
    if (label) {
      label.textContent = isPlaying ? 'ON' : 'OFF';
    }
  });
}

function buildMapPins() {
  const overlay = document.getElementById('map-overlay');
  if (!overlay) return;

  // Active district pins on top of Three canvas
  activeDistricts.forEach((d) => {
    const pin = document.createElement('div');
    pin.className = 'map-pin-label';
    pin.style.left = `${d.coords.x * 100}%`;
    pin.style.top = `${d.coords.y * 100}%`;
    pin.innerHTML = `
      <div class="map-pin-dot"></div>
      <span class="map-pin-name">${d.name}</span>
    `;
    pin.addEventListener('click', () => openDistrictView(d));
    overlay.appendChild(pin);
  });

  // Inactive pins
  allDistricts.filter(d => !d.active).forEach((d) => {
    const pin = document.createElement('div');
    pin.className = 'map-pin-label';
    pin.style.left = `${d.coords.x * 100}%`;
    pin.style.top = `${d.coords.y * 100}%`;
    pin.innerHTML = `
      <div class="map-pin-dot inactive"></div>
      <span class="map-pin-name inactive">${d.name}</span>
    `;
    overlay.appendChild(pin);
  });
}

// ─── Long-Form Landing Page Sections (Sandstone & Temple Gold) ──────────────
function buildHistoriesSection() {
  const section = document.getElementById('histories-section');
  if (!section) return;

  section.innerHTML = `
    <div class="landing-section-inner">
      <header class="section-intro-bar">
        <div class="sib-meta">
          <span class="sib-tamil-pill">வரலாற்றுச் சுவடுகள்</span>
          <span class="sib-kicker">CHRONICLES OF CLASSICAL TAMILAKAM // 3,000 BCE – 1400 CE</span>
        </div>
        <h2 class="sib-title">THE FOUR IMPERIAL DYNASTIES</h2>
        <p class="sib-desc">
          Three millennia of sovereign thalassocracies, ocean-crossing naval armadas, classical literary conclaves, and monolithic granite architecture that shaped Asian civilizational history.
        </p>

        <!-- Metrics Ribbon -->
        <div class="sib-metrics-row">
          <div class="sib-metric-box">
            <span class="smb-val">3,000+</span>
            <span class="smb-lbl">YEARS RECORDED HISTORY</span>
          </div>
          <div class="sib-metric-box">
            <span class="smb-val">4</span>
            <span class="smb-lbl">SOVEREIGN REALMS</span>
          </div>
          <div class="sib-metric-box">
            <span class="smb-val">38</span>
            <span class="smb-lbl">HERITAGE DISTRICTS</span>
          </div>
          <div class="sib-metric-box">
            <span class="smb-val">UNESCO</span>
            <span class="smb-lbl">GREAT LIVING MONUMENTS</span>
          </div>
        </div>

        <blockquote class="sib-quote">
          <span class="sib-quote-ta">"யாதும் ஊரே யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா"</span>
          <span class="sib-quote-en">"To us all towns are one, all people our kin; Good and evil come not from others but from within." — Kaniyan Poongundranar (Purananuru 192, c. 300 BCE)</span>
        </blockquote>
      </header>

      <div class="landing-dynasties-grid">
        ${historiesData.map((d, idx) => `
          <article class="dynasty-long-card" data-dynasty="${d.id}">
            <div class="dlc-header">
              <span class="dlc-num">DYNASTY 0${idx + 1} // ${d.emblem}</span>
              <span class="dlc-era">${d.era}</span>
            </div>
            <div class="dlc-title-group">
              <h3 class="dlc-title">${d.dynasty}</h3>
              <p class="dlc-capitals">CAPITALS: <span class="dlc-cap-val">${d.capital}</span></p>
            </div>
            <p class="dlc-tagline">✦ ${d.tagline}</p>

            <div class="dlc-metrics-strip">
              ${d.metrics.map(m => `
                <div class="dlc-metric">
                  <span class="dm-lbl">${m.label}</span>
                  <span class="dm-val">${m.val}</span>
                </div>
              `).join('')}
            </div>

            <p class="dlc-body">${d.desc}</p>

            <div class="dlc-breakthroughs">
              <h4 class="dlc-bt-title">STRATEGIC CIVILIZATIONAL BREAKTHROUGHS</h4>
              <ul>
                ${d.strategicHighlights.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>

            <div class="dlc-artifacts">
              <span class="dlc-af-label">ARCHAEOLOGICAL & ARCHITECTURAL ANCHORS:</span>
              <div class="dlc-pills">
                ${d.keyArtifacts.map(a => `<span class="dlc-pill">🏛 ${a}</span>`).join('')}
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function buildCultureSection() {
  const section = document.getElementById('culture-section');
  if (!section) return;

  section.innerHTML = `
    <div class="landing-section-inner">
      <header class="section-intro-bar">
        <div class="sib-meta">
          <span class="sib-tamil-pill">கலை & பண்பாடு</span>
          <span class="sib-kicker">SACRED LIVING HERITAGE // TIMELESS ARTS & SANGAM TRADITIONS</span>
        </div>
        <h2 class="sib-title">TAMIL CLASSICAL ARTS & HERITAGE</h2>
        <p class="sib-desc">
          Sacred temple dances, 2,200-year-old martial disciplines, lost-wax Panchaloha metallurgy, universal ethical literature, and acoustic granite architecture nurtured through unbroken generational lineages.
        </p>

        <blockquote class="sib-quote">
          <span class="sib-quote-ta">"அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு"</span>
          <span class="sib-quote-en">"As the letter 'A' is the origin of all speech, so is the Primordial Consciousness the source of the universe." — Thirukkural, Couplet 1 (c. 300 BCE)</span>
        </blockquote>
      </header>

      <div class="landing-culture-grid">
        ${cultureData.map((c, idx) => `
          <article class="culture-long-card" data-culture="${c.id}">
            <div class="clc-header">
              <span class="clc-num">DISCIPLINE 0${idx + 1} // ${c.category}</span>
              <span class="clc-origin">${c.origin}</span>
            </div>
            <h3 class="clc-title">${c.title}</h3>
            <p class="clc-subtitle">✦ ${c.subtitle}</p>
            <p class="clc-body">${c.desc}</p>

            <div class="clc-principles">
              <h4 class="clc-pr-title">CORE PRINCIPLES & ANATOMICAL RIGOR</h4>
              <ul>
                ${c.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>

            <div class="clc-pills">
              ${c.heritageTags.map(t => `<span class="clc-pill">✦ ${t}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────
function buildStatsStrip() {
  const el = document.getElementById('stats-strip');
  const stats = [
    { number: '38', label: 'Districts' },
    { number: '4', label: 'Phase I Active' },
    { number: '2000+', label: 'Years of History' },
    { number: '∞', label: 'Stories to Tell' },
  ];
  el.innerHTML = `
    <div class="stats-inner">
      ${stats.map(s => `
        <div class="stat-item fade-up">
          <div class="stat-number">${s.number}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Active Districts Section ─────────────────────────────────────────────────
function buildDistrictsSection() {
  const section = document.getElementById('districts-section');

  section.innerHTML = `
    <div class="section-header">
      <div>
        <p class="section-kicker">Phase I // Active Cultural Regions</p>
        <h2 class="section-title">Explore<br>The Living Heritage</h2>
      </div>
      <div class="section-meta">
        <span class="section-badge">4 OF 38 DISTRICTS ACTIVE</span>
        <p class="section-subtext">Click any district to launch the 50-frame inside-camera walkthrough.</p>
      </div>
    </div>
    <div class="districts-grid">
      ${activeDistricts.map((d) => buildDistrictCard(d)).join('')}
    </div>
  `;

  // Bind clicks
  section.querySelectorAll('.district-card').forEach((card) => {
    const id = card.dataset.id;
    card.addEventListener('click', () => {
      const district = activeDistricts.find(d => d.id === id);
      if (district) openDistrictView(district);
    });

    const cta = card.querySelector('.card-cta-btn');
    if (cta) {
      cta.addEventListener('click', (e) => {
        e.stopPropagation();
        const district = activeDistricts.find(d => d.id === id);
        if (district) openDistrictView(district);
      });
    }
  });

  initDistrictCardAnimations();
}

function buildDistrictCard(d) {
  const bgImages = d.places.map((p, idx) => `
    <img class="card-bg-img ${idx === 0 ? 'active' : ''}" data-index="${idx}" src="${p.thumb}" alt="${p.name}" loading="lazy" />
  `).join('');

  const placesItems = d.places.map((p, idx) => `
    <div class="card-place-item district-card__dest-item ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-name="${p.name}" data-type="${p.type}">
      <div class="cpi-thumb district-card__dest-thumb">
        <img src="${p.thumb}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="cpi-info">
        <span class="cpi-badge">${p.type}</span>
        <span class="cpi-title">${p.name}</span>
      </div>
    </div>
  `).join('');

  const eraTag = getRegionEra(d.regionId);

  return `
    <div class="district-card fade-up" data-id="${d.id}">
      <!-- Animated Landmark Background Photos with Ken Burns effect -->
      <div class="card-bg-layer" id="card-bg-${d.id}">
        ${bgImages}
      </div>

      <!-- Architectural Hairline Corner Brackets -->
      <div class="card-corner corner-tl"></div>
      <div class="card-corner corner-tr"></div>
      <div class="card-corner corner-bl"></div>
      <div class="card-corner corner-br"></div>

      <!-- Obsidian & Temple Gold Contrast Gradient -->
      <div class="card-gradient-overlay"></div>

      <!-- Card Top Header -->
      <div class="card-top-bar">
        <div class="card-region-tag">
          <span class="card-region-name">${d.region.toUpperCase()}</span>
          <span class="card-sep">/</span>
          <span class="card-era-badge">${eraTag}</span>
        </div>
        <div class="card-live-indicator">
          <span class="card-live-dot"></span>
          <span>4 DESTINATIONS · 360°</span>
        </div>
      </div>

      <!-- Card Main Hero Identity -->
      <div class="card-main-body">
        <div class="card-tamil-title">${d.tamil}</div>
        <h3 class="district-card-name">${d.name}</h3>
        <p class="district-card-tagline">"${d.tagline}"</p>
        <p class="district-card-desc">${d.description}</p>
      </div>

      <!-- Interactive Landmark Carousel Dock -->
      <div class="card-places-dock">
        <div class="card-places-header">
          <span class="cph-label">FEATURED DESTINATIONS</span>
          <span class="cph-active-name" id="cph-active-${d.id}">● ${d.places[0]?.name || ''} · ${d.places[0]?.type.toUpperCase() || ''}</span>
        </div>
        <div class="card-places-row" id="places-row-${d.id}">
          ${placesItems}
        </div>
      </div>

      <!-- Card Bottom Coordinates & Action Button -->
      <div class="card-bottom-bar">
        <div class="card-coords">
          <span class="coords-icon">✦</span>
          <span>${d.coords.lat.toFixed(4)}° N · ${d.coords.lng.toFixed(4)}° E</span>
        </div>
        <button class="card-cta-btn" data-id="${d.id}" aria-label="Explore ${d.name} 360°">
          <span>ENTER 360° WALKTHROUGH</span>
          <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  `;
}

function getRegionEra(regionId) {
  const eras = {
    kongu: 'CHOLA & CHERA LEGACY',
    pandya: 'PANDYA DYNASTY',
    chola: 'IMPERIAL CHOLA REALM',
    thondai: 'PALLAVA REALM',
    southern_hills: 'WESTERN GHATS BIOSPHERE',
  };
  return eras[regionId] || 'ANCIENT TAMIL LAND';
}

function initDistrictCardAnimations() {
  document.querySelectorAll('.district-card').forEach((card) => {
    const districtId = card.dataset.id;
    const district = activeDistricts.find(d => d.id === districtId);
    if (!district) return;

    const bgImgs = card.querySelectorAll('.card-bg-img');
    const placeItems = card.querySelectorAll('.card-place-item');
    const activeNameEl = card.querySelector(`#cph-active-${districtId}`);
    let currentIndex = 0;
    let isHovered = false;

    const setPlace = (index) => {
      currentIndex = index;
      bgImgs.forEach((img, i) => {
        img.classList.toggle('active', i === index);
      });
      placeItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
      const place = district.places[index];
      if (place && activeNameEl) {
        activeNameEl.textContent = `● ${place.name} · ${place.type.toUpperCase()}`;
      }
    };

    // Auto rotate places every 4.2 seconds with smooth cross-fade
    setInterval(() => {
      if (!isHovered && district.places && district.places.length > 0) {
        const next = (currentIndex + 1) % district.places.length;
        setPlace(next);
      }
    }, 4200);

    // Thumbnail hover
    placeItems.forEach((item) => {
      item.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        const idx = parseInt(item.dataset.index, 10);
        setPlace(idx);
      });
    });

    card.addEventListener('mouseenter', () => { isHovered = true; });
    card.addEventListener('mouseleave', () => { isHovered = false; });
  });
}

// ─── District View (Detail Modal) ────────────────────────────────────────────
function buildDistrictView() {
  const view = document.getElementById('district-view');
  view.innerHTML = `
    <button class="dv-back" id="dv-back">← Back</button>
    <div class="dv-hero">
      <div class="dv-hero-canvas" id="dv-canvas-wrap"></div>
      <div class="dv-hero-gradient"></div>
      <div class="dv-hero-content">
        <p class="dv-coords" id="dv-coords"></p>
        <h2 class="dv-name" id="dv-name"><span id="dv-name-en"></span><span class="dv-name-tamil" id="dv-name-ta"></span></h2>
        <p class="dv-tagline" id="dv-tagline"></p>
      </div>
    </div>
    <div class="dv-body">
      <p class="dv-description" id="dv-desc"></p>
      <p class="dv-places-title">Landmark Destinations</p>
      <div class="dv-places-grid" id="dv-places"></div>
    </div>
  `;
  document.getElementById('dv-back').addEventListener('click', closeDistrictView);
}

function openDistrictView(district) {
  // If active district, launch the 50-frame Canvas Scrubbing Walkthrough
  if (district.active && districtCanvasPlayer) {
    state.currentDistrict = district;
    document.getElementById('hud-view-label').textContent = district.name.toUpperCase();
    districtCanvasPlayer.open(district);
    return;
  }

  // Fallback for summary view
  state.currentDistrict = district;
  const view = document.getElementById('district-view');
  if (!view) return;

  // Populate content
  document.getElementById('dv-coords').textContent =
    `${district.coords.lat.toFixed(4)}° N · ${district.coords.lng.toFixed(4)}° E`;
  document.getElementById('dv-name-en').textContent = district.name;
  document.getElementById('dv-name-ta').textContent = district.tamil;
  document.getElementById('dv-tagline').textContent = `"${district.tagline}"`;
  document.getElementById('dv-desc').textContent = district.description;

  // Places
  const placesGrid = document.getElementById('dv-places');
  if (placesGrid) {
    placesGrid.innerHTML = (district.places || []).map(p => `
      <div class="place-card">
        <div class="place-card-img">
          <div class="place-card-placeholder">
            <span class="place-card-placeholder-icon">${getTypeIcon(p.type)}</span>
          </div>
          <img src="${p.thumb}" alt="${p.name}" loading="lazy"
               onerror="this.style.display='none'" />
        </div>
        <div class="place-card-body">
          <p class="place-card-type">${p.type}</p>
          <h4 class="place-card-name">${p.name}</h4>
        </div>
      </div>
    `).join('');
  }

  // Update HUD status
  document.getElementById('hud-view-label').textContent = district.name.toUpperCase();

  // Prevent main scroll
  if (lenis) lenis.stop();

  view.classList.add('open');
  view.scrollTop = 0;

  gsap.fromTo('#dv-name-en', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.3 });
  gsap.fromTo('#dv-name-ta', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.5 });
  gsap.fromTo('#dv-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.6 });
  gsap.fromTo('.place-card', { y: 30, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: 0.7,
    stagger: 0.12,
  });
}

function closeDistrictView() {
  const view = document.getElementById('district-view');
  view.classList.remove('open');
  state.currentDistrict = null;
  document.getElementById('hud-view-label').textContent = 'LANDING VIEW';
  if (lenis) lenis.start();
}

function returnToHero() {
  if (state.currentDistrict) closeDistrictView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getTypeIcon(type) {
  const icons = {
    Temple: '⛩', Nature: '🌿', Museum: '🏛', Waterfall: '💧',
    Palace: '🏯', Heritage: '🗿', Engineering: '🏗', Plantation: '🌱',
  };
  return icons[type] || '✦';
}

// ─── Atlas Drawer ─────────────────────────────────────────────────────────────
function initAtlasDrawer() {
  const drawer = document.getElementById('atlas-drawer');
  const overlay = document.getElementById('atlas-overlay');

  drawer.innerHTML = `
    <div class="atlas-header" style="position:relative;">
      <h2 class="atlas-title">District Atlas</h2>
      <p class="atlas-subtitle">Tamil Nadu · 38 Districts · 5 Regions</p>
      <button class="atlas-close" id="atlas-close">✕</button>
    </div>
    <div class="atlas-search-wrap">
      <input type="text" class="atlas-search" id="atlas-search" placeholder="Search districts…" />
    </div>
    <div class="atlas-filter-tabs" id="atlas-filter-tabs">
      <button class="filter-tab active" data-region="all">All (38)</button>
      ${districtsData.regions.map(r =>
        `<button class="filter-tab" data-region="${r.id}">${r.name}</button>`
      ).join('')}
    </div>
    <div class="atlas-districts-list" id="atlas-list"></div>
  `;

  document.getElementById('atlas-close').addEventListener('click', closeAtlas);
  overlay.addEventListener('click', closeAtlas);

  document.getElementById('atlas-search').addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    renderAtlasList();
  });

  document.getElementById('atlas-filter-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    state.activeFilter = tab.dataset.region;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderAtlasList();
  });

  renderAtlasList();
}

function renderAtlasList() {
  const list = document.getElementById('atlas-list');
  const filtered = districtsData.regions.filter(
    r => state.activeFilter === 'all' || r.id === state.activeFilter
  );

  list.innerHTML = filtered.map(region => {
    const districtItems = region.districts
      .filter(d => !state.searchQuery || d.name.toLowerCase().includes(state.searchQuery) || d.tamil.includes(state.searchQuery))
      .map(d => `
        <div class="district-item ${d.active ? 'active-district' : ''}" data-id="${d.id}">
          <div>
            <div class="district-item-name">${d.name}</div>
            <div class="district-item-tamil">${d.tamil}</div>
          </div>
          <span class="district-item-badge">${d.active ? 'Phase I' : d.badge || 'Coming Soon'}</span>
        </div>
      `).join('');

    return districtItems ? `
      <div class="region-group">
        <div class="region-label">${region.name}</div>
        ${districtItems}
      </div>
    ` : '';
  }).join('');

  // Bind click events
  list.querySelectorAll('.district-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const district = allDistricts.find(d => d.id === id);
      if (district?.active) {
        closeAtlas();
        openDistrictView(district);
      }
    });
  });
}

function openAtlas() {
  state.drawerOpen = true;
  document.getElementById('atlas-drawer').classList.add('open');
  document.getElementById('atlas-overlay').classList.add('active');
}

function closeAtlas() {
  state.drawerOpen = false;
  document.getElementById('atlas-drawer').classList.remove('open');
  document.getElementById('atlas-overlay').classList.remove('active');
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function buildFooter() {
  document.getElementById('site-footer').innerHTML = `
    <p class="footer-logo">Tamil Nadu</p>
    <p class="footer-sub">360° Heritage · Phase I of 38 Districts</p>
    <p class="footer-note">
      An immersive cultural archive. &nbsp;·&nbsp;
      Built with passion for Tamil heritage. &nbsp;·&nbsp;
      <a href="#">Contribute</a>
    </p>
  `;
}

// ─── GSAP ScrollTrigger Animations ───────────────────────────────────────────
function initGSAP() {
  // Hero reveal
  const heroTL = gsap.timeline({ delay: 0.3 });
  heroTL
    .to('.hero-kicker', { opacity: 1, y: 0, duration: 1, ease: 'expo.out' })
    .to('.hero-title', { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, '-=0.7')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, '-=0.9')
    .to('.hero-desc', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.6')
    .to('.hero-cta-group', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .to('#scroll-hint', { opacity: 1, duration: 0.7 }, '-=0.2');

  // Stats fade up
  gsap.utils.toArray('.stat-item.fade-up').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: i * 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // District cards stagger
  gsap.utils.toArray('.district-card.fade-up').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: i * 0.15,
      scrollTrigger: { trigger: '#districts-section', start: 'top 70%', once: true },
    });
  });

  // Section header
  gsap.from('.section-header', {
    opacity: 0, y: 40, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '#districts-section', start: 'top 80%', once: true },
  });

  // Ready
}
