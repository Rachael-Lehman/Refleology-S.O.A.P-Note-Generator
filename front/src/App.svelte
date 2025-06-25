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
  import { slide } from "svelte/transition";
  import Navbar from "./Navbar.svelte";

  let API_URL = import.meta.env.VITE_BackEnd_URL;
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
  let selectedNoteKey = null;
  let previouslyOpenedKey = null;
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
      foot: null,
      anatomicalArea: null,
      temperature: null,
      hydration: null,
      color: null,
      tissueTone: null,
      tissueFindings: null,
      sensitivity: 0,
    },
  ];

  let foot = ["Right foot", "Left foot", "Bilateral"];
  let temperatureItems = ["Cool to touch", "Hot to touch"];
  let hydrationItems = [
    "Dryness",
    "Damp or clammy tissue",
    "Sweatyness",
    "Profusely sweatyness",
    "Boggyness",
    "Congestion",
    "Sponginess",
  ];
  let colorItems = ["Paleness", "Redness (erythematous)", "Blotchy"];
  let tissueToneItems = [
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
      "Proximal hallux, (Cervical)",
      "1st Metatarsal, (Thoracic)",
      "1st Cuneiform to calcaneus, (Lumbar)",
      "Medial edge of posterior calcaneus, (Sacral and Coccyx)",
      "Interphalangeal joint of hallux, (Jaw)",
      "MTP #1-5, (Collarbone)",
      "MTP #5, (Shoulder)",
      "Lateral MTP to tuberosity of 5th metatarsal, (Arm)",
      "Lateral tuberosity of 5th metatarsal, (Knee/Elbow)",
      "Lateral tuberosity of 5th metatarsal to calcaneofibular joint, (Knee/Leg/Hip)",
      "Lateral posterior calcaneofibular joint, (Pelvis/Hip)",
    ],
    Nervous: [
      "Distal phalanges #1-5, (Brain)",
      "Plantar aspect distal phalanges #1-5, (Brain)",
      "Medial aspect from 1st proximal phalanx to posterior calcaneus, (Spinal Cord)",
      "Medial edge 1st proximal phalanx, (Cervical)",
      "Medial edge 1st metatarsal, (Thoracic)",
      "Medial edge metatarsocuneiform joint to talonavicular joint, (Lumbar)",
      "Medial edge of medial cuneiform to navicular, (Lumbar)",
      "Medial edge talonavicular joint to posterior calcaneus, (Sacrum & Coccyx)",
      "Plantar aspect proximal edge of medial sesamoid on 1st metatarsal, (Vagus nerve)",
      "Lateral edge of interphalangeal joint of hallux, (Phrenic nerve)",
    ],
    Endocrine: [
      "Plantar surface of intermediate distal hallux, (Pituitary & Hypothalamus)",
      "Medial edge of distal hallux, (Pineal)",
      "Medial edge of proximal hallux, (Thyroid)",
      "Medial aspect of MTP joint, (Thymus)",
      "Medial edge of head of 1st metatarsal, (Thymus)",
      "Plantar surface of lateral base of 1st metatarsal, (Adrenal)",
      "Plantar aspect of lateral edge of 1st metatarsocuneiform joint, (Adrenal)",
    ],
    Reproductive: [
      "Medial aspect of posterior calcaneus, (Uterus/Prostate)",
      "Medial aspect of posterior process of talus, medial tubercle, (Uterus/Prostate)",
      "Lateral aspect of posterior process of talus, lateral tubercle, (Ovary/Testis)",
      "Aspect of posterior calcaneus, (Ovary/Testis)",
      "Lateral aspect of posterior calcaneus to dorsal talocalcaneonavicular joint to medial posterior calcaneus, (Ova duct / Sperm duct)",
    ],
    Respiratory: [
      "Medial edge to plantar aspect of interphalangeal joint of hallux, (Nose)",
      "Plantar surface of medial base of distal hallux, (Nose)",
      "Plantar aspect of distal and middle phalanges #2-5, (Sinuses)",
      "Plantar surface of MTP joints #2-5, (Lungs)",
      "Plantar aspect of proximal base of phalanges #2-5 to distal head of metatarsals #2-5, (Lungs)",
      "Plantar surface distal to MTP joints #1-5, (Diaphragm - Paula Stone)",
      "Plantar aspect of intermediate metatarsal #1 transverse to metatarsal #4 to medial edge of metatarsal #5 tuberosity, (Diaphragm - Touchpoint)",
      "Plantar surface from distal head of metatarsal #1 transverse to tuberosity of 5th metatarsal, (Diaphragm - Anatomical)",
    ],
    Cardiovascular: [
      "Plantar aspect of 1st MTP joint R foot; #1-3 MTP joints L foot (Heart)",
      "Lateral edge of proximal hallux, (Carotid Artery)",
    ],
    Immune_Lymphatic: [
      "Lateral aspect of distal hallux, (Tonsils)",
      "Medial aspect of MTP joint, (Thymus)",
      "Medial edge of head of 1st metatarsal, (Thymus)",
      "Plantar surface of the base of 4th-5th metatarsals, L foot (Spleen)",
    ],
    Digestive: [
      "Plantar aspect of metatarsals #5-1 R foot; metatarsal #1 L foot (Liver)",
      "Plantar aspect of metatarsal #4, R foot (Gall Bladder)",
      "Medial edge to plantar aspect of interphalangeal joint of hallux, (Mouth)",
      "Medial edge of proximal hallux to proximal aspect of MTP joint, (Esophagus)",
      "Medial edge of proximal hallux to medial sesamoid bone on 1st metatarsal, (Esophagus)",
      "Plantar aspect from lateral edge of metatarsal #1 to lateral edge of metatarsal #4, L foot (Stomach)",
      "Plantar surface from medial edge of metatarsal #1 to medial edge of metatarsal #2, R foot (Duodenum)",
      "Plantar surface from distal cuneiforms & cuboid to distal calcaneus, (Small Intestines)",
      "Plantar aspect of lateral intermediate cuboid, R foot (Ileocecal Valve)",
      "Plantar surface of R foot from lateral distal calcaneus to proximal 5th metatarsal (Ascending Colon)",
      "Plantar aspect from lateral edge of cuboid across cuneonavicular joint, (Transverse Colon)",
      "Plantar aspect from cuboid-5th metatarsal R foot to proximal medial 5th metatarsal L foot (Transverse Colon)",
      "Plantar surface of L lateral edge of cuboid and distal portion of calcaneus (Descending Colon)",
      "Plantar surface from proximal medial 5th metatarsal L foot to intermediate calcaneus medial talus (D-Colon + Sigmoid)",
      "Plantar surface of intermediate calcaneus, L foot (Sigmoid Colon)",
      "Medial aspect of distal calcaneus to posterior calcaneus, (Rectum)",
      "Medial aspect of calcaneotalar joint to posterior calcaneus, (Rectum)",
      "Plantar surface of 1st metatarsocuneiform joint R foot to 4th metatarsocuneiform joint L foot (Pancreas)",
    ],
    Urinary: [
      "Plantar surface of 2nd metatarsal intermediate cuneiform & 3rd metatarsal lateral cuneiform, (Kidneys)",
      "Plantar aspect of 2nd-3rd metatarsocuneiform joint, (Kidneys)",
      "Plantar aspect from lateral medial cuneiform to medial distal calcaneus, (Ureters)",
      "Plantar aspect of 2nd cuneiform and mid navicular, (Ureters)",
      "Medial aspect of talonavicular joint, (Bladder)",
      "Medial aspect of sustentaculum tali, (Bladder)",
    ],
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
    window.location.href = `${API_URL}/auth/google`;
  }

  function addCongestionAreas() {
    congAreas = [
      ...congAreas,
      {
        id: congAreas.length + 1,
        foot: null,
        anatomicalArea: null,
        temperature: null,
        hydration: null,
        color: null,
        tissueTone: null,
        tissueFindings: null,
        sensitivity: 0,
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
          if (googleDocsEnabled)
            await downloadPdf(
              noteContent,
              formData.clientFirstName,
              formData.clientLastName,
              formData.date,
            );

          congAreas = [
            {
              id: 1,
              foot: null,
              anatomicalArea: null,
              temperature: null,
              hydration: null,
              color: null,
              tissueTone: null,
              tissueFindings: null,
              sensitivity: 0,
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
          note = "";
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
    let soapNote = `SOAP Note\n\nClient Name: ${formData.clientFirstName} ${formData.clientLastName}\nDate: ${formData.date}\nReflexologist: ${formData.reflexologist}\n\n`;
    if (formData.chiefComplaint || formData.healthHistory) {
      soapNote += `Subjective:\n`;
      if (formData.chiefComplaint)
        soapNote += `• Chief Complaint: ${formData.chiefComplaint}\n`;
      if (formData.healthHistory)
        soapNote += `• Health History: ${formData.healthHistory}\n`;
      soapNote += `\n`;
    }
    if (formData.observation || congAreas.length > 0) {
      soapNote += `Objective:\n`;
      if (formData.observation)
        soapNote += `• Observation: ${formData.observation}\n`;
      if (congAreas.length > 0) {
        soapNote += `• Areas of Congestion: \n`;
        for (let i = 0; i < congAreas.length; i++) {
          let formatedAnatomicalArea =
            congAreas[i]?.anatomicalArea?.replace(/\s*\(.*?\)/g, "") || "";
          if (formatedAnatomicalArea && congAreas[i].foot) {
            if (congAreas[i].foot !== "Bilateral") {
              soapNote += `\t• ${congAreas[i].foot}, ${toLower(formatedAnatomicalArea)} `;
            } else {
              soapNote += `\t• ${formatedAnatomicalArea} `;
            }

            if (congAreas[i].temperature)
              soapNote += `${toLower(congAreas[i].temperature)}, `;
            if (congAreas[i].hydration)
              soapNote += `${toLower(congAreas[i].hydration)}, `;
            if (congAreas[i].color)
              soapNote += `${toLower(congAreas[i].color)}, `;
            if (congAreas[i].tissueTone)
              soapNote += `${toLower(congAreas[i].tissueTone)}, `;
            if (congAreas[i].tissueFindings)
              soapNote += `${toLower(congAreas[i].tissueFindings)}, `;
            soapNote += `sensitivity was reported as a "${congAreas[i]?.sensitivity}"`;
            if (congAreas[i].foot === "Bilateral") {
              soapNote += `, bilat\n`;
            } else {
              soapNote += `\n`;
            }
          }
        }
      }
    }

    if (
      formData.sessionType ||
      formData.areasOfEmphasis ||
      formData.clientResponse
    ) {
      soapNote += `\n\nAction:\n`;
      if (formData.sessionType)
        soapNote += `• Type of Session: ${formData.sessionType}\n`;
      if (formData.areasOfEmphasis)
        soapNote += `• Areas of Emphasis: ${formData.areasOfEmphasis}\n`;
      if (formData.clientResponse)
        soapNote += `• Client Response: ${formData.clientResponse}\n`;
    }

    if (formData.recommendations || formData.homeCare || formData.followUp) {
      soapNote += `\n\nPlan:\n`;
      if (formData.recommendations)
        soapNote += `• Recommendations: ${formData.recommendations}\n`;
      if (formData.homeCare) soapNote += `• Home Care: ${formData.homeCare}\n`;
      if (formData.followUp) soapNote += `• Follow-up: ${formData.followUp}\n`;
      soapNote += `\n`;
    }

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
  function toLower(text) {
    return text.toLowerCase();
  }
  function startEdit(note) {
    editingKey = note.key;
    editedContent = note.content;
  }
  function cancelEdit() {
    editingKey = null;
    editedContent = "";
  }
  function updateAreasOfEmphasis() {
    let areasOfEmphasisList = [];
    for (let i = 0; i < congAreas.length; i++) {
      let formatedAnatomicalArea =
        congAreas[i]?.anatomicalArea?.match(/\((.*?)\)/)?.[1] || "";
      if (areasOfEmphasisList.length === 0) {
        formData.areasOfEmphasis = `Focused on reflexes for ${toLower(formatedAnatomicalArea)}`;
        areasOfEmphasisList.push(formatedAnatomicalArea);
      } else if (!areasOfEmphasisList.includes(formatedAnatomicalArea)) {
        formData.areasOfEmphasis += `, ${toLower(formatedAnatomicalArea)}`;
        areasOfEmphasisList.push(formatedAnatomicalArea);
      }
    }
  }
  async function saveEdit(key, first, last, date) {
    console.log("Saving", key, "with new content:", editedContent);
    if (key && editedContent) {
      try {
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
        const response = await fetch(`${API_URL}/api/generate_pdf`, {
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
  function displaySystemName(system) {
    if (system === "Immune_Lymphatic") {
      return "Immune Lymphatic";
    }
    return system;
  }
  async function selectNote(note) {
    if (selectedNoteKey === note.key) {
      previouslyOpenedKey = note.key;
      selectedNoteKey = null;
    } else {
      selectedNoteKey = note.key;
      await tick(); // wait for DOM to update
      document
        .getElementById(`note-${note.key}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function deselectNote() {
    selectedNoteKey = null;
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
          class="bg-yellow-500 hover:bg-yellow-600 hover:scale-105 transition-transform duration-200 text-white font-medium px-4 py-2 rounded"
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
              value={field.anatomicalArea || ""}
            />
            <input
              type="text"
              class="sr-only"
              required
              value={field.foot || ""}
            />
            <div class="border p-3 rounded mb-4">
              <Accordion flush>
                <AccordionItem>
                  <span slot="header">
                    Foot
                    <span class="text-red-500 ml-1" aria-hidden="true">*</span>
                  </span>
                  <Listgroup>
                    {#each foot as option}
                      <ListgroupItem>
                        <label class="flex items-center gap-2">
                          <input
                            type="radio"
                            name="foot-{field.id}"
                            value={option}
                            bind:group={field.foot}
                            on:click={() => {
                              if (field.foot === option) {
                                field.foot = null;
                              } else {
                                field.foot = option;
                              }
                            }}
                          />
                          {option}
                        </label>
                      </ListgroupItem>
                    {/each}
                  </Listgroup>
                </AccordionItem>

                <AccordionItem>
                  <span slot="header">
                    Anatomical Area
                    <span class="text-red-500 ml-1" aria-hidden="true">*</span>
                  </span>
                  <!-- custom required field for anatomical Area -->
                  <Accordion class="w-[95%] mx-auto">
                    {#each Object.entries(anatomicalAreasBySystem) as [system, options]}
                      <AccordionItem>
                        <span slot="header">{displaySystemName(system)}</span>
                        <Listgroup>
                          {#each options as option}
                            <ListgroupItem>
                              <label class="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="anatomicalArea-{field.id}"
                                  value={option}
                                  bind:group={field.anatomicalArea}
                                  on:change={updateAreasOfEmphasis}
                                  on:click={() => {
                                    if (field.anatomicalArea === option) {
                                      field.anatomicalArea = null;
                                    } else {
                                      field.anatomicalArea = option;
                                    }
                                  }}
                                />
                                {option}
                              </label>
                            </ListgroupItem>
                          {/each}
                        </Listgroup>
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
                            on:click={() => {
                              if (field.temperature === option) {
                                field.temperature = null;
                              } else {
                                field.temperature = option;
                              }
                            }}
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
                            on:click={() => {
                              if (field.hydration === option) {
                                field.hydration = null;
                              } else {
                                field.hydration = option;
                              }
                            }}
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
                            on:click={() => {
                              if (field.color === option) {
                                field.color = null;
                              } else {
                                field.color = option;
                              }
                            }}
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
                            on:click={() => {
                              if (field.tissueTone === option) {
                                field.tissueTone = null;
                              } else {
                                field.tissueTone = option;
                              }
                            }}
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
                            on:click={() => {
                              if (field.tissueFindings === option) {
                                field.tissueFindings = null;
                              } else {
                                field.tissueFindings = option;
                              }
                            }}
                          />
                          {option}
                        </label>
                      </ListgroupItem>
                    {/each}
                  </Listgroup>
                </AccordionItem>
                <AccordionItem>
                  <span slot="header">Sensitivity</span>
                  <Listgroup>
                    {#each [0, 1, 2, 3, 4] as value}
                      <ListgroupItem>
                        <label class="flex items-center gap-2">
                          <input
                            type="radio"
                            name="sensitivity-{field.id}"
                            {value}
                            bind:group={field.sensitivity}
                          />
                          {value}
                        </label>
                      </ListgroupItem>
                    {/each}
                  </Listgroup>
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
        <Button type="submit" disabled={isUploading} class="relative">
          {#if isUploading}
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
              ></div>
            </div>
            <span class="opacity-0"> Create SOAP Note</span>
          {:else}
            Create SOAP Note
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
        <div class="flex flex-col gap-3 w-[90%] mx-auto">
          {#each clientList as client}
            <button
              type="button"
              class="flex justify-between items-center bg-blue-50 text-black font-semibold rounded-lg py-4 px-6 shadow-md border border-blue-200
  hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              on:click={() => handleClientClick(client.clientKey)}
            >
              <div class="flex flex-col">
                <div class="text-lg">
                  {client.firstName}
                  {client.lastName}
                </div>
                <div class="text-sm text-gray-600 mt-1">
                  DOB: {new Date(client.dob).toLocaleDateString()}
                </div>
              </div>
              <div class="text-blue-600 text-sm font-medium">View</div>
            </button>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic text-center">No saved clients</p>
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
        <!-- Summary row -->
        <div class="flex flex-col gap-3 mb-8 w-[90%] mx-auto">
          {#each savedNotesOndisplay as note}
            <button
              on:click={() => selectNote(note)}
              class="w-full flex justify-between items-center bg-blue-50 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] border border-blue-200 rounded-lg p-4 shadow-sm transition-all duration-200"
            >
              <div class="flex flex-col text-left">
                <div class="text-xl font-semibold text-black-900">
                  {savedClientOndisplay.firstName}
                  {savedClientOndisplay.lastName}
                </div>
                <div class="mt-1 text-lg font-semibold text-black-700">
                  {new Date(note.date).toLocaleDateString()}
                </div>
              </div>
              <div class="text-sm font-medium text-blue-600">View</div>
            </button>
          {/each}
        </div>

        <!-- Full selected note display -->
        {#if selectedNoteKey}
          <div class="mt-4">
            {#each savedNotesOndisplay as note (note.key)}
              <div transition:slide>
                {#if note.key === selectedNoteKey}
                  <div
                    id={"note-" + note.key}
                    class="max-w-3xl mx-auto bg-white text-black font-medium rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div class="flex justify-between items-center mb-2">
                      <div class="text-sm text-gray-600">Date: {note.date}</div>

                      {#if editingKey === note.key}
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
                        <button
                          class="text-sm font-semibold text-gray-500 ml-2"
                          on:click={() => cancelEdit()}
                        >
                          Cancel
                        </button>
                      {:else}
                        <div class="flex justify-end space-x-3 mt-4">
                          <button
                            class="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:scale-110 transition-all duration-150"
                            on:click={() => startEdit(note)}
                          >
                            Edit
                          </button>

                          <button
                            class="text-sm font-semibold text-green-700 hover:text-green-900 hover:scale-110 transition-all duration-150"
                            on:click={() => {
                              const currentDate = new Date()
                                .toISOString()
                                .split("T")[0];
                              downloadPdf(
                                note.content,
                                savedClientOndisplay.firstName,
                                savedClientOndisplay.lastName,
                                currentDate,
                              );
                            }}
                          >
                            Download PDF
                          </button>

                          <button
                            class="text-sm text-red-500 hover:underline hover:scale-110 transition-all duration-150"
                            on:click={deselectNote}
                          >
                            Close
                          </button>
                        </div>
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
                {/if}
              </div>
            {/each}
          </div>
        {/if}
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
