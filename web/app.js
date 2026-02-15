// DOM Elements
const uploadBtn = document.getElementById('uploadBtn');
const createBtn = document.getElementById('createBtn');
const uploadSection = document.getElementById('uploadSection');
const createSection = document.getElementById('createSection');
const carcolsFile = document.getElementById('carcolsFile');
const fileInfo = document.getElementById('fileInfo');
const metaOverview = document.getElementById('metaOverview');

// Toggle Elements
const enableSirens = document.getElementById('enableSirens');
const enableTuning = document.getElementById('enableTuning');
const sirenSection = document.getElementById('sirenSection');
const tuningSection = document.getElementById('tuningSection');

// Siren Elements
const sirenVehicleId = document.getElementById('sirenVehicleId');
const sirenName = document.getElementById('sirenName');
const sirenTexture = document.getElementById('sirenTexture');
const sirensList = document.getElementById('sirensList');
const addSirenBtn = document.getElementById('addSirenBtn');

// Tuning Elements
const kitName = document.getElementById('kitName');
const kitId = document.getElementById('kitId');
const kitType = document.getElementById('kitType');
const tuningList = document.getElementById('tuningList');
const addTuningBtn = document.getElementById('addTuningBtn');
const generateBtn = document.getElementById('generateBtn');

// Data Store
let sirens = [];
let tuningParts = [];

// UI Navigation
function showSection(section, btn) {
    uploadSection.classList.add('hidden');
    createSection.classList.add('hidden');
    section.classList.remove('hidden');
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

uploadBtn.addEventListener('click', () => {
    showSection(uploadSection, uploadBtn);
});

createBtn.addEventListener('click', () => {
    showSection(createSection, createBtn);
});

// Toggle Sections
enableSirens.addEventListener('change', () => {
    sirenSection.classList.toggle('hidden', !enableSirens.checked);
});

enableTuning.addEventListener('change', () => {
    tuningSection.classList.toggle('hidden', !enableTuning.checked);
});

// Meta File Upload & Parse
carcolsFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileInfo.innerHTML = `<p style="color: #8f94fb;">Datei: <strong>${file.name}</strong> (${(file.size/1024).toFixed(1)} KB)</p>`;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        const xml = evt.target.result;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, 'application/xml');
            showMetaOverview(doc);
            autoDetectConfig(doc);
        } catch (err) {
            metaOverview.innerHTML = '<span style="color:#ff6b6b">Fehler beim Parsen der Datei!</span>';
        }
    };
    reader.readAsText(file);
});

function showMetaOverview(doc) {
    const sirensItems = [...doc.querySelectorAll('Sirens > Item')].map(item => {
        return {
            id: item.querySelector('id')?.getAttribute('value'),
            name: item.querySelector('name')?.textContent,
            sirenCount: item.querySelectorAll('sirens > Item').length
        };
    });
    const kits = [...doc.querySelectorAll('Kits > Item')].map(item => {
        return {
            kitName: item.querySelector('kitName')?.textContent,
            id: item.querySelector('id')?.getAttribute('value'),
            visibleMods: item.querySelectorAll('visibleMods > Item').length
        };
    });
    
    let html = '<h3>Hochgeladene carcols.meta</h3>';
    if (sirensItems.length) {
        html += '<b style="color: #8f94fb;">Sirens:</b><ul>' + 
            sirensItems.map(s => `<li>${s.name} (ID: ${s.id}) – ${s.sirenCount} Siren-Elemente</li>`).join('') + 
            '</ul>';
    }
    if (kits.length) {
        html += '<b style="color: #8f94fb;">Kits:</b><ul>' + 
            kits.map(k => `<li>${k.kitName} (ID: ${k.id}) – ${k.visibleMods} Tuning-Teile</li>`).join('') + 
            '</ul>';
    }
    if (!sirensItems.length && !kits.length) {
        html += '<i style="color: #999;">Keine Sirens oder Kits gefunden.</i>';
    }
    metaOverview.innerHTML = html;
}

function autoDetectConfig(doc) {
    const hasSirens = doc.querySelectorAll('Sirens > Item').length > 0;
    const hasKits = doc.querySelectorAll('Kits > Item').length > 0;
    enableSirens.checked = hasSirens;
    enableTuning.checked = hasKits;
}

// Siren Management
addSirenBtn.addEventListener('click', () => {
    const sirenId = sirens.length + 1;
    const newSiren = {
        id: sirenId,
        rotation: { delta: 0, start: 0, speed: 3, syncToBpm: true },
        color: '0xFF0000FF',
        intensity: 3.5,
        lightGroup: 1,
        rotated: false,
        scaled: true,
        scaleFactor: 100,
        flash: true,
        light: true,
        spotLight: true,
        castShadows: true
    };
    sirens.push(newSiren);
    renderSirensList();
});

function renderSirensList() {
    sirensList.innerHTML = sirens.map((siren, idx) => `
        <div class="siren-item">
            <div class="form-group">
                <label>Siren #${siren.id} - Farbe:</label>
                <input type="color" value="${hexToColor(siren.color)}" 
                    onchange="updateSirenColor(${idx}, this.value)">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label>Intensität:</label>
                    <input type="number" value="${siren.intensity}" step="0.1" 
                        onchange="updateSirenField(${idx}, 'intensity', this.value)">
                </div>
                <div class="form-group">
                    <label>Scale Faktor:</label>
                    <input type="number" value="${siren.scaleFactor}" 
                        onchange="updateSirenField(${idx}, 'scaleFactor', this.value)">
                </div>
            </div>
            <button class="btn-small" onclick="removeSiren(${idx})">Entfernen</button>
        </div>
    `).join('');
}

function updateSirenColor(idx, color) {
    sirens[idx].color = colorToHex(color);
}

function updateSirenField(idx, field, value) {
    sirens[idx][field] = isNaN(value) ? value : parseFloat(value);
}

function removeSiren(idx) {
    sirens.splice(idx, 1);
    renderSirensList();
}

function hexToColor(hexColor) {
    const hex = hexColor.replace('0x', '');
    if (hex.length === 8) {
        return '#' + hex.slice(2);
    }
    return '#FF0000';
}

function colorToHex(color) {
    const hex = color.replace('#', '');
    return '0xFF' + hex.toUpperCase();
}

// Tuning Management
const tuningTypes = ['VMT_ROOF', 'VMT_BUMPER_F', 'VMT_BUMPER_R', 'VMT_GRILL', 'VMT_EXHAUST', 'VMT_SKIRT', 'VMT_ENGINE', 'VMT_BRAKES', 'VMT_SUSPENSION', 'VMT_ARMOUR'];

addTuningBtn.addEventListener('click', () => {
    const newTuning = {
        modelName: `tuning_part_${tuningParts.length + 1}`,
        modShopLabel: `tuning_part_${tuningParts.length + 1}`,
        type: 'VMT_ROOF',
        weight: 20,
        bone: 'chassis'
    };
    tuningParts.push(newTuning);
    renderTuningList();
});

function renderTuningList() {
    tuningList.innerHTML = tuningParts.map((part, idx) => `
        <div class="tuning-item">
            <div class="form-group">
                <label>Modell-Name:</label>
                <input type="text" value="${part.modelName}" 
                    onchange="updateTuningField(${idx}, 'modelName', this.value)">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label>Typ:</label>
                    <select onchange="updateTuningField(${idx}, 'type', this.value)">
                        ${tuningTypes.map(t => `<option ${part.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Gewicht:</label>
                    <input type="number" value="${part.weight}" 
                        onchange="updateTuningField(${idx}, 'weight', this.value)">
                </div>
            </div>
            <button class="btn-small" onclick="removeTuning(${idx})">Entfernen</button>
        </div>
    `).join('');
}

function updateTuningField(idx, field, value) {
    tuningParts[idx][field] = isNaN(value) ? value : parseFloat(value);
}

function removeTuning(idx) {
    tuningParts.splice(idx, 1);
    renderTuningList();
}

// Generate & Download
generateBtn.addEventListener('click', () => {
    const xml = generateCarcolsXml();
    downloadFile(xml, 'carcols.meta');
});

function generateCarcolsXml() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<CVehicleModelInfoVarGlobal>\n';
    
    // Generate Sirens
    if (enableSirens.checked && sirens.length > 0) {
        xml += '  <Sirens>\n    <Item>\n';
        xml += `      <id value="${sirenVehicleId.value}" />\n`;
        xml += `      <name>${sirenName.value}</name>\n`;
        xml += `      <textureName>${sirenTexture.value}</textureName>\n`;
        xml += '      <sequencerBpm value="600" />\n';
        xml += '      <sirens>\n';
        
        sirens.forEach((siren, idx) => {
            xml += `        <Item>\n`;
            xml += `          <!-- Siren ${idx + 1} -->\n`;
            xml += `          <color value="${siren.color}" />\n`;
            xml += `          <intensity value="${siren.intensity}" />\n`;
            xml += `          <lightGroup value="${siren.lightGroup}" />\n`;
            xml += `          <scaleFactor value="${siren.scaleFactor}" />\n`;
            xml += `          <rotate value="false" />\n`;
            xml += `          <scale value="true" />\n`;
            xml += `          <flash value="true" />\n`;
            xml += `          <light value="true" />\n`;
            xml += `          <spotLight value="true" />\n`;
            xml += `          <castShadows value="true" />\n`;
            xml += `        </Item>\n`;
        });
        
        xml += '      </sirens>\n';
        xml += '    </Item>\n  </Sirens>\n';
    }
    
    // Generate Kits
    if (enableTuning.checked && tuningParts.length > 0) {
        xml += '  <Kits>\n    <Item>\n';
        xml += `      <kitName>${kitName.value}</kitName>\n`;
        xml += `      <id value="${kitId.value}" />\n`;
        xml += `      <kitType>${kitType.value}</kitType>\n`;
        xml += '      <visibleMods>\n';
        
        tuningParts.forEach((part) => {
            xml += '        <Item>\n';
            xml += `          <modelName>${part.modelName}</modelName>\n`;
            xml += `          <modShopLabel>${part.modShopLabel}</modShopLabel>\n`;
            xml += `          <type>${part.type}</type>\n`;
            xml += `          <bone>${part.bone}</bone>\n`;
            xml += `          <weight value="${part.weight}" />\n`;
            xml += '        </Item>\n';
        });
        
        xml += '      </visibleMods>\n';
        xml += '    </Item>\n  </Kits>\n';
    }
    
    xml += '</CVehicleModelInfoVarGlobal>';
    return xml;
}

function downloadFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Initial Render
renderSirensList();
renderTuningList();
