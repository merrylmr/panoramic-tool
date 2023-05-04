import * as THREE from 'three'
import type {Camera} from "three";
import type {Pos} from "@/custom_types";

/**
 *  世界坐标转屏幕坐标
 * @param center threejs中的三维点
 * @param dom  画布dom
 * @param camera 相机
 * @returns {{x: number, y: number}}
 */
export function worldVector2Screen(center: Pos, dom: HTMLElement, camera: Camera) {
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
export function pointInSceneView(point: any, camera: Camera) {
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
export function screenVector2World(point: Pos, dom: HTMLElement, camera: Camera) {
  const x = (point.x / dom.clientWidth) * 2 - 1
  const y = -(point.y / dom.clientHeight) * 2 + 1
  const stdVector = new THREE.Vector3(x, y, 0.5)
  // 将向量转成threejs坐标
  const worldVector = stdVector.unproject(camera)
  return worldVector
}
