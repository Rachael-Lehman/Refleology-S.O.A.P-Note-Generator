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
    Textarea,
  } from "flowbite-svelte";
  import Toast from "./lib/Toast.svelte";
  import NoteDisplay from "./lib/NoteDisplay.svelte";
  import SectionHeader from "./lib/SectionHeader.svelte";
  import { onMount, tick } from "svelte";
  import Navbar from "./Navbar.svelte";

  let user = null;
  let clientList = null;
  let isLoading = true;
  let authError = null;
  let note = "";
  let savedNotesOndisplay = [];
  let savedClientOndisplay;
  let isUploading = false;
  let uploadError = null;
  let toast = null;
  let editingKey = null;
  let editedContent = "";
  let googleDocsEnabled = false;

  let formData = {
    clientFirstName: "",
    clientLastName: "",
    clientDOB: "",
    date: "",
    reflexologist: "",
    chiefComplaint: "",
    healthHistory: "",
    observation: "",
    sessionType: "",
    areasOfEmphasis: "",
    clientResponse: "",
    recommendations: "",
    homeCare: "",
    followUp: "",
  };

  let congAreas = [
    {
      id: 1,
      anatomicalArea: null,
      temperature: null,
      hydration: null,
      color: null,
      tissueTone: null,
      tissueFindings: null,
      sensitivity: 0,
      anatomicalAreaValidator: undefined,
    },
  ];

  let temperatureItems = [
    "Normal temperature",
    "Cool to touch",
    "Hot to touch",
  ];
  let hydrationItems = [
    "Normal hydration",
    "Dryness",
    "Damp or clammy tissue",
    "Sweatyness",
    "Profusely sweatyness",
    "Boggyness",
    "Congestion",
    "Sponginess",
  ];
  let colorItems = [
    "Normal color",
    "Paleness",
    "Redness (erythematous)",
    "Blotchy",
  ];
  let tissueToneItems = [
    "Normal tissue tone",
    "Resistant tissue tone",
    "Firm tissue tone",
    "Stringy/ropy tissue tone",
    "Contracted tissue tone",
    "Relaxed tissue tone",
    "Flaccid tissue tone",
    "Nodular tissue tone",
  ];
  let TissueFindings = [
    "Calluses",
    "Puffiness",
    "Unusual color or rashes",
    "Scar tissue",
    "Current injury or bruises",
    "Wort",
  ];
  let anatomicalAreasBySystem = {
    // All Parentheses will be removed from the text on file creation
    Musculoskeletal: [
      "Proximal hallux, bilat (Cervical)",
      "1st Metatarsal, bilat (Thoracic)",
      "1st Cuneiform to calcaneus, bilat (Lumbar)",
      "Medial edge of posterior calcaneus, bilat (Sacral and Coccyx)",
      "Interphalangeal joint of hallux, bilat (Jaw)",
      "MTP #1-5, bilat (Collarbone)",
      "MTP #5, bilat (Shoulder)",
      "Lateral MTP to tuberosity of 5th metatarsal, bilat (Arm)",
      "Lateral tuberosity of 5th metatarsal, bilat (Knee/Elbow)",
      "Lateral tuberosity of 5th metatarsal to calcaneofibular joint, bilat (Knee/Leg/Hip)",
      "Lateral posterior calcaneofibular joint, bilat (Pelvis/Hip)",
    ],
    Nervous: [
      "Distal phalanges #1-5, bilat (Brain)",
      "Plantar aspect distal phalanges #1-5, bilat (Brain)",
      "Medial aspect from 1st proximal phalanx to posterior calcaneus, bilat (Spinal Cord)",
      "Medial edge 1st proximal phalanx, bilat (Cervical)",
      "Medial edge 1st metatarsal, bilat (Thoracic)",
      "Medial edge metatarsocuneiform joint to talonavicular joint, bilat (Lumbar)",
      "Medial edge of medial cuneiform to navicular, bilat (Lumbar)",
      "Medial edge talonavicular joint to posterior calcaneus, bilat (Sacrum & Coccyx)",
      "Plantar aspect proximal edge of medial sesamoid on 1st metatarsal, bilat (Vagus nerve)",
      "Lateral edge of interphalangeal joint of hallux, bilat (Phrenic nerve)",
    ],
    Endocrine: [
      "Plantar surface of intermediate distal hallux, bilat (Pituitary & Hypothalamus)",
      "Medial edge of distal hallux, bilat (Pineal)",
      "Medial edge of proximal hallux, bilat (Thyroid)",
      "Medial aspect of MTP joint, bilat (Thymus)",
      "Medial edge of head of 1st metatarsal, bilat (Thymus)",
      "Plantar surface of lateral base of 1st metatarsal, bilat (Adrenal)",
      "Plantar aspect of lateral edge of 1st metatarsocuneiform joint, bilat (Adrenal)",
    ],
    Reproductive: [
      "Medial aspect of posterior calcaneus, bilat (Uterus/Prostate)",
      "Medial aspect of posterior process of talus, medial tubercle, bilat (Uterus/Prostate)",
      "Lateral aspect of posterior process of talus, lateral tubercle, bilat (Ovary/Testis)",
      "Aspect of posterior calcaneus, bilat (Ovary/Testis)",
      "Lateral aspect of posterior calcaneus to dorsal talocalcaneonavicular joint to medial posterior calcaneus, bilat (Ova duct / Sperm duct)",
    ],
    Respiratory: [
      "Medial edge to plantar aspect of interphalangeal joint of hallux, bilat (Nose)",
      "Plantar surface of medial base of distal hallux, bilat (Nose)",
      "Plantar aspect of distal and middle phalanges #2-5, bilat (Sinuses)",
      "Plantar surface of MTP joints #2-5, bilat (Lungs)",
      "Plantar aspect of proximal base of phalanges #2-5 to distal head of metatarsals #2-5, bilat (Lungs)",
      "Plantar surface distal to MTP joints #1-5, bilat (Diaphragm - Paula Stone)",
      "Plantar aspect of intermediate metatarsal #1 transverse to metatarsal #4 to medial edge of metatarsal #5 tuberosity, bilat (Diaphragm - Touchpoint)",
      "Plantar surface from distal head of metatarsal #1 transverse to tuberosity of 5th metatarsal, bilat (Diaphragm - Anatomical)",
    ],
    Cardiovascular: [
      "Plantar aspect of 1st MTP joint R foot; #1-3 MTP joints L foot (Heart)",
      "Lateral edge of proximal hallux, bilat (Carotid Artery)",
    ],
    Immune_Lymphatic: [
      "Lateral aspect of distal hallux, bilat (Tonsils)",
      "Medial aspect of MTP joint, bilat (Thymus)",
      "Medial edge of head of 1st metatarsal, bilat (Thymus)",
      "Plantar surface of the base of 4th-5th metatarsals, L foot (Spleen)",
    ],
    Digestive: [
      "Plantar aspect of metatarsals #5-1 R foot; metatarsal #1 L foot (Liver)",
      "Plantar aspect of metatarsal #4, R foot (Gall Bladder)",
      "Medial edge to plantar aspect of interphalangeal joint of hallux, bilat (Mouth)",
      "Medial edge of proximal hallux to proximal aspect of MTP joint, bilat (Esophagus)",
      "Medial edge of proximal hallux to medial sesamoid bone on 1st metatarsal, bilat (Esophagus)",
      "Plantar aspect from lateral edge of metatarsal #1 to lateral edge of metatarsal #4, L foot (Stomach)",
      "Plantar surface from medial edge of metatarsal #1 to medial edge of metatarsal #2, R foot (Duodenum)",
      "Plantar surface from distal cuneiforms & cuboid to distal calcaneus, bilat (Small Intestines)",
      "Plantar aspect of lateral intermediate cuboid, R foot (Ileocecal Valve)",
      "Plantar surface of R foot from lateral distal calcaneus to proximal 5th metatarsal (Ascending Colon)",
      "Plantar aspect from lateral edge of cuboid across cuneonavicular joint, bilat (Transverse Colon)",
      "Plantar aspect from cuboid-5th metatarsal R foot to proximal medial 5th metatarsal L foot (Transverse Colon)",
      "Plantar surface of L lateral edge of cuboid and distal portion of calcaneus (Descending Colon)",
      "Plantar surface from proximal medial 5th metatarsal L foot to intermediate calcaneus medial talus (D-Colon + Sigmoid)",
      "Plantar surface of intermediate calcaneus, L foot (Sigmoid Colon)",
      "Medial aspect of distal calcaneus to posterior calcaneus, bilat (Rectum)",
      "Medial aspect of calcaneotalar joint to posterior calcaneus, bilat (Rectum)",
      "Plantar surface of 1st metatarsocuneiform joint R foot to 4th metatarsocuneiform joint L foot (Pancreas)",
    ],
    Urinary: [
      "Plantar surface of 2nd metatarsal intermediate cuneiform & 3rd metatarsal lateral cuneiform, bilat (Kidneys)",
      "Plantar aspect of 2nd-3rd metatarsocuneiform joint, bilat (Kidneys)",
      "Plantar aspect from lateral medial cuneiform to medial distal calcaneus, bilat (Ureters)",
      "Plantar aspect of 2nd cuneiform and mid navicular, bilat (Ureters)",
      "Medial aspect of talonavicular joint, bilat (Bladder)",
      "Medial aspect of sustentaculum tali, bilat (Bladder)",
    ],
    Foot: ["Right foot", "Left foot", "Bilateral"],
  };

  // Add smooth scrolling behavior
  onMount(() => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const element = document.querySelector(this.getAttribute("href"));
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  });

  onMount(async () => {
    try {
      const API_URL = "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/user`, {
        credentials: "include",
      });

      if (res.ok) {
        user = await res.json();
        console.log("User logged in:", user);
        // Only fetch notes if user is logged in
        if (user) {
          await fetchClients();
        }
      } else {
        console.error("Failed to fetch user:", await res.text());
        authError = "Failed to fetch user information";
      }
    } catch (err) {
      console.error("Auth error:", err);
      authError = "Error connecting to server";
    } finally {
      isLoading = false;
    }
  });

  function loginWithGoogle() {
    const API_URL = "http://localhost:3000";
    window.location.href = `${API_URL}/auth/google`;
  }

  function addCongestionAreas() {
    congAreas = [
      ...congAreas,
      {
        id: congAreas.length + 1,
        anatomicalArea: null,
        temperature: null,
        hydration: null,
        color: null,
        tissueTone: null,
        tissueFindings: null,
        sensitivity: 0,
        anatomicalAreaValidator: undefined,
      },
    ];
    console.log(congAreas.length);
  }

  function removeField(index) {
    if (congAreas.length > 1) {
      congAreas = congAreas.filter((_, i) => i !== index);
    } else {
      // add "cant remove" message
    }
  }

  async function uploadNote() {
    if (note) {
      let noteContent = note;
      isUploading = true;
      uploadError = null;
      toast = { message: "Uploading SOAP note...", type: "info" };

      try {
        console.log("Attempting to upload note:", noteContent);
        const API_URL = "http://localhost:3000";
        const response = await fetch(`${API_URL}/upload-note`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", //,
            //  Authorization: `Bearer ${user.token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            note: noteContent,
            clientData: {
              firstName: formData.clientFirstName,
              lastName: formData.clientLastName,
              dob: formData.clientDOB,
            },
            date: formData.date,
            googleDocsEnabled,
          }),
        });

        const result = await response.json();
        if (result.success) {
          let message = `Note uploaded successfully!`;
          congAreas = [
            {
              id: 1,
              anatomicalArea: null,
              temperature: null,
              hydration: null,
              color: null,
              tissueTone: null,
              tissueFindings: null,
              sensitivity: 0,
              anatomicalAreaValidator: undefined,
            },
          ];
          formData = {
            clientFirstName: "",
            clientLastName: "",
            clientDOB: "",
            date: "",
            reflexologist: "",
            chiefComplaint: "",
            healthHistory: "",
            observation: "",
            sessionType: "",
            areasOfEmphasis: "",
            clientResponse: "",
            recommendations: "",
            homeCare: "",
            followUp: "",
          };
          /*
          if (result.uploadGoogleDoc)
            message += `\nNote Downloaded successfully!`;
          else {
            message +=
              result.uploadGoogleDoc === googleDocsEnabled
                ? ``
                : `\nNote Failed to Download!`;
          }
                */
          toast = { message, type: "success" };
          await fetchClients();
        } else {
          const errorText = await response.text();
          console.error("Upload failed:", errorText);
          throw new Error(`Upload failed: ${errorText}`);
        }
        if (googleDocsEnabled)
          await downloadPdf(
            noteContent,
            formData.clientFirstName,
            formData.clientLastName,
            formData.date,
          );
      } catch (err) {
        console.error("Upload error:", err);
        uploadError = `Failed to upload note`;
        toast = { message: uploadError, type: "error" };
      } finally {
        isUploading = false;
      }
    }
  }

  async function fetchClients() {
    try {
      const API_URL = "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/clients`, {
        credentials: "include",
      });
      if (res.ok) {
        console.log("Fetched clients:");
        clientList = await res.json();
        console.log(clientList);
      } else {
        console.error("Failed to fetch clients:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  }

  async function handleClientClick(clientKey) {
    try {
      const API_URL = "http://localhost:3000";
      const res = await fetch(
        `${API_URL}/api/notes?clientKey=${encodeURIComponent(clientKey)}`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        console.log("Fetched notes:");
        const notesAndClient = await res.json();

        if (notesAndClient.files?.length > 0) {
          savedNotesOndisplay = notesAndClient.files;
        }

        if (notesAndClient.clientInfo) {
          savedClientOndisplay = notesAndClient.clientInfo;
          console.log("✅ Client info found:", savedClientOndisplay);
        } else {
          console.warn("⚠ No client info found.");
        }

        // Wait for Svelte to finish rendering
        await tick();

        const savedNotesSection = document.getElementById("saved-notes");
        if (savedNotesSection) {
          savedNotesSection.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        console.error("Failed to fetch clients:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  }

  async function generate(event) {
    let soapNote = `SOAP Note\n\nClient Name: ${formData.clientFirstName} ${formData.clientLastName} DOB: ${formData.clientDOB}\nDate: ${formData.date}\nReflexologist: ${formData.reflexologist}\n\n`;
    soapNote += `Subjective:\n• Chief Complaint: `;
    soapNote += formData.chiefComplaint
      ? `${formData.chiefComplaint}\n`
      : "N/A\n";
    soapNote += `• Health History: `;
    soapNote += formData.healthHistory
      ? `${formData.healthHistory}\n\n`
      : "N/A\n\n";
    soapNote += `Objective:\n• Observation: `;
    soapNote += formData.observation ? `${formData.observation}\n` : "N/A\n";
    soapNote += `• Areas of Congestion: \n`;

    for (let i = 0; i < congAreas.length; i++) {
      let formatedAnatomicalArea =
        congAreas[i]?.anatomicalArea?.replace(/\s*\(.*?\)/g, "") || "";
      if (formatedAnatomicalArea) {
        soapNote += `\t• ${formatedAnatomicalArea}, `;

        if (congAreas[i].temperature)
          soapNote += `${congAreas[i].temperature}, `;
        if (congAreas[i].hydration) soapNote += `${congAreas[i].hydration}, `;
        if (congAreas[i].color) soapNote += `${congAreas[i].color}, `;
        if (congAreas[i].tissueTone) soapNote += `${congAreas[i].tissueTone}, `;
        if (congAreas[i].tissueFindings)
          soapNote += `${congAreas[i].tissueFindings}, `;
        soapNote += `sensitivity was reported as a "${congAreas[i]?.sensitivity}"\n`;
      }
    }

    soapNote += `\n\nAction:\n• Type of Session: `;
    soapNote += formData.sessionType ? `${formData.sessionType}\n` : "N/A\n";
    soapNote += `• Areas of Emphasis: `;
    soapNote += formData.areasOfEmphasis
      ? `${formData.areasOfEmphasis}\n`
      : "N/A\n";
    soapNote += `• Client Response: `;
    soapNote += formData.clientResponse
      ? `${formData.clientResponse}\n\n`
      : "N/A\n\n";

    soapNote += `Plan:\n• Recommendations: `;
    soapNote += formData.recommendations
      ? `${formData.recommendations}\n`
      : "N/A\n";
    soapNote += `• Home Care: `;
    soapNote += formData.homeCare ? `${formData.homeCare}\n` : "N/A\n";
    soapNote += `• Follow-up: `;
    soapNote += formData.followUp ? `${formData.followUp}\n\n` : "N/A\n\n";

    soapNote += `Reflexologist Signature: ${formData.reflexologist}\nDate: ${formData.date}`;

    // After generating the note, also save it
    note = soapNote;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast = { message: "Note copied to clipboard!", type: "success" };
    } catch (err) {
      console.error("Failed to copy:", err);
      toast = { message: "Failed to copy to clipboard", type: "error" };
    }
  }

  function startEdit(note) {
    editingKey = note.key;
    editedContent = note.content;
  }
  function cancelEdit() {
    editingKey = null;
    editedContent = "";
  }
  async function saveEdit(key, first, last, date) {
    console.log("Saving", key, "with new content:", editedContent);
    if (key && editedContent) {
      try {
        const API_URL = "http://localhost:3000";
        const res = await fetch(`${API_URL}/api/update_note`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            s3Key: key,
            content: editedContent,
            googleDocsEnabled,
          }),
        });
        const result = await res.json();
        if (result.success) {
          let message = `Note updated successfully!`;
          /*                                                
          if (result.uploadGoogleDoc)
            message += `\nNote Downloaded successfully!`;
          else {
            message +=
              result.uploadGoogleDoc === googleDocsEnabled
                ? ``
                : `\nNote Failed to Download!`;
          }
                */
          savedNotesOndisplay = savedNotesOndisplay.map((n) =>
            n.key === key ? { ...n, content: editedContent } : n,
          );
          toast = { message, type: "success" };
        } else {
          toast = { message: "Failed to updated note:", type: "error" };
        }
        if (googleDocsEnabled)
          await downloadPdf(editedContent, first, last, date);
        editingKey = null;
        editedContent = "";
      } catch (err) {
        console.error("Error fetching clients:", err);
        toast = { message: "Failed to updated note:", type: "error" };
      }
    } else {
      toast = {
        message: "Failed to updated note. Missing credentials:",
        type: "error",
      };
    }
  }

  async function downloadPdf(noteText, firstName, lastName, dateStr) {
    try {
      if (noteText && firstName && lastName && dateStr) {
        dateStr = dateStr.replace(/[/\\]/g, "-");
        const response = await fetch("http://localhost:3000/api/generate_pdf", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: noteText }),
        });

        if (!response.ok) {
          console.error("Error generating PDF");
          toast = { message: "Error generating PDF", type: "error" };
          return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${firstName}_${lastName}_${dateStr}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast = { message: "PDF Generated!", type: "success" };
      } else {
        toast = {
          message: "Error generating PDF: Missing File Info",
          type: "error",
        };
      }
    } catch (err) {
      toast = {
        message: "Error generating PDF:",
        type: "error",
      };
      uploadError = `Error generating PDF:`;
      console.error(err);
    }
  }
</script>

<Navbar />

<main class="pt-[100px] container mx-auto px-4">
  {#if isLoading}
    <div class="flex justify-center items-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
      ></div>
    </div>
  {:else if authError}
    <div class="p-4 bg-red-100 border border-red-300 rounded">
      <p class="text-red-700">{authError}</p>
      <Button on:click={loginWithGoogle} class="mt-2">Try Login Again</Button>
    </div>
  {:else if !user}
    <div class="flex justify-center items-center h-[60vh]">
      <div
        class="max-w-md text-center bg-yellow-50 border border-yellow-200 shadow-md rounded-2xl px-6 py-8"
      >
        <h2 class="text-xl font-semibold text-yellow-800 mb-4">
          You're not logged in
        </h2>
        <p class="text-sm text-yellow-700 mb-6">
          Please log in with your Google account to access your dashboard and
          saved content.
        </p>
        <Button
          on:click={loginWithGoogle}
          class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded"
        >
          Login with Google
        </Button>
      </div>
    </div>
  {:else}
    <!-- Form content -->
    <form on:submit|preventDefault={generate} class="mb-8">
      <SectionHeader id="subjective" title="Subjective">
        <div class="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <Label for="clientfirstName">Client First Name</Label>
            <Input
              id="clientfirstName"
              bind:value={formData.clientFirstName}
              required
            />
          </div>
          <div>
            <Label for="clientlastName">Client Last Name</Label>
            <Input
              id="clientlastName"
              bind:value={formData.clientLastName}
              required
            />
          </div>
          <div>
            <Label for="clientDOB">Client DOB</Label>
            <Input
              type="date"
              id="clientDOB"
              bind:value={formData.clientDOB}
              required
            />
          </div>
          <div>
            <Label for="date">Date</Label>
            <Input type="date" id="date" bind:value={formData.date} required />
          </div>
          <div>
            <Label for="reflexologist">Reflexologist</Label>
            <Input
              id="reflexologist"
              bind:value={formData.reflexologist}
              required
            />
          </div>
          <div>
            <Label for="sessionType">Type of Session</Label>
            <Input
              id="sessionType"
              bind:value={formData.sessionType}
              placeholder="i.e., 60-minute reflexology session."
              required
            />
          </div>
        </div>

        <div class="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <Label for="chiefComplaint">Chief Complaint/Reason for Visit</Label>
            <Textarea
              id="chiefComplaint"
              bind:value={formData.chiefComplaint}
              rows={8}
            />
          </div>
          <div>
            <Label for="healthHistory">Health History</Label>
            <Textarea
              id="healthHistory"
              bind:value={formData.healthHistory}
              rows={8}
            />
          </div>
        </div>
      </SectionHeader>

      <SectionHeader id="objective" title="Objective">
        <div class="mb-6">
          <Label for="observation">Observation</Label>
          <Textarea
            id="observation"
            bind:value={formData.observation}
            rows={4}
          />
        </div>

        <!-- Congestion Areas -->
        <h1 id="congestionAreas">Areas of Congestion and Sensitivity</h1>
        <div>
          {#each congAreas as field, index}
            <input
              type="text"
              class="sr-only"
              required
              bind:this={field.anatomicalAreaValidator}
              value={field.anatomicalArea || ""}
            />
            <div class="border p-3 rounded mb-4">
              <Accordion flush>
                <AccordionItem>
                  <span slot="header">
                    Anatomical Area
                    <span class="text-red-500 ml-1" aria-hidden="true">*</span>
                  </span>
                  <!-- custom required field for anatomical Area -->
                  <Accordion class="w-[95%] mx-auto">
                    {#each Object.entries(anatomicalAreasBySystem) as [system, options]}
                      <AccordionItem>
                        <span slot="header">{system}</span>
                        <!--   {#if !selectedSystemByField[field.id] || selectedSystemByField[field.id] === system}    this line is makeing a bug, cant change to a different system after clicking one -->
                        <Listgroup>
                          {#each options as option}
                            <ListgroupItem>
                              <label class="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="anatomicalArea-{field.id}"
                                  value={option}
                                  bind:group={field.anatomicalArea}
                                />
                                <!-- Removed on:change={() => selectedSystemByField[field.id] = system} intentionally -->
                                {option}
                              </label>
                            </ListgroupItem>
                          {/each}
                        </Listgroup>
                        <!-- {/if} -->
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
                          <input
                            type="radio"
                            name="temperature-{field.id}"
                            value={option}
                            bind:group={field.temperature}
                          />
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
                          <input
                            type="radio"
                            name="hydration-{field.id}"
                            value={option}
                            bind:group={field.hydration}
                          />
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
                          <input
                            type="radio"
                            name="color-{field.id}"
                            value={option}
                            bind:group={field.color}
                          />
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
                          <input
                            type="radio"
                            name="tissueTone-{field.id}"
                            value={option}
                            bind:group={field.tissueTone}
                          />
                          {option}
                        </label>
                      </ListgroupItem>
                    {/each}
                  </Listgroup>
                </AccordionItem>
                <AccordionItem>
                  <span slot="header">Tissue Findings</span>
                  <Listgroup>
                    {#each TissueFindings as option}
                      <ListgroupItem>
                        <label class="flex items-center gap-2">
                          <input
                            type="radio"
                            name="tissueFindings-{field.id}"
                            value={option}
                            bind:group={field.tissueFindings}
                          />
                          {option}
                        </label>
                      </ListgroupItem>
                    {/each}
                  </Listgroup>
                </AccordionItem>
                <AccordionItem>
                  <span slot="header">Sensitivity</span>
                  <div class="flex flex-col gap-2 p-2">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      name="sensitivity-{field.id}"
                      bind:value={field.sensitivity}
                      class="w-full"
                    />
                    <div class="flex justify-between text-sm text-gray-700">
                      <span>0</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
              <button
                type="button"
                on:click={() => removeField(index)}
                class="bg-red-500 text-white px-2 py-1 rounded mt-2"
              >
                ✕ Remove
              </button>
            </div>
          {/each}

          <Button
            on:click={addCongestionAreas}
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Congestion Area
          </Button>
        </div>
      </SectionHeader>

      <SectionHeader id="action" title="Action">
        <div class="mb-6">
          <Label for="areasOfEmphasis">Areas of Emphasis</Label>
          <Textarea
            id="areasOfEmphasis"
            bind:value={formData.areasOfEmphasis}
            rows={4}
          />
        </div>
        <div class="mb-6">
          <Label for="clientResponse">Client Response</Label>
          <Textarea
            id="clientResponse"
            bind:value={formData.clientResponse}
            rows={4}
          />
        </div>
      </SectionHeader>

      <SectionHeader id="plan" title="Plan">
        <div class="mb-6">
          <Label for="recommendations">Recommendations</Label>
          <Textarea
            id="recommendations"
            bind:value={formData.recommendations}
            rows={4}
          />
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
        <!--redundant on:click={generate}, the form already submits to generate plus on click skips over the forms required fields -->
        <!-- Removed on:click from button intentionally -->
        <Button type="submit" disabled={isUploading} class="relative">
          {#if isUploading}
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
              ></div>
            </div>
            <span class="opacity-0"> Render SOAP Note</span>
          {:else}
            Render SOAP Note
          {/if}
        </Button>
      </div>
    </form>

    <!-- Generated note display -->
    {#if note}
      <NoteDisplay
        bind:note
        bind:googleDocsEnabled
        {isUploading}
        onCopy={() => copyToClipboard(note)}
        upload={async () => await uploadNote()}
      />
      {#if uploadError}
        <p class="text-red-500 mt-2">{uploadError}</p>
      {/if}
    {/if}

    <SectionHeader id="clients-listed" title="Client List">
      {#if clientList && clientList.length > 0}
        <div class="flex flex-col space-y-2">
          {#each clientList as client}
            <button
              type="button"
              class="w-full text-left bg-blue-50 text-black font-medium rounded-md py-2 px-4 shadow-sm hover:bg-blue-100 transition-colors duration-200"
              on:click={() => handleClientClick(client.clientKey)}
              style="min-height: 2.5rem;"
            >
              <div class="text-base leading-tight">
                {client.firstName}
                {client.lastName}
              </div>
              <div class="text-xs text-gray-700 opacity-75 mt-0.5">
                DOB: {new Date(client.dob).toLocaleDateString()}
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No saved clients</p>
      {/if}
    </SectionHeader>

    <SectionHeader id="saved-notes" title="Saved Notes">
      {#if savedClientOndisplay}
        <div class="mb-4 text-center">
          <div class="text-xl font-bold text-gray-800">
            {savedClientOndisplay.firstName}
            {savedClientOndisplay.lastName}
          </div>
          <div class="text-md text-gray-600">
            DOB: {savedClientOndisplay.dob}
          </div>
        </div>
      {/if}

      {#if savedNotesOndisplay && savedNotesOndisplay.length > 0}
        <div class="flex flex-col space-y-3">
          {#each savedNotesOndisplay as note (note.key)}
            <div
              class="w-full bg-white text-black font-medium rounded-md p-4 shadow-sm border border-gray-200 hover:shadow-md transition duration-200"
            >
              <div class="flex justify-between items-center mb-2">
                <div class="text-sm text-gray-600">
                  Date: {note.date}
                </div>

                {#if editingKey === note.key}
                  <div
                    class="flex items-center bg-gray-100 rounded-lg p-3 space-x-4 shadow-md"
                  >
                    <button
                      class="text-sm font-semibold text-green-700 hover:text-green-900 hover:underline transition duration-150"
                      on:click={() => {
                        const currentDate = new Date()
                          .toISOString()
                          .split("T")[0];
                        saveEdit(
                          note.key,
                          savedClientOndisplay.firstName,
                          savedClientOndisplay.lastName,
                          currentDate,
                        );
                      }}
                    >
                      Save
                    </button>

                    <div class="flex flex-col items-center">
                      <div class="text-xs text-gray-700 mb-1">Download PDF</div>
                      <label class="switch">
                        <input
                          type="checkbox"
                          bind:checked={googleDocsEnabled}
                        />
                        <span class="slider"></span>
                      </label>
                    </div>
                  </div>
                  <button
                    class="text-sm font-semibold text-gray-500 ml-2"
                    on:click={() => cancelEdit()}
                  >
                    Cancel
                  </button>
                {:else}
                  <button
                    class="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline transition duration-150"
                    on:click={() => startEdit(note)}
                  >
                    Edit
                  </button>
                {/if}
              </div>

              <div class="text-base leading-relaxed whitespace-pre-wrap">
                {#if editingKey === note.key}
                  <textarea
                    class="w-full p-2 border rounded bg-gray-50"
                    bind:value={editedContent}
                    rows="25"
                  ></textarea>
                {:else}
                  {note.content}
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No saved notes</p>
      {/if}
    </SectionHeader>
  {/if}

  {#if toast}
    <Toast message={toast.message} type={toast.type} />
  {/if}
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
    scroll-padding-top: 100px;
  }
</style>
