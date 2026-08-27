/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2022 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */
<script setup lang="ts">
import BatonField from "@/components/baton-field/baton-field.vue";
</script>

<template>
  <baton-field />
</template>

<style lang="scss">
html, body, #app {
  margin: 0;
  width: 100%;
  min-height: 100%;
}
body {
  overflow: auto;
  background: #0b1015;
}
* { box-sizing: border-box; }
</style>
