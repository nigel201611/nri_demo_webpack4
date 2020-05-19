<!--
 * @Author: nigel
 * @Date: 2020-05-15 15:40:20
 * @LastEditTime: 2020-05-15 15:40:20
 -->
<template>
  <div>
    {{ count }}
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  },

  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>