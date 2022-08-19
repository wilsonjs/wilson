---
title: Evaluation order of field initializers in JavaScript and TypeScript
date: 2021-06-14
layout: markdown
draft: false
description: This article introduces you to my latest side project and describes a problem that I encountered because I did not understand the sequence between initializing class fields and calling a parent constructor. It then continues to explain how class fields are initialized in javascript and typescript and how I solved my initial problem.
taxonomies:
  categories:
    - writing
  topics:
    - JavaScript
    - TypeScript
---

![Clouds](./In7RdU6QY2M.jpg 'Photo by Ales Krivec on Unsplash')

In the last few weeks I've started working on a new side project called [Wilson](https://github.com/wilsonjs/wilson). Wilson is an opinionated static site generator that is optimized for performance and has a small but well-chosen feature set that lends itself perfectly to build coding blogs and documentation sites.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 932.96 254.05" style="width:300px;max-width:60vw;margin:1.5rem auto;display:block;">
  <defs>
    <style>.w{fill:currentColor;}.cls-1{fill:url(#linear-gradient);}.cls-2{fill:url(#radial-gradient);}</style>
    <linearGradient id="linear-gradient" x1="110.52" y1="254.05" x2="110.52" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#be1e2d"/><stop offset="1" stop-color="#f15a29"/></linearGradient>
    <radialGradient id="radial-gradient" cx="86.49" cy="364.3" r="341.72" gradientUnits="userSpaceOnUse"><stop offset="0.32" stop-color="#cb612f"/><stop offset="0.8" stop-color="#f4ed62"/></radialGradient>
  </defs>
  <path class="w" d="M457,96.84,412.82,211.61h-4L366.64,103.06l-42.4,108.55h-3.78L276.28,96.84h4.44l41.52,109.45L364.42,96.84h4.22l42.18,109.45L452.33,96.84Z" transform="translate(0 0)"/>
  <path class="w" d="M483.3,63.32a5.7,5.7,0,0,1-1.67-4,5.7,5.7,0,0,1,5.78-5.77,5.7,5.7,0,0,1,4,1.67,5.42,5.42,0,0,1,1.78,4.1,6.11,6.11,0,0,1-5.77,5.78A5.39,5.39,0,0,1,483.3,63.32Zm1.89,33.52h4.44V211.61h-4.44Z" transform="translate(0 0)"/>
  <path class="w" d="M540.69,46.89h4.44V211.61h-4.44Z" transform="translate(0 0)"/>
  <path class="w" d="M596.63,207.84q-12.21-4.44-18.87-11.32l2.66-3.55q6.66,6.43,17.87,10.76a66.87,66.87,0,0,0,24.31,4.33q19.54,0,28.86-6.77t9.33-18.76q0-8.66-5-13.65a30.08,30.08,0,0,0-12.21-7.33,178,178,0,0,0-19.87-4.77,161.71,161.71,0,0,1-21.86-5.22,32.7,32.7,0,0,1-14-8.88q-5.65-6.09-5.66-17,0-12.44,10.32-21t30.31-8.54a71.39,71.39,0,0,1,21.09,3.21q10.43,3.23,16.87,8.55l-2.67,3.55a47.9,47.9,0,0,0-16-8.21,65.07,65.07,0,0,0-19.31-2.89q-18,0-27,7a22.1,22.1,0,0,0-9,18.31q0,9.11,5.11,14.32a30.48,30.48,0,0,0,12.65,7.66,156.34,156.34,0,0,0,20,4.66,182.12,182.12,0,0,1,21.54,5.33,32.46,32.46,0,0,1,13.54,8.55q5.55,5.88,5.55,16.31a25.66,25.66,0,0,1-10.88,21.65q-10.87,8.1-31.75,8.1A75.42,75.42,0,0,1,596.63,207.84Z" transform="translate(0 0)"/>
  <path class="w" d="M712.62,204.84a52.22,52.22,0,0,1-20-20.75,61.79,61.79,0,0,1-7.22-30,61.17,61.17,0,0,1,7.22-29.86,52.48,52.48,0,0,1,20-20.65,58.49,58.49,0,0,1,57.06,0,52.57,52.57,0,0,1,20,20.65,61.27,61.27,0,0,1,7.21,29.86,61.9,61.9,0,0,1-7.21,30,52.31,52.31,0,0,1-20,20.75,58.42,58.42,0,0,1-57.06,0Zm54.73-3.66A48.44,48.44,0,0,0,785.77,182a57.66,57.66,0,0,0,6.66-27.86,57.63,57.63,0,0,0-6.66-27.86,47.73,47.73,0,0,0-18.42-19.1,54.06,54.06,0,0,0-52.39,0,47.69,47.69,0,0,0-18.43,19.1,57.63,57.63,0,0,0-6.66,27.86A57.66,57.66,0,0,0,696.53,182,48.4,48.4,0,0,0,715,201.18a53.31,53.31,0,0,0,52.39,0Z" transform="translate(0 0)"/>
  <path class="w" d="M920.75,108.5q12.19,12.31,12.21,35.41v67.7h-4.44v-67.7q0-21.09-10.77-32.31t-30.53-11.21q-22.43,0-35.4,13.43t-13,35.41v62.38h-4.44V96.84h4.44v30.64a45.59,45.59,0,0,1,17.76-23Q869,96.18,887,96.18,908.54,96.18,920.75,108.5Z" transform="translate(0 0)"/>
  <path class="cls-1" d="M213.19,124.63A87,87,0,0,1,221,101.1a65.35,65.35,0,0,0-10.78,10.13,64.57,64.57,0,0,0-6.94,9.94,98.19,98.19,0,0,1-6.46-10.27,102.65,102.65,0,0,1-12.09-44.1,41.42,41.42,0,0,1-11.39,23.54,41,41,0,0,1-18.78,10.82C156.25,96.36,165.51,68,148,39,129.33,8.17,95.36,1,90.29,0a61.79,61.79,0,0,1,3.92,27.64c-2.48,27-22.62,42.89-26.74,46q-2.3-6.87-4.58-13.72c-8.52,5-30.44,19.6-42.47,48a100.61,100.61,0,0,0-7.84,41.5,27.05,27.05,0,0,1-9.48-16C.35,144.53-2.9,165,4.74,187.69c14.31,42.49,55.81,59.85,74.5,65.65a69.79,69.79,0,0,0,20.4-49.24,3.7,3.7,0,0,0-1.76-2c-6-4-11.7-6.4-15.15-10.15a9.49,9.49,0,0,1-1.68-2.5,9.19,9.19,0,0,1-.81-3.45,72.48,72.48,0,0,1,.45-8.29,73.71,73.71,0,0,1,3.45-15.52,34.1,34.1,0,0,0-1.4-6.58A33.63,33.63,0,0,0,77.87,146a36.76,36.76,0,0,1,21,9,32.54,32.54,0,0,1,25.62-3.84,28.71,28.71,0,0,0,10.63-7.08,28.41,28.41,0,0,0,4.62-6.53,23.83,23.83,0,0,1,3.11,4.67c4.29,8.49,2.24,17.23,1.26,20.54,1.21,2.51,2.42,5.11,3.6,7.82.82,1.86,1.59,3.7,2.32,5.5a8.44,8.44,0,0,1,.19,3c-.54,4.53-4.84,6.86-8.45,10-1.21,1-7.66,6.55-10,14s.22,14.8,1.34,17.94a28.68,28.68,0,0,0,1.77,4c2.65,4.89,4.84,8.24,5.43,9.1,1.95,2.85,3.45,8.31,1.33,19.84a107.5,107.5,0,0,0,32.42-15c6.25-4.28,42-28.83,43.57-63.84C218.49,156.69,209,148.21,213.19,124.63Z" transform="translate(0 0)"/>
  <path class="cls-2" d="M184,186.14a16.24,16.24,0,0,1-4,2.9c4.81-17.38,3.28-30,.77-38.51-2.83-9.64-8-17.75-7.08-30.58a46.06,46.06,0,0,1,3.79-15.15c-1.9,2.3-9,10.38-20.89,12C141,119,130,108.37,128.13,106.57c-15.62-15.09-12.32-39.84-9.62-46.74.35-.9,3.56-8.84,3.12-9h0A402.63,402.63,0,0,0,87.28,91.68C81.67,99.34,76.57,106.86,72,114.16a15,15,0,0,1-3.28-2.51,14.68,14.68,0,0,1-2.73-3.85A80.49,80.49,0,0,0,38.71,152a79.62,79.62,0,0,0,2.64,43.17,28.57,28.57,0,0,1-5-2.14,29.3,29.3,0,0,1-5.7-4c5.91,28.87,26.35,51.53,51.94,60.76A69.72,69.72,0,0,0,99.64,204.1a3.7,3.7,0,0,0-1.76-2c-6-4-11.7-6.4-15.15-10.15a9.49,9.49,0,0,1-1.68-2.5,9.19,9.19,0,0,1-.81-3.45,72.48,72.48,0,0,1,.45-8.29,73.71,73.71,0,0,1,3.45-15.52,34.1,34.1,0,0,0-1.4-6.58A33.63,33.63,0,0,0,77.87,146a36.76,36.76,0,0,1,21,9,32.54,32.54,0,0,1,25.62-3.84,28.71,28.71,0,0,0,10.63-7.08,28.41,28.41,0,0,0,4.62-6.53,23.83,23.83,0,0,1,3.11,4.67c4.29,8.49,2.24,17.23,1.26,20.54,1.21,2.51,2.42,5.11,3.6,7.82.82,1.86,1.59,3.7,2.32,5.5a8.44,8.44,0,0,1,.19,3c-.54,4.53-4.84,6.86-8.45,10-1.21,1-7.66,6.55-10,14s.22,14.8,1.34,17.94a28.68,28.68,0,0,0,1.77,4c2.65,4.89,4.84,8.24,5.43,9.1,1.42,2.07,2.6,5.52,2.33,11.68a82.62,82.62,0,0,0,44.45-64.1A16.35,16.35,0,0,1,184,186.14Z" transform="translate(0 0)"/>
</svg>

I have chosen [Preact](https://preactjs.com/), [Vite](https://vitejs.dev/), [Unified](https://unifiedjs.com/) and [TypeScript](https://www.typescriptlang.org/) as the technical basis for Wilson and I am slowly making progress.

## Page sources and pages in Wilson

Wilson generates static pages from a number of source files, so-called page sources. There are different types of page sources, some of which generate exactly one page, some of which generate multiple.

Since the different types of page sources share some basic functionality, I decided to implement them as part of a class hierarchy. The base class for this is the `PageSource` class, shown in abbreviated form:

```typescript {numberLines}
abstract class PageSource {
  public transformedCode: string | null

  constructor(
    private path: string,
    private fullPath: string,
  ) {
    this.transformedCode = this.transformCode(
      readFileSync(this.fullPath, 'utf-8'),
    )
  }

  protected transformCode(originalSource: string): string {
    return originalSource
  }
}
```

As you can see, page sources have a `path`, a `fullPath` and a `transformedCode` field. Not all page sources need a transformation of their source code, which is why the default implementation on the base class just returns the original source without doing any transformations.

The most important type of page source is _"content"_. A page source of this type leads to exactly one static HTML page being generated as build output. Content page sources can either be created in Markdown or in TypeScript and are represented by instances of the `ContentPageSource` class, also shown in abbreviated form:

```typescript {numberLines}
class ContentPageSource extends PageSource {
  public frontmatter: ContentFrontmatterWithDefaults

  constructor(
    path: string,
    fullPath: string,
    frontmatter: FrontmatterWithDefaults,
  ) {
    super(path, fullPath)
    this.frontmatter =
      frontmatter as ContentFrontmatterWithDefaults
  }
}
```

All types of page sources have one thing in common: You can use so-called _"frontmatter"_ to specify meta data such as a title or a publication date in addition to the actual content. Depending on the type of page source, different frontmatter information is allowed, which is parsed from the source code and stored in the `frontmatter` field. For `ContentPageSource`, this is the only difference to the abstract base class.

### Markdown page sources

For page sources that are written in Markdown, this is different. The Markdown code has to be parsed and converted into a Preact component. Markdown page sources are represented by instances of the `MarkdownPageSource` class, which looks like this:

```typescript {numberLines}
class MarkdownPageSource extends ContentPageSource {
  public headings: Heading[] = []

  protected transformCode(originalSource: string): string {
    return transformJsx(
      this.transformMarkdown(originalSource),
    )
  }

  private transformMarkdown(
    markdownSource: string,
  ): string {
    // strip frontmatter from Markdown source
    // parse remaining Markdown into AST
    // convert Markdown AST into HTML AST
    // find all headings in HTML AST
    this.headings = headingsFromAST
    // stringify HTML AST to HTML source
    // embed HTML source into a Preact component template
    // return Preact component string with included HTML
  }
}
```

The headings and sub-headings of all markdown content sources are parsed and stored for later us. For example, they are injected as `props` into page layouts so that a table of contents or similar things can be implemented on the basis of this data.

However, my implementation had a problem. Headings were parsed and set, but upon inspection the `headings` field on a `MarkdownPageSource` was always empty.

## Class field initialization order

Put simply, I was faced with the following problem, which I also [addressed on Twitter](https://twitter.com/code_punkt/status/1394542799727497216) because I wasn't sure what was happening. Apparently, I wasn't [the only one](https://twitter.com/chaos_monster/status/1394548966868586497) who found this confusing.

```typescript {numberLines}
abstract class Base {
  constructor() {
    this.setHeadings()
  }
  protected setHeadings(): void {}
}

class Extended extends Base {
  public headings: string[] = []
  protected setHeadings(): void {
    this.headings = ['foo', 'bar']
  }
}

const instance = new Extended()

// logs [], expected ['foo', 'bar']
console.log(instance.headings)
```

If you play around with the [corresponding example](https://www.typescriptlang.org/play?#code/IYIwzgLgTsDGEAJYBthjAgQmgpgg3gFAJID2AdpFAK7ylQAUAlAcSQhABYCWYAdGBwQAEjmAATbuQDmYZmwC+bAA5RSEHPBziEgkWMky5TAFwIAbqW478SpYRRoMAUQAeG8uO0Ic7nJ4xsQVYSZWoQZG5YBE4DKVkzKniAbQBdBABeBDSVNQ0tHT1RCXjjM0trEPYuXj5YkqNM7IByADNSUmaAGgRmkGAoZtTFQntYCkgEKUhgclg8LPIcAHcENw8vcXlCAHodhGRSBOzUnt9lTQ1xM2S2ju7e-sHh8cpSZBw+Q+kGaYhZ+Z1OJGJhAA) in the TypeScript playground, you will see that the `setHeadings` method is called and the `headings` field is set accordingly. The compiled JavaScript source shows the order in which the parent constructor and the initialization of the class field are executed. On creation of a new `Extended` instance

- The `Extended` constructor is called
  - The `Base` constructor is called
    - `setHeadings` is invoked and sets `this.headings`
  - `this.headings` is initialized to an empty array

This initialization order was not clear to me. Instead, I tried to implement a constructor myself, which swaps the order of calling the parent constructor and initializing `headings` to `[]`:

```typescript {numberLines}
class Extended extends Base {
  public headings: string[]

  constructor() {
    this.headings = []
    super()
  }

  protected setHeadings(): void {
    this.headings = ['foo', 'bar']
  }
}
```

Turns out it doesn't work that way. If you take a look at the [corresponding example](https://www.typescriptlang.org/play?#code/IYIwzgLgTsDGEAJYBthjAgQmgpgg3gFAJID2AdpFAK7ylQAUAlAcSQhABYCWYAdGBwQAEjmAATbuQDmYZmwC+bNgAcopCDng5xCQSLGSZcpgC4EAN1Ldd+JUsIo0GAKIAPTeXE6EODzi8MbEFWEhVqEGRuWAROQylZcyoEgG0AXUI2WAoqWgh6ZlD2Ll4+OIkEjABeBHS2EjBqFRxGJkVMsPVNbV19UQrjZnMrGyKSEv5yo1kEGpSAcgAzUlJ5gBoEeZBgKHmMknsgA) in the TypeScript playground, it will show you a TypeScript error message: _"super must be called before accessing this in the constructor of a derived class"_. I rarely use classes in TypeScript and wasn't aware of this. The [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/2/classes.html#super-calls) says:

> Just as in JavaScript, if you have a base class, you’ll need to call `super()` in your constructor body before using any `this.` members

The corresponding rules for classes from chapters [8.1.1.3.4](http://www.ecma-international.org/ecma-262/6.0/#sec-function-environment-records-getthisbinding) and [9.2.2](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-construct-argumentslist-newtarget) of the EcmaScript specification can be summarized as follows

- In a child class constructor, `this` cannot be used until `super` is called
- class constructors MUST call `super` if they are subclasses, or they must explicitly return some object to take the place of the one that was not initialized

### Class fields proposal for JavaScript

Since the EcmaScript standard defines that `this` can only be used in a child class constructor after `super` has been called, this is obviously not a pure TypeScript problem. The following source code in JavaScript can be executed in most of today's runtime environments, but is invalid in terms of the current EcmaScript 2021 standard.

```javascript {numberLines}
class Base {
  constructor() {
    this.setHeadings()
  }
  setHeadings() {}
}

class Extended extends Base {
  headings = []
  setHeadings() {
    this.headings = ['foo', 'bar']
  }
}

const instance = new Extended()
console.log(instance.headings)
```

Since class fields are currently not part of the EcmaScript language standard, the order between the `super` call in an implicit constructor and the initialization of class fields of the child class is defined in the corresponding [class fields](https://github.com/tc39/proposal-class-fields#execution-of-initializer-expressions) propsal:

> When field initializers are evaluated and fields are added to instances:
>
> - **Base class:** At the beginning of the constructor execution, even before parameter destructuring.
> - **Derived class:** Right after `super()` returns. […]

## My solution

To deal with this initialization order, I added an `initialize` method to the abstract base class, which is supposed to be called after instantiating a `PageSource` and takes care of the transformation of the source code.

```typescript {numberLines}
abstract class PageSource {
  public transformedCode: string | null = null

  constructor(
    private path: string,
    private fullPath: string,
  ) {}

  public initialize(): void {
    this.transformedCode = this.transformCode(
      readFileSync(this.fullPath, 'utf-8'),
    )
  }

  protected transformCode(originalSource: string): string {
    return originalSource
  }
}
```

In Wilson, the `PageSource` class and subclasses are not exported directly. To create an instance of a page source a factory method called `createPageSource` is used. Therefore, it was comparatively easy for me to call `initialize` on the instances before returning them from the factory.

```typescript {numberLines}
export const createPageSource = (
  path: string,
  fullPath: string,
  fm: FrontmatterWithDefaults,
): PageSourceType => {
  const constructorArgs: Parameters<
    typeof createPageSource
  > = [path, fullPath, frontmatter]

  let pageSource: PageSourceType

  switch (frontmatter.type) {
    case 'content':
      pageSource =
        extname(fullPath) === '.md'
          ? new MarkdownPageSource(...constructorArgs)
          : new ContentPageSource(...constructorArgs)
      break
    // cases handling other page types
  }

  pageSource.initialize()
  return pageSource
}
```

I'm neither convinced that this is a very elegant solution, nor did I think about alternatives much. It solved my problem and I've got some bigger fish to fry with [Wilson](https://github.com/wilsonjs/wilson).

How would you deal with this? Contact me [on Twitter](https://twitter.com/code_punkt) if you have alternative suggestions!
