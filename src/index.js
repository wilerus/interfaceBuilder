import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import RouterConfiguration from './RouterConfiguration';
import ApplicationStore from './ApplicationStore';

Vue.use(VueRouter);
Vue.use(Vuex);

const router = new VueRouter({
    routes: RouterConfiguration
});

const store = new Vuex.Store(ApplicationStore);

new Vue({
    router,
    store,
    el: '#app'
});
