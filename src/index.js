import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import RouterConfiguration from './RouterConfiguration';
import ApplicationStore from './ApplicationStore';
import '../resources/main.css';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import template from './indexTemplate.html';

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(Vuetify);

const router = new VueRouter({
    routes: RouterConfiguration
});

const store = new Vuex.Store(ApplicationStore);

new Vue({
    router,
    store,
    el: '#app',
    template,
    computed: {
        items() {
            return this.$store.state.items;
        }
    },
    data: () => ({
        dark: true,
        floating: true,
        height: '33%'
    })
});
