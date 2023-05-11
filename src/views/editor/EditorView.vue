<script lang="ts">
import type {Doc, Pos, Hot, menuItem, SceneData, Marker} from '@/custom_types/index'
import {defineComponent, onMounted, onUnmounted, reactive, toRefs, computed, nextTick, ref} from 'vue'
// @ts-ignore
import docJSon from 'json/doc.json'
import {pointInSceneView, screenVector2World, worldVector2Screen} from './common'
import {ICON_MAP, SYS_ICON_MAP1} from '@/assets/js/const'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Camera, Mesh, Scene, Texture, WebGLRenderer} from 'three'
import * as lodash from 'lodash'
import {useRouter, useRoute} from 'vue-router'
import HotSpot from "@/views/editor/comps/HotSpot.vue";
import SandTable from "@/views/editor/comps/SandTable.vue";
import PreviewDlg from "@/views/editor/comps/Preview.vue";
import html2canvas from "html2canvas";
interface Props {
  doc: Doc
  activeName: String
  uniqueId: string
  isLoading: Boolean
  activePoint: any
  activeIndex: number
  activeMarkerIndex: number
  params: any
  isShowPreviewDlg: boolean,
}

export default defineComponent({
  name: 'EditorView',
  components: {HotSpot, SandTable, PreviewDlg},
  setup(props, context) {
    let container: any = null
    let scene: Scene = new Scene()
    let camera: Camera | any = null
    let renderer: WebGLRenderer = new WebGLRenderer()
    let controls: OrbitControls | any = null
    let sphereInstance = new Mesh()
    const editor = ref()

    const data: Props = reactive({
      doc: docJSon,
      activeName: 'hot',
      uniqueId: '',
      isLoading: true,
      activePoint: {},
      activeIndex: 0,
      activeMarkerIndex: 0,
      params: {},
      isShowPreviewDlg: false,
      sphere: new Mesh(),
    })
    const hotSpots = computed(() => {
      return data.doc.scenes[data.activeIndex].hotSpots
    })

    const activeItem = computed(() => {
      return data.doc.scenes[data.activeIndex]
    })

    const transformStyle = computed(() => {
      return (point: Pos, item: Hot) => {
        console.log('transformStyle pos:', point, data.doc.scenes[data.activeIndex].hotSpots)
        let pos = worldVector2Screen(
            {
              x: point.x,
              y: point.y,
              z: point.z
            },
            container,
            camera
        )
        const visible = pointInSceneView(point, camera)
        return {
          transform: `translateZ(0px) translate(${pos.x}px,${pos.y}px) translate(-${
              item.iconSize / 2
          }px,-${item.iconSize / 2}px)`,
          width: item.iconSize + 'px',
          height: item.iconSize + 'px',
          opacity: visible ? 1 : 0
        }
      }
    })

    const getIconPath = (path: string) => {
      if (path) {
        return SYS_ICON_MAP1[path as keyof typeof SYS_ICON_MAP1] || path
      } else {
        return path
      }

    }
    const initScene = () => {
      scene = new THREE.Scene()
    }
    const initCamera = (element: any, data: SceneData) => {
      const width = element.clientWidth
      const height = element.clientHeight
      camera = new THREE.PerspectiveCamera(
          data.params.fov,
          width / height,
          data.params.near,
          data.params.far
      )
      camera.position.set(data.cameraPos.x, data.cameraPos.y, data.cameraPos.z)
    }
    const initRenderer = (element: HTMLElement) => {
      renderer = new THREE.WebGLRenderer()
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(element.clientWidth, element.clientHeight)
      element.appendChild(renderer.domElement)
    }

    const initControls = () => {
      controls = new OrbitControls(camera, renderer?.domElement)
    }
    const initContent = async (data: SceneData) => {
      const texture = await textureLoaderHandle(data.url)
      // @ts-ignore
      const sphereMaterial = new THREE.MeshBasicMaterial({map: texture})
      const sphereGeometry = new THREE.SphereGeometry(1, 50, 50)
      // 贴图内翻
      sphereGeometry.scale(1, 1, -1)
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      scene.add(sphere)
      sphereInstance = sphere;
    }

    const textureLoaderHandle = (url: string) => {
      return new Promise((resolve) => {
        const pointTexture = new THREE.TextureLoader().load(url, () => {
          resolve(pointTexture)
        })
      })
    }
    const render = () => {
      renderer?.render(scene, camera)
    }

    // 寻找目标场景
    const findTargetScene = (id: string) => {
      let i = -1
      const target = data.doc.scenes.find((item, index) => {
        if (item.id === id) {
          i = index
        }
        return item.id === id
      })
      return {sceneX: target, index: i}
    }
    const resizeHandle = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height);

      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const init = async () => {
      data.isLoading = true
      container = document.getElementById('container')
      const scene = data.doc.scenes[0]
      initScene()
      initCamera(container, scene)
      initRenderer(container)
      initControls()
      await initContent(scene)
      render()
      data.isLoading = false
    }
    onMounted(() => {
      data.params = data.doc.scenes[data.activeIndex].params
      nextTick(() => {
        init()
        createThumbnail()
        const controlChangeHandle = () => {
          data.uniqueId = Date.now() + 'xx'
          render()
          // 获取水平的角度
          const angleH = (controls.getAzimuthalAngle() * 180) / Math.PI

          if (data.activeMarkerIndex === -1) return
          const marker = data.doc.sandTable.markers[data.activeMarkerIndex]
          let {sceneX} = findTargetScene(marker.sceneId)
          if (sceneX) {
            marker.angle += angleH - sceneX.angleX
            marker.angle = marker.angle % 360
            sceneX.angleX = angleH
          }
        }
        controls.addEventListener('change', controlChangeHandle)
        window.addEventListener('resize', resizeHandle);

      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resizeHandle);
    })

    const refData = toRefs(data)
    const menuNav: menuItem[] = [
      {
        label: '基础',
        value: 'basic',
        icon: 'mdi-format-list-bulleted'
      },
      {
        label: '视角',
        value: 'view',
        icon: 'mdi-eye-outline'
      },
      {
        label: '热点',
        value: 'hot',
        icon: 'mdi-record-circle-outline'
      },
      {
        label: '沙盘',
        value: 'sandTable',
        icon: 'mdi-map-marker-outline'
      }
    ]
    const findSandMarkerIndex = (sceneId: string) => {
      const sandTable = data.doc.sandTable.markers;
      console.log('sandTable:', sandTable)
      return sandTable.findIndex(item => {
        return item.sceneId === sceneId
      })
    }
    const createThumbnail = () => {
      if (data.activeName !== 'view') return
      const thumbnailDom = document.querySelector('#preview-thumbnail');
      html2canvas(container, {
        useCORS: true,
        allowTaint: false,
      }).then(canvas => {
        thumbnailDom!.innerHTML = ''
        thumbnailDom!.appendChild(canvas);
      })
    }
    const changeSceneHandle = async (index: number) => {
      const sceneX = data.doc.scenes[index];
      if (data.activeName === 'sandTable') {
        data.activeMarkerIndex = findSandMarkerIndex(sceneX.id)
        console.log('activeMarkerIndex:', data.activeMarkerIndex);
      }
      data.activeIndex = index;
      data.params = sceneX.params;

      // 选中的热点置空
      data.activePoint = {};
      // TODO:当前的场景重新渲染 + 生成缩略图
      console.log('activeItem:', activeItem.value.url);
      const texture = await textureLoaderHandle(activeItem.value.url)
      // @ts-ignore
      const sphereMaterial = new THREE.MeshBasicMaterial({map: texture});
      console.log('data.shapre', sphereInstance)
      // 修改贴图
      sphereInstance.material = sphereMaterial;

      camera.fov = data.params.fov;
      camera.near = data.params.near;
      camera.far = data.params.far;
      // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用
      camera.updateProjectionMatrix();

      // 相机位置
      const cameraPos = activeItem.value.cameraPos;
      camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z)
      // important:通过参数更新相机位置，必须调用controls的update才会生效
      controls.update();
      renderer.render(scene, camera)

      createThumbnail();
    }
    const clickPointHandle = (item: Hot) => {
      data.activePoint = item;
    }
    const setActivePoint = (it: Hot) => {
      const points = data.doc.scenes[data.activeIndex].hotSpots;
      const index = points.findIndex(item => {
        return item.id === it.id
      })
      points.splice(index, 1, it)
    }
    const changeFovParamsHandle = () => {
      camera.fov = data.params.fov;
      camera.near = data.params.near;
      camera.far = data.params.far;

      camera.updateProjectionMatrix();
      renderer.render(scene, camera)
    }
    return {
      lodash,
      ...refData,
      hotSpots,
      transformStyle,
      editor,
      menuNav: menuNav,
      ICON_MAP,
      SYS_ICON_MAP1,
      getIconPath,
      changeMenu(item: menuItem) {
        data.activeName = item.value
      },
      setCameraPosHandle() {
        data.doc.scenes[data.activeIndex].cameraPos = lodash.cloneDeep(camera.position);
        data.doc.scenes[data.activeIndex].angleX = controls.getAzimuthalAngle() * 180 / Math.PI;
        createThumbnail()
      },
      pointDownHandle(e: MouseEvent, item: Hot) {
        e.preventDefault();
        let isDragging = false
        const setDragTrue = () => {
          isDragging = true;
        }
        let timer = setTimeout(setDragTrue, 200)

        const target = e.currentTarget as HTMLElement
        let transform = target.style.transform || '';
        const reg = /translate\((-?\d+(?:\.\d*)?)px, (-?\d+(?:\.\d*)?)px\)/;
        let transformArr = transform.match(reg) || ['', '0', '0']

        let translateX = parseInt(transformArr[1]);
        let translateY = parseInt(transformArr[2]);


        let startPos = {
          x: e.clientX,
          y: e.clientY
        }

        const mouseMoveHandle = (e: MouseEvent) => {
          isDragging = true;

          const diffX = e.clientX - startPos.x;
          const diffY = e.clientY - startPos.y;
          translateX += diffX;
          translateY += diffY;

          startPos = {
            x: e.clientX,
            y: e.clientY
          }
          target!.style.transform = `translateZ(0px) translate(${translateX}px,${translateY}px) translate(-40px,-40px)`
        }

        const mouseUpHandle = () => {
          if (!isDragging) {
            clearTimeout(timer);
            clickPointHandle(item);
            console.log('mouse up');
          } else {
            isDragging = false;
            console.log('drag over');
            const pos = screenVector2World({
              x: translateX,
              y: translateY
            }, container, camera)
            item.pos = {
              x: pos.x,
              y: pos.y,
              z: pos.z,
            };
          }
          document.body.removeEventListener('mousemove', mouseMoveHandle)
          document.body.removeEventListener('mouseup', mouseUpHandle)
        }
        document.body.addEventListener('mousemove', mouseMoveHandle)
        document.body.addEventListener('mouseup', mouseUpHandle)
      },
      markerItemDownHandle(e: MouseEvent, item: Marker, i: number) {
        let startX = e.clientX;
        let startY = e.clientY;
        const mouseMove = (e: MouseEvent) => {
          const x = e.clientX;
          const y = e.clientY;

          const diffX = x - startX;
          const diffY = y - startY;


          // TODO:边界条件判断
          item.pos.x += diffX;
          item.pos.y += diffY;

          startX = e.clientX;
          startY = e.clientY;
        }
        const moveUp = () => {
          if (data.activeMarkerIndex !== i) {
            data.activeMarkerIndex = i;
            // 切换场景
            const {index} = findTargetScene(item.sceneId);
            changeSceneHandle(index);
          }
          document.body.removeEventListener('mousemove', mouseMove)
          document.body.removeEventListener('mouseup', moveUp)
        }
        document.body.addEventListener('mousemove', mouseMove)
        document.body.addEventListener('mouseup', moveUp)
      },
      pointMouseDownHandle(e: MouseEvent, item: Marker, index: number) {
        const nodeList = editor.value.querySelectorAll('.marker-item');
        const dom = nodeList[index].querySelector('.marker-item__outline');
        const domRect = dom.getBoundingClientRect();
        const centerPos = {
          x: domRect.width / 2 + domRect.x,
          y: domRect.height / 2 + domRect.y,
        }
        let mouseMove = (e: MouseEvent) => {
          const curMouse = {
            x: e.clientX,
            y: e.clientY,
          }
          // https://blog.csdn.net/wjlhanhan/article/details/109668342
          const radians = Math.atan2(curMouse.x - centerPos.x, curMouse.y - centerPos.y);
          let angle = (radians * (180 / Math.PI) * -1) + 180
          // 沙盘旋转角度转化到相机
          console.log('angle:', angle)
          item.angle = angle;


          data.doc.sandTable.markers[index].angle = angle;

          // this.rotate2cameraPos(angle)
        }

        let mouseUp = () => {
          console.log('mouseup')
          document.body.removeEventListener('mousemove', mouseMove)
          document.body.removeEventListener('mouseup', mouseUp)
        }

        document.body.addEventListener('mousemove', mouseMove)
        document.body.addEventListener('mouseup', mouseUp)
      },
      findSandMarkerIndex,
      changeSceneHandle,
      changeFovParamsHandle,
      changeHandle(v: any, key: string) {
        switch (key) {
          case 'horizontal':
            data.params.minAzimuthAngle = v[0];
            data.params.maxAzimuthAngle = v[1];
            break;
          case 'vertical':
            data.params.minPolarAngle = v[0];
            data.params.maxPolarAngle = v[1];
            break;
          case 'fov':
            data.params.near = v[0];
            data.params.far = v[1];
            break;
          default:
            break;
        }
        changeFovParamsHandle()
      },

      addPointHandle(item: Hot) {
        // 计算pos,当前窗口的中间位置
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pos = screenVector2World({x: centerX, y: centerY}, container, camera);
        console.log('addPointHandle pos:', pos)
        const point = lodash.cloneDeep(item);
        point.pos = pos;
        data.doc.scenes[data.activeIndex].hotSpots.push(point);
        data.activePoint = point
      },
      changePointHandle(item: Hot) {
        console.log('changePointHandle', item)
        data.activePoint = lodash.cloneDeep(item);
        setActivePoint(item);
      },
      cancelPointHandle() {
        data.activePoint = {};
      },
      delPointHandle() {
        const points = data.doc.scenes[data.activeIndex].hotSpots;
        const index = points.findIndex(item => {
          return item.id === data.activePoint.id
        })
        points.splice(index, 1)
        data.activePoint = {};
      },
      changeSandTableHandle(sandTable: Doc['sandTable']) {
        data.doc.sandTable = sandTable;
      },
      changeMarkerIndexHandle(i: number, item: Marker) {
        data.activeMarkerIndex = i;
        //  切换场景
        const {index} = findTargetScene(item.sceneId);
        changeSceneHandle(index)
      }
    }
  }
})
</script>
<template>
  <div class="editor-3d" ref="editor">
    <div class="header">
      <div class="header-wrapper">
        <div class="sub-title">{{ doc.name }}</div>
        <div class="right">
          <v-btn class="ma-2" size="small" variant="outlined" color="success">保存</v-btn>
          <v-btn class="ma-2" size="small" variant="outlined" color="indigo"
                 @click="isShowPreviewDlg=true">预览
          </v-btn>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="left-sidebar">
        <ul class="menu-list">
          <li
              class="menu-item"
              v-for="(item, index) in menuNav"
              :key="index"
              :class="{ 'is-active': activeName === item.value }"
              @click="changeMenu(item)"
          >
            <div class="menu-item__icon">
              <v-icon :icon="item.icon"></v-icon>
            </div>
            <div class="menu-item__label">{{ item.label }}</div>
          </li>
        </ul>
      </div>
      <div class="stage">
        <div class="wrapper">
          <div class="view-area" id="container"></div>
          <div class="help-frame" v-if="activeName === 'view'">
            <v-btn class="btn" color="primary" small @click="setCameraPosHandle"
            >把当前视觉设置为初始视角
            </v-btn>
          </div>
          <!--热点列表-->
          <div class="hotSpot-list" :key="uniqueId" v-if="activeName === 'hot' && !isLoading">
            <div
                class="hotStop-item"
                :class="{ 'is-active': item.id === lodash.get(activePoint, 'id') }"
                @mousedown="pointDownHandle($event, item)"
                v-for="(item, index) in hotSpots"
                :style="transformStyle(item.pos, item)"
                :key="index"
            >
              <img :src="getIconPath(item.iconPath)"/>
              <!-- 说明、注释渲染  -->
              <div class="point-item__label" v-if="lodash.get(item, 'title.show')">
                {{ item.title.label }}
              </div>
            </div>
          </div>
          <!-- 沙盘 -->
          <div class="sand-table-box" v-if="activeName=== 'sandTable'" id="sandTableBox">
            <div class="img">
              <img :src="doc.sandTable.url" draggable="false"/>
            </div>
            <div class="marker-list">
              <div
                  class="marker-item"
                  v-for="(item, index) in doc.sandTable.markers"
                  :key="index"
                  :class="{ 'is-active': activeMarkerIndex === index }"
                  :style="{ left: item.pos.x + 'px', top: item.pos.y + 'px' }"
                  @mousedown="markerItemDownHandle($event, item, index)"
              >
                <div class="marker-item__outline">
                  <div
                      class="marker-item__circle"
                      :style="{ transform: `rotate(${item.angle}deg)` }"
                  >
                    <div
                        class="marker-item__point"
                        @mousedown.stop.prevent="pointMouseDownHandle($event, item, index)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--  场景列表  -->
        <div class="scene-list">
          <div
              class="scene-item"
              v-for="(item, index) in doc.scenes"
              :key="index"
              :class="{ 'is-active': index === activeIndex }"
              @click="changeSceneHandle(index)"
          >
            <img :src="item.url" alt=""/>
            <div class="scene-item__name">{{ item.name }}</div>
          </div>
          <div class="scene-item plus">
            <v-icon :icon="'mdi-plus'"></v-icon>
            <div>添加场景</div>
          </div>
        </div>
      </div>
      <div class="right-sidebar">
        <div v-if="activeName === 'view'">
          <div class="section">
            <div class="section-title">当前初始视觉</div>
            <div class="section-content">
              <div id="preview-thumbnail"></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">视觉范围设置</div>
            <v-text-field
                label="初始视场（FOV）"
                :max="179"
                :min="1"
                v-model.number="params.fov"
                @change="changeFovParamsHandle"
            >
            </v-text-field>
            <v-range-slider
                :min="0.1"
                :max="2000"
                :step="0.1"
                :value="[params.near, params.far]"
                @change="changeHandle($event, 'fov')"
            ></v-range-slider>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    label="最近(near)"
                    v-model.number="params.near"
                    @change="changeFovParamsHandle"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    label="最远(far)"
                    v-model.number="params.far"
                    @change="changeFovParamsHandle"></v-text-field>
              </v-col>
            </v-row>
          </div>
        </div>
        <div v-else-if="activeName === 'hot'">
          <HotSpot
              :list="hotSpots"
              :activePoint="activePoint"
              :doc="lodash.cloneDeep(doc)"
              @addPoint="addPointHandle"
              @changeX="changePointHandle"
              @cancel="cancelPointHandle"
              @delPoint="delPointHandle"
          >
          </HotSpot>
        </div>
        <!-- 沙盘 -->
        <div v-else-if="activeName === 'sandTable'">
          <SandTable
              :sand-table="doc.sandTable"
              :doc="doc"
              :activeIndex="activeMarkerIndex"
              @change="changeSandTableHandle"
              @changeIndex="changeMarkerIndexHandle"
          ></SandTable>
        </div>
      </div>
    </div>
    <v-dialog
        v-if="isShowPreviewDlg"
        max-width="800px"
        width="800px"
        :fullscreen="false"
        v-model="isShowPreviewDlg"
        :overlay-opacity="0.8"
        content-class="preview-dlg"
        @click:outside="isShowPreviewDlg = false"
    >
      <PreviewDlg :doc="doc"></PreviewDlg>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.editor-3d {
  height: 100vh;
  overflow: hidden;
}

.header {
  height: 40px;
  border-bottom: 1px solid #eee;

  .header-wrapper {
    text-align: center;
    max-width: 1920px;
    line-height: 40px;
  }

  .sub-title {
    display: inline-block;
  }

  .right {
    float: right;
  }
}

.content {
  width: 100%;
  height: calc(100vh - 40px);
  @include flex(space-between);

  .left-sidebar {
    width: 50px;
    height: 100%;
    border-right: 1px solid #eee;
    flex: none;
  }

  .stage {
    flex: auto;
    height: 100%;
    //padding: 20px;
    position: relative;
    @include flex();
    flex-direction: column;

    .view-area {
      width: 100%;
      height: 100%;
    }

    .help-frame {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 75%;
      height: 74%;
      background: url('/img/view_frame.png') no-repeat;
      background-size: contain;
      background-position: center;
      pointer-events: none;

      .btn {
        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
    }

    .hotSpot-list {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      user-select: none;
      pointer-events: none;
    }

    .hotStop-item {
      position: absolute;

      border-radius: 5px;
      cursor: pointer;
      width: 80px;
      height: 80px;
      transform-origin: 50% 50%;
      pointer-events: auto;
      background-color: rgba(0, 0, 0, 0.1);

      &.is-active {
        border: 3px solid orange;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .point-item__label {
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        padding: 10px;
        border-radius: 5px;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
        word-break: keep-all;
      }
    }
  }

  .wrapper {
    flex: auto;
    width: 100%;
    height: 100%;
    position: relative;
    overflow:hidden;
  }

  .scene-list {
    width: 100%;
    height: 100px;
    @include flex();

    .scene-item {
      position: relative;
      width: 80px;
      height: 80px;
      border: 1px solid #eee;
      border-radius: 3px;
      margin-top: 10px;
      margin-right: 10px;
      cursor: pointer;

      &.is-active {
        border: 2px solid $--color-primary;
      }

      &.plus {
        @include flex(center, center);
        flex-direction: column;
        cursor: pointer;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &__name {
        position: absolute;
        width: 100%;
        height: 30px;
        left: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        text-align: center;
        padding-top: 5px;
      }
    }
  }

  .right-sidebar {
    width: 230px;
    height: 100%;
    border-left: 1px solid #eee;
    flex: none;
    padding: 0 5px;
  }
}

.section {
  &-title {
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0;
  }
}

#preview-thumbnail {
  width: 100%;
  height: 120px;

  :deep canvas {
    width: 100% !important;
    height: 100% !important;
  }
}

.menu-list,
.menu-list .menu-item {
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-item {
  cursor: pointer;
  @include flex(center, center);
  flex-direction: column;
  padding: 5px 0 !important;

  &.is-active {
    background-color: #5e35b1 !important;

    .menu-item__icon i,
    .menu-item__label {
      color: #fff;
    }
  }

  &__icon {
    i {
      font-size: 18px;
    }
  }

  &__label {
    font-size: 12px;
    color: #666;
  }
}

.sand-table-box {
  width: 200px;
  position: absolute;
  right: 10px;
  top: 10px;

  .img {
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    -webkit-user-drag: none;
    user-drag: none;
    user-select: none;
  }
}

.marker-item {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: blue;
  border: 2px solid #fff;

  &.is-active {
    background-color: orange;

    .marker-item__outline {
      display: block;
    }
  }

  &__outline {
    width: 30px;
    height: 30px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid orange;
    border-radius: 50%;
    display: none;
  }

  &__circle {
    position: absolute;
    width: 2px;
    height: 15px;
    left: 50%;
    top: 0;
    background-color: transparent;
    transform-origin: 0 15px;
  }

  &__point {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: red;
    border-radius: 50%;
    top: 0%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: ew-resize;
  }
}
</style>
