
export default {
    state: {
        items: [
            { title: 'Dashboard', icon: 'dashboard' },
            { title: 'Account', icon: 'account_box' },
            { title: 'Admin', icon: 'gavel' }
        ]
    },
    mutations: {
        increment(state) {
            state.count++;
        }
    }
};
