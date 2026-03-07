# Quartz Bluesky Comments


## Installation

- Place the contents of `src` into the root of your project (which should have the `quartz` folder).
- edit `quartz\components\index.ts` to include the component

```ts
...
import CommentsBsky from "./CommentsBsky"

...

export {
...
  CommentsBsky,
}
```

- edit `quartz\styles\custom.scss` to include the style:

```scss
...
@use "./../components/styles/blueskycomments.scss";
```


-  in `quartz.layout.ts` modify your `afterBody` to add the component:

```ts
  afterBody: [    
    Component.CommentsBsky({
      author: "YOUR BLUESKY HANDLE",
    }),],
```

- 

