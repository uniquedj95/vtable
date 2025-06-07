import { computed, defineComponent, h, PropType, ref, watch } from "vue";
import { IonGrid, IonInput, IonRow, IonCol, IonIcon, toastController } from "@ionic/vue";
import { arrowForward } from "ionicons/icons";

export const DateRangePicker =  defineComponent({
  props: {
    range: {
      type: Object as PropType<{startDate: string; endDate: string}>,
      default: () => ({ startDate: "", endDate: "" }),
    },

  },
  emits: ["rangeChange"],
  setup (props, { emit }) {
    const start = ref(props.range.startDate);
    const end = ref(props.range.endDate);
    const cRange = computed(() => ({ startDate: start.value, endDate: end.value }))
    watch(cRange, (v) => emit("rangeChange", v))
    return () => 
      h(IonGrid, { class: 'ion-no-padding ion-no-margin'}, 
        () => h(IonRow, [
          h(IonCol, { size: "6"}, 
            () => h(IonInput, { type: 'date', class: 'box-input', value: start.value, onIonInput: (e: Event) => start.value = (e.target as HTMLInputElement).value, style: { width: "100%"}})
          ),
          h(IonCol, { size: '1', style: {display: "flex", justifyContent: "center "}},
            () => h(IonIcon, { icon: arrowForward, style: { fontSize: '24px', padding: '.5rem'}})
          ),
          h(IonCol, { size: "5"}, 
            () => h(IonInput, { type: 'date', class: 'box-input', value: end.value, onIonInput: (e: Event) => end.value = (e.target as HTMLInputElement).value, style: { width: "100%"}})
          ),
        ])
      );
  },
})