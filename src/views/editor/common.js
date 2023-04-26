import * as THREE from 'three'

/**
 *  世界坐标转屏幕坐标
 * @param center threejs中的三维点
 * @param dom  画布dom
 * @param camera 相机
 * @returns {{x: number, y: number}}
 */
export function worldVector2Screen(center, dom, camera) {
  const worldVector = new THREE.Vector3(center.x, center.y, center.z)
  //  将一个三维坐标，投影到相机平面上，使之变成一个二维坐标。
  //  需要注意的是，投影得到的结果是一个标准向量(或者叫单位向量)，
  //  其值是限定在[-1,1]范围内的。
  // 参考文档：https://segmentfault.com/q/1010000013062310
  const stdVector = worldVector.project(camera)
  const w = dom.clientWidth
  const h = dom.clientHeight

  const x = Math.round((0.5 + stdVector.x / 2) * w)
  const y = Math.round((0.5 - stdVector.y / 2) * h)
  return { x, y }
}

/**
 * 热点位是否在场景可视范围区域
 * @param point threejs三维坐标点
 * @param camera 相机
 * @returns {boolean}
 */
export function pointInSceneView(point, camera) {
  point = new THREE.Vector3(point.x, point.y, point.z)
  const tempV = point.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix)
  return !(Math.abs(tempV.x) > 1 || Math.abs(tempV.y) > 1 || Math.abs(tempV.z) > 1)
}

/**
 * 屏幕坐标转世界坐标
 * @param point 屏幕上的一个坐标点
 * @param dom 画布dom
 * @param camera 相机
 * @returns {Vector3}
 */
export function screenVector2World(point, dom, camera) {
  const x = (point.x / dom.clientWidth) * 2 - 1
  const y = -(point.y / dom.clientHeight) * 2 + 1
  const stdVector = new THREE.Vector3(x, y, 0.5)
  // 将向量转成threejs坐标
  const worldVector = stdVector.unproject(camera)
  return worldVector
}

/**
 *
 * @param texture 贴图
 * @param tilesHoriz 水平多少个
 * @param tilesVert 有多少行瓦片
 * @param numTiles 瓦片个数
 * @param tileDispDuration
 * @constructor
 */
export function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
  // note: texture passed by reference, will be updated by the update function.

  this.tilesHorizontal = tilesHoriz
  this.tilesVertical = tilesVert
  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet.
  this.numberOfTiles = numTiles
  // 设置阵列模式   默认ClampToEdgeWrapping  RepeatWrapping：阵列  镜像阵列：MirroredRepeatWrapping
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  // uv两个方向纹理重复数量(1,1/25)
  texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical)

  // how long should each image be displayed?
  this.tileDisplayDuration = tileDispDuration

  // how long has the current image been displayed?
  this.currentDisplayTime = 0

  // which image is currently being displayed?
  this.currentTile = this.numberOfTiles

  this.update = function (milliSec) {
    this.currentDisplayTime += milliSec

    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration
      this.currentTile--
      if (this.currentTile === 0) {
        this.currentTile = this.numberOfTiles
      }

      const currentColumn = this.currentTile % this.tilesHorizontal // 0
      texture.offset.x = currentColumn / this.tilesHorizontal // 0

      const currentRow = Math.floor(this.currentTile / this.tilesHorizontal) // this.currentTile

      texture.offset.y = currentRow / this.tilesVertical //  /25
    }
  }
}
