<template>
  <q-item
    v-ripple
    class="drawer-item nav-3d-item"
    :class="$q.screen.lt.md ? 'inline-block q-mx-xs' : 'nav-3d-item--desktop'"
    :to="link"
    active-class="text-system-primary nav-3d-item--active"
    clickable
    exact
    @mousemove="onMagneticMove($event, 0.2)"
    @mouseleave="onMagneticLeave"
  >
    <q-item-section class="text-center items-center">
      <div class="nav-icon-orb flex flex-center q-mb-xs">
        <q-icon :name="icon" size="22px" />
      </div>
      <q-item-label class="text-caption text-bold nav-item-label">
        {{ title }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";
import { useGsap3D } from "src/composables/gsap-3d";

export default defineComponent({
  name: "MenuItem",
  props: {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "#",
    },
    icon: {
      type: String,
      default: "",
    },
  },
  setup() {
    const { onMagneticMove, onMagneticLeave } = useGsap3D();
    return {
      onMagneticMove,
      onMagneticLeave,
    };
  },
});
</script>

<style lang="scss" scoped>
.nav-3d-item {
  border-radius: 14px;
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;

  &--desktop {
    margin: 12px 4px !important;
    padding: 10px 6px !important;
  }

  .nav-icon-orb {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: rgba(164, 255, 145, 0.06);
    border: 1px solid rgba(164, 255, 145, 0.16);
    transition: all 0.3s ease;
  }

  &:hover .nav-icon-orb {
    border-color: var(--q-color-lemon-green);
    transform: translateY(-2px);
  }
}

.body--dark .nav-3d-item--active {
  background: linear-gradient(
    145deg,
    rgba(164, 255, 145, 0.16),
    rgba(82, 211, 121, 0.06)
  );
  border-color: rgba(164, 255, 145, 0.35);
  box-shadow: 0 6px 18px rgba(82, 211, 121, 0.16);

  .nav-icon-orb {
    background: rgba(164, 255, 145, 0.2);
    border-color: #a4ff91;
    box-shadow: 0 0 12px rgba(164, 255, 145, 0.35);
  }
}

.body--light .nav-3d-item {
  .nav-icon-orb {
    background: rgba(76, 119, 83, 0.08);
    border: 1px solid rgba(76, 119, 83, 0.18);
  }
}

.body--light .nav-3d-item--active {
  background: linear-gradient(
    145deg,
    rgba(76, 119, 83, 0.18),
    rgba(82, 211, 121, 0.08)
  );
  border-color: rgba(76, 119, 83, 0.35);
  box-shadow: 0 6px 16px rgba(76, 119, 83, 0.15);

  .nav-icon-orb {
    background: rgba(76, 119, 83, 0.2);
    border-color: #4c7753;
  }
}
</style>
