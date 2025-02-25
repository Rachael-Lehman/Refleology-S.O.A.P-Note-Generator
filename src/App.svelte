<script>import "./app.css";
import {
    Button,
    Input,
    Label,
    Listgroup,
    ListgroupItem,
    Navbar,
    NavBrand,
    NavHamburger,
    NavLi,
    NavUl,
    Textarea
} from "flowbite-svelte";

let congAreas = [{
    id: 1,
    foot: null,
    anatomicalArea: null,
    temperature: null,
    hydration: null,
    color: null,
    tissueTone: null
}];
let footItems = ['Right foot', 'Left foot', 'Bilateral'];
let anatomicalAreaItems = ['Proximal hallux, bilat (cervical)', '1st Metatarsal, bilateral (thoracic)', '1st Cuneiform to calcaneus, bilateral (lumbar)', '1st Cuneiform to calcaneus, bilateral (lumbar)', 'Medial edge of posterior calcaneus, bilateral (sacral and coccyx)', 'Interphalangeal jt of hallux, bilat (jaw)', 'MTP #1-5, bilat (collarbone)', 'MTP #5, bilat (shoulder)', 'Lat. MTP to tuberosity of 5th metat., bilat. (arm)', 'Lat. tuberosity of 5th metat., bilat. (knee/elbow)', 'Lat. tuberosity of 5th metat to calcaneofibular jt., bilat (knee/leg/hip)', 'Lat. post. calcaneofibular jt., bilat (pelvis/hip)', 'Distal phalanges #1-5, bilat (brain)', 'Med. aspect from 1st prox. phalanx to post. calcaneus, bilat. (spinal cord)'];
let temperatureItems = ['Normal temperature', 'Cool to touch', 'Hot to touch'];
let hydrationItems = ['Normal hydration', 'Dryness', 'Damp or clammy tissue', 'Sweatyness', 'Profusely sweatyness', 'Boggyness', 'Congestion', 'Sponginess'];
let colorItems = ['Normal color', 'Paleness', 'Redness (erythematous)', 'Blotchy'];
let tissueToneItems = ['Normal tissue tone', 'Resistant tissue tone', 'Firm tissue tone', 'Stringy/ropy tissue tone', 'Contracted tissue tone', 'Relaxed tissue tone', 'Flaccid tissue tone', 'Nodular tissue tone'];
let showModal = false;

function addCongestionAreas() {
    congAreas = [...congAreas, {
        id: congAreas.length + 1,
        foot: null,
        anatomicalArea: null,
        temperature: null,
        hydration: null,
        color: null,
        tissueTone: null
    }];
}

function removeField(index) {
    congAreas = congAreas.filter((_, i) => i !== index);
}

async function generate() {
    const clientName = document.getElementById('clientName').value;
    const date = document.getElementById('date').value;
    const reflexologist = document.getElementById('reflexologist').value;
    const chiefComplaint = document.getElementById('chiefComplaint').value;
    const healthHistory = document.getElementById('healthHistory').value;
    const observation = document.getElementById('observation').value;
    const sessionType = document.getElementById('sessionType').value;
    const areasOfEmphasis = document.getElementById('areasOfEmphasis').value;
    const clientResponse = document.getElementById('clientResponse').value;
    const recommendations = document.getElementById('recommendations').value;
    const homeCare = document.getElementById('homeCare').value;
    const followUp = document.getElementById('followUp').value;
    // const bones = document.getElementById('bones')?.querySelector('input[type="radio"]:checked')?.value ?
    //   document.getElementById('bones').querySelector('input[type="radio"]:checked').value : "";

    let soapNote = `SOAP Note\n\nClient Name: ${clientName}\nDate: ${date}\nReflexologist: ${reflexologist}\n\n`;
    soapNote += `Subjective:\nChief Complaint: ${chiefComplaint}\nHealth History: ${healthHistory}\n\n`;
    soapNote += `Objective:\nObservation: ${observation}\n\n` //Bones: ${bones}\n\n`;

    for (let i = 0; i < congAreas.length; i++) {
        if (congAreas[i].hydration !== "normal hydration") {
            soapNote += `Hydration: ${congAreas[i].hydration}\n`;
        }
        if (congAreas[i].color !== "normal color") {
            soapNote += `Color: ${congAreas[i].color}\n`;
        }
        if (congAreas[i].tissueTone !== "normal tissue tone") {
            soapNote += `Tissue Tone: ${congAreas[i].tissueTone}\n`;
        }
        if (congAreas[i].temperature !== "normal temperature") {
            soapNote += `Temperature: ${congAreas[i].temperature}\n`;
        }
    }

    soapNote += `\nAssessment:\nType of Session: ${sessionType}\n`;

    if (areasOfEmphasis) {
        soapNote += `Areas of Emphasis: ${areasOfEmphasis}\n`;
    }
    if (clientResponse) {
        soapNote += `Client Response: ${clientResponse}\n`;
    }

    soapNote += `Plan:\n`;

    if (recommendations) {
        soapNote += `Recommendations: ${recommendations}\n`;
    }
    if (homeCare) {
        soapNote += `Home Care: ${homeCare}\n`;
    }

    soapNote += `Follow-up: ${followUp}\n\n`;
    soapNote += `Reflexologist Signature: ${reflexologist}\nDate: ${date}`;

    await navigator.clipboard.writeText(soapNote);
    alert("SOAP note copied to clipboard! ✅");
}

</script>

<div class="relative px-8">
    <Navbar class="px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b">
        <NavBrand href="/">
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
        SOAP Note Generator
      </span>
        </NavBrand>
        <NavHamburger/>
        <NavUl>
            <NavLi href="#basicInfo" active={true}>Basic Info</NavLi>
            <NavLi href="#objective">Objective</NavLi>
            <NavLi href="#congestionAreas">Congestion Areas</NavLi>
            <NavLi href="#conclusions">Conclusions</NavLi>
        </NavUl>
    </Navbar>
</div>

<main class="pt-[100px]">
    <form>
        <h1 id="basicInfo">Basic Info</h1>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <Label for="clientName" class="mb-2 dark:text-white">Client Name</Label>
                <Input type="text" id="clientName" required/>
            </div>
            <div>
                <Label for="date" class="mb-2">Date</Label>
                <Input type="date" id="date" required/>
            </div>
            <div>
                <Label for="reflexologist" class="mb-2">Reflexologist</Label>
                <Input type="text" id="reflexologist" required/>
            </div>
            <div>
                <Label for="sessionType" class="mb-2">Type of Session</Label>
                <Input type="text" id="sessionType" required placeholder="i.e., 60-minute reflexology session."/>
            </div>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <Label for="chiefComplaint" class="mb-2 dark:text-white">Chief Complaint/Reason for Visit</Label>
                <Textarea id="chiefComplaint" rows="8"
                          placeholder="i.e., Client reports experiencing increased stress and anxiety."/>
            </div>
            <div>
                <Label for="healthHistory" class="mb-2 dark:text-white">Health History</Label>
                <Textarea id="healthHistory" rows="8"
                          placeholder="i.e., History of generalized anxiety disorder, hypertension."/>
            </div>
        </div>

        <h1 id="objective">Objective</h1>
        <div class="grid gap-6 mb-6 md:grid-cols-1">
            <div>
                <Label for="observation" class="mb-2 dark:text-white">Observation</Label>
                <Textarea id="observation" rows="4"
                          placeholder="i.e., Client appears relaxed, skin on feet is intact."/>
            </div>
        </div>

        <h1 id="congestionAreas">Areas of Congestion and Sensitivity</h1>
        <div>
            {#each congAreas as field, index}
                <div class="border p-3 rounded">
                    <h2>Foot</h2>
                    <Listgroup>
                        {#each footItems as option}
                            <ListgroupItem>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="foot-{field.id}" value={option} bind:group={field.foot}
                                           class="w-4 h-4"/>
                                    {option}
                                </label>
                            </ListgroupItem>
                        {/each}
                    </Listgroup>
                    <br>

                    <h2>Anatomical Areas</h2>
                    <Listgroup>
                        {#each anatomicalAreaItems as option}
                            <ListgroupItem>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="anatomicalArea-{field.id}" value={option}
                                           bind:group={field.anatomicalArea} class="w-4 h-4"/>
                                    {option}
                                </label>
                            </ListgroupItem>
                        {/each}
                    </Listgroup>
                    <br>

                    <h2>Temperature</h2>
                    <Listgroup>
                        {#each temperatureItems as option}
                            <ListgroupItem>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="temperature-{field.id}" value={option}
                                           bind:group={field.temperature} class="w-4 h-4"/>
                                    {option}
                                </label>
                            </ListgroupItem>
                        {/each}
                    </Listgroup>
                    <br>

                    <h2>Hydration</h2>
                    <Listgroup>
                        {#each hydrationItems as option}
                            <ListgroupItem>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="hydration-{field.id}" value={option}
                                           bind:group={field.hydration} class="w-4 h-4"/>
                                    {option}
                                </label>
                            </ListgroupItem>
                        {/each}
                    </Listgroup>
                    <br>

                    <h2>Color</h2>
                    <Listgroup>
                        {#each colorItems as option}
                            <ListgroupItem>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="color-{field.id}" value={option} bind:group={field.color}
                                           class="w-4 h-4"/>
                                    {option}
                                </label>
                            </ListgroupItem>
                        {/each}
                    </Listgroup>
                    <br>

                    <h2>Tissue Tone</h2>
                    <Listgroup>
                        {#each tissueToneItems as option}
                            <ListgroupItem>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="tissueTone-{field.id}" value={option}
                                           bind:group={field.tissueTone} class="w-4 h-4"/>
                                    {option}
                                </label>
                            </ListgroupItem>
                        {/each}
                    </Listgroup>

                    <button
                            type="button"
                            on:click={() => removeField(index)}
                            class="bg-red-500 text-white px-2 py-1 rounded mt-2"
                    >
                        ✕ Remove
                    </button>
                </div>
            {/each}

            <br>
            <Button on:click={addCongestionAreas} class="bg-blue-500 text-white px-4 py-2 rounded">
                Add Congestion Area
            </Button>
            <br>
        </div>


        <h1 id="conclusions">Conclusions</h1>
        <div class="grid gap-6 mb-6 md:grid-cols-1">
            <div>
                <Label for="areasOfEmphasis" class="mb-2 dark:text-white">Areas of Emphasis</Label>
                <Textarea id="areasOfEmphasis" rows="4"
                          placeholder="i.e., Focused on liver, kidney, and endocrine reflexes."/>
            </div>
            <div>
                <Label for="clientResponse" class="mb-2 dark:text-white">Client Response</Label>
                <Textarea id="clientResponse" rows="4"
                          placeholder="i.e., Client reported feeling calmer and more relaxed."/>
            </div>
            <div>
                <Label for="recommendations" class="mb-2 dark:text-white">Recommendations</Label>
                <Textarea id="recommendations" rows="4"
                          placeholder="i.e., Advised client to drink plenty of water and practice deep breathing exercises."/>
            </div>
            <div>
                <Label for="homeCare" class="mb-2 dark:text-white">Home Care</Label>
                <Textarea id="homeCare" rows="4"
                          placeholder="i.e., Instructions for self-reflexology techniques provided."/>
            </div>
            <div>
                <Label for="followUp" class="mb-2 dark:text-white">Follow-up</Label>
                <Input type="text" id="followUp" placeholder="i.e., Schedule next appointment in 2 weeks."/>
            </div>
        </div>
    </form>

    <button on:click={generate} class="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Submit
    </button>
</main>


<style>
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }
</style>
