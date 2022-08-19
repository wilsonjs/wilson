import { StaticPageProps, UserFrontmatter } from 'wilson'
import styles from './about.module.scss'
import me from '../assets/photos/me.jpg'
import coding from '../assets/photos/coding.jpg'
import timeout from '../assets/photos/timeout.jpg'

export const frontmatter: UserFrontmatter = {
  title: 'Über mich',
}

export default function AboutPage(props: StaticPageProps) {
  return (
    <>
      <h1>{props.frontmatter.title}</h1>
      <section class={styles.tldr}>
        <h2>Kurzfassung</h2>
        <img src={me} alt="Portrait photo of Christoph Werner" />
        <p>
          Hi, ich bin Christoph! Ich lebe mit meiner Familie in Paderborn und
          helfe Teams in der Software-Entwicklung dabei, in kürzerer Zeit
          bessere Produkte zu entwickeln &ndash; aktuell bin ich leitender
          Software-Architekt bei <a href="">dSPACE</a>.
        </p>
        <p>
          Ich arbeite viel an Open Source Software, mein aktuelles Projekt ist{' '}
          <a href="">Wilson</a>. Ich schreibe über meine Projekte und alles, was
          ich lerne, auf meinem <a href="">Blog</a> und auf{' '}
          <a href="">Twitter</a> und biete Experten-Workshops zu verschiedenen
          Themen wie Web-Security an.
        </p>
      </section>
      <section class={styles.long}>
        <article class={styles.cols}>
          <h3>Faszination Internet</h3>
          <p>
            Das Internet und das World Wide Web faszinieren mich seit meiner
            Jugend. Das Web ist seit 1996 meine Spielwiese. Ich finde es
            großartig, dass es diese Technologien Menschen auf der ganzen Welt
            erlauben, miteinander zu kommunizieren und voneinander zu lernen.
          </p>
          <p>
            Ich bin Diplom-Informatiker, habe mir aber fast alles, was ich heute
            über moderne Software-Entwicklung weiss, selbst beigebracht.
            Inzwischen habe ich mehr als 20 Jahre Erfahrung in der
            Frontend-Entwicklung und mit serverseitigen APIs und mehr als 10
            Jahre Erfahrung mit Pipeline-Automatisierung und
            Cloud-Infrastruktur.
          </p>
          <h3>Kontinuierliches Lernen</h3>
          <p>
            Als neugieriger und aufgeschlossener Mensch finde ich es toll, dass
            es in der Software-Entwicklung immer etwas Neues zu Lernen gibt. Auf
            meinem <a href="">Blog</a> und auf <a href="">Twitter</a> schreibe
            ich regelmäßig über meine Erfahrungen und das, was ich gelernt habe.
          </p>
          <p>
            Es macht mir Spaß, mein Wissen zu teilen und anderen zu helfen
            &ndash; nicht selten lerne ich durch interessantes Feedback selbst
            noch einiges dazu. Ich habe die Erfahrung gemacht, dass man erst
            dann wirklich merkt, wie gut man ein Thema verstanden hat, wenn man
            es anderen beibringt.
          </p>
        </article>
        <article class={styles.image}>
          <h3>In meiner Freizeit</h3>
          <img src={timeout} />
          <p>
            Ich lebe und arbeite in Paderborn, wo ich das örtliche JavaScript
            Meetup organisiere. Wenn ich mich nicht mit Software-Entwicklung
            beschäftige, spiele ich gerne Videospiele - in letzter Zeit viel
            Path of Exile und verschiedene weitere Action Adventures, RPGs und
            ARPGs.
          </p>
          <p>
            Ich lese gerne Fantasy, Thriller, Sachbücher und Comics, koche gern
            und kann gut auf dem Sofa bei einer Serie oder meinen Lieblings
            Youtube-Kanälen abschalten. Ich mag Craft-Beer, reise gerne und
            versuche seit langem vergeblich, regelmäßig Sport zu treiben.
          </p>
        </article>
        <article class={styles.cols}>
          <div>
            <h3>Mein aktueller Job</h3>
            <p>
              In den letzten Jahren habe ich in verschiedenen Geschäftsfeldern
              und Unternehmen gearbeitet - von der klassischen Agentur über B2C
              E-Commerce bis hin zu B2B SaaS und vom kleinen Startup bis hin zum
              Großunternehmen.
            </p>
            <p>
              Aktuell bin ich leitender Software-Architekt bei{' '}
              <a href="">dSPACE</a>, wo ich einige hundert Software-Entwickler
              mit Web-Technologien und Cloud-Architektur unterstütze. Neben dem
              Entwurf skalierbarer Software-Architekturen und der
              kontinuierlichen Verbesserung der Prozesse stehen dabei
              Multiplikator-Funktionen wie der Wissenstransfer und die laterale
              Führung der Entwickler im Vordergrund.
            </p>
          </div>
          <div>
            <h3>Führungsprinzipien</h3>
            <p>
              Mit Menschen, die über die Vereinfachung agiler Prozesse,
              Entwickler- und Teamautonomie und die ethischen Implikationen
              ihrer Produkte nachdenken, arbeite ich besonders gerne zusammen.
              Ich setze mich für eine positive Fehlerkultur ein, denn ein
              konstruktiver Umgang mit Fehlern ist maßgeblich für den Erfolg.
            </p>
            <p>
              Ich bin niemand, der Dinge beschönigt und mag wertschätzende, aber
              direkte Kommunikation. Ich bevorzuge einfache Lösungen für
              konkrete Kundenprobleme. Im Hinblick auf Unternehmenspolitik,
              Prozesse, Meetings und insbesondere Features denke ich, dass
              weniger mehr ist.
            </p>
          </div>
        </article>
        <article class={styles.image}>
          <h3>Open Source & Workshops</h3>
          <img src={coding} />
          <p>
            Neben meinem Job arbeite ich regelmäßig an verschiedenen
            Side-Projects &ndash; die meisten davon sind Open Source. Mein
            neustes Projekt ist <a href="">Wilson</a>, ein Static-Site-Generator
            der sich hervorragend für Entwickler-Blogs und
            Software-Dokumentation eignet. Wilson erzeugt performance-optimierte
            statische Websites, die alle Vorteile von Single Page Applications
            beibehalten. Diese Website wurde mit Wilson erstellt und nutzt neben
            dem großartigen Syntax-Highlighting die automatisierten Erzeugung
            von Opengraph Bildern und alle weiteren Vorteile von Wilson.
          </p>
          <p>
            Als zertifizierter Experte halte ich Workshops zu verschieden Themen
            der modernen Web-Entwicklung, z.B. Web-Security. Wenn ich auf einer
            Konferenz oder Usergroup sprechen soll oder du einen
            maßgeschneiderten Workshop für dein Team oder Unternehmen benötigst,
            sprich mich einfach an!
          </p>
        </article>
      </section>
    </>
  )
}
