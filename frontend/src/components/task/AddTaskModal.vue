<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="close"></div>

      <div class="relative bg-white rounded-lg w-full max-w-2xl p-6 z-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold underline decoration-blue-600">
            Add Task
          </h2>
          <button
            @click="close"
            class="text-black underline hover:text-gray-900"
          >
            Go Back
          </button>
        </div>

        <div v-if="formError" class="text-red-600 bg-red-50 p-2 rounded mb-3">
          {{ formError }}
        </div>

        <form
          @submit.prevent="onSubmit"
          method="post"
          enctype="multipart/form-data"
          class="space-y-3"
        >
          <div>
            <label class="block text-sm font-medium mb-1">Title *</label>
            <input
              v-model="title"
              type="text"
              placeholder="Task title"
              class="w-9/10 p-2 border-2 border-gray-400 rounded outline-0"
            />
            <p v-if="errors.title" class="text-xs text-red-500 mt-1">
              {{ errors.title }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Priority</label>
            <div class="flex gap-4 mt-1">
              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  value="low"
                  :checked="priority === 'low'"
                  @change="priority = 'low'"
                />
                Low
              </label>

              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  value="medium"
                  :checked="priority === 'medium'"
                  @change="priority = 'medium'"
                />
                Medium
              </label>

              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  value="high"
                  :checked="priority === 'high'"
                  @change="priority = 'high'"
                />
                High
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="description"
              rows="4"
              class="p-2 border-2 rounded border-gray-400 w-9/10 outline-0"
              placeholder="Describe the task"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Upload Images</label>

            <!-- Custom Upload Area -->
            <div
              class="w-9/10 border-2 border-dashed border-gray-300 rounded-2xl p-2 text-center cursor-pointer hover:border-blue-400 transition"
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
              role="button"
              tabindex="0"
            >
              <div class="flex flex-col items-center justify-center gap-2">
                <i class="fa-regular fa-image text-xl text-blue-500"></i>

                <p class="text-sm text-gray-500" v-if="previews.length === 0">
                  <span class="font-medium text-blue-600">Drag & Drop</span>
                  your files here
                  <br />
                  or click below to browse
                </p>

                <p class="text-sm text-gray-500" v-else>
                  {{ previews.length }} file{{ previews.length > 1 ? "s" : "" }}
                  selected — add more or remove
                </p>

                <button
                  type="button"
                  @click.stop="triggerFileInput"
                  class="bg-blue-600 text-white px-4 py-1.5 text-sm rounded hover:bg-blue-700"
                >
                  Browse Files
                </button>
              </div>
            </div>

            <!-- Hidden File Input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onFilesSelected"
            />

            <!-- Preview Images -->
            <div v-if="previews.length" class="flex gap-2 mt-3 flex-wrap">
              <div v-for="(p, i) in previews" :key="i" class="relative">
                <img
                  :src="p.url"
                  class="w-20 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  @click="removePreview(i)"
                  class="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              @click="close"
              class="px-3 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
            >
              <span v-if="submitting">Saving…</span>
              <span v-else>Done</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import api from "../../api"; // keep if you use direct api

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initial: { type: [Object, null], default: null },
});
const emit = defineEmits(["update:modelValue", "submitted"]);

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const taskStore = useTaskStore();

// form state
const title = ref("");
const priority = ref("medium");
const description = ref("");
const previews = ref([]); // array of { url, isNew: boolean, file?: File, name?, size? }
const errors = ref({ title: null });
const formError = ref(null);
const submitting = ref(false);
const fileInput = ref(null);

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function resetForm() {
  title.value = "";
  priority.value = "medium";
  description.value = "";
  // revoke objectURLs for new previews
  previews.value.forEach((p) => {
    if (p.isNew && p.url) {
      try {
        URL.revokeObjectURL(p.url);
      } catch {}
    }
  });
  previews.value = [];
  errors.value = { title: null };
  formError.value = null;
  submitting.value = false;
}
defineExpose({ resetForm });

// populate when opening or when initial changes
const prevShow = ref(Boolean(props.modelValue));
let prevInitialJson = null;
try {
  prevInitialJson = props.initial ? JSON.stringify(props.initial) : null;
} catch {
  prevInitialJson = props.initial;
}

function populateFromInitial() {
  const t = props.initial;
  if (!t) {
    resetForm();
    return;
  }
  title.value = t.title ?? "";
  priority.value = t.priority ?? "medium";
  description.value = t.description ?? "";

  // fill previews with existing image urls (isNew: false)
  previews.value = [];
  const existing = t.image_path ?? t.images ?? t.imageUrl ?? null;
  if (existing) {
    let arr = [];
    if (Array.isArray(existing)) arr = existing;
    else if (typeof existing === "string") {
      try {
        const parsed = JSON.parse(existing);
        arr = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        arr = [existing];
      }
    }
    for (const u of arr) {
      if (u) previews.value.push({ url: u, isNew: false });
    }
  }
}

onMounted(() => {
  if (props.modelValue) populateFromInitial();
});

onUpdated(() => {
  // detect modal opening false->true
  if (!prevShow.value && props.modelValue) {
    populateFromInitial();
  }
  // detect modal closed -> reset
  if (prevShow.value && !props.modelValue) {
    resetForm();
  }
  prevShow.value = Boolean(props.modelValue);

  // deep-ish compare initial prop change
  let currInitialJson = null;
  try {
    currInitialJson = props.initial ? JSON.stringify(props.initial) : null;
  } catch {
    currInitialJson = props.initial;
  }
  if (currInitialJson !== prevInitialJson) {
    if (props.modelValue) populateFromInitial();
    prevInitialJson = currInitialJson;
  }
});

// file handling
const onFilesSelected = (e) => {
  const selected = Array.from(e.target.files || []);
  if (!selected.length) return;
  handleNewFiles(selected);
  e.target.value = "";
};

function handleDrop(event) {
  const selectedFiles = Array.from(event.dataTransfer.files || []);
  handleNewFiles(selectedFiles);
}

function handleNewFiles(selectedFiles) {
  const images = selectedFiles.filter((f) => f.type?.startsWith("image/"));
  if (!images.length) return;

  // enforce limit based on previews (existing + new)
  const spaceLeft = Math.max(0, MAX_FILES - previews.value.length);
  const toAdd = images.slice(0, spaceLeft);

  for (const f of toAdd) {
    if (f.size > MAX_FILE_SIZE) {
      console.warn(`File ${f.name} exceeds size limit and was skipped.`);
      continue;
    }
    const url = URL.createObjectURL(f);
    // store file and mark preview as new
    previews.value.push({
      url,
      name: f.name,
      size: f.size,
      isNew: true,
      file: f,
    });
  }
}

function triggerFileInput() {
  if (!fileInput.value) {
    console.warn("fileInput ref not found");
    return;
  }
  fileInput.value.click();
}

function removePreview(index) {
  const p = previews.value[index];
  if (!p) return;
  if (p.isNew && p.url) {
    try {
      URL.revokeObjectURL(p.url);
    } catch {}
  }
  // remove preview (we keep previews as single source-of-truth)
  previews.value.splice(index, 1);
}

function validate() {
  errors.value.title = title.value.trim() ? null : "Title is required.";
  return !errors.value.title;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Problem reading file"));
    };
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// submit: build image_path from previews (existing urls + base64 for new)
async function onSubmit() {
  formError.value = null;
  if (!validate()) {
    emit("submitted", {
      ok: false,
      status: 400,
      message: "Validation failed",
      details: errors.value,
    });
    return;
  }

  submitting.value = true;
  try {
    // debug snapshot
    console.log(
      "[DEBUG] onSubmit - previews before build:",
      previews.value.map((p) => ({
        name: p.name,
        isNew: !!p.isNew,
        hasFile: !!p.file,
        urlPreview: String(p.url).slice(0, 60),
      }))
    );

    // Primary source: previews (existing URLs + newly added files)
    const finalImages = [];

    // keep existing saved urls (isNew === false)
    for (const p of previews.value) {
      if (!p.isNew && p.url) finalImages.push(p.url);
    }

    // Convert new previews to base64 (if any)
    const newPreviews = previews.value.filter((p) => p.isNew && p.file);
    if (newPreviews.length) {
      try {
        const base64s = await Promise.all(
          newPreviews.map((p) => fileToDataURL(p.file))
        );
        for (const b of base64s) if (b) finalImages.push(b);
      } catch (convErr) {
        console.error(
          "[DEBUG] Error converting newPreviews to base64:",
          convErr
        );
        // fallthrough to fallback attempt
      }
    }

    // FALLBACK: if finalImages still empty, try fileInput.files (raw input element)
    if (
      finalImages.length === 0 &&
      fileInput.value &&
      fileInput.value.files &&
      fileInput.value.files.length
    ) {
      console.warn(
        "[DEBUG] finalImages empty - falling back to fileInput.files conversion."
      );
      const filesFromInput = Array.from(fileInput.value.files);
      try {
        const base64s = await Promise.all(
          filesFromInput.map((f) => fileToDataURL(f))
        );
        for (const b of base64s) if (b) finalImages.push(b);
      } catch (convErr2) {
        console.error("[DEBUG] fallback conversion failed:", convErr2);
      }
    }

    // FINAL SAFETY: if still empty and user expects an image, at least send empty array instead of undefined
    // (server-side logic may convert [] -> null; that's okay)
    console.log("[DEBUG] finalImages count:", finalImages.length);

    const payload = {
      title: title.value.trim(),
      priority: priority.value,
      description: description.value.trim(),
      image_path: finalImages, // always present (possibly empty array)
    };

    // DEBUG: show payload BEFORE sending
    // (for large base64 arrays this will be big — but it's temporary to debug)
    console.log(
      "[DEBUG] payload about to send (image count):",
      payload.image_path.length
    );

    // SEND: for create or update
    let res;
    if (props.initial && props.initial.id) {
      res = await taskStore.updateTask(props.initial.id, payload);
      emit("submitted", { ok: true, status: 200, data: res });
    } else {
      res = await taskStore.createTask(payload);
      emit("submitted", { ok: true, status: res?.status ?? 201, data: res });
    }

    // close modal
    show.value = false;
  } catch (err) {
    console.error("create/update task error:", err);
    const resp = err?.response;
    const code = resp?.status || null;
    const body = resp?.data || null;
    const message =
      body?.error || body?.message || err.message || "Failed to save task";
    formError.value = message;
    emit("submitted", { ok: false, status: code, message, details: body });
  } finally {
    submitting.value = false;
  }
}

function close() {
  resetForm();
  show.value = false;
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
