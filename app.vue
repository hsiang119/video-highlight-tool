<template>
  <div class="bg-gradient-to-br from-[#0a0f1e] to-[#1a0a2e] min-h-screen text-[#E0E0E0]">
    <NuxtPage />
  </div>
</template>

<style>
body {
    font-family: 'Inter', sans-serif;
    background: #0a0f1e;
}
.font-mono {
    font-family: 'Roboto Mono', monospace;
}
:root {
    --primary-glow: 0 0 15px rgba(0, 255, 255, 0.6), 0 0 5px rgba(0, 255, 255, 0.8);
    --primary-color: #00FFFF;
}
.glass-pane {
    background: rgba(16, 24, 48, 0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 255, 255, 0.2);
}
/* Custom Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: rgba(0, 255, 255, 0.05);
}
::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 255, 0.4);
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 255, 0.7);
}
</style>