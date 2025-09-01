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
  import ConfirmModal from "./ConfirmModal.svelte";

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
  let googleDocsEnabled = false;
  let showConfirm = false;
  let confirmMessage = "";
  let editingClientKey = null;
  let editFirstName = "";
  let editLastName = "";
  let editDOB = "";
  let editingNoteKey = null;
  let editNoteDate = "";

  let confirmAction = () => {};

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
  'Dehydrated (dry)',
  'Moist (damp)',
  'Hyperhydrated (excessively wet)',
  'Edematous (swollen)',
  'Congested (fluid-backup)',
  'Pitted (indentation forms)'
];

  let colorItems = [
  'Erythematous (red)',
  'Pallid (pale)',
  'Cyanotic (Bluish)',
  'Dusky (slightly dark or muted color)',
  'Ecchymotic (bruised)'
];

  let tissueToneItems = [
  'Hypertonic (increased tension) tissue tone',
  'Hypotonic (decreased tension) tissue tone',
  'Firm tissue tone',
  'Soft tissue tone',
  'Ropy (cord-like) tissue tone',
  'Contracted (tight) tissue tone',
  'Relaxed (loose) tissue tone',
  'Nodular (small lumps) tissue tone',
  'Fibrotic (dense) tissue tone',
  'Flaccid (weak) tissue tone'
];

  let TissueFindings = [
  'Callus',
  'Wort',
  'Bruise',
  'Scar',
  'Rash',
  'Puffiness'
];

let anatomicalAreasBySystem = {
   // RULES:
    // All parentheses will be removed from the text upon file creation.
    // The text inside the parentheses will be automatically added to areas of emphasis, but it can be manually changed.
    // Everything in the parentheses after a double dash (--) will be cut off.

  "Musculoskeletal System": [
    "(Neck) Plantar aspect, distal ends of 1st through 5th proximal phalanges",
    "(Shoulder - Anterior) Plantar aspect, shaft of 4th proximal phalange through shaft of 5th proximal phalange to distal end of 5th metatarsal",
    "(Shoulder - Posterior) Dorsal aspect, proximal end of 4th and 5th proximal phalanges to distal end of 4th and 5th metatarsals",
    "(Arm) Lateral aspect, proximal end of 5th metatarsal to proximal end of 5th proximal phalange",
    "(Hip / Knee / Leg) Plantar aspect, anterior margin of calcaneus to cuboid to proximal end of 5th metatarsal",
    "(Hip / Back / Sciatic) Medial aspect, posterior to medial malleolus",
    "(Spine) Medial aspect, interphalangeal joint of 1st phalange to posterior calcaneus",
    "(Cervical) Medial aspect, interphalangeal joint of 1st phalange to proximal end of 1st proximal phalange",
    "(Thoracic) Medial aspect, distal end of 1st metatarsal to proximal end of 1st metatarsal",
    "(Lumbar) Medial aspect, medial cuneiform to posterior margin of navicular",
    "(Sacrum) Medial aspect, distal end of talus to medial margin of calcaneus central body",
    "(Coccyx) Medial aspect, posterior tubercle of talus to posterior margin of calcaneus"
  ],

  "Nervous System": [
    "(Brain) Plantar aspect, 1st distal phalange",
    "(Brain) Plantar aspect, 2nd distal phalange",
    "(Brain) Plantar aspect, 3rd distal phalange",
    "(Brain) Plantar aspect, 4th distal phalange",
    "(Brain) Plantar aspect, 5th distal phalange",
    "(Eyes) Plantar aspect, 2nd proximal phalange to 3rd proximal phalange",
    "(Ears) Plantar aspect, distal end of 4th proximal phalange to 5th proximal phalange",
    "(Spine) Medial aspect, interphalangeal joint of 1st phalange to posterior calcaneus",
    "(Cervical) Medial aspect, interphalangeal joint of 1st phalange to proximal end of 1st proximal phalange",
    "(Thoracic) Medial aspect, distal end of 1st metatarsal to proximal end of 1st metatarsal",
    "(Lumbar) Medial aspect, medial cuneiform to posterior margin of navicular",
    "(Sacrum) Medial aspect, distal end of talus to medial margin of calcaneus central body",
    "(Coccyx) Medial aspect, posterior tubercle of talus to posterior margin of calcaneus",
    "(Solar Plexus) Plantar aspect, inferior to distal end of 2nd metatarsal",
    "(Sciatic) Plantar aspect, medial margin of calcaneus central body to lateral margin calcaneus central body"
  ],

  "Endocrine System": [
    "(Pituitary / Pineal) Plantar aspect, proximal end of 1st distal phalange",
    "(Thyroid / Parathyroid) Medial aspect, distal end of 1st proximal phalange",
    "(Thymus) Plantar aspect, 1st metatarsophalangeal joint",
    "(Adrenals) Plantar aspect, lateral side of proximal end of 1st metatarsal",
    "(Pancreas - Left Side) Plantar aspect, proximal end of 1st metatarsal to inferior shaft of 2nd and 3rd metatarsals",
    "(Pancreas - Right Side) Plantar aspect, medial margin of proximal end of 1st metatarsal",
    "(Liver - Left Side) Plantar aspect, inferior to distal end of 1st metatarsal",
    "(Liver - Right Side) Plantar aspect, inferior to distal ends of 1st to medial margin of 5th metatarsal, proximal end of 5th metatarsal, superior to the proximal end of 4th metatarsal, shafts of 3rd to 1st metatarsals"
  ],

  "Reproductive System": [
    "(Prostate / Uterus) Medial aspect, posterior margin of calcaneus",
    "(Ovary / Testes) Lateral aspect, posterior tubercle of talus",
    "(Fallopian Tubes / Vas Deferens / Pelvic Line) Dorsal aspect, medial posterior margin of navicular to lateral posterior margin of cuboid"
  ],

  "Respiratory System": [
    "(Sinus) Plantar aspect, 1st intermediate and proximal phalanges",
    "(Sinus) Plantar aspect, 2nd intermediate and proximal phalanges",
    "(Sinus) Plantar aspect, 3rd intermediate and proximal phalanges",
    "(Sinus) Plantar aspect, 4th intermediate and proximal phalanges",
    "(Sinus) Plantar aspect, 5th intermediate and proximal phalanges",
    "(Chest / Lung - Posterior) Plantar aspect, proximal end of 1st proximal phalange to distal end of 1st metatarsal",
    "(Chest / Lung - Posterior) Plantar aspect, proximal end of 2nd proximal phalange to distal end of 2nd metatarsal",
    "(Chest / Lung - Posterior) Plantar aspect, proximal end of 3rd proximal phalange to distal end of 3rd metatarsal",
    "(Chest / Lung - Posterior) Plantar aspect, proximal end of 4th proximal phalange to distal end of 4th metatarsal",
    "(Chest / Lung - Posterior) Plantar aspect, proximal end of 5th proximal phalange to distal end of 5th metatarsal",
    "(Chest / Lung - Anterior) Dorsal aspect, 1st metatarsal and dorsal interosseus",
    "(Chest / Lung - Anterior) Dorsal aspect, 2nd metatarsal and dorsal interosseus",
    "(Chest / Lung - Anterior) Dorsal aspect, 3rd metatarsal and dorsal interosseus",
    "(Chest / Lung - Anterior) Dorsal aspect, 4th metatarsal and dorsal interosseus",
    "(Chest / Lung - Anterior) Dorsal aspect, 5th metatarsal and dorsal interosseus",
    "(Diaphragm) Plantar aspect, inferior to distal ends of 1st to 5th metatarsals"
  ],

  "Cardiovascular System": [
    "(Heart) Medial aspect, proximal end of 1st proximal phalange to distal end of 1st metatarsal"
  ],

  "Lymphatic System": [
    "(Spleen) Plantar aspect, shaft of 4th and 5th metatarsal to superior to the proximal end of 5th metatarsal",
    "(Lymphatic - Lower) Dorsal aspect, medial posterior margin of navicular to lateral posterior margin of cuboid"
  ],

  "Digestive System": [
    "(Stomach - Left Side) Plantar aspect, shaft of the 1st metatarsal to inferior distal ends of 3rd to 5th metatarsals, superior proximal end of 5th to 1st metatarsals",
    "(Stomach - Right Side) Plantar aspect, proximal end of 1st metatarsal",
    "(Small Intestine) Plantar aspect, all cuneiforms and cuboid to distal margin of talus and calcaneus",
    "(Liver - Left Side) Plantar aspect, inferior to distal end of 1st metatarsal",
    "(Liver - Right Side) Plantar aspect, inferior to distal ends of 1st to medial margin of 5th metatarsal, proximal end of 5th metatarsal, superior to the proximal end of 4th metatarsal, shafts of 3rd to 1st metatarsals",
    "(Gall Bladder) Plantar aspect, between shafts of 4th and 5th metatarsals",
    "(Pancreas - Left Side) Plantar aspect, proximal end of 1st metatarsal to the shafts of 2nd, 3rd, and 4th metatarsals",
    "(Pancreas - Right Side) Plantar aspect, medial margin of proximal end of 1st metatarsal",
    "(Ileocecal Valve) Plantar aspect, intermediate margin of posterior calcaneus central body",
    "(Ascending Colon) Plantar aspect, lateral margin of calcaneus central body to proximal end of 5th metatarsal",
    "(Transverse Colon) Plantar aspect, navicular, cuneiforms, cuboid to proximal end of 5th metatarsal",
    "(Descending Colon) Plantar aspect, proximal end of 5th metatarsal to lateral margin of calcaneus central body",
    "(Sigmoid Flexure) Plantar aspect, lateral margin of calcaneus central body",
    "(Rectum) Plantar aspect, posterior calcaneus to medial margin of calcaneus",
    "(Anus) Plantar aspect, medial margin of talus"
  ],

  "Urinary System": [
    "(Kidney) Plantar aspect, inferior to lateral proximal end of 1st metatarsal, proximal end of 2nd metatarsal, medial aspect of proximal end of 3rd metatarsal, and intermediate cuneiform",
    "(Ureter) Plantar aspect, proximal end of 2nd cuneiform to distal end of talus",
    "(Bladder) Plantar aspect, medial margin of trochlear surface of talus"
  ],

  "Horizontal Guidelines": [
    "(Shoulder Line) Plantar aspect, shaft of 1st to 5th proximal phalanges",
    "(Diaphragm Line) Plantar aspects inferior to distal ends of 1st to 5th metatarsals",
    "(Waist Line) Plantar aspect, proximal end of 1st to 5th metatarsals",
    "(Pelvic Line) Plantar aspect, anterior medial margin of calcaneus to anterior lateral margin of calcaneus"
]};

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

  async function deleteNote(noteKey, clientKey) {
    if (!noteKey || !clientKey) {
      toast = {
        message: "Error Deleting Note: Missing credentials",
        type: "error",
      };
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/delete/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          clientKey,
          noteKey,
        }),
      });

      const result = await response.json();
      if (!result?.success) {
        toast = { message: result?.message, type: "error" };
        return;
      }
      savedNotesOndisplay = savedNotesOndisplay.filter(
        (n) => n.key !== noteKey,
      );
      if (selectedNoteKey === noteKey) selectedNoteKey = null;
      if (savedNotesOndisplay.length <= 0) {
        clientList = clientList.filter((c) => c.clientKey !== clientKey);
        savedClientOndisplay = null;
      }
      toast = {
        message: result?.message,
        type: result?.success ? "success" : "error",
      };
    } catch (err) {
      console.error(err);
      toast = { message: "Error Deleting Note", type: "error" };
    }
  }

  async function deleteClient(clientKey) {
    if (!clientKey) {
      toast = {
        message: "Error Deleting Client: Missing credentials",
        type: "error",
      };
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/delete/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          clientKey,
        }),
      });

      const result = await response.json();
      if (!result?.success) {
        toast = { message: result?.message, type: "error" };
        return;
      }
      clientList = clientList.filter((c) => c.clientKey !== clientKey);
      if (savedClientOndisplay && savedClientOndisplay.key === clientKey) {
        savedClientOndisplay = null;
        selectedNoteKey = null;
        savedNotesOndisplay = [];
      }
      toast = {
        message: result?.message,
        type: "success",
      };
    } catch (err) {
      console.error(err);
      toast = { message: "Error Deleting Client", type: "error" };
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
            "Content-Type": "application/json",
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

  async function updateClient(clientKey, first, last, DOB) {
    if (clientKey && first && last && DOB) {
      try {
        const response = await fetch(`${API_URL}/api/edit_client`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            clientKey,
            first,
            last,
            DOB,
          }),
        });

        const result = await response.json();
        if (result.success) {
          clientList.forEach((client) => {
            if (client.clientKey === clientKey) {
              client.firstName = first;
              client.lastName = last;
              client.dob = DOB;
            }
          });
          clientList = await sortClients(clientList);
          if (savedClientOndisplay?.key === clientKey) {
            savedClientOndisplay.firstName = first;
            savedClientOndisplay.lastName = last;
            savedClientOndisplay.dob = DOB;
          }
        }
        toast = {
          message: result.message,
          type: result.success ? "success" : "error",
        };
      } catch (err) {
        console.error(err);
        toast = { message: "Edit Client Error.", type: "error" };
      }
    } else {
      toast = { message: "Missing credentials or Edit Data.", type: "error" };
    }
  }

  async function updateNoteDate(clientKey, noteS3Key, newDate) {
    if (clientKey && noteS3Key && newDate) {
      try {
        const response = await fetch(`${API_URL}/api/edit_noteDate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            clientKey,
            noteS3Key,
            newDate,
          }),
        });

        const result = await response.json();
        if (result.success) {
          savedNotesOndisplay.forEach((note) => {
            if (note.key === noteS3Key) {
              note.date = newDate;
            }
          });
          savedNotesOndisplay = await sortNotesByDate(savedNotesOndisplay);
          // Force Svelte to recognize the change:
          savedNotesOndisplay = [...savedNotesOndisplay];
        }
        toast = {
          message: result.message,
          type: result.success ? "success" : "error",
        };
      } catch (err) {
        console.error(err);
        toast = { message: "Edit Note Date Error.", type: "error" };
      }
    } else {
      toast = { message: "Missing credentials or Edit Data.", type: "error" };
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
        clientList = await sortClients(clientList);
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
          savedNotesOndisplay = await sortNotesByDate(savedNotesOndisplay);
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
    formData.date = new Date(formData.date).toLocaleDateString("en-US", {
      timeZone: "UTC",
    });
    clientDOB.date = new Date(formData.date).toLocaleDateString("en-US", {
      timeZone: "UTC",
    });
    let soapNote = `Client Name: ${formData.clientFirstName} ${formData.clientLastName}\nDate: ${formData.date}\nReflexologist: ${formData.reflexologist}\n\n`;
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
      let rawAnatomicalArea =
        congAreas[i]?.anatomicalArea?.match(/\((.*?)\)/)?.[1] || "";

      let formatedAnatomicalArea = rawAnatomicalArea.includes("--")
        ? rawAnatomicalArea.split("--")[0].trim()
        : rawAnatomicalArea.trim();

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
  async function downloadClientPDF() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const uniqueSuffix = Date.now();

    let clientListInOrder = await sortClients(clientList);
    let clientListDoc = `Client List:\n\n`;
    clientListInOrder.forEach((client) => {
      if (client && client.firstName && client.lastName) {
        clientListDoc += `${client.firstName} ${client.lastName}\n`;
      }
    });

    try {
      if (clientListDoc) {
        const response = await fetch(`${API_URL}/api/generate_pdf`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: clientListDoc }),
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
        link.download = `ClientList_${dateStr}_${uniqueSuffix}.pdf`;
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
      console.error(err);
    }
  }
  function displaySystemName(system) {
    if (system === "Immune_Lymphatic") {
      return "Immune/Lymphatic";
    }
    return system;
  }
  async function selectNote(note) {
    if (selectedNoteKey === note.key) {
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
  async function sortClients(list) {
    list = list.sort((a, b) => {
      const lastA = a.lastName.toLowerCase();
      const lastB = b.lastName.toLowerCase();
      if (lastA < lastB) return -1;
      if (lastA > lastB) return 1;
      const firstA = a.firstName.toLowerCase();
      const firstB = b.firstName.toLowerCase();
      if (firstA < firstB) return -1;
      if (firstA > firstB) return 1;
      return 0;
    });
    return list;
  }
  async function sortNotesByDate(list) {
    list = list.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // newest to oldest
    });
    return list;
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

    <SectionHeader id="clients-listed" title="">
      <div
        class="flex items-center justify-between mb-6 pb-2 border-b-2 border-blue-500"
      >
        <h1 class="text-2xl font-bold text-gray-800">Client List</h1>
        <button
          type="button"
          class="bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600 transition"
          on:click={downloadClientPDF}
        >
          Download PDF
        </button>
      </div>
      {#if clientList && clientList.length > 0}
        <div class="flex flex-col gap-3 w-full">
          {#each clientList as client}
            {#if editingClientKey === client.clientKey}
              <!-- EDIT MODE: Inline form replacing the card -->
              <form
                class="flex flex-col bg-blue-50 text-black font-semibold rounded-lg py-4 px-6 shadow-md border border-blue-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 w-full"
                on:submit|preventDefault={async () => {
                  await updateClient(
                    client.clientKey,
                    editFirstName,
                    editLastName,
                    editDOB,
                  );
                  editingClientKey = null;
                }}
              >
                <div class="flex flex-col gap-3">
                  <!-- First Name Row -->
                  <div class="flex items-center gap-2">
                    <label
                      for="edit-firstname"
                      class="w-28 text-gray-700 text-sm font-medium"
                    >
                      First Name:
                    </label>
                    <input
                      id="edit-firstname"
                      type="text"
                      class="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                      bind:value={editFirstName}
                    />
                  </div>

                  <!-- Last Name Row -->
                  <div class="flex items-center gap-2">
                    <label
                      for="edit-lastname"
                      class="w-28 text-gray-700 text-sm font-medium"
                    >
                      Last Name:
                    </label>
                    <input
                      id="edit-lastname"
                      type="text"
                      class="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                      bind:value={editLastName}
                    />
                  </div>

                  <!-- DOB Row -->
                  <div class="flex items-center gap-2">
                    <label
                      for="edit-dob"
                      class="w-28 text-gray-700 text-sm font-medium"
                    >
                      Date of Birth:
                    </label>
                    <input
                      id="edit-dob"
                      type="date"
                      class="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                      bind:value={editDOB}
                    />
                  </div>

                  <div class="flex gap-2 justify-end">
                    <button
                      type="button"
                      class="bg-gray-400 text-white text-sm px-4 py-2 rounded hover:bg-gray-500 transition"
                      on:click={() => (editingClientKey = null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            {:else}
              <!-- NORMAL MODE: Original client card display -->
              <div
                class="flex items-center justify-between bg-blue-50 text-black font-semibold rounded-lg py-4 px-6 shadow-md border border-blue-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 w-full"
              >
                <button
                  type="button"
                  class="flex-grow flex items-center justify-between text-left focus:outline-none"
                  on:click={() => handleClientClick(client.clientKey)}
                >
                  <div class="flex flex-col">
                    <div class="text-lg">
                      {client.firstName}
                      {client.lastName}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      DOB: {new Date(client.dob).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </div>
                  </div>

                  <div class="text-blue-600 text-base font-medium ml-4">
                    View
                  </div>
                </button>

                <!-- Buttons for Delete + Edit in normal mode -->
                <div class="flex flex-col ml-4 space-y-2">
                  <button
                    type="button"
                    class="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                    on:click={(e) => {
                      e.stopPropagation();
                      confirmMessage =
                        "Are you sure you want to delete this client?";
                      confirmAction = () => deleteClient(client.clientKey);
                      showConfirm = true;
                    }}
                  >
                    Delete Client
                  </button>

                  <button
                    type="button"
                    class="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                    on:click={(e) => {
                      e.stopPropagation();
                      editingClientKey = client.clientKey;
                      editFirstName = client.firstName;
                      editLastName = client.lastName;
                      if (client.dob) {
                        const isoDate = new Date(client.dob)
                          .toISOString()
                          .slice(0, 10);
                        editDOB = isoDate; // ensures YYYY-MM-DD
                      } else {
                        editDOB = "";
                      }
                    }}
                  >
                    Edit Client
                  </button>
                </div>
              </div>
            {/if}
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
            {savedClientOndisplay?.firstName}
            {savedClientOndisplay?.lastName}
          </div>
          <div class="text-md text-gray-600">
            DOB: {new Date(savedClientOndisplay.dob).toLocaleDateString(
              "en-US",
              { timeZone: "UTC" },
            )}
          </div>
        </div>
      {/if}

      {#if savedNotesOndisplay && savedNotesOndisplay.length > 0}
        <!-- Summary row -->
        <div class="flex flex-col gap-3 mb-8 w-[90%] mx-auto">
          {#each savedNotesOndisplay as note}
            {#if editingNoteKey === note.key}
              <!-- EDIT MODE: Inline form replacing the note card -->
              <form
                class="flex flex-col bg-blue-50 text-black font-semibold rounded-lg py-4 px-6 shadow-md border border-blue-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 w-full"
                on:submit|preventDefault={async () => {
                  updateNoteDate(
                    savedClientOndisplay.key,
                    note.key,
                    editNoteDate,
                  );
                  editingNoteKey = null;
                }}
              >
                <div class="flex flex-col gap-3">
                  <div class="flex items-center gap-2">
                    <label
                      for="edit-note-date"
                      class="w-28 text-gray-700 text-sm font-medium"
                    >
                      New Date:
                    </label>
                    <input
                      id="edit-note-date"
                      type="date"
                      required
                      class="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      bind:value={editNoteDate}
                    />
                  </div>

                  <div class="flex gap-2 justify-end">
                    <button
                      type="button"
                      class="bg-gray-400 text-white text-sm px-4 py-2 rounded hover:bg-gray-500 transition"
                      on:click={() => (editingNoteKey = null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            {:else}
              <!-- NORMAL MODE: Original note card display -->
              <div
                class="flex items-center justify-between bg-blue-50 text-black font-semibold rounded-lg py-4 px-6 shadow-md border border-blue-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 w-full"
              >
                <button
                  type="button"
                  class="flex-grow flex items-center justify-between text-left focus:outline-none"
                  on:click={() => selectNote(note)}
                >
                  <div class="flex flex-col">
                    <div class="text-lg">
                      {savedClientOndisplay?.firstName}
                      {savedClientOndisplay?.lastName}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      {new Date(note.date).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </div>
                  </div>

                  <div class="text-blue-600 text-base font-medium ml-4">
                    View
                  </div>
                </button>

                <div class="flex flex-col ml-4 space-y-2">
                  <button
                    type="button"
                    class="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                    on:click={(e) => {
                      e.stopPropagation();
                      confirmMessage =
                        "Are you sure you want to delete this note?";
                      confirmAction = () =>
                        deleteNote(note.key, savedClientOndisplay.key);
                      showConfirm = true;
                    }}
                  >
                    Delete Note
                  </button>

                  <button
                    type="button"
                    class="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                    on:click={(e) => {
                      e.stopPropagation();
                      editingNoteKey = note.key;
                      if (note.date) {
                        const isoDate = new Date(note.date)
                          .toISOString()
                          .slice(0, 10);
                        editNoteDate = isoDate; // ensures YYYY-MM-DD
                      } else {
                        editNoteDate = "";
                      }
                    }}
                  >
                    Edit Date
                  </button>
                </div>
              </div>
            {/if}
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
                        <div class="flex flex-wrap justify-end gap-3 mt-4">
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

                          <button
                            class="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                            on:click={() => {
                              confirmMessage =
                                "Are you sure you want to delete this note?";
                              confirmAction = () =>
                                deleteNote(note.key, savedClientOndisplay.key);
                              showConfirm = true;
                            }}
                          >
                            Delete Note
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

  {#if showConfirm}
    <ConfirmModal
      message={confirmMessage}
      onConfirm={() => {
        confirmAction();
        showConfirm = false;
      }}
      onCancel={() => {
        showConfirm = false;
      }}
    />
  {/if}

  {#if toast}
    <Toast
      message={toast.message}
      type={toast.type}
      on:done={() => (toast = null)}
    />
  {/if}
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
    scroll-padding-top: 100px;
  }
</style>
