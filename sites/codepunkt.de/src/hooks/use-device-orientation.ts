// https://richtr.github.io/doe/emulator/#W1sxLDEsMCw5My4yLDE4MCwtNjAuNjcsMjcwXV0=

// orientation 0 (portrait)
// right: a+, left: a-, bottom: b+, top: b-

// orientation 180 (portrait)
// right: a+, left: a-, bottom: b-, top: b+

// orientation 90 (landscape bottom right)
// right: a+, left: a-, bottom: g-, top: g+

// orientation 270 (landscape bottom left)
// right: a+, left: a-, bottom: g+, top: g-

import { mat3 } from 'gl-matrix'
import roundfn from 'lodash/round'
import throttlefn from 'lodash/throttle'
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'preact/hooks'

// https://dev.opera.com/articles/w3c-device-orientation-usage/
// https://stackoverflow.com/a/36662093

const deg2rad = Math.PI / 180 // degree-to-radian conversion

const fromOrientation = (
  out: mat3,
  alpha: number,
  beta: number,
  gamma: number,
  orientation: number,
): mat3 => {
  const _z = alpha
  // @todo can this be initialized to zero?
  let _x = 0
  let _y = 0

  if (orientation === 90) {
    _x = -gamma
    _y = beta
  } else if (orientation === -90 || orientation === 270) {
    _x = gamma
    _y = -beta
  } else if (orientation === 180) {
    _x = -beta
    _y = -gamma
  } else if (orientation === 0) {
    _x = beta
    _y = gamma
  }

  const cX = Math.cos(_x)
  const cY = Math.cos(_y)
  const cZ = Math.cos(_z)
  const sX = Math.sin(_x)
  const sY = Math.sin(_y)
  const sZ = Math.sin(_z)

  out[0] = cZ * cY + sZ * sX * sY
  out[1] = cX * sZ
  out[2] = -cZ * sY + sZ * sX * cY
  out[3] = -cY * sZ + cZ * sX * sY
  out[4] = cZ * cX
  out[5] = sZ * sY + cZ * cY * sX
  out[6] = cX * sY
  out[7] = -sX
  out[8] = cX * cY

  return out
}

const normalizeAngle = (
  number: number,
  [lowerBound, upperBound]: [number, number],
): number => {
  if (number < lowerBound) {
    number = number + upperBound * 2
  }
  if (number > upperBound) {
    number = number + lowerBound * 2
  }
  return number
}

// z/alpha
//    the z axis is perpendicular to the screen or keyboard, and is positive
//    extending outward from the screen.
//    the alpha angle is 0 when the top of the device is directly pointed at
//    the earth's north pole and increases if the device is rotated left
// x/beta
//    The y axis is in the plane of the screen and is positive toward the
//    top and negative toward the bottom.
//    the beta angle is 0 when the device's top and bottom are the same
//    distance from the earth's surface; it increases toward 180 as the device
//    is tipped forward toward the user, and it decreases toward -180 as the
//    device is tipped backward away from the user
// y/gamma
//    the y axis is in the plane of the screen and is positive toward the top
//    and negative toward the bottom.
//    the gamma angle is 0 when the device's left and right sides are the
//    same distance from the surface of the earth, and increases toward 90 as
//    the device is tipped toward the right, and toward -90 as the device is
//    tipped toward the left
const useDeviceOrientation = ({ decimals = 2, throttle = 100 } = {}) => {
  interface AlphaBetaGamma {
    alpha: any
    beta: any
    gamma: any
  }
  interface State {
    initial: AlphaBetaGamma | null
    orientation: any | null
    inferred: AlphaBetaGamma
  }
  interface Action {
    type: 'DEVICE_ORIENTATION'
    payload: AlphaBetaGamma
  }

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case 'DEVICE_ORIENTATION': {
        const { alpha, beta, gamma } = action.payload
        const initial = state.initial ?? action.payload
        return {
          initial,
          orientation: action.payload,
          inferred: {
            alpha: roundfn(alpha - initial.alpha, decimals),
            beta: roundfn(
              normalizeAngle(beta - initial.beta, [-180, 180]),
              decimals,
            ),
            gamma: roundfn(
              normalizeAngle(gamma - initial.gamma, [-90, 90]),
              decimals,
            ),
          },
        }
      }
      default:
        return state
    }
  }

  const [orientation, setOrientation] = useState<number>(0)

  useEffect(() => {
    setOrientation(
      (window.screen.orientation
        ? window.screen.orientation.angle
        : Number(window.orientation)) ?? 0,
    )
  }, [])

  const [state, dispatch] = useReducer(reducer, {
    initial: null,
    orientation: null,
    inferred: { alpha: 0, beta: 0, gamma: 0 },
  })

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (event.alpha && event.beta && event.gamma) {
        dispatch({
          type: 'DEVICE_ORIENTATION',
          payload: {
            alpha: roundfn(event.alpha, decimals),
            beta: roundfn(event.beta, decimals),
            gamma: roundfn(event.gamma, decimals),
          },
        })
      }
    },
    [decimals],
  )

  // ios chrome
  //   orient 0 [portrait] top > top+, bottom > top-, right value seems z axis
  //   orient 90 [landscape l] top > top+, bottom > top+ ???, right > right-, left > right+
  //   orient -90 [landscape r] top > top+, bottom > top+ ???, right > right-, left > right+
  //   orient 180 [portrait down] seems impossible

  const handleOrientationChange = () => {
    setOrientation(
      window.screen.orientation
        ? window.screen.orientation.angle
        : Number(window.orientation),
    )
  }

  const currentRotMat = useRef<mat3>()
  const previousRotMat = useRef<mat3>()
  const inverseMat = useRef<mat3>()
  const relativeRotationDelta = useRef<mat3>()
  const totalRightAngularMovement = useRef(0)
  const totalTopAngularMovement = useRef(0)

  useEffect(() => {
    if (state.orientation != null) {
      const { alpha, beta, gamma } = state.orientation

      // init values if necessary
      if (!previousRotMat.current) {
        previousRotMat.current = mat3.create()
        currentRotMat.current = mat3.create()
        relativeRotationDelta.current = mat3.create()
        inverseMat.current = mat3.create()

        fromOrientation(
          currentRotMat.current,
          alpha * deg2rad,
          beta * deg2rad,
          gamma * deg2rad,
          orientation,
        )
      }

      // save last orientation
      mat3.copy(previousRotMat.current, currentRotMat.current as mat3)

      // get rotation in the previous orientation coordinate
      fromOrientation(
        currentRotMat.current as mat3,
        alpha * deg2rad,
        beta * deg2rad,
        gamma * deg2rad,
        orientation,
      )
      mat3.transpose(inverseMat.current as mat3, previousRotMat.current) // for rotation matrix, inverse is transpose
      mat3.multiply(
        relativeRotationDelta.current as mat3,
        currentRotMat.current as mat3,
        inverseMat.current as mat3,
      )

      // add the angular deltas to the cummulative rotation
      totalRightAngularMovement.current +=
        Math.asin((relativeRotationDelta.current as mat3)[6]) / deg2rad
      totalTopAngularMovement.current +=
        Math.asin((relativeRotationDelta.current as mat3)[7]) / deg2rad
    }
  }, [orientation, state.orientation])

  useEffect(() => {
    const handleDeviceOrientationThrottled = throttlefn(
      handleDeviceOrientation,
      throttle,
    )
    window.addEventListener(
      'deviceorientation',
      handleDeviceOrientationThrottled,
    )
    window.addEventListener('orientationchange', handleOrientationChange)
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener(
        'deviceorientation',
        handleDeviceOrientationThrottled,
      )
    }
  }, [handleDeviceOrientation, throttle])

  return { ...state, orient: orientation }
}

export default useDeviceOrientation
