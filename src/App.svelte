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
  
    import { onMount } from 'svelte';
    import Navbar from './Navbar.svelte';
  
    let user = null;
  
    onMount(async () => {
      const res = await fetch('http://localhost:3000/api/user', {
        credentials: 'include'
      });
      if (res.ok) {
        user = await res.json();
      }
    });
  
    function loginWithGoogle() {
      window.location.href = 'http://localhost:3000/auth/google';
    }
  
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
    let anatomicalAreaItems = ['Proximal hallux, bilat (cervical)', '1st Metatarsal, bilateral (thoracic)', '1st Cuneiform to calcaneus, bilateral (lumbar)', 'Medial edge of posterior calcaneus, bilateral (sacral and coccyx)', 'Interphalangeal jt of hallux, bilat (jaw)', 'MTP #1-5, bilat (collarbone)', 'MTP #5, bilat (shoulder)', 'Lat. MTP to tuberosity of 5th metat., bilat. (arm)', 'Lat. tuberosity of 5th metat., bilat. (knee/elbow)', 'Lat. tuberosity of 5th metat to calcaneofibular jt., bilat (knee/leg/hip)', 'Lat. post. calcaneofibular jt., bilat (pelvis/hip)', 'Distal phalanges #1-5, bilat (brain)', 'Med. aspect from 1st prox. phalanx to post. calcaneus, bilat. (spinal cord)'];
    let temperatureItems = ['Normal temperature', 'Cool to touch', 'Hot to touch'];
    let hydrationItems = ['Normal hydration', 'Dryness', 'Damp or clammy tissue', 'Sweatyness', 'Profusely sweatyness', 'Boggyness', 'Congestion', 'Sponginess'];
    let colorItems = ['Normal color', 'Paleness', 'Redness (erythematous)', 'Blotchy'];
    let tissueToneItems = ['Normal tissue tone', 'Resistant tissue tone', 'Firm tissue tone', 'Stringy/ropy tissue tone', 'Contracted tissue tone', 'Relaxed tissue tone', 'Flaccid tissue tone', 'Nodular tissue tone'];
  
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
  
      let soapNote = `SOAP Note\n\nClient Name: ${clientName}\nDate: ${date}\nReflexologist: ${reflexologist}\n\n`;
      soapNote += `Subjective:\n`;
      soapNote += chiefComplaint ? `Chief Complaint: ${chiefComplaint}\n` : '';
      soapNote += healthHistory ? `Health History: ${healthHistory}\n\n` : '\n';
      soapNote += `Objective:\n`;
      soapNote += observation ? `Observation: ${observation}\n\n` : '\n';
  
      for (let i = 0; i < congAreas.length; i++) {
        soapNote += `Congestion Area ${i + 1}:\n`;
        if (congAreas[i].foot) soapNote += `Foot: ${congAreas[i].foot}\n`;
        if (congAreas[i].anatomicalArea) soapNote += `Anatomical Area: ${congAreas[i].anatomicalArea}\n`;
        if (congAreas[i].temperature && congAreas[i].temperature !== 'Normal temperature') soapNote += `Temperature: ${congAreas[i].temperature}\n`;
        if (congAreas[i].hydration && congAreas[i].hydration !== 'Normal hydration') soapNote += `Hydration: ${congAreas[i].hydration}\n`;
        if (congAreas[i].color && congAreas[i].color !== 'Normal color') soapNote += `Color: ${congAreas[i].color}\n`;
        if (congAreas[i].tissueTone && congAreas[i].tissueTone !== 'Normal tissue tone') soapNote += `Tissue Tone: ${congAreas[i].tissueTone}\n`;
        soapNote += '\n';
      }
  
      soapNote += `Assessment:\n`;
      soapNote += sessionType ? `Type of Session: ${sessionType}\n` : '';
      soapNote += areasOfEmphasis ? `Areas of Emphasis: ${areasOfEmphasis}\n` : '';
      soapNote += clientResponse ? `Client Response: ${clientResponse}\n\n` : '\n';
  
      soapNote += `Plan:\n`;
      soapNote += recommendations ? `Recommendations: ${recommendations}\n` : '';
      soapNote += homeCare ? `Home Care: ${homeCare}\n` : '';
      soapNote += followUp ? `Follow-up: ${followUp}\n\n` : '\n';
  
      soapNote += `Reflexologist Signature: ${reflexologist}\nDate: ${date}`;
  
      await navigator.clipboard.writeText(soapNote);
      alert("SOAP note copied to clipboard! ✅");
    }
  </script>
  
  <Navbar />
  
  <main class="pt-[100px]">
    {#if user}
      <p class="p-4 text-green-700 font-semibold">Welcome, {user.displayName}</p>
    {:else}
      <div class="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p class="mb-2">You are not logged in.</p>
        <Button on:click={loginWithGoogle}>Login with Google</Button>
      </div>
    {/if}
  
    <!-- Always show form -->
    <form on:submit|preventDefault={generate}>
      <!-- Subjective -->
      <h1 id="subjective">Subjective</h1>
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <Label for="clientName">Client Name</Label>
          <Input id="clientName" required />
        </div>
        <div>
          <Label for="date">Date</Label>
          <Input type="date" id="date" required />
        </div>
        <div>
          <Label for="reflexologist">Reflexologist</Label>
          <Input id="reflexologist" required />
        </div>
        <div>
          <Label for="sessionType">Type of Session</Label>
          <Input id="sessionType" placeholder="i.e., 60-minute reflexology session." required />
        </div>
      </div>
  
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <Label for="chiefComplaint">Chief Complaint/Reason for Visit</Label>
          <Textarea id="chiefComplaint" rows="8" />
        </div>
        <div>
          <Label for="healthHistory">Health History</Label>
          <Textarea id="healthHistory" rows="8" />
        </div>
      </div>
  
      <!-- Objective -->
      <h1 id="objective">Objective</h1>
      <div class="mb-6">
        <Label for="observation">Observation</Label>
        <Textarea id="observation" rows="4" />
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
              <!-- Repeat similar AccordionItem blocks for other categories... -->
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
  
      <!-- Assessment & Plan -->
      <h1 id="assessment">Assessment</h1>
      <div class="mb-6">
        <Label for="areasOfEmphasis">Areas of Emphasis</Label>
        <Textarea id="areasOfEmphasis" rows="4" />
      </div>
      <div class="mb-6">
        <Label for="clientResponse">Client Response</Label>
        <Textarea id="clientResponse" rows="4" />
      </div>
  
      <h1 id="plan">Plan</h1>
      <div class="mb-6">
        <Label for="recommendations">Recommendations</Label>
        <Textarea id="recommendations" rows="4" />
      </div>
      <div class="mb-6">
        <Label for="homeCare">Home Care</Label>
        <Textarea id="homeCare" rows="4" />
      </div>
      <div class="mb-6">
        <Label for="followUp">Follow-up</Label>
        <Input id="followUp" />
      </div>
  
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Submit
      </button>
    </form>
  </main>
  