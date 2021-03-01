
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './temp.router.js'

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        ...routes
    ],
    mode: 'history'
})