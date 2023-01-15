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
