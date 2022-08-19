import Counter from '../islands/Counter'
import Clock from '../islands/Clock'

export const frontmatter = {
  title: 'Islands',
}

export default function Islands() {
  return (
    <>
      <Counter clientIdle>
        <p style={{ height: 5000 }}>before nested island</p>
        <Clock clientVisible />
        <p>after nested island</p>
      </Counter>
    </>
  )
}
