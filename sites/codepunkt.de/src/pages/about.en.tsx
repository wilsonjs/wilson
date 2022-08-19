import { StaticPageProps, UserFrontmatter } from 'wilson'
import styles from './about.module.scss'
import me from '../assets/photos/me.jpg'
import coding from '../assets/photos/coding.jpg'
import timeout from '../assets/photos/timeout.jpg'

export const frontmatter: UserFrontmatter = {
  title: 'About me',
}

export default function AboutPage(props: StaticPageProps) {
  return (
    <>
      <h1>{props.frontmatter.title}</h1>
      <section class={styles.tldr}>
        <h2>Summary</h2>
        <img src={me} alt="Portrait photo of Christoph Werner" />
        <p>
          Hey, I'm Christoph! I live with my family in Paderborn, Germany. In my
          day job, I help software development teams to deliver better products
          in less time as Lead Software Architect at <a href="">dSPACE</a>.
        </p>
        <p>
          Ich do a lot of work on Open Source Software. My current project is{' '}
          <a href="">Wilson</a>, a static site generator for developer blogs and
          documentation sites. I write about what I learn on my{' '}
          <a href="">Blog</a> and on <a href="">Twitter</a> and hold workshops
          as an expert on various topics, e.g. web security.
        </p>
      </section>
      <section class={styles.long}>
        <article class={styles.cols}>
          <h3>All around the web</h3>
          <p>
            The Internet and the World Wide Web have fascinated me since my
            youth. I think it's great that these technologies allow people all
            over the world to communicate and learn from each other. Motivated
            by this, I've started to built things for the web in 1996. With more
            than 20 years of experience in web frontend development and
            server-side APIs and more than 10 years of experience in pipeline
            automation and cloud infrastructure, I'm still eager to learn!
          </p>
          <p>
            I do have a degree in computer science, but almost everything I know
            about modern software development today is self-taught.
          </p>
          <h3>Learning in Public</h3>
          <p>
            It's amazing that there's always something new to learn in software
            development. As a curious and open-minded person, this never-ending
            stream of new things to learn keeps me interested. I regularly write
            about my experiences and what I have learned on my blog and on
            Twitter.
          </p>
          <p>
            When you're accountable to those you're teaching, you have to really
            understand the topic you're talking about. One of the best things
            that help me learn is to commit myself to sharing what I know with
            others. I enjoy sharing my knowledge and helping others, and often
            enough I've received great feedback and learned a lot myself.
          </p>
        </article>
        <article class={styles.image}>
          <h3>In my spare time</h3>
          <img src={timeout} />
          <p>
            I live and work in Paderborn, where I organize the local JavaScript
            Meetup. When not dabbling with web and cloud technology, I enjoy
            playing video games. Lately, I played a lot of Path of Exile and
            various other action adventures, RPGs and ARPGs.
          </p>
          <p>
            I like to read fantasy, thriller, non-fiction and comics, I like to
            cook and watching a TV series or my favorite YouTube channels helps
            me unwind. I like craft beer and traveling and I've spent most of my
            adult life trying to get into a regular exercising habit.
          </p>
        </article>
        <article class={styles.cols}>
          <div>
            <h3>My current job</h3>
            <p>
              In recent years I have worked in different areas of business and
              different companies - from classic agency business to B2C
              e-commerce and B2B Software as a Service and from small startups
              to large enterprises.
            </p>
            <p>
              I my current position at <a href="">dSPACE</a>, I support several
              hundred software developers with web technologies and cloud
              architecture as a Lead Software Architect. In addition to the
              design of scalable software systems and the continuous improvement
              of processes, my focus is on multiplier effects like knowledge
              transfer and lateral management.
            </p>
          </div>
          <div>
            <h3>Leadership principles</h3>
            <p>
              I particularly enjoy working with people who think about
              simplifying agile processes, increasing developer and team
              autonomy and the ethical implications of their products. I am
              committed to a positive error culture, because dealing with errors
              constructively is crucial to success.
            </p>
            <p>
              I’m not someone to mince matters and like less of quite a few
              things some might think of as essential - like features, corporate
              structure, processes, meetings and abstractions. I prefer simple
              solutions to actual problems based on real customer experience.
            </p>
          </div>
        </article>
        <article class={styles.image}>
          <h3>Open Source & Workshops</h3>
          <img src={coding} />
          <p>
            I regularly work on side projects &ndash; most of which are open
            source. My latest project is Wilson, a static site generator that's
            awesome for developer blogs and software documentation. It generates
            markdown-based static sites that are heavily optimized for
            performance while still retaining single page application benefits.
            This site is made with Wilson and has best in class syntax
            highlighting, awesome opengraph image generation and all other
            benefits of a Wilson site.
          </p>
          <p>
            As a certified expert, I hold workshops on various topics of modern
            web development like web security. If you want me to speak at a
            conference or usergroup, or you need a tailor-made workshop for your
            team or company, just talk to me!
          </p>
        </article>
      </section>
    </>
  )
}
