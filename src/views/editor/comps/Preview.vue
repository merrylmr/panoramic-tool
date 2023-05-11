<template>
  <v-card class="preview-wrapper">
    <div id="preview" >
    </div>
    <div class="hot-point__list"
         :key="uniqueId">
      <div class="hot-point__item"
           v-for="(item,index) in hotPointList"
           :key="index"
           :style="hotLabelStyleArr[index]">
        <!--场景说明-->
        <div class="item__label"
             @click="pointLabelClickHandle(item)">
          {{ lodash.get(item, 'title.label') }}
        </div>
      </div>
    </div>

    <!--场景列表-->
    <div class="scene-list">
      <div class="scene-item"
           :class="{'is-active':index===activeIndex}"
           v-for="(item,index) in doc?.scenes"
           :key="index"
           @click="changeSceneHandle(item,index)">
        <div class="scene-item__thumbnail">
          <img :src="item.url">
        </div>
        <div class="scene-item__label">
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="sand-table-box" ref="preview">
      <div class="marker-list">
        <div class="img">
          <img :src="doc?.sandTable.url"
               draggable="false">
        </div>
        <div class="marker-item"
             v-for="(item,index) in doc?.sandTable.markers"
             :key="index"
             :class="{'is-active':activeMarkerIndex===index}"
             :style="{left:item.pos.x+'px',top:item.pos.y+'px'}"
             @click="markerClickHandle(index,item)">
          <div class="marker-item__outline"
          >
            <div class="marker-item__circle"
                 :style="{transform:`rotate(${item.angle}deg)`}">
              <div class="marker-item__point"
                   @mousedown.stop.prevent="pointMouseDownHandle($event,item,index)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import * as THREE from 'three';
import type {Doc, Pos, Hot, SceneData, Marker} from '@/custom_types/index'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue'
import type {PropType} from 'vue'
import {pointInSceneView, worldVector2Screen, TextureAnimator} from '../common'
// @ts-ignore
import gsap from 'gsap';
// @ts-ignore
import docJSON from 'json/doc.json'
import {Camera, Mesh, Scene, WebGLRenderer, Sprite} from "three";
import * as lodash from 'lodash'

interface Props {
  hotPointList: any[],
  uniqueId: string,
  activeIndex: number,
  needUpdate: any[],
  hotLabelStyleArr: any[],
  rotate: number,
  targetPosition: THREE.Vector3,
  activeMarkerIndex: number,
  timer: number
}

export default defineComponent({
  name: 'preview-dlg',
  props: {
    visible: {
      type: Boolean
    },
    doc: {
      type: Object as PropType<Doc>,
      default: () => {
        return docJSON
      }
    }
  },
  setup(props, context) {
    let container: any = null
    let controls: OrbitControls | any = null
    let camera: Camera | any = null
    let scene: Scene = new Scene()
    let renderer: WebGLRenderer = new WebGLRenderer()
    let sphereInstance = new Mesh()
    let clock = new THREE.Clock()
    let preview = ref();
    let poiObjects: Sprite[] = []

    const transformStyle = computed(() => {
      return (point: Pos, item: Hot) => {
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
    const data: Props = reactive({
      // poiObjects: [],
      // 热点原始数据
      hotPointList: [],
      uniqueId: '',
      activeIndex: 0,
      needUpdate: [],
      hotLabelStyleArr: [],
      rotate: 0,
      targetPosition: new THREE.Vector3(0, 0, 0),
      activeMarkerIndex: 0,
      timer: 0
    })
    const hotLabelStyles = () => {
      const arr: any[] = [];
      data.hotPointList.forEach(item => {
        const visible = pointInSceneView(item.pos, camera)
        console.log('hotLabelStyles visible：', visible)
        if (visible) {
          let pos = worldVector2Screen({
            x: item.pos.x,
            y: item.pos.y,
            z: item.pos.z
          }, container, camera);
          arr.push({
            transform: `translateZ(0px) translate(${pos.x}px,${pos.y}px) translate(-${item.iconSize / 2}px,-${item.iconSize / 2}px)`,
            width: item.iconSize + 'px',
            height: item.iconSize + 'px',
            visibility: 'visible'
          })
        } else {
          arr.push({
            width: item.iconSize + 'px',
            height: item.iconSize + 'px',
            visibility: 'hidden',
            transform: `translateZ(0px) translate(-999999px,-999999px) translate(-${item.iconSize / 2}px,-${item.iconSize / 2}px)`,
          })
        }

      })
      data.hotLabelStyleArr = arr;
    }
    const closeHandle = () => {
      context.emit('close')
    }
    const degToRad = (deg: number) => {
      return Math.PI / 180 * deg
    }
    const findSandTableMarker = (sceneId: string) => {
      const markers = props!.doc!.sandTable.markers;
      const index = markers.findIndex((item: Marker) => {
        return item.sceneId === sceneId
      })
      return index
    }
    const textureLoaderHandle = (url: string) => {
      return new Promise((resolve) => {
        const pointTexture = new THREE.TextureLoader().load(url, () => {
          resolve(pointTexture)
        });
      })
    }
    const calcSpriteScale = (icon: Hot, fov = 90) => {
      const scaleY = icon.iconSize * 2 * Math.tan(fov / 2 * Math.PI / 180) / container.clientHeight
      const scaleX = icon.iconSize * 2 * Math.tan(fov / 2 * Math.PI / 180) / container.clientHeight
      console.log('calcSpriteScale:', scaleX, scaleY)
      return {scaleX, scaleY}
    }
    const renderHotPoint = async (scene: Scene, item: Hot) => {
      const pointTexture = await textureLoaderHandle(item.iconPath)
      let annie = null
      if (item.gif) {
        annie = new TextureAnimator(
            pointTexture,
            item.texture.horizontalNum,
            item.texture.verticalNum,
            item.texture.numTiles,
            item.texture.duration)
      }
      const material = new THREE.SpriteMaterial(
          {
            // @ts-ignore
            map: pointTexture,
            // 关闭大小跟随相机距离变化的特性
            sizeAttenuation: false,
          });
      const sprite = new THREE.Sprite(material);
      const {scaleX, scaleY} = calcSpriteScale(item, camera.fov)
      sprite.scale.set(scaleX, scaleY, 1);

      // 位置信息
      const position = item.pos
      sprite.position.set(position.x, position.y, position!.z || 0)
      //  @ts-ignore
      sprite.detail = item
      scene.add(sprite);
      return {sprite, annie}
    }
    const renderPointList = async (scene: Scene, hotPoints: any[]) => {
      data.hotPointList = hotPoints;
      let poiObjects = [];
      let needUpdate = [];
      for (let i = 0; i < hotPoints.length; i++) {
        const item = hotPoints[i];
        const {sprite, annie} = await renderHotPoint(scene, item)
        poiObjects.push(sprite);
        if (annie) {
          needUpdate.push(annie)
        }
      }
      data.needUpdate = needUpdate;
      return poiObjects
    }
    const changeSceneHandle = async (item: SceneData, index: number) => {
      if (data.activeIndex === index) return
      data.activeIndex = index
      data.activeMarkerIndex = findSandTableMarker(item.id)

      // 清空场景的元素（热点）
      scene.children = scene.children.filter(item => {
        return item.type !== 'Sprite'
      })


      data.hotPointList = []

      if (item.sphere) {
        item.sphere.opacity = 0;
        item.sphere.transparent = true;
        sphereInstance.material = item.sphere;
      } else {
        const texture = await textureLoaderHandle(item.url);
        const sphereMaterial = new THREE.MeshBasicMaterial({
          // @ts-ignore
          map: texture,
          transparent: true,
          opacity: 0,
        });
        sphereInstance.material = sphereMaterial;
        item.sphere = sphereMaterial;
      }

      gsap.to(item.sphere, {
        transparent: false,
        opacity: 1,
        duration: 1.5,
        onComplete: () => {
          // 重新渲染热点
          renderPointList(scene, item.hotSpots).then((items) => {
            console.log('renderPointList items:', items)
            poiObjects = items
            hotLabelStyles()
          });

        }
      });

      camera.fov = item.params.fov;
      camera.near = item.params.near;
      camera.far = item.params.far;
      // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用
      camera.updateProjectionMatrix();
      // 相机位置
      const cameraPos = item.cameraPos;
      camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z)
      // important:通过参数更新相机位置，必须调用controls的update才会生效
      controls.update();
    }

    const initScene = () => {
      scene = new THREE.Scene()
    }
    const initCamera = (element: HTMLElement, item: SceneData) => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      camera = new THREE.PerspectiveCamera(item.params.fov, width / height, item.params.near, item.params.far);
      camera.position.set(item.cameraPos.x, item.cameraPos.y, item.cameraPos.z)
    }
    const initRenderer = (element: HTMLElement) => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      element.appendChild(renderer.domElement);
    }
    const initControls = () => {
      controls = new OrbitControls(camera, renderer.domElement);
    }
    const initContent = async (data: SceneData) => {
      const texture = await textureLoaderHandle(data.url)
      const sphereMaterial = new THREE.MeshBasicMaterial(
          // @ts-ignore
          {map: texture});
      const sphereGeometry = new THREE.SphereGeometry(1, 50, 50);
      // 贴图内翻
      sphereGeometry.scale(1, 1, -1);
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(sphere)
      sphereInstance = sphere
    }
    const updateHandle = () => {
      const delta = clock.getDelta();
      data.needUpdate.forEach(item => {
        item.update(1000 * delta);
      })
    }
    const render = () => {
      renderer.render(scene, camera);
      updateHandle()
      data.timer = requestAnimationFrame(render);
    }
    const findTargetScene = (id: string) => {
      let i = -1;
      const target = props!.doc!.scenes.find((item: SceneData, index: number) => {
        if (item.id === id) {
          i = index;
        }
        return item.id === id
      })
      return {scene: target, index: i}
    }
    const init = async (sceneItem: SceneData) => {
      container = document.getElementById('preview')
      initScene()
      initCamera(container, sceneItem)
      initRenderer(container)
      initControls()
      initContent(sceneItem)
      const points = sceneItem.hotSpots;
      poiObjects = await renderPointList(scene, points)
      setTimeout(() => {
        hotLabelStyles()
      })
      render();
      controls.addEventListener('change', () => {
        const angleX = controls.getAzimuthalAngle() * 180 / Math.PI;
        const marker = props!.doc!.sandTable.markers[data.activeMarkerIndex];
        if (marker) {
          const {scene: sceneData} = findTargetScene(marker.sceneId);
          if (!sceneData) return
          marker.angle += (angleX - sceneData.angleX);
          marker.angle = marker.angle % 360;
          sceneData.angleX = angleX
        }
        hotLabelStyles();
      })
    }
    const pointLabelClickHandle = (detail: Hot) => {
      switch (detail.hotType) {
        case 'scene': {
          const {scene, index} = findTargetScene(detail.value);
          if (scene) {
            changeSceneHandle(scene, index)
          }
        }
          break
        default:
          break
      }
    }
    const pointClickHandle = (event: MouseEvent) => {
      event.preventDefault();
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const canvasPos = container.getBoundingClientRect();
      const mouseX = event.clientX - canvasPos.left;
      const mouseY = event.clientY - canvasPos.top;

      mouse.x = (mouseX / container.clientWidth) * 2 - 1;
      mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(poiObjects);

      console.log('intersects:', intersects);
      if (intersects.length > 0) {
        // @ts-ignore
        const detail = intersects[0].object.detail;
        pointLabelClickHandle(detail)
      }
    }
    const resizeHandle = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      hotLabelStyles()
    }
    const markerClickHandle = (i: number, item: Marker) => {
      if (data.activeMarkerIndex === i) {
        return
      }
      data.activeMarkerIndex = i;
      const {scene: sceneData, index} = findTargetScene(item.sceneId)
      if (sceneData) {
        changeSceneHandle(sceneData, index)
      }
    }
    // 已知水平角度，转化成相机的坐标
    // https://www.wjceo.com/blog/threejs2/2018-12-05/181.html
    const rotate2cameraPos = (angle: number) => {
      // 距离
      const r = controls.object.position.distanceTo(controls.target);
      // 垂直方向角度（y轴）
      const phi = controls.getPolarAngle();
      // 水平方向的角度（x轴）
      const theta = angle * Math.PI / 180;
      const x = r * Math.cos(phi - Math.PI / 2) * Math.sin(theta) + controls.target.x;
      const y = r * Math.sin(phi + Math.PI / 2) + controls.target.y;
      const z = r * Math.cos(phi - Math.PI / 2) * Math.cos(theta) + controls.target.z;
      controls.object.position.set(x, y, z);
      controls.object.lookAt(controls.target);
      controls.update();
      return {x, y, z}
    }
    const pointMouseDownHandle = (e: MouseEvent, item: Marker, index: number) => {
      const nodeList = preview.value.querySelectorAll('.marker-item');
      console.log('nodeList:', nodeList, index)
      const dom = nodeList[index].querySelector('.marker-item__outline');
      const domRect = dom.getBoundingClientRect();

      const centerPos = {
        x: domRect.width / 2 + domRect.x,
        y: domRect.height / 2 + domRect.y,
      }
      let mouseMove = (e: MouseEvent) => {
        e.preventDefault()
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
        rotate2cameraPos(angle);
      }

      let mouseUp = () => {
        console.log('mouseUp')
        document.body.removeEventListener('mousemove', mouseMove)
        document.body.removeEventListener('mouseup', mouseUp)
      }

      document.body.addEventListener('mousemove', mouseMove)
      document.body.addEventListener('mouseup', mouseUp)

    }
    onMounted(() => {
      nextTick(async () => {
        await init(props!.doc!.scenes[0])
        container.addEventListener('click', pointClickHandle, false)
        window.addEventListener('resize', resizeHandle)
      })
    })
    onUnmounted(() => {
      window.removeEventListener('resize', resizeHandle)
      window.cancelAnimationFrame(data.timer)
    })
    return {
      ...toRefs(data),
      transformStyle,
      preview,
      lodash,
      hotLabelStyles,
      closeHandle,
      degToRad,
      findSandTableMarker,
      changeSceneHandle,
      markerClickHandle,
      pointMouseDownHandle,
      pointLabelClickHandle
    }
  },
})
</script>

<style scoped lang="scss">
.preview-dlg {
  #preview {
    height: 400px;
  }
}

.preview-wrapper {
  position: relative;
  overflow: hidden;
}


.hot-point__list {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  user-select: none;
  pointer-events: none;
  overflow: hidden;
}

.hot-point__item {
  position: absolute;
  visibility: hidden;

  .item__label {
    pointer-events: auto;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    word-break: keep-all;
    cursor: pointer;
  }
}

.scene-list {
  position: absolute;
  width: 100%;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  @include flex(center);
  background-color: rgba(0, 0, 0, 0.3);
}

.scene-item {
  position: relative;
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border: 2px solid #fff;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__thumbnail {
    height: 100%;
  }

  &__label {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 3px;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    text-align: center;
  }

  &.is-active {
    border-color: $--color-primary;
  }
}

.sand-table {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
  border: 1px solid orange;
  @include flex(center, center);

  .point {
    width: 128px;
    height: 128px;
    //@include flex(center, center);
    position: relative;
    //border: 1px solid orange;

    .img {
      @include flex(center, center);

      img {
        width: 64px;
        height: 64px;
        -webkit-user-drag: none;
      }
    }

    .circle {
      width: 20px;
      height: 20px;
      background-color: red;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
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
    user-drag: none;
    -webkit-user-drag: none;
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
