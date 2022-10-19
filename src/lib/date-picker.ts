import { computed, defineComponent, h, PropType, ref, watch } from "vue";
import { IonGrid, IonInput, IonRow, IonCol, IonIcon } from "@ionic/vue";
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

    const isValidRange = (start: string, end: string) => {
      if(!start || !end) return false
      return new Date(start) <= new Date(end) ;
    }
    const cRange = computed(() => {
      if(isValidRange(start.value, end.value)) {
        return { startDate: start.value, endDate: end.value };
      }
    })

    watch(cRange, (newVal) => {
      if(newVal) {
        emit("rangeChange", newVal);
      }
    })

    return () => 
      h(IonGrid, { class: 'ion-no-padding ion-no-margin'}, 
        h(IonRow, [
          h(IonCol, { size: "6"}, 
            h(IonInput, { type: 'date', class: 'box-input', value: start.value, onIonInput: (e: Event) => start.value = (e.target as HTMLInputElement).value })
          ),
          h(IonCol, { size: '1', style: {display: "flex", justifyContent: "center "}},
            h(IonIcon, { icon: arrowForward, style: { fontSize: '24px', padding: '.5rem'}})
          ),
          h(IonCol, { size: "5"}, 
            h(IonInput, { type: 'date', class: 'box-input', value: start.value, onIonInput: (e: Event) => end.value = (e.target as HTMLInputElement).value })
          ),
        ])
      );
  },
})