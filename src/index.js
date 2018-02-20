import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

Vue.use(VueRouter);
Vue.use(Vuex);

const Foo = {
    template: '<div>foo</div>',
    created() {
        console.log(123);
    }
};
const Bar = {
    template: '<div>bar</div>',
    created() {
        console.log(456);
    }
};

const routes = [
    { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
];

const router = new VueRouter({
    routes
});

new Vue({
    router,
    el: '#app'
});
