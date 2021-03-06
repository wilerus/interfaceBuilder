import Vue from 'vue';
import NavigationContainer from './NavigationView';
import PropertiesContainer from './PropertiesView';
import template from './templates/interfaceBuilder.vue';

export default Vue.extend({
    render: h => h(template),

    components: {
        'navigation-container': NavigationContainer,
        'properties-container': PropertiesContainer
    }
});
