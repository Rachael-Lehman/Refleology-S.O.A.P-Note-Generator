function generateCongestionSentence(item) {
    // Handle foot text only if foot is provided and not empty
    const footText = item.foot && item.foot.trim() ? `${item.foot.trim()}, ` : "";

    // Capitalize only specific aspect keywords (plantar, medial, lateral, dorsal)
    const aspectKeywords = ["Plantar", "Medial", "Lateral", "Dorsal"];
    const aspectParts = item.aspect.split(" ");
    const capitalizedAspect = aspectParts
        .map((word) =>
            aspectKeywords.includes(word.toLowerCase())
                ? word.charAt(0).toUpperCase() + word.slice(1)
                : word
        )
        .join(" ");

    // Include bilat if true
    const bilatText = item.bilat === "true" ? ", bilat" : "";

    // Construct the observation string
    return footText || capitalizedAspect
        ? `        * ${footText}${capitalizedAspect}, ${item.AnatomicalArea} presented with ${item.temperature}, ${item.hydration}, ${item.color}, ${item.tissueTone}, and a sensitivity reported as a "${item.sensitivity}"${bilatText}.\n`
        : "";
}

function addCongestionArea() {
    const congestionAreas = document.getElementById("congestionAreas");
    const newArea = document.createElement("div");
    newArea.classList.add("congestion-area");
    newArea.innerHTML = `
        <label>Foot:</label>
        <select class="foot-select">
            ${footOptions.map((foot) => <option value="${foot}">${foot}</option>).join("")}
        </select><br>    
        <select class="AnatomicalArea-select">
    ${boneNames.map((bone) => <option value="${bone}">${bone}</option>).join("")}
</select><br>
        </select><br>
        <label>Sensitivity (1-5):</label>
        <input type="number" class="sensitivity-input" min="1" max="5" required><br>
        <label>Temperature:</label>
        <select class="temperature-select">${temperatureOptions
            .map((temp) => <option value="${temp}">${temp}</option>)
            .join("")}</select><br>
        <label>Hydration:</label>
        <select class="hydration-select">${hydrationOptions
            .map((hyd) => <option value="${hyd}">${hyd}</option>)
            .join("")}</select><br>
        <label>Color:</label>
        <select class="color-select">${colorOptions
            .map((col) => <option value="${col}">${col}</option>)
            .join("")}</select><br>
        <label>Tissue Tone:</label>
        <select class="tissue-tone-select">${tissueToneOptions
            .map((tone) => <option value="${tone}">${tone}</option>)
            .join("")}</select><br>
        <label>Bilateral:</label>
        <select class="bilat-select">
            <option value="false">No</option>
            <option value="true">Yes</option>
        </select><br>
        <button type="button" onclick="removeCongestionArea(this)">Remove</button><hr>
    `;
    congestionAreas.appendChild(newArea);
}

function generateSoapNote() {
    const clientName = document.getElementById("clientName").value;
    const date = document.getElementById("date").value;
    const reflexologist = document.getElementById("reflexologist").value;
    const chiefComplaint = document.getElementById("chiefComplaint").value;
    const healthHistory = document.getElementById("healthHistory").value;
    const observation = document.getElementById("observation").value;
    const sessionType = document.getElementById("sessionType").value;
    const areasOfEmphasis = document.getElementById("areasOfEmphasis").value;
    const clientResponse = document.getElementById("clientResponse").value;
    const recommendations = document.getElementById("recommendations").value;
    const homeCare = document.getElementById("homeCare").value;
    const followUp = document.getElementById("followUp").value;

    const congestionData = [];
    const congestionAreas = document.querySelectorAll("#congestionAreas .congestion-area");
    congestionAreas.forEach((area) => {
        const foot = area.querySelector(".foot-select").value;
        const aspect = area.querySelector(".aspect-select").value;
        const bone = area.querySelector(".bone-select").value;
        const sensitivity = area.querySelector(".sensitivity-input").value || "N/A";
        const temperature = area.querySelector(".temperature-select").value;
        const hydration = area.querySelector(".hydration-select").value;
        const color = area.querySelector(".color-select").value;
        const tissueTone = area.querySelector(".tissue-tone-select").value;
        const bilat = area.querySelector(".bilat-select").value;
        congestionData.push({ foot, aspect, bone, sensitivity, temperature, hydration, color, tissueTone, bilat });
    });

    let congestionString = "";
    if (congestionData.length > 0) {
        congestionString = congestionData
            .map((item) => generateCongestionSentence(item))
            .filter((sentence) => sentence.trim() !== "") // Skip empty or invalid sentences
            .join("");
    }

    let soapNoteString = `ARCB Forms

Forms from ARCB can be downloaded in PDF here: https://www.arcb.net/post/client-session-soap-notes-forms

Sample SOAP Note

Client Name: ${clientName}

Date: ${date}

Reflexologist: ${reflexologist}, Certified Reflexologist

Subjective:

    Chief Complaint/Reason for Visit: ${chiefComplaint}
    Health History: ${healthHistory}

Objective:

    Observation: ${observation}
    Areas of Congestion:
        ${congestionString || "None"}

Assessment:

    Type of Session: ${sessionType}
    Areas of Emphasis: ${areasOfEmphasis}
    Client Response: ${clientResponse}

Plan:

    Recommendations: ${recommendations}
    Home Care: ${homeCare}
    Follow-up: ${followUp}

Reflexologist Signature: ${reflexologist}

Date: ${date}`;

    document.getElementById("soapNote").innerHTML = soapNoteString;
    document.getElementById("copyButton").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("soapForm").addEventListener("submit", function (event) {
        event.preventDefault();
        generateSoapNote();
    });
});