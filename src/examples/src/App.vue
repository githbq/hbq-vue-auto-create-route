<template>
  <div>
    app root
    <div>
      <router-link  to="/demo-1/children">跳转到 /demo-1/children</router-link><br/>
       <router-link  to="/parent/son-2/son2-1/x/y">跳转到 /parent/son-2/son2-1/x/y</router-link>
    </div>
    <router-view /> 
  </div>
</template>