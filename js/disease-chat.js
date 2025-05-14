/**
 * Disease Chat Module
 * Handles disease diagnosis chat flow with structured follow-up options
 */

// Global state to track which follow-up options have been shown
let shownSections = {
    medications: false,
    lifestyle: false,
    whenToSeeDoctor: false
};

// Current disease being discussed
let currentDisease = null;

// Load disease data from JSON file
let diseaseData = [];
fetch('24-Disease.json')
    .then(response => response.json())
    .then(data => {
        console.log('Disease data loaded successfully');
        diseaseData = data;
    })
    .catch(error => console.error('Error loading disease data:', error));

/**
 * Process AI response for disease diagnosis
 * @param {string} aiResponse - The raw AI response
 * @returns {string} Formatted response with disease information
 */
function processDiseaseResponse(aiResponse) {
    // Extract disease name from AI response
    // Example format: "Prediction: Common Cold (confidence: 85.5%)"
    const match = aiResponse.match(/Prediction: ([^(]+)/);
    if (!match) return aiResponse; // Return original if no match
    
    const diseaseName = match[1].trim();
    console.log(`Processing disease: ${diseaseName}`);
    
    // Find disease in data
    const disease = diseaseData.find(d => d.name.toLowerCase() === diseaseName.toLowerCase());
    if (!disease) {
        console.log(`Disease not found: ${diseaseName}`);
        return aiResponse; // Return original if disease not found
    }
    
    // Store current disease for follow-up
    currentDisease = disease;
    
    // Reset shown sections
    resetShownSections();
    
    // Format initial response with disease description and home care
    return formatDiseaseResponse(disease);
}

/**
 * Format the disease information for display
 * @param {Object} disease - The disease object
 * @returns {string} Formatted HTML for the disease information
 */
function formatDiseaseResponse(disease) {
    // Create formatted response with emoji and styling
    let response = `<div class="disease-info">
        <div class="disease-title">🩺 <strong>${disease.name}</strong></div>
        <div class="disease-section">
            <div class="section-title"><strong>Description:</strong></div>
            <div class="section-content">${formatTextWithBullets(disease.description)}</div>
        </div>
        <div class="disease-section">
            <div class="section-title"><strong>Home Care Tips:</strong></div>
            <div class="section-content">${formatTextWithBullets(disease.homeCare)}</div>
        </div>
    </div>`;
    
    // Add follow-up options
    response += generateFollowUpOptions();
    
    return response;
}

/**
 * Format text with bullet points for better readability
 * @param {string} text - The text to format
 * @param {string} type - The type of content being formatted
 * @returns {string} Formatted text with bullet points
 */
function formatTextWithBullets(text, type = 'default') {
    // Split by newline
    return text.split('\n\n').map(line => {
        if (line.trim() === '') return '';
        
        // Special formatting for medication section
        if (type === 'medications') {
            // Check if this is a side effect line
            if (line.startsWith('Side Effects:')) {
                // Make side effects italic, without bullet, and indented
                return `<div style="margin-left: 20px;"><i>${line}</i></div>`;
            }
        }
        
        // Default formatting with bullet points
        return `• ${line}`;
    }).join('<br>');
}

/**
 * Generate follow-up option buttons
 * @returns {string} HTML for follow-up option buttons
 */
function generateFollowUpOptions() {
    let options = '<div class="follow-up-options">';
    
    // Only show options that haven't been selected yet
    if (!shownSections.medications) {
        options += `<button class="option-button" onclick="handleFollowUpOption('medications')">💊 Do you need to know recommended medication?</button>`;
    }
    
    if (!shownSections.lifestyle) {
        options += `<button class="option-button" onclick="handleFollowUpOption('lifestyle')">🏃 Life style recommendations?</button>`;
    }
    
    if (!shownSections.whenToSeeDoctor) {
        options += `<button class="option-button" onclick="handleFollowUpOption('whenToSeeDoctor')">👨‍⚕️ When to see a doctor?</button>`;
    }
    
    // If all sections have been shown, offer to restart
    if (shownSections.medications && shownSections.lifestyle && shownSections.whenToSeeDoctor) {
        options += `<button class="option-button" onclick="handleFollowUpOption('restart')">🩺 New symptoms?</button>`;
    }
    
    options += '</div>';
    return options;
}

/**
 * Handle user selection of a follow-up option
 * @param {string} option - The selected option
 * @returns {string} Response for the selected option
 */
function handleFollowUpOption(option) {
    let response = '';
    
    if (option === 'restart') {
        // Reset the conversation state
        resetShownSections();
        currentDisease = null;
        return "What symptoms are you experiencing?";
    }
    
    // Check for currentDisease for other options
    if (!currentDisease) return "I'm sorry, I don't have information about this disease.";
    
    // Mark this section as shown
    shownSections[option] = true;
    
    // Format response based on selected option
    switch (option) {
        case 'medications':
            response = `<div class="disease-section">
                <div class="section-title"><strong>💊 Recommended Medications:</strong></div>
                <div class="section-content">${formatTextWithBullets(currentDisease.medications, 'medications')}</div>
            </div>`;
            break;
        case 'lifestyle':
            response = `<div class="disease-section">
                <div class="section-title"><strong>🏃 Lifestyle Recommendations:</strong></div>
                <div class="section-content">${formatTextWithBullets(currentDisease.lifestyle)}</div>
            </div>`;
            break;
        case 'whenToSeeDoctor':
            response = `<div class="disease-section">
                <div class="section-title"><strong>👨‍⚕️ When to See a Doctor:</strong></div>
                <div class="section-content">${formatTextWithBullets(currentDisease.whenToSeeDoctor)}</div>
            </div>`;
            break;
    }
    
    // Add remaining follow-up options
    response += generateFollowUpOptions();
    
    return response;
}

/**
 * Process user message for "yes" responses
 * @param {string} userMessage - The user's message
 * @returns {boolean|string} False if not a yes response, or the response content
 */
function processYesResponse(userMessage) {
    // Check if this is a "yes" response
    const yesPattern = /^(yes|yeah|yep|sure|ok|okay|y)$/i;
    if (!yesPattern.test(userMessage.trim())) return false;
    
    // If no disease is being discussed, this isn't a follow-up yes
    if (!currentDisease) return false;
    
    // If all sections have been shown, treat as restart
    if (shownSections.medications && shownSections.lifestyle && shownSections.whenToSeeDoctor) {
        resetShownSections();
        currentDisease = null;
        return "What symptoms are you experiencing?";
    }
    
    // Show all remaining sections in order
    let response = '';
    
    if (!shownSections.medications) {
        shownSections.medications = true;
        response += `<div class="disease-section">
            <div class="section-title"><strong>💊 Recommended Medications:</strong></div>
            <div class="section-content">${formatTextWithBullets(currentDisease.medications, 'medications')}</div>
        </div>`;
    }
    
    if (!shownSections.lifestyle) {
        shownSections.lifestyle = true;
        response += `<div class="disease-section">
            <div class="section-title"><strong>🏃 Lifestyle Recommendations:</strong></div>
            <div class="section-content">${formatTextWithBullets(currentDisease.lifestyle)}</div>
        </div>`;
    }
    
    if (!shownSections.whenToSeeDoctor) {
        shownSections.whenToSeeDoctor = true;
        response += `<div class="disease-section">
            <div class="section-title"><strong>👨‍⚕️ When to See a Doctor:</strong></div>
            <div class="section-content">${formatTextWithBullets(currentDisease.whenToSeeDoctor)}</div>
        </div>`;
    }
    
    // Add restart option
    response += `<div class="follow-up-options">
        <button class="option-button" onclick="handleFollowUpOption('restart')">🩺 New symptoms?</button>
    </div>`;
    
    return response;
}

/**
 * Reset the shown sections state
 */
function resetShownSections() {
    shownSections = {
        medications: false,
        lifestyle: false,
        whenToSeeDoctor: false
    };
}

// Make functions available globally
window.processDiseaseResponse = processDiseaseResponse;
window.handleFollowUpOption = handleFollowUpOption;
window.processYesResponse = processYesResponse;
