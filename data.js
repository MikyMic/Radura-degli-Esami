/* ============ Contenuti di gioco: specie, boss, sbloccabili, negozio ============ */
const S_ = (id, c) => (c === undefined ? { id } : (typeof c === 'string' ? { id, v: c } : { id, c }));
const cl = c => ({ cloth: c }), mt = c => ({ metal: c }), hr = c => ({ hair: c });

// Ogni specie: aspetto di partenza del compagno + temi per gli sbloccabili + battute
const SPECIES = [
  { id: 'fata', name: 'Fata dei fiori', art: 'la ', tags: ['fairy', 'princess', 'cute'], body: 'female', skin: 'light', eyes: 'purple', hairColor: 'pink',
    slots: { head: S_('head_human'), hair: S_('hair_princess'), torso: S_('dress_bodice', 'rose'), legs: S_('skirt_belle', cl('pink')), wings: S_('wings_pixie', 'pink'), feet: S_('slippers', cl('pink')), neck: S_('necklace_beads', mt('gold')) },
    motto: 'Sparge polvere di stelle sulle formule', lines: ['Ho intrecciato una ghirlanda con i tuoi appunti!', 'Un po\' di magia e un po\' di ripasso: ci stai?', 'Le formule sono come fiori: vanno annaffiate ogni giorno.'] },
  { id: 'elfo', name: 'Elfo arciere', art: "l'", tags: ['elf', 'hero', 'warrior'], body: 'male', skin: 'light', eyes: 'green', hairColor: 'platinum',
    slots: { head: S_('head_human'), ears: S_('ears_elven'), hair: S_('hair_long_straight'), torso: S_('longsleeve', cl('forest')), belt: S_('belt_leather', cl('leather')), legs: S_('pants', cl('brown')), feet: S_('ghillies', cl('leather')), cape: S_('cape', cl('green')), back: S_('quiver'), weapon: S_('bow', 'light') },
    motto: 'Non manca mai il bersaglio, nemmeno all\'orale', lines: ['Mira dritto al prossimo capitolo.', 'Ho visto la sessione all\'orizzonte: prepariamoci.', 'Un elfo ricorda tutto per mille anni. Tu ripassa e basta!'] },
  { id: 'elfa', name: 'Elfa della luna', art: "l'", tags: ['elf', 'mage', 'cosmic'], body: 'female', skin: 'light', eyes: 'blue', hairColor: 'platinum',
    slots: { head: S_('head_human'), ears: S_('ears_long'), hair: S_('hair_xlong'), torso: S_('robe', 'white'), hat: S_('tiara', cl('sky')), neck: S_('amulet_star', 'brass_blue'), weapon: S_('staff_loop', mt('gold')) },
    motto: 'Legge i libri alla luce della luna', lines: ['La luna dice che oggi è un buon giorno per studiare.', 'Ogni pagina è un incantesimo: leggiamola insieme.', 'Silenzio... sento la concentrazione arrivare.'] },
  { id: 'gnomo', name: 'Gnomo saggio', art: 'lo ', tags: ['gnome', 'mage', 'scholar'], body: 'child', skin: 'light', eyes: 'blue', hairColor: 'white',
    slots: { head: S_('head_human'), beard: S_('beard_winter'), hat: S_('hat_wizard', cl('red')), torso: S_('child_shirt', 'blue'), legs: S_('childpants', 'brown') },
    motto: 'Custodisce ogni teorema nel cappello', lines: ['Nel mio cappello c\'è posto per un altro teorema!', 'Piccoli passi, grandi esami.', 'Ho contato le pagine: sono meno di quanto pensi.'] },
  { id: 'orco', name: 'Orco guerriero', art: "l'", tags: ['orc', 'warrior', 'monster'], body: 'muscular', skin: 'green', eyes: 'red', hairColor: 'black',
    slots: { head: S_('head_orc'), torso2: S_('bauldron', cl('leather')), shoulders: S_('pauldrons', cl('leather')), arms: S_('bracers', mt('iron')), legs: S_('pants', cl('brown')), feet: S_('boots', cl('brown')), weapon: S_('waraxe') },
    motto: 'Forte nei calcoli, tenero di cuore', lines: ['GRAAH! Gli esercizi non mi fanno paura.', 'Un orco non si arrende mai. E nemmeno tu.', 'Ho rotto la clava... studiamo con la matita.'] },
  { id: 'orchessa', name: 'Orchessa sciamana', art: "l'", tags: ['orc', 'druid', 'mage'], body: 'female', skin: 'green', eyes: 'yellow', hairColor: 'black',
    slots: { head: S_('head_orc'), hair: S_('hair_braid'), torso: S_('tunic_sara', cl('leather')), belt: S_('belt_leather', cl('brown')), legs: S_('leggings', cl('brown')), feet: S_('boots', cl('brown')), neck: S_('necklace_beads', mt('bronze')), weapon: S_('staff_gnarled', mt('iron')) },
    motto: 'Legge il futuro nelle ossa e nei manuali', lines: ['Gli spiriti dicono: ripassa il capitolo tre.', 'Ho preparato un infuso per la concentrazione.', 'La tribù è fiera di te.'] },
  { id: 'goblin', name: 'Goblin inventore', art: 'il ', tags: ['goblin', 'scholar', 'monster'], body: 'child', skin: 'bright_green', eyes: 'yellow', hairColor: 'black',
    slots: { head: S_('head_goblin'), hat: S_('headband_rune', cl('red')), torso: S_('child_shirt', 'brown'), legs: S_('childpants', 'green') },
    motto: 'Smonta i problemi pezzo per pezzo', lines: ['Ho inventato una macchina per studiare. Sei tu!', 'Ehehe, questo esercizio lo smontiamo in due minuti.', 'Bulloni, ingranaggi e derivate: adoro tutto.'] },
  { id: 'troll', name: 'Troll gentile', art: 'il ', tags: ['troll', 'monster', 'farm'], body: 'muscular', skin: 'blue', eyes: 'yellow', hairColor: 'black',
    slots: { head: S_('head_troll'), torso2: S_('suspenders', cl('brown')), legs: S_('pants', cl('tan')), weapon: S_('hammer', { metal: 'iron', wood: 'oak' }) },
    motto: 'Lento ma inarrestabile, come lo studio costante', lines: ['Io piano piano... ma arrivo sempre.', 'Ponte chiuso: passa solo chi ha studiato!', 'Troll contento quando tu studi.'] },
  { id: 'maga', name: 'Maga delle stelle', art: 'la ', tags: ['mage', 'cosmic', 'witch'], body: 'female', skin: 'olive', eyes: 'purple', hairColor: 'violet',
    slots: { head: S_('head_human'), hair: S_('hair_xlong_wavy'), torso: S_('robe', 'purple'), belt: S_('belt_mage', 'gold'), hat: S_('hat_celestial', cl('navy')), neck: S_('amulet_star', 'brass_purple'), weapon: S_('staff_crystal', 'purple') },
    motto: 'Trasforma le formule in costellazioni', lines: ['Le stelle sono allineate: è ora di studiare.', 'Un incantesimo di memoria? Si chiama ripasso.', 'Il mio cristallo brilla quando sei concentrato.'] },
  { id: 'mago', name: 'Arcimago', art: "l'", tags: ['mage', 'elder', 'scholar'], body: 'male', skin: 'light', eyes: 'gray', hairColor: 'white',
    slots: { head: S_('head_elder'), hair: S_('hair_long'), beard: S_('beard_winter'), torso: S_('jacket_frock', cl('navy')), legs: S_('formal_pants', cl('navy')), feet: S_('boots', cl('black')), cape: S_('cape_trim', cl('blue')), hat: S_('hat_wizard_belt', cl('blue')), weapon: S_('staff_gnarled', mt('gold')) },
    motto: 'Ha letto ogni libro della biblioteca. Due volte', lines: ['Ai miei tempi si studiava a lume di candela.', 'La saggezza è solo curiosità che non si è arresa.', 'Un capitolo al giorno toglie l\'ansia di torno.'] },
  { id: 'cavaliere', name: 'Cavaliere', art: 'il ', tags: ['knight', 'hero', 'warrior'], body: 'male', skin: 'light', eyes: 'blue', hairColor: 'chestnut',
    slots: { head: S_('head_human'), hair: S_('hair_plain'), torso: S_('armour_plate', mt('steel')), arms: S_('arms_armour', mt('steel')), legs: S_('legs_armour', mt('steel')), feet: S_('feet_armour', mt('steel')), cape: S_('cape', cl('red')), hat: S_('helmet_armet', mt('steel')), weapon: S_('sword', mt('steel')), shield: S_('shield_heater', mt('gold')) },
    motto: 'Giura fedeltà al piano di studio', lines: ['Per l\'onore e per il trenta!', 'Uno scudo contro la procrastinazione.', 'In guardia: il capitolo nuovo ci aspetta.'] },
  { id: 'paladina', name: 'Paladina', art: 'la ', tags: ['knight', 'hero', 'angel'], body: 'female', skin: 'bronze', eyes: 'brown', hairColor: 'blonde',
    slots: { head: S_('head_human'), hair: S_('hair_high_ponytail'), torso: S_('armour_legion', mt('gold')), legs: S_('legs_armour', mt('silver')), feet: S_('feet_armour', mt('silver')), cape: S_('cape_trim', cl('white')), weapon: S_('glowsword', 'blue'), shield: S_('shield_crusader') },
    motto: 'Protegge i deboli e i capitoli difficili', lines: ['La luce vince sempre sull\'ansia.', 'Hai il coraggio di aprire quel libro? Io sì.', 'Ogni ora di studio è una promessa mantenuta.'] },
  { id: 'draconide', name: 'Draconide', art: 'il ', tags: ['dragon', 'warrior', 'beast'], body: 'male', skin: 'bright_green', eyes: 'yellow', hairColor: 'black',
    slots: { head: S_('head_lizard'), wings: S_('wings_lizard'), tail: S_('tail_lizard'), torso: S_('chainmail', mt('steel')), legs: S_('pants', cl('navy')), feet: S_('boots', cl('black')), weapon: S_('dragonspear', 'red') },
    motto: 'Brucia le domande più difficili', lines: ['Ho sputato fuoco sull\'ultimo esercizio.', 'I draghi custodiscono tesori. Il tuo è la conoscenza.', 'Sento odore di sessione... prepariamoci!'] },
  { id: 'lupo', name: 'Lupo bardo', art: 'il ', tags: ['beast', 'bard', 'noble'], body: 'male', skin: 'fur_grey', eyes: 'yellow', hairColor: 'gray',
    slots: { head: S_('head_wolf'), tail: S_('tail_wolf', hr('gray')), torso: S_('vest', cl('red')), legs: S_('pants', cl('brown')), feet: S_('boots', cl('brown')), hat: S_('hat_cavalier', cl('red')), neck: S_('scarf', cl('yellow')) },
    motto: 'Canta ballate su ogni teorema', lines: ['Ho scritto una canzone sul tuo esame. Il ritornello è il programma.', 'Auuuu! È ora di studiare!', 'Le storie si ricordano meglio se le canti.'] },
  { id: 'kitsune', name: 'Volpe dei templi', art: 'la ', tags: ['kitsune', 'samurai', 'beast'], body: 'female', skin: 'fur_copper', eyes: 'orange', hairColor: 'orange',
    slots: { head: S_('head_wolf'), tail: S_('tail_fluffy', hr('orange')), torso: S_('kimono', cl('red')), belt: S_('belt_obi', cl('white')), feet: S_('sandals', cl('brown')), weapon: S_('katana') },
    motto: 'Nove code, nove capitoli', lines: ['Una volpe furba studia un po\' ogni giorno.', 'Il tempio è silenzioso: perfetto per concentrarsi.', 'Le mie code brillano quando impari qualcosa.'] },
  { id: 'minotauro', name: 'Minotauro', art: 'il ', tags: ['beast', 'warrior'], body: 'muscular', skin: 'fur_brown', eyes: 'red', hairColor: 'dark_brown',
    slots: { head: S_('head_minotaur'), feet: S_('hoofs'), torso2: S_('bauldron', cl('leather')), shoulders: S_('pauldrons', cl('maroon')), arms: S_('bracers', mt('bronze')), legs: S_('pants', cl('maroon')), weapon: S_('halberd') },
    motto: 'Conosce ogni corridoio del labirinto', lines: ['Il labirinto del programma? Conosco l\'uscita.', 'Carica a testa bassa sul prossimo argomento!', 'Muuu... cioè, studiamo.'] },
  { id: 'coniglietta', name: 'Coniglietta giardiniera', art: 'la ', tags: ['cute', 'farm', 'beast'], body: 'female', skin: 'fur_white', eyes: 'red', hairColor: 'white',
    slots: { head: S_('head_rabbit'), torso: S_('dress_sash', 'sky'), legs: S_('skirt_belle', cl('sky')), feet: S_('shoes', cl('pink')), weapon: S_('watering_can', { wood: 'oak' }) },
    motto: 'Fa germogliare le idee', lines: ['Annaffio i tuoi appunti: crescono!', 'Salto da un capitolo all\'altro!', 'Una carota e poi studiamo, promesso.'] },
  { id: 'topolino', name: 'Topo esploratore', art: 'il ', tags: ['cute', 'rogue', 'scholar'], body: 'male', skin: 'fur_grey', eyes: 'brown', hairColor: 'gray',
    slots: { head: S_('head_mouse'), torso: S_('longsleeve', cl('teal')), legs: S_('pants', cl('brown')), feet: S_('boots', cl('brown')), hat: S_('hat_bonnie', cl('teal')), back: S_('backpack', 'leather'), weapon: S_('dagger') },
    motto: 'Trova sempre la pagina giusta', lines: ['Ho trovato le formule nascoste sotto il tavolo!', 'Piccolo ma coraggioso, come la tua prima ora di studio.', 'Squit! Pronto all\'avventura.'] },
  { id: 'vampiro', name: 'Conte vampiro', art: 'il ', tags: ['undead', 'noble', 'night'], body: 'male', skin: 'light', eyes: 'red', hairColor: 'raven',
    slots: { head: S_('head_vampire'), hair: S_('hair_parted'), torso: S_('jacket_frock', cl('black')), legs: S_('formal_pants', cl('black')), feet: S_('boots', cl('black')), cape: S_('cape_trim', cl('maroon')), neck: S_('bowtie', cl('red')), weapon: S_('rapier') },
    motto: 'Studia di notte, ovviamente', lines: ['La notte è giovane e il libro è aperto.', 'Ho sete... di conoscenza.', 'Un vampiro non dorme mai prima dell\'esame. Tu invece sì.'] },
  { id: 'scheletro', name: 'Scheletro allegro', art: 'lo ', tags: ['undead', 'pirate'], body: 'male', skin: 'light', eyes: 'blue', hairColor: 'black',
    slots: { body: S_('body_skeleton'), head: S_('head_skeleton'), hat: S_('bandana', cl('red')), cape: S_('cape_tattered', cl('gray')), weapon: S_('saber') },
    motto: 'Conosce l\'anatomia meglio di chiunque', lines: ['Mi sono studiato fino all\'osso!', 'Non ho stomaco per l\'ansia da esame.', 'Ah-ah! Le ossa scricchiolano, ma la memoria no.'] },
  { id: 'zucca', name: 'Spaventapasseri', art: 'lo ', tags: ['farm', 'undead', 'cute'], body: 'male', skin: 'light', eyes: 'brown', hairColor: 'blonde',
    slots: { head: S_('head_jack'), torso: S_('overalls', cl('brown')), feet: S_('boots', cl('brown')), weapon: S_('hoe', { metal: 'iron', wood: 'maple' }) },
    motto: 'Tiene lontani i corvi della distrazione', lines: ['Shhh, ho appena spaventato via tre distrazioni.', 'Autunno: la stagione perfetta per studiare.', 'Ho la testa piena... di semi di zucca e di formule.'] },
  { id: 'franken', name: 'Frankenstein', art: 'il ', tags: ['undead', 'scholar'], body: 'muscular', skin: 'pale_green', eyes: 'gray', hairColor: 'black',
    slots: { head: S_('head_franken'), torso2: S_('suspenders', cl('gray')), legs: S_('pants', cl('charcoal')), feet: S_('boots', cl('black')) },
    motto: 'Cucito insieme con pezzi di ogni materia', lines: ['È VIVO! Il tuo cervello, intendo.', 'Un fulmine di ispirazione, ecco cosa serve.', 'Pezzo dopo pezzo si costruisce un esame.'] },
  { id: 'alieno', name: 'Viaggiatore stellare', art: 'il ', tags: ['cosmic', 'scholar'], body: 'male', skin: 'lavender', eyes: 'green', hairColor: 'white',
    slots: { head: S_('head_alien'), torso: S_('jacket_collared', cl('sky')), legs: S_('pants', cl('white')), feet: S_('boots', cl('white')), face_acc: S_('sunglasses', cl('black')), weapon: S_('glowsword', 'blue') },
    motto: 'Viene da una galassia dove gli esami sono facili', lines: ['Sul mio pianeta questo argomento si studia da neonati.', 'Rilevo alti livelli di concentrazione. Ottimo.', 'Beep boop: è ora di una pausa? No, di studiare.'] },
  { id: 'piratessa', name: 'Piratessa', art: 'la ', tags: ['pirate', 'rogue', 'sea'], body: 'female', skin: 'amber', eyes: 'green', hairColor: 'redhead',
    slots: { head: S_('head_human'), hair: S_('hair_long'), torso: S_('corset', cl('maroon')), legs: S_('pants', cl('tan')), feet: S_('boots_fold', cl('black')), hat: S_('tricorne', cl('black')), face_acc: S_('eyepatch', cl('black')), ears_acc: S_('earrings', mt('gold')), weapon: S_('saber') },
    motto: 'Il tesoro è un trenta e lode', lines: ['All\'arrembaggio del prossimo capitolo!', 'X segna il punto: pagina 42.', 'Una vera pirata non molla mai la rotta.'] },
  { id: 'samurai', name: 'Samurai', art: 'la ', tags: ['samurai', 'warrior'], body: 'female', skin: 'light', eyes: 'brown', hairColor: 'black',
    slots: { head: S_('head_human'), hair: S_('hair_topknot'), torso: S_('kimono_split', cl('navy')), belt: S_('belt_obi', cl('red')), hat: S_('headband_rune', cl('red')), feet: S_('sandals', cl('brown')), weapon: S_('katana') },
    motto: 'Disciplina, pazienza e un timer da 50 minuti', lines: ['La via del samurai è la via dello studio costante.', 'Un taglio netto alla distrazione.', 'Respira. Concentrati. Leggi.'] },
  { id: 'druido', name: 'Druido delle querce', art: 'il ', tags: ['druid', 'elf', 'elder'], body: 'male', skin: 'olive', eyes: 'green', hairColor: 'gray',
    slots: { head: S_('head_elder'), ears: S_('ears_elven'), hair: S_('hair_long_messy'), beard: S_('beard_medium'), torso: S_('longsleeve', cl('forest')), legs: S_('pants', cl('leather')), feet: S_('ghillies', cl('leather')), cape: S_('cape_tattered', cl('green')), weapon: S_('staff_gnarled', mt('bronze')) },
    motto: 'Le sue radici arrivano fino ai concetti', lines: ['Le querce crescono piano, ma durano secoli.', 'Ascolta il bosco: dice di ripassare.', 'Ogni foglia è un appunto della natura.'] },
  { id: 'diavoletta', name: 'Diavoletta', art: 'la ', tags: ['demon', 'night', 'witch'], body: 'female', skin: 'lavender', eyes: 'red', hairColor: 'black',
    slots: { head: S_('head_human'), horns: S_('horns_curled'), hair: S_('hair_bob'), wings: S_('wings_bat', hr('red')), tail: S_('tail_lizard'), torso: S_('dress_slit', cl('black')), feet: S_('boots', cl('black')), weapon: S_('staff_loop', mt('gold')) },
    motto: 'Tenta tutti a studiare un po\' di più', lines: ['Dai, solo un altro pomodoro... che male può fare?', 'Il diavolo sta nei dettagli. E nelle note a piè di pagina.', 'Ti ho rubato il telefono. Studia!'] },
  { id: 'angelo', name: 'Angelo custode', art: "l'", tags: ['angel', 'cute', 'noble'], body: 'female', skin: 'light', eyes: 'blue', hairColor: 'blonde',
    slots: { head: S_('head_human'), hair: S_('hair_curls_large'), torso: S_('dress_sash', 'white'), legs: S_('skirt_belle', cl('white')), wings: S_('wings_feathered', hr('white')), hat: S_('tiara', cl('white')), feet: S_('sandals', cl('white')) },
    motto: 'Veglia sulle tue ore di studio', lines: ['Sono qui per proteggerti dalle distrazioni.', 'Un respiro profondo: andrà tutto bene.', 'Ho visto quanto hai studiato. Sono fiera di te.'] },
  { id: 'strega', name: 'Strega del bosco', art: 'la ', tags: ['witch', 'mage', 'night'], body: 'female', skin: 'pale_green', eyes: 'green', hairColor: 'black',
    slots: { head: S_('head_human'), hair: S_('hair_long_messy'), torso: S_('robe', 'black'), hat: S_('hat_witch'), neck: S_('amulet_star', 'brass_green'), weapon: S_('staff_gnarled', mt('iron')) },
    motto: 'Mescola appunti e pozioni nello stesso calderone', lines: ['Un pizzico di sintesi, due gocce di schemi...', 'La mia pozione preferita? Il caffè.', 'Ih ih ih! Questo argomento è un incantesimo facile.'] },
  { id: 'principessa', name: 'Principessa', art: 'la ', tags: ['princess', 'royal', 'noble'], body: 'female', skin: 'light', eyes: 'blue', hairColor: 'blonde',
    slots: { head: S_('head_human'), hair: S_('hair_princess'), torso: S_('dress_slit', cl('rose')), hat: S_('tiara', cl('sky')), neck: S_('necklace_beads', mt('gold')), feet: S_('slippers', cl('pink')) },
    motto: 'Governa il regno del sapere', lines: ['Una principessa non aspetta di essere salvata: studia.', 'Il mio regno per un riassunto fatto bene!', 'Oggi il trono può aspettare, il capitolo no.'] },
  { id: 're', name: 'Re delle fiabe', art: 'il ', tags: ['royal', 'elder', 'noble'], body: 'male', skin: 'light', eyes: 'brown', hairColor: 'gray',
    slots: { head: S_('head_elder'), hair: S_('hair_plain'), beard: S_('beard_beard'), hat: S_('crown', 'crown_gold'), torso: S_('jacket_frock', cl('purple')), legs: S_('formal_pants', cl('purple')), feet: S_('boots', cl('black')), cape: S_('cape_trim', cl('red')), neck: S_('capeclip', { cloth: 'red', metal: 'gold' }), weapon: S_('staff_diamond', mt('gold')) },
    motto: 'Decreta che oggi si studia', lines: ['Per decreto reale: un\'ora di studio!', 'Il popolo ha bisogno di un sovrano preparato.', 'La corona pesa, ma il libro di più.'] },
  { id: 'pastorella', name: 'Pastorella', art: 'la ', tags: ['farm', 'cute', 'beast'], body: 'female', skin: 'fur_white', eyes: 'brown', hairColor: 'white',
    slots: { head: S_('head_sheep'), torso: S_('blouse', cl('white')), legs: S_('skirt_belle', cl('green')), feet: S_('shoes', cl('brown')), weapon: S_('cane') },
    motto: 'Conta le pecore solo dopo aver ripassato', lines: ['Beee-ne, iniziamo!', 'Pascoliamo tra un capitolo e l\'altro.', 'Lana morbida, mente sveglia.'] },
  { id: 'contadino', name: 'Maialino contadino', art: 'il ', tags: ['farm', 'cute'], body: 'male', skin: 'light', eyes: 'blue', hairColor: 'blonde',
    slots: { head: S_('head_pig'), torso: S_('overalls', cl('blue')), feet: S_('boots', cl('brown')), hat: S_('hat_leather', cl('tan')), weapon: S_('hoe', { metal: 'iron', wood: 'oak' }) },
    motto: 'Semina oggi, raccogli all\'appello', lines: ['Oink! Si semina studiando, si raccoglie all\'esame.', 'Il campo del sapere va zappato ogni giorno.', 'Ho fatto la marmellata di appunti.'] },
  { id: 'cinghiale', name: 'Cinghiale vichingo', art: 'il ', tags: ['beast', 'warrior', 'winter'], body: 'muscular', skin: 'fur_brown', eyes: 'red', hairColor: 'dark_brown',
    slots: { head: S_('head_boar'), hat: S_('helmet_viking', { metal: 'iron', cloth: 'brown' }), torso2: S_('bauldron', cl('leather')), arms: S_('bracers', mt('iron')), legs: S_('pants', cl('brown')), feet: S_('boots', cl('brown')), weapon: S_('waraxe') },
    motto: 'Salpa verso l\'appello con la nave piena di appunti', lines: ['Per Odino, che capitolo lungo!', 'Remiamo insieme verso la sessione.', 'Un vero vichingo non teme gli orali.'] },
  { id: 'marina', name: 'Guardiana del mare', art: 'la ', tags: ['sea', 'fairy'], body: 'female', skin: 'blue', eyes: 'green', hairColor: 'green',
    slots: { head: S_('head_human'), horns: S_('fins'), hair: S_('hair_xlong_wavy'), torso: S_('dress_sash', 'teal'), legs: S_('skirt_over', cl('teal')), neck: S_('necklace_beads', mt('silver')), weapon: S_('trident', 'gold') },
    motto: 'Nuota nelle profondità di ogni argomento', lines: ['Il mare del programma è profondo, ma io so nuotare.', 'Le onde portano idee nuove.', 'Respira come una sirena: lento e profondo.'] },
  { id: 'nano', name: 'Nano minatore', art: 'il ', tags: ['dwarf', 'warrior', 'winter'], body: 'muscular', skin: 'light', eyes: 'brown', hairColor: 'redhead',
    slots: { head: S_('head_human'), hair: S_('hair_buzzcut'), beard: S_('beard_beard'), hat: S_('helmet_horned', mt('iron')), torso2: S_('bauldron', cl('leather')), arms: S_('gloves', mt('iron')), legs: S_('pants', cl('brown')), feet: S_('boots', cl('black')), weapon: S_('pickaxe', { metal: 'iron', wood: 'oak' }) },
    motto: 'Scava nel programma fino a trovare l\'oro', lines: ['Scaviamo! Sotto quel capitolo c\'è una miniera d\'oro.', 'Barba e libro: la combinazione perfetta.', 'Un nano non lascia mai un esercizio a metà.'] },
  { id: 'ratto', name: 'Ladro gentiluomo', art: 'il ', tags: ['rogue', 'night', 'beast'], body: 'male', skin: 'fur_grey', eyes: 'red', hairColor: 'gray',
    slots: { head: S_('head_rat'), hat: S_('hood', cl('charcoal')), torso: S_('vest_open', cl('charcoal')), legs: S_('pants', cl('black')), feet: S_('boots', cl('black')), weapon: S_('dagger') },
    motto: 'Ruba solo i segreti dei libri', lines: ['Ho rubato le domande dell\'esame. Scherzo: le ho studiate.', 'Nell\'ombra si studia benissimo.', 'Un buon ladro conosce ogni dettaglio.'] },
];
const SPECIES_BY = Object.fromEntries(SPECIES.map(s => [s.id, s]));

// Boss degli appelli
const BOSSES = [
  { id: 'reScheletro', name: 'Re Scheletro', body: 'male', skin: 'light', eyes: 'red', slots: { body: S_('body_skeleton'), head: S_('head_skeleton'), hat: S_('crown', 'crown_gray'), cape: S_('cape_tattered', cl('black')), weapon: S_('scythe') } },
  { id: 'signoreTroll', name: 'Signore dei Troll', body: 'muscular', skin: 'dark_green', eyes: 'red', slots: { head: S_('head_troll'), hat: S_('helmet_horned', mt('iron')), shoulders: S_('pauldrons', cl('black')), arms: S_('arms_armour', mt('iron')), legs: S_('pants', cl('black')), feet: S_('boots', cl('black')), weapon: S_('flail') } },
  { id: 'minotauroNero', name: 'Minotauro corazzato', body: 'muscular', skin: 'fur_black', eyes: 'red', slots: { head: S_('head_minotaur'), feet: S_('hoofs'), shoulders: S_('pauldrons', cl('maroon')), arms: S_('arms_armour', mt('bronze')), torso2: S_('bauldron', cl('black')), legs: S_('pants', cl('black')), weapon: S_('halberd') } },
  { id: 'stregaOscura', name: 'Strega oscura', body: 'female', skin: 'zombie_green', eyes: 'red', hairColor: 'raven', slots: { head: S_('head_human'), hair: S_('hair_xlong'), hat: S_('hat_witch'), torso: S_('robe', 'black'), weapon: S_('staff_crystal', 'red'), wings: S_('wings_bat', hr('black')) } },
  { id: 'drago', name: 'Drago antico', body: 'male', skin: 'dark_green', eyes: 'red', slots: { head: S_('head_lizard'), wings: S_('wings_lizard'), tail: S_('tail_lizard'), hat: S_('visor_horned', mt('gold')), torso: S_('armour_plate', mt('gold')), legs: S_('legs_armour', mt('gold')), weapon: S_('dragonspear', 'red') } },
  { id: 'orcoGuerra', name: 'Orco signore della guerra', body: 'muscular', skin: 'dark_green', eyes: 'red', slots: { head: S_('head_orc'), hat: S_('helmet_viking', { metal: 'iron', cloth: 'black' }), shoulders: S_('pauldrons', cl('black')), torso2: S_('bauldron', cl('black')), arms: S_('arms_armour', mt('iron')), legs: S_('pants', cl('black')), feet: S_('boots', cl('black')), weapon: S_('waraxe') } },
  { id: 'lich', name: 'Lich', body: 'male', skin: 'light', eyes: 'purple', slots: { body: S_('body_skeleton'), head: S_('head_skeleton'), hat: S_('hat_celestial_moon', cl('black')), cape: S_('cape_trim', cl('purple')), neck: S_('amulet_star', 'brass_purple'), weapon: S_('staff_diamond', mt('silver')) } },
  { id: 'cavaliereNero', name: 'Cavaliere nero', body: 'male', skin: 'light', eyes: 'red', slots: { head: S_('head_human'), torso: S_('armour_plate', mt('iron')), arms: S_('arms_armour', mt('iron')), legs: S_('legs_armour', mt('iron')), feet: S_('feet_armour', mt('iron')), hat: S_('helmet_great', mt('iron')), cape: S_('cape', cl('black')), weapon: S_('longsword'), shield: S_('shield_spartan') } },
  { id: 'reGoblin', name: 'Re dei Goblin', body: 'male', skin: 'green', eyes: 'yellow', slots: { head: S_('head_goblin'), hat: S_('crown', 'crown_red'), torso: S_('jacket_frock', cl('maroon')), legs: S_('pantaloons', cl('yellow')), feet: S_('boots', cl('black')), cape: S_('cape_trim', cl('purple')), weapon: S_('mace') } },
  { id: 'vampiraRegina', name: 'Regina dei vampiri', body: 'female', skin: 'light', eyes: 'red', hairColor: 'raven', slots: { head: S_('head_vampire'), hair: S_('hair_relm_xlong'), torso: S_('dress_slit', cl('maroon')), hat: S_('tiara', cl('red')), wings: S_('wings_bat', hr('red')), weapon: S_('rapier') } },
];

/* ---------- Rarità, slot, prezzi ---------- */
const RARITY = {
  c: { name: 'Comune', price: 150, col: '#8E9AAF' },
  r: { name: 'Raro', price: 420, col: '#3C8FEA' },
  e: { name: 'Epico', price: 1100, col: '#A05CE8' },
  l: { name: 'Leggendario', price: 2800, col: '#F2A900' }
};
const SLOT_NAMES = { body: 'Corpo', head: 'Testa', ears: 'Orecchie', horns: 'Corna e pinne', hair: 'Capelli', beard: 'Barba e baffi', face_acc: 'Occhiali e bende', ears_acc: 'Orecchini', hat: 'Copricapo', torso: 'Busto', torso2: 'Sopravveste', shoulders: 'Spalle', arms: 'Braccia', belt: 'Cintura', legs: 'Gambe', feet: 'Piedi', cape: 'Mantello', wings: 'Ali', tail: 'Coda', neck: 'Collo', back: 'Schiena', weapon: 'Arma o strumento', shield: 'Scudo', aura: 'Aura' };
const WARD_TABS = [
  { id: 'aspetto', name: 'Aspetto', slots: ['skin', 'eyes', 'head', 'hair', 'beard', 'ears', 'horns'] },
  { id: 'abiti', name: 'Abiti', slots: ['torso', 'torso2', 'legs', 'feet', 'belt', 'arms', 'shoulders'] },
  { id: 'accessori', name: 'Accessori', slots: ['hat', 'face_acc', 'ears_acc', 'neck', 'back'] },
  { id: 'magia', name: 'Magia', slots: ['wings', 'cape', 'tail', 'aura'] },
  { id: 'armi', name: 'Armi', slots: ['weapon', 'shield'] }
];
const OPTIONAL_SLOTS = new Set(['hair', 'beard', 'ears', 'horns', 'torso', 'torso2', 'legs', 'feet', 'belt', 'arms', 'shoulders', 'hat', 'face_acc', 'ears_acc', 'neck', 'back', 'wings', 'cape', 'tail', 'weapon', 'shield']);
const CORE_SLOTS = new Set(['body', 'shadow', 'head', 'face']);
const SKINS_HUMAN = ['light', 'amber', 'olive', 'taupe', 'bronze', 'brown', 'black'];
const SKINS_FANTASY = ['lavender', 'blue', 'green', 'bright_green', 'pale_green', 'dark_green', 'zombie_green', 'fur_white', 'fur_grey', 'fur_tan', 'fur_gold', 'fur_copper', 'fur_brown', 'fur_black'];
const EYES = ['blue', 'green', 'brown', 'gray', 'purple', 'red', 'orange', 'yellow'];

// Oggetti disponibili gratis per l'avatar fin dall'inizio
const STARTER = ['head_human', 'head_human_soft', 'ears_elven', 'beard_trimmed', 'beard_medium', 'beard_beard',
  'hair_long', 'hair_long_straight', 'hair_wavy', 'hair_loose', 'hair_bangslong', 'hair_ponytail', 'hair_high_ponytail', 'hair_braid', 'hair_bangs_bun', 'hair_half_up',
  'hair_pigtails', 'hair_bunches', 'hair_bob', 'hair_lob', 'hair_pixie', 'hair_curly_long', 'hair_curly_short', 'hair_afro', 'hair_natural', 'hair_bedhead', 'hair_messy',
  'hair_parted', 'hair_side_bangs', 'hair_plain', 'hair_mop', 'hair_page', 'hair_swoop', 'hair_unkempt', 'hair_buzzcut', 'hair_jewfro', 'hair_long_messy', 'hair_curtains_long', 'hair_relm_short', 'hair_dreadlocks',
  'tshirt', 'tshirt_vneck', 'polo', 'longsleeve', 'shirt_buttoned', 'cardigan', 'scoop', 'sleeveless', 'blouse', 'tunic', 'jacket_collared', 'vest', 'vest_open', 'overalls', 'suspenders', 'child_shirt',
  'pants', 'pants2', 'shorts', 'leggings', 'skirt', 'formal_pants', 'childpants', 'childskirt', 'boots', 'shoes', 'sandals', 'slippers', 'belt_leather', 'belt_sash', 'gloves',
  'glasses_round', 'glasses_nerd', 'scarf', 'bowtie', 'backpack', 'hat_leather', 'staff_simple', 'cane', 'watering_can', 'dagger'];

/* ---------- Aure (potenziamenti visivi) ---------- */
const AURAS = [
  { id: 'scintille', name: 'Scintille', rar: 'c', kind: 'sparkle', cols: ['#FFF6B0', '#FFFFFF', '#FFD34E'] },
  { id: 'foglie', name: 'Foglie danzanti', rar: 'c', kind: 'leaf', cols: ['#7BD65A', '#4BAA3C', '#C6EF6A'] },
  { id: 'bolle', name: 'Bolle di sapone', rar: 'c', kind: 'bubble', cols: ['#BFEAFF', '#FFFFFF', '#FFC6E8'] },
  { id: 'cuori', name: 'Cuoricini', rar: 'r', kind: 'heart', cols: ['#FF6F91', '#FF9EB5', '#FFD1DC'] },
  { id: 'note', name: 'Note musicali', rar: 'r', kind: 'note', cols: ['#8E7CD6', '#4A9BD9', '#FFFFFF'] },
  { id: 'petali', name: 'Petali di ciliegio', rar: 'r', kind: 'petal', cols: ['#FFB7D0', '#FFE0EC', '#FF8FB8'] },
  { id: 'lucciole', name: 'Lucciole', rar: 'r', kind: 'firefly', cols: ['#FFF4A8', '#D7FF7A'] },
  { id: 'fiocchi', name: 'Fiocchi di neve', rar: 'e', kind: 'snow', cols: ['#FFFFFF', '#CFEFFF', '#A9D8FF'] },
  { id: 'fiamme', name: 'Fiamme danzanti', rar: 'e', kind: 'flame', cols: ['#FFD34E', '#FF8A3D', '#FF4D4D'] },
  { id: 'fulmini', name: 'Scariche elettriche', rar: 'e', kind: 'bolt', cols: ['#9FF3FF', '#FFFFFF', '#5FB7FF'] },
  { id: 'stelle', name: 'Polvere di stelle', rar: 'e', kind: 'star', cols: ['#FFE27A', '#FFFFFF', '#C7A6FF'] },
  { id: 'arcobaleno', name: 'Arcobaleno', rar: 'l', kind: 'rainbow', cols: ['#FF5C5C', '#FFB347', '#FFE45C', '#6EE26E', '#5CC8FF', '#9B7CFF'] },
  { id: 'galassia', name: 'Galassia', rar: 'l', kind: 'galaxy', cols: ['#C7A6FF', '#7FD3FF', '#FFFFFF', '#FF9EE5'] },
  { id: 'fenice', name: 'Fiamma della fenice', rar: 'l', kind: 'phoenix', cols: ['#FFF1A6', '#FFC94D', '#FF7A3D'] },
  { id: 'aurora', name: 'Aurora boreale', rar: 'l', kind: 'aurora', cols: ['#7BFFC4', '#7FD3FF', '#C7A6FF'] }
];
const AURA_BY = Object.fromEntries(AURAS.map(a => [a.id, a]));

const TITLES = [
  ['Amico fedele', 'Custode delle formule', 'Mente curiosa', 'Spirito costante'],
  ['Cuore impavido', 'Saggio della radura', 'Lama della logica', 'Cacciatore di lodi'],
  ['Campione della sessione', 'Maestro degli appunti', 'Signore dei capitoli', 'Stella del grimorio'],
  ['Leggenda vivente', 'Eroe immortale', 'Arcimaestro del sapere', 'Sovrano della radura']
];

const CONSUMABLES = [
  { id: 'focus', name: 'Pozione della concentrazione', price: 260, desc: 'La prossima sessione da almeno 20 minuti vale +50% di esperienza e monete.', icon: 'potion' },
  { id: 'oro', name: 'Elisir dorato', price: 650, desc: 'Per 24 ore tutte le monete guadagnate raddoppiano.', icon: 'elixir' },
  { id: 'scudo', name: 'Scudo della fiamma', price: 420, desc: 'Protegge la tua serie se salti un giorno di studio.', icon: 'shield' }
];
const CONS_BY = Object.fromEntries(CONSUMABLES.map(c => [c.id, c]));

/* ---------- Decorazioni del villaggio ---------- */
const DECOS = [
  { id: 'lanterna', name: 'Lanterna magica', price: 180, rar: 'c', desc: 'Si accende di notte.' },
  { id: 'aiuola', name: 'Aiuola fiorita', price: 150, rar: 'c', desc: 'Fiori che cambiano con le stagioni.' },
  { id: 'panchina', name: 'Panchina di quercia', price: 160, rar: 'c', desc: 'Per le pause tra un pomodoro e l\'altro.' },
  { id: 'cartello', name: 'Cartello del viandante', price: 120, rar: 'c', desc: 'Indica la strada verso la sessione.' },
  { id: 'pozzo', name: 'Pozzo dei desideri', price: 420, rar: 'r', desc: 'Lancia una moneta per un trenta.' },
  { id: 'fungo', name: 'Fungo gigante', price: 380, rar: 'r', desc: 'Casa delle lucciole.' },
  { id: 'falo', name: 'Falò', price: 360, rar: 'r', desc: 'Scoppietta e scalda le serate di studio.' },
  { id: 'stendardo', name: 'Stendardi del regno', price: 340, rar: 'r', desc: 'Sventolano con il vento.' },
  { id: 'ciliegio', name: 'Ciliegio in fiore', price: 900, rar: 'e', desc: 'Petali che cadono tutto l\'anno.' },
  { id: 'fontana', name: 'Fontana zampillante', price: 1000, rar: 'e', desc: 'Acqua che scintilla al sole.' },
  { id: 'mulino', name: 'Mulino a vento', price: 1150, rar: 'e', desc: 'Le pale girano mentre studi.' },
  { id: 'statua', name: 'Statua dell\'eroe', price: 2400, rar: 'l', desc: 'Ha il tuo aspetto e brilla di notte.' },
  { id: 'torre', name: 'Torre dell\'orologio', price: 2600, rar: 'l', desc: 'Segna l\'ora vera, rintocchi compresi.' },
  { id: 'arco', name: 'Arco di cristallo', price: 3000, rar: 'l', desc: 'Un portale luminoso tra le stagioni.' }
];
const DECO_BY = Object.fromEntries(DECOS.map(d => [d.id, d]));

/* ---------- Musica e temi ---------- */
const TRACKS = [
  { id: 'radura', name: 'Mattino nella radura', price: 0 },
  { id: 'focus', name: 'Biblioteca incantata', price: 0 },
  { id: 'taverna', name: 'Taverna del grifone', price: 500 },
  { id: 'notte', name: 'Notte di lucciole', price: 500 },
  { id: 'eroe', name: 'Marcia dell\'eroe', price: 900 },
  { id: 'neve', name: 'Valzer della neve', price: 900 }
];
const THEMES = [
  { id: 'auto', name: 'Stagione reale', price: 0, desc: 'Segue il calendario: foglie in autunno, neve in inverno.' },
  { id: 'primavera', name: 'Primavera', price: 0 },
  { id: 'estate', name: 'Estate', price: 0 },
  { id: 'autunno', name: 'Autunno', price: 0 },
  { id: 'inverno', name: 'Inverno', price: 0 },
  { id: 'tramonto', name: 'Tramonto rosa', price: 700 },
  { id: 'lavanda', name: 'Valle di lavanda', price: 900 },
  { id: 'ciliegi', name: 'Festa dei ciliegi', price: 1200 }
];

/* ---------- Livelli ---------- */
const BOND_MAX = 20;
function bondNeed(L, tier = 0) { return Math.round(15 * L * (L + 3) * (1 + 0.25 * Math.min(tier, 4))); } // minuti cumulativi
function bondLevel(min, tier = 0) { let L = 0; while (L < BOND_MAX && min >= bondNeed(L + 1, tier)) L++; return L; }
function bondProgress(min, tier = 0) { const L = bondLevel(min, tier); if (L >= BOND_MAX) return 1; const a = L ? bondNeed(L, tier) : 0, b = bondNeed(L + 1, tier); return (min - a) / (b - a); }
const TIER_NAMES = ['Prima avventura', 'Rinascita d\'argento', 'Rinascita d\'oro', 'Rinascita di cristallo', 'Rinascita stellare'];
const AVATAR_TITLES = [[1, 'Apprendista'], [3, 'Viandante'], [5, 'Lucciola errante'], [8, 'Custode del bosco'], [12, 'Sentinella lunare'], [17, 'Arcanista'], [23, 'Leggenda della radura'], [30, 'Mito eterno']];
// Premi del tuo avatar per livello
const AVATAR_REWARDS = {
  2: [{ t: 'item', id: 'hat_leather' }], 3: [{ t: 'item', id: 'cape' }], 4: [{ t: 'aura', id: 'scintille' }], 5: [{ t: 'item', id: 'boots_rim' }, { t: 'cons', id: 'focus' }],
  6: [{ t: 'item', id: 'hat_wizard' }], 7: [{ t: 'aura', id: 'foglie' }], 8: [{ t: 'item', id: 'wings_pixie' }], 9: [{ t: 'item', id: 'staff_crystal' }],
  10: [{ t: 'item', id: 'cape_trim' }, { t: 'cons', id: 'scudo' }], 11: [{ t: 'item', id: 'hair_princess' }], 12: [{ t: 'item', id: 'wings_monarch' }], 13: [{ t: 'aura', id: 'petali' }],
  14: [{ t: 'item', id: 'tiara' }], 15: [{ t: 'item', id: 'hat_celestial' }, { t: 'cons', id: 'oro' }], 16: [{ t: 'aura', id: 'stelle' }], 17: [{ t: 'item', id: 'wings_dragonfly' }],
  18: [{ t: 'item', id: 'glowsword' }], 20: [{ t: 'item', id: 'crown' }, { t: 'aura', id: 'arcobaleno' }], 22: [{ t: 'item', id: 'wings_pixie_t' }], 25: [{ t: 'item', id: 'wings_lunar' }, { t: 'aura', id: 'galassia' }],
  28: [{ t: 'item', id: 'hat_celestial_moon' }], 30: [{ t: 'item', id: 'wings_monarch_dots' }, { t: 'aura', id: 'aurora' }]
};

/* ---------- Premi dei compagni per livello e rinascita ---------- */
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const BOND_TPL = ['item', 'item', 'title', 'item', 'aura', 'item', 'chest', 'item', 'potion', 'big', 'item', 'title', 'item', 'aura', 'big', 'item', 'chest', 'item', 'potion', 'legend'];
const _bondCache = new Map();
function bondRewards(spId, tier) {
  const key = spId + ':' + tier; if (_bondCache.has(key)) return _bondCache.get(key);
  const sp = SPECIES_BY[spId] || SPECIES[0]; const T = Math.min(tier, 3);
  const rnd = seeded(hashStr(key));
  const base = new Set(Object.values(sp.slots).map(s => s.id));
  const prev = new Set(); for (let t = 0; t < tier; t++) bondRewards(spId, t).forEach(r => { if (r.t === 'item') prev.add(r.id); });
  const rar = [['c', 'r'], ['r', 'e'], ['e', 'l', 'r'], ['l', 'e']][T];
  const cand = Object.entries(SPR.CAT.items).filter(([id, it]) => !CORE_SLOTS.has(it.slot) && it.slot !== 'face' && SPR.supports(id, sp.body) && !base.has(id) && !prev.has(id) && rar.includes(it.rar) && !(it.slot === 'head'));
  const score = ([id, it]) => (it.tags || []).filter(t => sp.tags.includes(t)).length * 4 + rnd() * 2.2 + (it.rar === rar[0] ? .4 : 0) - ((it.tags || []).includes('farm') && !sp.tags.includes('farm') ? 1.5 : 0);
  const ranked = cand.map(c => [c, score(c)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const bigRar = [['r', 'e'], ['e'], ['e', 'l'], ['l']][T], legRar = [['e'], ['l', 'e'], ['l'], ['l']][T];
  const candAll = Object.entries(SPR.CAT.items).filter(([id, it]) => !CORE_SLOTS.has(it.slot) && it.slot !== 'face' && it.slot !== 'head' && SPR.supports(id, sp.body) && !base.has(id) && !prev.has(id));
  const rankedAll = candAll.map(c => [c, score(c)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const bigs = rankedAll.filter(([id, it]) => ['wings', 'cape', 'weapon', 'hat', 'tail'].includes(it.slot) && bigRar.includes(it.rar));
  const legs = rankedAll.filter(([id, it]) => legRar.includes(it.rar) && ['wings', 'hat', 'weapon', 'cape'].includes(it.slot));
  const used = new Set();
  const take = list => { const x = list.find(([id]) => !used.has(id)); if (x) used.add(x[0]); return x; };
  const auraPool = AURAS.filter(a => a.rar === ['c', 'r', 'e', 'l'][T]);
  const auraPool2 = AURAS.filter(a => a.rar === ['r', 'e', 'l', 'l'][T]);
  const out = [];
  BOND_TPL.forEach((tp, i) => {
    const L = i + 1;
    if (tp === 'item' || tp === 'big' || tp === 'legend') {
      const x = tp === 'item' ? take(ranked) : tp === 'big' ? (take(bigs) || take(ranked)) : (take(legs) || take(bigs) || take(ranked));
      if (x) out.push({ L, t: 'item', id: x[0], big: tp !== 'item' });
      else out.push({ L, t: 'chest', coins: 120 * (T + 1) });
    } else if (tp === 'aura') {
      const pool = L < 10 ? auraPool : auraPool2; const a = pool[Math.floor(rnd() * pool.length)] || AURAS[0];
      out.push({ L, t: 'aura', id: a.id });
    } else if (tp === 'title') out.push({ L, t: 'title', name: TITLES[T][Math.floor(rnd() * TITLES[T].length)] });
    else if (tp === 'chest') out.push({ L, t: 'chest', coins: 150 * (T + 1) + L * 10 });
    else if (tp === 'potion') out.push({ L, t: 'cons', id: ['focus', 'scudo', 'oro'][Math.floor(rnd() * 3)] });
  });
  _bondCache.set(key, out);
  return out;
}
