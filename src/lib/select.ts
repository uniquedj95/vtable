import { IonCheckbox, IonChip, IonIcon, IonInput, IonItem, IonLabel, IonList, IonNote } from "@ionic/vue";
import { computed, defineComponent, h, onBeforeUnmount, onMounted, PropType, ref, watch } from "vue";
import { Option } from "./types"
import { chevronDown, chevronUp, close, closeCircle } from "ionicons/icons"
import { isEmpty } from "lodash";

export const SelectInput = defineComponent({
  name: "SelectInput",
  props: {
    value: {
      type: Object as PropType<Option | Option[]>,
      default: () => ({}),
    },
    label: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "Select Option"
    },
    options: {
      type: Array as PropType<Option[]>,
      default: () => [],
    },
    asyncOptions: {
      type: Function as PropType<(filter: string) => Promise<Option[]>>,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    validate: {
      type: Function as PropType<(value: Option | Option[]) => Promise<false | null | string[]>>,
      required: false
    }
  },
  components: {
    IonLabel,
    IonInput,
    IonNote,
    IonIcon,
    IonCheckbox,
    IonList,
    IonChip,
    IonItem
  },
  emits: ["select"],
  setup(props, { emit}) {
    const selectedOption = ref<Option>();
    const canShowOptions = ref(false)
    const filter = ref('')
    const filteredOptions = ref<Option[]>([])
    const errs = ref("")
    const errorClass = computed(() => errs.value ? "box-input-error" : "")
    const marginTop = computed(() => props.label ? "ion-margin-top" : "")

    const tags = computed<Option[]>(() => {
      if(props.multiple) return filteredOptions.value.filter(({ isChecked }) => isChecked)
      return selectedOption.value ? [ selectedOption.value ] : []
    })

    const showPlaceholder = computed(() => {
      return !filter.value && isEmpty(tags.value) &&  !canShowOptions.value
    })

    const model = computed({
      get: () => props.value,
      set: (value) => emit("select", value)
    })

    const setDefaults = () => {
      selectedOption.value = undefined
      if(isEmpty(model.value)) return
      if (Array.isArray(model.value) && props.multiple) {
        model.value.forEach(option => {
          const index = filteredOptions.value.findIndex(({ value }: Option) => value === option.value)
          if(index === -1) {
            filteredOptions.value.push({...option, isChecked: true})
          } else {
            filteredOptions.value[index].isChecked = true
          }
        })
      } 
      selectedOption.value = filteredOptions.value.find(option => {
        if(Array.isArray(model.value)) return option.value === model.value[0].value
        return option.value === model.value.value
      })
      if (isEmpty(selectedOption.value))  {
        selectedOption.value = Array.isArray(model.value) ? model.value[0] : model.value
      }
    }

    const filterOptions = async () => {
      const filtered = typeof props.asyncOptions === 'function' 
        ? await props.asyncOptions(filter.value)
        : props.options.filter(({ label }) => label.toLowerCase().includes(filter.value.toLowerCase()))

      tags.value.forEach(tag => {
        const index = filtered.findIndex(f => f.value === tag.value)
        if(index === -1) filtered.push(tag)
        else filtered[index].isChecked = true
      })
      
      filteredOptions.value = filtered
    }

    const validate = async () => {
      if (props.required && isEmpty(model.value)) {
        return errs.value = "This field is required";
      }
      if (typeof props.validate === 'function') {
        const errors = await props.validate(model.value);
        if (errors && errors.length) {
          errs.value = errors.join(', ');
        }
      }
      return errs.value = ""
    };

    const onCloseOptions = () => {
      canShowOptions.value = false;
      model.value = props.multiple ? tags.value : !isEmpty(tags.value) ? tags.value[0] : {} as Option
      filter.value = ''
      validate()
    }

    const showOptions = () => {
      if(props.disabled) return
      canShowOptions.value = true
      errs.value = ''
    }

    const selectOption = (item: Option) => {  
      if(!props.multiple) {
        selectedOption.value = item
        return onCloseOptions()
      }
      model.value = props.multiple ? tags.value : !isEmpty(tags.value) ? tags.value[0] : {} as Option
      filter.value = ''
    }

    const diselectOption = (tag: Option) => {
      if(props.multiple) return tag.isChecked = false
      return selectedOption.value = undefined
    }

    const onReset = () => {
      filter.value = '';
      selectedOption.value = undefined;
      filteredOptions.value.forEach(option => option.isChecked = false)
    }

    watch([filter, () => props.options, () => props.asyncOptions], async () => filterOptions())
    watch(() => props.value, (v) => setDefaults())

    onMounted(async () => {
      await filterOptions()
      setDefaults()
      addEventListener('click', (e: any) => {
        const isClosest = e.target.closest('.inner-input-box')
        if(!isClosest && canShowOptions.value) {
          onCloseOptions()
        }
      })
    });

    onBeforeUnmount(() => removeEventListener('click', e => console.log(e)))

    return () => [
      props.label && h(IonLabel, { class: "ion-padding-bottom bold"}, props.label),
      h("div", { class: `outer-input-box box-input ${errorClass.value} ${marginTop.value}`}, 
        h("div", { class: "inner-input-box"}, [
          h("div", { style: { display: 'flex', flexWrap: 'wrap', width: '100%'}, onClick: showOptions }, [
            ...tags.value.map(tag => h(IonChip, [
              h(IonLabel, tag.label),
              h(IonIcon, { icon: closeCircle, color: 'danger', onClick: () => diselectOption(tag), style: { zIndex: 90 }})
            ])),
            h(IonInput, { 
              disabled: props.disabled, 
              placeholder: showPlaceholder.value ? props.placeholder : '',
              class: "search-input",
              value: filter.value,
              onIonInput: (e: Event) => filter.value = (e.target as HTMLInputElement).value
            })
          ]),
          canShowOptions.value && h("div", { class: "input-options" }, 
            h(IonList, filteredOptions.value.map((option, i) => 
              h(IonItem, { 
                lines: i + 1 === filteredOptions.value.length ? 'none' : '',
                onClick: () => selectOption(option)
              }, 
              [
                props.multiple && h(IonCheckbox, { 
                  class: "input-option-checkbox",
                  slot: "start",
                  value: option.isChecked,
                  onIonInput: (e: Event) => option.isChecked = (e.target as HTMLInputElement).checked
                }),
                h(IonLabel, option.label)
              ])
            ))
          ),
          h("div", { class: "input-icon"}, [
            (filter.value || tags.value.length) && h(IonIcon, { icon: close, onClick: onReset }),
            h(IonIcon, { 
              icon: canShowOptions.value ? chevronUp : chevronDown, 
              onClick: canShowOptions.value ? onCloseOptions : showOptions
            })
          ].filter(Boolean))
        ])
      ),
      errs.value && h(IonNote, { color: "danger" }, errs.value)
    ]
  }
});