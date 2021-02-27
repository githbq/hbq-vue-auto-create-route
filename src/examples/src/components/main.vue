<template>
  <div>
    <div>主框架页面组件</div> 
    <router-view />
  </div>
</template>

<script>
import routes from "@/router/temp.router.js";
export default {
  data() {
    return {
      routes,
    };
  },
};
</script>