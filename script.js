/* =========================================================
   STUDYPLANNER
   Local-only study planner
   ========================================================= */


/* =========================
   DATA
========================= */

const STORAGE_KEY = "studyplanner_data_v1";

let data = loadData();

let selectedSubjectId = null;
let selectedTopicId = null;
let selectedNoteId = null;

let contextTarget = null;

let saveTimer = null;


/* =========================
   DOM
========================= */

const subjectsContainer = document.getElementById("subjectsContainer");

const sidebar = document.getElementById("sidebar");
const sidebarResizer = document.getElementById("sidebarResizer");

const emptyState = document.getElementById("emptyState");
const noteArea = document.getElementById("noteArea");

const noteTitle = document.getElementById("noteTitle");
const editor = document.getElementById("editor");
const noteDate = document.getElementById("noteDate");

const saveStatus = document.getElementById("saveStatus");

const addSubjectBtn = document.getElementById("addSubjectBtn");
const emptyAddSubjectBtn = document.getElementById("emptyAddSubjectBtn");

const addNoteBtn = document.getElementById("addNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const exportNoteBtn = document.getElementById("exportNoteBtn");

const subjectModal = document.getElementById("subjectModal");
const topicModal = document.getElementById("topicModal");
const confirmModal = document.getElementById("confirmModal");
const settingsModal = document.getElementById("settingsModal");

const subjectNameInput = document.getElementById("subjectNameInput");
const subjectColorInput = document.getElementById("subjectColorInput");

const topicNameInput = document.getElementById("topicNameInput");

const createSubjectBtn = document.getElementById("createSubjectBtn");
const createTopicBtn = document.getElementById("createTopicBtn");

const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");

const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const settingsBtn = document.getElementById("settingsBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const importDataBtn = document.getElementById("importDataBtn");
const importFile = document.getElementById("importFile");

const contextMenu = document.getElementById("contextMenu");
const renameContextBtn = document.getElementById("renameContextBtn");
const deleteContextBtn = document.getElementById("deleteContextBtn");

const fontSizeSelect = document.getElementById("fontSizeSelect");
const formatSelect = document.getElementById("formatSelect");
const linkBtn = document.getElementById("linkBtn");

const formatButtons = document.querySelectorAll(
    ".format-button[data-command]"
);


/* =========================
   DATA FUNCTIONS
========================= */

function createId(prefix = "id") {
    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 8)
    );
}


function defaultData() {
    return {
        version: 1,
        subjects: []
    };
}


function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return defaultData();
        }

        const parsed = JSON.parse(saved);

        if (!parsed || !Array.isArray(parsed.subjects)) {
            return defaultData();
        }

        return parsed;

    } catch (error) {
        console.error("Could not load StudyPlanner data:", error);
        return defaultData();
    }
}


function saveData(showIndicator = true) {

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        if (showIndicator) {
            showSaved();
        }

    } catch (error) {
        console.error("Could not save data:", error);

        saveStatus.textContent = "Couldn't save";
        saveStatus.style.color = "#ff453a";
    }
}


function scheduleSave() {

    saveStatus.textContent = "Saving…";
    saveStatus.style.color = "#777";

    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
        saveData();
    }, 250);
}


function showSaved() {

    saveStatus.textContent = "Saved";
    saveStatus.style.color = "#777";
}


/* =========================
   HELPERS
========================= */

function getSubject(id) {
    return data.subjects.find(subject => subject.id === id);
}


function getTopic(subject, id) {
    return subject?.topics?.find(topic => topic.id === id);
}


function getNote(topic, id) {
    return topic?.notes?.find(note => note.id === id);
}


function getCurrentSubject() {
    return getSubject(selectedSubjectId);
}


function getCurrentTopic() {
    const subject = getCurrentSubject();
    return getTopic(subject, selectedTopicId);
}


function getCurrentNote() {
    const topic = getCurrentTopic();
    return getNote(topic, selectedNoteId);
}


function getInitials(name) {

    const cleaned = name.trim();

    if (!cleaned) {
        return "???";
    }

    const letters = cleaned
        .replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, "")
        .replace(/\s+/g, "");

    return letters
        .slice(0, 3)
        .toUpperCase()
        .padEnd(3, "?");
}


function textFromHTML(html) {

    const temporary = document.createElement("div");

    temporary.innerHTML = html;

    return temporary.textContent
        .replace(/\s+/g, " ")
        .trim();
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "";
    }

    return new Date(timestamp).toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =========================
   RENDER
========================= */

function render() {

    renderSubjects();
    renderNoteArea();
}


function renderSubjects() {

    subjectsContainer.innerHTML = "";

    if (data.subjects.length === 0) {

        const message = document.createElement("div");

        message.style.padding = "30px 15px";
        message.style.color = "#555";
        message.style.fontSize = "12px";
        message.style.textAlign = "center";

        message.textContent = "No subjects yet.";

        subjectsContainer.appendChild(message);

        return;
    }


    data.subjects.forEach(subject => {

        const subjectWrapper = document.createElement("div");

        subjectWrapper.className = "subject";


        /* SUBJECT ROW */

        const subjectRow = document.createElement("div");

        subjectRow.className = "subject-row";


        const arrow = document.createElement("span");

        arrow.className = "arrow";

        if (subject.expanded) {
            arrow.classList.add("expanded");
        }

        arrow.textContent = "›";


        const badge = document.createElement("span");

        badge.className = "subject-badge";
        badge.textContent = getInitials(subject.name);

        badge.style.background = subject.color;


        const name = document.createElement("span");

        name.className = "subject-name";
        name.textContent = subject.name;


        const more = document.createElement("button");

        more.className = "more-button";
        more.textContent = "•••";
        more.title = "Subject options";


        subjectRow.append(
            arrow,
            badge,
            name,
            more
        );


        /* SUBJECT CLICK */

        subjectRow.addEventListener("click", event => {

            if (event.target === more) {
                return;
            }

            subject.expanded = !subject.expanded;

            selectedSubjectId = subject.id;

            selectedTopicId = null;
            selectedNoteId = null;

            scheduleSave();

            render();

        });


        more.addEventListener("click", event => {

            event.stopPropagation();

            openContextMenu(
                event.currentTarget,
                {
                    type: "subject",
                    id: subject.id
                }
            );

        });


        subjectWrapper.appendChild(subjectRow);


        /* TOPICS */

        if (subject.expanded) {

            const topicsContainer = document.createElement("div");

            topicsContainer.className = "topics expanded";


            subject.topics.forEach(topic => {

                const topicRow = document.createElement("div");

                topicRow.className = "topic-row";


                if (
                    selectedSubjectId === subject.id &&
                    selectedTopicId === topic.id
                ) {
                    topicRow.classList.add("active");
                }


                const topicArrow = document.createElement("span");

                topicArrow.className = "arrow";

                topicArrow.textContent = "›";


                const topicName = document.createElement("span");

                topicName.className = "topic-name";
                topicName.textContent = topic.name;


                const noteCount = document.createElement("span");

                noteCount.className = "topic-notes";

                if (topic.notes.length > 0) {
                    noteCount.textContent = topic.notes.length;
                }


                const topicMore = document.createElement("button");

                topicMore.className = "more-button";
                topicMore.textContent = "•••";
                topicMore.title = "Topic options";


                topicRow.append(
                    topicArrow,
                    topicName,
                    noteCount,
                    topicMore
                );


                topicRow.addEventListener("click", event => {

                    if (event.target === topicMore) {
                        return;
                    }

                    selectedSubjectId = subject.id;
                    selectedTopicId = topic.id;
                    selectedNoteId = null;

                    render();

                });


                topicMore.addEventListener("click", event => {

                    event.stopPropagation();

                    openContextMenu(
                        event.currentTarget,
                        {
                            type: "topic",
                            subjectId: subject.id,
                            id: topic.id
                        }
                    );

                });


                topicsContainer.appendChild(topicRow);


                /* NOTES */

                if (
                    selectedSubjectId === subject.id &&
                    selectedTopicId === topic.id
                ) {

                    const noteList = document.createElement("div");

                    noteList.className = "note-list";


                    topic.notes.forEach(note => {

                        const card = document.createElement("div");

                        card.className = "note-card";

                        if (selectedNoteId === note.id) {
                            card.classList.add("active");
                        }


                        const title = document.createElement("div");

                        title.className = "note-card-title";

                        title.textContent =
                            note.title.trim() ||
                            "Untitled Note";


                        const preview = document.createElement("div");

                        preview.className = "note-card-preview";

                        const previewText =
                            textFromHTML(note.content);

                        preview.textContent =
                            previewText ||
                            "No content";


                        const date = document.createElement("div");

                        date.className = "note-card-date";

                        date.textContent =
                            formatDate(note.updatedAt);


                        card.append(
                            title,
                            preview,
                            date
                        );


                        card.addEventListener("click", () => {

                            selectedNoteId = note.id;

                            render();

                        });


                        noteList.appendChild(card);

                    });


                    topicsContainer.appendChild(noteList);


                    /* ADD TOPIC / NOTE AREA */

                    const addTopicButton =
                        document.createElement("button");

                    addTopicButton.className =
                        "add-topic-button";

                    addTopicButton.textContent =
                        "+ Add Topic";


                    addTopicButton.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            selectedSubjectId = subject.id;

                            openModal(topicModal);

                        }
                    );


                    topicsContainer.appendChild(
                        addTopicButton
                    );

                }

            });


            /* ADD TOPIC WHEN NO TOPIC SELECTED */

            if (
                selectedSubjectId === subject.id &&
                selectedTopicId === null
            ) {

                const addTopicButton =
                    document.createElement("button");

                addTopicButton.className =
                    "add-topic-button";

                addTopicButton.textContent =
                    "+ Add Topic";


                addTopicButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        selectedSubjectId = subject.id;

                        openModal(topicModal);

                    }
                );


                topicsContainer.appendChild(
                    addTopicButton
                );

            }


            subjectWrapper.appendChild(
                topicsContainer
            );
        }


        subjectsContainer.appendChild(
            subjectWrapper
        );

    });
}


function renderNoteArea() {

    const note = getCurrentNote();

    if (!note) {

        emptyState.classList.remove("hidden");
        noteArea.classList.add("hidden");

        setEditorControls(false);

        deleteNoteBtn.disabled = true;
        exportNoteBtn.disabled = true;
        addNoteBtn.disabled =
            selectedTopicId === null;

        return;
    }


    emptyState.classList.add("hidden");
    noteArea.classList.remove("hidden");


    noteTitle.value =
        note.title || "Untitled Note";

    editor.innerHTML =
        note.content || "";

    noteDate.textContent =
        "Last edited " + formatDate(note.updatedAt);


    deleteNoteBtn.disabled = false;
    exportNoteBtn.disabled = false;
    addNoteBtn.disabled = false;

    setEditorControls(true);

    showSaved();
}


/* =========================
   SUBJECTS
========================= */

function openAddSubject() {

    subjectNameInput.value = "";

    subjectColorInput.value = "#ffffff";

    openModal(subjectModal);

    setTimeout(() => {
        subjectNameInput.focus();
    }, 50);
}


function createSubject() {

    const name =
        subjectNameInput.value.trim();

    if (!name) {
        subjectNameInput.focus();
        return;
    }


    const subject = {

        id: createId("subject"),

        name,

        color:
            subjectColorInput.value ||
            "#ffffff",

        expanded: true,

        topics: []

    };


    data.subjects.push(subject);

    selectedSubjectId = subject.id;
    selectedTopicId = null;
    selectedNoteId = null;


    saveData();

    closeModal(subjectModal);

    render();
}


/* =========================
   TOPICS
========================= */

function openAddTopic() {

    if (!selectedSubjectId) {
        return;
    }

    topicNameInput.value = "";

    openModal(topicModal);

    setTimeout(() => {
        topicNameInput.focus();
    }, 50);
}


function createTopic() {

    const subject =
        getCurrentSubject();

    if (!subject) {
        return;
    }


    const name =
        topicNameInput.value.trim();

    if (!name) {
        topicNameInput.focus();
        return;
    }


    const topic = {

        id: createId("topic"),

        name,

        notes: []

    };


    subject.topics.push(topic);

    subject.expanded = true;

    selectedTopicId = topic.id;
    selectedNoteId = null;


    saveData();

    closeModal(topicModal);

    render();
}


/* =========================
   NOTES
========================= */

function addNote() {

    const topic =
        getCurrentTopic();

    if (!topic) {
        return;
    }


    const now = Date.now();


    const note = {

        id: createId("note"),

        title: "Untitled Note",

        content: "",

        createdAt: now,

        updatedAt: now

    };


    topic.notes.unshift(note);

    selectedNoteId = note.id;


    saveData();

    render();


    setTimeout(() => {

        noteTitle.focus();

        noteTitle.select();

    }, 50);
}


function updateCurrentNote() {

    const note =
        getCurrentNote();

    if (!note) {
        return;
    }


    note.title =
        noteTitle.value.trim() ||
        "Untitled Note";


    note.content =
        editor.innerHTML;


    note.updatedAt =
        Date.now();


    scheduleSave();


    noteDate.textContent =
        "Last edited " +
        formatDate(note.updatedAt);


    updateCurrentNoteCard();
}


function updateCurrentNoteCard() {

    const card =
        document.querySelector(
            `.note-card.active`
        );

    const note =
        getCurrentNote();

    if (!card || !note) {
        return;
    }


    const title =
        card.querySelector(
            ".note-card-title"
        );

    const preview =
        card.querySelector(
            ".note-card-preview"
        );

    const date =
        card.querySelector(
            ".note-card-date"
        );


    title.textContent =
        note.title ||
        "Untitled Note";


    const previewText =
        textFromHTML(note.content);


    preview.textContent =
        previewText ||
        "No content";


    date.textContent =
        formatDate(note.updatedAt);
}


/* =========================
   DELETE
========================= */

function requestDeleteNote() {

    const note =
        getCurrentNote();

    if (!note) {
        return;
    }


    openConfirmation(
        "Delete this note?",
        `"${note.title || "Untitled Note"}" will be permanently deleted.`,
        () => {

            const topic =
                getCurrentTopic();

            topic.notes =
                topic.notes.filter(
                    item => item.id !== note.id
                );

            selectedNoteId = null;

            saveData();

            render();

        }
    );
}


function requestDeleteTarget() {

    if (!contextTarget) {
        return;
    }


    if (contextTarget.type === "subject") {

        const subject =
            getSubject(contextTarget.id);

        if (!subject) {
            return;
        }


        openConfirmation(
            "Delete subject?",
            `"${subject.name}" and all of its topics and notes will be permanently deleted.`,
            () => {

                data.subjects =
                    data.subjects.filter(
                        item =>
                            item.id !== subject.id
                    );


                if (
                    selectedSubjectId ===
                    subject.id
                ) {
                    selectedSubjectId = null;
                    selectedTopicId = null;
                    selectedNoteId = null;
                }


                saveData();

                render();

            }
        );

    }


    if (contextTarget.type === "topic") {

        const subject =
            getSubject(
                contextTarget.subjectId
            );

        const topic =
            getTopic(
                subject,
                contextTarget.id
            );

        if (!topic) {
            return;
        }


        openConfirmation(
            "Delete topic?",
            `"${topic.name}" and all of its notes will be permanently deleted.`,
            () => {

                subject.topics =
                    subject.topics.filter(
                        item =>
                            item.id !== topic.id
                    );


                if (
                    selectedTopicId ===
                    topic.id
                ) {
                    selectedTopicId = null;
                    selectedNoteId = null;
                }


                saveData();

                render();

            }
        );

    }
}


/* =========================
   RENAME
========================= */

function renameTarget() {

    if (!contextTarget) {
        return;
    }


    if (contextTarget.type === "subject") {

        const subject =
            getSubject(contextTarget.id);

        if (!subject) {
            return;
        }


        const newName =
            prompt(
                "Rename subject:",
                subject.name
            );


        if (
            newName !== null &&
            newName.trim()
        ) {

            subject.name =
                newName.trim();

            saveData();

            render();
        }

    }


    if (contextTarget.type === "topic") {

        const subject =
            getSubject(
                contextTarget.subjectId
            );

        const topic =
            getTopic(
                subject,
                contextTarget.id
            );

        if (!topic) {
            return;
        }


        const newName =
            prompt(
                "Rename topic:",
                topic.name
            );


        if (
            newName !== null &&
            newName.trim()
        ) {

            topic.name =
                newName.trim();

            saveData();

            render();
        }

    }
}


/* =========================
   RICH TEXT
========================= */

function setEditorControls(enabled) {

    formatButtons.forEach(button => {
        button.disabled = !enabled;
    });

    fontSizeSelect.disabled = !enabled;
    formatSelect.disabled = !enabled;
    linkBtn.disabled = !enabled;
}


function executeCommand(command, value = null) {

    if (!getCurrentNote()) {
        return;
    }

    editor.focus();

    document.execCommand(
        command,
        false,
        value
    );

    updateCurrentNote();
}


formatButtons.forEach(button => {

    button.addEventListener("click", () => {

        executeCommand(
            button.dataset.command
        );

    });

});


fontSizeSelect.addEventListener(
    "change",
    () => {

        executeCommand(
            "fontSize",
            fontSizeSelect.value
        );

    }
);


formatSelect.addEventListener(
    "change",
    () => {

        executeCommand(
            "formatBlock",
            formatSelect.value
        );

    }
);


linkBtn.addEventListener(
    "click",
    () => {

        if (!getCurrentNote()) {
            return;
        }


        const url =
            prompt(
                "Enter the link URL:"
            );


        if (!url) {
            return;
        }


        executeCommand(
            "createLink",
            url
        );

    }
);


/* =========================
   NOTE INPUT
========================= */

noteTitle.addEventListener(
    "input",
    updateCurrentNote
);


editor.addEventListener(
    "input",
    updateCurrentNote
);


/* =========================
   EXPORT NOTE
========================= */

function exportCurrentNote() {

    const note =
        getCurrentNote();

    if (!note) {
        return;
    }


    const subject =
        getCurrentSubject();

    const topic =
        getCurrentTopic();


    const safeTitle =
        (note.title || "Untitled Note")
        .replace(/[<>:"/\\|?*]+/g, "")
        .trim() ||
        "Untitled Note";


    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(safeTitle)}</title>

<style>
body {
    background: #ffffff;
    color: #111111;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Arial, sans-serif;
    max-width: 850px;
    margin: 60px auto;
    padding: 0 25px;
    line-height: 1.7;
}

h1 {
    font-size: 38px;
    line-height: 1.2;
}

.meta {
    color: #777;
    font-size: 13px;
    margin-bottom: 35px;
}

a {
    color: #06c;
}
</style>

</head>

<body>

<h1>${escapeHTML(note.title || "Untitled Note")}</h1>

<div class="meta">
    ${escapeHTML(subject?.name || "")}
    ${topic ? " • " + escapeHTML(topic.name) : ""}
    <br>
    Last edited ${escapeHTML(formatDate(note.updatedAt))}
</div>

<div>
    ${note.content || ""}
</div>

</body>
</html>`;


    const blob =
        new Blob(
            [html],
            { type: "text/html;charset=utf-8" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        safeTitle + ".html";


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* =========================
   FULL DATA EXPORT
========================= */

function exportAllData() {

    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            { type: "application/json" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "StudyPlanner-Backup.json";


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* =========================
   IMPORT DATA
========================= */

function importAllData(file) {

    const reader =
        new FileReader();


    reader.onload = event => {

        try {

            const imported =
                JSON.parse(
                    event.target.result
                );


            if (
                !imported ||
                !Array.isArray(
                    imported.subjects
                )
            ) {

                throw new Error(
                    "Invalid backup"
                );

            }


            openConfirmation(
                "Import backup?",
                "This will replace your current StudyPlanner data.",
                () => {

                    data = imported;

                    selectedSubjectId = null;
                    selectedTopicId = null;
                    selectedNoteId = null;

                    saveData();

                    render();

                }
            );

        } catch (error) {

            alert(
                "That file isn't a valid StudyPlanner backup."
            );

        }

    };


    reader.readAsText(file);
}


/* =========================
   MODALS
========================= */

function openModal(modal) {

    modal.classList.remove("hidden");

}


function closeModal(modal) {

    modal.classList.add("hidden");

}


document.querySelectorAll(
    "[data-close]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const modal =
                document.getElementById(
                    button.dataset.close
                );

            closeModal(modal);

        }
    );

});


function openConfirmation(
    title,
    message,
    action
) {

    confirmTitle.textContent =
        title;

    confirmMessage.textContent =
        message;


    confirmModal.classList.remove(
        "hidden"
    );


    confirmDeleteBtn.onclick = () => {

        closeModal(confirmModal);

        action();

    };

}


confirmCancelBtn.addEventListener(
    "click",
    () => closeModal(confirmModal)
);


document.querySelectorAll(
    ".modal-overlay"
).forEach(overlay => {

    overlay.addEventListener(
        "mousedown",
        event => {

            if (
                event.target === overlay
            ) {
                closeModal(overlay);
            }

        }
    );

});


/* =========================
   CONTEXT MENU
========================= */

function openContextMenu(
    element,
    target
) {

    contextTarget = target;

    const rect =
        element.getBoundingClientRect();


    contextMenu.style.left =
        `${Math.min(
            rect.right,
            window.innerWidth - 160
        )}px`;


    contextMenu.style.top =
        `${rect.bottom + 4}px`;


    contextMenu.classList.remove(
        "hidden"
    );
}


function closeContextMenu() {

    contextMenu.classList.add(
        "hidden"
    );

    contextTarget = null;
}


renameContextBtn.addEventListener(
    "click",
    () => {

        renameTarget();

        closeContextMenu();

    }
);


deleteContextBtn.addEventListener(
    "click",
    () => {

        requestDeleteTarget();

        closeContextMenu();

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            !contextMenu.contains(
                event.target
            )
        ) {
            closeContextMenu();
        }

    }
);


/* =========================
   SETTINGS
========================= */

settingsBtn.addEventListener(
    "click",
    () => openModal(settingsModal)
);


exportDataBtn.addEventListener(
    "click",
    exportAllData
);


importDataBtn.addEventListener(
    "click",
    () => importFile.click()
);


importFile.addEventListener(
    "change",
    () => {

        const file =
            importFile.files[0];

        if (file) {
            importAllData(file);
        }

        importFile.value = "";

    }
);


/* =========================
   BUTTON EVENTS
========================= */

addSubjectBtn.addEventListener(
    "click",
    openAddSubject
);


emptyAddSubjectBtn.addEventListener(
    "click",
    openAddSubject
);


createSubjectBtn.addEventListener(
    "click",
    createSubject
);


createTopicBtn.addEventListener(
    "click",
    createTopic
);


addNoteBtn.addEventListener(
    "click",
    addNote
);


deleteNoteBtn.addEventListener(
    "click",
    requestDeleteNote
);


exportNoteBtn.addEventListener(
    "click",
    exportCurrentNote
);


/* ENTER IN MODALS */

subjectNameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            createSubject();
        }

    }
);


topicNameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            createTopic();
        }

    }
);


/* =========================
   SIDEBAR RESIZING
========================= */

let resizing = false;


sidebarResizer.addEventListener(
    "pointerdown",
    event => {

        resizing = true;

        sidebarResizer.classList.add(
            "dragging"
        );

        sidebarResizer.setPointerCapture(
            event.pointerId
        );

    }
);


sidebarResizer.addEventListener(
    "pointermove",
    event => {

        if (!resizing) {
            return;
        }


        const width =
            Math.min(
                500,
                Math.max(
                    180,
                    event.clientX
                )
            );


        document.documentElement.style
            .setProperty(
                "--sidebar-width",
                `${width}px`
            );

    }
);


sidebarResizer.addEventListener(
    "pointerup",
    stopResizing
);


sidebarResizer.addEventListener(
    "pointercancel",
    stopResizing
);


function stopResizing() {

    resizing = false;

    sidebarResizer.classList.remove(
        "dragging"
    );

}


/* =========================
   KEYBOARD SHORTCUTS
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            (event.metaKey ||
             event.ctrlKey) &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            saveData();

        }

    }
);


/* =========================
   START
========================= */

render();