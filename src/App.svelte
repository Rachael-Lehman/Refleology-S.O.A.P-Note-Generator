
<script>
    import "./app.css";
    import {
      Accordion,
      AccordionItem,
      Button,
      Input,
      Label,
      Listgroup,
      ListgroupItem,
      Textarea
    } from "flowbite-svelte";
    import Toast from './lib/Toast.svelte';
    import NoteDisplay from './lib/NoteDisplay.svelte';
    import SectionHeader from './lib/SectionHeader.svelte';
    import { onMount } from 'svelte';
    import Navbar from './Navbar.svelte';

    // Add smooth scrolling behavior
    onMount(() => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const element = document.querySelector(this.getAttribute('href'));
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    });

    let user = null;
    let isLoading = true;
    let authError = null;
    let note = '';
    let savedNotes = [];
    let isUploading = false;
    let uploadError = null;
    let toast = null;
    

    onMount(async () => {
      try {
        const API_URL = 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/user`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          user = await res.json();
          console.log('User logged in:', user);
          // Only fetch notes if user is logged in
          if (user) {
            await fetchSavedNotes();
          }
        } else {
          console.error('Failed to fetch user:', await res.text());
          authError = 'Failed to fetch user information';
        }
      } catch (err) {
        console.error('Auth error:', err);
        authError = 'Error connecting to server';
      } finally {
        isLoading = false;
      }
    });
  
    function loginWithGoogle() {
      const API_URL = 'http://localhost:3000';
      window.location.href = `${API_URL}/auth/google`;
    }
  
let congAreas = [{
  id: 1,
  foot: null,
  anatomicalArea: null,
  temperature: null,
  hydration: null,
  color: null,
  tissueTone: null,
  sensitivity: null     // ✅ ADD THIS LINE
}];

  
    let footItems = ['Right foot', 'Left foot', 'Bilateral'];
    // let anatomicalAreaItems = ['Proximal hallux, bilat', '1st Metatarsal, bilateral', '1st Cuneiform to calcaneus, bilateral', 'Medial edge of posterior calcaneus, bilateral', 'Interphalangeal jt of hallux, bilat (jaw)', 'MTP #1-5, bilat (collarbone)', 'MTP #5, bilat (shoulder)', 'Lat. MTP to tuberosity of 5th metat., bilat. (arm)', 'Lat. tuberosity of 5th metat., bilat. (knee/elbow)', 'Lat. tuberosity of 5th metat to calcaneofibular jt., bilat (knee/leg/hip)', 'Lat. post. calcaneofibular jt., bilat (pelvis/hip)', 'Distal phalanges #1-5, bilat (brain)', 'Med. aspect from 1st prox. phalanx to post. calcaneus, bilat. (spinal cord)'];
    let temperatureItems = ['Normal temperature', 'Cool to touch', 'Hot to touch'];
    let hydrationItems = ['Normal hydration', 'Dryness', 'Damp or clammy tissue', 'Sweatyness', 'Profusely sweatyness', 'Boggyness', 'Congestion', 'Sponginess'];
    let colorItems = ['Normal color', 'Paleness', 'Redness (erythematous)', 'Blotchy'];
    let tissueToneItems = ['Normal tissue tone', 'Resistant tissue tone', 'Firm tissue tone', 'Stringy/ropy tissue tone', 'Contracted tissue tone', 'Relaxed tissue tone', 'Flaccid tissue tone', 'Nodular tissue tone'];
let selectedSystemByField = {};
let anatomicalAreasBySystem = {
  "Musculoskeletal": [
    "Proximal hallux, bilat (cervical)",
    "1st Metatarsal, bilateral (thoracic)",
    "1st Cuneiform to calcaneus, bilateral (lumbar)",
    "Medial edge of posterior calcaneus, bilateral (sacral and coccyx)",
    "Interphalangeal jt of hallux, bilat (jaw)",
    "MTP #1-5, bilat (collarbone)",
    "MTP #5, bilat (shoulder)",
    "Lat. MTP to tuberosity of 5th metat., bilat (arm)",
    "Lat. tuberosity of 5th metat., bilat (knee/elbow)",
    "Lat. tuberosity of 5th metat to calcaneofibular jt., bilat (knee/leg/hip)",
    "Lat. post. calcaneofibular jt., bilat (pelvis/hip)"
  ],
  "Nervous": [
    "Distal phalanges #1-5, bilat (brain)",
    "Med. aspect from 1st prox. phalanx to post. calcaneus, bilat (spinal cord)",
    "Med. edge 1st proximal phalanx, bilat (cervical)",
    "Med. edge 1st metat., bilat (thoracic)",
    "Med. edge of med. cuneiform to navicular, bilat (lumbar)",
    "Med. edge talonavicular jt. to post. calc., bilat (sacrum & coccyx)",
    "Vagus nerve: Plantar aspect prox. edge of med. sesamoid on 1st metat., bilat",
    "Phrenic nerve: Lat. edge of interphalangeal jt of hallux, bilat"
  ],
  "Endocrine/Reproductive": [
    "Pituitary & Hypothalamus: Bilat plantar surface of intermed. distal hallux",
    "Pineal: Med. edge of distal hallux, bilat",
    "Thyroid: Med. edge of prox. hallux, bilat",
    "Thymus: Med. aspect of MTP jt, bilat",
    "Thymus (alt): Med. edge of head of 1st metatarsal, bilat",
    "Adrenal: Lat. base of 1st metat, bilat",
    "Adrenal (alt): Lat. edge of 1st metatarsocuneiform jt, bilat",
    "Uterus/Prostate: Med. aspect of post. calcaneus, bilat",
    "Uterus/Prostate (alt): Med. aspect of talus, medial tubercle, bilat",
    "Ovary/Testis: Lat. aspect of post. talus and calcaneus, bilat",
    "Ova/Sperm Duct: Lat. post. calcaneus to talonavicular jt to med. post. calcaneus, bilat"
  ],
  "Respiratory": [
    "Nose: Med. edge to plantar interphalangeal jt of hallux, bilat",
    "Sinuses: Plantar distal and middle phalanges #2-5, bilat",
    "Lungs: Plantar MTP joints #2-5, bilat",
    "Lungs (alt): Base of phalanges #2-5 to distal head of metat #2-5, bilat",
    "Diaphragm (Stone): Plantar surface distal to MTP jts #1-5",
    "Diaphragm (Touchpoint): Transverse across intermediate metats #1 to #4, bilat",
    "Diaphragm (Anatomical): Distal head of metat #1 across to tuberosity of 5th metat, bilat"
  ],
  "Cardiovascular": [
    "Heart: 1st MTP jt on right foot; #1-3 MTP jt on left foot",
    "Carotid Artery: Lateral edge of proximal hallux, bilat"
  ],
  "Immune/Lymphatic": [
    "Tonsils: Lateral aspect of distal hallux, bilat",
    "Thymus: Medial aspect of MTP joint, bilat",
    "Thymus (alt): Medial edge of head of 1st metatarsal, bilat",
    "Spleen: Base of 4th-5th metatarsal, left foot (plantar surface)"
  ],
  "Digestive": [
    "Liver: Metat #5-1 on right foot and metat #1 on left foot (plantar aspect)",
    "Gall Bladder: Right plantar aspect of metat #4",
    "Mouth: Medial edge to plantar aspect of hallux interphalangeal jt, bilat",
    "Esophagus: Medial edge of proximal hallux to MTP jt., bilat",
    "Stomach: Left plantar from lateral metat #1 to lateral edge of metat #4",
    "Duodenum: Right plantar from medial metat #1 to #2",
    "Small Intestines: Distal cuneiforms & cuboid to distal calcaneus, bilat",
    "Ileocecal Valve: Lateral intermediate cuboid, right foot (plantar)",
    "Ascending Colon: Lateral distal calcaneus to proximal metat #5, right foot (plantar)",
    "Transverse Colon: Cuboid across navicular joint, bilat",
    "Descending Colon: Lateral cuboid and distal calcaneus, left foot",
    "D+Sigmoid Colon: Medial 5th metat to intermediate calcaneus to medial talus, left foot",
    "Sigmoid Colon: Intermediate calcaneus, left foot (plantar)",
    "Rectum: Medial distal calcaneus to posterior calcaneus, bilat",
    "Pancreas: 1st to 4th metatarsocuneiform joints, across both feet (plantar)"
  ],
  "Urinary": [
    "Kidneys: Metatarsocuneiform joints #2 and #3, bilat",
    "Ureters: Medial cuneiform to medial distal calcaneus (plantar), bilat",
    "Bladder: Medial talonavicular joint and sustentaculum tali, bilat"
  ]
};


    function addCongestionAreas() {
  congAreas = [...congAreas, {
    id: congAreas.length + 1,
    foot: null,
    anatomicalArea: null,
    temperature: null,
    hydration: null,
    color: null,
    tissueTone: null,
    sensitivity: null   // ✅ ADD THIS
  }];
}

  
    function removeField(index) {
      congAreas = congAreas.filter((_, i) => i !== index);
    }
  
    async function uploadNote(noteContent) {
      isUploading = true;
      uploadError = null;
      toast = { message: 'Uploading SOAP note...', type: 'info' };
      
      try {
        console.log('Attempting to upload note:', noteContent);
        //const API_URL = 'http://localhost:3000';
        const API_URL = import.meta.env.VITE_API_URL;
        const API_URL = "https://www.reflexologysoapnotes.com
        const response = await fetch(`${API_URL}/upload-note`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            note: noteContent,
            clientName: formData.clientName,
            date: formData.date
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Upload successful:', result);
          toast = { message: 'Note uploaded successfully!', type: 'success' };
          await fetchSavedNotes();
        } else {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Upload failed: ${errorText}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        uploadError = `Failed to upload note: ${err.message}`;
        toast = { message: uploadError, type: 'error' };
      } finally {
        isUploading = false;
      }
    }

    function showToast(message, type = 'info') {
      toast = { message, type };
    }
  
    async function fetchSavedNotes() {
      try {
        const API_URL = 'http://localhost:3000';
        const res = await fetch(`${API_URL}/list-notes`, {
          credentials: 'include'
        });
        if (res.ok) {
          savedNotes = await res.json();
          console.log('Fetched saved notes:', savedNotes);
        } else {
          console.error('Failed to fetch notes:', await res.text());
        }
      } catch (err) {
        console.error('Error fetching saved notes:', err);
      }
    }
  
    // Add form field bindings at the top of the script
    let formData = {
      clientName: '',
      date: '',
      reflexologist: '',
      chiefComplaint: '',
      healthHistory: '',
      observation: '',
      sessionType: '',
      areasOfEmphasis: '',
      clientResponse: '',
      recommendations: '',
      homeCare: '',
      followUp: ''
    };

    async function generate() {
      let soapNote = `SOAP Note\n\nClient Name: ${formData.clientName}\nDate: ${formData.date}\nReflexologist: ${formData.reflexologist}\n\n`;
      soapNote += `Subjective:\n`;
      soapNote += formData.chiefComplaint ? `Chief Complaint: ${formData.chiefComplaint}\n` : '';
      soapNote += formData.healthHistory ? `Health History: ${formData.healthHistory}\n\n` : '\n';
      soapNote += `Objective:\n`;
      soapNote += formData.observation ? `Observation: ${formData.observation}\n\n` : '\n';
  
     for (let i = 0; i < congAreas.length; i++) {
  soapNote += `• ${congAreas[i].foot || ''} ${congAreas[i].anatomicalArea || ''}\n`;

  if (congAreas[i].temperature && congAreas[i].temperature !== 'Normal temperature')
    soapNote += `   - Temperature: ${congAreas[i].temperature}\n`;
  if (congAreas[i].hydration && congAreas[i].hydration !== 'Normal hydration')
    soapNote += `   - Hydration: ${congAreas[i].hydration}\n`;
  if (congAreas[i].color && congAreas[i].color !== 'Normal color')
    soapNote += `   - Color: ${congAreas[i].color}\n`;
  if (congAreas[i].tissueTone && congAreas[i].tissueTone !== 'Normal tissue tone')
    soapNote += `   - Tissue Tone: ${congAreas[i].tissueTone}\n`;
  if (congAreas[i].sensitivity && congAreas[i].sensitivity !== 'Normal')
    soapNote += `   - Sensitivity: ${congAreas[i].sensitivity}\n`;
}

  
      soapNote += `Action:\n`;
      soapNote += formData.sessionType ? `Type of Session: ${formData.sessionType}\n` : '';
      soapNote += formData.areasOfEmphasis ? `Areas of Emphasis: ${formData.areasOfEmphasis}\n` : '';
      soapNote += formData.clientResponse ? `Client Response: ${formData.clientResponse}\n\n` : '\n';
  
      soapNote += `Plan:\n`;
      soapNote += formData.recommendations ? `Recommendations: ${formData.recommendations}\n` : '';
      soapNote += formData.homeCare ? `Home Care: ${formData.homeCare}\n` : '';
      soapNote += formData.followUp ? `Follow-up: ${formData.followUp}\n\n` : '\n';
  
      soapNote += `Reflexologist Signature: ${formData.reflexologist}\nDate: ${formData.date}`;
  
      // After generating the note, also save it
      note = soapNote;
      await uploadNote(soapNote);
    }

    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        toast = { message: 'Note copied to clipboard!', type: 'success' };
      } catch (err) {
        console.error('Failed to copy:', err);
        toast = { message: 'Failed to copy to clipboard', type: 'error' };
      }
    }
  </script>
  
  <Navbar />
  
  <main class="pt-[100px] container mx-auto px-4">
    {#if isLoading}
      <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    {:else if authError}
      <div class="p-4 bg-red-100 border border-red-300 rounded">
        <p class="text-red-700">{authError}</p>
        <Button on:click={loginWithGoogle} class="mt-2">Try Login Again</Button>
      </div>
    {:else if !user}
      <div class="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p class="mb-2">You are not logged in.</p>
        <Button on:click={loginWithGoogle}>Login with Google</Button>
      </div>
    {:else}
      <!-- Form content -->
      <form on:submit|preventDefault={generate} class="mb-8">
        <SectionHeader id="subjective" title="Subjective">
          <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <Label for="clientName">Client Name</Label>
              <Input id="clientName" bind:value={formData.clientName} required />
            </div>
            <div>
              <Label for="date">Date</Label>
              <Input type="date" id="date" bind:value={formData.date} required />
            </div>
            <div>
              <Label for="reflexologist">Reflexologist</Label>
              <Input id="reflexologist" bind:value={formData.reflexologist} required />
            </div>
            <div>
              <Label for="sessionType">Type of Session</Label>
              <Input id="sessionType" bind:value={formData.sessionType} placeholder="i.e., 60-minute reflexology session." required />
            </div>
          </div>
    
          <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <Label for="chiefComplaint">Chief Complaint/Reason for Visit</Label>
              <Textarea id="chiefComplaint" bind:value={formData.chiefComplaint} rows={8} />
            </div>
            <div>
              <Label for="healthHistory">Health History</Label>
              <Textarea id="healthHistory" bind:value={formData.healthHistory} rows={8} />
            </div>
          </div>
        </SectionHeader>

        <SectionHeader id="objective" title="Objective">
          <div class="mb-6">
            <Label for="observation">Observation</Label>
            <Textarea id="observation" bind:value={formData.observation} rows={4} />
          </div>
    
          <!-- Congestion Areas -->
          <h1 id="congestionAreas">Areas of Congestion and Sensitivity</h1>
          <div>
            {#each congAreas as field, index}
              <div class="border p-3 rounded mb-4">
                <Accordion flush>
                  <AccordionItem>
                    <span slot="header">Foot</span>
                    <Listgroup>
                      {#each footItems as option}
                        <ListgroupItem>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="foot-{field.id}" value={option} bind:group={field.foot} />
                            {option}
                          </label>
                        </ListgroupItem>
                      {/each}
                    </Listgroup>
                  </AccordionItem>
                  <AccordionItem>
                    <span slot="header">Anatomical Area</span>
                    <Accordion class="w-full">
                    {#each Object.entries(anatomicalAreasBySystem) as [system, options]}
  <AccordionItem>
    <span slot="header">{system}</span>
    {#if !selectedSystemByField[field.id] || selectedSystemByField[field.id] === system}
      <Listgroup>
        {#each options as option}
          <ListgroupItem>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="anatomicalArea-{field.id}"
                value={option}
                bind:group={field.anatomicalArea}
                on:change={() => selectedSystemByField[field.id] = system}
              />
              {option}
            </label>
          </ListgroupItem>
        {/each}
      </Listgroup>
    {/if}
  </AccordionItem>
{/each}

                    </Accordion>
                  </AccordionItem>
                  <AccordionItem>
                    <span slot="header">Temperature</span>
                    <Listgroup>
                      {#each temperatureItems as option}
                        <ListgroupItem>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="temperature-{field.id}" value={option} bind:group={field.temperature} />
                            {option}
                          </label>
                        </ListgroupItem>
                      {/each}
                    </Listgroup>
                  </AccordionItem>
                  <AccordionItem>
                    <span slot="header">Hydration</span>
                    <Listgroup>
                      {#each hydrationItems as option}
                        <ListgroupItem>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="hydration-{field.id}" value={option} bind:group={field.hydration} />
                            {option}
                          </label>
                        </ListgroupItem>
                      {/each}
                    </Listgroup>
                  </AccordionItem>
                  <AccordionItem>
                    <span slot="header">Color</span>
                    <Listgroup>
                      {#each colorItems as option}
                        <ListgroupItem>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="color-{field.id}" value={option} bind:group={field.color} />
                            {option}
                          </label>
                        </ListgroupItem>
                      {/each}
                    </Listgroup>
                  </AccordionItem>
                  <AccordionItem>
                    <span slot="header">Tissue Tone</span>
                    <Listgroup>
                      {#each tissueToneItems as option}
                        <ListgroupItem>
                          <label class="flex items-center gap-2">
                            <input type="radio" name="tissueTone-{field.id}" value={option} bind:group={field.tissueTone} />
                            {option}
                          </label>
                        </ListgroupItem>
                      {/each}
                    </Listgroup>
                  </AccordionItem>
                   <AccordionItem>
  <span slot="header">Sensitivity</span>
  <Listgroup>
    {#each ['Normal', 'Tender', 'Sensitive', 'Very Sensitive'] as option}
      <ListgroupItem>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="sensitivity-{field.id}"
            value={option}
            bind:group={field.sensitivity}
          />
          {option}
        </label>
      </ListgroupItem>
    {/each}
  </Listgroup>
</AccordionItem>
                </Accordion>
               

    
                <button type="button" on:click={() => removeField(index)} class="bg-red-500 text-white px-2 py-1 rounded mt-2">
                  ✕ Remove
                </button>
              </div>
            {/each}
    
            <Button on:click={addCongestionAreas} class="bg-blue-500 text-white px-4 py-2 rounded">
              Add Congestion Area
            </Button>
          </div>
        </SectionHeader>

        <SectionHeader id="action" title="Action">
          <div class="mb-6">
            <Label for="areasOfEmphasis">Areas of Emphasis</Label>
            <Textarea id="areasOfEmphasis" bind:value={formData.areasOfEmphasis} rows={4} />
          </div>
          <div class="mb-6">
            <Label for="clientResponse">Client Response</Label>
            <Textarea id="clientResponse" bind:value={formData.clientResponse} rows={4} />
          </div>
        </SectionHeader>

        <SectionHeader id="plan" title="Plan">
          <div class="mb-6">
            <Label for="recommendations">Recommendations</Label>
            <Textarea id="recommendations" bind:value={formData.recommendations} rows={4} />
          </div>
          <div class="mb-6">
            <Label for="homeCare">Home Care</Label>
            <Textarea id="homeCare" bind:value={formData.homeCare} rows={4} />
          </div>
          <div class="mb-6">
            <Label for="followUp">Follow-up</Label>
            <Input id="followUp" bind:value={formData.followUp} />
          </div>
        </SectionHeader>
    
        <div class="mt-6">
          <Button 
            on:click={generate}
            disabled={isUploading}
            class="relative"
          >
            {#if isUploading}
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
              <span class="opacity-0">Generate & Save SOAP Note</span>
            {:else}
              Generate & Save SOAP Note
            {/if}
          </Button>
        </div>
      </form>

      <!-- Generated note display -->
      {#if note}
        <NoteDisplay 
          {note} 
          {isUploading}
          onCopy={() => copyToClipboard(note)}
        />
        {#if uploadError}
          <p class="text-red-500 mt-2">{uploadError}</p>
        {/if}
      {/if}

     <SectionHeader id="saved-notes" title="Existing Notes">
  {#if Object.keys(savedNotes).length > 0}
    <div class="space-y-8">
      {#each Object.entries(savedNotes) as [clientName, notes]}
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
            {clientName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </h2>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each notes as note}
              <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-medium truncate flex-1">
                    {new Date(note.fileName.split('_')[0]).toLocaleDateString()}
                  </h3>
                  <a 
                    href={note.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="ml-2 inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded"
                  >
                    📄 View
                  </a>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-gray-500">No saved notes yet</p>
  {/if}
</SectionHeader>

    {/if}

    {#if toast}
      <Toast 
        message={toast.message} 
        type={toast.type}
        on:close={() => toast = null}
      />
    {/if}
  </main>

  <style>
    :global(html) {
      scroll-behavior: smooth;
      scroll-padding-top: 100px;
    }
  </style>
