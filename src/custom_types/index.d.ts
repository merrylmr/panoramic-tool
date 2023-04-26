export interface Pos {
  x: number
  y: number
  z: number
}

export interface menuItem {
  label: string
  value: string
  icon: string
}

export interface Hot {
  id: string
  iconType: string
  iconPath: string
  iconSize: number
  hotType: string
  gif: boolean
  texture: {
    horizontalNum: number
    verticalNum: number
    numTiles: number
    duration: number
  }
  pos: Pos
  title: {
    label: string
    show: boolean
  }
  value: string
}

export interface SceneData {
  id: string
  name: string
  url: string
  params: {
    near: number
    far: number
    fov: number
  }
  hotSpots: Hot[]
  cameraPos: {
    x: number
    y: number
    z: number
  }
  angleX: number
  [propName: string]: any
}

export interface Marker {
  pos: {
    x: number
    y: number
  }
  angle: number
  name: string
  sceneId: string
}

export interface Doc {
  id: string
  name: string
  scenes: SceneData[]
  sandTable: {
    url: string
    markers: marker[]
  }
}
