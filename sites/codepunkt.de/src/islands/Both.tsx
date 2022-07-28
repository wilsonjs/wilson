import Increase from './Increase'
import Decrease from './Decrease'

export default function Both(props: { initialValue: number }) {
  return (
    <>
      <Increase initialValue={props.initialValue} />
      <Decrease initialValue={props.initialValue} />
    </>
  )
}
