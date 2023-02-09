import Multiselect from "./components/Multiselect";
import uberon from "./fields/uberon";
import ncbitaxon from "./fields/ncbitaxon";

export default {
  register(app) {
    app.plugins["content-type-builder"].apis.forms.components.add({
      id: "multiselect",
      component: Multiselect,
    });

    app.customFields.register(uberon);
    app.customFields.register(ncbitaxon);
  },
};
