<template>
  <header
    class="flex sticky top-0 left-0 items-center justify-between md:justify-evenly h-20 shadow px-5 z-10 bg-white"
  >
    <div class="">
      <a href="#">
        <h1 class="text-xl md:text-3xl font-medium">
          <span class="text-blue-600">To</span>-Do
        </h1>
      </a>
    </div>
    <div class="flex items-center gap-2 w-3/6">
      <input
        type="text"
        v-model="searchTask"
        @keyup.enter="emitSearch"
        class="rounded shadow px-2 h-8 w-5/6 md:h-10 md:w-6/7 text-xs md:text-sm"
        placeholder="Search your tasks here"
      />
      <button
        @click="emitSearch"
        class="bg-blue-600 rounded-lg md:rounded-xl p-1 md:px-3 md:py-2 text-white shadow-md cursor-pointer"
        aria-label="Search tasks"
      >
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>

    <div class="hidden md:flex md:items-center gap-3">
      <button
        class="text-white bg-blue-600 rounded-xl h-8 w-8 cursor-pointer"
        aria-label="Notifications"
      >
        <i class="fa-solid fa-bell"></i>
      </button>
      <button
        class="text-white bg-blue-600 rounded-xl h-8 w-8 cursor-pointer"
        aria-label="Calendar"
      >
        <i class="fa-solid fa-calendar-days"></i>
      </button>
      <div class="md:flex md:flex-col">
        <p class="font-medium">{{ day }}</p>
        <p class="text-blue-400">{{ date }}</p>
      </div>
    </div>

    <button class="z-50 md:hidden" @click="toggleOpen">
        <i v-if="open === false" class="fa-solid fa-bars"></i>
        <i v-else class="fa-solid fa-xmark text-white"></i>
      </button>
  </header>
</template>

<script setup></script>

<style scoped></style>
