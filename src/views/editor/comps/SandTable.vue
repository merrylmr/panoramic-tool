<template>
  <div class="sand-table">
    <div class="v-title">电子沙盘</div>


    <v-text-field
        label="图片地址"
        placeholder="请输入图片地址"
        v-model="form.url"
        @change="changeHandle">
    </v-text-field>


    <div class="mt-2">
      <v-btn color="primary"
             @click="addMakerHandle">添加标记点
      </v-btn>

      <div class="marker-list mt-2">
        <div class="marker-item"
             v-for="(item,index) in sandTable.markers"
             :key="index"
             :class="{'is-active':index===activeIndex}"
             @click="clickMarkerHandle(index,item)">
          <span><span class="circle"></span>
          {{ item.name }}</span>
          <div class="marker-item__del"
               @click="delMarkerHandle(index)">
            删除
          </div>
        </div>
      </div>
    </div>
    <SceneDlg
        v-if="isShowSceneDlg"
        :visible="isShowSceneDlg"
        :doc="doc"
        :scene-id="form.value"
        :checked="checkedSceneIds"
        @close="isShowSceneDlg=false"
        @sure="sureHandle">
    </SceneDlg>
  </div>
</template>

<script lang="ts">
import SceneDlg from './Scene.vue'
import {defineComponent, reactive, toRefs, computed, onMounted} from "vue";
import {cloneDeep as _cloneDeep} from 'lodash'
import type {Marker} from "@/custom_types";

interface Props {
  form: {
    url: string,
    markers: Marker[]
  };
  isShowSceneDlg: boolean;
}

export default defineComponent({
  name: 'sand-table',
  props: {
    sandTable: {
      type: Object,
      default: () => {
        return {
          url: '',
          markers: []
        }
      }
    },
    doc: {
      type: Object,
      default: () => {
        return {
          scenes: []
        }
      }
    },
    activeIndex: {
      type: Number
    }
  },
  components: {SceneDlg},
  setup(props, context) {
    const data: Props = reactive({
      form: {
        url: '',
        markers: []
      },
      isShowSceneDlg: false,
    })
    const checkedSceneIds = computed(() => {
      const markers = props.sandTable.markers;
      return markers.map((item: { sceneId: any; }) => {
        return item.sceneId
      })
    })
    const changeHandle = () => {
      context.emit('change', data.form)
    }
    const addMakerHandle = () => {
      data.isShowSceneDlg = true;
    }
    const sureAddMarker = (x: { id: any; name: any; }) => {
      // 弹窗：场景列表
      const dom = document.getElementById('sandTableBox');
      const rect = dom?.getBoundingClientRect();
      data.form.markers.push({
        pos: {
          x: rect ? rect.width / 2 : 0,
          y: rect ? rect.height / 2 : 0,
        }, // 位置
        angle: 0, // 角度
        sceneId: x.id,
        name: x.name,
      })
    }
    const clickMarkerHandle = (index: number, item: Marker) => {
      context.emit('changeIndex', index, item)
    }
    const delMarkerHandle = (index: number) => {
      const sandTableClone = _cloneDeep(props.sandTable);
      sandTableClone.markers.splice(index, 1)
      context.emit('change', sandTableClone)
    }
    const sureHandle = (x: { id: any; name: string; }) => {
      data.isShowSceneDlg = false;
      if (x && x.id) {
        sureAddMarker(x);
      }
    }
    onMounted(() => {
      // @ts-ignore
      data.form = props.sandTable;
    })
    return {
      ...toRefs(data),
      checkedSceneIds,
      changeHandle,
      addMakerHandle,
      clickMarkerHandle,
      delMarkerHandle,
      sureHandle,
    }
  }
});
</script>

<style scoped lang="scss">
.v-title {
  font-size: 16px;
  padding: 10px 5px;
}

.marker-item {
  padding: 10px;
  cursor: pointer;
  @include flex(space-between, center);

  &.is-active {
    .circle {
      background-color: $--color-primary;
    }
  }

  &:hover {
    background-color: #fafafa;

    .marker-item__del {
      opacity: 1;
    }
  }

  .circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #eee;
    display: inline-block;
  }

  &__del {
    opacity: 0;
  }
}
</style>
