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
import { ref, computed } from "vue";
import api from "../../api"; // adjust path if needed

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "submitted"]);

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// form state
const title = ref("");
const priority = ref("medium");
const description = ref("");
const files = ref([]);
const previews = ref([]);
const errors = ref({ title: null });
const formError = ref(null);
const submitting = ref(false);
const fileInput = ref(null);
const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const status = ref("idle");
const errorInfo = ref(null);

function resetForm() {
  title.value = "";
  priority.value = "medium";
  description.value = "";
  files.value = [];
  previews.value.forEach((p) => {
    try {
      URL.revokeObjectURL(p.url);
    } catch {}
  });
  previews.value = [];
  errors.value = { title: null };
  formError.value = null;
  submitting.value = false;
}
defineExpose({ resetForm });

function onFilesSelected(e) {
  const selected = Array.from(e.target.files || []);
  if (selected.length === 0) return;
  handleNewFiles(selected);
  e.target.value = "";
}

function handleDrop(event) {
  const selectedFiles = Array.from(event.dataTransfer.files || []);
  handleNewFiles(selectedFiles);
}

function handleNewFiles(selectedFiles) {
  const images = selectedFiles.filter((f) => f.type?.startsWith("image/"));
  if (!images.length) return;

  const spaceLeft = Math.max(0, MAX_FILES - files.value.length);
  if (images.length > spaceLeft) {
    console.warn(`Max files (${MAX_FILES}) — only adding ${spaceLeft} more.`);
  }
  const toAdd = images.slice(0, spaceLeft);

  for (const f of toAdd) {
    if (f.size > MAX_FILE_SIZE) {
      console.warn(`File ${f.name} exceeds size limit and was skipped.`);
      continue;
    }
    files.value.push(f);
    const url = URL.createObjectURL(f);
    previews.value.push({ url, name: f.name, size: f.size });
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
  if (p && p.url) {
    try {
      URL.revokeObjectURL(p.url);
    } catch {}
  }
  previews.value.splice(index, 1);
  if (files.value && files.value.length > index) files.value.splice(index, 1);
}

function validate() {
  errors.value.title = title.value.trim() ? null : "Title is required.";
  return !errors.value.title;
}

// helper: convert a File to Data URL (returns Promise<string>)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Problem reading file"));
    };
    reader.onload = () => {
      resolve(reader.result); // Data URL string
    };
    reader.readAsDataURL(file);
  });
}

async function onSubmit() {
  // reset UI
  formError.value = null;
  status.value = "submitting";
  errorInfo.value = null;

  if (!validate()) {
    status.value = "validation-error";
    errorInfo.value = { message: "Please fix the form." };
    // emit validation result if you want parent to react (optional)
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
    // convert files -> data URLs (base64)
    const dataUrlPromises = (files.value || []).map((f) => fileToDataURL(f));
    const dataUrls = await Promise.all(dataUrlPromises);

    const payload = {
      title: title.value.trim(),
      priority: priority.value,
      description: description.value.trim(),
      images: dataUrls,
    };

    const res = await api.post("/tasks", payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 120000,
    });

    // success
    status.value = "success";
    errorInfo.value = {
      message: res.data?.message || "Task created",
      data: res.data,
    };

    // Emit structured payload for parent to show toast / update UI
    emit("submitted", {
      ok: true,
      status: res.status || 201,
      message: res.data?.message || "Task created",
      data: res.data || null,
    });

    // close modal and reset
    close();
  } catch (err) {
    console.error("create task error:", err);

    // derive useful info for parent
    const resp = err?.response;
    const code = resp?.status || null;
    const body = resp?.data || null;
    const message =
      body?.error ||
      body?.message ||
      (code === 413 ? "Uploaded images are too large." : err.message) ||
      "Failed to create task";

    // set local UI state
    status.value = code === 413 ? "payload-too-large" : "error";
    errorInfo.value = { message, details: body };

    // Emit structured failure so parent can show a toast or other UI
    emit("submitted", {
      ok: false,
      status: code,
      message,
      details: body,
    });
  } finally {
    submitting.value = false;
  }
}

function close() {
  resetForm();
  show.value = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
